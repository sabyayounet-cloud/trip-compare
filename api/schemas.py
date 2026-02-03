"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date


# ============== Subscriber Schemas ==============

class SubscriberCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    source: Optional[str] = "website"
    preferences: Optional[dict] = {"flights": True, "hotels": True, "deals": True}


class SubscriberUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    preferences: Optional[dict] = None


class SubscriberResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    source: str
    preferences: dict
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Destination Schemas ==============

class DestinationCreate(BaseModel):
    name: str
    country: str
    city_code: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_featured: Optional[bool] = False
    avg_flight_price: Optional[float] = None
    avg_hotel_price: Optional[float] = None
    best_time_to_visit: Optional[str] = None
    tags: Optional[List[str]] = []


class DestinationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    avg_flight_price: Optional[float] = None
    avg_hotel_price: Optional[float] = None
    tags: Optional[List[str]] = None


class DestinationResponse(BaseModel):
    id: int
    name: str
    country: str
    city_code: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    is_featured: bool
    avg_flight_price: Optional[float]
    avg_hotel_price: Optional[float]
    best_time_to_visit: Optional[str]
    tags: List[str]

    class Config:
        from_attributes = True


# ============== Deal Schemas ==============

class DealCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deal_type: str = Field(..., pattern="^(flight|hotel|package|experience)$")
    destination_id: Optional[int] = None
    origin_city: Optional[str] = None
    original_price: float
    deal_price: float
    currency: Optional[str] = "EUR"
    affiliate_link: Optional[str] = None
    affiliate_provider: Optional[str] = None
    image_url: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    travel_dates: Optional[str] = None
    is_featured: Optional[bool] = False


class DealUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deal_price: Optional[float] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    affiliate_link: Optional[str] = None


class DealResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    deal_type: str
    destination_id: Optional[int]
    origin_city: Optional[str]
    original_price: float
    deal_price: float
    discount_percentage: Optional[int]
    currency: str
    affiliate_link: Optional[str]
    affiliate_provider: Optional[str]
    image_url: Optional[str]
    travel_dates: Optional[str]
    is_active: bool
    is_featured: bool
    click_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Experience Schemas ==============

class ExperienceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    destination_id: Optional[int] = None
    price: float
    currency: Optional[str] = "EUR"
    duration: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = 0
    image_url: Optional[str] = None
    affiliate_link: Optional[str] = None
    category: Optional[str] = None


class ExperienceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    currency: str
    duration: Optional[str]
    rating: Optional[float]
    review_count: int
    image_url: Optional[str]
    affiliate_link: Optional[str]
    category: Optional[str]

    class Config:
        from_attributes = True


# ============== Search Schemas ==============

class FlightSearchRequest(BaseModel):
    origin: str = Field(..., min_length=2, max_length=100)
    destination: str = Field(..., min_length=2, max_length=100)
    departure_date: date
    return_date: Optional[date] = None
    travelers: Optional[int] = Field(1, ge=1, le=9)
    cabin_class: Optional[str] = "economy"


class HotelSearchRequest(BaseModel):
    destination: str = Field(..., min_length=2, max_length=100)
    check_in: date
    check_out: date
    guests: Optional[int] = Field(1, ge=1, le=10)
    rooms: Optional[int] = Field(1, ge=1, le=5)


class SearchResponse(BaseModel):
    search_url: str
    affiliate_provider: str
    parameters: dict


# ============== Price Alert Schemas ==============

class PriceAlertCreate(BaseModel):
    email: EmailStr
    alert_type: str = Field(..., pattern="^(flight|hotel)$")
    origin: Optional[str] = None
    destination: str
    target_price: Optional[float] = None


class PriceAlertResponse(BaseModel):
    id: int
    email: str
    alert_type: str
    origin: Optional[str]
    destination: str
    target_price: Optional[float]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Analytics Schemas ==============

class ClickTrackRequest(BaseModel):
    deal_id: Optional[int] = None
    experience_id: Optional[int] = None
    link_type: str
    affiliate_provider: str


class AnalyticsResponse(BaseModel):
    total_subscribers: int
    total_clicks: int
    total_deals: int
    top_destinations: List[dict]
    clicks_by_provider: dict
    recent_signups: int


# ============== Generic Response Schemas ==============

class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
