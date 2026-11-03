# laure-polin-maquette

<https://laure-polin-maquette.vercel.app> · audit du 28 octobre 2026 · dernier commit 6f49612 du 26 octobre 2026

## Verdict

**80/100 · À peaufiner · 0 défaut bloquant**

C'est une galerie d'artiste élégante et sincère : de vraies photos d'œuvres, des salles par matière, une fiche avec loupe et « Voir à l'échelle », un panier simulé et une version anglaise complète, le tout à 60 i/s. Avant l'envoi, il faut réparer le portrait collant du manifeste, ajouter X-Robots-Tag et `?v=`, et soigner les petits formats (en-tête à 320 px, cibles tactiles).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Le nom qui s'écrit à la poussière, puis l'œuvre qui se recompose en particules sur un mur d'ardoise, c'est juste et propre à l'artiste ; mais le passage en blocs avec un grand rectangle blanc (vers 2,5 s) casse un peu l'élégance, et le titre principal n'est net qu'à 3 s. |
| 2. Direction artistique et harmonie | 12/15 | Cormorant Garamond, Inter Tight, ardoise et cuivre : l'ensemble est cohérent sur toutes les pages et les photos d'œuvres sont mises en valeur ; mais les fonds d'ambiance restent des textures provisoires (rectangles gris derrière « Collection privée ») et le manifeste laisse une colonne gauche vide. |
| 3. Animations et effets | 12/15 | 60 i/s sans saccade, titres « clivés », chapitres matière épinglés, salle en défilement horizontal, mots révélés au défilement ; mais le portrait collant du manifeste ne colle pas et l'ouverture de l'accueil dure 3 s. |
| 4. Expérience ludique et interactions | 9/10 | Tout marche et se comprend sans mode d'emploi : diaporama avec pause et points, filtres (disponibles, taille, prix), vues Salle / Grille, loupe, « Voir à l'échelle » (console / sol), panier simulé, formulaires et bascule FR / EN. |
| 5. Tous les formats | 11/15 | Aucun débordement, à aucun format ni sur aucune salle ; mais « Laure Polin » passe sur deux lignes à 320 px, 6 à 12 cibles font moins de 44 px sur téléphone, il y a des textes à 9 et 11 px, et la barre de filtres reste collée jusqu'au pied de page. |
| 6. Contenu et fiabilité | 9/10 | Les 117 fiches viennent de sculptures-fr.com, les « à compléter » sont bien marqués en cuivre et le Vendée Art Show 2025 est indiqué « Salon passé » ; les mentions légales et les CGV restent à compléter, ce qui est signalé. |
| 7. Technique et performance | 8/10 | Aucune erreur JavaScript ni lien cassé (115 liens internes testés), CLS max 0,039, accueil de 2,4 Mo ; mais le LCP de la fiche d'œuvre est confirmé à 3,8 s, parce que la photo principale est retenue invisible par l'animation d'entrée. |
| 8. Mise en ligne | 3/5 | Site public, noindex sur chaque page, og:image en JPG 1200×630 absolue, 404 personnalisée, pas de Cache-Control ; mais pas d'en-tête X-Robots-Tag et aucun `?v=` sur le CSS et le JS du site. |
| 9. Accessibilité | 4/5 | Focus visible cuivre, menu avec focus et Échap, « réduire les animations » respecté (contenu visible, pas d'épinglage), textes alternatifs détaillés ; les cibles tactiles sont petites. |
| **Total** | **80/100** | |

## Points forts

- **Une ouverture qui parle de sculpture.** Le nom s'écrit, un trait de cuivre se tire, la poussière s'envole, puis la photo de l'œuvre se recompose grain par grain (`captures/bande-ouverture-p1440.jpg`).
- **Les œuvres d'abord, sur leurs vraies photos.** Le diaporama de 7 œuvres de l'accueil, les salles par matière et la collection privée montrent toutes des photos réelles, jamais détourées.
- **Une salle d'exposition vraiment utile.** Vue « Salle » horizontale avec compteur, vue « Grille », et filtres combinables qui réagissent correctement (« Disponibles » + « Plus de 1 000 € » donne 2 œuvres) (`captures/inter-salle-filtres-p1440.jpg`).
- **Une fiche d'œuvre complète.** Toutes les vues, une loupe, « Voir à l'échelle » face à une silhouette de 1,70 m, sur console ou au sol, un panier simulé honnête (« Paiement simulé », « conditions à compléter ») et un formulaire prérempli avec le nom de l'œuvre (`captures/inter-echelle-p1440.jpg`, `captures/inter-panier-p1440.jpg`).
- **Une version anglaise complète.** Textes, attributs et fiches sont traduits, sans aucun reste en français (`captures/vue-lang-en-390.jpg`).
- **Fluidité parfaite.** 60 i/s sur portable et sur téléphone, aucune image de plus de 50 ms.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Le portrait collant du manifeste ne colle pas**
   - **Où :** accueil, section « Je taille, je ponce, je bouscule la matière », à partir de 861 px de large. Le portrait part vers le haut dès le début du texte : la colonne gauche reste vide sur toute la hauteur du manifeste (459 px de portrait sous l'en-tête à 1440×900).
   - **Captures :** `captures/epingle-accueil-2-1440x900-50.jpg`, `captures/epingle-accueil-2-1280x720-8.jpg`.
   - **Cause :** `assets/css/site.css:257`, `.manifeste { overflow: hidden; }`, qui empêche le `position: sticky` de `.portrait` (`site.css:259`).
   - **Correction :** remplacer par `overflow: clip` (ou retirer l'overflow et contenir le débord ailleurs), et borner le portrait à `max-height: calc(100svh - var(--header-h) - 48px)`.
   - **Effort :** petit.

2. **En-tête X-Robots-Tag absent**
   - **Où :** tout le site. `vercel.json` ne contient que `cleanUrls`.
   - **Cause :** `vercel.json:1-3`.
   - **Correction :** ajouter `"headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }]`.
   - **Effort :** petit.

3. **Aucun `?v=` sur le CSS et le JS du site**
   - **Où :** `assets/css/site.css`, `data/oeuvres.js`, `assets/js/accueil.js`, `salle.js`, `oeuvre.js`, `base.js`, appelés sans numéro de version sur les 4 pages.
   - **Cause :** `index.html:28` et les balises `<script>` de fin de page ; même chose dans `salle.html`, `oeuvre.html`, `mentions.html`, `404.html`.
   - **Correction :** ajouter `?v=20261028` identique partout, y compris dans les `import` des modules.
   - **Effort :** petit.

4. **Cibles tactiles et textes trop petits sur téléphone**
   - **Où :** toutes les pages en m360, m390 et m430 :
     - FR / EN (34 px) ;
     - pause du diaporama (30 px) et points (24×28 px) ;
     - fil d'Ariane (20 px) ;
     - téléphone et e-mail (22 à 32 px) ;
     - « Œuvre précédente / suivante » (32 px) ;
     - liens Instagram / Facebook du pied (32 px).

     Il y a aussi l'étiquette « Disponible » en 11 px et « Œuvre précédente » en 11 px, et l'étiquette « Bagnolet » du plan en 9 px.
   - **Capture :** `captures/planche-oeuvre-m390.jpg`.
   - **Cause :** `site.css:139` (`.langues button` 34 px), `:226` (`.hero-point`), `:231` (`.hero-pause`), `:323` (`.etat` 11px), `:604` (`.suite`), `:398` (`.coord`) ; étiquettes SVG du plan dans `assets/js/accueil.js:442` et suivantes.
   - **Correction :** sous 860 px, `min-height: 44px; min-width: 44px` (ou un pseudo-élément de zone) sur ces éléments, `font-size: max(12px, …)` pour `.etat` et `.suite small`, et une étiquette du plan d'au moins 12 px rendus.
   - **Effort :** petit.

5. **Ouverture de l'accueil un peu longue**
   - **Où :** accueil. Le nom d'intro est lisible dès 1 s, mais le titre principal n'est net qu'à 3,0 s sur portable et vers 3,5 s sur téléphone. Le passage en blocs vers 2,5 s affiche un grand carré blanc plein cadre, qui ressemble à un flash.
   - **Captures :** `captures/ouverture-p1440-t2500.jpg`, `captures/bande-ouverture-m390.jpg`.
   - **Cause :** séquence d'ouverture de `assets/js/accueil.js` (intro, `LP.cliver` du titre, recomposition de la photo).
   - **Correction :**
     - raccourcir l'intro d'environ 0,8 s pour que le titre soit net avant 2,5 s ;
     - faire entrer la photo sur un fond déjà sombre, plutôt qu'en blocs blancs.
   - **Effort :** petit.

6. **LCP de 3,8 s sur la fiche d'œuvre**
   - **Où :** /oeuvre. Mesuré seul, Mac au calme, 3 chargements sans cache : 3,92 / 3,87 / 3,81 s en 1440×900 et 3,72 / 3,81 / 3,78 s en 390×844. La page ne pèse que 0,86 Mo. L'élément LCP est la photo principale (`img.oeuvre`, `harmonie-01-800.webp`), affichée seulement à la fin de l'animation d'entrée.
   - **Capture :** `captures/titre-oeuvre-p1440-t2500.jpg`.
   - **Cause :**
     - `assets/js/oeuvre.js:107`, `gsap.set(imgScene, { opacity: 0 })`, puis un fondu après le titre clivé ;
     - l'image n'est pas préchargée.
   - **Correction :**
     - afficher la photo d'emblée, avec un fondu limité au cadre ou un départ à `opacity: .01` pour moins de 300 ms ;
     - ajouter `<link rel="preload" as="image" fetchpriority="high">` sur la première vue, injectée tôt.

     Objectif : un LCP sous 2,5 s.
   - **Effort :** petit.

### Finition

1. **« Laure Polin » sur deux lignes à 320 px**
   - **Où :** toutes les pages, en m320. Le nom fait 77 px de haut dans un en-tête de 72 px.
   - **Capture :** `captures/entete-m320.jpg`, `captures/planche-accueil-m320.jpg`.
   - **Cause :** `site.css:122`, `.marque` en 1,55rem sans palier.
   - **Correction :** `@media (max-width: 359px) { .marque { font-size: 1.25rem; white-space: nowrap; } .langues { margin-right: 0; } }`.
   - **Effort :** petit.

2. **Barre de filtres collée jusqu'au pied de page**
   - **Où :** /salle, tous formats. « Disponibles… Salle / Grille » reste en haut pendant « Les autres salles », « Une œuvre vous retient ? » et le pied de page.
   - **Capture :** `captures/salle-p1440-18.jpg`, `captures/planche-salle-m390.jpg`.
   - **Cause :** `site.css:483`, `.barre-filtres { position: sticky }` placée au niveau de `main`.
   - **Correction :** placer la barre dans la section de la salle, pour que le collant s'arrête à la fin de la salle.
   - **Effort :** petit.

3. **Visuels d'ambiance provisoires**
   - **Où :** salles et chapitres matière. Les fonds (ardoise striée, coulée de bronze, chevrons de pneu) sont générés en code. Derrière « Collection privée », trois rectangles gris chevauchent le titre.
   - **Capture :** `captures/vue-salle-s-collection-1440.jpg`.
   - **Cause :** `assets/img/ambiance/*.webp`, provisoires selon le README.
   - **Correction :** les remplacer par les images définitives, ou retirer les socles de « Collection privée » d'ici là.
   - **Effort :** moyen.

4. **Titre matière sous l'en-tête à 1000×560**
   - **Où :** accueil, chapitre « Ardoise », 22 px sous l'en-tête.
   - **Capture :** `captures/epingle-accueil-0-1000x560-50.jpg`.
   - **Cause :** `site.css:276-281`, `.matieres .piste` en 100svh sans tenir compte de `--header-h`.
   - **Correction :** `padding-top: var(--header-h)` sur `.matiere`, avec un palier `max-height: 600px` qui réduit `.mot-matiere`.
   - **Effort :** petit.

5. **/mentions sans og:image**
   - **Correction :** reprendre les balises og de l'accueil dans `mentions.html`.
   - **Effort :** petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 3,0 s / 3,5 s (nom d'intro lisible dès 1 s) ; /salle et /oeuvre remesurées seules : titre lisible vers 2,5 s |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, 0 image de plus de 50 ms) |
| CLS au chargement (max) | 0,039 (/mentions p1366) |
| LCP /oeuvre (mesuré seul, 3 chargements sans cache) | 3,92 / 3,87 / 3,81 s en 1440×900 · 3,72 / 3,81 / 3,78 s en 390×844 (confirmé) |
| Poids de l'accueil, p1440 / m390 | 2,44 Mo / 2,13 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JavaScript ; sans WebGL : repli correct, sans erreur ; réduire les animations : contenu visible, pas d'épinglage |
| Débordement horizontal | Aucun (4 pages, 5 salles, fiches, version EN, de 320 à 1920 px) |
| Sections épinglées | Chapitres matière : corrects (titre 22 px sous l'en-tête à 1000×560 seulement) ; salle horizontale : correcte ; portrait du manifeste : sticky inopérant |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public · noindex, nofollow sur les 4 pages · X-Robots-Tag absent · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue (absente de /mentions) · aucun ?v= · 404 personnalisée |

## Vérifications écartées

- **Heures « h1 » d'environ 3 s sur /salle et /oeuvre :** mesurées avec 5 maquettes en parallèle, et c'est l'animation « clivée » du titre. Remesuré seul : sur /salle, le voile de transition puis le titre, lisible vers 2,5 s ; sur /oeuvre, le titre est lisible à 2,5 s (`captures/titre-salle-p1440-t2500.jpg`, `captures/titre-oeuvre-p1440-t2500.jpg`).
- **Heures « h1 » de 7 à 12 s sur la 404 (m320, t820, p1366) :** ce sont des valeurs isolées sous charge. Ailleurs, la page s'affiche en 0,2 à 0,5 s.
- **Éléments « invisibles » (« Sous pression », « Énergies », légendes de la collection privée) :** ce sont des légendes de vignettes qui n'apparaissent qu'au survol ou au focus (`site.css:352-353`). Sur téléphone, elles sont visibles.
- **« MASQUÉ » sous l'en-tête :** ce sont des éléments qui passent sous l'en-tête réapparu pendant le défilement, sur /mentions, /salle et la 404. Rien n'est caché en position de lecture.
- **« img sous l'en-tête » et « canvas.gl sous l'en-tête » dans les sections épinglées :** ce sont les fonds plein cadre voulus (mur d'ardoise, canvas WebGL), pas du contenu coupé (`captures/epingle-accueil-0-1280x720-50.jpg`, `captures/epingle-salle-0-1280x720-8.jpg`).
- **Erreurs « 404 » sur la page introuvable :** c'est la réponse attendue.
- **Images Grok :** aucune n'est utilisée. `assets/img/ambiance/` ne contient que des textures générées en code (examinées en taille réelle : ardoise, carrière, coulée de bronze, chevrons de pneu, établi). Elles ne montrent ni personne, ni main, ni texte, ni filigrane. La photo « Laure Polin parmi ses sculptures » est une vraie photo.
- **Contenu :** prix, dimensions, fonderies Chapon et Avangini, galeries Majestic et Rise Art viennent du site actuel. Les « 60 œuvres en collection privée » correspondent au nombre de fiches de la salle.
- **Robots.txt absent, noindex avec nofollow, bibliothèques (GSAP, Lenis, OGL) sans ?v= :** non pénalisés.
- **Pas de bouton « Mode calme » :** il a été retiré à la demande de la cliente (README) ; le réglage système est respecté.
- **Taches floues dans l'en-tête :** c'est le `backdrop-filter` qui floute les œuvres situées dessous, pas un défaut.
- **Interactions testées, toutes fonctionnelles :**
  - menu mobile : 8 liens, focus sur « Ardoise », verrou de défilement, Échap ;
  - diaporama : points et pause ;
  - filtres combinés et vue Grille (21 œuvres sur ordinateur, 12 en Bronze sur téléphone) ;
  - vignettes de la fiche, loupe, « Voir à l'échelle » ;
  - panier : ajout, compteur, « Passer commande » avec les mentions « à compléter » ;
  - formulaires : erreurs sur les champs requis, puis message de démonstration ;
  - bascule FR / EN.


---

## laure-polin-maquette : corrections de l'étape 2

Commit ee7b33d (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| 1. Portrait collant du manifeste inopérant | Important | `.manifeste` en `overflow: clip` ; portrait en colonne flex borné à `100svh - --header-h - 48px`, cadre `flex: 0 1 auto; min-height: 0` (légende comprise) ; rien changé sous 860 px | site.css | Épinglage accueil-2 : 16 relevés « img sous l'en-tête » (326 à 509 px) → 0 à 50 % aux 8 tailles (seuls 5 à 32 px restent à 92 %, quand la section sort) ; `preuve-manifeste-*` |
| 2. X-Robots-Tag absent | Important | Déjà corrigé à l'étape 1 (cabfd1e), vérifié dans vercel.json | — | — |
| 3. Aucun `?v=` | Important | Déjà corrigé à l'étape 1 ; passé à `?v=20261028-2` partout (HTML et imports de modules) | 5 HTML, 5 JS | `grep "v=20261028[^-]"` vide, aucun module chargé deux fois |
| 4. Cibles et textes trop petits sur téléphone | Important | Sous 860 px : marque, FR / EN, pause et points du diaporama, liens `.lien` (contacts, galeries, pied, réseaux), fil d'Ariane et « Œuvre précédente / suivante » à 44 px de haut ; `.etat` et `.suite small` à `max(12px, …)` ; « Bagnolet » du plan à 14 px | site.css | Cibles < 44 px en m390 : 18 sélecteurs → 2 (points du diaporama 33×44, « Accueil » du fil 40×44) ; textes < 12 px : 3 par format → 1 (étiquettes secondaires du plan) |
| 5. Ouverture de l'accueil longue, aplat blanc à 2,5 s | Important | Intro raccourcie d'environ 0,55 s (lettres, trait, feuillets) ; cadre de la photo qui part d'une teinte d'ardoise et ne s'éclaircit qu'une fois les particules rassemblées | base.js, accueil.js | Titre net à 2,5 s au lieu de 3 s, plus d'aplat clair ; `preuve-ouverture-p1440.jpg` |
| 6. LCP de 3,8 s sur /oeuvre | Important | La photo démarre à `opacity: 0.01` au lieu de 0 : peinte dès son chargement, l'effet de poussière reste identique | oeuvre.js | Mesuré seul, 3 chargements : 1440×900 0,85 à 1,15 s ; 390×844 0,53 à 0,58 s (environ 3,8 s avant, d'après l'audit) |
| Finition 1. « Laure Polin » sur deux lignes à 320 px | Finition | Corrigée parce que les boutons FR / EN à 44 px élargissent l'en-tête : sous 360 px, `.marque` à 1,25rem sans retour à la ligne | site.css | `preuve-accueil-m320-*` |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Étiquettes secondaires du plan de Bagnolet (Les Lilas, Montreuil…) à 7 px | Important (partiel) | Une fois agrandies à 12 px, elles se chevauchent sur un plan de 350 px : il faudrait redessiner le plan pour téléphone (effort moyen à gros, choix de présentation) |
| Points du diaporama à 33 px de large en m390 (34 en m320) | Important (partiel) | 7 points et la pause tiennent sous la photo : hauteur 44 px, largeur limitée par la largeur du cadre |
| Barre de filtres de /salle collée jusqu'au pied | Finition | Finition |
| Visuels d'ambiance provisoires (socles de « Collection privée ») | Finition | Donnée manquante |
| Titre matière 22 px sous l'en-tête à 1000×560 | Finition | Finition (correct à 1280×720 et 1366×768) |
| /mentions sans og:image | Finition | Finition |
| Préchargement de la photo de la fiche | — | Pas nécessaire : LCP déjà sous 1,2 s sans lui |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920) | 0 partout | 0 partout |
| Textes < 12 px (par format m320/m360/m390/m430/t820) | 3 / 3 / 3 / 3 / 3 | 1 / 1 / 1 / 1 / 1 (étiquettes secondaires du plan) |
| Cibles < 44 px (m320/m360/m390/m430/t820) | 37 / 43 / 43 / 42 / 43 | 4 / 4 / 4 / 4 / 3 |
| Éléments couverts | 1 à 6 par format, tous par l'en-tête réapparu pendant le défilement (écarté dans le rapport) | 0 à 3, même nature ; pas de barre du bas sur ce site |
| Épinglage, 8 tailles (relevés en défaut) | 64 sur 93 | 55 sur 93 : les 9 en moins sont le manifeste ; le reste est les fonds plein cadre voulus (écartés dans le rapport) et le titre Ardoise à 1000×560 (finition) |
| Rendu 1280×720 et 1366×768 | Portrait du manifeste parti | En-tête sur une ligne, portrait collé sous l'en-tête, rien de coupé |
| Erreurs console | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |
| LCP /oeuvre (outil, sous forte charge de la machine) | 3,9 à 13,6 s | 1,9 à 13,8 s : peu fiable sous charge (load 36) ; mesuré seul : 0,5 à 1,2 s |

Interactions vérifiées sur téléphone (360 px) : points et pause du diaporama, bascule FR / EN, menu (ouverture, Échap), « Œuvre suivante » ; aucune erreur.

## Note proposée
Ancienne note 80/100 → nouvelle note 90/100 · bloquants restants : 0 · verdict « Prête à envoyer »
- 1. Effet « waouh » 12 → 13 : plus d'aplat blanc pendant l'ouverture, titre net à 2,5 s.
- 2. Direction artistique 12 → 13 : la colonne gauche du manifeste n'est plus vide, le portrait reste en place.
- 3. Animations et effets 12 → 14 : le portrait collant fonctionne et l'ouverture est raccourcie.
- 5. Tous les formats 11 → 13 : nom sur une ligne à 320 px, cibles à 44 px, textes à 12 px sauf les étiquettes secondaires du plan ; la barre de filtres collée reste.
- 7. Technique et performance 8 → 9 : LCP de la fiche sous 1,2 s mesuré seul.
- 8. Mise en ligne 3 → 5 : X-Robots-Tag et `?v=` déjà corrigés à l'étape 1.
- 9. Accessibilité 4 → 5 : cibles tactiles à 44 px.
