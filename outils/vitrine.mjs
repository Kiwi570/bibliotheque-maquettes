// Vitrine du projet : six débuts de site (ouvertures) de la bibliothèque, choisis pour CE client, à dépasser et jamais à imiter.
// node _biblio/outils/vitrine.mjs --activite hébergement --metier "chambre d'hôtes" --besoin réserver --ton chaleureux [--depot <client>-maquette]
//   Le client se décrit comme pour chercher.mjs, d'après l'analyse de son site et de son concept :
//   --activite   activité(s) (taxonomie, répétable ou « a,b ») ; les activités voisines comptent aussi, un peu moins
//   --metier     métier précis en mots libres (« plombier », « chambre d'hôtes »)
//   --besoin     ce que le site doit faire faire (réserver, vendre, devis, rendez-vous, agenda…), répétable
//   --ton, --univers, --ambiance, --concept   l'ambiance visée (taxonomie), répétables
//   --depot      dépôt de la maquette en cours : sert de graine (même projet = même vitrine) et l'exclut s'il est déjà classé
//   --sans       dépôts à écarter (« a,b ») ; --nombre 6 ; --sortie _suivi/vitrine.jpg ; --json : la sélection seule, sans planche
//   --favoris    les maquettes favorites de l'utilisateur seulement (favoris.json) : 4 par défaut, les plus proches du client puis des
//                styles différents ; une ligne par maquette avec l'ouverture et une section de l'accueil, l'ouverture et une section
//                d'une page intérieure (le niveau visé sur tout le site, pas seulement l'accueil) ; sortie _suivi/favoris.jpg par défaut
//
// Pourquoi --favoris (13 novembre 2026) : l'utilisateur a désigné ses maquettes les plus réussies (belles, harmonieuses, fluides,
// petites animations fun). Elles disent mieux que toute règle le niveau visé ; l'accueil seul ne suffisait pas (Sandra Barba :
// accueil correct, pages intérieures « de vieux site »), d'où les captures des pages intérieures dans la même ligne.
//
// Pourquoi (10 novembre 2026) : l'aperçu de l'accueil se comparait toujours aux six mêmes ouvertures du palmarès, projet après
// projet, quel que soit le client. La vitrine part du projet :
// 1. jusqu'à trois ouvertures les plus utiles à ce client : même métier, même activité ou activité proche, mêmes besoins, ambiance
//    proche. Toutes les maquettes comptent, les plus récentes aussi : si la meilleure référence est la dernière livrée, elle est là.
//    (Ne pas recopier l'identité des dernières maquettes, c'est le rôle du « Déjà vu ? » de la planche d'intention, pas d'ici.)
// 2. puis des styles différents : clairs, sombres et surtout mixtes (clair et sombre qui alternent dans la page, ce qui se fait le
//    plus souvent), familles d'effets et plans variés, parmi les ouvertures notées 5, toujours tirées vers ce qui sert le projet
//    (graine du projet : deux projets n'ont pas la même vitrine, le même projet retrouve la sienne).
// La lumière n'est pas lue dans la fiche (clair ou sombre seulement) : elle est mesurée sur les captures de toutes les sections de
// l'accueil. Le ruban à droite de chaque capture montre cette alternance, du haut de la page en haut au pied de page en bas.
// Écrit <sortie> (planche jpg) et <sortie>.json (fiches, captures, vidéos, adresses en ligne, raison du choix).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { RACINE, TAXO, lireJson, ecrireJson, motsMetier, metierCommun, lireFavoris } from './commun.mjs';

