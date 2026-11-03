# Fond qui se consume

Origine (fusion) :
- `gwenanou-print-maquette/matieres` (« Six matières qui se consument », noté 5) : la mécanique principale. Scène épinglée, brûlure WebGL dont le front suit un bruit fractal (ondulation de chaleur, bord carbonisé, braise, étincelles), textes empilés dans la même cellule, rendu à la demande, repli par fondu d'images. Repris et porté sur OGL via `pret(['ogl'])`, avec un mode « dissolution » en plus.
- `nelis-maquette/applications` (« Galerie qui refroidit ») : le passage de température de teinte. L'image qui arrive est teintée chaud puis refroidit : dans le shader derrière le front, en CSS (`--fqc-chaud`, calque `mix-blend-mode: color`) pour le fondu sans WebGL et pour les cartes sur téléphone, où elle refroidit en montant vers le milieu de l'écran.
- `icc-maquette/architecture` (« Architecture en six niveaux ») : le compteur `01 / 05` en grand chiffre et le rail vertical à droite (numéro, puis un trait qui s'allonge sur l'écran courant).

Laissé de côté (identité ou trop spécifique) : les textures et photos du client, la photo détourée au laser avec son cadre tracé en canvas et son étincelle, le sélecteur horizontal à curseur glissant et vignettes de matière, les prix, l'alternance voile clair et voile sombre selon la matière, l'aimant Lenis qui termine une brûlure entamée, les anneaux WebGL du ciel d'ICC.

## Usage

```html
<section class="fqc" data-module="fond-qui-se-consume" data-epingle aria-labelledby="fqc-titre">
  <div class="fqc__scene">
    <canvas class="fqc__canvas" aria-hidden="true"></canvas>
    <div class="fqc__voile" aria-hidden="true"></div>
    <div class="fqc__contenu socle-cadre">
      <div class="fqc__tete" data-tient="tête"><p class="socle-surtitre">…</p><h2 class="fqc__titre" id="fqc-titre">…</h2></div>
      <p class="fqc__compteur" aria-hidden="true"><b data-fqc-n>01</b><span> / <span data-fqc-total>05</span></span></p>
      <ol class="fqc__ecrans" data-tient="écran">
        <li class="fqc__ecran">                      <!-- style="--fqc-lisere: …" pour changer le liseré de cet écran -->
          <div class="fqc__fond" aria-hidden="true"><img data-src="photo-1.jpg" alt=""></div>
          <div class="fqc__texte"><h3>…</h3><p>…</p><p><a class="fqc__lien" href="…">…</a></p></div>
        </li>
        …
      </ol>
    </div>
  </div>
</section>
<script type="module">
  import { init } from './modules/fond-qui-se-consume/module.js';
  init(document.querySelector('.fqc'), { effet: 'brulure' });
</script>
```

Le module construit le rail de puces (boutons de 44 px, « Écran n sur N : titre » pour les lecteurs d'écran, `aria-current="step"`), met à jour le compteur et annonce l'écran courant (`aria-live="polite"`). Les textes des écrans inactifs sont `inert`.

## Réglages

- `images` : une URL par écran ; sinon l'`<img>` du `.fqc__fond` (préférer `data-src` : le module ne charge une image qu'au moment où elle devient l'image suivante) ; sinon une matière neutre est générée en canvas d'après les variables (fibres, strates, grain, ondes, trame).
- `effet` : `'brulure'` (le front traverse de gauche à droite, bord de cendre marqué) ou `'dissolution'` (le bruit seul, partout à la fois, cendre plus légère).
- Couleur du liseré : variable CSS `--fqc-lisere` (par défaut `--couleur-accent`), lue sur chaque écran : la transition vers un écran prend le liseré de cet écran. L'option `lisere` accepte toute couleur CSS. `--fqc-chaleur` règle la teinte chaude du repli CSS.
- `epaisseur` (.045), `refroidit` (true).
- `pas` (90 % d'écran par écran), `transition` (.45 de chaque intervalle ; le repos avant la transition est un peu plus long que celui d'après), `lissage` (.4).
- `largeurMin` (700) et `hauteurMin` (500) : en dessous, cartes non épinglées. 1000 × 560, 1024 × 640 et les tablettes 768 × 1024, 820 × 1180, 1180 × 820 s'épinglent ; en portrait (`max-aspect-ratio: 4/5`), le texte se pose en bas et le voile passe du bas vers le haut.
- `dpr` (1.5), plafonné à 3,5 millions de pixels.

## Pièges

- Les fonds sont `position: absolute` dans `.fqc__ecran` mais se posent sur la scène : en mode épinglé, ni `.fqc__contenu`, ni la liste, ni l'écran ne doivent être positionnés ou transformés (sinon chaque fond se cale sur son texte).
- Le fondu CSS est toujours tenu à jour sous le canvas : sans WebGL, tant qu'une texture arrive, ou après une perte de contexte, on voit les mêmes images en fondu, sans trou noir. Le canvas ne s'affiche que lorsque la paire en cours est prête.
- Rendu à la demande : rien n'est dessiné quand la progression ne change pas ; une image d'une autre origine sans CORS fait échouer le rendu, le module retombe alors sur le fondu CSS.
- Les textes partagent la même cellule de grille : la hauteur de la zone est celle du plus long ; garder des paragraphes de longueur voisine (sous 640 px de haut, les paragraphes sont coupés à trois lignes).
- Sans JavaScript, en mode calme, sous « réduire les animations » et sur téléphone : cartes, chacune sur son fond, tout est lisible.

## Variantes

- `effet: 'dissolution'` pour un ton plus doux (bien-être, mode), avec un liseré clair (`--fqc-lisere: var(--couleur-texte)`).
- Liseré par écran : un univers froid peut se consumer avec un liseré bleuté, l'écran suivant revenir à l'accent.
- Pour quatre écrans ou moins, baisser `pas` à 70 ; pour six, garder 90.
