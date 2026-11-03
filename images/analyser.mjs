// Analyse les images reçues, sans jamais les modifier : sujet et cadrage, zones calmes, qualité, doublons, texte lisible.
// node images/analyser.mjs <dossier> [--sortie <dossier>/analyse.json]
//
// - sujet : visages (Vision de macOS), sinon corps (sauf scène de mains), sinon objets saillants ; à défaut, contraste et contours.
//   Rectangle en % de l'image ; cadrage [cx, cy] en %, à reporter dans c.media({ nom, cadrage: 'cx% cy%' }).
// - zones calmes : gauche, droite, haut, bas, avec un score de 0 à 1 (texte lisible au-dessus) et le ton (clair, sombre).
// - qualité : netteté, bruit, blocs de compression, dimensions ; drapeau faible si l'image ne tiendra pas en grand.
// - doublons et quasi-doublons (empreinte perceptuelle, puis corrélation des contours) : la meilleure est gardée, les autres notées.
// - lisible : texte lu dans l'image (Vision), en trois niveaux : document ou écran (à écarter pour les métiers au secret),
//   marque ou filigrane (à vérifier), texte décoratif (broderie, enseigne, étiquette de produit : rien à faire).
//   --marques "Nom, Autre" ajoute des noms de marque à reconnaître (en plus du site et des logos de recuperation.json).
// - planches contact <dossier>/planche.jpg (puis planche-2.jpg…, 20 images par planche) : nom, dimensions, drapeaux,
//   rectangle du sujet et croix du cadrage, pour tout regarder en une fois.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { args, lireJson, ecrireJson, empreinte, hamming, vision, arrondi, slug, planche, EXT_IMAGES } from './commun.mjs';

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
  // Visage petit dans une scène (moins de 15 % de la largeur) : le sujet est la personne entière, pas la tête.
  // Plus de corps que de visages (un collègue de dos) : le cadrage vise le groupe, pas le seul visage vu.
  if (visages.length && corps.length && Math.max(...visages.map(f => f.l)) < 15) {
    const u = union(corps), f = union(visages);
    const cadrage = corps.length > visages.length ? [u.x + u.l / 2, u.y + u.h * 0.3] : [f.x + f.l / 2, (f.y + f.h / 2 + u.y + u.h * 0.4) / 2];
    return { sujet: { ...net(u), source: 'corps' }, cadrage, visages: visages.length };
  }
  if (visages.length) {
    const u = union(visages);
    // Tête entière et épaules : cheveux au-dessus, menton et cou en dessous.
    const fw = Math.max(...visages.map(f => f.l)), fh = Math.max(...visages.map(f => f.h));
    const epaules = fh > 20 ? 0.6 : 1.15;   // gros plan : les épaules sont juste sous le menton
    return { sujet: { ...net({ x: u.x - fw * 0.6, y: u.y - fh * 0.75, l: u.l + fw * 1.2, h: u.h + fh * (0.75 + epaules) }), source: 'visage' }, cadrage: [u.x + u.l / 2, u.y + u.h / 2], visages: visages.length };
  }
  // Sans visage mais avec des mains : scène de gestes (mains, avant-bras), Vision y voit un « corps » ; la carte d'attention dit mieux où est le sujet.
  if (corps.length && !(v?.mains?.length && v?.attention)) {
    const u = union(corps);
    return { sujet: { ...net(u), source: 'corps' }, cadrage: [u.x + u.l / 2, u.y + u.h * 0.3], visages: 0 };
  }
  if (v?.objets?.length || v?.attention) {
    const recouvre = (o, a) => a ? Math.max(0, Math.min(o.x + o.l, a.x + a.l) - Math.max(o.x, a.x)) * Math.max(0, Math.min(o.y + o.h, a.y + a.h) - Math.max(o.y, a.y)) / (o.l * o.h) : 1;
    // Objet peu sûr (confiance < 0,5) : gardé seulement s'il recouvre la carte d'attention (sinon c'est un coin de décor).
    const objets = (v.objets || []).filter(o => o.l * o.h >= 300 && (o.confiance >= 0.5 || recouvre(o, v.attention) >= 0.3)).sort((a, b) => b.confiance - a.confiance);
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

// Corrélation des contours (64 × 64, recadrages centrés de 100 à 88 %) : 1 = même image, même recadrée ou recompressée.
const BORDS = new Map();
async function bords(f, c) {
  const cle = `${f}|${c}`;
  if (BORDS.has(cle)) return BORDS.get(cle);
  const N = 64, m = await sharp(f, { failOn: 'none' }).rotate().metadata();
  const W = m.autoOrient?.width || m.width, H = m.autoOrient?.height || m.height;
  const { data } = await sharp(f, { failOn: 'none' }).rotate().flatten({ background: '#fff' })
    .extract({ left: Math.round(W * (1 - c) / 2), top: Math.round(H * (1 - c) / 2), width: Math.round(W * c), height: Math.round(H * c) })
    .resize(N, N, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const g = new Float32Array(N * N);
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; g[i] = Math.hypot(data[i + 1] - data[i - 1], data[i + N] - data[i - N]); }
  BORDS.set(cle, g);
  return g;
}
function correlation(a, b) {
  let ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { ma += a[i]; mb += b[i]; }
  ma /= a.length; mb /= b.length;
  let s = 0, sa = 0, sb = 0;
  for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; s += x * y; sa += x * x; sb += y * y; }
  return sa && sb ? s / Math.sqrt(sa * sb) : 0;
}
async function ressemblance(fa, fb) {
  let mieux = -1;
  for (const c of [1, 0.96, 0.92, 0.88]) mieux = Math.max(mieux, correlation(await bords(fa, 1), await bords(fb, c)), correlation(await bords(fa, c), await bords(fb, 1)));
  return mieux;
}

