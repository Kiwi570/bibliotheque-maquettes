# Trame photo

Origine (fusion) :
- `francis-gerardin-maquette/hero` (`assets/js/webgl.js`, `initHalftonePhoto`) : trame offset à 15° dont les points grossissent puis se fondent dans la photo, loupe sous le curseur, point de cadrage (`data-focus`), WebGL créé après le chargement de l'image et img gardée visible en cas d'échec.
- `coupdefood-maquette/une` (`assets/js/halftone.js`) : **un seul contexte WebGL partagé** par toutes les photos, recopié dans un canvas 2D par photo, rendu seulement quand une valeur change ; cellule qui rétrécit pendant la révélation ; encre teintée par la couleur de la photo ; cadrage lu sur `object-position`.
- `marco-investigation-maquette/une` (`assets/js/halftone.js`) : compte-fils (la trame revient sous la souris, cerclée d'un filet d'encre) et **repli CSS en points** par `mask-image` animé (`@property`), révélation d'un coup en mode calme.
- `pixncroq-maquette` : aucune section en trame (`chercher.mjs trame` ne la trouve pas) ; son effet WebGL (`gl.js`) est un développement argentique (bain de révélateur, sépia), autre mécanique, non reprise.

Retenu : le moteur partagé de Coup de Food (plusieurs photos sans multiplier les contextes WebGL), la croissance de cellule et le compte-fils de Marco, l'angle offset de Francis, le repli CSS de Marco étendu aux lignes. Ajouts : trame en lignes (gravure), encre et papier quelconques (la taille des points suit le contraste réel encre/papier, donc encre claire sur papier sombre aussi), déclencheurs survol et défilement.

## Usage

```html
<figure class="trame" data-module="trame-photo">
  <div class="trame__cadre"><img class="trame__img" src="…" width="1500" height="1000" alt="…"></div>
  <figcaption class="trame__legende">Légende facultative</figcaption>
</figure>
<script type="module">
  import { init } from './modules/trame-photo/module.js';
  for (const el of document.querySelectorAll('[data-module="trame-photo"]')) init(el, { forme: 'points', angle: 15 });
</script>
```

`init` renvoie `{ reveler(), tramer(), regler(v), detruire() }` : avec `declencheur: 'manuel'`, appeler `reveler()` depuis une ouverture orchestrée (comme le héros de Francis Gérardin ou la une de Marco).
Format du cadre : `--trame-ratio` (3 / 2 par défaut) ; cadrage : `object-position` de l'img.

## Réglages

- `forme` ('points' | 'lignes'), `cellule` (8 px CSS), `angle` (15°), `depart` (2,4 : la trame part plus grosse puis s'affine ; 1 par défaut en survol).
- `encre`, `papier` : couleurs CSS, par défaut `--trame-encre` / `--trame-papier` posées sur la figure ou un ancêtre, sinon `--couleur-texte` / `--couleur-fond`. `teinte` (0 à 1) mêle les couleurs de la photo à l'encre.
- `declencheur` : `apparition` (une fois, à `debut` 'top 85%'), `survol` (survol ou focus de `zone`, ex. `'.carte'` pour une carte entière ; sur écran tactile, se comporte comme apparition), `defilement` (de `debut` à `fin` 'center 45%', réversible), `manuel`.
- `duree` (1,8 s), `delai` (0 s), `loupe` (90 px, 0 pour couper ; souris seulement, jamais en survol).

## Pièges

- L'image doit être de même origine ou servie avec CORS (texture WebGL) ; sinon le navigateur refuse la texture : prévoir `crossorigin="anonymous"` sur un CDN.
- `socle.webgl()` est testé avant toute création de contexte : aucune erreur console sans WebGL. Le contexte unique fait 1600 × 1600 ; les photos plus grandes sont rendues à 1600 px au plus et agrandies (densité de pixels plafonnée à 1,5).
- Rendu à la demande (`requestAnimationFrame` seulement quand une valeur bouge), arrêté hors écran (IntersectionObserver) ; pas de boucle continue.
- La trame CSS (`trame--attente`) est posée avant le chargement du socle pour éviter un éclair de photo nette ; l'img reste dans le flux (canvas par-dessus, img à opacité 0), donc son `alt` reste lu.
- Mode calme, réduire les animations, sans JavaScript : photo nette, aucune trame. Sans WebGL : masque CSS de points (non tourné) ou de lignes (tourné de `angle`), qui s'ouvre par transition de `--trame-k`, puis est retiré.
- Le survol garde la photo nette tant que le focus clavier reste dans `zone`.

## Variantes

- Laissé de côté (identité) : ratures au stylo rouge et « champ de trame » trichrome animé de Francis Gérardin, manchette, tampon et fil de dépêches de Coup de Food, calage de presse et repères de coupe de Marco, couleurs papier/encre de chaque maquette.
- Sortie au défilement de Francis (la photo redevient trame en quittant l'écran) : `declencheur: 'manuel'`, `reveler()` à l'ouverture, puis un ScrollTrigger de la page (`start: 'top top', end: 'bottom top'`) qui appelle `api.regler(1 - progress * .75)`.
- Pour un héros plein écran : `--trame-ratio: auto` et une hauteur fixée sur `.trame__cadre`.
