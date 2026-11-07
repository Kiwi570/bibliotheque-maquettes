# Plan de salle

**Créé à part** (`provenance : à part`) : ce module n'est tiré d'aucune maquette validée, il n'a pas encore servi dans un projet. Inspirations (détail plus bas) : la visite panoramique de la terrasse des Jardins de l'Hacienda et le module `carte-a-calques`. Famille « Restaurant : effet wouahou » (restaurants, cafés, bars, caves, traiteurs avec salle).

La salle vue de dessus, en SVG, posée sur un plan qui s'incline en 3D quand elle arrive à l'écran (ScrollTrigger : en remontant au-dessus, elle se remet à plat en sortant par le bas, la prochaine arrivée la rejoue) et suit un peu la souris ; les tables apparaissent une à une avec leurs chaises. On choisit une table sur le plan ou dans la liste : elle passe à la couleur d'accent, une onde l'entoure, un repère se dresse au-dessus (nom, places, zone) et « Réserver cette table » ouvre la réservation avec `?table=…&couverts=…`. Les zones (au coin du feu, les fenêtres, la grande table, la terrasse) se filtrent ; les tables prises sont hachurées ; celles trop petites pour le nombre de couverts sont estompées.

## Inspirations

- `jardins-hacienda-maquette/terrasse-piscine-visite-360` : faire découvrir le lieu avant de venir, en le parcourant soi-même.
- `carte-a-calques` : plan SVG dont la légende sert de liste texte, zones qu'on allume, choix dans la liste qui ressort sur le plan.

## Usage

```html
<section class="pds" data-module="plan-de-salle" data-reservation="/reserver" aria-labelledby="pds-titre">
  <div class="pds__grille socle-cadre">
    <div class="pds__tete">…surtitre, h2#pds-titre, p…</div>
    <div class="pds__outils">
      <div class="pds__filtres" role="group" aria-label="Zones de la salle" data-pds-filtres></div>   <!-- rempli par le module -->
      <div class="pds__couverts"><label class="pds__libelle" for="pds-couverts">Couverts</label>
        <div class="pds__qte"><button type="button" data-pds-moins aria-label="Un couvert de moins">−</button><input type="number" id="pds-couverts" value="2" min="1" max="12"><button type="button" data-pds-plus aria-label="Un couvert de plus">+</button></div></div>
    </div>
    <div class="pds__scene"><div class="pds__plan"><div class="pds__sol">
      <svg class="pds__svg" viewBox="0 0 1000 640" aria-hidden="true" focusable="false">
        …décor de la salle : sol, murs (.pds__mur), vitres (.pds__vitre), cheminée, bar, terrasse, eau (.pds__eau), plantes,
        zones à allumer <rect class="pds__zone" data-zone="cheminee" …/>, étiquettes <g class="pds__etiquettes"><text>…</text></g>…
      </svg>                                                         <!-- les tables y sont ajoutées par le module -->
    </div></div></div>
    <div class="pds__panneau">
      <ul class="pds__liste">
        <li class="pds__item" data-table="2" data-zone="cheminee" data-places="4" data-forme="carree" data-x="160" data-y="336" data-l="66">
          <a class="pds__lien" href="/reserver?table=2&amp;couverts=4"><span class="pds__num">2</span><span class="pds__texte"><span class="pds__nom">Table 2</span>
            <span class="pds__info"><span class="pds__zone-nom">Au coin du feu</span> · 4 places</span><span class="pds__note">La plus proche du feu</span></span></a></li>
        <li class="pds__item" data-table="3" … data-prise><span class="pds__lien">…<span class="pds__etat">Prise ce soir</span></span></li>
      </ul>
      <div class="pds__action">
        <p class="pds__choix" aria-live="polite" data-pds-choix>Choisissez une table libre sur le plan ou dans la liste.</p>
        <a class="socle-bouton socle-bouton--plein pds__reserver" data-pds-reserver aria-disabled="true">Réserver cette table</a>
      </div>
    </div>
  </div>
</section>
<script type="module">
  import { init } from './modules/plan-de-salle/module.js';
  const api = await init(document.querySelector('[data-module="plan-de-salle"]'), { prises: [] });
</script>
```

