# Globe d'itinéraire

Origine : `stanislas-urbi-orbi-maquette/ligne` (« Le tour du monde sur le globe » : globe OGL qui suit une ligne géodésique au défilement, compteur de kilomètres, jalons, carte SVG de repli).

## Usage

```html
<section class="gi" data-module="globe-itineraire" data-epingle>
  <div class="gi__tete socle-cadre">…surtitre, h2.gi__titre, p.gi__intro…</div>
  <div class="gi__corps socle-cadre">
    <div class="gi__scene" data-tient="globe">
      <div class="gi__globe">
        <canvas class="gi__toile" aria-hidden="true"></canvas>
        <p class="gi__compteur" aria-hidden="true">Étape <b data-gi-n>1</b> / <span data-gi-total>6</span></p>
      </div>
      <nav class="gi__nav" aria-label="Étapes du parcours sur le globe"></nav>   <!-- boutons construits par le module -->
    </div>
    <ol class="gi__etapes" aria-label="Étapes du parcours">
      <li class="gi__etape" id="gi-etape-1" data-lat="48.9" data-lon="2.4">     <!-- degrés décimaux, sud et ouest négatifs -->
        <p class="gi__n"><b>01</b><span>48,9° N · 2,4° E</span></p>
        <h3>…</h3><p>…</p>
      </li>
    </ol>
  </div>
</section>
```

Le globe est un canvas 2D (projection orthographique), sans WebGL ni bibliothèque : océan, halo, méridiens et parallèles, terres en points, tracé en grand cercle entre les étapes (fantôme en pointillés, partie parcourue en couleur d'accent), points d'étape et repère qui avance. La liste `ol` reste le texte de référence pour les lecteurs d'écran ; le canvas est `aria-hidden`. Les boutons « Étape n : titre » (44 px) et « Vue d'ensemble » sont ajoutés par le module.

- Ordinateur (≥ 900 × 500) : globe collant à gauche ; la position dans la liste fixe la progression en continu (le globe tourne entre deux étapes), les boutons font défiler jusqu'à l'étape.
- Tablette en portrait (600 à 899 de large, ≥ 860 de haut) : bandeau collant en haut (48 % de la hauteur utile), les étapes défilent dessous.
- Téléphone, écrans bas : aucun épinglage ; globe dans le flux en vue d'ensemble (tracé complet), les boutons le font tourner vers une étape.
- Réduire les animations et mode calme : globe immobile dans le flux, tracé complet, toutes les étapes allumées ; les boutons recentrent sans animation.

## Réglages

- `lecture` (0,55) : une étape commence quand son haut passe cette fraction de la hauteur visible (sous le bandeau en tablette).
- `douceur` (6) : vitesse de rattrapage du globe ; `inclinaison` (0,7) : part de la latitude suivie par la caméra.
- `grille` (30°, 0 pour l'enlever), `numeros` (true).
- Couleurs : `--gi-ocean`, `--gi-terre`, `--gi-grille`, `--gi-trace`, `--gi-halo` sur `.gi`, dérivées des variables d'identité ; le module les lit par des sondes CSS, il n'a aucune couleur en dur.

## Pièges

- Terres : `terres.js` (4 Ko, 5 100 points au pas de 1,5°) est généré une fois par `generer-terres.mjs` à partir de `land-110m.json` du paquet npm `world-atlas@2` (licence ISC, Mike Bostock), lui-même tiré de Natural Earth 1:110m (domaine public). Aucun chargement en ligne. Pour un globe plus fin : `node modules/globe-itineraire/generer-terres.mjs land-110m.json 1` (≈ 11 000 points).
- Choisir des étapes qui tiennent dans un hémisphère pour la vue d'ensemble (calme, téléphone) : au-delà de 90° du centre du parcours, une étape passe derrière le globe. Pour un vrai tour du monde, garder le suivi au défilement et accepter que la vue d'ensemble n'en montre qu'une face.
- Le dessin n'a lieu que si quelque chose bouge, et la boucle du socle (`boucle`) s'arrête hors écran et onglet caché : pas de rotation au repos.
- Les positions des étapes sont lues à chaque image tant que le globe est visible (six `getBoundingClientRect`) : rester sous une vingtaine d'étapes.
- L'origine écrivait une erreur console sans WebGL et dessinait sa carte de repli à part : ici, un seul rendu, sans WebGL ; sans script, un disque d'océan en CSS tient la place et la liste reste lisible.
- La largeur de la scène collante est bornée par la hauteur utile (`--ecran-h − --entete-h − --barres-h − 2 marges`) : elle tient en 1000×560.

## Variantes

- L'origine ajoute un compteur de kilomètres qui ralentit sur les terres et accélère sur les océans, des étiquettes de pays sans chevauchement, des extraits de cartes anciennes par pays et un son à chaque jalon : habillage propre au projet, laissé de côté (le compteur est facile à remettre à partir de `p`, la progression continue).
- Le shader de l'origine dessine les terres en points depuis une texture ; la grille de points précalculée en reprend l'aspect sans WebGL.
- Pour un parcours local (région, ville), préférer `carte-itineraire-collante` : un globe n'a de sens qu'à l'échelle d'un continent.
