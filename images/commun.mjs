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
