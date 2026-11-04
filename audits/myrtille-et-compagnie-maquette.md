# myrtille-et-compagnie-maquette

<https://myrtille-et-compagnie-maquette.vercel.app> · audit du 04/11/2026 · dernier commit a14d7e0 du 04/11/2026

> Audit de livraison : script d'audit de la skill (niveau standard, version ?v=3) et relecture pendant la construction. Pas encore d'audit externe : la note est à confirmer.

## Verdict

**82/100 · À peaufiner · 0 défaut bloquant**

Direction « Encre de myrtille » tenue de bout en bout : carnet d'interprète crème et violet, images révélées par une tache de jus de myrtille, mots qui se « traduisent », myrtilles à lancer. Script d'audit : 0 échec sur 7 pages (mesures, écran, mouvement, bords, tient dans l'écran). Reste à surveiller : la fluidité sur ordinateur lent et Safari, non vérifié par le script.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro « La goutte » enchaînée sur la tache WebGL de l'ouverture, ondes qui répondent au pointeur, myrtilles en physique, tirage qui se développe : univers propre au métier ; certains effets (traduction, prix) ne se voient qu'une fois. |
| 2. Direction artistique et harmonie | 12/15 | Fraunces et Instrument Sans, papier crème, encre et pruine : cohérent sur toutes les pages ; images Grok et photos du site étalonnées ensemble, mais peu de vraies photos de Carole. |
| 3. Animations et effets | 11/15 | 14 effets du plan, tous présents et calmés en mode calme ; au profil ordinateur lent du script (CPU ×4, molette), 10 à 24 % d'images longues sur l'accueil et Communications (la v1 mesurée le même jour donne autant) ; téléphone sans image longue. |
| 4. Expérience ludique et interactions | 9/10 | Demande en 5 étapes avec erreurs, formule préremplie, total en direct et envoi simulé une fois ; myrtilles à attraper et lancer ; témoignages à faire glisser ; ruban avec pause. |
| 5. Tous les formats | 13/15 | 0 débordement, sections épinglées qui tiennent dans l'écran (1000×560 compris), contrôle des bords sur 6 formats ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 8/10 | Textes du site actuel, six témoignages réels, rien d'inventé ; durée, format du retour, IDE, crédits photo et nLPD marqués « à fournir ». |
| 7. Technique et performance | 8/10 | Aucune erreur de console, WebP en srcset, WebGL monté seulement au repos et caché quand rien ne bouge ; fluidité ordinateur au seuil (critère 3). |
| 8. Mise en ligne | 5/5 | noindex dans les pages et X-Robots-Tag dans vercel.json, ?v=3 partout, images de partage 1200×630, 404 aux couleurs du site, robots.txt. |
| 9. Accessibilité | 4/5 | Mode calme et « réduire les animations » respectés, axe-core sans erreur, focus visible, cibles de 44 px ; traînée du curseur et ondes à confirmer pour les personnes sensibles au mouvement. |
| **Total** | **82/100** | |

## Points forts

- La tache de jus de myrtille comme fil visuel : chaque image se révèle par une tache WebGL (repli CSS), puis l'ouverture vit avec des ondes violettes.
- Des myrtilles en physique à attraper et lancer (bande en bas de l'accueil, bol sur les pages intérieures), qui s'endorment quand rien ne bouge.
- La photo reçue qui se développe comme un tirage dans une section épinglée : les étapes de la communication racontées par l'image.
- Page Formation honnête (aucune session pour le moment) avec les témoignages suspendus à un fil qui se balancent.

## Défauts

### Bloquants

Aucun relevé par le script.

### Importants

1. **Fluidité sur ordinateur lent** : accueil et Communications, profil CPU ×4 à la molette, 10 à 24 % d'images au-delà de 50 ms. Même ordre de grandeur sur la v1 mesurée dans les mêmes conditions : à revoir sur une vraie machine. Pistes : réduire la résolution du canvas de l'aura (dpr 0,7 sur ordinateur), retarder le montage de la bande de myrtilles. Effort : moyen.
2. **Safari et iPhone réel non vérifiés** : le script tourne sous Chromium. À contrôler : tache WebGL, masque de la vague du voile, section épinglée de la Formation. Effort : petit.

### Finition

1. **Effets qui ne bougent pas au défilement** (relevés « à regarder ») : traduction des titres, cartes de prix, aura de Communications : effets joués une fois à l'entrée ou au pointeur, comptés à part. Effort : petit.
2. **Contenus à fournir** : durée et délai d'une communication, format du retour, téléphone, adresse et IDE, crédits photo, politique nLPD, kinésiologie à mentionner ou non. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit (standard, 7 pages) | 0 échec, 8 à regarder |
| Contrôles passés | mesures 77, balayage 6, bords 6, tient dans l'écran 8, mouvement 10, effets du plan 14, souris immobile 11 |
| Fluidité ordinateur lent / téléphone | 10 à 24 % d'images longues / aucune |
| Version des fichiers | ?v=3 |
