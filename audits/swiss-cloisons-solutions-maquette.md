# swiss-cloisons-solutions-maquette

<https://swiss-cloisons-solutions-maquette.vercel.app> · audit du 28 octobre 2026 · dernier commit 025e01c du 27 octobre 2026

## Verdict

**78/100 · À peaufiner · 2 défauts bloquants**

Concept « Verre & Lumière » propre au métier (vitre WebGL qui coulisse, coupe axonométrique pilotée, vitre à essuyer, bande dépolie en fil rouge) et interactions toutes fonctionnelles. Deux défauts de mise en page bloquent l'envoi : sur les portables courants, le titre de « Cinq étapes » passe sous l'en-tête pendant l'épinglage, et sur téléphone l'avant/après de la page AXA reste sur deux colonnes, avec des étiquettes qui se chevauchent.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Le logo-maison qui se trace, puis la vitre WebGL qui coulisse sur une vraie photo de bureaux, signent tout de suite le métier. La suite (cartes, grille 12 colonnes) reste plus sage que l'ouverture. |
| 2. Direction artistique et harmonie | 12/15 | Calcaire, graphite et vert d'eau avec Instrument Sans et Serif, la bande dépolie est reprise partout et les 7 images Grok sont sans défaut et cohérentes avec les photos réelles. Quelques sections claires se ressemblent beaucoup. |
| 3. Animations et effets | 11/15 | 60 i/s sur portable et téléphone, titre lisible à 2,5 s, galerie horizontale épinglée, coupe axonométrique liée au défilement, mode calme. Mais l'épinglage de « Cinq étapes » masque son titre de 1280 à 1728 px. |
| 4. Expérience ludique et interactions | 9/10 | Les puces qui reconfigurent la coupe, la vitre à essuyer (doigt, souris ou curseur), le devis en 5 étapes avec validation et récapitulatif, la visionneuse au clavier, Copier, EN et Son fonctionnent tous. |
| 5. Tous les formats | 9/15 | Aucun débordement de 320 à 1920 px, l'en-tête tient à 320 px et la barre basse est bien masquée au pied de page. Mais l'avant/après AXA reste sur deux colonnes en téléphone, le titre de la méthode passe sous l'en-tête, il y a des textes de 10 à 11 px et des cibles trop petites (curseur de 16 px de haut). |
| 6. Contenu et fiabilité | 9/10 | L'avis du Laboratoire MGD, les logos clients, l'adresse, le « devis gratuit » et le crédit photo H. Maria sont repris du site actuel. Les « à compléter » sont bien marqués, les images IA portent un badge « Illustration » et les mentions légales sont présentes. Les chiffres des fiches projets n'ont pas pu être recoupés. |
| 7. Technique et performance | 8/10 | Aucune erreur JS, CLS de 0 à 0,016, `?v=` identique partout, polices attendues avant l'ouverture. La page AXA pèse 3,9 Mo sur portable et OGL écrit une erreur dans la console sans WebGL (le repli visuel fonctionne). |
| 8. Mise en ligne | 4/5 | Site public, noindex dans les 5 pages, og:image JPG 1200×630 en adresse complète, 404 aux couleurs du client, pas de Cache-Control. L'en-tête X-Robots-Tag manque, et les mentions légales n'ont pas d'og:image. |
| 9. Accessibilité | 4/5 | Focus visible (2 px vert), lien d'évitement, « réduire les animations » respecté (titre à 0,2 s), bouton calme aussi dans le menu mobile, textes alternatifs soignés. En revanche, textes de 10 px et cibles de moins de 44 px sur téléphone. |
| **Total** | **78/100** | |

## Points forts

- Une idée tirée du métier et tenue de bout en bout :
  - la vitre WebGL avec chants réfractés et bande dépolie sur la photo d'ouverture ;
  - la coupe axonométrique plafond, cloisons et plancher qui se construit au défilement ;
  - le « Essuyez la vitre » avant/après sur de vraies photos du chantier AXA ;
  - la 404 « Cette pièce n'a pas encore été cloisonnée ».
- Des interactions abouties :
  - devis en 5 étapes avec erreurs claires, récapitulatif modifiable et message final de démonstration ;
  - visionneuse AXA avec flèches clavier et Échap ;
  - menu mobile avec Échap et verrou de défilement ;
  - version anglaise complète ;
  - barre « Appeler / Demander un devis » sur téléphone.
