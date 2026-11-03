# lien-numerique-solidaire-maquette

<https://lien-numerique-solidaire-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 7d8265b du 23/10/2026

## Verdict

**75/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Une maquette chaleureuse et très cohérente (images méditerranéennes homogènes, fil terracotta, interactions qui marchent toutes), mais le fond WebGL du héros devient noir dès qu'on fait défiler sur un écran tactile, ce qui rend le texte illisible. La galerie épinglée coupe aussi ses liens à 1366×768.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 11/15 | Ouverture soignée (fil qui s'écrit, photo qui se dévoile, prix barré), univers juste pour un service aux seniors à Marseille, mais une mise en page éditoriale assez classique. |
| 2. Direction artistique et harmonie | 12/15 | Palette papier, terracotta et nuit, Fraunces avec Atkinson, et une série d'images Grok remarquablement homogène ; seul le héros noir sur téléphone casse l'ensemble. |
| 3. Animations et effets | 11/15 | Titre lisible à 1,5 s, 60 i/s, galerie horizontale épinglée et micro-effets (écho « répète », compteur, prix barré), mais galerie coupée à 1366×768 et héros qui vire au noir. |
| 4. Expérience ludique et interactions | 9/10 | Simulateur, filtres, carte des secteurs, galerie à flèches, FAQ, formulaire en 3 étapes avec erreurs, copier et Mode confort fonctionnent tous et se comprennent seuls. |
| 5. Tous les formats | 9/15 | Héros illisible sur téléphone et tablette tactile, liens de la galerie coupés à 1366×768, barre d'appel visible sur le pied de page, titre coupé en milieu de mot à 320 px. |
| 6. Contenu et fiabilité | 9/10 | Contenu repris du site du client, avis, chiffres et numéros bien marqués « à confirmer » ou « à vérifier », mentions légales liées ; typographie française propre. |
| 7. Technique et performance | 7/10 | Aucune erreur de console, CLS 0, pages entre 0,9 et 2,5 Mo, version sans WebGL propre, mais un rendu WebGL figé qui perd son image. |
| 8. Mise en ligne | 3/5 | Public, noindex dans chaque page, og:image JPG 1200×630 en adresse complète, 404 aux couleurs du site ; X-Robots-Tag absent, règle Cache-Control et aucun `?v=`. |
| 9. Accessibilité | 4/5 | Focus visible de 3 px, lien d'évitement, Mode confort réel (texte agrandi, animations coupées), « réduire les animations » respecté ; quelques cibles de 24 à 36 px. |
| **Total** | **75/100** | |

## Points forts

- Série d'images Grok très cohérente (lumière de persienne, bois, citrons, bleu de faïence, mer) : aucun défaut de mains ni de texte relevé en taille réelle.
- Le fil terracotta qui court d'une section à l'autre donne une vraie signature, présente aussi sur téléphone.
- Toutes les interactions marchent : simulateur (standard, solidaire, 1 h, 10 h, 20 h), filtres (2, 1, 2, 2, 3, 8 services), carte et liste des secteurs, formulaire en 3 étapes avec erreurs et confirmation, formulaire court de la page Réinsertion.
- Mode confort utile au public visé (texte à 23 px, rotations et animations coupées) et contenus provisoires clairement marqués.
- 60 i/s sur portable et téléphone, CLS 0 partout.

## Défauts

### Bloquants

