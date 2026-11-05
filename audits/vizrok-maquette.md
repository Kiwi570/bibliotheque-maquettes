# vizrok-maquette

<https://vizrok-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 7cdb1c2 du 05/11/2026 (v4)

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, livré avec la v4), inventaire de la bibliothèque (7 pages, captures 1440 et 390, aucune erreur de console) et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Salle de nuit » : bleu nuit, vert néon, une barre de musculation en ouverture et un disque de fonte qui roule entre les pages. Les collections sur une barre à disques, le kit à accrocher et le shaker qui se remplit font une boutique de sport très ludique. Les fiches nutrition restent à compléter.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Disque de fonte qui roule et couvre l'écran entre les pages, barre à disques des collections, scanner du maillot, kit aux crochets : tout vient de la salle. |
| 2. Direction artistique et harmonie | 13/15 | Big Shoulders Display, Archivo et JetBrains Mono, nuit et néon avec des sections claires en alternance ; photos produits sur fond uni. |
| 3. Animations et effets | 13/15 | Barre épinglée, galeries horizontales, shaker et scanner épinglés, néons ; 0 échec et 0 à regarder au script. |
| 4. Expérience ludique et interactions | 10/10 | Panier simulé partout, catalogue filtrable avec recherche, coloris du maillot, kit à composer avec total, guide des tailles. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les sept pages ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 6/10 | Pièces et prix de la boutique actuelle ; valeurs nutritionnelles, allergènes, tailles et mentions à compléter. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, 6,9 Mo d'images (la plus lourde 221 Ko). |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=4 partout, images de partage, 404 aux couleurs ; X-Frame-Options encore présent dans vercel.json. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, ruban avec pause ; vert néon sur blanc à vérifier pour le contraste. |
| **Total** | **86/100** | |

## Points forts

- Le changement de page « disque » : un disque de fonte roule, couvre l'écran avec le nom de la page puis repart.
- Les quatre disques sur la barre, qui ouvrent chacun une collection.
- « Accroche ton kit » : les pièces se suspendent à des crochets et le total se calcule.
- Le shaker qui se remplit au fil des produits de nutrition.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Affichage dans Wix refusé** : vercel.json envoie encore X-Frame-Options : SAMEORIGIN. Retirer l'en-tête et pousser. Effort : petit.
2. **Fiches nutrition à compléter** : valeurs nutritionnelles, allergènes et mentions obligatoires « à compléter » : à fournir avant toute mise en vente. Effort : moyen.

### Finition

1. **Photos portées** : peu de photos portées : en ajouter pour les fiches les plus vendues. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard du 05/11/2026 : 0 échec(s), 0 à regarder |
| Pages publiques | 7 |
| Images servies | 240 fichiers, 6.9 Mo (la plus lourde : 221 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, X-Frame-Options présent (affichage dans Wix refusé) |
| Version des fichiers | ?v=4 |
