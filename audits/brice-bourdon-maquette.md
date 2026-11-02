# brice-bourdon-maquette

<https://brice-bourdon-maquette.vercel.app> · audit du 28/10/2026 · dernier commit b9270b7 du 27/10/2026

## Verdict

**82/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Direction « Axe » très aboutie (colonne en particules, fil à plomb, statokinésigramme, planches techniques), contenu sourcé et « à compléter » bien signalé. Le seul bloquant est la section épinglée « Quatre lectures du même corps », dont le titre passe sous l'en-tête et le texte sort de l'écran en 1280×720 et 1440×900.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture au fil à plomb puis colonne vertébrale en particules qui s'aligne au défilement : original et juste pour un ostéopathe, mais le héros apparaît une demi-seconde avant l'intro. |
| 2. Direction artistique et harmonie | 13/15 | Palette os, graphite et bleu signal, Geist et Geist Mono, grilles et repères techniques cohérents sur les 3 pages ; le jambage du « g » de « le geste. » est rogné par le masque de ligne. |
| 3. Animations et effets | 11/15 | 60 i/s sans saccade, galerie horizontale, rideau entre pages, boutons magnétiques ; mais l'épinglage de l'approche coupe le contenu et le titre n'est lisible qu'après ≈ 3 s. |
| 4. Expérience ludique et interactions | 9/10 | Réservation simulée en 4 étapes avec retour, filtres du journal, FAQ, copie du numéro, menu mobile, mode calme : tout fonctionne. |
| 5. Tous les formats | 10/15 | Aucun débordement, mais section épinglée coupée en 1280×720 et 1440×900, barre mobile restée sur le pied de page, textes de 10–11 px et liens de pied de page de 24 px sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | Chiffres, dates et articles repris du site actuel, « à compléter » et « Passé » bien marqués, note maquette sur le numéro ; les chiffres « 20 000 patients » et « 5/5, 250 avis » restent à confirmer. |
| 7. Technique et performance | 9/10 | Aucune erreur console, CLS 0, accueil 0,9 Mo, version sans WebGL en Canvas 2D ; la page 404 utilise des chemins relatifs. |
| 8. Mise en ligne | 4/5 | Public, noindex partout, og:image 1200×630 absolue, ?v= identique, 404 aux couleurs ; X-Robots-Tag absent de vercel.json. |
| 9. Accessibilité | 4/5 | Focus visible (2 px bleu), lien d'évitement, mode calme et réduire les animations respectés ; textes mono sous 12 px. |
| **Total** | **82/100** | |

## Points forts

- Concept « l'axe avant le geste » décliné partout : colonne WebGL qui se redresse, couches d'analyse posturale, fil à plomb de navigation, horizon qui se remet de niveau dans l'article.
- Réservation simulée claire (cabinet, motif, créneau, récapitulatif) qui renvoie vers Doctolib, avec mention « créneaux fictifs ».
- Prudence réglementaire exemplaire : pas de promesse de résultat, certificat médical pour les moins de 6 mois, orientation vers le 15.
- Images générées (grossesse, drap, texture, horizon) propres et cohérentes avec les photos du site actuel.
- 60 i/s sur ordinateur et téléphone, CLS 0, mode sans WebGL et mode calme complets.

## Défauts

### Bloquants

1. **Section « Approche » épinglée coupée** : accueil, 1280×720, 1366×768 et 1440×900 (aussi 1000×560 et 1024×640), `captures/epingle-accueil-2-1280x720-50.jpg`, `captures/epingle-accueil-2-1440x900-50.jpg`. Le titre « Quatre lectures du même corps » passe sous l'en-tête (61 à 155 px) et le texte du 4e pilier sort en bas. Cause : `assets/js/home.js:236`, l'épinglage porte sur `.approche__layout` entier (titre + 4 piliers + figure) avec `start: 'center center'`, alors que ce bloc est plus haut que l'écran ; `assets/css/style.css:291-292` (figure à 78vh). Correction : épingler à `top top+=var(--entete-h)` une section en colonne flex de 100svh, sortir le titre de la zone épinglée ou réduire les piliers inactifs à leur seul titre (texte du pilier actif seulement), figure en `flex: 1; min-height: 0`. Effort : moyen.

