// Rature au stylo : dans un titre ou une liste, un mot (<del>) est barré d'un trait de stylo irrégulier qui se dessine
// (SVG, stroke-dashoffset), puis le mot qui le remplace (<ins>) s'écrit à côté, au-dessus ou dessous, et se souligne.
// Les traits sont calculés en pixels sur les lignes réelles du texte (Range.getClientRects) : ils suivent les retours
// à la ligne et se recalculent au redimensionnement. Sans JavaScript : barré CSS et mot final visibles.
import { pret } from '../../socle/socle.js';

const NS = 'http://www.w3.org/2000/svg';
const VARIANTES = 4; // 0 trait ondulé, 1 aller-retour, 2 diagonale, 3 gribouillis

/**
 * @param {HTMLElement} root  bloc contenant un ou plusieurs groupes .rst (titre, paragraphe ou liste .rst-liste)
 * @param {object} [options]
 * @param {'apparition'|'defilement'} [options.declencheur='apparition']  joue une fois à l'arrivée, ou suit la molette
 *        (un groupe peut le changer avec data-declencheur ; sur téléphone, toujours « apparition »)
 * @param {string} [options.depart='top 85%']  seuil d'apparition (ScrollTrigger)
 * @param {string} [options.debut='top 78%']   début du tracé en mode défilement
 * @param {string} [options.fin='top 40%']     fin du tracé en mode défilement
 * @param {number} [options.delai=0]           attente avant de jouer (s), utile dans une ouverture
 * @param {number} [options.duree=1]           multiplicateur des durées (1 ≈ 1,4 s pour un mot)
 * @param {boolean} [options.souligner=true]   souligne le nouveau mot dans les titres (pas dans les listes)
 * @param {number|null} [options.variante=null] forme du trait 0 à 3 ; null : alternée (ou data-trait sur le <del>)
 * @param {number} [options.epaisseur=.075]    épaisseur du trait en fraction de la taille du texte barré
 */
