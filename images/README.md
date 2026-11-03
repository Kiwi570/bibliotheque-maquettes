# Pipeline d'images des maquettes

Remplace le travail fait à la main sur les images (et `outils/images.py` du socle). Claude ne décide que deux choses : quelle image va où, et quel texte alternatif.
Dépendances : Playwright et sharp (`npm ci` à la racine du dépôt). Visages, objets et texte : framework Vision de macOS, fourni par le système (aucun modèle à télécharger, sans GPU) ; ailleurs, repli sur des mesures de contraste.

## Déroulé dans un projet

1. **Récupérer** (bloc Terminal pour l'utilisateur, depuis `~/Downloads/bibliotheque-maquettes`) :
   `node images/recuperer.mjs https://site-du-client.fr --sortie recu/`
   Images originales (Wix, WordPress, Squarespace, Shopify remontés à l'original), sans icônes, pixels de suivi ni doublons de taille, nommées d'après leur contexte, avec toutes les variantes du logo. Produit `~/Downloads/<client>-images.zip`, ouvert dans le Finder : c'est ce zip que l'utilisateur envoie.
   Options : `--pages 60`, `--client nom`, `--sans-zip`, `--sans-finder`. Relançable : seuls les fichiers de la récupération précédente sont effacés.
2. **Analyser** : `node images/analyser.mjs recu/ --sortie recu/analyse.json`
   Rien n'est modifié. Pour chaque image : `sujet` (rectangle en %, source visage, corps, saillance ou contrastes), `cadrage` [cx, cy] pour `c.media({ nom, cadrage: 'cx% cy%' })`, `zones_calmes` (gauche, droite, haut, bas, score 0 à 1, ton), `qualite` (netteté, bruit, compression, `faible` et ses raisons), `doublon_de`, `lisible` (texte lu dans l'image), orientation et ratio.
3. **Regarder** les planches `recu/planche.jpg`, `planche-2.jpg`… (20 images par planche : cadre jaune = sujet, croix rouge = cadrage, fond rose = à vérifier), puis lire `analyse.json`. Ne pas ouvrir les images une à une.
4. **Écrire `plan-images.json`** : la seule décision de Claude (source, nom, rôle, alt, mobile, zone_texte).
5. Commandes suivantes (`grok`, `verifier-grok`, `produire`, `partage`) : à venir.

## Deux règles

- Jamais une image recadrée au centre sans avoir regardé son sujet : le cadrage vient d'`analyse.json`.
- Jamais un visuel provisoire quand une vraie image du client existe.

## Lire les drapeaux

- `recuperation.json` : `drapeau` deviné d'après le contexte (logo, portrait, produit, lieu, plat, oeuvre, autre), à confirmer à l'œil.
- `analyse.json` : `faible` = ne tiendra pas en grand (moins de 1280 px, floue, compression visible ou bruit) ; `texte` = texte lisible dans l'image (étiquette, document, écran : attention aux métiers soumis au secret) ; `quasi-doublon` = garder celle indiquée par `doublon_de`.
