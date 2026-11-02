# surffm-maquette

<https://surffm-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 3f7fcb3 du 27/10/2026

## Verdict

**82/100 · À peaufiner · 1 défaut bloquant**

Le concept « houle hertzienne » est le plus abouti du lot : écran de recherche de station, houle WebGL, cadran de fréquences et son qui continue d'une page à l'autre. Il reste à réparer le bouton Copier et quelques finitions de typographie et de mise en page (accents coupés, puces sous le lecteur, texte à 11,8 px).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Recherche de station 88 → 108 MHz puis « DAB+ SURF FM », houle WebGL sous un titre géant et cadran de fréquences : un concept taillé pour une radio de glisse, sans rien d'un modèle tout fait. |
| 2. Direction artistique et harmonie | 11/15 | Palette nuit, jaune et bleu tenue partout et images Grok très cohérentes, mais les accents des titres en capitales sont coupés sur toutes les pages et les photos d'archives 2015 sont inégales. |
| 3. Animations et effets | 13/15 | Ouverture lisible à 2,5 s, 60 i/s sans saccade, galerie horizontale épinglée, transitions sans rechargement, curseur et cartes inclinées ; l'étiquette de section du cadran est en retard d'une section. |
| 4. Expérience ludique et interactions | 8/10 | Lecteur avec ambiance générée, grille par jour au clavier, carte à calques, comparateur FM/DAB+, don et dédicace simulés : tout répond, sauf « Copier » l'adresse e-mail. |
| 5. Tous les formats | 11/15 | Aucun débordement de 360 à 1920 px, mais les puces du hero passent sous le lecteur à 1280×720, les mentions débordent à 320 px et le texte mono fait 11,8 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Données 2015, grille, météo et lecteur étiquetés « à confirmer », « démo » ou « données fictives » ; mentions légales prêtes avec les champs « à compléter » bien visibles. |
| 7. Technique et performance | 8/10 | Une erreur JS (bouton Copier), CLS au chargement ≤ 0,01, environ 1 Mo par page, version sans WebGL propre ; polices non attendues hors accueil. |
| 8. Mise en ligne | 5/5 | Public, noindex et X-Robots-Tag, robots.txt ouvert, og:image JPG 1200×630 en adresse complète, `?v=20261027` identique sur le CSS et le JS du site, 404 aux couleurs. |
| 9. Accessibilité | 4/5 | Lien d'évitement, focus visible, Échap ferme le menu, « Mode calme » et « réduire les animations » respectés ; texte à 11,8 px et bouton Calme haut de 40 px. |
| **Total** | **82/100** | |

## Points forts

- Ouverture signature : on « cherche la station » sur le cadran avant que la houle et le titre apparaissent.
- Le direct continue quand on change de page (navigation sans rechargement).
- 16 images Grok d'un même style (nuit bleue, points de lumière chaude), sans défaut visible.
- Contenu honnête : tout ce qui est d'exemple porte une étiquette jaune.
- 60 i/s sur portable et sur téléphone ; versions calme, sans WebGL et « réduire les animations » propres.

## Défauts

### Bloquants

1. **Le bouton « Copier » l'adresse e-mail plante** : accueil, section Contact, tous formats. Test : `outils/surffm-inter.mjs`, erreur `TypeError: Failed to execute 'selectNodeContents'`. Cause : `assets/js/app.js:530`, `$('[data-copy-text]', btn.parentElement)` cherche dans `span.mail-actions`, alors que l'adresse est dans le parent au-dessus (`index.html:341-342`). `txt` vaut `null` et la solution de repli plante aussi. Correction : chercher dans le conteneur commun (`btn.parentElement.parentElement` ou `btn.closest(...)`). Effort : petit.

### Importants

