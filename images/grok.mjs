// Document Grok : une consigne anglaise complète par image à générer, d'après les gabarits qui ont marché.
// node images/grok.mjs plan-images.json --activite restauration --direction direction.json --sortie [client]-images-grok.docx [--client "Nom"] [--tout]
//
// - Images concernées : entrées du plan dont la source (ou source_mobile) est dans un dossier grok/ et n'existe pas encore
//   (--tout : toutes, même déjà reçues).
// - Gabarit : images/gabarits-grok/<activite>.json, rôle choisi par le champ gabarit de l'entrée, sinon d'après son rôle
//   (ouverture, section-fond, 404, portrait → portrait-generique, autres → scene-metier). Le champ scene (anglais) remplit {sujet} ;
//   si le gabarit n'a pas de {sujet}, la scène remplace la sienne ; consigne_scene (anglais) remplace toujours la scène du gabarit. Jamais de produit, plat ou œuvre du client dans une scène.
// - direction.json : { "nom", "ambiance", "palette", "lumiere", "matieres", "saison", "lieu", "sujet" (sujet par défaut) }.
// - Assemblage : consigne du rôle + format (emplacements.json : ratio, et 1168×784 ou 784×1168 à demander à Grok) + zone de texte
//   + style de l'activité + interdits de l'activité + pièges repérés dans la scène (mains, écrans, mécanismes…) + interdits communs.
// - Écrit le .docx (mode d'emploi, récapitulatif, une fiche par image, groupées par page) et grok-consignes.json à côté du plan,
//   que verifier-grok.mjs relit pour corriger une consigne.
import fs from 'node:fs';
import path from 'node:path';
import { ICI, args, lireJson, ecrireJson } from './commun.mjs';
import { ecrireDocx } from './docx.mjs';

const { pos, opts } = args();
if (!pos[0] || typeof opts.activite !== 'string') {
  console.error('usage : node images/grok.mjs plan-images.json --activite <activité> --direction direction.json --sortie client-images-grok.docx');
  process.exit(1);
}
const fPlan = path.resolve(pos[0]);
const plan = lireJson(fPlan);
if (!Array.isArray(plan)) { console.error(`plan illisible : ${fPlan}`); process.exit(1); }
const sansAccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fGabarit = path.join(ICI, 'gabarits-grok', `${sansAccent(opts.activite)}.json`);
if (!fs.existsSync(fGabarit)) {
  console.error(`activité inconnue : ${opts.activite}. Choix : ${fs.readdirSync(path.join(ICI, 'gabarits-grok')).filter(f => f.endsWith('.json') && f !== 'commun.json').map(f => f.replace('.json', '')).join(', ')}`);
  process.exit(1);
}
const G = lireJson(fGabarit), C = lireJson(path.join(ICI, 'gabarits-grok', 'commun.json')), EMPL = lireJson(path.join(ICI, 'emplacements.json'), {});
const direction = typeof opts.direction === 'string' ? lireJson(path.resolve(opts.direction), null) : {};
if (direction === null) { console.error(`direction illisible : ${opts.direction}`); process.exit(1); }
const client = typeof opts.client === 'string' ? opts.client : direction.client || path.basename(path.dirname(fPlan));
const sortie = path.resolve(typeof opts.sortie === 'string' ? opts.sortie : `${client.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-images-grok.docx`);

const dansGrok = s => s && /(^|\/)grok\//.test(s);
const existe = s => fs.existsSync(path.resolve(path.dirname(fPlan), s)) || fs.existsSync(path.resolve(path.dirname(fPlan), s).replace(/\.[^.]+$/, '') + '.webp');
const ROLE_GABARIT = { ouverture: 'ouverture', 'section-fond': 'section-fond', '404': '404', portrait: 'portrait-generique' };
const PRIORITE = { ouverture: 'Indispensable', 'section-fond': 'Indispensable', '404': 'Conseillée' };
// Pièges repérés dans la scène : la parade de commun.json est ajoutée à la consigne.
const PIEGES = [[/\bhands?\b(?!-)|\bfingers?\b|\bholding\b|\bkneading\b|\bshaping\b/i, 'mains en trop'], [/\bscreens?\b|laptop|phone|tablet|monitor/i, 'écrans'],
  [/scaffold/i, 'échafaudages et chantiers'], [/\b(car|van|truck|bus|vehicle|bike|bicycle|motorbike)s?\b/i, 'véhicules'],
  [/brake|chain\b|gears?\b|engine|mechanism|valve|gauge|binding|derailleur|hinge|clockwork/i, 'mécanismes'], [/\b(book|page|notebook|sign|label|letter|poster|map|menu)s?\b/i, 'texte parasite'],
  [/\b(child|children|kid|kids)\b/i, 'enfants'], [/\bpeople|person|woman|man|surfer|rider|crowd|group\b/i, 'visages']];
