// Dissolution en particules : une fiche (élément HTML) ou une image se défait en carrés ou en points (canvas 2D),
// qui s'envolent et se rangent ailleurs (nuage ou grille, parmi des milliers d'autres points), puis se recomposent
// en image (ou en la même fiche). Piloté au défilement (section épinglée, sans épinglage sur téléphone) ou à l'apparition.
// Les particules ne servent qu'à la transition : en dehors, ce sont les vrais éléments qui s'affichent, intacts.
// Mode calme : composition fixe (image et fiche visibles), points immobiles, aucune animation.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.ddp
 * @param {object} [options]
 * @param {'defilement'|'apparition'} [options.mode='defilement']  défilement : progression liée à la molette ; apparition : joué une fois à l'arrivée à l'écran
 * @param {'nuage'|'grille'} [options.disposition='nuage']  où se rangent les particules entre les deux états
 * @param {'carre'|'point'} [options.forme='carre']   forme des particules
 * @param {string} [options.image]                   URL de l'image recomposée (sinon l'<img> de .ddp__cible)
 * @param {string} [options.alt='']                  texte alternatif si l'image est créée par le module
 * @param {number} [options.nombre=3200]             particules au plus sur ordinateur (par élément)
 * @param {number} [options.nombreTelephone=1100]    particules au plus sous 700 px
 * @param {number} [options.champ=1800]              points d'ambiance (le « parmi des milliers »), 700 sous 700 px
 * @param {number} [options.longueur=1.6]            durée de l'épinglage, en hauteurs d'écran
 * @param {string} [options.epingle='(min-width: 700px) and (min-height: 500px)']  condition d'épinglage (sinon défilement simple)
 * @param {number} [options.duree=2.6]               durée d'une recomposition complète en mode apparition, en secondes
 * @param {number} [options.dpr=1.5]                 densité de pixels maximale du canvas (1 sur téléphone)
 */
