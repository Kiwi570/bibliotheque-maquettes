# Rideau en lanières

Origine : fusion de `atelier-shazak-maquette/ouverture` (« Tresse puis rideau en lanières ») et `goodlife-maquette/hero` (« Rideau de palmes »).

- **atelier-shazak** apporte la base retenue : un voile fixé couvrant tout l'écran, des lanières verticales qui partent l'une après l'autre (alternativement vers le haut et vers le bas), un cœur tracé avant l'ouverture, une seule ouverture par session, la fermeture du même rideau avant un changement de page, le retour arrière (`pageshow`) et le secours CSS si le script ne vient jamais.
- **goodlife** apporte l'écartement : les lanières de gauche partent à gauche, celles de droite à droite, depuis le centre, en grandissant (`effet: 'ecarte'`), et la silhouette en feuilles qui se chevauchent (`forme: 'feuille'`). Son rideau était piloté au défilement et épinglé, en WebGL : ici il est joué une fois à l'arrivée, sans épinglage ni WebGL, ce qui ne retient jamais la page.

## Usage

```html
<head>
  <!-- obligatoire : évite l'éclair du rideau au retour dans la session et en mode calme -->
  <script>try{var d=document.documentElement;if(localStorage.getItem('socle-calme')==='1'||/[?&]calme\b/.test(location.search))d.classList.add('calme');if(sessionStorage.getItem('rideau-en-lanieres-vu')==='1')d.classList.add('rdl-vu')}catch(e){}</script>
</head>
<body>
  <div class="rdl" data-module="rideau-en-lanieres">
    <div class="rdl__lanieres" aria-hidden="true"></div>
    <div class="rdl__coeur" aria-hidden="true"><svg class="rdl__signe" viewBox="0 0 100 100"><circle data-trace cx="50" cy="50" r="44"/></svg><span class="rdl__mot">Nom</span></div>
    <button type="button" class="rdl__passer socle-bouton">Passer l'ouverture</button>
  </div>
  … en-tête, puis le héros complet, rendu normalement …
</body>
```

`const rideau = await init(el, { effet: 'ecarte', forme: 'feuille', apres: () => … })` renvoie `{ rejouer(options), passer(), couvrir(fn), detruire() }`. Le cœur est facultatif ; tout tracé `[data-trace]` qu'il contient se dessine.

## Réglages

- `effet` : `glisse` (sobre, le plus sûr), `chute` (tombe en tournant légèrement), `pivot` (chaque lanière pivote sur sa tranche, comme un store), `ecarte` (écartement vers les côtés). `sens` et `ordre` complètent.
- `nombre` (6) / `nombreTelephone` (4) ; `duree` (0,8 s), `decalage` (0,07 s), `delai` (0,15 s), `coeur` (0,9 s). Ouverture totale d'environ 2,2 s avec le cœur, 1,3 s sans : rester sous 2,5 s.
- Couleurs : `--rdl-couleur-1/2/3` (alternance, la troisième toutes les quatre lanières) et `--rdl-ombre` sur `.rdl` ; par défaut, des mélanges de `--couleur-fond`, `--couleur-texte` et `--couleur-accent`.
- `unique` : `true` (une fois par session), `'court'` (ouverture courte sans cœur aux visites suivantes, comme atelier-shazak : retirer alors `rdl-vu` du script du `<head>`), `false`.
- `liens: true` : referme le rideau avant de suivre un lien interne ; `couvrir(fn)` fait la même chose à la demande.

## Pièges

- Le héros n'est jamais masqué ni retardé : le rideau est un calque fixé au-dessus, `pointer-events: none` (seul le bouton capte les clics), donc le LCP et les clics ne l'attendent pas. N'enchaîner une animation du titre qu'avec `apres`, et sans le cacher au départ.
- Avant le JavaScript, `.rdl` est un aplat ; il disparaît seul au bout de 4 s (`rdl-secours`) si le module ne se charge pas. Le script du `<head>` est indispensable, sinon le rideau couvre un instant la page à chaque visite de la session.
- `sessionStorage` est lu et écrit en `try/catch` (navigation privée) ; la clé du `<head>` doit être la même que l'option `cle`.
- Mode calme, « réduire les animations » et impression : `.rdl` en `display: none`, rien n'est joué.
- Échap ou « Passer » accélèrent la fin (×5) plutôt que de couper net. Le bouton est le premier élément atteint au clavier.
- Forme `feuille` : les pointes restent hors de l'écran (130 % de haut) et les feuilles se chevauchent, sans quoi on verrait la page entre deux pointes avant l'ouverture.
- Hauteur du héros de démonstration : ne pas la calculer avec `--entete-h` (mesurée après le premier affichage, elle provoquait un décalage de mise en page).

## Variantes

- Tresse d'atelier-shazak : une tresse SVG à trois brins (croisements dessus-dessous calculés) se dessine dans le cœur avant l'ouverture. Laissée de côté (identité sellerie) ; le cœur accepte n'importe quel SVG `[data-trace]`, il suffit d'y générer la tresse.
- Palmes de goodlife : trois couches de palmes en WebGL (OGL) avec vent, ombres et translucidité, écartées au défilement sur un héros épinglé. Laissées de côté (identité tropicale, trois textures à charger, héros épinglé) ; `forme: 'feuille'` + `effet: 'ecarte'` en garde la silhouette neutre. Pour des feuilles dessinées, mettre une image ou un SVG en fond de `.rdl__laniere`.
- Ouverture pilotée par le défilement (goodlife) : remplacer la timeline par une progression ScrollTrigger sur le héros épinglé ; pas retenu ici, car le rideau doit pouvoir être passé et ne jamais retenir la lecture.
