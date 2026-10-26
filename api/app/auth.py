from fastapi import HTTPException, Request, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Callable, Literal

from .db import get_db
from .models import User, Article, Project

Role = Literal["admin", "publisher"]


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur inactif ou introuvable")
    return user


def require_role(*required_roles: Role) -> Callable:
    def dependency(request: Request, user: User = Depends(get_current_user)) -> User:
        if user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Permission refusée")
        return user
    return dependency


def require_article_access(user: User, article: Article) -> None:
    if user.role == "admin":
        return
    if article.created_by_id != user.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez modifier que vos propres articles")
    if article.pole_id != user.pole_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas modifier un article d'un autre pôle")


def require_project_access(user: User, project: Project) -> None:
    if user.role == "admin":
        return
    if project.pole_id != user.pole_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas modifier un projet d'un autre pôle")