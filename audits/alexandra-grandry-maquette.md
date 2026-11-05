# alexandra-grandry-maquette

<https://alexandra-grandry-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 062b3dd du 05/11/2026 (v2)

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (6 pages, captures 1440 et 390, aucune erreur de console), contrôle des fichiers de mise en ligne et lecture des captures ; le rapport du script d'audit n'est pas dans le dépôt. Pas d'audit externe : la note est à confirmer.

## Verdict

**82/100 · À peaufiner · 0 défaut bloquant**

Direction « Figure et fond » tirée des mots de la thérapeute : deux profils d'encre qui s'ouvrent sur la photo, une forme WebGL qui change pour chaque public, le mot « Gestalt » qui se rassemble. Calme, juste pour une thérapeute, mais portée par beaucoup d'illustrations générées ; tarifs et mentions à fournir, affichage dans Wix bloqué par un en-tête.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture aux deux profils qui s'écartent, forme WebGL du « Pour qui », encre au pointeur de la Gestalt : des idées tirées du métier, moins spectaculaires que les plus fortes de la bibliothèque, ce qui convient au sujet. |
| 2. Direction artistique et harmonie | 13/15 | Fraunces et Figtree, ivoire, vert profond et terre cuite tenus partout ; intérieurs générés très semblables d'une page à l'autre. |
| 3. Animations et effets | 12/15 | Fil d'encre, planches empilées, frise et chemins tracés, forme qui se transforme, voile à bord d'encre ; plusieurs sections ne font qu'apparaître. |
| 4. Expérience ludique et interactions | 8/10 | Demande en quatre étapes avec cartes et tarifs, vase de Rubin à basculer, respiration guidée, fiches avec lien direct. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les six pages, fiches lisibles au téléphone ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 7/10 | Textes du site actuel, titre « Gestalt-thérapeute » prudent ; tarifs enfants, adolescents et sophrologie, horaires, mentions et dates des groupes à fournir ; une seule vraie photo. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, 4,2 Mo d'images (la plus lourde 141 Ko), WebGL limité à deux sections. |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=2 partout, images de partage, 404 aux couleurs ; X-Frame-Options encore présent dans vercel.json. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, accordéon natif, formulaire étiqueté ; contraste des petits textes doux sur ivoire à vérifier. |
| **Total** | **82/100** | |

## Points forts

- L'ouverture de l'accueil : deux profils d'encre face à face, la coupe laisse voir la photo puis s'ouvre au défilement.
- « Une forme pour chaque histoire » : une forme WebGL se transforme pour chaque public, avec son tarif à côté.
- La page Gestalt : encre verte au pointeur et mot qui se rassemble, vase de Rubin à basculer.
- Le plan du RER au cabinet, tracé au défilement.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Affichage dans Wix refusé** : vercel.json envoie encore X-Frame-Options : SAMEORIGIN. Retirer l'en-tête et pousser. Effort : petit.
2. **Illustrations générées très semblables** : intérieurs vides, rideaux et fenêtres sur presque toutes les sections : demander des photos du cabinet ou varier les sujets. Effort : moyen.

### Finition

1. **Informations à fournir** : tarifs enfants, adolescents et sophrologie, horaires, dates des groupes, mentions légales, assurance, logo à valider. Effort : petit.
2. **Script d'audit à relancer** : le rapport du script d'audit n'est pas dans le dépôt : relancer node _audit/audit.mjs avant l'envoi. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Pages publiques | 6 |
| Images servies | 94 fichiers, 4.2 Mo (la plus lourde : 141 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, X-Frame-Options présent (affichage dans Wix refusé) |
| Version des fichiers | ?v=2 |
