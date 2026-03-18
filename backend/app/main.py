import uuid
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from sqlalchemy import create_engine

from app.core.config import settings
from app.models.permit import Base

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)


@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(
            content={"message": "OK"},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# Safe router import
try:
    from app.routers import permits
    app.include_router(permits.router)
    print("✅ Permits router loaded successfully")
except Exception as e:
    print(f"❌ ROUTER IMPORT ERROR: {repr(e)}")


@app.get("/")
@app.head("/")
def root():
    return {"name": "GovMind.AI API", "status": "running"}


# ✅ Accept both GET and HEAD — fixes UptimeRobot 405 error
@app.get("/health")
@app.head("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/ping")
@app.head("/ping")
def ping():
    return Response(content="pong", media_type="text/plain")


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