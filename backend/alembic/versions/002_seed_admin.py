"""Seed admin user

Revision ID: 002_seed_admin
Revises: 4088b6d7567b
Create Date: 2026-05-13 18:00:00.000000

"""

from typing import Sequence, Union

import bcrypt
from alembic import op
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = "002_seed_admin"
down_revision: Union[str, None] = "4088b6d7567b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Insert the default admin user with a bcrypt-hashed password."""
    from app.config.settings import settings

    hashed = bcrypt.hashpw(
        settings.ADMIN_PASSWORD.encode(), bcrypt.gensalt()
    ).decode()

    op.execute(
        text(
            "INSERT INTO admins (id, username, hashed_password, created_at, updated_at) "
            "VALUES (gen_random_uuid(), :username, :hashed_password, now(), now()) "
            "ON CONFLICT (username) DO NOTHING"
        ).bindparams(username=settings.ADMIN_USERNAME, hashed_password=hashed)
    )


def downgrade() -> None:
    """Remove the seeded admin user."""
    from app.config.settings import settings

    op.execute(
        text(
            "DELETE FROM admins WHERE username = :username"
        ).bindparams(username=settings.ADMIN_USERNAME)
    )
