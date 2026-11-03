# gwenanou-print-maquette

<https://gwenanou-print-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 9e53a71 du 27/10/2026

## Verdict

**81/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Une maquette très juste pour un atelier de gravure laser : le prénom gravé en direct, la planche de noyer de l'ouverture et les six matières épinglées donnent un vrai effet signature, et tout fonctionne (simulateur, panier, devis en 5 étapes). Un seul blocage : la galerie collante de la fiche « Arbre de vie » dépasse l'écran sur les portables 1280×720 et 1366×768.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture où le laser grave « Gwenanou » dans le noyer, puis le prénom de l'internaute gravé en direct dans le héros : original et en plein dans le métier. |
| 2. Direction artistique et harmonie | 12/15 | Palette noyer, lin et cuivre cohérente, Fraunces avec Instrument Sans bien hiérarchisées ; les photos de l'atelier sont inégales et deux visuels sonnent provisoires (étagère en aplats, tracé vectoriel bruité). |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, matières épinglées avec textures et étincelle, portrait révélé en lanières, pied de page incandescent ; galerie collante de la fiche mal bornée. |
| 4. Expérience ludique et interactions | 9/10 | Gravure du prénom, simulateur matière, écriture et texte, filtres, panier, décompte de Noël, devis en 5 étapes avec validation, « Voir chez vous » au clavier et visionneuse : tout répond. |
| 5. Tous les formats | 10/15 | Aucun débordement horizontal, mais vignettes et légende de la galerie coupées en 1280×720 et 1366×768, cartes « occasions » trop courtes en 1000×560, interrupteur fixe qui recouvre le texte sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Aucun avis ni chiffre inventé, prix issus de la boutique SumUp, « à compléter » partout où il faut, mentions légales en boîte de dialogue. |
| 7. Technique et performance | 9/10 | Zéro erreur de console, CLS ≤ 0,004, polices attendues avant la gravure ; accueil assez lourd en tablette et grand écran (3,6 et 4,0 Mo). |
| 8. Mise en ligne | 3/5 | noindex, X-Robots-Tag, robots.txt, og:image 1200×630 et 404 aux couleurs sont bons ; mais deux règles Cache-Control dans vercel.json et un ?v= différent par fichier. |
| 9. Accessibilité | 4/5 | Focus visible, textes alternatifs, « réduire les animations » et bouton « Animations réduites » respectés ; plusieurs cibles tactiles sous 44 px. |
| **Total** | **81/100** | |

## Points forts

- L'idée centrale est le métier lui-même : le visiteur tape un prénom et le voit gravé dans le noyer (`assets/js/engrave.js`), puis le teste sur six matières et trois écritures dans « Essayez avant de commander ».
- Section « Six matières » épinglée : fond texture, photo réelle et rail de choix synchronisés, lisible de 1280 à 2560 px.
- Parcours d'achat complet et honnête : filtres par occasion, panier, fiche produit avec prénoms obligatoires, devis en 5 étapes avec récapitulatif et confirmation.
- Contenu sans invention : avis vides annoncés comme tels, prix des versions 4 à 10 prénoms marqués « à compléter », photos réelles de l'atelier.
- Fluidité 60 i/s en portable et téléphone, CLS quasi nul, aucune erreur JS, repli propre sous « réduire les animations » (titre à 0,3 s).

## Défauts

### Bloquants

1. **Galerie collante de la fiche qui sort de l'écran** : /arbre-de-vie, 1366×768 (vignettes coupées de 62 px), 1280×720 (légende « Survolez la photo… » hors écran de 22 px), aussi 1024×640 et 1000×560, `captures/epingle-arbre-de-vie-0-1366x768-8.jpg`, `captures/epingle-arbre-de-vie-0-1280x720-92.jpg`. Cause : `assets/css/site.css:615`, `.fiche__galerie { position: sticky; top: calc(var(--entete) + 20px) }` sans hauteur maximale, alors que la photo principale est en 4:3 sur la demi-largeur (`site.css:580`). Correction : `.fiche__galerie { max-height: calc(100svh - var(--entete-h) - 40px); display: flex; flex-direction: column; }`, `#principale { flex: 1; min-height: 0; }` et image en `object-fit: contain`, hauteur d'en-tête mesurée en JS. Effort : petit.

