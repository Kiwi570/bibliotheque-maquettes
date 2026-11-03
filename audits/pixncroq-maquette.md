# pixncroq-maquette

<https://pixncroq-maquette.vercel.app> · audit du 27/10/2026 · dernier commit b4e5c68 du 23/10/2026

## Verdict

**77/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Maquette riche et très cohérente avec le métier (ouverture en diaphragme, réglages EXIF, salle des 11 séances, calculateur, composeur de séance, « voir au mur », panier, formulaire en 4 vues), fluide à 59 i/s. Deux coupures de texte sur des formats courants (adresse e-mail du menu sur tous les téléphones, surtitre du hero sous le logo à 1280×720) l'empêchent d'être envoyée telle quelle.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro « boîtier photo » (ouverture, vitesse, ISO) puis diaphragme qui révèle la photo de mariage : idée propre au métier, titre lisible à 2 s, mais le premier écran reste un hero photo classique une fois ouvert. |
| 2. Direction artistique et harmonie | 12/15 | Palette « heure dorée » crème et brun, serif fin + grotesque, rythme maîtrisé ; images Grok toutes dans la même lumière chaude, sans personne, et signalées comme ambiance. |
| 3. Animations et effets | 12/15 | Galerie horizontale épinglée, diaphragme collant du déroulé, logo du pied tracé, boutons magnétiques, curseur ; 58,7 / 59,2 i/s sans saccade. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne : calcul des frais par commune, composeur de séance avec estimation, voir au mur, fiche produit, panier, visionneuse, formulaire en 4 vues avec validation et récapitulatif. |
| 5. Tous les formats | 9/15 | Aucun débordement horizontal, mais e-mail du menu coupé de 360 à 430 px, surtitre du hero sous l'en-tête à 1280×720, légendes de la galerie qui se chevauchent à 1280 et 1366, textes et cibles trop petits. |
| 6. Contenu et fiabilité | 9/10 | Textes, prix et coordonnées repris du site actuel (data.js), « à compléter » bien marqué, ambiances générées signalées, mentions légales présentes. |
| 7. Technique et performance | 7/10 | Aucune erreur console, CLS 0,014 max, repli sans WebGL propre ; mais /boutique, /seances et /mentions répondent 404 (cleanUrls désactivé). |
| 8. Mise en ligne | 3/5 | Public, noindex dans chaque page, og:image 1200×630 absolue, ?v= cohérent, 404 aux couleurs ; X-Robots-Tag absent et règles Cache-Control dans vercel.json. |
| 9. Accessibilité | 4/5 | Focus visible (contour 2 px ocre/miel), menu et fenêtres qui gardent le focus, Mode calme dans l'en-tête et dans le menu mobile, « réduire les animations » respecté ; cibles de 36 à 40 px sur téléphone. |
| **Total** | **77/100** | |

## Points forts

- Concept photo filé partout : réglages EXIF réels sous chaque photo, numéro de « vue » dans l'en-tête, déroulé en ouverture f/16 → f/1.8.
- Photos de la cliente jamais recadrées dans la visionneuse ; images générées sans personne et étiquetées « Ambiance · photos à venir ».
- Interactions complètes et crédibles : composeur de séance qui recalcule le total, voir au mur à l'échelle, panier avec retrait ou livraison, formulaire en 4 vues avec messages d'erreur clairs.
- Fluidité très bonne (58,7 i/s portable, 59,2 i/s téléphone), CLS négligeable, ouverture en 2 s, version sans WebGL et « réduire les animations » propres.
- Bouton « Masquer les notes de maquette » pour présenter le site à la cliente.

## Défauts

### Bloquants

