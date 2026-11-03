// Texte gravé en direct : le visiteur tape un prénom ou un court message et le voit apparaître, lettre à lettre,
// sur un objet de démonstration dessiné en canvas 2D (plaque, étiquette, carte), dans le style choisi :
// gravé (balayage laser ligne à ligne, relief en creux, étincelles), brodé (points de fil), imprimé (tampon)
// ou écrit (plume qui avance). Sur l'étiquette, le texte suit un arc. Rendu final téléchargeable en PNG.
// Le texte saisi n'est jamais injecté dans le HTML : il est nettoyé (caractères de contrôle), limité en graphèmes,
// dessiné dans le canvas et annoncé par textContent. Mode calme et « réduire les animations » : rendu final direct.
import { pret } from '../../socle/socle.js';

// Styles : police (variable CSS), graisse, échelle du corps, espacement (em), durée d'apparition d'une lettre (ms).
const STYLES = {
  grave:   { police: '--tgd-police-gravee',   graisse: 600, echelle: 1,    espacement: .03, duree: 760 },
  brode:   { police: '--tgd-police-brodee',   graisse: 800, echelle: .92,  espacement: .05, duree: 620 },
  imprime: { police: '--tgd-police-imprimee', graisse: 700, echelle: .86,  espacement: .06, duree: 420 },
  ecrit:   { police: '--tgd-police-ecrite',   graisse: 400, echelle: 1.18, espacement: 0,   duree: 520 },
};
// Supports : proportion hauteur / largeur, part de la scène occupée, courbure du tracé du texte (0 = droit).
const SUPPORTS = {
  plaque:    { ratio: .36, largeur: .84, courbure: 0 },
  etiquette: { ratio: .46, largeur: .82, courbure: 1 },
  carte:     { ratio: .62, largeur: .66, courbure: 0 },
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${(c[3] ?? 1) * a})`;
const lum = c => (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255;
const sortie = p => 1 - Math.pow(1 - p, 3);
// Pseudo-aléatoire reproductible (grain, fibres) : le rendu ne change pas d'une image à l'autre.
const graine = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

const sonde = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
/** Convertit une couleur calculée (rgb, rgba, color(srgb …) ou toute syntaxe comprise par le canvas) en [r, g, b, a]. */
function rgba(str) {
  const s = (str || '').trim();
  let m = s.match(/^rgba?\(([^)]+)\)/);
  if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p[3] ?? 1]; }
  m = s.match(/^color\(srgb\s+([^)]+)\)/);
  if (m) { const p = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat); return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] ?? 1]; }
  sonde.canvas.width = sonde.canvas.height = 1;
  sonde.clearRect(0, 0, 1, 1); sonde.fillStyle = '#808080'; sonde.fillStyle = s; sonde.fillRect(0, 0, 1, 1);
  const d = sonde.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}

const decouper = (() => {
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('fr', { granularity: 'grapheme' }) : null;
  return t => (seg ? [...seg.segment(t)].map(x => x.segment) : Array.from(t));
})();
/** Nettoie la saisie : caractères de contrôle et sauts de ligne retirés, espaces resserrés, longueur limitée en graphèmes. */
export function nettoyer(t, max = 20) {
  const propre = String(t ?? '').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069]/g, '').replace(/\s+/g, ' ');
  return decouper(propre).slice(0, max).join('');
}
const slug = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'texte';

/**
 * @param {HTMLElement} root  section.tgd contenant .tgd__scene > canvas.tgd__toile et le formulaire .tgd__form
 * @param {object} [options]
 * @param {number}  [options.max=20]               longueur maximale, en caractères visibles (graphèmes)
 * @param {string}  [options.texteVide='Votre prénom']  texte d'exemple dessiné quand le champ est vide
 * @param {string}  [options.style]                style de départ (grave, brode, imprime, ecrit) ; sinon le bouton coché
 * @param {string}  [options.support]              support de départ (plaque, etiquette, carte) ; sinon le bouton coché
 * @param {number}  [options.courbure]             force l'arc du texte (0 droit, 1 arc de l'étiquette, négatif = arc inversé)
 * @param {number}  [options.vitesse=1]            multiplie la vitesse d'apparition (2 = deux fois plus vite)
 * @param {boolean} [options.etincelles=true]      étincelles et lueur du laser en style gravé
 * @param {boolean} [options.jouerALaVue=true]     rejoue l'apparition la première fois que l'objet entre dans l'écran
 * @param {boolean} [options.telechargement=true]  bouton [data-telecharger] : PNG du rendu final
 * @param {number}  [options.largeurPng=1600]      largeur du PNG téléchargé, en px
 * @param {string}  [options.nomFichier='apercu']  début du nom du PNG (suivi du texte en minuscules sans accents)
 * @param {string}  [options.annonce='Aperçu : « {texte} », {style} sur {support}.']  phrase lue par les lecteurs d'écran
 * @returns {Promise<{ valeur():object, regler(v:object):void, rejouer():void, exporter():Promise<Blob|null>, detruire():void }>}
 */
export async function init(root, options = {}) {
  const o = { max: 20, texteVide: 'Votre prénom', vitesse: 1, etincelles: true, jouerALaVue: true, telechargement: true, largeurPng: 1600, nomFichier: 'apercu', annonce: 'Aperçu : « {texte} », {style} sur {support}.', ...options };
  const s = await pret([]);
  const scene = root.querySelector('.tgd__scene');
  const toile = root.querySelector('.tgd__toile');
  const form = root.querySelector('.tgd__form');
  const champ = root.querySelector('.tgd__entree');
  const compteur = root.querySelector('.tgd__compteur');
  const annonce = root.querySelector('.tgd__annonce');
  const boutonPng = root.querySelector('[data-telecharger]');
  const vide = { valeur: () => ({}), regler() {}, rejouer() {}, exporter: async () => null, detruire() {} };
  if (!scene || !toile || !toile.getContext) return vide;
  const ctx = toile.getContext('2d');
  if (!ctx) return vide;
  root.classList.add('tgd--pret');
  toile.setAttribute('aria-hidden', 'true');
  if (champ) champ.maxLength = o.max * 4; // le plafond réel est en graphèmes (émojis composés), appliqué par nettoyer()

  const radios = nom => [...root.querySelectorAll(`input[name="${nom}"]`)];
  const coche = nom => radios(nom).find(r => r.checked)?.value;
  const libelle = (nom, v) => {
    const r = radios(nom).find(x => x.value === v);
    if (r?.dataset.libelle) return r.dataset.libelle;
    const l = r?.closest('label')?.cloneNode(true);
    l?.querySelectorAll('[aria-hidden="true"]').forEach(x => x.remove());
    return (l?.textContent || v).trim();
  };
  let style = STYLES[o.style] ? o.style : (STYLES[coche('style')] ? coche('style') : 'grave');
  let support = SUPPORTS[o.support] ? o.support : (SUPPORTS[coche('support')] ? coche('support') : 'plaque');
  const cocher = () => { for (const r of radios('style')) r.checked = r.value === style; for (const r of radios('support')) r.checked = r.value === support; };
  cocher();
  if (boutonPng && !o.telechargement) boutonPng.hidden = true;

  // ---------- Couleurs et polices lues dans les variables CSS ----------
  const sondeCss = document.createElement('span');
  sondeCss.setAttribute('aria-hidden', 'true'); sondeCss.style.display = 'none';
  root.appendChild(sondeCss);
  let P = {}, polices = {};
  function lireIdentite() {
    const lire = n => { sondeCss.style.color = `var(${n})`; return rgba(getComputedStyle(sondeCss).color); };
    const T = lire('--couleur-texte'), F = lire('--couleur-fond');
    const clair = lum(T) > lum(F) ? T : F, sombre = clair === T ? F : T;
    P = { S: lire('--tgd-support'), I: lire('--tgd-encre'), fil: lire('--tgd-fil'), lueur: lire('--tgd-lueur'), sec: lire('--couleur-secondaire'), fond: F, clair, sombre };
    const cs = getComputedStyle(root);
    polices = Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, cs.getPropertyValue(v.police).trim() || 'serif']));
  }
  const fonte = (st, taille) => `${STYLES[st].graisse} ${taille}px ${polices[st]}`;

  // ---------- Dimensions ----------
  let W = 0, H = 0, d = 1, cssW = 0, cssH = 0;
  const cSupport = document.createElement('canvas');
  let boite = null; // zone du texte sur l'objet (px CSS)
  function mesurer() {
    const r = toile.getBoundingClientRect();
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    d = Math.min(window.devicePixelRatio || 1, s.telephone ? 1.5 : 2);
    const w = Math.round(cssW * d), h = Math.round(cssH * d);
    if (w === W && h === H) return false; // réassigner la taille viderait les toiles
    W = toile.width = cSupport.width = w; H = toile.height = cSupport.height = h;
    return true;
  }

  // ---------- Objet de démonstration ----------
  function geometrie(lw, lh) {
    const sp = SUPPORTS[support];
    let w = lw * sp.largeur, h = w * sp.ratio;
    const hMax = lh * (support === 'carte' ? .74 : .62);
    if (h > hMax) { h = hMax; w = h / sp.ratio; }
    const x = (lw - w) / 2, y = (lh - h) / 2 - lh * .02;
    let txt;
    if (support === 'plaque') txt = { x: x + w * .11, y: y + h * .2, w: w * .78, h: h * .6 };
    else if (support === 'etiquette') { const c = h * .3; txt = { x: x + c * 1.75, y: y + h * .16, w: w - c * 1.75 - w * .07, h: h * .68 }; }
    else txt = { x: x + w * .12, y: y + h * .3, w: w * .76, h: h * .4 };
    return { x, y, w, h, txt };
  }
  function contour(c, g) {
    const { x, y, w, h } = g;
    c.beginPath();
    if (support === 'etiquette') {
      const k = h * .3, r = h * .05;
      c.moveTo(x + k, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + k, y + h); c.lineTo(x, y + h - k); c.lineTo(x, y + k); c.closePath();
    } else c.roundRect(x, y, w, h, support === 'plaque' ? Math.min(h * .08, 16) : h * .05);
  }
  function dessinerSupport(c, k, lw, lh) {
    const g = geometrie(lw, lh), { x, y, w, h } = g, { S, clair, sombre } = P;
    c.save(); c.setTransform(k, 0, 0, k, 0, 0);
    // Fil de l'étiquette, sous l'objet
    if (support === 'etiquette') {
      const hx = x + h * .3 * .92, hy = y + h / 2;
      c.strokeStyle = css(mix(P.sec, sombre, .25)); c.lineWidth = Math.max(1.5, h * .022); c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx, hy); c.bezierCurveTo(hx - h * .5, hy - h * .9, x - h * .7, y - h * .1, -10, y + h * .1); c.stroke();
    }
    // Ombre portée et matière
    c.save();
    c.shadowColor = css(sombre, .5); c.shadowBlur = h * .16 * k; c.shadowOffsetY = h * .07 * k;
    contour(c, g);
    const deg = c.createLinearGradient(0, y, 0, y + h);
    deg.addColorStop(0, css(mix(S, clair, .3))); deg.addColorStop(.55, css(S)); deg.addColorStop(1, css(mix(S, sombre, .14)));
    c.fillStyle = deg; c.fill();
    c.restore();
    // Grain : lignes de fil (plaque), fibres (étiquette), points (carte)
    c.save(); contour(c, g); c.clip();
    const rnd = graine(support.length * 7919 + 17);
    if (support === 'plaque') {
      c.lineWidth = Math.max(.6, h * .006);
      for (let i = 0; i < 46; i++) {
        const yy = y + rnd() * h, a = h * (.004 + rnd() * .012);
        c.strokeStyle = css(rnd() < .5 ? sombre : clair, .035 + rnd() * .05);
        c.beginPath(); c.moveTo(x, yy);
        for (let xx = x; xx <= x + w + w / 24; xx += w / 24) c.lineTo(xx, yy + Math.sin(xx / (w * .07) + i) * a);
        c.stroke();
      }
    } else if (support === 'etiquette') {
      c.lineWidth = Math.max(.6, h * .005);
      for (let i = 0; i < 260; i++) {
        const xx = x + rnd() * w, yy = y + rnd() * h, l = h * (.02 + rnd() * .05), an = rnd() * Math.PI;
        c.strokeStyle = css(rnd() < .6 ? sombre : clair, .06 + rnd() * .06);
        c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + Math.cos(an) * l, yy + Math.sin(an) * l); c.stroke();
      }
    } else {
      for (let i = 0; i < 700; i++) { c.fillStyle = css(rnd() < .5 ? sombre : clair, .04 + rnd() * .05); c.fillRect(x + rnd() * w, y + rnd() * h, 1.2, 1.2); }
    }
    // Liseré clair en haut (biseau)
    c.strokeStyle = css(clair, .55); c.lineWidth = Math.max(1, h * .012);
    c.translate(0, h * .006); contour(c, g); c.stroke();
    c.restore();
    c.strokeStyle = css(mix(S, sombre, .35), .6); c.lineWidth = 1; contour(c, g); c.stroke();
    // Détails propres à chaque objet
    if (support === 'plaque') {
      for (const [vx, vy] of [[x + h * .14, y + h * .2], [x + w - h * .14, y + h * .2], [x + h * .14, y + h * .8], [x + w - h * .14, y + h * .8]]) {
        const r = h * .045, v = c.createRadialGradient(vx - r * .3, vy - r * .3, 0, vx, vy, r);
        v.addColorStop(0, css(mix(clair, S, .2))); v.addColorStop(1, css(mix(S, sombre, .45)));
        c.fillStyle = v; c.beginPath(); c.arc(vx, vy, r, 0, Math.PI * 2); c.fill();
        c.strokeStyle = css(sombre, .45); c.lineWidth = Math.max(1, r * .22);
        c.beginPath(); c.moveTo(vx - r * .6, vy - r * .2); c.lineTo(vx + r * .6, vy + r * .2); c.stroke();
      }
    } else if (support === 'etiquette') {
      const hx = x + h * .3 * .92, hy = y + h / 2, r = h * .075;
      c.fillStyle = css(mix(S, sombre, .3)); c.beginPath(); c.arc(hx, hy, r * 1.55, 0, Math.PI * 2); c.fill();
      c.fillStyle = css(mix(S, clair, .45)); c.beginPath(); c.arc(hx, hy, r * 1.3, 0, Math.PI * 2); c.fill();
      c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill(); c.restore();
      c.strokeStyle = css(mix(P.sec, sombre, .25)); c.lineWidth = Math.max(1.5, h * .022);
      c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + r * .4, hy - r * 1.8, hx - r * 1.2, hy - r * 2.6); c.stroke();
    } else {
      const m = h * .07;
      c.strokeStyle = css(mix(S, sombre, .4), .55); c.lineWidth = 1;
      c.beginPath(); c.roundRect(x + m, y + m, w - 2 * m, h - 2 * m, h * .02); c.stroke();
      c.beginPath(); c.roundRect(x + m * 1.35, y + m * 1.35, w - 2.7 * m, h - 2.7 * m, h * .015); c.stroke();
      c.strokeStyle = css(mix(S, sombre, .4), .45);
      c.beginPath(); c.moveTo(x + w * .38, y + h * .8); c.lineTo(x + w * .62, y + h * .8); c.stroke();
    }
    c.restore();
    return g;
  }

  // ---------- Mise en page du texte (droite ou en arc) ----------
  let glyphes = [], corps = 40, texte = '', affiche = '';
  function disposer(t, lw, lh) {
    const g = geometrie(lw, lh), b = g.txt, st = STYLES[style];
    const lettres = decouper(t);
    sonde.canvas.width = sonde.canvas.height = 1;
    sonde.font = fonte(style, 100);
    const av = lettres.map(ch => sonde.measureText(ch).width);
    const esp = st.espacement * 100;
    const total = av.reduce((a, v) => a + v, 0) + esp * Math.max(0, lettres.length - 1) || 1;
    const courb = o.courbure ?? SUPPORTS[support].courbure;
    const fleche = b.h * .2 * courb; // flèche de l'arc
    let fs = Math.min(b.h * .62 * st.echelle, 100 * b.w / total * (courb ? .94 : 1));
    if (courb) fs = Math.min(fs, (b.h - Math.abs(fleche)) * .7 * st.echelle);
    const k = fs / 100, L = total * k;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const R = fleche ? (L * L) / (8 * Math.abs(fleche)) + Math.abs(fleche) / 2 : 0;
    let curseur = -L / 2;
    const liste = lettres.map((ch, i) => {
      const w = av[i] * k, mil = curseur + w / 2; curseur += w + esp * k;
      if (!R) return { ch, w, x: cx + mil, y: cy, a: 0 };
      // Arc : flèche positive = le milieu est le point le plus haut ; négative = arc inversé.
      const th = mil / R, sg = Math.sign(fleche);
      return { ch, w, x: cx + R * Math.sin(th), y: cy - fleche / 2 + sg * R * (1 - Math.cos(th)), a: sg * th };
    });
    return { liste, fs };
  }

  // ---------- Lettres pré-rendues dans le style (une petite toile par lettre) ----------
  const cache = new Map();
  function sprite(ch, fs, k) {
    const cle = `${style}|${ch}|${fs.toFixed(2)}|${k}`;
    let sp = cache.get(cle);
    if (sp) return sp;
    sonde.font = fonte(style, fs);
    const av = sonde.measureText(ch).width;
    const w = av + fs * .9, h = fs * 1.9;
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * k)); c.height = Math.max(1, Math.ceil(h * k));
    const x = c.getContext('2d');
    x.setTransform(k, 0, 0, k, (w * k) / 2, (h * k) / 2);
    x.font = fonte(style, fs); x.textAlign = 'center'; x.textBaseline = 'middle';
    const { S, I, clair, sombre } = P;
    if (style === 'grave') {
      // Relief en creux : lèvre claire en bas, cavité sombre, fond de taille un peu plus clair (le bord haut reste dans l'ombre).
      x.fillStyle = css(mix(S, clair, .6), .9); x.fillText(ch, 0, fs * .035);
      x.fillStyle = css(mix(S, I, .82)); x.fillText(ch, 0, 0);
      x.globalCompositeOperation = 'source-atop';
      x.fillStyle = css(mix(S, I, .66)); x.fillText(ch, fs * .012, fs * .055);
    } else if (style === 'brode') {
      const base = mix(P.fil, I, .22);
      x.fillStyle = css(base); x.fillText(ch, 0, 0);
      x.globalCompositeOperation = 'source-atop';
      x.lineWidth = fs * .024;
      for (let i = 0, xx = -w; xx < w; xx += fs * .05, i++) {
        x.strokeStyle = css(i % 2 ? mix(base, clair, .35) : mix(base, sombre, .3), .6);
        x.beginPath(); x.moveTo(xx, -h / 2); x.lineTo(xx + h * .55, h / 2); x.stroke();
      }
      x.globalCompositeOperation = 'source-over';
      x.setLineDash([fs * .07, fs * .045]); x.lineWidth = Math.max(1 / k, fs * .02);
      x.strokeStyle = css(mix(base, clair, .5), .9); x.strokeText(ch, 0, 0);
      x.globalCompositeOperation = 'destination-over';
      x.shadowColor = css(sombre, .4); x.shadowBlur = fs * .05 * k; x.shadowOffsetY = fs * .03 * k;
      x.fillStyle = css(sombre, .35); x.fillText(ch, 0, fs * .02);
    } else if (style === 'imprime') {
      x.fillStyle = css(I, .92); x.fillText(ch, 0, 0);
      x.globalCompositeOperation = 'destination-out';
      const rnd = graine(ch.codePointAt(0) * 31 + 7);
      for (let i = 0, n = Math.round(w * h / 9); i < n; i++) { x.fillStyle = `rgba(0,0,0,${rnd() * .55})`; x.fillRect(-w / 2 + rnd() * w, -h / 2 + rnd() * h, 1.4 / k + rnd() / k, 1.4 / k); }
    } else {
      const encre = mix(I, P.sec, .3);
      x.fillStyle = css(encre); x.strokeStyle = css(encre); x.lineWidth = fs * .012;
      x.fillText(ch, 0, 0); x.strokeText(ch, 0, 0);
    }
    sp = { c, w, h, av };
    cache.set(cle, sp);
    return sp;
  }

  // ---------- Apparition ----------
  let particules = [], lasers = [];
  const plafond = () => (s.telephone ? 24 : 56);
  function poser(c, q, p, k) {
    if (p <= 0) return;
    const sp = sprite(q.ch, corps, k);
    c.save(); c.translate(q.x, q.y); c.rotate(q.a);
    const x0 = -sp.w / 2, y0 = -sp.h / 2;
    if (p < 1) {
      if (style === 'grave') {
        // Balayage ligne à ligne, un aller-retour par rangée, comme une machine.
        const n = 6, haut = -corps * .6, rang = (corps * 1.2) / n, f = p * n, i = Math.floor(f), r = f - i;
        const gx = -q.w / 2 - corps * .08, gw = q.w + corps * .16, sens = i % 2 === 0;
        const xl = sens ? gx + r * gw : gx + gw - r * gw;
        c.beginPath(); c.rect(x0, y0, sp.w, haut - y0 + i * rang);
        c.rect(sens ? gx : xl, haut + i * rang, sens ? xl - gx : gx + gw - xl, rang);
        c.clip();
        const ly = haut + i * rang + rang / 2;
        lasers.push([q.x + Math.cos(q.a) * xl - Math.sin(q.a) * ly, q.y + Math.sin(q.a) * xl + Math.cos(q.a) * ly]);
      } else if (style === 'brode' || style === 'ecrit') {
        const e = style === 'ecrit' ? p : sortie(p);
        c.beginPath(); c.rect(x0, y0, sp.w * (.18 + .82 * e), sp.h); c.clip();
        if (style === 'brode') c.globalAlpha = .4 + .6 * e;
      } else {
        const e = sortie(p), sc = 1 + (1 - e) * .45;
        c.globalAlpha = e; c.scale(sc, sc);
      }
    }
    c.drawImage(sp.c, x0, y0, sp.w, sp.h);
    c.restore();
    if (p < 1 && style === 'ecrit') {
      // Bec de plume qui avance avec l'écriture
      const xx = x0 + sp.w * (.18 + .82 * p), yy = Math.sin(p * 9) * corps * .18;
      c.save(); c.translate(q.x, q.y); c.rotate(q.a);
      c.fillStyle = css(mix(P.I, P.sec, .3), .85); c.beginPath(); c.arc(xx, yy, Math.max(1.5, corps * .035), 0, Math.PI * 2); c.fill();
      c.restore();
    }
  }
  function effets(c, dt) {
    if (!o.etincelles || style !== 'grave') { particules = []; lasers = []; return; }
    const L = P.lueur;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [x, y] of lasers) {
      const r = corps * .22, g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, css(mix(L, P.clair, .7))); g.addColorStop(.2, css(L, .85)); g.addColorStop(1, css(L, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      if (particules.length < plafond()) for (let i = 0; i < 2; i++) particules.push({ x, y, vx: (Math.random() - .5) * 4, vy: -(1 + Math.random() * 2.6), v: 0, max: 14 + Math.random() * 16 });
    }
    c.lineWidth = 1.3; c.lineCap = 'round';
    for (let i = particules.length - 1; i >= 0; i--) {
      const q = particules[i];
      q.v += dt; if (q.v > q.max) { particules.splice(i, 1); continue; }
      q.vy += .16 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      c.strokeStyle = css(mix(L, P.clair, .4), 1 - q.v / q.max);
      c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - q.vx * 1.6, q.y - q.vy * 1.6); c.stroke();
    }
    c.restore();
    lasers = [];
  }

  // ---------- Dessin et boucle ----------
  const duree = () => STYLES[style].duree / Math.max(.1, o.vitesse);
  let raf = 0, avant = 0, visible = false, vu = false, supportPret = false;
  function preparer() {
    lireIdentite(); cache.clear(); mesurer();
    const c = cSupport.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    dessinerSupport(c, d, cssW, cssH);
    supportPret = true;
  }
  function peindre(t, dt = 1) {
    if (!supportPret) preparer();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.drawImage(cSupport, 0, 0);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    let actif = false;
    for (const q of glyphes) { const p = clamp((t - q.debut) / (q.du || duree())); if (p < 1) actif = true; poser(ctx, q, p, d); }
    effets(ctx, dt);
    return actif || particules.length > 0;
  }
  function tour(t) {
    const dt = avant ? Math.min(48, t - avant) / 16.67 : 1; avant = t;
    const encore = peindre(t, dt);
    if (encore && visible && !document.hidden) raf = requestAnimationFrame(tour);
    else { raf = 0; avant = 0; if (encore) terminer(); }
  }
  function lancer() {
    if (s.calme || !visible) { terminer(); return; }
    if (!raf) { avant = 0; raf = requestAnimationFrame(tour); }
  }
  function terminer() {
    cancelAnimationFrame(raf); raf = 0;
    for (const q of glyphes) q.debut = -Infinity;
    particules = []; lasers = [];
    peindre(performance.now());
  }

  /** Recalcule la mise en page ; les lettres déjà posées restent, les nouvelles apparaissent (ou toutes si rejouer). */
  function composer(rejouer) {
    affiche = texte || o.texteVide;
    const { liste, fs } = disposer(affiche, cssW, cssH);
    if (Math.abs(fs - corps) > .01) cache.clear();
    corps = fs;
    const avantTxt = glyphes.map(q => q.ch);
    let commun = 0;
    if (!rejouer) while (commun < avantTxt.length && commun < liste.length && avantTxt[commun] === liste[commun].ch) commun++;
    const t0 = performance.now() + (rejouer ? 140 : 0);
    const n = liste.length - commun;
    // Gravé : un seul laser, les lettres se suivent (durée par lettre raccourcie pour tenir en 2,4 s au plus).
    // Autres styles : apparitions qui se chevauchent, 1,9 s au plus pour l'ensemble.
    const seul = style === 'grave';
    const du = seul ? Math.min(duree(), 2400 / Math.max(1, n)) : duree();
    const pas = seul ? du : rejouer ? Math.min(duree() * .55, 1900 / Math.max(1, n)) : 70;
    liste.forEach((q, i) => { q.du = du; q.debut = i < commun ? -Infinity : t0 + (i - commun) * pas; });
    glyphes = liste;
    if (s.calme || !visible) terminer(); else { peindre(performance.now()); lancer(); }
  }

  // ---------- Annonce, compteur, événement ----------
  let attenteAnnonce = 0;
  function annoncer() {
    clearTimeout(attenteAnnonce);
    attenteAnnonce = setTimeout(() => {
      if (annonce) annonce.textContent = o.annonce.replace('{texte}', affiche).replace('{style}', libelle('style', style).toLowerCase()).replace('{support}', (libelleSupport()).toLowerCase());
    }, 700);
    if (compteur) compteur.textContent = `${decouper(texte).length} / ${o.max}`;
    root.dispatchEvent(new CustomEvent('saisie:change', { bubbles: true, detail: { texte, style, support } }));
  }
  const libelleSupport = () => { const r = radios('support').find(x => x.value === support); return r?.dataset.article ? `${r.dataset.article} ${libelle('support', support)}` : libelle('support', support); };

  // ---------- Écouteurs ----------
  function surSaisie() {
    const propre = nettoyer(champ.value, o.max);
    if (propre !== champ.value.replace(/\s+/g, ' ') || decouper(champ.value).length > o.max) {
      const pos = champ.selectionStart; champ.value = propre; try { champ.setSelectionRange(Math.min(pos, propre.length), Math.min(pos, propre.length)); } catch {}
    }
    texte = propre.trim();
    composer(false); annoncer();
  }
  function surChoix(e) {
    const r = e.target;
    if (r.name === 'style' && STYLES[r.value]) style = r.value;
    else if (r.name === 'support' && SUPPORTS[r.value]) { support = r.value; supportPret = false; }
    else return;
    cache.clear();
    if (!supportPret) preparer();
    composer(true); annoncer();
  }
  function surEnvoi(e) { e.preventDefault(); composer(true); }
  async function exporter() {
    const lw = cssW, lh = cssH, k = o.largeurPng / lw;
    const c = document.createElement('canvas');
    c.width = Math.round(lw * k); c.height = Math.round(lh * k);
    const x = c.getContext('2d');
    x.fillStyle = css(mix(P.fond, P.sec, .12)); x.fillRect(0, 0, c.width, c.height);
    dessinerSupport(x, k, lw, lh);
    x.setTransform(k, 0, 0, k, 0, 0);
    for (const q of glyphes) poser(x, q, 1, k);
    for (const cle of [...cache.keys()]) if (!cle.endsWith('|' + d)) cache.delete(cle);
    return new Promise(ok => c.toBlob(b => ok(b), 'image/png'));
  }
  async function telecharger() {
    const b = await exporter();
    if (!b) return;
    const url = URL.createObjectURL(b), a = document.createElement('a');
    a.href = url; a.download = `${o.nomFichier}-${slug(affiche)}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  champ?.addEventListener('input', surSaisie);
  form?.addEventListener('change', surChoix);
  form?.addEventListener('submit', surEnvoi);
  boutonPng?.addEventListener('click', telecharger);

  let attenteTaille = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(attenteTaille);
    attenteTaille = requestAnimationFrame(() => { if (mesurer()) { preparer(); composer(false); terminer(); } });
  });
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !vu && e.intersectionRatio >= .35) { vu = true; if (o.jouerALaVue && !s.calme) composer(true); }
    else if (!visible && raf) terminer();
  }, { threshold: [0, .35] });
  const surVisibilite = () => { if (document.hidden && raf) terminer(); };
  document.addEventListener('visibilitychange', surVisibilite);

  // ---------- Démarrage : polices chargées avant de dessiner (sinon la police de secours est gravée) ----------
  lireIdentite();
  if (document.fonts) await Promise.all(Object.keys(STYLES).map(k => document.fonts.load(fonte(k, 48), 'Aa').catch(() => {})));
  if (champ) texte = nettoyer(champ.value, o.max).trim();
  preparer(); composer(false); terminer(); annoncer();
  ro.observe(scene); io.observe(scene);
  document.fonts?.ready.then(() => { cache.clear(); if (!raf) { composer(false); terminer(); } });

  return {
    valeur: () => ({ texte, style, support }),
    regler(v = {}) {
      if (v.texte !== undefined && champ) { champ.value = nettoyer(v.texte, o.max); texte = champ.value.trim(); }
      if (STYLES[v.style]) style = v.style;
      if (SUPPORTS[v.support]) { support = v.support; supportPret = false; }
      cocher(); cache.clear(); preparer(); composer(true); annoncer();
    },
    rejouer: () => composer(true),
    exporter,
    detruire() {
      cancelAnimationFrame(raf); cancelAnimationFrame(attenteTaille); clearTimeout(attenteAnnonce);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', surVisibilite);
      champ?.removeEventListener('input', surSaisie);
      form?.removeEventListener('change', surChoix);
      form?.removeEventListener('submit', surEnvoi);
      boutonPng?.removeEventListener('click', telecharger);
      sondeCss.remove(); cache.clear(); root.classList.remove('tgd--pret');
    },
  };
}
