// Recherche dans la bibliothèque : sections et modules classés selon le client, avec chemin de la fiche et capture.
// node outils/chercher.mjs --activite restauration --metier pizzeria --besoin vendre --ton chaleureux --role ouverture [mots libres] [--max 15] [--json]
//
// Ce qui décrit le client (départage le classement, n'exclut rien sauf avec --strict) :
//   --activite     une des 25 activités ; les métiers voisins (taxonomie.json, « voisins ») comptent aussi, un peu moins
//   --metier       métier précis en mots libres (« plombier », « avocat ») : le plus fort critère quand il correspond
//   --besoin       ce que le site doit faire : vendre, réserver, devis, rendez-vous, portfolio, catalogue, agenda, inscription, dons…
//   --luminosite   clair ou sombre ; --ton (chaleureux, doux, sobre…) ; --univers (minéral, végétal, océanique…) ;
//   --ambiance     (ancienne liste, réunion des trois) ; --concept
// Ce que doit être la section ou le module (filtre obligatoire) :
//   --role --animation --interaction --dependance --telephone
//   --famille      famille d'effet de la grille wouahou (22, taxonomie : famille) : 3d, typo-geante, plein-ecran, carrousel, vitesse,
//                  lumiere-pointeur, webgl, defilement-horizontal, masque, trait-qui-se-dessine, morphing, particules, profondeur,
//                  plongee, ambiance-qui-change, video-pilotee, empilement, recomposition, curseur-vivant ;
//                  et les points fixes objet-manipulable, fil-conducteur, scene-epinglee
//   --impact       calme, vivant ou spectaculaire
//   --plan         plan de la page d'accueil (taxonomie : plan) : sections d'accueil des maquettes qui l'ont (plan noté à la main)
//   --module (seulement ce qui existe en module), --sans <dependance>, --note-min N (1-5)
//   --strict       les critères du client deviennent obligatoires (activité exacte, besoin, luminosité…)
//   --par-maquette N  au plus N sections d'une même maquette dans les résultats (3 par défaut ; 0 : pas de limite)
// node outils/chercher.mjs --dernieres [N] : les N dernières maquettes (5 par défaut) avec leur plan, les familles de leur accueil,
//           les modules repris, la forme du voile, l'objet manipulé et le fil conducteur, pour ne rien redonner au client suivant
//           (« Chaque maquette est unique », partie 2 de la skill). En bas : les familles et les plans encore libres.
// Classement : la qualité (note) d'abord, puis la proximité avec le client : même métier +6, même activité +5, activité voisine +2,5,
// chaque besoin commun +2,5, chaque trait d'ambiance commun +1. Un module part de 12 (autant qu'une section notée 5, réutilisable et reliée à un module : c'est du code testé) et gagne la même proximité (convient_a, ambiances) :
// il ne passe devant une bonne section du métier que s'il convient lui aussi au client. Pour un module, l'activité compte selon sa spécificité : citée en
// premier parmi six activités au plus, elle vaut +5 ; citée plus loin ou parmi beaucoup d'autres, moins (un module générique ne passe plus devant un module du métier).
import fs from 'node:fs';
import path from 'node:path';
import { motsMetier, metierCommun, RACINE, TAXO, lireJson, dernieresMaquettes } from './commun.mjs';
import { deduireModule, besoins as besoinsDe } from './deduire.mjs';

