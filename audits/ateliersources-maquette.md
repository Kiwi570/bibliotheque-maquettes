# ateliersources-maquette

<https://ateliersources-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 5252497 du 25/10/2026

## Verdict

**80/100 · À peaufiner · 0 défaut bloquant**

Une maquette sensible et cohérente : l'eau vive en WebGL, la rivière et la libellule tissent tout le parcours, et le contenu est sourcé avec des « à compléter » bien marqués. Trois choses la retiennent : le titre n'apparaît qu'à environ 4 s, un gel de 446 ms en fin d'ouverture sur portable, et une mise en ligne incomplète (X-Robots-Tag, `?v=`).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | La goutte qui ouvre une photo sous l'eau vive puis la rivière qui suit le défilement forment une vraie signature, mais l'intro tient le visiteur sur un écran sombre pendant près de 4 s. |
| 2. Direction artistique et harmonie | 12/15 | Palette calcaire, Anglin et rouille juste, et Fraunces avec Instrument Sans s'accordent bien ; les photos réelles, prises au téléphone avec des lumières inégales, contrastent avec les illustrations Grok très léchées. |
| 3. Animations et effets | 11/15 | Le jeu est riche : saisons en volet ondulé, carte tracée, rituel du sauna, journée et chambres épinglées. Mais le titre n'arrive qu'à environ 4 s et une image de plus de 100 ms est confirmée sur p1440. |
| 4. Expérience ludique et interactions | 9/10 | Bascule été / hiver, carte à repères, rituel, témoignages avec pause, coupe de la maison par étage, demande en 5 étapes avec calendrier, son et mode calme : tout se comprend sans mode d'emploi. |
| 5. Tous les formats | 12/15 | Aucun débordement et les sections épinglées tiennent aux 8 tailles, mais plusieurs cibles tactiles sont trop petites sur téléphone : bouton Son 32×40, repères de carte jusqu'à 8×14, lien « Lire nos avis Google » de 29 px de haut. |
| 6. Contenu et fiabilité | 9/10 | Textes, témoignages et chiffres repris du site actuel, « à compléter » surligné, stages passés datés au passé, mentions légales présentes. Deux témoignages restent à confirmer. |
| 7. Technique et performance | 8/10 | Aucune erreur JS, CLS 0, version sans WebGL propre. En revanche, une tâche longue de 446 ms vient de la reconstruction de la rivière, et l'accueil pèse 4,45 Mo sur p1440. |
| 8. Mise en ligne | 3/5 | Le site est public, avec noindex, og:image en JPG 1200×630 et une 404 aux couleurs du lieu, mais il n'y a pas de X-Robots-Tag dans `vercel.json` ni de `?v=` sur `style.css` et `app.js`. |
| 9. Accessibilité | 4/5 | Focus visible contrasté, lien d'évitement, réduction des animations et mode calme respectés, Échap ferme le menu ; seules les cibles de moins de 44 px pèchent. |
| **Total** | **80/100** | |

## Points forts

