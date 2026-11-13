// Maquettes favorites : la liste des maquettes que l'utilisateur trouve les plus réussies (favoris.json, à la racine).
// Au début de chaque projet, la skill en montre trois ou quatre proches du client (vitrine.mjs --favoris) : le niveau et le style
// visés, jamais un modèle à copier. La liste s'enrichit ici, sans toucher à la skill.
//
//   node outils/favori.mjs                                   la liste, avec la note et l'adresse de chacune
//   node outils/favori.mjs <nom> --pourquoi "ce qui plaît"   ajoute une favorite (ou change sa phrase)
//   node outils/favori.mjs <nom> --retirer                   la retire
// <nom> : « lemoy-premium », « lemoy-premium-maquette » ou l'adresse https://lemoy-premium-maquette.vercel.app.
// Sans --pourquoi, la phrase est tirée de la fiche (métier et premier point fort) : à relire.
// Une favorite absente de la bibliothèque est acceptée, avec un avertissement : sans fiche, la skill ne voit pas ses captures
// (l'ajouter : node outils/ajouter.mjs <dépôt>).
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson, nomDepot } from './commun.mjs';

const FICHIER = path.join(RACINE, 'favoris.json');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : '') : null; };
const nom = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--pourquoi');
const donnees = lireJson(FICHIER, { explication: '', favoris: [] });
const favs = donnees.favoris || (donnees.favoris = []);
const fiche = (d) => lireJson(path.join(RACINE, 'maquettes', d + '.json'), null);
const ecrire = () => {
  const lignes = favs.map((f) => '  ' + JSON.stringify(f));
  fs.writeFileSync(FICHIER, `{\n "explication": ${JSON.stringify(donnees.explication)},\n "favoris": [\n${lignes.join(',\n')}\n ]\n}\n`);
};
const aujourdhui = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

if (!nom) {
  console.log(`${favs.length} maquettes favorites (favoris.json) :\n`);
  for (const f of favs) {
    const m = fiche(f.depot);
    console.log(`${m ? '★' : '·'} ${f.depot.replace(/-maquette$/, '')}${m ? `  ·  ${m.note ?? '?'}/100` : '  ·  pas encore dans la bibliothèque'}\n   ${f.pourquoi}\n   ${m?.url || `https://${f.depot}.vercel.app`}`);
  }
  process.exit(0);
}

const depot = nomDepot(nom);
const i = favs.findIndex((f) => f.depot === depot);
if (args.includes('--retirer')) {
  if (i < 0) { console.error(`${depot} n'est pas dans les favorites.`); process.exit(1); }
  favs.splice(i, 1); ecrire();
  console.log(`retirée : ${depot} (${favs.length} favorites). Commiter favoris.json.`);
  process.exit(0);
}

const m = fiche(depot);
let pourquoi = (opt('--pourquoi') || '').trim();
if (!pourquoi && i >= 0) { console.log(`${depot} est déjà favorite : « ${favs[i].pourquoi} »\nPour changer la phrase : --pourquoi "…".`); process.exit(0); }
if (!pourquoi && m) pourquoi = `${m.metier ? m.metier[0].toUpperCase() + m.metier.slice(1) : m.client} : ${String(m.points_forts?.[0] || '').replace(/^direction « [^»]+ » : /, '')}`.slice(0, 180);
if (!pourquoi) { console.error(`${depot} n'est pas dans la bibliothèque : donner la phrase avec --pourquoi "ce qui plaît".`); process.exit(1); }
if (pourquoi.length > 200) { console.error(`phrase trop longue (${pourquoi.length} caractères, 200 au plus) : ce qui plaît en une ligne.`); process.exit(1); }
if (i >= 0) favs[i].pourquoi = pourquoi; else favs.push({ depot, pourquoi, ajoute: aujourdhui });
ecrire();
console.log(`${i >= 0 ? 'phrase changée' : 'ajoutée'} : ${depot} (${favs.length} favorites)\n   ${pourquoi}`);
if (!opt('--pourquoi')) console.log('   (phrase tirée de la fiche : à relire, ou à remplacer avec --pourquoi "…")');
if (!m) console.log(`ATTENTION : ${depot} n'est pas encore dans la bibliothèque. La skill ne verra pas ses captures tant qu'elle n'y est pas :\n   git clone https://github.com/Kiwi570/${depot}.git ../${depot} && node outils/ajouter.mjs ${depot}`);
console.log('Commiter favoris.json (node outils/valider.mjs && git add favoris.json && git commit -m "Favorite ..." && git push).');
