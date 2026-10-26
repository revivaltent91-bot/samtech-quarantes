# Cahier des charges — Section Blog / Articles
## Site QUARANTES Holding (quarante.studio)

---

## 1. Contexte et objectifs

QUARANTES Holding dispose aujourd'hui d'un site vitrine structuré autour de pages fortes (Accueil, Vision, Écosystème, Carrières). La page **Carrières** (`/careers`) constitue la référence de patterns UI la plus aboutie du site à ce jour : hero engageant, sections alternées (texte / bloc sombre différenciant / grille de cartes / timeline en étapes), et un footer riche en liens d'écosystème.

L'objectif est d'ajouter une section **Blog / Articles** qui :

- Réutilise l'identité visuelle et les patterns de composants déjà validés sur `/careers`, pour une cohérence immédiate avec le reste du site.
- Positionne QUARANTES comme cabinet de référence en IA Hard & Soft pour l'économie réelle africaine, via du contenu éditorial (analyses, retours d'expérience R&D, actualités des pôles KARABA, KOF Corporation, TÉPÉ).
- Serve de vitrine SEO et de preuve de crédibilité technique, à l'image des cabinets IA étudiés en phase de benchmark (Neurons Lab, Winder.AI).

---

## 2. Périmètre fonctionnel

| Élément | Inclus |
|---|---|
| Page listing des articles (`/blog` ou `/insights`) | ✅ |
| Page détail d'un article (`/blog/[slug]`) | ✅ |
| Filtrage par pôle / catégorie (KARABA, KOF Corporation, TÉPÉ, Quarantes Studio, R&D) | ✅ |
| Pagination ou "charger plus" | ✅ |
| Intégration au header et au footer existants | ✅ |
| CMS / back-office de rédaction (headless CMS ou markdown) | À arbitrer en phase technique |
| Newsletter / capture email en fin d'article | Optionnel — phase 2 |
| Commentaires | ❌ Hors périmètre |

---

## 3. Navigation et arborescence

### 3.1 Header (nav principale)

Réutiliser la structure actuelle du header, en ajoutant une entrée :

```
QUARANTES.   Vision   Écosystème   Insights   Carrières   Investor Relations
```

- Le nouveau lien **"Insights"** (ou "Blog", "Articles" — à trancher en atelier nommage) s'insère entre "Écosystème" et "Carrières", suivant la logique éditoriale actuelle (du "pourquoi" institutionnel vers l'humain).
- Comportement identique aux liens existants : ancre pour les sections de la home, lien de page pleine pour Insights (comme "Carrières" actuellement).

### 3.2 Footer

Ajouter une entrée dans le bloc **"Holding"** du footer, au même niveau que "Carrières" :

```
Holding
- Investor Relations (Bientôt)
- Gouvernance & ISO (Bientôt)
- Carrières
- Insights          ← nouveau
- Contact Sécurisé (En préparation)
```

---

## 4. Page listing (`/blog`)

Structure calquée sur le squelette de `/careers` : bandeau statut → hero → section contexte → bloc différenciant sombre → grille de contenus → footer.

### 4.1 Bandeau de statut (haut de page)
Remplacer le badge "Nous recrutons" par un badge équivalent, ex. **"Derniers articles"** ou **"Publications R&D"**.

### 4.2 Hero
- Titre H1 dans la continuité tonale de "Rejoignez l'Écosystème" : ex. **"Nos Idées, Notre Terrain"** ou **"L'Infrastructure Invisible, Expliquée"**.
- Sous-titre (1-2 phrases) présentant la ligne éditoriale : analyses IA Hard & Soft, retours d'expérience des pôles, regard sur l'économie réelle africaine.

### 4.3 Section "Pourquoi nos publications" (équivalent de "Pourquoi Nous Rejoindre ?")
Reprendre le pattern à 3 blocs texte gras + description (comme "Une Mission Unique", "Deeptech d'Avant-Garde", "Un Impact Tangible") pour présenter les 3 axes éditoriaux du blog, par exemple :
- **Recherche & Ingénierie** : publications techniques issues de Quarantes Studio.
- **Terrain & Impact** : retours d'expérience sectoriels (logistique, gouvernance, données).
- **Vision & Stratégie** : analyses sur l'IA appliquée à l'économie réelle africaine.

### 4.4 Bloc différenciant sombre (équivalent "Focus R&D")
Réutiliser le pattern de carte sombre à fond contrasté avec CTA, appliqué ici à la mise en avant de l'article phare / série d'articles du moment, avec CTA "Lire l'article" au lieu de "Découvrir nos travaux R&D".

### 4.5 Filtres par pôle
Reprendre visuellement la logique des tags de postes (`KARABA`, `KOF Corporation`, `TÉPÉ`, `Quarantes Studio`) déjà utilisés sur les cartes de la section "Postes Ouverts", appliqués ici comme **filtres cliquables** au-dessus de la grille d'articles.

### 4.6 Grille d'articles (équivalent "Postes Ouverts")
Chaque carte reprend le pattern des cartes de poste :

```
[Pôle / Catégorie]
### Titre de l'article
[Date de publication]  [Temps de lecture]
[Lire l'article →]
```