export async function init(root, options = {}) {
  const o = { mode: 'defilement', disposition: 'nuage', forme: 'carre', image: '', alt: '', nombre: 3200, nombreTelephone: 1100, champ: 1800,
    longueur: 1.6, epingle: '(min-width: 700px) and (min-height: 500px)', duree: 2.6, dpr: 1.5, ...options };
  const s = await pret(o.mode === 'defilement' ? ['scrolltrigger'] : []);
  const cibleEl = root.querySelector('.ddp__cible');
  const sourceEl = root.querySelector('.ddp__source') || cibleEl;
  if (!cibleEl && !sourceEl) return { detruire() {} };
  const cible = cibleEl || sourceEl;
  let img = cible.querySelector('img');
  if (o.image) { if (!img) { img = document.createElement('img'); img.alt = o.alt; cible.appendChild(img); } img.src = o.image; }
  const meme = sourceEl === cible;
  const etapes = [...root.querySelectorAll('.ddp__etape')];
  const rejouer = root.querySelector('[data-ddp-rejouer]');

  const cv = document.createElement('canvas');
  cv.className = 'ddp__canvas'; cv.setAttribute('aria-hidden', 'true');
  root.prepend(cv);
  const ctx = cv.getContext('2d');
  const tel = s.telephone;
  const cap = tel ? o.nombreTelephone : o.nombre;
  const nChamp = tel ? Math.round(o.champ * 0.4) : o.champ;

  // Couleurs du champ, lues sur les variables du socle (aucune couleur en dur).
  const sonde = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgb = css => { sonde.clearRect(0, 0, 1, 1); sonde.fillStyle = '#000'; sonde.fillStyle = css || '#000'; sonde.fillRect(0, 0, 1, 1); const d = sonde.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
  let palette = [];
  const lirePalette = () => { const cs = getComputedStyle(root); palette = ['--couleur-texte', '--couleur-accent', '--couleur-secondaire'].map(v => rgb(cs.getPropertyValue(v).trim())); };

  let W = 0, H = 0, dpr = 1, champ = [], parts = [], p = meme && o.mode === 'apparition' ? 0.5 : 0, sale = true, leger = false;
  // Fenêtres de la progression : intact → défait (D0 → D1) → rangé → recomposé (R0 → R1) → intact.
  const D0 = 0.08, D1 = 0.46, R0 = 0.54, R1 = 0.92;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function graine(n) { let x = n; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; }

  // ---------- Échantillonnage ----------
  // Un élément HTML est redessiné dans un canvas (fonds, bordures, textes mot par mot, images), puis découpé en cellules.
  function rendreHTML(el, r) {
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    const c = off.getContext('2d', { willReadFrequently: true });
    const boite = e => {
      const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); if (!b.width || cs.display === 'none' || cs.visibility === 'hidden') return false;
      const x = b.left - r.left, y = b.top - r.top, rad = Math.min(b.height / 2, parseFloat(cs.borderTopLeftRadius) || 0);
      const forme = () => { c.beginPath(); c.roundRect ? c.roundRect(x, y, b.width, b.height, rad) : c.rect(x, y, b.width, b.height); };
      if (!/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) { c.fillStyle = cs.backgroundColor; forme(); c.fill(); }
      const bw = parseFloat(cs.borderTopWidth) || 0;
      if (bw && cs.borderTopStyle !== 'none') { c.strokeStyle = cs.borderTopColor; c.lineWidth = bw; forme(); c.stroke(); }
      if (e.tagName === 'IMG' && e.complete && e.naturalWidth) try { c.drawImage(e, x, y, b.width, b.height); } catch {}
      return true;
    };
    boite(el);
    for (const e of el.querySelectorAll('*')) boite(e);
    c.textBaseline = 'middle';
    const marche = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const plage = document.createRange();
    for (let n = marche.nextNode(); n; n = marche.nextNode()) {
      const t = n.textContent; if (!t.trim()) continue;
      const cs = getComputedStyle(n.parentElement); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      c.fillStyle = cs.color;
      if ('letterSpacing' in c) c.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      const maj = cs.textTransform === 'uppercase';
      const mots = /\S+/g; let m;
      while ((m = mots.exec(t))) {
        plage.setStart(n, m.index); plage.setEnd(n, m.index + m[0].length);
        const b = plage.getBoundingClientRect(); if (!b.width) continue;
        c.fillText(maj ? m[0].toUpperCase() : m[0], b.left - r.left, b.top - r.top + b.height / 2);
      }
    }
    return c.getImageData(0, 0, w, h).data;
  }

  // Une cellule par particule : position (repère du canvas), taille et couleur.
  function echantillonner(el, rr, rnd) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return { liste: [], pas: 4 };
    const pas = Math.max(4, Math.sqrt(r.width * r.height / cap));
    const cols = Math.max(1, Math.floor(r.width / pas)), rows = Math.max(1, Math.floor(r.height / pas));
    const px = r.width / cols, py = r.height / rows;
    const x0 = r.left - rr.left, y0 = r.top - rr.top;
    const liste = [];
    const im = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
    let data = null, mode = 'centre', w = 0;
    if (im && im.complete && im.naturalWidth && el === cible) {
      // Image : réduite directement à la grille (couleur moyenne de chaque cellule), recadrée comme object-fit: cover.
      const off = document.createElement('canvas'); off.width = cols; off.height = rows;
      const c = off.getContext('2d', { willReadFrequently: true });
      const ri = im.naturalWidth / im.naturalHeight, rb = r.width / r.height;
      let sw = im.naturalWidth, sh = im.naturalHeight;
      if (ri > rb) sw = sh * rb; else sh = sw / rb;
      const [fx, fy] = (getComputedStyle(im).objectPosition || '50% 50%').split(' ').map(v => (parseFloat(v) || 50) / 100);
      try {
        c.drawImage(im, (im.naturalWidth - sw) * fx, (im.naturalHeight - sh) * fy, sw, sh, 0, 0, cols, rows);
        data = c.getImageData(0, 0, cols, rows).data; mode = 'grille'; w = cols;
      } catch { data = null; }
    }
    if (!data) { try { data = rendreHTML(el, r); w = Math.max(1, Math.round(r.width)); } catch { return { liste: [], pas }; } }
    const rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const cx = (i + 0.5) * px, cy = (j + 0.5) * py;
      // coins arrondis de l'élément : on n'y pose pas de cellule
      if (rad) { const dx = Math.max(0, rad - cx, cx - (r.width - rad)), dy = Math.max(0, rad - cy, cy - (r.height - rad)); if (dx * dx + dy * dy > rad * rad) continue; }
      const k = mode === 'grille' ? (j * cols + i) * 4 : (Math.min(Math.round(r.height) - 1, cy | 0) * w + Math.min(w - 1, cx | 0)) * 4;
      if (data[k + 3] < 40) continue;
      liste.push({ x: x0 + i * px, y: y0 + j * py, u: i / cols, v: j / rows, r: data[k], g: data[k + 1], b: data[k + 2] });
    }
    return { liste, pas: Math.max(px, py) };
  }

  function preparer() {
    lirePalette();
    dpr = Math.min(devicePixelRatio || 1, tel ? 1 : o.dpr);
    W = root.clientWidth; H = root.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rnd = graine(12345);
    const rr = root.getBoundingClientRect();
    const S = s.calme ? { liste: [], pas: 4 } : echantillonner(sourceEl, rr, rnd);
    const T = s.calme ? S : meme ? S : echantillonner(cible, rr, rnd);
    const N = Math.max(S.liste.length, T.liste.length);
    // Emplacements de rangement : nuage aléatoire ou grille régulière, partagés avec les points d'ambiance.
    const total = N + nChamp;
    let places;
    if (o.disposition === 'grille') {
      const g = Math.max(6, Math.sqrt(W * H / total));
      const cols = Math.floor(W / g), rows = Math.floor(H / g);
      const ox = (W - (cols - 1) * g) / 2, oy = (H - (rows - 1) * g) / 2;
      places = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) places.push([ox + i * g, oy + j * g]);
      for (let i = places.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [places[i], places[k]] = [places[k], places[i]]; }
      while (places.length < total) places.push([rnd() * W, rnd() * H]);
    } else places = Array.from({ length: total }, () => [rnd() * W, rnd() * H]);
    const couleurChamp = () => (rnd() < 0.8 ? 0 : rnd() < 0.6 ? 1 : 2);
    champ = places.slice(N).map(([x, y]) => ({ x, y, s: 0.8 + rnd() * 1.4, ph: rnd() * 6.28, c: couleurChamp(), a: 0.18 + rnd() * 0.42 }));
    // Les cibles sont mélangées : chaque carré de la fiche finit ailleurs dans l'image.
    const tl = T.liste.slice();
    if (!meme) for (let i = tl.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [tl[i], tl[k]] = [tl[k], tl[i]]; }
    parts = [];
    for (let i = 0; i < N; i++) {
      const a = S.liste[i] || null, b = (meme ? S.liste[(i * 7919) % N] : tl[i]) || null;
      const [fx, fy] = places[i]; const c = palette[couleurChamp()];
      parts.push({ a, b, fx, fy, cr: c[0], cg: c[1], cb: c[2], d1: (a ? a.u : rnd()) * 0.32 + rnd() * 0.13, d2: (b ? 1 - b.v : rnd()) * 0.3 + rnd() * 0.15,
        ph: rnd() * 6.28, lift: 20 + rnd() * 80, sa: S.pas, sb: T.pas, pt: 1.4 + rnd() * 1.2 });
    }
    sale = true;
  }

  // ---------- Dessin ----------
  const point = o.forme === 'point';
  const grille = o.disposition === 'grille';
  function dessiner(t) {
    ctx.clearRect(0, 0, W, H);
    const calme = s.calme || leger;
    for (const f of champ) {
      const c = palette[f.c];
      ctx.globalAlpha = f.a * (calme ? 0.85 : 0.7 + 0.3 * Math.sin(t * 0.8 + f.ph));
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      const dx = calme || grille ? 0 : Math.sin(t * 0.25 + f.ph) * 5, dy = calme || grille ? 0 : Math.cos(t * 0.21 + f.ph) * 5;
      if (point) { ctx.beginPath(); ctx.arc(f.x + dx, f.y + dy, f.s * 0.6, 0, 6.2832); ctx.fill(); } else ctx.fillRect(f.x + dx, f.y + dy, f.s, f.s);
    }
    ctx.globalAlpha = 1;
    if (p <= D0 || p >= R1) return;
    const q1 = (p - D0) / (D1 - D0), q2 = (p - R0) / (R1 - R0);
    for (const k of parts) {
      const e1 = ease(clamp01((q1 - k.d1) / 0.55)), e2 = ease(clamp01((q2 - k.d2) / 0.55));
      const derive = calme || grille ? 0 : Math.sin(t * 0.25 + k.ph) * 5;
      let x, y, taille, r, g, b, al;
      if (e2 <= 0) {
        const A = k.a;
        if (A) { x = A.x + (k.fx - A.x) * e1; y = A.y + (k.fy - A.y) * e1 - Math.sin(e1 * Math.PI) * k.lift; taille = k.sa + (k.pt - k.sa) * e1; r = A.r + (k.cr - A.r) * e1; g = A.g + (k.cg - A.g) * e1; b = A.b + (k.cb - A.b) * e1; al = 1 - 0.3 * e1; }
        else { x = k.fx; y = k.fy; taille = k.pt; r = k.cr; g = k.cg; b = k.cb; al = 0.7 * e1; }
        x += derive * e1; y += derive * 0.8 * e1;
      } else {
        const B = k.b;
        if (B) { x = k.fx + (B.x - k.fx) * e2; y = k.fy + (B.y - k.fy) * e2 - Math.sin(e2 * Math.PI) * k.lift; taille = k.pt + (k.sb - k.pt) * e2; r = k.cr + (B.r - k.cr) * e2; g = k.cg + (B.g - k.cg) * e2; b = k.cb + (B.b - k.cb) * e2; al = 0.7 + 0.3 * e2; }
        else { x = k.fx; y = k.fy; taille = k.pt; r = k.cr; g = k.cg; b = k.cb; al = 0.7 * (1 - e2); }
        x += derive * (1 - e2); y += derive * 0.8 * (1 - e2);
      }
      if (al <= 0.01) continue;
      ctx.globalAlpha = al;
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      // Pleine cellule (+0,6 px contre les jours) à l'état intact ; carré ou point une fois en vol.
      const plein = (e2 <= 0 ? e1 : 1 - e2) < 0.04;
      if (point && !plein) { ctx.beginPath(); ctx.arc(x + taille / 2, y + taille / 2, taille / 2, 0, 6.2832); ctx.fill(); }
      else ctx.fillRect(x, y, plein ? taille + 0.6 : taille, plein ? taille + 0.6 : taille);
    }
    ctx.globalAlpha = 1;
  }

  // Vrais éléments : affichés seulement quand ils sont intacts.
  let phase = -1;
  function appliquer() {
    const avant = p <= D0, apres = p >= R1;
    if (meme) cible.classList.toggle('est-forme', avant || apres);
    else { sourceEl.classList.toggle('est-defait', !avant); cible.classList.toggle('est-forme', apres); }
    const n = p < 0.3 ? 0 : p < 0.7 ? 1 : 2;
    if (n !== phase) { phase = n; etapes.forEach((e, i) => e.classList.toggle('est-active', i === n)); }
  }
  const poser = v => { if (v === p) return; p = v; sale = true; appliquer(); };

  const pretImage = () => !img || (img.complete && img.naturalWidth) ? Promise.resolve() : new Promise(ok => {
    if (img.loading === 'lazy') img.loading = 'eager';
    img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); setTimeout(ok, 3000);
  });

  // ---------- Mode calme : points immobiles, composition fixe ----------
  if (s.calme) {
    root.classList.add('ddp--calme');
    etapes.forEach(e => e.classList.add('est-active'));
    const fixe = () => { preparer(); p = 1; dessiner(0); };
    fixe();
    let att = 0; const surResize = () => { clearTimeout(att); att = setTimeout(fixe, 200); };
    addEventListener('resize', surResize);
    return { detruire() { removeEventListener('resize', surResize); clearTimeout(att); cv.remove(); root.classList.remove('ddp--calme'); } };
  }

  root.classList.add('ddp--vivant');
  appliquer();
  await pretImage();
  if (img?.decode) try { await img.decode(); } catch {}
  await document.fonts?.ready;
  preparer();

  // Boucle : scintillement du champ, s'arrête hors écran ; se limite aux changements si une image dépasse 16 ms trois fois de suite.
  let lents = 0, lecture = null;
  const tour = s.boucle(root, (t, dt) => {
    if (lecture) { poser(Math.min(1, p + dt / 1000 / lecture.duree)); if (p >= 1) lecture = null; }
    if (leger && !sale) return;
    const t0 = performance.now(); dessiner(t / 1000); sale = false;
    if (!leger) { lents = performance.now() - t0 > 16 ? lents + 1 : 0; if (lents >= 3) leger = true; }
  });

  const nettoyages = [];
  let resizeAtt = 0;
  const reechantillonner = () => { preparer(); dessiner(performance.now() / 1000); };

  if (o.mode === 'defilement') {
    const { gsap, ScrollTrigger } = s;
    const mm = gsap.matchMedia();
    mm.add(o.epingle, () => {
      root.classList.add('ddp--epingle');
      const st = ScrollTrigger.create({
        trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true, scrub: 0.6, invalidateOnRefresh: true,
        onToggle: self => root.classList.toggle('est-epingle', self.isActive),
        onUpdate: self => poser(Math.min(1, self.progress * 1.06)),
      });
      return () => { st.kill(); root.classList.remove('ddp--epingle', 'est-epingle'); };
    });
    mm.add(`not all and ${o.epingle}`, () => {
      // Sans épinglage : la fiche se défait pendant que la scène traverse l'écran, défaite quand son haut passe aux deux tiers de l'écran, recomposée quand son centre atteint le tiers haut.
      const st = ScrollTrigger.create({ trigger: root.querySelector('.ddp__plan') || root, start: 'top 62%', end: 'center 30%', scrub: 0.6, onUpdate: self => poser(self.progress) });
      return () => st.kill();
    });
    ScrollTrigger.addEventListener('refresh', reechantillonner);
    nettoyages.push(() => { mm.revert(); ScrollTrigger.removeEventListener('refresh', reechantillonner); });
    s.rafraichir();
  } else {
    const jouer = depuis => { poser(depuis); lecture = { duree: o.duree * (1 - depuis) }; };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); jouer(p); } }, { threshold: 0.35 });
    io.observe(root.querySelector('.ddp__plan') || root);
    const surClic = () => { if (!lecture) jouer(0); };
    if (rejouer) { rejouer.hidden = false; rejouer.addEventListener('click', surClic); }
    const surResize = () => { clearTimeout(resizeAtt); resizeAtt = setTimeout(reechantillonner, 200); };
    addEventListener('resize', surResize);
    nettoyages.push(() => { io.disconnect(); rejouer?.removeEventListener('click', surClic); removeEventListener('resize', surResize); clearTimeout(resizeAtt); });
  }

  return {
    /** progression manuelle (0 → 1), pour piloter le module depuis une autre animation */
    progression: v => poser(clamp01(v)),
    detruire() {
      tour.arreter(); nettoyages.forEach(f => f()); cv.remove();
      root.classList.remove('ddp--vivant', 'ddp--epingle', 'est-epingle');
      sourceEl.classList.remove('est-defait'); cible.classList.remove('est-forme');
    },
  };
}
