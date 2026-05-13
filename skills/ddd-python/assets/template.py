"""
Template: Adding a new entity following DDD layered architecture.
Copy-paste this and adapt for your domain entity.
"""

# ─── Layer: DOMAIN ───────────────────────────────────────────────
# File: app/domain/entities/{entity}.py
# Zero external dependencies. Pure Python.

from dataclasses import dataclass
from uuid import uuid4


@dataclass
class MyEntity:
    id: str
    name: str
    is_active: bool = True

    @classmethod
    def create(cls, name: str) -> "MyEntity":
        return cls(id=str(uuid4()), name=name)


# ─── Layer: DOMAIN (contract) ────────────────────────────────────
# File: app/domain/interfaces/repositories.py

from abc import ABC, abstractmethod


class MyEntityRepository(ABC):
    @abstractmethod
    async def get_by_id(self, entity_id: str) -> MyEntity | None: ...

    @abstractmethod
    async def save(self, entity: MyEntity) -> MyEntity: ...

    @abstractmethod
    async def delete(self, entity_id: str) -> None: ...


# ─── Layer: APPLICATION ──────────────────────────────────────────
# File: app/application/use_cases/{entity}_use_cases.py
# Only imports from domain. Never touches FastAPI/SQLAlchemy.

from domain.entities.my_entity import MyEntity
from domain.interfaces.repositories import MyEntityRepository


class CreateMyEntityUseCase:
    def __init__(self, repo: MyEntityRepository):
        self._repo = repo

    async def execute(self, name: str) -> MyEntity:
        entity = MyEntity.create(name)
        return await self._repo.save(entity)


# ─── Layer: INFRASTRUCTURE ───────────────────────────────────────
# File: app/infrastructure/database/models/{entity}_model.py

from sqlalchemy import Boolean, Column, String
from app.infrastructure.database.base import Base


class MyEntityModel(Base):
    __tablename__ = "my_entities"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


# File: app/infrastructure/database/repositories/{entity}_repo.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from domain.entities.my_entity import MyEntity
from domain.interfaces.repositories import MyEntityRepository
from app.infrastructure.database.models.my_entity_model import MyEntityModel


class SQLAlchemyMyEntityRepository(MyEntityRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, entity_id: str) -> MyEntity | None:
        result = await self._session.execute(
            select(MyEntityModel).where(MyEntityModel.id == entity_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return MyEntity(id=model.id, name=model.name, is_active=model.is_active)

    async def save(self, entity: MyEntity) -> MyEntity:
        model = MyEntityModel(
            id=entity.id, name=entity.name, is_active=entity.is_active
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return entity

    async def delete(self, entity_id: str) -> None:
        result = await self._session.execute(
            select(MyEntityModel).where(MyEntityModel.id == entity_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()


# ─── Layer: INTERFACES ───────────────────────────────────────────
# File: app/interfaces/schemas/{entity}_schema.py

from pydantic import BaseModel


class MyEntityResponse(BaseModel):
    id: str
    name: str
    is_active: bool

    class Config:
        from_attributes = True


class MyEntityCreate(BaseModel):
    name: str


# File: app/interfaces/api/v1/endpoints/{entity}.py

from fastapi import APIRouter, Depends
from app.application.use_cases.my_entity_use_cases import CreateMyEntityUseCase
from app.interfaces.schemas.my_entity_schema import MyEntityCreate, MyEntityResponse
from app.infrastructure.database.repositories.my_entity_repo import (
    SQLAlchemyMyEntityRepository,
)
from app.infrastructure.database.session import get_session


router = APIRouter(prefix="/my-entities", tags=["My Entities"])


@router.post("/", response_model=MyEntityResponse)
async def create_entity(
    data: MyEntityCreate,
    session=Depends(get_session),
):
    repo = SQLAlchemyMyEntityRepository(session)
    use_case = CreateMyEntityUseCase(repo)
    entity = await use_case.execute(name=data.name)
    return MyEntityResponse(
        id=entity.id, name=entity.name, is_active=entity.is_active
    )


# ─── Layer: TESTS ────────────────────────────────────────────────
# File: tests/domain/test_{entity}.py

def test_my_entity_create():
    entity = MyEntity.create("test-entity")
    assert entity.name == "test-entity"
    assert entity.is_active is True
    assert entity.id is not None
