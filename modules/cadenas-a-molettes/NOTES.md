# Cadenas à molettes

Origine : `games42-maquette/trouver` (« Cadenas des missions » : trois molettes équipe, âge, nombre de joueurs, puis missions et prix calculés).

## Usage

```html
<section class="cam socle-cadre" data-module="cadenas-a-molettes" aria-labelledby="cam-titre">
  <script type="application/json" class="cam__donnees">{ "molettes": […], "resultats": […] }</script>
  <div class="cam__intro">… titre, texte, boutons facultatifs [data-reglage='{"public":"duo",…}'] …</div>
  <div class="cam__cadenas">
    <svg class="cam__anse" viewBox="0 0 200 130" aria-hidden="true"><path d="M40 130 V66 a60 60 0 0 1 120 0 V130"/></svg>
    <div class="cam__corps"><p class="cam__nom">…</p><div class="cam__molettes"></div>
      <button type="button" class="cam__ouvrir socle-bouton socle-bouton--plein">Ouvrir le cadenas</button>
      <p class="cam__etat" aria-live="polite"></p></div>
  </div>
  <div class="cam__resultats" tabindex="-1"><p class="cam__ferme">…</p></div>
</section>
```

`init(section, options)`. Les molettes (2 à 4) et les cartes sont construites depuis le JSON : `molettes[{ id, libelle, valeurs[{ v, t, dit? }] }]`, `resultats[{ titre, meta?, texte?, lien?, criteres }]`. Un critère est une liste de valeurs acceptées ou un intervalle `{ min, max }` (valeurs numériques) ; un critère absent accepte tout.

## Réglages

- `auto` (true) : le cadenas s'ouvre seul `delai` ms (500) après le dernier réglage, quand aucune molette n'est sur « — ». Le bouton reste là : il ouvre (ou dit ce qui manque, le cadenas tremble) puis devient « Tout remettre à zéro ».
- `vide` (true) : chaque molette commence sur une position vide ; à false, sur sa première valeur (le cadenas est alors complet d'emblée et s'ouvre au premier réglage).
- `proches` (true) : sans résultat exact, cartes qui ne diffèrent que d'un critère, bordure pointillée et mention « Sauf : … ».
- `defiler` (true) : à la première ouverture à la souris ou au doigt, les résultats montent vers le milieu de l'écran, sans faire passer les molettes sous l'en-tête. Jamais au clavier (le focus reste sur la molette).
- `pas` (24°) : angle entre deux crans ; le rayon du tambour en découle (crans de 44 px).
- `textes` : tous les libellés, y compris ceux des boutons ▲▼ (« {libelle} : valeur précédente »).
- Une fois ouvert, chaque réglage refiltre les cartes en direct ; remettre une molette sur « — » referme le cadenas.

## Pièges

- Chaque fenêtre est un `spinbutton` (`aria-valuenow`, `aria-valuetext`, flèches haut/bas, Page haut/bas, Début/Fin) ; le tambour 3D est `aria-hidden`.
- Molette de la souris : captée seulement si la molette peut encore tourner dans ce sens ; en butée, la page défile (la maquette d'origine bloquait le défilement au-dessus du cadenas). `data-lenis-prevent` sur la fenêtre.
- `touch-action: none` sur les fenêtres : au doigt, on fait défiler la page à côté des molettes ; les boutons ▲▼ (44 px) restent l'accès principal sur téléphone.
- `.cam__molettes` réserve sa hauteur (pas de décalage de mise en page quand le JS construit les molettes).
- Mode calme : les molettes se posent sans rebond, l'anse est directement levée, les cartes apparaissent sans entrée décalée.
- Sans JavaScript, seuls l'intro et le message « cadenas fermé » s'affichent : prévoir un lien vers la liste complète si l'outil est le seul accès aux résultats.

## Variantes

- Laissé de côté (identité et métier de la maquette d'origine) : prix calculés selon le nombre de joueurs, règles croisées (l'équipe « adultes » force l'âge à 18 ans), figurines détourées des réglages rapides, scène WebGL du portail, dégradé violet de l'anse. Le moteur de tambour est réécrit sans GSAP (petit `requestAnimationFrame` avec rebond).
- Calcul de prix : ajouter un champ dans les résultats et l'afficher dans `meta`, ou brancher `composeur-de-formule` derrière une carte.
- Images : `.cam__visuel` reçoit une `<img>` (4:3) par carte ; sans image, le dégradé `socle-visuel` sert de vignette.
