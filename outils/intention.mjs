// Planche d'intention : la page envoyée à l'utilisateur avec les directions artistiques, AVANT de construire la v1.
// Pour chaque direction : l'idée, la palette et les polices, les points de la grille wouahou (objet à manipuler, fil, voile,
// effets modernes), et pour chaque section clé la section de la bibliothèque qu'on reprend (capture, lien vers sa vidéo)
// avec ce qu'on fera de plus pour ce client. L'utilisateur juge l'ambition avant la v1, pas après.
// node outils/intention.mjs <intention.json> [--sortie intention-<client>.html]
//
// intention.json (écrit par Claude) :
// { "client": "Ma Bonne Étoile", "site_actuel": "https://lydiacourtois.com", "activite": "géobiologie et Feng Shui",
//   "constat": "Ce que le site actuel ne dit pas ou montre mal, en deux phrases.",
//   "directions": [ { "nom": "Le plan et l'étoile", "idee": "La maison lue comme un plan d'architecte…",
//       "palette": ["#f1eadf", "#1c2640", "#c69a3e"], "polices": ["Fraunces", "Instrument Sans"],
//       "grille": { "objet": "étoile-boussole à faire tourner", "fil": "fil doré dans la marge", "voile": "étoile à huit branches",
//                   "modernes": ["titres lettre à lettre", "image du salon qui s'ouvre en plein écran", "grille 3D des domaines"] },
//       "sections": [ { "role": "ouverture", "reprend": "icc-maquette/debut", "plus": "ce qu'on fait de plus pour ce client" } ],
//       "invente": ["boussole des neuf domaines", "lumière rasante sur le mur"] } ] }
// « reprend » : identifiant d'une section de la bibliothèque (sections/<maquette>/<id>.json), de préférence du palmarès.
// La page est autonome : captures intégrées (miniatures), vidéos en lien vers le site de la bibliothèque.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { RACINE, lireJson } from './commun.mjs';

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
  blocs.push(`<section class="direction" id="direction-${n + 1}">
  <p class="direction__num">Direction ${n + 1}</p>
  <h2>${e(dir.nom)}</h2>
  <p class="direction__idee">${e(dir.idee)}</p>
  <div class="direction__id">
    <ul class="palette">${(dir.palette || []).map((c) => `<li style="background:${e(c)}"><span>${e(c)}</span></li>`).join('')}</ul>
    <p class="polices">${(dir.polices || []).map(e).join(' · ')}</p>
  </div>
  <dl class="grille">
    <div><dt>On attrape</dt><dd>${e(g.objet)}</dd></div>
    <div><dt>Le fil</dt><dd>${e(g.fil)}</dd></div>
    <div><dt>La transition</dt><dd>${e(g.voile)}</dd></div>
    <div><dt>Effets modernes</dt><dd>${(g.modernes || []).map(e).join(' ; ')}</dd></div>
  </dl>
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
:root { --fond: #f4f2ee; --surface: #fff; --texte: #1c1d20; --doux: #5a5c63; --trait: #d9d5cd; --accent: #2f5d50; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --fond: #16171a; --surface: #1f2024; --texte: #ecebe7; --doux: #a9aab0; --trait: #34363c; --accent: #8fd0b9; color-scheme: dark; } }
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
footer { margin-top: 40px; color: var(--doux); font-size: .875rem; }
@media (max-width: 700px) { .ref { grid-template-columns: 1fr; } .polices { margin-left: 0; } }
</style>
</head>
<body>
<main>
  <h1>${e(d.client)} : ${['une direction', 'deux directions', 'trois directions', 'quatre directions'][(d.directions || []).length - 1] || 'les directions'}</h1>
  <p class="chapo">Proposition avant construction, à partir du site actuel ${d.site_actuel ? `<a href="${e(d.site_actuel)}">${e(d.site_actuel.replace(/^https?:\/\//, ''))}</a>` : ''}${d.activite ? ` (${e(d.activite)})` : ''}. Chaque direction montre ce qu'on reprend des meilleures maquettes déjà faites et ce qu'on fait de plus pour ce client.</p>
  ${d.constat ? `<p class="constat">${e(d.constat)}</p>` : ''}
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
