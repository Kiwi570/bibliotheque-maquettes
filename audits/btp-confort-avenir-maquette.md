# btp-confort-avenir-maquette

<https://btp-confort-avenir-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 25b6a30 du 27/10/2026

## Verdict

**75/100 · À peaufiner · 4 défaut(s) bloquant(s)**

Concept « Du plan au réel » original et juste pour une entreprise du bâtiment (tracé de plan qui devient photo, planches métiers épinglées, coupe thermique), fluide à 60 i/s et sans erreur. Mais les téléphones courants cassent : mentions légales coupées à droite, bouton menu à moitié hors écran à 360 px, et petit débordement sur Isolation.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture signature (plan tracé à « Tracé 100 % » puis fondu vers la photo) et planches de plans très originales, mais le titre n'est entièrement lisible qu'à 3 s. |
| 2. Direction artistique et harmonie | 12/15 | Papier millimétré, bleu de Prusse, orange chantier, Archivo large et Plex Mono : cohérent sur toutes les pages, images Grok homogènes (lumière chaude, enduits clairs) ; « Maçonneri / e » coupé en 1920 et en-tête serré en 1280 abîment la finition. |
| 3. Animations et effets | 11/15 | 59,9 i/s sans saccade, galerie de planches épinglée, avant/après, dessin des SVG ; la coupe thermique d'Isolation épinglée sort de l'écran sous 900 px de haut. |
| 4. Expérience ludique et interactions | 8/10 | Menu, mode calme, carte de zone, avant/après, filtres, fiches en dialogue, maison éclatée et devis en 4 étapes fonctionnent tous et se comprennent sans mode d'emploi. |
| 5. Tous les formats | 7/15 | Débordement de 578 px sur Mentions légales (360 à 430), bouton menu coupé à 360 et invisible à 320, hero coupé à 320, 6 px de débordement sur Isolation, textes de 10 px et boutons de 42 px. |
| 6. Contenu et fiabilité | 9/10 | Données manquantes toutes marquées « à compléter », horaires sourcés « à confirmer », mentions légales complètes ; rien d'inventé repéré. |
| 7. Technique et performance | 9/10 | Aucune erreur console, CLS max 0,041, accueil 1,75 Mo, repli sans WebGL propre ; pas de ?v= sur le CSS et le JS. |
| 8. Mise en ligne | 3/5 | noindex, X-Robots-Tag et og:image 1200×630 corrects, mais aucun ?v= et 404 Vercel générique. |
| 9. Accessibilité | 4/5 | Mode calme et « réduire les animations » respectés (titre à 0,3 s), contrôles en boutons natifs, `details` et `dialog` ; textes sous 12 px et cibles sous 44 px sur téléphone. |
| **Total** | **75/100** | |

## Points forts

- Idée forte et propre au métier : chaque corps d'état présenté comme une planche d'architecte (cartouche, échelle, indice), le plan qui se dessine avant la photo à l'ouverture.
- Fluidité parfaite (59,9 i/s portable, 59,8 i/s téléphone, aucune image > 50 ms) malgré WebGL, GSAP et canvas.
- Interactions nombreuses et toutes fonctionnelles : avant/après au réglet, maison éclatée en 6 zones, coupe thermique pilotée au défilement, devis en 4 étapes avec validation, fiches chantier en `<dialog>` fermables à Échap.
- Honnêteté du contenu : « à compléter » visible partout où il manque une donnée, « Schéma illustratif », « Visuel provisoire », « Horaires relevés sur Mappy, à confirmer ».
- Images Grok cohérentes entre elles et avec les photos du client (lumière méditerranéenne chaude, enduits clairs, tuiles rondes).

## Défauts

### Bloquants

