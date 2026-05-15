"""Availability endpoints — public slot query and admin management."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.availability_use_cases import (
    GetSlotsUseCase,
    SetAvailabilityUseCase,
)
from app.infrastructure.database.repositories.appointment_repo import (
    SQLAlchemyAppointmentRepository,
)
from app.infrastructure.database.repositories.availability_repo import (
    SQLAlchemyAvailabilityRepository,
)
from app.infrastructure.database.repositories.service_repo import (
    SQLAlchemyServiceRepository,
)
from app.interfaces.api.dependencies import get_current_admin, get_session
from app.interfaces.schemas.availability_schema import AvailabilityCreate, AvailabilityOut, TimeSlot

router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("/", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
async def create_availability(
    body: AvailabilityCreate,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> AvailabilityOut:
    """Create availability for a barber (admin only)."""
    from datetime import datetime

    repo = SQLAlchemyAvailabilityRepository(session)
    use_case = SetAvailabilityUseCase(repo)
    start = datetime.strptime(body.start_time, "%H:%M").time()
    end = datetime.strptime(body.end_time, "%H:%M").time()
    availability = await use_case.execute(
        barber_id=body.barber_id,
        day_of_week=body.day_of_week,
        start_time=start,
        end_time=end,
    )
    return AvailabilityOut(
        id=availability.id,
        barber_id=availability.barber_id,
        day_of_week=availability.day_of_week,
        start_time=availability.start_time.strftime("%H:%M"),
        end_time=availability.end_time.strftime("%H:%M"),
    )


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_availability(
    availability_id: UUID,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> None:
    """Delete availability (admin only)."""
    repo = SQLAlchemyAvailabilityRepository(session)
    availability = await repo.get_by_id(availability_id)
    if availability is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability not found")
    await repo.delete(availability_id)


@router.get("/barbers/{barber_id}", response_model=list[AvailabilityOut])
async def list_barber_availability(
    barber_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> list[AvailabilityOut]:
    """List availability for a barber (public)."""
    repo = SQLAlchemyAvailabilityRepository(session)
    availabilities = await repo.list_by_barber(barber_id)
    return [
        AvailabilityOut(
            id=a.id,
            barber_id=a.barber_id,
            day_of_week=a.day_of_week,
            start_time=a.start_time.strftime("%H:%M"),
            end_time=a.end_time.strftime("%H:%M"),
        )
        for a in availabilities
    ]


@router.get("/barbers/{barber_id}/slots", response_model=list[TimeSlot])
async def get_barber_slots(
    barber_id: UUID,
    query_date: date = Query(..., alias="date"),
    service_id: UUID | None = Query(default=None, alias="service_id"),
    session: AsyncSession = Depends(get_session),
) -> list[TimeSlot]:
    """Get available time slots for a barber (public)."""
    availability_repo = SQLAlchemyAvailabilityRepository(session)
    appointment_repo = SQLAlchemyAppointmentRepository(session)
    service_repo = SQLAlchemyServiceRepository(session)
    use_case = GetSlotsUseCase(availability_repo, appointment_repo, service_repo)
    slots = await use_case.execute(
        barber_id=barber_id, query_date=query_date, service_id=service_id
    )
    return [TimeSlot(**slot) for slot in slots]
