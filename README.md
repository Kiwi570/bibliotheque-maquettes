# Bibliothèque des maquettes

Références (maquettes et sections classées) et modules de code testés, pour démarrer chaque nouvelle maquette client.
Règle d'or : on réutilise la mécanique, jamais l'identité (aucun texte, logo, photo, couleur ni police d'un client dans les modules).

## Au début d'un projet (Claude)

1. Parcourir `index.json` (120 Ko : une ligne par maquette, par section et par module, colonnes en tête) ; `taxonomie.json` donne les valeurs permises.
2. Chercher : `node outils/chercher.mjs --activite restauration --ambiance chaleureux --role ouverture` (filtres répétables : `--concept --animation --interaction --dependance --telephone --sans ogl --note-min 4 --module`, mots libres acceptés, `--json` pour un résultat machine). Activité, concept et ambiance départagent sans exclure ; `--strict` les rend obligatoires.
3. Lire les fiches retenues (`sections/<maquette>/<id>.json`, `modules/<nom>/module.json` et `NOTES.md`), regarder captures et vidéos (`medias/`).
4. Assembler : poser `palette.json` (couleurs, polices) et éventuellement `options.json` dans `assemblages/projet/`, puis `node outils/assembler.mjs <module> … --sortie assemblages/projet`. Page autonome, polices chargées, scripts anti-flash, `scenario.json` fusionné ; rien n'est effacé (`--ecraser` pour refaire `index.html`). Les options fonctions vont dans `assemblage.js`, jamais réécrit. Les liens sans cible sont signalés.
5. Tester : `node outils/tester-module.mjs assemblages/projet/index.html --captures` (captures dans `captures/` ; 14 formats, réduire les animations, sans WebGL, console, CLS, éléments collants, scénario de clics, texte 12 px, cibles 44 px).
6. Adapter : copier le dossier dans le projet, remplacer les contenus neutres, garder les classes et les `data-*` décrits dans chaque `NOTES.md`.

## Conventions des modules

- `module.js` exporte `init(root, options)` et obtient GSAP, ScrollTrigger, SplitText, Flip, Lenis ou OGL par `pret([...])` de `socle/socle.js` (chargés à la demande : `pret([])` ne charge rien) ; il ne les instancie jamais.
- Identité uniquement par variables (`--couleur-fond`, `--couleur-texte`, `--couleur-accent`, `--couleur-secondaire`, `--police-titres`, `--police-texte`, `--police-mono`, `--rayon`, `--espace`). `--entete-h` et `--barres-h` sont mesurées par le socle sur `[data-entete]` et `[data-barre]`.
- Section épinglée : `[data-epingle]`, classe `est-epingle` pendant l'épinglage, éléments qui doivent tenir dans l'écran marqués `[data-tient]` ; tout `position: sticky` collé est aussi vérifié, sans marquage.
- `module.json` déclare ses emplacements d'images (`images` : rôle, sélecteur, nombre, ratio, largeur source, zone calme pour le texte) ; `scenario.json` (clics, saisie) est joué et filmé par le testeur.
- Une fiche de section cite son module principal (`module`) et tous ses modules (`modules`, principal en tête).
- Mode calme : classe `calme` sur `html` (bouton `[data-calme]`, mémorisé), même effet que « réduire les animations » : état final, rien ne bouge.

## Ajouter une maquette (fin de projet)

1. `node outils/ajouter.mjs <dépôt>` : pull, inventaire (captures 1440 et 390, vidéos) et identité ; écrit le gabarit `notes-manuelles/<dépôt>.json` et une planche contact s'il manque.
2. Compléter le gabarit (rôle, description, note, pièges ; valeurs dans `taxonomie.json`, format en tête de `outils/fiches.mjs`) en regardant la planche.
3. `node outils/ajouter.mjs <dépôt> --sans-inventaire` : fiches, liens vers les modules, `index.json`, validation (zéro erreur). Commiter.

## Contenu

`maquettes/` fiches maquettes · `sections/` fiches sections · `modules/` modules · `socle/` socle commun et `vendor/` · `audits/` rapports d'audit et de correction · `inventaire/` relevés automatiques · `notes-manuelles/` jugements humains · `medias/` captures et vidéos (jamais lues par Claude) · `outils/` scripts.
