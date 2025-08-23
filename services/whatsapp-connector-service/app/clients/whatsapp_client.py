import logging
import re
from typing import Optional
import requests

from app.config import (
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_VERSION,
)

logger = logging.getLogger(__name__)


def _api_base_url() -> str:
    version = WHATSAPP_API_VERSION or "v20.0"
    return f"https://graph.facebook.com/{version}"

def _normalize_phone(number: str) -> str:
    """Return digits-only E.164-like string (no '+', no spaces)."""
    return re.sub(r"\D", "", number or "")


def send_text_message(to_number: str, text: str, reply_to_message_id: Optional[str] = None) -> dict:
    """
    Send a WhatsApp text message using the Cloud API.

    Inputs:
    - to_number: recipient WhatsApp number in international format (e.g., 15551234567)
    - text: message body
    - reply_to_message_id: optional platform message id to reply to

    Returns JSON response from API; raises for HTTP errors.
    """
    if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        raise RuntimeError("WhatsApp access token or phone number id not configured")

    url = f"{_api_base_url()}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    payload: dict = {
        "messaging_product": "whatsapp",
        "to": _normalize_phone(to_number),
        "type": "text",
        "text": {"body": text[:4096], "preview_url": False},
    }
    if reply_to_message_id:
        payload["context"] = {"message_id": reply_to_message_id}

    logger.info("Sending WhatsApp message to %s via Cloud API", to_number)
    resp = requests.post(url, json=payload, headers=headers, timeout=15)
    if resp.status_code >= 400:
        # Log full response body for diagnostics
        logger.error("WhatsApp API error %s: %s", resp.status_code, resp.text)
        resp.raise_for_status()
    return resp.json()
