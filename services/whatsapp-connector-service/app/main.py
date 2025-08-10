from fastapi import FastAPI

app = FastAPI(
    title="WhatsApp Connector Service",
    description="Handles communication with the WhatsApp API.",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}
