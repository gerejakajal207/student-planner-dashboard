import os
import random
import httpx
from fastapi import APIRouter
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/quotes", tags=["quotes"])

API_NINJAS_KEY = os.getenv("API_NINJAS_KEY")

FALLBACK_QUOTES = [
    {"text": "The secret of getting ahead is getting started.", "author": "Mark Twain"},
    {"text": "Focus is a muscle. The more you practice it, the stronger it gets.", "author": "Anonymous"},
    {"text": "It always seems impossible until it is done.", "author": "Nelson Mandela"},
    {"text": "Small daily improvements over time lead to stunning results.", "author": "Robin Sharma"},
    {"text": "Success is the sum of small efforts repeated day in and day out.", "author": "Robert Collier"},
    {"text": "You don't have to be extreme, just consistent.", "author": "Anonymous"},
    {"text": "Action is the foundational key to all success.", "author": "Pablo Picasso"},
]

@router.get("/random")
async def get_random_quote():
    key = os.getenv("API_NINJAS_KEY") or API_NINJAS_KEY
    if key:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(
                    "https://api.api-ninjas.com/v2/randomquotes",
                    headers={"X-Api-Key": key},
                )
                if res.status_code == 200:
                    data = res.json()
                    item = data[0] if isinstance(data, list) else data
                    quote_text = item.get("quote") or item.get("content")
                    if quote_text:
                        return {
                            "text": quote_text,
                            "author": item.get("author") or "Unknown",
                        }
        except Exception:
            pass

    return random.choice(FALLBACK_QUOTES)