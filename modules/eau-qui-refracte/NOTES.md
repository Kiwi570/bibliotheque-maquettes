# Eau qui réfracte

Origine (fusion) :
- `ateliersources-maquette/ouverture` (« Photo sous l'eau vive », 5) : courant en bruit déformant l'image, ronds au pointeur, goutte d'ouverture depuis le centre, eau qui se clarifie au défilement, texture prise sur l'`<img>` déjà chargée, point focal du recadrage.
- `esaie-55-1-maquette/ouverture` (« Venez aux eaux », 5) : vraie surface d'eau (champ de hauteur → normale → réfraction), reflet spéculaire, décalage chromatique, gouttes spontanées pour que l'eau vive sans souris, garde-fou de fluidité (baisse de densité puis arrêt).
- `willowcamp-maquette/hero` (« Ronds dans l'étang », 4) : repli sans WebGL pensé comme un état à part entière, `touch-action: pan-y` pour que le doigt fasse des ronds sans bloquer le défilement.

Shader retenu : celui d'Ésaïe (normale de surface, la plus crédible), mais avec des pentes analytiques au lieu de trois évaluations du champ de hauteur par pixel (une seule boucle de ronds au lieu de trois, 10 ronds), et la houle d'Ateliersources (domaine déformé par un bruit lent) à la place de sinus trop réguliers. Le Flowmap de Willowcamp (passe supplémentaire en FBO) n'est pas repris : `Flowmap` n'est pas dans l'OGL du socle et les ronds suffisent.

## Usage

```html
<section class="eau" data-module="eau-qui-refracte" aria-labelledby="eau-titre">
  <div class="eau__fond" aria-hidden="true"><img src="…" alt="" width="1920" height="1080"></div>  <!-- facultatif -->
  <canvas class="eau__canvas" aria-hidden="true"></canvas>
  <div class="eau__voile" aria-hidden="true"></div>
  <div class="eau__cadre socle-cadre">
    <p class="socle-surtitre">…</p>
    <h1 class="eau__titre" id="eau-titre">…</h1>
    <div class="eau__bas"><p class="eau__texte">…</p><div class="eau__actions">…boutons…</div></div>
    <div class="eau__indice" aria-hidden="true"><span class="eau__indice-souris">Passez la souris sur l'eau</span><span class="eau__indice-doigt">Touchez l'eau</span></div>
  </div>
</section>
<script type="module">import { init } from './modules/eau-qui-refracte/module.js'; init(document.querySelector('.eau'), { focus: [.5, .7] });</script>
```

Image : option `image` (URL), sinon l'`<img>` de `.eau__fond` (réutilisée telle quelle, aucun second téléchargement), sinon un fond de bassin neutre peint en canvas 2D d'après les variables (dégradé, lueurs, carrelage, cercles : la réfraction s'y lit bien). Sans JavaScript, le même fond est dessiné en CSS. Le titre est en HTML au-dessus, visible dès la première image ; le voile garde le texte lisible.

`init()` renvoie `{ detruire(), mesure() }` ; `mesure()` donne la médiane des intervalles entre images, la densité de pixels en cours et le nombre d'images rendues.

## Réglages

- `force` (1) : intensité de la réfraction ; `teinte` (--couleur-secondaire) et `teinteForce` (.18) : couleur de l'eau ; `reflet` (--couleur-texte) : reflets.
- `ouverture` (true) : goutte au centre, l'eau gagne l'image en 1,8 s (l'extérieur reste net, pas de flash sombre) ; `clarifie` (true) : l'agitation baisse de 80 % sur le défilement de la section ; `gouttes` (true) : une goutte toutes les 3 à 6 s.
- `focus` ([.5, .5]) : point focal du recadrage en « cover ».
- `dpr` (1,5) : plafond sur ordinateur ; 1 sous 700 px quelle que soit la densité de l'écran.
- `repli` ('svg') : sans WebGL, en mode calme et sous « réduire les animations », image légèrement déformée par un filtre SVG figé (`feTurbulence` + `feDisplacementMap`) ; 'net' : image seule.

## Pièges

- `socle.webgl()` est testé avant le Renderer, et le premier rendu est fait sous `try` (image d'une autre origine sans CORS) : aucune erreur console, repli figé. Une image d'une autre origine reçoit `crossOrigin = 'anonymous'`.
- Coût mesuré (Chromium, rendu logiciel SwiftShader, donc pessimiste) : médiane 16,7 ms entre images à 390×844 et 360×780, y compris en écran ×3 et CPU ralenti ×4 et ×6 (canvas plafonné à 390×771) ; 33 ms à 1440×900 en logiciel. Boucle via `socle.boucle` (arrêt hors écran et onglet caché).
- Garde-fou : après 1 s, médiane sur 40 images ; au-delà de 34 ms la densité baisse (×0,7 jusqu'à 0,75), puis l'animation s'arrête et laisse le repli figé.
- L'indice « Passez la souris / Touchez l'eau » est réservé (`visibility`) même sans WebGL : l'afficher plus tard en `display` décalait le titre (CLS).
- Le clic sur un lien ou un bouton ne fait pas de goutte.

## Variantes

- Laissé de côté (identité) : photos des trois maquettes, couleurs d'abysse et d'or codées dans les shaders, son de goutte d'Ateliersources, titre révélé ligne par ligne et parallaxe (modules de révélation de texte à combiner), grain de pellicule d'Ésaïe, branches de saule et notes manuscrites de Willowcamp, cercles d'encre CSS au toucher sans WebGL.
- Sur fond clair, passer `teinteForce` à .08 et `reflet` à une couleur sombre ; le voile se règle dans `.eau__voile`.
