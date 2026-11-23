# esnatation-maquette

<https://esnatation-maquette.vercel.app> · audit du 23/11/2026 · dernier commit 8c6833e du 23/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, v2 : 0 échec), inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**89/100 · Prête à envoyer · 0 défaut bloquant**

École de natation pour enfants à Puidoux-Chexbres. Direction « Reflets du bassin » : les vraies couleurs de la piscine du client, le poisson de son logo vectorisé qui se trace dans l'intro et revient partout, une ligne d'eau à 10 flotteurs pour les 10 levels. La v2 ajoute des interactions de l'eau sur toutes les pages (ronds au clic, eau sous la souris, bouées, hublot, bulles).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Intro du poisson qui se trace et glisse jusqu'au bassin, caustiques WebGL, eau qui fait des ronds sous la souris ; sobre plutôt que spectaculaire. |
| 2. Direction artistique et harmonie | 14/15 | Une palette tenue sur les 6 pages (blanc d'eau, bassin clair, bleu, rouge flotteur, nuit), Unbounded franc, ouvertures toutes différentes. |
| 3. Animations et effets | 13/15 | Un effet par section au moins, petits et soignés ; poisson sur la ligne d'eau, bouées, hublot, bulles, frise du soir. |
| 4. Expérience ludique et interactions | 8/10 | Sélecteur de level, formulaire par étapes prérempli, eau et ronds au toucher ; pas d'objet à manipuler longuement. |
| 5. Tous les formats | 14/15 | Audit complet sans échec sur 13 tailles et tous les modes ; Safari à vérifier sur le Mac. |
| 6. Contenu et fiabilité | 9/10 | Tout vient du site actuel (groupes, prix, horaires, charte) ; cycles calculés à la date ; adresse de la piscine et dates précises manquent. |
| 7. Technique et performance | 9/10 | Site statique, WebGL plafonné avec qualité adaptative, 5 à 6 % d'images lentes sur processeur ralenti. |
| 8. Mise en ligne | 5/5 | En ligne sur l'adresse courte, noindex, partage 1200×630 par page. |
| 9. Accessibilité | 4/5 | Contrastes corrigés (rouge des boutons à 5:1), clavier et focus vérifiés ; portraits de l'équipe en petite définition. |
| **Total** | **89/100** | |

## Points forts

- Les couleurs viennent des photos du client, pas d'une idée plaquée
- Le logo vectorisé sert d'objet d'intro, de voile et de fil
- Informations utiles visibles tout de suite, cycle en cours calculé
- Interactions de l'eau légères et cohérentes sur toutes les pages

## Défauts

### Bloquants

Aucun.

### Importants

1. **Portraits de l'équipe** : selfies de 428 px du site actuel, à remplacer par de vrais portraits. Effort : photos du client.

### Finition

1. **Sections typographiques** : pédagogie, déroulé et horaires restent sans image. Effort : faible.
2. **Adresse de la piscine** : plan indicatif seulement, adresse à fournir par l'école. Effort : faible.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 16 à regarder, 1 non lancé(s) |
| Pages | 6 (accueil, cours, école, inscription, contact, 404) |
| Temps v1 | environ 1 h 35, attentes comprises |
