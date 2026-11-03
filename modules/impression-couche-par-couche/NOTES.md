# Impression couche par couche

Origine : `d3co-maquette/heros` (« Héros imprimé couche par couche », noté 5). La mécanique reprise : un objet s'imprime couche après couche sous une buse, les couches fraîches sont chaudes (accent) et refroidissent en s'éloignant de la buse (décroissance `exp(-âge × 0,42)` de l'origine), un chariot horizontal suit la hauteur d'impression, puis l'objet s'ouvre en strates décalées une à gauche, une à droite (vue éclatée au défilement, section épinglée, scrub).

Technique choisie : canvas 2D seul, sans WebGL ni image. L'origine imprimait une vraie photo dans un shader OGL (avec une boîte UV générée depuis la photo) et gardait un repli canvas 2D bien plus pauvre. Ici l'objet est géométrique (vase nervuré et tordu, profil paramétrique) : chaque couche est un vrai volume (paroi extérieure de face, paroi intérieure du fond vue par l'ouverture, dessus), ce qui donne l'effet complet sans WebGL, donc sans repli à prévoir. Aucune boucle permanente : le dessin ne se refait qu'au défilement ou au redimensionnement.

## Usage

```html
<section class="icc" data-module="impression-couche-par-couche" data-epingle aria-labelledby="icc-titre">
  <div class="icc__cadre socle-cadre">
    <div class="icc__tete" data-tient>…surtitre, h2.icc__titre#icc-titre, p.icc__intro…</div>
    <div class="icc__scene" data-tient>
      <div class="icc__toile" role="img" aria-label="Schéma : un vase se construit en 64 couches, puis s'ouvre en 6 strates."></div>
    </div>
    <div class="icc__mesure" data-tient>
      <p class="icc__etat" data-etat>Impression en cours</p>
      <p class="icc__compte">Couche <b data-couche>0</b> / <span data-total>64</span><span class="icc__pourcent"><b data-pourcent>0</b> %</span></p>
      <div class="icc__barre" aria-hidden="true"><i></i></div>
    </div>
  </div>
</section>
```

Le module pose le canvas (`aria-hidden`) dans `.icc__toile`, dont le `role="img"` et l'`aria-label` sont l'équivalent texte : les tenir alignés sur `couches` et `strates`. L'indicateur n'est pas annoncé (`aria-live` absent volontairement : il change à chaque pas de défilement).

## Réglages

- `couches` (64) et `strates` (6, 0 : pas de vue éclatée). Les strates portent à droite leur numéro et leurs couches (« 03 · 23–32 »), le numéro seul quand la place manque.
- `longueur` (3 écrans), `lissage` (0,6) : durée et lissage de l'épinglage. Séquence : impression (70 %), temps d'arrêt, ouverture en strates.
- `rotation` (0,9 rad) : l'objet tourne lentement pendant la séquence (0 pour le figer).
- Forme : `profil` (fonction t → rayon, ≈ 0,3 à 1 ; défaut : panse, col, lèvre évasée), `nervures` (12, 0 : lisse), `torsion` (0,9 rad).
- `matiere` ('--couleur-secondaire') : variable CSS de la matière ; ombres et dessus sont mélangés avec `--couleur-texte` et `--couleur-fond`, la chaleur avec `--couleur-accent`.
- `textes` : `{ impression, termine, eclate }` (« {n} » = nombre de strates).
- `largeurMin` (700) et `hauteurMin` (520) : en dessous, pas d'épinglage ; l'impression puis l'ouverture avancent pendant que la scène traverse l'écran (de « haut de scène à 72 % » à « bas de scène à 64 % », pour que la vue éclatée finisse objet entièrement visible).

## Pièges

- Les couleurs sont lues une fois à l'initialisation (n'importe quel format CSS, converti par un canvas d'un pixel) : changer de thème à chaud demande de relancer `init`.
- L'échelle est calculée objet ouvert : l'objet ne zoome jamais, mais il paraît plus petit tant qu'il est fermé. Avec beaucoup de strates, réduire `strates` plutôt que d'agrandir la scène.
- Épinglée, la scène prend la hauteur restante (`minmax(0, 1fr)`) et le dessin s'y ajuste : rien n'est rogné de 1000×560 à 2560×1440, tablettes comprises (colonne sous 1:1). Sous 600 px de haut l'intro est masquée.
- `anticipatePin` de l'origine retiré ; pas de `drawSVG` (plugin) : les cotes animées de l'origine sont laissées de côté.
- Mode calme et réduire les animations : objet entier, ouvert en strates, indicateur à 64 / 64 et 100 %, aucun ScrollTrigger.

## Variantes

- Laissé de côté (identité) : la photo du vase et sa boîte UV, les cotes « Ø 18,2 × H 25 cm », le cartouche modèle/matière/prix, le fond d'ambiance en parallaxe, l'inclinaison au curseur, le clic « relancer l'impression », le changement d'image qui s'imprime par-dessus l'ancienne (boutique d'origine).
- Autre objet : tout `profil` de révolution fonctionne (pièce cylindrique, coupe, bol). Pour une forme non circulaire, remplacer la fonction `contour()` (rayon en fonction de l'angle).
- Un vrai rendu photo (la photo du produit qui s'imprime) demande le shader WebGL de l'origine et une boîte de la silhouette : à garder pour un projet qui en a la photo détourée.
