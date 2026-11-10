// Champs déduits automatiquement des fiches, pour mieux chercher (taxonomie v4).
//   Maquette : metier (notes manuelles, sinon tiré du client), luminosite (couleur de fond), ton et univers (tirés de l'ambiance),
//              besoins (ce que le site doit faire, tirés de ses sections).
//   Section et module : familles (familles d'effets de la grille wouahou) et impact (calme, vivant, spectaculaire).
// Une valeur écrite à la main dans les notes manuelles (maquette.metier, maquette.besoins, section.familles, section.impact) l'emporte.
// node outils/deduire.mjs    met à jour toutes les fiches publiées (maquettes/ et sections/) ; fiches.mjs l'applique aussi à chaque génération.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RACINE, TAXO, lireJson, ecrireJson } from './commun.mjs';

const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* ---------- Maquette ---------- */
export function metierAuto(client) {
  let t = String(client || '').split(/\s\(|,|\s:\s|;|\s—\s|\s–\s|\s-\s/)[0];
  t = t.replace(/\s(à|en|au|aux|dans|sur|près de|entre|pour)\s[A-ZÉÈÀÎÔ].*$/u, '').trim();
  return t.charAt(0).toLowerCase() + t.slice(1);
}
export function luminosite(palette, ambiance = []) {
  const hex = (palette && palette.fond) || '';
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return ambiance.includes('sombre') || ambiance.includes('nocturne') ? 'sombre' : 'clair';
  let h = m[1]; if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.25 ? 'sombre' : 'clair';
}
export function besoins(sections, maquette = {}) {
  const b = new Set();
  const tout = new Set([...(maquette.interactions || []), ...sections.flatMap((s) => s.interactions || [])]);
  if (tout.has('panier-simule')) b.add('vendre');
  if (tout.has('réservation-simulee')) b.add('réserver');
  if (tout.has('lecteur-audio') || tout.has('lecteur-vidéo')) b.add('écouter-regarder');
  /* Le reste se juge section par section, sur son propre texte (jamais sur le texte de toute la maquette). */
  for (const s of sections) {
    const t = norm([s.id, s.titre, s.description].join(' ')), r = s.role, I = new Set(s.interactions || []);
    if (/\breserv(er|ation|ez)\b/.test(t) && ['contact', 'outil-interactif', 'offre', 'tarifs', 'agenda', 'appel', 'calculateur'].includes(r)) b.add('réserver');
    if (/\bdevis\b|chiffrage|estimateur|estimation (gratuite|en ligne|du (cout|prix|budget|chantier))/.test(t) || (r === 'calculateur' && /prix|cout|budget|tarif|devis|estim/.test(t))) b.add('devis');
    if (/rendez-vous|\brdv\b|prendre (un )?rendez|prise de rendez|(reserver|choisir|choisissez) (un |votre )?creneau/.test(t)) b.add('rendez-vous');
    if (r === 'portfolio' || (r === 'galerie' && /realisation|projet|oeuvre|travaux|chantier|reference/.test(t))) b.add('portfolio');
    if (r === 'produits' || (I.has('filtres') && ['produits', 'services', 'offre'].includes(r))) b.add('catalogue');
    if (r === 'agenda') b.add('agenda');
    if (/inscri(re|ption|vez)|s'inscrire/.test(t)) b.add('inscription');
    if (/\bdons?\b|faire un don|adhe(sion|rer|rez)|parrain|cagnotte/.test(t)) b.add('dons');
    if (r === 'carte' && /zone|rayon|intervention|secteur|deplac|perimetre/.test(t)) b.add('zone-d-intervention');
  }
  if (b.has('vendre')) b.delete('catalogue');
  return TAXO.besoin.filter((x) => b.has(x));
}
export function deduireMaquette(fiche, sections, manuel = {}) {
  const amb = fiche.ambiance || [];
  return {
    metier: manuel.metier || metierAuto(fiche.client),
    luminosite: manuel.luminosite || luminosite(fiche.palette, amb),
    ton: amb.filter((a) => TAXO.ton.includes(a)),
    univers: amb.filter((a) => TAXO.univers.includes(a)),
    besoins: manuel.besoins || besoins(sections, fiche),
    /* Plan de la page d'accueil (taxonomie : plan) : jamais déduit, noté à la main (notes manuelles, maquette.plan). */
    ...(manuel.plan ? { plan: manuel.plan } : {}),
  };
}

/* ---------- Section et module ---------- */
const POIDS = { 'webgl-shader': 3, 'webgl-particules': 3, 'ouverture-orchestrée': 2, 'galerie-horizontale': 2, 'reactif-vitesse': 2, morphing: 2, 'fil-conducteur': 2,
  'canvas-2d': 1, 'empilement-de-fiches': 1, masque: 1, 'trace-svg': 1, 'révélation-texte': 1, 'révélation-image': 1, parallaxe: 1, compteur: 1, marquee: 1, flip: 1,
  'curseur-personnalisé': 1, 'survol-image': 1, 'filtre-anime': 1, 'chargement-orchestré': 1, 'transition-de-page': 1, rature: 1, 'section-fixée': 1, 'progression-fixée': 1,
  'bouton-magnétique': 0.5, 'apparition-au-défilement': 0.5 };
const FORTES = ['jeu', 'configurateur', 'simulateur', 'schema-interactif', 'carte-interactive', 'saisie-personnalisee'];
const STRUCTURE = ['menu', 'pied-de-page', 'texte-legal', 'barre-fixe'];
export function familles({ animations = [], interactions = [], dependances = [], texte = '', role = '' }) {
  if (STRUCTURE.includes(role)) return [];
  const t = norm(texte).replace(/[’‘]/g, "'"), a = new Set(animations), f = new Set();
  if (/\b3d\b|three\.?js|preserve-3d|cylindre|\bcubes?\b|en volume/.test(t) || dependances.includes('three')) f.add('3d');
  if (/(faire|fait|se fait|font|a faire) tourner|tourne(r)? a la main|a la main avec|attrap|pivoter|manipul|avec (son |de l')?elan|a saisir|faire glisser|glisser du doigt|au glisser|on la lance|se lance|\b360\b/.test(t)) f.add('objet-manipulable');
  if (a.has('marquee') || /geant|typographie (geante|cinetique)|mots? qui (filent|defilent)|titre (enorme|monumental)/.test(t)) f.add('typo-geante');
  if (/(s'ouvre|s'agrandit|grandit|s'etend|se deploie|zoome?|passe|s'elargit)( [a-z']+){0,3} (jusqu'au|en|a) plein (ecran|cadre)|jusqu'au plein (ecran|cadre)/.test(t) && !/visionneuse|loupe|lightbox/.test(t)) f.add('plein-ecran');
  if (/carrousel|carousel/.test(t)) f.add('carrousel');
  if (a.has('reactif-vitesse') || /vitesse du defilement|selon la vitesse/.test(t)) f.add('vitesse');
  if (/(suit|sous|selon) (le |la )?(pointeur|curseur|souris|doigt)|lumiere (qui suit|au pointeur|sous le)|lampe torche|a la lampe/.test(t)) f.add('lumiere-pointeur');
  if (a.has('section-fixée') && a.has('progression-fixée')) f.add('scene-epinglee');
  if (a.has('webgl-shader') || a.has('webgl-particules')) f.add('webgl');
  if (a.has('fil-conducteur')) f.add('fil-conducteur');
  /* v5 : familles ajoutées pour varier les maquettes (déduites seulement quand l'indice est franc). */
  if (a.has('galerie-horizontale') || /defile(nt)? (de cote|a l'horizontale|horizontalement)|frise (horizontale|qui defile)|avance de cote/.test(t)) f.add('defilement-horizontal');
  if (a.has('masque') || /a travers les lettres|texte (en|comme) masque|decoupee? (dans|par) (la|une) forme|se devoile (dans|par) (une|la) forme|clip-path/.test(t)) f.add('masque');
  if (a.has('trace-svg') || /trait qui se dessine|se dessine (au|sous|a mesure)|dessine(e)? au defilement/.test(t)) f.add('trait-qui-se-dessine');
  if (a.has('morphing') || dependances.includes('drawsvg-morphsvg') && /devient|se transforme en/.test(t)) f.add('morphing');
  if (a.has('webgl-particules') || /particules|poussiere (d'or|qui)|petales|braises|flocons|bulles qui|vapeur qui|fumee qui/.test(t)) f.add('particules');
  if (a.has('parallaxe') && /couches|calques|collage|plans? (decoupes|successifs)|en profondeur|decor en plans/.test(t)) f.add('profondeur');
  if (/on (entre|plonge) dans|plongee dans|zoom (a travers|dans l'image)|traverse(r)? l'image|par l'ouverture jusqu/.test(t)) f.add('plongee');
  if (/(le fond|la lumiere|la couleur de la page|l'ambiance) (change|passe|vire|tourne|baisse|tombe)|du jour a la nuit|de l'aube au|du matin au soir|au fil des saisons/.test(t)) f.add('ambiance-qui-change');
  if (a.has('scrub-vidéo') || /video (menee|pilotee|lue) (par|au) (le )?defilement/.test(t)) f.add('video-pilotee');
  if (a.has('empilement-de-fiches') || /s'empilent|empilees? au defilement|pile de (cartes|planches|fiches)/.test(t)) f.add('empilement');
  if (a.has('flip') || /se reorganise|se recompose|se reclasse|tri anime/.test(t)) f.add('recomposition');
  if (a.has('curseur-personnalisé') || /curseur (dessine|personnalise|aimante|qui change)/.test(t)) f.add('curseur-vivant');
  return TAXO.famille.filter((x) => f.has(x));
}
export function impact({ animations = [], interactions = [], fams = [] }) {
  const anims = animations.filter((x) => x !== 'aucune');
  if (!anims.length && !interactions.some((i) => i !== 'aucune' && i !== 'mode-calme')) return 'calme';
  let s = anims.reduce((n, x) => n + (POIDS[x] ?? 1), 0);
  if (interactions.some((i) => FORTES.includes(i))) s += 2;
  s += fams.filter((x) => ['3d', 'objet-manipulable', 'typo-geante', 'plein-ecran', 'carrousel', 'scene-epinglee'].includes(x)).length * 2;
  return s >= 5 ? 'spectaculaire' : s >= 1.5 ? 'vivant' : 'calme';
}
export function deduireSection(s, manuel = {}) {
  const fams = manuel.familles || familles({ animations: s.animations, interactions: s.interactions, dependances: s.dependances, role: s.role, texte: [s.titre, s.description, ...(s.particularites || [])].join(' ') });
  return { familles: fams, impact: manuel.impact || impact({ animations: s.animations, interactions: s.interactions, fams }) };
}
export function deduireModule(m, notes = '') {
  const premier = String(notes).split(/\n## /)[0];
  const fams = familles({ animations: m.animations, interactions: m.interactions, dependances: m.dependances, role: m.role, texte: [m.titre, premier].join(' ') });
  return { familles: fams, impact: impact({ animations: m.animations, interactions: m.interactions, fams }) };
}

/* ---------- Mise à jour des fiches publiées ---------- */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let nm = 0, ns = 0;
  const stats = { impact: {}, famille: {}, besoin: {}, luminosite: {} };
  const compter = (k, v) => { stats[k][v] = (stats[k][v] || 0) + 1; };
  for (const f of fs.readdirSync(path.join(RACINE, 'maquettes')).filter((x) => x.endsWith('.json')).sort()) {
    const fm = path.join(RACINE, 'maquettes', f);
    const m = lireJson(fm);
    const notes = lireJson(path.join(RACINE, 'notes-manuelles', m.depot + '.json'), { maquette: {}, sections: {} });
    const secs = [];
    for (const id of m.sections) {
      const fs_ = path.join(RACINE, 'sections', id + '.json');
      const s = lireJson(fs_);
      const d = deduireSection(s, notes.sections?.[id.split('/')[1]] || {});
      const avant = JSON.stringify([s.familles, s.impact]);
      Object.assign(s, d);
      if (JSON.stringify([s.familles, s.impact]) !== avant) { ecrireJson(fs_, s); ns++; }
      compter('impact', s.impact); s.familles.forEach((x) => compter('famille', x));
      secs.push(s);
    }
    const d = deduireMaquette(m, secs, notes.maquette || {});
    // Les champs déduits se rangent juste après la palette (même ordre que fiches.mjs).
    const ordre = {}; for (const [k, v] of Object.entries(m)) { if (k in d) continue; ordre[k] = v; if (k === 'palette') Object.assign(ordre, d); }
    if (JSON.stringify(ordre) !== JSON.stringify(m)) { ecrireJson(fm, ordre); nm++; }
    compter('luminosite', d.luminosite); d.besoins.forEach((x) => compter('besoin', x));
  }
  console.log(`deduire : ${nm} fiches maquettes et ${ns} fiches sections mises à jour`);
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k} : ${Object.entries(v).sort((a, b) => b[1] - a[1]).map(([x, n]) => `${x} ${n}`).join(', ')}`);
}
