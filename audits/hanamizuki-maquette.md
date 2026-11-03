# hanamizuki-maquette

<https://hanamizuki-maquette.vercel.app> · audit du 2026-10-28 · dernier commit 079c30d du 2026-10-27

## Verdict

**78/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Une maquette originale et très ancrée dans le lieu : ciel calculé pour Saiki, carte réelle, table de l'île en galerie 3D, avis Airbnb réels en cartes postales, quatre langues. Deux sections collantes coupent leurs légendes sur les portables courants, la carte de l'horloge déborde dans le hero, et l'ouverture dure un peu plus de 3 s.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro kanji et marée, ciel en direct réglable et mer WebGL : première impression forte et propre au client, abîmée par la carte de l'horloge qui déborde dans le hero. |
| 2. Direction artistique et harmonie | 12/15 | Palette indigo, corail et washi tenue sur les trois pages, Cormorant, sans et mono bien associées, images Grok cohérentes entre elles ; les photos réelles des plats sont de qualité inégale et la jauge de marée fixe chevauche le contenu à gauche. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, galerie horizontale avec bascule 3D et banc de poissons réactif, mais titre lisible vers 3 s (portable) et 3,5 s (téléphone), et légendes coupées pendant l'épinglage. |
| 4. Expérience ludique et interactions | 9/10 | Ciel réglable, langues, calculateur, réservation en 3 étapes avec récapitulatif, choix à pied ou en voiture, avis, son et Mode calme : tout fonctionne sans explication. |
| 5. Tous les formats | 9/15 | Aucun débordement horizontal, mais légendes coupées à 1280×720 et 1366×768, horloge qui déborde de sa carte sur tous les portables, texte collé au bord dans la table sur téléphone et tablette, petits textes et petites cibles. |
| 6. Contenu et fiabilité | 9/10 | Contenu repris du site actuel (campagne -50 %, navette, horaires), avis réels datés avec lien, illustrations marquées et « à compléter » bien signalés ; pas de page d'informations légales. |
| 7. Technique et performance | 8/10 | Aucune erreur JS ni lien cassé, repli sans WebGL propre ; CLS de 0,112 en m390 dû à la traduction appliquée après le premier affichage, et 3 Mo sur l'accueil. |
| 8. Mise en ligne | 4/5 | Public, noindex et X-Robots-Tag, og:image JPG 1200×630 absolue, 404 aux couleurs ; aucun `?v=` sur le CSS et le JS du site. |
| 9. Accessibilité | 4/5 | Focus visible corail, Mode calme et « réduire les animations » respectés, textes alternatifs traduits ; textes de 9 à 11 px et cibles de 40 px sur téléphone, surtitre corail peu lisible sur le ciel clair. |
| **Total** | **78/100** | |

## Points forts

- Hero vivant : couleur du ciel, soleil, lune et phase calculés pour Saiki, avec un curseur pour voir une autre heure et un bouton « Ciel en direct ».
- La carte de la traversée vient des vraies côtes (MLIT), avec un mode à pied ou en voiture ; elle se lit vraiment sur la page Accès.
- Contenu fiable et sourcé : campagne Kyushu Fukkō, navette et avis de navigation repris du site actuel, avis Airbnb réels dans leur langue d'origine avec lien, images générées marquées « Illustration ».
- Réservation simulée complète : calculateur avec réduction, formulaire en 3 étapes, récapitulatif et bouton « Copier la demande ».
- Sur téléphone : barre Réserver / Appeler masquée sur le formulaire et le pied de page, Mode calme présent dans le menu, verrou du défilement quand le menu est ouvert.
- Fluidité de 60 i/s sur portable et téléphone.

## Défauts

### Bloquants

