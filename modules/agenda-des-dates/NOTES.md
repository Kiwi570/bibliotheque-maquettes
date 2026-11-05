# Agenda des dates

Origine : `les-plus-hautes-eaux-maquette/agenda-t-venir` (tri selon la date du jour réelle, compte à rebours de la prochaine date, ajout à l'agenda par .ics, filtres), `petitenature-maquette/agenda-rendez-vous` (dates passées et à venir, regroupement, données « à compléter », fin par défaut du .ics) et `goodlife-maquette/planning-planning` (statut des créneaux, cours passés grisés, réservation). Module de base : présent sur 23 maquettes, réécrit à chaque fois jusqu'ici.

## Usage

```html
<section class="agd socle-cadre" data-module="agenda-des-dates" aria-labelledby="agd-titre">
  <div class="agd__tete">
    <h2 class="agd__h2" id="agd-titre">Les prochaines dates</h2>
    <p class="agd__prochaine" data-prochaine aria-live="polite"></p>            <!-- facultatif : compte à rebours -->
  </div>
  <div class="agd__outils">                                                     <!-- facultatif : filtres et compteur -->
    <div class="agd__filtres" role="group" aria-label="Types de dates"></div>
    <p class="agd__compte" data-compte aria-live="polite"></p>
  </div>
  <ol class="agd__liste">
    <li class="agd__date" data-debut="2026-11-20T19:00" data-fin="2026-11-20T21:30" data-type="Stage"
        data-lieu="La grange" data-places="3" data-reserver="/contact#demande">
      <h3 class="agd__titre">Stage d'une journée</h3>
      <time class="agd__quand" datetime="2026-11-20T19:00">20 novembre 2026, 19 h</time>   <!-- facultatif : écrit par le module s'il manque -->
      <p class="agd__texte">…</p>
    </li>
  </ol>
  <p class="agd__vide" hidden>Aucune date de ce type pour le moment.</p>
</section>
<script type="module">import { init } from './modules/agenda-des-dates/module.js'; init(document.querySelector('.agd'));</script>
```

- Dans le socle de la skill, les dates viennent d'un fichier de données (`donnees/agenda.json`) et le gabarit écrit les `<li>` : la page reste lisible sans JavaScript (titre, date écrite, lieu).
- `data-debut` : date seule (« 2026-11-20 », journée entière) ou date et heure locales ; vide : « date à confirmer », rangée à la fin. `data-fin` facultatif (`dureeDefaut`). `data-places="0"` ou `data-complet` : complet, le bouton devient « Liste d'attente ».
- `init()` renvoie `{ actualiser, detruire }` ; `actualiser()` reclasse les dates (après un changement de données).

## Réglages

`maintenant`, `dureeDefaut` (90), `dernieresPlaces` (3), `parMois` (true), `reserver`, `fuseau`, `langue`, `textes` : voir `module.json`. Taille de la pastille : `--agd-pastille`.

## Pièges

- Les dates passées et à venir se calculent à l'affichage, au jour réel du visiteur, jamais à la génération des pages : une page générée la veille afficherait sinon une date passée « à venir ».
- `new Date('2026-11-20')` est lue en UTC (veille au soir en Amérique) : le module lit une date seule à minuit local.
- Le fichier .ics est fabriqué à la volée (Blob) : heure locale « flottante » par défaut, `fuseau` pour fixer un fuseau ; fin par défaut quand `data-fin` manque ; lignes repliées à 75 caractères, virgules et points-virgules échappés (sinon Outlook coupe le titre).
- Le lien « Réserver » reçoit `sujet` et `date` dans l'adresse : le formulaire du site se préremplit (`[data-formulaire]` du socle de la skill lit `?sujet=`).
- Le compte à rebours et les statuts se recalculent toutes les minutes (onglet visible seulement) ; en mode calme, une seule fois, et rien n'apparaît en glissant.
- Retour physique de l'ajout à l'agenda (grille wouahou, point 7) : la pastille se tamponne « Ajouté ». Le projet pose `data-grille="retour"` sur la section s'il le compte dans sa grille.
- Le module déplace les `<li>` (mois, dates passées) : ne pas poser de déclencheur de défilement sur une date avant l'appel à `init()`.

## Variantes

- Planning d'une semaine (onglets de jours, créneaux à l'heure) comme `goodlife-maquette/planning-planning` : même lecture des dates, autre affichage ; à extraire si un second projet en a besoin.
- Compte à rebours en grand (jours, heures, minutes) : lire `data-prochaine` et le mettre en scène dans le projet, sans recalcul plus fréquent que la minute.
