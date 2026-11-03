// Lumière au pointeur : une image plongée dans l'ombre qu'une source de lumière (lampe, bougie, torche) éclaire là où
// passent la souris ou le doigt. WebGL (OGL) : relief tiré de la luminance de l'image, halo chaud, reflet, vacillement,
// poussière qui brille dans le faisceau. Le pointeur parti, la lumière revient lentement à son repos : promenade douce ou
// point d'intérêt (option focus). Sans WebGL : même lumière en masque CSS radial animé. Mode calme et « réduire les
// animations » : image éclairée à son point d'intérêt, rien ne bouge. Sans JavaScript : la même chose, en CSS.
import { pret } from '../../socle/socle.js';

const VERT = 'attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
const FRAG = `precision highp float;
uniform sampler2D tMap; uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uFocus;
uniform vec2 uLum; uniform float uRayon; uniform float uOmbre; uniform float uFlamme; uniform float uTemps;
uniform vec3 uChaud; uniform float uPoussiere; uniform float uRelief; uniform float uDur;
varying vec2 vUv;
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 couvre(vec2 v){ float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y; vec2 e = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 f = vec2(uFocus.x, 1.0 - uFocus.y); return (v - 0.5) * e + 0.5 + (f - 0.5) * (1.0 - e); }
float lu(vec2 uv){ return dot(texture2D(tMap, uv).rgb, vec3(.299, .587, .114)); }
void main(){
  vec2 uv = couvre(vUv);
  vec3 alb = texture2D(tMap, uv).rgb;
  // Relief : normale tirée des variations de luminance (bois, métal et tissus prennent la lumière rasante).
  vec2 e = 1.5 / uRes;
  float hx = lu(uv + vec2(e.x, 0.0)) - lu(uv - vec2(e.x, 0.0));
  float hy = lu(uv + vec2(0.0, e.y)) - lu(uv - vec2(0.0, e.y));
  vec3 n = normalize(vec3(-hx * uRelief, -hy * uRelief, 1.0));
  vec2 frag = vUv * uRes;
  float d = length(frag - uLum) / uRayon;
  // Halo doux (lampe, bougie) ou faisceau à bord net (torche).
  float doux = exp(-d * d * 1.7);
  float faisceau = smoothstep(1.0, 0.84, d) * (0.7 + 0.3 * exp(-d * d * 5.0)) + exp(-d * d * 0.5) * 0.08;
  float att = mix(doux, faisceau, uDur);
  vec3 L = normalize(vec3(uLum, uRayon * 0.55) - vec3(frag, 0.0));
  float diff = mix(1.0, max(dot(n, L), 0.0) * 1.3, 0.65);
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 28.0);
  vec3 col = alb * (uOmbre + att * uFlamme * 1.9 * uChaud * diff) + spec * att * uFlamme * uChaud * 0.35;
  // Poussière : deux couches de grains qui tombent et scintillent, visibles seulement dans la lumière.
  float g1 = hash(floor((frag + vec2(uTemps * 6.0, uTemps * 15.0)) / 3.0));
  float g2 = hash(floor((frag + vec2(-uTemps * 4.0, uTemps * 8.0)) / 2.0) + 17.0);
  float pou = (step(.9992, g1) * (.55 + .45 * sin(uTemps * 2.3 + g1 * 80.0)) * 2.2 + step(.9995, g2) * 1.4) * att * att;
  col += pou * uPoussiere * uFlamme * mix(uChaud, vec3(1.0), 0.4);
  col *= smoothstep(1.55, 0.3, length((vUv - 0.5) * vec2(1.2, 1.0)));
  gl_FragColor = vec4(col, 1.0);
}`;

// Réglages par source ; chacun peut être remplacé par l'option du même nom.
const SOURCES = {
  lampe: { rayon: .3, ombre: .15, vacillement: .04, poussiere: 1, dur: 0, chaleur: .55 },
  bougie: { rayon: .24, ombre: .12, vacillement: .16, poussiere: .6, dur: 0, chaleur: .8 },
  torche: { rayon: .16, ombre: .07, vacillement: 0, poussiere: .8, dur: 1, chaleur: .25 },
};

function rgb(root, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  root.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
}
const css = ([r, g, b], a = 1) => `rgba(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0},${a})`;
const mel = (a, b, k) => a.map((v, i) => v * (1 - k) + b[i] * k);

