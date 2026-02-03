"""
Subscriber/Newsletter API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/subscribers", tags=["Subscribers"])


@router.post("/", response_model=schemas.SubscriberResponse, status_code=status.HTTP_201_CREATED)
def subscribe(subscriber: schemas.SubscriberCreate, db: Session = Depends(get_db)):
    """
    Subscribe to newsletter.

    - **email**: Valid email address (required)
    - **name**: Subscriber's name (optional)
    - **source**: Where they signed up from (optional)
    - **preferences**: Email preferences dict (optional)
    """
    # Check if already subscribed
    existing = crud.get_subscriber_by_email(db, subscriber.email)
    if existing:
        if existing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already subscribed"
            )
        else:
            # Reactivate subscription
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            return existing

    return crud.create_subscriber(db, subscriber)


@router.get("/", response_model=List[schemas.SubscriberResponse])
def list_subscribers(
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True,
        db: Session = Depends(get_db)
):
    """
    List all subscribers (admin endpoint).
    """
    return crud.get_subscribers(db, skip=skip, limit=limit, active_only=active_only)


@router.get("/{email}", response_model=schemas.SubscriberResponse)
def get_subscriber(email: str, db: Session = Depends(get_db)):
    """
    Get subscriber by email.
    """
    subscriber = crud.get_subscriber_by_email(db, email)
    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found"
        )
    return subscriber


@router.patch("/{email}", response_model=schemas.SubscriberResponse)
def update_subscriber(
        email: str,
        subscriber: schemas.SubscriberUpdate,
        db: Session = Depends(get_db)
):
    """
    Update subscriber preferences.
    """
    updated = crud.update_subscriber(db, email, subscriber)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found"
        )
    return updated


@router.delete("/{email}", response_model=schemas.MessageResponse)
def unsubscribe(email: str, db: Session = Depends(get_db)):
    """
    Unsubscribe from newsletter (soft delete).
    """
    success = crud.delete_subscriber(db, email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found"
        )
    return {"message": "Successfully unsubscribed", "success": True}


@router.get("/count/total", response_model=dict)
def count_subscribers(active_only: bool = True, db: Session = Depends(get_db)):
    """
    Get total subscriber count.
    """
    count = crud.count_subscribers(db, active_only=active_only)
    return {"total": count, "active_only": active_only}
