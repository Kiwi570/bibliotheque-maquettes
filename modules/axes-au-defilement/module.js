// Axes au défilement : les titres d'une police variable changent de caractère à mesure qu'ils montent dans l'écran
// (Fraunces « sage » SOFT 100, WONK 0 vers « sauvage » SOFT 0, WONK 1 ; Recursive casual ; Roboto Flex grade…).
// Réservé aux axes qui ne changent pas la largeur du texte (SOFT, WONK, GRAD, CASL, MONO…) : jamais wght ni wdth,
// sinon les lignes se recomposent et la mise en page saute pendant le défilement.
import { pret } from '../../socle/socle.js';

const lire = txt => Object.fromEntries([...String(txt).matchAll(/["']([A-Za-z]{4})["']\s+(-?[\d.]+)/g)].map(m => [m[1], parseFloat(m[2])]));
const ecrire = axes => Object.entries(axes).map(([k, v]) => `"${k}" ${Math.round(v * 100) / 100}`).join(', ');

/**
 * @param {HTMLElement} root  conteneur ; ses éléments [data-axes] (ou options.selecteur) sont animés
 * @param {object} [options]
 * @param {string} [options.selecteur='[data-axes]']
 * @param {string} [options.de='"SOFT" 100, "WONK" 0']  réglage au départ (data-axes-de sur un élément pour le changer)
 * @param {string} [options.a='"SOFT" 0, "WONK" 1']     réglage à l'arrivée (data-axes-a)
 * @param {string[]} [options.bascule=['WONK']]  axes à deux états : ils basculent à 55 % du trajet au lieu de varier
 * @param {string} [options.debut='top 90%'] [options.fin='top 38%']  trajet ScrollTrigger
 */
export async function init(root, options = {}) {
  const o = { selecteur: '[data-axes]', de: '"SOFT" 100, "WONK" 0', a: '"SOFT" 0, "WONK" 1', bascule: ['WONK'], debut: 'top 90%', fin: 'top 38%', ...options };
  const s = await pret(['gsap', 'scrolltrigger']);
  const els = [...root.querySelectorAll(o.selecteur)];
  const triggers = [];
  for (const el of els) {
    const de = lire(el.dataset.axesDe || o.de), a = lire(el.dataset.axesA || o.a);
    const noms = [...new Set([...Object.keys(de), ...Object.keys(a)])];
    let dernier = '';
    const poser = p => {
      const v = {};
      for (const k of noms) {
        const x = de[k] ?? a[k], y = a[k] ?? de[k];
        v[k] = o.bascule.includes(k) ? (p > .55 ? y : x) : x + (y - x) * p;
      }
      const txt = ecrire(v);
      if (txt !== dernier) { dernier = txt; el.style.fontVariationSettings = txt; }
    };
    /* Mode calme : état d'arrivée directement, rien ne bouge. */
    if (s.calme) { poser(1); continue; }
    poser(0);
    triggers.push(s.ScrollTrigger.create({ trigger: el, start: o.debut, end: o.fin, onUpdate: st => poser(st.progress), onRefresh: st => poser(st.progress) }));
  }
  return { detruire() { triggers.forEach(t => t.kill()); els.forEach(el => (el.style.fontVariationSettings = '')); } };
}
