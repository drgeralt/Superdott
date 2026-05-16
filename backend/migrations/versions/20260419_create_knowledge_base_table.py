"""Create knowledge_base table

Revision ID: 20260419001
Revises: 5e94a2d25482
Create Date: 2026-04-19 23:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = "20260419001"
down_revision: str | None = "5e94a2d25482"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "knowledge_base",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("embedding", Vector(dim=3072), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("chunk_index", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("knowledge_base")
