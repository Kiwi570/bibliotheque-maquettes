# ollizfx-maquette

<https://ollizfx-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 2791f78 du 25/10/2026

## Verdict

**79/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Maquette élégante et très riche (calculateurs, test de niveau, chat, horloge des sessions, lanterne), images Grok cohérentes et sans défaut. Elle perd surtout sur la fluidité (saccades confirmées), l'en-tête à 320 px et la mise en ligne (pas de X-Robots-Tag ni de `?v=`).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture en bougie de cotation, mer de nuit en WebGL et réticule « graphique » originaux et liés au métier, mais l'intro d'environ 1,8 s retarde un peu le premier choc. |
| 2. Direction artistique et harmonie | 12/15 | Palette « Méditerranée de nuit / lanterne » et duo Instrument Serif + Geist très maîtrisés ; deux images en plein jour doré (ruelle, Esterel) tranchent avec la série nocturne. |
| 3. Animations et effets | 10/15 | Parcours horizontal épinglé, journée qui défile, mosaïque qui devient graphique et lanterne : riche, mais 53,8 / 53,1 i/s avec 3 images > 100 ms sur les deux formats (pénalité confirmée). |
| 4. Expérience ludique et interactions | 9/10 | Calculateur de taille de position, simulateur de levier, heat map, test de niveau, chat, recherche du lexique et formulaires simulés fonctionnent tous et se comprennent seuls. |
| 5. Tous les formats | 11/15 | Aucun débordement, mais le bouton « Le programme » est coupé à 320 px, textes de 9 à 11 px sur téléphone et plusieurs zones tactiles sous 44 px. |
| 6. Contenu et fiabilité | 9/10 | Aucun avis ni chiffre inventé, contenus provisoires bien marqués (« à compléter », photo du formateur à fournir), avertissement sur les risques et mentions légales présents. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, CLS ≈ 0, accueil à 1,17 Mo, repli sans WebGL propre ; les effets de défilement coûtent trop en peinture. |
| 8. Mise en ligne | 3/5 | Public, noindex partout, og:image 1200×630 absolue, robots.txt correct et 404 aux couleurs ; mais pas d'en-tête X-Robots-Tag et aucun `?v=` sur le CSS et le JS. |
| 9. Accessibilité | 4/5 | Focus visible, Mode calme et « réduire les animations » bien respectés, textes alternatifs complets ; quelques cibles tactiles et textes trop petits. |
| **Total** | **79/100** | |

## Points forts

- Direction artistique sur mesure : le trading raconté depuis Fréjus (mer de nuit, lanterne, Forum Julii en mosaïque qui devient un graphique en chandeliers).
- Outils réellement utiles et justes : taille de position, effet de levier, heat map, horloge des sessions en heure de Paris.
- Ton honnête et prudent : avertissement sur les risques, règle du 1 %, « personne ne peut vous promettre un gain ».
- Série d'images Grok cohérente (heure bleue, lampe chaude, Méditerranée), sans main, visage ni texte déformé.
- Mode calme, `prefers-reduced-motion` et version sans WebGL soignés.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Saccades pendant le défilement** : accueil, p1440 et m390 (53,8 / 53,1 i/s, 10 et 11 images > 50 ms, 3 > 100 ms, aucune tâche longue : le coût est dans la peinture et non dans le JS). Causes probables : `assets/css/style.css:300-307` + `assets/js/home.js:137-154`, la lanterne anime `--x`, `--y` et `--r` (masque radial sur un texte de 5,4 rem avec `text-shadow` de 40 px, et `.beam` qui change `left`, `top`, `width` et `height`, donc une mise en page à chaque image) ; `assets/css/style.css:118`, `backdrop-filter: blur(14px)` sur l'en-tête plein largeur pendant tout le défilement ; `assets/js/home.js:223`, la mosaïque redessine plus de 1 500 tuiles à chaque mise à jour du défilement ; `assets/js/scenes.js:557`, `paint()` réaffecte `canvas.width` à chaque image des tracés animés. Correction : animer la lanterne en `transform` (calque `.beam` de taille fixe déplacé en `translate3d`, masque appliqué sur un calque `will-change: transform` ou remplacé par un dégradé fixe déplacé), retirer le `text-shadow` du texte masqué ; remplacer le flou de l'en-tête par un fond opaque à 94 % ; ne redessiner la mosaïque que si la progression a changé de plus de 0,5 % et ne pas réaffecter la taille du canvas tant que la taille ne change pas. Effort : moyen.
2. **Bouton « Le programme » coupé à 320 px** : accueil et toutes les pages, m320, `captures/accueil-m320-00.jpg` (73 px de large pour 100 px de texte, « programm » tronqué sur deux lignes). Cause : `assets/css/style.css:638`, `.head-cta` sans `white-space: nowrap` ni palier sous 360 px. Correction : `white-space: nowrap` et, sous 360 px, masquer `.head-cta` ou réduire la marque (`.brand` à 1,4 rem). Effort : petit.
3. **X-Robots-Tag absent et aucun `?v=`** : toutes les pages. Cause : `vercel.json:1-4` sans bloc `headers` ; `index.html:23` et `:274-279` (et les 4 autres pages) appellent `style.css` et les JS du site sans version. Correction : ajouter `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)` ; ajouter le même `?v=` à `style.css`, `data.js`, `images.js`, `scenes.js`, `main.js`, `hero.js`, `home.js`, `formation.js`, `lexique.js`, `outils.js` dans toutes les pages. Effort : petit.

