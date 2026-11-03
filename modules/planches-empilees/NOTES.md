# Planches empilées

Origine : fusion de quatre sections notées 4 ou 5.

- `btp-confort-avenir-maquette/metiers` (5) : la planche elle-même : cartouche « Planche 01 / 05 · catégorie », titre, liste de prestations filetée, lien en bas de la colonne texte, photo en colonne. Sur l'origine, les planches défilent à l'horizontale dans une section épinglée (ScrollTrigger + containerAnimation) : remplacé par un empilement vertical.
- `iprof-maquette/cours-individuels-stackcards` (4) : `position: sticky` décalé de 16 px par fiche, hauteur bornée par l'écran (`100svh − top − marges`), recul à 94 % de la fiche recouverte.
- `esaie-55-1-maquette/histoires` (4) : top décalé de `--entete-h`, voile (`::after` + variable) qui assombrit la carte du dessous, repli sans empilement sous 900 px ou sous 760 px de haut.
- `francis-gerardin-maquette/band-2` (4) : test de débordement (une fiche qui déborde désépingle tout), légère rotation alternée (option `rotation`).
- Laissés de côté : `loeilsingulier-maquette/promise` (éventail 3D au survol), `h-renovation-maquette/avis` et `edwin-sonorisation-maquette/prestations-playlist` (piles feuilletées aux flèches : mécanique de carrousel, pas de défilement). Identité laissée de côté : dessins techniques SVG tracés, révélation WebGL des photos, bouton magnétique, pied de planche (échelle, indice), papier ligné et onglet de fiche bristol.

## Usage

```html
<section class="ple" data-module="planches-empilees" aria-labelledby="ple-titre">
  <div class="ple__tete socle-cadre">…surtitre, h2.ple__titre, p.ple__intro…</div>
  <div class="ple__pile socle-cadre">
    <article class="ple__planche" data-epingle data-tient aria-labelledby="ple-t01">
      <div class="ple__contenu">
        <p class="ple__cartouche"><span>Planche 01 / 04</span><span>Catégorie</span></p>
        <h3 class="ple__nom" id="ple-t01">…</h3>
        <p class="ple__texte">…</p>
        <ul class="ple__liste"><li>…</li></ul>
        <a class="ple__lien socle-bouton" href="…">Découvrir<span class="socle-sr"> tel service</span></a>
      </div>
      <div class="ple__visuel"><img src="…" alt="…" loading="lazy"></div>
    </article>
    …
  </div>
</section>
```

Les planches sont des enfants directs de `.ple__pile` (sinon `sticky` est borné par leur parent). L'empilement fonctionne sans JavaScript ; `module.js` ajoute le recul et le voile, le repli et le retour au clavier.

## Réglages

- `reduction` (0,05 par planche posée dessus, plafonnée à `profondeur` = 3), `voile` (0,45), `rotation` (0 ; 1 à 1,5 pour des fiches posées).
- CSS : `--ple-marge` (écart sous l'en-tête), `--ple-decalage` (bord visible de chaque planche recouverte), `--ple-hmax` (640 px en paysage, 900 px en portrait).
- Empilement si largeur ≥ 700 px, hauteur ≥ 520 px, animations permises et pas de mode calme ; sinon liste simple (téléphone : une colonne, visuel 16:10). Tablette en portrait : une colonne, le visuel prend la hauteur qui reste.

## Pièges

- Hauteur d'une planche : `min(--ple-hmax, écran − --entete-h − --barres-h − 2 marges − (n − 1) décalages)` : la dernière planche collée finit exactement au-dessus du bas de l'écran. `--ple-n` est fixé par le module (8 planches au plus pour `--ple-i` sans JavaScript).
- Repli `.ple--plat` : à chaque chargement de police, image ou redimensionnement, si le contenu d'une planche dépasse sa hauteur, toute la pile repasse en liste. Garder 3 à 6 lignes de liste et un texte court ; sous 760 px de haut, le contenu est resserré pour tenir dès 1000 × 560.
- Le recul utilise `scale` avec `transform-origin: 50% 0` : le haut de la planche ne bouge pas (le testeur de collants le mesure). Le lien reçoit une contre-échelle pour garder ses 44 px sans toucher à la mise en page (pas de CLS).
- `est-epingle` est posée sur chaque planche collée (et non sur la section) : une planche qui arrive par le bas n'est pas encore « épinglée » et peut être coupée.
- Clavier : le focus sur une planche recouverte ramène le défilement à l'endroit où elle vient de se coller, au-dessus de la pile.
- Mode calme et « réduire les animations » : liste simple, aucune planche ne recouvre une autre.

## Variantes

- Section épinglée avec index des planches à gauche (francis-gerardin) : à composer avec `rail-de-sections` ou une liste à côté de la pile.
- `galerie-horizontale-epinglee` reprend la présentation d'origine de btp-confort-avenir (planches côte à côte, défilement horizontal).
- Pour des témoignages (esaie-55-1), remplacer la liste par un `dl` objectif / résultat et le lien par un appel.
