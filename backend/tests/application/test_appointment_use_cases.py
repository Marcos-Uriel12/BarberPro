"""Appointment use case tests — creates pending appointment via SQLite."""

from datetime import date, time
from decimal import Decimal
from uuid import uuid4

import pytest

from app.application.use_cases.appointment_use_cases import (
    CreateAppointmentUseCase,
)
from app.domain.entities.barber import Barber
from app.domain.entities.service import Service
from app.infrastructure.database.repositories.appointment_repo import (
    SQLAlchemyAppointmentRepository,
)
from app.infrastructure.database.repositories.barber_repo import (
    SQLAlchemyBarberRepository,
)
from app.infrastructure.database.repositories.service_repo import (
    SQLAlchemyServiceRepository,
)


@pytest.mark.asyncio
async def test_create_appointment_use_case_creates_pending(async_session):
    """CreateAppointmentUseCase should save and return a pending appointment."""
    # Seed barber and service (required by FK constraints)
    barber_repo = SQLAlchemyBarberRepository(async_session)
    service_repo = SQLAlchemyServiceRepository(async_session)
    barber = await barber_repo.save(
        Barber(name="Carlos", phone="+5491112345678")
    )
    service = await service_repo.save(
        Service(
            name="Corte Clásico",
            price=Decimal("200.00"),
            duration_minutes=30,
        )
    )

    repo = SQLAlchemyAppointmentRepository(async_session)
    use_case = CreateAppointmentUseCase(repo)

    appt = await use_case.execute(
        barber_id=barber.id,
        service_id=service.id,
        appointment_date=date(2026, 6, 15),
        appointment_time=time(14, 0),
        client_name="Juan Pérez",
        client_phone="+5491122334455",
    )

    assert appt.id is not None
    assert appt.status == "pending"
    assert appt.client_name == "Juan Pérez"
    assert appt.client_phone == "+5491122334455"
    assert appt.date == date(2026, 6, 15)
    assert appt.time == time(14, 0)
    assert appt.barber_id == barber.id
    assert appt.service_id == service.id
