from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.admin import Admin
from app.domain.entities.appointment import Appointment
from app.domain.entities.availability import Availability
from app.domain.entities.barber import Barber
from app.domain.entities.barber_service import BarberService
from app.domain.entities.service import Service


class BarberRepository(ABC):
    @abstractmethod
    async def get_by_id(self, barber_id: UUID) -> Barber | None:
        ...

    @abstractmethod
    async def list(self) -> list[Barber]:
        ...

    @abstractmethod
    async def save(self, barber: Barber) -> Barber:
        ...

    @abstractmethod
    async def delete(self, barber_id: UUID) -> None:
        ...


class ServiceRepository(ABC):
    @abstractmethod
    async def get_by_id(self, service_id: UUID) -> Service | None:
        ...

    @abstractmethod
    async def list(self) -> list[Service]:
        ...

    @abstractmethod
    async def save(self, service: Service) -> Service:
        ...

    @abstractmethod
    async def delete(self, service_id: UUID) -> None:
        ...


class BarberServiceRepository(ABC):
    @abstractmethod
    async def get_by_barber(self, barber_id: UUID) -> list[BarberService]:
        ...

    @abstractmethod
    async def save(self, barber_service: BarberService) -> BarberService:
        ...

    @abstractmethod
    async def delete(self, barber_id: UUID, service_id: UUID) -> None:
        ...


class AvailabilityRepository(ABC):
    @abstractmethod
    async def get_by_id(self, availability_id: UUID) -> Availability | None:
        ...

    @abstractmethod
    async def list_by_barber(self, barber_id: UUID) -> list[Availability]:
        ...

    @abstractmethod
    async def save(self, availability: Availability) -> Availability:
        ...

    @abstractmethod
    async def delete(self, availability_id: UUID) -> None:
        ...


class AppointmentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, appointment_id: UUID) -> Appointment | None:
        ...

    @abstractmethod
    async def list(
        self, status: str | None = None, offset: int = 0, limit: int = 20
    ) -> list[Appointment]:
        ...

    @abstractmethod
    async def save(self, appointment: Appointment) -> Appointment:
        ...

    @abstractmethod
    async def delete(self, appointment_id: UUID) -> None:
        ...


class AdminRepository(ABC):
    @abstractmethod
    async def get_by_id(self, admin_id: UUID) -> Admin | None:
        ...

    @abstractmethod
    async def get_by_username(self, username: str) -> Admin | None:
        ...

    @abstractmethod
    async def save(self, admin: Admin) -> Admin:
        ...

    @abstractmethod
    async def delete(self, admin_id: UUID) -> None:
        ...
