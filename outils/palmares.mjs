// Palmarès : les meilleures sections de la bibliothèque pour chaque rôle (ouverture, tarifs, galerie, contact…).
// C'est la barre à dépasser : chaque section d'une nouvelle maquette doit faire au moins aussi bien que le palmarès de son rôle.
// node outils/palmares.mjs            (relancé par ajouter.mjs après chaque ajout)
//
// Choix, pour chaque rôle : sections notées 5 d'abord (4 si le rôle n'en a pas assez), une seule par maquette,
// classées par note de la maquette (audit sur 100), puis section réutilisable ou tirée en module, puis vidéo, puis la plus récente.
// 3 par rôle (6 pour l'ouverture, le rôle le plus varié et le plus décisif). Rôles de service exclus (menu, pied, barre, légal).
// Écrit :
// - palmares.json : le palmarès lu par la skill (rôle → sections : fiche, maquette, client, description, captures, vidéo, module) ;
// - palmares/planches/<rôle>.jpg : une planche contact par rôle (captures ordinateur côte à côte, légendées), ce que Claude regarde ;
// - palmares/index.html : la page du site (captures, vidéos au clic, liens vers les fiches et les maquettes en ligne).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { RACINE, lireJson, ecrireJson } from './commun.mjs';

const EXCLUS = new Set(['menu', 'pied-de-page', 'barre-fixe', 'texte-legal', 'transition-de-page']);
const PAR_ROLE = (r) => (r === 'ouverture' ? 6 : 3);
const maquettes = new Map(fs.readdirSync(path.join(RACINE, 'maquettes')).filter((f) => f.endsWith('.json'))
  .map((f) => { const m = lireJson(path.join(RACINE, 'maquettes', f)); return [m.depot, m]; }));
const existe = (p) => p && fs.existsSync(path.join(RACINE, p));

const sections = [];
for (const d of fs.readdirSync(path.join(RACINE, 'sections'))) {
  const dos = path.join(RACINE, 'sections', d);
  if (!fs.statSync(dos).isDirectory()) continue;
  for (const f of fs.readdirSync(dos).filter((x) => x.endsWith('.json'))) {
    const s = lireJson(path.join(dos, f), null);
    if (!s || EXCLUS.has(s.role) || !(s.note_qualite >= 4) || !existe(s.medias && s.medias.capture)) continue;
    const m = maquettes.get(s.maquette) || {};
    sections.push({ s, m });
  }
}
const score = ({ s, m }) => [s.note_qualite, m.note || 0, s.module || s.reutilisable ? 1 : 0, existe(s.medias.video) ? 1 : 0, m.date_commit || ''];
const comparer = (a, b) => { const x = score(a), y = score(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i] ? 1 : -1; return 0; };

const parRole = new Map();
for (const e of sections) { if (!parRole.has(e.s.role)) parRole.set(e.s.role, []); parRole.get(e.s.role).push(e); }
const palmares = {};
for (const [role, liste] of [...parRole].sort((a, b) => b[1].length - a[1].length)) {
  const vus = new Set(), choisis = [];
  for (const e of liste.sort(comparer)) {
    if (vus.has(e.s.maquette)) continue;
    vus.add(e.s.maquette); choisis.push(e);
    if (choisis.length >= PAR_ROLE(role)) break;
  }
  palmares[role] = choisis.map(({ s, m }) => ({
    id: s.id, maquette: s.maquette, client: m.client || s.maquette, note_section: s.note_qualite, note_maquette: m.note || null,
    titre: s.titre, description: s.description, animations: s.animations, interactions: s.interactions,
    module: s.module || null, fiche: `sections/${s.id}.json`, capture: s.medias.capture,
    capture_m390: existe(s.medias.capture_m390) ? s.medias.capture_m390 : null, video: existe(s.medias.video) ? s.medias.video : null,
    en_ligne: m.url ? m.url + (s.page && s.page !== 'index' ? '/' + s.page : '') : null,
  }));
}

