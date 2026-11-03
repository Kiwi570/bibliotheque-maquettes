# oppenheimer-maquette

<https://oppenheimer-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 270f94c du 27/10/2026

## Verdict

**80/100 · À peaufiner · 2 défaut(s) bloquant(s)**

C'est une maquette éditoriale très juste pour un psychothérapeute : tache d'encre en WebGL, polaroïd et cachet de cire, étagère de livres en 3D, et des photos noir et blanc homogènes. Deux défauts de mise en page sur ordinateur bloquent l'envoi : le polaroïd chevauche le texte du hero de /teleconsultation, et l'étagère épinglée de l'accueil passe sous l'en-tête en 1280×720.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Goutte d'encre qui ouvre la photo, polaroïd et cachet de cire : l'ouverture est originale et colle au métier, mais reste sobre pour un niveau Awwwards. |
| 2. Direction artistique et harmonie | 13/15 | Papier, bleu nuit et rouge cire, Literata et Instrument Sans bien associées, 38 images Grok noir et blanc parfaitement cohérentes entre elles. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, encre, étagère et frise épinglées réussies, mais l'image du hero apparaît une fraction de seconde avant l'animation d'encre, et l'épinglage de l'étagère est mal calé en 1280×720. |
| 4. Expérience ludique et interactions | 9/10 | Fiches livres, filtres, check-list, test caméra, galerie, étapes, FAQ, formulaire simulé, Urgence et Mode calme : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 8/15 | Polaroïd sur le texte du hero de /teleconsultation de 1280 à 1920 px, étagère coupée en 1280×720, débordement à 320 px sur /le-praticien, surtitres à 11,8 px, cibles sous 44 px, barre du bas visible sur le pied de page. |
| 6. Contenu et fiabilité | 9/10 | Faits sourcés (Doctolib, compteur d'avis daté, presse), « à compléter » bien signalé, mention de maquette ; un sujet de formulaire parle de « psychologie ». |
| 7. Technique et performance | 9/10 | Aucune erreur JavaScript, CLS 0, 1 à 2 Mo par page, bon repli sans WebGL ; une erreur console « unable to create webgl context » dans ce cas. |
| 8. Mise en ligne | 5/5 | Site public, noindex sur chaque page et en X-Robots-Tag, og:image en JPG 1200×630 avec adresse complète, ?v= identique partout, 404 personnalisée. |
| 9. Accessibilité | 4/5 | Mode calme et « réduire les animations » respectés, alt, dialogues natifs, menu fermé par Échap ; cibles tactiles et surtitres trop petits. |
| **Total** | **80/100** | |

## Points forts

- L'ouverture est une vraie signature, liée au métier : une goutte tombe, l'encre s'étale et révèle le cabinet, puis le polaroïd et le cachet « RO » arrivent. Le titre est lisible vers 1,5 à 2 s.
- La série d'images Grok est d'une rare cohérence : même lumière de fenêtre, même grain argentique, aucun visage inventé. Les seules personnes visibles sont le vrai praticien et les mains de l'étape 2, qui sont correctes.
- L'étagère de livres en 3D, filtrable sur /le-praticien, avec comptes à rebours vers les parutions à venir (dates futures réelles), est ludique et sert le propos.
- Le contenu est sérieux et honnête : la mention « ne fait pas de lui un psychologue ni un médecin », les numéros d'urgence 15, 112 et 3114 et le badge « Maquette de démonstration ».
- Les variantes sont propres : sans WebGL, l'image masquée par la tache s'affiche, et le Mode calme comme « réduire les animations » sont respectés.

## Défauts

### Bloquants

1. **Polaroïd sur le texte du hero** : /teleconsultation, p1280, p1440 et g1920, `captures/teleconsultation-p1440-00.jpg`, `captures/teleconsultation-g1920-00.jpg`, `captures/teleconsultation-p1280-01.jpg`. « Posé, régulier et confidentiel » (4e colonne de `.facts--4`) passe sous la légende « Exclusivement en téléconsultation » du polaroïd ; les deux textes se mélangent. Cause : `assets/css/site.css:281` (`.hero__text` sur 7 colonnes) et `assets/css/site.css:284` (`.hero__visual` dès la colonne 7), avec `.hero__card { left: -6% }` (`assets/css/site.css:289`) ; la grille à 4 colonnes `.facts--4` (`assets/css/site.css:610`, `teleconsultation.html:65`) occupe toute la largeur du texte. Correction : limiter `.hero__text .facts--4` à la largeur des colonnes 1 à 6 (`max-width: calc(100% - 7vw)`), ou passer `.facts--4` en 2 × 2 dans le hero ; sinon, ramener `.hero__card` à `left: 4%` sur cette page. Effort : petit.
2. **Étagère épinglée sous l'en-tête en 1280×720** : accueil, 1280×720 (et 1366×768 à 4 px près), `captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-accueil-0-1366x768-50.jpg`. Le surtitre « III Publications » est caché et la première carte de compte à rebours est coupée par l'en-tête. Le lien « Toute la bibliothèque, avec les ouvrages de la famille » passe sous le bouton « Mode calme ». Cause : `assets/js/site.js:441`, épinglage `start: 'center 53%'` d'un bloc plus haut que l'écran utile (titre, comptes à rebours, étagère et pied) ; dans `hPin` (`assets/js/site.js:409`), rien ne tient compte de la hauteur de l'en-tête. Correction : épingler depuis `top top+=var(--header-h)` et réduire la hauteur des livres pour que la scène tienne dans `100svh - --entete-h` (colonne flex, étagère en `flex: 1; min-height: 0`) ; réserver à droite du pied d'étagère la place du bouton « Mode calme » (`padding-right: 170px`). Effort : moyen.

### Importants

1. **L'image du hero apparaît avant l'encre** : accueil, p1440, `captures/ouverture-p1440-t0500.jpg` puis `captures/bande-ouverture-p1440.jpg`. À 0,5 s, l'image de repli s'affiche en entier ; à 1 s, la page est vide ; ensuite seulement, l'encre s'étale. Cause : `.has-gl .stain__fallback { visibility: hidden }` (`assets/css/site.css:288`) n'est activé qu'au chargement de la texture (`assets/js/encre-gl.js:159`). Correction : masquer `.js .stain__fallback` dès le départ et ne le montrer qu'en cas d'échec WebGL ou après un délai de sécurité de 1,5 s (classe `no-gl` posée par `encre-gl.js` dans `catch` et `onerror`). Effort : petit.
2. **Débordement à 320 px** : /le-praticien, m320, `captures/le-praticien-m320-00.jpg` (scrollWidth 341 px). Le mot « Oppenheimer » du titre impose 341 px ; tout le hero déborde, et le bouton du menu comme le Mode calme sont rognés à droite. Cause : `--t-h1` avec un minimum à 2,6rem (`assets/css/site.css:33`) appliqué en ligne sur le h1 (`le-praticien.html`, hero). Correction : `@media (max-width: 360px) { .hero__title { font-size: 2.2rem; } }`, ou `overflow-wrap: anywhere` et `min-width: 0` sur `.hero__text`. Effort : petit.
3. **Textes de moins de 12 px sur téléphone** : toutes les pages, m320 à m430. Les surtitres `.eyebrow`, les `.label` et les légendes sont à 11,84 px. Cause : `--t-label: .74rem` (`assets/css/site.css:39`). Correction : `--t-label: .78rem` (12,5 px) sous 980 px. Effort : petit.
4. **Cibles tactiles sous 44 px** : téléphone. Concerne « Copier » (75×40), les liens « Doctolib » et « Appeler depuis un téléphone » (37 à 40 px), les liens du pied de page (25 px), « formulaire de contact » (28 px) et le menu à 320 px (38×46). Cause : `assets/css/site.css:830` (`.ink-link` avec `padding-block: 8px 4px`), plus les liens de `.footer__col`. Correction : `min-height: 44px; display: inline-flex; align-items: center` sur `.ink-link`, `.copy`, `.linklike` et `.footer__col a`. Effort : petit.

### Finition

1. **Barre du bas visible sur le pied de page** : téléphone, `captures/accueil-m390-zz.jpg`. La barre « Rendez-vous / Appeler » reste affichée au-dessus du pied de page, qui contient déjà ces actions. Correction : la masquer avec un IntersectionObserver sur `.footer` (`assets/css/site.css:218`). Effort : petit.
2. **Ligne de texte coupée sous l'en-tête pendant l'épinglage des étapes** : accueil, 1440×900, `captures/epingle-accueil-1-1440x900-50.jpg`. La fin de « …pas d'accueil en cabinet. » reste à demi visible sous l'en-tête. Correction : décaler le départ de l'épinglage (`assets/js/accueil.js:136`, `start: 'center 52%'`) pour que l'introduction sorte complètement de l'écran, ou l'estomper pendant l'épinglage. Effort : petit.
3. **Visuel « Revue de presse » brut** : accueil, `captures/accueil-p1440-19.jpg`. L'affiche blanche « REVUE DE PRESSE » en grosses capitales tranche avec la finesse du reste. Correction : la recadrer sur le portrait ou la présenter en vignette inclinée comme le polaroïd. Effort : petit.
4. **Sujet de formulaire incohérent** : les 4 pages (`index.html:444`). On y lit « Rendez-vous en téléconsultation de psychologie », alors que le site précise qu'il n'est pas psychologue. Correction : « Rendez-vous en téléconsultation » (à valider avec le client si c'est repris du site actuel). Effort : petit.
5. **Erreur console sans WebGL** : « unable to create webgl context », émise par OGL. Le repli fonctionne. Correction : tester `canvas.getContext('webgl')` avant `new Renderer` (`assets/js/encre-gl.js:93`). Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2 s / 2 s (lisible en partie dès 1,5 s, bandes prises seules) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image > 50 ms) |
| CLS au chargement (max) | 0,0002 |
| Poids de l'accueil, p1440 / m390 | 1,82 Mo / 1,23 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur JS ; sans WebGL, 1 message console mais repli correct ; réduire les animations respecté |
| Débordement horizontal | aucun sur les formats courants ; 341 px à 320 px sur /le-praticien |
| Sections épinglées | étagère de l'accueil coupée en 1280×720 (et en 1000×560 et 1024×640) ; étapes de visio, frise et colonnes collantes correctes |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public, noindex sur les 3 pages, X-Robots-Tag noindex, robots.txt absent (non pénalisé), og:image JPG 1200×630 absolue, ?v=20261027 partout, 404 personnalisée |

## Vérifications écartées

- « MASQUÉ » au pied de page (liens du pied, boutons de la dernière section sous l'en-tête) : c'est le contenu qui défile normalement sous l'en-tête fixe au moment de la capture, pas un élément bloqué.
- « MASQUÉ par div.dock » à l'ouverture (`p.lead`, prix, boutons en m360 à t820) : ce contenu se trouve sous la ligne de flottaison et derrière la barre du bas, et il est accessible en défilant.
- Section des étapes de visio (`#distance`), titre et introduction « sous l'en-tête » de 1024 à 1920 px : l'épinglage commence sur les étapes. Les étapes, l'image, « Étape n sur 4 » et le lien restent entièrement visibles (`captures/epingle-accueil-1-1280x720-50.jpg`). Il ne reste qu'une demi-ligne coupée en 1440×900, classée en finition.
- Avis Google « 280 » en m390 et « 303 » en g1920, contre 305 dans le code : c'est le compteur animé, capturé en cours de défilement. La valeur est sourcée (« d'après le compteur du site actuel, octobre 2026 »).
- Le rond avec un point qui chevauche du texte sur plusieurs captures d'ordinateur : c'est le curseur personnalisé, laissé à la position de la souris.
- Mains de `etape-2-lien.webp`, vérifiées en taille réelle : cinq doigts de chaque côté, prise du téléphone plausible.
- Pas de « Copier » qui passe à « Copié » en mode sans affichage : la confirmation dépend du presse-papiers, qui n'est pas fiable sans navigateur visible.
- Sous les 1000×560 et 1024×640, l'étagère et la colonne collante de la FAQ de /teleconsultation dépassent aussi. Ce ne sont pas des formats courants, et ce point est couvert par le bloquant n° 2.


---

## oppenheimer-maquette : corrections de l'étape 2

Commit 3e5d384 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Polaroïd sur le texte du hero de /teleconsultation (p1280 à g1920) | Bloquant | Au-dessus de 980 px, repères du hero en 2 × 2 limités à 76 % de la colonne texte : le polaroïd commence à 84 % de cette largeur, donc il reste un écart d'au moins 8 % | assets/css/site.css | « Posé, régulier… » sous la légende → aucun chevauchement en p1280, p1440 et g1920 (`preuve-avant/apres-tele-*`) |
| Étagère épinglée sous l'en-tête en 1280×720 (et 1000×560, 1024×640, 1366×768) | Bloquant | Méthode « Tout tenir dans l'écran » : scène `.is-stage` en 100svh et en colonne flex, `padding-top: var(--entete-h)` mesuré en JS (ResizeObserver), étagère en `flex: 1; min-height: 0` avec `container-type: size` et livres en `min(250px, 100cqh - 90px)`, épinglage `top top` sans `anticipatePin`, paliers `max-height` 820 et 600 px, place réservée à droite du pied d'étagère pour le bouton Mode calme | assets/js/site.js, assets/css/site.css | surtitre, comptes à rebours et première carte sous l'en-tête → rien sous l'en-tête aux 8 tailles. Le signal « sort de l'écran » à 8 % vient du retard du défilement fluide : en position stabilisée, la scène tient (en 1280×720, livres de 368 à 618 px et pied à 702 px) |
| L'image du hero apparaît avant l'encre | Important | `.js .stain__fallback` masquée dès le départ. `no-gl` est posée en cas d'échec de WebGL (catch, contexte absent, image en erreur) ou au bout de 1,5 s par sécurité (site.js) | assets/css/site.css, assets/js/encre-gl.js, assets/js/site.js | image de repli `hidden` à 0,5 s et 1 s avec WebGL. Sans WebGL, elle est visible dès 0,5 s |
| Débordement à 320 px sur /le-praticien | Important | Sous 380 px : titre du hero en `min(var(--t-hero), 11.6vw)`, `.hero__text` en `min-width: 0`, bouton du hero qui passe à la ligne, `.facts` sur une colonne (c'était `1fr 1fr`, avec des mots longs qui imposaient 321 px) | assets/css/site.css | scrollWidth 341 → 320 |
| Textes de moins de 12 px sur téléphone | Important | `--t-label: max(12px, .74rem)` et plancher `max(12px, …)` sur les jours des comptes à rebours, les étiquettes « À paraître », les cachets de la frise, `brand__role` et la légende du polaroïd. Dos des livres à 12 px | assets/css/site.css | 104 à 208 textes par format → 0 (m320 à t820) |
| Cibles tactiles de moins de 44 px | Important | Sous 980 px : « Copier » à 44 px, `.ink-link` et `.linklike` dans le texte agrandis par padding avec marge négative (l'interligne ne change pas), liens du pied en flex de 44 px, burger en `flex: none` et `min-width: 44px` | assets/css/site.css | 22 à 25 cibles par format → 5 (cases de la check-list seulement) |
| Barre du bas visible sur le pied de page (et sur l'ouverture) | Finition, règle récurrente | IntersectionObserver sur `.hero` et `.footer` (classe `dock-off`), barre absente sur la 404 et le menu ouvert, `--barres-h` mesurée en JS et réservée en bas du pied de page | assets/js/site.js, assets/css/site.css | éléments couverts par la barre : 1 à 3 par format → 0 de m320 à t820 |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Cases de la check-list à 24 × 24 px | Important (partiel) | Le libellé entier, haut d'environ 80 px, est cliquable. Je n'ai pas agrandi la case pour ne pas changer son dessin |
| Demi-ligne coupée sous l'en-tête pendant l'épinglage des étapes (1440×900) | Finition | Finition. L'audit a écarté le reste des signaux sur `#distance` |
| Visuel « Revue de presse » brut | Finition | Finition |
| Sujet de formulaire « téléconsultation de psychologie » | Finition | Finition, texte à valider avec le client |
| Message console « unable to create webgl context » sans WebGL | Finition | Finition : le repli fonctionne et l'image s'affiche |
| Mise en ligne (X-Robots-Tag, ?v=, 404, og:image) | — | Déjà corrigé à l'étape 1 |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal | 341 px en m320 (/le-praticien), 0 ailleurs | 0 sur tous les formats |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 104 / 123 / 128 / 126 / 208 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 à t820) | 25 / 22 | 5 / 5 (cases de la check-list) |
| Éléments couverts par la barre du bas | 1 à 3 par format | 0 |
| Étagère épinglée, sous l'en-tête | 1000×560, 1024×640, 1280×720, 1366×768 | aucune taille |
| Autres épinglages (étapes `#distance`, FAQ, colonne du praticien) | signaux écartés ou en finition dans le rapport | inchangés |
| Erreurs console | 1 (la 404 volontaire) | 1 (la même) |
| Modules chargés deux fois | 0 | 0 |
| Interactions (fiches livres, filtres, menu, Échap, FAQ, formulaire, Urgence, check-list, Mode calme) | OK | OK, aucune erreur JS |

La réserve du bas est passée du `body` au `.footer` (plus de bande papier sous le pied sombre). La mesure « après » a été refaite en entier avec ce changement, et les chiffres sont identiques. J'ai aussi fait un contrôle dédié de m320 à m430 sur les 3 pages, en défilant toute la page. La barre et le bouton Mode calme ne passent sur du contenu qu'en cours de défilement, et ce contenu reste atteignable. En fin de page, ils ne recouvrent rien.

## Note proposée
Ancienne note 80/100 → nouvelle note 89/100.
- Critère 3, 11 → 13 : le flash de l'image avant l'encre et le calage de l'étagère sont corrigés.
- Critère 5, 8 → 14 : le polaroïd, l'étagère, le débordement à 320 px, les surtitres, les cibles et la barre du bas sont corrigés.
- Critère 9, 4 → 5 : les cibles et les surtitres sont corrigés (5 est le maximum).

Bloquants restants : 0.
