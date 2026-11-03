// Courbe interactive à curseur : graphique SVG construit à partir de données JSON posées dans la page,
// courbe qui se trace à l'arrivée, repère qui suit un curseur range natif (clavier, clic, glisser au doigt sur le graphique),
// lecture de la valeur et texte explicatif de la zone en cours ; tableau équivalent pour les lecteurs d'écran.
import { pret } from '../../socle/socle.js';

const NS = 'http://www.w3.org/2000/svg';
let compteur = 0;

/**
 * @param {HTMLElement} root  section.cbi
 * @param {object} [options]
 * @param {object} [options.donnees]  données (remplacent ou complètent le JSON de la page : x, y, points, zones, seuils, depart)
 * @param {string} [options.selecteurDonnees='script[type="application/json"]']  où lire le JSON dans root
 * @param {object} [options.x]  axe horizontal { min, max, unite, libelle, pas (graduations), pasCurseur, decimales }
 * @param {object} [options.y]  axe vertical { min, max, unite, libelle, pas, decimales }
 * @param {boolean} [options.lisse=true]  courbe lissée (cubique monotone, sans dépassement) ou segments droits
 * @param {number} [options.duree=1.6]  durée du tracé en secondes
 * @param {boolean} [options.balayage=true]  à l'arrivée, le repère part du début de l'axe jusqu'à la valeur de départ
 * @param {string} [options.locale='fr-FR']  format des nombres
 * @param {string} [options.debut='top 75%']  déclenchement du tracé (ScrollTrigger)
 */
