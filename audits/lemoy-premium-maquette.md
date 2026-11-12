# lemoy-premium-maquette

<https://lemoy-premium-maquette.vercel.app> · audit du 12/11/2026 · dernier commit 67fc099 du 02/11/2026

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (78 pages dont 62 fiches produits, captures 1440 et 390, aucune erreur de console), audit et tests Playwright du projet (outils/audit_v4.py, tests.py) et lecture des captures ; maquette V2 antérieure au script d'audit de la skill. Pas d'audit externe : la note est à confirmer.

## Verdict

**84/100 · À peaufiner · 0 défaut bloquant**

Idée-maîtresse : la vitrine d'une maison de pâtisserie messine. Entremets sous cloche de verre, fiche pour chaque création avec ses couches et ses allergènes, commande en ligne et retrait à l'heure dite, saisons et fêtes calculées à la date du jour. Une boutique en ligne complète, raffinée et très juste, plus utile que spectaculaire.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 11/15 | Vraies photos superbes et cloches de verre ; accueil de boutique rangé, sans grand moment à l'ouverture. |
| 2. Direction artistique et harmonie | 14/15 | Cacao, or du logo, ruban bordeaux, Inter et Lora italique, arches : raffiné et propre à la maison. |
| 3. Animations et effets | 9/15 | Révélations, parallaxe douce, transitions de vue produit ; peu d'animation au défilement. |
| 4. Expérience ludique et interactions | 10/10 | Cloches à soulever, ballotin à remplir, pièce montée qui grandit, roue des saisons, galette des rois en 404, chasse aux fèves, panier et créneaux de retrait. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les 78 pages ; audit maison sur trois navigateurs et quatre largeurs. |
| 6. Contenu et fiabilité | 9/10 | Catalogue, prix, allergènes et horaires réels ; « à compléter » listés pour la maison (questionnaire). |
| 7. Technique et performance | 8/10 | JavaScript vanilla sans dépendance, aucune erreur ; 34 Mo d'images. |
| 8. Mise en ligne | 5/5 | noindex en maquette, sitemap, version des fichiers automatique, adresses propres. |
| 9. Accessibilité | 5/5 | 14 allergènes explicites, roue au clavier, erreurs de formulaire sur le champ, son désactivé par défaut. |
| **Total** | **84/100** | |

## Points forts

- Les entremets sous cloche de verre qu'on soulève pour lire la composition.
- Le ballotin à remplir bonbon par bonbon.
- La pièce montée qui grandit avec le nombre d'invités.
- Le store de la façade qui se déroule quand la boutique est ouverte.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Ouverture** : un premier écran de boutique attendu : il manque un moment fort (la cloche qui se lève, la vitrine qui s'allume). Effort : moyen.
2. **Poids** : 34 Mo d'images. Effort : moyen.

### Finition

1. **Coupe des gâteaux** : séquence « en coupe » à rétablir quand les vraies photos de tranche seront faites. Effort : moyen.
2. **Safari** : transitions de vue et panier à contrôler sous WebKit. Effort : petit.