### Importants

1. **Le héros apparaît avant l'intro** : accueil, tous formats, `captures/bande-ouverture-p1440.jpg` (0,5 s), `captures/bande-ouverture-m390.jpg`. Cause : `index.html:2` démarre avec `class="no-js"` et `style.css:155` masque `.intro` sous `no-js` ; la classe n'est retirée qu'au chargement du module (`assets/js/core.js:9`). Correction : script en ligne dans le `<head>` qui remplace `no-js` par `js` avant le CSS (garder le filet de 4 s). Effort : petit.
2. **Titre lisible vers 3 s** : accueil, `captures/ouverture-p1440-t3000.jpg`, `captures/ouverture-m390-t3000.jpg` ; « le geste. » finit de monter entre 3 et 4 s (confirmé par une mesure seule : titre complet entre 3 et 4 s). Cause : `assets/js/core.js:214-226` (intro de 2,5 s) puis `home.js:54` (révélation de 1,3 s). Correction : faire monter l'intro à 1,65 → 1,2 s et lancer la révélation du titre pendant la sortie du voile. Effort : petit.
3. **Barre mobile visible sur le pied de page** : accueil et réflexes, m320 à t820, `captures/inter-pied-m390.jpg`, `captures/accueil-m390-zz.jpg`. Cause : `assets/css/style.css:452`, aucune règle de masquage. Correction : IntersectionObserver sur `#rdv` et `footer` qui ajoute une classe `is-hidden` (`transform: translateY(100%)`). Effort : petit.
4. **Jambage du « g » rogné** : accueil, tous formats, `captures/epingle-accueil-0-1280x720-50.jpg`. Cause : `style.css:168` `line-height: .86` avec `mask: 'lines'` (`home.js:53`). Correction : `.hero__title .split-line { padding-bottom: .15em; margin-bottom: -.15em; }`. Effort : petit.
5. **Textes de moins de 12 px et cibles de moins de 44 px sur téléphone** : m360 à m430. `brand__role` 10 px (`style.css:101`), `.todo` 11 px (`style.css:73`), `small` de la barre mobile 11 px (`style.css:455`), relevés « Inclinaison frontale » 10 px ; liens du pied de page 24 px, numéro de téléphone 30 px, lien « Le bilan des réflexes archaïques » 26 px. Correction : plancher `max(12px, …)` et `min-height: 44px` sur ces liens. Effort : petit.

### Finition

1. **Épinglage du héros et des profils un peu serré** : 1280×720, statokinésigramme coupé de 52 px et fin du texte des cartes profils coupée de 22 px, `captures/epingle-accueil-1-1280x720-92.jpg`. Correction : palier `max-height: 760px` qui réduit la hauteur des médias. Effort : petit.
2. **En-tête sur 3 lignes à 320 px** : « Brice / Bourdon / Ostéopathe D.O. », `captures/planche-accueil-m320.jpg`. Correction : `white-space: nowrap` sur le nom et masquer `brand__role` sous 360 px. Effort : petit.
3. **Page 404 en chemins relatifs** : `404.html` appelle `assets/…` ; une adresse manquante sous `/journal/` charge la 404 sans style. Correction : chemins absolus `/assets/…`. Effort : petit.
4. **Surtitre sous l'en-tête en 1920×1080** : « Approche » masqué de 18 px pendant l'épinglage. Corrigé avec le bloquant.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 3 s / ≈ 3 s (confirmé par une mesure seule : titre complet entre 3 et 4 s) |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien) |
| CLS au chargement (max) | 0 |
| Poids de l'accueil, p1440 / m390 | 0,89 Mo / 0,95 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune (hors 404 attendu de la page introuvable) ; sans WebGL : colonne en Canvas 2D ; réduit : contenu visible d'emblée |
| Débordement horizontal | aucun (3 pages + article, 9 formats) |
| Sections épinglées | héros, profils (galerie horizontale), approche (coupée en 1280–1440), carte et portrait en sticky sans problème |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui, oui (4 pages), absent, absent (non pénalisé), 1200×630 JPG absolue, 20261027 partout, 404 personnalisée |

## Vérifications écartées

