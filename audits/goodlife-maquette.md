# goodlife-maquette

<https://goodlife-maquette.vercel.app> · audit du 28/10/2026 · dernier commit d03adb2 du 27/10/2026

## Verdict

**77/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Maquette vivante et honnête (intro soleil + feuilles WebGL, chrono H.I.I.T épinglé, réservation simulée avec ticket imprimé, tout « à compléter » bien marqué), fluide à 60 i/s. Elle est freinée par un catalogue du planning qui peut rester invisible (course entre scripts), un CLS de 0,3 sur le planning en portable et un hero bâti sur une photo client amateur.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 11/15 | Intro soleil/« GOOD LIFE » et feuillage WebGL très réussis, mais le hero repose sur une photo client floue et amateur (développé couché, tête masquée) qui fait retomber l'effet premium. |
| 2. Direction artistique et harmonie | 11/15 | Palette crème/vert/corail/or et titres serrés très cohérents sur les 3 pages ; les photos réelles du club (néons, murs jaunes) jurent avec les images Grok dorées à ombres de palmes. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, épinglages propres, cartes suspendues, Flip du planning, ticket imprimé ; mais titre réel lisible à ~3 s, saut de mise en page à la fin de l'intro et catalogue parfois bloqué invisible. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne : chrono H.I.I.T, respiration zen, filtres, jours/catégories du planning, réservation 3 étapes avec ticket, cartes retournables, calculateur, curseur Espace Performance, toast, mode calme. |
| 5. Tous les formats | 11/15 | Aucun débordement horizontal, mais catalogue du planning vide en m390/m320 sur les captures, boutons coupés à 1000×560, textes de 9,6 à 11,5 px et cibles < 44 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Données reprises du site actuel, tout le reste signalé « à compléter / à confirmer », mentions légales en modale ; seul le prix « dès 5 € » s'affiche avec un 5 minuscule. |
| 7. Technique et performance | 7/10 | Aucune erreur console ni lien cassé, 1,5 Mo, repli sans WebGL propre ; CLS 0,31–0,34 sur /planning en 1280 et 1366 et 0,107 sur l'accueil p1440, course de scripts sur les apparitions. |
| 8. Mise en ligne | 4/5 | Public, noindex + X-Robots-Tag, robots.txt correct, og:image JPG 1200×630 absolue, ?v= identique partout ; 404 = page Vercel par défaut. |
| 9. Accessibilité | 4/5 | Focus visible corail, alt partout, réduire les animations et mode calme respectés, tiroir de réservation avec piège du focus ; petites tailles de texte et cibles tactiles sur téléphone. |
| **Total** | **77/100** | |

## Points forts

- Ouverture orchestrée et propre à la marque : soleil corail qui monte, « GOOD LIFE » à graisse variable, feuillage qui s'ouvre sur le hero.
- Chrono H.I.I.T épinglé (effort/récup, rounds, bips optionnels) : idée signature parfaitement liée au métier.
- Réservation simulée complète (cours → créneau → coordonnées → ticket imprimé), clairement marquée « simulation ».
- Rigueur du contenu : chaque donnée manquante est marquée « à compléter / à confirmer » avec un style dédié, plan « schématique, non à l'échelle », horaires du site.
- 60 i/s sur portable et téléphone, aucune erreur console, repli sans WebGL et mode calme soignés.

## Défauts

### Bloquants

1. **Catalogue « Tout le programme » invisible** : /planning, m390 et m320 (mesure automatique confirmée après 2,5 s), `captures/planning-m390-03.jpg` à `-05.jpg` (écran crème vide sur 3 hauteurs d'écran). Intermittent (non reproduit dans mes 5 essais), mais la cause est certaine : course entre scripts. Cause : `assets/js/core.js:204` lance `reveals()` dans `document.fonts.ready.then()` ; quand les polices sont déjà prêtes, ce micro-traitement s'exécute juste après le `DOMContentLoaded` de core.js, donc **avant** que `assets/js/planning.js:76` ait injecté les `.citem[data-reveal]`. Ils restent alors bloqués à `opacity: 0` (`assets/css/style.css:486`). Correction : dans planning.js, après l'injection du catalogue, animer ses propres `[data-reveal]` (ou exposer `GL.reveals(root)` et l'appeler après le rendu), avec `once: true` et une valeur d'arrivée explicite. Effort : petit.

### Importants

