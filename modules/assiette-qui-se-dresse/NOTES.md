# Assiette qui se dresse

**Créé à part** (`provenance : à part`) : ce module n'est tiré d'aucune maquette validée, il n'a pas encore servi dans un projet (voir « Inspirations » plus bas). Famille « Donner faim au premier regard ».

Vue de dessus : pendant que la section est épinglée, les éléments du plat arrivent un à un dans l'assiette, dans l'ordre du dressage (la purée tirée à la cuillère, les tranches posées en éventail, le jus en filet puis en gouttes, les herbes et la fleur de sel en pluie), et la recette, à côté, s'allume étape par étape.

## Usage

```html
<section class="assiette" data-module="assiette-qui-se-dresse" data-epingle aria-labelledby="assiette-titre">
  <div class="assiette__cadre socle-cadre">
    <div class="assiette__texte" data-tient>…surtitre, h2.assiette__titre#assiette-titre, p.assiette__intro…</div>
    <div class="assiette__scene" data-tient role="img" aria-label="Assiette vue de dessus : …">
      <svg class="assiette__defs" width="0" height="0" aria-hidden="true" style="position:absolute"><defs>…dégradés partagés…</defs></svg>
      <div class="assiette__plat" aria-hidden="true"></div>
      <div class="assiette__element" data-de=".2" data-a=".42" style="--ox:46%;--oy:44%"><svg viewBox="0 0 1000 1000" aria-hidden="true">…</svg></div>
      <div class="assiette__element" data-geste="trace" data-de=".02" data-a=".2"><svg viewBox="0 0 1000 1000" aria-hidden="true">
        <defs><mask id="m-puree" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
          <path class="assiette__trait" d="…ligne du geste…" pathLength="1" fill="none" stroke="white" stroke-width="190" stroke-linecap="round"/></mask></defs>
        <g mask="url(#m-puree)">…la purée dessinée…</g></svg></div>
      <div class="assiette__element" data-geste="pluie" data-de=".76" data-a=".9"><svg viewBox="0 0 1000 1000" aria-hidden="true">
        <g class="assiette__grain" style="--r:0">…</g><g class="assiette__grain" style="--r:.2">…</g> …</svg></div>
    </div>
    <ol class="assiette__etapes" data-tient><li data-de="0"><div><strong>La purée</strong><span>…</span></div></li> …</ol>
  </div>
</section>
```

- **Repère** : chaque élément est une couche de la taille de la scène (carré), dessinée dans un `viewBox="0 0 1000 1000"` où l'assiette est centrée (bord à 6 % : rayon 440, creux : rayon 330). Ainsi tous les éléments se superposent sans calcul de position, qu'ils soient en SVG ou en image détourée au même cadrage (`<img>` à la place du `<svg>`).
- **Progression** : un élément arrive entre `data-de` et `data-a` (fractions de la progression, alignées sur les `li[data-de]` de la recette). Le module pose `--m` (0 à 1) ; tout le reste est en CSS.
- **Gestes** (`data-geste`) :
  - absent (« tombe ») : la couche descend. Vue d'en haut, plus haute veut dire plus grande et plus loin du centre : elle est agrandie autour de son centre `--ox --oy` (en %, par défaut 50 %) et décalée vers l'extérieur ; son ombre s'éloigne et s'adoucit. `--hauteur` (0,7) règle la hauteur de départ, `--vrille` (0deg) une rotation pendant la chute ;
  - `trace` : la couche ne tombe pas ; ses `.assiette__trait` (chemins `pathLength="1"`) se tracent. Dans un `<mask>`, un trait large révèle une forme pleine : purée tirée à la cuillère, filet de sauce, trait de coulis ;
  - `pluie` : la couche ne tombe pas ; chacun de ses `.assiette__grain` tombe à son tour selon `--r` (0 : le premier, 1 : le dernier) : tranches posées une à une, herbes, fleur de sel, éclats de noisette, fruits rouges.
  Les grains marchent aussi dans un élément `trace` (gouttes de sauce après le filet).
- **Assiette** : `.assiette__plat`, en CSS (aile, creux ombré, filet). Couleur : `--assiette-porcelaine` (blanc teinté de 6 % d'accent) ; une assiette en ardoise ou en grès se fait en changeant cette variable, ou en remplaçant `.assiette__plat` par une image de l'assiette vide au même cadrage.
- `init()` renvoie `{ etat, detruire() }` ; la section reçoit `est-actif` (animation en cours), `est-epingle` et `est-dresse` (plat complet).

## Inspirations

- Mécanique du module de l'objet qui se monte pièce par pièce (dossier `objet-3d-qui-se-construit`) : progression d'une section épinglée, pièces qui arrivent entre `data-de` et `data-a`, étapes qui s'allument, pas d'épinglage sur téléphone. Ici en 2D, vue de dessus.
- La carte des Jardins de l'Hacienda (`jardins-hacienda-maquette/la-carte-la-carte`) pour le ton de la recette racontée.

## Pièges

- Les identifiants des `<mask>` sont uniques dans la page : deux assiettes sur une même page ont chacune les leurs (`m-puree-1`, `m-puree-2`).
- Les dégradés partagés sont dans un `<svg>` de taille nulle **sans `display: none`** (un dégradé dans un SVG masqué ne se dessine plus dans certains navigateurs).
- Pas de `filter` CSS (`drop-shadow`, `blur`) sur les éléments SVG intérieurs (tous les navigateurs ne l'appliquent pas aux enfants d'un SVG) : l'ombre est un `drop-shadow` sur la couche `.assiette__element`, qui est en HTML.
- `--m` vaut 1 par défaut : sans JavaScript, en mode calme et « réduire les animations », l'assiette est dressée et toutes les étapes sont lisibles. Le module ne charge même pas GSAP en mode calme.
- Ordinateur (900 × 600 et plus) : la section s'épingle, texte et recette à gauche, assiette à droite. Sous 820 px de haut, l'intro se masque et seule l'étape en cours garde sa phrase. Téléphone et écran bas : pas d'épinglage ; l'assiette passe avant la recette et se dresse pendant qu'elle traverse l'écran (de son haut à 85 % de l'écran jusqu'à son bas à 40 %).
- Garder les étapes courtes : cinq étapes de deux lignes tiennent à 1024 × 640 épinglé ; au-delà de six, regrouper.
- `fin` (0,96) : le plat est complet un peu avant la fin de l'épinglage, pour qu'on le voie dressé avant que la page reprenne.

## Variantes

- Pizzeria : la pâte (trace en spirale), la sauce (trace), la mozzarella et les garnitures en pluie, le basilic à la fin.
- Pâtisserie, vue de dessus : fond de tarte, crème (trace en spirale à la poche), fruits en pluie, nappage, sucre glace (pluie de points).
- Bar : verre vu de dessus, glaçons (pluie), le liquide (trace en cercle), le zeste.
- Planche du traiteur : la planche en fond à la place de l'assiette (`.assiette__plat` remplacé), puis fromages, charcuterie, fruits, en pluie.
- Avec de vraies photos : faire photographier chaque élément seul à sa place sur l'assiette (même pied, même cadrage), détourer, et poser chaque image dans sa couche (`<img>` en 1:1).
