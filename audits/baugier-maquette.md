# baugier-maquette

<https://baugier-maquette.vercel.app> · audit du 23/11/2026 · dernier commit 966b855 du 23/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet v2 : 9 échecs corrigés puis 0 échec, Safari non lancé), aperçu en films, inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**89/100 · Prête à envoyer · 0 défaut bloquant**

Galerie claire « mur blanc des tanneries » pour un peintre abstrait : chaux, pierre, encre et un rouge brique, Instrument Serif. Les 113 vraies toiles du client portent tout le site, jamais recadrées. La v2 rend la visite plus ludique : la plus grande toile se dévoile entre des cotes d'architecte, les toiles des salles s'accrochent au défilement, l'appel final devient un mur d'accrochage en salon.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Intro de la toile qui se construit, grande toile entre ses cotes et mur d'accrochage en salon forts ; les pages intérieures restent plus classiques que l'accueil. |
| 2. Direction artistique et harmonie | 14/15 | Palette tenue partout, typographie franche et élégante ; acquérir a maintenant sa photo, seules les expositions et le formulaire restent sans image. |
| 3. Animations et effets | 13/15 | Une animation liée au métier dans chaque section (cotes qui se tracent, toiles qui s'accrochent avec un balancement, point qui suit la frise, barres des supports, compteurs) ; curseur « Voir » sur les toiles. |
| 4. Expérience ludique et interactions | 9/10 | Filtres, œuvre au hasard, visionneuse avec loupe, voir au mur avec cartel de musée, accrochage avec choix de toile, accordéon des expositions ; formulaire simulé prérempli. |
| 5. Tous les formats | 13/15 | Audit complet sans échec sur toutes les tailles et sans JavaScript ; plus aucun écran presque vide à l'aperçu ; Safari à vérifier. |
| 6. Contenu et fiabilité | 9/10 | Relevé fidèle (Vautrin, 40 expositions, achats publics, supports comptés sur le catalogue), 32 toiles sans légende affichées « Sans numéro », aucune information inventée. |
| 7. Technique et performance | 9/10 | Ouverture sous 3 s, aucune tâche longue, images WebP en tailles adaptées. |
| 8. Mise en ligne | 5/5 | En ligne sur Vercel sans protection, noindex, images de partage par page, données structurées. |
| 9. Accessibilité | 4/5 | axe sans erreur, contrastes conformes, clavier et focus dans la visionneuse, cibles tactiles de 44 px ; textes de 13 px dans les cartels. |
| **Total** | **89/100** | |

## Points forts

- Les vraies toiles en grand, à leur proportion exacte
- Accrochage à l'échelle réelle avec cartel de musée
- La plus grande toile dévoilée entre ses cotes de 240 et 145 cm
- Mur d'accrochage en salon pour l'appel final
- Système unique sur toutes les pages

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari** : Vérifier l'intro, le voile et le défilement dans Safari sur le Mac. Effort : 15 min.

### Finition

1. **Accueil long** : 12,8 écrans sur ordinateur (8 à 10 attendus) ; chaque écran porte une toile, mais une salle ou une section pourrait être resserrée. Effort : 20 min.
2. **Expositions et formulaire** : Sections encore sans visuel : une petite toile ou une photo de l'atelier les relèverait. Effort : 20 min.
3. **Photos de l'atelier** : Photos anciennes en 1600 px : en demander de nouvelles au client. Effort : client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 5 à regarder, 1 non lancé(s) |
| Ouverture de l'accueil | 2,9 s (intro de l'aperçu) |
| Accueil | 12,8 écrans sur ordinateur, 13,7 sur téléphone (15 et 11,5 en v1) |
| Audit v2 | 9 échecs au premier audit complet, 0 à la version livrée |
