// Produit les images du site à partir du plan écrit par Claude : recadrage autour du sujet, variantes WebP, fiche images.json.
// node images/produire.mjs plan-images.json [--racine .] [--forcer]
//
// plan-images.json : [{ "source": "recu/salle.jpg", "nom": "ouverture", "role": "ouverture", "alt": "…", "mobile": true,
//                       "zone_texte": "gauche", "ratio": "16:9", "largeurs": [640, 1280], "cadrage": [50, 40] }]
// - Formats par rôle : images/emplacements.json ; ratio et largeurs du plan l'emportent. role "logo" : jamais recadré.
// - Sujet et cadrage : analyse.json du dossier de la source (analyser.mjs est lancé seul s'il manque ou date d'avant l'image).
//   Recadrage qui garde le sujet entier (tête entière pour un portrait), jamais au centre par défaut ;
//   zone_texte (gauche, droite, haut, bas) : le sujet passe de l'autre côté, la zone calme reste libre pour le texte.
// - WebP qualité 80, jamais agrandi plus de 1,5 fois : une largeur impossible est retirée et l'image marquée faible.
// - Écrit assets/images/<nom>-<largeur>.webp, <nom>-mobile-<largeur>.webp (9:16) comme le socle, et donnees/images.json
//   (largeurs, ratio, cadrage, alt, rôle, mention « Illustration générée », code c.media prêt à coller).
// - Idempotent : une image dont la source et les réglages n'ont pas changé n'est pas refaite (--forcer pour tout refaire).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { ICI, args, lireJson, ecrireJson, ko, arrondi } from './commun.mjs';

const { pos, opts } = args();
if (!pos[0]) { console.error('usage : node images/produire.mjs plan-images.json [--racine .] [--forcer]'); process.exit(1); }
const RACINE = path.resolve(typeof opts.racine === 'string' ? opts.racine : '.');
const fPlan = path.resolve(pos[0]);
const plan = lireJson(fPlan);
if (!Array.isArray(plan)) { console.error(`plan illisible : ${fPlan}`); process.exit(1); }
const EMPL = lireJson(path.join(ICI, 'emplacements.json'), {});
const fFiche = path.join(RACINE, 'donnees', 'images.json');
const ancienne = lireJson(fFiche, {});
const LARGEURS_MOBILE = [640, 1080];
const AGRANDISSEMENT_MAX = 1.5;
const SIZES = { ouverture: '100vw', 'section-fond': '100vw', '404': '100vw', 'carte-service': '(max-width: 760px) 100vw, 33vw', galerie: '(max-width: 760px) 100vw, 50vw',
  portrait: '(max-width: 760px) 100vw, 40vw', produit: '(max-width: 760px) 50vw, 25vw', vignette: '(max-width: 760px) 50vw, 25vw', logo: '240px' };

const borne = (v, a, b) => Math.min(b, Math.max(a, v));
const ratioNum = r => { if (typeof r === 'number') return r; const m = String(r).match(/(\d+(?:\.\d+)?)\s*[:/x×]\s*(\d+(?:\.\d+)?)/); return m ? m[1] / m[2] : null; };

// Analyse de la source : analyse.json de son dossier, relancée si besoin.
const analyses = new Map();
function analyse(source) {
  const dos = path.dirname(source), f = path.join(dos, 'analyse.json');
  const perime = () => !fs.existsSync(f) || fs.statSync(f).mtimeMs < fs.statSync(source).mtimeMs || !(lireJson(f)?.images || []).some(i => i.fichier === path.basename(source));
  if (!analyses.has(dos) || perime()) {
    if (perime()) {
      console.log(`  analyse de ${path.relative(RACINE, dos) || '.'}…`);
      execFileSync(process.execPath, [path.join(ICI, 'analyser.mjs'), dos, '--sortie', f], { stdio: 'ignore' });
    }
    analyses.set(dos, lireJson(f, { images: [] }));
  }
  return analyses.get(dos).images.find(i => i.fichier === path.basename(source));
}

// Rectangle au ratio voulu, le plus grand possible, qui contient le sujet et place le point de cadrage là où il faut.
// cible = position voulue du point dans le cadre (0,5 = centré ; 0,68 = à droite pour un texte à gauche).
function cadre(W, H, ratio, sujet, point, cible = [0.5, 0.5]) {
  let w = W, h = Math.round(W / ratio);
  if (h > H) { h = H; w = Math.round(H * ratio); }
  const place = (taille, total, p, s0, s1, c) => {
    let x = p - taille * c;                                          // point à sa place
    if (s1 - s0 <= taille) x = borne(x, s1 - taille, s0);            // sujet entier si possible
    return Math.round(borne(x, 0, total - taille));
  };
  const s = sujet || { x: point[0] - 1, y: point[1] - 1, l: 2, h: 2 };
  const x = place(w, W, point[0] / 100 * W, s.x / 100 * W, (s.x + s.l) / 100 * W, cible[0]);
  const y = place(h, H, point[1] / 100 * H, s.y / 100 * H, (s.y + s.h) / 100 * H, cible[1]);
  return { left: x, top: y, width: w, height: h };
}
const pointDans = (r, point, W, H) => [Math.round(borne((point[0] / 100 * W - r.left) / r.width * 100, 0, 100)), Math.round(borne((point[1] / 100 * H - r.top) / r.height * 100, 0, 100))];

