# gdreseau-maquette

<https://gdreseau-maquette.vercel.app> · audit du 27 octobre 2026 · dernier commit eb78364 du 23 octobre 2026

## Verdict

**77/100 · À peaufiner · 1 défaut bloquant**

Concept constellation et réseau fort, interactions solides et contenu fidèle au site actuel. La galerie « Nos réalisations » coupe ses légendes sur les portables courants, et un écran vide coupe l'élan sur téléphone.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Le logo en étoiles qui se forme puis « Création & communication » sur un ciel étoilé est propre au client, mais de longues zones de ciel vide cassent l'élan. |
| 2. Direction artistique et harmonie | 12/15 | La palette nuit, cyan et corail, le duo Unbounded et Manrope et des images Grok cohérentes et sans défaut visible forment un ensemble juste, mais les sections sont monotones et le visuel « mobilité » ne ressemble pas à La Réunion. |
| 3. Animations et effets | 11/15 | Fluide à 60 i/s, avec un organigramme qui se transforme en réseau, une galerie épinglée avec timecode et un mode calme. Mais le titre n'est lisible qu'à 3 s, la galerie coupe ses légendes en 1280×720 et 1366×768, et un écran vide apparaît sur téléphone. |
| 4. Expérience ludique et interactions | 9/10 | Les services qui composent l'équipe, le brief en 5 étapes avec créneaux, le lecteur de démonstration et les horloges Paris/Réunion fonctionnent tous et se comprennent seuls. |
| 5. Tous les formats | 9/15 | Aucun débordement de 320 à 1920 px et l'en-tête tient partout, mais les légendes sortent de l'écran dans la galerie épinglée, il y a 760 px de vide sur téléphone et les points de navigation recouvrent les cartes. |
| 6. Contenu et fiabilité | 9/10 | Les chiffres, le prix Creatives, le témoignage et les logos clients sont repris du site actuel (vérifié sur gdreseau.com), les « à compléter » sont bien marqués et les mentions légales présentes ; il manque les prénoms sous de vraies photos. |
| 7. Technique et performance | 8/10 | Aucune erreur, aucune ressource en échec, CLS 0 au chargement, 1,2 Mo pour l'accueil, polices préchargées et attendues ; le LCP est de 3,1 s à cause de l'intro et le site n'a pas de `?v=` sur son CSS et son JS. |
| 8. Mise en ligne | 3/5 | Site public, meta noindex dans chaque page, og:image en JPG 1200×630 avec adresse complète, 404 aux couleurs du client et pas de Cache-Control ; il manque l'en-tête X-Robots-Tag et le `?v=` sur main.css et site.js. |
| 9. Accessibilité | 4/5 | « Réduire les animations » est respecté, un mode calme avec `aria-pressed` existe, le focus est visible (2 px) et les textes alternatifs sont soignés ; le libellé du bouton calme ne change pas une fois activé. |
| **Total** | **77/100** | |

## Points forts

- Une idée de constellation et de réseau tenue de l'ouverture au pied de page : logo en points, organigramme qui devient un réseau, carte Paris-Réunion et horloges en direct.
- Des interactions abouties qui fonctionnent toutes :
  - brief en 5 étapes avec validation, équipe composée en direct, 12 créneaux et récapitulatif ;
  - menu mobile avec Échap et verrou de défilement ;
  - lecteur de démonstration et ancres du menu.
- Un contenu fidèle au site actuel, avec les éléments à fournir marqués « à compléter » ou « Démonstration ».
- Fluidité de 60 i/s sur portable et téléphone, CLS 0, aucune erreur JavaScript, fonctionnement identique sans WebGL.

## Défauts

### Bloquants

1. **Légendes coupées dans la galerie épinglée « Nos réalisations »**
   - Où : accueil, en 1280×720 et 1366×768. Les titres et descriptions des cartes sont sous le bord de l'écran pendant tout le défilement horizontal. En 1440×900, l'affichage est correct.
   - Captures : `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-accueil-0-1366x768-50.jpg`.
   - Cause : `assets/js/site.js:806-816` (`sizeClips`) calcule la hauteur des images (`--mh`) avec `capH()`, qui sous-estime la légende (badge « 3e prix », marges de `.clip-bar`). Voir aussi `assets/css/main.css:850-853`.
   - Correction :
     - passer `.real-pin` en colonne flex de 100svh sous l'en-tête mesuré (`--entete-h`) ;
     - donner à la piste et aux cartes `flex: 1; min-height: 0` ;
     - mettre l'image en `flex: 1; min-height: 0` et la légende en hauteur naturelle ;
     - supprimer le calcul de `--mh`.
   - Effort : moyen.

