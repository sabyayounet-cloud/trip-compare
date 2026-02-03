"""
Destinations API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/destinations", tags=["Destinations"])


@router.post("/", response_model=schemas.DestinationResponse, status_code=status.HTTP_201_CREATED)
def create_destination(destination: schemas.DestinationCreate, db: Session = Depends(get_db)):
    """
    Create a new destination.

    - **name**: City/destination name (required)
    - **country**: Country name (required)
    - **city_code**: IATA airport code (optional)
    - **description**: Destination description (optional)
    - **image_url**: Image URL (optional)
    - **tags**: List of tags like ["beach", "city"] (optional)
    """
    return crud.create_destination(db, destination)


@router.get("/", response_model=List[schemas.DestinationResponse])
def list_destinations(
        skip: int = 0,
        limit: int = 100,
        featured_only: bool = False,
        db: Session = Depends(get_db)
):
    """
    List all destinations.

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **featured_only**: Only return featured destinations
    """
    return crud.get_destinations(db, skip=skip, limit=limit, featured_only=featured_only)


@router.get("/search", response_model=List[schemas.DestinationResponse])
def search_destinations(
        q: str = Query(..., min_length=2, description="Search query"),
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """
    Search destinations by name, country, or city code.
    """
    return crud.search_destinations(db, query=q, limit=limit)


@router.get("/featured", response_model=List[schemas.DestinationResponse])
def get_featured_destinations(limit: int = 8, db: Session = Depends(get_db)):
    """
    Get featured/trending destinations for homepage.
    """
    return crud.get_destinations(db, limit=limit, featured_only=True)


@router.get("/{destination_id}", response_model=schemas.DestinationResponse)
def get_destination(destination_id: int, db: Session = Depends(get_db)):
    """
    Get destination by ID.
    """
    destination = crud.get_destination(db, destination_id)
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found"
        )
    return destination


@router.patch("/{destination_id}", response_model=schemas.DestinationResponse)
def update_destination(
        destination_id: int,
        destination: schemas.DestinationUpdate,
        db: Session = Depends(get_db)
):
    """
    Update destination details.
    """
    updated = crud.update_destination(db, destination_id, destination)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found"
        )
    return updated


@router.get("/{destination_id}/deals", response_model=List[schemas.DealResponse])
def get_destination_deals(
        destination_id: int,
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """
    Get all deals for a specific destination.
    """
    destination = crud.get_destination(db, destination_id)
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found"
        )
    return crud.get_deals_by_destination(db, destination_id, limit=limit)