- L'effet signature est pensé pour le lieu : photo du Poitou sous une eau qui se clarifie au défilement, ronds dans l'eau au curseur, rivière et libellule de bout en bout (`eau.js`, `riviere.js`).
- La bascule « Ouvert toute l'année » (été / hiver) est ludique et accessible : curseur, boutons `aria-pressed`, particules pollen et braises.
- La demande de disponibilité en 5 étapes, avec calendrier et validation, est claire et marquée « Maquette : rien n'est envoyé ».
- Le contenu est honnête : illustrations étiquetées « Illustration », « à compléter » surligné, crédits photo dans le pied de page.
- Le respect du confort est exemplaire : mode calme, `prefers-reduced-motion`, pause des témoignages et du défilement, filet si GSAP manque.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Gel de 446 ms en fin d'ouverture** : accueil, p1440 (1 image de plus de 100 ms, confirmée par une 2e mesure). Le m390 est moins touché (tâche longue de 90 ms). Cause : `assets/js/app.js:46-47` appelle `initRiviere()` puis `ScrollTrigger.refresh()` à la fin de l'intro. `assets/js/riviere.js:52-53` construit alors la table hauteur → longueur avec `getPointAtLength` tous les 24 px. Sur un tracé de 34 000 px (page de 22 000 px à 1440), cela fait environ 1 430 appels, et chacun reparcourt le chemin. Mesuré sans WebGL : 240 ms pour cette seule étape, 481 ms de tâche longue au total. Le calcul est refait à chaque `refresh` (`riviere.js:97`, `app.js:94`, `riviere.js:98`). Correction : échantillonner tous les 150 à 200 px avec une recherche dichotomique dans `longueurA()`. Mieux encore, calculer les points directement à partir des courbes de Bézier déjà connues (`pts`), sans `getPointAtLength`. Lancer ensuite `construire()` dans `requestIdleCallback` après l'intro, et retirer le doublon `load → refresh` de `riviere.js:98`. Effort : moyen.
2. **Titre principal lisible vers 4 s** : accueil, p1440 et m390, première visite de la session. Voir `captures/ouverture-p1440-t3000.jpg` (logo encore seul), `captures/ouverture-p1440-t4000.jpg` (titre lisible), `captures/ouverture-m390-t3000.jpg` et `-t4000.jpg`. Cause : `assets/js/app.js:72-87`. La goutte, les ondes de 1,5 s, le logo flouté, la pause `+=0.25` puis le fondu s'enchaînent, et le titre ne démarre qu'après. Le tout attend en plus les polices (`app.js:91`). Correction : raccourcir les ondes à 0,9 s, supprimer la pause `+=0.25`, lancer le titre en même temps que le fondu du voile (`'<'`) pour qu'il soit lisible avant 2,5 s. Effort : petit.
3. **Cibles tactiles de moins de 44 px** : accueil, organiser et mentions, en m320 à m430. Le bouton Son mesure 32×40 : `assets/css/style.css:142` et `:807`, où le texte masqué laisse seulement le padding. Les repères de carte mesurent 16×29 et 8×14 : `style.css:800-801`, le libellé masqué ne laisse que le point. Le lien « Lire nos avis Google » fait 29 px de haut : `style.css:71` et `:813`. Le lien « Revenir à l'accueil » des mentions fait 22 px. Correction : `min-width: 44px` sur `.outil`, pseudo-élément `::after` de 44×44 centré sur `.repere`, `min-height: 44px; display: inline-flex; align-items: center` sur les liens `.lien` isolés. Effort : petit.
4. **Mise en ligne incomplète** : toutes les pages. Cause : `vercel.json` ne contient pas de bloc `headers`, et `style.css` et `app.js` sont appelés sans `?v=` dans les 3 pages. Correction : ajouter `"headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }]` et `?v=5` sur le CSS et le JS dans `index.html`, `organiser-un-stage.html` et `mentions-legales.html`. Effort : petit.

### Finition

1. **Reflet de la salle coûteux** : accueil, tous formats. Cause : `assets/js/accueil.js:242` modifie le `baseFrequency` d'un `feTurbulence` à chaque image, ce qui oblige à recalculer le filtre SVG sur une image plein cadre. Correction : animer moins souvent (toutes les 3 ou 4 images) ou animer un `feDisplacementMap` via `transform`. Effort : petit.
2. **La libellule passe sur les textes** : accueil, m390, `captures/accueil-m390-19.jpg` (« au-delà » en partie recouvert). Cause : `riviere.js:23-24`, le tracé longe la marge droite à `W - 10` px sur mobile, au-dessus du texte. Correction : sur mobile, réduire la libellule à 40 px et passer son `z-index` sous le contenu (`style.css:176`), ou la masquer sur les sections de texte. Effort : petit.
3. **Mentions légales sans og:image et en `noindex` seul** : `mentions-legales.html`, `<head>`. Correction : aligner sur les autres pages (`noindex, nofollow`, og:image absolue). Effort : petit.
4. **Poids de l'accueil** : 4,45 Mo sur p1440 et 4,91 Mo sur g1920. Correction : vérifier les `sizes` des images 1920 et 2560 (`brume-vue-de-la-maison`, `panorama-clocher-printemps`, `salle-a-manger-table-monastere`) et ne charger la 2560 qu'au-delà de 1920 px. Effort : petit.
5. **Photos du client hétérogènes** : la journée, les chambres et le sauna sont des photos au téléphone, avec des balances des blancs et des cadrages variables, à côté d'illustrations Grok très soignées. Correction : harmoniser la colorimétrie des photos client (légère gradation chaude commune) ou demander au client des photos plus récentes. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 4 s / ≈ 4 s (logo seul à 3 s, titre lisible à 4 s ; intro longue jouée une fois par session) |
| Fluidité p1440 / m390 | 58 i/s / 59,6 i/s (p1440 : pénalité, 1 image > 100 ms confirmée, tâche longue max 446 ms ; m390 : très bien) |
| CLS au chargement (max) | 0 (0,0049 sur la 404) |
| Poids de l'accueil, p1440 / m390 | 4,45 Mo / 2,52 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS (seul le 404 attendu de la page introuvable) ; sans WebGL : photo fixe propre ; réduire les animations : tout est visible, h1 à 0,18 s |
| Débordement horizontal | Aucun, sur tous les formats |
| Sections épinglées | Journée (accueil) et chambres (organiser) : aucun problème aux 8 tailles |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public ; noindex sur les 3 pages ; X-Robots-Tag absent ; robots.txt absent (non pénalisé) ; og:image JPG 1200×630 absolue (sauf mentions) ; `?v=` absent ; 404 personnalisée |

