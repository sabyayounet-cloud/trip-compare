"""
SQLAlchemy database models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Subscriber(Base):
    """Newsletter subscribers"""
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    source = Column(String(100), default="website")  # website, popup, footer, etc.
    preferences = Column(JSON, default=dict)  # {flights: true, hotels: true, deals: true}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Destination(Base):
    """Travel destinations"""
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(255), nullable=False)
    city_code = Column(String(10), index=True)  # IATA code
    description = Column(Text)
    image_url = Column(String(500))
    latitude = Column(Float)
    longitude = Column(Float)
    is_featured = Column(Boolean, default=False)
    avg_flight_price = Column(Float)
    avg_hotel_price = Column(Float)
    best_time_to_visit = Column(String(255))
    tags = Column(JSON, default=list)  # ["beach", "city", "culture"]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    deals = relationship("Deal", back_populates="destination")


class Deal(Base):
    """Travel deals"""
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    deal_type = Column(String(50), nullable=False)  # flight, hotel, package, experience
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    origin_city = Column(String(255))
    original_price = Column(Float, nullable=False)
    deal_price = Column(Float, nullable=False)
    discount_percentage = Column(Integer)
    currency = Column(String(3), default="EUR")
    affiliate_link = Column(String(1000))
    affiliate_provider = Column(String(100))  # booking, skyscanner, getyourguide
    image_url = Column(String(500))
    valid_from = Column(DateTime(timezone=True))
    valid_until = Column(DateTime(timezone=True))
    travel_dates = Column(String(255))  # "Apr 15-22"
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    click_count = Column(Integer, default=0)
    booking_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    destination = relationship("Destination", back_populates="deals")


class Experience(Base):
    """Tours and activities"""
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    duration = Column(String(100))  # "3 hours", "Full day"
    rating = Column(Float)
    review_count = Column(Integer, default=0)
    image_url = Column(String(500))
    affiliate_link = Column(String(1000))
    affiliate_provider = Column(String(100), default="getyourguide")
    category = Column(String(100))  # tours, food, adventure, culture
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SearchLog(Base):
    """Track user searches for analytics"""
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    search_type = Column(String(50), nullable=False)  # flight, hotel, experience
    origin = Column(String(255))
    destination = Column(String(255))
    check_in = Column(DateTime(timezone=True))
    check_out = Column(DateTime(timezone=True))
    travelers = Column(Integer, default=1)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    session_id = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ClickTracking(Base):
    """Track affiliate link clicks"""
    __tablename__ = "click_tracking"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=True)
    link_type = Column(String(50))  # deal, search, experience
    affiliate_provider = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    referrer = Column(String(500))
    session_id = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PriceAlert(Base):
    """User price alerts"""
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # flight, hotel
    origin = Column(String(255))
    destination = Column(String(255), nullable=False)
    target_price = Column(Float)
    current_lowest_price = Column(Float)
    is_active = Column(Boolean, default=True)
    last_notified = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
