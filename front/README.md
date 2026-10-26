# quarante.studio — Landing Page

Site vitrine de **QUARANTES Holding**, cabinet d'expertise IA Hard & Soft pour l'économie réelle africaine.

**Stack :** Next.js 16 · React 19 · Tailwind CSS v4 · Firebase · TypeScript  
**URL de production :** [quarante.studio](https://quarante.studio)

---

## Démarrage local

**Prérequis :** Node.js 18+

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (SEO, sitemap, OG) | `https://quarante.studio` |

---

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Lint TypeScript |
| `npm run clean` | Supprime `.next/` |

---

## Structure

```
app/
  layout.tsx          # Layout racine — JSON-LD, next/font, metadata globale
  page.tsx            # Page d'accueil
  careers/page.tsx    # Page Carrières
  insights/page.tsx   # Page Insights (blog) — listing + filtres par pôle
  insights/[slug]/    # Page détail d'article (SSG, sommaire, articles liés)
  sitemap.ts          # /sitemap.xml (généré)
  robots.ts           # /robots.txt (généré)
  globals.css         # Styles globaux + thème Tailwind v4
components/           # Composants par section
  insights/           # InsightsClient (filtres) + ArticleContent (rendu du corps)
lib/
  firebase.ts         # Initialisation Firebase (singleton)
  analytics.ts        # trackEvent wrapper client-side
  articles.ts         # Contenu éditorial structuré (modèle + 8 articles)
```

---

## Déploiement

Le projet tourne sur **VPS + Coolify + Nixpacks**.  
Nixpacks détecte Next.js automatiquement via `package.json`.

Définir la variable `NEXT_PUBLIC_SITE_URL=https://quarante.studio` dans le panneau d'environnement Coolify avant le premier déploiement.

---

## SEO

- `generateMetadata()` par page (title, description, Open Graph, Twitter Card, hreflang)
- JSON-LD : Organization, WebSite, WebPage, BreadcrumbList, JobPosting
- Sitemap et robots.txt auto-générés
- Fonts auto-hébergées via `next/font/google` (pas de requête externe Google Fonts)
- Structure i18n préparée pour FR + EN (hreflang en place)
