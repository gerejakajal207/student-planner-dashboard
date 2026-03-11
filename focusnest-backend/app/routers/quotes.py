import os
import httpx
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/quotes", tags=["quotes"])

API_NINJAS_KEY = os.getenv("API_NINJAS_KEY")

@router.get("/random")
async def get_random_quote():
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.api-ninjas.com/v2/randomquotes",
                headers={"X-Api-Key": API_NINJAS_KEY},
                timeout=5.0
            )
            res.raise_for_status()
            data = res.json()

            # Handle both list and dict responses
            item = data[0] if isinstance(data, list) else data

            return {
                "text": item.get("quote") or item.get("content") or "Stay focused.",
                "author": item.get("author") or "Unknown",
            }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quote fetch failed: {str(e)}")