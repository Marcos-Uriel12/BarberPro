"""API v1 router — aggregates all endpoint routers."""

from fastapi import APIRouter

from app.interfaces.api.v1.endpoints import (
    appointments,
    auth,
    availability,
    barbers,
    services,
)

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(barbers.router)
api_v1_router.include_router(services.router)
api_v1_router.include_router(appointments.router)
api_v1_router.include_router(availability.router)


@api_v1_router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint — verifies the API is running."""
    return {"status": "ok"}
