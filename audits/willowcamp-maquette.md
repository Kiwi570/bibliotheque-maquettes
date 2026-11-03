# willowcamp-maquette

<https://willowcamp-maquette.vercel.app> · audit du 28/10/2026 · dernier commit 920eb90 du 27/10/2026

## Verdict

**77/100 · À peaufiner · 1 défaut bloquant**

Direction artistique « carnet d'herbier » très juste pour un camping nature, avec de vraies photos du camp, des interactions qui marchent toutes et une fluidité de 60 i/s. Le menu mobile coupe ses langues et son bouton « Réserver » de 360 à 430 px, et plusieurs finitions (libellés de la vue en coupe, titre des roulottes sous la ligne de flottaison, `?v=`, 404) restent à reprendre.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Logo dessiné à l'ouverture, rideau de saules, photo aérienne où l'eau répond au toucher, nuit aux lucioles : original et juste pour le lieu, mais une première impression douce plus que saisissante. |
| 2. Direction artistique et harmonie | 12/15 | Fraunces, Karla et écriture manuscrite, papier, saule et rouille cohérents sur les 3 pages et les 3 langues, photos réelles homogènes ; 8 visuels provisoires peints en canvas, fougères décoratives sur le texte à 1440 px et grands vides entre sections. |
| 3. Animations et effets | 12/15 | Titre lisible à 2,5 s, 60 i/s sans saccade, tracés DrawSVG, morphing de l'échantillonnier, vélo sur son chemin, galerie épinglée, loupe ; les libellés de la vue en coupe n'apparaissent qu'une fois sortis de l'écran et se chevauchent. |
| 4. Expérience ludique et interactions | 9/10 | Plan à zones et loupe, nuancier des cabanes, simulateur de séjour avec calendrier et réservation simulée, balades, son, mode calme, FAQ, copier : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 8/15 | Menu mobile coupé de 360 à 430 px (bloquant), tableau et adresse e-mail qui débordent à 320 px, titre des roulottes sous la ligne de flottaison en 1280×720, cibles de 23 à 40 px et textes à 11,8 px. |
| 6. Contenu et fiabilité | 8/10 | Faits repris du site actuel, « à compléter » et « à confirmer » bien marqués, incohérences listées dans les notes ; apostrophes droites et espaces sécables avant « : », mentions légales encore à compléter. |
| 7. Technique et performance | 9/10 | Aucune erreur console, aucun lien cassé, CLS 0, 2,5 à 3 Mo, repli sans WebGL propre, polices préchargées avant l'ouverture. |
| 8. Mise en ligne | 3/5 | Public, noindex partout (FR, NL, EN), X-Robots-Tag, og:image JPG 1200×630 absolue ; aucun `?v=` sur le CSS et le JS du site, page 404 générique de Vercel. |
| 9. Accessibilité | 4/5 | Focus visible, réduire les animations et mode calme respectés, nuancier et zones du plan au clavier ; cibles tactiles et textes trop petits sur téléphone. |
| **Total** | **77/100** | |

## Points forts

- Univers « carnet de terrain » cohérent : croquis à la plume, scotch, tirages photo, notes manuscrites, herbier des animaux.
- Vraies photos du camp, des animaux et des roulottes, sans image IA ni filigrane.
- Interactions nombreuses et utiles : plan interactif avec fiches et loupe, simulateur de prix (réductions, chien, ménage) avec confirmation « aucune réservation envoyée », nuancier des cabanes.
- Trois langues complètes, sans débordement en NL ni EN.
- 60 i/s sur portable et téléphone, CLS nul, mode calme et réduire les animations bien gérés.

## Défauts

### Bloquants

1. **Menu mobile coupé** : toutes pages, m360, m390, m430, `captures/inter-menu-m390.jpg`, `captures/inter-menu-m360.jpg`. Les liens de langue et le bouton « Réserver mon séjour » héritent de la taille des grands liens du menu (30 à 34 px) : « English » sort de l'écran (droite à 504 px pour 360 px de large) et le bouton est coupé. Cause : `assets/css/style.css:232`, `.menu-mobile a { font-size: clamp(1.9rem, 8vw, 2.6rem) }` vise aussi `.menu-mobile__bas`. Correction : restreindre à `.menu-mobile ol a`, puis `.menu-mobile__bas .langues a { font-size: 1rem }` et laisser le `.bouton` à sa taille normale, `max-width: 100%`. Effort : petit.

