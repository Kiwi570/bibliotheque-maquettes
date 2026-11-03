# winsbike-atelier

<https://winsbike-atelier.vercel.app> · audit du 28/10/2026 · dernier commit 7dcdab6 du 27/10/2026

## Verdict

**79/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Une boutique vélo vivante et très jouable : le cadre Oil Slick qui change de teinte, le panneau d'outils à composer, la prise de rendez-vous et le panier simulé fonctionnent tous. L'envoi est bloqué par deux défauts : le mot « protections. » du titre est coupé en deux en 1920, et l'image Grok de l'atelier montre un étrier de frein impossible.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Anneau aux six teintes de la marque, cadre Beast irisé sur fond métal WebGL, teintes à choisir, galerie des marques et Beast « pièce par pièce » : une vitrine qui colle à un distributeur de pièces. |
| 2. Direction artistique et harmonie | 11/15 | Graphite, bleu Winsbike, Archivo large et mono tenus partout ; mais la section atelier en fond clair rompt le rythme, les bannières des marques sont de qualité inégale, et une image Grok a un défaut de métier. |
| 3. Animations et effets | 13/15 | 60 i/s sans saccade, ouverture orchestrée (titre lisible vers 2,8 s), sections épinglées, envol vers le panier, outils qui se balancent sur le panneau, jauge dynamométrique. |
| 4. Expérience ludique et interactions | 9/10 | Teintes, kit Beast, composeur d'outils, créneaux de rendez-vous, formulaire pro par étapes avec validation, recherche, filtres, tri, panier et paiement simulés : tout répond. |
| 5. Tous les formats | 9/15 | Aucun débordement, mais titre coupé en 1920 et 320, barre d'achat posée sur le pied de page, téléphone de l'en-tête réduit à un point de 8 px, pas de barre d'action en bas sur l'accueil. |
| 6. Contenu et fiabilité | 9/10 | Catalogue et prix repris du site, images d'ambiance légendées, « à compléter » bien marqué, mentions légales présentes ; une note interne reste visible en boutique. |
| 7. Technique et performance | 7/10 | Aucune erreur JS, version sans WebGL propre ; CLS de 0,83 sur la fiche produit sur ordinateur, accueil de 6,85 Mo. |
| 8. Mise en ligne | 4/5 | Public, noindex, X-Robots-Tag, og:image 1200×630 en adresse complète, ?v= identique ; la 404 est la page générique de Vercel. |
| 9. Accessibilité | 4/5 | Focus visible, « réduire les animations » respecté, bouton dans le pied de page ; légendes à 11,5 px, cibles sous 44 px, et le bouton est caché sous la barre d'achat sur la fiche produit, sur téléphone. |
| **Total** | **79/100** | |

## Points forts

- Ouverture à la marque : l'anneau aux six teintes se referme sur le logo, puis le cadre Beast entre en 3D. Le chargeur ne revient pas d'une page à l'autre (`sessionStorage`).
- Le choix d'une teinte recolore le métal WebGL et affiche le nombre réel de produits dans cette couleur (« Rouge : 32 produits »).
- Le composeur d'outils Sumart fait pendre les outils sur le panneau, avec une physique calculée selon le temps écoulé. Le total suit (179,90 € pour 2 outils) et la jauge dynamométrique indique le seuil de livraison offerte.
- Les formulaires sont simulés proprement : messages d'erreur précis (« Le SIRET compte 14 chiffres »), confirmations honnêtes (« Rien n'a été envoyé »), paiement simulé qui reprend chèque, virement et PayPlug.
- La boutique est complète : 110 produits, recherche instantanée, filtres par marque, couleur, prix et type, tri, état vide avec réinitialisation, et panneau de filtres sur téléphone.
- Le contenu est honnête : « Image d'ambiance, pas l'atelier de Rostrenen », « Le magasin, photo du site », pastilles « à compléter » dans les mentions légales et les tarifs.

## Défauts

### Bloquants

1. **Titre d'accueil coupé au milieu du mot** : accueil, 1920×1080 (et 1728×1000), `captures/accueil-g1920-00.jpg`. On lit « protection / s. ». Cause : `assets/css/main.css:188`. `.hero__title` monte jusqu'à 112 px (`0.5rem + 5.4vw`), alors que la colonne reste bloquée vers 710 px par `--max: 1480px` (`main.css:27`) et `1.15fr` (`main.css:187`). Le découpage `SplitText` en `words,chars` (`assets/js/home.js:48`) laisse les lettres passer à la ligne à l'intérieur du mot. Correction : plafonner à 92 px (`clamp(44px, 0.5rem + 5.4vw, 92px)`) ou passer la colonne de texte à `1.4fr`. Ajouter `white-space: nowrap` sur `.hero__title .l`. Effort : petit.
2. **Image Grok de l'atelier : étrier de frein impossible** : accueil, section atelier, tous formats, `captures/accueil-p1440-17.jpg`, fichier `assets/img/grok/atelier-mains-4x5.webp`. L'étrier est tenu à la main au milieu du disque, sur les bras près du moyeu, sans aucune fixation au cadre ni à la fourche. Pour un spécialiste des pièces vélo, l'erreur saute aux yeux. Cause : image générée (`index.html:209`). Correction : régénérer (consigne dans `notes.json`) ou mettre à la place `atelier-vae-4x5.webp`, qui est juste. Effort : petit.

