from fastapi import FastAPI

app = FastAPI(
    title="AI Orchestrator Service",
    description="Orchestrates AI models and services.",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
