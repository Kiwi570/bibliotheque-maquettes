// Produit maquettes/<depot>.json, sections/<depot>/*.json et audits/<depot>.md
// à partir de l'inventaire automatique (inventaire/<depot>.json) et des notes manuelles (notes-manuelles/<depot>.json).
// node outils/fiches.mjs <depot> [<depot> ...]
//
// Format des notes manuelles (tout ce qu'un script ne peut pas juger) :
// {
//   "maquette": { "metier": "radio" (métier précis, court ; sinon tiré du client), "client": "radio de glisse", "activite": [...], "concept": [...], "ambiance": [...],
//                 "palette": {"fond": "--ink", "texte": "--foam", "accent": "--sun", "secondaire": "--blue"},   // noms de variables :root ou #hex
//                 "polices": {"titres": "...", "texte": "...", "mono": "..."},
//                 "points_forts": [...], "reserves": [...], "animations": [...], "interactions": [...],
//                 "change_depuis_audit": "texte ou null", "accueil": "<id du bloc d'ouverture>",
//                 "grille": {"objet": "objet que le visiteur manipule, en quelques mots", "fil": "fil conducteur, en quelques mots"} },
//   (la forme du voile, l'intro vers l'objet et les marques data-grille sont relevées par outils/grille.mjs ;
//    le journal du projet, _audit/journal.json, est copié dans journaux/ par le même outil)
//   "sections": { "<id inventaire>": { "titre", "role", "description", "animations", "interactions", "telephone",
//                 "note_qualite", "reutilisable", "module", "modules"?: ["autres modules tirés de la section"], "pieges", "dependances"?, "particularites"?: ["mécanique rare, texte libre"], "code"?: {...}, "ignorer"?: "raison" } }
// }
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, AUDIT, lireJson, ecrireJson, resumeJournal } from './commun.mjs';
import { deduireSection, deduireMaquette } from './deduire.mjs';

const DEP_GLOBALES = { gsap: 'gsap', scrolltrigger: 'scrolltrigger', splittext: 'splittext', flip: 'flip', lenis: 'lenis', ogl: 'ogl', three: 'three' };

