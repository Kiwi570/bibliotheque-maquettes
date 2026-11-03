# Vue éclatée

Origine : fusion de trois sections.
- `winsbike-maquette/eclatee` (« Vue éclatée du moyeu », noté 5) : la mécanique principale. Section épinglée, pièces qui s'écartent au défilement depuis le centre, légende numérotée en liste qui allume la pièce au survol et au clavier.
- `swiss-cloisons-solutions-maquette/metiers` (« Coupe axonométrique », noté 5) : le dessin en couches isométriques empilées, et la règle « tout révéler d'un coup en mode calme ».
- `winsbike-atelier/beast` : les traits de cote qui se dessinent. L'origine utilise DrawSVG (plugin) ; ici, `pathLength="1"` et `stroke-dashoffset`, sans plugin.

## Usage

```html
<section class="vec" data-module="vue-eclatee" data-epingle aria-labelledby="vec-titre">
  <div class="vec__cadre socle-cadre">
    <div class="vec__tete" data-tient>…surtitre, h2.vec__titre#vec-titre, p.vec__intro…</div>
    <div class="vec__scene">
      <div class="vec__plan" data-tient>
        <svg class="vec__svg" viewBox="0 0 640 560" data-etiquettes="404" aria-hidden="true" focusable="false">
          <!-- une pièce par groupe, peintes du bas vers le haut ; data-ancre = départ du trait (repère du viewBox) -->
          <g class="vec__piece" data-piece="5" data-ancre="380 301">…</g>
          …
          <g class="vec__piece" data-piece="1" data-ancre="380 237">…</g>
        </svg>
        <p class="vec__mention">Schéma illustratif</p>
      </div>
    </div>
    <div class="vec__pieces" data-tient>
      <p class="vec__liste-titre socle-surtitre" id="vec-liste">Les pièces, de haut en bas</p>
      <ol class="vec__liste" aria-labelledby="vec-liste">
        <li><button type="button" class="vec__legende" data-piece="1" aria-pressed="false"><span class="vec__num">01</span><span class="vec__nom">Nom de la pièce</span></button></li>
        …
      </ol>
    </div>
  </div>
</section>
```

Le module ajoute à chaque pièce son trait (qui se dessine) et son point d'ancrage, et pose au bout une étiquette HTML (numéro + nom, repris de la liste). Le schéma est `aria-hidden` : la liste de boutons est l'équivalent lisible. Survol ou focus d'un bouton (ou survol d'une pièce, d'une étiquette) met la pièce en valeur : les autres s'estompent, elle se soulève et prend l'accent ; un clic la garde en valeur (`aria-pressed`), Échap la relâche.

Classes utiles pour dessiner ses pièces : `vec__dessus`, `vec__flanc vec__flanc--g`, `vec__flanc vec__flanc--d`, `vec__detail` (`--tirets`), `vec__creux`. Les couleurs sont dérivées de `--couleur-secondaire`, `--couleur-texte` et `--couleur-fond`.

## Réglages

- `ecart` (68, unités du viewBox) : écart entre deux pièces voisines ; les pièces s'écartent symétriquement autour du milieu de la liste. `data-ecart` sur un groupe règle une pièce seule.
- `longueur` (3 écrans), `lissage` (0,6) : durée et lissage de l'épinglage.
- `recomposer` (true) : les étiquettes s'effacent et l'objet se recompose en fin d'épinglage ; `false` laisse l'objet éclaté.
- `leve` (10) : soulèvement de la pièce mise en valeur (0 pour couper).
- `largeurMin` (700) et `hauteurMin` (520) : en dessous, pas d'épinglage ; l'objet s'éclate pendant que le schéma traverse l'écran et reste éclaté.
- `data-etiquettes` sur le SVG : abscisse (viewBox) où finissent les traits et où commencent les étiquettes ; prévoir à droite environ un tiers de la largeur libre.

## Pièges

- Le plan garde le rapport du viewBox (640 × 560) : changer le viewBox impose de changer `--vec-ratio` et le facteur `640 / 560` de la règle épinglée ensemble.
- Épinglée, la scène est un conteneur de taille (`container-type: size`) : le plan prend `min(100cqw, 100cqh × rapport)`, il n'est jamais coupé, de 1000×560 à 2560×1440, tablettes comprises (mise en page en colonne sous 1:1).
- Sous 600 px de haut, l'intro est masquée pendant l'épinglage pour que la liste tienne.
- Plan de moins de 400 px de large : les étiquettes ne montrent que le numéro (le nom est dans la liste juste dessous).
- Pas d'attribut `transform` sur un `.vec__piece` (le module l'écrase) : mettre les transformations dans un groupe enfant.
- Garder les `data-piece` de la liste et des groupes alignés (piège déjà noté sur l'origine).
- `anticipatePin` de l'origine retiré ; couleurs lues uniquement dans les variables (l'origine Swiss Cloisons les écrivait en dur dans le JS).
- Mode calme : objet éclaté, traits et étiquettes visibles, liste allumée ; la mise en valeur fonctionne sans animation.

## Variantes

- Laissé de côté (identité) : papier millimétré, cartouche de planche et cotes « entraxe » de Winsbike, billes et cannelures du moyeu ; puces qui changent le type de cloison, plafond lumineux et trame de Swiss Cloisons (c'est un configurateur, autre module) ; photo du cadre, pièces qui volent depuis les bords, prix et panier du kit de winsbike-atelier.
- Le mouvement est vertical (empilement). Un éclatement le long d'un axe horizontal, comme le moyeu d'origine, demande d'étendre `rendre()` avec un écart en x (et des ancres en haut des pièces).
