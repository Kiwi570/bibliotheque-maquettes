# tvcentreduquebec-maquette

<https://tvcentreduquebec-maquette.vercel.app> · audit du 28/10/2026 · dernier commit ba05015 du 25/10/2026

## Verdict

**81/100 · À peaufiner · 0 défaut(s) bloquant(s)**

Concept « télécommande et chaînes » original, fluide (60 i/s) et entièrement fonctionnel : bilan, boutique, panier et formulaire marchent sans erreur. Restent la mise en ligne (pas de X-Robots-Tag, Cache-Control dans `vercel.json`, aucun `?v=`) et une série de textes de moins de 12 px et de cibles de moins de 44 px sur téléphone.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Allumage de téléviseur cathodique puis télécommande 3D collée à droite qu'on peut cliquer : une idée propre au métier, loin d'un modèle tout fait. Sur téléphone, la télécommande n'est qu'une image fixe en bas du hero. |
| 2. Direction artistique et harmonie | 12/15 | Graphite et orange « signal », Geist et Geist Mono, alternance de sections sombres et claires et vocabulaire OSD (CH 01 à 08) tenus sur toutes les pages, 404 « mire » comprise. Seulement 3 images Grok, plusieurs emplacements restent en « visuel provisoire ». |
| 3. Animations et effets | 12/15 | Ouverture en 1,5 à 2 s, 60 i/s sur les deux formats, galerie horizontale épinglée, facture qui « fond » au défilement, boutons magnétiques. L'effet signature 3D n'existe pas sur téléphone. |
| 4. Expérience ludique et interactions | 9/10 | Pavé numérique et recommandation en direct du bilan, croix directionnelle et filtres de la boutique (état vide prévu), comparateur, panier avec TPS et TVQ, touches 1 à 8 : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 12/15 | Aucun débordement, l'en-tête tient à 320 px, mais il y a 13 à 15 textes de moins de 12 px par page (bouton Menu, surtitres mono, étiquettes) et des cibles de 16 à 42 px. Le badge OSD fixe recouvre des libellés en bas à gauche. |
| 6. Contenu et fiabilité | 8/10 | Montants fictifs marqués « Exemple » et « Illustratif », « à compléter » partout où il faut, services cités « sans affiliation ». Les mentions légales se limitent à une ligne « à compléter » dans le pied de page. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, 0,56 Mo pour l'accueil, repli SVG propre sans WebGL et polices préchargées. Le CLS de la boutique monte à 0,089 sur p1280, juste sous le seuil. |
| 8. Mise en ligne | 2/5 | Le noindex, l'og:image 1200×630 en adresse complète et la 404 personnalisée sont bons, mais il n'y a pas de X-Robots-Tag, `vercel.json` contient deux règles Cache-Control et aucun CSS ni JS n'a de `?v=`. |
| 9. Accessibilité | 4/5 | Mode calme présent jusque dans le menu mobile, « réduire les animations » respecté, annonces `aria-live` du bilan, radios et focus corrects. Les petites tailles de texte et de cible coûtent un point. |
| **Total** | **81/100** | |

## Points forts

