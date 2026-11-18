# matchyourtrip-maquette

<https://matchyourtrip-maquette.vercel.app> · audit du 18/11/2026 · dernier commit 3b5879a du 17/11/2026

> Audit d'entrée en bibliothèque : script d'audit de la skill (complet sur 13 formats en v2 : 9 échecs au premier passage, 0 après trois relances ciblées), inventaire de la bibliothèque et lecture des captures Pas d'audit externe : la note est à confirmer.

## Verdict

**86/100 · Prête à envoyer · 0 défaut bloquant**

Carnet de voyage en papier déchiré, crème, prune et rose : couches de papier en profondeur à l'ouverture, avion en papier qui relie le rêve au voyage, outil de match envie × destination, catalogue filtrable et formulaire en trois étapes avec billet. Tout le site tient dans le même collage, avec une petite animation propre à chaque section. La v2 ajoute la scène des 14 onglets, le ciel de papier du don et le tampon du billet.

## Notes

| Critère | Note | Justification |
|---|---|---|
| 1. Effet « waouh » et niveau premium | 12/15 | Ouverture en couches de papier déchiré qui s'écartent sur la silhouette, titre « match » géant souligné à la main, avion en papier du rêve ; un bel univers, mais pas de grand moment spectaculaire. |
| 2. Direction artistique et harmonie | 14/15 | Palette tenue partout (crème, prune, rose, abricot), Fraunces, Figtree et Caveat, bords déchirés, scotch et tampons : les pages intérieures sont au niveau de l'accueil. |
| 3. Animations et effets | 12/15 | Une animation propre par section (couches, tracé, onglets qui se ferment, montgolfière qui monte, tampons, mots collés), entrées jouées une fois ; pas de WebGL ni de scène épinglée forte. |
| 4. Expérience ludique et interactions | 9/10 | Match envie × destination qui préremplit le formulaire, catalogue avec familles, recherche et adresse partageable, don avec montant et montgolfière, formulaire en trois étapes et billet qui se remplit. |
| 5. Tous les formats | 13/15 | Audit complet sur 13 formats à 0 échec, écrans bas réglés (1000×560, 844×390) ; Safari à vérifier sur le Mac. |
| 6. Contenu et fiabilité | 8/10 | Textes repris du site du client, rien d'inventé ; formulaires et dons simulés et signalés, illustrations Grok mentionnées ; mentions légales à fournir par le client. |
| 7. Technique et performance | 9/10 | Ouverture à 2,9 s depuis le premier octet, aperçus flous sous les images d'ouverture, aucune erreur console, fluidité et mouvement validés. |
| 8. Mise en ligne | 5/5 | En ligne sur Vercel, dépôt Git relié, protection retirée, sans X-Frame-Options (intégrable dans Wix). |
| 9. Accessibilité | 4/5 | axe sans erreur, focus visibles, radios stylés visibles, décor aria-hidden, contrastes vérifiés. |
| **Total** | **86/100** | |

## Points forts

- Un seul univers de papier déchiré tenu sur toutes les pages, de l'intro au pied de page
- L'outil de match envie × destination, au cœur de l'accueil, mène au formulaire prérempli
- Scène des 14 onglets qui se ferment jusqu'au carnet de voyage : la charge mentale racontée sans texte
- Formulaire en trois étapes avec un billet qui se remplit et reçoit un tampon « Prêt au départ »

## Défauts

### Bloquants

Aucun.

### Importants

1. **Mentions légales** : Mentions légales et politique de confidentialité à fournir par le client avant la mise en ligne finale. Effort : faible.

### Finition

1. **Grand moment** : Pas de scène épinglée forte ni d'effet spectaculaire : un site doux et vivant plutôt qu'un choc visuel. Effort : moyen.
2. **Safari** : Vérification Safari à faire sur le Mac (WebKit indisponible dans l'audit). Effort : faible.

## Mesures clés

| Mesure | Valeur |
|---|---|
| Script d'audit de la skill | complet : 0 échec(s), 0 à regarder, 0 non lancé(s) |
| Ouverture (1366×768) | 2,9 s depuis le premier octet |
| Audit complet v2 | 9 échecs au premier passage, 0 après 3 relances ciblées |
