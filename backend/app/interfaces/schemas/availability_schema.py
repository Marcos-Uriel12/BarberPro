"""Availability schemas — time slots and availability management."""

from uuid import UUID

from pydantic import BaseModel, Field


class AvailabilityCreate(BaseModel):
    """Schema for setting barber availability."""

    barber_id: UUID
    day_of_week: int = Field(ge=0, le=6)
    start_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(pattern=r"^\d{2}:\d{2}$")


class AvailabilityOut(BaseModel):
    """Schema for availability output."""

    id: UUID
    barber_id: UUID
    day_of_week: int
    start_time: str
    end_time: str


class TimeSlot(BaseModel):
    """Schema for a single time slot on a given date."""

    start: str
    end: str
    available: bool
