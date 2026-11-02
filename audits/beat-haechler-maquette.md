# beat-haechler-maquette

<https://beat-haechler-maquette.vercel.app> · audit du 27 octobre 2026 · dernier commit c968011 du 27 octobre 2026

## Verdict

**80/100 · À peaufiner · 1 défaut bloquant**

C'est une maquette juste et soignée. Le lac, la goutte et les ondes lui donnent une vraie identité, l'ouverture est fluide et toutes les interactions fonctionnent. Un seul point bloque l'envoi : sur les téléphones de 361 à 390 px de large, le bouton Menu coupe le sous-titre de l'en-tête.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | L'ouverture est poétique (une goutte, des ondes WebGL sur le lac, puis le titre ligne par ligne) et colle au métier, mais le reste du parcours reste sage. |
| 2. Direction artistique et harmonie | 12/15 | Fraunces, Manrope, bleu lac, corail et vagues forment un ensemble cohérent sur les 10 pages ; les photos réelles du cabinet, floues, tranchent avec la netteté des images Grok. |
| 3. Animations et effets | 12/15 | Titre lisible à 2 s, 60 images/s sans saccade, révélations, curseur et boutons magnétiques ; mais une transition CSS se bat avec GSAP sur l'en-tête, les polices ne sont pas attendues et la galerie horizontale ne s'active jamais. |
| 4. Expérience ludique et interactions | 9/10 | Silhouette conseil, point gâchette à maintenir, respiration, rendez-vous en 3 étapes sur les vrais jeudis, bon cadeau avec le prénom sur la carte : tout marche et se comprend sans mode d'emploi. |
| 5. Tous les formats | 9/15 | Aucun débordement, mais le sous-titre est coupé par le bouton Menu de 361 à 390 px, de nombreuses cibles font moins de 44 px et l'image collante d'« À propos » sort de l'écran jusqu'à 1280×720. |
| 6. Contenu et fiabilité | 9/10 | Prix, horaires, lieux, cours et témoignages sont conformes à beathaechler.ch et les éléments « à valider par Beat » sont bien marqués ; restent le point médian et la mention Hi-TENS / Hi-EMS, absente du site actuel. |
| 7. Technique et performance | 8/10 | Aucune erreur JavaScript ni ressource en 404, pages de 0,3 à 0,9 Mo ; mais CLS de 0,136 au chargement de /rendez-vous avec « réduire les animations », et une erreur console sans WebGL. |
| 8. Mise en ligne | 5/5 | Site public, noindex sur chaque page et en-tête X-Robots-Tag, og:image en JPG 1200×630 avec une adresse complète, pas de Cache-Control, ?v= identique partout, 404 personnalisée. |
| 9. Accessibilité | 4/5 | Focus visible, menu qui se ferme avec Échap, « réduire les animations » respecté, mode calme persistant ; mais les étiquettes « à valider » ont un contraste de 3,6:1 et les cibles tactiles sont petites. |
| **Total** | **80/100** | |

## Points forts

- **Une identité forte et cohérente.** « Prenez un moment pour vous » s'affiche sur un lac à l'aube, avec des ondes WebGL. Sans WebGL, le repli image est impeccable (`captures/inter-sanswebgl-p1440.jpg`).
- **Une ouverture orchestrée.** La goutte tombe, l'onde se forme, puis le titre arrive ; il est lisible à 2 s sur ordinateur comme sur téléphone (`captures/planche-ouverture-etapes-p1440.jpg`, `captures/planche-ouverture-etapes-m390.jpg`).
- **Un guide « Où sont vos tensions ? » efficace.** Il propose le bon massage selon la zone choisie, en touchant une pastille ou directement la silhouette (`captures/inter-guide-p1440.jpg`).
- **Des formulaires simulés exemplaires.** Ils avancent par étapes, affichent des erreurs claires et se terminent par un récapitulatif « Démonstration · rien n'a été envoyé » (`captures/inter-rdv-m390.jpg`, `captures/inter-bon-cadeau-p1440.jpg`).
- **Un contenu fidèle au site actuel, et honnête.** Les points à confirmer sont signalés, y compris l'écart entre les deux numéros de téléphone du bon cadeau.
- **Un mode calme complet.** Avec « réduire les animations », aucun élément ne reste invisible, et le choix persiste après rechargement (`captures/inter-calme-p1440.jpg`).

