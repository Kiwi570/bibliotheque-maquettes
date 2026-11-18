# jardins-hacienda-2-maquette

<https://jardins-hacienda-2-maquette.vercel.app> · audit du 18/11/2026 · dernier commit 9a8c0ac du 18/11/2026

> Audit d'entrée en bibliothèque : mise à jour du 18 novembre 2026 (v7.7.1, commit 9a8c0ac) : rapport du script d'audit du projet (dernière passe complète ciblée sur /espace : 0 échec, 7 à regarder ; passes précédentes v7.5.24 à v7.5.26 sur toutes les pages : 0 échec), journal et CHANGELOG du projet, inventaire de la bibliothèque (10 pages, captures 1440 et 390) et lecture des captures. Remplace l'audit du 13 novembre (v7.5.8, 86/100). Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Restaurant, piscine et réceptions près de Metz : la journée de l'Hacienda sur de vraies photos du lieu, sans heures affichées. Depuis le 13 novembre, toutes les pages intérieures ont été reprises une à une avec le client : Les fêtes avec son éphéméride et son menu écrit à l'encre dorée, Réceptions et ses vrais mariages, Réserver en quatre étapes avec le carton de table, et un espace restaurateur de démonstration qui modifie le site en direct. Très riche et soignée, mais très longue à produire et lourde.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Le Restaurant qui s'ouvre en plein écran, l'éphéméride qui s'arrache jusqu'au vrai décompte, le menu écrit à l'encre dorée, le carton de table tamponné. |
| 2. Direction artistique et harmonie | 13/15 | Vraies photos du lieu sur toutes les pages, crème, vert de nuit, brun chaud et rouge tenus ; beaucoup d'ambiances différentes d'une page à l'autre. |
| 3. Animations et effets | 14/15 | Feu animé d'une seule photo, assiette en couches, Saint-Sylvestre où chaque plat arrive avec son verre, espaces qui glissent, avis qui défilent. |
| 4. Expérience ludique et interactions | 10/10 | Espace restaurateur avec annulation et barre de phrases, réservation en quatre étapes, cloches du traiteur et calendrier du retrait, plan du domaine, carte cadeau à incliner. |
| 5. Tous les formats | 13/15 | Passe téléphone, horizontale et tablette sur les neuf pages (0 échec après corrections), espace mesuré à cinq tailles ; Safari à vérifier sur le Mac. |
| 6. Contenu et fiabilité | 8/10 | Vrais avis, vraies dates et vrais mariages ; plats de la Saint-Sylvestre et du traiteur en images générées, détails des menus à confirmer. |
| 7. Technique et performance | 6/10 | 0 échec aux dernières passes, mais 145 Mo de dépôt, des dizaines de reprises et un retour arrière brusque depuis l'espace. |
| 8. Mise en ligne | 5/5 | noindex, 404 « Cette page a fermé à minuit », images de partage, version ?v=7. |
| 9. Accessibilité | 3/5 | Axe sans défaut et clavier, mais mode calme retiré de la maquette. |
| **Total** | **86/100** | |

## Points forts

- L'espace restaurateur qui modifie le site en direct.
- L'éphéméride des fêtes et le menu de Noël écrit à l'encre dorée.
- Réserver en quatre étapes, le carton de table et son tampon.
- Le feu de la vraie cheminée animé d'une seule photo.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mouvement** : mode calme retiré : respecter au moins le réglage « réduire les animations » du système. Effort : moyen.
2. **Retour** : adoucir le retour arrière depuis /espace (changement brusque à 80 ms). Effort : petit.
3. **Safari** : vérifier l'ouverture, les transitions et le menu dans Safari sur le Mac. Effort : petit.

### Finition

1. **Poids** : 145 Mo : compresser les photos sources et les couches de l'assiette. Effort : moyen.
2. **Images** : remplacer les plats générés par de vraies photos quand le restaurant les fournit. Effort : moyen.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 7 à regarder, 1 non lancé(s) |
