# h-renovation-maquette

<https://h-renovation-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 006569c du 27/10/2026

## Verdict

**79/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Maquette solide et cohérente : ambiance orage sur l'ardoise, vraies photos de chantier, nombreuses interactions qui fonctionnent toutes, 60 i/s. Deux points bloquent l'envoi : une légende de la galerie épinglée coupée en 1280×720 et une image Grok d'échafaudage peu crédible pour un artisan.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Logo qui se dessine sous un toit, pluie WebGL sur le hero, bandeau de zinc et maison interactive : c'est fort et propre au métier, mais l'intro retarde le titre au-delà de 3 s. |
| 2. Direction artistique et harmonie | 12/15 | Palette ardoise, cuivre et chaux tenue sur les 45 pages, Big Shoulders et Manrope bien associées. Les photos de chantier prises au téléphone tranchent avec les images Grok très léchées, et l'image de l'échafaudage est à refaire. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, galerie horizontale épinglée, rangs de tuiles qui se posent au défilement, curseur goutte. Titre lisible vers 3,5 s seulement, et la galerie épinglée déborde sur les petites hauteurs. |
| 4. Expérience ludique et interactions | 9/10 | Tout répond : diagnostic sur la maison, avant/après, avis, filtres et visionneuse, devis en 4 étapes, anatomie du toit, maison thermique, menu mobile (Échap compris). |
| 5. Tous les formats | 10/15 | Aucun débordement visible, en-tête qui tient à 320 px. En revanche : légende coupée en 1280×720, titre et compteur coupés en 1000×560, textes de 9,6 à 11,5 px, cibles sous 44 px, barre mobile qui reste sur les formulaires et le pied de page. |
| 6. Contenu et fiabilité | 9/10 | Les « à compléter » et « à valider » sont bien marqués, les avis sont présentés comme reproduits tels quels et le chiffre ADEME est sourcé. Les mentions légales sont présentes. |
| 7. Technique et performance | 8/10 | Aucune erreur JS, CLS de 0 à 0,008, 51 liens internes valides, et le repli sans WebGL est propre. Accueil lourd : 5,6 Mo en p1440 et 8,3 Mo en g1920, à cause des vidéos et des photos de la galerie. |
| 8. Mise en ligne | 4/5 | noindex, X-Robots-Tag, robots.txt, ?v= identique partout, aucune règle Cache-Control, 404 aux couleurs du site. Mais og:image pointe vers www.h-renovation.com, qui répond 404. |
| 9. Accessibilité | 4/5 | Focus visible, respect de « réduire les animations » et interrupteur dans le pied de page, textes alternatifs présents. Petits textes et cibles tactiles trop petites. |
| **Total** | **79/100** | |

## Points forts

- Une direction artistique propre au métier, sans air de modèle : orage, ardoise, cuivre. Les sections claires en chaux donnent du rythme.
- Des interactions utiles qui servent le client : « Montrez-nous ce que vous voyez » sur la maison en coupe, avant/après d'une gouttière, devis en 4 étapes avec récapitulatif.
- Les 32 fiches prestations et les 3 savoir-faire sont riches, cohérents et gardent les adresses du site Wix (réécritures dans vercel.json).
- Vraies photos et vidéos de chantier, sans rien d'inventé : les contenus provisoires sont marqués.
- Technique saine : 60 i/s sur portable et téléphone, CLS quasi nul, aucune erreur, repli sans WebGL et intro jouée une seule fois par session.

## Défauts

### Bloquants

