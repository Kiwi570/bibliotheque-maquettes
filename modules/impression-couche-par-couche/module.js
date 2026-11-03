// Impression couche par couche : la section s'épingle, un objet de démonstration (vase torsadé et nervuré) s'imprime
// couche après couche sous une buse, les couches fraîches sont chaudes (teinte d'accent) puis refroidissent ;
// l'indicateur suit (couche n / N, pourcentage, barre), puis l'objet s'ouvre en strates (vue éclatée).
// Canvas 2D seul : pas de WebGL, pas d'image, aucune boucle permanente (le dessin ne se refait qu'au défilement ou au redimensionnement).
// Téléphone ou écran bas : pas d'épinglage, l'impression avance pendant que la scène traverse l'écran.
// Mode calme : objet entier, ouvert en strates, indicateur à 100 %, rien ne bouge.
import { pret } from '../../socle/socle.js';

const TOUR = Math.PI * 2;

/**
 * @param {HTMLElement} root  section.icc
 * @param {object} [options]
 * @param {number} [options.couches=64]        nombre de couches imprimées
 * @param {number} [options.strates=6]         nombre de strates de la vue éclatée (0 pour ne pas éclater)
 * @param {number} [options.longueur=3]        durée de l'épinglage, en hauteurs d'écran
 * @param {number|boolean} [options.lissage=.6] valeur scrub de ScrollTrigger
 * @param {number} [options.rotation=.9]       rotation de l'objet pendant la séquence, en radians (0 pour la couper)
 * @param {number} [options.nervures=12]       nombre de nervures du vase (0 : vase lisse)
 * @param {number} [options.torsion=.9]        torsion des nervures du pied au col, en radians
 * @param {string} [options.matiere='--couleur-secondaire'] variable CSS de la couleur de la matière
 * @param {function} [options.profil]          rayon en fonction de la hauteur t (0 → 1), environ 0,3 à 1 : change la forme
 * @param {object} [options.textes]            { impression, termine, eclate } : libellés de l'état ({n} = nombre de strates)
 * @param {number} [options.largeurMin=700]    largeur à partir de laquelle la section s'épingle
 * @param {number} [options.hauteurMin=520]    hauteur à partir de laquelle la section s'épingle
 */