- Un contenu honnête : vraies photos du client, images IA signalées par un badge « Illustration », provisoires marqués « à compléter » ou « à confirmer ».
- Fluidité de 60 i/s sans aucune image de plus de 50 ms, CLS quasi nul, aucune erreur JavaScript.

## Défauts

### Bloquants

1. **Titre « Cinq étapes, bord à bord » masqué par l'en-tête pendant l'épinglage de la méthode**
   - Où : accueil, en 1280×720, 1366×768, 1440×900 et 1728×1000. Pendant presque tout l'épinglage, le titre et le chapeau sont coupés par l'en-tête. En 1440×900, le titre est 39 px sous l'en-tête.
   - Captures : `captures/epingle-accueil-1-1440x900-50.jpg`, `captures/epingle-accueil-1-1280x720-50.jpg`, `captures/accueil-p1440-15.jpg`.
   - Cause : `assets/js/home.js:161`. Le déclencheur est la scène des cartes (`start: 'top 22%'`), mais c'est toute la section `.methode` qui est épinglée, titre compris. Le titre est donc figé au-dessus de 22 % de l'écran, sous l'en-tête de 78 px.
   - Correction :
     - prendre `.methode` comme déclencheur, avec `start: () => 'top ' + (entete.offsetHeight + 16) + 'px'` (hauteur mesurée en JS, `--entete-h`) ;
     - faire de la section une colonne flex de `calc(100svh - var(--entete-h))`, avec les cartes en `flex: 1; min-height: 0` ;
     - ajouter un palier `max-height: 800px` qui réduit le titre et les marges.
   - Effort : moyen.
2. **Avant/après AXA sur deux colonnes en téléphone, avec étiquettes superposées**
   - Où : `/realisation-axa`, section « Du brut au vitré », de m320 à m430. Le texte tient dans une colonne de 140 px, « Phase finale » recouvre « Phase travaux » (mesuré en 360, 390 et 430), et l'image ne fait que 195 px de large.
   - Captures : `captures/inter-axa-avantapres-390.jpg`, `captures/realisation-axa-m390-06.jpg`.
   - Cause : `realisation-axa.html:181`. Le style en ligne `grid-template-columns:minmax(0,5fr) minmax(0,7fr)` l'emporte sur la règle mobile `.aa { grid-template-columns: 1fr }` (`assets/css/site.css:349`). Les styles en ligne `max-width:560px;margin-left:auto` des lignes 188 et 195 sont dans le même cas.
   - Correction :
     - remplacer ces styles en ligne par une classe `.aa--axa` ;
     - définir cette classe dans `@media (min-width: 861px)` ;
     - en une colonne, laisser la vitre en pleine largeur.
   - Effort : petit.

### Importants

1. **Légendes de la galerie « Huit projets » coupées en 1000×560 et 1024×640**
   - Où : accueil, galerie épinglée. En 1000×560, le texte des cartes sort de l'écran de 62 px. En 1024×640, il sort de 3 à 6 px.
   - Captures : `captures/epingle-accueil-0-1000x560-50.jpg`, `captures/epingle-accueil-0-1024x640-8.jpg`.
   - Cause : `assets/js/home.js:140` (`start: 'top 14%'`), sans hauteur de carte bornée par l'écran.
   - Correction :
     - épingler à `top var(--entete-h)` ;
     - cartes en colonne flex de `100svh - --entete-h`, image en `flex: 1; min-height: 0` ;
     - palier `max-height: 600px` pour le titre de section.
   - Effort : moyen.
