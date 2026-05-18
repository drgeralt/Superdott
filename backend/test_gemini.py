import asyncio
from google import genai
import os
import sys

# Load environment variable
api_key = "AIzaSyDw_BlYYyXIIjLSS10eGzwaEw_9mDyQWQs"

print(f"Testing Gemini API with key: {api_key[:10]}...")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents="Olá Mundo"
    )
    print("✅ Success calling Gemini API!")
    print(f"Embedding type: {type(response.embeddings)}")
    # Print the structure of response.embeddings
    print(f"Response: {response}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
