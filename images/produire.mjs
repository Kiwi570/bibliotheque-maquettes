// Produit les images du site à partir du plan écrit par Claude : recadrage autour du sujet, variantes WebP, fiche images.json.
// node images/produire.mjs plan-images.json [--racine .] [--forcer]
//
// plan-images.json : [{ "source": "recu/salle.jpg", "nom": "ouverture", "role": "ouverture", "alt": "…", "mobile": true,
//                       "zone_texte": "gauche", "ratio": "16:9", "largeurs": [640, 1280], "cadrage": [50, 40],
//                       "source_mobile": "recu/grok/salle-portrait.webp" (facultatif : image à part pour le téléphone) }]
//   Champs lus par grok.mjs (ignorés ici) : page, emplacement, priorite, gabarit, scene.
//   "beaute": 1 à 5, la note que Claude donne à chaque photo et image Grok en regardant les planches (11 novembre 2026 : sur les
//   Jardins de l'Hacienda, un ours en peluche sur la cheminée, une table rouge floue et une chaise en peau de mouton occupaient
//   les grands emplacements ; aucune n'était « faible » techniquement, toutes l'étaient à l'œil). 5 : photo de magazine ;
//   4 : belle, tient en grand ; 3 : correcte, en moyen ou en petit ; 2 : faible (floue, sombre, encombrée, décor parasite,
//   datée), en vignette seulement ; 1 : à écarter. Recopiée dans donnees/images.json ; l'audit refuse une image notée 2 ou
//   moins (ou faible) affichée en grand, et signale une 3 en très grand. Les ouvertures et fonds de section : 4 ou 5.
// - Formats par rôle : images/emplacements.json ; ratio et largeurs du plan l'emportent. role "logo" : jamais recadré.
// - Sujet et cadrage : analyse.json du dossier de la source (analyser.mjs est lancé seul s'il manque ou date d'avant l'image).
//   Recadrage qui garde le sujet entier (tête entière pour un portrait), jamais au centre par défaut ;
//   zone_texte (gauche, droite, haut, bas) : le sujet passe de l'autre côté, la zone calme reste libre pour le texte.
// - WebP qualité 80 (baissée par paliers jusqu'à 56 si un fichier dépasse 300 Ko), jamais agrandi plus de 1,5 fois : une largeur impossible est retirée et l'image marquée faible.
// - Écrit assets/images/<nom>-<largeur>.webp, <nom>-mobile-<largeur>.webp (9:16) comme le socle, et donnees/images.json
//   (largeurs, ratio, cadrage, alt, rôle, mention « Illustration générée », faible et ses raisons, avertissements à regarder,
//   code c.media prêt à coller).
// - Idempotent : une image dont la source et les réglages n'ont pas changé n'est pas refaite (--forcer pour tout refaire).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { ICI, DONNEES, args, lireJson, ecrireJson, ko, arrondi } from './commun.mjs';

const { pos, opts } = args();
if (!pos[0]) { console.error('usage : node images/produire.mjs plan-images.json [--racine .] [--forcer]'); process.exit(1); }
const RACINE = path.resolve(typeof opts.racine === 'string' ? opts.racine : '.');
const fPlan = path.resolve(pos[0]);
const plan = lireJson(fPlan);
if (!Array.isArray(plan)) { console.error(`plan illisible : ${fPlan}`); process.exit(1); }
const EMPL = lireJson(path.join(DONNEES, 'emplacements.json'), {});
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

