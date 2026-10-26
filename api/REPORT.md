# Rapport de travaux — Backend Postgres + Console d'édition + Front API

> Période : phases 1 (blog), 2 (projets) et 3 (rôles/pôles + lien article-projet) — branche `feature/users-poles-article-link` de `api/`
>
> Fichier compagnon du plan stratégique : `api/PLAN.md`

---

## 1. Objectif

Remplacer les données mock en dur du site vitrine (`front/lib/articles.ts`, `front/lib/projects.ts`) par une source de vérité **PostgreSQL** servie par une **API**, pilotée depuis une **console d'édition** accessible aux administrateurs — sans dépendre de services tiers (auth maison), et sans Docker côté développement.

Le front est censé rester rapide : il conserve sa génération statique (SSG) et l'actualise par **ISR** (revalidation à 5 minutes), avec repli automatique sur les données de secours si l'API est injoignable.

---

## 2. Choix techniques (validés)

| Élément | Choix | Justification |
|---|---|---|
| API | Python **FastAPI** + pydantic v2 + uvicorn | Camera rapide, validation de schémas, OpenAPI auto |
| ORM / migrations | SQLAlchemy 2.0 + **psycopg3** + **Alembic** | Schéma versionné, champs JSONB libres |
| BDD | **PostgreSQL natif (apt)**, bases `quarantes` + `quarantes_test` | Dev en local, pas de conteneur |
| Auth | Session maison : cookie signé (`itsdangerous`, `SameSite=Strict`) + **bcrypt** | Autonome, pas de dépendance OAuth |
| Console | **SPA React + Vite + TypeScript + Tailwind v4** servie par FastAPI sous `/console` | Accès `/console` unique, assets en dur |
| CLI | `python -m cli` (`seed`, `list`, `export`, `import`, `hash-password`) | Opérations d'exploitation sans navigateur |
| Front | **SSG + ISR** (`revalidate: 300`, `dynamicParams=true`), `lib/api.ts` | Garde le SEO/zero-JS, contenu rafraîchi |
| Seed | Extraction des 8 articles + 10 projets en place → reprise à l'identique | Continuité du contenu le jour du switch |

---

## 3. Structure du dépôt `api/`

```
api/
  requirements.txt · requirements-dev.txt · .env(.example) · PLAN.md
  alembic.ini + migrations/versions/  # fd3031e805b9 (init) + abcd12345678 (users/poles/article_slug)
  app/
    main.py        # app FastAPI, middleware session/CORS, mount statique /console
    config.py      # DATABASE_URL, session secret, CORS (from env)
    db.py          # engine + session SQLAlchemy
    models.py      # ORM Article, Project (stack/detail JSONB), Pole, User (auth 100 % DB)
    schemas.py     # pydantic Article/ArticleBlock (union discriminée), Project, enums depuis DB
    security.py    # bcrypt, session, dépendances require_login / require_role / require_pole_access
    serializers.py # dict camelCase <-> ORM, flatten pour upsert
    seed.py        # upsert_articles / upsert_projects / upsert_users & poles depuis seed/*.json
    routers/
      public.py    # /api/meta, /health, /articles[/{slug}], /projects[/{slug}]
      admin.py     # /api/admin login, logout, me + CRUD articles/projets plus users & poles (session requis)
  cli/commands.py · __main__.py · utils.py
  tools/extract-seed.ts   # export TS → seed/*.json (Node 24 natif)
  scripts/db-init.sql     # rôles + CREATE DATABASE quarantes & quarantes_test
  seed/articles.json · projects.json · users.json · poles.json
  ../admin-console/       # console SPA (src/components/…, dist/ buildé en dur, hors git)
  tests/           # conftest.py + test_public / test_admin / test_seed / test_meta (34 tests)
```

---

## 4. Backend — détail

### 4.1 Modèle de données

