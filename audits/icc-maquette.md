# icc-maquette

<https://icc-maquette.vercel.app> · audit du 27 octobre 2026 · dernier commit 751a0d0 du 23 octobre 2026

## Verdict

**85/100 · À peaufiner · 1 défaut bloquant**

La maquette a une vraie signature : arbre ICC en particules d'or qui s'ouvre en ciel étoilé, architecture en 6 étapes épinglée, renversements « Nous ne… / Nous… » et carte d'écosystème interactive, le tout à 60 i/s et sans aucune erreur. Elle ne peut pas partir avant une correction : à 1280×720, le titre du catalogue épinglé est coupé en haut pendant tout l'épinglage.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | L'arbre du logo se forme en particules d'or puis s'ouvre en constellation : c'est original, juste pour un « intégrateur de systèmes », et la spirale épinglée donne envie de défiler. |
| 2. Direction artistique et harmonie | 13/15 | La palette nuit, or et turquoise, le serif display fin et la sans-serif s'accordent bien ; les images Grok forment une série cohérente (heure bleue, lumière dorée). Les sections claires et les vraies photos s'intègrent sans rupture. |
| 3. Animations et effets | 13/15 | Ouverture orchestrée (titre lisible entre 2,5 et 3 s), 60 i/s sans saccade, épinglages, renversements avec texte brouillé, compteurs et curseur réussis, effet signature présent sur téléphone ; mais le catalogue épinglé coupe son titre à 1280×720. |
| 4. Expérience ludique et interactions | 9/10 | Rendez-vous en 4 étapes avec contrôles et récapitulatif, filtres animés, carte « Révéler les connexions », choix de formule, accordéons, FR/EN et pause du défilé de logos : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 11/15 | Aucun débordement de 320 à 1920 px, mais le titre du catalogue est coupé à 1280×720 et des descriptions de cartes sont tronquées pendant l'épinglage. Des cibles tactiles font 23 à 41 px et le badge « à compléter » fait 11,7 px. |
| 6. Contenu et fiabilité | 9/10 | Équipe, témoignage de Chloé Moullec, prix et lettres de soutien sont repris du site actuel ; « à compléter », « données fictives », « autorisation des logos à confirmer » et l'indépendance vis-à-vis de l'ONU sont bien signalés ; les mentions légales sont présentes. |
| 7. Technique et performance | 9/10 | Aucune erreur JS ni lien cassé, CLS de 0, accueil de 1,1 à 1,5 Mo, repli 2D propre sans WebGL et polices prêtes en 0,2 s ; le LCP de l'accueil (2,5 à 3,6 s) est retardé par l'intro. |
| 8. Mise en ligne | 4/5 | Site public ; noindex et X-Robots-Tag, og:image JPG 1200×630 avec adresse complète, `?v=3` identique et 404 aux couleurs du site ; mais `vercel.json` contient des règles Cache-Control. |
| 9. Accessibilité | 4/5 | Le focus est visible (contour or de 2 px), il y a un lien d'évitement, « réduire les animations » est respecté et le Mode calme est mémorisé et présent dans le menu mobile. Échap ferme le menu. En revanche, des cibles et des badges sont trop petits sur téléphone. |
| **Total** | **85/100** | |

## Points forts

- **Une ouverture qui raconte la marque.** Les points convergent vers l'arbre du logo ICC, puis l'arbre s'ouvre en ciel étoilé derrière le titre. L'intro ne se joue qu'à la première visite et cède au premier geste.
- **« ICC Transformation Architecture™ » en 6 étapes épinglées.** Une spirale de particules monte d'étape en étape, avec un index latéral. Elle reste présente sur téléphone.
- **Les renversements de /advisory.** La phrase niée est barrée au défilement, puis l'affirmation apparaît en texte brouillé. La forme sert exactement le propos.
- **Une carte d'écosystème jouable**, avec le bouton « Révéler les connexions possibles », des compteurs (64 / 17) et la mention « Démonstration illustrative · données fictives ».
- **Un rendez-vous simulé exemplaire.** Il compte 4 étapes, avec des créneaux générés et des erreurs claires (« Adresse e-mail incomplète, par exemple nom@domaine.fr »). Le récapitulatif se termine par « aucune donnée n'a été envoyée ».
- **Des contenus provisoires bien signalés** : badges « à compléter », « dates à confirmer », « mois à confirmer », et note de prix « à préciser par ICC ».
- **Une version anglaise complète** (/en), un repli 2D soigné sans WebGL, et un Mode calme mémorisé.

## Défauts

### Bloquants

