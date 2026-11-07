// Copie les outils de la bibliothèque dans la skill (dossier bibliotheque/ de la skill), à chaque mise à jour de la skill.
// Pourquoi : une session de projet peut refuser de lancer du code téléchargé depuis GitHub (Red-Act et QD2A, 7 novembre 2026 :
// recherche, document Grok, assemblage et test des modules bloqués, modules réécrits à la main). Le code livré avec la skill,
// lui, tourne ; le clone de la bibliothèque ne sert plus que de données (fiches, modules, médias, gabarits).
// node outils/vers-skill.mjs <dossier de la skill>     (ex. ~/skills/maquette-premium-client)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { RACINE } from './commun.mjs';

const skill = process.argv[2];
if (!skill || !fs.existsSync(path.join(skill, 'SKILL.md'))) { console.error('usage : node outils/vers-skill.mjs <dossier de la skill (celui qui contient SKILL.md)>'); process.exit(1); }
const dest = path.join(skill, 'bibliotheque');
fs.rmSync(dest, { recursive: true, force: true });
let n = 0;
const copier = (dos, filtre) => {
  fs.mkdirSync(path.join(dest, dos), { recursive: true });
  for (const f of fs.readdirSync(path.join(RACINE, dos)).filter(filtre).sort()) { fs.copyFileSync(path.join(RACINE, dos, f), path.join(dest, dos, f)); n++; }
};
copier('outils', (f) => /\.(mjs|py|sh)$/.test(f) && f !== 'vers-skill.mjs');
copier('images', (f) => /\.(mjs|swift)$/.test(f));
let commit = '';
try { commit = execFileSync('git', ['-C', RACINE, 'log', '-1', '--format=%h %ad', '--date=short'], { encoding: 'utf8' }).trim(); } catch {}
fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify({ name: 'outils-bibliotheque-maquettes', private: true, type: 'module', dependencies: { sharp: '^0.34.5' } }, null, 1) + '\n');
fs.writeFileSync(path.join(dest, 'README.md'), `# Outils de la bibliothèque des maquettes, livrés avec la skill

Copie des dossiers \`outils/\` et \`images/\` (scripts seulement) du dépôt Kiwi570/bibliotheque-maquettes${commit ? `, commit ${commit}` : ''}, faite par \`node outils/vers-skill.mjs\` du dépôt. Ne pas les modifier ici : les modifier dans le dépôt, puis recopier à la mise à jour suivante de la skill.

Pourquoi : une session de projet peut refuser de lancer du code téléchargé (le clone de la bibliothèque). Ces copies font partie de la skill et tournent ; le clone ne sert que de données.

Dans un projet : \`cp -r <skill>/bibliotheque _biblio\`, puis \`(cd _biblio && npm install --no-audit --no-fund)\` si sharp manque (Playwright est déjà là, ne pas le réinstaller). Les commandes trouvent seules le clone (\`bibliotheque-maquettes\` dans le dossier courant, son parent ou ~/Downloads) ; sinon \`BIBLIO=<dossier du clone>\` devant la commande.
- \`node _biblio/outils/chercher.mjs …\`, \`node _biblio/outils/intention.mjs intention.json\`, \`node _biblio/outils/assembler.mjs …\`, \`node _biblio/outils/tester-module.mjs …\`
- \`I=_biblio/images\` puis \`node $I/grok.mjs …\`, \`node $I/verifier-grok.mjs …\`, \`node $I/produire.mjs …\`, \`node $I/partage.mjs\`
- à la validation de la maquette : \`node _biblio/outils/ajouter.mjs <dépôt>\` (écrit dans le clone, qui se livre en bundle comme d'habitude).
`);
console.log(`${n} fichiers copiés dans ${dest}${commit ? ` (bibliothèque ${commit})` : ''}`);
