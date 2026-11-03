# marco-investigation-maquette

<https://marco-investigation-maquette.vercel.app> · audit du 28/10/2026 · dernier commit ade96d5 du 27/10/2026

## Verdict

**82/100 · À peaufiner · 1 défaut(s) bloquant(s)**

Une maquette « journal » originale et cohérente, qui va jusqu'au bout de son idée : calage de presse, trame en demi-teintes, une à la manière d'un quotidien. Tout fonctionne, et le seul défaut bloquant est la meta robots noindex absente sur trois pages. Il reste aussi à corriger le petit format (320 px, cibles tactiles, labels de 11,5 px) et l'édito épinglé sur les écrans bas.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture « calage de la presse » puis une de journal qui se compose : l'idée est forte et propre au client. La seconde moitié de l'accueil (presse, contact) devient plus sage. |
| 2. Direction artistique et harmonie | 13/15 | Papier, encre et ocre, Fraunces, Inter Tight et Caveat bien hiérarchisés, rubriques foliotées (p. 2 à p. 11). Les 20 images Grok, chaudes et sépia, vont bien ensemble. |
| 3. Animations et effets | 12/15 | Titre lisible vers 2,5 s, 59,5 et 60 i/s sans saccade, trame en demi-teintes et édito épinglé « Dénoncer ce qui choque » réussis. En revanche, l'épinglage coupe la photo du fondateur sur les écrans de portable bas. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne : filtres du catalogue, lecteur YouTube en `<dialog>`, extraits audio de 30 s avec pastille, quiz commenté, formulaires en étapes avec erreurs claires, copier, FR/EN, Sommaire mobile. |
| 5. Tous les formats | 11/15 | Pas de vrai débordement sur les formats courants. À 320 px, le titre « Marco Investigation » est coupé. Labels de 11,5 px et boutons d'en-tête de 33 à 38 px sur téléphone, et texte de l'édito coupé à 1000×560. |
| 6. Contenu et fiabilité | 9/10 | Contenus repris du site, champs « à compléter » et « source à préciser » bien signalés, illustrations marquées « Illustration générée », mentions légales présentes. |
| 7. Technique et performance | 9/10 | Aucune erreur JS, aucun lien cassé, CLS ≤ 0,03, accueil de 1,5 Mo, versions sans WebGL et réduite propres. |
| 8. Mise en ligne | 3/5 | Public, X-Robots-Tag, og:image 1200×630 en adresse complète, ?v= identique, 404 aux couleurs du client. Mais la meta robots noindex manque sur 3 pages sur 4, et og:image manque sur les mentions légales. |
| 9. Accessibilité | 4/5 | Focus visible (2 px), lien d'évitement, Mode calme et « réduire les animations » respectés, alt soignés. Cibles tactiles de l'en-tête sous 44 px. |
| **Total** | **82/100** | |

## Points forts

- Concept éditorial fort et propre au client : une de journal datée du jour, sommaire folioté, dépêches qui défilent, tampons « vu sur », cachet « journalisme de solutions ».
- Effet signature (trame en demi-teintes qui révèle les images, loupe de trame) présent aussi sur téléphone, avec un repli propre sans WebGL.
- Interactions nombreuses et toutes fonctionnelles : catalogue filtrable de 38 contenus, lecteur vidéo sans cookie, extraits de podcast, quiz fast-fashion, formulaires en étapes.
- Contenus provisoires très bien signalés (« à compléter », « source à préciser », « Illustration générée »), et version anglaise complète de l'interface.
- Performance excellente : 60 i/s, CLS proche de 0, pages légères, ouverture avant 3 s.

## Défauts

### Bloquants

1. **Meta robots noindex absente** : `/`, `/enquete-fast-fashion`, `/podcast` (tous formats). Cause : `index.html:4-8`, `enquete-fast-fashion.html:4-9`, `podcast.html` (même zone du `<head>`). Seules `mentions-legales.html:8` et `404.html:7` ont la balise. Correction : ajouter `<meta name="robots" content="noindex, nofollow">` dans le `<head>` des 5 pages, à l'identique. Effort : petit.

### Importants

