"""Auth API endpoint tests — login with wrong creds returns 401."""

import pytest


@pytest.mark.asyncio
async def test_login_wrong_credentials_returns_401(async_client):
    """POST /api/v1/auth/login with wrong credentials returns 401."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "wrong_password"},
    )
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
