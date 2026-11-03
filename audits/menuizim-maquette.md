# menuizim-maquette

<https://menuizim-maquette.vercel.app> · audit du 2026-10-28 · dernier commit 64c1550 du 2026-10-27

## Verdict

**84/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Maquette très aboutie : univers « cernes du bois / relevé topographique » original et juste pour un menuisier, 60 i/s, aucune erreur, tout fonctionne. Il reste surtout de la finition téléphone (textes de 8 à 11 px, liens de 30 px de haut) et un lien sorti de l'écran à 1000×560.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture marquante (coupe de chêne qui se résout en courbes de niveau, titre en trois verbes), originale et liée au métier, mais l'accueil reste sage après le hero. |
| 2. Direction artistique et harmonie | 12/15 | Palette lin/graphite/orangé et duo Fraunces + JetBrains Mono très cohérents ; les photos réelles (smartphone, lumières variées) cohabitent moins bien avec les images d'ambiance chaudes et feutrées. |
| 3. Animations et effets | 13/15 | 60 i/s sans saccade, actes en défilement horizontal épinglés propres, compteurs, curseur à coordonnées, boutons magnétiques, mode calme ; ouverture lisible vers 2 s. |
| 4. Expérience ludique et interactions | 9/10 | Matériauthèque à retourner, filtres pièce + matériau avec ancre `#m-…`, formulaire en 6 étapes validé avec récapitulatif, visionneuse au clavier, boutons copier : tout fonctionne. |
| 5. Tous les formats | 11/15 | Aucun débordement (4 pages + 24 fiches, 320 à 1920), mais textes de 8,3 à 11,5 px et liens de 30 px de haut sur téléphone, lien « Décrire mon projet » hors écran à 1000×560. |
| 6. Contenu et fiabilité | 9/10 | Pas d'avis inventé (absence assumée), « à compléter » bien balisés (mentions légales, horaires, portrait, dimensions), images d'ambiance légendées comme telles. |
| 7. Technique et performance | 9/10 | 0 erreur, CLS 0, 2,4 Mo sur l'accueil, polices préchargées, 38 liens internes OK ; sans WebGL le repli SVG s'affiche (seul le message OGL reste en console). |
| 8. Mise en ligne | 5/5 | noindex partout, X-Robots-Tag, robots.txt correct, og:image JPG 1200×630 absolue, `?v=20261027` identique, 404 aux couleurs. |
| 9. Accessibilité | 4/5 | Focus visible, lien d'évitement, réduire les animations respecté et bascule dédiée ; petites cibles et micro-textes gris pénalisent la lecture sur téléphone. |
| **Total** | **84/100** | |

## Points forts

- Concept graphique propre au client : cernes de chêne, courbes de niveau, repère GPS de l'atelier, cotes « Latté chêne / Huile Rubio » autour des photos, comme sur un plan d'atelier.
- Fiches réalisations (24) très soignées : cotes, tableau technique, bande de photos, visionneuse clavier, « réalisation suivante ».
- Honnêteté du contenu : « Aucun avis publié sur le site actuel », « Démonstration : aucune donnée transmise », légendes « Image d'ambiance ».
- Performance exemplaire : 60 i/s sur portable et téléphone, CLS 0, ouverture courte.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Textes de moins de 12 px sur téléphone** : toutes les pages, m320 à m430, `captures/planche-accueil-m390.jpg`. Sous-titre de la marque 8,3–9,6 px, repère « Atelier · Marlenheim » 9,9 px, légendes `.illus` 10,6 px, `.carte__plus` 10,2 px, bouton « Copier » 10,6 px, puces de filtre 11,2 px, titres du pied 11,2 px. Cause : `assets/css/main.css:206` (`.marque__nom small` 0.52rem), `:171` (0.6rem), `:124` (`.illus` 0.66rem), `:268` (`.repere` 0.62rem), `:379` (`.carte__plus` 0.64rem), `:153` (`.copier` 0.66rem), `:571` (`.puce` 0.7rem), `:530` (`.pied__titre` 0.7rem). Correction : dans `@media (max-width: 900px)`, plancher à `0.75rem` (12 px) pour ces classes mono, en réduisant au besoin le `letter-spacing`. Effort : petit.
2. **Zones tactiles de moins de 44 px sur téléphone** : accueil, projet, réalisations, m320 à m430. Liens `.lien` 30 px (« Décrire mon projet », « Voir les réalisations », « Voir les 3 réalisations », « marlebois.fr »), marque 38 px, burger 42 px à 320–360, numéro de téléphone `.val` 28 px sur /projet, `select#filtre-mat` 41 px. Cause : `assets/css/main.css:147-150` (`.lien` `padding-block: 5px`), `:153` (`.copier` `min-height: 28px`), burger et marque dans le bloc `@media (max-width: 374px)` `:202-207`. Correction : `@media (pointer: coarse) { .lien, .copier, .val, .filtres select { min-height: 44px; display: inline-flex; align-items: center; } .burger { width: 44px; height: 44px; } .marque { min-height: 44px; } }`. Effort : petit.
3. **Lien « Décrire mon projet » hors de l'écran à 1000×560** : accueil, bloc « Un seul interlocuteur » épinglé, `captures/epingle-accueil-1-1000x560-8.jpg` (sort de 24 px). Cause : `assets/css/main.css:304` (`.approche__texte { position: sticky; top: calc(var(--head-h) + 40px) }`) sans limite de hauteur, avec un texte d'accroche très grand. Correction : n'épingler qu'au-delà d'une hauteur suffisante, `@media (max-height: 640px) { .approche__texte { position: relative; top: 0; } }`, ou réduire la taille de l'accroche avec `clamp()` en fonction de `vh`. Effort : petit.

