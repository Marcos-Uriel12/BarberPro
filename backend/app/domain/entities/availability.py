from dataclasses import dataclass, field
from datetime import time
from uuid import UUID


@dataclass
class Availability:
    barber_id: UUID
    day_of_week: int
    start_time: time
    end_time: time
    id: UUID | None = field(default=None)

    VALID_DAYS: tuple[int, ...] = (0, 1, 2, 3, 4, 5, 6)

    def __post_init__(self) -> None:
        if self.day_of_week not in self.VALID_DAYS:
            raise ValueError(
                f"day_of_week must be 0-6 (Monday-Sunday), got {self.day_of_week}"
            )
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")
