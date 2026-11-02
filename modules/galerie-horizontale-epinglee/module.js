// Galerie horizontale épinglée : la section se fixe, la piste de cartes défile à l'horizontale avec la molette.
// Téléphone, mode calme et sans JavaScript : défilement horizontal natif avec aimantation.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.ghe
 * @param {object} [options]
 * @param {number} [options.largeurMin=900]  largeur à partir de laquelle la galerie s'épingle
 * @param {number} [options.parallaxe=6]     glissement des visuels dans leur cadre, en % (0 pour couper)
 * @param {number|boolean} [options.lissage=1] valeur scrub de ScrollTrigger
 */
export async function init(root, options = {}) {
  const o = { largeurMin: 900, parallaxe: 6, lissage: 1, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const piste = root.querySelector('.ghe__piste');
  const barre = root.querySelector('.ghe__progression > span');
  if (!piste || s.calme) return { detruire() {} };

  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px)`, () => {
    root.classList.add('ghe--epinglee');
    // Une zone épinglée ne défile plus d'elle-même : elle quitte l'ordre de tabulation (les cartes y restent).
    piste.removeAttribute('tabindex'); piste.removeAttribute('role');
    const marge = () => parseFloat(getComputedStyle(piste).paddingLeft) || 0;
    const distance = () => Math.max(0, piste.scrollWidth - innerWidth + marge());
    const tw = gsap.to(piste, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: root, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: o.lissage, invalidateOnRefresh: true,
        onToggle: self => root.classList.toggle('est-epingle', self.isActive),
        onUpdate: self => { if (barre) barre.style.transform = `scaleX(${self.progress.toFixed(4)})`; },
      },
    });
    const st = tw.scrollTrigger;
    const visuels = o.parallaxe ? [...piste.querySelectorAll('.ghe__visuel > *')] : [];
    const tws = visuels.map(v => gsap.fromTo(v, { xPercent: -o.parallaxe }, { xPercent: o.parallaxe, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: () => '+=' + distance(), scrub: true, invalidateOnRefresh: true } }));
    // Clavier : la carte qui prend le focus est ramenée au centre de l'écran.
    const surFocus = e => {
      const carte = e.target.closest('.ghe__carte'); if (!carte) return;
      const d = distance(); if (!d) return;
      const cible = Math.min(d, Math.max(0, carte.offsetLeft + carte.offsetWidth / 2 - innerWidth / 2));
      const y = st.start + (st.end - st.start) * (cible / d);
      if (s.lenis) s.lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y);
    };
    piste.addEventListener('focusin', surFocus);
    return () => {
      piste.removeEventListener('focusin', surFocus);
      tws.forEach(t => t.scrollTrigger?.kill());
      root.classList.remove('ghe--epinglee', 'est-epingle');
      piste.setAttribute('tabindex', '0'); piste.setAttribute('role', 'region');
    };
  });
  s.rafraichir();
  return { detruire() { mm.revert(); } };
}
