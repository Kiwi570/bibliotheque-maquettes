# locomponairo-maquette

<https://locomponairo-maquette.vercel.app> · audit du 10/11/2026 · dernier commit 5121221 du 10/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, v1), regard neuf et test « vrai visiteur » par deux agents séparés, inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Direction « Quatre clés, quatre histoires » : maison vigneronne de 1850 racontée par ses clés, en tomette, lie-de-vin, vert volet et laiton, avec Fraunces aux axes SOFT et WONK. L'intro fait tomber les clés sur l'anneau et ouvre la page par une serrure ; le visiteur fait tourner le trousseau, ouvre la maison en coupe, lit l'heure de Pouzols sur un cadran de 24 h et décroche sa clé au tableau de la réception. Solide et cohérente, avec une ouverture et une réservation mémorables ; quelques sections restent sages à côté du palmarès.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro des clés et serrure, trousseau à faire tourner, maison 3D qui s'ouvre étage par étage, cadran de 24 h et tableau à clés : l'univers est fort. Le couloir des chambres, les tampons « inclus » et la ronde des alentours restent en dessous du palmarès. |
| 2. Direction artistique et harmonie | 13/15 | Palette tirée de la maison (tomette, lie-de-vin, volet, laiton), gravures des alentours et sarment de vigne cohérents sur les sept pages. Séjour, Alentours et Réserver partagent la même mise en page d'ouverture. |
| 3. Animations et effets | 13/15 | Voile en trou de serrure, intro qui finit sur l'objet de chaque page, sarment qui pousse, axes de police au défilement, scène de la journée heure par heure, clé qui vole jusqu'au récapitulatif. |
| 4. Expérience ludique et interactions | 8/10 | Trousseau, maison à attraper, puces de chambre, filtres du comparatif, portes, numéro tamponné, tableau à clés et formulaire en trois étapes ; Séjour n'offre presque rien à toucher. |
| 5. Tous les formats | 13/15 | Audit complet sur les 13 formats sans échec après corrections ; premiers écrans resserrés sur petit téléphone et informations clés gardées à l'horizontale. Safari non lancé. |
| 6. Contenu et fiabilité | 8/10 | Faits repris du site actuel et revérifiés après l'audit (deux détails introuvables retirés), rien d'inventé ; restent à fournir : mentions légales, confidentialité, tarifs, surface de Denise, notes d'avis, garage gratuit ou payant. |
| 7. Technique et performance | 8/10 | Site statique généré, images WebP en plusieurs tailles, images de partage, mode calme et secours sans JavaScript. Fluidité de l'accueil corrigée après l'audit complet (10 % puis 8 % d'images lentes, processeur ralenti 4 fois). Dépôt de 24 Mo à cause des photos d'origine. |
| 8. Mise en ligne | 4/5 | GitHub et Vercel en place, adresse courte prête pour le module Wix ; la protection Vercel était encore active à la mise en ligne. |
| 9. Accessibilité | 4/5 | Mode calme, contrastes corrigés, liens externes nommés par aria-label, cibles tactiles de 44 px, formulaires étiquetés. |
| **Total** | **83/100** | |

## Points forts

- Intro des quatre clés qui tombent sur l'anneau, puis ouverture de la page par une serrure ; voile de transition en trou de serrure qui part du clic
- Trousseau à faire tourner : la clé du bas désigne la chambre, avec son nom et son lien
- Maison en coupe 3D qui se construit au défilement : garage, entrée, chambres du 1er, du 2e, puis le toit qui se lève
- Cadran de 24 h à l'heure de Pouzols : petit-déjeuner, arrivée, clés et garage lus d'un coup d'œil
- Réservation au tableau de la réception : la clé décrochée file jusqu'au récapitulatif, tampon « Demande prête », lien vers la vraie réservation
- Faits du site actuel repris tels quels et vérifiés, tout le reste marqué « à compléter »

## Défauts

### Bloquants

Aucun.

### Importants

1. **Sections sages à côté du palmarès** : Le couloir des chambres, les tampons « inclus » et la ronde des alentours ont moins de matière et de mouvement que les sections de référence de leur rôle. Effort : 1 h.
2. **Ouvertures qui se ressemblent** : Séjour, Alentours et Réserver ouvrent sur la même mise en page (texte à gauche, objet moyen à droite) ; le cadran et la ronde reviennent à l'identique entre l'accueil et leur page. Effort : 1 h.
3. **Safari non testé** : WebKit n'a pas pu tourner ici : intro, voile, épinglages et menu à vérifier dans Safari sur le Mac. Effort : 15 min.

### Finition

1. **Photos répétées** : Quelques photos de la maison reviennent d'une page à l'autre (façade, cour, escalier). Effort : 15 min.
2. **Contenus à fournir** : Mentions légales, confidentialité, tarifs, surface de Denise, notes d'avis, garage gratuit ou payant. Effort : côté client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 2 à regarder, 0 non lancé(s) |
| Premier audit standard | 206 échecs, dont 138 dus à la planche d'intention laissée à la racine ; tous corrigés |
| Audit complet de la version validée | 1 échec (fluidité de l'accueil, 10 %), corrigé ; relance ciblée : 0 échec, 8 % |
| Grille wouahou | 7 points sur 7 |
| Temps | 130 min de travail pour 145 prévues à la v1, plus 56 min d'audit complet et de corrections |