// Image de démonstration neutre, peinte d'après les variables : mur de planches, étagère et objets autour du point d'intérêt,
// plateau en bas. Assez claire : c'est la version « en pleine lumière », le shader la plonge dans l'ombre.
function imageNeutre(root, w, h, [fx, fy]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const fond = rgb(root, 'var(--couleur-fond)'), sec = rgb(root, 'var(--couleur-secondaire)'), acc = rgb(root, 'var(--couleur-accent)'), txt = rgb(root, 'var(--couleur-texte)');
  let s = 7; const ha = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bois = mel(mel(sec, txt, .18), fond, .15);
  const u = w > h ? h / 100 : w / 120; // unité
  // Planches verticales, veinées.
  const lp = Math.max(60, w / 13);
  for (let px = 0, k = 0; px < w; px += lp, k++) {
    const t = mel(bois, k % 2 ? fond : txt, .06 + ha() * .08);
    x.fillStyle = css(t); x.fillRect(px, 0, lp, h);
    for (let v = 0; v < 18; v++) {
      x.strokeStyle = css(ha() > .5 ? txt : fond, .05 + ha() * .08); x.lineWidth = 1 + ha() * 2;
      const vx = px + ha() * lp; x.beginPath(); x.moveTo(vx, 0);
      x.bezierCurveTo(vx + (ha() - .5) * 18, h * .3, vx + (ha() - .5) * 18, h * .7, vx + (ha() - .5) * 10, h); x.stroke();
    }
    x.fillStyle = css(fond, .55); x.fillRect(px, 0, 3, h);
    x.fillStyle = css(txt, .12); x.fillRect(px + 3, 0, 2, h);
  }
  // Étagère sous le point d'intérêt.
  const ey = Math.min(h * .8, fy * h + 14 * u), ex0 = Math.max(0, fx * w - 40 * u), ex1 = Math.min(w, fx * w + 40 * u);
  const ombreSous = x.createLinearGradient(0, ey, 0, ey + 9 * u); ombreSous.addColorStop(0, css(fond, .7)); ombreSous.addColorStop(1, css(fond, 0));
  x.fillStyle = ombreSous; x.fillRect(ex0, ey, ex1 - ex0, 9 * u);
  x.fillStyle = css(mel(bois, txt, .25)); x.fillRect(ex0, ey - 2.2 * u, ex1 - ex0, 2.6 * u);
  x.fillStyle = css(txt, .3); x.fillRect(ex0, ey - 2.2 * u, ex1 - ex0, .4 * u);
  // Objets posés : bocal, bouteilles, bol, boîte (volumes en dégradés pour que la lumière les modèle).
  const volume = (x0, y0, lw, lh, col, r) => {
    const g = x.createLinearGradient(x0, 0, x0 + lw, 0);
    g.addColorStop(0, css(mel(col, fond, .45))); g.addColorStop(.35, css(mel(col, txt, .35))); g.addColorStop(1, css(mel(col, fond, .6)));
    x.fillStyle = g; x.beginPath(); x.roundRect(x0, y0, lw, lh, r); x.fill();
    x.fillStyle = css(txt, .35); x.fillRect(x0 + lw * .22, y0 + lh * .12, Math.max(2, lw * .06), lh * .6);
  };
  const base = ey - 2.2 * u, cx = fx * w;
  volume(cx - 30 * u, base - 16 * u, 13 * u, 16 * u, mel(acc, sec, .3), 2.5 * u);           // bocal
  x.fillStyle = css(mel(acc, txt, .3)); x.fillRect(cx - 31 * u, base - 18 * u, 15 * u, 3 * u); // couvercle
  volume(cx - 13 * u, base - 26 * u, 7 * u, 26 * u, mel(sec, txt, .15), 1.5 * u);          // bouteille
  volume(cx - 11.3 * u, base - 33 * u, 3.6 * u, 8 * u, mel(sec, txt, .15), 1 * u);         // goulot
  volume(cx - 3 * u, base - 19 * u, 6 * u, 19 * u, mel(acc, fond, .25), 1.5 * u);
  volume(cx - 1.6 * u, base - 24 * u, 3.2 * u, 6 * u, mel(acc, fond, .25), 1 * u);
  x.save(); x.beginPath(); x.ellipse(cx + 15 * u, base - 5 * u, 11 * u, 6 * u, 0, 0, Math.PI); x.closePath();
  const gb = x.createLinearGradient(cx + 4 * u, 0, cx + 26 * u, 0); gb.addColorStop(0, css(mel(txt, sec, .4))); gb.addColorStop(.4, css(txt)); gb.addColorStop(1, css(mel(txt, fond, .6)));
  x.fillStyle = gb; x.fill(); x.restore();                                                    // bol
  volume(cx + 27 * u, base - 12 * u, 12 * u, 12 * u, mel(bois, acc, .35), .6 * u);          // boîte
  // Crochets et outil suspendu au-dessus de l'étagère.
  x.strokeStyle = css(mel(txt, fond, .3)); x.lineWidth = 1.2 * u; x.lineCap = 'round';
  const oy = Math.max(6 * u, ey - 48 * u);
  for (const dx of [-18, 4, 24]) { x.beginPath(); x.arc(cx + dx * u, oy, 1.1 * u, 0, Math.PI * 2); x.stroke(); }
  x.beginPath(); x.moveTo(cx + 4 * u, oy + 1.5 * u); x.lineTo(cx + 4 * u, oy + 20 * u); x.stroke();
  x.beginPath(); x.arc(cx + 4 * u, oy + 23 * u, 3 * u, 0, Math.PI * 2); x.stroke();
  // Plateau en bas.
  const py = h * .86;
  const gp = x.createLinearGradient(0, py, 0, h); gp.addColorStop(0, css(mel(bois, txt, .2))); gp.addColorStop(1, css(mel(bois, fond, .5)));
  x.fillStyle = gp; x.fillRect(0, py, w, h - py);
  for (let v = 0; v < 60; v++) { x.strokeStyle = css(ha() > .5 ? txt : fond, .06); x.lineWidth = 1; const vy = py + ha() * (h - py); x.beginPath(); x.moveTo(0, vy); x.lineTo(w, vy + (ha() - .5) * 6); x.stroke(); }
  x.fillStyle = css(txt, .25); x.fillRect(0, py, w, 2);
  return c;
}