1. **Mentions légales coupées à droite sur téléphone** : /mentions-legales, m360, m390, m430 (page large de 578 px, titres et paragraphes tronqués), `captures/planche-mentions-legales-m390.jpg`, `captures/mentions-legales-m390-01.jpg`. Cause : `assets/css/style.css:712` passe `.legal` en `grid-template-columns: 1fr` (minimum auto) et `assets/css/style.css:702` laisse `.legal article` en grille auto : la largeur minimale du tableau RGPD (562 px) élargit toute la colonne, le sommaire et le texte. Correction : `@media (max-width: 860px) { .legal { grid-template-columns: minmax(0, 1fr); } }` et `.legal article { grid-template-columns: minmax(0, 1fr); min-width: 0; }` ; le `.table-wrap` (`style.css:707`) fera alors défiler le tableau seul. Effort : petit.
2. **Bouton menu à moitié hors écran à 360 px (hors écran à 320 px)** : toutes les pages, m360 (bouton de 336 à 382 px) et m320 (seul le bouton « Mode calme » reste visible, le menu est inaccessible), `captures/accueil-m320-00.jpg`. Cause : `assets/css/style.css:179` `.brand { flex: none; }` (marque de 242 px) + `.header__tools` (104 px) dépassent la largeur sous 398 px ; rien ne se réduit. Correction : `.brand { flex: 0 1 auto; min-width: 0; }`, `.brand__name { overflow: hidden; text-overflow: ellipsis; }`, et sous 400 px logo à 48 px et `gap: 10px` ; mesurer à 320, 360 et 390. Effort : petit.
3. **Débordement horizontal de 6 px sur Isolation** : /isolation, m360 et m390 (la page bouge latéralement au doigt), `captures/isolation-m390-06.jpg`. Cause : `assets/css/style.css:657-658`, le « + » de la FAQ tourné à 45° quand une question est ouverte dépasse le bord du `summary` (seul élément dont le retrait supprime le débordement). Correction : `.faq summary::after { flex: none; width: 1em; text-align: center; }` et `.faq summary { padding-right: 4px; }` (ou `overflow: clip` sur `.faq`). Effort : petit.
4. **Image Grok avec un défaut visible : échafaudage impossible** : bandeau « Un projet d'isolation ? Parlons-en. » et bloc « Ce que vous pouvez vérifier », tous formats, `assets/img/grok/isolation-chantier-facade-1168.webp` (et la déclinaison 480). Les montants passent devant le toit et le toit bas, aucun plancher de travail : pour une entreprise du bâtiment, le défaut se voit. Requalifié en bloquant lors de la consolidation (règle commune : image Grok avec un défaut visible). Correction : régénérer avec la consigne de `images-grok-a-regenerer.md`. Effort : petit.

### Importants

