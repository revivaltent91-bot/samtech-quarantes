from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from .config import settings
from .routers import admin, public

app = FastAPI(
    title="QUARANTES API",
    description="Backend du site vitrine QUARANTES Holding — articles, projets.",
    version="0.1.0",
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie="quarantes_session",
    same_site="strict",
    https_only=False,
    max_age=7 * 24 * 60 * 60,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")

_console_dist = Path(__file__).resolve().parents[2] / "admin-console" / "dist"
if _console_dist.is_dir():
    app.mount(
        "/console",
        StaticFiles(directory=_console_dist, html=True),
        name="console",
    )
else:

    @app.get("/console")
    def _missing_console() -> dict:
        raise HTTPException(
            status_code=503,
            detail="Console non construite. Exécutez cd ../admin-console && npm run build",
        )
