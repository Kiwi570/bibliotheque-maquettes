// Teste une page de démonstration (module ou assemblage) sur 14 formats (dont tablettes 768×1024, 820×1180 et 1180×820, et 1024×640), et sans WebGL.
// node outils/tester-module.mjs <module | chemin/vers/page.html> [--ecrire] [--captures] [--medias]
//   --ecrire : reporte le résultat dans modules/<nom>/module.json (tests, poids_ko)
//   --captures : captures de la page (1440×900, 820×1180, 390×844 ; haut de page puis chaque [data-module]) dans <dossier>/captures/
//   --medias : produit apercu.jpg (1440×900) et apercu.mp4 (si animé, ou le scénario s'il existe) dans le dossier du module
// Contrôles : erreurs console, CLS, débordement horizontal, éléments marqués [data-tient] coupés par l'écran
// (sous l'en-tête mesuré ou sous les barres du bas), éléments en position: sticky collés mais coupés (détectés seuls, sans marquage),
// texte < 12 px, cibles < 44 px (plus de test « réduire les animations » : mode calme retiré en v10.11).
// Scénario facultatif : modules/<nom>/scenario.json, joué en 1440×900, 820×1180 et 390×844 (test « scenario ») et filmé dans apercu.mp4.
//   { "etapes": [ {"epingle": 0.9}, {"defiler": "sélecteur"}, {"cliquer": "sélecteur"}, {"survoler": "sélecteur"}, {"saisir": ["sélecteur", "texte"]},
//                 {"choisir": ["sélecteur", "valeur"]}, {"touche": "Enter"}, {"attendre": 600}, {"verifier": "sélecteur visible"},
//                 {"glisser": ["sélecteur", [[0.8, 0.5], [0.2, 0.5]], 900]} ],
//     « glisser » : souris enfoncée qui passe par ces points (fractions de la boîte de l'élément : 0,0 en haut à gauche),
//                   en 900 ms (durée facultative ; 300 ms hors film) : essuyer, tourner une page, tirer une poignée…
//     chaque étape accepte "si": "sélecteur" (jouée seulement si ce sélecteur est visible à ce format),
//     "pause": 450,            // entre deux étapes (ms), pour la vidéo
//     "video": "scenario",     // "scenario" (par défaut : la vidéo montre le scénario), "defilement" ou "les-deux"
//     "capture": { "attendre": 600, "etapes": [ … ], "apres": 300 } }  // instant d'apercu.jpg : ms après le chargement
//                                                                     // (sans défilement), étapes, puis pause ; sinon capture au milieu du module
//   Un scenario.json peut ne contenir que "capture" (module sans interaction) : le test « scenario » vaut alors n/a.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { RACINE, servir, lireJson, ecrireJson } from './commun.mjs';

const arg = process.argv[2];
const ecrire = process.argv.includes('--ecrire');
const medias = process.argv.includes('--medias');
const captures = process.argv.includes('--captures');
const estModule = !arg.endsWith('.html');
const fichier = estModule ? path.join(RACINE, 'modules', arg, 'index.html') : path.resolve(arg);
// Une page hors de la bibliothèque (assemblage fait dans le projet : il contient sa copie du socle et des modules) est servie depuis son propre dossier.
const dansBiblio = fichier.startsWith(RACINE + path.sep);
const racineServie = dansBiblio ? RACINE : path.dirname(fichier);
const relatif = '/' + path.relative(racineServie, fichier).split(path.sep).join('/');
// Tablettes (768×1024, 820×1180, 1180×820, tactiles) et 1024×640 : formats où un élément collant manque le plus souvent de hauteur.
const FORMATS = [[1000, 560], [1024, 640], [768, 1024, 1], [820, 1180, 1], [1180, 820, 1], [1280, 720], [1366, 768], [1440, 900], [1728, 1000], [1920, 1080], [2560, 1440], [390, 844, 1], [360, 780, 1], [320, 568, 1]];

