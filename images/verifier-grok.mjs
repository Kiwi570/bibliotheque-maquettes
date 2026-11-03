// Contrôle des images Grok reçues, avant de les produire.
// node images/verifier-grok.mjs recu/grok/ plan-images.json [--consignes grok-consignes.json]
//
// - Chaque fichier attendu (entrées du plan dont la source ou la source_mobile est dans le dossier Grok) est là, avec le bon nom
//   (extension libre), un ratio compatible avec le format demandé à Grok (à 5 % près) et une largeur suffisante.
// - Détecte le texte, les lettres et les filigranes (lecture de texte de Vision, coins compris), les bordures ou cadres,
//   et les visages nets (une silhouette lointaine ou floue passe).
// - Quand la consigne annonce des mains : compte les mains et les bouts de doigts reconnus (pose de la main de Vision).
//   Indicatif seulement : un doigt en trop ne se détecte pas, il faut regarder la planche.
// - Écrit <dossier>/planche.jpg (rouge : à régénérer ; orange : mains à regarder) et <dossier>/verification.json,
//   et liste ce qui est à régénérer avec la consigne corrigée (consignes écrites par grok.mjs dans grok-consignes.json).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ICI, args, lireJson, ecrireJson, vision, planche, arrondi, EXT_IMAGES } from './commun.mjs';

const { pos, opts } = args();
if (pos.length < 2) { console.error('usage : node images/verifier-grok.mjs recu/grok/ plan-images.json [--consignes grok-consignes.json]'); process.exit(1); }
const DOSSIER = path.resolve(pos[0]);
const fPlan = path.resolve(pos[1]);
const plan = lireJson(fPlan, []);
const fCons = path.resolve(typeof opts.consignes === 'string' ? opts.consignes : path.join(path.dirname(fPlan), 'grok-consignes.json'));
const consignes = lireJson(fCons, { images: [] });
const EMPL = lireJson(path.join(ICI, 'emplacements.json'), {});
const COMMUN = lireJson(path.join(ICI, 'gabarits-grok', 'commun.json'), {});
const sansExt = f => path.basename(f).replace(/\.[^.]+$/, '');

// Fichiers attendus : sources (et sources mobiles) du plan dans le dossier Grok (même dossier, quel que soit le chemin écrit).
const dansGrok = src => src && path.resolve(path.dirname(fPlan), path.dirname(src)) === DOSSIER;
const attendus = plan.flatMap(e => [[e.source, false], [e.source_mobile, true]].filter(([src]) => dansGrok(src)).map(([src, mobile]) => {
  const c = consignes.images?.find(x => sansExt(x.fichier) === sansExt(src)) || (!mobile && consignes.images?.find(x => x.nom === e.nom));
  const grok = c?.grok || (mobile ? '784×1168' : EMPL[e.role]?.grok || '1168×784');
  const [gw, gh] = grok.split('×').map(Number);
  const besoin = Math.max(...(mobile ? [1080] : e.largeurs || EMPL[e.role]?.largeurs || [1280]));
  return { entree: e, mobile, base: sansExt(src), consigne: c?.consigne || null, fichierDemande: c?.fichier || path.basename(src), grok, ratio: gw / gh,
    largeurMin: Math.min(Math.max(gw, gh), Math.ceil(besoin / 1.5)) * 0.95, mainsAnnoncees: /\bhands?\b|\bmains?\b|\bfingers?\b/i.test(`${c?.consigne || ''} ${e.alt || ''}`) };
}));
const presents = fs.existsSync(DOSSIER) ? fs.readdirSync(DOSSIER).filter(f => EXT_IMAGES.test(f) && !/^planche(-\d+)?\.jpg$/.test(f)) : [];
const parBase = new Map(presents.map(f => [sansExt(f).toLowerCase(), f]));

