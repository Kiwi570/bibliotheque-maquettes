# games42-maquette

<https://games42-maquette.vercel.app> · audit du 28 octobre 2026 · dernier commit 2f026cc du 27 octobre 2026

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Le « portail » en WebGL, le cadenas des missions, les clés cachées et le couloir des cinq mondes font une maquette ludique, cohérente avec le métier, et fluide (57 à 60 i/s). Pour la rendre prête à envoyer, il faut supprimer le décalage causé par le bandeau des vacances (CLS jusqu'à 0,14), ajouter le `?v=` et une page 404, et agrandir les cibles tactiles.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Un cadenas s'ouvre sur un portail lumineux en WebGL qui suit tout le défilement et change de monde à chaque salle : c'est original et juste pour un escape game familial. |
| 2. Direction artistique et harmonie | 12/15 | Palette nuit, violet et or tenue sur les 3 pages, Fraunces et Figtree bien associées, images Grok sans défaut et cohérentes entre elles ; le texte de « Zéro frayeur » se lit mal sur l'anneau lumineux à 1920 px. |
| 3. Animations et effets | 13/15 | Titre lisible entre 1,5 s (portable) et 2,5 s (téléphone), 56,8 et 60 i/s sans saccade, couloir et époques épinglés qui tiennent à toutes les tailles ; l'arrivée tardive du bandeau fait sauter la page. |
| 4. Expérience ludique et interactions | 9/10 | Cadenas à molettes avec résultats et prix calculés, chasse aux 3 clés avec récompense, calculateurs, onglets au clavier, FAQ, menu mobile et Mode calme : tout fonctionne et se comprend seul. |
| 5. Tous les formats | 12/15 | Aucun débordement et aucune section épinglée coupée, mais beaucoup de cibles de 38 à 42 px, une croix de 29×27 px et le compte à rebours de la Machine masqué par la barre du bas à 430 px. |
| 6. Contenu et fiabilité | 9/10 | Tarifs, avis (4,9 sur plus de 1300), Petit Futé, témoignage et horaires repris du site actuel et centralisés dans `data.js` ; les « à compléter » sont bien signalés. |
| 7. Technique et performance | 8/10 | Aucune erreur JS ni lien cassé, accueil à 1,5 Mo, repli sans WebGL correct ; CLS au chargement de 0,11 à 0,14 sur 4 configurations. |
| 8. Mise en ligne | 3/5 | Site public, noindex, X-Robots-Tag et og:image JPG 1200×630 corrects ; aucun `?v=` sur le CSS et le JS du site, et la 404 est la page générique de Vercel. |
| 9. Accessibilité | 4/5 | Focus visible, Mode calme dans l'en-tête, le menu mobile et le pied de page, « réduire les animations » respecté, onglets au clavier, Échap ferme le menu ; cibles tactiles trop petites. |
| **Total** | **83/100** | |

## Points forts

- **Une idée forte qui suit tout le site :**
  - l'ouverture fait déverrouiller un cadenas ;
  - le portail WebGL accompagne le défilement ;
  - il change d'ambiance à chaque monde (sorcier, temps, pirate, cirque, serpent).
- **Le cadenas des missions** : trois molettes (équipe, âge, joueurs) qui donnent les missions possibles et le prix calculé (« 4 missions pour 6 joueurs en famille », 120 € ou 138 €).
- **La chasse aux 3 clés cachées** : un compteur dans l'en-tête, puis une fenêtre de récompense qui renvoie vers la réservation.
- **Le chrono 60:00** dans la marge (ordinateur) ou dans la barre du bas (téléphone), qui finit sur « Mission accomplie » au pied de page.
- **Une page Machine très soignée** : les trois objets à retrouver, l'horloge qui repart, et les époques épinglées avec les vraies photos de la salle.
- **Fluidité exemplaire** : 60 i/s sur téléphone, 56,8 i/s sur portable.
- **Un contenu fiable**, centralisé dans `assets/js/data.js`, avec les données manquantes affichées « à compléter » et les écarts avec les CGV signalés.

## Défauts

### Bloquants

Aucun.

### Importants

1. **CLS au chargement au-dessus de 0,1** : accueil m320 (0,115), anniversaire g1920 (0,137) et p1366 (0,139), Machine g1920 (0,138), `captures/bande-ouverture-p1440.jpg` (le bandeau orange apparaît après le contenu). Cause : `assets/js/core.js:204-211`, le bandeau `[data-notice]` est `hidden` dans le HTML (`index.html:89`) et n'est affiché qu'une fois le module chargé, ce qui pousse l'en-tête et le hero (`DIV.wrap.page-hero__grid`, `SECTION#haut.hero`) d'environ 45 px. Correction : décider de l'affichage du bandeau dans un petit script en ligne dans le `<head>` (dates de `HOURS.notice` et `sessionStorage`), ou le passer en `position: fixed` en haut avec un `padding-top` réservé dès le départ. Effort : petit.
2. **Cibles tactiles de moins de 44 px sur téléphone** : toutes les pages, m320 à m430. Cause :
   - la croix du bandeau fait 29×27 px (`assets/css/main.css:151`) ;
   - le menu et les boutons « Réserver » et « Appeler » font 42 px (`main.css:180`, `main.css:231`, `main.css:587`) ;
   - les flèches des molettes font 38 px (`main.css:309`) ;
   - les clés cachées font 46×30 px (`main.css:599`) ;
   - le fil d'Ariane fait 18 px de haut.

   Correction : `min-height: 44px` sur `.btn--sm`, `.burger` et `.actionbar__call`, `min-width/min-height: 44px` sur `.notice button` et `.cle`, `height: 44px` sur `.wheel__btn`, `padding-block` sur les liens du fil d'Ariane. Effort : petit.
3. **Aucun `?v=` sur le CSS et le JS du site** : 3 pages. Cause : `index.html:24-25` et `index.html:662` (même chose dans `anniversaire.html` et `machine-a-remonter-le-temps.html`), ainsi que les `import` entre modules (`core.js`, `data.js`, `images.js`, `portal.js`). Correction : ajouter le même `?v=20261028` à `main.css`, `lenis.css`, `home.js`, `anniv.js`, `machine.js` et aux imports internes. Effort : petit.
4. **Page 404 générique de Vercel** : `captures/404-p1440-zz.jpg`. Cause : pas de `404.html` à la racine. Correction : `404.html` aux couleurs du site (fond nuit, portail en CSS, « Ce portail ne mène nulle part », bouton retour à l'accueil), avec le noindex. Effort : petit.

### Finition

1. **Texte de « Zéro frayeur » posé sur l'anneau lumineux** : accueil, g1920, `captures/accueil-g1920-09.jpg`. Les étincelles passent sous le paragraphe et les sous-titres gris. Cause : le calque image du portail reste à `opacity: .7` (`main.css:143`) et l'anneau est centré sur la colonne de texte (`index.html:319`, `data-dim="0.26"`). Correction : `data-dim` plus fort sur cette section, ou un voile `radial-gradient` sombre derrière `.frayeur` au-dessus de 1600 px. Effort : petit.
2. **Compte à rebours de la Machine masqué par la barre du bas à l'ouverture** : Machine, m430 (« Le temps s'est arrêté il y a exactement… », y = 883 px). Cause : `machine-a-remonter-le-temps.html:113`, bloc en bas du hero, avec la barre `.actionbar` affichée dès l'ouverture. Correction : `padding-bottom: var(--barres-h)` sur `.page-hero` en mobile, ou barre affichée seulement après le hero. Effort : petit.
3. **Cartes claires « lune »** (anniversaires, écoles, infos pratiques) : leur entrée laisse un grand aplat blanc vide pendant le défilement (`captures/accueil-g1920-09.jpg`, `accueil-p1440-13.jpg`). Le rythme nuit et blanc est voulu, mais la transition paraît vide une fraction de seconde. Correction : démarrer l'animation du contenu plus tôt (`start: 'top 85%'`). Effort : petit.
4. **Note interne visible dans la FAQ** : « Les CGV actuelles indiquent un âge minimum de 7 ans : à harmoniser » (`index.html:556`). C'est utile pour le client, mais à retirer une fois tranché. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Ouverture (titre lisible), portable / téléphone | 1,5 s / 2,5 s (bandes d'ouverture ; cadenas de 1 s puis titre en fondu) |
| Fluidité p1440 / m390 | 56,8 i/s / 60 i/s (très bien, 0 image > 100 ms) |
| CLS au chargement (max) | 0,139 (anniversaire p1366) ; 0,115 accueil m320, 0,137 et 0,138 en g1920 ; ailleurs < 0,07 |
| Poids de l'accueil, p1440 / m390 | 1,54 Mo / 1,46 Mo |
| Erreurs console, sans WebGL, réduire les animations | aucune erreur JS ; repli CSS sans WebGL correct ; réduit respecté |
| Débordement horizontal | aucun, à tous les formats |
| Sections épinglées | couloir des mondes (accueil), objets et époques (Machine) : tiennent dans l'écran de 1000×560 à 2560×1440 |
| Mise en ligne (public, noindex, X-Robots-Tag, robots.txt, og:image, ?v=, 404) | oui / oui / oui / absent (non pénalisé) / JPG 1200×630 complète / absent / générique Vercel |

