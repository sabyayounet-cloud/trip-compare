"""
Search API endpoints - Real Travelpayouts Integration

Generates affiliate search URLs and fetches real flight/hotel data
from Travelpayouts API using token: fa478c260b19fb84ecba1b41be11cde1
"""
from fastapi import APIRouter, Depends, Request, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import date
from urllib.parse import urlencode
import httpx

from ..database import get_db
from ..config import get_settings
from .. import crud, schemas

router = APIRouter(prefix="/search", tags=["Search"])
settings = get_settings()


# =============================================================================
# TRAVELPAYOUTS API CONFIGURATION
# =============================================================================

# Your API Token (from .env file)
TRAVELPAYOUTS_TOKEN = settings.TRAVELPAYOUTS_TOKEN
TRAVELPAYOUTS_MARKER = settings.TRAVELPAYOUTS_MARKER or "tripcompare"

# API Base URLs
FLIGHT_API_V1 = "https://api.travelpayouts.com/v1"
FLIGHT_API_V2 = "https://api.travelpayouts.com/v2"
AVIASALES_API_V3 = "https://api.travelpayouts.com/aviasales/v3"
HOTEL_API = "https://engine.hotellook.com/api/v2"

# Affiliate Booking URLs
AVIASALES_SEARCH = "https://www.aviasales.com/search"
HOTELLOOK_SEARCH = "https://search.hotellook.com"


# =============================================================================
# FLIGHT SEARCH ENDPOINTS
# =============================================================================