// Texte lu dans l'image, en trois niveaux :
// - document : document, écran, dossier ou étiquette administrative lisible (à écarter pour les métiers au secret) ;
// - marque : marque, signature ou filigrane posé sur la photo (à vérifier : il ne doit pas rester sur le site) ;
// - decoratif : broderie, enseigne, étiquette de produit, texte qui fait partie du sujet (rien à faire).
const MARQUES = new Set();
{
  const mots = s => slug(s, 99, 9999).split('-').filter(m => m.length >= 4 && !/^(logo|clair|sombre|blanc|noir|paysage|services?|groupe|www|https?)$/.test(m));
  try { for (const m of mots(new URL(recup.site).hostname.replace(/^www\./, '').split('.')[0])) MARQUES.add(m); } catch {}
  for (const i of recup.images) if (i.drapeau === 'logo') for (const m of mots(i.nom.replace(/^logo-?/, ''))) MARQUES.add(m);
  if (typeof opts.marques === 'string') for (const m of mots(opts.marques)) MARQUES.add(m);
}
const SIGNE_MARQUE = /(©|®|™|\bwww\.|https?:|\.(fr|com|ch|be|net|org|eu)\b|@[a-z]|\bphoto(graphie|graphy)?\b|\bstudio\b|\bcopyright\b)/i;
const SIGNE_DOCUMENT = /(\b\d{2}[ .]\d{2}[ .]\d{2}[ .]\d{2}\b|[\w.-]+@[\w-]+\.\w+|\b(dossier|patient|client|n[ée]e? le|nom\s?:|pr[ée]nom|adresse|facture|ordonnance|confidentiel|total|date\s?:|iban|n°\s?\d)\b)/i;
function lisible(v, lum, w, h, logo) {
  const blocs = (v?.texte || []).filter(t => t.confiance >= 0.5 && (t.texte.match(/[\p{L}\p{N}]/gu) || []).length >= 3);
  const car = blocs.reduce((s, t) => s + t.texte.length, 0);
  if (car < 6) return false;
  const norm = t => t.texte.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const vus = blocs.reduce((m, t) => m.set(norm(t), (m.get(norm(t)) || 0) + 1), new Map());
  const pale = t => {   // texte peu contrasté sur son fond : la marque d'un filigrane
    const x0 = Math.floor(t.x / 100 * w), y0 = Math.floor(t.y / 100 * h), x1 = Math.ceil((t.x + t.l) / 100 * w), y1 = Math.ceil((t.y + t.h) / 100 * h);
    if ((x1 - x0) * (y1 - y0) < 24) return false;
    let s = 0, s2 = 0, n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const l = lum[y * w + x]; s += l; s2 += l * l; n++; }
    return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)) < 9;
  };
  const details = blocs.map(t => {
    const mots = slug(t.texte, 99, 9999).split('-');
    const niveau = SIGNE_DOCUMENT.test(t.texte) ? 'document'
      : (SIGNE_MARQUE.test(t.texte) || mots.some(m => MARQUES.has(m)) || [...MARQUES].some(m => norm(t).includes(m)) || vus.get(norm(t)) >= 2 || pale(t)) ? 'marque' : 'decoratif';
    return { texte: t.texte, niveau };
  });
  // Le filigrane répété ne compte pas comme document : seuls les autres blocs disent s'il y a un texte à lire.
  const autres = blocs.filter((t, i) => details[i].niveau !== 'marque');
  const carAutres = autres.reduce((s, t) => s + t.texte.length, 0);
  const petits = autres.filter(t => t.h < 3.5).length;
  let niveau = (petits >= 5 && carAutres >= 60) || carAutres >= 160 || details.filter(d => d.niveau === 'document').length >= 2 ? 'document'
    : details.some(d => d.niveau === 'marque') ? 'marque' : 'decoratif';
  if (logo) niveau = 'logo';
  return { niveau, a_verifier: niveau === 'document' || niveau === 'marque', texte: blocs.map(t => t.texte).join(' · ').slice(0, 160), blocs: blocs.length,
    surface: arrondi(blocs.reduce((s, t) => s + t.l * t.h, 0) / 100, 1), details: details.slice(0, 12) };
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
        qualite: await qualite(chemin, { ...meta, width: largeur, height: hauteur }, r?.drapeau === 'logo'), lisible: vis ? lisible(v, lum, w, h, r?.drapeau === 'logo') : null,
        empreinte: await empreinte(chemin), couleur: [...(await sharp(chemin, { failOn: 'none' }).rotate().flatten({ background: '#fff' }).resize(6, 6, { fit: 'fill' }).removeAlpha().raw().toBuffer())] };
      resultats.push(e);
      console.log(`OK ${f} sujet ${sujet.source} ${e.cadrage_css}${e.qualite.faible ? ` faible (${e.qualite.raisons.join(', ')})` : ''}${e.lisible ? ` texte ${e.lisible.niveau}` : ''}`);
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
      // Présélection large (empreinte, teinte, ratio), puis confirmation par corrélation des contours à 64 px, tolérante
      // à un recadrage de 12 % : deux produits différents sur le même fond (même carton, même studio) restent sous 0,6.
      const d = hamming(a.empreinte, b.empreinte), ecarts = a.couleur.map((c, k) => Math.abs(c - b.couleur[k]));
      const dc = ecarts.reduce((s, x) => s + x, 0) / ecarts.length;
      const dr = Math.abs(a.ratio_valeur / b.ratio_valeur - 1);
      if (d > 16 || dc > 25 || dr > 0.2) continue;
      const sim = await ressemblance(path.join(DOSSIER, a.fichier), path.join(DOSSIER, b.fichier));
      if (sim >= 0.8) {
        b.doublon_de = { fichier: a.fichier, type: sim >= 0.95 ? 'doublon' : 'quasi-doublon', distance: d, ressemblance: arrondi(sim, 2) };
        doublons.push({ garder: a.fichier, ecarter: b.fichier, type: b.doublon_de.type, distance: d, ressemblance: arrondi(sim, 2) });
      }
    }
  }
  for (const e of resultats) {
    if (!e.empreinte) continue;
    const d = [];
    if (e.drapeau) d.push(e.drapeau);
    if (e.visages) d.push(e.visages > 1 ? `${e.visages} visages` : 'visage');
    if (e.qualite.faible) d.push(...e.qualite.raisons.map(r => /px de large/.test(r) ? 'petite' : r));
    if (e.lisible) d.push({ document: 'document lisible', marque: 'filigrane ou marque', decoratif: 'texte décoratif', logo: 'texte du logo' }[e.lisible.niveau]);
    if (e.doublon_de) d.push(`${e.doublon_de.type} de ${e.doublon_de.fichier}`);
    const calme = e.zones_calmes.filter(z => z.score >= 0.65).map(z => z.cote);
    if (calme.length) d.push(`calme ${calme.join('/')}`);
    e.drapeaux = d;
    delete e.couleur;
  }

  // Planches contact : 20 images (5 × 4) par planche.
  const ALERTE = /faible|floue|petite|compression|bruit|document lisible|filigrane|doublon|illisible/;
  const planches = await planche(DOSSIER, resultats.map(e => ({ fichier: e.fichier, titre: e.nom || e.fichier, sujet: e.sujet, cadrage: e.cadrage,
    ligne: e.largeur ? `${e.largeur}×${e.hauteur} · ${e.ratio} · ${Math.round(e.poids / 1024)} Ko` : 'illisible',
    drapeaux: e.drapeaux || [], alerte: (e.drapeaux || []).some(d => ALERTE.test(d)) })));

  ecrireJson(SORTIE, { dossier: DOSSIER, date: new Date().toISOString(), detection: vis ? 'Vision (macOS) + mesures sharp' : 'mesures sharp seulement', planches,
    legende_planche: 'cadre jaune : sujet ; croix rouge : cadrage ; fond rose : à vérifier', doublons, images: resultats });
  const n = k => resultats.filter(e => e.drapeaux?.some(d => d.startsWith(k))).length;
  console.log(`\n${resultats.length} images : ${resultats.filter(e => e.visages).length} avec visage, ${resultats.filter(e => e.qualite?.faible).length} faibles, texte : ${n('document')} document, ${n('filigrane')} filigrane ou marque, ${n('texte d')} décoratif ; ${doublons.length} doublons ou quasi-doublons.`);
  const court = f => { const r = path.relative(process.cwd(), f); return r.startsWith('..') ? f : r; };
  console.log(`Écrit : ${court(SORTIE)} ; planches : ${planches.map(p => court(path.join(DOSSIER, p))).join(', ')}`);
}
main().catch(e => { console.error(`ECHEC : ${e.stack || e.message}`); process.exit(1); });
