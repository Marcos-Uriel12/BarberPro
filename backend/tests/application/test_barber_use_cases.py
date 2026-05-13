"""Barber use case tests — saves and returns entities via SQLite."""

import uuid

import pytest

from app.application.use_cases.barber_use_cases import (
    CreateBarberUseCase,
    DeleteBarberUseCase,
    GetBarberUseCase,
    ListBarbersUseCase,
    UpdateBarberUseCase,
)
from app.domain.entities.barber import Barber
from app.infrastructure.database.repositories.barber_repo import (
    SQLAlchemyBarberRepository,
)


@pytest.mark.asyncio
async def test_create_barber_use_case_saves_and_returns_entity(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    use_case = CreateBarberUseCase(repo)
    barber = await use_case.execute(
        name="Carlos", phone="+5491112345678", price=150.0
    )
    assert barber.id is not None
    assert isinstance(barber.id, uuid.UUID)
    assert barber.name == "Carlos"
    assert barber.phone == "+5491112345678"


@pytest.mark.asyncio
async def test_get_barber_use_case_found(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    saved = await repo.save(Barber(name="Ana", phone="+549222"))
    use_case = GetBarberUseCase(repo)
    found = await use_case.execute(saved.id)
    assert found is not None
    assert found.name == "Ana"


@pytest.mark.asyncio
async def test_get_barber_use_case_not_found(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    use_case = GetBarberUseCase(repo)
    found = await use_case.execute(uuid.uuid4())
    assert found is None


@pytest.mark.asyncio
async def test_list_barbers_use_case(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    await repo.save(Barber(name="Carlos", phone="+549111"))
    await repo.save(Barber(name="Ana", phone="+549222"))
    use_case = ListBarbersUseCase(repo)
    barbers = await use_case.execute()
    assert len(barbers) == 2


@pytest.mark.asyncio
async def test_update_barber_use_case(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    saved = await repo.save(Barber(name="Carlos", phone="+549111"))
    use_case = UpdateBarberUseCase(repo)
    updated = await use_case.execute(saved.id, name="Carlos Updated")
    assert updated is not None
    assert updated.name == "Carlos Updated"
    assert updated.phone == "+549111"


@pytest.mark.asyncio
async def test_update_barber_not_found(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    use_case = UpdateBarberUseCase(repo)
    updated = await use_case.execute(uuid.uuid4(), name="Ghost")
    assert updated is None


@pytest.mark.asyncio
async def test_delete_barber_use_case(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    saved = await repo.save(Barber(name="Carlos", phone="+549111"))
    use_case = DeleteBarberUseCase(repo)
    result = await use_case.execute(saved.id)
    assert result is True
    # Verify it's gone
    found = await repo.get_by_id(saved.id)
    assert found is None


@pytest.mark.asyncio
async def test_delete_barber_not_found(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    use_case = DeleteBarberUseCase(repo)
    result = await use_case.execute(uuid.uuid4())
    assert result is False
