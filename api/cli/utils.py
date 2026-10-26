import sys
from pathlib import Path

from app.config import settings


def ensure_env() -> None:
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if not env_file.exists():
        print(
            "Fichier .env introuvable. Créer-le depuis .env.example :\n"
            "  cp .env.example .env",
            file=sys.stderr,
        )
        sys.exit(1)
    if settings.database_url == "change-me":
        print("DATABASE_URL doit être définie dans .env", file=sys.stderr)
        sys.exit(1)