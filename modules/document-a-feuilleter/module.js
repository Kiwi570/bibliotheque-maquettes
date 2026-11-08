// Document à feuilleter : une plaquette, un menu ou un carnet écrit en HTML (une div par page) qu'on attrape et dont on
// tourne les pages à la main : on glisse (avec élan), on clique sur le bord, ou flèches du clavier ; compteur de pages.
// Feuillets en 3D (perspective, recto et verso, ombre portée sur la page dessous, pli au dos) ; en double page dès que
// la place le permet (requête de conteneur), une page à la fois sinon (téléphone : on glisse la page).
// Annotations au crayon (souligné, entouré, barré, coché, trait de marge) tracées quand la page est lue.
// Mode calme et sans JavaScript : les pages se lisent l'une sous l'autre (le CSS s'en charge avant tout script).
import { pret } from '../../socle/socle.js';

const borne = (v, a, b) => Math.min(b, Math.max(a, v));
const sortie = t => 1 - Math.pow(1 - t, 3);

/* ---------- Annotations au crayon ---------- */
const TRAITS = {
  souligne: () => 'M2 40 C 20 18, 38 72, 55 42 S 85 22, 98 52',
  barre: () => 'M1 55 C 30 40, 65 66, 99 45',
  entoure: () => 'M54 4 C 86 2, 100 28, 97 54 C 93 86, 54 99, 24 92 C 2 86, -1 50, 8 30 C 16 13, 40 4, 70 10',
  coche: () => 'M8 55 L 36 88 L 94 8',
  marge: () => 'M50 2 C 28 34, 66 66, 44 98',
};
function annoter(el) {
  if (el.querySelector(':scope > .daf__trait')) return;
  const t = el.dataset.annot in TRAITS ? el.dataset.annot : 'souligne';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `daf__trait daf__trait--${t}`); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', TRAITS[t]()); p.setAttribute('pathLength', '1'); p.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.appendChild(p); el.appendChild(svg); el.classList.add('daf__annote');
}

/**
 * <section class="daf" data-module="document-a-feuilleter">
 *   <div class="daf__scene">
 *     <div class="daf__document" data-format="portrait|paysage" data-couverture data-titre="Plaquette de l'atelier">
 *       <div class="daf__page">…texte, images, <em data-annot="entoure">mot</em>…</div> …
 *     </div>
 *   </div>
 *   <div class="daf__commandes" data-daf-commandes></div>     (place réservée : flèches, compteur, consigne)
 * </section>
 * @param {HTMLElement} root
 * @param {object} [options]
 * @param {number} [options.depart=0]        page de départ (0 : la première)
 * @param {boolean} [options.invitation=true] le coin de la page se soulève une fois à l'arrivée dans l'écran
 * @param {boolean} [options.inclinaison=true] le document s'incline un peu vers la souris
 * @param {number} [options.elan=.28]        part de la vitesse gardée au lâcher (en pages)
 */
