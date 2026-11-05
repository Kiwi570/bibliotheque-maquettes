# Axes au défilement

Origine : madebymelody-maquette (v2) : titres Fraunces « du sage au sauvage ».

## Usage

```html
<main data-module="axes-au-defilement">
  <h2 data-axes>Du sage au sauvage</h2>
  <h2 data-axes data-axes-de='"SOFT" 0, "WONK" 1' data-axes-a='"SOFT" 100, "WONK" 0'>Dans l'autre sens</h2>
</main>
<script type="module">import { init } from './modules/axes-au-defilement/module.js'; init(document.querySelector('main'));</script>
```

- Chaque titre passe de `de` à `a` entre « haut du titre à 90 % de l'écran » et « à 38 % ». Les axes à deux états (`bascule`, WONK par défaut) changent à 55 % du trajet.
- Mode calme : état d'arrivée d'emblée.
- `init()` renvoie `{ detruire }`.

## Réglages

`selecteur` ('[data-axes]'), `de`, `a`, `bascule` (['WONK']), `debut` ('top 90%'), `fin` ('top 38%'). État de départ en CSS : `--axes-de` (pour qu'aucun saut n'ait lieu à l'arrivée du script).

## Pièges

- N'animer que des axes qui gardent la largeur des lettres : SOFT et WONK (Fraunces), CASL (Recursive), GRAD (Roboto Flex), MONO… Jamais `wght` ni `wdth` : les lignes se recomposent pendant le défilement (CLS, titres découpés en lignes qui débordent).
- Charger la police variable avec ces axes (Google Fonts : `family=Fraunces:opsz,wght,SOFT,WONK@…`, ou fichier `full` de fontsource) : un fichier statique ignore `font-variation-settings`.
- Un titre découpé en lignes (SplitText, data-anime) garde l'animation : les lignes héritent de `font-variation-settings`.
- Dans un projet de la skill : `data-effet="…"` sur chaque titre (le style change au défilement : l'audit le compte comme un effet).

## Variantes

- Recursive : `"CASL" 0` vers `"CASL" 1` (sérieux vers manuscrit) ; Roboto Flex : `"GRAD" -50` vers `"GRAD" 150` (contraste sans changer la largeur).
