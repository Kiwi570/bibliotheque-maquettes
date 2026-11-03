# loeilsingulier-maquette

<https://loeilsingulier-maquette.vercel.app> · audit du 28 octobre 2026 · dernier commit 7f764d0 du 27 octobre 2026

## Verdict

**83/100 · À peaufiner · 1 défaut bloquant**

C'est une maquette raffinée et très juste pour une agence événementielle : le carton d'invitation sert de fil conducteur, du cachet de cire qu'on brise jusqu'au carton-réponse, et tout fonctionne. Un point bloque l'envoi : la galerie horizontale épinglée dépasse de l'écran en 1280×720 et 1366×768 et cache ses légendes ; il reste aussi le CLS de /design-graphique et les petites cibles tactiles.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Enveloppe, cachet de cire qui se fend, rabat bleu nuit, puis titre doré sur papier coton : une ouverture originale qui colle exactement au métier ; le hero reste un peu petit et centré en 1920. |
| 2. Direction artistique et harmonie | 13/15 | Ivoire, encre bleu nuit et dorure, Bodoni Moda et Hanken Grotesk, cohérents sur les 10 pages ; les images Grok forment une série homogène, mais les photos réelles de la galerie, très colorées (néons verts, violets), rompent un peu l'harmonie. |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, galeries épinglées, titres « pressés », loupe, boutons magnétiques, guilloche animé ; mais le titre n'est lisible qu'à 3 s à la première visite, et le titre composé de /design-graphique saute au chargement des polices. |
| 4. Expérience ludique et interactions | 9/10 | Plan de table qui mène au carton-réponse prérempli, carton-réponse en 4 étapes avec erreurs claires et récapitulatif, ambiance sonore Web Audio, visionneuses au clavier, filtres, témoignages recto verso, horloges Paris et Londres : tout marche. |
| 5. Tous les formats | 11/15 | Aucun débordement horizontal ; mais la galerie horizontale épinglée sort de l'écran de 28 à 36 px en 1280×720 et 1366×768, ce qui cache les légendes, et plusieurs textes et cibles tactiles sont trop petits sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Chiffres, références et témoignages sont conformes à loeilsingulier.com (2012, plus de 20 ans, près de 500 événements, 30 références, 6 lettres) ; les points « à compléter » et « à valider » sont bien signalés ; il reste une virgule orpheline dans un titre. |
| 7. Technique et performance | 8/10 | Aucune erreur JavaScript, aucun lien cassé, ?v= cohérent, version sans WebGL propre ; mais le CLS au chargement de /design-graphique atteint 0,117 (confirmé), et la galerie pèse 3,7 Mo. |
| 8. Mise en ligne | 4/5 | Site public, meta noindex, nofollow sur chaque page, og:image JPG 1200×630 avec une adresse complète, 404 personnalisée, pas de Cache-Control ; mais l'en-tête X-Robots-Tag manque. |
| 9. Accessibilité | 4/5 | Focus doré visible, contrastes AA, Échap et piège du focus dans le menu, onglets au clavier, mode calme et « réduire les animations » respectés ; mais il reste des textes de 10,5 à 11,8 px et des liens de 25 à 26 px de haut sur téléphone. |
| **Total** | **83/100** | |

## Points forts

- **Une ouverture signature, propre au client.** L'enveloppe s'ouvre, le cachet « Œ » se fend et tombe, puis le rabat révèle la doublure bleu nuit et le carton d'invitation. On peut la passer d'un clic, elle est raccourcie aux visites suivantes et désactivée en mode calme (`captures/bande-ouverture-p1440.jpg`, `captures/bande-ouverture-m390.jpg`).
- **Un fil conducteur tenu jusqu'au bout.** Le plan de table de l'accueil propose 4 intentions. Chaque carton mène à /contact#intention, où le carton-réponse est déjà prérempli. Le formulaire en 4 étapes se termine sur « Votre carton-réponse est prêt… Ici, rien n'a été envoyé » (`captures/inter-contact-envoye-m390.jpg`).
- **Des images Grok cohérentes et sans défaut visible.** Papier coton, laiton, bleu nuit et lumière dorée reviennent d'une image à l'autre. Les mains (fleurs, cartons de placement) sont correctes.
- **Un contenu fidèle et honnête.** Les chiffres, les 30 références et les 6 témoignages (originaux et traductions marquées « à valider ») viennent du site actuel. Les mentions légales signalent les champs à compléter.
- **Des interactions abouties.** On y trouve :
  - des visionneuses avec flèches, compteur et Échap (`captures/inter-lb-galerie-p1440.jpg`, `captures/inter-lb-design-p1440.jpg`) ;
  - des filtres (55 → 7, 22 → 3) ;
  - des onglets de références au clavier ;
  - des boutons « Copier » qui fonctionnent ;
  - le bouton FR / EN.
