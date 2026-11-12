// Assemble plusieurs modules en une page de départ, avec une palette donnée.
// node outils/assembler.mjs <module1> <module2> ... --sortie dossier [--palette palette.json] [--options options.json] [--titre "Nom du projet"] [--ecraser]
//
// palette.json : {"fond":"#…","texte":"#…","accent":"#…","secondaire":"#…", "sur_accent":"#…", "rayon":"12px",
//                 "polices":{"titres":"\"Young Serif\", serif","texte":"…","mono":"…"},
//                 "polices_url":"https://fonts.googleapis.com/css2?family=…" (facultatif : sinon construite depuis les noms)}
// options.json : {"<module>": {…options passées à init…}} (sinon, options par défaut). Pour une option fonction
//                (apres, format…), modifier assemblage.js, que l'assembleur ne réécrit pas.
// Sans --palette / --options, l'assembleur lit palette.json / options.json dans le dossier de sortie.
//
// Produit dans <sortie> : index.html, assemblage.js (initialisation des modules), scenario.json (scénarios des modules,
// ids préfixés), socle/ et modules/<nom>/. Rien d'autre n'est effacé : un index.html existant n'est remplacé
// qu'avec --ecraser ; assemblage.js et scenario.json existants ne sont jamais remplacés sans --ecraser.
// Ensuite : node outils/tester-module.mjs <sortie>/index.html --captures
//
// Chaque module apporte de sa démonstration : le bloc [data-module="<nom>"] (à sa place : avant l'en-tête, dans <main>
// ou après), ses compagnons [data-module-compagnon], les scripts en ligne du <head> (anti-flash), et les règles CSS
// de démonstration qui visent des classes du bloc.
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson, arbreHtml } from './commun.mjs';

