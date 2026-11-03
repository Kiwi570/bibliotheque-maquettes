# Pluie sur la vitre

Origine : `h-renovation-maquette/haut` (« Pluie sur la vitre », 5) — `assets/js/pluie.js` (shader et essuyage), `assets/js/accueil.js` / `HR.initHero` (démarrage différé, éclaircie au défilement), `assets/css/main.css:299-344`.

Repris : le shader complet (gouttelettes posées qui naissent et s'effacent, deux couches de gouttes qui ruissellent en zigzag avec traînée claire et chapelet de gouttelettes, réfraction de l'image par la normale des gouttes, reflet en haut et ombre en bas de chaque goutte, vignettage), la buée obtenue par un niveau de mipmap flou de la même texture (aucune passe de flou), l'essuyage au pointeur dans une carte 160×160 qui s'estompe, la pluie qui se raréfie et la buée qui disparaît au défilement, 30 images/s sur téléphone, démarrage en `requestIdleCallback`. Ajouté : point focal du recadrage, `socle.boucle` (arrêt hors écran et onglet caché), garde-fou de budget, gouttes figées en SVG pour le repli, teintes prises dans les variables.

## Usage

```html
<section class="pluie" data-module="pluie-sur-vitre" aria-labelledby="pluie-titre">
  <div class="pluie__fond" aria-hidden="true"><img src="…" alt="" width="1920" height="1080"></div>  <!-- facultatif -->
  <canvas class="pluie__canvas" aria-hidden="true"></canvas>
  <div class="pluie__fige" aria-hidden="true"></div>
  <div class="pluie__voile" aria-hidden="true"></div>
  <div class="pluie__cadre socle-cadre">
    <p class="socle-surtitre">…</p>
    <h1 class="pluie__titre" id="pluie-titre">…</h1>
    <div class="pluie__bas"><p class="pluie__texte">…</p><div class="pluie__actions">…boutons…</div></div>
    <div class="pluie__indice" aria-hidden="true"><span class="pluie__indice-souris">Passez la souris pour essuyer la buée</span><span class="pluie__indice-doigt">Glissez le doigt pour essuyer la buée</span></div>
  </div>
</section>
<script type="module">import { init } from './modules/pluie-sur-vitre/module.js'; init(document.querySelector('.pluie'), { focus: [.5, .4] });</script>
```

Image : option `image` (URL), sinon l'`<img>` de `.pluie__fond` (réutilisée telle quelle, aucun second téléchargement), sinon un crépuscule neutre peint en canvas 2D d'après les variables (dégradé, lumières floues, silhouettes de toits éclairés : les gouttes se lisent sur des lumières). Sans JavaScript, un crépuscule voisin est dessiné en CSS. Le titre est en HTML au-dessus, visible dès le premier affichage ; le voile garde le texte lisible. Choisir une image de soir ou sombre, avec des lumières : sur une image claire et uniforme, la réfraction se voit peu.

`init()` renvoie `{ detruire(), mesure() }` ; `mesure()` donne la médiane des intervalles entre rendus, la densité de pixels en cours, le nombre d'images rendues et l'arrêt éventuel du garde-fou.

## Réglages

- `intensite` (1, de 0,1 à 1) : part des gouttelettes et des coulées actives ; à .4, quelques gouttes seulement.
- `buee` (true) : vitre embuée que le pointeur essuie (souris, doigt en glissé horizontal, appui) et qui se reforme en quelques secondes ; false : image nette, seules les gouttes réfractent, indice masqué.
- `eclaircie` (true) : sur la hauteur de la section, la pluie baisse de 92 % et la buée se lève.
- `focus` ([.5, .5]) : point focal du recadrage, appliqué aussi à l'`<img>` du repli (`object-position`).
- `dpr` (1,25) : plafond sur ordinateur ; 1 sous 700 px quelle que soit la densité de l'écran. Texture 2048×1024 sur ordinateur, 1024×1024 sur téléphone.
- `repli` ('gouttes') : sans WebGL, en mode calme et sous « réduire les animations », image avec environ 120 gouttes et 7 coulées figées en SVG (reflets en `--couleur-texte`, ombres en `--couleur-fond`) ; 'net' : image seule.

## Pièges

- `socle.webgl()` est testé avant le Renderer ; l'image d'une autre origine sans CORS est détectée à la copie dans la texture (`getImageData`), le premier rendu est fait sous `try` : aucune erreur console, repli figé.
- La buée a besoin de mipmaps : la texture est recopiée dans un canvas en puissance de deux (WebGL 1), le rapport d'origine est passé au shader pour le recadrage.
- Coût mesuré (Chromium, rendu logiciel SwiftShader, donc pessimiste) : 390×844 en écran ×3 avec CPU ralenti ×4 : médiane 33 ms (30 images/s visées), densité 1 gardée ; 1440×900 : 16,7 ms après baisse de densité ; 820×1180 : le garde-fou baisse la densité à 0,875.
- Garde-fou : après 1 s, médiane sur 40 rendus ; au-delà de 34 ms (50 ms sur téléphone, où l'on vise 30 images/s) la densité baisse (×0,7 jusqu'à 0,6), puis l'animation s'arrête et laisse les gouttes figées.
- L'indice est réservé (`visibility`) même sans WebGL ou sans buée : l'afficher plus tard décalait le titre (CLS).
- `touch-action: pan-y` : le défilement vertical au doigt reste prioritaire ; on essuie en glissant horizontalement ou par un appui.

## Variantes

- Laissé de côté (identité) : photo de toits sous la pluie, titre en capitales cuivre, chiffres et mentions de l'artisan, indication verticale « Défilez pour l'éclaircie », titre révélé ligne par ligne, zoom d'ouverture et parallaxe du héros (modules de révélation de texte et de parallaxe à combiner), averse CSS animée sans WebGL (remplacée par des gouttes figées, rien ne bouge en repli).
- Sur une image claire : `buee: false` et `intensite` vers .6, voile à alléger dans `.pluie__voile`.
