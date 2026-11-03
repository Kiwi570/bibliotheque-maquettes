# talon-libre-maquette

<https://talon-libre-maquette.vercel.app> · audit du 28/10/2026 · dernier commit e674da8 du 25/10/2026

## Verdict

**81/100 · À peaufiner · 2 défaut(s) bloquant(s)**

Maquette élégante et cohérente (neige, encre, rouge, trace de télémark en fil rouge), avec de vraies photos du client et des interactions qui fonctionnent toutes. Deux bloquants faciles à lever : l'image Grok de la chaussure « talon libre » est un objet impossible, et le récapitulatif de réservation épinglé de l'Annexe sort de l'écran en 1280×720 et 1366×768.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture signée (trace rouge dessinée, puis poudreuse à l'aube et titre en italique), ton de magazine montagne, mais peu de moments vraiment spectaculaires après le hero. |
| 2. Direction artistique et harmonie | 12/15 | Palette froide et rouge maîtrisée, serif fin et sans-serif bien associés, images Grok cohérentes entre elles ; la chaussure de télémark est fausse et le skieur n'est pas en position de télémark. |
| 3. Animations et effets | 12/15 | 60 i/s sur portable et téléphone, titre lisible à 2 s, citation révélée mot à mot, bandeau horizontal épinglé, altimètre et comparateur animé ; peu de micro-interactions au-delà des boutons magnétiques. |
| 4. Expérience ludique et interactions | 9/10 | Comparateur chalet/Annexe, onglets Hiver/Été, galerie plein écran au clavier, calendrier des semaines qui met à jour le récapitulatif, formulaire en 3 étapes avec validation, FR/EN et son : tout fonctionne. |
| 5. Tous les formats | 11/15 | Aucun débordement horizontal, mais le récapitulatif épinglé de l'Annexe est coupé en 1280×720 et 1366×768, le texte du manifeste sort à 1000×560 et plusieurs cibles font moins de 44 px. |
| 6. Contenu et fiabilité | 9/10 | Images IA marquées « Illustration », livre d'or vide assumé, mentions légales et numéro de meublé de tourisme marqués « à compléter » ; quelques noms et chiffres (chef, traiteur, domaine) à faire confirmer. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, CLS au chargement ≤ 0,008, version sans WebGL propre ; l'Annexe pèse 5 Mo en p1440. |
| 8. Mise en ligne | 3/5 | Public, noindex dans chaque page, og:image 1200×630 en adresse complète, 404 soignée ; en-tête X-Robots-Tag absent de `vercel.json` et aucun `?v=` sur le CSS et le JS. |
| 9. Accessibilité | 4/5 | Lien d'évitement, focus visible, comparateur au clavier, « réduire les animations » respecté ; cibles de 26 à 34 px de haut et légendes à 11,5 px. |
| **Total** | **81/100** | |

## Points forts

- Ouverture très juste pour un chalet de télémarkeurs : la trace rouge se dessine, puis la poudreuse et les deux traces apparaissent derrière « Talon libre, esprit libre. » (`captures/bande-ouverture-p1440.jpg`).
- Les vraies photos du chalet et de l'Annexe portent les pages intérieures. Les images Grok d'ambiance (services, linge, veillée, routes de nuit) partagent la même lumière.
- La réservation simulée est la plus aboutie : calendrier par semaine, récapitulatif avec acomptes et barre d'annulation, puis formulaire en 3 étapes validé.
- Fil rouge graphique sur tout le site (trace de ski, altimètre en bas à droite, carte d'accès en pointillés) et une 404 « Hors piste » dans le ton.
- Honnêteté du contenu : « à compléter » visibles, livre d'or qui annonce attendre de vrais avis, mention « Maquette : aucune donnée n'est envoyée ».

## Défauts

### Bloquants

1. **Image Grok de la chaussure « talon libre » : objet impossible** : accueil, section « Pourquoi Talon Libre », tous formats, `captures/epingle-accueil-0-1280x720-50.jpg`. La chaussure est fixée par l'arrière, la pointe est en l'air et un câble pend du bout du pied : c'est l'inverse du télémark (pointe fixée, talon libre), et le client est télémarkeur. Cause : `assets/img/grok/telemark-talon-1x1-*.webp`, appelée dans `index.html:104`. Correction : régénérer l'image avec la consigne de `notes.json`, ou retirer la vignette `figure.detail` en attendant. Effort : petit.
2. **Récapitulatif de réservation épinglé coupé en 1280×720 et 1366×768** : /annexe, section Tarifs, `captures/epingle-annexe-1-1280x720-92.jpg`, `captures/epingle-annexe-1-1366x768-92.jpg`. Le bouton « Demander ces dates » sort de 20 px en 1280×720 et la note de 28 px en 1366×768. En fin de course, le titre passe sous la sous-navigation. Cause : `assets/css/main.css:591`, `.summary { position: sticky; top: calc(var(--header-h) + 70px) }`, sans hauteur maximale alors que le bloc est plus haut que l'écran restant. Correction : `top: calc(var(--header-h) + var(--sub-h) + 12px); max-height: calc(100svh - var(--header-h) - var(--sub-h) - 24px); overflow-y: auto; overscroll-behavior: contain;` (mesurer `--sub-h` en JS), ou resserrer le bloc sous 800 px de haut (barre d'annulation et `dl` repliés). Effort : petit.

