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
fs.writeFileSync(path.join(dest, 'preparer.mjs'), `// Prépare les outils dans le projet : relie sharp et Playwright déjà installés sur la machine (NODE_PATH, npm root -g),
// sinon installe sharp avec npm. Playwright n'est jamais réinstallé (une autre version ne trouverait pas le navigateur).
// node _biblio/preparer.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ici = path.dirname(fileURLToPath(import.meta.url));
const nm = path.join(ici, 'node_modules'); fs.mkdirSync(nm, { recursive: true });
let racinesGlobales = (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean);
try { racinesGlobales.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch {}
racinesGlobales.push('/usr/local/lib/node_modules_global', '/usr/local/lib/node_modules', '/usr/lib/node_modules', '/opt/homebrew/lib/node_modules');
for (const m of ['sharp', 'playwright']) {
  if (fs.existsSync(path.join(nm, m, 'package.json'))) { console.log(m + ' : déjà là'); continue; }
  const g = racinesGlobales.map((r) => path.join(r, m)).find((d) => fs.existsSync(path.join(d, 'package.json')));
  if (g) { fs.rmSync(path.join(nm, m), { recursive: true, force: true }); fs.symlinkSync(g, path.join(nm, m), 'dir'); console.log(m + ' : relié à ' + g); continue; }
  if (m === 'playwright') { console.log('playwright : introuvable (tester-module et inventaire ne tourneront pas ; ne pas le réinstaller ici)'); continue; }
  try { execFileSync('npm', ['install', '--no-audit', '--no-fund', '--no-save', 'sharp@^0.34.5'], { cwd: ici, stdio: 'inherit' }); console.log('sharp : installé'); }
  catch { console.log('sharp : ni trouvé ni installable (les commandes d images et la planche d intention ne tourneront pas)'); }
}
`);
fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify({ name: 'outils-bibliotheque-maquettes', private: true, type: 'module', dependencies: { sharp: '^0.34.5' } }, null, 1) + '\n');
fs.writeFileSync(path.join(dest, 'README.md'), `# Outils de la bibliothèque des maquettes, livrés avec la skill

Copie des dossiers \`outils/\` et \`images/\` (scripts seulement) du dépôt Kiwi570/bibliotheque-maquettes${commit ? `, commit ${commit}` : ''}, faite par \`node outils/vers-skill.mjs\` du dépôt. Ne pas les modifier ici : les modifier dans le dépôt, puis recopier à la mise à jour suivante de la skill.

Pourquoi : une session de projet peut refuser de lancer du code téléchargé (le clone de la bibliothèque). Ces copies font partie de la skill et tournent ; le clone ne sert que de données.

Dans un projet : \`cp -r <skill>/bibliotheque _biblio\`, puis \`node _biblio/preparer.mjs\` (relie sharp et Playwright déjà installés, sinon installe sharp ; Playwright n'est jamais réinstallé). Les commandes trouvent seules le clone (\`bibliotheque-maquettes\` dans le dossier courant, son parent ou ~/Downloads) ; sinon \`BIBLIO=<dossier du clone>\` devant la commande.
- \`node _biblio/outils/chercher.mjs …\`, \`node _biblio/outils/intention.mjs _suivi/intention.json --sortie _suivi/intention-<client>.html\` (fichiers de travail dans _suivi/), \`node _biblio/outils/assembler.mjs …\`, \`node _biblio/outils/tester-module.mjs …\`
- \`I=_biblio/images\` puis \`node $I/grok.mjs …\`, \`node $I/verifier-grok.mjs …\`, \`node $I/produire.mjs …\`, \`node $I/partage.mjs\`
- à la validation de la maquette : \`node _biblio/outils/ajouter.mjs <dépôt>\` (écrit dans le clone, qui se livre en bundle comme d'habitude).
`);
console.log(`${n} fichiers copiés dans ${dest}${commit ? ` (bibliothèque ${commit})` : ''}`);
