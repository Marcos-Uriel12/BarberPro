from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import Base, CommonMixin


class AdminModel(Base, CommonMixin):
    __tablename__ = "admins"

    username: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
