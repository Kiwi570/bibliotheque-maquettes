// Images de partage 1200×630 de chaque page : photo du client, voile aux couleurs du site, logo, accroche dans la police des titres.
// node images/partage.mjs [--racine .] [--pages accueil,a-propos]
//
// - Lit donnees/site.json (couleurs, nom, langues), donnees/textes/<langue>.json (pages.<cle>.accroche), source/pages/*.mjs
//   (cle, partage: false, imagePartage), donnees/images.json (sujet, zones calmes, rôle, page) et le logo d'assets/images/.
// - Image de la page : imagePartage de la page, sinon l'entrée de images.json avec "page": "<cle>" et le rôle ouverture,
//   sinon la première ouverture.
// - Deux gabarits, choisis d'après le sujet et la zone calme : « photo à droite » (texte à gauche, sur fond uni) et
//   « plein cadre » (bandeau bas en dégradé, seulement si le sujet reste au-dessus du bandeau). Le texte n'est jamais sur le sujet.
// - Écrit _partage/<cle>-<langue>.html (à ajuster à la main si besoin : avec data-ajuste sur <html>, il n'est plus réécrit)
//   et assets/partage/<cle>-<langue>.jpg (JPG qualité 80, jamais de WebP pour le partage), et _partage/partage.json :
//   boîte du sujet telle que rendue, boîtes du texte et du logo, recouvrement en px² (doit valoir 0). Remplace outils/images-partage.mjs du socle.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { args, lireJson } from './commun.mjs';

const { opts } = args();
const RACINE = path.resolve(typeof opts.racine === 'string' ? opts.racine : '.');
const site = lireJson(path.join(RACINE, 'donnees', 'site.json'));
if (!site) { console.error(`donnees/site.json introuvable dans ${RACINE}`); process.exit(1); }
const images = lireJson(path.join(RACINE, 'donnees', 'images.json'), {});
const langues = site.langues || ['fr'];
const textes = Object.fromEntries(langues.map(l => [l, lireJson(path.join(RACINE, 'donnees', 'textes', `${l}.json`), {})]));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Pages : déclarations des gabarits, sinon les clés de textes.
const dosPages = path.join(RACINE, 'source', 'pages');
let pages = fs.existsSync(dosPages) ? fs.readdirSync(dosPages).filter(f => f.endsWith('.mjs')).map(f => {
  const m = fs.readFileSync(path.join(dosPages, f), 'utf8').match(/export const page\s*=\s*\{([^}]*)\}/);
  if (!m) return null;
  const champ = k => m[1].match(new RegExp(`\\b${k}\\s*:\\s*(['"])(.*?)\\1`))?.[2];
  const ls = m[1].match(/langues\s*:\s*\[([^\]]*)\]/)?.[1].match(/['"]([a-z-]+)['"]/g)?.map(x => x.slice(1, -1));
  return { cle: champ('cle'), imagePartage: champ('imagePartage'), partage: !/partage\s*:\s*false/.test(m[1]), langues: ls };
}).filter(p => p?.cle && p.partage) : Object.keys(textes[langues[0]].pages || {}).map(cle => ({ cle, partage: true }));
if (typeof opts.pages === 'string') pages = pages.filter(p => opts.pages.split(',').includes(p.cle));

