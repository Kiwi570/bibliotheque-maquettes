# warmline-app-maquette

<https://warmline-app-maquette.vercel.app> · audit du 27/10/2026 · dernier commit f087a2a du 23/10/2026

## Verdict

**75/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Prototype de logiciel d’un niveau produit rare : console et appli entièrement jouables, sans erreur, rapides et stables sur tous les formats. Il manque un vrai moment « waouh » à l’accueil, les cibles tactiles de 44 px et quelques photos de biens incohérentes ; la mise en ligne reste à finir (robots.txt, og:image, Cache-Control).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 10/15 | Finition de logiciel haut de gamme (proche de Linear), mais l’accueil est une page statique sobre, sans ouverture ni effet qui saisit dans les 3 premières secondes. |
| 2. Direction artistique et harmonie | 12/15 | Instrument Sans + Serif italique, orange « chaleur » avec un sens unique, thèmes clair et sombre cohérents ; trois photos de biens ne montrent pas le bien annoncé. |
| 3. Animations et effets | 10/15 | Micro-interactions soignées dans l’appli (bulles, chaleur, reprise, vues en fondu) et 60 i/s, mais aucune ouverture orchestrée ni effet signature sur l’accueil. |
| 4. Expérience ludique et interactions | 9/10 | Tout fonctionne : demandes simulées, reprise et message, kanban glisser-déposer, ⌘K, campagne en 4 étapes, visite guidée en 12 étapes, menu mobile, appli synchronisée. |
| 5. Tous les formats | 11/15 | Aucun débordement sur 25 vues × 4 formats, mais boutons de 36 px, pastilles de 28–30 px, textes de 11 px sur téléphone, titre « Conver… » tronqué en m390. |
| 6. Contenu et fiabilité | 8/10 | Tout est marqué fictif et la mention réglementaire renvoie à un juriste ; photos de biens hors sujet (salle de réunion pour un appartement), pas de mentions légales. |
| 7. Technique et performance | 9/10 | 0 erreur console, CLS 0, 0,24–0,31 Mo, modules chargés à la demande ; pas de h1 sur la vue Conversations ni dans l’appli sur téléphone. |
| 8. Mise en ligne | 2/5 | noindex et X-Robots-Tag corrects, 404 aux couleurs ; mais robots.txt « Disallow: / », aucune og:image et des règles Cache-Control dans vercel.json. |
| 9. Accessibilité | 4/5 | Réduire les animations respecté, focus visible, kanban au clavier (Espace), visite guidée aux flèches ; cibles tactiles et textes de 11 px sous le seuil. |
| **Total** | **75/100** | |

## Points forts

- Une vraie démonstration commerciale : 7 scénarios en direct, reprise de la main, réponse traduite, fiche qui se remplit, visite réservée, sans aucune erreur JavaScript.
- Visite guidée en 12 étapes avec projecteur, plein écran et flèches du clavier, qui marche aussi sur téléphone (feuille du bas).
- Responsive exemplaire pour une application : aucun débordement horizontal sur 12 vues console et appli, de 360 à 1440 px ; l’appli passe du téléphone dessiné au plein écran natif.
- Système visuel rigoureux : une couleur, un sens (orange = attend un humain), chaleur en degrés, typographie unifiée, thème sombre complet.
- Très léger et rapide : titre en 0,2 s, CLS 0, 60 i/s en p1440 et 59 i/s en m390.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Accueil sans effet « waouh »** : `/`, tous formats, `captures/planche-accueil-p1440.jpg`. Cause : `index.html:21-52`, accueil statique (texte + deux captures d’écran fixes), aucune animation d’entrée. Correction : faire vivre l’aperçu de la console (une demande qui arrive, la chaleur qui monte, la carte « À reprendre » qui s’allume) en CSS/JS léger, avec apparition orchestrée du titre en moins de 1,5 s et un repli fixe sous « réduire les animations ». Effort : moyen.
2. **Zones tactiles de 28 à 40 px sur téléphone** : `/console`, `/conseiller`, `/`, m320 à m430. Cause : `css/app.css:171` (`.btn` à 36 px), `:162` (`.demo-pastille` 28 px), `:180` (`.btn--petit` 30 px), `:886` (`.ap-statut` 30 px), `.acc-marque` (26 px). Correction : sous 760 px, `min-height: 44px` sur `.btn`, `.ap-statut`, `.demo-pastille`, `summary`, et zone de clic élargie (padding ou pseudo-élément) sur la marque. Effort : petit.
3. **Textes de 11 px sur téléphone** : `/conseiller` (onglets, heures, « dossiers ouverts »), `/console` (avatars, axe du graphique 10,5 px). Cause : `css/app.css:871`, `:894`, `:933`, `:227`, `:411`, et de nombreux `font-size: .6875rem`. Correction : plancher `font-size: max(12px, .6875rem)` sur ces sélecteurs. Effort : petit.
4. **Photos de biens qui ne montrent pas le bien** : `/console#/biens`, tous formats, `captures/vue-console-biens-p1440.jpg`. Cause : `js/donnees.js:61` (B-212 « Appartement 2 ch., front de mer, Dubai Marina » illustré par `salon-coucher-soleil` : trois personnes en réunion devant des montagnes), `:59` (B-210 « Appartement 1 ch. JLT » : un bureau avec tablette), `:55` (B-206 « vue marina » : un téléphone dans une pièce noire). Correction : réserver ces images d’ambiance au site vitrine et générer trois vraies photos d’annonce (salon avec vue marina, chambre lumineuse JLT, terrasse front de mer). Effort : petit (après génération).
5. **robots.txt « Disallow: / », og:image absente, Cache-Control dans vercel.json** : tout le site. Cause : `robots.txt:2`, `index.html:9-10` (og:title sans og:image), `vercel.json:20-54`. Correction : `Allow: /` ; og:image JPG 1200×630 en adresse complète sur les trois pages ; retirer les blocs Cache-Control (la réécriture `/v/N/` peut rester). Effort : petit.

