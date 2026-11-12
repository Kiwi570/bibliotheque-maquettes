# Fil conducteur

Origine (fusion) : neuf fils qui traversent une page.

- `stanislas-urbi-orbi-maquette/thread` : fil fixe en marge avec chapitres placés à la position réelle des sections (repris : les repères `data-fil-repere` et leur perle qui s'allume).
- `observatoire-des-cse-maquette/haut` (pulse.js) : points de passage posés dans les sections par `data-*`, table « hauteur maximale atteinte » pour suivre le regard, fin de page qui rattrape le bas de l'écran (repris).
- `francis-gerardin-maquette` (fil d'encre) : points `fx fy` dans la boîte d'un élément, détours et boucles, plume au bout (repris : `data-fil-point`, `data-fil-boucle`, objet au bout).
- `talon-libre-maquette/ouverture` (trace de télémark), `tonchemindevie-maquette` (fil d'or), `apasdechien-maquette` (laisse) : fil construit en JS sans section dédiée, alternance gauche/droite dans les gouttières, insets pris dans les paddings, reconstruction au refresh ScrollTrigger (repris).
- `lien-numerique-solidaire-maquette/heros` : ondulation le long d'une section, nœuds sur les étapes (repris : `onde`, perles).
- `atelier-shazak-maquette/fil`, `petitenature-maquette/hero` : départ du fil depuis l'ouverture (repris : premier point dans le héros).
- Laissé de côté (identité) : tresse, néon rouge-gorge, battement cardiaque ECG et couleur « nuit/papier » de l'observatoire, empreintes de pattes et mousqueton, dégradé or et luciole, double trait de télémark, aiguille à coudre, persienne WebGL. Tous se refont avec `template[data-fil-objet]` et les variables.

## Usage

```html
<main data-module="fil-conducteur">
  <section> … <span data-fil-point="0.35 0.6" data-fil-boucle aria-hidden="true"></span></section>
  <section data-fil="gauche"><div class="socle-cadre">…<li data-fil-repere>…</li></div></section>
  <section data-fil="droite"><div class="socle-cadre">… <img data-fil-point="0.5 0.5" data-fil-sans-perle></div></section>
  <template data-fil-objet><circle r="5"/></template>   <!-- facultatif -->
</main>
<script type="module">import { init } from './modules/fil-conducteur/module.js'; init(document.querySelector('main'));</script>
```

- `data-fil="gauche|droite|centre"` : le fil longe la section dans cette gouttière, du milieu de son padding haut au milieu de son padding bas ; d'une section à l'autre il change de côté en S dans les paddings.
- `data-fil-point="fx fy"` : passage par ce point de la boîte (détour depuis la marge si l'élément est dans une section `data-fil`) ; `data-fil-boucle` y fait un nœud ; une perle s'y pose sauf `data-fil-sans-perle`.
- `data-fil-repere` : perle sur le fil à la hauteur de l'élément, sans détour.
- Tout élément accroché reçoit `est-atteinte` quand le fil l'atteint (pour allumer un numéro, un titre).
- `init()` renvoie `{ construire, detruire }`.

## Réglages

`regard` (0.62), `marge` (0.5 de la gouttière), `cadre` ('.socle-cadre'), `onde` (10 px), `boucle` (34 px), `lissage` (0.5 s), `rail` (true), `objet` (true), `orienter` (false), `largeurTelephone` (700). Couleurs : `--couleur-accent` (fil, perles, tête), `--couleur-ligne` (rail) ; épaisseur `--fic-epaisseur` (2 px, 1,6 px sur téléphone).

## Pièges

- Lisibilité : le SVG est en `z-index: 1` dans la racine, et les enfants directs des sections (`.fic > * > *`) passent en `position: relative; z-index: 2` (sélecteur `:where`, donc toute règle de position d'un projet l'emporte). Le fil passe donc sur les fonds de section et sous tout contenu : jamais par-dessus un texte. Un élément ajouté en `data-fil-dessus` remonte aussi.
- Section qui crée son propre contexte d'empilement (`isolation`, fond en `z-index: -1`, `transform`, `opacity < 1`) : ses enfants ne peuvent plus passer au-dessus du SVG, et c'est **le fil qui recouvre son contenu** (l'audit relève « élément recouvert » sur ses titres et boutons, constaté sur alexandra-grandry-maquette). Parade : `.fic > .ma-section { position: relative; z-index: 2; }`, et le fil passe alors derrière toute la section.
- Construire le fil après l'ouverture de la page (`quand('pret', …)` du socle de la skill) : sur une page longue, le calcul de la table de longueurs au chargement a retardé l'intro au-delà de 3 s (alexandra-grandry).
- Table de longueurs : elle est calculée en JavaScript à partir des segments du tracé (courbes échantillonnées, puis mises à l'échelle de `getTotalLength()`), jamais avec `getPointAtLength` en boucle, qui a coûté une tâche de 790 ms à chaque reconstruction sur lydiacourtois. Un projet qui modifie le tracé garde `ligne()` et `courbe()` pour que la table suive.
- Fluidité : `cible()` ne lit ni `document.documentElement.scrollHeight`, ni `scrollY`, ni `innerHeight` à chaque image. Lus dans le rappel de ScrollTrigger, juste après les écritures de style des autres scènes, ils forcent un recalcul complet du style à chaque image : 955 ms sur 15 pas de molette (processeur ralenti 4 fois), et l'échec « fluidité » de l'accueil sur locomponairo. Parade : hauteur de page et d'écran relevées dans `construire()` (appelée à chaque refresh), position tirée du déclencheur (`st.start + st.progress * (st.end - st.start)`).
- Placer les points dans des zones vides (colonne libre, image) : le fil passe derrière, il ne doit pas zébrer un paragraphe. Les traversées d'un côté à l'autre se font dans les paddings ; prévoir des paddings ≥ 72 px.
- Le SVG prend `inset: 0` de la racine (jamais une hauteur fixée) : il ne peut pas allonger la page, donc pas de boucle de recalcul. Reconstruction à chaque refresh de ScrollTrigger (socle : redimensionnement, polices, images, hauteur du body), pin-spacer compris.
- Gouttière d'une section mesurée sur son premier `.conteneur` : quand c'est un en-tête centré et étroit (46 rem), le fil se place au milieu de la colonne de gauche et traverse les textes des blocs suivants (locomponairo, page Chambres, 12 novembre 2026). Mesurer la plus petite gouttière de tous les cadres visibles de la section (le plus large).
- Un point masqué (`display: none`) est ignoré : on peut cacher un point sur téléphone, ou au contraire lui donner une hauteur nulle pour fixer la hauteur de départ.
- Sous 700 px : fil droit dans la marge gauche, sans onde ni boucle, points projetés sur le fil (perles comprises). Prévoir au moins 12 px de gouttière.
- Mode calme et « réduire les animations » : fil entier, perles pleines, pas d'objet. Sans JavaScript : pas de fil (décor pur, `aria-hidden`).

## Variantes

- Fil fixe en marge (stanislas, shazak) : une seule section `data-fil` très haute, `onde: 0`, repères sur les titres.
- Objet au bout : plume, mousqueton, luciole via `template[data-fil-objet]`, avec `orienter: true` pour une aiguille ou une flèche.
- Ligne de pouls agitée (observatoire) : mécanique canvas, garder ce module pour le chemin et ajouter le motif dans un projet.
