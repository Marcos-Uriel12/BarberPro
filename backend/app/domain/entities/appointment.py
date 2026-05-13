from dataclasses import dataclass, field
from datetime import date, time
from uuid import UUID


@dataclass
class Appointment:
    date: date
    time: time
    barber_id: UUID
    service_id: UUID
    client_name: str
    client_phone: str
    id: UUID | None = field(default=None)
    status: str = "pending"

    VALID_STATUSES: tuple[str, ...] = (
        "pending",
        "confirmed",
        "cancelled",
        "completed",
    )

    def __post_init__(self) -> None:
        if self.status not in self.VALID_STATUSES:
            raise ValueError(
                f"Invalid status: {self.status}. "
                f"Must be one of {self.VALID_STATUSES}"
            )
        if not self.client_name or not self.client_name.strip():
            raise ValueError("Client name cannot be empty")
        if not self.client_phone or not self.client_phone.strip():
            raise ValueError("Client phone cannot be empty")
