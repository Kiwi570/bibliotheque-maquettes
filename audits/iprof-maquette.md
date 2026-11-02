# iprof-maquette

<https://iprof-maquette.vercel.app> · audit du 27/10/2026 · dernier commit cd11aa0 du 23/10/2026

## Verdict

**79/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Concept « cahier du prof » juste et soigné (petits carreaux, marge rouge, notes au Caveat, jargon corrigé au stylo rouge, photo révélée à l'encre WebGL), fluide à 60 i/s, avec toutes les interactions fonctionnelles. Mais le titre d'accueil « Mac, iPad, iPhone » est coupé à droite en 1920×1080, et la mise en ligne garde trois écarts (robots.txt « Disallow: / », Cache-Control dans vercel.json, aucun ?v=).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Univers du cahier suisse original et parfaitement adapté à un prof d'informatique pour débutants, photo révélée par une tache d'encre, mais une ouverture sage, sans moment fort. |
| 2. Direction artistique et harmonie | 12/15 | Palette encre bleue, rouge et fluo, Fraunces + Atkinson + Caveat cohérents sur toutes les pages, images IA homogènes (lumière dorée, Léman) ; les scènes montrent une jeune enseignante alors que le prof est Beat Haechler, et le titre est coupé en 1920. |
| 3. Animations et effets | 13/15 | 60 i/s sans saccade, titre lisible à 1 s, révélation à l'encre, galerie horizontale épinglée, fiches empilées, transition de page en feuille, plume-curseur ; fiches empilées tronquées à 1000×560. |
| 4. Expérience ludique et interactions | 9/10 | Menu mobile (Échap compris), filtres de thèmes avec Flip, fiches retournables, calculateur (distance, bornes 1 à 20), demande en 3 étapes avec erreurs et récapitulatif, boutons Copier, Mode calme et A+ mémorisés : tout fonctionne. |
| 5. Tous les formats | 9/15 | Titre d'accueil coupé de 18 px en 1920×1080 et 16 px en 1728×1000 (124 px avec A+), pastille Calme/A+ qui recouvre « Rendez-vous » à 320 px, fiches épinglées coupées à 1000×560, lien e-mail de 28 px de haut. |
| 6. Contenu et fiabilité | 9/10 | Données manquantes bien marquées (« à compléter », « à confirmer », rabais 10 % / 11 % signalé, « Illustratif »), mentions légales présentes ; les visuels d'une enseignante contredisent « votre prof Beat Haechler ». |
| 7. Technique et performance | 9/10 | Aucune erreur console, CLS max 0,003, accueil 1,06 Mo, repli sans WebGL propre ; pas de ?v= sur site.css, site.js et ink.js. |
| 8. Mise en ligne | 2/5 | Public, meta noindex, nofollow partout, og:image JPG 1200×630 absolue et 404 personnalisée ; mais robots.txt « Disallow: / », Cache-Control dans vercel.json et aucun ?v=. |
| 9. Accessibilité | 4/5 | Mode calme et « réduire les animations » respectés, bouton A+, focus très visible, Atkinson Hyperlegible, erreurs de formulaire en clair ; lien e-mail de 28 px et barre basse qui reste sur le pied de page. |
| **Total** | **79/100** | |

## Points forts

- Idée forte et propre au métier : le site est un cahier à petits carreaux avec marge rouge, photos scotchées, post-it « Débutants bienvenus » et le jargon barré puis reformulé au stylo rouge.
- Ouverture rapide et lisible : titre complet à 1 s sur portable et téléphone, polices chargées en 0,2 s, photo du hero révélée par une tache d'encre (OGL) avec repli propre sans WebGL.
- Fluidité parfaite (60 i/s sur p1440 et m390, aucune image > 50 ms) malgré GSAP, Lenis, SplitText, Flip et WebGL.
- Interactions toutes fonctionnelles et utiles : filtres de thèmes animés, fiches qui se retournent, calculateur de prix qui gère la visioconférence, demande de rendez-vous en 3 étapes avec validation et récapitulatif, copie du numéro et de l'e-mail.
- Honnêteté du contenu : « à compléter » visibles, rabais 10 % / 11 % signalé, « Estimation illustrative », « Maquette : rien n'est envoyé », images d'ambiance signalées comme générées par IA dans les mentions.
- Confort de lecture pensé pour un public senior : bouton A+, Mode calme, barre d'appel fixe sur téléphone.

## Défauts

### Bloquants

1. **Titre d'accueil coupé en grand écran** : accueil, g1920 (« iPhon| » coupé de 18 px) et 1728×1000 (16 px), et dès 1440×900 avec A+ (11 px ; 124 px en 1920 avec A+), `captures/accueil-g1920-00.jpg`, `captures/iprof-h1-1920.jpg`, `captures/iprof-h1-1440-big.jpg`. Cause : `index.html:55` met « Mac, iPad, iPhone » en `.nobr`, `assets/css/site.css:74` fait monter `.display` jusqu'à 5,3rem (84,8 px) alors que la colonne `.hero__text` reste à 562 px (`site.css:161`, `--max: 1280px` à `site.css:31`), et `assets/js/site.js:446` découpe le titre avec `mask: "lines"` (overflow hidden) qui rogne la ligne trop longue. Correction : plafonner le titre d'accueil à la colonne, par exemple `.hero--home .display { font-size: clamp(2.5rem, 1.3rem + 4.2vw, 4.9rem); }` et `.hero--home .hero__text { container-type: inline-size; } .hero--home .display { font-size: min(…, 14.5cqi); }`, ou retirer `.nobr` au-dessus de 900 px ; vérifier à 1440, 1728, 1920 et 2560, avec et sans A+. Effort : petit.

### Importants

1. **Les scènes montrent une jeune enseignante alors que le prof est Beat Haechler** : accueil, cours individuels, conseils (hero), `assets/img/ia-accueil-ouverture-*.webp`, `ia-cours-ouverture(-mobile)-*.webp`, `ia-conseils-ouverture-*.webp`, `captures/accueil-p1440-00.jpg`. L'alt dit « une personne âgée et son prof », la page présente ensuite « votre prof » en photo réelle (homme d'une soixantaine d'années) : le visiteur voit deux profs différents. Le README le signale, pas le site. Cause : prompts de génération. Correction : régénérer ces 3 scènes avec un homme aux cheveux gris de dos ou de trois quarts dos (sans visage reconnaissable), ou ajouter une étiquette « image d'ambiance » visible. Effort : moyen.
2. **Pastille Calme / A+ qui recouvre « Rendez-vous » à 320 px** : toutes les pages, m320 (bouton de 128 à 245 px, pastille de 206 à 308 px ; collé à 360 px), `captures/accueil-m320-00.jpg`. Cause : `assets/css/site.css:522-524`, colonnes `1fr 1fr` + `white-space: nowrap` sur `.callbar .btn` : la largeur minimale des boutons déborde la réserve de 112 px. Correction : `grid-template-columns: minmax(0,1fr) minmax(0,1fr)` et, sous 360 px, icône masquée et `font-size: .85rem` (ou libellé « RDV »). Effort : petit.
3. **Barre d'appel du bas visible sur le formulaire et le pied de page** : toutes les pages, m390, `captures/contact-m390-zz.jpg`, `captures/planche-contact-m390.jpg`. Cause : `assets/css/site.css:522`, aucune logique de masquage dans `assets/js/site.js`. Correction : IntersectionObserver sur `#rdv-form` et `.foot` qui ajoute `.callbar.is-off { transform: translateY(110%); }` (et la pastille Calme/A+ avec). Effort : petit.
4. **Fiches épinglées coupées en petit portable** : /cours-individuels, 1000×560 (image coupée de 26 à 45 px, légende de 17 px sous la fiche suivante), accueil 1000×560 et 1024×640 (section jargon, image 64 px, légende 9 px), `captures/epingle-cours-individuels-0-1000x560-8.jpg`, `captures/epingle-accueil-0-1000x560-8.jpg`. Cause : `assets/css/site.css:323` `.stack__card { position: sticky; top: calc(var(--header-h) + 1.5rem + …) }` sans limite de hauteur, et épinglage de `.jargon__head` dans `assets/js/site.js:521`. Correction : palier `@media (max-height: 640px)` qui limite `.stack__card .ph__frame` à `max-height: calc(100svh - var(--entete-h) - 6rem)` et réduit marges et titres. Effort : petit.

### Finition

1. **Lien e-mail de 28 px de haut** : toutes les pages, téléphones, `span.copyrow__mail > a` (141×28). Cause : `assets/css/site.css:282`. Correction : `.copyrow__mail a { min-height: 44px; display: inline-flex; align-items: center; }`. Effort : petit.
2. **Légendes manuscrites coupées par des points de suspension** : « sur votre matérie… », « le temps effectif, rien de pl… » (accueil, tarifs, tous formats), `captures/accueil-g1920-04.jpg`. Cause : `assets/css/site.css:180` `.ph__cap { white-space: nowrap; text-overflow: ellipsis; }`. Correction : `white-space: normal` avec `text-wrap: balance`, ou légendes plus courtes. Effort : petit.
3. **Pas de ?v= sur le CSS et le JS du site** : 8 pages, `assets/css/site.css`, `assets/js/site.js`, `assets/js/ink.js` (`index.html:25`, `index.html:266-267`). Correction : même `?v=2026102701` partout. Effort : petit.
4. **robots.txt « Disallow: / » et Cache-Control dans vercel.json** : `robots.txt:2`, `vercel.json:29-37` (fonts et vendor). Correction : `Allow: /` et supprimer le bloc Cache-Control ; passer aussi X-Robots-Tag à « noindex, nofollow » (`vercel.json:24-25`). Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1,0 s / 1,0 s (h1 à 0,27 s et 0,18 s en vidéo ; photo révélée à l'encre vers 2 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0,0032 (/conseils p1280) |
| Poids de l'accueil, p1440 / m390 | 1,06 Mo / 0,70 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur (hors 404 de test) ; sans WebGL : photos affichées, h1 à 0,2 s ; réduit : h1 à 0,2 s, aucune animation bloquante |
| Débordement horizontal | Aucun ; titre d'accueil rogné de 18 px en g1920 (16 px en 1728) par le masque SplitText |
| Sections épinglées | Accueil : galerie horizontale OK, jargon coupé à 1000×560 et 1024×640 ; Cours : fiches empilées coupées à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex, nofollow OK · X-Robots-Tag « noindex » · robots.txt « Disallow: / » · og:image JPG 1200×630 absolue · ?v= absent · 404 personnalisée · Cache-Control dans vercel.json |

## Vérifications écartées

- « MASQUÉ » par la barre du bas (accueil m320, conseils m430, contact m320, cours m320, mentions m360, tarifs m360/m430, 404 m360/m390) : éléments situés juste sous le pli à l'ouverture, ils remontent au défilement et le dernier bloc reste lisible au-dessus de la barre (`captures/accueil-m390-zz.jpg`).
- Cible « Cours » 43×44 dans le pied de page : 1 px de largeur en moins, hauteur conforme, non retenu.
- Erreur « Failed to load resource 404 » : uniquement sur la page introuvable de test, normale.
- « + de 26 / 27 ans » sur certaines captures : compteur animé saisi en cours de route, il s'arrête bien sur 30 (`captures/accueil-p1440-10.jpg`).
- Case « Vous appelez ou vous écrivez » non cochée sur `captures/cours-individuels-m390-06.jpg` : coche animée à l'entrée dans l'écran, cochée sur la capture suivante.
- Fiche « Virus » et bloc visioconférence en dessin : emplacements provisoires annoncés (« photo à venir »), pas des défauts d'image.
- Images IA vues en taille réelle (24 scènes) : mains, doigts, stylos, tablettes, câbles et paysages du Léman sans déformation, sans texte ni filigrane ; portrait et photo au bureau : photos réelles du site actuel.
- X-Robots-Tag « noindex » sans nofollow : non pénalisé (règle commune).


---

## iprof-maquette : corrections de l'étape 2

Commit 4d8670f (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Titre d'accueil « Mac, iPad, iPhone » coupé en 1920, 1728 et dès 1440 avec A+ | Bloquant | `.hero--home .hero__text` en `container-type: inline-size`, titre en `min(clamp(…), 14cqi)` : il ne dépasse plus jamais sa colonne, A+ compris | `assets/css/site.css` | 1920 : texte 18 px hors colonne → 24 px de marge ; 1728, 1440 A+, 1920 A+, 2560 A+ : coupé → ok (`preuve-avant-titre-g1920.jpg`, `preuve-titre-g1920.jpg`, `preuve-titre-1440-aplus.jpg`) |
| Pastille Calme / A+ qui recouvre « Rendez-vous » à 320 px | Important | Colonnes `minmax(0, 1fr)` ; sous 360 px, « Appeler » en icône seule (libellé gardé pour les lecteurs d'écran) | `site.css` | 320 : bouton 128–245 sur la pastille 206–308 → 74–196, aucun chevauchement (`preuve-barre-m320.jpg`) |
| Barre d'appel visible sur le formulaire et le pied de page | Important | IntersectionObserver : barre et pastille n'apparaissent qu'une fois l'ouverture dépassée, masquées sur `#rdv-form`, le pied, le menu ouvert et la 404 ; `--barres-h` mesurée en JS (ResizeObserver) et réservée en `padding-bottom` | `assets/js/site.js`, `site.css` | Éléments couverts par la barre (m320 à m430) : 9 → 0 ; contrôlé sur /, /cours-individuels, /tarifs, /contact, 404 et menu ouvert |
| Fiches empilées (/cours-individuels) et jargon épinglé (accueil) coupés à 1000×560 et 1024×640 | Important | Méthode « Tout tenir dans l'écran » : `--entete-h` mesurée en JS ; `top` des fiches calé dessus ; photo de la fiche et bloc jargon en colonne flex avec `max-height` tiré de `100svh - --entete-h`, cadre photo `flex: 1; min-height: 0` | `site.css`, `site.js` | Épinglage : 15 mesures en défaut sur 111 → 0 (`preuve-avant/apres-fiches-1000x560.jpg`, `preuve-avant/apres-jargon-1000x560.jpg`) |
| Lien e-mail de 28 px de haut | Finition (récurrent cible-44) | `.copyrow__mail a` en `inline-flex`, `min-height: 44px` (tous formats) | `site.css` | 141×28 → 44 px ; cibles < 44 px : 80 → 0 |
| Lien « Cours » du pied 43×44 | Écarté au rapport | `min-width: 44px` sur les liens du pied | `site.css` | 43 → 44 px |
| Mise en ligne (robots.txt, X-Robots-Tag, Cache-Control, ?v=) | Finition | Déjà corrigé à l'étape 1 (c5b140c), vérifié : `Allow: /`, X-Robots-Tag « noindex » inchangé, plus de Cache-Control ; versions passées à `?v=20261028-2` (24 références, aucune ancienne) | toutes les pages | — |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Scènes montrant une jeune enseignante au lieu de Beat Haechler (8 images de `imagesARefaire`) | Important | Images IA régénérées par l'utilisateur (non touchées, non masquées) |
| Légendes manuscrites coupées par des points de suspension | Finition | Finition non traitée |
| Ouverture sage, sans moment fort (critère 1) | — | Hors périmètre |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Titre d'accueil (mesure dédiée, texte vs colonne) | coupé de 18 px en 1920, 16 px en 1728, jusqu'à 124 px avec A+ | dans la colonne de 1000 à 2560, avec et sans A+ |
| Textes < 12 px | 0 | 0 |
| Cibles < 44 px | 80 (e-mail 141×28 et « Cours » 43×44, m320 à t820) | 0 |
| Éléments couverts par la barre du bas | 9 (m320 à m430) | 0 |
| Épinglage aux 8 tailles (jargon, galerie, fiches) | 15 mesures en défaut (1000×560 et 1024×640) | 0 sur 111 |
| Erreurs console (hors 404 de test) | 0 | 0 |
| Modules chargés deux fois | 0 | 0 (une seule version `?v=20261028-2`) |

## Note proposée
Ancienne note 79/100 → nouvelle note 90/100 · bloquants restants : 0
- Direction artistique 12 → 13 : le titre coupé en 1920 est corrigé (les scènes restent à régénérer).
- Animations 13 → 14 : les fiches empilées ne sont plus tronquées à 1000×560.
- Tous les formats 9 → 13 : titre, pastille à 320 px, fiches épinglées et lien e-mail corrigés.
- Technique 9 → 10 : ?v= présent et cohérent (étape 1).
- Mise en ligne 2 → 5 : robots.txt, Cache-Control et ?v= corrigés (étape 1).
- Accessibilité 4 → 5 : lien e-mail à 44 px et barre masquée sur le pied de page.

## Images Grok définitives (29/10)

Commit a725ee6 (non poussé)

| Image | Remplace | Recadrage / tailles produites | Alt | Vérifié |
|---|---|---|---|---|
| ia-accueil-ouverture-1536 | `ia-accueil-ouverture-{640,1024,1536}` | 3:2 centré (1168×779), 1536×1024 (×1,31), 1024×683, 640×427 | prof aux cheveux gris et dame aux cheveux blancs, de dos, devant l'écran, lac | 5 formats, accueil |
| ia-accueil-ouverture-mobile-1024 | `ia-accueil-ouverture-mobile-{480,768,1024}` | 2:3 centré (779×1168), 1024×1536 (×1,31), 768×1152, 480×720 | (alt partagé du `<picture>` d'accueil, écrit pour les deux) | 390×844 |
| ia-apropos-enseigner-1024 | `ia-apropos-enseigner-{480,768,1024}` | 2:3 centré, mêmes 3 tailles | homme aux cheveux gris de trois quarts dos, deux mains sur un carnet, schéma | À propos, Cours |
| ia-conseils-ouverture-1536 | `ia-conseils-ouverture-{640,1024,1536}` | 3:2 centré, mêmes 3 tailles | homme aux cheveux gris montre une tablette à une dame aux cheveux blancs | Conseils, Cours |
| ia-cours-ouverture-1536 | `ia-cours-ouverture-{640,1024,1536}` | 3:2 centré, mêmes 3 tailles | homme aux cheveux gris et dame aux cheveux blancs, de dos, devant un portable | Cours |
| ia-cours-ouverture-mobile-1024 | `ia-cours-ouverture-mobile-{480,768,1024}` | 2:3 centré, mêmes 3 tailles | (alt partagé du `<picture>` de Cours) | 390×844 |
| ia-formation-1024 | `ia-formation-{480,768,1024}` | 2:3 centré, mêmes 3 tailles | homme aux cheveux gris de trois quarts dos au clavier, une main désigne une photo | Accueil |
| ia-seance-1024 | `ia-seance-{480,768,1024}` | 2:3 centré, mêmes 3 tailles | séance à la table : main d'élève sur un carnet, homme aux cheveux gris de trois quarts dos au portable (plus de vue du dessus) | Cours, Tarifs |

- Aucune taille impossible : 1536 px depuis 1168 px = ×1,31 (≤ 1,5), idem 1024 px depuis 784 px ; descripteurs `w` du srcset déjà exacts, pas d'attributs width/height (cadres à `aspect-ratio` fixe). Accentuation légère seulement sur les tailles agrandies.
- og:image (`og-iprof.jpg`, photo réelle de Beat) non concernée. Pas de CSS/JS modifié, donc `?v=` inchangé.
- Vérification Playwright 1440×900, 1920×1080, 1366×768, 1000×560, 390×844 sur accueil, cours, à propos, conseils, tarifs : 0 réponse ≥ 400, 0 erreur console, images nettes et sujet visible. CLS ≤ 0,004 partout sauf accueil 1000×560 : 0,166, **préexistant** (identique avant le commit, décalage du bloc `.prof__media` / citation, sans lien avec ces images) — à traiter à part.

Note : 90/100 → 92/100 (critères 2 et 6 : visuels d'une jeune enseignante remplacés par un prof homme aux cheveux gris) · bloquants : 0 → 0 · Prête à envoyer