### Finition

1. **Titre de l’en-tête tronqué « Conver… »** : `/console#/conversations`, m360 à m430, `captures/vue-console-conversations-m390.jpg`. Cause : `css/app.css:150` (`.barre__titre` en ellipsis, en concurrence avec quatre boutons). Correction : sous 430 px, masquer l’horloge/ « Démo » dans le menu ou réduire le titre à 1rem avec `min-width: 0` sur les boutons. Effort : petit.
2. **Barre latérale 25 px plus haute que l’écran à 1366×768** : `/console`, p1366, `captures/epingle-console-0-1366x768-50.jpg`. Cause : `css/app.css:125` (`.nav` en 100dvh avec `overflow-y: auto`, contenu de 793 px). Correction : palier `@media (max-height: 800px)` qui réduit les marges de `.nav__agence` et des groupes. Effort : petit.
3. **Pas de h1 sur la vue Conversations ni dans l’appli sur téléphone** : `/console#/conversations`, `/conseiller` m320–m430. Cause : `js/vues/conversations.js` (titre seulement dans `.barre__titre`, un `<p>`), `conseiller.html:23` (h1 dans l’aside masqué sous 760 px). Correction : h1 visuellement masqué (`sr-only`) dans ces vues. Effort : petit.
4. **Mentions légales absentes** : tout le site. Correction : lien en pied d’accueil vers les mentions du site vitrine. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 0,23 s / 0,18 s (lisible dès 0,5 s sur les étapes) |
| Fluidité p1440 / m390 | 60 i/s / 59,4 i/s (très bien) |
| CLS au chargement (max) | 0 (0,0008 sur la 404) |
| Poids de l’accueil, p1440 / m390 | 0,24 Mo / 0,24 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 (hors 404 attendue) · sans WebGL identique (pas de WebGL) · réduire respecté |
| Débordement horizontal | Aucun (4 pages × 9 formats + 12 vues internes × 4 formats vérifiées par moi) |
| Sections épinglées | Barre latérale sticky : 25 px de trop à 1366×768 (finition) |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui · oui · oui · « Disallow: / » · absente · versionnage par chemin `/v/14/` cohérent · 404 personnalisée |

## Vérifications écartées

- **?v= « aucun »** : le site versionne par chemin (`/v/14/css/app.css`, `/v/14/js/…`, réécrit par `vercel.json`), identique sur toutes les pages ; équivalent valide.
- **Peu de pages à l’inventaire** : c’est une application à une page par interface (routes en `#/`) ; j’ai capturé et mesuré moi-même les 8 vues console et 4 vues appli manquantes (`captures/vue-*.jpg`) : aucun débordement, aucune erreur.
- **Éléments « hors écran » dans Prospects, Conversations, Réglages** : colonnes du kanban, filtres et onglets dans des bandes à défilement horizontal volontaire ; `scrollWidth` de la page = largeur de l’écran.
- **Logo « sous l’en-tête » à 1366×768** : la capture montre la barre latérale défilée de l’intérieur ; au chargement le logo est à 14 px du haut (remesuré), seul le bas de la barre dépasse de 25 px (finition).
- **Erreur 404 en console sur `/zz-page-introuvable-audit`** : réponse attendue de la page introuvable.
- **h1 « null » sur /conseiller en téléphone** : pas un retard d’affichage, mais l’absence de h1 visible (finition 3).
- **Message de reprise « non envoyé » dans mon script** : le message apparaît bien, marqué « envoyé » (`captures/inter-reprise-p1440.jpg`) ; ma recherche de texte échouait.
- **Mention « résolution n° 56 de 2024 »** : présentée comme résumé à faire valider par un juriste, sur des campagnes marquées fictives ; non retenue comme fait inventé.


---

## warmline-app-maquette : corrections de l'étape 2

