import csv
import io
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_admin
from app.models import Enrollment, Feedback, TestRequest, User

router = APIRouter(prefix="/admin", tags=["admin"])


def _series_by_day(rows: list[tuple], days: int) -> list[dict]:
    by_date = {str(d): int(c) for d, c in rows}
    today = datetime.now(UTC).date()
    out = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        out.append({"date": str(d), "count": by_date.get(str(d), 0)})
    return out


@router.get("/stats")
def stats(
    days: int = 30,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> dict:
    days = max(1, min(days, 365))
    since = datetime.now(UTC) - timedelta(days=days - 1)
    since_date = since.date()

    user_rows = db.execute(
        select(func.date(User.created_at), func.count(User.id))
        .where(func.date(User.created_at) >= since_date)
        .group_by(func.date(User.created_at))
    ).all()

    req_rows = db.execute(
        select(func.date(TestRequest.created_at), func.count(TestRequest.id))
        .where(func.date(TestRequest.created_at) >= since_date)
        .group_by(func.date(TestRequest.created_at))
    ).all()

    enr_rows = db.execute(
        select(func.date(Enrollment.created_at), func.count(Enrollment.id))
        .where(func.date(Enrollment.created_at) >= since_date)
        .group_by(func.date(Enrollment.created_at))
    ).all()

    return {
        "totals": {
            "users": db.scalar(select(func.count(User.id))) or 0,
            "requests": db.scalar(select(func.count(TestRequest.id))) or 0,
            "enrollments": db.scalar(select(func.count(Enrollment.id))) or 0,
            "feedback": db.scalar(select(func.count(Feedback.id))) or 0,
        },
        "by_day": {
            "users": _series_by_day(user_rows, days),
            "requests": _series_by_day(req_rows, days),
            "enrollments": _series_by_day(enr_rows, days),
        },
    }


@router.get("/export/requests.csv")
def export_requests_csv(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> StreamingResponse:
    requests = db.scalars(
        select(TestRequest).order_by(TestRequest.created_at.desc())
    ).all()

    # Materialize everything up front — the DB session closes before the
    # StreamingResponse generator runs.
    enrollments_by_req: dict[int, list[str]] = {}
    enr_rows = (
        db.query(Enrollment.request_id, User.email)
        .join(User, User.id == Enrollment.tester_id)
        .order_by(Enrollment.created_at.asc())
        .all()
    )
    for req_id, email in enr_rows:
        enrollments_by_req.setdefault(req_id, []).append(email)

    rows_to_write = []
    for r in requests:
        owner = r.owner
        emails = enrollments_by_req.get(r.id, [])
        rows_to_write.append([
            r.id,
            r.created_at.isoformat(),
            r.app_name,
            r.category,
            r.location,
            r.play_store_url,
            r.tester_count,
            r.duration_days,
            r.status,
            r.description,
            owner.name if owner else "",
            owner.email if owner else "",
            len(emails),
            "; ".join(emails),
        ])

    def _stream():
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow([
            "request_id",
            "created_at",
            "app_name",
            "category",
            "location",
            "play_store_url",
            "tester_count",
            "duration_days",
            "status",
            "description",
            "owner_name",
            "owner_email",
            "enrolled_count",
            "enrolled_emails",
        ])
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)

        for row in rows_to_write:
            w.writerow(row)
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)

    filename = f"requests-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        _stream(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/feedback.csv")
def export_feedback_csv(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> StreamingResponse:
    rows = (
        db.query(Feedback, User)
        .outerjoin(User, User.id == Feedback.user_id)
        .order_by(Feedback.created_at.desc())
        .all()
    )

    def _stream():
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow([
            "feedback_id",
            "created_at",
            "kind",
            "user_id",
            "user_name",
            "user_email",
            "page_url",
            "message",
        ])
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)

        for fb, u in rows:
            w.writerow([
                fb.id,
                fb.created_at.isoformat(),
                fb.kind,
                fb.user_id or "",
                u.name if u else "",
                u.email if u else "",
                fb.page_url or "",
                fb.message,
            ])
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)

    filename = f"feedback-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        _stream(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/users.csv")
def export_users_csv(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> StreamingResponse:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()

    req_counts = dict(
        db.execute(
            select(TestRequest.owner_id, func.count(TestRequest.id)).group_by(
                TestRequest.owner_id
            )
        ).all()
    )
    enr_counts = dict(
        db.execute(
            select(Enrollment.tester_id, func.count(Enrollment.id)).group_by(
                Enrollment.tester_id
            )
        ).all()
    )

    rows_to_write = [
        [
            u.id,
            u.created_at.isoformat(),
            u.name,
            u.email,
            u.is_admin,
            req_counts.get(u.id, 0),
            enr_counts.get(u.id, 0),
        ]
        for u in users
    ]

    def _stream():
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow([
            "user_id",
            "created_at",
            "name",
            "email",
            "is_admin",
            "requests_created",
            "enrollments_made",
        ])
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)

        for row in rows_to_write:
            w.writerow(row)
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)

    filename = f"users-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        _stream(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