// Netteté locale (écart type du laplacien) dans une boîte en %.
async function nettete(fichier, b, W, H) {
  const left = Math.max(0, Math.floor(b.x / 100 * W)), top = Math.max(0, Math.floor(b.y / 100 * H));
  const width = Math.max(8, Math.min(W - left, Math.ceil(b.l / 100 * W))), height = Math.max(8, Math.min(H - top, Math.ceil(b.h / 100 * H)));
  const { data, info } = await sharp(fichier).extract({ left, top, width, height }).resize({ width: 128, height: 128, fit: 'inside' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height; let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x, l = data[i - 1] + data[i + 1] + data[i - w] + data[i + w] - 4 * data[i]; s += l; s2 += l * l; n++; }
  return n ? Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)) : 0;
}
// Bordure : bandes de bord presque unies et différentes de l'intérieur (cadre, marge blanche, passe-partout).
async function bordure(fichier) {
  const { data, info } = await sharp(fichier).resize(200, 200, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, px = (x, y) => data[y * w + x];
  const bande = (f) => { let s = 0, s2 = 0, n = 0; for (let k = 0; k < 200; k++) for (let e = 0; e < 4; e++) { const v = f(k, e); s += v; s2 += v * v; n++; } const m = s / n; return { m, e: Math.sqrt(Math.max(0, s2 / n - m * m)) }; };
  const cotes = [bande((k, e) => px(k, e)), bande((k, e) => px(k, 199 - e)), bande((k, e) => px(e, k)), bande((k, e) => px(199 - e, k))];
  let s = 0, n = 0; for (let y = 20; y < 180; y++) for (let x = 20; x < 180; x++) { s += px(x, y); n++; }
  const interieur = s / n;
  const unis = cotes.filter(c => c.e < 4 && Math.abs(c.m - interieur) > 25).length;
  return unis >= 3;
}

const vis = vision(presents.map(f => path.join(DOSSIER, f)));
const resultats = [];
for (const a of attendus) {
  const f = parBase.get(a.base.toLowerCase());
  const r = { nom: a.entree.nom, mobile: a.mobile || undefined, attendu: a.fichierDemande, fichier: f || null, priorite: a.entree.priorite || null, problemes: [], indications: [] };
  if (!f) { r.problemes.push('manquant'); resultats.push(r); continue; }
  const chemin = path.join(DOSSIER, f);
  const m = await sharp(chemin).metadata();
  const W = m.width, H = m.height;
  Object.assign(r, { largeur: W, hauteur: H });
  if (Math.abs((W / H) / a.ratio - 1) > 0.05) r.problemes.push(`ratio ${arrondi(W / H, 2)} au lieu de ${a.grok}`);
  if (Math.max(W, H) < a.largeurMin && Math.abs((W / H) / a.ratio - 1) <= 0.05) r.problemes.push(`trop petite (${W}×${H})`);
  const v = vis?.get(path.resolve(chemin));
  const textes = (v?.texte || []).filter(t => t.confiance >= 0.75 && (t.texte.match(/\p{L}/gu) || []).length >= 3 && /[aeiouyàâéèêîôû]/i.test(t.texte) && t.h >= 1.2);
  const coins = textes.filter(t => (t.x < 22 || t.x + t.l > 78) && (t.y < 15 || t.y + t.h > 85) && t.l < 35);
  const ailleurs = textes.filter(t => !coins.includes(t));
  if (ailleurs.length) r.problemes.push(`texte : « ${ailleurs.map(t => t.texte).join(' / ').slice(0, 60)} »`);
  if (coins.length) r.problemes.push(`filigrane ou signature : « ${coins.map(t => t.texte).join(' / ').slice(0, 60)} »`);
  r.boites = textes.map(t => ({ x: t.x, y: t.y, l: t.l, h: t.h, couleur: '#ff2d55' }));
  for (const fz of (v?.visages || []).filter(x => x.confiance >= 0.6 && x.l >= 4)) {
    const n = await nettete(chemin, fz, W, H);
    r.boites.push({ ...fz, couleur: '#ff9500' });
    if (n >= 9 && fz.l >= 6) { r.problemes.push(`visage net (${Math.round(fz.l)} % de la largeur)`); break; }
  }
  if (await bordure(chemin)) r.problemes.push('bordure ou cadre');
  const mains = v?.mains || [];
  if (a.mainsAnnoncees || mains.length) {
    r.mains = { annoncees: a.mainsAnnoncees, vues: mains.length, doigts: mains.map(x => x.doigts) };
    for (const x of mains) r.boites.push({ ...x, couleur: '#ff9500' });
    if (a.mainsAnnoncees) r.indications.push(`mains : ${mains.length}, doigts reconnus ${mains.map(x => x.doigts).join('/') || '-'} (indicatif, à regarder)`);
  }
  resultats.push(r);
}
// Fichiers en trop (nom inconnu du plan).
const inconnus = presents.filter(f => !attendus.some(a => a.base.toLowerCase() === sansExt(f).toLowerCase()));

// Consigne corrigée : la consigne d'origine, renforcée sur ce qui a raté.
const piege = k => (COMMUN.pieges || []).find(p => new RegExp(k, 'i').test(p.sujet))?.parade;
function corriger(a, r) {
  const ajouts = [];
  for (const p of r.problemes) {
    if (/texte|filigrane/.test(p)) ajouts.push(piege('texte') || 'Absolutely no text, letters, numbers, signs, labels or writing anywhere in the image, including on objects, clothing and backgrounds; clean corners, no signature, no watermark.');
    if (/visage/.test(p)) ajouts.push(piege('visage') || 'Any person is seen from behind, in silhouette or strongly out of focus; no face is visible or recognizable.');
    if (/bordure/.test(p)) ajouts.push('Full-bleed photograph edge to edge, no border, no frame, no white margin.');
    if (/ratio|petite/.test(p)) ajouts.push(`Generate in ${a.grok.startsWith('1168') ? 'landscape' : 'portrait'} format, ${a.grok} pixels.`);
  }
  if (r.mains && a.mainsAnnoncees) ajouts.push(piege('main') || 'Hands only partially visible at the edge of the frame or out of focus, natural anatomy, five fingers.');
  return `${a.consigne || '(consigne d\'origine introuvable : relancer grok.mjs)'} ${[...new Set(ajouts)].join(' ')}`.trim();
}
const aRegenerer = resultats.filter(r => r.problemes.length && !r.problemes.includes('manquant'));
for (const r of aRegenerer) r.consigne_corrigee = corriger(attendus.find(a => a.fichierDemande === r.attendu), r);

const planches = await planche(DOSSIER, resultats.filter(r => r.fichier).map(r => ({
  fichier: r.fichier, titre: r.fichier, ligne: `${r.largeur}×${r.hauteur}${r.priorite ? ` · ${r.priorite}` : ''}`, boites: r.boites,
  drapeaux: r.problemes.length ? r.problemes : r.indications.length ? r.indications : ['ok'], alerte: r.problemes.length > 0 || r.indications.length > 0 })));
ecrireJson(path.join(DOSSIER, 'verification.json'), { date: new Date().toISOString(), plan: fPlan, attendus: attendus.length, recus: presents.length, planches, inconnus,
  manquants: resultats.filter(r => r.problemes.includes('manquant')).map(r => r.attendu), a_regenerer: aRegenerer.map(r => ({ fichier: r.fichier, problemes: r.problemes, consigne_corrigee: r.consigne_corrigee })), images: resultats });

for (const r of resultats) console.log(`${r.problemes.length ? 'A REGENERER' : r.indications.length ? 'A REGARDER' : 'OK'} ${r.fichier || r.attendu}${r.problemes.length ? ` : ${r.problemes.join(', ')}` : ''}${r.indications.length ? ` (${r.indications.join(', ')})` : ''}`);
if (inconnus.length) console.log(`Fichiers inconnus du plan (nom à vérifier) : ${inconnus.join(', ')}`);
console.log(`\n${attendus.length} attendues, ${presents.length} reçues, ${resultats.filter(r => r.problemes.includes('manquant')).length} manquantes, ${aRegenerer.length} à régénérer. Planche : ${path.join(path.relative(process.cwd(), DOSSIER) || '.', planches[0] || '')}`);
for (const r of aRegenerer) console.log(`\n${r.attendu} — ${r.problemes.join(', ')}\n${r.consigne_corrigee}`);
