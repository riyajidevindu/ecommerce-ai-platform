from fastapi import FastAPI

app = FastAPI(
    title="Auth Service",
    description="Handles user authentication and authorization.",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
