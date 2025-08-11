from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
import os
import shutil

app = FastAPI(
    title="File Storage Service",
    description="Handles file uploads and serving.",
    version="0.1.0"
)

UPLOAD_DIR = "/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/images", StaticFiles(directory=UPLOAD_DIR), name="images")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/images/{file.filename}"}

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