### Importants

1. **Légendes de la galerie coupées en 1000×560**
   - Où : accueil, même défaut que le bloquant sur petit portable. Capture : `captures/epingle-accueil-0-1000x560-50.jpg`.
   - Cause : `site.js:806-816`.
   - Correction : celle du défaut bloquant, plus un palier `max-height: 600px` qui réduit le titre de section.
   - Effort : petit, une fois le bloquant corrigé.
2. **Écran entièrement vide entre le manifeste et les services, sur téléphone et tablette**
   - Où : accueil, de m320 à m430 et en t820. Captures : `captures/accueil-m390-04.jpg`, `captures/planche-accueil-t820.jpg` (n° 03).
   - Cause : `assets/css/main.css:309` (`html.js:not(.is-calm) .manifeste { min-height: 230vh }`) est plus spécifique que la règle mobile `main.css:688` (`.manifeste { min-height: 0 }`). Mesuré à 390 px : la section fait 1941 px pour un contenu de 1177 px.
   - Correction : à la ligne 688, écrire `html.js:not(.is-calm) .manifeste { min-height: 0; }`.
   - Effort : petit.
3. **En-tête X-Robots-Tag absent**
   - Où : toutes les pages.
   - Cause : `vercel.json` ne contient que `cleanUrls` et `trailingSlash`.
   - Correction : ajouter un bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)`.
   - Effort : petit.
4. **Pas de `?v=` sur le CSS et le JS du site**
   - Où : les 5 pages.
   - Cause : `index.html:26` (`main.css`) et `index.html:496` (`site.js`), idem dans `wope.html`, `rencontrer.html`, `mentions-legales.html` et `404.html`.
   - Correction : ajouter `?v=20261027`, identique partout, sur `main.css` et `site.js`.
   - Effort : petit.
5. **Pas de barre d'action fixe sur téléphone**
   - Où : toutes les pages, de m320 à m430. « Se rencontrer » et le téléphone ne sont accessibles que par le menu.
   - Correction : barre basse « Se rencontrer » et « Appeler », masquée par IntersectionObserver sur `#brief` et le pied de page.
   - Effort : moyen.

### Finition

1. **Titre lisible seulement à 3 s, ouverture complète à 4 s**
   - Où : accueil, p1440 et m390. Captures : `captures/planche-ouverture-p1440.jpg`, `captures/planche-ouverture-m390.jpg`. À 2,5 s le titre est encore en cours de montée ; les boutons arrivent à 4 s.
   - Cause : `site.js:486-491`, intro « logo en étoiles » de 1,8 s, puis lettres révélées une à une sur environ 1,2 s.
   - Correction : démarrer `reveal()` à 1,4 s au lieu de 1,8 s, et passer le décalage entre lettres à 0,025.
   - Effort : petit.
2. **Les points de navigation de section recouvrent les cartes de la galerie**
   - Où : accueil, p1280 à g1920 (sur le bouton lecture de Wopé). Capture : `captures/epingle-accueil-0-1440x900-50.jpg`.
   - Cause : `.sec-nav.is-muted` est prévu (`main.css:863`), mais le déclencheur de `sectionNav()` (`site.js:547-553`) est créé avant l'épinglage de `realisations()`. Ses positions ignorent donc l'espace ajouté par l'épinglage.
   - Correction : appeler `sectionNav()` après `realisations()`, ou ajouter `refreshPriority: -1`.
   - Effort : petit.
3. **Le texte du prix n'apparaît qu'après un compte à rebours de 2,2 s**
   - Où : accueil, toutes tailles. Capture : `captures/planche-accueil-p1440.jpg` (n° 01).
   - Cause : `site.js:446-450`, 5 répétitions de 0,44 s avant `finish`.
   - Correction : afficher le texte au début du compte à rebours, ou réduire à 3 répétitions.
   - Effort : petit.
4. **Légende de l'affiche provisoire en 11,5 px**
   - Où : `/wope`, de m320 à m430.
   - Cause : `main.css:228` (`.ph-cap { font-size: .72rem }`).
   - Correction : `font-size: max(12px, .75rem)`.
   - Effort : petit.
5. **Le libellé du bouton « Réduire les animations » ne change pas une fois activé**
   - Où : pied de page, toutes les pages. Capture : `captures/inter-calme-p1440.jpg`.
   - Cause : `site.js:192-200` met à jour `aria-pressed`, mais pas le texte.
   - Correction : afficher « Rétablir les animations » quand le mode calme est actif.
   - Effort : petit.
