# Dépliant 3D

Origine : `nolanis-maquette` (page Print & Web, « Le dépliant des imprimés », v3 puis v4). La v4 a corrigé l'ordre d'ouverture : rien ne bougeait pendant le premier tiers, et le volet gauche sortait de derrière le volet du milieu alors que la couverture était encore fermée. Ici, l'ordre d'un vrai dépliant : couverture (dos du volet droit) d'abord, dès le début du défilement, puis le volet gauche, puis à plat jusqu'à la fin.

## Usage

```html
<section class="d3d" data-module="depliant-3d" data-epingle aria-labelledby="d3d-titre">
  <div class="d3d__cadre socle-cadre">
    <div class="d3d__tete" data-tient>…surtitre, h2.d3d__titre#d3d-titre, p.d3d__intro…</div>
    <div class="d3d__depliant" data-tient>
      <article class="d3d__volet"><span class="d3d__verso" aria-hidden="true">dos du volet gauche</span> p.d3d__num, h3, ul.d3d__liste, figure.d3d__media</article>
      <article class="d3d__volet">… volet du milieu, sans dos …</article>
      <article class="d3d__volet"><span class="d3d__verso" aria-hidden="true">couverture</span> …</article>
    </div>
  </div>
</section>
```

## Pièges

- Toujours trois volets ; le dos (`.d3d__verso`) est une face arrière (`backface-visibility: hidden`, `rotateY(180deg)`) : jamais visible quand le volet est ouvert, retiré en mode calme et sans JavaScript (sinon il se superpose au texte et l'audit le compte comme chevauchement, nolanis v3).
- Un volet replié est `inert` : son texte, vu à l'envers, n'est ni lisible ni atteignable au clavier.
- La boîte du dépliant prend la hauteur restante de l'écran épinglé (`max-height: 620px`) : sous 760 px de haut, listes resserrées et phrase d'introduction retirée.
- Téléphone (moins de 761 px) ou écran bas : pas d'épinglage ; chaque volet se déplie depuis son bord haut en entrant dans l'écran et ne se replie jamais.