- **Une base technique saine.** 60 i/s sur ordinateur et téléphone, aucune erreur console, aucun débordement horizontal, et un rendu propre sans WebGL ou avec « réduire les animations ».

## Défauts

### Bloquants

1. **La galerie horizontale épinglée sort de l'écran**
   - **Où :** accueil (« Des lieux, des tables, des musiques ») et /evenementiel (« Générer, sceller, fédérer, célébrer »). Pendant l'épinglage :
     - les cartes portrait dépassent de 28 à 36 px en 1280×720 et 1366×768, et leurs légendes ne sont jamais visibles ;
     - en 1000×560 et 1024×640, l'image dépasse jusqu'à 119 px et le lien « Fédérer ou remercier vos équipes » est coupé de 9 à 20 px.
   - **Captures :** `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-accueil-0-1366x768-50.jpg`, `captures/epingle-evenementiel-0-1366x768-50.jpg`, `captures/epingle-evenementiel-0-1000x560-50.jpg`.
   - **Cause :** `assets/css/site.css:397-400`. La taille des cartes dépend seulement de la largeur : `width: clamp(240px, 28vw, 420px)` avec un format 3/4, soit 478 px de haut à 1280 px de large. S'y ajoutent le titre de section et le décalage parallaxe de ±40 px (`assets/js/main.js:476`).
   - **Correction :** borner les cartes par la hauteur réelle. Pour cela :
     - mettre `.hs-sec` en `height: 100svh; display: flex; flex-direction: column`, la piste en `flex: 1; min-height: 0` ;
     - dans `.hs__item`, `width: min(clamp(240px, 28vw, 420px), calc((100svh - var(--hs-head-h) - 140px) * .75))`, avec `--hs-head-h` mesuré en JavaScript ;
     - réduire la parallaxe à ±16 px sous 800 px de hauteur.
   - **Effort :** moyen.

### Importants

1. **CLS de 0,117 au chargement de /design-graphique**
   - **Où :** /design-graphique, en p1280, p1366 et p1440, et aussi avec « réduire les animations » et sans WebGL. Je l'ai remesuré seul : 0,1169.
   - **Capture :** `captures/design-graphique-p1440-00.jpg`.
   - **Cause :**
     - Le titre « Logos, plaquettes, invitations, brochures, magazines… » alterne romain et italique (`site.css:529-532`). L'italique Bodoni Display n'est pas préchargé : seuls le romain et Hanken le sont (`design-graphique.html:19-20`).
     - À l'arrivée de la police, les coupures de ligne changent.
     - L'image, centrée verticalement (`design-graphique.html:58`, `align-items:center` en ligne), est déplacée (sources : `DIV.ph__media`, `SPAN.w`).
   - **Correction :** ajouter `<link rel="preload" href="assets/fonts/bodoni-display-italic-v2.woff2" as="font" type="font/woff2" crossorigin>` dans `design-graphique.html`. Aligner aussi `.ph__grid` en `align-items: start` sur cette page, ou réserver la hauteur du titre (`min-height` sur `.compose`).
   - **Effort :** petit.

2. **Cibles tactiles de moins de 44 px sur téléphone**
   - **Où :** toutes les pages, de m320 à m430 :
     - le téléphone et l'e-mail du pied de page : 26 px de haut ;
     - les mêmes liens dans le carton R.S.V.P. : 30 à 36 px ;
     - « Brochure 2023 (PDF) » : 25 px ;
     - le logo de l'en-tête : 43 px.
   - **Capture :** `captures/planche-accueil-m390.jpg` (16 à zz).
   - **Cause :** `site.css:473-474` (`.copy-row .sel` sans hauteur minimale), `site.css:161` (`.link-gold`) et `site.css:810` (`.hdr__logo { width: 96px }`).
   - **Correction :** sous 760 px, `.copy-row .sel, .link-gold { display: inline-flex; align-items: center; min-height: 44px; }`, et `min-height: 44px` sur `.hdr__logo`.
   - **Effort :** petit.

### Finition

