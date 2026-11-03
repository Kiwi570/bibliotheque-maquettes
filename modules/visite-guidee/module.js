// Visite guidée : parcours pas à pas d'une interface. Un voile assombrit la page sauf l'élément visé (trou découpé
// par clip-path, donc l'élément reste cliquable), un halo le cerne, une bulle (role="dialog", non modale) l'explique :
// numéro n / N, titre, texte, « Précédent », « Suivant » (« Terminer » à la fin), « Passer ».
// Étapes décrites par data-* sur les éléments (data-visite="ordre", data-visite-titre, data-visite-texte),
// par un <script type="application/json" data-visite-etapes> dans le module, ou par options.etapes.
// Clavier : le focus entre dans la bulle et y revient à la sortie ; Tab circule entre la bulle et l'élément visé ;
// ← → changent d'étape quand le focus est dans la bulle ; Échap quitte. Chaque étape est annoncée (aria-live).
// Téléphone (sous options.largeurBas) : la bulle se pose en bas de l'écran, l'élément est amené au-dessus.
// Mode calme : défilement et déplacements instantanés, pas de halo pulsé.
import { pret } from '../../socle/socle.js';

const TEXTES = {
  lancer: 'Lancer la visite guidée',
  precedent: 'Précédent',
  suivant: 'Suivant',
  terminer: 'Terminer',
  passer: 'Passer',
  passerAide: 'Quitter la visite guidée',
  etape: 'Étape {n} sur {total}',
  aide: '← → pour changer d\'étape · Échap pour quitter',
  marque: 'Visite guidée',
};

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const visible = el => { if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
const lisse = t => 1 - Math.pow(1 - t, 3);
let compteur = 0;

/**
 * @param {HTMLElement} root  section[data-module="visite-guidee"] (contient le bouton [data-visite-lancer] et les éléments à visiter)
 * @param {object}  [options]
 * @param {Array<{cible: string|string[]|HTMLElement|null, titre: string, texte: string}>} [options.etapes]
 *        étapes en JSON ; cible = sélecteur (ou liste : le premier visible), null = bulle centrée sans projecteur.
 *        Sinon : <script type="application/json" data-visite-etapes>, sinon les éléments [data-visite] du module, triés par valeur.
 * @param {string}  [options.lanceur='[data-visite-lancer]']  bouton(s) qui lancent la visite (cherchés dans le module)
 * @param {number}  [options.largeurBas=700]   en dessous de cette largeur, la bulle est posée en bas de l'écran
 * @param {number}  [options.marge=8]          marge du projecteur autour de l'élément, en px
 * @param {number}  [options.duree=450]        durée du déplacement du projecteur et de la bulle, en ms (0 en mode calme)
 * @param {boolean} [options.clicVoileQuitte=false]  un clic sur la zone assombrie quitte la visite (sinon il est ignoré)
 * @param {boolean} [options.fleches=true]     ← → changent d'étape quand le focus est dans la bulle
 * @param {object}  [options.textes]           remplace tout ou partie des libellés (lancer, precedent, suivant, terminer, passer, passerAide, etape, aide, marque)
 * @returns {Promise<{lancer(i?: number): void, fermer(): void, aller(i: number): void, detruire(): void}>}
 */
export async function init(root, options = {}) {
  const o = { etapes: null, lanceur: '[data-visite-lancer]', largeurBas: 700, marge: 8, duree: 450, clicVoileQuitte: false, fleches: true, ...options };
  const T = { ...TEXTES, ...(options.textes || {}) };
  const s = await pret([]);
  const d = document, html = d.documentElement;
  const id = 'vgd-' + (++compteur);

  // ---------- Étapes ----------
  function lireEtapes() {
    let brut = o.etapes;
    const json = root.querySelector('script[type="application/json"][data-visite-etapes]');
    if (!brut && json) { try { brut = JSON.parse(json.textContent); } catch { brut = null; } }
    if (!brut) brut = [...root.querySelectorAll('[data-visite]')]
      .map((el, k) => ({ el, k, ordre: parseFloat(el.dataset.visite) }))
      .sort((a, b) => (isNaN(a.ordre) ? a.k : a.ordre) - (isNaN(b.ordre) ? b.k : b.ordre))
      .map(({ el }) => ({ cible: el, titre: el.dataset.visiteTitre || '', texte: el.dataset.visiteTexte || '' }));
    const trouver = c => {
      if (!c) return null;
      if (c instanceof Element) return visible(c) ? c : undefined;
      for (const sel of [].concat(c)) { const el = [...d.querySelectorAll(sel)].find(visible); if (el) return el; }
      return undefined;
    };
    // Une étape dont l'élément est absent ou caché à ce format est sautée (le compte n / N reste juste).
    return brut.map(e => ({ ...e, el: trouver(e.cible) })).filter(e => e.el !== undefined);
  }

  // ---------- État ----------
  let v = null; // visite en cours

  function construire() {
    const voile = d.createElement('div'); voile.className = 'vgd-voile'; voile.setAttribute('aria-hidden', 'true');
    const halo = d.createElement('div'); halo.className = 'vgd-halo'; halo.setAttribute('aria-hidden', 'true');
    const bulle = d.createElement('div');
    bulle.className = 'vgd-bulle';
    bulle.setAttribute('role', 'dialog'); bulle.setAttribute('aria-modal', 'false');
    bulle.setAttribute('aria-labelledby', id + '-t'); bulle.setAttribute('aria-describedby', id + '-x'); bulle.tabIndex = -1;
    bulle.innerHTML = `
      <div class="vgd-bulle__tete"><span class="vgd-bulle__marque">${T.marque}</span><span class="vgd-bulle__num" data-num></span>
        <button type="button" class="vgd-bulle__passer" data-passer aria-label="${T.passerAide}">${T.passer}</button></div>
      <div class="vgd-bulle__barre" aria-hidden="true"><i data-barre-v></i></div>
      <h2 class="vgd-bulle__titre" id="${id}-t"></h2>
      <p class="vgd-bulle__texte" id="${id}-x"></p>
      <div class="vgd-bulle__pied">
        <button type="button" class="vgd-bulle__bouton vgd-bulle__bouton--ligne" data-prec>${T.precedent}</button>
        <button type="button" class="vgd-bulle__bouton" data-suiv>${T.suivant}</button>
      </div>
      <p class="vgd-bulle__aide">${T.aide}</p>
      <p class="socle-sr" aria-live="polite" data-annonce></p>`;
    const racine = d.createElement('div'); racine.className = 'vgd-calque';
    racine.append(voile, halo, bulle);
    d.body.appendChild(racine);
    return { racine, voile, halo, bulle,
      num: bulle.querySelector('[data-num]'), barre: bulle.querySelector('[data-barre-v]'),
      titre: bulle.querySelector('.vgd-bulle__titre'), texte: bulle.querySelector('.vgd-bulle__texte'),
      prec: bulle.querySelector('[data-prec]'), suiv: bulle.querySelector('[data-suiv]'), annonce: bulle.querySelector('[data-annonce]') };
  }

  function lancer(depart = 0) {
    if (v) fermer(false);
    const etapes = lireEtapes();
    if (!etapes.length) return;
    v = { ...construire(), etapes, i: -1, avant: d.activeElement, raf: 0, tween: null, rect: null, pos: null, ro: new ResizeObserver(() => demander()) };
    html.classList.add('en-visite');
    v.bulle.addEventListener('click', surClic);
    v.voile.addEventListener('click', surVoile);
    d.addEventListener('keydown', surTouche, true);
    addEventListener('resize', demander); addEventListener('scroll', demander, { capture: true, passive: true });
    aller(Math.max(0, Math.min(depart, etapes.length - 1)), true);
  }

  function fermer(terminee = false) {
    if (!v) return;
    const { racine, avant, i, ro, etapes } = v;
    cancelAnimationFrame(v.raf); ro.disconnect();
    etapes[i]?.el?.removeAttribute('data-visite-actif');
    racine.remove();
    html.classList.remove('en-visite');
    d.removeEventListener('keydown', surTouche, true);
    removeEventListener('resize', demander); removeEventListener('scroll', demander, { capture: true });
    v = null;
    // Le focus revient où il était (en général le bouton de lancement).
    const retour = avant && avant.isConnected && avant !== d.body ? avant : root.querySelector(o.lanceur);
    retour?.focus?.();
    root.dispatchEvent(new CustomEvent('visite:fin', { bubbles: true, detail: { index: i, terminee } }));
  }

  function aller(i, premiere = false) {
    if (!v) return;
    if (i < 0) i = 0;
    if (i >= v.etapes.length) { fermer(true); return; }
    const ancienne = v.etapes[v.i]?.el;
    ancienne?.removeAttribute('data-visite-actif');
    if (ancienne) v.ro.unobserve(ancienne);
    v.i = i;
    const et = v.etapes[i], n = v.etapes.length;
    const focusSuiv = !premiere && d.activeElement === v.suiv, focusPrec = !premiere && d.activeElement === v.prec;
    // Contenu de la bulle
    v.num.textContent = `${i + 1} / ${n}`;
    v.barre.style.setProperty('--v', ((i + 1) / n * 100).toFixed(1) + '%');
    v.titre.textContent = et.titre; v.texte.textContent = et.texte;
    v.prec.hidden = i === 0;
    v.suiv.textContent = i === n - 1 ? T.terminer : T.suivant;
    v.racine.classList.toggle('vgd--centre', !et.el);
    if (et.el) { et.el.setAttribute('data-visite-actif', ''); v.ro.observe(et.el); }
    // Annonce (le premier affichage est lu par le focus sur la bulle).
    v.annonce.textContent = premiere ? '' : `${T.etape.replace('{n}', i + 1).replace('{total}', n)} : ${et.titre}. ${et.texte}`;
    // Défilement vers l'élément, puis déplacement du projecteur et de la bulle.
    v.racine.classList.toggle('vgd--bas', innerWidth < o.largeurBas);
    if (et.el) defilerVers(et.el);
    const duree = s.calme || premiere ? 0 : o.duree;
    v.tween = duree ? { debut: performance.now(), duree, de: v.rect, dePos: v.pos } : null;
    demander();
    // Focus : la bulle à l'ouverture, sinon le bouton utilisé s'il existe encore.
    if (premiere) v.bulle.focus({ preventScroll: true });
    else if (focusPrec && !v.prec.hidden) v.prec.focus({ preventScroll: true });
    else if (focusSuiv || focusPrec) v.suiv.focus({ preventScroll: true });
    root.dispatchEvent(new CustomEvent('visite:etape', { bubbles: true, detail: { index: i, total: n, etape: { titre: et.titre, texte: et.texte, element: et.el } } }));
  }

  // Zone utile : sous l'en-tête mesuré, au-dessus de la bulle sur téléphone (ou des barres du bas).
  function zone() {
    const cs = getComputedStyle(html);
    const haut = (parseFloat(cs.getPropertyValue('--entete-h')) || 0) + 12;
    const bas = innerWidth < o.largeurBas && v ? innerHeight - v.bulle.offsetHeight - 24 : innerHeight - (parseFloat(cs.getPropertyValue('--barres-h')) || 0) - 12;
    return { haut, bas: Math.max(haut + 40, bas) };
  }

  function defilerVers(el) {
    const r = el.getBoundingClientRect(), z = zone(), dispo = z.bas - z.haut;
    // L'élément est centré dans la zone utile s'il y tient, sinon son haut est posé sous l'en-tête.
    const delta = r.height + o.marge * 2 <= dispo ? r.top - (z.haut + (dispo - r.height) / 2) : r.top - z.haut - o.marge;
    if (Math.abs(delta) < 4) return;
    const y = Math.max(0, scrollY + delta);
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme });
    else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
  }

  // ---------- Placement (une image à la fois, seulement quand quelque chose bouge) ----------
  function demander() { if (v && !v.raf) v.raf = requestAnimationFrame(placer); }

  function cible() {
    const et = v.etapes[v.i]; const vw = innerWidth, vh = innerHeight, m = o.marge;
    if (!et.el || !visible(et.el)) return { x: vw / 2, y: vh / 2, w: 0, h: 0 };
    const r = et.el.getBoundingClientRect();
    const limite = innerWidth < o.largeurBas ? zone().bas + 12 : vh;
    const x = Math.max(0, r.left - m), y = Math.max(0, r.top - m);
    const w = Math.max(0, Math.min(vw, r.right + m) - x), h = Math.max(0, Math.min(limite, r.bottom + m) - y);
    return { x, y, w, h };
  }

  function placerBulle(rc) {
    const vw = innerWidth, vh = innerHeight, m = 12, g = 16;
    const cw = v.bulle.offsetWidth, ch = v.bulle.offsetHeight;
    if (vw < o.largeurBas) return null;                                 // posée en bas par la CSS
    if (!rc.w) return { left: (vw - cw) / 2, top: (vh - ch) / 2 };      // sans élément : au centre
    const z = zone(), haut = z.haut - 12 + m;
    const vert = Math.min(Math.max(haut, rc.y), vh - ch - m), hori = Math.min(Math.max(m, rc.x), vw - cw - m);
    const places = [
      [vw - (rc.x + rc.w) - g, cw, { left: rc.x + rc.w + g, top: vert }],   // à droite
      [rc.x - g, cw, { left: rc.x - cw - g, top: vert }],                   // à gauche
      [vh - (rc.y + rc.h) - g, ch, { left: hori, top: rc.y + rc.h + g }],   // en dessous
      [rc.y - g - haut, ch, { left: hori, top: rc.y - ch - g }],            // au-dessus
    ];
    const ok = places.find(([place, taille]) => place >= taille + m);
    // Rien ne tient : en bas à droite de l'écran, par-dessus l'élément (jamais hors de l'écran).
    const p = ok ? ok[2] : { left: vw - cw - 24, top: vh - ch - 24 };
    return { left: Math.min(Math.max(m, p.left), vw - cw - m), top: Math.min(Math.max(haut, p.top), vh - ch - m) };
  }

  function placer(t) {
    if (!v) return;
    v.raf = 0;
    v.racine.classList.toggle('vgd--bas', innerWidth < o.largeurBas);
    let rc = cible(), pos = placerBulle(rc);
    if (v.tween) {
      const k = Math.min(1, (t - v.tween.debut) / v.tween.duree), e = lisse(k);
      const de = v.tween.de, dp = v.tween.dePos;
      if (de) rc = { x: de.x + (rc.x - de.x) * e, y: de.y + (rc.y - de.y) * e, w: de.w + (rc.w - de.w) * e, h: de.h + (rc.h - de.h) * e };
      if (dp && pos) pos = { left: dp.left + (pos.left - dp.left) * e, top: dp.top + (pos.top - dp.top) * e };
      if (k >= 1) v.tween = null; else demander();
    }
    v.rect = rc; v.pos = pos;
    // Voile : tout l'écran moins un rectangle arrondi (règle evenodd) ; le trou laisse passer les clics.
    const vw = innerWidth, vh = innerHeight;
    const r = Math.min(parseFloat(getComputedStyle(v.racine).getPropertyValue('--vgd-r')) || 12, rc.w / 2, rc.h / 2);
    const { x, y, w, h } = rc;
    const trou = w && h ? ` M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z` : '';
    v.voile.style.clipPath = `path(evenodd, "M0 0H${vw}V${vh}H0Z${trou}")`;
    v.halo.style.transform = `translate(${x}px, ${y}px)`;
    v.halo.style.width = w + 'px'; v.halo.style.height = h + 'px';
    if (pos) { v.bulle.style.left = Math.round(pos.left) + 'px'; v.bulle.style.top = Math.round(pos.top) + 'px'; }
    else { v.bulle.style.left = ''; v.bulle.style.top = ''; }
  }

  // ---------- Événements ----------
  function surClic(e) {
    if (e.target.closest('[data-passer]')) fermer(false);
    else if (e.target.closest('[data-suiv]')) aller(v.i + 1);
    else if (e.target.closest('[data-prec]')) aller(v.i - 1);
  }
  function surVoile() { if (o.clicVoileQuitte) fermer(false); }
  function surTouche(e) {
    if (!v) return;
    if (e.key === 'Escape') { e.preventDefault(); fermer(false); return; }
    const dansBulle = v.bulle.contains(d.activeElement);
    if (e.key === 'Tab') {
      // Le clavier circule entre la bulle et l'élément visé (qui reste utilisable), sans se perdre sous le voile.
      const el = v.etapes[v.i].el;
      const liste = [...v.bulle.querySelectorAll(FOCUSABLES), ...(el ? [...(el.matches(FOCUSABLES) ? [el] : []), ...el.querySelectorAll(FOCUSABLES)] : [])].filter(visible);
      if (!liste.length) return;
      const k = liste.indexOf(d.activeElement);
      e.preventDefault();
      const suivant = k === -1 ? (e.shiftKey ? liste.length - 1 : 0) : (k + (e.shiftKey ? -1 : 1) + liste.length) % liste.length;
      liste[suivant].focus({ preventScroll: v.bulle.contains(liste[suivant]) });
      return;
    }
    if (o.fleches && dansBulle) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); aller(v.i + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); aller(v.i - 1); }
    }
  }

  const lanceurs = [...root.querySelectorAll(o.lanceur)];
  const surLanceur = () => lancer(0);
  for (const b of lanceurs) b.addEventListener('click', surLanceur);

  return {
    lancer, fermer: () => fermer(false), aller: i => aller(i),
    detruire() { fermer(false); for (const b of lanceurs) b.removeEventListener('click', surLanceur); },
  };
}
