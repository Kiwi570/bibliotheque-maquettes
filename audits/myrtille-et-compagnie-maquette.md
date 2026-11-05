# myrtille-et-compagnie-maquette

<https://myrtille-et-compagnie-maquette.vercel.app> · audit du 05/11/2026 · dernier commit ebb6c68 du 05/11/2026 (v4)

> Audit de livraison : script d'audit de la skill (standard, version ?v=4, puis étapes corrigées relancées) et regard neuf d'un second agent sur les 87 captures de la v3. Pas encore d'audit externe : la note est à confirmer.

## Verdict

**85/100 · À peaufiner · 0 défaut bloquant**

v4 « regard neuf et bibliothèque » : chaque page a son ouverture (fini le gabarit commun), Carole apparaît dès le premier écran de l'accueil, la tache est réservée à trois moments et les autres images deviennent des tirages. Mécaniques reprises de la bibliothèque : rature au stylo (« On lui prête nos mots »), composeur de formule (Communications), lampe au pointeur (404), garde-fou de fluidité. Script d'audit : 0 échec hors fluidité sur ordinateur lent.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Tache WebGL et ondes plus discrètes, ratures écrites à la main, myrtilles à lancer, tirage qui se développe, 404 à la lampe : une idée par page, toutes tirées du métier. |
| 2. Direction artistique et harmonie | 13/15 | Carnet crème et encre tenu partout ; ouvertures différentes par page ; tirages et étiquettes papier au lieu de pastilles d'interface ; encore beaucoup d'images générées faute de photos de clientes. |
| 3. Animations et effets | 11/15 | 17 effets du plan présents et calmés en mode calme ; au profil ordinateur lent (CPU ×4, molette) 23 % d'images longues sur l'accueil (v1 et v3 au même niveau), aucune au téléphone. |
| 4. Expérience ludique et interactions | 10/10 | Composeur (la situation conseille l'approche, total en direct, demande préremplie), demande en 5 étapes, myrtilles, témoignages à faire glisser, lampe de la 404, certificat qui s'agrandit. |
| 5. Tous les formats | 13/15 | 0 débordement ni recouvrement, épinglages qui tiennent dans l'écran, formulaire au premier écran au téléphone ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 8/10 | Textes et tarifs du site actuel ; exemples de la section « Interpréter » à valider par Carole ; un seul témoignage client ; données légales « à fournir ». |
| 7. Technique et performance | 8/10 | Aucune erreur de console, WebGL monté au repos et caché quand rien ne bouge, garde-fou de fluidité ; fluidité ordinateur au seuil (critère 3). |
| 8. Mise en ligne | 5/5 | noindex et X-Robots-Tag, ?v=4 partout, images de partage 1200×630, 404 aux couleurs du site. |
| 9. Accessibilité | 4/5 | Mode calme respecté, axe-core sans erreur, cibles de 44 px, dialog natif, annonce du total aux lecteurs d'écran ; animations nombreuses pour les personnes sensibles au mouvement. |
| **Total** | **85/100** | |

## Points forts

- Ouverture de l'accueil incarnée : le chien recadré dans la tache, et la signature de Carole (psychologue depuis plus de 20 ans, Master de l'Université de Lausanne).
- « On lui prête nos mots. Il a les siens. » : le métier d'interprète montré par des ratures au stylo.
- Composeur de Communications qui oriente au lieu de lister des prix, avec la demande préremplie.
- Doublons supprimés : un témoignage, des repères et des cartes de prix chacun à un seul endroit.

## Défauts

### Bloquants

Aucun relevé.

### Importants

1. **Fluidité sur ordinateur lent** : accueil, profil CPU ×4 à la molette, 23 % d'images au-delà de 50 ms (même niveau qu'en v1 et v3). Pistes : couper l'onde de la photo « échange » sous un certain débit, monter la bande de myrtilles plus tard. Effort : moyen.
2. **Preuves** : un seul témoignage client, peu de vraies photos ; à demander à la cliente (3 à 5 témoignages nommés, photos d'animaux de clientes). Effort : petit côté maquette.
3. **Safari et iPhone réel non vérifiés.** Effort : petit.

### Finition

1. Questions fréquentes : pas de bouton principal au premier écran (choix assumé : les questions d'abord).
2. Effets joués une fois (traduction des titres, cartes de prix, aura de Communications) relevés « à regarder ».

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit (standard puis étapes corrigées) | 0 échec hors fluidité ordinateur lent |
| Fluidité ordinateur lent / téléphone | 23 % d'images longues sur l'accueil (autres pages ≤ 1 %) / aucune |
| Ouverture (premier octet → titre), accueil | ≈ 2,8 s |
| Version des fichiers | ?v=4 |
