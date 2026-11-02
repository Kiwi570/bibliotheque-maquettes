// Teste une page de démonstration (module ou assemblage) sur 13 formats (dont tablettes 768×1024 et 820×1180, et 1024×640), en mode réduit et sans WebGL.
// node outils/tester-module.mjs <module | chemin/vers/page.html> [--ecrire] [--medias]
//   --ecrire : reporte le résultat dans modules/<nom>/module.json (tests, poids_ko)
//   --medias : produit apercu.jpg (1440×900) et apercu.mp4 (si animé) dans le dossier du module
// Contrôles : erreurs console, CLS, débordement horizontal, éléments marqués [data-tient] coupés par l'écran
// (sous l'en-tête mesuré ou sous les barres du bas), texte < 12 px, cibles < 44 px, état final sous « réduire les animations ».
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { RACINE, servir, lireJson, ecrireJson } from './commun.mjs';

const arg = process.argv[2];
const ecrire = process.argv.includes('--ecrire');
const medias = process.argv.includes('--medias');
const estModule = !arg.endsWith('.html');
const fichier = estModule ? path.join(RACINE, 'modules', arg, 'index.html') : path.resolve(arg);
const relatif = '/' + path.relative(RACINE, fichier).split(path.sep).join('/');
// Tablettes (768×1024, 820×1180, tactiles) et 1024×640 : formats où un élément collant manque le plus souvent de hauteur.
const FORMATS = [[1000, 560], [1024, 640], [768, 1024, 1], [820, 1180, 1], [1280, 720], [1366, 768], [1440, 900], [1728, 1000], [1920, 1080], [2560, 1440], [390, 844, 1], [360, 780, 1], [320, 568, 1]];

const srv = await servir(RACINE);
const nav = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const attendre = ms => new Promise(r => setTimeout(r, ms));

