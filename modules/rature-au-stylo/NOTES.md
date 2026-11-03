# Rature au stylo

Origine : fusion de `iprof-maquette/jargon` (liste de termes techniques barrés au stylo rouge puis traduits à la main dessous, au rythme de la molette) et `francis-gerardin-maquette/hero` (trois mots du titre rayés un à un au DrawSVG, puis un mot écrit et souligné à la main). Les « ratures » cherchées dans `nelis-maquette` n'existent pas : la recherche « ratur » n'y trouve que « température ».

- iprof apporte la liste « jargon → mot simple », la flèche coudée, le mode défilement sur ordinateur et le déclenchement unique sur téléphone. Sa rature était un fond (`background-size`) : remplacée par un vrai trait SVG.
- francis-gerardin apporte les traits irréguliers (aller-retour), l'enchaînement de plusieurs mots barrés, le mot écrit penché et le soulignement à main levée. Le DrawSVG (plugin payant) est remplacé par `stroke-dashoffset`.
- Laissé de côté (identité) : rouge, papier et polices manuscrites des deux maquettes, textes, photo en trame WebGL et titre en lignes masquées du héros francis-gerardin, colonne épinglée et photo d'iprof.

## Usage

```html
<section data-module="rature-au-stylo">
  <h2>Un projet <span class="rst rst--cote"><del aria-hidden="true">long</del> <del aria-hidden="true">flou</del> <ins>clair</ins></span>, du premier appel à la livraison.</h2>
  <h3>Des réponses <span class="rst rst--dessus"><del aria-hidden="true">techniques</del><ins>claires</ins></span>.</h3>
  <ol class="rst-liste" data-declencheur="defilement">
    <li class="rst" data-lecture="les-deux"><del>Mutualiser les ressources</del><span class="socle-sr">, autrement dit : </span><ins>Partager les outils</ins></li>
  </ol>
</section>
<script type="module">import { init } from './modules/rature-au-stylo/module.js'; init(document.querySelector('[data-module="rature-au-stylo"]'));</script>
```

Un groupe `.rst` contient un ou plusieurs `<del>` (barrés l'un après l'autre) puis un `<ins>`. Trois placements : `rst--cote` (à la suite), `rst--dessus` (au-dessus du mot barré, place réservée par un `padding-top`), et `li.rst` dans une `ol.rst-liste` (nouveau texte dessous, avec flèche). Le module peut aussi être initialisé directement sur un titre.

Lecture : par défaut seule la version finale est lue (`aria-hidden` sur les `<del>`, posé dans le HTML pour le cas sans JavaScript et reposé par le module). Pour une liste pédagogique, `data-lecture="les-deux"` et un séparateur `.socle-sr` lisent « terme, autrement dit : mot simple », sans doublon.

## Réglages

- Couleur du stylo : `--rst-couleur` (défaut `--couleur-accent`) ; police du mot écrit : `--rst-police` (défaut `--police-titres`, une manuscrite système dans la démonstration) ; inclinaison : `--rst-inclinaison` (-2deg).
- `declencheur` : `apparition` (une fois, `depart` 'top 85%', `delai` pour une ouverture) ou `defilement` (scrub entre `debut` et `fin`) ; `data-declencheur` sur un groupe ou un parent l'emporte. Sur téléphone (< 700 px) toujours `apparition`.
- `variante` (0 ondulé, 1 aller-retour, 2 diagonale, 3 gribouillis) ou `data-trait="n"` sur un `<del>` ; par défaut les formes alternent. Le tracé est tiré d'un aléa à graine : identique à chaque visite.
- `duree` (multiplicateur), `souligner` (titres seulement ; `data-souligne="non"` pour un groupe), `epaisseur` (0,075 × taille du texte barré).

## Pièges

- Les traits sont calculés en pixels sur les lignes réelles du texte (`Range.getClientRects`), dans un SVG posé sur le bloc : un mot barré qui passe sur deux lignes reçoit deux traits, tracés l'un après l'autre. Recalcul au redimensionnement (ResizeObserver) et à l'arrivée des polices. Pas de `viewBox` étiré : l'épaisseur reste régulière.
- Le mot écrit est un `inline-block` (pour pencher) : le navigateur peut couper juste après lui et envoyer « , » seul à la ligne. Le module colle la ponctuation qui suit le groupe dans un `span.rst__colle` insécable.
- `rst--dessus` : garder un mot de remplacement court (pas plus large que deux fois le mot barré), sinon il déborde de part et d'autre à 320 px.
- Sans JavaScript, en mode calme et sous « réduire les animations » : barré CSS (`text-decoration`) puis trait SVG complet, mot final écrit ; rien ne bouge. L'état de départ (`.est-arme`) n'est posé que si l'animation va jouer.
- Couleur du stylo : vérifier le contraste du mot écrit sur le fond (≥ 4,5:1), c'est du texte.

## Variantes

- Ouverture : dans un héros, `init(titre, { delai: .6 })` ou appeler le module à la fin de l'ouverture orchestrée (francis-gerardin calait les ratures sur la timeline du héros).
- Colonne de titre épinglée à côté de la liste (iprof) : à faire dans la page avec `[data-epingle]`, le module ne gère que les ratures.