1. **Textes de moins de 12 px sur téléphone.** Il s'agit des étiquettes « Table I » (10,6 px), « Témoignage original, en anglais » (11,2 px), « Premier service » et des horloges (11,5 px), du sur-titre `.label` et du bouton « EN » (11,8 px). Cause : `site.css:385` (`.place__tag` .66rem), `:439` (`.tag-tr` .7rem), `:367` et `:460` (.72rem), et `:114` (`.label`). Correction : un plancher à `.75rem`, soit 12 px, sous 760 px. Effort : petit.
2. **Virgule orpheline en début de ligne.** Dans « Logos, plaquettes, *invitations*, brochures… », la virgule passe seule à la ligne en m320, t820 et g1920 (`captures/planche-accueil-t820.jpg`, 08 ; `captures/planche-accueil-g1920.jpg`, 10). Cause : `index.html:164`, la virgule est hors de `<em>`, et la découpe en mots de `data-press` (`main.js:359`) en fait un mot à part. Correction : écrire `<em>invitations,</em>` ou envelopper `<em>invitations</em>,` dans un `<span class="nowrap">`. Il faut faire de même en anglais. Effort : petit.
3. **Ouverture à la limite des 3 s.** À la première visite, le titre devient lisible à l'étape 3 s, sur ordinateur comme sur téléphone (`captures/ouverture-p1440-t3000.jpg`, `captures/ouverture-m390-t2500.jpg`). Le rabat couvre encore le titre à 2,5 s. Cause : la timeline de `runLoader` (`main.js:302-335`). Correction : avancer le rabat de 0,3 s, ou faire apparaître le titre pendant la descente du rabat. Effort : petit.
4. **Pas de barre d'action fixe en bas sur téléphone.** Seul l'en-tête est fixe. Une barre « Confier un projet » et « Appeler » serait la bienvenue, masquée sur le carton-réponse et le pied de page. Effort : moyen.
5. **En-tête X-Robots-Tag absent.** `vercel.json` ne contient que `cleanUrls` et `trailingSlash`. Correction : ajouter `"headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }]`. Effort : petit.
6. **Image Grok du hero de /son.** Dans `images/ambiance/quatuor-1168.webp` (1168×784), le « quatuor » compte une silhouette en trop : un bras et un violon sortent du deuxième musicien. Sous le voile bleu nuit du hero, ce n'est pas lisible, d'où le classement en finition. À regénérer si le voile est allégé. Consigne : « Four string musicians (two violins, viola, cello) seen from behind in silhouette, seated in a tall empty 19th-century Parisian salon with columns, soft hazy window backlight, a few candles on a side table, warm ivory and deep navy palette, cinematic, 3:2, each musician clearly separated, no text, no logo, no watermark, no recognizable person, hands mostly hidden ». Effort : petit.
7. **Hero d'accueil un peu étroit en 1920×1080.** La carte du hero occupe environ 45 % de la largeur, avec un grand vide autour (`captures/planche-accueil-g1920.jpg`, 00). Il faudrait l'agrandir au-delà de 1600 px. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 3,0 s / ≈ 3,0 s (première visite ; raccourcie ensuite, passable d'un clic) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,117 sur /design-graphique (confirmé) ; 0,031 ailleurs au maximum après remesure |
| Poids de l'accueil, p1440 / m390 | 2,01 Mo / 1,57 Mo (galerie : 3,72 / 3,45 Mo) |
| Erreurs console, sans WebGL, réduire les animations | 0 / 0 / 0 (seule la 404 de la page introuvable elle-même) |
| Débordement horizontal | Aucun, à tous les formats |
| Sections épinglées | Galerie horizontale de l'accueil et d'/evenementiel : dépasse de 28 à 36 px en 1280×720 et 1366×768, et jusqu'à 119 px en 1000×560 ; visuel collant de /son : 2 à 11 px en 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui / oui sur 9 pages / absent / absent (non pénalisé) / JPG 1200×630 absolue / 20261027 partout / personnalisée |

## Vérifications écartées

- **« MASQUÉ » sous l'en-tête** (« London », « Brochure 2023 », e-mail du pied de page, « Préférences et cookies » en t820) : ce sont des captures de fin de page où le contenu défile sous l'en-tête fixe. Rien n'y reste caché une fois la page à l'arrêt.
- **CLS de 0,1385 sur /son en g1920** : remesuré seul à 0,031 (0,0027 en 1280×720). C'est un effet de charge, pas un défaut.
- **h1 « null ms »** : la mesure ne voit pas l'écran d'enveloppe. Le jugement repose sur les étapes 0,5 à 5 s.
- **Erreur « 404 » en console sur /zz-page-introuvable-audit** : c'est le statut de la page introuvable elle-même, attendu.
- **Disque crème au bord gauche de la grille de /design-graphique** : c'est la loupe qui suit le pointeur, resté à cet endroit pendant la capture. Elle disparaît hors des visuels.
- **Chiffres à moitié affichés (« 9̃12 », « 2̃00 »)** sur certaines captures : c'est le compteur en cours de défilement. La valeur finale est correcte sur les captures suivantes.
- **Image collante de /son en 1000×560** (2 à 11 px) : écart négligeable, sur un format non courant.


---

## loeilsingulier-maquette : corrections de l'étape 2

Commit 3c84da9 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Galerie horizontale épinglée hors écran (accueil, /evenementiel) | Bloquant | Section épinglée en `100svh` flex, `padding-top: var(--entete-h)` (en-tête mesuré par ResizeObserver) ; piste en `flex: 1; min-height: 0` ; largeur des cartes bornée par `--hs-h` (hauteur de piste mesurée), `--hs-cap` (légende mesurée) et `--hs-amp` (parallaxe, ±16 px sous 800 px de haut) ; `anticipatePin` retiré ; palier `max-height: 600px` | assets/css/site.css, assets/js/main.js | Coupe 119 / 52 / 32 / 29 px (accueil) et 60 / 20 / 36 / 34 px (/evenementiel) en 1000×560 / 1024×640 / 1280×720 / 1366×768 → 0 aux 8 tailles, légendes visibles (`preuve-epingle-*.jpg`) |
| Visuel collant de /son coupé en 1000×560 | Écarté (mesure de l'outil) | Largeur bornée par `100svh - --entete-h - 60px` | assets/css/site.css | 11 px → 0 |
| CLS 0,117 sur /design-graphique | Important | Préchargement de `bodoni-display-italic-v2.woff2`, grille du titre alignée en haut | design-graphique.html | 0,117–0,122 → 0,009 (p1280, p1366, p1440) |
| Cibles < 44 px sur téléphone | Important | `min-height: 44px` sur logo, coordonnées du pied et du R.S.V.P., « Brochure 2023 », « Ouvrir dans Plans », légendes-liens, sommaire des mentions, « Traduction anglaise », bouton d'en-tête (jusqu'à 1024 px) | assets/css/site.css | 12–15 → 1 par format (m320–m430), 14 → 1 en t820 |
| Textes < 12 px sur téléphone | Finition (récurrent texte-12) | `--t-label: max(12px, .74rem)` et plancher `max(12px, .75rem)` sur les classes concernées jusqu'à 1024 px | assets/css/site.css | 21–23 → 0 (m320 à t820) |
| Pas de barre d'action en bas sur téléphone | Finition (récurrent barre-bas) | Barre « Confier un projet » (contact.html) + « Appeler » (numéro déjà présent), après le héros, masquée sur formulaire, R.S.V.P., pied de page et menu ; `--barres-h` mesurée, pied de page dégagé ; absente de la 404 | 9 pages HTML, site.css, main.js | Aucun élément couvert par la barre (m320–m430) ; testée sur /, /contact, /son (`preuve-barre-bas-m390.jpg`) |
| En-tête : « Confier un projet » sur deux lignes en 1280 px | Constaté pendant la correction | `white-space: nowrap` et outils en icônes entre 1181 et 1365 px (noms accessibles conservés) | assets/css/site.css | 2 lignes → 1 (`preuve-entete-p1280.jpg`) |
| X-Robots-Tag absent | Finition | Déjà corrigé à l'étape 1 (vérifié dans vercel.json) | — | — |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Virgule orpheline dans « Logos, plaquettes, invitations, … » | Finition | finition |
| Ouverture lisible à 3 s | Finition | finition |
| Hero d'accueil étroit en 1920×1080 | Finition | finition |
| Silhouette en trop dans `quatuor-1168.webp` (hero de /son) | Finition | image Grok |
| Galerie de 3,7 Mo | Mentionné au critère 7 | non classé comme défaut ; images non touchées |
| Case à cocher du carton-réponse 24×24 px | Mesure | le libellé cliquable fait 44 px ; agrandir la case changerait le dessin |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats) | 0 partout | 0 partout |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 21 / 21 / 21 / 22 / 23 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 15 / 15 / 13 / 12 / 14 | 1 / 1 / 1 / 1 / 1 (case à cocher) |
| Éléments couverts | 0 par une barre du bas ; en-tête en fin de page seulement (écarté au rapport) | 0 par la barre du bas ; en-tête en fin de page seulement |
| Épinglage aux 8 tailles | 14 / 23 sans coupe (max 119 px) | 23 / 23 sans coupe |
| CLS max au chargement | 0,122 (/design-graphique) | 0,037 (/contact p1280), 0,009 sur /design-graphique |
| Erreurs console | 0 | 0 |
| Modules chargés deux fois | 0 | 0 (`v=20261028-2` partout) |

## Note proposée
Ancienne note 83/100 → nouvelle note 90/100 · bloquants restants : 0
- Critère 3 : 12 → 13, le titre composé de /design-graphique ne saute plus.
- Critère 5 : 11 → 14, galerie épinglée, petits textes et petites cibles corrigés (pas de 15/15).
- Critère 7 : 8 → 9, CLS de /design-graphique corrigé (reste le poids de la galerie).
- Critère 8 : 4 → 5, X-Robots-Tag présent (corrigé à l'étape 1).
- Critère 9 : 4 → 5, textes de 12 px et liens de 44 px sur téléphone.
