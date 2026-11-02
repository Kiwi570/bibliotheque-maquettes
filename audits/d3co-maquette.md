# d3co-maquette

<https://d3co-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 244b0c2 du 23/10/2026

## Verdict

**81/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Maquette au concept fort : tout le site parle d'impression couche par couche (vase qui se sépare en strates, buse qui trace les silhouettes, configurateur de coloris, étagère à composer), sans erreur et à 60 i/s. Trois points la retiennent : une intro qui affiche le titre après plus de 3 s, une galerie produit épinglée qui coupe ses vignettes en 1280×720 et 1366×768, et une mise en ligne incomplète (pas de X-Robots-Tag, pas de `?v=`).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Le vase Linea qui se sépare en strates au défilement et les cotes techniques donnent une identité « atelier » forte et propre au client ; l'intro à la buse est belle mais trop longue. |
| 2. Direction artistique et harmonie | 13/15 | Palette os, graphite et orange tenue partout, police étroite et chasse fixe bien associées, images Grok cohérentes entre elles (lumière chaude rasante) ; petits accrocs : étiquettes de la carte de Suisse barrées par les trajets, grand vide noir sous la section « Sur mesure ». |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade sur portable comme sur téléphone, effet signature aussi présent sur téléphone, galerie horizontale et dessin du process bien réglés, mais titre lisible seulement entre 3 et 4 s à la première visite. |
| 4. Expérience ludique et interactions | 9/10 | Tout répond : choix des coloris par modèle, étagère composée avec total et jauge de livraison offerte, sur-mesure en 3 étapes avec contrôle, ajout rapide, filtres, tri, loupe, décors, panier, FR/DE. |
| 5. Tous les formats | 11/15 | Aucun débordement, mais galerie produit dont les vignettes sortent de l'écran en 1280×720 et 1366×768, textes de 9 à 11 px et zones tactiles de 27 à 40 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Manques bien signalés (« photos à récupérer », « noms des coloris : à confirmer », « mentions légales : à compléter »), paiement et envois indiqués comme simulés, date de livraison calculée au jour près. |
| 7. Technique et performance | 8/10 | Aucune erreur console ni requête en échec, rendu correct sans WebGL, pages de 0,8 à 2,1 Mo ; CLS de 0,112 sur la boutique en 1920×1080. |
| 8. Mise en ligne | 3/5 | noindex dans chaque page, og:image JPG 1200×630 avec adresse complète, 404 aux couleurs de la marque ; X-Robots-Tag absent de `vercel.json` et aucun `?v=` sur le CSS ni sur le JS. |
| 9. Accessibilité | 4/5 | Focus visible, lien d'évitement, bouton « Réduire les animations » qui fonctionne, intro coupée sous `prefers-reduced-motion` ; textes et cibles trop petits sur téléphone. |
| **Total** | **81/100** | |

## Points forts

