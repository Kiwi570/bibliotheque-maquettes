// Objet à faire tourner à la main : on l'attrape (souris ou doigt) et on le fait tourner autour de son centre, dans les deux sens ;
// il garde son élan au lâcher puis revient à sa rotation de repos (disque qui tourne, roue, cadran, assiette, bobine).
// Le défilement le scratche aussi (vitesse de défilement ajoutée à la rotation). Une lumière suit le pointeur.
// Le module n'impose aucun rendu : il pose sur la racine les variables --oat-angle (deg), --oat-lumiere (deg),
// --oat-eclat (0 à 1) et --oat-vitesse (0 à 1), et appelle options.dessiner(etat) à chaque image (pour un shader WebGL).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  div.oat (div.oat__objet, span.oat__reflet facultatif, p.oat__indice facultatif)
 * @param {object} [options]
 * @param {number} [options.repos=1.15]     vitesse de rotation au repos en radians par seconde (0 : immobile au repos)
 * @param {number} [options.defilement=.006] rotation ajoutée par px/s de défilement (0 : pas de scratch au défilement)
 * @param {number} [options.amorti=1.4]     retour à la vitesse de repos après le lâcher (plus grand : plus court)
 * @param {number} [options.elanMax=40]     élan maximal au lâcher (rad/s)
 * @param {string} [options.lumiere='section']  zone où la lumière suit la souris : 'section' (la section parente), 'objet' ou 'aucune'
 * @param {function} [options.dessiner]     dessiner({ angle, vitesse, lumiere, eclat, dt }) à chaque image
 */
export async function init(root, options = {}) {
  const o = { repos: 1.15, defilement: .006, amorti: 1.4, elanMax: 40, lumiere: 'section', dessiner: null, ...options };
  const s = await pret([]);
  const objet = root.querySelector('.oat__objet') || root;
  const indice = root.querySelector('.oat__indice');
  const etat = { angle: 0, elan: 0, tenu: false, lumiere: .75, lumiereCible: .75, eclat: 0, eclatCible: 0, vitesse: 0 };
  const poser = () => {
    root.style.setProperty('--oat-angle', `${(etat.angle * 180 / Math.PI).toFixed(2)}deg`);
    /* Repère CSS : 0deg en haut, sens horaire ; repère du pointeur : angle mathématique, y vers le haut. */
    root.style.setProperty('--oat-lumiere', `${(90 - etat.lumiere * 180 / Math.PI).toFixed(1)}deg`);
    root.style.setProperty('--oat-eclat', etat.eclat.toFixed(3));
    root.style.setProperty('--oat-vitesse', Math.min(1, Math.abs(etat.vitesse) / 20).toFixed(3));
  };
  poser();
  if (s.calme) { root.classList.add('est-calme'); o.dessiner && o.dessiner({ ...etat, dt: 0 }); return { etat, detruire() {} }; }
  root.classList.add('est-actif');

  /* Vitesse de défilement lissée (px/s), sans aucune mesure de mise en page. */
  const def = { y: scrollY, t: performance.now(), cible: 0, v: 0 };
  const auDefilement = () => { const t = performance.now(), dt = Math.max(1, t - def.t); def.cible = Math.max(-4000, Math.min(4000, (scrollY - def.y) / dt * 1000)); def.y = scrollY; def.t = t; };
  addEventListener('scroll', auDefilement, { passive: true });

  /* Centre mesuré au début du geste et au redimensionnement (jamais à chaque image). */
  let c = null;
  const mesurer = () => { const r = objet.getBoundingClientRect(); c = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; };
  let a0 = 0, t0 = 0, w = 0, id = null;
  const angle = e => Math.atan2(e.clientY - c.y, e.clientX - c.x);
  const bas = e => {
    if (e.button !== 0) return;
    mesurer();
    if (Math.hypot(e.clientX - c.x, e.clientY - c.y) > c.r) return;
    id = e.pointerId; etat.tenu = true; a0 = angle(e); t0 = performance.now(); w = 0;
    root.setPointerCapture?.(id);
    root.classList.add('est-tenu');
    indice?.classList.add('est-vu');
  };
  const bouge = e => {
    if (!etat.tenu || e.pointerId !== id) return;
    const a = angle(e), t = performance.now();
    let d = a - a0; d = Math.atan2(Math.sin(d), Math.cos(d));
    etat.angle += d;
    w += (d / (Math.max(1, t - t0) / 1000) - w) * .35;
    a0 = a; t0 = t;
  };
  const lacher = e => {
    if (!etat.tenu || (e && e.pointerId !== id)) return;
    etat.tenu = false; id = null;
    /* Élan : vitesse de la main moins la rotation de repos ; main immobile avant le lâcher : la rotation reprend doucement. */
    etat.elan = performance.now() - t0 > 120 ? -o.repos * .6 : Math.max(-o.elanMax, Math.min(o.elanMax, w - o.repos));
    root.classList.remove('est-tenu');
  };
  root.addEventListener('pointerdown', bas);
  root.addEventListener('pointermove', bouge);
  root.addEventListener('pointerup', lacher);
  root.addEventListener('pointercancel', lacher);

  /* Lumière : elle tourne vers la souris (jamais au doigt), amortie, et se stabilise dès que la souris s'arrête. */
  const zone = o.lumiere === 'aucune' ? null : o.lumiere === 'objet' ? root : (root.closest('section') || root);
  const survol = e => { if (e.pointerType !== 'mouse') return; if (!c) mesurer(); etat.lumiereCible = Math.atan2(-(e.clientY - c.y), e.clientX - c.x); etat.eclatCible = 1; };
  const sortie = () => { etat.lumiereCible = .75; etat.eclatCible = 0; };
  zone?.addEventListener('pointermove', survol);
  zone?.addEventListener('pointerleave', sortie);
  const auRedim = () => { c = null; };
  addEventListener('resize', auRedim);
  addEventListener('scroll', auRedim, { passive: true });

  const b = s.boucle(root, (t, dtms) => {
    const dt = dtms / 1000;
    def.cible *= Math.exp(-dt * 6);
    def.v += (def.cible - def.v) * (1 - Math.exp(-dt * 10));
    const avant = etat.angle;
    if (!etat.tenu) { etat.angle += (o.repos + def.v * o.defilement + etat.elan) * dt; etat.elan *= Math.exp(-dt * o.amorti); }
    etat.vitesse = (etat.angle - avant) / Math.max(dt, .001) || (etat.tenu ? w : 0);
    let dl = etat.lumiereCible - etat.lumiere; dl = Math.atan2(Math.sin(dl), Math.cos(dl));
    etat.lumiere += dl * (1 - Math.exp(-dt * 6));
    etat.eclat += (etat.eclatCible - etat.eclat) * (1 - Math.exp(-dt * 5));
    poser();
    o.dessiner && o.dessiner({ ...etat, dt });
  });

  return {
    etat,
    detruire() {
      b.arreter();
      removeEventListener('scroll', auDefilement); removeEventListener('resize', auRedim); removeEventListener('scroll', auRedim);
      root.removeEventListener('pointerdown', bas); root.removeEventListener('pointermove', bouge);
      root.removeEventListener('pointerup', lacher); root.removeEventListener('pointercancel', lacher);
      zone?.removeEventListener('pointermove', survol); zone?.removeEventListener('pointerleave', sortie);
    },
  };
}
