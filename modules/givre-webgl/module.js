// Givre WebGL : un givre en shader (bruit fractal, crêtes, cellules de Voronoï) pousse depuis les bords de l'écran
// et autour du titre, puis fond le long du titre ; avec une souris, il fond sous le pointeur et se reforme lentement.
// Sans WebGL, en mode calme ou sans JavaScript : givre figé en CSS (.givre__statique).
import { pret } from '../../socle/socle.js';

const VERT = 'attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
const FRAG = `precision highp float;
uniform float uTime; uniform vec2 uRes; uniform sampler2D uMelt; uniform float uGrow; uniform vec4 uTitle; uniform float uBord;
uniform vec3 uGlace; uniform vec3 uBlanc; uniform vec3 uCellule; uniform float uForce;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
float ridge(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ float n = 1.0 - abs(noise(p) * 2.0 - 1.0); v += a * n * n; p = p * 2.17 + vec2(3.1, 1.3); a *= 0.5; } return v; }
float voro(vec2 x){ vec2 n = floor(x), f = fract(x); float d1 = 8.0, d2 = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){ vec2 g = vec2(float(i), float(j)); vec2 r = g + hash2(n + g) - f; float d = dot(r, r);
    if (d < d1){ d2 = d1; d1 = d; } else if (d < d2){ d2 = d; } }
  return sqrt(d2) - sqrt(d1); }
void main(){
  vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 p = vec2(uv.x * asp, uv.y);
  float edge = min(min(uv.x, 1.0 - uv.x) * max(asp, 1.0), uv.y * 1.15);
  float n = fbm(p * 2.5 + 3.0);
  float edgeF = 1.0 - smoothstep(0.0, uBord, edge * 1.1 + (n - 0.5) * uBord * 0.85);
  vec2 tc = uTitle.xy + uTitle.zw * 0.5; vec2 td = abs(uv - tc) - uTitle.zw * 0.5;
  float tdist = length(max(td * vec2(asp, 1.0), 0.0));
  float inside = 1.0 - smoothstep(0.0, 0.025, tdist);
  float titleF = (1.0 - smoothstep(0.0, 0.07, tdist)) * (0.45 + 0.55 * fbm(p * 4.0 + 7.0));
  float dens = max(edgeF, titleF * 0.62);
  if (dens < 0.003) { gl_FragColor = vec4(0.0); return; }
  float t = 1.3 - uGrow * 1.5;
  float front = edgeF * 0.65 + titleF * 0.3 + n * 0.35;
  dens *= smoothstep(t, t + 0.16, front);
  float melt = texture2D(uMelt, uv).a;
  dens *= 1.0 - smoothstep(0.08, 0.55, melt) * 0.97;
  float cr = ridge(p * 7.0 + n * 1.5);
  float fine = ridge(p * 19.0 + vec2(5.2, 1.7));
  float cells = 1.0 - smoothstep(0.0, 0.06, voro(p * 6.0 + n));
  float pat = clamp(0.12 + cr * 0.9 + fine * 0.55 + cells * 0.22, 0.0, 1.3);
  vec3 col = mix(uGlace, uBlanc, fine);
  col = mix(col, uCellule, cells * 0.55);
  float rim = smoothstep(0.04, 0.2, melt) * (1.0 - smoothstep(0.2, 0.5, melt));
  float tw = step(0.9965, hash(floor(p * 160.0) + floor(uTime * 1.2))) * dens;
  float a = dens * pat * 0.6 + rim * dens * 0.35 + tw * 0.5;
  a = min(a, mix(1.0, 0.36, inside));
  a = clamp(a * uForce, 0.0, 0.92);
  gl_FragColor = vec4(col * a, a);
}`;

// Couleur CSS (variables, color-mix…) → [r, g, b] entre 0 et 1, résolue par le navigateur.
function rgb(root, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  root.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
}

/**
 * @param {HTMLElement} root  section.givre (contient canvas.givre__canvas et un élément [data-givre-cible])
 * @param {object} [options]
 * @param {number} [options.pousse=2.4]   durée de la pousse du givre, en secondes
 * @param {boolean} [options.fonteTitre=true]  le givre fond le long du titre à la fin de la pousse
 * @param {number} [options.force=1]      intensité globale du givre (0,5 à 1,2)
 * @param {number} [options.delai=150]    attente après le premier affichage, en ms (retarder si une ouverture joue avant)
 * @param {string} [options.glace]        couleur des cristaux (CSS), par défaut mélange secondaire + texte
 * @param {string} [options.blanc]        couleur des reflets, par défaut --couleur-texte
 * @param {string} [options.cellule]      couleur des cellules, par défaut --couleur-accent
 */
