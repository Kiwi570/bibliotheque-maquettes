# pierre-becq-lanterne-maquette

<https://pierre-becq-lanterne-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 833b7bc du 23/10/2026

## Verdict

**83/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Une maquette d'antiquaire très aboutie : bougie qui s'allume, nom doré, pendule détourée sur boiserie laquée, salle des coups de cœur et frise des siècles épinglées, tout fonctionne sans erreur à 60 i/s. Il reste surtout la mise en ligne (robots.txt, X-Robots-Tag, ?v=) et des finitions mobiles (textes de 11 px, cibles, barre du bas).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Flamme qui s'allume puis s'ouvre en iris sur la boiserie, « Pierre Becq » à la feuille d'or et pendule Empire en vedette : très juste pour un antiquaire, rien d'un modèle tout fait. |
| 2. Direction artistique et harmonie | 12/15 | Laque noire, or, Bodoni Moda italique et Jost tenus sur toutes les pages, images Grok cohérentes et sans défaut ; quelques grands vides sombres (fin de frise, fin de galerie, avant le pied). |
| 3. Animations et effets | 13/15 | 59,6 / 60 i/s sans saccade, ouverture skippable avec titre lisible vers 2,8 s, épinglages, transitions par la bougie, curseur flamme, aimants, frise verticale à balancier sur téléphone. |
| 4. Expérience ludique et interactions | 9/10 | Menu mobile, filtres combinés et vue « Par siècle », sélection avec tiroir, loupe et plein écran, vue à l'échelle, formulaire d'expertise en 4 étapes, son et Calme : tout marche. |
| 5. Tous les formats | 12/15 | Aucun débordement, mais textes de 9,9 à 11 px, liens téléphone et marque sous 44 px, frise coupée à 1000×560 et barre d'action qui reste sur le pied de page de la fiche. |
| 6. Contenu et fiabilité | 9/10 | Pièces et textes repris du site actuel, Senon, e-mail, horaires et mentions bien marqués « à compléter / à confirmer », typographie française soignée. |
| 7. Technique et performance | 9/10 | Aucune erreur console, CLS max 0,059 (/galerie), accueil 2,2 Mo en WebP, polices attendues avant l'ouverture, version sans WebGL propre. |
| 8. Mise en ligne | 2/5 | noindex partout, og:image 1200×630 absolue et 404 aux couleurs bons, mais robots.txt en « Disallow: / », pas de X-Robots-Tag et aucun ?v=. |
| 9. Accessibilité | 4/5 | Focus visible doré, réduire les animations (titre à 0,3 s) et Calme respectés, Calme repris dans le menu mobile ; petits textes et cibles sous 44 px. |
| **Total** | **83/100** | |

## Points forts

- Ouverture à la bougie (1,0 s : nom lisible ; 2,8 s : hero) avec étincelles en canvas, passable au clic ou au clavier, jouée une seule fois par session.
- Salle des « coups de cœur » sous rayons de vitrail et frise « Trois siècles en vitrine » avec année qui défile : deux signatures fortes, déclinées en version verticale sur téléphone.
- Fiche objet très ludique : loupe d'expert, plein écran, vue à l'échelle avec silhouette de 1,70 m, demande de prix préremplie.
- Galerie filtrable (famille + siècle + Lorraine, URL à jour), sélection avec tiroir et toast, formulaires simulés qui valident et confirment.
- Contenus provisoires très bien signalés (badges « à confirmer », liens « à compléter »), mentions légales présentes.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mise en ligne incomplète** : toutes les pages. Cause : `robots.txt:2` contient « Disallow: / » ; `vercel.json:1` ne contient que `cleanUrls`, sans en-tête X-Robots-Tag ; `index.html:25` et `:288-289` (et les autres pages) appellent `site.css`, `objets.js` et les modules sans `?v=`. Correction : `Allow: /` dans robots.txt ; bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)` ; même `?v=` sur site.css, data/objets.js et les scripts propres au site dans les 6 pages. Effort : petit.
2. **Textes de moins de 12 px sur téléphone** : accueil, galerie, fiche, m320 à m430. Cause : `assets/css/site.css:141` (`.nom-marque small` à .62rem = 9,9 px), `:272` (`.etiquette .prix` 11 px), `:513` (`.badge-confirmer` 11 px), `:631` (`.badge-lorraine` 11 px), prix des cartes `.bas .p` 11 px, légende SVG « Nancy » 11 px. Correction : plancher `font-size: max(12px, …)` sur ces surtitres, badges et étiquettes. Effort : petit.
3. **Zones tactiles sous 44 px** : toutes les pages, m320 à m430. Cause : `.lien` (`site.css:114`) sans hauteur minimale (téléphone 117×29, « Faire estimer une succession » 202×29, liens du pied 59×25, fil d'Ariane 60×20), marque de l'en-tête 135×34. Correction : `min-height: 44px; display: inline-flex; align-items: center` sur `.lien`, le fil d'Ariane et `.marque` sous 760 px. Effort : petit.
4. **Frise coupée à 1000×560** : accueil, section `#frise`, `captures/epingle-accueil-1-1000x560-8.jpg`. Cause : `site.css:363` `.frise-scene { height: min(76svh, 720px) }` plus l'en-tête de section et `.frise-piece.bas { top: calc(50% + 56px) }` (`:374`) : les légendes du bas sortent de 13 à 15 px. Correction : palier `@media (max-height: 600px)` qui réduit `.frise-tete` (titre, paragraphe) et la hauteur des vignettes, ou scène en `flex: 1; min-height: 0` dans une section 100svh. Effort : petit.
5. **Barre du bas incomplète sur téléphone** : fiche objet m390 (`captures/objet-m390-07.jpg`, `-zz.jpg`) et accueil. Cause : `assets/js/objet.js:268-269`, l'IntersectionObserver ne masque la barre que sur `[data-actions]` et `#demande`, pas sur le pied ; aucune barre d'action sur l'accueil et la galerie. Correction : observer aussi `.pied` ; ajouter la même barre (« Faire expertiser » + appel) sur l'accueil, masquée sur `#contact` et le pied. Effort : petit.

