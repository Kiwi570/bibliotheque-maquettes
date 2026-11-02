// Assemble plusieurs modules en une page de départ, avec une palette donnée.
// node outils/assembler.mjs <module1> <module2> ... --palette palette.json [--sortie dossier] [--titre "Nom du projet"] [--options options.json]
//
// palette.json : {"fond":"#…","texte":"#…","accent":"#…","secondaire":"#…",
//                 "polices":{"titres":"…","texte":"…","mono":"…"}, "rayon":"12px", "sur_accent":"#…"}
// options.json : {"<module>": {…options passées à init…}} (sinon, options par défaut)
//
// Produit <sortie>/index.html, <sortie>/socle/ et <sortie>/modules/<nom>/module.{css,js} : un dossier autonome,
// prêt à être testé (node outils/tester-module.mjs <sortie>/index.html) puis adapté au projet.
// Chaque module apporte le bloc [data-module="<nom>"] de sa démonstration ; les sections reçoivent data-rail
// (nom lu dans leur surtitre ou leur titre) pour qu'un rail de sections éventuel les repère.
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson, arbreHtml } from './commun.mjs';

const args = process.argv.slice(2);
const mods = []; let palette = null, sortie = null, titre = 'Page assemblée', options = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--palette') palette = lireJson(path.resolve(args[++i]));
  else if (args[i] === '--sortie') sortie = path.resolve(args[++i]);
  else if (args[i] === '--titre') titre = args[++i];
  else if (args[i] === '--options') options = lireJson(path.resolve(args[++i]));
  else mods.push(args[i]);
}
if (!mods.length || !palette) { console.error('usage : node outils/assembler.mjs <module> [...] --palette palette.json [--sortie dossier]'); process.exit(1); }
sortie ??= path.join(RACINE, 'assemblages', mods.join('+').slice(0, 80));
for (const c of ['fond', 'texte', 'accent']) if (!/^#[0-9a-f]{6}$/i.test(palette[c] || '')) { console.error(`palette.${c} manquante ou invalide (#rrggbb)`); process.exit(1); }

// Extraction du bloc [data-module] dans la démonstration de chaque module (texte source exact, lignes comprises).
function blocDemo(nom) {
  const f = path.join(RACINE, 'modules', nom, 'index.html');
  if (!fs.existsSync(f)) { console.error(`module inconnu : ${nom}`); process.exit(1); }
  const src = fs.readFileSync(f, 'utf8'); const lignes = src.split('\n');
  const blocs = [];
  const chercher = n => { for (const e of n.enfants || []) { if (e.attrs?.['data-module'] === nom) blocs.push(lignes.slice(e.debut - 1, e.fin).join('\n')); else chercher(e); } };
  chercher(arbreHtml(src));
  if (!blocs.length) { console.error(`${nom} : aucun bloc [data-module="${nom}"] dans sa démonstration`); process.exit(1); }
  // Éléments compagnons hors du bloc, marqués data-module-compagnon="<nom>" (ex. voile de transition).
  const compagnons = [];
  const chercherC = n => { for (const e of n.enfants || []) { if (e.attrs?.['data-module-compagnon'] === nom) compagnons.push(lignes.slice(e.debut - 1, e.fin).join('\n')); else chercherC(e); } };
  chercherC(arbreHtml(src));
  return { blocs, compagnons };
}
const copier = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.cpSync(a, b, { recursive: true }); };
fs.rmSync(sortie, { recursive: true, force: true });
copier(path.join(RACINE, 'socle'), path.join(sortie, 'socle'));

const corps = [], fixes = [], css = [], js = [];
let n = 0;
for (const nom of mods) {
  const mj = lireJson(path.join(RACINE, 'modules', nom, 'module.json'));
  for (const f of fs.readdirSync(path.join(RACINE, 'modules', nom))) if (/\.(css|js)$/.test(f)) copier(path.join(RACINE, 'modules', nom, f), path.join(sortie, 'modules', nom, f));
  const { blocs, compagnons } = blocDemo(nom);
  for (let b of blocs) {
    // Ids uniques d'un module à l'autre.
    n++; b = b.replace(/\b(id|aria-labelledby|aria-describedby|aria-controls|for)="([^"]+)"/g, (m, a, v) => `${a}="${v.split(' ').map(x => `m${n}-${x}`).join(' ')}"`).replace(/href="#([\w-]+)"/g, (m, v) => `href="#m${n}-${v}"`);
    if (/^\s*<(section|article|div)\b/.test(b) && !/data-rail=/.test(b.split('>')[0])) {
      const t = (b.match(/class="socle-surtitre"[^>]*>([^<]+)</) || b.match(/<h[12][^>]*>([^<]+)</) || [, mj.titre])[1].trim();
      b = b.replace(/^(\s*<(?:section|article|div)\b)/, `$1 data-rail="${t.replace(/"/g, '')}"`);
    }
    (/position:\s*fixed|data-module="rail-de-sections"|^\s*<nav\b/.test(b.split('\n')[0]) ? fixes : corps).push(`<!-- module : ${nom} -->\n${b}`);
  }
  fixes.push(...compagnons);
  css.push(`<link rel="stylesheet" href="modules/${nom}/module.css?v=1">`);
  js.push(`import { init as init${n} } from './modules/${nom}/module.js?v=1';\nfor (const el of document.querySelectorAll('[data-module="${nom}"]')) init${n}(el, ${JSON.stringify(options[nom] || {})});`);
}

const pol = palette.polices || {};
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${titre}</title>
<style>html, body { background: ${palette.fond}; }</style>
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
</style>
</head>
<body>
<a class="socle-sr" href="#contenu">Aller au contenu</a>
<header class="socle-entete" data-entete><span>${titre}</span><button type="button" data-calme>Mode calme</button></header>
<main id="contenu">
${corps.join('\n\n')}
</main>
${fixes.join('\n')}
<script type="module">
${js.join('\n')}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(sortie, 'index.html'), html);
console.log(`${path.relative(process.cwd(), sortie)}/index.html : ${mods.length} modules (${mods.join(', ')})`);
console.log(`Tester : node outils/tester-module.mjs ${path.relative(RACINE, path.join(sortie, 'index.html'))}`);