## Vérifications écartées

- Valeurs « h1 » de 5,2 à 7,3 s sur l'accueil (p1280 à g1920, t820, m320, m360) : elles ont été prises avec 5 maquettes en parallèle. Le jugement repose sur les étapes `ouverture-*-tNNNN.jpg` (≈ 4 s), déjà pénalisé au critère 3.
- Invisibles « saisons-texte-hiver », « figcaption.illustration », « v-hiver-txt » : ce sont les textes et vignettes de l'hiver, masqués volontairement tant que la bascule est sur « Été ». Testé avec Playwright : un clic sur « Hiver » les affiche (`opacity: 1`, `captures/inter-saisons-hiver-m390.jpg`).
- « MASQUÉ » sous l'en-tête (pied de page en m360 et m390, « Pour les enseignants… » en m320) : élément pris au vol pendant le défilement sous la barre fixe du haut, sans rien de coupé à l'arrêt.
- Image > 100 ms et 3 images > 50 ms de la 1re mesure m390 : non reproduites à la 2e mesure (59,6 i/s, 0 image > 100 ms).
- Repère de carte 8×14 en m430 : mesuré pendant l'animation `scale` d'apparition (`accueil.js:114`). Sa taille finale reste toutefois sous 44 px, d'où le défaut important n° 3.
- Témoignages de Kim Hurel et François Vergonjeanne : absents des pages publiques du site actuel que j'ai consultées (Ongaro, Molardi, Pommet et Moss y figurent bien). Ils viennent sans doute des avis Google : à confirmer avec le client, mais je ne les compte pas comme inventés.
- Interactions toutes vérifiées avec Playwright, sans erreur JS : menu mobile (8 liens, Échap), bascule été / hiver, carte (repère 3 → fiche « roc »), stages passés (5 → 11), témoignages (2 / 6, pause `aria-pressed`), son, lettre simulée, coupe par étage (fiche « cuisine »), pause du défilement. Formulaire de bout en bout en m390 : erreurs claires à vide et sans date, mois précédent désactivé, jours de 44×44, « Du mercredi 4 novembre 2026 au samedi 7 novembre 2026 : 3 nuits », étapes 2 à 5 puis « Demande prête… rien n'a été envoyé » (`captures/inter-form-fin-m390.jpg`). Le blocage du 1er essai venait du script (5 jours seulement restants en octobre), pas du site.


---

## ateliersources-maquette : corrections de l'étape 2