// Rectangle du sujet ramené au cadre recadré (en %), pour que partage.mjs ne pose jamais de texte dessus.
function sujetDans(r, s, W, H) {
  const x0 = borne((s.x / 100 * W - r.left) / r.width * 100, 0, 100), y0 = borne((s.y / 100 * H - r.top) / r.height * 100, 0, 100);
  const x1 = borne(((s.x + s.l) / 100 * W - r.left) / r.width * 100, 0, 100), y1 = borne(((s.y + s.h) / 100 * H - r.top) / r.height * 100, 0, 100);
  return { x: arrondi(x0), y: arrondi(y0), l: arrondi(x1 - x0), h: arrondi(y1 - y0) };
}
async function variantes(entree, rect, largeurs, base, max) {
  const faites = [], retirees = [];
  for (const L of largeurs) {
    if (L > rect.width * max) { retirees.push(L); continue; }
    const fichier = `${base}-${L}.webp`;
    const sortie = path.join(RACINE, 'assets', 'images', fichier);
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    const info = await ecrireWebp(sharp(entree, { failOn: 'none' }).rotate().extract(rect).resize({ width: L, kernel: 'lanczos3' }), sortie);
    faites.push({ largeur: L, hauteur: info.height, poids: info.size, qualite: info.qualite, fichier });
  }
  // Source trop petite pour toutes les largeurs : une seule variante à sa taille (au plus 1,5 fois).
  if (!faites.length && largeurs.length) {
    const L = Math.min(Math.round(rect.width * max), Math.min(...largeurs));
    const fichier = `${base}-${L}.webp`, sortie = path.join(RACINE, 'assets', 'images', fichier);
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    const info = await ecrireWebp(sharp(entree, { failOn: 'none' }).rotate().extract(rect).resize({ width: L }), sortie);
    faites.push({ largeur: L, hauteur: info.height, poids: info.size, qualite: info.qualite, fichier });
  }
  return { faites, retirees };
}
// WebP qualité 80 ; au-dessus de 300 Ko (règle média), qualité baissée par paliers jusqu'à 56 au plus bas.
const POIDS_MAX = 300 * 1024;
async function ecrireWebp(pipeline, sortie) {
  let buf, info, q;
  for (q of [80, 74, 68, 62, 56]) {
    ({ data: buf, info } = await pipeline.clone().webp({ quality: q, effort: 5 }).toBuffer({ resolveWithObject: true }));
    if (buf.length <= POIDS_MAX) break;
  }
  fs.writeFileSync(sortie, buf);
  return { height: info.height, size: buf.length, qualite: q };
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
  const stM = e.source_mobile && fs.existsSync(path.resolve(path.dirname(fPlan), e.source_mobile)) ? fs.statSync(path.resolve(path.dirname(fPlan), e.source_mobile)) : null;
  const reglages = JSON.stringify({ e: { ...e, beaute: undefined }, em, v: 4 }); // la note de beauté ne refait pas l'image
  const empreinte = crypto.createHash('sha1').update(`v5|${source}|${st.size}|${st.mtimeMs}|${stM?.size}|${stM?.mtimeMs}|${reglages}`).digest('hex').slice(0, 16);
  const avant = ancienne[e.nom];
  if (!opts.forcer && avant?.empreinte === empreinte && avant.fichiers.every(f => fs.existsSync(path.join(RACINE, 'assets', 'images', f)))) {
    fiche[e.nom] = { ...avant, beaute: e.beaute ?? null }; inchangees++; console.log(`= ${e.nom} inchangée`); continue;
  }
  try {
    const grok = e.nom.startsWith('grok/') || e.nom.includes('/grok/');
    const base = { nom: e.nom, source: e.source, role, alt: e.alt ?? '', grok, mention: grok ? 'Illustration générée' : null, beaute: e.beaute ?? null, empreinte };
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
      // source_mobile : image à part pour le téléphone (une image Grok en portrait, par exemple), sinon la même source.
      let srcM = source, Wm = W, Hm = H, sujetM = sujet, pointM = point;
      if (e.source_mobile) {
        srcM = path.resolve(path.dirname(fPlan), e.source_mobile);
        if (!fs.existsSync(srcM)) throw new Error(`source_mobile introuvable (${e.source_mobile})`);
        const mm = await sharp(srcM, { failOn: 'none' }).metadata(), am = analyse(srcM);
        Wm = mm.autoOrient?.width ?? mm.width; Hm = mm.autoOrient?.height ?? mm.height; sujetM = am?.sujet || null; pointM = e.cadrage_mobile || am?.cadrage || [50, 50];
      }
      const r2 = cadre(Wm, Hm, rm, sujetM, pointM, cibleMobile);
      const v = await variantes(srcM, r2, LARGEURS_MOBILE, `${e.nom}-mobile`, AGRANDISSEMENT_MAX);
      mobile = { ratio: typeof e.mobile === 'string' ? e.mobile : em.mobile || '9:16', ...v, cadrage: pointDans(r2, pointM, Wm, Hm), rect: r2 };
    }
    const fichiers = [...faites.map(f => f.fichier), ...(mobile?.faites || []).map(f => f.fichier)];
    nettoyer(e.nom, fichiers);
    const faible = retirees.length > 0 || !!a?.qualite?.faible;
    // À regarder sans être rédhibitoire : largeur téléphone manquante, agrandissement, recadrage fort d'une image à texte.
    const avertissements = [];
    if (mobile?.retirees.length) avertissements.push(`version téléphone sans ${mobile.retirees.join(', ')} px (source trop petite)`);
    const agr = logo || !faites.length ? 1 : Math.max(...faites.map(f => f.largeur)) / rect.width;
    if (agr > 1.05) avertissements.push(`agrandie ${String(Math.round(agr * 100) / 100).replace('.', ',')} fois (source de ${rect.width} px après recadrage)`);
    const garde = logo ? 1 : (rect.width * rect.height) / (W * H);
    if (garde < 0.6 && a?.lisible?.niveau && a.lisible.niveau !== 'decoratif')
      avertissements.push(`recadrage fort (${Math.round(garde * 100)} % de l'image gardée) sur une image qui contient du texte (${a.lisible.niveau}) : texte coupé probable, choisir un autre rôle ou une autre image`);
    else if (garde < 0.45) avertissements.push(`recadrage fort : ${Math.round(garde * 100)} % de l'image gardée`);
    const cadrage = cad ? `${cad[0]}% ${cad[1]}%` : null, cadrageMobile = mobile ? `${mobile.cadrage[0]}% ${mobile.cadrage[1]}%` : null;
    const r = logo ? null : (e.ratio || em.ratio || null);
    const appel = [`nom: '${e.nom}'`, `alt: ${JSON.stringify(e.alt ?? '')}`, cadrage && cadrage !== '50% 50%' ? `cadrage: '${cadrage}'` : '', cadrageMobile ? `cadrageMobile: '${cadrageMobile}'` : '',
      `sizes: '${SIZES[role] || '100vw'}'`, role === 'ouverture' ? 'priorite: true' : '', r && !['ouverture', 'section-fond'].includes(role) ? `ratio: '${String(r).replace(':', ' / ')}'` : ''].filter(Boolean).join(', ');
    fiche[e.nom] = { ...base, ratio: r, largeurs: faites.map(f => f.largeur), mobile: mobile ? { ratio: mobile.ratio, largeurs: mobile.faites.map(f => f.largeur), cadrage: cadrageMobile } : null,
      cadrage, sujet: sujet && !logo ? sujetDans(rect, sujet, W, H) : null, zones_calmes: a?.zones_calmes?.map(z => ({ cote: z.cote, score: z.score, ton: z.ton })) || null,
      zone_texte: zone, recadrage: logo ? null : { ...rect, source: [W, H] }, faible,
      raisons_faible: [...(retirees.length ? [`largeurs retirées (source trop petite) : ${retirees.join(', ')}`] : []), ...(a?.qualite?.raisons || [])],
      avertissements,
      fichiers, poids: Object.fromEntries([...faites, ...(mobile?.faites || [])].map(f => [f.fichier, f.poids])), media: `c.media({ ${appel} })` };
    for (const f of [...faites, ...(mobile?.faites || [])]) console.log(`OK ${f.fichier} ${f.largeur}x${f.hauteur} ${ko(f.poids)}${f.poids > 300_000 ? '  (plus de 300 Ko)' : ''}`);
    if (retirees.length) console.log(`   ${e.nom} : ${retirees.join(', ')} retirées du srcset (source ${rect.width} px de large après recadrage) : faible`);
    for (const x of avertissements) console.log(`   A REGARDER ${e.nom} : ${x}`);
    refaites++;
  } catch (err) {
    console.log(`ECHEC ${e.nom} : ${err.message}`); erreurs++;
  }
}
// La fiche ne garde que les noms du plan.
ecrireJson(fFiche, fiche);
/* Beauté : chaque image du plan (hors logo et dessin) est notée ; les grands emplacements n'acceptent que 4 ou 5. */
const GRANDS = new Set(['ouverture', 'section-fond', '404']);
const nonNotees = [], tropFaibles = [];
for (const e of plan) {
  const f = fiche[e.nom]; if (!f || f.role === 'logo' || /\.svg$/i.test(e.source || '')) continue;
  const b = Number(e.beaute);
  if (!(b >= 1 && b <= 5)) nonNotees.push(e.nom);
  else if (GRANDS.has(f.role) && (b <= 3 || f.faible)) tropFaibles.push(`${e.nom} (${f.role}, ${b}/5${f.faible ? ', faible' : ''})`);
  else if (b <= 2 && !['vignette', 'produit', 'logo'].includes(f.role)) tropFaibles.push(`${e.nom} (${f.role}, ${b}/5 : en vignette seulement, ou à remplacer)`);
}
if (nonNotees.length) console.log(`A REGARDER : ${nonNotees.length} image(s) sans note de beauté (« beaute » de 1 à 5 dans le plan) : ${nonNotees.join(', ')}`);
if (tropFaibles.length) console.log(`A REGARDER : image(s) trop faibles pour leur emplacement (une ouverture ou un fond veut 4 ou 5 : meilleure photo du client ou image Grok) :\n   ${tropFaibles.join('\n   ')}`);
console.log(`\n${refaites} produites, ${inchangees} inchangées, ${erreurs} en échec. Fiche : ${path.relative(process.cwd(), fFiche)}`);
if (erreurs) process.exit(1);
