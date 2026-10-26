# Plan — Backend Postgres pour le site vitrine QUARANTES

## Contexte & objectif

Remplacer les mock data en dur du front (`front/lib/articles.ts`, `front/lib/projects.ts`) par un backend PostgreSQL dans `api/`, piloté depuis une console d'édition (dashboard web + CLI).

- **Phase 1** : section blog
- **Phase 2** : section projets
- **Phase 3+** : autres sections à venir

## Stack retenue

| Élément | Choix |
|---|---|
| API | Python 3.12 + **FastAPI** + **uvicorn** + pydantic v2 |
| ORM | SQLAlchemy 2.0 + **psycopg3** + **Alembic** (migrations versionnées) |
| BDD | **PostgreSQL natif (apt)** — bases `quarantes` + `quarantes_test`, accès local via `DATABASE_URL` |
| Auth | Session maison : cookie signé (`itsdangerous`, `SameSite=Strict`) + bcrypt, login admin depuis env |
| Console | **SPA React + Vite + TS + Tailwind v4** (tokens design system front réutilisés) servie par FastAPI sous `/console` + **CLI Python** (`python -m cli seed\|list\|export\|import`) |
| Front | **SSG + ISR** (`revalidate: 300`, `dynamicParams=true`), `lib/api.ts`, env `NEXT_PUBLIC_API_URL` |
| Seed | Extraction des 8 articles + 10 projets actuels → reprise à l'identique le jour J |

## Structure `api/`

```
api/
  requirements.txt / .env.example / README.md
  alembic.ini + migrations/            # schéma versionné (init + évolutions)
  app/
    main.py        # FastAPI, routers, statique /console, session middleware
    config.py      # DATABASE_URL, admin creds, secret, URL front (CORS)
    db.py          # engine SQLAlchemy
    models.py      # ORM : articles (blocks JSONB), projects (stack JSONB)
    schemas.py     # pydantic : Article, ArticleBlock (union discriminée), Project, enums pôles/statuts
    security.py    # session, bcrypt, dépendance require_admin
    routers/
      public.py    # GET /api/articles, /{slug}, /projects, /{slug}, /health
      admin.py     # POST /login, /logout, /me + CRUD articles & projets
  seed/
    articles.json  # généré depuis front/lib/articles.ts
    projects.json  # généré depuis front/lib/projects.ts
  cli/commands.py  # seed, list, export, import
  tools/extract-seed.ts  # script tsx front/lib/*.ts → seed/*.json
  scripts/db-init.sql    # CREATE DATABASE quarantes + quarantes_test + rôles
  ../admin-console/     # console SPA (pages : login, articles, éditeur bloques, projets, éditeur projet)
  tests/                # pytest (seed, endpoints publics, CRUD + session, enums)
```

## Mise en place DB (hors Docker)

1. `sudo apt install postgresql postgresql-contrib`
2. `sudo systemctl enable --now postgresql`
3. Exécuter `api/scripts/db-init.sql` (bases, rôle dédié)
4. `alembic upgrade head` ; pytest recrée `quarantes_test`

## Phase 1 — Blog (livrable n°1)

- Scaffold FastAPI + DB + schemas (modèle `Article` / `ArticleBlock` reproduit à l'identique : paragraphe, H2/H3, listes, citation, tableau, code, image, CTA).
- `extract-seed.ts` + `cli seed` → seed complet des 8 articles.
- Endpoints publics article + CRUD admin (session requis).
- Console articles : login, liste, éditeur meta (titre, slug auto, pôle, excerpt, hero image, date, readTime, auteur, featured) + **éditeur par blocs** ordonnable, publish.
- Front : `lib/api.ts` ; switch `/insights`, `/insights/[slug]` (`dynamicParams=true`), `sitemap.ts` ; constantes mock conservées en `FALLBACK_*` (dev sans API).

## Phase 2 — Projets

- Endpoints + CRUD admin ; console projets (meta, stack tags, statut, pôle, confidential, url, détail défi/approche/valeur) ; switch `/projets`. Même pattern que Phase 1.

## Phase 3+ — Extensibilité

- Template par section (table + ORM + schemas + endpoint public/admin + module console + CLI) à répliquer pour carrières, nœuds réseau, etc.

## Phase 3 — Rôles / Pôles & lien article-projet

- **Modèles** : tables `Pole` (name unique) et `User` (username, display_name, role `admin`/`publisher`, hash bcrypt, pole FK) ; `Article` et `Project` conservent un champ `pole_id` FK ; chaque modèle gère une colonne `article_slug` nullable (lien entre projet et article) exposée dans les payloads publics.
- **Auth** : session (`itsdangerous`, cookie `quarantes_session`) ; auth 100% DB (plus de secret admin en env). Comptes de développement créés par `seed.py` : `admin` / `admin123` (pôle KOF Corporation) et éditeurs `publisher` / `publisher123` rattachés à leur pôle respectif.
- **Endpoints admin** : CRUD `users` + `poles` ; ajout de `UserUpdate.password` pour le reset ; permissions : admin voit tout, publisher restreint à son pôle (403 hors périmètre) ; `GET /me` et `GET /me/poles` enrichis.
- **Migration** : `abcd12345678` — crée les tables `poles`/`users`, insère les pôles de base et les comptes, maj les FK des articles/projets, supprime les colonnes legacy (`pole`, `author_*`) en upgrade ; les recrée avec backfill dans le downgrade.
- **Console** : pages Pôles et Utilisateurs (CRUD) ; éditeurs Article/Project : sélecteurs de pôle (sélection multiple pour les articles), champ `article_slug` pour lier un projet à un article existant ; réinitialisation de mot de passe possible depuis l'onglet utilisateur.
- **Front** : `ProjectCard` affiche un lien « Lire l'article complet » vers `/insights/{articleSlug}` (locale-aware) quand un `articleSlug` est défini sur le projet.
- **Tests** : 34 tests (permissions publisher, user/password update, tri des pôles, seed idempotent).

---

## Vérification & déploiement

- `pytest`, `python -m cli seed`, curl publics, `tsc --noEmit` front, CRUD console → vérif ISR `/insights`.
- Coolify : app `api` (uvicorn, `alembic upgrade head` en démarrage) + service Postgres provisionné + volume ; front branché via `NEXT_PUBLIC_API_URL` + CORS.
- `api/` en repo git dédié (la racine n'étant pas un repo), port API dev `8000`.