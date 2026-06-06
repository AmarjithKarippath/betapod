from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import COOKIE_NAME, get_current_user
from app.core.ratelimit import rate_limit
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas.auth import LoginIn, RegisterIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

INVALID_CREDS = "Invalid email or password"


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.api_cookie_secure,
        samesite="lax",
        max_age=settings.api_jwt_expire_days * 24 * 3600,
        domain=settings.api_cookie_domain or None,
        path="/",
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> UserOut:
    ip = _client_ip(request)
    rate_limit(f"register:ip:{ip}", limit=5, window_seconds=900)

    email = payload.email.lower().strip()
    rate_limit(f"register:email:{email}", limit=3, window_seconds=3600)

    existing = db.query(User).filter(User.email == email).first()
    if existing is not None:
        # Generic-ish: don't say "email taken" to avoid enumeration.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create account with the provided details.",
        )

    user = User(
        email=email,
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return UserOut.model_validate(user)


@router.post("/login", response_model=UserOut)
def login(
    payload: LoginIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> UserOut:
    ip = _client_ip(request)
    email = payload.email.lower().strip()

    rate_limit(f"login:ip:{ip}", limit=10, window_seconds=900)
    rate_limit(f"login:email:{email}", limit=5, window_seconds=900)

    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_CREDS)

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return UserOut.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(
        key=COOKIE_NAME,
        domain=settings.api_cookie_domain or None,
        path="/",
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)