### Importants

1. **Vue en coupe des roulottes : libellés tardifs et superposés** : /roulottes, p1280 à g1920, `captures/roulottes-p1440-02.jpg`, `captures/inter-coupe-p1440.jpg`. Les libellés du haut (« petite salle de douche », « cuisine équipée ») n'atteignent l'opacité 1 qu'une fois sortis de l'écran ; « cuisine équipée : vaisselle et ustensiles » passe sous « petite salle de douche » (24 px de chevauchement à 1440). Cause : `assets/js/roulottes.js:125` et `:129` (libellés à la fin d'un scrub qui se termine à `bottom 55%`), positions `roulottes.html:185` et `:187`, `assets/css/style.css:571`. Correction : faire apparaître les libellés une fois (`toggleActions` ou `once: true`, départ `top 60%`) au lieu du scrub, déplacer « cuisine équipée » vers `--x: 30%` ou limiter `max-width` à 11em. Effort : petit.
2. **Titre « Les roulottes » sous la ligne de flottaison** : /roulottes, p1280, p1366, p1440, `captures/roulottes-p1280-00.jpg`, `captures/roulottes-p1440-00.jpg`. À 1280×720 seul le haut du « L » est visible au premier écran. Cause : `assets/css/style.css:553`, photo `height: clamp(360px, 62vw, 720px)` sans tenir compte de la hauteur d'écran. Correction : `height: min(62vw, 100svh - var(--entete) - 14rem)` ou carte de titre posée sur la photo dès 1024 px. Effort : petit.
3. **Débordements à 320 px** : accueil, m320, `captures/accueil-m320-05.jpg`, `captures/accueil-m320-20.jpg`. Dernière colonne du tableau « Emplacement véhicule » coupée (« 5 € » rogné) et adresse e-mail qui sort de la carte « Nous trouver » (droite à 330 px). Cause : `assets/css/style.css:337-338` (`.grille-tarif`), `:452` (`.carte-info`) et `:81` (`.selectionnable` sans coupure). Correction : `overflow-wrap: anywhere` sur `.selectionnable`, tableau dans un conteneur `overflow-x: auto` ou en-têtes réduits sous 360 px. Effort : petit.
4. **Cibles tactiles et textes trop petits** : toutes pages, m320 à m430 (résumé des mesures). Bouton son 40×31, « Copier » 62×30, liens « Tracé en PDF » 82×23, jours du calendrier 36 à 43 px, compteurs 42×36 ; surtitres du ticket, en-têtes du tableau et source de la presse à 11,84 px. Cause : `assets/css/style.css:215`, `:466`, `:278`, `:337`, `:403`. Correction : `min-height: 44px` (padding ou pseudo-élément) sur ces cibles, plancher `font-size: max(12px, .74rem)`. Effort : petit.
5. **Mise en ligne incomplète** : toutes pages. Aucun `?v=` sur `assets/css/style.css` et les 8 scripts du site (`index.html:24`, `:659-664`, idem dans les autres pages) ; page 404 générique de Vercel (`captures/404-p1440-00.jpg`). Correction : même `?v=1` partout, `404.html` aux couleurs du camp avec retour à l'accueil. Effort : petit.
6. **8 visuels provisoires peints en canvas** : accueil (herbier, sous-bois, nuit), /le-camp (table de pique-nique, prairie, grenouille, rosée), /roulottes (linge), `captures/provisoire-le-camp-p1440.jpg`. Ils sont étiquetés « visuel provisoire » mais restent visibles à côté de vraies photos. Correction : générer les images (consignes dans `notes.json`, `imagesManquantes`) ou les remplacer par des photos du client. Effort : moyen.

### Finition

1. **Fougères décoratives sur le texte** : accueil et /le-camp, p1440 et plus, `captures/accueil-p1440-11.jpg`, `captures/provisoire-le-camp-p1440.jpg`. La fougère fixe de gauche (86 px) recouvre le début des paragraphes (gouttière de 60 px). Cause : `assets/css/style.css:546-549`. Correction : n'afficher qu'à partir de 1600 px, ou largeur `min(6vw, var(--gouttiere) - 8px)`. Effort : petit.
2. **Grands vides entre sections** : accueil p1440, entre « Ils en parlent » et « Autour du camp » (environ 350 px vides), `captures/accueil-p1440-11.jpg`. Cause : `assets/css/style.css:237`, `padding-block: var(--section)` en haut et en bas de chaque section. Correction : `padding-block-start` réduit quand deux sections de même fond se suivent. Effort : petit.
3. **Typographie française** : toutes pages. Apostrophes droites (84 occurrences, aucune courbe), espaces ordinaires avant « : », ce qui laisse « : la plus avantageuse… » commencer une ligne (`captures/epingle-roulottes-1-1280x720-50.jpg`). Correction : apostrophes typographiques et espaces insécables avant `: ; ! ?`. Effort : petit.
4. **Plan du camp sur téléphone** : /le-camp, m390, `captures/inter-plan-m390.jpg`. Le plan (largeur mini 600 px) défile en horizontal sans indication ; l'étang et le nord sont coupés au premier regard. Cause : `assets/css/style.css:805-807`. Correction : indice « glissez » ou plan entier réduit avec la loupe pour le détail. Effort : petit.
5. **Pas de barre fixe en bas sur téléphone** : toutes pages. Correction : barre « Réserver » et « Appeler », masquée sur le pied de page. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (logo « Willow Camp » lisible dès 1 s dans l'intro) |
| Fluidité p1440 / m390 | 60 i/s / 59,7 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,0004 |
| Poids de l'accueil, p1440 / m390 | 2,74 Mo / 2,47 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 ; repli sans WebGL sans erreur ; réduire les animations : titre à 0,3 s, tout visible |
| Débordement horizontal | Aucun au chargement (FR, NL, EN, m360 à g1920) ; menu mobile ouvert coupé de 360 à 430 px ; tableau et e-mail à 320 px |
| Sections épinglées | Galerie des 4 roulottes : rien de texte coupé ; photos rognées en bas de 14 à 56 px de 1280×720 à 1366×768 (171 px à 1000×560) |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui, oui (9 pages), oui, absent (non pénalisé), JPG 1200×630 absolue, absent, générique Vercel |

## Vérifications écartées

- « INVISIBLES » `span.coupe__label` sur /roulottes : pas un blocage, les libellés arrivent avec un scrub et sont visibles en réduire les animations ; le vrai défaut (apparition tardive et chevauchement) est noté en important.
- Heures « h1 » de 3 à 5,2 s sur /le-camp et /roulottes : prises en parallèle ; les bandes d'ouverture montrent un titre lisible à 2,5 s.
- Galerie épinglée : « img sort de l'écran » de 14 à 56 px sur les formats courants : ce sont des photos, aucun texte ni bouton n'est caché ; à 1000×560 (171 px) c'est un format non courant.
- Galerie des roulottes sur téléphone : les cartes à droite de l'écran sont dans un carrousel `overflow-x: auto` avec aimantation, ce n'est pas un débordement.
- 404 « Failed to load resource » : erreur attendue de la page introuvable.
- Textes de 8,5 px dans le SVG du plan : numéros d'emplacement d'un plan zoomable (loupe), pas du texte courant.
- robots.txt absent et bibliothèques GSAP/OGL sans `?v=` : non pénalisés.


---

## willowcamp-maquette : corrections de l'étape 2

Commit 3e6285b (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Menu mobile coupé (langues et « Réserver mon séjour ») | Bloquant | Grande taille limitée à `.menu-mobile ol a` ; langues à 1rem en cibles de 44 px, bouton `max-width: 100%` | style.css | « English » droite à 504 px pour 360 → 107 à 319 px de 320 à 430 ; `preuve-menu-m360.jpg` |
| Vue en coupe : libellés tardifs et superposés | Important | Libellés révélés une fois à `top 60%` (ScrollTrigger `once`) au lieu de la fin du scrub ; `max-width: 11em` | roulottes.js, style.css | invisible à p1280/p1366/p1440/g1920 → 0 ; « cuisine » et « douche » sans chevauchement ; `preuve-coupe-1440.jpg` |
| Titre « Les roulottes » sous la ligne de flottaison | Important | Photo du hero bornée : `clamp(260px, min(62vw, 100svh - var(--entete) - 14rem), 720px)` dès 901 px | style.css | titre à 395-511 px pour 720 (1280×720), 445-681/768, 577-818/900 ; `preuve-titre-roulottes-1280x720.jpg` |
| Galerie épinglée des 4 roulottes : photos rognées | Important (méthode « tout tenir dans l'écran ») | Section `100svh` en colonne flex, `padding-top: var(--entete-h)` mesuré en JS (ResizeObserver), piste `flex: 1; min-height: 0`, photo `height: 100%` + `object-fit`, palier `max-height: 600px`, `anticipatePin` retiré | style.css, commun.js, roulottes.js | photo coupée 171/95/56/14 px (1000×560 à 1366×768) → 0 aux 8 tailles + 2560 ; `preuve-epingle-roulottes-1280x720(-avant).jpg` |
| Débordements à 320 px (tableau, e-mail) | Important | `overflow-wrap: anywhere` sur `.selectionnable` ; tableau resserré sous 400 px | style.css | « 5 € » rogné → tableau 304/304 ; e-mail 330 → 282 px ; `preuve-tableau-m320.jpg` |
| Textes < 12 px | Important | Plancher `max(12px, …)` sur ticket, en-têtes du tableau, source presse, jours du calendrier | style.css | 3 textes (accueil), 1 (roulottes) → 0 |
| Cibles < 44 px | Important | `min-height`/`min-width` 44 px (logo, son, langues, boutons petits, copier, interrupteurs, compteurs, flèches du calendrier) ; liens isolés en `inline-flex` 44 px à marge négative (hauteur de ligne inchangée) ; calendrier pleine largeur (jours 46×44 dès 320 px) ; cases à cocher 44 px dessinées à 22 px | style.css | 9-16 cibles par page → 0 (accueil, roulottes), 10 → 1 (le-camp, zone SVG du plan) ; `preuve-calendrier-m320.jpg` |
| Pas de barre fixe en bas | Finition (récurrent) | Barre « Réserver / Appeler » créée en JS depuis le lien de réservation et le numéro déjà présents, FR/NL/EN ; visible seulement après le héros, masquée sur formulaire, pied de page et menu ouvert ; `--barres-h` mesurée | commun.js, style.css | aucun élément couvert de m320 à m430 ; `preuve-barre-bas-m390.jpg` |
| Page 404 générique | Important | `404.html` à la charte (même CSS, en-tête, pied avec adresse existante), titre court, retour à l'accueil | 404.html, style.css | 404 « The page could not be found » à 980 px → page du camp sans débordement ni recouvrement ; `preuve-404-390.jpg`, `preuve-404-1280.jpg` |
| ?v= absent | Important | Déjà corrigé à l'étape 1 (vérifié cohérent), passé à `?v=20261028-2` partout | 9 pages + 404 | grep `v=20261028[^-]` : vide |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| 8 visuels provisoires peints en canvas | Important | Donnée manquante (images à générer) |
| Zones du plan SVG sous 44 px (38×32) et numéros d'emplacement à 8,5 px | Important (résiduel) | Plan zoomable avec liste de boutons équivalente ; refonte du plan = effort gros |
| Fougères décoratives sur le texte dès 1440 px | Finition | Finition |
| Grands vides entre sections | Finition | Finition |
| Typographie française (apostrophes, espaces avant « : ») | Finition | Finition |
| Plan du camp défilant sans indication sur téléphone | Finition | Finition |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920, 3 pages) | aucun mesuré (body clip), mais tableau et e-mail rognés à 320 | aucun, rien de rogné |
| Textes < 12 px (mobile) | accueil 3 (m320-m430), 2 (t820) ; roulottes 1 ; le-camp 1 (SVG) | accueil 0 ; roulottes 0 ; le-camp 1 (numéro SVG du plan) |
| Cibles < 44 px | accueil 9-10 ; le-camp 10-11 ; roulottes 12-16 | accueil 0 ; le-camp 1 (zone SVG) ; roulottes 0 |
| Éléments couverts | 0 | 0 (barre du bas comprise, m320 à m430) |
| Invisibles (libellés de la coupe) | 1 à p1280, p1366, p1440, g1920 | 0 |
| Épinglage galerie roulottes | photo coupée 171 / 95 / 56 / 14 px (1000×560, 1024×640, 1280×720, 1366×768) | 0 aux 8 tailles et à 2560×1440 |
| Épinglage planche accueil, fiche le-camp, reçu roulottes | rien de coupé | rien de coupé |
| Erreurs console | 0 (hors 404 attendue) | 0 (hors 404 attendue) |
| Modules chargés deux fois | 0 | 0 |
| Page 404 | générique, 980 px de large sur téléphone | à la charte, largeur de l'écran |

## Note proposée
Ancienne note 77/100 → nouvelle note 85/100 · bloquants restants : 0
- 3. Animations : 12 → 13, libellés de la vue en coupe corrigés.
- 5. Tous les formats : 8 → 12, menu mobile, débordements à 320 px, titre des roulottes en 1280×720 et cibles/textes corrigés.
- 8. Mise en ligne : 3 → 5, ?v= (étape 1) et page 404.
- 9. Accessibilité : 4 → 5, cibles tactiles et textes sur téléphone.

## Images Grok définitives (29/10)

Commit d543d68 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| feuilles-saule-herbier | canvas `herbier` (accueil, FR/EN/NL) | cadre entier 1168×784 ; 640, 1168 | « Rameau de saule aux feuilles allongées, posé à plat sur un papier crème comme dans un herbier » | 5 tailles |
| sous-bois-hetres | canvas `hetres`, fond de la carte (accueil) | 10:7 centré 1120×784 ; 640, 1120 (masqué ≤ 640 px comme avant) | « Sous-bois de hêtres aux troncs gris, sol couvert de feuilles mortes » | 4 tailles (masqué à 390) |
| nuit-saules-etoiles | canvas `nuit`, pied de page des 3 pages | 2,1:1 (y 170-726) ; 640, 1168, 1752 (1,5×) ; variante téléphone 728×784 (x 380-1108) ; 480, 728 ; voile sombre à gauche sous le texte | « La nuit sur un étang bordé de saules pleureurs, ciel étoilé et lucioles dans l'herbe » | 5 tailles, texte lisible |
| table-pique-nique-lumiere | 2 canvas `table` (le-camp : fiche du plan et équipements) | 4:5 (y 150-1130) ; 480, 784 ; 3:2 par object-fit dans la fiche | « Deux tasses émaillées, verte et crème, sur une table de pique-nique en bois à l'ombre d'un saule » | 5 tailles + fiche ouverte au clic |
| prairie-fleurie-macro | canvas `prairie` (le-camp) | 16:9 (y 50-707), abeille visible ; 640, 1168 | « Fleurs sauvages d'une prairie non fauchée, une abeille sur une fleur violette » | 5 tailles |
| grenouille-lentilles | canvas `grenouille` (le-camp) | 4:5 centré sur la grenouille (y 95-1075) ; 480, 784 | « Une grenouille verte, seule la tête hors de l'eau, entourée de lentilles d'eau » | 5 tailles |
| rosee-herbe-matin | canvas `rosee` (le-camp) | 4:5 bas (y 188-1168) ; 480, 784 | « Gouttes de rosée sur des brins d'herbe, à contre-jour au lever du soleil » | 5 tailles |
| linge-plie-lumiere | canvas `linge` (roulottes) | 4:5 (y 150-1130) ; 480, 784 | « Draps et serviettes en lin pliés sur un lit en bois clair, dans une roulotte » | 5 tailles |

Pages EN et NL traitées de la même façon (alt traduits). Code de dessin supprimé (peintres de `dessins.js`, repeinture au redimensionnement de `commun.js`, règles `.provisoire` du CSS) ; `?v=20261029` partout. Animation d'entrée du tirage scotché conservée (portée par la figure). Aucune 404, aucune erreur console ; CLS 0 sur l'accueil et le-camp ; roulottes 1,5 à 2,0 sur ordinateur dans le test de défilement rapide, identique avant le changement (section épinglée `.quatre`, sans lien avec les images).

Note : 85/100 → 86/100 (critère 2 : 12 → 13, les 8 visuels provisoires sont remplacés) · bloquants : 0 → 0 · Prête à envoyer
