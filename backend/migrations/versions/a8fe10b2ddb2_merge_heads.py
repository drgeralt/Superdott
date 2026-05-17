"""merge_heads

Revision ID: a8fe10b2ddb2
Revises: 20260419002, 6ea6fedc0a62
Create Date: 2026-05-16 20:08:25.497393

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8fe10b2ddb2'
down_revision: Union[str, None] = ('20260419002', '6ea6fedc0a62')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
