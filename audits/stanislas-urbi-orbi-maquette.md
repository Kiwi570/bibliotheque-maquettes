# stanislas-urbi-orbi-maquette

<https://stanislas-urbi-orbi-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 753f777 du 23/10/2026

## Verdict

**81/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Maquette éditoriale forte : un vrai concept (le doigt, la ligne rouge, le globe), une direction artistique cohérente et un mur de portraits très réussi, à 60 i/s sur les deux formats. Il reste la mise en ligne à remettre aux règles (robots.txt, X-Robots-Tag, Cache-Control, ?v=), des textes et cibles trop petits sur téléphone, la galerie du Livre invisible avec « réduire les animations », et la visite épinglée coupée sur les petits portables.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Logo qui se dessine en suivant les coordonnées, puis l'index de bronze sur son ombre et la question en grand : original et parfaitement lié au projet. Le globe WebGL qui suit la ligne donne envie de faire défiler. |
| 2. Direction artistique et harmonie | 12/15 | Bonne association Instrument Serif, Instrument Sans et Plex Mono, fil rouge cohérent et images Grok sans défaut, dans la même lumière chaude. Mais les photos d'archives sont petites et de qualité inégale, et la carte « Latitude en forme de longitude » paraît vide sur fond nuit. |
| 3. Animations et effets | 13/15 | 59,9 / 59,8 i/s sans saccade, CLS au plus 0,043, plusieurs sections épinglées propres (questions, pellicule, livre, globe). En revanche, l'intro occupe 2 s et le titre n'apparaît qu'à 2,5 s. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne : mur de 1 455 portraits (mélanger, par fiche, par couleur, zoom, fiche agrandie avec précédente/suivante et « C'est moi »), curseur de point de vue, visionneuse, saut du tour du monde, menu, langue, Mode calme et formulaires simulés. |
| 5. Tous les formats | 12/15 | Aucun débordement horizontal et l'en-tête tient à 320 px. Sur téléphone, des textes à 10,4–11,5 px et des cibles sous 44 px ; à 1000×560, la visite de l'exposition est coupée. |
| 6. Contenu et fiabilité | 9/10 | Les contenus provisoires sont signalés avec soin (« À confirmer », « illustratif », « Dimensions : à compléter », notes de maquette) et les images viennent du site actuel. Les mentions légales sont seulement dans un repli du pied de page. |
| 7. Technique et performance | 8/10 | Aucune erreur JS ni lien cassé, et la carte de repli s'affiche sans WebGL. Sans WebGL, OGL écrit tout de même une erreur dans la console ; l'accueil pèse 5,6 à 6,8 Mo. |
| 8. Mise en ligne | 2/5 | noindex dans chaque page, og:image en 1200×630 avec adresse complète et 404 personnalisée sont en place. Il reste à corriger : « Disallow: / » dans robots.txt, X-Robots-Tag absent, Cache-Control dans vercel.json, aucun ?v=. |
| 9. Accessibilité | 3/5 | Canvas avec aria-label, mur pilotable au clavier, Mode calme, langues balisées. Mais avec « réduire les animations », toute la galerie du Livre reste invisible, et les cibles et les textes sont trop petits sur téléphone. |
| **Total** | **81/100** | |

## Points forts

