// Planche d'intention : la page envoyée à l'utilisateur avec les directions artistiques, AVANT de construire la v1.
// Pour chaque direction : l'idée, la palette et les polices, les points de la grille wouahou (objet à manipuler, fil, voile,
// effets modernes), et pour chaque section clé la section de la bibliothèque qu'on reprend (capture, lien vers sa vidéo)
// avec ce qu'on fera de plus pour ce client. L'utilisateur juge l'ambition avant la v1, pas après.
// node outils/intention.mjs _suivi/intention.json [--sortie _suivi/intention-<client>.html]   (fichiers de travail : jamais à la racine du site)
//
// intention.json (écrit par Claude) :
// { "client": "Ma Bonne Étoile", "depot": "lydiacourtois-maquette" (facultatif : en v2, la maquette elle-même n'est pas comptée comme déjà vue),
//   "site_actuel": "https://lydiacourtois.com", "activite": "géobiologie et Feng Shui",
//   "constat": "Ce que le site actuel ne dit pas ou montre mal, en deux phrases.",
//   "recentes": [ { "nom": "Lo Componaïro", "plan": "recit-lineaire", "familles": ["carrousel", "typo-geante"], "voile": "iris", "modules": ["carrousel-3d"] } ]
//       (facultatif : maquettes récentes faites ailleurs et pas encore dans la bibliothèque ; comptent comme les plus récentes),
//   "directions": [ { "nom": "Le plan et l'étoile", "idee": "La maison lue comme un plan d'architecte…",
//       "plan": "territoire" (taxonomie : plan, comment se lit l'accueil),
//       "palette": ["#f1eadf", "#1c2640", "#c69a3e"], "polices": ["Fraunces", "Instrument Sans"],
//       "grille": { "objet": "étoile-boussole à faire tourner", "fil": "fil doré dans la marge", "voile": "étoile à huit branches",
//                   "forme_voile": "propre" (glisse, iris, vague, rideau ou propre),
//                   "familles": ["plongee", "morphing", "ambiance-qui-change"] (taxonomie : famille, 3 au moins sur l'accueil),
//                   "signature": "plongee" (la famille de l'effet signature),
//                   "modernes": ["titres lettre à lettre", "image du salon qui s'ouvre en plein écran", "grille 3D des domaines"] },
//       "modules": ["objet-a-faire-tourner"] (modules repris),
//       "deja_vu_voulu": "raison" (facultatif : une reprise assumée devient une note au lieu d'un A REGARDER),
//       "sections": [ { "role": "ouverture", "reprend": "icc-maquette/debut", "plus": "ce qu'on fait de plus pour ce client" } ],
//       "invente": ["boussole des neuf domaines", "lumière rasante sur le mur"] } ] }
// « reprend » : identifiant d'une section de la bibliothèque (sections/<maquette>/<id>.json), de préférence du palmarès.
// Déjà vu (« Chaque maquette est unique », partie 2 de la skill), comparé aux trois dernières maquettes (et aux « recentes ») :
// A REGARDER si le plan est celui d'une des deux dernières ou d'une autre direction, si plus d'une famille de l'accueil
// (hors points fixes) ou la famille signature a déjà servi, si la forme du voile est celle de la dernière, si un module signature
// (qui porte une famille d'effet) a déjà servi, ou s'il manque le plan ou trois familles.
// La page est autonome : captures intégrées (miniatures), vidéos en lien vers le site de la bibliothèque.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { RACINE, TAXO, lireJson, dernieresMaquettes } from './commun.mjs';
import { deduireModule } from './deduire.mjs';