6. **Le visuel « mobilité » ne ressemble pas à La Réunion**
   - Où : accueil, section « Nous pensons ». Fichier : `assets/img/ambiance/pensons-mobilite-9x16-640.webp`, des pitons façon Sainte-Lucie, alors que le site parle de Paris et de La Réunion. Ce n'est pas un défaut d'image.
   - Correction, consigne Grok si le client le souhaite : « Vertical 9:16 photo, 1080×1920, a wooden terrace table with an open laptop and a notebook overlooking the green volcanic cirques of Reunion Island (Cirque de Mafate style ridges) at dusk, low clouds in the valleys, warm orange sunset sky turning to deep night blue, cinematic night palette of navy, cyan and coral consistent with the rest of the site, shallow depth of field, photorealistic, no text, no logo, no watermark, no people. »
   - Effort : petit.
7. **Prénoms manquants sous trois photos réelles de l'équipe** (« Prénom à compléter »)
   - Où : accueil, section « Pour vous, notre équipe ».
   - Correction : demander les prénoms au client. Le manque est déjà bien signalé.
   - Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 3,0 s / 3,0 s (titre en cours de montée à 2,5 s ; boutons à 4 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0 |
| Poids de l'accueil, p1440 / m390 | 1,23 Mo / 1,04 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur. Sans WebGL : identique, aucune erreur. Réduire les animations : titre immédiat, contenu complet. |
| Débordement horizontal | Aucun, de 320 à 1920 px |
| Sections épinglées | Galerie : légendes hors écran en 1000×560, 1280×720 et 1366×768 ; correcte de 1440×900 à 2560×1440. Manifeste et équipe : corrects. |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public : oui. Noindex : oui, dans 5 pages sur 5. X-Robots-Tag : absent. robots.txt : absent, non pénalisé. og:image : JPG 1200×630 avec adresse complète. `?v=` : absent sur main.css et site.js. 404 : personnalisée. |

## Vérifications écartées

- **Image « sous l'en-tête » du manifeste en 1280×720, 1366×768 et 1440×900, au début de l'épinglage** : c'est l'image en zoom d'entrée sous un en-tête transparent ; aucun texte n'est masqué (`captures/epingle-accueil-1-1280x720-8.jpg`).
- **Invisibles `.org-cap .o-cap-a` et `.o-cap-b`** : ce sont deux légendes qui se relaient pendant la transformation de l'organigramme, liées au défilement. L'une est toujours visible (captures p1440 n° 02 et 04). Avec « réduire les animations », l'état final montre `o-cap-b`, comme prévu.
- **Invisible `.player-msg` sur `/wope`** : le message n'apparaît qu'en lecture (`main.css:573`, `.player.is-playing`). Vérifié en cliquant : le timecode défile et le message s'affiche.
- **Texte du prix invisible** : il est visible (opacité 1) après le compte à rebours, vérifié après 4,5 s. Seule la lenteur est retenue, en finition.
- **Erreur « 404 » sur la page introuvable** : c'est le statut 404 de la page elle-même, attendu. Aucune ressource manquante.
- **Cible tactile `a.hero-prix` à 320 px** : elle mesure 235×44 px (`min-height: 44px`, `main.css:889`), ce qui est conforme.
- **robots.txt absent, noindex sans nofollow et bibliothèques sans `?v=`** : non pénalisés selon les nouvelles règles.
- **Ouverture « h1 » d'environ 2,1 s** : elle ne tient pas compte de la montée des lettres ; la valeur retenue est celle des captures à étapes (3,0 s).


---

## gdreseau-maquette : corrections de l'étape 2

Commit ec6c60a (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Légendes coupées dans la galerie épinglée « Nos réalisations » en 1280×720 et 1366×768 | Bloquant | Méthode « Tout tenir dans l'écran » : `.real-pin` en colonne flex de `100svh` avec `padding-top: var(--entete-h)` (hauteur d'en-tête mesurée en JS, ResizeObserver) ; frise, piste et cartes en `flex: 1; min-height: 0` ; image en `flex: 0 1 auto` au 4:3, légende en hauteur naturelle. Calcul estimé `--mh`/`capH()` supprimé ; la largeur de carte suit la hauteur d'image **mesurée** (`--clip-w`, 4:3). `anticipatePin` retiré. | assets/css/main.css, assets/js/site.js | Avant : descriptions sous le bord de l'écran (captures). Après : bas des légendes à 690/720 px (1280×720) et 737/768 px (1366×768). `preuve-avant/apres-galerie-*.jpg` |
| Légendes de la galerie coupées en 1000×560 | Important | Même correction, plus un palier `@media (min-width: 901px) and (max-height: 600px)` qui réduit le titre et les marges | assets/css/main.css | Avant : descriptions coupées (capture). Après : 535/560 px ; 1024×640 : 613/640 px |
| Écran vide entre le manifeste et les services sur téléphone et tablette | Important | `html.js:not(.is-calm) .manifeste { min-height: 0 }` dans le palier ≤ 900 px | assets/css/main.css | Manifeste 1941 → 1177 px à 390 px ; page m390 13 884 → 13 185 px (barre comprise) ; `preuve-avant-vide-m390.jpg` |
| Pas de barre d'action fixe sur téléphone | Important | Barre « Se rencontrer » / « Appeler » (lien et numéro déjà présents sur le site), ≤ 900 px, boutons 44 px. Apparaît après le héros, masquée sur `#rencontre`, les formulaires, le pied de page et le menu ouvert (IntersectionObserver) ; absente de la 404. `--barres-h` mesurée (ResizeObserver) et réservée en `padding-bottom` | index.html, wope.html, rencontrer.html, mentions-legales.html, assets/css/main.css, assets/js/site.js | Testé à 390 px : masquée en haut, visible à 3000 px, masquée sur « Se rencontrer », menu ouvert, formulaire et bas de /rencontrer ; aucun élément couvert de m320 à m430 ; `preuve-apres-barre-m390.jpg` |
| Légende de l'affiche provisoire en 11,5 px (/wope) | Finition (texte < 12 px récurrent) | `.ph-cap { font-size: max(12px, .75rem) }` | assets/css/main.css | Textes < 12 px : 5 formats → 0 |
| X-Robots-Tag absent | Important | Déjà corrigé à l'étape 1 (vercel.json, f318d6c) | — | Vérifié dans vercel.json |
| `?v=` absent / incohérent sur main.css et site.js | Important | Déjà corrigé à l'étape 1 ; passé à `?v=20261028-2` partout (HTML, imports de modules) | *.html, assets/js/site.js, assets/js/constellation.js | 12 références, aucune ancienne restante, aucun module en double |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Titre lisible seulement à 3 s, ouverture complète à 4 s | Finition | Finition |
| Points de navigation de section sur les cartes de la galerie (p1280 à g1920) | Finition | Finition (toujours visibles sur `preuve-apres-galerie-*`) |
| Texte du prix après un compte à rebours de 2,2 s | Finition | Finition |
| Libellé du bouton « Réduire les animations » inchangé une fois activé | Finition | Finition |
| Visuel « mobilité » qui ne ressemble pas à La Réunion | Finition | Image Grok (à régénérer par l'utilisateur) |
| Prénoms manquants sous trois photos de l'équipe | Finition | Donnée manquante |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | Aucun | Aucun |
| Textes < 12 px | 1 (/wope, m320 à t820) | 0 |
| Cibles < 44 px | 0 | 0 |
| Éléments couverts (dont par la barre du bas) | 0 | 0 |
| Galerie épinglée, bas des légendes / hauteur d'écran | Descriptions hors écran en 1000×560, 1024×640, 1280×720 et 1366×768 (captures `epingle-accueil-0-*`) ; correct de 1440×900 à 2560×1440 | Tout dans l'écran aux 8 tailles : 535/560 · 613/640 · 690/720 · 737/768 · 865/900 · 946/1080 (captures relues en 1000×560, 1280×720, 1366×768, 1920×1080) |
| Épinglage, autres sections | Manifeste : image « sous l'en-tête » au début de l'entrée en 1280×720 à 1440×900 (vérification écartée dans le rapport) | Identique |
| Hauteur de l'accueil m390 | 13 884 px | 13 185 px |
| Erreurs console | 9 (statut 404 attendu de la page introuvable) | 9 (idem), aucune nouvelle |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 77/100 → nouvelle note 84/100 · bloquants restants : 0 (note harmonisée : le critère 1 reste à 12, sa justification ne citait pas l’écran vide sur téléphone)
- 3. Animations 11 → 13 : légendes de la galerie visibles en 1280×720 et 1366×768, écran vide supprimé ; le titre à 3 s reste.
- 5. Formats 9 → 11 : légendes dans l'écran et 760 px de vide supprimés ; les points de navigation sur les cartes restent.
- 7. Technique 8 → 9 : `?v=` sur main.css et site.js (étape 1) ; le LCP de 3,1 s reste.
- 8. Mise en ligne 3 → 5 : X-Robots-Tag et `?v=` déjà corrigés à l'étape 1.
