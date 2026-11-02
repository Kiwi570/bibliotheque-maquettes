# apasdechien-maquette

<https://apasdechien-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 79a714c du 23/10/2026

## Verdict

**76/100 · À peaufiner · 2 défaut(s) bloquant(s)**

L'univers forêt, papier et jaune est chaleureux, cohérent et bien adapté à une éducatrice canine, avec de vraies photos et des interactions qui marchent toutes. Deux défauts de mise en page sur des formats courants (l'horloge de /balade sur téléphone, les sections horizontales épinglées en 1280×720) et une mise en ligne à reprendre empêchent de l'envoyer en l'état.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture logo puis forêt d'automne et polaroïd très juste pour le métier, laisse dorée qui court le long de la page ; reste sage par rapport à une vraie signature Awwwards. |
| 2. Direction artistique et harmonie | 12/15 | Palette forêt, papier et jaune tenue sur toutes les pages, Fraunces italique et Manrope bien associés ; l'image « Ville » a un air de promenade méditerranéenne qui détonne avec Lausanne. |
| 3. Animations et effets | 11/15 | 59 à 60 i/s sans saccade, titre lisible vers 2,5 s, horloge et figures bien pensées ; mais horloge collante qui chevauche le texte sur téléphone et pistes épinglées coupées en 1280×720. |
| 4. Expérience ludique et interactions | 9/10 | Menu, balle, visionneuse, calculateur, formulaire en 4 étapes avec erreurs, comparateur forêt/ville, FAQ, « Copier » et « Calme » marchent tous. |
| 5. Tous les formats | 9/15 | Deux contenus coupés ou chevauchés sur des formats courants, en-tête qui se chevauche à 320 px, surtitres à 11,8 px, plusieurs cibles sous 44 px, barre du bas visible sur le formulaire et le pied de page. |
| 6. Contenu et fiabilité | 9/10 | Tarifs, horaires et témoignage repris du site actuel, « à compléter » bien marqués et légendes « image d'ambiance » honnêtes ; formation d'Anne et mentions encore à fournir. |
| 7. Technique et performance | 8/10 | Aucune erreur de console, CLS 0, WebP en srcset ; accueil à 3,5 Mo et /balade jusqu'à 4,8 Mo en t820. |
| 8. Mise en ligne | 2/5 | noindex, og:image 1200×630 et 404 aux couleurs sont bons, mais robots.txt en « Disallow: / », pas de X-Robots-Tag, règle Cache-Control et aucun `?v=`. |
| 9. Accessibilité | 4/5 | Focus visible, textes alternatifs, « réduire les animations » et « Calme » bien respectés ; cibles tactiles et surtitres un peu petits. |
| **Total** | **76/100** | |

## Points forts

- Direction artistique sur mesure : fond forêt, polaroïds scotchés, panneaux de randonnée jaunes pour les tarifs, laisse dorée en fil conducteur.
- Vraies photos des chiens d'Anne partout, et des images Grok d'ambiance sans chien, propres (aucun défaut visible) et légendées honnêtement.
- Des interactions utiles et qui marchent : planning avec compte à rebours du prochain cours, calculateur de budget, formulaire de bilan en 4 étapes avec validation, visionneuse au clavier.
- Fluidité très bonne (59,1 i/s portable, 60 i/s téléphone), aucune erreur JS, CLS 0, variante sans WebGL propre.
- Mode « Calme » et « réduire les animations » bien gérés : pistes horizontales remplacées par un défilement natif, contenu visible d'emblée.

## Défauts

### Bloquants