async function parcourir(pg) {
  // Défile toute la page par paliers (déclenche les animations), contrôle à chaque palier, puis remonte.
  return pg.evaluate(async () => {
    const pause = ms => new Promise(r => setTimeout(r, ms));
    const pb = { coupes: new Set(), debord: 0, petits: new Set(), cibles: new Set() };
    const h = innerHeight; let y = 0;
    const lenis = window.__socleLenis;
    const max = () => document.documentElement.scrollHeight - h;
    const controle = () => {
      const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
      const bh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--barres-h')) || 0;
      // Un élément [data-tient] dans une section épinglée doit être entièrement visible pendant l'épinglage.
      for (const el of document.querySelectorAll('[data-tient]')) {
        const sec = el.closest('[data-epingle]');
        if (!sec || !sec.classList.contains('est-epingle')) continue;
        const r = el.getBoundingClientRect(); if (!r.height) continue;
        if (r.top < eh - 1 || r.bottom > h - bh + 1) pb.coupes.add((el.dataset.tient || el.className || el.tagName).toString().slice(0, 40) + ` (${Math.round(r.top)}→${Math.round(r.bottom)} / ${Math.round(eh)}-${Math.round(h - bh)})`);
      }
      const yy = scrollY; scrollTo(100000, yy); pb.debord = Math.max(pb.debord, scrollX); if (scrollX) scrollTo(0, yy);
    };
    while (y <= max()) { scrollTo(0, y); await pause(140); controle(); y += Math.round(h * 0.35); }
    scrollTo(0, max()); await pause(300); controle();
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('[aria-hidden="true"], .socle-sr')) continue;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (!r.width || cs.visibility === 'hidden' || cs.display === 'none') continue;
      const texte = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (texte && parseFloat(cs.fontSize) < 11.95) pb.petits.add(el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0] + ' ' + cs.fontSize);
      if (el.matches('a[href], button, [role="button"], input, select, summary, [tabindex="0"]') && (r.width < 43.5 || r.height < 43.5) && !el.closest('p, li > p')) pb.cibles.add(el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0] + ` ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    scrollTo(0, 0);
    return { coupes: [...pb.coupes].slice(0, 6), debord: pb.debord, petits: [...pb.petits].slice(0, 6), cibles: [...pb.cibles].slice(0, 6) };
  });
}

async function essai([w, h, mobile], opts = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: !!mobile, hasTouch: !!mobile, reducedMotion: opts.reduit ? 'reduce' : 'no-preference' });
  const pg = await ctx.newPage(); const erreurs = [];
  pg.on('pageerror', e => erreurs.push(e.message.slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) erreurs.push(m.text().slice(0, 160)); });
  await pg.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await pg.goto(srv.url + relatif + (opts.sansWebgl ? '?sanswebgl' : ''), { waitUntil: 'load' });
  await attendre(2500);
  const clsChargement = await pg.evaluate(() => window.__cls);
  const r = await parcourir(pg);
  let invisibles = [];
  if (opts.reduit) invisibles = await pg.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main p, main img, main [data-tient]')].filter(e => { const cs = getComputedStyle(e); return e.getBoundingClientRect().width && (parseFloat(cs.opacity) < .99 || cs.visibility === 'hidden'); }).map(e => e.tagName.toLowerCase() + '.' + (e.className || '').toString().split(' ')[0]).slice(0, 6));
  await ctx.close();
  return { format: `${w}×${h}`, erreurs, cls: +clsChargement.toFixed(3), ...r, invisibles };
}

const resultats = [];
for (const f of FORMATS) resultats.push(await essai(f));
const reduit = [await essai([1440, 900], { reduit: true }), await essai([390, 844, 1], { reduit: true })];
const sansWebgl = await essai([1440, 900], { sansWebgl: true });
const tous = [...resultats, ...reduit, sansWebgl];
const erreurs = [...new Set(tous.flatMap(r => r.erreurs))];
const clsMax = Math.max(...tous.map(r => r.cls));
const html = fs.readFileSync(fichier, 'utf8');
const usesWebgl = /webgl|OGL|ogl/.test(html + (estModule ? fs.readFileSync(path.join(path.dirname(fichier), 'module.js'), 'utf8') : ''));
const tests = {
  formats: resultats.every(r => !r.coupes.length && r.debord <= 1) ? 'ok' : 'échec : ' + resultats.filter(r => r.coupes.length || r.debord > 1).map(r => `${r.format} ${r.coupes.join(', ')}${r.debord > 1 ? ' débord ' + r.debord + 'px' : ''}`).join(' ; '),
  'reduire-animations': reduit.every(r => !r.invisibles.length && !r.erreurs.length && !r.coupes.length) ? 'ok' : 'échec : ' + reduit.map(r => r.invisibles.join(',')).join(' ; '),
  'sans-webgl': usesWebgl ? (!sansWebgl.erreurs.length && !sansWebgl.coupes.length ? 'ok' : 'échec : ' + sansWebgl.erreurs.join(', ')) : 'n/a',
  console: erreurs.length ? `${erreurs.length} erreur${erreurs.length > 1 ? 's' : ''} : ${erreurs.slice(0, 2).join(' | ')}` : '0 erreur',
  cls: clsMax,
  'texte-12px': [...new Set(tous.flatMap(r => r.petits))].length ? 'échec : ' + [...new Set(tous.flatMap(r => r.petits))].slice(0, 3).join(', ') : 'ok',
  'cibles-44px': [...new Set(tous.flatMap(r => r.cibles))].length ? 'échec : ' + [...new Set(tous.flatMap(r => r.cibles))].slice(0, 3).join(', ') : 'ok',
};
for (const r of tous) if (r.coupes.length || r.debord > 1 || r.erreurs.length || r.cls >= .1) console.log('  ' + r.format, JSON.stringify({ coupes: r.coupes, debord: r.debord, erreurs: r.erreurs, cls: r.cls }));
console.log(JSON.stringify(tests, null, 1));

if (medias && estModule && !process.argv.includes('--garder-video')) {
  const dos = path.dirname(fichier);
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: path.join(RACINE, 'inventaire', 'brut'), size: { width: 1440, height: 900 } } });
  const pg = await ctx.newPage(); const t0 = Date.now();
  await pg.goto(srv.url + relatif, { waitUntil: 'load' }); await attendre(2600);
  // Capture : le module à l'écran (au milieu de son épinglage s'il est épinglé).
  await pg.evaluate(async () => { const m = document.querySelector('[data-module]'); if (!m) return; const st = window.ScrollTrigger?.getAll().find(s => s.pin); const y = st ? st.start + (st.end - st.start) * 0.4 : Math.max(0, m.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0)); scrollTo(0, y); await new Promise(r => setTimeout(r, 1400)); });
  let q = 80, buf = await pg.screenshot({ type: 'jpeg', quality: q }); while (buf.length > 300 * 1024 && q > 50) { q -= 6; buf = await pg.screenshot({ type: 'jpeg', quality: q }); }
  fs.writeFileSync(path.join(dos, 'apercu.jpg'), buf);
  // Démonstration : on part juste avant le module et on le parcourt (fin de l'épinglage comprise), 7 s au plus.
  const [y0, y1] = await pg.evaluate(() => { const m = document.querySelector('[data-module]'); const max = document.documentElement.scrollHeight - innerHeight;
    if (!m) return [0, max]; const top = m.getBoundingClientRect().top + scrollY; const pins = (window.ScrollTrigger?.getAll() || []).filter(s => s.pin && m.contains(s.pin));
    const fin = pins.length ? Math.max(...pins.map(s => s.end)) : top + m.offsetHeight - innerHeight * .6; return [Math.max(0, Math.min(max, top - innerHeight * .5)), Math.max(0, Math.min(max, fin))]; });
  await pg.evaluate(y => scrollTo(0, y), y0); await attendre(600);
  const duree = Math.min(6400, Math.max(2500, (y1 - y0) * 1.6));
  await pg.evaluate(([y0, y1, duree]) => new Promise(ok => { const t0 = performance.now(); const pas = () => { const k = Math.min(1, (performance.now() - t0) / duree); scrollTo(0, y0 + (y1 - y0) * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)); k < 1 ? requestAnimationFrame(pas) : ok(); }; requestAnimationFrame(pas); }), [y0, y1, duree]);
  const debutFilm = (Date.now() - t0) / 1000 - duree / 1000 - 0.8;
  await attendre(400);
  await ctx.close();
  const video = await pg.video().path();
  const out = path.join(dos, 'apercu.mp4');
  const dureeTotale = Math.min(8, (Date.now() - t0) / 1000 - debutFilm);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, debutFilm).toFixed(2)), '-i', video, '-t', String(Math.max(4, dureeTotale)), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  fs.rmSync(video, { force: true });
  console.log(`apercu.jpg ${Math.round(buf.length / 1024)} Ko, apercu.mp4 ${Math.round(fs.statSync(out).size / 1024)} Ko`);
}
await nav.close(); await srv.fermer();

if (ecrire && estModule) {
  const dos = path.dirname(fichier); const mj = lireJson(path.join(dos, 'module.json'));
  const poids = ['module.css', 'module.js'].reduce((s, f) => s + fs.statSync(path.join(dos, f)).size, 0);
  mj.poids_ko = Math.round(poids / 102.4) / 10;
  mj.tests = tests;
  ecrireJson(path.join(dos, 'module.json'), mj);
}
const ok = Object.values(tests).every(v => typeof v === 'number' ? v < 0.1 : /^(ok|n\/a|0 erreur)$/.test(v));
process.exit(ok ? 0 : 1);
