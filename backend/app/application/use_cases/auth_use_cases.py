"""Auth use cases — login and get current admin."""

from uuid import UUID

from app.domain.interfaces.repositories import AdminRepository
from app.infrastructure.auth.jwt import JWTService
from app.infrastructure.auth.password import verify_password


class LoginUseCase:
    """Authenticate admin credentials and return a JWT token."""

    def __init__(self, repo: AdminRepository, jwt_service: JWTService) -> None:
        self._repo = repo
        self._jwt_service = jwt_service

    async def execute(self, username: str, password: str) -> str | None:
        """Return JWT token string if credentials are valid, None otherwise."""
        admin = await self._repo.get_by_username(username)
        if admin is None:
            return None
        if not verify_password(password, admin.hashed_password):
            return None
        return self._jwt_service.create_token(str(admin.id))


class GetCurrentAdminUseCase:
    """Get admin entity by ID from a verified token payload."""

    def __init__(self, repo: AdminRepository) -> None:
        self._repo = repo

    async def execute(self, admin_id: str) -> str | None:
        """Return admin username if found, None otherwise."""
        admin = await self._repo.get_by_id(UUID(admin_id))
        if admin is None:
            return None
        return admin.username
