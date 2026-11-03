# Semainier

Origine : `efficience-triathlon-maquette/coaching` (« Semainier qui se réorganise », noté 5) : grille d'une semaine sur papier quadrillé, séances colorées par discipline, boutons de contraintes qui bloquent des cases, séances replacées en Flip et journal des déplacements.

## Usage

```html
<section class="smn" data-module="semainier" aria-labelledby="smn-titre">
  <div class="smn__tete">…titre…</div>
  <div class="smn__commandes" data-commandes></div>          <!-- boutons de formule + description -->
  <div class="smn__corps">
    <div class="smn__feuille" data-feuille><p data-sans-js>Texte sans JavaScript</p></div>  <!-- légende, onglets, table, journal -->
    <aside class="smn__recap" data-recap aria-labelledby="…"><h3 id="…">Heures par type</h3></aside>
  </div>
  <script type="application/json" data-donnees>
  { "libelle": "Profil de semaine",
    "jours": ["Lundi", …], "courts": ["Lun", …], "moments": ["Matin", "Après-midi", "Soir"],
    "types": [{ "id": "fond", "nom": "Travail de fond", "teinte": 1 }, …],            // teinte 1 à 4
    "creneaux": [{ "id": "c1", "type": "fond", "titre": "Dossier principal", "minutes": 180 }, …],
    "formules": [{ "id": "equilibree", "nom": "Équilibrée", "description": "…",
                   "places": { "c1": "0-0", … },            // "jour-moment", index à partir de 0 ; un créneau absent est retiré
                   "bloques": { "2-2": "Indisponible" } }]  // facultatif : cases hachurées
  }
  </script>
</section>
<script type="module">
  import { init } from './modules/semainier/module.js';
  init(document.querySelector('.smn'));
</script>
```

Le module construit une vraie `<table>` (jours en `th scope="col"`, moments en `th scope="row"`, légende en `caption` masquée) : un lecteur d'écran annonce le jour et le moment de chaque créneau, le type est lu avant le titre. Les boutons de formule sont en `aria-pressed` dans un `role="group"` nommé ; le journal (« Matinale : 7 créneaux déplacés. Total 14 h. ») est en `aria-live="polite"`. Le récapitulatif donne les heures par type (barres comparables d'une formule à l'autre) et le total.

## Réglages

- `donnees` (sinon le JSON de la page), `formule` (départ), `jour` (onglet de départ sur téléphone).
- `largeurTelephone` (700) : en dessous, classe `est-telephone` sur la section, onglets `role="tablist"` (flèches, Début, Fin, tabindex itinérant, nombre de créneaux par jour) et un seul jour visible dans la même table (`role="tabpanel"`).
- `duree` (0.8), `decalage` (0.03) : le Flip. `format` (minutes → texte) et `mots` (singulier, pluriel) pour un autre vocabulaire (séances, cours, rendez-vous).
- Teintes : `--smn-teinte-1` à `4` (accent, secondaire, mélange oklch des deux, gris) ; une page peut les redéfinir. Chaque type a aussi une forme (rond, carré, losange, triangle) : la couleur n'est jamais seule.
- `init()` renvoie `{ placer(id), detruire() }` pour piloter la semaine depuis ailleurs (formulaire, quiz).

## Pièges

- Les `td` sont en `position: relative` et le Flip passe `zIndex: 5` : sans cela les créneaux en vol sont placés par rapport à la page (ils disparaissent) puis passent sous les cases suivantes.
- Un créneau retiré reste dans sa case en `hidden` pour que Flip le fasse sortir en fondu ; un créneau qui entre (ou qui arrive dans le jour affiché sur téléphone) entre en fondu.
- Hauteur des cases fixe (`height` des `td`) : la grille ne saute pas quand une case se vide ; prévoir au plus deux créneaux courts par case.
- Sous 1100 px, les jours s'abrègent (« Lun ») mais le nom complet reste lu (masqué visuellement, pas `display: none`).
- Mode calme et « réduire les animations » : pas de Flip, barres sans transition, état final immédiat.

## Variantes

- La maquette d'origine ajoutait des contraintes cumulables (réunion, déplacement, enfants) et replaçait chaque séance dans la première case libre d'une liste de candidates : on peut retrouver cette logique en générant `places` à la volée et en appelant `placer()`. Ici, chaque formule décrit une semaine complète, plus simple à rédiger.
- Laissé de côté (identité) : papier quadrillé, disciplines de triathlon, couleurs des sports, police mono condensée, cartes de tarifs à côté de la grille.
