from fastapi import FastAPI

app = FastAPI(
    title="Notification Service",
    description="Handles sending notifications (email, SMS, etc.).",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
