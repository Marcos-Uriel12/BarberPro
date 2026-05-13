from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID


@dataclass
class BarberService:
    barber_id: UUID
    service_id: UUID
    price: Decimal | None = None
    duration_minutes: int | None = None

    def __post_init__(self) -> None:
        if self.price is not None and self.price < Decimal("0.00"):
            raise ValueError("Barber service override price must be non-negative")
        if self.duration_minutes is not None and self.duration_minutes <= 0:
            raise ValueError("Barber service override duration must be positive")
