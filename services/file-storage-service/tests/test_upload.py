from fastapi.testclient import TestClient
from pathlib import Path
from app import main as app_main


def test_health_check():
    client = TestClient(app_main.app)
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_upload_writes_file_and_returns_url(tmp_path, monkeypatch):
    # Redirect uploads to a temp directory to avoid touching real filesystem
    upload_dir: Path = tmp_path / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(app_main, "UPLOAD_DIR", str(upload_dir))

    client = TestClient(app_main.app)

    files = {
        "file": ("sample.txt", b"hello world", "text/plain"),
    }
    resp = client.post("/upload", files=files)

    assert resp.status_code == 200
    assert resp.json() == {"url": "/images/sample.txt"}
    assert (upload_dir / "sample.txt").exists()


def test_upload_missing_file_returns_422():
    client = TestClient(app_main.app)
    resp = client.post("/upload", files={})
    assert resp.status_code == 422
