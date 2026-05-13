"""Appointment schemas — create, output, and status update models."""

from datetime import date, time
from uuid import UUID

from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    """Schema for creating a new appointment (public)."""

    barber_id: UUID
    service_id: UUID
    date: date
    time: time
    client_name: str = Field(min_length=1, max_length=100)
    client_phone: str = Field(pattern=r"^\+?[\d\s-]{7,20}$")


class AppointmentOut(BaseModel):
    """Schema for appointment output."""

    id: UUID
    date: date
    time: time
    barber_id: UUID
    service_id: UUID
    client_name: str
    client_phone: str
    status: str


class AppointmentStatusUpdate(BaseModel):
    """Schema for updating appointment status (admin only)."""

    status: str = Field(pattern=r"^(pending|confirmed|cancelled|completed)$")
