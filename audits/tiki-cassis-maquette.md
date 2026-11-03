# tiki-cassis-maquette

<https://tiki-cassis-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 16e193b du 27/10/2026

## Verdict

**76/100 · À peaufiner · 3 défaut(s) bloquant(s)**

Belle idée : une journée en mer sur une seule page. Le ciel passe de l'aube à la nuit au fil du défilement, le mot TIKI s'ouvre sur la vidéo, et le composeur de sortie, la carte chronométrée et la demande en 3 étapes fonctionnent. Trois défauts de format bloquent l'envoi : le soleil fixe fait déborder l'accueil sur tous les téléphones, le héros de « Formules » est coupé sur téléphone, et les légendes de la galerie épinglée sortent de l'écran sur les portables courants.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Intro « lever du jour puis plongée dans le I de TIKI », ciel et horloge qui suivent la journée, hublot vidéo, carte de navigation chronométrée : original et juste pour un bateau de Cassis. |
| 2. Direction artistique et harmonie | 12/15 | Serif condensée et sans-serif bien associées, palette ciel, sable et nuit cohérente sur les 4 pages ; les photos du client sont inégales (téléphone, grand-angle déformant du pont). |
| 3. Animations et effets | 11/15 | 59 à 60 i/s, citations écrites ligne à ligne, compteurs, galerie horizontale ; mais le titre n'est lisible qu'après 3,5 s environ, sans bouton pour passer, et la galerie épinglée déborde. |
| 4. Expérience ludique et interactions | 9/10 | Composeur avec prix en direct (moment, durée, saison, 12 passagers maximum), carte chronométrée, demande en 3 étapes avec validation et récapitulatif, FAQ, copie, son, EN et Mode calme : tout marche. |
| 5. Tous les formats | 7/15 | Débordement horizontal de l'accueil de 360 à 430 px, héros de « Formules » coupé sur téléphone, légendes de galerie hors écran en 1280, 1366 et 1440 ; textes de 10,6 à 11,8 px et cibles de 19 à 38 px. |
| 6. Contenu et fiabilité | 9/10 | Année, dimensions, capacité, Groupement et tarifs vérifiés sur tikicassis.fr, vidéo IA signalée, feux de 2026 marqués « Passé », avis et conditions marqués « à compléter », mentions légales présentes. |
| 7. Technique et performance | 8/10 | Aucune erreur JS, aucun lien cassé, CLS de 0,001 au plus ; accueil lourd sur ordinateur (6,9 Mo en p1440, 9,6 Mo en g1920) à cause des deux vidéos. |
| 8. Mise en ligne | 3/5 | Public, noindex sur les 4 pages, X-Robots-Tag, og:image JPG 1200×630 absolue ; mais aucun `?v=` sur le CSS et le JS, et la 404 est la page Vercel par défaut. |
| 9. Accessibilité | 4/5 | Focus visible, Échap ferme le menu, Mode calme et « réduire les animations » respectés, canvas et vidéos décrits ; textes sous 12 px et cibles sous 44 px sur téléphone. |
| **Total** | **76/100** | |

## Points forts

- Concept propre au client : la page se lit comme une sortie en mer. Le ciel, le soleil et l'horloge « carnet de bord » avancent de 7 h à 23 h au fil du défilement, puis le feu d'artifice arrive à la nuit.
- Ouverture mémorable : ligne des calanques, lever du soleil, mot TIKI rempli par la vidéo, puis plongée dans le « I ».
- Composeur de sortie très réussi : le prix suit le moment, la durée et la saison (grille identique au site actuel), le nombre de passagers est plafonné à 12 et le programme indicatif est mis à jour.
- Demande de privatisation en 3 étapes avec messages d'erreur clairs, récapitulatif et confirmation « simulée » honnête.
- Contenu fiable et sobre : chiffres repris du site actuel, vidéo IA étiquetée avec bouton pause, dates passées marquées « Passé ».
- Fluidité parfaite (59,4 et 59,8 i/s, aucune image de plus de 100 ms) et version anglaise complète.

## Défauts

### Bloquants