1. **Adresse e-mail et téléphone du menu mobile coupés** : accueil et toutes les pages, m360, m390, m430 (« croqnpix@gmail.co… » sort de l'écran à droite, lien e-mail jusqu'à 475 px de large), `captures/x-menu-m390.jpg`, `captures/x-menu-m360.jpg`. Cause : `assets/css/main.css:140`, `.menu a { font-size: clamp(2.4rem, 11vw, 4rem) }` s'applique aussi aux liens de `.menu__pied` (`index.html:75`). Correction : `.menu .menu__pied a { font-family: var(--f-texte); font-size: var(--t-l); overflow-wrap: anywhere; }`. Effort : petit.
2. **Surtitre du hero caché sous l'en-tête à 1280×720** : accueil, p1280 (« Photographe lifestyle · Ugny, près de Longwy » à 34 px du haut, superposé à « by Liz Leroy ») ; limite à 1366×768 (56 px, collé à l'en-tête), `captures/x-hero-1280x720.jpg`, `captures/accueil-p1280-00.jpg`. Cause : `assets/css/main.css:182` (cadre limité à `min(100svh - 60px, 50vw)`, soit 640 px) et `:187-188` (bloc de texte ancré en bas, h1 en `--t-3xl` indépendant de la hauteur). Correction : `.ouverture__texte { top: var(--entete-h); align-content: end; }` et palier `@media (min-width: 761px) and (max-height: 820px) { .ouverture h1 { font-size: min(var(--t-3xl), 15svh); } }`. Effort : petit.

### Importants

1. **Adresses sans .html en 404** : /boutique, /seances, /mentions répondent 404 (liens internes en .html, donc fonctionnels, mais toute adresse partagée sans extension échoue). Cause : `vercel.json:2`, `"cleanUrls": false`. Correction : `"cleanUrls": true` (les liens en .html sont redirigés). Effort : petit.
2. **Légendes de la galerie qui se chevauchent** : accueil, salle des séances, 1280×720 (« Anniversaire » / « dès 90 € », « Restauration de photos » / « 25 € / photo », « Nouveau-né » coupé en « Nouveau- / né ») et 1366×768 (Restauration), nettement à 1000×560, `captures/epingle-accueil-0-1280x720-8.jpg`, `captures/epingle-accueil-0-1000x560-8.jpg`. Cause : `assets/css/main.css:255`, largeur de légende liée à `58vh` (≈ 280 px à 720 px de haut) avec le nom en colonne `minmax(0, 1fr)` et le prix en `nowrap`. Correction : passer le prix sous le nom quand la place manque (`grid-template-columns: auto minmax(0, 1fr)` et `.oeuvre__prix { grid-column: 2; }`) ou `min-width: 260px` sur `.oeuvre__legende` hors mobile. Effort : petit.
3. **Mise en ligne incomplète** : en-tête X-Robots-Tag absent, deux règles Cache-Control dans `vercel.json:4-7`. Correction : remplacer le bloc `headers` par `{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }`. Effort : petit.
4. **Zones tactiles de moins de 44 px sur téléphone** : bouton menu 38×44, « Réserver » 80×38, « Appeler » / « Copier » 73×36 et 65×36, « Laisser votre avis » 136×40, liens du pied 21 à 24 px. Cause : `assets/css/main.css:96` (`.btn--petit` 40 px), `:387` (`.copier`), `.menu-btn`. Correction : `min-height: 44px` (et `min-width: 44px` sur `.menu-btn`) sous 760 px, padding vertical sur les liens du pied. Effort : petit.

### Finition

1. **Textes de moins de 12 px sur téléphone** : « by Liz Leroy » 10,6 px (`main.css:112`), étiquettes « Ambiance · photos à venir » 10,9 px (`main.css:261`), « à compléter » 11,5 px (`main.css:80`), légendes des tirages 10,2 px, libellés de la carte des communes (texte SVG réduit à 1,7–2,3 px, illisible). Correction : `font-size: max(12px, …)` et, pour la carte, masquer les noms secondaires sous 760 px. Effort : petit.
2. **Image d'ambiance « Entreprises & projets »** : établi de menuisier (`grok-atelier-savoir-faire`) peu parlant pour un photographe, à remplacer dès que des photos réelles existent. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,0 s / 2,0 s (intro boîtier puis diaphragme ; titre lisible à l'étape 2 s) |
| Fluidité p1440 / m390 | 58,7 i/s / 59,2 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,014 (m320) ; ≤ 0,002 ailleurs |
| Poids de l'accueil, p1440 / m390 | 2,63 Mo / 1,29 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 sur les pages .html ; sans WebGL OK ; réduit OK (titre à 0,3 s) |
| Débordement horizontal | Aucun (accueil, séances, séance mariage, boutique, mentions, de 320 à 1440) |
| Sections épinglées | Galerie horizontale (GSAP) : image 3 px sous l'en-tête à 1280×720, 20 px à 1000×560 (non bloquant) ; diaphragme collant sans problème |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex (sans nofollow) dans 5/5 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v= cohérent · 404 personnalisée ; Cache-Control dans vercel.json |