const args = process.argv.slice(2);
const f = { activite: [], concept: [], ambiance: [], luminosite: [], ton: [], univers: [], besoin: [], role: [], animation: [], interaction: [], dependance: [], telephone: [], famille: [], impact: [], plan: [], sans: [] };
const mots = [], metierMots = []; let max = 15, json = false, seulModules = false, noteMin = 1, strict = false, dernieres = 0, parMaquette = 3;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') json = true;
  else if (a === '--module' || a === '--modules') seulModules = true;
  else if (a === '--strict') strict = true;
  else if (a === '--max') max = +args[++i];
  else if (a === '--par-maquette') parMaquette = +args[++i];
  else if (a === '--note-min') noteMin = +args[++i];
  else if (a === '--metier' || a === '--metiers') metierMots.push(...String(args[++i] || '').split(/[\s,]+/).filter((x) => x.length > 2));
  else if (a === '--dernieres' || a === '--derniere') dernieres = /^\d+$/.test(args[i + 1] || '') ? +args[++i] : 5;
  else if (a.startsWith('--')) {
    const k = a.slice(2).replace('interactions', 'interaction').replace('familles', 'famille').replace('besoins', 'besoin').replace(/s$/, '');
    if (!(k in f)) { console.error(`filtre inconnu : ${a}`); process.exit(1); }
    const v = args[++i];
    const liste = k === 'sans' ? TAXO.dependance : TAXO[k];
    for (const x of String(v).split(',')) { if (!liste.includes(x)) { console.error(`« ${x} » n'est pas dans la taxonomie (${k}) : ${liste.join(', ')}`); process.exit(1); } f[k].push(x); }
  } else mots.push(a);
}
/* Sortie complète avant de quitter : process.exit() juste après console.log coupait un long JSON écrit dans un tube (64 Ko). */
async function finir(texte) { if (texte != null) await new Promise((r) => process.stdout.write(texte + '\n', r)); process.exit(0); }
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const racine = (w) => norm(w).replace(/(aux|eaux|s|x)$/, '');
const motsN = mots.map(racine).filter(Boolean);
const metierN = motsMetier(metierMots);
const inter = (a, b) => !b.length || (a || []).some((x) => b.includes(x));
const communs = (a, b) => (a || []).filter((x) => b.includes(x)).length;
const liste = (d) => (fs.existsSync(d) ? fs.readdirSync(d) : []);
const voisins = new Set(f.activite.flatMap((a) => (TAXO.voisins?.[a] || [])).filter((a) => !f.activite.includes(a)));

const maquettes = Object.fromEntries(liste(path.join(RACINE, 'maquettes')).filter((x) => x.endsWith('.json')).map((x) => { const m = lireJson(path.join(RACINE, 'maquettes', x)); return [m.depot, m]; }));
if (dernieres) {
  const l = dernieresMaquettes(dernieres);
  const vues = new Set(l.flatMap((m) => m.familles_accueil)), plans = new Set(l.map((m) => m.plan).filter(Boolean));
  const fixes = new Set(TAXO.famille_points_fixes || []);
  const libres = TAXO.famille.filter((x) => !fixes.has(x) && !vues.has(x)), plansLibres = TAXO.plan.filter((x) => !plans.has(x));
  if (json) await finir(JSON.stringify({ maquettes: l, familles_libres: libres, plans_libres: plansLibres }, null, 1));
  const lignes = [`Les ${l.length} dernières maquettes : ne rien leur reprendre de visible (plan, familles de l'accueil, objet, voile, fil, apparence des modules).\n`];
  for (const m of l) lignes.push(`${m.date}  ${m.depot}  · ${m.activite.join(', ')}
        plan ${m.plan || 'non noté'} · voile ${m.voile || 'non relevé'}
        familles de l'accueil : ${m.familles_accueil.join(', ') || 'aucune relevée'}${m.points_fixes.length ? ` (points fixes : ${m.points_fixes.join(', ')})` : ''}
        modules : ${m.modules.join(', ') || 'aucun relié'}
        objet ${m.objet || 'non noté'} · fil ${m.fil || 'non noté'}\n`);
  lignes.push(`Familles libres (absentes de ces accueils) : ${libres.join(', ') || 'aucune'}`, `Plans libres : ${plansLibres.join(', ')}`);
  await finir(lignes.join('\n'));
}

