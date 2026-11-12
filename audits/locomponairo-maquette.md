# locomponairo-maquette

<https://locomponairo-maquette.vercel.app> · audit du 12/11/2026 · dernier commit 3dde4c3 du 12/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill v10.10 (complet en v2 ; standard sur toutes les pages en v3, avec un parcours de réservation propre au projet), regard du directeur artistique et regard neuf en v2, test « vrai visiteur » en v2, captures relues. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Version 3 : la réservation devient le moment fort. Direction « Quatre clés, quatre histoires » rendue réelle en v2 (clé en laiton dans la serrure, vraie porte d'entrée qui pivote sur la chambre choisie, vraie façade éclairée étage par étage, vraies photos des alentours) ; en v3, calendrier maison de deux mois et, à l'envoi, une fiche de réception où la clé gravée au prénom de la chambre tombe sur sa photo, les nuits en très grand. Toujours sans prix (aucun sur le site actuel).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | L'accueil s'ouvre sur la vraie porte d'entrée, qui pivote sur la chambre choisie ; la vraie façade s'éclaire étage par étage ; une clé en laiton tourne dans la serrure à l'intro. La réservation a maintenant son moment : la clé gravée tombe sur la photo de la chambre, les nuits en très grand, tampon « Demande prête ». |
| 2. Direction artistique et harmonie | 14/15 | Un seul langage : photos du lieu en grand, Fraunces, tomette, lie-de-vin, vert volet et laiton. Les images générées des alentours, du contact et de la 404 sont remplacées par de vraies photos. Séjour, Alentours et Réserver ouvrent encore sur une mise en page voisine. |
| 3. Animations et effets | 13/15 | Porte qui pivote en 3D au défilement, au clic et à la main ; bande de lumière qui suit l'étage ; chambres de la suite qui se rapprochent ; traits de laiton qui se tracent ; sarment en vraie vigne ; voile en serrure. |
| 4. Expérience ludique et interactions | 9/10 | Porte à ouvrir et prénoms à choisir, façade à parcourir, filtres du comparatif, tableau à clés en laiton, calendrier maison (plage et nuits sous la souris, clavier), fiche de réception qui suit la demande ; Séjour offre toujours peu à toucher. |
| 5. Tous les formats | 13/15 | Audit complet sur les 13 formats en v2 ; en v3, audit standard de toutes les pages à 0 échec et réservation testée au doigt (390 et 320 px) et au clavier (1366 × 768). Safari non lancé ici. |
| 6. Contenu et fiabilité | 8/10 | Faits revérifiés sur le site actuel : eau fraîche et biscuits remis, « gratuit » retiré pour le garage (le site dit aussi 8 €), surface de Denise masquée. Restent à fournir : mentions légales, confidentialité, tarifs, surface de Denise, tarif du garage. |
| 7. Technique et performance | 8/10 | Site statique généré, images WebP en plusieurs tailles notées pour leur beauté, fluidité dans le seuil sur processeur ralenti. Dépôt lourd à cause des photos d'origine. |
| 8. Mise en ligne | 4/5 | GitHub et Vercel en place, adresse courte pour le module Wix ; la protection Vercel est à couper par le client. |
| 9. Accessibilité | 3/5 | Contrastes, liens nommés, cibles de 44 px, formulaires étiquetés, calendrier au clavier, axe sans erreur sur les sept pages (il tourne de nouveau) ; le mode calme (réduire les animations) a été retiré à la demande du client. |
| **Total** | **86/100** | |

## Points forts

- Intro : une clé en laiton réaliste tourne dans la serrure, puis la page s'ouvre en trou de serrure sur la porte
- Ouverture sur la vraie porte d'entrée le soir : choisir Isabelle, Denise, Mathilde ou Suzanne la fait pivoter sur la photo de la chambre
- La vraie façade reste en place pendant qu'une bande de lumière monte du garage au 2e étage, chaque étage avec ses chambres
- Vraies photos du lieu et des alentours (Pont du Diable, Navacelles, gorges, vignes au couchant) à la place des images générées
- Réservation : la clé décrochée file jusqu'au récapitulatif, calendrier maison de deux mois, puis fiche de réception sur le lie-de-vin, clé gravée au prénom de la chambre et nuits en très grand
- Accueil ramené de 15,9 à 8,8 écrans, sans écran vide

## Défauts

### Bloquants

Aucun.

### Importants

1. **Pages intérieures encore sages** : Le couloir des chambres et la journée de Séjour sont longs et répétitifs ; Séjour, Alentours et Réserver ouvrent sur une mise en page voisine. Effort : 1 h 30.
2. **Regard du directeur artistique non refait** : Le second regard (REFAIRE à 2,88/5) a été suivi point par point à la demande du client, sans nouveau jugement extérieur de l'accueil. Effort : 20 min.
3. **Safari non testé** : WebKit n'a pas pu tourner ici : intro, porte, façade, voile, menu, calendrier et fiche de réception à vérifier dans Safari sur le Mac. Effort : 15 min.

### Finition

1. **Mode calme retiré** : À la demande du client : les visiteurs qui demandent moins d'animations sur leur appareil les verront quand même. Effort : choix du client.
2. **Contenus à fournir** : Mentions légales, confidentialité, tarifs (un prix « à partir de » compléterait la fiche de réception), surface de Denise, tarif du garage, photo de la 2 CV. Effort : côté client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 1 à regarder, 1 non lancé(s) |
| Premier audit standard | 206 échecs, dont 138 dus à la planche d'intention laissée à la racine ; tous corrigés |
| Audit complet de la version validée | 1 échec (fluidité de l'accueil, 10 %), corrigé ; relance ciblée : 0 échec, 8 % |
| Grille wouahou | 7 points sur 7 |
| Temps | 130 min de travail pour 145 prévues à la v1, 56 min d'audit complet et de corrections en v2 ; v3 : 52 min (calendrier, fiche, audits) |
| Audit de la v3 | standard ciblé sur Réserver : 3 échecs (deux contrastes, une section cachée jugée sans visuel), corrigés ; standard sur toutes les pages : 0 échec ; parcours de réservation propre au projet passé |
