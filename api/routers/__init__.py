"""
API Routers
"""
from .subscribers import router as subscribers_router
from .destinations import router as destinations_router
from .deals import router as deals_router
from .experiences import router as experiences_router
from .search import router as search_router
from .analytics import router as analytics_router

__all__ = [
    "subscribers_router",
    "destinations_router",
    "deals_router",
    "experiences_router",
    "search_router",
    "analytics_router"
]