1. **Titre « Marco Investigation » coupé à 320 px** : accueil, m320, `captures/accueil-m320-00.jpg` (« Marco Investigati »). Cause : `assets/css/main.css:25` `--fs-mast: clamp(2.6rem, 10.4vw, 10.6rem)` (plancher de 41,6 px trop haut), avec `white-space: nowrap; overflow: hidden` (`main.css:305-310`). Correction : `clamp(2.1rem, 10.4vw, 10.6rem)`, ou un palier `@media (max-width: 359px) { .masthead { font-size: 11.6vw; letter-spacing: -.055em; } }`. Effort : petit.
2. **Cibles tactiles de l'en-tête sous 44 px** : toutes les pages, m320 à m430. Logo 38×38, FR/EN 36×33, Mode calme 33×36, Sommaire 88×36. Cause : `main.css:189` (`.brand img` 38 px), `main.css:206` (`min-height: 33px; min-width: 36px`), `main.css:201` (`.chip-btn` `min-height: 36px`). Correction : `min-height: 44px; min-width: 44px` sous 900 px (zone étendue par un pseudo-élément si l'en-tête doit garder sa hauteur de 65 px). Les liens `.link.label` (25 px de haut, `main.css:149`) doivent passer à `padding-block: 12px`. Effort : petit.
3. **Textes de 11,5 px sur téléphone** : labels, surtitres, date, FR/EN, « Mode calme », « Sommaire », « À compléter » (11,2 px). Cause : `main.css:110-113` (`--fs-label`), `main.css:200` et `main.css:206` (`.72rem`). Correction : `font-size: max(12px, var(--fs-label))` sur `.label, .kicker`, et `max(12px, .72rem)` sur `.chip-btn` et `.lang-switch button`. Effort : petit.
4. **Édito épinglé trop haut pour les écrans bas** : accueil, 1280×720 et 1366×768 : la photo du fondateur est coupée de 94 et 101 px (`captures/epingle-accueil-0-1280x720-50.jpg`). À 1000×560, la fin du paragraphe et le lien « Lire le portrait » sortent de l'écran (`captures/epingle-accueil-0-1000x560-50.jpg`). Cause : `assets/js/main.js:577` `start: "top 18%"` sur une grille plus haute que l'écran restant. Correction : épingler sur `start: "top top+=" + entete` dans une section en `100svh` en colonne flex, visuel en `flex: 1; min-height: 0`, ou limiter `.edito__visual` à `max-height: calc(100svh - var(--entete-h) - 48px)`. Palier `max-height: 600px` qui réduit le titre. Effort : moyen.

### Finition

1. **Paragraphe du hero de l'enquête sur le tas de vêtements** : `/enquete-fast-fashion`, m390, `captures/enquete-fast-fashion-m390-00.jpg`. Les mots « Louise Aubery, alias MyBetterSelf. D'où viennent » passent sur la partie claire de la photo. Cause : image d'ouverture mobile `enquete-ouverture-vetements-mobile` sans voile sous le texte. Correction : dégradé sombre (`linear-gradient(90deg, rgba(23,20,15,.85) 0 60%, transparent)`) sous la colonne de texte en mobile. Effort : petit.
2. **Section « Dans le parcours d'un vêtement » épinglée à 1000×560** : un paragraphe sort de 10 px. Cause : `main.css:696-698` (`height: 100vh`, médias à `46vh`). Correction : `100svh` et un palier `@media (max-height: 600px)` avec `.stage .media { max-height: 38vh }`. Effort : petit.
3. **og:image absente sur les mentions légales** : `mentions-legales.html` n'a ni `og:image` ni `og:title`. Correction : reprendre le bloc og de l'accueil. Effort : petit.
4. **Dictaphone Grok aux boutons vagues** : `assets/img/grok/accueil-redaction-bureau-1600.webp`, en bas à droite (boutons informes). L'objet est le plus souvent hors cadre, donc pas bloquant. À régénérer si le cadrage le montre. Effort : petit.
5. **Grand vide sombre de la section Europe en tablette** : t820, `captures/accueil-t820-05.jpg`. La carte occupe tout l'écran sans contenu. Correction : réduire la hauteur de la carte sous 980 px. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | ≈ 2,5 s / ≈ 2,5 s (intro « calage de la presse » jusqu'à 1,5 s, une composée à 3 s, `bande-ouverture-*.jpg`) |
| Fluidité p1440 / m390 | 59,5 i/s / 60 i/s (très bien, aucune saccade) |
| CLS au chargement (max) | 0,0285 (mentions légales, g1920) ; accueil ≤ 0,011 |
| Poids de l'accueil, p1440 / m390 | 1,50 Mo / 1,22 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 attendue sur la page 404) ; repli sans WebGL propre ; mode réduit propre |
| Débordement horizontal | Aucun défilement horizontal effectif (body en `overflow-x: clip`) ; titre coupé à 320 px |
| Sections épinglées | Édito accueil : photo coupée à 1280×720 et 1366×768, texte coupé à 1000×560 ; parcours enquête : 10 px à 1000×560 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public · noindex absent sur 3 pages · X-Robots-Tag ok · robots.txt absent (non pénalisé) · og:image JPG 1200×630 absolue (sauf mentions) · ?v=20261027 partout · 404 personnalisée |

