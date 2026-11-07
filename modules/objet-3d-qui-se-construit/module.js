// Objet 3D qui se construit : un objet du métier en CSS 3D (maison, meuble, produit, empilement) se monte pièce par pièce
// pendant que la section est épinglée, tourne sur lui-même, et se fait pivoter à la main (souris ou doigt) avec élan.
// Ses faces s'éclairent selon leur orientation face à une lumière fixe. Les étapes du texte s'allument avec les pièces.
// Rien n'est dessiné en JavaScript : le module pose des variables (--m de chaque pièce, --o3d-ry, ombres des faces),
// le CSS décrit les pièces (boîtes .o3d__boite et leurs faces) et leur arrivée.
// Téléphone ou écran bas : pas d'épinglage, l'objet se monte pendant que la scène traverse l'écran.
// Mode calme, « réduire les animations », sans JavaScript : objet monté, de trois quarts, toutes les étapes visibles (CSS).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.o3d (.o3d__scene > .o3d__objet > .o3d__piece[data-de][data-a] ; ol.o3d__etapes > li[data-de])
 * @param {object} [options]
 * @param {number} [options.longueur=2.2]    durée de l'épinglage, en hauteurs d'écran
 * @param {number} [options.depart=-32]      angle de départ (degrés, rotateY)
 * @param {number} [options.tour=360]        rotation pendant la construction (degrés ; 360 : l'objet finit de trois quarts, comme il a commencé)
 * @param {number} [options.inclinaison=-22] regard vers le bas (degrés, rotateX)
 * @param {number} [options.lumiere=-35]     direction d'où vient la lumière (degrés, 0 : de face) pour l'ombre des faces
 * @param {number} [options.largeur=700]     largeur de l'objet dans son repère (px), pour l'échelle
 * @param {number} [options.hauteur=480]     hauteur de l'objet dans son repère (px), pour l'échelle
 * @param {number} [options.largeurMin=900]  largeur à partir de laquelle la section s'épingle
 * @param {number} [options.hauteurMin=600]  hauteur à partir de laquelle la section s'épingle
 */
export async function init(root, options = {}) {
  const o = { longueur: 2.2, depart: -32, tour: 360, inclinaison: -22, lumiere: -35, largeur: 700, hauteur: 480, largeurMin: 900, hauteurMin: 600, ...options };
  const s = await pret(['scrolltrigger']);
  const scene = root.querySelector('.o3d__scene');
  const objet = root.querySelector('.o3d__objet');
  const pieces = [...root.querySelectorAll('.o3d__piece')];
  const etapes = [...root.querySelectorAll('.o3d__etapes [data-de]')];
  if (!scene || !objet || !pieces.length) return { detruire() {} };

  /* Échelle : l'objet tient dans la scène, à toutes les tailles. */
  const echelle = () => { const r = scene.getBoundingClientRect(); root.style.setProperty('--o3d-k', Math.min(r.width / o.largeur, r.height / o.hauteur, 1.15).toFixed(3)); };
  echelle();
  const ro = new ResizeObserver(echelle); ro.observe(scene);
  root.style.setProperty('--o3d-rx', o.inclinaison + 'deg');

  const etat = { p: 1, main: 0, v: 0, tenu: false };
  const lisse = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / Math.max(0.001, b - a))); return x * x * (3 - 2 * x); };
  const ombre = (ry, n) => { const d = (((ry + n - o.lumiere) % 360) + 360) % 360 * Math.PI / 180; return (0.5 * (1 - Math.max(0, Math.cos(d)))).toFixed(3); };
  function poser() {
    const ry = o.depart + etat.p * o.tour + etat.main;
    root.style.setProperty('--o3d-ry', ry.toFixed(2) + 'deg');
    root.style.setProperty('--o3d-o-av', ombre(ry, 0)); root.style.setProperty('--o3d-o-d', ombre(ry, 90));
    root.style.setProperty('--o3d-o-ar', ombre(ry, 180)); root.style.setProperty('--o3d-o-g', ombre(ry, 270));
    pieces.forEach((pc) => {
      const m = lisse(parseFloat(pc.dataset.de) || 0, parseFloat(pc.dataset.a) || 1, etat.p);
      if (m !== pc.__m) { pc.__m = m; pc.style.setProperty('--m', m.toFixed(3)); pc.classList.toggle('est-posee', m >= 0.999); pc.style.visibility = m <= 0.001 ? 'hidden' : ''; }
    });
    let n = -1; etapes.forEach((e, i) => { if (etat.p + 0.001 >= (parseFloat(e.dataset.de) || 0)) n = i; });
    etapes.forEach((e, i) => e.classList.toggle('est-active', i === n));
  }
  if (s.calme) { poser(); return { detruire() { ro.disconnect(); } }; }
  root.classList.add('est-actif');
  etat.p = 0; poser();

  /* À la main, avec élan ; la boucle ne tourne que pendant l'élan. */
  let raf = 0, avant = 0;
  const tour = (t) => {
    const dt = Math.min(0.05, avant ? (t - avant) / 1000 : 1 / 60); avant = t;
    if (!etat.tenu && Math.abs(etat.v) > 4) { etat.main += etat.v * dt; etat.v *= Math.exp(-dt * 2.4); poser(); raf = requestAnimationFrame(tour); }
    else { raf = 0; avant = 0; }
  };
  let id = null, x0 = 0, t0 = 0;
  scene.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; etat.tenu = true; etat.v = 0; x0 = e.clientX; t0 = performance.now(); scene.setPointerCapture(id); root.classList.add('est-touche'); });
  scene.addEventListener('lostpointercapture', () => { if (!etat.tenu) return; etat.tenu = false; etat.v = 0; });
  scene.addEventListener('pointermove', (e) => {
    if (!etat.tenu || e.pointerId !== id) return;
    const t = performance.now(), d = (e.clientX - x0) * 0.45;
    etat.v += (d / Math.max(0.008, (t - t0) / 1000) - etat.v) * 0.35; etat.main += d; x0 = e.clientX; t0 = t; poser();
  });
  const lacher = (e) => { if (!etat.tenu || (e && e.pointerId !== id)) return; etat.tenu = false; if (performance.now() - t0 > 120) etat.v = 0; etat.v = Math.max(-900, Math.min(900, etat.v)); if (!raf) raf = requestAnimationFrame(tour); };
  scene.addEventListener('pointerup', lacher); scene.addEventListener('pointercancel', lacher);
  scene.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); etat.main += e.key === 'ArrowLeft' ? -20 : 20; poser(); } });

  const { gsap, ScrollTrigger } = s;
  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('o3d--epingle'); echelle();
    const st = ScrollTrigger.create({ trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true, scrub: 0.8,
      onUpdate: (x) => { etat.p = x.progress; poser(); }, onRefresh: (x) => { etat.p = x.progress; poser(); }, onToggle: (x) => root.classList.toggle('est-epingle', x.isActive) });
    return () => { st.kill(); root.classList.remove('o3d--epingle', 'est-epingle'); echelle(); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const st = ScrollTrigger.create({ trigger: scene, start: 'top 85%', end: 'bottom 35%', scrub: 0.6,
      onUpdate: (x) => { etat.p = x.progress; poser(); }, onRefresh: (x) => { etat.p = x.progress; poser(); } });
    return () => st.kill();
  });
  return { etat, detruire() { mm.revert(); ro.disconnect(); cancelAnimationFrame(raf); root.classList.remove('est-actif'); } };
}