/**
 * @param {HTMLElement} root  section.lum (contient .lum__fond, canvas.lum__canvas, .lum__ombre)
 * @param {object} [options]
 * @param {string} [options.image]          URL de la photo ; sinon l'<img> (ou <picture>) de .lum__fond ; sinon image neutre générée
 * @param {number[]} [options.focus=[.66,.42]] point d'intérêt (x, y entre 0 et 1) : recadrage, repos de la lumière, état calme
 * @param {'promenade'|'focus'} [options.repos='promenade'] sans pointeur : la lumière se promène autour du point d'intérêt, ou s'y fixe
 * @param {'lampe'|'bougie'|'torche'} [options.source='lampe'] préréglage (rayon, ombre, vacillement, poussière, bord, chaleur)
 * @param {number} [options.rayon]          rayon du halo, en part du plus grand côté (lampe .3, bougie .24, torche .16)
 * @param {number} [options.ombre]          lumière ambiante hors du halo, 0 à .4 (lampe .15)
 * @param {number} [options.vacillement]    amplitude du vacillement, 0 à .3 (bougie .16)
 * @param {number} [options.poussiere]      poussière qui brille dans la lumière, 0 à 1.5 (0 pour couper)
 * @param {number} [options.relief=6]       relief tiré de l'image (0 : lumière plate)
 * @param {string} [options.teinte]         couleur CSS de la lumière, mêlée de blanc selon la chaleur ; --couleur-accent par défaut
 * @param {number} [options.delai=900]      ms avant que la lumière, le pointeur parti, ne revienne à son repos
 * @param {number} [options.dpr=1.5]        densité de pixels maximale sur ordinateur (1 sous 700 px)
 * @returns {Promise<{detruire: Function, mesure: Function}>}
 */
