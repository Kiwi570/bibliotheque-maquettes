# Réservation de table

Origine : `jardins-hacienda-maquette/reserver-formulaire` (4) pour le formulaire (date à venir, service midi ou soir, couverts, coordonnées, préremplissage depuis l'adresse, erreur écrite à côté du champ et lue par les lecteurs d'écran, bouton bloqué après l'envoi, message « demande simulée ») et `pizzalyght-maquette/panier` (4) pour les créneaux (calculés à l'heure du lieu, délai avant le premier, sinon le jour suivant ; état stocké relu avant chaque modification ; focus rendu au même contrôle après chaque rendu). Famille « restaurant : informer, rassurer, faire réserver ».

Rendu générique : les sept prochains jours en puces (fermés et complets grisés) en plus du calendrier, créneaux d'arrivée en puces avec **complets grisés** (liste du JSON, ou simulation stable pour la démonstration, ou fonction `complet` branchée sur le vrai système), nombre de couverts au compteur avec renvoi au téléphone pour les groupes, salle ou terrasse (terrasse de saison), demandes en puces et précision libre, **récapitulatif** tenu à jour à côté, puis récapitulatif à confirmer où **chaque ligne se modifie** (retour au champ, focus dessus), envoi simulé avec référence. Prérempli depuis l'adresse, brouillon gardé si l'on recharge la page. Aucune dépendance. Laissé de côté (identité) : sujets propres à l'Hacienda (journée festive, réception, Saint-Sylvestre), panier et règle d'âge de Pizzalyght.

## Usage

```html
<section class="resa socle-cadre" data-module="reservation-de-table" aria-labelledby="resa-titre">
  <script type="application/json" data-reservation>{ …réglages… }</script>
  <noscript><style>.resa__jours{display:none}.resa__creneaux{min-height:0}.resa__compteur button{display:none}</style></noscript>
  <div class="resa__grille">
    <form class="resa__form" data-resa-form action="…" novalidate>
      …fieldsets : date ([data-resa-jours] + input[name=date]), service (radios name=service), heure ([data-resa-creneaux] avec un select
      name=heure en repli + p[data-resa-creneaux-aide]), couverts (input[name=couverts] entre [data-moins] et [data-plus], p[data-resa-groupe]),
      espace (radios name=espace), demande (cases name=demande + textarea name=message), coordonnées (prenom, nom, telephone, email)…
      <button type="submit" class="resa__bouton">Vérifier ma réservation</button>
    </form>
    <aside class="resa__recap" data-resa-recap aria-label="Récapitulatif de la réservation"></aside>
  </div>
</section>
```

Le HTML complet est dans `index.html` : le recopier, puis ajuster les réglages, les services (une puce par service), les espaces et les demandes.

## Réglages (JSON de la section)

```json
{ "fuseau": "Europe/Paris", "delai_minutes": 60, "jours_a_l_avance": 60, "couverts_max": 10,
  "services": { "midi": { "libelle": "Midi", "debut": "12:00", "fin": "13:45", "pas": 15 }, "soir": { "libelle": "Soir", "debut": "19:00", "fin": "21:45", "pas": 15 } },
  "fermetures": { "jours": ["lundi"], "services": { "dimanche": ["soir"] }, "dates": ["2026-12-25"] },
  "espaces": [ { "id": "salle", "libelle": "En salle" }, { "id": "terrasse", "libelle": "En terrasse", "mois": [5,6,7,8,9], "note": "selon la météo", "hors_saison": "de mai à septembre" } ],
  "complets": { "2026-11-14": ["20:00", "20:15"] }, "complets_simules": false, "message_simule": "…" }
```

- `debut` et `fin` : première et dernière heure d'arrivée possibles, tous les `pas` minutes. Aujourd'hui, seules les heures après maintenant + `delai_minutes` (à l'heure du lieu) sont proposées.
- `complets` : créneaux pleins par date. `complets_simules: true` (démonstration seulement) grise des créneaux de façon stable, plus aux heures de pointe, le week-end et pour les grandes tables.
- Sur le site final : `init(el, { complet: (date, heure, couverts) => …, envoyer: async (demande) => ({ reference }) })` branche les disponibilités et l'envoi réels. Un événement `reservation:envoyee` part de la section après l'envoi (avec la demande et sa référence).

## Comportement

- Le jour : sept puces (aujourd'hui, demain, puis les jours ; « fermé » ou « complet » quand il n'y a plus rien), ou le calendrier (limité à `jours_a_l_avance`). Le service fermé ou complet ce jour-là est désactivé, l'autre est choisi ; le créneau choisi est gardé s'il reste libre.
- Couverts de 1 à `couverts_max` ; au maximum, le lien pour appeler. Les complets dépendent aussi du nombre de couverts.
- « Vérifier ma réservation » : erreurs à côté des champs (date, heure, prénom, nom, téléphone, e-mail facultatif), focus sur la première ; sinon le récapitulatif passe en « Tout est juste ? » avec « Confirmer » et un « Modifier » par ligne. Modifier un champ revient à la saisie.
- Confirmer : le créneau est revérifié, puis envoi (simulé par défaut), référence, champs bloqués, brouillon effacé, « Faire une autre réservation ».
- Adresse : `?date=2026-11-14&service=soir&heure=20:30&couverts=4&espace=salle&demande=Chaise%20haute` (depuis un bouton « Réserver ce soir » d'une autre section). `table=10` (envoyé par le module `plan-de-salle` avec `couverts` et `espace`) : gardé dans un champ caché `table`, montré avec l'installation (« En terrasse · table 10 »), envoyé avec la demande, effacé par « Faire une autre réservation ». Brouillon : `sessionStorage`, relu au chargement s'il n'y a pas de paramètres, revalidé (date passée retirée, heure reprise seulement si elle reste libre).
- Sans JavaScript : calendrier, liste d'heures, nombre de couverts, radios et champs ordinaires, envoyés à `action`. Mode calme : sans transition.

## Pièges

- Les heures se comptent à l'heure du lieu (`fuseau`), pas à celle du visiteur.
- Les radios des puces couvrent toute la puce (opacité nulle, pas 1 px) : la cible fait la taille de la puce, le clavier et les lecteurs d'écran voient des radios ordinaires.
- Le récapitulatif n'est collé que si l'écran fait au moins 760 px de haut ; en bas du formulaire il peut être repoussé : à la vérification et à l'envoi, la page le remonte en entier sous l'en-tête.
- Lire la demande **avant** de bloquer les champs : un champ désactivé ne figure plus dans le formulaire envoyé.
- Une simulation de complets ne doit jamais partir en ligne : `complets_simules` à `false` (ou brancher `complet`).

## Variantes

- Un seul service (crêperie du midi) : une seule puce de service, ou la retirer et ne garder que les créneaux.
- Bar à cocktails : services « 18 h – 20 h » et « 20 h – minuit », `couverts_max` à 6, espaces « Comptoir », « Salon ».
- Hôtel-restaurant : espace « Salle du petit déjeuner » en plus, demande « Chambre n° ».
