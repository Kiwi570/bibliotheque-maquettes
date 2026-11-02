# efficience-triathlon-maquette

<https://efficience-triathlon-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 103e7e9 du 27/10/2026

## Verdict

**80/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Une maquette « laboratoire de terrain » très juste pour un coach scientifique : intro courbe de lactate, palette nuit / rouge lactate / vert seuil, interactions qui marchent toutes. Deux bloquants à lever : le protocole épinglé de « Test d'effort » qui coupe son tableau et sa légende en 1280×720 et 1366×768, et l'image Grok de la cassette dont la chaîne traverse les pignons.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro E×T² avec courbe de lactate qui se trace, hero vidéo et titre massif, univers très propre au métier ; l'ouverture reste classique une fois le voile levé. |
| 2. Direction artistique et harmonie | 12/15 | Palette et typos (display large + mono) très cohérentes sur les 5 pages, mais vraies photos de jour à côté d'images Grok nocturnes, et une image Grok défectueuse (cassette). |
| 3. Animations et effets | 12/15 | 60 i/s sur portable et téléphone, titre lisible à 2,5 s, épinglages et galerie horizontale soignés ; le protocole épinglé déborde de l'écran sur les portables courants. |
| 4. Expérience ludique et interactions | 9/10 | Curseur de lactate, semaine type à contraintes, onglets clavier, fiche de stage en dialog, FAQ, créneaux simulés et pré-inscription : tout fonctionne et s'explique seul. |
| 5. Tous les formats | 10/15 | Aucun débordement horizontal, mais protocole coupé en 1280×720 / 1366×768, hero écrasé en tablette 820, sections épinglées coupées à 1000×560, textes à 10–11 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | « À compléter », « valeurs illustratives », « créneaux fictifs » et emplacements d'avis Google vides : rien d'inventé visible ; palmarès (2h05, 4h25, 1/3 Mondiaux) à faire confirmer. |
| 7. Technique et performance | 8/10 | Zéro erreur JS, CLS 0,01, liens OK, versions sans WebGL et réduites propres ; accueil lourd (5,1 Mo en p1440 avec la vidéo). |
| 8. Mise en ligne | 4/5 | Public, noindex nofollow sur chaque page, og:image JPG 1200×630 absolue, `?v=20261027` partout, 404 aux couleurs ; en-tête X-Robots-Tag absent de `vercel.json`. |
| 9. Accessibilité | 4/5 | Focus visible (3 px), Mode calme et réduire les animations respectés, onglets au clavier ; textes à 10–11 px et onglets/curseur à 40 px de haut. |
| **Total** | **80/100** | |

## Points forts

- Concept graphique fort et cohérent avec le métier : courbe de lactate dans l'intro, rail de zones Z1–Z5 qui suit le défilement, compteur BPM et allure, codes T1 et T2 entre les disciplines.
- Interactions nombreuses et toutes fonctionnelles : curseur de lactate (relevé mis à jour), semaine type qui se réorganise selon les contraintes, onglets « À venir / Passés » au clavier, fiche de stage en `<dialog>` fermée par Échap, réservation simulée clairement signalée « rien n'est réservé ».
- Fluidité exemplaire : 59,8 i/s en p1440 et 60 i/s en m390, aucune tâche longue.
- Honnêteté du contenu : avis Google en emplacements vides, valeurs marquées illustratives, « à compléter » bien visibles.
- Téléphone soigné : barre fixe appel + premier échange, menu plein écran lisible, aucun débordement de 320 à 430 px.

## Défauts

### Bloquants

1. **Protocole épinglé coupé sur les portables courants** : Test d'effort, 1280×720 et 1366×768, `captures/epingle-test-effort-0-1280x720-8.jpg`, `captures/epingle-test-effort-0-1366x768-8.jpg`. En 1280×720, les paliers 6 à 8 du tableau et la légende de la photo sortent de l'écran (22 px pour la légende, le tableau bien plus) ; en 1366×768, les paliers 7 et 8 sont hors écran et la légende est rognée. Cause : `assets/js/test.js:72` épingle `#proto` dès 961 px de large sans condition de hauteur, et `assets/css/main.css:847` donne `.proto` un `min-height: min(86vh, 820px)` alors que graphique (viewBox 760×400) + 9 lignes de tableau dépassent 720 px. Correction : `.proto` en `height: calc(100svh - var(--entete-h) - 40px)` en colonne flex, graphique en `flex: 1; min-height: 0; max-height: 40svh`, tableau en deux colonnes (paliers 1–4 / 5–8) ; sinon `mm.add("(min-width: 961px) and (min-height: 900px)")` pour l'épinglage et défilement simple en dessous. Effort : moyen.
2. **Image Grok « Qualité et cohérence » : chaîne impossible** : accueil, tous formats (bloc principes, niveau 3), `captures/accueil-p1440-08.jpg`, fichier `assets/img/g-principe-qualite-784.webp` (et `-640`). La chaîne passe en ligne droite devant le milieu de la cassette au lieu de s'enrouler sur un pignon, et les pignons s'empilent de façon incohérente : un triathlète le voit tout de suite. Cause : `index.html:259`. Correction : régénérer l'image (consigne dans `notes.json`), même nom et mêmes tailles. Effort : petit.

