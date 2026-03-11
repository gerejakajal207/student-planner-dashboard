from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, tasks, quotes   # ← add quotes


# Auto-create all tables in MySQL on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FocusNest API",
    description="Backend for FocusNest student productivity app",
    version="1.0.0"
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Create React App
        "http://localhost:5173",   # Vite
        "http://localhost:3003",   # ← add this

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(quotes.router)           # ← add this line


@app.get("/")
def root():
    return {"message": "FocusNest API is running ✅"}