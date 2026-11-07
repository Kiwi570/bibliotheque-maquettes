// Calcule images/emplacements.json : formats attendus par rôle d'image, tirés de la bibliothèque.
// node images/emplacements.mjs
//
// Sources : les sections notées 4 ou 5 (sections/*/*.json), dont on relit le HTML dans le dépôt de la maquette (lecture seule)
// pour mesurer les images (dimensions réelles du fichier, largeurs du srcset, version téléphone), et le champ images
// des modules (modules/*/module.json). Chaque rôle garde le ratio et les largeurs les plus fréquents, et dit d'où il vient.
// Grok ne produit que 1168×784 ou 784×1168 : le champ grok dit lequel demander et le recadrage reste fait par produire.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, ICI, DONNEES, ecrireJson } from './commun.mjs';
import { dimensions } from './dimensions.mjs';

const DL = path.dirname(RACINE);
// Rôle de section de la bibliothèque → rôle d'image du pipeline.
const ROLE = {
  ouverture: 'ouverture', decor: 'section-fond', manifeste: 'section-fond', appel: 'section-fond', contact: 'section-fond', 'transition-de-page': 'section-fond',
  services: 'carte-service', offre: 'carte-service', tarifs: 'carte-service', 'méthode': 'carte-service', 'étapes': 'carte-service',
  galerie: 'galerie', portfolio: 'galerie', 'équipe': 'portrait', 'témoignages': 'portrait', produits: 'produit',
  articles: 'vignette', preuves: 'vignette', agenda: 'vignette', 'page-404': '404',
};
const NOMS = [[1, 1], [5, 4], [4, 5], [4, 3], [3, 4], [3, 2], [2, 3], [16, 10], [16, 9], [9, 16], [2, 1], [21, 9]];
const nomRatio = r => { const [a, b] = NOMS.reduce((m, x) => Math.abs(Math.log(r / (x[0] / x[1]))) < Math.abs(Math.log(r / (m[0] / m[1]))) ? x : m); return Math.abs(Math.log(r / (a / b))) < 0.06 ? `${a}:${b}` : null; };
const PALIERS = [480, 640, 784, 800, 960, 1024, 1168, 1280, 1600, 1920, 2560];
const palier = w => PALIERS.reduce((m, x) => Math.abs(x - w) < Math.abs(m - w) ? x : m);

const stats = {};
const noter = (role, ratio, largeurs, mobile, origine) => {
  const s = stats[role] ||= { ratios: {}, largeurs: {}, mobile: 0, n: 0, maquettes: new Set(), modules: new Set() };
  s.n++;
  if (ratio) s.ratios[ratio] = (s.ratios[ratio] || 0) + 1;
  for (const w of new Set(largeurs.map(palier))) s.largeurs[w] = (s.largeurs[w] || 0) + 1;
  if (mobile) s.mobile++;
  (origine.startsWith('module:') ? s.modules : s.maquettes).add(origine.replace(/^module:/, ''));
};

