from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.cache import (
    REQUEST_LIST_PREFIX,
    cache_get,
    cache_set,
    invalidate_request_list_cache,
)
from app.core.db import get_db
from app.core.deps import get_current_user, get_optional_user
from app.core.ratelimit import rate_limit
from app.core.uploads import save_screenshot
from app.models import Enrollment, TestRequest, User
from app.schemas.requests import EnrollmentOut, RequestCreate, RequestOut

router = APIRouter(prefix="/requests", tags=["requests"])


def _serialize(req: TestRequest, current_user: User | None, enrolled_count: int) -> RequestOut:
    is_enrolled = False
    is_owner = False
    if current_user is not None:
        is_owner = req.owner_id == current_user.id
        is_enrolled = any(e.tester_id == current_user.id for e in req.enrollments)
    return RequestOut(
        id=req.id,
        owner_id=req.owner_id,
        app_name=req.app_name,
        play_store_url=req.play_store_url,
        category=req.category,
        description=req.description,
        tester_count=req.tester_count,
        duration_days=req.duration_days,
        location=req.location,
        screenshot_path=req.screenshot_path,
        status=req.status,
        created_at=req.created_at,
        enrolled_count=enrolled_count,
        is_enrolled=is_enrolled,
        is_owner=is_owner,
    )


@router.post("", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: RequestCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RequestOut:
    rate_limit(f"create_request:user:{user.id}", limit=10, window_seconds=3600)
    req = TestRequest(
        owner_id=user.id,
        app_name=payload.app_name.strip(),
        play_store_url=str(payload.play_store_url),
        category=payload.category.strip(),
        description=payload.description.strip(),
        tester_count=payload.tester_count,
        duration_days=payload.duration_days,
        location=payload.location.strip(),
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    invalidate_request_list_cache()
    return _serialize(req, user, enrolled_count=0)


@router.get("", response_model=list[RequestOut])
def list_requests(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
    category: str | None = None,
    location: str | None = None,
    has_open_slots: bool = False,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[RequestOut]:
    cache_key = (
        f"{REQUEST_LIST_PREFIX}{category or ''}:{location or ''}:"
        f"{int(has_open_slots)}:{limit}:{offset}"
    )
    if current_user is None:
        cached = cache_get(cache_key)
        if cached is not None:
            return [RequestOut(**row) for row in cached]

    q = select(TestRequest).order_by(TestRequest.created_at.desc())
    if category:
        q = q.where(TestRequest.category == category)
    if location:
        q = q.where(TestRequest.location == location)
    q = q.limit(limit).offset(offset)
    rows = db.scalars(q).all()

    if not rows:
        return []

    counts = dict(
        db.execute(
            select(Enrollment.request_id, func.count(Enrollment.id))
            .where(Enrollment.request_id.in_([r.id for r in rows]))
            .group_by(Enrollment.request_id)
        ).all()
    )

    out: list[RequestOut] = []
    for r in rows:
        enrolled = counts.get(r.id, 0)
        if has_open_slots and enrolled >= r.tester_count:
            continue
        out.append(_serialize(r, current_user, enrolled))

    if current_user is None:
        cache_set(cache_key, [o.model_dump() for o in out], ttl_seconds=30)
    return out


@router.get("/{request_id}", response_model=RequestOut)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> RequestOut:
    req = db.get(TestRequest, request_id)
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    enrolled = db.scalar(
        select(func.count(Enrollment.id)).where(Enrollment.request_id == req.id)
    ) or 0
    return _serialize(req, current_user, enrolled)


@router.post("/{request_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll(
    request_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    rate_limit(f"enroll:user:{user.id}", limit=30, window_seconds=3600)
    # Lock the request row, count enrollments, insert if under cap.
    req = db.execute(
        select(TestRequest).where(TestRequest.id == request_id).with_for_update()
    ).scalar_one_or_none()
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.owner_id == user.id:
        raise HTTPException(status_code=400, detail="Owners cannot enroll in their own request")

    current = db.scalar(
        select(func.count(Enrollment.id)).where(Enrollment.request_id == req.id)
    ) or 0
    if current >= req.tester_count:
        raise HTTPException(status_code=409, detail="Request is full")

    enrollment = Enrollment(request_id=req.id, tester_id=user.id)
    db.add(enrollment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already enrolled") from None
    invalidate_request_list_cache()
    return {"ok": True}


@router.delete("/{request_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
def unenroll(
    request_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = (
        db.query(Enrollment)
        .filter(Enrollment.request_id == request_id, Enrollment.tester_id == user.id)
        .delete()
    )
    db.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Not enrolled")
    invalidate_request_list_cache()


@router.post("/{request_id}/screenshot", response_model=RequestOut)
def upload_screenshot(
    request_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RequestOut:
    req = db.get(TestRequest, request_id)
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the owner can upload a screenshot")

    rel_path = save_screenshot(file)
    req.screenshot_path = rel_path
    db.commit()
    db.refresh(req)
    invalidate_request_list_cache()

    enrolled = db.scalar(
        select(func.count(Enrollment.id)).where(Enrollment.request_id == req.id)
    ) or 0
    return _serialize(req, user, enrolled)


@router.get("/{request_id}/enrollments", response_model=list[EnrollmentOut])
def list_enrollments(
    request_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[EnrollmentOut]:
    req = db.get(TestRequest, request_id)
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the request owner can view enrollments")

    rows = (
        db.query(Enrollment, User)
        .join(User, User.id == Enrollment.tester_id)
        .filter(Enrollment.request_id == request_id)
        .order_by(Enrollment.created_at.asc())
        .all()
    )
    return [
        EnrollmentOut(
            id=e.id,
            tester_id=u.id,
            tester_email=u.email,
            tester_name=u.name,
            created_at=e.created_at,
        )
        for e, u in rows
    ]