### Finition

1. **Barre de filtres qui reste collée sur l'appel final et le pied de page** : /realisations, m390 et p1440, `captures/realisations-m390-fin.jpg`, `captures/planche-realisations-p1440.jpg` (10 à zz). Cause : `assets/css/main.css:557`, `.filtres` est enfant direct de `<main>` (`realisations.html:79`), donc épinglée jusqu'à la fin de `main`. Correction : envelopper `.filtres` et la grille (`realisations.html:79-310`) dans un même `<div>` pour que l'épinglage s'arrête à la dernière carte. Effort : petit.
2. **Courbes de niveau du hero qui passent sur des textes** : accueil p1440, `captures/accueil-p1440-00.jpg`. Les traits épais croisent le numéro de téléphone de l'en-tête et la légende « Cuisine et îlot sur mesure · Conception Riegel Baur architectes ». Cause : canvas OGL de `assets/js/contours.js:147` sous un en-tête transparent en haut de page et une légende sans fond. Correction : fond `var(--lin)` à 85 % derrière la légende (comme `.repere span`, `main.css:275`) et fond léger sur `.site-head` dès le chargement. Effort : petit.
3. **Images d'ambiance un peu à part** : `assets/img/amb/mains-scie-1200.webp` (scie plongeante posée dans un intérieur décoré, vase et fleurs séchées : peu crédible pour un atelier) et `copeaux-1200.webp` (copeaux verdâtres, on dirait des feuilles séchées). Pas de défaut anatomique ; à régénérer seulement si le temps le permet. Effort : petit.
4. **Message console sans WebGL** : « unable to create webgl context » journalisé par OGL avant le repli SVG (`assets/js/contours.js:147`). Correction : tester `document.createElement('canvas').getContext('webgl2')` avant `new Renderer(...)` et appeler `repli(box)` directement. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2 s / 1,5–2 s (bandes d'ouverture ; h1 376 ms et 256 ms) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0 |
| Poids de l'accueil, p1440 / m390 | 2,40 Mo / 1,49 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 ; repli SVG correct (1 message OGL) ; respecté (classe `calme`) |
| Débordement horizontal | Aucun (4 pages × 9 formats, 24 fiches à 360, 390 et 1366) |
| Sections épinglées | 4 ; seul défaut : lien hors écran à 1000×560 (bloc « approche ») |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public, oui, oui, sans Disallow, JPG 1200×630 absolue, 20261027 partout, 404 personnalisée |

## Vérifications écartées

- Erreur « Failed to load resource 404 » sur la page introuvable : c'est le statut HTTP voulu de la page 404 elle-même.
- « unable to create webgl context » en variante sans WebGL : le repli SVG s'affiche correctement (`captures/accueil-p1440-sanswebgl-00.jpg`), classé en finition.
- Petit réticule orange avec coordonnées « E 0100 · N 0200 » sur les captures : c'est le curseur personnalisé à la position de la souris Playwright, pas un élément parasite.
- Chiffres brouillés (« 20?0 », « 1000 ») sur certaines captures : compteurs à rouleaux en cours d'animation, valeurs finales correctes (2016, 2021) sur les captures suivantes.
- `mat__fermer` 44×44 signalé « < 44 px » : il fait exactement 44 px, conforme.
- Inventaire : les 24 fiches `/realisations/<slug>` absentes de la liste « Pages » ont été vérifiées (HTTP 200, aucun débordement, aucune erreur, `captures/fiche-*.jpg`).
- Barre « bas » de 70 px relevée sur /realisations p1280 : non reproduite sur les autres formats ni visible sur les captures.


---

## menuizim-maquette : corrections de l'étape 2

Commit deeb75a (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Textes de moins de 12 px sur téléphone (marque, repère, `.illus`, `.carte__plus`, `.copier`, puces, titres du pied, `.todo`, `.bascule`, libellés du formulaire) | Important | Bloc `@media (max-width: 900px)` : `font-size: max(12px, 0.75rem)` sur toutes les annotations mono (et `sup` des puces), interlettrage du sous-titre de marque réduit | `assets/css/main.css` | 185 → 20 textes < 12 px (restent seulement des libellés SVG mis à l'échelle) |
| Zones tactiles de moins de 44 px (`.lien` 30 px, marque 38 px, burger 42 px à 320–360, `.val` 28 px, `select#filtre-mat` 41 px, liens du pied 43 px, `creastra.fr` 16 px) | Important | `@media (pointer: coarse)` : `.lien` padding 12 px compensé par marge négative (soulignement gardé sous le texte), `a.val` et `.copier`, select, marque à 44 px, liens du pied `min-height: 44px`, lien d'équipe étendu par padding/marge négative ; burger 44 px dans le palier 374 px | `assets/css/main.css` | 94 → 4 relevés (seul `mat__fermer` 44×44, faux positif déjà écarté) |
| Lien « Décrire mon projet » hors écran à 1000×560 (bloc approche épinglé) | Important | `@media (max-height: 640px)` : `.approche__texte` en `position: relative` | `assets/css/main.css` | sort de 24 px → visible (437–467 / 560), épinglage : 2 défauts → 0 |
| Versions | — | `v=20261028` → `v=20261028-2` dans tout le dépôt | 29 fichiers | 0 référence restante à l'ancienne version |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Barre de filtres collée sur l'appel final et le pied (/realisations) | Finition | finition |
| Courbes du hero sur le téléphone de l'en-tête et la légende (p1440) | Finition | finition |
| Images d'ambiance `mains-scie` et `copeaux` peu crédibles | Finition | finition (image à régénérer par l'utilisateur) |
| Message « unable to create webgl context » sans WebGL | Finition | finition |
| Libellés SVG des schémas (cartes, bornes, cotes) à 11 unités, mis à l'échelle | Non cité au rapport | finition (dessin à l'échelle du viewBox) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats × 4 pages) | 0 | 0 |
| Textes < 12 px (relevés cumulés) | 185 | 20 (SVG uniquement) |
| Cibles < 44 px (relevés cumulés) | 94 | 4 (`mat__fermer` 44×44, faux positif) |
| Éléments couverts | 1 (404 p1280, page défilée en bas sous l'en-tête réaffiché) | 2 (même cas, 404 p1280 et m320, défilement normal sous l'en-tête fixe, pas de barre du bas) |
| Épinglage aux 8 tailles | 81 mesures, 2 défauts (approche 1000×560) | 75 mesures (approche non épinglée sous 640 px de haut), 0 défaut |
| Erreurs console | 0 (hors 404 voulue) | 0 (hors 404 voulue) |
| Doublons de modules | 0 | 0 (toutes les pages en 20261028-2) |
| Interactions (burger 320, filtre matériau, copier, lien approche) | OK | OK, 0 erreur de page |

## Note proposée
Ancienne note 84/100 → nouvelle note 88/100 (critère 5 : 11 → 14, les trois défauts cités, textes, liens de 30 px et lien hors écran à 1000×560, sont corrigés ; critère 9 : 4 → 5, petites cibles et micro-textes corrigés) · bloquants restants : 0
