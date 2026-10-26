import time

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import Annotated

from ..auth import (
    get_current_user,
    require_role,
    require_article_access,
    require_project_access,
)
from ..config import settings
from ..db import get_db
from ..models import Article, Project, Pole, User
from ..schemas import (
    ArticlePayload,
    ArticleUpdate,
    LoginPayload,
    PoleCreate,
    PoleUpdate,
    ProjectPayload,
    ProjectUpdate,
    UserCreate,
    UserUpdate,
)
from ..security import hash_password, verify_password
from ..serializers import (
    article_admin_dict,
    project_admin_dict,
    user_to_author_dict,
)

router = APIRouter(tags=["admin"])

MAX_ATTEMPTS = 5
WINDOW = 15 * 60
_login_attempts: dict[str, list[float]] = {}


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _rate_limit(ip: str) -> None:
    now = time.time()
    attempts = [t for t in _login_attempts.get(ip, []) if now - t < WINDOW]
    _login_attempts[ip] = attempts
    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Trop de tentatives, réessayez plus tard")


# ==================== AUTHENTIFICATION ====================

@router.post("/login")
def login(payload: LoginPayload, request: Request, db: Session = Depends(get_db)) -> dict:
    """Authentification des utilisateurs"""
    ip = _client_ip(request)
    _rate_limit(ip)
    
    user = db.scalar(select(User).where(User.username == payload.username))
    
    if not user or not user.is_active:
        _login_attempts.setdefault(ip, []).append(time.time())
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    
    if not verify_password(payload.password, user.password_hash):
        _login_attempts.setdefault(ip, []).append(time.time())
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    
    _login_attempts.pop(ip, None)
    
    # Stocker les infos utilisateur dans la session
    request.session["user_id"] = user.id
    request.session["username"] = user.username
    request.session["user_role"] = user.role
    
    return {
        "ok": True,
        "username": user.username,
        "displayName": user.display_name,
        "role": user.role,
        "poleId": user.pole_id
    }


@router.post("/logout")
def logout(request: Request) -> dict:
    """Déconnexion"""
    request.session.pop("user_id", None)
    request.session.pop("username", None)
    request.session.pop("user_role", None)
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(get_current_user)) -> dict:
    """Informations de l'utilisateur connecté"""
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name,
        "role": user.role,
        "userRole": user.user_role,
        "pole": {"id": user.pole.id, "name": user.pole.name}
    }


