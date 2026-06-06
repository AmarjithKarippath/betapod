from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.ratelimit import rate_limit
from app.models import Feedback, User
from app.schemas.feedback import FeedbackCreate

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    rate_limit(f"feedback:user:{user.id}", limit=10, window_seconds=3600)
    fb = Feedback(
        user_id=user.id,
        kind=payload.kind,
        message=payload.message.strip(),
        page_url=payload.page_url,
    )
    db.add(fb)
    db.commit()
    return {"ok": True, "id": fb.id}
