import argparse
import json
from pathlib import Path
from sqlalchemy import select

from app.db import Base, engine, SessionLocal
from app.models import Article, Project, Pole, User
from app.security import hash_password
from app.seed import upsert_articles, upsert_projects

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"


def cmd_seed(args: argparse.Namespace) -> None:
    if args.reset:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Base réinitialisée (drop + create).")

    db = SessionLocal()
    
    # 1. Créer les pôles si inexistants
    existing_poles = {p.name for p in db.scalars(select(Pole)).all()}
    new_poles = [
        "KARABA", "KOF Corporation", "TÉPÉ", 
        "Quarantes Studio", "R&D", "Vision"
    ]
    for pole_name in new_poles:
        if pole_name not in existing_poles:
            pole = Pole(name=pole_name, is_active=True)
            db.add(pole)
    db.commit()
    
    # 2. Créer l'utilisateur admin par défaut
    admin_username = "admin"
    admin_hash = "$2b$12$KI5aOWSv4QhAhq/5o.FZa.ynC5s58IJxULfJYzoV6RfkG0.wX2Fr6"  # admin123
    kof_pole = db.scalar(select(Pole).where(Pole.name == "KOF Corporation"))
    
    if not db.scalar(select(User.id).where(User.username == admin_username)):
        admin = User(
            username=admin_username,
            display_name="Administrateur",
            password_hash=admin_hash,
            role="admin",
            user_role="Administrator",
            pole_id=kof_pole.id if kof_pole else 1,
            is_active=True
        )
        db.add(admin)
    db.commit()
    
    # 3. Seeder les articles et projets
    count_a = upsert_articles(db)
    count_p = upsert_projects(db)
    db.commit()
    db.close()
    print(f"Seed OK — {count_a} articles créés, {count_p} projets créés (upsert).")


def cmd_list(args: argparse.Namespace) -> None:
    db = SessionLocal()
    if args.resource == "articles":
        rows = db.query(Article).order_by(Article.published_at.desc()).all()
        for a in rows:
            print(f"{a.published_at}  {a.slug}  [{a.pole}]  {a.title}")
    else:
        rows = db.query(Project).order_by(Project.id).all()
        for p in rows:
            print(f"{p.status:14} {p.slug}  [{p.pole}]  {p.title}")
    db.close()
    print(f"{len(rows)} entrées")


def cmd_export(args: argparse.Namespace) -> None:
    db = SessionLocal()
    if args.resource == "articles":
        rows = db.query(Article).order_by(Article.id).all()
        out = [_to_payload(a) for a in rows]
    else:
        rows = db.query(Project).order_by(Project.id).all()
        out = [_to_payload(p) for p in rows]
    db.close()
    path = Path(args.file)
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(out)} entrées exportées vers {path}")


def _to_payload(obj) -> dict:
    if isinstance(obj, Article):
        return {
            "slug": obj.slug,
            "title": obj.title,
            "pole": obj.pole,
            "excerpt": obj.excerpt,
            "heroImage": obj.hero_image,
            "publishedAt": obj.published_at,
            "readTime": obj.read_time,
            "author": {
                "name": obj.author_name,
                "role": obj.author_role,
                "pole": obj.author_pole,
            },
            "featured": obj.featured,
            "blocks": obj.blocks,
        }
    return {
        "slug": obj.slug,
        "title": obj.title,
        "pole": obj.pole,
        "status": obj.status,
        "description": obj.description,
        "stack": obj.stack,
        "confidential": obj.confidential,
        "url": obj.url,
        "featured": obj.featured,
        "detail": obj.detail,
    }


def cmd_import(args: argparse.Namespace) -> None:
    db = SessionLocal()
    path = Path(args.file)
    if args.resource == "articles":
        count = upsert_articles(db, path=path)
    else:
        count = upsert_projects(db, path=path)
    db.commit()
    db.close()
    print(f"Import OK — {count} nouvelles entrées (upsert).")


def cmd_hash_password(args: argparse.Namespace) -> None:
    print(hash_password(args.password))


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="cli", description="Console CLI QUARANTES API")
    sub = parser.add_subparsers(dest="command", required=True)

    p_seed = sub.add_parser("seed", help="Charge les données seed dans la base")
    p_seed.add_argument("--reset", action="store_true", help="Réinitialise toutes les tables")
    p_seed.set_defaults(func=cmd_seed)

    p_list = sub.add_parser("list", help="Liste articles ou projets")
    p_list.add_argument("resource", choices=["articles", "projects"])
    p_list.set_defaults(func=cmd_list)

    p_exp = sub.add_parser("export", help="Exporte une ressource en JSON")
    p_exp.add_argument("resource", choices=["articles", "projects"])
    p_exp.add_argument("--file", default=None)
    p_exp.set_defaults(func=cmd_export)

    p_imp = sub.add_parser("import", help="Importe une ressource depuis un JSON")
    p_imp.add_argument("resource", choices=["articles", "projects"])
    p_imp.add_argument("--file", required=True)
    p_imp.set_defaults(func=cmd_import)

    p_hash = sub.add_parser("hash-password", help="Génère un hash bcrypt")
    p_hash.add_argument("password")
    p_hash.set_defaults(func=cmd_hash_password)

    args = parser.parse_args(argv)

    from .utils import ensure_env

    if args.command != "hash-password":
        ensure_env()

    func = args.func
    if args.command == "export" and args.file is None:
        args.file = SEED_DIR / f"{args.resource}.json"
    args.func(args)


if __name__ == "__main__":
    main()