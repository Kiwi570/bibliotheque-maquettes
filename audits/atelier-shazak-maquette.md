# atelier-shazak-maquette

<https://atelier-shazak-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 271cfb0 du 25/10/2026

## Verdict

**77/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Une maquette raffinée, juste pour une sellière d'art, riche en interactions qui fonctionnent toutes, et impeccable sur téléphone. Deux défauts bloquent l'envoi : la galerie horizontale « Trois savoir-faire » est coupée sur tous les écrans d'ordinateur, et le mot « harnacher. » du titre est coupé en deux en 1920.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Rideau à rayures et tresse d'ouverture, plaques de laiton gravées, loupe « Voir le grain », cuir WebGL : c'est original et fidèle au métier, mais la galerie phare paraît cassée sur ordinateur. |
| 2. Direction artistique et harmonie | 12/15 | Palette ivoire, cognac et encre très tenue, Cormorant et Inter Tight bien associées, images d'ambiance cohérentes avec les vraies photos ; la composition des salles (titre recouvert par l'image) dépare. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, ouverture orchestrée (titre complet vers 3 s), transitions WebGL dans la visionneuse, mais une section épinglée qui déborde et un titre découpé lettre par lettre qui se casse en 1920. |
| 4. Expérience ludique et interactions | 9/10 | Essai d'une œuvre au mur (pièce, décor, largeur), jeu « Croisez les brins », fiche de projet en 4 étapes avec validation, filtres presse, visionneuse, son, copier : tout répond. |
| 5. Tous les formats | 9/15 | Aucun débordement et téléphone soigné, mais galerie horizontale coupée de 1280 à 1920, titre coupé en 1920, pastille Homo Faber posée sur le texte, cibles tactiles sous 44 px et pas de barre d'action en bas sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Les « à compléter » sont bien marqués, les images générées sont signalées comme telles et les mentions légales sont présentes ; les distinctions et la presse semblent venir du site actuel, rien de suspect. |
| 7. Technique et performance | 8/10 | Aucune erreur JS, CLS max 0,034, repli sans WebGL propre ; l'accueil pèse 5,25 Mo en p1440. |
| 8. Mise en ligne | 3/5 | Site public, noindex dans chaque page, og:image 1200×630 en adresse complète, 404 aux couleurs du site ; mais pas d'en-tête X-Robots-Tag dans `vercel.json` et pas de `?v=` sur le CSS et le JS. |
| 9. Accessibilité | 4/5 | Focus visible (2 px cognac), canvas `aria-hidden`, « réduire les animations » et « Mode calme » respectés ; quelques cibles tactiles trop petites. |
| **Total** | **77/100** | |

## Points forts

- Une identité sur mesure : les rayures de l'ouverture, la tresse en SVG qui sert d'indicateur de défilement, les coutures en pointillé des cartels, les plaques en laiton.
- L'essai d'une œuvre au mur (accueil) : on choisit la pièce, le décor et la largeur, avec une silhouette de 1,70 m et une échelle. C'est utile et ça se comprend tout de suite.
- Le jeu « Croisez les brins » et la plaque de cuir en WebGL (savoir-faire) racontent le geste du métier.
- Sur téléphone, la mise en page est propre à 320, 360, 390 et 430 px, sans aucun débordement.
- Les données provisoires sont honnêtes : « Titre à compléter », « Crédit photo à compléter », « Décor généré, sans pièce de l'atelier ».

## Défauts

### Bloquants

