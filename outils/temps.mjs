// Temps réel des projets, tiré des journaux (journaux/<dépôt>.json, copiés par outils/grille.mjs depuis _audit/journal.json).
// node outils/temps.mjs [--json] [--toutes]   (v1 seulement par défaut ; --toutes : toutes les versions)
// Par étape : nombre de projets, temps moyen et médian, budget, écart ; puis totaux (travail, attente, allers-retours)
// et modules les plus réutilisés. C'est ici qu'on voit où le temps part vraiment, avant de corriger la skill.
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson, resumeJournal } from './commun.mjs';

const json = process.argv.includes('--json'), toutes = process.argv.includes('--toutes');
const dos = path.join(RACINE, 'journaux');
const fichiers = fs.existsSync(dos) ? fs.readdirSync(dos).filter(f => f.endsWith('.json')) : [];
if (!fichiers.length) { console.log('Aucun journal pour le moment (journaux/ vide) : ils arrivent avec les projets faits avec la skill v10.3.'); process.exit(0); }
const parEtape = new Map(), versions = [], modules = new Map();
for (const f of fichiers) {
  const j = lireJson(path.join(dos, f));
  const resumes = resumeJournal(j);
  (j.versions || []).forEach((v, i) => {
    if (!toutes && Number(v.version) !== 1) return;
    const r = resumes[i];
    versions.push({ depot: f.replace(/\.json$/, ''), version: v.version, travail: r.travail, budget: r.budget, attente: r.attente, allers_retours: r.allers_retours, echecs: v.audit?.echecsPremierPassage ?? null });
    for (const e of r.etapes) { if (!parEtape.has(e.etape)) parEtape.set(e.etape, { budget: e.budget, min: [] }); parEtape.get(e.etape).min.push(e.min); }
    for (const m of v.modules || []) modules.set(m, (modules.get(m) || 0) + 1);
  });
}
const moy = l => l.length ? l.reduce((s, x) => s + x, 0) / l.length : 0;
const med = l => { if (!l.length) return 0; const t = [...l].sort((a, b) => a - b), k = Math.floor(t.length / 2); return t.length % 2 ? t[k] : (t[k - 1] + t[k]) / 2; };
const etapes = [...parEtape].map(([etape, x]) => ({ etape, projets: x.min.length, moyenne: Math.round(moy(x.min)), mediane: Math.round(med(x.min)), budget: x.budget, ecart: Math.round(moy(x.min) - x.budget) }));
const bilan = { versions: versions.length, travail_moyen: Math.round(moy(versions.map(v => v.travail))), budget_moyen: Math.round(moy(versions.map(v => v.budget))), attente_moyenne: Math.round(moy(versions.map(v => v.attente))),
  allers_retours_moyens: +moy(versions.map(v => v.allers_retours).filter(x => x != null)).toFixed(1), echecs_premier_audit: +moy(versions.map(v => v.echecs).filter(x => x != null)).toFixed(1) };
if (json) { console.log(JSON.stringify({ bilan, etapes, versions, modules: Object.fromEntries([...modules].sort((a, b) => b[1] - a[1])) }, null, 1)); process.exit(0); }
console.log(`${versions.length} ${toutes ? 'version(s)' : 'v1'} sur ${fichiers.length} projet(s) : ${bilan.travail_moyen} min de travail en moyenne pour ${bilan.budget_moyen} min de budget, ${bilan.attente_moyenne} min d'attente de l'utilisateur, ${bilan.allers_retours_moyens} aller(s)-retour(s), ${bilan.echecs_premier_audit} échec(s) au premier audit.\n`);
console.log('Étape | projets | moyenne | médiane | budget | écart');
for (const e of etapes) console.log(`${e.etape} | ${e.projets} | ${e.moyenne} min | ${e.mediane} min | ${e.budget} min | ${e.ecart > 0 ? '+' : ''}${e.ecart} min`);
if (modules.size) console.log(`\nModules les plus réutilisés : ${[...modules].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([m, n]) => `${m} (${n})`).join(', ')}`);
if (versions.length < 5) console.log(`\nÀ lire avec prudence : ${versions.length} projet(s) seulement ; attendre au moins cinq projets avant de corriger le budget de la skill.`);
