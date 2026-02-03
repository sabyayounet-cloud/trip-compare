"""
Analytics API endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=schemas.AnalyticsResponse)
def get_dashboard_analytics(
        days: int = Query(30, ge=1, le=365),
        db: Session = Depends(get_db)
):
    """
    Get dashboard analytics overview.

    Returns key metrics for the admin dashboard:
    - Total subscribers
    - Total clicks
    - Total deals
    - Top destinations
    - Clicks by affiliate provider
    - Recent signups
    """
    return schemas.AnalyticsResponse(
        total_subscribers=crud.count_subscribers(db),
        total_clicks=crud.count_clicks(db, days=days),
        total_deals=crud.count_deals(db),
        top_destinations=crud.get_top_destinations(db),
        clicks_by_provider=crud.get_clicks_by_provider(db, days=days),
        recent_signups=crud.get_recent_signups(db, days=7)
    )


@router.get("/clicks")
def get_click_analytics(
        days: int = Query(30, ge=1, le=365),
        db: Session = Depends(get_db)
):
    """
    Get detailed click analytics.
    """
    total_clicks = crud.count_clicks(db, days=days)
    clicks_by_provider = crud.get_clicks_by_provider(db, days=days)

    return {
        "period_days": days,
        "total_clicks": total_clicks,
        "by_provider": clicks_by_provider,
        "avg_daily_clicks": round(total_clicks / days, 2) if days > 0 else 0
    }


@router.get("/subscribers")
def get_subscriber_analytics(db: Session = Depends(get_db)):
    """
    Get subscriber analytics.
    """
    total = crud.count_subscribers(db, active_only=False)
    active = crud.count_subscribers(db, active_only=True)
    recent = crud.get_recent_signups(db, days=7)

    return {
        "total_subscribers": total,
        "active_subscribers": active,
        "inactive_subscribers": total - active,
        "signups_last_7_days": recent,
        "churn_rate": round((total - active) / total * 100, 2) if total > 0 else 0
    }


@router.get("/destinations")
def get_destination_analytics(
        limit: int = Query(10, ge=1, le=50),
        db: Session = Depends(get_db)
):
    """
    Get top searched destinations.
    """
    return {
        "top_destinations": crud.get_top_destinations(db, limit=limit)
    }


@router.get("/revenue-estimate")
def estimate_revenue(
        clicks: int = Query(..., ge=0),
        conversion_rate: float = Query(0.02, ge=0, le=1),  # 2% default
        avg_booking_value: float = Query(150.0, ge=0),  # €150 average booking
        commission_rate: float = Query(0.05, ge=0, le=1),  # 5% average commission
):
    """
    Estimate potential revenue based on traffic.

    This is a simple calculator to help project earnings:
    - Default 2% conversion rate (clicks to bookings)
    - Default €150 average booking value
    - Default 5% commission rate

    Formula: clicks * conversion_rate * avg_booking_value * commission_rate
    """
    bookings = clicks * conversion_rate
    gross_booking_value = bookings * avg_booking_value
    estimated_commission = gross_booking_value * commission_rate

    return {
        "clicks": clicks,
        "conversion_rate": f"{conversion_rate * 100}%",
        "estimated_bookings": round(bookings, 2),
        "avg_booking_value": f"€{avg_booking_value}",
        "gross_booking_value": f"€{round(gross_booking_value, 2)}",
        "commission_rate": f"{commission_rate * 100}%",
        "estimated_monthly_revenue": f"€{round(estimated_commission, 2)}",
        "note": "These are estimates. Actual results vary by provider and conversion rates."
    }


@router.post("/price-alerts", response_model=schemas.PriceAlertResponse)
def create_price_alert(alert: schemas.PriceAlertCreate, db: Session = Depends(get_db)):
    """
    Create a price alert for a user.
    """
    return crud.create_price_alert(db, alert)


@router.get("/price-alerts/{email}")
def get_user_price_alerts(email: str, db: Session = Depends(get_db)):
    """
    Get all price alerts for an email.
    """
    alerts = crud.get_price_alerts_by_email(db, email)
    return {"email": email, "alerts": alerts}


@router.delete("/price-alerts/{alert_id}")
def delete_price_alert(
        alert_id: int,
        email: str = Query(...),
        db: Session = Depends(get_db)
):
    """
    Delete a price alert.
    """
    success = crud.delete_price_alert(db, alert_id, email)
    return {"success": success, "message": "Alert deleted" if success else "Alert not found"}
