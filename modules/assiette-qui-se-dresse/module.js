// Assiette qui se dresse : vue de dessus, les éléments d'un plat arrivent un à un dans l'assiette pendant que la section est
// épinglée (purée tirée à la cuillère, tranches posées en éventail, jus en filet, herbes et fleur de sel en pluie),
// et la recette, à côté, s'allume étape par étape. Inspiré d'objet-3d-qui-se-construit (même progression, même épinglage).
// Rien n'est dessiné en JavaScript : le module pose --m (0 à 1) sur chaque élément, le CSS décrit leur arrivée.
// Téléphone ou écran bas : pas d'épinglage, le plat se dresse pendant que l'assiette traverse l'écran.
// Mode calme, « réduire les animations », sans JavaScript : l'assiette dressée, toutes les étapes visibles (CSS).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.assiette (.assiette__scene > .assiette__element[data-de][data-a] ; ol.assiette__etapes > li[data-de])
 * @param {object} [options]
 * @param {number} [options.longueur=2.4]    durée de l'épinglage, en hauteurs d'écran
 * @param {number} [options.largeurMin=900]  largeur à partir de laquelle la section s'épingle
 * @param {number} [options.hauteurMin=600]  hauteur à partir de laquelle la section s'épingle
 * @param {number} [options.fin=.96]         progression à laquelle le plat est entièrement dressé (le reste de l'épinglage le laisse voir)
 */
export async function init(root, options = {}) {
  const o = { longueur: 2.4, largeurMin: 900, hauteurMin: 600, fin: 0.96, ...options };
  const scene = root.querySelector('.assiette__scene');
  const elements = [...root.querySelectorAll('.assiette__element')];
  const etapes = [...root.querySelectorAll('.assiette__etapes [data-de]')];
  // Mode calme : rien à charger, le CSS montre l'assiette dressée.
  if (!scene || !elements.length || (await pret([])).calme) return { detruire() {} };
  const s = await pret(['scrolltrigger']);

  const lisse = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / Math.max(0.001, b - a))); return x * x * (3 - 2 * x); };
  const etat = { p: 1 };
  const minuteurs = new Set();
  function poser() {
    const p = Math.min(1, etat.p / o.fin);
    elements.forEach((el) => {
      // Gestes trace et pluie : progression linéaire (le tracé et l'ordre des grains font eux-mêmes la courbe).
      const de = parseFloat(el.dataset.de) || 0, a = parseFloat(el.dataset.a) || 1;
      const m = el.dataset.geste ? Math.min(1, Math.max(0, (p - de) / Math.max(0.001, a - de))) : lisse(de, a, p);
      if (m === el.__m) return;
      const avant = el.__m ?? 1; el.__m = m;
      el.style.setProperty('--m', m.toFixed(4));
      el.style.visibility = m <= 0.0005 ? 'hidden' : '';
      if (m >= 0.999 && avant < 0.999 && el.__vu) {
        el.classList.remove('vient-de-se-poser'); void el.offsetWidth; el.classList.add('vient-de-se-poser');
        const t = setTimeout(() => { el.classList.remove('vient-de-se-poser'); minuteurs.delete(t); }, 460); minuteurs.add(t);
      }
      el.__vu = true;
    });
    let n = -1; etapes.forEach((e, i) => { if (p + 0.001 >= (parseFloat(e.dataset.de) || 0)) n = i; });
    etapes.forEach((e, i) => { e.classList.toggle('est-active', i === n); e.classList.toggle('est-faite', i < n); });
    root.classList.toggle('est-dresse', p >= 0.999);
  }
  root.classList.add('est-actif');
  etat.p = 0; poser();

  const { gsap, ScrollTrigger } = s;
  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('assiette--epingle');
    const st = ScrollTrigger.create({ trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true, scrub: 0.6,
      onUpdate: (x) => { etat.p = x.progress; poser(); }, onRefresh: (x) => { etat.p = x.progress; poser(); }, onToggle: (x) => root.classList.toggle('est-epingle', x.isActive) });
    return () => { st.kill(); root.classList.remove('assiette--epingle', 'est-epingle'); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const st = ScrollTrigger.create({ trigger: scene, start: 'top 85%', end: 'bottom 40%', scrub: 0.5,
      onUpdate: (x) => { etat.p = x.progress; poser(); }, onRefresh: (x) => { etat.p = x.progress; poser(); } });
    return () => st.kill();
  });
  return { etat, detruire() { mm.revert(); minuteurs.forEach(clearTimeout); root.classList.remove('est-actif', 'est-dresse'); elements.forEach((el) => { el.style.removeProperty('--m'); el.style.visibility = ''; }); } };
}
