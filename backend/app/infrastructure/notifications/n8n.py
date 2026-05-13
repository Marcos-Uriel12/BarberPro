import logging

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)


async def notify_n8n(turno_data: dict) -> None:
    webhook_url = settings.N8N_WEBHOOK_URL
    if not webhook_url:
        return

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                webhook_url,
                json=turno_data,
                timeout=10.0,
            )
    except Exception:
        logger.exception("Failed to notify n8n webhook")
