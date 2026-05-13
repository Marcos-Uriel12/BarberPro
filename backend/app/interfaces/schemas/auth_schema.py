"""Auth schemas — login request/response, current admin info."""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Admin login credentials."""

    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response with CSRF token."""

    csrf_token: str


class CurrentAdmin(BaseModel):
    """Current authenticated admin info."""

    username: str
