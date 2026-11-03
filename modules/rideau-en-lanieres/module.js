// Rideau en lanières : à l'arrivée, l'écran est couvert de lanières verticales qui s'ouvrent l'une après l'autre
// (glissement, chute, pivot ou écartement) sur le héros, déjà rendu dessous. Une fois par session, jamais en mode
// calme ni sous « réduire les animations », bouton « Passer » et touche Échap. Peut aussi refermer le rideau
// avant un changement de page (couvrir, option liens).
import { pret } from '../../socle/socle.js';

const ORDRES = { gauche: 'start', droite: 'end', centre: 'center', bords: 'edges', hasard: 'random' };

function lire(cle) { try { return sessionStorage.getItem(cle) === '1'; } catch { return false; } }
function noter(cle) { try { sessionStorage.setItem(cle, '1'); } catch {} }

/**
 * @param {HTMLElement} root  div.rdl (fixée, premier enfant du body)
 * @param {object} [options]
 * @param {number} [options.nombre=6]           lanières sur ordinateur et tablette
 * @param {number} [options.nombreTelephone=4]  lanières sous 700 px
 * @param {'glisse'|'chute'|'pivot'|'ecarte'} [options.effet='glisse']  manière dont chaque lanière s'en va
 * @param {'alterne'|'haut'|'bas'} [options.sens='alterne']  direction (glisse, chute, pivot)
 * @param {'gauche'|'droite'|'centre'|'bords'|'hasard'} [options.ordre]  lanière qui part la première ('centre' pour ecarte, 'gauche' sinon)
 * @param {'droite'|'feuille'} [options.forme='droite']  bandes droites ou feuilles en amande qui se chevauchent
 * @param {number} [options.duree=.8]       durée du départ d'une lanière (s)
 * @param {number} [options.decalage=.07]   décalage entre deux lanières (s)
 * @param {number} [options.delai=.15]      attente avant de commencer (s)
 * @param {number} [options.coeur=.9]       temps d'affichage du cœur (.rdl__coeur) avant l'ouverture, 0 pour le sauter
 * @param {true|false|'court'} [options.unique=true]  true : une fois par session ; 'court' : ouverture courte (sans cœur) aux visites suivantes ; false : à chaque chargement
 * @param {string} [options.cle='rideau-en-lanieres-vu']  clé sessionStorage (à recopier dans le script du <head>)
 * @param {boolean} [options.liens=false]   referme le rideau avant de suivre un lien interne vers une autre page
 * @param {Function} [options.apres]        appelé quand le héros commence à être découvert (enchaîner le titre)
 */
