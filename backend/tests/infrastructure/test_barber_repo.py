"""SQLAlchemy barber repository integration tests."""

import uuid

import pytest

from app.domain.entities.barber import Barber
from app.infrastructure.database.repositories.barber_repo import (
    SQLAlchemyBarberRepository,
)


@pytest.mark.asyncio
async def test_barber_repo_save_returns_with_id(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    barber = Barber(name="Carlos", phone="+5491112345678")
    saved = await repo.save(barber)
    assert saved.id is not None
    assert isinstance(saved.id, uuid.UUID)
    assert saved.name == "Carlos"
    assert saved.phone == "+5491112345678"


@pytest.mark.asyncio
async def test_barber_repo_get_by_id_found(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    barber = Barber(name="Carlos", phone="+5491112345678")
    saved = await repo.save(barber)
    fetched = await repo.get_by_id(saved.id)
    assert fetched is not None
    assert fetched.id == saved.id
    assert fetched.name == "Carlos"


@pytest.mark.asyncio
async def test_barber_repo_get_by_id_not_found(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    fetched = await repo.get_by_id(uuid.uuid4())
    assert fetched is None


@pytest.mark.asyncio
async def test_barber_repo_list_empty(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    barbers = await repo.list()
    assert barbers == []


@pytest.mark.asyncio
async def test_barber_repo_list_returns_all(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    await repo.save(Barber(name="Carlos", phone="+549111"))
    await repo.save(Barber(name="Ana", phone="+549222"))
    barbers = await repo.list()
    assert len(barbers) == 2
    names = {b.name for b in barbers}
    assert names == {"Carlos", "Ana"}


@pytest.mark.asyncio
async def test_barber_repo_delete_existing(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    saved = await repo.save(Barber(name="Carlos", phone="+549111"))
    await repo.delete(saved.id)
    fetched = await repo.get_by_id(saved.id)
    assert fetched is None


@pytest.mark.asyncio
async def test_barber_repo_delete_non_existing(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    # Should not raise — delete is idempotent
    await repo.delete(uuid.uuid4())