1. **CLS de 0,30 à 0,34 au chargement du planning** : /planning p1280 (0,337), p1366 (0,305, remesuré seul : 0,307), g1920 0,147 ; accueil p1440 0,107. Décalage unique d'environ 0,27 vers 2,5 s sur `.phero__in`, `.week-tools` et `.nav__links`. Cause : l'intro appelle `GL.lenis.stop()` (`assets/js/core.js:223`), ce qui ajoute `overflow: clip` sur html (`assets/css/lenis.css:6`) ; à la fin de l'intro la barre de défilement réapparaît et toute la page se décale horizontalement. Correction : `html { scrollbar-gutter: stable; }` dans `assets/css/style.css:22`. Effort : petit.
2. **Prix « dès 5 € » rendu avec un 5 minuscule** (« dès ₅ € ») : accueil, tous formats, `captures/accueil-p1440-16.jpg`. Cause : `assets/css/style.css:303` `.perf__facts span { font-size: .86rem; opacity: .8 }` s'applique aussi au `<span data-roll-perf>` placé dans le `<b>` (`index.html:253`). Correction : cibler `.perf__facts div > span` ou donner `font: inherit; opacity: 1` à `[data-roll-perf]`. Effort : petit.
3. **Contenu coupé à 1000×560** : accueil, hero (bouton sorti de 17 px), disciplines (bouton sorti de 24 px), H.I.I.T (`p.note` sorti de 32 px), `captures/epingle-accueil-0-1000x560-8.jpg`, `epingle-accueil-2-1000x560-8.jpg`. Cause : `assets/css/style.css:165` (`min-height: 620px`) et `:250` (`padding-block: 120px`). Correction : palier `@media (max-height: 600px)` qui réduit les titres et le padding vertical de ces sections. Effort : petit.
4. **Hero sur une photo client amateur** : accueil, tous formats, `captures/accueil-p1440-00.jpg`. La photo réelle (développé couché, éclairage néon, image douce une fois agrandie en 1920 px) est recadrée sans la tête et noyée sous les feuilles : le premier écran perd en niveau premium et jure avec les images Grok dorées du reste du site. Correction : garder la photo réelle plus bas (« La salle, en vrai ») et ouvrir sur une image d'ambiance dans la même lumière que les autres (plateau de musculation sous ombres de palmes), marquée « Ambiance ». Effort : moyen.
5. **Textes < 12 px et cibles < 44 px sur téléphone** : toutes pages m320–m430. `.maquette-tag` 9,6 px (`assets/css/style.css:127`), puces « Ambiance » et « Plan schématique » 11,5 px (`:70`), `small` des jours du planning ; boutons du dock 38 px (`:117`), bouton de retournement 40 px (`:465`), liens du pied de page 21 px (`:348`), lien « Tous les tarifs ». Correction : `font-size: max(12px, …)` et `min-height: 44px` (padding) sur ces éléments. Effort : petit.

### Finition