/* Proximité avec le client, et pourquoi (affiché à côté de chaque résultat). */
function proximite({ activites = [], metierTexte = '', besoins = [], luminosite = null, ton = [], univers = [], ambiance = [], concept = [] }) {
  let p = 0; const pourquoi = [];
  if (metierCommun(metierN, metierTexte).length) { p += 6; pourquoi.push('même métier'); }
  if (f.activite.length) {
    if (inter(activites, f.activite)) { p += 5; pourquoi.push('même activité'); }
    else if (activites.some((a) => voisins.has(a))) { p += 2.5; pourquoi.push('activité voisine'); }
  }
  const nb = communs(besoins, f.besoin); if (nb) { p += 2.5 * nb; pourquoi.push(`besoin ${besoins.filter((x) => f.besoin.includes(x)).join(', ')}`); }
  const amb = (luminosite && f.luminosite.includes(luminosite) ? 1 : 0) + communs(ton, f.ton) + communs(univers, f.univers) + communs(ambiance, f.ambiance) + communs(concept, f.concept);
  if (amb) { p += amb; pourquoi.push('ambiance proche'); }
  return { p, pourquoi };
}
function exclueParStrict({ activites = [], metierTexte = '', besoins = [], luminosite = null, ton = [], univers = [], ambiance = [], concept = [] }) {
  if (!strict) return false;
  return (f.activite.length && !inter(activites, f.activite)) || (metierN.length && !metierCommun(metierN, metierTexte).length)
    || (f.besoin.length && !f.besoin.every((b) => besoins.includes(b))) || (f.luminosite.length && luminosite && !f.luminosite.includes(luminosite))
    || (f.ton.length && !inter(ton, f.ton)) || (f.univers.length && !inter(univers, f.univers)) || (f.ambiance.length && !inter(ambiance, f.ambiance)) || (f.concept.length && !inter(concept, f.concept));
}
function texteOk(texte) {
  if (!motsN.length) return 0;
  const t = norm(texte); const n = motsN.filter((m) => t.includes(m)).length;
  return n ? n * 2 : null;
}

