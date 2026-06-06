from sqlalchemy import CheckConstraint, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class TestRequest(Base, TimestampMixin):
    __tablename__ = "test_requests"
    __table_args__ = (
        CheckConstraint("tester_count > 0", name="ck_tester_count_positive"),
        CheckConstraint("duration_days > 0", name="ck_duration_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    app_name: Mapped[str] = mapped_column(String(120), nullable=False)
    play_store_url: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tester_count: Mapped[int] = mapped_column(nullable=False)
    duration_days: Mapped[int] = mapped_column(nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    screenshot_path: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open", index=True)

    owner = relationship("User", back_populates="requests")
    enrollments = relationship(
        "Enrollment", back_populates="request", cascade="all, delete-orphan"
    )