export async function init(root, options = {}) {
  const o = { declencheur: 'apparition', depart: 'top 85%', debut: 'top 78%', fin: 'top 40%', delai: 0, duree: 1, souligner: true, variante: null, epaisseur: .075, ...options };
  const html = document.documentElement;
  const calmeTot = matchMedia('(prefers-reduced-motion: reduce)').matches || html.classList.contains('calme');
  root.classList.add('rst-bloc');
  // Armé tout de suite (avant le chargement de GSAP) pour éviter de voir l'état final puis l'animation.
  if (!calmeTot) root.classList.add('est-arme');

  const groupes = root.matches('.rst') ? [root] : [...root.querySelectorAll('.rst')];
  const etats = groupes.map((g, gi) => {
    // Lecture : seule la version finale est lue, sauf data-lecture="les-deux" (liste jargon → mot simple).
    if (g.dataset.lecture !== 'les-deux') for (const d of g.querySelectorAll('del')) d.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rst__traits'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    root.appendChild(svg);
    const dels = [...g.querySelectorAll('del')].map((el, i) => ({ el, p: 0, chemins: [], v: Number(el.dataset.trait ?? o.variante ?? (gi + i) % VARIANTES) % VARIANTES, graine: gi * 31 + i * 7 + 3 }));
    const ins = g.querySelector('ins');
    const liste = !!g.closest('.rst-liste');
    if (ins && !liste) coller(g, ins);
    const souligne = ins && o.souligner && !liste && g.dataset.souligne !== 'non' ? { el: ins, p: 0, chemins: [], graine: gi * 13 + 5 } : null;
    return { g, svg, dels, ins, souligne };
  });

  const dessiner = () => {
    const b = root.getBoundingClientRect();
    const ox = b.left + root.clientLeft, oy = b.top + root.clientTop;
    for (const e of etats) {
      e.svg.replaceChildren();
      for (const d of e.dels) {
        const taille = parseFloat(getComputedStyle(d.el).fontSize) || 16;
        const rnd = alea(d.graine);
        d.chemins = lignes(d.el).map(r => chemin(e.svg, trait({ x: r.left - ox, y: r.top - oy, w: r.width, h: r.height }, d.v, rnd), Math.max(2.2, taille * o.epaisseur)));
        appliquer(d);
      }
      if (e.souligne) {
        const s = e.souligne, el = s.el, r = el.getBoundingClientRect();
        const taille = parseFloat(getComputedStyle(el).fontSize) || 16;
        const angle = (parseFloat(getComputedStyle(el).rotate) || 0) * Math.PI / 180;
        s.chemins = [chemin(e.svg, soulignement(r.left - ox + r.width / 2, r.top - oy + r.height / 2, el.offsetWidth, el.offsetHeight, angle, alea(s.graine)), Math.max(2, taille * o.epaisseur * .8))];
        appliquer(s);
      }
    }
  };
  let attente = 0;
  const redessiner = () => { cancelAnimationFrame(attente); attente = requestAnimationFrame(dessiner); };
  const ro = new ResizeObserver(redessiner);
  ro.observe(root);
  document.fonts?.ready.then(redessiner);
  root.classList.add('a-traits');

  const tues = [];
  const detruire = () => {
    ro.disconnect(); cancelAnimationFrame(attente);
    tues.forEach(t => t.kill());
    for (const e of etats) { e.svg.remove(); e.dels.forEach(d => d.el.classList.remove('est-barre')); if (e.ins) e.ins.style.clipPath = ''; }
    root.classList.remove('est-arme', 'a-traits');
  };
  const finir = () => {
    root.classList.remove('est-arme');
    for (const e of etats) { e.dels.forEach(d => { d.p = 1; }); if (e.souligne) e.souligne.p = 1; }
    dessiner();
  };

  if (calmeTot) { finir(); return { detruire }; }
  dessiner();
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  if (s.calme) { finir(); return { detruire }; }

  const k = o.duree;
  for (const e of etats) {
    const tl = gsap.timeline({ paused: true });
    e.dels.forEach((d, i) => tl.to(d, { p: 1, duration: .4 * k, ease: 'power2.in', onUpdate: () => appliquer(d) }, i * .32 * k));
    const t0 = e.dels.length ? (e.dels.length - 1) * .32 * k + .46 * k : 0;
    if (e.ins) tl.to(e.ins, { clipPath: 'inset(-30% -12% -45% -12%)', duration: .65 * k, ease: 'power2.inOut' }, t0);
    if (e.souligne) tl.to(e.souligne, { p: 1, duration: .45 * k, ease: 'power2.out', onUpdate: () => appliquer(e.souligne) }, t0 + .45 * k);
    tues.push(tl);
    const mode = e.g.dataset.declencheur || e.g.closest('[data-declencheur]')?.dataset.declencheur || o.declencheur;
    if (mode === 'defilement' && !s.telephone) {
      tues.push(ScrollTrigger.create({ trigger: e.g, start: o.debut, end: o.fin, scrub: .6, animation: tl }));
    } else {
      tues.push(ScrollTrigger.create({ trigger: e.g, start: o.depart, once: true, onEnter: () => (o.delai ? gsap.delayedCall(o.delai, () => tl.play()) : tl.play()) }));
    }
  }
  s.rafraichir();
  return { detruire };
}

// La ponctuation qui suit le groupe (« clair, ») ne doit pas partir seule à la ligne : le mot écrit est un
// inline-block, après lequel le navigateur peut couper. On la colle au mot dans un span insécable.
function coller(g, ins) {
  const suite = g.nextSibling;
  const m = suite?.nodeType === 3 && suite.data.match(/^[,.;:!?…»)\]]+/);
  if (!m) return;
  suite.data = suite.data.slice(m[0].length);
  const cible = g.classList.contains('rst--dessus') ? g : ins;
  const colle = document.createElement('span');
  colle.className = 'rst__colle';
  cible.before(colle);
  colle.append(cible, m[0]);
}

// Applique la progression p (0 → 1) aux chemins d'un mot, l'un après l'autre (un chemin par ligne de texte).
function appliquer(d) {
  d.el.classList?.toggle('est-barre', d.p > .35 && d.el.tagName === 'DEL');
  const total = d.chemins.reduce((t, c) => t + c.L, 0);
  let reste = d.p * total;
  for (const c of d.chemins) {
    const vu = Math.max(0, Math.min(c.L, reste)); reste -= c.L;
    c.el.style.visibility = vu > .5 ? 'visible' : 'hidden';
    c.el.style.strokeDashoffset = String(c.L - vu);
  }
}

