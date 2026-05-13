import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.availability import Availability
from app.domain.interfaces.repositories import AvailabilityRepository
from app.infrastructure.database.models.availability_model import AvailabilityModel


class SQLAlchemyAvailabilityRepository(AvailabilityRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, availability_id: uuid.UUID) -> Availability | None:
        result = await self._session.execute(
            select(AvailabilityModel).where(
                AvailabilityModel.id == availability_id
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Availability(
            id=model.id,
            barber_id=model.barber_id,
            day_of_week=model.day_of_week,
            start_time=model.start_time,
            end_time=model.end_time,
        )

    async def list_by_barber(self, barber_id: uuid.UUID) -> list[Availability]:
        result = await self._session.execute(
            select(AvailabilityModel)
            .where(AvailabilityModel.barber_id == barber_id)
            .order_by(AvailabilityModel.day_of_week, AvailabilityModel.start_time)
        )
        models = result.scalars().all()
        return [
            Availability(
                id=m.id,
                barber_id=m.barber_id,
                day_of_week=m.day_of_week,
                start_time=m.start_time,
                end_time=m.end_time,
            )
            for m in models
        ]

    async def save(self, availability: Availability) -> Availability:
        model = AvailabilityModel(
            id=availability.id or uuid.uuid4(),
            barber_id=availability.barber_id,
            day_of_week=availability.day_of_week,
            start_time=availability.start_time,
            end_time=availability.end_time,
        )
        merged = await self._session.merge(model)
        await self._session.commit()
        await self._session.refresh(merged)
        return Availability(
            id=merged.id,
            barber_id=merged.barber_id,
            day_of_week=merged.day_of_week,
            start_time=merged.start_time,
            end_time=merged.end_time,
        )

    async def delete(self, availability_id: uuid.UUID) -> None:
        result = await self._session.execute(
            select(AvailabilityModel).where(
                AvailabilityModel.id == availability_id
            )
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