### Importants

1. **Manifeste épinglé coupé à 1000×560** : accueil, `#telemark`, `captures/epingle-accueil-0-1000x560-50.jpg`. Le paragraphe sort de 12 px. Cause : `assets/css/main.css:302`, la citation `clamp(1.9rem, 3.7vw, 3.6rem)` ne tient pas compte de la hauteur. Correction : plafonner aussi avec `vh` (`min(3.7vw, 6.2vh)`) ou réduire la marge basse de la citation sous 640 px de haut. Effort : petit.
2. **En-tête X-Robots-Tag absent** : `vercel.json:1-3` ne contient que `cleanUrls`. Correction : ajouter `"headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }]`. Effort : petit.
3. **Aucun `?v=` sur le CSS et le JS du site** : `index.html:26` et `index.html:369`, ainsi que `annexe.html` et `chalet.html`. Correction : ajouter `?v=1` identique sur `main.css`, `data.js`, `images.js`, `placeholders.js`, `main.js`, `lightbox.js`, `webgl.js` et `booking.js`. Effort : petit.
4. **Cibles tactiles trop petites sur téléphone** : m320 à m430. Le logo fait 34 px de haut, les liens « Grand Massif l'hiver » et « Itinéraire vers… » 26 px. Cause : `assets/css/main.css:151` (`.brand`) et `:748` (`.link-out`). Correction : `min-height: 44px; display: inline-flex; align-items: center` sur `.brand` et `.link-out`. Effort : petit.

### Finition