Commit 1f7be72 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Gel de 446 ms en fin d'ouverture (reconstruction de la rivière) | Important | Table hauteur → longueur calculée directement sur les courbes de Bézier déjà connues (plus aucun `getPointAtLength` dans `construire()`), recalée sur `getTotalLength()` ; doublon `load → refresh` retiré | `assets/js/riviere.js` | Méthode du rapport (lt2, sans WebGL) : tâche longue p1440 568 → 0 ms, m390 82 → 0 ms ; `getPointAtLength` 2 852 appels / 560 ms → 4 / 1 ms ; `ScrollTrigger.refresh()` 281 → 4 ms. Fluidité (navigateur visible) p1440 56,8 → 60 i/s, images > 100 ms 1 → 0, tâche longue max 753 → 0 ms ; m390 59,3 → 60 i/s, > 100 ms 1 → 0 |
| Titre principal lisible vers 4 s | Important | Ondes 1,5 → 0,9 s, pause `+=0.25` supprimée, titre lancé en même temps que le fondu du voile (`'<'`) | `assets/js/app.js` | Étapes d'ouverture p1440 : à 2,0 s logo seul → titre lisible ; m390 idem (`preuve-ouverture-*.jpg`) |
| Cibles tactiles < 44 px (Son 32×40, repères de carte, « Lire nos avis Google » 29 px, « Revenir à l'accueil » 22 px, logo 78×38, bouton Disponibilités 125×40, liens du pied 37 px) | Important | `.outil` `min-width/min-height: 44px` (plancher 40 px mobile retiré) ; `.barre-logo` en flex 44 px ; `.barre-cta` 44 px ; `.repere` ≤ 600 px : 44 px de large, point recentré (même position sur le plan) ; liens isolés (`.citations-nav .lien`, `.legal p > .lien:only-child`, liens du pied) en `inline-flex` 44 px | `assets/css/style.css` | Cibles < 44 px au repos m320–m430 : 136 à 160 → 0 (seuls restent des repères mesurés en pleine animation d'apparition `scale`, 44×44 une fois posés) ; Son 44×44, logo 78×44, avis 288×44, Revenir 137×44, repères 44×44 |
| Mise en ligne incomplète (X-Robots-Tag, `?v=`) | Important | Déjà corrigé à l'étape 1 (vérifié : `vercel.json` porte `X-Robots-Tag: noindex, nofollow`) ; `?v=20261028` → `?v=20261028-2` partout (HTML, imports de modules) | 3 pages + 404 + modules JS | `grep "v=20261028[^-]"` vide ; aucun module chargé deux fois |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Reflet de la salle coûteux (`feTurbulence` à chaque image) | Finition | Finition |
| La libellule passe sur les textes en m390 | Finition | Finition |
| Mentions sans og:image et en `noindex` seul | Finition | Finition |
| Poids de l'accueil 4,45 Mo (p1440) | Finition | Finition |
| Photos du client hétérogènes | Finition | Finition / donnée manquante (photos à fournir) |
| Deux témoignages à confirmer | Contenu | Donnée manquante (à confirmer avec le client) |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px | 0 | 0 |
| Cibles < 44 px (occurrences, m320 / m360 / m390 / m430 / t820) | 160 / 147 / 150 / 136 / 148 | 2 / 1 / 1 / 1 / 1 (repères en animation d'apparition) |
| Éléments couverts | 1 à 3 par format (pied sous l'en-tête fixe en bas de page) | 1 à 6 par format, même nature (pied défilé sous l'en-tête en bas de page, plus haut d'environ 40 px avec les liens de 44 px), plus le titre sous le voile en fondu à p1366 (transitoire) ; aucune barre du bas |
| Épinglage, 8 tailles (journée et chambres) | aucun problème | aucun problème |
| Rendu 1280×720 et 1366×768 | en-tête sur une ligne | en-tête sur une ligne, rien de coupé |
| Gel de fin d'intro (lt2 sans WebGL, p1440 / m390) | 568 / 82 ms | 0 / 0 ms |
| Fluidité p1440 / m390 | 56,8 i/s, 1 > 100 ms (confirmé) / 59,3 i/s, 1 > 100 ms | 60 i/s, 0 / 60 i/s, 0 |
| Titre lisible (étapes d'ouverture) | ≈ 3,5–4 s | ≈ 2 s |
| Erreurs console | seul le 404 attendu de la page introuvable | identique, aucune nouvelle |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 80/100 → nouvelle note 88/100 · bloquants restants : 0
- c1 12 → 13 : l'écran sombre de près de 4 s cité est ramené à environ 2 s.
- c3 11 → 13 : titre lisible vers 2 s et plus aucune image de plus de 100 ms sur p1440.
- c5 12 → 13 : les cibles tactiles trop petites citées sont à 44 px.
- c7 8 → 9 : la tâche longue de 446 ms a disparu ; le poids de 4,45 Mo reste.
- c8 3 → 5 : X-Robots-Tag (étape 1) et `?v=` cohérent sur tout le site.
- c9 4 → 5 : les cibles de moins de 44 px, seul défaut cité, sont corrigées.