### Importants

1. **Hero écrasé en tablette** : accueil, t820, `captures/accueil-t820-00.jpg`. Le texte d'introduction tient dans une colonne d'environ 140 px (une ligne = 2 mots) à côté de la carte « Prochain stage ». Cause : `assets/css/main.css:412` (`.hero__sub` en 2 colonnes) ne passe en une colonne qu'à 760 px (`main.css:426-427`). Correction : passer le palier à `max-width: 1024px`, ou `grid-template-columns: minmax(28ch, 1fr) auto`. Effort : petit.
2. **Sections épinglées coupées à 1000×560** : accueil (disciplines), stage (galerie) et test (protocole), `captures/epingle-accueil-0-1000x560-8.jpg`, `captures/epingle-stage-triathlon-montagne-0-1000x560-8.jpg`, `captures/epingle-test-effort-0-1000x560-8.jpg`. La liste « VID / VE / U » de « Nager » passe sous la barre du bas et ses codes sont tronqués ; les images de la galerie sortent de 121 px. Cause : épinglage `div.disc__pin` et `#galWrap` sans palier de hauteur. Correction : palier `@media (max-height: 600px)` qui réduit titres et marges, ou désactiver l'épinglage sous 640 px de haut. Effort : moyen.
3. **Textes de 10–11 px sur téléphone** : toutes pages, m320 à m430. « Coach Guillaume Deloge » à 10 px (`main.css:262`), bouton de la barre « Premier échange » et numéro à 11 px, surtitres, légendes de figures, badges « à compléter », étiquettes SVG « Z3 » à 10 px. Correction : plancher `font-size: max(12px, …)` sur `.brand__name small`, `.actionbar .btn`, `.mono`, `figcaption`, `.todo`, `svg text`. Effort : petit.
4. **Zones tactiles sous 44 px** : accueil, téléphone. Onglets « À venir / Passés » à 40 px (`main.css:660`), curseur `#lacRange` à 40 px, logo 46×38, fil d'Ariane « Accueil » 60×19. Correction : `min-height: 44px` sur `.tabs button`, piste du curseur en 44 px, `padding-block` sur `.crumbs a` et `.brand`. Effort : petit.

### Finition

1. **Bouton du hero mangé par la barre du bas** : accueil m390 et m360, test m320, `captures/bande-ouverture-m390.jpg` (étape 2,5 s). « Réserver un premier échange » passe en partie sous la barre fixe à l'ouverture. Correction : `padding-bottom: calc(var(--barres-h) + 16px)` sur `.hero__in` en téléphone. Effort : petit.
2. **Titres coupés par césure sur téléphone** : accueil m390/m320, « STAGE EFFI-CIENCE », « TRIATH-LON MONTAGNE », « PERSON-NALISATION ». Cause : `hyphens: auto` sur `.stage__title` et `.principle__title` (`main.css:970`). Correction : `hyphens: manual` et taille en `clamp()` un cran plus petite sous 400 px. Effort : petit.
3. **Lumières des images mêlées** : vraies photos de jour (piste, lac, portraits) à côté d'images Grok nocturnes bleu nuit et rouge ; ça tient grâce à l'assombrissement, mais l'accueil alterne parfois sur un même écran (disciplines). Correction : appliquer le même voile froid (`filter` ou dégradé `--z`) aux photos réelles des disciplines. Effort : petit.
4. **Accueil lourd** : 5,1 Mo en p1440 et g1920 (vidéo `accueil-1280.mp4` 3,1 Mo). Correction : réencoder à ≤ 1,5 Mo ou servir `accueil-854.mp4` jusqu'à 1440 px. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (voile d'intro E×T² de 2 s, `bande-ouverture-*.jpg`) |
| Fluidité p1440 / m390 | 59,8 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,0105 (accueil p1440) |
| Poids de l'accueil, p1440 / m390 | 5,08 Mo / 2,67 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur JS ; seule erreur : le statut 404 de la page 404 elle-même ; versions sans WebGL et réduites sans défaut |
| Débordement horizontal | Aucun |
| Sections épinglées | Test d'effort coupé en 1280×720, 1366×768 (bloquant), 1000×560, 1024×640 ; accueil et stage coupés à 1000×560 et 1024×640 ; stage : images sous l'en-tête en 1728–2560 (sans gravité) |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex nofollow sur 4/4 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · `?v=20261027` partout · 404 personnalisée |

