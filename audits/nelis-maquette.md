# nelis-maquette

<https://nelis-maquette.vercel.app> · audit du 27 octobre 2026 · dernier commit e02fd9e du 27 octobre 2026

## Verdict

**80/100 · À peaufiner · 2 défauts bloquants**

La maquette est très juste pour le métier : ouverture « gel » jusqu'à −40 °C, givre WebGL sur la vraie machine, et un défilement à 60 i/s. Elle ne peut pas partir avant deux corrections : les légendes de la galerie épinglée sont coupées sur les portables 1280×720 et 1366×768, et une image Grok montre trois mains.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture gel avec compte à rebours jusqu'à −40 °C, puis givre WebGL sur la vraie machine : très juste pour le métier, et l'on a envie de défiler. |
| 2. Direction artistique et harmonie | 11/15 | Palette nuit, glace et violet et série d'images cohérentes, mais une image Grok a trois mains et le texte du hero se lit mal sur la photo chargée sur téléphone. |
| 3. Animations et effets | 12/15 | Titre lisible à 2,5 s, 60 i/s sans saccade, jauge et galerie horizontale épinglées réussies, mais elles débordent de l'écran sur les portables de 640 à 768 px de haut. |
| 4. Expérience ludique et interactions | 9/10 | Devis en 4 étapes avec curseurs et orientation calculée, filtres, onglets, écran de supervision et son : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 9/15 | Légendes coupées dans la galerie épinglée à 1280×720 et 1366×768, débordement à 320 px, cibles tactiles de 26 à 40 px, libellés mono de 10,9 à 11,5 px. |
| 6. Contenu et fiabilité | 9/10 | Faits recoupés sur nelisfrance.fr (41 ans, jour ouvrable, jour même, 24 h/24, essai en usine, mentions légales) ; « à compléter », « données illustratives » et texte F-gaz « à valider » bien signalés. |
| 7. Technique et performance | 9/10 | Aucune erreur JS ni lien cassé, CLS au chargement de 0,001, accueil à 2,7 Mo ; sans WebGL, le repli fonctionne mais une erreur s'affiche en console. |
| 8. Mise en ligne | 4/5 | Site public ; noindex, X-Robots-Tag, robots.txt, og:image (JPG 1200×630, adresse complète) et `?v=` du site corrects ; il manque une page 404 aux couleurs du client. |
| 9. Accessibilité | 4/5 | Focus visible, « réduire les animations » et Mode calme mémorisé, onglets au clavier, Échap ferme le menu ; cibles et textes trop petits sur téléphone. |
| **Total** | **80/100** | |

## Points forts

- **Une idée forte qui suit tout le site :**
  - l'intro fait descendre la température ;
  - le givre se dissipe sur le hero ;
  - un thermomètre suit le défilement sur le côté ;
  - la jauge épinglée va de 2 kW à 420 kW, puis à −40 °C.
- **La galerie horizontale « Du laser à la cave à vin »** : chaque carte « refroidit » en passant.
- **Un devis simulé clair**, en 4 étapes, avec une orientation calculée à partir des gammes publiées et la mention « Démonstration · rien n'est envoyé ».
- **La barre d'urgence** reste toujours visible et affiche le statut du magasin calculé sur les vrais horaires.
- **Le contenu vient du site actuel** et les données provisoires sont signalées.
- **Les images forment une série cohérente** (nuit, givre, violet), dans laquelle les vraies photos (machine, magasin) s'intègrent bien.

## Défauts

### Bloquants

