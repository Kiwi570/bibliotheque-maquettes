# agence-ae-maquette

<https://agence-ae-maquette.vercel.app> · audit du 06/11/2026 · version finale v4

> Audit d'entrée en bibliothèque : rapport du script d'audit complet de la skill (v4 : 0 échec, 7 à regarder, Safari non lancé), journal du projet (quatre versions), contrôle des fichiers de mise en ligne et lecture des captures de l'audit. Safari et iPhone réel non vérifiés.

## Verdict

**87/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Course du soleil » : la conception bioclimatique rendue tangible. Un soleil à saisir rééclaire la photo d'ouverture en WebGL, une maison bois en 3D se construit au défilement, la coupe bioclimatique suit les vrais angles du soleil à Quimper, un cadran solaire filtre les 23 projets, et la course du soleil relie toutes les pages dans la marge. Spectaculaire et juste pour une architecte de l'écoconstruction ; mentions, numéro d'Ordre et statut des perspectives 3D de projets restent à fournir.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Photo rééclairée par un soleil à saisir, maquette 3D qui se construit et pivote, photo qui s'ouvre en plein écran, carrousel 3D courbe : tout est tiré du métier (lumière, matière, maquette d'architecte). |
| 2. Direction artistique et harmonie | 13/15 | Newsreader et Manrope, crème, ardoise, ocre et soleil tenus partout, logo réel en masque ; accueil long (douze sections), quelques illustrations d'ambiance générées. |
| 3. Animations et effets | 14/15 | Trois scènes épinglées, planches, mots géants réactifs à la vitesse, titres lettre à lettre, ombres portées selon l'heure ; une scène qui démarrait trop tôt corrigée en v3. |
| 4. Expérience ludique et interactions | 9/10 | Soleil à saisir, maison à faire tourner, soleil de la coupe manipulable, cadran qui filtre, carrousel à la main, carte des communes, rendez-vous en cinq étapes tamponné « Reçu ». |
| 5. Tous les formats | 12/15 | Audit complet sur tous les formats : 21 échecs au premier passage (téléphone à l'horizontale, petits écrans sans JavaScript, mur épinglé à 1366×768), corrigés en v4 ; Safari et iPhone réel non vérifiés (intro, voile, maquette 3D, carrousel). |
| 6. Contenu et fiabilité | 8/10 | Textes, projets et chiffres sourcés du site actuel ; deux promesses chiffrées reformulées pour la déontologie ; mentions, Ordre, assurance, témoignage complet et statut des perspectives 3D à fournir. |
| 7. Technique et performance | 8/10 | Aucun échec de console ni de mesure ; ouverture en 2,7 à 2,9 s intro comprise ; aucune image lente sauf sur l'accueil (4 % sur ordinateur ralenti 4 fois) ; 0,26 à 0,81 s de calcul au chargement sur téléphone ralenti ; 323 fichiers d'images en plusieurs tailles, la plus lourde 277 Ko. |
| 8. Mise en ligne | 5/5 | noindex et X-Robots-Tag, aucun X-Frame-Options (affichage dans Wix possible), ?v=4 partout, images de partage, 404 aux couleurs. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, axe-core, cibles de 44 px, visionneuse au clavier (Échap, focus rendu), formulaire étiqueté ; bandeaux de mots évidés décoratifs exclus du contraste. |
| **Total** | **87/100** | |

## Points forts

- L'ouverture de l'accueil : le soleil se lève sur « agence ae », rejoint l'arc de la photo, et le visiteur le fait glisser pour rééclairer la Maison T-G (aube, jour, couchant, nuit).
- « Une maison bois se monte en quatre temps » : maquette 3D en CSS qui se construit au défilement, tourne et se fait pivoter à la main avec élan.
- La coupe bioclimatique épinglée aux angles réels de Quimper (65°, 42°, 19°), soleil manipulable.
- Réalisations : cadran solaire qui filtre, carrousel 3D, visionneuse avec lien propre par projet.
- Le fil du soleil de 6 h à 21 h dans la marge, qu'on tire pour voyager dans la page.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari et iPhone à vérifier** : intro, voile en iris, menu, maquette 3D et carrousel 3D n'ont pas pu être lancés sous WebKit. Effort : petit.
2. **Informations à fournir** : mentions légales et confidentialité, numéro d'inscription à l'Ordre, attestation d'assurance, témoignage complet, statut (projet ou réalisé) et origine des perspectives 3D de projets. Effort : petit.

### Finition

1. **Retours arrière et avant** : léger saut d'image (environ 80 ms) au retour sur l'accueil et sur Réalisations. Effort : petit.
2. **Rechargement au milieu de la page** : L'Atelier et Réalisations ne reviennent pas exactement au même écran (6 à 9 % de différence). Effort : petit.
3. **Accueil long** : douze sections ; à alléger si le client veut arriver plus vite aux projets. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Pages publiques | 6 (accueil, réalisations, l'atelier, convictions, contact, 404) |
| Images servies | 323 fichiers en plusieurs tailles, 23 Mo au total (la plus lourde : 277 Ko) |
| Illustrations générées | 10, toutes marquées « Illustration générée » |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, sans X-Frame-Options |
| Version des fichiers | ?v=4 |
| Audit du script | complet, 28 min, 6 pages, tous les formats : 0 échec, 7 à regarder, Safari non lancé |
| Ouverture | 2,7 à 2,9 s depuis le premier octet, intro comprise |
| Calcul au chargement | 0,26 à 0,81 s (téléphone ralenti) |
| Journal | 4 versions (journaux/agence-ae-maquette.json) |
