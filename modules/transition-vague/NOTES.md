# Transition en vague

Origine : `beat-haechler-maquette/veil` (vague SVG qui monte entre deux pages).

## Usage

1. Dans le `head` de **chaque page**, avant les feuilles de style, le script critique (il pose `html.tv-couvert` si l'on arrive par un lien interne, et le retire au plus tard après 2 s) :

```html
<script>
  (function (h) {
    try { if (sessionStorage.getItem('tv-voile') === '1') h.classList.add('tv-couvert'); sessionStorage.removeItem('tv-voile'); } catch (e) {}
    setTimeout(function () { h.classList.remove('tv-couvert'); }, 2000);
  })(document.documentElement);
</script>
```

2. En fin de `body`, le voile (`div.tv` avec `svg.tv__vague` et `div.tv__corps > span.tv__nom`, voir `index.html`) puis `init(document.querySelector('.tv'))`.

`init` renvoie `{ partir(url, nom), detruire() }` : `partir` sert à déclencher la transition depuis un bouton ou un formulaire.

## Réglages

- `montee` (0,75 s), `retrait` (0,85 s).
- `nom` : le nom de la page d'arrivée s'affiche sur le voile ; il vient de `data-voile-nom` sur le lien, sinon de son texte.
- `exclure` : `[data-sans-voile]` par défaut (téléchargements, liens vers une application).
- Couleurs : `--voile-couleur` (défaut `--couleur-secondaire`) et `--voile-texte` (défaut `--couleur-fond`) à fixer dans la page ; vérifier le contraste du nom (4,5:1).

## Pièges

- **Projet bâti sur le socle de la skill (v10.2 et suivantes) : ne pas utiliser ce module.** Le voile du socle a déjà cette forme : `"formeVoile": "vague"` dans `donnees/site.json` (bord ondulé à la montée et au retrait, `assets/js/socle/voile.js`). Ce module sert aux pages hors socle.
- Sans le script critique, la page d'arrivée s'affiche découverte un instant puis le voile n'a rien à retirer : la transition paraît coupée.
- Liens vers la page en cours : comparaison de chemins normalisés (sans `.html`, sans `index`, sans barre finale), sinon un lien `/contact` depuis `/contact.html` recharge la page. Les ancres de la même page défilent sous l'en-tête mesuré, sans voile.
- Retour arrière depuis le cache (`pageshow` avec `persisted`) : la page revient découverte ; la clé de session est effacée dès l'arrivée, donc un rechargement ne rejoue jamais le voile.
- Mode calme et « réduire les animations » : navigation directe, voile masqué en CSS.
- Liens externes, `target="_blank"`, `download`, touches de modification (Cmd, Ctrl, Maj) : comportement natif.
- Pendant l'arrivée couverte, `html` passe en `overflow: hidden` (le socle garde la gouttière de la barre de défilement, donc rien ne bouge).

## Variantes

- Sur la maquette d'origine, le script critique lisait aussi un réglage « calme » mémorisé en localStorage : à brancher sur le mode calme du projet.
- Voile qui descend au lieu de monter : inverser `yPercent` (105 → 0 puis 0 → 125) et retourner le SVG.
