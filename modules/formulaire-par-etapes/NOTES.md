# Formulaire par étapes

Origine (fusion) : `coupdefood-maquette/contact` (« Bon de commande », noté 5), `nexio-maquette/rendez-vous-section` (rendez-vous en quatre étapes avec récapitulatif) et `goodlife-maquette/reserver` (réservation en trois étapes, barres de progression).

- coupdefood apporte la structure en fieldsets, le choix du motif en tête, les erreurs `aria-invalid` liées aux champs et l'écran de réussite qui rappelle la demande ;
- nexio apporte le récapitulatif avant envoi, le focus déplacé sur le titre de l'étape et le marquage `aria-current="step"` ;
- goodlife apporte la barre de progression continue et l'annonce « Étape n sur N · nom ».

## Usage

```html
<section class="fpe" data-module="formulaire-par-etapes">
  <div class="fpe__carton">
    <form class="fpe__form" novalidate>
      <div class="fpe__progression">…</div>   <!-- facultatif : créé par le module s'il manque -->
      <fieldset class="fpe__etape" data-etape="Votre demande">
        <legend class="fpe__legende"><h3 class="fpe__titre">Question de l'étape</h3></legend>
        <div class="fpe__groupe fpe__cartes" data-libelle="Objet">
          <label class="fpe__carte"><input type="radio" name="objet" value="devis" required>…<span class="fpe__carte-titre">Un devis</span></label>
        </div>
      </fieldset>
      <fieldset class="fpe__etape" data-etape="Coordonnées">…champs .fpe__champ…</fieldset>
      <fieldset class="fpe__etape" data-etape="Récapitulatif" data-recap><legend…><div class="fpe__recap"></div></fieldset>
      <div class="fpe__nav"><button type="button" data-precedent>Retour</button><button type="button" data-suivant>Continuer</button><button type="submit">Envoyer</button></div>
    </form>
    <div class="fpe__fin" hidden><h3>Merci</h3><p data-resume></p><a data-mailto hidden>Envoyer par e-mail</a><button type="button" data-recommencer>Nouvelle demande</button></div>
  </div>
</section>
<script type="module">
  import { init } from './modules/formulaire-par-etapes/module.js';
  init(document.querySelector('.fpe'), { mailto: 'contact@exemple.fr' });
  document.addEventListener('formulaire:envoye', e => console.log(e.detail.valeurs, e.detail.texte));
</script>
```

Chaque `fieldset[data-etape]` est une étape (le nom affiché dans la progression est la valeur de l'attribut). Trois formes de choix, où l'input couvre tout le libellé (cible tactile entière) : `.fpe__carte` (grandes cartes), `.fpe__puce` (pastilles), `.fpe__case` (case seule, accord). Un groupe de cases à cocher porte `data-min="1"` pour exiger au moins un choix. La validation est celle du HTML (`required`, `type`, `minlength`, `pattern`), avec des messages en français ; `data-message` sur un champ remplace son message.

À l'envoi, aucune requête : `root` émet `formulaire:envoye` (bubbles) avec `detail = { valeurs, resume, texte }` — `valeurs` par `name`, `resume` par étape (libellés lisibles), `texte` prêt pour un e-mail. `init()` renvoie `{ aller(n), donnees(), recommencer(), detruire() }`.

## Réglages

- `animation` (true) et `decalage` (32 px) : glissement d'entrée de l'étape, coupé en mode calme et sous « réduire les animations ».
- `defilement` (true) : si le haut du formulaire est sorti de l'écran (étape longue sur téléphone), il est ramené sous l'en-tête mesuré.
- `mailto` ('') et `sujet` : lien de repli « Envoyer par e-mail » prérempli avec le récapitulatif (corps limité à 1 800 caractères).
- `messages` : remplace tout ou partie des textes (`obligatoire`, `choix`, `plusieurs`, `case`, `email`, `tel`, `url`, `court`, `format`, `erreurs`, `etape`, `vide`).
- Attributs : `data-libelle` (nom dans le récapitulatif, sur un champ ou un groupe), `data-hors-recap` (champ exclu du récapitulatif, ex. l'accord), `data-retour` sur le bouton Continuer (texte quand on revient d'un « Modifier »).
- `--couleur-erreur` (facultative) colore les erreurs ; à défaut, la couleur secondaire.

## Pièges

- Le focus va au titre de l'étape (`tabindex="-1"`), jamais au premier champ : le lecteur d'écran lit la question avant les champs. Erreur : le focus va au premier champ fautif, le nombre d'erreurs est annoncé (`aria-live`), chaque message est relié par `aria-describedby`.
- Entrée dans un champ passe à l'étape suivante (après validation), jamais à l'envoi prématuré.
- Pas de `autoAlpha` dans les glissements : un élément en `visibility: hidden` ne peut pas recevoir le focus.
- « Modifier » dans le récapitulatif ramène à l'étape, puis Continuer revient directement au récapitulatif.
- Sans JavaScript (`@media (scripting: none)`), toutes les étapes sont visibles et le formulaire reste un formulaire HTML ordinaire : prévoir un `action` réel ou un `mailto:` sur le site en ligne. Avec JavaScript, les étapes 2+ sont masquées dès le premier affichage (pas de décalage de mise en page).
- Toujours dire que l'envoi est simulé tant qu'aucun traitement réel n'est branché.
- Champs à 16 px minimum (sinon zoom automatique sur iOS).

## Variantes

- Laissés de côté (identité) : le papier « bon de commande » à ombre portée et le pliage 3D à l'envoi avec tampon « ENVOYÉ » (coupdefood), les jours et créneaux calculés depuis les horaires du client et le cadran animé (nexio), le panneau latéral modal, le ticket imprimé et les bips sonores (goodlife).
- Créneaux de rendez-vous : une étape avec des boutons `aria-pressed` qui remplissent un `<input type="hidden" required>` reprend la mécanique de nexio (les horaires doivent venir du client).
- Panneau latéral : placer le `.fpe` dans un `<dialog>` natif, rendre le focus au bouton d'ouverture à la fermeture (piège noté sur goodlife).
- Pièce jointe : un `<input type="file">` est lu par le récapitulatif (noms de fichiers), mais rien n'est envoyé.
