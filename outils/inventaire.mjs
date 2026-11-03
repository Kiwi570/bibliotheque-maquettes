// Inventaire automatique d'une maquette : pages, blocs de premier niveau, lignes de code, GSAP et ScrollTrigger, médias.
// node outils/inventaire.mjs <depot> [--sans-medias] [--pages index,contact]
// Écrit inventaire/<depot>.json et medias/<depot>/*. Lecture seule sur le dépôt de la maquette.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { RACINE, DOWNLOADS, arbreHtml, signature, reglesCss, plages, plagesTexte, slug, servir, ecrireJson } from './commun.mjs';

const depot = process.argv[2];
if (!depot) { console.error('usage : node outils/inventaire.mjs <depot> [--sans-medias] [--pages a,b]'); process.exit(1); }
const avecMedias = !process.argv.includes('--sans-medias');
const iPages = process.argv.indexOf('--pages');
const filtrePages = iPages > 0 ? process.argv[iPages + 1].split(',') : null;
const DOS = path.join(DOWNLOADS, depot);
const MED = path.join(RACINE, 'medias', depot);
const TMP = path.join(RACINE, 'inventaire', 'brut', depot);
fs.mkdirSync(MED, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });

const commit = execFileSync('git', ['-C', DOS, 'log', '-1', '--format=%h|%cI'], { encoding: 'utf8' }).trim().split('|');
const IGNORER = new Set(['script', 'style', 'noscript', 'template', 'link', 'meta', 'a', 'svg', 'dialog-polyfill', 'span', 'br']);
const GENERIQUES = new Set('section sec wrap wrapper container cadre bloc block inner grid stack reveal is-visible on-dark dark light page site content contenu full fullbleed pad sm md lg xl hide-sm hide-md show-sm mono'.split(' '));

// ---------- Analyse des sources ----------
// Pages à la racine et dans les sous-dossiers (journal/, blog/…), hors dossiers techniques.
const EXCLUS_DOS = /^(\.|node_modules$|vendor$|assets?$|images?$|img$|medias?$|fonts?$|css$|js$|correction$|audit$|captures?$|test)/;
function pagesHtml(rel = '', prof = 0) {
  const out = [];
  for (const e of fs.readdirSync(path.join(DOS, rel), { withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith('.html') && !/^google[\w]+\.html$/.test(e.name)) out.push(rel ? rel + '/' + e.name : e.name);
    else if (e.isDirectory() && prof < 2 && !EXCLUS_DOS.test(e.name)) out.push(...pagesHtml(rel ? rel + '/' + e.name : e.name, prof + 1));
  }
  return out;
}
const fichiersPages = pagesHtml().sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));
function trouver(n, f) { if (f(n)) return n; for (const e of n.enfants || []) { const r = trouver(e, f); if (r) return r; } return null; }
function contientMain(n) { return !!trouver(n, x => x.tag === 'main'); }
function blocsSource(arbre) {
  const body = trouver(arbre, n => n.tag === 'body'); const out = [];
  const marcher = (parent, dansMain) => {
    for (const e of parent.enfants) {
      if (e.tag === 'svg' && !dansMain && (e.attrs.class || e.attrs.id) && !trouver(e, n => n.tag === 'symbol')) { /* calque SVG (voile, décor) : on le garde */ }
      else if (IGNORER.has(e.tag)) continue;
      if (e.tag === 'main') { marcher(e, true); continue; }
      if (!dansMain && e.tag === 'div' && contientMain(e)) { marcher(e, false); continue; }
      out.push({ tag: e.tag, id: e.attrs.id || '', classe: e.attrs.class || '', sig: signature(e.tag, e.attrs.id, e.attrs.class), debut: e.debut, fin: e.fin ?? e.debut, dansMain, attrs: e.attrs, noeud: e });
    }
  };
  if (body) marcher(body, false);
  return out;
}
const classesDe = n => { const s = new Set(); const w = x => { (x.attrs?.class || '').split(/\s+/).filter(Boolean).forEach(c => s.add(c)); (x.enfants || []).forEach(w); }; w(n); return s; };
const dataDe = n => { const s = new Set(); const w = x => { Object.keys(x.attrs || {}).filter(k => k.startsWith('data-')).forEach(k => s.add(k)); (x.enfants || []).forEach(w); }; w(n); return s; };

