# winsbike-maquette

<https://winsbike-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 155f9f8 du 27/10/2026

## Verdict

**84/100 · À peaufiner · 0 défaut bloquant**

Le concept « atelier de précision » est complet et taillé pour le client : ouverture à la clé dynamométrique, planches techniques sur papier millimétré, vue éclatée du moyeu, catalogue réel et recherche instantanée, le tout à 60 i/s. Il reste des finitions pour le téléphone : textes à 11 px, petites cibles et bouton Calme masqué.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture signature (clé dynamométrique qui serre jusqu'au « clic »), hero d'établi éclairé à la lampe et planches techniques façon plan d'atelier : rien d'un modèle tout fait, parfaitement dans le monde du vélo. |
| 2. Direction artistique et harmonie | 12/15 | Nuit, orange et papier millimétré, Barlow Condensed et JetBrains Mono tenus sur les 3 pages et la 404 ; images Grok cohérentes (lumière chaude), sauf la vignette VTT, froide et en basse définition. |
| 3. Animations et effets | 13/15 | Titre lisible à 2 s, 59 à 60 i/s sans saccade, vue éclatée épinglée, curseur et boutons magnétiques ; l'accueil saute au chargement avec « réduire les animations ». |
| 4. Expérience ludique et interactions | 9/10 | Recherche instantanée avec ajout au panier, méga-menu, tiroirs des marques, fiche rapide, filtres Sumart (50 → 18), guide des tailles, formulaire pro par étapes, boutons Copier, panneau du panier avec les quantités et agrandissement des photos de la fiche Beast : tout répond. |
| 5. Tous les formats | 11/15 | Aucun débordement de 320 à 1920 px et l'en-tête tient à 320 px, mais les étiquettes mono font 11 px partout sur téléphone, plusieurs cibles font moins de 44 px et il n'y a pas de barre d'action en bas. |
| 6. Contenu et fiabilité | 9/10 | Catalogue et prix « relevés sur winsbike.fr », photos d'illustration et parcours d'atelier signalés « à remplacer » ou « à valider », mention « maquette de démonstration » en pied de page ; rien d'inventé repéré, mais tout n'a pas pu être vérifié avec le site actuel. |
| 7. Technique et performance | 9/10 | Aucune erreur JS, CLS au chargement ≤ 0,06, 2,0 Mo pour l'accueil sur ordinateur, version sans WebGL propre ; mais un CLS de 0,80 sous « réduire les animations », et le JS et le CSS sont minifiés sans leurs sources dans le dépôt. |
| 8. Mise en ligne | 5/5 | Site public, noindex et X-Robots-Tag, robots.txt ouvert, og:image JPG 1200×630 avec adresse complète, `?v=20261027` identique partout, 404 aux couleurs du site. |
| 9. Accessibilité | 3/5 | Bouton Calme et « réduire les animations » respectés sur ordinateur, mais le bouton Calme est masqué sur téléphone, textes à 11 px, pastilles de couleur de 24 px et le défilement n'est pas verrouillé sous le menu ouvert. |
| **Total** | **84/100** | |

## Points forts

- L'ouverture à la clé dynamométrique (0 → 5 N·m puis « clic ») est un vrai effet signature, qu'on peut passer d'un toucher, et le titre est lisible à 2 s.
- Les planches techniques (vue éclatée du moyeu, géométrie du cadre Beast avec les cotes à toucher) sont originales et utiles pour vendre des pièces.
- Le catalogue est réel (111 références, prix relevés) et la recherche instantanée trouve « plaquette » avec un ajout direct au panier.
- Le mur des meilleures ventes avec ses étiquettes accrochées, les tiroirs des marques, le cadran des horaires et le formulaire pro à engrenages sont amusants à utiliser.
- Les images Grok gardent une même lumière d'atelier orangée, sans main ni objet déformé visible.
- La mise en ligne est impeccable.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Textes de 11 px sur téléphone** : toutes les pages, m320 à m430 (15 textes sur l'accueil, 13 sur Sumart, 9 sur la fiche Beast), voir `captures/planche-accueil-m390.jpg`. Cause : `assets/css/site.css:1` (fichier minifié), règles `.pcard-brand`, `.crumbs`, `.tiroir-excl`, `.tag-rank`, `.season-note`, `.atelier-media .cap`, `.fam-n`, `.cat-toggle`, `.copy-btn` et `.ft-hours`, toutes en `font-size: 11px`. Correction : plancher `font-size: max(12px, …)` sur les étiquettes mono, ou passer ces règles à 12 px. Effort : petit.
2. **Cibles tactiles de moins de 44 px** : toutes les pages, m320 à m430. Le logo fait 36 px de haut, le lien du fil d'Ariane 15 px, les pastilles de couleur 24 px, le curseur du guide des tailles 34 px, le nom des produits 22 px et les liens du pied de page 40 px. Cause : `assets/css/site.css:1`, règles `.logo`, `.crumbs a`, `.sw`, `.sizer-row input`, `.pcard-name a`, `.ft li a`. Correction : `min-height: 44px` (padding ou pseudo-élément `::after` élargi) sur ces éléments ; pour les pastilles, une zone de 44 px autour d'un rond visuel de 24 px. Effort : petit.
3. **Bouton « Calme » absent sur téléphone** : toutes les pages, m390, voir `captures/planche-accueil-m390.jpg`. Cause : `assets/css/site.css:1`, palier mobile `.tog{display:none}`, qui masque aussi `#btn-sound`. Correction : reprendre « Calme » et « Son » dans le menu mobile (deux interrupteurs en bas du panneau). Effort : petit.

### Finition

1. **Saut au chargement avec « réduire les animations »** : accueil, p1440, voir `captures/planche-accueil-p1440-reduit.jpg`. Un décalage de 0,80 à 200 ms touche `.hero-in`, `.ticker` et `.hd-tools`, sans doute quand l'intro est retirée (classe `no-intro`). Cause probable : `assets/js/core.js` (gestion du `#loader` et de `no-intro`) et la mise en page du hero. Correction : poser `no-intro` dans le `<head>` avant le premier rendu quand `prefers-reduced-motion` est actif, pour que le hero soit à sa place d'emblée. Effort : petit.
2. **Pas de barre fixe en bas sur téléphone** : toutes les pages, m390. Correction : barre « Trouver ma pièce » et « Appeler », masquée par IntersectionObserver sur le formulaire pro et le pied de page. Seule la fiche Beast a déjà sa barre d'achat. Effort : moyen.
3. **Défilement non verrouillé sous le menu mobile** : accueil, m390 (la page défile de 400 px pendant que le menu est ouvert, test programmatique, à confirmer au doigt). Cause : `assets/js/core.js`, ouverture du menu (`body.menu-open`). Correction : reprendre le verrou de scroll iOS des sites frères (`position: fixed` sur le body et `top: -scrollY`, restauré à la fermeture). Effort : petit.
4. **Vignette VTT hors style** : accueil, section « Votre vélo, vos pièces », toutes tailles. `assets/img/grok/pratique-vtt-4x5-654.webp` est froide (brouillard gris-bleu) alors que les 5 autres pratiques sont en lumière chaude orangée, et elle ne fait que 654 px de large contre 1024 pour les autres. Correction : la régénérer dans le style commun, sans défaut à corriger par ailleurs. Consigne : « Mountain biker riding a rooty forest singletrack at golden hour, warm orange low sun rays through pine trees, rider seen from the side in silhouette, face not visible, hands hidden in dark gloves, dark moody palette with deep blacks and burnt orange highlights matching a bike-workshop brand, cinematic, shallow depth of field, vertical 4:5, 1024×1280 px, no text, no logo, no watermark, no recognizable person. » Effort : petit.
5. **Sources absentes du dépôt** : `assets/css/site.css`, `assets/js/data.js`, `product.js`, `picto.js` et `images.js` tiennent sur une seule ligne, et le README cite un `build.py` absent du dépôt. Toute correction se fait donc dans du code minifié. Correction : ajouter les sources et le script de build au dépôt. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,0 s / 2,0 s (intro clé dynamométrique, qu'on peut passer d'un toucher ; captures `ouverture-*-t2000.jpg`) |
| Fluidité p1440 / m390 | 59,4 i/s / 60 i/s (très bien, 1 seule image > 50 ms, aucune > 100 ms) |
| CLS au chargement (max) | 0,058 (Sumart g1920) ; accueil ≤ 0,013 |
| Poids de l'accueil, p1440 / m390 | 2,04 Mo / 1,34 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS ; sans WebGL : rien ne manque ; réduire les animations : contenu visible, mais saut de 0,80 au chargement de l'accueil |
| Débordement horizontal | Aucun (320 à 1920 px) |
| Sections épinglées | Vue éclatée : conforme aux 8 tailles ; photo de l'atelier (sticky) : rien sous l'en-tête pendant l'épinglage |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Oui / oui / oui / Allow / JPG 1200×630 avec adresse complète / 20261027 partout / 404 personnalisée |

## Vérifications écartées

- « MASQUÉ » sous l'en-tête (liens du pied de page, horaires, « Autres pièces Weapon ») : c'est le contenu qui défile normalement sous l'en-tête fixe au moment de la mesure ; il redevient lisible dès qu'on défile (`captures/404-p1440-zz.jpg`).
- Valeurs « h1 » de 1,9 à 2,8 s sur l'accueil : elles mesurent la fin de l'intro, prises pendant que 5 maquettes tournaient ; les captures montrent le titre lisible à 2,0 s.
- Erreur console « 404 » sur la page introuvable : c'est le statut 404 de la page elle-même, ce qui est le comportement attendu.
- CLS de 0,80 sous « réduire les animations » : il ne compte pas comme CLS de chargement ; il est noté en finition.
- Panier ouvert et agrandissement des photos de la fiche Beast : ce ne sont pas des `<dialog>`, d'où le premier résultat négatif. Revérifiés en p1440 et m390 : le panneau du panier (`aside#cart`) s'ouvre, le bouton + recalcule le sous-total (925 € puis 1 850 €), Échap le ferme ; l'agrandissement plein écran s'ouvre avec la légende « 1 / 6 » et les flèches (`captures/inter-panier-p1440.jpg`, `captures/inter-agrandir-p1440.jpg`, `captures/inter-agrandir-m390.jpg`). Aucune erreur JS.
- Photos de l'atelier et de la livraison (mains gantées, mains sur un carton) : aucune déformation visible en taille réelle.
- Photo de l'atelier et légende `p.mono` « sous l'en-tête » de 20 à 30 px (1280×720 à 1728×1000, `captures/epingle-accueil-1-*.jpg`) : remesuré pas à pas. Pendant l'épinglage, le bloc reste à 88 px, la légende à 98 px et l'image à 73–85 px, donc sous l'en-tête de 68 px. Le relevé à 0,92 tombe pendant que la section se libère et remonte normalement avec le défilement : ce n'est pas du contenu caché.


---

## winsbike-maquette : corrections de l'étape 2

Commits c4cde8d puis 661a120 (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Textes de 11 px sur téléphone | Important | Variables `--t-xs` (11 px) et `--t-xxs` (10 px) dans `:root`, utilisées par toutes les règles `font-size:11px`/`10px` et les raccourcis `font:… 11px` ; plancher `max(12px, …)` jusqu'à 1100 px (téléphone et tablette) | `assets/css/site.css` | Textes < 12 px : accueil 45 à 62 → 0 (m320–m430), Sumart 146 à 174 → 0, Beast 20 à 28 → 0, 404 5 à 10 → 0, t820 jusqu'à 189 → 0 |
| Cibles tactiles de moins de 44 px | Important | Jusqu'à 1100 px : `min-height:44px` sur `.logo`, `.pcard-name a`, `.ft ul a`, curseurs `.sizer-row input` et `.cat-price input`, liens de la 404 ; fil d'Ariane 44×44 min ; pastilles en zone de 44 px avec le rond visuel de 24 px en `::after` (état coché reporté) | `assets/css/site.css` | Cibles < 44 px : 3 à 5 par page → 0 sur tous les formats (36/36) |
| Pas de barre d'action en bas (récurrent `barre-bas`) | Finition / récurrent | Barre téléphone (≤ 700 px) sur l'accueil et Sumart : « Rechercher » (ouvre la recherche existante) et « Appeler » (02 96 29 46 26, déjà dans le menu et le pied). Apparaît une fois le premier écran dépassé, masquée sur les formulaires, le pied de page et tout panneau ouvert (menu, recherche, panier) ; `--barres-h` mesurée par ResizeObserver et ajoutée au bas du pied. La fiche Beast garde sa barre d'achat ; rien sur la 404 | `index.html`, `sumart.html`, `assets/js/core.js`, `assets/css/site.css` | m320 et m390 : masquée sur le héros, visible à 1,6 écran, masquée sur `#proform`, sur le pied et menu ouvert, revient à la fermeture ; éléments couverts par la barre : 0 (seuls restent ceux sous l'en-tête, déjà écartés par l'audit) |
| Saut au chargement sous « réduire les animations » | Finition (recommandée par le rapport) | La classe `calm` (bandeau d'infos replié sur deux lignes) n'était posée que par `core.js`, après le premier rendu : elle est maintenant posée dès le script en ligne du `<head>`, avec la même règle que `core.js` (choix enregistré, sinon `prefers-reduced-motion`) ; `no-intro` y était déjà | `index.html`, `sumart.html`, `cadre-beast-weapon.html`, `404.html` | CLS accueil en mouvement réduit : 0,71 → 0,013 (p1440), 0,003 → 0,003 (p1280), 0 → 0 (m390) ; mode normal inchangé ; `preuve-reduit-accueil-p1440.jpg` |
| Bouton « Calme » absent sur téléphone | Important | Rien à changer : Calme et Son sont déjà dans le panneau du menu mobile (44 px de haut, visibles à 320 et 390 px) | — | `preuve-menu-calme-m390.jpg` |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Défilement non verrouillé sous le menu mobile | Finition | Finition |
| Vignette VTT froide et en basse définition | Finition | Image Grok |
| Sources CSS/JS minifiées et `build.py` absents du dépôt | Finition | Finition (donnée manquante : sources hors dépôt) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920, 4 pages) | 0 | 0 |
| Textes < 12 px (m320–m430, t820) | 45 à 189 par page et format | 0 partout |
| Cibles < 44 px (m320–m430, t820) | 2 à 5 types par page | 0 partout |
| Éléments couverts | Seulement sous l'en-tête (contenu qui défile, écarté par l'audit) | Idem, aucun par la barre du bas |
| 1280×720 et 1366×768 | En-tête sur une ligne, rien de coupé | Inchangé (capture accueil-p1280 relue) |
| Épinglage aux 8 tailles | Vue éclatée conforme ; photo de l'atelier signalée à 0,92 (écartée par l'audit) | Identique |
| CLS accueil sous « réduire les animations » (p1440) | 0,71 | 0,013 |
| CLS au chargement, max des 36 formats | 0,058 | 0,057 |
| Erreurs console / erreurs JS | 0 (hors statut 404 attendu) | 0 |
| Modules chargés deux fois | Aucun (scripts classiques) | Aucun ; `?v=20261028-2` partout |

## Note proposée
Ancienne note 84/100 → nouvelle note 91/100 · bloquants restants : 0
- Critère 5 : 11 → 14/15, textes 11 px, cibles < 44 px et absence de barre du bas, cités, sont corrigés.
- Critère 3 : 13 → 14/15, le saut au chargement sous « réduire les animations », cité, est corrigé.
- Critère 7 : 9 → 10/10, le CLS de 0,80 sous « réduire les animations », cité, est corrigé (restent les sources minifiées, finition).
- Critère 9 : 3 → 5/5, textes 11 px et pastilles de 24 px, cités, sont corrigés (le bouton Calme était déjà dans le menu mobile ; reste le verrou de défilement, finition).
