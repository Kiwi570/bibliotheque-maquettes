# pmg-maintenance-maquette

<https://pmg-maintenance-maquette.vercel.app> · audit du 23/11/2026 · dernier commit 824bc88 du 23/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet, v2, puis relance ciblée), inventaire de la bibliothèque et lecture des captures Pas d'audit externe : la note est à confirmer.

## Verdict

**89/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Au bord du toit » : neige, glace et nuit, un orange de sécurité, Archivo étendu. Une ligne de toit relie le site (ampoules C9 qui s'allument, glaçons qu'on fait fondre à la vapeur, gouttière qui coule) ; une façade illustrée en code s'allume aux couleurs choisies, toutes les autres images sont de vraies photos du client.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Intro qui trace la ligne de toit et allume les ampoules, ouverture de nuit sur une vraie maison illuminée, façade illustrée qui s'allume en ouverture de la page Lumières ; pas d'effet WebGL. |
| 2. Direction artistique et harmonie | 14/15 | Palette neige, glace et nuit tenue sur les six pages, un seul orange, la façade dessinée dans les mêmes tons, une ouverture propre à chaque page. |
| 3. Animations et effets | 13/15 | Ampoules, neige qui s'écarte sous la souris, glaçons qui fondent sous la vapeur, frise qui se trace, raclette sur le bandeau, rivière tracée, eau dans la gouttière ; premier écran de l'accueil encore sobre. |
| 4. Expérience ludique et interactions | 9/10 | Façade à composer avec interrupteur, vapeur à manier (bouton, survol, doigt), repère des 24 po avec pluie et alerte, avant/après, recherche de ville, estimation où chaque service allume une ampoule. |
| 5. Tous les formats | 14/15 | Aucun échec à l'audit complet après corrections (404 sur écrans bas, zones tactiles, contraste de la frise, fluidité de l'accueil). |
| 6. Contenu et fiabilité | 9/10 | Uniquement des faits du site actuel, citations réelles par langue, incohérences signalées (charges de neige, 2014 ou 2015) ; la façade est légendée comme illustration. |
| 7. Technique et performance | 8/10 | Site statique généré, décor de la façade en fichier SVG, boucles en pause hors écran, fluidité de l'accueil juste sous le seuil ; changements brusques au retour arrière. |
| 8. Mise en ligne | 5/5 | En ligne sur Vercel, noindex, images de partage par page. |
| 9. Accessibilité | 4/5 | axe sans erreur, contrastes vérifiés, interrupteur et vapeur au clavier, mouvement réduit respecté. |
| **Total** | **89/100** | |

## Points forts

- La ligne de toit, idée tirée du métier, reprise à quelques endroits seulement
- La façade dessinée en code qui s'allume aux couleurs choisies, sans aucune image générée
- Les glaçons qu'on fait fondre à la vapeur, qui disent la méthode mieux qu'un texte
- Les vraies photos de chantier de vapeur et de maisons illuminées en grand

## Défauts

### Bloquants

Aucun.

### Importants

Rien à signaler.

### Finition

1. **Sections typographiques** : Avis, FAQ, contact et appels finaux sans photo sur téléphone. Effort : 20 min.
2. **Retour arrière** : Changements brusques relevés sur l'accueil et Toiture (aperçus flous au retour). Effort : 15 min.
3. **Fluidité de l'accueil** : Juste sous le seuil sur processeur lent : ne pas ajouter d'animation continue sans calque à part. Effort : —.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 12 à regarder, 0 non lancé(s) |