### Finition

1. **Textes de moins de 12 px sur téléphone** : outils (heat map à 9 px), accueil et outils (« Heure de Paris, maintenant » à 11 px, graduations de l'horloge à 11 px), lexique (étiquettes SVG à 10 px). Cause : `assets/css/style.css:565`, `:259`, `:525`. Correction : `font-size: max(12px, …)` ; sous 430 px, heat map en défilement horizontal avec cellules à 12 px plutôt que 9 px. Effort : petit.
2. **Zones tactiles sous 44 px** : marque `OLLIZ FX` 118×27, curseur `#hour` 16 px de haut, liens « Calculer une taille de position » et « Voir sa présentation » 24 px, téléphone et e-mail 29 px, lettres du lexique 34 px, champs `#lev-ratio` et `#var` 37 px. Cause : `assets/css/style.css:121`, `:271`, `:172`, `:371`, `:670` (qui écrase le 44 px de `:614`). Correction : `min-height: 44px` (padding ou zone `::before`) sur ces éléments ; supprimer la règle `.letters a` à 34 px de la ligne 670. Effort : petit.
3. **Deux images en plein jour dans une série nocturne** : accueil, `assets/img/contact-rue.webp` (ruelle en lumière dorée de jour) et `assets/img/frejus-esterel.webp` (coucher de soleil vif) ; sans défaut, mais elles cassent un peu l'ambiance « heure bleue + lampe ». Correction possible : régénérer la ruelle à l'heure bleue avec lanternes allumées. Effort : petit.
4. **Intro de 1,8 s avant le titre** : accueil, `captures/ouverture-p1440-t1500.jpg` (voile encore présent) puis titre lisible à 2 s. Dans la limite des 3 s, mais une intro raccourcie à 1,2 s renforcerait le premier choc. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,0 s / 2,0 s (intro de la bougie, captures t1500 encore voilées, t2000 lisibles) |
| Fluidité p1440 / m390 | 53,8 i/s / 53,1 i/s (pénalité : 3 images > 100 ms sur chaque format, confirmée par une 2e mesure) |
| CLS au chargement (max) | 0,0006 (mentions légales p1280) ; accueil 0,0003 |
| Poids de l'accueil, p1440 / m390 | 1,17 Mo / 0,82 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur (hors 404 attendue de la page introuvable) ; repli image propre sans WebGL ; réduire les animations respecté |
| Débordement horizontal | aucun |
| Sections épinglées | parcours horizontal et horloge des sessions : tiennent dans l'écran aux 8 tailles |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex, nofollow sur les 5 pages · X-Robots-Tag absent · robots.txt `Allow: /` · og:image JPG 1200×630 absolue · `?v=` absent · 404 aux couleurs |

## Vérifications écartées

- Erreur « Failed to load resource: 404 » sur `/zz-page-introuvable-audit` : c'est le statut 404 de la page elle-même, attendu.
- Ouvertures « h1 » de 350 à 690 ms (m390 formation, lexique, mentions) : mesurées en parallèle, sans effet sur l'ouverture réelle (2 s).
- Barre « bas » de 150 px sur lexique m430 : c'est la barre de recherche collante `.lex-tools` capturée en cours de défilement, pas une barre fixe qui masque le contenu.
- Case à cocher 18×18 du formulaire : son libellé cliquable couvre toute la ligne.
- « Plafonné à 30:1 pour les particuliers dans l'Union européenne » : règle ESMA réelle, pas un fait inventé.
- Interactions : menu mobile, bandeau du lexique (fenêtre de définition), FAQ, chat (réponse « Spread »), formulaire de contact (erreurs sur champs vides puis envoi simulé), calculateurs, heat map « Simuler », test de niveau, inscription en 4 étapes, recherche et lettres du lexique, Mode calme : tout fonctionne, sans erreur de console.


---

## ollizfx-maquette : corrections de l'étape 2

Commit 828e4ff (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Saccades pendant le défilement (accueil) | Important | Faisceau de la lanterne de taille fixe déplacé et agrandi en `transform` (`translate3d` + `scale(--k)`, plus de `left/top/width/height` à chaque image) ; `text-shadow` retiré du texte masqué ; `backdrop-filter` de l'en-tête remplacé par un fond à 94 % ; mosaïque redessinée seulement si la progression bouge de plus de 0,5 % ; `paint()` ne réaffecte plus la taille du canvas quand elle ne change pas (effacement + `save/restore`) | `style.css`, `home.js`, `scenes.js` | p1440 52,6 i/s, 22 images > 50 ms, 1 > 100 ms (1re mesure 54,3 / 18 / 3) → 60 i/s, 0, 0 ; m390 54,5 i/s, 15 > 50 ms → 60 i/s, 0 |
| Bouton « Le programme » coupé à 320 px | Important | `white-space: nowrap` et `min-height: 44px` sur `.head-cta` ; sous 360 px : marque à 1,4 rem, écarts de 8 px, bouton et Menu un peu moins larges | `style.css` | 320 : texte 113 px dans 92 px → bouton 108 px sur une ligne (`preuve-avant/apres-entete-m320.jpg`) |
| X-Robots-Tag absent, aucun `?v=` | Important | Déjà corrigé à l'étape 1 (53c76df, vérifié : `vercel.json` X-Robots-Tag noindex, nofollow) ; versions passées à `?v=20261028-2` (35 références, aucune ancienne restante) | toutes les pages | versions identiques sur les 5 pages, 0 module en double |
| Textes de moins de 12 px sur téléphone | Finition (récurrent) | « Heure de Paris » 12 px ; heat map à 12 px sous 560 px avec défilement horizontal (cellules de 44 px) ; graduations de l'horloge et étiquettes de la carte de contact dimensionnées en JS pour faire 12 px à l'écran malgré la réduction du viewBox (bureau inchangé) ; schémas du lexique à 12 px (« Objectif : 2 » replacé au-dessus du rectangle, il sortait du cadre) | `style.css`, `main.js`, `lexique.js` | 35 relevés (m320 à t820) → 0 |
| Zones tactiles sous 44 px | Finition (récurrent) | Téléphone (`pointer: coarse` ou ≤ 760 px) : marque, curseurs `range`, téléphone et e-mail, liens soulignés (zone étendue sans changer l'interligne) à 44 px ; règle `.letters` à 34 px limitée aux pointeurs fins | `style.css` | 97 relevés → 5 (case à cocher 18×18 de l'accueil, écartée dans le rapport : libellé cliquable) |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Deux images en plein jour (`contact-rue.webp`, `frejus-esterel.webp`) | Finition | Image Grok |
| Intro de 1,8 s avant le titre | Finition | Finition non traitée |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px (relevés, m320 à t820) | 35 | 0 |
| Cibles < 44 px (relevés, m320 à t820) | 97 | 5 (case à cocher écartée) |
| Éléments couverts | 0 | 0 |
| Épinglage aux 8 tailles + 2560 (parcours horizontal et horloge) | 39 mesures sans problème | 39 mesures sans problème ; 1280×720 et 1366×768 vérifiés sur capture |
| Fluidité p1440 (même méthode que le rapport) | 52,6 i/s, p95 17,6 ms, 22 > 50 ms, 1 > 100 ms (pénalité confirmée) | 60 i/s, p95 18,6 ms, 0 > 50 ms, 0 > 100 ms |
| Fluidité m390 | 54,5 i/s, 15 > 50 ms (pénalité confirmée) | 60 i/s, 0 > 50 ms, 0 > 100 ms |
| Erreurs console | 404 attendue de la page introuvable seulement | idem, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 |
| Interactions (menu, curseur des heures, FAQ, heat map « Simuler », levier, lettres du lexique) | OK | OK, 0 erreur |

## Note proposée
Ancienne note 79/100 → nouvelle note 87/100 · bloquants restants : 0
- 3. Animations 10 → 11 : la pénalité de fluidité citée est levée (60 i/s, aucune saccade).
- 5. Formats 11 → 14 : bouton coupé à 320 px, textes de 9 à 11 px et cibles sous 44 px corrigés (15/15 non accordé).
- 7. Technique 9 → 10 : le coût de peinture des effets de défilement cité est corrigé.
- 8. Mise en ligne 3 → 5 : X-Robots-Tag et `?v=` déjà corrigés à l'étape 1.
- 9. Accessibilité 4 → 5 : cibles tactiles et textes trop petits corrigés.
