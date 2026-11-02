# coupdefood-maquette

<https://coupdefood-maquette.vercel.app> · audit du 27 octobre 2026 · dernier commit 6f0b2e9 du 23 octobre 2026

## Verdict

**80/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Concept « journal de La Une » original, très bien exécuté et fluide, avec des démos de services et un formulaire en trois étapes qui fonctionnent. Il reste à donner des marges latérales aux rubriques sur téléphone et tablette, à corriger le robots.txt et à ajouter le `?v=`.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | La manchette « Coup de Food » qui se pose sur papier kraft puis devient la Une d'un journal est forte et taillée pour une agence de RP, sans effet de surprise majeur ensuite. |
| 2. Direction artistique et harmonie | 12/15 | Anton, Newsreader et Plex Mono, papier, encre verte, tomate et sauge forment un ensemble cohérent, avec des images chaudes et homogènes. Défauts : le ruban pointillé barre les numéros de la méthode et l'image « événements » montre une skyline de type Manhattan. |
| 3. Animations et effets | 12/15 | Ouverture orchestrée et lisible avant 1,5 s, 60 i/s sans saccade, galerie horizontale épinglée, trame demi-teinte WebGL et micro-démos par rubrique ; l'effet signature épinglé disparaît sur téléphone. |
| 4. Expérience ludique et interactions | 9/10 | Formulaire « bon de commande » en 3 étapes avec validation et écran de succès, filtres et recherche de la salle de presse avec message « aucun résultat », boutons « Copier », menu et Mode calme : tout fonctionne. |
| 5. Tous les formats | 10/15 | Pas de débordement, mais sous 1000 px le texte des 5 rubriques touche les bords de l'écran. La section méthode sort de 24 px à 1000×560, et il reste beaucoup de textes à 11 px et de cibles de moins de 44 px. |
| 6. Contenu et fiabilité | 9/10 | Communiqués, clients et logos repris de Prezly et du site actuel, avec des liens réels ; crédits et retombées clairement marqués « à compléter ». Seule réserve : la meta description en écriture inclusive est à faire valider. |
| 7. Technique et performance | 9/10 | Aucune erreur JavaScript, CLS ≤ 0,055 sur les vraies pages, accueil à 2,9 Mo, liens sans « .html » OK ; seule la 404 en 1920 monte à 0,124. |
| 8. Mise en ligne | 3/5 | Noindex, X-Robots-Tag, og:image 1200×630 en adresse complète et 404 aux couleurs du site sont en place, mais le robots.txt contient « Disallow: / » et le CSS et le JS n'ont aucun `?v=`. |
| 9. Accessibilité | 4/5 | Lien d'évitement, focus, `aria-expanded` et Échap sur le menu, Mode calme et « réduire les animations » respectés ; plusieurs textes à 11 px et petites cibles tactiles. |
| **Total** | **80/100** | |

## Points forts

- Concept éditorial cohérent du début à la fin : folios « Page 3 · Au sommaire », dépêches qui défilent, « Erratum / Coquille ! » en 404.
- Ouverture courte et maîtrisée : la manchette est lisible dès 0,5 s et la Une complète vers 1,5 s, sur portable comme sur téléphone.
- Fluidité parfaite : 60 i/s en p1440 et 59,7 i/s en m390, sans tâche longue.
- Contenu réel : 13 communiqués Prezly, 9 clients avec leur site, coordonnées et TVA réelles, page projet « Incorrect » complète.
- Images IA (préfixe `g-`) homogènes en lumière et en palette, sans défaut de mains ni de texte.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Rubriques collées aux bords de l'écran** : accueil, section « Au sommaire », m320 à t820 (téléphones et tablette), `captures/accueil-m390-08.jpg`, `captures/accueil-m390-05.jpg`. Cause : `assets/css/style.css:336`, `.sommaire__viewport` est hors du `.wrap` (`index.html:184`) et `.rub` n'a aucun `padding-inline` sous 1000 px. Correction : `@media (max-width: 999px) { .rub__body, .rub__demo { margin-inline: var(--gutter-l) var(--gutter-r); } }`, ou un padding latéral sur `.rub` en gardant les images en pleine largeur. Effort : petit.
2. **Robots.txt « Disallow: / »** : toutes les pages. Cause : `robots.txt:2`. Correction : `User-agent: *` puis `Allow: /`, le noindex et le X-Robots-Tag suffisant. Effort : petit.
3. **CSS et JS sans `?v=`** : 5 pages. Cause : `index.html:27` et `index.html:645-648`, ainsi que `salle-de-presse.html:24,184-187` et `projet-incorrect.html:24,196-199` (même chose sur les pages légales et la 404). Correction : `style.css?v=6`, `main.js?v=6`, etc., avec le même numéro partout. Effort : petit.
4. **Section méthode épinglée trop haute à 1000×560** : accueil, `captures/epingle-accueil-1-1000x560-50.jpg`, l'image et le canvas sortent de 24 px et les étiquettes du bas sont coupées. Cause : `assets/css/style.css:462`, `height: calc(100svh - var(--hd-h) - 120px)` avec `min-height: 460px`. Correction : colonne flex de 100svh, hauteur de l'en-tête mesurée en JS (`--entete-h`) et média en `flex: 1; min-height: 0`, sans `min-height` fixe. Effort : moyen.

