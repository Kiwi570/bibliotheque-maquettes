// Fil conducteur : un tracé SVG qui accompagne le visiteur sur toute la page, d'une section à l'autre.
// Les sections s'y accrochent par data-* ; le tracé est reconstruit à chaque refresh de ScrollTrigger
// (redimensionnement, polices, images, changement de hauteur), et se dessine au rythme du regard du visiteur.
//
//   data-fil="gauche|droite|centre"  sur une section : le fil la longe dans cette marge (de son padding haut à son padding bas)
//   data-fil-point="fx fy"           sur un élément : le fil passe par ce point (fractions de sa boîte, 0.5 0.5 par défaut)
//   data-fil-boucle                  avec data-fil-point : le fil fait une boucle à cet endroit
//   data-fil-sans-perle              avec data-fil-point : pas de perle à ce point
//   data-fil-repere                  sur un élément : perle posée sur le fil à sa hauteur, sans détour
//   template[data-fil-objet]         dans la racine : SVG de l'objet au bout du fil (centré sur 0 0), sinon une tête ronde
// Chaque élément accroché reçoit la classe est-atteinte quand le fil l'atteint.
import { pret } from '../../socle/socle.js';

const NS = 'http://www.w3.org/2000/svg';
const f = n => n.toFixed(1);
const borne = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * @param {HTMLElement} root  conteneur des sections (souvent <main>), qui reçoit le tracé
 * @param {object} [options]
 * @param {number}  [options.regard=0.62]          hauteur de l'écran (0 à 1) que suit le bout du fil
 * @param {number}  [options.marge=0.5]            position du fil dans la gouttière (0 bord de l'écran, 1 bord du contenu)
 * @param {string}  [options.cadre='.socle-cadre'] colonne de contenu dont on mesure les gouttières, dans chaque section
 * @param {number}  [options.onde=10]              ondulation du fil le long d'une section, en px (0 : droit)
 * @param {number}  [options.boucle=34]            rayon des boucles, en px
 * @param {number}  [options.lissage=0.5]          retard du bout du fil sur le défilement, en secondes (0 : immédiat)
 * @param {boolean} [options.rail=true]            trace pâle du chemin complet sous le fil
 * @param {boolean} [options.objet=true]           objet au bout du fil
 * @param {boolean} [options.orienter=false]       l'objet tourne avec la direction du fil
 * @param {number}  [options.largeurTelephone=700] en dessous : fil droit dans la marge gauche, sans détour ni boucle
 */
export async function init(root, options = {}) {
  const o = { regard: 0.62, marge: 0.5, cadre: '.socle-cadre', onde: 10, boucle: 34, lissage: 0.5, rail: true, objet: true, orienter: false, largeurTelephone: 700, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const calme = s.calme;

  root.classList.add('fic');
  const el = (nom, cls, parent) => { const e = document.createElementNS(NS, nom); if (cls) e.setAttribute('class', cls); parent?.appendChild(e); return e; };
  const svg = el('svg', 'fic__svg');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); svg.setAttribute('preserveAspectRatio', 'none');
  const rail = o.rail ? el('path', 'fic__rail', svg) : null;
  const trace = el('path', 'fic__trace', svg);
  const gPerles = el('g', 'fic__perles', svg);
  const objet = o.objet && !calme ? el('g', 'fic__objet', svg) : null;
  if (objet) {
    const modele = root.querySelector('template[data-fil-objet]');
    if (modele) objet.innerHTML = modele.innerHTML;
    else { el('circle', 'fic__halo', objet).setAttribute('r', 10); el('circle', 'fic__tete', objet).setAttribute('r', 4.5); }
  }
  root.prepend(svg);

  let L = 0, pas = 1, table = [], ancres = [], haut = 0;
  const etat = { l: 0 };

  function construire() {
    const W = root.clientWidth, H = root.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const rr = root.getBoundingClientRect();
    haut = rr.top + scrollY;
    const tel = innerWidth < o.largeurTelephone;
    // Boîte d'un élément dans le repère de la racine (pin-spacer compris s'il est épinglé).
    const boite = e => { const h = e.parentElement?.classList.contains('pin-spacer') ? e.parentElement : e; const r = h.getBoundingClientRect(); return { l: r.left - rr.left, t: r.top - rr.top, r: r.right - rr.left, b: r.bottom - rr.top, w: r.width, h: r.height }; };
    const gouttieres = e => { const c = e.matches(o.cadre) ? e : e.querySelector(o.cadre); if (!c) return [16, 16]; const b = boite(c); return [b.l, W - b.r]; };
    const xCote = (e, cote) => { const [g, d] = gouttieres(e); if (cote === 'droite') return W - Math.max(6, d * o.marge); if (cote === 'centre') return W / 2; return Math.max(6, g * o.marge); };
    const visible = e => e.getClientRects().length > 0;

    // Points de passage
    let pts = [];
    const accroches = [...root.querySelectorAll('[data-fil], [data-fil-point], [data-fil-repere]')].filter(visible);
    for (const e of accroches) {
      const b = boite(e);
      if (e.hasAttribute('data-fil-point')) {
        const [fx = 0.5, fy = 0.5] = (e.dataset.filPoint || '').trim().split(/\s+/).filter(Boolean).map(Number);
        pts.push({ x: b.l + b.w * fx, y: b.t + b.h * fy, el: e, perle: !e.hasAttribute('data-fil-sans-perle'), boucle: e.hasAttribute('data-fil-boucle') });
      } else if (e.hasAttribute('data-fil')) {
        const cs = getComputedStyle(e);
        const x = xCote(e, e.dataset.fil || 'gauche');
        const iT = Math.min(Math.max((parseFloat(cs.paddingTop) || 0) * 0.5, 24), b.h * 0.25);
        const iB = Math.min(Math.max((parseFloat(cs.paddingBottom) || 0) * 0.5, 24), b.h * 0.25);
        pts.push({ x, y: b.t + iT, el: e, debut: true }, { x, y: b.b - iB, el: e, fin: true });
      }
    }
    pts.sort((a, b) => a.y - b.y);
    if (pts.length < 2) { trace.setAttribute('d', ''); rail?.setAttribute('d', ''); L = 0; return; }
    let onde = o.onde;
    if (tel) {
      // Téléphone : fil droit dans la marge gauche, les points ne gardent que leur hauteur.
      const premiere = accroches.find(e => e.hasAttribute('data-fil')) || root;
      const x = Math.max(6, gouttieres(premiere)[0] * o.marge);
      pts = pts.map(p => ({ ...p, x, boucle: false }));
      onde = 0;
    }

    // Tracé : ondulation le long d'une section, courbe en S d'une marge à l'autre (dans les paddings), boucles.
    // Les segments sont gardés pour calculer la table des longueurs en JavaScript :
    // getPointAtLength sur un long tracé coûtait plusieurs centaines de millisecondes à chaque reconstruction.
    const segs = [];
    let d = `M${f(pts[0].x)} ${f(pts[0].y)}`, cur = { x: pts[0].x, y: pts[0].y };
    const ligne = (x, y) => { d += ` L${f(x)} ${f(y)}`; segs.push([cur.x, cur.y, cur.x, cur.y, x, y, x, y]); cur = { x, y }; };
    const courbe = (x1, y1, x2, y2, x, y) => { d += ` C${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x)} ${f(y)}`; segs.push([cur.x, cur.y, x1, y1, x2, y2, x, y]); cur = { x, y }; };
    let prec = pts[0];
    for (let i = 1; i < pts.length; i++) {
      const b = pts[i], dy = b.y - cur.y;
      if (Math.abs(b.x - cur.x) < 1) {
        if (onde && prec.debut && b.fin && prec.el === b.el && dy > 80) { const k = cur.x < W / 2 ? 1 : -1; courbe(cur.x + onde * k, cur.y + dy / 3, b.x - onde * k, cur.y + dy * 2 / 3, b.x, b.y); }
        else ligne(b.x, b.y);
      } else courbe(cur.x, cur.y + dy * 0.55, b.x, b.y - dy * 0.55, b.x, b.y);
      prec = b;
      if (b.boucle) {
        const r = o.boucle;
        courbe(b.x + r * 1.1, b.y + r * 0.5, b.x + r * 1.2, b.y - r * 1.3, b.x, b.y - r * 1.2);
        courbe(b.x - r * 1.2, b.y - r * 1.1, b.x - r * 0.6, b.y + r * 0.7, b.x + r * 0.2, b.y + r * 0.9);
      }
    }
    trace.setAttribute('d', d); rail?.setAttribute('d', d);

    // Table longueur → point, avec la hauteur maximale atteinte (le fil peut remonter dans une boucle).
    const brute = [[0, segs[0] ? segs[0][0] : pts[0].x, segs[0] ? segs[0][1] : pts[0].y]];
    let acc = 0;
    for (const [x0, y0, x1, y1, x2, y2, x3, y3] of segs) {
      const n = x0 === x1 && y0 === y1 && x2 === x3 && y2 === y3 ? 1 : 24;
      let px = x0, py = y0;
      for (let k = 1; k <= n; k++) {
        const t = k / n, u = 1 - t;
        const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
        const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
        acc += Math.hypot(x - px, y - py); px = x; py = y;
        brute.push([acc, x, y]);
      }
    }
    L = trace.getTotalLength();
    const echelle = acc > 0 ? L / acc : 1;
    trace.style.strokeDasharray = `${L} ${L}`;
    pas = Math.max(4, L / 1600); table = [];
    let maxY = -Infinity, j = 0;
    for (let l = 0; ; l += pas) {
      const ll = Math.min(l, L), cible = ll / echelle;
      while (j < brute.length - 2 && brute[j + 1][0] < cible) j++;
      const a = brute[j], b = brute[Math.min(j + 1, brute.length - 1)], span = b[0] - a[0] || 1, q = Math.min(1, Math.max(0, (cible - a[0]) / span));
      const x = a[1] + (b[1] - a[1]) * q, y = a[2] + (b[2] - a[2]) * q;
      maxY = Math.max(maxY, y); table.push([ll, x, y, maxY]);
      if (ll >= L) break;
    }

    // Perles et éléments accrochés
    gPerles.replaceChildren(); ancres = [];
    for (const e of accroches) {
      const b = boite(e);
      const p = pts.find(q => q.el === e);
      const yv = e.hasAttribute('data-fil') ? p.y : e.hasAttribute('data-fil-point') ? p.y : b.t + b.h / 2;
      const l = longueurPourY(yv);
      const avecPerle = e.hasAttribute('data-fil-repere') || (p?.perle && !e.hasAttribute('data-fil'));
      let perle = null;
      if (avecPerle) { const q = table[Math.min(table.length - 1, Math.round(l / pas))]; perle = el('circle', 'fic__perle', gPerles); perle.setAttribute('r', tel ? 3.5 : 5); perle.setAttribute('cx', f(q[1])); perle.setAttribute('cy', f(q[2])); }
      ancres.push({ e, l, perle });
    }
    gsap.killTweensOf(etat);
    etat.l = calme ? L : cible();
    peindre();
  }

  function longueurPourY(y) {
    if (!table.length) return 0;
    let lo = 0, hi = table.length - 1;
    if (y >= table[hi][3]) return L;
    while (lo < hi) { const m = (lo + hi) >> 1; if (table[m][3] >= y) hi = m; else lo = m + 1; }
    return table[lo][0];
  }

  // Longueur visée : la hauteur du regard, qui descend jusqu'au bas de l'écran quand la page se termine.
  function cible() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const proche = max > 0 ? borne((scrollY - (max - innerHeight * 0.5)) / (innerHeight * 0.5), 0, 1) : 1;
    return longueurPourY(scrollY + innerHeight * (o.regard + (1 - o.regard) * proche) - haut);
  }

  function peindre() {
    if (!L) return;
    const l = borne(etat.l, 0, L);
    trace.style.strokeDashoffset = f(L - l);
    if (objet) {
      const i = Math.min(table.length - 1, Math.round(l / pas)), p = table[i];
      let tr = `translate(${f(p[1])} ${f(p[2])})`;
      if (o.orienter) { const a = table[Math.max(0, i - 2)]; tr += ` rotate(${f(Math.atan2(p[2] - a[2], p[1] - a[1]) * 180 / Math.PI)})`; }
      objet.setAttribute('transform', tr);
      objet.classList.toggle('est-visible', l > 2 && l < L - 2);
    }
    for (const a of ancres) { const ok = l >= a.l - 1; a.e.classList.toggle('est-atteinte', ok); a.perle?.classList.toggle('est-atteinte', ok); }
  }

  function suivre() {
    if (calme || !L) return;
    const v = cible();
    if (o.lissage > 0) gsap.to(etat, { l: v, duration: o.lissage, ease: 'power3.out', overwrite: true, onUpdate: peindre });
    else { etat.l = v; peindre(); }
  }

  const st = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onUpdate: suivre, onRefresh: construire });
  construire();
  s.rafraichir();

  return {
    construire,
    detruire() {
      st.kill(); gsap.killTweensOf(etat); svg.remove(); root.classList.remove('fic');
      for (const a of ancres) a.e.classList.remove('est-atteinte');
    },
  };
}
