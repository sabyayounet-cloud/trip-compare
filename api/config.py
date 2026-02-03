"""
Application configuration
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "TripCompare API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./tripcompare.db"

    # API Keys (set these in environment variables)
    TRAVELPAYOUTS_TOKEN: str = ""
    TRAVELPAYOUTS_MARKER: str = ""
    TRAVELPAYOUTS_HOST: str = ""
    BOOKING_AFFILIATE_ID: str = ""
    GETYOURGUIDE_PARTNER_ID: str = ""
    HOSTELWORLD_AFFILIATE_ID: str = ""

    # Email (Brevo/Sendinblue)
    BREVO_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "*"]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
