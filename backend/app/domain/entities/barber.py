from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID


@dataclass
class Barber:
    name: str
    phone: str
    id: UUID | None = field(default=None)
    price: Decimal | None = field(default=None)

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise ValueError("Barber name cannot be empty")
        if not self.phone or not self.phone.strip():
            raise ValueError("Barber phone cannot be empty")
        if self.price is not None and self.price < Decimal("0.00"):
            raise ValueError("Barber price must be non-negative")
