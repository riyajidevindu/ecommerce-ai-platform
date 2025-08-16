# AI Orchestrator Service

This service orchestrates the process of receiving a message, using AI to understand it, checking stock, and generating a reply.

## Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Create a `.env` file and add your `DATABASE_URL` and `GEMINI_API_KEY`.

## Running the service

```bash
uvicorn app.main:app --reload
