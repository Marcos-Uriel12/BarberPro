import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.barber import Barber
from app.domain.interfaces.repositories import BarberRepository
from app.infrastructure.database.models.barber_model import BarberModel


class SQLAlchemyBarberRepository(BarberRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, barber_id: uuid.UUID) -> Barber | None:
        result = await self._session.execute(
            select(BarberModel).where(BarberModel.id == barber_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Barber(
            id=model.id,
            name=model.name,
            phone=model.phone,
        )

    async def list(self) -> list[Barber]:
        result = await self._session.execute(
            select(BarberModel).order_by(BarberModel.name)
        )
        models = result.scalars().all()
        return [
            Barber(id=m.id, name=m.name, phone=m.phone)
            for m in models
        ]

    async def save(self, barber: Barber) -> Barber:
        model = BarberModel(
            id=barber.id or uuid.uuid4(),
            name=barber.name,
            phone=barber.phone,
        )
        merged = await self._session.merge(model)
        await self._session.commit()
        await self._session.refresh(merged)
        return Barber(
            id=merged.id,
            name=merged.name,
            phone=merged.phone,
        )

    async def delete(self, barber_id: uuid.UUID) -> None:
        result = await self._session.execute(
            select(BarberModel).where(BarberModel.id == barber_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()