1. **Galerie épinglée coupée en bas sur les portables courants**
   - Page : accueil, section « Du laser à la cave à vin ».
   - Formats : 1366×768 (légendes coupées de 8 px) et 1280×720 (coupées de 6 à 27 px), sur toute la durée de l'épinglage. À 1024×640, le surtitre passe aussi sous la barre d'urgence.
   - Captures : `captures/epingle-accueil-1-1366x768-50.jpg`, `captures/epingle-accueil-1-1280x720-92.jpg`.
   - Cause : `assets/css/style.css:291` et `:298`. La section `.apps__epingle` fait `100svh`, mais les cartes ont une largeur fixe `clamp(230px, 21vw, 330px)` et un ratio 3/4, si bien que leur hauteur ne s'adapte pas à celle de l'écran.
   - Correction : passer la section en colonne flex de 100svh. Donner à la piste `flex: 1; min-height: 0` et aux médias `height: 100%` sans ratio imposé en mode épinglé, avec la légende en dessous. Mesurer en JS la hauteur de la barre d'urgence et de la navigation (`--entete-h`).
   - Effort : moyen.

2. **Image Grok ratée : trois mains**
   - Page : accueil, carte « Service » (tous formats).
   - Ce qu'on voit : un troisième poing ganté derrière le manifold, en plus des deux gants ; les manomètres n'ont pas de cadran.
   - Fichier : `assets/img/g-service-manometres-784.webp`, à voir dans `captures/images-grok-2.jpg`.
   - Cause : image générée, appelée dans `index.html:210` et `assets/js/images.js:172`.
   - Correction : régénérer l'image avec la consigne de `notes.json` (`imagesGrok`).
   - Effort : petit.

### Importants

1. **Débordement et texte coupé à 320 px**
   - Pages : accueil et Groupes d'eau glacée, format m320. La page fait 327 à 338 px de large.
   - Ce qu'on voit :
     - le titre « LOIN DES SOLUTIONS STANDARDISÉES » et ses paragraphes sont coupés à droite ;
     - le titre « INDUSTRIEL, » du hero touche le bord ;
     - « Réduire les animations » est tronqué.
   - À 360 et 430 px, tout tient.
   - Captures : `captures/groupes-eau-glacee-m320-04.jpg`, `captures/accueil-m320-00.jpg` ; vérification à 360 px : `captures/verif-groupes-m360-standardisees.jpg`.
   - Causes :
     - `assets/css/style.css:637` : `.bloc__texte` est une grille sans `minmax(0,1fr)` ;
     - `:35` et `:689` : la taille minimale des titres, avec `font-stretch: 125%`, est trop large ;
     - `:122` et `:129` : la barre d'urgence ne passe pas à la ligne ;
     - `:56` : `overflow-x: hidden` est posé sur `body` seulement.
   - Correction :
     - `grid-template-columns: minmax(0,1fr)` sur `.bloc__texte` ;
     - un palier de titres plus petits sous 360 px ;
     - garder seulement une icône de 44 px pour « Réduire les animations » sous 360 px ;
     - `overflow-x: clip` sur `html`.
   - Effort : petit.

2. **Jauge « Une puissance pour chaque besoin » : photo coupée en bas**
   - Page : accueil.
   - Formats : 1024×640 (17 px coupés), 1280×720 (49 px) et 1366×768 (39 px). Le texte, lui, reste dans l'écran.
   - Capture : `captures/epingle-accueil-0-1366x768-50.jpg`.
   - Cause : `assets/css/style.css:262` et `:263`. La jauge a une hauteur fixe `min(64vh,580px)` et le palier une image au ratio imposé.
   - Correction : même correctif en colonne flex de 100svh, avec l'image en `flex: 1; min-height: 0`.
   - Effort : moyen.

3. **Zones tactiles de moins de 44 px sur téléphone**
   - Pages et formats : toutes, de m320 à m430.
   - Éléments concernés :
     - « Réduire les animations » : 123×27 ;
     - liens fléchés : hauteur 26 ;
     - bouton Son : 40×40 ;
     - bouton Menu : 44×40 ;
     - logo : 103×34 ;
     - filtres de /location : hauteur 39 ;
     - fil d'Ariane : hauteur 18.
   - Cause : `assets/css/style.css:129`, `:105`, `:152`, `:162` et `:588`.
   - Correction : `min-height: 44px` (et `min-width` pour les boutons ronds), ou une zone de clic étendue par `::after`.
   - Effort : petit.