const SITE = 'https://bibliotheque-maquettes.vercel.app';
const args = process.argv.slice(2);
const fichier = args.find((a) => !a.startsWith('--'));
if (!fichier) { console.error('usage : node outils/intention.mjs <intention.json> [--sortie fichier.html]'); process.exit(1); }
const i = args.indexOf('--sortie');
const d = lireJson(path.resolve(fichier));
const slug = (t) => String(t || 'client').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sortie = path.resolve(i >= 0 ? args[i + 1] : `intention-${slug(d.client)}.html`);
const e = (t) => String(t ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const palmares = lireJson(path.join(RACINE, 'palmares.json'), { roles: {} }).roles;
const dansPalmares = new Set(Object.values(palmares).flat().map((x) => x.id));
const manque = [];
const aRegarder = [];
/* Erreurs de format : jamais couvertes par « deja_vu_voulu » (la dispense ne vaut que pour une ressemblance assumée ;
   audit externe : une planche vide ou hors taxonomie passait avec une dispense). */
const erreurs = [];
if (!Array.isArray(d.directions) || !d.directions.length) erreurs.push('aucune direction (deux ou trois attendues)');
else if (d.directions.length > 4) erreurs.push(`${d.directions.length} directions : quatre au plus`);

/* ---------- Déjà vu : les trois dernières maquettes, plus les récentes hors bibliothèque ---------- */
const FIXES = new Set(TAXO.famille_points_fixes || []);
const FORMES = ['glisse', 'iris', 'vague', 'rideau', 'propre'];
for (const [k, r] of (d.recentes || []).entries()) {
  if (r.plan && !TAXO.plan.includes(r.plan)) erreurs.push(`recentes[${k}] (${r.nom || '?'}) : plan « ${r.plan} » hors taxonomie`);
  const hors = (r.familles || []).filter((x) => !TAXO.famille.includes(x));
  if (hors.length) erreurs.push(`recentes[${k}] (${r.nom || '?'}) : famille(s) hors taxonomie : ${hors.join(', ')}`);
  if (r.voile && !FORMES.includes(r.voile)) erreurs.push(`recentes[${k}] (${r.nom || '?'}) : voile « ${r.voile} » (${FORMES.join(', ')})`);
}
/* Une « récente » déjà entrée dans la bibliothèque n'est pas comptée deux fois : la fiche de la bibliothèque l'emporte. */
const cle = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/-maquette$/, '').replace(/[^a-z0-9]/g, '');
const dejaDansBib = new Set(fs.readdirSync(path.join(RACINE, 'maquettes')).filter((x) => x.endsWith('.json')).map((x) => cle(x.replace(/\.json$/, ''))));
for (const r of d.recentes || []) if (dejaDansBib.has(cle(r.nom))) console.log(`(récente « ${r.nom} » déjà dans la bibliothèque : sa fiche est utilisée)`);
const recentes = (d.recentes || []).filter((r) => !dejaDansBib.has(cle(r.nom))).map((r) => ({ depot: r.nom || 'récente', client: r.nom, plan: r.plan || null,
  familles_accueil: (r.familles || []).filter((x) => !FIXES.has(x)), modules: r.modules || [], voile: r.voile || null, hors_bibliotheque: true }));
const dernieres = [...recentes, ...dernieresMaquettes(3, d.depot ? [d.depot] : [])].slice(0, 3);
const nomCourt = (m) => (m.hors_bibliotheque ? String(m.client) : String(m.depot).replace(/-maquette$/, ''));
const libelle = (x) => ({ 'recit-lineaire': 'récit linéaire', 'outil-d-abord': "outil d'abord", 'ecran-partage': 'écran partagé', journee: 'journée',
  'typo-geante': 'typographie géante', 'plein-ecran': 'plein écran', 'lumiere-pointeur': 'lumière au pointeur', 'scene-epinglee': 'scène épinglée',
  'objet-manipulable': 'objet manipulable', 'defilement-horizontal': 'défilement horizontal', plongee: 'plongée', 'video-pilotee': 'vidéo pilotée',
  'ambiance-qui-change': "l'ambiance qui change", '3d': '3D', webgl: 'WebGL' }[x] || String(x).replace(/-/g, ' '));
