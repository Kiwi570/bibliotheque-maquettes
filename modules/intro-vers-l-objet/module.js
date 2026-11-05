// Intro qui devient la page : l'objet de l'intro (disque, logo, cachet, boussole…) apparaît au centre d'un panneau plein écran,
// puis glisse et change d'échelle jusqu'à l'objet d'ouverture de la page ([data-iris-centre]) ; le panneau s'ouvre alors en
// cercle depuis cet objet. Avec data-iris-centre="disque" (objet rond, entier à l'écran), le trou démarre directement à sa
// taille : l'objet de l'intro est remplacé exactement par celui de la page.
// Le panneau est visible dès la première image grâce au script critique du head (classe html.ivo-intro, voir NOTES.md).
import { pret } from '../../socle/socle.js';

const W = () => document.documentElement.clientWidth || innerWidth, H = () => innerHeight;
const rayonDepuis = (x, y) => Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(W() - x, y), Math.hypot(x, H() - y), Math.hypot(W() - x, H() - y))) + 2;

/**
 * Ajoute à une timeline GSAP le glissement de l'objet vers la cible, puis l'ouverture en cercle du panneau.
 * À appeler dans l'intro d'un projet (fonction jouer du socle de la skill) : versObjet(tl, { panneau, objet }).
 * @param {object} tl  timeline GSAP
 * @param {object} o
 * @param {HTMLElement} o.panneau   panneau de l'intro (reçoit --cx, --cy, --trou ; masque radial dans module.css)
 * @param {HTMLElement} o.objet     objet de l'intro, centré dans le panneau
 * @param {string|HTMLElement} [o.cible='[data-iris-centre]']  objet d'ouverture de la page
 * @param {number} [o.a=1.1]        instant du départ dans la timeline (s)
 * @param {number} [o.duree=.5]     durée du glissement (s)
 * @param {number} [o.ouverture=.8] durée de l'ouverture du panneau (s)
 * @param {number} [o.echelleMin=.3] [o.echelleMax=1.3]  bornes de l'échelle de l'objet à l'arrivée
 */
export function versObjet(tl, o) {
  const { panneau, objet } = o;
  const a = o.a ?? 1.1, duree = o.duree ?? .5, ouverture = o.ouverture ?? .8;
  const cible = typeof o.cible === 'string' || !o.cible ? document.querySelector(o.cible || '[data-iris-centre]') : o.cible;
  const p = objet.getBoundingClientRect();
  let cx = W() / 2, cy = H() / 2, echelle = 1, r0 = -2;
  if (cible) {
    const r = cible.getBoundingClientRect();
    const g = Math.max(r.left, 0), d = Math.min(r.right, W()), h = Math.max(r.top, 0), b = Math.min(r.bottom, H());
    if (d - g > 60 && b - h > 60) {
      const t = Math.min(d - g, b - h);
      cx = (g + d) / 2; cy = (h + b) / 2;
      echelle = Math.min(o.echelleMax ?? 1.3, Math.max(o.echelleMin ?? .3, t / Math.max(1, p.width)));
      if (cible.dataset.irisCentre === 'disque' && b - h >= r.height - 1) r0 = t / 2 + 1;
    }
  }
  const dx = cx - (p.left + p.width / 2), dy = cy - (p.top + p.height / 2);
  tl.set(panneau, { '--cx': `${cx}px`, '--cy': `${cy}px`, '--trou': '-2px' }, 0)
    .fromTo(objet, { x: 0, y: 0, scale: 1 }, { x: dx, y: dy, scale: echelle, duration: duree, ease: 'power3.inOut' }, a)
    .set(panneau, { '--trou': `${r0}px` }, a + duree + .01)
    .to(panneau, { '--trou': `${rayonDepuis(cx, cy)}px`, duration: ouverture, ease: 'power3.in' }, a + duree + .01);
  return tl;
}

/**
 * Intro complète de démonstration (le socle de la skill a la sienne : n'y reprendre que versObjet).
 * @param {HTMLElement} root  div.ivo (div.ivo__scene > div.ivo__objet + p.ivo__legende, p.ivo__passer)
 * @param {object} [options]
 * @param {boolean} [options.tourner=true]  l'objet tourne en accélérant (disque, roue, boussole)
 * @param {string} [options.cible='[data-iris-centre]']
 * @param {function} [options.fin]  appelée quand la page est découverte
 */
export async function init(root, options = {}) {
  const o = { tourner: true, cible: '[data-iris-centre]', fin: null, ...options };
  const html = document.documentElement;
  const objet = root.querySelector('.ivo__objet'), legende = root.querySelector('.ivo__legende'), passer = root.querySelector('.ivo__passer');
  const s = await pret(['gsap']);
  const terminer = () => { html.classList.remove('ivo-intro'); root.hidden = true; o.fin && o.fin(); };
  if (s.calme || !html.classList.contains('ivo-intro')) { terminer(); return { tl: null }; }
  const { gsap } = s;
  scrollTo(0, 0);
  const tl = gsap.timeline({ onComplete: terminer });
  tl.fromTo(objet, { scale: .86, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'power2.out' }, 0);
  if (o.tourner) tl.fromTo(objet.firstElementChild || objet, { rotate: 0 }, { rotate: 900, duration: 2.1, ease: 'power2.in' }, 0);
  if (legende) tl.fromTo(legende, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, ease: 'back.out(2)' }, .7)
    .to(legende, { opacity: 0, duration: .25 }, 1.1);
  if (passer) tl.to(passer, { opacity: 0, duration: .25 }, 1.1);
  versObjet(tl, { panneau: root, objet, cible: o.cible, a: 1.1 });
  /* Une première action accélère, une seconde passe l'intro. */
  let n = 0;
  const action = () => { n++; if (n === 1) tl.timeScale(5); else tl.progress(1); };
  const types = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  types.forEach(t => addEventListener(t, action, { passive: true }));
  tl.eventCallback('onComplete', () => { types.forEach(t => removeEventListener(t, action)); terminer(); });
  setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 3500); /* garde-fou */
  return { tl };
}