1. **Légende de la galerie épinglée coupée en 1280×720** : accueil, section « Les derniers chantiers », 1280×720. La légende de la carte suivante (« Noue en zinc ») sort de 6 px sous l'écran. En 1024×640 et 1000×560, le titre et le compteur passent aussi hors de l'écran. Captures : `captures/epingle-accueil-0-1280x720-8.jpg`, `captures/epingle-accueil-0-1024x640-8.jpg`, `captures/epingle-accueil-0-1000x560-8.jpg`. Cause : `assets/js/accueil.js:136` épingle avec `start: 'center center'` un bloc plus haut que l'écran. Les cartes ont une largeur fixe et une hauteur qui en découle (`assets/css/main.css:495-499` : 420 px en 4/5, 560 px en 5/4), d'où environ 525 px d'image plus la légende. Correction : quand `.real.est-epingle` est actif, fixer la hauteur au lieu de la largeur. Section en colonne flex de 100svh, `.chantier__img { height: calc(100svh - var(--entete-h) - var(--tete-real-h) - 4rem); width: auto; aspect-ratio: 4/5 }` (5/4 pour les cartes larges), hauteurs mesurées en JS, épinglage avec `start: 'top top+=' + entete`. Effort : moyen.
2. **Image Grok d'échafaudage peu crédible** : `/servicetype/isolation` et `/services/isolation-thermique-exterieure`, tous formats. L'échafaudage est posé à l'écart du mur, sans garde-corps aux niveaux de travail, avec des planches empilées en escalier dans le bas du cadre. Un client ou un artisan le remarquera sur le site d'un couvreur. Fichier : `assets/img/grok/service-isolation-thermique-exterieure-4x5.webp`. Correction : régénérer l'image (consigne dans notes.json). Effort : petit.

### Importants

1. **Ouverture lente : titre lisible vers 3,5 s** : accueil, p1440 et m390, première visite de la session. Captures : `captures/bande-ouverture-p1440.jpg` (titre encore caché à 3 s, lisible à 4 s) et `captures/bande-ouverture-m390.jpg` (lisible à 4 s). Cause : la timeline de `assets/js/accueil.js:27-31` dure environ 2,8 s (trait 0,7 s, 14 lettres avec un décalage de 0,045 s, pause de 0,2 s, volet de 0,85 s), et le hero ne s'anime qu'après. Correction : trait en 0,45 s, décalage de 0,025 s, pas de pause, volet en 0,6 s, et lancer le hero au début du volet pour que le titre soit lisible avant 2,5 s. Effort : petit.
2. **Barre mobile « Appeler / Devis gratuit » toujours visible** : toutes les pages, m320 à t820, par-dessus le formulaire de contact, le devis et le pied de page. Captures : `captures/planche-contact-m390.jpg` et `captures/planche-accueil-m390.jpg` (zz). Cause : `assets/js/main.js:50` ne bascule `est-visible` que selon le seuil de défilement. Correction : IntersectionObserver sur `form`, `[data-devis]` et `.pied`, qui retire `est-visible` quand l'un d'eux est à l'écran. Effort : petit.
3. **Textes de moins de 12 px sur téléphone** : sous-titre du logo à 9,6 px sur toutes les pages, `.plaque dt` à 10,6 px sur les 32 fiches, `.mosaique__titre` à 10,2 px, `.note-maquette b` à 10,9 px, titres du pied de page à 11,5 px, badges, légende de la carte, libellés de coordonnées. Cause : `assets/css/main.css:208` (`.marque small` .6rem), `:814` (.66rem), `:1060` (.64rem), `:147` (.68rem), `:447`, `:510`, `:572`, `:575`. Correction : plancher `font-size: max(12px, …)` sur ces sélecteurs. Effort : petit.
4. **Cibles tactiles de moins de 44 px** : logo (34 px), bouton « Copier » (31 px), liens fléchés `.lien` (25 à 29 px), liens du pied de page (29 px), interrupteur « Réduire les animations » (34 px), chips du diagnostic (43 px). Cause : `assets/css/main.css:174` (.lien), `:182` (.copie), `:604` (.bascule). Correction : `min-height: 44px; display: inline-flex; align-items: center` sur ces éléments sous 900 px. Effort : petit.
5. **og:image en 404** : toutes les pages. `https://www.h-renovation.com/assets/img/og-h-renovation.jpg` n'existe pas tant que le domaine n'est pas branché, donc l'aperçu de partage est vide pour le client. Cause : `index.html:21`, et la même ligne dans les 44 autres pages. Correction : pendant la phase maquette, pointer vers `https://h-renovation-maquette.vercel.app/assets/img/og-h-renovation.jpg` (le fichier existe en 1200×630), et le noter dans la liste de mise en ligne du README. Effort : petit.

