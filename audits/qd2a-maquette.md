# qd2a-maquette

<https://qd2a-maquette.vercel.app> · audit du 07/11/2026 · dernier commit c44d26d du 07/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, 6 pages, 0 échec), passe des formats, regard neuf et lecture des captures et des films Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Le Tapuscrit » : papier ivoire, encre, crayon rouge du lecteur et bleu stylo, avec une page à l'encre (l'appel à textes) et une page bleu encre (l'Hydre). Le comité de lecture devient un geste : on feuillette le tapuscrit lauréat à la main, on fait pivoter la table de lecture, on feuillette la pile des 26 textes. Six pages, 0 échec à l'audit complet ; Safari et un vrai iPhone restent à vérifier.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture forte (nom tapé à la machine puis tapuscrit qui se feuillette à la main avec élan et annotations au crayon), table de lecture 3D et pile des 26 tapuscrits : un vrai geste du métier par page. Moins spectaculaire sur contact et l'Hydre, plus classiques. |
| 2. Direction artistique et harmonie | 13/15 | Univers papier cohérent sur tout le site (Fraunces, Recursive machine et main, crayon rouge, tampons, cachets), deux pages à fond sombre qui varient le rythme. 17 illustrations générées, dont certaines un peu attendues (lampes, pupitres). |
| 3. Animations et effets | 13/15 | Voile « page » qui se tourne, intro qui file vers l'objet, fil de crayon dans la marge, ratures, frappe en direct, mot à mot, WebGL qui ondule, bandeaux réactifs à la vitesse : riche et lié au métier. Quelques révélations au défilement restent génériques. |
| 4. Expérience ludique et interactions | 9/10 | Tapuscrit, table et carrousel à manipuler (souris, doigt, clavier), pile filtrable par pays gardée dans l'adresse, dépôt en trois étapes qui part dans une enveloppe tamponnée « Reçu », lumière au pointeur. |
| 5. Tous les formats | 13/15 | Passe des formats et audit complet sans échec (1366×768, 390×844, téléphone à l'horizontale, tablette), mode calme vérifié. Safari et iPhone réel non lancés : intro, voile et scènes 3D à confirmer. |
| 6. Contenu et fiabilité | 8/10 | Textes, lauréat, sélection, coups de cœur, lectures et partenaires repris du site actuel ; une phrase fausse corrigée au regard neuf. Mentions légales, montant du prix et lieux des lectures à fournir, manifeste de l'accueil résumé. |
| 7. Technique et performance | 8/10 | Site statique généré, images WebP en variantes, 0 % d'images lentes au défilement (molette et doigt), 0,4 à 0,6 s de calcul au chargement sur téléphone ralenti. Rechargement au milieu de l'accueil : écran différent à 15 %. |
| 8. Mise en ligne | 5/5 | En ligne sur qd2a-maquette.vercel.app, dépôt GitHub relié à Vercel, intégrable dans un module Wix (pas de X-Frame-Options), images de partage par page. |
| 9. Accessibilité | 4/5 | axe-core et contrôles intégrés sans échec (contrastes, cibles de 44 px, clavier, aria-label des liens, décor masqué aux lecteurs d'écran). Pas de test avec un vrai lecteur d'écran. |
| **Total** | **86/100** | |

## Points forts

- Le tapuscrit lauréat qu'on feuillette à la main dès l'ouverture, annotations au crayon sur chaque page lue
- Table de lecture 3D qui raconte la méthode du comité (fiches, tampons, sélection, lauréat)
- Pile des 26 tapuscrits à feuilleter au défilement, filtrable par pays
- Voile « page » et fil de crayon rouge qui tiennent tout le site ensemble
- Dépôt d'un texte avec un vrai retour physique (enveloppe, rabat, tampon « Reçu »)

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari et iPhone non vérifiés** : intro, voile en clip-path et scènes 3D (preserve-3d) à ouvrir sur un vrai iPhone et dans Safari avant l'envoi au client. Effort : 15 min.
2. **Contenus à fournir** : mentions légales, montant du prix, lieux des lectures et texte intégral du manifeste. Effort : dépend du client.

### Finition

1. **Rechargement au milieu de l'accueil** : l'écran rechargé diffère à 15 % de l'écran parcouru (scènes épinglées). Effort : 20 min.
2. **Pages contact et Hydre** : moins de gestes du métier que l'accueil, la saison et l'appel. Effort : 1 h.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 3 à regarder, 1 non lancé(s) |
| Calcul au chargement (téléphone ralenti) | 0,43 à 0,62 s selon la page |
| Images lentes au défilement | 0 % (molette et doigt) |
| Échecs au premier audit standard | 133, ramenés à 0 en 4 relances |
