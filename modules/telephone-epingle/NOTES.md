# Téléphone épinglé

Origine :
- `observatoire-des-cse-maquette/participer` (« Téléphone épinglé du parcours », noté 5) : la mécanique entière. Section épinglée, étapes à gauche, téléphone à droite dont l'écran rejoue le parcours au scrub (adresse tapée lettre à lettre, case cochée, notification, cadeaux qui arrivent), étape en cours allumée, section en hauteur d'écran quand elle est épinglée.
- `warmline-app-maquette/scene-texte` (noté 4) : le téléphone dessiné en CSS (coque, encoche, barre d'accueil, notification qui descend de l'en-tête de l'écran).
- Vu et laissé de côté : `nexio-maquette/haut` et `nexio-maquette/estimation-section` (téléphone 3D three.js, fissures) : autre mécanique, trop lourde pour ce rôle.

## Usage

```html
<section class="tep" data-module="telephone-epingle" data-epingle data-cote="droite" aria-labelledby="tep-titre">
  <div class="tep__cadre socle-cadre">
    <div class="tep__tete" data-tient="tête">…surtitre, h2.tep__titre, p.tep__intro, p.tep__action (bouton)…</div>
    <ol class="tep__etapes" data-tient="étapes">
      <li class="tep__etape">
        <span class="tep__n">01</span>
        <div class="tep__texte"><h3 class="tep__t">…</h3><p class="tep__d">…</p></div>
        <div class="tep__mini" aria-hidden="true"><div class="tep__appareil"><div class="tep__ecran">
          <div class="tep__vue">…écran HTML de l'étape…</div>
        </div></div></div>
      </li>
    </ol>
    <p class="socle-sr">Illustration : un téléphone montre l'écran correspondant à chaque étape du parcours.</p>
  </div>
</section>
```

Chaque étape porte son propre écran : c'est l'état sans JavaScript, en mode calme, sur téléphone et en tablette portrait (un téléphone réduit à côté du texte, ou dessous en dessous de 480 px). En mode épinglé, le module crée un seul téléphone (`.tep__telephone`, `data-tient`), y déplace les écrans et les remet à leur place quand on repasse sous les seuils.

Le module transforme les numéros en boutons de 44 px (« Aller à l'étape n : titre », `aria-current="step"` sur l'étape en cours) : épinglé, le bouton amène au moment de l'étape dans l'épinglage ; dans le flux, à l'étape.

Actions rejouées dans un écran (attributs sur les éléments de `.tep__vue`) :
- `data-tep-tape` : texte tapé lettre à lettre (le texte complet reste dans le HTML) ;
- `data-tep-pop` : apparition en séquence ; `="coche"` : case ou pastille qui s'ouvre ; `="notif"` : notification qui descend ; `="appui"` : bouton pressé ;
- `data-tep-jauge` : barre qui se remplit ; `data-tep-choisi` : option qui s'allume (`--tep-choix` de 0 à 1).

Classes d'écran neutres fournies : `tep-marque`, `tep-titre`, `tep-texte`, `tep-libelle`, `tep-champ`, `tep-case`/`tep-boite`, `tep-bouton`, `tep-notif`, `tep-ligne`/`tep-pastille`/`tep-ok`, `tep-jauge`, `tep-choix`, `tep-rond`, `tep-tuiles`. Leurs tailles sont en `em` et l'`em` suit la largeur de l'écran (`100cqw / 20.5`) : un même écran se lit pareil dans le téléphone épinglé et dans le téléphone réduit.

## Réglages

- `cote` ('droite', ou `data-cote`) : 'gauche' inverse les colonnes ; 'centre' pose le téléphone entre la tête (à gauche) et les étapes (à droite).
- `transition` ('glissement') : 'fondu' pour un fondu enchaîné avec léger zoom.
- `parEtape` (0,8 écran), `lissage` (scrub 0,6).
- `largeurMin` (900) et `hauteurMin` (500) : sous l'un ou l'autre, un écran par étape dans le flux ; chaque écran rejoue alors ses actions une fois, à son entrée dans l'écran.
- Couleurs de l'écran dérivées des variables du socle, surchargeables sur `.tep` : `--tep-coque`, `--tep-papier`, `--tep-encre`, `--tep-carte`, `--tep-trait`.

## Pièges

- Épinglée, la section vaut exactement `--ecran-h − --entete-h − --barres-h` et l'épinglage commence sous l'en-tête mesuré ; la hauteur du téléphone est calculée sur cette même hauteur (`--tep-tel-h`, 680 px au plus), jamais estimée (l'origine coupait le bouton à 1024×640).
- Seule la description de l'étape en cours est déployée pendant l'épinglage, l'intro disparaît sous 700 px de haut : c'est ce qui fait tenir tête et étapes en 1000×560.
- Le téléphone est `aria-hidden` (ses textes sont décoratifs et peuvent descendre sous 12 px dans le téléphone réduit) : l'équivalent est le texte des étapes et la phrase `.socle-sr`.
- Les écrans sont déplacés dans le DOM au passage des seuils (gsap.matchMedia) : ne pas y mettre d'identifiants ciblés ailleurs ni d'écouteurs posés avant `init`.
- Mode calme : pas d'épinglage, chaque étape montre son écran complet (texte tapé, cases cochées, options choisies), rien ne bouge.

## Variantes

- L'origine (observatoire) avait une photo de foule en fond de section, le logo et les logos des partenaires dans l'écran, une palette nuit et corail : identité, laissée de côté.
- La durée d'épinglage plus courte sur téléphone de l'origine n'a plus d'objet : sous 900 px, le module n'épingle pas.
- Warmline fait tourner une vraie appli dans le téléphone (onglets, synchronisation entre onglets) : pour un simulateur cliquable, partir de cette maquette, pas de ce module.
- `carte-itineraire-collante` : même rôle avec une carte au lieu d'un téléphone et sans épinglage (élément collant).
