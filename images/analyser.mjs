// Analyse les images reçues, sans jamais les modifier : sujet et cadrage, zones calmes, qualité, doublons, texte lisible.
// node images/analyser.mjs <dossier> [--sortie <dossier>/analyse.json]
//
// - sujet : visages (Vision de macOS), sinon corps, sinon objets saillants ; à défaut, contraste et contours.
//   Rectangle en % de l'image ; cadrage [cx, cy] en %, à reporter dans c.media({ nom, cadrage: 'cx% cy%' }).
// - zones calmes : gauche, droite, haut, bas, avec un score de 0 à 1 (texte lisible au-dessus) et le ton (clair, sombre).
// - qualité : netteté, bruit, blocs de compression, dimensions ; drapeau faible si l'image ne tiendra pas en grand.
// - doublons et quasi-doublons (empreinte perceptuelle) : la meilleure est gardée, les autres notées.
// - lisible : texte, étiquette, écran ou document lisible (lecture de texte de Vision), utile pour les métiers au secret.
// - planches contact <dossier>/planche.jpg (puis planche-2.jpg…, 20 images par planche) : nom, dimensions, drapeaux,
//   rectangle du sujet et croix du cadrage, pour tout regarder en une fois.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { args, lireJson, ecrireJson, empreinte, hamming, vision, arrondi, EXT_IMAGES } from './commun.mjs';

const { pos, opts } = args();
if (!pos[0]) { console.error('usage : node images/analyser.mjs <dossier> [--sortie <dossier>/analyse.json]'); process.exit(1); }
const DOSSIER = path.resolve(pos[0]);
const SORTIE = path.resolve(typeof opts.sortie === 'string' ? opts.sortie : path.join(DOSSIER, 'analyse.json'));
const recup = lireJson(path.join(DOSSIER, 'recuperation.json'), { images: [] });
const parFichier = new Map(recup.images.map(i => [i.fichier, i]));
const fichiers = fs.readdirSync(DOSSIER).filter(f => EXT_IMAGES.test(f) && !/^planche(-\d+)?\.jpg$/.test(f)).sort((a, b) => {
  const ia = recup.images.findIndex(i => i.fichier === a), ib = recup.images.findIndex(i => i.fichier === b);
  return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib) || a.localeCompare(b);
});
if (!fichiers.length) { console.error(`aucune image dans ${DOSSIER}`); process.exit(1); }

const borne = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));
const RATIOS = [[1, 1], [5, 4], [4, 3], [3, 2], [16, 10], [16, 9], [2, 1], [21, 9], [3, 1]];
function nomRatio(r) {
  for (const [a, b] of RATIOS) for (const [x, y] of a === b ? [[a, b]] : [[a, b], [b, a]]) if (Math.abs(r / (x / y) - 1) < 0.025) return `${x}:${y}`;
  return String(arrondi(r, 2));
}
const union = bs => {
  const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y));
  return { x: x0, y: y0, l: Math.max(...bs.map(b => b.x + b.l)) - x0, h: Math.max(...bs.map(b => b.y + b.h)) - y0 };
};
const net = b => ({ x: arrondi(borne(b.x)), y: arrondi(borne(b.y)), l: arrondi(borne(b.l, 0, 100 - borne(b.x))), h: arrondi(borne(b.h, 0, 100 - borne(b.y))) });

