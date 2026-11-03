# will-midoux-maquette

<https://will-midoux-maquette.vercel.app> · audit du 28/10/2026 · dernier commit f19432b du 27/10/2026

## Verdict

**80/100 · À peaufiner · 2 défaut(s) bloquant(s)**

L'univers « cabane dans les bois » est très réussi : logo qui s'embrase, braises, feu qui suit la musique, polaroïds, boîtier de CD en 3D. Toutes les interactions fonctionnent. Deux galeries horizontales épinglées coupent leur contenu en 1280×720, 1366×768 et 1440×900 : les boutons d'achat des disques et le texte des étapes de « Une soirée avec Will ».

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Étincelle, puis logo qui s'embrase, puis forêt de nuit avec la cabane et la photo de Will : l'ouverture est juste pour un artiste country rock et donne envie de défiler. Le passage du logo de l'intro au logo du héros montre deux logos à la fois vers 2 s. |
| 2. Direction artistique et harmonie | 13/15 | Palette nuit, braise, kraft et vert sapin, titres à empattements doux avec une police western pour les chiffres, images chaudes et nocturnes cohérentes entre elles et avec les photos réelles. Les musiciens des images d'ambiance (jeunes, cheveux bouclés) ne ressemblent pas à Will. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, boîtier qui tourne et disque qui sort, galeries horizontales, frise qui s'allume, porte-clés qui se balancent, boutons magnétiques. En revanche, deux épinglages coupent leur contenu et plusieurs `gsap.from` peuvent se rejouer. |
| 4. Expérience ludique et interactions | 9/10 | Lecteur à 3 extraits avec mini-lecteur flottant, panier et récapitulatif de démonstration, réservation simulée, fichier .ics, demande de date en 4 étapes, cartes retournables, FR/EN et vidéos : tout fonctionne. La carte des concerts n'est qu'un schéma statique. |
| 5. Tous les formats | 9/15 | Aucun débordement horizontal. Les galeries épinglées sont coupées sur des formats courants, des textes descendent à 9,6 px sur téléphone et les chiffres du grand compte à rebours se touchent à 320–390 px. |
| 6. Contenu et fiabilité | 9/10 | Discographie, prix, dates et lieux repris des sources réelles (HelloAsso, Gigstarter). « Titre à compléter », « Annulé », « Déjà passées », « Image d'ambiance » et « crédits à confirmer » sont bien marqués, et les mentions légales sont « à compléter ». |
| 7. Technique et performance | 9/10 | Aucune erreur console, CLS au plus 0,03, version sans WebGL et mode calme propres, polices de secours aux mêmes proportions. L'accueil pèse 2,8 Mo sur ordinateur. |
| 8. Mise en ligne | 3/5 | Site public, noindex dans les 4 pages, ?v= identique partout et 404 aux couleurs. Il manque l'en-tête X-Robots-Tag dans `vercel.json`, et l'og:image fait 1200×708 au lieu de 1200×630. |
| 9. Accessibilité | 4/5 | Lien d'évitement, focus visible (2 px flamme), mode calme et « réduire les animations » respectés (titre à 0,2 s), menu mobile qui garde la tabulation. Des textes font moins de 12 px et quelques liens moins de 44 px. |
| **Total** | **80/100** | |

## Points forts

- L'ouverture est une vraie signature : une étincelle sur bois brûlé, puis le logo W qui s'embrase, puis le héros en forêt de nuit, le tout avec un bouton « Passer ». Le titre est lisible à 2,5 s.
- La musique est au centre : 3 extraits jouables, un feu qui réagit au son, un mini-lecteur qui suit le défilement sur téléphone, les liens Spotify, Deezer et Amazon, et les vidéos YouTube chargées au clic.
- Les parcours simulés sont complets et honnêtes : le panier renvoie vers HelloAsso, la réservation et la demande de date sont marquées « démo », et le fichier calendrier est bien généré (`will-2026-11-20-sedan.ics`).
- Le contenu est rigoureux : dates passées et annulées marquées, liste « Ils ont déjà accueilli Will » attribuée au profil Gigstarter, images générées étiquetées « Image d'ambiance ».
- 60 i/s sur ordinateur et sur téléphone, CLS quasi nul, aucune erreur, version FR/EN complète.