### Finition

1. **Accueil lourd sur grand écran** : 5,6 Mo en p1440 et 8,3 Mo en g1920. Les 4 vidéos mp4 (0,9 à 1,8 Mo) se lancent pendant le passage dans la galerie. Correction : vidéos en 720p et à 1 Mo maximum, `srcset` plafonné à 800w pour les cartes de la galerie. Effort : petit.
2. **Image de l'atelier** (`assets/img/grok/atelier-outils-4x5-800.webp`, emplacement « Portrait à fournir ») : on y voit un sécateur de jardin, qui n'est pas un outil de couvreur. Le portrait de Samuel est à demander au client. Effort : petit.
3. **Décalages d'apparition hors de l'écran sur les fiches** : en 1280 et 1366, `.points li` (x: 40), `.methode__etape` (x: 30) et `.conclu__fond` (scale 1.15) dépassent de 30 à 44 px. Le `overflow-x: clip` du body masque le dépassement (aucun défilement possible à la molette ni au clavier), mais c'est fragile. Correction : `overflow-x: clip` sur `.sec`, ou animer depuis `x: -30`. Effort : petit.
4. **Contraste à vérifier pour `.coord__ligne > span` sur fond chaux** : #6a6f75 et #575c62 (`assets/css/main.css:575` et `:1065`). Le résultat est limite à 11 px. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 3,5 s / ≈ 3,5 s (bandes : caché à 3 s, lisible à 4 s ; vidéos h1 3,17 s / 3,03 s). Intro jouée une fois par session. |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,0079 (/a-propos p1280) |
| Poids de l'accueil, p1440 / m390 | 5,56 Mo / 2,08 Mo (g1920 : 8,29 Mo) |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS. Sans WebGL : message OGL « unable to create webgl context » intercepté, hero en image fixe propre. Réduire les animations : intro et animations coupées, titre à 0,4 s. |
| Débordement horizontal | Aucun débordement visible sur les 10 pages mesurées ni sur les 35 pages ajoutées (m320 à g1920). Dépassement de 17 à 44 px masqué par le clip sur les fiches en 1280 et 1366 (voir Finition 3). |
| Sections épinglées | Galerie « Les derniers chantiers » : légende coupée de 6 px en 1280×720 (bloquant), titre, compteur et légendes coupés en 1024×640 et 1000×560. Bien en 1366, 1440, 1728, 1920 et 2560. Sommaires collants des pages légales et `.rangs__visuel` : bien. |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex sur 45 pages · X-Robots-Tag « noindex, nofollow » · robots.txt sans Disallow · og:image absolue et 1200×630, mais en 404 (domaine final) · ?v=20261027 identique partout · 404 personnalisée |

## Vérifications écartées

- **Pages manquantes dans les mesures** : les 3 pages `/servicetype/*` (Toiture, Façade, Isolation, présentes dans le menu) et les 32 fiches `/services/*` n'étaient pas mesurées. Je les ai mesurées en m320, m360, m390, m430, p1280, p1366, p1440 et g1920, avec des captures de 7 pages en m320, m390 et p1440 dans `captures/inv/` (planches `captures/inv/planche-*.jpg`). Résultat : HTTP 200 et noindex partout, aucune erreur JS, aucun débordement sur téléphone.
- **Débordement des fiches en 1280 et 1366** (scrollWidth supérieur à la largeur de 17 à 44 px) : la molette horizontale et les flèches laissent scrollX à 0, car le `overflow-x: clip` du body passe au viewport. Ce n'est pas un défaut visible : je l'ai classé en finition.
- **h1 entre 3,1 et 5 s sur l'accueil** dans les mesures par format : valeurs prises en parallèle. Les vidéos mesurées seules donnent 3,0 à 3,2 s, et je juge l'ouverture sur les bandes (≈ 3,5 s, classée en important et non en bloquant).
- **« MASQUÉ » sur /devis-gratuit et la 404** (p1280, p1366, p1440, g1920) : l'arrêt est au pied de page, et ce que l'en-tête replié recouvre a simplement défilé dessous. Ce n'est pas un contenu bloqué sous une barre.
- **Erreur 404 en console sur la page introuvable** : c'est la réponse 404 normale du document lui-même.
- **« unable to create webgl context »** sans WebGL : l'erreur est interceptée (`assets/js/pluie.js:102`) et le hero reste propre (`captures/accueil-p1440-sanswebgl-00.jpg`).
- **Compteur « 1 € » au lieu de « 0 € »** sur une capture m320 : l'animation du compteur était en cours, la valeur finale est bien 0 €.
- **Autres images Grok** (étapes 1 à 5, heroes toiture, façade, isolation, accueil, 18 vignettes de prestations) : je les ai regardées en taille réelle. Mains gantées correctes, aucun texte ni filigrane, lumière d'orage cohérente. Rien de bloquant.