## Vérifications écartées

- Pages /boutique, /seances, /mentions mesurées en 404 par l'outil : ce sont les adresses sans .html ; les vraies pages (boutique.html, seances.html, seances.html#mariage, mentions.html) ont été capturées et testées à part (`captures/planche-*-html-*.jpg`), sans erreur ni débordement. Le 404 des adresses courtes est noté en défaut important.
- « h1 » à 2,4–3,1 s sur m320, p1280, p1366, p1440, g1920 : valeurs prises pendant la charge parallèle ; la vidéo seule donne un titre lisible à 2 s.
- Éléments « masqués » à m320 (« 9 rue de Fontigny ») et t820 sur la 404 (« Vue 404 ») : capture prise pendant le défilement du pied de page sous l'en-tête fixe, pas un contenu bloqué.
- Image de la galerie 3 px sous l'en-tête à 1280×720 : imperceptible ; 20–22 px à 1000×560 et 1024×640, formats non courants.
- Bouton « Mode calme » masqué dans l'en-tête sur téléphone : il est repris dans le panneau du menu mobile.
- Éléments hors écran signalés à droite (`.panier__*`, cartes de galerie) : tiroir du panier fermé et pistes défilantes, sans débordement de la page.


---

## pixncroq-maquette : corrections de l'étape 2

