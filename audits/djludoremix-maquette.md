# djludoremix-maquette

<https://djludoremix-maquette.vercel.app> · audit du 16/11/2026 · dernier commit 05b076f du 16/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (standard puis passe des formats, v2, 0 échec), regard du directeur artistique (6 regards sur l'accueil, AJUSTER 4,00), deux regards neufs, deux tests « vrai visiteur » et lecture des captures. Pas d'audit externe : la note est à confirmer.

## Verdict

**84/100 · À peaufiner · 0 défaut bloquant**

Direction « Plein feux » pour un DJ du Gard : site noir, brouillard, lyres et lasers autour des vraies photos de Ludo. L'accueil est une seule grande scène : une poursuite qu'on promène sur la photo et un pupitre de cinq faders qui allume la salle et donne le vrai prix. Chaque page d'onglet a son ouverture et son jeu (VU-mètre, lettres géantes, numéro au laser, boule à facettes en 3D).

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Accueil fort : la poursuite sur la photo et le pupitre qui change la salle sont lisibles dès la première seconde. Les pages d'onglet ont chacune leur ouverture depuis la v2. Le titre en deux lignes, gras puis néon, se répète d'une page à l'autre. |
| 2. Direction artistique et harmonie | 13/15 | Palette noir fumée, rose laser, bleu et violet UV tenue partout ; Big Shoulders et Figtree. Les images Grok de la v2 (place de village, salle des fêtes) sont à l'échelle du métier. |
| 3. Animations et effets | 13/15 | Titres tracés au laser, coupes au stroboscope, VU-mètre vivant, lettres qui s'ouvrent, frise sous une lyre, boule 3D dessinée facette par facette. Le livre d'or en pile reste sage. |
| 4. Expérience ludique et interactions | 9/10 | Pupitre de faders sur l'accueil et sur Formules, poursuite au pointeur ou au doigt, colonnes de prix cliquables, affiche de la soirée qui se compose pendant la demande de devis. |
| 5. Tous les formats | 13/15 | 0 échec à l'audit standard et à la passe des formats, sans JavaScript et sans WebGL compris. Safari non vérifié ici. |
| 6. Contenu et fiabilité | 8/10 | Vrais prix, vrais horaires, citations du livre d'or reprises mot pour mot, signatures des photographes recadrées. E-mail, mentions légales et politique de confidentialité à fournir par le client. |
| 7. Technique et performance | 8/10 | Générateur statique, images WebP en variantes. Fluidité à regarder sur Formules (8 % d'images lentes sur processeur ralenti). |
| 8. Mise en ligne | 4/5 | GitHub et Vercel reliés, adresse courte. La protection Vercel était encore active au premier déploiement. |
| 9. Accessibilité | 4/5 | Contrastes et zones tactiles contrôlés, réduction des mouvements respectée, faders utilisables au clavier. |
| **Total** | **84/100** | |

## Points forts

- La scène unique de l'accueil : une photo à la fois, la poursuite et le pupitre qui donne le prix réel.
- Une ouverture différente par page, tirée du métier : VU-mètre, lettres LUDO, numéro au laser, boule à facettes.
- L'affiche de la soirée qui se remplit pendant la demande de devis, puis se fait tamponner.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Safari** : Mélange de la photo avec les lettres de Ludo, frise horizontale et pupitre épinglé à vérifier sur iPhone. Effort : 15 min.
2. **Formules** : Les cinq cartes du tableau doublent encore les prix du VU-mètre et du pupitre. Effort : 20 min.

### Finition

1. **Titres** : Le même titre en deux lignes, gras puis néon, ouvre chaque page. Effort : à voir.
2. **Livre d'or de Ludo** : La pile de cartes reste sage à côté du reste. Effort : 20 min.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 0 à regarder, 0 non lancé(s) |
| Audit standard v2 | 0 échec |
| Passe des formats v2 | 0 échec |
| Regard du directeur artistique (accueil) | AJUSTER 4,00 au 6e regard |
