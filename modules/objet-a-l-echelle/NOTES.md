# Objet à l'échelle

Origine (fusion) :
- `atelier-shazak-maquette/oeuvres` (« Essai d'une pièce au mur », note 5) : choix de la pièce et du décor par puces, curseur de largeur supposée, silhouette de 1,70 m, règle graduée au sol, fondu à chaque changement de pièce.
- `laure-polin-maquette/oeuvre-echelle` : bascule console / sol, cote verticale à talons à droite de l'objet, objet mural centré à 150 cm du sol.
- `patchacha-maquette/voir-au-mur` : décors et meubles de référence dessinés en SVG **en centimètres** (un seul facteur cm → px pour tout), cote de largeur, dimensions annoncées en texte.
- `pierre-becq-lanterne-maquette/objet-echelle` : console de 80 cm, calcul du facteur sur la hauteur et la largeur disponibles, cote « H … cm ».

## Usage

```html
<section class="oae" data-module="objet-a-l-echelle" aria-labelledby="oae-titre">
  <div class="oae__corps">
    <div class="oae__tete"><h2 id="oae-titre">…</h2><p class="oae__texte">…</p></div>
    <div class="oae__scene" data-scene><p class="oae__repli">Dimensions en clair, pour le cas sans JavaScript.</p></div>
    <div class="oae__commandes" data-commandes></div>
  </div>
  <template data-objet="tableau" data-nom="Tableau" data-pose="mur" data-variantes="Petit:40x50|Moyen:60x80x3|Grand:90x120" data-choisie="1">
    <img src="tableau-detoure.webp" alt="">   <!-- ou un dessin CSS/SVG -->
  </template>
  <template data-objet="vase" data-nom="Vase" data-pose="console sol" data-l="30" data-h="45"> … </template>
  <template data-objet="tenture" data-nom="Tenture" data-pose="mur" data-variantes="90x120" data-libre="30-200" data-pas="5"> … </template>
</section>
<script type="module">
  import { init } from './modules/objet-a-l-echelle/module.js';
  init(document.querySelector('.oae'));
</script>
```

Chaque `<template data-objet>` décrit un objet : `data-variantes` (`nom:LxH` ou `nom:LxHxP` en cm, séparées par `|`) ou `data-l` / `data-h`, `data-pose` (une ou plusieurs de `mur`, `sol`, `console` ; plusieurs = boutons « Pose »), `data-libre="min-max"` pour un curseur de largeur (la hauteur suit le rapport de la variante), `data-note` (ligne de plus dans le cartel). Le contenu du template est le visuel, étiré à la boîte L × H : une image détourée, un dessin CSS ou un SVG en `preserveAspectRatio="none"`. Les mêmes données peuvent passer par `options.objets`.

Le module construit la scène (mur, sol, règle, silhouette, meuble, console, objet, cotes) et les commandes (fieldsets de boutons `aria-pressed`, curseur natif). Le cartel est `aria-live="polite"` ; la scène est `role="img"` avec une description complète (objet, dimensions, pose, décor, référence).

## Réglages

- `reference` (170) : hauteur de la silhouette en cm, affichée « 1,70 m ».
- `centreMur` (150) : centre d'un objet mural ; il remonte au-dessus du meuble du décor si besoin (meuble + 20 cm).
- `hauteurConsole` (80) : console dessinée sous l'objet en pose `console`, large de l'objet + 30 cm (100 cm au moins).
- `decors` : `[{ id, nom, meuble }]`, meubles fournis `canape` (200 × 85) et `bureau` (120 × 75) ; un décor sans meuble = mur nu. Le fond du mur se règle en CSS par `.oae__scene[data-decor="…"] .oae__mur`.
- `regle` (true), `duree` (0,6 s, 0 = sans animation).
- Variable CSS `--oae-k` (pixels par centimètre) posée sur la scène : les visuels l'utilisent pour garder un cadre, une frange ou une ombre proportionnés.

## Pièges

- Un seul facteur cm → px pour tout, recalculé au `ResizeObserver` de la scène (jamais à la fenêtre seule) ; le facteur est le plus petit entre la hauteur utile (référence ou sommet de l'objet) et la largeur du groupe silhouette + objet + meuble.
- Quand la scène est plus haute que nécessaire (téléphone, meuble large), le sol monte au lieu de laisser du vide au-dessus ; la hauteur de la scène ne change jamais (pas de CLS).
- La cote de hauteur se place à droite de l'objet : un meuble posé à droite est écarté d'autant (deux passes de calcul).
- Dire que l'échelle est indicative (mention sous le cartel) ; ne pas afficher le bloc quand les dimensions ne sont pas connues (un objet sans variante valide est ignoré, aucun objet = module inactif).
- Textes des cotes et de la règle ≥ 12 px ; tout est `aria-hidden` dans la scène, l'information passe par le cartel et l'`aria-label`.

## Variantes

- Patchacha fait glisser l'œuvre sur le mur (pointeur et flèches) et règle la lumière de la pièce (matin, midi, soir) ; Shazak et Pierre Becq posent l'objet sur une photo d'ambiance calée à l'échelle. Ces trois pistes sont laissées de côté (photos clientes, ambiance propre à chaque maquette) ; une photo calée peut remplacer `.oae__mur` si l'on connaît ses pixels par centimètre.
- Laissés de côté (identité) : les photos détourées des œuvres, les décors photographiés ou générés, le son de maillet de Shazak, la chute avec rebond de Pierre Becq, le texte bilingue de Laure Polin, les couleurs et polices des quatre maquettes.