- Grille responsive (3 colonnes desktop / 1 colonne mobile), identique à la grille de postes actuelle.
- Un article "à la une" peut occuper une carte élargie en première position.

### 4.7 Pagination
Reprendre un pattern de navigation simple (numérotée ou "Charger plus"), cohérent avec la sobriété du site (le site n'a actuellement pas de pagination visible ailleurs — à concevoir sur la base du style des boutons existants, ex. "Postuler", "Découvrir nos travaux R&D").

---

## 5. Page détail article (`/blog/[slug]`)

### 5.1 En-tête d'article
- Fil d'Ariane simple : `Insights / [Catégorie] / [Titre]`
- Tag de pôle cliquable (même style que les tags "KARABA", "TÉPÉ" utilisés sur les cartes de poste)
- Titre H1
- Ligne méta : date de publication + temps de lecture estimé
- Bloc auteur : nom, fonction, pôle d'appartenance (cohérent avec la mise en avant des pôles sur tout le site)

### 5.2 Sommaire ancré
Pour les articles longs (analyses, papiers de recherche), liste de liens ancrés en haut d'article vers chaque section H2, à l'image des bonnes pratiques observées chez les cabinets IA de référence (facilite la lecture scannable).

### 5.3 Corps de l'article
- Typographie et largeur de colonne cohérentes avec le reste du site (colonnes de texte déjà larges et aérées sur `/careers`)
- Support des éléments suivants : titres H2/H3, listes à puces, citations, tableaux comparatifs, images légendées, blocs de code (pertinent pour du contenu R&D/technique)
- Un ou deux CTA contextuels insérés dans le corps du texte (ex. lien vers la page pôle concerné, ou vers `/careers` si l'article traite de recrutement R&D), suivant le même ton que les CTA actuels ("Découvrir nos travaux R&D", "Postuler")

### 5.4 Bloc de fin d'article
- CTA de conversion, réutilisant le pattern du bloc sombre "Focus R&D" (fond contrasté, titre + description + bouton), adapté ex. : "Envie de contribuer à ces travaux ?" → lien vers `/careers`
- Articles liés (3 cartes, même composant que la grille de listing)

### 5.5 Footer
Footer identique au reste du site, sans modification.

---

## 6. Design system — composants à réutiliser tels quels

| Composant existant sur `/careers` | Réemploi sur le Blog |
|---|---|
| Badge de statut ("Nous recrutons") | Badge "Derniers articles" |
| Hero (titre + sous-titre) | Hero listing |
| Bloc 3 colonnes texte gras + description | Section "Pourquoi nos publications" |
| Bloc sombre différenciant + CTA ("Focus R&D") | Article à la une / CTA fin d'article |
| Grille de cartes ("Postes Ouverts") | Grille d'articles |
| Tags de pôle sur les cartes | Filtres de catégorie + tag sur page détail |
| Timeline en étapes numérotées ("Processus de Recrutement") | Réutilisable si besoin d'expliquer une méthodologie éditoriale ou un processus R&D dans un article |
| Header et footer | Inchangés, avec ajout du lien "Insights" |

Aucun nouveau design system n'est nécessaire : le blog doit être une **extension directe** du langage visuel déjà établi, pas une nouvelle direction artistique.

---

## 7. Contenu et gestion éditoriale

- **Volume de lancement** : recommandé 6 à 10 articles avant mise en ligne, pour éviter une page listing trop vide (à l'image des standards observés chez les cabinets IA de référence).
- **Catégories/pôles** : alignées sur l'écosystème existant — KARABA, KOF Corporation, TÉPÉ, Quarantes Studio, + une catégorie transverse "Vision" pour les analyses stratégiques.
- **Fréquence de publication** : à définir avec l'équipe éditoriale (recommandé : rythme régulier plutôt que volume, ex. 2 articles/mois).
- **Back-office** : à arbitrer — CMS headless (ex. contenu structuré) vs fichiers markdown versionnés, selon qui rédige (équipe technique vs équipe communication).

---

## 8. Exigences non fonctionnelles

- **SEO** : title, meta-description, Open Graph et Twitter Card par article (le site gère déjà ces balises sur `/careers`, à répliquer).
- **Performance** : images optimisées et responsive, cohérent avec le reste du site.
- **Accessibilité** : contraste conforme, navigation clavier pour les filtres et la pagination.
- **Responsive** : grille d'articles et hero adaptés mobile-first, comme le reste du site.
- **Cohérence multilingue** : le site actuel est en français — à confirmer si le blog doit prévoir une version anglaise (pertinent vu le positionnement international de QUARANTES).

---

## 9. Hors périmètre (phase 1)

- Système de commentaires
- Recherche full-text au sein du blog
- Newsletter (à évaluer en phase 2)
- Traduction multilingue automatique

---

## 10. Prochaines étapes suggérées

1. Validation du nommage ("Blog" vs "Insights" vs "Publications")
2. Atelier de définition des catégories/pôles éditoriaux
3. Choix technique du CMS/back-office
4. Rédaction des 6 à 10 premiers articles de lancement
5. Intégration des composants (réutilisation du design system `/careers`)
6. Recette et mise en ligne
