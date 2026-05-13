import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.appointment import Appointment
from app.domain.interfaces.repositories import AppointmentRepository
from app.infrastructure.database.models.appointment_model import AppointmentModel


class SQLAlchemyAppointmentRepository(AppointmentRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(
        self, appointment_id: uuid.UUID
    ) -> Appointment | None:
        result = await self._session.execute(
            select(AppointmentModel).where(
                AppointmentModel.id == appointment_id
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Appointment(
            id=model.id,
            date=model.date,
            time=model.time,
            barber_id=model.barber_id,
            service_id=model.service_id,
            client_name=model.client_name,
            client_phone=model.client_phone,
            status=model.status,
        )

    async def list(
        self,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> list[Appointment]:
        stmt = select(AppointmentModel).order_by(
            AppointmentModel.date.desc(),
            AppointmentModel.time.desc(),
        )
        if status is not None:
            stmt = stmt.where(AppointmentModel.status == status)
        stmt = stmt.offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [
            Appointment(
                id=m.id,
                date=m.date,
                time=m.time,
                barber_id=m.barber_id,
                service_id=m.service_id,
                client_name=m.client_name,
                client_phone=m.client_phone,
                status=m.status,
            )
            for m in models
        ]

    async def save(self, appointment: Appointment) -> Appointment:
        model = AppointmentModel(
            id=appointment.id or uuid.uuid4(),
            date=appointment.date,
            time=appointment.time,
            barber_id=appointment.barber_id,
            service_id=appointment.service_id,
            client_name=appointment.client_name,
            client_phone=appointment.client_phone,
            status=appointment.status,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return Appointment(
            id=model.id,
            date=model.date,
            time=model.time,
            barber_id=model.barber_id,
            service_id=model.service_id,
            client_name=model.client_name,
            client_phone=model.client_phone,
            status=model.status,
        )

    async def delete(self, appointment_id: uuid.UUID) -> None:
        result = await self._session.execute(
            select(AppointmentModel).where(
                AppointmentModel.id == appointment_id
            )
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
