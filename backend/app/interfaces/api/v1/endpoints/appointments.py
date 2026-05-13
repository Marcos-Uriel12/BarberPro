"""Appointment endpoints — public create, admin list and status update."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.appointment_use_cases import (
    CreateAppointmentUseCase,
    ListAppointmentsUseCase,
    UpdateAppointmentStatusUseCase,
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
from app.interfaces.api.dependencies import get_current_admin, get_session
from app.interfaces.schemas.appointment_schema import (
    AppointmentCreate,
    AppointmentOut,
    AppointmentStatusUpdate,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    body: AppointmentCreate,
    session: AsyncSession = Depends(get_session),
) -> AppointmentOut:
    """Create a new appointment (public)."""
    repo = SQLAlchemyAppointmentRepository(session)
    barber_repo = SQLAlchemyBarberRepository(session)
    service_repo = SQLAlchemyServiceRepository(session)
    use_case = CreateAppointmentUseCase(repo)
    appointment = await use_case.execute(
        barber_id=body.barber_id,
        service_id=body.service_id,
        appointment_date=body.date,
        appointment_time=body.time,
        client_name=body.client_name,
        client_phone=body.client_phone,
    )
    barber = await barber_repo.get_by_id(appointment.barber_id)
    service = await service_repo.get_by_id(appointment.service_id)
    return AppointmentOut(
        id=appointment.id,
        date=appointment.date,
        time=appointment.time,
        barber_name=barber.name if barber else "Unknown",
        service_name=service.name if service else "Unknown",
        client_name=appointment.client_name,
        client_phone=appointment.client_phone,
        status=appointment.status,
    )


@router.get("/", response_model=list[AppointmentOut])
async def list_appointments(
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> list[AppointmentOut]:
    """List appointments with optional status filter and pagination (admin only)."""
    repo = SQLAlchemyAppointmentRepository(session)
    barber_repo = SQLAlchemyBarberRepository(session)
    service_repo = SQLAlchemyServiceRepository(session)
    use_case = ListAppointmentsUseCase(repo)
    appointments = await use_case.execute(
        status=status_filter,
        page=page,
        size=size,
    )

    # batch-resolve barber and service names
    result: list[AppointmentOut] = []
    for a in appointments:
        barber = await barber_repo.get_by_id(a.barber_id)
        service = await service_repo.get_by_id(a.service_id)
        result.append(
            AppointmentOut(
                id=a.id,
                date=a.date,
                time=a.time,
                barber_name=barber.name if barber else "Unknown",
                service_name=service.name if service else "Unknown",
                client_name=a.client_name,
                client_phone=a.client_phone,
                status=a.status,
            )
        )
    return result


@router.put("/{appointment_id}/status", response_model=AppointmentOut)
async def update_appointment_status(
    appointment_id: UUID,
    body: AppointmentStatusUpdate,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> AppointmentOut:
    """Update appointment status (admin only)."""
    repo = SQLAlchemyAppointmentRepository(session)
    barber_repo = SQLAlchemyBarberRepository(session)
    service_repo = SQLAlchemyServiceRepository(session)
    use_case = UpdateAppointmentStatusUseCase(repo)
    appointment = await use_case.execute(
        appointment_id=appointment_id,
        new_status=body.status,
    )
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    barber = await barber_repo.get_by_id(appointment.barber_id)
    service = await service_repo.get_by_id(appointment.service_id)
    return AppointmentOut(
        id=appointment.id,
        date=appointment.date,
        time=appointment.time,
        barber_name=barber.name if barber else "Unknown",
        service_name=service.name if service else "Unknown",
        client_name=appointment.client_name,
        client_phone=appointment.client_phone,
        status=appointment.status,
    )
