"""Auth use case tests — login returns token or None via SQLite."""

import pytest

from app.application.use_cases.auth_use_cases import LoginUseCase
from app.config.settings import settings
from app.domain.entities.admin import Admin
from app.infrastructure.auth.jwt import JWTService
from app.infrastructure.auth.password import hash_password
from app.infrastructure.database.repositories.admin_repo import (
    SQLAlchemyAdminRepository,
)


@pytest.mark.asyncio
async def test_login_use_case_valid_credentials(async_session):
    """Login with correct username and password returns a JWT token."""
    # Seed admin into SQLite
    admin_repo = SQLAlchemyAdminRepository(async_session)
    hashed = hash_password(settings.ADMIN_PASSWORD)
    await admin_repo.save(
        Admin(username=settings.ADMIN_USERNAME, hashed_password=hashed)
    )

    jwt_service = JWTService(settings)
    use_case = LoginUseCase(admin_repo, jwt_service)

    token = await use_case.execute(
        settings.ADMIN_USERNAME, settings.ADMIN_PASSWORD
    )
    assert token is not None
    assert isinstance(token, str)
    # Token should be verifiable
    payload = jwt_service.verify_token(token)
    assert payload is not None


@pytest.mark.asyncio
async def test_login_use_case_invalid_password(async_session):
    """Login with wrong password returns None."""
    admin_repo = SQLAlchemyAdminRepository(async_session)
    hashed = hash_password(settings.ADMIN_PASSWORD)
    await admin_repo.save(
        Admin(username=settings.ADMIN_USERNAME, hashed_password=hashed)
    )

    jwt_service = JWTService(settings)
    use_case = LoginUseCase(admin_repo, jwt_service)

    token = await use_case.execute(settings.ADMIN_USERNAME, "wrong_password")
    assert token is None


@pytest.mark.asyncio
async def test_login_use_case_unknown_user(async_session):
    """Login with non-existent username returns None."""
    admin_repo = SQLAlchemyAdminRepository(async_session)
    jwt_service = JWTService(settings)
    use_case = LoginUseCase(admin_repo, jwt_service)

    token = await use_case.execute("ghost_admin", "any_pass")
    assert token is None
