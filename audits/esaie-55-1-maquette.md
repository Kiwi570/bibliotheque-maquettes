# esaie-55-1-maquette

<https://esaie-55-1-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 013b49c du 23/10/2026

## Verdict

**81/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Maquette solide et cohérente : effet d'eau WebGL signature, direction « nuit, or et écume » tenue sur toutes les pages, interactions (don, parrainage en 4 étapes, filtres) qui marchent toutes. Une image Grok (`axe-numerique`, troisième main) est à régénérer, et la mise en ligne reste à régler (X-Robots-Tag, Cache-Control, `?v=`).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture forte (ondes d'eau WebGL qui réagissent à la souris sur « Vous tous qui avez soif »), concept biblique bien porté, mais les sections intérieures restent assez classiques. |
| 2. Direction artistique et harmonie | 11/15 | Palette nuit/or/écume, Fraunces + Manrope, arches récurrentes et images Grok d'une lumière homogène, mais une image à trois mains (`axe-numerique`) et un corps de texte un peu petit et pâle sur grand écran. |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, galerie horizontale épinglée, cartes empilées, titre lisible à 1,5 s (portable) / 2 s (téléphone) ; pas de transitions de page, peu de micro-interactions au-delà des boutons magnétiques. |
| 4. Expérience ludique et interactions | 9/10 | Don simulé avec résumé en direct et modale, assistant de parrainage en 4 étapes, filtres et accordéons des projets, horloges Ottawa/Libreville : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 13/15 | Aucun débordement à aucun format, en-tête tenu à 320 px ; légende sortie de l'écran à 1000×560 et quelques cibles tactiles sous 44 px. |
| 6. Contenu et fiabilité | 9/10 | Contenus repris du site actuel (histoires, équipe, montants, Mobile Money, 48 h), « à compléter » bien balisés ; accord des personnes des récits encore à confirmer, bien signalé. |
| 7. Technique et performance | 9/10 | 0 erreur JS, CLS 0, 1,1 Mo à l'accueil en p1440, repli sans WebGL propre, polices préchargées. |
| 8. Mise en ligne | 2/5 | Public, noindex dans chaque page, og:image 1200×630 absolue et 404 aux couleurs ; mais X-Robots-Tag absent, Cache-Control dans vercel.json et aucun `?v=` sur le CSS/JS. |
| 9. Accessibilité | 4/5 | Focus visible (contour or 2 px), Mode calme fonctionnel et repris dans le menu mobile, réduire les animations respecté ; cibles tactiles et petits gris clairs perfectibles. |
| **Total** | **81/100** | |

## Points forts

- Ouverture signature : ondes d'eau WebGL sur la photo sous-marine, en accord parfait avec « Venez aux eaux », avec repli image fixe en Mode calme et sans WebGL.
- Série d'images Grok très homogène (bleu nuit, lumière dorée rasante), aucune personne reconnaissable, légendes « Image d'illustration » partout.
- Parcours de don et de parrainage complets et crédibles, sans rien envoyer, avec renvoi vers le vrai formulaire de l'association.
- Contenu fidèle au site actuel et provisoires clairement marqués (code postal, ARC, objectifs financiers, photo de la présidente).
- Pied de page « Venez aux eaux » avec reflet, cohérent sur les 4 pages, y compris la 404.

## Défauts

### Bloquants

