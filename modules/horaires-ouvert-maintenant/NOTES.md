# Horaires « ouvert maintenant »

Origine : `pizzalyght-maquette/cayenne-titre-horaires` (4) : cadran 24 h en SVG, minuit en haut, créneaux d'ouverture tracés, aiguille qui rejoint l'heure locale à l'entrée, liste midi et soir et statut du moment à côté. Ses deux pièges sont gardés : **l'heure du lieu et non celle du visiteur**, et l'avertissement tant que les fermetures exceptionnelles ne sont pas connues (ici, elles sont dans le JSON). Famille « restaurant : informer, rassurer, faire réserver ».

Rendu générique : tout vient d'**un fichier JSON** (modèle : `exemple-horaires.json`) ; fuseau IANA (heure d'été comprise, au lieu d'un décalage fixe) ; semaine type par jour ; créneaux qui passent minuit ; statut **ouvert / ferme bientôt / fermé** avec la prochaine ouverture (« ouvre dans 20 min », « ouvre demain à 12 h », « ouvre mardi à 12 h », « rouvre le mardi 19 janvier à 12 h ») ; fermetures et horaires exceptionnels ; jours fériés ; plusieurs adresses, chacune avec son fuseau. Plus de GSAP : l'aiguille tourne en CSS. Laissé de côté (identité) : la braise, les couleurs et l'heure de Guyane codée en dur.

## Usage

```html
<section class="horaires socle-cadre" data-module="horaires-ouvert-maintenant" aria-labelledby="horaires-titre">
  <div class="horaires__grille">
    <div class="horaires__cadran" aria-hidden="true"></div>
    <div class="horaires__texte">
      <p class="socle-surtitre">Horaires</p><h2 id="horaires-titre">…</h2>
      <div class="horaires__adresses" data-horaires-choix role="group" aria-label="Choisir une adresse" hidden></div>
      <p class="horaires__statut" data-horaires-statut hidden></p>
<!-- horaires:debut -->
<!-- horaires:fin -->
    </div>
  </div>
</section>
<script type="module">
  import { init } from './modules/horaires-ouvert-maintenant/module.js';
  const api = await init(document.querySelector('[data-module="horaires-ouvert-maintenant"]'));
</script>
```

Écrire les horaires dans la page (à chaque changement) : `node modules/horaires-ouvert-maintenant/generer-horaires.mjs horaires.json --dans index.html`. Entre les marqueurs : le JSON (`<script type="application/json" data-horaires>`, lu par le module) et la semaine type de chaque adresse en texte (sans JavaScript).

## Le fichier des horaires

```json
{ "fuseau": "Europe/Paris", "seuil_ferme_bientot": 30, "regle_feries": "ouvert",
  "feries": [ { "date": "2026-12-25", "nom": "Noël" } ],
  "adresses": [ { "id": "restaurant", "nom": "Le restaurant", "adresse": "…", "telephone": "…",
      "semaine": { "lundi": [], "mardi": ["12:00-14:00", "19:00-22:30"], "samedi": ["12:00-14:30", "19:00-00:30"], … },
      "exceptions": [ { "date": "2026-12-24", "creneaux": ["19:00-01:00"], "motif": "Réveillon" },
                      { "du": "2027-01-04", "au": "2027-01-18", "creneaux": [], "motif": "Congés d'hiver" } ] },
    { "id": "montreal", "nom": "…", "fuseau": "America/Toronto", "libelle_heure": "Heure de Montréal", "feries": [ … ], "regle_feries": "ferme", "semaine": { … } } ] }
```

- Créneaux `HH:MM-HH:MM` ; une fin plus tôt que le début passe minuit (`19:00-00:30`) ; des créneaux qui se touchent sont fusionnés.
- Priorité pour un jour : **exception** (`date`, ou `du`/`au`, `creneaux: []` pour fermé, `motif`) > **férié** (`regle_feries` : `"ferme"`, `"ouvert"` = semaine type, ou une liste de créneaux) > **semaine type**.
- `feries` : au niveau du fichier, ou propre à une adresse (pays différent). `fuseau` et `libelle_heure` : par défaut ceux du fichier (« Heure de Paris »).
- « À noter » : les exceptions et fériés qui changent les horaires dans les 45 jours.

## Comportement

- Statut à l'heure du lieu, relu chaque minute (à la minute pile) et au retour sur l'onglet : ouvert jusqu'à…, ferme bientôt (30 min ou moins, `seuil_ferme_bientot`), fermé et prochaine ouverture, motif du jour (« Aujourd'hui : Noël »).
- Cadran : les créneaux du jour (et la fin d'une nuit commencée la veille), l'heure au centre, l'aiguille part de minuit et rejoint l'heure quand le cadran arrive à l'écran, puis avance d'elle-même. Couleur de la pointe selon le statut.
- Plusieurs adresses : boutons avec pastille de statut (vert, orangé, gris) et statut court lu par les lecteurs d'écran ; `?adresse=montreal` ou `data-adresse` choisit l'adresse affichée d'abord.
- Mode calme, « réduire les animations » : le cadran n'est pas dessiné ; le statut et les horaires en texte. Sans JavaScript : la semaine type de chaque adresse.
- `init(el, { heure: '2026-12-25T10:05' })` fixe l'heure du lieu pour essayer un autre moment (la démonstration lit `?heure=`). `init()` renvoie `{ adresse(id), detruire() }`.

## Pièges

- Toujours un **fuseau IANA** (`Europe/Paris`, `America/Cayenne`, `Indian/Reunion`), jamais un décalage fixe : l'heure d'été change le décalage deux fois par an.
- Le statut n'est pas une zone annoncée à chaque minute (pas de `role="status"`) : un compte à rebours « ouvre dans 12 min » ne doit pas parler toutes les minutes.
- Tenir les exceptions à jour (congés, fêtes) : sans elles, « ouvert » peut mentir. Tant qu'elles ne sont pas connues, ajouter sous la semaine « horaires indicatifs ».
- Le JSON est échappé à l'écriture (`</` dans un motif ne ferme pas la balise `<script>`).

## Variantes

- Boulangerie : journée continue (`["06:30-19:30"]`), dimanche matin seul, `seuil_ferme_bientot` à 15.
- Bar : créneaux qui passent minuit tous les soirs (`"18:00-02:00"`).
- Restaurant d'hôtel : plusieurs services (petit déjeuner, déjeuner, dîner) comme autant de créneaux ; plusieurs « adresses » pour le restaurant, le bar, le spa.