### Importants

1. **CLS de 0,83 sur la fiche produit, sur ordinateur** : `/produit`, 1280 à 1920, revérifié seul (0,83 en 1440, 0,79 en 1280, 0,003 en 390). Cause : `assets/js/produit.js:35-80`. Le fil d'Ariane, le nom, le prix et les sections sont injectés en JS (scripts `defer`) après le premier rendu. `.fp` grandit et pousse « Autres produits » hors de l'écran. Correction : réserver la place avec `.crumbs { min-height: 52px }` et, au-dessus de 960 px, `.fp { min-height: calc(100svh - 128px) }`. Ou garder `.fp__info` en `visibility: hidden` jusqu'à la fin de `render()`. Effort : petit.
2. **Barre d'achat posée sur le pied de page** : `/produit`, téléphone et tablette (320 à 820), `captures/produit-m390-zz.jpg`. Elle recouvre le bouton « Réduire les animations » et la dernière ligne du pied de page. Cause : `assets/js/produit.js:89` n'observe que le bouton d'ajout. Correction : masquer `.buybar` quand `.ftr` ou le formulaire d'inscription entre dans l'écran (2e IntersectionObserver), et donner `padding-bottom: var(--barres-h)` au pied de page. Effort : petit.
3. **Pas de barre d'action en bas sur téléphone (accueil, boutique)** : la seule action rapide est le téléphone de l'en-tête, réduit à un point de 8×8 px sous 980 px. Cause : `main.css:116` (`.hdr__tel span.t { display: none }`). Correction : une barre fixe « Voir la boutique » + « Appeler » sur l'accueil et la boutique, masquée sur les formulaires et le pied de page. Effort : moyen.
4. **Cibles tactiles sous 44 px et légendes à 11,5 px** : téléphone, toutes pages. Point « téléphone » de 8 px, pastilles de teinte de 34 px, boutons « Ajouter » des cartes de 36 px, « Ajouter les 3 pièces » de 40 px, fil d'Ariane de 22 px, liens du pied de page de 19 à 26 px. Légendes « Image d'ambiance » à 11,5 px (`main.css:443` et `main.css:450`). Correction : `min-height: 44px` sur `.pc__add`, `.btn--sm`, `.crumbs a` et les liens du pied de page. Pastilles à 44 px sous 600 px, légendes à 12 px. Effort : petit.
5. **Page 404 générique de Vercel** : `captures/404-p1440-00.jpg`. Cause : aucun `404.html` à la racine. Correction : `404.html` aux couleurs du site (graphite, anneau des teintes, retour à la boutique). Effort : petit.

### Finition

1. **Titre coupé à 320 px** : accueil, `captures/planche-accueil-m320.jpg`, on lit « protection / s. ». Cause : plancher de 44 px dans `main.css:188`. Correction : palier `@media (max-width: 359px) { .hero__title { font-size: 38px } }`. Effort : petit.
2. **Note interne visible en boutique** : « Module saisonnier : sélection modifiable dans le fichier de données. » (`boutique.html:71`). Correction : la retirer de la page ou la passer en commentaire HTML. Effort : petit.
3. **Galerie de la fiche produit qui dépasse à 1000×560** : le bouton et l'image dépassent de 23 à 29 px, `captures/epingle-produit-0-1000x560-50.jpg`. Cause : `main.css:700-701` (`sticky; top: 96px` et `aspect-ratio: 5/4`). Correction : `max-height: calc(100svh - 120px)` sur `.fp__stage`. Effort : petit.
4. **Accueil lourd** : 6,85 Mo sur ordinateur, 6,42 Mo sur téléphone, dont 3,6 Mo au premier écran. Correction : charger en lazy les visuels des marques et des cartes hors du premier écran, et servir les bannières de 2340 px seulement au-dessus de 1600 px. Effort : moyen.
5. **Rupture de rythme dans la section atelier** : le fond clair tranche avec le reste du site, en graphite. Correction : le passer en gris acier foncé, ou adoucir le passage par un dégradé. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,8 s / 2,8 s (chargeur jusqu'à 2,5 s, titre lu à l'étape 3 s sur les deux bandes) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0,83 (fiche produit, p1440, revérifié) ; accueil ≤ 0,009 ; boutique ≤ 0,05 |
| Poids de l'accueil, p1440 / m390 | 6,85 Mo / 6,42 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur JS (hors 404 voulue et coupures réseau) ; sans WebGL propre ; réduire les animations respecté |
| Débordement horizontal | Aucun, de 320 à 1920 |
| Sections épinglées | Marques et Beast : correctes de 1280×720 à 2560×1440 (seule l'image de fond passe sous l'en-tête) ; h3 du Beast 10 px sous l'en-tête à 1000×560 ; galerie produit dépasse de 23 à 29 px à 1000×560 ; filtres boutique dépassent de 10 px à 1024×640 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Oui / oui / oui / absent (non pénalisé) / JPG 1200×630 complet / 20261027 partout / générique Vercel |

