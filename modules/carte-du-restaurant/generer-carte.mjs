// Écrit la carte en HTML depuis son JSON, pour qu'elle soit dans la page publiée (lisible sans JavaScript, indexée).
//   node generer-carte.mjs carte.json                    → le HTML sur la sortie
//   node generer-carte.mjs carte.json --dans index.html  → remplace ce qui est entre <!-- carte:debut --> et <!-- carte:fin -->
// À relancer à chaque changement de carte (ou laisser data-source réécrire la carte dans le navigateur).
import fs from 'node:fs';
import { rendreCarte } from './carte-rendu.js';

const [source, ...reste] = process.argv.slice(2);
if (!source) { console.error('usage : node generer-carte.mjs carte.json [--dans page.html]'); process.exit(1); }
const html = rendreCarte(JSON.parse(fs.readFileSync(source, 'utf8')));
const i = reste.indexOf('--dans');
if (i < 0) { process.stdout.write(html + '\n'); process.exit(0); }
const page = reste[i + 1], texte = fs.readFileSync(page, 'utf8');
const a = texte.indexOf('<!-- carte:debut -->'), b = texte.indexOf('<!-- carte:fin -->');
if (a < 0 || b < a) { console.error(`${page} : marqueurs <!-- carte:debut --> et <!-- carte:fin --> introuvables`); process.exit(1); }
fs.writeFileSync(page, texte.slice(0, a + '<!-- carte:debut -->'.length) + '\n' + html + '\n' + texte.slice(b));
console.log(`${page} : carte écrite (${html.length} caractères)`);
