# Schéma épinglé en étapes

Origine (fusion, quatre sections notées 5) :
- `aquafit-maquette/gilet` (« Schéma épinglé en trois étapes ») : section épinglée, trois étapes, repères du schéma qui s'allument de façon cumulative (→ `data-see-des`) ; liste simple sans épinglage sous 900 px.
- `nelis-maquette/groupes-eau-glacee-principe` (« Schéma de principe épinglé ») : composants et flux reliés aux étapes par `data-c` / `data-s`, seuls les éléments de l'étape restent pleinement visibles (→ `data-see-partie`), flux en tirets animés, tout allumé en mode calme.
- `btp-confort-avenir-maquette/isolation-coupe` (« Coupe thermique épinglée ») : calques qui se posent l'un après l'autre sur une coupe, scène entière épinglée en hauteur d'écran avec la place de l'en-tête réservée (→ exemple 2 et `.see__scene`).
- `nelis-maquette/puissances` (« Jauge de puissance épinglée ») : étapes empilées dont une seule est visible, jauge qui monte palier par palier, valeur qui entre en glissant, puces de progression (→ `.see__jauge`, `.see__puces`).

## Usage

```html
<section class="see" data-module="schema-epingle-etapes" data-epingle aria-labelledby="t">
  <div class="see__scene">
    <div class="see__grille socle-cadre">
      <div class="see__texte" data-tient="texte">
        <p class="socle-surtitre see__surtitre">…</p>
        <h2 class="see__titre" id="t">…</h2>
        <ol class="see__etapes">
          <li class="see__etape" data-see-jauge="45" data-see-valeur="45 %">   <!-- jauge facultative : 0–100 et texte lu -->
            <p class="see__n">Étape 01</p><h3>…</h3><p>…</p>
          </li>
        </ol>
      </div>
      <figure class="see__schema" data-tient="schéma">
        <div class="see__plan">
          <svg class="see__svg" viewBox="0 0 400 300" aria-hidden="true">
            <g data-see-partie="1 2">…</g>   <!-- allumé aux étapes 1 et 2, estompé sinon -->
            <g data-see-des="3">…</g>        <!-- calque absent avant l'étape 3, présent ensuite -->
          </svg>
          <span class="see__etiquette" data-see-partie="1" style="--x: 15%; --y: 31%">Entrée</span>
        </div>
        <div class="see__jauge"><div class="see__tube" aria-hidden="true"><span class="see__niveau"></span></div><p class="see__valeur" data-see-valeur>100 %</p></div>
        <figcaption class="socle-sr">Description du schéma.</figcaption>
      </figure>
    </div>
  </div>
</section>
```

Classes de dessin disponibles dans le SVG : `see__fond`, `see__boite` (allumée : contour accent), `see__boite--fixe`, `see__detail`, `see__zone`, `see__couche` (`--2`, `--3`), `see__trait` + `see__flux` (même tracé : rail et tirets animés), `see__pointe`. Les étiquettes sont du HTML posé en % du plan : jamais sous 12 px, quelle que soit la taille du schéma. Le module construit les puces (boutons de 44 px « Étape n : titre ») et une annonce `aria-live` « Étape n sur N : titre, valeur ».

## Réglages

- `largeurMin` (900) et `hauteurMin` (500) : en dessous de l'une ou de l'autre, pas d'épinglage. À 900 px et plus, sur au moins 500 px de haut, la scène s'épingle en hauteur d'écran (de `--entete-h` à `--barres-h`) et les étapes s'empilent : une seule visible, changement tous les `pas` % d'écran (70).
- `telephone` : `'compact'` (défaut) colle le schéma sous l'en-tête, réduit à 34 % de la hauteur d'écran, les étapes défilent dessous ; `'repete'` place une copie figée du schéma (aria-hidden) en tête de chaque étape, rien ne colle. La démonstration lit `data-see-telephone` sur la section.
- `lecture` ('55%') : hors épinglage, l'étape active est la dernière dont le haut a passé cette ligne.
- Variables : `--see-marge` (marge haute et basse de la scène), `--see-jauge-l` (64 px), `--see-eteint` (opacité des parties hors étape, .28).

## Pièges

- Le plan est en 4/3 et son viewBox en 400 × 300 : les positions `--x` / `--y` des étiquettes sont des % du même repère. Changer l'un impose de changer l'autre et le facteur 4/3 du CSS.
- Largeur du plan épinglé : `min(colonne − jauge, (écran − --entete-h − --barres-h − 2 marges) × 4/3)` ; il tient de 1000×560 à 2560×1440. Le titre est borné par `min(3.6vw, 6.2vh)`.
- Tablettes en portrait (768×1024, 820×1180) : moins de 900 px de large, donc présentation téléphone ; le schéma compact y est collé et doit tenir (testé).
- Sous 480 px, la jauge passe à l'horizontale sous le plan pour lui laisser toute la largeur : à 320 px, les étiquettes de 12 px ne se chevauchent pas. Garder des étiquettes courtes (16 caractères au plus) et les écarter d'au moins 12 % en hauteur.
- Les positions des étapes sont mesurées au `refresh`, jamais pendant le défilement ; la classe `see--visible` (section à l'écran) est posée par un déclencheur créé après l'épinglage, sinon il ignore la longueur ajoutée par le pin.
- Les flux tournent en CSS seulement si la section est visible ; arrêtés sous « réduire les animations » et en mode calme.
- Sans JavaScript et en mode calme : aucune classe `see--vivant`, donc toutes les parties allumées, toutes les étapes lisibles, jauge à la valeur de la dernière étape ; schéma collant en CSS à droite sur ordinateur, en haut sur téléphone.
- Pas d'identifiant (`id`) dans le schéma : il est cloné en mode `repete`.

## Variantes

- Laissé de côté (identité des origines) : la silhouette qui nage en boucle et la surface ondulée d'Aquafit, la photo d'eau profonde ; les particules de chaleur en canvas et la barre d'état du chantier de la coupe thermique ; l'échelle logarithmique en kW, les photos produits et le mode « gel » givré de la jauge Nelis ; le défilement automatique toutes les 3,2 s du schéma Nelis sur téléphone (remplacé par le schéma compact collé, qui suit le doigt).
- Pour une jauge chiffrée (kW, °C, %), mettre la valeur lue dans `data-see-valeur` et le niveau (0–100, éventuellement déjà passé en échelle logarithmique) dans `data-see-jauge`.
- `carte-itineraire-collante` est la même mécanique avec un tracé qui s'allonge sur une carte : à préférer pour un parcours géographique.