const sources = {}; const ORDRE = [];
for (const f of fichiersPages) {
  const page = f.replace(/\.html$/, '');
  const src = fs.readFileSync(path.join(DOS, f), 'utf8');
  const arbre = arbreHtml(src);
  const resoudre = h => h.startsWith('/') ? h.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(f), h));
  const css = [...src.matchAll(/<link[^>]+href="([^"?#]+\.css)[^"]*"/g)].map(m => /^https?:/.test(m[1]) ? m[1] : resoudre(m[1])).filter(h => !/vendor|lenis\.css|^https?:/.test(h));
  const js = [...src.matchAll(/<script[^>]+src="([^"?#]+\.m?js)[^"]*"/g)].map(m => /^https?:/.test(m[1]) ? m[1] : resoudre(m[1])).filter(h => !/vendor|\.min\.js$|^https?:/.test(h));
  ORDRE.push(page);
  sources[page] = { fichier: f, blocs: blocsSource(arbre), css, js };
}
// Les scripts importés par les modules ES comptent aussi.
function importsJs(fichiers) {
  const vus = new Set(); const pile = [...fichiers];
  while (pile.length) { const f = pile.pop(); if (vus.has(f)) continue; vus.add(f); const p = path.join(DOS, f); if (!fs.existsSync(p)) continue;
    for (const m of fs.readFileSync(p, 'utf8').matchAll(/(?:import\s[^'"]*|import\()\s*['"](\.{1,2}\/[^'"?]+)/g)) { const g = path.normalize(path.join(path.dirname(f), m[1])); if (!/vendor/.test(g)) pile.push(g); } }
  return [...vus];
}
for (const s of Object.values(sources)) s.js = importsJs(s.js);

// Gabarits : pages dont la suite de blocs du main est identique à une page déjà vue.
const gabarits = {};
for (const page of ORDRE) { const s = sources[page];
  const cle = s.blocs.filter(b => b.dansMain).map(b => b.tag + '#' + b.id + '.' + b.classe.trim().split(/\s+/).sort().join('.') + '[' + Object.keys(b.attrs).filter(k => k.startsWith('data-')).sort().join(',') + ']').join('|');
  // Même séquence exacte, ou (pages d'un même dossier) au moins 60 % de blocs communs : fiches services/*, etc.
  const dos = page.includes('/') ? page.slice(0, page.lastIndexOf('/')) : '';
  const parts = new Set(cle.split('|'));
  const proche = g => { if (!dos || g.dos !== dos) return false; const a = g.cle.split('|'); const commun = a.filter(x => parts.has(x)).length; return commun >= 3 && commun / new Set([...a, ...parts]).size >= 0.6; };
  const deja = Object.entries(gabarits).find(([, g]) => (g.cle === cle && cle.split('|').length > 2) || proche(g));
  if (deja) { deja[1].pages.push(page); s.gabarit = deja[0]; } else gabarits[page] = { cle, dos, pages: [page] };
}

// Identifiants des blocs (communs hors main dédoublonnés par signature).
const ids = new Set(); const communs = {};
function idPour(page, b) {
  const classes = b.classe.split(/\s+/).filter(c => c && !GENERIQUES.has(c) && !/^(is|has|js|u)-/.test(c) && !/--/.test(c));
  const titre = trouver(b.noeud, n => /^h[1-3]$/.test(n.tag));
  let base = slug(b.id) || slug(classes[0]) || slug(b.attrs['aria-label']) || slug(titre?.attrs?.id) || b.tag;
  if (b.dansMain && page !== 'index') base = slug(page) + '-' + base;
  let id = base, k = 2; while (ids.has(id)) id = `${base}-${k++}`; ids.add(id); return id;
}
const blocs = [];
for (const page of ORDRE) { const s = sources[page];
  for (const b of s.blocs) {
    if (!b.dansMain) {
      if (communs[b.sig]) { communs[b.sig].pages.push(page); b.ref = communs[b.sig]; continue; }
    } else if (s.gabarit) {
      const ref = blocs.find(x => x.page === s.gabarit && x.sig === b.sig && !x._pris?.has(page));
      if (ref) { ref.pages.push(page); (ref._pris ??= new Set()).add(page); b.ref = ref; continue; }
    }
    const fiche = { id: idPour(page, b), page, pages: [page], sig: b.sig, tag: b.tag, dansMain: b.dansMain, html: `${s.fichier}:${b.debut}-${b.fin}`, _b: b, _s: s };
    if (!b.dansMain) communs[b.sig] = fiche;
    b.ref = fiche; blocs.push(fiche);
  }
}

if (process.env.GABARITS_SEULS) { for (const [k, g] of Object.entries(gabarits)) if (g.pages.length > 1) console.log(k, '←', g.pages.length - 1, 'pages'); console.log(blocs.length, 'blocs'); process.exit(0); }
// Lignes CSS et JS : règles qui citent une classe exclusive du bloc (ou son id).
const usageClasses = {};
for (const [page, s] of Object.entries(sources)) for (const b of s.blocs) for (const c of classesDe(b.noeud)) (usageClasses[page + '|' + c] ??= new Set()).add(b.sig);
const cacheFichiers = {};
// Fonctions de premier niveau d'un fichier JS : [début, fin] (une ligne qui commence par function/const…= et finit à la première « } » ou « }; » en colonne 0).
const cacheFonctions = {};
function fonctionsJs(f) {
  if (cacheFonctions[f]) return cacheFonctions[f];
  const l = lire(f).split('\n'); const out = []; let debut = null, retrait = '';
  l.forEach((x, i) => {
    if (debut === null && /^(export\s+)?(async\s+)?function\b|^(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s*)?(\(|function|\w+\s*=>)|^\s{0,2}(async\s+)?function\s+\w+\s*\(/.test(x) && !/[;}]\s*$/.test(x.trim())) { debut = i + 1; retrait = x.match(/^\s*/)[0]; }
    else if (debut !== null && new RegExp('^' + retrait + '\\}[);,]*\\s*$').test(x)) { if (i + 1 - debut < 400) out.push([debut, i + 1]); debut = null; }
  });
  return (cacheFonctions[f] = out);
}
const lire = f => (cacheFichiers[f] ??= fs.existsSync(path.join(DOS, f)) ? fs.readFileSync(path.join(DOS, f), 'utf8') : '');
for (const fi of blocs) {
  const b = fi._b, s = fi._s;
  const excl = [...classesDe(b.noeud)].filter(c => !GENERIQUES.has(c) && (usageClasses[fi.page + '|' + c]?.size || 0) <= 1 && c.length > 2);
  const exclData = [...dataDe(b.noeud)].filter(d => !['data-reveal', 'data-anime', 'data-fx', 'data-i', 'data-d', 'data-delay'].includes(d) && s.blocs.filter(x => x !== b && dataDe(x.noeud).has(d)).length === 0);
  const motsCss = new Set(excl); const idb = b.id;
  const css = [];
  for (const f of s.css) {
    const reg = reglesCss(lire(f)).filter(r => { const toks = [...r.sel.matchAll(/([.#])([\w-]+)/g)]; return toks.some(([, t, n]) => (t === '.' && motsCss.has(n)) || (t === '#' && n === idb && idb)); });
    const p = plages(reg.map(r => [r.debut, r.fin]), 3); const t = plagesTexte(f, p); if (t) css.push(t);
  }
  const js = [];
  const motifs = [...excl.map(c => new RegExp(`[.'"\\s]${c.replace(/[-]/g, '\\-')}(?![\\w-])`)), ...exclData.map(d => new RegExp(`${d}(?![\\w-])|dataset\\.${d.slice(5).replace(/-(\w)/g, (_, x) => x.toUpperCase())}\\b`)), ...(idb ? [new RegExp(`#${idb}(?![\\w-])|getElementById\\(['"]${idb}['"]`)] : [])];
  for (const f of s.js) {
    const lignes = lire(f).split('\n'); const hits = [];
    const fns = fonctionsJs(f);
    lignes.forEach((l, i) => { if (motifs.some(m => m.test(l))) { const fn = fns.find(([a, b]) => a <= i + 1 && i + 1 <= b); hits.push(fn && fn[1] - fn[0] < 160 ? fn : [i + 1, i + 1]); } });
    const p = plages(hits, 2); const t = plagesTexte(f, p); if (t) js.push(t);
  }
  fi.code = { html: fi.html, css: css.join(' ; ') || null, js: js.join(' ; ') || null };
  fi.classes_exclusives = excl.slice(0, 30); fi.data = [...dataDe(b.noeud)].slice(0, 25);
}

if (process.argv.includes('--code-seul')) {
  const f = path.join(RACINE, 'inventaire', `${depot}.json`); const inv = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const b of inv.blocs) { const n = blocs.find(x => x.id === b.id); if (n) { b.code = n.code; b.classes_exclusives = n.classes_exclusives; } }
  inv.commit = commit[0]; inv.date_commit = commit[1];
  ecrireJson(f, inv); console.log(depot + ' : lignes de code recalculées'); process.exit(0);
}
// ---------- Mesures dans le navigateur ----------
function mesurerDansPage(sigs) {
  const IGN = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'A', 'SVG', 'SPAN', 'BR']);
  const sigDe = e => e.tagName.toLowerCase() + (e.getAttribute('id') ? '#' + e.getAttribute('id') : '') + ((e.getAttribute('class') || '').trim() ? '.' + e.getAttribute('class').trim().split(/\s+/)[0] : '');
  const vivants = [];
  const marcher = (p, dansMain) => { for (const e of p.children) {
    if (e.tagName.toLowerCase() === 'svg' && !dansMain && (e.getAttribute('class') || e.id) && !e.querySelector('symbol')) { /* calque SVG gardé */ }
    else if (IGN.has(e.tagName.toUpperCase())) continue;
    if (e.classList.contains('pin-spacer')) { marcher(e, dansMain); continue; }
    if (e.tagName === 'MAIN') { marcher(e, true); continue; }
    if (!dansMain && e.tagName === 'DIV' && e.querySelector('main')) { marcher(e, false); continue; }
    vivants.push(e); } };
  marcher(document.body, false);
  // Les classes posées par le JS changent la signature : on compare tag + id, puis tag + première classe d'origine si présente.
  let j = 0; const res = [];
  for (const sig of sigs) {
    let trouve = null;
    for (let k = j; k < vivants.length; k++) { const v = vivants[k]; const s = sigDe(v); const [tag] = sig.split(/[#.]/);
      if (s === sig || (v.tagName.toLowerCase() === tag && sig.includes('.') && v.classList.contains(sig.split('.').pop())) || (sig.includes('#') && v.id === sig.split('#')[1].split('.')[0])) { trouve = v; j = k + 1; break; } }
    res.push(trouve);
  }
  const ST = window.ScrollTrigger; const g = window.gsap;
  const tweens = g ? g.globalTimeline.getChildren(true, true, false) : [];
  const ajoutes = vivants.filter(v => !res.includes(v)).map(v => ({ sig: sigDe(v), fixe: getComputedStyle(v).position === 'fixed', h: Math.round(v.getBoundingClientRect().height) }));
  const infos = res.map((el, i) => {
    if (!el) return null;
    el.setAttribute('data-inv', i);
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    const sts = ST ? ST.getAll().filter(s => (s.trigger && (el === s.trigger || el.contains(s.trigger))) || (s.pin && (el === s.pin || el.contains(s.pin)))) : [];
    const tw = tweens.filter(t => (t.targets?.() || []).some(x => x instanceof Element && (el === x || el.contains(x))));
    const props = new Set(); tw.forEach(t => Object.keys(t.vars || {}).forEach(k => { if (!['duration', 'ease', 'delay', 'stagger', 'scrollTrigger', 'onComplete', 'onUpdate', 'onStart', 'overwrite', 'immediateRender', 'paused', 'repeat', 'yoyo', 'id', 'callbackScope', 'lazy', 'data', 'parent', 'runBackwards', 'startAt'].includes(k)) props.add(k); }));
    const anims = el.getAnimations ? el.getAnimations({ subtree: true }) : [];
    const canvases = [...el.querySelectorAll('canvas')].map(c => { let t = '2d'; try { const gl = c.getContext('webgl2') || c.getContext('webgl'); if (gl) t = 'webgl'; } catch {} return t; });
    const titreEl = el.querySelector('h1,h2,h3') || el.querySelector('[class*="title"],[class*="titre"]');
    const lab = el.getAttribute('aria-labelledby'); const titre = (titreEl?.textContent || (lab && document.getElementById(lab)?.textContent) || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 90);
    const split = el.querySelectorAll('[class*="split"],[class*="line-mask"],.line,.word,.char,[class*="lines"],[class*="words"],[class*="chars"]').length;
    return {
      titre, hauteur: Math.round(r.height), haut: Math.round(r.top + scrollY), fixe: cs.position === 'fixed' || cs.position === 'sticky' && el.parentElement === document.body, position: cs.position,
      cache: cs.display === 'none' || cs.visibility === 'hidden' || el.hidden || r.height === 0,
      scrolltriggers: sts.map(s => ({ pin: !!s.pin, scrub: s.vars?.scrub ?? null, debut: Math.round(s.start), fin: Math.round(s.end), anime: !!s.animation, toggle: s.vars?.toggleClass ? true : false })),
      tweens: tw.length, proprietes: [...props].slice(0, 20),
      boucles_css: anims.filter(a => a.effect?.getTiming?.().iterations === Infinity).length, animations_css: anims.length,
      canvas: canvases, videos: el.querySelectorAll('video').length, audio: el.querySelectorAll('audio').length, iframes: el.querySelectorAll('iframe').length,
      formulaires: el.querySelectorAll('form').length, champs: el.querySelectorAll('input,select,textarea').length, boutons: el.querySelectorAll('button').length,
      details: el.querySelectorAll('details').length, onglets: el.querySelectorAll('[role="tablist"]').length, deplies: el.querySelectorAll('[aria-expanded]').length,
      images: el.querySelectorAll('img,picture').length, liens: el.querySelectorAll('a[href]').length, decoupe: split,
      sticky: [...el.querySelectorAll('*')].slice(0, 400).filter(x => getComputedStyle(x).position === 'sticky').length,
    };
  });
  return { infos, ajoutes, scrollMax: document.documentElement.scrollHeight - innerHeight, globals: { gsap: !!g, scrolltrigger: !!ST, splittext: !!window.SplitText, flip: !!window.Flip, lenis: !!(window.Lenis || document.documentElement.classList.contains('lenis')), ogl: !!window.ogl || !!window.OGL, three: !!window.THREE } };
}

const INTRO_MS = 4200;
const navigateur = await chromium.launch();
const srv = await servir(DOS);
// Une page rattachée à un gabarit est visitée quand même si elle apporte des blocs propres (à mesurer et capturer).
const pagesAVisiter = ORDRE.filter(p => (!sources[p].gabarit || sources[p].blocs.some(b => b.dansMain && b.ref?.page === p)) && (!filtrePages || filtrePages.includes(p)));
const resultatPages = {};
const faire = async (p, ms) => { try { return await p.evaluate(ms); } catch (e) { return null; } };
const scrollerA = (p, y) => p.evaluate(y => { const l = window.lenis || window.__lenis; if (l?.scrollTo) l.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y);
const scrollerDoux = (p, y0, y1, ms) => p.evaluate(([y0, y1, ms]) => new Promise(ok => { const t0 = performance.now(); const l = window.lenis || window.__lenis; const pas = () => { const k = Math.min(1, (performance.now() - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; const y = y0 + (y1 - y0) * e; if (l?.scrollTo) l.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); k < 1 ? requestAnimationFrame(pas) : ok(); }; requestAnimationFrame(pas); }), [y0, y1, ms]);
const attendre = ms => new Promise(r => setTimeout(r, ms));

async function jpeg(page, fichier, opts = {}) {
  let q = 80; let buf = await page.screenshot({ type: 'jpeg', quality: q, ...opts });
  while (buf.length > 300 * 1024 && q > 50) { q -= 6; buf = await page.screenshot({ type: 'jpeg', quality: q, ...opts }); }
  fs.writeFileSync(fichier, buf); return q;
}

for (const page of pagesAVisiter) {
  const s = sources[page]; const fiches = s.blocs.map(b => b.ref);
  const url = srv.url + '/' + (page === 'index' ? '' : page);
  // Passe ordinateur, avec vidéo.
  const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...(avecMedias ? { recordVideo: { dir: TMP, size: { width: 960, height: 600 } } } : {}) });
  const pg = await ctx.newPage(); const t0 = Date.now(); const erreurs = [];
  pg.on('pageerror', e => erreurs.push(String(e.message).slice(0, 200)));
  pg.on('console', m => { if (m.type() === 'error') erreurs.push(m.text().slice(0, 200)); });
  await pg.goto(url, { waitUntil: 'load' }).catch(() => {});
  await attendre(INTRO_MS);
  const mes = await pg.evaluate(mesurerDansPage, s.blocs.map(b => b.sig));
  const segments = [];
  if (avecMedias) {
    // Le premier bloc du main reçoit la vidéo du chargement (ouverture).
    const premierMain = s.blocs.findIndex(b => b.dansMain);
    if (premierMain >= 0) segments.push({ i: premierMain, a: 300, b: 300 + 5200, nom: 'p1440' });
    for (let i = 0; i < s.blocs.length; i++) {
      const fi = s.blocs[i].ref; const inf = mes.infos[i];
      if (!inf || inf.cache || fi.page !== page && !fi.pages.includes(page)) continue;
      if (fi._medias) continue; // bloc commun déjà capturé
      if (inf.fixe && inf.position === 'fixed') { await scrollerA(pg, 0); await attendre(500); await jpeg(pg, path.join(MED, `${fi.id}-p1440.jpg`)); fi._medias = { capture: `medias/${depot}/${fi.id}-p1440.jpg` }; continue; }
      const pin = inf.scrolltriggers.find(x => x.pin);
      const h = 900; const top = inf.haut;
      const y0 = Math.max(0, Math.min(mes.scrollMax, top - h * 0.6));
      const y1 = Math.min(mes.scrollMax, pin ? Math.max(pin.fin, top + 10) : Math.max(y0 + 200, Math.min(top + inf.hauteur - h * 0.4, y0 + h * 2.2)));
      if (i !== premierMain) {
        await scrollerA(pg, y0); await attendre(350);
        const a = Date.now() - t0; await scrollerDoux(pg, y0, y1, pin ? 6500 : 5000); await attendre(300); const b = Date.now() - t0;
        segments.push({ i, a, b, nom: 'p1440' });
      }
      await scrollerA(pg, Math.min(mes.scrollMax, pin ? pin.debut + 2 : top)); await attendre(1300);
      const q = await jpeg(pg, path.join(MED, `${fi.id}-p1440.jpg`));
      fi._medias = { capture: `medias/${depot}/${fi.id}-p1440.jpg`, ...(q < 80 ? { qualite_jpg: q } : {}) };
    }
  }
  // Transition de page : clic sur le premier lien interne du menu, enregistré.
  let transition = null;
  if (avecMedias && page === 'index') {
    await scrollerA(pg, 0); await attendre(600);
    const lien = await pg.$('header nav a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([href^="tel"])');
    if (lien && await lien.isVisible()) { const a = Date.now() - t0; await lien.click().catch(() => {}); await attendre(3200); transition = { a, b: Date.now() - t0 }; }
  }
  await ctx.close();
  const video = avecMedias ? await pg.video()?.path() : null;
  resultatPages[page] = { url: '/' + (page === 'index' ? '' : page), erreurs, globals: mes.globals, ajoutes_par_js: mes.ajoutes, gabarit_de: gabarits[page]?.pages.filter(x => x !== page) || [] };
  s.blocs.forEach((b, i) => { const inf = mes.infos[i]; if (inf && b.ref.page === page && !b.ref.mesures) b.ref.mesures = inf; });
  if (video) {
    const animee = inf => inf && (inf.scrolltriggers.length || inf.tweens || inf.boucles_css || inf.canvas.length || inf.videos || inf.decoupe || inf.animations_css);
    for (const sg of segments) {
      const fi = s.blocs[sg.i].ref; const inf = mes.infos[sg.i];
      if (!animee(inf) || fi._video) continue;
      const out = path.join(MED, `${fi.id}-p960.mp4`);
      const dur = Math.min(8, Math.max(4, (sg.b - sg.a) / 1000));
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(sg.a / 1000), '-i', video, '-t', String(dur), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-vf', 'scale=960:600', out]);
      if (fs.statSync(out).size > 2 * 1024 * 1024) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '33', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out + '.mp4']), fs.renameSync(out + '.mp4', out);
      fi._video = `medias/${depot}/${fi.id}-p960.mp4`;
    }
    if (transition) {
      const voile = s.blocs.map(b => b.ref).find(f => /veil|voile|transition|curtain|rideau/.test(f.sig));
      if (voile) { const out = path.join(MED, `${voile.id}-p960.mp4`); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(transition.a / 1000 - 0.2), '-i', video, '-t', '4', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]); voile._video = `medias/${depot}/${voile.id}-p960.mp4`; }
    }
    fs.rmSync(video, { force: true });
  }
  // Passe téléphone.
  if (avecMedias) {
    const ctxm = await navigateur.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const pm = await ctxm.newPage();
    await pm.goto(url, { waitUntil: 'load' }).catch(() => {}); await attendre(INTRO_MS);
    const mm = await pm.evaluate(mesurerDansPage, s.blocs.map(b => b.sig));
    for (let i = 0; i < s.blocs.length; i++) {
      const fi = s.blocs[i].ref; const inf = mm.infos[i];
      if (fi._m390) continue;
      if (!inf) continue;
      if (/menu/.test(fi.sig) && inf.cache) {
        const bouton = await pm.$('[aria-controls="menu"], [aria-controls="' + (fi.sig.split('#')[1]?.split('.')[0] || 'menu') + '"], button[class*="menu"], .burger, [data-menu-toggle]');
        if (bouton && await bouton.isVisible()) { await bouton.click().catch(() => {}); await attendre(1200); await jpeg(pm, path.join(MED, `${fi.id}-m390.jpg`)); fi._m390 = `medias/${depot}/${fi.id}-m390.jpg`; await pm.keyboard.press('Escape'); await attendre(800); }
        continue;
      }
      if (inf.cache) continue;
      fi.mesures_m390 = { hauteur: inf.hauteur, cache: inf.cache };
      const pin = inf.scrolltriggers.find(x => x.pin);
      await scrollerA(pm, inf.position === 'fixed' ? 0 : Math.min(mm.scrollMax, pin ? pin.debut + 2 : inf.haut)); await attendre(1200);
      await jpeg(pm, path.join(MED, `${fi.id}-m390.jpg`)); fi._m390 = `medias/${depot}/${fi.id}-m390.jpg`;
    }
    // Blocs masqués sur téléphone.
    s.blocs.forEach((b, i) => { if (b.ref.page === page && mm.infos[i]?.cache && !b.ref.mesures?.cache) b.ref.masque_m390 = true; });
    await ctxm.close();
  }
  console.log(`${depot} · ${page} : ${s.blocs.length} blocs, ${resultatPages[page].erreurs.length} erreurs`);
}
await navigateur.close(); await srv.fermer();

// ---------- Écriture ----------
const sortie = {
  depot, commit: commit[0], date_commit: commit[1], genere: new Date().toISOString(),
  pages: Object.fromEntries(ORDRE.map(p => [p, sources[p]]).map(([p, s]) => [p, { fichier: s.fichier, css: s.css, js: s.js, gabarit: s.gabarit || null, ...(resultatPages[p] || {}) }])),
  blocs: blocs.map(f => ({
    id: f.id, page: f.page, pages: f.pages, sig: f.sig, dans_main: f.dansMain, code: f.code,
    titre: f.mesures?.titre || '', hauteur: f.mesures?.hauteur ?? null, hauteur_m390: f.mesures_m390?.hauteur ?? null, masque_m390: !!f.masque_m390,
    position: f.mesures?.position || null, cache: f.mesures?.cache ?? null,
    scrolltriggers: f.mesures?.scrolltriggers || [], tweens: f.mesures?.tweens || 0, proprietes: f.mesures?.proprietes || [],
    boucles_css: f.mesures?.boucles_css || 0, animations_css: f.mesures?.animations_css || 0, canvas: f.mesures?.canvas || [], decoupe: f.mesures?.decoupe || 0, sticky: f.mesures?.sticky || 0,
    elements: f.mesures ? { videos: f.mesures.videos, audio: f.mesures.audio, iframes: f.mesures.iframes, formulaires: f.mesures.formulaires, champs: f.mesures.champs, boutons: f.mesures.boutons, details: f.mesures.details, onglets: f.mesures.onglets, deplies: f.mesures.deplies, images: f.mesures.images, liens: f.mesures.liens } : null,
    classes_exclusives: f.classes_exclusives, data: f.data,
    medias: { ...(f._medias || {}), ...(f._m390 ? { capture_m390: f._m390 } : {}), ...(f._video ? { video: f._video } : {}) },
  })),
};
if (filtrePages) {
  // Passage partiel : on garde les blocs déjà inventoriés des autres pages.
  const avant = JSON.parse(fs.readFileSync(path.join(RACINE, 'inventaire', `${depot}.json`), 'utf8'));
  sortie.blocs = sortie.blocs.map(b => { if (filtrePages.includes(b.page)) return b; const v = avant.blocs.find(x => x.id === b.id); return v ? { ...v, pages: b.pages } : b; });
  for (const [p, v] of Object.entries(avant.pages)) if (!filtrePages.includes(p)) sortie.pages[p] = { ...v, gabarit: sortie.pages[p]?.gabarit ?? null };
}
ecrireJson(path.join(RACINE, 'inventaire', `${depot}.json`), sortie);
console.log(`${depot} : ${sortie.blocs.length} blocs, ${fs.readdirSync(MED).length} médias`);
