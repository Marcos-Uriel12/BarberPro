"""Barber API endpoint tests — public GET, admin-only POST."""

import pytest


@pytest.mark.asyncio
async def test_list_barbers_empty(async_client):
    """GET /api/v1/barbers returns 200 with empty list when no barbers exist."""
    response = await async_client.get("/api/v1/barbers/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_barber_without_auth_returns_401(async_client):
    """POST /api/v1/barbers without auth token returns 401."""
    response = await async_client.post(
        "/api/v1/barbers/",
        json={"name": "Carlos", "phone": "+5491112345678"},
    )
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
