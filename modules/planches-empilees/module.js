// Planches empilées : une planche par métier, service ou offre. L'empilement est en CSS (position: sticky) :
// chaque planche se colle sous l'en-tête, décalée de la précédente, et la suivante vient la recouvrir.
// module.js ajoute seulement :
//  - le recul et le voile de la planche recouverte (--ple-p, calculé au défilement, sans ScrollTrigger) ;
//  - le repli .ple--plat (liste simple) quand le contenu d'une planche déborde de la hauteur utile ;
//  - la classe est-epingle sur la planche collée (contrôle « tout tient dans l'écran ») ;
//  - au clavier, une planche recouverte qui reçoit le focus est ramenée au-dessus de la pile.
// Mode calme, « réduire les animations », téléphone (< 700 px) ou écran bas (< 520 px) : liste simple, rien ne bouge (CSS).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.ple
 * @param {object} [options]
 * @param {number} [options.reduction=.05]  recul (échelle) par planche posée dessus
 * @param {number} [options.voile=.45]      assombrissement maximal de la planche recouverte (0 = aucun)
 * @param {number} [options.rotation=0]     inclinaison en degrés de la planche recouverte, alternée (1 à 1,5 pour un effet « fiches posées »)
 * @param {number} [options.profondeur=3]   nombre de planches au-delà duquel le recul n'augmente plus
 */
export async function init(root, options = {}) {
  const o = { reduction: .05, voile: .45, rotation: 0, profondeur: 3, ...options };
  const s = await pret([]);
  const pile = root.querySelector('.ple__pile');
  const planches = [...root.querySelectorAll('.ple__planche')];
  if (!pile || planches.length < 2) return { detruire() {} };

  root.style.setProperty('--ple-n', planches.length);
  root.style.setProperty('--ple-reduction', o.reduction);
  root.style.setProperty('--ple-voile', o.voile);
  root.style.setProperty('--ple-rotation', o.rotation + 'deg');
  planches.forEach((p, i) => { p.style.setProperty('--ple-i', i); p.style.setProperty('--ple-signe', i % 2 ? -1 : 1); });

  const empile = () => getComputedStyle(planches[0]).position === 'sticky';
  let hauts = [];   // valeur de top (px) de chaque planche collée, relue à chaque vérification

  // Repli : si le contenu d'une planche ne tient pas dans la hauteur utile, liste simple.
  function verifier() {
    root.classList.remove('ple--plat');
    if (empile()) {
      const deborde = planches.some(p => {
        const c = p.querySelector('.ple__contenu');
        return p.scrollHeight > p.clientHeight + 1 || (c && c.scrollHeight > c.clientHeight + 1);
      });
      root.classList.toggle('ple--plat', deborde);
    }
    hauts = planches.map(p => parseFloat(getComputedStyle(p).top) || 0);
    maj();
  }

  let id = 0, visible = false;
  function maj() {
    id = 0;
    if (!empile()) {
      planches.forEach(p => { p.style.setProperty('--ple-p', 0); p.classList.remove('est-epingle'); });
      return;
    }
    const h = innerHeight;
    const r = planches.map(p => p.getBoundingClientRect());
    const bas = pile.getBoundingClientRect().bottom;
    // q[j] : avancée de la planche j, de l'entrée en bas de l'écran (0) à sa place dans la pile (1).
    const q = r.map((x, j) => j === 0 ? 0 : Math.min(1, Math.max(0, (h - x.top) / Math.max(1, h - hauts[j]))));
    planches.forEach((p, i) => {
      let prof = 0; for (let j = i + 1; j < q.length; j++) prof += q[j];
      p.style.setProperty('--ple-p', Math.min(o.profondeur, prof).toFixed(3));
      const colle = Math.abs(r[i].top - hauts[i]) < 1.5 && bas > r[i].top + p.offsetHeight + 1;
      p.classList.toggle('est-epingle', colle);
    });
  }
  const demander = () => { if (!id && visible) id = requestAnimationFrame(maj); };

  // Clavier : une planche recouverte qui reçoit le focus revient au-dessus (position de défilement où elle vient de se coller).
  function surFocus(e) {
    const p = e.target.closest('.ple__planche');
    if (!p || !empile()) return;
    const i = planches.indexOf(p), suivante = planches[i + 1];
    if (!suivante || suivante.getBoundingClientRect().top >= p.getBoundingClientRect().bottom - 1) return;
    const ecart = parseFloat(getComputedStyle(pile).rowGap) || 0;
    const y = pile.getBoundingClientRect().top + scrollY + i * (p.offsetHeight + ecart) - hauts[i];
    if (s.lenis) s.lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y);
  }

  let attente = 0;
  const surResize = () => { cancelAnimationFrame(attente); attente = requestAnimationFrame(verifier); };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; demander(); }, { rootMargin: '200px 0px' });
  io.observe(pile);
  addEventListener('scroll', demander, { passive: true });
  addEventListener('resize', surResize);
  root.addEventListener('focusin', surFocus);
  for (const img of root.querySelectorAll('img')) if (!img.complete) img.addEventListener('load', surResize, { once: true });
  document.fonts?.ready.then(surResize);
  verifier();

  return {
    detruire() {
      io.disconnect(); cancelAnimationFrame(id); cancelAnimationFrame(attente);
      removeEventListener('scroll', demander); removeEventListener('resize', surResize);
      root.removeEventListener('focusin', surFocus);
      root.classList.remove('ple--plat');
      planches.forEach(p => { p.classList.remove('est-epingle'); p.style.removeProperty('--ple-p'); });
    },
  };
}
