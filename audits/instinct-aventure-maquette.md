# instinct-aventure-maquette

<https://instinct-aventure-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 2156a5c du 27/10/2026

## Verdict

**79/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Maquette très aboutie dans le concept : ciel de Windhoek à l'heure réelle, piste animée, jeu, comparateur, safari de nuit, et tout fonctionne. Deux sections épinglées débordent sur les portables courants, et 8 visuels provisoires en aplats, encore affichés au milieu des photos, cassent le niveau premium.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro nuit étoilée puis Deadvlei, carte où roule un 4x4, safari à la lampe : original et juste pour l'agence, mais les héros sépia des fiches et les aplats provisoires font retomber l'effet. |
| 2. Direction artistique et harmonie | 11/15 | Instrument Serif et Inter Tight sur sable et ocre, rythme maîtrisé ; les aplats vectoriels jurent avec les photos, et la même photo d'éléphants sert de héros à deux pages. |
| 3. Animations et effets | 12/15 | 60 i/s sur portable et téléphone, ouverture de 2,5 s avec « Passer l'intro », piste épinglée, galerie horizontale, prix à rouleaux ; la piste épinglée sort de l'écran en 1366×768. |
| 4. Expérience ludique et interactions | 9/10 | Quiz (résultats pondérés), filtres, tri, comparateur, liste à cocher avec tampon, devis en 4 étapes avec récapitulatif, safari 6/6 : tout marche ; le tampon de carnet recouvre le texte sur téléphone. |
| 5. Tous les formats | 9/15 | Aucun débordement horizontal, mais 2 coupes bloquantes (1366×768 accueil, 1280×720 fiches), barre de filtres collante qui mange 50 à 70 % de l'écran sur téléphone, textes à 11,5 px, cibles à 38–42 px. |
| 6. Contenu et fiabilité | 9/10 | Mentions (IM055260001, APST, Hiscox 1,5 M€, MTV, capital, RCS) vérifiées sur instinct-aventure.fr, avis et histoire bien marqués « À compléter », sources de « Préparer » datées. |
| 7. Technique et performance | 8/10 | Aucune erreur JS, 0 lien cassé, accueil 2,1 Mo / 1,5 Mo ; CLS de 0,20 à 0,23 sur Namibie intégrale (portable), erreur console sans WebGL. |
| 8. Mise en ligne | 5/5 | Public, noindex partout, X-Robots-Tag, robots.txt sain, og:image JPG 1200×630 absolue, ?v=20261027 identique, 404 aux couleurs. |
| 9. Accessibilité | 4/5 | Mode calme, réduire les animations, Échap ferme menu, quiz et devis, annonces aria-live ; cibles et textes sous les seuils, fil d'Ariane illisible sur certains héros. |
| **Total** | **79/100** | |

## Points forts

- Concept fort et propre au client : intro « nuit étoilée sur Windhoek » à l'heure réelle, horloge de Windhoek, lever et coucher du soleil en direct.
- La piste de la Grande aventure : carte épinglée où la trace avance jour par jour, et un tampon par région dans un carnet de route.
- Interactions complètes et fiables : quiz « Trouve ta piste » avec carte, comparateur côte à côte, filtres plus budget plus tri, devis en 4 étapes avec brouillon et récapitulatif, liste à cocher de « Préparer ».
- Fluidité parfaite (60 i/s, aucune image > 50 ms) et pages légères (AVIF et WebP en srcset).
- Contenu fiable : mentions légales et garanties reprises mot pour mot du site actuel, « À compléter » bien visibles.

## Défauts

### Bloquants

