// Socle commun des modules : charge GSAP, ScrollTrigger, SplitText, Flip, Lenis et OGL depuis vendor/ (une seule fois),
// mesure --entete-h et --barres-h, respecte « réduire les animations » et le mode calme,
// et regroupe les ScrollTrigger.refresh() (polices, images, changements de hauteur).
// Les modules n'instancient jamais GSAP ni Lenis eux-mêmes : ils appellent pret([...]) et reçoivent le socle.

const ICI = new URL('.', import.meta.url).href;
const FICHIERS = { gsap: 'gsap.min.js', scrolltrigger: 'ScrollTrigger.min.js', splittext: 'SplitText.min.js', flip: 'Flip.min.js', lenis: 'lenis.min.js', ogl: 'ogl.min.js' };
const ORDRE = ['gsap', 'scrolltrigger', 'splittext', 'flip', 'lenis', 'ogl'];
const charges = {};

function script(nom) {
  return (charges[nom] ??= new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = ICI + 'vendor/' + FICHIERS[nom];
    s.onload = ok; s.onerror = () => ko(new Error('socle : ' + nom + ' introuvable'));
    document.head.appendChild(s);
  }));
}

const mqReduit = matchMedia('(prefers-reduced-motion: reduce)');
const html = document.documentElement;
export const socle = {
  gsap: null, ScrollTrigger: null, SplitText: null, Flip: null, OGL: null, lenis: null,
  /** vrai si l'utilisateur a demandé moins d'animations (système ou bouton « mode calme ») */
  get calme() { return mqReduit.matches || html.classList.contains('calme'); },
  /** vrai avec une souris (survols, curseur, effets lourds) */
  get souris() { return matchMedia('(hover: hover) and (pointer: fine)').matches; },
  get telephone() { return innerWidth < 700; },
  /** WebGL disponible (et non désactivé par ?sanswebgl) */
  webgl() {
    if (/[?&]sanswebgl\b/.test(location.search)) return false;
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
  },
  rafraichir,
  boucle,
  mesurer,
};

// ---------- Mesures ----------
function mesurer() {
  const entete = document.querySelector('[data-entete]');
  const pos = entete ? getComputedStyle(entete).position : '';
  const h = pos === 'fixed' || pos === 'sticky' ? Math.round(entete.getBoundingClientRect().height) : 0;
  html.style.setProperty('--entete-h', h + 'px');
  let bas = 0;
  for (const b of document.querySelectorAll('[data-barre]')) { const r = b.getBoundingClientRect(); if (r.height && getComputedStyle(b).display !== 'none' && r.bottom >= innerHeight - 2) bas = Math.max(bas, Math.round(innerHeight - r.top)); }
  html.style.setProperty('--barres-h', bas + 'px');
}

// ---------- Rafraîchissement regroupé ----------
let attente = 0;
function rafraichir() {
  cancelAnimationFrame(attente);
  attente = requestAnimationFrame(() => { mesurer(); socle.ScrollTrigger?.refresh(); });
}

// ---------- Boucles qui s'arrêtent hors écran et onglet caché ----------
/** boucle(el, fn) : appelle fn(t, dt) à chaque image tant que el est visible. Renvoie { arreter }. */
function boucle(el, fn) {
  let visible = false, id = 0, avant = 0, fini = false;
  const tour = t => { if (!visible || fini || document.hidden) { id = 0; return; } const dt = avant ? Math.min(64, t - avant) : 16; avant = t; fn(t, dt); id = requestAnimationFrame(tour); };
  const relancer = () => { if (!id && visible && !document.hidden && !fini) { avant = 0; id = requestAnimationFrame(tour); } };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; relancer(); }, { rootMargin: '100px' });
  io.observe(el);
  document.addEventListener('visibilitychange', relancer);
  return { arreter() { fini = true; io.disconnect(); cancelAnimationFrame(id); document.removeEventListener('visibilitychange', relancer); } };
}