1. **Héros noir et texte illisible après défilement sur écran tactile** : accueil, Services et Réinsertion, m390, m320 et t820, `captures/accueil-m390-01.jpg`, `captures/verif-noir-m390-700.jpg`, `captures/planche-services-m390.jpg` (01), `captures/planche-reinsertion-m390.jpg` (01). Le chapo, le bouton « Appeler » et le prix bleu nuit se retrouvent sur un fond noir. Reproduit en Chromium mobile émulé, à confirmer sur un iPhone et un Android réels. Cause : `assets/js/persienne.js:84` et `:106`. Sur pointeur tactile (`pointer: coarse`), le canvas est « figé » : il n'est dessiné qu'une fois, avec `preserveDrawingBuffer: false` (`persienne.js:60`), puis le tampon est perdu et le canvas opaque (`alpha: false`) s'affiche en noir. Correction : en mode figé, ne pas lancer WebGL et garder la version CSS `.persienne-css` (faire `return false` avant `getContext` quand `fige` est vrai). À défaut, passer `preserveDrawingBuffer: true`, redessiner sur `webglcontextrestored` et à l'entrée dans l'écran. Effort : petit.
2. **Galerie épinglée coupée à 1366×768** : accueil, p1366, `captures/epingle-accueil-0-1366x768-8.jpg`. Le bas des cartes et le lien « Choisir cet accompagnement » sortent de l'écran de 18 à 47 px pendant tout l'épinglage. Cause : `assets/js/site.js:640`, le mode horizontal se déclenche dès 760 px de haut, alors que la carte carrée de `clamp(300px, 26vw, 380px)` (`assets/css/site.css:312-313`) ne tient pas sous l'en-tête. Correction : section en colonne flex de 100svh, largeur des cartes calculée à partir de la hauteur disponible (`min(26vw, (100svh - var(--entete-h) - 260px))`), ou seuil relevé à `min-height: 860px`. Effort : petit.

### Importants

1. **Barre d'appel affichée sur le pied de page et les formulaires** : toutes les pages, m390 et m320, `captures/planche-accueil-m390.jpg` (24, zz). Cause : `assets/css/site.css:191-198`, la barre n'est masquée que pendant la saisie (`html.saisie`, `site.js:240-243`). Correction : masquer la barre avec un IntersectionObserver sur `.pied` et `[data-formulaire]`. Effort : petit.
2. **Titre coupé en milieu de mot à 320 px** : accueil, m320, `captures/planche-accueil-m320.jpg` (06) : « L'accompagnemen / t humain ». Cause : `--t-h2: 1.75rem` trop grand pour ce mot sous 360 px (`assets/css/site.css:65`), et `overflow-wrap: break-word` sur les titres (`site.css:89`) qui coupe le mot sans tiret. Correction : `--t-h2: 1.55rem` sous 360 px. Effort : petit.
3. **X-Robots-Tag absent et règle Cache-Control** : `vercel.json:2-6`. Correction : remplacer le bloc par `{ "source": "/(.*)", "headers": [ { "key": "X-Robots-Tag", "value": "noindex, nofollow" } ] }` et supprimer la règle Cache-Control. Effort : petit.
4. **CSS et JS sans `?v=`** : `index.html:24` et `:452`, `services.html:24` et `:218`, `reinsertion.html:24` et `:184`, `404.html:24` et `:88`. Correction : `site.css?v=1` et `site.js?v=1` identiques partout (et `persienne.js` importé avec le même numéro, `site.js:792`). Effort : petit.

### Finition

1. **Cibles tactiles trop petites** : boutons radio du simulateur 24×24 (`#calc-standard`, `#calc-solidaire`), lien e-mail 36 px de haut (`.coord__valeur`), sur services et accueil en m360 à m430. Correction : rendre tout le `label` cliquable avec un `min-height: 44px` et un `padding-block` sur `.coord__valeur`. Effort : petit.
2. **Écho « répète » qui chevauche le titre** : accueil, m390 et t820, `captures/accueil-m390-06.jpg`. Les copies animées montent sur « Patience garantie ». Cause : `.echo__copie` en absolu sans limite (`assets/css/site.css:359`). Correction : limiter le déplacement vertical des copies à 0,6 em ou les décaler vers la droite. Effort : petit.
3. **Premier écran du téléphone sans action visible** : accueil, m390, `captures/ouverture-m390-t1500.jpg`. La photo passe avant le titre, si bien que le chapo et les boutons tombent sous la barre d'appel. Correction : photo du héros en 16:10 ou plus basse sous 700 px (`site.css:257-258`). Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1,5 s / 1,5 s (titre en cours d'écriture à 1 s) |
| Fluidité p1440 / m390 | 59,8 i/s / 60 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0 |
| Poids de l'accueil, p1440 / m390 | 2,20 Mo / 1,51 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune hors 404 volontaire ; sans WebGL propre (version CSS) ; réduire les animations respecté |
| Débordement horizontal | Aucun |
| Sections épinglées | Portrait et étapes : OK ; galerie horizontale : liens coupés de 18 à 47 px à 1366×768 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Oui / oui (3 pages) / absent / absent (non pénalisé) / JPG 1200×630 en adresse complète / absent / page 404 personnalisée |

