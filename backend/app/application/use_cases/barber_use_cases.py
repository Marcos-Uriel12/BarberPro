"""Barber use cases — CRUD orchestration."""

from uuid import UUID

from app.domain.entities.barber import Barber
from app.domain.interfaces.repositories import BarberRepository


class CreateBarberUseCase:
    """Create a new barber."""

    def __init__(self, repo: BarberRepository) -> None:
        self._repo = repo

    async def execute(self, name: str, phone: str) -> Barber:
        barber = Barber(name=name, phone=phone)
        return await self._repo.save(barber)


class GetBarberUseCase:
    """Get a single barber by ID."""

    def __init__(self, repo: BarberRepository) -> None:
        self._repo = repo

    async def execute(self, barber_id: UUID) -> Barber | None:
        return await self._repo.get_by_id(barber_id)


class ListBarbersUseCase:
    """List all barbers."""

    def __init__(self, repo: BarberRepository) -> None:
        self._repo = repo

    async def execute(self) -> list[Barber]:
        return await self._repo.list()


class UpdateBarberUseCase:
    """Update an existing barber."""

    def __init__(self, repo: BarberRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        barber_id: UUID,
        name: str | None = None,
        phone: str | None = None,
    ) -> Barber | None:
        barber = await self._repo.get_by_id(barber_id)
        if barber is None:
            return None
        updated = Barber(
            id=barber.id,
            name=name if name is not None else barber.name,
            phone=phone if phone is not None else barber.phone,
        )
        return await self._repo.save(updated)


class DeleteBarberUseCase:
    """Delete a barber by ID."""

    def __init__(self, repo: BarberRepository) -> None:
        self._repo = repo

    async def execute(self, barber_id: UUID) -> bool:
        barber = await self._repo.get_by_id(barber_id)
        if barber is None:
            return False
        await self._repo.delete(barber_id)
        return True