## Vérifications écartées

- Heures « h1 » de 5,5 à 13,9 s (accueil p1280, p1440, g1920, t820) : mesures prises en parallèle. Les bandes d'ouverture, prises seules, montrent le titre lisible vers 2,8 s.
- LCP de 6 à 30 s sur la boutique et la fiche : même cause de charge. La vidéo, prise seule, donne un LCP de 348 ms sur l'accueil.
- Éléments « MASQUÉS » par `header.hdr.is-scrolled` (liens du pied de page, case d'accord) : ils sont relevés à la dernière position de défilement, quand le haut du pied de page passe normalement sous l'en-tête. Rien n'est caché une fois le défilement arrêté.
- `ERR_NETWORK_CHANGED` (boutique m360 et t820) : coupure réseau pendant la mesure, les images existent.
- Bouton « Ajouter les 3 pièces » non cliquable en 1440 pendant mon test : le clic est tombé au milieu de l'épinglage, quand le panneau n'est pas encore affiché. Le bouton est visible en fin d'épinglage (`captures/epingle-accueil-1-1280x720-92.jpg`) et fonctionne sur téléphone (3 pièces ajoutées).
- Images de fond des sections Marques et Beast sous l'en-tête : simple décor, pas un défaut.


---

## winsbike-atelier : corrections de l'étape 2

Commit f5e8357 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Titre d'accueil coupé « protection / s. » en 1920 et 1728 | Bloquant | Plafond à 92 px (`clamp(44px, 0.5rem + 5.4vw, 92px)`) et `white-space: nowrap` sur chaque ligne `.l` | `assets/css/main.css` | 112 px coupé → 92 px, 3 lignes entières, largeur de ligne = largeur utile (1920, 1728, 1440) ; `preuve-titre-1920.jpg` |
| Titre coupé à 320 px (finition, même cause) | Finition | Palier `@media (max-width: 359px)` à 38 px, avec le même `nowrap` | `main.css` | coupé → 3 lignes entières, aucun débordement ; `preuve-titre-320.jpg` |
| CLS de 0,83 sur la fiche produit, sur ordinateur | Important | Fil d'Ariane à hauteur réservée (`min-height: calc(30px + 1.55em)`) ; au-dessus de 960 px, `.fp { min-height: 100svh }` pour que « Autres produits » démarre sous le premier écran avant le rendu JS | `main.css` | CLS 0,83 / 0,79 / 0,80 / 0,68 → 0,002 / 0,027 / 0,003 / 0,006 (p1440, p1280, p1366, g1920) |
| Barre d'achat posée sur le pied de page (bouton « Réduire les animations » caché) | Important | 2e IntersectionObserver sur `.nl` et `.ftr` (classe `is-off`), `--barres-h` mesurée en JS (ResizeObserver), `padding-bottom` du pied de page égal à la barre | `assets/js/produit.js`, `main.css` | éléments couverts en bas de fiche 1 → 0 de m320 à t820 ; bouton calme cliquable ; `preuve-barre-produit-bas.jpg` |
| Pas de barre d'action en bas sur téléphone (accueil, boutique) | Important | Barre `.actbar` sous 760 px : « Voir la boutique » + « Appeler » (accueil), « Rendez-vous » (vers `#rdv`) + « Appeler » (boutique), numéro déjà présent. Visible une fois le héros dépassé, masquée sur les formulaires `#rdv` et `#pro-form`, la lettre d'information et le pied de page ; `--barres-h` mesurée, pied de page rallongé d'autant | `index.html`, `boutique.html`, `assets/js/core.js`, `main.css` | aucun élément couvert à l'ouverture ni en bas, de m320 à m430 ; `preuve-barre-accueil-milieu.jpg`, `preuve-barre-accueil-bas.jpg` |
| Cibles tactiles sous 44 px | Important | Sous 980 px : téléphone de l'en-tête 44×44 (le point de 8 px reste centré), logo 44 px. Sous 760 px : pastilles de teinte et nuancier 44 px, « Ajouter » des cartes 44 px, `.btn--sm` 44 px, nom de carte étendu par padding et marge négative, fil d'Ariane, liens du kit, de l'adresse, du pied de page et des mentions en 44 px, case d'accord en zone de 44 px (case dessinée en 18 px), bouton menu non compressible à 320 px | `main.css` | cibles < 44 px par page sur téléphone : 7 à 15 → 0 (m320 à m430, 5 pages) ; `preuve-case-m390.jpg` |
| Légendes à 11,5 px | Important | Légendes de la section atelier à 12 px | `main.css` | textes < 12 px : 2 → 0 sur l'accueil (m320 à t820) |
| Page 404 générique de Vercel | Important | `404.html` aux couleurs du site (même CSS, en-tête, pied, panier), titre « Page introuvable. », retours à l'accueil et à la boutique, `<base href="/">` pour les adresses profondes | `404.html` | 404 perso : non → oui ; débordement horizontal à 320–820 : oui → non ; `preuve-404-p1440.jpg`, `preuve-404-m390.jpg` |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Image atelier-mains-4x5 : étrier de frein impossible | Bloquant | Image Grok (à régénérer par l'utilisateur, consigne dans `notes.json`) |
| Note interne « Module saisonnier : sélection modifiable… » visible en boutique | Finition | Finition |
| Galerie de la fiche qui dépasse de 23 à 29 px à 1000×560 ; filtres boutique et panneau d'outils à 1024×640 ; h3 du Beast sous l'en-tête à 1000×560 | Finition | Finition (1280×720 et 1366×768 sont corrects) |
| Accueil lourd (6,85 Mo) | Finition | Finition (effort moyen) |
| Section atelier en fond clair | Finition | Finition |
| Cibles sous 44 px sur tablette (t820) | — | Hors périmètre téléphone ; réduites de 15 → 12 sur l'accueil |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal | 404 seule, de 320 à 820 | aucun, sur tous les formats et toutes les pages |
| Textes < 12 px (téléphone) | 2 sur l'accueil (légendes 11,5 px) | 0 |
| Cibles < 44 px (m320 à m430) | accueil 14–15, boutique 7–8, fiche 10–11, mentions 7 | 0 partout |
| Éléments couverts par une barre fixe (hors en-tête au pied de page, écarté dans le rapport) | fiche 1 (m320 à t820) | 0 |
| CLS au chargement, fiche produit sur ordinateur | 0,68 à 0,83 | 0,002 à 0,027 |
| Épinglage aux 8 tailles | Marques et Beast corrects de 1280×720 à 2560×1440 ; défauts à 1000×560 et 1024×640 | inchangé (sections non touchées) |
| Erreurs console | uniquement la 404 voulue | identique, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 (`?v=20261028-2` partout) |