1. **Page 404 par défaut de Vercel** : `/zz-page-introuvable-audit`. Cause : aucun `404.html` dans le dépôt. Correction : 404.html aux couleurs du club (crème, « GOOD LIFE », bouton retour accueil). Effort : petit.
2. **Pas de barre d'action fixe sur téléphone** : seul le dock Son / Mode calme est fixé en bas. Correction : barre « Réserver » + appel (06 90 67 40 47), masquée sur le formulaire et le pied de page. Effort : petit.
3. **Barre d'outils du planning sous l'étiquette « Maquette » et le dock à l'ouverture** : /planning p1440, boutons des jours à y = 881 sur un écran de 900 px. Cause : `.phero` à `82svh` (`assets/css/style.css:396`). Correction : hero à `min(82svh, 100svh - 140px)` pour que les jours apparaissent entiers ou pas du tout. Effort : petit.
4. **Bouton « Voir le planning » frôlé par le dock** sur l'accueil p1440 (`captures/accueil-p1440-00.jpg`, 5 px de chevauchement). Correction : `padding-bottom` du hero augmenté de la hauteur du dock. Effort : petit.
5. **Images Grok à surveiller** : `accueil-coaching` (barre sans support et tache rose floue derrière la barre) et `tarifs-performance` (anatomie du bras un peu étrange). Aucun défaut franc à la taille affichée. Effort : petit si régénérées.
6. **Emplacement « Photo du club à venir »** (`salle-06`) visible dans la galerie : c'est assumé, mais à remplacer avant l'envoi si possible.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | « GOOD LIFE » d'intro lisible à 0,5 s / 1,5 s ; h1 réel lisible à 3 s / 3 s |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,337 (/planning p1280) ; accueil 0,107 (p1440) ; tarifs 0,046 |
| Poids de l'accueil, p1440 / m390 | 1,52 Mo / 1,03 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 voulue) ; repli sans WebGL propre ; réduire les animations respecté (CLS 0 à 0,23 sur /planning p1440) |
| Débordement horizontal | Aucun |
| Sections épinglées | Hero, disciplines, H.I.I.T : tiennent de 1280×720 à 2560×1440 (seuls des images et canvas de fond passent sous l'en-tête) ; coupés à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Oui / oui / oui / sans Disallow / JPG 1200×630 absolue / 20261027 partout / 404 Vercel par défaut |

## Vérifications écartées

- INVISIBLES du hero de l'accueil (`.hero__lead`, boutons) à y ≈ 1300–2000 : c'est la sortie animée du hero épinglé pendant le défilement ; tout est visible à l'ouverture (`accueil-*-00.jpg`).
- h1 à 3,9 s (accueil p1366) et 5,1 s (tarifs g1920) : valeurs prises avec 5 maquettes en parallèle ; les mesures seules donnent 382 ms / 452 ms, et les bandes d'ouverture montrent la marque lisible dès 0,5 s.
- MASQUÉ « À la séance » sous l'étiquette Maquette (tarifs m360) : la superposition ne dure qu'un instant pendant le défilement.
- Légende du planning qui chevauche la dernière carte (`planning-m390-02.jpg`) : capture prise pendant l'apparition animée des créneaux ; non reproduit après la fin de l'animation.
- Images, canvas `.hero__gl` et image H.I.I.T sous l'en-tête dans les sections épinglées : ce sont des fonds, pas des défauts.
- « Image noire » de l'Espace Performance (`accueil-p1440-15.jpg`) : image en chargement différé puis éclaircie par animation ; elle est bien affichée sur la capture suivante.
- CLS de 0,23 sur /planning p1440 en mode « réduire les animations » : cause probablement voisine (passage de la barre de défilement), à revérifier après la correction de l’important n° 1.


---

## goodlife-maquette : corrections de l'étape 2

Commit 3432a8a (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Catalogue « Tout le programme » invisible (course entre scripts) | Bloquant | `GL.reveals(racine)` exposé par core.js (garde anti-doublon, `once: true`, état final explicite) et appelé par planning.js juste après l'injection du catalogue | assets/js/core.js, assets/js/planning.js | Course supprimée par construction ; /planning m320–m430 : 0 invisible, cartes affichées au défilement (`preuve-catalogue-planning-m390-barre.jpg`) |
| CLS 0,30–0,34 au chargement du planning, 0,11 sur l'accueil | Important | La cause mesurée n'était pas la barre de défilement (Chromium de l'outil n'en a pas) : 1) premier rendu avant le script (police de secours, « Horaires », jours vides) → classe `boot` posée en ligne dans le head, corps masqué jusqu'au démarrage de core.js (filet CSS à 3 s si le script échoue, rien sans JS) ; 2) épinglage du héros créé en fin d'intro qui poussait le bandeau → place réservée en CSS (`margin-bottom: 110vh`) reprise par l'épinglage. `scrollbar-gutter: stable` ajouté en plus pour les navigateurs à barre visible | index.html, planning.html, tarifs.html, assets/css/style.css, assets/js/core.js, assets/js/home.js | /planning p1280 0,336 → 0,041 ; p1366 0,305 → 0,039 ; accueil p1280 0,113 → 0,042, p1440 0,097 → 0,037, téléphones 0,06 → 0,001 |
| Prix « dès ₅ € » | Important | Règle limitée à `.perf__facts div > span` | assets/css/style.css | Chiffre 43 px comme le reste (`preuve-prix-des-5.jpg`) |
| Contenu coupé à 1000×560 | Important | Paliers `@media (max-height: 600px)` : héros sans `min-height` de 620 px, titres et marges en `svh`, H.I.I.T et galerie des disciplines resserrés | assets/css/style.css | Épinglages : 7 coupes (bouton, `p.note`) → 0 aux 8 tailles (`preuve-hero/hiit/disciplines-1000x560.jpg`) |
| Textes < 12 px sur téléphone | Important | `max(12px, …)` sur l'étiquette Maquette, puces Ambiance / Plan, jours du planning, « aujourd'hui », « passé », sous-titre du logo en tablette | assets/css/style.css | 2–4 par page → 0 sur m320–t820 |
| Cibles < 44 px sur téléphone | Important | 44 px : logo, dock, filtres, boutons du plan, bouton de retournement, liens de contact ; liens soulignés et pied de page agrandis par padding sans changer le rendu | assets/css/style.css, assets/js/planning.js | 5–9 par page → 0 (sauf 1 bouton de retournement mesuré 43,9 px pendant sa rotation 3D en m430) |
| Pas de barre d'action fixe sur téléphone | Finition (règle barre du bas) | Barre « Réserver » (même action que l'en-tête) + « Appeler » (06 90 67 40 47, déjà sur le site), visible après le héros, masquée sur le héros, le pied de page et le menu ; hauteur mesurée (`--barres-h`), dock et étiquette remontés au-dessus | assets/js/core.js, assets/css/style.css | Aucun élément couvert par la barre de m320 à m430 ; menu ouvert : masquée ; Réserver ouvre bien le tiroir sur /planning |
| Page 404 par défaut de Vercel | Finition (règle 404) | 404.html : même CSS, en-tête, menu et pied, « Page introuvable. » et retour à l'accueil, chemins absolus | 404.html, assets/css/style.css | 404 perso : non → oui, statut 404 conservé (`preuve-404-m390.jpg`) |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Hero sur une photo client amateur | Important | Effort moyen mais demande une nouvelle image d'ambiance : donnée manquante / image à produire, hors périmètre (aucune image touchée) |
| Barre d'outils du planning sous l'étiquette et le dock en p1440 | Finition | Finition |
| Bouton « Voir le planning » frôlé par le dock en p1440 | Finition | Finition |
| Images Grok accueil-coaching et tarifs-performance | Finition | Image Grok |
| Emplacement « Photo du club à venir » | Finition | Donnée manquante |
| Titre réel lisible à ~3 s (intro) | Finition | Finition |
| Étiquette Maquette qui masque un instant « À la séance » à l'ouverture de /tarifs m360/m390 | — | Déjà écarté à l'audit (passage pendant l'apparition) ; l'étiquette passe sur 3 lignes à 12 px |
| X-Robots-Tag, robots.txt, `?v=` | — | Déjà corrigé à l'étape 1 |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (tous formats, 3 pages) | 0 | 0 (404 locale : débordait en téléphone, page Vercel par défaut → 0) |
| Textes < 12 px (m320/m360/m390/m430/t820) | accueil 3/3/3/3/4, planning 3/3/3/3/4, tarifs 2/2/2/2/3 | 0 partout |
| Cibles < 44 px (m320/m360/m390/m430/t820) | accueil 9/9/9/9/8, planning 6/6/6/6/5, tarifs 5/5/5/5/4 | 0 partout sauf tarifs m430 : 1 (retournement en rotation, 44 px au repos) |
| Éléments couverts | tarifs m360 : 1 (étiquette, ouverture) | tarifs m360 et m390 : 1 (étiquette, ouverture, déjà écarté) ; 404 m320 : h1 sous l'en-tête une fois défilée en bas ; aucun par la barre du bas |
| CLS au chargement p1280 / p1366 / p1440 / g1920 | accueil 0,113 / 0,106 / 0,097 / 0,058 ; planning 0,336 / 0,305 / 0,093 / 0,023 ; tarifs 0,040 / 0,044 / 0,043 / 0,022 | accueil 0,042 / 0,040 / 0,037 / 0,022 ; planning 0,041 / 0,039 / 0 / 0,022 ; tarifs 0,039 / 0,036 / 0,039 / 0 |
| Épinglage aux 8 tailles (hors fonds image/canvas) | 1000×560 : héros (bouton −17 px), disciplines (bouton −24 px), H.I.I.T (`p.note` −32 px) ; autres tailles OK | Rien de coupé aux 8 tailles |
| Erreurs console | 0 (hors 404 voulue) | 0 (hors 404 voulue) |
| Modules chargés deux fois | 0 | 0 (toutes les références en 20261028-2) |

## Note proposée
Ancienne note 77/100 → nouvelle note 87/100 · bloquants restants : 0
- c3 Animations 11 → 13 : catalogue parfois bloqué invisible et saut de mise en page en fin d'intro corrigés.
- c5 Formats 11 → 14 (harmonisé : pas de 15 sur les formats) : catalogue vide, coupes à 1000×560, textes < 12 px et cibles < 44 px corrigés.
- c6 Contenu 9 → 10 : « dès 5 € » rendu correctement.
- c7 Technique 7 → 9 : CLS du planning et de l'accueil sous 0,05, course de scripts supprimée.
- c8 Mise en ligne 4 → 5 : page 404 aux couleurs du club.
- c9 Accessibilité 4 → 5 : tailles de texte et cibles tactiles corrigées.
