# madebymelody-maquette

<https://madebymelody-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 449379d du 05/11/2026 (v2)

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, livré avec la v2), inventaire de la bibliothèque (6 pages, captures 1440 et 390, aucune erreur de console) et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Face A / Face B » tenue de bout en bout : un disquaire rock où chaque pièce est une piste, du rose poudré au noir et cerise. Vinyle WebGL à faire tourner à la main, sillon lu dans la marge, bac à feuilleter, boutique filtrable avec panier simulé : sept modules de la bibliothèque viennent de cette maquette. Il reste l'en-tête qui empêche l'affichage dans Wix et les informations à fournir.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Vinyle WebGL à l'étiquette photo, à lancer à la main et scratché au défilement, intro platine qui glisse jusqu'à l'objet de chaque page, sillon lu par une pointe : un univers entier tiré du métier et de la marque. |
| 2. Direction artistique et harmonie | 13/15 | Fraunces et DM Mono, noir, crème, rose et cerise ; une ouverture différente par page ; collages et images générées nombreuses dans l'univers et le sur-mesure. |
| 3. Animations et effets | 13/15 | Iris de transition, bascule face A / face B épinglée, titre brodé, tulle WebGL, ruban : variés et calmés en mode calme ; un rechargement au milieu de la page à regarder. |
| 4. Expérience ludique et interactions | 10/10 | Disque à faire tourner, bac à feuilleter, 29 pièces filtrables, fiche en pochette avec lien direct, panier simulé partagé entre onglets, mélangeur à trois faders, prénom brodé, rendez-vous en trois étapes. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les six pages, sections épinglées qui tiennent dans l'écran ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 7/10 | Textes et pièces du site actuel ; numéros et mesures des pièces, mentions légales, TVA, livraison et retours à fournir ; pas de vrai portrait de Melody. |
| 7. Technique et performance | 8/10 | Aucune erreur de console ; 30,7 Mo d'images au total (la plus lourde 640 Ko), servies au fil de la boutique ; WebGL limité à l'ouverture et au sur-mesure. |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=2 partout, images de partage, 404 aux couleurs ; X-Frame-Options encore présent dans vercel.json. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, formulaires étiquetés ; disque et tulle animés à confirmer pour les personnes sensibles au mouvement. |
| **Total** | **86/100** | |

## Points forts

- Le vinyle de l'accueil : l'étiquette est une vraie photo, il se lance à la main avec son élan et passe en face B au défilement.
- Le sillon de la marge, lu par une pointe : chaque section devient une plage numérotée, sur toutes les pages.
- La boutique en bac à disques : pochettes à feuilleter, fiche en pochette double avec son propre lien, panier simulé.
- Le mélangeur à trois faders et le prénom brodé : deux jeux tirés du vocabulaire de la créatrice.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Affichage dans Wix refusé** : vercel.json envoie encore X-Frame-Options : SAMEORIGIN, la maquette affiche « refused to connect » dans le module Wix. Retirer l'en-tête et pousser. Effort : petit.
2. **Safari et iPhone réel non vérifiés** : Disque WebGL, tulle et iris de transition à contrôler sous WebKit. Effort : petit.

### Finition

1. **Rechargement au milieu de la page** : relevé « à regarder » par le script : vérifier que la page reprend à la bonne section, sans voile. Effort : petit.
2. **Informations à fournir** : mentions légales, IDE, TVA, numéros et mesures des pièces, livraison, retours, portrait. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard du 05/11/2026 : 0 échec(s), 1 à regarder |
| Pages publiques | 6 |
| Images servies | 329 fichiers, 30.7 Mo (la plus lourde : 640 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, X-Frame-Options présent (affichage dans Wix refusé) |
| Version des fichiers | ?v=2 |
