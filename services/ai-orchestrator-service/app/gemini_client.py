import os
from .config import GEMINI_API_KEY

_gemini_available = True
try:
    import google.generativeai as genai  # type: ignore
except ImportError:
    genai = None  # type: ignore
    _gemini_available = False

model = None
if _gemini_available and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-pro')
    except Exception:
        _gemini_available = False

def extract_product_info(message: str) -> str:
    """
    Uses Gemini to extract product information from a customer message.
    """
    # This is a placeholder. In a real implementation, you would use a prompt
    # from the prompts.py file.
    prompt = f"Extract product information from the following message: {message}"
    if not model:
        return "[Gemini unavailable: missing dependency or API key]"
    response = model.generate_content(prompt)
    return getattr(response, 'text', str(response))

def generate_natural_reply(product_info: str, stock_status: str) -> str:
    """
    Uses Gemini to generate a natural language reply to the customer.
    """
    # This is a placeholder. In a real implementation, you would use a prompt
    # from the prompts.py file.
    prompt = f"The product is {product_info}. The stock status is {stock_status}. Generate a natural reply."
    if not model:
        return "[Gemini unavailable: missing dependency or API key]"
    response = model.generate_content(prompt)
    return getattr(response, 'text', str(response))