// Carte de saillance maison (secours sans Vision) : contours + écart de couleur à la moyenne, léger poids au centre.
function saillanceMaison(rgb, w, h) {
  const n = w * h, lum = new Float32Array(n), s = new Float32Array(n);
  let mr = 0, mg = 0, mb = 0;
  for (let i = 0; i < n; i++) { mr += rgb[i * 3]; mg += rgb[i * 3 + 1]; mb += rgb[i * 3 + 2]; lum[i] = 0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2]; }
  mr /= n; mg /= n; mb /= n;
  let mx = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = lum[i + 1] - lum[i - 1], gy = lum[i + w] - lum[i - w];
    const c = Math.hypot(rgb[i * 3] - mr, rgb[i * 3 + 1] - mg, rgb[i * 3 + 2] - mb);
    const dc = Math.hypot((x / w - 0.5) * 1.2, (y / h - 0.5) * 1.2);
    s[i] = (Math.hypot(gx, gy) * 0.6 + c * 0.8) * (1.15 - dc * 0.5);
    if (s[i] > mx) mx = s[i];
  }
  // Barycentre et boîte des points au-dessus de 45 % du maximum, après lissage grossier par cases de 8 px.
  const cw = Math.ceil(w / 8), ch = Math.ceil(h / 8), cases = new Float32Array(cw * ch);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cases[(y >> 3) * cw + (x >> 3)] += s[y * w + x];
  const cm = Math.max(...cases);
  let sx = 0, sy = 0, st = 0, x0 = cw, y0 = ch, x1 = 0, y1 = 0;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const v = cases[y * cw + x];
    if (v < cm * 0.45) continue;
    sx += v * (x + 0.5); sy += v * (y + 0.5); st += v;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  if (!st) return { boite: { x: 25, y: 25, l: 50, h: 50 }, cx: 50, cy: 50 };
  return { boite: { x: x0 / cw * 100, y: y0 / ch * 100, l: (x1 - x0 + 1) / cw * 100, h: (y1 - y0 + 1) / ch * 100 }, cx: sx / st / cw * 100, cy: sy / st / ch * 100 };
}

function sujetEtCadrage(v, rgb, w, h) {
  const visages = (v?.visages || []).filter(f => f.confiance >= 0.5 && f.l >= 2.5);
  const corps = (v?.corps || []).filter(c => c.confiance >= 0.6 && c.l * c.h >= 300);
  // Visage petit dans une scène (moins de 12 % de la largeur) : le sujet est la personne entière, pas la tête.
  if (visages.length && corps.length && Math.max(...visages.map(f => f.l)) < 12) {
    const u = union(corps), f = union(visages);
    return { sujet: { ...net(u), source: 'corps' }, cadrage: [f.x + f.l / 2, (f.y + f.h / 2 + u.y + u.h * 0.4) / 2], visages: visages.length };
  }
  if (visages.length) {
    const u = union(visages);
    // Tête entière et épaules : cheveux au-dessus, menton et cou en dessous.
    const fw = Math.max(...visages.map(f => f.l)), fh = Math.max(...visages.map(f => f.h));
    return { sujet: { ...net({ x: u.x - fw * 0.6, y: u.y - fh * 0.75, l: u.l + fw * 1.2, h: u.h + fh * 1.9 }), source: 'visage' }, cadrage: [u.x + u.l / 2, u.y + u.h / 2], visages: visages.length };
  }
  if (corps.length) {
    const u = union(corps);
    return { sujet: { ...net(u), source: 'corps' }, cadrage: [u.x + u.l / 2, u.y + u.h * 0.3], visages: 0 };
  }
  if (v?.objets?.length || v?.attention) {
    const objets = (v.objets || []).filter(o => o.l * o.h >= 300).sort((a, b) => b.confiance - a.confiance);
    let boite = objets.length ? union(objets.slice(0, 3)) : null;
    const a = v.attention;
    // Objets trop petits (un détail) ou toute l'image : la carte d'attention dit mieux où regarder.
    if (a && (!boite || boite.l * boite.h > 8500 || (boite.l * boite.h < 800 && a.l * a.h > boite.l * boite.h * 2))) boite = { x: a.x, y: a.y, l: a.l, h: a.h };
    const cx = a ? borne(a.cx, boite.x, boite.x + boite.l) : boite.x + boite.l / 2;
    const cy = a ? borne(a.cy, boite.y, boite.y + boite.h) : boite.y + boite.h / 2;
    return { sujet: { ...net(boite), source: 'saillance' }, cadrage: [(cx + boite.x + boite.l / 2) / 2, (cy + boite.y + boite.h / 2) / 2], visages: 0 };
  }
  const m = saillanceMaison(rgb, w, h);
  return { sujet: { ...net(m.boite), source: 'contrastes' }, cadrage: [m.cx, m.cy], visages: 0 };
}

