**QUARANTES.**

**Cahier des charges**

**Ajout de la section « Nos Projets »**

_Version simplifiée — réalisations internes des pôles_

QUARANTES Holding — 2026

# **1\. Objectif**

Ajouter une page présentant les réalisations internes des pôles (KARABA, KOF Corporation, TÉPÉ, QUARANTES) : ce que le groupe a concrètement construit, pas seulement ce qu'il propose comme service.

Contrairement au Blog, qui explique et analyse, cette page prouve par les livrables. Structure inspirée des pages « Our Work » observées chez des cabinets d'ingénierie logicielle/IA : bandeau de chiffres clés, grille de projets filtrable, puis une sélection de projets détaillés en trois temps (Défi → Approche → Valeur produite).

# **2\. Contenu de chaque projet**

Chaque projet est une réalisation interne d'un pôle, pas une étude de cas client anonymisée. Deux niveaux d'information :

- Niveau carte (grille) : pôle, statut, titre, description courte, stack technique, lien si public
- Niveau détaillé (section « Comment nous procédons ») : Défi rencontré → Approche technique → Valeur produite, réservé à une sélection de projets phares

# **3\. Structure de la page (/projets)**

| **Bloc**                | **Description**                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Bandeau titre**       | Eyebrow « Nos Réalisations » + H1 + sous-titre court                                  |
| **Bandeau de chiffres** | 4 statistiques clés : projets livrés, pôles actifs, années d'exécution, pays couverts |
| **Bloc de cadrage**     | 3 points courts sur ce que la page permet d'évaluer                                   |
| **Filtres par pôle**    | Tous / QUARANTES / KOF Corporation / KARABA / TÉPÉ                                    |
| **Grille de projets**   | Cartes avec statut, pôle, titre, description, tags technique                          |
| **Projets détaillés**   | 3 à 4 projets phares en format Défi / Approche / Valeur produite                      |
| **CTA final**           | Appel à discuter d'un projet similaire                                                |

# **4\. Statuts de projet**

| **Statut**        | **Signification**                                        |
| ----------------- | -------------------------------------------------------- |
| **En Production** | Déployé et utilisé en conditions réelles                 |
| **Pilote**        | En test avec un partenaire ou sur un périmètre restreint |
| **R&D**           | En développement interne, pas encore déployé             |
| **Archivé**       | Projet terminé ou remplacé                               |

# **5\. Palette QUARANTES appliquée**

<!-- <div class="joplin-table-wrapper"><table><thead><tr><th><p><strong>Rôle</strong></p></th><th><p><strong>Aperçu</strong></p></th><th><p><strong>Code couleur</strong></p></th><th><p><strong>Usage</strong></p></th></tr></thead><tbody><tr><td><p><strong>Fond principal</strong></p></td><td></td><td><pre><code>#050B14</code></pre></td><td><p>Fond de page</p></td></tr><tr><td><p><strong>Fond secondaire</strong></p></td><td></td><td><pre><code>#0A1526</code></pre></td><td><p>Cartes, bandeaux</p></td></tr><tr><td><p><strong>Bordures</strong></p></td><td></td><td><pre><code>#22344F</code></pre></td><td><p>Séparateurs, cadres</p></td></tr><tr><td><p><strong>Texte principal</strong></p></td><td></td><td><pre><code>#EDEFEF</code></pre></td><td><p>Titres, corps de texte</p></td></tr><tr><td><p><strong>Texte secondaire</strong></p></td><td></td><td><pre><code>#B9C2CE</code></pre></td><td><p>Descriptions, métadonnées</p></td></tr><tr><td><p><strong>Accent cuivre</strong></p></td><td></td><td><pre><code>#C6803D → #E8A15C</code></pre></td><td><p>Statuts actifs, CTA, chiffres clés</p></td></tr><tr><td><p><strong>Accent cyan</strong></p></td><td></td><td><pre><code>#4FD1C5</code></pre></td><td><p>Tags techniques, labels de pôle</p></td></tr></tbody></table></div> -->

# **6\. Composants à créer**

- Bandeau de statistiques (4 chiffres)
- Filtres par pôle (réutilisables depuis le Blog)
- Carte de projet avec badge de statut coloré
- Bloc détaillé en 3 colonnes (Défi / Approche / Valeur)

# **7\. Non-fonctionnel**

- Responsive : grille de projets en 1 colonne sur mobile, filtres en scroll horizontal
- Les projets confidentiels affichent un badge « Confidentiel » à la place du lien externe