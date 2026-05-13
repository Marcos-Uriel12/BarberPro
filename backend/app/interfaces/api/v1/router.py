"""API v1 router — aggregates all endpoint routers."""

from fastapi import APIRouter

api_v1_router = APIRouter()


@api_v1_router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint — verifies the API is running."""
    return {"status": "ok"}
