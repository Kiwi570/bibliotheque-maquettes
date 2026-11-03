# Composeur de formule

Origine : fusion de `tiki-cassis-maquette/formules-composeur` (« Composeur de sortie ») et `iprof-maquette/tarifs-calculateur` (« Calculateur écrit à la main »).

- Tiki Cassis apporte la mise en page en deux panneaux (choix à gauche, récapitulatif collant à droite), les choix en cartes radio, le champ nombre entre deux boutons ±, la case d'option, le total qui compte jusqu'à sa nouvelle valeur et le « sur demande » quand un prix n'existe pas.
- iProf apporte le détail du calcul réécrit ligne par ligne (masque de gauche à droite), les bornes min et max imposées après chaque saisie, la ligne désactivée quand le choix ne s'y prête pas (visites à domicile en cours à distance), l'économie du forfait (ici une remise par seuil) et la mention « illustratif ».
- Laissé de côté (identité ou métier) : la carte des calanques et le programme indicatif, les saisons calculées (Pâques, ponts de mai), le curseur de durée, le choix d'un événement daté, les avertissements propres au bateau ; chez iProf, la fiche quadrillée penchée, l'écriture manuscrite, le tampon qui rebondit et le franc suisse.

## Usage

```html
<section class="cdf socle-cadre" data-module="composeur-de-formule" data-epingle>
  <script type="application/json" class="cdf__donnees">{ "devise": "EUR", "bases": {…}, "options": {…}, "remises": […] }</script>
  <form class="cdf__form">
    <!-- radios name="base", champs number (name = clé de quantité, data-unites="personne|personnes") entre deux [data-pas="-1|1"], cases à cocher -->
  </form>
  <aside class="cdf__recap" data-tient>[data-total] [data-par-unite] mention, appel, ul[data-lignes], [data-annonce] (aria-live)</aside>
</section>
```

`init(section, options)` renvoie `{ rendre, detruire }`. À chaque changement, la section émet `composeur:change` (`detail` : `total`, `lignes`, `quantites`, `base`, `resume`) pour préremplir un formulaire de contact.

Données : `bases` et `options` sont indexées par la `value` des champs. Chaque tarif vaut `{ "prix": 30, "par": ["personnes", "seances"] }` (multiplié par ces quantités ; sans `par`, c'est un forfait). `"prix": null` affiche « Sur devis » pour une base (le total devient « Sur devis ») et « sur demande » pour une option (exclue du total). `"avec": ["base-a"]` désactive une option avec les autres bases. `remises` : `{ "quantite", "des", "pourcent", "libelle" }`, appliquée au sous-total dès le seuil, annoncée avant (« Remise dès 5 séances : −10 % »).

## Réglages

- `donnees` : tarifs passés en JS plutôt que dans le `<script type="application/json">`.
- `devise` / `locale` / `decimales` : mise en forme `Intl.NumberFormat` ; décimales automatiques (0 si tous les prix sont entiers).
- `duree` (0,8 s) : compteur du total.
- `parUnite` (`'personnes'`) : ligne « soit X par personne » quand la quantité dépasse 1.
- `champResume` : sélecteur d'un champ caché ou d'une zone de texte qui reçoit le résumé de la formule.
- `textes` : tous les libellés générés.

## Pièges

- Jamais de prix dans le HTML ni dans `module.js` : les cartes reçoivent leur prix depuis les données (place réservée en CSS, aucun décalage), les libellés et bornes restent dans le HTML. Dans une maquette client, les tarifs viennent du site du client ; en démonstration, mention « Tarifs indicatifs de démonstration » obligatoire.
- Le premier rendu se fait avant le chargement de GSAP : détail et total sont posés immédiatement, sans compteur.
- Le total annoncé aux lecteurs d'écran passe par une zone `aria-live` séparée, mise à jour 450 ms après la dernière saisie : le compteur visuel ne bavarde pas.
- Bornes : appliquées au `change` et aux boutons, pas pendant la frappe (on peut effacer le champ pour taper « 12 ») ; boutons ± en `aria-disabled` aux bornes, jamais `disabled` (le focus resterait perdu).
- Le récapitulatif colle seulement à partir de 900 × 700 px et ne dépasse jamais l'écran (`max-height`, défilement interne) ; la section reçoit `est-epingle` pendant qu'il colle. En dessous, une barre du total colle en bas du formulaire (CSS seul) avec un lien vers le détail.
- Champ natif posé sur toute la carte : la cible fait la taille de la carte, le clavier fonctionne (flèches pour les bases, espace pour les options).

## Variantes

- Fiche de cahier (iProf) : récapitulatif sur papier quadrillé (`background` en deux `linear-gradient` à partir de `--couleur-texte`), légère rotation, police manuscrite en `--police-titres`, lignes du détail en manuscrit séparées par des tirets, total qui rebondit comme un tampon (`scale` 1,12 → 1 avec `back.out`) et pastille « Illustratif » en tampon. Tout se fait dans la feuille de style de la page avec un modificateur `.cdf--cahier`, sans toucher au JS.
- Fourchette (iProf) : un tarif `{ "min": 20, "max": 50 }` donnerait un total « de … à … » ; non repris ici, à ajouter si un client affiche des fourchettes.
- Saisons (Tiki Cassis) : une base dont le prix dépend de la date se traite en amont : `detruire()` puis `init()` avec les `donnees` recalculées.
