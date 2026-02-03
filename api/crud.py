"""
CRUD operations for database models
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from . import models, schemas


# ============== Subscriber CRUD ==============

def create_subscriber(db: Session, subscriber: schemas.SubscriberCreate) -> models.Subscriber:
    db_subscriber = models.Subscriber(
        email=subscriber.email,
        name=subscriber.name,
        source=subscriber.source,
        preferences=subscriber.preferences
    )
    db.add(db_subscriber)
    db.commit()
    db.refresh(db_subscriber)
    return db_subscriber


def get_subscriber_by_email(db: Session, email: str) -> Optional[models.Subscriber]:
    return db.query(models.Subscriber).filter(models.Subscriber.email == email).first()


def get_subscribers(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.Subscriber]:
    query = db.query(models.Subscriber)
    if active_only:
        query = query.filter(models.Subscriber.is_active == True)
    return query.offset(skip).limit(limit).all()


def update_subscriber(db: Session, email: str, subscriber: schemas.SubscriberUpdate) -> Optional[models.Subscriber]:
    db_subscriber = get_subscriber_by_email(db, email)
    if db_subscriber:
        update_data = subscriber.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_subscriber, key, value)
        db.commit()
        db.refresh(db_subscriber)
    return db_subscriber


def delete_subscriber(db: Session, email: str) -> bool:
    db_subscriber = get_subscriber_by_email(db, email)
    if db_subscriber:
        db_subscriber.is_active = False  # Soft delete
        db.commit()
        return True
    return False


def count_subscribers(db: Session, active_only: bool = True) -> int:
    query = db.query(models.Subscriber)
    if active_only:
        query = query.filter(models.Subscriber.is_active == True)
    return query.count()


# ============== Destination CRUD ==============

def create_destination(db: Session, destination: schemas.DestinationCreate) -> models.Destination:
    db_destination = models.Destination(**destination.model_dump())
    db.add(db_destination)
    db.commit()
    db.refresh(db_destination)
    return db_destination


def get_destination(db: Session, destination_id: int) -> Optional[models.Destination]:
    return db.query(models.Destination).filter(models.Destination.id == destination_id).first()


def get_destinations(db: Session, skip: int = 0, limit: int = 100, featured_only: bool = False) -> List[models.Destination]:
    query = db.query(models.Destination)
    if featured_only:
        query = query.filter(models.Destination.is_featured == True)
    return query.offset(skip).limit(limit).all()


def search_destinations(db: Session, query: str, limit: int = 10) -> List[models.Destination]:
    return db.query(models.Destination).filter(
        (models.Destination.name.ilike(f"%{query}%")) |
        (models.Destination.country.ilike(f"%{query}%")) |
        (models.Destination.city_code.ilike(f"%{query}%"))
    ).limit(limit).all()


def update_destination(db: Session, destination_id: int, destination: schemas.DestinationUpdate) -> Optional[models.Destination]:
    db_destination = get_destination(db, destination_id)
    if db_destination:
        update_data = destination.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_destination, key, value)
        db.commit()
        db.refresh(db_destination)
    return db_destination


# ============== Deal CRUD ==============

def create_deal(db: Session, deal: schemas.DealCreate) -> models.Deal:
    # Calculate discount percentage
    discount = int(((deal.original_price - deal.deal_price) / deal.original_price) * 100)

    db_deal = models.Deal(
        **deal.model_dump(),
        discount_percentage=discount
    )
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


def get_deal(db: Session, deal_id: int) -> Optional[models.Deal]:
    return db.query(models.Deal).filter(models.Deal.id == deal_id).first()


def get_deals(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        deal_type: Optional[str] = None,
        featured_only: bool = False,
        active_only: bool = True
) -> List[models.Deal]:
    query = db.query(models.Deal)

    if active_only:
        query = query.filter(models.Deal.is_active == True)
    if featured_only:
        query = query.filter(models.Deal.is_featured == True)
    if deal_type:
        query = query.filter(models.Deal.deal_type == deal_type)

    return query.order_by(desc(models.Deal.created_at)).offset(skip).limit(limit).all()


def get_deals_by_destination(db: Session, destination_id: int, limit: int = 10) -> List[models.Deal]:
    return db.query(models.Deal).filter(
        models.Deal.destination_id == destination_id,
        models.Deal.is_active == True
    ).limit(limit).all()


def update_deal(db: Session, deal_id: int, deal: schemas.DealUpdate) -> Optional[models.Deal]:
    db_deal = get_deal(db, deal_id)
    if db_deal:
        update_data = deal.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_deal, key, value)
        db.commit()
        db.refresh(db_deal)
    return db_deal


def increment_deal_clicks(db: Session, deal_id: int) -> None:
    db_deal = get_deal(db, deal_id)
    if db_deal:
        db_deal.click_count += 1
        db.commit()


def count_deals(db: Session, active_only: bool = True) -> int:
    query = db.query(models.Deal)
    if active_only:
        query = query.filter(models.Deal.is_active == True)
    return query.count()


# ============== Experience CRUD ==============

def create_experience(db: Session, experience: schemas.ExperienceCreate) -> models.Experience:
    db_experience = models.Experience(**experience.model_dump())
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience


def get_experiences(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        destination_id: Optional[int] = None,
        category: Optional[str] = None
) -> List[models.Experience]:
    query = db.query(models.Experience).filter(models.Experience.is_active == True)

    if destination_id:
        query = query.filter(models.Experience.destination_id == destination_id)
    if category:
        query = query.filter(models.Experience.category == category)

    return query.order_by(desc(models.Experience.rating)).offset(skip).limit(limit).all()


# ============== Search Log CRUD ==============

def create_search_log(
        db: Session,
        search_type: str,
        origin: Optional[str],
        destination: str,
        check_in: Optional[datetime],
        check_out: Optional[datetime],
        travelers: int,
        ip_address: Optional[str],
        user_agent: Optional[str],
        session_id: Optional[str]
) -> models.SearchLog:
    db_log = models.SearchLog(
        search_type=search_type,
        origin=origin,
        destination=destination,
        check_in=check_in,
        check_out=check_out,
        travelers=travelers,
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id
    )
    db.add(db_log)
    db.commit()
    return db_log


# ============== Click Tracking CRUD ==============

def create_click_tracking(
        db: Session,
        deal_id: Optional[int],
        experience_id: Optional[int],
        link_type: str,
        affiliate_provider: str,
        ip_address: Optional[str],
        user_agent: Optional[str],
        referrer: Optional[str],
        session_id: Optional[str]
) -> models.ClickTracking:
    db_click = models.ClickTracking(
        deal_id=deal_id,
        experience_id=experience_id,
        link_type=link_type,
        affiliate_provider=affiliate_provider,
        ip_address=ip_address,
        user_agent=user_agent,
        referrer=referrer,
        session_id=session_id
    )
    db.add(db_click)
    db.commit()
    return db_click


def count_clicks(db: Session, days: int = 30) -> int:
    since = datetime.utcnow() - timedelta(days=days)
    return db.query(models.ClickTracking).filter(
        models.ClickTracking.created_at >= since
    ).count()


def get_clicks_by_provider(db: Session, days: int = 30) -> dict:
    since = datetime.utcnow() - timedelta(days=days)
    results = db.query(
        models.ClickTracking.affiliate_provider,
        func.count(models.ClickTracking.id)
    ).filter(
        models.ClickTracking.created_at >= since
    ).group_by(models.ClickTracking.affiliate_provider).all()

    return {provider: count for provider, count in results}


# ============== Price Alert CRUD ==============

def create_price_alert(db: Session, alert: schemas.PriceAlertCreate) -> models.PriceAlert:
    db_alert = models.PriceAlert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


def get_price_alerts_by_email(db: Session, email: str) -> List[models.PriceAlert]:
    return db.query(models.PriceAlert).filter(
        models.PriceAlert.email == email,
        models.PriceAlert.is_active == True
    ).all()


def delete_price_alert(db: Session, alert_id: int, email: str) -> bool:
    db_alert = db.query(models.PriceAlert).filter(
        models.PriceAlert.id == alert_id,
        models.PriceAlert.email == email
    ).first()
    if db_alert:
        db_alert.is_active = False
        db.commit()
        return True
    return False


# ============== Analytics ==============

def get_top_destinations(db: Session, limit: int = 5) -> List[dict]:
    results = db.query(
        models.Destination.name,
        func.count(models.SearchLog.id).label('search_count')
    ).join(
        models.SearchLog,
        models.Destination.name == models.SearchLog.destination,
        isouter=True
    ).group_by(models.Destination.name).order_by(
        desc('search_count')
    ).limit(limit).all()

    return [{"name": name, "searches": count} for name, count in results]


def get_recent_signups(db: Session, days: int = 7) -> int:
    since = datetime.utcnow() - timedelta(days=days)
    return db.query(models.Subscriber).filter(
        models.Subscriber.created_at >= since
    ).count()