## Défauts

### Bloquants

1. **Sous-titre de l'en-tête coupé par le bouton Menu**
   - **Où :** toutes les pages, sur téléphone de 361 à 390 px de large. « MASSAGES · NYON & GENÈVE » passe sous « Menu » : 16 px de recouvrement à 375 px, 1 px à 390 px.
   - **Captures :** `captures/entete-m375.jpg`, `captures/accueil-m390-00.jpg`.
   - **Cause :** `assets/css/style.css:219`, `.brand-sub` en `white-space: nowrap`, masqué seulement sous 360 px (`style.css:247`).
   - **Correction :** passer la règle à `@media (max-width: 400px) { .brand-sub { display: none; } }`, ou réduire le sous-titre à `.68rem` entre 361 et 400 px.
   - **Effort :** petit.

### Importants

1. **Cibles tactiles de moins de 44 px**
   - **Où :** toutes les pages, en m360, m390 et m430. Sont concernés :
     - les liens soulignés `.wlink` (33 px) ;
     - l'interrupteur « Animations calmes » (22 px) ;
     - les liens du pied de page (23 px) ;
     - le téléphone et l'e-mail (28 px) ;
     - les boutons « Copier » (40 px) ;
     - la pastille « Prochains massages » (38 px).
   - **Capture :** `captures/planche-accueil-m390.jpg`.
   - **Cause :** `style.css:125` (`.wlink`), `style.css:224` et `:516` (`.calm-toggle`, `padding: 0` dans le pied de page), `style.css:510-511` (`.contact-line`), `style.css:194` (`.chip`).
   - **Correction :** en mobile, `min-height: 44px; display: inline-flex; align-items: center` sur ces éléments, et des boutons « Copier » de 44 px.
   - **Effort :** petit.

2. **Colonne collante d'« À propos » plus haute que l'écran**
   - **Où :** /a-propos, section « Le toucher, une passion de toujours ». Pendant le défilement, le bas de l'image reste hors champ :
     - 114 px puis 33 px à 1280×720 ;
     - 226 px à 1024×640 ;
     - 302 px à 1000×560.
   - **Captures :** `captures/epingle-a-propos-0-1280x720-50.jpg`, `captures/epingle-a-propos-0-1000x560-50.jpg`.
   - **Cause :** `style.css:534`, `.sticky-col { position: sticky; top: calc(var(--header-h) + 30px) }` sans limite de hauteur.
   - **Correction :** donner à la colonne `max-height: calc(100svh - var(--header-h) - 60px)` en colonne flex, avec l'image en `flex: 1; min-height: 0; object-fit: cover`. À défaut, retirer le collant sous 800 px de hauteur d'écran.
   - **Effort :** petit.

3. **CLS de 0,136 au chargement de /rendez-vous avec « réduire les animations »**
   - **Où :** /rendez-vous en p1440. Le bloc « Aujourd'hui » est réécrit en JavaScript (« Prochains massages demain, à Genève. »), grandit de 30 px et remonte tout le héros. Mesuré 2 fois sur 2 en mode réduit ; 0,012 seulement en mode normal, où le bloc est encore masqué.
   - **Capture :** `captures/rendez-vous-p1440-reduit-00.jpg`.
   - **Cause :** `assets/js/ui.js`, `initToday()` (`[data-today-title]`), sur `.today-big` (`style.css:706`), dont la hauteur n'est pas réservée.
   - **Correction :** réserver la hauteur, par exemple `min-height` sur `.today-big .h3` pour deux lignes, ou placer le texte final par défaut dans le HTML.
   - **Effort :** petit.

