"""Service endpoints — public GET, admin CRUD."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.service_use_cases import (
    CreateServiceUseCase,
    DeleteServiceUseCase,
    GetServiceUseCase,
    ListServicesUseCase,
    UpdateServiceUseCase,
)
from app.infrastructure.database.repositories.service_repo import SQLAlchemyServiceRepository
from app.interfaces.api.dependencies import get_current_admin, get_session
from app.interfaces.schemas.service_schema import ServiceCreate, ServiceOut, ServiceUpdate

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=list[ServiceOut])
async def list_services(
    session: AsyncSession = Depends(get_session),
) -> list[ServiceOut]:
    """List all services (public)."""
    repo = SQLAlchemyServiceRepository(session)
    use_case = ListServicesUseCase(repo)
    services = await use_case.execute()
    return [
        ServiceOut(
            id=s.id,
            name=s.name,
            price=s.price,
            duration_minutes=s.duration_minutes,
        )
        for s in services
    ]


@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
async def create_service(
    body: ServiceCreate,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> ServiceOut:
    """Create a new service (admin only)."""
    repo = SQLAlchemyServiceRepository(session)
    use_case = CreateServiceUseCase(repo)
    service = await use_case.execute(
        name=body.name,
        price=body.price,
        duration_minutes=body.duration_minutes,
    )
    return ServiceOut(
        id=service.id,
        name=service.name,
        price=service.price,
        duration_minutes=service.duration_minutes,
    )


@router.put("/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: UUID,
    body: ServiceUpdate,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> ServiceOut:
    """Update a service (admin only)."""
    repo = SQLAlchemyServiceRepository(session)
    use_case = UpdateServiceUseCase(repo)
    service = await use_case.execute(
        service_id=service_id,
        name=body.name,
        price=body.price,
        duration_minutes=body.duration_minutes,
    )
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
    return ServiceOut(
        id=service.id,
        name=service.name,
        price=service.price,
        duration_minutes=service.duration_minutes,
    )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: UUID,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> None:
    """Delete a service (admin only)."""
    repo = SQLAlchemyServiceRepository(session)
    use_case = DeleteServiceUseCase(repo)
    deleted = await use_case.execute(service_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
