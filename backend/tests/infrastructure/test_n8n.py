"""n8n notifier tests — no-op when URL is empty, no fixture needed."""

import pytest

from app.infrastructure.notifications.n8n import notify_n8n


@pytest.mark.asyncio
async def test_notify_n8n_noop_when_url_empty():
    """When N8N_WEBHOOK_URL is empty (default), the call should return
    immediately without attempting any HTTP request."""
    # This should complete without errors or side effects
    await notify_n8n({"test": True, "event": "appointment_created"})
    # If we reach here without exception, the test passes
