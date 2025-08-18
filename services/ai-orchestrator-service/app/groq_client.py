from groq import Groq
from .config import GROQ_API_KEY

# Lazily initialize the Groq client only if the API key is available.
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        # Leave client as None; generate_response will handle gracefully.
        client = None

def generate_response(prompt: str) -> str:
    """
    Uses Groq to generate a response from a prompt.
    """
    try:
        if client is None:
            return "[Groq unavailable: Missing or invalid GROQ_API_KEY]"
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"[Groq unavailable: {e}]"
from groq import Groq
from .config import GROQ_API_KEY

# Lazily initialize the Groq client only if the API key is available.
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        # Leave client as None; generate_response will handle gracefully.
        client = None

def generate_response(prompt: str) -> str:
    """
    Uses Groq to generate a response from a prompt.
    """
    try:
        if client is None:
            return "[Groq unavailable: Missing or invalid GROQ_API_KEY]"
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"[Groq unavailable: {e}]"
