# Recommandations — enterprise-project

Dernière analyse : 2026-09-24

---

## 1. CSS — utility manquante `mask-image-linear-left`

**Problème** : Deux composants utilisent cette classe sans qu'elle ne soit définie nulle part. En Tailwind v4, les utilities personnalisées doivent être déclarées explicitement avec `@utility` dans le CSS.

**Fichiers concernés** :
- `front/components/Hero.tsx:27`
- `front/components/Convergence.tsx:19`

**Conséquence** : Les images de fond sur le côté droit de Hero et Convergence ne sont pas masquées — elles ne fondent pas dans la section, ce qui donne l'impression que le contenu est aligné à gauche.

**Fix** : Ajouter dans `front/app/globals.css`, après le bloc `@theme` (autour de la ligne 213, avant `body`) :

```css
@utility mask-image-linear-left {
  mask-image: linear-gradient(to right, transparent 0%, black 50%, black 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%, black 100%);
}
```

---

## 2. Vérification des sections droite (après le fix CSS)

Après avoir appliqué le fix, vérifier dans DevTools que ces éléments render bien :

| Section | Élément à vérifier | Breakpoint |
|---|---|---|
| Hero (`components/Hero.tsx`) | Cercle décoratif spinning à droite | `lg:` (≥1024px) |
| Convergence (`components/Convergence.tsx`) | Bloc placeholder à droite | `md:` (≥768px) |
| GlobalReach (`components/GlobalReach.tsx`) | Carte NetworkMap (charge côté client, `ssr: false`) | tous |

Si ces éléments restent invisibles après le fix CSS, passer au point 3.

---

## 3. Configuration `NEXT_PUBLIC_SITE_URL`

**Fichier** : `front/app/[locale]/page.tsx:19` et `front/app/[locale]/layout.tsx:11`

```ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';
```

Si cette variable n'est pas définie dans l'environnement de build, le default `https://quarante.studio` est utilisé. Si le site est servi depuis un autre domaine ou localhost, les URLs absolues pour les fonts, les images Unsplash, et les liens canoniques seront incorrects.

**À vérifier** :
- La variable est-elle définie dans `.env.local` ou l'environnement de déploiement ?
- Le domaine correspond-il au domaine réel où le site est servi ?

---

## 4. Console — ajout d'articles : points de vigilance

L'analyse du flux complet (CMS → API → DB) n'a pas révélé de bug structurel, mais voici les points à surveiller quand l'ajout échoue :

### 4.1 Formulaire ArticleEditor

- `authorId` par défaut = `0` (voir `emptyArticle()` dans `ArticleEditor.tsx:23`). Si l'auteur n'est pas sélectionné avant submission, l'API rejette avec `400 Auteur introuvable`.
- `poleId` par défaut = `0`. Le select auteur est `disabled` sans pôle sélectionné, mais le pôle lui-même doit être choisi. Vérifier que le select pôle a bien une valeur avant submission.
- Slug auto-généré par `slugify(title)` uniquement si `slugTouched` est faux. Si le titre change après le premier focus du slug, le slug ne se met pas à jour automatiquement.

### 4.2 Permissions API (admin.py)

- Un utilisateur `publisher` (non-admin) ne peut créer un article que pour son propre pôle (`admin.py:412-418`).
- L'auteur sélectionné doit appartenir au même pôle que l'utilisateur connecté (même bloc).
- Si un publisher essaie de créer pour un autre pôle ou avec un auteur hors pôle → `403`.

### 4.3 Réponse API et re-render

- `createArticle` appelle `onSaved()` en cas de succès (`ArticleEditor.tsx:112`). Vérifier que `onSaved` déclenche bien le rafraîchissement de la liste (ArticleList).
- En cas d'erreur, le message est affiché dans `ErrorBanner` (`ArticleEditor.tsx:266`). Si rien ne s'affiche, l'erreur est peut-être arrivée avant le `try/catch` (ex: CORS, session expirée).

### 4.4 Sessions / CORS

- L'API utilise `SessionMiddleware` avec `same_site="strict"` (`main.py:21`). Si le CMS et l'API sont sur des domaines différents, les cookies de session ne sont pas envoyés → `401 Non authentifié`.
- Vérifier que `settings.cors_origins` dans `api/app/config.py` inclut l'origine du CMS si ils sont sur des domaines séparés.

---

## 5. XAMPP — conflit de port (déjà résolu)

- Apache système (`apache2.service`) a été désactivé et arrêté.
- XAMPP Apache écoute sur `:80` et `:443`, MySQL sur `:3306`.
- Pour démarrer manuellement : `sudo /opt/lampp/lampp start`
- Si un jour vous activez PostgreSQL system-wide (`postgresql` installé en v17), vérifier qu'il n'écoute pas sur un port déjà utilisé.

---

## 6. RAM — pression mémoire

- 7.5 GiB total, ~1 GiB libre actuellement, swap utilisé (3 GiB sur 15 GiB).
- XAMPP (Apache + MySQL) + VSCode + Firefox + navigateur peuvent rapidement saturer.
- Si le système devient lent pendant le dev, envisager :
  - Arrêter les services XAMPP inutilisés (`sudo /opt/lampp/lampp stop`)
  - Fermer les onglets Firefox inutilisés
  - Ajouter du RAM si les problèmes persistent

---

## 7. Python vs PHP — version skew

- PHP systeme : `8.4.23` (via `/usr/bin/php`)
- PHP XAMPP : `8.2.x` (bundled with XAMPP 8.2.4-0)
- Si vous testez du code PHP en ligne de commande avec `php` systeme et que vous le déployez via XAMPP, les comportements peuvent différer (syntaxe, extensions).
- Garder cela en tête pour le debug.

---

## 8. Alias hermes

Un alias a été ajouté dans `~/.bash_aliases` :

```bash
alias ai='hermes chat'
```

Disponible après `source ~/.bash_aliases` ou dans un nouveau terminal. Tapez `ai` pour lancer une session chat.

---

## 9. Podman / Docker

Réserve pour plus tard — à aborder quand un projet nécessite des conteneurs. Pour l'instant, XAMPP couvre le besoin local.