---

## h-renovation-maquette : corrections de l'étape 2

Commit 1972932 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Légende de la galerie épinglée coupée en 1280×720, titre et compteur coupés en 1024×640 et 1000×560 | Bloquant | Méthode « Tout tenir dans l'écran » : bloc épinglé en 100svh et colonne flex, haut réservé par `--entete-h` (mesurée en JS, ResizeObserver), piste en `flex: 1; min-height: 0`, hauteur des images = place restante moins la légende (`--real-img-h`, mesurée à chaque refresh ScrollTrigger, plafond 720 px), largeur déduite du ratio 4/5 ou 5/4, épinglage `start: 'top top'`, palier `max-height: 700px` pour le titre | `assets/js/accueil.js`, `assets/js/main.js`, `assets/css/main.css` | 1000×560 : titre 48 px sous l'en-tête et image 27 px hors écran → ok ; 1024×640 : légende 41 px hors écran → ok ; 1280×720 : légende 6 px → ok ; ok aux 8 tailles, aussi en position stabilisée (Lenis immédiat, 1,5 s) à 5 %, 50 % et 95 % (preuve-avant/apres-galerie-*.jpg) |
| Ouverture lente : titre lisible vers 3,5 s | Important | Trait 0,45 s, décalage des lettres 0,025 s, pas de pause, volet 0,6 s, hero lancé au début du volet | `assets/js/accueil.js` | Titre du hero visible vers 2,1 s en 1440×900 et 1,9 s en 390×844 (mesure ponctuelle, première visite) |
| Barre mobile toujours visible, sur formulaires et pied de page | Important | IntersectionObserver : la barre n'apparaît qu'une fois le héros dépassé, se masque dès qu'un formulaire, `[data-devis]` ou le pied est à l'écran et quand le menu est ouvert (`inert` quand cachée) ; `--barres-h` mesurée en JS et réservée en bas du pied ; barre retirée de la 404 | `assets/js/main.js`, `assets/css/main.css`, `404.html` | Contrôlé au défilement sur l'accueil, /contact, /devis-gratuit, /a-propos, une fiche et la 404 : jamais visible sur formulaire ni pied ; aucun élément couvert par la barre de m320 à m430 |
| Textes de moins de 12 px sur téléphone | Important | Plancher `max(12px, …)` sur les règles concernées (sous-titre du logo, notes de maquette, titres du pied, badges, légendes, libellés de coordonnées, plaque des fiches, étapes du devis, mosaïque, filtres) ; étapes du devis sur 2 colonnes sous 480 px | `assets/css/main.css` | 41 → 0 par format téléphone et tablette |
| Cibles tactiles de moins de 44 px | Important | Sous 900 px : `min-height`/`min-width: 44px` en inline-flex sur logo, liens fléchés, Copier, numéros, fil d'Ariane, liens du pied et du sommaire, interrupteur, chips du diagnostic, liens des prestations ; case de consentement à 24 px | `assets/css/main.css` | 74 → 1 par format téléphone (reste la case de consentement, dont tout le libellé est cliquable) |
| og:image en 404 | Important | og:image des 45 pages vers `https://h-renovation-maquette.vercel.app/assets/img/og-h-renovation.jpg` ; rappel ajouté dans la liste de mise en ligne du README | 45 pages HTML, `README.md` | 404 → 200, JPEG 1200×630 |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Image de l'échafaudage (`service-isolation-thermique-exterieure-4x5.webp`) | Bloquant | Image Grok (à régénérer, consigne dans notes.json) |
| Accueil lourd sur grand écran (vidéos, srcset) | Finition | Finition |
| Image de l'atelier (sécateur), portrait de Samuel | Finition | Donnée manquante / image Grok |
| Décalages d'apparition hors écran sur les fiches (masqués par le clip) | Finition | Finition |
| Contraste de `.coord__ligne > span` sur chaux | Finition | Finition (texte désormais à 12 px) |
| Contenu « recouvert » par l'en-tête replié à l'arrêt du pied (/devis-gratuit, 404, p1280 à g1920) | — | Écarté dans le rapport : contenu qui a simplement défilé sous l'en-tête |
| Case de consentement de 24 px | — | Le libellé entier est cliquable ; agrandir la case dénaturerait le formulaire |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920, 10 pages) | 0 | 0 |
| Textes < 12 px (m320, m360, m390, m430, t820) | 41 par format | 0 |
| Cibles < 44 px (m320, m360, m390, m430, t820) | 74 par format | 1 (case de consentement) |
| Éléments couverts par la barre du bas (m320 à m430) | 0 | 0 |
| Éléments couverts par l'en-tête replié (p1280 / p1366 / p1440 / g1920) | 2 / 3 / 1 / 3 | 2 / 3 / 1 / 2 (écartés, voir plus haut) |
| Galerie épinglée 1000×560 | titre 48 px sous l'en-tête, image et vidéo 27 px hors écran | ok |
| Galerie épinglée 1024×640 | titre 8 px et compteur 3 px sous l'en-tête, légende 41 px hors écran | ok |
| Galerie épinglée 1280×720 | légende 6 px hors écran | ok |
| Galerie épinglée 1366, 1440, 1728, 1920, 2560 | ok | ok |
| Sommaires collants (pages légales) | ok | ok |
| Erreurs console | 404 du document de la page introuvable (normal) | identique, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 |
| og:image | 404 | 200 (1200×630) |

