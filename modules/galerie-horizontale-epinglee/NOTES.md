# Galerie horizontale épinglée

Origine : `surffm-maquette/emissions` (galerie des émissions, accueil).

## Usage

```html
<section class="ghe" data-module="galerie-horizontale-epinglee" data-epingle aria-labelledby="…">
  <div class="ghe__cadre">
    <div class="ghe__tete socle-cadre" data-tient>…surtitre, h2.ghe__titre, p.ghe__texte…</div>
    <div class="ghe__piste" role="region" aria-label="…" tabindex="0">
      <a class="ghe__carte" href="…" data-tient>
        <span class="ghe__visuel"><img src="…" alt="…"></span>
        <span class="ghe__corps"><span class="ghe__index">01 / 06</span><span class="ghe__nom">…</span><span class="ghe__ligne">…</span></span>
      </a>
    </div>
    <div class="ghe__pied socle-cadre" data-tient><span class="ghe__progression"><span></span></span><span class="ghe__indice">Faites glisser</span></div>
  </div>
</section>
<script type="module">import { init } from './modules/galerie-horizontale-epinglee/module.js'; init(document.querySelector('.ghe'));</script>
```

## Réglages

- `largeurMin` (900) : en dessous, défilement horizontal natif avec aimantation ; c'est aussi le comportement en mode calme et sans JavaScript.
- `parallaxe` (6 %) : glissement de l'image dans sa carte ; l'image est déjà élargie de 16 % pour ne jamais montrer son bord.
- `lissage` (1) : `scrub` de ScrollTrigger ; `true` pour un suivi exact de la molette.

## Pièges

- La hauteur des cartes vient de la hauteur restante (`flex: 1; min-height: 0` sur la piste, cartes en `height: 100%` + `aspect-ratio`), plafonnée à 640 px. Ne jamais la calculer en « 100vh moins X ».
- Le haut commence sous `--entete-h` et le bas au-dessus de `--barres-h`, mesurés par le socle : déclarer l'en-tête `[data-entete]` et les barres du bas `[data-barre]`.
- `overflow-x: clip` sur la section : sans lui, la piste en `width: max-content` crée un défilement horizontal de la page.
- Pas d'`anticipatePin` (à-coup à l'entrée). `invalidateOnRefresh` recalcule la distance après chargement des polices et des images (le socle regroupe le refresh).
- Une zone épinglée ne défile plus d'elle-même : on lui retire `tabindex` et `role` ; le focus clavier d'une carte ramène la page à la bonne position.
- Écran bas (moins de 600 px) : le paragraphe d'introduction est masqué pour garder des cartes lisibles.

## Variantes

- Sur la maquette d'origine, la dernière carte est un lien plein couleur (« Toute la semaine à l'antenne ») : ajouter une carte `.ghe__carte` avec un fond `var(--couleur-secondaire)`.
- Avec des images verticales très hautes, passer l'`aspect-ratio` des cartes à 3 / 4.