1. **Image Grok `axe-numerique` : troisième main** : accueil (galerie des axes, carte « Inclusion numérique et parentalité ») et /projets (cartes de l'axe numérique), tous formats, `captures/planche-accueil-p1440.jpg` (05–07) et `captures/planche-projets-m390.jpg` (10). Une main sort de l'écran du portable pendant que deux mains tapent au clavier. Cause : `assets/img/axe-numerique-480/640/784.webp`. Correction : régénérer l'image avec la consigne Grok de `notes.json` (une seule personne, deux mains sur le clavier, écran sans main), puis réexporter en 480/640/784 px WebP aux mêmes noms. Effort : petit.

### Importants

1. **En-tête X-Robots-Tag absent et règle Cache-Control** : toutes les pages. Cause : `vercel.json:4-10` (pas de X-Robots-Tag) et `vercel.json:13-16` (Cache-Control sur `/assets/(.*)`). Correction : ajouter `{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }` au bloc `/(.*)` et supprimer le bloc `/assets/(.*)`. Effort : petit.
2. **Aucun `?v=` sur le CSS et le JS du site** : 4 pages. Cause : `index.html:27`, `parrainage.html:26`, `projets.html`, `404.html:11` et les `<script src="assets/js/…">` (main, data, eau, accueil, parrainage, projets). Correction : ajouter le même `?v=20261027` à `main.css` et aux 6 scripts propres au site dans toutes les pages (pas aux `vendor/`). Effort : petit.

### Finition

1. **Légende du visuel « Pourquoi parrainer ? » hors écran à 1000×560** : /parrainage, 1000×560, `captures/epingle-parrainage-0-1000x560-8.jpg`. Cause : `assets/css/main.css:530-531` (`position: sticky; top: 104px` + cadre en `aspect-ratio: 4 / 5` sans plafond de hauteur). Correction : `.pourquoi__cadre { max-height: calc(100svh - 104px - 48px); }` (ou palier `@media (max-height: 600px)` qui réduit la largeur du cadre). Effort : petit.
2. **Cibles tactiles sous 44 px sur téléphone** : toutes les pages, m320 à m430. Cause : `assets/css/main.css:146` (`.entete__marque` 34 px de haut), `:227` (`.ouverture__defiler` 21 px de large), `:99` (`.lien` du pied de page et des coordonnées, 23–26 px). Correction : `min-height: 44px; display: inline-flex; align-items: center` sur ces liens, `min-width: 44px` sur l'indicateur de défilement. Effort : petit.
3. **Barre mobile réduite au seul « Faire un don »** : téléphone. Pas de contact rapide. Correction : ajouter un bouton courriel ou téléphone à côté de « Faire un don » dans la pastille flottante, masquée elle aussi sur le formulaire et le pied de page. Effort : petit.
4. **Corps de texte petit et pâle sur grand écran** : accueil p1440/g1920 (paragraphes des axes, des engagements, du pied de page). Correction : passer `--t-s` à `clamp(.9375rem, .85rem + .25vw, 1.0625rem)` et éclaircir le gris des paragraphes sur fond nuit. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1,5 s / 2,0 s |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0 (0,0008 sur la 404 en réduit) |
| Poids de l'accueil, p1440 / m390 | 1,09 Mo / 0,84 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur JS (seul le 404 attendu de la page introuvable) ; sans WebGL et réduit : image fixe, aucune erreur |
| Débordement horizontal | aucun, à tous les formats |
| Sections épinglées | galerie des axes et histoires : OK ; « Pourquoi parrainer ? » : légende 18 px hors écran à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex sur chaque page · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue · ?v= absent · 404 personnalisée ; Cache-Control dans vercel.json |

## Vérifications écartées

- Erreur console « Failed to load resource 404 » sur /zz-page-introuvable-audit : c'est le statut 404 attendu de la page introuvable, pas une ressource manquante.
- `ERR_NETWORK_CHANGED` sur /projets (variantes) : incident réseau du poste de mesure, absent des autres passages.
- Arche vide sur `captures/accueil-m390-01.jpg` : révélation de l'image en cours ; remesuré après 2,5 s, l'image `accueil-mains-eau` est chargée et opaque (`captures/esaie-int-arche-m390.jpg`).
- « otre mission » coupé sur `captures/planche-accueil-g1920.jpg` (04) : titre qui glisse avec la galerie horizontale épinglée, comportement voulu.
- Heures h1 à 452–519 ms (m320, m390, p1366) : mesures en parallèle ; l'ouverture réelle se juge sur les étapes (1,5 s / 2 s).
- Canvas toujours affiché en Mode calme : il montre une image fixe, l'effet d'eau est bien coupé (`captures/esaie-int-calme-p1440.jpg`).


---

## esaie-55-1-maquette : corrections de l'étape 2

Commit ce10915 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| X-Robots-Tag absent, Cache-Control dans vercel.json | Important | Déjà corrigé à l'étape 1 (vérifié : `noindex, nofollow`, plus de bloc `/assets`) | vercel.json | statique : X-Robots null → `noindex, nofollow` ; Cache-Control vercel.json true → false |
| Aucun `?v=` | Important | Déjà corrigé à l'étape 1 ; passé à `?v=20261028-2` partout | 4 pages HTML | 7 fichiers, une seule version `20261028-2` sur toutes les pages ; grep `v=20261028[^-]` vide |
| Légende « Pourquoi parrainer ? » hors écran à 1000×560 | Finition (format) | Visuel collant en colonne flex, `top` et `max-height` calés sur `--entete-h` mesuré en JS (ResizeObserver), cadre `min-height: 0` qui se réduit | main.css, main.js | légende 18 px hors écran → 0 ; figure 104–536 px sur 560 (`preuve-pourquoi-1000x560-avant/apres.jpg`) |
| Cibles tactiles sous 44 px (marque, indicateur de défilement, liens du pied et des coordonnées) | Finition (récurrent) | `min-height: 44px` sur la marque, `min-width: 44px` sur l'indicateur, liens du pied et des coordonnées en `inline-flex` 44 px sous 900 px | main.css | 3 à 5 cibles par page (m320–t820) → 0 (`preuve-pied-m390-apres.jpg`) |
| Corps de texte petit et pâle sur grand écran | Finition (récurrent) | `--t-s` en `clamp(.9375rem, .85rem + .25vw, 1.0625rem)`, détail des axes en `--lagune-pale` | main.css | 16,4 px → 18,5 px à 1920 ; 15 px conservé sur téléphone |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Image `axe-numerique` : troisième main | Bloquant | Image Grok (à régénérer par l'utilisateur, consigne dans notes.json) |
| Barre mobile réduite au seul « Faire un don » | Finition | Finition ; la barre existante est déjà conforme (après le héros, masquée sur don, contact, formules, pied, menu et 404, 0 élément couvert) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920, 4 pages) | 0 | 0 |
| Textes < 12 px | 0 | 0 |
| Cibles < 44 px (m320, m360, m390, m430, t820) | 5 accueil, 4 parrainage, 4 projets, 3 404 par format | 0 partout |
| Éléments couverts | 0 | 0 |
| Épinglage aux 8 tailles (+2560) | 2 défauts (/parrainage 1000×560 : légende 18 px, image 4 px) | 0 sur 108 mesures |
| Erreurs console | seul le 404 attendu de la page introuvable | idem, aucune nouvelle |
| Doublons de modules | 0 | 0 (une seule version par fichier) |

Interactions vérifiées (m390) : menu mobile ouvert et fermé, bouton « Faire un don » visible après le héros et masqué au pied, `--entete-h` = 72 px, 0 erreur.

## Note proposée
Ancienne note 81/100 → nouvelle note 87/100
- c2 11 → 12 : corps de texte petit et pâle sur grand écran corrigé.
- c5 13 → 14 : légende à 1000×560 et cibles 44 px corrigées (plafonné à 14).
- c8 2 → 5 : X-Robots-Tag, Cache-Control et `?v=` corrigés à l'étape 1.
- c9 4 → 5 : cibles tactiles à 44 px.

Bloquants restants : 1 (image Grok axe-numerique) · verdict : À peaufiner


## Images Grok définitives (29/10)

Commit f6b447e (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| `axe-numerique-{480,640,784}.webp` | Image à trois mains | 4:5 recadré de y=90 à 1070 sur la source 784×1168, mains et écran entiers ; 784×980, 640×800, 480×600 (pas d'agrandissement) | « Deux mains tapent sur le clavier d’un ordinateur portable allumé, posé sur une table en bois » (index.html, projets.html) | 1440×900, 1920×1080, 1366×768, 1000×560, 390×844 : image chargée et nette, 0 erreur console, 0 réponse 404, CLS au chargement 0 ; les décalages au défilement viennent uniquement des sections épinglées (`.axes`, identiques à avant) |

Note : 87/100 → 88/100 (c2 +1 : image à trois mains remplacée) · bloquants : 1 → 0 · Prête à envoyer
