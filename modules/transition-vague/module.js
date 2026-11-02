// Transition de page en vague : au clic sur un lien interne, un voile au bord ondulé monte et couvre l'écran,
// la navigation a lieu, puis sur la page d'arrivée (qui s'affiche déjà couverte) le voile repart vers le haut.
// Nécessite le script critique du head (voir NOTES.md) qui pose html.tv-couvert avant le premier affichage.
import { pret } from '../../socle/socle.js';

const PLAT = 'M0 120 C 240 120 480 120 720 120 S 1200 120 1440 120 V 120 H 0 Z';
const COURBE = 'M0 120 C 240 20 480 20 720 70 S 1200 130 1440 40 V 120 H 0 Z';
const CLE = 'tv-voile';

// Chemin normalisé : sans .html, sans index, sans barre finale (cleanUrls de Vercel).
const normaliser = p => (p.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/');

/**
 * @param {HTMLElement} root  div.tv (svg.tv__vague + div.tv__corps > span.tv__nom)
 * @param {object} [options]
 * @param {number} [options.montee=.75]   durée de la montée (s)
 * @param {number} [options.retrait=.85]  durée du retrait à l'arrivée (s)
 * @param {boolean} [options.nom=true]    affiche le nom de la page d'arrivée (data-voile-nom ou texte du lien)
 * @param {string} [options.exclure='[data-sans-voile]']  liens qui naviguent sans voile
 */
export async function init(root, options = {}) {
  const o = { montee: .75, retrait: .85, nom: true, exclure: '[data-sans-voile]', ...options };
  const html = document.documentElement;
  const vague = root.querySelector('.tv__vague path');
  const etiquette = root.querySelector('.tv__nom');
  const s = await pret([]);
  const { gsap } = s;
  let enCours = false;

  const reinitialiser = () => { gsap.killTweensOf([root, vague, etiquette]); gsap.set(root, { clearProps: 'transform' }); root.style.removeProperty('translate'); root.classList.remove('est-actif'); html.classList.remove('tv-couvert'); if (vague) vague.setAttribute('d', PLAT); if (etiquette) etiquette.style.opacity = ''; enCours = false; };

  // Arrivée : la page démarre couverte, le voile se retire vers le haut.
  if (html.classList.contains('tv-couvert')) {
    if (s.calme) reinitialiser();
    else {
      // Poser l'état couvert dans GSAP (y: 0, yPercent: 0) avant de retirer la classe : sinon GSAP reprend
      // le translateY(105%) du CSS en pixels et le voile remonterait depuis le bas.
      gsap.set(root, { y: 0, yPercent: 0 });
      root.classList.add('est-actif');
      html.classList.remove('tv-couvert');
      gsap.timeline({ onComplete: reinitialiser })
        .to(root, { yPercent: -125, duration: o.retrait, ease: 'power3.inOut', delay: .05 })
        .fromTo(vague, { attr: { d: PLAT } }, { attr: { d: COURBE }, duration: o.retrait * .6, ease: 'sine.out' }, 0);
    }
  }

  function partir(url, nom) {
    if (s.calme || enCours) { location.href = url; return; }
    enCours = true;
    try { sessionStorage.setItem(CLE, '1'); } catch {}
    if (etiquette) etiquette.textContent = o.nom ? nom : '';
    root.classList.add('est-actif');
    gsap.timeline({ onComplete: () => { location.href = url; } })
      .fromTo(root, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: o.montee, ease: 'power3.inOut' }, 0)
      .fromTo(vague, { attr: { d: PLAT } }, { attr: { d: COURBE }, duration: o.montee * .55, ease: 'sine.out' }, 0)
      .to(vague, { attr: { d: PLAT }, duration: o.montee * .45, ease: 'sine.in' }, o.montee * .55)
      .fromTo(etiquette, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, o.montee * .6);
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
    // Même page (chemins normalisés) : on défile, sans voile ni rechargement.
    if (normaliser(url.pathname) === normaliser(location.pathname) && url.search === location.search) {
      e.preventDefault();
      const cible = url.hash.length > 1 ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      defiler(cible);
      if (url.hash && cible) history.replaceState(null, '', url.hash);
      return;
    }
    e.preventDefault();
    partir(url.href, a.dataset.voileNom || a.textContent.replace(/\s+/g, ' ').trim());
  };
  document.addEventListener('click', auClic);

  // Retour arrière ou avant depuis le cache du navigateur : la page revient découverte.
  const auRetour = e => { if (e.persisted) { try { sessionStorage.removeItem(CLE); } catch {} reinitialiser(); } };
  addEventListener('pageshow', auRetour);

  return { partir, detruire() { document.removeEventListener('click', auClic); removeEventListener('pageshow', auRetour); reinitialiser(); } };
}