export async function init(root, options = {}) {
  let o = { nombre: 6, nombreTelephone: 4, effet: 'glisse', sens: 'alterne', ordre: null, forme: 'droite', duree: .8, decalage: .07, delai: .15, coeur: .9, unique: true, cle: 'rideau-en-lanieres-vu', liens: false, apres: null, ...options };
  const vide = { detruire() {}, rejouer() {}, passer() {}, couvrir(fn) { fn?.(); } };
  const piste = root.querySelector('.rdl__lanieres');
  if (!piste) return vide;
  const deja = lire(o.cle);
  const s = await pret(['gsap']);
  const { gsap } = s;
  const coeur = root.querySelector('.rdl__coeur');
  const bouton = root.querySelector('.rdl__passer');
  let tl = null, lanieres = [], annonce = false;

  function construire() {
    const n = Math.max(2, Math.round(s.telephone ? o.nombreTelephone : o.nombre));
    root.style.setProperty('--rdl-n', n);
    root.dataset.forme = o.forme === 'feuille' ? 'feuille' : 'droite';
    lanieres = Array.from({ length: n }, () => { const i = document.createElement('i'); i.className = 'rdl__laniere'; return i; });
    piste.replaceChildren(...lanieres);
  }

  // Position « ouvert » de la lanière i : le rideau va de l'état naturel (fermé) à celle-ci.
  function ouvert() {
    const n = lanieres.length;
    const dir = i => o.sens === 'haut' ? -1 : o.sens === 'bas' ? 1 : (i % 2 ? 1 : -1);
    if (o.effet === 'ecarte') {
      const l = innerWidth;
      return { x: (i, el) => { const r = el.getBoundingClientRect(); return i < n / 2 ? -(r.right + 40) : l - r.left + 40; }, rotation: i => (i < n / 2 ? -1 : 1) * 5, scale: 1.12, ease: 'power3.in' };
    }
    if (o.effet === 'chute') {
      const d = o.sens === 'haut' ? -1 : 1;
      return { yPercent: 118 * d, rotation: i => (i % 2 ? 1 : -1) * (5 + (i * 37 % 7)), transformOrigin: d > 0 ? '50% 0%' : '50% 100%', ease: 'power2.in' };
    }
    if (o.effet === 'pivot') return { rotationY: i => 92 * dir(i), opacity: 0, ease: 'power2.inOut' };
    return { yPercent: i => 102 * dir(i), ease: 'power3.inOut' };
  }
  const depart = () => ({ each: o.decalage, from: ORDRES[o.ordre] || (o.effet === 'ecarte' ? 'center' : 'start') });

  function signaler() {
    if (annonce) return; annonce = true;
    o.apres?.();
    root.dispatchEvent(new CustomEvent('rideau:ouvert', { bubbles: true }));
  }
  function finir() {
    tl?.kill(); tl = null;
    root.classList.add('est-fini'); root.classList.remove('est-pilote', 'est-couvre');
    gsap.set(lanieres, { clearProps: 'all' });
    if (coeur) gsap.set(coeur, { clearProps: 'all' });
    if (document.activeElement === bouton) bouton.blur();
    removeEventListener('keydown', clavier);
    signaler();
  }
  function passer() { if (tl && !root.classList.contains('est-couvre')) { if (coeur) gsap.to(coeur, { autoAlpha: 0, duration: .15, overwrite: true }); tl.timeScale(5); } }
  function clavier(e) { if (e.key === 'Escape') passer(); }

  function jouer(court) {
    tl?.kill(); annonce = false;
    construire();
    root.classList.remove('est-fini', 'est-couvre'); root.classList.add('est-pilote');
    addEventListener('keydown', clavier);
    tl = gsap.timeline({ onComplete: finir });
    let t0 = o.delai;
    if (coeur && !court && o.coeur > 0) {
      const traces = [...coeur.querySelectorAll('[data-trace]')];
      for (const p of traces) { const L = p.getTotalLength?.() || 300; gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); }
      tl.fromTo(coeur, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, t0)
        .to(traces, { strokeDashoffset: 0, duration: Math.max(.3, o.coeur * .8), ease: 'power2.inOut', stagger: .12 }, t0)
        .to(coeur, { autoAlpha: 0, y: -12, duration: .3, ease: 'power2.in' }, t0 + o.coeur);
      t0 += o.coeur + .15;
    } else if (coeur) gsap.set(coeur, { autoAlpha: 0 });
    tl.to(lanieres, { ...ouvert(), duration: o.duree, stagger: depart() }, t0)
      .add(signaler, t0 + o.duree * .3);
  }

  /** Referme le rideau puis appelle fn (changement de page). */
  function couvrir(fn) {
    if (s.calme) { fn?.(); return; }
    tl?.kill(); construire();
    root.classList.remove('est-fini'); root.classList.add('est-pilote', 'est-couvre');
    if (coeur) gsap.set(coeur, { autoAlpha: 0 });
    tl = gsap.timeline({ onComplete: () => fn?.() });
    tl.from(lanieres, { ...ouvert(), duration: .55, stagger: { ...depart(), each: .04 }, ease: 'power3.inOut' });
  }

  function lien(e) {
    const a = e.target.closest?.('a[href]');
    if (!a || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault();
    couvrir(() => { location.href = u.href; });
  }
  // Retour arrière depuis le cache : la page revient couverte si on ne retire pas le rideau.
  function retour(e) { if (e.persisted) finir(); }

  bouton?.addEventListener('click', passer);
  addEventListener('pageshow', retour);
  if (o.liens) document.addEventListener('click', lien);

  const sauter = s.calme || (deja && o.unique === true);
  noter(o.cle);
  if (sauter) { root.classList.add('est-fini'); signaler(); }
  else jouer(deja && o.unique === 'court');

  return {
    /** Rejoue l'ouverture complète (démonstration), avec d'éventuelles nouvelles options. */
    rejouer(nouvelles = {}) { o = { ...o, ...nouvelles }; if (!s.calme) jouer(false); },
    passer,
    couvrir,
    detruire() {
      tl?.kill(); tl = null;
      bouton?.removeEventListener('click', passer);
      removeEventListener('keydown', clavier); removeEventListener('pageshow', retour);
      document.removeEventListener('click', lien);
      root.classList.add('est-fini');
    },
  };
}
