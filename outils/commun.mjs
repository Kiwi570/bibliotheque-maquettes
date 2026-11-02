// Fonctions partagées par les outils de la bibliothèque.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

export const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DOWNLOADS = path.resolve(RACINE, '..');
export const AUDIT = path.join(DOWNLOADS, 'audit-maquettes');
export const TAXO = JSON.parse(fs.readFileSync(path.join(RACINE, 'taxonomie.json'), 'utf8'));

export const lireJson = (f, defaut) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { if (defaut !== undefined) return defaut; throw new Error('JSON illisible : ' + f); } };
export const ecrireJson = (f, o, compact = false) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, compact ? 0 : 1) + '\n'); };

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.glb': 'model/gltf-binary', '.vtt': 'text/vtt', '.ics': 'text/calendar', '.pdf': 'application/pdf' };

// Serveur statique façon Vercel (cleanUrls, 404.html). Renvoie { url, fermer }.
export function servir(dossier, port = 0) {
  const root = path.resolve(dossier);
  const srv = http.createServer((req, rsp) => {
    let u; try { u = decodeURIComponent(req.url.split('?')[0].split('#')[0]); } catch { u = '/'; }
    const cands = u === '/' ? ['index.html'] : [u, u + '.html', path.join(u, 'index.html')];
    for (const c of cands) {
      const f = path.join(root, c);
      if (f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        rsp.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
        return fs.createReadStream(f).pipe(rsp);
      }
    }
    const nf = path.join(root, '404.html');
    rsp.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    rsp.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'introuvable');
  });
  return new Promise(ok => srv.listen(port, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}`, fermer: () => new Promise(r => srv.close(r)) })));
}

// Découpe un HTML en arbre d'éléments avec leurs lignes de début et de fin (1-indexées).
const VIDES = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
export function arbreHtml(src) {
  const debuts = [0]; for (let i = 0; i < src.length; i++) if (src[i] === '\n') debuts.push(i + 1);
  const ligne = i => { let a = 0, b = debuts.length - 1; while (a < b) { const m = (a + b + 1) >> 1; if (debuts[m] <= i) a = m; else b = m - 1; } return a + 1; };
  const racine = { tag: '#racine', enfants: [], attrs: {} }; const pile = [racine];
  const re = /<!--[\s\S]*?-->|<(script|style|template|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
  let m;
  while ((m = re.exec(src))) {
    const brut = m[0];
    if (brut.startsWith('<!--')) continue;
    if (m[1]) { const tag = m[1].toLowerCase(); pile.at(-1).enfants.push({ tag, attrs: attrs(brut.slice(0, brut.indexOf('>') + 1)), debut: ligne(m.index), fin: ligne(m.index + brut.length - 1), enfants: [] }); continue; }
    const tag = m[2].toLowerCase();
    if (brut.startsWith('</')) {
      for (let k = pile.length - 1; k > 0; k--) if (pile[k].tag === tag) { for (let j = pile.length - 1; j >= k; j--) pile[j].fin ??= ligne(m.index + brut.length - 1); pile.length = k; break; }
      continue;
    }
    const el = { tag, attrs: attrs(brut), debut: ligne(m.index), enfants: [] };
    pile.at(-1).enfants.push(el);
    if (VIDES.has(tag) || brut.endsWith('/>')) el.fin = ligne(m.index + brut.length - 1); else pile.push(el);
  }
  return racine;
}
function attrs(tagBrut) {
  const o = {}; const re = /\s([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g; let m;
  const corps = tagBrut.replace(/^<\/?[\w-]+/, '');
  while ((m = re.exec(corps))) o[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  return o;
}
export const signature = (tag, id, cls) => tag + (id ? '#' + id : '') + (cls ? '.' + cls.trim().split(/\s+/)[0] : '');

// Règles CSS avec leurs lignes : [{sel, debut, fin}] (les @media sont traversés).
export function reglesCss(src) {
  const debuts = [0]; for (let i = 0; i < src.length; i++) if (src[i] === '\n') debuts.push(i + 1);
  const ligne = i => { let a = 0, b = debuts.length - 1; while (a < b) { const m = (a + b + 1) >> 1; if (debuts[m] <= i) a = m; else b = m - 1; } return a + 1; };
  const sansCom = src.replace(/\/\*[\s\S]*?\*\//g, s => s.replace(/[^\n]/g, ' '));
  const out = []; let i = 0, depuis = 0; const pile = [];
  for (; i < sansCom.length; i++) {
    const c = sansCom[i];
    if (c === '{') { const sel = sansCom.slice(depuis, i).trim(); pile.push({ sel, debut: ligne(depuis + (sansCom.slice(depuis, i).length - sansCom.slice(depuis, i).trimStart().length)) }); depuis = i + 1; }
    else if (c === '}') { const r = pile.pop(); if (r && !r.sel.startsWith('@')) out.push({ sel: r.sel, debut: r.debut, fin: ligne(i) }); depuis = i + 1; }
    else if (c === ';' && !pile.length) depuis = i + 1;
  }
  return out;
}

export function plages(intervalles, ecart = 3) {
  const t = intervalles.slice().sort((a, b) => a[0] - b[0]); const p = [];
  for (const [a, b] of t) { const d = p.at(-1); if (d && a <= d[1] + ecart) d[1] = Math.max(d[1], b); else p.push([a, b]); }
  return p;
}
export const plagesTexte = (fichier, p) => p.length ? fichier + ':' + p.map(([a, b]) => a === b ? a : `${a}-${b}`).join(',') : null;

export const slug = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
