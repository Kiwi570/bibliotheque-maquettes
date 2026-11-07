// Écrit la fiche d'audit d'entrée en bibliothèque d'une maquette : audit-maquettes/<dépôt>/notes.json (note sur 100,
// verdict) et rapport.md (lu par outils/fiches.mjs, publié dans audits/<dépôt>.md). À faire AVANT
// `node outils/ajouter.mjs <dépôt> --sans-inventaire` : sans elle, les fiches ne peuvent pas être écrites.
// node outils/fiche-audit.mjs <fiche.json> [...]
//
// Fiche (une par maquette, jugement de Claude en regardant les captures et le rapport du script d'audit) :
// { "depot": "nolanis-maquette", "resume": "Direction … en deux ou trois phrases.",
//   "source": "script d'audit de la skill (complet, v3), inventaire de la bibliothèque et lecture des captures.",
//   "c": [[note, "justification"], …]  9 critères, dans l'ordre et sur les maximums de CRITERES ci-dessous,
//   "forts": ["…"], "bloquants": [["titre", "texte", "effort"]], "importants": [...], "finition": [...],
//   "mesures": [["mesure", "valeur"]] (facultatif) }
// Verdict : « Prête à envoyer » à 85/100 et plus sans défaut bloquant, sinon « À peaufiner ».
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { AUDIT, DOWNLOADS, lireJson, ecrireJson } from './commun.mjs';

const CRITERES = [['1. Effet « waouh » et niveau premium', 15], ['2. Direction artistique et harmonie', 15], ['3. Animations et effets', 15],
  ['4. Expérience ludique et interactions', 10], ['5. Tous les formats', 15], ['6. Contenu et fiabilité', 10],
  ['7. Technique et performance', 10], ['8. Mise en ligne', 5], ['9. Accessibilité', 5]];

const liste = (titre, items = []) => [`### ${titre}`, '', ...(items.length ? items.map(([t, x, e], i) => `${i + 1}. **${t}** : ${x}${e ? ` Effort : ${e}.` : ''}`) : [titre === 'Bloquants' ? 'Aucun.' : 'Rien à signaler.']), ''];
const aujourdhui = new Date().toLocaleDateString('fr-FR');

const fiches = process.argv.slice(2);
if (!fiches.length) { console.error('usage : node outils/fiche-audit.mjs <fiche.json> [...]'); process.exit(1); }
for (const chemin of fiches) {
  const a = lireJson(chemin);
  const d = a.depot;
  if (!d || !Array.isArray(a.c) || a.c.length !== CRITERES.length) throw new Error(`${chemin} : il faut "depot" et 9 critères dans "c"`);
  a.c.forEach(([n], i) => { if (!(n >= 0 && n <= CRITERES[i][1])) throw new Error(`${d} : critère ${i + 1} noté ${n} sur ${CRITERES[i][1]}`); });
  const total = a.c.reduce((s, [n]) => s + n, 0);
  const nb = (a.bloquants || []).length;
  const verdict = nb === 0 && total >= 85 ? 'Prête à envoyer' : 'À peaufiner';
  const url = `https://${d}.vercel.app`;
  // Dernier commit et rapport du script d'audit du projet, s'il est cloné à côté de la bibliothèque.
  const dos = path.join(DOWNLOADS, d);
  let commit = '';
  try { commit = execFileSync('git', ['-C', dos, 'log', '-1', '--format=%h du %ad', '--date=format:%d/%m/%Y'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
  const rapport = lireJson(path.join(dos, '_audit', 'rapport', 'rapport.json'), null);
  const enTete = fs.existsSync(path.join(dos, '_audit', 'rapport', 'rapport.md')) ? fs.readFileSync(path.join(dos, '_audit', 'rapport', 'rapport.md'), 'utf8').slice(0, 600) : '';
  const niveau = /audit complet/i.test(enTete) ? 'complet' : /audit RAPIDE/i.test(enTete) ? 'rapide' : 'standard';
  const mesures = [...(rapport ? [["Script d'audit de la skill", `${niveau} : ${rapport.echecs.length} échec(s), ${rapport.aRegarder.length} à regarder, ${rapport.nonLances.length} non lancé(s)`]] : []), ...(a.mesures || [])];
  const md = [`# ${d}`, '', `<${url}> · audit du ${aujourdhui}${commit ? ` · dernier commit ${commit}` : ''}`, '',
    `> Audit d'entrée en bibliothèque : ${a.source || 'lecture des captures et du rapport du script d\'audit.'} Pas d'audit externe : la note est à confirmer.`, '',
    '## Verdict', '', `**${total}/100 · ${verdict} · ${nb} défaut${nb > 1 ? 's' : ''} bloquant${nb > 1 ? 's' : ''}**`, '', a.resume || '', '',
    '## Notes', '', '| Critère | Note | Justification |', '|---|---|---|',
    ...CRITERES.map(([nom, mx], i) => `| ${nom} | ${a.c[i][0]}/${mx} | ${a.c[i][1] || ''} |`), `| **Total** | **${total}/100** | |`, '',
    '## Points forts', '', ...(a.forts || []).map((x) => `- ${x}`), '', '## Défauts', '',
    ...liste('Bloquants', a.bloquants), ...liste('Importants', a.importants), ...liste('Finition', a.finition),
    ...(mesures.length ? ['## Mesures clés', '', '| Mesure | Valeur |', '|---|---|', ...mesures.map(([k, x]) => `| ${k} | ${x} |`), ''] : [])];
  fs.mkdirSync(path.join(AUDIT, d), { recursive: true });
  fs.writeFileSync(path.join(AUDIT, d, 'rapport.md'), md.join('\n'));
  ecrireJson(path.join(AUDIT, d, 'notes.json'), { depot: d, url, note: total, verdict, bloquants: nb,
    criteres: Object.fromEntries(a.c.map(([n], i) => [`c${i + 1}`, { note: n, max: CRITERES[i][1] }])), source: "audit d'entrée en bibliothèque, pas d'audit externe" });
  console.log(`${d} : ${total}/100 · ${verdict} · ${nb} bloquant(s) → ${path.join(AUDIT, d)}`);
}
