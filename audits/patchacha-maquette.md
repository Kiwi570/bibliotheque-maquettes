# patchacha-maquette

<https://patchacha-maquette.vercel.app> · audit du 28/10/2026 · dernier commit aa1df0e du 25/10/2026

## Verdict

**80/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Direction « couches et effacements » très juste pour une plasticienne : voile de papiers déchirés à l'ouverture, salle d'accrochage horizontale à l'échelle réelle, essai « voir au mur » calé en centimètres, contenus sourcés et interactions qui marchent toutes. Un titre épinglé qui passe sous l'en-tête de 1280 à 1728 px, un CLS au-dessus de 0,1 sur ordinateur et une mise en ligne incomplète empêchent de l'envoyer en l'état.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture papiers et signature dessinée, puis cadre suspendu : élégant et propre au métier, mais la page reste calme et l'effet signature (salle horizontale) n'existe pas sur téléphone. |
| 2. Direction artistique et harmonie | 13/15 | Palette papier, encre et rouge tenue partout, Gloock et Instrument Sans très bien associés, images Grok homogènes et sans défaut ; en-tête téléphone mal aligné et logo pâle. |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, titre lisible à 2 s, titres à l'encre et voile entre couches réussis, mais le titre épinglé « Une peinture de la lenteur » passe sous l'en-tête et le cadre du héros fait sauter la page au chargement. |
| 4. Expérience ludique et interactions | 9/10 | Menu, filtres et tri, panier, commande simulée, loupe, miniatures, voir au mur (pièces et lumière), newsletter, contact, Copier et Mode calme fonctionnent tous et se comprennent seuls. |
| 5. Tous les formats | 11/15 | Aucun débordement horizontal, mais titre coupé par l'en-tête en 1280, 1366, 1440 et 1728, contenus qui sortent de l'écran à 1000×560 et 1024×640, en-tête téléphone et tablette décentré. |
| 6. Contenu et fiabilité | 9/10 | Œuvres, prix, avis, dates et −10 % repris du site actuel (vérifié), « à compléter » bien marqué, expositions passées au passé, compte à rebours juste ; rien d'inventé repéré. |
| 7. Technique et performance | 7/10 | Aucune erreur JS ni lien cassé, version sans WebGL propre, mais CLS 0,11 à 0,12 sur ordinateur (0,56 avec « réduire les animations ») et accueil à 4,5 Mo. |
| 8. Mise en ligne | 3/5 | Public, noindex dans chaque page, og:image JPG 1200×630 absolue, 404 aux couleurs ; X-Robots-Tag absent de vercel.json et aucun ?v= sur le CSS et le JS du site. |
| 9. Accessibilité | 4/5 | Focus visible, lien d'évitement, alt partout, Mode calme et « réduire les animations » respectés ; quelques textes à 11,5 px et liens isolés sous 44 px sur téléphone. |
| **Total** | **80/100** | |

## Points forts

- Ouverture signature : papiers faits main déchirés, monogramme tracé à l'encre, puis cadre qui tombe avec un rebond, titre lisible à 2 s.
- Salle d'accrochage horizontale (accueil et page Tableaux) : œuvres à leur taille réelle, sur une même ligne, pastille rouge des œuvres vendues, comme en galerie.
- « Voir l'œuvre chez soi » : salon, bureau et alcôve calés en centimètres, curseur de lumière matin-soir, choix de l'œuvre ; idée forte et utile pour vendre.
- Contenu sérieux : 37 œuvres relevées sur le site actuel, avis, expositions triées à venir ou passées, carte des rendez-vous, « à compléter » visible.
- Parcours d'achat simulé complet (panier, tiroir, commande, message clair « aucune commande n'est envoyée »).
- Fluidité parfaite (59,9 i/s portable et téléphone, aucune image > 50 ms), Mode calme qui remet une mise en page statique propre.

## Défauts

### Bloquants

1. **Titre « Une peinture de la lenteur » caché sous l'en-tête pendant l'épinglage** : accueil, 1280×720, 1366×768, 1440×900 et 1728×1000 (h2 masqué de 37 à 76 px ; à 1366 le dernier paragraphe sort aussi de 13 px), `captures/epingle-accueil-0-1440x900-50.jpg`, `captures/epingle-accueil-0-1280x720-8.jpg`, `captures/accueil-p1440-02.jpg`. Cause : `assets/js/accueil.js:121`, `ST.create({ trigger: grille, start: 'top top', … pin: true })` épingle la grille à 0 px alors que l'en-tête fixe fait 76 px (`assets/css/style.css:107`) ; `assets/css/style.css:223` donne en plus `min-height: 86vh` à la grille. Correction : mesurer la hauteur de l'en-tête en JS (`--entete-h`), `start: () => 'top ' + enteteH` (ou `padding-top: var(--entete-h)` sur la grille épinglée), grille en `height: calc(100svh - var(--entete-h))` en colonne flex, pile d'images en `flex: 1; min-height: 0`. Effort : petit.

