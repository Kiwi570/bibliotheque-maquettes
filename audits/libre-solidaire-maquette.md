# libre-solidaire-maquette

<https://libre-solidaire-maquette.vercel.app> · audit du 27/10/2026 · dernier commit ca2c3ef du 23/10/2026

## Verdict

**79/100 · À peaufiner · 1 défaut bloquant**

Direction artistique « sol vivant » forte et cohérente, ouverture racinaire réussie, fluidité parfaite et interactions toutes fonctionnelles. Mais sur téléphone de 320 à 390 px le bouton du menu sort de l'écran (inaccessible à 360 px) et le grand logo du pied de page est coupé jusqu'à 860 px.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Racines dorées qui germent depuis l'esperluette, livres en 3D sur fond de terre : ouverture singulière et parfaitement liée au métier d'éditeur. |
| 2. Direction artistique et harmonie | 13/15 | Palette humus et ocre, Fraunces + Instrument Sans + Plex Mono bien hiérarchisés, photos Grok homogènes (lumière dorée rasante) ; quelques micro-libellés mono trop petits. |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, titre lisible à 2,5 s, galerie épinglée et réseau de couvertures ; galerie des nouveautés qui déborde à 1024×640 et pied qui coupe son logo animé. |
| 4. Expérience ludique et interactions | 9/10 | Recherche rapide, panier, filtres + prix + tri, vue réseau, page qui se tourne, Mode calme et formulaires simulés : tout répond. |
| 5. Tous les formats | 8/15 | Menu inaccessible à 320–390 px (bloquant), logo du pied coupé ≤ 860 px, titre du hero coupé à 320 px, boutons « Ajouter » sous l'écran à 1024×640. |
| 6. Contenu et fiabilité | 9/10 | Contenus repris du site actuel avec mentions « à compléter » / « à vérifier » soignées ; « Paris 13 E » mal composé. |
| 7. Technique et performance | 8/10 | Aucune erreur ni lien cassé, CLS 0 sur les vraies pages ; accueil lourd (5,3 Mo) et CLS 0,11 sur la 404 en 1920. |
| 8. Mise en ligne | 3/5 | Public, noindex partout, og:image 1200×630 absolue, 404 perso ; mais pas d'en-tête X-Robots-Tag et aucun `?v=` sur le CSS/JS. |
| 9. Accessibilité | 4/5 | Mode calme et « réduire les animations » respectés, focus et contrastes corrects ; quelques cibles et textes sous les seuils sur téléphone. |
| **Total** | **79/100** | |

## Points forts

