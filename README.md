# Bibliothèque des maquettes

Références (maquettes et sections classées) et modules de code testés, pour démarrer chaque nouvelle maquette client.
Règle d'or : on réutilise la mécanique, jamais l'identité (aucun texte, logo, photo, couleur ni police d'un client dans les modules).

## Au début d'un projet (Claude)

1. Parcourir `index.json` (150 Ko au plus : une ligne par maquette, par section notée 5 ou tirée en module, et par module, colonnes en tête ; toutes les sections notées 4 ou 5 sont dans `site/index-site.json`, les autres se trouvent avec `chercher.mjs`) ; `taxonomie.json` donne les valeurs permises. Lire `lecons.md` : les leçons générales des projets passés, à appliquer dès ce projet.
2. Chercher : `node outils/chercher.mjs --activite restauration --ambiance chaleureux --role ouverture` (filtres répétables : `--concept --animation --interaction --dependance --telephone --sans ogl --note-min 4 --module`, mots libres acceptés, `--json` pour un résultat machine). Activité, concept et ambiance départagent sans exclure ; `--strict` les rend obligatoires.
Avant de proposer les directions : `node outils/chercher.mjs --dernieres` donne la forme du voile, l'objet manipulé et le fil des 5 dernières maquettes (`--dernieres 10` pour plus), pour ne pas redonner les mêmes au client suivant.
3. Lire les fiches retenues (`sections/<maquette>/<id>.json`, `modules/<nom>/module.json` et `NOTES.md`), regarder captures et vidéos (`medias/`).
4. Assembler : poser `palette.json` (couleurs, polices) et éventuellement `options.json` dans `assemblages/projet/`, puis `node outils/assembler.mjs <module> … --sortie assemblages/projet`. Page autonome, polices chargées, scripts anti-flash, `scenario.json` fusionné ; rien n'est effacé (`--ecraser` pour refaire `index.html`). Les options fonctions vont dans `assemblage.js`, jamais réécrit. Les liens sans cible sont signalés.
5. Tester : `node outils/tester-module.mjs assemblages/projet/index.html --captures` (captures dans `captures/` ; 14 formats, réduire les animations, sans WebGL, console, CLS, éléments collants, scénario de clics, texte 12 px, cibles 44 px).
6. Adapter : copier le dossier dans le projet, remplacer les contenus neutres, garder les classes et les `data-*` décrits dans chaque `NOTES.md`.
7. Images : suivre `images/README.md`. Six commandes : récupérer, analyser, grok, vérifier-grok, produire, partage. Claude n'écrit que `plan-images.json`.

## Si `npm ci` échoue (registre bloqué)

Dans un environnement où le registre npm est refusé (403, nom introuvable), ne pas insister : relier les modules installés globalement, puis lancer les outils avec `NODE_PATH`.
`mkdir -p node_modules && ln -sfn "$(npm root -g)/sharp" node_modules/sharp && ln -sfn "$(npm root -g)/playwright" node_modules/playwright`

## Conventions des modules

- `module.js` exporte `init(root, options)` et obtient GSAP, ScrollTrigger, SplitText, Flip, Lenis ou OGL par `pret([...])` de `socle/socle.js` (chargés à la demande : `pret([])` ne charge rien) ; il ne les instancie jamais.
- Identité uniquement par variables (`--couleur-fond`, `--couleur-texte`, `--couleur-accent`, `--couleur-secondaire`, `--police-titres`, `--police-texte`, `--police-mono`, `--rayon`, `--espace`). `--entete-h` et `--barres-h` sont mesurées par le socle sur `[data-entete]` et `[data-barre]`.
- Section épinglée : `[data-epingle]`, classe `est-epingle` pendant l'épinglage, éléments qui doivent tenir dans l'écran marqués `[data-tient]` ; tout `position: sticky` collé est aussi vérifié, sans marquage.
- `module.json` déclare ses emplacements d'images (`images` : rôle, sélecteur, nombre, ratio, largeur source, zone calme pour le texte) ; `scenario.json` (clics, saisie) est joué et filmé par le testeur.
- Une fiche de section cite son module principal (`module`) et tous ses modules (`modules`, principal en tête).
- Mode calme : classe `calme` sur `html` (bouton `[data-calme]`, mémorisé), même effet que « réduire les animations » : état final, rien ne bouge.

## Ajouter une maquette (fin de projet)

1. `node outils/ajouter.mjs <dépôt>` : pull, inventaire (captures 1440 et 390, vidéos) et identité ; grille wouahou et journal (`outils/grille.mjs` : forme du voile, intro vers l'objet, marques `data-grille`, copie de `_audit/journal.json` dans `journaux/`) ; écrit le gabarit `notes-manuelles/<dépôt>.json` et une planche contact s'il manque.
2. Compléter le gabarit (rôle, description, note, pièges ; valeurs dans `taxonomie.json`, format en tête de `outils/fiches.mjs`) en regardant la planche, sans oublier `maquette.grille` : l'objet que le visiteur manipule et le fil conducteur, en quelques mots.
3. `node outils/ajouter.mjs <dépôt> --sans-inventaire` : fiches, liens vers les modules, `index.json`, validation (zéro erreur).
4. Leçons : d'après le journal et le rapport d'audit du projet, proposer à l'utilisateur 0 à 3 leçons générales ; ajouter celles qu'il valide à `lecons.md` (format en tête du fichier). Commiter le tout en un seul commit, puis un seul push.

## Temps réel des projets

`node outils/temps.mjs` lit les journaux (`journaux/`, un par projet fait avec la skill v10.3 et suivantes) : temps moyen et médian de chaque étape face à son budget, attente de l'utilisateur, allers-retours, échecs au premier audit, modules les plus réutilisés (`--toutes` pour toutes les versions, `--json`). Attendre au moins cinq projets avant de corriger le budget de la skill.

## Contenu

`maquettes/` fiches maquettes · `sections/` fiches sections · `modules/` modules · `socle/` socle commun et `vendor/` · `audits/` rapports d'audit et de correction · `journaux/` journaux des projets (temps réel par étape) · `lecons.md` leçons générales des projets · `inventaire/` relevés automatiques · `notes-manuelles/` jugements humains · `medias/` captures et vidéos (jamais lues par Claude) · `outils/` scripts · `images/` pipeline d'images (commandes, `emplacements.json`, `gabarits-grok/`, tests).
