"""Availability API endpoint tests — slots for non-existent barber."""

import pytest


@pytest.mark.asyncio
async def test_slots_for_nonexistent_barber_returns_200_empty(async_client):
    """GET /api/v1/availability/barbers/{id}/slots with non-existent barber
    returns 200 with an empty list."""
    response = await async_client.get(
        "/api/v1/availability/barbers/00000000-0000-0000-0000-000000000001/slots",
        params={"date": "2026-06-15"},
    )
    assert response.status_code == 200
    assert response.json() == []