## Note proposée
Ancienne note 79/100 → nouvelle note 86/100 · bloquants restants : 1
- Critère 5 (formats) 9 → 13 : titre coupé en 1920 et 320, barre d'achat sur le pied de page, téléphone d'en-tête de 8 px et absence de barre du bas, tous corrigés.
- Critère 7 (technique) 7 → 8 : CLS de la fiche produit corrigé ; le poids de l'accueil reste.
- Critère 8 (mise en ligne) 4 → 5 : page 404 aux couleurs du site.
- Critère 9 (accessibilité) 4 → 5 : légendes à 12 px, cibles de 44 px, bouton calme plus caché.
- Verdict : À peaufiner (l'image Grok de l'atelier reste bloquante).

## Images Grok définitives (29/10)

Commit 10673b7 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| atelier-mains-4x5.webp | étrier tenu au milieu du disque, sans fixation | 4:5 centré sur les mains et l’étrier (y 110 → 1090), 784×980 sans agrandissement ; l’emplacement injecté en JS (data-grok, aria-hidden) devient un `<img>` statique avec srcset 784w, sizes, width/height, lazy ; animation d’entrée (clip-path) et légende « Image d’ambiance » conservées | « Mains gantées de noir serrant à la clé Allen l’étrier de frein à disque d’une fourche, vélo sur pied d’atelier » (était vide) | accueil, 5 formats : net, 0 erreur, 0 404, CLS au chargement 0,002 (les décalages au défilement viennent des sections épinglées marques et Beast, inchangées) |

Note : 86/100 → 87/100 (critère 2 +1, image de l’atelier refaite) · bloquants : 1 → 0 · Prête à envoyer
