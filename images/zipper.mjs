// Met un dossier d'images en zips de 20 Mo au plus, prêts à envoyer dans la conversation.
// node images/zipper.mjs <dossier> [--client nom] [--max 20] [--sortie ~/Downloads] [--sans-finder]
//
// Un seul zip s'il tient (<client>-images.zip), sinon <client>-images-1.zip, -2.zip… Les fichiers de suivi
// (recuperation.json, analyse*.json, planche*.jpg) vont dans le premier zip, les images ensuite, les plus
// grosses d'abord, réparties pour que chaque zip reste sous la limite. Chaque zip se décompresse dans
// <dossier>/, comme `zip -qr` du dossier entier. Les anciens zips du même client sont effacés avant.
// Pourquoi : un zip unique en pleine définition dépassait la limite d'envoi (agence-ae : « Trop volumineux »,
// 24 zips à refaire à la main).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SUIVI = /^(recuperation\.json|analyse[\w-]*\.json|planche[\w-]*\.jpg|verification\.json)$/i;

function lister(dossier, base = dossier) {
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return [];
    const p = path.join(dossier, e.name);
    return e.isDirectory() ? lister(p, base) : [path.relative(base, p)];
  });
}

export function zipper(dossier, { client, sortie = path.join(os.homedir(), 'Downloads'), max = 20, fichiers } = {}) {
  dossier = path.resolve(dossier);
  const nomDossier = path.basename(dossier), parent = path.dirname(dossier);
  const nom = client || nomDossier.replace(/-recu\d*$/, '');
  const limite = max * 1024 * 1024 * 0.96;   // marge pour l'en-tête du zip
  const liste = (fichiers || lister(dossier)).filter((f) => fs.existsSync(path.join(dossier, f)))
    .map((f) => ({ f, taille: fs.statSync(path.join(dossier, f)).size }));
  const suivi = liste.filter((x) => SUIVI.test(path.basename(x.f)));
  const images = liste.filter((x) => !suivi.includes(x)).sort((a, b) => b.taille - a.taille);
  // Rangement : premier zip qui a encore la place (les plus grosses d'abord).
  const lots = [{ fichiers: [...suivi], taille: suivi.reduce((s, x) => s + x.taille, 0) }];
  for (const x of images) {
    if (x.taille > limite) console.log(`A REGARDER : ${x.f} pèse ${Math.round(x.taille / 1048576)} Mo à lui seul : il part dans son propre zip, qui dépasse ${max} Mo.`);
    const lot = lots.find((l) => l.taille + x.taille <= limite) || (lots.push({ fichiers: [], taille: 0 }), lots[lots.length - 1]);
    lot.fichiers.push(x); lot.taille += x.taille;
  }
  const pleins = lots.filter((l) => l.fichiers.length);
  fs.mkdirSync(sortie, { recursive: true });
  for (const f of fs.readdirSync(sortie)) if (new RegExp(`^${nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-images(-\\d+)?\\.zip$`).test(f)) fs.rmSync(path.join(sortie, f));
  const zips = pleins.map((l, i) => {
    const zip = path.join(sortie, pleins.length === 1 ? `${nom}-images.zip` : `${nom}-images-${i + 1}.zip`);
    execFileSync('zip', ['-q', zip, ...l.fichiers.map((x) => path.join(nomDossier, x.f))], { cwd: parent });
    console.log(`Zip : ${zip} (${Math.round(fs.statSync(zip).size / 1048576 * 10) / 10} Mo, ${l.fichiers.length} fichiers)`);
    return zip;
  });
  console.log(zips.length === 1 ? 'C\'est ce zip qu\'il faut envoyer dans la conversation.' : `Envoyer les ${zips.length} zips dans la conversation (ensemble, ou l'un après l'autre).`);
  return zips;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pos = [], opts = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) { const k = a[i].slice(2); opts[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } else pos.push(a[i]);
  }
  if (!pos[0]) { console.error('usage : node images/zipper.mjs <dossier> [--client nom] [--max 20] [--sortie ~/Downloads] [--sans-finder]'); process.exit(1); }
  const zips = zipper(pos[0], { client: typeof opts.client === 'string' ? opts.client : undefined, sortie: typeof opts.sortie === 'string' ? path.resolve(opts.sortie.replace(/^~/, os.homedir())) : undefined, max: +opts.max || 20 });
  if (!opts['sans-finder'] && process.platform === 'darwin' && zips.length) execFileSync('open', ['-R', zips[0]]);
}
