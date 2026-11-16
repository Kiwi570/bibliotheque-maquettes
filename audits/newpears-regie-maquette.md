# newpears-regie-maquette

<https://newpears-regie-maquette.vercel.app> · audit du 16/11/2026 · dernier commit 2159dd6 du 16/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet v3 et standard v5 : 0 échec), regard du directeur artistique (VALIDER 4,3/5 sur l'accueil v1), regard neuf, test « vrai visiteur », inventaire de la bibliothèque et lecture des captures Pas d'audit externe : la note est à confirmer.

## Verdict

**78/100 · À peaufiner · 0 défaut bloquant**

Direction « La régie » pour NEWPEARS, location de son, lumière et DJ à Saint-Quentin. L'accueil est sobre : un grand titre, un seul faisceau qui suit la main et se pose sur le vrai pack conseillé, un curseur d'invités et un interrupteur Mariage. Puis un flight case dont on tire le couvercle. Chaque page d'onglet a son objet : rack de packs sous une poursuite, contrôleur aux plateaux qui tournent, salle qui prend la couleur de l'événement, plan de salle qui suit le nombre d'invités. Depuis la v5, demandée plus sobre par le client, le fond est clair presque partout : seules les ouvertures, l'appel final et le pied restent sombres.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 11/15 | Accueil sobre et net, un seul effet signature, vrai produit du client en grand ; le flight case à ouvrir et les ouvertures d'onglet donnent du relief, sans effet « jamais vu ». |
| 2. Direction artistique et harmonie | 12/15 | Monde de la régie cohérent (faisceaux, flight case, plan de salle, chiffres en LED), fond clair majoritaire avec ouvertures sombres ; la salle générée revient encore sur Événements et la 404. |
| 3. Animations et effets | 11/15 | Peu d'animations, sur demande du client : faisceau à la main, couvercle, poursuite, jogs, salle qui change de couleur, plan qui se dessine ; néons, lueurs et ombres de texte retirés en v5. |
| 4. Expérience ludique et interactions | 8/10 | Beaucoup à toucher : curseur d'invités et Mariage qui donnent le pack et l'ajoutent à la demande, couvercle, rack, jogs, plan + et −, playlist à joindre, demande en quatre étapes. |
| 5. Tous les formats | 13/15 | Audit standard v5 sans échec sur les 6 pages, 13 tailles et tous les modes (complet v3 aussi) ; sur téléphone, le premier écran bouge peu (choix de sobriété). |
| 6. Contenu et fiabilité | 7/10 | Vraies données du site (packs, catalogue, zone, chiffres), aucun prix inventé ; mentions légales absentes, vignettes d'événements générées, photo des DJ sombre, prix par pack non publiés. |
| 7. Technique et performance | 8/10 | Site statique léger, fluidité correcte au processeur ralenti, stabilité du chargement corrigée ; images WebP en plusieurs tailles. |
| 8. Mise en ligne | 4/5 | Dépôt GitHub et Vercel en place (newpears-regie-maquette), noindex ; adresse courte à confirmer dans Vercel. |
| 9. Accessibilité | 4/5 | axe sans violation, cibles de 44 px, focus visible, interrupteur Mariage au clavier ; Safari non vérifié ici. |
| **Total** | **78/100** | |

## Points forts

- héros sobre : un faisceau accroché en haut suit la main, éclaire le titre et revient se poser sur le vrai pack conseillé
- le conseil tient sur une ligne : curseur d'invités, Mariage, pack conseillé, ajout direct à « Ma demande »
- flight case de l'accueil fait de la matière de la photo (panneau, cornière, loquets) : on tire le couvercle, les produits sont sur la mousse
- une ouverture propre à chaque page d'onglet : rack de packs, contrôleur, salle colorée, plan de salle
- fond clair presque partout (v5) : ouvertures sombres, boutons unis, police LED réservée aux chiffres

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mentions légales et confidentialité** : à fournir par le client (raison sociale, SIRET, hébergeur, politique de confidentialité). Effort : client.
2. **Photos réelles** : une photo éclairée de Mattéo et Sacha et de vraies photos d'événements pour remplacer les vignettes générées. Effort : client.
3. **Prix des packs** : seul « dès 169 € » est publié (79 € sur l'ancien accueil) : prix par pack à confirmer. Effort : client.

### Finition

1. **Safari** : intro, voile, menu iPhone et formulaire à vérifier sur un Mac. Effort : 15 min.
2. **Salle générée** : la même salle apparaît sur Événements et la 404 : une autre image ou une vraie photo de salle du client. Effort : 30 min.
3. **Adresse courte** : ajouter newpears-regie.vercel.app dans le projet Vercel (sinon newpears-maquette-xndg.vercel.app). Effort : 5 min.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 1 à regarder, 1 non lancé(s) |
| Regard du directeur artistique (accueil v1) | REFAIRE 2,8 puis 3,2, puis AJUSTER, puis VALIDER 4,3/5 |
| Regard neuf (v1) | accueil 3,8, location 3,6, contact 3,6, DJ 2,9, 404 2,9, événements 2,8 : ouvertures d'onglet refaites en v2 |
| Audit complet (v3) | 4 puis 3 échecs, puis 0 ; Safari non lancé |
| Audit ciblé v4 (page DJ) | 0 échec : platines dessinées à la place de la photo floue |
| Audit standard v5 (plus sobre, clair majoritaire) | 22 échecs (contrastes sur le clair) puis 0 ; 1 point à regarder : en-tête caché au rechargement |
