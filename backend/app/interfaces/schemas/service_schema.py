"""Service schemas — create, update, and output models."""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ServiceCreate(BaseModel):
    """Schema for creating a new service."""

    name: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=Decimal("0.00"))
    duration_minutes: int = Field(gt=0)


class ServiceUpdate(BaseModel):
    """Schema for updating an existing service. All fields optional."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    price: Decimal | None = Field(default=None, gt=Decimal("0.00"))
    duration_minutes: int | None = Field(default=None, gt=0)


class ServiceOut(ServiceCreate):
    """Schema for service output — includes id."""

    id: UUID
