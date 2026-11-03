// Trame photo : une photo rendue en trame d'impression (points de demi-teinte ou lignes) qui se résout en photo nette
// à l'apparition, au survol, au défilement ou sur commande. Un seul contexte WebGL (OGL) partagé par toutes les photos
// de la page, recopié dans un canvas 2D par photo ; rendu seulement quand quelque chose change.
// Sans WebGL : trame en masque CSS (points ou lignes) qui s'ouvre. Mode calme, réduire les animations, sans JavaScript : photo nette.
import { pret } from '../../socle/socle.js';

const VERT = 'attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
const FRAG = `precision highp float;
uniform sampler2D tMap; uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uPos;
uniform float uProg; uniform vec2 uMouse; uniform float uHover; uniform float uLoupe;
uniform float uCell; uniform float uDepart; uniform float uAngle; uniform float uLignes;
uniform vec3 uEncre; uniform vec3 uPapier; uniform float uTeinte;
varying vec2 vUv;
vec2 couvrir(vec2 uv){ vec2 s = uRes / uImg; float sc = max(s.x, s.y); vec2 t = uImg * sc;
  return (uv * uRes + (t - uRes) * vec2(uPos.x, 1.0 - uPos.y)) / t; }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 px = vUv * uRes;
  float dm = distance(px, uMouse * uRes);
  float loupe = uLoupe > 0.0 ? uHover * (1.0 - smoothstep(uLoupe * 0.78, uLoupe, dm)) : 0.0;
  float k = smoothstep(0.0, 1.0, clamp(uProg, 0.0, 1.0)) * (1.0 - loupe);
  float cell = mix(uCell * uDepart, uCell, smoothstep(0.0, 0.8, uProg));
  cell = mix(cell, uCell, loupe);
  float c = cos(uAngle), s = sin(uAngle);
  vec2 p = vec2(c * px.x - s * px.y, s * px.x + c * px.y);
  vec2 ctr = (floor(p / cell) + 0.5) * cell;
  if (uLignes > 0.5) ctr.x = p.x;
  vec2 back = vec2(c * ctr.x + s * ctr.y, -s * ctr.x + c * ctr.y);
  vec3 cs = texture2D(tMap, couvrir(clamp(back / uRes, 0.0, 1.0))).rgb;
  float lp = lum(uPapier), le = lum(uEncre); float ec = le - lp;
  ec = abs(ec) < 0.08 ? (ec < 0.0 ? -0.08 : 0.08) : ec;
  float cov = clamp((lum(cs) - lp) / ec, 0.0, 1.0);
  float m;
  if (uLignes > 0.5) { float h = cov * cell * 0.5; m = 1.0 - smoothstep(h - 0.75, h + 0.75, abs(p.y - ctr.y)); }
  else { float r = cell * 0.7071 * sqrt(cov) * 1.04; m = (1.0 - smoothstep(r - 0.75, r + 0.75, length(p - ctr))) * step(0.015, cov); }
  vec3 encre = mix(uEncre, cs, uTeinte);
  vec3 ht = mix(uPapier, encre, m);
  vec3 photo = texture2D(tMap, couvrir(vUv)).rgb;
  vec3 col = mix(ht, photo, k);
  if (uLoupe > 0.0) { float bord = uHover * (smoothstep(uLoupe - 2.5, uLoupe, dm) - smoothstep(uLoupe, uLoupe + 2.5, dm)); col = mix(col, uEncre, bord * 0.85); }
  gl_FragColor = vec4(col, 1.0);
}`;

// Couleur CSS (variables, color-mix…) → [r, g, b] entre 0 et 1, résolue par le navigateur dans le contexte du module.
function rgb(root, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  root.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
}

// ---------- Moteur partagé : un contexte WebGL pour toutes les photos ----------
const MAX = 1600;
let moteur;
function obtenirMoteur(O) {
  if (moteur !== undefined) return moteur;
  try {
    const renderer = new O.Renderer({ dpr: 1, alpha: false, antialias: false, premultipliedAlpha: false, depth: false });
    const gl = renderer.gl; if (!gl) throw new Error('webgl');
    renderer.setSize(MAX, MAX);
    const program = new O.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: {
      tMap: { value: null }, uRes: { value: [1, 1] }, uImg: { value: [1, 1] }, uPos: { value: [.5, .5] }, uProg: { value: 0 },
      uMouse: { value: [.5, .5] }, uHover: { value: 0 }, uLoupe: { value: 0 }, uCell: { value: 8 }, uDepart: { value: 2.4 },
      uAngle: { value: 0 }, uLignes: { value: 0 }, uEncre: { value: [0, 0, 0] }, uPapier: { value: [1, 1, 1] }, uTeinte: { value: 0 } } });
    const mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program });
    moteur = { O, renderer, gl, program, mesh };
  } catch { moteur = null; }
  return moteur;
}

