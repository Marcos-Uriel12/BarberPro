"""Auth endpoints — login, logout, and current admin info."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.auth_use_cases import GetCurrentAdminUseCase, LoginUseCase
from app.config.settings import settings
from app.infrastructure.auth.jwt import JWTService
from app.infrastructure.database.repositories.admin_repo import SQLAlchemyAdminRepository
from app.interfaces.api.dependencies import get_current_admin, get_session
from app.interfaces.schemas.auth_schema import CurrentAdmin, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> LoginResponse:
    """Authenticate admin and return JWT in httpOnly cookie."""
    repo = SQLAlchemyAdminRepository(session)
    jwt_service = JWTService(settings)
    use_case = LoginUseCase(repo, jwt_service)

    token = await use_case.execute(body.username, body.password)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set True in production
        path="/",
    )

    csrf_token = str(uuid.uuid4())
    return LoginResponse(csrf_token=csrf_token)


@router.post("/logout")
async def logout(
    response: Response,
    _admin: dict = Depends(get_current_admin),
) -> dict[str, str]:
    """Clear access_token cookie to log out."""
    response.delete_cookie(key="access_token", path="/")
    return {"message": "ok"}


@router.get("/me", response_model=CurrentAdmin)
async def me(
    current_admin: dict = Depends(get_current_admin),
) -> CurrentAdmin:
    """Return the current authenticated admin's username."""
    return CurrentAdmin(username=current_admin["username"])
