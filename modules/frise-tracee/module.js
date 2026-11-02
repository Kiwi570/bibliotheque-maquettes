// Frise tracée et compteurs : les chiffres montent à leur arrivée (largeur finale réservée),
// puis le trait de la frise se dessine au rythme du défilement ; chaque étape s'allume quand le trait l'atteint.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.frt
 * @param {object} [options]
 * @param {number} [options.duree=2.2]  durée de montée des compteurs, en secondes
 * @param {string} [options.locale='fr-FR']  format des nombres (espace fine des milliers)
 */
export async function init(root, options = {}) {
  const o = { duree: 2.2, locale: 'fr-FR', ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const frise = root.querySelector('.frt__frise');
  const trait = root.querySelector('.frt__trait');
  const chemin = trait?.querySelector('path');
  const etapes = [...root.querySelectorAll('.frt__etape')];
  const tues = [];

  // Trait : longueur = hauteur de la frise, mesurée au refresh.
  const tracer = () => { const h = frise.offsetHeight; chemin.setAttribute('d', `M2 0 L2 ${h}`); trait.setAttribute('viewBox', `0 0 4 ${h}`); chemin.style.strokeDasharray = h; return h; };
  tracer();
  if (s.calme) { chemin.style.strokeDashoffset = 0; etapes.forEach(e => e.classList.add('est-passee')); return { detruire() {} }; }

  // Compteurs : la valeur finale reste dans le HTML (sans JavaScript, elle s'affiche telle quelle).
  for (const el of root.querySelectorAll('[data-compte]')) {
    const fin = Number(el.dataset.compte), suffixe = el.dataset.suffixe || '', fmt = new Intl.NumberFormat(o.locale);
    el.style.minWidth = el.getBoundingClientRect().width + 'px'; // place du chiffre final réservée
    el.textContent = '0' + suffixe;
    const v = { n: 0 };
    tues.push(ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(v, { n: fin, duration: o.duree, ease: 'power3.out', onUpdate: () => { el.textContent = fmt.format(Math.round(v.n)) + suffixe; } }) }));
  }
  const tw = gsap.fromTo(chemin, { strokeDashoffset: () => frise.offsetHeight }, {
    strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: frise, start: 'top 70%', end: 'bottom 70%', scrub: true, invalidateOnRefresh: true, onRefresh: tracer,
      onUpdate: self => { const y = self.progress * frise.offsetHeight; etapes.forEach(e => e.classList.toggle('est-passee', e.offsetTop + 10 <= y)); } },
  });
  for (const e of etapes) {
    const an = e.querySelector('.frt__annee'), vis = e.querySelector('.frt__visuel > *');
    tues.push(gsap.fromTo(an, { xPercent: -20, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: e, start: 'top 85%', once: true } }));
    if (vis) tues.push(gsap.fromTo(vis, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 80%', once: true } }));
  }
  s.rafraichir();
  return { detruire() { tw.scrollTrigger?.kill(); tw.kill(); tues.forEach(t => (t.scrollTrigger ? (t.scrollTrigger.kill(), t.kill()) : t.kill?.())); } };
}
