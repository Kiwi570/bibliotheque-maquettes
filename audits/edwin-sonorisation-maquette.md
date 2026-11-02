# edwin-sonorisation-maquette

<https://edwin-sonorisation-maquette.vercel.app> · audit du 27 octobre 2026 · dernier commit 335111c du 27 octobre 2026

## Verdict

**82/100 · À peaufiner · 2 défauts bloquants**

Univers DJ fort, interactions jouables et sans bug, fluidité parfaite. Les deux sections épinglées ne tiennent pas dans l'écran sur les portables courants : le titre de l'accueil passe sous l'en-tête et le bas de « Soirée type » sort de l'écran.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | La platine d'ouverture puis le vinyle WebGL au-dessus de la foule imposent tout de suite l'univers DJ, mais l'idée du vinyle reste attendue pour ce métier. |
| 2. Direction artistique et harmonie | 12/15 | Système noir et vert du logo, Unbounded avec Inter et JetBrains Mono, images Grok homogènes ; les photos réelles, sombres et bruitées, et le titre épinglé coupé font baisser le niveau. |
| 3. Animations et effets | 12/15 | 60 i/s sur portable et téléphone, titre lisible vers 2 s, galerie horizontale avec disques et pads qui recolorent la page ; mais les deux épinglages débordent de l'écran. |
| 4. Expérience ludique et interactions | 9/10 | Pads d'ambiance (le BPM change), son démo, buzzer, recherche de commune avec distance, devis en 6 étapes avec erreurs sous les champs, FAQ : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 10/15 | Aucun débordement horizontal, mais des sections épinglées coupées à 1280, 1366 et 1440, un en-tête sur deux lignes à 1280 et 1366, et une barre du bas qui recouvre la confirmation du devis. |
| 6. Contenu et fiabilité | 9/10 | Aucun avis inventé (livre d'or vide assumé), « à compléter » bien marqués, images Grok marquées « Illustration », mentions légales présentes ; « 10 ans » et « 50 km » restent à confirmer. |
| 7. Technique et performance | 9/10 | Aucune erreur JS ni ressource en 404, CLS au chargement de 0,012, 1,2 Mo pour l'accueil, repli sans WebGL propre, polices chargées avant l'apparition du texte. |
| 8. Mise en ligne | 4/5 | Site public, noindex et X-Robots-Tag, og:image 1200×630 en adresse complète, pas de Cache-Control, 404 personnalisée ; le module de page est chargé sans `?v=`. |
| 9. Accessibilité | 4/5 | Focus visible, « réduire les animations » active le mode calme, bouton « Mode calme » fonctionnel, bons contrastes ; quelques cibles font moins de 44 px sur téléphone. |
| **Total** | **82/100** | |

## Points forts

- Univers cohérent et mémorable : platine d'ouverture (« Face A, 33 tr/min »), vinyle WebGL qui se scratche, pads qui recolorent la page, carte radar des 50 km, 404 « Disque rayé ».
- Interactions vraiment jouables : le devis refuse une date passée, propose les communes avec leur distance et affiche une confirmation honnête (« rien n'a été envoyé »).
- Les règles d'honnêteté sont respectées : livre d'or vide plutôt qu'inventé, mention « Illustration » sur les images Grok, emplacements « lien à fournir ».
- Téléphone bien pensé : barre « Devis + Appeler », titres qui tiennent à 320 px, menu qui se ferme avec Échap et défilement verrouillé.
- 60 i/s sans aucune saccade, aucune tâche longue, CLS au chargement presque nul.

## Défauts

### Bloquants

1. **Titre « Pour chaque occasion, la bonne ambiance » caché sous l'en-tête pendant l'épinglage.**
   - Page et formats : accueil, en 1280×720, 1366×768 et 1440×900. À 1000×560, 1024×640 et 1728×1000 aussi ; seul le 1920×1080 tient.
   - Captures : `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-accueil-0-1366x768-50.jpg`, `captures/epingle-accueil-0-1440x900-50.jpg`.
   - Cause : `assets/js/pages/home.js:70-72`. Quand la section est plus haute que l'écran (`fits()` faux), l'épinglage démarre en `'bottom bottom'` : le haut de la section, titre compris, reste au-dessus de l'écran, sous l'en-tête. `anticipatePin: 1` accentue le saut.
   - Correction : épingler en `'top top'` une section de 100svh en colonne flex, placée sous l'en-tête mesuré en JS (`--entete-h`). La piste des cartes prend la place restante (`flex: 1; min-height: 0`) et les cartes se règlent sur cette hauteur. Retirer `anticipatePin`.
   - Effort : moyen.
2. **Bas de la section épinglée « Le bon son à chaque instant » hors de l'écran.**
   - Page et formats : prestations, en 1280×720 (libellés de l'égaliseur et légende coupés de 20 px) et 1366×768 (6 px).
   - Capture : `captures/epingle-prestations-0-1280x720-50.jpg`.
   - Cause : `assets/css/main.css:573`. `.night__pin` est en `min-height: 100svh` avec padding, et le contenu (titre, égaliseur dont `.stages` fait au moins 520 px selon `main.css:589`, image en 4/3) dépasse la hauteur de l'écran. Le lecteur flottant recouvre en plus le bas.
   - Correction : `height: 100svh` en colonne flex, bas réservé avec `--barres-h` mesuré en JS, `flex: 1; min-height: 0` sur l'égaliseur et l'image, et retrait du `min-height: 520px`.
   - Effort : moyen.

### Importants

1. **En-tête sur deux lignes à 1280 et 1366 px.**
   - Pages et formats : toutes les pages, en 1280×720 et 1366×768. « Livre d'or » et le numéro du bouton vert passent sur deux lignes (« 07 86 39 91 / 56 »).
   - Capture : `captures/epingle-prestations-0-1280x720-50.jpg`.
   - Cause : `assets/css/main.css:195`. La pastille « Prochain créneau d'appel » s'affiche dès 1240 px, alors que l'en-tête complet demande environ 1400 px.
   - Correction : `.status-pill` à partir de 1440 px seulement, et `white-space: nowrap` sur `.nav a` et `.btn__label`.
   - Effort : petit.
2. **Contenu coupé à 1000×560.**
   - Accueil : le titre et le chapô de la section Événements passent sous l'en-tête, de 159 px et 37 px. Prestations : le bas de « Soirée type » sort de l'écran de 46 px.
   - Captures : `captures/epingle-accueil-0-1000x560-50.jpg`, `captures/epingle-prestations-0-1000x560-50.jpg`.
   - Cause : les mêmes que les bloquants 1 et 2.
   - Correction : celles des bloquants, plus un palier `max-height: 600px` qui réduit les titres et les marges verticales.
   - Effort : petit, une fois les bloquants corrigés.
3. **La barre du bas « Devis + Appeler » recouvre la confirmation du devis et reste affichée sur le pied de page.**
   - Pages et format : contact en fin de devis, et toutes les pages au pied de page, sur téléphone. Le bouton « 07 86 39 91 56 » de la confirmation passe sous la barre.
   - Capture : `captures/inter-devis-fin.jpg`.
   - Cause : `assets/css/main.css:211`. `.deck` reste toujours fixe, sans masquage.
   - Correction : masquer `.deck` par un IntersectionObserver sur `#devis` et `footer`.
   - Effort : petit.

### Finition

1. **Module de page chargé sans `?v=`.**
   - Cause : `assets/js/app.js:58`, `import(\`./pages/${state.page}.js\`)`, alors que tous les autres modules du site portent `?v=20261027c`. Après une mise à jour, l'ancien code peut rester servi.
   - Correction : ajouter le même `?v=` à cet import.
   - Effort : petit.
2. **Cibles tactiles de moins de 44 px sur téléphone.**
   - Éléments : `a.cta__phone` (38 px de haut), `li > a.link-draw` du pied de page (40 px), `dd > a` des mentions (21 px), logo (43 px), `a.evlist__t` des prestations (21 px).
   - Correction : `min-height: 44px; display: inline-flex; align-items: center`.
   - Effort : petit.
3. **Libellés de la carte radar en 11 px sur téléphone.**
   - Élément : `span.radar__label`, sur l'accueil, de 320 à 430 px.
   - Correction : `font-size: max(12px, …)`.
   - Effort : petit.
4. **Hauteurs de l'en-tête et du lecteur codées en dur.**
   - Cause : `--header-h: 72px` et `--deck-h: 64px` (`main.css:36-37`).
   - Correction : les mesurer en JS dans `--entete-h` et `--barres-h`, ce qui prépare les bloquants.
   - Effort : petit.
5. **Photos réelles du client sombres et bruitées.**
   - Exemples : `real/salle-faisceau-bleu`, `real/piste-foule-bleue`, `real/scene-exterieure-podium`.
   - Correction : ne pas les remplacer, ce sont les vraies prestations ; demander de meilleures photos au client, ou leur appliquer le même grain et la même teinte verte que les images Grok.
   - Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,0 s / 2,0 s (titre en cours d'apparition à 1,5 s, platine d'intro avant) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,012 (p1280) |
| Poids de l'accueil, p1440 / m390 | 1,20 Mo / 0,62 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune / repli vinyle CSS propre, aucune erreur / mode calme activé, aucune erreur |
| Débordement horizontal | aucun, de 320 à 1920 px |
| Sections épinglées | accueil : titre sous l'en-tête de 1000 à 1728 px de large ; prestations : bas hors de l'écran de 1000 à 1366 px de large |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public ; noindex dans les 5 pages ; X-Robots-Tag « noindex, nofollow » ; robots.txt absent (non pénalisé) ; og:image JPG 1200×630 en adresse complète ; `?v=20261027c` identique sur main.css et app.js, absent sur le module de page ; 404 « Disque rayé » |

## Vérifications écartées

- **Ouverture mesurée à environ 180 ms (« h1 »)** : la mesure ne voit pas la platine d'intro. Sur les captures à étapes, le titre se lit entièrement vers 2 s.
- **Éléments « invisibles »** (BPM sur téléphone, chapôs de prestations) : c'étaient des animations encore en cours, visibles ensuite (`captures/inter-bpm-m390.jpg`).
- **Éléments signalés « masqués » sous l'en-tête en bas de page** : c'est du texte qui défile normalement sous l'en-tête fixe.
- **Erreur console sur la 404** : il s'agit du statut 404 de la page elle-même.
- **Étiquette du vinyle qui paraît inversée** : elle tourne avec le disque ; à 2 s, on lit bien « SONORISATION ».
- **Décalage de 1,0 pendant l'épinglage** : ce n'est pas du CLS, il relève du test « tient dans l'écran », traité dans les bloquants.
- **Images Grok** : les 30 ont été contrôlées (`captures/grok-montage-0.jpg` et `-1.jpg`), et les mains de g05, g11, g13 et g17 en taille réelle. Aucun doigt en trop, texte, filigrane ni visage déformé.
- **Copie du numéro sans effet** : c'est une limite du navigateur de test (presse-papiers refusé). Le code affiche bien « Numéro copié ✓ » (`contact.js:207`).


---

## edwin-sonorisation-maquette : corrections de l'étape 2

Commit 5e5f204 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Titre « Pour chaque occasion, la bonne ambiance » sous l'en-tête pendant l'épinglage (accueil) | Bloquant | Méthode « Tout tenir dans l'écran » : section épinglée en `height: 100svh`, colonne flex, haut réservé par `--entete-h`, bas par `--barres-h` (lecteur flottant), piste des pochettes en `flex: 1; min-height: 0`, pochettes réglées sur la hauteur restante ; épinglage en `start: 'top top'`, `fits()` et `anticipatePin` retirés | `assets/js/pages/home.js`, `assets/css/main.css` | Titre sous l'en-tête de 1000 à 1728 px de large (jusqu'à 162 px) → 0 défaut aux 8 tailles |
| Bas de « Soirée type » hors écran (prestations) | Bloquant | `.night__pin` en `height: 100svh` colonne flex, haut `--entete-h`, bas `--barres-h` ; grille en `flex: 1; min-height: 0`, égaliseur et image en `flex: 1; min-height: 0` (le `min-height: 520px` de `.stages` est retiré) | `assets/css/main.css` | Coupé de 20 px (1280), 6 px (1366), 46 px (1000×560) → 0 défaut aux 8 tailles |
| Hauteurs de l'en-tête et du lecteur codées en dur | Finition (prépare les bloquants) | `initMeasures()` : `--entete-h` et `--barres-h` mesurées en JS, mises à jour par ResizeObserver et au redimensionnement | `assets/js/core/ui.js`, `assets/js/app.js` | `--entete-h: 72px`, `--barres-h: 76px` (66 px à 1000×560, 68 px sur téléphone) |
| En-tête sur deux lignes à 1280 et 1366 | Important | Pastille horaires à partir de 1440 px, `white-space: nowrap` sur `.nav a` et `.btn__label` | `assets/css/main.css` | « Livre d'or » et le numéro sur deux lignes → une ligne (`preuve-entete-1280.jpg`) ; la pastille tient à 1440 et 1728 |
| Contenu coupé à 1000×560 | Important | Bloquants ci-dessus + palier `max-height: 600px` (titres, chapô et marges réduits dans les deux sections épinglées) | `assets/css/main.css` | Titre −159 px, chapô −37 px, bas −46 px → 0 |
| Barre « Devis + Appeler » sur la confirmation du devis et le pied de page | Important | `initDeckAway()` : IntersectionObserver sur `#devis` et `.footer`, classe `.is-away` qui masque la barre sur téléphone ; pied de page en `padding-bottom: calc(var(--barres-h) + 40px)` | `assets/js/core/ui.js`, `assets/js/app.js`, `assets/css/main.css` | Barre visible en haut de l'accueil, masquée au pied et sur le devis ; confirmation dégagée (`preuve-devis-fin-sans-barre-m390.jpg`, `preuve-pied-sans-barre-m390.jpg`) |
| Libellés radar en 11 px | Finition | `font-size: max(12px, …)` sur `.radar__label` | `assets/css/main.css` | 2 à 3 textes < 12 px par format téléphone et tablette → 0 |
| Cibles < 44 px | Finition | `min-height: 44px` sur logo, `.cta__phone`, `.phone-big`, liens des mentions, `a.evlist__t`, liens du pied ; zone étendue par `::after` sur les barres d'étapes du devis ; `.check` à 44 px | `assets/css/main.css` | 21 cibles par format téléphone → 3 (voir « Non corrigé ») |
| Module de page sans `?v=` | Finition | `import(\`./pages/${state.page}.js?v=20261028-2\`)` ; toutes les versions passées en `20261028-2` | `assets/js/app.js` + tous les HTML/JS du site | `grep "v=20261028[^-]"` vide ; aucun module chargé deux fois |

Interactions vérifiées après correction (m390 et p1440) : son démo, mode calme, pads (BPM 90 → 128), buzzer, recherche de commune, menu mobile et Échap, devis en 6 étapes (erreurs sous les champs, date passée refusée, confirmation), FAQ ; aucune erreur console.

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Photos réelles du client sombres et bruitées | Finition | Finition ; meilleures photos à demander au client |
| Barres d'étapes du devis (4 px de haut) encore comptées par l'outil | Finition | Taille visuelle gardée volontairement ; zone tactile portée à 44 px par `::after`, que l'outil ne mesure pas |
| Case à cocher du livre d'or (22 px) encore comptée | Finition | L'étiquette entière (≥ 44 px) coche la case ; agrandir la case dégraderait le formulaire |
| « 10 ans » et « 50 km » à confirmer | — | Donnée client manquante |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920) | aucun | aucun |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 2 / 2 / 2 / 2 / 3 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 21 / 21 / 21 / 21 / 17 | 3 / 3 / 3 / 3 / 3 (barres d'étapes et case à cocher) |
| Cibles < 44 px (p1280 à g1920) | 0 | 0 |
| Éléments couverts | 6 / 6 / 6 / 11 / 0 / 2 / 7 / 2 / 0 | 6 / 6 / 6 / 10 / 2 / 2 / 7 / 2 / 1 : texte qui défile sous l'en-tête en bas de page (écarté au rapport) ; les nouveaux de t820 et g1920 sont sur la 404, même cas |
| Épinglage accueil, 8 tailles + 2560 | défaut de 1000 à 1728 (titre sous l'en-tête) | 0 défaut |
| Épinglage prestations, 8 tailles + 2560 | défaut à 1000, 1280, 1366 (bas hors écran) | 0 défaut |
| Erreurs console | seulement le 404 de la page introuvable | inchangé, aucune nouvelle |
| Modules chargés deux fois | aucun | aucun (`?v=20261028-2` partout, module de page compris) |

## Note proposée
Ancienne note 82/100 → nouvelle note 91/100 · bloquants restants : 0
- Direction artistique 12 → 13 : les titres épinglés ne sont plus coupés ; seules les photos réelles sombres retiennent le point.
- Animations 12 → 14 : les deux épinglages tiennent dans l'écran à toutes les tailles.
- Tous les formats 10 → 14 : épinglages entiers, en-tête sur une ligne à 1280 et 1366, barre du bas qui ne recouvre plus le devis ni le pied de page.
- Mise en ligne 4 → 5 : le module de page porte le même `?v=` que le reste.
- Accessibilité 4 → 5 : textes de 12 px et cibles de 44 px sur téléphone.