/**
 * @param {HTMLElement} root  figure.trame contenant .trame__cadre > img.trame__img (même origine ou CORS, object-fit: cover)
 * @param {object} [options]
 * @param {'points'|'lignes'} [options.forme='points']  trame de demi-teinte en points ou en lignes (gravure)
 * @param {number} [options.cellule=8]       taille de la cellule de trame, en px CSS (4 à 20)
 * @param {number} [options.angle=15]        angle de la trame, en degrés (15 offset, 45 classique, 0 droite)
 * @param {string} [options.encre]           couleur CSS de l'encre, par défaut --trame-encre, sinon --couleur-texte
 * @param {string} [options.papier]          couleur CSS du papier, par défaut --trame-papier, sinon --couleur-fond
 * @param {number} [options.teinte=0]        part de la couleur de la photo dans l'encre (0 encre pure, 1 couleurs de la photo)
 * @param {'apparition'|'survol'|'defilement'|'manuel'} [options.declencheur='apparition']
 *        apparition : se résout une fois à l'entrée dans l'écran ; survol : se résout au survol ou au focus de `zone`
 *        (sur écran tactile, se comporte comme apparition) ; defilement : suit la position dans la page ; manuel : api.reveler()
 * @param {number} [options.duree=1.8]       durée de la résolution, en s
 * @param {number} [options.delai=0]         attente avant la résolution (apparition), en s
 * @param {string} [options.debut='top 85%'] début (apparition, defilement), syntaxe ScrollTrigger
 * @param {string} [options.fin='center 45%'] fin (defilement)
 * @param {number} [options.depart=2.4]      grossissement de la trame au départ (1 : taille constante ; 1 par défaut en survol)
 * @param {number} [options.loupe=90]        rayon du compte-fils en px : la trame revient sous la souris (0 pour couper ; jamais en survol)
 * @param {string|HTMLElement} [options.zone] élément qui déclenche le survol (sélecteur d'un ancêtre, ex. '.carte'), par défaut root
 * @returns {Promise<{reveler(): void, tramer(): void, regler(v: number): void, detruire(): void}>}
 */