- Le concept est porté par la forme : le fil rouge relie l'intro, l'index, le ciel, le globe et le contact.
- Globe WebGL qui suit la ligne avec un compteur de kilomètres et des cartes IGN par pays ; une carte SVG le remplace sans WebGL.
- Mur des portraits remarquable : filtre par couleur de vêtement, accès direct à une fiche, portrait agrandi et lien « C'est moi : écrire à Daniel Denise ».
- Fluidité exemplaire : 59,9 i/s sur ordinateur, 59,8 i/s sur téléphone, aucune tâche longue.
- Contenus provisoires bien marqués, et un pied de page explique ce que sont les visuels d'ambiance.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mise en ligne hors règles** : toutes les pages. Cause : `robots.txt:2` (`Disallow: /`) ; `vercel.json:4`, où le bloc `headers` pose un Cache-Control sur `/assets/(.*)` et pas de X-Robots-Tag ; `index.html`, `exposition.html`, `portraits.html` et `404.html` chargent `assets/css/style.css` et `assets/js/*.js` sans `?v=`. Correction : `Allow: /` ; remplacer la règle Cache-Control par `{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }` ; ajouter le même `?v=1` à style.css, app.js, home.js, globe.js, expo.js et wall.js dans toutes les pages. Effort : petit.
2. **Textes de moins de 12 px sur téléphone** : accueil et exposition, m320 à m430, `captures/accueil-m390-03.jpg`, `captures/accueil-m390-07.jpg`, `captures/planche-exposition-m390.jpg`. Cause : `assets/css/style.css:340` (`.frame .fno` à .7rem = 11,2 px), `:848` (`.g-label` à .65rem = 10,4 px), `:769` et `:886` (`.cartel` à .72–.75rem), `:248` (`.tag-demo` à .7rem). Correction : plancher `font-size: max(12px, …)` sur ces quatre sélecteurs. Effort : petit.
3. **Zones tactiles de moins de 44 px** : toutes les pages sur téléphone. Cause : `assets/css/style.css:143` (`.brand` 39×30), `:523` (`.contact a.mail`, 32 px de haut), `:1109` (`#vp-range`, 16 px de haut), `select#wall-color` (36 px), liens `a.link` du pied de page (34 px), `details.legal > summary` (42 px, `:1153`). Correction : `min-height: 44px` (padding vertical ou pseudo-élément) sur ces éléments ; curseur avec une piste de 44 px de haut. Effort : petit.
4. **Visite de l'exposition coupée sur petit portable** : /exposition, 1000×560 et 1024×640, `captures/epingle-exposition-0-1000x560-8.jpg`, `captures/epingle-exposition-0-1024x640-8.jpg`. L'image sort de 65 px et le titre h3 de 58 px. Cause : `assets/css/style.css:609` (`.visit-pin { height: 100svh }` sans palier pour les écrans bas ; `:953` ne masque que des cartels). Correction : palier `@media (max-height: 660px)` qui réduit les titres de salle, les marges et la hauteur des médias (`flex: 1; min-height: 0` dans une colonne de 100svh, hauteur de l'en-tête mesurée en `--entete-h`). Effort : moyen.

5. **Galerie du Livre invisible avec « réduire les animations »** : accueil, p1440 (et m390, relevé par la mesure), `captures/verif-reduit-livre-p1440.jpg`. Les 12 photos de `.livre-photos` restent à `opacity: 0`, même centrées à l'écran depuis 2,5 s : un grand vide sous « Le Livre sous la Place ». Cause : `assets/js/home.js:314`, un `gsap.from(... opacity: 0 ..., scrollTrigger once)` qui ne se déclenche pas quand le mouvement est réduit. Correction : sous `prefers-reduced-motion` ou en Mode calme, ne pas lancer cette animation ; sinon utiliser `gsap.fromTo` avec `{ y: 0, opacity: 1 }` comme valeurs d'arrivée, plus un filet CSS `@media (prefers-reduced-motion: reduce) { .livre-photos figure { opacity: 1 !important; transform: none !important; } }`. Effort : petit.

### Finition

1. **Erreur console sans WebGL** : accueil, p1440 et m390 sans WebGL. Le repli SVG s'affiche correctement, mais OGL écrit `unable to create webgl context`. Cause : `assets/vendor/ogl/core/Renderer.js:46`, appelé depuis `assets/js/globe.js:107`. Correction : tester `document.createElement('canvas').getContext('webgl2') || …getContext('webgl')` avant `new Renderer` et passer directement à `fallback()` si le test échoue. Effort : petit.
2. **Carte « Latitude en forme de longitude » qui paraît vide sur fond nuit** : accueil, tous formats, `captures/accueil-p1440-10.jpg`, `captures/accueil-m390-09.jpg`. Les quatre quarts blancs de l'œuvre ressemblent à des images non chargées. Correction : la poser sur un passe-partout papier (`.mat`) avec une légende visible, ou garder le fond papier de cette section. Effort : petit.
3. **Ouverture à la limite** : accueil, `captures/ouverture-p1440-t2000.jpg` et `t2500.jpg`. Le titre est lisible à 2,5 s : l'intro du logo occupe à elle seule près de 2 s. Correction : couper le tracé du logo à environ 1,2 s pour afficher le titre vers 1,8 s. Effort : petit.
4. **Pas de barre fixe en bas sur téléphone** : toutes les pages. Correction : barre avec « Retrouver un portrait » et « Écrire », masquée par IntersectionObserver sur le formulaire et le pied de page. Effort : moyen.
5. **Accueil lourd** : 5,4 à 6,8 Mo. Correction : `srcset` et `loading="lazy"` sur les vignettes des portraits, de la pellicule et de la presse ; `g-terres-strates-16x9.webp` (960×411) est aussi un peu floue en pleine largeur. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (étapes `ouverture-*-t2500.jpg`, intro du logo jusqu'à 2 s) |
| Fluidité p1440 / m390 | 59,9 i/s / 59,8 i/s (très bien) |
| CLS au chargement (max) | 0,043 (accueil g1920) |
| Poids de l'accueil, p1440 / m390 | 6,53 Mo / 5,58 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune erreur JS ; sans WebGL, 1 console.error OGL et repli SVG correct ; mouvement réduit : galerie du Livre invisible (voir défaut 5) |
| Débordement horizontal | aucun |
| Sections épinglées | 5 ; seule la visite de /exposition est coupée à 1000×560 et 1024×640 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public ; noindex dans les 3 pages ; X-Robots-Tag absent ; « Disallow: / » ; og:image JPG 1200×630 avec adresse complète ; ?v= absent ; 404 personnalisée (et Cache-Control dans vercel.json) |

## Vérifications écartées

- « MASQUÉ » sous l'en-tête (titres, champs, e-mail, notes du pied de page) : relevé en bas de page, quand ces éléments défilent normalement sous l'en-tête fixe de 64 px ; rien n'est caché à l'arrêt.
- Globe « canvas sous l'en-tête 64 px » à toutes les tailles : le canvas est un fond plein écran voulu et le HUD comme le globe restent visibles (`captures/epingle-accueil-3-1440x900-50.jpg`).
- « INVISIBLES » sur `.g-label` (Nancy, pays) et sur les lignes du HUD (« Départ : l'index de Stanislas », « 68°13′ N ») : ces étiquettes s'affichent seulement quand la ligne passe au point concerné (`.g-label.is-on`, `style.css:386`) ; ce ne sont pas des éléments bloqués.
- `mozambique.webp`, `madagascar.webp` et `royaume-uni.webp` en `ERR_ABORTED` : requêtes d'images paresseuses annulées par le défilement rapide de la mesure ; les fichiers existent et s'affichent sur les captures du globe.
- Erreur 404 dans la console sur /zz-page-introuvable-audit : c'est le statut attendu de la page 404.
- Valeurs « 1338 », « 1341 » et « 1 409 » au lieu de 1 360 et 1 455 : compteurs capturés pendant leur animation ; les valeurs finales sont correctes.
- Ouverture « h1 null » : jugée sur les étapes chronométrées. Le titre est lisible à 2,5 s, sous la limite de 3 s, donc pas de remesure.


---

## stanislas-urbi-orbi-maquette : corrections de l'étape 2

Commit 3177e31 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Mise en ligne (robots.txt, X-Robots-Tag, Cache-Control, ?v=) | Important | Déjà corrigé à l'étape 1 (e437c78), vérifié : `Allow: /`, X-Robots-Tag `noindex, nofollow`, aucun Cache-Control ; versions passées à `?v=20261028-2` (HTML, modulepreload, imports dynamiques de app.js et home.js) | toutes les pages, app.js, home.js | aucune ancienne version restante ; 1 seule version par fichier |
| Textes de moins de 12 px sur téléphone | Important | Plancher `max(12px, …)` sur `.fno`, `.tag-demo`, `.cartel` (et ses variantes), `.g-label` (≤ 900 px), `.vp-scale` | style.css | 30 → 0 |
| Zones tactiles de moins de 44 px | Important | ≤ 980 px : `min-height: 44px` sur le logo, le lien e-mail, les liens du pied, le select du mur, `summary` des mentions, `.mat` ; curseur de point de vue avec piste de 44 px ; lien rouge des itinéraires agrandi par padding | style.css | 89 → 0 sur téléphone (6 restent sur t820 : repères du fil rouge) |
| Visite de l'exposition coupée sur petit portable | Important | Hauteur réelle de l'en-tête mesurée en JS (`--entete-h`, ResizeObserver) pour le haut des salles ; paliers `max-height: 780px` et `660px` qui réduisent numéro de salle, titres, marges et hauteurs des médias (vh) sans masquer de contenu | style.css, app.js | position stabilisée, 8 salles × 7 tailles : 1000×560 (3 salles coupées) et 1024×640 / 1280×720 (salle 3) → 0 coupée ; la barre de salles redevient visible à 1280×720 |
| Galerie du Livre invisible avec « réduire les animations » | Important | Animation d'entrée lancée seulement hors Mode calme ; filet CSS `html.calm .livre-photos figure { opacity: 1; transform: none }` | home.js, style.css | opacité 0 → 1 sur les 8 photos (m390 et p1440, mouvement réduit) |
| Pas de barre fixe en bas sur téléphone | Finition (récurrent) | Barre « Retrouver un portrait » (portraits.html, ou #mur sur /portraits) et « Écrire » (#contact), libellés déjà présents ; apparaît après le héros, masquée sur le mur, les formulaires, le contact, le pied, le menu et la visionneuse, absente de la 404 ; `--barres-h` mesurée et réservée sous le pied | app.js, style.css | aucun élément couvert par la barre de m320 à m430 ; menu ouvert : masquée ; clic « Écrire » → #contact |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Erreur console OGL sans WebGL | Finition | finition (repli SVG correct) |
| Carte « Latitude en forme de longitude » vide sur fond nuit | Finition | finition |
| Ouverture : titre lisible à 2,5 s | Finition | finition |
| Accueil de 5,4 à 6,8 Mo | Finition | finition, effort moyen |
| Repères du fil rouge 7×7 px sur tablette (t820) | — | hors téléphone, non cité par le rapport |
| Mesure « @0.08 » de la visite à 1000×560 et 1024×640 encore signalée | — | retard du défilement fluide (pinTop 389 / 361 : la section n'est pas encore épinglée) ; en position stabilisée, rien n'est coupé |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (tous formats) | 0 | 0 |
| Textes < 12 px (m320 / m360 / m390 / m430 / t820) | 6 / 6 / 6 / 6 / 6 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 16 / 17 / 16 / 16 / 24 | 0 / 0 / 0 / 0 / 6 |
| Éléments couverts par la barre du bas | — (pas de barre) | 0 (les relevés restants sont « sous l'en-tête » en bas de page, écartés par l'audit) |
| Épinglage visite /exposition, position stabilisée (8 tailles) | coupé à 1000×560, 1024×640, 1280×720 | rien de coupé |
| Épinglage (outil, 129 mesures) | 26 relevés (24 globe plein écran voulu, 2 visite @0.08) | identique (même nature) |
| Erreurs console | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 81/100 → nouvelle note 88/100 · bloquants restants : 0
- 5. Tous les formats 12 → 14 : textes, cibles et visite coupée corrigés (pas de 15/15).
- 8. Mise en ligne 2 → 5 : robots.txt, X-Robots-Tag, Cache-Control et `?v=` déjà corrigés à l'étape 1.
- 9. Accessibilité 3 → 5 : galerie du Livre visible en mouvement réduit, textes et cibles corrigés.
