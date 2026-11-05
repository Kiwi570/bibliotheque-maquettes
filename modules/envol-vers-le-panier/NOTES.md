# Envol vers le panier

Origine : madebymelody-maquette (v2) : boutique, ajout d'une pièce unique.

## Usage

```html
<button data-envol-cible>Panier <b>0</b></button>                     <!-- dans l'en-tête et/ou la barre du bas -->
<section data-module="envol-vers-le-panier">
  <article data-envol-carte><img …><button data-envol aria-pressed="false">Ajouter</button></article> …
</section>
<script type="module">import { init } from './modules/envol-vers-le-panier/module.js'; init(document.querySelector('[data-module="envol-vers-le-panier"]'));</script>
```

Ou, depuis le code du panier du projet : `import { envol } from '…/module.js'; envol({ depuis: carte.querySelector('img'), vers: '[data-panier-bouton]' })`.

- La photo (ou la carte) s'arrondit, file en arc vers le premier bouton du panier affiché, tourne et rétrécit, puis le bouton rebondit (`est-recu`).
- En-tête rétracté par le défilement : il redescend (classe `entete-cache` retirée sur `html`, ou `montrer(cible)` fourni par le projet) et l'envol vise sa position finale.
- Mode calme : pas d'envol, rebond seul.

## Réglages

`bouton`, `carte`, `vers`, `forme` ('disque' ou 'carte'), `quand(bouton)` (par défaut : `aria-pressed` devient « true » ; un retrait du panier ne déclenche rien), `duree` (0,8 s, sur `envol`).

## Pièges

- Le module attend une image de rendu (`requestAnimationFrame`) avant de décider : le code du panier a le temps de mettre `aria-pressed` à jour.
- La cible est le premier bouton réellement affiché (`offsetParent`, largeur, visibilité) : un bouton masqué par une règle d'écran n'est jamais visé.
- La pastille est un élément fixe temporaire, `aria-hidden`, retiré à l'arrivée : rien ne reste dans la page.

## Variantes

- Réservation : le billet file vers le récapitulatif ; favoris : le cœur file vers la liste ; devis : la ligne file vers le total.