export async function init(root, options = {}) {
  const o = { forme: 'points', cellule: 8, angle: 15, encre: 'var(--trame-encre, var(--couleur-texte))', papier: 'var(--trame-papier, var(--couleur-fond))', teinte: 0, declencheur: 'apparition',
    duree: 1.8, delai: 0, debut: 'top 85%', fin: 'center 45%', depart: options.declencheur === 'survol' ? 1 : 2.4, loupe: 90, zone: null, ...options };
  const vide = { reveler() {}, tramer() {}, regler() {}, detruire() {} };
  const img = root.querySelector('.trame__img') || root.querySelector('img');
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('calme');
  if (!img || reduit) return vide;
  const boite = img.parentElement; // .trame__cadre : la boîte à la taille de la photo
  const zone = typeof o.zone === 'string' ? root.closest(o.zone) || root : o.zone || root;
  const survolPossible = matchMedia('(hover: hover)').matches;
  const mode = o.declencheur === 'survol' && !survolPossible ? 'apparition' : o.declencheur;
  // État de départ posé tout de suite (avant le chargement du socle) : trame CSS, pour éviter un éclair de photo nette.
  root.style.setProperty('--trame-cellule', o.cellule + 'px');
  root.style.setProperty('--trame-angle', o.angle + 'deg');
  root.classList.add('trame--attente', o.forme === 'lignes' ? 'trame--lignes' : 'trame--points');

  const s = await pret(['scrolltrigger', 'ogl']);
  if (s.calme) { root.classList.remove('trame--attente'); return vide; }
  const { gsap, ScrollTrigger } = s;
  await (img.complete && img.naturalWidth ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }));
  await img.decode?.().catch(() => {});

  const etat = { prog: 0, hover: 0, mx: .5, my: .5 };
  const m = img.naturalWidth && s.webgl() && s.OGL ? obtenirMoteur(s.OGL) : null;
  let canvas, ctx, tex, ro, io, visible = true, attente = 0;
  const pos = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map(v => v.endsWith('%') ? parseFloat(v) / 100 : .5);
  const couleurs = { encre: rgb(root, o.encre), papier: rgb(root, o.papier) };

  const dessiner = () => {
    attente = 0;
    if (!visible || !m) return;
    const r = boite.getBoundingClientRect(); if (!r.width || !r.height) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    const k = Math.min(1, MAX / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const u = m.program.uniforms, ech = w / r.width;
    u.tMap.value = tex; u.uRes.value = [w, h]; u.uImg.value = [img.naturalWidth, img.naturalHeight]; u.uPos.value = [pos[0] ?? .5, pos[1] ?? .5];
    u.uProg.value = etat.prog; u.uMouse.value = [etat.mx, etat.my]; u.uHover.value = etat.hover;
    u.uLoupe.value = mode === 'survol' ? 0 : o.loupe * ech; u.uCell.value = Math.max(3, o.cellule * ech); u.uDepart.value = o.depart;
    u.uAngle.value = o.angle * Math.PI / 180; u.uLignes.value = o.forme === 'lignes' ? 1 : 0;
    u.uEncre.value = couleurs.encre; u.uPapier.value = couleurs.papier; u.uTeinte.value = o.teinte;
    m.renderer.width = w; m.renderer.height = h;
    m.renderer.render({ scene: m.mesh });
    ctx.drawImage(m.gl.canvas, 0, m.gl.canvas.height - h, w, h, 0, 0, w, h);
  };
  const demander = () => { if (!attente) attente = requestAnimationFrame(dessiner); };

  if (m) {
    canvas = document.createElement('canvas'); canvas.className = 'trame__canvas'; canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d');
    tex = new m.O.Texture(m.gl, { image: img, generateMipmaps: false, minFilter: m.gl.LINEAR, magFilter: m.gl.LINEAR, flipY: true });
    boite.appendChild(canvas);
    ro = new ResizeObserver(demander); ro.observe(boite);
    io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) demander(); }, { rootMargin: '80px' }); io.observe(boite);
    dessiner();
    root.classList.add('trame--gl');
  } else {
    root.classList.add('trame--css');
  }
  root.classList.remove('trame--attente');

  // ---------- Résolution ----------
  let tween = null, fin = 0;
  const vers = (v, duree = o.duree, delai = 0) => {
    tween?.kill(); clearTimeout(fin);
    if (m) { tween = gsap.to(etat, { prog: v, duration: duree, delay: delai, ease: 'power2.inOut', onUpdate: demander }); return; }
    // Repli CSS : la transition de --trame-k (module.css) ouvre ou referme le masque.
    root.style.setProperty('--trame-duree', duree + 's'); root.style.setProperty('--trame-delai', delai + 's');
    root.classList.remove('trame--nette');
    root.classList.toggle('trame--revelee', v >= .5);
    if (v >= .5) fin = setTimeout(() => root.classList.add('trame--nette'), (duree + delai) * 1000 + 60);
  };
  const regler = v => { tween?.kill(); etat.prog = v; if (m) demander(); else { root.classList.toggle('trame--revelee', v >= .5); root.classList.toggle('trame--nette', v >= 1); } };

  const nettoyages = [];
  const ecoute = (el, type, fn, opt) => { el.addEventListener(type, fn, opt); nettoyages.push(() => el.removeEventListener(type, fn, opt)); };
  let st = null;
  if (mode === 'apparition') st = ScrollTrigger.create({ trigger: root, start: o.debut, once: true, onEnter: () => vers(1, o.duree, o.delai) });
  else if (mode === 'defilement') {
    if (m) st = ScrollTrigger.create({ trigger: root, start: o.debut, end: o.fin, onUpdate: x => { etat.prog = x.progress; demander(); } });
    else st = ScrollTrigger.create({ trigger: root, start: o.debut, end: o.fin, onUpdate: x => regler(x.progress) });
  } else if (mode === 'survol') {
    ecoute(zone, 'pointerenter', () => vers(1, o.duree * .5));
    ecoute(zone, 'pointerleave', () => { if (!zone.contains(document.activeElement)) vers(0, o.duree * .5); });
    ecoute(zone, 'focusin', () => vers(1, o.duree * .5));
    ecoute(zone, 'focusout', e => { if (!zone.contains(e.relatedTarget) && !zone.matches(':hover')) vers(0, o.duree * .5); });
  }
  // Compte-fils : la trame revient sous la souris une fois la photo nette (apparition, defilement, manuel).
  if (m && mode !== 'survol' && o.loupe > 0 && survolPossible) {
    const h = gsap.quickTo(etat, 'hover', { duration: .45, ease: 'power2.out', onUpdate: demander });
    const mx = gsap.quickTo(etat, 'mx', { duration: .25, ease: 'power3.out', onUpdate: demander });
    const my = gsap.quickTo(etat, 'my', { duration: .25, ease: 'power3.out', onUpdate: demander });
    ecoute(boite, 'pointermove', e => { const r = boite.getBoundingClientRect(); mx((e.clientX - r.left) / r.width); my(1 - (e.clientY - r.top) / r.height); h(1); }, { passive: true });
    ecoute(boite, 'pointerleave', () => h(0));
  }

  return {
    reveler: () => vers(1), tramer: () => vers(0), regler,
    detruire() {
      tween?.kill(); clearTimeout(fin); st?.kill(); nettoyages.forEach(f => f()); ro?.disconnect(); io?.disconnect(); cancelAnimationFrame(attente);
      canvas?.remove(); root.classList.remove('trame--gl', 'trame--css', 'trame--revelee', 'trame--nette', 'trame--attente', 'trame--lignes', 'trame--points');
    },
  };
}
