# Visite guidée

Origine (fusion) : `warmline-app-maquette/app` (« Console du directeur », noté 5, visite guidée en 12 étapes, `js/guide.js`) et `warmline-app-maquette/acc-heros` (bouton « Lancer la visite guidée » avec le nombre d'étapes et l'aide clavier).

- `app` apporte la mécanique : projecteur qui suit l'élément, bulle `role="dialog"` non modale (n / N, barre de progression, Précédent / Suivant, quitter), Échap, flèches, Tab retenu dans la bulle, focus rendu à la sortie, placement à droite → à gauche → dessous → dessus → coin de l'écran, bulle en bas sur téléphone avec le projecteur arrêté au-dessus, replacement au redimensionnement et au défilement, élément cherché parmi plusieurs sélecteurs (premier visible) ;
- `acc-heros` apporte le lanceur : bouton, nombre d'étapes et aide clavier sous le bouton.

## Usage

```html
<section data-module="visite-guidee">
  <button type="button" data-visite-lancer>Lancer la visite guidée</button>
  <nav data-visite="1" data-visite-titre="La navigation" data-visite-texte="Chaque rubrique est ici.">…</nav>
  <div data-visite="2" data-visite-titre="Les indicateurs" data-visite-texte="Trois chiffres du jour.">…</div>
  <!-- ou : <script type="application/json" data-visite-etapes>[{"cible": ".tuiles", "titre": "…", "texte": "…"}, {"cible": null, "titre": "Fin", "texte": "…"}]</script> -->
</section>
<script type="module">
  import { init } from './modules/visite-guidee/module.js';
  const visite = await init(document.querySelector('[data-module="visite-guidee"]'));
  // visite.lancer(0), visite.aller(2), visite.fermer(), visite.detruire()
</script>
```

Le module pose dans `<body>` un calque `.vgd-calque` : voile (`.vgd-voile`), halo (`.vgd-halo`) et bulle (`.vgd-bulle`). L'élément visé reçoit `[data-visite-actif]`, `html` la classe `en-visite`. Événements (qui remontent depuis le module) : `visite:etape` `{index, total, etape}` et `visite:fin` `{index, terminee}`.

## Réglages

- `etapes` (JSON) prime sur le `<script data-visite-etapes>`, qui prime sur les `[data-visite]` (triés par valeur). `cible` : sélecteur, liste de sélecteurs (le premier visible gagne, utile quand l'interface change entre ordinateur et téléphone) ou `null` (bulle centrée, sans projecteur : introduction, conclusion).
- Une étape dont l'élément est absent ou caché au format courant est sautée ; le compte n / N est fait au lancement.
- `largeurBas` (700) : en dessous, bulle posée en bas ; l'élément est amené entre l'en-tête et la bulle.
- `marge` (8), `duree` (450 ms, 0 en mode calme), `clicVoileQuitte` (false), `fleches` (true), `textes` (tous les libellés, dont `etape: 'Étape {n} sur {total}'` pour l'annonce).
- Couleur du voile : `--vgd-voile` sur `.vgd-calque`. Par défaut la couleur du texte à 64 %, qui assombrit une identité claire ; sur une identité sombre, prendre le fond (`color-mix(in oklab, var(--couleur-fond) 78%, transparent)`). Rayon du trou et du halo : `--vgd-r` (`--rayon`).

## Pièges

- Le voile est un seul élément découpé par `clip-path: path(evenodd, …)` : le trou laisse passer les clics et le toucher, l'élément visé reste utilisable, le reste de la page est protégé (un clic sur le voile ne fait rien, sauf `clicVoileQuitte`). La molette et le doigt font toujours défiler la page.
- Le projecteur et la bulle sont recalculés à chaque défilement, redimensionnement ou changement de taille de l'élément (ResizeObserver), une image à la fois ; l'interpolation entre deux étapes est faite en JS (pas de transition CSS, qui traînerait pendant le défilement).
- Le trou s'arrête sous l'en-tête mesuré (`--entete-h`) : un élément sous un en-tête collant serait sinon « éclairé » à travers l'en-tête. Sur téléphone, il s'arrête au-dessus de la bulle.
- Focus : la bulle à l'ouverture (titre et texte lus par `aria-labelledby` / `aria-describedby`), puis le bouton utilisé ; chaque changement d'étape est annoncé par une zone `aria-live`. Tab circule entre la bulle et les éléments focalisables de la zone visée. À la sortie, le focus revient au bouton de lancement.
- Les flèches ne changent d'étape que si le focus est dans la bulle, pour ne pas voler ← → à un champ de la zone visée.
- Défilement : `socle.lenis.scrollTo` si le socle a lancé Lenis, sinon `scrollTo` natif (instantané en mode calme).

## Variantes

- Laissés de côté (propres au prototype d'origine) : navigation entre les vues de l'application à chaque étape (`vue`), étape qui attend un événement réel (`attendre`, la réservation d'une visite), récapitulatif chiffré en fin de visite, bouton plein écran, lien `?visite` qui lance la visite à l'ouverture, ainsi que tous les textes, couleurs et icônes de Warmline. Les deux premiers se refont avec l'événement `visite:etape` (la page change de vue, puis appelle `visite.aller(i)`).
- Pour une visite qui démarre seule, appeler `visite.lancer(0)` après le chargement (à réserver aux pages de démonstration).
- L'interface de démonstration (`.vgd__app` : barre latérale, tuiles, filtres, tableau) n'est qu'un support neutre ; on la remplace par l'interface réelle en gardant les `data-visite`.
