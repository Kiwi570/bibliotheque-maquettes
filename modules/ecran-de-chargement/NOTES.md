# Écran de chargement

Origine : fusion de `surffm-maquette/loader` (« Recherche de la station »), `nelis-maquette/gel` (« Ouverture gel ») et `edwin-sonorisation-maquette/loader` (« Platine qui démarre »).

- **surffm** apporte la base : un calque fixé qui ne capte pas les clics, une valeur qui défile avec son unité (87,5 → 108 MHz) pendant qu'une onde en canvas 2D s'amplifie, une fois par session, rien en mode calme. Sa sortie en rideau vers le haut (`clip-path`) est gardée en `sortie: 'haut'`.
- **nelis** apporte le motif génératif : des dendrites de givre à graine qui partent des bords (`motif: 'cristaux'`), la température qui descend (+24 → −40 °C, d'où l'option `signe`), et la sortie par un trou circulaire qui s'ouvre au centre (masque piloté par une variable, `sortie: 'ouverture'`, par défaut). Ici les cristaux poussent au fil de la progression au lieu d'être dessinés d'un coup.
- **edwin** apporte le compteur qui s'arrête sur un texte (33⅓ → option `fin`) et le filet de sécurité : l'écran se retire seul une seconde après sa durée prévue, même si l'onglet est caché.
- Laissé de côté (identité) : monogramme et texture de givre de nelis, « DAB+ / Surf FM » de surffm, platine, bras et nom lettre par lettre d'edwin, toutes les couleurs écrites en dur dans les canvas (lues ici dans les variables du socle).

Différence avec `rideau-en-lanieres` : le rideau est un décor qui s'écarte ; ici, c'est la mise en scène d'une mesure (un compteur et un motif) qui compte, et le calque s'efface d'un bloc. Ne pas utiliser les deux sur la même page.

## Usage

```html
<head>
  <!-- obligatoire : affiche l'écran avant le premier rendu seulement s'il doit jouer (pas d'éclair au retour, en calme ni sous « réduire les animations ») -->
  <script>try{var d=document.documentElement;if(sessionStorage.getItem('ecran-de-chargement-vu')!=='1')d.classList.add('edc-joue')}catch(e){}</script>
</head>
<body>
  <div class="edc" data-module="ecran-de-chargement">
    <canvas class="edc__motif" aria-hidden="true"></canvas>
    <div class="edc__coeur" aria-hidden="true">
      <p class="edc__legende">Recherche du signal</p>
      <p class="edc__compteur"><span class="edc__valeur">87,5</span><span class="edc__unite">MHz</span></p>
      <span class="edc__jauge"></span>
      <span class="edc__bornes"><span class="edc__borne">87,5</span><span class="edc__borne">108,0</span></span>
    </div>
    <button type="button" class="edc__passer socle-bouton">Passer</button>
  </div>
  … en-tête, puis le héros complet, rendu normalement …
</body>
```

`const ecran = await init(el, { de: 87.5, a: 108, unite: 'MHz', motif: 'onde', apres: () => … })` renvoie `{ rejouer(options), passer(), detruire() }`. Mettre dans le HTML les valeurs de départ (`de`, bornes) : c'est ce qu'on voit avant le JavaScript. La jauge et les bornes sont facultatives.

## Réglages

- `de`, `a`, `unite` : la mesure du métier (fréquence, température, pourcentage, altitude, pression, kilomètres). `a` peut être plus petit que `de` (température qui descend).
- `format` : nombre de décimales (par défaut celles de `de` et `a`, en français : virgule, espace fine pour les milliers, vrai signe moins) ou fonction `v => texte`. `signe: true` affiche « +24 ». `fin` remplace la valeur à l'arrivée (« Prêt ») et masque l'unité.
- `motif` : `onde` (trois traits, l'amplitude suit la progression), `cristaux` (dendrites à graine, `graine` pour en changer ; 22 départs et 4 niveaux sur ordinateur, 12 et 3 sous 700 px), `aucun`.
- `duree` (2,2 s) : totale, sortie comprise, bornée entre 1,2 et 4 s ; le compteur prend ce qui reste après la sortie (0,66 s) et une courte tenue sur la valeur finale. Rester sous 2,5 s.
- `sortie` : `ouverture` (trou circulaire depuis le centre), `haut` (retrait vers le haut), `fondu`.
- Couleurs : `--edc-fond` (par défaut fond teinté de la couleur secondaire), `--edc-chiffre`, `--edc-taille` sur `.edc` ; l'onde et les points prennent `--couleur-accent`, les cristaux `--couleur-texte`.
- `unique` : `true` (une fois par session) ou `false` (retirer alors le test `sessionStorage` du script du `<head>`) ; `cle` doit être la même que dans ce script.

## Pièges

- Le héros n'est jamais masqué ni retardé : il est rendu dessous dès le départ, le calque est `pointer-events: none` (seul « Passer » capte les clics). N'enchaîner l'entrée du titre qu'avec `apres`, sans le cacher au départ.
- Sans le script du `<head>`, l'écran n'apparaît qu'au chargement du module, après le premier rendu : il faut le copier. S'il est présent mais que le module ne vient jamais, le calque disparaît seul au bout de 5 s (`edc-secours`).
- Largeur de la valeur réservée en `ch` d'après les valeurs extrêmes et `fin` (`--edc-car`), chiffres tabulaires : le compteur change sans décaler la page (CLS 0). Une police sans chiffres tabulaires fera trembler la valeur.
- Couleurs du canvas lues dans les variables, résolues en `rgb()` par le navigateur (le canvas ne comprend ni `var()` ni `color-mix()`). Densité de pixels plafonnée à 1,5 ; les cristaux sont tracés de façon incrémentale (seuls les nouveaux segments à chaque image).
- `sessionStorage` en `try/catch` ; Échap et « Passer » amènent le compteur à sa valeur finale et lancent une sortie accélérée (0,35 s) plutôt que de couper net. Le bouton est le premier élément atteint au clavier.
- Retour arrière depuis le cache (`pageshow`) : l'écran est retiré s'il était en cours.

## Variantes

- Monogramme (nelis) ou nom du site : l'ajouter dans `.edc__coeur`, au-dessus de la légende.
- Version courte aux visites suivantes (nelis, surffm) : non retenue ; `unique: false` avec `duree: 1.2` en donne l'esprit.
- Platine d'edwin (disque SVG qui tourne, bras qui se pose) : laissée de côté, trop liée au métier ; un SVG placé dans `.edc__coeur` et animé en CSS pendant `duree` s'ajoute sans toucher au module.
