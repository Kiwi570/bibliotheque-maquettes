// Grille wouahou et journal d'un projet, relevés en fin de projet (lancé par ajouter.mjs, rien à faire à la main).
// node outils/grille.mjs <dépôt>
// - inventaire/<dépôt>-grille.json : forme du voile (data-forme de [data-voile] ; « propre » si une transition du projet
//   porte data-grille="voile" ; null pour une maquette d'avant la skill v10.2), intro qui finit sur la page (versObjet
//   dans assets/js), pages avec un objet d'ouverture (data-iris-centre) et pages qui portent chaque marque data-grille ;
// - journaux/<dépôt>.json : copie de _audit/journal.json du projet (temps réel par étape, attentes, modules, audit).
// Seules les pages de la langue principale comptent, hors 404 et pages légales (<main data-sans-effet>).
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, DOWNLOADS, lireJson, ecrireJson } from './commun.mjs';

const MARQUES = ['manipuler', 'fil', 'typo', 'scene', 'retour', 'voile'];
const EXCLUS = new Set(['_audit', '_partage', 'node_modules', '.git', '.vercel', 'source', 'outils', 'donnees', 'recu', 'assets']);

const depot = process.argv[2];
if (!depot || depot.startsWith('--')) { console.error('usage : node outils/grille.mjs <dépôt>'); process.exit(1); }
const DOS = path.join(DOWNLOADS, depot);
if (!fs.existsSync(DOS)) { console.error(`dépôt introuvable : ${DOS}`); process.exit(1); }

const pages = [];
const marcher = (d, rel = '') => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f), r = rel ? `${rel}/${f}` : f;
    if (fs.statSync(p).isDirectory()) { if (!EXCLUS.has(f) && !(rel === '' && /^[a-z]{2}$/.test(f))) marcher(p, r); continue; }
    if (!f.endsWith('.html') || r === '404.html') continue;
    const h = fs.readFileSync(p, 'utf8');
    const main = (h.match(/<main\b[^>]*>/i) || [''])[0];
    if (/data-sans-effet/.test(main)) continue;
    pages.push({ url: '/' + r.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '').replace(/\/$/, ''), h });
  }
};
marcher(DOS);
pages.sort((a, b) => (a.url === '/' ? -1 : b.url === '/' ? 1 : a.url.localeCompare(b.url)));
const accueil = pages.find((p) => p.url === '/') || pages[0];
const avec = (cle) => pages.filter((p) => new RegExp(`data-grille=["'][^"']*\\b${cle}\\b`).test(p.h)).map((p) => p.url);

const marques = Object.fromEntries(MARQUES.map((k) => [k, avec(k)]));
const balise = accueil ? (accueil.h.match(/<div\s+data-voile\b[^>]*>/i) || [])[0] : null;
let voile = balise ? ((balise.match(/\sdata-forme=["']([^"']+)["']/) || [])[1] || null) : null;
/* Une forme ajoutée par le projet à son socle (étoile de lydiacourtois…) est une transition propre. */
if (marques.voile.length || (voile && !['glisse', 'iris', 'vague', 'rideau'].includes(voile))) voile = 'propre';
let js = '';
const lireJs = (d) => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!['vendor', 'socle'].includes(f)) lireJs(p); } else if (/\.m?js$/.test(f)) js += fs.readFileSync(p, 'utf8'); } };
lireJs(path.join(DOS, 'assets', 'js'));
const releve = {
  depot, pages: pages.length, voile,
  intro_vers_objet: /\bversObjet\s*\(/.test(js),
  objet_ouverture: pages.filter((p) => /\sdata-iris-centre(?:=["'][^"']*["'])?(?=[\s>/])/.test(p.h)).map((p) => p.url),
  marques,
};
ecrireJson(path.join(RACINE, 'inventaire', `${depot}-grille.json`), releve);
const presentes = MARQUES.filter((k) => marques[k].length);
console.log(`${depot} : voile ${voile || 'non relevé (maquette d’avant la v10.2)'}, intro vers l’objet ${releve.intro_vers_objet ? 'oui' : 'non'}, objet d’ouverture sur ${releve.objet_ouverture.length}/${pages.length} page(s), marques : ${presentes.join(', ') || 'aucune'}`);

const fj = path.join(DOS, '_audit', 'journal.json');
if (fs.existsSync(fj)) {
  const j = lireJson(fj, null);
  if (!j || !Array.isArray(j.versions)) console.warn(`  journal illisible ou sans versions : ${path.relative(DOWNLOADS, fj)} (non copié)`);
  else { ecrireJson(path.join(RACINE, 'journaux', `${depot}.json`), j); console.log(`  journal copié : journaux/${depot}.json (${j.versions.length} version(s))`); }
} else console.log('  pas de journal (_audit/journal.json) : maquette d’avant la skill v10.3');
