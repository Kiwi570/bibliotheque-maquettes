# Document à feuilleter

Origine : `qd2a-maquette/debut` (5), le tapuscrit lauréat qu'on attrape et dont on tourne les six pages avec élan (souris ou doigt, flèches et clavier), annotations au crayon tracées sur chaque page lue, inclinaison vers la souris, coin qui se soulève une fois à l'arrivée ; ses pièges sont repris (pages hors jeu cachées, sinon leurs textes se chevauchent pour l'audit ; au doigt, seul le geste horizontal est pris). `qd2a-maquette/saison-selection` regardée : sa pile de tapuscrits feuilletée au défilement est la mécanique de `bac-a-feuilleter`, non refaite ici. Rôle ouverture.

Rendu générique : n'importe quel document écrit en HTML, **une div par page** (texte, images, liens). Là où le tapuscrit se soulevait vers le haut (agrafe), les pages tournent ici autour du dos, comme une plaquette ou un livre : feuillets en 3D avec **recto et verso** (en double page, ce sont deux pages du document), ombrage du feuillet qui tourne, **ombre portée** sur la page dessous qui suit son bord, creux de la reliure. **Double page** dès que deux pages tiennent côte à côte (requête de conteneur : 720 px en portrait, 1 040 px en paysage), **une page à la fois** sinon (téléphone : on glisse la page). Couverture facultative : fermé, le document se centre sur elle (et sur son dos à la fin). Trois démonstrations : plaquette d'agence (portrait, couverture), menu de restaurant (sans couverture, il s'ouvre sur sa première double page), carnet de voyage (paysage, couverture kraft). Aucune dépendance. Laissé de côté (identité) : agrafe, tampon, titre en trois lignes, photo de table de lecture, curseur crayon de QD2A.

## Usage

```html
<section class="daf" data-module="document-a-feuilleter" aria-labelledby="t">
  <noscript><style>…recopier celui de index.html : pages l'une sous l'autre, annotations en CSS…</style></noscript>
  <h1 id="t">…</h1>
  <div class="daf__scene">
    <div class="daf__document" data-format="portrait" data-couverture data-titre="Plaquette de l'atelier">
      <div class="daf__page">…couverture…</div>
      <div class="daf__page"><h2>…</h2><p>… <span data-annot="entoure">140</span> …</p></div>
      …
    </div>
  </div>
  <div class="daf__commandes" data-daf-commandes></div>
</section>
<script type="module">import { init } from './modules/document-a-feuilleter/module.js'; for (const el of document.querySelectorAll('[data-module="document-a-feuilleter"]')) init(el);</script>
```

- **Tourner** : glisser la page (souris : on l'attrape tout de suite ; doigt : seulement si le geste est horizontal, la page défile sinon), avec élan (vitesse des derniers points : elle finit de tourner la feuille en cours, sans en emporter d'autres) ; un petit geste franc suffit, un long glissé feuillette plusieurs pages. Clic ou toucher bref sur le bord droit (30 %) : page suivante, bord gauche : précédente. Flèches gauche et droite (et Page, Début, Fin sur le document), boutons ← → et compteur (« Pages 2–3 sur 8 », « Couverture », « Dos »), annoncé (`aria-live`). À la souris près du bord, le coin se soulève.
- **Accessibilité** : le document est une région focalisable (`aria-roledescription` « document à feuilleter ») ; seules les pages visibles sont lisibles et atteignables (`inert` et `aria-hidden` sur les autres) ; un focus resté dans une page qui disparaît revient au document.
- **Pages** : leur mise en page se fait dans l'unité `--pu` (1 % de la largeur d'une page) ; la taille du texte est `max(12px, 3,3 --pu)`, le reste en `em`. Le papier, l'encre et le crayon se règlent par document : `--daf-papier`, `--daf-encre`, `--daf-crayon`.
- **Annotations** : `data-annot` sur un mot ou une courte expression : `souligne`, `entoure`, `barre`, `coche` (dans la marge, avant le mot), `marge` (trait vertical à gauche). Ou un `<svg class="daf__annot" viewBox="0 0 210 297" preserveAspectRatio="none">` libre posé dans la page, chemins en `pathLength="1"`. Le trait se dessine quand la page est lue.
- `init()` renvoie `{ aller(i), suivante(), precedente(), detruire() }` ; le document porte `data-p` (état posé) et `data-affichage` (`simple` ou `double`).

## Réglages

Attributs du document : `data-format` (`portrait` 210 × 297, `paysage`, `carre`, ou `--daf-r` pour une autre proportion largeur / hauteur), `data-couverture`, `data-mode="simple"` (jamais de double page), `data-titre` (nom lu). Options : `depart` (0), `invitation` (true), `inclinaison` (true), `elan` (0,28). Hauteur maximale : `--daf-hmax` (écran moins 270 px, 860 px au plus ; elle ne dépend pas de `--entete-h`, mesurée après le premier affichage, ce qui ferait bouger la page).

## Pièges

- Avant le script, le CSS pose déjà la première page (ou la double page d'ouverture, couverture centrée) à sa place définitive, et les commandes ont leur place réservée (`[data-daf-commandes]`, 96 px) : aucun décalage au chargement.
- Mode calme et « réduire les animations » : le CSS met les pages l'une sous l'autre avant tout script (sans décalage) ; sans JavaScript, c'est le `<noscript>` de la section. Les pages y grandissent avec leur contenu.
- L'unité `--pu` vient d'une requête de conteneur sur le document : ne pas mettre `container-type` sur une page ni sur ses enfants, sinon les tailles en `--pu` à l'intérieur changent de référence.
- Une annotation est un `inline-block` : un long passage ne se coupe pas en fin de ligne, annoter quelques mots.
- Les images d'une page ne se glissent pas (`draggable=false`) ; les liens et boutons d'une page restent cliquables (le geste ne part pas d'eux).
- Le texte d'une page en paysage sur téléphone est à 12 px au plus petit : peu de texte par page dans ce format.
- Scénario filmé : attendre la fin de l'invitation (environ 2 s après l'arrivée du document à l'écran) avant de glisser, sinon le geste part de la page déjà soulevée et l'élan en tourne une de plus. Le geste vise `.daf__scene`, qui ne bouge pas (le document se décale quand il s'ouvre).
- `filter: drop-shadow` sur le document (l'ombre suit la couverture seule quand il est fermé) : à retirer si une page très chargée rame sur un vieux téléphone.

## Variantes

- Rapport annuel, catalogue de collection, livret de mariage, programme de saison, carte de vœux qu'on ouvre, portfolio relié, mode d'emploi illustré.
