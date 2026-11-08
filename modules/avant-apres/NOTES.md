# Avant / après

Origine : `swiss-cloisons-solutions-maquette/avant-apres` (4) pour la vitre (photo avant peinte floutée dans un canvas, gomme en `destination-out` le long du geste, curseur clavier et « tout révéler » en secours) et `btp-confort-avenir-maquette/realisations` (4) pour le réglet (le `range` natif reste l'élément accessible, la séparation suit sa valeur, réglet gradué, la séparation glisse d'elle-même à l'entrée). Rôle preuves.

Rendu générique : deux modes au choix (`data-mode` de la section ou d'une paire), plusieurs chantiers en **onglets** accessibles avec vignette, une **légende par paire**. Vitre plus réaliste que l'origine (buée, gouttelettes, coulures qui laissent deviner l'après, reflet en biais) et qui se dégage seule passé un seuil, par un coup de raclette. Laissé de côté (identité) : le tampon et le libellé de pourcentages de BTP, la ligne de balayage rouge, les textes et photos des deux chantiers.

## Usage

```html
<section class="ava" data-module="avant-apres" data-mode="reglet" data-onglets aria-labelledby="t">
  <noscript><style>…recopier celui de index.html : photos côte à côte…</style></noscript>
  <h2 id="t">…</h2>
  <div class="ava__onglets" data-ava-onglets></div>              <!-- place réservée des onglets (s'il y a plusieurs paires) -->
  <div class="ava__paires">
    <figure class="ava__paire" data-titre="Salle d'eau">          <!-- data-mode="vitre" possible sur une paire -->
      <div class="ava__cadre" style="--ratio: 3 / 2">
        <div class="ava__vue ava__vue--avant"><img src="…" width="1600" height="1067" alt="Avant : …"><span class="ava__etiquette">Avant</span></div>
        <div class="ava__vue ava__vue--apres"><img src="…" width="1600" height="1067" alt="Après : …"><span class="ava__etiquette">Après</span></div>
      </div>
      <figcaption class="ava__legende"><b>Salle d'eau, 6 m²</b><span>…</span></figcaption>
    </figure> …
  </div>
</section>
<script type="module">import { init } from './modules/avant-apres/module.js'; for (const el of document.querySelectorAll('[data-module="avant-apres"]')) init(el);</script>
```

- **Réglet** : on attrape n'importe où dans la photo (souris : tout de suite ; doigt : seulement si le geste est horizontal, sinon la page défile ; un toucher bref amène la séparation au doigt). Le curseur `input[type=range]` invisible porte le focus : flèches ± 5 % (Maj ± 1 %), Début, Fin, Page ; `aria-valuetext` « Avant 60 %, après 40 % ». À l'entrée dans l'écran, la séparation part de 88 % et glisse jusqu'au départ (une fois, jamais si le visiteur a déjà touché).
- **Vitre** : la photo avant est peinte derrière la buée dans un canvas placé dans la vue avant ; l'image reste dans la page (transparente) pour les lecteurs d'écran. À la souris, la vitre s'essuie au passage ; au doigt, en frottant (`touch-action: pan-y` : le défilement vertical n'est jamais bloqué). Passé 62 % essuyés, ou par « Tout voir » (bouton dans le cadre, `aria-pressed`), un coup de raclette dégage tout ; le bouton devient « Remettre la buée ». Les changements sont annoncés (`aria-live`).
- **Onglets** : `role=tablist`, flèches, Début, Fin ; vignette tirée de la photo après ; chaque paire garde son état (vitre essuyée, position du réglet).
- `init()` renvoie `{ aller(i), toutVoir(v), detruire }`.

## Réglages

`mode` ('reglet' | 'vitre'), `depart` (50), `balayage` (true), `pinceau` (0,08 de la largeur), `survol` (true), `seuil` (0,62 ; 0 = jamais), `buee` (1 ; 0,5 à 1,5), `voile` (couleur rgba de la buée). Attribut `data-onglets` sur la section pour les onglets, `data-onglets-libelle` pour leur nom lu (« Chantiers »).

## Pièges

- Les deux photos doivent être prises **du même point, à la même focale** : sinon la séparation montre un décalage, pas une transformation. Les recadrer à l'identique avant de les exporter.
- La paire est superposée dès le CSS (séparation au milieu avant le JavaScript) et les onglets ont leur place réservée (`[data-ava-onglets]`, 64 px) : aucun décalage au chargement. Sans cette place, les onglets créés par le script poussent la page.
- Sans JavaScript, c'est le `<noscript>` de la section qui remet les photos côte à côte : le recopier avec le bloc.
- Le canvas est peint depuis l'image avant décodée (`img.decode()`) : une photo d'un autre domaine sans CORS s'affiche, mais seule la buée peut être lue (le masque est un canvas à part, jamais l'image).
- Mode calme : la vitre devient un réglet posé au milieu, sans buée ni balayage.
- La consigne « Essuyez la vitre » change au doigt (« Frottez la vitre du doigt ») par `@media (hover: none)`.

## Variantes

- Restauration de meuble, carrosserie, toilettage, jardin repris, façade ravalée, photo d'archive et photo d'aujourd'hui, plan et réalisation.
- Vitre seule sans avant : un visuel dévoilé sous la buée (`seuil` bas, pas d'étiquettes).
