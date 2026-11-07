// Plat fumant : de la vapeur monte d'une photo de plat (soupe, plat mijoté, café, pain sorti du four) et s'écarte sous la souris
// ou sous le doigt, puis se referme lentement. Canvas 2D léger, en demi-résolution : volutes pré-dessinées une fois,
// portées par un courant doux (pas de dégradé recalculé à chaque image). La boucle s'arrête hors de l'écran et onglet caché.
// La source de vapeur se place en fractions de l'image (data-vapeur), recalculée selon le recadrage (object-fit: cover).
// Mode calme, « réduire les animations », sans JavaScript : la photo seule.
import { pret } from '../../socle/socle.js';

/** Couleur CSS (variables, color-mix) → [r, g, b] 0-255, lue par un élément témoin puis par un canvas d'un pixel. */
function rgb(root, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  root.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = '#010203'; ctx.fillStyle = c;
  if (ctx.fillStyle === '#010203') return [255, 255, 255];
  ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]];
}

/** Volutes : une bouffée ronde et trois filaments, dessinés une fois dans la couleur de la vapeur. */
function sprites([r, g, b]) {
  const bouffee = document.createElement('canvas'); bouffee.width = bouffee.height = 64;
  const x = bouffee.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  [[0, 1], [0.25, 0.72], [0.5, 0.36], [0.75, 0.1], [1, 0]].forEach(([o, a]) => gr.addColorStop(o, `rgba(${r},${g},${b},${a})`));
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const filaments = [0, 1, 2].map((k) => {
    const c = document.createElement('canvas'); c.width = 96; c.height = 224; const y = c.getContext('2d');
    // Une volute : de petites bouffées le long d'une courbe en S, plus fines aux extrémités.
    const n = 26, amp = 14 + k * 7, tours = 1.1 + k * 0.35;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), py = 200 - t * 176, px = 48 + Math.sin(t * Math.PI * tours + k) * amp;
      const rr = 7 + Math.sin(t * Math.PI) * (13 + k * 3);
      y.globalAlpha = 0.16 + Math.sin(t * Math.PI) * 0.22;
      y.drawImage(bouffee, px - rr, py - rr, rr * 2, rr * 2);
    }
    return c;
  });
  return { bouffee, filaments };
}

/** Sources : "x y l" en fractions de l'image (centre de la surface chaude et sa largeur), séparées par des virgules. */
function lireSources(texte) {
  const s = String(texte || '').split(',').map((t) => t.trim().split(/\s+/).map(Number)).filter((v) => v.length >= 2 && v.every(Number.isFinite));
  return (s.length ? s : [[0.5, 0.6, 0.4]]).map(([x, y, l = 0.4]) => ({ x, y, l }));
}

/**
 * @param {HTMLElement} root  figure.fumant[data-module="plat-fumant"] contenant une img (ou picture > img)
 * @param {object} [options]
 * @param {string} [options.sources]     comme data-vapeur : "x y l, x y l" (fractions de l'image), ".5 .6 .4" par défaut
 * @param {number} [options.densite=1]   nombre de volutes (0,5 discret, 1,6 marmite qui bout)
 * @param {number} [options.intensite=1] opacité de la vapeur
 * @param {number} [options.hauteur=.5]  hauteur de la montée, en fraction de la hauteur de la photo
 * @param {number} [options.vitesse=1]   vitesse de la montée
 * @param {number} [options.vent=0]      dérive latérale constante (-1 vers la gauche, 1 vers la droite)
 * @param {number} [options.rayon=.17]   rayon d'écart sous le pointeur, en fraction du petit côté de la photo
 * @param {number} [options.qualite=.5]  résolution du canvas par rapport à l'écran (la vapeur est floue : .5 suffit)
 */