export async function init(root, options = {}) {
  const o = { selecteurDonnees: 'script[type="application/json"]', lisse: true, duree: 1.6, balayage: true, locale: 'fr-FR', debut: 'top 75%', ...options };
  const brut = JSON.parse(root.querySelector(o.selecteurDonnees)?.textContent || '{}');
  const d = { ...brut, ...(o.donnees || {}) };
  const ax = { min: 0, max: 100, pas: 10, decimales: 0, unite: '', libelle: '', ...d.x, ...o.x };
  const ay = { min: 0, max: 10, pas: 2, decimales: 1, unite: '', libelle: '', ...d.y, ...o.y };
  const pts = [...(d.points || [])].sort((a, b) => a[0] - b[0]);
  const zones = d.zones || [];
  const seuils = d.seuils || [];
  const f = o.lisse ? monotone(pts) : lineaire(pts);
  const fmt = (v, a) => new Intl.NumberFormat(o.locale, { minimumFractionDigits: a.decimales, maximumFractionDigits: a.decimales }).format(v) + (a.unite ? ' ' + a.unite : '');
  const zoneDe = x => zones.find(z => x <= z.jusqua) || zones[zones.length - 1];
  const teinte = i => zones.length > 1 ? i / (zones.length - 1) : 0;

  const id = 'cbi' + ++compteur;
  const svg = root.querySelector('.cbi__svg');
  const range = root.querySelector('.cbi__curseur');
  const oX = root.querySelector('[data-lecture="x"]'), oY = root.querySelector('[data-lecture="y"]'), oZ = root.querySelector('[data-lecture="zone"]');
  const oT = root.querySelector('.cbi__explication');
  const lecture = root.querySelector('.cbi__lectures');
  range.min = ax.min; range.max = ax.max; range.step = ax.pasCurseur ?? (ax.max - ax.min) / 100;
  range.value = d.depart ?? (ax.min + ax.max) / 2;

  tableau();

  // ---------- Dessin (viewBox = taille réelle en pixels : les textes gardent leur taille CSS) ----------
  let X, Y, l, r, t, b, W, H, sonde, ligneSonde, pointSonde, bulle, bulleTexte, bulleFond, bandes = [], revele = false, zoneAvant = null;
  function dessiner() {
    W = Math.max(240, Math.round(svg.clientWidth)); H = Math.max(180, Math.round(svg.clientHeight));
    const etroit = W < 520;
    l = etroit ? 38 : 52; r = 14; t = 34; b = 44;
    X = x => l + (x - ax.min) / (ax.max - ax.min) * (W - l - r);
    Y = v => H - b - (v - ay.min) / (ay.max - ay.min) * (H - t - b);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    root.style.setProperty('--cbi-g', l + 'px'); root.style.setProperty('--cbi-d', r + 'px');
    svg.replaceChildren();
    const desc = el('desc', { id: id + '-desc' }, svg); desc.textContent = d.description || 'Courbe de ' + ay.libelle + ' selon ' + ax.libelle + '.';
    svg.setAttribute('aria-describedby', id + '-desc');
    const defs = el('defs', {}, svg), grad = el('linearGradient', { id: id + '-aire', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, class: 'cbi__stop-haut' }, grad); el('stop', { offset: 1, class: 'cbi__stop-bas' }, grad);
    // Bandes de zones
    bandes = []; let x0 = ax.min;
    zones.forEach((z, i) => {
      const x1 = Math.min(ax.max, z.jusqua);
      const g = el('g', { class: 'cbi__bande', style: `--t:${teinte(i)}` }, svg);
      el('rect', { class: 'cbi__bande-fond', x: X(x0), y: t, width: Math.max(0, X(x1) - X(x0)), height: H - t - b }, g);
      el('rect', { class: 'cbi__bande-trait', x: X(x0) + 1, y: t - 6, width: Math.max(0, X(x1) - X(x0) - 2), height: 3 }, g);
      const tx = el('text', { class: 'cbi__bande-nom', x: (X(x0) + X(x1)) / 2, y: t - 12, 'text-anchor': 'middle' }, g);
      tx.textContent = z.nom || z.court || '';
      if (z.court && tx.getComputedTextLength() > X(x1) - X(x0) - 12) tx.textContent = z.court;
      bandes.push(g); x0 = x1;
    });
    // Grille et graduations
    for (let v = ay.min; v <= ay.max + 1e-9; v += ay.pas) {
      el('line', { class: 'cbi__grille', x1: l, x2: W - r, y1: Y(v), y2: Y(v) }, svg);
      const tx = el('text', { class: 'cbi__grad', x: l - 8, y: Y(v) + 4, 'text-anchor': 'end' }, svg); tx.textContent = nombre(v, ay);
    }
    const pasX = etroit ? ax.pas * 2 : ax.pas;
    for (let v = ax.min; v <= ax.max + 1e-9; v += pasX) {
      const tx = el('text', { class: 'cbi__grad', x: X(v), y: H - b + 18, 'text-anchor': 'middle' }, svg); tx.textContent = nombre(v, ax);
    }
    el('line', { class: 'cbi__axe', x1: l, x2: W - r, y1: H - b, y2: H - b }, svg);
    el('line', { class: 'cbi__axe', x1: l, x2: l, y1: t, y2: H - b }, svg);
    const lx = el('text', { class: 'cbi__libelle', x: W - r, y: H - 6, 'text-anchor': 'end' }, svg); lx.textContent = ax.libelle + (ax.unite ? ' (' + ax.unite + ')' : '');
    const ly = el('text', { class: 'cbi__libelle', x: l - 8, y: t - 12, 'text-anchor': 'end' }, svg); ly.textContent = ay.unite || '';
    // Courbe et aire
    let chemin = '';
    for (let i = 0; i <= 160; i++) { const x = ax.min + (ax.max - ax.min) * i / 160; chemin += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(borne(f(x), ay)).toFixed(1); }
    el('path', { class: 'cbi__aire', d: chemin + ` L${X(ax.max)} ${Y(ay.min)} L${X(ax.min)} ${Y(ay.min)} Z`, fill: `url(#${id}-aire)` }, svg);
    el('path', { class: 'cbi__courbe', d: chemin }, svg);
    // Seuils
    seuils.forEach(s => {
      const mx = X(s.x), my = Y(borne(f(s.x), ay));
      const g = el('g', { class: 'cbi__seuil' }, svg);
      el('line', { x1: mx, x2: mx, y1: my, y2: H - b }, g);
      el('circle', { cx: mx, cy: my, r: 4.5 }, g);
      // Étiquette en haut à gauche du point (au-dessus d'une courbe qui monte), à droite si la place manque.
      const tx = el('text', { x: mx - 10, y: my - 10, 'text-anchor': 'end' }, g); tx.textContent = s.nom;
      if (mx - 10 - tx.getComputedTextLength() < l + 4) { tx.setAttribute('x', mx + 10); tx.setAttribute('text-anchor', 'start'); }
    });
    // Repère
    sonde = el('g', { class: 'cbi__sonde' }, svg);
    ligneSonde = el('line', { y1: t, y2: H - b }, sonde);
    pointSonde = el('circle', { r: 7 }, sonde);
    bulle = el('g', { class: 'cbi__bulle' }, sonde);
    bulleFond = el('rect', { rx: 6, height: 26 }, bulle);
    bulleTexte = el('text', { 'text-anchor': 'middle' }, bulle);
    zoneAvant = null;
    maj();
    if (!revele && !s.calme) cacher();
  }

  function maj() {
    if (!ligneSonde) return;
    const x = Number(range.value), v = borne(f(x), ay), z = zoneDe(x), iz = zones.indexOf(z);
    const px = X(x), py = Y(v);
    ligneSonde.setAttribute('x1', px); ligneSonde.setAttribute('x2', px);
    pointSonde.setAttribute('cx', px); pointSonde.setAttribute('cy', py);
    bulleTexte.textContent = fmt(v, ay);
    const lw = Math.max(48, bulleTexte.getComputedTextLength() + 20);
    const bx = Math.min(W - r - lw / 2, Math.max(l + lw / 2, px));
    const by = py - 44 < t ? py + 16 : py - 42;
    bulleFond.setAttribute('x', bx - lw / 2); bulleFond.setAttribute('y', by); bulleFond.setAttribute('width', lw);
    bulleTexte.setAttribute('x', bx); bulleTexte.setAttribute('y', by + 17);
    bandes.forEach((g, i) => g.classList.toggle('est-active', i === iz));
    oX.textContent = fmt(x, ax); oY.textContent = fmt(v, ay);
    range.setAttribute('aria-valuetext', `${fmt(x, ax)}, ${ay.libelle} ${fmt(v, ay)}${z ? ', ' + z.nom : ''}`);
    if (z && z !== zoneAvant) {
      zoneAvant = z;
      oZ.textContent = z.nom; oT.textContent = z.texte || '';
      lecture.style.setProperty('--t', teinte(iz)); lecture.dataset.zone = String(iz + 1);
    }
  }

  // ---------- Glisser ou cliquer sur le graphique ----------
  let glisse = false;
  const versValeur = e => {
    const rc = svg.getBoundingClientRect(), px = (e.clientX - rc.left) * (W / rc.width);
    const x = ax.min + (px - l) / (W - l - r) * (ax.max - ax.min);
    range.value = Math.min(ax.max, Math.max(ax.min, x));
    maj(); range.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const bas = e => { if (e.button > 0) return; arreterBalayage(); glisse = true; svg.setPointerCapture?.(e.pointerId); versValeur(e); };
  const bouge = e => { if (glisse) versValeur(e); };
  const haut = () => { glisse = false; };
  svg.addEventListener('pointerdown', bas); svg.addEventListener('pointermove', bouge);
  svg.addEventListener('pointerup', haut); svg.addEventListener('pointercancel', haut);
  const surSaisie = () => { arreterBalayage(); maj(); };
  range.addEventListener('input', surSaisie);

  // ---------- Redimensionnement (avec délai, seulement si la largeur change vraiment) ----------
  let largeur = svg.clientWidth, minuterie = 0;
  const ro = new ResizeObserver(() => { clearTimeout(minuterie); minuterie = setTimeout(() => { if (Math.abs(svg.clientWidth - largeur) > 4 || Math.abs(svg.clientHeight - H) > 4) { largeur = svg.clientWidth; dessiner(); } }, 150); });

  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  dessiner();
  ro.observe(svg);

  // ---------- Tracé à l'arrivée ----------
  let tl = null, st = null, balayage = null;
  function cacher() {
    const c = svg.querySelector('.cbi__courbe'), len = c.getTotalLength();
    gsap.set(c, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(svg.querySelectorAll('.cbi__aire, .cbi__seuil, .cbi__sonde'), { opacity: 0 });
  }
  function arreterBalayage() { if (balayage) { balayage.kill(); balayage = null; } }
  function reveler() {
    revele = true;
    const c = svg.querySelector('.cbi__courbe'), len = c.getTotalLength();
    tl = gsap.timeline({ onComplete: () => gsap.set(c, { clearProps: 'strokeDasharray,strokeDashoffset' }) })
      .fromTo(c, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: o.duree, ease: 'power2.inOut' })
      .to(svg.querySelector('.cbi__aire'), { opacity: 1, duration: .8 }, o.duree * .4)
      .to(svg.querySelectorAll('.cbi__seuil'), { opacity: 1, duration: .5, stagger: .15 }, o.duree * .6)
      .to(svg.querySelector('.cbi__sonde'), { opacity: 1, duration: .4 }, o.duree * .3);
    if (o.balayage) {
      const cible = Number(range.value), v = { x: ax.min };
      range.value = ax.min; maj();
      balayage = gsap.to(v, { x: cible, duration: o.duree * .9, delay: o.duree * .3, ease: 'power2.inOut', onUpdate: () => { range.value = v.x; maj(); }, onComplete: () => { balayage = null; } });
    }
  }
  if (s.calme) revele = true;
  else st = ScrollTrigger.create({ trigger: svg, start: o.debut, once: true, onEnter: reveler });
  s.rafraichir();

  // ---------- Tableau équivalent ----------
  function tableau() {
    const corps = root.querySelector('.cbi__tableau tbody'), tete = root.querySelector('.cbi__tableau thead');
    if (!corps) return;
    tete.innerHTML = '';
    const tr = document.createElement('tr');
    for (const h of [ax.libelle + (ax.unite ? ' (' + ax.unite + ')' : ''), ay.libelle + (ay.unite ? ' (' + ay.unite + ')' : ''), 'Zone']) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = h; tr.append(th); }
    tete.append(tr);
    corps.replaceChildren(...pts.map(([x, y]) => {
      const ligne = document.createElement('tr'), th = document.createElement('th'); th.scope = 'row'; th.textContent = nombre(x, ax);
      const c1 = document.createElement('td'); c1.textContent = nombre(y, ay);
      const c2 = document.createElement('td'); c2.textContent = zoneDe(x)?.nom || '';
      ligne.append(th, c1, c2); return ligne;
    }));
  }

  function nombre(v, a) { return new Intl.NumberFormat(o.locale, { maximumFractionDigits: a.decimales }).format(v); }

  return {
    /** place le repère sur une valeur de l'axe horizontal */
    aller(x) { arreterBalayage(); range.value = x; maj(); },
    detruire() {
      ro.disconnect(); clearTimeout(minuterie); st?.kill(); tl?.kill(); arreterBalayage();
      svg.removeEventListener('pointerdown', bas); svg.removeEventListener('pointermove', bouge);
      svg.removeEventListener('pointerup', haut); svg.removeEventListener('pointercancel', haut);
      range.removeEventListener('input', surSaisie);
    },
  };
}

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
}
const borne = (v, a) => Math.min(a.max, Math.max(a.min, v));

