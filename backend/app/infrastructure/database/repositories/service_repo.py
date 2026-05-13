import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.service import Service
from app.domain.interfaces.repositories import ServiceRepository
from app.infrastructure.database.models.service_model import ServiceModel


class SQLAlchemyServiceRepository(ServiceRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, service_id: uuid.UUID) -> Service | None:
        result = await self._session.execute(
            select(ServiceModel).where(ServiceModel.id == service_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Service(
            id=model.id,
            name=model.name,
            price=model.price,
            duration_minutes=model.duration_minutes,
        )

    async def list(self) -> list[Service]:
        result = await self._session.execute(
            select(ServiceModel).order_by(ServiceModel.name)
        )
        models = result.scalars().all()
        return [
            Service(
                id=m.id,
                name=m.name,
                price=m.price,
                duration_minutes=m.duration_minutes,
            )
            for m in models
        ]

    async def save(self, service: Service) -> Service:
        model = ServiceModel(
            id=service.id or uuid.uuid4(),
            name=service.name,
            price=service.price,
            duration_minutes=service.duration_minutes,
        )
        merged = await self._session.merge(model)
        await self._session.commit()
        await self._session.refresh(merged)
        return Service(
            id=merged.id,
            name=merged.name,
            price=merged.price,
            duration_minutes=merged.duration_minutes,
        )

    async def delete(self, service_id: uuid.UUID) -> None:
        result = await self._session.execute(
            select(ServiceModel).where(ServiceModel.id == service_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
