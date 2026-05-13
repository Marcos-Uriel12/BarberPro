"""Barber schemas — create, update, and output models."""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class BarberCreate(BaseModel):
    """Schema for creating a new barber."""

    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(pattern=r"^\+?[\d\s-]{7,20}$")
    price: Decimal | None = None


class BarberUpdate(BaseModel):
    """Schema for updating an existing barber. All fields optional."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, pattern=r"^\+?[\d\s-]{7,20}$")
    price: Decimal | None = None


class BarberOut(BarberCreate):
    """Schema for barber output — includes id."""

    id: UUID
