# jardins-hacienda-2-maquette

<https://jardins-hacienda-2-maquette.vercel.app> · audit du 11/11/2026 · dernier commit 0cc7532 du 11/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, 13 tailles, tous les modes, puis relances ciblées : 0 échec), test « vrai visiteur » en deux passages, regard neuf d'un relecteur, inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Refonte complète (v6) « De midi à minuit » : l'accueil est une journée à l'Hacienda réglée sur les vraies heures de la maison, de la piscine dont l'eau bouge sous le doigt au coin du feu, et chaque page intérieure a son heure (voile, intro, horloge et lumière accordés). Dix illustrations générées cohérentes, deux boucles vidéo, vraies photos en petit ; logique de réservation, plan de salle, carte cadeau et accords de la v5 gardés.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Idée visible en 5 s (12:00 sur la piscine, « minuit au coin du feu ») et trois moments forts (terrasse qui s'allume sur ses vraies ampoules, fenêtre du feu qui s'ouvre en plein écran, eau touchable) ; l'en-tête d'accueil (surtitre, titre en deux lignes, deux boutons) reste proche des maquettes précédentes. |
| 2. Direction artistique et harmonie | 12/15 | Lumière qui passe du blanc de midi à la braise de minuit, typographie Instrument Serif et Bricolage aux axes animés ; dix images générées pour huit sections et sept pages, donc quelques reprises, et deux ouvertures intérieures de même composition. |
| 3. Animations et effets | 13/15 | WebGL (eau), scène épinglée en trois états, plein écran, braises en canvas, intro qui devient l'heure de la page, voile à l'heure d'arrivée, compte à rebours, trait qui se dessine ; la galerie de l'après-midi reste une galerie horizontale classique. |
| 4. Expérience ludique et interactions | 8/10 | Eau, ampoules, braises, carton de réservation qui s'envole, verre des accords, cadran 24 h, carte cadeau qui s'écrit, carton de réception tamponné ; La carte et la 404 n'ont rien à toucher. |
| 5. Tous les formats | 13/15 | Audit complet sans échec sur 13 tailles (320 à 1920, paysage, calme, sans JavaScript, sans WebGL) après corrections ; recadrages téléphone dédiés pour la terrasse ; petits téléphones serrés. |
| 6. Contenu et fiabilité | 8/10 | Faits du relevé exacts (horaires, prix, adresse, menus des fêtes) ; quelques détails de la carte et du menu de la Saint-Sylvestre repris de la v5 restent à confirmer ; capacités et prix des réceptions « sur demande ». |
| 7. Technique et performance | 8/10 | 5 % d'images lentes au défilement sur ordinateur ralenti ×4, aucune tâche au-delà de 250 ms ; vidéos chargées à l'écran seulement, jamais sur téléphone en portrait ; dépôt lourd (sources Grok et vidéos). |
| 8. Mise en ligne | 5/5 | En ligne sur Vercel, noindex, images de partage par page, données structurées, README de mise en ligne définitive. |
| 9. Accessibilité | 4/5 | Contrôles axe sans défaut, mode calme complet, clavier, cibles tactiles ; contrastes sur image retouchés à l'audit complet ; champs de date au format du navigateur. |
| **Total** | **83/100** | |

## Points forts

- Une idée de métier qui organise tout le site : l'heure (voile, intro, horloge, lumière, ouverture de chaque page).
- La terrasse qui passe du couchant à la nuit sur trois états de la même image, puis s'allume ampoule par ampoule sur les vraies ampoules relevées dans l'image.
- La saison réelle partout (« Piscine et terrasse de juin à septembre », Les fêtes qui s'ouvrent sur l'hiver ou l'été).
- Boucles vidéo recadrées exactement comme leurs images ; vapeur masquée sur la fumée, l'assiette reste nette.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Réserver en 7 gestes** : Vérifier puis Confirmer et choix de la table après la confirmation (logique gardée de la v5) : hors barème du test visiteur. Effort : 1 h.
2. **Ouvertures intérieures proches** : Réceptions, Infos et 404 d'une part, Les fêtes et Offrir d'autre part partagent une composition (image pleine, grande heure, texte en bas à gauche). Effort : 2 h.
3. **Textes à confirmer** : Détails de la carte et du menu de la Saint-Sylvestre absents du relevé résumé (repris de la v5). Effort : 15 min avec l'établissement.

### Finition

1. **La carte sans scène propre** : Écran partagé et grand index : rien à manipuler, la page la plus sage. Effort : 2 h.
2. **Galerie de côté générique** : L'après-midi d'été défile à l'horizontale comme ailleurs (point 6 de la grille à regarder). Effort : 1 h.
3. **Boucles flamme et crépuscule écartées** : Livrées en 672 px, trop floues en grand ; une version HD animerait le coin du feu et Offrir. Effort : 30 min.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 1 à regarder, 0 non lancé(s) |
| Audit complet | 0 échec après corrections (13 au premier passage) |
| Test visiteur | 7 missions réussies sur téléphone et ordinateur ; arrivée sans geste ; réserver 7 gestes |
| Fluidité | 5 % d'images lentes, plus longue tâche < 250 ms |
