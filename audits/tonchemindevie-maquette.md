# tonchemindevie-maquette

<https://tonchemindevie-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 960e484 du 27/10/2026

## Verdict

**75/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Univers juste pour une magnétiseuse (trait doré qui écrit le nom, lumière WebGL, nuit/ivoire/framboise, images Grok très cohérentes) et des interactions riches qui fonctionnent. La page Soins déborde horizontalement sur téléphone et en 1280/1366, et la section épinglée « Une séance, quatre temps » coupe ses textes en 1280×720 et 1366×768.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 11/15 | Ouverture signée (nom tracé à la plume dorée, hero nuit avec lumière WebGL) très juste pour le métier, mais les photos amateurs de la cliente et les visuels vectoriels provisoires freinent l'effet premium. |
| 2. Direction artistique et harmonie | 11/15 | Fraunces italique + Manrope, palette nuit/ivoire/framboise/or et fil doré cohérents sur les 3 pages ; images Grok homogènes (aube, brume, lumière chaude), mais photos du site actuel hétérogènes et 4 visuels provisoires vectoriels. |
| 3. Animations et effets | 12/15 | 60 i/s sur portable et téléphone, titre lisible à 2 s, défilements horizontaux épinglés, anneaux qui se dissipent, compteur, souffle guidé ; la section épinglée de l'accueil coupe ses textes en 1280/1366. |
| 4. Expérience ludique et interactions | 8/10 | Demande de rendez-vous en 4 étapes avec validation, gué des Journées filtrable, compte à rebours, exercice de respiration, menu mobile (Échap OK) et Mode calme fonctionnent ; le formulaire de contact accepte un envoi vide. |
| 5. Tous les formats | 8/15 | Débordement horizontal de /soins-energetiques de 360 à 430 px (en-tête coupé à droite) et en 1280/1366, section épinglée coupée en 1280×720 et 1366×768, CTA du hero sous la barre mobile, cibles et textes trop petits. |
| 6. Contenu et fiabilité | 9/10 | Avis repris du site actuel et signalés, « à compléter » et « à confirmer » partout où il faut, dates futures cohérentes ; mentions légales seulement signalées « pages à reprendre ». |
| 7. Technique et performance | 8/10 | Aucune erreur JS, CLS 0, 1 à 1,7 Mo par page, repli sans WebGL propre ; message console « unable to create webgl context » et validation absente du formulaire de contact. |
| 8. Mise en ligne | 4/5 | Public, noindex + X-Robots-Tag, og:image JPG 1200×630 absolue, ?v= identique, pas de Cache-Control ; 404 Vercel générique. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations respectés, aria-label et aria-pressed présents, Échap ferme le menu ; plusieurs cibles < 44 px et textes < 12 px sur téléphone. |
| **Total** | **75/100** | |

## Points forts

