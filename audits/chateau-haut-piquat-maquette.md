# chateau-haut-piquat-maquette

<https://chateau-haut-piquat-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 53a01f7 du 05/11/2026 (v19)

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (8 pages, captures 1440 et 390 avec le filtre d'âge accepté, erreurs de console relevées) et lecture des captures ; maquette faite sans le socle de la skill, pas de rapport du script d'audit dans le dépôt. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Calcaire à astéries » : bouteilles sur des blocs de calcaire, coupe du sol sous la vigne, tour de la cave épinglé, passage de l'arche et assemblage à composer. Une vitrine de domaine viticole très aboutie (v18), avec boutique et réservation. Un défaut technique sur la page Le domaine : le dessin des barriques du chai échoue (11 erreurs de console).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 14/15 | Coupe géologique WebGL, tour de la cave, arche qu'on traverse, assemblage aux curseurs : un domaine raconté par son sol et ses gestes. |
| 2. Direction artistique et harmonie | 14/15 | Fraunces et Manrope, calcaire, ocre et argile, vraies photos et bouteilles détourées : la direction la plus luxueuse du lot. |
| 3. Animations et effets | 12/15 | Sections épinglées nombreuses et variées, frise des millésimes, curseur personnalisé ; le chai à barriques ne dessine pas ses barriques. |
| 4. Expérience ludique et interactions | 10/10 | Boutique de 24 références filtrable avec panier, caisse à composer, assemblage écriVins, accords mets et vins, réservation avec total, filtre d'âge. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les huit pages ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 8/10 | Vins, prix, millésimes et formules du domaine ; mentions et quelques fiches à compléter. |
| 7. Technique et performance | 6/10 | 11 erreurs de console sur Le domaine (getContext('2d') nul sur un canvas déjà en WebGL) ; 37,9 Mo d'images dont une à 1 Mo et deux vidéos. |
| 8. Mise en ligne | 5/5 | noindex et X-Robots-Tag, ?v=19 partout, images de partage, 404 au calcaire, affichable dans Wix. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, filtre d'âge au clavier ; curseur personnalisé masqué au toucher. |
| **Total** | **86/100** | |

## Points forts

- La coupe géologique épinglée sous la vigne, jusqu'aux couches de calcaire.
- Le tour de la cave : un chapitre et une bouteille par cuvée.
- Passer l'arche : on avance sous l'arche vers l'allée du château.
- L'atelier écriVins : composer son assemblage aux curseurs, le verre change de couleur.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Erreurs de console sur Le domaine** : drawBarrels demande un contexte 2D sur un canvas déjà utilisé en WebGL : getContext renvoie null, 11 erreurs et pas de barriques. Utiliser un canvas à part pour les barriques. Effort : petit.
2. **Poids des images** : 37,9 Mo d'images dont une à 1 Mo : recompresser les plus lourdes. Effort : petit.

### Finition

1. **Hors socle** : maquette construite avant le socle de la skill : pas de script d'audit fourni, à auditer avec la v10.3 si une nouvelle version est faite. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Pages publiques | 8 |
| Images servies | 307 fichiers, 37.9 Mo (la plus lourde : 1000 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, affichable dans Wix |
| Version des fichiers | ?v=19 |
