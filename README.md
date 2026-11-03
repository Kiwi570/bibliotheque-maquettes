# Bibliothèque des maquettes

Références (maquettes et sections classées) et modules de code testés, pour démarrer chaque nouvelle maquette client.
Règle d'or : on réutilise la mécanique, jamais l'identité (aucun texte, logo, photo, couleur ni police d'un client dans les modules).

## Au début d'un projet (Claude)

1. Lire `index.json` en entier : une ligne par maquette, par section et par module ; `taxonomie.json` donne les valeurs permises.
2. Chercher : `node outils/chercher.mjs --activite restauration --ambiance chaleureux --role ouverture` (filtres répétables : `--concept --animation --interaction --dependance --telephone --sans ogl --note-min 4 --module`, mots libres acceptés, `--json` pour un résultat machine). Activité, concept et ambiance départagent sans exclure ; `--strict` les rend obligatoires.
3. Lire les fiches retenues (`sections/<maquette>/<id>.json`, `modules/<nom>/module.json` et `NOTES.md`), regarder captures et vidéos (`medias/`).
4. Assembler : `node outils/assembler.mjs <module> <module> … --palette palette.json --sortie assemblages/projet` produit une page autonome (socle + modules) avec la nouvelle palette.
5. Tester : `node outils/tester-module.mjs assemblages/projet/index.html` (14 formats, réduire les animations, sans WebGL, console, CLS, éléments collants, scénario de clics, texte 12 px, cibles 44 px).
6. Adapter : copier le dossier dans le projet, remplacer les contenus neutres, garder les classes et les `data-*` décrits dans chaque `NOTES.md`.

## Conventions des modules

- `module.js` exporte `init(root, options)` et obtient GSAP, ScrollTrigger, SplitText, Flip, Lenis ou OGL par `pret([...])` de `socle/socle.js` ; il ne les instancie jamais.
- Identité uniquement par variables (`--couleur-fond`, `--couleur-texte`, `--couleur-accent`, `--couleur-secondaire`, `--police-titres`, `--police-texte`, `--police-mono`, `--rayon`, `--espace`). `--entete-h` et `--barres-h` sont mesurées par le socle sur `[data-entete]` et `[data-barre]`.
- Section épinglée : `[data-epingle]`, classe `est-epingle` pendant l'épinglage, éléments qui doivent tenir dans l'écran marqués `[data-tient]` ; tout `position: sticky` collé est aussi vérifié, sans marquage.
- `module.json` déclare ses emplacements d'images (`images` : rôle, sélecteur, nombre, ratio, largeur source, zone calme pour le texte) ; `scenario.json` (clics, saisie) est joué et filmé par le testeur.
- Une fiche de section cite son module principal (`module`) et tous ses modules (`modules`, principal en tête).
- Mode calme : classe `calme` sur `html` (bouton `[data-calme]`, mémorisé), même effet que « réduire les animations » : état final, rien ne bouge.

## Ajouter une maquette (fin de projet)

1. `node outils/inventaire.mjs <dépôt>` : pages, blocs, lignes de code, ScrollTrigger, captures 1440 et 390, vidéos.
2. `node outils/identite.mjs <dépôt>` : palette et polices lues dans le CSS.
3. Écrire `notes-manuelles/<dépôt>.json` (rôle, description, note, pièges ; format en tête de `outils/fiches.mjs`), en regardant les captures (`python3 outils/planche.py <dépôt> planche.jpg`).
4. `node outils/fiches.mjs <dépôt> && node outils/indexer.mjs && node outils/valider.mjs` (zéro erreur).
   (`outils/ajouter.mjs` enchaînera ces étapes à l'étape 4 du chantier.)

## Contenu

`maquettes/` fiches maquettes · `sections/` fiches sections · `modules/` modules · `socle/` socle commun et `vendor/` · `audits/` rapports d'audit et de correction · `inventaire/` relevés automatiques · `notes-manuelles/` jugements humains · `medias/` captures et vidéos (jamais lues par Claude) · `outils/` scripts.
