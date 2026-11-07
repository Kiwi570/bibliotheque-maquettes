# Grille sur photo

Origine : `lydiacourtois-maquette` (Feng Shui : le bagua posé sur la photo de la pièce depuis la porte, puis la section « Les neuf domaines » épinglée). Rendu générique : une grille N × M de zones cliquables sur n'importe quelle photo, qui s'allument dans un ordre qui a du sens pour le métier, chaque zone expliquée dans un cartouche.

Idées d'usage : bagua d'une pièce (feng shui), zones d'un jardin ou d'un terrain (paysagiste), pièces d'une maison vue de dessus (rénovation, immobilier), zones du corps (kiné, ostéopathe, coach), parcelles d'une carte (tourisme), étapes d'un plan de travail (cuisiniste), muscles travaillés sur une machine (salle de sport).

## Usage

```html
<section class="gsp" data-module="grille-sur-photo" data-epingle data-ordre="7,6,3,0,1,2,5,8,4" data-depart="4" aria-labelledby="gsp-titre">
  <div class="gsp__cadre socle-cadre">
    <div class="gsp__tete" data-tient>…surtitre, h2.gsp__titre#gsp-titre, p.gsp__intro…</div>
    <figure class="gsp__photo" data-tient>
      <img src="…" alt="…" width="1600" height="1200">
      <div class="gsp__grille" style="--gsp-col:3;--gsp-lig:3" role="group" aria-label="Les neuf zones, la porte en bas au centre">
        <button type="button" class="gsp__case" data-coin="SE" data-nom="Prospérité" data-texte="…"><span class="gsp__coin">SE</span><span class="gsp__etiquette">Prospérité</span></button>
        …
      </div>
    </figure>
    <div class="gsp__lecture" data-tient>
      <div class="gsp__cartouche"><p class="gsp__coin-lu">C</p><h3 class="gsp__nom">Santé</h3><p class="gsp__texte">texte de la case de départ</p></div>
      <p class="gsp__aide">Touchez une zone pour la lire.</p>
    </div>
  </div>
</section>
```

- Cases dans l'ordre de lecture (ligne par ligne). `data-ordre` : ordre d'allumage ; `data-depart` : case allumée au départ, en mode calme et sans JavaScript (écrire son texte dans le cartouche).
- Position de la grille dans la photo : `--gsp-haut`, `--gsp-droite`, `--gsp-bas`, `--gsp-gauche` (6 % par défaut) ; Lydia : `--gsp-haut: 30%; --gsp-droite: 9%; --gsp-bas: 9%; --gsp-gauche: 9%` pour poser le bagua sur le sol de la pièce. Autre format de photo : `--gsp-ratio: 3 / 2` (et corriger le 4 / 3 de la largeur dans module.css).
- `.gsp__coin` est facultatif (direction, numéro, initiale).

## Pièges

- Le cartouche a une hauteur fixe : le module mesure le plus long texte à la largeur réelle (au démarrage et quand la largeur change) et la pose en `min-height`. Ne jamais changer le texte d'une case sans repasser par le module, sinon la page saute à chaque case allumée (le CLS compte un saut provoqué par le défilement).
- Le nom d'une case se cache quand la case est trop petite pour lui (requête de conteneur : moins de 110 px de large ou 54 px de haut à l'intérieur) ; il reste le nom du bouton et s'affiche dans le cartouche. Le coin et le nom sont empilés (colonne), jamais posés l'un sur l'autre : c'était le défaut de Lydia en 844 × 390.
- Téléphone à l'horizontale (640 à 899 px de large, 560 px de haut au plus) : le cartouche passe à côté de la photo, sinon la case touchée s'explique hors de l'écran.
- Le visiteur prend la main au premier toucher, survol à la souris ou passage au clavier : l'allumage automatique s'arrête et le cartouche devient `aria-live` (jamais avant : un lecteur d'écran annoncerait chaque case allumée par le défilement). Flèches du clavier pour passer d'une case à l'autre.
- Cases éteintes voilées, case allumée nette et cerclée (projecteur) : lisible sur toute photo. Une photo sombre demande une couleur de fond claire, ou l'inverse.
- Cases de 44 px au moins : au-delà de 4 × 4 sur téléphone, prévoir moins de cases ou une photo plus haute.
