# peekaboo-maquette

<https://peekaboo-maquette.vercel.app> · audit du 05/11/2026 · dernier commit 04ca262 du 05/11/2026 (v2)

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, livré avec la v2), inventaire de la bibliothèque (6 pages, captures 1440 et 390, aucune erreur de console) et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Direction « Le patron » : papier quadrillé, fil rouge cousu dans la marge, étiquettes de cours et voile en fermeture éclair entre les pages. Le croquis qui devient vêtement en cinq étapes et le planning filtrable rendent les cours concrets. Même créatrice que madebymelody, avec un univers bien distinct.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 13/15 | Fermeture éclair entre les pages, croquis qui devient patron puis vêtement, numéro en point de croix : ludique et tiré de la couture. |
| 2. Direction artistique et harmonie | 13/15 | Bricolage Grotesque et Instrument Sans, papier de patron, rouge et bleu ; images d'atelier générées nombreuses. |
| 3. Animations et effets | 12/15 | Étapes épinglées, fil rouge, galon, soulignés cousus ; un rechargement au milieu de la page à regarder au script. |
| 4. Expérience ludique et interactions | 8/10 | Planning filtrable, inscription par étapes, cours dépliables ; peu d'objets à manipuler. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres sur les six pages ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 7/10 | Cours, prix et planning du site actuel ; horaires, assurance et mentions à compléter. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, 4,4 Mo d'images (la plus lourde 201 Ko). |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=2 partout, images de partage, 404 aux couleurs ; X-Frame-Options encore présent dans vercel.json. |
| 9. Accessibilité | 4/5 | Mode calme et réduire les animations, accordéons natifs, galon avec pause. |
| **Total** | **83/100** | |

## Points forts

- Le voile en fermeture éclair : deux pans de tissu se ferment puis s'ouvrent sur la page suivante.
- « Une idée, cinq étapes » : le croquis devient patron, coupe, couture et essayage.
- Le planning de la semaine filtrable par public.
- Le numéro de l'atelier en point de croix.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Affichage dans Wix refusé** : vercel.json envoie encore X-Frame-Options : SAMEORIGIN. Retirer l'en-tête et pousser. Effort : petit.

### Finition

1. **Rechargement au milieu de la page** : relevé « à regarder » par le script. Effort : petit.
2. **Images générées** : photos réelles de l'atelier et des cours à demander. Effort : petit.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard du 05/11/2026 : 0 échec(s), 1 à regarder |
| Pages publiques | 6 |
| Images servies | 79 fichiers, 4.4 Mo (la plus lourde : 201 Ko) |
| Mise en ligne | noindex sur toutes les pages, X-Robots-Tag, X-Frame-Options présent (affichage dans Wix refusé) |
| Version des fichiers | ?v=2 |