4. **Ouverture lancée avant le chargement des polices**
   - **Où :** toutes les pages. SplitText découpe le titre en lignes masquées avant l'arrivée de Fraunces (`font-display: swap`, sans préchargement). Les lignes risquent d'être calculées avec la police de secours, puis de sauter.
   - **Capture :** `captures/planche-ouverture-etapes-p1440.jpg`.
   - **Cause :** `assets/js/main.js:76-80` (`SplitText.create` sans attendre `document.fonts`) et `style.css:6-8` (aucun `<link rel="preload">`).
   - **Correction :**
     - précharger `fraunces.woff2` et `manrope.woff2` ;
     - lancer `heroIntro()` après `document.fonts.ready`, avec un délai maximal de 800 ms ;
     - garder le titre masqué jusque-là.
   - **Effort :** petit.

5. **Transition CSS en conflit avec GSAP sur l'en-tête**
   - **Où :** toutes les pages. GSAP anime `yPercent` et `opacity` de l'en-tête à l'ouverture, alors que `.site-header` a une transition CSS de 0,6 s sur `transform`. Résultat : entrée molle, et risque de saut au rejeu.
   - **Capture :** `captures/ouverture-p1440.webm`.
   - **Cause :** `style.css:210` (`transition: transform .6s`) et `main.js:83`, `main.js:89`.
   - **Correction :** animer avec GSAP un enfant de l'en-tête et garder la transition CSS pour `.is-hidden`, ou couper la transition tant que `html.is-first` est actif.
   - **Effort :** petit.

6. **Barre d'appel mobile visible sur les formulaires et le pied de page**
   - **Où :** téléphone. La barre « 079 381 24 67 / Rendez-vous » reste affichée pendant le formulaire de rendez-vous, et dans le pied de page qui propose déjà les mêmes actions.
   - **Capture :** `captures/planche-rendez-vous-m390.jpg` (captures 04 à zz).
   - **Cause :** `assets/js/ui.js:126`, qui ne masque la barre qu'en haut de page.
   - **Correction :** un IntersectionObserver sur `form` et `.site-footer` qui ajoute `is-hidden` à `.callbar`.
   - **Effort :** petit.

### Finition

1. **Erreur console sans WebGL**
   - **Où :** toutes les pages. « unable to create webgl context » est journalisé, alors que le repli image fonctionne.
   - **Cause :** `assets/js/water.js`.
   - **Correction :** tester `getContext` et sortir proprement, sans `console.error`.
   - **Effort :** petit.

2. **Contraste des étiquettes « à valider par Beat »**
   - **Où :** toutes les pages. `.note` en 13 px sur fond clair : 3,6:1.
   - **Cause :** `style.css:136`.
   - **Correction :** foncer la couleur du texte.
   - **Effort :** petit.

3. **Point médian**
   - **Où :** « Être prévenu·e des dates 2027 » et « Soyez prévenu·e. ».
   - **Cause :** `cours-de-massage.html:100`, `:163`.
   - **Correction :** « Recevoir les dates 2027 » et « Soyez informé des dates. », à faire valider.
   - **Effort :** petit.

4. **Mention Hi-TENS / Hi-EMS absente du site actuel**
   - **Où :** /massage-anti-tensions. Elle est couverte seulement par l'étiquette « Texte reformulé, à valider ».
   - **Cause :** `massage-anti-tensions.html:158`, `:172-173`.
   - **Correction :** la marquer explicitement « à confirmer par Beat ».
   - **Effort :** petit.

5. **Galerie horizontale de l'accueil jamais active**
   - **Où :** accueil. La piste des trois massages ne dépasse jamais la largeur de l'écran entre 1280 et 2560 px, donc l'épinglage prévu ne se déclenche pas.
   - **Cause :** `assets/js/reveal.js:144-150`.
   - **Correction :** assumer une grille fixe et retirer ce code, ou élargir la piste pour que l'effet existe.
   - **Effort :** moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,0 s / 2,0 s (intro goutte de 1,2 s, puis titre ligne par ligne) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image de plus de 50 ms) |
| CLS au chargement (max) | 0,136 sur /rendez-vous en p1440 avec « réduire les animations » ; ailleurs ≤ 0,012 |
| Poids de l'accueil, p1440 / m390 | 0,87 Mo / 0,62 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JavaScript ; sans WebGL, repli image correct avec « unable to create webgl context » en console ; réduire les animations : aucun élément invisible |
| Débordement horizontal | Aucun, à aucun format |
| Sections épinglées | /a-propos : colonne collante qui sort de l'écran de 33 à 114 px à 1280×720 (jusqu'à 302 px à 1000×560) ; /rendez-vous : correcte |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex sur les 10 pages · X-Robots-Tag noindex · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v=20261027b identique pour style.css et main.js · 404 personnalisée |

