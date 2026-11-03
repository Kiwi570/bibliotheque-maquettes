# francis-gerardin-maquette

<https://francis-gerardin-maquette.vercel.app> · audit du 28/10/2026 · dernier commit e9ae802 du 27/10/2026

## Verdict

**76/100 · À peaufiner · 1 défaut bloquant**

Maquette originale et très juste : un « carnet de route » de journaliste (conducteur chronométré, ratures, tampons, fil d'encre), fluide à 60 i/s, riche en petits jeux, et des contenus honnêtement marqués « à compléter ». Il reste une légende cachée hors de l'écran dans la galerie épinglée de /animateur sur 1280×720 et 1366×768, un CLS élevé sur /formateur, des blocs collés au bord gauche sur téléphone et une ouverture qui montre le h1 vers 3,5 s.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Concept éditorial fort et cohérent avec le métier (conducteur à timecode, « Pour vous ~~animer former coacher~~ accompagner »), mais le h1 arrive après l'intro, vers 3,5 s. |
| 2. Direction artistique et harmonie | 12/15 | Papier, encre bleue et rouge, trois polices bien tenues, rythme régulier ; les photos réelles restent hétérogènes (photo teintée violet, visages floutés, flou de bougé) à côté des croquis provisoires. |
| 3. Animations et effets | 11/15 | Fiches empilées, galerie et frise horizontales, ScrambleText, DrawSVG, 60 i/s sans saccade ; le titre principal arrive après 3 s et le brouillage des mots du hero de /formateur fait sauter la mise en page. |
| 4. Expérience ludique et interactions | 9/10 | Formulaires en étapes avec validation, caucus à chrono, simulateur de calendrier, prise de rendez-vous, copie des coordonnées, menu et Mode calme : tout fonctionne. |
| 5. Tous les formats | 9/15 | Aucun débordement horizontal, mais une légende hors écran à 1280×720 et 1366×768 (bloquant), trois sections collées au bord gauche sur téléphone, des textes à 11,2 px et des cibles de 21 à 39 px. |
| 6. Contenu et fiabilité | 9/10 | Aucun avis ni logo inventé, 23 marques « à compléter » ou « à confirmer » bien visibles, dates passées classées comme passées, mentions légales en modèle à compléter. |
| 7. Technique et performance | 7/10 | Aucune erreur JS, pages de 0,4 à 0,7 Mo, version sans WebGL complète ; CLS de chargement de 0,14 à 0,86 sur /formateur et 0,109 sur /animateur en p1440. |
| 8. Mise en ligne | 4/5 | Public, noindex dans chaque page, og:image JPG 1200×630 absolue, ?v= identique partout, 404 sur mesure ; en-tête X-Robots-Tag absent. |
| 9. Accessibilité | 3/5 | Mode calme et réduction des animations complets, régions défilantes focusables, libellés ARIA ; textes sous 12 px et cibles tactiles sous 44 px sur téléphone. |
| **Total** | **76/100** | |

## Points forts

- Idée signature liée au client : le « conducteur » d'émission avec timecode, coches et « Passer », puis les ratures « animer / former / coacher » remplacées à la main par « accompagner ».
- Mouvement abouti et mesuré : fiches empilées sur l'accueil et /formateur, galerie horizontale /animateur, frise 1987 → aujourd'hui avec compteur d'années, 59,7 i/s en p1440 et 60 i/s en m390, sans image lente.
- Interactions réellement utiles : formulaires en étapes (événement, atelier) avec message d'erreur clair, caucus de 20 secondes, calendrier de coaching qui recalcule la durée, créneaux de rendez-vous « fictifs pour la démonstration ».
- Honnêteté du contenu : crédits photo, légendes, tarifs, SIRET et zone d'intervention marqués « à compléter » ; date d'un café littéraire « lue sur l'affiche de la photo, à confirmer ».
- Pages très légères (0,4 à 0,7 Mo), images en WebP à plusieurs tailles, aucune erreur de console, filet sans WebGL et Mode calme complets.

## Défauts

### Bloquants

1. **Légende hors de l'écran dans la galerie épinglée « Au micro »** : /animateur, 1280×720 et 1366×768 (aussi 1024×640), `captures/agent/animateur-hscroll-1280x720.jpg`, `captures/epingle-animateur-1-1366x768-8.jpg`. La photo verticale (4:5) descend jusqu'à 711 px sur 720 et 750 px sur 768 : sa légende « Même café littéraire · L'échange avec une invitée » finit à 747 px et 787 px, donc jamais visible pendant l'épinglage. Cause : `assets/css/main.css:508` (`.h-item.tall .frame { aspect-ratio: 4 / 5 }` sur une largeur en vw, sans plafond de hauteur) et `main.css:502` / `main.css:736` (section en 100vh). Correction : section en colonne flex de 100svh, hauteur des cadres calculée sur la place restante, par exemple `.hscroll.is-pinned .h-item .frame { height: calc(100svh - var(--entete-h) - var(--hhead-h) - 70px); aspect-ratio: auto; width: auto }` avec `--entete-h` et `--hhead-h` mesurés en JS, ou plafonner la largeur des `.h-item.tall` à `min(34vw, (100svh - 260px) * .8)`. Effort : petit.

### Importants

1. **CLS de chargement élevé sur /formateur** : 0,25 (remesuré seul, p1440 et m390) et jusqu'à 0,63 / 0,86 dans les mesures (p1440, m360, m390, p1280, p1366, g1920). Les six mots du hero (« imagination, écoute… ») sont brouillés lettre à lettre par ScrambleText : leur largeur change à chaque image, la ligne se recompose et pousse les boutons et le portrait. Cause : `assets/js/main.js:361-363` (scrambleText sur `[data-scramble]`) et `assets/css/main.css:593-594` (`.words` en flex-wrap). Correction : figer la largeur de chaque mot avant l'animation (`el.style.width = el.offsetWidth + 'px'` ou `display: inline-grid` avec un double invisible du mot), ou remplacer le brouillage par un fondu ou un masque. Effort : petit.
2. **Texte collé au bord gauche sur téléphone et tablette** : /contact « Coordonnées », /formateur « Le caucus », /coach « Une formation sérieuse », de 360 à 820 px, `captures/contact-m390-01.jpg`, `captures/formateur-m390-07.jpg`, `captures/agent/coach-diplome-m390.jpg`. Le texte part de x = 0, le tampon « Coach professionnel » et l'anneau du chrono touchent le bord. Cause : `assets/css/main.css:792` (`.ct-grid`), `main.css:640` (`.cc-grid`), `main.css:701` (`.diplome-grid`) : `padding-left: 0` sous 899 px écrase la gouttière de `.wrap` portée par le même élément. Correction : remplacer ces `padding-left: 0` par `padding-left: max(var(--gut), env(safe-area-inset-left, 0px))`. Effort : petit.
3. **Titre principal lisible vers 3,5 s** : accueil, p1440 et m390, `captures/bande-ouverture-p1440.jpg`, `captures/bande-ouverture-m390.jpg`. Le conducteur est lisible dès 1 s, mais « Francis Gérardin » n'apparaît qu'entre 3 et 4 s (fin d'intro à 2,85 s puis entrée du hero). Cause : `assets/js/main.js:232-242` (feuille qui sort à 2,05 s, fondu jusqu'à 2,85 s, puis `heroStart`). Correction : sortir la feuille vers 1,6 s et lancer l'entrée du hero en chevauchement (`heroStart.play()` à 1,8 s, pas dans `onComplete`), pour un h1 lisible avant 2,5 s. Effort : petit.
4. **Textes sous 12 px sur téléphone** : toutes les pages, m320 à m430 : « Animer · former · accompagner » de l'en-tête (11,2 px), surtitres (11,84 px), légendes et marques « crédit photo à compléter » (11,52 px), « Vérifier une date » (11,52 px). Cause : `assets/css/main.css:141` (`.hd-role { font-size: .7rem }`), `main.css:199` (`.caption { font-size: .72rem }`), `main.css:330` (`.d-what`). Correction : plancher `font-size: max(12px, …)` sur les textes en police mono. Effort : petit.
5. **Cibles tactiles sous 44 px** : téléphone, toutes pages : numéro du hero 110×21 (`#hero-tel`, `#date-tel`, `#rdv-tel-n`), liens « Voir l'animation → » 36 px, e-mail du pied 39 px, coordonnées de /contact 27 à 30 px, téléphone des mentions légales 18 px, curseur `#cal-seances` 37 px. Cause : `assets/css/main.css:187` (`.ink-link`) et `main.css:315` (`.hero-phone`). Correction : `min-height: 44px; display: inline-flex; align-items: center` sur ces liens et le curseur. Effort : petit.
6. **Méthode épinglée coupée à 1000×560** : /animateur, `captures/epingle-animateur-0-1000x560-8.jpg` : un titre h3 sort de 13 px pendant tout l'épinglage. Cause : `assets/js/main.js:433-438` (épinglage dès 900 px de large sans condition de hauteur). Correction : palier `@media (max-height: 600px)` qui réduit titres et marges, ou pas d'épinglage sous 620 px de haut. Effort : petit.

### Finition

1. **Fiches empilées qui dépassent en bas sur grand écran** : accueil et /formateur, 1920×1080 et 1728×1000, `captures/epingle-accueil-0-1920x1080-8.jpg` : la fiche C attend à `yPercent: 115` et son titre dépasse déjà en bas de l'écran, coupé. Cause : `assets/js/main.js:405`. Correction : position d'attente en px (`y: () => innerHeight`) plutôt qu'en pourcentage de la carte. Effort : petit.
2. **Onglets de fiche sur deux lignes** : « Fiche B · Former / 2 h 30 à 1 journée », « Atelier 2 / Confiance et expression » se coupent en deux lignes et chevauchent le filet rouge (accueil et /formateur, toutes tailles ordinateur). Cause : `assets/css/main.css:376` (`.sc-tab` en hauteur fixe 36 px). Correction : raccourcir les libellés ou `white-space: nowrap` sur chaque moitié. Effort : petit.
3. **Petit CLS sur /animateur en p1440** (0,109 à 284 ms : texte, visuel et photo du hero). Cause : hauteur du bloc `.ani-visual` non réservée avant le chargement de la photo (`assets/css/main.css:470`). Correction : `aspect-ratio` ou `min-height` sur `.ph-visual.ani-visual`. Effort : petit.
4. **Pas de barre fixe en bas sur téléphone** (action principale et appel), alors que le site vise la prise de contact. Correction : barre « Vérifier une date / Appeler » masquée sur les formulaires et le pied de page. Effort : moyen.
5. **Photos réelles hétérogènes** : photo teintée violet (/animateur, /parcours), visages floutés sur les photos d'ateliers (accueil, /formateur), flou de bougé sur la photo du hero. À valider avec Francis Gérardin ou remplacer par des photos plus nettes et un étalonnage commun. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 3,5 s / ≈ 3,5 s (intro « conducteur » lisible dès 1 s, h1 entre 3 et 4 s sur les bandes ; 0,2 à 0,6 s sur les autres pages) |
| Fluidité p1440 / m390 | 59,7 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,86 (/formateur m360) ; 0,25 remesuré seul ; accueil ≤ 0,097 |
| Poids de l'accueil, p1440 / m390 | 0,56 Mo / 0,55 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune (seul le 404 attendu de la page introuvable) ; sans WebGL complet ; réduit complet |
| Débordement horizontal | aucun |
| Sections épinglées | accueil et /formateur : fiches correctes ; /animateur galerie : légende hors écran à 1280×720 et 1366×768 ; /animateur méthode : h3 coupé à 1000×560 ; /parcours frise et image collante : OK |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex, nofollow sur 7 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v=20261027 partout · 404 sur mesure |

## Vérifications écartées

- « MASQUÉ par header.hd.is-scrolled » (numéro du pied, champs de formulaire, créneaux, textes des mentions) : relevés en fin de défilement, ce sont des éléments qui passent sous l'en-tête fixe pendant le défilement, pas des éléments bloqués dessous.
- Fiches empilées « img / p sort de l'écran » à 1280×720, 1366×768 et 1440×900 : ce sont les fiches suivantes en attente sous l'écran ; remesure à 1280×720 : chaque fiche active tient entre 125 et 711 px, lien « Voir … » visible (`captures/agent/stack-accueil-1280-1.5.jpg`).
- /parcours, image collante « sous l'en-tête 18 à 25 px » : image de fond qui glisse sous l'en-tête, pas un texte.
- h1 à 2,6–3,6 s dans les mesures par format : ces valeurs incluent l'intro jouée une fois par session ; jugé sur les bandes d'ouverture prises seules.
- Erreur console « 404 » sur /zz-page-introuvable-audit : c'est le statut attendu de la page 404.
- Mesures « h1 » par page des autres pages (0,2 à 0,6 s) : aucune remesure nécessaire.
- Images Grok : aucune dans le dépôt (pas de dossier `assets/img/grok/`), les visuels d'ambiance sont des croquis dessinés en code et marqués « Croquis provisoire » ; toutes les photos sont des photos réelles du client.
- Interactions vérifiées sans défaut : menu mobile (ouvre, se ferme avec Échap), Mode calme (classe `is-calm is-still`, visible à 44×44 sur téléphone), caucus (chrono qui démarre), formulaire en étapes (erreur « Choisissez une option… » puis passage à l'étape suivante), simulateur de calendrier (10 → 12 séances recalcule « 11 semaines »), rendez-vous (jour, créneau, résumé), formulaire de contact (validation puis « Message reçu, démonstration »).


---

## francis-gerardin-maquette : corrections de l'étape 2

Commit 4a233b4 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Légende hors écran dans la galerie épinglée « Au micro » (/animateur, 1024×640 à 1366×768) | Bloquant | Section épinglée en colonne flex de 100svh, `padding-top` = `--entete-h` mesuré en JS (ResizeObserver), piste en `flex: 1; min-height: 0`; chaque photo réduite en largeur (`--fit-w`, ratio conservé) quand photo + légende dépassent la place mesurée, recalculé à chaque `refreshInit`; plus d'`anticipatePin` | main.css, main.js | légende de la photo verticale : 787 px sur 768 → 746 px; épinglage hscroll 1000×560, 1024×640, 1366×768 : 2/2/2 défauts → 0 (`preuve-galerie-*.jpg`) |
| CLS de chargement élevé sur /formateur | Important | Mots brouillés : double invisible qui fixe la largeur, le texte brouillé est en position absolue au-dessus | main.css, main.js | CLS initial m360 0,61 → 0, m390 0,25 → 0, p1280 0,31 → 0,0003, p1440 0,50 → 0,02, p1366 0,17 → 0,07 |
| Texte collé au bord gauche (contact « Coordonnées », formateur « Le caucus », coach « Une formation sérieuse ») | Important | `padding-left: max(var(--gut), env(safe-area-inset-left))` au lieu de 0 sous 899 px | main.css | x = 0 → 16 px à 390 px (`preuve-*-gouttiere-390.jpg`) |
| Titre principal lisible vers 3,5 s | Important | La feuille sort à 1,5 s, le héros démarre à 1,6 s sans attendre la fin de l'intro (timecode en 1,6 s) | main.js | h1 visible (accueil, mesures) : 2,4–2,5 s → 1,8–1,9 s; lisible à 2 s (`preuve-ouverture-h1-2s.jpg`); le saut au clic marche encore |
| Textes sous 12 px sur téléphone | Important | `--fs-label: max(12px, .74rem)` et plancher `max(12px, …)` sur toutes les tailles en mono de .62 à .74rem (44 règles), deux légendes en ligne (coach, contact), timbre SVG à 12 px; rôle de l'en-tête resserré sous 480 px pour tenir sur une ligne | main.css, coach.html, contact.html | 110 → 0 par format téléphone, 112 → 0 en t820 |
| Cibles tactiles sous 44 px | Important | `min-height: 44px` (inline-flex) sur liens « Voir… », téléphone du héros, liens du pied, coordonnées, mentions; min-width 44 px sur Mode calme et liens du pied; curseur à 44 px; soulignement d'encre recentré | main.css | 34 → 0 par format téléphone et t820 |
| Méthode épinglée coupée à 1000×560 | Important | En épinglé : padding de bande remplacé par `--entete-h` + 12 px; palier `max-height: 600px` (titre, marges); marge du titre sortie du style en ligne | main.css, animateur.html | h3 coupé de 13 px → contenu entre 80 et 550 px (3 → 0) (`preuve-methode-1000x560.jpg`) |
| Fiches /formateur coupées en bas à 1280×720 (mesure épinglage) | Important (petit-portable) | Section épinglée de 100svh sous l'en-tête mesuré, rangée en `minmax(0, 1fr)`, fiches en `min(100%, 680px)`; palier `max-height: 820px` pour la colonne d'intro | main.css | 1280×720 : 4 → 1 (le reste est la fiche suivante qui arrive) (`preuve-fiches-formateur-1280x720.jpg`) |
| Barre fixe du bas absente (finition au rapport, clé récurrente « barre-bas ») | Finition | Barre « Appeler / Me contacter » (numéro et page contact déjà sur le site), téléphone et tablette, visible seulement une fois le héros passé; masquée sur formulaires, pied de page et menu ouvert; absente sur /contact et sur la 404; `--barres-h` mesuré, pied qui garde cette place | main.css, main.js | aucun élément couvert par la barre de m320 à m430; menu ouvert → barre masquée; formulaire → masquée (`preuve-barre-bas-390.jpg`, `preuve-formulaire-sans-barre-390.jpg`) |
| X-Robots-Tag absent | Important | Déjà corrigé à l'étape 1 (`vercel.json` : `X-Robots-Tag: noindex, nofollow`) | — | vérifié dans vercel.json |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Fiches empilées qui dépassent en bas sur grand écran (fiche suivante en attente à `yPercent: 115`) | Finition | finition |
| Onglets de fiche sur deux lignes (plus visibles avec le plancher de 12 px) | Finition | finition |
| CLS 0,109 sur /animateur en p1440 (`.ani-visual`) | Finition | finition |
| Photos réelles hétérogènes (teinte violette, visages floutés, flou de bougé) | Finition | donnée manquante (photos du client) |
| Enveloppe de /contact : adresse cachée par le rabat sur téléphone (vu pendant la vérification, pas au rapport) | Finition | finition |
| /parcours : image collante qui passe sous l'en-tête (écarté au rapport) | — | image de fond, pas un défaut |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px (relevés par format téléphone / t820) | 110 / 112 | 0 / 0 |
| Cibles < 44 px (par format téléphone / t820) | 34 / 34 | 0 / 0 |
| Éléments couverts par une barre du bas | aucune barre | 0 (m320 à m430) |
| Couverts par l'en-tête fixe (éléments qui passent dessous en fin de défilement, écartés au rapport) | 0 à 8 | 0 à 8 |
| Épinglage /animateur galerie (1000×560, 1024×640, 1366×768) | 2 / 2 / 2 | 0 / 0 / 0 |
| Épinglage /animateur méthode 1000×560 | 3 | 0 |
| Épinglage /formateur fiches 1280×720 / 1366×768 / 1440×900 / 1728×1000 / 1920×1080 | 4 / 1 / 1 / 4 / 5 | 1 / 1 / 1 / 5 / 5 (fiche suivante en attente, finition) |
| Épinglage accueil fiches | 2 / 2 / 1 / 4 / 4 | identique (fiches en attente, écarté au rapport) |
| CLS initial /formateur (m360 / m390 / p1440) | 0,61 / 0,25 / 0,50 | 0 / 0 / 0,02 |
| h1 visible accueil (mesures, intro comprise) | 2,4–2,5 s | 1,8–1,9 s |
| Erreurs console | seul le 404 attendu | seul le 404 attendu, aucune erreur JS |
| Modules chargés deux fois | 0 | 0 (toutes les références en ?v=20261028-2) |

## Note proposée
Ancienne note 76/100 → nouvelle note 87/100 · bloquants restants : 0
- c1 12 → 13 : le h1 arrivait vers 3,5 s, il est lisible vers 2 s.
- c3 11 → 13 : ouverture raccourcie, et les mots brouillés ne font plus sauter le héros de /formateur.
- c5 9 → 13 : légende de galerie dans l'écran, gouttières rendues, textes ≥ 12 px, cibles ≥ 44 px.
- c7 7 → 8 : CLS de /formateur corrigé (reste 0,109 sur /animateur p1440).
- c8 4 → 5 : X-Robots-Tag présent (corrigé à l'étape 1).
- c9 3 → 5 : textes sous 12 px et cibles sous 44 px corrigés.
