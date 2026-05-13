"""Appointment use cases — create, list, update status."""

from datetime import date, time
from uuid import UUID

from app.domain.entities.appointment import Appointment
from app.domain.interfaces.repositories import AppointmentRepository


class CreateAppointmentUseCase:
    """Create a new appointment (public)."""

    def __init__(self, repo: AppointmentRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        barber_id: UUID,
        service_id: UUID,
        appointment_date: date,
        appointment_time: time,
        client_name: str,
        client_phone: str,
    ) -> Appointment:
        appointment = Appointment(
            date=appointment_date,
            time=appointment_time,
            barber_id=barber_id,
            service_id=service_id,
            client_name=client_name,
            client_phone=client_phone,
            status="pending",
        )
        return await self._repo.save(appointment)


class ListAppointmentsUseCase:
    """List appointments with optional status filter and pagination."""

    def __init__(self, repo: AppointmentRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        status: str | None = None,
        page: int = 1,
        size: int = 20,
    ) -> list[Appointment]:
        offset = (page - 1) * size
        return await self._repo.list(status=status, offset=offset, limit=size)


class UpdateAppointmentStatusUseCase:
    """Update appointment status (admin only)."""

    def __init__(self, repo: AppointmentRepository) -> None:
        self._repo = repo

    async def execute(self, appointment_id: UUID, new_status: str) -> Appointment | None:
        appointment = await self._repo.get_by_id(appointment_id)
        if appointment is None:
            return None
        updated = Appointment(
            id=appointment.id,
            date=appointment.date,
            time=appointment.time,
            barber_id=appointment.barber_id,
            service_id=appointment.service_id,
            client_name=appointment.client_name,
            client_phone=appointment.client_phone,
            status=new_status,
        )
        return await self._repo.save(updated)
