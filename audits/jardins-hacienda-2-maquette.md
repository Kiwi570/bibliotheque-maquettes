# jardins-hacienda-2-maquette

<https://jardins-hacienda-2-maquette.vercel.app> · audit du 11/11/2026 · dernier commit e4c4fda du 11/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard en deux passages, puis complet sur 13 tailles et contre-audit ciblé), test « vrai visiteur » (7 missions, téléphone et ordinateur), regard neuf d'un relecteur séparé, inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Version 7 de « De midi à minuit » : la même journée à l'heure de la maison, nourrie de 21 vraies photos du site actuel et de 17 modules restaurant de la bibliothèque, chacun posé à un endroit et à une heure précis (l'ardoise à la craie de la semaine, une vraie assiette du chef qui se dresse en couches, la vapeur sur l'assiette devant la cheminée, la vitre givrée de la Saint-Sylvestre, le ciel réel de Moineville derrière la vraie enseigne). La saison réelle choisit l'ouverture de l'accueil (la piscine et son eau l'été, la salle aux baies vitrées et son soleil l'hiver, retour du client) ; La carte et la 404 ont enfin leur scène ; la galerie générique de l'après-midi devient un panorama du domaine qui passe de 14 h 30 à 19 h.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Idée visible en 5 s (12:00 sur la piscine l'été, dans la salle aux baies vitrées l'hiver, une intro qui devient l'heure réelle, de nuit « la maison dort ») et des moments forts tirés du métier : l'ardoise qui s'efface au chiffon pour écrire le dîner, la vraie assiette qui se dresse, la vapeur qui s'écarte sous la main, la vitre givrée ; l'en-tête d'accueil reste de facture classique. |
| 2. Direction artistique et harmonie | 13/15 | Vraies photos du lieu dans toutes les pages intérieures (salle, pergola, piscine, enseigne détourée, cèpes), retouchées claires ; craie Caveat seulement sur l'ardoise ; plus de cadres à bordure (réservation et formulaire en lignes, ticket dentelé). Trois images générées gardées à l'accueil (12:00, 19:00, 23:00) parce que l'eau et la terrasse en trois états en ont besoin. Plus de violet : le soir est vert de nuit (Réceptions, dîner, terrasse). |
| 3. Animations et effets | 14/15 | WebGL (eau, givre, bougie), vapeur en canvas qui s'écarte sous la main, ciel calculé (soleil, lune, étoiles), panorama épinglé dont la lumière suit l'heure, assiette en couches au défilement, dépliant 3D du menu de Noël, rideau de palmes à l'arrivée sur Réceptions, voile en dégradé entre deux heures. |
| 4. Expérience ludique et interactions | 9/10 | Chaque page a quelque chose à toucher : eau, vapeur, givre, ardoise (bascule midi/soir), curseur du ciel, verre des accords, cadran des horaires, carte de placement qui s'envole, carte cadeau, bougie de la 404 ; réservation toujours en deux validations. |
| 5. Tous les formats | 13/15 | Audit complet sur 13 tailles corrigé (texte sur le titre de la Saint-Sylvestre, scènes épinglées sur écran bas, givre différé) ; légende du panorama dédiée au téléphone ; petits téléphones encore serrés. |
| 6. Contenu et fiabilité | 8/10 | Faits du relevé exacts, agenda tiré des affiches du site (côte de bœuf, raclette, brunch, soirée libanaise), Noël et Saint-Sylvestre sans heure inventée ; détails de la carte et des menus repris de la v5 encore à confirmer. |
| 7. Technique et performance | 7/10 | OGL et Caveat chargés à la demande, givre installé seulement au repos et l'hiver ; page La carte lente à être prête sur ordinateur d'après le visiteur ; dépôt lourd (photos sources, couches de l'assiette). |
| 8. Mise en ligne | 5/5 | Même déploiement Vercel (noindex, images de partage par page, données structurées), version ?v=7 sur tous les fichiers. |
| 9. Accessibilité | 4/5 | Contrôles axe sans défaut, mode calme complet (aucun effet WebGL), ardoise annoncée (aria-live), consignes au clavier ; contraste sur photo du bandeau d'été encore juste. |
| **Total** | **86/100** | |

## Points forts

- Des modules accrochés à une heure et à un geste,Dix-sept modules restaurant de la bibliothèque, un par endroit, chacun justifié par le métier (ardoise, passe, cheminée, vitre de décembre, ciel du lieu) : la journée reste une histoire, pas une suite de gadgets.
- La vraie assiette qui se dresse,La photo d'une assiette du chef découpée en couches qui se posent nettes sur la même assiette floue, puis la photo entière : le module garde son geste sans illustration plate.
- Les vraies photos du lieu,21 photos du site actuel retenues sur 366, recadrées et éclaircies ; l'enseigne détourée devant le ciel réel de Moineville.
- Le feu d'une seule vraie photo,Les flammes de la photo de la cheminée ondulent (bandes décalées par une onde qui monte), la lueur vacille sur la salle, les braises partent du foyer mesuré dans le repère de la photo.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Réserver en deux validations** : Vérifier puis Confirmer (logique de la v5) : 5 gestes et 5 champs pour réserver, « Vérifier » sous l'écran sur ordinateur. Effort : 1 h.
2. **Textes à confirmer** : Ardoise de la semaine, détails de la carte et des menus des fêtes repris ou rédigés pour la maquette : à valider avec l'établissement. Effort : 15 min avec l'établissement.

### Finition

1. **Trois images générées à l'accueil** : 12:00, 19:00 et 23:00 restent des illustrations (mention « Illustration générée ») : une vraie photo de la piscine de face et trois prises de la terrasse au même cadrage les remplaceraient. Effort : photos du client.
2. **Encart du plan de salle** : L'encart collant du plan de salle et quelques zones calmes entre les sections relevés par le regard neuf. Effort : 1 h.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 1 à regarder, 0 non lancé(s) |
| Audit complet (13 tailles) | v7.3 : 0 échec, 15 points à regarder traités ou acceptés (rechargement au milieu de La carte décalé d'un écran, contraste mesuré sous le 19:00 de Réceptions) ; v7 : 7 échecs au premier passage, corrigés |
| Fluidité | Les fêtes : 1 % d'images lentes, tâche la plus longue 103 ms (ordinateur ralenti 4 fois) ; accueil 5 % |
| Test visiteur | 13 missions réussies sur 14 avant corrections ; la soirée sur ordinateur (dates cachées derrière une photo) corrigée |
| Regard neuf (points de la v6) | 8 réglés, 7 en partie, 3 non avant corrections ; la plupart corrigés |
| Modules restaurant | 17 placés sur 46, 8 déjà présents sous une autre forme, le reste écarté avec sa raison (_audit/modules-restau-v7.md) |
| Retour du client (v7.1) | l'hiver, plus de piscine en avant sur l'accueil ni sur Infos ; vapeur de 21 h rendue visible ; contre-audit vert |
| Retours du client (v7.2) | accueil d'hiver réordonné (coin du feu à 19 h sur la vraie cheminée animée, terrasse d'été en fin de page), assiettes qui fument à 12 h 30, vert nuit à 21 h ; contre-audit vert |
