# jardins-hacienda-2-maquette

<https://jardins-hacienda-2-maquette.vercel.app> · audit du 26/11/2026 · dernier commit b4b85db du 25/11/2026

> Audit d'entrée en bibliothèque : mise à jour du 26 novembre 2026 (v7.16.0, commit b4b85db du 25 novembre) : rapport du script d'audit du projet (dernière passe complète ciblée sur /espace : 0 échec, 0 à regarder), CHANGELOG et notes de livraison v7.8.0 à v7.16.0, 255 tests, inventaire de la bibliothèque (12 pages, captures 1440 et 390) et lecture des captures. Remplace l'audit du 18 novembre (v7.7.1). Pas d'audit externe : la note est à confirmer.

## Verdict

**87/100 · Prête à envoyer · 0 défaut bloquant**

Restaurant, piscine et réceptions près de Metz : la journée de l'Hacienda sur de vraies photos du lieu, sans heures affichées. Depuis le 18 novembre, le site public est resté stable et l'espace restaurateur est devenu un véritable outil de gestion en démonstration : service et salle, réceptions avec propositions versionnées, offres à publier, traiteur et cartes cadeaux, huit démonstrations guidées et deux pages pour les clients. Impressionnant et testé, mais très long à produire et lourd.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Le Restaurant qui s'ouvre en plein écran, l'éphéméride qui s'arrache jusqu'au vrai décompte, le menu écrit à l'encre dorée, le carton de table tamponné. |
| 2. Direction artistique et harmonie | 13/15 | Vraies photos du lieu sur toutes les pages, crème, vert de nuit, brun chaud et rouge tenus ; beaucoup d'ambiances différentes d'une page à l'autre. |
| 3. Animations et effets | 14/15 | Feu animé d'une seule photo, assiette en couches, Saint-Sylvestre où chaque plat arrive avec son verre, espaces qui glissent, avis qui défilent. |
| 4. Expérience ludique et interactions | 10/10 | Outil de gestion complet (service, salle, réceptions, offres, traiteur, cartes cadeaux), huit démonstrations guidées, assistant, pages client, réservation en quatre étapes. |
| 5. Tous les formats | 14/15 | 0 échec et 0 à regarder sur la dernière passe complète de l'espace, 255 tests de fonctions et de parcours ; Safari à vérifier sur le Mac. |
| 6. Contenu et fiabilité | 8/10 | Vrais avis, vraies dates et vrais mariages ; plats de la Saint-Sylvestre et du traiteur en images générées, détails des menus à confirmer. |
| 7. Technique et performance | 6/10 | 0 échec, mais 163 Mo de dépôt et une vingtaine de versions en deux semaines. |
| 8. Mise en ligne | 5/5 | noindex, 404 « Cette page a fermé à minuit », images de partage, version ?v=7. |
| 9. Accessibilité | 3/5 | Axe sans défaut et clavier, mais mode calme retiré de la maquette. |
| **Total** | **87/100** | |

## Points forts

- L'outil de gestion du restaurant et ses huit démonstrations guidées.
- L'éphéméride des fêtes et le menu de Noël écrit à l'encre dorée.
- Réserver en quatre étapes, le carton de table et son tampon.
- Le feu de la vraie cheminée animé d'une seule photo.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mouvement** : mode calme retiré : respecter au moins le réglage « réduire les animations » du système. Effort : moyen.
2. **Safari** : vérifier l'ouverture, les transitions et l'espace dans Safari sur le Mac. Effort : petit.

### Finition

1. **Poids** : 163 Mo : compresser les photos sources et alléger les captures de livraison du dépôt. Effort : moyen.
2. **Images** : remplacer les plats générés par de vraies photos quand le restaurant les fournit. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 0 à regarder, 0 non lancé(s) |
