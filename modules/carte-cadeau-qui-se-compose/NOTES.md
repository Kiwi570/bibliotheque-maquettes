# Carte cadeau qui se compose

Origine : `jardins-hacienda-maquette/carte-cadeau-composer` (« Composer votre carte », 4 : montant en boutons, quantité, prénom et mot, la carte se met à jour en direct avec le total, envoi simulé) et `beat-haechler-maquette/bons-cadeaux-hero` (« Bon cadeau dans son enveloppe », 5 : enveloppe dessinée en CSS, rabat qui s'ouvre en 3D, carte qui en sort, inclinaison sous la souris). Famille « Restaurant : effet wouahou » (restaurants, cafés, bars, caves, traiteurs).

La carte se dessine pendant qu'on remplit le formulaire : le filet doré se trace à l'arrivée, le montant compte jusqu'à la nouvelle valeur, le prénom et le mot s'écrivent à la main, une pile de cartes grandit avec la quantité, le ticket et le total suivent. À la validation, la carte glisse dans une enveloppe : la poche monte, la carte descend dedans, le rabat se ferme en 3D (doublure rayée visible pendant qu'il bascule), un cachet de cire aux initiales de la maison tombe et le prénom s'écrit sur l'enveloppe. Sous la souris, la carte s'incline et un reflet suit le pointeur.

Rendu générique : carte entièrement en CSS (couleurs tirées des variables, logo facultatif), enveloppe et cachet ajoutés par le module, montant libre en plus des boutons, quantité en − / +, achat simulé ou vrai achat par `envoyer()`. Laissé de côté (identité) : la carte pivotant au défilement, le retournement recto-verso, le fond WebGL de Beat Haechler.

## Usage

```html
<section class="ccq" data-module="carte-cadeau-qui-se-compose" data-cachet="JH" aria-labelledby="ccq-titre">
  <div class="ccq__grille socle-cadre">
    <div class="ccq__tete">…surtitre, h2#ccq-titre, p…</div>
    <div class="ccq__scene" aria-hidden="true">                 <!-- décor : tout ce qu'elle montre est dans le formulaire -->
      <div class="ccq__plateau"><div class="ccq__paquet"><div class="ccq__carte">
        <svg class="ccq__cadre" viewBox="0 0 160 100" preserveAspectRatio="none"><rect x="3.2" y="3.2" width="153.6" height="93.6" rx="5" ry="5" pathLength="1"/></svg>
        <div class="ccq__carte-haut">
          <span class="ccq__monogramme">JH</span>               <!-- ou <span class="ccq__logo"><img src="logo.svg" alt=""></span> -->
          <span class="ccq__noms"><span class="ccq__type">Carte cadeau</span><span class="ccq__maison">Nom de la maison</span></span>
          <span class="ccq__quantite" data-ccq-quantite hidden>× 1</span>
        </div>
        <div class="ccq__carte-bas">
          <p class="ccq__montant"><span data-ccq-montant>50</span><span class="ccq__devise">€</span></p>
          <div class="ccq__dedicace"><p class="ccq__pour" data-ccq-pour></p><p class="ccq__mot" data-ccq-mot></p><p class="ccq__de" data-ccq-de></p></div>
        </div>
        <span class="ccq__reflet"></span>
      </div></div></div>
      <p class="ccq__ticket" data-ccq-ticket>Une carte de 50 €</p>
    </div>
    <form class="ccq__form" action="/carte-cadeau/commande" method="post" novalidate>
      <fieldset class="ccq__champ"><legend class="ccq__libelle">Montant</legend>
        <div class="ccq__puces">
          <label class="ccq__puce"><input type="radio" name="montant" value="50" checked><span>50 €</span></label> …
          <label class="ccq__puce"><input type="radio" name="montant" value="libre"><span>Autre</span></label>
          <span class="ccq__libre"><input type="number" name="montant_libre" min="10" max="1000" aria-label="Montant libre, en euros (de 10 à 1 000)" aria-describedby="ccq-erreur-montant"><span aria-hidden="true">€</span></span>
        </div>
        <p class="ccq__erreur" id="ccq-erreur-montant" data-ccq-erreur="montant" aria-live="polite"></p>
      </fieldset>
      <div class="ccq__champ"><label class="ccq__libelle" for="ccq-qte">Nombre de cartes</label>
        <div class="ccq__qte"><button type="button" data-ccq-moins aria-label="Une carte de moins">−</button><input type="number" id="ccq-qte" name="quantite" value="1" min="1" max="10"><button type="button" data-ccq-plus aria-label="Une carte de plus">+</button></div></div>
      <div class="ccq__deux">…input name="pour", input name="de"…</div>
      <div class="ccq__champ">…textarea name="mot" maxlength="120", <p class="ccq__aide"><span data-ccq-reste>120</span> caractères au plus</p>…</div>
      <p class="ccq__total"><span>Total</span><output data-ccq-total>50 €</output></p>
      <p class="socle-sr" aria-live="polite" data-ccq-annonce></p>
      <div class="ccq__actions"><button type="submit" class="socle-bouton socle-bouton--plein ccq__offrir">Offrir cette carte</button>
        <button type="button" class="socle-bouton" data-ccq-reprendre hidden>Composer une autre carte</button></div>
      <p class="ccq__statut" role="status" data-ccq-statut hidden></p>
    </form>
  </div>
</section>
<script type="module">
  import { init } from './modules/carte-cadeau-qui-se-compose/module.js';
  const api = await init(document.querySelector('[data-module="carte-cadeau-qui-se-compose"]'), {
    // envoyer: async (commande) => (await fetch('/api/carte-cadeau', { method: 'POST', body: JSON.stringify(commande) })).ok,
  });
</script>
```

- Le module lit les champs par leur **nom** (`montant`, `montant_libre`, `quantite`, `pour`, `de`, `mot`) : on peut changer l'ordre, les libellés, les montants proposés, retirer « De la part de » ou le mot.
- Police manuscrite du prénom, du mot et de l'enveloppe : `--ccq-main` (par défaut la police des titres). Prendre une manuscrite lisible : Caveat, Kalam, Patrick Hand (600).
- Couleurs, toutes réglables sur `.ccq` : `--ccq-carte` (fond de la carte, la couleur secondaire), `--ccq-encre`, `--ccq-or` (filet, monogramme, devise), `--ccq-papier` (enveloppe, le fond teinté d'accent), `--ccq-cire` (cachet, l'accent foncé).
- Tailles de la carte en `cqi` : tout suit sa largeur (31 rem au plus), elle peut vivre dans une colonne étroite.
- Grand écran assez haut (900 px de large, 640 de haut) : la scène est collante à côté du formulaire.

## Réglages et API

- `min` (10), `max` (1000) : bornes du montant libre (message d'erreur sous les boutons, focus sur le champ). `quantiteMax` (10). `devise` (`EUR`), `langue` (`fr-FR`).
- `cachet` : initiales du cachet (sinon `data-cachet`, sinon le texte du monogramme).
- `envoyer(commande)` : branchement du vrai achat (panier, paiement, réservation d'un bon). Tant qu'elle n'a pas répondu, le statut dit « Préparation de la carte… » ; `false` ou une erreur affichent `textes.echec` et la carte reste sur la table ; sinon elle part dans l'enveloppe. Sans `envoyer`, l'achat est simulé et le statut le dit.
- Événement `ccq:valide` (sur la section, `detail` = `{ montant, quantite, total, pour, de, mot }`) envoyé à chaque validation acceptée.
- `api.lire()`, `api.sceller()` (ferme l'enveloppe sans contrôle), `api.ouvrir()` (rend la carte au formulaire), `api.detruire()`.
- Modifier un champ quand l'enveloppe est fermée la rouvre ; « Composer une autre carte » aussi (le focus revient sur le bouton d'envoi).

## Pièges

- La scène est `aria-hidden` : tout ce qu'elle affiche doit exister dans le formulaire (le total est lu dans `output`, annoncé après une pause de saisie par `[data-ccq-annonce]`). Ne pas mettre de lien ni de bouton dans la carte.
- Le décalage des cartes de la pile est dans `transform` (CSS) : leur entrée passe par `translate` et `opacity`. Ne pas animer `transform` sur `.ccq__pile > span`.
- L'enveloppe est centrée par `left`/`top` calculés (pas par `translate`, que GSAP reprendrait dans sa transformation) : garder `--ccq-env-l` pour changer sa largeur, le plateau prend sa hauteur.
- Le rabat ouvert (125°, renversé vers l'arrière) dépasse au-dessus de l'enveloppe d'un tiers de sa hauteur : laisser l'espace au-dessus de la scène (marge haute de `.ccq__scene`), sinon il passe sur le texte du dessus pendant une seconde.
- Sans JavaScript, c'est un formulaire ordinaire : régler `action` et `method` sur la vraie page de commande (le serveur reçoit `montant`, `montant_libre`, `quantite`, `pour`, `de`, `mot`).
- Mode calme et « réduire les animations » : la carte suit le formulaire sans compter ni glisser, l'enveloppe apparaît fermée d'un coup, aucun reflet.

## Variantes

- Cave : « Coffret dégustation » avec montants fixes et quantité ; bar : « Carte cocktails » (cachet aux initiales du bar) ; traiteur : « Bon pour un repas livré ».
- Montants fixes seulement : retirer le bouton « Autre » et le champ libre. Montant libre seulement : un seul champ `montant_libre` et le bouton radio `libre` coché et masqué.
- Bon d'une prestation (menu, soin, atelier) : remplacer les boutons de montant par des formules (`value` = prix), le nom de la formule dans `.ccq__type`.