## Vérifications écartées

- **Machine p1440, captures vides (époques, autres mondes, hero sans image)** : la mesure a subi un `ERR_NETWORK_CHANGED` (0,37 Mo chargés au lieu de 1,1 Mo). Une nouvelle capture faite seule montre toutes les images (`captures/verif-machine-p1440-00.jpg`, `verif-machine-p1440-30.jpg`), comme en g1920.
- **Texte « Appeler » à 0 px à 320 px** : c'est voulu (`main.css:592`). Sous 360 px, le bouton n'affiche que l'icône, et le texte reste lu par les lecteurs d'écran.
- **« 1296 avis » sur la planche m390** : c'est le compteur animé saisi en cours de route ; la valeur finale est 1300 (`data.js:15`).
- **Bande de texte brouillée en bas de `bande-ouverture-m390.jpg`** : c'est un artefact de capture sous la barre du bas, qui arrive en `backdrop-filter`. La capture `accueil-m390-00.jpg` est nette.
- **Erreurs 404 en console sur la page introuvable** : c'est le statut normal de cette page (le défaut retenu est le gabarit générique).
- **Cercle vide fixe à gauche sur les captures d'ordinateur** : c'est le curseur personnalisé, figé à sa position par défaut pendant les captures automatiques.
- **Images Grok** : les 21 images (portail, cinq mondes, Machine, porte, pros, anniversaire, invitations, bon cadeau, lanterne, textures) ont été regardées en taille réelle. Aucune main déformée, aucun texte, aucun filigrane, et la série est cohérente. Les mains de `pros-entreprise.webp` sont correctes.