const args = process.argv.slice(2);
const mods = []; let fPalette = null, sortie = null, titre = 'Page assemblée', fOptions = null, ecraser = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--palette') fPalette = path.resolve(args[++i]);
  else if (args[i] === '--sortie') sortie = path.resolve(args[++i]);
  else if (args[i] === '--titre') titre = args[++i];
  else if (args[i] === '--options') fOptions = path.resolve(args[++i]);
  else if (args[i] === '--ecraser') ecraser = true;
  else mods.push(args[i]);
}
if (!mods.length) { console.error('usage : node outils/assembler.mjs <module> [...] --sortie dossier [--palette palette.json] [--options options.json] [--ecraser]'); process.exit(1); }
for (const m of mods) if (!fs.existsSync(path.join(RACINE, 'modules', m, 'module.json'))) { console.error(`module inconnu : ${m} (voir modules/ ou node outils/chercher.mjs --module)`); process.exit(1); }
sortie ??= path.join(RACINE, 'assemblages', mods.join('+').slice(0, 80));
fPalette ??= path.join(sortie, 'palette.json');
if (!fs.existsSync(fPalette)) { console.error(`palette introuvable : ${fPalette} (--palette ou palette.json dans le dossier de sortie)`); process.exit(1); }
const palette = lireJson(fPalette);
fOptions ??= path.join(sortie, 'options.json');
const options = fs.existsSync(fOptions) ? lireJson(fOptions) : {};
for (const c of ['fond', 'texte', 'accent']) if (!/^#[0-9a-f]{6}$/i.test(palette[c] || '')) { console.error(`palette.${c} manquante ou invalide (#rrggbb)`); process.exit(1); }
if (fs.existsSync(path.join(sortie, 'index.html')) && !ecraser) { console.error(`${path.relative(process.cwd(), sortie)}/index.html existe déjà : ajouter --ecraser pour le remplacer (assemblage.js et scenario.json sont gardés).`); process.exit(1); }

// Règles CSS de premier niveau (et dans @media / @supports), avec leur enveloppe.
function regles(css, env = '') {
  const out = []; let i = 0;
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  while (i < css.length) {
    const a = css.indexOf('{', i); if (a < 0) break;
    const sel = css.slice(i, a).trim(); let p = 1, j = a + 1;
    while (j < css.length && p) { if (css[j] === '{') p++; else if (css[j] === '}') p--; j++; }
    const corps = css.slice(a + 1, j - 1);
    if (/^@(media|supports|container)/.test(sel)) out.push(...regles(corps, sel));
    else if (!sel.startsWith('@')) out.push({ env, sel, corps });
    i = j;
  }
  return out;
}

function demo(nom) {
  const f = path.join(RACINE, 'modules', nom, 'index.html');
  if (!fs.existsSync(f)) { console.error(`module inconnu : ${nom}`); process.exit(1); }
  const src = fs.readFileSync(f, 'utf8'); const lignes = src.split('\n'); const arbre = arbreHtml(src);
  const lMain = lignes.findIndex(l => /<main\b/.test(l)) + 1, lFinMain = lignes.findIndex(l => /<\/main>/.test(l)) + 1;
  const blocs = [], compagnons = [];
  const chercher = n => { for (const e of n.enfants || []) {
    if (e.attrs?.['data-module'] === nom) blocs.push({ html: lignes.slice(e.debut - 1, e.fin).join('\n'), place: lMain && e.debut < lMain ? 'avant' : lFinMain && e.debut > lFinMain ? 'apres' : 'main' });
    else if (e.attrs?.['data-module-compagnon'] === nom) compagnons.push(lignes.slice(e.debut - 1, e.fin).join('\n'));
    else chercher(e); } };
  chercher(arbre);
  if (!blocs.length) { console.error(`${nom} : aucun bloc [data-module="${nom}"] dans sa démonstration`); process.exit(1); }
  const tete = src.slice(0, src.indexOf('</head>'));
  const scripts = [...tete.matchAll(/<script(?![^>]*\b(?:src|type)=)[^>]*>[\s\S]*?<\/script>/g)].map(m => m[0]);
  const styles = [...tete.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  // CSS de démonstration utile : règles dont le sélecteur vise une classe présente dans les blocs (ni :root, ni html, ni body).
  const classes = new Set([...blocs.map(b => b.html).join('\n').matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
  const utiles = regles(styles).filter(r => !/(^|[\s,])(:root|html|body)\b/.test(r.sel) && [...r.sel.matchAll(/\.([\w-]+)/g)].some(m => classes.has(m[1]) && !m[1].startsWith('socle-')));
  const css = utiles.map(r => r.env ? `${r.env} { ${r.sel} { ${r.corps.trim()} } }` : `${r.sel} { ${r.corps.trim()} }`).join('\n');
  return { blocs, compagnons, scripts, css };
}
const copier = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.cpSync(a, b, { recursive: true }); };
fs.mkdirSync(sortie, { recursive: true });
copier(path.join(RACINE, 'socle'), path.join(sortie, 'socle'));
if (fPalette !== path.join(sortie, 'palette.json') && !fs.existsSync(path.join(sortie, 'palette.json'))) fs.copyFileSync(fPalette, path.join(sortie, 'palette.json'));

const avant = [], corps = [], apres = [], css = [], cssDemo = [], js = [], tete = [], etapes = []; let pause = 450;
let n = 0;
for (const nom of mods) {
  const mj = lireJson(path.join(RACINE, 'modules', nom, 'module.json'));
  for (const f of fs.readdirSync(path.join(RACINE, 'modules', nom))) if ((/\.(css|js|jpe?g|png|webp|avif|svg|mp3|m4a|mp4)$/.test(f) && !f.startsWith('apercu.')) || ['audio', 'images', 'img'].includes(f)) copier(path.join(RACINE, 'modules', nom, f), path.join(sortie, 'modules', nom, f));
  const d = demo(nom);
  for (const s of d.scripts) if (!tete.includes(s)) tete.push(s);
  if (d.css) cssDemo.push(`/* démonstration de ${nom} : mise en page à adapter */\n${d.css}`);
  const ids = {};
  for (let { html: b, place } of d.blocs) {
    // Ids uniques d'un module à l'autre.
    n++; const k = n;
    // Chemins relatifs de la démonstration (images, sons) : rapportés au dossier du module copié.
    b = b.replace(/\b(src|href|poster|data-src)="(?!https?:|\/|#|data:|mailto:|tel:)([^"]+\.(?:jpe?g|png|webp|avif|svg|mp3|m4a|mp4))"/g, (m, a, v) => `${a}="modules/${nom}/${v}"`)
         .replace(/"((?:demo|audio)[\w\/-]*\.(?:jpe?g|png|webp|mp3|m4a))"/g, (m, v) => `"modules/${nom}/${v}"`);
    b = b.replace(/\b(id|aria-labelledby|aria-describedby|aria-controls|for)="([^"]+)"/g, (m, a, v) => `${a}="${v.split(' ').map(x => { if (a === 'id') ids[x] = `m${k}-${x}`; return `m${k}-${x}`; }).join(' ')}"`).replace(/href="#([\w-]+)"/g, (m, v) => `href="#m${k}-${v}"`);
    if (/^\s*<(section|article)\b/.test(b) && !/data-rail=/.test(b.split('>')[0])) {
      const t = (b.match(/class="socle-surtitre"[^>]*>([^<]+)</) || b.match(/<h[12][^>]*>([^<]+)</))?.[1].trim();
      if (t) b = b.replace(/^(\s*<(?:section|article)\b)/, `$1 data-rail="${t.replace(/"/g, '')}"`);
    }
    const cible = place === 'avant' ? avant : place === 'apres' || /position:\s*fixed|data-module="rail-de-sections"|^\s*<nav\b/.test(b.split('\n')[0]) ? apres : corps;
    cible.push(`<!-- module : ${nom} -->\n${b}`);
  }
  apres.push(...d.compagnons);
  css.push(`<link rel="stylesheet" href="modules/${nom}/module.css?v=1">`);
  js.push(`import { init as init${n} } from './modules/${nom}/module.js?v=1';\nfor (const el of document.querySelectorAll('[data-module="${nom}"]')) init${n}(el, ${JSON.stringify(options[nom] || {})});`);
  // Scénario du module, ids préfixés comme dans la page.
  const fs_ = path.join(RACINE, 'modules', nom, 'scenario.json');
  if (fs.existsSync(fs_)) {
    const sc = lireJson(fs_); pause = Math.max(pause, sc.pause || 0);
    const pref = v => typeof v === 'string' ? v.replace(/#([\w-]+)/g, (m, x) => ids[x] ? `#${ids[x]}` : m) : Array.isArray(v) ? v.map(pref) : v;
    // Les étapes qui visent les commandes de la page de démonstration (id absent du bloc, classes demo-) sont écartées.
    const horsBloc = v => [v].flat().some(x => typeof x === 'string' && ([...x.matchAll(/#([\w-]+)/g)].some(m => !ids[m[1]]) || /\.demo-|\[data-demo|\[data-rejouer/.test(x)));
    const garde = (sc.etapes || []).filter(e => !Object.entries(e).some(([c, v]) => c !== 'attendre' && horsBloc(v)));
    etapes.push({ defiler: `[data-module="${nom}"]` }, ...garde.map(e => Object.fromEntries(Object.entries(e).map(([c, v]) => [c, pref(v)]))));
  }
}

// Polices : lien Google Fonts construit depuis le premier nom de chaque famille (hors polices système).
const pol = palette.polices || {};
const SYSTEME = /^(system-ui|-apple-system|ui-\w+|serif|sans-serif|monospace|cursive|Georgia|Arial|Helvetica|Times|Menlo|Courier|Palatino|Iowan|Segoe|Roboto|SF )/i;
const familles = [...new Set(Object.values(pol).map(v => String(v).split(',')[0].trim().replace(/^["']|["']$/g, '')).filter(f => f && !SYSTEME.test(f)))];
const urlPolices = palette.polices_url || (familles.length ? `https://fonts.googleapis.com/css2?${familles.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&')}&display=optional` : '');

let html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${titre}</title>
<style>html, body { background: ${palette.fond}; }</style>
${tete.join('\n')}
${urlPolices ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="${urlPolices}">` : ''}
<link rel="stylesheet" href="socle/socle.css?v=1">
${css.join('\n')}
<style>
  /* Palette du projet : seul endroit où l'identité est fixée. */
  :root {
    --couleur-fond: ${palette.fond}; --couleur-texte: ${palette.texte}; --couleur-accent: ${palette.accent}; --couleur-secondaire: ${palette.secondaire || palette.accent};
    ${palette.sur_accent ? `--couleur-sur-accent: ${palette.sur_accent};` : ''}
    ${pol.titres ? `--police-titres: ${pol.titres};` : ''} ${pol.texte ? `--police-texte: ${pol.texte};` : ''} ${pol.mono ? `--police-mono: ${pol.mono};` : ''}
    ${palette.rayon ? `--rayon: ${palette.rayon};` : ''}
  }
${cssDemo.join('\n')}
</style>
</head>
<body>
<a class="socle-sr" href="#contenu">Aller au contenu</a>
${avant.join('\n')}
<header class="socle-entete" data-entete><span>${titre}</span></header>
<main id="contenu">
${corps.join('\n\n')}
</main>
${apres.join('\n')}
<script type="module" src="assemblage.js?v=1"></script>
</body>
</html>
`;
// Liens internes sans cible (ils visaient la page de démonstration) : signalés et renvoyés au contenu.
const presents = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const morts = [];
html = html.replace(/href="#([\w-]+)"/g, (m, v) => presents.has(v) ? m : (morts.push(v), 'href="#contenu"'));

fs.writeFileSync(path.join(sortie, 'index.html'), html);
const fJs = path.join(sortie, 'assemblage.js');
if (!fs.existsSync(fJs) || ecraser) fs.writeFileSync(fJs, `// Initialisation des modules. Ce fichier est à vous : l'assembleur ne le réécrit qu'avec --ecraser.\n${js.join('\n')}\n`);
const fSc = path.join(sortie, 'scenario.json');
if (etapes.length && (!fs.existsSync(fSc) || ecraser)) fs.writeFileSync(fSc, JSON.stringify({ etapes, pause }, null, 1) + '\n');

const rel = path.relative(process.cwd(), sortie);
console.log(`${rel}/index.html : ${mods.length} modules (${mods.join(', ')})`);
if (familles.length && !palette.polices_url) console.log(`polices chargées : ${familles.join(', ')} (400 et 700, display=optional ; sinon palette.polices_url)`);
if (morts.length) console.log(`liens sans cible renvoyés vers #contenu : ${[...new Set(morts)].map(v => "#" + v).join(", ")} (à relier à vos sections)`);
console.log(`Tester : node ${path.relative(process.cwd(), path.join(path.dirname(new URL(import.meta.url).pathname), 'tester-module.mjs'))} ${path.relative(process.cwd(), path.join(sortie, 'index.html'))} --captures`);
