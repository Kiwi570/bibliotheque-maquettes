# Carte à calques

Origine : `surffm-maquette/nous-capter-couverture` (carte de couverture FM / DAB+ : trait de côte tracé, zones qui grandissent, ondes depuis les émetteurs, deux boutons qui allument ou éteignent chaque calque).

## Usage

```html
<section class="cac" data-module="carte-a-calques">
  <div class="cac__tete socle-cadre">…surtitre, h2.cac__titre, p.cac__intro…</div>
  <div class="cac__corps socle-cadre">
    <div class="cac__legende">
      <div class="cac__groupe" data-calque="secteurs" data-teinte="2">          <!-- teinte 1 accent, 2 secondaire, 3 texte -->
        <button class="cac__calque" type="button" data-cac-calque="secteurs" aria-pressed="true" aria-controls="cac-zones-secteurs">
          <span class="cac__pastille cac__pastille--secteur" aria-hidden="true"></span>   <!-- --zone, --secteur, --point -->
          <span class="cac__calque-texte"><b>Secteurs d'intervention</b><span><span data-cac-compte>3</span> secteurs</span></span>
          <span class="cac__interrupteur" aria-hidden="true"></span>
        </button>
        <ul class="cac__zones" id="cac-zones-secteurs">
          <li><button class="cac__zone-bouton" type="button" data-cac-zone="nord" aria-pressed="false"><b class="cac__nom">Secteur nord</b><span class="cac__detail">…</span></button></li>
        </ul>
      </div>
      <p class="cac__note">Zones dessinées à titre indicatif…</p>
      <p class="socle-sr" aria-live="polite" data-cac-annonce></p>
    </div>
    <figure class="cac__carte"><div class="cac__plan">
      <svg class="cac__svg" viewBox="0 0 600 480" aria-hidden="true" focusable="false">
        <g class="cac__fond">…fond de carte ; les traits à dessiner portent la classe cac__trait…</g>
        <g class="cac__couche" data-calque="secteurs" data-teinte="2">
          <path class="cac__zone" data-zone="nord" d="…"/>                                   <!-- contour tracé -->
        </g>
        <g class="cac__couche" data-calque="rendez-vous" data-teinte="3">
          <circle class="cac__point" data-zone="gare" cx="296" cy="214" r="7" data-cote="gauche"/>  <!-- point qui surgit -->
        </g>
      </svg>
      <figcaption class="cac__mention">Carte illustrative, zones indicatives</figcaption>
    </div></figure>
  </div>
</section>
```

Le lien se fait par les noms : `data-calque` (groupe SVG, bloc de légende, bouton `data-cac-calque`) et `data-zone` (forme SVG, bouton `data-cac-zone`). Le module compte les zones, pose les étiquettes (nom repris du bouton de la liste, ou `data-nom`), crée les ondes autour des cercles `[data-ondes]` et annonce chaque changement (`aria-live`). Un calque éteint au départ : `aria-pressed="false"` sur son bouton.

La carte SVG est décorative (`aria-hidden`) : l'équivalent texte est la légende elle-même, une liste de toutes les zones, toujours lisible même calque éteint.

## Réglages

- `debut` ('top 72%') : quand la carte entre, le trait de côte (`.cac__fond .cac__trait`) se dessine, puis chaque calque allumé se révèle à son tour.
- `duree` (1,2 s) et `decalage` (0,14 s) : tracé d'un contour et écart entre deux zones d'un calque.
- `ondes` (true) : trois ondes en boucle par cercle `[data-ondes]`, en pause hors écran, absentes en mode calme.
- Étiquette : au centre de la forme, ou `data-x` / `data-y` (unités du viewBox) ; pour un point, à droite ou `data-cote="gauche"`.

## Pièges

- Les étiquettes sont en HTML (12 px mini quelle que soit la taille de la carte). Elles se chevauchent vite : placer les noms longs avec `data-x` / `data-y` / `data-cote`. Sous 480 px de large de carte (requête de conteneur), seules les étiquettes choisies restent, la mention « illustrative » se cache et c'est la note sous la légende qui la porte.
- Les contours sont tracés avec `pathLength="1"` posé par le module : `stroke-dasharray` n'est appliqué que pendant l'animation, jamais en CSS (sans JS, les traits restent pleins).
- Pas de `vector-effect: non-scaling-stroke` sur les formes tracées : il fausse le tracé normalisé.
- La carte colle (sticky) à côté de la légende sur ordinateur, au-dessus de la liste sur téléphone ; sa largeur est bornée par la hauteur visible (`--entete-h`, `--barres-h` ; 46 % de l'écran sur téléphone). Changer le ratio impose de changer le `viewBox` (600 × 480) et le facteur 5/4 du CSS ensemble.
- Choisir une zone dont le calque est éteint le rallume ; éteindre un calque retire la mise en évidence de sa zone. Échap retire la mise en évidence.
- Une interaction avant la fin de l'entrée la termine d'un coup (pas de calque à moitié tracé).
- Zones « indicatives » : toujours le dire (mention et note), une carte de couverture n'est pas une carte officielle.

## Variantes

- L'origine génère la côte depuis de vraies coordonnées (projection simple) et place les villes en SVG décalées à la main ; ici la carte est un territoire imaginaire écrit à la main, que le projet remplace par son propre SVG ou une image dans `.cac__fond`. Fréquences, noms de villes, lien vers la carte officielle et couleurs de la station : identité, laissés de côté.
- `lien-numerique-solidaire-maquette/zone` (note 4) : la liste des secteurs qui allume le secteur sur la carte, reprise ici (boutons de zone) ; ses bulles cousues générées par graine sont de l'identité.
- `edwin-sonorisation-maquette/zone` (note 4) : champ de recherche de commune avec réponse en `aria-live` (comparer sans accents ni tirets) ; à ajouter au-dessus de la légende pour une longue liste de communes.
- `btp-confort-avenir-maquette/zone` (note 4) : boutons d'échelle qui animent le `viewBox` en gardant la taille des étiquettes ; variante pour un territoire à plusieurs niveaux (ville, région, pays).
- `iprof-maquette/zone` et `hanamizuki-maquette/crossing` (note 4) : même entrée (rive tracée, zone qui se remplit, villes une à une), sans calques ; ils marquent eux aussi zones et routes « indicatives ».