---

## games42-maquette : corrections de l'étape 2

Commit 82dad2e (non poussé) · ?v=20261028-2

## Corrigé
| Défaut (rapport) | Gravité | Correction | Fichiers | Vérifié (avant → après) |
|---|---|---|---|---|
| CLS au chargement au-dessus de 0,1 (bandeau des vacances) | Important | Bandeau rempli dans le HTML et affiché par un petit script en ligne avant le premier rendu (dates en `data-from` / `data-until`, fermeture en `sessionStorage` respectée) | `index.html`, `anniversaire.html`, `machine-a-remonter-le-temps.html`, `404.html`, `assets/js/data.js` (commentaire) | Accueil m320 0,115 → 0 |
| CLS au chargement (seconde cause, trouvée en corrigeant) | Important | Le titre de l'ouverture partait d'une graisse 280, plus étroite, et passait de 2 à 3 lignes en s'épaississant. La largeur des mots est maintenant figée à la graisse finale avant l'animation. | `assets/js/anniv.js`, `assets/js/machine.js` | Anniversaire p1366 0,144 → 0, p1280 0,107 → 0,002, g1920 0,132 → 0 ; Machine g1920 0,135 → 0 |
| Cibles tactiles de moins de 44 px | Important | Croix du bandeau 44×44, `.btn--sm`, burger, outils de l'en-tête, « Appeler », marque à 44 px ; flèches des molettes à 44 px ; clés cachées 46×44 (même dessin, centre conservé) ; fil d'Ariane, liens `.link` et liens du pied de page à 44 px sur téléphone et tablette | `assets/css/main.css` | De 9 à 18 cibles par page et par format → 0 (seuls restent les boutons radio du calculateur, voir plus bas) |
| Texte de moins de 12 px | Important | Sous-titre de la marque à `max(12px, .72rem)` | `assets/css/main.css` | t820 : 11,5 px → 12 px. « Appeler » à 0 px sous 360 px est voulu (icône seule), écarté par le rapport |
| Compte à rebours de la Machine masqué par la barre du bas (m430) | Finition (clé `masque-barre`) | La barre n'apparaît qu'une fois le héros dépassé et s'efface sur les formulaires, le pied de page et le menu ouvert (IntersectionObserver). `--barres-h` est mesurée en JS et réserve la place sous le pied de page. | `assets/js/core.js`, `assets/css/main.css` | Machine m430 : 1 élément couvert → 0 ; aucun élément couvert de m320 à m430 |
| Aucun `?v=` sur le CSS et le JS | Important | Déjà corrigé à l'étape 1 ; passé à `?v=20261028-2` partout, imports internes compris | toutes les pages et les modules | Une seule adresse par fichier, aucun module chargé deux fois (4 pages vérifiées) |
| Page 404 générique de Vercel | Important | `404.html` aux couleurs du site : en-tête, menu, bandeau, portail WebGL, pied de page, « Ce portail ne mène nulle part », retour à l'accueil, noindex, chemins absolus | `404.html` | Débordement m320 à t820 (page Vercel) → aucun ; 404 personnalisée |