4. **Textes de moins de 12 px sur téléphone**
   - Éléments concernés :
     - surtitres `.mono` : 11,5 px ;
     - « Urgence frigorifique » : 10,9 px ;
     - KPI et badge « Données illustratives » : 9,9 px.
   - Cause : `assets/css/style.css:40` (`--t-mono: .72rem`) et `:123` (`.68rem`).
   - Correction : `font-size: max(12px, …)` sur ces éléments.
   - Effort : petit.

5. **Page 404 générique de Vercel**
   - Ce qu'on voit : la page en anglais de Vercel, sur toute adresse inconnue.
   - Capture : `captures/planche-404-p1440.jpg`.
   - Cause : aucun `404.html` dans le dépôt.
   - Correction : créer un `404.html` aux couleurs du site, avec un retour à l'accueil et le numéro d'urgence.
   - Effort : petit.

6. **Texte du hero peu lisible sur téléphone**
   - Page : accueil, formats m390 et m320.
   - Ce qu'on voit : le paragraphe passe sur la machine bleue et le givre clair, et le contraste varie d'un mot à l'autre.
   - Capture : `captures/accueil-m390-00.jpg`.
   - Cause : le dégradé du hero est trop léger sur téléphone (`assets/css/style.css:195` et suivantes).
   - Correction : renforcer le dégradé sombre en bas du hero sur téléphone, ou réduire le givre derrière le texte.
   - Effort : petit.

### Finition

1. **Erreur en console sans WebGL** (« unable to create webgl context »). Le repli visuel fonctionne.
   - Cause : `assets/js/frost.js` instancie OGL sans tester WebGL.
   - Correction : tester `getContext('webgl')` avant.
   - Effort : petit.

2. **Pas de barre d'action fixe en bas sur téléphone** (« Devis » et appel). La barre d'urgence du haut joue en partie ce rôle.
   - Effort : petit.

3. **Galerie d'applications sur téléphone** : la première carte colle au bord gauche, et un grand vide suit les légendes.
   - Capture : `captures/accueil-m390-11.jpg`.
   - Cause : `assets/css/style.css:294`.
   - Correction : `scroll-padding-inline: var(--g)` et une marge basse réduite.
   - Effort : petit.

4. **Bouton « Son » sur téléphone** : il n'affiche que quatre points « .... ».
   - Correction : une icône de haut-parleur.
   - Effort : petit.

5. **Devis, étape 1** : « Continuer » sans choix n'affiche aucun message.
   - Cause : `assets/js/form.js`, champ `[data-erreur]` vide.
   - Correction : afficher « Choisissez une option ».
   - Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2,5 s / 2,5 s (intro gel jusqu'à 2 s, titre net à l'étape t2500) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0,001 |
| Poids de l'accueil, p1440 / m390 | 2,7 Mo / 1,4 Mo |
| Erreurs console, sans WebGL, réduire les animations | Aucune erreur JS. Sans WebGL : repli correct, une erreur OGL en console. Réduire les animations : contenu visible, rien ne bloque. |
| Débordement horizontal | Seulement à 320 px (327 et 338 px) ; rien de 360 à 1920 px |
| Sections épinglées | Galerie « Applications » : légendes coupées à 1280×720 et 1366×768. Jauge : photo coupée de 1024×640 à 1366×768. Schéma de /groupes-eau-glacee : correct. |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | Public, noindex partout, X-Robots-Tag `noindex, nofollow`, robots.txt `Allow: /`, og:image JPG 1200×630 avec adresse complète, `?v=20261027` identique sur le CSS et le JS du site, 404 générique de Vercel |

## Vérifications écartées

