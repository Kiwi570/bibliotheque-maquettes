# Dissolution en particules

Origine (fusion) :
- `observatoire-des-cse-maquette/garanties` (« Anonymiseur », `assets/js/anon.js`) : section nuit épinglée, la fiche d'un profil fictif est redessinée dans un canvas, découpée en petits carrés qui s'envolent en arc et deviennent des points parmi des milliers ; pas d'épinglage sur téléphone ; rééchantillonnage au `refresh`.
- `laure-polin-maquette/hero` (« Œuvres recomposées en poussière », `assets/js/poussiere.js`) : chaque œuvre se rassemble depuis un nuage de particules échantillonnées dans la photo, puis la vraie photo s'affiche intacte ; les particules ne servent qu'à la transition.

Retenu : le redessin d'un élément HTML et le champ de milliers de points (Observatoire), l'échantillonnage d'une image recadrée et le principe « la vraie image reprend la main » (Laure Polin). Ajouts : les deux sens dans une même progression (défait → rangé → recomposé, en image ou en la même fiche), rangement en nuage ou en grille, carrés ou points, mode apparition avec bouton « recomposer », plafond de particules et frein automatique si une image dépasse 16 ms trois fois de suite.
Canvas 2D seulement : l'origine Laure Polin passait par un moteur de points sur carte graphique, mais 3 200 cellules au plus se dessinent sans peine en 2D, sans repli à prévoir.

## Usage

```html
<section class="ddp" data-module="dissolution-en-particules" data-epingle>
  <div class="ddp__cadre socle-cadre">
    <div class="ddp__tete" data-tient>…surtitre, h2.ddp__titre, p.ddp__intro…</div>
    <div class="ddp__scene" data-tient>
      <div class="ddp__plan">                                   <!-- cadre 4:3 -->
        <figure class="ddp__cible"><img src="…" alt="…"></figure>   <!-- image recomposée -->
        <article class="ddp__source">…fiche HTML…</article>         <!-- facultatif : élément qui se défait -->
      </div>
    </div>
    <ol class="ddp__etapes" data-tient><li class="ddp__etape"><h3>…</h3><p>…</p></li>…</ol>  <!-- facultatif, 3 phases -->
  </div>
</section>
<script type="module">
  import { init } from './modules/dissolution-en-particules/module.js';
  init(document.querySelector('.ddp'), { mode: 'defilement', disposition: 'nuage' });
</script>
```

Variante à l'apparition (sans épinglage, sans `data-epingle`) : classe `ddp--simple`, pas de `.ddp__source` (l'image se défait et se recompose elle-même), un `<button class="socle-bouton" data-ddp-rejouer hidden>` dans l'en-tête, `init(el, { mode: 'apparition', disposition: 'grille', forme: 'point' })`.
`init` renvoie `{ progression(v), detruire() }` : `progression` permet de piloter l'effet depuis une autre animation.

## Réglages

- `mode` : `defilement` (épinglé si `epingle` est vrai, sinon progression pendant que la scène traverse l'écran) ou `apparition` (joué une fois quand la scène est visible au tiers).
- `disposition` : `nuage` (points répartis sur toute la section, légère dérive) ou `grille` (trame régulière, immobile).
- `forme` : `carre` ou `point` ; à l'état intact les cellules sont toujours pleines.
- `image` / `alt` : image recomposée fournie par URL (même origine, sinon le canvas ne peut pas la lire : on se rabat sur la fiche).
- `nombre` (3200), `nombreTelephone` (1100), `champ` (1800, 40 % sous 700 px) : plafonds. La taille des cellules découle du plafond et de la taille de l'élément.
- `longueur` (1,6 écran), `duree` (2,6 s), `dpr` (1,5 ; 1 sur téléphone).

## Pièges

- Progression : intact jusqu'à 0,08, défait de 0,08 à 0,46, rangé, recomposé de 0,54 à 0,92, intact ensuite. Hors de ces fenêtres ce sont les vrais éléments qui s'affichent (classes `est-defait`, `est-forme`), jamais le canvas.
- Rééchantillonnage à chaque `refresh` de ScrollTrigger (et au redimensionnement en mode apparition) : sinon les carrés partent d'anciennes positions. Les positions sont prises par rapport à la section, donc justes pendant l'épinglage.
- La fiche est redessinée mot par mot (positions lues par `Range`), avec ses fonds, bordures et images : rendu fidèle aux polices chargées, d'où l'attente de `document.fonts.ready`. Un contenu très riche (dégradés, ombres, SVG) n'est pas reproduit : garder une fiche simple.
- Épinglage : la section vaut exactement la hauteur d'écran (`--entete-h` et `--barres-h` compris) ; la scène est un conteneur de taille, le cadre 4:3 vaut `min(100cqw, 100cqh × 4/3)`. Sous 720 px de haut, les paragraphes des étapes disparaissent ; sous 600 px, l'intro aussi. Testé en 1000×560, 1024×640, 768×1024, 820×1180 et 1180×820.
- Couleurs du champ lues sur `--couleur-texte`, `--couleur-accent` et `--couleur-secondaire` : sur fond clair, le champ reste visible mais plus discret ; prévoir un fond sombre pour l'effet complet.
- La boucle s'arrête hors écran et onglet caché (`socle.boucle`) ; si une image dépasse 16 ms trois fois de suite, le champ cesse de scintiller et le canvas n'est redessiné qu'aux changements.
- Mode calme et sans JavaScript : composition fixe, la fiche posée en bas à gauche de l'image, toutes les étapes allumées, champ de points immobile ; le bouton « recomposer » reste caché.

## Variantes

- Observatoire : un fond photo très atténué derrière le canvas et quatre garanties qui apparaissent en décalé ; l'identité (palette corail, fiche « élue titulaire au CSE ») est laissée de côté.
- Laure Polin : mur d'ardoise en lumière rasante qui suit le curseur, diaporama à minuteur, cartel et fente lumineuse entre deux œuvres ; propres à l'identité ou couverts par d'autres modules, laissés de côté. Pour un diaporama, appeler `progression()` à chaque changement d'image plutôt que le mode apparition.
