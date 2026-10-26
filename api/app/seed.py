import json
from pathlib import Path
from sqlalchemy import select

from sqlalchemy.orm import Session

from .models import Article, Project, Pole, User

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"
DEFAULT_ARTICLES = SEED_DIR / "articles.json"
DEFAULT_PROJECTS = SEED_DIR / "projects.json"


def _load(path: Path | str) -> list[dict]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _get_pole_id(session: Session, pole_name: str) -> int:
    """Retourne l'ID d'un pôle à partir de son nom, le crée si inexistant"""
    pole = session.scalar(select(Pole).where(Pole.name == pole_name))
    if not pole:
        pole = Pole(name=pole_name, is_active=True)
        session.add(pole)
        session.flush()
    return pole.id


def _get_or_create_user(session: Session, username: str, display_name: str, user_role: str, pole_name: str) -> User:
    """Retourne ou crée un utilisateur"""
    user = session.scalar(select(User).where(User.username == username))
    if user:
        return user
    
    pole_id = _get_pole_id(session, pole_name)
    user = User(
        username=username,
        display_name=display_name,
        # Mot de passe dev par défaut des comptes publisher : publisher123
        password_hash="$2b$12$yFloGAffAPZg4k3s5tyEv.RqbHr7xnde0evzaplbNX5n9GFyyevWy",
        role="publisher",
        user_role=user_role,
        pole_id=pole_id,
        is_active=True
    )
    session.add(user)
    session.flush()
    return user


def _get_admin_user(session: Session) -> User | None:
    """Retourne l'utilisateur admin"""
    return session.scalar(select(User).where(User.username == "admin"))


def upsert_articles(session: Session, path: Path | str | None = None) -> int:
    created = 0
    admin = _get_admin_user(session)
    
    for item in _load(path or DEFAULT_ARTICLES):
        # Extraire l'ancien format
        pole_name = item.get("pole")
        author_info = item.get("author", {})
        
        # Trouver ou créer le pôle
        pole_id = _get_pole_id(session, pole_name) if pole_name else None
        
        # Créer un utilisateur pour l'auteur si nécessaire
        author = None
        if author_info:
            author_username = f"{author_info.get('name', 'unknown')}-author"
            author = _get_or_create_user(
                session,
                author_username,
                author_info.get("name", "Unknown"),
                author_info.get("role", "Author"),
                author_info.get("pole", pole_name or "KARABA")
            )
        
        # Créer directement les données sans passer par ArticlePayload
        data = {
            "slug": item["slug"],
            "title": item["title"],
            "excerpt": item["excerpt"],
            "hero_image": item["heroImage"],
            "published_at": item["publishedAt"],
            "read_time": item["readTime"],
            "featured": item.get("featured", False),
            "blocks": item["blocks"],
            "pole_id": pole_id,
            "author_id": author.id if author else admin.id if admin else 1,
            "created_by_id": admin.id if admin else 1,
        }
        
        try:
            existing = session.query(Article).filter(Article.slug == data["slug"]).first()
            if existing:
                for k, v in data.items():
                    setattr(existing, k, v)
            else:
                session.add(Article(**data))
                created += 1
        except Exception as e:
            print(f"Erreur lors du seed de l'article {item.get('slug')}: {e}")
    return created


def upsert_projects(session: Session, path: Path | str | None = None) -> int:
    created = 0
    admin = _get_admin_user(session)
    
    for item in _load(path or DEFAULT_PROJECTS):
        # Extraire l'ancien format
        pole_name = item.get("pole")
        article_slug = item.get("articleSlug")  # Nouveau champ pour le lien article-projet
        
        # Trouver ou créer le pôle
        pole_id = _get_pole_id(session, pole_name) if pole_name else None
        
        # Créer directement les données sans passer par ProjectPayload
        data = {
            "slug": item["slug"],
            "title": item["title"],
            "status": item["status"],
            "description": item["description"],
            "stack": item["stack"],
            "confidential": item.get("confidential", False),
            "url": item.get("url"),
            "featured": item.get("featured", False),
            "detail": item.get("detail"),
            "article_slug": article_slug,
            "pole_id": pole_id,
            "created_by_id": admin.id if admin else 1,
        }
        
        try:
            existing = session.query(Project).filter(Project.slug == data["slug"]).first()
            if existing:
                for k, v in data.items():
                    setattr(existing, k, v)
            else:
                session.add(Project(**data))
                created += 1
        except Exception as e:
            print(f"Erreur lors du seed du projet {item.get('slug')}: {e}")
    return created