from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, tasks, quotes, ai

# Auto-create all tables in MySQL on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FocusNest API",
    description="Backend for FocusNest student productivity app",
    version="1.0.0"
)

import os
from dotenv import load_dotenv

load_dotenv()

# Build list of allowed CORS origins
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
if raw_origins:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3003",
    ]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url.strip())

# Support wildcard configuration
allow_all = "*" in origins or os.getenv("ALLOW_ALL_CORS", "false").lower() in ("1", "true", "yes")

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=not allow_all,  # standard CORS specification requirement
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(quotes.router)          
app.include_router(ai.router)          


@app.get("/")
def root():
    return {"message": "FocusNest API is running ✅"}