- Ouverture signature : « Ton chemin de vie » écrit par un trait doré, puis hero nuit avec portrait en arche, titre lisible à 2 s sur les deux formats.
- Images Grok (forêt brumeuse, aube, salle de Journée, verre d'eau, plaid) très cohérentes entre elles et avec la palette, sans défaut visible.
- Interactions nombreuses et réelles : prise de rendez-vous en 4 étapes, gué des Journées « À venir / Déjà parcourues », compte à rebours, « Respirez », anneaux « couches d'oignon ».
- Rigueur du contenu : tout ce qui manque est marqué (« à compléter », « crédit à confirmer », « image provisoire du site actuel »).
- Fluidité 60 i/s sans saccade sur p1440 et m390.

## Défauts

### Bloquants

1. **Débordement horizontal de la page Soins** : /soins-energetiques, m360 (390 px de large), m390 (425 px), m430 (467 px), p1280 (1303 px), p1366 (1387 px) ; en-tête coupé à droite sur téléphone, `captures/verif-debord-soins-390.jpg`, planche `captures/planche-soins-energetiques-m390.jpg` (09 à 14). Cause : `assets/js/pages.js:139` agrandit chaque `.anneau` à `scale: 1.28` et `.couches` (`assets/css/site.css:640`) ne masque rien ; le `overflow-x: clip` du `body` (`site.css:43`) ne suffit pas. Correction : `#couches { overflow: clip; }` (section `soins-energetiques.html:143`), ou `.couches { overflow: clip; border-radius: 50%; }` avec des anneaux à 1,1 maximum. Effort : petit.
2. **Section épinglée « Une séance, quatre temps » coupée** : accueil, 1280×720 (lien « Tout savoir sur les soins » à −24 px, paragraphes des étapes à −38 px) et 1366×768 (paragraphes à −68 px), `captures/epingle-accueil-0-1280x720-8.jpg`, `captures/epingle-accueil-0-1366x768-8.jpg`. Cause : `assets/css/site.css:300` (`min-height: 100svh` + `padding-block: calc(var(--entete-h) + 40px) 50px`) et `site.css:308-309` (`.etape` à `clamp(280px, 30vw, 440px)` et `.cadre` en `aspect-ratio: 4/5`) : la hauteur de l'image dépend de la largeur, pas de l'écran. Correction : `.seance__scene { height: 100svh; }`, `.etape { display: flex; flex-direction: column; height: 100%; }`, `.etape .cadre { flex: 1; min-height: 0; aspect-ratio: auto; }` et hauteur de la piste = `100svh - var(--entete-h) - marges` mesurée en JS. Effort : moyen.

### Importants

1. **Barre mobile qui cache le CTA du hero et reste sur le formulaire et le pied de page** : accueil, Journées, Soins, m320 à m430, `captures/bande-ouverture-m390.jpg`, `captures/planche-accueil-m390.jpg` (21 à zz). Cause : `assets/css/site.css:170` (barre fixe toujours affichée) et aucun masquage dans `assets/js/site.js`. Correction : `padding-bottom: calc(var(--barres-h) + 16px)` sur `.ouv` sous 760 px, et IntersectionObserver qui masque `.barre-mobile` sur `#contact` et `footer`. Effort : petit.
2. **Visuels provisoires vectoriels** : fond du hero de l'accueil et de Soins sur ordinateur, bloc tarifs de l'accueil, « Quand la maison pèse aussi » (Soins). Cause : `index.html:55`, `soins-energetiques.html:55` et `:223` pointent vers `assets/img/provisoire/`. Correction : générer les images (voir `imagesManquantes` de `notes.json`) aux mêmes noms et tailles. Effort : petit (côté code).
3. **Page 404 générique Vercel** : `captures/404-p1440-zz.jpg`. Cause : pas de `404.html`. Correction : `404.html` nuit/ivoire avec le trait doré et un retour à l'accueil. Effort : petit.
4. **Cibles tactiles < 44 px** : téléphone, toutes pages : logo 40 px de haut (`site.css:124`), lien téléphone du hero 24 px (`site.css:240`), liens « Tout savoir sur les soins → », « Tous les articles → », « Google Maps » 42 px, liens WhatsApp et téléphone en ligne. Correction : `min-height: 44px; display: inline-flex; align-items: center;` sur `.lien`, `.ouv__infos a`, `.marque`, `.btn--petit`. Effort : petit.

### Finition

1. **Textes < 12 px sur téléphone** : `.provisoire-tag` 10,9 px (`site.css:91`), `.date-badge span` 11,2 px (`site.css:377`), `.etiquette-statut` 11,2 px (`site.css:574`), légende du plan 11,5 px (`site.css:460`). Correction : `font-size: max(12px, …)`. Effort : petit.
2. **Formulaire de contact qui accepte un envoi vide** : accueil, `captures/verif-form-p1440.jpg`. Cause : `assets/js/site.js:681` affiche « Merci ! » sans contrôle. Correction : vérifier prénom et e-mail comme dans la demande de rendez-vous avant d'afficher le message. Effort : petit.
3. **Message console sans WebGL** : « unable to create webgl context » émis par OGL avant le `catch` de `assets/js/lumiere.js:14-16`. Correction : tester `canvas.getContext('webgl')` avant `new Renderer`. Effort : petit.
4. **Galerie des toiles épinglée** : Journées, 1024×640 (légende à −38 px) et 1728×1000 (−3 px), `captures/epingle-journees-bien-etre-0-1728x1000-8.jpg`. Cause : `assets/js/pages.js:147` et tailles fixes des toiles. Correction : hauteur des toiles calée sur `100svh - --entete-h`. Effort : petit.
5. **Noms de fichiers trompeurs** : `assets/img/grok/*-16x9-1168.webp` font 1168×784 (3:2) et `*-9x16-784.webp` 784×1168 (2:3). Correction : renommer pour éviter des erreurs de recadrage. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2 s / 2 s (bandes d'ouverture, intro « Ton chemin de vie » de 1,5 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,0008 |
| Poids de l'accueil, p1440 / m390 | 1,66 Mo / 1,54 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune erreur JS ; sans WebGL : message OGL, repli propre ; réduire les animations : OK |
| Débordement horizontal | /soins-energetiques : m320 344, m360 390, m390 425, m430 467, p1280 1303, p1366 1387 px (confirmé, scrollX 23 px en 1280) |
| Sections épinglées | accueil #seance : texte coupé en 1280×720 et 1366×768 (bloquant) ; Journées #toiles : images et légendes à 1024×640 et 1728×1000 seulement |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui · oui · oui · absent (non pénalisé) · JPG 1200×630 absolue · 20261027 partout · 404 Vercel générique |

## Vérifications écartées

- h1 à 1922 ms et LCP 5388 ms sur /soins-energetiques p1440 : mesure prise avec 5 maquettes en parallèle ; les autres formats de la même page sont entre 185 et 385 ms et la bande d'ouverture montre le titre à 2 s.
- « MASQUÉ par header.entete » au pied de page (p1366, p1440, t820, g1920, m320 à m430) : capture du pied de page où le dernier bloc défile sous l'en-tête translucide, rien n'y reste caché.
- Journées #toiles, « img sort de l'écran » en 1280×720 et 1366×768 : seule l'image de la toile dépasse, les titres sont visibles (`captures/epingle-journees-bien-etre-0-1366x768-8.jpg`) ; pas un défaut selon la règle.
- ERR_NETWORK_CHANGED sur deux images du blog en m360 : coupure réseau du poste de mesure, non reproduite sur les autres formats.
- Main dans `journees-carences-1x1` (bol tenu à deux mains) : 5 doigts par main, gestes plausibles, pas de défaut.


---

## tonchemindevie-maquette : corrections de l'étape 2

Commits b2504e5 et efeb828 (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Débordement horizontal de la page Soins | Bloquant | `#couches { overflow: clip; }` : les anneaux qui grandissent (scale 1.28) restent dans leur section | `assets/css/site.css` | scrollWidth m320 344 → 320, m360 390 → 360, m390 425 → 390, m430 467 → 430, p1280 1303 → 1280, p1366 1387 → 1366 |
| Section épinglée « Une séance, quatre temps » coupée | Bloquant | Méthode « Tout tenir dans l'écran » : `.seance__scene` en `height: 100svh` et une rangée `minmax(0, 1fr)`, haut réservé par `--entete-zone` (en-tête mesuré en JS, ResizeObserver), étapes en colonne flex `height: 100%`, cadre en `flex: 1; min-height: 0` (image en `object-fit: cover`), palier `max-height: 600px`, `anticipatePin` retiré | `site.css`, `assets/js/site.js`, `assets/js/pages.js` | Coupes à 50 % et 92 % : 1000×560, 1024×640, 1280×720 → aucune. Cadre exactement égal à l'écran (pinBottom = hauteur). À 8 %, l'outil voit encore 4 à 64 px dépasser : retard de Lenis. Remesuré en position stabilisée (`scrollTo immediate` + 1,5 s) : pinTop 0, rien de coupé aux 8 tailles (`preuve-seance-*.jpg`, `preuve-epingle-1366x768.jpg`) |
| Barre mobile qui cache le bouton du héros et reste sur le formulaire et le pied de page | Important | Barre masquée par défaut, affichée par IntersectionObserver seulement hors héros (`.ouv`), hors `#contact`, hors formulaire de `main` et hors pied de page, et masquée quand le menu est ouvert. Absente de la 404. `--barres-h` mesurée en JS, ajoutée au `padding-bottom` du dernier bloc (`.appel`) | `site.css`, `site.js` | Éléments couverts par `div.barre-mobile` de m320 à m430 : 9 → 0. Clics vérifiés sur les 3 pages : masquée en haut, sur le contact, sur le pied et avec le menu ouvert, visible au milieu de la page (`preuve-heros-m390.jpg`, `preuve-barre-milieu-m390.jpg`, `preuve-pied-sans-barre-m390.jpg`) |
| Page 404 générique de Vercel | Important | `404.html` à la charte : même CSS, en-tête, menu mobile et pied de page, fond nuit, titre court et bouton « Retour à l'accueil ». Adresses absolues, valables à toute profondeur. Rendez-vous menant à `#contact` | `404.html`, `site.css` | Statut 404, menu OK, retour à l'accueil OK, scrollWidth m390 980 → 390 (`preuve-404-*.jpg`) |
| Cibles < 44 px | Important | Sous 900 px : `min-height: 44px` sur `.marque` et `.btn--petit` ; `.lien`, `.ouv__infos a`, `.coord a` et `.pied ul a` en `inline-flex` de 44 px de haut, `min-width: 44px` sur les liens du pied | `site.css` | Cibles signalées par format de téléphone : 2 à 7 → 0 dans la mesure après complète, relancée après le second commit |
| Galerie des toiles épinglée (Journées) coupée de 7 à 50 px, légendes comprises (bloquante en 1280×720 et 1366×768) | Bloquant (reclassé) | Second commit. « Tout tenir dans l'écran » au-dessus de 900 px hors Mode calme : `#toiles` en `height: 100svh`, colonne flex, haut réservé par `--entete-zone`, `.toiles` en `flex: 1; min-height: 0`, toile en colonne, cadre en `flex: 1; min-height: 0` avec image `height: 100%` et `object-fit: contain`, légende à hauteur naturelle, palier `max-height: 600px`. `anticipatePin` retiré de `pages.js:147`. Les tailles fixes venaient du CSS (`aspect-ratio: 1` du cadre) : `pages.js:147` n'en contenait pas | `site.css`, `pages.js` | Mesure après : 0 coupe aux 8 tailles × 3 positions (avant : 1000×560, 1024×640, 1280×720, 1366×768, 1728×1000). Position stabilisée : pinTop 0, rien de coupé (`preuve-toiles-*.jpg`) |
| Mode calme de la séance sur ordinateur, cassé par le premier commit (hauteur 100svh appliquée à une piste en grille) | Régression | Second commit : hauteur automatique et cadres en 4/5 rétablis sous `.calme` | `site.css` | Mode calme en 1280×720 : séance et toiles en grille, rien de coupé (`preuve-calme-*.jpg`) |
| Textes < 12 px | Finition (demandé) | `max(12px, …)` sur `.provisoire-tag`, `.marque__nom small`, `.date-badge span`, `.compte span`, `.carte-plan figcaption`, `.etiquette-statut`, `.lieux__image .consigne` ; plancher 12 px sur les étiquettes des anneaux ; texte SVG des plans 11 → 12 | `site.css`, `index.html`, `journees-bien-etre.html` | Textes signalés : 4 à 7 par format → 0 sur tous les formats |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Visuels provisoires vectoriels (héros de l'accueil et de Soins sur ordinateur, bloc tarifs, « Quand la maison pèse aussi ») | Important | Donnée manquante : images à produire (voir `imagesManquantes` de `notes.json`) |
| Formulaire de contact qui accepte un envoi vide | Finition | Finition |
| Message console OGL sans WebGL | Finition | Finition |
| Noms de fichiers Grok trompeurs (3:2 nommés 16x9) | Finition | Finition |
| Photos du site actuel hétérogènes | (notes c1, c2) | Donnée client |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement /soins-energetiques | m320 344, m360 390, m390 425, m430 467, p1280 1303, p1366 1387 | aucun (320, 360, 390, 430, 1280, 1366) |
| Débordement accueil, Journées, autres formats | aucun | aucun |
| Débordement 404 (téléphone, t820) | 980 (page Vercel) | aucun |
| Textes < 12 px (accueil / Journées / Soins, m320 à t820) | 4 à 6 / 6 à 7 / 0 à 1 | 0 / 0 / 0 |
| Cibles < 44 px (accueil / Journées / Soins, téléphone) | 7 / 5 / 2 à 3 | 0 / 0 / 0 |
| Éléments couverts par la barre mobile (m320 à m430) | 9 (h1, chapo, boutons et lien du héros) | 0 |
| Éléments couverts par l'en-tête au pied de page | 1 à 3 par format | 2 par format (déjà écarté par l'audit : en-tête translucide sur le dernier écran) |
| Épinglage #seance, 50 % et 92 % | coupé à 1000×560 (93 px), 1024×640 (22 px), 1280×720 (38 px) | rien de coupé aux 8 tailles |
| Épinglage #seance, 8 % | coupé de 46 à 68 px de 1000×560 à 1366×768 | 4 à 64 px dans l'outil (retard de Lenis) ; 0 en position stabilisée |
| Épinglage #toiles (Journées) | coupes de 3 à 50 px à 1000×560, 1024×640, 1280×720, 1366×768, 1728×1000 | aucune aux 8 tailles |
| Erreurs console | 0, sauf 404 du document sur la page introuvable | identique |
| Modules chargés deux fois | aucun | aucun (22 références en `?v=20261028-2`, aucune ancienne) |

## Note proposée
Ancienne note 75/100 → nouvelle note 83/100 · bloquants restants : 0 · verdict : À peaufiner (sous 85)
- Bloquants : 2, puis 3 avec la galerie des toiles reclassée → 0.
- Critère 3 (animations) : 12 → 13. La section épinglée de l'accueil ne coupe plus ses textes. La galerie des toiles corrigée n'était pas citée dans la justification.
- Critère 5 (formats) : 8 → 13 (la galerie des toiles n'y était pas citée). Débordement de Soins, épinglage, barre mobile sur le héros, cibles et textes corrigés (5 défauts cités).
- Critère 8 (mise en ligne) : 4 → 5. La 404 est à la charte.
- Critère 9 (accessibilité) : 4 → 5 (maximum). Cibles ≥ 44 px et textes ≥ 12 px.
- Critères 1, 2, 4, 6 et 7 inchangés : visuels provisoires, formulaire de contact et message OGL toujours présents.

## Images Grok définitives (29/10)

Commit eda7b54 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| accueil-ouverture-16x9 | illustration vectorielle du hero de l’accueil (ordinateur) + étiquette « Visuel provisoire · image Grok à venir » | 16:9 (y 100–757, chemin et halo entiers, troncs sombres à gauche sous le texte) ; 640, 1280, « 1920 » produit en 1752×986 (1,5× max), srcset corrigé en 1752w | « Un sentier dans une forêt brumeuse, traversé par la lumière du soleil levant » | 5 formats, texte lisible (voile nuit à gauche) |
| soins-ouverture-16x9 | illustration du hero Soins (ordinateur) + étiquette | 16:9 (y 110–767, table de soin, bougie et rideau entiers, mur nuit à gauche) ; 640, 1280, 1752 | « Une table de soin drapée de lin dans une pièce sombre, près d’une fenêtre voilée, avec une bougie allumée et des pierres sur un guéridon » | idem |
| accueil-tarifs-16x9 | fond vectoriel des tarifs | 16:9 (y 64–721, rayon de lumière et plancher) ; 640, 1280, 1752 ; alt vide conservé (décor sous voile ivoire) | — | tarifs lisibles en 1440 et 390 |
| accueil-lieux-2x3 | cadre « Quand la maison pèse aussi » (soins-energetiques.html) + étiquette | 2:3 (x 3–781) ; 640×961, « 1280 » produit en 1167×1752 (1,5× max), srcset 1167w, width/height 1167×1752 | « Un coin de pièce calme : une fenêtre voilée, une bougie sur le rebord et une plante en pot dans un rayon de soleil » | révélation et parallaxe intactes |

Ménage : étiquettes « Visuel provisoire » retirées, règle `.provisoire-tag--ordi` supprimée (`.provisoire-tag` gardée pour l’image provisoire de la Journée hypersensibilité, issue du site actuel). Versions `v=20261028-2` → `v=20261029`. Contrôles : 0 404, 0 erreur console ; CLS au chargement 0,000 sur les deux pages, ≤ 0,0004 sur Soins après défilement ; sur l’accueil ordinateur, 1,69 en défilement programmé, dû à `section.seance` épinglée, identique avant modification (1,689), non lié aux images. Point à signaler : sur téléphone, le hero Soins affiche l’image 9:16 existante (forêt), l’alt décrit la version ordinateur.

Note : 83/100 → 85/100 (critère 1 : 11 → 12 et critère 2 : 11 → 12, visuels vectoriels provisoires remplacés) · bloquants : 0 → 0 · Prête à envoyer

### Réglage du 29/10 (commit fabc895, non poussé)

Hero de la page Soins : image déclarée décorative (`alt=""`, ordinateur et téléphone), car elle sert de fond derrière le titre. La forêt 9:16 reste sur téléphone en attendant la version verticale de la salle de soins fournie par l'utilisateur (`assets/img/grok/soins-ouverture-9x16-640` et `-784`). Vérifié en 1440×900 et 390×844 : image chargée, aucune erreur.
