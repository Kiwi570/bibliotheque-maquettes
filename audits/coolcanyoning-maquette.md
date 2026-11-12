# coolcanyoning-maquette

<https://coolcanyoning-maquette.vercel.app> · audit du 12/11/2026 · dernier commit ff20700 du 12/10/2026

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (13 pages, captures 1440 et 390, aucune erreur de console), audit Playwright propre au projet (outils/audit.py) et lecture des captures ; maquette antérieure au script d'audit de la skill. Pas d'audit externe : la note est à confirmer.

## Verdict

**87/100 · Prête à envoyer · 0 défaut bloquant**

Idée-maîtresse « la descente » : faire défiler la page, c'est descendre le canyon, l'altimètre de la marge compte les mètres et le pied de page annonce « Vous êtes au fond ». Illustration plate (falaises ocre, vasque turquoise, corde orange) et Big Shoulders en capitales géantes. Très ludique : canyon-mètre, mini-jeu du rappel, pont de singe, comparateur topo / photo.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Ouverture illustrée nette et propre au métier, titre géant, coupe du canyon où le personnage suit l'eau. |
| 2. Direction artistique et harmonie | 13/15 | Calcaire, ombre, corde orange et turquoise, Big Shoulders et Outfit : énergique et cohérent ; pages de secteur répétitives. |
| 3. Animations et effets | 12/15 | Coupe épinglée, défilement horizontal des canyons, profils tracés, manifeste qui s'éclaire ; pas de voile entre les pages. |
| 4. Expérience ludique et interactions | 10/10 | Canyon-mètre, mini-jeu du rappel jouable au clavier, pont de singe, comparateur topo / photo, calculateur de groupe, cotation V/A/I, son de rivière. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les treize pages, barre d'action collante au téléphone. |
| 6. Contenu et fiabilité | 8/10 | Canyons, tarifs et avis du site actuel ; quatre canyons en photos d'autres sorties et une via ferrata générée, signalés ; mode relecture. |
| 7. Technique et performance | 9/10 | JavaScript natif sans bibliothèque, aucune erreur, 4,4 Mo d'images. |
| 8. Mise en ligne | 5/5 | Pages générées, version des fichiers, sitemap, robots, 404 aux couleurs. |
| 9. Accessibilité | 4/5 | Jeux et curseurs au clavier, curseur personnalisé seulement à la souris. |
| **Total** | **87/100** | |

## Points forts

- L'altimètre de la marge qui compte la descente jusqu'à « Vous êtes au fond ».
- La coupe du canyon en cinq obstacles, le personnage suit le chemin de l'eau.
- Le canyon-mètre qui désigne le bon canyon.
- Le mini-jeu du rappel, jusque sur la 404.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Photos** : quatre canyons illustrés par d'autres sorties, une via ferrata générée, pas de portrait de Yann. Effort : moyen.
2. **Transitions** : aucun voile entre les pages : la descente s'arrête à chaque clic. Effort : moyen.

### Finition

1. **Pages de secteur** : Verdon, Nice et Haut-Var sur la même mise en page. Effort : moyen.
2. **Safari** : épinglages et jeu à contrôler sous WebKit. Effort : petit.
