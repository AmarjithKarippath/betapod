"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-06

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("email_verified_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "test_requests",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "owner_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("app_name", sa.String(120), nullable=False),
        sa.Column("play_store_url", sa.String(500), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("tester_count", sa.Integer, nullable=False),
        sa.Column("duration_days", sa.Integer, nullable=False),
        sa.Column("location", sa.String(120), nullable=False),
        sa.Column("screenshot_path", sa.String(255)),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("tester_count > 0", name="ck_tester_count_positive"),
        sa.CheckConstraint("duration_days > 0", name="ck_duration_positive"),
    )
    op.create_index("ix_test_requests_owner_id", "test_requests", ["owner_id"])
    op.create_index("ix_test_requests_category", "test_requests", ["category"])
    op.create_index("ix_test_requests_location", "test_requests", ["location"])
    op.create_index("ix_test_requests_status", "test_requests", ["status"])

    op.create_table(
        "enrollments",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "request_id",
            sa.Integer,
            sa.ForeignKey("test_requests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tester_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("request_id", "tester_id", name="uq_enrollment_request_tester"),
    )
    op.create_index("ix_enrollments_request_id", "enrollments", ["request_id"])
    op.create_index("ix_enrollments_tester_id", "enrollments", ["tester_id"])


def downgrade() -> None:
    op.drop_table("enrollments")
    op.drop_table("test_requests")
    op.drop_table("users")
