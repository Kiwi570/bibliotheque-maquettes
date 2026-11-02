// Régénère index.json : une ligne par maquette, par section et par module. C'est le seul fichier que Claude lit en entier.
// node outils/indexer.mjs
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson } from './commun.mjs';

const liste = d => fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
const maquettes = [], sections = [], modules = []; let sousSeuil = 0;
for (const f of liste(path.join(RACINE, 'maquettes')).filter(f => f.endsWith('.json'))) {
  const m = lireJson(path.join(RACINE, 'maquettes', f));
  maquettes.push([m.depot, m.activite, m.concept, m.ambiance, m.note, m.points_forts.slice(0, 3)]);
  for (const id of m.sections) {
    const s = lireJson(path.join(RACINE, 'sections', id + '.json'));
    if (s.note_qualite < 4) { sousSeuil++; continue; } // seules les sections notées 4 ou 5 figurent dans l'index
    sections.push([s.id, s.role, s.animations.filter(a => a !== 'aucune'), s.note_qualite, s.module || '', s.titre]);
  }
}
for (const d of liste(path.join(RACINE, 'modules'))) {
  const f = path.join(RACINE, 'modules', d, 'module.json'); if (!fs.existsSync(f)) continue;
  const m = lireJson(f);
  modules.push([m.nom, m.role, m.animations, m.convient_a, m.titre]);
}
sections.sort((a, b) => b[3] - a[3] || a[0].localeCompare(b[0]));
const index = {
  version: new Date().toISOString().slice(0, 10),
  aide: 'Colonnes : maquettes [depot, activite, concept, ambiance, note/100, points forts] ; sections notées 4 ou 5 seulement [id, role, animations, note, module, titre] (fiche : sections/<id>.json ; les autres sont trouvables par chercher.mjs) ; modules [nom, role, animations, convient_a, titre] (dossier : modules/<nom>/). Chercher : node outils/chercher.mjs --role ouverture --ambiance sombre',
  totaux: { maquettes: maquettes.length, sections_indexees: sections.length, sections_notees_3_ou_moins: sousSeuil, modules: modules.length },
  colonnes: { maquettes: ['depot', 'activite', 'concept', 'ambiance', 'note', 'points_forts'], sections: ['id', 'role', 'animations', 'note', 'module', 'titre'], modules: ['nom', 'role', 'animations', 'convient_a', 'titre'] },
  maquettes, sections, modules,
};
// Une ligne par entrée : lisible d'un coup d'œil et compact.
const ligne = x => JSON.stringify(x);
const txt = '{\n' + Object.entries(index).map(([k, v]) => Array.isArray(v) ? ` "${k}": [\n${v.map(x => '  ' + ligne(x)).join(',\n')}\n ]` : ` "${k}": ${ligne(v)}`).join(',\n') + '\n}\n';
fs.writeFileSync(path.join(RACINE, 'index.json'), txt);
console.log(`index.json : ${maquettes.length} maquettes, ${sections.length} sections, ${modules.length} modules, ${Math.round(txt.length / 102.4) / 10} Ko`);