function lineaire(p) {
  return x => {
    if (x <= p[0][0]) return p[0][1];
    for (let i = 1; i < p.length; i++) if (x <= p[i][0]) { const [x0, y0] = p[i - 1], [x1, y1] = p[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
    return p[p.length - 1][1];
  };
}

// Interpolation cubique monotone (Fritsch-Carlson) : passe par chaque point sans dépassement.
function monotone(p) {
  const n = p.length;
  if (n < 3) return lineaire(p);
  const h = [], s = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) { h[i] = p[i + 1][0] - p[i][0]; s[i] = (p[i + 1][1] - p[i][1]) / h[i]; }
  m[0] = s[0]; m[n - 1] = s[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = s[i - 1] * s[i] <= 0 ? 0 : (s[i - 1] + s[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / s[i], b = m[i + 1] / s[i], q = a * a + b * b;
    if (q > 9) { const k = 3 / Math.sqrt(q); m[i] = k * a * s[i]; m[i + 1] = k * b * s[i]; }
  }
  return x => {
    if (x <= p[0][0]) return p[0][1];
    if (x >= p[n - 1][0]) return p[n - 1][1];
    let i = 0; while (x > p[i + 1][0]) i++;
    const u = (x - p[i][0]) / h[i], u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p[i][1] + (u3 - 2 * u2 + u) * h[i] * m[i] + (-2 * u3 + 3 * u2) * p[i + 1][1] + (u3 - u2) * h[i] * m[i + 1];
  };
}
