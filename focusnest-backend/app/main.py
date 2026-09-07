import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import users, tasks, quotes, ai

load_dotenv()

app = FastAPI(
    title="FocusNest API",
    description="Backend for FocusNest student productivity app",
    version="1.0.0"
)

# Robustly parse and sanitize allowed CORS origins
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
origins_set = {
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3003",
    "https://student-planner-dashboard-lemon.vercel.app",
}

if raw_origins:
    for item in raw_origins.split(","):
        cleaned = item.strip(" \"'\t\r\n").rstrip("/")
        if cleaned:
            origins_set.add(cleaned)

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    cleaned_fe = frontend_url.strip(" \"'\t\r\n").rstrip("/")
    if cleaned_fe:
        origins_set.add(cleaned_fe)

# Allow credentials with exact origins or match any vercel/localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(origins_set),
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )

@app.on_event("startup")
def on_startup():
    # Auto-create all tables in DB on startup
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not create tables on startup: {e}")



app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(quotes.router)          
app.include_router(ai.router)          


@app.get("/")
def root():
    return {"message": "FocusNest API is running ✅"}