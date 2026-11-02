# aquafit-maquette

<https://aquafit-maquette.vercel.app> · audit du 28/10/2026 · dernier commit a1d043b du 27/10/2026

## Verdict

**77/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Concept « immersion » abouti et cohérent : surface claire, plongée, ligne d'eau, jeux utiles (planning, carte, prorata, questionnaire). La section épinglée du gilet cache le texte de sa 3e étape sur 1280×720 et 1366×768, l'ouverture dépasse 3 s et la mise en ligne n'est pas finie (X-Robots-Tag, `?v=`, og:image, 404).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro « surface puis plongée », eau WebGL et bulles, musique en option : univers fort et propre au métier, mais le titre n'arrive qu'à environ 3,5 s. |
| 2. Direction artistique et harmonie | 12/15 | Palette abysse et corail, Instrument Serif avec Manrope très juste ; les vraies photos (turquoise, plein soleil) et les images Grok (bleu nuit, contre-jour) ne parlent pas tout à fait la même langue, et quelques grands vides sur grand écran. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, galeries horizontales et schéma animé du gilet réussis ; ouverture au-delà de 3 s et section épinglée trop haute sur portable 720/768. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne : filtres et bouées du planning, carte du Léman, calcul au prorata, inscription en 3 étapes avec validation, questionnaire, curseur d'intensité, sac à cocher, menu, mode calme, son. |
| 5. Tous les formats | 10/15 | Bloquant épinglé sur 1280×720 et 1366×768, chapo et bouton du hero coupés à 320 px, badges à 10-11 px et cibles de 40-42 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Les données incertaines sont toutes marquées (« à confirmer », « 15 ou 25 ans ? », « nom exact », « PDF à fournir ») ; mentions légales seulement annoncées « à compléter ». |
| 7. Technique et performance | 9/10 | Aucune erreur de console, CLS 0, 1,28 Mo / 0,95 Mo, WebP en srcset, polices attendues avant l'ouverture, version sans WebGL propre. |
| 8. Mise en ligne | 1/5 | Public et noindex sur chaque page, mais pas d'en-tête X-Robots-Tag, aucun `?v=`, og:image en WebP 1280×852, 404 Vercel générique. |
| 9. Accessibilité | 4/5 | Mode calme et « réduire les animations » respectés, focus visible, alt soignés ; cibles et badges un peu petits sur téléphone. |
| **Total** | **77/100** | |

## Points forts

- Une vraie idée de mise en scène : la page « plonge », la jauge de profondeur à droite, la vague du pied de page qui remonte à la surface.
- Le schéma animé « On court sans toucher le fond » explique l'activité mieux qu'un texte.
- Outils réellement utiles au client : planning filtrable, carte des piscines avec prochain cours, calcul au prorata, inscription simulée avec récapitulatif.
- Fluidité parfaite (60 i/s, aucune image > 50 ms) sur portable et téléphone, CLS nul.
- Données à valider signalées partout, sans rien inventer ; vraies photos des monitrices et des cours.

## Défauts

### Bloquants

1. **Section épinglée du gilet trop haute : 3e étape hors de l'écran** : accueil, 1280×720 et 1366×768 (photo incrustée coupée aussi à 1440×900), `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-accueil-0-1366x768-50.jpg`. Pendant tout l'épinglage, « Pas d'appui au fond » (l'étape que le défilement met en avant à 66 %) et la fin de l'étape 2 restent sous le bas de l'écran. Cause : `assets/js/anim.js:100` épingle à `start: "top top"` une section qui garde son `padding-block` de 88 à 190 px (`assets/css/site.css:121`) ; la scène fait `max-height: 82vh` (`site.css:234`) et la photo déborde de 8 % (`site.css:238`). Correction : sur la section épinglée, `height: 100svh; padding-top: calc(var(--entete-h) + 24px); padding-bottom: 24px; display: flex; align-items: center`, scène limitée à `max-height: calc(100svh - var(--entete-h) - 64px)`, liste des étapes resserrée (`padding: 10px 0`) sous 800 px de haut ; ou n'épingler qu'au-dessus de 860 px de haut (`matchMedia("(min-height: 860px)")`). Effort : moyen.