// Zones calmes : peu de contours, luminance régulière, et pas sur le sujet.
function zonesCalmes(lum, w, h, sujet) {
  const grad = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1];
    const gy = lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1];
    grad[i] = Math.hypot(gx, gy) / 4;
  }
  const bandes = { gauche: [0, 0, 0.4, 1], droite: [0.6, 0, 1, 1], haut: [0, 0, 1, 0.35], bas: [0, 0.65, 1, 1] };
  return Object.entries(bandes).map(([cote, [a, b, c, d]]) => {
    let sg = 0, sl = 0, sl2 = 0, n = 0;
    for (let y = Math.max(1, Math.floor(b * h)); y < Math.min(h - 1, Math.ceil(d * h)); y++) for (let x = Math.max(1, Math.floor(a * w)); x < Math.min(w - 1, Math.ceil(c * w)); x++) {
      const i = y * w + x; sg += grad[i]; sl += lum[i]; sl2 += lum[i] * lum[i]; n++;
    }
    const detail = sg / n, moy = sl / n, ecart = Math.sqrt(Math.max(0, sl2 / n - moy * moy));
    const ix = Math.max(0, Math.min(c * 100, sujet.x + sujet.l) - Math.max(a * 100, sujet.x)), iy = Math.max(0, Math.min(d * 100, sujet.y + sujet.h) - Math.max(b * 100, sujet.y));
    const recouvre = (ix * iy) / ((c - a) * (d - b) * 10000);
    const score = borne(1 - Math.min(1, detail / 22) * 0.55 - Math.min(1, ecart / 65) * 0.25 - recouvre * 0.35, 0, 1);
    return { cote, score: arrondi(score, 2), ton: moy > 160 ? 'clair' : moy < 95 ? 'sombre' : 'moyen', recouvre_sujet: arrondi(recouvre, 2) };
  }).sort((x, y) => y.score - x.score);
}

// Qualité, mesurée à la taille d'affichage en grand (1280 px) pour la netteté, en taille réelle pour bruit et blocs.
async function qualite(fichier, meta, logo = false) {
  const affichage = await sharp(fichier, { failOn: 'none' }).rotate().flatten({ background: '#fff' }).resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { data: g, info } = affichage, w = info.width, h = info.height;
  // Netteté : écart type du laplacien par cases de 64 px, 90e centile (une photo nette garde des cases détaillées).
  const T = 64, vals = [];
  for (let ty = 0; ty + T <= h; ty += T) for (let tx = 0; tx + T <= w; tx += T) {
    let s = 0, s2 = 0, n = 0;
    for (let y = ty + 1; y < ty + T - 1; y++) for (let x = tx + 1; x < tx + T - 1; x++) {
      const i = y * w + x, l = g[i - 1] + g[i + 1] + g[i - w] + g[i + w] - 4 * g[i];
      s += l; s2 += l * l; n++;
    }
    vals.push(Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)));
  }
  vals.sort((a, b) => a - b);
  const nettete = vals.length ? vals[Math.floor(vals.length * 0.9)] : 0;
  // Bruit (méthode d'Immerkær) et blocs de compression JPEG, sur un extrait central en taille réelle.
  const L = Math.min(meta.width, 1024), H = Math.min(meta.height, 1024);
  const reel = await sharp(fichier, { failOn: 'none' }).rotate().flatten({ background: '#fff' }).extract({ left: Math.floor((meta.width - L) / 2), top: Math.floor((meta.height - H) / 2), width: L, height: H }).greyscale().raw().toBuffer();
  let sb = 0, nb = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < L - 1; x++) {
    const i = y * L + x;
    const v = reel[i - L - 1] - 2 * reel[i - L] + reel[i - L + 1] - 2 * reel[i - 1] + 4 * reel[i] - 2 * reel[i + 1] + reel[i + L - 1] - 2 * reel[i + L] + reel[i + L + 1];
    if (Math.abs(v) < 40) { sb += Math.abs(v); nb++; }      // zones planes seulement : les contours ne sont pas du bruit
  }
  const bruit = nb ? Math.sqrt(Math.PI / 2) * sb / (6 * nb) : 0;
  let bord = 0, nbord = 0, dedans = 0, ndedans = 0;
  for (let y = 0; y < H; y++) for (let x = 1; x < L; x++) {
    const d = Math.abs(reel[y * L + x] - reel[y * L + x - 1]);
    if (x % 8 === 0) { bord += d; nbord++; } else { dedans += d; ndedans++; }
  }
  const blocs = meta.format === 'jpeg' && ndedans && dedans > 0 ? (bord / nbord) / (dedans / ndedans) : 1;
  const raisons = [];
  if (meta.width < 1280 && !logo) raisons.push(`${meta.width} px de large`);
  if (nettete < 6 && !logo) raisons.push('floue');
  if (blocs > 1.45) raisons.push('compression visible');
  if (bruit > 6) raisons.push('bruit');
  return { nettete: arrondi(nettete), bruit: arrondi(bruit, 2), compression: arrondi(blocs, 2), faible: raisons.length > 0, raisons };
}

