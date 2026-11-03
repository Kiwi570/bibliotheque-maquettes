// Fond qui se consume : section épinglée en plusieurs écrans (une matière, une offre, un univers par écran).
// Le fond passe d'une image à la suivante par une brûlure ou une dissolution en shader (OGL) : front de bruit,
// bord de cendre, liseré lumineux dont la couleur vient de la variable --fqc-lisere (par écran possible) ;
// l'image révélée arrive teintée chaud puis refroidit. Le texte de chaque écran se relaie dans la même cellule,
// un compteur 01 / 05 et un rail de puces de 44 px permettent d'aller à un écran.
// Sans WebGL : fondu enchaîné CSS entre les mêmes images. Téléphone, petite hauteur, mode calme et sans JavaScript :
// écrans en cartes, chacune sur son fond, rien d'épinglé.
// Rendu à la demande : le shader ne dessine que lorsque la progression change ; images chargées au premier besoin.
import { pret } from '../../socle/socle.js';

const VERT = 'attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D tA, tB; uniform vec2 uA, uB, uRes;
uniform float uT, uMode, uLarg, uChaleur; uniform vec3 uLisere, uCendre;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * n(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
vec2 couvrir(vec2 uv, vec2 im){ float ec = uRes.x / uRes.y, ei = im.x / im.y; vec2 s = ec > ei ? vec2(1.0, ei / ec) : vec2(ec / ei, 1.0); return (uv - 0.5) * s + 0.5; }
void main(){
  vec2 uv = vUv; vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);
  float g0 = fbm(p * 2.6);
  /* brûlure : le front avance de gauche à droite en suivant le bruit ; dissolution : le bruit seul, partout à la fois */
  float gB = g0 * 0.8 + uv.x * 0.45 + (1.0 - uv.y) * 0.06;
  float gD = g0 * 0.85 + fbm(p * 9.0 + 4.0) * 0.3;
  float g = mix(gB, gD, uMode);
  float e = uT * uT * (3.0 - 2.0 * uT);
  float seuil = mix(-0.12, mix(1.42, 1.22, uMode), e);
  float d = g - seuil;
  float actif = smoothstep(0.0, 0.03, uT) * smoothstep(1.0, 0.97, uT);
  /* chaleur : l'image ondule juste devant et derrière le front */
  float pres = smoothstep(0.16, 0.0, abs(d)) * actif;
  vec2 onde = (vec2(n(p * 20.0 + uT * 6.0), n(p * 20.0 + 9.1 - uT * 5.0)) - 0.5) * 0.016 * pres;
  vec3 a = texture2D(tA, couvrir(uv + onde, uA)).rgb;
  vec3 b = texture2D(tB, couvrir(uv - onde, uB)).rgb;
  vec3 c = mix(b, a, smoothstep(-0.01, 0.01, d));
  /* bord de cendre puis liseré lumineux */
  float bord = smoothstep(uLarg, 0.0, abs(d)) * actif;
  c = mix(c, uCendre, smoothstep(0.15, 0.8, bord) * mix(0.8, 0.35, uMode));
  float braise = pow(bord, 3.0) * (0.7 + 0.6 * n(p * 55.0 + uT * 12.0));
  c += uLisere * braise * 1.4;
  float point = step(0.993, h(floor(uv * uRes / 3.0) + floor(uT * 40.0))) * smoothstep(0.08, 0.0, abs(d)) * actif;
  c += mix(uLisere, vec3(1.0), 0.5) * point * 0.8;
  /* l'image fraîchement révélée est chaude, puis refroidit en s'éloignant du front */
  float chaud = smoothstep(0.3, 0.0, -d) * step(d, 0.0) * actif * uChaleur;
  c = mix(c, c * (0.55 + 0.9 * uLisere), chaud * 0.5);
  gl_FragColor = vec4(c, 1.0);
}`;

// Couleur CSS (variables, color-mix…) → [r, g, b] entre 0 et 1, résolue par le navigateur dans le contexte de el.
function rgb(el, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  el.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
}
const css = (c, a = 1) => `rgba(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0},${a})`;
const melange = (x, y, t) => x.map((v, i) => v * (1 - t) + y[i] * t);
const borne = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Matière de démonstration neutre, peinte d'après les variables : fibres, strates, grain, ondes ou trame selon k.
function matiere(root, k, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const F = rgb(root, 'var(--couleur-fond)'), T = rgb(root, 'var(--couleur-texte)'), A = rgb(root, 'var(--couleur-accent)'), S = rgb(root, 'var(--couleur-secondaire)');
  let graine = 7 + k * 131; const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const bases = [[melange(F, A, .38), melange(F, S, .18)], [melange(F, S, .5), melange(F, T, .08)], [melange(F, S, .3), melange(F, T, .08)], [melange(F, S, .3), melange(F, A, .3)], [melange(F, A, .22), melange(F, T, .12)]];
  const [b0, b1] = bases[k % 5];
  const lg = x.createLinearGradient(0, 0, w, h); lg.addColorStop(0, css(b1)); lg.addColorStop(1, css(b0));
  x.fillStyle = lg; x.fillRect(0, 0, w, h);
  const lueur = (cx, cy, r, col, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, css(col, a)); g.addColorStop(1, css(col, 0)); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  lueur(w * (.55 + alea() * .35), h * (.15 + alea() * .5), Math.max(w, h) * .55, melange(b0, T, .25), .5);
  const m = Math.max(w, h) / 1600;
  const type = k % 5;
  if (type === 0) { // fibres : lignes ondulées serrées
    for (let j = 0; j < 150; j++) {
      const y0 = (j / 150) * h * 1.1 - h * .05, amp = 10 + alea() * 24, fr = .002 + alea() * .003, ph = alea() * 6;
      x.strokeStyle = css(alea() > .5 ? T : F, .05 + alea() * .1); x.lineWidth = (1 + alea() * 3) * m;
      x.beginPath(); for (let i = 0; i <= w; i += 16) x.lineTo(i, y0 + Math.sin(i * fr + ph) * amp * m + Math.sin(i * fr * 3.1 + ph) * amp * .3 * m); x.stroke();
    }
  } else if (type === 1) { // strates : bandes obliques
    x.save(); x.translate(w / 2, h / 2); x.rotate(-.42);
    for (let j = -h * 1.2; j < h * 1.2; j += 20 + alea() * 70) { x.fillStyle = css(alea() > .5 ? T : F, .04 + alea() * .12); x.fillRect(-w, j, w * 2, (6 + alea() * 40) * m); }
    x.restore();
  } else if (type === 2) { // grain : pierres et éclats
    for (let i = 0; i < 1400; i++) { const r = (1 + alea() * alea() * 9) * m; x.fillStyle = css(alea() > .55 ? T : F, .08 + alea() * .22); x.beginPath(); x.arc(alea() * w, alea() * h, r, 0, 7); x.fill(); }
  } else if (type === 3) { // ondes : cercles concentriques décentrés
    const cx = w * .72, cy = h * .45; x.lineWidth = 2.5 * m;
    for (let r = 20 * m; r < Math.max(w, h); r += (18 + alea() * 26) * m) { x.strokeStyle = css(T, .05 + alea() * .1); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); }
  } else { // trame : points réguliers
    const pas = 26 * m;
    for (let j = pas / 2; j < h; j += pas) for (let i = (j / pas % 2) * pas / 2; i < w; i += pas) { x.fillStyle = css(T, .06 + .1 * Math.sin(i * .004 + j * .003) ** 2); x.beginPath(); x.arc(i, j, 3.2 * m, 0, 7); x.fill(); }
  }
  // Grain fin commun (motif répété) pour que l'image ne soit jamais lisse.
  const tuile = document.createElement('canvas'); tuile.width = tuile.height = 128;
  const tx = tuile.getContext('2d'), id = tx.createImageData(128, 128);
  for (let i = 0; i < id.data.length; i += 4) { const v = alea() * 255 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 18; }
  tx.putImageData(id, 0, 0); x.fillStyle = x.createPattern(tuile, 'repeat'); x.fillRect(0, 0, w, h);
  return c;
}

/**
 * @param {HTMLElement} root  section.fqc (contient .fqc__scene, canvas.fqc__canvas, .fqc__ecran > .fqc__fond + .fqc__texte)
 * @param {object} [options]
 * @param {string[]} [options.images]          URL d'une image par écran ; sinon l'<img> (src ou data-src) de chaque .fqc__fond ; sinon matière neutre générée
 * @param {'brulure'|'dissolution'} [options.effet='brulure']  front qui avance de gauche à droite, ou dissolution partout à la fois
 * @param {string} [options.lisere='var(--fqc-lisere)']  couleur CSS du liseré, lue sur chaque écran (variable surchargeable par écran)
 * @param {number} [options.epaisseur=.045]   épaisseur du bord de cendre et du liseré (0,02 à 0,08)
 * @param {boolean} [options.refroidit=true]  l'image qui arrive est teintée chaud puis refroidit (aussi en cartes sur téléphone)
 * @param {number} [options.pas=90]           défilement par écran pendant l'épinglage, en % de la hauteur d'écran
 * @param {number} [options.transition=.45]   part de chaque intervalle occupée par la transition (le reste est au repos)
 * @param {number|boolean} [options.lissage=.4]  scrub de ScrollTrigger
 * @param {number} [options.largeurMin=700]   en dessous, pas d'épinglage (cartes)
 * @param {number} [options.hauteurMin=500]   sous cette hauteur d'écran, pas d'épinglage
 * @param {number} [options.dpr=1.5]          densité de pixels maximale du canvas (plafonnée à 3,5 millions de pixels)
 * @param {string} [options.libelleRail="Aller à un écran"]  nom du groupe de puces lu par les lecteurs d'écran
 * @returns {Promise<{detruire: Function, aller: Function}>}
 */
export async function init(root, options = {}) {
  const o = { images: [], effet: 'brulure', lisere: 'var(--fqc-lisere)', epaisseur: .045, refroidit: true, pas: 90, transition: .45, lissage: .4, largeurMin: 700, hauteurMin: 500, dpr: 1.5, libelleRail: 'Aller à un écran', ...options };
  const scene = root.querySelector('.fqc__scene');
  const ecrans = [...root.querySelectorAll('.fqc__ecran')];
  const fonds = ecrans.map(e => e.querySelector('.fqc__fond'));
  const textes = ecrans.map(e => e.querySelector('.fqc__texte'));
  const canvas = root.querySelector('.fqc__canvas');
  const contenu = root.querySelector('.fqc__contenu');
  const n = ecrans.length;
  const rien = { detruire() {}, aller() {} };
  if (!scene || n < 2 || fonds.some(f => !f)) return rien;
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const titre = i => ecrans[i].querySelector('h3')?.textContent.trim() || '';
  root.querySelectorAll('[data-fqc-total]').forEach(e => { e.textContent = String(n).padStart(2, '0'); });

  // ---------- Sources : image fournie, <img> du fond, ou matière générée (une fois, au premier besoin) ----------
  const portrait = innerHeight > innerWidth;
  const [GW, GH] = s.telephone ? [720, 1080] : portrait ? [1100, 1400] : [1600, 1000];
  const sources = [];
  function source(i) {
    if (i < 0 || i >= n) return Promise.resolve(null);
    if (sources[i]) return sources[i];
    const f = fonds[i];
    let img = f.querySelector('img');
    if (o.images[i]) {
      if (!img) { img = document.createElement('img'); img.alt = ''; f.prepend(img); }
      if (new URL(o.images[i], location.href).origin !== location.origin) img.crossOrigin = 'anonymous';
      img.src = o.images[i];
    } else if (img && !img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    const generer = () => { const c = matiere(root, i, GW, GH); c.className = 'fqc__genere'; f.querySelector('img')?.remove(); f.prepend(c); return c; };
    if (img && img.getAttribute('src')) {
      img.decoding = 'async';
      sources[i] = (img.complete && img.naturalWidth ? Promise.resolve() : new Promise((ok, ko) => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ko, { once: true }); }))
        .then(() => img.decode?.().catch(() => {})).then(() => img).catch(() => generer());
    } else sources[i] = new Promise(ok => setTimeout(() => ok(generer()), 0));
    return sources[i];
  }
  // Toutes les sources, étalées dans le temps (cartes).
  const toutCharger = () => ecrans.forEach((_, i) => setTimeout(() => source(i), i * 60));

  // ---------- Mode calme : cartes figées ----------
  if (s.calme) { toutCharger(); return rien; }

  // ---------- WebGL (préparé une seule fois, à la première mise en épinglage) ----------
  let G = null, essaiGL = false;
  const paire = { a: 0, b: 1, t: 0 };   // paire d'images en cours et avancement de la transition
  async function preparerGL() {
    if (essaiGL) return; essaiGL = true;
    if (!canvas || !s.webgl()) return;
    await pret(['ogl']);
    const O = s.OGL; if (!O) return;
    let renderer, gl, program;
    try { renderer = new O.Renderer({ canvas, alpha: false, antialias: false, depth: false, dpr: 1 }); gl = renderer.gl; } catch { return; }
    if (!gl) return;
    const u = {
      tA: { value: null }, tB: { value: null }, uA: { value: [1, 1] }, uB: { value: [1, 1] }, uRes: { value: [1, 1] },
      uT: { value: 0 }, uMode: { value: o.effet === 'dissolution' ? 1 : 0 }, uLarg: { value: o.epaisseur }, uChaleur: { value: o.refroidit ? 1 : 0 },
      uLisere: { value: [1, .6, .3] }, uCendre: { value: rgb(root, 'color-mix(in oklab, var(--couleur-fond) 55%, black)') },
    };
    try { program = new O.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u }); } catch { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {} return; }
    const mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program });
    const tex = [], dims = [];
    const lisere = ecrans.map(e => rgb(e, o.lisere));
    let perdu = false, cle = '';
    const taille = () => {
      const w = scene.clientWidth, h = scene.clientHeight; if (!w || !h) return;
      let d = Math.min(devicePixelRatio || 1, o.dpr);
      if (w * h * d * d > 3.5e6) d = Math.sqrt(3.5e6 / (w * h));
      renderer.dpr = d; renderer.setSize(w, h); u.uRes.value = [w * d, h * d]; cle = '';
    };
    const ro = new ResizeObserver(() => { taille(); G?.dessiner(); });
    ro.observe(scene); taille();
    const perte = e => { e.preventDefault(); perdu = true; canvas.classList.remove('est-visible'); };
    canvas.addEventListener('webglcontextlost', perte);
    const texture = i => {
      if (tex[i] !== undefined) return tex[i];
      tex[i] = null;
      source(i).then(src => {
        if (!src || perdu) return;
        tex[i] = new O.Texture(gl, { image: src, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
        dims[i] = [src.naturalWidth || src.width, src.naturalHeight || src.height];
        G?.dessiner();
      });
      return null;
    };
    G = {
      // Dessine la paire (a → b) à l'avancement t ; ne fait rien si rien n'a changé. Faux si la paire n'est pas prête.
      dessiner() {
        const { a, b, t } = paire;
        if (perdu) return false;
        const A = texture(a), B = texture(b);
        if (!A || !B) { canvas.classList.remove('est-visible'); return false; }
        const k = `${a}|${b}|${t.toFixed(4)}`;
        if (k === cle) return true;
        u.tA.value = A; u.tB.value = B; u.uA.value = dims[a]; u.uB.value = dims[b]; u.uT.value = t; u.uLisere.value = lisere[b];
        try { renderer.render({ scene: mesh }); }
        catch { perdu = true; canvas.classList.remove('est-visible'); return false; }  // image d'une autre origine sans CORS…
        cle = k; canvas.classList.add('est-visible'); return true;
      },
      detruire() { ro.disconnect(); canvas.removeEventListener('webglcontextlost', perte); canvas.classList.remove('est-visible'); try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {} },
    };
    G.dessiner();
  }

  // ---------- États ----------
  const annonce = document.createElement('p'); annonce.className = 'socle-sr'; annonce.setAttribute('aria-live', 'polite');
  root.appendChild(annonce);
  const compteurs = [...root.querySelectorAll('[data-fqc-n]')];
  let courant = -1, puces = [], aller = () => {};

  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('fqc--epingle');
    // Rail de puces (repris d'icc-maquette/architecture : numéro, trait qui s'allonge sur le niveau courant).
    const rail = document.createElement('div'); rail.className = 'fqc__rail'; rail.setAttribute('role', 'group'); rail.setAttribute('aria-label', o.libelleRail); rail.dataset.tient = 'rail';
    puces = ecrans.map((_, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fqc__puce';
      b.innerHTML = `<span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="socle-sr">Écran ${i + 1} sur ${n} : ${titre(i)}</span>`;
      b.addEventListener('click', () => aller(i));
      rail.appendChild(b); return b;
    });
    contenu.appendChild(rail);

    // Repos avant la transition un peu plus long que celui d'après : on lit l'écran, puis il se consume.
    const repos = (1 - o.transition) * .6, centre = (repos - (1 - o.transition - repos)) / 2;
    const etat = { v: 0 };
    const appliquer = () => {
      const v = borne(etat.v, 0, n - 1), i = Math.min(n - 2, Math.floor(v)), f = v - i;
      const t = borne((f - repos) / o.transition);
      // Fondu enchaîné CSS (toujours tenu à jour : il est visible sans WebGL et tant que les textures arrivent).
      fonds.forEach((fd, j) => {
        fd.style.setProperty('--fqc-o', j === i ? '1' : j === i + 1 ? t.toFixed(3) : '0');
        fd.style.setProperty('--fqc-chaud', o.refroidit && j === i + 1 ? (Math.min(1, t * 6) * (1 - t)).toFixed(3) : '0');
      });
      source(i); source(i + 1); if (t > 0) source(i + 2);
      Object.assign(paire, { a: i, b: i + 1, t }); G?.dessiner();
      activer(t < .5 ? i : i + 1);
    };
    const tween = gsap.fromTo(etat, { v: 0 }, { v: n - 1, ease: 'none', paused: true, onUpdate: appliquer });
    const st = ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * (n - 1) * o.pas / 100),
      pin: scene, animation: tween, scrub: o.lissage, invalidateOnRefresh: true,
      onToggle: self => root.classList.toggle('est-epingle', self.isActive),
    });
    aller = i => {
      const y = borne(st.start + (st.end - st.start) * (i + centre) / (n - 1), st.start + 2, st.end - 2);
      if (s.lenis) s.lenis.scrollTo(y, { duration: 1 + .25 * Math.abs(i - courant) }); else scrollTo({ top: y, behavior: 'smooth' });
    };
    courant = -1; appliquer();
    preparerGL();
    return () => {
      st.kill(); tween.kill(); rail.remove(); puces = [];
      root.classList.remove('fqc--epingle', 'est-epingle');
      fonds.forEach(fd => { fd.style.removeProperty('--fqc-o'); fd.style.removeProperty('--fqc-chaud'); });
      textes.forEach(t => { t.inert = false; });
      ecrans.forEach(e => e.classList.remove('est-active'));
      canvas?.classList.remove('est-visible');
      courant = -1;
    };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    toutCharger();
    if (!o.refroidit) return;
    // Cartes : chaque fond arrive chaud et refroidit en montant vers le milieu de l'écran (repris de nelis-maquette/applications).
    const sts = ecrans.map((e, i) => ScrollTrigger.create({
      trigger: e, start: 'top bottom', end: 'center 55%',
      onUpdate: self => fonds[i].style.setProperty('--fqc-chaud', (1 - self.progress).toFixed(3)),
      onRefresh: self => fonds[i].style.setProperty('--fqc-chaud', (1 - self.progress).toFixed(3)),
    }));
    return () => { sts.forEach(t => t.kill()); fonds.forEach(fd => fd.style.removeProperty('--fqc-chaud')); };
  });

  function activer(i) {
    if (i === courant) return;
    const premier = courant === -1; courant = i;
    ecrans.forEach((e, k) => e.classList.toggle('est-active', k === i));
    textes.forEach((t, k) => { t.inert = k !== i; });
    puces.forEach((b, k) => { k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
    compteurs.forEach(c => { c.textContent = String(i + 1).padStart(2, '0'); });
    if (!premier) annonce.textContent = `Écran ${i + 1} sur ${n} : ${titre(i)}`;
  }

  s.rafraichir();
  return {
    aller: i => aller(borne(i | 0, 0, n - 1)),
    detruire() { mm.revert(); G?.detruire(); annonce.remove(); },
  };
}