const parade = sujet => C.pieges.find(p => p.sujet === sujet)?.parade;

const manque = new Set();
const remplir = t => t.replace(/\{(\w+)\}/g, (m, k) => {
  const v = k === 'sujet' ? remplir.sujet : direction[k];
  if (!v) { manque.add(k); return m; }
  return v;
});
const phrase = s => { s = String(s || '').trim(); if (!s) return ''; s = s[0].toUpperCase() + s.slice(1); return /[.!?]$/.test(s) ? s : `${s}.`; };

function consigne(e, cible, mobile) {
  const role = e.role || 'galerie';
  const gab = e.gabarit || ROLE_GABARIT[role] || 'scene-metier';
  const r = G.roles[gab];
  if (!r) throw new Error(`rôle de gabarit inconnu : ${gab}`);
  remplir.sujet = e.scene || direction.sujet || '';
  if (r.consigne.includes('{sujet}') && !remplir.sujet && !e.consigne_scene) throw new Error(`${e.nom} : champ scene (anglais) manquant pour le gabarit ${gab}`);
  const ratio = mobile ? (typeof e.mobile === 'string' ? e.mobile : EMPL[role]?.mobile || '9:16') : (e.ratio || EMPL[role]?.ratio || '3:2');
  const [a, b] = ratio.split(':').map(Number);
  const grok = a >= b ? '1168×784' : '784×1168';
  const recadre = Math.abs(a / b - (a >= b ? 1.5 : 1 / 1.5)) > 0.05;
  const zone = mobile ? 'telephone' : (e.zone_texte === true ? 'haut' : e.zone_texte) || (['ouverture', 'section-fond', '404'].includes(role) ? 'haut' : null);
  const format = [C.formats[ratio] || `aspect ratio ${ratio}`, recadre ? 'main subject well inside the central area with generous margins on every side, so the image can be cropped' : '', zone ? C.zone_texte[zone] : ''].filter(Boolean).join(', ');
  // On cherche les pièges dans ce que l'image montre, pas dans ce qu'elle exclut (« no cars, no hands »).
  const scene = `${e.scene || ''}, ${e.consigne_scene || remplir(r.consigne)}`.replace(/\b(no|without|nothing|never|not)\b[^,.;]*/gi, '');
  const paysage = gab === 'lieu' || gab === 'ouverture' ? /landscape|beach|coast|shore|dune|mountain|forest|valley|countryside|field|lake|river|sea\b/i.test(scene) : false;
  const pieges = [...new Set([...PIEGES.filter(([re]) => re.test(scene)).map(([, p]) => p), ...(paysage ? ['paysage qui dérive'] : []), ...(e.pieges || [])])];
  // Une scène fournie quand le gabarit n'a pas de {sujet} remplace la scène du gabarit (le reste de la consigne est gardé).
  let base = e.consigne_scene || (r.consigne.includes('{sujet}') || !e.scene ? remplir(r.consigne) : e.scene);
  base = base.replace(/\b(\w+)\s+\1\b/gi, '$1');                  // « hands hands » quand la scène reprend le mot du gabarit
  const texte = [base, format, remplir(G.style), G.interdits, ...pieges.map(p => remplir(parade(p) || '')), C.interdits_toujours].map(phrase).filter(Boolean).join(' ');
  return { gabarit: gab, ratio, grok, consigne: texte.replace(/\s+/g, ' '), pieges };
}

const images = [];
for (const e of plan) {
  for (const [src, mobile] of [[e.source, false], [e.source_mobile, true]]) {
    if (!dansGrok(src) || (!opts.tout && existe(src))) continue;
    if (mobile && !e.mobile) continue;
    const c = consigne(e, null, mobile);
    images.push({ nom: e.nom, fichier: path.basename(src), page: e.page || 'Accueil', emplacement: `${e.emplacement || e.role}${mobile ? ' (téléphone)' : e.source_mobile ? ' (ordinateur)' : ''}`,
      role: e.role, format: c.ratio, grok: c.grok, priorite: e.priorite || PRIORITE[e.role] || 'Conseillée', gabarit: c.gabarit, pieges: c.pieges, consigne: c.consigne });
  }
}
if (manque.size) { console.error(`variables manquantes dans ${opts.direction || 'direction.json'} : ${[...manque].join(', ')}`); process.exit(1); }
if (!images.length) { console.log('Aucune image Grok à demander : toutes les sources grok/ du plan existent déjà (--tout pour tout refaire).'); process.exit(0); }