## Vérifications écartées

- **CLS de 0,136 en mode normal sur /rendez-vous (première série) :** remesuré seul à 0,012 en mode normal. Le 0,136 n'apparaît qu'avec « réduire les animations », d'où l'important n° 3.
- **Décalage pendant le défilement :** il est dû à l'épinglage, ce n'est pas du CLS. Il relève de la colonne collante d'« À propos ».
- **« MASQUÉ » en pied de page :** ce sont des éléments qui passent sous l'en-tête réapparu en haut de l'écran, pendant le défilement. Rien n'est caché en position de lecture.
- **Éléments « invisibles » de la première série :** ce sont des révélations déclenchées à `top 88%` (`reveal.js:46`). Rien n'est invisible dans la nouvelle série, ni avec « réduire les animations ».
- **Heures « h1 » d'environ 200 ms :** elles ne voient pas l'intro. Sur les captures à étapes, le titre est lisible à 2,0 s.
- **Fluidité de 51 i/s dans la première série :** remesurée seule à 60 i/s sans saccade. Pas de pénalité.
- **Erreurs « 404 » sur la page introuvable :** c'est la réponse attendue de la page elle-même.
- **Image Grok anti-tensions (main qui pince) :** examinée en taille réelle. Le geste est un peu raide mais l'anatomie est correcte : cinq doigts, pas de déformation. Pas de défaut visible.
- **Les autres images Grok de l'accueil et des pages principales :**
  - images examinées en taille réelle : relaxant, drainage, massages, mains-épaules, mains ouvertes, effleurage, cours, huile, lin, lac ;
  - aucune déformation, aucun texte ni filigrane ;
  - `pouce-trapeze`, à l'anatomie ambiguë, n'est utilisée sur aucune page.
- **Bibliothèques sans ?v=, robots.txt absent, noindex sans nofollow :** non pénalisés selon les règles du client.
- **Interactions testées :** toutes fonctionnent.
  - Menu mobile : focus sur « Accueil », Échap, verrou de défilement.
  - Guide silhouette : 6 zones et clic sur la silhouette.
  - Point gâchette maintenu, respiration.
  - Liste d'attente : erreurs, puis récapitulatif.
  - Rendez-vous : 3 étapes, vrais jeudis.
  - Bon cadeau : prénom sur la carte, récapitulatif.
  - Carrousel de témoignages, bouton « Copier », animations calmes persistantes.


---

## beat-haechler-maquette : corrections de l'étape 2