for (const depot of process.argv.slice(2)) {
  const inv = lireJson(path.join(RACINE, 'inventaire', `${depot}.json`));
  const idt = lireJson(path.join(RACINE, 'inventaire', `${depot}-identite.json`), {});
  const notes = lireJson(path.join(RACINE, 'notes-manuelles', `${depot}.json`));
  // Notes d'audit : audit-maquettes/<dépôt>/notes.json ; à défaut (autre ordinateur), celles de la fiche déjà publiée.
  const ancienne = lireJson(path.join(RACINE, 'maquettes', `${depot}.json`), null);
  const audit = lireJson(path.join(AUDIT, depot, 'notes.json'), null) || (ancienne && { url: ancienne.url, note: ancienne.note, verdict: ancienne.verdict, ...(ancienne.commit_audit ? { correction: { commit: ancienne.commit_audit, note: ancienne.note } } : {}) });
  if (!audit) throw new Error(`${depot} : ni ${path.join(AUDIT, depot, 'notes.json')} ni fiche maquette publiée`);
  const nm = notes.maquette;
  const grilleAuto = lireJson(path.join(RACINE, 'inventaire', `${depot}-grille.json`), null);
  const journal = lireJson(path.join(RACINE, 'journaux', `${depot}.json`), null);
  const couleur = v => !v ? null : v.startsWith('--') ? (idt.variables_couleur?.[v] ?? null) : v;

  // Dépendances réellement chargées (toutes pages confondues).
  const glob = {}; for (const p of Object.values(inv.pages)) for (const [k, v] of Object.entries(p.globals || {})) glob[k] ||= v;
  const depsMaquette = Object.keys(DEP_GLOBALES).filter(k => glob[k]);
  if (inv.blocs.some(b => b.canvas.includes('2d'))) depsMaquette.push('canvas');

  const dossierSec = path.join(RACINE, 'sections', depot);
  fs.rmSync(dossierSec, { recursive: true, force: true });
  const ids = [], secs = [];
  const manquantes = [];
  for (const b of inv.blocs) {
    const n = notes.sections[b.id];
    if (!n) { manquantes.push(b.id); continue; }
    if (n.ignorer) continue;
    let deps = n.dependances;
    if (!deps) {
      const d = new Set();
      if (b.tweens || b.scrolltriggers.length) d.add('gsap');
      if (b.scrolltriggers.length) d.add('scrolltrigger');
      if (b.decoupe && glob.splittext) d.add('splittext');
      if (b.canvas.includes('webgl')) d.add(glob.ogl ? 'ogl' : glob.three ? 'three' : 'canvas');
      if (b.canvas.includes('2d')) d.add('canvas');
      deps = d.size ? [...d] : ['aucune'];
    }
    const medias = {};
    if (b.medias.capture && !n.sans_capture) medias.capture = b.medias.capture;
    // Règle des médias : capture ordinateur pour toutes les sections ; capture téléphone et vidéo seulement pour les notes 4 et 5.
    const forte = n.note_qualite >= 4;
    if (forte && b.medias.capture_m390 && !n.sans_capture) medias.capture_m390 = b.medias.capture_m390;
    if (forte && b.medias.video && (n.animations || []).some(a => a !== 'aucune')) medias.video = b.medias.video;
    if (n.medias) for (const [k, v] of Object.entries(n.medias)) if (k === 'capture' || forte) medias[k] = v; // emprunt (ex. vidéo du chargement portée par le héros)
    const fiche = {
      id: `${depot}/${b.id}`, maquette: depot, page: b.page, ...(b.pages.length > 1 ? { pages: b.pages } : {}),
      titre: n.titre, role: n.role, description: n.description,
      animations: n.animations, interactions: n.interactions, dependances: deps,
      telephone: n.telephone, note_qualite: n.note_qualite, reutilisable: !!n.reutilisable, module: n.module || null,
      modules: [...new Set([n.module, ...(n.modules || [])].filter(Boolean))], // module principal en tête, puis les autres modules tirés de cette section
      code: { ...b.code, ...(n.code || {}) }, medias, pieges: n.pieges || [],
      ...(n.particularites?.length ? { particularites: n.particularites } : {}),
      mesures: { hauteur_p1440: b.hauteur, hauteur_m390: b.hauteur_m390, epinglee: b.scrolltriggers.some(s => s.pin), scrolltriggers: b.scrolltriggers.length },
    };
    Object.assign(fiche, deduireSection(fiche, n)); // familles d'effets et impact (taxonomie v4)
    ecrireJson(path.join(dossierSec, `${b.id}.json`), fiche);
    ids.push(fiche.id); secs.push(fiche);
  }
  if (manquantes.length) console.warn(`${depot} : ${manquantes.length} blocs sans note manuelle : ${manquantes.join(', ')}`);

  const accueil = inv.blocs.find(b => b.id === (nm.accueil || 'hero')) || inv.blocs.find(b => b.page === 'index' && b.dans_main);
  const correctionCommit = audit.correction?.commit;
  const fiche = {
    depot, url: audit.url, client: nm.client,
    activite: nm.activite, concept: nm.concept, ambiance: nm.ambiance,
    palette: Object.fromEntries(Object.entries(nm.palette).map(([k, v]) => [k, couleur(v)])),
    metier: null, luminosite: null, ton: [], univers: [], besoins: [], // remplis juste après (deduire.mjs)
    polices: nm.polices,
    pages: Object.keys(inv.pages).sort((a, b) => (a === 'index' ? -1 : b === 'index' ? 1 : a === '404' ? 1 : b === '404' ? -1 : a.localeCompare(b))),
    commit: inv.commit, date_commit: inv.date_commit.slice(0, 10),
    ...(nm.change_depuis_audit ? { change_depuis_audit: nm.change_depuis_audit } : {}),
    note: audit.correction?.note ?? audit.note, verdict: audit.verdict,
    points_forts: nm.points_forts, reserves: nm.reserves,
    animations: nm.animations, interactions: nm.interactions, dependances: nm.dependances || depsMaquette,
    ...(nm.particularites?.length ? { particularites: nm.particularites } : {}),
    // Grille wouahou : ce que le visiteur manipule, forme du voile, fil (pour ne pas redonner les mêmes au client suivant).
    ...(nm.grille?.objet || nm.grille?.fil || grilleAuto?.voile || grilleAuto?.intro_vers_objet || Object.values(grilleAuto?.marques || {}).some((l) => l.length) ? { grille: {
      voile: grilleAuto?.voile ?? nm.grille?.voile ?? null,
      objet: nm.grille?.objet || null,
      fil: nm.grille?.fil || null,
      intro_vers_objet: grilleAuto ? grilleAuto.intro_vers_objet : null,
      marques: grilleAuto ? Object.entries(grilleAuto.marques).filter(([, l]) => l.length).map(([k]) => k) : [],
    } } : {}),
    ...(journal ? { journal: { fichier: `journaux/${depot}.json`, versions: resumeJournal(journal).map(({ etapes, ...v }) => v) } } : {}),
    sections: ids,
    captures: { 'accueil-ordinateur': accueil?.medias.capture, 'accueil-telephone': accueil?.medias.capture_m390 },
    audit: `https://github.com/Kiwi570/bibliotheque-maquettes/blob/main/audits/${depot}.md`,
    commit_audit: correctionCommit || null,
  };
  Object.assign(fiche, deduireMaquette(fiche, secs, nm));
  ecrireJson(path.join(RACINE, 'maquettes', `${depot}.json`), fiche);

  // Rapport d'audit, suivi du compte rendu de correction s'il existe.
  // (sans le dossier d'audit, le rapport déjà publié dans audits/ est gardé tel quel)
  const fRapport = path.join(AUDIT, depot, 'rapport.md');
  let md = fs.existsSync(fRapport) ? fs.readFileSync(fRapport, 'utf8') : fs.readFileSync(path.join(RACINE, 'audits', `${depot}.md`), 'utf8');
  const corr = path.join(AUDIT, depot, 'correction', 'correction.md');
  if (fs.existsSync(fRapport) && fs.existsSync(corr)) md += '\n\n---\n\n' + fs.readFileSync(corr, 'utf8').replace(/^# /m, '## ');
  fs.mkdirSync(path.join(RACINE, 'audits'), { recursive: true });
  fs.writeFileSync(path.join(RACINE, 'audits', `${depot}.md`), md);
  // Élagage : on supprime les médias de cette maquette qu'aucune fiche ne référence.
  const refs = new Set(Object.values(fiche.captures).filter(Boolean));
  for (const id of ids) for (const v of Object.values(lireJson(path.join(RACINE, 'sections', id + '.json')).medias)) refs.add(v);
  const dm = path.join(RACINE, 'medias', depot); let sup = 0;
  for (const f of fs.existsSync(dm) ? fs.readdirSync(dm) : []) if (!refs.has(`medias/${depot}/${f}`)) { fs.rmSync(path.join(dm, f)); sup++; }
  console.log(`${depot} : fiche maquette + ${ids.length} sections${sup ? `, ${sup} médias élagués` : ''}`);
}
