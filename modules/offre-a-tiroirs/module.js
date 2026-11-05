// Offre à tiroirs : les prestations du client, écrites dans la page, s'ouvrent comme des tiroirs (la façade avance,
// le contenu se déplie) ; sur ordinateur, une colonne collante montre l'image du tiroir ouvert. « En parler » envoie
// le sujet de la prestation dans l'adresse du formulaire. Un tiroir s'ouvre aussi par l'adresse (#identifiant).
// Sans JavaScript, tout est déplié et lisible ; en mode calme, rien ne glisse.
import { pret } from '../../socle/socle.js';

/**
 * Un tiroir : <li class="ofr__tiroir" id="renovation" data-sujet="Rénovation complète">
 *   <h3 class="ofr__titre"><button type="button" class="ofr__poignee"> <span class="ofr__num">01</span>
 *     <span class="ofr__nom">…</span> <span class="ofr__resume">…</span> <span class="ofr__prix">dès …</span> </button></h3>
 *   <div class="ofr__contenu"><div class="ofr__interieur">
 *     <figure class="ofr__image"><img …></figure>   (facultatif : reprise dans la colonne collante sur ordinateur)
 *     … texte, liste … <a class="socle-bouton ofr__parler" href="/contact#demande">En parler</a>
 *   </div></div></li>
 * @param {HTMLElement} root  section.ofr (contient .ofr__tiroirs ; .ofr__visuels est créé s'il manque)
 * @param {object} [options]
 * @param {number|null} [options.ouvert=0]   tiroir ouvert au départ (index), null pour tout fermer ; l'ancre de l'adresse l'emporte
 * @param {boolean} [options.unSeul=true]    ouvrir un tiroir referme les autres
 * @param {boolean} [options.visuels=true]   colonne d'images collante sur ordinateur (si les tiroirs ont une .ofr__image)
 */
export async function init(root, options = {}) {
  const o = { ouvert: 0, unSeul: true, visuels: true, ...options };
  const s = await pret([]);
  const tiroirs = [...root.querySelectorAll('.ofr__tiroir')];
  if (!tiroirs.length) return { ouvrir() {}, detruire() {} };
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };
  root.classList.add('ofr--pret');

  tiroirs.forEach((t, i) => {
    if (!t.id) t.id = `ofr-${i + 1}`;
    const b = t.querySelector('.ofr__poignee'), c = t.querySelector('.ofr__contenu');
    if (!b || !c) return;
    if (!c.id) c.id = `${t.id}-contenu`;
    b.setAttribute('aria-controls', c.id);
    /* « En parler » : sujet de la prestation dans l'adresse (préremplissage du formulaire du site). */
    const a = t.querySelector('.ofr__parler');
    if (a) {
      const sujet = t.dataset.sujet || t.querySelector('.ofr__nom')?.textContent.trim() || '';
      const u = new URL(a.getAttribute('href') || '#', location.href);
      if (sujet) u.searchParams.set('sujet', sujet);
      a.href = u.origin === location.origin ? u.pathname + u.search + u.hash : u.href;
      if (sujet) a.setAttribute('aria-label', `${a.textContent.trim()} : ${sujet}`);
    }
  });

  /* Colonne collante : reprise des images des tiroirs (décorative, les images restent dans chaque tiroir). */
  let visuels = root.querySelector('.ofr__visuels');
  const figures = tiroirs.map((t) => t.querySelector('.ofr__image'));
  if (o.visuels && figures.some(Boolean)) {
    if (!visuels) {
      visuels = document.createElement('div'); visuels.className = 'ofr__visuels';
      root.querySelector('.ofr__tiroirs').before(visuels);
    }
    visuels.setAttribute('aria-hidden', 'true');
    tiroirs.forEach((t, i) => {
      const f = figures[i];
      const v = f ? f.cloneNode(true) : document.createElement('figure');
      v.className = 'ofr__visuel'; v.dataset.pour = t.id;
      v.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
      v.querySelectorAll('img').forEach((img) => { img.alt = ''; img.loading = i === 0 ? 'eager' : 'lazy'; });
      visuels.appendChild(v);
    });
    root.classList.add('ofr--visuels');
  }

  function poser(t, ouvert) {
    t.classList.toggle('est-ouvert', ouvert);
    t.querySelector('.ofr__poignee')?.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    const c = t.querySelector('.ofr__contenu');
    if (c) c.inert = !ouvert;
  }
  function ouvrir(t, { seul = o.unSeul } = {}) {
    if (!t) return;
    const deja = t.classList.contains('est-ouvert');
    if (seul) tiroirs.forEach((x) => x !== t && poser(x, false));
    poser(t, !deja || seul ? true : false);
    const actif = tiroirs.find((x) => x.classList.contains('est-ouvert')) || null;
    visuels?.querySelectorAll('.ofr__visuel').forEach((v) => v.classList.toggle('est-actif', !!actif && v.dataset.pour === actif.id));
    root.dataset.ouvert = actif ? actif.id : '';
  }
  function basculer(t) {
    if (t.classList.contains('est-ouvert')) {
      poser(t, false);
      const actif = tiroirs.find((x) => x.classList.contains('est-ouvert'));
      visuels?.querySelectorAll('.ofr__visuel').forEach((v) => v.classList.toggle('est-actif', !!actif && v.dataset.pour === actif.id));
      root.dataset.ouvert = actif ? actif.id : '';
    } else ouvrir(t);
  }

  /* État de départ : l'ancre de l'adresse, sinon options.ouvert. */
  tiroirs.forEach((t) => poser(t, false));
  const parAncre = location.hash.length > 1 ? tiroirs.find((t) => t.id === decodeURIComponent(location.hash.slice(1))) : null;
  if (parAncre) ouvrir(parAncre);
  else if (o.ouvert != null && tiroirs[o.ouvert]) ouvrir(tiroirs[o.ouvert]);

  ecoute(root, 'click', (e) => {
    const b = e.target.closest('.ofr__poignee'); if (!b || !root.contains(b)) return;
    basculer(b.closest('.ofr__tiroir'));
  });
  /* Flèches haut et bas entre les poignées, Début et Fin. */
  ecoute(root, 'keydown', (e) => {
    const b = e.target.closest?.('.ofr__poignee'); if (!b) return;
    const ps = tiroirs.map((t) => t.querySelector('.ofr__poignee')).filter(Boolean);
    const i = ps.indexOf(b);
    const j = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: ps.length - 1 }[e.key];
    if (j === undefined) return;
    e.preventDefault(); ps[(j + ps.length) % ps.length].focus();
  });
  /* Lien vers un tiroir de la page (#identifiant) : il s'ouvre. */
  const auHash = () => { const t = tiroirs.find((x) => x.id === decodeURIComponent(location.hash.slice(1))); if (t && !t.classList.contains('est-ouvert')) ouvrir(t); };
  ecoute(window, 'hashchange', auHash);

  /* Apparition des façades, une fois (jamais en mode calme). */
  let io = null;
  if (!s.calme && 'IntersectionObserver' in window) {
    root.classList.add('ofr--anime');
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    tiroirs.forEach((t) => io.observe(t));
  }

  return {
    ouvrir: (id) => ouvrir(typeof id === 'number' ? tiroirs[id] : tiroirs.find((t) => t.id === id)),
    detruire() { io?.disconnect(); nettoyer.forEach((f) => f()); },
  };
}
