// Contrôle de la bibliothèque : valeurs de taxonomie, poids des fiches et des médias, chemins existants, sections et modules reliés.
// node outils/valider.mjs   (code de sortie 1 s'il y a une erreur)
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, TAXO, lireJson } from './commun.mjs';

const err = []; const avert = [];
const liste = d => fs.existsSync(d) ? fs.readdirSync(d) : [];
const verifie = (ou, champ, valeurs, cle, min = 0) => {
  if (!Array.isArray(valeurs)) { err.push(`${ou} : ${champ} doit être une liste`); return; }
  if (valeurs.length < min) err.push(`${ou} : ${champ} vide`);
  for (const v of valeurs) if (!TAXO[cle].includes(v)) err.push(`${ou} : ${champ} « ${v} » hors taxonomie`);
};
const poids = (f, max, ou) => { if (!fs.existsSync(path.join(RACINE, f))) { err.push(`${ou} : fichier manquant ${f}`); return; } const s = fs.statSync(path.join(RACINE, f)).size; if (s > max) err.push(`${ou} : ${f} pèse ${Math.round(s / 1024)} Ko (max ${Math.round(max / 1024)})`); };
const fiche = f => { const s = fs.statSync(f).size; if (s > 10 * 1024) err.push(`${path.relative(RACINE, f)} : ${Math.round(s / 1024)} Ko (max 10)`); return lireJson(f); };

