# Panier en tiroir

Origine : `d3co-maquette/tiroir` (4) pour le tiroir et la commande (focus gardé dans le tiroir et rendu au bouton, lignes avec vignette et quantité, livraison offerte dès un seuil, coordonnées puis paiement simulé annoncé), `winsbike-atelier/drawer` (4) pour la jauge vers la livraison offerte, les options dans la clé de la ligne et le panier relu dans le stockage à chaque page, `madebymelody-maquette/boutique-panier` (4) pour le panier identique dans tous les onglets (événement `storage`) et l'envol vers le bouton (déjà tiré en `envol-vers-le-panier`, que ce module appelle sans le refaire).

Rendu générique : un seul panier par page, construit dans le bloc `[data-panier-tiroir]`, avec ses réglages en JSON. Étapes Panier, Coordonnées, Paiement (indicateur numéroté), puis confirmation avec une référence `PREFIXE-AAMMJJ-XXXX`. Suppression annulable (« Annuler » pendant 9 s), choix livraison ou retrait, TVA comprise affichée si un taux est donné. Laissé de côté (identité) : tailles et finitions de D3CO, jauge dynamométrique de Winsbike (une barre suffit ; un projet peut la redessiner), TWINT et QR simulé, pièce unique de Made by Melody.

## Usage

```html
<!-- Dans l'en-tête de chaque page : un lien vers la page de commande sans JavaScript -->
<a href="/commande" data-panier-ouvrir>Panier <span class="pet-compte" data-panier-compte>0</span></a>
<!-- Ajouter data-envol-cible sur ce bouton si envol-vers-le-panier est dans la page (et son module.css lié) -->

<!-- Une fiche produit, n'importe où -->
<article data-panier-produit>
  <img src="…" alt="…">
  <h3>Nocturne</h3>
  <select data-panier-option="Mouture"><option>Grains</option><option>Filtre</option></select>
  <select data-panier-option="Poids"><option value="250 g" data-prix="9.80">250 g</option><option value="1 kg" data-prix="34">1 kg</option></select>
  <a href="/commande#nocturne" data-panier-ajouter="nocturne" data-nom="Nocturne" data-prix="9.80">Ajouter</a>
</article>

<!-- Une fois par page, avant </body> -->
<div data-module="panier-en-tiroir" data-panier-tiroir>
  <script type="application/json" data-panier-reglages>{"devise":"EUR","seuil_livraison":45,"frais_livraison":5.9,"tva":5.5,
  "cle":"monsite-panier","prefixe":"CMD","retrait":{"adresse":"…","horaires":"…"}}</script>
</div>
<script type="module">import { init } from './modules/panier-en-tiroir/module.js'; for (const el of document.querySelectorAll('[data-module="panier-en-tiroir"]')) init(el);</script>
```

- **Déclarer un produit** : `data-panier-ajouter` (identifiant), `data-nom`, `data-prix` (TTC, en euros, point ou virgule), `data-image` (sinon la première image de la fiche), `data-options` (JSON d'options fixes, ex. `{"Format":"3 × 100 g"}`), `data-quantite`. Les champs `[data-panier-option="Nom"]` de la fiche (`select`, ou boutons radio dont celui coché) ajoutent leurs options ; un `data-prix` sur l'option choisie remplace le prix. Deux choix d'options différents font deux lignes.
- **Depuis le code** : `const panier = await init(…)` puis `panier.ajouter({ id, nom, prix, image, options }, imageSource)` et `panier.ouvrir()` ; ou `import { ajouter, ouvrir } from '…/module.js'`.
- **Compteur** : `[data-panier-compte]` (classe `pet-compte` pour la pastille) ; le bouton reçoit `aria-label` « Panier, 3 articles » et chaque ajout est annoncé (« Nocturne (Filtre, 250 g) ajouté au panier. 3 articles. »).
- **Tiroir** : `role=dialog`, `aria-modal`, le reste de la page passe en `inert`, Tab tourne dans le tiroir, Échap ou le voile ferment, le focus revient au bouton qui l'a ouvert. Après chaque changement (quantité, mode de réception), le focus reste sur le même contrôle. Sur téléphone (700 px et moins), il monte du bas sur 92 % de l'écran et se ferme en tirant la poignée vers le bas.
- **Tiroir fermé** : chaque ajout montre une annonce en bas (vignette, « Voir le panier ») pendant 4,5 s.
- **Sans JavaScript** : « Ajouter » et « Panier » sont des liens vers la page de commande simple (`commande.html` ici : quantités, options, réception, coordonnées). Cacher le compteur et les champs d'options dans un `<noscript>`.

## Réglages

`devise` ('EUR'), `seuil_livraison` (45 ; 0 = jamais offerte), `frais_livraison` (5,9), `tva` (null, ou le taux à afficher « dont TVA »), `retrait` (null, ou `{ adresse, horaires }` : propose le retrait gratuit), `livraison` (true ; false avec un retrait : retrait seul), `cle` (clé du stockage, une par site), `prefixe` (début de la référence), `envol` ('auto' | fonction | false), `commander` (envoi réel : reçoit `{ lignes, mode, coordonnees, total, paiement }`, renvoie `{ reference }`).

## Pièges

- `localStorage` est lu avant chaque modification et écrit dans un `try/catch` : navigation privée ou stockage refusé, le panier marche le temps de la page. Les coordonnées sont gardées à part (`<cle>-coordonnees`) pour préremplir la commande suivante.
- Prix stockés en centimes : jamais d'addition de nombres à virgule.
- Le tiroir fermé est `visibility: hidden` et `inert` : ses boutons ne comptent ni au clavier ni pour les lecteurs d'écran (ni pour le contrôle des cibles de 44 px).
- Tiroir ouvert, la page ne défile plus (`html.pet-verrou`, Lenis arrêté s'il tourne) ; avec le `scrollbar-gutter: stable` du socle, la gouttière de la barre de défilement reste à droite du tiroir (sur ordinateur à barres classiques), mais rien ne saute.
- Envol : le panier importe `../envol-vers-le-panier/module.js` seulement si la page a un `[data-envol-cible]` ; ne pas mettre `data-envol` sur les boutons d'ajout (l'envol partirait deux fois). Sans envol, le bouton rebondit (`pet-rebond`).
- `init()` peut être appelé sur chaque bloc `[data-module="panier-en-tiroir"]` (tiroir et zones de produits, comme le fait l'assembleur) : il n'y a qu'un panier.
- La page de commande sans JavaScript n'est pas copiée par l'assembleur (fichier HTML) : la faire dans le projet, ou viser un formulaire existant.
- L'assembleur ne reprend pas l'en-tête de la démonstration : ajouter le bouton `[data-panier-ouvrir]` (avec `data-envol-cible` si l'envol est assemblé) dans l'en-tête du projet. Sans lui, le tiroir s'ouvre par « Voir le panier » de l'annonce d'ajout (le scénario le fait aussi).

## Variantes

- Liste de devis (« Ajouter au devis », pas de paiement : `commander` envoie la demande), réservation d'ateliers, liste de cadeaux, commande à emporter (`livraison: false` et un `retrait`).
