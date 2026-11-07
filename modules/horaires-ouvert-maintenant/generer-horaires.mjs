// Écrit les horaires dans la page depuis leur JSON : le JSON lui-même (lu par module.js pour le statut et le cadran)
// et la semaine type de chaque adresse en texte (lisible sans JavaScript).
//   node generer-horaires.mjs horaires.json                    → le HTML sur la sortie
//   node generer-horaires.mjs horaires.json --dans index.html  → remplace ce qui est entre <!-- horaires:debut --> et <!-- horaires:fin -->
import fs from 'node:fs';
import { preparer, rendreBloc } from './horaires-calcul.js';

const [source, ...reste] = process.argv.slice(2);
if (!source) { console.error('usage : node generer-horaires.mjs horaires.json [--dans page.html]'); process.exit(1); }
const brut = JSON.parse(fs.readFileSync(source, 'utf8'));
const d = preparer(brut);
const echap = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Choix d'adresse en liens (sans JavaScript, ils mènent au bloc de l'adresse ; module.js en fait des boutons de même taille),
// ligne de statut neutre (remplacée par le statut), cadran masqué sans JavaScript, JSON (« </ » échappé), blocs d'adresse.
const plusieurs = d.adresses.length > 1;
const html = (plusieurs ? `<div class="horaires__adresses" data-horaires-choix role="group" aria-label="Choisir une adresse">${d.adresses.map((a) => `<a class="horaires__choix" href="#horaires-${echap(a.id)}"><span class="horaires__pastille" aria-hidden="true"></span><span>${echap(a.nom || a.id)}</span></a>`).join('')}</div>\n` : '')
  + `<p class="horaires__statut" data-horaires-statut><span class="horaires__pastille" aria-hidden="true"></span><span>Horaires de la semaine</span></p>\n`
  + `<noscript><style>.horaires__cadran{display:none!important}.horaires__grille{grid-template-columns:minmax(0,1fr)!important}</style></noscript>\n`
  + `<script type="application/json" data-horaires>${JSON.stringify(brut).replace(/<\//g, '<\\/')}</script>\n`
  + `<div class="horaires__texte-adresse" data-horaires-texte>${d.adresses.map((a) => rendreBloc(a, plusieurs)).join('')}</div>`;
const i = reste.indexOf('--dans');
if (i < 0) { process.stdout.write(html + '\n'); process.exit(0); }
const page = reste[i + 1], texte = fs.readFileSync(page, 'utf8');
const a = texte.indexOf('<!-- horaires:debut -->'), b = texte.indexOf('<!-- horaires:fin -->');
if (a < 0 || b < a) { console.error(`${page} : marqueurs <!-- horaires:debut --> et <!-- horaires:fin --> introuvables`); process.exit(1); }
fs.writeFileSync(page, texte.slice(0, a + '<!-- horaires:debut -->'.length) + '\n' + html + '\n' + texte.slice(b));
console.log(`${page} : horaires écrits (${d.adresses.length} adresse${d.adresses.length > 1 ? 's' : ''})`);
