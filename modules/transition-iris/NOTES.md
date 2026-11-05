# Transition en iris

Origine : madebymelody-maquette (v2), voile en iris du socle de la skill (`assets/js/socle/iris.js`), rendu générique.

## Usage

```html
<head>
  <script>/* script critique : copier celui de index.html (classe html.tir-couvert depuis sessionStorage « tir-voile ») */</script>
</head>
<body>
  … <div class="demo-objet" data-iris-centre="disque"></div> …   <!-- objet d'ouverture de la page -->
  <div class="tir" data-module="transition-iris" aria-hidden="true">
    <div class="tir__corps"><span class="tir__disque"></span><span class="tir__nom"></span></div>
  </div>
  <script type="module">import { init } from './modules/transition-iris/module.js'; init(document.querySelector('.tir'));</script>
</body>
```

- Départ : au clic sur un lien interne, un disque de la couleur du voile grandit depuis le point du clic (au clavier : depuis le centre du lien) jusqu'au coin le plus éloigné, puis la navigation a lieu.
- Arrivée : la page s'affiche déjà couverte (script critique), puis un trou s'ouvre dans le voile, centré sur la partie visible de `[data-iris-centre]` (sinon le centre de l'écran). Avec `data-iris-centre="disque"` sur un objet rond entier à l'écran, le trou démarre à sa taille.
- `centreOuverture()` est exporté (même calcul pour une intro).
- `init()` renvoie `{ partir, ouvrir, detruire }`.

## Réglages

`couvrir` (0,55 s), `ouvrir` (0,8 s), `nom` (true), `centre` ('[data-iris-centre]'), `exclure` ('[data-sans-voile]'). Couleurs : `--tir-fond` (sinon `--couleur-accent`), `--tir-texte`.

## Pièges

- Le trou grandit image par image (variable `--trou` du masque) : `@property` n'est pas nécessaire, et un `setTimeout` de secours termine l'ouverture si l'onglet passe en arrière-plan.
- Repli automatique (pas de `clip-path` circle ou pas de `mask`) : fondu simple, jamais de page bloquée.
- Le voile garde le défilement bloqué et la couleur de `html` tant qu'il couvre (bande de la barre de défilement sous Windows).
- Retour arrière depuis le cache : `pageshow` annule tout, la page revient découverte.
- **Projet bâti sur le socle de la skill (v10.2 et suivantes) : ne pas utiliser ce module.** Le voile du socle a déjà cette forme : `"formeVoile": "iris"` dans `donnees/site.json`, chaque page marque son objet d'ouverture `data-iris-centre`, et rien n'est à recopier à la main (`assets/js/socle/voile.js`). Ce module sert aux pages hors socle (démonstrations, autres projets).

## Variantes

- Forme du motif : remplacer `circle()` par `polygon()` (étoile, losange) ou un masque d'image (tampon, empreinte) en gardant le même départ depuis le clic.
- Disque qui tourne sur le voile : `.tir__disque` (à remplacer par le logo ou un objet du métier).