### Finition

1. **Le ruban pointillé barre les numéros 01 à 06** : accueil, méthode, p1280 à g1920, `captures/accueil-p1440-12.jpg`. Cause : `assets/css/style.css:457`, `.methode__ribbon { left: 30px }` tombe au milieu de `.step__n` (colonne de 64 px). Correction : placer le ruban dans la gouttière (`left: 70px`) ou passer `.step__n` au-dessus avec `position: relative; z-index: 1; background: var(--paper)`. Effort : petit.
2. **Bas des lettres de « COQUILLE ! » rogné** : 404, p1280 à g1920, `captures/404-p1440-00.jpg`. Cause : `assets/css/style.css:659-660`, `line-height: .82` avec `overflow: hidden` sur `[data-fit]`. Correction : `padding-bottom: .06em` sur `.page-title[data-fit]`. Effort : petit.
3. **CLS de 0,124 sur la 404 en 1920** : décalage du pied de page à 213 ms. Cause : `assets/js/main.js:184-193`, `fit()` agrandit le titre après le premier rendu. Correction : lancer `fit()` après `document.fonts.ready` en masquant le titre jusque-là, ou réserver la hauteur avec `aspect-ratio`. Effort : petit.
4. **Textes à 11 px et cibles de moins de 44 px sur téléphone** : barre du haut (date, « Mode calme » 25 px de haut), métadonnées de la Une, légendes, fil d'Ariane, « Voir les projets → » (26 px), lien e-mail (18 px). Cause : `assets/css/style.css:143`, `:145`, `:244`, `:272`, `:664` (`.6875rem`). Correction : 0,75rem minimum sur téléphone et `min-height: 44px` sur `.hd__calm`, `.link-ink` et les liens de contact. Effort : petit.
5. **Skyline de type Manhattan dans l'image « événements »** : accueil, rubrique 4, `assets/img/g-sommaire-evenements-l.webp`. Rien ne rappelle Bruxelles. Correction : recadrer sur la table (le tiers haut gauche) ou régénérer l'image avec une vue de toits bruxellois. Effort : petit.
6. **Meta description en écriture inclusive** (« chef·fe·s, artisan·e·s… », visible aussi dans le chapô de la Une) : à faire valider par la cliente si cela ne vient pas de son site. Cause : `index.html` (meta description et `.une` lead). Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 0,5 s (manchette d'intro), Une complète vers 1,5 s / idem |
| Fluidité p1440 / m390 | 60 i/s / 59,7 i/s (très bien) |
| CLS au chargement (max) | 0,055 sur les pages réelles (projet p1440), 0,124 sur la 404 en g1920 |
| Poids de l'accueil, p1440 / m390 | 2,91 Mo / 2,97 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune hors le 404 attendu de la page introuvable ; sans WebGL et « réduire » OK |
| Débordement horizontal | Aucun (signal m390 sans WebGL non reproduit) |
| Sections épinglées | Galerie horizontale « sommaire » et galerie du projet OK ; méthode : 24 px hors écran à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui / oui (5 pages) / oui / « Disallow: / » / JPG 1200×630, adresse complète / absent / personnalisée |

## Vérifications écartées

- Débordement en m390 sans WebGL (427 px) : non reproduit en défilant toute la page avec WebGL bloqué ; aucun élément ne dépasse. C'était un état transitoire.
- Citation coupée (« soit le méd… ») sur `accueil-p1440-12.jpg` : capture prise pendant le fondu entre deux scènes de la méthode ; la citation s'affiche entière sur les autres captures.
- Erreur console « 404 » sur la page introuvable : c'est le statut du document lui-même, pas une ressource manquante.
- CLS de 0,118 et 0,200 dans la variante « réduire les animations » (projet, 404) : ce n'est pas la mesure retenue (« CLS chargement »).
- Valeurs « h1 » par page : toutes sous 0,6 s, aucune remesure nécessaire.


---

## coupdefood-maquette : corrections de l'étape 2

Commit e2f47c7 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Rubriques « Au sommaire » collées aux bords sous 1000 px | Important | `padding-inline` des gouttières du site sur `.rub` (16 px, 40 px dès 900 px) ; la galerie horizontale garde son propre padding | `assets/css/style.css` | texte au bord → gouttière de 16 px (`preuve-rubriques-m390-avant/apres.jpg`) ; galerie 1280×720 identique |
| Section méthode épinglée qui sort de 24 px à 1000×560 | Important | `top` et hauteur depuis `--entete-h` mesurée en JS (ResizeObserver sur l'en-tête), marges en bordures transparentes proportionnelles (`svh`), `min-height: 460px` supprimé | `assets/css/style.css`, `assets/js/main.js` | img et canvas −24 px → aucun défaut aux 8 tailles (`preuve-methode-*.jpg`) |
| Robots.txt « Disallow: / » | Important | Déjà corrigé à l'étape 1 (`Allow: /`), vérifié | `robots.txt` | OK |
| CSS et JS sans `?v=` | Important | Déjà ajouté à l'étape 1, relevé en `?v=20261028-2` partout | 6 pages HTML | grep sans résultat sur l'ancienne version |
| Textes à 11 px sur téléphone (récurrent) | Finition / récurrent | Variables `--t-2xs` / `--t-3xs` remplaçant les 41 tailles en dur, plancher `max(12px, …)` sous 1000 px | `assets/css/style.css` | 231 à 257 → 2 à 6 par format (libellés SVG du radar seuls) |
| Cibles < 44 px sur téléphone (récurrent) | Finition / récurrent | `min-height: 44px` sur Mode calme (marges négatives, barre du haut inchangée), logo, dépêches, `.link-ink`, `.txt-link`, e-mails, liens du pied, filtres, Copier, fil d'Ariane | `assets/css/style.css` | 180 à 198 → 0 par format |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Ruban pointillé qui barre les numéros 01 à 06 | Finition | finition |
| Bas de « COQUILLE ! » rogné sur la 404 | Finition | finition |
| CLS 0,124 de la 404 en 1920 | Finition | finition |
| Skyline de type Manhattan (image « événements ») | Finition | image Grok (à régénérer) |
| Écriture inclusive de la meta description et du chapô | Finition | donnée manquante (validation de la cliente) |
| Libellés SVG du radar à 9,5 px sur téléphone | Finition | finition (illustration SVG, risque de chevauchement des étiquettes) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920) | aucun | aucun |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 251 / 245 / 249 / 231 / 257 | 2 / 5 / 6 / 6 / 6 (radar SVG) |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 180 / 184 / 191 / 180 / 198 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts | 0 | 0 |
| Épinglage aux 8 tailles (sommaire, méthode, galerie projet) | méthode : img et canvas −24 px à 1000×560 | aucun défaut |
| Erreurs console (hors 404 attendu) | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |
| Interactions (m390) | — | menu ouvert et fermé par Échap, Mode calme 44 px cliquable, burger non recouvert, `--entete-h` = 95 px |

## Note proposée
Ancienne note 80/100 → nouvelle note 87/100
- Critère 5 : 10 → 14, rubriques avec gouttières, méthode qui tient à 1000×560, textes 12 px et cibles 44 px (pas de 15/15).
- Critère 8 : 3 → 5, robots.txt et `?v=` corrigés (étape 1, vérifiés).
- Critère 9 : 4 → 5, textes à 11 px et petites cibles corrigés.

Bloquants restants : 0
