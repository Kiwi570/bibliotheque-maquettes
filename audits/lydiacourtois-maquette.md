# lydiacourtois-maquette

<https://lydiacourtois-maquette.vercel.app> · audit du 07/11/2026 · dernier commit ec56215 du 06/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, sur la v3 validée par l'utilisateur, 07/11/2026), journal du projet (trois versions), inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**80/100 · À peaufiner · 3 défauts bloquants**

Direction « Le plan et l'étoile » : papier sable d'architecte, encre bleu nuit et étoile d'or du logo, pour une géobiologue et praticienne du Feng Shui. Chaque page a son monde (chaux et olive, nuit et or, terre cuite, aube) et sa signature : boussole des neuf domaines à faire tourner, lumière rasante à promener sur un mur, grille des domaines sur la photo du salon, visite pièce par pièce. L'audit complet laisse trois défauts de formats (sans JavaScript en 320×568, téléphone à l'horizontale sur Feng Shui, mode calme en 320×568), tous bornés.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Intro de l'étoile tracée au compas qui se pose sur la page, voile en étoile à huit branches, boussole qui fait pivoter le plan, lumière rasante sur le mur : un monde propre à la cliente. |
| 2. Direction artistique et harmonie | 13/15 | Fraunces et Instrument Sans, sable, nuit et or ; un monde de couleur par page depuis la v2 ; photos de la cliente d'abord depuis la v3, illustrations générées mentionnées. |
| 3. Animations et effets | 12/15 | Titres lettre à lettre, titre tracé à la règle, fil doré, roue des éléments, grille épinglée en spirale, tarifs à rouleaux ; trois effets signalés « qui ne bougent pas » à une taille (domaines, porte, visite). |
| 4. Expérience ludique et interactions | 9/10 | Boussole à tourner, lumière à promener, grille des neuf domaines à toucher, visite pièce par pièce, demande en trois étapes préremplie avec tampon « Reçue ». |
| 5. Tous les formats | 9/15 | Audit complet : 39 échecs, sans JavaScript en 320×568 sur les six pages (liens de l'en-tête qui débordent, bouton principal hors du premier écran), domaines qui se chevauchent sur téléphone à l'horizontale (Feng Shui), « 20+ » sur son libellé en mode calme 320×568 ; tout le reste passe. |
| 6. Contenu et fiabilité | 7/10 | Textes et offres du site actuel ; tarifs contradictoires du site à confirmer, neuf domaines à confirmer, aucun témoignage inventé, portrait réel à fournir. |
| 7. Technique et performance | 8/10 | Aucune erreur de console ; ouvertures en 2,6 à 2,7 s ; fluidité sans alerte ; 3,7 Mo d'images (la plus lourde 151 Ko) ; plus de décalage au chargement depuis la v3. |
| 8. Mise en ligne | 5/5 | noindex et X-Robots-Tag, ?v=3 partout, images de partage par page, 404 aux couleurs, affichable dans Wix. |
| 9. Accessibilité | 4/5 | Mode calme complet avec bouton, clavier et menu conformes ; un chevauchement en mode calme sur petit téléphone. |
| **Total** | **80/100** | |

## Points forts

- L'étoile-boussole des neuf domaines : on la fait tourner, le plan de la maison pivote avec elle.
- Un monde par page : chaux et olive, nuit et or, terre cuite, aube, chacun avec sa signature.
- La lumière rasante qu'on promène sur le mur de la page Géobiologie.
- La grille des neuf domaines posée en lignes d'or sur la photo du salon, qui s'allume en spirale.

## Défauts

### Bloquants

1. **Sans JavaScript sur petit téléphone** : en 320×568, la rangée de liens de l'en-tête déborde sur les six pages et pousse le bouton principal et l'information clé hors du premier écran (corrigé d'office par le socle de la skill v10.4 : lien Menu sans JavaScript). Effort : petit.
2. **Feng Shui à l'horizontale** : en 844×390, les noms des neuf domaines se chevauchent dans la grille (mode normal et sans JavaScript). Effort : petit.
3. **Chiffre du parcours en mode calme** : accueil, 320×568, mode calme : « 20+ » chevauche son libellé. Effort : petit.

### Importants

1. **Effets à vérifier** : domaines qui s'allument, porte du bagua et visite pièce par pièce signalés « ne bougent pas » à une taille par l'audit : à regarder. Effort : petit.
2. **Safari non vérifié** : intro, voile en étoile et menu à contrôler sur le Mac et un iPhone réel. Effort : petit.

### Finition

1. **Informations à fournir** : mentions légales, tarifs définitifs, noms des neuf domaines, portrait, témoignages réels, horaires. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 39 échec(s), 5 à regarder, 1 non lancé(s) |