// ---------- Démarrage ----------
let demarre = null;
/** pret(['scrolltrigger','splittext',...]) charge ce qui manque et renvoie le socle. gsap est toujours chargé. */
export async function pret(besoins = []) {
  const voulus = new Set(['gsap', ...besoins.map(b => b.toLowerCase())]);
  if (voulus.has('splittext') || voulus.has('flip')) voulus.add('gsap');
  for (const nom of ORDRE) if (voulus.has(nom)) await script(nom);
  const g = window.gsap;
  socle.gsap = g;
  if (window.ScrollTrigger && !socle.ScrollTrigger) { g.registerPlugin(window.ScrollTrigger); socle.ScrollTrigger = window.ScrollTrigger; }
  if (window.SplitText && !socle.SplitText) { g.registerPlugin(window.SplitText); socle.SplitText = window.SplitText; }
  if (window.Flip && !socle.Flip) { g.registerPlugin(window.Flip); socle.Flip = window.Flip; }
  if (window.OGL) socle.OGL = window.OGL;
  if (!demarre) demarre = demarrer();
  await demarre;
  return socle;
}

async function demarrer() {
  // Mode calme mémorisé (localStorage), ou forcé par ?calme. Pour l'appliquer avant le premier affichage, copier
  // dans le <head> : <script>try{if(localStorage.getItem('socle-calme')==='1')document.documentElement.classList.add('calme')}catch(e){}</script>
  try { if (localStorage.getItem('socle-calme') === '1') html.classList.add('calme'); } catch {}
  if (/[?&]calme\b/.test(location.search)) html.classList.add('calme');
  mesurer();
  const ro = new ResizeObserver(() => rafraichir());
  for (const el of document.querySelectorAll('[data-entete], [data-barre]')) ro.observe(el);
  ro.observe(document.body);
  addEventListener('resize', rafraichir);
  // Défilement adouci : seulement avec une molette de souris hors Mac, jamais en mode calme ni au toucher.
  const voulu = html.dataset.lisse !== 'non' && !socle.calme && socle.souris && !/Mac|iPhone|iPad/.test(navigator.platform) && !/[?&]natif\b/.test(location.search);
  if ((voulu || /[?&]lisse\b/.test(location.search)) && !socle.calme) {
    await script('lenis');
    socle.lenis = new window.Lenis({ autoRaf: false, anchors: { offset: () => -parseFloat(getComputedStyle(html).getPropertyValue('--entete-h')) || 0 } });
    if (socle.ScrollTrigger) socle.lenis.on('scroll', socle.ScrollTrigger.update);
    socle.gsap.ticker.add(t => socle.lenis.raf(t * 1000));
    socle.gsap.ticker.lagSmoothing(0);
  }
  // Retour à la position après un changement de mode calme.
  const retour = sessionStorage.getItem('socle-retour');
  if (retour !== null) { sessionStorage.removeItem('socle-retour'); requestAnimationFrame(() => scrollTo(0, +retour)); }
  // Polices et images : un seul refresh quand elles arrivent.
  document.fonts?.ready.then(rafraichir);
  for (const img of document.images) if (!img.complete) img.addEventListener('load', rafraichir, { once: true });
  addEventListener('load', rafraichir, { once: true });
  // Bouton mode calme éventuel : [data-calme]
  for (const b of document.querySelectorAll('[data-calme]')) {
    b.setAttribute('aria-pressed', String(html.classList.contains('calme')));
    b.addEventListener('click', () => {
      const calme = !html.classList.contains('calme');
      try { localStorage.setItem('socle-calme', calme ? '1' : '0'); } catch {}
      const u = new URL(location.href); u.searchParams.delete('calme');
      sessionStorage.setItem('socle-retour', String(scrollY)); // le rechargement revient à la même position
      location.replace(u.toString().replace(/\?$/, ''));
    });
  }
}
