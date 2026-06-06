def _register(client, email="alice@example.com", name="Alice", password="hunter2hunter"):
    return client.post(
        "/auth/register",
        json={"email": email, "name": name, "password": password},
    )


def test_register_success_sets_cookie(client):
    r = _register(client)
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "alice@example.com"
    assert body["name"] == "Alice"
    assert "apptest_session" in r.cookies


def test_register_duplicate_email_rejected(client):
    _register(client)
    r = _register(client)
    assert r.status_code == 400


def test_register_normalizes_email(client):
    r = _register(client, email="Alice@Example.COM")
    assert r.status_code == 201
    assert r.json()["email"] == "alice@example.com"


def test_register_weak_password_rejected(client):
    r = _register(client, password="short")
    assert r.status_code == 422


def test_login_success(client):
    _register(client)
    r = client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "hunter2hunter"},
    )
    assert r.status_code == 200
    assert "apptest_session" in r.cookies


def test_login_wrong_password_generic_error(client):
    _register(client)
    r = client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "wrongwrong1"},
    )
    assert r.status_code == 401
    assert r.json()["detail"] == "Invalid email or password"


def test_login_unknown_email_same_generic_error(client):
    r = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "whatever1"},
    )
    assert r.status_code == 401
    assert r.json()["detail"] == "Invalid email or password"


def test_me_requires_auth(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_me_returns_current_user(client):
    _register(client)
    r = client.get("/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == "alice@example.com"


def test_logout_clears_session(client):
    _register(client)
    r = client.post("/auth/logout")
    assert r.status_code == 204
    client.cookies.clear()
    r2 = client.get("/auth/me")
    assert r2.status_code == 401


def test_login_rate_limit_trips(client):
    _register(client)
    for _ in range(5):
        client.post(
            "/auth/login",
            json={"email": "alice@example.com", "password": "wrongwrong1"},
        )
    r = client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "wrongwrong1"},
    )
    assert r.status_code == 429
