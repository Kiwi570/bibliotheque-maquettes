// Carte du restaurant : toute la carte par rubriques, une barre collante qui suit la lecture (rubrique en cours allumée et
// ramenée à l'écran), des filtres (végétarien, sans gluten, à partager…), une recherche tolérante (accents, apostrophes,
// pluriels), les prix et les pictogrammes d'allergènes avec leur légende. Tiré de pizzalyght-maquette/carte-barre (barre,
// filtres, recherche) et de jardins-hacienda-maquette/la-carte-la-carte (rubriques, prix en pointillés).
// Le contenu vient d'un JSON : generer-carte.mjs l'écrit dans la page (carte lisible sans JavaScript) ; data-source peut
// aussi le relire dans le navigateur. Sans JavaScript : la carte, les ancres et la légende ; filtres et recherche masqués.
import { pret } from '../../socle/socle.js';
import { rendreCarte, normer } from './carte-rendu.js';

/**
 * @param {HTMLElement} root  section[data-module="carte-du-restaurant"] contenant [data-carte] (HTML écrit par generer-carte.mjs)
 * @param {object} [options]
 * @param {string} [options.source]  adresse du JSON de la carte (sinon data-source de [data-carte]) : la carte est réécrite à l'arrivée
 * @param {object} [options.donnees] le JSON lui-même (déjà chargé)
 */
