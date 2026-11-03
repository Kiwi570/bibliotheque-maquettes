# Pipeline d'images des maquettes

Remplace le travail à la main sur les images (et `outils/images.py` du socle). Claude ne décide que deux choses : quelle image va où, et quel texte alternatif.
Dépendances : Playwright et sharp (`npm ci` à la racine du dépôt). Visages, mains, objets, saillance et texte viennent du framework Vision de macOS, sans modèle à télécharger. Ailleurs, les commandes se replient sur des mesures de contraste.

## Déroulé dans un projet (depuis la racine du projet)

1. **Récupérer** : à donner à l'utilisateur dans un bloc Terminal, `node ~/Downloads/bibliotheque-maquettes/images/recuperer.mjs https://site-du-client.fr`.
   Images originales (Wix, WordPress, Squarespace, Shopify, Google Sites), sans icônes ni pixels de suivi, nommées d'après leur contexte, avec les variantes du logo (champ `marque` : principale, sous-marque, partenaire). Écrit `recu/`, `recu/recuperation.json` et `~/Downloads/<client>-images.zip`, que l'utilisateur envoie.
   Options : `--pages 60`, `--client nom`, `--sans-zip`, `--sans-finder`, `--cache`.
2. **Analyser** : `node images/analyser.mjs recu/`. Rien n'est modifié.
   Écrit `recu/analyse.json` : `sujet`, `cadrage`, `zones_calmes`, `qualite` (`faible` et ses raisons), `doublon_de`, `lisible` (document, marque ou décoratif), et les planches `recu/planche*.jpg`. Regarder les planches, pas les images une à une. Sur les planches : cadre jaune = sujet, croix = cadrage, fond rose = à vérifier.
3. **Écrire `plan-images.json`** : la décision de Claude. Champs : `source`, `nom`, `role` (voir `emplacements.json`), `alt`, `mobile`, `zone_texte`, et si besoin `cadrage`, `source_mobile`.
   Pour une image à générer, la source va dans `recu/grok/` et l'entrée prend en plus `page`, `emplacement`, `priorite`, `scene` (anglais), `gabarit` ou `consigne_scene`.
4. **Grok** : `node images/grok.mjs plan-images.json --activite <activité> --direction direction.json --sortie ~/Downloads/<client>-images-grok.docx`.
   Une consigne anglaise complète par image, au format Grok (1168×784 ou 784×1168), avec les interdits communs et ceux de l'activité. Les gabarits sont dans `gabarits-grok/` (voir `LISEZMOI.md`). Écrit aussi `grok-consignes.json`.
5. **Vérifier Grok** : `node images/verifier-grok.mjs recu/grok/ plan-images.json`. Vérifie fichiers manquants, ratio (à 5 % près) et largeur, texte et filigrane, visage net, bordure, et compte les mains (indicatif, à regarder).
   Écrit `recu/grok/planche.jpg` et `verification.json`, avec une consigne corrigée pour chaque image à régénérer.
6. **Produire** : `node images/produire.mjs plan-images.json`. Recadre autour du sujet, jamais au centre par défaut, et écrit les variantes WebP du socle (`assets/images/<nom>-<w>.webp`, `<nom>-mobile-<w>.webp` en 9:16).
   Qualité 80, baissée par paliers si un fichier dépasse 300 Ko. Jamais d'agrandissement au-delà de 1,5 fois. Écrit `donnees/images.json`, avec l'appel `c.media` prêt à coller. Idempotent (`--forcer` pour tout refaire).
7. **Partage** : `node images/partage.mjs` (après `donnees/site.json` et les textes). Écrit une carte 1200×630 par page et par langue, en JPG qualité 80, et `_partage/partage.json` avec le recouvrement texte/sujet mesuré, qui doit valoir 0.

## Deux règles

- Jamais une image recadrée au centre sans avoir regardé son sujet : le cadrage vient d'`analyse.json`, ou du plan quand l'analyse se trompe.
- Jamais un visuel provisoire quand une vraie image du client existe.

## Limites connues

- Un petit objet porté (boucle d'oreille), ou un bandeau sans sujet net, donne un mauvais cadrage : le régler à la main avec le champ `cadrage` du plan.
- Le comptage des doigts est indicatif : regarder la planche.

## Tests

`node images/tests/tester.mjs [analyser] [produire] [partage] [verifier-grok] [grok]`. Le jeu de 20 images d'anciens clients (`tests/jeu.json`) est téléchargé dans `tests/.jeu/`, qui n'est pas versionné : le dépôt est public. La vérité est dans `tests/attendu.json`.
