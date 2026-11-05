# groupe-jrichard-maquette

<https://groupe-jrichard-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 727b406 du 05/11/2026 (v3)

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque sur la v3 (26 pages, captures 1440 et 390, aucune erreur de console) et lecture des captures ; le rapport du script d'audit présent dans le dépôt porte sur la v1 (04/11, 58 échecs), avant les deux versions suivantes. Pas d'audit externe : la note est à confirmer.

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Direction « De la graine à la cime » : la page se lit du sol vers la cime, une corde d'élagueur mesure l'altitude de lecture, une lumière de canopée passe sur les photos et la saison réelle traverse l'écran. La maquette la plus riche du lot en mécaniques de métier (strates, cernes, coupe de berge, cadran des saisons). Le dernier audit de la skill date de la v1 : la v3 doit être réauditée.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Corde d'altitude, strates du sol à la cime, saison vivante, cernes du tronc, coupe de berge, herbe qui se couche : un univers entier tiré du métier. |
| 2. Direction artistique et harmonie | 13/15 | Fraunces et Manrope, crème, vert forêt et orange ; vraies photos des chantiers ; lisières d'herbe entre les sections. |
| 3. Animations et effets | 12/15 | Très nombreux effets épinglés et en canvas ; l'audit de la v1 relevait 30 ouvertures brusques et des soucis de fluidité, non revérifiés depuis. |
| 4. Expérience ludique et interactions | 10/10 | Profil à choisir, prestations et réalisations filtrables, carte des sites avec statut, cadran des saisons, calcul du crédit d'impôt, devis en cinq étapes, candidature. |
| 5. Tous les formats | 12/15 | Captures 1440 et 390 propres sur 26 pages ; l'audit de la v1 relevait titres hors de l'écran et textes coupés au premier écran, à revérifier. |
| 6. Contenu et fiabilité | 7/10 | Textes, chiffres et réalisations du site actuel ; nombreuses informations « à compléter ». |
| 7. Technique et performance | 7/10 | Aucune erreur de console ; 35,7 Mo d'images ; WebGL et canvas sur chaque tête de page, fluidité à remesurer. |
| 8. Mise en ligne | 5/5 | noindex et X-Robots-Tag, ?v=3 partout, images de partage, 404 aux couleurs, affichable dans Wix. |
| 9. Accessibilité | 3/5 | Mode calme et réduire les animations ; l'audit de la v1 relevait contraste insuffisant et une cible sous 44 px, à revérifier. |
| **Total** | **83/100** | |

## Points forts

- La corde d'élagueur qui mesure l'altitude de lecture, de 0 à 25 m.
- Les quatre savoir-faire en strates épinglées, du sol à la cime.
- La saison vivante : feuilles, pétales, aigrettes ou flocons selon la saison réelle.
- L'histoire du groupe dans les cernes d'un tronc.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Audit à refaire sur la v3** : le rapport du script d'audit (58 échecs) date de la v1 ; v2 et v3 ont été faites ensuite sans nouveau rapport. Relancer l'audit complet avant l'envoi. Effort : moyen.
2. **Poids et fluidité** : 35,7 Mo d'images, WebGL et canvas sur chaque tête de page : remesurer la fluidité sur ordinateur lent et au téléphone. Effort : moyen.

### Finition

1. **Informations à compléter** : mentions, confidentialité, détails des sites et des postes. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet du 04/11/2026 : 58 échec(s), 44 à regarder |
| Pages publiques | 26 |
| Images servies | 314 fichiers, 35.7 Mo (la plus lourde : 368 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, affichable dans Wix |
| Version des fichiers | ?v=3 |
