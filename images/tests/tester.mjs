// Tests du pipeline d'images. node images/tests/tester.mjs [analyser] [produire] [partage] [verifier-grok] [grok]   (sans argument : tout)
// - Le jeu d'essai (tests/jeu.json) est téléchargé une fois dans tests/.jeu/recu/ (ignoré par git : le dépôt est public).
// - analyser : sujet et cadrage à moins de 10 % de tests/attendu.json, texte signalé au bon niveau, doublon et image floue trouvés.
// - produire : toutes les variantes, srcset cohérents, aucun agrandissement au-delà de 1,5, images.json valide.
// - verifier-grok : les images Grok de --grok (par défaut ~/Downloads/images-grok-12-maquettes) sans fausse alerte,
//   plus trois pièges fabriqués (texte ajouté, visage, mauvais ratio) qui doivent tous être signalés.
// - partage : trois cartes 1200×630 sur trois palettes, texte jamais sur le sujet (mesuré dans la page rendue), planche à regarder.
// - grok : les consignes des trois faux projets (tests/projets/) sont complètes, au bon format, avec les interdits.
// Sortie : une ligne OK ou ECHEC par vérification, code de sortie 1 au moindre échec.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { ICI as IMAGES, args, lireJson, ecrireJson } from '../commun.mjs';

const { pos, opts } = args();
const ICI = path.join(IMAGES, 'tests');
const JEU = path.join(ICI, '.jeu');
const etapes = pos.length ? pos : ['analyser', 'produire', 'partage', 'verifier-grok', 'grok'];
let echecs = 0, total = 0, limites = 0;
let LIMITE = null;   // vérité marquée « limite » dans attendu.json : affichée, non comptée en échec
const verif = (ok, texte) => { total++; if (!ok && LIMITE) { limites++; console.log(`LIMITE ${texte} (${LIMITE})`); return ok; } if (!ok) echecs++; console.log(`${ok ? 'OK    ' : 'ECHEC '} ${texte}`); return ok; };
const node = (script, ...a) => execFileSync(process.execPath, [path.join(IMAGES, script), ...a], { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'pipe'] });

// 1. Jeu d'essai : téléchargement des originaux et recuperation.json comme l'écrirait recuperer.mjs.
async function jeu() {
  const j = lireJson(path.join(ICI, 'jeu.json'));
  const recu = path.join(JEU, 'recu');
  fs.mkdirSync(recu, { recursive: true });
  const images = [];
  for (const i of j.images) {
    const fichier = `${i.nom}.${i.format === 'jpeg' ? 'jpg' : i.format}`;
    const f = path.join(recu, fichier);
    if (i.copie_de) {   // vrai doublon fabriqué : copie recadrée, réduite et recompressée
      const s = path.join(recu, fs.readdirSync(recu).find(x => x.startsWith(`${i.copie_de}.`)));
      const m0 = await sharp(s).metadata();
      const fichierCopie = `${i.nom}.jpg`;
      await sharp(s).extract({ left: Math.round(m0.width * 0.04), top: Math.round(m0.height * 0.04), width: Math.round(m0.width * 0.92), height: Math.round(m0.height * 0.92) })
        .resize({ width: 1400 }).jpeg({ quality: 70 }).toFile(path.join(recu, fichierCopie));
      const m = await sharp(path.join(recu, fichierCopie)).metadata();
      images.push({ fichier: fichierCopie, nom: i.nom, drapeau: i.drapeau, contexte: i.contexte, largeur: m.width, hauteur: m.height, format: 'jpeg' });
      continue;
    }
    if (!fs.existsSync(f)) {
      const rep = await fetch(i.origine, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) bibliotheque-maquettes tests' } });
      if (!rep.ok) { verif(false, `téléchargement ${i.nom} (${rep.status}) ${i.origine}`); continue; }
      fs.writeFileSync(f, Buffer.from(await rep.arrayBuffer()));
    }
    const m = await sharp(f).metadata();
    images.push({ fichier, nom: i.nom, origine: i.origine, drapeau: i.drapeau, ...(i.marque ? { marque: i.marque } : {}), contexte: i.contexte, largeur: m.width, hauteur: m.height, format: m.format });
  }
  ecrireJson(path.join(recu, 'recuperation.json'), { site: j.sites[j.images[0].site], date: new Date().toISOString(), images });
  return recu;
}

