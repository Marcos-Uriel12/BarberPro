"""FastAPI dependencies — session, JWT, and current admin."""

from collections.abc import AsyncGenerator
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.infrastructure.auth.jwt import JWTService
from app.infrastructure.database.engine import get_session as _get_session
from app.infrastructure.database.repositories.admin_repo import SQLAlchemyAdminRepository


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an async database session.

    Delegates to the shared engine-level dependency.
    Yields an AsyncSession; FastAPI handles cleanup.
    """
    async for session in _get_session():
        yield session


def get_jwt_service() -> JWTService:
    """Provide a configured JWT service instance."""
    return JWTService(settings)


async def get_current_admin(
    access_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Verify JWT from access_token cookie and return admin info.

    Raises 401 if the cookie is missing, token is invalid/expired,
    or the admin user no longer exists.
    """
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    jwt_service = get_jwt_service()
    payload = jwt_service.verify_token(access_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    admin_id = payload.get("sub")
    if admin_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    admin_repo = SQLAlchemyAdminRepository(session)
    admin = await admin_repo.get_by_id(UUID(admin_id))
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return {"username": admin.username, "id": str(admin.id)}
