# les-plus-hautes-eaux-maquette

<https://les-plus-hautes-eaux-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 2551128 du 23/10/2026

## Verdict

**83/100 · À peaufiner · 1 défaut bloquant**

Concept fort et propre au client (la crue de 1910, l'échelle de crue qui monte au défilement, la barque du logo), fluide à 60 i/s, interactions riches qui fonctionnent. Il reste le grand nom du pied de page coupé en 1920×1080, des textes et des cibles tactiles trop petits sur téléphone, et deux points de mise en ligne.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture barque et eau, nom qui sort de l'eau, puis hero « Les Plus Hautes Eaux Connues » sur photo de scène, échelle de crue latérale : original et lié au nom de la compagnie. |
| 2. Direction artistique et harmonie | 13/15 | Palette nuit, ambre et rouge cohérente, trio Fraunces / Schibsted Grotesk / DM Mono maîtrisé, images d'ambiance homogènes ; une image de foule de concert détonne et les étiquettes des coupures de presse sont cachées. |
| 3. Animations et effets | 13/15 | 60 i/s sur portable et téléphone sans saccade, effets signature (montée de l'eau, gélatine, curseur, boutons magnétiques) ; le hero n'est entièrement composé qu'après 3,5 à 4 s (nom lisible dès 1 à 1,5 s dans l'intro). |
| 4. Expérience ludique et interactions | 9/10 | Filtres du répertoire, calendrier de décembre, carte avec curseur d'années, formulaire simulé en 4 étapes avec récapitulatif, visionneuse de presse, son et Mode calme : tout fonctionne. |
| 5. Tous les formats | 10/15 | Aucun débordement horizontal, mais nom du pied de page coupé en 1920×1080, textes de 9 à 11,5 px et nombreuses cibles sous 44 px sur téléphone, image épinglée qui sort de l'écran à 1000×560. |
| 6. Contenu et fiabilité | 9/10 | Données provisoires très bien marquées (« à compléter », « À vérifier : année à confirmer »), formulaires annoncés comme simulés, dates passées et à venir triées ; mentions légales encore « à compléter ». |
| 7. Technique et performance | 9/10 | Aucune erreur JavaScript, CLS max 0,021, 2,2 Mo sur l'accueil, polices préchargées, version sans WebGL intacte. |
| 8. Mise en ligne | 3/5 | Public, noindex partout, X-Robots-Tag, og:image 1200×630 en adresse complète et 404 aux couleurs ; mais règle Cache-Control dans `vercel.json` et aucun `?v=` sur `main.css` et `app.js`. |
| 9. Accessibilité | 4/5 | Focus visible, lien d'évitement, « réduire les animations » bascule en Mode calme sans intro, textes alternatifs ; cibles tactiles et petits textes à reprendre. |
| **Total** | **83/100** | |

## Points forts

- Idée de marque rare : le nom de la compagnie devient le fil du site (crue de 1910, 8,62 m, échelle de crue qui suit le défilement, eau qui monte dans les médias).
- Intro jouée une seule fois par session et supprimée en Mode calme ou sous « réduire les animations ».
- Agenda complet et vivant : filtres par spectacle et département, carte des communes année par année, archives repliables, compte à rebours de la prochaine date.
- Formulaire « Programmer un spectacle » en 4 étapes, préremplissable depuis la saison de Noël, avec récapitulatif et mention « Demande simulée : rien n'a été envoyé ».
- Fluidité de 60 i/s mesurée sur portable et téléphone, CLS quasi nul.
- Contenus provisoires signalés de façon uniforme et visible.

## Défauts

### Bloquants

1. **Nom du pied de page coupé en grand écran** : toutes les pages, g1920 (« Connue » sans le « s »), `captures/accueil-g1920-zz.jpg`. Cause : `assets/css/main.css:549`, `.reflet-nom { font-size: clamp(2.6rem, 1rem + 8.4vw, 9.6rem); white-space: nowrap }` calculé sur la fenêtre alors que le conteneur est plafonné par `--max`. Correction : `.reflet { container-type: inline-size }` puis `.reflet-nom { font-size: clamp(2.6rem, 12.5cqi, 9.6rem) }` (taille liée à la largeur réelle du bloc), vérifier à 1440, 1920 et 2560. Effort : petit.

### Importants

1. **Textes de moins de 12 px sur téléphone** : accueil, agenda, 404, m320 à m430. « jours » du compte à rebours 11 px, badges « Dès 3 ans » 11,2 px, chiffres du calendrier 11,5 px, boutons « Grand Ouest / France » 11,2 px, « à compléter », statuts « À venir » et « À vérifier » 11,2 px, nom « Saint-Grégoire, siège » sur la carte 9 px. Cause : tailles en `.7rem` environ dans `assets/css/main.css` (ex. `:800` `max(.68rem, 11px)` pour les coupures). Correction : plancher `max(12px, …)` sur les surtitres mono, badges, statuts et légendes ; 12 px minimum pour le texte SVG de la carte. Effort : petit.
2. **Cibles tactiles sous 44 px sur téléphone** : accueil et agenda, m320 à m430. Liens « Voir le spectacle » et « Toutes les dates » hauts de 24 px, bouton menu de 27 à 40 px de large selon le format, lien de spectacle du calendrier 93×27, titres de l'agenda 22 px de haut, sélecteur de département 41 px, curseur d'années 32 px. Cause : `.lien`, `.tool`, `.burger`, `#f-dep` et `#annee-agenda` sans hauteur minimale dans `assets/css/main.css`. Correction : `min-height: 44px` (padding vertical) sur `.lien` et les liens de liste, `min-width: 44px` sur `.tool` et `.burger`, hauteur de 44 px pour le select et la piste du curseur. Effort : petit.
3. **Image épinglée qui sort de l'écran sur petit portable** : accueil, section « Une représentation chez vous », 1000×560 (223 à 360 px hors écran) et 1024×640, `captures/epingle-accueil-0-1000x560-92.jpg`. Cause : `div.repr-images` en `position: sticky` avec des images plus hautes que la fenêtre. Correction : `max-height: calc(100svh - var(--entete-h) - 2rem)` sur le bloc d'images et `object-fit: cover`, ou désactiver l'épinglage sous `max-height: 640px`. Effort : petit.
4. **Règle Cache-Control dans `vercel.json`** : `vercel.json:6` (`/assets/(fonts|img)/(.*)` en `max-age=604800`). Correction : supprimer ce bloc et garder seulement l'en-tête X-Robots-Tag. Effort : petit.
5. **CSS et JS sans numéro de version** : toutes les pages, `index.html:29` (`assets/css/main.css`) et l'appel de `assets/js/app.js`, idem dans `agenda.html`, `404.html` et `spectacles/*.html`. Correction : ajouter le même `?v=` (ex. `?v=20261027`) à `main.css` et `app.js` dans toutes les pages. Effort : petit.

### Finition

1. **Hero entièrement lisible seulement vers 3,5–4 s** : accueil, p1440 et m390, `captures/ouverture-p1440-t3000.jpg`. L'intro montre le nom dès 1 à 1,5 s, puis le titre du hero se recompose ligne par ligne jusqu'à 4 s. Cause : enchaînement intro puis révélation dans `assets/js/app.js:372` à `:452` (attente jusqu'à 3,2 s). Correction : chevaucher la révélation du hero avec la fin de l'intro pour que le titre soit posé avant 3 s. Effort : petit.
2. **Étiquettes des coupures de presse cachées** : accueil, p1280 à g1920, section « La presse et les ondes ». Les noms (« Betton infos », etc.) sont sous les autres coupures de l'éventail. Cause : `assets/css/main.css:800` (`.coupure .mono` en `bottom: -1.8rem` sous une coupure recouverte). Correction : afficher la légende au survol ou en liste sous l'éventail, en 12 px. Effort : petit.
3. **Image d'ambiance « foule de concert »** : `assets/img/ambiance/accueil-public-silhouettes-16x9-*.webp`, salle comble mains levées façon concert, en décalage avec un théâtre jeune public. Correction : la remplacer par une salle de spectacle d'enfants ou la retirer. Effort : petit.
4. **Pas de barre d'action en bas sur téléphone à l'accueil** : m390, seule la barre de progression de 3 px. Correction : barre « Programmer » + e-mail, masquée sur le formulaire et le pied de page. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1,5 s / 1,0 s (nom dans l'intro) ; hero complet vers 4 s / 3,5 s |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,021 (accueil p1280) |
| Poids de l'accueil, p1440 / m390 | 2,20 Mo / 1,92 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune (seul le 404 attendu de la page introuvable) ; sans WebGL identique ; réduire = Mode calme sans intro |
| Débordement horizontal | aucun (accueil, agenda, fiches spectacle testées) |
| Sections épinglées | `repr-images` sort de l'écran à 1000×560 et 1024×640 ; correct à partir de 1280×720 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui · oui · oui · absent (non pénalisé) · JPG 1200×630 absolu · absent · personnalisée ; Cache-Control présent dans `vercel.json` |

## Vérifications écartées

- « Invisibles » `div.carte-bulle` et `ul > li` sur l'agenda m320 / m360 : bulle de la carte qui n'apparaît qu'au toucher d'un point, comportement voulu.
- « Invisible » `li` « Mardi 22 décembre 2026 » sur l'accueil m320 : détail du calendrier masqué tant qu'aucun jour n'est choisi.
- « Masqué par l'en-tête » (filtres, liens de l'agenda, pied de page, e-mail) : éléments qui passent sous l'en-tête fixe au moment de la capture de défilement, pas de contenu bloqué ; le bandeau de filtres de l'agenda est volontairement collant.
- Erreur console « 404 » sur la page introuvable : statut 404 attendu de la page elle-même.
- Valeurs « h1 » par format (jusqu'à 981 ms) : prises avec 5 maquettes en parallèle ; la mesure seule donne 254 ms et 176 ms, et l'ouverture a été jugée sur les captures.
- 1re mesure de fluidité avec 1 à 2 images de plus de 100 ms : non reproduite, deuxième mesure à 60 i/s sans image lente.
- Bouton « Ajouter à mon agenda » (premier test sans téléchargement) : le premier test cliquait sur le conteneur `[data-ics]`. Retesté sur le bouton, agenda en m390 et p1440 et fiche Mimo et Tuf en m390 : il télécharge un .ics valide (date, titre, commune), affiche le message de confirmation et ne produit aucune erreur.
- Fiches spectacle (hors menu, accessibles depuis les cartes) : mimo-et-tuf, cellule-247 et carnet-de-routes en 200, noindex, sans débordement à 1440 et 390 px.


---

## les-plus-hautes-eaux-maquette : corrections de l'étape 2

Commit 611cff6 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Nom du pied de page coupé en 1920×1080 | Bloquant | `.reflet { container-type: inline-size }`, `.reflet-nom` en `clamp(2.2rem, 7.9cqi, 8.6rem)` : taille liée à la largeur réelle du bloc | `assets/css/main.css` | g1920 : coupé → 1352/1352 px, rien de coupé (1440, 2560 et 390 identiques) · `preuve-pied-g1920.jpg` |
| Textes < 12 px sur téléphone | Important | Planchers `max(12px, …)` sur la liste des étiquettes mono (badges, statuts, « à compléter », dates, `.seg`, `.ext`), compte à rebours, cases du calendrier, `.tags`, coupures, `.bio-btn`, `.credit` ; étiquette SVG « Saint-Grégoire, siège » calculée pour faire 12 px à l'écran (et placée à gauche du point si elle sortirait de la carte) | `main.css`, `assets/js/carte.js` | 128 → 4 relevés ; les 4 restants sont l'étiquette SVG, lue en unités de la carte (9 à 11,75) alors qu'elle fait 12 à 18 px à l'écran · `preuve-carte-m390.jpg` |
| Cibles < 44 px sur téléphone | Important | `min-height: 44px` sur `.logo`, `.lien`, liens du calendrier et de l'agenda, select, `.mail .adr`, liens du pied ; `min-width: 44px` et `flex: none` sur `.tool` et `.burger` ; curseur d'années à 44 px | `main.css` | 106 → 10 (restent les points de la carte et une case de calendrier à 320 px) |
| Image épinglée qui sort de l'écran à 1000×560 et 1024×640 | Important | Bloc `.repr-images` collé sous l'en-tête mesuré (`top: calc(var(--entete-h) + 1rem)`), largeur plafonnée pour que sa hauteur (1,345 × largeur + 12 px, issue des proportions des images) tienne dans `100svh` ; `--entete-h` mesurée en JS (ResizeObserver) | `main.css`, `assets/js/app.js` | Position stabilisée (2,5 s) : bloc entre 84 et 544 px à 1000×560, 84 et 624 px à 1024×640, dans l'écran aux 8 tailles · `preuve-epingle-*`, `preuve-repr-*` |
| Pas de barre d'action en bas sur téléphone (barre-bas) | Finition (récurrent) | Barre « Programmer » (#programmer) + « Écrire » (mailto déjà présent) sous 760 px, visible seulement une fois le héros dépassé, masquée sur le formulaire, le pied de page et le menu ouvert ; `--barres-h` mesurée et réservée sous le pied | `index.html`, `main.css`, `app.js` | Héros/formulaire/pied/menu : masquée ; répertoire : visible ; clic → formulaire ; aucun élément couvert par la barre (m320 à m430) · `preuve-barre-bas-m390.jpg` |
| Bulle de la carte : nombre de dates à 9,6 px | Important (texte 12 px) | Taille en ligne `.6rem` retirée (reprend `.mono`, 12 px) | `carte.js` | Vérifié dans le code |
| Cache-Control dans `vercel.json`, CSS/JS sans `?v=` | Important | Déjà corrigé à l'étape 1 ; versions passées à `?v=20261028-2` partout | toutes les pages, modules JS | `grep v=20261028[^-]` vide ; une seule version par fichier |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Points de la carte sous 44 px (10 à 33 px) | Important (partiel) | Finition : points très serrés en vue Grand Ouest, les agrandir les ferait se chevaucher ; à revoir avec une liste des communes |
| Case du calendrier 40 px de large à 320 px | Important (partiel) | Finition : grille de 7 colonnes sur 288 px, hauteur 56 px |
| Hero entièrement composé vers 3,5–4 s | Finition | Finition |
| Étiquettes des coupures de presse cachées sous l'éventail | Finition | Finition (visibles au survol et sous 1000 px) |
| Image d'ambiance « foule de concert » | Finition | Visuel à remplacer par le client : donnée manquante |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (27 pages × formats) | 0 | 0 |
| Textes < 12 px (relevés) | 128 | 4 (étiquette SVG, 12 px réels à l'écran) |
| Cibles < 44 px (relevés) | 106 | 10 (points de carte, 1 case de calendrier à 320 px) |
| Éléments couverts | 33, tous par l'en-tête au défilement (écartés par l'audit) | 34, idem ; 0 par la barre du bas |
| Épinglage `repr-images` (outil, 900 ms) | sort de 196 à 360 px à 1000×560 et 1024×640 | l'outil relève encore 77 à 210 px : ses positions sont prises avant le collage (bloc en flux normal, cf. capture) |
| Épinglage, position stabilisée (8 tailles) | sort de l'écran à 1000×560 et 1024×640 | dans l'écran à 1000×560, 1024×640, 1280×720, 1366×768, 1440×900, 1728×1000, 1920×1080 ; tablette 820×1180 non collée |
| Pied de page g1920 | « Connues » coupé | entier (1352 px dans 1352 px) |
| Erreurs console | seul le 404 attendu | seul le 404 attendu |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 83/100 → nouvelle note 90/100 (critère 5 : 10 → 14, nom du pied coupé, textes, cibles et image épinglée corrigés ; critère 8 : 3 → 5, Cache-Control et `?v=` corrigés à l'étape 1 ; critère 9 : 4 → 5, cibles et petits textes repris) · bloquants restants : 0
