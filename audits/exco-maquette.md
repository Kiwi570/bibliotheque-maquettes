# exco-maquette

<https://exco-maquette.vercel.app> · audit du 13/11/2026 · dernier commit 7d27dda du 21/10/2026

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (19 pages sur 215, une de chaque gabarit, captures 1440 et 390, deux erreurs de console sur l'accueil) et lecture des captures et du code ; maquette v14 du 21 octobre, antérieure au script d'audit de la skill. Désignée parmi les maquettes les plus réussies par l'utilisateur le 13 novembre 2026. Pas d'audit externe : la note est à confirmer.

## Verdict

**88/100 · Prête à envoyer · 0 défaut bloquant**

Réseau d'experts-comptables : 215 pages dans un seul système sage et soigné, papier clair, bandes bleu nuit, Fraunces légère, une pointe d'orange. Ouverture « tableur » en WebGL, trouveur des 139 vrais cabinets sur la carte de France avec les horaires en direct, cycle de vie épinglé, cercle des 21 associés. Les pages intérieures (fiches cabinets, services, secteurs) sont au niveau de l'accueil, avec leurs propres schémas animés.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Le tableur relie l'ouverture et les schémas sans envahir ; le trouveur de cabinets est le vrai sujet du site. |
| 2. Direction artistique et harmonie | 14/15 | Palette et typographie tenues sur 215 pages, même carte d'appel et même pied de page partout ; photos des secteurs générées par Grok. |
| 3. Animations et effets | 12/15 | Photo qui se remplit en WebGL, lignes de la carte, cycle épinglé, Gantt de l'année comptable, chiffres et barres qui se remplissent ; sage par nature. |
| 4. Expérience ludique et interactions | 10/10 | Trouveur avec recherche, autour de moi, filtres et ouvert maintenant, rendez-vous en quatre étapes, tour de table, bilingue. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres ; carte et Gantt simplifiés sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | 139 fiches réelles de l'annuaire, textes repris d'exco.fr ; chiffres incohérents du site actuel signalés à confirmer. |
| 7. Technique et performance | 8/10 | Deux erreurs de console sur l'accueil ; GSAP, Lenis et OGL hébergés, 42 Mo de dépôt pour 215 pages. |
| 8. Mise en ligne | 5/5 | Plan du site, sitemap, robots en noindex, 404 aux couleurs avec recherche, image de partage. |
| 9. Accessibilité | 4/5 | Navigation au clavier, mouvement réduit respecté ; petits textes gris sur papier par endroits. |
| **Total** | **88/100** | |

## Points forts

- Un seul système tenu sur 215 pages.
- Le trouveur des 139 cabinets avec les horaires en direct.
- La photo qui se remplit comme un tableur.
- L'année comptable en diagramme qui se remplit.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Console** : deux erreurs sur l'accueil à corriger. Effort : petit.
2. **Photos** : secteurs et cycle de vie en images Grok : à remplacer par de vraies photos avant la mise en production. Effort : moyen.

### Finition

1. **Chiffres** : les mentions « À confirmer » à régler avec le client. Effort : petit.
