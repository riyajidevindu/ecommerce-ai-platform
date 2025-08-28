from fastapi.testclient import TestClient
from app.main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import get_db
from app.models import user as user_model, refresh_token, revoked_token
import os


# Use a separate SQLite DB for tests (file-based to persist between requests)
TEST_DB_URL = "sqlite:///./test_auth.db"
os.environ["DATABASE_URL"] = TEST_DB_URL
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
user_model.Base.metadata.create_all(bind=engine)
refresh_token.Base.metadata.create_all(bind=engine)
revoked_token.Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_login_update_profile():
    # Register
    r = client.post("/api/v1/auth/register", json={"username": "alice", "email": "alice@example.com", "password": "Secret123!"})
    assert r.status_code == 200, r.text
    _ = r.json()["id"]  # ensure id exists

    # Login
    r2 = client.post("/api/v1/auth/login", data={"username": "alice@example.com", "password": "Secret123!"})
    assert r2.status_code == 200, r2.text
    token = r2.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get me
    r3 = client.get("/api/v1/users/me", headers=headers)
    assert r3.status_code == 200
    assert r3.json()["email"] == "alice@example.com"

    # Update username & email
    r4 = client.patch("/api/v1/users/me", json={"username": "alice2", "email": "alice2@example.com"}, headers=headers)
    assert r4.status_code == 200, r4.text
    assert r4.json()["username"] == "alice2"
    assert r4.json()["email"] == "alice2@example.com"

    # Attempt password change with wrong current password
    r5 = client.patch("/api/v1/users/me", json={"current_password": "Wrong", "new_password": "NewSecret123!"}, headers=headers)
    assert r5.status_code == 400

    # Correct password change
    r6 = client.patch("/api/v1/users/me", json={"current_password": "Secret123!", "new_password": "NewSecret123!"}, headers=headers)
    assert r6.status_code == 200

    # Login with old password should fail
    r7 = client.post("/api/v1/auth/login", data={"username": "alice2@example.com", "password": "Secret123!"})
    assert r7.status_code == 401

    # Login with new password should succeed
    r8 = client.post("/api/v1/auth/login", data={"username": "alice2@example.com", "password": "NewSecret123!"})
    assert r8.status_code == 200
