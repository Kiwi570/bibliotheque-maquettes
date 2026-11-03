# pizzalyght-maquette

<https://pizzalyght-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 3542fc4 du 27/10/2026

## Verdict

**80/100 · À peaufiner · 1 défaut bloquant**

Maquette « Boucan de nuit » très aboutie : ouverture soignée, pizza qui se monte au défilement, et un parcours de commande simulé complet, avec créneaux et récapitulatif. Elle n'est pas prête parce que les deux sections épinglées de l'accueil sortent de l'écran sur les portables courants (1280×720 et 1366×768).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | L'ouverture (étincelle, fente, puis logo) et la pizza qui tourne dans son texte circulaire sur fond de braises donnent un vrai caractère « four de nuit », bien adapté au client, mais la suite reprend des schémas plus attendus. |
| 2. Direction artistique et harmonie | 12/15 | La palette braise et charbon, le titrage condensé et les images Grok sombres sont cohérents d'une page à l'autre, mais il reste de grands vides entre les sections, et les photos du client ont une lumière très variable. |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, titre lisible à 2,5 s, montage de la pizza épinglé et galerie horizontale réussis, mais les scènes épinglées débordent sur les portables courants. Sur téléphone, la photo finale et la vidéo n'apparaissent qu'en sortie de section. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne et se comprend : composeur Allasani (8 ingrédients), onglets des formules, filtres et recherche de la carte, panier, paiement simulé avec créneaux, fiche « Appeler » et Mode calme. |
| 5. Tous les formats | 10/15 | Aucun débordement horizontal, mais des textes et des boutons sortent de l'écran sur 1280×720 et 1366×768 (bloquant), avec plusieurs textes à 11 px et des cibles de 42 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | La carte, les prix, les adresses et les horaires viennent du site actuel, et les « à compléter » sont bien signalés. En revanche, le statut « Ouvert » est calculé sans connaître les jours de fermeture. |
| 7. Technique et performance | 8/10 | Aucune erreur JS et le poids reste raisonnable (≈ 2,5 Mo), mais le CLS au chargement de l'accueil atteint 0,13 sur ordinateur, à cause de la fente de l'intro animée en width/margin. |
| 8. Mise en ligne | 4/5 | Site public, noindex et X-Robots-Tag en place, og:image en 1200×630, 404 aux couleurs du client, mais aucun `?v=` sur le CSS et le JS du site. |
| 9. Accessibilité | 4/5 | Focus visible ocre, « réduire les animations » et Mode calme respectés, textes alternatifs présents, mais des cibles de 42 px et quelques légendes à 11 px. |
| **Total** | **80/100** | |

## Points forts

- Une ouverture orchestrée et rapide : point de braise, fente lumineuse, logo, puis le titre lisible dès 2,5 s (`captures/bande-ouverture-p1440.jpg`).
- La scène « Pâte et sauce tomate maison » : la pâte s'étale, la sauce se dessine en spirale, puis la garniture tombe, le tout piloté par le défilement.
- Le parcours de commande simulé est complet et honnête : choix de la pizzeria, retrait ou livraison, créneaux qui tiennent compte de l'heure de Guyane, puis récapitulatif marqué « commande simulée » (`captures/inter-paiement-m390.jpg`, `captures/inter-confirmation-m390.jpg`).
- Une carte de 110 plats entièrement reprise du site actuel, avec filtres, recherche tolérante (accents, pluriels) et barre de rubriques active.
- Sur tous les formats : 60 i/s, aucun débordement horizontal, barre d'actions en bas sur téléphone, Mode calme accessible sur téléphone.

## Défauts

### Bloquants