2. **En-tête X-Robots-Tag absent**
   - Où : toutes les pages.
   - Cause : `vercel.json` ne contient que `cleanUrls` et `trailingSlash`.
   - Correction : ajouter un bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)`.
   - Effort : petit.
3. **Textes de 10 à 11 px sur téléphone**
   - Où : toutes les pages, de m320 à m430.
   - Éléments concernés :
     - nom dans l'en-tête, 11 px (`assets/css/site.css:158`) ;
     - numéro de téléphone de la barre basse, 10 px (`site.css:589`) ;
     - légendes de la bande « matières », 10 px (`site.css:270`) ;
     - badge « Illustration », 10 px (`site.css:602`) ;
     - étiquettes « à compléter », 11 px (`site.css:98`).
   - Correction : `font-size: max(12px, …)` sur ces cinq règles.
   - Effort : petit.
4. **Cibles tactiles de moins de 44 px**
   - Où : téléphone.
   - Éléments concernés :
     - curseur de l'avant/après, 16 px de haut (`#aa-range`, `#aa2-range`, `site.css:347`) ;
     - liens téléphone et e-mail du bloc contact, 22 px ;
     - « Toutes les photos du chantier AXA » et « Toutes les réalisations », 19 à 27 px ;
     - logo de l'en-tête, 37 px ;
     - LinkedIn dans le pied de page, 55×42 px ;
     - bouton EN, 42 px de large.
   - Correction :
     - `min-height: 44px` sur le curseur, avec une piste dessinée au centre ;
     - `display: inline-flex; min-height: 44px; align-items: center` sur `.tel-link`, `.link`, `.retour` et `.hd__logo` ;
     - `min-width: 44px` sur `.tool`.
   - Effort : petit.

### Finition

1. **Bouton « Copier » du bloc contact hors écran dans la colonne collante du devis**
   - Où : `/devis`, en 1000×560 et 1024×640 (18 à 34 px hors écran).
   - Capture : `captures/epingle-devis-0-1024x640-8.jpg`.
   - Correction : `max-height: calc(100svh - var(--entete-h) - 24px); overflow: auto` sur `.devis__aside`, ou désactiver le collant sous 700 px de haut.
   - Effort : petit.
2. **Erreur console « unable to create webgl context » sans WebGL**
   - Où : accueil et `/realisation-axa`. Le repli CSS s'affiche bien.
   - Cause : `assets/js/glass.js:110`. OGL écrit l'erreur (`vendor/ogl/core/Renderer.js:46`) avant le `try/catch`.
   - Correction : tester `canvas.getContext('webgl2') || canvas.getContext('webgl')` avant `new Renderer`, et sortir sans rien créer si le contexte manque.
   - Effort : petit.
3. **Pas d'og:image sur les mentions légales**
   - Cause : `mentions-legales.html`, en-tête sans balises og.
   - Correction : reprendre le bloc og et l'og:image de `index.html:10`.
   - Effort : petit.
4. **Page AXA de 3,9 Mo sur portable (2,7 Mo sur téléphone)**
   - Cause : la mosaïque de 24 photos en 1400 px est chargée d'un bloc.
   - Correction : `sizes` au plus juste (environ 25vw), variantes de 700 px pour la mosaïque, et 1400 px réservé à la visionneuse.
   - Effort : petit.
