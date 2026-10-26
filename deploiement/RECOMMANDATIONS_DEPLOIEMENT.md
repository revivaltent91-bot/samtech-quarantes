# Recommandations de déploiement — QUARANTES

> Cible : VPS + Coolify + Nixpacks — app `api` (FastAPI + console `/console`), service PostgreSQL, app `front` (Next.js SSG/ISR).
> Fichier de référence : `REPORT.md`, `api/PLAN.md`. Langue : français.

---

## 1. Architecture cible

| App | Repo GitHub | Domaine | Runtime | Détails |
|---|---|---|---|---|
| **api** | `TEPE-Togo/quarante-api` (à créer, branche `main`) | `https://api.quarante.studio` | Python 3.12 + (Node pour la console) | FastAPI + uvicorn, migrations au démarrage, console montée sur `/console` |
| **postgres** | — (service Coolify) | interne (réseau Coolify) | PostgreSQL avec volume persistant | base `quarantes` |
| **front** | `TEPE-Togo/quarante-landing` (existe déjà) | `https://quarante.studio` | Node 20+/Next.js 16 | SSG + ISR (`revalidate: 300`), repli `FALLBACK_*` sans API |
| **admin-console** | `TEPE-Togo/quarante-console` (à créer, branche `main`) | — (dépendance de `quarante-api`) | React + Vite (build) | le `dist/` est embarqué dans le repo `api/` pour le déploiement |

- CORS API : `FRONT_ORIGINS=https://quarante.studio,https://www.quarante.studio`.
- TLS : Let's Encrypt automatique par Coolify/Traefik, force HTTPS.
- DNS : records A de `quarante.studio`, `www.quarante.studio`, `api.quarante.studio` → IP du VPS.

---

## 2. Constats bloquants à traiter avant déploiement

1. **Repos non hébergeables tels quels** : `api/` et `admin-console/` n'ont **aucun remote GitHub** ; `api/` n'a même pas de branche `main` (deux branches `feature/*`), `admin-console/` est sur `refonte-console-cms`. Coolify déploie depuis un dépôt git.
2. **Console hors du repo `api/`** : `api/app/main.py` monte le SPA via `../admin-console/dist` (dossier frère, chemin `parents[2]/admin-console/dist`). Sur le VPS ce dossier n'existe pas → `/console` répondrait 503. Il faut embarquer le `dist/` **dans** le repo `api/` (voir §3).
3. **Pas de migrations au démarrage** : `main.py` n'a aucun hook `alembic upgrade head` ; la spec « migrations au démarrage » n'est pas encore implémentée.
4. **`https_only=False` en dur** (`api/app/main.py`, `SessionMiddleware`) — non paramétrable sans modification.
5. **`SESSION_SECRET`** : valeur par défaut `change-me-in-production` (`api/app/config.py`) — interdite en prod.
6. **Seed dev en dur** : hash bcrypt `admin123` / `publisher123` codés dans `api/app/seed.py` et `api/cli/commands.py`. Ces comptes ne doivent pas survivre en prod (rotation immédiate après 1er seed).
7. **Aucune commande de démarrage explicite** (pas de `Procfile`/`nixpacks.toml`) : Nixpacks auto-détecte, mais l'enchaînement « migrations → uvicorn » doit être spécifié.
8. **Équipe locale** : pas de CLI `gh`, pas de clé SSH GitHub → le push nécessitera les identifiants de l'utilisateur.

---

## 3. Prérequis code recommandés (modifications à faire au préalable)

Ces changements sont **des recommandations de code** — à faire dans les repos avant de pousser `main`.

### `api/`
- **Console auto-portée** : résoudre le `dist/` en priorité sur `api/admin-console/dist` (dans le repo), avec repli sur le chemin frère de dev ; ajouter `api/scripts/build-console.sh` qui construit `admin-console` (`npm ci && npm run build`, base vite déjà `/console/`) et copie `dist/` vers `api/admin-console/dist/` (artefact committé dans le repo api). Le source reste dans `TEPE-Togo/quarante-console`.
- **Migrations au démarrage** : hook de démarrage exécutant `alembic upgrade head` (idempotent).
- **HTTPS configurable** : nouveau réglage `session_https_only: bool`, lu via env (`SESSION_HTTPS_ONLY=true` en prod).
- **Seed first-boot** : déclencher `python -m cli seed` (idempotent) une fois la base migrée.
- **`Procfile`** (ou commande de démarrage Coolify) :
  `web: alembic upgrade head && python -m cli seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Branche `main`** : créer depuis `feature/users-poles-article-link` et pousser.

### `admin-console/`
- Renommer/créer la branche `main` depuis `refonte-console-cms` et pousser vers `TEPE-Togo/quarante-console`.

### `front/`
- Merger `feature/users-poles-article-link` (et branches i18n/theme si non mergées) dans `main` et pousser.
- Aucune dépendance au build : le SSG ne requiert pas l'API (repli `FALLBACK_*`, sitemap en try/catch).

---

## 4. Étapes GitHub

```bash
# Authentification (au choix)
gh auth login          # ou configurer une clé SSH GitHub

