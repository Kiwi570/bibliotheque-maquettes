# sandrabarba-maquette

<https://sandrabarba-maquette.vercel.app> · audit du 13/11/2026 · dernier commit 43ef074 du 13/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard, puis passes ciblées à 0 échec, v3), regards de directeur artistique (accueil 3,6 ; pages intérieures 3,0 à 3,3 au second regard, corrigées ensuite), regard neuf, test « vrai visiteur », inventaire de la bibliothèque et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**83/100 · À peaufiner · 0 défaut bloquant**

Direction « La boîte à mots » tirée du vrai cabinet d'Aubignan : la boîte lumineuse « AIMER LA VIE » de l'entrée devient le fil du site. On y glisse son mot, la boîte s'allume et répond, puis on plonge dedans d'un mouvement fluide. Les pages intérieures, refaites en v2 et v3 sur deux fonds, posent la boîte en grand dans chaque ouverture (PARLER, INSPIREZ, SORTIR DU SILENCE, le numéro). Juste et singulière pour ce métier ; beaucoup d'images générées et quelques portraits limités en définition.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | La boîte lumineuse sur le bureau de pin, la tuile qu'on y glisse, puis une plongée fluide dans la boîte ; chaque page intérieure a sa boîte en grand avec son mot. Fort et calme, moins spectaculaire que les plus fortes de la bibliothèque. |
| 2. Direction artistique et harmonie | 12/15 | Nuit, framboise et crème, tuiles en capitales condensées, serif d'affichage : tenu sur les cinq pages ; les images générées dominent face aux deux vrais portraits. |
| 3. Animations et effets | 12/15 | Plongée épinglée, trois temps écrits dans la boîte au défilement, respiration de la boîte, lampe qui révèle, mots qui défilent, voile en iris, fil « VOTRE MOT » ; images saccadées passées de 13,8 % à 1,7 % sur ordinateur ralenti. |
| 4. Expérience ludique et interactions | 9/10 | Glisser son mot dans la boîte, balayer les lettres, promener la lampe, maintenir pour inspirer, demande en trois étapes qui tombe dans la boîte « DEMANDE REÇUE ». |
| 5. Tous les formats | 13/15 | Audit standard et passes des formats à 0 échec (téléphone à l'horizontale, écrans bas, sans JavaScript) ; Safari et iPhone réel non vérifiés. |
| 6. Contenu et fiabilité | 8/10 | Avis réels fidèles, numéros d'aide vérifiés (3919, 17, 112, 114, 119), titre prudent « Psychothérapie et sophrologie » ; mentions légales, SIRET et politique de confidentialité à fournir. |
| 7. Technique et performance | 9/10 | Aucune erreur de console, images en WebP par largeur, polices en WOFF, rien qui tourne hors écran. |
| 8. Mise en ligne | 4/5 | noindex et X-Robots-Tag, ?v=1, images de partage par page, 404 aux couleurs, ni X-Frame-Options ni frame-ancestors ; Vercel Authentication à désactiver par l'utilisateur. |
| 9. Accessibilité | 4/5 | Bouton « Quitter vite », tuiles en vrais boutons, contrastes vérifiés sur image, phrases à plat sans JavaScript ; le balayage reste un geste en plus, jamais obligatoire. |
| **Total** | **83/100** | |

## Points forts

- La boîte à mots : la vraie boîte de l'entrée, posée sur le pin du bureau, s'allume quand on y glisse son mot.
- La plongée continue : la boîte garde le mot choisi, grandit jusqu'à l'écran, et les lettres se rangent en « mettre des mots », « en parler », « sortir du silence ».
- Le mot suit le visiteur sur toutes les pages (marge, barre du bas) jusqu'à la demande de rendez-vous, préremplie.
- Page Violences responsable : numéros d'aide en tuiles, bouton « Quitter vite », lampe qui révèle les violences invisibles.
- Demande en trois étapes qui tombe dans une boîte « DEMANDE REÇUE ».

## Défauts

### Bloquants

Aucun.

### Importants

1. **Images générées nombreuses** : Une dizaine d'illustrations générées ; des photos réelles du cabinet en meilleure définition les remplaceraient. Effort : photos du client.
2. **Portraits limités** : sandra-laine (960 px) et deux images générées (1024 px) restent sous un quart d'écran. Effort : photos du client.

### Finition

1. **Second jeu de l'accueil** : La boîte finale « ET VOUS / ? » pourrait aussi recevoir le mot. Effort : 30 min.
2. **Mentions à fournir** : Mentions légales, SIRET et politique de confidentialité restent « à compléter ». Effort : client.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | standard : 0 échec(s), 2 à regarder, 0 non lancé(s) |
