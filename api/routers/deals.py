"""
Deals API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/deals", tags=["Deals"])


@router.post("/", response_model=schemas.DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    """
    Create a new deal.

    - **title**: Deal title (required)
    - **deal_type**: Type of deal - flight, hotel, package, experience (required)
    - **original_price**: Original price before discount (required)
    - **deal_price**: Discounted price (required)
    - **affiliate_link**: Partner booking link (optional)
    - **affiliate_provider**: Partner name - booking, skyscanner, etc (optional)
    """
    return crud.create_deal(db, deal)


@router.get("/", response_model=List[schemas.DealResponse])
def list_deals(
        skip: int = 0,
        limit: int = 20,
        deal_type: Optional[str] = Query(None, pattern="^(flight|hotel|package|experience)$"),
        featured_only: bool = False,
        db: Session = Depends(get_db)
):
    """
    List all active deals.

    - **skip**: Pagination offset
    - **limit**: Maximum results
    - **deal_type**: Filter by type (flight, hotel, package, experience)
    - **featured_only**: Only featured deals
    """
    return crud.get_deals(
        db,
        skip=skip,
        limit=limit,
        deal_type=deal_type,
        featured_only=featured_only
    )


@router.get("/featured", response_model=List[schemas.DealResponse])
def get_featured_deals(limit: int = 6, db: Session = Depends(get_db)):
    """
    Get featured deals for homepage.
    """
    return crud.get_deals(db, limit=limit, featured_only=True)


@router.get("/hot", response_model=List[schemas.DealResponse])
def get_hot_deals(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get hottest deals (highest discount percentage).
    """
    deals = crud.get_deals(db, limit=50)
    # Sort by discount percentage
    sorted_deals = sorted(deals, key=lambda d: d.discount_percentage or 0, reverse=True)
    return sorted_deals[:limit]


@router.get("/flights", response_model=List[schemas.DealResponse])
def get_flight_deals(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get all flight deals.
    """
    return crud.get_deals(db, limit=limit, deal_type="flight")


@router.get("/hotels", response_model=List[schemas.DealResponse])
def get_hotel_deals(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get all hotel deals.
    """
    return crud.get_deals(db, limit=limit, deal_type="hotel")


@router.get("/packages", response_model=List[schemas.DealResponse])
def get_package_deals(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get all vacation package deals.
    """
    return crud.get_deals(db, limit=limit, deal_type="package")


@router.get("/{deal_id}", response_model=schemas.DealResponse)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    """
    Get deal by ID.
    """
    deal = crud.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    return deal


@router.patch("/{deal_id}", response_model=schemas.DealResponse)
def update_deal(deal_id: int, deal: schemas.DealUpdate, db: Session = Depends(get_db)):
    """
    Update deal details.
    """
    updated = crud.update_deal(db, deal_id, deal)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )
    return updated


@router.post("/{deal_id}/click", response_model=schemas.MessageResponse)
def track_deal_click(
        deal_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Track a click on a deal (for analytics).
    Returns the affiliate link to redirect to.
    """
    deal = crud.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    # Track the click
    crud.increment_deal_clicks(db, deal_id)
    crud.create_click_tracking(
        db,
        deal_id=deal_id,
        experience_id=None,
        link_type="deal",
        affiliate_provider=deal.affiliate_provider or "unknown",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer"),
        session_id=request.cookies.get("session_id")
    )

    return {
        "message": "Click tracked",
        "success": True
    }


@router.get("/{deal_id}/redirect")
def redirect_to_deal(deal_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Track click and return affiliate link for redirect.
    """
    deal = crud.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    # Track click
    crud.increment_deal_clicks(db, deal_id)
    crud.create_click_tracking(
        db,
        deal_id=deal_id,
        experience_id=None,
        link_type="deal",
        affiliate_provider=deal.affiliate_provider or "unknown",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer"),
        session_id=request.cookies.get("session_id")
    )

    return {"affiliate_link": deal.affiliate_link or "#"}
