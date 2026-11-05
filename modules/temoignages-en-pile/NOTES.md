# Témoignages en pile

Origine : `h-renovation-maquette/avis` (avis sur des ardoises empilées, flèches, compteur, fiches cachées inertes, rangement instantané en mode calme), `myrtille-et-compagnie-maquette/formation-temoignages` (témoignages à faire glisser au doigt, qui réagissent à la vitesse), `loeilsingulier-maquette/liner` (focus sur la seule face visible) et `esaie-55-1-maquette/histoires` (grandes fiches qui s'empilent). Module de base : des témoignages sur 20 maquettes, réécrits à chaque fois jusqu'ici. Grille wouahou, point 1 : l'effet se manipule (attraper, lancer, élan), au doigt comme à la souris.

## Usage

```html
<section class="tep socle-cadre" data-module="temoignages-en-pile" aria-labelledby="tep-titre">
  <div class="tep__tete"><h2 class="tep__h2" id="tep-titre">Ce qu'en disent nos clients</h2></div>
  <div class="tep__scene">
    <ol class="tep__pile">
      <li class="tep__carte">
        <blockquote class="tep__citation"><p>…</p></blockquote>
        <p class="tep__note" data-note="5">5 sur 5</p>                                   <!-- facultatif -->
        <p class="tep__auteur"><span class="tep__nom">Claire M.</span><span class="tep__contexte">Stage, mars 2026</span></p>
        <p class="tep__source">Avis Google · 2026</p>                                     <!-- facultatif -->
      </li>
    </ol>
    <div class="tep__commandes">                                                          <!-- créé s'il manque -->
      <button type="button" class="tep__prec"></button><p class="tep__compte" aria-live="polite">1 / 5</p><button type="button" class="tep__suiv"></button>
    </div>
  </div>
</section>
<script type="module">import { init } from './modules/temoignages-en-pile/module.js'; init(document.querySelector('.tep'));</script>
```

- **Uniquement de vrais avis**, repris mot pour mot du site actuel ou d'une plateforme, avec leur source et leur date. Jamais d'avis inventé ni reformulé pour sonner mieux. Sans avis réels, ne pas utiliser ce module.
- Sans JavaScript, c'est une simple liste de témoignages. `init()` renvoie `{ suivant, precedent, detruire }`.
- Le projet pose `data-grille="manipuler"` sur la section s'il en fait son objet à manipuler (audit de la skill).

## Réglages

`visibles` (3), `seuil` (0,28), `textes`, `data-note` : voir `module.json`.

## Pièges

- Toutes les fiches occupent la même case de grille : la pile prend la hauteur de la plus grande fiche, sans hauteur en dur ni mesure. Avant le module (JavaScript actif), le CSS les empile déjà (`@media (scripting: enabled)`) : rien ne saute au chargement.
- Seule la fiche du dessus est atteignable : les autres sont `inert` et `aria-hidden` ; le compteur est annoncé (`aria-live`).
- Glisser : `touch-action: pan-y` (au doigt, le glissement vertical fait défiler la page, l'horizontal prend la fiche), capture du pointeur, rien ne part sous 6 px. L'élan se lit sur le dernier mouvement ; un pointeur arrêté plus de 90 ms avant de lâcher n'a plus d'élan, sinon un petit geste suivi d'une pause lançait la fiche.
- Après le vol, la fiche suivante est déjà dessus : la pile accepte tout de suite le clic suivant (sinon un double clic rapide était perdu pendant que la fiche revenait sous la pile).
- La fiche qui vole sort du cadre : la page coupe le débordement horizontal (`overflow-x: clip` sur `body`, comme les deux socles).
- Mode calme : pas de glisser ni de vol, les flèches changent de fiche d'un coup.

## Variantes

- Fiches suspendues à un fil qui se balancent avec la vitesse du défilement (`myrtille-et-compagnie-maquette/formation-temoignages`) : remplacer la pile par une piste horizontale et lire la vitesse de défilement.
- Carte recto verso (avis au recto, photo ou contexte au verso) comme `loeilsingulier-maquette/liner` : retournement en CSS 3D, focus déplacé sur la face visible.