const modulesSignature = (noms) => noms.filter((n) => {
  const mj = lireJson(path.join(RACINE, 'modules', n, 'module.json'), null);
  if (!mj) return false;
  const notes = fs.existsSync(path.join(RACINE, 'modules', n, 'NOTES.md')) ? fs.readFileSync(path.join(RACINE, 'modules', n, 'NOTES.md'), 'utf8') : '';
  return deduireModule(mj, notes).familles.length > 0;
});
function dejaVu(dir, n, toutes) {
  const g = dir.grille || {}, lignes = [], alertes = [];
  const ou = (pred) => dernieres.filter(pred).map(nomCourt);
  /* Plan */
  const erreur = (t) => erreurs.push(`direction ${n + 1} : ${t}`);
  if (!dir.nom) erreur('nom absent');
  if (!(dir.sections || []).length) erreur('aucune section reprise de la bibliothèque');
  if (!dir.plan) erreur('plan de la page absent (taxonomie : plan)');
  else if (!TAXO.plan.includes(dir.plan)) erreur(`plan « ${dir.plan} » hors taxonomie (${TAXO.plan.join(', ')})`);
  else {
    const vu = dernieres.slice(0, 2).filter((m) => m.plan === dir.plan).map(nomCourt);
    const autre = toutes.findIndex((x, k) => k !== n && x.plan === dir.plan);
    if (vu.length) alertes.push(`plan « ${libelle(dir.plan)} » déjà pris par ${vu.join(', ')}`);
    if (autre >= 0) alertes.push(`même plan que la direction ${autre + 1}`);
    lignes.push(['Plan de la page', libelle(dir.plan), vu.length ? `déjà vu : ${vu.join(', ')}` : 'nouveau', !vu.length && autre < 0]);
  }
  /* Familles */
  const fams = [...new Set([...(g.familles || []), ...(g.signature ? [g.signature] : [])])];
  const inconnues = fams.filter((x) => !TAXO.famille.includes(x));
  if (inconnues.length) erreur(`famille(s) hors taxonomie : ${inconnues.join(', ')}`);
  if (g.signature && !(g.familles || []).includes(g.signature)) erreur(`signature « ${g.signature} » absente de grille.familles`);
  if (g.forme_voile && !FORMES.includes(g.forme_voile)) erreur(`forme_voile « ${g.forme_voile} » (${FORMES.join(', ')})`);
  const modernes = fams.filter((x) => TAXO.famille.includes(x) && !FIXES.has(x));
  if (modernes.length < 3) erreur(`${modernes.length} famille(s) moderne(s) sur l'accueil (3 au moins, hors ${[...FIXES].join(', ')})`);
  const vues = modernes.filter((x) => dernieres.some((m) => m.familles_accueil.includes(x)));
  if (vues.length > 1) alertes.push(`${vues.length} familles déjà vues sur les trois dernières (${vues.map(libelle).join(', ')}) : une au plus`);
  if (g.signature && vues.includes(g.signature)) alertes.push(`effet signature « ${libelle(g.signature)} » déjà vu`);
  for (const x of modernes) { const o = ou((m) => m.familles_accueil.includes(x)); lignes.push([x === g.signature ? 'Famille signature' : 'Famille', libelle(x), o.length ? `déjà vue : ${o.join(', ')}` : 'nouvelle', !o.length]); }
  /* Voile */
  const forme = (FORMES.includes(g.forme_voile) && g.forme_voile) || FORMES.find((f) => new RegExp(`\\b${f}\\b`, 'i').test(g.voile || '')) || null;
  if (forme && forme !== 'propre' && dernieres[0] && dernieres[0].voile === forme) alertes.push(`voile « ${forme} », comme ${nomCourt(dernieres[0])}`);
  if (forme) lignes.push(['Forme du voile', forme, forme !== 'propre' && dernieres[0]?.voile === forme ? `comme ${nomCourt(dernieres[0])}` : 'différente de la dernière', !(forme !== 'propre' && dernieres[0]?.voile === forme)]);
  /* Modules signature */
  for (const nom of modulesSignature(dir.modules || [])) {
    const o = ou((m) => (m.modules || []).includes(nom));
    if (o.length) alertes.push(`module signature « ${nom} » déjà vu (${o.join(', ')}) : en choisir un autre ou le rendre méconnaissable hors de l'accueil`);
    lignes.push(['Module', nom, o.length ? `déjà vu : ${o.join(', ')}` : 'nouveau', !o.length]);
  }
  const assume = dir.deja_vu_voulu ? String(dir.deja_vu_voulu) : '';
  if (alertes.length && !assume) aRegarder.push(...alertes.map((a) => `direction ${n + 1} : ${a}`));
  const html = `<div class="dejavu${alertes.length ? (assume ? ' dejavu--assume' : ' dejavu--alerte') : ''}">
    <h3>Déjà vu ? Comparé à ${dernieres.length ? dernieres.map(nomCourt).join(', ') : 'aucune maquette'}</h3>
    <ul>${lignes.map(([k, v, etat, ok]) => `<li class="${ok ? 'ok' : 'vu'}"><span>${e(k)}</span> <b>${e(v)}</b> <em>${e(etat)}</em></li>`).join('')}</ul>
    ${alertes.length ? `<p class="dejavu__msg">${assume ? `Reprise assumée : ${e(assume)}. ` : ''}${alertes.map(e).join(' ; ')}.</p>` : '<p class="dejavu__msg">Rien de visible ne reprend les dernières maquettes.</p>'}
  </div>`;
  return html;
}