1. **Accents coupés sur les titres en capitales** (« GRACE A SES AUDITEURS », « NEUF EMISSIONS, UNE MEME ANTENNE », « MEME RADIO », « BON A SAVOIR », « TOUTE L'EQUIPE ») : toutes les pages, tous formats. Captures : `captures/zoom-grace.png`, `captures/accueil-p1440-14.jpg`, `captures/planche-emissions-p1440.jpg`. Cause : `assets/js/app.js:396`, SplitText `mask: 'lines'` pose `overflow: clip`, et `line-height: .9` sur `.h-xl` (`assets/css/style.css:69`) laisse dépasser les accents. Correction : `.line-mask { padding-block: .15em; margin-block: -.15em; }`, ou `s.revert()` en fin d'animation. Effort : petit.
2. **Puces du hero sous la barre du lecteur** (« 102.3 FM · SAISON / DAB+ / WEB ») : accueil, 1280×720 et 320×640, visibles seulement en défilant. Captures : `captures/accueil-p1280-00.jpg`, `captures/accueil-m320-00.jpg`. Cause : `assets/css/style.css:202`, `padding-bottom: clamp(92px, 12vh, 140px)` estime la place sans tenir compte de `--player-h` (68 px). Correction : `padding-bottom: calc(var(--player-h) + clamp(24px, 6vh, 72px))`, et mesurer la hauteur des barres en JS (`--barres-h`). Effort : petit.
3. **Débordement à 320 px sur /mentions-legales** : la page passe à 332 px et le téléphone dézoome. Aucun débordement de 360 à 430 px. Capture : `captures/planche-mentions-legales-m320.jpg`. Cause : `.tag-demo` en `inline-block` sans retour à la ligne (`assets/css/style.css:74-75`) ; l'étiquette « SACEM et SPRE, à préciser si souhaité » (`mentions-legales.html:105`) mesure 316 px dans une colonne de 288 px. Correction : `.tag-demo { max-width: 100%; white-space: normal; }`. Effort : petit.
4. **Texte de 11,8 px sur téléphone** (surtitres, lecteur, pied de page, légendes) : toutes les pages, m320 à m430. Capture : `captures/planche-accueil-m390.jpg`. Cause : `--fs-xs: .74rem` (`assets/css/style.css:26`). Correction : `--fs-xs: max(12px, .78rem)`. Effort : petit.
5. **Sur téléphone, le cadran du bas et son étiquette recouvrent le texte** : « ÉMISSIONS » posé sur « 136 contributeurs », titre « MÊME RADIO » sous la règle, et l'étiquette affiche la section précédente. Captures : `captures/accueil-m390-08.jpg`, `captures/planche-nous-capter-m390.jpg` (02). Cause : `.cadran-h` et `.ch-label` fixés au-dessus du lecteur (`assets/css/style.css:668-679`), changement de section dans `initCadran` (`assets/js/app.js:414-456`). Correction : ajouter la hauteur du cadran au `padding-bottom` du `body` et changer de section quand elle atteint le milieu de l'écran. Effort : moyen.

### Finition

1. **Joints visibles dans la police variable** Big Shoulders 800 (traits fins dans « N » et « S » des grands titres). Capture : `captures/zoom-grace.png`. Cause : contours qui se chevauchent dans `assets/fonts/big-shoulders-display.woff2`. Correction : version figée en 800 avec `fonttools varLib.instancer --remove-overlaps`. Effort : moyen.
2. **Image collante 23 px sous l'en-tête à 1000×560** : /nous-capter. Capture : `captures/epingle-nous-capter-0-1000x560-92.jpg`. Cause : `figure.reglages-media` en `position: sticky` avec un `top` fixe. Correction : `top: calc(var(--entete-h) + 16px)` et une hauteur limitée à `calc(100svh - var(--entete-h) - var(--barres-h) - 32px)`. Effort : petit.
3. **Bouton « Mode calme » haut de 40 px sur téléphone**. Cause : `.calm-toggle` (`assets/css/style.css:144-146`). Correction : `min-height: 44px`. Effort : petit.
4. **Polices non attendues hors accueil** : /emissions et /nous-capter n'ont pas d'écran d'intro qui les masque. Cause : aucun `document.fonts` dans `assets/js/app.js`. Correction : masquer l'ouverture jusqu'à `document.fonts.ready`, avec un délai maximal d'environ 1,5 s. Effort : petit.
5. **README à jour** : il parle de `?v=3` alors que les pages utilisent `?v=20261027`. Correction : corriger le README. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,0 s (complet à 2,5 s) / 2,5 s (`captures/ouverture-*-tNNNN.jpg`) |
| Fluidité p1440 / m390 | 60 i/s / 59,9 i/s (très bien, aucune image de plus de 50 ms) |
| CLS au chargement (max) | 0,0097 (/nous-capter p1440) |
| Poids de l'accueil, p1440 / m390 | 1,03 Mo / 0,79 Mo |
| Erreurs console, sans WebGL, réduire les animations | 1 erreur JS au clic sur Copier ; sans WebGL et réduire les animations : aucune erreur, contenu complet |
| Débordement horizontal | Aucun de 360 à 1920 px ; 332 px à 320 px sur /mentions-legales |
| Sections épinglées | Galerie des émissions correcte aux 8 tailles ; image collante de /nous-capter 23 px sous l'en-tête à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Tout est conforme |

## Vérifications écartées

- « Débordement » de 3 258 à 5 320 px sur ordinateur : c'est la piste de la galerie horizontale épinglée, coupée par `overflow-x: hidden` sur le `body` ; `scrollX` reste à 0.
- « Éléments invisibles » (années de la frise, liste de l'équipe, FAQ) : animations encore en cours ; tout est à l'opacité 1 après 3 s, et rien n'est invisible avec « réduire les animations ».
- « h1 » à environ 200 ms : la mesure ne voit pas l'écran de recherche de station. L'ouverture a été jugée sur les captures à étapes, à moins de 3 s.
- Erreur console sur la page 404 : c'est le statut 404 de la page elle-même, comme attendu.
- Pied de page « masqué par l'en-tête » : contenu qui défile sous l'en-tête translucide, comme prévu.
- Barre fixe du bas : c'est le lecteur du direct, cœur du site ; il reste volontairement visible partout (le son continue).
- Bibliothèques sans `?v=`, noindex et robots.txt : non pénalisés, comme le prévoient les consignes.


---

## surffm-maquette : corrections de l'étape 2

Commit 8e24776 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Bouton « Copier » qui plante | Bloquant | Recherche de `[data-copy-text]` dans `.contact-mail` (conteneur commun) | assets/js/app.js | TypeError → « Copié », presse-papiers = contact@surffm.fr (`outils/surffm-fix.mjs`) |
| Accents coupés sur les titres en capitales | Important | `s.revert()` du SplitText en fin de révélation (plus de `overflow: clip` sur les lignes) | assets/js/app.js | `.line-mask` restants sur titres révélés : 0 ; « PASSIONNÉS » entier (`preuve-epingle-1280x720.jpg`) |
| Puces du hero sous le lecteur (1280×720, 320×640) | Important | `--barres-h` mesurée en JS (lecteur + cadran du bas), `padding-bottom` du hero sur cette variable, paliers `max-height: 820px` (portable) et `max-height: 700px` (téléphone) qui réduisent titre, marges et bouée | style.css, app.js | Puces 675 → 630 px (lecteur à 652) en 1280×720, 693 → 677 (lecteur à 700) en 1366×768 ; couvert m320 → 0 (`preuve-hero-p1280.jpg`, `preuve-hero-m320.jpg`) |
| Débordement à 320 px sur /mentions-legales | Important | `.tag-demo { max-width: 100%; white-space: normal; }` | style.css | 332 → 320 px (`preuve-mentions-m320.jpg`) |
| Texte de 11,8 px sur téléphone | Important | `--fs-xs: max(12px, .74rem)` | style.css | 43 → 0 textes < 12 px par format téléphone et tablette |
| Cadran du bas et étiquette qui recouvrent le texte, étiquette en retard | Important | Bande du cadran portée à 32 px, opaque, étiquette logée dedans et comptée dans `--barres-h` ; section changée au milieu de l'écran, positions recalculées par ResizeObserver | style.css, app.js | Étiquette dans la bande et à jour (« HISTOIRE » sur la section Histoire, `preuve-cadran-m390.jpg`) |
| Bouton « Mode calme » 40 px, lien Instagram 41 px | Important (cibles 44) | `min-height: 44px` sur `.calm-toggle` et `.socials a` | style.css | 6 → 0 cibles < 44 px par format téléphone |
| Contenu du premier écran sous le lecteur (récurrent « barre ») | Important | Héros des pages intérieures et 404 à `100svh - --barres-h` ; sur téléphone, lecteur et cadran retirés quand le formulaire, le pied de page ou le menu sont à l'écran (IntersectionObserver ; le pied garde son bouton d'écoute) | style.css, app.js | Éléments couverts par le lecteur : 19 → 0 (tous formats) ; bars-off vérifié au formulaire, au pied, menu ouvert, et retiré au milieu de page à 320 et 390 px |
| Galerie épinglée calée sur des hauteurs estimées | Méthode | `padding-top: var(--entete-h)` mesurée, `padding-bottom` sur `--barres-h`, `anticipatePin` retiré, palier `max-height: 600px` | style.css, app.js | Aucun défaut aux 8 tailles, avant comme après ; cartes 269–627 px, lecteur à 652 en 1280×720 (`preuve-epingle-1280x720.jpg`, `preuve-epingle-1366x768.jpg`) |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Joints visibles dans la police variable Big Shoulders 800 | Finition | Finition (effort moyen, instance figée à produire avec fonttools) |
| Image collante de /nous-capter à 1000×560 : 23 px sous l'en-tête à 92 % | Finition | `top` passé à `--entete-h + 16px` et hauteur bornée ; le relevé restant est la fin normale du sticky (l'image remonte avec le texte en fin de section), image seule |
| Polices non attendues hors accueil | Finition | Finition |
| README qui cite `?v=3` | Finition | Finition |
| Photos d'archives 2015 inégales | Important (DA) | Donnée manquante (photos du client) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement m320 / m360 / m390 / m430 / t820 | 332 (mentions) / 0 / 0 / 0 / 0 | 0 partout |
| Débordement p1280 / p1366 / p1440 / g1920 | piste de la galerie épinglée seulement (écarté) | idem, scrollX à 0 |
| Textes < 12 px (m320, m360, m390, m430, t820) | 43 par format | 0 |
| Cibles < 44 px (m320 à t820) | 6 par format | 0 |
| Éléments couverts par le lecteur | 19 (hero, page-hero, 404, de m320 à g1920) | 0 |
| Éléments couverts par l'en-tête au pied | présents (contenu qui défile sous l'en-tête, écarté) | idem |
| Épinglage aux 8 tailles (galerie accueil) | correct | correct |
| Sticky /nous-capter 1000×560 | 23 px sous l'en-tête à 92 % | idem (fin de parcours, voir plus haut) |
| Erreurs console | 9, uniquement le statut 404 de la page 404 ; erreur Copier au clic | 9, idem ; Copier sans erreur |
| Modules chargés deux fois | aucun | aucun (tout en `?v=20261028-2`, imports compris) |

## Note proposée
Ancienne note 82/100 → nouvelle note 90/100 · bloquants restants : 0
- 2. Direction artistique 11 → 12 : accents des titres en capitales rétablis.
- 3. Animations 13 → 14 : l'étiquette du cadran n'est plus en retard d'une section.
- 4. Ludique 8 → 9 : le bouton Copier fonctionne.
- 5. Formats 11 → 14 : puces du hero au-dessus du lecteur, mentions sans débordement à 320 px, texte à 12 px (jamais 15/15).
- 7. Technique 8 → 9 : plus d'erreur JS (polices hors accueil restent).
- 9. Accessibilité 4 → 5 : texte à 12 px et bouton Calme à 44 px.
Verdict : « Prête à envoyer ».