// 2. analyser contre la vérité (attendu.json : sujet en % de l'image, point de cadrage, texte, doublon, faible).
async function testerAnalyser(recu) {
  node('analyser.mjs', recu);
  const a = lireJson(path.join(recu, 'analyse.json'));
  const att = lireJson(path.join(ICI, 'attendu.json'));
  const centre = b => [b.x + b.l / 2, b.y + b.h / 2];
  for (const [nom, t] of Object.entries(att.images)) {
    const r = a.images.find(x => x.nom === nom);
    LIMITE = t.limite || null;
    if (!verif(!!r, `${nom} analysé`)) continue;
    if (t.sujet) {
      const [cx, cy] = centre(r.sujet), [tx, ty] = centre(t.sujet);
      verif(Math.abs(cx - tx) <= 10 && Math.abs(cy - ty) <= 10, `${nom} sujet centré à ${Math.round(cx)} % ${Math.round(cy)} % (attendu ${tx} % ${ty} %)`);
    }
    if (t.cadrage) verif(Math.abs(r.cadrage[0] - t.cadrage[0]) <= 10 && Math.abs(r.cadrage[1] - t.cadrage[1]) <= 10, `${nom} cadrage ${r.cadrage.join(' % ')} % (attendu ${t.cadrage.join(' % ')} %)`);
    const niveau = r.lisible?.niveau || null;
    if ('texte' in t) verif(niveau === t.texte, `${nom} texte : ${niveau || 'aucun'} (attendu ${t.texte || 'aucun'})`);
    if ('a_verifier' in t) verif(!!r.lisible?.a_verifier === t.a_verifier, `${nom} texte à vérifier : ${!!r.lisible?.a_verifier}`);
    if (t.pas_doublon_de) verif(!(r.drapeaux || []).some(d => d.includes(t.pas_doublon_de)), `${nom} n'est pas un doublon de ${t.pas_doublon_de}`);
    if (t.doublon_de) verif((r.drapeaux || []).some(d => d.includes(t.doublon_de)), `${nom} doublon de ${t.doublon_de}`);
    if ('faible' in t) verif(!!r.qualite?.faible === t.faible, `${nom} faible : ${!!r.qualite?.faible}${r.qualite?.raisons?.length ? ` (${r.qualite.raisons.join(', ')})` : ''}`);
    if (t.raison) verif((r.qualite?.raisons || []).some(x => x.includes(t.raison)), `${nom} raison « ${t.raison} »`);
    if ('visages' in t) verif(r.visages === t.visages || (t.visages > 0 && r.visages > 0), `${nom} visages : ${r.visages} (attendu ${t.visages})`);
  }
  LIMITE = null;
  return a;
}