## Vérifications écartées

- « INVISIBLES » `figure.media > figcaption` « Paliers chronométrés » (Test d'effort) : c'est une des 4 photos superposées du protocole, en `opacity: 0` tant que son palier n'est pas atteint (`test.js:61-62`, `main.css:853`). Fondu voulu, pas un élément bloqué.
- « ÉCHECS » `accueil-1280.mp4` et `test-piste-1280.mp4` en `net::ERR_ABORTED` : les deux fichiers répondent 200 ; le navigateur annule le chargement en changeant de source selon la largeur.
- Erreur console sur `/zz-page-introuvable-audit` : c'est le statut 404 de la page elle-même, attendu.
- « MASQUÉ » sous l'en-tête au pied de page et sous la barre du bas à l'ouverture (liens du pied, contacts) : position de défilement de la mesure, contenu accessible en défilant ; seul le bouton du hero est retenu en finition.
- Valeurs « h1 » à 2,4–6,9 s sur l'accueil : mesurées en parallèle et incluant le voile d'intro ; la bande d'ouverture prise seule montre le titre lisible à 2,5 s.
- CLS 0,107 sur l'accueil p1440 en « réduire les animations » : hors règle (seul le CLS de chargement compte, 0,0105).
- Galerie du stage sous l'en-tête en 1728×1000, 1920×1080 et 2560×1440 : seules des images passent sous l'en-tête, pas de texte.
- Fichier `g-course` (jambes sur piste) : pied d'appui vérifié en gros plan, anatomie cohérente.
- Chiffres du coach (2h05, 4h25, 1/3 aux Mondiaux 70.3, 2006, 20 ans) : précis, cohérents et attribués ; à faire confirmer par le client mais pas suspects d'invention.


---

## efficience-triathlon-maquette : corrections de l'étape 2

Commit f3ce8cf (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Protocole épinglé coupé sur les portables courants (Test d'effort) | Bloquant | Méthode « Tout tenir dans l'écran » : `#proto.is-pin` en `height: 100svh`, `padding-top: var(--entete-h)`, `padding-bottom: var(--barres-h)` (mesurés en JS, ResizeObserver) ; graphique en `flex: 1; min-height: 0`, redessiné à la hauteur restante ; tableau des paliers en deux colonnes (1–4 / 5–8) ; photos à `height: 100%` ; épinglage `start: "top top"` ; palier `max-height: 760px` / `600px` | `assets/js/test.js`, `assets/js/app.js`, `assets/css/main.css` | Coupe 32 px en 1280×720, 14 px en 1366×768, 205 px en 1000×560, 91 px en 1024×640 → 0 aux 8 tailles (`preuve-test-*.jpg`) |
| Sections épinglées coupées à 1000×560 (disciplines de l'accueil, galerie du stage) | Important | Même méthode : `.disc__pin` et `#galWrap` en 100svh flex, piste et cartes en `flex: 1; min-height: 0`, image de carte qui prend la place restante ; encart des disciplines gardé dans son panneau ; `start: "top top"`, `anticipatePin` retiré ; palier `max-height: 760px` / `600px` | `assets/js/home.js`, `assets/js/montagne.js`, `assets/css/main.css` | Disciplines 108 px (1000×560), 29 px (1024×640) → 0 ; galerie 121 / 41 px, et 20–69 px sous l'en-tête en 1728–2560 → 0 aux 8 tailles |
| Héros écrasé sur tablette | Important | `.hero__sub` en une colonne et actions alignées à gauche jusqu'à 1024 px | `assets/css/main.css` | Texte d'intro ≈ 140 px → 598 px de large en t820 (`preuve-hero-t820-apres.jpg`) |
| Textes de 10–11 px sur téléphone | Important | Variables `--t-xs` / `--t-xxs` (anciens 0,6875 / 0,625 / 0,7 rem) et `--t-svg` / `--t-svg-s` (étiquettes SVG), plancher `max(12px, …)` sous 1100 px ; `.blk` et légende « prévu / réalisé » branchés sur ces variables ; séances de la semaine type sans pastille et avec césure entre 641 et 960 px pour tenir à 12 px | `assets/css/main.css`, `test-effort.html` | 300 → 0 relevés < 12 px (m320 à t820) |
| Zones tactiles sous 44 px | Important | Onglets et curseur `#lacRange` à 44 px, `.brand` `min-height: 44px`, fil d'Ariane et liens du pied en `inline-flex` 44 px, lien en ligne des mentions agrandi | `assets/css/main.css` | 108 → 0 cibles < 44 px |
| Barre du bas (bouton du héros mangé à l'ouverture) | Finition (demandée) | Barre affichée seulement une fois le héros dépassé (IntersectionObserver), masquée sur le formulaire d'inscription, le bloc rendez-vous, le pied de page, le menu ouvert et la 404 ; `body` en `padding-bottom: var(--barres-h)` mesuré ; sans JS la barre reste visible | `assets/js/app.js`, `assets/css/main.css` | 9 → 0 éléments couverts par la barre (m320–m430, t820) ; contrôlé au clic : ouverture masquée, après héros visible, formulaire / rendez-vous / pied / menu masquée |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Image Grok « Qualité et cohérence » (chaîne impossible, `g-principe-qualite-*.webp`) | Bloquant | Image Grok (à régénérer par l'utilisateur, consigne dans `notes.json`) |
| Titres coupés par césure sur téléphone | Finition | Finition |
| Lumières des images mêlées (photos de jour / Grok nocturnes) | Finition | Finition |
| Accueil lourd (vidéo 3,1 Mo) | Finition | Finition |
| X-Robots-Tag absent de `vercel.json` | Important (mise en ligne) | Déjà corrigé à l'étape 1 (présent dans `vercel.json`) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (45 pages × formats) | 0 | 0 |
| Textes < 12 px (m320–t820) | 300 relevés | 0 |
| Cibles < 44 px | 108 | 0 |
| Éléments couverts par la barre du bas | 9 (bouton du héros, accueil m390/m360, test m320…) | 0 |
| Autres « couverts » | Seulement l'en-tête sur le pied de page en position de mesure (écarté par le rapport) | Idem, positions décalées |
| Épinglage Test d'effort (1000×560 / 1024×640 / 1280×720 / 1366×768 / 1440–2560) | 205 / 91 / 32 / 14 / 0 px | 0 partout |
| Épinglage disciplines accueil (1000×560 / 1024×640) | 108 / 29 px | 0 / 0 (0 aux 8 tailles) |
| Épinglage galerie stage (1000×560 / 1024×640 / 1728 / 1920 / 2560) | 121 / 41 / 20 / 35 / 69 px | 0 partout |
| Erreurs console | 0 (hors statut 404 de la 404) | 0 (idem) |
| Modules chargés deux fois | 0 (scripts classiques, une seule version) | 0 (`?v=20261028-2` partout) |

## Note proposée
Ancienne note 80/100 → nouvelle note 86/100 · bloquants restants : 1
- Critère 3 (animations) 12 → 13 : le protocole épinglé ne déborde plus de l'écran.
- Critère 5 (formats) 10 → 14 : protocole entier en 1280×720 / 1366×768, héros en une colonne en tablette, épinglages complets à 1000×560, textes ≥ 12 px.
- Critère 9 (accessibilité) 4 → 5 : textes ≥ 12 px et cibles ≥ 44 px.
- Verdict inchangé « À peaufiner » : l'image Grok de la cassette reste bloquante.


## Images Grok définitives (29/10)

Commit 5bfda41 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| `g-principe-qualite-{640,784}.webp` | Cassette à chaîne impossible | Pas de recadrage (même format 784×1168 que les quatre autres principes, recadré en `cover` par le CSS) ; 784×1168 et 640×953 | Inchangé : `alt=""` `aria-hidden`, comme les quatre autres images de principes (décoratives, le titre de la carte porte le sens) | 1440×900, 1920×1080, 1366×768, 1000×560, 390×844 : image chargée et nette, 0 erreur console, 0 réponse 404, CLS au chargement ≤ 0,0105 (hero, inchangé) ; les décalages au défilement viennent uniquement des sections épinglées ; carte « Niveau 3 » capturée au premier plan du paquet empilé |

Note : 87/100 → 88/100 (c2 +1 : cassette corrigée) · bloquants : 1 → 0 · Prête à envoyer