export async function init(root, options = {}) {
  const s = await pret([]);
  const boite = root.querySelector('[data-carte]') || root;
  const o = { source: boite.dataset.source || null, ...options };

  // Contenu : le JSON passé ou chargé remplace la carte écrite dans la page (sinon celle-ci reste, telle quelle).
  let donnees = o.donnees || null;
  if (!donnees && o.source) { try { const r = await fetch(o.source, { cache: 'no-cache' }); if (r.ok) donnees = await r.json(); } catch { /* la carte de la page reste */ } }
  if (donnees) boite.innerHTML = rendreCarte(donnees);

  const $ = (sel) => boite.querySelector(sel), $$ = (sel) => [...boite.querySelectorAll(sel)];
  const barre = $('.carte-resto__barre'), outils = $('[data-outils]'), champ = $('[data-recherche]'), aucun = $('[data-aucun]');
  const rubriques = $$('[data-rubrique]'), liens = $$('[data-rubrique-lien]'), boutons = $$('[data-filtre]');
  if (!barre || !rubriques.length) return { detruire() {} };
  if (outils) outils.hidden = false;
  root.classList.add('est-actif');
  const annonce = document.createElement('p'); annonce.className = 'carte-resto__sr'; annonce.setAttribute('role', 'status'); barre.appendChild(annonce);
  const plats = $$('.carte-resto__plat').map((el) => ({ el, f: ' ' + (el.dataset.filtres || '') + ' ', t: el.dataset.texte || normer(el.textContent) }));

  // Hauteur de la barre (pour les ancres et la rubrique en cours).
  const hauteur = () => { const h = barre.offsetHeight; root.style.setProperty('--carte-barre-h', h + 'px'); return h; };
  const haut = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0) + hauteur();
  const ro = new ResizeObserver(hauteur); ro.observe(barre);

  // Rubrique en cours : celle qui passe sous la barre. Son lien s'allume et revient dans la barre (défilement horizontal).
  let courante = null;
  function allumer(id) {
    if (id === courante) return; courante = id;
    for (const a of liens) {
      const on = a.dataset.rubriqueLien === id;
      a.classList.toggle('est-courant', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on) glisser(a.parentElement, Math.max(0, a.offsetLeft - a.parentElement.clientWidth / 2 + a.offsetWidth / 2));
    }
  }
  // Défilement horizontal de la barre, animé à la main : un scrollTo « smooth » sur la barre annulerait celui de la page (Chrome).
  let tween = 0;
  function glisser(nav, x) {
    cancelAnimationFrame(tween); const x0 = nav.scrollLeft, t0 = performance.now();
    if (s.calme || Math.abs(x - x0) < 2) { nav.scrollLeft = x; return; }
    const pas = (t) => { const k = Math.min(1, (t - t0) / 320); nav.scrollLeft = x0 + (x - x0) * (1 - (1 - k) ** 3); if (k < 1) tween = requestAnimationFrame(pas); };
    tween = requestAnimationFrame(pas);
  }
  function suivre() {
    const y = haut() + 24; let id = null;
    for (const r of rubriques) { if (r.hidden) continue; if (r.getBoundingClientRect().top <= y) id = r.dataset.rubrique; else break; }
    allumer(id || rubriques.find((r) => !r.hidden)?.dataset.rubrique || null);
  }
  let attente = 0;
  const auDefilement = () => { if (!attente) attente = requestAnimationFrame(() => { attente = 0; suivre(); }); };
  addEventListener('scroll', auDefilement, { passive: true }); addEventListener('resize', auDefilement);
  suivre();

  // Ancres : la rubrique arrive juste sous l'en-tête et la barre (défilement adouci du socle s'il est là).
  const aller = (el) => {
    const y = el.getBoundingClientRect().top + scrollY - haut() - 8;
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
  };
  const surLien = (e) => {
    const a = e.target.closest('[data-rubrique-lien]'); if (!a) return;
    const cible = document.getElementById(a.getAttribute('href').slice(1)); if (!cible) return;
    e.preventDefault(); e.stopPropagation(); allumer(a.dataset.rubriqueLien); aller(cible);
    history.replaceState(null, '', a.getAttribute('href'));
    cible.querySelector('h3')?.setAttribute('tabindex', '-1'); cible.querySelector('h3')?.focus({ preventScroll: true });
  };
  barre.addEventListener('click', surLien);

  // Filtres (tous ceux choisis à la fois) et recherche (tous les mots) ; rubriques vides masquées avec leur lien.
  let q = '', minuteur = 0, signature = '';
  function appliquer() {
    const actifs = boutons.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.filtre);
    const mots = normer(q).split(' ').filter(Boolean);
    let total = 0; const sig = [];
    for (const p of plats) { const ok = actifs.every((f) => p.f.includes(' ' + f + ' ')) && mots.every((m) => p.t.includes(m)); p.el.hidden = !ok; sig.push(ok ? 1 : 0); if (ok) total++; }
    for (const r of rubriques) {
      const n = r.querySelectorAll('.carte-resto__plat:not([hidden])').length; r.hidden = n === 0;
      const a = liens.find((l) => l.dataset.rubriqueLien === r.dataset.rubrique);
      if (a) { a.hidden = n === 0; const c = a.querySelector('small'); if (c) c.textContent = n; }
    }
    const filtre = actifs.length || mots.length;
    aucun.hidden = total > 0;
    if (!total) {
      aucun.textContent = `Aucun plat ne correspond${q.trim() ? ` à « ${q.trim()} »` : ''}${actifs.length ? ' avec ces filtres' : ''}. `;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'carte-resto__tout'; b.textContent = 'Toute la carte'; b.dataset.toutAfficher = ''; aucun.append(b);
    }
    annonce.textContent = filtre ? `${total} plat${total > 1 ? 's' : ''} affiché${total > 1 ? 's' : ''}` : '';
    const nouvelle = sig.join('');
    if (nouvelle !== signature) {
      signature = nouvelle; courante = null; suivre();
      // La liste a raccourci : on la reprend à son début si on était plus bas.
      const corps = $('.carte-resto__corps'); if (corps && corps.getBoundingClientRect().top < haut()) aller(corps);
    }
  }
  boite.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtre]');
    if (b) { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); appliquer(); return; }
    if (e.target.closest('[data-tout-afficher]')) { boutons.forEach((x) => x.setAttribute('aria-pressed', 'false')); if (champ) champ.value = ''; q = ''; appliquer(); (boutons[0] || champ)?.focus(); }
  });
  const surSaisie = () => { clearTimeout(minuteur); minuteur = setTimeout(() => { q = champ.value; appliquer(); }, 140); };
  champ?.addEventListener('input', surSaisie);

  return {
    /** Filtres choisis depuis le code (ex. lien « nos plats végétariens » : ['vegetarien']). */
    filtrer(liste = []) { boutons.forEach((b) => b.setAttribute('aria-pressed', String(liste.includes(b.dataset.filtre)))); appliquer(); },
    detruire() { removeEventListener('scroll', auDefilement); removeEventListener('resize', auDefilement); ro.disconnect(); barre.removeEventListener('click', surLien); annonce.remove(); root.classList.remove('est-actif'); if (outils) outils.hidden = true; },
  };
}