const fScenario = path.join(path.dirname(fichier), 'scenario.json');
const scenario = fs.existsSync(fScenario) ? lireJson(fScenario) : null;

async function jouer(pg, sc, pause = 0) {
  // Joue les étapes ; renvoie la liste des problèmes (sélecteur absent, vérification ratée).
  const pbs = [];
  for (const e of sc.etapes) {
    const [k, v] = Object.entries(e).find(([c]) => c !== 'si');
    // « si » : l'étape n'est jouée que si ce sélecteur est visible (ex. commandes qui n'existent qu'en mode épinglé).
    if (e.si && !(await pg.locator(e.si).first().isVisible().catch(() => false))) continue;
    try {
      if (k === 'attendre') { await attendre(v); continue; }
      // « epingle » : se place à cette fraction (0 à 1) de l'épinglage du module (ex. objet construit aux 9/10).
      if (k === 'epingle') { await pg.evaluate((f) => { const st = window.ScrollTrigger?.getAll().find((x) => x.pin); if (st) scrollTo(0, st.start + (st.end - st.start) * f); }, v); await attendre(900); continue; }
      if (k === 'touche') await pg.keyboard.press(v);
      else {
        const sel = Array.isArray(v) ? v[0] : v; const loc = pg.locator(sel).first();
        if (k === 'verifier') { await loc.waitFor({ state: 'visible', timeout: 2500 }); continue; }
        await loc.scrollIntoViewIfNeeded({ timeout: 2500 });
        if (k === 'cliquer') await loc.click({ timeout: 2500 });
        else if (k === 'survoler') await loc.hover({ timeout: 2500 });
        else if (k === 'saisir') { await loc.click({ timeout: 2500 }); await loc.pressSequentially(v[1], { delay: pause ? 70 : 0 }); }
        else if (k === 'choisir') await loc.selectOption(v[1], { timeout: 2500 });
        else if (k === 'glisser') {
          const b = await loc.boundingBox({ timeout: 2500 }); if (!b) throw new Error('élément sans boîte');
          const pts = (v[1] || [[0.8, 0.5], [0.2, 0.5]]).map(([fx, fy]) => [b.x + b.width * fx, b.y + b.height * fy]);
          const duree = v[2] ? (pause ? v[2] : Math.min(300, v[2])) : (pause ? 900 : 300), n = Math.max(6, Math.round(duree / 16));
          await pg.mouse.move(...pts[0]); await pg.mouse.down();
          for (let i = 1; i <= n; i++) {
            const t = i / n * (pts.length - 1), s = Math.min(pts.length - 2, Math.floor(t)), f = t - s;
            await pg.mouse.move(pts[s][0] + (pts[s + 1][0] - pts[s][0]) * f, pts[s][1] + (pts[s + 1][1] - pts[s][1]) * f);
            await attendre(duree / n);
          }
          await pg.mouse.up();
        }
        else if (k !== 'defiler') pbs.push(`étape inconnue ${k}`);
      }
    } catch (err) { pbs.push(`${k} ${JSON.stringify(v)} : ${err.message.split('\n')[0].slice(0, 80)}`); }
    await attendre(pause || 120);
  }
  return pbs;
}

async function essaiScenario([w, h, mobile]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: !!mobile, hasTouch: !!mobile });
  const pg = await ctx.newPage(); const erreurs = [];
  pg.on('pageerror', e => erreurs.push(e.message.slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text()) && !externe(m)) erreurs.push(m.text().slice(0, 160)); });
  await pg.goto(srv.url + relatif, { waitUntil: 'load' }); await attendre(1500);
  const pbs = await jouer(pg, scenario);
  await ctx.close();
  return { format: `${w}×${h}`, pbs, erreurs };
}