1. **Hero coupé à 320 px** : accueil, m320, « Construisons » et le paragraphe tronqués à droite, `captures/accueil-m320-00.jpg`. Cause : `assets/css/style.css:120` `.display` trop grand pour 320 px avec des mots en `nowrap` (`div.w` du SplitText). Correction : palier `@media (max-width: 359px) { .display { font-size: 2.35rem; } }`. Effort : petit.
2. **Section épinglée « Là où la chaleur s'échappe » qui sort de l'écran** : /isolation, 1000×560 à 1440×900 (schéma coupé de 55 à 148 px au début de l'épinglage, note coupée de 9 px en 1280×720 et 1366×768), `captures/epingle-isolation-0-1280x720-8.jpg`, `captures/epingle-isolation-0-1280x720-50.jpg`. Cause : `assets/js/isolation.js:97` épingle `#coupe` avec `start: 'center center'` alors que le cadre `[data-coupe-box]` a une hauteur fixée par son ratio. Correction : épingler avec `start: 'top top+=' + hauteurEnTête`, section en colonne flex de 100svh, cadre en `flex: 1; min-height: 0` ; hauteur d'en-tête mesurée en JS (`--entete-h`). Effort : moyen.
3. **Titre « Maçonneri / e » coupé dans la planche en 1920×1080** : accueil, g1920, `captures/accueil-g1920-04.jpg`. Cause : `assets/css/style.css:347` `overflow-wrap: anywhere` sur `.planche__info h3` avec une taille calée sur `vw` alors que la colonne reste étroite. Correction : `overflow-wrap: normal; hyphens: manual;` et taille en unités de conteneur (`container-type: inline-size` sur `.planche__info`, `font-size: clamp(1.6rem, 11cqi, 2.9rem)`). Effort : petit.
4. **En-tête serré en 1280×720** : toutes les pages, p1280, « Nos services » sur deux lignes, liens collés en haut, `captures/accueil-p1280-00.jpg`. Cause : `assets/css/style.css:218`, le menu complet n'est masqué que sous 1100 px alors que la pastille « Fermé · ouvre demain à 9 h » et « Mode calme » s'y ajoutent. Correction : `white-space: nowrap` sur les liens du menu et masquer `.open-pill` sous 1360 px. Effort : petit.
5. **Pas de barre d'action fixe en bas sur téléphone** : toutes les pages, m390. Cause : absente du gabarit. Correction : barre « Devis gratuit » + contact (numéro à compléter), masquée par IntersectionObserver sur le formulaire et le pied de page. Effort : moyen.
6. **Textes sous 12 px et cibles sous 44 px sur téléphone** : légendes photo 10,2 px, « Avant/Après » 10,9 px, `dt` des mentions 11,2 px, étiquettes « Illustration » 9,9 px ; boutons `.btn--sm` et puces de 42 px, « Copier l'adresse » 18 px, fil d'Ariane 19 px. Cause : `assets/css/style.css` (`.photo-cap`, `.ba__lbl`, `.slot__tag`, `.btn--sm`, `.chip`, `.copy`, `.crumbs a`). Correction : `font-size: max(12px, …)` sur ces étiquettes, `min-height: 44px` sur `.btn--sm`, `.chip`, `.copy`, `.crumbs a`. Effort : petit.

### Finition

1. **Pas de ?v= sur le CSS et le JS du site** : 4 pages, `style.css`, `data.js`, `drawings.js`, `app.js`, `home.js`, `isolation.js`, `realisations.js`. Correction : même `?v=2026102701` partout. Effort : petit.
2. **404 générique Vercel** : `captures/404-p1440-00.jpg`. Correction : `404.html` sur papier millimétré avec une planche « Plan introuvable » et retour à l'accueil. Effort : petit.
3. **Ouverture à 3 s pile** : le plan se trace de 0,5 à 2 s, le titre se lit en entier à 3 s (`captures/ouverture-p1440-t3000.jpg`, `captures/ouverture-m390-t3000.jpg`). Correction : raccourcir le tracé d'environ 0,5 s (`assets/js/home.js`, chronologie d'intro). Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 3,0 s / 3,0 s (tracé du plan puis fondu ; h1 à 2,4 s et 2,3 s en vidéo) |
| Fluidité p1440 / m390 | 59,9 i/s / 59,8 i/s (très bien) |
| CLS au chargement (max) | 0,041 (/realisations t820) |
| Poids de l'accueil, p1440 / m390 | 1,75 Mo / 1,06 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur sur les pages ; sans WebGL : repli sur photos, h1 à 2,4 s ; réduit : h1 à 0,2-0,3 s, pas d'intro |
| Débordement horizontal | /mentions-legales 578 px (m320 à m430), /isolation 396 px (m390) et 366 px (m360, + en-tête) ; accueil m320 coupé sans défilement |
| Sections épinglées | Accueil : planches et méthode OK ; Isolation : coupe thermique hors écran de 1000×560 à 1440×900 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex OK · X-Robots-Tag OK · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v= absent · 404 Vercel générique |

## Vérifications écartées

