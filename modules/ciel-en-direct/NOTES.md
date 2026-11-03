# Ciel en direct

Origine (fusion) :
- `hanamizuki-maquette/hero` (« Mer et ciel en direct », 5) : l'essentiel de la mécanique. Ciel et mer dont les couleurs suivent la hauteur réelle du soleil sur place (table de couleurs indexée par l'altitude, interpolée), soleil, lune et étoiles, reflets sur la mer, carte « ciel en direct » (heure, moment, lever et coucher), curseur pour voir une autre heure, bouton de retour à l'heure réelle, `?heure=HH:MM` dans l'adresse, fuseau du lieu par `Intl` (et non celui du visiteur).
- `tiki-cassis-maquette/sky` (« Ciel de la journée », 4) : rendu léger retenu, dégradé CSS piloté par variables + étoiles en canvas 2D semées avec une graine fixe ; lever et coucher calculés pour le jour civil du lieu.
- `aquafit-maquette/eau` (« Caustiques en fond fixe », 4) : pas de ciel horaire dans cette maquette ; elle apporte l'état piloté de l'extérieur (méthode `regler()` plutôt que de lire l'heure dans le rendu), la pause hors onglet et le garde-fou de fluidité (densité de pixels réduite puis image fixe si les images dépassent 28 ms).

Rendu : canvas 2D et dégradé CSS, sans WebGL. Le shader de Hanamizuki (mer en perspective, nuages fbm, ondulation au pointeur) n'apporte pas assez pour justifier OGL et un repli : les reflets en traits scintillants et les rides lentes donnent la mer pour un coût négligeable.

## Usage

```html
<section class="ced" data-module="ciel-en-direct" aria-labelledby="ced-titre">
  <div class="ced__ciel" aria-hidden="true"><canvas class="ced__toile"></canvas></div>
  <div class="ced__cadre socle-cadre">
    <div class="ced__texte">…surtitre, h1#ced-titre.ced__titre, p.ced__chapo, .ced__actions…</div>
    <div class="ced__carte" role="group" aria-labelledby="ced-carte-titre">
      <p class="ced__carte-haut"><span id="ced-carte-titre">Sur place, en ce moment</span><span data-ced-phase></span></p>
      <p class="ced__heure"><span data-ced-heure>--:--</span><em class="ced__drapeau" data-ced-drapeau hidden>heure choisie</em></p>
      <p class="ced__soleil"><span>Lever <b data-ced-lever></b></span><span>Coucher <b data-ced-coucher></b></span></p>
      <div class="ced__reglage">
        <label for="ced-curseur">Voir le ciel à une autre heure</label>
        <input class="ced__curseur" id="ced-curseur" type="range" min="0" max="1435" step="5" data-ced-curseur>
        <div class="ced__raccourcis" role="group" aria-label="Moments de la journée">
          <button type="button" data-ced-moment="aube">Aube</button> … midi, crepuscule, nuit …
          <button type="button" data-ced-maintenant aria-pressed="true">Maintenant</button>
        </div>
      </div>
    </div>
  </div>
</section>
<script type="module">
  import { init } from './modules/ciel-en-direct/module.js';
  init(document.querySelector('.ced'), { timeZone: 'Europe/Paris', lat: 48.86, lon: 2.35 });
</script>
```

La carte, le curseur et les raccourcis sont facultatifs : sans eux, le ciel suit simplement l'heure. `init()` renvoie `{ regler('21:30' | minutes | null), etat(), detruire() }`. La section reçoit `data-phase` (`aube`, `jour`, `crepuscule`, `nuit`) et `data-texte` (`clair`, `sombre`) pour styler le reste de la page.

## Réglages

- `timeZone`, `lat`, `lon` : le lieu du client. Avec coordonnées, hauteur du soleil, lever et coucher réels (méthode SunCalc / NOAA) ; sans coordonnées, journée type entre `lever` et `coucher` (sinusoïde). La lune suit une course nocturne simple ; sa phase, elle, est la vraie (la même partout).
- `heure` ou `?heure=HH:MM` : moment forcé (démonstration, capture d'écran, maquette présentée le matin pour un site du soir).
- `horizon` : `'auto'` place l'horizon juste au-dessus du bloc de texte, pour que le soleil levant ou couchant reste visible ; nombre pour le fixer.
- `palette` : remplace la table de couleurs (altitude → haut, horizon, mer, mer profonde, soleil) ; la table par défaut est naturelle et neutre.
- Lisibilité : le texte prend la plus claire ou la plus sombre de `--couleur-texte` / `--couleur-fond` (ou `clair` / `sombre`), celle qui contraste le mieux avec la couleur la plus défavorable du ciel derrière (haut, horizon, mer, halo du soleil, lune) ; le voile du bloc de texte prend l'autre couleur, à l'opacité minimale qui garantit `contraste` (4,6). Vérifié au pixel toutes les 20 minutes en 1440×900, 1000×560 et 390×844 : 4,75:1 au pire (16 h 20, bloc de texte), plus de 10:1 dans la carte.

## Pièges

- Sans `timeZone`, c'est l'heure du visiteur : juste pour un décor, faux pour « l'heure sur place » d'un lieu lointain. Un fuseau inconnu est signalé par un avertissement et remplacé par celui du visiteur.
- Les couleurs de la page doivent être en `#hex` ou `rgb()` pour que le module les lise (pas de `color-mix` dans `--couleur-texte` / `--couleur-fond`, ou passer `clair` et `sombre`).
- Le bouton plein reste aux couleurs de la palette (accent) : vérifier son contraste propre, il ne dépend pas du ciel.
- Jour ou nuit polaire : lever et coucher retombent sur `lever` / `coucher`.
- `pret([])` ne charge rien : le module n'utilise ni GSAP ni ScrollTrigger.
- Mode calme et « réduire les animations » : image fixe, transitions coupées, redessinée seulement quand l'heure change (curseur, minuterie).

## Variantes

- Laissés de côté (identité ou coût) : l'arche de photo, le titre vertical et le billet de campagne de Hanamizuki, sa plongée sous la ligne d'eau au défilement et l'ondulation au pointeur ; chez Tiki Cassis, le ciel fixe de toute la page qui avance de l'aube à la nuit au fil du défilement (une heure par section, `data-time`) et l'horloge flottante qui s'efface sur le texte : variante possible en passant `regler()` à un ScrollTrigger ; chez Aquafit, les caustiques WebGL et la profondeur qui suit la lecture.
- `mer: false` donne un ciel seul (page de contact, pied de page, bandeau d'agenda).