Commit e5249ac (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Sous-titre de l'en-tête coupé par le bouton Menu (361 à 390 px) | Bloquant | `.brand-sub` masqué sous 400 px (au lieu de 360 px) | `assets/css/style.css` | 375 px : 16 px de recouvrement → sous-titre masqué de 361 à 400 px, visible et dégagé à 430 px (`preuve-entete-m375.jpg`) |
| Cibles tactiles de moins de 44 px | Important | Sous 1080 px : `min-height: 44px` en `inline-flex` sur `.wlink`, `.chip`, contacts et liens du pied, interrupteur « Animations calmes » ; boutons « Copier » 44×44 ; `.btn--small` à 44 px ; soulignement ondulé recalé | `assets/css/style.css` | m320/m360/m390/m430/t820 : 76/77/83/82/94 → 3/3/3/2/2 cibles (restent les zones SVG de la silhouette) (`preuve-pied-cibles-m390.jpg`) |
| Colonne collante d'« À propos » plus haute que l'écran | Important | Colonne collante avec image en colonne flex bornée à `100svh - --header-h - 60px`, image en `flex: 1; min-height: 0` ; palier `max-height: 600px` (titre réduit) | `assets/css/style.css` | 1000×560 : 302 px hors écran → 0 ; 1024×640 : 226 → 0 ; 1280×720 : 114 → 0 ; 1366×768 et /massage-relaxant, /rendez-vous : aucun défaut (`preuve-epingle-a-propos-*`) |
| CLS de 0,136 sur /rendez-vous avec « réduire les animations » | Important | Hauteur réservée pour la phrase du jour (2 lignes) et pour la phrase de réservation (2 lignes), la vraie source du saut | `assets/css/style.css` | p1440 réduit : 0,1358 → 0,0057 |
| Ouverture lancée avant le chargement des polices | Important | Polices déjà préchargées ; titre masqué puis découpé par SplitText après `document.fonts.ready` (800 ms au plus) | `assets/js/main.js` | Titre découpé en 2 lignes avec Fraunces, ouverture inchangée, aucune erreur (`preuve-ouverture-p1440.jpg`) |
| Transition CSS en conflit avec GSAP sur l'en-tête | Important | Classe `is-intro` pendant l'entrée GSAP : la transition CSS sur `transform` est suspendue, rendue à la fin | `assets/js/main.js`, `assets/css/style.css` | `is-intro` présent pendant l'entrée, retiré ensuite ; masquage au défilement inchangé |
| Barre d'appel visible sur les formulaires et le pied de page | Important | IntersectionObserver : barre visible seulement après le héros, masquée sur les formulaires, le pied de page, le menu ouvert et la 404 ; `--barres-h` mesurée (ResizeObserver) et réservée sous le pied | `assets/js/ui.js`, `assets/css/style.css` | Accueil, /rendez-vous : cachée en haut, visible après le héros, cachée sur le formulaire et le pied ; 404 : jamais affichée ; menu ouvert : cachée ; 0 élément couvert par la barre de m320 à m430 (`preuve-barre-*.jpg`) |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Zones de la silhouette (ellipses SVG) et point gâchette de 31 à 41 px | Important (partie de « cibles 44 px ») | Zones dessinées dans le SVG ; la silhouette a déjà des pastilles de 44 px pour chaque zone. Le point gâchette reste à agrandir (finition) |
| Erreur console « unable to create webgl context » sans WebGL | Finition | Finition (message journalisé par la bibliothèque OGL, non modifiée) |
| Contraste 3,6:1 des étiquettes « à valider par Beat » | Finition | Finition |
| Point médian (« prévenu·e ») | Finition | Finition, reformulation à faire valider par le client |
| Mention Hi-TENS / Hi-EMS absente du site actuel | Finition | Finition, à confirmer par Beat |
| Galerie horizontale de l'accueil jamais active | Finition | Finition |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px | 0 | 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 76 / 77 / 83 / 82 / 94 | 3 / 3 / 3 / 2 / 2 |
| Éléments couverts par la barre du bas | 0 | 0 |
| Éléments couverts par l'en-tête | 14 | 36, tous dans le pied, pendant le défilement (en-tête réapparu) ; artefact déjà écarté dans le rapport, plus nombreux car les lignes du pied sont plus hautes |
| Épinglage aux 8 tailles | /a-propos : image hors écran de 33 à 302 px (1000×560, 1024×640, 1280×720) | Aucun défaut (/a-propos, /massage-relaxant, /rendez-vous) |
| CLS au chargement | 0,012 (/rendez-vous p1440) ; 0,136 en mode réduit | 0,0126 (/rendez-vous p1280) ; 0,0057 en mode réduit |
| Erreurs console | Seulement le 404 attendu de la page introuvable | Idem, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 (toutes les références en ?v=20261028-2) |

## Note proposée
Ancienne note 80/100 → nouvelle note 87/100 · bloquants restants : 0
- Critère 3 (animations) 12 → 14 : la transition CSS ne se bat plus avec GSAP et l'ouverture attend les polices ; reste la galerie horizontale jamais active.
- Critère 5 (formats) 9 → 12 : sous-titre de l'en-tête, cibles tactiles et colonne collante corrigés.
- Critère 7 (technique) 8 → 9 : CLS de /rendez-vous en mode réduit corrigé ; reste l'erreur console sans WebGL.
- Critère 9 (accessibilité) 4 → 5 : cibles tactiles portées à 44 px ; le contraste des étiquettes reste une finition.
