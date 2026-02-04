"""
TripCompare API - Main Application Entry Point

A comprehensive travel booking API that powers affiliate marketing
for flights, hotels, experiences, and vacation packages.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from .config import get_settings
from .database import init_db
from .logger import logger, log_api_call, log_error, log_info
from .routers import (
    subscribers_router,
    destinations_router,
    deals_router,
    experiences_router,
    search_router,
    analytics_router
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    log_info("Starting TripCompare API...")
    init_db()
    log_info("✅ Database initialized successfully")
    log_info(f"Running in {'DEBUG' if settings.DEBUG else 'PRODUCTION'} mode")
    yield
    log_info("👋 Shutting down TripCompare API...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
## TripCompare Travel Booking API

A powerful API-first travel booking platform for affiliate marketing.

### Features:
- 🛫 **Flight Search** - Compare flights via Skyscanner/Travelpayouts
- 🏨 **Hotel Search** - Find hotels via Booking.com
- 🎭 **Experiences** - Tours and activities via GetYourGuide
- 📧 **Newsletter** - Subscriber management for deal alerts
- 📊 **Analytics** - Track clicks, conversions, and revenue

### Monetization:
- Affiliate links with tracking
- Click and conversion analytics
- Revenue estimation tools

### Getting Started:
1. Sign up for affiliate programs (see docs)
2. Configure API keys in `.env`
3. Start making API calls!
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing and logging middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()

    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        response.headers["X-Process-Time"] = f"{round(process_time, 2)}ms"

        # Log the API call
        log_api_call(
            endpoint=request.url.path,
            method=request.method,
            status_code=response.status_code,
            duration_ms=process_time
        )

        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        log_error(e, context=f"{request.method} {request.url.path}")
        raise


# Include routers
app.include_router(subscribers_router)
app.include_router(destinations_router)
app.include_router(deals_router)
app.include_router(experiences_router)
app.include_router(search_router)
app.include_router(analytics_router)


# Root endpoint
@app.get("/", tags=["Health"])
def root():
    """
    API health check and welcome message.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs",
        "endpoints": {
            "subscribers": "/subscribers",
            "destinations": "/destinations",
            "deals": "/deals",
            "experiences": "/experiences",
            "search": "/search",
            "analytics": "/analytics"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Detailed health check for monitoring.
    """
    return {
        "status": "healthy",
        "database": "connected",
        "version": settings.APP_VERSION
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log_error(exc, context=f"Global handler for {request.method} {request.url.path}")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# Seed data endpoint (for initial setup)
@app.post("/seed", tags=["Admin"])
def seed_database():
    """
    Seed the database with sample data.
    Only works in DEBUG mode.
    """
    if not settings.DEBUG:
        return {"error": "Seeding only available in DEBUG mode"}

    from .database import SessionLocal
    from . import models

    db = SessionLocal()

    # Sample destinations
    destinations = [
        models.Destination(
            name="Barcelona",
            country="Spain",
            city_code="BCN",
            description="Vibrant city known for Gaudí architecture and beaches",
            image_url="https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600",
            is_featured=True,
            avg_flight_price=79,
            avg_hotel_price=95,
            best_time_to_visit="April to June",
            tags=["beach", "city", "culture", "nightlife"]
        ),
        models.Destination(
            name="Rome",
            country="Italy",
            city_code="FCO",
            description="Eternal city with ancient ruins and world-class cuisine",
            image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600",
            is_featured=True,
            avg_flight_price=89,
            avg_hotel_price=110,
            best_time_to_visit="April to May, September to October",
            tags=["history", "culture", "food", "art"]
        ),
        models.Destination(
            name="Amsterdam",
            country="Netherlands",
            city_code="AMS",
            description="Charming canals, world-class museums, and vibrant nightlife",
            image_url="https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600",
            is_featured=True,
            avg_flight_price=65,
            avg_hotel_price=120,
            best_time_to_visit="April to May",
            tags=["city", "culture", "nightlife", "art"]
        ),
        models.Destination(
            name="Paris",
            country="France",
            city_code="CDG",
            description="The City of Light - romance, art, and gastronomy",
            image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
            is_featured=True,
            avg_flight_price=75,
            avg_hotel_price=140,
            best_time_to_visit="April to June, September to November",
            tags=["romance", "culture", "food", "art", "shopping"]
        ),
    ]

    for dest in destinations:
        existing = db.query(models.Destination).filter(
            models.Destination.name == dest.name
        ).first()
        if not existing:
            db.add(dest)

    db.commit()

    # Get destination IDs for deals
    barcelona = db.query(models.Destination).filter(models.Destination.name == "Barcelona").first()
    rome = db.query(models.Destination).filter(models.Destination.name == "Rome").first()
    amsterdam = db.query(models.Destination).filter(models.Destination.name == "Amsterdam").first()
    paris = db.query(models.Destination).filter(models.Destination.name == "Paris").first()

    # Sample deals with affiliate links
    deals = [
        models.Deal(
            title="Barcelona Beach Escape",
            description="Round-trip flights from London",
            deal_type="flight",
            destination_id=barcelona.id if barcelona else None,
            origin_city="London",
            original_price=145,
            deal_price=79,
            discount_percentage=45,
            currency="EUR",
            affiliate_provider="aviasales",
            affiliate_link="https://www.aviasales.com/search/LON0415BCN04221?marker=tripcompare",
            image_url="https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600",
            travel_dates="Apr 15-22",
            is_featured=True
        ),
        models.Deal(
            title="Rome City Break",
            description="3 nights + flights from Paris",
            deal_type="package",
            destination_id=rome.id if rome else None,
            origin_city="Paris",
            original_price=320,
            deal_price=199,
            discount_percentage=38,
            currency="EUR",
            affiliate_provider="aviasales",
            affiliate_link="https://www.aviasales.com/search/PAR0501ROM05041?marker=tripcompare",
            image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600",
            travel_dates="May 1-4",
            is_featured=True
        ),
        models.Deal(
            title="Amsterdam 4-Star Hotel",
            description="Central location with free cancellation",
            deal_type="hotel",
            destination_id=amsterdam.id if amsterdam else None,
            original_price=185,
            deal_price=89,
            discount_percentage=52,
            currency="EUR",
            affiliate_provider="hotellook",
            affiliate_link="https://search.hotellook.com?destination=Amsterdam&checkIn=2026-05-15&checkOut=2026-05-18&adults=2&marker=tripcompare",
            image_url="https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600",
            is_featured=True
        ),
        models.Deal(
            title="Paris Weekend Getaway",
            description="Weekend escape from Berlin",
            deal_type="flight",
            destination_id=paris.id if paris else None,
            origin_city="Berlin",
            original_price=215,
            deal_price=129,
            discount_percentage=40,
            currency="EUR",
            affiliate_provider="aviasales",
            affiliate_link="https://www.aviasales.com/search/BER0607PAR06091?marker=tripcompare",
            image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
            travel_dates="Jun 7-9",
            is_featured=True
        ),
    ]

    for deal in deals:
        existing = db.query(models.Deal).filter(models.Deal.title == deal.title).first()
        if not existing:
            db.add(deal)

    db.commit()

    # Sample experiences
    experiences = [
        models.Experience(
            title="Colosseum Skip-the-Line Tour",
            description="Skip the long lines and explore Rome's iconic amphitheater",
            destination_id=rome.id if rome else None,
            price=45,
            currency="EUR",
            duration="3 hours",
            rating=4.9,
            review_count=2847,
            image_url="https://images.unsplash.com/photo-1549144511-f099e773c147?w=500",
            affiliate_provider="getyourguide",
            category="tours"
        ),
        models.Experience(
            title="Eiffel Tower Summit Access",
            description="Skip-the-line access to the summit with stunning views",
            destination_id=paris.id if paris else None,
            price=62,
            currency="EUR",
            duration="2 hours",
            rating=4.8,
            review_count=5123,
            image_url="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500",
            affiliate_provider="getyourguide",
            category="tours"
        ),
        models.Experience(
            title="Sagrada Familia Guided Tour",
            description="Discover Gaudí's masterpiece with an expert guide",
            destination_id=barcelona.id if barcelona else None,
            price=39,
            currency="EUR",
            duration="1.5 hours",
            rating=4.9,
            review_count=3567,
            image_url="https://images.unsplash.com/photo-1583422409516-2895a77efded?w=500",
            affiliate_provider="getyourguide",
            category="tours"
        ),
        models.Experience(
            title="Amsterdam Canal Cruise",
            description="See the city from the water on a scenic canal cruise",
            destination_id=amsterdam.id if amsterdam else None,
            price=18,
            currency="EUR",
            duration="1 hour",
            rating=4.7,
            review_count=1892,
            image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
            affiliate_provider="getyourguide",
            category="tours"
        ),
    ]

    for exp in experiences:
        existing = db.query(models.Experience).filter(
            models.Experience.title == exp.title
        ).first()
        if not existing:
            db.add(exp)

    db.commit()
    db.close()

    return {
        "message": "Database seeded successfully",
        "destinations": len(destinations),
        "deals": len(deals),
        "experiences": len(experiences)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
