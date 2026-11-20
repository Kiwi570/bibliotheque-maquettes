# premium-events-maquette

<https://premium-events-maquette.vercel.app> · audit du 20/11/2026 · dernier commit c0e6ae7 du 20/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, v1 : 0 échec), inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**88/100 · Prête à envoyer · 0 défaut bloquant**

Agence événementielle parisienne (hospitalités et expériences de marque, sport et divertissement). Direction « Coup d'envoi » : le noir, le blanc et le jaune du « & » du logo, la barre oblique de « /events » en intro et en voile, plus de 80 vraies photos d'événements en grand. Sept pages : accueil, réalisations filtrables, deux études de cas, engagements RSE, contact en 3 étapes, 404.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Intro « coupe » tirée du logo, photos fortes en grand, appel final « we create & deliver » ; pas d'objet signature à manipuler. |
| 2. Direction artistique et harmonie | 14/15 | Palette du logo tenue partout (clair dominant, noir pour les temps forts, jaune en accent), Archivo semi-large franche, traitement photo homogène. |
| 3. Animations et effets | 13/15 | Effets dans chaque section (métiers qui s'ouvrent en biais, parcours tracé, rangée PGW, plein écran, signature) ; galerie PGW ramenée sans épinglage. |
| 4. Expérience ludique et interactions | 7/10 | Filtres des métiers gardés dans l'adresse, demande en 3 étapes avec récapitulatif en direct ; peu de jeu au-delà. |
| 5. Tous les formats | 14/15 | Audit complet sur 13 tailles sans échec ; premiers écrans resserrés sur téléphone, à l'horizontale et à 1000×560. |
| 6. Contenu et fiabilité | 9/10 | Textes repris fidèlement du site, galeries légendées sans attribution inventée ; quelques points à confirmer (ancienneté, date EcoVadis). |
| 7. Technique et performance | 9/10 | 0 % d'images lentes, intro en 2,5 s, 0,3 à 0,7 s de calcul sur téléphone ralenti. |
| 8. Mise en ligne | 5/5 | noindex, partage 1200×630 par page, en-têtes Vercel, dépôt et Vercel en place. |
| 9. Accessibilité | 4/5 | axe-core sans erreur, focus visibles, cibles de 44 px ; Safari non vérifié ici. |
| **Total** | **88/100** | |

## Points forts

- Identité tirée du logo (barre oblique, « & » jaune) déclinée sans envahir
- Uniquement les photos du client, recadrées et légendées
- Deux études de cas sur un même modèle, chiffres vrais
- Audit complet sans échec dès la v1

## Défauts

### Bloquants

Aucun.

### Importants

1. **Objet à manipuler absent** : L'accueil se regarde plus qu'il ne se joue ; un geste du métier (badge d'accréditation, plan de salle) pourrait venir en v2. Effort : moyen.

### Finition

1. **Sections typographiques** : Clients et chiffres sans visuel : à garder sobres ou à illustrer par un logo client fourni. Effort : faible.
2. **Safari** : Intro, voile et menu à vérifier sur Mac et iPhone. Effort : faible.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 20 à regarder, 1 non lancé(s) |
| Pages | 7 |
| Photos du client | 83 emplacements, 0 image générée |
| Temps v1 | environ 2 h, dont 3 passes d'audit |