- Concept métier fort : chaque section est une « chaîne » (CH 01 à 08, touches 1 à 8, badge OSD), l'ouverture allume un téléviseur et la 404 affiche « Pas de signal » sur une mire.
- Télécommande 3D (three.js) collée sur ordinateur, avec un repli SVG soigné sans WebGL (`captures/planche-accueil-p1440-sanswebgl.jpg`).
- Bilan télé abouti : pavé numérique, résultat en direct, appareil conseillé qui change selon la priorité (Ethernet donne la Z10), ajout au panier depuis le résultat (`captures/inter-bilan-q3-p1440.jpg`).
- Panier simulé crédible : TPS 5 %, TVQ 9,975 %, points de fidélité, livraison « à compléter » (`captures/inter-panier-ouvert-p1440.jpg`).
- Contenu honnête : chaque montant inventé est étiqueté comme exemple, et chaque donnée manquante est marquée de façon visible.
- Performance : 60 i/s à p1440 et m390, aucune tâche longue, des pages de 0,2 à 0,56 Mo.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mise en ligne incomplète** : toutes les pages. Cause : `vercel.json:3-6`, deux règles Cache-Control (`/(fonts|vendor)/` et `/img/`) et aucun en-tête X-Robots-Tag. `index.html:25,403-405` (et les mêmes lignes dans `appareil.html`, `bilan.html`, `boutique.html`, `404.html`) appellent `css/style.css` et `js/*.js` sans `?v=`. Correction : supprimer le bloc Cache-Control, ajouter `{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }`, puis ajouter le même `?v=1` sur `style.css`, `data.js`, `core.js`, `home.js`, `appareil.js`, `bilan.js` et `boutique.js` dans toutes les pages. Effort : petit.
2. **Textes de moins de 12 px sur téléphone** : toutes les pages, m320 à m430. Exemples : bouton « Menu » 11,2 px, surtitres `.label` 11,5 px, `.ph-tag` 9,6 px, badge « Exemple » 10,9 px, note de la facture 11,5 px, fil d'Ariane 11,5 px. Captures : `captures/planche-accueil-m390.jpg`, `captures/planche-appareil-m390.jpg`. Cause : `css/style.css:49` (`--t-label: 0.72rem`), `:275` (`.menu-btn` à 0.7rem), `:536` (`.ph-tag` à 0.6rem), `:147` (`.badge-demo` à 0.68rem), `:603` (`.bill-note` à 0.72rem). Correction : `font-size: max(12px, …)` sur ces règles, ou `--t-label: max(12px, 0.72rem)` et un palier sous 600 px. Effort : petit.
3. **Cibles tactiles de moins de 44 px** : toutes les pages sur téléphone. Le lien « Accueil » du fil d'Ariane fait 58×18, le curseur de prix 240×16, les liens du comparateur 59×21, la marque 153×38 et les liens du menu mobile 42 px de haut. Cause : `css/style.css:913-914` (`.crumbs a` sans hauteur), `:974` (`.range` sans hauteur), `:285` (`.mobile-nav a` avec `padding: 16px 14px`), `:316` (`.brand-chip` à 38 px). Correction : `min-height: 44px; display: inline-flex; align-items: center` sur `.crumbs a` et les liens de tableau, `height: 44px` sur `.range`, `padding-block: 17px` sur `.mobile-nav a` et `.brand { min-height: 44px }`. Effort : petit.

### Finition

