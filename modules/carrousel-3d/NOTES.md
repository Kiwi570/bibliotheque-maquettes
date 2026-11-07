# Carrousel 3D

Origine : `agence-ae-maquette` (page Réalisations, « carrousel 3D courbe de 12 projets », v2 demandée par le client pour « plus d'animations wouahou modernes »). Mécanique rendue générique : nombre de cartes libre, rayon calculé, flèches et clavier, repli en rangée.

## Usage

```html
<section class="c3d" data-module="carrousel-3d" aria-labelledby="c3d-titre">
  <div class="c3d__tete socle-cadre">…surtitre, h2.c3d__titre#c3d-titre, p.c3d__intro…</div>
  <div class="c3d__scene" tabindex="0" role="region" aria-label="Carrousel : flèches gauche et droite pour tourner">
    <ul class="c3d__cylindre">
      <li class="c3d__carte"><a class="c3d__lien" href="…"><figure class="c3d__media"><img src="…" alt="…"></figure><span class="c3d__nom">…</span><span class="c3d__ligne">…</span></a></li>
      … (8 à 12 cartes)
    </ul>
  </div>
  <div class="c3d__commandes"><button class="c3d__prec" aria-label="Précédent">…</button><p class="c3d__indice" aria-hidden="true">Faites tourner</p><button class="c3d__suiv" aria-label="Suivant">…</button></div>
</section>
<script type="module">import { init } from './module.js'; init(document.querySelector('.c3d'), { tour: 180 });</script>
```

La largeur des cartes se règle par `--c3d-l` sur `.c3d__scene` (190 à 290 px par défaut) ; le rayon du cylindre en découle (`--c3d-r`, mesuré).

## Pièges

- Cartes de profil ou de dos : invisibles (`backface-visibility: hidden`, fondu selon l'angle), non cliquables et hors tabulation. Sans cela, l'audit trouve des cibles sous 44 px et le clavier atteint des cartes qu'on ne voit pas (agence-ae).
- Un glissement n'est pas un clic : au-delà de 6 px, le clic sur la carte sous le doigt est annulé.
- `touch-action: pan-y` sur la scène : au doigt, le glissement horizontal tourne le cylindre, le défilement vertical reste libre.
- La boucle ne tourne que pendant l'élan ou le retour à une carte ; au repos, rien ne tourne (mode calme et audit « aucune boucle »).
- Sans JavaScript, en mode calme et sous « réduire les animations » : rangée qui défile à l'horizontale avec aimantation, flèches qui la font défiler.
- Images : 3:4, 640 px de large suffisent ; jamais de texte important dans l'image (la carte est vue de biais).
