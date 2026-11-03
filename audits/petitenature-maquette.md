# petitenature-maquette

<https://petitenature-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 492d096 du 27/10/2026

## Verdict

**83/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Direction « néon et papier » très juste pour une compagnie de lecture à voix haute : titre néon qui s'allume, rouge-gorge qui saute de titre en titre, fil rouge, aimants à mots, tout fonctionne sans erreur et sans débordement. Il reste de la finition tactile (boutons et liens sous 44 px), le `?v=` absent, des visuels provisoires à remplacer et quelques détails de mise en page (fil sur le texte en tablette, carte collante à 1000×560).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture néon lisible dès 0,5 s, rouge-gorge animé, fil rouge et insolation cyanotype en WebGL donnent une vraie signature littéraire, originale et propre au client ; l'accueil reste un peu long et sage dans sa seconde moitié. |
| 2. Direction artistique et harmonie | 12/15 | Palette papier, encre et rouge néon tenue partout, Literata, Tilt Neon et Courier Prime bien associés, images Grok homogènes et sans défaut ; les photos réelles du client (néons de salle, moquette bleue) cohabitent parfois rudement avec les images Grok feutrées. |
| 3. Animations et effets | 12/15 | 54,8 i/s sur ordinateur et 59,8 i/s sur téléphone sans saccade, portes horizontales épinglées, filtres Flip, grésillement néon limité à 2 éclats, curseur et boutons magnétiques ; effets surtout décoratifs, peu de transitions de page. |
| 4. Expérience ludique et interactions | 9/10 | Aimants à mots déplaçables (souris, tactile, clavier), filtres du répertoire, filtres de l'agenda et export .ics, compte à rebours, demande en 4 étapes avec erreurs et récapitulatif, lettre, « Copier » et « Mode calme » mémorisé : tout marche. |
| 5. Tous les formats | 12/15 | Aucun débordement sur aucune page ni fiche, en-tête qui tient à 320 px ; mais beaucoup de cibles sous 44 px, mentions « à compléter » à 11,9 px, fil rouge qui passe sur le texte en tablette, légende de la carte sous l'en-tête à 1000×560. |
| 6. Contenu et fiabilité | 9/10 | Contenus repris du site actuel (relevé daté dans `site.js`), « à compléter » très bien signalés, dates passées classées par année, mentions légales présentes ; quelques visuels provisoires et logos partenaires à fournir. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, aucun lien cassé (37 testés), CLS au chargement ≤ 0,01, accueil à 1,86 Mo, version sans WebGL et « réduire les animations » propres ; lissage des aimants calculé par image. |
| 8. Mise en ligne | 4/5 | Public, noindex et X-Robots-Tag partout, og:image JPG 1200×630 absolue, 404 aux couleurs du site, pas de Cache-Control ; mais aucun `?v=` sur le CSS et le JS du site. |
| 9. Accessibilité | 4/5 | Lien d'évitement, focus rouge de 2 px, texte néon doublé pour les lecteurs d'écran, Échap ferme le menu, Mode calme persistant ; cibles tactiles trop petites. |
| **Total** | **83/100** | |

## Points forts