@router.get("/me/poles")
def get_my_poles(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    """Retourne les pôles accessibles par l'utilisateur"""
    if user.role == "admin":
        poles = db.scalars(select(Pole)).all()
        return [{"id": p.id, "name": p.name} for p in poles]
    else:
        return [{"id": user.pole.id, "name": user.pole.name}]


@router.get("/poles/{pole_id}/authors")
def get_pole_authors(
    pole_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[dict]:
    """Retourne les utilisateurs d'un pôle (auteurs potentiels)"""
    if user.role != "admin":
        if user.pole_id != pole_id:
            raise HTTPException(status_code=403, detail="Accès refusé à ce pôle")
    
    pole = db.get(Pole, pole_id)
    if not pole:
        raise HTTPException(status_code=404, detail="Pôle introuvable")
    
    authors = db.scalars(select(User).where(User.pole_id == pole_id)).all()
    return [{"id": u.id, "displayName": u.display_name, "role": u.user_role} for u in authors]


# ==================== GESTION DES PÔLES ====================

@router.get("/poles")
def list_poles(
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> list[dict]:
    """Liste tous les pôles (admin seulement)"""
    poles = db.scalars(select(Pole)).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "isActive": p.is_active} for p in poles]


@router.post("/poles", status_code=201)
def create_pole(
    payload: PoleCreate,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> dict:
    """Créer un pôle (admin seulement)"""
    if db.scalar(select(Pole.id).where(Pole.name == payload.name)):
        raise HTTPException(status_code=409, detail="Ce pôle existe déjà")
    
    pole = Pole(
        name=payload.name,
        description=payload.description,
        is_active=payload.isActive
    )
    db.add(pole)
    db.commit()
    db.refresh(pole)
    return {"id": pole.id, "name": pole.name, "description": pole.description, "isActive": pole.is_active}


@router.get("/poles/{pole_id}")
def get_pole(
    pole_id: int,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> dict:
    """Récupérer un pôle (admin seulement)"""
    pole = db.get(Pole, pole_id)
    if not pole:
        raise HTTPException(status_code=404, detail="Pôle introuvable")
    return {"id": pole.id, "name": pole.name, "description": pole.description, "isActive": pole.is_active}


@router.put("/poles/{pole_id}")
def update_pole(
    pole_id: int,
    payload: PoleUpdate,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> dict:
    """Mettre à jour un pôle (admin seulement)"""
    pole = db.get(Pole, pole_id)
    if not pole:
        raise HTTPException(status_code=404, detail="Pôle introuvable")
    
    if payload.name and payload.name != pole.name:
        if db.scalar(select(Pole.id).where(Pole.name == payload.name)):
            raise HTTPException(status_code=409, detail="Ce pôle existe déjà")
        pole.name = payload.name
    
    if payload.description is not None:
        pole.description = payload.description
    if payload.isActive is not None:
        pole.is_active = payload.isActive
    
    db.commit()
    db.refresh(pole)
    return {"id": pole.id, "name": pole.name, "description": pole.description, "isActive": pole.is_active}


@router.delete("/poles/{pole_id}", status_code=204)
def delete_pole(
    pole_id: int,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> None:
    """Supprimer un pôle (admin seulement)"""
    pole = db.get(Pole, pole_id)
    if not pole:
        raise HTTPException(status_code=404, detail="Pôle introuvable")
    
    # Vérifier qu'aucun utilisateur n'est associé
    if db.scalar(select(User.id).where(User.pole_id == pole_id).limit(1)):
        raise HTTPException(status_code=400, detail="Impossible de supprimer un pôle avec des utilisateurs")
    
    db.delete(pole)
    db.commit()


# ==================== GESTION DES UTILISATEURS ====================

@router.get("/users")
def list_users(
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> list[dict]:
    """Liste tous les utilisateurs (admin seulement)"""
    users = db.scalars(select(User).order_by(User.username)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "displayName": u.display_name,
            "role": u.role,
            "userRole": u.user_role,
            "pole": {"id": u.pole.id, "name": u.pole.name},
            "isActive": u.is_active
        }
        for u in users
    ]


@router.post("/users", status_code=201)
def create_user(
    payload: UserCreate,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> dict:
    """Créer un utilisateur (admin seulement)"""
    if db.scalar(select(User.id).where(User.username == payload.username)):
        raise HTTPException(status_code=409, detail="Username déjà utilisé")
    
    pole = db.get(Pole, payload.poleId)
    if not pole:
        raise HTTPException(status_code=400, detail="Pôle introuvable")
    
    hashed = hash_password(payload.password)
    user = User(
        username=payload.username,
        display_name=payload.displayName,
        password_hash=hashed,
        role=payload.role,
        user_role=payload.userRole,
        pole_id=payload.poleId,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name,
        "role": user.role,
        "userRole": user.user_role,
        "pole": {"id": user.pole.id, "name": user.pole.name},
        "isActive": user.is_active
    }


@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> dict:
    """Récupérer un utilisateur (admin seulement)"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name,
        "role": user.role,
        "userRole": user.user_role,
        "pole": {"id": user.pole.id, "name": user.pole.name},
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updatedAt": user.updated_at.isoformat() if user.updated_at else None
    }


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mettre à jour un utilisateur"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    # Un utilisateur ne peut modifier que son propre profil (sauf admin)
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez modifier que votre propre profil")
    
    if payload.displayName is not None:
        user.display_name = payload.displayName
    if payload.userRole is not None:
        user.user_role = payload.userRole
    if payload.poleId is not None:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Seul un admin peut changer le pôle d'un utilisateur")
        pole = db.get(Pole, payload.poleId)
        if not pole:
            raise HTTPException(status_code=400, detail="Pôle introuvable")
        user.pole_id = payload.poleId
    if payload.isActive is not None and current_user.role == "admin":
        user.is_active = payload.isActive
    if payload.password is not None and current_user.role == "admin":
        user.password_hash = hash_password(payload.password)
    
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name,
        "role": user.role,
        "userRole": user.user_role,
        "pole": {"id": user.pole.id, "name": user.pole.name},
        "isActive": user.is_active
    }


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    _: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
) -> None:
    """Supprimer un utilisateur (admin seulement) - Soft delete"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    # Soft delete : désactiver au lieu de supprimer
    user.is_active = False
    db.commit()


# ==================== GESTION DES ARTICLES (MODIFIÉE) ====================

@router.get("/articles")
def list_articles(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[dict]:
    """Liste des articles - Filtrés par pôle si pas admin"""
    query = select(Article).order_by(Article.updated_at.desc(), Article.id.desc())
    
    if user.role != "admin":
        query = query.where(Article.pole_id == user.pole_id)
    
    articles = db.scalars(query).all()
    return [article_admin_dict(a) for a in articles]


@router.post("/articles", status_code=201)
def create_article(
    payload: ArticlePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Créer un article"""
    # Vérifier que l'auteur existe
    author = db.get(User, payload.authorId)
    if not author:
        raise HTTPException(status_code=400, detail="Auteur introuvable")
    
    # Vérifier que le pôle existe
    pole = db.get(Pole, payload.poleId)
    if not pole:
        raise HTTPException(status_code=400, detail="Pôle introuvable")
    
    # Vérifier permissions
    if current_user.role != "admin":
        # Un non-admin ne peut créer que pour son propre pôle
        if current_user.pole_id != pole.id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez créer un article que pour votre pôle")
        # Un non-admin ne peut créer que pour lui-même ou un collègue de son pôle
        if author.pole_id != current_user.pole_id:
            raise HTTPException(status_code=403, detail="L'auteur doit appartenir à votre pôle")
    
    # Vérifier unicité du slug
    if db.scalar(select(Article.id).where(Article.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Un article avec ce slug existe déjà")
    
    article = Article(
        slug=payload.slug,
        title=payload.title,
        pole_id=payload.poleId,
        excerpt=payload.excerpt,
        hero_image=payload.heroImage,
        published_at=payload.publishedAt,
        read_time=payload.readTime,
        author_id=payload.authorId,
        created_by_id=current_user.id,
        featured=payload.featured,
        blocks=[b.model_dump() for b in payload.blocks]
    )
    db.add(article)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Un article avec ce slug existe déjà")
    db.refresh(article)
    return article_admin_dict(article)


@router.get("/articles/{article_id}")
def get_article(
    article_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Récupérer un article"""
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")
    
    # Vérifier permissions
    if user.role != "admin":
        if article.pole_id != user.pole_id:
            raise HTTPException(status_code=403, detail="Accès refusé à cet article")
    
    return article_admin_dict(article)


@router.put("/articles/{article_id}")
def update_article(
    article_id: int,
    payload: ArticleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mettre à jour un article"""
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")
    
    # Vérifier permissions
    require_article_access(current_user, article)
    
    data = payload.model_dump(exclude_unset=True)
    if "blocks" in data:
        data["blocks"] = [b.model_dump() for b in data["blocks"]]
    
    if "slug" in data and data["slug"] != article.slug:
        conflict = db.scalar(select(Article.id).where(Article.slug == data["slug"]))
        if conflict and conflict != article_id:
            raise HTTPException(status_code=409, detail="Slug déjà utilisé")
    
    if "authorId" in data:
        author = db.get(User, data["authorId"])
        if not author:
            raise HTTPException(status_code=400, detail="Auteur introuvable")
        if current_user.role != "admin":
            if author.pole_id != current_user.pole_id:
                raise HTTPException(status_code=403, detail="L'auteur doit appartenir à votre pôle")
        data["author_id"] = data.pop("authorId")
    
    if "poleId" in data:
        pole = db.get(Pole, data["poleId"])
        if not pole:
            raise HTTPException(status_code=400, detail="Pôle introuvable")
        if current_user.role != "admin":
            if pole.id != current_user.pole_id:
                raise HTTPException(status_code=403, detail="Vous ne pouvez pas changer le pôle de cet article")
        data["pole_id"] = data.pop("poleId")
    
    for key, value in data.items():
        if hasattr(article, key):
            setattr(article, key, value)
    
    db.commit()
    db.refresh(article)
    return article_admin_dict(article)


@router.delete("/articles/{article_id}", status_code=204)
def delete_article(
    article_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """Supprimer un article"""
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")
    
    # Vérifier permissions
    require_article_access(user, article)
    
    db.delete(article)
    db.commit()


# ==================== GESTION DES PROJETS (MODIFIÉE) ====================

@router.get("/projects")
def list_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[dict]:
    """Liste des projets - Filtrés par pôle si pas admin"""
    query = select(Project).order_by(Project.updated_at.desc(), Project.id.desc())
    
    if user.role != "admin":
        query = query.where(Project.pole_id == user.pole_id)
    
    projects = db.scalars(query).all()
    return [project_admin_dict(p) for p in projects]


@router.post("/projects", status_code=201)
def create_project(
    payload: ProjectPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Créer un projet"""
    # Vérifier que le pôle existe
    pole = db.get(Pole, payload.poleId)
    if not pole:
        raise HTTPException(status_code=400, detail="Pôle introuvable")
    
    # Vérifier permissions
    if current_user.role != "admin":
        if current_user.pole_id != pole.id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez créer un projet que pour votre pôle")
    
    # Vérifier unicité du slug
    if db.scalar(select(Project.id).where(Project.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Un projet avec ce slug existe déjà")
    
    # Validation optionnelle : vérifier que l'article existe si articleSlug est fourni
    if payload.articleSlug:
        article = db.scalar(select(Article).where(Article.slug == payload.articleSlug))
        if not article:
            raise HTTPException(status_code=400, detail=f"Article '{payload.articleSlug}' introuvable")
    
    project = Project(
        slug=payload.slug,
        title=payload.title,
        pole_id=payload.poleId,
        status=payload.status,
        description=payload.description,
        stack=payload.stack,
        confidential=payload.confidential,
        url=payload.url,
        featured=payload.featured,
        detail=payload.detail.model_dump() if payload.detail else None,
        article_slug=payload.articleSlug,
        created_by_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project_admin_dict(project)


@router.get("/projects/{project_id}")
def get_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Récupérer un projet"""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    
    if user.role != "admin":
        if project.pole_id != user.pole_id:
            raise HTTPException(status_code=403, detail="Accès refusé à ce projet")
    
    return project_admin_dict(project)


@router.put("/projects/{project_id}")
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Mettre à jour un projet"""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    
    # Vérifier permissions
    require_project_access(current_user, project)
    
    data = payload.model_dump(exclude_unset=True)
    if "detail" in data and isinstance(data["detail"], ProjectDetail):
        data["detail"] = data["detail"].model_dump()
    
    if "slug" in data and data["slug"] != project.slug:
        conflict = db.scalar(select(Project.id).where(Project.slug == data["slug"]))
        if conflict and conflict != project_id:
            raise HTTPException(status_code=409, detail="Slug déjà utilisé")
    
    if "articleSlug" in data:
        # Validation optionnelle : vérifier que l'article existe
        article_slug = data["articleSlug"]
        if article_slug:
            article = db.scalar(select(Article).where(Article.slug == article_slug))
            if not article:
                raise HTTPException(status_code=400, detail=f"Article '{article_slug}' introuvable")
        data["article_slug"] = data.pop("articleSlug")
    
    if "poleId" in data:
        pole = db.get(Pole, data["poleId"])
        if not pole:
            raise HTTPException(status_code=400, detail="Pôle introuvable")
        if current_user.role != "admin":
            if pole.id != current_user.pole_id:
                raise HTTPException(status_code=403, detail="Vous ne pouvez pas changer le pôle de ce projet")
        data["pole_id"] = data.pop("poleId")
    
    for key, value in data.items():
        if hasattr(project, key):
            setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project_admin_dict(project)


@router.delete("/projects/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """Supprimer un projet"""
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    
    if user.role != "admin":
        if project.pole_id != user.pole_id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez supprimer que les projets de votre pôle")
    
    db.delete(project)
    db.commit()