## Défauts

### Bloquants

1. **Galerie « Les disques » coupée** : accueil, 1280×720 et 1366×768 (aussi 1000×560 et 1024×640), `captures/epingle-accueil-1-1280x720-50.jpg`, `captures/epingle-accueil-1-1366x768-92.jpg`. Pendant tout le défilement horizontal, les boutons d'achat (« Numérique 2 € », « Numérique 5 € ») et les notes des disques sortent de l'écran de 12 à 41 px. Comme le rail finit sur les dernières cartes, les boutons des disques du milieu ne sont jamais visibles en entier, et la phrase d'introduction passe sous l'en-tête. Cause : `js/home.js:288` épingle `.disco` entier (titre + rail) à `start: 'top top'` ; `css/main.css:348` (`padding-top: clamp(64px, 9vh, 112px)`) et `css/main.css:354` (`.rec` en `clamp(250px, 26vw, 360px)` avec une pochette carrée) donnent une hauteur qui dépend de la largeur et non de la hauteur de l'écran. Correction : faire de `.disco` épinglée une colonne flex de 100svh qui démarre sous `--entete-h` mesurée en JS. Le rail prend `flex: 1; min-height: 0`, et la largeur des cartes est limitée par la hauteur (`width: min(26vw, calc((100svh - var(--entete-h) - 260px)))`). Ajouter un palier `max-height: 800px` qui réduit le titre. Effort : moyen.
2. **Frise « Une soirée avec Will » coupée** : concerts, 1280×720, 1366×768 et 1440×900 (aussi 1000×560 et 1024×640), `captures/epingle-concerts-0-1280x720-50.jpg`, `captures/epingle-concerts-0-1440x900-50.jpg`. En 1280×720, les numéros, titres et textes des étapes restent sous le bas de l'écran pendant tout l'épinglage. En 1440×900, le texte de chaque étape est coupé de 50 px, et le titre passe sous l'en-tête en 1280 et 1366. Cause : `js/concerts-page.js:243` épingle `.evening` (titre + ligne + rail) à `top top`, et `css/main.css:665-666` fixe des figures en `aspect-ratio: 4 / 5` sur une largeur `clamp(260px, 28vw, 380px)`, soit 475 px de haut à 1440. Correction : même structure en colonne flex de 100svh sous l'en-tête, figure en `flex: 1; min-height: 0` (sans ratio imposé) et texte d'étape toujours dans l'écran. Sinon, épingler seulement le rail et garder le titre hors de la zone épinglée. Effort : moyen.

### Importants

