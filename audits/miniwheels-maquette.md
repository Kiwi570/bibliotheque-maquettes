# miniwheels-maquette

<https://miniwheels-maquette.vercel.app> · audit du 23/11/2026 · dernier commit 3e867a1 du 23/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill v11.1.1 (complet sur toutes les pages, 39 tailles et modes, films, parcours, fluidité ; relances ciblées à 0 échec), inventaire de la bibliothèque et lecture des captures ordinateur et téléphone. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Paddock » : blanc plaque, noir pneu et vert du logo, titres Archivo très condensée italique surlignés comme une plaque de course, damier aux transitions. Le site raconte le samedi au Park (prochaine ouverture en direct, calculateur de session, pistes en profil) et le Shop (catalogue filtrable de 65 véhicules), avec Séb en fil humain.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Intro grille de départ, ouverture plein cadre et pastille du samedi : énergique et propre au métier ; quelques sections intérieures plus classiques (FAQ, équipement). |
| 2. Direction artistique et harmonie | 13/15 | Trois couleurs tenues partout, typographie de plaque de course, damier en signature ; rythme clair et sombre régulier. |
| 3. Animations et effets | 12/15 | Effets propres au client (grille de départ, pit bike qui roule, pilote sur le profil, compte à volets, jauge) en plus des effets du socle ; rien de lourd. |
| 4. Expérience ludique et interactions | 8/10 | Calculateur avec jauge, créneau du samedi, catalogue filtrable avec FLIP, onglets des pistes ; réservation et formulaire simulés. |
| 5. Tous les formats | 13/15 | 0 échec sur les 39 tailles et modes de l'audit ; Safari non vérifié dans la session. |
| 6. Contenu et fiabilité | 9/10 | Textes et chiffres repris du site actuel, prix d'appel calculés sur le catalogue, incohérences du site signalées dans le README ; Pass'Park sans prix faute d'information fiable. |
| 7. Technique et performance | 9/10 | Défilement natif fluide (0 à 1 % d'images lentes), ouverture en 2 s environ, images webp en plusieurs largeurs. |
| 8. Mise en ligne | 5/5 | En ligne sur Vercel, intégrable dans Wix, noindex en place. |
| 9. Accessibilité | 5/5 | axe-core sans erreur, clavier et liens vérifiés, mouvement réduit respecté. |
| **Total** | **86/100** | |

## Points forts

- Prochaine ouverture du Park calculée à l'heure de Paris, compte à rebours à volets et semaine en 7 cases
- Pit bike dessinée qui avance le long des 5 étapes, pilote qui parcourt le profil de chaque piste
- Calculateur de session avec jauge de temps de roulage
- Catalogue de 65 véhicules filtrable, replié à 15, pictogrammes pour les véhicules sans photo

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari** : intro, voile, menu iPhone et défilement à vérifier dans Safari sur un Mac. Effort : 15 min.

### Finition

1. **Photos du catalogue** : 37 véhicules sur 65 sans photo constructeur sûre : pictogrammes en attendant. Effort : selon les photos du client.
2. **Retour arrière** : la photo d'ouverture apparaît avec un léger retard au retour arrière ou avant. Effort : 30 min.
3. **Contenus à fournir** : mentions légales, politique de confidentialité, prix du Pass'Park, dates des stages. Effort : client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 0 à regarder, 0 non lancé(s) |
| Échecs au premier audit complet | 6 |
| Ouverture (1366×768) | ≈ 2,0 s |
| Fluidité | 0 à 1 % d'images lentes |
