# Constellation

Origine : fusion de `gdreseau-maquette/constellation` (« Constellation des métiers »), `icc-maquette/hero` (« Ouverture en constellation ») et `libre-solidaire-maquette/reseau` (« Réseau mycélien du catalogue »).

- gdreseau : les nœuds principaux sont des métiers posés en anneau autour d'un point « projet », reliés entre eux et au centre ; points du ciel reliés par distance (au plus quelques liens par point) ; tirage à graine fixe ; moins de points sur téléphone et image fixe en mode calme.
- icc : la formation (des points dispersés qui volent vers leur place) et le pointeur qui écarte les points.
- libre-solidaire : canvas 2D plutôt que WebGL, filaments qui poussent depuis le nœud, nœud survolé qui allume ses liens, boucle arrêtée hors écran, et surtout la leçon d'accessibilité : un canvas n'est pas lisible au clavier, il faut une liste HTML.
- Laissé de côté (identité ou mise en scène propre au site) : le rendu WebGL et les changements de disposition par section de gdreseau (logo, équipe, « rives », convergence), l'arbre du logo et les anneaux d'icc, les couvertures de livres, la légende des territoires et leurs couleurs de libre-solidaire, toutes les polices et couleurs d'origine.

## Usage

```html
<section class="cst" data-module="constellation" aria-labelledby="cst-titre">
  <div class="cst__tete socle-cadre">…surtitre, h2.cst__titre, p.cst__intro…</div>
  <div class="cst__scene socle-cadre">
    <canvas class="cst__ciel" aria-hidden="true"></canvas>
    <ul class="cst__noeuds">
      <li class="cst__noeud" data-id="projet" data-x="50" data-y="50" data-centre data-liens="conseil conception">
        <button class="cst__pastille" type="button"><span class="cst__point" aria-hidden="true"></span>Votre projet</button>
        <p class="cst__bulle">Court texte affiché au survol, au focus ou au toucher.</p>
      </li>
      <li class="cst__noeud" data-id="conseil" data-x="20" data-y="22" data-liens="conception">
        <a class="cst__pastille" href="/conseil"><span class="cst__point" aria-hidden="true"></span>Conseil</a>
        <p class="cst__bulle">…</p>
      </li>
    </ul>
  </div>
</section>
<script type="module">
  import { init } from './modules/constellation/module.js';
  init(document.querySelector('.cst'), { points: 110 });
</script>
```

- `data-x` / `data-y` : position du point en % de la scène (garder 12 à 88 pour que pastilles et bulles restent dedans).
- `data-liens` : identifiants (`data-id`) des nœuds reliés ; `data-centre` : nœud central, plus grand, qui attire plus de points secondaires.
- Bouton : bouton de divulgation (`aria-expanded`), un clic épingle la bulle, Échap ou un clic ailleurs la ferme. Lien : la bulle est reliée par `aria-describedby`, s'affiche au survol et au focus, le clic suit le lien.
- La liste est l'équivalent texte du canvas : sans JavaScript elle s'affiche telle quelle (bulles visibles) ; en dessous de `largeurListe` elle devient une colonne reliée par un fil vertical, les bulles des boutons se déplient au toucher.

## Réglages

- `points` (110) / `pointsTelephone` (36) : points secondaires. Au-delà de 160 sur ordinateur, les liens par distance deviennent un fouillis.
- `largeurListe` (700) : mesurée sur la section, pas sur la fenêtre.
- `duree` (2400 ms) : formation lancée quand 25 % de la scène est visible ; un focus clavier la termine d'office.
- `distance` (95), `rayonPointeur` (140, 0 pour couper), `respiration` (5 px).
- `dprMax` (2) : plafond de densité de pixels ; `graine` (7) : change la disposition des points secondaires.

## Pièges

- Les couleurs viennent de `--couleur-accent`, `--couleur-texte` et `--couleur-secondaire`, converties en rgb par un canvas de 1 px : toute syntaxe CSS de couleur fonctionne.
- Les positions des nœuds sont mesurées sur le point HTML (`.cst__point`) au redimensionnement (ResizeObserver) et à l'arrivée des polices : le canvas s'aligne toujours sur la couche HTML, jamais l'inverse.
- Boucle par `socle.boucle` : arrêtée hors écran et onglet caché. Mode calme et réduire les animations : une seule image, formation terminée, ni respiration ni pointeur ; les bulles restent utilisables.
- Pendant la formation, les pastilles n'apparaissent qu'en opacité (pas d'échelle) : une pastille réduite passerait sous 44 px.
- Les bulles des liens sont masquées par découpage (pas `display: none`) pour rester lues par les lecteurs d'écran.
- Le socle charge GSAP par `pret()`, mais le module ne s'en sert pas.

## Variantes

- Constellation de partenaires : des liens sortants à la place des boutons, sans `data-centre`.
- Ouverture : agrandir `.cst__scene` à la hauteur de l'écran et placer le titre au centre comme nœud `data-centre`.
- Changement de disposition au défilement (gdreseau) : recalculer `data-x` / `data-y` puis appeler à nouveau la mesure ; non fourni ici.