1. **Catalogue épinglé : titre coupé à 1280×720**
   - Page : accueil, section « Des parcours qui se vivent sur le terrain » (#formations).
   - Format : 1280×720. La première ligne du titre est coupée de 31 px en haut pendant tout l'épinglage, et les descriptions des cartes sont tronquées par des points de suspension (« à la découverte de New… »).
   - À 1366×768, le surtitre et la note de bas sortent de 8 et 21 px au début de l'épinglage. À 1024×640, ce sont les filtres qui sont coupés.
   - Captures : `captures/epingle-accueil-1-1280x720-50.jpg`, `captures/epingle-accueil-1-1280x720-92.jpg`, `captures/epingle-accueil-1-1366x768-8.jpg`.
   - Cause : `assets/js/home.js:183-189`. Quand l'ensemble dépasse la hauteur de l'écran, `offset()` épingle la section plus bas pour garder le bas des cartes visible, et c'est le haut (surtitre, titre) qui sort. S'y ajoutent les `-webkit-line-clamp` de `assets/css/main.css:822`, `:828` et `:832`.
   - Correction :
     - passer `.cat.is-pinned` en colonne flex de 100svh, avec en-tête et filtres en haut et `.cat__viewport` en `flex: 1; min-height: 0` ;
     - sous `max-height: 780px`, mettre le titre sur une ligne à côté des filtres, réduire la hauteur des images (`clamp(90px, 16vh, 160px)`) et masquer le surtitre ;
     - supprimer le décalage `offset()` pour épingler à `top top`.
   - Effort : moyen.

### Importants

1. **Cibles tactiles de moins de 44 px sur téléphone** (toutes les pages, m320 à m430)
   - Éléments concernés :
     - le logo `.brand` fait 100×37 px à 320 et 360 px ;
     - les liens du pied de page (« La méthode », etc.) font 23 px de haut ;
     - le lien e-mail du menu fait 30 px, celui de la fiche contact 25 px ;
     - la puce de profil « Dirigeant, institution ou territoire » fait 41 px ;
     - le lien « Voir les 4 étapes de l'alternance » (/junior-impact-maker) fait 27 px.
   - Causes : `assets/css/main.css:783` (`.brand { width: 100px }`), `:509` (`.footer__col a`), `:130` (`.menu__foot`), `:157` (`.link`) et `:209` (`.profiles .chip`).
   - Correction : `min-height: 44px; display: inline-flex; align-items: center` sur `.footer__col a`, `.menu__foot .link`, `dd .link` et `.plan__docs .link`. Mettre `padding-block: .75rem` sur `.profiles .chip` et `min-height: 44px` sur `.brand`.
   - Effort : petit.

### Finition

1. **Badges « à compléter » à 11,7 px et badge « Maquette » à 10,5 px** à 430 px de large. Cause : `assets/css/main.css:77` (`.tbc { font-size: .78em }`) et `:107` (`.draft-tag { font-size: 10.5px }`). Correction : `font-size: max(12px, .78em)` et `font-size: 12px`. Effort : petit.
2. **Indication « Défiler » posée sur la carte « Vous êtes… »** du hero (p1440, g1920), visible dans `captures/ouverture-p1440-t4000.jpg` et `captures/verif-calme-accueil-p1440.jpg`. Cause : `assets/css/main.css:219`, où `.scroll-hint` est en `right: var(--gutter)` comme la carte. Correction : la placer à `right: calc(var(--gutter) / 3)` ou la masquer quand `.profiles` est affichée en colonne. Effort : petit.
3. **Image collante de « Apprendre par l'expérience » (/advisory) qui dépasse le bas de l'écran** de 3 à 13 px à 1280×720 et 1366×768, et de 37 px à 1000×560 (`captures/epingle-advisory-1-1280x720-8.jpg`). Cause : `assets/css/main.css:607-608`, une image en 4/5 d'une hauteur fixe sous un `top` collant. Correction : `max-height: calc(100svh - var(--header-h) - 48px)` sur `.exp__media .media`. Effort : petit.
4. **Image Grok « New York » générique.** La ligne d'horizon de `assets/img/grok/accueil-newyork-16x9-lg.webp` (carte « Capsule ODD », section « Les lieux ») ne ressemble pas à Manhattan. C'est une faiblesse, pas un défaut visible. Correction : utiliser une vraie photo du site actuel (`assets/img/site/onu-new-york-*`) ou une consigne Grok plus précise. Effort : petit.
5. **Intro de l'accueil un peu longue.** L'arbre tient jusqu'à 1,5 s et le hero n'est révélé qu'à 1,8 s après les premières images (`assets/js/constellation.js:229-232`) ; le titre est lisible entre 2,5 et 3 s, sous la limite, mais sans marge. Correction : révéler à 1,1 s et faire apparaître le titre en 0,6 s. Effort : petit.
6. **Pas de barre fixe en bas sur téléphone** pour « Prendre rendez-vous » et un contact rapide. Correction : ajouter une barre avec action principale et e-mail ou téléphone, masquée par IntersectionObserver sur `#contact` et le pied de page. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | entre 2,5 et 3 s / 3,0 s (remesure seule, Mac au calme : absent à t2500, lisible à t3000, `captures/bande-ouverture-p1440.jpg`) ; pages intérieures 1,5 à 2 s |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0 |
| Poids de l'accueil, p1440 / m390 | 1,39 Mo / 1,13 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS (seule la 404 elle-même est signalée sur la page introuvable). Sans WebGL : repli 2D correct, titre à 1,1 s. Réduire les animations : titre à 0,2 s, contenu visible, pas d'épinglage. |
| Débordement horizontal | Aucun, de 320 à 1920 px |
| Sections épinglées | Architecture (accueil), renversements (/advisory) et calendrier (/junior-impact-maker) : correctes à toutes les tailles. Catalogue (accueil) : titre coupé à 1280×720, haut et bas débordants à 1366×768 et 1024×640. Image collante de /advisory : quelques px hors écran. |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public, meta noindex dans chaque page, X-Robots-Tag `noindex, nofollow`, robots.txt absent (non pénalisé), og:image JPG 1200×630 avec adresse complète, `?v=3` identique sur `main.css` et `app.js`, 404 aux couleurs du site. **Règles Cache-Control dans `vercel.json` (lignes 5 à 40) à supprimer.** |

## Vérifications écartées

- **« h1 » à 3,0 à 3,8 s par format, et ma remesure à 3,25–3,55 s** : prises pendant que d'autres agents chargeaient le Mac. Remesurée seule au calme, l'ouverture est lisible entre 2,5 et 3 s : pas de pénalité (remarque en finition).
- **Bloc vide de 230 px sous « L'alternance qui connecte… » sur téléphone** (`captures/junior-impact-maker-m390-12.jpg`) : le paragraphe d'introduction était en cours d'apparition. Après 2,5 s il est à opacité 1 (`outils/icc-interactions.mjs`).
- **Affirmations positives absentes des renversements sur les captures p1440** (`captures/advisory-p1440-04.jpg`) : elles apparaissent à partir de 38 % de chaque étape. Vérifié au milieu de l'étape 2 : « Nous créons des écosystèmes. » s'affiche (`captures/verif-flip-advisory-p1440.jpg`).
- **Distances « 6 120 », « 6 130 » ou « 6 140 km » selon les captures** : c'est le compteur en cours d'animation. La valeur finale est 6 140 km (`index.html:247`).
- **Kicker et titre de la 404 « masqués » par l'en-tête à 1920** : c'est l'en-tête au-dessus du contenu qui défile. La 404 s'affiche bien (`captures/404-g1920-00.jpg`).
- **Erreur console « 404 » sur la page introuvable** : c'est le statut voulu du document lui-même. Aucune ressource ne manque.
- **Filtres et surtitre « sous l'en-tête » dans le catalogue épinglé** : l'en-tête se masque au défilement (hauteur 0). Le défaut retenu est la coupure par le bord de l'écran.
- **Image Grok `jim-alternance` (mains autour d'une table)** : quatre mains pour trois personnes, doigts corrects. Rien de déformé.
- **Bouton « Passer l'introduction » introuvable lors du test** : l'intro était déjà terminée au moment du clic. Le titre était bien visible.
- **Bibliothèques (GSAP, Lenis, OGL) sans `?v=`** : ce n'est pas pénalisé.


---

## icc-maquette : corrections de l'étape 2

Commits 3966171 + d6fba57 (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Catalogue épinglé : titre coupé à 1280×720, surtitre et note sortis à 1366×768, filtres coupés à 1024×640, descriptions tronquées | Bloquant | Méthode « Tout tenir dans l'écran » : `.cat.is-pinned` en colonne flex de `100svh`, `padding-top: var(--entete-h)` (hauteur de l'en-tête mesurée en JS par ResizeObserver), `.cat__viewport` en `flex: 1; min-height: 0`, cartes à 100 % de hauteur et image en `flex: 1 1 0` qui absorbe la place ; épinglage à `top top` sans `offset()` ; `-webkit-line-clamp` supprimés ; paliers `max-height: 820px` (surtitre masqué, titre sur une ligne) et `680px` (titre et filtres sur une rangée, marges resserrées, cartes plus larges, prix et bouton sur une ligne, image d'au moins 84 px) | `assets/js/home.js`, `assets/js/core.js`, `assets/css/main.css` | 6 coupes → 0 aux 8 tailles ; aucune description tronquée ni carte débordante ; image la plus basse à 1024×640 : 21 px → 89 px (second commit) ; filtres testés (re-épinglage correct, aucune erreur) ; `preuve-avant-catalogue-1280x720.jpg` → `preuve-apres-catalogue-*.jpg` |
| Cibles tactiles < 44 px (logo, liens du pied, e-mail du menu et de la fiche contact, puce de profil, « Voir les 4 étapes », Mode calme, titre de session) | Important | `.brand` en flex `min-height: 44px` ; sous 1080 px, liens du pied, du menu, des `dd`, de `.plan__docs`, de `.session__title` et des `p.small` en `inline-flex; min-height: 44px` ; `.profiles .chip` et `.calm-toggle` à 44 px | `assets/css/main.css` | 18 à 24 cibles par format → 0 (m320 à t820) ; `preuve-apres-pied-cibles-m390.jpg` |
| Badges « à compléter » à 11,7 px, « Maquette » à 10,5 px | Important (récurrent) | `.tbc { font-size: max(12px, .78em) }`, `.draft-tag { font-size: 12px }` | `assets/css/main.css` | 22 à 30 textes < 12 px par format → 0 |
| Image collante de /advisory hors écran (3 à 37 px) | Finition (rendu 1280×720 / 1366×768 exigé) | `max-height: calc(100svh - var(--entete-h) - 96px)` sur `.exp__media .media` (marge pour le zoom de l'image) | `assets/css/main.css` | 6 coupes → 0 ; `preuve-apres-advisory-image-*.jpg` |
| Pas de barre fixe en bas sur téléphone | Finition (récurrent « barre-bas ») | Barre créée en JS (≤ 760 px) avec l'action déjà présente dans l'en-tête de la page (Prendre rendez-vous / Candidater / Book a meeting), le téléphone et l'e-mail déjà présents dans le pied ; apparaît après le héros, masquée sur les formulaires, le pied, les séquences épinglées et le menu ouvert ; absente de la 404 et des mentions ; `--barres-h` mesurée, réservée en bas du pied | `assets/js/core.js`, `assets/js/app.js`, `assets/css/main.css` | Éléments couverts par la barre : 0 (m320 à m430 et 8 tailles d'épinglage) ; testé sur /, /advisory, /junior-impact-maker, /en/, 404 ; `preuve-apres-barre-bas-m390.jpg` |
| Règles Cache-Control dans `vercel.json` | Important | Déjà corrigé à l'étape 1 (vérifié : seul X-Robots-Tag reste) | — | — |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Indication « Défiler » posée sur la carte « Vous êtes… » (p1440, g1920) | Finition | finition |
| Image Grok « New York » générique | Finition | image Grok |
| Intro de l'accueil un peu longue (titre lisible entre 2,5 et 3 s) | Finition | finition |
| Kicker et titre de la 404 sous l'en-tête à g1920 en bas de page | — | déjà écarté par l'audit (défilement normal sous l'en-tête) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920) | 0 | 0 |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 25 / 30 / 22 / 29 / 26 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 18 / 18 / 18 / 18 / 24 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts | 2 (404 g1920, écarté) | 2 (même cas, écarté) ; 0 par la barre du bas |
| Épinglages aux 8 tailles (1000×560 à 2560×1440) | 12 problèmes (catalogue 6, image /advisory 6) | 0 sur 111 positions |
| Erreurs console | 0 (hors statut 404 voulu) | 0 (hors statut 404 voulu) |
| Modules chargés deux fois | 0 | 0 (42 références, toutes en `?v=20261028-2`) |

## Note proposée
Ancienne note 85/100 → nouvelle note 91/100 · bloquants restants : 0
- 3. Animations : 13 → 14, le catalogue épinglé ne coupe plus son titre.
- 5. Tous les formats : 11 → 14, titre et descriptions du catalogue entiers, cibles à 44 px et badges à 12 px (pas de 15/15).
- 8. Mise en ligne : 4 → 5, les règles Cache-Control ont été retirées de `vercel.json` (étape 1).
- 9. Accessibilité : 4 → 5, cibles et badges à la bonne taille sur téléphone.
