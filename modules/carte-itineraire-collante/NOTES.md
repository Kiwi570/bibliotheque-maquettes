# Carte d'itinéraire collante

Origine : `instinct-aventure-maquette/grande-aventure-jours` (programme jour par jour des fiches circuits).

## Usage

```html
<section class="cic" data-module="carte-itineraire-collante" data-epingle>
  <div class="cic__tete socle-cadre">…surtitre, h2.cic__titre, p.cic__intro…</div>
  <div class="cic__corps socle-cadre">
    <ol class="cic__etapes">
      <li class="cic__etape" id="etape-1" data-x="14" data-y="74">  <!-- position du repère en % du plan -->
        <p class="cic__n"><b>01</b><span>Étape</span></p>
        <div class="cic__texte"><h3>…</h3><p>…</p><span class="cic__visuel"><img …></span></div>
      </li>
    </ol>
    <div class="cic__carte" data-tient>
      <div class="cic__plan">
        <svg class="cic__svg" viewBox="0 0 100 75">…fond de carte (illustration, plan, schéma)…</svg>
        <p class="cic__compteur">Étape <b data-cic-n>1</b> / <span data-cic-total>6</span></p>
        <p class="cic__legende" data-tient>Carte illustrative, positions approximatives</p>
      </div>
    </div>
  </div>
  <p class="cic__barre" data-barre hidden><span>Étape <b data-cic-n>1</b> / <span data-cic-total>6</span></span><span class="cic__barre-titre" data-cic-titre></span></p>
</section>
```

Le module construit le tracé (courbe de Catmull-Rom qui passe par les repères), sa trace fantôme en pointillés et les repères (boutons de 44 px, « Aller à l'étape n : titre »).

## Réglages

- `lecture` ('62%') : une étape devient active quand elle traverse cette ligne de l'écran.
- `duree` (1,2 s), `tension` (0,5 ; 0 = segments droits, pour un plan de chantier ou un procédé).
- `largeurMin` (900) : en dessous, la carte passe en haut, dans le flux, et la barre « Étape n / total » se fixe en bas pendant la lecture de la liste.

## Pièges

- La carte collante est bornée par la hauteur visible : sa largeur vaut `min(100 %, (écran − --entete-h − --barres-h − 2 marges) × 4/3)`, la légende est posée dans le plan : elle n'est jamais coupée (défaut corrigé sur l'origine en 1280×720).
- Changer l'`aspect-ratio` du plan impose de changer le `viewBox` (100 × 75) et le facteur 4/3 du CSS ensemble.
- Les longueurs du tracé sont calculées dans le repère du viewBox, au chargement et à chaque `refresh`, jamais pendant le défilement.
- La barre du téléphone est déclarée `[data-barre]` : le socle la compte dans `--barres-h` quand elle est visible, et la liste reçoit ce `padding-bottom`.
- Rien ne doit se poser sur la barre (l'origine avait un tampon de région qui la chevauchait à 390 px).
- Mode calme : tracé complet, tous les repères et toutes les étapes allumés dès l'arrivée.

## Variantes

- `instinct-aventure-maquette/piste` (accueil) : même carte, mais section épinglée en deux colonnes, grand numéro de jour qui change et tracé lié directement à la molette (scrub) ; à préférer pour un parcours court (5 à 8 étapes) présenté d'un bloc.
- L'origine ajoute un véhicule qui suit la trace, un zoom de la carte sur l'étape, des compteurs (kilomètres, nuitée) et l'animal de la région : options d'identité, laissées de côté.
