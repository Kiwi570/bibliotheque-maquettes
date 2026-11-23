# chateau-moulin-de-peyronin-maquette

<https://chateau-moulin-de-peyronin-maquette.vercel.app> · audit du 23/11/2026 · dernier commit f1b1cce du 23/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, 25 contrôles, 6 pages, 40 tailles), inventaire de la bibliothèque et lecture des captures et des films. Pas d'audit externe : la note est à confirmer.

## Verdict

**85/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Un rang sur deux » : fond lin, sections vert vigne, moutarde pour les boutons et un mot par titre, Gloock et Figtree. Le moulinet du logo sert de fil d'un bout à l'autre : il se déplie à l'intro et se pose dans le titre, tourne avec le défilement, ferme le voile de transition en quatre pales, se fait tourner à la main dans l'appel final et parcourt le chemin de la visite.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro où le logo se déplie puis se pose dans le titre, voile en moulinet, vortex de la dynamisation : la signature est forte ; les photos du domaine, prises par la famille, limitent le niveau premium des pleins cadres. |
| 2. Direction artistique et harmonie | 13/15 | Palette lin, vert vigne et moutarde tenue sur les six pages, une seule famille de titres, sections claires et sombres en alternance régulière ; illustrations dessinées (parcelle, carte, couchant) dans le même trait. |
| 3. Animations et effets | 13/15 | Chaque section a son mouvement lié au métier : carte qui se trace, étagère qui oscille avec la vitesse, vortex qui tourne, se casse et repart, moutarde qui fleurit et mouton qui traverse, soleil qui suit l'heure réelle du couchant, titres dont les lettres poussent une sur deux. |
| 4. Expérience ludique et interactions | 9/10 | Moulinets qu'on fait tourner en soufflant ou à la main, eau du vortex qu'on remue, bouteille qui s'envole vers un carton en six cases à la couleur des vins, réservation en deux onglets avec récapitulatif, adresse à copier. |
| 5. Tous les formats | 13/15 | Zéro échec sur 40 tailles, écrans bas compris ; le chemin de la visite est masqué sous 900 px (les étapes restent), la rangée des avis se glisse au doigt sur téléphone. |
| 6. Contenu et fiabilité | 8/10 | Contenu tiré du site actuel et du bon de commande 2026, incohérences relevées dans le README ; mentions légales, accords de quatre vins et liste des partenaires à fournir. |
| 7. Technique et performance | 8/10 | Site statique, polices et images locales, aperçus flous à l'ouverture ; 7 % d'images lentes au défilement de l'accueil quand le processeur est ralenti 4 fois (vortex en canvas). |
| 8. Mise en ligne | 5/5 | GitHub et Vercel en place, protection retirée, noindex et X-Robots-Tag, page 404. |
| 9. Accessibilité | 4/5 | axe-core sans erreur, clavier, contrastes et zones tactiles conformes ; Safari reste à vérifier sur un Mac. |
| **Total** | **85/100** | |

## Points forts

- le moulinet relie tout : intro, en-tête, voile de transition, appel final manipulable, carton, chemin de la visite
- vortex de la dynamisation en canvas, piloté par le défilement et remuable du doigt
- carton par 6 panachable en six cases à la couleur de chaque vin, frais de port réels du bon de commande 2026
- heure réelle du coucher du soleil à Pujols, calculée chaque jour, sur les cartes et l'ouverture des visites
- ouverture de l'accueil qui change avec la saison

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mentions légales** : raison sociale, SIRET, directeur de la publication et politique de confidentialité à fournir avant la mise en ligne. Effort : faible.
2. **Photos** : les pleins cadres sont des photos de la famille : une séance photo aux vendanges élèverait l'ouverture et la page Le domaine. Effort : moyen.

### Finition

1. **Fluidité de l'accueil** : le vortex en canvas pèse au défilement sur un processeur lent : réduire le nombre de particules sous 4 cœurs. Effort : faible.
2. **Safari** : vérifier l'intro, le voile et le menu sur iPhone. Effort : faible.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 13 à regarder, 1 non lancé(s) |
| Ouverture de l'accueil (1366×768) | 2,7 s depuis le premier octet |
| Grille wouahou | 6 points présents sur 6 applicables |
