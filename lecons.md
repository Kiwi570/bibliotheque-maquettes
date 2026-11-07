# Leçons des projets

Lu par la skill maquette-premium-client au début de chaque projet, avant de proposer les directions.

- Une leçon générale par ligne, jamais un défaut propre à un client : `- AAAA-MM-JJ · projet · problème : … · cause : … · règle : …`
- Elle s'ajoute en fin de projet, une fois validée par l'utilisateur. Claude la propose d'après le journal du projet (`journaux/`) et son rapport d'audit.
- Une leçon qui revient sur un deuxième projet devient une règle de la skill (partie « Pièges déjà rencontrés ») et sort de ce fichier.
- Une leçon propre à un module va dans son `NOTES.md`, pas ici.

## Leçons

- 2026-11-05 · alexandra-grandry · problème : le fil conducteur passait par-dessus le texte d'une section · cause : la section créait son propre contexte d'empilement (isolation, transform, opacity sous 1, fond en z-index négatif) · règle : quand un décor traverse la page (fil, particules, curseur), vérifier chaque section qui crée un contexte d'empilement, puis retirer ce contexte ou y redonner un z-index au contenu.
- 2026-11-05 · socle de la skill v10.2 · problème : changement brusque signalé par l'audit pendant le voile en iris · cause : le rayon du disque suivait la courbe d'accélération, donc l'aire couverte sautait de près de la moitié de l'écran d'une image à l'autre · règle : pour une forme qui grandit ou s'ouvre (disque, trou, tampon), c'est l'aire qui suit la courbe, et le rayon en est la racine carrée.
- 2026-11-06 · ajout de 28 maquettes à la bibliothèque · problème : 14 maquettes sur 28 sans rapport d'audit, notées sans lui · cause : le dossier _audit/rapport/ n'était pas poussé avec la maquette · règle : à chaque livraison, garder et pousser _audit/rapport/rapport.md avec la version livrée, sinon la bibliothèque ne peut pas reprendre l'audit.
- 2026-11-06 · lydiacourtois · problème : décalage au chargement (CLS 0,22) sur téléphone · cause : une animation d'arrivée changeait le texte d'un cartouche dont la taille suivait son contenu · règle : un texte qui change sans action du visiteur (cartouche, compteur, mot qui défile) a une boîte de taille fixe dès le premier affichage, sinon l'animation est réservée aux grands écrans.
