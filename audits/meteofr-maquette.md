# meteofr-maquette

<https://meteofr-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 6821379 du 05/11/2026 (v2)

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, livré avec la v2), inventaire de la bibliothèque (7 pages, captures 1440 et 390 ; seules erreurs de console : données en direct bloquées par le réseau de l'inventaire) et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Fil rouge « le site a la même météo que dehors » : le vent réel pousse les nuages, la pluie mouille la vitre, le froid la givre, l'heure colore le ciel. Altimètre dans la marge, isobares, journée en accéléré, ballon-sonde : un service de météo devenu une expérience. Le script relève 19 points à regarder, surtout des ouvertures qui arrivent d'un coup.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Ciel WebGL piloté par les données réelles, vitre qui se mouille ou givre, journée en accéléré, ballon-sonde : l'idée la plus forte du lot pour un service numérique. |
| 2. Direction artistique et harmonie | 12/15 | Outfit et DM Sans, bleu nuit et ciel, orange de l'appli ; cohérent, un peu proche d'une interface d'application. |
| 3. Animations et effets | 11/15 | Nombreux effets pilotés par les données ; 15 ouvertures signalées « changement brusque » et deux retours brusques au script. |
| 4. Expérience ludique et interactions | 10/10 | Recherche de commune, courbe des 24 heures au doigt, seize jours filtrables, radar image par image, vigilances par département, altimètre cliquable. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les sept pages ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 7/10 | Données en direct (Open-Meteo, Météo-France, RainViewer) avec repli ; mentions et sources à compléter. |
| 7. Technique et performance | 8/10 | 2,8 Mo d'images, trois scènes WebGL ; dépend d'API externes (repli affiché si elles ne répondent pas). |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=2 partout, images de partage, 404 aux couleurs ; X-Frame-Options encore présent dans vercel.json. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, accordéons natifs ; ciel animé permanent à confirmer pour les personnes sensibles au mouvement. |
| **Total** | **83/100** | |

## Points forts

- Le ciel de l'ouverture piloté par la météo réelle de la commune.
- La vitre de la page commune, mouillée par la pluie ou givrée par le froid.
- Les 24 heures en accéléré, du jour à la nuit, dans une section épinglée.
- L'altimètre dans la marge et le ballon-sonde des sources.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Ouvertures brusques** : 15 ouvertures signalées « changement brusque » par le script (le voile s'ouvre alors que la page n'est pas prête) : à reprendre avec la v10.3 du socle. Effort : moyen.
2. **Affichage dans Wix refusé** : vercel.json envoie encore X-Frame-Options : SAMEORIGIN. Retirer l'en-tête et pousser. Effort : petit.

### Finition

1. **Repli des données** : vérifier l'affichage quand une API ne répond pas (radar « indisponible »). Effort : petit.
2. **Mentions** : mentions légales et sources à compléter. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard du 05/11/2026 : 0 échec(s), 19 à regarder |
| Pages publiques | 7 |
| Images servies | 79 fichiers, 2.8 Mo (la plus lourde : 114 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, X-Frame-Options présent (affichage dans Wix refusé) |
| Version des fichiers | ?v=2 |