1. **Le skieur de l'image Grok n'est pas en position de télémark** : accueil, `assets/img/grok/telemark-silhouette-4x5-*.webp`. La légende dit « skieur de télémark », mais la posture est celle d'un skieur alpin, sans genou fléchi ni talon levé. À régénérer en même temps que la chaussure (« one knee bent low, rear heel lifted off the ski »). Effort : petit.
2. **Légendes « Illustration » et texte de la carte à 11,5 px** : `assets/css/main.css:798` (`.media .illus { font-size: .72rem }`) et le `<text>` SVG de la carte d'accès. Correction : `.75rem` minimum. Effort : petit.
3. **Le comparateur se fait reprendre par son animation d'entrée** : si l'on utilise le clavier pendant l'animation, celle-ci écrase la valeur. Cause : `assets/js/main.js:505`, le `keydown` ne fait pas `gsap.killTweensOf(state)` comme le `pointerdown`. Effort : petit.
4. **Poids de l'Annexe : 5 Mo en p1440 et g1920** : beaucoup de photos en 1920 px chargées dans des cases de 400 px. Vérifier l'attribut `sizes` dans `assets/js/placeholders.js`. Effort : petit.
5. **Contenus à faire confirmer par le client** : nom du chef (Christophe Saponara), traiteur « Mijoté », « 16 attentions comprises », chiffres du domaine (142 pistes, 64 à Flaine, etc.) et numéro suisse en en-tête. Ils semblent venir du site actuel, mais doivent être validés avant envoi. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2 s / 2 s (étapes ; voile de trace rouge 0 à 1,5 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,0079 (accueil p1280) |
| Poids de l'accueil, p1440 / m390 | 2,89 Mo / 1,67 Mo (Annexe 5,03 Mo en p1440) |
| Erreurs console, sans WebGL, réduire les animations | aucune sur les pages (seul le 404 attendu sur la page introuvable) ; sans WebGL propre ; réduit respecté |
| Débordement horizontal | aucun |
| Sections épinglées | accueil `#telemark` : texte coupé de 12 px à 1000×560 ; /annexe `aside.summary` : bouton coupé en 1280×720, note coupée en 1366×768 ; les autres sont correctes |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex nofollow dans les 3 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 en adresse complète · `?v=` absent · 404 personnalisée |

## Vérifications écartées

- « h1 » à 2,0–2,8 s (accueil m430 et p1280, chalet t820 et g1920, 404) : ces valeurs ont été prises pendant que 5 maquettes tournaient en parallèle. Les bandes d'ouverture prises seules montrent le titre lisible à 2 s.
- Éléments « MASQUÉ » sous l'en-tête, notés « pied » (liens du pied de page, « Choisissez vos dates », « Continuer », « Une question ? ») : ils sont capturés en bout de défilement, quand le contenu passe normalement sous l'en-tête fixe. Rien n'y reste bloqué.
- `img sort de l'écran` sur `#telemark` de 1280×720 à 1366×768 : c'est l'image décalée par la parallaxe, pas un texte. Ce n'est pas un défaut.
- /annexe `aside.summary`, « h3 sous l'en-tête » à 1000×560 et 1024×640 : ces formats ne sont pas courants, et c'est la fin normale de l'épinglage. Le problème réel est couvert par le bloquant n° 2.
- Erreur « Failed to load resource 404 » sur `/zz-page-introuvable-audit` : c'est le statut attendu de la page 404 elle-même.
- Marque visible sur une photo de la galerie du chalet (`captures/inter-lightbox-p1440.jpg`) : il s'agit d'une vraie photo du client, reprise du site actuel, et non d'une image Grok.


---

## talon-libre-maquette : corrections de l'étape 2

Commit 177706d (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Récapitulatif de réservation épinglé coupé en 1280×720 et 1366×768 | Bloquant | Méthode « Tout tenir dans l'écran » adaptée au `sticky` : `--sum-top` = `--header-h` + `--sub-h` (hauteur de la sous-navigation mesurée en JS, ResizeObserver) + 12 px, ramené sous la seule sous-navigation quand l'en-tête se masque ; `max-height: calc(100svh - var(--sum-top) - 12px)` avec défilement interne en dernier recours (`data-lenis-prevent`) et boutons collés en bas de la case ; palier `min-width: 961px and max-height: 900px` qui resserre marges, interlignes et tailles. Pas de « 100vh moins N px » | `assets/css/main.css`, `assets/js/main.js` | Annexe 1280×720 : bouton coupé de 20 px → contenu 539 px pour 573 disponibles, en-tête visible ; 1366×768 : note coupée de 28 px → 542/621. Chalet 1280×720 : 555/573. Plus rien de coupé aux 8 tailles (`preuve-recap-*`) |
| Manifeste épinglé coupé à 1000×560 | Important | Sur portable (≥ 861 px) : section `min-height: 100svh` en colonne flex centrée, haut réservé par `var(--header-h)` ; citation plafonnée à `min(3.7vw, 6.2vh)` ; palier `max-height: 640px` (citation à 5,6vh, marges réduites, colonne d'images à la hauteur disponible, sans recadrer les images) | `assets/css/main.css` | paragraphe coupé de 12 px → texte de 135 à 495 px pour 560 (`preuve-manifeste-*`) |
| Cibles de moins de 44 px | Important | `.brand` en `min-height: 44px` ; en tactile `main a.link-trace`, `.contact-line a`, `.site-footer a` en `inline-flex` 44 × 44 px minimum, `.link-out` à 44 px de haut, boutons FR/EN à 44 px de large | `assets/css/main.css` | 77 → 0 cibles (m320 à t820, 4 pages) |
| Textes de moins de 12 px (légende « Illustration », texte de la carte) | Finition (traitée avec les textes 12 px) | `.media .illus`, `.ph-tag` et la mention des semaines passées à `max(12px, .75rem)` ; `.map text.dim` à 12 px | `assets/css/main.css` | 30 → 0 textes < 12 px |
| X-Robots-Tag absent, `?v=` absent | Important | Déjà corrigé à l'étape 1 (11cf799). Versions passées à `?v=20261028-2` sur les 4 pages | `*.html` | même version sur les 8 fichiers propres au site, aucune ancienne référence |

Réservation vérifiée après corrections (1280×720, 1366×768, m390) : choix d'une semaine, récapitulatif et montant, « Demander ces dates » qui préremplit les dates, 3 étapes avec validation (nom et e-mail exigés), envoi simulé jusqu'à « Demande prête à partir », appartement 8 personnes, dates libres du chalet, barre de sélection sur téléphone. Aucune erreur de console.

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Chaussure « talon libre » impossible (`telemark-talon-1x1`) | Bloquant | Image Grok, à régénérer (non touchée) |
| Skieur pas en position de télémark | Finition | Image Grok / finition |
| Comparateur repris par son animation au clavier | Finition | Finition |
| Poids de l'Annexe (5 Mo en p1440) | Finition | Finition |
| Contenus à faire confirmer (chef, traiteur, chiffres du domaine) | Finition | Donnée client |
| Carte d'accès sur téléphone : le schéma SVG se réduit avec l'écran (libellés à environ 10 px réels à 320 px) | Finition | La taille calculée est à 12 px ; une mise à l'échelle des libellés demanderait de revoir le schéma |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats) | 0 | 0 |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 6 / 6 / 6 / 6 / 6 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 15 / 15 / 15 / 15 / 17 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts | 33, tous « pied » (fin de défilement sous l'en-tête fixe, écartés dans le rapport) | 35, mêmes cas « pied » ; aucun par une barre du bas |
| Épinglage `#telemark` | texte coupé de 12 px à 1000×560 | texte entier ; seule l'image en parallaxe passe 4 à 8 px sous l'en-tête à 8 % (parallaxe, écartée dans le rapport) |
| Épinglage récapitulatif Annexe | bouton −20 px (1280×720), note −28 px (1366×768), h3 sous l'en-tête à 92 % (1000×560, 1024×640) | rien de coupé aux 8 tailles |
| Épinglage récapitulatif Chalet | non détecté (plus haut que sa colonne) | rien de coupé ; à 92 %, h3 sous l'en-tête en fin de colonne (fin normale de l'épinglage, comme écarté pour l'Annexe dans le rapport) |
| Erreurs console | seul le 404 attendu de la page introuvable | identique |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 81/100 → nouvelle note 87/100 (c5 11 → 14 : récapitulatif épinglé, manifeste à 1000×560 et cibles de 44 px corrigés ; c8 3 → 5 : X-Robots-Tag et `?v=` corrigés à l'étape 1 ; c9 4 → 5 : cibles de 44 px et légendes à 12 px) · bloquants restants : 1 (image Grok de la chaussure)


## Images Grok définitives (29/10)

Commit 8c16ede (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| `grok/telemark-talon-1x1-{600,784}.webp` | Chaussure impossible (fixée par l'arrière) | 1:1 recadré de y=110 à 894 : talon levé, soufflet et fixation visibles ; 784×784 et 600×600 (manifeste `images.js` passé de 784×1168 à 784×784) | data-alt FR « Chaussure de télémark talon levé, pointe tenue dans la fixation, sur un ski dans la poudreuse au lever du jour » + data-alt-en | 1440×900, 1920×1080, 1366×768, 1000×560, 390×844 : image chargée et nette, 0 erreur console, 0 réponse 404, CLS au chargement ≤ 0,0011 ; les décalages au défilement viennent uniquement des sections épinglées (`.manifest`, `.hscroll`), même valeur qu'avant mesurée sur le commit précédent (2,437 avant / 2,437 après en 1440×900) ; versions `?v=20261029` partout |

Note : 87/100 → 88/100 (c2 +1 : chaussure corrigée ; skieur toujours pas en position de télémark) · bloquants : 1 → 0 · Prête à envoyer
