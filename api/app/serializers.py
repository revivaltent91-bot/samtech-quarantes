from .models import Article, Project, User


def user_to_author_dict(user: User) -> dict:
    return {
        "name": user.display_name,
        "role": user.user_role,
        "pole": user.pole.name
    }


def article_to_dict(a: Article, *, include_blocks: bool = True) -> dict:
    out = {
        "slug": a.slug,
        "title": a.title,
        "pole": a.pole.name,
        "excerpt": a.excerpt,
        "heroImage": a.hero_image,
        "publishedAt": a.published_at,
        "readTime": a.read_time,
        "author": user_to_author_dict(a.author),
        "featured": a.featured,
    }
    if include_blocks:
        out["blocks"] = a.blocks
    return out


def article_admin_dict(a: Article) -> dict:
    return {
        "id": a.id,
        **article_to_dict(a, include_blocks=True),
        "createdAt": a.created_at.isoformat() if a.created_at else None,
        "updatedAt": a.updated_at.isoformat() if a.updated_at else None,
        "authorId": a.author_id,
        "createdById": a.created_by_id,
        "poleId": a.pole_id
    }


def project_to_dict(p: Project, *, include_detail: bool = True) -> dict:
    out = {
        "slug": p.slug,
        "title": p.title,
        "pole": p.pole.name,
        "status": p.status,
        "description": p.description,
        "stack": p.stack,
        "confidential": p.confidential,
        "url": p.url,
        "featured": p.featured,
        "articleSlug": p.article_slug,
    }
    if include_detail:
        out["detail"] = p.detail
    return out


def project_admin_dict(p: Project) -> dict:
    return {
        "id": p.id,
        **project_to_dict(p, include_detail=True),
        "createdAt": p.created_at.isoformat() if p.created_at else None,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None,
        "createdById": p.created_by_id,
        "poleId": p.pole_id
    }


def flatten_article(data: dict) -> dict:
    d = dict(data)
    pole_id = d.pop("poleId", None)
    author_id = d.pop("authorId", None)
    created_by_id = d.pop("createdById", None)
    d["pole_id"] = pole_id
    d["author_id"] = author_id
    d["created_by_id"] = created_by_id
    d["hero_image"] = d.pop("heroImage", "")
    d["published_at"] = d.pop("publishedAt", "")
    d["read_time"] = d.pop("readTime", 0)
    # Supprimer les anciens champs si présents
    d.pop("pole", None)
    d.pop("author", None)
    return d


def flatten_project(data: dict) -> dict:
    d = dict(data)
    pole_id = d.pop("poleId", None)
    created_by_id = d.pop("createdById", None)
    article_slug = d.pop("articleSlug", None)
    d["pole_id"] = pole_id
    d["created_by_id"] = created_by_id
    d["article_slug"] = article_slug
    # Supprimer l'ancien champ si présent
    d.pop("pole", None)
    return d