1. **Pas de barre fixe en bas sur téléphone** sur l'accueil, la boutique et la fiche ; seul le bilan en a une, « Économie estimée ». Captures : `captures/planche-accueil-m390.jpg`. Cause : aucune barre dans `index.html`, `boutique.html` et `appareil.html`. Correction : reprendre le motif de la barre du bilan avec « Faire mon bilan » et « Être rappelé », masquée par IntersectionObserver sur `#contact` et le pied de page. Effort : moyen.
2. **Badge OSD fixe qui recouvre du contenu** en bas à gauche, par exemple le libellé « Meilleur moment pour vous joindre » sur g1920 ou le pied de page du bilan. Captures : `captures/accueil-g1920-10.jpg`, `captures/inter-bilan-q3-p1440.jpg`. Cause : `css/style.css:331-344` (`.osd` en `position: fixed` en bas à gauche, sans masquage). Correction : masquer `.osd` (classe `is-off`) quand le formulaire ou le pied de page entre dans l'écran, ou le placer en haut sous l'en-tête. Effort : petit.
3. **Effet signature absent sur téléphone** : la télécommande 3D est réservée à l'ordinateur ; sur m390, elle n'est qu'une image coupée en bas du hero. Captures : `captures/bande-ouverture-m390.jpg`. Cause : `js/remote3d.js`, initialisé seulement avec un pointeur fin. Correction : une version légère, par exemple la télécommande SVG de repli qui pivote au défilement, ou des touches 1 à 8 tactiles dans le hero mobile. Effort : moyen.
4. **CLS de la boutique proche du seuil** : 0,089 sur p1280, 0,073 sur p1366, 0,056 sur p1440. Cause : `js/boutique.js:16`, le présentoir `[data-stage]` est injecté en JavaScript dans un conteneur sans hauteur réservée. Correction : `min-height` ou `aspect-ratio` sur `[data-stage]` dans `css/style.css`. Effort : petit.
5. **Mentions légales sans page** : il n'y a qu'une ligne « à compléter » dans le pied de page (`index.html:392`). Correction : une page `mentions-legales.html` gabarit, aux champs « à compléter » (NEQ, adresse, hébergeur, confidentialité), liée depuis le pied de page. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 2 s (en cours d'apparition à 1,5 s) / 1,5 s |
| Fluidité p1440 / m390 | 60 i/s / 60 i/s (très bien, aucune image > 50 ms) |
| CLS au chargement (max) | 0,0889 (/boutique p1280) |
| Poids de l'accueil, p1440 / m390 | 0,56 Mo / 0,49 Mo |
| Erreurs console, sans WebGL, réduire les animations | 0 erreur (hors 404 attendue de la page introuvable) ; repli SVG propre sans WebGL ; contenu complet avec « réduire » |
| Débordement horizontal | Aucun, sur tous les formats |
| Sections épinglées | 2 (galerie des appareils, « Comment ça marche ») : tiennent dans l'écran |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | public oui · noindex oui (4/4) · X-Robots-Tag non · robots.txt absent (non pénalisé) · og:image JPG 1200×630 en adresse complète · ?v= absent · 404 personnalisée · Cache-Control dans vercel.json |

## Vérifications écartées

- INVISIBLES « Remplacé par les services choisis / 38,00 $ » (accueil, tous formats) : le bloc `.bill-after` est piloté par un ScrollTrigger en `scrub` (`js/home.js:211`). Il apparaît à la fin du défilement de la section (visible en m390, `captures/accueil-m390-03.jpg`) et d'emblée avec « réduire les animations ». Ce n'est pas un blocage.
- MASQUÉ par `header.site-header` (champs du formulaire, pavé du bilan, mini-cartes, etc.) : ce sont des éléments qui passent sous l'en-tête flottant pendant le défilement, à l'instant de la capture. Aucun n'est durablement caché.
- Erreur console « 404 » sur `/zz-page-introuvable-audit` : c'est le statut 404 attendu de la page introuvable elle-même.
- Ouvertures « h1 » de 3,7 s (accueil g1920) et de 0,9 s (appareil m390) : prises pendant la charge parallèle. Les mesures seules donnent 198 ms et 217 ms, et les étapes montrent le titre lisible à 1,5 à 2 s.
- Interactions : le premier essai de « Ajouter » sur l'accueil avait échoué à cause du script, pendant l'épinglage. Revérifié : le panier passe à 1 et le message de confirmation s'affiche, sur p1440 comme sur m390 (`captures/inter-ajout-accueil-p1440.jpg`, `captures/inter-ajout-accueil-m390.jpg`).
- Annonce du bilan qui garde l'ancien appareil conseillé juste après un clic : la zone `aria-live` se met à jour 900 ms plus tard, volontairement (`js/bilan.js:255`).
- Images Grok (salon 16:9 et 9:16, enveloppe 4:5) : vues en taille réelle. Elles n'ont ni texte, ni personne, ni déformation, et leur lumière orange est cohérente avec la palette.


---

## tvcentreduquebec-maquette : corrections de l'étape 2

Commit fa25907 (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| Mise en ligne : X-Robots-Tag, Cache-Control, `?v=` | Important | Déjà corrigé à l'étape 1 (vérifié : X-Robots-Tag `noindex, nofollow`, aucun Cache-Control dans `vercel.json`). `?v=20261028` passé à `?v=20261028-2` partout | `vercel.json` (inchangé), 6 pages HTML | `?v=` identique sur les 6 pages, aucun `v=20261028` sans suffixe |
| Textes de moins de 12 px sur téléphone | Important | Sous 1000 px : `--t-label: max(12px, 0.72rem)`, `.todo` à `max(12px, 0.78em)`, plancher `max(12px, 0.7rem)` sur les règles mono (`.menu-btn`, `.ph-tag`, `.badge-demo`, `.bill-note`, `.idx`, fiches, filtres, comparateur…). Libellés SVG de la carte et du graphique de portée à 12, `.osd-box` de la 404 | `css/style.css`, `index.html`, `404.html` | 58 à 60 → 0 textes par format (m320 à t820) |
| Cibles tactiles de moins de 44 px | Important | `.brand` 44 px de haut, `.mobile-nav a` en `padding-block: 17px`, `.crumbs a` et liens du comparateur à 44 px, `.range` à 44 px, liens du pied à 44 px sur écran tactile | `css/style.css` | 9 à 13 → 0 cible par format |
| Pas de barre fixe en bas sur téléphone (finition, consigne récurrente) | Finition | Barre « Faire mon bilan » / « Être rappelé » (liens déjà présents) sur l'accueil, la boutique et la fiche, sous 700 px : visible seulement une fois le héros dépassé, masquée sur les formulaires, `#contact`, le pied, le menu ouvert et le panier ouvert ; `--barres-h` mesurée (ResizeObserver) et réservée sous le pied. Absente du bilan (barre « Économie estimée » existante), de la 404 et des mentions | `js/core.js`, `css/style.css`, `index.html`, `boutique.html`, `appareil.html` | Aucun élément couvert par la barre de m320 à m430 ; contrôlée au défilement (héros, milieu, menu ouvert, contact, pied) |
| Badge OSD qui recouvre des libellés (finition, nouveau récurrent) | Finition | IntersectionObserver sur `#contact`, `form` et le pied : le bandeau reste masqué tant qu'ils sont à l'écran | `js/core.js` | 0 élément couvert hors en-tête flottant (écarté par l'audit), p1280 à g1920 |
| Mentions légales sans page (finition signalée) | Finition | Page `mentions-legales.html` aux couleurs du site (en-tête, pied), avec les seules informations déjà présentes (nom, région, paiement) et le reste « à compléter » (adresse, NEQ, courriel, téléphone, hébergeur, livraison, confidentialité) ; liée depuis le pied des 4 pages | `mentions-legales.html`, 4 pages, `css/style.css` | Page 200, 0 erreur, 0 texte < 12 px, 0 cible < 44 px |
| Épinglage avec `anticipatePin` | (consigne) | `anticipatePin` retiré des deux sections épinglées | `js/home.js` | 0 coupe aux 7 tailles mesurées, avant comme après |

## Non corrigé
| Défaut | Gravité | Raison |
|---|---|---|
| Effet signature 3D absent sur téléphone | Finition | Effort moyen, finition |
| CLS de la boutique proche du seuil (0,089 sur p1280) | Finition | Finition (sous le seuil de 0,1) |
| Emplacements « visuel provisoire » / « fond provisoire » | Finition | Donnée manquante |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal (m320 à g1920) | 0 partout | 0 partout |
| Textes < 12 px (m320, m360, m390, m430, t820) | 58, 58, 58, 58, 60 | 0, 0, 0, 0, 0 |
| Cibles < 44 px (m320, m360, m390, m430, t820) | 13, 13, 13, 9, 9 | 0, 0, 0, 0, 0 |
| Éléments couverts par une barre ou le badge | badge OSD signalé par le rapport | 0 (seuls restent des passages sous l'en-tête flottant, écartés par l'audit) |
| Épinglage (1024×640 à 2560×1440, 2 sections) | 0 défaut sur 42 mesures | 0 défaut sur 42 mesures |
| Rendu 1280×720 et 1366×768 | en-tête sur une ligne, rien de coupé | identique |
| Erreurs console | 0 (hors 404 attendue) | 0 (hors 404 attendue) |
| Modules chargés deux fois | 0 | 0 |

## Note proposée
Ancienne note 81/100 → nouvelle note 88/100 · bloquants restants : 0 · verdict « Prête à envoyer »
- 5. Tous les formats 12 → 14 : textes à 12 px, cibles à 44 px et badge OSD dégagé (plafonné à 14).
- 6. Contenu 8 → 9 : les mentions légales ont une page gabarit, champs « à compléter ».
- 8. Mise en ligne 2 → 5 : X-Robots-Tag, Cache-Control et `?v=` déjà corrigés à l'étape 1.
- 9. Accessibilité 4 → 5 : tailles de texte et de cible conformes sur téléphone.
