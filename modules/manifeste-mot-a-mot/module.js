// Manifeste mot à mot : le paragraphe est découpé en mots, qui passent de la couleur d'accent à 30 % d'opacité
// à la couleur du texte à 100 %, au rythme de la molette. Fond en parallaxe léger.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.mmm
 * @param {object} [options]
 * @param {string} [options.debut='top 78%']  début du balayage (ScrollTrigger)
 * @param {string} [options.fin='bottom 45%'] fin du balayage
 * @param {number} [options.opacite=.3]       opacité de départ des mots
 * @param {number} [options.parallaxe=8]      déplacement du fond en %, 0 pour couper
 */
export async function init(root, options = {}) {
  const o = { debut: 'top 78%', fin: 'bottom 45%', opacite: .3, parallaxe: 8, ...options };
  const s = await pret(['scrolltrigger', 'splittext']);
  const { gsap, SplitText } = s;
  const texte = root.querySelector('.mmm__texte');
  if (!texte || s.calme) return { detruire() {} };
  const cs = getComputedStyle(root);
  const accent = cs.getPropertyValue('--couleur-accent').trim();
  const couleur = cs.getPropertyValue('--couleur-texte').trim();
  const split = new SplitText(texte, { type: 'words', wordsClass: 'mmm__mot' });
  const st = { trigger: texte, start: o.debut, end: o.fin, scrub: true, invalidateOnRefresh: true };
  const t1 = gsap.fromTo(split.words, { opacity: o.opacite, color: accent }, { opacity: 1, color: couleur, ease: 'none', stagger: .1, scrollTrigger: st });
  const fond = root.querySelector('.mmm__fond');
  const t2 = fond && o.parallaxe ? gsap.fromTo(fond, { yPercent: -o.parallaxe }, { yPercent: o.parallaxe, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } }) : null;
  // Nouveau découpage si la largeur change (les lignes bougent, pas les mots : rien à refaire) ; polices : refresh du socle.
  s.rafraichir();
  return { detruire() { t1.scrollTrigger?.kill(); t1.kill(); t2?.scrollTrigger?.kill(); t2?.kill(); split.revert(); } };
}
