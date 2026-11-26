// Régénère index.json : une ligne par maquette, par section et par module. Claude peut le lire en entier (150 Ko au plus, allégé tout seul : voir plus bas).
// Il garde les sections notées 5 et les sections notées 4 dont un module est tiré ; site/index-site.json (lu par le site de consultation)
// garde toutes les sections notées 4 ou 5. Les autres sont trouvables par chercher.mjs.
// node outils/indexer.mjs
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson, lireFavoris } from './commun.mjs';
import { deduireModule } from './deduire.mjs';

const liste = d => fs.existsSync(d) ? fs.readdirSync(d).sort() : [];
const maquettes = [], toutes = [], modules = []; let sousSeuil = 0;
for (const f of liste(path.join(RACINE, 'maquettes')).filter(f => f.endsWith('.json'))) {
  const m = lireJson(path.join(RACINE, 'maquettes', f));
  maquettes.push([m.depot, m.activite, m.concept, m.ambiance, m.note, m.points_forts.slice(0, 3), m.url, m.client, m.date_commit || null, m.grille ? [m.grille.voile, m.grille.objet] : null, m.metier || null, m.luminosite || null, m.ton || [], m.univers || [], m.besoins || [], m.plan || null]);
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
  modules.push([m.nom, m.role, m.animations, m.convient_a, m.titre, (m.interactions || []).filter(a => a !== 'aucune'), m.ambiances, m.dependances, dm.impact, dm.familles, m.provenance || null]);
}
toutes.sort((a, b) => b[3] - a[3] || a[0].localeCompare(b[0]));
// Index de Claude : notées 5, ou notées 4 avec un module (colonne 4 non vide).
const sections = toutes.filter(l => l[3] === 5 || l[4]);
const index = {
  version: new Date().toISOString().slice(0, 10),
  aide: 'Colonnes : voir « colonnes ». Sections notées 5, et notées 4 quand un module en est tiré (fiche : sections/<id>.json ; toutes les sections notées 4 ou 5 : site/index-site.json ; les autres : chercher.mjs) ; module = modules tirés de la section, principal en tête, séparés par + ; capture et video : 1 = medias/<dépôt>/<id court>-p1440.jpg ou -p720.mp4, 0 = aucune, sinon chemin relatif à medias/<dépôt>/ ; page vide = accueil ; url de maquette 1 = adresse habituelle https://<dépôt>.vercel.app ; client raccourci (…) quand l index approche 150 Ko, fiche complète dans maquettes/<dépôt>.json ; modules : dossier modules/<nom>/, provenance projet (tiré d une maquette validée) ou à part (créé hors projet, pas encore servi). Chercher : node outils/chercher.mjs --activite restauration --metier pizzeria --besoin vendre --role ouverture (voir l en-tête de outils/chercher.mjs : métier, activités voisines, besoins, luminosité, ton, univers, famille d effet, impact)',
  totaux: { maquettes: maquettes.length, sections_indexees: sections.length, sections_notees_4_ou_5: toutes.length, sections_notees_3_ou_moins: sousSeuil, modules: modules.length },
  colonnes: { maquettes: ['depot', 'activite', 'concept', 'ambiance', 'note', 'points_forts', 'url', 'client', 'date', 'grille', 'metier', 'luminosite', 'ton', 'univers', 'besoins', 'plan'], sections: ['id', 'role', 'animations', 'note', 'module', 'titre', 'interactions', 'capture', 'video', 'page', 'impact', 'familles'], modules: ['nom', 'role', 'animations', 'convient_a', 'titre', 'interactions', 'ambiances', 'dependances', 'impact', 'familles', 'provenance'] },
  maquettes, sections, modules,
};
// Une ligne par entrée : lisible d'un coup d'œil et compact.
const ligne = x => JSON.stringify(x);
const ecrire = (ix) => '{\n' + Object.entries(ix).map(([k, v]) => Array.isArray(v) ? ` "${k}": [\n${v.map(x => '  ' + ligne(x)).join(',\n')}\n ]` : ` "${k}": ${ligne(v)}`).join(',\n') + '\n}\n';
/* Plafond de 150 Ko (octets, accents compris) : au-delà, les points forts des maquettes se raccourcissent (3, puis 2, puis 1)
   au lieu de faire échouer la validation après coup (l'index était à 36 octets du plafond ; audit externe). Le site garde tout. */
const PLAFOND = 150 * 1024;
/* 13 novembre 2026 (99 maquettes, 149 Ko) : l'adresse habituelle s'écrit 1 dans index.json, et la description du client se
   raccourcit après les points forts (90, 60 caractères, puis plus de client : le métier reste).
   18 novembre 2026 (107 maquettes, 148,6 Ko, vingt de plus à venir) : dernier recours, les sections notées 5 sans module se
   limitent à 4, 3, 2 puis 1 par maquette (celles qui ont un module restent toutes ; ouverture et effet le plus fort d'abord).
   L'index ne bloque donc plus l'ajout d'une maquette. Le site (site/index-site.json), les fiches et chercher.mjs gardent tout.
   26 novembre 2026 (138 maquettes, 150,2 Ko au plus léger, vingt-huit de plus à venir) : paliers suivants, plus de section
   notée 5 sans module (seules restent les sections tirées en module), puis le point fort raccourci à 140 et 100 caractères,
   puis plus de point fort (la grille, le métier et les besoins restent). */