export async function init(root, options = {}) {
  const s = await pret([]);
  const o = { depart: 0, invitation: true, inclinaison: true, elan: .28, ...options };
  const doc = root.querySelector('.daf__document');
  if (!doc) return { aller() {}, detruire() {} };
  const scene = doc.closest('.daf__scene') || doc.parentElement;
  const pages = [...doc.querySelectorAll(':scope > .daf__page')];
  const n = pages.length;
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };
  for (const a of root.querySelectorAll('[data-annot]')) annoter(a);
  for (const img of doc.querySelectorAll('img')) img.draggable = false;
  pages.forEach((p, i) => { p.dataset.n = String(i + 1); });
  const titre = doc.dataset.titre || root.querySelector('h1, h2')?.textContent.trim() || 'Document';

  /* Mode calme : les pages restent l'une sous l'autre (CSS), annotations tracées d'emblée. */
  if (s.calme) {
    root.classList.add('daf--pret', 'daf--a-plat');
    pages.forEach(p => p.classList.add('est-lue'));
    return { aller() {}, detruire() { root.classList.remove('daf--pret', 'daf--a-plat'); } };
  }

  const couverture = doc.hasAttribute('data-couverture');
  let commandes = root.querySelector('[data-daf-commandes]');
  if (!commandes) { commandes = document.createElement('div'); commandes.className = 'daf__commandes'; scene.after(commandes); }
  commandes.innerHTML = `<button type="button" class="daf__fleche" data-daf-precedent aria-label="Page précédente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg></button>
    <p class="daf__compteur" aria-live="polite"></p>
    <button type="button" class="daf__fleche" data-daf-suivant aria-label="Page suivante"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    <p class="daf__consigne"><span class="daf__souris">Attrapez une page et tournez-la</span><span class="daf__doigt">Faites glisser la page</span></p>`;
  const compteur = commandes.querySelector('.daf__compteur'), bPrec = commandes.querySelector('[data-daf-precedent]'), bSuiv = commandes.querySelector('[data-daf-suivant]');
  doc.tabIndex = 0; doc.setAttribute('role', 'region'); doc.setAttribute('aria-roledescription', 'document à feuilleter');
  doc.setAttribute('aria-label', `${titre}, ${n} pages. Flèches gauche et droite pour tourner les pages.`);
  const portee = document.createElement('div'); portee.className = 'daf__portee'; portee.setAttribute('aria-hidden', 'true');
  const reliure = document.createElement('div'); reliure.className = 'daf__reliure'; reliure.setAttribute('aria-hidden', 'true');

  /* ---------- Feuillets : en double page, recto et verso sont deux pages ; une page à la fois, le verso est blanc ---------- */
  let mode = '', feuillets = [], fixe = null, max = 0, p = 0, anim = 0, saisie = null, base = 0, lue = 0;
  const lireMode = () => doc.dataset.mode === 'simple' ? 'simple' : getComputedStyle(doc).getPropertyValue('--daf-n').trim() === '2' ? 'double' : 'simple';
  function construire(nouveau) {
    const page = pageVisible();
    for (const pg of pages) doc.appendChild(pg);
    doc.querySelectorAll(':scope > .daf__feuillet, :scope > .daf__fixe').forEach(e => e.remove());
    mode = nouveau; doc.dataset.affichage = mode; feuillets = []; fixe = null;
    const face = (cl, pg) => { const f = document.createElement('div'); f.className = `daf__face daf__face--${cl}`; if (pg) f.appendChild(pg); else f.classList.add('daf__face--blanche'); return f; };
    const groupes = [];
    if (mode === 'double') {
      let i = 0;
      if (!couverture) { fixe = document.createElement('div'); fixe.className = 'daf__fixe'; fixe.appendChild(face('verso', pages[0])); doc.appendChild(fixe); i = 1; }
      for (; i < n; i += 2) groupes.push([pages[i], pages[i + 1] || null]);
    } else pages.forEach(pg => groupes.push([pg, null]));
    groupes.forEach(([r, v], i) => {
      const f = document.createElement('div'); f.className = 'daf__feuillet'; f.dataset.i = String(i);
      f.append(face('recto', r), face('verso', v)); doc.appendChild(f); feuillets.push(f);
    });
    doc.append(portee, reliure);
    const dernier = groupes[groupes.length - 1];
    max = mode === 'double' ? (dernier && dernier[1] ? groupes.length : groupes.length - 1) : n - 1;
    p = base = borne(versP(page), 0, max);
    rendre(); poser();
  }
  /* Première page lisible (index 0) pour l'état p ; et l'inverse. */
  function pageVisible() {
    if (!mode) return o.depart;
    const q = Math.round(p);
    if (mode === 'simple') return q;
    return couverture ? Math.max(0, 2 * q - 1) : 2 * q;
  }
  const versP = i => mode === 'simple' ? i : couverture ? Math.ceil(i / 2) : Math.floor(i / 2);

  /* ---------- Rendu d'un état (p continu) ---------- */
  function rendre() {
    const fl = Math.floor(p), mobile = feuillets.findIndex((_, i) => p - i > 0 && p - i < 1);
    feuillets.forEach((f, i) => {
      const t = borne(p - i, 0, 1);
      f.style.transform = `rotateY(${(-180 * t).toFixed(2)}deg)`;
      f.style.zIndex = t > 0 && t < 1 ? 300 : t <= 0 ? 200 - i : 100 + i;
      f.style.setProperty('--pli', Math.sin(t * Math.PI).toFixed(3));
      f.style.setProperty('--t', t.toFixed(3));
      /* Feuillets cachés sous d'autres : invisibles (et hors des lecteurs d'écran). */
      const cache = mode === 'simple' ? (t >= 1 || i > fl + 1) : (t <= 0 ? i > fl + 1 : i < fl - 1);
      f.style.visibility = cache ? 'hidden' : '';
    });
    /* Ombre portée sur la page dessous : son bord suit le bord libre du feuillet qui tourne. */
    if (mobile >= 0) { const t = p - mobile; portee.style.setProperty('--bord', Math.cos(t * Math.PI).toFixed(3)); portee.style.setProperty('--force', Math.sin(t * Math.PI).toFixed(3)); portee.hidden = false; }
    else portee.hidden = true;
    /* Couverture fermée : le livre se centre sur elle ; dos fermé : sur lui. */
    let decal = 0;
    if (mode === 'double' && couverture) { decal = -25 * (1 - borne(p, 0, 1)); if (feuillets.length && n % 2 === 0) decal += 25 * borne(p - (feuillets.length - 1), 0, 1); }
    doc.style.setProperty('--decal', decal.toFixed(2) + '%');
    doc.style.setProperty('--avant', (mode === 'double' ? Math.max(0, Math.round(p) - (couverture ? 1 : 0)) : 0).toString());
  }
  /* État posé : compteur, accessibilité des pages visibles, annotations tracées. */
  function poser() {
    const q = Math.round(p); base = q; doc.dataset.p = String(q); if (Math.abs(coinVise - p) > .001) coinVise = q;
    let vis = [];
    if (mode === 'simple') vis = [q];
    else { const g = couverture ? 2 * q - 1 : 2 * q, d = couverture ? 2 * q : 2 * q + 1; vis = [g, d].filter(i => i >= 0 && i < n); }
    pages.forEach((pg, i) => { const v = vis.includes(i); pg.inert = !v; pg.setAttribute('aria-hidden', String(!v)); });
    const nums = vis.map(i => i + 1);
    let txt = nums.length > 1 ? `Pages ${nums[0]}–${nums[1]} sur ${n}` : `Page ${nums[0]} sur ${n}`;
    if (couverture && vis.length === 1 && vis[0] === 0) txt = `Couverture · ${n} pages`;
    if (couverture && vis.length === 1 && vis[0] === n - 1 && n % 2 === 0 && mode === 'double') txt = `Dos · page ${n} sur ${n}`;
    compteur.textContent = txt;
    bPrec.disabled = q <= 0; bSuiv.disabled = q >= max;
    clearTimeout(lue); lue = setTimeout(() => vis.forEach(i => pages[i].classList.add('est-lue')), 260);
    if (doc.contains(document.activeElement) && document.activeElement.closest('[inert]')) doc.focus({ preventScroll: true });
  }
  function aller(cible, duree) {
    cible = borne(cible, 0, max);
    cancelAnimationFrame(anim);
    const de = p, d = duree ?? Math.min(.95, .5 + Math.abs(cible - de) * .22) * 1000; const t0 = performance.now();
    if (Math.abs(cible - de) < .001) { p = cible; rendre(); poser(); return; }
    const pas = now => { const x = Math.min(1, (now - t0) / d); p = de + (cible - de) * sortie(x); rendre(); if (x < 1) anim = requestAnimationFrame(pas); else { p = cible; rendre(); poser(); } };
    anim = requestAnimationFrame(pas);
  }
  const suivante = () => aller(Math.round(p) + 1), precedente = () => aller(Math.round(p) - 1);

  /* ---------- Gestes ---------- */
  ecoute(bPrec, 'click', precedente); ecoute(bSuiv, 'click', suivante);
  ecoute(root, 'keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const avant = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key), arriere = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key);
    if (e.target !== doc && !e.target.closest('.daf__commandes') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;
    if (avant) { e.preventDefault(); suivante(); } else if (arriere) { e.preventDefault(); precedente(); }
    else if (e.key === 'Home' && e.target === doc) { e.preventDefault(); aller(0); } else if (e.key === 'End' && e.target === doc) { e.preventDefault(); aller(max); }
  });
  const largeurPage = () => doc.getBoundingClientRect().width / (mode === 'double' ? 2 : 1);
  ecoute(doc, 'pointerdown', e => {
    if (e.button > 0 || e.target.closest('a, button, input, select, textarea, label')) return;
    cancelAnimationFrame(anim);
    saisie = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), p0: p, decide: e.pointerType === 'mouse', hist: [[performance.now(), p]], bouge: 0 };
    if (saisie.decide) { doc.setPointerCapture(e.pointerId); doc.classList.add('est-saisi'); }
  });
  ecoute(doc, 'pointermove', e => {
    if (!saisie || e.pointerId !== saisie.id) return;
    const dx = e.clientX - saisie.x, dy = e.clientY - saisie.y;
    saisie.bouge = Math.max(saisie.bouge, Math.hypot(dx, dy));
    if (!saisie.decide) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { saisie = null; return; } // on défile : la page reste libre
      if (Math.abs(dx) < 8) return;
      saisie.decide = true; doc.setPointerCapture(e.pointerId); doc.classList.add('est-saisi');
    }
    p = borne(saisie.p0 - dx / (largeurPage() * 1.15), -.12, max + .12);
    saisie.hist.push([performance.now(), p]); if (saisie.hist.length > 7) saisie.hist.shift();
    rendre();
  });
  const lacher = e => {
    if (!saisie || e.pointerId !== saisie.id) return;
    const sa = saisie; saisie = null; doc.classList.remove('est-saisi');
    if (!sa.decide && e.type === 'pointercancel') return;
    /* Toucher ou clic bref, sans glisser : le bord droit tourne en avant, le bord gauche en arrière. */
    if (sa.bouge < 6 && performance.now() - sa.t < 500) {
      const r = doc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x > .7) return suivante(); if (x < .3) return precedente(); return aller(base);
    }
    const h = sa.hist, a = h[0], b = h[h.length - 1];
    const v = b && a && b[0] - a[0] > 12 ? (b[1] - a[1]) / ((b[0] - a[0]) / 1000) : 0;
    /* L'élan finit de tourner la feuille en cours, sans en emporter d'autres (on n'a saisi qu'une feuille). */
    let cible = borne(Math.round(p + v * o.elan), Math.floor(p), Math.ceil(p));
    /* Un petit geste franc suffit à tourner la page. */
    if (cible === sa.p0 && Math.abs(p - sa.p0) > .12) cible = sa.p0 + Math.sign(p - sa.p0);
    aller(cible, Math.min(900, 420 + Math.abs(cible - p) * 280));
  };
  ecoute(doc, 'pointerup', lacher); ecoute(doc, 'pointercancel', lacher);
  /* Souris près du bord : le coin se soulève (on voit qu'il se tourne). */
  let coinVise = 0;
  const coin = e => {
    if (saisie || e.pointerType !== 'mouse') return;
    const r = doc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    const voulu = x > .88 && base < max ? base + .06 : x < .12 && base > 0 ? base - .06 : base;
    doc.classList.toggle('est-au-bord', voulu !== base);
    /* Une seule animation par changement de cible (pas une par mouvement de souris). */
    if (voulu !== coinVise && Math.abs(p - base) < .1) { coinVise = voulu; aller(voulu, 320); }
  };
  ecoute(doc, 'pointermove', coin);
  ecoute(doc, 'pointerleave', () => { doc.classList.remove('est-au-bord'); if (!saisie && coinVise !== base && Math.abs(p - base) < .1) { coinVise = base; aller(base, 320); } });
  /* Il s'incline un peu vers la souris (souris seulement). */
  if (o.inclinaison && s.souris) {
    let cx = 0, cy = 0, vx = 0, vy = 0, boucle = 0;
    const tour = () => { vx += (cx - vx) * .12; vy += (cy - vy) * .12; doc.style.setProperty('--incl-x', vx.toFixed(2) + 'deg'); doc.style.setProperty('--incl-y', vy.toFixed(2) + 'deg'); boucle = Math.abs(cx - vx) + Math.abs(cy - vy) > .02 ? requestAnimationFrame(tour) : 0; };
    const viser = (x, y) => { cx = x; cy = y; if (!boucle) boucle = requestAnimationFrame(tour); };
    ecoute(scene, 'pointermove', e => { if (e.pointerType !== 'mouse' || saisie) return; const r = scene.getBoundingClientRect(); viser(borne(-((e.clientY - r.top) / r.height - .5) * 6, -3, 3), borne(((e.clientX - r.left) / r.width - .5) * 8, -4, 4)); });
    ecoute(scene, 'pointerleave', () => viser(0, 0));
  }
  /* Double page ou page seule selon la place (requête de conteneur lue dans --daf-n). */
  const ro = new ResizeObserver(() => { const m = lireMode(); if (m !== mode) construire(m); });
  ro.observe(scene); nettoyer.push(() => ro.disconnect());

  construire(lireMode());
  root.classList.add('daf--pret');
  /* Invitation : une fois, le coin de la page se soulève puis retombe. */
  if (o.invitation && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      setTimeout(() => { if (saisie || Math.abs(p - base) > .001 || base >= max) return; const b0 = base; aller(b0 + .22, 520); setTimeout(() => { if (!saisie && Math.abs(p - b0 - .22) < .01) aller(b0, 620); }, 620); }, 700);
    }, { threshold: .55 });
    io.observe(doc); nettoyer.push(() => io.disconnect());
  }
  return {
    /** Va à la page i (0 = la première) */
    aller(i) { aller(versP(i)); },
    suivante, precedente,
    detruire() { nettoyer.forEach(f => f()); cancelAnimationFrame(anim); for (const pg of pages) { pg.inert = false; pg.removeAttribute('aria-hidden'); doc.appendChild(pg); } doc.querySelectorAll(':scope > .daf__feuillet, :scope > .daf__fixe').forEach(e => e.remove()); portee.remove(); reliure.remove(); commandes.innerHTML = ''; root.classList.remove('daf--pret'); },
  };
}
