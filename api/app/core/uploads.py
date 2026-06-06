import io
import secrets
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.core.config import settings

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
EXT_FOR_FORMAT = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}


def _ensure_upload_dir() -> Path:
    p = Path(settings.upload_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_screenshot(upload: UploadFile) -> str:
    """Validate, re-encode, and store an uploaded image. Returns relative path."""
    raw = upload.file.read(settings.upload_max_bytes + 1)
    if len(raw) > settings.upload_max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.upload_max_bytes // 1024 // 1024}MB limit",
        )

    try:
        img = Image.open(io.BytesIO(raw))
        img.verify()
        img = Image.open(io.BytesIO(raw))
    except (UnidentifiedImageError, Exception) as e:
        raise HTTPException(status_code=400, detail="Invalid image file") from e

    src_format = img.format
    if src_format not in ALLOWED_FORMATS:
        raise HTTPException(status_code=400, detail="Image must be JPEG, PNG, or WEBP")

    max_dim = settings.upload_max_dimension
    if img.width > max_dim or img.height > max_dim:
        img.thumbnail((max_dim, max_dim))

    if src_format == "JPEG" and img.mode != "RGB":
        img = img.convert("RGB")
    elif src_format in ("PNG", "WEBP") and img.mode == "P":
        img = img.convert("RGBA")

    ext = EXT_FOR_FORMAT[src_format]
    filename = f"{secrets.token_urlsafe(16)}{ext}"
    out_path = _ensure_upload_dir() / filename

    save_kwargs: dict = {"optimize": True} if src_format in ("JPEG", "PNG") else {}
    buf = io.BytesIO()
    img.save(buf, format=src_format, **save_kwargs)
    out_path.write_bytes(buf.getvalue())

    return f"/uploads/{filename}"
