// Transition de page en iris : au clic sur un lien interne, un disque de la couleur du voile grandit depuis le point du clic
// jusqu'à couvrir l'écran, la navigation a lieu, puis sur la page d'arrivée (qui s'affiche déjà couverte) un trou s'ouvre
// dans le voile, centré sur l'objet d'ouverture de la page ([data-iris-centre]) ou sur le centre de l'écran.
// Nécessite le script critique du head (voir NOTES.md) qui pose html.tir-couvert avant le premier affichage.
// Repli sans clip-path ni mask : le voile apparaît et disparaît en fondu.
import { pret } from '../../socle/socle.js';

const CLE = 'tir-voile';
const normaliser = p => (p.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/');
const W = () => document.documentElement.clientWidth || innerWidth, H = () => innerHeight;
const rayonDepuis = (x, y) => Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(W() - x, y), Math.hypot(x, H() - y), Math.hypot(W() - x, H() - y))) + 2;
const enDouceur = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const gere = () => !!(window.CSS && CSS.supports('clip-path', 'circle(10px at 10px 10px)')
  && (CSS.supports('mask-image', 'radial-gradient(black, black)') || CSS.supports('-webkit-mask-image', 'radial-gradient(black, black)')));

/** Centre de la partie visible de l'objet d'ouverture (il peut dépasser en bas de l'écran), sinon centre de l'écran. */
export function centreOuverture(selecteur = '[data-iris-centre]') {
  const el = document.querySelector(selecteur);
  if (el) {
    const r = el.getBoundingClientRect();
    const g = Math.max(r.left, 0), d = Math.min(r.right, W()), h = Math.max(r.top, 0), b = Math.min(r.bottom, H());
    if (d - g > 60 && b - h > 60) return { x: (g + d) / 2, y: (h + b) / 2, r: Math.min(d - g, b - h) / 2, entier: b - h >= r.height - 1, el };
  }
  return { x: W() / 2, y: H() / 2, r: 0, entier: false, el: null };
}

/**
 * @param {HTMLElement} root  div.tir (div.tir__corps > span.tir__nom)
 * @param {object} [options]
 * @param {number} [options.couvrir=.55]   durée du disque qui couvre l'écran (s)
 * @param {number} [options.ouvrir=.8]     durée du trou qui s'ouvre à l'arrivée (s)
 * @param {boolean} [options.nom=true]     affiche le nom de la page d'arrivée (data-voile-nom ou texte du lien)
 * @param {string} [options.centre='[data-iris-centre]']  objet d'ouverture de la page d'arrivée
 * @param {string} [options.exclure='[data-sans-voile]']  liens qui naviguent sans voile
 */
export async function init(root, options = {}) {
  const o = { couvrir: .55, ouvrir: .8, nom: true, centre: '[data-iris-centre]', exclure: '[data-sans-voile]', ...options };
  const html = document.documentElement;
  const etiquette = root.querySelector('.tir__nom');
  const s = await pret([]);
  const iris = gere();
  let enCours = false, point = null, fini = null;

  const nettoyer = () => {
    root.getAnimations().forEach(a => a.cancel());
    root.classList.remove('est-actif', 'est-ouvre');
    ['--cx', '--cy', '--trou'].forEach(p => root.style.removeProperty(p));
    html.classList.remove('tir-couvert');
    enCours = false;
  };

  /** Trou qui s'ouvre depuis l'objet d'ouverture ; image par image (variable --trou), sans dépendre d'@property. */
  function ouvrir() {
    if (s.calme) { nettoyer(); return Promise.resolve(); }
    root.classList.add('est-actif');
    html.classList.remove('tir-couvert');
    if (!iris) return root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: o.ouvrir * 600, easing: 'ease-out' }).finished.catch(() => {}).then(nettoyer);
    const c = centreOuverture(o.centre);
    const R = rayonDepuis(c.x, c.y), r0 = c.el && c.el.dataset.irisCentre === 'disque' && c.entier ? c.r : -2;
    root.style.setProperty('--cx', `${c.x}px`); root.style.setProperty('--cy', `${c.y}px`); root.style.setProperty('--trou', `${r0}px`);
    root.classList.add('est-ouvre');
    const d = o.ouvrir * 1000, t0 = performance.now();
    return new Promise(ok => {
      fini = () => { fini = null; ok(); };
      const pas = t => {
        if (!fini) return;
        const p = Math.min(1, Math.max(0, (t - t0) / d));
        root.style.setProperty('--trou', `${(r0 + enDouceur(p) * (R - r0)).toFixed(1)}px`);
        if (p < 1) requestAnimationFrame(pas); else fini();
      };
      requestAnimationFrame(pas);
      setTimeout(() => fini && fini(), d + 400); /* onglet en arrière-plan */
    }).then(nettoyer);
  }

  if (html.classList.contains('tir-couvert')) ouvrir();

  function partir(url, nom) {
    if (s.calme || enCours) { location.href = url; return; }
    enCours = true;
    try { sessionStorage.setItem(CLE, '1'); } catch {}
    if (etiquette) etiquette.textContent = o.nom ? nom : '';
    root.classList.add('est-actif');
    const x = point ? point.x : W() / 2, y = point ? point.y : H() / 2;
    const anim = iris
      ? root.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${rayonDepuis(x, y)}px at ${x}px ${y}px)` }],
        { duration: o.couvrir * 1000, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards' })
      : root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: o.couvrir * 700, fill: 'forwards' });
    const secours = setTimeout(() => (location.href = url), o.couvrir * 1000 + 500);
    anim.finished.catch(() => {}).then(() => { clearTimeout(secours); location.href = url; });
  }

  function defiler(cible) {
    const eh = parseFloat(getComputedStyle(html).getPropertyValue('--entete-h')) || 0;
    const y = cible ? cible.getBoundingClientRect().top + scrollY - eh : 0;
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
  }

  const auClic = e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.matches(o.exclure)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (normaliser(url.pathname) === normaliser(location.pathname) && url.search === location.search) {
      e.preventDefault();
      const cible = url.hash.length > 1 ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      defiler(cible);
      if (url.hash && cible) history.replaceState(null, '', url.hash);
      return;
    }
    e.preventDefault();
    /* Point de départ : le clic ; au clavier (detail 0), le centre du lien. */
    if (e.detail !== 0) point = { x: e.clientX, y: e.clientY };
    else { const r = a.getBoundingClientRect(); point = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    partir(url.href, a.dataset.voileNom || a.textContent.replace(/\s+/g, ' ').trim());
  };
  document.addEventListener('click', auClic);

  const auRetour = e => { if (e.persisted) { try { sessionStorage.removeItem(CLE); } catch {} if (fini) fini(); nettoyer(); } };
  addEventListener('pageshow', auRetour);

  return { partir, ouvrir, detruire() { document.removeEventListener('click', auClic); removeEventListener('pageshow', auRetour); nettoyer(); } };
}
