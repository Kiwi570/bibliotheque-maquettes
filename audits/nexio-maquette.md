# nexio-maquette

<https://nexio-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 603398f du 26/10/2026

## Verdict

**80/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Une maquette solide et cohérente : l'écran fissuré en 3D qu'on « soude » au curseur donne une vraie signature au métier, et toutes les interactions fonctionnent. Restent la mise en ligne (pas de X-Robots-Tag, pas de `?v=`), des libellés à 11,5 px sur téléphone, l'absence de barre d'action en bas sur téléphone et un indicateur du hero coupé à 1000×560.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Le téléphone 3D fissuré qui se répare au survol (compteur « Écran réparé » de 0 à 100 %) est original et colle au métier, mais le reste de la page suit un rythme plus classique de cartes et de sections. |
| 2. Direction artistique et harmonie | 12/15 | La palette nuit et cyan, le duo Unbounded et Inter Tight et les images sombres sont cohérents d'une page à l'autre. Les nombreuses pastilles « à compléter » alourdissent l'ensemble, et les mains changent de carnation d'une image du parcours à l'autre. |
| 3. Animations et effets | 12/15 | Ouverture lisible dès 1 s, 60 i/s sans saccade, parcours épinglé avec un câble qui se dessine, jauge de batterie et SplitText. L'effet signature existe aussi au doigt sur téléphone, mais on ne trouve ni transition de page ni curseur personnalisé. |
| 4. Expérience ludique et interactions | 8/10 | Tout fonctionne : réparation au survol, estimation rapide, radiographie 3D qu'on fait tourner, ticket d'estimation prérempli par l'URL, rendez-vous en 4 étapes avec contrôles et récapitulatif, menu mobile avec Échap, bouton Animations. Le calculateur reste vide tant qu'il n'y a pas de tarifs. |
| 5. Tous les formats | 12/15 | Aucun débordement, l'en-tête tient à 320 px. En revanche, les libellés font 11,5 px sur téléphone, il n'y a pas de barre d'action en bas sur téléphone et l'indicateur « Écran réparé » passe sous l'en-tête à 1000×560. |
| 6. Contenu et fiabilité | 8/10 | Rien d'inventé : « +100 clients satisfaits » est repris du site actuel (`data.js:10`), les avis sont explicitement vides et les « à compléter » sont bien marqués. Les mentions légales sont un modèle à remplir. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, CLS ≤ 0,035, 1 Mo pour l'accueil, version sans WebGL propre. Le `srcset` déclare `1600w` pour des images qui font en réalité 1168 px de large. |
| 8. Mise en ligne | 3/5 | Site public, noindex sur chaque page, og:image JPG 1200×630 avec adresse complète, 404 aux couleurs du client. Mais `vercel.json` n'a pas d'en-tête X-Robots-Tag et aucun CSS ni JS du site n'a de `?v=`. |
| 9. Accessibilité | 4/5 | Focus visible, bouton Animations dans l'en-tête et le menu mobile, réduire les animations respecté, textes alternatifs, erreurs de formulaire en `role="alert"`. Seuls les libellés sous 12 px font défaut. |
| **Total** | **80/100** | |

## Points forts

- Effet signature juste pour un réparateur : l'écran fissuré en three.js se ressoude sous le curseur ou le doigt, avec un compteur en pourcentage (`captures/nexio-hero-survol-p1440.jpg`).
- Parcours « De l'écran cassé au téléphone comme neuf » épinglé en défilement horizontal, avec un câble lumineux et une jauge de charge.
- Formulaire de rendez-vous complet et honnête : créneaux marqués « démonstration », récapitulatif, message final « prête à être envoyée » (`captures/nexio-rdv-fin-m390.jpg`).
- Toutes les données de l'entreprise sont dans un seul fichier (`assets/js/data.js`) : une valeur `null` s'affiche « à compléter ».
- Images cohérentes entre elles (atelier de nuit, cyan et ambre), sans défaut visible.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Libellés de moins de 12 px sur téléphone** : toutes les pages, m320 à m430 (surtitres, `.fact span`, légendes de champs, `legend`, titres du pied de page à 11,52 px). Cause : `assets/css/site.css:37`, `--fs-label: 0.72rem`, utilisé aux lignes 87, 247, 371, 455 et 476. Correction : `--fs-label: max(12px, 0.75rem)`. Effort : petit.
2. **Pas de barre d'action en bas sur téléphone** : toutes les pages, m390 (`captures/planche-accueil-m390.jpg`). Le bouton « Prendre RDV » de l'en-tête est la seule action fixe, et le téléphone (même « à compléter ») n'est pas accessible rapidement. Cause : composant absent (`index.html`, en-tête l. 30-37). Correction : ajouter une barre fixe en bas sous 700 px avec « Prendre RDV » et « Appeler », masquée par IntersectionObserver sur `#rdv`, `.quick` et le pied de page. Effort : moyen.
3. **En-tête X-Robots-Tag absent** : `vercel.json` ne contient que `cleanUrls` et `trailingSlash`. Correction : ajouter un bloc `headers` sur `/(.*)` avec `X-Robots-Tag: noindex, nofollow`. Effort : petit.
4. **CSS et JS sans `?v=`** : `index.html:22` et `319`, ainsi que `estimation.html:22` et `159` (mêmes lignes sur `rendez-vous.html` et `mentions-legales.html`). Correction : `site.css?v=4`, `home.js?v=4`, etc., avec le même numéro partout. Comme les modules ES importent `main.js`, `data.js` et `slots.js`, versionner aussi ces imports ou passer par une import map. Effort : petit.

