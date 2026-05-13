from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base


class BarberServiceModel(Base):
    __tablename__ = "barber_services"

    barber_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("barbers.id", ondelete="CASCADE"),
        primary_key=True,
    )
    service_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True,
    )
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    barber = relationship("BarberModel", back_populates="barber_services")
    service = relationship("ServiceModel", back_populates="barber_services")
