// Recherche dans la bibliothèque : sections et modules classés par note, avec chemin de la fiche et capture.
// node outils/chercher.mjs --activite restauration --ambiance chaleureux --role ouverture --animation webgl-shader [mots libres] [--max 15] [--json]
// Filtres : --activite --concept --ambiance (sur la maquette d'origine, ou convient_a/ambiances pour un module),
//           --role --animation --interaction --dependance --telephone, --module (seulement les sections extraites en module),
//           --sans <dependance> (exclut ce qui dépend de gsap, ogl…), --note-min N (1-5).
// Les filtres d'une même famille répétés valent « l'un ou l'autre » ; les mots libres cherchent dans titre, description, pièges et particularités,
// sans tenir compte des accents ni des majuscules. Un filtre de maquette (activité, concept, ambiance) départage le classement
// au lieu d'exclure : une section d'une autre activité reste proposée, plus bas.
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, TAXO, lireJson } from './commun.mjs';

const args = process.argv.slice(2);
const f = { activite: [], concept: [], ambiance: [], role: [], animation: [], interaction: [], dependance: [], telephone: [], sans: [] };
const mots = []; let max = 15, json = false, seulModules = false, noteMin = 1, strict = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') json = true;
  else if (a === '--module' || a === '--modules') seulModules = true;
  else if (a === '--strict') strict = true;
  else if (a === '--max') max = +args[++i];
  else if (a === '--note-min') noteMin = +args[++i];
  else if (a.startsWith('--')) {
    const k = a.slice(2).replace(/s$/, '').replace('interactions', 'interaction');
    if (!(k in f)) { console.error(`filtre inconnu : ${a}`); process.exit(1); }
    const v = args[++i];
    const liste = k === 'sans' ? TAXO.dependance : TAXO[k];
    for (const x of v.split(',')) { if (!liste.includes(x)) { console.error(`« ${x} » n'est pas dans la taxonomie (${k}) : ${liste.join(', ')}`); process.exit(1); } f[k].push(x); }
  } else mots.push(a);
}
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const racine = w => norm(w).replace(/(aux|eaux|s|x)$/, '');
const motsN = mots.map(racine).filter(Boolean);
const inter = (a, b) => !b.length || a.some(x => b.includes(x));
const liste = d => fs.existsSync(d) ? fs.readdirSync(d) : [];

const maquettes = Object.fromEntries(liste(path.join(RACINE, 'maquettes')).filter(x => x.endsWith('.json')).map(x => { const m = lireJson(path.join(RACINE, 'maquettes', x)); return [m.depot, m]; }));
const res = [];
function score(base, affinite, texte) {
  let s = base;
  if (motsN.length) { const t = norm(texte); const n = motsN.filter(m => t.includes(m)).length; if (!n) return null; s += n * 2; }
  return s + affinite;
}
// Sections
for (const m of Object.values(maquettes)) for (const id of m.sections) {
  const s = lireJson(path.join(RACINE, 'sections', id + '.json'));
  if (seulModules && !s.module) continue;
  if (s.note_qualite < noteMin) continue;
  if (!inter([s.role], f.role) || !inter(s.animations, f.animation) || !inter(s.interactions, f.interaction) || !inter(s.dependances, f.dependance) || !inter([s.telephone], f.telephone)) continue;
  if (f.sans.length && s.dependances.some(d => f.sans.includes(d))) continue;
  const aff = (inter(m.activite, f.activite) && f.activite.length ? 1.5 : 0) + (inter(m.concept, f.concept) && f.concept.length ? 1 : 0) + (f.ambiance.length ? m.ambiance.filter(a => f.ambiance.includes(a)).length * 0.75 : 0);
  if (strict && ((f.activite.length && !inter(m.activite, f.activite)) || (f.ambiance.length && !inter(m.ambiance, f.ambiance)) || (f.concept.length && !inter(m.concept, f.concept)))) continue;
  const sc = score(s.note_qualite * 2 + (s.reutilisable ? 1 : 0) + (s.module ? 1 : 0), aff, [s.titre, s.description, ...(s.pieges || []), ...(s.particularites || []), m.client, ...m.activite].join(' '));
  if (sc === null) continue;
  res.push({ type: 'section', id: s.id, score: sc, note: s.note_qualite, role: s.role, titre: s.titre, animations: s.animations, module: s.module, fiche: `sections/${s.id}.json`, capture: s.medias.capture || null, video: s.medias.video || null, en_ligne: m.url + (s.page === 'index' ? '' : '/' + s.page) });
}
// Modules
for (const d of liste(path.join(RACINE, 'modules'))) {
  const fj = path.join(RACINE, 'modules', d, 'module.json'); if (!fs.existsSync(fj)) continue;
  const m = lireJson(fj);
  if (!inter([m.role], f.role) || !inter(m.animations, f.animation) || !inter(m.dependances, f.dependance)) continue;
  if (f.interaction.length && !inter(m.interactions || [], f.interaction)) continue;
  if (f.sans.length && m.dependances.some(x => f.sans.includes(x))) continue;
  const aff = (f.activite.length && inter(m.convient_a, f.activite) ? 1.5 : 0) + (f.ambiance.length ? m.ambiances.filter(a => f.ambiance.includes(a)).length * 0.75 : 0);
  if (strict && ((f.activite.length && !inter(m.convient_a, f.activite)) || (f.ambiance.length && !inter(m.ambiances, f.ambiance)))) continue;
  const notes = fs.existsSync(path.join(RACINE, 'modules', d, 'NOTES.md')) ? fs.readFileSync(path.join(RACINE, 'modules', d, 'NOTES.md'), 'utf8') : '';
  const sc = score(12, aff, [m.titre, m.role, ...m.animations, notes].join(' '));
  if (sc === null) continue;
  res.push({ type: 'module', id: m.nom, score: sc, role: m.role, titre: m.titre, animations: m.animations, dossier: `modules/${m.nom}/`, capture: `modules/${m.nom}/apercu.jpg`, origine: m.origine, tests: Object.values(m.tests || {}).every(v => typeof v === 'number' ? v < .1 : /^(ok|n\/a|0 erreur)$/.test(v)) ? 'ok' : 'à revoir' });
}
res.sort((a, b) => b.score - a.score || (a.type === 'module' ? -1 : 1));
const out = res.slice(0, max);
if (json) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
if (!out.length) { console.log('Aucun résultat. Retirez un filtre ou un mot.'); process.exit(0); }
console.log(`${res.length} résultat${res.length > 1 ? 's' : ''}${res.length > max ? ` (les ${max} premiers)` : ''} :\n`);
for (const r of out) {
  if (r.type === 'module') console.log(`MODULE  ${r.id}  · ${r.role} · ${r.animations.join(', ')} · tests ${r.tests}\n        ${r.titre}\n        ${r.dossier}  ·  origine ${r.origine}\n        capture ${r.capture}\n`);
  else console.log(`${r.note}/5     ${r.id}  · ${r.role} · ${r.animations.join(', ')}${r.module ? ' · module ' + r.module : ''}\n        ${r.titre}\n        ${r.fiche}\n        capture ${r.capture || '—'}${r.video ? '  ·  vidéo ' + r.video : ''}\n        ${r.en_ligne}\n`);
}