// Logo lisible sur le fond : variante claire sur fond sombre, sombre sur fond clair, sinon le logo principal.
const lumFond = (() => { const h = (site.couleurs?.fond || '#ffffff').replace('#', ''); const v = h.length === 3 ? h.split('').map(c => c + c) : h.match(/../g); const [r, g, b] = v.map(x => parseInt(x, 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; })();
const dosImages = path.join(RACINE, 'assets', 'images');
const logos = fs.existsSync(dosImages) ? fs.readdirSync(dosImages).filter(f => /^logo(-(clair|sombre))?(-\d+)?\.(svg|webp|png)$/.test(f)) : [];
const prefere = lumFond < 0.4 ? /clair/ : /sombre/;
const logo = logos.find(f => prefere.test(f) && f.endsWith('.svg')) || logos.filter(f => prefere.test(f)).sort((a, b) => (+(b.match(/-(\d+)\./)?.[1]) || 0) - (+(a.match(/-(\d+)\./)?.[1]) || 0))[0]
  || ['logo.svg', 'logo-480.webp', 'logo-240.webp', 'logo.webp', 'logo.png'].find(f => logos.includes(f));
const fichierDe = nom => {
  const e = images[nom];
  if (!e) return fs.existsSync(path.join(RACINE, 'assets', 'images', nom)) ? nom : null;
  const L = e.largeurs?.find(w => w >= 1200) || e.largeurs?.[e.largeurs.length - 1];
  return L ? `${nom}-${L}.webp` : e.fichiers?.[0];
};
function imagePour(p) {
  if (p.imagePartage) {
    const nom = p.imagePartage.replace(/-\d+\.webp$/, '');
    return { fichier: fichierDe(p.imagePartage) || fichierDe(nom), e: images[nom] };
  }
  const liste = Object.values(images).filter(e => e.role !== 'logo');
  const e = liste.find(x => x.page === p.cle && x.role === 'ouverture') || liste.find(x => x.page === p.cle) || liste.find(x => x.role === 'ouverture') || liste[0];
  return e ? { fichier: fichierDe(e.nom), e } : { fichier: null, e: null };
}

// Choix du gabarit et position de la photo, en pixels de la carte, pour vérifier que le sujet évite le texte.
function disposer(e, W0, H0) {
  const s = e?.sujet || { x: 30, y: 30, l: 40, h: 40 };
  const r = W0 / H0;
  // Plein cadre 1200×630 : décalage vertical pour garder le sujet au-dessus du bandeau (bas 38 %).
  const hImg = 1200 / r;                                   // hauteur rendue (largeur pleine si l'image est moins large que 1,9:1)
  if (hImg >= 630) {
    const bas = (s.y + s.h) / 100 * hImg, haut = s.y / 100 * hImg;
    const decal = Math.max(0, Math.min(hImg - 630, haut - 40));       // sujet le plus haut possible
    const basRendu = bas - decal;
    const calmeBas = (e?.zones_calmes || []).find(z => z.cote === 'bas')?.score ?? 0.4;
    if (basRendu <= 630 * 0.6 && calmeBas >= 0.35) return { gabarit: 'plein', position: `50% ${hImg > 630 ? Math.round(decal / (hImg - 630) * 100) : 50}%` };
  }
  // Photo à droite (600×630) : le sujet centré dans sa moitié.
  const wImg = 630 * r;
  const cx = (s.x + s.l / 2) / 100 * wImg;
  const decal = Math.max(0, Math.min(wImg - 600, cx - 300));
  // Voile de raccord (dégradé du fond sur le bord gauche de la photo) : il s'arrête avant le sujet, et disparaît sous 24 px.
  const gauche = wImg > 600 ? s.x / 100 * wImg - decal : s.x / 100 * 600;
  const voile = Math.max(0, Math.min(90, Math.round(gauche - 8)));
  return { gabarit: 'droite', position: `${wImg > 600 ? Math.round(decal / (wImg - 600) * 100) : 50}% ${Math.round(s.y + s.h / 2)}%`, voile: voile < 24 ? 0 : voile };
}

const sujetAttr = d => d.sujet ? ` data-sujet="${[d.sujet.x, d.sujet.y, d.sujet.l, d.sujet.h].join(',')}"` : '';
// Mesure dans la page rendue : boîte du sujet (object-fit: cover et object-position compris) contre les boîtes du texte, du logo et du voile.
function mesurer() {
  const img = document.querySelector('.pg-photo[data-sujet]');
  const textes = [...document.querySelectorAll('.pg-accroche, .pg-nom, .pg-logo, .pg-voile')].map(x => x.getBoundingClientRect()).filter(r => r.width && r.height);
  if (!img || !img.naturalWidth) return { sujet: null, recouvrement: 0 };
  const [sx, sy, sl, sh] = img.dataset.sujet.split(',').map(Number);
  const b = img.getBoundingClientRect(), k = Math.max(b.width / img.naturalWidth, b.height / img.naturalHeight);
  const W = img.naturalWidth * k, H = img.naturalHeight * k;
  const [px, py] = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
  const ox = b.left + (b.width - W) * px, oy = b.top + (b.height - H) * py;
  const x0 = Math.max(b.left, ox + sx / 100 * W), y0 = Math.max(b.top, oy + sy / 100 * H);
  const x1 = Math.min(b.right, ox + (sx + sl) / 100 * W), y1 = Math.min(b.bottom, oy + (sy + sh) / 100 * H);
  const sujet = { x: Math.round(x0), y: Math.round(y0), l: Math.round(x1 - x0), h: Math.round(y1 - y0) };
  let rec = 0;
  for (const r of textes) rec += Math.max(0, Math.min(r.right, x1) - Math.max(r.left, x0)) * Math.max(0, Math.min(r.bottom, y1) - Math.max(r.top, y0));
  return { sujet, textes: textes.map(r => ({ x: Math.round(r.left), y: Math.round(r.top), l: Math.round(r.width), h: Math.round(r.height) })), recouvrement: Math.round(rec) };
}

function html(p, l, img, d) {
  const T = textes[l].pages?.[p.cle] || {};
  const accroche = T.accroche || T.titre || site.nom;
  const fond = site.couleurs?.fond || '#111', texte = site.couleurs?.texte || '#fff';
  const commun = `<!doctype html><!-- Image de partage ${p.cle} (${l}), gabarit ${d.gabarit}. Pour garder ce fichier tel quel, ajouter data-ajuste sur la balise html. -->
<html lang="${l}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/socle.css"><link rel="stylesheet" href="/assets/css/site.css">
<style>:root{--fond:${fond};--texte:${texte}}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--fond);color:var(--texte)}
.pg-carte{position:relative;width:1200px;height:630px;overflow:hidden}
.pg-photo{position:absolute;object-fit:cover;object-position:${d.position}}
.pg-logo{height:64px;width:auto;max-width:280px;object-fit:contain;object-position:left center;display:block}
.pg-accroche{font-family:var(--police-titres, Georgia, serif);font-size:${accroche.length > 60 ? 50 : 62}px;line-height:1.04;margin:0;text-wrap:balance;letter-spacing:-.01em}
.pg-nom{font-size:22px;font-weight:600;margin:0;opacity:.85}
</style></head><body><div class="pg-carte">`;
  if (d.gabarit === 'plein') return `${commun}
<img class="pg-photo" src="/assets/images/${img}" alt=""${sujetAttr(d)} style="inset:0;width:1200px;height:630px">
<div style="position:absolute;inset:auto 0 0 0;height:300px;background:linear-gradient(to top, color-mix(in srgb, var(--fond) 96%, transparent) 0%, color-mix(in srgb, var(--fond) 82%, transparent) 55%, transparent 100%)"></div>
<div style="position:absolute;left:64px;right:64px;bottom:48px;display:flex;align-items:flex-end;justify-content:space-between;gap:40px">
  <div style="display:grid;gap:14px;max-width:820px"><p class="pg-accroche">${esc(accroche)}</p><p class="pg-nom">${esc(site.nom)}</p></div>
  ${logo ? `<img class="pg-logo" src="/assets/images/${logo}" alt="">` : ''}
</div></div></body></html>`;
  return `${commun}
<div style="position:absolute;inset:0 600px 0 0;display:flex;flex-direction:column;justify-content:space-between;padding:56px 56px 52px 64px">
  ${logo ? `<img class="pg-logo" src="/assets/images/${logo}" alt="">` : '<span></span>'}
  <p class="pg-accroche">${esc(accroche)}</p>
  <p class="pg-nom">${esc(site.nom)}</p>
</div>
${img ? `<img class="pg-photo" src="/assets/images/${img}" alt=""${sujetAttr(d)} style="left:600px;top:0;width:600px;height:630px">
${d.voile ?? 90 ? `<div class="pg-voile" style="position:absolute;left:600px;top:0;width:${d.voile ?? 90}px;height:630px;background:linear-gradient(to right, var(--fond), transparent)"></div>` : ''}` : ''}
</div></body></html>`;
}

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const serveur = createServer((req, res) => {
  const p = path.join(RACINE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(RACINE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  res.end(fs.readFileSync(p));
}).listen(0);
const port = serveur.address().port;
const nav = await chromium.launch();
const onglet = await nav.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
fs.mkdirSync(path.join(RACINE, '_partage'), { recursive: true });
fs.mkdirSync(path.join(RACINE, 'assets', 'partage'), { recursive: true });
const { default: sharp } = await import('sharp');
let n = 0;
const rapport = [];
for (const p of pages) {
  for (const l of p.langues || langues) {
    const { fichier: img, e } = imagePour(p);
    let d = { gabarit: 'droite', position: '50% 50%' };
    if (img) { const m = await sharp(path.join(RACINE, 'assets', 'images', img)).metadata(); d = { ...disposer(e, m.width, m.height), sujet: e?.sujet || null }; }
    const fHtml = path.join(RACINE, '_partage', `${p.cle}-${l}.html`);
    if (!(fs.existsSync(fHtml) && /<html[^>]*\bdata-ajuste/.test(fs.readFileSync(fHtml, 'utf8')))) fs.writeFileSync(fHtml, html(p, l, img, d));
    await onglet.goto(`http://localhost:${port}/_partage/${p.cle}-${l}.html`, { waitUntil: 'networkidle' });
    await onglet.evaluate(() => document.fonts.ready);
    const sortie = path.join(RACINE, 'assets', 'partage', `${p.cle}-${l}.jpg`);
    await onglet.screenshot({ path: sortie, type: 'jpeg', quality: 80 });
    const m = await onglet.evaluate(mesurer);
    const poids = fs.statSync(sortie).size;
    rapport.push({ page: p.cle, langue: l, fichier: `assets/partage/${p.cle}-${l}.jpg`, gabarit: d.gabarit, image: img, poids, ...m });
    console.log(`${m.recouvrement ? 'A VERIFIER' : 'OK'} assets/partage/${p.cle}-${l}.jpg (${d.gabarit}${img ? `, ${img}` : ', sans photo'}, ${Math.round(poids / 1024)} Ko)${m.recouvrement ? ` : texte sur le sujet (${m.recouvrement} px²)` : ''}`);
    n++;
  }
}
await nav.close();
serveur.close();
fs.writeFileSync(path.join(RACINE, '_partage', 'partage.json'), JSON.stringify(rapport, null, 2) + '\n');
console.log(`\n${n} images de partage. Gabarits modifiables : _partage/*.html`);