1. **Galerie horizontale « Trois savoir-faire » coupée** : accueil, de 1280×720 à 1920×1080 (et 1000×560), `captures/epingle-accueil-0-1440x900-92.jpg`, `captures/epingle-accueil-0-1920x1080-92.jpg`, `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/accueil-p1440-07.jpg`. Le compteur « Salle n sur 3 » et le haut des images passent sous l'en-tête (de 12 à 160 px). La pièce du bas et sa légende sortent de l'écran (de 35 à 113 px). Le titre « Harnachement revisité » et son paragraphe sont recouverts par l'image (on lit « Harnachem… », « séparateur d'e… »). Cause : `assets/css/style.css:245-261`. La salle fait `height: 100svh` et ajoute `padding-top: 96px`, alors que la grille empile deux rangées : `.salle__c` en `grid-column: 10 / span 3` chevauche `.salle__b` (9 / span 3) et passe donc à la ligne. Ces deux rangées font 58vh + 30vh, plus les légendes. Le nom est à 7,5rem dans 4 colonnes (`style.css:247-248`). L'épinglage se fait par `pin: sec` (`assets/js/main.js:527`). Correction : faire de la salle une colonne flex de 100svh, avec `padding-top: var(--entete-h)` mesuré en JS. Mettre `.salle__b` et `.salle__c` dans la même colonne et la même rangée (b en haut, c en bas). Donner aux médias `flex: 1; min-height: 0` au lieu de 58vh/30vh. Limiter `.salle__nom` en mode horizontal (`clamp(3rem, 2rem + 3.5vw, 5.5rem)`, `max-width` sur la colonne de texte) ou faire passer le texte sur 5 colonnes. Effort : moyen.
2. **Titre d'accueil coupé au milieu du mot** : accueil, 1920×1080, `captures/accueil-g1920-00.jpg`. On lit « harna / cher. ». Cause : `assets/js/main.js:367` (`SplitText.create(l, { type: 'chars' })` sans `words` : chaque lettre devient un bloc en ligne, donc le navigateur peut couper n'importe où). Le mot ne tient plus dans `grid-column: 1 / span 7` (`style.css:170`), car `--t-hero` monte jusqu'à 10,5rem (`style.css:23`) avec le retrait de 1,1em de la 3e ligne (`style.css:173`). Correction : `type: 'words,chars'` (ou `white-space: nowrap` sur `.heros__titre .ligne`) et plafonner `--t-hero` vers 9rem, ou faire passer le titre sur 8 colonnes. Effort : petit.

### Importants

1. **Pastille Homo Faber posée sur le texte de la plaque** : accueil (et presse), toutes tailles, `captures/accueil-p1440-18.jpg`, `captures/accueil-m390-16.jpg`. On lit « Inscrite au guide Hom◉ Faber ». Cause : `assets/css/style.css:362`, `.plaque__badge` en position absolue (54 px) sans réserve de place dans le titre. Correction : `padding-right: 64px` sur la `.plaque__titre` de la plaque qui porte la pastille (`.plaque:has(.plaque__badge) .plaque__titre`). Effort : petit.
2. **Pas de barre d'action fixe en bas sur téléphone** : toutes les pages, m360 à m430. Correction : ajouter une barre « Proposer un projet » et un contact rapide (téléphone ou e-mail), masquée par IntersectionObserver sur `#projet` et le pied de page. Effort : moyen.
3. **Cibles tactiles sous 44 px** : accueil et presse, téléphone. Il s'agit de « Voir le Shallang » (30 px), du curseur de largeur `#mur-largeur` (22 px), des liens « Inscrite au guide Homo Faber » et « Leather Fashion Design » (28-29 px) et du lien `contact@ateliershazak.fr` (32 px). Cause : `.lien-souligne`, `.lien-cousu`, `.coord__valeur`, `input[type=range]` sans `min-height`. Correction : `min-height: 44px; display: inline-flex; align-items: center` sur ces liens ; `height: 44px` sur le curseur, avec une piste fine dessinée par `::-webkit-slider-runnable-track`. Effort : petit.
4. **Méthode épinglée trop haute à 1000×560** : accueil, `captures/epingle-accueil-1-1000x560-50.jpg`. Le dernier paragraphe des étapes sort de l'écran de 9 à 12 px. Cause : `main.js:575` (`start: 'top top+=90'`) avec une grille trop haute. Correction : palier `@media (max-height: 600px)` qui resserre les marges et la taille des titres d'étape. Effort : petit.

### Finition