1. **Sections épinglées de l'accueil coupées sur 1280×720 et 1366×768** : sur l'accueil, dans « Le goût du pays », le prix et le bouton « Ajouter » des cartes recettes sont hors de l'écran à 1280×720 et à 1366×768 (`captures/epingle-accueil-1-1280x720-50.jpg`, `captures/epingle-accueil-1-1366x768-50.jpg`). Dans « Pâte et sauce », le texte de l'étape 04 « À table » est coupé à 1280×720, et la légende de la vidéo « À la découpe » sort de 13 px à 1366×768 (`captures/epingle-accueil-0-1280x720-92.jpg`, `captures/epingle-accueil-0-1366x768-92.jpg`). Cause : `assets/css/style.css:262` et `:290` (`min-height: 100svh` alors que le contenu, centré, dépasse la hauteur de l'écran), et `:303` et `:309` (carte `.recette` à hauteur libre, illustration en `aspect-ratio: 1` à 86 % de la largeur). Correction : `height: 100svh` en colonne flex avec un `padding-top` égal à `--entete-h` mesuré en JS. Pour « Le goût du pays », passer `.piste-wrap` et `.recette` en `flex: 1; min-height: 0`, et dimensionner `.recette .art` par la hauteur disponible (`height: clamp(140px, 32svh, 320px); width: auto`). Ajouter un palier `@media (max-height: 800px)` qui réduit le titre `.pays-tete h2`, les espacements de la liste d'étapes et la taille de `.video-carte`. Effort : moyen.

### Importants

1. **CLS de 0,11 à 0,13 au chargement de l'accueil sur ordinateur** (p1280 0,134, p1366 0,124, p1440 0,108), causé par `SPAN.fente`. Cause : `assets/js/home.js:129`, où la fente de l'intro est animée en `width`, `marginLeft`, `height` et `marginTop`, ce qui relance la mise en page. Correction : fixer la fente à `width: 64vw; height: 3px` et animer `scaleX` de 0 à 1 (`transform-origin: center`). Effort : petit.
2. **Coupures sur petit portable (1000×560 et 1024×640)** : dans « Le goût du pays », le h3 et la liste d'ingrédients sortent de l'écran, et dans « Pâte et sauce », la vidéo sort de 130 px (`captures/epingle-accueil-1-1000x560-92.jpg`, `captures/epingle-accueil-0-1000x560-92.jpg`). Cause : la même que pour le défaut bloquant. Correction : le même palier `max-height`, plus un second palier `max-height: 600px`. Effort : compris dans le défaut bloquant.
3. **Textes de moins de 12 px sur téléphone** : la légende « À la découpe » (11,2 px, `style.css:280`), le « sur 8 » du compteur du composeur (11,2 px, `style.css:367`), « Je commande à » sur la carte (11,8 px, `style.css:499`) et la légende de la photo des pages pizzerias (11,5 px, `style.css:731`). Correction : `font-size: max(12px, …)` sur ces quatre règles. Effort : petit.
4. **Cibles tactiles de moins de 44 px** : les pilules de l'en-tête, les puces d'ingrédients, les onglets des formules et le bouton « Tout retirer » font 42 px (`style.css:145`, `:371`, `:388`, `:112`). Les rubriques et la recherche de la carte font 38 à 40 px (`style.css:569`), le lien « Toute la carte » 29 px, les liens du pied de page 20 px, et les points de ville de la carte RN1 41 px. Correction : `min-height: 44px` partout, et un `padding-block` sur les liens `.lien` du pied de page. Le bouton Mode calme fait 31 px de large à 320 px : lui donner `min-width: 44px`. Effort : petit.

### Finition

1. **`?v=` absent** sur `assets/css/style.css` et sur les 8 scripts du site, dans les 6 pages. Correction : ajouter `?v=1` partout à l'identique. Effort : petit.
2. **Sur téléphone, la fin du montage est presque invisible** : la photo finale et la vidéo n'apparaissent qu'à la toute fin d'un scrub qui va jusqu'à `bottom 25%` (`home.js:194`), c'est-à-dire quand la section sort déjà de l'écran. Correction : finir le scrub plus tôt (`end: 'bottom 70%'`), ou afficher la photo et la vidéo hors timeline sous 900 px. Effort : petit.
3. **Grands vides entre les sections** sur ordinateur : entre les fiches pizzerias et « On allume le four ? », et au-dessus de « De Saint-Laurent à Cayenne » (`captures/accueil-p1440-14.jpg`, `captures/accueil-p1440-16.jpg`). Correction : réduire le `padding-block` de ces deux sections et resserrer l'espacement vertical. Effort : petit.
4. **Statut « Ouvert » affiché avec assurance** alors que les jours d'ouverture sont « à compléter ». Correction : ajouter « horaires indicatifs » à côté du statut tant que le client n'a pas confirmé les jours. Effort : petit.
5. **Carte, rubrique Pizzas** : la carte Allasani reste seule sur sa ligne, suivie d'un grand vide à 1440 px (`captures/carte-p1440-07.jpg`). Correction : la faire occuper toute la ligne (`grid-column: 1 / -1`, disposition horizontale). Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (titre en cours d'apparition à 2 s, voir les bandes) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0,134 (accueil p1280, fente de l'intro) ; 0 sur la carte et 0,07 maximum sur les autres pages |
| Poids de l'accueil, p1440 / m390 | 2,46 Mo / 1,86 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune erreur JS (seul le 404 attendu de la page introuvable) ; sans WebGL : OK ; réduit : OK, contenu visible d'emblée |
| Débordement horizontal | aucun, sur les 9 formats |
| Sections épinglées | 2 sur l'accueil (« Pâte et sauce », « Le goût du pays ») : bonnes de 1440×900 à 2560×1440, coupées à 1280×720, 1366×768 et 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex sur les 5 pages · X-Robots-Tag noindex, nofollow · robots.txt Allow · og:image JPG 1200×630 en adresse complète · ?v= absent · 404 personnalisée |

## Vérifications écartées

- Ouverture « h1 » à 4,3–5,1 s sur p1280, p1366 et p1440 : valeurs prises sous charge. La vidéo p1440 prise seule donne 1,8 s, et les bandes montrent le titre lisible à 2,5 s. Ce n'est pas un défaut.
- Élément « invisible » `figure.video-carte > figcaption` sur m320, m390 et m430 : sur téléphone, la vidéo apparaît en fin de scrub. Elle est visible en mode réduit et en Mode calme (`style.css:281`), donc elle n'est pas bloquée. Le défaut est classé en finition (n° 2).
- « Masqué par nav.dock à l'ouverture » (heure de Guyane, « Appeler une pizzeria », boutons des pages pizzerias, boutons de la 404) : il s'agit du contenu situé sous la ligne de flottaison, qui reste accessible au défilement, et le dernier bloc n'est pas recouvert en bas de page.
- « Masqué par header.nav.scrolled au pied » (titre « On allume le four ? » en g1920, boutons Ajouter de la carte, liens du pied de page) : ce sont des éléments simplement remontés sous l'en-tête en fin de défilement. La capture `accueil-g1920-zz.jpg` montre le titre entier.
- Images sous l'en-tête dans les sections épinglées : il s'agit d'images de fond, ce qui n'est pas un défaut selon l'arbitrage.
- `ERR_NETWORK_CHANGED` sur /carte m390 réduit : incident réseau ponctuel, non reproduit pendant les tests d'interaction.
- Images Grok vues en taille réelle (mains et pâte, main et tomates, pelle, route de nuit, fruits, légumes, pâtes, farine, bokeh, braises) : aucune main déformée, aucun texte ni filigrane, et une lumière chaude cohérente d'une image à l'autre.


---

## pizzalyght-maquette : corrections de l'étape 2

Commit 2aad0f8 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Scènes épinglées coupées sur 1280×720 et 1366×768 (« Pâte et sauce », « Le goût du pays ») | Bloquant | Méthode « Tout tenir dans l'écran » : `height: 100svh` en colonne, `padding-top` = `--entete-h` mesuré en JS (ResizeObserver) ; atelier dimensionné par la hauteur (`container-type: size`, `min(100%, 620px, 94cqh)`), titres et étapes plafonnés en `svh` ; piste en `flex: 1; min-height: 0`, cartes en `max-height: 100%`, illustration qui se réduit (`object-fit: contain`) ; `anticipatePin` retiré | style.css, core.js, home.js | Éléments coupés (hors images de fond) : 1280×720 4 → 0, 1366×768 2 → 0 |
| Coupures sur petit portable (1000×560, 1024×640) | Important | Même méthode, plus un palier `max-height: 700px` (titre, espacements et textes des étapes réduits) | style.css | 1000×560 5 → 0, 1024×640 4 → 0 |
| CLS 0,11 à 0,13 au chargement (fente de l'intro) | Important | Fente dessinée à sa taille finale (64vw × 3 px) et animée en `scaleX`/`scaleY` uniquement | style.css, home.js | CLS max p1280 0,141 → 0, p1366 0,124 → 0 ; téléphone 0,093 → 0 |
| Textes < 12 px (légende vidéo, « sur 8 », « Je commande à », légende photo pizzerias, bourgs RN1) | Important | `font-size: max(12px, …)` sur les règles concernées | style.css | 30 → 0 relevés |
| Cibles < 44 px (pilules, puces, onglets, boutons small, rubriques, recherche, choix de pizzeria, ajouts de la carte, points RN1, Mode calme 31 px, « Toute la carte », liens du pied) | Important | `min-height: 44px` (et `min-width: 44px` pour Mode calme et les liens) ; liens texte en `inline-flex` 44 px sur téléphone, soulignement recalé | style.css | 203 → 0 relevés |
| Barre du bas qui couvre le premier écran (héros, actions des pizzerias, 404) | Important (leçon lot 1) | Barre masquée tant que le héros, le pied de page, la 404 ou un tiroir est à l'écran (IntersectionObserver) ; `padding-bottom` du corps = `--barres-h` mesuré | core.js, style.css | Éléments couverts par `nav.dock` (m320 à m430 et t820) : 23 → 0 |
| `?v=` absent | Finition | Déjà corrigé à l'étape 1 ; passé à `?v=20261028-2` partout | 6 pages HTML | Une seule version par fichier, aucun `v=20261028` sans suffixe |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Fin du montage presque invisible sur téléphone | Finition | Finition |
| Grands vides entre les sections sur ordinateur | Finition | Finition |
| Statut « Ouvert » sans mention « horaires indicatifs » | Finition | Finition (jours d'ouverture : donnée manquante côté client) |
| Carte Allasani seule sur sa ligne à 1440 px | Finition | Finition |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats) | aucun | aucun |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 6 / 6 / 6 / 5 / 7 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 43 / 43 / 43 / 43 / 31 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts par la barre du bas (m320 / m360 / m390 / m430 / t820) | 4 / 9 / 4 / 2 / 4 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts par l'en-tête en fin de page | présents | présents (éléments remontés sous l'en-tête au défilement, écartés par le rapport) |
| CLS au chargement, max (p1280 / p1366 / m320) | 0,141 / 0,124 / 0,093 | 0 / 0 / 0 |
| Épinglage, éléments coupés hors images de fond (1000×560 / 1024×640 / 1280×720 / 1366×768 / 1440×900 / 1728×1000 / 1920×1080 / 2560×1440) | 5 / 4 / 4 / 2 / 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 |
| Erreurs console | 0 (hors 404 attendu) | 0 (hors 404 attendu) |
| Modules chargés deux fois | 0 | 0 |

Interactions vérifiées à 390 px sur /, /carte, /cayenne et la 404 : barre masquée sur le héros, visible ensuite, masquée au pied de page, sous le tiroir « Nos pizzerias » et sur la 404 ; intro (fente puis logo) sans erreur à 1280×720. Les images de fond (fumée, farine) restent signalées « sous l'en-tête » ou « sort de l'écran » : ce sont des fonds en `cover`, hors défaut selon l'arbitrage. Preuves : `preuve-avant-*` et `preuve-apres-*` dans ce dossier.

## Note proposée
Ancienne note 80/100 → nouvelle note 87/100 · bloquants restants : 0
- Critère 3 (animations) 12 → 13 : les scènes épinglées ne débordent plus ; la fin du montage sur téléphone reste à reprendre.
- Critère 5 (formats) 10 → 13 : contenu hors écran sur 1280×720 et 1366×768, textes à 11 px et cibles de 42 px corrigés (15/15 non accordé).
- Critère 7 (technique) 8 → 9 : CLS de l'intro ramené à 0.
- Critère 8 (mise en ligne) 4 → 5 : `?v=` corrigé à l'étape 1, cohérent après le passage en `-2`.
- Critère 9 (accessibilité) 4 → 5 : cibles de 44 px et légendes à 12 px minimum.
