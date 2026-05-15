"""remove price from barbers

Revision ID: 94209b93d9b6
Revises: 002_seed_admin
Create Date: 2026-05-14 22:43:29.465525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import NUMERIC


# revision identifiers, used by Alembic.
revision: str = '94209b93d9b6'
down_revision: Union[str, None] = '002_seed_admin'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('barbers', 'price')


def downgrade() -> None:
    op.add_column('barbers', sa.Column('price', NUMERIC(10, 2), nullable=True))
