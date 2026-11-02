# Givre WebGL

Origine : `nelis-maquette/haut` (héros du frigoriste, `assets/js/frost.js`).

## Usage

```html
<section class="givre" data-module="givre-webgl" aria-labelledby="…">
  <div class="givre__fond" aria-hidden="true"><img src="…" alt=""></div>   <!-- photo ou visuel -->
  <div class="givre__voile" aria-hidden="true"></div>
  <canvas class="givre__canvas" aria-hidden="true"></canvas>
  <div class="givre__statique" aria-hidden="true"></div>
  <div class="givre__cadre socle-cadre">
    <p class="socle-surtitre">…</p>
    <h1 class="givre__titre" data-givre-cible>…</h1>
    <div class="givre__bas"><p class="givre__texte">…</p><div class="givre__actions">…boutons…</div></div>
  </div>
</section>
<script type="module">import { init } from './modules/givre-webgl/module.js'; init(document.querySelector('.givre'));</script>
```

Le titre est visible dès la première image : seul le givre s'anime (pousse depuis les bords et autour du titre en 2,4 s, puis fond le long du titre ligne par ligne). Avec une souris, il fond sous le pointeur et se reforme lentement (texture de fonte 256×160 en canvas 2D, effacée de 3 % toutes les 4 images).

## Réglages

- `pousse` (2,4 s), `fonteTitre` (true), `force` (1) ; `delai` (150 ms) à allonger si une ouverture joue avant.
- `glace`, `blanc`, `cellule` : couleurs CSS passées au shader. Par défaut `--givre-clair` (mélange secondaire + texte), `--couleur-texte`, `--couleur-accent`. Sur fond clair, le givre (additif) se voit mal : préférer un fond sombre ou baisser `force`.

## Pièges

- `socle.webgl()` est testé avant de créer le Renderer : aucune erreur console sans WebGL (défaut resté ouvert sur la maquette d'origine).
- Position du titre passée au shader dans le repère de la section, remesurée par ResizeObserver ; aucune mesure pendant l'animation.
- Densité de pixels 1,25 sur ordinateur, 1 sous 760 px ; boucle à 60 i/s au plus via `socle.boucle` (arrêt hors écran et onglet caché) ; le shader sort tout de suite là où il n'y a pas de givre.
- Sous 760 px, givre à 60 % d'opacité et bord plus fin (0,13) pour garder le texte lisible ; le paragraphe porte une ombre portée couleur fond.
- Mode calme, réduire les animations, sans WebGL et sans JavaScript : givre figé en CSS (`.givre__statique`), plus sobre que le givre animé.

## Variantes

- La maquette d'origine pose une photo produit en parallaxe sous un voile dégradé et découpe le titre en lignes qui montent : ajouter `parallaxe` / `révélation-texte` avec les modules correspondants plutôt que dans celui-ci.
- Le givre statique d'origine était dessiné en canvas 2D (branches procédurales) ; ici, motif CSS sans script.
