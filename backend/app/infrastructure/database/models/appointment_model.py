import uuid
from datetime import date, time

from sqlalchemy import Date, ForeignKey, String, Time, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, CommonMixin


class AppointmentModel(Base, CommonMixin):
    __tablename__ = "appointments"

    date: Mapped[date] = mapped_column(Date, nullable=False)
    time: Mapped[time] = mapped_column(Time, nullable=False)
    barber_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("barbers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    service_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("services.id", ondelete="RESTRICT"),
        nullable=False,
    )
    client_name: Mapped[str] = mapped_column(String(100), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )

    barber = relationship("BarberModel", back_populates="appointments")
    service = relationship("ServiceModel", back_populates="appointments")