- **`Article`** : slug (unique), title, pole (FK `poles.id`), excerpt, hero_image, published_at, read_time, featured, author (FK `users.id`), **`article_slug` nullable** (lien article ↔ projet), `blocks` **JSONB**.
- **`Block`** : union discriminée de 8 types — `paragraph`, `heading` (H2/H3), `list` (items + ordered), `quote` (auteur optionnel), `table` (headers + rows + caption), `code` (langage + contenu), `image` (src/alt/caption), `cta` (text/href/label). La structure reproduit exactement le type TS du front.
- **`Project`** : slug, title, pole (FK `poles.id`), status, description, `stack` JSONB, confidential, url, featured, `detail` JSONB nullable (`challenge/approach/value`), **`article_slug` nullable** (renvoie vers `/insights/{slug}`).
- **`Pole`** : name unique (ex. `KARABA`, `KOF Corporation`, `TÉPÉ`, `Quarantes Studio`, `R&D`, `Vision`, `QUARANTES`).
- **`User`** : username unique, display_name, role (`admin` | `publisher`), hash bcrypt, pole (FK `poles.id`). Un éditeur peut être rattaché à un pôle (privilège d'édition sur ses contenus).
- **Enums** (pôles articles/projets et statuts projets) définis en base et retournés par `/api/meta` (triés par nom).

### 4.2 API publique (`/api/…`)

| Endpoint | Comportement |
|---|---|
| `GET /api/meta` | enums des pôles/statuts (consommation console) |
| `GET /api/health` | `{"status": "ok"}` |
| `GET /api/articles` | liste triée (publié desc), **sans** `blocks` (payload léger) |
| `GET /api/articles/{slug}` | article complet **avec** `blocks` ; 404 sinon |
| `GET /api/projects` | liste triée (featured desc), **sans** `detail` |
| `GET /api/projects/{slug}` | projet complet **avec** `detail` |

Réponse 100 % camelCase (même shape que les types TS du front → zéro mapping côté client).

### 4.3 API admin (`/api/admin/…`)

- `POST /login` (rate limit — 5 tentatives/15 min par IP, `itsdangerous`), `POST /logout`, `GET /me` (charge l'utilisateur + son pôle), `GET /me/poles`.
- CRUD : `POST/GET articles`, `GET/PUT/DELETE /articles/{id}` ; idem `projects`, **users** et **poles**.
- Permissions : un admin voit/édite tout ; un **publisher** est restreint à son pôle (articles et projets) — 403 sinon.
- **Reset de mot de passe** : `PUT /users/{id}` accepte `password` (réservé admin) → hash bcrypt.
- Validation (409) : slug/username/pôle dupliqués ; pôles/statuts hors base rejetés (422).
- Conventions : suppression définitive avec confirmation serveur ; erreurs renvoyées en `detail` exploitable par la console.

### 4.4 Sécurité

- Mots de passe hachés **bcrypt** (facteur 12).
- Cookie de session signé `quarantes_session`, `SameSite=strict`, durée 7 jours.
- CORS restreint à `settings.cors_origins` (front dev/prod).
- Depuis env : `DATABASE_URL`, `SESSION_SECRET`, `FRONT_ORIGINS`. **Les comptes et mots de passe (`ADMIN_PASSWORD_HASH` en bcrypt) vivent en base** — jamais de secret en clair dans le repo ; les identifiants dev sont documentés en bas de ce fichier.

---

## 5. Seed & CLI

- `tools/extract-seed.ts` (run `node tools/extract-seed.ts`) re-lit `front/lib/articles.ts` / `front/lib/projects.ts` et écrit `seed/articles.json` (8 articles) et `seed/projects.json` (10 projets) — **contenu identique** au site actuel.
- `python -m cli seed` → upsert idempotent (8 articles, 10 projets en base).
- Autres commandes : `list`, `export`, `import`, `hash-password`.
- `scripts/db-init.sql` : rôle `quarantes` + bases `quarantes` (dev) et `quarantes_test` (pytest).
- `DATABASE_URL=postgresql+psycopg://quarantes:quarantes@localhost:5432/quarantes` ; tests sur `quarantes_test`.

---

## 6. Console SPA (React + Vite, sous `/console`)

- **Auth** : écran de login ; les routes de la console ne sont rendues que si `/api/admin/me` répond ; état persisté dans la session HTTP (cookie).
- **Design** : tokens du design system réutilisés (`globals.css`) : fond obsidienne, accents or, typographie front — rendu cohérent avec le site vitrine.
- **Pages / composants** :
  - `Login.tsx` — formulaire + message d'erreur.
  - `ArticleList.tsx` — liste paginée, filtres pôle/à-la-une, boutons éditer/supprimer.
  - **`ArticleEditor.tsx`** — métadonnées (titre, slug auto-généré depuis le titre, pôle, excerpt, hero image, date, temps de lecture, auteur nom/fonction/pôle, featured) + **`BlockEditor.tsx`** :
    - ajout des 8 types de blocs,
    - réordonnancement (monter/descendre), suppression,
    - enregistrement par formulaire unique (création ou mise à jour selon l'id).
  - `ProjectList.tsx` + `ProjectEditor.tsx` — meta (titre, slug auto, pôle, statut, description, stack en tags via virgules, url, featured, confidential), **détail** `challenge/approach/value` activable/désactivable.
  - `ui.tsx` — primitives réutilisables (boutons, inputs, select, checkbox, champs avec label, lignes de liste).
- **Build** : `web/` → `npm run build` → `dist/` monté par FastAPI (`app.mount("/console", StaticFiles(html=True))`). `vite base: '/console/'` pour des URLs d'assets correctes.
- En dev : Vite sur son port avec proxy `/api → 127.0.0.1:8000`.

---

## 7. Front — intégration API

Fichiers modifiés (`front/`):

| Fichier | Changement |
|---|---|
| `lib/articles.ts` | constants mock renommés `FALLBACK_ARTICLES` ; `getArticle(slug, source)` et `getRelatedArticles(source, article, limit)` acceptent une source |
| `lib/projects.ts` | idem → `FALLBACK_PROJECTS` ; `getActiveProjects(source)`, `getFeaturedProjects(source)`, `getProject(slug, source)` |
| `lib/api.ts` (**nouveau**) | `getArticles`, `getArticle(slug)` (null si 404/injoignable), `getProjects` ; `fetch(…, { next: { revalidate: 300 } })` ; `API_URL` depuis env (`API_URL` → `NEXT_PUBLIC_API_URL` → `http://127.0.0.1:8000`) |
| `app/insights/page.tsx` | async, charge l'API avec repli sur `FALLBACK_ARTICLES` |
| `app/insights/[slug]/page.tsx` | `dynamicParams = true`, `generateStaticParams` async, **fetch du détail en premier** (l'article de la liste n'a pas `blocks`), repli, `notFound()` |
| `app/projets/page.tsx` | async, charge l'API avec repli sur `FALLBACK_PROJECTS` |
| `app/sitemap.ts` | async, URLs articles depuis l'API (repli) |
| `.env.example` | ajout de `API_URL` |

Le comportement en baisse d'API est **dégradé mais fonctionnel** : le site continue d'afficher les données de secours sans aucune erreur.

---

## 8. Install, exécution, opérations

```bash
# BDD (une fois)
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres psql < api/scripts/db-init.sql

# Backend
cd api
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # ajuster mdp admin + secret si besoin
alembic upgrade head
python -m cli seed
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Console SPA
cd ../admin-console && npm install && npm run build     # → ../admin-console/dist servie sur /console

# Tests
cd api && .venv/bin/python -m pytest -q        # 34 passed

# Front
cd front
npm install
npx tsc --noEmit                               # lint = typecheck
npm run dev                                    # → http://localhost:3000
npm run build && npm run start                 # validation SSG/ISR
```

**Identifiants console (développement)** — comptes créés par seed : `admin` / `admin123` (pôle KOF Corporation) et éditeurs `publisher` rattachés à leur pôle avec mot de passe commun `publisher123` (voir `seed/users.json`).

---

## 9. Validation effectuée

- `pytest` : **34 tests verts** (seed idempotent, endpoint publics 200/404, login ok/ko + rate limit, CRUD admin avec session, validation enums, 409 slug dupliqué, permissions publisher, user + password update, tri des pôles de `/api/meta`). La fixture de base est fonction-scope (recrée `quarantes_test` à chaque test) → aucun test pollué.
- Migration `abcd12345678` : aller-retour validé sur `quarantes_test` (upgrade head → downgrade base → upgrade head, avec suppression des colonnes legacy et backfill), puis appliquée sur la base dev sans perte de données.
- `python -m cli seed` : upsert idempotent — 8 articles, 10 projets, pôles + comptes (admin + publishers).
- Console : `npm run build` OK ; recette sous `/console` (login admin et publisher, `/api/meta` trié, projet exposant `articleSlug` → `/insights/{slug}`).
- Aucune alerte critique : seuls des `DeprecationWarning` Starlette (alias `anyio.abc.BlockingPortal`) sans impact.
- `tsc --noEmit` + `next build` : OK — `/insights` et les pages `/insights/[slug]` en **SSG** (ISR 5 min), `/projets` en SSG (ISR 5 min), `/sitemap.xml` généré.

---

## 10. Commits

| Repo | Commit | Contenu |
|---|---|---|
| `api/` | `5fb34e8` | Scaffold backend : FastAPI + Postgres + Alembic + seed + CRUD admin |
| `api/` | `c2ca064` | Console React (articles/projets) servie sous `/console` |
| `front/` | `b1e880e` | Serve insights/projets depuis l'API avec ISR + fallback |
| `api/` | (phase 3, feature) | Comptes publisher + reset mot de passe + pôles en base (migration `abcd12345678`) |
| `api/` | (phase 3, feature) | Nettoyage legacy admin-env + tri de `/api/meta` + tests (34) |
| `front/` | (phase 3, feature) | Lien du projet vers l'article (locale-aware) |

## 11. Phase 3 — Rôles, pôles & lien article-projet (specs livrées)

- **Spec 1 — `docs/ARCHITECTURE_NOUVEAUX_ROLES_POLES.md`** : modèles `Pole` et `User` en base ; 2 rôles (`admin`, `publisher`) ; privilège de pôle restreint en écriture (403 hors pôle) ; `UserUpdate.password` (reset admin) ; console : pages Pôles & Utilisateurs (CRUD) ; `<select>` pôle sur les éditeurs article/projet ; comptes dev seedés (admin `admin123`, publishers `publisher123`) ; supprimés : enums python, `Author` (3 colonnes → FK), colonnes legacy `pole`/`author_*` (migration).
- **Spec 2 — `docs/AJOUT_LIEN_ARTICLE_PROJET.md`** : `article_slug` (nullable) sur `Article` et `Project` ; exposé dans les payloads publics (`/api/articles`, `/api/projects`) ; la carte projet affiche « Lire l'article complet » (locale-aware) quand un lien existe.

## 12. Prochaines étapes

1. **Déploiement** : Coolify — app `api` (uvicorn + `alembic upgrade head` au démarrage), service Postgres avec volume persistant ; front branché via `API_URL` + CORS.
2. **Durcissement production** : rotation `SESSION_SECRET`, mots de passe forts par utilisateur via la console, HTTPS (`https_only=True`), `pyproject.toml`/lockfile.
3. **Phase 3+** : grille d'extensibilité par section (table + ORM + schemas + endpoint + composant console + CLI) pour carrières et autres contenus.
4. **UX console** : image upload (stockage local/S3), aperçu article avant publication, brouillons (statut `draft`), audit trail.

## 13. Restrictions & rappels

- L'agent n'a pas accès à `sudo` : installation PostgreSQL (apt) réalisée par l'utilisateur ; les commandes `db-init.sql` ont été exécutées avec `sudo -u postgres psql` côté utilisateur.
- `api/` est un **repo git dédié** (la racine ``enterprise-project`` n'est pas un repo) ; `front/` est un repo git séparé.
- Les données mock restent dans `lib/*.ts` en tant que **fallback** — ne pas supprimer sans endpoint de secours équivalent.