- Ouvertures « h1 » de 3,9 à 5,3 s sur l'accueil (m320, m360, p1366, t820, g1920) : mesurées avec 5 maquettes en parallèle ; la mesure seule donne 2,4 s (p1440) et 2,3 s (m390), et les étapes montrent le titre lisible à 3 s.
- h1 « null » en p1280 et p1440 : le titre est masqué par SplitText pendant l'intro ; il est bien visible sur `captures/accueil-p1440-00.jpg`.
- Erreur « Failed to load resource 404 » : uniquement sur la page introuvable de test, normale.
- « MASQUÉ » sur /mentions-legales m360 (texte du pied sous l'en-tête) : instant de défilement, l'en-tête n'a pas de fond permanent sur ce texte.
- Isolation, épinglage : « h2 sous l'en-tête » pendant la coupe thermique : le titre défile volontairement au-dessus du schéma épinglé, il n'est pas caché par l'en-tête (en-tête masqué au défilement, hauteur 0).
- 1re mesure de fluidité p1440 avec 2 images > 100 ms : non reproduite.
- Images Grok : mains (gant du maçon), outils, plans, plomberie et isolants vérifiés en taille réelle, sans déformation ni texte.


---

## btp-confort-avenir-maquette : corrections de l'étape 2

Commit 879ef1b (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Mentions légales coupées à droite sur téléphone | Bloquant | `.legal` en `minmax(0, 1fr)` sous 860 px, `.legal article` en `minmax(0, 1fr)` + `min-width: 0` : le tableau RGPD défile seul dans `.table-wrap` | style.css | largeur 578 px → 320/360/390/430 px (preuve-mentions-*.jpg) |
| Bouton menu à moitié hors écran à 360 px, absent à 320 px | Bloquant | `.brand` réductible (`flex: 0 1 auto; min-width: 0`), nom en ellipse, outils en `flex: none` poussés à droite sous 1100 px, logo 48 px et écarts réduits sous 400 px | style.css | bord droit du bouton 382 px à 360 → 344 ; 304 à 320 (preuve-hero-entete-m320.jpg) |
| Débordement de 6 px sur Isolation | Bloquant | « + » de la FAQ en `flex: none; width: 1em`, `padding-right: 6px` sur le `summary` | style.css | 326/366/396 → 320/360/390 |
| Hero coupé à 320 px | Important | `.hero` en `grid-template-columns: minmax(0, 1fr)` (le titre n'élargit plus la colonne), titre à 2,1rem sous 360 px | style.css | h1 et paragraphe entiers à 320 (preuve-hero-entete-m320.jpg) |
| Coupe thermique épinglée qui sort de l'écran | Important | Méthode « Tout tenir dans l'écran » : section entière épinglée en `start: 'top top'`, 100svh en colonne flex, `padding-top` = `--entete-h` mesurée en JS (ResizeObserver), cadre en `flex: 1; min-height: 0`, palier `max-height: 600px` | isolation.js, app.js, style.css | défauts d'épinglage 1/5/7/7/5/3/2 → 0 aux 7 tailles concernées (preuve-epingle-*.jpg) |
| « Maçonneri / e » coupé en 1920 | Important | `.planche__info` en `container-type: inline-size`, titre en `clamp(1.6rem, 14cqi, 2.9rem)`, `overflow-wrap: normal` | style.css | 5 titres entiers de 820 à 1920 (preuve-maconnerie-g1920.jpg) |
| En-tête serré en 1280 | Important | liens du menu en `nowrap`, pastille d'horaires masquée sous 1360 px | style.css | « Nos services » sur une ligne, en-tête 1280/1280 (preuve-entete-p1280.jpg) |
| Pas de barre fixe du bas | Important | Barre « Demander un devis gratuit » (lien vers `#devis`) sous 760 px, sans numéro ; visible après le premier écran, masquée sur le formulaire, le pied et le menu ouvert (IntersectionObserver) ; `--barres-h` mesurée, ajoutée au `padding-bottom` du pied | 4 pages, app.js, style.css | menu ouvert : barre cachée ; clic : défile au formulaire, barre masquée (preuve-barre-devis-m390.jpg) |
| Textes < 12 px | Important | plancher `max(12px, …)` sur les règles de classe (`.todo`, `.demo-note`, `.photo-cap`, `.slot__tag`, `.ba__lbl`, `.legal dt`, `.table-wrap th`, `.footer h4`, `.dlg-cart dt`, `.flabel`, `.copy`, `.cartouche .k`, etc. : 21 règles) | style.css | 176 à 205 → 4 par format (voir mesures) |
| Cibles < 44 px | Important | `min-height: 44px` sur `.btn--sm`, `.chip`, `.copy` ; sur téléphone et écrans tactiles : fil d'Ariane, itinéraire, sommaire des mentions, réseaux sociaux, liens du pied | style.css | 84 à 103 → 0 par format téléphone, 96 → 0 en t820 |
| 404 générique | Finition (signalée) | `404.html` à la charte (même CSS, en-tête, pied, barre), titre « Page introuvable » et retour à l'accueil, chemins absolus | 404.html | page Vercel → page du site, statut 404 (preuve-404-*.jpg) |
| ?v= | Finition | `v=20261028` → `v=20261028-2` partout, import dynamique de `gl.js` compris | 5 HTML, home.js | aucun `v=20261028` restant, aucun module en double |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Échafaudage impossible (`assets/img/grok/isolation-chantier-facade-*.webp`) | Bloquant | image Grok : à régénérer par l'utilisateur |
| Ouverture lisible à 3 s pile | Finition | finition |
| Numéro de téléphone absent de la barre | — | donnée manquante (masqué sur le site actuel) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement m320 | /isolation 326, /mentions-legales 578, 404 980 | aucun |
| Débordement m360 | /isolation 366, /mentions-legales 578, 404 980 | aucun |
| Débordement m390 | /isolation 396, /mentions-legales 578, 404 980 | aucun |
| Débordement m430 | /mentions-legales 578, 404 980 | aucun |
| Débordement t820 | 404 980 | aucun |
| Débordement p1280 / p1366 / p1440 / g1920 | aucun | aucun |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 205 / 189 / 201 / 176 / 170 | 4 / 4 / 4 / 4 / 0 (les 4 restants : libellés `ol.form__progress li` volontairement à `font-size: 0` sous 640 px, texte non affiché) |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 84 / 93 / 103 / 102 / 96 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts | 1 par format (titre sous le calque d'intro, en-tête sur la 404 Vercel) | 1 sur 4 formats : titre du hero sous le calque d'intro à l'ouverture (animation d'entrée, déjà présent avant) |
| Épinglage Isolation (1000×560 → 1920×1080) | 1 / 5 / 7 / 7 / 5 / 3 / 2 défauts | 0 partout (2560×1440 : 0 avant comme après) |
| Épinglages accueil (planches, méthode) | 0 | 0 |
| Erreurs console (hors 404 attendue) | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 75/100 → nouvelle note 86/100
- 2. Direction artistique 12 → 13 : « Maçonnerie » entier en 1920 et en-tête sur une ligne en 1280 ; l'échafaudage Grok reste.
- 3. Animations 11 → 12 : la coupe thermique épinglée tient dans l'écran aux 8 tailles.
- 5. Tous les formats 7 → 13 : plus aucun débordement ni bouton coupé de 320 à 1920, hero entier à 320 ; nom de marque abrégé à 320 px.
- 8. Mise en ligne 3 → 5 : ?v= identique partout et 404 à la charte.
- 9. Accessibilité 4 → 5 : textes ≥ 12 px et cibles ≥ 44 px sur téléphone.

Bloquants restants : 1 (image Grok de l'échafaudage).

## Images Grok définitives (29/10)

Commit 4edf239 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| isolation-chantier-facade-1168.webp + -480 | échafaudage impossible, sans plancher | 3:2 (y 2 → 781), 1168×779 et 480×320 ; width/height corrigés en 1168×779 | accueil « Ce que vous pouvez vérifier » : « Maison en pierre aux volets verts sous échafaudage, panneaux isolants blancs posés sur une partie de la façade, au soleil couchant » ; bandeau d’Isolation : alt vide conservé (fond décoratif sous le titre) | accueil et /isolation, 5 formats : net, titre du bandeau lisible, 0 erreur, 0 404, CLS au chargement ≤ 0,02 (les décalages au défilement viennent des planches épinglées, inchangées) |

Note : 86/100 → 86/100 (l’échafaudage n’était pas cité dans la justification d’origine du critère 2) · bloquants : 1 → 0 · Prête à envoyer
