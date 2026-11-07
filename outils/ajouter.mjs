// Ajoute (ou met à jour) une maquette dans la bibliothèque, en fin de projet.
// node outils/ajouter.mjs <dépôt> [--sans-inventaire] [--sans-pull]
//
// 1. git pull --ff-only du dépôt (lecture seule : rien d'autre n'y est écrit) ;
// 2. inventaire automatique (pages, blocs, lignes de code, captures 1440 et 390, vidéos) et identité (palette, polices) ;
// 3. s'il manque notes-manuelles/<dépôt>.json : écrit un gabarit à compléter (une entrée par bloc) et une planche contact,
//    puis s'arrête — les rôles, notes et descriptions sont un jugement humain ;
// 4. sinon : fiches (maquette, sections, rapport d'audit), liens vers les modules, index.json, validation.
//    Il faut avant la fiche d'audit (note sur 100, verdict) : node outils/fiche-audit.mjs <fiche.json>.
// Le projet doit être un clone Git de son dépôt GitHub, à côté de la bibliothèque (~/Downloads/<dépôt>) :
// l'inventaire lit son dernier commit. Un dossier dézippé ne suffit pas.
// À chaque passage : grille wouahou (forme du voile, marques data-grille) et journal du projet (_audit/journal.json)
// relevés par outils/grille.mjs ; à la fin, rappel des leçons à proposer (lecons/<projet>.md).
// Le site de consultation lit index.json directement : il est à jour dès que l'index l'est.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { RACINE, DOWNLOADS, AUDIT, lireJson, ecrireJson } from './commun.mjs';

const depot = process.argv[2];
if (!depot || depot.startsWith('--')) { console.error('usage : node outils/ajouter.mjs <dépôt> [--sans-inventaire] [--sans-pull]'); process.exit(1); }
const dosDepot = path.join(DOWNLOADS, depot);
if (!fs.existsSync(dosDepot) || !fs.existsSync(path.join(dosDepot, '.git'))) {
  console.error(`${fs.existsSync(dosDepot) ? 'pas un clone Git' : 'dépôt introuvable'} : ${dosDepot}\nLe cloner à côté de la bibliothèque (l'inventaire lit son dernier commit) :\n  git clone https://github.com/Kiwi570/${depot}.git ${dosDepot}`);
  process.exit(1);
}
const lancer = (cmd, args, opts = {}) => { console.log(`> ${cmd} ${args.join(' ')}`); execFileSync(cmd, args, { stdio: 'inherit', cwd: RACINE, ...opts }); };

if (!process.argv.includes('--sans-pull') && fs.existsSync(path.join(dosDepot, '.git'))) {
  try { lancer('git', ['-C', dosDepot, 'pull', '--ff-only', '-q']); } catch { console.warn('  pull impossible : on continue avec la copie locale'); }
}
if (!process.argv.includes('--sans-inventaire')) {
  lancer('node', ['outils/identite.mjs', depot]);
  lancer('node', ['outils/inventaire.mjs', depot]);
}

lancer('node', ['outils/grille.mjs', depot]);

const fNotes = path.join(RACINE, 'notes-manuelles', `${depot}.json`);
if (!fs.existsSync(fNotes)) {
  const inv = lireJson(path.join(RACINE, 'inventaire', `${depot}.json`));
  const gabarit = {
    maquette: { client: '', activite: [], concept: [], ambiance: [], palette: { fond: '', texte: '', accent: '', secondaire: '' }, polices: { titres: '', texte: '', mono: '' },
      points_forts: [], reserves: [], animations: [], interactions: ['aucune'], change_depuis_audit: null, accueil: inv.blocs.find(b => b.dans_main)?.id || '',
      grille: { objet: '', fil: '' } },
    sections: Object.fromEntries(inv.blocs.map(b => [b.id, { titre: b.titre || '', role: '', description: '', animations: [], interactions: ['aucune'], telephone: 'adapté', note_qualite: 3, reutilisable: false, module: null, pieges: [] }])),
  };
  ecrireJson(fNotes, gabarit);
  const planche = path.join(RACINE, 'inventaire', 'brut', `planche-${depot}.jpg`);
  try { execFileSync('python3', [path.join(RACINE, 'outils', 'planche.py'), depot, planche], { cwd: RACINE, stdio: 'ignore' }); } catch {}
  console.log(`\nGabarit écrit : notes-manuelles/${depot}.json (${inv.blocs.length} blocs).`);
  console.log(`Planche contact : ${path.relative(RACINE, planche)}. Valeurs permises : taxonomie.json ; format : en tête de outils/fiches.mjs.`);
  console.log(`Complète rôle, description, animations, note et pièges de chaque bloc (ou "ignorer": "raison"), puis relance : node outils/ajouter.mjs ${depot} --sans-inventaire`);
  process.exit(0);
}

// Fiche d'audit d'abord : fiches.mjs en a besoin (sauf mise à jour d'une maquette déjà publiée).
if (!fs.existsSync(path.join(AUDIT, depot, 'notes.json')) && !fs.existsSync(path.join(RACINE, 'maquettes', `${depot}.json`))) {
  console.error(`\nFiche d'audit manquante (${path.join(AUDIT, depot, 'notes.json')}). L'écrire d'abord, en regardant les captures et le rapport\ndu script d'audit du projet : node outils/fiche-audit.mjs <fiche.json> (format en tête du script), puis relancer\nnode outils/ajouter.mjs ${depot} --sans-inventaire`);
  process.exit(1);
}
lancer('node', ['outils/fiches.mjs', depot]);
lancer('node', ['outils/relier-modules.mjs']);
const touches = execFileSync('git', ['status', '--porcelain', 'notes-manuelles'], { cwd: RACINE, encoding: 'utf8' }).split('\n').map(l => l.slice(3).match(/notes-manuelles\/(.+)\.json$/)?.[1]).filter(d => d && d !== depot);
for (const d of touches) lancer('node', ['outils/fiches.mjs', d]);
lancer('node', ['outils/indexer.mjs']);
lancer('node', ['outils/palmares.mjs']);
try { lancer('node', ['outils/valider.mjs']); } catch { console.error('\nValidation en erreur : corriger les lignes ERREUR ci-dessus, puis relancer avec --sans-inventaire.'); process.exit(1); }
console.log(`\n${depot} ajouté. Relire la fiche maquettes/${depot}.json, puis commiter (message sans apostrophe).`);
console.log(`Leçons : relire journaux/${depot}.json (s'il existe) et le rapport d'audit du projet, proposer 0 à 3 leçons générales à l'utilisateur, et écrire celles qu'il valide dans lecons/${depot.replace(/-maquette$/, '')}.md (un fichier par projet ; format dans lecons.md), dans le même commit. Ne jamais proposer de mise à jour de la skill pendant un projet.`);
