# catherine-becker-maquette

<https://catherine-becker-maquette.vercel.app> · audit du 20/11/2026 · dernier commit f573d65 du 20/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, passe des formats, puis complet après validation : 1 échec à 1000×560 sans JavaScript sur la page contact, corrigé en v1.1 et contrôlé à 0), inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Diététicienne nutritionniste à Cannes et à Nice. Direction « L'assiette du marché » : lin, olive et tomate, Young Serif et Outfit ; l'assiette compartimentée en inox de sa box relie le site (intro qui la remplit puis la pose sur la photo, méthode qui remplit un compartiment par étape, appel final). Vraies photos de la praticienne en grand, illustrations générées pour les ambiances du marché et de la Riviera.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro de l'assiette qui se remplit puis glisse à sa place, ouvertures fortes et toutes différentes (bandeau, prix géant qui défile, portrait en arche, carte de la côte, assiette vide de la 404) ; pas de grand effet spectaculaire. |
| 2. Direction artistique et harmonie | 14/15 | Palette tenue sur les six pages (lin, olive pour les bandes, tomate pour les boutons et un mot par titre), titres Young Serif francs, photos Grok cohérentes entre elles et avec les vraies photos du cabinet. |
| 3. Animations et effets | 12/15 | Une animation dans chaque section : assiette qui se remplit, ingrédients qui flottent, compteurs, jalons, cadran, inclinaisons à la vitesse, mots géants des médias, rideau olive entre les pages. |
| 4. Expérience ludique et interactions | 7/10 | Pile d'avis à lancer, calculateur des packs, cadran des horaires, puces des motifs ; l'assiette elle-même ne se manipule pas. |
| 5. Tous les formats | 14/15 | Premier écran tenu jusqu'au 320×568, au téléphone couché et au 1000×560 ; balayage de 320 à 1920 px sans débordement. |
| 6. Contenu et fiabilité | 9/10 | Tous les faits viennent du site actuel (tarifs, horaires, parcours, médias, avis réels tronqués sans promesse de poids) ; jours fériés sans statut faute d'horaires ; carte de la côte schématique. |
| 7. Technique et performance | 9/10 | Ouvertures sous 2,9 s, 0 % d'images lentes au défilement, moins de 0,6 s de calcul au chargement sur téléphone ralenti. |
| 8. Mise en ligne | 5/5 | En ligne sur l'adresse courte, protection Vercel désactivée, noindex, images de partage par page, vercel.json sans frame-ancestors. |
| 9. Accessibilité | 4/5 | axe-core sans erreur, contrastes et zones tactiles conformes ; boutons de la pile nommés sans JavaScript. |
| **Total** | **86/100** | |

## Points forts

- l'assiette compartimentée en inox, objet réel de son offre, devient l'intro, la méthode et l'appel final
- six ouvertures toutes différentes dans un seul système
- vraies photos de Catherine Becker en grand (cabinet, radio, télévision) et illustrations générées cohérentes
- horaires des deux cabinets à l'heure de Paris, formulés en positif, sans statut les jours fériés inconnus
- calculateur des packs vérifié par le script d'audit de 1 à 12 consultations

## Défauts

### Bloquants

Aucun.

### Importants

1. **Carte de la côte** : Dessin schématique un peu raide (le cap d'Antibes en V) : à adoucir ou remplacer par une vraie carte stylisée. Effort : 30 min.
2. **Safari** : Non vérifié ici : intro, voile, menu sur iPhone, formulaires. Effort : 15 min.

### Finition

1. **Assiette manipulable** : L'assiette pourrait se tourner à la main sur l'accueil. Effort : 1 h.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 1 échec(s), 25 à regarder, 1 non lancé(s) |
| Ouvertures | 2,5 à 2,9 s depuis le premier octet |
| Accueil | environ 9,5 écrans sur ordinateur |
