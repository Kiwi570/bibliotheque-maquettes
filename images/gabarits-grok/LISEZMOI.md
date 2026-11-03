# Gabarits de consignes Grok

Un fichier par activité de `taxonomie.json` (nom sans accent), plus `commun.json`.

- **D'où ils viennent** : les 84 documents `~/Downloads/*images-grok*.docx` (version la plus récente quand il y en a plusieurs), 9 documents Grok complémentaires des maquettes notées, les README des maquettes, les sections notées 4 ou 5 de `sections/` dont l'image est générée, les rapports d'audit et `images-grok-12-maquettes/integration.md` (images régénérées), les règles « Grok : » de la skill. Chaque champ `source` dit de quelle maquette vient la formulation.
- **commun.json** : interdits toujours ajoutés, formats, zones de texte, pièges constatés (mains, mécanismes, échafaudages, visages, texte, écrans, véhicules, paysage qui dérive…) avec la formule anglaise qui les évite.
- **Fichier d'activité** : `style` (style commun à variables), `interdits` propres au secteur, `evite`, et 7 rôles (`ouverture`, `section-fond`, `scene-metier`, `lieu`, `texture`, `portrait-generique`, `404`), chacun avec sa consigne, sa source et ce qu'il évite.
- **Variables** : `{ambiance}` `{palette}` `{lumiere}` `{matieres}` `{saison}` `{lieu}` `{sujet}` ; leur forme attendue est décrite dans `commun.json` → `variables`. Jamais de nom de client ni de lieu réel dans une consigne.
- **Assemblage d'une consigne** : rôle + format + zone de texte (si titre) + style + interdits de l'activité + `interdits_toujours`, en un seul paragraphe anglais.

## Ajouter ou corriger un gabarit

1. Partir des consignes qui ont réellement donné de bonnes images (section notée 4 ou 5, image validée à l'audit) ; noter la maquette dans `source`.
2. Garder les 7 rôles et seulement les 7 variables ; relire la consigne une fois les variables remplies.
3. Le portrait générique reste sans visage ; sortir les mains du cadre si l'activité les rate.
4. Ajouter tout nouvel échec constaté à `commun.json` → `pieges` (sujet, constat avec la maquette, parade en anglais).
5. Valider : `node -e 'JSON.parse(require("fs").readFileSync("fichier.json"))'`.
