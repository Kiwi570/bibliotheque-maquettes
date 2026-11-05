// Envol vers le panier : quand une pièce est ajoutée, sa photo s'arrondit (disque, pastille) et file en arc jusqu'au bouton
// du panier visible (en-tête sur ordinateur, barre du bas sur téléphone), qui rebondit à l'arrivée.
// Un en-tête caché par le défilement redescend pour recevoir la pièce. Le module ne gère pas le panier :
// le projet appelle envol() après son propre ajout, ou laisse init() écouter les boutons [data-envol].
import { pret } from '../../socle/socle.js';

let S = null;
const visible = el => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden';

/** Fait rebondir la cible (classe est-recu, animation CSS). */
export function rebond(cible) {
  if (!cible) return;
  cible.classList.remove('est-recu'); void cible.offsetWidth; cible.classList.add('est-recu');
  setTimeout(() => cible.classList.remove('est-recu'), 600);
}

/**
 * @param {object} o
 * @param {Element} o.depuis   image (ou élément) d'où part l'envol
 * @param {Element|Element[]|string} o.vers  bouton(s) du panier ; le premier affiché est pris
 * @param {string} [o.forme='disque']  'disque' (rond) ou 'carte' (garde ses coins)
 * @param {number} [o.duree=.8]
 * @param {function} [o.montrer]  montrer(cible) : ramène à l'écran une cible cachée (en-tête rétracté) ; renvoie le décalage en px
 * @returns {Promise<Element|null>} la cible atteinte
 */
export async function envol(o) {
  S ??= await pret(['gsap']);
  const liste = typeof o.vers === 'string' ? [...document.querySelectorAll(o.vers)] : [].concat(o.vers);
  const cible = liste.find(visible) || null;
  const img = o.depuis?.tagName === 'IMG' ? o.depuis : o.depuis?.querySelector?.('img') || o.depuis;
  if (!cible || !img || S.calme) { rebond(cible); return cible; }
  /* En-tête rétracté (transform) : on le fait redescendre et on vise sa position finale. */
  let decale = 0;
  const entete = cible.closest('[data-entete]');
  if (entete) {
    decale = Math.max(0, -entete.getBoundingClientRect().top);
    if (o.montrer) decale = o.montrer(cible) ?? decale;
    else document.documentElement.classList.remove('entete-cache');
  }
  const a = img.getBoundingClientRect(), z0 = cible.getBoundingClientRect();
  if (a.width < 4 || a.bottom < 0 || a.top > innerHeight) { rebond(cible); return cible; }
  const d = Math.min(a.width, a.height);
  const vol = document.createElement('div');
  vol.className = 'evp'; vol.setAttribute('aria-hidden', 'true');
  const src = img.currentSrc || img.src;
  vol.style.cssText = `left:${a.left + (a.width - d) / 2}px;top:${a.top + (a.height - d) / 2}px;width:${d}px;height:${d}px;` + (src ? `background-image:url("${src}")` : '');
  if (!src) vol.classList.add('evp--sans-image');
  document.body.appendChild(vol);
  const dx = z0.left + z0.width / 2 - (a.left + a.width / 2), dy = z0.top + decale + z0.height / 2 - (a.top + a.height / 2);
  const T = o.duree ?? .8, echelle = Math.max(.08, 28 / d);
  const { gsap } = S;
  await new Promise(ok => {
    gsap.timeline({ onComplete: ok })
      .to(vol, { borderRadius: o.forme === 'carte' ? '6px' : '50%', scale: .62, rotate: -12, duration: T * .28, ease: 'power2.out' }, 0)
      .to(vol, { x: dx, duration: T * .9, ease: 'power1.inOut' }, T * .15)
      .to(vol, { y: Math.min(dy, 0) - Math.max(60, innerHeight * .12), duration: T * .38, ease: 'power2.out' }, T * .15)
      .to(vol, { y: dy, duration: T * .52, ease: 'power2.in' }, T * .53)
      .to(vol, { scale: echelle, rotate: o.forme === 'carte' ? 30 : 260, duration: T * .75, ease: 'power2.in' }, T * .3)
      .to(vol, { opacity: 0, duration: T * .15 }, T * .97);
  });
  vol.remove();
  rebond(cible);
  return cible;
}

/**
 * Écoute les boutons d'ajout : [data-envol] dans root ; l'image part de la carte la plus proche ([data-envol-carte]).
 * @param {HTMLElement} root
 * @param {object} [options]
 * @param {string} [options.bouton='[data-envol]']
 * @param {string} [options.carte='[data-envol-carte]']
 * @param {string} [options.vers='[data-envol-cible]']
 * @param {string} [options.forme='disque']
 * @param {function} [options.quand]  quand(bouton) : vrai si l'envol doit partir (par défaut : aria-pressed devient « true », ou bouton sans aria-pressed)
 */
export async function init(root, options = {}) {
  const o = { bouton: '[data-envol]', carte: '[data-envol-carte]', vers: '[data-envol-cible]', forme: 'disque', quand: null, ...options };
  S = await pret(['gsap']);
  const auClic = e => {
    const b = e.target.closest(o.bouton);
    if (!b || !root.contains(b)) return;
    /* Laisser le projet mettre à jour le panier (et aria-pressed) avant de décider. */
    requestAnimationFrame(() => {
      const part = o.quand ? o.quand(b) : !b.hasAttribute('aria-pressed') || b.getAttribute('aria-pressed') === 'true';
      if (part) envol({ depuis: b.closest(o.carte) || b, vers: o.vers, forme: o.forme });
    });
  };
  root.addEventListener('click', auClic);
  return { envol, detruire() { root.removeEventListener('click', auClic); } };
}
