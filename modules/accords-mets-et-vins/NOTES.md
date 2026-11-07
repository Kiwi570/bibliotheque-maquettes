# Accords mets et vins

Origine : `artic-maquette/projets-distribotion-produits` (« Cinq étapes, un verre à remplir », 5 : un verre en SVG qui se remplit par le fond au défilement, mousse, bulles qui montent dans le liquide sans jamais le dépasser) et `chateau-haut-piquat-maquette/oenotourisme-ecrivins` (« Votre assemblage », 5 : la robe du vin change de couleur avec les cépages et un texte décrit le vin). Famille « Restaurant : effet wouahou » (restaurants, cafés, bars, caves, traiteurs).

On touche un plat de la carte : le verre se vide, change de forme si la boisson le demande (ballon pour le rouge, tulipe pour le blanc, flûte pour les bulles, coupe pour le cocktail, pinte pour la bière, gobelet pour le thé), puis se remplit **par le fond** de la couleur conseillée, avec une houle qui s'apaise, des bulles ou une mousse ; un halo de la même couleur s'allume derrière. La fiche à côté donne le type, le nom, la région et le mot du sommelier. À l'arrivée à l'écran, le verre du plat choisi d'avance se remplit une première fois.

Rendu générique : verre dessiné par le module (six formes décrites par la même suite de courbes, d'où le passage de l'une à l'autre sans bibliothèque de morphing), contenu dans un JSON, liste de la page en repli. Laissé de côté (identité) : la frise d'étapes et l'année qui défile d'Artic, les curseurs d'assemblage du château.

## Usage

```html
<section class="ame" data-module="accords-mets-et-vins" data-source="/accords.json" aria-labelledby="ame-titre">
  <div class="ame__grille socle-cadre">
    <div class="ame__tete">…surtitre, h2#ame-titre, p…</div>
    <ul class="ame__liste" data-choisi="joue">                        <!-- data-choisi facultatif -->
      <li class="ame__plat" data-plat="joue" data-type="vin-rouge" data-couleur="#6c1527" style="--c: #6c1527">   <!-- data-verre, data-bulles, data-mousse facultatifs -->
        <span class="ame__pastille" aria-hidden="true"></span>
        <p class="ame__moment">Plat</p>
        <h3 class="ame__nom">Joue de bœuf confite</h3>
        <p class="ame__detail">Sauce au vin rouge, purée maison</p>
        <p class="ame__accord"><span class="ame__type">Vin rouge</span> · <span class="ame__boisson">Saint-Joseph</span> · <span class="ame__region">Vallée du Rhône nord · syrah</span></p>
        <p class="ame__mot">Le poivre et la violette de la syrah font écho à la sauce…</p>
      </li> …
    </ul>
    <div class="ame__scene">
      <figure class="ame__verre" aria-hidden="true"></figure>         <!-- le verre SVG est ajouté par le module -->
      <div class="ame__fiche" aria-live="polite" aria-atomic="true"></div>
    </div>
  </div>
</section>
<script type="module">
  import { init } from './modules/accords-mets-et-vins/module.js';
  const api = await init(document.querySelector('[data-module="accords-mets-et-vins"]'));
</script>
```

## Contenu (JSON)

Modèle : `exemple-accords.json`. Le restaurateur (ou un outil depuis un tableur) change ce fichier, la page ne bouge pas.

```json
{ "signature": "Le mot du sommelier", "choisi": "joue",
  "plats": [ { "id": "joue", "moment": "Plat", "plat": "Joue de bœuf confite", "detail": "Sauce au vin rouge, purée maison",
    "accord": { "type": "vin-rouge", "nom": "Saint-Joseph", "region": "Vallée du Rhône nord · syrah", "mot": "…",
                "couleur": "#6c1527", "verre": "ballon", "bulles": false, "mousse": false } } ] }
```

- `type` : `vin-rouge`, `vin-blanc`, `rose`, `petillant`, `biere`, `cocktail`, `the`, `sans-alcool` ; il donne le libellé, le verre et la couleur par défaut, et les bulles (pétillant, bière, sans alcool) ou la mousse (bière). `couleur`, `verre` (`ballon`, `tulipe`, `flute`, `coupe`, `pinte`, `gobelet`), `bulles` et `mousse` le remplacent.
- Le JSON remplace la liste de la page (construite avec `textContent`, jamais d'HTML venu du fichier) ; introuvable, la liste de la page reste. Garder dans la page la même liste que le JSON : c'est ce que lisent les moteurs et les visiteurs sans JavaScript.
- Espaces insécables ajoutées seules avant « : ; ! ? » et dans les guillemets.

## Accessibilité

- Chaque plat porte un bouton radio qui couvre sa ligne (nommé par le nom du plat, décrit par le détail) : Tab entre dans la liste, les flèches changent de plat, le choix est annoncé.
- La fiche est une région `aria-live` : le nouvel accord est lu dès qu'il s'écrit. Le verre est décoratif (`aria-hidden`).
- Sans JavaScript (`@media (scripting: none)`) : la scène disparaît, chaque plat de la liste montre son accord et le mot du sommelier. Avec JavaScript, ces deux lignes sont masquées d'emblée par CSS : rien ne bouge au chargement.

## Réglages et API

- `source` (ou `data-source`), `contenu` (objet déjà chargé), `choisi`, `duree` (1,5 s de remplissage), `textes` (`avec`, `signature`, `groupe`).
- `api.choisir(id)`, `api.plats`, `api.charger(contenu, id)` (nouvelle carte : midi et soir, carte des vins de la semaine), `api.detruire()`.
- Événement `ame:choix` (sur la section, `detail.plat`) à chaque plat choisi.
- Couleurs : `--ame-verre` (trait du verre, le texte à 64 %) ; la boisson colore le liquide (`--ame-vin`), le halo (`--ame-halo`, en transition), la goutte, le type et le filet du mot.
- Grand écran assez haut (900 × 600) : la scène est collante à côté de la liste. Tablette et téléphone : les plats en rangée qu'on fait glisser, le verre juste dessous.

## Pièges

- Les six verres partagent la même suite de commandes SVG (quatre courbes pour la coupe, une jambe, un pied) : pour en ajouter un, garder exactement cette forme (`VERRES` dans `module.js`, moitié gauche seulement, la droite est en miroir), sinon GSAP ne peut pas passer d'un verre à l'autre.
- Les bulles sont dans le groupe du liquide, qui suit la surface : elles partent du fond (`--prof`, profondeur du verre) et ne la dépassent jamais.
- Une couleur très claire (thé blanc, eau) se voit peu sur une section claire : prendre une section sombre, ou foncer la couleur dans le JSON.
- Un mot du sommelier de plus de 160 caractères allonge la fiche et pousse la page sur téléphone : rester court.
- Mode calme et « réduire les animations » : verre plein d'emblée, ni houle ni bulles, la fiche et le verre changent d'un coup.

## Variantes

- Cave ou bar à vin : les vins du moment, chaque « plat » devient un plateau (fromages, charcuterie) ; bar : un cocktail par humeur (`cocktail`, `sans-alcool`) ; salon de thé : une pâtisserie, un thé (`the`, couleurs claires sur fond sombre).
- Menu dégustation : un plat par service, `choisi` sur le premier, et un bouton « Service suivant » qui appelle `api.choisir()`.
