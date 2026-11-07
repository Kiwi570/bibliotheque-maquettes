# Carte du restaurant

Origine : `pizzalyght-maquette/carte-barre` (4) pour la barre collante (rubriques avec rubrique en cours suivie au défilement, filtres, recherche tolérante aux accents, apostrophes et pluriels, déclencheurs recalculés seulement si la liste affichée change) et `jardins-hacienda-maquette/la-carte-la-carte` (4) pour la carte elle-même (rubriques en volets, « nom ……… prix » en pointillés, description, photo de rubrique). Famille « restaurant : informer, rassurer, faire réserver ».

Rendu générique : la carte vient d'**un fichier JSON** (modèle : `exemple-carte.json`), écrit en HTML dans la page par `generer-carte.mjs` : elle est lisible sans JavaScript et indexée. Ajouts : pictogrammes des 14 allergènes réglementaires sous chaque plat et leur légende, filtres végétarien, sans gluten et à partager (configurables), prix à plusieurs formats (verre, pichet, bouteille), mention (« Maison », « Signature »), plus aucune dépendance (ni GSAP ni ScrollTrigger). Laissé de côté (identité) : les textes, photos et illustrations des deux maquettes.

## Usage

```html
<section class="carte-resto socle-cadre" data-module="carte-du-restaurant" aria-labelledby="carte-titre">
  <header class="carte-resto__tete">…surtitre, h2#carte-titre, p…</header>
  <div class="carte-resto__carte" data-carte>            <!-- data-source="/carte.json" : facultatif, voir plus bas -->
<!-- carte:debut -->
<!-- carte:fin -->
  </div>
</section>
<script type="module">
  import { init } from './modules/carte-du-restaurant/module.js';
  const api = await init(document.querySelector('[data-module="carte-du-restaurant"]'));
</script>
```

Écrire la carte dans la page (à chaque changement de carte) :
`node modules/carte-du-restaurant/generer-carte.mjs carte.json --dans index.html` (remplace ce qui est entre les deux marqueurs ; sans `--dans`, le HTML sort à l'écran).

## Le fichier de la carte

```json
{ "devise": "EUR",
  "filtres": ["vegetarien", "sans-gluten", "a-partager"],
  "recherche_exemple": "Chercher : cèpes, chocolat…",
  "mention_allergenes": "…", "mentions": "Prix nets, service compris…",
  "rubriques": [
    { "id": "entrees", "titre": "Entrées", "note": "Selon le marché.", "photo": { "src": "…", "alt": "…", "largeur": 1200, "hauteur": 1500 },
      "plats": [ { "nom": "Velouté de potimarron", "description": "…", "prix": 9, "mention": "Maison",
                   "allergenes": ["lait", "fruits-a-coque"], "vegetarien": true, "sans_gluten": true } ] },
    { "titre": "À partager", "partager": true, "plats": [ … ] },
    { "titre": "Vins", "plats": [ { "nom": "Côtes-du-rhône", "prix": [ { "libelle": "12 cl", "prix": 6 }, { "libelle": "75 cl", "prix": 29 } ] } ] } ] }
```

- `prix` : nombre (9, 9.5 → « 9,50 € »), texte (« selon arrivage ») ou liste de formats.
- `allergenes` : `gluten`, `crustaces`, `oeufs`, `poissons`, `arachides`, `soja`, `lait`, `fruits-a-coque`, `celeri`, `moutarde`, `sesame`, `sulfites`, `lupin`, `mollusques` (règlement UE 1169/2011). La légende les montre tous (ceux absents de la carte en grisé) ; `"legende_complete": false` n'y garde que ceux de la carte.
- Régimes : `vegetarien`, `sans_gluten` (ou `regimes: ["vegan", …]`), `partager` sur un plat ou sur toute la rubrique. **« Sans gluten » se déclare toujours** : il ne se déduit jamais de l'absence de l'allergène, et il tombe si le plat porte `gluten`.
- `filtres` : ceux de la barre, dans l'ordre (`vegetarien`, `vegan`, `sans-gluten`, `a-partager`). `"recherche": false` retire la recherche.

## Comportement

- Barre collante sous l'en-tête : liens des rubriques (avec leur nombre de plats), filtres, recherche. La rubrique qui passe sous la barre s'allume et son lien revient au milieu de la barre. Un lien amène la rubrique juste sous la barre (défilement adouci du socle s'il est là) et lui donne le focus.
- Filtres : tous ceux choisis à la fois (végétarien **et** sans gluten). Recherche : tous les mots, sans accents ni pluriels (« cepe » trouve « cèpes »). Rubriques vides masquées avec leur lien, nombres à jour, nombre de plats annoncé aux lecteurs d'écran, message « aucun plat » avec un bouton « Toute la carte ». Si la liste raccourcit alors qu'on est plus bas, la carte revient à son début.
- Sans JavaScript : la carte, les ancres (`scroll-margin-top` sous la barre) et la légende ; filtres et recherche restent masqués (`hidden`).
- `data-source` (ou l'option `source`) : le navigateur relit le JSON et réécrit la carte (pour une carte changée souvent sans régénérer la page) ; s'il manque, la carte de la page reste. Toujours garder la carte écrite dans la page pour les moteurs et le sans JavaScript.
- `init()` renvoie `{ filtrer(['vegetarien']), detruire() }` (lien « nos plats végétariens » depuis une autre section).

## Pièges

- Ne pas élargir la page : le fond pleine largeur de la barre est un `border-image` qui déborde sur les côtés. Un pseudo-élément étiré en `100vmax` élargissait la page ; sur téléphone, le navigateur dézoomait alors et la page entière changeait d'échelle.
- Un `scrollTo({ behavior: 'smooth' })` sur la barre annule celui de la page dans Chrome : la barre glisse par une petite animation à la main.
- Téléphone : deux rangées seulement (rubriques, puis filtres qui défilent à l'horizontale et recherche repliée en loupe qui s'ouvre au toucher) pour que la barre collante laisse la carte lisible.
- Le texte de recherche de chaque plat est calculé à la génération (`data-texte`) : nom, description et régimes.
- Mention « allergènes à titre d'information » à garder : c'est la cuisine qui fait foi.

## Variantes

- Pizzeria : rubrique « Pizzas » avec `"filtres": ["vegetarien", "a-partager"]` et des formats (`"prix": [{ "libelle": "Moyenne", "prix": 11 }, { "libelle": "Grande", "prix": 14 }]`).
- Boulangerie, traiteur : rubriques par moment (« Le matin », « À midi », « Pour recevoir »), `"recherche": false` si la liste est courte.
- Bar : « Cocktails », « Sans alcool », « À grignoter », filtre `a-partager` seul.
