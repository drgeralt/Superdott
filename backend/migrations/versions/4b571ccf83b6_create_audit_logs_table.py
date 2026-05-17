"""create_audit_logs_table

Revision ID: 4b571ccf83b6
Revises: a8fe10b2ddb2
Create Date: 2026-05-16 20:11:11.868734

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '4b571ccf83b6'
down_revision: Union[str, None] = 'a8fe10b2ddb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('audit_logs',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('action', sa.Enum('PDI_GENERATED', 'STUDENT_LINKED', 'STUDENT_UNLINKED', 'SENSITIVE_DATA_ACCESSED', name='auditaction'), nullable=False),
    sa.Column('target_student_id', sa.Uuid(), nullable=True),
    sa.Column('details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_audit_logs_target_student_id'), 'audit_logs', ['target_student_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_audit_logs_user_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_target_student_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_created_at'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_action'), table_name='audit_logs')
    op.drop_table('audit_logs')
    op.execute("DROP TYPE IF EXISTS auditaction")