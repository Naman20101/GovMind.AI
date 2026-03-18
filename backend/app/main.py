import uuid
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import create_engine

from app.core.config import settings
from app.models.permit import Base
from app.routers import permits

engine = create_engine(settings.DATABASE_URL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="GovMind.AI API",
    version="1.0.0",
    lifespan=lifespan
)

# ✅ CORS — allow everything, locked down properly
origins = settings.get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)
app.include_router(permits.router)


@app.get("/")
def root():
    return {
        "name": "GovMind.AI API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "details": exc.errors(),
            "trace_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "trace_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