1. **Lien « Voir la Grande aventure jour par jour » coupé dans la piste épinglée** : accueil, 1366×768 (sur toute la durée de l'épinglage), `captures/epingle-accueil-0-1366x768-50.jpg`. Cause : `assets/css/main.css:389` (`.piste__in` en `min-height: 100svh` avec `padding-block: calc(var(--hd-h) + 24px) 40px` et `gap` fixes ; le contenu dépasse 768 px) et épinglage `assets/js/home.js:106`. Correction : `.piste__in` en `height: 100svh` colonne, padding haut sur la hauteur d'en-tête mesurée (`--entete-h`), et palier `@media (max-height: 820px)` qui réduit `.piste__day .big`, les gaps et la vignette d'étape. Effort : petit.
2. **Légende « Carte illustrative, positions approximatives » coupée sous la carte collante** : les 6 fiches circuits, 1280×720, `captures/epingle-grande-aventure-0-1280x720-50.jpg` (même mesure sur immersion-sauvage, namibie-authentique, namibie-botswana, namibie-integrale, ocean-caprivi). Cause : `assets/css/main.css:716-717` (`.days__map` collée à `top: calc(var(--hd-h) + 80px)` alors que la carte garde sa hauteur pleine). Correction : `.days__map .map { max-height: calc(100svh - var(--hd-h) - 80px - 48px); aspect-ratio: conserver; width: auto; margin-inline: auto; }` pour que carte plus légende tiennent dans l'écran. Effort : petit.

### Importants

1. **8 visuels provisoires en aplats affichés au milieu des photos** : accueil (étape Waterberg de la piste), les 6 fiches (programme jour par jour, régions), « Nos voyages » (4 étapes sur mesure), `captures/accueil-p1440-07.jpg`, `captures/grande-aventure-p1440-08.jpg`, `captures/ocean-caprivi-p1440-09.jpg`, `captures/voyages-p1440-12.jpg`. Cause : fichiers `assets/img/g-*.webp` (README : « à remplacer par les images Grok »). Correction : générer les 8 images avec les consignes ci-dessous, aux mêmes noms et tailles. Effort : moyen.
2. **Barre de filtres collante trop haute sur téléphone** : « Nos voyages », m390 (environ 400 px sur 844) et m320 (environ 70 % de l'écran avec la barre du bas), `captures/voyages-m390-06.jpg`, `captures/planche-voyages-m320.jpg`. Cause : `assets/css/main.css:593` (`.filters { position: sticky }` sans palier mobile). Correction : sous 900 px, `position: static` et un bouton collant « Filtres (n) » qui ouvre le panneau, ou une seule ligne de puces défilante horizontalement. Effort : moyen.
3. **Héros des fiches et de « Nos voyages » peu lisibles sur téléphone** : fil d'Ariane blanc et mot en italique pêche sur la poussière dorée des éléphants, `captures/grande-aventure-m390-00.jpg`, `captures/voyages-m390-00.jpg`. Cause : voile du héros trop léger (`assets/css/main.css:283-301`, `.hero` et `.hero__content`). Correction : dégradé sombre plus dense sous le texte (`linear-gradient(0deg, rgba(14,12,10,.75), transparent 70%)`) et `text-shadow` léger sur le fil d'Ariane et le surtitre. Effort : petit.
4. **CLS de 0,20 à 0,23 au chargement** : Namibie intégrale, p1366, p1440 et g1920 (0,12). Cause : `assets/js/circuit.js:70` remplace « bientôt » par le compte à rebours, la ligne change de longueur et tout le bloc `.hero__content`, ancré en bas, remonte. Correction : écrire la valeur finale dans le HTML ou réserver la place (`display: inline-block; min-width: 16ch`) et ne pas changer le nombre de lignes. Effort : petit.
5. **Tampon « carnet de route » qui recouvre le texte sur téléphone** : accueil et fiches, m320 et m390, `captures/accueil-m320-06.jpg`, `captures/accueil-m390-06.jpg`. Cause : `assets/css/main.css:1451-1454` (`.slam` fixe en bas à gauche, 2,6 s, au-dessus du titre et des étapes). Correction : sous 640 px, tampon plus petit (`font-size: .8rem`) placé en haut à droite sous l'en-tête, ou simple pastille sur le bouton « liste d'envies ». Effort : petit.
6. **Textes de moins de 12 px et cibles de moins de 44 px sur téléphone** : toutes les pages (surtitres 11,84 px, coordonnées 11,52 px, badges « À compléter » 10,88 px, date du tampon 9,92 px ; boutons d'en-tête 38 et 42 px, liens fléchés 28 px, fil d'Ariane 22 px, sous-navigation 37 px de large). Cause : `assets/css/main.css` (`.eyebrow`, `.coord`, `.tag-demo`, `.icon-btn`, `.link-arrow`, `.crumbs a`, `.subnav a`). Correction : `font-size: max(12px, …)` sur ces classes, `min-height: 44px` et `min-width: 44px` sur les boutons et liens isolés. Effort : petit.

### Finition

1. **Sans WebGL, erreur console « unable to create webgl context »** : toutes les pages. Le repli visuel fonctionne. Cause : `assets/js/gl.js:47` crée le `Renderer` OGL sans test préalable. Correction : tester `canvas.getContext('webgl')` avant `new OGL.Renderer`. Effort : petit.
2. **Même photo d'éléphants dans la poussière en héros de « Nos voyages » et de « Grande aventure »** : `captures/voyages-p1440-00.jpg`, `captures/grande-aventure-p1440-00.jpg`. Correction : autre photo du client pour l'une des deux. Effort : petit.
3. **CLS de 0,11 sur la 404 en 1280×720** : décalage d'un paragraphe au chargement des polices. Correction : masquer le texte jusqu'à `document.fonts.ready` comme sur les autres pages. Effort : petit.
4. **Intro sur téléphone** : la date « 02 H 05 » passe à la ligne et le nom « Instinct Aventure » n'est pas centré, `captures/bande-ouverture-m390.jpg`. Correction : `white-space: nowrap` sur l'heure et centrage du bloc. Effort : petit.

**Consignes Grok pour les 8 visuels provisoires** (style commun : documentary travel photography in Namibia, warm natural golden light, soft film grain, ochre, sand and dusty blue palette matching real safari photos, no text, no logo, no watermark, no recognizable person, hands hidden or out of frame) :

- `g-plateau-waterberg-4x5` (2048×2560, 4:5) : « The red sandstone cliffs of the Waterberg Plateau in Namibia at late afternoon, green acacia bush in the foreground, deep blue sky, documentary travel photography, warm natural golden light, ochre, sand and dusty blue palette, soft film grain, vertical 4:5, no people, no text, no logo, no watermark. »
- `g-route-acacias-aube-16x9` (2560×1440, 16:9) : « A straight gravel road through the Namibian savanna at dawn, umbrella acacia trees on both sides, light dust in the air, pastel pink sky, documentary travel photography, warm natural light, ochre, sand and dusty blue palette, soft film grain, horizontal 16:9, no vehicle, no people, no text, no logo, no watermark. »
- `g-cote-brume-dunes-4x5` (2048×2560, 4:5) : « Morning sea fog rolling over the dunes where the Namib desert meets the Atlantic Ocean near Swakopmund, soft diffused light, documentary travel photography, sand and dusty blue palette with ochre accents, soft film grain, vertical 4:5, no people, no text, no logo, no watermark. »
- `g-ciel-austral-camp-16x9` (2560×1440, 16:9) et `g-ciel-austral-camp-9x16` (1440×2560, 9:16) : « The Milky Way and the southern sky over a quiet desert camp in Namibia, a single acacia silhouette, the faint orange glow of a campfire low on the horizon, deep navy night, documentary astrophotography, soft film grain, same composition in horizontal 16:9 and vertical 9:16, no people, no text, no logo, no watermark. »
- `g-bivouac-crepuscule-4x5` (2048×2560, 4:5) : « A 4x4 pickup with a rooftop tent set up at a bush campsite in Namibia at dusk, camp chairs and a small campfire, warm sunset sky, documentary travel photography, warm natural light, ochre, sand and dusty blue palette, soft film grain, vertical 4:5, no people, no readable license plate, no text, no logo, no watermark. »
- `g-piscine-savane-4x5` (2048×2560, 4:5) : « A small natural-stone swimming pool at a safari lodge overlooking the Namibian savanna in the afternoon, thatched roof edge in the corner, documentary travel photography, warm natural light, ochre, sand and dusty blue palette, soft film grain, vertical 4:5, no people, no text, no logo, no watermark. »
- `g-carnet-boussole-4x5` (2048×2560, 4:5) : « Top view of an open leather travel notebook with a blank hand-drawn route sketch, a brass compass and a paper map of Namibia on a sandy wooden table, warm side light, documentary still life, ochre, sand and dusty blue palette, soft film grain, vertical 4:5, no readable text, no hands, no logo, no watermark. »

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (intro nuit étoilée avec « Passer l'intro », titre en place à 2,5 s sur les bandes) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,2294 (Namibie intégrale p1366) ; accueil 0,0023 |
| Poids de l'accueil, p1440 / m390 | 2,13 Mo / 1,53 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur JS ; sans WebGL : « unable to create webgl context » (repli correct) ; réduire les animations : rien de bloqué |
| Débordement horizontal | Aucun, à tous les formats et sur toutes les pages |
| Sections épinglées | Accueil : piste coupée de 16 px en 1366×768 (bloquant), galerie horizontale correcte ; fiches : légende de carte coupée de 8 px en 1280×720 (bloquant) ; catalogue correct |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex sur les 10 pages · X-Robots-Tag noindex, nofollow · robots.txt sans Disallow · og:image JPG 1200×630 absolue · ?v=20261027 partout · 404 personnalisée |

## Vérifications écartées

- Invisibles « Zèbres au point d'eau » (accueil, portable) : légendes de la grille Instagram affichées au survol (`main.css:489-490`), visibles d'office au toucher (`main.css:1499`). Voulu.
- Invisibles « Complet / Mai 2027 » (accueil, p1440 et g1920) : tampon de la galerie horizontale qui apparaît à l'entrée de la carte ; visible sur `captures/accueil-p1440-11.jpg`.
- Invisibles `span.racc__txt > p` (fiches) : texte des panneaux d'accordéon fermés, qui s'affiche à l'ouverture (vérifié au clic, `aria-expanded` passe à true).
- Erreur 404 en console sur la page introuvable : c'est le statut de la page elle-même.
- Heures « h1 » et LCP au-dessus de 3 s (grande-aventure p1440, 3,16 s) : mesurées en parallèle ; les bandes d'ouverture prises seules montrent le titre à 2,5 s.
- Bouton « Mode calme » du pied de page vide sur `captures/voyages-m390-22.jpg` : état de survol capté au passage de la souris, normal sur `captures/accueil-m390-19.jpg`.
- Chiffres « Namibie en bref » différents selon les captures (810 392, 816 108, 824 000 km²) : compteur animé capté en cours ; la valeur finale est 824 000 km².


---

## instinct-aventure-maquette : corrections de l'étape 2

Commit 412286c (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Lien « Voir la Grande aventure jour par jour » coupé dans la piste épinglée (1366×768) | Bloquant | Méthode « Tout tenir dans l'écran » : `.piste__in` en `height: 100svh`, haut réservé par `--entete-h` mesuré en JS (ResizeObserver), colonne texte en flex, carte qui prend la ligne restante (`height: 100%`, ratio conservé), paliers `max-height: 820px` et `600px` ; `anticipatePin` retiré | `assets/css/main.css`, `assets/js/core.js`, `assets/js/home.js` | lien sorti de 16 px → dans l'écran aux 8 tailles (bas du lien à 665 px sur 768, 635 sur 720) ; `preuve-*-epingle-accueil-0-1366x768-50.jpg` |
| Légende « Carte illustrative, positions approximatives » coupée sous la carte collante (6 fiches, 1280×720) | Bloquant | `.days__map` en colonne flex limitée à la hauteur visible sous l'en-tête mesuré ; la carte rétrécit (`flex: 0 1 auto; min-height: 0`), la légende reste visible | `assets/css/main.css` | légende sortie de 8 px → 0 coupe sur les 6 fiches aux 8 tailles ; `preuve-*-epingle-grande-aventure-0-1280x720-50.jpg` |
| Barre de filtres collante trop haute sur téléphone (Nos voyages) | Important | Sous 900 px, `.filters` en `position: static` | `assets/css/main.css` | ~400 px collés sur 844 → plus rien de collé ; `preuve-*-voyages-m390-06.jpg` |
| Héros des fiches et de « Nos voyages » peu lisibles sur téléphone | Important | Sous 640 px, voile plus dense sur `.hero--short` et ombre légère sur fil d'Ariane, surtitre et italique | `assets/css/main.css` | `preuve-*-voyages-m390-00.jpg`, `preuve-*-grande-aventure-m390-00.jpg` |
| CLS de 0,20 à 0,23 au chargement (Namibie intégrale) | Important | Cause réelle : le titre passait de 2 lignes à 1 (police chargée) puis de nouveau à 2 (découpage en lettres). La partie en italique des titres de fiches passe toujours à la ligne ; place réservée aussi pour le compte à rebours | `assets/css/main.css` | p1366 0,2292 → 0,0007 ; p1440 0,2011 → 0,0006 ; g1920 0,1191 → 0,0190 |
| Tampon « carnet de route » qui recouvre le texte sur téléphone | Important | Sous 640 px : tampon plus petit (.8rem), en haut à droite sous l'en-tête mesuré | `assets/css/main.css` | bas de l'écran à gauche → haut à droite, 45 px de haut |
| Textes de moins de 12 px | Important | Plancher `max(12px, …)` sur `.eyebrow`, `.coord`, `.tag-demo`, `.ft h4`, `.ccard span`, `.agence__facts dt`, `.sort > span`, `.when__sub`, `.filters__group > span`, `.actionbar__price span`, `.stamp small`, `.kit`, exposant des puces et libellé « Budget » | `assets/css/main.css`, `voyages.html` | 463 à 547 textes < 12 px par format → 0 |
| Cibles de moins de 44 px | Important | Boutons ronds 44 px (en-tête, liste d'envies, cartes) ; liens isolés agrandis par padding et marge négative (mise en page inchangée) : liens fléchés, titres de cartes, fil d'Ariane, sous-navigation, liens de liste, « réinitialiser », « Tout décocher », curseur de budget, pastille « Comparer » | `assets/css/main.css`, `voyages.html` | 99 à 114 cibles < 44 px par format → 1 (case « Comparer », voir plus bas) |
| Barre du bas | Important (leçons du lot 1) | Masquée sur la 404 ; `--barres-h` mesurée en JS sert au `padding-bottom` du pied de page. Elle n'apparaissait déjà qu'après le héros, et se masquait sur le contact, le pied de page (dans la section nuit), le menu et le devis | `assets/js/core.js`, `assets/css/main.css` | éléments couverts : 0 → 0 de m320 à m430 ; barre 404 visible → masquée |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| 8 visuels provisoires en aplats (`assets/img/g-*.webp`) | Important | Donnée manquante : images Grok à générer (consignes dans `rapport.md` et `notes.json`), non remplacées |
| Case « Comparer » : la case fait 20 px, mais toute la pastille (46 px de haut) est cliquable | Important (résiduel) | La cible réelle est le libellé ; l'outil mesure la case seule |
| Erreur console sans WebGL | Finition | Finition |
| Même photo d'éléphants en héros de « Nos voyages » et de « Grande aventure » | Finition | Finition (photo du client à choisir) |
| CLS de 0,11 sur la 404 en 1280×720 | Finition | Finition (mesuré à 0,0005 dans la mesure « après ») |
| Intro sur téléphone : l'heure passe à la ligne | Finition | Finition |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920) | 0 partout | 0 partout |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 463 / 512 / 531 / 547 / 518 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 99 / 103 / 104 / 104 / 114 | 1 / 1 / 1 / 1 / 1 (case « Comparer ») |
| Éléments couverts par une barre | 0 | 0 |
| Épinglage, 8 tailles (piste de l'accueil, carte des 6 fiches, galerie, catalogue) | 21 relevés coupés (accueil 1366×768, 6 fiches 1280×720) | 0 |
| CLS au chargement, max p1280 / p1366 / p1440 / g1920 | 0,109 / 0,229 / 0,201 / 0,119 | 0,0005 / 0,0007 / 0,0006 / 0,019 |
| Erreurs console | 1 par format (statut 404 de la page introuvable, attendu) | idem, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 (toutes les références en ?v=20261028-2) |
| Interactions (menu, Échap, barre au pied et sur la 404, filtres et réinitialisation, tampon) | — | OK, 0 erreur JS |

## Note proposée
Ancienne note 79/100 → nouvelle note 87/100 · bloquants restants : 0
- 3. Animations : 12 → 13, la piste épinglée ne sort plus de l'écran en 1366×768.
- 4. Ludique : 9 → 10, le tampon du carnet ne recouvre plus le texte sur téléphone.
- 5. Formats : 9 → 13, les 2 coupes bloquantes, les filtres collants, les textes et les cibles sont corrigés.
- 7. Technique : 8 → 9, CLS de Namibie intégrale corrigé (reste l'erreur sans WebGL).
- 9. Accessibilité : 4 → 5, cibles, textes et fil d'Ariane corrigés (plafond atteint).

## Images Grok définitives (29/10)

Commit 4673a8e (non poussé)

Sources Grok de 1168 px de grand côté : aucune déclinaison -1920 ou -2560 n'est possible à 1,5 fois au plus. Les fichiers gardent leur nom ; la plus grande taille contient le maximum permis, le `w` des srcset et width/height donnent la vraie taille, et la déclinaison -1920 en double est retirée (srcset et fichier) en 4:5 et 16:9. WebP q78 et AVIF régénérés aux mêmes tailles.

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| g-plateau-waterberg-4x5 | aplat provisoire (accueil, 4 fiches) | 4:5 y 150–1130 ; 640×800, 1176×1470 (-1280, -2560) | falaises de grès orangé du plateau du Waterberg… | 5 formats, 0 erreur |
| g-route-acacias-aube-16x9 | aplat provisoire (6 fiches) | 16:9 y 80–737 ; 640×360, 1280×720, 1744×981 (-2560) | piste de terre entre les acacias… | 5 formats, 0 erreur |
| g-cote-brume-dunes-4x5 | aplat provisoire (5 fiches) | 4:5 y 120–1100 ; 640×800, 1176×1470 | dunes ocre qui plongent dans l'océan… | 5 formats, 0 erreur |
| g-ciel-austral-camp-16x9 | fond contact portable (10 pages) | 16:9 y 40–697 ; 640×360, 1280×720, 1744×981 | décoratif (alt vide) | texte lisible 1000→1920 |
| g-ciel-austral-camp-9x16 | fond contact téléphone (10 pages) | 9:16 x 120–777 ; 640×1138, 981×1744 (-1280, -1920) | décoratif (alt vide) | texte lisible 390 |
| g-bivouac-crepuscule-4x5 | aplat provisoire (2 fiches) | 4:5 y 150–1130 ; 640×800, 1176×1470 | 4x4 avec tente de toit, chaises et feu de camp… | 5 formats, 0 erreur |
| g-piscine-savane-4x5 | aplat provisoire (Océan-Caprivi) | 4:5 y 170–1150 ; 640×800, 1176×1470 | bassin en pierre sous un toit de chaume… | 5 formats, 0 erreur |
| g-carnet-boussole-4x5 | aplat provisoire (Nos voyages, « 4 étapes ») | 4:5 y 110–1090 ; 640×800, 1176×1470 | carnet de voyage ouvert sur un tracé de piste… | 5 formats, 0 erreur |

Vérification : 10 pages × 5 formats, 0 réponse 404, 0 erreur console, toutes les images chargées. CLS ≤ 0,02 partout sauf l'accueil en portable (1,37 à 1,93) : décalage de la section épinglée `.trips` sous défilement programmé, identique sur le commit précédent, sans lien avec les images. Preuves : `preuve-grok-*.jpg`.

Note : 87/100 → 89/100 (critères 1 et 2 : aplats provisoires remplacés) · bloquants : 0 → 0 · Prête à envoyer

### Cadrage affiché (29/10, second commit a06e190, non poussé)

Les visuels 4:5 s'affichent dans des cadres plus larges : 16:9 pour les étapes, environ 2,7:1 sur téléphone, et 16:10 pour « 4 étapes » sur téléphone. Des règles `object-position` ciblées sur chaque image ont été ajoutées dans `main.css`, sans toucher à la mise en page : Waterberg 50% 36%, côte 50% 38%, bivouac 50% 74%, piscine 50% 60%, carnet 50% 8%. `?v=` passe de 20261028-2 à 20261029 partout. Revérification sur 10 pages × 5 formats : 0 réponse 404, 0 erreur console, CLS inchangé (≤ 0,02 hors section épinglée de l'accueil). Le feu, le 4x4 et la boussole sont visibles. Limite : dans le bandeau 2,7:1 du téléphone, la tente de toit du bivouac reste coupée, car ce format ne peut pas contenir tout le sujet.

### Étape bivouac sur téléphone (29/10, troisième commit a00df62, non poussé)

Sous 640 px, le cadre de l'étape bivouac passe de 16:9 à 4:3 (`.day__fig:has(img[src*="g-bivouac-crepuscule-4x5"])`) avec `object-position: 50% 70%`. La tente de toit, le 4x4 et le feu sont entiers (357×268 en 390, 328×246 en 360). Les autres étapes restent en 16:9, et les formats 700, 1000 et 1440 ne changent pas (cadre identique aux autres étapes). `?v=` passe à 20261029-2 partout. Vérifié en 390×844 et 360×780 : 0 réponse 404, 0 erreur console, CLS ≤ 0,016, aucun débordement horizontal. Le décalage de 67 px sur une seule étape ne casse pas le rythme de la liste. Preuve : `preuve-grok-bivouac-390.jpg` (elle remplace celle du Waterberg en 390).

### Carte des fiches sur téléphone (29/10, quatrième commit 1bc7667, non poussé)

Dans `circuit.js`, la hauteur réelle de `.days__map` est mesurée et exposée en `--carte-h`, avec `--sousnav-h` pour la sous-navigation (ResizeObserver, redimensionnement, changement de palier). Sous 640 px, si la carte dépasse 30 % de la hauteur de l'écran, elle reste dans le flux (plus collante) et l'avancement (jour, kilomètres s'ils existent, nuit, mêmes textes que l'étiquette de la carte) passe dans une barre d'une ligne accrochée sous la sous-navigation, visible seulement pendant la liste des étapes. `--carte-h` est alors remesurée sur la barre, et `.day` reçoit un `scroll-margin-top` égal à en-tête + sous-navigation + `--carte-h`. `?v=` passe à 20261029-3 partout.

| Format | Carte mesurée | % écran | Chevauchement carte / images avant | après | Barre |
|---|---|---|---|---|---|
| 390×844 | 265 px | 31,5 % | 157 positions sur 196, jusqu'à 262 px | 0 | 49 px (5,9 %) |
| 360×780 | 247 px | 31,6 % | 147 sur 191, jusqu'à 230 px | 0 | 49 px (6,3 %) |
| 320×568 | 221 px | 39,0 % | 130 sur 181, jusqu'à 215 px | 0 | 49 px (8,7 %) |

Défilement pas à pas de 40 px, positions stabilisées, 6 fiches. Limite : comme sous l'en-tête et la sous-navigation, une image passe sous la barre de 49 px pendant le défilement. Aucune barre collante ne peut l'éviter. 0 réponse 404, 0 erreur console, CLS ≤ 0,036, aucun débordement horizontal (un débordement de 5 px de la barre en 320, constaté pendant la vérification, a été corrigé). Tablette (700, 1000) et ordinateur (1440) : mesures identiques au commit précédent. Preuve : `preuve-grok-carte-320.jpg` (elle remplace celle de la route en 1440).

### Carte des fiches sur tablette et ordinateur (29/10, cinquième commit 89a952b, non poussé)

La barre compacte s'applique jusqu'à 1023 px de large, ou à toute largeur dès que la carte mesurée dépasse 30 % de la hauteur de l'écran (`circuit.js` : matchMedia, resize, orientationchange, ResizeObserver). `--carte-h` est remesurée sur la barre et le `scroll-margin-top` vaut en-tête + sous-navigation + `--carte-h` pour toutes les étapes en mode compact. Les marges latérales de la barre s'alignent sur `--wrap`. `?v=` passe à 20261029-4 partout.

| Format | Carte | % écran | Avant (chevauchement max) | Après | Barre |
|---|---|---|---|---|---|
| 700×1000 | 395 px | 39,5 % | collante, 282 px | 0 | 49 px (4,9 %) |
| 768×1024 | 395 px | 38,6 % | collante, 317 px | 0 | 49 px (4,8 %) |
| 820×1180 | 395 px | 33,5 % | collante, 344 px | 0 | 49 px (4,2 %) |
| 1000×700 | 387 px | 55,3 % | collante, 387 px | 0 | 49 px (7,1 %) |
| 1024×768 | 387 px | 50,4 % | collante, 387 px | 0 (critère des 30 %) | 49 px (6,4 %) |
| 1280×720 | 564 px | 78,3 % | collante en colonne, 0 px | 0 (critère des 30 %) | 49 px (6,9 %) |
| 1366×768 | 612 px | 79,7 % | collante en colonne, 0 px | 0 (critère des 30 %) | 49 px (6,4 %) |
| 1440×900 | 656 px | 72,9 % | collante en colonne, 0 px | 0 (critère des 30 %) | 49 px (5,5 %) |
| 1920×1080 | 682 px | 63,2 % | collante en colonne, 0 px | 0 (critère des 30 %) | 49 px (4,6 %) |
| 390×844 | 265 px | 31,5 % | barre (commit précédent) | identique | 49 px (5,9 %) |

Tablettes vérifiées sur les 6 fiches, ordinateurs et téléphone sur 2 fiches. Les mesures « avant » viennent de la fiche Océan-Caprivi sur le commit précédent. 0 réponse 404, 0 erreur console, CLS ≤ 0,041, aucun débordement horizontal.

À arbitrer : sur ordinateur, la carte occupe toute la hauteur utile de l'écran (63 à 80 %), donc le critère des 30 % se déclenche toujours. La carte ne colle plus : elle défile avec le haut de la section et laisse la colonne de gauche vide pendant toute la liste (voir `preuve-grok-carte-1440.jpg`). Avant ce commit, elle ne chevauchait aucune image sur ordinateur, car elle était dans sa propre colonne. Je recommande de limiter le critère des 30 % aux mises en page en une colonne (≤ 1100 px).

### Critère des 30 % limité à une colonne (29/10, sixième commit ffc84e6, non poussé)

Barre compacte si la largeur est ≤ 1023 px (règle inchangée), ou si la page est sur une colonne et que la carte dépasse 30 % de la hauteur de l'écran. Le JS ne recopie pas le point de rupture : il lit la grille calculée de `.days` (`getComputedStyle(...).gridTemplateColumns`, une piste = une colonne), qui vient de `main.css` `@media (max-width: 1100px) { .days { grid-template-columns: minmax(0, 1fr); } }`. Sur deux colonnes (> 1100 px), la carte reste collante dans sa colonne, comme avant `89a952b`. `?v=` passe à 20261029-5 partout.

| Format | Règle | Carte (% écran) | Mode | Chevauchement carte / images |
|---|---|---|---|---|
| 390×844 | ≤ 1023 | 265 px (31,5 %) | barre 49 px (5,9 %) | 0 (identique) |
| 700×1000 | ≤ 1023 | 395 px (39,5 %) | barre 49 px (4,9 %) | 0 |
| 768×1024 | ≤ 1023 | 395 px (38,6 %) | barre 49 px (4,8 %) | 0 |
| 820×1180 | ≤ 1023 | 395 px (33,5 %) | barre 49 px (4,2 %) | 0 |
| 1000×700 | ≤ 1023 | 387 px (55,3 %) | barre 49 px (7,1 %) | 0 |
| 1000×560 | ≤ 1023 | 387 px (69,1 %) | barre 49 px (8,8 %) | 0 |
| 1024×768 | > 1023, une colonne, > 30 % | 387 px (50,4 %) | barre 49 px (6,4 %) | 0 |
| 1024×640 | > 1023, une colonne, > 30 % | 387 px (60,4 %) | barre 49 px (7,7 %) | 0 |
| 1280×720 | deux colonnes | 564 px (78,3 %) | carte collante dans sa colonne | 0 |
| 1440×900 | deux colonnes | 656 px (72,9 %) | carte collante dans sa colonne | 0 |
| 1920×1080 | deux colonnes | 682 px (63,2 %) | carte collante dans sa colonne | 0 |

Tablettes vérifiées sur les 6 fiches, les autres formats sur 2 fiches. 0 réponse 404, 0 erreur console, CLS ≤ 0,041, aucun débordement horizontal, plus de colonne vide sur ordinateur (captures 1280 et 1440 regardées, carte collée dans sa colonne). Preuve : `preuve-grok-carte-1440.jpg` (mise à jour).
