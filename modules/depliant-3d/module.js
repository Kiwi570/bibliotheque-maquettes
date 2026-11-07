// Dépliant 3D : un dépliant trois volets s'ouvre au défilement, dans l'ordre d'un vrai dépliant.
// La couverture (dos du volet droit) s'ouvre d'abord et découvre l'intérieur, puis le volet gauche se déplie ;
// le dépliant reste à plat jusqu'à la fin de l'épinglage. Une ombre de pli (--d3d-pli) suit l'ouverture.
// Ordinateur et tablette (761 px et plus, 560 px de haut et plus) : section épinglée. Téléphone ou écran bas :
// chaque volet se déplie quand il entre dans l'écran (rotation autour de son bord haut), sans jamais se replier.
// Mode calme, « réduire les animations », sans JavaScript : dépliant ouvert à plat, dos des volets retirés (CSS).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.d3d (article.d3d__volet × 3, chacun avec un span.d3d__verso facultatif)
 * @param {object} [options]
 * @param {number} [options.longueur=1.5]   durée de l'épinglage, en hauteurs d'écran
 * @param {number} [options.angle=172]      angle de départ des volets repliés (degrés)
 * @param {number} [options.largeurMin=761] largeur à partir de laquelle la section s'épingle
 * @param {number} [options.hauteurMin=560] hauteur à partir de laquelle la section s'épingle
 */
export async function init(root, options = {}) {
  const o = { longueur: 1.5, angle: 172, largeurMin: 761, hauteurMin: 560, ...options };
  const s = await pret(['scrolltrigger']);
  const volets = [...root.querySelectorAll('.d3d__volet')];
  if (volets.length !== 3 || s.calme) return { detruire() {} };
  const { gsap, ScrollTrigger } = s;
  const [g, m, d] = volets;
  const borne = (x) => Math.min(1, Math.max(0, x));
  const lisse = (x) => x * x * (3 - 2 * x);
  root.classList.add('est-actif');

  /* p de 0 à 1 : la couverture (volet droit) s'ouvre de 0 à .55, le volet gauche de .4 à .9. */
  function poser(p) {
    const b = lisse(borne(p / 0.55)), a = lisse(borne((p - 0.4) / 0.5));
    d.style.transform = `rotateY(${(-o.angle * (1 - b)).toFixed(2)}deg)`;
    g.style.transform = `rotateY(${(o.angle * (1 - a)).toFixed(2)}deg)`;
    d.style.setProperty('--d3d-pli', (0.35 * (1 - b)).toFixed(3));
    g.style.setProperty('--d3d-pli', (0.35 * (1 - a)).toFixed(3));
    m.style.setProperty('--d3d-pli', (0.2 * (1 - Math.min(a, b))).toFixed(3));
    /* Volet replié : son contenu n'est ni lisible ni atteignable au clavier. */
    [[g, a], [d, b]].forEach(([v, k]) => { const ouvert = k > 0.5; if (v.__ouvert !== ouvert) { v.__ouvert = ouvert; v.inert = !ouvert; } });
  }
  const final = () => volets.forEach((v) => { v.style.transform = ''; v.style.removeProperty('--d3d-pli'); v.inert = false; v.__ouvert = undefined; });

  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('d3d--epingle');
    poser(0);
    const st = ScrollTrigger.create({ trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true, scrub: 0.5,
      onUpdate: (x) => poser(x.progress), onRefresh: (x) => poser(x.progress), onToggle: (x) => root.classList.toggle('est-epingle', x.isActive) });
    return () => { st.kill(); final(); root.classList.remove('d3d--epingle', 'est-epingle'); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const sts = volets.map((v) => {
      let max = 0;
      const p = (x) => { max = Math.max(max, x); v.style.transform = max >= 1 ? '' : `rotateX(${(-70 * (1 - lisse(max))).toFixed(2)}deg)`; v.style.setProperty('--d3d-pli', (0.3 * (1 - max)).toFixed(3)); };
      p(0);
      return ScrollTrigger.create({ trigger: v, start: 'top 95%', end: 'top 55%', onUpdate: (x) => p(x.progress), onRefresh: (x) => p(x.progress) });
    });
    return () => { sts.forEach((x) => x.kill()); final(); };
  });
  return { detruire() { mm.revert(); root.classList.remove('est-actif'); } };
}