export async function init(root, options = {}) {
  const o = {
    couches: 64, strates: 6, longueur: 3, lissage: .6, rotation: .9, nervures: 12, torsion: .9, matiere: '--couleur-secondaire',
    profil: t => .6 + .34 * Math.sin(Math.PI * t * 1.2) + .4 * t ** 6, largeurMin: 700, hauteurMin: 520, ...options,
  };
  o.textes = { impression: 'Impression en cours', termine: 'Impression terminée', eclate: 'Vue éclatée : {n} strates', ...options.textes };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const toile = root.querySelector('.icc__toile');
  if (!toile) return { detruire() {} };
  const N = Math.max(4, Math.round(o.couches));
  const G = Math.max(0, Math.min(N, Math.round(o.strates)));
  const ui = {
    etat: root.querySelector('[data-etat]'), couche: root.querySelector('[data-couche]'), pourcent: root.querySelector('[data-pourcent]'),
    total: root.querySelector('[data-total]'), mesure: root.querySelector('.icc__mesure'),
  };
  if (ui.total) ui.total.textContent = String(N);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  toile.prepend(canvas);
  const g = canvas.getContext('2d');

  // Couleurs : lues dans les variables (n'importe quel format CSS), converties en rgb par un canvas d'un pixel.
  const sonde = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgb = (v, repli) => {
    sonde.canvas.width = sonde.canvas.height = 1;
    sonde.fillStyle = repli; sonde.fillStyle = v || repli; sonde.fillRect(0, 0, 1, 1);
    return [...sonde.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const melange = (a, b, k) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
  const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  let C = {};
  const lireCouleurs = () => {
    const cs = getComputedStyle(root);
    const lire = n => cs.getPropertyValue(n).trim();
    const fond = rgb(lire('--couleur-fond'), '#fff'), texte = rgb(lire('--couleur-texte'), '#000');
    const mat = rgb(lire(o.matiere), '#668'), accent = rgb(lire('--couleur-accent'), '#f60');
    C = { fond, texte, accent, mat, ombre: melange(mat, texte, .45), clair: melange(mat, fond, .4), dessus: melange(mat, fond, .55), interieur: melange(mat, texte, .62), chaud: melange(accent, fond, .35) };
    C.police = lire('--police-mono') || 'monospace';
  };

  // Géométrie (unités de l'objet) : hauteur H, aplatissement des ellipses SY, paroi, écart des strates.
  const H = 2.3, SY = .3, PAROI = .08, ECART = .28, M = 96;
  const rayons = Array.from({ length: N }, (_, j) => o.profil((j + .5) / N));
  const rmax = Math.max(...rayons) * (1 + (o.nervures ? .05 : 0));
  const strate = j => (G ? Math.floor(j * G / N) : 0);
  const etat = { p: 0, e: 0 };
  let L = 0, Ht = 0, dpr = 1;

  const mesurer = () => {
    const r = toile.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    dpr = Math.min(devicePixelRatio || 1, 2);
    L = Math.round(r.width * dpr); Ht = Math.round(r.height * dpr);
    if (canvas.width !== L || canvas.height !== Ht) { canvas.width = L; canvas.height = Ht; }
    return true;
  };

  // Contour d'une couche : rayon nervuré et tordu, de l'angle a0 à a1 ; inverse pour la paroi intérieure.
  const contour = (j, rot, a0, a1, retrait, sens, f) => {
    const t = (j + .5) / N, r0 = rayons[j] - retrait;
    const n = Math.max(6, Math.ceil(M * Math.abs(a1 - a0) / TOUR));
    for (let k = 0; k <= n; k++) {
      const a = sens > 0 ? a0 + (a1 - a0) * k / n : a1 - (a1 - a0) * k / n;
      const rr = r0 * (1 + (o.nervures ? .04 * Math.cos(o.nervures * (a + o.torsion * t)) : 0));
      f(rr * Math.cos(a + rot), rr * Math.sin(a + rot), k);
    }
  };

  const rendre = () => {
    if (!L && !mesurer()) return;
    g.clearRect(0, 0, L, Ht);
    const p = etat.p, e = G ? etat.e : 0;
    const ouvert = (G - 1) * ECART;
    // Échelle fixe (calculée objet ouvert) : rien ne zoome ; centrage vertical sur la hauteur actuelle.
    const sc = Math.min(L * .8 / (2 * rmax + .1), Ht * .86 / (H + ouvert + 2 * SY * rmax + .25));
    const cx = L / 2, base = Ht / 2 + sc * (H + ouvert * e) / 2;
    const rot = -Math.PI / 2 + o.rotation * (p * .75 + e * .25);
    const ep = sc * H / N;
    const X = (x, j) => cx + sc * (x + (G ? (strate(j) % 2 ? 1 : -1) * .05 * e : 0));
    const Y = (y, j) => base - sc * (j / N * H + (G ? strate(j) * ECART * e : 0)) + sc * SY * y;

    // Plateau d'impression.
    g.beginPath(); g.ellipse(cx, base + ep, sc * rmax * 1.25, sc * SY * rmax * 1.25, 0, 0, TOUR);
    g.fillStyle = css(C.texte, .05); g.fill(); g.lineWidth = Math.max(1, dpr); g.strokeStyle = css(C.texte, .16); g.stroke();

    const degrade = g.createLinearGradient(cx - sc * rmax, 0, cx + sc * rmax, 0);
    degrade.addColorStop(0, css(C.ombre)); degrade.addColorStop(.62, css(C.clair)); degrade.addColorStop(1, css(C.mat));
    const total = p * N, courante = Math.min(N - 1, Math.floor(total)), frac = p >= 1 ? 1 : total - courante;
    const faites = p >= 1 ? N : courante;

    const anneau = (j, a0, a1) => {
      g.beginPath();
      contour(j, rot, a0, a1, 0, 1, (x, y, k) => k ? g.lineTo(X(x, j), Y(y, j)) : g.moveTo(X(x, j), Y(y, j)));
      if (j > 1) contour(j, rot, a0, a1, PAROI, -1, (x, y) => g.lineTo(X(x, j), Y(y, j)));
      g.closePath();
    };
    // Bande latérale d'une couche (épaisseur ep) entre les angles a0 et a1, paroi extérieure ou intérieure (retrait).
    const bande = (j, a0, a1, retrait) => {
      g.beginPath();
      contour(j, rot, a0, a1, retrait, 1, (x, y, k) => k ? g.lineTo(X(x, j), Y(y, j)) : g.moveTo(X(x, j), Y(y, j)));
      contour(j, rot, a0, a1, retrait, -1, (x, y) => g.lineTo(X(x, j), Y(y, j) + ep));
      g.closePath();
    };
    const chauffer = (chaleur, regle) => { if (chaleur > .02) { g.fillStyle = css(C.accent, chaleur * .75); g.fill(regle); } };
    g.lineJoin = 'round';
    const avant = -rot, arriere = Math.PI - rot;
    for (let j = 0; j < faites; j++) {
      const chaleur = p < 1 ? Math.exp(-(courante - j) * .42) : 0;
      // Paroi intérieure du fond (vue par l'ouverture), paroi extérieure de face, puis dessus de la couche.
      if (j > 1) { bande(j, arriere, arriere + Math.PI, PAROI); g.fillStyle = css(C.interieur); g.fill(); chauffer(chaleur * .6); }
      bande(j, avant, arriere, 0); g.fillStyle = degrade; g.fill(); chauffer(chaleur);
      g.lineWidth = Math.max(.5 * dpr, ep * .14); g.strokeStyle = css(C.texte, .14); g.stroke();
      anneau(j, 0, TOUR); g.fillStyle = css(C.dessus); g.fill('evenodd'); chauffer(chaleur, 'evenodd');
      const bord = j === faites - 1 || (G && e > .02 && strate(j + 1) !== strate(j));
      if (bord) { g.lineWidth = Math.max(.6 * dpr, ep * .16); g.strokeStyle = css(C.texte, .28); g.stroke(); }
    }
    if (p > 0 && p < 1) {
      // Couche en cours : secteur posé derrière la buse, puis la buse et son chariot.
      const a1 = frac * TOUR;
      if (a1 > .01) { anneau(courante, 0, a1); g.fillStyle = css(C.chaud); g.fill('evenodd'); g.fillStyle = css(C.accent, .6); g.fill('evenodd'); }
      const t = (courante + .5) / N, rr = rayons[courante] * (1 + (o.nervures ? .04 * Math.cos(o.nervures * (a1 + o.torsion * t)) : 0));
      const nx = X(rr * Math.cos(a1 + rot), courante), ny = Y(rr * Math.sin(a1 + rot), courante);
      const halo = g.createRadialGradient(nx, ny, 0, nx, ny, sc * .22);
      halo.addColorStop(0, css(C.accent, .55)); halo.addColorStop(1, css(C.accent, 0));
      g.fillStyle = halo; g.beginPath(); g.arc(nx, ny, sc * .22, 0, TOUR); g.fill();
      const hb = sc * .16, yb = ny - hb;
      g.strokeStyle = css(C.texte, .35); g.lineWidth = Math.max(1, dpr);
      g.beginPath(); g.moveTo(cx - sc * rmax * 1.3, yb - hb * .4); g.lineTo(cx + sc * rmax * 1.3, yb - hb * .4); g.stroke();
      g.fillStyle = css(C.texte, .85);
      g.beginPath(); g.moveTo(nx - hb * .35, yb - hb * .7); g.lineTo(nx + hb * .35, yb - hb * .7); g.lineTo(nx + hb * .12, ny - 2 * dpr); g.lineTo(nx - hb * .12, ny - 2 * dpr); g.closePath(); g.fill();
      g.fillStyle = css(C.chaud); g.beginPath(); g.arc(nx, ny, Math.max(2, 2.4 * dpr), 0, TOUR); g.fill();
    }

    // Vue éclatée : repère et numéro de chaque strate, à droite de l'objet.
    const a = Math.max(0, Math.min(1, (e - .45) / .45));
    if (G && a > 0) {
      const xg = cx + sc * (rmax + .14), libre = L - xg;
      const corps = Math.max(12 * dpr, Math.min(14 * dpr, sc * .08));
      g.font = `600 ${corps}px ${C.police}`; g.textBaseline = 'middle';
      for (let k = 0; k < G; k++) {
        const j0 = Math.ceil(k * N / G), j1 = Math.ceil((k + 1) * N / G) - 1;
        const y0 = Y(0, j1) - ep, y1 = Y(0, j0), ym = (y0 + y1) / 2;
        g.globalAlpha = a;
        g.strokeStyle = css(C.texte, .45); g.lineWidth = Math.max(1, dpr);
        g.beginPath(); g.moveTo(xg, y0 + ep * .3); g.lineTo(xg + 6 * dpr, y0 + ep * .3); g.lineTo(xg + 6 * dpr, y1 - ep * .3); g.lineTo(xg, y1 - ep * .3); g.stroke();
        const etiquette = libre > 150 * dpr ? `${String(k + 1).padStart(2, '0')} · ${j0 + 1}–${j1 + 1}` : String(k + 1).padStart(2, '0');
        g.fillStyle = css(C.texte, .85); g.fillText(etiquette, xg + 12 * dpr, ym);
        g.globalAlpha = 1;
      }
    }
    majIndicateur(p, e);
  };

  let dernier = '';
  const majIndicateur = (p, e) => {
    const n = p <= 0 ? 0 : Math.min(N, Math.floor(p * N) + 1);
    const pc = Math.round(p * 100);
    const libelle = G && e > .04 ? o.textes.eclate.replace('{n}', G) : p >= 1 ? o.textes.termine : o.textes.impression;
    const cle = n + '|' + pc + '|' + libelle;
    if (cle === dernier) return;
    dernier = cle;
    if (ui.couche) ui.couche.textContent = String(n);
    if (ui.pourcent) ui.pourcent.textContent = String(pc);
    if (ui.etat) ui.etat.textContent = libelle;
    ui.mesure?.style.setProperty('--p', (p).toFixed(3));
    root.classList.toggle('icc--fini', p >= 1);
  };

  lireCouleurs();
  const ro = new ResizeObserver(() => { if (mesurer()) rendre(); });
  ro.observe(toile);
  const nettoyer = () => { ro.disconnect(); canvas.remove(); root.classList.remove('icc--fini', 'icc--vivant'); };

  if (s.calme) {
    // État final : objet entier, ouvert en strates, indicateur complet.
    etat.p = 1; etat.e = 1;
    mesurer(); rendre();
    return { detruire: nettoyer };
  }

  // Scénario (unités arbitraires) : impression, temps d'arrêt, ouverture en strates.
  const construire = () => {
    const tl = gsap.timeline({ paused: true, onUpdate: rendre });
    tl.to(etat, { p: 1, duration: 7, ease: 'none' });
    if (G) tl.to(etat, { e: 1, duration: 2.4, ease: 'power2.inOut' }, '+=.8');
    tl.to({}, { duration: .5 });
    return tl;
  };

  root.classList.add('icc--vivant');
  mesurer(); rendre();
  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('icc--epinglee');
    const tl = construire();
    const st = ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true, scrub: o.lissage, animation: tl, invalidateOnRefresh: true,
      onToggle: self => root.classList.toggle('est-epingle', self.isActive),
    });
    return () => { st.kill(); tl.progress(0).kill(); root.classList.remove('icc--epinglee', 'est-epingle'); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const tl = construire();
    const st = ScrollTrigger.create({ trigger: toile, start: 'top 72%', end: 'bottom 64%', scrub: o.lissage, animation: tl });
    return () => { st.kill(); tl.progress(0).kill(); };
  });
  s.rafraichir();
  return { detruire() { mm.revert(); nettoyer(); } };
}
