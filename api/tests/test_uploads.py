import io

from PIL import Image


def _register(client, email="owner@example.com"):
    client.post(
        "/auth/register",
        json={"email": email, "name": "Owner", "password": "hunter2hunter"},
    )


def _png_bytes(size=(64, 64)) -> bytes:
    img = Image.new("RGB", size, color=(120, 200, 80))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


PAYLOAD = {
    "app_name": "Cool App",
    "play_store_url": "https://play.google.com/store/apps/details?id=com.example",
    "category": "Productivity",
    "description": "Needs testing.",
    "tester_count": 3,
    "duration_days": 14,
    "location": "India",
}


def test_upload_screenshot_owner_only(client, tmp_path, monkeypatch):
    from app.core import config as cfg
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))

    _register(client)
    rid = client.post("/requests", json=PAYLOAD).json()["id"]

    r = client.post(
        f"/requests/{rid}/screenshot",
        files={"file": ("shot.png", _png_bytes(), "image/png")},
    )
    assert r.status_code == 200, r.text
    path = r.json()["screenshot_path"]
    assert path.startswith("/uploads/")
    stored = tmp_path / path.rsplit("/", 1)[-1]
    assert stored.is_file()
    assert stored.stat().st_size > 0


def test_static_uploads_served_with_security_headers(tmp_path):
    """Screenshots must be readable through StaticFiles + security middleware."""
    import asyncio

    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles

    from app.core.middleware import SecurityHeadersMiddleware

    img = tmp_path / "shot.png"
    img.write_bytes(_png_bytes())

    mini = FastAPI()
    mini.add_middleware(SecurityHeadersMiddleware)
    mini.mount("/uploads", StaticFiles(directory=str(tmp_path)), name="uploads")

    status: dict = {}
    body = bytearray()
    headers: dict[bytes, bytes] = {}

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        if message["type"] == "http.response.start":
            status["code"] = message["status"]
            headers.update(dict(message.get("headers", [])))
        elif message["type"] == "http.response.body":
            body.extend(message.get("body", b""))

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": "/uploads/shot.png",
        "raw_path": b"/uploads/shot.png",
        "query_string": b"",
        "headers": [(b"host", b"test")],
        "client": ("127.0.0.1", 123),
        "server": ("test", 80),
    }

    asyncio.run(mini(scope, receive, send))
    assert status["code"] == 200
    assert len(body) > 0
    assert headers.get(b"x-content-type-options") == b"nosniff"


def test_upload_rejects_non_image(client, tmp_path, monkeypatch):
    from app.core import config as cfg
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))

    _register(client)
    rid = client.post("/requests", json=PAYLOAD).json()["id"]

    r = client.post(
        f"/requests/{rid}/screenshot",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
    )
    assert r.status_code == 400


def test_upload_forbidden_for_non_owner(client, tmp_path, monkeypatch):
    from app.core import config as cfg
    monkeypatch.setattr(cfg.settings, "upload_dir", str(tmp_path))

    _register(client, "owner@example.com")
    rid = client.post("/requests", json=PAYLOAD).json()["id"]
    client.post("/auth/logout")
    client.cookies.clear()

    _register(client, "other@example.com")
    r = client.post(
        f"/requests/{rid}/screenshot",
        files={"file": ("shot.png", _png_bytes(), "image/png")},
    )
    assert r.status_code == 403