### Importants

1. **Titre lisible après environ 3,5 s** : accueil, tous formats (première visite), `captures/bande-ouverture-p1440.jpg`, `captures/bande-ouverture-m390.jpg`. L'intro (logo puis vague) occupe 2,3 s, puis le titre s'anime lettre par lettre : partiel à 3 s, lisible à 4 s. Cause : `assets/js/main.js:88` attend la fin complète de `ouverture()` (`assets/js/ui.js:266-269` : 1,3 s + balayage 1,0 s). Correction : résoudre la promesse d'entrée dès le départ de l'intro (vers 1,25 s) pour que le titre arrive pendant le balayage, et raccourcir le `stagger` du titre ; viser le titre lisible à 2,5 s. Effort : petit.
2. **Hero coupé à 320 px** : accueil, m320, `captures/accueil-m320-00.jpg`. Le chapo et le bouton « Réserver mon cours d'essai offert » dépassent de 6 px et sont rognés (« portée pa »). Cause : `assets/css/site.css:208-209`, enfants flex de `.hero__bas` en `min-width: auto` élargis par le bouton qui ne passe pas à la ligne. Correction : `.hero__bas > * { min-width: 0 }` et `white-space: normal` sur `.bouton` sous 360 px. Effort : petit.
3. **Mise en ligne incomplète** : `vercel.json` sans en-tête X-Robots-Tag ; `assets/css/site.css` et `assets/js/main.js` appelés sans `?v=` (`index.html:19` et `:530`, idem sur les 2 autres pages) ; og:image en WebP 1280×852 (`index.html:15`) ; 404 générique de Vercel. Correction : ajouter `"headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }]`, `?v=1` identique partout, une `og-aquafit.jpg` 1200×630 tirée de la photo du hero, une `404.html` aux couleurs du site (fond abysse, « Vous avez touché le fond », retour à l'accueil). Effort : petit.

### Finition

1. **Textes de 10-11 px sur téléphone** : badges `.a-confirmer` (11 px) et nom de piscine dans les bouées du planning (10 px), `captures/planche-horaires-tarifs-m390.jpg`. Cause : `assets/css/site.css` (`.a-confirmer`, `.cours__txt small`). Correction : 12 px minimum. Effort : petit.
2. **Cibles de 40 à 42 px** : boutons Son et Copier, puces de filtre, « Choisir cette piscine », cases du sac (26 px, mais label cliquable). Correction : `min-height: 44px` sur `.outil`, `.copier`, `.puce`, `.bouton`. Effort : petit.
3. **Surtitre du hero peu lisible sur téléphone** : « AQUA-FIT EN EAU PROFONDE · VAUD & GENÈVE » se perd sur les reflets clairs de la photo, `captures/ouverture-m390-t5000.jpg`. Correction : voile plus sombre en haut de `accueil-hero-mobile` ou surtitre en `--texte`. Effort : petit.
4. **Deux familles d'images** : vraies photos turquoise en plein jour (accueil) et images Grok bleu nuit en contre-jour (Pour qui) ; un léger étalonnage commun (froid, ombres bleues) sur les vraies photos rapprocherait les deux. Effort : moyen.
5. **Grands vides sur grand écran** : sous la carte (« Où se retrouver ? ») et avant « Six piscines », `captures/planche-accueil-g1920.jpg`, `captures/planche-horaires-tarifs-p1440.jpg`. Effort : petit.
6. **Mentions légales** seulement annoncées « à compléter » dans le pied de page : prévoir la page avec les champs à remplir. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 3,5 s / ≈ 3,5 s (intro de 2,3 s, bandes prises seules ; h1 dans le DOM à 0,30 / 0,18 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0 |
| Poids de l'accueil, p1440 / m390 | 1,28 Mo / 0,95 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 / 0 / 0 (hors 404 attendue de la page introuvable) |
| Débordement horizontal | aucun (`scrollWidth` = largeur) ; contenu rogné de 6 px à 320 px |
| Sections épinglées | gilet : texte hors écran à 1280×720 et 1366×768, photo coupée de 51 à 153 px jusqu'à 1440×900 ; galeries horizontales accueil et Pour qui : OK |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui / oui (3 pages) / absent / absent (non pénalisé) / WebP 1280×852 / absent / générique Vercel |

## Vérifications écartées

- « MASQUÉ » sous l'en-tête compact (chapo, boutons de la remontée, titre du pied, « S'inscrire en ligne ») : relevés pendant le défilement vers le pied de page, éléments qui passent simplement sous l'en-tête fixe ; rien n'y reste bloqué.
- Heures « h1 » de 0,2 à 0,7 s : elles ne voient pas le voile d'intro ; l'ouverture est jugée sur les bandes.
- Cibles « svg > g » (points de la carte) : ce sont des zones de carte, testées au clavier et au clic, elles fonctionnent.
- Cases du sac à 26 px : le label entier est cliquable (testé), finition seulement.
- robots.txt absent : non pénalisé.
- Page 404 : l'erreur console « 404 » est attendue ; seule l'absence de page personnalisée est retenue.
- Images Grok (Pour qui, sac, ligne d'eau, profils) : regardées en taille réelle, aucune main, aucun visage ni objet déformé, aucun texte.


---

## aquafit-maquette : corrections de l'étape 2

Commit f51e627 (non poussé) · ?v=20261028-2

Étape 1 vérifiée (commit 8e3e146) : `vercel.json` porte X-Robots-Tag `noindex, nofollow` sur toutes les adresses, `?v=` identique sur site.css, main.js et tous les imports de modules, meta robots noindex sur les 3 pages. Pas de Cache-Control dans `vercel.json` (non exigé par l'audit). L'audit portait sur a1d043b, qui est aussi le dernier commit de l'utilisateur (« Maquette v3 galerie ajustee ») : tous les défauts cités existaient encore dans le dépôt, aucun n'était déjà corrigé.

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Section épinglée du gilet trop haute, 3e étape hors écran (1280×720, 1366×768, photo coupée jusqu'à 1920) | Bloquant | Méthode « tout tenir dans l'écran » au-dessus de 901 px : section en `100svh` en colonne flex, `padding-top` sur `--entete-h` mesurée, `padding-bottom` sur `--barres-h` (hauteur réelle de la barre du bas, mesurée en JS, 0 quand elle est masquée), grille en `flex: 1; min-height: 0`, scène en `max-height: 100%`, photo incrustée remontée dans la scène ; titre, texte et étapes à tailles liées à la hauteur (`vh`), paliers `max-height: 800px` / `max-width: 1100px` et `max-height: 660px`. Épinglage inchangé (`top top`, sans anticipatePin) | `assets/css/site.css`, `assets/js/ui.js` | Épinglages en défaut 21/72 → 0/72 ; 3e étape et photo dans l'écran aux 8 tailles et à 940×700 (preuve-gilet-*.jpg) |
| Titre lisible après environ 3,5 s | Important | La promesse d'ouverture se résout au départ de la vague (1,3 s) au lieu de sa fin ; titre en `stagger` 0,015 et 1,1 s | `assets/js/ui.js`, `assets/js/anim.js` | Titre entier et dégagé du voile à 2,5 s en p1440 et m390 (était partiel à 3 s) (preuve-ouverture-*.jpg) |
| Hero coupé à 320 px (chapo et bouton rognés) | Important | `.hero__bas > * { min-width: 0 }`, bouton du hero autorisé à passer à la ligne sous 360 px | `assets/css/site.css` | Chapo et bouton dans les 320 px, rien de rogné (preuve-hero-m320-*.jpg) |
| Mise en ligne : X-Robots-Tag, `?v=` | Important | Déjà corrigé à l'étape 1 ; `?v=20261028-2` partout | 3 pages, 4 modules | `grep "v=20261028[^-]"` vide, aucun module chargé deux fois |
| og:image en WebP 1280×852 | Important | `og-aquafit.jpg` 1200×630 tirée de la photo du hero (vraie photo, recadrée au centre) sur les 3 pages | `assets/img/og-aquafit.jpg`, 3 pages | JPEG 1200×630 ; répondra en 200 après déploiement (404 en ligne tant que non poussé) |
| 404 générique de Vercel | Important | `404.html` aux couleurs du site (même CSS, en-tête, menu et pied, chemins absolus), « Vous avez touché le fond. », retour à l'accueil et aux horaires ; sans intro ni barre du bas | `404.html` | 404 personnalisée en local (perso: false → true), menu mobile testé, aucune erreur (preuve-404-*.jpg) |
| Textes de 10-11 px sur téléphone | Finition (récurrent) | `max(12px, .75rem)` sur `.a-confirmer`, noms de piscine des bouées, « aujourd'hui », heures du planning ; marge intérieure des bouées réduite pour garder le nom entier | `assets/css/site.css` | 10 → 0 par format téléphone et tablette |
| Cibles de 40 à 42 px | Finition (récurrent) | Sous 960 px : `min-height: 44px` sur `.outil`, `.copier`, `.puce`, boutons des fiches et actions, logo, liens WhatsApp/Facebook et du pied, « Ce qui est compris » ; burger 44×44 | `assets/css/site.css` | 24-30 → 4-6 par format téléphone (restent les points de la carte et les cases du sac, voir ci-dessous) |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Surtitre du hero peu lisible sur téléphone | Finition | finition |
| Deux familles d'images (vraies photos et images Grok) | Finition | image Grok / finition |
| Grands vides sur grand écran | Finition | finition |
| Page mentions légales seulement annoncée | Finition | finition, donnée manquante (aucune information légale sur le site) |
| Points de la carte (`svg > g`) à 37-43 px de haut | Finition | écarté par l'audit : zones de carte testées au clavier et au clic |
| Cases du sac à 26 px | Finition | tout le libellé est cliquable (écarté par l'audit) |
| En-tête sur deux lignes à 1000×560 (« Pour qui », « Horaires & tarifs ») | Hors rapport | non signalé ; 1280 et 1366 restent sur une ligne |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal m320 / m360 / m390 / m430 / t820 | 404 Vercel 980 px (pages : aucun) | aucun |
| Débordement p1280 / p1366 / p1440 / g1920 | aucun | aucun |
| Textes < 12 px (par format téléphone et t820) | 10 | 0 |
| Cibles < 44 px m320 / m360 / m390 / m430 / t820 | 30 / 30 / 24 / 24 / 22 | 6 / 6 / 6 / 5 / 4 (carte, cases du sac) |
| Éléments couverts par la barre du bas (m320 à m430) | 0 | 0 |
| Éléments sous l'en-tête | passage pendant le défilement vers le pied (écarté) | idem |
| Épinglage gilet 1000×560 / 1024×640 / 1280×720 / 1366×768 / 1440×900 / 1728×1000 / 1920×1080 | photo hors écran de 153 / 98 / 97 / 73 / 51 / 5 / 11 px, texte de la 3e étape sous l'écran à 1280 et 1366 | tout dans l'écran (0 défaut sur 72 relevés) |
| Galeries horizontales (accueil, Pour qui) | OK | OK |
| Titre lisible à l'ouverture | ≈ 3,5 s | ≤ 2,5 s |
| Erreurs console | 0 (hors 404 attendue) | 0 (hors 404 attendue) |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 77/100 → nouvelle note 89/100 · bloquants restants : 0
- Critère 1 : 12 → 13, le titre arrive à 2,5 s au lieu de 3,5 s.
- Critère 3 : 11 → 13, ouverture sous 3 s et section épinglée qui tient dans l'écran sur 720/768.
- Critère 5 : 10 → 14, bloquant épinglé, hero à 320 px, textes à 12 px et cibles à 44 px corrigés.
- Critère 8 : 1 → 5, X-Robots-Tag et `?v=` (étape 1), og:image JPG 1200×630 et 404 personnalisée.
- Critère 9 : 4 → 5, cibles et badges agrandis sur téléphone.
