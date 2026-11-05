# fanfare-dongelberg-maquette

<https://fanfare-dongelberg-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 5f21767 du 05/11/2026 (v2)

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, sur la v2 du 04/11/2026), inventaire de la bibliothèque (8 pages, captures 1440 et 390, aucune erreur de console) et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**84/100 · À peaufiner · 1 défaut bloquant**

Direction « Képi & Galons » : bleu nuit, cuivre doré, rouge fourragère et guirlandes de fanions ; un défilé de petits musiciens marche le long de la page au défilement. Une maquette joyeuse et juste pour une fanfare de village. L'audit complet laisse un échec : un flash d'image pendant un épinglage de l'accueil.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Défilé de musiciens qui marche au défilement, fanions, notes échappées de la 404, frise depuis 1895 : festif et propre à la fanfare. |
| 2. Direction artistique et harmonie | 13/15 | Fraunces et Archivo, bleu nuit, cuivre et rouge, papier crème ; vraies photos du site actuel de qualité inégale. |
| 3. Animations et effets | 11/15 | Galeries épinglées, chapitres empilés, polaroïds, compteurs ; un flash d'image pendant l'épinglage des animations (échec au script). |
| 4. Expérience ludique et interactions | 9/10 | Défilé à arrêter, son de la fanfare, dates passées filtrables, albums avec visionneuse, choix du pupitre, réservation et inscription par étapes. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les huit pages ; Safari à vérifier sur le Mac (signalé par l'audit). |
| 6. Contenu et fiabilité | 8/10 | Agenda, tarifs, histoire et chefs du site actuel ; comité et lieu de l'école à compléter. |
| 7. Technique et performance | 8/10 | Aucune erreur de console ; 22,2 Mo d'images (la plus lourde 512 Ko). |
| 8. Mise en ligne | 5/5 | noindex et X-Robots-Tag, ?v=2 partout, images de partage, 404 aux couleurs, affichable dans Wix. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, défilé et ruban arrêtables, son coupé par défaut. |
| **Total** | **84/100** | |

## Points forts

- Le défilé de petits musiciens qui marche le long de la page au défilement, et qu'on peut arrêter.
- La 404 « Fausse note » : cinq notes se sont échappées de la partition.
- La frise de 1895 à aujourd'hui, épinglée, avec les photos d'époque.
- Les albums en polaroïds éparpillés.

## Défauts

### Bloquants

1. **Flash pendant l'épinglage** : l'audit complet relève deux images isolées différentes (flash) pendant l'épinglage des animations de l'accueil, à 1366×768 : une image de la galerie apparaît une fraction de seconde au mauvais endroit. Effort : petit.

### Importants

1. **Safari non vérifié** : épinglages et défilé à contrôler sous WebKit. Effort : petit.

### Finition

1. **Retour avant et rechargement** : deux points « à regarder » du script. Effort : petit.
2. **Informations à compléter** : comité, lieu et horaires de l'école de musique. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet du 04/11/2026 : 2 échec(s), 2 à regarder |
| Pages publiques | 8 |
| Images servies | 275 fichiers, 22.2 Mo (la plus lourde : 512 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, affichable dans Wix |
| Version des fichiers | ?v=2 |
