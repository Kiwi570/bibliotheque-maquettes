# Titre cousu

Origine : madebymelody-maquette (v2) : titre du Sur mesure brodé au fil cerise.

## Usage

```html
<h1 class="tcu" data-module="titre-cousu" data-point="satin">
  <span class="tcu__ligne">Un espace pour</span><br><span class="tcu__ligne">toutes vos idées</span>
</h1>
<script type="module">import { init } from './modules/titre-cousu/module.js'; init(document.querySelector('.tcu'));</script>
```

- Chaque ligne reçoit `data-texte` (copie de son texte) ; un pseudo-élément `::after` en reprend le texte avec le motif du point, révélé de gauche à droite par `--c` ; un point avant en tirets se coud dessous ; l'aiguille (`::before`) suit le fil en piquant.
- `declencher: 'manuel'` et `jouer()` pour le lancer dans une intro (toujours hors de la timeline de l'intro).
- `init()` renvoie `{ jouer, detruire }`.

## Réglages

`duree` (1,25 s par ligne), `decalage` (0,55 s), `declencher` ('visible' ou 'manuel'). Fil : `--tcu-fil` (sinon `--couleur-accent`). Point : `data-point="satin|croix|fil"`.

## Pièges

- Aucun enfant décoratif dans `.tcu__ligne` : une aiguille en `<span>` absolu agrandit la boîte de texte (Range) de la ligne, et l'audit voit un chevauchement avec le texte au-dessus. Tout le décor est en pseudo-éléments.
- `.tcu__ligne` est en `inline-block` : la révélation part du début du texte, pas du bord de la colonne.
- État final : le titre est entièrement brodé (couleur du fil) ; en mode calme, il l'est d'emblée, sans aiguille.
- Une ligne qui passe sur deux lignes au téléphone reste juste : le `::after` couvre la même boîte et se coupe pareil.

## Variantes

- Gravé (fil simple et ombre portée en creux), tamponné (masque d'encre irrégulier), imprimé (trame), écrit à la plume : même mécanique `--c`, autre motif.