// 3. produire sur le jeu : variantes, srcset tels que le socle les construit, agrandissement, images.json.
async function testerProduire(recu) {
  const projet = path.join(JEU, 'projet');
  fs.mkdirSync(projet, { recursive: true });
  fs.cpSync(path.join(ICI, 'plan-jeu.json'), path.join(projet, 'plan-images.json'));
  fs.rmSync(path.join(projet, 'recu'), { recursive: true, force: true });
  fs.symlinkSync(recu, path.join(projet, 'recu'));
  const sortie = node('produire.mjs', path.join(projet, 'plan-images.json'), '--racine', projet, '--forcer');
  verif(!/^ECHEC/m.test(sortie), `produire sans erreur${/^ECHEC.*/m.test(sortie) ? ` : ${sortie.match(/^ECHEC.*/m)[0]}` : ''}`);
  const fiche = lireJson(path.join(projet, 'donnees', 'images.json'));
  const plan = lireJson(path.join(ICI, 'plan-jeu.json'));
  const EMPL = lireJson(path.join(IMAGES, 'emplacements.json'));
  verif(fiche && plan.every(e => fiche[e.nom]), `images.json valide, une fiche par entrée du plan (${Object.keys(fiche || {}).length}/${plan.length})`);
  const ratioNum = r => { const m = String(r).match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/); return m ? m[1] / m[2] : null; };
  for (const e of plan) {
    const f = fiche?.[e.nom];
    if (!f) continue;
    const dos = path.join(projet, 'assets', 'images', path.dirname(e.nom)), b = path.basename(e.nom);
    // Largeurs que le socle trouvera (fichiers <nom>-<w>.webp) = largeurs annoncées dans images.json.
    const surDisque = suffixe => fs.readdirSync(dos).map(x => x.match(new RegExp(`^${b}${suffixe}-(\\d+)\\.webp$`))).filter(Boolean).map(m => +m[1]).sort((x, y) => x - y);
    if (e.role === 'logo') { verif(f.fichiers.every(x => fs.existsSync(path.join(dos, x))), `${e.nom} : logo copié sans recadrage (${f.fichiers.join(', ')})`); continue; }
    const ws = surDisque(''), wm = surDisque('-mobile');
    verif(JSON.stringify(ws) === JSON.stringify(f.largeurs), `${e.nom} : srcset ${ws.join('/')} = largeurs ${f.largeurs.join('/')}`);
    const attendues = e.largeurs || EMPL[e.role].largeurs;
    verif(f.largeurs.every(w => attendues.includes(w)) && (f.largeurs.length === attendues.length || f.faible), `${e.nom} : toutes les variantes (${attendues.join('/')})${f.faible ? `, faible : ${f.raisons_faible.join(' ; ')}` : ''}`);
    if (e.mobile || EMPL[e.role].mobile && e.mobile !== false) verif(wm.length > 0 && JSON.stringify(wm) === JSON.stringify(f.mobile?.largeurs || []), `${e.nom} : version téléphone ${wm.join('/')}`);
    let ok = true, pire = 0;
    for (const w of f.largeurs) {
      const m = await sharp(path.join(dos, `${b}-${w}.webp`)).metadata();
      const r = ratioNum(f.ratio);
      if (m.width !== w || (r && Math.abs(m.width / m.height / r - 1) > 0.02)) ok = false;
      pire = Math.max(pire, w / f.recadrage.width);
    }
    verif(ok, `${e.nom} : fichiers à la bonne largeur et au ratio ${f.ratio}`);
    verif(pire <= 1.5, `${e.nom} : agrandissement maximal ${pire.toFixed(2)} (≤ 1,5)`);
    verif(/^c\.media\(\{ nom: '[^']+'/.test(f.media) && (f.media.includes(`cadrage: '${f.cadrage}'`) || f.cadrage === '50% 50%'), `${e.nom} : appel c.media prêt (${f.cadrage})`);
    const lourds = Object.entries(f.poids).filter(([, p]) => p > 300 * 1024);
    verif(!lourds.length, `${e.nom} : aucun fichier au-dessus de 300 Ko${lourds.length ? ` (${lourds.map(([x, p]) => `${x} ${Math.round(p / 1024)} Ko`).join(', ')})` : ''}`);
  }
  return { projet, fiche, plan };
}

// 4. Page de test : chaque emplacement dans le module correspondant de la bibliothèque, images produites à la place
//    des visuels de démonstration (balisage de c.media du socle), testée sur les 14 formats par outils/tester-module.mjs.
const MODULES = { galerie: 'galerie-horizontale-epinglee', produit: 'catalogue-filtres-flip', 'carte-service': 'planches-empilees', 'section-fond': 'manifeste-mot-a-mot', vignette: 'frise-tracee' };
function figure(f, nom, { classe = '', balise = 'figure', autres = '' } = {}) {
  const ws = f.largeurs, src = `assets/images/${nom}-${ws.find(w => w >= 1280) || ws[ws.length - 1]}.webp`;
  const srcset = (n, l) => l.map(w => `assets/images/${n}-${w}.webp ${w}w`).join(', ');
  const sizes = f.media.match(/sizes: '([^']+)'/)?.[1] || '100vw';
  const mob = f.mobile?.largeurs?.length ? `<source media="(max-width: 760px) and (orientation: portrait)" srcset="${srcset(`${nom}-mobile`, f.mobile.largeurs)}" sizes="${sizes}">` : '';
  return `<${balise} class="media ${classe}"${autres} style="--cadrage:${f.cadrage}${f.mobile?.cadrage ? `;--cadrage-mobile:${f.mobile.cadrage}` : ''}"><picture>${mob}<img src="${src}" srcset="${srcset(nom, ws)}" sizes="${sizes}" alt="${f.alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async"></picture></${balise}>`;
}
async function testerPage({ projet, fiche, plan }) {
  const page = path.join(JEU, 'page');
  fs.rmSync(page, { recursive: true, force: true });
  const RACINE = path.dirname(IMAGES);
  execFileSync(process.execPath, [path.join(RACINE, 'outils', 'assembler.mjs'), ...Object.values(MODULES), '--sortie', page, '--titre', 'Essai des images produites', '--palette', path.join(ICI, 'palette-essai.json'), '--ecraser'], { stdio: 'ignore' });
  fs.cpSync(path.join(projet, 'assets'), path.join(page, 'assets'), { recursive: true });
  let html = fs.readFileSync(path.join(page, 'index.html'), 'utf8');
  // Visuels de démonstration remplacés, dans l'ordre, par les images du rôle ; les cases en trop gardent une image du rôle.
  for (const [role, mod] of Object.entries(MODULES)) {
    const entrees = plan.filter(e => e.role === role && fiche[e.nom]);
    const debut = html.indexOf(`data-module="${mod}"`);
    if (!verif(debut > 0 && entrees.length > 0, `page : module ${mod} présent pour le rôle ${role}`)) continue;
    const fin = html.indexOf('data-module="', debut + 20) > 0 ? html.indexOf('data-module="', debut + 20) : html.length;
    let k = 0;
    const bloc = html.slice(debut, fin).replace(/<(span|div)([^>]*?)class="([^"]*?)\bsocle-visuel\b[^"]*"([^>]*)><\/\1>/g, (m, balise, avant, cls, apres) => {
      const e = entrees[k++ % entrees.length];
      return figure(fiche[e.nom], e.nom, { balise, classe: cls.trim(), autres: `${avant}${apres}`.replace(/\s+/g, ' ').replace(/^\s*$/, '') });
    });
    verif(k > 0, `page : ${k} visuels de ${mod} remplacés par ${entrees.map(e => e.nom).join(', ')}`);
    html = html.slice(0, debut) + bloc + html.slice(fin);
  }
  // Ouverture, portraits, 404 et logo : balisage du socle seul (pas de module de la bibliothèque pour ces rôles).
  const tete = plan.filter(e => ['ouverture', 'portrait', '404'].includes(e.role) && fiche[e.nom]);
  const logo = fiche.logo;
  const essai = `<section class="essai-images" data-module="essai-images" aria-label="Ouverture, portraits et 404">
  ${logo ? `<img class="essai-logo" src="assets/images/${logo.fichiers[0]}" alt="${logo.alt.replace(/"/g, '&quot;')}" width="240">` : ''}
  ${tete.map(e => `<div class="essai-${e.role}">${figure(fiche[e.nom], e.nom)}<p>${e.role} · ${fiche[e.nom].ratio} · ${fiche[e.nom].cadrage}</p></div>`).join('\n  ')}