- Identité forte et propre au client : titre néon lettre par lettre, rouge-gorge dessiné qui se perche sur les titres, didascalies en Courier entre parenthèses, fil rouge qui relie les sections.
- Aimants à mots sur /labos : vrai jeu physique, jouable au doigt et au clavier, avec repli lisible en Mode calme (`captures/inter-aimants-calme-p1440.jpg`).
- Images Grok cohérentes (lumière douce, papier, pupitres, accent rouge), aucune main ni objet déformé.
- Rigueur du contenu : chaque donnée manquante est marquée « à compléter », l'agenda trie seul les dates à venir et passées, les formulaires disent clairement qu'ils sont simulés.
- Aucun débordement horizontal sur les 15 pages et 4 fiches lectures testées, à tous les formats.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Cibles tactiles sous 44 px** : toutes les pages, m320 à m430. « Mode calme » 124×34, liens fléchés 31 px (« Parcourir les 13 lectures », « Tout l'agenda »), liens du pied de page 24 px, boutons « Copier » 30 px, pastille « Prochaine lecture » 36 px, boutons `btn--trait` 40 px de l'agenda, bouton menu réduit à 26 px de large à 320 px. Cause : `assets/css/site.css:175` (`.calme-btn` padding 0,35em), `:157` (`.lien-fleche` sans hauteur mini), `:410` (`.copie button` min-height 30px), `:265` (`.prochaine-pastille`), `:178` (`.menu-btn` rétréci par le flex). Correction : `min-height: 44px` (et `display: inline-flex; align-items: center`) sur ces éléments, `flex-shrink: 0` sur `.menu-btn`, padding vertical sur les liens du pied de page. Effort : petit.
2. **Visuels provisoires encore affichés** : /labos et /imaginer-ensemble (« Territoires, portraits sensibles », « Le Repas »), canvas animés avec l'étiquette « Visuel provisoire » ; portrait d'Élise Truchard et photos de Faire un feu « à fournir ». Cause : `labos.html:111`, `imaginer-ensemble.html:79` et `:92`. Correction : photos du client en priorité, sinon images Grok (voir `imagesManquantes` dans notes.json). Effort : moyen.
3. **Carte collante trop haute à 1000×560** : accueil, la carte sort de l'écran et sa légende passe sous l'en-tête (57 px), `captures/epingle-accueil-1-1000x560-50.jpg`. Même chose sur le titre néon des portes horizontales (10 px, `captures/epingle-accueil-0-1000x560-50.jpg`). Cause : `assets/css/site.css:335` (`.carte figure { position: sticky }` sans borne de hauteur). Correction : `max-height: calc(100svh - var(--entete) - 2rem)` sur la figure et palier `@media (max-height: 600px)` qui réduit la carte et les titres néon. Effort : petit.

### Finition

1. **Fil rouge sur le texte en tablette** : accueil et pages intérieures, t820, le fil vertical passe à 18 px du bord, sur la première lettre du titre et des didascalies (gouttière 16 px), `captures/verif-hero-t820.jpg`. Cause : `assets/js/app.js:271` (`marge = clamp(w * 0.022, 7, 34)`). Correction : sous 960 px, placer le fil à `gouttière / 2` (8 px) ou augmenter la gouttière gauche à 28 px. Effort : petit.
2. **Mentions « à compléter » et étiquettes à 11–11,9 px** : `.a-completer` (0,85em) et `.provisoire` (11px), noms de lieux de la carte à 10 px. Cause : `assets/css/site.css:101`, `:245`, `:344`. Correction : `font-size: max(12px, 0.85em)` et 12 px pour `.provisoire` et `.carte .point text`. Effort : petit.
3. **`?v=` absent** sur `site.css`, `site.js`, `images.js`, `scenes.js`, `app.js`, `gl.js` dans les 14 pages. Cause : gabarit de `outils/build.mjs`. Correction : ajouter le même `?v=1` partout via le gabarit, puis relancer `node outils/build.mjs .`. Effort : petit.
4. **Pas de barre d'action fixe sur téléphone** : l'action « Programmer une lecture » n'est accessible que via le menu ou en fin de page. Correction : barre bas « Programmer une lecture » + appel, masquée sur `#demande` et le pied de page. Effort : moyen.
5. **Aimants : amortissement calculé par image** (`assets/js/app.js` dans `initAimants`, `c.vx *= 0.92` à chaque frame) : le jeu ralentit plus vite sur un écran 120 Hz. Correction : `Math.pow(0.92, dt / 16.7)`. Effort : petit.
6. **Page Contact très courte** sur ordinateur (2 écrans dont le pied de page) : ajouter un bloc carte ou rappel « Programmer » plus généreux. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 0,5 s / 0,5 s (néon complet à 1 s ; h1 234 ms / 204 ms) |
| Fluidité p1440 / m390 | 54,8 i/s / 59,8 i/s (correct sans saccade / très bien) |
| CLS au chargement (max) | 0,0097 (0,122 à m360 non reproduit : 0 sur 2 remesures) |
| Poids de l'accueil, p1440 / m390 | 1,86 Mo / 1,30 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 attendu sur la page introuvable) ; sans WebGL et réduit propres |
| Débordement horizontal | Aucun (15 pages × 9 formats, plus 4 fiches lectures en m390 et p1440) |
| Sections épinglées | Portes horizontales et carte de l'accueil, gestes de /compagnie, carte de /agenda : correctes aux formats courants ; défaut seulement à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui, oui, oui, absent (non pénalisé), JPG 1200×630 absolue, absent, personnalisée |

## Vérifications écartées

- **CLS 0,122 à m360 (accueil)** : remesuré seul deux fois, 0 ; décalage dû à la charge pendant les mesures parallèles.
- **Ouvertures de 1,3 à 3,6 s (/compagnie, /confidentialite, /contact, /creations-sceniques)** : valeurs « h1 » prises avec 5 maquettes en parallèle ; la mesure seule donne 234 ms et le titre est lisible à 0,5 s sur les bandes d'ouverture.
- **Textes SVG « invisibles » de la carte (Vierzon, Épernon…)** : noms de lieux affichés au survol du point ou de la ligne de liste, comportement voulu ; la liste à côté donne tous les lieux.
- **Éléments « masqués » par l'en-tête au pied de page (m320 à m430)** : mesure prise en bas de page avec l'en-tête réaffiché ; le contenu se lit en remontant d'un cran, l'en-tête se masque au défilement vers le bas.
- **Lettres manquantes dans les titres néon (« Sur mes re », « Fai e un feu »)** : grésillement voulu, 2 éclats au plus par titre, espacés de 0,5 s.
- **« Continuer » sans message d'erreur au premier essai** : artefact de mon test pendant le défilement lissé ; un clic réel affiche bien « Choisissez le type de votre structure. ».
- **Pages non listées** : les 13 fiches `/lectures/…` ne figuraient pas dans l'inventaire ; 4 testées (Histoires d'Ados, George Sand, Au supermarché, Observer le vivant) : 200, noindex, aucun débordement, aucune erreur.