Commit ed6348b (non poussé) · version 20261028-2 (le site versionne par chemin : `/v/14/` remplacé par `/v/20261028-2/` partout, réécrit par `vercel.json` ; aucun `?v=` dans le dépôt, `grep "v=20261028[^-]"` vide)

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Zones tactiles de 26 à 40 px (.btn, .btn--petit, .ap-statut, .demo-pastille, summary, marque) | Important | `min-height` / `min-width: 44px` sous `(pointer: coarse), (max-width: 760px)` ; marque de l'accueil, de la 404 et de l'appli à 44 px | css/app.css | 62 → 0 cibles < 44 px (m320 à t820) |
| Textes de 9,9 à 11 px sur téléphone et tablette | Important | Plancher `max(12px, .6875rem)` sur les classes en .6875rem / .62rem / .58rem / .52rem, 12 px sur les libellés SVG (axe, bandes, « maintenant ») | css/app.css | 46 → 2 (les 2 restants : bouton icône à `font-size: 0` voulu à 360 px, faux positif) |
| robots.txt « Disallow: / », Cache-Control dans vercel.json | Important | Déjà corrigé à l'étape 1 (commit 66ffb6d) : `Allow: /`, blocs Cache-Control retirés, X-Robots-Tag gardé | robots.txt, vercel.json | vérifié dans le dépôt |
| og:image absente | Important | JPG 1200×630 tiré de l'aperçu de la console déjà présent, adresse complète https://warmline-app-maquette.vercel.app/assets/img/og-warmline.jpg sur les 3 pages (+ largeur, hauteur, twitter:card) | assets/img/og-warmline.jpg, index.html, console.html, conseiller.html | og:image null → présente sur /, /console, /conseiller |
| Mentions légales absentes | Finition | Page `/mentions-legales` aux couleurs du site, avec les seules informations présentes (nom du site, adresse, mention « données fictives ») ; éditeur, responsable, contact, hébergeur, données personnelles « à compléter » ; lien 44 px en pied d'accueil | mentions-legales.html, index.html, css/app.css | page 200, aucun débordement m320 à g1920 |
| Barre latérale plus haute que l'écran (1366×768, et 1280×720 où le logo disparaissait) | Finition (rendu 1280/1366 exigé) | Palier `(min-width: 1181px) and (max-height: 820px)` qui resserre marges et liens ; palier équivalent pour la barre compacte (961-1180 px, hauteur ≤ 720 px) | css/app.css | scrollHeight/clientHeight : 1366×768 793/768 → 768/768, 1280×720 > 720 → 720/720, 1024×640 709/640 → 640/640, 1000×560 709/560 → 560/560 ; épinglage 3 → 0 défaut |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Accueil sans moment « waouh » (aperçu de console vivant, titre orchestré) | Important | effort gros (décision de la mission) |
| 3 photos de biens qui ne montrent pas le bien (B-206, B-210, B-212) | Important | donnée manquante (photos d'annonce à fournir ou générer) |
| Titre « Conver… » tronqué en m360-m430 | Finition | finition |
| Pas de h1 sur Conversations ni dans l'appli sur téléphone | Finition | finition |
| Champs « à compléter » des mentions légales | — | donnée manquante (éditeur, hébergeur, contact) |

## Mesures avant / après
Mesures locales sur 127.0.0.1:5441 avec `outils/warmline-serve-local.mjs` : copie de `serve-local.mjs` qui applique la réécriture `/v/:ver/:path*` du `vercel.json` (sans elle, le CSS et le JS ne se chargent pas en local et la mesure ne vaut rien).

| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320, m360, m390, m430, t820, p1280, p1366, p1440, g1920) | 0 | 0 |
| Textes < 12 px | 46 (console, conseiller : m320 à t820) | 2 (faux positif `font-size: 0`, m320/m360) |
| Cibles < 44 px | 62 (accueil, console, conseiller, 404) | 0 |
| Éléments couverts par une barre fixe | 0 | 0 |
| Épinglage (barre latérale sticky) aux 8 tailles + 2560 | 3 défauts (1366×768) ; 1280×720 logo hors écran non détecté | 0 (vérifié aussi sur captures 1000×560, 1280×720, 1366×768) |
| Erreurs console (hors 404 attendue) | 0 | 0 |
| Modules chargés deux fois | 0 | 0 |
| og:image | absente | présente sur 3 pages + mentions |

Interactions cliquées après correction : conseils de l'accueil (ouverture), lien Mentions légales, « À savoir avant d'appeler », menu mobile de la console ; 0 erreur.

## Note proposée
Ancienne note 75/100 → nouvelle note 82/100 · bloquants restants : 0
- Critère 5 (formats) 11 → 13 : cibles 44 px et textes 12 px corrigés ; reste le titre tronqué.
- Critère 6 (contenu) 8 → 9 : mentions légales créées (champs à compléter) ; restent les photos de biens.
- Critère 8 (mise en ligne) 2 → 5 : robots.txt et Cache-Control (étape 1) et og:image corrigés.
- Critère 9 (accessibilité) 4 → 5 : cibles tactiles et textes de 11 px corrigés.