function chemin(svg, d, largeur) {
  const el = document.createElementNS(NS, 'path');
  el.setAttribute('d', d);
  el.style.strokeWidth = largeur.toFixed(2) + 'px';
  svg.appendChild(el);
  const L = el.getTotalLength() || 1;
  el.style.strokeDasharray = `${L} ${L + 20}`;
  return { el, L };
}

// Lignes réellement occupées par le texte (fusion des fragments d'une même ligne).
function lignes(el) {
  const r = document.createRange(); r.selectNodeContents(el);
  const out = [];
  for (const q of r.getClientRects()) {
    if (q.width < 2 || q.height < 2) continue;
    const m = out.find(l => Math.abs(l.top - q.top) < q.height * .5);
    if (m) { const g = Math.min(m.left, q.left), dr = Math.max(m.left + m.width, q.right); m.left = g; m.width = dr - g; m.height = Math.max(m.height, q.height); }
    else out.push({ left: q.left, top: q.top, width: q.width, height: q.height });
  }
  return out;
}

// Petit générateur pseudo-aléatoire à graine : mêmes traits à chaque affichage.
function alea(graine) {
  let a = (graine * 2654435761) >>> 0 || 1;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Trait de rature sur une ligne { x, y, w, h } en pixels, variante v.
function trait({ x, y, w, h }, v, rnd) {
  const j = n => (rnd() - .5) * n, f = n => n.toFixed(1);
  const a = h * .09, cy = y + h * (.55 + j(.06));
  const deb = Math.min(10, w * .05), x0 = x - deb + j(3), x1 = x + w + deb + j(3);
  const P = (px, py) => `${f(px)} ${f(py)}`;
  switch (v) {
    case 1: // aller-retour, comme une rature reprise
      return `M${P(x0, cy - a * (.8 + j(.4)))} C${P(x0 + w * .35, cy - a * 2.2)} ${P(x0 + w * .65, cy + a * 1.2)} ${P(x1, cy - a * .5)}`
        + ` C${P(x1 - w * .3, cy + a * (2.2 + j(.6)))} ${P(x0 + w * .35, cy + a * .1)} ${P(x0 + w * .05, cy + a * 1.8)}`;
    case 2: // diagonale qui monte, appuyée
      return `M${P(x0, cy + a * (2.4 + j(.6)))} C${P(x0 + w * .38, cy + a * (1.1 + j(.8)))} ${P(x0 + w * .7, cy - a * .7)} ${P(x1, cy - a * (2.3 + j(.6)))}`;
    case 3: { // gribouillis en trois passes serrées
      const xs = [x0, x1, x0 + w * .06, x1 - w * .04];
      const ys = [cy - a * 1.2, cy - a * .4, cy + a * .6, cy + a * 1.5];
      let d = `M${P(xs[0], ys[0])}`;
      for (let i = 1; i < 4; i++) { const mx = (xs[i - 1] + xs[i]) / 2; d += ` Q${P(mx, (ys[i - 1] + ys[i]) / 2 + j(a * 2.4))} ${P(xs[i] + j(4), ys[i])}`; }
      return d;
    }
    default: // trait ondulé simple
      return `M${P(x0, cy + a * j(1.6))} C${P(x0 + w * .3, cy - a * (1.6 + j(.8)))} ${P(x0 + w * .62, cy + a * (1.5 + j(.8)))} ${P(x1, cy - a * (.7 + j(.6)))}`;
  }
}

// Soulignement à main levée sous le nouveau mot, tourné avec lui (centre cx, cy ; taille non tournée w × h).
function soulignement(cx, cy, w, h, angle, rnd) {
  const j = n => (rnd() - .5) * n, yb = h * .44;
  const pts = [[-w * .52, yb + h * .02], [-w * .18, yb + h * (.1 + j(.04))], [w * .2, yb - h * (.06 + j(.04))], [w * .54, yb - h * .03]];
  const c = Math.cos(angle), s = Math.sin(angle);
  const [p0, p1, p2, p3] = pts.map(([px, py]) => `${(cx + px * c - py * s).toFixed(1)} ${(cy + px * s + py * c).toFixed(1)}`);
  return `M${p0} C${p1} ${p2} ${p3}`;
}