const modules = new Set(liste(path.join(RACINE, 'modules')).filter(m => fs.existsSync(path.join(RACINE, 'modules', m, 'module.json'))));
let nSec = 0;
for (const f of liste(path.join(RACINE, 'maquettes')).filter(f => f.endsWith('.json'))) {
  const m = fiche(path.join(RACINE, 'maquettes', f)); const ou = 'maquettes/' + f;
  verifie(ou, 'activite', m.activite, 'activite', 1); verifie(ou, 'concept', m.concept, 'concept', 1); verifie(ou, 'ambiance', m.ambiance, 'ambiance', 1);
  if (m.concept.length > 2) err.push(`${ou} : concept, deux valeurs au plus`);
  if (m.ambiance.length > 3) err.push(`${ou} : ambiance, trois valeurs au plus`);
  // Champs déduits (taxonomie v4, outils/deduire.mjs) : présents et dans la taxonomie.
  if (!m.metier || typeof m.metier !== 'string') err.push(`${ou} : metier manquant (node outils/deduire.mjs, ou notes-manuelles maquette.metier)`);
  if (!TAXO.luminosite.includes(m.luminosite)) err.push(`${ou} : luminosite « ${m.luminosite} » (node outils/deduire.mjs)`);
  verifie(ou, 'ton', m.ton || [], 'ton'); verifie(ou, 'univers', m.univers || [], 'univers'); verifie(ou, 'besoins', m.besoins ?? null, 'besoin');
  verifie(ou, 'animations', m.animations, 'animation', 1); verifie(ou, 'interactions', m.interactions, 'interaction', 1); verifie(ou, 'dependances', m.dependances, 'dependance', 1);
  for (const [k, v] of Object.entries(m.palette || {})) if (!/^#[0-9a-f]{6}$/i.test(v || '')) err.push(`${ou} : palette.${k} invalide (${v})`);
  for (const c of Object.values(m.captures || {})) if (c) poids(c, 300 * 1024, ou);
  if (!fs.existsSync(path.join(RACINE, 'audits', m.depot + '.md'))) err.push(`${ou} : audit manquant`);
  if (m.grille) {
    if (![null, 'glisse', 'iris', 'vague', 'rideau', 'propre'].includes(m.grille.voile)) err.push(`${ou} : grille.voile « ${m.grille.voile} » (glisse, iris, vague, rideau, propre ou null)`);
    for (const k of ['objet', 'fil']) if (m.grille[k] != null && typeof m.grille[k] !== 'string') err.push(`${ou} : grille.${k} doit être un texte`);
    if (m.grille.voile && !m.grille.objet) avert.push(`${ou} : grille.objet non noté (notes-manuelles, maquette.grille.objet)`);
  }
  if (m.journal && !fs.existsSync(path.join(RACINE, m.journal.fichier))) err.push(`${ou} : journal ${m.journal.fichier} manquant`);
  for (const id of m.sections) {
    const fs_ = path.join(RACINE, 'sections', id + '.json');
    if (!fs.existsSync(fs_)) { err.push(`${ou} : section manquante ${id}`); continue; }
    const s = fiche(fs_); const os = 'sections/' + id; nSec++;
    if (!TAXO.role.includes(s.role)) err.push(`${os} : rôle « ${s.role} » hors taxonomie`);
    verifie(os, 'animations', s.animations, 'animation', 1); verifie(os, 'interactions', s.interactions, 'interaction', 1); verifie(os, 'dependances', s.dependances, 'dependance', 1);
    if (!TAXO.telephone.includes(s.telephone)) err.push(`${os} : telephone « ${s.telephone} »`);
    if (!TAXO.impact.includes(s.impact)) err.push(`${os} : impact « ${s.impact} » (node outils/deduire.mjs)`);
    verifie(os, 'familles', s.familles ?? null, 'famille');
    if (!(s.note_qualite >= 1 && s.note_qualite <= 5)) err.push(`${os} : note_qualite`);
    if (!s.description || s.description.length < 30) err.push(`${os} : description trop courte`);
    if (s.reutilisable && s.note_qualite < 4) err.push(`${os} : réutilisable avec une note < 4`);
    if (s.module && !modules.has(s.module)) avert.push(`${os} : module « ${s.module} » pas encore extrait`);
    if (!Array.isArray(s.modules)) err.push(`${os} : modules doit être une liste`);
    else { if (s.module && s.modules[0] !== s.module) err.push(`${os} : modules doit commencer par le module principal`);
      if (!s.module && s.modules.length) err.push(`${os} : modules sans module principal`);
      for (const x of s.modules.slice(1)) if (!modules.has(x)) avert.push(`${os} : module « ${x} » pas encore extrait`); }
    for (const [k, v] of Object.entries(s.medias || {})) poids(v, k === 'video' ? 2 * 1024 * 1024 : 300 * 1024, os);
    if (s.note_qualite >= 4 && s.animations.some(a => a !== 'aucune') && !s.medias.video && s.medias.capture) avert.push(`${os} : animée sans vidéo`);
  }
}
for (const m of modules) {
  const mj = fiche(path.join(RACINE, 'modules', m, 'module.json')); const ou = 'modules/' + m;
  if (mj.nom !== m) err.push(`${ou} : nom ≠ dossier`);
  if (!TAXO.role.includes(mj.role)) err.push(`${ou} : rôle « ${mj.role} »`);
  verifie(ou, 'animations', mj.animations, 'animation', 1); verifie(ou, 'dependances', mj.dependances, 'dependance', 1);
  verifie(ou, 'convient_a', mj.convient_a, 'activite', 1); verifie(ou, 'ambiances', mj.ambiances, 'ambiance', 1);
  for (const f of ['index.html', 'module.css', 'module.js', 'NOTES.md', 'apercu.jpg']) if (!fs.existsSync(path.join(RACINE, 'modules', m, f))) err.push(`${ou} : ${f} manquant`);
  poids(`modules/${m}/apercu.jpg`, 300 * 1024, ou);
  // Emplacements d'images (pipeline d'images) : liste, vide si le module n'a aucune image.
  if (!Array.isArray(mj.images)) err.push(`${ou} : images manquant (liste des emplacements, [] si aucun)`);
  else mj.images.forEach((im, i) => { for (const k of ['role', 'selecteur', 'nombre', 'ratio', 'largeur', 'zone_calme']) if (im[k] === undefined || im[k] === '') err.push(`${ou} : images[${i}].${k} manquant`);
    if (typeof im.largeur !== 'number' || im.largeur < 200 || im.largeur > 4000) err.push(`${ou} : images[${i}].largeur en pixels (200 à 4000)`); });
  if (fs.existsSync(path.join(RACINE, 'modules', m, 'scenario.json'))) { const sc = lireJson(path.join(RACINE, 'modules', m, 'scenario.json')); if (!(Array.isArray(sc.etapes) && sc.etapes.length) && !sc.capture) err.push(`${ou} : scenario.json sans étapes ni capture`); }
  if (fs.existsSync(path.join(RACINE, 'modules', m, 'apercu.mp4'))) poids(`modules/${m}/apercu.mp4`, 2 * 1024 * 1024, ou);
  const css = fs.readFileSync(path.join(RACINE, 'modules', m, 'module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const dur = css.match(/#[0-9a-f]{3,8}\b|rgba?\(\s*\d|hsla?\(\s*\d|font-family\s*:(?!\s*(?:var\(|inherit))[^;]+/gi);
  if (dur) err.push(`${ou} : couleur ou police en dur dans module.css (${[...new Set(dur)].slice(0, 4).join(', ')})`);
  const js = fs.readFileSync(path.join(RACINE, 'modules', m, 'module.js'), 'utf8');
  if (!/export\s+(async\s+)?function\s+init\s*\(/.test(js)) err.push(`${ou} : module.js n'exporte pas init()`);
  if (/new\s+Lenis|gsap\.registerPlugin|anticipatePin/.test(js)) err.push(`${ou} : module.js instancie Lenis, enregistre GSAP ou utilise anticipatePin`);
  if (!mj.tests || Object.values(mj.tests).some(v => typeof v === 'string' && /échec|erreur(?!s? *: *0)|ko/i.test(v) && !/^0 erreur/.test(v))) avert.push(`${ou} : tests à revoir (${JSON.stringify(mj.tests)})`);
}
// Journaux de projet (copiés par outils/grille.mjs) et fichier des leçons.
for (const f of liste(path.join(RACINE, 'journaux')).filter(f => f.endsWith('.json'))) {
  const ou = 'journaux/' + f; let j = null;
  try { j = JSON.parse(fs.readFileSync(path.join(RACINE, 'journaux', f), 'utf8')); } catch { err.push(`${ou} : JSON illisible`); continue; }
  if (!Array.isArray(j.versions) || !j.versions.length) { err.push(`${ou} : versions manquantes`); continue; }
  j.versions.forEach((v, i) => { if (!Array.isArray(v.etapes)) err.push(`${ou} : versions[${i}].etapes doit être une liste`); });
}
/* Leçons : un fichier par projet dans lecons/ ; chaque ligne qui commence par « - » suit le format. */
const FORMAT_LECON = /^- \d{4}-\d{2}-\d{2} · [^·]+ · problème : .+ · cause : .+ · règle : .+/;
for (const f of liste(path.join(RACINE, 'lecons')).filter(f => f.endsWith('.md'))) {
  fs.readFileSync(path.join(RACINE, 'lecons', f), 'utf8').split('\n').forEach((l, i) => {
    if (/^- /.test(l) && !FORMAT_LECON.test(l)) avert.push(`lecons/${f} ligne ${i + 1} : format « - AAAA-MM-JJ · projet · problème : … · cause : … · règle : … »`);
  });
}
if (fs.existsSync(path.join(RACINE, 'lecons.md'))) {
  let dansLecons = false; /* seules les lignes sous « ## Leçons » sont des leçons ; l'en-tête explique le format */
  fs.readFileSync(path.join(RACINE, 'lecons.md'), 'utf8').split('\n').forEach((l, i) => {
    if (/^## /.test(l)) dansLecons = /^## Leçons\s*$/.test(l);
    if (dansLecons && /^- /.test(l) && !/^- \d{4}-\d{2}-\d{2} · [^·]+ · problème : .+ · cause : .+ · règle : .+/.test(l)) avert.push(`lecons.md ligne ${i + 1} : format « - AAAA-MM-JJ · projet · problème : … · cause : … · règle : … »`);
  });
}
let medias = 0, octets = 0; for (const d of liste(path.join(RACINE, 'medias'))) for (const f of liste(path.join(RACINE, 'medias', d))) { medias++; octets += fs.statSync(path.join(RACINE, 'medias', d, f)).size; }
if (fs.existsSync(path.join(RACINE, 'index.json'))) { const s = fs.statSync(path.join(RACINE, 'index.json')).size; if (s > 150 * 1024) err.push(`index.json : ${Math.round(s / 1024)} Ko (max 150)`); }
console.log(`${liste(path.join(RACINE, 'maquettes')).length} maquettes, ${nSec} sections, ${modules.size} modules, ${medias} médias (${Math.round(octets / 1048576)} Mo)`);
avert.forEach(a => console.log('  avertissement : ' + a));
err.forEach(e => console.log('  ERREUR : ' + e));
process.exit(err.length ? 1 : 0);