## Vérifications écartées

- « Voir les tarifs » à 105×32 : sur téléphone, un pseudo-élément agrandit la zone (`site.css:722-723`), qui atteint 44 px.
- Éléments « MASQUÉS » par la barre d'appel en m360 à m430 à l'ouverture (chapo du héros, boutons de la 404) : c'est du contenu sous la ligne de flottaison, qui reste accessible en faisant défiler, et non un masquage permanent.
- Erreur console « 404 » sur la page introuvable : c'est le statut attendu de cette page.
- Compteur « +197 » ou « +199 » sur les captures : animation de comptage prise en cours ; la valeur finale est « +200 », marquée « chiffre à préciser ».
- Valeurs « h1 » par page (jusqu'à 717 ms) : prises sous charge, toutes sous 3 s ; l'ouverture est jugée sur les étapes chronométrées.
- Simulateur « 149,82 € » lors d'un premier test : valeur prise en cours d'animation ; elle se stabilise à 150 €, ce qui est juste.


---

## lien-numerique-solidaire-maquette : corrections de l'étape 2

Commits ad0c1f1 puis 0b9376e (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Héros noir après défilement sur écran tactile (accueil, Services, Réinsertion) | Bloquant | En mode figé (`pointer: coarse`, économie de données, mode calme), `lancer()` renvoie `false` avant `getContext` : pas de WebGL, la version `.persienne-css` reste affichée. Le bureau garde l'effet WebGL animé. | `assets/js/persienne.js` | Chromium mobile émulé (`isMobile`, `hasTouch`) à m390, m320 et t820, défilement à 300 puis 700 px : `webgl-ok` présent et canvas figé → `webgl-ok` absent, `.persienne-css` visible, fond clair (luminosité moyenne du haut d'écran à 700 px sur l'accueil m390 : 132 → 198). p1440 : `webgl-ok` toujours présent. `preuve-heros-*.jpg` |
| Galerie épinglée coupée à 1366×768 | Bloquant | Méthode « Tout tenir dans l'écran » : `.galerie__collant` en `height: 100svh`, colonne flex, `padding-top: var(--entete-mesuree)` (hauteur réelle de l'en-tête, mesurée en JS avec ResizeObserver) ; la photo de chaque carte cède la hauteur qui manque (`flex: 0 1 auto; min-height: 0`, `object-fit: cover` déjà en place). Épinglage en `start: 'top top'`, sans calcul de `top` estimé. | `assets/css/site.css`, `assets/js/site.js` | Lien « Choisir cet accompagnement » sorti de 18 à 47 px (audit initial) → 37 px au-dessus du bas de l'écran ; aucun problème aux 8 tailles. `preuve-galerie-1366x768-avant.jpg` / `-apres.jpg`, `preuve-galerie-1920x1080-apres.jpg` |
| Barre d'appel affichée sur le pied de page et les formulaires, et qui couvre le premier écran (chapô du héros en m430, chapô et boutons de la 404 en m360 à m430) | Important | IntersectionObserver sur le héros (`.heros`, `.heros-page`), `.pied`, `[data-formulaire]` et `[data-formulaire-court]` : la barre n'apparaît (classe `barre-visible`) qu'une fois le héros dépassé, et se masque sur les formulaires et le pied. Sans JS elle reste affichée. Masquée sur la 404 (`html.page-404`), qui porte déjà ses actions. Hauteur réelle mesurée en `--barres-h` ; le pied réserve `40px + var(--barres-h)` (0 sur la 404) au lieu des 74 px codés en dur sur `body`. (2e commit 0b9376e) | `assets/css/site.css`, `assets/js/site.js`, `404.html` | m320, m360, m390, m430 × 4 pages : éléments couverts à l'ouverture 4 → 0, en bas de page 0 → 0 ; barre jamais visible sur la 404 ; visible après le héros, masquée sur les formulaires et le pied, réaffichée en remontant. `preuve-barre-pied-m390.jpg` |
| Titre coupé en milieu de mot à 320 px | Important | `--t-h2: 1.55rem` sous 360 px ; même défaut trouvé sur le h1 de Services (« d'accompagneme / nt ») : `.heros-page h1` à `1.7rem` sous 360 px. | `assets/css/site.css` | Aucun h1/h2 dont le mot le plus long dépasse la largeur du titre à 320 px (accueil, Services, Réinsertion). `preuve-titre-accueil-m320.jpg` |
| Cibles tactiles < 44 px (radios du simulateur 24×24, lien e-mail 36 px) | Finition (cible-44 récurrent) | Radios `.choix` : zone de 44×44 px, cercle de 24 px redessiné au centre, sans décaler la mise en page ; `a.coord__valeur` en `min-height: 44px`. | `assets/css/site.css` | Cibles < 44 px par format : m320 6 → 4, m360 6 → 4, m390 7 → 4, m430 9 → 4, t820 10 → 4 (il ne reste que « Voir les tarifs », déjà agrandi à 44 px par un pseudo-élément, écarté par l'audit). `preuve-radios-m390.jpg` |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Écho « répète » qui chevauche le titre | Finition | Finition |
| Premier écran du téléphone sans action visible (photo avant le titre) | Finition | Finition |
| Héros tactile à confirmer sur iPhone et Android réels | — | Vérifié en Chromium émulé seulement |
| Contenu qui passe sous la barre pendant le défilement | — | Propre à toute barre fixe : la barre est absente du premier écran, des formulaires, du pied et de la 404, et le pied réserve sa hauteur, donc tout contenu peut être amené hors de la barre |
| X-Robots-Tag, Cache-Control, `?v=` | Important | Déjà corrigé à l'étape 1 (6bc995b) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats) | 0 partout | 0 partout |
| Textes < 12 px | 0 | 0 |
| Cibles < 44 px (somme des 4 pages) | m320 6, m360 6, m390 7, m430 9, t820 10, bureau 0 | m320 4, m360 4, m390 4, m430 4, t820 4, bureau 0 |
| Éléments couverts par la barre (ouverture et bas de page, m320 à m430) | 4 (chapô du héros m430, chapô et 2 boutons de la 404) | 0 (vérifié au script `lns-fix-barre.mjs`, après le 2e commit) |
| Épinglage aux 8 tailles | Galerie : lien coupé de 18 à 47 px à 1366×768 (audit initial) | Aucun problème aux 8 tailles (portrait, étapes, galerie) |
| Erreurs console | 0 (hors 404 volontaire) | 0 (hors 404 volontaire) |
| Modules chargés deux fois | 0 | 0 |

Note : la série `avant` locale de l'épinglage a été capturée après le début des modifications CSS ; la référence avant de l'épinglage est donc celle de l'audit initial (`../mesures.json`). Les formats `avant` sont valides.

## Note proposée
Ancienne note 75/100 → nouvelle note 85/100 (c2 12 → 13 : le héros ne casse plus la palette sur tactile ; c3 11 → 12 : galerie qui tient dans l'écran, héros stable ; c5 9 → 12 : héros, galerie, barre d'appel (plus rien de couvert au premier écran) et titres à 320 px corrigés, il reste le premier écran du téléphone ; c7 7 → 9 : plus de rendu WebGL figé qui perd son image ; c8 3 → 5 : X-Robots-Tag, Cache-Control et `?v=` faits à l'étape 1 ; c9 4 → 5 : cibles de 44 px) · bloquants restants : 0
