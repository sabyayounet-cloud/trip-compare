"""
Experiences/Tours API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/experiences", tags=["Experiences"])


@router.post("/", response_model=schemas.ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(experience: schemas.ExperienceCreate, db: Session = Depends(get_db)):
    """
    Create a new experience/tour.

    - **title**: Experience title (required)
    - **price**: Price per person (required)
    - **destination_id**: Link to destination (optional)
    - **duration**: Duration string like "3 hours" (optional)
    - **category**: Category like tours, food, adventure (optional)
    """
    return crud.create_experience(db, experience)


@router.get("/", response_model=List[schemas.ExperienceResponse])
def list_experiences(
        skip: int = 0,
        limit: int = 20,
        destination_id: Optional[int] = None,
        category: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    List all experiences.

    - **destination_id**: Filter by destination
    - **category**: Filter by category (tours, food, adventure, culture)
    """
    return crud.get_experiences(
        db,
        skip=skip,
        limit=limit,
        destination_id=destination_id,
        category=category
    )


@router.get("/categories", response_model=List[str])
def get_categories():
    """
    Get list of experience categories.
    """
    return [
        "tours",
        "food",
        "adventure",
        "culture",
        "nightlife",
        "nature",
        "sports",
        "wellness"
    ]


@router.get("/top-rated", response_model=List[schemas.ExperienceResponse])
def get_top_rated_experiences(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get top-rated experiences.
    """
    return crud.get_experiences(db, limit=limit)


@router.get("/{experience_id}", response_model=schemas.ExperienceResponse)
def get_experience(experience_id: int, db: Session = Depends(get_db)):
    """
    Get experience by ID.
    """
    experience = db.query(crud.models.Experience).filter(
        crud.models.Experience.id == experience_id
    ).first()

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    return experience


@router.post("/{experience_id}/click", response_model=schemas.MessageResponse)
def track_experience_click(
        experience_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Track a click on an experience.
    """
    experience = db.query(crud.models.Experience).filter(
        crud.models.Experience.id == experience_id
    ).first()

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )

    crud.create_click_tracking(
        db,
        deal_id=None,
        experience_id=experience_id,
        link_type="experience",
        affiliate_provider=experience.affiliate_provider or "getyourguide",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer"),
        session_id=request.cookies.get("session_id")
    )

    return {"message": "Click tracked", "success": True}