## Vérifications écartées

- **Débordement m430 (439 px), m390 sans WebGL, m320 mentions légales (324 px)** : le `scrollWidth` dépasse par moments (de +2 à +48 px), mais aucun élément de page ne dépasse, car `body` est en `overflow-x: clip` (`main.css:60`). Le seul élément hors cadre est `.page-sheet`, un voile de transition en `position: fixed`, translaté hors de l'écran (`main.css:290-291`). Dans tous mes essais, `scrollTo(300, y)` laisse `scrollX` à 0 : aucun défilement horizontal possible. À confirmer sur un vrai iPhone. Si besoin, mettre `.page-sheet { visibility: hidden }` hors transition.
- **Valeurs « h1 » par page (200 à 520 ms)** : elles ne voient pas l'intro. Jugé sur les bandes : titre lisible vers 2,5 s, sous 3 s.
- **LCP de 2,4 s sur m320 à m390 (accueil)** : valeur prise pendant que 5 maquettes tournaient en parallèle, et c'est l'image révélée par la trame. La bande m390, prise seule, montre la une complète à 2,5 s.
- **canvas.gl et img qui « sortent de l'écran » dans l'édito épinglé** : le canvas de trame est un fond. Seule la photo du fondateur coupée est retenue (important 4).
- **Erreur console « 404 » sur /zz-page-introuvable-audit** : c'est le statut attendu de la page 404 elle-même.
- **Requêtes YouTube et mp3 « ERR_ABORTED »** pendant les tests : elles sont annulées à la fermeture du lecteur ou à l'arrêt de l'extrait, ce n'est pas une ressource en erreur.
- **Images Grok** : 20 images regardées en taille réelle (bureau, kiosque, rotative, classe, courrier, studio, atelier, bobines, coton, teinture, cargo, friperie, réparation, tas de vêtements, casque, enregistreur, studio podcast). Pas de main déformée, pas de texte, pas de filigrane. Les mains de « réparation » sont crédibles.


---

## marco-investigation-maquette : corrections de l'étape 2

