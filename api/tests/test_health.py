from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_responds():
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "db" in body
    assert "redis" in body