const args = process.argv.slice(2);
const activites = [], metierMots = [], sans = [];
const client = { besoin: [], ton: [], univers: [], ambiance: [], concept: [] };
let metierBrut = '';
let depot = '', sortie = '', nombre = 0, json = false, favoris = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--activite' || a === '--activites') activites.push(...String(args[++i] || '').split(',').map((x) => x.trim()).filter(Boolean));
  else if (a === '--metier' || a === '--metiers') { const v = String(args[++i] || ''); metierBrut = [metierBrut, v].filter(Boolean).join(', '); metierMots.push(...v.split(/[\s,'’]+/).filter((x) => x.length > 2)); }
  else if (a === '--depot') depot = String(args[++i] || '');
  else if (a === '--sans') sans.push(...String(args[++i] || '').split(',').map((x) => x.trim()).filter(Boolean));
  else if (a === '--sortie') sortie = String(args[++i] || sortie);
  else if (a === '--nombre') nombre = Math.max(1, +args[++i] || 6);
  else if (a === '--json') json = true;
  else if (a === '--favoris') favoris = true;
  else if (/^--(besoins?|tons?|univers|ambiances?|concepts?)$/.test(a)) {
    const k = a.slice(2).replace(/s$/, '').replace(/^univer$/, 'univers');
    for (const x of String(args[++i] || '').split(',').map((v) => v.trim()).filter(Boolean)) {
      if (!TAXO[k].includes(x)) { console.error(`« ${x} » n'est pas dans la taxonomie (${k}) : ${TAXO[k].join(', ')}`); process.exit(1); }
      client[k].push(x);
    }
  }
  else { console.error(`option inconnue : ${a}`); process.exit(1); }
}
if (!sortie) sortie = favoris ? '_suivi/favoris.jpg' : '_suivi/vitrine.jpg';
if (!nombre) nombre = favoris ? 4 : 6;
for (const a of activites) if (!TAXO.activite.includes(a)) { console.error(`« ${a} » n'est pas une activité de la taxonomie : ${TAXO.activite.join(', ')}`); process.exit(1); }

const metierN = motsMetier(metierMots);
const voisins = new Set(activites.flatMap((a) => TAXO.voisins?.[a] || []).filter((a) => !activites.includes(a)));
const existe = (p) => p && fs.existsSync(path.join(RACINE, p));

// Graine du projet : même projet, même vitrine ; projets différents, vitrines différentes.
let graine = 2166136261;
for (const c of (depot || [...activites, ...metierN, ...Object.values(client).flat()].join('|') || 'vitrine')) graine = Math.imul(graine ^ c.charCodeAt(0), 16777619);
const hasard = () => { graine = (graine + 0x6d2b79f5) | 0; let t = graine; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// Seule la maquette en cours (si elle est déjà classée) et les dépôts de --sans sont écartés : toutes les autres comptent.
const exclus = new Set([...sans, ...(depot ? [depot] : [])]);

const FAVORIS = new Set(lireFavoris().map((f) => f.depot));

// Candidates : la meilleure ouverture notée 4 ou 5 de chaque maquette, avec sa capture.
const maquettes = new Map(fs.readdirSync(path.join(RACINE, 'maquettes')).filter((f) => f.endsWith('.json'))
  .map((f) => { const m = lireJson(path.join(RACINE, 'maquettes', f)); return [m.depot, m]; }));
const fiche = (id) => lireJson(path.join(RACINE, 'sections', id + '.json'), null);
const candidates = [];
for (const [nom, m] of maquettes) {
  if (exclus.has(nom)) continue;
  const ouvertures = (m.sections || []).map(fiche).filter((s) => s && s.role === 'ouverture' && s.note_qualite >= 4 && existe(s.medias?.capture))
    .sort((a, b) => b.note_qualite - a.note_qualite || (a.page === 'index' ? -1 : 0) - (b.page === 'index' ? -1 : 0));
  if (ouvertures.length) candidates.push({ m, s: ouvertures[0] });
}

// Lumière mesurée : chaque section de l'accueil (dans l'ordre de la page) donne sa couleur moyenne et sa hauteur.
const HORS_FLUX = new Set(['menu', 'transition-de-page', 'barre-fixe', 'decor', 'texte-legal']);
async function bande(capture) {
  try {
    const f = path.join(RACINE, capture);
    const { height = 0, width = 1440 } = await sharp(f).metadata();
    const h = Math.min(2400, Math.round((height * 1440) / (width || 1440)));
    if (h < 40) return null;
    // Moyenne sur une vignette de 24 px (stats() sur l'image entière prenait 30 ms par capture, une minute pour la bibliothèque).
    const { data, info } = await sharp(f).resize({ width: 24, fastShrinkOnLoad: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const n = info.width * info.height, t = [0, 0, 0];
    for (let i = 0; i < data.length; i += 3) { t[0] += data[i]; t[1] += data[i + 1]; t[2] += data[i + 2]; }
    const [r, g, b] = t.map((x) => Math.round(x / n));
    return { r, g, b, h, l: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 };
  } catch { return null; }
}
async function lumiere(m) {
  const captures = (m.sections || []).map(fiche)
    .filter((s) => s && s.page === 'index' && !HORS_FLUX.has(s.role) && existe(s.medias?.capture)).map((s) => s.medias.capture);
  const bandes = (await Promise.all(captures.map(bande))).filter(Boolean);
  const total = bandes.reduce((n, x) => n + x.h, 0) || 1;
  const sombre = bandes.filter((x) => x.l < 0.42).reduce((n, x) => n + x.h, 0) / total;
  const style = !bandes.length ? (m.luminosite || 'clair') : sombre < 0.18 ? 'clair' : sombre > 0.82 ? 'sombre' : 'mixte';
  return { style, part_sombre: Math.round(sombre * 100), bandes };
}
if (!favoris) for (let i = 0; i < candidates.length; i += 8) await Promise.all(candidates.slice(i, i + 8).map(async (c) => { c.lumiere = await lumiere(c.m); }));

// Proximité avec le client.
// Utilité pour le projet, avec les mêmes critères que chercher.mjs : métier, activité, besoins du site, ambiance.
function proximite({ m }) {
  let p = 0; const raisons = [];
  // Mot pour mot (racine égale), sans les mots vagues : « hôtes » ne trouve pas « hôtellerie », « avec » ne fait pas un métier.
  if (metierCommun(metierN, [m.metier, m.client].join(' ')).length) { p += 6; raisons.push('même métier'); }
  else if (activites.length && (m.activite || []).some((a) => activites.includes(a))) { p += 5; raisons.push('même activité'); }
  else if (activites.length && (m.activite || []).some((a) => voisins.has(a))) { p += 2.5; raisons.push('activité proche'); }
  const besoins = (m.besoins || []).filter((b) => client.besoin.includes(b));
  if (besoins.length) { p += 2 * Math.min(2, besoins.length); raisons.push(`besoin ${besoins.join(', ')}`); }
  const amb = [...new Set(['ton', 'univers', 'ambiance', 'concept'].flatMap((k) => (m[k] || []).filter((x) => client[k].includes(x))))];
  if (amb.length) { p += 0.7 * Math.min(4, amb.length); raisons.push(`ambiance ${amb.slice(0, 3).join(', ')}`); }
  return { p, raisons };
}
const qualite = ({ s, m }) => (s.note_qualite === 5 ? 2 : 0) + ((m.note || 70) / 100) * 2;
for (const c of candidates) { Object.assign(c, proximite(c)); c.q = qualite(c); c.alea = hasard(); }

// ---------- Favorites (--favoris) : les maquettes que l'utilisateur préfère, accueil et pages intérieures ----------
if (favoris) {
  const PAGES_HORS = /^(404|mentions|plan-du-site|confidentialite|politique|cgv|cgu|merci)/;
  const SECONDAIRES = new Set([...HORS_FLUX, 'pied-de-page', 'faq', 'contact', 'page-404', 'texte-legal', 'ouverture']);
  const meilleure = (l) => [...l].sort((a, b) => b.note_qualite - a.note_qualite)[0] || null;
  const fc = [];
  for (const d of FAVORIS) {
    const m = maquettes.get(d);
    if (!m || exclus.has(d)) continue;
    const secs = (m.sections || []).map(fiche).filter((s) => s && existe(s.medias?.capture));
    const acc = secs.filter((s) => s.page === 'index'), int = secs.filter((s) => s.page !== 'index' && !PAGES_HORS.test(s.page));
    const ouv = meilleure(acc.filter((s) => s.role === 'ouverture')) || acc[0];
    if (!ouv) continue;
    const corps = (l) => l.filter((s) => !SECONDAIRES.has(s.role));
    const vues = [['accueil', ouv], ['accueil', meilleure(corps(acc))]];
    const intOuv = meilleure(int.filter((s) => s.role === 'ouverture'));
    // La section intérieure vient d'une autre page que l'ouverture intérieure quand c'est possible : le système sur plusieurs pages.
    const intSec = meilleure(corps(int).filter((s) => !intOuv || s.page !== intOuv.page)) || meilleure(corps(int));
    vues.push([intOuv?.page || '', intOuv], [intSec?.page || '', intSec]);
    // Site d'une page : les cases vides prennent d'autres sections de l'accueil.
    const prises = new Set(vues.map((v) => v[1]).filter(Boolean));
    const reste = corps(acc).filter((s) => !prises.has(s)).sort((a, b) => b.note_qualite - a.note_qualite);
    for (const v of vues) if (!v[1] && reste.length) { v[1] = reste.shift(); v[0] = 'accueil'; }
    fc.push({ m, vues: vues.filter((v) => v[1]), pourquoi: lireFavoris().find((f) => f.depot === d)?.pourquoi || '' });
  }
  if (!fc.length) { console.error('Aucune favorite dans la bibliothèque (favoris.json vide ou maquettes absentes) : node outils/favori.mjs <nom> --pourquoi "…"'); process.exit(1); }
  for (const c of fc) { Object.assign(c, proximite(c)); c.alea = hasard(); c.lumiere = await lumiere(c.m); }
  // Les plus proches du client d'abord (la moitié au plus), puis des styles et des activités différents.
  const choix = fc.filter((x) => x.p >= 2.5).sort((a, b) => b.p + b.alea * 0.4 - (a.p + a.alea * 0.4)).slice(0, Math.ceil(nombre / 2));
  while (choix.length < Math.min(nombre, fc.length)) {
    let meilleur = null, max = -Infinity;
    for (const c of fc.filter((x) => !choix.includes(x))) {
      let g = c.alea * 3 + 0.4 * Math.min(6, c.p) - 1.5 * choix.filter((x) => x.lumiere.style === c.lumiere.style).length;
      if ((c.m.activite || []).some((a) => choix.some((x) => (x.m.activite || []).includes(a)))) g -= 0.6;
      if (g > max) { max = g; meilleur = c; }
    }
    choix.push(meilleur);
  }
  const STYLE_F = { clair: 'clair', sombre: 'sombre', mixte: 'clair et sombre alternés' };
  const enLigne = (m, page) => (m.url ? m.url + (page && page !== 'accueil' ? '/' + page : '') : null);
  const sortieF = choix.map((c, i) => ({
    rang: i + 1, maquette: c.m.depot, client: c.m.client, metier: c.m.metier, pourquoi: c.pourquoi, proche: c.raisons,
    lumiere: c.lumiere.style, note_maquette: c.m.note ?? null, en_ligne: c.m.url || null,
    vues: c.vues.map(([page, s]) => ({ page, role: s.role, id: s.id, note_section: s.note_qualite, titre: s.titre, capture: s.medias.capture,
      video: existe(s.medias.video) ? s.medias.video : null, fiche: `sections/${s.id}.json`, en_ligne: enLigne(c.m, page) })),
  }));
  const resumeF = { explication: "Maquettes favorites de l'utilisateur : le niveau et le style visés, sur l'accueil ET les pages intérieures. Jamais à copier (ni leur idée, ni leur mise en page) : même harmonie, même fluidité, même soin.",
    activite: activites, metier: metierBrut, ...client, depot: depot || null, favorites_dans_la_bibliotheque: fc.length, favorites: sortieF };
  if (json) { await new Promise((r) => process.stdout.write(JSON.stringify(resumeF, null, 1) + '\n', r)); process.exit(0); }

  // Planche : une ligne par favorite, quatre captures (accueil : ouverture et une section ; page intérieure : ouverture et une section).
  const esc = (t) => String(t ?? '').replace(/[<>&"]/g, (x) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[x]));
  const CL = 344, CH = 215, TETE = 46, LEGF = 24, E = 8, TITREF = 64, NC = 4;
  const WF = NC * CL + (NC + 1) * E, HL = TETE + CH + LEGF + E, HF = TITREF + sortieF.length * HL + E;
  const couchesF = [{ left: 0, top: 0, input: Buffer.from(`<svg width="${WF}" height="${TITREF}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1c1d20"/>
    <text x="${E + 4}" y="27" font-family="Helvetica, Arial, sans-serif" font-size="19" font-weight="700" fill="#f4f2ee">${esc(`Favorites pour ${metierBrut || activites.join(', ') || 'ce projet'} : le niveau visé, sur tout le site`)}</text>
    <text x="${E + 4}" y="50" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#b9b6ae">${esc("Accueil (ouverture, une section) puis une page intérieure (ouverture, une section). Même harmonie et même soin, jamais la même idée.")}</text></svg>`) }];
  for (const [i, e] of sortieF.entries()) {
    const y = TITREF + E + i * HL;
    couchesF.push({ left: E, top: y, input: Buffer.from(`<svg width="${WF - 2 * E}" height="${TETE}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/>
      <text x="8" y="19" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1c1d20">${esc(`${e.rang}. ${e.maquette.replace(/-maquette$/, '')} · ${e.note_maquette ?? '?'}/100 · ${STYLE_F[e.lumiere]}${e.proche.length ? ' · ' + e.proche.join(', ') : ''}`)}</text>
      <text x="8" y="38" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#3a3c42">${esc(e.pourquoi.slice(0, 190))}</text></svg>`) });
    for (const [j, v] of e.vues.entries()) {
      const x = E + j * (CL + E);
      couchesF.push({ left: x, top: y + TETE, input: await sharp(path.join(RACINE, v.capture)).resize(CL, CH, { fit: 'cover', position: 'top' }).jpeg({ quality: 80 }).toBuffer() });
      couchesF.push({ left: x, top: y + TETE + CH, input: Buffer.from(`<svg width="${CL}" height="${LEGF}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/>
        <text x="6" y="16" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#5a5c63">${esc(`${v.page === 'accueil' ? 'accueil' : 'page ' + v.page} · ${v.role} · ${v.note_section}/5`.slice(0, 52))}</text></svg>`) });
    }
  }
  const fichierF = path.resolve(sortie);
  fs.mkdirSync(path.dirname(fichierF), { recursive: true });
  await sharp({ create: { width: WF, height: HF, channels: 3, background: '#e9e6e0' } }).composite(couchesF).jpeg({ quality: 82 }).toFile(fichierF);
  ecrireJson(fichierF.replace(/\.(jpe?g|png)$/i, '') + '.json', resumeF);
  console.log(`favorites : ${fichierF} (${sortieF.length} sur ${fc.length} favorites dans la bibliothèque)`);
  for (const e of sortieF) {
    console.log(`${e.rang}. ${e.maquette}  · ${e.note_maquette ?? '?'}/100 · ${STYLE_F[e.lumiere]}${e.proche.length ? ' · ' + e.proche.join(', ') : ''}\n   ${e.pourquoi}\n   ${e.en_ligne || ''}`);
    for (const v of e.vues) console.log(`     ${v.page === 'accueil' ? 'accueil' : 'page ' + v.page} · ${v.role} : ${v.capture}`);
  }
  console.log('Le niveau visé sur tout le site, pas un modèle : ni leur idée, ni leur mise en page.');
  process.exit(0);
}

const choisis = [];
// 1. Les plus utiles à ce projet (métier, activité, besoins, ambiance) : trois au plus, récentes comprises.
for (const c of candidates.filter((x) => x.p >= 2.5).sort((a, b) => b.p + b.q * 0.5 + b.alea * 0.4 - (a.p + a.q * 0.5 + a.alea * 0.4)).slice(0, 3)) choisis.push(c);

// 2. Styles différents : la composition visée a au moins deux mixtes, un clair et un sombre ; familles et plans variés.
const VISE = { mixte: 2, clair: 1, sombre: 1 };
const nb = (style) => choisis.filter((x) => x.lumiere.style === style).length;
while (choisis.length < Math.min(nombre, candidates.length)) {
  const familles = new Map(); for (const x of choisis) for (const f of x.s.familles || []) familles.set(f, (familles.get(f) || 0) + 1);
  const plans = new Set(choisis.map((x) => x.m.plan).filter(Boolean));
  const activitesPrises = new Set(choisis.flatMap((x) => x.m.activite || []));
  let meilleur = null, max = -Infinity;
  // Les ouvertures notées 5 d'abord : la vitrine montre le meilleur niveau ; les notées 4 seulement s'il en manque.
  const reste = candidates.filter((c) => !choisis.includes(c));
  const pool = reste.filter((c) => c.s.note_qualite === 5).length >= nombre - choisis.length ? reste.filter((c) => c.s.note_qualite === 5) : reste;
  for (const c of pool) {
    const st = c.lumiere.style;
    // Le tirage pèse autant que la qualité : sans lui, les mêmes ouvertures « très variées » revenaient à chaque projet.
    // L'utilité pour le projet tire toujours le choix (besoins, ambiance, activité proche).
    let g = c.q + c.alea * 3 + 0.4 * Math.min(6, c.p);
    g += nb(st) < VISE[st] ? 2.5 : -1.2 * (nb(st) - VISE[st] + 1);
    const fam = c.s.familles || [];
    g += 0.35 * Math.min(2, fam.filter((f) => !familles.has(f)).length) - 0.6 * fam.filter((f) => (familles.get(f) || 0) >= 2).length;
    if (c.m.plan && !plans.has(c.m.plan)) g += 0.5;
    if ((c.m.activite || []).some((a) => activitesPrises.has(a))) g -= 0.6;
    if (g > max) { max = g; meilleur = c; }
  }
  if (!meilleur) break;
  choisis.push(meilleur);
}

const STYLE = { clair: 'style clair', sombre: 'style sombre', mixte: 'clair et sombre alternés' };
const sel = choisis.map((c, i) => {
  const { s, m, lumiere: lu } = c;
  return {
    rang: i + 1, id: s.id, maquette: m.depot, client: m.client, metier: m.metier, activite: m.activite, favorite: FAVORIS.has(m.depot),
    pourquoi: [...c.raisons, `${STYLE[lu.style]} (${lu.part_sombre} % sombre)`, ...(s.familles || []).slice(0, 3)].filter(Boolean),
    _utile: c.raisons, _style: [`${STYLE[lu.style]} (${lu.part_sombre} % sombre)`, ...(s.familles || []).slice(0, 3)],
    lumiere: lu.style, part_sombre: lu.part_sombre, note_section: s.note_qualite, note_maquette: m.note ?? null,
    titre: s.titre, description: s.description, familles: s.familles || [], plan: m.plan || null, module: s.module || null,
    fiche: `sections/${s.id}.json`, capture: s.medias.capture, video: existe(s.medias.video) ? s.medias.video : null,
    en_ligne: m.url ? m.url + (s.page && s.page !== 'index' ? '/' + s.page : '') : null, _bandes: lu.bandes,
  };
});
const propre = sel.map(({ _bandes, _utile, _style, ...x }) => x);
const resume = { explication: 'Vitrine du projet : des ouvertures de la bibliothèque à dépasser, jamais à imiter (ni leur idée, ni leur mise en page).',
  activite: activites, metier: metierBrut, ...client, depot: depot || null, ecartees: [...exclus].filter((d) => maquettes.has(d)), ouvertures: propre };
if (json) { await new Promise((r) => process.stdout.write(JSON.stringify(resume, null, 1) + '\n', r)); process.exit(0); }

// Planche : 3 colonnes, capture + ruban de lumière de la page d'accueil, légende sous chaque capture, bandeau de titre.
const echapper = (t) => String(t).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const L = 456, RUB = 24, H = 300, LEG = 94, ESP = 8, TITRE = 64, COL = 3;
const lignes = Math.ceil(sel.length / COL), W = COL * (L + RUB) + (COL + 1) * ESP, HT = TITRE + lignes * (H + LEG + ESP) + ESP;
const couches = [];
const qui = metierBrut || activites.join(', ') || 'ce projet';
couches.push({ left: 0, top: 0, input: Buffer.from(`<svg width="${W}" height="${TITRE}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1c1d20"/>
  <text x="${ESP + 4}" y="27" font-family="Helvetica, Arial, sans-serif" font-size="19" font-weight="700" fill="#f4f2ee">${echapper(`Vitrine pour ${qui} : à dépasser, pas à imiter`)}</text>
  <text x="${ESP + 4}" y="50" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#b9b6ae">${echapper('Les plus utiles à ce projet, puis styles variés. Le ruban à droite de chaque capture : clair et sombre de tout l\'accueil, de haut en bas.')}</text></svg>`) });
for (const [i, e] of sel.entries()) {
  const x = ESP + (i % COL) * (L + RUB + ESP), y = TITRE + ESP + Math.floor(i / COL) * (H + LEG + ESP);
  couches.push({ input: await sharp(path.join(RACINE, e.capture)).resize(L, H, { fit: 'cover', position: 'top' }).jpeg({ quality: 78 }).toBuffer(), left: x, top: y });
  const total = e._bandes.reduce((n, b) => n + b.h, 0);
  let yy = 0;
  const bandes = e._bandes.map((b) => { const h = Math.max(1, Math.round((b.h / total) * H)); const r = `<rect x="0" y="${yy}" width="${RUB}" height="${h}" fill="rgb(${b.r},${b.g},${b.b})"/>`; yy += h; return r; }).join('');
  couches.push({ left: x + L, top: y, input: Buffer.from(`<svg width="${RUB}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e9e6e0"/>${bandes}<rect x="0.5" y="0.5" width="${RUB - 1}" height="${H - 1}" fill="none" stroke="#1c1d20" stroke-opacity=".35"/></svg>`) });
  const nom = e.maquette.replace(/-maquette$/, '');
  couches.push({ left: x, top: y + H, input: Buffer.from(`<svg width="${L + RUB}" height="${LEG}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/>
    <text x="6" y="20" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1c1d20">${echapper(`${e.rang}. ${nom}${e.favorite ? ' ★' : ''} · ${e.note_section}/5 · maquette ${e.note_maquette ?? '?'}/100`)}</text>
    <text x="6" y="40" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#1c1d20">${echapper((e._utile.join(' · ') || 'style différent').slice(0, 72))}</text>
    <text x="6" y="60" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#1c1d20">${echapper(e._style.join(' · ').slice(0, 72))}</text>
    <text x="6" y="81" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#5a5c63">${echapper((e.titre || e.description || '').slice(0, 70))}</text></svg>`) });
}
const fichier = path.resolve(sortie);
fs.mkdirSync(path.dirname(fichier), { recursive: true });
await sharp({ create: { width: W, height: HT, channels: 3, background: '#e9e6e0' } }).composite(couches).jpeg({ quality: 82 }).toFile(fichier);
ecrireJson(fichier.replace(/\.(jpe?g|png)$/i, '') + '.json', resume);

console.log(`vitrine : ${fichier} (${sel.length} ouvertures${activites.length || metierN.length || Object.values(client).flat().length ? '' : ', client non décrit : styles variés seulement'})`);
if (voisins.size) console.log(`activités proches prises en compte : ${[...voisins].join(', ')}`);
const ecartees = [...exclus].filter((d) => maquettes.has(d));
if (ecartees.length) console.log(`écartées : ${ecartees.join(', ')}`);
for (const e of sel) console.log(`${e.rang}. ${e.id}${e.favorite ? ' ★ favorite' : ''}  · ${e.pourquoi.join(' · ')}\n   ${e.titre}  (${e.metier})\n   ${e.fiche}${e.video ? '  ·  vidéo ' + e.video : ''}${e.en_ligne ? '\n   ' + e.en_ligne : ''}`);
console.log('À dépasser, pas à imiter : ni leur idée, ni leur mise en page. Le niveau, oui.');
