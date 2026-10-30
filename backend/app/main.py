import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers.projects import router as projects_router
from app.routers.chat import router as chat_router
from app.routers.intelligence import router as intelligence_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seed 233 projects
    print(f"Starting {settings.APP_NAME}...")
    init_db()
    yield
    print("Shutting down SHU ORIC AI...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Full-stack AI-powered research and industry intelligence ecosystem for Salim Habib University (SHU), Karachi.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(projects_router)
app.include_router(chat_router)
app.include_router(intelligence_router)

# Mount Frontend Static Directory if exists
frontend_dir = settings.BASE_DIR.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
