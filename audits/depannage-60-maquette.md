# depannage-60-maquette

<https://depannage-60-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 04ebee3 du 05/11/2026 (v2)

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (6 pages, captures 1440 et 390, aucune erreur de console), contrôle des fichiers de mise en ligne et lecture des captures ; le rapport du script d'audit n'est pas dans le dépôt. Pas d'audit externe : la note est à confirmer.

## Verdict

**87/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Deux réseaux » : l'eau en bleu, l'électricité en jaune, un tuyau et un câble qui courent dans la marge. Interrupteurs des pannes, vannes qui tournent, mur qui se fissure et questionnaire en carreaux de faïence : chaque section est un geste du métier. Même entreprise que Budgetravaux, avec une autre marque : les deux maquettes ne doivent pas se ressembler, et c'est le cas.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Eau qui coule en canvas, interrupteurs, vannes, mur fissuré sur les réseaux, chauffe-eau éclaté, carreaux de faïence : la maquette la plus riche en gestes du métier du lot. |
| 2. Direction artistique et harmonie | 13/15 | Bricolage Grotesque et Plex Mono, papier, bleu et jaune : franc et lisible ; images générées nombreuses. |
| 3. Animations et effets | 13/15 | Quatre sections épinglées différentes, galerie horizontale, ruban des communes, fil des deux réseaux. |
| 4. Expérience ludique et interactions | 10/10 | Interrupteurs des pannes avec prix, questionnaire qui mène à la prestation, 69 prestations filtrables avec recherche, commune à taper, rappel en quatre étapes. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les six pages ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 7/10 | Prestations et prix du site actuel ; e-mail, mentions et photos réelles à fournir. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, 2,9 Mo d'images (la plus lourde 161 Ko). |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=2 partout, images de partage, 404 aux couleurs ; X-Frame-Options encore présent dans vercel.json. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, accordéons natifs ; jaune sur papier à vérifier pour le contraste des petits textes. |
| **Total** | **87/100** | |

## Points forts

- Le tableau d'interrupteurs : chaque panne courante se rallume avec sa prestation et son prix.
- Les quatre vannes qui tournent pour les étapes, et le mur qui se fissure sur les deux réseaux.
- Le questionnaire en carreaux de faïence qui mène à la bonne prestation.
- L'eau qui coule du robinet dès l'ouverture.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Affichage dans Wix refusé** : vercel.json envoie encore X-Frame-Options : SAMEORIGIN. Retirer l'en-tête et pousser. Effort : petit.
2. **Script d'audit à relancer** : le rapport du script d'audit n'est pas dans le dépôt : relancer l'audit standard sur la v2. Effort : petit.

### Finition

1. **Contenus à fournir** : e-mail, mentions légales, photos de chantiers réels. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Pages publiques | 6 |
| Images servies | 114 fichiers, 2.9 Mo (la plus lourde : 161 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, X-Frame-Options présent (affichage dans Wix refusé) |
| Version des fichiers | ?v=2 |