1. **Débordement horizontal de l'accueil sur téléphone** : accueil, m360 (407 px), m390 (442 px), m430 (488 px), aussi en m320 et sans WebGL. Dès le milieu de la page, l'en-tête fixe est décalé et le bouton menu est coupé à droite, `captures/accueil-m390-10.jpg`, `captures/planche-accueil-m390.jpg` (images 10 à 23). Cause : `css/style.css:105-106`. Le soleil `.sky__sun`, de 34vmin et légèrement flouté, est placé par `js/core.js:75` jusqu'à 92 % de la largeur. Son parent `.sky` est en `position: fixed`, donc le `overflow-x: clip` du `body` (`css/style.css:70`) ne le coupe pas. Correction : ajouter `overflow: hidden` (ou `contain: paint`) à `.sky`. Effort : petit.
2. **Héros de « Formules » coupé sur téléphone** : formules, m360, m390 et m430. Le surtitre « 7 jours sur 7 », le titre et le paragraphe sortent à droite jusqu'à 655 px (« une heure ou une jo… »), `captures/formules-m390-00.jpg`, `captures/verif-formules-m390-hero.jpg`. Cause : `.phero` est en `display: grid` (`css/style.css:536`), et son enfant `.phero__inner` (`css/style.css:538`) garde `min-width: auto`. Il s'élargit donc à la largeur de la liste `.jump` en `nowrap` (`css/style.css:706`). Correction : `.phero { grid-template-columns: minmax(0, 1fr); }` ou `.phero__inner { min-width: 0; }`. Effort : petit.
3. **Légendes de la galerie épinglée « Le TIKI en images » hors de l'écran** : accueil, 1280×720 (photo coupée de 34 px, légende invisible), 1366×768 (légende coupée de 19 px), 1440×900 (16 px) et 1728×1000. Voir `captures/epingle-accueil-1-1280x720-8.jpg`, `captures/epingle-accueil-1-1366x768-8.jpg` et `captures/epingle-accueil-1-1440x900-8.jpg`. Cause : `css/style.css:437-439`. La hauteur vient d'une estimation (`min(54svh, calc(100svh - 330px), 640px)`), avec en plus des décalages de `5svh` en haut et en bas, alors que la piste `.track` (`flex: 1; min-height: 0`) a moins de place. Correction : `.track { align-items: stretch; }`, `.shot { grid-template-rows: minmax(0, 1fr) auto; }`, `.shot__img { height: auto; min-height: 0; aspect-ratio: conserver; }` et décalages de 2 à 3svh au plus, pour que l'image plus sa légende tiennent toujours dans la piste. Effort : petit.

### Importants

