from datetime import time

from sqlalchemy import ForeignKey, Integer, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, CommonMixin


class AvailabilityModel(Base, CommonMixin):
    __tablename__ = "availabilities"

    barber_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("barbers.id", ondelete="CASCADE"),
        nullable=False,
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    barber = relationship("BarberModel", back_populates="availabilities")