async function variantes(entree, rect, largeurs, base, max) {
  const faites = [], retirees = [];
  for (const L of largeurs) {
    if (L > rect.width * max) { retirees.push(L); continue; }
    const fichier = `${base}-${L}.webp`;
    const sortie = path.join(RACINE, 'assets', 'images', fichier);
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    const info = await sharp(entree, { failOn: 'none' }).rotate().extract(rect).resize({ width: L, kernel: 'lanczos3' }).webp({ quality: 80, effort: 5 }).toFile(sortie);
    faites.push({ largeur: L, hauteur: info.height, poids: info.size, fichier });
  }
  // Source trop petite pour toutes les largeurs : une seule variante à sa taille (au plus 1,5 fois).
  if (!faites.length && largeurs.length) {
    const L = Math.min(Math.round(rect.width * max), Math.min(...largeurs));
    const fichier = `${base}-${L}.webp`, sortie = path.join(RACINE, 'assets', 'images', fichier);
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    const info = await sharp(entree, { failOn: 'none' }).rotate().extract(rect).resize({ width: L }).webp({ quality: 80, effort: 5 }).toFile(sortie);
    faites.push({ largeur: L, hauteur: info.height, poids: info.size, fichier });
  }
  return { faites, retirees };
}
// Retire les variantes d'un nom qui ne sont plus produites (largeurs changées).
function nettoyer(base, garder) {
  const dos = path.join(RACINE, 'assets', 'images', path.dirname(base)), b = path.basename(base);
  if (!fs.existsSync(dos)) return;
  for (const f of fs.readdirSync(dos)) if (new RegExp(`^${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(mobile-)?\\d+\\.webp$`).test(f) && !garder.includes(path.posix.join(path.dirname(base), f).replace(/^\.\//, ''))) fs.rmSync(path.join(dos, f));
}

const fiche = {};
let refaites = 0, inchangees = 0, erreurs = 0;
for (const e of plan) {
  const source = path.resolve(path.dirname(fPlan), e.source);
  if (!e.nom || !e.source) { console.log(`ECHEC entrée sans nom ou sans source : ${JSON.stringify(e)}`); erreurs++; continue; }
  if (!fs.existsSync(source)) { console.log(`ECHEC ${e.nom} : source introuvable (${e.source})`); erreurs++; continue; }
  const role = e.role || 'galerie';
  const em = EMPL[role] || {};
  const logo = role === 'logo' || em.recadrer === false;
  const svg = /\.svg$/i.test(source);
  const st = fs.statSync(source);
  const reglages = JSON.stringify({ e, em, v: 3 });
  const empreinte = crypto.createHash('sha1').update(`${source}|${st.size}|${st.mtimeMs}|${reglages}`).digest('hex').slice(0, 16);
  const avant = ancienne[e.nom];
  if (!opts.forcer && avant?.empreinte === empreinte && avant.fichiers.every(f => fs.existsSync(path.join(RACINE, 'assets', 'images', f)))) {
    fiche[e.nom] = avant; inchangees++; console.log(`= ${e.nom} inchangée`); continue;
  }
  try {
    const grok = e.nom.startsWith('grok/') || e.nom.includes('/grok/');
    const base = { nom: e.nom, source: e.source, role, alt: e.alt ?? '', grok, mention: grok ? 'Illustration générée' : null, empreinte };
    if (svg) {
      const sortie = path.join(RACINE, 'assets', 'images', `${e.nom}.svg`);
      fs.mkdirSync(path.dirname(sortie), { recursive: true });
      fs.copyFileSync(source, sortie);
      fiche[e.nom] = { ...base, largeurs: [], fichiers: [`${e.nom}.svg`], ratio: null, cadrage: null, faible: false,
        media: `c.media({ nom: '${e.nom}', alt: ${JSON.stringify(e.alt ?? '')}, sizes: '${SIZES.logo}' })` };
      console.log(`OK ${e.nom}.svg (copié tel quel)`); refaites++; continue;
    }
    const meta = await sharp(source, { failOn: 'none' }).metadata();
    const W = meta.autoOrient?.width ?? meta.width, H = meta.autoOrient?.height ?? meta.height;
    const a = logo ? null : analyse(source);
    const sujet = a?.sujet || null;
    const point = e.cadrage || a?.cadrage || null;
    if (!logo && !point) throw new Error('aucun cadrage (analyse impossible et pas de cadrage dans le plan)');
    const largeurs = (e.largeurs || em.largeurs || [640, 1280, 1920]).slice().sort((x, y) => x - y);
    const ratio = logo ? W / H : (ratioNum(e.ratio || em.ratio) || W / H);
    const zone = e.zone_texte === true ? (a?.zones_calmes?.[0]?.cote || 'gauche') : e.zone_texte || null;
    const cible = { gauche: [0.68, 0.5], droite: [0.32, 0.5], haut: [0.5, 0.66], bas: [0.5, 0.36] }[zone] || [0.5, 0.5];
    // Portrait : la tête entière garde de l'air au-dessus.
    const cibleRole = role === 'portrait' && !zone ? [0.5, 0.38] : cible;
    const rect = logo ? { left: 0, top: 0, width: W, height: H } : cadre(W, H, ratio, sujet, point, cibleRole);
    const { faites, retirees } = await variantes(source, rect, logo ? largeurs.filter(L => L <= W) : largeurs, e.nom, logo ? 1 : AGRANDISSEMENT_MAX);
    const cad = logo ? null : pointDans(rect, point, W, H);
    let mobile = null;
    if (!logo && (e.mobile ?? !!em.mobile)) {
      const rm = ratioNum(typeof e.mobile === 'string' ? e.mobile : em.mobile || '9:16') || 9 / 16;
      const cibleMobile = zone === 'haut' ? [0.5, 0.62] : zone === 'bas' ? [0.5, 0.36] : [0.5, 0.42];
      const r2 = cadre(W, H, rm, sujet, point, cibleMobile);
      const v = await variantes(source, r2, LARGEURS_MOBILE, `${e.nom}-mobile`, AGRANDISSEMENT_MAX);
      mobile = { ratio: typeof e.mobile === 'string' ? e.mobile : em.mobile || '9:16', ...v, cadrage: pointDans(r2, point, W, H), rect: r2 };
    }
    const fichiers = [...faites.map(f => f.fichier), ...(mobile?.faites || []).map(f => f.fichier)];
    nettoyer(e.nom, fichiers);
    const faible = retirees.length > 0 || !!a?.qualite?.faible;   // une largeur téléphone manquante est notée, pas rédhibitoire
    const cadrage = cad ? `${cad[0]}% ${cad[1]}%` : null, cadrageMobile = mobile ? `${mobile.cadrage[0]}% ${mobile.cadrage[1]}%` : null;
    const r = logo ? null : (e.ratio || em.ratio || null);
    const appel = [`nom: '${e.nom}'`, `alt: ${JSON.stringify(e.alt ?? '')}`, cadrage && cadrage !== '50% 50%' ? `cadrage: '${cadrage}'` : '', cadrageMobile ? `cadrageMobile: '${cadrageMobile}'` : '',
      `sizes: '${SIZES[role] || '100vw'}'`, role === 'ouverture' ? 'priorite: true' : '', r && !['ouverture', 'section-fond'].includes(role) ? `ratio: '${String(r).replace(':', ' / ')}'` : ''].filter(Boolean).join(', ');
    fiche[e.nom] = { ...base, ratio: r, largeurs: faites.map(f => f.largeur), mobile: mobile ? { ratio: mobile.ratio, largeurs: mobile.faites.map(f => f.largeur), cadrage: cadrageMobile } : null,
      cadrage, zone_texte: zone, recadrage: logo ? null : { ...rect, source: [W, H] }, faible,
      raisons_faible: [...(retirees.length ? [`largeurs retirées (source trop petite) : ${retirees.join(', ')}`] : []), ...(mobile?.retirees.length ? [`mobile : ${mobile.retirees.join(', ')}`] : []), ...(a?.qualite?.raisons || [])],
      fichiers, poids: Object.fromEntries([...faites, ...(mobile?.faites || [])].map(f => [f.fichier, f.poids])), media: `c.media({ ${appel} })` };
    for (const f of [...faites, ...(mobile?.faites || [])]) console.log(`OK ${f.fichier} ${f.largeur}x${f.hauteur} ${ko(f.poids)}${f.poids > 300_000 ? '  (plus de 300 Ko)' : ''}`);
    if (retirees.length) console.log(`   ${e.nom} : ${retirees.join(', ')} retirées du srcset (source ${rect.width} px de large après recadrage) : faible`);
    refaites++;
  } catch (err) {
    console.log(`ECHEC ${e.nom} : ${err.message}`); erreurs++;
  }
}
// La fiche ne garde que les noms du plan.
ecrireJson(fFiche, fiche);
console.log(`\n${refaites} produites, ${inchangees} inchangées, ${erreurs} en échec. Fiche : ${path.relative(process.cwd(), fFiche)}`);
if (erreurs) process.exit(1);