- Ouverture t820 « h1 6 060 ms » : prise sous charge pendant 5 maquettes en parallèle ; les autres formats sont à 0,2–0,6 s et les étapes chronométrées donnent ≈ 3 s.
- Éléments « masqués par l'en-tête » au pied de page (numéros, liens, boutons de la 404) : capture au moment du défilement, l'en-tête translucide passe au-dessus d'un contenu qui défile ; rien n'est inaccessible.
- « Voir les tarifs » sous la barre du bas à 320 px sur la page réflexes : le bouton remonte au défilement, pas un contenu coupé.
- Erreur « 404 » sur /zz-page-introuvable-audit : statut attendu de la page introuvable.
- Inventaire des pages : l'article `/journal/vertiges-troubles-equilibre` manquait au résumé ; capturé en m390 et p1440 (`captures/article-*.jpg`), aucun débordement, aucune erreur. Ses dates (18 août 2026, vérification du 27 juillet 2026) viennent bien du site actuel.
- Échec de clic du menu mobile dans le premier script : Playwright attendait la stabilité d'un bouton magnétique ; en tactile, le menu s'ouvre, verrouille le défilement, se ferme à Échap et au clic sur un lien (`captures/inter-menu-m390.jpg`).
- Photos de stock du journal (homme qui se tient la tête, enfant avec cache-œil) : reprises du blog actuel du client, pas d'images Grok.


---

## brice-bourdon-maquette : corrections de l'étape 2

