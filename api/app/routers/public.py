from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Article, Project, Pole
from ..schemas import PROJECT_STATUSES
from ..serializers import article_to_dict, project_to_dict

router = APIRouter(tags=["public"])


@router.get("/meta")
def meta(db: Session = Depends(get_db)) -> dict:
    """Retourne les métadonnées (pôles, statuts) depuis la BD"""
    poles = db.scalars(
        select(Pole).where(Pole.is_active == True).order_by(Pole.name)
    ).all()
    
    return {
        "articlePoles": [p.name for p in poles],
        "projectPoles": [p.name for p in poles],
        "projectStatuses": list(PROJECT_STATUSES),
    }


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/articles")
def list_articles(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(
        select(Article).order_by(Article.published_at.desc(), Article.id.desc())
    ).all()
    return [article_to_dict(a, include_blocks=False) for a in rows]


@router.get("/articles/{slug}")
def get_article(slug: str, db: Session = Depends(get_db)) -> dict:
    a = db.scalar(select(Article).where(Article.slug == slug))
    if not a:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return article_to_dict(a, include_blocks=True)


@router.get("/projects")
def list_projects(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(
        select(Project).order_by(Project.featured.desc(), Project.id.asc())
    ).all()
    return [project_to_dict(p, include_detail=False) for p in rows]


@router.get("/projects/{slug}")
def get_project(slug: str, db: Session = Depends(get_db)) -> dict:
    p = db.scalar(select(Project).where(Project.slug == slug))
    if not p:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    return project_to_dict(p, include_detail=True)