## Note proposée
Ancienne note 79/100 → nouvelle note 88/100 · bloquants restants : 1 (image Grok de l'échafaudage)
- Critère 1 : 12 → 13, l'intro ne retarde plus le titre au-delà de 3 s (environ 2 s).
- Critère 3 : 11 → 13, titre lisible plus tôt et galerie épinglée qui tient aux petites hauteurs.
- Critère 5 : 10 → 14 (harmonisé : pas de 15 sur les formats), légende 1280×720, coupes 1000×560, textes 12 px, cibles 44 px et barre mobile corrigés.
- Critère 8 : 4 → 5, og:image répond en 200.
- Critère 9 : 4 → 5, petits textes et petites cibles corrigés.

## Images Grok définitives (29/10)

Commit fb1da1b (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| service-isolation-thermique-exterieure-4x5.webp | échafaudage écarté du mur, sans garde-corps | 4:5 centré sur la maison (y 80 → 1060), 784×980 sans agrandissement ; width/height corrigés (étaient 1200×1500 sur la fiche, 800×500 sur la carte) | « Maison sous échafaudage, panneaux isolants blancs chevillés sur une partie de la façade, ciel d’orage au crépuscule » | /servicetype/isolation et /services/isolation-thermique-exterieure, 5 formats : net, 0 erreur, 0 404, CLS 0 |
| atelier-outils-4x5-800.webp | image avec sécateur de jardin | 4:5 centré sur les outils (y 170 → 1150), 800×1000 (agrandi 1,02×, accentuation légère) | « Outils de couvreur sur un rebord d’ardoise mouillé : marteau, tire-clou, cordeau, mètre pliant, gants de cuir et ardoises » (était vide) | accueil et /a-propos, 5 formats : net, mention « Portrait à fournir : portrait-samuel » conservée, 0 erreur, CLS ≤ 0,014 |

Note : 88/100 → 89/100 (critère 2 +1, échafaudage refait) · bloquants : 1 → 0 · Prête à envoyer. Reste à fournir par le client : le portrait de Samuel.