- Ouverture signature : l'esperluette fait pousser des racines qui deviennent le fond du site, puis le hero arrive avec ses trois nouveautés en 3D (`captures/ouverture-p1440-t1000.jpg` → `t3000`).
- Univers cohérent de bout en bout : strates de territoire, compte à rebours « Ce qui pousse sous la surface », réseau de couvertures « sol vivant », pied racinaire.
- Images Grok de très bonne tenue et parfaitement accordées entre elles (vigne, forêt, potager, place à l'aube, manuscrits) : aucun défaut visible.
- Catalogue réellement utilisable : 117 titres, filtres par territoire avec compteurs, prix maximal, tri, état vide soigné, bascule grille / réseau.
- Fluidité exemplaire : 59,9 i/s en p1440, 60 i/s en m390, aucune image > 50 ms.

## Défauts

### Bloquants

1. **Bouton du menu hors de l'écran sur téléphone** : toutes pages, m320, m360, m390 (à 360 px le bouton commence à x = 379 : invisible et impossible à toucher ; à 390 px il n'en reste qu'une bande de 10 px), `captures/ls-entete-390.jpg`, `captures/accueil-m390-00.jpg`. Cause : `assets/css/style.css:121` (`.entete__actions` à 4 boutons, gap 10 px, aucun rétrécissement) + `style.css:711-713` (boutons portés à 44 px en tactile) + `style.css:114` (marque 1,32 rem nowrap) : la rangée fait 250 px + marque ≈ 165 px > 390 px. Correction : sous 480 px, sortir le bouton « Mode calme » de l'en-tête et le placer dans le menu plein écran, `gap: 6px` sur `.entete__actions`, `min-width: 0` sur la marque et `font-size: 1.1rem` ; vérifier à 320 px que le bouton menu est entièrement visible. Effort : petit.

### Importants

1. **Logo « Libre & Solidaire » du pied coupé à droite** : toutes pages, m320 à t820 (le « e » final sort de l'écran), `captures/ls-pied-390.jpg`, `captures/ls-pied-820.jpg`. Cause : `assets/js/core.js:476-480` découpe le mot en lettres `inline-block` et `assets/css/style.css:463` met `.pied__marque` en `display: flex; gap: 0.12em` : chaque lettre devient un élément flex espacé de 0,12 em, ce qui élargit le mot de près de 15 % au-delà des 13,5vw prévus (`style.css:466`). Correction : retirer `display: flex; gap` (ou regrouper « Libre » et « Solidaire » dans deux `span` mots et appliquer le gap entre mots seulement), et passer la taille mobile à `font-size: min(13.5vw, …)` vérifiée à 320, 390 et 820 px. Effort : petit.
2. **Titre du hero coupé à 320 px** : accueil, m320 (« l'aven… »), `captures/accueil-m320-00.jpg`. Cause : `assets/css/style.css:39` (`--t-3xl` plancher 2,7 rem) et `style.css:216` (mots `inline-block` insécables). Correction : palier `@media (max-width: 359px) { .heros__titre { font-size: 2.3rem; } }`. Effort : petit.
3. **Galerie épinglée des nouveautés trop haute à 1024×640** : accueil, boutons « Ajouter » et prix sous le bas de l'écran (18 à 26 px), surtitre sous l'en-tête, `captures/epingle-accueil-0-1024x640-50.jpg`. Cause : `assets/css/style.css:265` (`height: 100svh; min-height: 560px` avec padding fixe `header-h + 24px` et couvertures à taille fixe). Correction : médias en `flex: 1; min-height: 0` avec couverture en `max-height: 100%`, et palier `@media (max-height: 680px)` qui réduit le titre et les marges. Effort : moyen.
4. **En-tête X-Robots-Tag absent et aucun `?v=`** : toutes pages. Cause : `vercel.json` ne contient que `cleanUrls` ; CSS et JS appelés sans version dans les 4 pages. Correction : bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)` ; `?v=1` identique sur `style.css`, `livres.js`, `core.js`, `reseau.js`, `accueil.js`, `heros-gl.js`, `catalogue.js`, `livre.js`. Effort : petit.

### Finition

1. **Textes sous 12 px sur téléphone** : accueil, catalogue, fiche (étiquettes « Sang de la Terre » 11,5 px, « à vérifier » 11 px, « Copier » 11 px, quatrième de couverture 7–9 px, « Extrait à fournir » 8 px). Cause : `style.css:570-572` (`.quatrieme` clamp 9 px) et étiquettes mono. Correction : `font-size: max(12px, …)` sur étiquettes, `.a-completer`, `.copier` ; agrandir la quatrième ou la rendre décorative avec texte équivalent. Effort : petit.
2. **Cibles tactiles sous 44 px** : titres de cartes (23 px de haut), lien courriel du pied (22 px), « Copier » (36 px), « Blog » (34 px de large), curseur de prix (16 px). Correction : `padding-block` sur `.carte-nouv__titre`, `.carte__titre`, `.adresse a`, `min-height: 44px` sur `.copier` et `#prix-max`. Effort : petit.
3. **« Paris 13 E »** : accueil, surtitre et écran d'ouverture, `captures/ouverture-p1440-t3000.jpg`. Cause : `index.html:78` (`13<sup>e</sup>`) dans `.surtitre` en `text-transform: uppercase` (`style.css:92`). Correction : `.surtitre sup { text-transform: none; }` ou écrire « 13ᵉ ». Effort : petit.
4. **Accueil lourd** : 5,33 Mo en p1440, 4,84 Mo en m390 (117 couvertures du réseau chargées). Correction : charger les vignettes du réseau à l'approche de la section (`loading="lazy"` ou injection à l'intersection). Effort : moyen.
5. **CLS 0,11 sur la 404 en 1920** et **CLS 0,22 sur la fiche avec « réduire les animations » en p1440**. Cause : `div.conteneur` de la 404 recalé après le chargement des polices ; scène 3D de la fiche sans dimensions réservées. Correction : `aspect-ratio` sur `.fiche__scene` et hauteur minimale réservée au conteneur de la 404. Effort : petit.
6. **Aide de la fiche sous l'écran à 1000×560** : `p.fiche__aide` dépasse de 9 px, `captures/epingle-livre-0-1000x560-50.jpg`. Correction : même palier `max-height: 600px`. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (logo lisible dès 1 s ; h1 détecté à 2,83 s / 2,78 s) |
| Fluidité p1440 / m390 | 59,9 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0 sur les pages réelles (0,0035 fiche p1280) ; 0,1085 sur la 404 g1920 |
| Poids de l'accueil, p1440 / m390 | 5,33 Mo / 4,84 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune (seul le 404 attendu de la page introuvable) ; sans WebGL : rendu correct ; réduit : contenu visible d'emblée |
| Débordement horizontal | aucun mesuré (body en `overflow-x: hidden`), mais contenu masqué : menu (320–390), logo du pied (≤ 860), titre hero (320) |
| Sections épinglées | nouveautés : boutons sous l'écran à 1024×640 ; fiche : aide −9 px à 1000×560 ; parutions et strates : OK |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex, nofollow sur 3 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v= absent partout · 404 personnalisée |

## Vérifications écartées

- h1 à 3,0–3,8 s sur les mesures par format : prises en parallèle et retardées par l'intro ; sur les captures une à une, le titre est lisible à 2,5 s et le logo dès 1 s, donc sous 3 s.
- Images de la galerie épinglée qui sortent de 8 à 27 px en début d'épinglage (1000×560, 1728×1000, 1920×1080 à 8 %) : phase d'entrée, la capture 1920×1080 montre la galerie complète et lisible.
- Champ de recherche du catalogue à 42 px de haut : écart de 2 px, sans gêne réelle.
- Recherche « vin » à 0 résultat avec le filtre Société actif : comportement correct (cumul des filtres), l'état vide propose « Effacer les filtres ».
- Image `accueil-manuscrits.webp` : pseudo-texte flou sur les feuilles, illisible à la taille affichée et en partie couvert par l'enveloppe ; pas un défaut visible.
- Erreur console « 404 » sur `/zz-page-introuvable-audit` : c'est le statut attendu de la page introuvable.


---

## libre-solidaire-maquette : corrections de l'étape 2

Commit 75551cb (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Bouton du menu hors de l'écran à 320–390 px | Bloquant | Sous 480 px : « Mode calme » sort de l'en-tête et passe dans le menu plein écran (nouveau bouton `.menu-plein__calme`, même libellé), `gap: 6px`, marque à 1,1 rem qui peut passer sur deux lignes, cible 44 px ; core.js gère tous les boutons `.calme-bouton` | style.css, core.js, 4 pages HTML | bouton menu à x = 379 (m360, hors écran) → 296–344 px à m360, 256–304 à m320, 326–374 à m390 ; Mode calme dans le menu testé (bascule + rechargement, `aria-pressed`) ; `preuve-entete-heros-m320-*`, `preuve-menu-calme-m360.jpg` |
| Logo du pied coupé ≤ 860 px | Important | La découpe en lettres regroupe chaque mot dans un `span.pied__mot` : l'écart flex ne s'applique plus qu'entre les mots | core.js, style.css | « e » final hors écran → bord droit à 325 px (m390), 269 px (m320), 684 px (t820) ; `preuve-pied-m390-*` |
| Titre du hero coupé à 320 px | Important | Palier `@media (max-width: 359px)` à 2,3 rem | style.css | « l'aven… » → titre entier ; `preuve-entete-heros-m320-apres.jpg` |
| Galerie épinglée trop haute à 1024×640 | Important | Méthode « Tout tenir dans l'écran » : sans `min-height: 560px`, haut réservé par `--entete-h` mesuré en JS (ResizeObserver), piste et zone livre en `flex` rétrécissables (`min-height: 0`), largeur du livre bornée par la hauteur disponible (`100cqh / var(--ratio)`), palier `max-height: 680px` qui réduit titre et marges | style.css, core.js | « Ajouter » −18/−26 px et surtitre −2 px → plus rien de coupé à 50 % et 92 % aux 8 tailles ; `preuve-galerie-1024x640-*` |
| Aide de la fiche sous l'écran à 1000×560 (finition, section collante) | Finition | Palier `max-height: 600px` : livre borné par la hauteur restante, marges réduites | style.css | −9 px → 0 ; `preuve-fiche-1000x560-apres.jpg` |
| Textes < 12 px sur téléphone | Important récurrent | Plancher 12 px : étiquettes, `.a-completer` (`max(12px, …)`), « Copier », territoires, badges, compteur du panier, quatrième (`clamp(12px, …)`), mentions, résumé et « Extrait à fournir » de la fiche | style.css, livre.js | 12–13 textes par format → 0 (m320 à t820) |
| Cibles < 44 px sur téléphone | Important récurrent | `min-height: 44px` / padding : titres de cartes, courriel, « Copier », curseur de prix, recherche, liens du pied (largeur 44 px), « Revenir en haut », fil d'Ariane, marque | style.css | 15–19 cibles par format → 0 (m320 à t820) |
| X-Robots-Tag absent et aucun `?v=` | Important | Déjà corrigé à l'étape 1 (vérifié : `vercel.json` porte X-Robots-Tag, versions cohérentes), passées à `?v=20261028-2` | 4 pages HTML | 8 fichiers, une seule version par fichier |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| « Paris 13 E » (sup en capitales) | Finition | finition |
| Accueil lourd (5,3 Mo) ; les couvertures du réseau se chargent déjà à l'approche (IntersectionObserver), le poids vient du défilement complet | Finition | finition (effort moyen) |
| CLS 0,11 sur la 404 en 1920 et 0,22 sur la fiche en « réduire les animations » | Finition | finition |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats) | 0 mesuré (contenu masqué : menu 320–390, logo du pied ≤ 860, titre 320) | 0, plus aucun contenu masqué |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820, 4 pages) | 12 / 12 / 13 / 13 / 13 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 15 / 15 / 17 / 18 / 19 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts | 0 | 0 |
| Épinglage aux 8 tailles (hors phase d'entrée à 8 %) | galerie 1024×640 : « Ajouter » −18 px, surtitre −2 px ; fiche 1000×560 : aide −9 px | aucun défaut |
| Épinglage, phase d'entrée à 8 % (écartée dans le rapport) | image de fond 8 à 27 px | identique (section pas encore collée) |
| Erreurs console | seul le 404 attendu | identique, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 79/100 → nouvelle note 89/100 · bloquants restants : 0
- c2 Direction artistique 13 → 14 : micro-libellés mono portés à 12 px.
- c3 Animations 12 → 14 : galerie épinglée tient à 1024×640, logo animé du pied entier.
- c5 Tous les formats 8 → 12 : menu accessible de 320 à 390 px, logo du pied entier, titre du hero entier à 320 px, boutons « Ajouter » dans l'écran à 1024×640.
- c8 Mise en ligne 3 → 5 : X-Robots-Tag et `?v=` (corrigés à l'étape 1, vérifiés).
- c9 Accessibilité 4 → 5 : plus aucune cible ni texte sous les seuils sur téléphone.
