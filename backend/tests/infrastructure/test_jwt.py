"""JWT service tests — encode/decode roundtrip, expiry, invalid tokens."""

import time

import pytest

from app.config.settings import settings
from app.infrastructure.auth.jwt import JWTService


@pytest.fixture
def jwt_service():
    """JWT service with short expiry for fast expiry tests."""
    svc = JWTService(settings)
    return svc


def test_create_and_verify_token_roundtrip(jwt_service):
    token = jwt_service.create_token("admin-id-123")
    assert token is not None
    payload = jwt_service.verify_token(token)
    assert payload is not None
    assert payload["sub"] == "admin-id-123"


def test_verify_token_expired_returns_none(jwt_service):
    # Override expiry to a negative value so token is already expired
    original_expire = jwt_service._expire_minutes
    jwt_service._expire_minutes = -1
    token = jwt_service.create_token("admin-id-456")
    jwt_service._expire_minutes = original_expire
    payload = jwt_service.verify_token(token)
    assert payload is None


def test_verify_invalid_token_returns_none(jwt_service):
    payload = jwt_service.verify_token("not-a-valid-jwt-token")
    assert payload is None


def test_verify_empty_token_returns_none(jwt_service):
    payload = jwt_service.verify_token("")
    assert payload is None


def test_verify_tampered_token_returns_none(jwt_service):
    token = jwt_service.create_token("admin-id-789")
    # Flip one character in the payload (middle section)
    parts = token.split(".")
    tampered = parts[0] + "." + parts[1][:-1] + ("A" if parts[1][-1] != "A" else "B") + "." + parts[2]
    payload = jwt_service.verify_token(tampered)
    assert payload is None
