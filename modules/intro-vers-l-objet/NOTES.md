# Intro qui devient la page

Origine : madebymelody-maquette (v2) : le disque de la platine glisse jusqu'au vinyle du héros puis l'écran s'ouvre depuis lui.

## Usage

```html
<head><script>/* script critique : copier celui de index.html (classe html.ivo-intro, sauf mode calme) */</script></head>
<body>
  <section> … <div class="objet" data-iris-centre="disque"></div> … </section>
  <div class="ivo" data-module="intro-vers-l-objet" aria-hidden="true">
    <div class="ivo__scene"><div class="ivo__objet"><div class="objet"></div></div><p class="ivo__legende">Face A</p></div>
    <p class="ivo__passer">Touchez pour passer</p>
  </div>
  <script type="module">import { init } from './modules/intro-vers-l-objet/module.js'; init(document.querySelector('.ivo'));</script>
</body>
```

Dans le socle de la skill, l'intro est déjà gérée (`demarrer({ jouer })`) : n'y reprendre que `versObjet(tl, { panneau, objet, cible, a })`, ajouté à la timeline de l'intro avant de la renvoyer. Chaque page marque son objet d'ouverture `data-iris-centre` (pochette, bandeau, bac, étiquette…).

## Réglages

`init` : `tourner` (true), `cible`, `fin`. `versObjet` : `a` (instant du départ, 1,1 s), `duree` (0,5 s), `ouverture` (0,8 s), `echelleMin` (0,3), `echelleMax` (1,3). Couleur du panneau : `--ivo-fond`.

## Pièges

- Mesurer la cible au moment de construire la timeline (polices et première image prêtes), jamais pendant.
- Cible qui dépasse en bas de l'écran (bandeau sous le titre) : c'est le centre de sa partie visible qui est visé, sinon l'objet partirait hors de l'écran et le trou s'ouvrirait de nulle part.
- `data-iris-centre="disque"` seulement pour un objet rond qui ressemble à celui de l'intro et qui est entier à l'écran : le trou démarre à son rayon, et l'objet de l'intro est remplacé exactement par celui de la page.
- Tout effet long (titre qui se coud, compteur) se joue hors de la timeline de l'intro : sinon l'intro dépasse 3 s et le socle l'accélère en entier.
- Première action : accélère ; seconde : passe. Garde-fou à 3,5 s.

## Variantes

- Logo ou cachet qui se pose sur le tampon de l'ouverture ; boussole qui se pose sur la carte ; ticket qui se pose sur le comptoir.
