from decimal import Decimal

from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, CommonMixin


class ServiceModel(Base, CommonMixin):
    __tablename__ = "services"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)

    barber_services = relationship(
        "BarberServiceModel",
        back_populates="service",
        cascade="all, delete-orphan",
    )
    appointments = relationship(
        "AppointmentModel",
        back_populates="service",
    )
