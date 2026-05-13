"""Redis repository tests — placeholder only.

Redis tests require a running Redis instance. Skipped by default.
"""

import pytest


@pytest.mark.skip(reason="Requires running Redis")
@pytest.mark.asyncio
async def test_redis_store_and_get_placeholder():
    """Placeholder — real tests need a Redis connection."""
    assert True
