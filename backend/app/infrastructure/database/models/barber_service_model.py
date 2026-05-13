import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base


class BarberServiceModel(Base):
    __tablename__ = "barber_services"

    barber_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("barbers.id", ondelete="CASCADE"),
        primary_key=True,
    )
    service_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True,
    )
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    barber = relationship("BarberModel", back_populates="barber_services")
    service = relationship("ServiceModel", back_populates="barber_services")
