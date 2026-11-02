# Frise tracée et compteurs

Origine : `surffm-maquette/histoire` (compteurs de la campagne et frise des saisons).

## Usage

Une section `.frt` : titre, `.frt__chiffres` (chaque `.frt__n` porte `data-compte` et, si besoin, `data-suffixe`), puis la liste `ol.frt__frise` avec le `svg.frt__trait` et des `li.frt__etape` (année, corps, visuel facultatif). `init(section, options)`.

## Réglages

- `duree` (2,2 s) : montée des compteurs ; `locale` ('fr-FR') : espace des milliers.
- L'axe de la frise est à 26 % sur ordinateur (`--axe`), à gauche sur téléphone.

## Pièges

- La valeur finale reste écrite dans le HTML : sans JavaScript et en mode calme, rien ne compte, tout est juste.
- Chiffres en `tabular-nums` et `min-width` réglé sur la largeur finale avant de compter : rien ne bouge autour.
- Longueur du trait remesurée au `refresh` (polices, images, redimensionnement), jamais pendant le défilement.
- Un chiffre non vérifié ne doit pas être animé : il s'affiche, avec son étiquette « à confirmer ».

## Variantes

- Sans compteurs : retirer `.frt__chiffres`, la frise fonctionne seule.
- Frise horizontale : voir `galerie-horizontale-epinglee`.