- Concept unique et juste : l'impression 3D sert de fil conducteur (hero en strates, buse qui dessine la collection, process à 120 couches, mot « D3CO » du pied de page en strates, 404 « Cette page n'a pas encore été imprimée »).
- Images Grok sans défaut visible, toutes dans la même lumière chaude et la même palette ; elles sont signalées « image d'illustration » là où il le faut.
- Interactions riches qui marchent toutes : configurateur de coloris, étagère à composer, sur-mesure en 3 étapes, panier, ajout rapide en boutique, loupe et décors sur la fiche produit.
- Technique propre : 0 erreur, 60 i/s, CLS presque nul ailleurs que sur la boutique en grand écran, sans WebGL et « réduire les animations » sans perte de contenu.
- Contenus provisoires marqués avec soin (cadre pointillé orange), aucun avis ni logo inventé repéré.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Intro trop longue** : accueil, première visite, p1440 et m390, `captures/ouverture-p1440-t3000.jpg` (encore vide) et `captures/ouverture-p1440-t4000.jpg` (titre lisible), même chose en `ouverture-m390-t3000/t4000.jpg`. Cause : `assets/js/accueil.js:39-52`, la timeline enchaîne 1,7 s de progression, 0,2 s, 0,1 s plus 0,5 s, puis 0,7 s et un décalage de 0,385 s, soit environ 3,3 s après le chargement. Correction : progression ramenée à 1,0 s, sortie du centre et des strates en parallèle (0,5 s, décalage de 0,02 s), pour un titre lisible avant 2,5 s. Effort : petit.
2. **Vignettes de la galerie produit coupées** : produit, 1280×720 et 1366×768 (aussi 1024×640 et 1000×560), `captures/epingle-produit-0-1280x720-8.jpg`. La galerie épinglée fait plus que la hauteur de l'écran : les vignettes sortent de 54 à 64 px pendant tout le défilement. Cause : `assets/css/style.css:776-777` (`.galerie` en sticky, `.scene-produit` en `aspect-ratio: 1` calé sur la largeur de la colonne). Correction : `.scene-produit { max-height: calc(100svh - var(--header-h) - 16px - 12px - <hauteur vignettes> - 16px); width: auto; }` avec la hauteur des vignettes mesurée en JS, ou galerie non épinglée sous `max-height: 820px`. Effort : petit.
3. **CLS au chargement de la boutique en grand écran** : boutique, g1920, CLS 0,112 à 491 ms (pied de page et filtres décalés). Cause : la grille `[data-grille]` est remplie en JS (`assets/js/boutique.js`) alors que le pied de page est déjà visible ; `assets/css/style.css:749` ne réserve aucune hauteur. Correction : `min-height` de deux rangées de cartes sur `.grille-produits` avant le rendu, ou cartes squelettes dans le HTML. Effort : petit.
4. **X-Robots-Tag absent et `?v=` absent** : toutes pages. Cause : `vercel.json` (seulement `cleanUrls` et `trailingSlash`) ; `index.html:20` et `:492`, même chose dans `boutique.html`, `produit.html` et `404.html` (`style.css` et les modules JS sans version). Correction : bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)` ; même `?v=` sur `style.css` et les points d'entrée JS. Pour les imports internes des modules (`core.js`, `data.js`…), ajouter le même `?v=` aux `import` ou passer par une import map. Effort : petit.
5. **Textes de moins de 12 px sur téléphone** : accueil, boutique, produit, m320 à m430. Les noms sous les vignettes de l'étagère font 9 px (`assets/css/style.css:555`, `.choix__nom` à 0,5625rem). L'étiquette « Image d'illustration » fait 10 px (`style.css:487`). Les surtitres en chasse fixe, le cartouche, le bouton FR et les puces font 11 px (`style.css:403`, `465`, `506`, `660`, `744`, `772`). Correction : plancher `font-size: max(12px, …)` sur ces classes sous 700 px. Effort : petit.
6. **Zones tactiles de moins de 44 px sur téléphone** : toutes pages. Le bouton FR/DE fait 29×27, le menu 34×40 à 40×40, le panier 40 de haut, les boutons « Ajouter » 40 de haut, les puces de filtre 34 de haut (`style.css:745`), le fil d'Ariane 51×17 et les liens du pied 20 de haut. Correction : `min-height: 44px` (et `min-width` pour les boutons ronds) sous 700 px, ou zone élargie par pseudo-élément. Effort : petit.

### Finition

1. **Étiquettes de la carte de Suisse barrées par les trajets** : accueil, p1440, `captures/accueil-p1440-17.jpg` (Bâle, Neuchâtel, Saint-Gall, Genève). Cause : `assets/css/style.css:593` (texte sans fond) et `assets/js/carte.js`. Correction : `paint-order: stroke; stroke: var(--os); stroke-width: 4px` sur `.ville text`, ou trajets dessinés sous les étiquettes. Effort : petit.
2. **Grand vide noir sous le formulaire « Sur mesure »** : accueil, p1440 et g1920, `captures/accueil-p1440-20.jpg`. La colonne droite (formulaire court) laisse environ 600 px vides sous le croquis. Correction : croquis en `position: sticky` ou formulaire centré verticalement (`.mesure__grid`, `style.css:608`, `align-items: center`). Effort : petit.
3. **Cartes de la collection vides avant le tracé** : accueil, p1440, `captures/accueil-p1440-02.jpg`. À l'arrivée sur la section, les deux premières cartes ne montrent que la grille. Correction : déclencher le tracé plus tôt (`start: 'top 90%'`) ou afficher le contour en pointillé dès le départ. Effort : petit.
4. **Pied à coulisse sans graduations** dans `g13-sur-mesure-croquis` : défaut léger, peu visible à la taille affichée ; à régénérer seulement si l'image est agrandie.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | entre 3 et 4 s / entre 3 et 4 s (première visite ; 0,2 s ensuite, intro mémorisée par session) |
| Fluidité p1440 / m390 | 60 i/s / 59,7 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,112 (boutique g1920) ; ailleurs ≤ 0,048 |
| Poids de l'accueil, p1440 / m390 | 2,06 Mo / 1,61 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (le seul 404 est celui de la page introuvable) ; sans WebGL : rendu complet ; réduire : intro coupée, contenu visible |
| Débordement horizontal | aucun, sur tous les formats |
| Sections épinglées | hero et collection OK ; process : h3 sort de 11 à 17 px en 1000×560 ; galerie produit : vignettes coupées de 1000×560 à 1366×768, canvas 21 à 42 px sous l'en-tête en fin d'épinglage |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex partout · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v= absent · 404 personnalisée |

## Vérifications écartées

- Hero « img sous l'en-tête et sort de l'écran » (toutes tailles) : il s'agit de l'image de fond plein cadre derrière le vase, prévue pour déborder ; le vase et les cotes restent dans l'écran (`captures/epingle-accueil-0-1280x720-50.jpg`).
- « MASQUÉ » par l'en-tête (lien d'évitement, liens du pied de page) : `a.sr` est le lien d'évitement masqué volontairement ; les autres éléments passent seulement sous l'en-tête pendant le défilement.
- Bouton « Réduire les animations » masqué par la barre d'achat sur la fiche produit en m360 à m430 : en bas de page, la barre d'achat ne le recouvre plus (bouton à y = 752, barre à y = 851 en m390).
- Ajout au panier « 0 » en boutique : le bouton « Ajouter » ouvre un choix rapide (finition, coloris) avant l'ajout ; c'est voulu et ça fonctionne.
- Panier inaccessible en m390 pendant le test : l'en-tête se masque au défilement vers le bas ; le toast propose « Voir le panier ».
- Copie des coordonnées « Sélectionnez le texte pour le copier » : presse-papiers refusé par le navigateur sans affichage ; le repli prévu s'affiche.
- Pastille orange « VOIR » sur le pied de page dans les captures : curseur personnalisé resté à la position de la souris du script, pas un élément de la page.
- Décalages du nuancier pendant le défilement sur téléphone (CLS final 0,27 en m360) : ils surviennent au défilement, pas au chargement ; ce n'est pas du CLS de chargement.
- Valeurs « h1 » de 0,8 à 1 s sur la fiche produit : prises pendant que 5 maquettes tournaient en parallèle, et toutes sous 3 s.


---

## d3co-maquette : corrections de l'étape 2

Commit a3843b2 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Intro trop longue (titre lisible entre 3 et 4 s) | Important | Progression 1,7 → 1,0 s, buse 0,15 s, sortie du centre et des strates en parallèle (0,5 s, décalage 0,02 s) | `assets/js/accueil.js` | voile retiré à 2,04 s (p1440) et 2,02 s (m390), chargement compris ; `preuve-intro-*.jpg` |
| Vignettes de la galerie produit coupées (1000×560 à 1366×768) | Important | Scène carrée limitée à la hauteur dispo : `100svh − --entete-h − 16 − 12 − --vignettes-h − 16`, hauteurs mesurées en JS (ResizeObserver) | `style.css`, `assets/js/produit.js` | vignettes sortaient de 20 à 64 px → 0 à toutes les tailles ; `preuve-galerie-*.jpg` |
| Process : h3 hors écran en 1000×560 | Mesure | Palier `(min-width: 901px) and (max-height: 600px)` qui resserre les étapes | `style.css` | 17 px → 0 |
| CLS 0,112 boutique g1920 | Important | `.grille-produits:empty { min-height: 100svh }` avant le rendu JS | `style.css` | 0,1124 → 0,0028 |
| Textes de 9 à 11 px sur téléphone | Important | Variables `--t-mono`, `--t-mini`, `--t-micro` (remplacent 0,6875 / 0,625 / 0,5625 rem en dur), plancher `max(12px, …)` sous 900 px ; noms de l'étagère sur fond clair | `style.css` | 15 / 7 / 11 / 5 textes < 12 px (accueil / boutique / produit / 404) → 0 partout |
| Zones tactiles de 27 à 40 px sur téléphone | Important | `min-height`/`min-width` 44 px sous 900 px : FR/DE, panier, menu, logo, boutons petits, onglets, puces, tri, copier, réduire les animations, quantité, fil d'Ariane, liens du pied, coordonnées, nom des cartes ; en-tête resserré sous 380 px pour tenir sur une ligne | `style.css` | 14 / 11 / 15 / 7 cibles → 2 / 1 / 2 / 1 (lien d'évitement masqué et case à cocher, voir plus bas) |
| Barre d'achat qui recouvre « Réduire les animations » (m360 à m430, t820) | Mesure | Barre masquée quand le pied de page entre dans l'écran (IntersectionObserver), masquée menu ouvert, `main.produit` avec `padding-bottom: var(--barres-h)` mesurée en JS | `assets/js/produit.js`, `style.css` | 4 éléments couverts par la barre → 0 ; `preuve-barre-pied-m390.jpg` |
| X-Robots-Tag absent, `?v=` absent | Important | Déjà corrigé à l'étape 1 (vérifié : en-tête dans `vercel.json`, `?v=` sur CSS, entrées et imports) ; passage à `?v=20261028-2` partout | tous | grep `v=20261028[^-]` vide, 0 module chargé deux fois |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Étiquettes de la carte de Suisse barrées par les trajets | Finition | finition |
| Grand vide sous le formulaire « Sur mesure » (p1440, g1920) | Finition | finition |
| Cartes de la collection vides avant le tracé | Finition | finition |
| Pied à coulisse sans graduations (g13-sur-mesure-croquis) | Finition | image Grok |
| Cases à cocher 18×18 (newsletter, « Afficher le parcours ») | Mesure | finition : le libellé entier est cliquable et dépasse 44 px |
| Galerie produit sous l'en-tête à 92 % (17 à 42 px) | Mesure | fin normale du collant : la galerie remonte avec la fin de la fiche |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats, 4 pages) | 0 | 0 |
| Textes < 12 px (m320 à t820, par page : accueil / boutique / produit / 404) | 15 / 7 / 11 / 5 | 0 / 0 / 0 / 0 |
| Cibles < 44 px (idem) | 14 / 11 / 15 / 7 | 2 / 1 / 2 / 1 |
| Couverts par la barre d'achat | 4 (produit m360, m390, m430, t820) | 0 |
| Couverts par l'en-tête (pied pendant le défilement, écarté au rapport) | 1 à 3 par format | 0 à 3 par format, inchangé |
| Épinglage : galerie produit | vignettes coupées de 1000×560 à 1366×768 (20 à 64 px) | aucune coupe à 8 % et 50 % ; fin du collant seule à 92 % |
| Épinglage : process | h3 coupé 11 à 17 px en 1000×560 | aucun problème |
| Épinglage : héros, collection | image de fond volontairement plein cadre / OK | inchangé |
| CLS chargement max | 0,1124 (boutique g1920) | 0,0473 (boutique t820, inchangé) |
| Erreurs console | 0 (hors 404 voulue) | 0 (hors 404 voulue) |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 81/100 → nouvelle note 90/100 · bloquants restants : 0
- c1 13 → 14 : l'intro trop longue citée est raccourcie.
- c3 11 → 12 : titre lisible vers 2 s au lieu de 3 à 4 s.
- c5 11 → 14 : galerie produit dans l'écran, textes ≥ 12 px et cibles ≥ 44 px sur téléphone.
- c7 8 → 9 : CLS de 0,112 de la boutique supprimé.
- c8 3 → 5 : X-Robots-Tag et `?v=` en place (étape 1, vérifiés).
- c9 4 → 5 : textes et cibles trop petits corrigés.
