from . import gemini_client
from .groq_client import generate_response as groq_generate_response
from .db import get_db
from sqlalchemy.orm import Session
from typing import Optional, Tuple, List, Dict
import re
from .crud import conversation_state as conv_state_crud
from .crud.message import update_message_response
from .crud.product import get_products_by_user_id
from .models.message import Message
from . import messaging


def _score_product_match(user_text: str, name: str, sku: Optional[str]) -> float:
    """Very lightweight matching score based on simple heuristics (0..1).
    - Exact SKU mention → 1.0
    - Name token overlap and substring matches → up to 0.8
    - Otherwise small partial match → up to 0.4
    Avoid external deps and keep deterministic.
    """
    if not user_text:
        return 0.0
    txt = user_text.lower()
    n = (name or "").lower()
    s = (sku or "").lower()

    # SKU may be business-internal; still treat presence as a strong hint if present in text
    if s and s in txt:
        return 0.95

    score = 0.0
    if n:
        if n in txt:
            score = max(score, 0.8)
        else:
            # token overlap
            name_tokens = [t for t in n.replace("-", " ").split() if len(t) > 2]
            hits = sum(1 for t in name_tokens if t in txt)
            if name_tokens:
                score = max(score, min(0.8, 0.3 + 0.1 * hits))

    # weak partial on sku prefix/suffix
    if s:
        for k in [s[:3], s[-3:]]:
            if len(k) >= 2 and k in txt:
                score = max(score, 0.5)

    return score


def _find_best_product(user_text: str, products) -> Tuple[Optional[object], float]:
    best, best_score = None, 0.0
    for p in products:
        sc = _score_product_match(user_text, getattr(p, "name", None), getattr(p, "sku", None))
        if sc > best_score:
            best, best_score = p, sc
    return best, best_score


# Simple in-process conversational memory: customer_id -> last selected product_id
_conversation_memory: Dict[int, int] = {}


_PRONOUN_ONLY_RE = re.compile(r"\b(it|that|this|the one|same|above|the product)\b", re.I)
_FOLLOW_UP_RE = re.compile(r"\b(price|cost|stock|quantity|available|in stock|how much|what about|details)\b", re.I)

def _is_followup_about_same_product(user_text: str) -> bool:
    if not user_text:
        return False
    txt = user_text.strip()
    # If the message contains a follow-up keyword and pronoun-like references
    return bool(_FOLLOW_UP_RE.search(txt)) and bool(_PRONOUN_ONLY_RE.search(txt))

def process_message(channel, message: Message, db: Session, user_id: int):
    """
    Processes a single message and publishes the AI response.

    Inputs:
    - channel: RabbitMQ channel to publish the AI response.
    - message: DB Message row (contains customer/message ids and text).
    - db: SQLAlchemy session.
    - user_id: The owner/tenant id associated with this conversation.

    Note: We intentionally rely on the user_id coming with the event payload
    to avoid any mismatch due to cross-service customer id collisions.
    """
    try:
        # Always scope products by the user_id provided with the message event
        # rather than traversing message.customer to avoid tenant leakage.
        products = get_products_by_user_id(db, user_id)

        # Agentic retrieval step: try to identify the specific product referenced.
        best, score = _find_best_product(message.user_message or "", products)

        # Conversation memory assist: if the user likely refers to the same product as before,
        # prefer the last one we selected for this customer.
        chosen = None
        if _is_followup_about_same_product(message.user_message or ""):
            last_id = _conversation_memory.get(message.customer_id)
            if last_id is None:
                # Read from DB state when cache is cold
                state = conv_state_crud.get_state(db, customer_id=message.customer_id)
                last_id = state.last_product_id if state else None
                if last_id is not None:
                    _conversation_memory[message.customer_id] = last_id
            if last_id is not None:
                chosen = next((p for p in products if getattr(p, "id", None) == last_id), None)
                score = max(score, 0.85) if chosen else score
        if not chosen and best and score >= 0.7:
            chosen = best

        def fmt(v):
            return "N/A" if v is None else v

        if chosen:
            # High confidence or conversation-followup: present exact facts for that product only (no SKU exposure).
            facts = (
                "You must answer using ONLY these facts; do not invent values.\n"
                f"- Product name: {fmt(chosen.name)}\n"
                f"- Price: {fmt(chosen.price)}\n"
                f"- Available quantity: {fmt(chosen.available_qty)}\n"
                f"- Total stock quantity: {fmt(chosen.stock_qty)}\n"
            )
            prompt = (
                "You are a precise e-commerce assistant.\n"
                + facts + "\n"
                f"Customer message: {message.user_message}\n\n"
                "If the customer asks for price or stock, state the exact values from the facts."
                " If something is missing (N/A), say you don't have that information."
                " Keep it concise and friendly."
            )
            # Update conversation memory to selected product
            try:
                pid = getattr(chosen, "id", None)
                if pid is not None:
                    _conversation_memory[message.customer_id] = pid
                    conv_state_crud.set_last_product(db, message.customer_id, pid)
            except Exception:
                pass
        elif products:
            # Low confidence: offer top options with exact facts and ask to clarify.
            top: List[object] = sorted(products, key=lambda p: _score_product_match(message.user_message or "", getattr(p, "name", None), getattr(p, "sku", None)), reverse=True)[:3]
            # Do not expose SKU in customer-facing text
            listing = "\n".join([
                f"- {fmt(p.name)}: price={fmt(p.price)}, available={fmt(p.available_qty)}, stock={fmt(p.stock_qty)}"
                for p in top
            ])
            prompt = (
                "You are a helpful e-commerce assistant.\n"
                "We couldn't confidently identify a single product. Here are possible matches with facts.\n"
                + listing + "\n\n"
                f"Customer message: {message.user_message}\n\n"
                "Ask the customer to confirm which product (by name) they mean, and only then provide exact details."
            )
        else:
            prompt = (
                "You are a helpful e-commerce assistant.\n"
                "No products found for this user. Politely ask the user to add products first."
            )
        # Prefer Groq; fallback to Gemini if unavailable or errors
        print("[AI] Trying Groq for message", message.id)
        reply = groq_generate_response(prompt)
        if isinstance(reply, str) and reply.startswith("[Groq unavailable"):
            print("[AI] Groq unavailable; falling back to Gemini for message", message.id)
            reply = gemini_client.generate_response(prompt)

        update_message_response(db, message.id, reply)
        
        # Use the passed-in channel to publish the response
        messaging.publish_ai_response(channel, message.id, reply)
        
        print(f"Reply for message {message.id}: {reply}")
    except Exception as e:
        # Log the exception and handle it appropriately
        # Consider whether to nack the message or take other corrective action
        print(f"Error processing message {message.id}: {e}")
        # Depending on the desired behavior, you might want to re-raise the exception
        # raise
