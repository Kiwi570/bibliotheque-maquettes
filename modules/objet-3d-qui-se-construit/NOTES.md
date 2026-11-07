# Objet 3D qui se construit

Origine : `agence-ae-maquette` (accueil, « La maquette » : la maison qui se monte et tourne avec le soleil). Rendu générique : n'importe quel objet du métier fait de boîtes (maison, extension, meuble, cuisine, stand, empilement de produits, machine simplifiée), monté pièce par pièce pendant que la section est épinglée, et qu'on fait tourner à la main avec élan.

## Usage

```html
<section class="o3d" data-module="objet-3d-qui-se-construit" data-epingle aria-labelledby="o3d-titre">
  <div class="o3d__cadre socle-cadre">
    <div class="o3d__texte" data-tient>…surtitre, h2.o3d__titre#o3d-titre, p.o3d__intro…</div>
    <div class="o3d__scene" data-tient tabindex="0" role="region" aria-label="Maquette 3D … : flèches gauche et droite pour la faire tourner">
      <div class="o3d__objet" aria-hidden="true">
        <div class="o3d__sol"></div>
        <div class="o3d__piece" data-de=".12" data-a=".3">
          <div class="o3d__boite o3d__boite--baies" style="--l:360px;--p:14px;--h:150px;--y:14px;--z:113px">
            <i class="o3d__f o3d__f--av"></i><i class="o3d__f o3d__f--ar"></i><i class="o3d__f o3d__f--g"></i><i class="o3d__f o3d__f--d"></i><i class="o3d__f o3d__f--haut"></i>
          </div>
        </div>
        …
      </div>
      <p class="o3d__indice" aria-hidden="true">Attrapez la maison pour la faire tourner</p>
    </div>
    <ol class="o3d__etapes" data-tient><li data-de="0"><div><strong>Fondations</strong><span>…</span></div></li> …</ol>
  </div>
</section>
```

- Repère de l'objet : origine au centre du sol, `--x` vers la droite, `--y` vers le haut, `--z` vers le visiteur (px). Une boîte : `--l` largeur, `--p` profondeur, `--h` hauteur, position de sa base ; `--ry`, `--rz` pour la tourner (pans de toit : `--rz` ±31°).
- Une pièce (`.o3d__piece`) regroupe une ou plusieurs boîtes et arrive entre `data-de` et `data-a` (fractions de la progression, une valeur négative la fait déjà à moitié posée à l'arrivée). Son arrivée est décrite en CSS par `--o3d-chute` (hauteur d'où elle tombe, -280px par défaut) et `--o3d-vrille` (tour sur elle-même).
- Habillages fournis : `o3d__boite--baies` (deux fenêtres et une porte dessinées sur l'avant et l'arrière), `--baie` (une fenêtre sur les côtés), `--pignon` (avant et arrière en triangle, seulement ces deux faces). Teinte d'une boîte : `--o3d-teinte`, toujours en `color-mix` des couleurs de la direction.
- Une étape du texte (`li[data-de]`) s'allume quand la progression atteint sa valeur : aligner ses valeurs sur celles des pièces.
- Pour un autre métier : cuisine (meubles bas, plan, meubles hauts, électroménager), stand d'exposition, palette de produits, bureau aménagé. Viser 8 à 14 pièces, 60 boîtes au plus.

## Pièges

- Jamais d'`opacity` sous 1 sur une pièce ou une boîte : elle aplatit la 3D (tout devient plat d'un coup). L'apparition est posée sur les faces (`.o3d__f`).
- Pas de `overflow: hidden` ni de `filter` sur `.o3d__objet` et ses enfants, pour la même raison.
- La lumière est calculée pour quatre orientations (avant, droite, arrière, gauche) : une boîte tournée de `--ry` garde l'ombre de son orientation d'origine, réserver `--ry` aux petits éléments.
- Avec `tour` à 360, l'objet finit de trois quarts comme il a commencé : c'est ce que voient le mode calme et la capture. Une autre valeur laisse l'objet de dos à la fin.
- Téléphone ou écran bas (moins de 900 × 600) : pas d'épinglage ; la scène passe avant les étapes et l'objet se monte pendant qu'elle traverse l'écran (du haut de la scène à 85 % de l'écran jusqu'à son bas à 35 %), les étapes s'allument en dessous, visibles.
- Mode calme, « réduire les animations », sans JavaScript : objet monté, toutes les étapes visibles, pas d'indice « attrapez ».
