from fastapi.testclient import TestClient

from app.main import app


def _register(client, email, name="User"):
    return client.post(
        "/auth/register",
        json={"email": email, "name": name, "password": "hunter2hunter"},
    )


VALID_PAYLOAD = {
    "app_name": "Cool App",
    "play_store_url": "https://play.google.com/store/apps/details?id=com.example",
    "category": "Productivity",
    "description": "A wonderful app that needs testing.",
    "tester_count": 3,
    "duration_days": 14,
    "location": "India",
}


def test_create_request_requires_auth(client):
    r = client.post("/requests", json=VALID_PAYLOAD)
    assert r.status_code == 401


def test_create_and_get_request(client):
    _register(client, "owner@example.com")
    r = client.post("/requests", json=VALID_PAYLOAD)
    assert r.status_code == 201, r.text
    rid = r.json()["id"]
    assert r.json()["is_owner"] is True
    assert r.json()["enrolled_count"] == 0

    r2 = client.get(f"/requests/{rid}")
    assert r2.status_code == 200
    assert r2.json()["app_name"] == "Cool App"


def test_list_requests_filters(client):
    _register(client, "owner@example.com")
    client.post("/requests", json={**VALID_PAYLOAD, "category": "Games"})
    client.post("/requests", json={**VALID_PAYLOAD, "category": "Productivity"})

    r = client.get("/requests?category=Games")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["category"] == "Games"


def test_owner_cannot_enroll_in_own(client):
    _register(client, "owner@example.com")
    rid = client.post("/requests", json=VALID_PAYLOAD).json()["id"]
    r = client.post(f"/requests/{rid}/enroll")
    assert r.status_code == 400


def test_enroll_and_unenroll(client):
    _register(client, "owner@example.com")
    rid = client.post("/requests", json=VALID_PAYLOAD).json()["id"]
    client.post("/auth/logout")
    client.cookies.clear()

    _register(client, "tester@example.com")
    r = client.post(f"/requests/{rid}/enroll")
    assert r.status_code == 201
    # Idempotency: enrolling twice fails
    r2 = client.post(f"/requests/{rid}/enroll")
    assert r2.status_code == 409

    r3 = client.delete(f"/requests/{rid}/enroll")
    assert r3.status_code == 204


def test_enrollment_cap_enforced(client):
    _register(client, "owner@example.com")
    payload = {**VALID_PAYLOAD, "tester_count": 2}
    rid = client.post("/requests", json=payload).json()["id"]
    client.post("/auth/logout")
    client.cookies.clear()

    for i in range(3):
        c = TestClient(app)
        _register(c, f"t{i}@example.com")
        r = c.post(f"/requests/{rid}/enroll")
        if i < 2:
            assert r.status_code == 201, f"tester {i} should succeed: {r.text}"
        else:
            assert r.status_code == 409, f"tester {i} should hit cap: {r.text}"


def test_enrollments_owner_only(client):
    _register(client, "owner@example.com")
    rid = client.post("/requests", json=VALID_PAYLOAD).json()["id"]
    client.post("/auth/logout")
    client.cookies.clear()

    _register(client, "tester@example.com")
    client.post(f"/requests/{rid}/enroll")

    # Tester tries to view enrollments — forbidden
    r = client.get(f"/requests/{rid}/enrollments")
    assert r.status_code == 403

    client.post("/auth/logout")
    client.cookies.clear()
    client.post("/auth/login", json={"email": "owner@example.com", "password": "hunter2hunter"})

    r2 = client.get(f"/requests/{rid}/enrollments")
    assert r2.status_code == 200
    assert len(r2.json()) == 1
    assert r2.json()[0]["tester_email"] == "tester@example.com"


def test_anonymous_can_list(client):
    _register(client, "owner@example.com")
    client.post("/requests", json=VALID_PAYLOAD)
    client.post("/auth/logout")
    client.cookies.clear()

    r = client.get("/requests")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["is_owner"] is False
    assert r.json()[0]["is_enrolled"] is False
