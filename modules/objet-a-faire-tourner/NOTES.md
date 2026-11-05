# Objet à faire tourner

Origine : madebymelody-maquette (v2) : vinyle WebGL du héros qu'on scratche à la main.

## Usage

```html
<div class="oat" data-module="objet-a-faire-tourner" role="img" aria-label="…">
  <div class="oat__objet"><!-- disque, roue, cadran : image, SVG ou canvas --></div>
  <span class="oat__reflet" aria-hidden="true"></span>               <!-- facultatif -->
  <p class="oat__indice" aria-hidden="true">Faites tourner le disque</p>  <!-- facultatif, disparaît au premier geste -->
</div>
<script type="module">import { init } from './modules/objet-a-faire-tourner/module.js'; init(document.querySelector('.oat'));</script>
```

- On attrape l'objet dans son disque (pas dans les coins), on le fait tourner dans les deux sens ; au lâcher, il garde l'élan de la main puis revient à sa rotation de repos.
- Le défilement le scratche aussi (en avant comme en arrière).
- Variables posées sur `.oat` : `--oat-angle`, `--oat-lumiere` (direction de la lumière, vers la souris), `--oat-eclat` (0 à 1), `--oat-vitesse` (0 à 1). `options.dessiner(etat)` reçoit les mêmes valeurs pour un shader (le vinyle de madebymelody : uniformes `ang`, `lum`, `lumf`, et flou de l'étiquette selon la vitesse).
- `init()` renvoie `{ etat, detruire }`.

## Réglages

`repos` (1,15 rad/s ; 0 pour un objet immobile), `defilement` (0,006), `amorti` (1,4), `elanMax` (40), `lumiere` ('section', 'objet' ou 'aucune'), `dessiner`.

## Pièges

- `touch-action: pan-y` : au doigt, un glissement vertical fait défiler la page, un glissement horizontal fait tourner l'objet.
- Le centre est mesuré au début du geste et après un défilement ou un redimensionnement, jamais à chaque image.
- La lumière s'amortit et se stabilise dès que la souris s'arrête (contrôle « souris immobile » de l'audit) ; au doigt, elle ne bouge pas.
- Boucle du socle : arrêtée hors écran et onglet caché ; en mode calme, aucune boucle et aucun geste : l'objet reste à son état de départ.
- Dans un projet de la skill : marquer l'élément `data-effet="…"` (il tourne tout seul) et `data-souris` (lumière).

## Variantes

- Roue de vélo, cadran de coffre, assiette, bobine de fil, globe : `repos: 0` et `defilement` plus faible pour un objet lourd.
- Molette de réglage : lire `etat.angle` pour piloter une valeur (volume, filtre, année).
