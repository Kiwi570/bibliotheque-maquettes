# Bac à feuilleter

Origine : madebymelody-maquette (v2) : le bac à pochettes de l'accueil (remplace une galerie horizontale générique).

## Usage

```html
<section class="baf" data-module="bac-a-feuilleter" data-epingle aria-labelledby="t">
  <div class="baf__grille socle-cadre">
    <div class="baf__tete"><h2 id="t">Dans le bac</h2><p>…</p>
      <p class="baf__compteur" aria-hidden="true"><b data-baf-num>01</b><span> / 08</span></p>
      <div class="baf__progres" aria-hidden="true"><span></span></div></div>
    <div class="baf__caisse" data-tient>
      <div class="baf__pile" tabindex="0" role="region" aria-label="Pochettes à feuilleter">
        <article class="baf__pochette" data-teinte="#7a1022">
          <div class="baf__cadre"><span class="baf__disque" aria-hidden="true"></span><div class="baf__visuel"><img …></div></div>
          <div class="baf__etiquette"><h3><a href="…"><span class="baf__num">01</span>Nom</a></h3><p>110 CHF · S</p></div>
        </article> …
      </div>
      <div class="baf__bois" aria-hidden="true"></div>
    </div>
  </div>
</section>
```

- Épinglée sur `(n - 1) × 0,45` écran. À chaque cran, la pochette de devant bascule vers soi autour de son bas et s'efface ; celles de derrière montent d'un rang ; son disque sort à moitié en tournant ; le fond prend `data-teinte` ; compteur et barre avancent ; la caisse tressaute.
- Le lien de chaque pochette couvre toute la pochette (l'étiquette n'est pas positionnée) ; seule celle de devant est cliquable.
- Au clavier, la pochette qui reçoit le focus passe devant.
- `init()` renvoie `{ aller(i), detruire }`.

## Réglages

`longueur` (0,45), `lissage` (9), `bascule` (64°), `profondeur` (4), `crans` (true). Taille de la pochette : `--s` sur `.baf__caisse`.

## Pièges

- Média dans `.baf__cadre` : en `position: absolute; inset: 0`. Un média qui porte sa propre proportion (aspect-ratio en ligne) dans une boîte `aspect-ratio: 1` l'agrandit (min-height auto) : pochettes déformées.
- `perspective-origin` au tiers haut (35 %) : avec l'origine en haut, la pochette qui bascule semble glisser vers le bas au lieu de basculer.
- La boucle de lissage ne tourne que pendant le mouvement (ajoutée puis retirée de `gsap.ticker`) : rien ne tourne au repos, ni en mode calme.
- Un `data-effet` posé sur la pile seule ne bouge pas (ce sont les pochettes qui bougent) : dans un projet de la skill, le poser sur `.baf__caisse`.
- Mode calme et sans JavaScript : rangée horizontale à faire défiler, étiquettes sous les pochettes, contenu complet.
- Une pochette entièrement effacée (basculée, ou trop loin derrière) est remise à plat, invisible : son lien garde sa vraie taille (contrôle des cibles de 44 px, mesuré en fin de page) et reste atteignable au clavier. Les liens des pochettes font au moins 44 px de haut (`inline-flex`, `min-height`).

## Variantes

- Bac de disques, casier de livres, présentoir de cartes postales, nuancier, boîte de recettes, classeur d'archives.
