# Catalogue filtré avec Flip

Origine : `instinct-aventure-maquette/voyages-catalogue` (catalogue des voyages : formule, durée, région, budget, tri).

## Usage

```html
<section class="cff" data-module="catalogue-filtres-flip">
  <div class="cff__filtres">
    <div class="cff__groupe" role="group" aria-label="Catégorie" data-filtre-groupe="categorie">
      <button type="button" data-valeur="tout" aria-pressed="true">Tout</button>
      <button type="button" data-valeur="atelier" aria-pressed="false">Atelier</button>
    </div>
    <label class="cff__curseur">Budget <b data-sortie="prix"></b><input type="range" min="200" max="1600" step="50" value="1600" data-filtre-max="prix"></label>
    <select data-tri><option value="ordre">Recommandés</option><option value="prix-asc">Prix croissant</option></select>
    <p aria-live="polite"><b data-compte></b> <span data-compte-mot></span> · <button type="button" data-reinit>Réinitialiser</button></p>
  </div>
  <div class="cff__grille" data-grille>
    <article class="cff__fiche" data-categorie="atelier" data-prix="290" data-jours="1">…</article>
    <p class="cff__vide" data-vide hidden>Aucune fiche… <button type="button" data-reinit>réinitialiser</button></p>
  </div>
</section>
```

Toutes les données sont dans le HTML : un groupe `data-filtre-groupe="x"` filtre sur `data-x` de chaque fiche (plusieurs valeurs séparées par des espaces) ; un curseur `data-filtre-max="y"` garde les fiches dont `data-y` est inférieur ou égal ; le tri `champ-asc` / `champ-desc` lit `data-champ` (`ordre` = ordre du HTML). Ajouter un groupe ou un critère de tri ne demande aucune ligne de JavaScript.

## Réglages

- `adresse` (true) : `?categorie=atelier&prix=900&tri=prix-asc` est écrit avec `replaceState` et relu à l'arrivée ; une valeur inconnue est ignorée.
- `nombres` (true) : chaque bouton affiche le nombre de fiches qu'il donnerait ; une rubrique qui donnerait 0 est grisée (`aria-disabled`, barrée) et inactive.
- `format` : texte du curseur (euros par défaut) ; `mots` : singulier et pluriel du compteur.
- `duree` (0,7 s) : sorties en fondu pendant que les entrées apparaissent, jamais de moment vide.

## Pièges

- Le tri déplace les nœuds existants (`insertBefore`) : aucune fiche n'est recréée, donc jamais de doublon, et les écouteurs restent.
- `Flip.from` en `absolute: true` : les fiches sortantes restent visibles pendant leur fondu ; un Flip en cours est terminé avant le suivant (clics rapides, curseur).
- Le curseur est temporisé à 90 ms : le Flip ne se relance pas à chaque pixel.
- Après filtrage, `socle.rafraichir()` recalcule les ScrollTrigger de la page (la hauteur a changé) ; si la grille a raccourci sous le visiteur, la page remonte en haut du catalogue.
- Le lien du titre couvre toute la fiche (`::after`) et mesure 44 px ; le focus dessine le contour de la fiche.
- Mode calme : changement direct, sans Flip. Sans JavaScript : toutes les fiches visibles.

## Variantes

- Sur la maquette d'origine, le survol d'une fiche allume son tracé sur une carte collante à droite (`hot()` dans `voyages.js`) : à ajouter à côté de la grille avec une colonne `position: sticky`.
- Case « Comparer » sur chaque fiche avec une barre de comparaison : l'audit y signale une case de 20 px, prévoir 44 px.
