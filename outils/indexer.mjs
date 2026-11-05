// Régénère index.json : une ligne par maquette, par section et par module. C'est le seul fichier que Claude lit en entier.
// node outils/indexer.mjs
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson } from './commun.mjs';

const liste = d => fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
const maquettes = [], sections = [], modules = []; let sousSeuil = 0;
for (const f of liste(path.join(RACINE, 'maquettes')).filter(f => f.endsWith('.json'))) {
  const m = lireJson(path.join(RACINE, 'maquettes', f));
  maquettes.push([m.depot, m.activite, m.concept, m.ambiance, m.note, m.points_forts.slice(0, 3), m.url, m.client, m.date_commit || null, m.grille ? [m.grille.voile, m.grille.objet] : null]);
  for (const id of m.sections) {
    const s = lireJson(path.join(RACINE, 'sections', id + '.json'));
    if (s.note_qualite < 4) { sousSeuil++; continue; } // seules les sections notées 4 ou 5 figurent dans l'index
    // Média : 1 = nom conventionnel (medias/<dépôt>/<id>-p1440.jpg ou -p720.mp4), 0 = aucun, sinon chemin relatif à medias/<dépôt>/.
    const court = s.id.split('/')[1];
    const nomMedia = (v, suffixe) => !v ? 0 : v === `medias/${m.depot}/${court}-${suffixe}` ? 1 : v.replace(`medias/${m.depot}/`, '');
    sections.push([s.id, s.role, s.animations.filter(a => a !== 'aucune'), s.note_qualite, (s.modules?.length ? s.modules : s.module ? [s.module] : []).join('+'), s.titre,
      s.interactions.filter(a => a !== 'aucune'), nomMedia(s.medias.capture, 'p1440.jpg'), nomMedia(s.medias.video, 'p720.mp4'), s.page === 'index' ? '' : s.page]);
  }
}
for (const d of liste(path.join(RACINE, 'modules'))) {
  const f = path.join(RACINE, 'modules', d, 'module.json'); if (!fs.existsSync(f)) continue;
  const m = lireJson(f);
  modules.push([m.nom, m.role, m.animations, m.convient_a, m.titre, (m.interactions || []).filter(a => a !== 'aucune'), m.ambiances, m.dependances]);
}
sections.sort((a, b) => b[3] - a[3] || a[0].localeCompare(b[0]));
const index = {
  version: new Date().toISOString().slice(0, 10),
  aide: 'Colonnes : voir « colonnes ». Sections notées 4 ou 5 seulement (fiche : sections/<id>.json ; les autres sont trouvables par chercher.mjs) ; module = modules tirés de la section, principal en tête, séparés par + ; capture et video : 1 = medias/<dépôt>/<id court>-p1440.jpg ou -p720.mp4, 0 = aucune, sinon chemin relatif à medias/<dépôt>/ ; page vide = accueil ; modules : dossier modules/<nom>/. Chercher : node outils/chercher.mjs --role ouverture --ambiance sombre',
  totaux: { maquettes: maquettes.length, sections_indexees: sections.length, sections_notees_3_ou_moins: sousSeuil, modules: modules.length },
  colonnes: { maquettes: ['depot', 'activite', 'concept', 'ambiance', 'note', 'points_forts', 'url', 'client', 'date', 'grille'], sections: ['id', 'role', 'animations', 'note', 'module', 'titre', 'interactions', 'capture', 'video', 'page'], modules: ['nom', 'role', 'animations', 'convient_a', 'titre', 'interactions', 'ambiances', 'dependances'] },
  maquettes, sections, modules,
};
// Une ligne par entrée : lisible d'un coup d'œil et compact.
const ligne = x => JSON.stringify(x);
const txt = '{\n' + Object.entries(index).map(([k, v]) => Array.isArray(v) ? ` "${k}": [\n${v.map(x => '  ' + ligne(x)).join(',\n')}\n ]` : ` "${k}": ${ligne(v)}`).join(',\n') + '\n}\n';
fs.writeFileSync(path.join(RACINE, 'index.json'), txt);
console.log(`index.json : ${maquettes.length} maquettes, ${sections.length} sections, ${modules.length} modules, ${Math.round(txt.length / 102.4) / 10} Ko`);