1. **Bouton d'achat de l'EP hors écran pendant l'épinglage** : accueil, 1440×900 et 1280×720 (et en dessous), `captures/epingle-accueil-0-1440x900-50.jpg`, `captures/epingle-accueil-0-1280x720-50.jpg`. « Ajouter le CD au panier 7 € » est coupé de 35 px en 1440×900. En 1280×720, le bas du boîtier et la liste des titres sont coupés pendant tout l'épinglage (110 % de la hauteur d'écran). Tout redevient visible après l'épinglage. Cause : `css/main.css:287` (`.ep__pin` en `min-height: 100vh` avec un contenu plus haut), épinglage `js/home.js:266`. Correction : en dessous de 950 px de haut, réduire `.ep__title` (`clamp` sur `vh`) et la liste des 5 titres (interligne), ou ne pas épingler (`big` = largeur ≥ 900 **et** hauteur ≥ 900). Effort : petit.
2. **Textes de moins de 12 px sur téléphone** : m320 à m430. « Image d'ambiance » de la frise à 9,6 px (`css/main.css:759`) et des cartes à 10,9 px (`css/main.css:756`), « Mode calme » à 11,5 px (`css/main.css:188`) et « FR » à 11,8 px (m430). Correction : plancher `font-size: max(12px, …)` sur ces trois règles. Effort : petit.
3. **Grand compte à rebours aux chiffres collés** : concerts, m320 et m390, `captures/concerts-m390-00.jpg`, `captures/concerts-m320-00.jpg`. « 23 21 48 49 » se lit comme une seule suite de chiffres, et les unités ne sont pas alignées sous leurs chiffres. Cause : `css/main.css:642-644` (`gap: clamp(10px, 2vw, 28px)` avec des chiffres jusqu'à 7,5 rem). Correction : sous 560 px, grille `repeat(4, 1fr)` avec `gap: 12px` et chiffres en `clamp(2.2rem, 11vw, 3.4rem)`, ou séparateurs « : ». Effort : petit.
4. **Mise en ligne incomplète** : `vercel.json` ne contient que `cleanUrls` (pas d'en-tête X-Robots-Tag), et `img/og-will.jpg` fait 1200×708. Correction : bloc `headers` avec `X-Robots-Tag: noindex, nofollow` sur `/(.*)`, et image de partage recadrée en 1200×630. Effort : petit.

### Finition

1. **Deux logos à l'écran pendant la sortie de l'intro** : accueil, `captures/ouverture-m390-t2000.jpg`, `captures/ouverture-p1440-t2000.jpg`. Le logo de l'intro s'efface au centre pendant que celui du héros apparaît plus haut. Correction : faire voler le logo de l'intro jusqu'à la position du logo du héros (FLIP), ou n'afficher le héros qu'une fois l'intro effacée. Effort : petit.
2. **Polaroïd qui chevauche la carte « Prochain concert »** : accueil, p1440, `captures/accueil-p1440-00.jpg`. Le bas de la photo floutée passe derrière « Sedan / Chop N'Rock ». Correction : remonter `.hero__print` ou ajouter une marge haute à `.next`. Effort : petit.
3. **Musiciens des images d'ambiance éloignés de Will** : « Le concert » (`img/grok-soiree-3-concert-784.webp`), duo (`img/grok-formule-duo-784.webp`) et 1992 (`img/grok-histoire-1992-club-784.webp`) montrent des jeunes aux cheveux longs ou bouclés, alors que Will porte un chapeau de cow-boy et des lunettes. Ces images sont bien étiquetées « Image d'ambiance ». Correction : lors d'une prochaine génération, silhouettes en chapeau de cow-boy, de dos ou à contre-jour. Effort : petit.
4. **Petites cibles tactiles** : l'adresse électronique du pied de page fait 19 px de haut (`css/main.css:572`), celle du contact 35 px (`css/main.css:561`) et l'indicateur « Descendre » 26×42 px (`css/main.css:260`). Correction : `display: inline-flex; min-height: 44px; align-items: center`. Effort : petit.
5. **`gsap.from` sur des éléments rejouables** : `js/home.js:273`, `js/home.js:331`, `js/booking.js:161` et une trentaine d'autres dans `home.js`, `booking.js` et `concerts-page.js`. Correction : `fromTo` avec des valeurs d'arrivée explicites. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (étapes : intro au logo de 0,5 à 2 s, héros complet à 2,5 s, bouton « Passer ») |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,029 (concerts p1366) ; accueil 0,0003 |
| Poids de l'accueil, p1440 / m390 | 2,80 Mo / 2,18 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune (hors 404 attendu de la page introuvable) ; sans WebGL : braises en 2D, aucune erreur ; réduit : titre à 0,2 s, contenu visible d'emblée |
| Débordement horizontal | aucun (3 pages + 404, 9 formats) |
| Sections épinglées | EP (bouton coupé en 1440×900), disques (coupée en 1280–1366), frise des soirées (coupée en 1280–1440), colonne d'histoire en sticky (légende coupée de 25 à 39 px en 1024–1366), formulaire en sticky sans problème |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui, oui (4 pages), absent, absent (non pénalisé), JPG absolue 1200×708, 20261027 partout, 404 personnalisée |

## Vérifications écartées

- Ouverture « h1 » de 2,6 à 3,2 s par format : prise sous charge, et le h1 est déjà en place derrière l'intro. Les étapes chronométrées seules montrent un héros lisible à 2,5 s.
- Éléments « masqués par l'en-tête » au pied de page et dans le formulaire (liens sociaux, adresse électronique, « Continuer ») : ce sont des captures prises pendant le défilement. L'en-tête passe au-dessus d'un contenu qui défile, et rien n'est inaccessible.
- Cibles de moins de 44 px sur les liens du pied de page (38 px) : la règle `@media (pointer: coarse)` (`css/main.css:172`) les passe à 44 px sur un vrai téléphone, mais la mesure n'émulait pas le tactile.
- « ol.wiz__steps > li 0px » : ce sont les intitulés des étapes inactives, volontairement masqués sur téléphone. L'étape active est affichée.
- `img/grok-formule-electrique-784.webp` : le « manche en trop » vient de la superposition de deux silhouettes de guitaristes. Chaque guitare est cohérente en taille réelle.
- Inventaire des pages : le menu, le pied de page et les ancres ne mènent qu'aux 3 pages mesurées. Les mentions légales sont un bloc dépliable dans le pied de page, et il n'y a pas de route en JS.
- Erreur « ERR_NETWORK_CHANGED » en sans WebGL : incident réseau ponctuel, non reproduit lors de mes passages.


---

## will-midoux-maquette : corrections de l'étape 2

Commit 69de1be (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Galerie « Les disques » coupée | Bloquant | Méthode « Tout tenir dans l'écran » : classe `.is-pinned` posée en JS quand la section est épinglée ; `.disco` en colonne flex de 100svh, `padding-top: var(--entete-h)` (hauteur de l'en-tête mesurée en JS + ResizeObserver), piste en `flex: 1; min-height: 0`. Au-dessus de 820 px de haut, cartes en sous-grille (pochettes de même taille, fiche la plus longue en bas). Sous 820 px, fiche à côté de la pochette, pochette en `min(360px, 100cqh - 30px)`. Sous 600 px de haut (1000×560), pas d'épinglage : défilement horizontal natif, comme sur tablette | home.js, core.js, main.css | coupes de 3 à 41 px en 1000×560 → 1366×768 → 0 aux 8 tailles (preuve-disques-*.jpg) |
| Frise « Une soirée avec Will » coupée | Bloquant | Même méthode : `.evening` en 100svh sous `--entete-h`, piste en `flex: 1`, figure en `flex: 1; min-height: 0` sans ratio imposé (au plus 4/5 par `125cqw`), titre en `min(--fs-h2, 11svh)` | concerts-page.js, main.css | titre sous l'en-tête et images/textes coupés de 8 à 96 px de 1000×560 à 1440×900 → 0 aux 8 tailles (preuve-soiree-*.jpg) |
| Bouton d'achat de l'EP hors écran pendant l'épinglage | Important | `.ep__pin` en 100svh sous `--entete-h`, rangée `minmax(0, 1fr)`, boîtier en `min(100cqw, 100cqh, 460px)`, colonne texte élargie (.85fr / 1.15fr), titre en `min(…, 11svh)`, interlignes des 5 titres en `svh` ; palier `max-height: 640px` | home.js, main.css | bouton coupé de 35 px en 1440×900, liste et boîtier coupés en 1280×720 → tout visible de 1000×560 à 2560×1440 (preuve-ep-*.jpg) |
| Colonne d'histoire en sticky coupée (mesures clés) | Important | `.story__side` en colonne flex, `max-height: calc(100svh - var(--entete-h) - 40px)`, photos réductibles | main.css | légende coupée de 25 à 39 px en 1000×560 → 1366×768 → 0 |
| Textes de moins de 12 px sur téléphone | Important | Plancher `max(12px, …)` sur les règles (pas de variable de taille dans ce site) : `.amb__tag`, légende de la frise, `.count__u`, « Mode calme », « FR/EN », villes de l'encart de la carte | main.css | 6 à 11 par format → 0 (reste `ol.wiz__steps > li` à 0 px, volontairement masqué) |
| Grand compte à rebours aux chiffres collés | Important | Sous 560 px : grille `repeat(4, 1fr)`, `gap: 12px`, chiffres en `clamp(2.2rem, 11vw, 3.4rem)`, unités centrées | main.css | « 23 21 48 49 » collés → 4 colonnes séparées et alignées (preuve-compte-m390-*.jpg) |
| Petites cibles (finition du rapport, cible-44) | Finition | `min-height: 44px` sur les liens du pied, l'adresse du pied et celle du contact ; zone étendue par `::after` sur « Descendre » | main.css | 10 à 11 par format → 1 (« Descendre » mesuré 26×42, zone réelle 44×60 par `::after`) |
| og:image en 1200×708 | Important | Image recadrée au centre en 1200×630 (aucun contenu retiré : la photo et le logo restent entiers) | img/og-will.jpg | 1200×708 → 1200×630 |
| X-Robots-Tag absent | Important | déjà corrigé à l'étape 1 (commit 1bf5958) | — | — |
| ?v= | — | `v=20261028` → `v=20261028-2` partout (HTML, imports de modules) | 4 HTML, 5 JS | aucun `v=20261028` restant, aucun module en double |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Deux logos à l'écran pendant la sortie de l'intro | Finition | finition |
| Polaroïd du héros qui chevauche « Prochain concert » (p1440) | Finition | finition |
| Musiciens des images d'ambiance éloignés de Will | Finition | image Grok |
| `gsap.from` sur des éléments rejouables | Finition | finition |
| Carte des concerts statique | — | effort gros |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats, 3 pages + 404) | aucun | aucun |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 8 / 8 / 8 / 11 / 6 | 0 / 0 / 0 / 0 / 0 (hors `ol.wiz__steps > li`, masqué volontairement) |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 11 / 11 / 11 / 11 / 10 | 1 / 1 / 1 / 1 / 1 (« Descendre », zone étendue par `::after`) |
| Éléments couverts | 2 à 4 par format | 0 à 3 par format, tous « en-tête au-dessus du pied pendant le défilement » (déjà écartés dans le rapport) |
| Disques épinglés (1000×560 / 1024×640 / 1280×720 / 1366×768 / 1440×900 / 1728×1000 / 1920×1080 / 2560×1440) | coupé / coupé / coupé / coupé / ok / ok / ok / ok | ok (non épinglé, défilement natif) / ok / ok / ok / ok / ok / ok / ok |
| Frise épinglée (mêmes tailles) | coupé / coupé / coupé / coupé / coupé / ok / ok / ok | ok aux 8 tailles |
| EP épinglé (mêmes tailles) | bouton, liste ou boîtier coupés de 1000×560 à 1440×900 | contenu entier aux 8 tailles ; seule reste signalée l'image de fond décorative (`.ep__bg img`, agrandie à 115 % et débordant volontairement de la section, signalée avant comme après jusqu'en 2560×1440) |
| Colonne d'histoire en sticky | coupée de 1000×560 à 1366×768 | ok aux 8 tailles |
| Erreurs console | 404 attendu de la page introuvable seulement | identique (aucune nouvelle) |
| Modules chargés deux fois | 0 | 0 |
| Interactions | — | lecteur audio (lecture), ajout au panier depuis l'EP et depuis une carte de disque, tiroir, réservation (démo) et confirmation, demande de date en 4 étapes, menu mobile, FR/EN, mode calme : OK, aucune erreur |

## Note proposée
Ancienne note 80/100 → nouvelle note 87/100 · bloquants restants : 0

- Critère 3 (animations) 11 → 12 : les deux épinglages qui coupaient leur contenu tiennent dans l'écran ; les `gsap.from` restent.
- Critère 5 (formats) 9 → 12 : galeries épinglées entières, textes à 12 px minimum et compte à rebours lisible sur téléphone.
- Critère 8 (mise en ligne) 3 → 5 : X-Robots-Tag (étape 1) et og:image en 1200×630.
- Critère 9 (accessibilité) 4 → 5 : textes à 12 px minimum et cibles à 44 px.