const srv = await servir(racineServie);
/* Une ressource d'un autre site (polices Google…) que le réseau de la session refuse n'est pas une erreur du module : notée à part. */
const externes = new Set();
function externe(m) {
  const u = (m.location && m.location().url) || '';
  if (!/Failed to load resource/.test(m.text()) || !u || u.startsWith(srv.url)) return false;
  try { externes.add(new URL(u).host); } catch {}
  return true;
}
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
    const collants = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'sticky' && !e.closest('[data-entete], [data-barre]'));
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
      // Éléments en position: sticky (hors en-tête et barres) : collés, ils doivent tenir entre l'en-tête et le bas de l'écran.
      for (const el of collants) {
        const cs = getComputedStyle(el); if (cs.position !== 'sticky' || cs.display === 'none') continue;
        const r = el.getBoundingClientRect(); if (!r.height || !r.width) continue;
        const parent = el.parentElement.getBoundingClientRect();
        const haut = parseFloat(cs.top), bas = parseFloat(cs.bottom);
        const colleHaut = !isNaN(haut) && Math.abs(r.top - haut) < 1.5 && parent.top < r.top - 1 && parent.bottom > r.bottom + 1;
        const colleBas = !isNaN(bas) && Math.abs(h - r.bottom - bas) < 1.5 && parent.bottom > r.bottom + 1 && parent.top < r.top - 1;
        if (!colleHaut && !colleBas) continue;
        if (r.top < eh - 1 || r.bottom > h - bh + 1) pb.coupes.add('collant ' + (el.className || el.tagName).toString().split(' ')[0].slice(0, 30) + ` (${Math.round(r.top)}→${Math.round(r.bottom)} / ${Math.round(eh)}-${Math.round(h - bh)})`);
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
      if (el.matches('a[href], button, [role="button"], input, select, summary, [tabindex="0"]') && cs.pointerEvents !== 'none' && (r.width < 43.5 || r.height < 43.5) && !el.closest('p, li > p')) pb.cibles.add(el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0] + ` ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    scrollTo(0, 0);
    return { coupes: [...pb.coupes].slice(0, 6), debord: pb.debord, petits: [...pb.petits].slice(0, 6), cibles: [...pb.cibles].slice(0, 6) };
  });
}

async function essai([w, h, mobile], opts = {}) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: !!mobile, hasTouch: !!mobile, reducedMotion: 'no-preference' });
  const pg = await ctx.newPage(); const erreurs = [];
  pg.on('pageerror', e => erreurs.push(e.message.slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text()) && !externe(m)) erreurs.push(m.text().slice(0, 160)); });
  await pg.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await pg.goto(srv.url + relatif + (opts.sansWebgl ? '?sanswebgl' : ''), { waitUntil: 'load' });
  await attendre(2500);
  const clsChargement = await pg.evaluate(() => window.__cls);
  const r = await parcourir(pg);
  await ctx.close();
  return { format: `${w}×${h}`, erreurs, cls: +clsChargement.toFixed(3), ...r };
}

const resultats = [];
for (const f of FORMATS) resultats.push(await essai(f));
const sansWebgl = await essai([1440, 900], { sansWebgl: true });
const scen = scenario?.etapes?.length ? [await essaiScenario([1440, 900]), await essaiScenario([820, 1180, 1]), await essaiScenario([390, 844, 1])] : [];
const tous = [...resultats, sansWebgl, ...scen.map(r => ({ ...r, coupes: [], petits: [], cibles: [], cls: 0 }))];
const erreurs = [...new Set(tous.flatMap(r => r.erreurs))];
const clsMax = Math.max(...tous.map(r => r.cls));
const html = fs.readFileSync(fichier, 'utf8');
const usesWebgl = /webgl|\bogl\b/i.test(html + (estModule ? fs.readFileSync(path.join(path.dirname(fichier), 'module.js'), 'utf8') : ''));
const tests = {
  formats: resultats.every(r => !r.coupes.length && r.debord <= 1) ? 'ok' : 'échec : ' + resultats.filter(r => r.coupes.length || r.debord > 1).map(r => `${r.format} ${r.coupes.join(', ')}${r.debord > 1 ? ' débord ' + r.debord + 'px' : ''}`).join(' ; '),
  'sans-webgl': usesWebgl ? (!sansWebgl.erreurs.length && !sansWebgl.coupes.length ? 'ok' : 'échec : ' + sansWebgl.erreurs.join(', ')) : 'n/a',
  console: erreurs.length ? `${erreurs.length} erreur${erreurs.length > 1 ? 's' : ''} : ${erreurs.slice(0, 2).join(' | ')}` : '0 erreur',
  cls: clsMax,
  scenario: !scenario?.etapes?.length ? 'n/a' : scen.every(r => !r.pbs.length && !r.erreurs.length) ? 'ok' : 'échec : ' + scen.filter(r => r.pbs.length || r.erreurs.length).map(r => `${r.format} ${[...r.pbs, ...r.erreurs].slice(0, 2).join(', ')}`).join(' ; '),
  'texte-12px': [...new Set(tous.flatMap(r => r.petits))].length ? 'échec : ' + [...new Set(tous.flatMap(r => r.petits))].slice(0, 3).join(', ') : 'ok',
  'cibles-44px': [...new Set(tous.flatMap(r => r.cibles))].length ? 'échec : ' + [...new Set(tous.flatMap(r => r.cibles))].slice(0, 3).join(', ') : 'ok',
};
for (const r of tous) if (r.coupes.length || r.debord > 1 || r.erreurs.length || r.cls >= .1) console.log('  ' + r.format, JSON.stringify({ coupes: r.coupes, debord: r.debord, erreurs: r.erreurs, cls: r.cls }));
console.log(JSON.stringify(tests, null, 1));
if (externes.size) console.log(`ressources d'autres sites non chargées (réseau de la session, sans effet sur les tests) : ${[...externes].join(', ')}`);

if (medias && estModule && !process.argv.includes('--garder-video')) {
  const dos = path.dirname(fichier);
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: path.join(RACINE, 'inventaire', 'brut'), size: { width: 1440, height: 900 } } });
  const pg = await ctx.newPage(); const t0 = Date.now();
  const cap = scenario?.capture;
  await pg.goto(srv.url + relatif, { waitUntil: 'load' }); await attendre(cap ? (cap.attendre ?? 2600) : 2600);
  if (cap) {
    // Instant de capture choisi par le module : étapes éventuelles (défiler, cliquer…), puis la photo.
    if (cap.etapes?.length) await jouer(pg, { etapes: cap.etapes }, 0);
    if (cap.apres) await attendre(cap.apres);
  } else
  // Capture : le module à l'écran (au milieu de son épinglage s'il est épinglé).
  await pg.evaluate(async () => { const m = document.querySelector('[data-module]'); if (!m) return; const st = window.ScrollTrigger?.getAll().find(s => s.pin); const y = st ? st.start + (st.end - st.start) * 0.4 : Math.max(0, m.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0)); scrollTo(0, y); await new Promise(r => setTimeout(r, 1400)); });
  let q = 80, buf = await pg.screenshot({ type: 'jpeg', quality: q }); while (buf.length > 300 * 1024 && q > 50) { q -= 6; buf = await pg.screenshot({ type: 'jpeg', quality: q }); }
  fs.writeFileSync(path.join(dos, 'apercu.jpg'), buf);
  // Démonstration : on part juste avant le module et on le parcourt (fin de l'épinglage comprise), 7 s au plus.
  const [y0, y1] = await pg.evaluate(() => { const m = document.querySelector('[data-module]'); const max = document.documentElement.scrollHeight - innerHeight;
    if (!m) return [0, max]; const pins = (window.ScrollTrigger?.getAll() || []).filter(s => s.pin && m.contains(s.pin));
    /* Section épinglée : son haut se lit sur le début de l'épinglage (mesuré pendant l'épinglage, il vaudrait la position courante et le film ne montrerait que la fin). */
    const top = pins.length ? Math.min(...pins.map(s => s.start)) : m.getBoundingClientRect().top + scrollY;
    const fin = pins.length ? Math.max(...pins.map(s => s.end)) : top + m.offsetHeight - innerHeight * .6; return [Math.max(0, Math.min(max, top - innerHeight * .5)), Math.max(0, Math.min(max, fin))]; });
  const modeVideo = scenario?.etapes?.length ? (scenario.video || 'scenario') : 'defilement';
  await pg.evaluate(y => scrollTo(0, y), y0); await attendre(600);
  let duree = 0; const tDemo = Date.now();
  const epingle = await pg.evaluate(() => { const m = document.querySelector('[data-module]'); return !!(m && (window.ScrollTrigger?.getAll() || []).some(s => s.pin && m.contains(s.pin))); });
  /* Une section épinglée se joue pendant le défilement : on lui laisse le temps (jusqu'à 9 s) pour qu'on voie tout son déroulé. */
  if (modeVideo !== 'scenario') { duree = epingle ? Math.min(9000, Math.max(4500, (y1 - y0) * 3)) : Math.min(6400, Math.max(2500, (y1 - y0) * 1.6));
  await pg.evaluate(([y0, y1, duree]) => new Promise(ok => { const t0 = performance.now(); const pas = () => { const k = Math.min(1, (performance.now() - t0) / duree); scrollTo(0, y0 + (y1 - y0) * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)); k < 1 ? requestAnimationFrame(pas) : ok(); }; requestAnimationFrame(pas); }), [y0, y1, duree]);
  }
  if (modeVideo !== 'defilement') { await jouer(pg, scenario, scenario.pause ?? 450); await attendre(800); }
  const debutFilm = (tDemo - t0) / 1000 - 0.2;
  await attendre(400);
  await ctx.close();
  const video = await pg.video().path();
  const out = path.join(dos, 'apercu.mp4');
  const dureeTotale = Math.min(modeVideo === 'defilement' ? (epingle ? 11 : 8) : 14, (Date.now() - t0) / 1000 - debutFilm);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, debutFilm).toFixed(2)), '-i', video, '-t', String(Math.max(4, dureeTotale)), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-vf', 'scale=960:600', out]);
  if (fs.statSync(out).size > 2 * 1024 * 1024) { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '33', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out + '.mp4']); fs.renameSync(out + '.mp4', out); }
  fs.rmSync(video, { force: true });
  console.log(`apercu.jpg ${Math.round(buf.length / 1024)} Ko, apercu.mp4 ${Math.round(fs.statSync(out).size / 1024)} Ko`);
}
if (captures) {
  // Captures de contrôle, pour un module comme pour un assemblage : haut de page, puis chaque module amené sous l'en-tête.
  const dos = path.join(path.dirname(fichier), 'captures'); fs.mkdirSync(dos, { recursive: true }); let nb = 0;
  for (const [w, h, tactile] of [[1440, 900], [820, 1180, 1], [390, 844, 1]]) {
    const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: !!tactile, isMobile: !!tactile && w < 500 });
    const pg = await ctx.newPage(); await pg.goto(srv.url + relatif, { waitUntil: 'load' }); await attendre(2600);
    await pg.screenshot({ path: path.join(dos, `${w}x${h}-0-haut.jpg`), type: 'jpeg', quality: 70 }); nb++;
    const mods = await pg.evaluate(() => [...document.querySelectorAll('main [data-module]')].map(m => m.dataset.module));
    for (let i = 0; i < mods.length; i++) {
      await pg.evaluate(i => { const m = document.querySelectorAll('main [data-module]')[i]; const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0; scrollTo(0, m.getBoundingClientRect().top + scrollY - eh); }, i);
      await attendre(1400); await pg.screenshot({ path: path.join(dos, `${w}x${h}-${i + 1}-${mods[i]}.jpg`), type: 'jpeg', quality: 70 }); nb++;
    }
    await ctx.close();
  }
  console.log(`${nb} captures dans ${path.relative(RACINE, dos)}/`);
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
