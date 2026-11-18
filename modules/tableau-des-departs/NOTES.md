# Tableau des départs

Origine : `maysam-transfert-maquette/tarifs` (chauffeur privé : cinq trajets d'aéroport, durée et prix sur un tableau à palettes, noté 5). Pour des tarifs, des horaires ou une liste courte de destinations, quand le métier parle de départs : transport, navettes, voyages, salles de spectacle, séances, cours.

## Usage

```html
<section class="tdd socle-cadre" data-module="tableau-des-departs" aria-labelledby="tdd-titre">
  <div class="tdd__tete"><h2 class="tdd__h2" id="tdd-titre">Les prochains départs</h2></div>
  <div class="tdd__tableau" role="table" aria-labelledby="tdd-titre">
    <div class="tdd__entete" role="row"><span role="columnheader">Destination</span><span role="columnheader">Durée</span>
      <span role="columnheader">Prix</span><span role="columnheader"><span class="socle-sr">Réserver</span></span></div>
    <div class="tdd__ligne" role="row">
      <span class="tdd__cellule tdd__cellule--principale" role="cell"><span class="tdd__texte" data-cases="10">Aéroport</span></span>
      <span class="tdd__cellule" role="cell"><span class="tdd__texte tdd__texte--petit" data-cases="6">35-50</span><span class="tdd__unite" aria-hidden="true">min</span><span class="socle-sr">minutes</span></span>
      <span class="tdd__cellule tdd__cellule--prix" role="cell"><span class="tdd__texte tdd__texte--accent" data-cases="4" data-aligne="droite">60€</span></span>
      <span class="tdd__cellule tdd__cellule--action" role="cell"><a class="socle-bouton socle-bouton--plein" href="/reserver?trajet=aeroport">Réserver<span class="socle-sr"> Aéroport</span></a></span>
    </div>
  </div>
</section>
<script type="module">import { init } from './modules/tableau-des-departs/module.js'; init(document.querySelector('.tdd'));</script>
```

- Le texte est écrit dans la page : sans JavaScript, c'est un tableau simple en capitales mono. `init()` découpe chaque `.tdd__texte[data-cases]` en palettes masquées pour le lecteur d'écran, et garde le texte d'origine dans un `.socle-sr`.
- `init()` renvoie `{ jouer, detruire }` : avec `jouer: false`, appeler `jouer()` soi-même (à la fin d'une intro, par exemple). `detruire()` pose toutes les palettes sur leur lettre.
- Dans le socle de la skill, les lignes viennent d'un fichier de données (`donnees/trajets.json`) : le gabarit écrit un nom court pour la colonne principale (10 palettes au plus) et le nom complet dans le lien.

## Réglages

`signes`, `tours` (4), `pas` (55 ms), `survol` (true), `jouer` (true), `seuil` (0,35) : voir `module.json`. Taille des palettes : `--tdd-case` ; couleur d'une palette : `--tdd-fond-case` ; grille d'une ligne : `--tdd-colonnes`.

## Pièges

- 10 palettes au plus dans la colonne principale : au-delà, la ligne déborde sur téléphone (390 px) même à 16 px. Le texte trop long est coupé, pas réduit : écrire un nom court (« Roissy CDG », pas « Aéroport Roissy Charles-de-Gaulle »).
- Palettes en `clamp(15px, 1.9vw, 30px)`, 16 px sous 760 px et 13 px sous 380 px : à taille fixe, la destination la plus longue déborde d'un format à l'autre. Largeur et hauteur des palettes en em, chiffres tabulaires : rien ne saute pendant que les signes défilent.
- Sur téléphone, chaque ligne tient sur deux rangs (principal et prix, puis durée et action) et l'en-tête disparaît : un grand bouton par ligne sur une seule colonne faisait un tableau trop long.
- Les espaces de remplissage restent des palettes vides et ne tournent pas : un prix aligné à droite (`data-aligne="droite"`) garde ses colonnes alignées d'une ligne à l'autre.
- Le survol ne joue qu'une fois le tableau posé, et au plus une fois par 700 ms : sinon une souris qui passe sur toutes les lignes relance une cascade sans fin.

## Variantes

- Horaires (séances, cours, spectacles) : colonnes heure, titre, salle ; le prix devient une colonne secondaire ou disparaît (`--tdd-colonnes: auto minmax(0, 1fr) auto`).
- Tableau lancé par l'intro de la page (`jouer: false`, puis `jouer()` à la fin de l'ouverture) quand il est au premier écran.
