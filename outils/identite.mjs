// Palette et polices d'une maquette, lues dans le CSS (variables :root, @font-face) et dans les styles calculés.
// node outils/identite.mjs <depot>  → inventaire/<depot>-identite.json
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { RACINE, DOWNLOADS, servir, ecrireJson } from './commun.mjs';

const depot = process.argv[2];
const DOS = path.join(DOWNLOADS, depot);
const srv = await servir(DOS);
const nav = await chromium.launch();
const pg = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await pg.goto(srv.url + '/', { waitUntil: 'load' });
await pg.waitForTimeout(4000);
const id = await pg.evaluate(() => {
  const hex = c => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return c; if (m[4] !== undefined && +m[4] === 0) return 'transparent'; return '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join(''); };
  const varsRoot = {}; const familles = new Set();
  for (const ss of document.styleSheets) { let regles; try { regles = ss.cssRules; } catch { continue; }
    const parcourir = rs => { for (const r of rs) {
      if (r.type === CSSRule.FONT_FACE_RULE) familles.add(r.style.getPropertyValue('font-family').replace(/["']/g, '').trim());
      else if (r.selectorText && /(^|,)\s*(:root|html)\s*(,|$)/.test(r.selectorText)) for (const p of r.style) if (p.startsWith('--')) varsRoot[p] = r.style.getPropertyValue(p).trim();
      else if (r.cssRules) parcourir(r.cssRules); } };
    parcourir(regles); }
  const cs = getComputedStyle(document.documentElement);
  const couleurs = {}; for (const k of Object.keys(varsRoot)) { const v = cs.getPropertyValue(k).trim(); if (/^(#|rgb|hsl|oklch|color\()/.test(v)) { const t = document.createElement('i'); t.style.color = v; document.body.appendChild(t); couleurs[k] = hex(getComputedStyle(t).color); t.remove(); } }
  const police = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null; };
  const fond = (() => { for (const e of [document.querySelector('main'), document.body, document.documentElement]) { const c = e && hex(getComputedStyle(e).backgroundColor); if (c && c !== 'transparent') return c; } return null; })();
  const bouton = document.querySelector('main .btn, main .button, main [class*="btn--primary"], main a[class*="btn"], main button');
  return {
    fond, texte: hex(getComputedStyle(document.body).color),
    bouton: bouton ? { fond: hex(getComputedStyle(bouton).backgroundColor), texte: hex(getComputedStyle(bouton).color) } : null,
    lien: (() => { const a = document.querySelector('main p a, main a'); return a ? hex(getComputedStyle(a).color) : null; })(),
    variables_couleur: couleurs,
    polices: { titres: police('h1') || police('h2'), texte: police('main p') || police('body'), mono: police('code, .mono, [class*="mono"], kbd') },
    font_face: [...familles],
  };
});
await nav.close(); await srv.fermer();
ecrireJson(path.join(RACINE, 'inventaire', `${depot}-identite.json`), id);
console.log(JSON.stringify(id, null, 1).slice(0, 2500));
