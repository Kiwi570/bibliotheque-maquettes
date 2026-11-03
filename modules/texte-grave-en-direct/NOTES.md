# Texte gravé en direct

Origine (fusion) : `gwenanou-print-maquette/heros` (« Prénom gravé en direct », noté 5), `beat-haechler-maquette/bons-cadeaux-hero` (bon cadeau dont le prénom s'écrit sur l'enveloppe, noté 5), avec `gwenanou-print-maquette/simulateur` et `pixncroq-maquette/boutique-cadeau`.

- gwenanou (héros) apporte la gravure laser en canvas 2D : balayage ligne à ligne en aller-retour, brûlure révélée derrière le laser, lueur et étincelles, attente des polices avant de graver, rendu final direct en mode calme ;
- gwenanou (simulateur) apporte le choix de la finition et le regravage à chaque changement ;
- beat-haechler apporte l'idée du texte saisi qui se pose aussitôt sur l'objet cadeau, et l'état final posé d'emblée en mode calme ;
- pixncroq apporte le report en direct des champs sur la carte et l'événement qui relie l'aperçu à un formulaire de commande.

## Usage

```html
<section class="tgd" data-module="texte-grave-en-direct">
  <div class="tgd__cadre socle-cadre">
    <figure class="tgd__scene">
      <canvas class="tgd__toile" aria-hidden="true"></canvas>
      <p class="tgd__repli">Votre prénom</p>                       <!-- visible seulement sans JavaScript -->
      <figcaption class="tgd__legende">Aperçu indicatif…</figcaption>
      <p class="tgd__annonce socle-sr" aria-live="polite"></p>      <!-- équivalent texte du canvas -->
    </figure>
    <form class="tgd__form">
      <div class="tgd__saisie"><input class="tgd__entree" id="tgd-texte" aria-describedby="tgd-compteur"><span class="tgd__compteur" id="tgd-compteur"></span></div>
      <fieldset class="tgd__groupe"><legend>Finition</legend><div class="tgd__liste">
        <label class="tgd__choix"><input type="radio" name="style" value="grave" checked>Gravé</label> … brode, imprime, ecrit
      </div></fieldset>
      <fieldset class="tgd__groupe"><legend>Support</legend><div class="tgd__liste">
        <label class="tgd__choix"><input type="radio" name="support" value="plaque" data-article="une" checked>Plaque</label> … etiquette, carte
      </div></fieldset>
      <button type="submit">Rejouer l'aperçu</button> <button type="button" data-telecharger>Télécharger l'image</button>
    </form>
  </div>
</section>
<script type="module">
  import { init } from './modules/texte-grave-en-direct/module.js';
  const api = await init(document.querySelector('.tgd'), { max: 20 });
  document.addEventListener('saisie:change', e => console.log(e.detail)); // { texte, style, support }
</script>
```

Les styles et supports proposés sont ceux des boutons radio présents (on peut en retirer). Le libellé annoncé vient du texte du bouton (éléments `aria-hidden` exclus) ou de `data-libelle` ; `data-article` (« une ») précède le support dans l'annonce. `init()` renvoie `{ valeur(), regler({ texte, style, support }), rejouer(), exporter() (Blob PNG), detruire() }` ; `nettoyer(texte, max)` est aussi exporté pour reprendre le même nettoyage côté formulaire.

## Réglages

- Options : `max` (20 graphèmes), `texteVide` ('Votre prénom'), `style` / `support` de départ, `courbure` (arc du texte ; 1 par défaut sur l'étiquette, 0 ailleurs, négatif pour un arc inversé), `vitesse` (1), `etincelles` (true), `jouerALaVue` (true), `telechargement` (true), `largeurPng` (1600), `nomFichier` ('apercu'), `annonce`.
- Couleurs du rendu (variables sur `.tgd`) : `--tgd-support` (matière de l'objet, clair par défaut), `--tgd-encre` (creux de gravure, impression, écriture ; `--couleur-fond` par défaut, à inverser sur une page claire), `--tgd-fil` (broderie, accent), `--tgd-lueur` (laser). Le module les lit au démarrage et à chaque changement de support.
- Polices : `--tgd-police-gravee`, `--tgd-police-brodee`, `--tgd-police-imprimee`, `--tgd-police-ecrite` ; cette dernière reprend `--police-manuscrite` si la page en fixe une, sinon la police des titres.
- Rythme : chaque lettre apparaît en 420 à 760 ms selon le style, décalées pour une durée totale d'environ 2 s au plus ; à la frappe, seules les nouvelles lettres apparaissent.

## Pièges

- Le texte saisi n'entre jamais dans le HTML : il est dessiné dans le canvas, annoncé par `textContent` et nettoyé (caractères de contrôle, marques de direction, sauts de ligne, espaces multiples). La limite compte des graphèmes (`Intl.Segmenter`), pas des unités UTF-16 : un émoji composé compte pour un.
- Attendre les polices avant de dessiner (`document.fonts.load` pour les quatre styles), sinon la police de secours est gravée ; au chargement tardif d'une police, le rendu est refait.
- Ne réassigner `canvas.width` que si la taille change : cela vide la toile (et le support pré-rendu).
- Les couleurs `color-mix()` calculées arrivent en `color(srgb …)` : le module les convertit lui-même avant de les passer au canvas.
- Animation seulement pendant l'apparition (aucune boucle permanente) ; hors écran ou onglet caché, le rendu final est posé directement. Mode calme et « réduire les animations » : rendu final, sans laser ni étincelles.
- Écran étroit : la scène passe en 4:3 puis en carré sous 420 px pour que le texte reste lisible ; le corps du texte se calcule pour tenir dans la zone de l'objet.
- Toujours dire que l'aperçu est indicatif : le rendu réel dépend de la matière et de la machine.

## Variantes

- Laissés de côté (identité) : la photo de planche de noyer en perspective (homographie `matrix3d`), les textures de matières et les objets détourés flottants de gwenanou ; l'enveloppe, le rabat 3D, la carte retournable et les visuels de beat-haechler ; la carte dorée, le montant et le panier de pixncroq.
- Sur une photo de produit : placer la toile au-dessus d'une `<img>` et fixer `--tgd-support` transparent, ou reprendre l'homographie de gwenanou (`matrice()` de `engrave.js`) pour poser le canvas en perspective.
- Deux lignes (prénom + date) : découper la saisie sur un séparateur et appeler `disposer()` par ligne.
- Bon cadeau : relier `saisie:change` aux champs « Pour » d'un formulaire de commande (pixncroq), ou utiliser `exporter()` pour joindre l'aperçu à une demande de devis.