### Importants

1. **Cartes « Une idée pour chaque moment » trop courtes sur petit portable** : accueil, 1000×560 et 1024×640, `captures/epingle-accueil-1-1000x560-8.jpg`. Les textes débordent des cartes et le bas sort de l'écran. Cause : `site.css:308`, largeur calculée sur l'estimation `(100svh - 300px) / 1.35`. Correction : section en colonne flex de 100svh, piste en `flex: 1; min-height: 0`, hauteur de carte déduite de la place restante ; palier `max-height: 600px` qui masque le paragraphe des cartes. Effort : moyen.
2. **Interrupteur « Animations réduites » qui recouvre le contenu sur téléphone** : accueil m390 et m430 (masque « Demander un devis » à l'ouverture), /arbre-de-vie m320, `captures/bande-ouverture-m390.jpg`. Cause : `site.css:506`, bouton fixe en bas à droite avec l'étiquette dépliée 5 s (`site.css:688`). Correction : ne pas déplier l'étiquette sur téléphone, réduire le bouton à l'interrupteur seul et ajouter `padding-bottom` aux blocs du bas, ou placer l'interrupteur dans le menu mobile. Effort : petit.
3. **Cibles tactiles sous 44 px** : toutes pages, m320 à m430. « Mentions légales et conditions » 173×21 (`site.css:505`), fil d'Ariane « Accueil » 42×18, liens e-mail du pied 42 px, titres produits 40 px (`site.css:679`), puces « Matières » du menu mobile environ 32 px (`site.css:156`), burger 42 px à 320. Correction : `min-height: 44px` et `display: inline-flex; align-items: center` sur ces liens et boutons. Effort : petit.

### Finition

1. **Tracé vectoriel bruité à l'étape 2** : accueil, tous formats, `captures/accueil-p1440-18.jpg`. Le côté gauche de l'arbre et les prénoms sont des contours irréguliers, en contradiction avec « la rigueur du dessin industriel ». Cause : `assets/data/trace-arbre.json` (vectorisation automatique de la photo). Correction : retracer à la main, ou simplifier le chemin et retirer les prénoms. Effort : moyen.
2. **Visuel « Voir chez vous » provisoire** : /arbre-de-vie, `assets/img/grok/produit-etagere-1200.webp`, étagère en aplats vectoriels qui jure avec les photos. Il est bien marqué « Visuel provisoire » ; à remplacer par une vraie photo de mur. Effort : petit.
3. **« Survolez la photo pour zoomer » affiché sur téléphone** : /arbre-de-vie m320 à m430 (`arbre-de-vie.html:88`). Correction : texte « Touchez la photo… » sous `(hover: none)`. Effort : petit.
4. **Pas de barre d'action fixe en bas sur téléphone** (devis et appel rapide). Correction : barre avec « Demander un devis » et le téléphone, masquée sur le formulaire et le pied de page. Effort : moyen.
5. **Mise en ligne** : retirer les deux règles Cache-Control de `vercel.json` (lignes 16 à 22) et donner le même ?v= à site.css, data.js, core.js, engrave.js, pied.js, home.js, produit.js et bois.js dans les 3 pages. Effort : petit.
6. **Poids de l'accueil** en t820 (3,6 Mo) et g1920 (4,0 Mo) : textures des matières en 1600 px chargées d'emblée. Correction : charger les textures 2 à 6 au premier changement de matière. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,6 s / 2,6 s (vidéos ; titre net sur la bande à 3 s, intro passable via « Passer », une fois par session) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,0006 (0,0039 sous « réduire les animations ») |
| Poids de l'accueil, p1440 / m390 | 3,14 Mo / 2,16 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur sur les 3 pages ; sans WebGL identique (pas de WebGL) ; réduit : titre à 0,3 s, contenu visible |
| Débordement horizontal | aucun |
| Sections épinglées | Six matières : OK de 1024×640 à 2560×1440 ; occasions : coupées en 1000×560 et 1024×640 ; galerie fiche Arbre de vie : coupée en 1000×560, 1024×640, 1280×720, 1366×768 (bloquant) |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public ; noindex sur les 3 pages ; X-Robots-Tag noindex, nofollow ; robots.txt Allow ; og:image JPG 1200×630 absolue ; ?v= présent mais différent par fichier ; Cache-Control dans vercel.json ; 404 aux couleurs |

## Vérifications écartées

- h1 à 3,4 s en m320, m360 et m390 : mesuré pendant que 5 maquettes tournaient ; les vidéos prises seules donnent 2,56 s et 2,59 s, et la bande montre le titre lisible à 3 s.
- Matières épinglées en 1000×560 (canvas et image hors écran) : ce sont les fonds de texture, pas du texte.
- Galerie de la fiche en 1440×900 à 2560×1440 (« img sous l'en-tête ») : l'en-tête se masque au défilement et seule la photo passe en haut ; pas un défaut.
- Portrait de l'atelier découpé en lanières sur `accueil-m390-14.jpg` et `accueil-t820-10.jpg` : capture prise pendant l'animation de révélation, état final net (`accueil-p1440-21.jpg`).
- Erreur console sur la 404 : c'est la réponse 404 de la page elle-même.
- LCP 2 328 ms sur /arbre-de-vie m390 : valeur isolée, 250 à 440 ms aux autres formats.
- « Ajouter au panier » de la fiche sans effet dans mon test : prénoms incomplets, le message « Indiquez les 5 prénoms… » est le comportement prévu (`assets/js/produit.js:90`).
- Images Grok (planche de noyer, laser, atelier, textures, matières, Noël) : vues en taille réelle, aucune main, aucun texte ni filigrane, lumière et palette cohérentes.


---

## gwenanou-print-maquette : corrections de l'étape 2

Commits 5355b8e puis e4e68a7 (barre du bas) (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Galerie collante de la fiche « Arbre de vie » qui sort de l'écran (1000×560 à 1366×768) | Bloquant | Galerie sticky bornée : `max-height: calc(100svh - var(--entete-h) - 40px)`, colonne flex, photo principale `flex: 0 1 auto; min-height: 0` (image en `object-fit: cover` déjà en place), vignettes et légende `flex: none` ; `top` sur `--entete-h`, hauteur de l'en-tête mesurée en JS (ResizeObserver) | `assets/css/site.css`, `assets/js/core.js` | 1366×768 : vignettes coupées de 62 px → 0 ; 1280×720 : légende hors écran de 22 px → 0 ; 1024×640 : 41 px → 0 ; 1000×560 : 19 px → 0 (`preuve-fiche-*`) |
| Cartes « Une idée pour chaque moment » trop courtes / coupées sur petit portable | Important | Méthode « Tout tenir dans l'écran » : section épinglée en `height: 100svh` colonne flex, `padding-top` sur `--entete-h`, piste `flex: 1; min-height: 0`, carte en `height: min(100%, …)` avec largeur déduite du ratio (plus d'estimation `100svh - 400px`) ; palier `max-height: 600px` (titre réduit, paragraphe des cartes masqué) ; `anticipatePin` retiré | `site.css`, `assets/js/home.js` | 1000×560 : cartes coupées de 34 px → 0 ; 1366×768 : 58 px → 0 (position stabilisée Lenis, aux 3 fractions) ; cartes plus grandes en 1366 (272 → 318 px de large) (`preuve-occasions-*`) |
| Interrupteur « Animations réduites » fixe qui recouvre le contenu | Important | Plus de bouton fixe ni d'étiquette dépliée 5 s : l'interrupteur est placé dans le bas du pied de page (toutes tailles) et dans le menu mobile, étiquette toujours visible, 44 px de haut ; même script (`$$(".mode-calme")`) | `index.html`, `arbre-de-vie.html`, `bois.html`, `site.css` | éléments couverts : 4 (m430 « Demander un devis », m320 légende, p1280 champ prénom, t820 /bois) → 0 ; clic dans le menu et dans le pied : bascule et retour OK (`preuve-interrupteur-*`) |
| Cibles tactiles sous 44 px | Important | `min-height: 44px` (pointeur tactile) sur titres produits, liens du pied, bouton « Mentions légales », fil d'Ariane (44×44), curseur `#echelle` ; burger `flex: none; min-width: 44px` | `site.css` | 3 à 4 cibles par format de m320 à t820 → 0 |
| Sous-titre du logo à 11,5 px (t820) | Récurrent (textes 12 px) | `.marque small { font-size: max(12px, .72rem) }` | `site.css` | 1 sélecteur < 12 px en t820 → 0 |
| Pas de barre d'action fixe en bas sur téléphone | Finition (récurrent « barre-bas ») | Barre `.barre-bas` sous 760 px avec uniquement des actions déjà présentes : « Demander un devis » (`#devis`) et « Appeler » (`tel:+33614613836`, numéro du pied). IntersectionObserver : visible seulement après le héros (`.heros`, `.heros-bois`, galerie de la fiche), masquée sur les formulaires, les champs prénoms, le rail des matières, le pied ; masquée menu ouvert et panier ou mentions ouverts (`html.menu-ouvert`, `html.verrou`) ; absente de la 404. `--barres-h` mesurée en JS (ResizeObserver), réserve en bas du pied et toast remonté | 3 pages HTML, `site.css`, `core.js` | m320 à m430 : 0 élément couvert (mesure complète) ; contrôle par pas de 300 px sur les 3 pages : aucun élément fixe ou collant sous la barre (seul le visuel des étapes y passe en entrant dans l'écran, avant de se coller en haut) ; barre cachée en haut, sur le formulaire, le pied et le menu (`preuve-barre-bas-m390-apres.jpg`) |
| Mise en ligne (Cache-Control, ?v=) | Finition | Déjà corrigé à l'étape 1 : vercel.json sans Cache-Control vérifié ; `matter.js?v=ae753689` oublié à l'étape 1, aligné ; toutes les versions passées à `?v=20261028-2` | 4 pages HTML | aucune référence `v=20261028` sans `-2` |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Tracé vectoriel bruité à l'étape 2 (`trace-arbre.json`) | Finition | Finition (retracé à la main) |
| Visuel « Voir chez vous » provisoire (étagère en aplats) | Finition | Image Grok / donnée manquante (vraie photo de mur) |
| « Survolez la photo pour zoomer » affiché sur téléphone | Finition | Finition |
| Poids de l'accueil t820 (3,6 Mo) et g1920 (4,0 Mo) | Finition | Finition |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920 ; 3 pages) | 0 | 0 |
| Textes < 12 px | 1 sélecteur (`.marque small`) en t820 sur les 3 pages | 0 |
| Cibles < 44 px | 3 à 4 par format de m320 à t820 (titres produits 40 px, e-mail du pied 42 px, Mentions 21 px, fil d'Ariane 18 px, curseur 40 px, burger 42 px à 320) | 0 |
| Éléments couverts (m320 à m430 compris, barre du bas présente) | 4 (par l'interrupteur fixe) | 0 |
| Galerie de la fiche, 8 tailles | coupée en 1000×560, 1024×640, 1280×720, 1366×768 | OK partout (reste « img sous l'en-tête » à 0,92 : fin du sticky, en-tête masqué au défilement, écarté dans le rapport) |
| Occasions épinglées, 8 tailles | coupées en 1000×560 et 1366×768 à 0,08 | OK partout une fois épinglée ; la coupe à 0,08 relevée par l'outil vient du retard de Lenis (section à 129-133 px du haut, pas encore épinglée) ; en position stabilisée, bas des cartes à 522/560, 602/640, 730/768 aux 3 fractions |
| Six matières, 1000×560 | textures hors écran (écarté dans le rapport) | inchangé |
| Erreurs console | seulement la 404 attendue | seulement la 404 attendue |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 81/100 → nouvelle note 88/100 · bloquants restants : 0 (la barre du bas, finition non citée dans les justifications, ne change aucune note)
- c3 Animations 12 → 13 : la galerie collante de la fiche est bornée à l'écran.
- c5 Formats 10 → 13 : galerie de la fiche, cartes « occasions » et interrupteur qui recouvrait le texte corrigés (pas de 15/15).
- c8 Mise en ligne 3 → 5 : plus de Cache-Control dans vercel.json et ?v= identique partout (étape 1, complétée pour matter.js).
- c9 Accessibilité 4 → 5 : plus aucune cible tactile sous 44 px.
