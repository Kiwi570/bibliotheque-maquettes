# Rail de sections

Origine : `surffm-maquette/cadran` (cadran de fréquences 87,5 → 108 MHz qui suit la page).

## Usage

```html
<section data-rail="Ouverture">…</section>
<section data-rail="Services">…</section>
<nav class="rds" data-module="rail-de-sections" aria-label="Sections de la page"></nav>
<script type="module">
  import { init } from './modules/rail-de-sections/module.js';
  init(document.querySelector('.rds'), { echelle: [87.5, 108], pas: 0.5, majeur: 4, format: v => v.toFixed(0) });
</script>
```

Le module construit la règle, les repères (boutons de 44 px, nom lu par les lecteurs d'écran) et l'aiguille. Le nom de la section en cours est annoncé (`aria-live="polite"`).

## Réglages

- `echelle`, `pas`, `majeur`, `format` : l'habillage métier (fréquences, années, altitude, kilomètres). Par défaut 0 → 100.
- `selecteur` : `[data-rail]` ; le nom affiché est la valeur de l'attribut.
- `largeurTelephone` (700) : en dessous, barre horizontale de 44 px en bas, déclarée `[data-barre]`, donc comptée dans `--barres-h` ; le `body` reçoit ce `padding-bottom` pour que rien ne passe dessous.

## Pièges

- Les positions des sections sont mesurées au `refresh` de ScrollTrigger (pin-spacer compris), jamais pendant le défilement.
- La section change quand elle atteint le milieu de l'écran, pas son haut (sinon l'étiquette est en retard d'une section).
- Laisser une marge à droite du contenu sur ordinateur (64 px dans la démonstration) pour que la règle ne recouvre pas de texte.
- Toute autre barre fixée en bas doit être déclarée `[data-barre]` ; sur ordinateur, `--barres-h-autres` permet de remonter le bas du rail au-dessus d'un lecteur.

## Variantes

- Sur la maquette d'origine, un grésillement en canvas couvre l'écran une fraction de seconde à chaque changement de station, et le repère bas DAB+ termine l'échelle : effets propres à l'identité, laissés de côté.
- Le « thermomètre de lecture » de nelis-maquette est la même mécanique en vertical sans repères.
