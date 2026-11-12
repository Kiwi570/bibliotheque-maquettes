# qd2a-maquette

<https://qd2a-maquette.vercel.app> · audit du 12/11/2026 · dernier commit c56007c du 12/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill v10.10 (complet sur 14 formats, sans JavaScript, calme, films, fluidité, puis quatre relances ciblées), regard neuf sur tout le site (_suivi/regard-neuf-v4.md) et lecture des captures Pas d'audit externe : la note est à confirmer.

## Verdict

**89/100 · Prête à envoyer · 0 défaut bloquant**

v4 : tout le site suit l'identité « Les visages du Q » de l'accueil. Les pages intérieures quittent le tapuscrit sous la lampe : l'appel s'ouvre sur trois vrais visages du comité tirés au sort, la saison montre ses 26 titres en sommaire trié par pays, les têtes de l'Hydre sont des visages, le contact donne l'adresse et la vraie façade. L'envoi d'un texte est un vrai e-mail avec la fiche, plus aucun formulaire factice. Audit complet sans échec (29 au premier passage), regard neuf de tout le site à l'appui.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Le Q du logo fait des visages du comité reste l'ouverture signature ; chaque page intérieure a désormais la sienne sur la même identité (trois lecteurs tirés au sort, têtes de l'Hydre en visages, sommaire des 26). Pas d'effet 3D spectaculaire. |
| 2. Direction artistique et harmonie | 14/15 | Une seule identité de l'accueil à la 404 : couleurs du logo par comité, crème et prune, un seul bouton d'envoi. Une seule image générée reste (la servante de la 404) ; les autres images sont celles du Quartier (visages, peintures, façade, couvertures). |
| 3. Animations et effets | 12/15 | Intro qui assemble le logo, formes à écarter, visages qui se regroupent, trajet épinglé fluide, cartes de lecteurs qui tournent au tirage, titres du sommaire qui glissent à leur place, cous de l'Hydre qui se dessinent. Moins d'effets au défilement sur les pages intérieures qu'en v1 (lampe, route et pile retirées). |
| 4. Expérience ludique et interactions | 9/10 | Formes du Q à attraper, filtres du comité, tapuscrit à feuilleter, tirage de trois autres lecteurs, sommaire trié par pays, quatre objets qui ouvrent la messagerie. |
| 5. Tous les formats | 14/15 | Audit complet sans échec : 320×568 à 1920×1080, téléphone à l'horizontale, sans JavaScript et mode calme ; 29 échecs au premier passage, tous corrigés. Safari non vérifié. |
| 6. Contenu et fiabilité | 9/10 | Faits remis d'aplomb (lectures dans trois pays, plus de prix inventé, environ 200 textes par saison, citation signée, 28 mentions pour 26 textes expliquées). Six visages canadiens découpés dans l'affiche du comité, accord des membres et crédits à confirmer. |
| 7. Technique et performance | 9/10 | 0 % d'images lentes au défilement sur toutes les pages (ordinateur ralenti et téléphone), aucune tâche longue ; six images générées retirées du dépôt. |
| 8. Mise en ligne | 5/5 | En ligne sur qd2a-maquette.vercel.app, dépôt relié à Vercel, images de partage par page sur le Q aux visages. |
| 9. Accessibilité | 4/5 | axe-core et contrôles intégrés sans échec, textes d'au moins 12 px, formes du Q et filtres au clavier. Pas de test avec un vrai lecteur d'écran. |
| **Total** | **89/100** | |

## Points forts

- Toutes les pages sur les vrais visages du comité, plus de tapuscrit sous la lampe
- L'envoi d'un texte est un vrai e-mail avec l'objet et la fiche, partout
- Le sommaire des 26 textes lisible d'un coup d'œil, trié par pays
- Les têtes de l'Hydre sont des visages, aux couleurs de leur comité
- Audit complet sans échec et 0 % d'images lentes sur toutes les pages

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari et iPhone non vérifiés** : intro, voile en clip-path, formes du Q en SVG, cartes qui tournent et tapuscrit 3D à ouvrir dans Safari et sur un iPhone. Effort : 15 min.
2. **Portraits et crédits** : accord des membres, originaux des six visages canadiens (basse définition), crédits de la façade et des peintures à demander au Quartier. Effort : dépend du client.

### Finition

1. **Effets au défilement des pages intérieures** : le tirage des lecteurs, le sommaire et les têtes de l'Hydre réagissent au clic ou sur ordinateur seulement ; un effet au défilement de plus sur l'appel et la saison. Effort : 30 min.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 3 à regarder, 0 non lancé(s) |
| Regard neuf de tout le site (avant la v4) | 3,17/5 (appel 2,38, accueil 3,88), corrections faites |
| Hauteur des pages sur ordinateur | accueil 9,5 · saison 7,5 (12 avant) · appel 5 (8 avant) · Hydre 6 · contact 3,3 écrans |
| Échecs au premier audit complet | 29, ramenés à 0 en quatre relances ciblées |
| Fluidité | 0 % d'images lentes sur toutes les pages |