export async function init(root, options = {}) {
  const src = SOURCES[options.source] ? options.source : 'lampe';
  const o = { image: null, focus: [.66, .42], repos: 'promenade', relief: 6, teinte: 'var(--couleur-accent)', delai: 900, dpr: 1.5, ...SOURCES[src], ...options };
  root.dataset.source = src;
  const fondEl = root.querySelector('.lum__fond');
  const canvas = root.querySelector('.lum__canvas');
  let img = fondEl?.querySelector('img');
  if (o.image && fondEl) {
    fondEl.querySelector('picture, img')?.remove();
    img = document.createElement('img'); img.alt = ''; img.decoding = 'async';
    if (new URL(o.image, location.href).origin !== location.origin) img.crossOrigin = 'anonymous';
    img.src = o.image; fondEl.appendChild(img);
  }
  const [fx, fy] = o.focus;
  root.style.setProperty('--lum-fx', fx * 100 + '%'); root.style.setProperty('--lum-fy', fy * 100 + '%');
  if (img) img.style.objectPosition = `${fx * 100}% ${fy * 100}%`;

  const s = await pret([]);
  const prete = img ? (img.complete ? Promise.resolve() : new Promise(ok => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); })) : Promise.resolve();
  await prete;
  const imgOk = img && img.naturalWidth > 0;
  // Sans photo : image neutre, aussi posée en fond CSS pour le repli.
  let source = imgOk ? img : null;
  if (!source && fondEl) {
    const portrait = root.clientWidth < root.clientHeight;
    source = portrait ? imageNeutre(root, 900, 1500, o.focus) : imageNeutre(root, 1600, 1000, o.focus);
    fondEl.style.backgroundImage = `url(${source.toDataURL('image/jpeg', .85)})`;
    root.classList.add('lum--peinte');
  }

  const box = { w: 1, h: 1 };
  const mesurer = () => { const r = root.getBoundingClientRect(); box.w = Math.max(1, r.width); box.h = Math.max(1, r.height); };
  mesurer();
  const rayonPx = () => o.rayon * Math.max(box.w, box.h) * (box.w < 700 ? 1.35 : 1);
  const lum = { x: fx * box.w, y: fy * box.h }, cible = { ...lum };
  const posePoint = () => { root.style.setProperty('--lum-x', lum.x.toFixed(1) + 'px'); root.style.setProperty('--lum-y', lum.y.toFixed(1) + 'px'); root.style.setProperty('--lum-r', rayonPx().toFixed(0) + 'px'); };
  posePoint();

  // Mode calme et « réduire les animations » : image éclairée au point d'intérêt, rien ne bouge.
  if (s.calme) { root.classList.add('lum--fixe'); root.dataset.etat = 'repos'; const ro = new ResizeObserver(() => { mesurer(); lum.x = fx * box.w; lum.y = fy * box.h; posePoint(); }); ro.observe(root); return { detruire() { ro.disconnect(); }, mesure: () => null }; }

  // ---------- WebGL (sinon masque CSS) ----------
  let gl = null, renderer = null, program = null, mesh = null, u = null;
  if (canvas && source && s.webgl()) {
    await pret(['ogl']);
    const O = s.OGL;
    if (O) {
      try {
        renderer = new O.Renderer({ canvas, alpha: false, antialias: false, depth: false, dpr: Math.min(devicePixelRatio || 1, s.telephone ? 1 : o.dpr) });
        gl = renderer.gl;
        const tex = new O.Texture(gl, { image: source, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
        const chaud = mel([1, 1, 1], rgb(root, o.teinte), o.chaleur);
        u = {
          tMap: { value: tex }, uRes: { value: [1, 1] }, uImg: { value: [source.naturalWidth || source.width, source.naturalHeight || source.height] }, uFocus: { value: o.focus },
          uLum: { value: [0, 0] }, uRayon: { value: 100 }, uOmbre: { value: o.ombre }, uFlamme: { value: 0 }, uTemps: { value: 0 },
          uChaud: { value: chaud.map(v => v / Math.max(...chaud)) }, uPoussiere: { value: o.poussiere }, uRelief: { value: o.relief }, uDur: { value: o.dur },
        };
        program = new O.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u });
        mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program });
        renderer.setSize(box.w, box.h); u.uRes.value = [box.w * renderer.dpr, box.h * renderer.dpr];
        renderer.render({ scene: mesh });
        if (gl.getError() === gl.CONTEXT_LOST_WEBGL) throw 0;
      } catch { try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch {} gl = null; }
    }
  }
  const avecGl = !!gl;
  root.classList.add(avecGl ? 'lum--gl' : 'lum--css', 'lum--vivant');

  // ---------- Pointeur ----------
  let suit = false, quitte = -1e9;
  const local = e => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const bouge = e => { [cible.x, cible.y] = local(e); suit = true; root.dataset.etat = 'suit'; };
  const part = e => { if (e.pointerType !== 'mouse' && e.type === 'pointermove') return; suit = false; quitte = performance.now(); root.dataset.etat = 'retour'; };
  const finToucher = e => { if (e.pointerType !== 'mouse') part(e); };
  root.addEventListener('pointermove', bouge, { passive: true });
  root.addEventListener('pointerdown', bouge, { passive: true });
  root.addEventListener('pointerleave', part, { passive: true });
  root.addEventListener('pointerup', finToucher, { passive: true });
  root.addEventListener('pointercancel', finToucher, { passive: true });
  root.dataset.etat = 'repos';

  const ro = new ResizeObserver(() => { mesurer(); if (avecGl) { renderer.setSize(box.w, box.h); u.uRes.value = [box.w * renderer.dpr, box.h * renderer.dpr]; } });
  ro.observe(root);

  // Garde-fou : médiane des intervalles > 34 ms → densité réduite, puis masque CSS.
  let intervalles = [], mediane = 0, images = 0, glActif = avecGl;
  const surveiller = (dt, tt) => {
    if (!glActif || tt < 1) return;
    intervalles.push(dt); if (intervalles.length < 40) return;
    mediane = intervalles.sort((a, b) => a - b)[20]; intervalles = [];
    if (mediane <= 34) return;
    if (renderer.dpr > .75) { renderer.dpr = Math.max(.75, renderer.dpr * .7); renderer.setSize(box.w, box.h); u.uRes.value = [box.w * renderer.dpr, box.h * renderer.dpr]; return; }
    glActif = false; root.classList.replace('lum--gl', 'lum--css');
  };

  const t0 = performance.now();
  const b = s.boucle(root, (t, dt) => {
    const tt = (performance.now() - t0) / 1000; images++;
    const repos = !suit && performance.now() - quitte > o.delai;
    if (repos) {
      if (root.dataset.etat === 'retour') root.dataset.etat = 'repos';
      if (o.repos === 'promenade') {
        const ax = box.w < 700 ? .3 : .2, ay = box.w < 700 ? .12 : .16;
        cible.x = box.w * Math.min(.95, Math.max(.05, fx + ax * Math.sin(tt * .23)));
        cible.y = box.h * Math.min(.9, Math.max(.08, fy + ay * Math.cos(tt * .17)));
      } else { cible.x = fx * box.w; cible.y = fy * box.h; }
    }
    // Suit vite, revient lentement.
    const k = 1 - Math.pow(1 - (suit ? .1 : .025), dt / 16.7);
    lum.x += (cible.x - lum.x) * k; lum.y += (cible.y - lum.y) * k;
    const vac = o.vacillement ? (Math.sin(tt * 13) * Math.sin(tt * 7.3) * .6 + Math.sin(tt * 3.1 + Math.sin(tt * 1.7)) * .4) * o.vacillement : 0;
    const jx = o.vacillement ? Math.sin(tt * 9.7) * o.vacillement * 10 : 0, jy = o.vacillement ? Math.cos(tt * 11.3) * o.vacillement * 8 : 0;
    const allume = Math.min(1, tt / 1.4); const flamme = (1 - Math.pow(1 - allume, 3)) * (1 + vac);
    if (glActif) {
      u.uTemps.value = tt; u.uFlamme.value = flamme; u.uRayon.value = rayonPx() * renderer.dpr * (1 + vac * .3);
      u.uLum.value = [(lum.x + jx) * renderer.dpr, (box.h - lum.y - jy) * renderer.dpr];
      surveiller(dt, tt);
      renderer.render({ scene: mesh });
    } else {
      root.style.setProperty('--lum-x', (lum.x + jx).toFixed(1) + 'px'); root.style.setProperty('--lum-y', (lum.y + jy).toFixed(1) + 'px');
      root.style.setProperty('--lum-r', (rayonPx() * (1 + vac * .3)).toFixed(0) + 'px');
    }
  });

  return {
    /** médiane des intervalles entre images (ms), densité en cours, images rendues, rendu WebGL actif, position de la lumière (px) */
    mesure: () => ({ mediane, dpr: renderer?.dpr ?? null, images, webgl: glActif, lumiere: { x: lum.x, y: lum.y, r: rayonPx() } }),
    detruire() {
      b.arreter(); ro.disconnect();
      for (const [t, f] of [['pointermove', bouge], ['pointerdown', bouge], ['pointerleave', part], ['pointerup', finToucher], ['pointercancel', finToucher]]) root.removeEventListener(t, f);
      root.classList.remove('lum--gl', 'lum--css', 'lum--vivant', 'lum--peinte');
      if (fondEl && !imgOk) fondEl.style.backgroundImage = '';
      try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
    },
  };
}
