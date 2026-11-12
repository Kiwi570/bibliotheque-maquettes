// Révélation à l'encre : une image apparaît comme une encre ou une eau qui s'étale dans le papier (WebGL, OGL).
// Trois modes, un seul shader :
//   « etale »  : une tache d'encre part d'un point, ses bords fusent et se chargent d'encre, puis respire (et s'écarte sous le pointeur) ;
//   « voile »  : trois feuilles de papier recouvrent l'image puis se retirent ; avec plusieurs images et des .rae__etape,
//                la scène s'épingle et le voile passe d'une image à la suivante à chaque étape ;
//   « montee » : une nappe d'eau monte du bas et rend ses couleurs à une image d'abord en bichromie.
// Déclencheurs : à l'arrivée, à l'apparition (avec retrait facultatif en sortie d'écran) ou au défilement (scrub).
// Sans WebGL : tache SVG (feTurbulence) qui grandit, voile en fondu, montée par masque CSS. Mode calme, réduire les
// animations et sans JavaScript : l'image est entière et nette (étapes en liste), rien ne bouge.
import { pret } from '../../socle/socle.js';

const MODES = { etale: 0, voile: 1, montee: 2 };
const VERT = 'attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D tMap;
uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uFocus; uniform vec2 uCentre; uniform vec2 uSouris;
uniform float uP; uniform float uT; uniform float uMode; uniform float uSeed; uniform float uForme; uniform float uSourisF; uniform float uRespire;
uniform vec3 uEncre; uniform vec3 uPapier; uniform vec3 uDuoA; uniform vec3 uDuoB;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32 + uSeed); return fract(p.x * p.y); }
float bruit(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * bruit(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
float fbm3(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ v += a * bruit(p); p = p * 2.07 + 7.3; a *= 0.5; } return v; }
// Image en « cover » autour du point focal.
vec3 image(vec2 uv){
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 e = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 f = vec2(uFocus.x, 1.0 - uFocus.y);
  return texture2D(tMap, clamp((uv - 0.5) * e + 0.5 + (f - 0.5) * (1.0 - e), 0.001, 0.999)).rgb;
}
// Tache d'encre : rayon qui croît, bord déformé par deux bruits, liseré chargé d'encre, fibres qui boivent au-delà du bord.
vec4 etale(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 k = vec2(asp, 1.0) / min(asp, 1.0);
  vec2 p = (uv - uCentre) * k;
  float t = uT * 0.035 * uRespire;
  float n = fbm(p * 2.1 + vec2(t, -t * 0.6));
  float n2 = fbm3(p * 7.5 - vec2(t * 1.4, t));
  float g = 1.0 - pow(1.0 - clamp(uP, 0.0, 1.0), 2.2);
  float rMax = length(max(uCentre, 1.0 - uCentre) * k) + 0.3;
  float R = g * mix(0.47, rMax, uForme) + sin(uT * 0.33) * 0.005 * g * uRespire;
  float d = length(p * vec2(0.94, 1.0));
  float bord = d - R - (n - 0.5) * 0.36 * g - (n2 - 0.5) * 0.07;
  vec2 dm = (uv - uSouris) * k; float md = dot(dm, dm);
  vec2 dep = dm * exp(-md * 16.0) * 0.07 * uSourisF;
  bord += exp(-md * 22.0) * 0.03 * uSourisF;
  float bx = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  bord += (1.0 - smoothstep(0.0, 0.16, bx)) * 0.22 * (1.0 - uForme);
  float dedans = 1.0 - smoothstep(-0.012, 0.01, bord);
  vec3 col = image(uv - dep / k + vec2(n - 0.5, n2 - 0.5) * 0.005);
  float fin = uForme * smoothstep(0.85, 1.0, uP);
  float lis = smoothstep(-0.085, 0.0, bord) * dedans * (1.0 - fin);
  col = mix(col, uEncre, lis * (0.42 + fbm3(p * 55.0 + 3.0) * 0.45));
  float fib = smoothstep(0.48, 0.78, fbm3(vec2(p.x * 9.0, p.y * 38.0) + n * 2.0));
  float bave = (1.0 - smoothstep(0.0, 0.05, bord)) * (1.0 - dedans) * fib * (1.0 - fin);
  float a = clamp(dedans + bave * 0.45, 0.0, 1.0) * step(0.0005, uP);
  return vec4(mix(uEncre, col, dedans) * a, a);
}
// Voile : trois feuilles de papier fibreux ; la plus haute se retire la première, bord frangé et légèrement encré.
vec4 voile(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = vec2(uv.x * asp, uv.y);
  vec3 col = image(uv);
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    vec2 q = p * (1.6 + fi * 0.35) + vec2(fi * 7.13 + uSeed, fi * 3.71 - uSeed);
    float n = fbm(q) * 0.78 + fbm3(q * 5.3) * 0.22;
    float t = clamp(uP * 1.38 - (2.0 - fi) * 0.18, 0.0, 1.05);
    float garde = t <= 0.0 ? 1.0 : smoothstep(t - 0.008, t + 0.016, n);
    float lis = (1.0 - smoothstep(t, t + 0.07, n)) * garde * step(0.001, t);
    vec3 c = mix(uPapier, uEncre, (2.0 - fi) * 0.035);
    float fibre = bruit(p * vec2(95.0, 60.0) + fi * 13.0) * 0.03 + bruit(p * 260.0 + fi) * 0.035 - 0.03;
    c = c - fibre + (fbm3(p * 7.0 + fi) - 0.5) * 0.035;
    c = mix(c, uEncre, lis * 0.3);
    col = mix(col, c, garde);
  }
  return vec4(col, 1.0);
}
// Montée : ligne d'eau ondulée dont le bord fuse dans l'image ; dessous la couleur, dessus la bichromie.
vec4 montee(vec2 uv){
  float asp = uRes.x / uRes.y; float t = uT;
  float plein = step(0.999, uP);
  float w = sin(uv.x * 7.0 + t * 1.1) * 0.010 + sin(uv.x * 17.0 - t * 1.6) * 0.005 + (bruit(vec2(uv.x * 5.0, t * 0.25)) - 0.5) * 0.02;
  float fuse = (fbm3(vec2(uv.x * asp * 6.0, t * 0.12)) - 0.5) * 0.06;
  float ligne = mix(-0.08, 1.08, uP) + (w + fuse) * (1.0 - plein);
  float sous = 1.0 - smoothstep(ligne - 0.004, ligne + 0.004, uv.y);
  float fr = fbm3(vec2(uv.x * asp * 16.0, uv.y * 34.0) - vec2(0.0, t * 0.2));
  float frange = (1.0 - smoothstep(ligne, ligne + 0.06, uv.y)) * smoothstep(0.5, 0.78, fr) * (1.0 - sous);
  vec2 nn = vec2(bruit(uv * vec2(12.0, 28.0) + t * 0.35) - 0.5, bruit(uv * vec2(28.0, 12.0) - t * 0.3) - 0.5);
  vec3 col = image(uv + nn * 0.012 * sous * (1.0 - plein));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 duo = mix(uDuoA, uDuoB, smoothstep(0.04, 0.96, l));
  float prof = clamp((ligne - uv.y) * 2.0, 0.0, 1.0) * (1.0 - plein);
  vec3 eau = col * (1.0 - prof * 0.1);
  vec2 q = uv * vec2(asp, 1.0) * 9.0;
  float cau = sin(q.x + sin(q.y * 1.3 + t * 0.7) * 1.6) * sin(q.y * 1.1 + sin(q.x * 0.9 - t * 0.6) * 1.6);
  eau += pow(abs(cau), 7.0) * 0.07 * sous * (1.0 - plein) * uDuoB;
  vec3 o = mix(duo, eau, clamp(sous + frange * 0.65, 0.0, 1.0));
  float ecume = (1.0 - smoothstep(0.0, 0.006, abs(uv.y - ligne))) * (1.0 - plein) * step(0.001, uP);
  return vec4(mix(o, uDuoB, ecume * 0.55), 1.0);
}
void main(){
  if (uMode < 0.5) gl_FragColor = etale(vUv);
  else if (uMode < 1.5) gl_FragColor = voile(vUv);
  else gl_FragColor = montee(vUv);
}`;

// ---------- Couleurs : valeur CSS (variables, color-mix…) → [r, g, b] entre 0 et 1, résolue par le navigateur ----------
function rgb(root, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  root.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
}
const mel = (a, b, k) => a.map((v, i) => v * (1 - k) + b[i] * k);
const lum = c => .299 * c[0] + .587 * c[1] + .114 * c[2];
const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;

// ---------- Image de démonstration neutre, peinte d'après les variables (paysage abstrait : ciel, astre, collines) ----------
function peindre(root, variante, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const F = rgb(root, 'var(--couleur-fond)'), T = rgb(root, 'var(--couleur-texte)'), A = rgb(root, 'var(--couleur-accent)'), S = rgb(root, 'var(--couleur-secondaire)');
  const clair = lum(F) > lum(T) ? F : T, sombre = lum(F) > lum(T) ? T : F;
  const m = Math.min(w, h);
  const ciel = x.createLinearGradient(0, 0, 0, h);
  ciel.addColorStop(0, css(mel(S, sombre, variante === 3 ? .55 : .25)));
  ciel.addColorStop(.55, css(mel(A, clair, variante === 2 ? .2 : .45)));
  ciel.addColorStop(1, css(mel(A, sombre, .3)));
  x.fillStyle = ciel; x.fillRect(0, 0, w, h);
  const ax = w * (variante === 2 ? .28 : variante === 3 ? .5 : .7), ay = h * (variante === 3 ? .3 : .38);
  const lueur = x.createRadialGradient(ax, ay, 0, ax, ay, m * .7);
  lueur.addColorStop(0, css(mel(A, clair, .35), .9)); lueur.addColorStop(1, css(A, 0));
  x.fillStyle = lueur; x.fillRect(0, 0, w, h);
  x.fillStyle = css(mel(A, clair, .55)); x.beginPath(); x.arc(ax, ay, m * .1, 0, Math.PI * 2); x.fill();
  // Collines : trois plans de plus en plus sombres.
  for (let k = 0; k < 3; k++) {
    const base = h * (.56 + k * .14), amp = h * (.06 - k * .012), ph = variante * 1.7 + k * 2.1;
    x.fillStyle = css(mel(S, sombre, .1 + k * .3));
    x.beginPath(); x.moveTo(0, h);
    for (let i = 0; i <= 40; i++) { const px = w * i / 40; x.lineTo(px, base + Math.sin(i * .32 + ph) * amp + Math.sin(i * .9 + ph * 2) * amp * .35); }
    x.lineTo(w, h); x.closePath(); x.fill();
  }
  if (variante === 3) {
    x.strokeStyle = css(clair, .18); x.lineWidth = Math.max(2, m / 300);
    for (let i = -h; i < w; i += m / 14) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h * .6, h); x.stroke(); }
  }
  return c;
}

// Source de la texture d'une figure : son <img> (déjà téléchargée) ou une image neutre peinte.
async function source(root, fig, portrait) {
  const fond = fig.querySelector('.rae__fond');
  const img = fond?.tagName === 'IMG' ? fond : fond?.querySelector('img');
  if (img) {
    try {
      if (!(img.complete && img.naturalWidth)) await new Promise((ok, ko) => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ko, { once: true }); });
      await img.decode?.().catch(() => {});
      return img;
    } catch { /* image absente : visuel neutre */ }
  }
  const v = fond?.classList.contains('socle-visuel--2') ? 2 : fond?.classList.contains('socle-visuel--3') ? 3 : 1;
  return portrait ? peindre(root, v, 1000, 1250) : peindre(root, v, 1600, 1000);
}

// ---------- Rendu WebGL ----------
async function rendreGL(root, scene, figures, o, s) {
  await pret(['ogl']);
  const O = s.OGL; if (!O) return null;
  const r0 = scene.getBoundingClientRect();
  const portrait = r0.width ? r0.height > r0.width * 1.05 : true; // scène en display: contents (étapes en liste) : portrait
  const sources = await Promise.all(figures.map(f => source(root, f, portrait)));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const canvas = document.createElement('canvas'); canvas.className = 'rae__canvas'; canvas.setAttribute('aria-hidden', 'true');
  scene.appendChild(canvas);
  const echec = () => { try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch {} canvas.remove(); return null; };
  let renderer, gl, program;
  try {
    renderer = new O.Renderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, dpr: Math.min(devicePixelRatio || 1, s.telephone ? 1 : o.dpr) });
    gl = renderer.gl;
  } catch { return echec(); }
  if (!gl) return echec();
  gl.clearColor(0, 0, 0, 0);
  const textures = sources.map(src => new O.Texture(gl, { image: src, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE }));
  const dims = sources.map(src => [src.naturalWidth || src.width, src.naturalHeight || src.height]);
  const focus = figures.map(f => { const v = (f.dataset.focus || '').split(/[\s,]+/).map(Number); return v.length === 2 && v.every(n => n >= 0 && n <= 1) ? v : o.focus; });
  // Couleurs : encre, papier et bichromie dérivées des variables (ou données en option).
  const F = rgb(root, 'var(--couleur-fond)'), T = rgb(root, 'var(--couleur-texte)'), S = rgb(root, 'var(--couleur-secondaire)');
  const sombre = lum(F) > lum(T) ? T : F, clair = lum(F) > lum(T) ? F : T;
  const encre = o.encre ? rgb(root, o.encre) : mel(S, sombre, .45);
  const papier = o.papier ? rgb(root, o.papier) : mel(F, T, .07);
  const duo = o.bichromie ? o.bichromie.map(c => rgb(root, c)) : [mel(sombre, S, .35), mel(clair, S, .15)];
  const u = {
    tMap: { value: textures[0] }, uRes: { value: [1, 1] }, uImg: { value: dims[0] }, uFocus: { value: focus[0] },
    uCentre: { value: [o.centre[0], 1 - o.centre[1]] }, uSouris: { value: [.5, .5] },
    uP: { value: 0 }, uT: { value: 0 }, uMode: { value: MODES[o.mode] }, uSeed: { value: o.graine ?? Math.random() * 10 },
    uForme: { value: o.forme === 'plein' ? 1 : 0 }, uSourisF: { value: 0 }, uRespire: { value: o.respire ? 1 : 0 },
    uEncre: { value: encre }, uPapier: { value: papier }, uDuoA: { value: duo[0] }, uDuoB: { value: duo[1] },
  };
  try { program = new O.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u }); } catch { return echec(); }
  const mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program });
  const mesurer = () => { const r = scene.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height)); u.uRes.value = [Math.max(1, r.width), Math.max(1, r.height)]; };
  mesurer();
  // Premier rendu sous surveillance (image d'une autre origine sans CORS, contexte perdu…) : sinon repli CSS.
  try { renderer.render({ scene: mesh }); if (gl.getError() === gl.CONTEXT_LOST_WEBGL) throw 0; }
  catch { return echec(); }
  root.classList.add('rae--gl');
  let iTex = 0;
  return {
    temps: true,
    renderer,
    mesurer,
    poser(p, i, t, sr) {
      if (i !== iTex && textures[i]) { u.tMap.value = textures[i]; u.uImg.value = dims[i]; u.uFocus.value = focus[i]; iTex = i; }
      u.uP.value = p; u.uT.value = t; u.uRespire.value = o.respire ? 1 : 0;
      u.uSouris.value = [sr.cx, 1 - sr.cy]; u.uSourisF.value = sr.f;
      renderer.render({ scene: mesh });
    },
    detruire() { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {} canvas.remove(); root.classList.remove('rae--gl'); },
  };
}

// ---------- Repli sans WebGL : tache SVG qui grandit, voile en fondu, montée par masque ----------
function rendreCSS(root, scene, figures, o) {
  root.classList.add('rae--css');
  const ajouts = [];
  if (o.mode === 'voile') { const v = document.createElement('span'); v.className = 'rae__voile'; v.setAttribute('aria-hidden', 'true'); scene.appendChild(v); ajouts.push(v); }
  if (o.mode === 'montee') for (const f of figures) {
    const fond = f.querySelector('.rae__fond'); if (!fond) continue;
    const copie = fond.cloneNode(true); copie.classList.remove('rae__fond'); copie.removeAttribute('id');
    for (const im of [copie, ...copie.querySelectorAll('img')]) if (im.tagName === 'IMG') { im.alt = ''; im.removeAttribute('fetchpriority'); }
    const duo = document.createElement('span'); duo.className = 'rae__duo'; duo.setAttribute('aria-hidden', 'true'); duo.appendChild(copie);
    fond.before(duo); ajouts.push(duo);
  }
  if (o.mode === 'etale') root.style.setProperty('--rae-taille', o.forme === 'plein' ? '320%' : '100%');
  return {
    temps: false,
    mesurer() {},
    poser(p) {
      root.style.setProperty('--rae-p', p.toFixed(4));
      if (o.mode === 'etale' && o.forme === 'plein') root.classList.toggle('rae--fini', p >= .999);
    },
    detruire() { ajouts.forEach(a => a.remove()); root.classList.remove('rae--css', 'rae--fini'); root.style.removeProperty('--rae-p'); root.style.removeProperty('--rae-taille'); },
  };
}

const EASE = { lin: k => k, doux: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, sortie: k => 1 - Math.pow(1 - k, 3), entree: k => k * k };

/**
 * @param {HTMLElement} root  section.rae (contient .rae__scene > figure.rae__image > .rae__fond ; .rae__etape pour les étapes)
 * @param {object} [options]
 * @param {'etale'|'voile'|'montee'} [options.mode]  sinon data-mode, sinon 'etale'
 * @param {'arrivee'|'apparition'|'defilement'} [options.declencheur]  'arrivee' pour etale, 'defilement' pour voile et montee
 * @param {boolean} [options.retrait=false]  l'image se retire de la même façon quand elle quitte l'écran (rejouée au retour)
 * @param {number} [options.duree]       durée de la révélation en s : 1.9 (etale), 1.4 (voile, montee)
 * @param {number} [options.delai=.15]   délai avant l'arrivée, en s
 * @param {'tache'|'plein'} [options.forme='tache']  etale : l'image garde une forme de tache, ou la tache gagne tout le cadre
 * @param {number[]} [options.centre=[.5,.5]]  etale : point de départ de la tache (x, y depuis le haut gauche)
 * @param {number} [options.depart=0]    progression de départ (montee : niveau d'eau avant le défilement, 0 à 1)
 * @param {string} [options.debut='top 80%']  défilement : début (ScrollTrigger)
 * @param {string} [options.fin]         défilement : fin, 'center 55%' (etale, voile) ou 'bottom 75%' (montee)
 * @param {boolean} [options.respire=true]  etale et montee : la tache respire, l'eau ondule (boucle arrêtée hors écran)
 * @param {boolean} [options.souris=true]   etale : la tache s'écarte sous le pointeur (souris seulement)
 * @param {number[]} [options.focus=[.5,.5]] point focal par défaut (sinon data-focus=".5 .3" sur la figure)
 * @param {string} [options.encre]       couleur CSS de l'encre (liseré, voile) : --couleur-secondaire assombrie
 * @param {string} [options.papier]      couleur CSS du papier (voile) : --couleur-texte à 7 % dans --couleur-fond
 * @param {string[]} [options.bichromie] montee : [couleur sombre, couleur claire], dérivées de --couleur-fond, --couleur-texte et --couleur-secondaire
 * @param {number} [options.largeurMin=900]  étapes : largeur à partir de laquelle la scène s'épingle
 * @param {number} [options.hauteurMin=600]  étapes : hauteur à partir de laquelle elle s'épingle
 * @param {number} [options.pas=80]      étapes : défilement par étape, en % de la hauteur d'écran
 * @param {number} [options.dpr=1.5]     densité de pixels maximale sur ordinateur (1 sous 700 px)
 * @returns {Promise<{jouer: Function, retirer: Function, rejouer: Function, detruire: Function, mesure: Function}>}
 */
export async function init(root, options = {}) {
  const mode = MODES[options.mode] != null ? options.mode : MODES[root.dataset.mode] != null ? root.dataset.mode : 'etale';
  const o = {
    declencheur: mode === 'etale' ? 'arrivee' : 'defilement', retrait: false, duree: mode === 'etale' ? 1.9 : 1.4, delai: .15,
    forme: 'tache', centre: [.5, .5], depart: 0, debut: 'top 80%', fin: mode === 'montee' ? 'bottom 75%' : 'center 55%',
    respire: true, souris: true, focus: [.5, .5], encre: null, papier: null, bichromie: null,
    largeurMin: 900, hauteurMin: 600, pas: 80, dpr: 1.5, ...options, mode,
  };
  const scene = root.querySelector('.rae__scene');
  const figures = [...root.querySelectorAll('.rae__image')];
  const etapes = [...root.querySelectorAll('.rae__etape')];
  const multi = mode === 'voile' && figures.length > 1 && etapes.length > 0;
  const rien = { jouer: async () => {}, retirer: async () => {}, rejouer: async () => {}, detruire() {}, mesure: () => null };
  if (!scene || !figures.length) return rien;
  root.classList.add('rae--' + mode);
  if (mode === 'etale' && o.forme === 'tache') root.classList.add('rae--forme-tache');
  const html = document.documentElement;
  const calmeTot = false; // plus de mode calme (v10.11)
  if (!calmeTot && !multi) root.classList.add('rae--attente');

  const s = await pret(multi || o.declencheur === 'defilement' ? ['scrolltrigger'] : []);
  if (s.calme) { root.classList.remove('rae--attente'); root.classList.add('rae--pris'); return rien; }

  const etat = { p: Math.min(1, Math.max(0, o.depart)), i: 0 };
  if (multi) etat.p = 0;
  let r = s.webgl() ? await rendreGL(root, scene, figures, o, s).catch(() => null) : null;
  if (!r) r = rendreCSS(root, scene, figures, o);
  r.poser(etat.p, 0, 0, { cx: .5, cy: .5, f: 0 });
  root.classList.remove('rae--attente'); root.classList.add('rae--pris');

  // ---------- Progression : petites interpolations maison, rendues dans la boucle du socle ----------
  let tw = null, sale = true;
  const vers = (a, duree, ease = EASE.doux) => new Promise(fin => {
    if (tw) tw.fin();
    if (duree <= 0 || Math.abs(a - etat.p) < .0005) { etat.p = a; sale = true; tw = null; fin(); return; }
    tw = { de: etat.p, a, t0: performance.now(), d: duree * 1000, ease, fin };
  });
  const easeJouer = mode === 'etale' ? EASE.lin : mode === 'voile' ? EASE.sortie : EASE.doux;
  const jouer = () => vers(1, o.duree, easeJouer);
  const retirer = () => vers(0, o.duree * .6, EASE.doux);

  // Pointeur (etale) : la tache s'écarte doucement sous la souris.
  const sr = { x: .5, y: .5, cx: .5, cy: .5, f: 0, ft: 0 };
  const survol = e => { const b = scene.getBoundingClientRect(); sr.x = (e.clientX - b.left) / b.width; sr.y = (e.clientY - b.top) / b.height; sr.ft = 1; };
  const quitte = () => { sr.ft = 0; };
  const avecSouris = mode === 'etale' && o.souris && s.souris && r.temps;
  if (avecSouris) { root.addEventListener('pointermove', survol, { passive: true }); root.addEventListener('pointerleave', quitte); }

  // Garde-fou : si l'appareil peine (médiane > 34 ms), on baisse la densité, puis on fige le temps (plus de respiration).
  let intervalles = [], mediane = 0, images = 0;
  const surveiller = dt => {
    intervalles.push(dt); if (intervalles.length < 40) return;
    mediane = intervalles.sort((a, b) => a - b)[20]; intervalles = [];
    if (mediane <= 34 || !r.renderer) return;
    if (r.renderer.dpr > .75) { r.renderer.dpr = Math.max(.75, r.renderer.dpr * .7); r.mesurer(); return; }
    o.respire = false; r.temps = false;
  };
  const t0 = performance.now();
  let iPose = -1;
  const boucle = s.boucle(root, (t, dt) => {
    if (tw) {
      const k = Math.min(1, (performance.now() - tw.t0) / tw.d);
      etat.p = tw.de + (tw.a - tw.de) * tw.ease(k); sale = true;
      if (k >= 1) { const f = tw.fin; tw = null; f(); }
    }
    if (avecSouris) { sr.cx += (sr.x - sr.cx) * .06; sr.cy += (sr.y - sr.cy) * .06; sr.f += (sr.ft - sr.f) * .04; if (sr.f < .002 && !sr.ft) sr.f = 0; }
    const vivant = r.temps && ((mode === 'etale' && o.respire && etat.p > 0) || (mode === 'montee' && etat.p > 0 && etat.p < 1) || sr.f > 0);
    if (!sale && !vivant && !tw) return;
    sale = false; images++;
    if (etat.i !== iPose) { iPose = etat.i; figures.forEach((f, k) => f.classList.toggle('est-visible', k === etat.i)); }
    r.poser(etat.p, etat.i, (performance.now() - t0) / 1000, sr);
    if (vivant || tw) surveiller(dt);
  });
  const ro = new ResizeObserver(() => { r.mesurer(); sale = true; });
  ro.observe(root);

  const nettoyages = [];
  if (multi) nettoyages.push(etapesEpinglees());
  else if (o.declencheur === 'defilement') {
    const { gsap } = s;
    const t = gsap.fromTo(etat, { p: etat.p }, { p: 1, ease: 'none', onUpdate: () => { sale = true; }, scrollTrigger: { trigger: root, start: o.debut, end: o.fin, scrub: .6, invalidateOnRefresh: true } });
    nettoyages.push(() => { t.scrollTrigger?.kill(); t.kill(); });
  } else {
    // Arrivée : jouée une fois après le délai ; apparition : jouée à l'entrée dans l'écran. Retrait : en sortie, rejouée au retour.
    let timer = 0, vu = false;
    if (o.declencheur === 'arrivee') timer = setTimeout(() => { vu = true; jouer(); }, o.delai * 1000);
    if (o.declencheur === 'apparition' || o.retrait) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= .3) { if (o.declencheur === 'apparition' || vu) { vu = true; jouer(); } }
        else if (!e.isIntersecting && o.retrait && vu) retirer();
      }, { threshold: [0, .3] });
      io.observe(scene);
      nettoyages.push(() => io.disconnect());
    }
    nettoyages.push(() => clearTimeout(timer));
  }
  s.rafraichir();

  // ---------- Étapes épinglées (voile) : le voile recouvre l'image puis se retire sur la suivante ----------
  function etapesEpinglees() {
    const { gsap, ScrollTrigger } = s;
    const grille = root.querySelector('.rae__grille') || root;
    const colonne = root.querySelector('.rae__etapes');
    const n = Math.min(figures.length, etapes.length);
    const titre = e => e.querySelector('h3')?.textContent.trim() || '';
    let cible = -1, chaine = Promise.resolve(), aller = () => {};
    const puces = document.createElement('ol'); puces.className = 'rae__puces';
    const boutons = etapes.slice(0, n).map((e, i) => {
      const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.className = 'rae__puce';
      b.innerHTML = `<span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="socle-sr">Étape ${i + 1} : ${titre(e)}</span>`;
      b.addEventListener('click', () => aller(i)); li.appendChild(b); puces.appendChild(li); return b;
    });
    const marquer = i => {
      etapes.forEach((e, k) => e.classList.toggle('est-active', k === Math.max(0, i)));
      boutons.forEach((b, k) => k === Math.max(0, i) ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
    };
    const montrer = i => {
      if (i === cible) return; cible = i; marquer(i);
      chaine = chaine.then(async () => {
        if (cible < 0) { await vers(0, .7, EASE.doux); return; }
        if (etat.p > .13 && etat.i !== cible) await vers(.12, .55, EASE.entree);
        etat.i = Math.max(0, cible); sale = true;
        await vers(1, 1.1, EASE.sortie);
      });
    };
    const eh = () => parseFloat(getComputedStyle(html).getPropertyValue('--entete-h')) || 0;
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
      root.classList.add('rae--pile');
      const tete = colonne?.querySelector('.rae__tete'); if (tete) tete.after(puces); else colonne?.prepend(puces);
      r.mesurer(); etat.p = 0; etat.i = 0; cible = -1; sale = true; marquer(0);
      const st = ScrollTrigger.create({
        trigger: grille, start: () => `top ${eh()}`, end: () => '+=' + Math.round(innerHeight * o.pas * n / 100), pin: true, invalidateOnRefresh: true,
        onUpdate: self => { if (self.progress > 0) montrer(Math.min(n - 1, Math.floor(self.progress * n * .999))); },
        onToggle: self => root.classList.toggle('est-epingle', self.isActive),
      });
      const entree = ScrollTrigger.create({ trigger: grille, start: 'top 65%', end: 'bottom top', onEnter: () => { if (cible < 0) montrer(0); }, onLeaveBack: () => { if (o.retrait) montrer(-1); } });
      if (entree.isActive || st.progress > 0) montrer(Math.max(0, Math.min(n - 1, Math.floor(st.progress * n * .999))));
      aller = i => { const y = st.start + (st.end - st.start) * (i + .5) / n; if (s.lenis) s.lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' }); };
      return () => { st.kill(); entree.kill(); puces.remove(); root.classList.remove('rae--pile', 'est-epingle'); etapes.forEach(e => e.classList.remove('est-active')); figures.forEach(f => f.classList.remove('est-visible')); iPose = -1; };
    });
    return () => mm.revert();
  }

  return {
    jouer, retirer,
    async rejouer() { await retirer(); await jouer(); },
    /** dernière médiane mesurée (ms entre deux images) et images rendues */
    mesure: () => ({ mediane, images, gl: !!r.renderer }),
    detruire() {
      nettoyages.forEach(f => f()); boucle.arreter(); ro.disconnect(); tw = null;
      root.removeEventListener('pointermove', survol); root.removeEventListener('pointerleave', quitte);
      r.detruire(); root.classList.remove('rae--' + mode, 'rae--forme-tache', 'rae--pris');
    },
  };
}
