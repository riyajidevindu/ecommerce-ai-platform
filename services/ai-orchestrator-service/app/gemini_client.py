import os
import google.generativeai as genai
from .config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-pro')

def extract_product_info(message: str) -> str:
    """
    Uses Gemini to extract product information from a customer message.
    """
    # This is a placeholder. In a real implementation, you would use a prompt
    # from the prompts.py file.
    prompt = f"Extract product information from the following message: {message}"
    response = model.generate_content(prompt)
    return response.text

def generate_natural_reply(product_info: str, stock_status: str) -> str:
    """
    Uses Gemini to generate a natural language reply to the customer.
    """
    # This is a placeholder. In a real implementation, you would use a prompt
    # from the prompts.py file.
    prompt = f"The product is {product_info}. The stock status is {stock_status}. Generate a natural reply."
    response = model.generate_content(prompt)
    return response.text
