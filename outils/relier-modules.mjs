// Relie chaque section d'origine (module.json « origine ») à son module dans notes-manuelles/<dépôt>.json.
// Le premier module relié devient « module » (principal) ; les suivants s'ajoutent à « modules ».
// node outils/relier-modules.mjs   (puis fiches.mjs sur les dépôts listés)
import fs from 'node:fs';
import path from 'node:path';
import { RACINE, lireJson } from './commun.mjs';

const touches = new Set();
for (const m of fs.readdirSync(path.join(RACINE, 'modules')).sort()) {
  const f = path.join(RACINE, 'modules', m, 'module.json'); if (!fs.existsSync(f)) continue;
  for (const o of [].concat(lireJson(f).origine || [])) {
    const [depot, id] = o.split('/'); const p = path.join(RACINE, 'notes-manuelles', depot + '.json');
    if (!id || /\.(js|mjs|css|html)\b/.test(id) || !fs.existsSync(p)) { console.log(`  ignoré : ${o} (pas une section)`); continue; }
    const notes = lireJson(p); const s = notes.sections[id];
    if (!s) { console.log(`  section absente : ${o}`); continue; }
    if (s.module === m || (s.modules || []).includes(m)) continue;
    if (!s.module) s.module = m; else s.modules = [...new Set([...(s.modules || []), m])];
    // Réécriture ciblée pour garder la mise en forme : section sur une ligne, ou sur plusieurs lignes (on ne touche qu'au champ module).
    let txt = fs.readFileSync(p, 'utf8');
    const cle = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const uneLigne = new RegExp(`^(\\s*)"${cle}"\\s*:\\s*\\{.*\\},?$`, 'm');
    const champs = `"module": ${JSON.stringify(s.module)}${s.modules ? `, "modules": ${JSON.stringify(s.modules)}` : ''}`;
    if (uneLigne.test(txt)) txt = txt.replace(uneLigne, (l, ind) => `${ind}"${id}": ${JSON.stringify(s)}${l.trimEnd().endsWith(',') ? ',' : ''}`);
    else {
      const debut = txt.search(new RegExp(`^\\s*"${cle}"\\s*:\\s*\\{\\s*$`, 'm'));
      if (debut < 0) { console.log(`  forme inconnue : ${o}`); continue; }
      const re = /"module"\s*:\s*(null|"[^"]*")(\s*,\s*"modules"\s*:\s*\[[^\]]*\])?/y;
      const i = txt.indexOf('"module"', debut); re.lastIndex = i;
      if (i < 0 || !re.test(txt)) { console.log(`  champ module introuvable : ${o}`); continue; }
      txt = txt.slice(0, i) + champs + txt.slice(re.lastIndex);
    }
    fs.writeFileSync(p, txt); JSON.parse(txt); touches.add(depot);
    console.log(`relié ${o} → ${m}${s.module === m ? '' : ' (secondaire)'}`);
  }
}
console.log('dépôts à régénérer : ' + [...touches].join(' '));