1. **Légendes des plats coupées pendant l'épinglage de la table** : accueil, 1280×720, 1366×768 (et 1440×900 au début), `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-accueil-0-1366x768-92.jpg`. Les noms des plats (« Assortiment de sashimi », « Bol laqué ») passent sous le bas de l'écran alors que 150 px restent vides en haut. Cause : `assets/css/site.css:459` (`.table-pin` en `min-height: min(100svh, 980px)`, centré), `:462` (largeur des plats en `28vw` sans lien avec la hauteur) et `:464` (décalage `8vh` des plats pairs). Correction : `.table-pin { height: 100svh; padding-top: calc(var(--hd-h) + 24px); padding-bottom: 24px }`, largeur des plats `min(28vw, calc((100svh - var(--hd-h) - 160px) * .8))`, décalage des plats pairs réduit à `clamp(16px, 4vh, 48px)`. Effort : moyen.
2. **Note de la carte coupée sur la page Accès** : accès, 1280×720 et 1024×640, `captures/epingle-acces-0-1280x720-50.jpg`. La deuxième ligne de la note (« … indicatifs (à confirmer). ») sort de l'écran pendant que la carte reste collée. Cause : `assets/css/site.css:427` (`.map { max-height: 82svh }`) avec `:714` (`top: calc(var(--hd-h) + 30px)`). Correction : `.route-map .map { max-height: calc(100svh - var(--hd-h) - 30px - 4.5rem) }` sur ordinateur, ou note placée au-dessus de la carte. Effort : petit.

### Importants