---

## petitenature-maquette : corrections de l'étape 2

Commit 95b2c08 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Cibles tactiles sous 44 px (Mode calme, liens fléchés, Copier, pastille, liens du pied, boutons de l'agenda, titres liens, fil d'Ariane) | Important | `min-height: 44px` (et `inline-flex`) sur `.calme-btn`, `.lien-fleche`, `.copie button`, `.prochaine-pastille`, `.evt .btn`, liens du pied et du fil d'Ariane, `.titre--petit > a`, `.evt h3 > a` ; écart de la liste du pied ramené à 0 | site.css | cibles < 44 px de m320 à m430 : environ 500 → 35 par format (restent les aimants, les boutons radio et un lien de 42 px de large) |
| Bouton menu réduit à 26 px de large à 320 px | Important | `flex: none` sur `.menu-btn` ; palier `max-width: 374px` (logo 6,5rem, Mode calme en 12 px, écart 0,5rem) pour que l'en-tête tienne | site.css | 26×44 → 44×44, aucun débordement à 320 px |
| Carte collante trop haute à 1000×560, légende sous l'en-tête | Important | `--entete-h` mesurée en JS (ResizeObserver) ; figure bornée à `100svh - --entete-h`, colonne flex, cadre `min-height: 0` ; sous ScrollSmoother (où `sticky` ne tenait plus, carte sous l'en-tête aussi à 1280×720 et 1366×768) la figure est épinglée par ScrollTrigger sous l'en-tête réel | site.css, app.js | légende sous l'en-tête 57 px (1000×560) et 42 px (1024×640) → 0 ; carte fixe à 88 px du haut aux 4 tailles basses |
| Titre néon des portes sous l'en-tête à 1000×560 | Important | section `height: 100svh` avec `padding-top: var(--entete-h)`, visuel en `svh`, `anticipatePin` retiré, palier `max-height: 600px` (néon, visuel, écarts réduits) | site.css, app.js | 10 px sous l'en-tête → 0 |
| Textes sous 12 px (`.a-completer` 11,9 px, `.provisoire` 11 px, noms de lieux de la carte 10 px) | Finition (récurrent texte-12) | `max(12px, 0.85em)`, 12 px ; noms de lieux posés en style par le JS à 12 px rendus quelle que soit l'échelle du SVG | site.css, app.js | 23 à 33 textes < 12 px par format → 0 au téléphone ; restent 12 « g > text » en t820, artefact de mesure (taille en unités du SVG, 6,2 ; rendu vérifié 12,0 px à 390, 820 et 1440) |
| Pas de barre d'action fixe sur téléphone | Finition (récurrent barre-bas) | barre créée en JS sous 960 px avec les deux actions du site (« Programmer une lecture », « Contact », sans le lien de la page en cours) ; visible seulement après le héros, masquée sur les formulaires, le pied de page, le menu ouvert, /programmer et la 404 ; `--barres-h` mesurée et `padding-bottom` sur `main` | app.js, site.css | éléments couverts par la barre : 0 de m320 à m430 et en t820 ; menu ouvert : barre masquée ; cibles 44 px |
| `?v=` absent | Finition | déjà corrigé à l'étape 1 ; passé à `v=20261028-2` dans les 28 pages et dans le gabarit `outils/build.mjs` | *.html, build.mjs | 14 pages × 6 fichiers en 20261028-2, aucune référence restante en 20261028 |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Visuels provisoires (Territoires, Le Repas, portrait d'Élise Truchard, photos de Faire un feu) | Important | donnée manquante |
| Fil rouge sur le texte en tablette | Finition | finition |
| Amortissement des aimants calculé par image | Finition | finition |
| Page Contact courte | Finition | finition (et contenu à fournir) |
| Aimants à mots 37×33 sur /labos, pastilles radio 18 px (dans des étiquettes de 48 px), lien « Labos » du fil d'Ariane 42 px de large | Important (reste de cibles) | pièces de jeu à taille de mot ; radios cliquables par leur étiquette ; 2 px de largeur |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats × 15 pages) | 0 | 0 |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 28 / 23 / 32 / 23 / 33 | 0 / 0 / 0 / 0 / 12 (artefact SVG, rendu 12 px) |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 507 / 544 / 509 / 484 / 462 | 35 / 34 / 35 / 34 / 12 |
| Éléments couverts par une barre du bas | 0 (pas de barre) | 0 |
| Éléments couverts par l'en-tête (bas de page, écarté au rapport) | 2 à 6 par format | 1 à 4 par format |
| Épinglage aux 8 tailles (défauts) | 4 (1000×560 : 3, 1024×640 : 1) | 0 (96 mesures) |
| Erreurs console | 1 (404 attendue de la page introuvable) | 1 (la même) |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 83/100 → nouvelle note 87/100 · bloquants restants : 0
- Critère 5 : 12 → 14, cibles sous 44 px, mentions à 11,9 px et carte à 1000×560 corrigées ; reste le fil rouge sur le texte en tablette (jamais 15).
- Critère 8 : 4 → 5, le `?v=` manquant est présent (étape 1, porté à 20261028-2).
- Critère 9 : 4 → 5, cibles tactiles portées à 44 px.

