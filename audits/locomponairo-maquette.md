# locomponairo-maquette

<https://locomponairo-maquette.vercel.app> · audit du 12/11/2026 · dernier commit d9a5abe du 12/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill v10.10 (complet, v2), regard du directeur artistique sur l'accueil et regard neuf sur toutes les pages par deux agents séparés, test « vrai visiteur » refait, captures relues. Pas d'audit externe : la note est à confirmer.

## Verdict

**84/100 · À peaufiner · 0 défaut bloquant**

Version 2, après un audit complet et le regard de deux directeurs artistiques extérieurs : direction « Quatre clés, quatre histoires » gardée, mais rendue réelle. L'intro fait tourner une clé en laiton dans la serrure ; l'accueil ouvre sur la vraie porte d'entrée, qui pivote sur la chambre choisie, puis la vraie façade s'éclaire étage par étage avec ses chambres ; vraies photos des alentours à la place des images générées ; accueil ramené à 8,8 écrans. Plus juste et plus belle que la v1 ; la réservation reste sans prix ni calendrier maison.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | L'accueil s'ouvre sur la vraie porte d'entrée, qui pivote sur la chambre choisie ; la vraie façade s'éclaire étage par étage ; une clé en laiton tourne dans la serrure à l'intro. Plus juste et plus beau que la v1 ; la réservation n'a pas encore de moment fort (ni prix ni calendrier maison). |
| 2. Direction artistique et harmonie | 14/15 | Un seul langage : photos du lieu en grand, Fraunces, tomette, lie-de-vin, vert volet et laiton. Les images générées des alentours, du contact et de la 404 sont remplacées par de vraies photos. Séjour, Alentours et Réserver ouvrent encore sur une mise en page voisine. |
| 3. Animations et effets | 13/15 | Porte qui pivote en 3D au défilement, au clic et à la main ; bande de lumière qui suit l'étage ; chambres de la suite qui se rapprochent ; traits de laiton qui se tracent ; sarment en vraie vigne ; voile en serrure. |
| 4. Expérience ludique et interactions | 8/10 | Porte à ouvrir et prénoms à choisir, façade à parcourir, filtres du comparatif réparés, tableau à clés en laiton, formulaire en trois étapes ; Séjour offre toujours peu à toucher. |
| 5. Tous les formats | 13/15 | Audit complet sur les 13 formats, corrigé puis relancé (ciblé sur l'accueil et la 404, standard sur toutes les pages). Safari non lancé ici. |
| 6. Contenu et fiabilité | 8/10 | Faits revérifiés sur le site actuel : eau fraîche et biscuits remis, « gratuit » retiré pour le garage (le site dit aussi 8 €), surface de Denise masquée. Restent à fournir : mentions légales, confidentialité, tarifs, surface de Denise, tarif du garage. |
| 7. Technique et performance | 8/10 | Site statique généré, images WebP en plusieurs tailles notées pour leur beauté, fluidité dans le seuil sur processeur ralenti. Dépôt lourd à cause des photos d'origine. |
| 8. Mise en ligne | 4/5 | GitHub et Vercel en place, adresse courte pour le module Wix ; la protection Vercel est à couper par le client. |
| 9. Accessibilité | 3/5 | Contrastes, liens nommés, cibles de 44 px, formulaires étiquetés ; le mode calme (réduire les animations) a été retiré à la demande du client. |
| **Total** | **84/100** | |

## Points forts

- Intro : une clé en laiton réaliste tourne dans la serrure, puis la page s'ouvre en trou de serrure sur la porte
- Ouverture sur la vraie porte d'entrée le soir : choisir Isabelle, Denise, Mathilde ou Suzanne la fait pivoter sur la photo de la chambre
- La vraie façade reste en place pendant qu'une bande de lumière monte du garage au 2e étage, chaque étage avec ses chambres
- Vraies photos du lieu et des alentours (Pont du Diable, Navacelles, gorges, vignes au couchant) à la place des images générées
- Réservation au tableau de la réception : la clé décrochée file jusqu'au récapitulatif, tampon « Demande prête »
- Accueil ramené de 15,9 à 8,8 écrans, sans écran vide

## Défauts

### Bloquants

Aucun.

### Importants

1. **Réservation sans moment fort** : Pas de prix (aucun sur le site actuel), dates en champs natifs, fiche de réception discrète ; un calendrier maison et un prix « à partir de » donné par la maison changeraient la fin du parcours. Effort : 1 h.
2. **Pages intérieures encore sages** : Le couloir des chambres et la journée de Séjour sont longs et répétitifs ; Séjour, Alentours et Réserver ouvrent sur une mise en page voisine. Effort : 1 h 30.
3. **Safari non testé** : WebKit n'a pas pu tourner ici : intro, porte, façade, voile et menu à vérifier dans Safari sur le Mac. Effort : 15 min.

### Finition

1. **Mode calme retiré** : À la demande du client : les visiteurs qui demandent moins d'animations sur leur appareil les verront quand même. Effort : choix du client.
2. **Contenus à fournir** : Mentions légales, confidentialité, tarifs, surface de Denise, tarif du garage, photo de la 2 CV. Effort : côté client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 0 à regarder, 0 non lancé(s) |
| Premier audit standard | 206 échecs, dont 138 dus à la planche d'intention laissée à la racine ; tous corrigés |
| Audit complet de la version validée | 1 échec (fluidité de l'accueil, 10 %), corrigé ; relance ciblée : 0 échec, 8 % |
| Grille wouahou | 7 points sur 7 |
| Temps | 130 min de travail pour 145 prévues à la v1, plus 56 min d'audit complet et de corrections |
