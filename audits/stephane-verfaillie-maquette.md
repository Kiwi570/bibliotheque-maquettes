# stephane-verfaillie-maquette

<https://stephane-verfaillie-maquette.vercel.app> · audit du 16/11/2026 · dernier commit 4146864 du 16/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, v1 : 0 échec, Safari non lancé), inventaire de la bibliothèque et lecture des captures et des films de l'accueil. Pas d'audit externe : la note est à confirmer.

## Verdict

**82/100 · À peaufiner · 0 défaut bloquant**

Direction « Ça repart » pour un dépanneur informatique autour de Molsheim : fond clair, bleu nuit repris du logo et un seul accent, le voyant vert d'un ordinateur qui redémarre. Six pages au même niveau, une ouverture différente par page, des contenus entièrement réels (tarifs, horaires, avis) et une vraie carte des 274 communes à moins de 30 km. Sobre et tenue plus que spectaculaire.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 11/15 | Intro du bouton marche/arrêt qui s'allume puis glisse jusqu'à la pastille « dès 30 € », titre très grand ; sobre, sans grand moment spectaculaire. |
| 2. Direction artistique et harmonie | 13/15 | Palette tenue sur les six pages (clair, bleu nuit du logo, voyant vert), photos Grok bois clair cohérentes, Funnel Display franche. |
| 3. Animations et effets | 11/15 | Un effet par section : coches qui se tracent, cercle des 30 km, prix géant qui roule, ligne de balayage, frise des étapes, photo qui respire ; pas de scène épinglée forte. |
| 4. Expérience ludique et interactions | 8/10 | Carte réelle avec distance par commune, estimateur à partir des vrais tarifs, filtres gardés dans l'adresse, rendez-vous en cinq étapes relié à la frise. |
| 5. Tous les formats | 13/15 | Audit complet sur 13 tailles sans échec ; petits téléphones et sans JavaScript resserrés. |
| 6. Contenu et fiabilité | 9/10 | Tout vient du site actuel (tarifs, horaires, avis, références), distances calculées sur les contours officiels ; incohérences du site actuel signalées. |
| 7. Technique et performance | 9/10 | Pages générées, 0 erreur console, fluidité et vitesse passées, images WebP par taille. |
| 8. Mise en ligne | 4/5 | En ligne sur l'adresse courte ; protection Vercel à désactiver par l'utilisateur au moment de l'audit. |
| 9. Accessibilité | 4/5 | Contrastes, clavier, axe sans erreur ; statut annoncé sans parler à chaque minute. |
| **Total** | **82/100** | |

## Points forts

- Le voyant vert comme seule idée : intro, statut « joignable maintenant » calculé à l'heure de Paris, voile en iris bleu nuit
- Carte réelle des 274 communes à moins de 30 km de Molsheim (contours officiels du Bas-Rhin), distance de chaque commune
- Pages intérieures au niveau de l'accueil avec cinq ouvertures différentes (scindée, prix géant, plein cadre, nom centré, frise)
- Contenus tous réels, estimateur fondé sur les tarifs affichés, défauts du site actuel signalés au client

## Défauts

### Bloquants

Aucun.

### Importants

1. **Images Grok agrandies** : Cinq images livrées sous 1280 px ou floues ont été agrandies et affinées ; deux restent jugées floues en cartes. Effort : faible.
2. **Même photo d'atelier sur trois pages** : L'image de l'établi ouvert revient sur l'accueil, les tarifs et l'à propos. Effort : faible.

### Finition

1. **Safari** : Non vérifié ici (intro, texte de la pastille, liste des communes). Effort : faible.
2. **Avis sans texte** : La carte de Thibaut W. ne porte que des points forts. Effort : faible.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 30 à regarder, 1 non lancé(s) |
| Communes dans la zone | 274 à moins de 30 km de Molsheim |
| Temps de la v1 | environ 2 h 35, attentes comprises |
