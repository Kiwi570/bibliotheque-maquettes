// Ce qui manque à la bibliothèque, pour le prochain passage : films des sections animées notées 4 ou 5.
// node outils/manques.mjs   écrit manques.md (à la racine) et en affiche le résumé.
// Un film manquant se refait avec l'inventaire de la maquette (node outils/inventaire.mjs <dépôt>, dépôt cloné à côté de la bibliothèque), puis fiches.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson } from './commun.mjs';

const parMaquette = new Map();
let total = 0;
for (const f of fs.readdirSync(path.join(RACINE, 'maquettes')).filter((x) => x.endsWith('.json')).sort()) {
  const m = lireJson(path.join(RACINE, 'maquettes', f));
  for (const id of m.sections) {
    const s = lireJson(path.join(RACINE, 'sections', id + '.json'));
    if (s.note_qualite >= 4 && s.animations.some((a) => a !== 'aucune') && !s.medias.video && s.medias.capture) {
      if (!parMaquette.has(m.depot)) parMaquette.set(m.depot, { url: m.url, l: [] });
      parMaquette.get(m.depot).l.push(s); total++;
    }
  }
}
let md = `# Ce qui manque à la bibliothèque\n\nGénéré par \`node outils/manques.mjs\` le ${new Date().toISOString().slice(0, 10)}.\n\n`;
md += `## Films des sections animées notées 4 ou 5 (${total})\n\nSans film, une animation ne se juge que sur une capture fixe : le skill et le palmarès la voient moins bien. À refaire au prochain inventaire de ces maquettes.\n\n`;
for (const [depot, { url, l }] of [...parMaquette].sort((a, b) => b[1].l.length - a[1].l.length || a[0].localeCompare(b[0]))) {
  md += `### ${depot} (${l.length})\n\n${url}\n\n`;
  for (const s of l) md += `- \`${s.id}\` · ${s.note_qualite}/5 · ${s.role} · ${s.titre}${s.page && s.page !== 'index' ? ` · page ${s.page}` : ''}\n`;
  md += '\n';
}
fs.writeFileSync(path.join(RACINE, 'manques.md'), md);
console.log(`manques.md : ${total} films à refaire sur ${parMaquette.size} maquettes`);
for (const [depot, { l }] of [...parMaquette].sort((a, b) => b[1].l.length - a[1].l.length).slice(0, 8)) console.log(`  ${depot} : ${l.length}`);
