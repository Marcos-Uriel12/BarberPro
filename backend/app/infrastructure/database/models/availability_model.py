import uuid
from datetime import time

from sqlalchemy import ForeignKey, Integer, Time, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, CommonMixin


class AvailabilityModel(Base, CommonMixin):
    __tablename__ = "availabilities"

    barber_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("barbers.id", ondelete="CASCADE"),
        nullable=False,
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    barber = relationship("BarberModel", back_populates="availabilities")
