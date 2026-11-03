// Outils partagés par les commandes du pipeline d'images.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const ICI = path.dirname(fileURLToPath(import.meta.url));
export const RACINE = path.dirname(ICI);
export const EXT_IMAGES = /\.(jpe?g|png|webp|gif|avif|svg|tiff?|heic)$/i;
sharp.cache(false);

export function args(argv = process.argv.slice(2)) {
  const pos = [], opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) opts[k] = argv[++i]; else opts[k] = true;
    } else pos.push(a);
  }
  return { pos, opts };
}

export const lireJson = (f, defaut) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return defaut; } };
export const ecrireJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };

// Mots vides retirés des noms de fichier.
const VIDES = new Set('le la les l de des du d un une et a au aux en pour sur avec dans par ou the of and to in for with on at an notre nos votre vos mon ma mes son sa ses ce cet cette ces qui que'.split(' '));
export function slug(texte, mots = 4, max = 40) {
  const s = String(texte || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').toLowerCase()
    .replace(/['’]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(m => m && !VIDES.has(m));
  let r = s.slice(0, mots).join('-');
  if (r.length > max) r = r.slice(0, max).replace(/-[^-]*$/, '') || r.slice(0, max);
  return r;
}

// Empreinte perceptuelle (dHash 64 bits) et distance de Hamming.
export async function empreinte(entree) {
  const { data } = await sharp(entree, { failOn: 'none', animated: false }).flatten({ background: '#fff' }).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  let h = 0n;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) h = (h << 1n) | (data[y * 9 + x] < data[y * 9 + x + 1] ? 1n : 0n);
  return h.toString(16).padStart(16, '0');
}
export function hamming(a, b) {
  let x = BigInt('0x' + a) ^ BigInt('0x' + b), n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
}

// Détection locale par le framework Vision de macOS (compilé une fois dans images/.cache).
export function vision(fichiers) {
  if (process.platform !== 'darwin' || !fichiers.length) return null;
  const bin = path.join(ICI, '.cache', 'vision'), src = path.join(ICI, 'vision.swift');
  try {
    if (!fs.existsSync(bin) || fs.statSync(bin).mtimeMs < fs.statSync(src).mtimeMs) {
      fs.mkdirSync(path.dirname(bin), { recursive: true });
      execFileSync('swiftc', ['-O', src, '-o', bin], { stdio: 'ignore' });
    }
    const res = new Map();
    for (let i = 0; i < fichiers.length; i += 40) {
      const out = execFileSync(bin, fichiers.slice(i, i + 40), { encoding: 'utf8', maxBuffer: 64e6 });
      for (const l of out.split('\n').filter(Boolean)) { const o = JSON.parse(l); res.set(path.resolve(o.fichier), o); }
    }
    return res;
  } catch (e) {
    console.warn(`  Vision indisponible (${e.message.split('\n')[0]}) : analyse par contrastes seulement`);
    return null;
  }
}

export const ko = n => `${Math.round(n / 1024)} Ko`;
export const arrondi = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

// Planches contact : 20 images (5 × 4) par planche, nom, ligne d'infos, drapeaux ; cadre jaune = sujet, croix rouge = cadrage.
// elements : [{ fichier, titre, ligne, drapeaux: [], alerte: bool, sujet?, cadrage?, boites?: [{ x, y, l, h, couleur }] }]
export async function planche(dossier, elements, prefixe = 'planche') {
  const planches = [];
  const PAR = 20, COL = 5, CW = 312, TH = 234, LEG = 78, G = 8;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coupe = (s, n) => s.length > n ? `${s.slice(0, n - 1)}…` : s;
  for (let p = 0; p * PAR < elements.length; p++) {
    const lot = elements.slice(p * PAR, (p + 1) * PAR), lignes = Math.ceil(lot.length / COL);
    const W = COL * CW + (COL + 1) * G, H = lignes * (TH + LEG) + (lignes + 1) * G;
    const calques = [];
    for (const [k, e] of lot.entries()) {
      const x = G + (k % COL) * (CW + G), y = G + Math.floor(k / COL) * (TH + LEG + G), num = p * PAR + k + 1;
      let vignette = null, vw = CW, vh = TH;
      try {
        const buf = await sharp(path.join(dossier, e.fichier), { failOn: 'none' }).rotate().resize({ width: CW, height: TH, fit: 'inside' }).flatten({ background: '#d8d8d8' }).png().toBuffer({ resolveWithObject: true });
        vignette = buf.data; vw = buf.info.width; vh = buf.info.height;
      } catch {}
      const ox = x + Math.floor((CW - vw) / 2), oy = y + Math.floor((TH - vh) / 2);
      calques.push({ input: { create: { width: CW, height: TH, channels: 3, background: '#d8d8d8' } }, left: x, top: y });
      if (vignette) calques.push({ input: vignette, left: ox, top: oy });
      let svg = '';
      const rect = (b, couleur) => `<rect x="${ox + b.x / 100 * vw}" y="${oy + b.y / 100 * vh}" width="${b.l / 100 * vw}" height="${b.h / 100 * vh}" fill="none" stroke="${couleur}" stroke-width="2.5"/>`
        + `<rect x="${ox + b.x / 100 * vw}" y="${oy + b.y / 100 * vh}" width="${b.l / 100 * vw}" height="${b.h / 100 * vh}" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="4 4"/>`;
      if (e.sujet) svg += rect(e.sujet, '#ffe600');
      for (const b of e.boites || []) svg += rect(b, b.couleur || '#ff2d55');
      if (e.cadrage) {
        const cx = ox + e.cadrage[0] / 100 * vw, cy = oy + e.cadrage[1] / 100 * vh;
        svg += `<g stroke-width="3" stroke="#000"><line x1="${cx - 9}" y1="${cy}" x2="${cx + 9}" y2="${cy}"/><line x1="${cx}" y1="${cy - 9}" x2="${cx}" y2="${cy + 9}"/></g>`;
        svg += `<g stroke-width="1.5" stroke="#ff2d55"><line x1="${cx - 8}" y1="${cy}" x2="${cx + 8}" y2="${cy}"/><line x1="${cx}" y1="${cy - 8}" x2="${cx}" y2="${cy + 8}"/></g>`;
      }
      const ty = y + TH;
      svg += `<rect x="${x}" y="${ty}" width="${CW}" height="${LEG}" fill="${e.alerte ? '#fff1ec' : '#ffffff'}"/>`;
      svg += `<text x="${x + 8}" y="${ty + 21}" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#111">${esc(coupe(`${num}. ${e.titre}`, 32))}</text>`;
      svg += `<text x="${x + 8}" y="${ty + 42}" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#333">${esc(coupe(e.ligne || '', 44))}</text>`;
      svg += `<text x="${x + 8}" y="${ty + 64}" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="${e.alerte ? '#b3261e' : '#2f5d50'}">${esc(coupe((e.drapeaux || []).join(' · '), 44))}</text>`;
      calques.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`), left: 0, top: 0 });
    }
    const nom = p ? `${prefixe}-${p + 1}.jpg` : `${prefixe}.jpg`;
    await sharp({ create: { width: W, height: H, channels: 3, background: '#f2f2f2' } }).composite(calques).jpeg({ quality: 82 }).toFile(path.join(dossier, nom));
    planches.push(nom);
  }
  for (let p = Math.max(2, planches.length + 1); fs.existsSync(path.join(dossier, `${prefixe}-${p}.jpg`)); p++) fs.rmSync(path.join(dossier, `${prefixe}-${p}.jpg`));
  return planches;
}
