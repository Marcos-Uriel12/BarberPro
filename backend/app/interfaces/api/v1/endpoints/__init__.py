"""Endpoint routers — import all for aggregation in v1 router."""

from app.interfaces.api.v1.endpoints.auth import router as auth_router
from app.interfaces.api.v1.endpoints.barbers import router as barbers_router
from app.interfaces.api.v1.endpoints.services import router as services_router
from app.interfaces.api.v1.endpoints.appointments import router as appointments_router
from app.interfaces.api.v1.endpoints.availability import router as availability_router

__all__ = [
    "appointments_router",
    "auth_router",
    "availability_router",
    "barbers_router",
    "services_router",
]
