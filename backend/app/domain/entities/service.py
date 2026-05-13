from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID


@dataclass
class Service:
    name: str
    price: Decimal
    duration_minutes: int
    id: UUID | None = field(default=None)

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise ValueError("Service name cannot be empty")
        if self.price <= Decimal("0.00"):
            raise ValueError("Service price must be positive")
        if self.duration_minutes <= 0:
            raise ValueError("Service duration must be positive")