export async function init(root, options = {}) {
  const o = { densite: 1, intensite: 1, hauteur: 0.5, vitesse: 1, vent: 0, rayon: 0.17, qualite: 0.5, ...options };
  const s = await pret([]);
  const img = root.querySelector('img');
  if (s.calme || !img) return { detruire() {} };

  const canvas = document.createElement('canvas');
  canvas.className = 'fumant__vapeur'; canvas.setAttribute('aria-hidden', 'true');
  root.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return { detruire() {} }; }
  const { bouffee, filaments } = sprites(rgb(root, 'var(--fumant-couleur)'));
  const sources = lireSources(o.sources ?? root.dataset.vapeur);

  // Géométrie : taille affichée, recadrage de l'image (object-fit, object-position) et sources en pixels.
  let W = 0, H = 0, k = 1, srcPx = [];
  function mesurer() {
    const r = root.getBoundingClientRect(); W = r.width; H = r.height;
    k = Math.max(0.25, Math.min(1, o.qualite * Math.min(2, devicePixelRatio || 1)));
    canvas.width = Math.max(1, Math.round(W * k)); canvas.height = Math.max(1, Math.round(H * k));
    const ib = img.getBoundingClientRect(), cs = getComputedStyle(img);
    const iw = img.naturalWidth || ib.width, ih = img.naturalHeight || ib.height;
    let dw = ib.width, dh = ib.height, ox = 0, oy = 0;
    if (iw && ih && (cs.objectFit === 'cover' || cs.objectFit === 'contain')) {
      const e = cs.objectFit === 'cover' ? Math.max(ib.width / iw, ib.height / ih) : Math.min(ib.width / iw, ib.height / ih);
      dw = iw * e; dh = ih * e;
      const [px, py] = cs.objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
      ox = (ib.width - dw) * px; oy = (ib.height - dh) * py;
    }
    const bx = ib.left - r.left + ox, by = ib.top - r.top + oy;
    srcPx = sources.map((q) => ({ x: bx + q.x * dw, y: by + q.y * dh, l: Math.max(20, q.l * dw) }));
  }

  // Volutes : naissent dans l'ellipse de la surface chaude, montent, s'élargissent, s'effacent.
  const parts = [];
  const hasard = (a, b) => a + Math.random() * (b - a);
  function naitre() {
    const q = srcPx[(Math.random() * srcPx.length) | 0]; if (!q) return;
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * 0.92;
    const fil = Math.random() < 0.62;
    parts.push({ x: q.x + Math.cos(a) * d * q.l / 2, y: q.y + Math.sin(a) * d * q.l * 0.14, vx: 0, vy: -hasard(0.05, 0.09) * H * o.vitesse,
      age: 0, vie: hasard(3.2, 5.6) / Math.sqrt(o.vitesse), t0: q.l * hasard(0.06, 0.12), t1: q.l * hasard(0.32, 0.55), ph: Math.random() * 6.28,
      sp: fil ? filaments[(Math.random() * 3) | 0] : bouffee, fil, rot: hasard(-0.3, 0.3), a: hasard(0.5, 1) * (fil ? 0.42 : 0.2) });
  }

  // Pointeur : position, vitesse lissée et force qui retombe en 0,7 s après le dernier mouvement.
  const p = { x: 0, y: 0, vx: 0, vy: 0, force: 0, t: 0 };
  const bouger = (e) => {
    const r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = performance.now();
    if (p.t && t - p.t < 120) { const dt = Math.max(8, t - p.t) / 1000; p.vx += ((x - p.x) / dt - p.vx) * 0.3; p.vy += ((y - p.y) / dt - p.vy) * 0.3; } else { p.vx = p.vy = 0; }
    p.x = x; p.y = y; p.t = t; p.force = 1;
  };
  root.addEventListener('pointermove', bouger, { passive: true });
  root.addEventListener('pointerdown', bouger, { passive: true });

  let reserve = 0, temps = 0;
  function avancer(dt) {
    temps += dt;
    const cadence = 9 * o.densite * srcPx.reduce((n, q) => n + Math.min(2.2, q.l / 240), 0);
    reserve += cadence * dt;
    while (reserve >= 1 && parts.length < 140 * o.densite) { naitre(); reserve -= 1; }
    if (reserve > 1) reserve = 0;
    p.force = Math.max(0, p.force - dt / 0.7); p.vx *= Math.exp(-dt * 3); p.vy *= Math.exp(-dt * 3);
    const R = o.rayon * Math.min(W, H), montee = o.hauteur * H;
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.age += dt;
      const t = q.age / q.vie;
      if (t >= 1) { parts.splice(i, 1); continue; }
      // Courant : ondulations qui montent avec la vapeur, plus fortes en haut (la volute se défait).
      const c = Math.sin(q.y * 0.011 + temps * 0.9 + q.ph) + 0.6 * Math.sin(q.y * 0.027 - temps * 1.7 + q.ph * 2) + 0.35 * Math.sin(q.x * 0.019 + temps * 0.5);
      q.vx += (c * (10 + 34 * t) + o.vent * 24) * dt;
      q.vx *= Math.exp(-dt * 1.4);
      q.vy += -montee * 0.02 * dt; q.vy *= Math.exp(-dt * 0.35);
      if (p.force > 0 && R > 0) {
        const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
        if (d < R) { const f = (1 - d / R) ** 2 * p.force; q.vx += (dx / d * 520 * f + p.vx * 0.9 * f) * dt; q.vy += (dy / d * 300 * f + p.vy * 0.5 * f) * dt; q.ecart = Math.max(q.ecart || 0, f); }
      }
      if (q.ecart) q.ecart = Math.max(0, q.ecart - dt * 0.9);
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += (q.vx / Math.max(40, H)) * dt * 2;
    }
  }
  function dessiner() {
    ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, W, H);
    for (const q of parts) {
      const t = q.age / q.vie;
      const env = Math.min(1, t / 0.16) * (1 - Math.max(0, (t - 0.42) / 0.58)) ** 1.6;
      const a = q.a * env * o.intensite * (1 - 0.75 * (q.ecart || 0));
      if (a < 0.004) continue;
      const taille = q.t0 + (q.t1 - q.t0) * (1 - (1 - t) ** 2);
      ctx.globalAlpha = Math.min(1, a);
      if (q.fil) {
        const h = taille * 2.3, l = taille * 0.95;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot + Math.atan2(q.vx, -q.vy) * 0.6);
        ctx.drawImage(q.sp, -l / 2, -h * 0.82, l, h); ctx.restore();
      } else ctx.drawImage(q.sp, q.x - taille, q.y - taille * 0.85, taille * 2, taille * 1.7);
    }
    ctx.globalAlpha = 1;
  }

  mesurer();
  const ro = new ResizeObserver(() => { const w0 = W, h0 = H; mesurer(); if (w0 && h0) for (const q of parts) { q.x *= W / w0; q.y *= H / h0; } });
  ro.observe(root);
  if (!img.complete) img.addEventListener('load', mesurer, { once: true });
  // La vapeur est déjà là au premier affichage : quelques secondes simulées d'avance.
  for (let i = 0; i < 150; i++) avancer(1 / 30);
  dessiner();
  root.classList.add('est-actif');
  const b = s.boucle(root, (t, dt) => { avancer(Math.min(0.05, dt / 1000)); dessiner(); });

  return {
    /** Change les sources sans recharger ("x y l, …"). */
    sources(texte) { sources.splice(0, sources.length, ...lireSources(texte)); mesurer(); },
    detruire() { b.arreter(); ro.disconnect(); root.removeEventListener('pointermove', bouger); root.removeEventListener('pointerdown', bouger); canvas.remove(); root.classList.remove('est-actif'); },
  };
}