function lisible(v) {
  const blocs = (v?.texte || []).filter(t => t.confiance >= 0.5 && (t.texte.match(/[\p{L}\p{N}]/gu) || []).length >= 3);
  const car = blocs.reduce((s, t) => s + t.texte.length, 0);
  if (car < 6) return false;
  return { texte: blocs.map(t => t.texte).join(' · ').slice(0, 160), blocs: blocs.length, surface: arrondi(blocs.reduce((s, t) => s + t.l * t.h, 0) / 100, 1) };
}

async function main() {
  console.log(`Analyse de ${fichiers.length} images dans ${DOSSIER}`);
  const raster = fichiers.filter(f => !/\.svg$/i.test(f));
  const vis = vision(raster.map(f => path.join(DOSSIER, f)));
  const resultats = [];
  for (const f of fichiers) {
    const chemin = path.join(DOSSIER, f), r = parFichier.get(f);
    try {
      const meta = await sharp(chemin, { failOn: 'none' }).metadata();
      const largeur = meta.autoOrient?.width ?? meta.width, hauteur = meta.autoOrient?.height ?? meta.height;
      const base = { fichier: f, nom: f.replace(/\.\w+$/, ''), drapeau: r?.drapeau || null, largeur, hauteur, ratio: nomRatio(largeur / hauteur), ratio_valeur: arrondi(largeur / hauteur, 3),
        orientation: largeur / hauteur > 1.05 ? 'paysage' : largeur / hauteur < 0.95 ? 'portrait' : 'carre', format: meta.format, poids: fs.statSync(chemin).size, transparence: !!meta.hasAlpha };
      if (meta.format === 'svg') { resultats.push({ ...base, sujet: null, cadrage: [50, 50], cadrage_css: '50% 50%', zones_calmes: [], qualite: null, lisible: null, drapeaux: ['svg'] }); console.log(`OK ${f} (svg)`); continue; }
      const petit = await sharp(chemin, { failOn: 'none' }).rotate().flatten({ background: '#fff' }).resize({ width: 256, height: 256, fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const { data: rgb, info } = petit, w = info.width, h = info.height;
      const lum = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) lum[i] = 0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2];
      const v = vis?.get(path.resolve(chemin));
      const { sujet, cadrage, visages } = sujetEtCadrage(v, rgb, w, h);
      const cad = cadrage.map(c => Math.round(borne(c)));
      const e = { ...base, sujet, visages, cadrage: cad, cadrage_css: `${cad[0]}% ${cad[1]}%`, zones_calmes: zonesCalmes(lum, w, h, sujet),
        qualite: await qualite(chemin, { ...meta, width: largeur, height: hauteur }, r?.drapeau === 'logo'), lisible: vis ? lisible(v) : null,
        empreinte: await empreinte(chemin), couleur: [...(await sharp(chemin, { failOn: 'none' }).rotate().flatten({ background: '#fff' }).resize(6, 6, { fit: 'fill' }).removeAlpha().raw().toBuffer())] };
      resultats.push(e);
      console.log(`OK ${f} sujet ${sujet.source} ${e.cadrage_css}${e.qualite.faible ? ` faible (${e.qualite.raisons.join(', ')})` : ''}${e.lisible ? ' texte' : ''}`);
    } catch (err) {
      console.log(`ECHEC ${f} : ${err.message}`);
      resultats.push({ fichier: f, erreur: err.message, drapeaux: ['illisible'] });
    }
  }

  // Doublons (empreinte quasi identique) et quasi-doublons (proches, même teinte générale) : garder la meilleure.
  const valeur = e => e.largeur * e.hauteur * (e.qualite?.faible ? 0.5 : 1) * (1 + Math.min(e.qualite?.nettete || 0, 30) / 30);
  const avecEmpreinte = resultats.filter(e => e.empreinte).sort((a, b) => valeur(b) - valeur(a));
  const doublons = [];
  for (let i = 0; i < avecEmpreinte.length; i++) {
    const a = avecEmpreinte[i];
    if (a.doublon_de) continue;
    for (let j = i + 1; j < avecEmpreinte.length; j++) {
      const b = avecEmpreinte[j];
      if (b.doublon_de) continue;
      // Couleurs sur une grille 6 × 6 : deux produits de teintes différentes sur le même fond ne sont pas des doublons.
      const d = hamming(a.empreinte, b.empreinte), ecarts = a.couleur.map((c, k) => Math.abs(c - b.couleur[k]));
      const dc = ecarts.reduce((s, x) => s + x, 0) / ecarts.length, pire = Math.max(...ecarts);
      const dr = Math.abs(a.ratio_valeur / b.ratio_valeur - 1);
      if ((d <= 4 && dr < 0.08 && dc < 20 && pire < 45) || (d <= 10 && dc < 9 && pire < 45 && dr < 0.2)) {
        b.doublon_de = { fichier: a.fichier, type: d <= 4 ? 'doublon' : 'quasi-doublon', distance: d };
        doublons.push({ garder: a.fichier, ecarter: b.fichier, type: b.doublon_de.type, distance: d });
      }
    }
  }
  for (const e of resultats) {
    if (!e.empreinte) continue;
    const d = [];
    if (e.drapeau) d.push(e.drapeau);
    if (e.visages) d.push(e.visages > 1 ? `${e.visages} visages` : 'visage');
    if (e.qualite.faible) d.push(...e.qualite.raisons.map(r => /px de large/.test(r) ? 'petite' : r));
    if (e.lisible) d.push('texte');
    if (e.doublon_de) d.push(`${e.doublon_de.type} de ${e.doublon_de.fichier}`);
    const calme = e.zones_calmes.filter(z => z.score >= 0.65).map(z => z.cote);
    if (calme.length) d.push(`calme ${calme.join('/')}`);
    e.drapeaux = d;
    delete e.couleur;
  }

  // Planches contact : 20 images (5 × 4) par planche.
  const planches = [];
  const PAR = 20, COL = 5, CW = 312, TH = 234, LEG = 78, G = 8;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coupe = (s, n) => s.length > n ? `${s.slice(0, n - 1)}…` : s;
  for (let p = 0; p * PAR < resultats.length; p++) {
    const lot = resultats.slice(p * PAR, (p + 1) * PAR), lignes = Math.ceil(lot.length / COL);
    const W = COL * CW + (COL + 1) * G, H = lignes * (TH + LEG) + (lignes + 1) * G;
    const calques = [];
    for (const [k, e] of lot.entries()) {
      const x = G + (k % COL) * (CW + G), y = G + Math.floor(k / COL) * (TH + LEG + G), num = p * PAR + k + 1;
      let vignette, vw = CW, vh = TH;
      try {
        const buf = await sharp(path.join(DOSSIER, e.fichier), { failOn: 'none' }).rotate().resize({ width: CW, height: TH, fit: 'inside' }).flatten({ background: '#d8d8d8' }).png().toBuffer({ resolveWithObject: true });
        vignette = buf.data; vw = buf.info.width; vh = buf.info.height;
      } catch { vignette = null; }
      const ox = x + Math.floor((CW - vw) / 2), oy = y + Math.floor((TH - vh) / 2);
      calques.push({ input: { create: { width: CW, height: TH, channels: 3, background: '#d8d8d8' } }, left: x, top: y });
      if (vignette) calques.push({ input: vignette, left: ox, top: oy });
      const alerte = (e.drapeaux || []).some(d => /faible|floue|petite|compression|bruit|texte|doublon|illisible/.test(d));
      let svg = '';
      if (e.sujet) {
        const s = e.sujet;
        svg += `<rect x="${ox + s.x / 100 * vw}" y="${oy + s.y / 100 * vh}" width="${s.l / 100 * vw}" height="${s.h / 100 * vh}" fill="none" stroke="#ffe600" stroke-width="2.5"/>`;
        svg += `<rect x="${ox + s.x / 100 * vw}" y="${oy + s.y / 100 * vh}" width="${s.l / 100 * vw}" height="${s.h / 100 * vh}" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="4 4"/>`;
        const cx = ox + e.cadrage[0] / 100 * vw, cy = oy + e.cadrage[1] / 100 * vh;
        svg += `<g stroke-width="3" stroke="#000"><line x1="${cx - 9}" y1="${cy}" x2="${cx + 9}" y2="${cy}"/><line x1="${cx}" y1="${cy - 9}" x2="${cx}" y2="${cy + 9}"/></g>`;
        svg += `<g stroke-width="1.5" stroke="#ff2d55"><line x1="${cx - 8}" y1="${cy}" x2="${cx + 8}" y2="${cy}"/><line x1="${cx}" y1="${cy - 8}" x2="${cx}" y2="${cy + 8}"/></g>`;
      }
      const ty = y + TH;
      svg += `<rect x="${x}" y="${ty}" width="${CW}" height="${LEG}" fill="${alerte ? '#fff1ec' : '#ffffff'}"/>`;
      svg += `<text x="${x + 8}" y="${ty + 21}" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#111">${esc(coupe(`${num}. ${e.nom || e.fichier}`, 32))}</text>`;
      svg += `<text x="${x + 8}" y="${ty + 42}" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#333">${esc(e.largeur ? `${e.largeur}×${e.hauteur} · ${e.ratio} · ${Math.round(e.poids / 1024)} Ko` : 'illisible')}</text>`;
      svg += `<text x="${x + 8}" y="${ty + 64}" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="${alerte ? '#b3261e' : '#2f5d50'}">${esc(coupe((e.drapeaux || []).join(' · '), 44))}</text>`;
      calques.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`), left: 0, top: 0 });
    }
    const nom = p ? `planche-${p + 1}.jpg` : 'planche.jpg';
    await sharp({ create: { width: W, height: H, channels: 3, background: '#f2f2f2' } }).composite(calques).jpeg({ quality: 82 }).toFile(path.join(DOSSIER, nom));
    planches.push(nom);
  }
  for (let p = planches.length + 1; fs.existsSync(path.join(DOSSIER, `planche-${p}.jpg`)); p++) fs.rmSync(path.join(DOSSIER, `planche-${p}.jpg`));

  ecrireJson(SORTIE, { dossier: DOSSIER, date: new Date().toISOString(), detection: vis ? 'Vision (macOS) + mesures sharp' : 'mesures sharp seulement', planches,
    legende_planche: 'cadre jaune : sujet ; croix rouge : cadrage ; fond rose : à vérifier', doublons, images: resultats });
  const n = k => resultats.filter(e => e.drapeaux?.some(d => d.startsWith(k))).length;
  console.log(`\n${resultats.length} images : ${n('visage') + n('2 ') + n('3 ')} avec visage, ${resultats.filter(e => e.qualite?.faible).length} faibles, ${n('texte')} avec texte, ${doublons.length} doublons ou quasi-doublons.`);
  const court = f => { const r = path.relative(process.cwd(), f); return r.startsWith('..') ? f : r; };
  console.log(`Écrit : ${court(SORTIE)} ; planches : ${planches.map(p => court(path.join(DOSSIER, p))).join(', ')}`);
}
main().catch(e => { console.error(`ECHEC : ${e.stack || e.message}`); process.exit(1); });