async function miniature(rel) {
  if (!rel || !fs.existsSync(path.join(RACINE, rel))) return '';
  const b = await sharp(path.join(RACINE, rel)).resize(640, 400, { fit: 'cover', position: 'top' }).jpeg({ quality: 68 }).toBuffer();
  return `data:image/jpeg;base64,${b.toString('base64')}`;
}

async function carteSection(s) {
  const fiche = lireJson(path.join(RACINE, 'sections', `${s.reprend}.json`), null);
  if (!fiche) manque.push(s.reprend);
  const img = fiche ? await miniature(fiche.medias && fiche.medias.capture) : '';
  const video = fiche && fiche.medias && fiche.medias.video ? `${SITE}/${fiche.medias.video}` : '';
  const m = fiche ? lireJson(path.join(RACINE, 'maquettes', `${fiche.maquette}.json`), {}) : {};
  return `<article class="ref">
      <div class="ref__img">${img ? `<img src="${img}" alt="Capture : ${e(fiche.titre || s.role)}">` : '<span>capture absente</span>'}</div>
      <div class="ref__txt">
        <p class="ref__role">${e(s.role)}${dansPalmares.has(s.reprend) ? ' · <b>palmarès</b>' : ''}</p>
        <p class="ref__de">On reprend : <strong>${e(fiche ? fiche.description || fiche.titre : s.reprend)}</strong> <span>(${e(fiche ? fiche.maquette.replace(/-maquette$/, '') : '?')}${fiche ? `, ${fiche.note_qualite}/5` : ''}${m.note ? `, maquette ${m.note}/100` : ''})</span>${video ? ` · <a href="${video}" target="_blank" rel="noopener">voir la vidéo</a>` : ''}</p>
        <p class="ref__plus">Et en plus, pour ${e(d.client)} : ${e(s.plus || '')}</p>
      </div>
    </article>`;
}