### Importants

1. **CLS au chargement 0,11 à 0,12 sur ordinateur, 0,56 avec « réduire les animations »** : accueil, p1280, p1366, p1440 (remesuré seul : 0,111 en 1440, 0,123 en 1280, 0,557 en réduit). Cause : le cadre du héros est injecté par JS (`assets/js/accueil.js:55-61`, `[data-heros-cadre]` vide dans `index.html:88`) ; `.heros__oeuvre` passe de 90 à 630 px de haut et pousse le texte et la section suivante (`assets/css/style.css:177` sans hauteur réservée). Correction : réserver la place (`.heros__scene { aspect-ratio: 4 / 5; }` ou `min-height` calculée sur l'œuvre) ou écrire le cadre en HTML. Effort : petit.
2. **En-tête téléphone et tablette décentré** : toutes les pages, m320 à t820 (boutons Calme, Panier, Menu au milieu, vide à droite), `captures/accueil-m390-00.jpg`, `captures/404-m390-00.jpg`. Cause : `assets/css/style.css:118`, `.nav + .outils { margin-left: 18px; }` écrase `margin-left: auto` de `.outils` même quand `.nav` est masquée. Correction : déplacer cette règle dans `@media (min-width: 1080px)`. Effort : petit.
3. **Contenus qui sortent de l'écran sur petit portable** : 1000×560 et 1024×640 ; accueil, pile d'images de la lenteur coupée de 46 à 94 px (`captures/epingle-accueil-0-1000x560-50.jpg`) ; Tableaux, lien « accroche » des salles hors écran de 44 à 123 px (`captures/epingle-tableaux-0-1000x560-8.jpg`) ; fiche œuvre, légende de la visionneuse collante coupée (`captures/epingle-oeuvre-0-1024x640-8.jpg`). Cause : `assets/css/style.css:231` (`width: min(100%, 68vh)` sans tenir compte de l'en-tête), hauteurs de salle fixes. Correction : palier `@media (max-height: 680px)` qui réduit titres, marges et pile ; hauteurs en `100svh - var(--entete-h)`. Effort : moyen.
4. **X-Robots-Tag absent** : `vercel.json` ne contient que `cleanUrls` et `trailingSlash`, aucun en-tête `X-Robots-Tag` dans la réponse HTTP. Correction : bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)`. Effort : petit.
5. **Aucun ?v= sur le CSS et le JS du site** : `style.css`, `core.js`, `data-oeuvres.js`, `data-site.js`, `accueil.js`, `galerie.js`, `oeuvre.js` appelés sans version dans les 3 pages et la 404. Correction : ajouter le même `?v=` partout et le changer à chaque modification. Effort : petit.

### Finition

1. **Textes sous 12 px sur téléphone** : sous-titre du logo, « 50 cm » et légende d'échelle de « voir au mur », noms des œuvres dans le sélecteur (10,6 px), « Matin / Midi / Soir », étiquette « À venir », légende de l'ouverture de la galerie (11,5 px). Cause : `var(--t-xs)` trop petit sur mobile. Correction : `font-size: max(12px, …)` sur ces éléments. Effort : petit.
2. **Liens isolés sous 44 px sur téléphone** : « Découvrir l'histoire de cette œuvre » (26 px), « Voir toutes les œuvres », « Passer la visite », « Voir la fiche », fil d'Ariane, liens du pied de page, curseur de lumière (16 px). Correction : `min-height: 44px` (padding ou pseudo-élément) sur ces liens et sur le `input[type=range]`. Effort : petit.
3. **Logo téléphone petit et pâle** : le monogramme fin disparaît presque sur le fond papier (`captures/accueil-m390-00.jpg`). Correction : version plus contrastée du monogramme sous 560 px ou garder le nom « Patchacha » en texte. Effort : petit.
4. **Images Grok en 1168 px affichées en plein écran** : pied de page (brume), salles de la galerie, fond des expositions agrandis environ 1,6 fois en 1920 px, légèrement mous. Correction : exporter ces fonds en 2400 px (WebP), servis par `srcset`. Effort : petit.
5. **Pas de barre d'action fixe en bas sur téléphone** : le panier est en haut, mais aucune barre « Voir les tableaux / Écrire à l'artiste » en bas. Correction : barre fixe masquée sur le formulaire et le pied de page. Effort : moyen.
6. **Salle horizontale absente sur téléphone** : remplacée par une liste verticale ; l'effet signature n'existe que sur ordinateur. Correction : glissement horizontal tactile (scroll-snap) avec les mêmes cartels. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2 s / 2,5 s (voile de papiers puis titre ; h1 dans le DOM à 0,2 s) |
| Fluidité p1440 / m390 | 59,9 i/s / 59,9 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,123 (p1280) ; 0,557 avec « réduire les animations » en p1440 ; 0 sur téléphone |
| Poids de l'accueil, p1440 / m390 | 4,47 Mo / 4,02 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS (seul le 404 attendu de la page 404) ; sans WebGL propre ; réduit propre mais CLS 0,56 |
| Débordement horizontal | Aucun, sur les 9 formats et les 4 pages |
| Sections épinglées | Lenteur (accueil) : h2 sous l'en-tête de 1280 à 1728 ; salles (accueil, Tableaux) : seul le fond passe sous l'en-tête, contenus hors écran à 1000×560 et 1024×640 ; visionneuse œuvre : légende coupée à 1000×560 et 1024×640 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public oui · noindex, nofollow dans les 3 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v= absent partout · 404 personnalisée |

## Vérifications écartées

- « INVISIBLES figcaption » (accueil p1280 à g1920, sans WebGL) : ce sont les légendes des couches 2 et 3 de la pile de la lenteur, masquées tant que leur image n'est pas affichée ; elles apparaissent bien à leur tour (`captures/epingle-accueil-0-1440x900-50.jpg`).
- Décalages de 0,8 à 0,99 sur `IMG.salle__fond` : produits par l'épinglage et la translation de la salle pendant le défilement, pas du CLS de chargement.
- `img.salle__fond` « sous l'en-tête » et « sort de l'écran » en 1280 à 2560 : image de fond décorative de la salle, aucun texte ni cartel concerné.
- Fin de l'avis d'Anne floue (`captures/accueil-t820-08.jpg`, m390-11) : capture prise pendant le fondu « encre » (1,2 s, `once: true`), qui se termine net.
- Éléments « MASQUÉ » par l'en-tête (lien « Aller au contenu », liens du pied) : lien d'évitement volontairement masqué, et liens du pied mesurés pendant le défilement sous l'en-tête collant, accessibles en position normale.
- Erreur « Failed to load resource 404 » : uniquement sur la page introuvable de test, réponse 404 attendue.
- Image « rouleau d'écoprint » avec vapeur : cohérente avec la cuisson vapeur de l'écoprint, aucun défaut visible.


---

## patchacha-maquette : corrections de l'étape 2

Commit abdd9cf (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Titre « Une peinture de la lenteur » sous l'en-tête pendant l'épinglage (1280 à 1728) | Bloquant | `--entete-h` mesurée en JS (ResizeObserver) ; grille épinglée en `height: 100svh` + `padding-top: var(--entete-h)`, pile d'images calée sur la hauteur restante ; paliers `max-height: 940px` et `680px` qui resserrent titres et étapes | `assets/css/style.css`, `assets/js/core.js` | h2 masqué de 37 à 76 px → 0 aux 8 tailles ; texte qui sortait de 13 px à 1366 → 0 (`preuve-*-lenteur-*`) |
| CLS 0,11 à 0,12 sur ordinateur, 0,56 en réduit | Important | Place du cadre réservée (`.heros__lien:empty`, 50/40, largeur identique au calcul JS via `cqw`) et du cartel | `style.css` | p1280 0,123 → 0,002 ; p1440 0,110 → 0,002 ; réduit 0,534 → 0,003 ; t820 0,286 → 0 |
| En-tête téléphone et tablette décentré | Important | `.nav + .outils { margin-left: 18px }` déplacé dans `@media (min-width: 1080px)` | `style.css` | boutons au milieu → calés à droite, de m320 à t820 (`preuve-*-entete-m390`) |
| Contenus hors écran à 1000×560 et 1024×640 | Important | Lenteur : voir plus haut ; salles de Tableaux : échelle minimale 3 → 1,6 px/cm et en-tête de salle resserré sous `max-height: 680px` ; visionneuse collante : `top` et `max-height` calés sur `--entete-h`, colonne flex, image contenue dans son cadre | `style.css`, `assets/js/galerie.js` | accroche de Tableaux hors écran 123 / 44 px → 0 ; légende de la visionneuse hors écran 16 à 36 px → 0 à 0,08 et 0,5 |
| X-Robots-Tag absent, aucun ?v= | Important | Déjà corrigé à l'étape 1 (vérifié : `vercel.json` porte X-Robots-Tag) ; versions passées à `?v=20261028-2` | 4 pages HTML | grep `v=20261028[^-]` vide |
| Textes sous 12 px sur téléphone (récurrent) | Finition | Variable `--t-mini: max(12px, .75rem)` à la place des 16 tailles .66 à .75 rem ; texte de la carte des rendez-vous à 12 px | `style.css` | 1 à 10 textes par page → 0 sur tous les formats |
| Liens isolés et curseur sous 44 px (récurrent) | Finition | Sous 900 px : liens isolés en `inline-block`, `min-height: 44px` (soulignement replacé), fil d'Ariane, liens du pied, e-mail, curseur de lumière à 44 px | `style.css` | 3 à 10 cibles par page → 1 (« CGV », 26×44) |
| Pas de barre d'action fixe en bas sur téléphone (récurrent) | Finition | Barre « Voir les tableaux » (ou « Voir toutes les œuvres » sur Tableaux) + « Écrire à l'artiste », libellés et liens déjà présents ; visible après le héros, masquée sur formulaires, pied, menu, panier et 404 ; `--barres-h` mesurée, pied et notification décalés | `core.js`, `style.css` | 0 élément couvert de m320 à m430 ; testé : haut caché, milieu visible, formulaires, menu, panier, pied cachés (`preuve-apres-barre-bas-m320`) |
| `anticipatePin` sur les salles | Méthode | Retiré (accueil et Tableaux) | `accueil.js`, `galerie.js` | aucun saut constaté |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Logo téléphone petit et pâle | Finition | finition (version du monogramme à fournir) |
| Images Grok 1168 px agrandies en 1920 | Finition | image Grok |
| Salle horizontale absente sur téléphone | Finition | finition (effort moyen) |
| Accueil à 4,5 Mo | Important (c7) | effort gros |
| Lien « CGV » du pied 26 px de large | Finition | finition (hauteur déjà à 44 px) |
| Petites œuvres très réduites dans les salles à 1000×560 | Finition | conséquence de l'échelle réelle commune ; tient désormais dans l'écran |
| Visionneuse à 0,92 de sa plage (1000 à 1366) : image « sous l'en-tête » | — | fin normale du collage : la colonne se termine et la visionneuse remonte avec elle (capture vérifiée), pas une coupe pendant le collage |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats, 4 pages) | aucun | aucun |
| Textes < 12 px (m320 à t820) | accueil 8 à 10, œuvre 5, Tableaux 2, 404 1 | 0 partout |
| Cibles < 44 px (hors lien d'évitement) | accueil 8 à 10, œuvre 7, Tableaux 5 à 6, 404 3 | 1 (« CGV ») |
| Éléments couverts par la barre du bas | sans objet | 0 (m320 à m430) |
| CLS de chargement accueil p1280 / p1366 / p1440 / t820 | 0,123 / 0,118 / 0,110 / 0,286 | 0,002 / 0,002 / 0,002 / 0 |
| CLS réduire les animations p1440 | 0,534 | 0,003 |
| Lenteur épinglée (8 tailles) | h2 sous l'en-tête de 1000 à 1920, texte et image hors écran à 1000, 1024, 1366 | rien de coupé aux 8 tailles |
| Salles accueil et Tableaux | accroche hors écran 123 px (1000×560), 44 px (1024×640) | rien de coupé (hors fond décoratif) |
| Visionneuse œuvre | légende hors écran 16 à 36 px, image hors écran 29 px | ok à 0,08 et 0,5 ; seule la fin de collage à 0,92 |
| Erreurs console | seul le 404 attendu | seul le 404 attendu |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 80/100 → nouvelle note 90/100 · bloquants restants : 0
- c2 13 → 14 : en-tête téléphone réaligné (logo pâle restant).
- c3 12 → 14 : titre épinglé plus caché, cadre du héros qui ne fait plus sauter la page.
- c5 11 → 14 : titre coupé, contenus hors écran à 1000×560 / 1024×640 et en-tête décentré corrigés (jamais 15).
- c7 7 → 8 : CLS corrigé ; poids de 4,5 Mo restant.
- c8 3 → 5 : X-Robots-Tag et ?v= traités à l'étape 1.
- c9 4 → 5 : textes à 12 px et liens à 44 px sur téléphone.
- c1, c4, c6 inchangés.