## Non corrigé
| Défaut | Gravité | Raison (image Grok / effort gros / finition / donnée manquante) |
|---|---|---|
| Texte de « Zéro frayeur » posé sur l'anneau lumineux en g1920 | Finition | Finition |
| Cartes claires « lune » : aplat blanc vide pendant leur entrée | Finition | Finition |
| Note interne visible dans la FAQ (âge minimum à harmoniser avec les CGV) | Finition | Donnée manquante : à trancher par le client |
| Boutons radio du calculateur d'anniversaire (14×18 px mesurés) | Note | Pas un défaut : toute l'étiquette (plus de 44 px de haut) est la zone cliquable |

## Mesures avant / après
| Mesure | Avant | Après |
|---|---|---|
| Débordement horizontal, pages du site (m320 à g1920) | aucun | aucun |
| Débordement horizontal, page introuvable | m320, m360, m390, m430, t820 (page Vercel) | aucun |
| CLS au chargement, maximum | 0,144 (anniversaire p1366) ; 0,115 accueil m320 ; 0,132 à 0,135 en g1920 | 0,0023 (anniversaire m320) |
| Textes < 12 px | « Appeler » 0 px en m320 (voulu) + marque 11,5 px en t820 | « Appeler » 0 px en m320 (voulu) |
| Cibles < 44 px (accueil m390 / anniversaire m390 / Machine m390) | 16 / 10 / 10 | 0 / 1 (radio dans son étiquette) / 0 |
| Éléments couverts par la barre du bas (m320 à m430) | 1 (compte à rebours, Machine m430) | 0 |
| Épinglage aux 8 tailles (couloir, objets, époques) | 0 problème sur 72 mesures | 0 problème sur 72 mesures |
| En-tête en 1280×720 et 1366×768 | sur une ligne | sur une ligne, rien de coupé |
| Erreurs console | 9 (statut 404 de la page introuvable) | 9 (même cause, aucune nouvelle) |
| Modules chargés deux fois | 0 | 0 |

Interactions cliquées : barre du bas (masquée à l'ouverture, visible en milieu de page, masquée au pied de page et menu ouvert), menu mobile et Échap, fermeture du bandeau, page 404. Preuves : `preuve-machine-m430-ouverture.jpg`, `preuve-accueil-m390-barre.jpg`, `preuve-anniversaire-m390-pied.jpg`, `preuve-anniversaire-p1366-ouverture.jpg`, `preuve-404-m390.jpg`.

## Note proposée
Ancienne note 83/100 → nouvelle note 90/100 · bloquants restants : 0
- Critère 3 (animations) 13 → 14 : l'arrivée tardive du bandeau ne fait plus sauter la page.
- Critère 5 (formats) 12 → 14 : cibles de 38 à 42 px et croix de 29×27 px corrigées, compte à rebours de la Machine dégagé (+3, plafonné à 14).
- Critère 7 (technique) 8 → 9 : CLS au chargement ramené sous 0,003 partout.
- Critère 8 (mise en ligne) 3 → 5 : `?v=` cohérent (étape 1, vérifié) et 404 aux couleurs du site.
- Critère 9 (accessibilité) 4 → 5 : cibles tactiles à 44 px.