// 1. Sections notées 4 ou 5.
let lues = 0, mesurees = 0;
for (const d of fs.readdirSync(path.join(RACINE, 'sections'))) {
  for (const f of fs.readdirSync(path.join(RACINE, 'sections', d))) {
    const s = JSON.parse(fs.readFileSync(path.join(RACINE, 'sections', d, f), 'utf8'));
    const role = ROLE[s.role];
    if (!role || s.note_qualite < 4 || !s.code?.html) continue;
    lues++;
    const [fichier, plage] = s.code.html.split(' ; ')[0].split(':');
    const fHtml = path.join(DL, s.maquette, fichier);
    if (!fs.existsSync(fHtml) || !plage) continue;
    const [a, b] = plage.split(',')[0].split('-').map(Number);
    const lignes = fs.readFileSync(fHtml, 'utf8').split('\n').slice(a - 1, (b || a)).join('\n');
    const mobile = /<source[^>]+media=["'][^"']*max-width[^>]*srcset=["'][^"']*mobile/i.test(lignes) || /-mobile-\d+\.webp/.test(lignes);
    for (const m of lignes.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const src = tag.match(/\bsrc=["']([^"'?#]+)/i)?.[1];
      if (!src || /\.svg$/i.test(src) || /^data:|^https?:/.test(src)) continue;
      const largeurs = [...(tag.match(/\bsrcset=["']([^"']+)/i)?.[1] || '').matchAll(/\s(\d+)w/g)].map(x => +x[1]);
      let w = +(tag.match(/\bwidth=["']?(\d+)/i)?.[1] || 0), h = +(tag.match(/\bheight=["']?(\d+)/i)?.[1] || 0);
      if (!w || !h) { const dim = (() => { try { return dimensions(path.join(DL, s.maquette, src.replace(/^\//, ''))); } catch { return null; } })(); if (dim) { w = dim.largeur; h = dim.hauteur; } }
      if (!w || !h) continue;
      if (role !== '404' && Math.max(w, h) < 300) continue;      // icône, pas une image de section
      noter(role, nomRatio(w / h), largeurs.length ? largeurs : [w], mobile, s.maquette);
      mesurees++;
    }
  }
}

// 2. Modules : rôle décrit en clair, ratio et largeur conseillés.
const ROLE_MODULE = [[/fond plein écran|fond de section|arrière-plan/i, 'section-fond'], [/ouverture|héros|hero/i, 'ouverture'], [/portrait|visage|équipe/i, 'portrait'],
  [/produit/i, 'produit'], [/vignette|carte résultat|miniature/i, 'vignette'], [/galerie|étape|photo|réalisation|œuvre/i, 'galerie'], [/service|prestation/i, 'carte-service']];
for (const m of fs.readdirSync(path.join(RACINE, 'modules'))) {
  const f = path.join(RACINE, 'modules', m, 'module.json');
  if (!fs.existsSync(f)) continue;
  for (const im of JSON.parse(fs.readFileSync(f, 'utf8')).images || []) {
    const role = ROLE_MODULE.find(([re]) => re.test(im.role))?.[1];
    const r = String(im.ratio || '').match(/(\d+)\s*:\s*(\d+)/);
    if (!role || !r) continue;
    noter(role, `${r[1]}:${r[2]}`, [im.largeur].filter(Boolean), /9:16/.test(im.ratio), `module:${m}`);
  }
}

// 3. Le plus fréquent par rôle.
const tri = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
const ZONE_TEXTE = new Set(['ouverture', 'section-fond', '404']);
const sortie = { _source: `Calculé par images/emplacements.mjs le ${new Date().toISOString().slice(0, 10)} : ${mesurees} images mesurées dans ${lues} sections notées 4 ou 5, plus le champ images des modules. Un champ ratio ou largeurs du plan l'emporte.` };
for (const role of ['ouverture', 'section-fond', 'carte-service', 'galerie', 'portrait', 'produit', 'vignette', '404']) {
  const s = stats[role];
  if (!s) continue;
  const ratio = tri(s.ratios)[0]?.[0] || '16:9';
  let largeurs = tri(s.largeurs).slice(0, 3).map(x => +x[0]).sort((a, b) => a - b);
  if (['ouverture', 'section-fond'].includes(role)) largeurs = [...new Set([640, 1280, 1920, ...largeurs.filter(w => w >= 1280)])].sort((a, b) => a - b).slice(0, 4);
  const [a, b] = ratio.split(':').map(Number);
  sortie[role] = {
    _source: `${s.n} images (${s.maquettes.size} maquettes${s.modules.size ? `, modules ${[...s.modules].join(', ')}` : ''}) ; ratios vus : ${tri(s.ratios).slice(0, 4).map(([k, v]) => `${k} ×${v}`).join(', ')}`,
    ratio, largeurs,
    ...(role === 'ouverture' || s.mobile / s.n > 0.3 ? { mobile: '9:16' } : {}),
    ...(ZONE_TEXTE.has(role) ? { zone_texte: true } : {}),
    grok: a >= b ? '1168×784' : '784×1168',
  };
}
sortie.logo = { _source: 'jamais recadré ni réduit en dessous de sa taille ; largeurs utiles pour un logo en image', ratio: null, largeurs: [240, 480], recadrer: false };
ecrireJson(path.join(DONNEES, 'emplacements.json'), sortie);
for (const [k, v] of Object.entries(sortie)) if (k !== '_source') console.log(`${k.padEnd(14)} ${String(v.ratio).padEnd(6)} ${v.largeurs.join(', ').padEnd(22)} ${v._source}`);
