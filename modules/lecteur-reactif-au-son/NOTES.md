# Lecteur réactif au son

Origine : `will-midoux-maquette/ecouter` (« Au coin du feu », mécanique principale), avec `marco-investigation-maquette/audio` et `loeilsingulier-maquette/son-son-hero`.

- Will Midoux apporte l'essentiel : liste de trois extraits, un seul `<audio>`, `AnalyserNode` branché au premier clic, basse comparée à sa moyenne glissante (pulsation), lueur à montée rapide et retombée lente, onde en arc de traits radiaux.
- Marco Investigation apporte l'état annoncé en `aria-live`, le message « Extrait indisponible » et l'onde qui garde une amplitude douce sans son.
- L'Œil Singulier apporte le volume par RMS du signal (`getByteTimeDomainData`) et le principe : rien ne part sans geste explicite.
- Laissé de côté (identité) : la photo de feu de camp, les titres et la voix de l'artiste, les braises WebGL (OGL) remplacées par des braises canvas 2D (aucun repli à gérer), la pastille « en cours » flottante, la rosace guillochée et l'ambiance composée en direct de L'Œil Singulier, le lien Spotify de secours.

## Usage

```html
<section class="lrs" data-module="lecteur-reactif-au-son" aria-labelledby="lrs-titre">
  <div class="lrs__cadre socle-cadre">
    <div class="lrs__scene" aria-hidden="true"><div class="lrs__fond">(image facultative)</div><div class="lrs__halo"></div><canvas class="lrs__canvas"></canvas></div>
    <div class="lrs__texte">… titre, <ol class="lrs__pistes"> avec un <li class="lrs__piste" data-src="audio/x.mp3"> par extrait, .lrs__commandes …</div>
  </div>
  <audio class="lrs__audio" preload="none"></audio>
</section>
```

`init(section, options)` ; voir `index.html` pour le balisage complet (boutons `[data-lrs="lecture|precedente|suivante"]`, curseur `[data-lrs="position"]`, `[data-lrs="temps"]`, `[data-lrs="titre"]`, `[data-lrs="etat"]` en `aria-live`). Les durées affichées dans `.lrs__duree` sont écrites dans le HTML (rien n'est chargé avant le clic) puis corrigées à la lecture.

Les trois extraits de `audio/` sont des sons de synthèse générés avec ffmpeg (`aevalsrc`, 9 s, MP3 mono 64 kb/s, 72 Ko) : à remplacer par les extraits du projet, en MP3 de même origine que la page.

## Réglages

- `visuel` : couches actives parmi `halo` (variables `--niveau` et `--basse` sur la section), `braises`, `onde` (canvas), `barres` (petit égaliseur des commandes).
- `braises` (120) / `braisesTelephone` (60) : plafond de particules ; le nombre visible suit l'énergie.
- `sensibilite` (1) : à baisser pour une musique très compressée, à monter pour une voix ou un piano.
- `enchainer` (false) : enchaîne les extraits.
- `fft` (512) : taille de l'analyse ; les bandes (basses < 250 Hz, médiums < 3 kHz) sont calculées en hertz, donc indépendantes de ce réglage.

## Pièges

- Aucun son au chargement : `preload="none"`, pas de `src` avant le clic, `AudioContext` créé dans le gestionnaire du clic (exigence iOS) puis `resume()` à chaque lecture.
- `createMediaElementSource` ne s'appelle qu'une fois par élément `<audio>` : un seul `<audio>` pour toutes les pistes.
- Fichier d'une autre origine sans CORS, ou `file://` : l'analyse renvoie des zéros. Après 40 images muettes, le visuel passe à l'animation douce (le son, lui, joue).
- `getByteFrequencyData` sature vite avec la plage par défaut : `minDecibels` −85, `maxDecibels` −12. La pulsation (basse au-dessus de sa moyenne) est plafonnée à 1, et l'énergie monte vite et redescend lentement : jamais de clignotement.
- Couleurs du canvas lues par une sonde (`color: var(--couleur-accent)`), donc tout format CSS accepté, y compris `color-mix()`.
- Mode calme et réduire les animations : visuel dessiné une fois (spectre en cloche, braises posées), aucun `requestAnimationFrame` ; le lecteur reste entièrement utilisable. Hors écran ou onglet caché, la boucle s'arrête (`socle.boucle`).
- Sans Web Audio : animation douce, plus vive pendant la lecture.

## Variantes

- Fond de scène photo (`.lrs__fond`, 38 % d'opacité) : un feu, une scène, une salle, une mer de nuit.
- Scène en plein fond de section (comme chez Will Midoux) : passer `.lrs__scene` en `position: absolute; inset: 0` et assombrir le côté du texte par un dégradé.
- Un seul extrait : garder une piste et masquer précédent/suivant.