1. **Contenu de la carte « À Saiki » qui déborde dans le hero** : accueil, 1280, 1440, 1920, `captures/accueil-p1440-00.jpg`. Le bouton « Ciel en direct », le libellé « JOUR » et la note sortent du cadre de la carte. Cause : `assets/css/site.css:774` (`width: 236px` fixe) avec `:777-779` (`.scrub` en flex, bouton en `nowrap`) et la grille de `.clock` (`:366`) sans `minmax(0, 1fr)`. Correction : `.clock { grid-template-columns: minmax(0, 1fr) }`, `.hero .clock { width: clamp(260px, 22vw, 300px) }`, ou bouton « Ciel en direct » sur sa propre ligne. Effort : petit.
2. **Ouverture un peu longue** : accueil, tous formats, `captures/bande-ouverture-p1440.jpg`, `captures/bande-ouverture-m390.jpg`. Titre lisible vers 3 s sur portable et vers 3,5 s sur téléphone (le voile dure 2,65 s, puis l'écriture du titre 1,2 s). Cause : `assets/js/home.js:37-41`. Correction : voile terminé à 1,6 s (`loader` à 1,1 s, `intro.play()` à 1,2 s) et écriture du titre en 0,8 s. Effort : petit.
3. **Texte du hero peu lisible sur le ciel clair sur téléphone et tablette** : accueil, m390, t820, `captures/accueil-m390-00.jpg`. Le surtitre corail et la fin des lignes blanches tombent sur un ciel bleu pâle (le matin). Cause : `assets/css/site.css:337` (voile en dégradé horizontal pensé pour un texte à gauche sur ordinateur). Correction : sous 900 px, voile vertical `linear-gradient(180deg, rgba(10,19,32,.55), rgba(10,19,32,.35) 60%, rgba(10,19,32,.6))`, contraste vérifié à 4,5:1 sur le paragraphe. Effort : petit.
4. **Texte de la table collé au bord de l'écran** : accueil, m390, t820, `captures/accueil-m390-06.jpg`. Le carrousel en `scroll-snap` aligne l'intro sur le bord, sans la marge. Cause : `assets/css/site.css:472-473` (`scroll-snap-align: start` sans `scroll-padding`). Correction : `.table-track { scroll-padding-inline: var(--pad) }`. Effort : petit.
5. **Traduction appliquée après le premier affichage** : accueil m390 (CLS 0,112), toutes les pages ; le sous-titre du voile s'affiche d'abord en japonais puis passe en français (`captures/ouverture-m390-t0500.jpg` puis `t1500`). Cause : `assets/js/core.js:638` (`applyLang` dans le module, après le premier rendu). Correction : appliquer la langue dans un script classique juste après `i18n.js` (avant les modules), ou garder le contenu masqué jusqu'à `applyLang`. Effort : moyen.
6. **Textes de moins de 12 px et cibles de moins de 44 px sur téléphone** : toutes les pages, m320 à m430. « % OFF » 9,3 px, « Ciel en direct » 9,9 px, « Illustration » 9,9 px, « À Saiki » 10,6 px ; menu et langue 40 px, boutons des avis 40 px, « Ciel en direct » 24 px, liens du pied de page 17 à 25 px, champs du calculateur 24 px. Cause : `assets/css/site.css:388`, `:369`, `:779`, `:204`. Correction : plancher `font-size: max(12px, …)` et `min-height: 44px` (ou pseudo-élément) sur ces éléments. Effort : petit.
7. **Pas de page d'informations légales** : pied de page des trois pages. Correction : page « Informations / 運営者情報 » liée depuis le pied de page, données de l'hôte « à compléter ». Effort : petit.

### Finition

1. **Jauge de marée fixe qui chevauche le contenu** : accueil et accès, ≥ 1200 px, `captures/accueil-p1440-05.jpg`. Elle passe sur le titre de la table, les photos et la carte. Cause : `assets/css/site.css:257-259`. Correction : la masquer dans les sections pleine largeur (classe posée par ScrollTrigger) ou la réduire à 12 px de large. Effort : petit.
2. **Grand vide entre la carte et la table** : accueil, p1440, `captures/accueil-p1440-04.jpg`. Environ 600 px vides. Cause : `assets/css/site.css:459` (pin centré sur 100svh). Correction : réglée avec le bloquant 1. Effort : petit.
3. **Étapes du formulaire qui se touchent** : séjour, m390, `captures/sejour-m390-13.jpg` (« Dates et voyageurs » contre « Souhaits »). Cause : `assets/css/site.css:684` (`gap: 0`). Correction : `gap: 8px` et libellés sur deux lignes. Effort : petit.
4. **Légendes « Photo de 2016 » sur trois lignes** : accès, m390, `captures/acces-m390-05.jpg`. Correction : légende sous l'image, pleine largeur. Effort : petit.
5. **Message de console sans WebGL** : « unable to create webgl context » (repli image correct). Cause : `assets/js/sea.js:106`. Correction : tester `getContext('webgl')` avant `new Renderer`. Effort : petit.
6. **Accent de « l'île » qui touche l'apostrophe** dans le titre en italique : `captures/accueil-p1440-00.jpg`. Correction : `letter-spacing: 0` sur l'italique ou espace fine. Effort : petit.
7. **Aucun `?v=`** sur `site.css`, `i18n.js`, `data.js`, `map-data.js`, `home.js`, `acces.js`, `sejour.js`. Correction : même `?v=` partout. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 3,0 s / ≈ 3,5 s (bandes d'ouverture ; voile de 2,65 s voulu par le code, visible seulement à la première visite) |
| Fluidité p1440 / m390 | 59,9 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,112 en m390 (traduction tardive) ; autres formats ≤ 0,089 |
| Poids de l'accueil, p1440 / m390 | 2,96 Mo / 2,34 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS ; sans WebGL : message OGL, repli image correct ; réduire les animations : tout visible, CLS ≤ 0,036 |
| Débordement horizontal | Aucun (9 formats, 4 pages) |
| Sections épinglées | Accueil, table : légendes coupées à 1280×720, 1366×768 (et 1440×900 au début), important à 1000×560 et 1024×640 ; Accès, carte : note coupée à 1024×640 et 1280×720 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex sur les 3 pages · X-Robots-Tag noindex, nofollow · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · `?v=` absent · 404 aux couleurs |

## Vérifications écartées

- Heures « h1 » de 3,6 à 5,7 s sur l'accueil : prises avec 5 maquettes en parallèle ; l'ouverture est jugée sur les bandes (≈ 3 s et 3,5 s), qui correspondent à la durée du voile dans le code.
- Erreur « 404 » dans la console de la page introuvable : c'est le statut de la page elle-même.
- `title=null` dans le résumé : la balise `<title>` est présente dans chaque page (traduite par `data-i18n`).
- `canvas.shoal` sous l'en-tête ou hors de l'écran : canvas décoratif de fond, pas un défaut.
- Section table à 1728×1000, 1920×1080 et 2560×1440 : seul le canvas dépasse, les légendes tiennent.
- Images Grok (16 images vues en taille réelle) : aucune main, aucun texte ni filigrane, lumière et palette cohérentes ; elles sont marquées « Illustration ».
- Avis clients : réels, datés de 2018-2019, avec un lien vers le profil Airbnb de l'hôte ; la note précise que certains portent sur les anciennes nuits en voilier.
- Campagne « -50 % jusqu'au 25 décembre » et navette : vérifiées dans les actualités du site actuel (oita-yado.com/info, 10 et 16 octobre 2026).


---

## hanamizuki-maquette : corrections de l'étape 2

Commit 268388f (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Légendes des plats coupées pendant l'épinglage de la table | Bloquant | Méthode « Tout tenir dans l'écran » : section épinglée en `height: 100svh`, colonne flex, `padding-top: var(--entete-h)` mesuré en JS (ResizeObserver) ; piste en `flex: 1; min-height: 0; container-type: size`, largeur des plats liée à la hauteur (`100cqh`), décalage des plats pairs en `clamp(12px, 4cqh, 48px)` ; paliers `max-height: 760px` et `600px` pour l'intro | site.css, core.js | 1000×560, 1024×640, 1280×720, 1366×768, 1440×900 : 1 à 3 éléments coupés → 0 aux 8 tailles × 3 positions (`preuve-table-*`) ; vérifié aussi en position stabilisée (1,6 s) |
| Note de la carte coupée (Accès) | Bloquant | `.route-map` en colonne flex, `max-height: calc(100svh - var(--entete-h) - 32px)`, carte en `flex: 0 1 auto; min-height: 0`, collée sous l'en-tête mesuré | site.css | 1000×560, 1024×640, 1280×720 : note coupée de 6 à 22 px → note entière, 27 px de marge (`preuve-carte-*`) |
| Carte « À Saiki » qui déborde dans le héros | Important | Grille `minmax(0, 1fr)`, largeur `clamp(260px, 22vw, 300px)`, ligne du curseur et en-tête de carte en `flex-wrap` | site.css | 1280 et 1440 : éléments hors cadre → aucun (`preuve-horloge-*`) |
| Ouverture un peu longue | Important | Voile terminé à 1,6 s (au lieu de 2,65 s), titre lancé à 1,2 s et écrit en 0,8 s | home.js | h1 visible desktop 4,0–7,2 s → 2,5–2,7 s (mesure de l'outil, à charge égale) |
| Texte du héros peu lisible sur ciel clair (téléphone, tablette) | Important | Sous 900 px : voile vertical sombre sous le texte (0,8 → 0,72 jusqu'à 640 px), surtitre en `#ffb79c`, coordonnées en washi | site.css | `preuve-heros-m390-apres.jpg` |
| Texte de la table collé au bord | Important | `scroll-padding-inline` égal à la marge de page | site.css | intro à 0 px → 16 px du bord (`preuve-table-m390-marge-apres.jpg`) |
| Traduction appliquée après le premier affichage | Important | Nouveau script classique `lang-apply.js` juste après `i18n.js` (déplacés avant GSAP et les modules) ; contenu masqué (`i18n-wait`, secours CSS à 2 s) jusqu'à l'application quand la langue n'est pas le japonais | lang-apply.js, 5 pages HTML, site.css | CLS accueil m390 0,112 (audit) / 0,025 → 0,002 ; séjour m320–m430 0,15–0,22 → 0 ; sous-titre du voile directement en français |
| Textes < 12 px sur téléphone | Important | Plancher `max(12px, …)` sur surtitres mono, badges, légendes, notes, pied de page (≤ 920 px) ; libellés SVG de la carte et du schéma radial à 12 px | site.css, map.js | 3 à 15 éléments par page → 0 sur toutes les pages, m320 à t820 |
| Cibles < 44 px sur téléphone | Important | 44 px pour langue, menu, flèches des avis, « Ciel en direct », curseur, « Copier », bascule à pied/voiture, champs et boutons des compteurs, liens du pied de page, actus et accès rapides | site.css | 5 à 16 cibles par page → 0 (accueil, 404), 1 (accès, informations : marque de l'en-tête mesurée à 43,6 px pendant son animation), 2 (séjour : voir non corrigé) |
| Barre du bas (leçons du lot 1) | Important | N'apparaît qu'une fois le héros dépassé (IntersectionObserver sur le héros de chaque page), masquée sur formulaire, CTA, pied de page, 404 et menu ouvert ; `--barres-h` mesurée en JS, pied de page en `padding-bottom: calc(var(--barres-h) + 24px)` | core.js, site.css | couverts : 0 → 0 de m320 à m430 ; testée : masquée en haut, visible après le héros, masquée menu ouvert, réapparaît à la fermeture, masquée au pied de page et sur la 404 |
| Pas de page d'informations légales | Important | `informations.html` au gabarit des autres pages (en-tête, menu, pied, barre), avec seulement nom, adresse, téléphone, e-mail, mention maquette et crédits photo déjà présents ; exploitant, numéro d'autorisation, éditeur, hébergeur, données personnelles « à compléter » ; lien ajouté dans le pied de page des 5 pages ; libellés traduits en 4 langues | informations.html, i18n.js, 5 pages HTML | page mesurée sur les 9 formats : aucun débordement, aucun texte < 12 px (`preuve-informations-m390.jpg`) |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Jauge de marée fixe qui chevauche le contenu ≥ 1200 px | Finition | finition |
| Grand vide entre la carte et la table | Finition | réglé de fait par le bloquant 1 (section à 100svh, plus de centrage dans 980 px) |
| Étapes du formulaire qui se touchent | Finition | finition |
| Légendes « Photo de 2016 » sur trois lignes | Finition | finition |
| Message console sans WebGL | Finition | finition |
| Accent de « l'île » contre l'apostrophe | Finition | finition |
| Aucun `?v=` | Finition | déjà corrigé à l'étape 1 (passé ici en `?v=20261028-2`) |
| Case à cocher « réduction » du calculateur 22 px | Important (partiel) | le libellé cliquable fait 44 px ; agrandir la case elle-même dénaturerait le formulaire |
| Champs « à compléter » de la page Informations | — | donnée manquante (exploitant, autorisation, éditeur, hébergeur, données personnelles) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats, toutes pages) | aucun | aucun |
| Textes < 12 px (accueil / séjour / accès / 404, téléphone et tablette) | 15 / 15 / 11 / 3 | 0 / 0 / 0 / 0 |
| Cibles < 44 px (accueil / séjour / accès / 404) | 11–12 / 16 / 10–11 / 5 | 0 / 1 (case à cocher) / 1 (marque de l'en-tête mesurée pendant son animation, m390 seulement) / 0 |
| Éléments couverts par la barre (m320–m430) | 0 | 0 |
| Épinglage accueil (8 tailles × 3 positions) | coupes à 1000×560, 1024×640, 1280×720, 1366×768, 1440×900 | aucune coupe |
| Épinglage accès (8 tailles × 3 positions) | note coupée à 1000×560, 1024×640, 1280×720 | aucune coupe |
| CLS téléphone accueil / séjour | 0,025 / 0,15–0,22 | 0,002–0,023 / 0 |
| CLS desktop accueil | 1 (canvas `.shoal` décoratif dans la section épinglée) | 1 (inchangé, même source, sans effet visible) |
| Titre visible desktop (h1, outil) | 4,0–7,2 s | 2,5–2,7 s |
| Erreurs console | aucune (hors statut 404 de la page introuvable) | aucune nouvelle |
| Modules chargés deux fois | aucun | aucun (`?v=20261028-2` partout) |

Les deux dernières retouches (lien téléphone de la carte « Infos pratiques » et boutons des compteurs à 44 px) ont été vérifiées par script ciblé après l'audit complet, pas par une nouvelle passe complète.

## Note proposée
Ancienne note 78/100 → nouvelle note 88/100 · bloquants restants : 0
- c1 12 → 13 : la carte de l'horloge citée ne déborde plus.
- c3 11 → 13 : ouverture raccourcie et légendes entières pendant l'épinglage.
- c5 9 → 13 : légendes coupées, horloge, texte collé au bord, petits textes et cibles corrigés (4 défauts cités).
- c6 9 → 10 : page d'informations légales ajoutée.
- c7 8 → 9 : traduction appliquée avant le premier affichage (CLS) ; le poids de 3 Mo reste.
- c9 4 → 5 : textes, cibles et surtitre du héros corrigés.
- c2, c4, c8 inchangés (jauge non traitée ; `?v=` déjà corrigé à l'étape 1, non compté ici).
