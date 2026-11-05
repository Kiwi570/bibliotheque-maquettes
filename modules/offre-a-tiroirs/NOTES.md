# Offre à tiroirs

Origine : `icc-maquette/formations` (catalogue de prestations filtré, carte ouverte au clavier), `instinct-aventure-maquette/formules` (offres avec prix d'appel et visuel), `h-renovation-maquette/services-cave-humide-avantages` (le geste du métier appliqué à une liste : ardoises qui basculent sur leur clou) et `willowcamp-maquette/facons` (planche collante qui suit l'élément lu). Module de base : des offres et prestations sur 30 maquettes, réécrites à chaque fois jusqu'ici. Grille wouahou, point 6 : ouvrir un tiroir est un geste du métier, pas une galerie générique.

## Usage

```html
<section class="ofr socle-cadre" data-module="offre-a-tiroirs" aria-labelledby="ofr-titre">
  <div class="ofr__tete"><h2 class="ofr__h2" id="ofr-titre">Ce que nous faisons</h2></div>
  <div class="ofr__corps">                                          <!-- la colonne d'images s'y insère sur ordinateur -->
    <ol class="ofr__tiroirs">
      <li class="ofr__tiroir" id="renovation" data-sujet="Rénovation complète">
        <h3 class="ofr__titre"><button type="button" class="ofr__poignee">
          <span class="ofr__num">01</span><span class="ofr__nom">Rénovation complète</span>
          <span class="ofr__resume">De la conception à la remise des clés</span><span class="ofr__prix">sur devis</span>
        </button></h3>
        <div class="ofr__contenu"><div class="ofr__interieur">
          <figure class="ofr__image"><img src="…" alt="…" width="1200" height="750"></figure>   <!-- facultatif -->
          <p>…</p><ul><li>…</li></ul>
          <a class="socle-bouton socle-bouton--plein ofr__parler" href="/contact#demande">En parler</a>
        </div></div>
      </li>
    </ol>
  </div>
</section>
<script type="module">import { init } from './modules/offre-a-tiroirs/module.js'; init(document.querySelector('.ofr'));</script>
```

- Sans JavaScript, tous les tiroirs sont dépliés et lisibles. Dans le socle de la skill, les prestations viennent d'un fichier de données et le gabarit écrit les tiroirs.
- `init()` renvoie `{ ouvrir, detruire }` : `ouvrir(1)` ou `ouvrir('renovation')`.
- Un lien vers `#renovation` (depuis une autre page ou la même) ouvre ce tiroir : c'est le lien profond que l'audit de la skill vérifie.

## Réglages

`ouvert` (0), `unSeul` (true), `visuels` (true), `data-sujet` : voir `module.json`.

## Pièges

- Le dépliage passe par `grid-template-rows: 0fr → 1fr` : aucune hauteur mesurée ni écrite en dur, donc rien à recalculer quand le texte passe à la ligne. Aucun espacement vertical en `padding` dans `.ofr__interieur` (il resterait visible tiroir fermé) : des marges sur les enfants et un `::after`.
- Avant que le module tourne, le CSS pose déjà l'état de départ quand JavaScript est actif (`@media (scripting: enabled)`) : premier tiroir ouvert, deux colonnes réservées sur ordinateur. Sans cela, les tiroirs se refermaient et la liste se décalait sous les yeux (CLS 0,002 à 2560 px). Avec `ouvert: null` ou un autre index, ce premier état ne correspond plus : léger saut au chargement.
- Les contenus fermés sont `inert` : la tabulation ne s'y perd pas. Flèches haut et bas, Début et Fin entre les poignées.
- La colonne collante est une copie décorative (`aria-hidden`) des images des tiroirs : le texte alternatif reste sur l'image du tiroir. Sa hauteur est plafonnée à l'écran sous l'en-tête mesuré (`--entete-h`), elle tient sur un écran bas (1000×560).
- « En parler » reçoit `?sujet=` : le formulaire du socle de la skill se préremplit.

## Variantes

- Ardoises qui basculent sur leur clou (`h-renovation`) ou carnet dont on tourne les pages : même structure (poignée, contenu), autre geste à l'ouverture, réglé dans le CSS de `.est-ouvert`.
- Plusieurs tiroirs ouverts à la fois (`unSeul: false`), par exemple pour une FAQ courte.
