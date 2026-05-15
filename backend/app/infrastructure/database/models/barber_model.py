from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, CommonMixin


class BarberModel(Base, CommonMixin):
    __tablename__ = "barbers"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)

    barber_services = relationship(
        "BarberServiceModel",
        back_populates="barber",
        cascade="all, delete-orphan",
    )
    availabilities = relationship(
        "AvailabilityModel",
        back_populates="barber",
        cascade="all, delete-orphan",
    )
    appointments = relationship(
        "AppointmentModel",
        back_populates="barber",
    )