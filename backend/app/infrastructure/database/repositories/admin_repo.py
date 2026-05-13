import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.admin import Admin
from app.domain.interfaces.repositories import AdminRepository
from app.infrastructure.database.models.admin_model import AdminModel


class SQLAlchemyAdminRepository(AdminRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, admin_id: uuid.UUID) -> Admin | None:
        result = await self._session.execute(
            select(AdminModel).where(AdminModel.id == admin_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Admin(
            id=model.id,
            username=model.username,
            hashed_password=model.hashed_password,
        )

    async def get_by_username(self, username: str) -> Admin | None:
        result = await self._session.execute(
            select(AdminModel).where(AdminModel.username == username)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Admin(
            id=model.id,
            username=model.username,
            hashed_password=model.hashed_password,
        )

    async def list(self) -> list[Admin]:
        result = await self._session.execute(
            select(AdminModel).order_by(AdminModel.username)
        )
        models = result.scalars().all()
        return [
            Admin(id=m.id, username=m.username, hashed_password=m.hashed_password)
            for m in models
        ]

    async def save(self, admin: Admin) -> Admin:
        model = AdminModel(
            id=admin.id or uuid.uuid4(),
            username=admin.username,
            hashed_password=admin.hashed_password,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return Admin(
            id=model.id,
            username=model.username,
            hashed_password=model.hashed_password,
        )

    async def delete(self, admin_id: uuid.UUID) -> None:
        result = await self._session.execute(
            select(AdminModel).where(AdminModel.id == admin_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.commit()
