# Pipeline d'images des maquettes

Remplace le travail à la main sur les images (et `outils/images.py` du socle). Claude ne décide que deux choses : quelle image va où, et quel texte alternatif.
Dépendances : Playwright et sharp (`npm ci` à la racine du dépôt). Visages, mains, objets, saillance et texte viennent du framework Vision de macOS, sans modèle à télécharger. Ailleurs, les commandes se replient sur des mesures de contraste.

## Déroulé dans un projet

Toutes les commandes se lancent depuis la racine du projet du client, avec le chemin complet des scripts : `I=~/Downloads/bibliotheque-maquettes/images` puis `node $I/<commande>.mjs`.

1. **Récupérer** : à donner à l'utilisateur dans un bloc Terminal, `node ~/Downloads/bibliotheque-maquettes/images/recuperer.mjs https://site-du-client.fr` (chemin complet : la variable `I` n'existe pas dans son Terminal).
   Images originales (Wix, WordPress, Squarespace, Shopify, Google Sites, Cloudflare dont Hostinger/Zyro), sans icônes ni pixels de suivi, nommées d'après leur contexte, avec les variantes du logo (champ `marque` : principale, sous-marque, partenaire). Photos réduites à 2000 px sur leur plus grand côté (dimensions d'origine gardées dans `recuperation.json`). Écrit `recu/`, `recu/recuperation.json` et les zips de 20 Mo au plus (`~/Downloads/<client>-images.zip`, ou `-1.zip`, `-2.zip`…), que l'utilisateur envoie.
   Signale « A REGARDER » les pages du menu non lues et un site dont une seule page a donné des images.
   Options : `--pages 60`, `--client nom`, `--largeur-max 2000` (0 : original), `--sans-zip`, `--sans-finder`, `--cache`.
   **Zips** : `node images/zipper.mjs <dossier> --client nom` met un dossier entier (images, `analyse.json`, planches) en zips de 20 Mo au plus, qui se décompressent dans `<dossier>/`. C'est la dernière ligne du bloc de récupération de la skill, après l'analyse.
2. **Analyser** : `node $I/analyser.mjs recu/`. Rien n'est modifié.
   Écrit `recu/analyse.json` : `sujet`, `cadrage`, `zones_calmes`, `qualite` (`faible` et ses raisons), `doublon_de`, `lisible` (document, marque ou décoratif), et les planches `recu/planche*.jpg`. Regarder les planches, pas les images une à une. Sur les planches : cadre jaune = sujet, croix = cadrage, fond rose = à vérifier.
3. **Écrire `plan-images.json`** à la racine du projet : la décision de Claude. C'est un tableau d'entrées, chemins relatifs au plan :
   `[{ "source": "recu/salle.jpg", "nom": "ouverture", "role": "ouverture", "alt": "Salle au matin", "mobile": true, "zone_texte": "gauche" }]`.
   `role` vient d'`emplacements.json`. `mobile` vaut `true` ou un ratio (`"9:16"`). `zone_texte` vaut gauche, droite, haut ou bas. Facultatifs : `cadrage: [x, y]` en %, `ratio`, `largeurs`, `page` (image de partage de cette page), `source_mobile`.
   Pour une image à générer, la source va dans `recu/grok/` et l'entrée prend en plus `page`, `emplacement`, `priorite`, `scene` (anglais), `gabarit` ou `consigne_scene`.
4. **Grok** : `node $I/grok.mjs plan-images.json --activite <activité> --direction _suivi/direction.json --sortie _suivi/<client>-images-grok.docx`.
   Une consigne anglaise complète par image, au format Grok (1168×784 ou 784×1168), avec les interdits communs et ceux de l'activité. Les gabarits sont dans `gabarits-grok/` (voir `LISEZMOI.md`). Écrit aussi `grok-consignes.json`.
5. **Vérifier Grok** : `node $I/verifier-grok.mjs recu/grok/ plan-images.json`. Vérifie fichiers manquants, ratio (à 5 % près) et largeur, texte et filigrane, visage net, bordure, et compte les mains (indicatif, à regarder).
   Écrit `recu/grok/planche.jpg` et `verification.json`, avec une consigne corrigée pour chaque image à régénérer.
6. **Produire** : `node $I/produire.mjs plan-images.json`. Recadre autour du sujet, jamais au centre par défaut, et écrit les variantes WebP du socle (`assets/images/<nom>-<w>.webp`, `<nom>-mobile-<w>.webp` en 9:16).
   Qualité 80, baissée par paliers si un fichier dépasse 300 Ko. Jamais d'agrandissement au-delà de 1,5 fois. Écrit `donnees/images.json`, avec l'appel `c.media` prêt à coller. Les lignes « A REGARDER » (agrandissement, recadrage fort, texte coupé) sont aussi dans `avertissements`. Idempotent (`--forcer` pour tout refaire).
7. **Partage** : `node $I/partage.mjs` (après `donnees/site.json` et les textes). Écrit une carte 1200×630 par page et par langue, en JPG qualité 80, et `_partage/partage.json` avec le recouvrement mesuré entre le sujet et le texte, le logo ou le voile, qui doit valoir 0. Le logo vient d'`images.json` (rôle logo). Un `imagePartage` absent d'`images.json` (visuel d'exemple du socle) est remplacé par une image du client et signalé.

## Deux règles

- Jamais une image recadrée au centre sans avoir regardé son sujet : le cadrage vient d'`analyse.json`, ou du plan quand l'analyse se trompe.
- Jamais un visuel provisoire quand une vraie image du client existe.

## Limites connues

- Un petit objet porté (boucle d'oreille), ou un bandeau sans sujet net, donne un mauvais cadrage : le régler à la main avec le champ `cadrage` du plan.
- Le comptage des doigts est indicatif : regarder la planche.
- Site d'agence ou de graphiste : les logos de clients montrés en portfolio peuvent être pris pour des logos partenaires, à corriger dans le plan.

## Tests

`node images/tests/tester.mjs [analyser] [produire] [partage] [verifier-grok] [grok]`. Le jeu de 20 images d'anciens clients (`tests/jeu.json`) est téléchargé dans `tests/.jeu/`, qui n'est pas versionné : le dépôt est public. La vérité est dans `tests/attendu.json`.
