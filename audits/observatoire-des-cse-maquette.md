# observatoire-des-cse-maquette

<https://observatoire-des-cse-maquette.vercel.app> · audit du 27/10/2026 · dernier commit 9e87902 du 23/10/2026

## Verdict

**83/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Maquette solide et cohérente, bien ancrée dans le monde des CSE : le concept « prise de pouls » (intro électrocardiogramme, BPM réactif à la souris, anonymiseur en particules) tient du début à la fin, et toutes les interactions fonctionnent. Il reste la mise en ligne à mettre aux règles (Cache-Control, X-Robots-Tag, `?v=`) et des petits textes ou petites cibles sur téléphone.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro « Prise de pouls » et héros éditorial avec cadran gradué et tracé cardiaque réactif : une idée originale et juste pour l'activité, mais la photo du héros (salle de réunion vide) reste convenue et l'intro retarde la première image. |
| 2. Direction artistique et harmonie | 13/15 | Papier, nuit et corail, Fraunces + Inter Tight + IBM Plex Mono, hiérarchie claire, rythme papier et nuit bien tenu sur les 4 pages, images Grok homogènes (lumière chaude, bleu marine, touches corail). |
| 3. Animations et effets | 13/15 | Effets riches et fluides (59,6 / 59,1 i/s, aucune saccade) : anonymiseur canvas, téléphone épinglé qui déroule le parcours, jauges et compteurs, ouverture orchestrée en moins de 3 s ; l'intro sur écran vide pourrait être plus courte. |
| 4. Expérience ludique et interactions | 9/10 | Testeur d'éligibilité, inscription en 3 étapes avec validations, bascule avec ou sans syndicat, tableau de bord fictif filtrable, tiroirs panel, contact et avantages, copie de l'e-mail : tout réagit correctement. |
| 5. Tous les formats | 11/15 | Aucun débordement ni contenu coupé sur les formats courants, mais 6 à 15 textes à 11,2 px et 5 à 8 cibles de moins de 44 px sur téléphone, et le bouton de la section épinglée coupé de 20 px à 1024×640. |
| 6. Contenu et fiabilité | 9/10 | Chiffres sourcés (1re étude, Social CSE n° 110), données fictives clairement étiquetées, « à compléter » visibles et homogènes, mentions légales présentes ; il manque encore au client téléphone, adresse et engagements de confidentialité. |
| 7. Technique et performance | 10/10 | Aucune erreur de console, CLS 0, 0,8 à 0,94 Mo par accueil, version sans WebGL propre, polices chargées avant l'ouverture. |
| 8. Mise en ligne | 2/5 | Public, noindex dans chaque page, og:image 1200×630 absolue, 404 aux couleurs ; mais règle Cache-Control dans `vercel.json`, pas d'en-tête X-Robots-Tag et aucun `?v=` sur le CSS et le JS. |
| 9. Accessibilité | 4/5 | Focus visible (contour 2 px), « réduire les animations » et « Mode calme » respectés et mémorisés, Échap ferme menu et tiroirs, verrou de défilement ; cibles tactiles trop petites dans le pied de page. |
| **Total** | **83/100** | |

## Points forts

