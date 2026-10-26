import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://quarantes:quarantes@localhost:5432/quarantes_test",
)
os.environ.setdefault("SESSION_SECRET", "test-secret-quarantes")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db import Base, engine, SessionLocal
from app.main import app
from app.routers.admin import _login_attempts
from app.seed import upsert_articles, upsert_projects

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(autouse=True)
def _db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Créer les pôles nécessaires pour le seed
    from app.models import Pole, User
    from app.security import hash_password
    
    # Créer les pôles
    poles_data = ["KARABA", "KOF Corporation", "TÉPÉ", "Quarantes Studio", "R&D", "Vision"]
    for pole_name in poles_data:
        if not db.scalar(select(Pole).where(Pole.name == pole_name)):
            db.add(Pole(name=pole_name, is_active=True))
    db.commit()
    
    # Créer l'utilisateur admin
    kof_pole = db.scalar(select(Pole).where(Pole.name == "KOF Corporation"))
    admin_hash = hash_password("admin123")
    if not db.scalar(select(User).where(User.username == "admin")):
        db.add(User(
            username="admin",
            display_name="Administrateur",
            password_hash=admin_hash,
            role="admin",
            user_role="Administrator",
            pole_id=kof_pole.id if kof_pole else 1,
            is_active=True
        ))
    db.commit()
    
    # Exécuter le seed
    upsert_articles(db)
    upsert_projects(db)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clear_rate_limit():
    _login_attempts.clear()
    yield


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def admin_client(client):
    r = client.post(
        "/api/admin/login",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
    )
    assert r.status_code == 200
    return client