@router.post("/flights", response_model=schemas.SearchResponse)
async def search_flights(
    search: schemas.FlightSearchRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Search flights and generate Travelpayouts/Aviasales affiliate link.

    Uses your Travelpayouts token to generate tracked booking links.
    When users book through these links, you earn commission!
    """
    # Log the search for analytics
    crud.create_search_log(
        db,
        search_type="flight",
        origin=search.origin,
        destination=search.destination,
        check_in=search.departure_date,
        check_out=search.return_date,
        travelers=search.travelers,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        session_id=request.cookies.get("session_id")
    )

    # Generate Aviasales affiliate search URL
    origin = search.origin.upper()[:3]
    destination = search.destination.upper()[:3]
    depart_str = search.departure_date.strftime("%d%m")  # DDMM format

    # Build search string for Aviasales
    # Format: ORIGINDEST_DDMM_DDMM_adults
    if search.return_date:
        return_str = search.return_date.strftime("%d%m")
        search_path = f"{origin}{depart_str}{destination}{return_str}{search.travelers}"
    else:
        search_path = f"{origin}{depart_str}{destination}{search.travelers}"

    # Add affiliate marker for commission tracking
    params = {
        "marker": TRAVELPAYOUTS_MARKER,
    }

    search_url = f"{AVIASALES_SEARCH}/{search_path}?{urlencode(params)}"

    return schemas.SearchResponse(
        search_url=search_url,
        affiliate_provider="aviasales",
        parameters={
            "origin": search.origin,
            "destination": search.destination,
            "departure_date": str(search.departure_date),
            "return_date": str(search.return_date) if search.return_date else None,
            "travelers": search.travelers,
            "cabin_class": search.cabin_class,
            "marker": TRAVELPAYOUTS_MARKER
        }
    )


@router.get("/flights/prices")
async def get_flight_prices(
    origin: str = Query(..., min_length=3, max_length=3, description="Origin IATA code (e.g., LON, PAR)"),
    destination: str = Query(..., min_length=3, max_length=3, description="Destination IATA code (e.g., BCN, ROM)"),
    depart_date: Optional[str] = Query(None, description="Departure month YYYY-MM"),
    return_date: Optional[str] = Query(None, description="Return month YYYY-MM"),
    currency: str = Query("EUR", description="Currency code"),
    direct: bool = Query(False, description="Direct flights only"),
):
    """
    Get real flight prices from Travelpayouts API.

    Returns cheapest prices for the route with booking links.

    Example: /search/flights/prices?origin=LON&destination=BCN&currency=EUR
    """
    if not TRAVELPAYOUTS_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Travelpayouts API not configured. Add TRAVELPAYOUTS_TOKEN to .env"
        )

    # Build API request
    endpoint = f"{FLIGHT_API_V1}/prices/direct" if direct else f"{FLIGHT_API_V1}/prices/cheap"

    params = {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "currency": currency,
        "token": TRAVELPAYOUTS_TOKEN,
    }

    if depart_date:
        params["depart_date"] = depart_date
    if return_date:
        params["return_date"] = return_date

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(endpoint, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()

            # Add affiliate booking links to each result
            if data.get("success") and data.get("data"):
                enriched_data = {}
                for dest_code, flights in data["data"].items():
                    enriched_data[dest_code] = {}
                    for key, flight in flights.items():
                        flight["booking_link"] = _generate_flight_link(
                            origin,
                            dest_code,
                            flight.get("departure_at", ""),
                            flight.get("return_at", "")
                        )
                        enriched_data[dest_code][key] = flight
                data["data"] = enriched_data

            return data

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Travelpayouts API error: {e}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to connect to Travelpayouts: {e}")


@router.get("/flights/calendar")
async def get_flight_calendar(
    origin: str = Query(..., min_length=3, max_length=3),
    destination: str = Query(..., min_length=3, max_length=3),
    depart_date: str = Query(..., description="Start date YYYY-MM-DD"),
    currency: str = Query("EUR"),
):
    """
    Get flight prices for an entire month (calendar view).

    Perfect for "cheapest day to fly" features.

    Example: /search/flights/calendar?origin=LON&destination=BCN&depart_date=2025-06-01
    """
    if not TRAVELPAYOUTS_TOKEN:
        raise HTTPException(status_code=500, detail="Travelpayouts API not configured")

    params = {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "depart_date": depart_date,
        "currency": currency,
        "token": TRAVELPAYOUTS_TOKEN,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FLIGHT_API_V1}/prices/calendar",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Calendar API error: {str(e)}")


@router.get("/flights/popular")
async def get_popular_destinations(
    origin: str = Query(..., min_length=3, max_length=3, description="Origin IATA code"),
    currency: str = Query("EUR"),
):
    """
    Get popular destinations from an origin city.

    Great for "Where to fly from London?" features.

    Example: /search/flights/popular?origin=LON
    """
    if not TRAVELPAYOUTS_TOKEN:
        raise HTTPException(status_code=500, detail="Travelpayouts API not configured")

    params = {
        "origin": origin.upper(),
        "currency": currency,
        "token": TRAVELPAYOUTS_TOKEN,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FLIGHT_API_V1}/city-directions",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()

            # Transform data for frontend consumption
            destinations = []
            if data.get("success") and data.get("data"):
                for dest_code, info in data["data"].items():
                    destinations.append({
                        "origin": origin.upper(),
                        "destination": dest_code,
                        "price": info.get("price", 0),
                        "transfers": info.get("transfers", 1),
                        "airline": info.get("airline", None),
                        "departure_at": info.get("departure_at", ""),
                        "return_at": info.get("return_at", ""),
                        "search_link": f"{AVIASALES_SEARCH}/{origin.upper()}{dest_code}1?marker={TRAVELPAYOUTS_MARKER}"
                    })

            # Sort by price
            destinations.sort(key=lambda x: x.get("price", float('inf')))

            return {
                "success": True,
                "origin": origin.upper(),
                "destinations": destinations,
                "count": len(destinations)
            }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Popular destinations API error: {str(e)}")


@router.get("/flights/latest")
async def get_latest_prices(
    origin: str = Query(..., min_length=3, max_length=3),
    destination: str = Query(..., min_length=3, max_length=3),
    currency: str = Query("EUR"),
    limit: int = Query(30, ge=1, le=100),
    one_way: bool = Query(False),
):
    """
    Get latest/freshest flight prices (v3 API).

    Returns the most recent price data.
    """
    if not TRAVELPAYOUTS_TOKEN:
        raise HTTPException(status_code=500, detail="Travelpayouts API not configured")

    params = {
        "origin": origin.upper(),
        "destination": destination.upper(),
        "currency": currency,
        "limit": limit,
        "one_way": str(one_way).lower(),
        "token": TRAVELPAYOUTS_TOKEN,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AVIASALES_API_V3}/prices_for_dates",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()

            # Add booking links
            if data.get("success") and data.get("data"):
                for flight in data["data"]:
                    flight["booking_link"] = _generate_flight_link(
                        flight.get("origin", origin),
                        flight.get("destination", destination),
                        flight.get("departure_at", ""),
                        flight.get("return_at", "")
                    )

            return data

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Latest prices API error: {str(e)}")


# =============================================================================
# HOTEL SEARCH ENDPOINTS
# =============================================================================

@router.post("/hotels", response_model=schemas.SearchResponse)
async def search_hotels(
    search: schemas.HotelSearchRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Search hotels and generate Hotellook affiliate link.

    Uses Travelpayouts/Hotellook for hotel bookings.
    """
    # Log the search
    crud.create_search_log(
        db,
        search_type="hotel",
        origin=None,
        destination=search.destination,
        check_in=search.check_in,
        check_out=search.check_out,
        travelers=search.guests,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        session_id=request.cookies.get("session_id")
    )

    # Generate Hotellook affiliate search URL
    params = {
        "destination": search.destination,
        "checkIn": str(search.check_in),
        "checkOut": str(search.check_out),
        "adults": search.guests,
        "marker": TRAVELPAYOUTS_MARKER,
    }

    search_url = f"{HOTELLOOK_SEARCH}?{urlencode(params)}"

    return schemas.SearchResponse(
        search_url=search_url,
        affiliate_provider="hotellook",
        parameters={
            "destination": search.destination,
            "check_in": str(search.check_in),
            "check_out": str(search.check_out),
            "guests": search.guests,
            "rooms": search.rooms,
            "marker": TRAVELPAYOUTS_MARKER
        }
    )


@router.get("/hotels/prices")
async def get_hotel_prices(
    location: str = Query(..., description="City name (e.g., Barcelona, Paris)"),
    check_in: date = Query(..., description="Check-in date"),
    check_out: date = Query(..., description="Check-out date"),
    adults: int = Query(2, ge=1, le=6),
    currency: str = Query("EUR"),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get real hotel prices from Hotellook API.

    Returns actual hotel data with prices and booking links.

    Example: /search/hotels/prices?location=Barcelona&check_in=2025-06-01&check_out=2025-06-05
    """
    if not TRAVELPAYOUTS_TOKEN:
        raise HTTPException(status_code=500, detail="Travelpayouts API not configured")

    params = {
        "location": location,
        "checkIn": str(check_in),
        "checkOut": str(check_out),
        "adults": adults,
        "currency": currency,
        "limit": limit,
        "token": TRAVELPAYOUTS_TOKEN,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{HOTEL_API}/cache.json",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            hotels = response.json()

            # Add affiliate booking links
            for hotel in hotels:
                hotel["booking_link"] = _generate_hotel_link(
                    hotel.get("locationId", location),
                    check_in, check_out, adults
                )

            return {
                "success": True,
                "hotels": hotels,
                "count": len(hotels),
                "location": location,
                "check_in": str(check_in),
                "check_out": str(check_out)
            }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Hotel API error: {str(e)}")


@router.get("/hotels/lookup")
async def lookup_hotels(
    query: str = Query(..., min_length=2, description="Search query"),
    lang: str = Query("en", description="Language code"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Autocomplete for hotel/city search.

    Use for search box suggestions.

    Example: /search/hotels/lookup?query=barc
    """
    if not TRAVELPAYOUTS_TOKEN:
        raise HTTPException(status_code=500, detail="Travelpayouts API not configured")

    params = {
        "query": query,
        "lang": lang,
        "limit": limit,
        "token": TRAVELPAYOUTS_TOKEN,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{HOTEL_API}/lookup.json",
                params=params,
                timeout=15.0
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Lookup API error: {str(e)}")


# =============================================================================
# OTHER SEARCH ENDPOINTS
# =============================================================================

@router.get("/experiences", response_model=schemas.SearchResponse)
def search_experiences(
    destination: str = Query(..., min_length=2),
    date: Optional[date] = None,
    category: Optional[str] = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Generate GetYourGuide affiliate link for experiences/tours.
    """
    if request:
        crud.create_search_log(
            db, search_type="experience", origin=None, destination=destination,
            check_in=date, check_out=None, travelers=1,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            session_id=request.cookies.get("session_id")
        )

    base_url = "https://www.getyourguide.com/s/"
    params = {"q": destination}
    if date:
        params["date_from"] = str(date)
    if settings.GETYOURGUIDE_PARTNER_ID:
        params["partner_id"] = settings.GETYOURGUIDE_PARTNER_ID

    return schemas.SearchResponse(
        search_url=f"{base_url}?{urlencode(params)}",
        affiliate_provider="getyourguide",
        parameters={"destination": destination, "date": str(date) if date else None, "category": category}
    )


@router.get("/cars", response_model=schemas.SearchResponse)
def search_car_rentals(
    pickup_location: str = Query(..., min_length=2),
    pickup_date: date = Query(...),
    dropoff_date: date = Query(...),
    pickup_time: str = "10:00",
    dropoff_time: str = "10:00",
    db: Session = Depends(get_db)
):
    """
    Generate car rental affiliate link via RentalCars (Travelpayouts partner).
    """
    base_url = "https://www.rentalcars.com/SearchResults.do"
    params = {
        "country": pickup_location,
        "puDay": pickup_date.day, "puMonth": pickup_date.month, "puYear": pickup_date.year,
        "puHour": pickup_time.split(":")[0], "puMinute": pickup_time.split(":")[1],
        "doDay": dropoff_date.day, "doMonth": dropoff_date.month, "doYear": dropoff_date.year,
        "doHour": dropoff_time.split(":")[0], "doMinute": dropoff_time.split(":")[1],
    }
    if TRAVELPAYOUTS_MARKER:
        params["affiliateCode"] = TRAVELPAYOUTS_MARKER

    return schemas.SearchResponse(
        search_url=f"{base_url}?{urlencode(params)}",
        affiliate_provider="rentalcars",
        parameters={"pickup_location": pickup_location, "pickup_date": str(pickup_date), "dropoff_date": str(dropoff_date)}
    )


@router.post("/packages", response_model=schemas.SearchResponse)
def search_packages(
    origin: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
    departure_date: date = Query(...),
    return_date: date = Query(...),
    travelers: int = Query(2, ge=1, le=9),
    db: Session = Depends(get_db)
):
    """
    Generate vacation package search URL (flight + hotel combined).
    """
    # For packages, redirect to Aviasales with hotel search suggestion
    depart_str = departure_date.strftime("%d%m")
    return_str = return_date.strftime("%d%m")
    search_path = f"{origin.upper()[:3]}{depart_str}{destination.upper()[:3]}{return_str}{travelers}"

    return schemas.SearchResponse(
        search_url=f"{AVIASALES_SEARCH}/{search_path}?marker={TRAVELPAYOUTS_MARKER}",
        affiliate_provider="aviasales",
        parameters={
            "origin": origin, "destination": destination,
            "departure_date": str(departure_date), "return_date": str(return_date),
            "travelers": travelers
        }
    )


# =============================================================================
# WIDGET CONFIGURATION
# =============================================================================

@router.get("/widget/config")
def get_widget_config():
    """
    Get Travelpayouts widget configuration for embedding on your site.

    Returns script URLs and configuration for flight/hotel search widgets.
    """
    return {
        "token_configured": bool(TRAVELPAYOUTS_TOKEN),
        "marker": TRAVELPAYOUTS_MARKER,
        "flight_widget": {
            "script": f"https://tp.media/content?trs={TRAVELPAYOUTS_MARKER}&shmarker={TRAVELPAYOUTS_MARKER}&locale=en_GB&currency=eur&powered_by=true&searchUrl=www.aviasales.com%2Fsearch",
            "container_id": "tp-flight-widget"
        },
        "hotel_widget": {
            "script": f"https://tp.media/content?trs={TRAVELPAYOUTS_MARKER}&shmarker={TRAVELPAYOUTS_MARKER}&locale=en_GB&currency=eur&powered_by=true&searchUrl=search.hotellook.com",
            "container_id": "tp-hotel-widget"
        },
        "documentation": "https://support.travelpayouts.com/hc/en-us/categories/200358578-API"
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _generate_flight_link(origin: str, destination: str, departure_at: str, return_at: str = None) -> str:
    """Generate affiliate flight booking link."""
    try:
        origin = origin.upper()[:3] if origin else ""
        destination = destination.upper()[:3] if destination else ""

        if departure_at and len(departure_at) >= 10:
            dep_str = departure_at[8:10] + departure_at[5:7]  # Convert YYYY-MM-DD to DDMM
        else:
            return ""

        if return_at and len(return_at) >= 10:
            ret_str = return_at[8:10] + return_at[5:7]
            search_path = f"{origin}{dep_str}{destination}{ret_str}1"
        else:
            search_path = f"{origin}{dep_str}{destination}1"

        return f"{AVIASALES_SEARCH}/{search_path}?marker={TRAVELPAYOUTS_MARKER}"
    except Exception:
        return ""


def _generate_hotel_link(location_id: str, check_in: date, check_out: date, adults: int = 2) -> str:
    """Generate affiliate hotel booking link."""
    params = {
        "destination": location_id,
        "checkIn": str(check_in),
        "checkOut": str(check_out),
        "adults": adults,
        "marker": TRAVELPAYOUTS_MARKER,
    }
    return f"{HOTELLOOK_SEARCH}?{urlencode(params)}"
