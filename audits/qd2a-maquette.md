# qd2a-maquette

<https://qd2a-maquette.vercel.app> · audit du 12/11/2026 · dernier commit a0a989f du 12/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill v10.10 (rapide par page, standard, relance ciblée), regard du directeur artistique sur les films de l'accueil (v1 puis v2) et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**85/100 · Prête à envoyer · 0 défaut bloquant**

v2 « Les visages du Q » : l'accueil ouvre sur le logo du Quartier dont les six formes sont remplies des 46 vrais visages des comités, de la lauréate et des coups de cœur ; on en attrape les formes. Les couleurs du logo, une par comité, tiennent tout le site ; l'accueil suit le trajet d'un texte, de l'e-mail aux lectures de juin. Regard du directeur artistique : 3,9 sur 5 (contre 2,9 pour la v1). Audit standard sans échec ; ni audit complet (choix de l'utilisateur) ni Safari.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture unique et vraie : le Q du logo fait des visages du comité, manipulable, posé par l'intro. Le reste de l'accueil est plus calme (mur des visages, trajet d'un texte), sans effet 3D spectaculaire. |
| 2. Direction artistique et harmonie | 13/15 | Palette du logo tenue sur toutes les pages (une couleur par comité), Fraunces et Recursive. Quelques illustrations générées bleutées restent sur l'appel et l'Hydre, moins en accord avec l'aubergine. |
| 3. Animations et effets | 12/15 | Intro qui assemble le logo, formes à écarter avec élan et en profondeur, visages qui se regroupent par comité, trajet épinglé de l'e-mail à la scène, petit Q qui se reconstitue section par section. Moins de familles modernes que la v1. |
| 4. Expérience ludique et interactions | 9/10 | Formes du Q à attraper (souris, doigt, clavier), filtres du comité, tapuscrit à feuilleter, pile filtrable, dépôt en trois étapes, trois lecteurs tirés au hasard. |
| 5. Tous les formats | 12/15 | Audit standard sans échec (320×568, 390×844, 844×390, 768×1024, 1366×768, 1920×1080, calme, sans JavaScript). Audit complet non lancé (choix de l'utilisateur), Safari non vérifié. |
| 6. Contenu et fiabilité | 9/10 | Faits du relevé, « à compléter » retirés du corps des pages, aucun nombre de lecteurs par comité inventé. Portraits des membres repris du site actuel : accord à confirmer. |
| 7. Technique et performance | 8/10 | 0 à 2 % d'images lentes au défilement, 0,38 à 0,76 s de calcul au chargement sur téléphone ralenti, ouverture sous 2,9 s. Logo vectorisé et mosaïques précalculées. |
| 8. Mise en ligne | 5/5 | En ligne sur qd2a-maquette.vercel.app, dépôt relié à Vercel, images de partage par page (le Q aux visages pour l'accueil). |
| 9. Accessibilité | 4/5 | axe-core et contrôles intégrés sans échec, formes du Q en boutons au clavier, légende visible sans interaction. Pas de test avec un vrai lecteur d'écran. |
| **Total** | **85/100** | |

## Points forts

- Le Q du logo rempli des vrais visages du comité, à attraper
- Une couleur du logo par comité, tenue de l'accueil à l'Hydre
- Le trajet d'un texte de l'e-mail à la scène, avec le vrai e-mail et les vraies étapes
- Accueil ramené à 9,5 écrans (15 en v1) sans écran vide
- Plus aucun des marqueurs déjà vus (carrousel 3D, mots géants, crayon dans la marge)

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari et iPhone non vérifiés** : intro, voile en clip-path, formes du Q en SVG et tapuscrit 3D à ouvrir dans Safari et sur un iPhone. Effort : 15 min.
2. **Portraits des membres** : accord des membres et crédits à demander au Quartier ; portraits du comité canadien (2 sur le site, 8 sur l'affiche). Effort : dépend du client.

### Finition

1. **Illustrations des pages intérieures** : les images générées bleutées de l'appel et de l'Hydre s'accordent moins à la palette du logo que l'accueil. Effort : 30 min.
2. **Audit complet** : non lancé à la demande de l'utilisateur ; à lancer avant un envoi au client. Effort : 45 min.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 2 à regarder, 0 non lancé(s) |
| Regard du directeur artistique | v1 : REFAIRE 2,9/5 · v2 : AJUSTER 3,9/5, ajustements faits |
| Hauteur de l'accueil | 9,5 écrans sur ordinateur, 13,7 sur téléphone |
| Calcul au chargement (téléphone ralenti) | 0,38 à 0,76 s selon la page |
| Échecs au premier audit rapide | 44, ramenés à 0 |
