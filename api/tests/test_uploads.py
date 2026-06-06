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
    assert r.json()["screenshot_path"].startswith("/uploads/")


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