- **CLS de 1,0 pendant le défilement sur `#applications`** : il vient de l'épinglage. Un suivi image par image (`outils/nelis-pin.mjs`) montre un passage net, sans saut ; ce n'est pas du CLS.
- **Éléments « invisibles »** (paragraphe « Pour nous… », « NELIS GmbH », chiffres « 24/7 ») : ils s'affichent bien après l'attente, à opacité 1 (`outils/nelis-inv.mjs`). C'est une animation encore en cours, pas un blocage.
- **Ouverture « h1 » à environ 220 ms** : la mesure ne voit pas le voile d'intro. Jugée sur les étapes, l'ouverture fait 2,5 s, sous la limite de 3 s.
- **Sticky `.preuves__visuel` et `.parc__visuel` qui dépassent ou passent sous l'en-tête** : c'est le cas à 1000×560, ou seulement en fin de sticky (à 0,92), quand le bloc s'en va normalement. Ce n'est pas un défaut sur les formats courants.
- **Contenu masqué par `div.urgence` en pied de page** : c'est la barre fixe du haut au-dessus du contenu qui défile, un comportement normal.
- **Bibliothèques sans `?v=`** : ce n'est pas pénalisé.
- **Saccades de la première mesure (52 i/s, 13 images > 50 ms)** : elles ne se sont pas reproduites à la mesure faite seule (60 i/s, aucune image > 50 ms).


---

## nelis-maquette : corrections de l'étape 2