const raccourcir = (s, n) => (typeof s === 'string' && s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const compacter = (pf, client, lpf = Infinity) => maquettes.map((l) => l.map((v, i) => (i === 5 ? v.slice(0, pf).map((s) => raccourcir(s, lpf))
  : i === 6 ? (v === `https://${l[0]}.vercel.app` ? 1 : v)
  : i === 7 && client < 0 ? null
  : i === 7 && client && typeof v === 'string' && v.length > client ? v.slice(0, client - 1).trimEnd() + '…' : v)));
const POIDS_IMPACT = { spectaculaire: 0, vivant: 1, calme: 2 };
const limiter = (k) => {
  if (!Number.isFinite(k)) return sections;
  const parMaquette = {};
  for (const l of sections) (parMaquette[l[0].split('/')[0]] ||= []).push(l);
  const garde = new Set();
  for (const liste of Object.values(parMaquette)) {
    const avecModule = liste.filter((l) => l[4]), sans = liste.filter((l) => !l[4]);
    sans.sort((a, b) => (b[1] === 'ouverture') - (a[1] === 'ouverture') || (POIDS_IMPACT[a[10]] ?? 3) - (POIDS_IMPACT[b[10]] ?? 3) || a[0].localeCompare(b[0]));
    for (const l of [...avecModule, ...sans.slice(0, k)]) garde.add(l);
  }
  return sections.filter((l) => garde.has(l));
};
const ETAPES = [[3, 0, Infinity], [2, 0, Infinity], [1, 0, Infinity], [1, 90, Infinity], [1, 60, Infinity], [1, -1, Infinity], [1, -1, 4], [1, -1, 3], [1, -1, 2], [1, -1, 1],
  [1, -1, 0], [1, -1, 0, 140], [1, -1, 0, 100], [0, -1, 0]];
let txt = '', etape = 0, pointsForts = 3, nbSections = sections.length;
for (; etape < ETAPES.length; etape++) {
  const [pf, cl, k, lpf] = ETAPES[etape];
  const secs = limiter(k);
  nbSections = secs.length;
  const allege = k === 0 ? ` Index allégé : seules les sections tirées en module sont listées${pf === 0 ? ', sans les points forts des maquettes' : lpf ? ', points forts raccourcis' : ''} (les sections notées 4 ou 5 : site/index-site.json ou chercher.mjs ; les points forts : maquettes/<dépôt>.json).` : ` Index allégé : au plus ${k} section(s) notée(s) 5 sans module par maquette (les autres : site/index-site.json ou chercher.mjs).`;
  txt = ecrire({ ...index, ...(Number.isFinite(k) ? { aide: index.aide + allege } : {}), maquettes: compacter(pf, cl, lpf), sections: secs });
  if (Buffer.byteLength(txt) <= PLAFOND) break;
}
etape = Math.min(etape, ETAPES.length - 1); pointsForts = ETAPES[etape][0];
if (Buffer.byteLength(txt) > PLAFOND) console.log(`ATTENTION : index.json dépasse 150 Ko même au plus léger : alléger l'index (colonnes) avant d'ajouter des maquettes.`);
fs.writeFileSync(path.join(RACINE, 'index.json'), txt);
fs.writeFileSync(path.join(RACINE, 'site', 'index-site.json'), ecrire({ ...index, aide: 'Copie de index.json pour le site de consultation, avec toutes les sections notées 4 ou 5 et la liste des maquettes favorites (favoris.json).', favoris: lireFavoris().map((f) => f.depot), sections: toutes }));
console.log(`index.json : ${maquettes.length} maquettes, ${nbSections} sections (site : ${toutes.length}), ${modules.length} modules, ${Math.round(Buffer.byteLength(txt) / 102.4) / 10} Ko${pointsForts < 3 ? ` (${pointsForts} point(s) fort(s) par maquette${ETAPES[etape][1] > 0 ? `, client en ${ETAPES[etape][1]} caractères` : ETAPES[etape][1] < 0 ? ', sans client' : ''}${ETAPES[etape][3] ? `, point fort en ${ETAPES[etape][3]} caractères` : ''}${ETAPES[etape][2] === 0 ? ', seulement les sections tirées en module' : Number.isFinite(ETAPES[etape][2]) ? `, ${ETAPES[etape][2]} section(s) notée(s) 5 sans module par maquette` : ''} pour rester sous 150 Ko)` : ''}`);
