from redis.asyncio import Redis


class TempClientRepository:
    def __init__(self, redis_client: Redis) -> None:
        self._redis = redis_client

    async def store_client_data(
        self, temp_id: str, name: str, phone: str
    ) -> None:
        key = f"client:booking:{temp_id}"
        await self._redis.hset(key, mapping={"name": name, "phone": phone})
        await self._redis.expire(key, 3600)

    async def get_client_data(self, temp_id: str) -> dict | None:
        key = f"client:booking:{temp_id}"
        data = await self._redis.hgetall(key)
        if not data:
            return None
        return {k.decode(): v.decode() for k, v in data.items()}