Commit 240ad09 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Galerie épinglée « Du laser à la cave à vin » coupée | Bloquant | Section en colonne flex de 100svh, `padding-top: calc(var(--entete-h) + 20px)` ; `--entete-h` mesurée en JS (barre d'urgence + navigation, ResizeObserver) ; piste `flex: 0 1 auto; min-height: 0`, cartes `max-height: 100%`, image qui rétrécit (`min-height: 0`), légende `flex: none` ; palier `max-height: 600px` | style.css, main.js | 1280×720 : légendes coupées de 6 à 27 px → 0 ; 1366×768 : 8 px → 0 ; 1024×640 : surtitre sous l'en-tête 17 px → 0 |
| Jauge « Une puissance pour chaque besoin » : photo coupée | Important | Même méthode : 100svh en colonne, grille en `minmax(0, 1fr)`, jauge en `height: 100%` (max 580 px), photo du palier `max-height: 100%` | style.css | 1024×640 : 17 px → 0 ; 1280×720 : 49 px → 0 ; 1366×768 : 39 px → 0 |
| Débordement et texte coupé à 320 px | Important | `overflow-x: clip` sur html et body ; `.bloc__texte` en `minmax(0, 1fr)` ; titres plus petits sous 360 px ; « Réduire les animations » en icône de 44 px sous 360 px | style.css | m320 : 327 / 338 px → 320 px |
| Cibles < 44 px | Important | 44 px pour logo, Son (44×44), Menu (44×44), liens fléchés, filtres, fil d'Ariane, téléphones, e-mails et liens du pied, bouton calme ; barre d'urgence à 44 px sous 1024 px | style.css | 43–47 cibles par format → 0 |
| Textes < 12 px | Important | `--t-mono: max(12px, .72rem)` et plancher `max(12px, …)` sur titre d'urgence, badges, KPI, journal, étiquettes provisoires, « À compléter » | style.css | 50–52 textes par format → 0 |
| Page 404 générique | Important | `404.html` aux couleurs du site (même CSS, en-tête, menu, pied, chemins absolus), titre « Page introuvable. », retour à l'accueil et numéro d'urgence déjà présent | 404.html | 404 Vercel → page NELIS, aucune erreur de ressource en plus |
| Texte du hero peu lisible sur téléphone | Important | Voile plus sombre sous le texte, givre atténué, paragraphe en couleur pleine avec ombre légère (≤ 760 px) | style.css | Capture m320 : paragraphe lisible sur toute la largeur |
| Pas de barre d'action en bas sur téléphone | Finition (récurrent `barre-bas`) | Barre « Devis » + « Urgence 03 84 68 96 50 » (libellés et numéro déjà présents), masquée par IntersectionObserver sur le hero, le devis et le pied ; `--barres-h` mesurée en JS, ajoutée au bas du pied | toutes les pages, style.css, main.js | Cachée en haut / visible au milieu / cachée en fin, sur les 4 pages à 320 et 390 px ; menu mobile ouvert et fermé |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Image Grok aux trois mains (`g-service-manometres-*.webp`) | Bloquant | Image Grok : à régénérer |
| Erreur console sans WebGL (OGL) | Finition | Finition |
| Galerie sur téléphone : première carte collée au bord, vide sous les légendes | Finition | Finition |
| Bouton « Son » qui n'affiche que quatre points sur téléphone | Finition | Finition |
| Devis, étape 1 : pas de message sans choix | Finition | Finition |
| Sticky `.preuves__visuel` à 1000×560 et fin de sticky (0,92) | Écarté dans le rapport | Comportement normal (fin de sticky), inchangé |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal | m320 : 338 px ; autres formats : aucun | Aucun (m320 : 320 px) |
| Textes < 12 px (sélecteurs, 4 pages) | m320–m430 : 50 ; t820 : 52 | 0 partout |
| Cibles < 44 px (sélecteurs, 4 pages) | m320 : 43 ; m360–m430 : 44 ; t820 : 47 | 0 partout |
| Éléments couverts | 1 à m320, t820 et g1920 | 8 à m320 et m430, 2 à t820 : toujours la barre d'urgence fixe du haut sur le pied, à l'arrêt de défilement (comportement normal écarté dans le rapport ; la barre fait 44 px au lieu de 36 sur téléphone) |
| Épinglage GSAP (colonne + galerie) aux 8 tailles | 18 cas KO (1024×640, 1280×720, 1366×768) | 0 |
| Sticky (preuves, parc) | Fin de sticky et 1000×560 | Inchangé (écarté) |
| Erreurs console | 9 (adresse 404 testée) | 9 (le statut 404 de la page elle-même), aucune nouvelle |
| Modules chargés deux fois | 0 | 0 |

À noter : une première version passait `overflow-x: clip` sur html avec `overflow-x: hidden` sur body, ce qui cassait les sticky. Corrigé (clip sur les deux), puis vérifié par l'audit final.

## Note proposée
Ancienne note 80/100 → nouvelle note 89/100
- Direction artistique 11 → 12 : texte du hero lisible sur téléphone ; l'image aux trois mains reste.
- Animations 12 → 14 : jauge et galerie épinglées tiennent dans l'écran à toutes les tailles.
- Tous les formats 9 → 13 : plus de débordement à 320 px, plus de texte < 12 px ni de cible < 44 px, barre du bas.
- Mise en ligne 4 → 5 : page 404 aux couleurs du site.
- Accessibilité 4 → 5 : cibles et textes conformes sur téléphone.

Bloquants restants : 1 (image Grok)


## Images Grok définitives (29/10)

Commit 8ab8326 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| `g-service-manometres-{480,784}.webp` | Image à trois mains | 4:3 recadré de y=240 à 828 : deux manomètres à cadran et deux gants entiers ; 784×588 et 480×360 (manifeste `images.js` : r 0,6712 → 1,3333) | « Deux mains gantées tiennent un manifold à manomètres bleu et rouge, raccordé par des flexibles à une tuyauterie en cuivre givrée » | 1440×900, 1920×1080, 1366×768, 1000×560, 390×844 : image chargée et nette, 0 erreur console, 0 réponse 404, CLS au chargement ≤ 0,0020 ; les décalages au défilement viennent uniquement des sections épinglées (`.apps` épinglée, inchangée) ; versions `?v=20261029` partout |

Note : 88/100 → 89/100 (c2 +1 : image à trois mains remplacée) · bloquants : 1 → 0 · Prête à envoyer
