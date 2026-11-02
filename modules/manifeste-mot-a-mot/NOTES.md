# Manifeste mot à mot

Origine : `surffm-maquette/manifeste`.

## Usage

Une section `.mmm` avec un fond facultatif (`.mmm__fond` contenant une image ou un visuel), un surtitre, le paragraphe `.mmm__texte` et une signature. `init(section, options)`.

## Réglages

- `debut` / `fin` : bornes ScrollTrigger du balayage ; plus l'écart est grand, plus la lecture est lente.
- `opacite` (0,3) : les mots restent lisibles avant d'être « allumés ».
- `parallaxe` (8 %) : le fond déborde de 12 % en haut et en bas, donc on n'en voit jamais le bord.

## Pièges

- Les couleurs de départ et d'arrivée sont lues dans `--couleur-accent` et `--couleur-texte` (la maquette d'origine les écrivait en dur).
- Découpage en mots seulement (pas en lignes) : rien à refaire au redimensionnement, et aucun masque qui couperait les accents des capitales.
- Mode calme et réduire les animations : le texte reste dans son état final, non découpé.
- Garder le paragraphe court (40 à 60 mots) : au-delà, la lecture au défilement devient pénible.

## Variantes

- Mots-clés soulignés : ajouter un `<mark>` dans le texte, SplitText le conserve.
