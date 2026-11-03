# Mur de portraits

Origine : `stanislas-urbi-orbi-maquette/portraits-mur` (« Mur des 1 455 portraits », noté 5) : la densité, l'arrivée des portraits, le tri, la fiche agrandie avec précédente et suivante, le pilotage au clavier. Apports secondaires : `libre-solidaire-maquette/auteurs` (nom révélé au survol) et `instinct-aventure-maquette/lightbox` (fiche agrandie par-dessus la page).

## Usage

```html
<section class="mdp socle-cadre" data-module="mur-de-portraits" aria-labelledby="mdp-titre">
  <div class="mdp__tete"><h2 class="mdp__titre" id="mdp-titre">…</h2></div>
  <div class="mdp__outils">
    <form class="mdp__recherche" role="search"><label class="socle-sr" for="mdp-cherche">Rechercher</label><input id="mdp-cherche" type="search"></form>
    <div class="mdp__filtres" role="group" aria-label="Groupes"></div>
    <p class="mdp__compte" data-compte aria-live="polite"></p>
  </div>
  <ul class="mdp__grille" aria-label="Portraits"></ul>
  <div class="mdp__vide" hidden><p>Aucun portrait ne correspond.</p><button type="button" class="socle-bouton" data-tout>Tout afficher</button></div>
</section>
<script type="module">
  import { init } from './modules/mur-de-portraits/module.js';
  init(document.querySelector('.mdp'), { portraits: [{ nom: 'Prénom Nom', role: 'Rôle', groupe: 'Atelier', texte: '…', vignette: 'p/01-320.webp', image: 'p/01-900.webp' }] });
</script>
```

Le module construit les vignettes (boutons nommés « nom, rôle »), les boutons de groupe et la fiche (`<dialog>` natif). Recherche, groupes et compteur sont facultatifs : sans `.mdp__outils`, c'est un simple mur.

## Réglages

- Densité : variables CSS `--mdp-min` (74 px, 58 px sous 700 px, 52 px sous 360 px) et `--mdp-gap` ; ne pas descendre sous 46 px (cibles de 44 px).
- `loupe` (1.6) et `rayon` (2.4) : grossissement en « dock » des vignettes proches de la souris, calculé sur des positions mesurées au redimensionnement (aucune lecture de mise en page pendant le mouvement). Au toucher et en mode calme : pas de loupe, un toucher ouvre la fiche.
- `cascade` (22 ms) : chaque lot de vignettes qui entre dans l'écran s'allume en vague (IntersectionObserver, une seule fois).
- Recherche sans accents ni casse, sur nom, rôle, groupe et texte ; plusieurs mots = tous requis.

## Pièges

- Aucune image dans le LCP : les vignettes générées sont du CSS pur ; une photo fournie ne reçoit son `src` qu'à 600 px de l'écran (`fetchpriority="low"`). Prévoir des vignettes légères (320 px, WebP ~10 Ko) et une grande image séparée pour la fiche ; au-delà de 500 portraits, une planche (atlas) comme sur la maquette d'origine devient préférable.
- Un seul arrêt de tabulation dans le mur (tabindex mobile), flèches, Début et Fin pour parcourir ; la fiche se ferme par Échap, le bouton ou un clic sur le fond, et rend le focus à la vignette de la dernière fiche vue (flèches gauche et droite dans la fiche).
- Au filtrage, si le haut du mur est passé, la page y remonte : sinon un résultat court laisse l'écran vide.
- Vignettes générées : couleurs tirées de `--couleur-accent` et `--couleur-secondaire` mélangées au fond, forme choisie par empreinte du nom (stable d'un chargement à l'autre).
- Sans JavaScript, le mur est vide : pour un site réel, rendre la liste côté serveur (liens vers des pages de fiche) si le référencement des noms compte.

## Variantes

- Sur la maquette d'origine, le mur est un canvas 2D zoomable et déplaçable (glisser, pincer, plein écran sur tactile), les 1 455 photos d'un atlas WebP, le tri par couleur de vêtement lue dans l'atlas, la fiche « C'est moi » par courriel et les compteurs animés : identité et volume propres à ce projet, laissés de côté au profit d'une grille DOM accessible (boutons réels, lecteur d'écran, clavier). Le canvas reste la voie pour plus de 1 000 portraits.
- Tri (alphabétique, par date) : ajouter un `<select>` et réordonner `visibles` avant le Flip, comme dans `catalogue-filtres-flip`.
