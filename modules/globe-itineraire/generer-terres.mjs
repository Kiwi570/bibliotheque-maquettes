// Génère terres.js : les terres émergées en grille de points (une rangée tous les PAS degrés de latitude,
// des points espacés d'environ PAS degrés sur chaque rangée), à partir de Natural Earth 1:110m (domaine public)
// redistribué en TopoJSON par le paquet npm world-atlas@2 (land-110m.json, licence ISC).
// node modules/globe-itineraire/generer-terres.mjs chemin/vers/land-110m.json [pas=1.5]
import fs from 'node:fs';
const [src, pasArg] = process.argv.slice(2);
const PAS = +pasArg || 1.5;
const topo = JSON.parse(fs.readFileSync(src, 'utf8'));
const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]); });
const arc = i => i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
const anneaux = [];
for (const g of topo.objects.land.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  for (const p of polys) for (const r of p) anneaux.push(r.flatMap((i, k) => arc(i).slice(k ? 1 : 0)));
}
const dedans = (lon, lat) => { // pair-impair sur tous les anneaux (les trous comptent d'eux-mêmes)
  let c = false;
  for (const r of anneaux) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
// Format : une chaîne par rangée « n:début,longueur;début,longueur » (indices de colonne sur n colonnes de -180° à 180°).
const rangees = []; let total = 0;
for (let lat = -90 + PAS / 2; lat < 90; lat += PAS) {
  const n = Math.max(1, Math.round(360 / PAS * Math.cos(lat * Math.PI / 180)));
  const runs = []; let debut = -1;
  for (let c = 0; c <= n; c++) {
    const on = c < n && dedans(-180 + (c + .5) * 360 / n, lat);
    if (on && debut < 0) debut = c;
    if (!on && debut >= 0) { runs.push(debut + ',' + (c - debut)); total += c - debut; debut = -1; }
  }
  rangees.push(n + ':' + runs.join(';'));
}
const out = `// Terres émergées en grille de points (pas ${PAS}°, ${total} points), généré par generer-terres.mjs.
// Source : Natural Earth 1:110m (domaine public), via world-atlas@2 land-110m.json (ISC, Mike Bostock).
export const PAS = ${PAS};
export const RANGEES = ${JSON.stringify(rangees.join('|'))};
`;
fs.writeFileSync(new URL('./terres.js', import.meta.url), out);
console.log(total, 'points', Math.round(out.length / 1024), 'Ko');
