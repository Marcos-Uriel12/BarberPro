"""Availability endpoints — public slot query."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.availability_use_cases import GetSlotsUseCase
from app.infrastructure.database.repositories.appointment_repo import (
    SQLAlchemyAppointmentRepository,
)
from app.infrastructure.database.repositories.availability_repo import (
    SQLAlchemyAvailabilityRepository,
)
from app.interfaces.api.dependencies import get_session
from app.interfaces.schemas.availability_schema import TimeSlot

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get(
    "/barbers/{barber_id}/slots",
    response_model=list[TimeSlot],
)
async def get_barber_slots(
    barber_id: UUID,
    query_date: date = Query(..., alias="date"),
    session: AsyncSession = Depends(get_session),
) -> list[TimeSlot]:
    """Get available time slots for a barber on a given date (public)."""
    availability_repo = SQLAlchemyAvailabilityRepository(session)
    appointment_repo = SQLAlchemyAppointmentRepository(session)
    use_case = GetSlotsUseCase(availability_repo, appointment_repo)
    slots = await use_case.execute(barber_id=barber_id, query_date=query_date)
    return [TimeSlot(**slot) for slot in slots]