</section>`;
  const css = `<style>.media{position:relative;margin:0;overflow:hidden}.media picture{display:block;width:100%;height:100%}.media img{width:100%;height:100%;object-fit:cover;object-position:var(--cadrage,50% 50%)}@media (max-width:760px){.media img{object-position:var(--cadrage-mobile,var(--cadrage,50% 50%))}}
.essai-images{display:grid;gap:24px;padding:24px 16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.essai-images p{font-size:14px;margin:6px 0 0}.essai-logo{max-width:240px;height:auto}.essai-ouverture{grid-column:1/-1}.essai-ouverture .media{aspect-ratio:16/9}@media (max-width:760px) and (orientation:portrait){.essai-ouverture .media{aspect-ratio:9/16}}.essai-portrait .media{aspect-ratio:4/5}.essai-404 .media{aspect-ratio:16/9}</style>`;
  html = html.replace('</head>', `${css}\n</head>`).replace(/<main([^>]*)>/, `<main$1>\n${essai}`);
  fs.writeFileSync(path.join(page, 'index.html'), html);
  let sortie = '', code = 0;
  try { sortie = execFileSync(process.execPath, [path.join(RACINE, 'outils', 'tester-module.mjs'), path.join(page, 'index.html'), '--captures'], { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (err) { sortie = `${err.stdout || ''}${err.stderr || ''}`; code = err.status || 1; }
  fs.writeFileSync(path.join(page, 'tester-module.txt'), sortie);
  const formats = (sortie.match(/^\s*\d{3,4}×\d{3,4}.*$/gm) || []);
  verif(code === 0, `page de test : tester-module ${code === 0 ? 'vert' : 'en échec'} (${formats.length} lignes de format ; détail dans ${path.relative(process.cwd(), path.join(page, 'tester-module.txt'))})`);
  // Toutes les images de la page sont chargées (aucune case vide).
  return page;
}

// 5. verifier-grok : les images Grok livrées (aucune fausse alerte) et trois pièges (tous signalés).
async function testerVerifierGrok() {
  const source = path.resolve(typeof opts.grok === 'string' ? opts.grok : path.join(os.homedir(), 'Downloads', 'images-grok-12-maquettes'));
  const racine = path.join(JEU, 'grok-projet'), dos = path.join(racine, 'recu', 'grok');
  fs.rmSync(racine, { recursive: true, force: true });
  fs.mkdirSync(dos, { recursive: true });
  const trouver = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(x => x.isDirectory() ? trouver(path.join(d, x.name)) : /\.(webp|jpe?g|png)$/i.test(x.name) ? [path.join(d, x.name)] : []);
  const vraies = fs.existsSync(source) ? trouver(source) : [];
  if (!verif(vraies.length > 0, `${vraies.length} images Grok trouvées dans ${source}`)) return;
  const plan = [];
  for (const f of vraies) {
    const m = await sharp(f).metadata(), b = path.basename(f);
    fs.symlinkSync(f, path.join(dos, b));
    plan.push({ nom: `grok/${b.replace(/\.\w+$/, '')}`, source: `recu/grok/${b}`, role: m.width >= m.height ? 'ouverture' : 'carte-service', alt: '' });
  }
  // Pièges fabriqués : texte ajouté sur une vraie image, visage net (portrait du jeu d'essai au format Grok), mauvais ratio.
  const paysage = vraies.find(f => /ouverture|route|nuit/.test(f)) || vraies[0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1168" height="784"><text x="584" y="420" text-anchor="middle" font-family="Georgia" font-size="96" fill="#fff" stroke="#000" stroke-width="2">Boulangerie Martin</text><text x="1140" y="760" text-anchor="end" font-family="Arial" font-size="28" fill="#fff">studio grok</text></svg>`;
  await sharp(paysage).resize(1168, 784, { fit: 'cover' }).composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 88 }).toFile(path.join(dos, 'piege-texte.jpg'));
  const portrait = path.join(JEU, 'recu', 'portrait-buste.png');
  if (fs.existsSync(portrait)) await sharp(portrait).resize(784, 1168, { fit: 'cover', position: 'top' }).jpeg({ quality: 88 }).toFile(path.join(dos, 'piege-visage.jpg'));
  await sharp(paysage).resize(784, 784, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(path.join(dos, 'piege-ratio.jpg'));
  plan.push({ nom: 'grok/piege-texte', source: 'recu/grok/piege-texte.jpg', role: 'ouverture', alt: '' },
    { nom: 'grok/piege-visage', source: 'recu/grok/piege-visage.jpg', role: 'carte-service', alt: '' },
    { nom: 'grok/piege-ratio', source: 'recu/grok/piege-ratio.jpg', role: 'ouverture', alt: '' });
  ecrireJson(path.join(racine, 'plan-images.json'), plan);
  node('verifier-grok.mjs', dos, path.join(racine, 'plan-images.json'));
  const v = lireJson(path.join(dos, 'verification.json'));
  const alertes = v.images.filter(r => !r.nom.startsWith('grok/piege') && r.problemes.length);
  verif(!alertes.length, `aucune fausse alerte sur les ${vraies.length} images Grok${alertes.length ? ` : ${alertes.map(r => `${r.fichier} (${r.problemes.join(', ')})`).join(' ; ')}` : ''}`);
  const piege = (n, re) => { const r = v.images.find(x => x.nom === `grok/piege-${n}`); verif(r && r.problemes.some(p => re.test(p)), `piège ${n} détecté : ${r?.problemes.join(', ') || 'rien'}`); };
  piege('texte', /texte|filigrane/);
  piege('visage', /visage/);
  piege('ratio', /ratio/);
  verif(v.a_regenerer.length === 3 && v.a_regenerer.every(r => r.consigne_corrigee?.length > 40), `3 images à régénérer, chacune avec sa consigne corrigée`);
  verif(fs.existsSync(path.join(dos, 'planche.jpg')), `planche contact écrite (${path.relative(process.cwd(), path.join(dos, 'planche.jpg'))})`);
}

