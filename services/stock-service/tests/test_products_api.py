import os
from types import SimpleNamespace
from pathlib import Path

# Ensure database URL is set before importing the app modules
TEST_DB_PATH = Path(__file__).parent / "test_stock.sqlite"
os.environ.setdefault("DATABASE_URL", f"sqlite+pysqlite:///{TEST_DB_PATH}")

from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine
from app.api.v1 import products as products_module


def setup_module(module):
    # Create tables on the test database
    Base.metadata.create_all(bind=engine)

def teardown_module(module):
    # Clean up test DB file
    try:
        if TEST_DB_PATH.exists():
            TEST_DB_PATH.unlink()
    except Exception:
        pass


def override_get_current_user():
    return SimpleNamespace(id=1, username="tester")


def test_create_and_list_product(monkeypatch):
    # Stub background consumer to avoid threads during TestClient startup
    try:
        import app.main as app_main
        monkeypatch.setattr(app_main, "start_consumer", lambda: None, raising=False)
    except Exception:
        pass

    # No-op messaging publishers
    monkeypatch.setattr(products_module, "publish_product_created", lambda product_data: None, raising=False)

    # Override auth and DB deps
    from app.core.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = override_get_current_user

    client = TestClient(app)

    payload = {
        "name": "Widget",
        "sku": "SKU-001",
        "price": 9.99,
        "description": "A test widget",
        "stock_qty": 10,
        "available_qty": 10,
        "image": None,
    }

    r = client.post("/api/v1/products/", json=payload, headers={"Authorization": "Bearer test"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["sku"] == "SKU-001"
    assert data["available_qty"] == 10
    assert data["owner_id"] == 1

    r = client.get("/api/v1/products/", headers={"Authorization": "Bearer test"})
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) >= 1


def test_create_conflict_sku(monkeypatch):
    monkeypatch.setattr(products_module, "publish_product_created", lambda product_data: None, raising=False)
    from app.core.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = override_get_current_user
    client = TestClient(app)

    payload = {
        "name": "Widget 2",
        "sku": "DUP-1",
        "price": 19.99,
        "description": "dup",
        "stock_qty": 5,
        "available_qty": 5,
        "image": None,
    }
    r1 = client.post("/api/v1/products/", json=payload, headers={"Authorization": "Bearer test"})
    assert r1.status_code == 200

    r2 = client.post("/api/v1/products/", json=payload, headers={"Authorization": "Bearer test"})
    assert r2.status_code == 400
    assert r2.json().get("detail") == "SKU already registered"


def test_update_and_delete_product(monkeypatch):
    # Stub publishers
    monkeypatch.setattr(products_module, "publish_product_created", lambda product_data: None, raising=False)
    monkeypatch.setattr(products_module, "publish_product_updated", lambda product_data: None, raising=False)
    monkeypatch.setattr(products_module, "publish_product_deleted", lambda product_id: None, raising=False)

    from app.core.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = override_get_current_user
    client = TestClient(app)

    # Create
    payload = {
        "name": "Gizmo",
        "sku": "SKU-UPD",
        "price": 5.0,
        "description": "old",
        "stock_qty": 3,
        "available_qty": 3,
        "image": None,
    }
    r = client.post("/api/v1/products/", json=payload, headers={"Authorization": "Bearer test"})
    assert r.status_code == 200
    pid = r.json()["id"]

    # Update
    updated = payload | {"name": "Gizmo Pro", "price": 7.5}
    r = client.put(f"/api/v1/products/{pid}", json=updated, headers={"Authorization": "Bearer test"})
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "Gizmo Pro"
    assert body["price"] == 7.5

    # Delete
    r = client.delete(f"/api/v1/products/{pid}", headers={"Authorization": "Bearer test"})
    assert r.status_code == 200
    assert r.json()["id"] == pid
