# Ardoise à la craie

Origine : `jardins-hacienda-maquette/la-carte-ardoise` (« Les suggestions du chef », 4) : sur une photo d'ardoise vierge générée, le titre, un trait de soulignement et quatre lignes s'écrivaient à la craie de gauche à droite (masque piloté par `--m`), un chiffon flou passait, déclenché une fois au défilement. Famille « Donner faim au premier regard ».

Rendu générique :
- l'ardoise est **dessinée en CSS** (cadre en bois teinté de l'accent, ardoise mêlée de la couleur secondaire, traces de craie effacée, grain dessiné une fois en canvas) ; la photo devient facultative (`.ardoise__fond`) ;
- la craie a un **vrai grain** : un filtre SVG (bruit qui ronge les lettres, bord légèrement tremblé) ajouté par le module, et un **bâton de craie** suit le bout du trait ;
- le chiffon passe **avant** d'écrire (on efface l'ardoise d'hier), puis date, titre, soulignement, lignes et mot de la fin s'écrivent dans l'ordre, chaque ligne au rythme de sa longueur ;
- **texte du jour modifiable** sans toucher la page : un petit fichier JSON (`data-source`), la date du jour automatique, et `ecrire(contenu)` pour effacer et réécrire (ardoise du midi et du soir, à emporter).
Laissé de côté (identité) : la photo d'ardoise générée, le texte « à compléter », le lien Instagram, la police Caveat (la démonstration la charge, le module ne la fixe pas).

## Usage

```html
<section class="ardoise-section" data-module="ardoise-a-la-craie" aria-labelledby="ardoise-titre">
  <div class="ardoise-section__grille socle-cadre">
    <div class="ardoise" data-source="/ardoise-du-jour.json">          <!-- data-source facultatif -->
      <div class="ardoise__surface">
        <!-- <div class="ardoise__fond" aria-hidden="true"><img src="…" alt=""></div>   photo d'ardoise vide, facultative -->
        <p class="ardoise__date" data-ardoise-date><span>Aujourd'hui</span></p>      <!-- facultatif : la date du jour s'y écrit -->
        <h3 class="ardoise__titre"><span>Suggestions du jour</span></h3>
        <svg class="ardoise__trait" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 90 6, 200 22, 396 10" pathLength="1" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
        <ul class="ardoise__liste">
          <li><span class="ardoise__plat">Velouté de potimarron, noisettes torréfiées</span><span class="ardoise__prix">9 €</span></li> …
        </ul>
        <p class="ardoise__mot"><span>Selon l'arrivage, jusqu'à épuisement</span></p>  <!-- facultatif -->
      </div>
    </div>
    <div class="ardoise-section__texte">…surtitre, h2#ardoise-titre, p, boutons…</div>
  </div>
</section>
<script type="module">
  import { init } from './modules/ardoise-a-la-craie/module.js';
  const api = await init(document.querySelector('[data-module="ardoise-a-la-craie"]'));
</script>
```

- Le texte de l'ardoise est du **vrai texte** (lu par les lecteurs d'écran, indexé) : sans JavaScript et en mode calme, il est simplement écrit.
- Police de la craie : `--ardoise-police` (par défaut la police des titres). Prendre une manuscrite lisible : Caveat, Kalam, Gochi Hand, Patrick Hand (600 pour la craie).
- Couleurs, toutes réglables : `--ardoise-fond` (secondaire mêlée d'ardoise), `--ardoise-craie` (blanc teinté par l'ardoise), `--ardoise-bois` (accent et secondaire), `--ardoise-cadre` (épaisseur du cadre).
- Tailles en `cqi` : le texte suit la largeur de l'ardoise, pas celle de l'écran (l'ardoise peut être dans une colonne étroite).

## Texte du jour

1. **Dans la page** : la liste HTML. C'est ce que voient les moteurs, le mode calme et le visiteur sans JavaScript.
2. **Fichier du jour** : `data-source="/ardoise-du-jour.json"` (ou l'option `source`), modèle dans `exemple-ardoise-du-jour.json` :
   `{ "date": "auto", "titre": "…", "lignes": [ { "plat": "…", "prix": "9 €" }, "ligne sans prix" ], "mot": "…" }`. Un champ absent garde le texte de la page, `null` l'efface (`"mot": null`). S'il arrive avant l'écriture, il la remplace sans bruit ; s'il arrive après, l'ardoise s'efface et se réécrit. Le restaurateur change ce fichier (ou un outil le produit depuis un tableur), la page ne bouge pas. Fichier introuvable : l'ardoise garde son texte.
3. **`api.ecrire(contenu)`** (même forme) : le chiffon passe, les lignes pâlissent à son passage, le nouveau texte s'écrit. La démonstration bascule ainsi entre l'ardoise du midi et celle du soir.
- `data-ardoise-date` vide ou `"auto"` : « Samedi 7 novembre » (date de l'appareil, en français). Avec un texte (`data-ardoise-date="Cette semaine"`), il est gardé.

## Réglages

- `vitesse` (1) : chaque ligne s'écrit en 0,2 s plus 16 ms par caractère (1 s au plus), la suivante commence un peu avant la fin ; une ardoise de quatre lignes s'écrit en cinq à six secondes.
- `debut` (`top 78%`) : l'ardoise s'écrit une seule fois, quand son haut atteint 78 % de l'écran.
- `chiffon` (vrai) : le passage du chiffon avant d'écrire.

## Pièges

- Le masque d'écriture est posé sur chaque ligne (`li` entier, prix compris) : une ligne qui passe sur deux lignes à l'écran s'écrit sur les deux à la fois. Garder des intitulés courts (45 caractères au plus) ; au-delà de six lignes, faire deux ardoises.
- Le filtre de craie est référencé par l'identifiant `ardoise-craie` : il est ajouté une seule fois à la page, ne pas réutiliser cet identifiant.
- Le texte est masqué (`--m: -10%`) seulement quand le module a pris la main (`.est-actif`) : sans JavaScript, en mode calme et sous « réduire les animations », il est visible d'emblée, et ni le chiffon ni le bâton ne sont créés.
- L'ardoise garde son rapport (16:10, 4:4,4 sur téléphone) tant que le texte y tient, et grandit sinon : la hauteur ne coupe jamais une ligne.
- Contenu venu du JSON : construit avec `textContent`, jamais en HTML.

## Variantes

- Boulangerie : « Sorties du four » avec les heures (`"prix": "11 h"`) ; caviste : « Au verre ce soir » ; traiteur : « À emporter aujourd'hui ».
- Deux ardoises (midi et soir) : deux boutons qui appellent `ecrire()`, comme dans la démonstration, ou deux fichiers choisis selon l'heure.
- Sur une page claire, l'ardoise seule (sans `.ardoise-section__texte`) au milieu d'une carte.