- Concept fort et propre au client : la « prise de pouls » relie l'intro, le BPM du héros, le tracé de progression du formulaire et le fil rouge latéral.
- L'anonymiseur : la fiche « Exemple fictif » se défait en carrés qui rejoignent des milliers de points, une métaphore claire de l'anonymat.
- Fiabilité exemplaire : chaque chiffre a sa source, chaque donnée inventée est marquée « fictif » ou « illustratif », chaque manque est marqué « à compléter ».
- Formulaires simulés complets (erreurs en ligne, aria-invalid, focus sur la première erreur, message de succès, « Maquette : rien n'est envoyé »).
- Fluidité très bonne (59,6 i/s ordinateur, 59,1 i/s téléphone) et CLS nul partout.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mise en ligne non conforme** : toutes les pages. Cause : `vercel.json:4-12` (règle `Cache-Control: public, max-age=604800` sur `/assets/(.*)`, aucun bloc X-Robots-Tag) ; `index.html:25` et `index.html:43` (et les 3 autres pages) appellent `assets/css/main.css` et `assets/js/main.js` sans `?v=`. Avec un cache d'une semaine et sans version, une correction du CSS ou du JS peut rester invisible chez le client. Correction : supprimer la règle Cache-Control, ajouter `{"source":"/(.*)","headers":[{"key":"X-Robots-Tag","value":"noindex, nofollow"}]}`, appeler `main.css?v=1` et `main.js?v=1` partout à l'identique. Effort : petit.
2. **Textes de moins de 12 px sur téléphone** : toutes les pages, m320 à m430 (badge « 10-11 mars », sources des graphiques, « à compléter », titres du pied de page, « Copier », « Mode calme », surtitres des études). Cause : `assets/css/main.css:33` (`--step--2: clamp(.7rem, …)` = 11,2 px), `main.css:123` (`.tbc` à 11 px), `main.css:276` (`.lens__badge-t` à .7rem), `main.css:841` (`.calm-inline` à .74rem). Correction : `--step--2: clamp(.75rem, .72rem + .08vw, .8rem)` et `font-size: max(12px, …)` sur `.tbc`, `.lens__badge-t`, `.calm-inline`. Effort : petit.
3. **Cibles tactiles de moins de 44 px sur téléphone** : toutes les pages (logo 30 px, liens soulignés « Comment ça marche » ou « Puis-je répondre ? » 28 px, liens du pied de page 26 px, filtres du tableau de bord 38 px, case `#rec-ok` 24 px, « Mode calme » 40 px). Cause : `assets/css/main.css:599` (liens du pied de page à `padding: 0`), `main.css:134` (`.link--under`), `main.css:168` (`.brand`), `main.css:841` (`.calm-inline` à `min-height: 40px`). Correction : `min-height: 44px; display: inline-flex; align-items: center` sur ces liens et boutons, et un label cliquable de 44 px autour de la case à cocher. Effort : petit.

### Finition

1. **Bouton de la section épinglée « Comment participer » coupé de 20 px à 1024×640** (milieu et fin de l'épinglage). Cause : `assets/css/main.css:415`, le palier `max-height: 780px` ne compresse pas assez la colonne de texte. Correction : section en colonne flex de 100svh et palier `max-height: 680px` qui réduit l'écart entre les étapes et la taille du titre. Effort : petit.
2. **Sur tablette (t820) et téléphone, le bouton « Je participe » du héros passe sous la ligne de flottaison** (le grand cercle photo occupe l'écran), `captures/accueil-t820-00.jpg`. Correction : réduire le cercle à `min(70vw, 52svh)` sous 900 px ou remonter les boutons au-dessus du cercle. Effort : petit.
3. **Barre fixe du bas sur téléphone sans contact rapide** : seule l'action « Je participe » y figure. Correction : ajouter un bouton « Écrire » qui ouvre le tiroir contact. Effort : petit.
4. **Image `accueil-donnees`** : le carnet ouvert se fond dans la pile de carnets (objet peu plausible à taille réelle). Simple faiblesse, visible seulement en petit sur la page. Effort : petit (régénération facultative).
5. **Ouverture à viser sous 2,5 s** : accueil, p1440 et m390. Remesurée seule, le titre est absent à 2,5 s (`captures/ouverture-p1440-t2500.jpg`) et lisible à 3 s (`captures/ouverture-p1440-t3000.jpg`, `captures/bande-ouverture-p1440.jpg`) : dans la règle des 3 s, mais 1,75 s d'intro sur écran vide. Cause : `assets/js/main.js:354-363`. Correction facultative : lancer `startHero` vers 1,1 s (volets à 1,0 s) et raccourcir la montée des lignes à 0,9 s. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | entre 2,5 et 3 s / entre 2,5 et 3 s (remesurée seule : absent à 2,5 s, lisible à 3 s, `captures/bande-ouverture-p1440.jpg`) |
| Fluidité p1440 / m390 | 59,6 i/s / 59,1 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,0023 (confidentialité g1920) ; 0 à l'accueil |
| Poids de l'accueil, p1440 / m390 | 0,94 Mo / 0,81 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur (hors 404 attendu de la page introuvable) ; sans WebGL OK ; réduit : titre à 0,2 s, contenu visible |
| Débordement horizontal | Aucun, sur tous les formats |
| Sections épinglées | « Comment participer » : bouton coupé de 20 px à 1024×640 seulement ; « Garanties » : RAS (canvas de fond plein cadre) |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui / oui partout / absent / absent (non pénalisé) / JPG 1200×630 absolu / absent / 404 personnalisée |

## Vérifications écartées

- Fiche « Exemple fictif » invisible (div.profile) : effet voulu, la fiche passe à `opacity: 0` pendant qu'un canvas la redessine en carrés qui s'envolent (`assets/js/anon.js:83-86`) ; elle reste visible sous « réduire les animations » et en mode calme.
- « canvas.anon__canvas sous l'en-tête / sort de l'écran » : c'est le fond plein cadre de la section, pas du contenu.
- Section « Comment participer » qui sort de l'écran à @0.08 (`h3.step__t` 24 px à 1440×900, `p.step__d` 5 px à 1366×768, `a.btn` 7 px à 1920×1080) : vérifié sur `captures/epingle-accueil-0-1440x900-8.jpg` et `captures/epingle-accueil-0-1366x768-8.jpg`, la section n'est pas encore épinglée (son haut est à 238 px et 256 px, elle entre par le bas) et les étapes 01 à 03 sont entières. Aucun dépassement n'est mesuré à @0.5 ni à @0.92 sur 1280×720, 1366×768, 1440×900 ou 1920×1080 : aucun titre d'étape coupé une fois la section épinglée.
- Éléments « MASQUÉ » par l'en-tête au pied de page : position de défilement ordinaire, le contenu passe sous l'en-tête translucide puis réapparaît.
- Erreur console « 404 » : c'est le statut de la page introuvable elle-même.
- h1 de 3,0 à 3,9 s par page et format : valeurs prises en parallèle ; seules comptent les étapes remesurées seules (titre lisible entre 2,5 et 3 s, sans pénalité).
- Formulaire panel apparemment non envoyé lors d'un premier essai : revérifié, l'envoi fonctionne sur m390 et p1440 (`captures/inter-panel-envoye-390.jpg`).
- Images Grok (21 fichiers ouverts en taille réelle) : mains, visages flous et objets cohérents, ni texte ni filigrane ; aucune ne justifie une régénération.


---

## observatoire-des-cse-maquette : corrections de l'étape 2

Commit e0438cc (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Mise en ligne : Cache-Control, X-Robots-Tag, `?v=` | Important | Déjà corrigé à l'étape 1 (vercel.json sans Cache-Control, X-Robots-Tag noindex, nofollow) ; versions passées à `?v=20261028-2` partout (pages, imports de modules, import dynamique) | vercel.json (vérifié), 5 pages, main.js, media.js | grep `v=20261028[^-]` : vide ; une seule adresse par fichier |
| Textes de moins de 12 px sur téléphone | Important | `--step--2` à `clamp(.75rem, …)` (plancher 12 px : sources, surtitres d'études, notes, titres du pied, Copier, KPI) ; `max(12px, …)` sur `.tbc`, `.lens__badge-t`, `.calm-inline`, `.calm-toggle`, `.ms__badge`, `.countdown span`, `.st__seg b`, `.profile__k`, `.hero__bpm`, `.ph-tag`, `.about__count`, `.db__dot b` | main.css | 44 → 0 (m360), 40 → 0 (t820), 0 partout sur m320 à m430 |
| Cibles de moins de 44 px sur téléphone | Important | Logo 44 px ; `.link--under` en inline-flex 44 px avec trait gardé sous le texte (`--uy`) ; liens du pied de page 44 px sous 900 px ; « Mode calme » 44 px ; filtres du tableau de bord, bascule syndicat et bouton d'en-tête tablette à 44 px ; case `#rec-ok` en zone de 44 px (bordure transparente, case visible inchangée à 24 px) | main.css | 168 → 0 (m360), 230 → 0 (t820), 0 partout sur m320 à m430 |
| Section épinglée « Comment participer » : bouton coupé de 20 px à 1024×640 | Finition (réglage 1280×720 / 1366×768) | Méthode « Tout tenir dans l'écran » : section en 100svh, colonne flex, `padding-top: var(--entete-h)` mesuré en JS (ResizeObserver), grille `flex: 1; min-height: 0`, téléphone en `height: min(100%, 632px)` (plus de `100svh - 190px`), palier `max-height: 680px`, `anticipatePin` retiré (parcours et garanties) | main.css, main.js, ui.js | 1024×640 : coupé 20 px → ok ; 1280×720, 1366×768 et autres tailles : ok |
| Bouton flottant « Je participe » visible dès le premier écran sur téléphone, sur le texte du héros (leçon du lot 1) | Important | Masqué tant que le héros (`.hero`, `.phero`) est visible, en plus du formulaire, du pied, de l'appel final et du menu | ui.js | haut : visible → masqué ; après le héros : visible ; pied : masqué ; aucun élément couvert par le bouton |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Bouton « Je participe » du héros sous la ligne de flottaison sur tablette et téléphone | Finition | finition |
| Bouton « Écrire » absent du bouton flottant | Finition | finition |
| Image `accueil-donnees` (carnet peu plausible) | Finition | image Grok |
| Ouverture à viser sous 2,5 s (intro de 1,75 s) | Finition | finition |
| Téléphone, adresse postale, durée du questionnaire « à compléter » | Contenu | donnée manquante |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 partout | 0 partout |
| Textes < 12 px (somme des pages : m320 / m360 / m390 / m430 / t820) | 44 / 44 / 44 / 44 / 40 | 0 / 0 / 0 / 0 / 0 |
| Cibles < 44 px (m320 / m360 / m390 / m430 / t820) | 147 / 168 / 153 / 134 / 230 | 0 / 0 / 0 / 0 / 0 |
| Éléments couverts par une barre fixe du bas | 0 | 0 (seul l'en-tête recouvre, en position de défilement ordinaire au pied) |
| Épinglage « Comment participer » aux 8 tailles + 2560 | coupé 20 px à 1024×640 (8, 50, 92 %) | ok ; à 1000×560, 26 px à 8 % seulement pendant l'arrivée (section pas encore épinglée, retard Lenis) : remesuré stabilisé, bouton à 542 px sur 560, ok |
| Épinglage « Garanties » | canvas de fond plein cadre (faux positif) | inchangé (faux positif) |
| Erreurs console | 404 attendu de la page introuvable seulement | idem, aucune nouvelle |
| Modules chargés deux fois | aucun | aucun (`?v=20261028-2` identique partout) |

## Note proposée
Ancienne note 83/100 → nouvelle note 90/100 (critère 5 : 11 → 14, textes à 11,2 px, cibles < 44 px et bouton épinglé coupé à 1024×640 corrigés ; critère 8 : 2 → 5, Cache-Control, X-Robots-Tag et `?v=` corrigés à l'étape 1 et vérifiés ; critère 9 : 4 → 5, cibles du pied de page à 44 px) · bloquants restants : 0