1. **Le fil tressé de progression chevauche le contenu des sections pleine largeur** : accueil (galerie horizontale), presse (parcours), `captures/epingle-presse-0-1000x560-50.jpg`, `captures/epingle-accueil-0-1440x900-50.jpg`. Cause : `.fil` fixé à `right: 10px` (`style.css:155`). Correction : le masquer quand une section `.est-horizontal` est épinglée, ou laisser une gouttière droite de 40 px à ces sections. Effort : petit.
2. **Poids de l'accueil** : 5,25 Mo en p1440 (4,0 Mo en g1920). Correction : vérifier les `sizes` des images des salles (variantes 2000 px chargées alors que l'affichage fait moins de 600 px). Effort : petit.
3. **Image d'ambiance `formes-bois`** : les formes de moulage ressemblent à des gousses d'ail, ce qui fait bizarre à côté du vrai cuir moulé. C'est une faiblesse esthétique, pas un défaut : la remplacer à terme par une vraie photo de forme de l'atelier. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 3,0 s / 3,0 s (rideau et tresse jusqu'à 2 s, titre en partie lisible à 2,5 s, complet à 3 s ; h1 DOM 0,30 s / 0,28 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,034 (accueil g1920), 0 ailleurs |
| Poids de l'accueil, p1440 / m390 | 5,25 Mo / 1,63 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur JS (seul le 404 attendu de la page introuvable) ; sans WebGL : photo de repli, aucune erreur ; réduire les animations : pas d'ouverture, contenu visible, salles en colonne |
| Débordement horizontal | Aucun, sur aucun format |
| Sections épinglées | Galerie des salles : coupée de 1000×560 à 1920×1080 (sous l'en-tête et hors de l'écran). Méthode : légèrement coupée à 1000×560 et 1024×640. Parcours presse et visuel collant presse : correct |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex, nofollow sur les 3 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630, adresse complète · `?v=` absent sur style.css, main.js, webgl.js · 404 personnalisée |

## Vérifications écartées

- « MASQUÉ » sous l'en-tête (pied de page, lettre, boutons du hero en t820, titre de la 404) : ce sont des éléments relevés en fin de défilement qui passent normalement sous l'en-tête fixe ; rien n'est caché à l'arrêt.
- Erreur console « 404 » sur `/zz-page-introuvable-audit` : c'est le statut de la page introuvable elle-même, pas une ressource manquante.
- Parcours presse, « h2 sous l'en-tête » à 1000×560, 1024×640 et 2560×1440 : c'est l'intro de la section qui défile normalement pendant que la frise reste visible en entier (`captures/epingle-presse-0-1000x560-50.jpg`).
- Visuel collant de la presse, image 12 à 34 px sous l'en-tête à 92 % : c'est la sortie de la section, l'image se détache ; ce n'est pas une position stable.
- Loupe ronde « Voir le grain » en haut à gauche de plusieurs captures : elle suit le pointeur de l'automate, resté à cet endroit.
- « 2015 » dans les chiffres clés en m320, et plaques à moitié gravées : ce sont des animations de compteur et de gravure en cours au moment de la capture.
- Plaque « La peau prend forme » remplacée par une photo dans les captures : en relançant avec WebGL actif, la plaque WebGL s'affiche (`window.ShazakGL.pret = true`) ; la photo n'est que le repli.
- LCP de 1,95 s sur savoir-faire en g1920 : une seule mesure, prise pendant que 5 maquettes tournaient en parallèle ; elle reste sous 2,5 s.


---

## atelier-shazak-maquette : corrections de l'étape 2

Commit a8faeda (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Galerie horizontale « Trois savoir-faire » coupée (sous l'en-tête et hors de l'écran, titre recouvert) | Bloquant | Méthode « Tout tenir dans l'écran ». La piste est enveloppée dans `.salles__fenetre`, épinglée seule (`start: 'top top'`, sans `anticipatePin`). La salle fait 100svh en colonne flex, avec `padding-top` = `--entete-h` (mesurée en JS par ResizeObserver). La grille a deux rangées `minmax(0, 1fr)` : b en haut, c en bas, a et le texte sur les deux. Les cadres sont en `flex: 1; min-height: 0`, image `absolute` + `object-fit`, légende comprise. Le nom de salle est plafonné à `clamp(2.4rem, .6rem + 3.1vw, 5.2rem)` | index.html, assets/css/style.css, assets/js/main.js | De 1000×560 à 2560×1440 : « h2 sous l'en-tête 133-163 px », « img sort de l'écran jusqu'à 113 px », « cartel sort de l'écran jusqu'à 82 px », « salle__nom sous l'en-tête » → plus rien de coupé (cadres, légendes, compteur et nom entiers, vérifiés à 2, 50 et 98 %). Il reste « img sous l'en-tête 4 à 28 px » : voir la note sous ce tableau |
| Titre d'accueil coupé au milieu de « harnacher. » en 1920 | Bloquant | SplitText `type: 'words,chars'` et `--t-hero` plafonné à 9rem | main.js, style.css | g1920 : « harna / cher. » → 3 lignes de 130 px, mot entier (preuve-apres-titre-1920.jpg) |
| Pastille Homo Faber posée sur le texte de la plaque | Important | `.plaque:has(.plaque__badge) .plaque__titre { padding-right: 64px }` | style.css | « Hom◉ Faber » → texte et pastille séparés, de m390 à p1440 |
| Pas de barre d'action en bas sur téléphone | Important | Barre `.barre-bas` (≤ 960 px) : « Proposer un projet », « Appeler » (`tel:+33675930918`), « Écrire » (`mailto:contact@ateliershazak.fr`), tous déjà présents sur le site. Elle n'apparaît qu'une fois le héros dépassé (IntersectionObserver). Elle est masquée et `inert` sur `#projet` et le pied de page, absente avec le menu ouvert et une fenêtre ouverte, absente de la 404. `--barres-h` est mesurée, et le dernier bloc reçoit ce `padding-bottom` | index.html, presse.html, savoir-faire.html, style.css, main.js | Premier écran : masquée ; milieu : visible ; formulaire, pied, menu : masquée. `covered` par la barre : 0 de m320 à m430 |
| Cibles < 44 px | Important | En `pointer: coarse` : « Voir le … » (soulignement natif, inline-flex 44 px), coordonnées, liens des plaques et de la presse (inline-block 44 px, l'espacement des lettres gravées est préservé), sommaire et puces de filtre (44 px), curseur `#mur-largeur` à 44 px | style.css | Cibles relevées sur téléphone : m320 40 → 0, m360 40 → 0, m390 39 → 0, m430 38 → 0, t820 36 → 0 |
| Méthode épinglée trop haute à 1000×560 (et 1024×640) | Important | Palier `min-width: 961px and max-height: 800px` : étapes resserrées, seule l'étape active déplie son paragraphe (`max-height`), pile d'images plafonnée. Palier `max-height: 600px` qui réduit encore les marges | style.css | « p sort de l'écran 9 px » (1000×560), « h3 sort de l'écran 12 px » (1024×640) → ok aux 8 tailles |
| X-Robots-Tag absent, `?v=` absent | Important (c8) | Déjà corrigé à l'étape 1. Versions passées à `?v=20261028-2` | vercel.json (étape 1), *.html | `?v=20261028-2` identique sur les 3 pages pour style.css, main.js et webgl.js |

Note sur « img sous l'en-tête 4 à 28 px » : ce relevé vient d'un défaut déjà présent avant correction, qui ne se voit pas. Les images des salles gardent un `scale(1.1)` en ligne, vestige de l'animation de tissage. Leur boîte déborde donc de 5 % de leur cadre `overflow: hidden`. Le cadre visible commence, lui, sous l'en-tête à toutes les tailles (vérifié par script sur `.piece__cadre`, et sur les captures).

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Fil tressé de progression qui chevauche les sections pleine largeur | Finition | Finition |
| Poids de l'accueil 5,25 Mo en p1440 (`sizes` des salles) | Finition | Finition |
| Image d'ambiance `formes-bois` (formes en gousses d'ail) | Finition | Donnée manquante (vraie photo à fournir) |
| Images des salles restées à `scale(1.1)` après le tissage (invisible, rognées par le cadre) | Constat | Hors rapport, sans effet visible |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px (téléphone) | 0 | 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 40 / 40 / 39 / 38 / 36 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts par une barre fixe autre que l'en-tête | 0 | 0 (barre du bas : 0 de m320 à m430) |
| Couverts par l'en-tête (fin de défilement, écartés dans le rapport) | pied, 404 | inchangé |
| Galerie des salles (8 tailles + 2560) | coupée de 1000×560 à 1920×1080 | entière, sous l'en-tête (seul relevé : image zoomée et rognée, cf. note) |
| Méthode épinglée | coupée à 1000×560 (9 px) et 1024×640 (12 px) | ok aux 8 tailles |
| Parcours presse, visuel collant presse | écartés dans le rapport | inchangés |
| Erreurs console | 404 attendu de la page introuvable | identique, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 (même `?v=` partout) |

## Note proposée
Ancienne note 77/100 → nouvelle note 89/100 · bloquants restants : 0 · verdict « Prête à envoyer »
- 1. Effet « waouh » 12 → 13 : la galerie phare n'est plus cassée sur ordinateur.
- 2. Direction artistique 12 → 13 : le titre des salles n'est plus recouvert par l'image.
- 3. Animations 11 → 13 : la section épinglée tient dans l'écran, et le titre découpé ne se casse plus en 1920.
- 5. Tous les formats 9 → 14 : la galerie et le titre sont entiers, la pastille est dégagée, les cibles font 44 px et la barre d'action du bas existe.
- 8. Mise en ligne 3 → 5 : X-Robots-Tag et `?v=` déjà corrigés à l'étape 1.
- 9. Accessibilité 4 → 5 : cibles tactiles de 44 px.