const res = [];
// Sections
for (const m of Object.values(maquettes)) {
  const client = { activites: m.activite, metierTexte: [m.metier, m.client].join(' '), besoins: m.besoins || [], luminosite: m.luminosite, ton: m.ton || [], univers: m.univers || [], ambiance: m.ambiance, concept: m.concept };
  if (exclueParStrict(client)) continue;
  /* Les besoins comptent section par section : un besoin de la maquette ne se propage plus à toutes ses sections (le voile
     d'une brasserie remontait pour un avocat parce que la maquette avait « rendez-vous » ; audit externe). Un besoin de la
     maquette que la section ne porte pas compte encore un peu (+0,8) : c'est le contexte. */
  const { p, pourquoi } = proximite({ ...client, besoins: [] });
  for (const id of m.sections) {
    const s = lireJson(path.join(RACINE, 'sections', id + '.json'));
    if (seulModules && !s.modules?.length && !s.module) continue;
    if (s.note_qualite < noteMin) continue;
    if (!inter([s.role], f.role) || !inter(s.animations, f.animation) || !inter(s.interactions, f.interaction) || !inter(s.dependances, f.dependance) || !inter([s.telephone], f.telephone)) continue;
    if (!inter(s.familles || [], f.famille) || !inter([s.impact], f.impact)) continue;
    if (f.plan.length && (s.page !== 'index' || !f.plan.includes(m.plan))) continue;
    if (f.sans.length && s.dependances.some((d) => f.sans.includes(d))) continue;
    const t = texteOk([s.titre, s.description, ...(s.pieges || []), ...(s.particularites || []), m.client, m.metier, ...m.activite].join(' '));
    if (t === null) continue;
    let pb = 0; const pq = [...pourquoi];
    if (f.besoin.length) {
      const bs = besoinsDe([s], { interactions: [] });
      const ici = bs.filter((b) => f.besoin.includes(b)), contexte = (m.besoins || []).filter((b) => f.besoin.includes(b) && !bs.includes(b));
      pb = 2.5 * ici.length + 0.8 * contexte.length;
      if (ici.length) pq.push(`besoin ${ici.join(', ')}`); else if (contexte.length) pq.push(`besoin de la maquette (${contexte.join(', ')})`);
    }
    /* Sans capture, une section ne se montre pas sur la planche d'intention : elle passe derrière. */
    const sansCapture = !s.medias?.capture;
    const sc = s.note_qualite * 2 + (s.reutilisable ? 1 : 0) + (s.module ? 1 : 0) + p + pb + t - (sansCapture ? 1.5 : 0);
    res.push({ type: 'section', id: s.id, maquette: m.depot, score: Math.round(sc * 10) / 10, note: s.note_qualite, role: s.role, titre: s.titre || `(${s.role}, sans titre)`, animations: s.animations, familles: s.familles || [], impact: s.impact, module: s.module, modules: s.modules,
      metier: m.metier, activite: m.activite, pourquoi: sansCapture ? [...pq, 'sans capture'] : pq, fiche: `sections/${s.id}.json`, capture: s.medias.capture || null, video: s.medias.video || null, en_ligne: m.url + (s.page === 'index' ? '' : '/' + s.page) });
  }
}
// Modules
for (const d of liste(path.join(RACINE, 'modules'))) {
  const fj = path.join(RACINE, 'modules', d, 'module.json'); if (!fs.existsSync(fj)) continue;
  const m = lireJson(fj);
  if (f.plan.length) break; // un plan est celui d'une maquette : les modules n'en ont pas
  if (!inter([m.role], f.role) || !inter(m.animations, f.animation) || !inter(m.dependances, f.dependance)) continue;
  if (f.interaction.length && !inter(m.interactions || [], f.interaction)) continue;
  if (!inter([m.telephone], f.telephone)) continue;
  if (f.sans.length && m.dependances.some((x) => f.sans.includes(x))) continue;
  const notes = fs.existsSync(path.join(RACINE, 'modules', d, 'NOTES.md')) ? fs.readFileSync(path.join(RACINE, 'modules', d, 'NOTES.md'), 'utf8') : '';
  const dm = deduireModule(m, notes);
  if (!inter(dm.familles, f.famille) || !inter([dm.impact], f.impact)) continue;
  const bes = besoinsDe([{ id: m.nom, titre: m.titre, description: notes.split(/\n## /)[0], role: m.role, interactions: m.interactions || [] }], { interactions: m.interactions || [] });
  // Un module s'adapte à toute palette : la luminosité ne le départage pas ; ses ambiances valent pour le ton et l'univers.
  const client = { activites: m.convient_a || [], metierTexte: [m.titre, notes].join(' '), besoins: bes, ton: m.ambiances || [], univers: m.ambiances || [], ambiance: m.ambiances || [] };
  if (strict && ((f.activite.length && !inter(m.convient_a || [], f.activite)) || (f.besoin.length && !f.besoin.every((b) => bes.includes(b))) || (f.ton.length && !inter(m.ambiances || [], f.ton)) || (f.univers.length && !inter(m.ambiances || [], f.univers)) || (f.ambiance.length && !inter(m.ambiances || [], f.ambiance)))) continue;
  /* Activité d'un module : un module fait pour un métier (il le cite en premier, sur peu d'activités) compte plus qu'un module
     générique qui en cite dix. Sans cela, les 46 modules « adaptés à la restauration » arrivaient au même niveau que la carte du
     restaurant ou la réservation de table. */
  const ca = m.convient_a || [];
  const largeur = Math.min(1, 6 / Math.max(1, ca.length));
  const rang = f.activite.length ? Math.min(...f.activite.map((a) => { const i = ca.indexOf(a); return i < 0 ? 99 : i; })) : 99;
  let { p, pourquoi } = proximite({ ...client, activites: [], metierTexte: '' });
  if (f.activite.length) {
    if (rang < 99) { const sp = largeur * (rang === 0 ? 1 : rang <= 2 ? 0.85 : 0.6); p += 5 * sp; pourquoi.unshift(sp >= 0.8 ? 'fait pour cette activité' : 'convient aussi à cette activité'); }
    else if (ca.some((a) => voisins.has(a))) { p += 2.5 * largeur; pourquoi.unshift('activité voisine'); }
  }
  // Un module qui répond au besoin demandé (son interaction ou son texte : panier, réservation, devis…) est l'outil même de ce besoin : +1,5 de plus.
  if (f.besoin.length) p += 1.5 * communs(bes, f.besoin);
  // Le métier précis : un module n'en a pas, mais son titre ou le début de ses notes peut le citer (« carte du restaurant »).
  if (metierCommun(metierN, [m.titre, notes.split(/\n## /)[0]].join(' ')).length) { p += 3; pourquoi.unshift('métier cité'); }
  const t = texteOk([m.titre, m.role, ...m.animations, notes].join(' '));
  if (t === null) continue;
  res.push({ type: 'module', id: m.nom, score: Math.round((12 + p + t) * 10) / 10, role: m.role, titre: m.titre, animations: m.animations, familles: dm.familles, impact: dm.impact, pourquoi,
    dossier: `modules/${m.nom}/`, capture: `modules/${m.nom}/apercu.jpg`, origine: m.origine, provenance: m.provenance || 'projet', inspirations: m.inspirations || [], tests: Object.values(m.tests || {}).every((v) => (typeof v === 'number' ? v < 0.1 : /^(ok|n\/a|0 erreur)$/.test(v))) ? 'ok' : 'à revoir' });
}
/* Tri stable : score, puis module avant section, puis identifiant (l'ancien comparateur n'était pas un ordre cohérent). */
res.sort((a, b) => b.score - a.score || (a.type === b.type ? 0 : a.type === 'module' ? -1 : 1) || String(a.id).localeCompare(String(b.id)));
/* Variété : au plus --par-maquette sections d'une même maquette (3 par défaut ; 0 pour tout voir). Quatre sections du même
   château occupaient le haut du classement d'une pâtisserie (audit externe). */
const parDepot = new Map(); let masquees = 0;
const varies = parMaquette > 0 ? res.filter((r) => { if (r.type !== 'section') return true; const n = (parDepot.get(r.maquette) || 0) + 1; parDepot.set(r.maquette, n); if (n > parMaquette) { masquees++; return false; } return true; }) : res;
const out = varies.slice(0, max);
if (json) await finir(JSON.stringify(out, null, 1));
if (!out.length) await finir('Aucun résultat. Retirez un filtre ou un mot.');
if (f.activite.length && voisins.size) console.log(`Activités voisines prises en compte : ${[...voisins].join(', ')}`);
console.log(`${varies.length} résultat${varies.length > 1 ? 's' : ''}${varies.length > max ? ` (les ${max} premiers)` : ''}${masquees ? ` · ${masquees} section(s) masquée(s) au-delà de ${parMaquette} par maquette (--par-maquette 0 pour tout voir)` : ''} :\n`);
for (const r of out) {
  const effets = [r.impact, ...(r.familles || [])].filter(Boolean).join(', ');
  const pq = r.pourquoi?.length ? `  ← ${r.pourquoi.join(', ')}` : '';
  if (r.type === 'module') console.log(`MODULE  ${r.id}  · ${r.role} · ${effets}${pq}\n        ${r.titre}\n        ${r.dossier}  ·  ${r.provenance === 'à part' ? `créé à part, pas encore servi (inspirations ${r.inspirations.join(', ') || '—'})` : `origine ${r.origine}`} · tests ${r.tests}\n        capture ${r.capture}\n`);
  else console.log(`${r.note}/5     ${r.id}  · ${r.role} · ${effets}${r.module ? ' · module ' + r.module : ''}${pq}\n        ${r.titre}  (${r.metier}, ${r.activite.join(', ')})\n        ${r.fiche}\n        capture ${r.capture || '—'}${r.video ? '  ·  vidéo ' + r.video : ''}\n        ${r.en_ligne}\n`);
}
