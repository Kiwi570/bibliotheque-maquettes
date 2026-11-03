# Révélation à l'encre

Origine (fusion) :
- `oppenheimer-maquette/accueil` (« Ouverture à l'encre ») : la tache d'encre qui s'étale dans le papier, son liseré chargé d'encre, les fibres qui boivent au-delà du bord, la respiration lente et l'écart sous le curseur. Devenu le mode `etale`.
- `patchacha-maquette/lenteur` : le voile de trois feuilles de papier qui recouvre l'image puis se retire, en trois étapes épinglées, transitions chaînées dans une promesse. Devenu le mode `voile`.
- `les-plus-hautes-eaux-maquette/haut` : la nappe d'eau qui monte du bas et rend ses couleurs à une photo en bichromie, au défilement, avec repli CSS par masque. Devenu le mode `montee`.

## Usage

```html
<section class="rae rae--cote" data-module="revelation-a-l-encre" data-mode="etale" data-rae-attente>
  <div class="rae__cadre socle-cadre">
    <div class="rae__texte">…titre, texte, boutons…</div>
    <div class="rae__scene"><figure class="rae__image"><img class="rae__fond" src="photo.jpg" alt="…" width="1600" height="1600"></figure></div>
  </div>
</section>
<script type="module">
  import { init } from './modules/revelation-a-l-encre/module.js';
  const api = await init(document.querySelector('.rae'), { declencheur: 'arrivee' });
  // api.jouer(), api.retirer(), api.rejouer(), api.detruire()
</script>
```

Trois dispositions, indépendantes du mode : `rae--cote` (texte à côté de l'image), `rae--plein` (image en fond, texte en bas à gauche sur un dégradé de lisibilité), `rae--etapes` (texte d'étapes `.rae__etape` et une figure par étape ; ajouter `data-epingle`, `data-tient` sur `.rae__etapes` et `.rae__scene`). Voir `index.html` pour les trois.

`.rae__fond` est une `<img>` (ou un élément qui en contient une) ; sans image, un paysage neutre est peint d'après les variables de couleur. `data-focus=".6 .4"` sur une figure règle son recadrage.

## Réglages

- `mode` : `etale`, `voile`, `montee` (ou `data-mode`). `declencheur` : `arrivee` (défaut d'`etale`), `apparition`, `defilement` (défaut de `voile` et `montee`). `retrait: true` : l'image se retire de la même façon en sortie d'écran et se rejoue au retour (en étapes épinglées : le voile se referme quand on remonte au-dessus de la section).
- `forme` (etale) : `tache` garde la silhouette de tache (bords mangés : sujet au centre) ; `plein` laisse la tache gagner tout le cadre, sans liseré à la fin.
- `depart` (montee) : niveau d'eau avant le défilement (0,1 dans la démonstration). Pour une ouverture, `debut: 'top top'`, `fin: 'bottom 20%'` comme sur la maquette d'origine.
- `encre`, `papier`, `bichromie` : par défaut dérivées de `--couleur-secondaire`, `--couleur-fond`, `--couleur-texte`.
- Étapes : épinglées à partir de `largeurMin` (900) × `hauteurMin` (600), `pas` (80 % d'écran par étape) ; puces numérotées de 44 px pour sauter d'une étape à l'autre.

## Pièges

- État par défaut du CSS = état final (image entière et nette, étapes en liste) : c'est ce que voient le mode calme, « réduire les animations » et un visiteur sans JavaScript. En `etale` + `tache`, le mode calme garde la silhouette par un masque SVG figé.
- Image au-dessus de la ligne de flottaison : mettre `data-rae-attente` sur la section, sinon l'image s'affiche puis disparaît avant l'encre ; un secours CSS la montre au bout de 2,5 s si le script ne vient pas.
- Sans WebGL (ou si le premier rendu échoue) : tache SVG `feTurbulence` qui grandit (`etale`), voile de papier en fondu (`voile`), masque en dégradé sur une copie en bichromie CSS (`montee`). Aucune erreur console.
- L'`<img>` reste dans le DOM en opacité 0 sous le canevas : son texte alternatif reste lu.
- Les transitions du voile sont chaînées (jamais deux à la fois) ; l'image change quand le papier couvre tout (progression 0,12).
- Garde-fou : si la médiane des images dépasse 34 ms, la densité baisse, puis la respiration s'arrête. Boucle arrêtée hors écran et onglet caché.
- Une seule image par contexte WebGL : en étapes, toutes les images sont des textures d'un même canevas.

## Variantes

- Laissé de côté (identité) : la goutte qui tombe avant la tache, le polaroïd et le cachet de cire (oppenheimer) ; le mot « ralentir » écrit lettre à lettre et le ralentissement de Lenis pendant la section (patchacha) ; les caustiques texturées, les ronds au clic et le son (les-plus-hautes-eaux). Le papier photographié de patchacha est remplacé par un papier calculé.
- Téléphone et petites hauteurs : les étapes deviennent une liste texte + image sans voile (comme sur la maquette d'origine).
- Révélation d'une galerie : un `init` par image avec `declencheur: 'apparition'` et `retrait: true` (un contexte WebGL par image : en rester à quelques-unes par page).