1. **Titre lisible après environ 3,5 s** : accueil, p1440 et m390. À 3 s, la plongée dans le « I » est encore en cours, à 4 s le titre est en place, `captures/bande-ouverture-p1440.jpg`, `captures/bande-ouverture-m390.jpg`. L'intro ne se joue qu'une fois par session, mais il n'y a pas de bouton pour la passer. Cause : `js/home.js:96-124`. Le zoom commence à 1,95 s, `reveal` arrive à 2,75 s, puis les mots montent pendant 1,2 s. Correction : raccourcir la phase lever du jour (ligne et horloge, de 1,25 à 0,8 s) et le zoom (de 1,05 à 0,8 s), faire monter les mots en 0,8 s, et ajouter un clic ou une touche pour passer l'intro. Effort : petit.
2. **Parcours épinglé coupé sur petit portable** : accueil, 1000×560 (titre de l'étape coupé de 11 px) et 1024×640 (texte coupé de 28 px). Cause : `css/style.css:320` (`.parcours__pin` en `min-height: 100svh` avec `padding-block: 110px 80px` fixes). Correction : `height: 100svh` en colonne et palier `@media (max-height: 700px)` qui réduit les marges, la carte et `.step__media`. Effort : petit.
3. **Textes de moins de 12 px et cibles de moins de 44 px sur téléphone** : toutes les pages. Surtitres des cartes à 11,84 px, légendes de la carte à 11 px, crédit photo et mois des feux à 10,88 px, `dt` de la carte d'embarquement à 10,56 px. Cibles : « EN » 44×38, « Privatisation dès 300 € » 23 px de haut, « Copier » 30 px, liens « Appeler », « Site du Groupement » et liens du pied de page de 19 à 28 px, case barbecue 22×22. Cause : `css/style.css:309` (`.card__k`), `:405` (`.credit`), `:258` (`.hero__price`), `:180` (`.link`), `.copy`, `.check`. Correction : `font-size: max(12px, …)` sur ces classes, puis `min-height: 44px` et `display: inline-flex; align-items: center` sur les liens isolés, les boutons et les cases. Effort : petit.
4. **Page 404 par défaut de Vercel** : toute adresse inconnue affiche « NOT_FOUND » en anglais, `captures/404-p1440-zz.jpg`. Cause : aucun `404.html` à la racine. Correction : `404.html` au ciel de nuit du site, avec le mot TIKI et un retour à l'accueil. Effort : petit.

### Finition

1. **Aucun `?v=` sur le CSS et le JS du site** : `css/style.css` et `js/*.js` dans les 4 pages. Correction : `?v=20261028` identique partout. Effort : petit.
2. **Barre fixe du bas toujours visible sur le formulaire et le pied de page** : contact et formules, m390, `captures/planche-contact-m390.jpg` (images 03 et 07). Cause : `css/style.css:161` et `:675`, sans masquage. Correction : masquer `.actionbar` par IntersectionObserver quand le formulaire ou le pied de page sont à l'écran. Effort : petit.
3. **Accueil lourd sur ordinateur** : 6,9 Mo en p1440 et 9,6 Mo en g1920, à cause de la vidéo du héros (3,3 Mo) et de la vidéo du hublot (1,7 Mo). Correction : vidéo du héros réencodée à environ 1,5 Mo (1280 px, CRF plus élevé) et vidéo du hublot chargée seulement à l'approche (`preload="none"` et IntersectionObserver). Effort : petit.
4. **Horloge « carnet de bord » posée sur les photos de la galerie** : accueil, portable, `captures/epingle-accueil-1-1440x900-8.jpg`. Cause : `.clock` fixe en bas à gauche (`css/style.css:111`). Correction : ajouter `is-away` à l'horloge pendant l'épinglage de la galerie, comme pour le pied de page. Effort : petit.
5. **Contact sur téléphone : le premier écran ne montre que le portrait**, et le titre « Ici Mathieu » est caché sous la barre du bas, `captures/contact-m390-00.jpg`. Correction : sous 640 px, portrait plus bas (`aspect-ratio: 4/3`) ou titre placé avant le portrait. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 3,5 s / 3,5 s environ (pas lisible à 3 s, en place à 4 s sur les bandes ; intro une fois par session) |
| Fluidité p1440 / m390 | 59,4 i/s / 59,8 i/s (très bien, 1 image de plus de 50 ms et 0 de plus de 100 ms) |
| CLS au chargement (max) | 0,0011 (formules p1280) |
| Poids de l'accueil, p1440 / m390 | 6,89 Mo / 3,53 Mo (g1920 : 9,61 Mo) |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS ; sans WebGL : rien de cassé (le site n'utilise pas WebGL), même débordement mobile ; réduire les animations : intro sautée, contenu visible |
| Débordement horizontal | Accueil m320, m360, m390, m430 (soleil fixe) ; héros de « Formules » coupé de m360 à m430 ; aucun sur portable |
| Sections épinglées | Galerie : légendes hors écran en 1280×720, 1366×768, 1440×900, 1728×1000 (bloquant) ; parcours : coupé en 1000×560 et 1024×640 (important) |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex, nofollow sur les 4 pages · X-Robots-Tag noindex, nofollow · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · aucun ?v= · 404 Vercel par défaut |

## Vérifications écartées

- `tiki-drone.webm net::ERR_ABORTED` : requête de la vidéo du hublot interrompue par le navigateur (préchargement des métadonnées) ; le fichier répond en 200.
- Citation du capitaine coupée à droite (« comme on », « co »), `captures/accueil-m390-13.jpg` et `accueil-m320-13.jpg` : animation d'écriture ligne à ligne (`clip-path`, `js/core.js:331-336`) captée en cours ; le texte complet apparaît ensuite.
- « 1959 » et « 1960 » au lieu de 1958 sur `captures/accueil-m390-10.jpg` et `accueil-m320-10.jpg` : compteur qui descend de 2026 à 1958 (`data-from="2026"`), capté en cours.
- Éléments « masqués » au pied de page par l'en-tête (Instagram, « Nous trouver », « Copier », « Ouvrir l'itinéraire ») : contenu qui défile sous l'en-tête fixe pendant le défilement, et non un contenu bloqué.
- Prix « 1 486 € » lu pendant le test du composeur : prix animé capté en cours ; la valeur finale est 1 500 € (6 h, basse saison), conforme au site actuel.
- Erreur 404 en console sur la page introuvable : c'est le statut de la page elle-même.
- Vidéo du héros générée par IA : examinée image par image (9 s). Bateau, pavillon, falaises et reflets sont cohérents, sans texte ni personne, et la vidéo est étiquetée « Vidéo d'illustration générée par IA ».