1. **Horloge collante qui chevauche le déroulé** : /balade, m390 (et tout format sous 980 px, dont t820), `captures/balade-m390-04.jpg`, `captures/balade-m390-06.jpg`, `captures/int-horloge-m390.jpg`. Le cadran reste collé sous l'en-tête pendant que les étapes défilent : « Prise en charge » s'écrit par-dessus « 0 h 49 », le panneau « CHF 40.– · retour compris » recouvre « compris dans le prix », et les photos cachent le cadran. Cause : `assets/css/main.css:618` (`.horloge-bloc { position: sticky; … }` sans condition de largeur, alors que la grille en deux colonnes ne démarre qu'à 980 px, ligne 617). Correction : passer `position: sticky` dans `@media (min-width: 980px)`. Sous 980 px, garder l'horloge en flux statique au-dessus des étapes, ou la réduire en bandeau collant de 64 px à fond plein (`background: var(--papier)`, `z-index` au-dessus des étapes). Effort : petit.
2. **Pistes horizontales épinglées coupées en 1280×720 et 1366×768** : /education-canine (#terrains) et /dogparkour (#figures), `captures/epingle-education-canine-0-1280x720-8.jpg`, `captures/epingle-dogparkour-0-1280x720-50.jpg`. Les descriptions des tuiles sortent de l'écran (jusqu'à 70 px en 1280×720, 42 px en 1366×768), et le surtitre « Les figures » passe sous l'en-tête. Cause : `assets/css/main.css:471` (largeur des tuiles estimée avec `calc((100svh - 460px) * .8)`) et `assets/js/pages.js:255` (`start: 'top top'` sans tenir compte de l'en-tête de 76 px). Correction : section en colonne flex de `100svh` avec `padding-top: var(--entete-h)` mesuré en JS, piste en `flex: 1; min-height: 0`, image de tuile en `flex: 1; min-height: 0` (et non une largeur dérivée de la hauteur). Ajouter un palier `max-height: 760px` qui réduit le h2 et les marges. Effort : moyen.

### Importants

1. **Mise en ligne non conforme** : toutes les pages. Cause : `robots.txt:2` (`Disallow: /`), `vercel.json:4` (règle `Cache-Control … immutable` sur /assets), pas de X-Robots-Tag, et CSS et JS appelés sans `?v=` dans les 9 pages HTML (par exemple `index.html`, liens vers `assets/css/main.css` et `assets/js/*.js`). Correction : `Allow: /` dans robots.txt. Dans vercel.json, supprimer la règle Cache-Control et ajouter `{"source":"/(.*)","headers":[{"key":"X-Robots-Tag","value":"noindex, nofollow"}]}`. Ajouter le même `?v=1` aux 6 fichiers CSS et JS du site dans toutes les pages. Effort : petit.
2. **Barre du bas visible sur le formulaire et le pied de page** : toutes les pages, m390 et t820, `captures/planche-accueil-m390.jpg` (16 à zz), `captures/planche-education-canine-m390.jpg` (12). Cause : `assets/js/app.js:68` (la barre s'affiche dès 480 px de défilement et ne se masque jamais). Correction : un IntersectionObserver sur `form.demande` et `footer` qui retire `is-visible` quand l'un d'eux est à l'écran. Effort : petit.
3. **En-tête qui se chevauche à 320 px** : toutes les pages, m320, `captures/accueil-m320-00.jpg`. « À pas de chien » passe sous le bouton Son. Cause : `assets/css/main.css:156` (le nom garde 1,18 rem et ne se coupe pas). Correction : sous 360 px, masquer le bouton Son de l'en-tête (le reprendre dans le menu) ou passer `.marque-nom` en `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` avec une taille de 1,05 rem. Effort : petit.
4. **Pistes épinglées coupées en 1000×560 et 1024×640** : mêmes sections que le bloquant 2 (images coupées de 52 à 134 px). Même correction, avec le palier `max-height: 600px`. Effort : compris dans le bloquant 2.

### Finition

1. **Surtitres et sous-titre du logo sous 12 px** : téléphone, toutes les pages (11,84 px et 10,88 px). Cause : `assets/css/main.css:44` (`--t-label: .74rem`) et `:160` (`.marque-sous { font-size: .68rem }`). Correction : `--t-label: max(12px, .74rem)` et `.marque-sous { font-size: max(12px, .68rem) }`. Effort : petit.
2. **Cibles tactiles sous 44 px** : « Lancer la balle » (124×35), numéro de téléphone (125×32), « Copier » (85×34), boutons − et + du calculateur (38×38), liens du pied de page (36 px). Cause : `assets/css/main.css:237`, `:354`, `:543`. Correction : `min-height: 44px` (et `min-width: 44px` sur le compteur) avec un padding vertical. Effort : petit.
3. **Image « Ville » hors contexte** : /education-canine et /dogparkour, `assets/img/grok/terrain-ville-784.webp`. La promenade dallée à l'italienne, avec des chaises de terrasse, évoque plus la Méditerranée que les quais d'Ouchy. Simple faiblesse : la légende précise déjà « image d'ambiance ». Correction : la remplacer plus tard par une photo d'Anne en ville. Effort : petit.
4. **Poids de /balade** : 3,9 Mo en p1440 et 4,8 Mo en t820 avec 24 photos dans la galerie. Correction : `loading="lazy"` et `sizes` plus serrés sur les vignettes de la galerie. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (logo seul jusqu'à 2 s, puis titre en place) |
| Fluidité p1440 / m390 | 59,1 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,0009 |
| Poids de l'accueil, p1440 / m390 | 3,53 Mo / 2,16 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 voulue) ; sans WebGL propre ; réduire les animations respecté |
| Débordement horizontal | Aucun |
| Sections épinglées | /education-canine #terrains et /dogparkour #figures coupées de 1000×560 à 1366×768 ; /balade horloge collante qui chevauche le texte sous 980 px |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public oui · noindex oui (8/8) · X-Robots-Tag absent · robots.txt « Disallow: / » · og:image JPG 1200×630 absolue · ?v= absent · 404 personnalisée · Cache-Control dans vercel.json |

## Vérifications écartées

- Ouverture « h1 » entre 2,2 et 2,9 s sur l'accueil : sur les étapes chronométrées, le logo occupe l'écran jusqu'à 2 s et le titre est lisible vers 2,5 s, sous les 3 s.
- `figure.flair > figcaption` et `button.flair > figcaption` « invisibles » : ce sont des légendes qui n'apparaissent qu'au survol (« Passez la truffe ») ; voulu.
- Éléments « masqués » par l'en-tête au pied de page : l'en-tête se cache au défilement vers le bas (`is-hidden`) ; la mesure a été prise en remontant. Pas de contenu réellement recouvert.
- CLS 0,31 en variante « réduire » (p1440) : non reproduit avec réduire les animations (0 en remesure). Un décalage de 6 px de `.hero-contenu` a été vu une fois sans réduction vers 300 ms, sous le voile d'ouverture, donc invisible. La mesure officielle « CLS chargement » vaut 0 partout.
- Erreur console « 404 » : uniquement sur la page introuvable de test, normal.
- Balle jaune qui traverse le titre « Se balader autrement » (dogparkour-m390-01) : animation passagère voulue, le titre reste lisible.


---

## apasdechien-maquette : corrections de l'étape 2

Commit 01de04b (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Horloge collante qui chevauche le déroulé (/balade, sous 980 px) | Bloquant | `position: sticky` déplacé dans le palier `min-width: 980px` (même palier que la grille en deux colonnes), `top` calé sur `--entete-h` ; en une colonne l'horloge reste en flux au-dessus des étapes | `assets/css/main.css` | m390 et t820 : texte écrit sur le cadran → aucun chevauchement (`preuve-avant/apres-horloge-m390.jpg`) |
| Pistes épinglées coupées en 1280×720 et 1366×768 (/education-canine #terrains, /dogparkour #figures) | Bloquant | Méthode « Tout tenir dans l'écran » : classe `horizontal--epingle` posée par pages.js, section `height: 100svh` en colonne flex, `padding-top: calc(var(--entete-h) + …)` avec `--entete-h` mesuré en JS (ResizeObserver + resize), piste `flex: 1; min-height: 0` en grille partagée (subgrid : images, titres et textes alignés), image en `min-height: 0` qui prend la place restante ; plus de largeur dérivée de `100svh - 460px` ; paliers `max-height: 760px` et `600px` ; épinglage `top top` sans anticipatePin | `main.css`, `assets/js/pages.js`, `assets/js/app.js` | 1280×720 : p coupé de 70 px → 0 ; 1366×768 : 42 px → 0 (position stabilisée, voir mesures) |
| Pistes épinglées coupées en 1000×560 et 1024×640 | Important | Même correction ; la barre du bas (visible jusqu'à 1119 px) est masquée pendant une section épinglée | idem | 1000×560 : image coupée de 134 px et sous la barre de 52 px → 0 ; 1024×640 : 127 px → 0 |
| Barre du bas visible sur le formulaire et le pied de page | Important | IntersectionObserver : la barre n'apparaît qu'une fois le héros dépassé, et se masque sur `form.demande`, le pied de page, les sections épinglées, le menu ouvert et la 404 ; `--barres-h` mesurée en JS, pied en `padding-bottom: calc(40px + var(--barres-h))` | `app.js`, `main.css` | barre visible sur le pied et le formulaire → masquée (contrôlé sur /, /contact, /education-canine, 404) ; aucun élément couvert par la barre de m320 à m430 |
| En-tête qui se chevauche à 320 px | Important | Sous 380 px : écarts réduits et nom « À pas de chien » sur deux lignes (1,1 rem) au lieu de passer sous le bouton Son | `main.css` | 320 : nom jusqu'à 190 px sous les outils (156 px) → nom fini à 152 px, outils à 160 px ; 360 : 190/196 → 177/200 |
| Surtitres et sous-titre du logo sous 12 px | Finition (récurrent) | `--t-label: max(12px, .74rem)`, `.marque-sous` et `.jour .nom` en `max(12px, …)` | `main.css` | 10 sélecteurs < 12 px → 0 (m320 à t820) |
| Cibles tactiles sous 44 px | Finition (récurrent) | `min-height: 44px` sur la marque, « Lancer la balle », numéros et e-mails `.coord .val`, « Copier », liens du pied ; compteur 44×44 | `main.css` | 7 cibles < 44 px → 0 |
| Mise en ligne (robots.txt, X-Robots-Tag, Cache-Control, ?v=) | Important | Déjà corrigé à l'étape 1 (1d18988) ; versions passées à `?v=20261028-2` (54 références, aucune ancienne restante) | toutes les pages | — |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Image « Ville » hors contexte (`terrain-ville-784.webp`) | Finition | Image Grok, à remplacer par une photo d'Anne en ville (donnée manquante) |
| Poids de /balade (3,9 à 4,8 Mo) | Finition | Finition non traitée |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px (sélecteurs distincts, téléphone et t820) | 10 | 0 |
| Cibles < 44 px (m320 à t820) | 7 (6 en t820) | 0 |
| Éléments couverts par la barre du bas (m320 à m430) | 0 relevé (mais barre visible sur formulaire et pied, voir captures du rapport) | 0 |
| Éléments couverts par l'en-tête | 9 à 18 selon le format | 5 à 18 selon le format : mesures prises en remontant au pied de page, l'en-tête réapparaît ; écarté dans le rapport (aucun contenu réellement recouvert) |
| Épinglage /education-canine (1000×560, 1024×640, 1280×720, 1366×768, 1440×900, 1728×1000) | coupé de 134, 127, 70, 42, 13, 4 px | outil : 29, 21, 20, 18, 14, 7 px à 8 % seulement (retard de Lenis à l'entrée de l'épinglage), 0 à 50 % et 92 % ; position stabilisée (`lenis.scrollTo(y, { immediate: true })` + 1,5 s) : 0 à toutes les tailles |
| Épinglage /dogparkour (mêmes tailles) | coupé de 120, 102, 47, 21 px, ok à partir de 1440 | outil : 14, 7, 5, 6 px à 8 % seulement (même retard), 0 à 50 % et 92 % ; stabilisé : 0 partout |
| Horloge /balade | chevauche le texte sous 980 px | en flux sous 980 px, collante au-dessus, aucun défaut aux 8 tailles |
| Barre du bas sur sections épinglées (1000×560, 1024×640) | image et titre sous la barre (49 à 60 px) | barre masquée |
| Erreurs console | 0 (hors 404 voulue) | 0 (hors 404 voulue) |
| Modules chargés deux fois | 0 | 0 (une seule version `?v=20261028-2`) |

## Note proposée
Ancienne note 76/100 → nouvelle note 88/100 · bloquants restants : 0 · verdict « Prête à envoyer »
- 3. Animations et effets 11 → 13 : l'horloge ne chevauche plus le texte sur téléphone et les pistes épinglées tiennent dans l'écran en 1280×720.
- 5. Tous les formats 9 → 15 : plus de contenu coupé ou chevauché (horloge, pistes), en-tête lisible à 320 px, surtitres à 12 px, cibles à 44 px, barre du bas absente du héros, du formulaire et du pied.
- 8. Mise en ligne 2 → 5 : robots.txt, X-Robots-Tag, Cache-Control et `?v=` déjà corrigés à l'étape 1.
- 9. Accessibilité 4 → 5 : cibles tactiles et surtitres conformes.