# api (choix applicatif retenu : privé)
gh repo create TEPE-Togo/quarante-api --private
# admin-console
gh repo create TEPE-Togo/quarante-console --private
# front : déjà hébergé (TEPE-Togo/quarante-landing)

# Pousser les branches main
cd api && git push -u origin main
cd ../admin-console && git push -u origin main
cd ../front && git push -u origin main
```

---

## 5. Étapes Coolify / DNS

### DNS
- A records → IP du VPS pour `quarante.studio`, `www.quarante.studio`, `api.quarante.studio`.
- Activer le TLS Let's Encrypt sur chaque domaine (force HTTPS).

### Ressource PostgreSQL
1. Coolify → New Resource → PostgreSQL.
2. Volume persistant activé.
3. Note de côté l'identifiant/mot de passe générés.
4. Créer la base `quarantes`.
5. `DATABASE_URL=postgresql+psycopg://<user>:<pass>@<service>:5432/quarantes`

### App `api`
1. New Application → From Git → `TEPE-Togo/quarante-api` (branche `main`).
2. Builder : Nixpacks. Port : `8000`.
3. Domaine : `https://api.quarante.studio`.
4. Variables d'environnement :
   - `DATABASE_URL` (ci-dessus)
   - `SESSION_SECRET` — fort, généré par exemple `openssl rand -hex 32`
   - `FRONT_ORIGINS=https://quarante.studio,https://www.quarante.studio`
   - `SESSION_HTTPS_ONLY=true`
5. Déployer puis vérifier : `/api/health`, `/api/meta`, `/console`.

### App `front`
1. New Application → From Git → `TEPE-Togo/quarante-landing` (branche `main`).
2. Builder : Nixpacks (détection Next.js). Port : `3000`.
3. Domaine : `https://quarante.studio`.
4. Variables d'environnement :
   - `NEXT_PUBLIC_SITE_URL=https://quarante.studio`
   - `API_URL=https://api.quarante.studio`
5. Déployer puis vérifier : `/`, `/insights`, `/projets`, `/sitemap.xml`.

---

## 6. Durcissement post-déploiement

1. **Changer immédiatement le mot de passe admin** : console → Utilisateurs → reset, via un hash fort (`python -m cli hash-password` en local).
2. **Supprimer ou désactiver** les comptes publisher dev créés par le seed.
3. Vérifier `SESSION_SECRET` non par défaut et `SESSION_HTTPS_ONLY=true`.
4. Vérifier que l'ISR du front ne repose que sur des requêtes **côté serveur** vers l'API (déjà le cas : `front/lib/api.ts` ; aucun fetch client).

---

## 7. Checklist de validation avant mise en production

```bash
# Backend
cd api && .venv/bin/python -m pytest -q            # ~34 tests verts
cd api && python -m cli seed                       # upsert idempotent

# Front
cd front && npm run lint && npm run build          # typecheck + build SSG/ISR

# Post-déploiement (sur le VPS)
curl -s https://api.quarante.studio/api/health     # {"status":"ok"}
curl -s https://api.quarante.studio/api/meta       # pôles/statuts
curl -s -I https://api.quarante.studio/console     # 200, SPA
curl -s https://quarante.studio/sitemap.xml        # slugs articles/projets
curl -s https://quarante.studio/insights           # 200, données API ou fallback
```

---

## 8. Points de vigilance

- **CORS** : utile surtout pour la console en dev ; en prod `FRONT_ORIGINS` doit inclure `https://quarante.studio` (et `www`).
- **Firebase analytics** : clés publiques embarquées (`front/lib/firebase.ts`) — pas de secret, non bloquant.
- **Ordre de déploiement** : `postgres` → `api` → `front` (le front retombe sur `FALLBACK_*` si l'API n'est pas encore prête : pas d'échec de build).
- **Nixpacks** : sans `Procfile`, spécifier la commande de démarrage de l'API dans Coolify (champ *Start Command*) : `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.