### Finition

1. **Grands vides sombres** : accueil p1440 après la frise (`captures/accueil-p1440-16.jpg`, environ 400 px vides avant « Trésors de Lorraine »), fin de la galerie (`captures/galerie-p1440-04.jpg`), avant le pied sur /expertise. Cause : espaceur d'épinglage de la frise et marges basses des sections. Correction : réduire `end` du ScrollTrigger de la frise ou la marge basse de la section, resserrer le padding avant le pied. Effort : petit.
2. **Noms de fichiers d'ambiance trompeurs** : `g-*-1x1-*.webp` et `*-16x9-*` font en réalité 1168×784 (3:2). Correction : renommer ou recadrer pour éviter des erreurs de cadrage futures. Effort : petit.
3. **/mentions en « noindex » seul** : `mentions.html:15`. Correction : `noindex, nofollow` comme les autres pages. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1,0 s (nom dans l'intro) puis hero à ≈ 2,8 s / 1,0 s puis ≈ 2,6 s (h1 vidéo 2,59 s / 2,41 s) |
| Fluidité p1440 / m390 | 59,6 i/s / 60 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,059 (/galerie p1280) |
| Poids de l'accueil, p1440 / m390 | 2,16 Mo / 1,48 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 voulue) ; sans WebGL propre ; réduire : titre à 0,3 s, rien de bloqué |
| Débordement horizontal | Aucun |
| Sections épinglées | Salle des coups de cœur : OK à toutes les tailles ; frise : légendes coupées de 13 à 15 px à 1000×560 seulement |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public ; noindex partout (/mentions sans nofollow) ; X-Robots-Tag absent ; robots.txt « Disallow: / » ; og:image JPG 1200×630 absolue ; aucun ?v= ; 404 personnalisée |

## Vérifications écartées

- Heures « h1 » de 4,1 s (p1280) et 5,0 s (g1920) sur l'accueil : prises en parallèle ; la mesure seule (vidéos) donne 2,59 s et 2,41 s.
- « INVISIBLES » `.visionneuse .aide` sur /objet : bulle d'aide qui s'efface volontairement après 4 s (`objet.js:126`) ou au survol, et masquée en impression.
- « MASQUÉ » sur les formulaires, titres et liens en fin de défilement : position de capture où l'élément passe juste sous l'en-tête fixe pendant le défilement ; aucun contenu ne reste caché à l'arrêt (vérifié sur les planches).
- « MASQUÉ » du bouton « Demander le prix » par la barre d'action en m320 : c'est le même bouton, dupliqué dans la barre.
- `ol.progression > li` à 0 px : libellé masqué visuellement de l'étape, pas un texte affiché.
- CLS de 0,042 à 0,059 sur /galerie : sous 0,1.
- Erreur console « 404 » sur la page introuvable : c'est la réponse 404 attendue.
- Logos CNE et insigne de cour d'appel : fichiers du site actuel (`assets/img/site/`), cour d'appel de rattachement signalée « à confirmer » ; pas un logo inventé.


---

## pierre-becq-lanterne-maquette : corrections de l'étape 2

Commit 4e9d9e0 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Mise en ligne incomplète (robots.txt, X-Robots-Tag, ?v=) | Important | Déjà corrigé à l'étape 1 (robots.txt en `Allow: /`, X-Robots-Tag `noindex, nofollow` dans vercel.json) ; versions passées à `?v=20261028-2` partout, imports de modules compris | toutes les pages, modules JS | Une seule version par fichier sur les 6 pages ; `grep "v=20261028[^-]"` vide ; aucun module chargé deux fois |
| Textes de moins de 12 px sur téléphone | Important | `.nom-marque small` à `max(12px, .62rem)` (espacement .24em) ; `.etiquette .prix`, `.badge-confirmer`, `.carte-texte .p`, `.badge-lorraine` à 12 px ; textes de la carte de l'Est à 12 px sous 860 px, cadre de la carte un peu plus large sur téléphone pour que « Allemagne » tienne | `site.css`, `accueil.js` | 8 sélecteurs (9,9 à 11 px, puis 9 px sur la carte) → 0 (reste `ol.progression > li` à 0 px, libellé masqué voulu, écarté par le rapport) |
| Zones tactiles sous 44 px | Important | Sous 860 px, `.lien` avec padding vertical compensé par une marge négative (ligne de texte et soulignement inchangés), fil d'Ariane idem, `.marque` à `min-height: 44px` | `site.css` | 13 cibles par format (m320 à t820) → 0 |
| Frise coupée à 1000×560 | Important | Palier `@media (max-height: 600px)` : tête resserrée (titre 6,4vh, paragraphe sur une ligne), pièces du bas plus proches de l'axe, vignettes à 56 px mini ; `anticipatePin` retiré des deux épinglages | `site.css`, `accueil.js` | 1000×560 : légendes coupées de 13 et 15 px → aucune ; 0 défaut sur 48 mesures d'épinglage (8 tailles) |
| Barre du bas incomplète (fiche sur le pied, absente de l'accueil) | Important | Barre commune `PB.barreAction` : cachée tant qu'un bloc donné est à l'écran, inerte quand cachée, masquée sous le menu ouvert (`html.verrou`), `--barre-bas` = hauteur mesurée (ResizeObserver) au lieu de 76 px. Fiche : cachée sur les boutons, la demande et le pied. Accueil : « Faire expertiser » + appel (actions déjà présentes), cachée sur le héros, le contact et le pied | `base.js`, `objet.js`, `accueil.js`, `site.css` | Fiche m390 : barre sur le pied → cachée ; accueil : visible après le héros, cachée au contact, au pied et menu ouvert ; aucun nouvel élément couvert de m320 à m430 |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Grands vides sombres (après la frise p1440, fin de galerie, avant le pied de /expertise) | Finition | Finition |
| Noms de fichiers d'ambiance trompeurs (`1x1`, `16x9` en 3:2) | Finition | Finition |
| /mentions en « noindex » seul | Finition | Finition |
| « Demander le prix » sous la barre en m320 (/objet) | Note | Écarté par le rapport : même bouton dupliqué dans la barre |
| Éléments « masqués » par l'en-tête pendant le défilement | Note | Écarté par le rapport : position de capture transitoire, rien de caché à l'arrêt |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px (sélecteurs par format, m320 à m430 / t820) | 8 / 7 | 1 (libellé masqué voulu) / 0 |
| Cibles < 44 px (m320 à m430 / t820) | 13 / 12 | 0 / 0 |
| Éléments couverts par la barre du bas | 1 (/objet m320, même bouton, écarté) | 1 (identique) |
| Épinglage aux 8 tailles (salle et frise) | frise coupée à 1000×560 (13 et 15 px) | aucun défaut (48 mesures) |
| Rendu 1280×720 et 1366×768 | en-tête sur une ligne, rien de coupé | identique |
| Erreurs console | 0 (hors 404 voulue) | 0 (hors 404 voulue) |
| Modules chargés deux fois | 0 | 0 |

Preuves : `preuve-frise-1000x560-avant.jpg` / `-apres.jpg`, `preuve-objet-m390-pied-avant.jpg` / `-apres.jpg`, `preuve-accueil-m390-barre.jpg`, `preuve-carte-m360-12px.jpg`.

## Note proposée
Ancienne note 83/100 → nouvelle note 89/100 · bloquants restants : 0
- c5 12 → 14 : textes à 12 px, cibles à 44 px, frise entière à 1000×560 et barre qui ne reste plus sur le pied (plafond à 14, jamais 15).
- c8 2 → 5 : robots.txt, X-Robots-Tag et `?v=` en place (étape 1, vérifiés).
- c9 4 → 5 : petits textes et cibles sous 44 px corrigés.
