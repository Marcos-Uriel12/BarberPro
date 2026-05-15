"""Barber endpoints — public GET, admin CRUD."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.barber_use_cases import (
    CreateBarberUseCase,
    DeleteBarberUseCase,
    GetBarberUseCase,
    ListBarbersUseCase,
    UpdateBarberUseCase,
)
from app.infrastructure.database.repositories.barber_repo import SQLAlchemyBarberRepository
from app.interfaces.api.dependencies import get_current_admin, get_session
from app.interfaces.schemas.barber_schema import BarberCreate, BarberOut, BarberUpdate

router = APIRouter(prefix="/barbers", tags=["barbers"])


@router.get("/", response_model=list[BarberOut])
async def list_barbers(
    session: AsyncSession = Depends(get_session),
) -> list[BarberOut]:
    """List all barbers (public)."""
    repo = SQLAlchemyBarberRepository(session)
    use_case = ListBarbersUseCase(repo)
    barbers = await use_case.execute()
    return [
        BarberOut(id=b.id, name=b.name, phone=b.phone)
        for b in barbers
    ]


@router.post("/", response_model=BarberOut, status_code=status.HTTP_201_CREATED)
async def create_barber(
    body: BarberCreate,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> BarberOut:
    """Create a new barber (admin only)."""
    repo = SQLAlchemyBarberRepository(session)
    use_case = CreateBarberUseCase(repo)
    barber = await use_case.execute(
        name=body.name,
        phone=body.phone,
    )
    return BarberOut(
        id=barber.id,
        name=barber.name,
        phone=barber.phone,
    )


@router.get("/{barber_id}", response_model=BarberOut)
async def get_barber(
    barber_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> BarberOut:
    """Get a barber by ID (public)."""
    repo = SQLAlchemyBarberRepository(session)
    use_case = GetBarberUseCase(repo)
    barber = await use_case.execute(barber_id)
    if barber is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found",
        )
    return BarberOut(
        id=barber.id,
        name=barber.name,
        phone=barber.phone,
    )


@router.put("/{barber_id}", response_model=BarberOut)
async def update_barber(
    barber_id: UUID,
    body: BarberUpdate,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> BarberOut:
    """Update a barber (admin only)."""
    repo = SQLAlchemyBarberRepository(session)
    use_case = UpdateBarberUseCase(repo)
    barber = await use_case.execute(
        barber_id=barber_id,
        name=body.name,
        phone=body.phone,
    )
    if barber is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found",
        )
    return BarberOut(
        id=barber.id,
        name=barber.name,
        phone=barber.phone,
    )


@router.delete("/{barber_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_barber(
    barber_id: UUID,
    session: AsyncSession = Depends(get_session),
    _admin: dict = Depends(get_current_admin),
) -> None:
    """Delete a barber (admin only)."""
    repo = SQLAlchemyBarberRepository(session)
    use_case = DeleteBarberUseCase(repo)
    deleted = await use_case.execute(barber_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found",
        )