// Planches contact : captures ordinateur côte à côte (480 px de large chacune), légende sous chaque capture.
const planches = path.join(RACINE, 'palmares', 'planches');
fs.mkdirSync(planches, { recursive: true });
const echapper = (t) => String(t).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const L = 480, H = 300, LEG = 54, ESP = 8;
for (const [role, liste] of Object.entries(palmares)) {
  const parLigne = 3, lignes = Math.ceil(liste.length / parLigne);
  const W = parLigne * L + (parLigne + 1) * ESP, HT = lignes * (H + LEG + ESP) + ESP;
  const couches = [];
  for (const [i, e] of liste.entries()) {
    const x = ESP + (i % parLigne) * (L + ESP), y = ESP + Math.floor(i / parLigne) * (H + LEG + ESP);
    const img = await sharp(path.join(RACINE, e.capture)).resize(L, H, { fit: 'cover', position: 'top' }).jpeg({ quality: 78 }).toBuffer();
    couches.push({ input: img, left: x, top: y });
    const leg = `<svg width="${L}" height="${LEG}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/>
      <text x="6" y="20" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1c1d20">${echapper(`${i + 1}. ${e.maquette.replace(/-maquette$/, '')} · ${e.note_section}/5 · maquette ${e.note_maquette ?? '?'}/100`)}</text>
      <text x="6" y="42" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#5a5c63">${echapper((e.titre || e.description || '').slice(0, 64))}</text></svg>`;
    couches.push({ input: Buffer.from(leg), left: x, top: y + H });
  }
  await sharp({ create: { width: W, height: HT, channels: 3, background: '#e9e6e0' } }).composite(couches).jpeg({ quality: 80 }).toFile(path.join(planches, `${role}.jpg`));
}

ecrireJson(path.join(RACINE, 'palmares.json'), {
  explication: "Les meilleures sections de la bibliothèque pour chaque rôle : la barre à dépasser. Regarder la planche palmares/planches/<rôle>.jpg du rôle, lire les fiches citées ; chaque section de la nouvelle maquette fait au moins aussi bien.",
  genere: new Date().toISOString().slice(0, 10), roles: palmares,
});

// Page du site.
const cartes = (role, liste) => liste.map((e, i) => `
      <article class="carte">
        <a class="carte__media" href="/${e.capture}"><img src="/${e.capture}" alt="" loading="lazy" width="480" height="300"></a>
        ${e.video ? `<details class="carte__video"><summary>Voir la vidéo</summary><video src="/${e.video}" controls muted playsinline preload="none" poster="/${e.capture}"></video></details>` : ''}
        <div class="carte__corps">
          <p class="carte__rang">${i + 1} · <strong>${echapper(e.maquette.replace(/-maquette$/, ''))}</strong> · section ${e.note_section}/5 · maquette ${e.note_maquette ?? '?'}/100</p>
          <h3>${echapper(e.titre || role)}</h3>
          <p>${echapper(e.description || '')}</p>
          <p class="carte__liens"><a href="https://github.com/Kiwi570/bibliotheque-maquettes/blob/main/${e.fiche}">Fiche</a>${e.en_ligne ? ` · <a href="${e.en_ligne}">En ligne</a>` : ''}${e.module ? ` · module <code>${echapper(e.module)}</code>` : ''}</p>
        </div>
      </article>`).join('');
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Palmarès · Bibliothèque des maquettes</title>
<meta name="description" content="Les meilleures sections de la bibliothèque pour chaque rôle : la barre à dépasser.">
<link rel="icon" href="/site/icone.svg" type="image/svg+xml">
<style>html,body{background:#f4f2ee}@media (prefers-color-scheme:dark){html,body{background:#16171a}}</style>
<link rel="stylesheet" href="/site/site.css?v=6">
</head>
<body>
<header class="tete" data-entete>
  <div class="tete__in">
    <p class="tete__nom"><a href="/"><strong>Bibliothèque</strong> <span>des maquettes</span></a></p>
    <nav class="onglets" aria-label="Contenu"><a href="/">Sections</a><a href="/?vue=modules">Modules</a><a href="/palmares/" aria-current="page">Palmarès</a></nav>
  </div>
</header>
<main>
  <div class="intro">
    <h1>Palmarès par rôle</h1>
    <p class="intro__txt">Les meilleures sections de la bibliothèque pour chaque rôle, une par maquette : la barre que chaque nouvelle maquette doit dépasser. Mis à jour à chaque ajout (${new Date().toLocaleDateString('fr-FR')}).</p>
    <nav class="palmares-roles" aria-label="Rôles">${Object.keys(palmares).map((r) => `<a href="#${r}">${echapper(r)}</a>`).join(' ')}</nav>
  </div>
${Object.entries(palmares).map(([role, liste]) => `  <section class="palmares-role" id="${role}">
    <h2>${echapper(role)} <span>${liste.length}</span></h2>
    <div class="grille">${cartes(role, liste)}
    </div>
  </section>`).join('\n')}
</main>
<footer class="pied"><p>Usage interne, non indexé. Le palmarès se recalcule avec <code>node outils/palmares.mjs</code>.</p></footer>
</body>
</html>
`;
fs.writeFileSync(path.join(RACINE, 'palmares', 'index.html'), html);
console.log(`palmarès : ${Object.keys(palmares).length} rôles, ${Object.values(palmares).reduce((n, l) => n + l.length, 0)} sections → palmares.json, palmares/index.html, palmares/planches/`);