const blocs = [];
for (const [n, dir] of (d.directions || []).entries()) {
  const refs = [];
  for (const s of dir.sections || []) refs.push(await carteSection(s));
  const g = dir.grille || {};
  const dv = dejaVu(dir, n, d.directions || []);
  blocs.push(`<section class="direction" id="direction-${n + 1}">
  <p class="direction__num">Direction ${n + 1}</p>
  <h2>${e(dir.nom)}</h2>
  <p class="direction__idee">${e(dir.idee)}</p>
  <div class="direction__id">
    <ul class="palette">${(dir.palette || []).map((c) => `<li style="background:${e(c)}"><span>${e(c)}</span></li>`).join('')}</ul>
    <p class="polices">${(dir.polices || []).map(e).join(' · ')}</p>
  </div>
  <dl class="grille">
    ${dir.plan ? `<div><dt>Plan de la page</dt><dd>${e(libelle(dir.plan))}${TAXO.definitions?.[dir.plan] ? ` : ${e(String(TAXO.definitions[dir.plan]).replace(/^plan : /, ''))}` : ''}</dd></div>` : ''}
    <div><dt>On attrape</dt><dd>${e(g.objet)}</dd></div>
    <div><dt>Le fil</dt><dd>${e(g.fil)}</dd></div>
    <div><dt>La transition</dt><dd>${e(g.voile)}</dd></div>
    <div><dt>Effets modernes</dt><dd>${(g.modernes || []).map(e).join(' ; ')}</dd></div>
  </dl>
  ${dv}
  <h3>Les sections clés : ce qu'on reprend de la bibliothèque, ce qu'on fait de plus</h3>
  <div class="refs">${refs.join('\n')}</div>
  ${(dir.invente || []).length ? `<h3>Inventé pour ${e(d.client)}</h3><ul class="invente">${dir.invente.map((x) => `<li>${e(x)}</li>`).join('')}</ul>` : ''}
</section>`);
}

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Intention · ${e(d.client)}</title>
<style>
:root { --fond: #f4f2ee; --surface: #fff; --texte: #1c1d20; --doux: #5a5c63; --trait: #d9d5cd; --accent: #2f5d50; --alerte: #a8321e; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --fond: #16171a; --surface: #1f2024; --texte: #ecebe7; --doux: #a9aab0; --trait: #34363c; --accent: #8fd0b9; --alerte: #ff9b85; color-scheme: dark; } }
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: var(--fond); color: var(--texte); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width: 1180px; margin: 0 auto; padding: clamp(20px, 4vw, 48px) 16px 64px; }
h1 { font-size: clamp(1.8rem, 1.2rem + 2.4vw, 3rem); line-height: 1.1; margin: 0 0 8px; letter-spacing: -.01em; }
.chapo { color: var(--doux); max-width: 70ch; margin: 0 0 8px; }
.constat { max-width: 75ch; padding: 14px 16px; border-left: 3px solid var(--accent); background: var(--surface); margin: 18px 0 0; }
nav.sommaire { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 0; }
nav.sommaire a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 1px solid var(--trait); border-radius: 999px; color: var(--texte); text-decoration: none; font-weight: 600; }
.direction { margin-top: 40px; padding: clamp(18px, 3vw, 32px); background: var(--surface); border: 1px solid var(--trait); border-radius: 14px; }
.direction__num { margin: 0; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: .8125rem; }
.direction h2 { margin: 4px 0 6px; font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.2rem); line-height: 1.15; }
.direction__idee { margin: 0 0 16px; max-width: 75ch; }
.direction__id { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; margin-bottom: 18px; }
.palette { display: flex; gap: 6px; list-style: none; margin: 0; padding: 0; }
.palette li { width: 64px; height: 64px; border-radius: 10px; border: 1px solid var(--trait); position: relative; }
.palette span { position: absolute; bottom: -20px; left: 0; font-size: .75rem; color: var(--doux); }
.polices { margin: 0 0 0 auto; color: var(--doux); }
.grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 28px 0 8px; }
.grille div { padding: 12px 14px; border: 1px solid var(--trait); border-radius: 10px; }
.grille dt { font-size: .8125rem; color: var(--doux); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.grille dd { margin: 4px 0 0; }
h3 { margin: 26px 0 12px; font-size: 1.1rem; }
.refs { display: grid; gap: 14px; }
.ref { display: grid; grid-template-columns: minmax(0, 300px) minmax(0, 1fr); gap: 16px; align-items: start; padding-bottom: 14px; border-bottom: 1px solid var(--trait); }
.ref__img { aspect-ratio: 16 / 10; border-radius: 8px; overflow: hidden; background: var(--trait); display: grid; place-items: center; color: var(--doux); }
.ref__img img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.ref__txt p { margin: 0 0 6px; }
.ref__role { font-size: .8125rem; color: var(--doux); text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
.ref__role b { color: var(--accent); }
.ref__de span { color: var(--doux); }
.ref__plus { padding: 8px 10px; border-radius: 8px; background: color-mix(in srgb, var(--accent) 10%, var(--surface)); }
a { color: var(--accent); }
.invente { margin: 0; padding-left: 20px; }
.dejavu { margin: 18px 0 4px; padding: 14px 16px; border-radius: 10px; border: 1px solid var(--trait); }
.dejavu h3 { margin: 0 0 8px; font-size: 1rem; }
.dejavu ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.dejavu li span { color: var(--doux); font-size: .8125rem; text-transform: uppercase; letter-spacing: .04em; }
.dejavu li em { font-style: normal; color: var(--doux); }
.dejavu li.ok em::before { content: "✓ "; color: var(--accent); }
.dejavu li.vu em { color: var(--alerte); font-weight: 600; }
.dejavu__msg { margin: 10px 0 0; }
.dejavu--alerte { border-color: var(--alerte); }
.dejavu--alerte .dejavu__msg { color: var(--alerte); font-weight: 600; }
.dejavu--assume { border-style: dashed; }
.recentes { margin: 22px 0 0; border-collapse: collapse; width: 100%; font-size: .9rem; }
.recentes caption { text-align: left; font-weight: 700; margin-bottom: 6px; }
.recentes th, .recentes td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--trait); vertical-align: top; }
.recentes th { color: var(--doux); font-weight: 600; }
.tableau { overflow-x: auto; }
footer { margin-top: 40px; color: var(--doux); font-size: .875rem; }
@media (max-width: 700px) { .ref { grid-template-columns: 1fr; } .polices { margin-left: 0; } }
</style>
</head>
<body>
<main>
  <h1>${e(d.client)} : ${['une direction', 'deux directions', 'trois directions', 'quatre directions'][(d.directions || []).length - 1] || 'les directions'}</h1>
  <p class="chapo">Proposition avant construction, à partir du site actuel ${d.site_actuel ? `<a href="${e(d.site_actuel)}">${e(d.site_actuel.replace(/^https?:\/\//, ''))}</a>` : ''}${d.activite ? ` (${e(d.activite)})` : ''}. Chaque direction montre ce qu'on reprend des meilleures maquettes déjà faites et ce qu'on fait de plus pour ce client.</p>
  ${d.constat ? `<p class="constat">${e(d.constat)}</p>` : ''}
  ${dernieres.length ? `<div class="tableau"><table class="recentes"><caption>Les dernières maquettes, à ne pas reprendre</caption>
    <thead><tr><th scope="col">Maquette</th><th scope="col">Plan</th><th scope="col">Familles de l'accueil</th><th scope="col">Voile</th></tr></thead>
    <tbody>${dernieres.map((m) => `<tr><td>${e(nomCourt(m))}${m.hors_bibliotheque ? ' (hors bibliothèque)' : ''}</td><td>${e(m.plan ? libelle(m.plan) : 'non noté')}</td><td>${e(m.familles_accueil.map(libelle).join(', ') || 'non relevées')}</td><td>${e(m.voile || 'non relevé')}</td></tr>`).join('')}</tbody></table></div>` : ''}
  <nav class="sommaire" aria-label="Directions">${(d.directions || []).map((x, n) => `<a href="#direction-${n + 1}">${n + 1}. ${e(x.nom)}</a>`).join('')}</nav>
  ${blocs.join('\n')}
  <footer>Captures et vidéos : bibliothèque des maquettes (${SITE.replace('https://', '')}). Les sections marquées « palmarès » sont parmi les meilleures de leur rôle.</footer>
</main>
</body>
</html>
`;
fs.writeFileSync(sortie, html);
console.log(`planche d'intention : ${sortie} (${Math.round(fs.statSync(sortie).size / 1024)} Ko, ${(d.directions || []).length} direction(s))`);
if (manque.length) { console.log(`A REGARDER : section(s) introuvable(s) dans la bibliothèque : ${manque.join(', ')}`); process.exitCode = 1; }
if (erreurs.length) { console.log(`ERREUR : planche invalide (à corriger ; « deja_vu_voulu » ne s'applique pas ici) :\n  ${erreurs.join('\n  ')}`); process.exitCode = 1; }
if (aRegarder.length) { console.log(`A REGARDER : déjà vu (corriger les directions, ou « deja_vu_voulu » avec la raison d'une reprise voulue) :\n  ${aRegarder.join('\n  ')}`); process.exitCode = 1; }
else if (!erreurs.length) console.log(`déjà vu : rien de visible ne reprend ${dernieres.map(nomCourt).join(', ') || 'les dernières maquettes'}`);
