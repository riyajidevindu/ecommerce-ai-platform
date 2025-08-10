from fastapi import FastAPI

app = FastAPI(
    title="Stock Service",
    description="Handles product stock management.",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