## Images Grok définitives (29/10)

Commit db1f864 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| onde-territoires-audio | canvas `data-scene="onde"` + étiquette « Visuel provisoire » (labos.html carte, imaginer-ensemble.html #territoires) | 4:3 calé à droite (x 123–1168, enregistreur, casque et carnet entiers) ; 480, 784, 1045 (taille native, aucun agrandissement) | « Un enregistreur audio et un casque posés sur un rebord de fenêtre en bois, à côté d’un carnet ouvert et d’un crayon rouge » | 5 formats, 0 404, 0 erreur console, CLS max 0,057 |
| repas-novarina-table | canvas `data-scene="repas"` + étiquette (labos.html carte, imaginer-ensemble.html #le-repas) | 4:3 (x 110–1155, table entière et serviette rouge) ; 480, 784, 1045 | « Une longue table en bois dressée dans une salle en pierre, avec des assiettes, du pain, des serviettes de lin, des feuilles blanches et une serviette rouge » | idem |

Ménage : `assets/js/scenes.js` supprimé (plus aucun canvas `data-scene`), balises `<script>` retirées des 30 pages, règle `.provisoire` retirée du CSS, sélecteur parallaxe simplifié dans app.js, `outils/build.mjs` aligné (régénère labos.html et imaginer-ensemble.html à l’identique). Versions `v=20261028-2` → `v=20261029`. Animation conservée : inclinaison au survol des cartes (`data-tilt`) et fil rouge des sections. Mention « Photos de la restitution à fournir » gardée.

Note : 87/100 → 88/100 (critère 6 : 9 → 10, plus aucun visuel provisoire étiqueté ; logos partenaires toujours à fournir) · bloquants : 0 → 0 · Prête à envoyer

### Réintégration dans la v7 (30/10, commit 034216a, non poussé)

Les versions v5 à v7 (autre session, 29/10, en ligne à 18 h 06 avec dd1f9bc) ont été construites sur le commit d'images db1f864, mais le générateur `outils/build.mjs` a remis les canvas provisoires « onde » et « repas ». Les fichiers d'images étaient toujours là. Réintégration par le générateur de la v7 (fonction `visuel()` avec la clé Grok), sans autre changement : 2 emplacements dans `imaginer-ensemble.html` et 2 cartes dans `labos.html`. `scenes.js` reste chargé comme dans la v7. Vérifié en 1440×900, 1920×1080, 1366×768, 1000×560 et 390×844 : images chargées, plus aucun canvas provisoire, aucune 404 ni erreur console, aucun débordement, CLS au chargement ≤ 0,011.
