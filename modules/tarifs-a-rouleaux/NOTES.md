# Tarifs à rouleaux

Origine : `beat-haechler-maquette/wave-top` (chiffres en compteur mécanique, redevenus du texte simple), `pizzalyght-maquette/formules` (paliers de prix par onglets, odomètre en chiffres tabulaires), `iprof-maquette/tarifs-prices` (fiche mise en avant, économie signalée) et `esaie-55-1-maquette/parrainage-formules` (le choix de formule préremplit la demande). Module de base : des tarifs sur 19 maquettes, réécrits à chaque fois jusqu'ici.

## Usage

```html
<section class="trf socle-cadre" data-module="tarifs-a-rouleaux" aria-labelledby="trf-titre">
  <div class="trf__tete"><h2 class="trf__h2" id="trf-titre">Choisir sa formule</h2></div>
  <div class="trf__modes" role="radiogroup" aria-label="Mode de paiement">          <!-- facultatif -->
    <button type="button" class="trf__mode" role="radio" data-mode="seance" aria-checked="true">À la séance</button>
    <button type="button" class="trf__mode" role="radio" data-mode="mois" aria-checked="false">Abonnement</button>
  </div>
  <ul class="trf__grille">
    <li class="trf__formule" data-formule="Régulière" data-conseillee>
      <h3 class="trf__nom">Régulière</h3>
      <p class="trf__prix"><span class="trf__montant" data-prix='{"seance":"22","mois":"79"}'>22</span>
        <span class="trf__unite" data-unite='{"seance":"€ la séance","mois":"€ par mois"}'>€ la séance</span></p>
      <p class="trf__economie" data-economie='{"mois":"Séances illimitées"}' hidden></p>     <!-- facultatif -->
      <ul class="trf__inclus"><li>…</li></ul>
      <a class="socle-bouton trf__choisir" href="/contact#demande">Choisir</a>
    </li>
  </ul>
</section>
<script type="module">import { init } from './modules/tarifs-a-rouleaux/module.js'; init(document.querySelector('.trf'));</script>
```

- Les prix du premier mode sont écrits dans la page : sans JavaScript, tout est lisible et l'interrupteur est caché. Dans le socle de la skill, les formules viennent d'un fichier de données (`donnees/tarifs.json`) et le gabarit écrit les cartes et les JSON `data-prix`.
- `init()` renvoie `{ mode, detruire }` : `mode()` donne le mode affiché, `mode('mois')` le change.
- « Choisir » ajoute `formule` et `mode` à l'adresse. Vers une autre page, la navigation reste normale (voile du socle de la skill pendant lequel le tampon « Choisie » se voit) ; vers la même page, l'adresse change sans rechargement, la page descend jusqu'à l'ancre, et l'évènement `trf:choix` (`{ formule, mode, libelle, url }`) permet de préremplir un formulaire déjà chargé.

## Réglages

`mode`, `rouler` (true), `duree` (0,9 s), `conseillee`, `choisie` : voir `module.json`. Largeur minimale d'une carte : `--trf-min`.

## Pièges

- Le montant a une hauteur figée à 1em, en texte comme en rouleaux, et l'unité est centrée sur lui : aligné sur la ligne de base, l'unité sautait au début et à la fin du roulement (la ligne de base d'une colonne qui masque son contenu est son bord bas).
- Colonnes en chiffres tabulaires (`tabular-nums`) et hauteur en em avec `line-height: 1`, sinon les chiffres débordent de leur fenêtre ou la largeur saute ; colonnes `aria-hidden`, valeur finale lue par le lecteur d'écran, puis tout redevient du texte simple (crénage, sélection, copie).
- La ligne d'économie est réservée même vide (texte transparent, `aria-hidden`) : sinon les cartes sautent à chaque changement de mode. Pas de `visibility: hidden` : un paragraphe caché en mode calme passe pour un contenu perdu.
- Changer l'adresse avec de nouveaux paramètres recharge la page : vers la même page, le module utilise `history.replaceState` pour garder le tampon et la position.
- Mode calme : aucun roulement, les prix changent d'un coup.

## Variantes

- Fiches de prix dont les montants s'écrivent à la main (`iprof-maquette/tarifs-prices`) : remplacer `ecrire()` par une révélation en `clip-path` de gauche à droite, en réservant la largeur finale.
- Cartes qui se retournent pour montrer le détail (`goodlife-maquette/tarifs-seance`) : face arrière en CSS 3D, focus déplacé sur la face visible.
