"""Service use cases — CRUD orchestration."""

from decimal import Decimal
from uuid import UUID

from app.domain.entities.service import Service
from app.domain.interfaces.repositories import ServiceRepository


class CreateServiceUseCase:
    """Create a new service."""

    def __init__(self, repo: ServiceRepository) -> None:
        self._repo = repo

    async def execute(self, name: str, price: Decimal, duration_minutes: int) -> Service:
        service = Service(name=name, price=price, duration_minutes=duration_minutes)
        return await self._repo.save(service)


class GetServiceUseCase:
    """Get a single service by ID."""

    def __init__(self, repo: ServiceRepository) -> None:
        self._repo = repo

    async def execute(self, service_id: UUID) -> Service | None:
        return await self._repo.get_by_id(service_id)


class ListServicesUseCase:
    """List all services."""

    def __init__(self, repo: ServiceRepository) -> None:
        self._repo = repo

    async def execute(self) -> list[Service]:
        return await self._repo.list()


class UpdateServiceUseCase:
    """Update an existing service."""

    def __init__(self, repo: ServiceRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        service_id: UUID,
        name: str | None = None,
        price: Decimal | None = None,
        duration_minutes: int | None = None,
    ) -> Service | None:
        service = await self._repo.get_by_id(service_id)
        if service is None:
            return None
        updated = Service(
            id=service.id,
            name=name if name is not None else service.name,
            price=price if price is not None else service.price,
            duration_minutes=(
                duration_minutes if duration_minutes is not None
                else service.duration_minutes
            ),
        )
        return await self._repo.save(updated)


class DeleteServiceUseCase:
    """Delete a service by ID."""

    def __init__(self, repo: ServiceRepository) -> None:
        self._repo = repo

    async def execute(self, service_id: UUID) -> bool:
        service = await self._repo.get_by_id(service_id)
        if service is None:
            return False
        await self._repo.delete(service_id)
        return True
