# Mémoire projet — QUARANTES (enterprise-project)

Site vitrine de **QUARANTES Holding** porté par une API PostgreSQL + console d'édition, sans services tiers.

## Architecture

| Dossier | Rôle | Repo git |
|---|---|---|
| `front/` | Landing page Next.js (v16, React 19, Tailwind v4, TypeScript), SSG + ISR | repo séparé |
| `api/` | Backend FastAPI (Python, SQLAlchemy 2.0, psycopg3, Alembic) + console SPA + CLI | repo git dédié |
| `docs/` | Cahier des charges + rapports | non-versionné |

La racine `enterprise-project/` **n'est pas** un repo git (docs de référence : `REPORT.md`, `api/PLAN.md`).

## Règles d'agent

- Ne jamais supprimer les données mock `front/lib/articles.ts` / `front/lib/projects.ts` (constantes `FALLBACK_*`) : ce sont le repli quand l'API est injoignable.
- Ne jamais committer de mot de passe en clair : seul `SESSION_SECRET` vient d'env (les comptes et hashes bcrypt vivent en base, seedés via `seed/users.json` → `python -m cli seed`).
- Pas de Docker pour la BDD : PostgreSQL natif (apt), bases `quarantes` (dev) et `quarantes_test` (pytest).
- Réponses API en 100 % camelCase, même shape que les types TS du front (zéro mapping client).
- Langue des documents du projet : français.
- `api/` et `front/` sont des repos git distincts : commits séparés par dossier.

## Backend (`api/`) — FastAPI

Structure : `app/main.py` (session/CORS, mount `/console`), `app/config.py`, `app/models.py`, `app/schemas.py`, `app/security.py`, `app/auth.py` (dépendances `require_login`/`require_role`/`require_pole_access`), `app/routers/public.py` + `admin.py`, `cli/`, `seed/` (articles.json, projects.json, users.json, poles.json), `migrations/` (Alembic), `../admin-console/` (console SPA), `tests/`.

Modèle : `Article` (blocks JSONB — 8 types : paragraph, heading, list, quote, table, code, image, cta ; pole_id FK, author FK), `Project` (stack/detail JSONB, pole_id FK), `Pole` (name unique), `User` (role : admin/publisher, hash bcrypt, pole FK). `Article.article_slug` / `Project.article_slug` (nullable) relient projet ↔ article (spec lien).

Endpoints publics : `/api/meta` (pôles/statuts depuis la base, triés), `/api/health`, `/api/articles[/{slug}]`, `/api/projects[/{slug}]` (projet avec `articleSlug`).
Admin (session requise) : `/api/admin/login|logout|me|me/poles` + CRUD articles/projets **et** users/pôles (409 slug/username/nom dupliqué). Permissions : admin → tout ; publisher → restreint à son pôle (403 sinon). Reset de mot de passe : `UserUpdate.password` (admin).

### Commandes utiles (depuis `api/`)

```bash
. .venv/bin/activate
alembic upgrade head
python -m cli seed            # upsert idempotent des seed/articles.json + projects.json + users.json + poles.json
python -m cli hash-password   # générer un hash bcrypt (comptes users dans seed/users.json)
uvicorn app.main:app --host 127.0.0.1 --port 8000
pytest -q                     # ~34 tests, recrée quarantes_test à chaque test
```

Console SPA : `cd ../admin-console && npm run build` → `dist/` servie par FastAPI sous `/console` (`vite base='/console/'`).

### Env (`api/.env`)

`DATABASE_URL` (postgresql+psycopg, port 5432), `SESSION_SECRET`, `FRONT_ORIGINS` (CORS).

## Front (`front/`) — Next.js

- SSG + ISR (`revalidate: 300`, `dynamicParams=true`) via `lib/api.ts` (`API_URL` → `NEXT_PUBLIC_API_URL` → `http://127.0.0.1:8000`).
- Brutalement : l'API n'est jamais appelée au build des routes ; les pages font un fetch avec repli sur `FALLBACK_*`.
- Rendue des articles par blocs : `components/insights/ArticleContent.tsx`.

### Commandes utiles (depuis `front/`)

```bash
npm run lint     # = tsc --noEmit (le typecheck EST le lint)
npm run build    # validation SSG/ISR
npm run dev      # http://localhost:3000
```

## Vérification avant livraison

1. `cd api && pytest -q`
2. `cd front && npm run lint && npm run build`

## Déploiement cible

VPS + Coolify + Nixpacks ; app `api` (uvicorn + `alembic upgrade head` au démarrage) + service Postgres ; front branché via `NEXT_PUBLIC_API_URL` + CORS. Identifiants console dev (seed) : `admin` / `admin123` (admin), publishers `publisher123` (voir `seed/users.json`), dont `admin` rattaché au pôle KOF Corporation.