5. **Ouverture de 2,5 s, dont 1,7 s de loader avant le titre**
   - Où : accueil. Captures : `captures/bande-ouverture-p1440.jpg`, `captures/bande-ouverture-m390.jpg`.
   - Le titre arrive à 2 s et n'est pleinement lisible qu'à 2,5 s, sur portable comme sur téléphone. C'est conforme, mais limite pour un retour de visite.
   - Correction : passer le loader à 1,2 s lors des visites suivantes (sessionStorage).
   - Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (titre en cours d'apparition à 2 s, après le loader « maison ») |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0,016 (404), 0 sur l'accueil |
| Poids de l'accueil, p1440 / m390 | 2,22 Mo / 2,02 Mo (AXA : 3,88 Mo / 2,66 Mo) |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS. Sans WebGL : repli correct, une erreur console OGL. Réduire les animations : titre à 0,2 s, contenu complet, CLS 0. |
| Débordement horizontal | Aucun, de 320 à 1920 px |
| Sections épinglées | Méthode : titre sous l'en-tête de 1280×720 à 1728×1000 (bloquant). Galerie « Huit projets » : légendes coupées en 1000×560 et 1024×640, correcte dès 1280×720. Coupe axonométrique : correcte. Devis : bouton Copier hors écran en 1000×560 et 1024×640. Mosaïque AXA : correcte. |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public : oui. Noindex : oui, 5 pages sur 5. X-Robots-Tag : absent. robots.txt : absent, non pénalisé. og:image : JPG 1200×630 avec adresse complète, absente sur les mentions. `?v=20261027` : identique partout. 404 : personnalisée. |

## Vérifications écartées

- **Ouvertures « h1 » de 2,0 à 3,5 s par format** : mesures prises en parallèle avec d'autres maquettes. Les bandes d'ouverture (une maquette à la fois) montrent le titre lisible à 2,5 s sur portable et sur téléphone.
- **Invisibles `.secteurs__rot > span` (« l'horlogerie »…)** : ce sont des mots qui tournent dans « Des clients dans … ». Un seul est visible à la fois, comme prévu (`captures/accueil-p1440-18.jpg`).
- **Invisibles `.panneau__num`, `.panneau h3` et `.badge-illus` en p1280 à g1920** : les cartes de la méthode sont liées au défilement (scrub). Elles sont toutes visibles à la fin de l'épinglage (`captures/accueil-p1440-16.jpg`) et d'emblée en mode calme.
- **Images de la galerie « sous l'en-tête » de 15 à 51 px** : c'est l'image agrandie dans son cadre (effet loupe et parallaxe). Le cadre commence sous l'en-tête et aucun texte n'est masqué (`captures/epingle-accueil-0-1280x720-8.jpg`).
- **« a.card sort de l'écran » à 8 % en 1280×720 et 1366×768** : la section n'est pas encore épinglée à ce moment. À 50 % et 92 %, rien ne sort.
- **Image AXA « sous l'en-tête » de 10 px en 1000×560** : c'est le haut d'une photo de la mosaïque, sans texte.
- **LCP de 4,5 s sur AXA en m320** : mesure en parallèle, non reproduite dans les autres formats (0,2 à 0,6 s).
- **Erreur 404 sur la page introuvable** : c'est le statut attendu de la page elle-même.
- **Bande blanche horizontale sur les photos** : c'est la « bande dépolie » des vitrages, voulue et commentée dans `site.css:2` et `site.css:362`. Ce n'est pas un défaut d'image.
- **Images Grok** (`accueil/manifeste`, `metiers/sav`, `methode/etude`, `methode/offre`, `confiance/reflets`, `devis/entete`, `mentions/bandeau`), vues en taille réelle : mains gantées correctes, gestes et objets plausibles, aucun texte ni filigrane. Elles sont signalées par le badge « Illustration ».
- **robots.txt absent, bibliothèques sans `?v=`** : non pénalisés.


---

## swiss-cloisons-solutions-maquette : corrections de l'étape 2

Commit 7d14c0d (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Titre « Cinq étapes, bord à bord » sous l'en-tête pendant l'épinglage | Bloquant | Méthode « Tout tenir dans l'écran » : `.methode` est déclencheur et élément épinglé, `start: 'top top'`, sans `anticipatePin`. En `.is-pin`, elle passe en colonne flex de `100svh`, avec `padding-top: var(--entete-h) + 16px` (hauteur mesurée en JS par ResizeObserver dans core.js). Panneaux en flex, image en `flex: 0 1 auto; min-height: 0`. Palier `max-height: 800px` qui réduit le titre. | assets/js/core.js, assets/js/home.js, assets/css/site.css | Titre sous l'en-tête de 1000×560 à 1920×1080 (19 à 130 px) → plus rien aux 8 tailles (`preuve-methode-*`) |
| Avant/après AXA sur deux colonnes en téléphone, étiquettes superposées | Bloquant | Styles en ligne remplacés par la classe `.aa--axa`, en deux colonnes seulement à partir de 861 px. Vitre en pleine largeur sur téléphone. | realisation-axa.html, assets/css/site.css | Image de 195 px avec étiquettes superposées → une colonne, vitre de 288 à 396 px, sans chevauchement (`preuve-axa-avant-apres-m390-*`) |
| Légendes de la galerie « Huit projets » coupées en 1000×560 et 1024×640 | Important | Même méthode : `.reals__pin` en colonne flex de `100svh` sous `--entete-h`, épinglé en `top top`, cartes bornées à la hauteur de la piste, image qui se réduit. Méta « à compléter » qui revient à la ligne. | assets/js/home.js, assets/css/site.css | Texte sorti de 62 px et 3 à 6 px → plus rien de coupé (`preuve-galerie-*`). Reste « img sous l'en-tête » : image agrandie dans son cadre (effet loupe), déjà écartée par le rapport, cadre sous l'en-tête. |
| Textes de 10 à 11 px sur téléphone | Important | `--t-xs: max(12px, 0.75rem)`. `.todo`, légendes des matières, badge « Illustration », numéros de la bande AXA et numéro de la barre du bas passent sur `var(--t-xs)`. Nom de l'en-tête à `max(12px, …)`. Étiquettes de la carte à 12 px. | assets/css/site.css | 1 à 8 textes < 12 px par page → 0 partout |
| Cibles de moins de 44 px | Important | Curseur avant/après en `min-height: 44px`. Logo de l'en-tête à 44 px. `.tool` et étapes du devis à `min-width: 44px`. Sous 1080 px, liens téléphone et e-mail, `.link`, `.retour`, liens du pied et du sommaire légal en `inline-flex` de 44 px, avec le soulignement recalé sous le texte. | assets/css/site.css | 1 à 9 cibles < 44 px par page → 0 partout |
| Barre du bas (leçon du lot 1) | Important | Elle n'apparaît qu'une fois le héros dépassé (IntersectionObserver), reste masquée au pied, au contact et quand le menu est ouvert. `--barres-h` est mesurée en JS, et le pied a `padding-bottom` égal à `28px + var(--barres-h)` au lieu de 96 px codés en dur. | assets/js/core.js, assets/css/site.css | Héros à 70 % : barre visible → masquée. Menu ouvert : masquée. Éléments couverts : 0 → 0. |
| En-tête X-Robots-Tag absent | Important | Déjà corrigé à l'étape 1 (25cd93a) | vercel.json | — |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Bouton « Copier » du devis hors écran en 1000×560 et 1024×640 (18 et 34 px) | Finition | finition |
| Erreur console OGL « unable to create webgl context » sans WebGL | Finition | finition |
| Pas d'og:image sur les mentions légales | Finition | finition |
| Page AXA de 3,9 Mo sur portable | Finition | finition |
| Loader de 1,7 s à chaque visite | Finition | finition |
| Bande AXA « img sous l'en-tête » de 10 px en 1000×560 | — | Écartée par le rapport (haut d'une photo, sans texte) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920, 5 pages) | aucun | aucun |
| Textes < 12 px | accueil 8 (m320 à m430), 7 (t820) ; devis 3 ; mentions 6 ; AXA 5 ; 404 1 | 0 sur tous les formats |
| Cibles < 44 px | accueil 8 (m), 9 (t820) ; devis 4 à 6 ; mentions 7 à 8 ; AXA 6 à 7 ; 404 1 | 0 sur tous les formats |
| Éléments couverts (barre du bas, m320 à m430) | 0 | 0 |
| Méthode épinglée, 8 tailles | titre ou surtitre sous l'en-tête aux 8 tailles (jusqu'à 130 px) | rien de coupé ni sous l'en-tête |
| Galerie « Huit projets », 8 tailles | texte coupé en 1000×560 (62 px) et 1024×640 (3 à 6 px) | rien de coupé (reste l'image agrandie dans son cadre, écartée) |
| Devis, colonne collante | Copier hors écran en 1000×560 et 1024×640 | inchangé (finition) |
| Erreurs console | 404 seulement (statut attendu) | 404 seulement (statut attendu), aucune nouvelle |
| Modules chargés deux fois | aucun | aucun (`?v=20261028-2` partout, aucun `v=20261028` restant) |
| Interactions | — | Menu mobile (Échap), barre du bas, curseur avant/après (44 px, valeur 83 au clic), mode calme sans épinglage : OK, aucune erreur |

## Note proposée
Ancienne note 78/100 → nouvelle note 84/100 · bloquants restants : 0
- Critère 3 (animations) 11 → 12 : l'épinglage de « Cinq étapes » ne masque plus son titre.
- Critère 5 (formats) 9 → 13 : avant/après AXA en une colonne, titre de la méthode visible, textes ≥ 12 px, cibles ≥ 44 px (4 défauts cités et corrigés).
- Critère 9 (accessibilité) 4 → 5 : textes ≥ 12 px et cibles ≥ 44 px (plafond du critère).
- Critère 8 inchangé : le X-Robots-Tag a été corrigé à l'étape 1.
- Verdict : Prête à envoyer.