Commits 9343f67 et 31bc06a (non poussés) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Section « Approche » épinglée coupée (titre sous l'en-tête, 4e pilier hors écran) | Bloquant | La section entière est épinglée en `top top`, colonne flex de 100svh avec `padding-top: var(--entete-h)` mesuré en JS (ResizeObserver) ; figure en `flex: 1; min-height: 0; height: 100%` ; seul le pilier actif montre son texte (les autres restent lisibles par les lecteurs d'écran et s'ouvrent au focus) ; tailles en `svh` et palier `max-height: 600px` ; canvas redimensionné au refresh | assets/js/home.js, assets/js/core.js, assets/css/style.css | Approche « bad » aux 8 tailles : 21 → 0 ; `preuve-approche-*` |
| Surtitre « Approche » sous l'en-tête en 1920×1080 | Finition (corrigé avec le bloquant) | Idem | idem | 18 px → 0 |
| Héros visible avant l'intro | Important | Script en ligne dans le `<head>`, avant le CSS : `no-js` → `js` et mode calme appliqué d'emblée ; filet de 4 s conservé | index.html, reflexes-archaiques.html, 404.html, journal/vertiges-troubles-equilibre.html | Aucun flash mesuré (p1440, m390) |
| Titre lisible vers 3 s | Important | Intro resserrée (voile qui part à 1,2 s au lieu de 1,65 s) et révélation du titre lancée pendant la sortie du voile (1 s au lieu de 1,3 s) | assets/js/core.js, assets/js/home.js | ≈ 3–4 s → ≈ 2,1 s (mesure seule, p1440 et m390) |
| Barre mobile sur le pied de page | Important | IntersectionObserver : visible seulement une fois le héros dépassé, masquée sur `#rdv`, les formulaires, le pied, le menu ouvert, la 404 et les sections épinglées en grand écran ; `--barres-h` mesurée en JS, pied en `padding-bottom: calc(40px + var(--barres-h))` | assets/js/core.js, assets/css/style.css | Éléments couverts par la barre (m320–m430, t820) : 1 → 0 ; `preuve-pied-m390-*` |
| Jambage du « g » rogné | Important | `.hero__title > * { padding-bottom: .15em; margin-bottom: -.15em; }` sur les masques de ligne SplitText | assets/css/style.css | `preuve-titre-jambage-g-apres.jpg` |
| Textes < 12 px sur téléphone | Important | `--t-mono: max(12px, .75rem)` et tous les `.625rem` / `.6875rem` ramenés à `var(--t-mono)` (rôle, todo, relevés, barre, dt, badges, statut, bouton copier, étiquettes) | assets/css/style.css | Accueil m390 : 14 → 2 (libellés SVG du plan) ; réflexes : 8 → 0 ; 404 : 4 → 0 |
| Cibles < 44 px sur téléphone | Important | `min-height: 44px` sur liens du pied, numéro, lien du pilier, fil d'Ariane, lien de FAQ, marque ; bouton menu `min-width: 44px` (sous 900 px ou pointeur grossier) | assets/css/style.css | Accueil m390 : 5 → 0 ; réflexes : 5 → 0 ; 404 : 3 → 0 |
| Galerie des profils épinglée coupée (22 px en 1280×720, 3 à 29 px en 1366×768, plus à 1000×560 et 1024×640) | Finition, reprise à la demande (rendu 1280×720 et 1366×768) | Méthode « Tout tenir dans l'écran » : section de 100svh en colonne flex sous `--entete-h` mesurée, piste en `flex: 0 1 auto; min-height: 0` centrée, cartes en subgrid (images de même hauteur, textes alignés, image en `minmax(0, 400px)`), paliers `max-height: 800px` et `600px` ; vérifié en position stabilisée (Lenis `immediate`) | assets/css/style.css (commit 31bc06a) | Profils « bad » aux 8 tailles : 15 → 0 ; `preuve-profils-*` |
| X-Robots-Tag absent | Important | Déjà corrigé à l'étape 1 (vérifié dans vercel.json) | — | — |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Héros épinglé : canvas coupé de 28 à 52 px, bouton de 15 px à 1000×560 | Finition | Finition |
| Libellés du plan SVG des cabinets à 9–9,5 px sur téléphone | Finition | Plan schématique mis à l'échelle par le viewBox ; agrandir les libellés demande de redessiner le plan |
| En-tête sur 3 lignes à 320 px | Finition | Finition |
| Page 404 en chemins relatifs | Finition | Finition |
| Chiffres « 20 000 patients » et « 5/5, 250 avis » à confirmer | — | Donnée manquante |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (9 formats, 3 pages) | aucun | aucun |
| Textes < 12 px (accueil m320/m360/m390/m430/t820) | 12 / 14 / 14 / 14 / 14 | 1 / 2 / 2 / 1 / 2 (libellés SVG du plan) |
| Textes < 12 px (réflexes, 404, téléphone) | 8, 4 | 0, 0 |
| Cibles < 44 px (accueil, réflexes, 404, téléphone) | 5–6, 5, 3 | 0, 0, 0 |
| Éléments couverts par la barre du bas | 1 (réflexes m320, ouverture) | 0 |
| Éléments couverts par l'en-tête (au pied, capture pendant le défilement, écarté dans le rapport) | 1–2 par page | 1–2 par page (même artefact) |
| Épinglage Approche, 8 tailles | coupé aux 8 tailles | rien de coupé |
| Épinglage Profils, 8 tailles (1000×560 → 2560×1440) | coupé de 1000×560 à 1366×768 | rien de coupé |
| Épinglage Héros | coupé 1000×560 (118 px), 1024×640 (sous la barre), 1280–1728 (canvas) | 1000×560 (bouton 15 px, canvas 49 px), 1280–1728 (bas du canvas, la colonne dessinée reste visible) |
| Erreurs console | 404 attendu de la page introuvable | idem, aucune nouvelle |
| Modules chargés deux fois | aucun | aucun (?v=20261028-2 partout) |

Interactions cliquées en m390 : barre du bas (masquée en haut, visible sur l'approche, masquée sur #rdv, le pied, le menu ouvert et la 404, réapparaît à la fermeture du menu par Échap), menu mobile, ouverture sans flash.

## Note proposée
Ancienne note 82/100 → nouvelle note 92/100 · bloquants restants : 0

- Critère 1 (waouh) 13 → 14 : le héros n'apparaît plus avant l'intro.
- Critère 2 (direction artistique) 13 → 14 : jambage du « g » rétabli.
- Critère 3 (animations) 11 → 13 : épinglage de l'approche entier et titre lisible vers 2,1 s.
- Critère 5 (formats) 10 → 14 : approche et profils épinglés, barre mobile, textes 12 px et cibles 44 px corrigés ; jamais 15/15 sur ce critère.
- Critère 8 (mise en ligne) 4 → 5 : X-Robots-Tag présent depuis l'étape 1.
- Critère 9 (accessibilité) 4 → 5 : textes mono à 12 px minimum.