- **La liste est la source** : chaque `li.pds__item` donne la table (`data-table`, envoyé tel quel à la réservation), sa zone (`data-zone`, nom affiché dans `.pds__zone-nom`), ses places (`data-places`), sa forme (`ronde`, `carree`, `longue`), son centre en unités du plan (`data-x`, `data-y`, viewBox 1000 × 640), sa taille (`data-l` : diamètre ou largeur, `data-h` : profondeur d'une table longue), une rotation (`data-r`, degrés) et `data-prise`. Le module dessine la table et ses chaises (rondes : tout autour ; carrées : une par côté ; longues : des deux côtés, un bout de chaque côté à partir de six).
- **Le décor est à dessiner** pour chaque salle dans le SVG (sol en motif, murs, vitres, cheminée, bar, terrasse) ; les classes de la démonstration ont leurs couleurs dans `module.css`. Les zones qui s'allument au filtre sont des `.pds__zone[data-zone]` (facultatives). Garder des identifiants de motifs uniques s'il y a deux plans dans la page.
- Couleurs : `--pds-table`, `--pds-chaise`, `--pds-parquet`, `--pds-dalle`, `--pds-eau`, `--pds-vert`, `--pds-vitre` (la démonstration fixe l'eau, le vert et les vitres, absents de la palette). Inclinaison : `--pds-incl` (32°, 24° sur téléphone), `--pds-tour` (−6°, 0°), `--pds-ech` (0,9).

## Réservation (compatibilité avec `reservation-de-table`)

- Le bouton mène à `data-reservation` (ou l'option `reservation`) avec `?table=<data-table>&couverts=<n>&espace=<salle|terrasse>` ; les paramètres déjà présents dans l'adresse sont gardés, une ancre aussi (`/reserver#formulaire` → `/reserver?table=4&couverts=2&espace=salle#formulaire`). Noms changeables, ou retirés avec `null` : `parametres: { table: 'table', couverts: 'couverts', espace: 'espace' }`.
- `espace` : `data-espace` de la table, sinon `terrasse` pour la zone `terrasse` et `salle` pour les autres (les identifiants des espaces de `reservation-de-table`).
- Le module `reservation-de-table` lit ces trois paramètres : couverts et installation préremplis, table gardée dans un champ caché `table`, rappelée dans le récapitulatif (« En salle · table 5 ») et envoyée avec la demande. La démonstration mène à sa démonstration. Si la terrasse est hors saison ce jour-là, la réservation repasse en salle : prévenir le client (tables de terrasse en `data-prise` hors saison, ou `api.prises()`).
- Sans JavaScript, chaque lien de la liste porte déjà ces paramètres (les places de la table comme couverts).
- Retour : avec `lireAdresse` (vrai), le plan relit `?table=` et `?couverts=` de sa propre adresse et remontre la table choisie.
- Événement `pds:choix` (sur la section, `detail` = `{ table, couverts, url }`) à chaque choix.

## Accessibilité, téléphone, sans JavaScript

- Le plan est décoratif (`aria-hidden`) : au clavier et au lecteur d'écran, on passe par la liste, dont les liens deviennent des boutons (`aria-pressed`, `aria-disabled` pour une table prise ou trop petite, avec la raison dans le texte). Le choix est annoncé (`aria-live`). Les zones sont des boutons `aria-pressed` avec le nombre de tables libres.
- Téléphone : plan moins incliné, zones en une rangée qu'on fait glisser, liste sous le plan (lignes de 56 px), barre de réservation collée en bas de l'écran pendant qu'on parcourt la liste ; toucher une table du plan marche aussi.
- Grand écran : le plan reste à l'écran (collant) pendant qu'on parcourt la liste, la réservation reste en haut de la colonne.
- Sans JavaScript (`@media (scripting: none)`) : ni plan ni outils, la liste de liens (chaque table libre mène à la réservation avec ses places comme couverts, les tables prises ne sont pas des liens).

## API

`api.choisir(id | null)`, `api.filtrer(zone | '')`, `api.couverts(n)`, `api.prises(ids)` (tables prises en direct, depuis l'outil de réservation), `api.choisie`, `api.detruire()`.

## Pièges

- Coordonnées en unités du viewBox (1000 × 640) : changer le viewBox oblige à changer `module.css` (`aspect-ratio`) et le calcul du repère (`x / 10`, `y / 6.4` en pourcentage).
- Le plan et le repère vivent dans un contexte 3D (`.pds__sol`, `transform-style: preserve-3d`) : pas de `filter`, `opacity` ni `overflow: hidden` sur `.pds__sol`, ils l'aplatiraient (l'ombre du plan est sur le SVG).
- L'inclinaison est en variables CSS (`--pds-incl`, `--pds-tour`, `--pds-ech`) : le module les anime puis rend la main au CSS, ne pas les fixer en ligne.
- Les numéros de table sont dans le SVG (décoratif) : le nom lisible est dans la liste (`.pds__nom`).
- Mode calme et « réduire les animations » : plan incliné d'emblée, tables posées, onde fixe, repère sans élan, aucun jeu sous la souris.

## Variantes

- Bar à cocktails : comptoir en tabourets (petites tables rondes d'une place) et box ; cave : tonneaux-mange-debout ; traiteur ou salle de réception : plan des tables rondes d'un mariage, `couverts` jusqu'à 12.
- Choix d'une zone seulement (sans table précise) : une table par zone, `data-l` grand, et le paramètre `table` renommé `zone`.
