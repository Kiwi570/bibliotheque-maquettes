# Courbe interactive

Origine : `efficience-triathlon-maquette/science` (courbe de lactate à curseur, cinq bandes de zones, deux seuils, trois lectures et une phrase par zone).

## Usage

```html
<section class="cbi" data-module="courbe-interactive" aria-labelledby="cbi-titre">
  <script type="application/json">{ "x": {…}, "y": {…}, "points": [[0, 0.8], …], "zones": [{ "jusqua": 35, "nom": "Zone 1", "court": "Z1", "texte": "…" }], "seuils": [{ "x": 35, "nom": "Seuil A" }], "depart": 42 }</script>
  … <svg class="cbi__svg" role="img" aria-label="…"></svg>
  <label class="cbi__commande"><span class="socle-sr">Intensité</span><input class="cbi__curseur" type="range"></label>
  … <dl class="cbi__lectures"> [data-lecture="x"|"y"|"zone"] </dl> <p class="cbi__explication" aria-live="polite"></p>
  <details class="cbi__donnees"><summary>…</summary><table class="cbi__tableau"><caption>…</caption><thead></thead><tbody></tbody></table></details>
</section>
<script type="module">
  import { init } from './modules/courbe-interactive/module.js';
  init(document.querySelector('.cbi'));
</script>
```

Le script lit le JSON, dessine le graphique (bandes de zones, grille, graduations, courbe, aire, seuils, repère avec bulle de valeur), règle le curseur (min, max, pas, valeur de départ) et remplit le tableau. Le curseur annonce `aria-valuetext` (abscisse, ordonnée, zone) ; l'explication de zone n'est annoncée que quand la zone change.

## Réglages

- Données : `points` (au moins deux, triés ou non), `zones` (bornes hautes `jusqua`, `court` affiché quand le nom ne tient pas dans la bande), `seuils` (facultatifs), `depart`, `description` (lue par les lecteurs d'écran).
- Axes : `x` et `y` dans le JSON ou en option (`min`, `max`, `unite`, `libelle`, `pas` des graduations, `decimales`, `pasCurseur` pour x).
- `lisse` (true) : interpolation cubique monotone, qui passe par chaque point sans dépassement ; false pour des segments droits.
- `duree` (1.6), `balayage` (true), `debut` ('top 75%'), `locale` ('fr-FR').
- Couleurs : les zones vont de `--couleur-secondaire` (première) à `--couleur-accent` (dernière) par `color-mix` ; courbe et aire en accent.
- `init` renvoie `{ aller(x), detruire() }`.

## Pièges

- Le `viewBox` prend la taille réelle du SVG en pixels : les textes gardent leur taille CSS (12 px) à toutes les largeurs. La place est réservée par `aspect-ratio` (16:9, 4:3,4 sous 600 px) : aucun décalage au dessin.
- Redessin au redimensionnement avec un délai de 150 ms, seulement si la taille change vraiment.
- Le curseur est aligné sur la zone tracée par `--cbi-g` et `--cbi-d` (marges du graphique posées par le script).
- Glisser sur le graphique : `touch-action: pan-y`, le défilement vertical reste possible au doigt ; le graphique n'est pas focalisable, le clavier passe par le curseur.
- Données de démonstration : toujours le dire (étiquette « Données de démonstration ») tant que le client n'a pas fourni de vraies valeurs.
- Sans JavaScript, le graphique et le tableau restent vides : prévoir une image ou un tableau en dur si la page doit vivre sans script.

## Variantes

- Sur la maquette d'origine, couleurs de zones et seuils en dur, photos et liste de mesures à côté, référence scientifique, courbe donnée par une fonction : identité et contenu laissés de côté, la courbe passe par des points.
- `observatoire-des-cse-maquette/pouls` (jauge demi-cercle et barres qui se tracent) : même famille, non fusionnée ; une variante « jauge à curseur » pourrait réutiliser la lecture et le tableau.
