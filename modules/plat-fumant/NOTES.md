# Plat fumant

**Créé à part** (`provenance : à part`) : ce module n'est tiré d'aucune maquette validée, il n'a pas encore servi dans un projet. Inspirations : les braises qui montent en canvas des Jardins de l'Hacienda (`chef`, `restaurant-cheminee` : une lueur dessinée une fois puis copiée à l'échelle, boucle arrêtée hors écran) et la surface de braise de l'accueil (`debut`). Famille « Donner faim au premier regard » (restaurants, cafés, bars, traiteurs, boulangeries).

De la vapeur monte d'une photo de plat ou de boisson chaude, se défait en volutes, s'écarte sous la souris ou sous le doigt puis se referme. Effet léger, posé sur n'importe quelle photo : canvas 2D en demi-résolution, aucune bibliothèque, boucle arrêtée hors de l'écran et onglet caché.

## Usage

```html
<figure class="fumant" data-module="plat-fumant" data-vapeur=".54 .63 .5" style="--fumant-ratio: 4 / 5">
  <img src="…" alt="Velouté de courge fumant…" width="1200" height="1500">
  <figcaption class="fumant__legende">…</figcaption>  <!-- facultatif -->
</figure>
<script type="module">
  import { init } from './modules/plat-fumant/module.js';
  for (const el of document.querySelectorAll('[data-module="plat-fumant"]')) init(el);
</script>
```

- La figure se pose où l'on veut (ouverture, plat du jour, carte, fiche produit) ; le module y ajoute seul le canvas `.fumant__vapeur` (`aria-hidden`). Sans JavaScript, la photo seule.
- `data-vapeur` : centre de la surface chaude et sa largeur, **en fractions de l'image** (mesurées sur le fichier, pas sur l'écran) : `x y l`. Plusieurs sources séparées par des virgules (deux assiettes, une cocotte et une tasse) : `data-vapeur=".3 .6 .2, .72 .62 .24"`. Le module refait le calcul selon le recadrage (`object-fit: cover` et `object-position`) : la vapeur reste sur le plat quand le cadre passe de 4:5 à 1:1 sur téléphone.
- `--fumant-ratio` (facultatif) fixe le cadre ; sans lui, la photo garde ses proportions.
- Couleur : `--fumant-couleur` (par défaut blanc teinté de 12 % d'accent, une vapeur éclairée par la salle). Le canvas est en `mix-blend-mode: screen` : la vapeur se voit sur le sombre et disparaît sur le clair, comme une vraie.
- `init()` renvoie `{ sources(texte), detruire() }` : `sources(".5 .6 .3")` déplace la vapeur sans recharger (photo changée dans un carrousel).

## Réglages

- `densite` (1) : 0,5 pour une tasse discrète, 1,6 pour une marmite qui bout. `intensite` (1) : opacité. `hauteur` (0,5) : jusqu'où monte la vapeur, en part de la hauteur de la photo. `vitesse` (1), `vent` (0, de -1 à 1 : une fenêtre ouverte, une hotte).
- `rayon` (0,17 du petit côté) : zone d'écart sous le pointeur. La vapeur est poussée hors du cercle, entraînée par le geste (sillage), et s'amincit là où le doigt passe ; la force retombe en 0,7 s puis le courant la referme.
- `qualite` (0,5) : résolution du canvas (multipliée par la densité de pixels, plafonnée à 1). La vapeur est floue : 0,5 suffit et coûte quatre fois moins.
- Trois secondes de vapeur sont simulées avant le premier affichage : elle est déjà là quand la photo apparaît (et sur l'aperçu).

## Pièges

- La photo fait tout : il faut du **sombre au-dessus du plat** (fond de salle, mur, pénombre) sur 40 à 50 % de la hauteur. Sur un fond blanc ou une table claire vue de dessus, la vapeur ne se voit pas : choisir une vue de trois quarts, en lumière basse.
- Placer la source sur la surface chaude (le liquide, pas le bord du bol) et lui donner la largeur du contenu : trop étroite, la vapeur fait cheminée ; trop large, elle fait brouillard.
- Plusieurs photos fumantes sur une page : chacune a sa boucle, qui ne tourne que lorsqu'elle est à l'écran. Au-delà de trois à la fois (grille de carte), réserver l'effet au plat du jour.
- `touch-action: pan-y` sur la figure : le doigt écarte la vapeur sans bloquer le défilement vertical.
- Mode calme, « réduire les animations » : le canvas n'est pas créé (et il est masqué en CSS), la photo seule.

## Variantes

- Pain sorti du four, cocotte qu'on ouvre : `hauteur` 0,35, `densite` 0,7, source large et basse.
- Boisson chaude en terrasse l'hiver : `vent` 0,3, `vitesse` 0,8.
- À combiner avec `lumiere-au-pointeur` sur une même photo sombre : la lampe éclaire, la vapeur s'écarte (deux boucles, garder `qualite` à 0,5).