### Finition

1. **Indicateur « Écran réparé » coupé à 1000×560** : accueil (`captures/epingle-accueil-0-1000x560-50.jpg`), où le libellé passe sous l'en-tête. Cause : `assets/css/site.css:215`, `top: 12%` sur un hero de 560 px. Correction : `top: calc(var(--entete-h, 74px) + 1rem)`. Effort : petit.
2. **`srcset` faux** : `assets/js/slots.js:47` et `56` déclarent `1600w`, alors que les fichiers `-1600.webp` font 1168 px de large (ou 784 px pour les portraits). Correction : renommer en `-1168` et déclarer la largeur réelle, ou générer de vrais 1600 px. Effort : petit.
3. **Carnation des mains variable** dans le parcours (`accueil-parcours-estimation`, `-rendez-vous`, `-reparation`, `-recuperation`) : ce n'est jamais la même personne. Aucun défaut visible, mais la série est moins cohérente. Effort : moyen (régénération facultative).
4. **Ticket d'estimation vide** : sans grille tarifaire, le calculateur aboutit partout à « Total estimé : à compléter ». C'est attendu, mais le parcours perd son intérêt en démo. Correction : obtenir 2 ou 3 prix réels auprès de NEXIO pour `TARIFS` (`assets/js/data.js`). Effort : petit (côté client).
5. **Bouton « Copier » sans retour quand la valeur est vide** : accueil, Infos pratiques. Correction : désactiver le bouton tant que la donnée est `null`. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1 s / 1 s (h1 à 0,27 s / 0,18 s, titre net sur l'étape 1 s de la bande) |
| Fluidité p1440 / m390 | 59,9 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,035 (accueil g1920) |
| Poids de l'accueil, p1440 / m390 | 0,99 Mo / 0,98 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 attendu sur la page introuvable) ; sans WebGL propre ; réduire respecté |
| Débordement horizontal | Aucun, à tous les formats |
| Sections épinglées | Hero et parcours (accueil), visuel collant (estimation) : contenu dans l'écran ; seul « Écran réparé » est coupé à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui, oui, **absent**, absent (non pénalisé), JPG 1200×630 absolu, **absent**, personnalisée |

## Vérifications écartées

- « INVISIBLES » `.hero__hint > span.hint-txt` (p1280, p1366, p1440, g1920) : l'aide est bien visible sur `captures/accueil-p1440-00.jpg`. Elle apparaît à 2,05 s dans la timeline (`home.js:89`) et s'efface volontairement au défilement.
- « MASQUÉ » sous l'en-tête (pied de page, CTA, mentions) : ce sont des éléments qui défilent normalement sous l'en-tête fixe pendant le défilement, pas du contenu bloqué.
- Cibles < 44 px `a.brand` : `site.css:596` ajoute un `::after` de −12 px sur les écrans tactiles, ce qui donne 44 px de haut. `a.card__link` : son `::before` couvre toute la carte (`site.css:273`), donc toute la carte est cliquable.
- LCP de 28,9 s (estimation m390) et 10,8 s (estimation p1366) : mesures prises pendant que 5 maquettes tournaient en parallèle ; h1 à 0,4 s et 0,18 s. Ce n'est pas reproduit sur les autres formats (0,26 à 1 s).
- « h1 null » à t820 sur l'accueil : mesure perdue pendant la charge parallèle, alors que la capture `accueil-t820-00.jpg` montre le titre.
- Erreur « 404 » en console sur `/zz-page-introuvable-audit` : c'est le statut attendu de la page 404.
- « +100 clients satisfaits » : le chiffre est repris du site actuel selon `data.js:10`, ce n'est pas une invention.
- Décrets n° 2021-1944 et 2021-1945 (pièces issues de l'économie circulaire) : ces textes existent bien.


---

## nexio-maquette : corrections de l'étape 2

Commit 84a8d8b (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Libellés à 11,5 px sur téléphone (surtitres, `.fact span`, `legend`, labels, pied) | Important | `--fs-label: max(12px, 0.75rem)` ; pastilles `.todo` en `max(12px, .82em)` ; `.day small` en `max(12px, .7rem)` | `assets/css/site.css` | 15 à 18 sélecteurs < 12 px par format (m320 à t820) → 0 |
| Libellés du schéma radiographie (`g > text`, 10 px, 9,6 px rendus à 320) | Important (même défaut) | Sous 900 px : 12,5 px, casse normale pour tenir dans la largeur | `assets/css/site.css` | 10 px → 12,5 px ; aucun débordement à 320 (`preuve-apres-libelles-schema-m320.jpg`) |
| Pas de barre d'action en bas sur téléphone | Important | Barre « Estimer » + « Prendre RDV » sous 700 px (actions déjà présentes) ; « Appeler » n'apparaît que si `NEXIO.telephone` est renseigné (aujourd'hui `null`, aucun numéro inventé). Visible après le héros, masquée sur les formulaires, le pied de page, le menu ouvert, la page rendez-vous et la 404. `--barres-h` mesurée (ResizeObserver) et réservée en bas du pied | `assets/js/main.js`, `assets/css/site.css` | Absente → présente ; 0 élément couvert par la barre de m320 à m430 ; menu ouvert : barre masquée (`preuve-apres-barre-bas-m390.jpg`, `preuve-apres-pied-sans-barre-m390.jpg`) |
| Indicateur « Écran réparé » sous l'en-tête à 1000×560 | Finition (récurrent petit portable) | `top: calc(var(--entete-h, 74px) + 1rem)`, `--entete-h` mesurée en JS (ResizeObserver) | `assets/css/site.css`, `assets/js/main.js` | Coupé → sous l'en-tête, lisible (`preuve-avant-…` / `preuve-apres-indicateur-1000x560.jpg`) |
| X-Robots-Tag absent, CSS et JS sans `?v=` | Important | Déjà corrigé à l'étape 1 (vérifié) ; versions passées à `?v=20261028-2` partout, imports de modules compris | tous les HTML et JS du site | `grep "v=20261028[^-]"` vide ; un seul `main.js?v=20261028-2` chargé par page |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| `srcset` déclarant 1600w pour des images de 1168 px | Finition | Finition (non traitée à cette étape) |
| Carnation des mains variable dans le parcours | Finition | Image (régénération facultative, hors périmètre) |
| Ticket d'estimation vide sans tarifs | Finition | Donnée manquante (grille `TARIFS` à obtenir de NEXIO) |
| Bouton « Copier » sans retour quand la valeur est vide | Finition | Finition ; `fillFacts` le désactive déjà quand la donnée est `null` |
| Bouton « Appeler » dans la barre du bas | — | Donnée manquante : s'affichera seul quand `telephone` sera renseigné dans `data.js` |
| Surtitre du hero qui passe sous l'en-tête à 1000×560, à 92 % de l'épinglage | Finition | Il est en train de s'effacer (animation de sortie) ; format non courant, inchangé |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px | m320 15, m360/m390/m430/t820 18 sélecteurs | 0 partout |
| Cibles < 44 px | `a.brand` et `a.card__link` (faux positifs écartés par le rapport : `::after` tactile et `::before` pleine carte) | identiques |
| Éléments couverts par la barre du bas | pas de barre | 0 (m320 à m430) |
| Couverts par l'en-tête | éléments qui défilent sous l'en-tête fixe | identiques |
| Épinglage aux 8 tailles (hors images et canvas de fond) | hero 1000×560 : indicateur sous l'en-tête (capture), surtitre à 92 % | indicateur dégagé ; surtitre à 92 % inchangé (sortie animée) ; 1280×720 et 1366×768 propres |
| Erreurs console | 0 (hors 404 attendu) | 0 (hors 404 attendu) |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 80/100 → nouvelle note 85/100 · bloquants restants : 0
- Critère 5 (formats) 12 → 14 : libellés à 12 px et barre du bas corrigés, indicateur à 1000×560 dégagé ; pas de 15/15.
- Critère 8 (mise en ligne) 3 → 5 : X-Robots-Tag et `?v=` corrigés à l'étape 1, vérifiés.
- Critère 9 (accessibilité) 4 → 5 : plus aucun libellé sous 12 px.
- Verdict : « Prête à envoyer » (85, aucun bloquant).
