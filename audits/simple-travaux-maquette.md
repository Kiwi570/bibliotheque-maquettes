# simple-travaux-maquette

<https://simple-travaux-maquette.vercel.app> · audit du 12/11/2026 · dernier commit 481292e du 29/10/2026

> Audit d'entrée en bibliothèque : inventaire de la bibliothèque (6 pages, captures 1440 et 390, aucune erreur de console) et lecture des captures ; maquette v3 antérieure au script d'audit de la skill. Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Direction « Le Réseau » pour un plombier de l'Oise : plan de plomberie vivant sur papier calque, canalisation de cuivre qui longe la page et où l'eau circule au défilement, maison en coupe avec ses prix. Très utile et propre au métier (100 tarifs réels, collecteur de vannes, estimateur), un peu dense en petits textes.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Maison en coupe et canalisation de cuivre propres au métier ; ouverture plus utile que spectaculaire. |
| 2. Direction artistique et harmonie | 13/15 | Papier calque, bleu de plan, cuivre, eau froide et chaude, Archivo élargie : cohérent ; images d'intérieurs génériques. |
| 3. Animations et effets | 12/15 | Réseaux qui se tracent, eau au défilement, compteur à rouleaux, vannes, compas, vidange entre les pages, ondes WebGL. |
| 4. Expérience ludique et interactions | 9/10 | Collecteur de vannes et manomètre, diagnostic par symptôme, catalogue filtrable relié à l'estimateur, créneaux de rendez-vous. |
| 5. Tous les formats | 13/15 | Captures 1440 et 390 propres, rampe en colonne montante sur téléphone. |
| 6. Contenu et fiabilité | 9/10 | 100 tarifs TTC réels du site actuel ; photo de Pedro et mentions à fournir. |
| 7. Technique et performance | 9/10 | Aucune erreur, 4,1 Mo d'images, GSAP, Lenis et OGL hébergés. |
| 8. Mise en ligne | 5/5 | noindex, version des fichiers, images de partage par page, 404 aux couleurs. |
| 9. Accessibilité | 4/5 | Aucun texte sous 12 px, flèches au clavier sur les vannes ; petits textes mono gris nombreux. |
| **Total** | **86/100** | |

## Points forts

- La canalisation de cuivre où l'eau circule au défilement.
- La maison en coupe avec les vrais prix sur chaque poste.
- Le collecteur de vannes et son manomètre.
- Le compteur d'eau à rouleaux pour les prix.

## Défauts

### Bloquants

Aucun.

### Importants

1. **Portrait** : encart « photo à fournir » à la place de Pedro. Effort : petit.
2. **Densité** : beaucoup de petites étiquettes mono grises sur le papier : en garder moins, plus grandes. Effort : moyen.

### Finition

1. **Mode calme** : bouton à retirer de l'en-tête (la skill n'en a plus). Effort : petit.
2. **Safari** : épinglages et WebGL à contrôler sous WebKit. Effort : petit.
