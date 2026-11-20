# baugier-maquette

<https://baugier-maquette.vercel.app> · audit du 20/11/2026 · dernier commit 76e12b2 du 20/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, passe des formats, puis complet v1 : 0 échec, Safari non lancé), inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**84/100 · À peaufiner · 0 défaut bloquant**

Galerie claire « mur blanc des tanneries » pour un peintre abstrait : chaux, pierre, encre et un rouge brique, Instrument Serif. Les 113 vraies toiles du client portent tout le site, jamais recadrées ; l'accueil s'ouvre sur une toile qui se construit et propose un accrochage à l'échelle réelle.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro de la toile qui se construit case par case et accrochage à l'échelle forts ; les quatre salles sont belles mais sages, et les pages intérieures plus classiques. |
| 2. Direction artistique et harmonie | 13/15 | Palette tenue partout, typographie franche et élégante ; quelques sections typographiques sans image (acquérir, expositions). |
| 3. Animations et effets | 12/15 | Animations douces dans chaque section (grille, lumière de verrière, teinte du mur, ruban, année qui défile) ; la galerie épinglée a été retirée pour des flashs. |
| 4. Expérience ludique et interactions | 8/10 | Filtres, visionneuse avec loupe, voir au mur, accrochage avec choix de toile ; formulaire simulé prérempli. |
| 5. Tous les formats | 13/15 | Audit complet sans échec sur 13 tailles et sans JavaScript ; écran presque vide corrigé sur téléphone ; Safari à vérifier. |
| 6. Contenu et fiabilité | 9/10 | Relevé fidèle (Vautrin, 40 expositions, achats publics), 32 toiles sans légende affichées « Sans numéro », aucune information inventée. |
| 7. Technique et performance | 9/10 | Ouverture sous 2,8 s, aucune tâche longue, images WebP en tailles adaptées ; 35 Mo d'images au total. |
| 8. Mise en ligne | 4/5 | Prête pour Vercel (noindex, images de partage, données structurées) ; pas encore en ligne au moment de la fiche. |
| 9. Accessibilité | 4/5 | axe sans erreur, contrastes conformes, clavier et focus dans la visionneuse ; textes de 13 px dans les cartels. |
| **Total** | **84/100** | |

## Points forts

- Les vraies toiles en grand, à leur proportion exacte
- Accrochage à l'échelle réelle calé sur une photo mesurée en centimètres
- Catalogue de 113 œuvres filtrable avec lien direct par œuvre
- Système unique sur toutes les pages

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari** : Vérifier l'intro, le voile et le défilement dans Safari sur le Mac. Effort : 15 min.

### Finition

1. **Sections typographiques** : Acquérir, expositions et formulaire sans visuel : une petite toile ou une photo de l'atelier les relèverait. Effort : 20 min.
2. **Photos de l'atelier** : Photos anciennes en 1600 px : en demander de nouvelles au client. Effort : client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 11 à regarder, 1 non lancé(s) |
| Ouverture de l'accueil | 2,8 s depuis le premier octet |
| Accueil | environ 11 écrans sur ordinateur |
| Premier audit | 86 échecs (audit rapide), 0 à la version livrée |
