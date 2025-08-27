from __future__ import annotations

from threading import RLock
from typing import Dict, Optional


_cache: Dict[int, str] = {}
_lock = RLock()


def set_whatsapp_no(customer_id: int, whatsapp_no: Optional[str]) -> None:
    """Store mapping from customer_id -> whatsapp_no in-memory.

    This is a best-effort enrichment to avoid a DB migration. Safe to call frequently.
    """
    if not whatsapp_no:
        return
    with _lock:
        _cache[customer_id] = whatsapp_no


def get_whatsapp_no(customer_id: int) -> Optional[str]:
    """Return the whatsapp number if known for this customer_id."""
    with _lock:
        return _cache.get(customer_id)


def bulk_set(mapping: Dict[int, str]) -> None:
    """Optionally set many mappings at once."""
    if not mapping:
        return
    with _lock:
        for cid, num in mapping.items():
            if num:
                _cache[cid] = num
