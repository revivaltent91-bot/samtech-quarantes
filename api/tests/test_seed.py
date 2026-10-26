from sqlalchemy import select
from app.db import SessionLocal
from app.models import Article, Project, Pole, User
from app.seed import upsert_articles, upsert_projects


def test_seed_loaded_exactly_once():
    db = SessionLocal()
    try:
        # Vérifier que les articles et projets sont chargés
        articles_count = len(db.scalars(select(Article)).all())
        projects_count = len(db.scalars(select(Project)).all())
        
        # Vérifier que les nouvelles tables existent
        poles_count = len(db.scalars(select(Pole)).all())
        users_count = len(db.scalars(select(User)).all())
        
        assert articles_count == 8
        assert projects_count == 10
        assert poles_count >= 6  # Au moins les 6 pôles par défaut
        assert users_count >= 1  # Au moins l'admin
    finally:
        db.close()


def test_seed_idempotent():
    db = SessionLocal()
    try:
        # Le seed est déjà exécuté dans conftest, donc upsert ne devrait rien créer
        articles_created = upsert_articles(db)
        projects_created = upsert_projects(db)
        db.commit()
        
        # Après le premier seed, un deuxième ne devrait rien créer
        assert articles_created == 0
        assert projects_created == 0
        
        # Vérifier les comptes
        articles_count = len(db.scalars(select(Article)).all())
        projects_count = len(db.scalars(select(Project)).all())
        
        assert articles_count == 8
        assert projects_count == 10
    finally:
        db.close()


def test_poles_and_users_created():
    """Test que les pôles et utilisateurs sont créés par le seed"""
    db = SessionLocal()
    try:
        poles = db.scalars(select(Pole)).all()
        users = db.scalars(select(User)).all()
        
        # Vérifier que l'admin existe
        admin = db.scalar(select(User).where(User.username == "admin"))
        assert admin is not None
        assert admin.role == "admin"
        assert admin.is_active is True
        
        # Vérifier que KARABA existe
        karaba = db.scalar(select(Pole).where(Pole.name == "KARABA"))
        assert karaba is not None
        assert karaba.is_active is True
    finally:
        db.close()