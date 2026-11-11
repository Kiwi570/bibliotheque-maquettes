# Lumière au pointeur

Origine (fusion) :
- `winsbike-maquette/top` (« Établi éclairé à la lampe », 5) : lampe WebGL (OGL) qui suit le curseur sur une photo plongée dans le noir, poussière qui brille dans le halo, promenade de la lampe sans curseur, repli sans WebGL en masque CSS radial animé (`--mx` / `--my`) ; le fond reste à environ 13 % hors du halo.
- `pierre-becq-lanterne-maquette/haut` (« Flamme sur la boiserie », 5) : vrai modelé de la lumière (normale tirée de la luminance de l'image, diffus + spéculaire), vacillement de flamme, lumière qui « s'allume » à l'arrivée, vignettage, image en « cover ».
- `instinct-aventure-maquette/contact` (jeu de lampe torche sous le ciel étoilé, 5) : faisceau à bord net, lampe qui erre seule après 2,6 s d'inactivité, suivi du doigt (`pointerdown` + `pointermove`), boucle arrêtée hors écran.

Shader retenu : celui de Pierre Becq (relief + diffus + spéculaire), avec la poussière qui tombe de Winsbike et un profil de faisceau à bord net (Instinct) mêlé au halo doux par `uDur`. Les trois sources sont des préréglages (`source`).

## Usage

```html
<section class="lum" data-module="lumiere-au-pointeur" aria-labelledby="lum-titre">
  <div class="lum__fond" aria-hidden="true"><img src="…" alt="" width="1920" height="1080"></div>  <!-- ou <picture>, facultatif -->
  <canvas class="lum__canvas" aria-hidden="true"></canvas>
  <div class="lum__ombre" aria-hidden="true"></div>
  <div class="lum__voile" aria-hidden="true"></div>
  <div class="lum__cadre socle-cadre">
    <p class="socle-surtitre">…</p>
    <h1 class="lum__titre" id="lum-titre">…</h1>
    <p class="lum__texte">…</p>
    <div class="lum__actions">…boutons…</div>
    <div class="lum__indice" aria-hidden="true"><span class="lum__indice-souris">Promenez la souris sur l'image</span><span class="lum__indice-doigt">Touchez l'image</span></div>
  </div>
</section>
<script type="module">import { init } from './modules/lumiere-au-pointeur/module.js'; init(document.querySelector('.lum'), { focus: [.7, .4], source: 'bougie' });</script>
```

Image : option `image`, sinon l'`<img>` de `.lum__fond` (réutilisée, pas de second téléchargement ; un `<picture>` donne une version portrait), sinon une scène neutre peinte en canvas 2D d'après les variables (planches, étagère, objets autour du point d'intérêt), posée aussi en fond CSS pour le repli. La photo se choisit **claire ou en pénombre douce** : c'est le module qui l'assombrit (ambiante 15 %) ; une photo déjà très noire ne laisse rien à éclairer.

`init()` renvoie `{ detruire(), mesure() }` (`mesure().lumiere` : position et rayon de la lumière en pixels). `root.dataset.etat` vaut `suit`, `retour` ou `repos` ; `root.dataset.source` la source.

## Réglages

- `source` : `lampe` (halo doux, poussière), `bougie` (halo plus petit et plus chaud, vacillement de l'intensité, du rayon et de la position), `torche` (faisceau à bord net, ombre presque noire, lumière blanche). `rayon`, `ombre`, `vacillement`, `poussiere`, `relief` et `teinte` remplacent le préréglage.
- `focus` ([.66, .42]) : point d'intérêt, en fraction de l'image. Il sert au recadrage (« cover » autour de ce point, comme `object-position`), au repos de la lumière, à l'état calme et sans JavaScript (`--lum-fx` / `--lum-fy`). Avec le recadrage choisi, ce point tombe à la même fraction de l'écran : aucun calcul à faire.
- `repos` : `promenade` (défaut, la lumière décrit une lente courbe autour du point d'intérêt) ou `focus` (elle s'y pose). `delai` (900 ms) : temps avant le retour, qui est lent (lissage 0,025 par image) alors que le suivi est vif (0,1).
- Repli : sans WebGL, la même lumière en masque CSS (`.lum__ombre` : trou radial dans un voile de nuit, halo en `overlay` et `screen`), animée par `--lum-x` / `--lum-y` / `--lum-r`. Mode calme et « réduire les animations » : ce masque, fixé au point d'intérêt, rien ne bouge, WebGL n'est pas chargé.

## Pièges

- Le texte ne doit jamais dépendre de la lumière : `.lum__voile` (dégradés bas et gauche) et des ombres portées le gardent lisible, même quand la lumière passe derrière le titre. Poser le point d'intérêt hors de la zone de texte.
- `touch-action: pan-y` : le doigt promène la lumière sans bloquer le défilement vertical ; un `pointercancel` (le navigateur reprend le geste) déclenche le retour au repos.
- Le rayon est en part du plus grand côté, agrandi de 35 % sous 700 px, sinon le halo est minuscule sur téléphone en portrait.
- Garde-fou : après 1 s, médiane sur 40 images ; au-delà de 34 ms, densité ×0,7 (jusqu'à 0,75), puis bascule sur le masque CSS. En rendu logiciel (SwiftShader) à 1440×900, la médiane mesurée est d'environ 33 ms : sur une machine lente le repli CSS peut prendre le relais, c'est voulu.
- Changer de source : `detruire()`, remplacer le canvas par un clone (le contexte WebGL perdu ne se réutilise pas), puis `init()` (voir la démonstration).
- Une image d'une autre origine reçoit `crossOrigin = 'anonymous'` ; si le premier rendu échoue, repli CSS sans erreur console.
- Dans une section en `display: grid`, le `justify-content: flex-end` du module pousse le texte à droite : forcer le texte sur toute la largeur de sa colonne (jardins-hacienda-2 v7, page 404).
- Demande OGL : un projet qui ne le charge pas partout doit le charger à la demande avant `init` (adaptateur du socle).

## Variantes

- Laissé de côté (identité) : photos d'établi, de boiserie et de savane, éclats de vitrail et pendule détourée qui suit la flamme (Pierre Becq), recherche instantanée et bandeau défilant (Winsbike), ciel étoilé, paires d'yeux à trouver et compteur du jeu (Instinct), révélation du titre en dorure et parallaxe (modules de révélation à combiner).
- Le jeu d'Instinct (trouver des éléments cachés dans le faisceau) se refait en posant des éléments dans `.lum__cadre` et en lisant la position de la lumière dans `mesure().lumiere` ; il n'est pas dans le module.
- Sur fond clair, ce module n'a pas de sens : il repose sur la nuit.