export async function init(root, options = {}) {
  const o = { pousse: 2.4, fonteTitre: true, force: 1, delai: 150, glace: 'var(--givre-clair)', blanc: 'var(--couleur-texte)', cellule: 'var(--couleur-accent)', ...options };
  const s = await pret(['gsap', 'ogl']);
  const canvas = root.querySelector('.givre__canvas');
  const cible = root.querySelector('[data-givre-cible]');
  if (!canvas || s.calme || !s.webgl() || !s.OGL) return { detruire() {} };
  // Démarrage après le premier affichage.
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise(r => setTimeout(r, o.delai));

  const O = s.OGL; const { gsap } = s;
  const petit = innerWidth < 760;
  let renderer, gl, program;
  try {
    renderer = new O.Renderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, dpr: Math.min(devicePixelRatio || 1, petit ? 1 : 1.25) });
    gl = renderer.gl;
  } catch { return { detruire() {} }; }
  if (!gl) return { detruire() {} };
  gl.clearColor(0, 0, 0, 0);

  // Texture de fonte : un petit canvas 2D où l'on peint en blanc là où le givre fond.
  const MW = 256, MH = 160;
  const fonte = document.createElement('canvas'); fonte.width = MW; fonte.height = MH;
  const mx = fonte.getContext('2d');
  const tex = new O.Texture(gl, { image: fonte, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
  const u = {
    uTime: { value: 0 }, uRes: { value: [1, 1] }, uMelt: { value: tex }, uGrow: { value: 0 }, uTitle: { value: [.1, .3, .6, .3] }, uBord: { value: .3 },
    uGlace: { value: rgb(root, o.glace) }, uBlanc: { value: rgb(root, o.blanc) }, uCellule: { value: rgb(root, o.cellule) }, uForce: { value: o.force },
  };
  try { program = new O.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false }); }
  catch { return { detruire() {} }; }
  const mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program });

  // Mesures (au démarrage et au redimensionnement, jamais pendant l'animation).
  let boite = { l: 0, t: 0, w: 1, h: 1 }, titre = { l: 0, t: 0, w: 0, h: 0 };
  const mesurer = () => {
    const r = root.getBoundingClientRect();
    boite = { l: r.left, t: r.top, w: r.width, h: r.height };
    renderer.setSize(r.width, r.height);
    u.uRes.value = [r.width, r.height];
    u.uBord.value = r.width < 700 ? .13 : .3;
    if (cible) {
      const rg = document.createRange(); rg.selectNodeContents(cible);
      let t = rg.getBoundingClientRect(); if (!t.width) t = cible.getBoundingClientRect();
      titre = { l: t.left - r.left, t: t.top - r.top, w: t.width, h: t.height };
      titre.lignes = Math.max(1, Math.round(t.height / Math.max(30, parseFloat(getComputedStyle(cible).lineHeight) || 90)));
      u.uTitle.value = [titre.l / r.width, 1 - (titre.t + titre.h) / r.height, titre.w / r.width, titre.h / r.height];
    }
  };
  mesurer();
  const ro = new ResizeObserver(() => { mesurer(); dessiner(performance.now()); });
  ro.observe(root);

  const fondre = (x, y, rayon, force) => {
    const g = mx.createRadialGradient(x, y, 0, x, y, rayon);
    g.addColorStop(0, `rgba(255,255,255,${force})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    mx.globalCompositeOperation = 'lighter'; mx.fillStyle = g; mx.fillRect(x - rayon, y - rayon, rayon * 2, rayon * 2);
    mx.globalCompositeOperation = 'source-over'; tex.needsUpdate = true;
  };
  // Fonte sous le pointeur : souris seulement.
  let dx = null, dy = null;
  const survol = e => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * MW, y = (e.clientY - r.top) / r.height * MH;
    const v = dx === null ? 0 : Math.hypot(x - dx, y - dy); dx = x; dy = y;
    fondre(x, y, 14 + Math.min(v, 30) * .7, .32);
  };
  if (s.souris) root.addEventListener('pointermove', survol, { passive: true });

  // Boucle à 60 i/s au plus, arrêtée hors écran et onglet caché (socle.boucle).
  let dernier = 0, image = 0;
  function dessiner(t) { u.uTime.value = t / 1000; renderer.render({ scene: mesh }); }
  const b = s.boucle(root, t => {
    if (t - dernier < 16) return; dernier = t; image++;
    if (image % 4 === 0) { mx.globalCompositeOperation = 'destination-out'; mx.fillStyle = 'rgba(0,0,0,0.03)'; mx.fillRect(0, 0, MW, MH); mx.globalCompositeOperation = 'source-over'; tex.needsUpdate = true; }
    dessiner(t);
  });
  root.classList.add('givre--actif');

  // Ouverture orchestrée : le givre pousse, puis fond le long du titre, ligne par ligne.
  const tl = gsap.timeline();
  tl.to(u.uGrow, { value: 1, duration: o.pousse, ease: 'power2.out' }, 0);
  if (cible && o.fonteTitre) {
    const k = { p: 0 };
    tl.to(k, { p: 1, duration: 1.5, ease: 'power1.inOut', onUpdate: () => {
      const x = (titre.l + titre.w * k.p) / boite.w * MW;
      const lignes = titre.lignes || 1;
      for (let i = 0; i < lignes; i++) fondre(x, (titre.t + titre.h * (i + .5) / lignes + Math.sin(k.p * 9 + i) * 14) / boite.h * MH, 18, .22);
    } }, o.pousse * .62);
  }

  return {
    detruire() {
      tl.kill(); b.arreter(); ro.disconnect(); root.removeEventListener('pointermove', survol);
      root.classList.remove('givre--actif');
      try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
    },
  };
}