// Document : même structure que les documents Grok de la skill.
const ordre = { Indispensable: 0, 'Conseillée': 1, Facultative: 2 };
const compte = p => images.filter(i => i.priorite === p).length;
const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const zipNom = `${client.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-grok.zip`;
const blocs = [
  { t: 'titre', texte: `${client} — images à créer avec Grok` },
  { t: 'sous-titre', texte: `Maquette v1${direction.nom ? ` · direction « ${direction.nom} »` : ''} · ${images.length} images · ${date}` },
  { t: 'h1', texte: 'Mode d\'emploi' },
  { t: 'puce', texte: 'Copiez la consigne entière (le bloc beige) dans Grok et choisissez le format indiqué : Grok rend du **1168×784** (paysage) ou du **784×1168** (portrait) ; le recadrage au format final est fait ensuite.' },
  { t: 'puce', texte: 'Lancez une nouvelle génération pour chaque image (ne repartez pas d\'un résultat précédent), faites deux ou trois versions et gardez la meilleure : aucun visage reconnaissable, aucun texte, aucun logo.' },
  { t: 'puce', texte: 'Regardez en taille réelle les mains, les outils et les mécanismes avant de garder une image.' },
  { t: 'puce', texte: 'Nommez chaque image exactement comme indiqué (l\'extension .jpg, .png ou .webp n\'a pas d\'importance).' },
  { t: 'puce', texte: `Mettez-les toutes dans un seul zip, **${zipNom}**, et envoyez-le dans la conversation.` },
  { t: 'h1', texte: 'Priorités' },
  { t: 'puce', texte: `**Indispensable (${compte('Indispensable')})** : nécessaire pour la v1.` },
  { t: 'puce', texte: `**Conseillée (${compte('Conseillée')})** : améliore nettement la maquette ; certaines deviendront inutiles si une photo du site convient mieux.` },
  { t: 'puce', texte: `**Facultative (${compte('Facultative')})** : à faire si vous avez le temps ; sinon un visuel dessiné en code la remplace.` },
  { t: 'p', texte: `Chaque image générée portera sur le site la mention « Illustration générée ». Aucune ne sera présentée comme une vraie photo ${G.activite === 'restauration' ? 'd\'un plat ou d\'une salle' : 'd\'un lieu, d\'un produit ou d\'une personne'} ${/^[aeiouyàâéèêîôûh]/i.test(client) ? 'd\'' : 'de '}${client}.` },
  { t: 'h1', texte: 'Style commun (déjà inclus dans chaque consigne)' },
  { t: 'encadre', texte: [remplir(G.style), G.interdits, C.interdits_toujours].map(phrase).join(' ') },
  { t: 'h1', texte: 'Récapitulatif' },
  { t: 'tableau', lignes: [['N°', 'Fichier', 'Page · emplacement', 'Format', 'Grok', 'Priorité'], ...images.map((i, k) => [String(k + 1), i.fichier, `${i.page} · ${i.emplacement}`, i.format, i.grok, i.priorite])] },
];
let n = 0;
for (const page of [...new Set(images.map(i => i.page))]) {
  blocs.push({ t: 'h1', texte: page });
  for (const i of images.filter(x => x.page === page)) {
    n = images.indexOf(i) + 1;
    blocs.push({ t: 'h2', texte: `${n}. ${i.fichier}` },
      { t: 'p', texte: `Page et emplacement : ${i.page}, ${i.emplacement}` },
      { t: 'p', texte: `Format : ${i.format} (demander ${i.grok} à Grok)     Priorité : ${i.priorite}` },
      { t: 'encadre', texte: i.consigne });
  }
}
ecrireDocx(sortie, `${client} — images Grok`, blocs);
ecrireJson(path.join(path.dirname(fPlan), 'grok-consignes.json'), { client, activite: G.activite, direction: direction.nom || null, date: new Date().toISOString(), images });
for (const i of images) console.log(`${i.priorite.padEnd(13)} ${i.fichier.padEnd(34)} ${i.format.padEnd(5)} ${i.grok}  ${i.gabarit}${i.pieges.length ? ` (pièges : ${i.pieges.join(', ')})` : ''}`);
console.log(`\n${images.length} consignes (${compte('Indispensable')} indispensables). Document : ${sortie}`);
console.log(`Consignes pour verifier-grok : ${path.join(path.dirname(fPlan), 'grok-consignes.json')}`);