Commits 5f3c456 puis 3d5c846 (non poussés, sans amend) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| E-mail et téléphone du menu mobile coupés | Bloquant | `.menu .menu__pied a` en police de texte `--t-l`, `overflow-wrap: anywhere`, 44 px de haut | `assets/css/main.css` | e-mail jusqu'à 475 px de large → 183 px, aucun débordement de 320 à 430 (`preuve-menu-m360-apres.jpg`) |
| Surtitre du héros sous l'en-tête à 1280×720 | Bloquant | `--entete-h` mesurée en JS (ResizeObserver sur `.entete`, hauteur dessinée passée en `--entete-base`) ; `.ouverture__texte` démarre sous l'en-tête (`top: var(--entete-h)`, `align-content: safe end`) au-dessus de 1000 px ; palier `max-height: 820px` (h1 plafonné à 14svh) | `assets/js/core.js`, `assets/css/main.css` | surtitre à 42 px (sous l'en-tête de 64) → 85 px à 1280×720, 106 px à 1366×768 ; plus de « couvert par l'en-tête » en p1280/p1366 |
| Adresses sans .html en 404 | Important | `"cleanUrls": true` dans `vercel.json` (bloc X-Robots-Tag de l'étape 1 inchangé) | `vercel.json` | en local : /boutique, /seances, /mentions et leurs versions .html, 404.html, index.html → 200 |
| Légendes de la galerie qui se chevauchent | Important | prix sous le nom (5f3c456). Puis (3d5c846) galerie épinglée selon « Tout tenir dans l'écran » : scène en `100svh`, colonne flex, `padding-top: var(--entete-h)` ; piste en `flex: 1; min-height: 0` (conteneur de taille) ; photo à `100cqh` moins la plus haute légende mesurée en JS (`--legende-h`, ResizeObserver), format conservé, `object-fit: cover` ; légendes et progression à hauteur naturelle ; épinglage `top top` sans `anticipatePin`. Plus aucun `100vh - N px` | `assets/css/main.css`, `assets/js/accueil.js` | chevauchements nom/prix → 0 ; en position stabilisée (Lenis immédiat + 1,6 s) à 8 / 50 / 92 % sur 9 tailles (1000×560 à 2560×1440, tablette 1180×820) : aucun cadre sous l'en-tête, aucune légende ni prix coupés, progression dans l'écran (`preuve-galerie-*`) |
| Zones tactiles < 44 px | Important | `min-height: 44px` sous 900 px : marque, bouton menu (44×44), Réserver, `.btn--petit`, `.copier`, filtres, puces, liens du pied, réseaux, mentions ; « Masquer les notes » 44 px | `assets/css/main.css` | 4 à 9 cibles par page → 0 sur tous les formats |
| Textes < 12 px sur téléphone (finition) | Finition | plancher `max(12px, …)` sur `.exif`, `.a-completer`, `.marque small`, légendes des tirages, `.ambiance-tag`, `.zone__tag`, `.copier`, pellicule, `.oeuvre__num`, `.mur__echelle` (5f3c456). Carte des communes (3d5c846) : noms en vrais pixels (13 px, Ugny 15 px) par la règle `.carte text` (position en unités de carte, échelle `--carte-s` mesurée en JS) ; sous 640 px seuls « Ugny » et « 15 km inclus » restent, les communes sont dans la liste du calcul | `assets/css/main.css`, `assets/js/accueil.js` | accueil 12 → 0 (la carte rendait 7 à 10 px sur téléphone, 1,65–2,3 en unités SVG), boutique 6 → 0, mentions 4 → 0, séances 3 → 0 |
| Mise en ligne (X-Robots-Tag, Cache-Control) | Important | déjà corrigé à l'étape 1 | — | — |
| Barre du bas | — | non signalée ; contrôlée : masquée sur le héros, le formulaire, le pied et sous le menu, aucun élément couvert par elle de m320 à m430 | — | — |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Image d'ambiance « Entreprises & projets » (établi de menuisier) | Finition | image Grok / donnée manquante |
| Noms des communes masqués sur la carte sous 640 px | — | choix assumé (suggestion du rapport) : à 13 px ils se chevauchaient ; ils restent dans la liste du calcul |
| Galerie épinglée : « img sous l'en-tête » de 5 à 21 px à 8 % | — | c'est la photo en zoom d'entrée (1,16) rognée par son cadre ; le cadre reste sous l'en-tête à toutes les tailles (vérifié en position stabilisée) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats, 5 pages) | 0 | 0 |
| Textes < 12 px (accueil m320–t820 / autres pages mobiles) | 12 / 2 à 7 | 0 / 0 |
| Cibles < 44 px (pages mobiles) | 4 à 9 par page | 0 |
| Couverts par l'en-tête à p1280 / p1366 | surtitre du héros (y 42 / 64) | 0 |
| Couverts restants | pied ou formulaire défilant sous l'en-tête fixe (m320, t820) | idem, 1 par page en m320/m360/t820 (défilement, pas un contenu bloqué) ; aucun élément couvert par la barre du bas |
| Épinglage aux 8 tailles | photo zoomée 20 / 22 / 3 px sous l'en-tête (1000×560, 1024×640, 1280×720) ; légendes chevauchées | scène 100svh épinglée à 0 ; photo zoomée 7 / 10 / 5 / 6 / 21 px (1000 à 1440) rognée par son cadre ; cadres jamais sous l'en-tête, aucune légende coupée |
| Menu mobile : e-mail | 475 px de large, coupé de 360 à 430 | 183 px, entier de 320 à 430, fermeture Échap OK |
| Erreurs console | 0 (hors 404 voulue) | 0 (hors 404 voulue) |
| Modules chargés deux fois | 0 | 0 (28 références en ?v=20261028-2) |

## Note proposée
Ancienne note 77/100 → nouvelle note 86/100 · bloquants restants : 0
- c5 Tous les formats 9 → 14 : e-mail du menu, surtitre du héros, légendes de la galerie, cibles et textes de moins de 12 px corrigés.
- c7 Technique 7 → 8 : adresses sans .html servies (cleanUrls).
- c8 Mise en ligne 3 → 5 : X-Robots-Tag et Cache-Control déjà corrigés à l'étape 1.
- c9 Accessibilité 4 → 5 : cibles de 36 à 40 px passées à 44 px.
