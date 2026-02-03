"""
Travelpayouts API Client

Handles all integrations with Travelpayouts affiliate network:
- Flight search (Aviasales/Jetradar)
- Hotel search (Hotellook)
- Affiliate link generation

API Documentation: https://support.travelpayouts.com/hc/en-us/categories/200358578-API
"""

import httpx
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from urllib.parse import urlencode
import hashlib
import json

from .config import get_settings

settings = get_settings()


class TravelpayoutsClient:
    """
    Client for Travelpayouts API

    Provides access to:
    - Flight Data API (prices, schedules, airlines)
    - Hotellook API (hotel search, prices)
    - Affiliate link generation
    """

    # API Base URLs
    FLIGHT_API_BASE = "https://api.travelpayouts.com/v1"
    FLIGHT_API_V2 = "https://api.travelpayouts.com/v2"
    HOTEL_API_BASE = "https://engine.hotellook.com/api/v2"
    AVIASALES_API = "https://api.travelpayouts.com/aviasales/v3"

    # Affiliate redirect URLs
    FLIGHT_REDIRECT = "https://www.aviasales.com/search"
    HOTEL_REDIRECT = "https://search.hotellook.com"

    def __init__(self):
        self.token = settings.TRAVELPAYOUTS_TOKEN
        self.marker = settings.TRAVELPAYOUTS_MARKER
        self.host = getattr(settings, 'TRAVELPAYOUTS_HOST', 'https://tripcompare.eu')

        if not self.token:
            raise ValueError("TRAVELPAYOUTS_TOKEN not configured")

    # ==========================================================================
    # FLIGHT APIs
    # ==========================================================================

    async def get_cheapest_flights(
        self,
        origin: str,
        destination: str,
        depart_date: Optional[date] = None,
        return_date: Optional[date] = None,
        currency: str = "EUR",
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get cheapest flight prices for a route.

        Uses: /v1/prices/cheap
        """
        params = {
            "origin": origin.upper(),
            "destination": destination.upper(),
            "currency": currency,
            "token": self.token,
        }

        if depart_date:
            params["depart_date"] = depart_date.strftime("%Y-%m")

        if return_date:
            params["return_date"] = return_date.strftime("%Y-%m")

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.FLIGHT_API_BASE}/prices/cheap",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_direct_flights(
        self,
        origin: str,
        destination: str,
        depart_date: Optional[date] = None,
        return_date: Optional[date] = None,
        currency: str = "EUR"
    ) -> Dict[str, Any]:
        """
        Get direct (non-stop) flight prices.

        Uses: /v1/prices/direct
        """
        params = {
            "origin": origin.upper(),
            "destination": destination.upper(),
            "currency": currency,
            "token": self.token,
        }

        if depart_date:
            params["depart_date"] = depart_date.strftime("%Y-%m")

        if return_date:
            params["return_date"] = return_date.strftime("%Y-%m")

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.FLIGHT_API_BASE}/prices/direct",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_flight_prices_calendar(
        self,
        origin: str,
        destination: str,
        depart_date: date,
        currency: str = "EUR"
    ) -> Dict[str, Any]:
        """
        Get flight prices for entire month (calendar view).

        Uses: /v1/prices/calendar
        """
        params = {
            "origin": origin.upper(),
            "destination": destination.upper(),
            "depart_date": depart_date.strftime("%Y-%m-%d"),
            "currency": currency,
            "token": self.token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.FLIGHT_API_BASE}/prices/calendar",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_popular_destinations(
        self,
        origin: str,
        currency: str = "EUR"
    ) -> Dict[str, Any]:
        """
        Get popular destinations from an origin.

        Uses: /v1/city-directions
        """
        params = {
            "origin": origin.upper(),
            "currency": currency,
            "token": self.token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.FLIGHT_API_BASE}/city-directions",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_airline_directions(
        self,
        airline_code: str,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get routes operated by a specific airline.

        Uses: /v1/airline-directions
        """
        params = {
            "airline_code": airline_code.upper(),
            "limit": limit,
            "token": self.token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.FLIGHT_API_BASE}/airline-directions",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def search_flights_v3(
        self,
        origin: str,
        destination: str,
        departure_at: date,
        return_at: Optional[date] = None,
        adults: int = 1,
        children: int = 0,
        infants: int = 0,
        trip_class: str = "Y",  # Y=economy, C=business
        currency: str = "EUR",
        sorting: str = "price",
        limit: int = 30
    ) -> Dict[str, Any]:
        """
        Search flights with full details (v3 API).

        Uses: /aviasales/v3/prices_for_dates
        """
        params = {
            "origin": origin.upper(),
            "destination": destination.upper(),
            "departure_at": departure_at.strftime("%Y-%m-%d"),
            "currency": currency,
            "sorting": sorting,
            "limit": limit,
            "token": self.token,
        }

        if return_at:
            params["return_at"] = return_at.strftime("%Y-%m-%d")

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.AVIASALES_API}/prices_for_dates",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    # ==========================================================================
    # HOTEL APIs
    # ==========================================================================

    async def search_hotels(
        self,
        location: str,
        check_in: date,
        check_out: date,
        adults: int = 2,
        children: int = 0,
        currency: str = "EUR",
        language: str = "en",
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Search hotels in a location.

        Uses: Hotellook API /cache.json
        """
        params = {
            "location": location,
            "checkIn": check_in.strftime("%Y-%m-%d"),
            "checkOut": check_out.strftime("%Y-%m-%d"),
            "adults": adults,
            "children": children,
            "currency": currency,
            "language": language,
            "limit": limit,
            "token": self.token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.HOTEL_API_BASE}/cache.json",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_hotel_lookup(
        self,
        query: str,
        language: str = "en",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Autocomplete for hotel/city search.

        Uses: /lookup.json
        """
        params = {
            "query": query,
            "lang": language,
            "limit": limit,
            "token": self.token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.HOTEL_API_BASE}/lookup.json",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_hotel_prices(
        self,
        location: str,
        check_in: date,
        check_out: date,
        currency: str = "EUR",
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get hotel prices for a location.

        Uses: /cache.json
        """
        params = {
            "location": location,
            "checkIn": check_in.strftime("%Y-%m-%d"),
            "checkOut": check_out.strftime("%Y-%m-%d"),
            "currency": currency,
            "limit": limit,
            "token": self.token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.HOTEL_API_BASE}/cache.json",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    # ==========================================================================
    # AFFILIATE LINK GENERATION
    # ==========================================================================

    def generate_flight_link(
        self,
        origin: str,
        destination: str,
        depart_date: date,
        return_date: Optional[date] = None,
        adults: int = 1,
        children: int = 0,
        infants: int = 0,
        trip_class: str = "Y"
    ) -> str:
        """
        Generate affiliate flight search link.

        This link redirects to Aviasales with your affiliate marker.
        """
        # Format: ORIGIN_DESTINATION_DDMM_DDMM_Y_1_0_0
        depart_str = depart_date.strftime("%d%m")

        if return_date:
            return_str = return_date.strftime("%d%m")
            search_params = f"{origin}{destination}{depart_str}{return_str}{trip_class}{adults}{children}{infants}"
        else:
            search_params = f"{origin}{destination}{depart_str}{trip_class}{adults}{children}{infants}"

        params = {
            "marker": self.marker,
            "with_request": "true",
        }

        return f"{self.FLIGHT_REDIRECT}/{search_params}?{urlencode(params)}"

    def generate_flight_deeplink(
        self,
        origin: str,
        destination: str,
        depart_date: date,
        return_date: Optional[date] = None,
        adults: int = 1,
        one_way: bool = False
    ) -> str:
        """
        Generate Aviasales deeplink with full tracking.
        """
        base_url = "https://www.aviasales.com/search"

        # Build search string
        origin = origin.upper()[:3]
        destination = destination.upper()[:3]
        depart_str = depart_date.strftime("%d%m")

        if return_date and not one_way:
            return_str = return_date.strftime("%d%m")
            search_string = f"{origin}{depart_str}{destination}{return_str}{adults}"
        else:
            search_string = f"{origin}{depart_str}{destination}{adults}"

        params = {
            "marker": self.marker,
        }

        return f"{base_url}/{search_string}?{urlencode(params)}"

    def generate_hotel_link(
        self,
        location_id: str,
        check_in: date,
        check_out: date,
        adults: int = 2,
        children: int = 0
    ) -> str:
        """
        Generate affiliate hotel search link.

        This link redirects to Hotellook with your affiliate marker.
        """
        params = {
            "locationId": location_id,
            "checkIn": check_in.strftime("%Y-%m-%d"),
            "checkOut": check_out.strftime("%Y-%m-%d"),
            "adults": adults,
            "children": children,
            "marker": self.marker,
        }

        return f"{self.HOTEL_REDIRECT}?{urlencode(params)}"

    def generate_hotel_deeplink(
        self,
        city: str,
        check_in: date,
        check_out: date,
        adults: int = 2
    ) -> str:
        """
        Generate Hotellook deeplink for a city.
        """
        base_url = "https://search.hotellook.com"

        params = {
            "destination": city,
            "checkIn": check_in.strftime("%Y-%m-%d"),
            "checkOut": check_out.strftime("%Y-%m-%d"),
            "adults": adults,
            "marker": self.marker,
        }

        return f"{base_url}?{urlencode(params)}"

    # ==========================================================================
    # WIDGET CONFIGURATION
    # ==========================================================================

    def get_flight_widget_config(self) -> Dict[str, Any]:
        """
        Get configuration for Travelpayouts flight search widget.
        """
        return {
            "marker": self.marker,
            "host": self.host,
            "locale": "en",
            "currency": "EUR",
            "powered_by": "true",
        }

    def get_hotel_widget_config(self) -> Dict[str, Any]:
        """
        Get configuration for Travelpayouts hotel search widget.
        """
        return {
            "marker": self.marker,
            "host": self.host,
            "locale": "en",
            "currency": "EUR",
        }


# Create singleton instance
travelpayouts_client = TravelpayoutsClient() if settings.TRAVELPAYOUTS_TOKEN else None


def get_travelpayouts_client() -> TravelpayoutsClient:
    """Get Travelpayouts client instance."""
    if not travelpayouts_client:
        raise ValueError("Travelpayouts not configured. Set TRAVELPAYOUTS_TOKEN in .env")
    return travelpayouts_client