---

## tiki-cassis-maquette : corrections de l'étape 2

Commits 645f316 puis fe7ead0 (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Débordement de l'accueil sur téléphone | Bloquant | `.sky` en `overflow: hidden; contain: paint` (soleil fixe). Le bisect a montré une 2e cause : le hublot grossi et tourné (`.tiki { overflow-x: clip }`) | css/style.css | m320 359 / m360 407 / m390 442 / m430 488 px → 320 / 360 / 390 / 430 (`preuve-*-accueil-m390-debord.jpg`) |
| Héros de « Formules » coupé sur téléphone | Bloquant | `.phero { grid-template-columns: minmax(0, 1fr) }` et `.phero__inner { min-width: 0 }` | css/style.css | Titre et paragraphe coupés jusqu'à 655 px → largeur de l'écran (`preuve-*-formules-m390-hero.jpg`) |
| Légendes de la galerie épinglée hors écran | Bloquant | Méthode « Tout tenir dans l'écran » : section de `100svh` en colonne, `padding-top: var(--entete-h)` mesuré en JS (ResizeObserver), piste `flex: 1; min-height: 0`, hauteur des photos `--shot-h` = place réelle de la piste moins légende, écart et décalage (mesurée, plus d'estimation `100svh - 330px`), décalages réduits de 5 à 2,5svh, palier `max-height: 700px`, `anticipatePin` retiré | css/style.css, js/core.js | Pinnée (50 %) : aucune coupe aux 8 tailles ; photo + légende visibles en 1280×720, 1366×768, 1440×900, 1728×1000 (`preuve-*-galerie-*.jpg`) |
| Parcours épinglé coupé sur petit portable | Important | Même méthode : `height: 100svh` en colonne sous `--entete-h`, grille `auto minmax(0, 1fr)` plafonnée à 760 px, carte limitée par `--carte-h` mesuré (ResizeObserver), photo de l'étape en `flex: 1 1 0; min-height: 0`, palier `max-height: 700px`, `anticipatePin` retiré ; Mode calme inchangé | css/style.css, js/home.js | 1000×560 titre coupé de 11 px et 1024×640 texte coupé de 28 px → rien de coupé à 50 et 92 % (`preuve-*-parcours-1000x560.jpg`) |
| Titre lisible après 3,5 s, sans moyen de passer | Important | Lever du jour 1,25 → 0,8 s, zoom 1,05 → 0,8 s, mots 1,2 → 0,8 s ; clic, touche ou molette passent l'intro (`tl.progress(1)`) | js/home.js | Titre en place vers 2,7 s après le chargement des polices ; passée : page prête en 0,6 s |
| Textes < 12 px sur téléphone | Important | Plancher `max(12px, …)` sur toutes les tailles < .75rem (`.card__k`, `.credit`, `.chrono__count`, `.chart__note`, `.ticket__k`, `dt`, `.badge`, `.contact-card__k`, `.foot h3`, `.result__prog h3`…), `.todo` en `max(12px, .78em)`, textes SVG de la carte à 12 | css/style.css | 15 / 5 / 10 / 2 éléments par page → 0 partout |
| Cibles < 44 px sur téléphone | Important | `.link`, `.hero__price`, `.hero__scroll`, `.jump a` en `inline-flex` 44 px (soulignés conservés) ; `.tool`, `.copy`, liens du pied, boutons des cartes et du formulaire, curseur à 44 px sous 900 px ; case à cocher redessinée (`appearance: none`, zone 44×44, carré visuel de 22 px) | css/style.css | 8 / 7 / 9 / 2 cibles par page → 0 (case barbecue 22×22 → 44×44) |
| Barre fixe du bas qui recouvre du contenu | Règle utilisateur | Barre visible seulement après le premier écran (seuil de 90 % de la hauteur d'écran), masquée par IntersectionObserver sur `main form` et `.foot`, et quand le menu est ouvert (`.menu.is-open ~ .actionbar`) ; `--barres-h` mesuré, pied en `padding-bottom` calculé dessus (fe7ead0) | css/style.css, js/core.js | Éléments couverts par la barre (outil, toutes pages, m320–t820) : 15 → 0 ; script m320–m430 × 5 pages : cachée à l'ouverture, au pied, au formulaire et menu ouvert (`preuve-apres-barre-masquee-formulaire-m390.jpg`) |
| Page 404 Vercel par défaut | Important | `404.html` au ciel de nuit, en-tête, menu et pied du site, chemins absolus, titre « Page introuvable », retour à l'accueil, version anglaise | 404.html, js/i18n.js, css/style.css | « NOT_FOUND » (débord 980 px) → page du site, 404, aucun débord (`preuve-*-404-m390.jpg`) |
| Versions | — | `v=20261028` → `v=20261028-2` partout (HTML, CSS, imports de modules) | 6 HTML, 9 JS | `grep "v=20261028[^-]"` : vide |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Accueil lourd sur ordinateur (vidéo du héros 3,3 Mo, hublot 1,7 Mo) | Finition | Finition (réencodage vidéo) |
| Horloge posée sur les photos de la galerie | Finition | Finition |
| Contact sur téléphone : le premier écran ne montre que le portrait | Finition | Finition |

Note sur l'épinglage : l'outil signale encore des coupes à 8 % de la galerie (9 à 36 px) et du parcours en 1000×560 (11 px). Remesure (`outils/tiki-pin-stable.mjs`, résultat dans `epingles-stabilisees.txt`) : même molette que l'outil, puis 1,3 s d'attente → haut de section encore à 24–141 px (Lenis, `wheelMultiplier: 0.95`, n'est pas arrivé) ; puis position exacte et 1,5 s sans mouvement → `scrollY` = cible, haut de section à 0 et **aucune coupe sur 48 mesures** (8 tailles + 2560, 2 sections, 8/50/92 %). Aucune correction supplémentaire nécessaire (`preuve-apres-galerie-1366x768-8-stabilise.jpg`).

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement accueil m320 / m360 / m390 / m430 | 359 / 407 / 442 / 488 px | aucun |
| Débordement Formules (héros) m360–m430 | coupé jusqu'à 655 px | aucun |
| Débordement 404 téléphone | 980 px (page Vercel) | aucun |
| Textes < 12 px (accueil / contact / formules / mentions) | 15 / 5 / 10 / 2 | 0 / 0 / 0 / 0 |
| Cibles < 44 px (accueil / contact / formules / mentions) | 8 / 7 / 9 / 2 | 0 (remesure fe7ead0 : 0 sur toutes les pages) |
| Éléments couverts par la barre du bas | 15 (CTA du héros m320, « Privatisation dès 300 € » m360/t820, titre de Contact, surtitres de Formules, Mentions) | 0 |
| Autres éléments couverts | Horloge et en-tête fixes pendant le défilement au pied | Identique (contenu qui défile sous l'en-tête, non bloqué) |
| Épinglage galerie à 50 % (8 tailles) | sans coupe à 50 %, coupes à l'entrée en 1280, 1366, 1440, 1728 | sans coupe ; entrée : coupes réduites (34 → 17, 25 → 9 px), artefact de mesure |
| Épinglage parcours | coupé en 1000×560 (50 et 92 %) et 1024×640 (92 %) | aucune coupe à 50 et 92 % |
| Erreurs console | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 76/100 → nouvelle note 87/100 · bloquants restants : 0
- Animations 11 → 13 : intro plus courte et passable, galerie épinglée qui tient dans l'écran.
- Tous les formats 7 → 13 : plus de débordement sur téléphone, héros de Formules complet, épinglages tenus aux 8 tailles, textes et cibles aux seuils.
- Mise en ligne 3 → 5 : ?v= identique partout et page 404 aux couleurs du site.
- Accessibilité 4 → 5 : textes ≥ 12 px et cibles ≥ 44 px sur téléphone.