Commit 03d7ec7 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Meta robots noindex absente | Bloquant | Déjà présente sur `/`, enquête et podcast depuis l'étape 1 ; `noindex` seul passé en `noindex, nofollow` sur mentions légales et 404 | `mentions-legales.html`, `404.html` | statique : 5 pages sur 5 en `noindex, nofollow` |
| Titre « Marco Investigation » coupé à 320 px | Important | `--fs-mast` à `clamp(1.9rem, 10.4vw, …)` et palier `9.6vw` sous 380 px (titre du pied aligné sur la même variable) | `main.css` | `preuve-avant-accueil-m320.jpg` → `preuve-apres-accueil-m320.jpg` : titre entier |
| Cibles tactiles de l'en-tête sous 44 px | Important | Logo, FR/EN, Mode calme, Sommaire / Retour à la Une à 44 × 44 px ; écarts de l'en-tête resserrés sous 520 px, « Retour à la Une » sur deux lignes pour tenir à 320 px | `main.css` | 47 → 2 cibles < 44 px par format (les 2 restantes : titres de cartes dont la zone réelle est la carte entière) |
| Autres cibles < 44 px (récurrent) | Important | `.btn--sm`, filtres, copier, arrêt de l'extrait, pause du fil, sommaire de la Une, liens `.link.label`, sommaire de l'enquête, liens du pied, titre de carte latérale | `main.css`, `index.html` (bouton « Voir l'interview ») | idem |
| Textes de 11,5 px sur téléphone | Important | Plancher `max(12px, …)` sur `--fs-label` et sur toutes les tailles `.62` à `.74rem` (todo, chip, langue, badges, durée, étiquette IA, source…) | `main.css` | 159 à 180 → 0 texte < 12 px sur m320 à t820 |
| Édito épinglé trop haut pour les écrans bas | Important | Épinglage en `top top` sans `anticipatePin` ; grille en `100svh`, `padding-top` = `--entete-h` mesurée en JS (ResizeObserver), visuel en `flex: 1; min-height: 0` ; paliers `max-height: 730px` et `600px` qui réduisent titre et texte | `main.js`, `main.css` | 11 → 0 positions en défaut sur 8 tailles ; `preuve-avant/apres-edito-1366x768.jpg`, `preuve-apres-edito-1000x560.jpg`, `-1280x720.jpg` ; remesuré stabilisé (Lenis `immediate`) à 1280×720 : photo 85→676, portrait jusqu'à 704, lien à 611 |
| og:image absente des mentions légales | Finition (signalée, récurrent og-image) | Bloc og de l'accueil repris (titre et description existants de la page) | `mentions-legales.html` | statique : og présent |
| Voile de transition qui gonfle la largeur de page | Vérif. écartée | `.page-sheet` rangé hors écran à gauche au lieu de la droite | `main.css`, `main.js` | plus aucun élément hors cadre en m320 à m430 |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Hero de l'enquête : texte sur la partie claire de la photo (m390) | Finition | finition |
| Section « parcours d'un vêtement » : un paragraphe sort de 10 px à 1000×560 | Finition | finition (1000×560 seulement ; 1280×720 et 1366×768 corrects) |
| Dictaphone Grok aux boutons vagues | Finition | image Grok |
| Vide sombre de la section Europe en t820 | Finition | finition |
| `scrollWidth` ponctuellement supérieur à l'écran (324 à 435 px) sur l'accueil mobile | Vérif. écartée | aucun élément hors cadre, `scrollX` reste à 0 à chaque essai (body en `overflow-x: clip`) : pas de défilement horizontal réel |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement (scrollWidth) | m320 : `/` 330, mentions 324 ; m360 : `/` 363 ; autres formats 0 | m320 à m430 : `/` 324 à 435 sans élément fautif ni défilement possible ; mentions 0 ; t820, p1280, p1366, p1440, g1920 : 0 |
| Textes < 12 px (occurrences) | m320 159 · m360 172 · m390 174 · m430 167 · t820 180 | 0 partout |
| Cibles < 44 px (types × pages) | 47 par format (m320 à t820) | 2 (titres de cartes à lien étiré sur toute la carte) |
| Éléments couverts | 0 | 0 |
| Épinglage aux 8 tailles (48 positions) | 14 en défaut (édito : 11, de 1000×560 à 1366×768 ; parcours : 3) | 3 (parcours, 1000×560, 10 px) |
| Erreurs console (hors 404 attendue) | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |
| Interactions | — | Sommaire mobile (ouvre, Échap ferme), FR/EN, sommaire de l'enquête, édito stabilisé : sans erreur |

## Note proposée
Ancienne note 82/100 → nouvelle note 89/100 · bloquants restants : 0
- Critère 3 : 12 → 13, la photo du fondateur n'est plus coupée par l'épinglage.
- Critère 5 : 11 → 14, titre entier à 320 px, textes à 12 px, boutons d'en-tête à 44 px, édito entier à 1000×560 (plafonné à 14).
- Critère 8 : 3 → 5, noindex, nofollow sur toutes les pages et og:image sur les mentions légales.
- Critère 9 : 4 → 5, cibles tactiles de l'en-tête à 44 px.
