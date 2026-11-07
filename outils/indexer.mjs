// Régénère index.json : une ligne par maquette, par section et par module. C'est le seul fichier que Claude lit en entier (150 Ko au plus).
// Il garde les sections notées 5 et les sections notées 4 dont un module est tiré ; site/index-site.json (lu par le site de consultation)
// garde toutes les sections notées 4 ou 5. Les autres sont trouvables par chercher.mjs.
// node outils/indexer.mjs
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson } from './commun.mjs';
import { deduireModule } from './deduire.mjs';

const liste = d => fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
const maquettes = [], toutes = [], modules = []; let sousSeuil = 0;
for (const f of liste(path.join(RACINE, 'maquettes')).filter(f => f.endsWith('.json'))) {
  const m = lireJson(path.join(RACINE, 'maquettes', f));
  maquettes.push([m.depot, m.activite, m.concept, m.ambiance, m.note, m.points_forts.slice(0, 3), m.url, m.client, m.date_commit || null, m.grille ? [m.grille.voile, m.grille.objet] : null, m.metier || null, m.luminosite || null, m.ton || [], m.univers || [], m.besoins || []]);
  for (const id of m.sections) {
    const s = lireJson(path.join(RACINE, 'sections', id + '.json'));
    if (s.note_qualite < 4) { sousSeuil++; continue; } // seules les sections notées 4 ou 5 figurent dans l'index
    // Média : 1 = nom conventionnel (medias/<dépôt>/<id>-p1440.jpg ou -p720.mp4), 0 = aucun, sinon chemin relatif à medias/<dépôt>/.
    const court = s.id.split('/')[1];
    const nomMedia = (v, suffixe) => !v ? 0 : v === `medias/${m.depot}/${court}-${suffixe}` ? 1 : v.replace(`medias/${m.depot}/`, '');
    toutes.push([s.id, s.role, s.animations.filter(a => a !== 'aucune'), s.note_qualite, (s.modules?.length ? s.modules : s.module ? [s.module] : []).join('+'), s.titre,
      s.interactions.filter(a => a !== 'aucune'), nomMedia(s.medias.capture, 'p1440.jpg'), nomMedia(s.medias.video, 'p720.mp4'), s.page === 'index' ? '' : s.page, s.impact || null, s.familles || []]);
  }
}
for (const d of liste(path.join(RACINE, 'modules'))) {
  const f = path.join(RACINE, 'modules', d, 'module.json'); if (!fs.existsSync(f)) continue;
  const m = lireJson(f);
  const notes = fs.existsSync(path.join(RACINE, 'modules', d, 'NOTES.md')) ? fs.readFileSync(path.join(RACINE, 'modules', d, 'NOTES.md'), 'utf8') : '';
  const dm = deduireModule(m, notes);
  modules.push([m.nom, m.role, m.animations, m.convient_a, m.titre, (m.interactions || []).filter(a => a !== 'aucune'), m.ambiances, m.dependances, dm.impact, dm.familles]);
}
toutes.sort((a, b) => b[3] - a[3] || a[0].localeCompare(b[0]));
// Index de Claude : notées 5, ou notées 4 avec un module (colonne 4 non vide).
const sections = toutes.filter(l => l[3] === 5 || l[4]);
const index = {
  version: new Date().toISOString().slice(0, 10),
  aide: 'Colonnes : voir « colonnes ». Sections notées 5, et notées 4 quand un module en est tiré (fiche : sections/<id>.json ; toutes les sections notées 4 ou 5 : site/index-site.json ; les autres : chercher.mjs) ; module = modules tirés de la section, principal en tête, séparés par + ; capture et video : 1 = medias/<dépôt>/<id court>-p1440.jpg ou -p720.mp4, 0 = aucune, sinon chemin relatif à medias/<dépôt>/ ; page vide = accueil ; modules : dossier modules/<nom>/. Chercher : node outils/chercher.mjs --activite restauration --metier pizzeria --besoin vendre --role ouverture (voir l en-tête de outils/chercher.mjs : métier, activités voisines, besoins, luminosité, ton, univers, famille d effet, impact)',
  totaux: { maquettes: maquettes.length, sections_indexees: sections.length, sections_notees_4_ou_5: toutes.length, sections_notees_3_ou_moins: sousSeuil, modules: modules.length },
  colonnes: { maquettes: ['depot', 'activite', 'concept', 'ambiance', 'note', 'points_forts', 'url', 'client', 'date', 'grille', 'metier', 'luminosite', 'ton', 'univers', 'besoins'], sections: ['id', 'role', 'animations', 'note', 'module', 'titre', 'interactions', 'capture', 'video', 'page', 'impact', 'familles'], modules: ['nom', 'role', 'animations', 'convient_a', 'titre', 'interactions', 'ambiances', 'dependances', 'impact', 'familles'] },
  maquettes, sections, modules,
};
// Une ligne par entrée : lisible d'un coup d'œil et compact.
const ligne = x => JSON.stringify(x);
const ecrire = (ix) => '{\n' + Object.entries(ix).map(([k, v]) => Array.isArray(v) ? ` "${k}": [\n${v.map(x => '  ' + ligne(x)).join(',\n')}\n ]` : ` "${k}": ${ligne(v)}`).join(',\n') + '\n}\n';
const txt = ecrire(index);
fs.writeFileSync(path.join(RACINE, 'index.json'), txt);
fs.writeFileSync(path.join(RACINE, 'site', 'index-site.json'), ecrire({ ...index, aide: 'Copie de index.json pour le site de consultation, avec toutes les sections notées 4 ou 5.', sections: toutes }));
console.log(`index.json : ${maquettes.length} maquettes, ${sections.length} sections (site : ${toutes.length}), ${modules.length} modules, ${Math.round(txt.length / 102.4) / 10} Ko`);