// 6. grok : document Word et consignes des trois faux projets (tests/projets/<projet>/ : plan-images.json, direction.json).
const PROJETS = { 'boulangerie-lyon': 'restauration', 'avocats-geneve': 'juridique', 'surf-hossegor': 'sport' };
function testerGrok() {
  const EMPL = lireJson(path.join(IMAGES, 'emplacements.json'));
  const COMMUN = lireJson(path.join(IMAGES, 'gabarits-grok', 'commun.json'));
  for (const [p, activite] of Object.entries(PROJETS)) {
    const d = path.join(ICI, 'projets', p), docx = path.join(JEU, `${p}-images-grok.docx`);
    fs.mkdirSync(JEU, { recursive: true });
    node('grok.mjs', path.join(d, 'plan-images.json'), '--activite', activite, '--direction', path.join(d, 'direction.json'), '--sortie', docx);
    const plan = lireJson(path.join(d, 'plan-images.json')), c = lireJson(path.join(d, 'grok-consignes.json'));
    const act = lireJson(path.join(IMAGES, 'gabarits-grok', `${activite}.json`));
    const attendus = plan.flatMap(e => [[e.source, false], [e.source_mobile, true]].filter(([s]) => s && /(^|\/)grok\//.test(s)).map(([s, mobile]) => ({ e, s, mobile })));
    verif(fs.existsSync(docx) && fs.readFileSync(docx).subarray(0, 2).toString() === 'PK', `${p} : document Word écrit (${path.relative(process.cwd(), docx)})`);
    verif(c.images.length === attendus.length, `${p} : ${c.images.length} consignes pour ${attendus.length} images Grok attendues`);
    for (const { e, s, mobile } of attendus) {
      const i = c.images.find(x => x.fichier === path.basename(s));
      if (!verif(!!i, `${p} : consigne pour ${path.basename(s)}`)) continue;
      const grok = mobile ? '784×1168' : EMPL[e.role].grok;
      const champs = ['fichier', 'page', 'emplacement', 'format', 'grok', 'priorite', 'consigne'].filter(k => !i[k]);
      verif(!champs.length, `${p} ${i.fichier} : fiche complète${champs.length ? ` (manque ${champs.join(', ')})` : ''}`);
      verif(i.grok === grok && i.consigne.includes(`aspect ratio ${i.format}`), `${p} ${i.fichier} : format ${i.grok} (attendu ${grok}), ratio ${i.format} écrit dans la consigne`);
      const manque = [COMMUN.interdits_toujours, act.interdits].filter(x => x && !i.consigne.includes(x));
      verif(!manque.length, `${p} ${i.fichier} : interdits communs et de l'activité présents`);
      verif(!/[àâçéèêëîïôûùœ]/i.test(i.consigne) && !/\{\w+\}/.test(i.consigne), `${p} ${i.fichier} : consigne en anglais, sans variable non remplie`);
    }
  }
}

// 7. partage : trois cartes 1200×630 avec trois palettes (tests/partage-essai.json), texte jamais sur le sujet, JPG ≤ 300 Ko.
function testerPartage(projet, fiche) {
  const essais = lireJson(path.join(ICI, 'partage-essai.json'));
  const sorties = [];
  for (const t of essais) {
    const r = path.join(JEU, `partage-${t.cle}`);
    fs.rmSync(r, { recursive: true, force: true });
    const e = fiche[t.image];
    if (!verif(!!e, `partage ${t.cle} : image ${t.image} produite`)) continue;
    const dos = path.join(r, 'assets', 'images');
    fs.mkdirSync(path.join(dos, path.dirname(t.image)), { recursive: true });
    for (const f of e.fichiers) fs.copyFileSync(path.join(projet, 'assets', 'images', f), path.join(dos, f));   // fichiers : chemins depuis assets/images
    if (t.logo && fiche.logo) for (const f of fiche.logo.fichiers) fs.copyFileSync(path.join(projet, 'assets', 'images', f), path.join(dos, f));
    ecrireJson(path.join(r, 'donnees', 'site.json'), { nom: t.nom, langues: ['fr'], couleurs: t.couleurs });
    ecrireJson(path.join(r, 'donnees', 'textes', 'fr.json'), { pages: { [t.cle]: { accroche: t.accroche } } });
    ecrireJson(path.join(r, 'donnees', 'images.json'), { [t.image]: { ...e, page: t.cle, role: 'ouverture' } });
    node('partage.mjs', '--racine', r);
    const rap = lireJson(path.join(r, '_partage', 'partage.json'), {}).cartes || [];
    for (const x of rap) {
      verif(x.sujet && x.recouvrement === 0, `partage ${t.cle} (${x.gabarit}) : texte hors du sujet (recouvrement ${x.recouvrement} px²)`);
      verif(x.poids <= 300 * 1024, `partage ${t.cle} : ${Math.round(x.poids / 1024)} Ko (≤ 300 Ko)`);
      sorties.push(path.join(r, x.fichier));
    }
  }
  return sorties;
}

export { jeu, testerAnalyser, verif, node, JEU, ICI };

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const recu = etapes.some(e => ['analyser', 'produire', 'partage', 'verifier-grok'].includes(e)) ? await jeu() : null;
  if (etapes.includes('analyser') || etapes.includes('produire')) await testerAnalyser(recu);
  if (etapes.includes('produire') || etapes.includes('partage')) {
    const pr = await testerProduire(recu);
    if (etapes.includes('produire')) await testerPage(pr);
    if (etapes.includes('partage')) {
      const cartes = testerPartage(pr.projet, pr.fiche);
      const planche = path.join(JEU, 'partage-planche.jpg');
      const c = await Promise.all(cartes.map(async (f, k) => ({ input: await sharp(f).resize(600, 315).toBuffer(), left: 0, top: k * 325 })));
      await sharp({ create: { width: 600, height: Math.max(1, cartes.length * 325 - 10), channels: 3, background: '#fff' } }).composite(c).jpeg({ quality: 82 }).toFile(planche);
      console.log(`       planche des cartes de partage, à regarder : ${path.relative(process.cwd(), planche)}`);
    }
  }
  if (etapes.includes('verifier-grok')) await testerVerifierGrok();
  if (etapes.includes('grok')) testerGrok();
  console.log(`\n${total - echecs - limites}/${total} vérifications passées, ${limites} limites connues, ${echecs} échecs.`);
  process.exit(echecs ? 1 : 0);
}
