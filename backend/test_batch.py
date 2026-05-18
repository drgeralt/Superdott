import asyncio
from google import genai
import os
import sys

api_key = "AIzaSyDw_BlYYyXIIjLSS10eGzwaEw_9mDyQWQs"
client = genai.Client(api_key=api_key)

async def test():
    chunks = ["Olá mundo número " + str(i) for i in range(105)]
    print(f"Total chunks to embed: {len(chunks)}")
    
    # Try embedding as a batch list of size 100
    try:
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=chunks[:100]
        )
        print("✅ Single Batch of 100 succeeded!")
        print(f"Response embeddings count: {len(response.embeddings)}")
    except Exception as e:
        print(f"❌ Single Batch of 100 failed: {e}")

asyncio.run(test())
