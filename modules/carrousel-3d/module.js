// Carrousel 3D : les cartes sont posées sur un cylindre qui tourne au défilement, se fait tourner à la main
// (souris ou doigt) avec élan, et aux flèches. Seules les cartes de face sont visibles, cliquables et atteignables
// au clavier : une carte de profil ou de dos sort de la tabulation (jamais une cible sous 44 px).
// Sans JavaScript, en mode calme et sous « réduire les animations » : rangée de cartes qui défile à l'horizontale (CSS).
// Aucune lecture de mise en page pendant le défilement : le rayon est mesuré au démarrage et au redimensionnement.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.c3d (ul.c3d__cylindre > li.c3d__carte ; boutons .c3d__prec / .c3d__suiv facultatifs)
 * @param {object} [options]
 * @param {number} [options.tour=180]       rotation (degrés) pendant que la section traverse l'écran (0 : pas de rotation au défilement)
 * @param {number} [options.inclinaison=-6] inclinaison du cylindre (degrés, rotateX)
 * @param {number} [options.face=62]        demi-angle (degrés) dans lequel une carte est « de face » (visible et cliquable)
 * @param {number} [options.ecart=1.12]     espace entre les cartes (1 : jointives)
 * @param {number} [options.lissage=.6]     scrub de ScrollTrigger
 */
export async function init(root, options = {}) {
  const o = { tour: 180, inclinaison: -6, face: 62, ecart: 1.12, lissage: .6, ...options };
  const s = await pret(['scrolltrigger']);
  const scene = root.querySelector('.c3d__scene');
  const cyl = root.querySelector('.c3d__cylindre');
  const cartes = [...root.querySelectorAll('.c3d__carte')];
  const prec = root.querySelector('.c3d__prec'), suiv = root.querySelector('.c3d__suiv');
  if (!scene || !cyl || cartes.length < 3) return { detruire() {} };
  const n = cartes.length, pas = 360 / n;
  const etat = { def: 0, main: 0, v: 0, tenu: false, cible: null };

  /* Flèches : en mode calme, elles font défiler la rangée. */
  const rangee = (sens) => cyl.scrollBy({ left: sens * (cartes[0].getBoundingClientRect().width + 16), behavior: s.calme ? 'auto' : 'smooth' });
  if (s.calme) {
    prec && prec.addEventListener('click', () => rangee(-1));
    suiv && suiv.addEventListener('click', () => rangee(1));
    return { detruire() {} };
  }
  root.classList.add('est-actif');

  /* Rayon : les cartes se touchent presque sur le cylindre (largeur mesurée, pas devinée). */
  const mesurer = () => {
    const l = cartes[0].offsetWidth || 260;
    const r = Math.round((l / 2) / Math.tan(Math.PI / n) * o.ecart);
    root.style.setProperty('--c3d-r', r + 'px');
    cartes.forEach((c, i) => c.style.setProperty('--c3d-a', (i * pas).toFixed(3) + 'deg'));
  };
  mesurer();
  const ro = new ResizeObserver(mesurer); ro.observe(scene);

  const angle = () => etat.def + etat.main;
  function poser() {
    const a = angle();
    cyl.style.transform = `translateZ(calc(-1 * var(--c3d-r))) rotateX(${o.inclinaison}deg) rotateY(${(-a).toFixed(2)}deg)`;
    cartes.forEach((c, i) => {
      const d = ((i * pas - a) % 360 + 540) % 360 - 180;
      const face = Math.abs(d) < o.face;
      if (face !== c.__face) {
        c.__face = face;
        c.classList.toggle('est-de-face', face);
        c.setAttribute('aria-hidden', face ? 'false' : 'true');
        c.querySelectorAll('a, button').forEach((x) => (x.tabIndex = face ? 0 : -1));
      }
      c.style.setProperty('--c3d-d', (Math.abs(d) / 180).toFixed(3));
    });
  }

  /* Boucle seulement pendant le mouvement (élan, retour à une carte) : rien ne tourne au repos. */
  let raf = 0, avant = 0;
  const tour = (t) => {
    const dt = Math.min(0.05, avant ? (t - avant) / 1000 : 1 / 60); avant = t;
    let encore = false;
    if (!etat.tenu && Math.abs(etat.v) > 3) { etat.main += etat.v * dt; etat.v *= Math.exp(-dt * 2.4); encore = true; }
    else if (!etat.tenu && etat.cible != null) {
      etat.main += (etat.cible - etat.main) * (1 - Math.exp(-dt * 7));
      if (Math.abs(etat.cible - etat.main) < 0.05) { etat.main = etat.cible; etat.cible = null; } else encore = true;
    }
    poser();
    raf = encore ? requestAnimationFrame(tour) : 0;
    if (!raf) avant = 0;
  };
  const relancer = () => { if (!raf) raf = requestAnimationFrame(tour); };

  /* Au défilement. */
  let st = null;
  if (o.tour && s.ScrollTrigger) {
    st = s.ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', scrub: o.lissage,
      onUpdate: (x) => { etat.def = -o.tour * 0.2 + x.progress * o.tour; poser(); } });
  }

  /* À la main, avec élan ; un glissement n'ouvre pas la carte sous le doigt. */
  let id = null, x0 = 0, t0 = 0, glisse = 0;
  scene.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; etat.tenu = true; etat.v = 0; etat.cible = null; x0 = e.clientX; t0 = performance.now(); glisse = 0; });
  scene.addEventListener('pointermove', (e) => {
    if (!etat.tenu || e.pointerId !== id) return;
    const t = performance.now(), d = -(e.clientX - x0) * 0.22;
    glisse += Math.abs(e.clientX - x0);
    if (glisse > 6 && !scene.hasPointerCapture(id)) scene.setPointerCapture(id);
    etat.v += (d / Math.max(0.008, (t - t0) / 1000) - etat.v) * 0.35;
    etat.main += d; x0 = e.clientX; t0 = t; poser();
  });
  const lacher = (e) => {
    if (!etat.tenu || (e && e.pointerId !== id)) return;
    etat.tenu = false;
    if (performance.now() - t0 > 120) etat.v = 0;
    etat.v = Math.max(-500, Math.min(500, etat.v));
    relancer();
  };
  scene.addEventListener('pointerup', lacher); scene.addEventListener('pointercancel', lacher);
  scene.addEventListener('click', (e) => { if (glisse > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  /* Flèches et clavier : la carte suivante vient de face. */
  const viser = (sens) => { const i = Math.round(angle() / pas) + sens; etat.cible = i * pas - etat.def; etat.v = 0; relancer(); };
  prec && prec.addEventListener('click', () => viser(-1));
  suiv && suiv.addEventListener('click', () => viser(1));
  scene.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); viser(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); viser(1); } });

  poser();
  return { etat, detruire() { ro.disconnect(); st && st.kill(); cancelAnimationFrame(raf); root.classList.remove('est-actif'); } };
}
