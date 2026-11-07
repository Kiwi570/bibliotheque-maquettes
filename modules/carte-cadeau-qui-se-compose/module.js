// Carte cadeau qui se compose : on choisit le montant (boutons ou montant libre), le nombre de cartes et un mot ; la carte
// se dessine en direct (montant qui compte, prénom et mot écrits à la main, pile de cartes selon la quantité) avec le total.
// À la validation, elle glisse dans une enveloppe dont le rabat se ferme en 3D, un cachet de cire la scelle et le prénom
// s'écrit sur l'enveloppe (achat simulé, ou envoyer() du site). Tiré de jardins-hacienda-maquette/carte-cadeau-composer
// (carte en direct et total) et beat-haechler-maquette/bons-cadeaux-hero (enveloppe, rabat en 3D, inclinaison sous la souris).
// Mode calme, « réduire les animations » : mêmes états, sans mouvement. Sans JavaScript : un formulaire ordinaire.
import { pret } from '../../socle/socle.js';

const TEXTES = {
  pour: 'Pour {pour}', de: 'De la part de {de}', quantite: '× {n}',
  ticketUn: 'Une carte de {montant}', ticket: '{n} cartes de {montant} · total {total}',
  annonce: 'Total\u00a0: {total}',
  uneCarte: 'une carte de {montant}', plusieurs: '{n} cartes de {montant}', pourQui: ' pour {pour}',
  statut: 'Carte prête\u00a0: {quoi}{pourQui}, total {total}. {simule}',
  simule: 'Achat simulé\u00a0: rien n’est débité.',
  preparation: 'Préparation de la carte…',
  erreurMontant: 'Choisissez un montant entre {min} et {max}.',
  echec: 'La carte n’a pas pu être enregistrée. Réessayez dans un instant.',
};
const OUVERT = 125; // angle du rabat ouvert : renversé vers l'arrière, doublure visible
const remplir = (t, v) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const borne = (v, a, b) => Math.min(b, Math.max(a, v));

/** Cire du cachet : un disque au bord irrégulier, une coulure, un anneau, les initiales. */
function cachetSvg(initiales) {
  const pts = [];
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, r = 41 + Math.sin(i * 2.7) * 2.2 + Math.cos(i * 1.3) * 1.6 + (i === 9 ? 6 : 0); pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]); }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) { const p = pts[(i + 1) % pts.length], q = pts[(i + 2) % pts.length]; d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`; }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.innerHTML = `<path class="ccq__cire" d="${d} Z"/><circle class="ccq__anneau" cx="50" cy="50" r="30"/><ellipse class="ccq__brillance" cx="36" cy="30" rx="13" ry="6" transform="rotate(-30 36 30)"/><text x="50" y="51" text-anchor="middle" dominant-baseline="central"></text>`;
  svg.querySelector('text').textContent = initiales;
  return svg;
}

/**
 * @param {HTMLElement} root  section[data-module="carte-cadeau-qui-se-compose"] (.ccq) contenant .ccq__scene et .ccq__form
 * @param {object} [options]
 * @param {number}  [options.min=10]          montant libre minimal
 * @param {number}  [options.max=1000]        montant libre maximal
 * @param {number}  [options.quantiteMax=10]  nombre de cartes au plus
 * @param {string}  [options.devise='EUR']    devise (code ISO, pour le total)
 * @param {string}  [options.langue='fr-FR']  format des nombres
 * @param {string}  [options.cachet]          initiales du cachet (sinon data-cachet, sinon le monogramme de la carte)
 * @param {Function} [options.envoyer]        async ({ montant, quantite, total, pour, de, mot }) => true | false : vrai achat ;
 *                                            sans elle, l'achat est simulé. Faux ou erreur : message d'échec, la carte ne part pas.
 * @param {object}  [options.textes]          textes à remplacer (voir TEXTES)
 */
export async function init(root, options = {}) {
  const form = root.querySelector('.ccq__form');
  const scene = root.querySelector('.ccq__scene');
  const plateau = root.querySelector('.ccq__plateau');
  const paquet = root.querySelector('.ccq__paquet');
  const carte = root.querySelector('.ccq__carte');
  if (!form || !plateau || !paquet || !carte) return { detruire() {} };
  const T = { ...TEXTES, ...(options.textes || {}) };
  const o = { min: 10, max: 1000, quantiteMax: 10, devise: 'EUR', langue: 'fr-FR', envoyer: null, ...options, textes: T };
  o.cachet = o.cachet || root.dataset.cachet || (root.querySelector('.ccq__monogramme')?.textContent.trim() || '').slice(0, 3);

  const s = await pret(['gsap']);
  const { gsap } = s;
  const calme = () => s.calme;
  const $ = (sel) => root.querySelector(sel);
  const el = { montant: $('[data-ccq-montant]'), pour: $('[data-ccq-pour]'), mot: $('[data-ccq-mot]'), de: $('[data-ccq-de]'), quantite: $('[data-ccq-quantite]'),
    total: $('[data-ccq-total]'), ticket: $('[data-ccq-ticket]'), annonce: $('[data-ccq-annonce]'), statut: $('[data-ccq-statut]'), reste: $('[data-ccq-reste]'),
    erreur: $('[data-ccq-erreur="montant"]'), reprendre: $('[data-ccq-reprendre]'), offrir: form.querySelector('[type="submit"]') };
  const champ = (n) => form.elements.namedItem(n);
  const libre = champ('montant_libre'), qte = champ('quantite'), mot = champ('mot');
  const nombre = new Intl.NumberFormat(o.langue, { maximumFractionDigits: 2 });
  const prix = (v) => new Intl.NumberFormat(o.langue, { style: 'currency', currency: o.devise, maximumFractionDigits: Number.isInteger(v) ? 0 : 2 }).format(v);
  const nettoyages = [];
  const ecouter = (cible, ev, fn, opt) => { cible.addEventListener(ev, fn, opt); nettoyages.push(() => cible.removeEventListener(ev, fn, opt)); };
  root.classList.add('est-actif');

  // ---------- Enveloppe : dos, rabat (dehors, doublure, cachet) et poche, de part et d'autre de la carte ----------
  const creer = (cls, parent, tag = 'div') => { const e = document.createElement(tag); e.className = cls; parent?.appendChild(e); return e; };
  const dos = creer('ccq__env ccq__env--dos'), boiteRabat = creer('ccq__env ccq__env--rabat'), poche = creer('ccq__env ccq__env--poche');
  const rabat = creer('ccq__rabat', boiteRabat, 'span'); creer('ccq__rabat-dehors', rabat, 'span'); creer('ccq__rabat-dedans', rabat, 'span');
  const cachet = creer('ccq__cachet', boiteRabat, 'span'); cachet.appendChild(cachetSvg(o.cachet));
  ['g', 'd', 'b'].forEach((c) => creer('ccq__poche ccq__poche--' + c, poche, 'span'));
  const nom = creer('ccq__env-nom', poche, 'p');
  plateau.prepend(dos, boiteRabat); plateau.append(poche);
  const env = [dos, boiteRabat, poche];
  const pile = creer('ccq__pile', null, 'span'); paquet.prepend(pile);
  gsap.set(plateau, { transformPerspective: 1200 });

  // ---------- Lecture du formulaire et carte en direct ----------
  const lire = () => {
    const r = form.querySelector('[name="montant"]:checked');
    const libreVoulu = !r || r.value === 'libre';
    const montant = libreVoulu ? Math.round((parseFloat(String(libre?.value || '').replace(',', '.')) || 0) * 100) / 100 : +r.value;
    const quantite = borne(Math.round(+qte?.value || 1), 1, o.quantiteMax);
    const v = (n) => (champ(n)?.value || '').trim();
    return { montant, quantite, total: Math.round(montant * quantite * 100) / 100, pour: v('pour'), de: v('de'), mot: v('mot'), libre: libreVoulu };
  };
  let affiche = parseFloat(String(el.montant?.textContent || '0').replace(/\s/g, '').replace(',', '.')) || 0, tCompte = null, nPile = 0, tAnnonce = 0, dernierTotal = '';
  function compter(v) {
    if (!el.montant || v === affiche) return;
    tCompte?.kill();
    if (calme()) { affiche = v; el.montant.textContent = nombre.format(v); return; }
    const p = { v: affiche }; affiche = v;
    tCompte = gsap.to(p, { v, duration: .5, ease: 'power2.out', onUpdate: () => { el.montant.textContent = nombre.format(Math.round(p.v)); }, onComplete: () => { el.montant.textContent = nombre.format(v); } });
    gsap.fromTo(carte, { scale: 1.025 }, { scale: 1, duration: .5, ease: 'power2.out', overwrite: 'auto' });
  }
  function empiler(q) {
    const n = Math.min(3, q - 1); if (n === nPile) return;
    const avant = nPile; nPile = n;
    while (pile.children.length < n) { const c = creer('', pile, 'span'); c.style.setProperty('--i', String(pile.children.length)); }
    // Le décalage de chaque carte est dans transform (CSS) : l'entrée et la sortie passent par translate et opacity (WAAPI), sans y toucher.
    [...pile.children].forEach((c, i) => {
      if (i < n && i >= avant && !calme()) c.animate([{ opacity: 0, translate: '-14px 12px' }, { opacity: 1, translate: '0 0' }], { duration: 450, delay: (i - avant) * 60, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
      else if (i >= n) { if (calme()) c.remove(); else c.animate([{ opacity: 1 }, { opacity: 0, translate: '0 12px' }], { duration: 250, fill: 'forwards' }).finished.then(() => c.remove(), () => c.remove()); }
    });
  }
  function maj() {
    const v = lire();
    compter(v.montant);
    if (el.pour) el.pour.textContent = v.pour ? remplir(T.pour, v) : '';
    if (el.de) el.de.textContent = v.de ? remplir(T.de, v) : '';
    if (el.mot) el.mot.textContent = v.mot ? `«\u00a0${v.mot}\u00a0»` : '';
    if (el.quantite) { el.quantite.hidden = v.quantite < 2; el.quantite.textContent = remplir(T.quantite, { n: v.quantite }); }
    empiler(v.quantite);
    const total = v.montant > 0 ? prix(v.total) : '—';
    if (el.total) el.total.textContent = total;
    if (el.ticket) el.ticket.textContent = v.montant > 0 ? remplir(v.quantite > 1 ? T.ticket : T.ticketUn, { n: v.quantite, montant: prix(v.montant), total }) : '';
    if (el.reste && mot) el.reste.textContent = String((mot.maxLength > 0 ? mot.maxLength : 120) - mot.value.length);
    // Total annoncé aux lecteurs d'écran après une pause de saisie (pas à chaque touche).
    clearTimeout(tAnnonce);
    tAnnonce = setTimeout(() => { if (el.annonce && total !== dernierTotal) { dernierTotal = total; el.annonce.textContent = remplir(T.annonce, { total }); } }, 800);
    return v;
  }

  // ---------- Erreurs ----------
  function erreur(msg) {
    if (el.erreur) el.erreur.textContent = msg || '';
    if (libre) { if (msg) libre.setAttribute('aria-invalid', 'true'); else libre.removeAttribute('aria-invalid'); }
  }
  const montantValide = (v) => v.montant >= o.min && v.montant <= o.max;
  const msgMontant = () => remplir(T.erreurMontant, { min: prix(o.min), max: prix(o.max) });

  // ---------- Interactions du formulaire ----------
  ecouter(form, 'input', (e) => {
    if (e.target === libre) { const r = form.querySelector('[name="montant"][value="libre"]'); if (r && !r.checked && libre.value !== '') r.checked = true; }
    if (e.target.name === 'montant' && e.target.value !== 'libre') erreur('');
    if (scelle) ouvrir();
    maj();
  });
  ecouter(form, 'change', (e) => { if (e.target === qte) { qte.value = String(lire().quantite); maj(); } });
  if (libre) {
    ecouter(libre, 'focus', () => { const r = form.querySelector('[name="montant"][value="libre"]'); if (r && !r.checked) { r.checked = true; maj(); } });
    ecouter(libre, 'blur', () => { const v = lire(); if (v.libre && libre.value !== '' && !montantValide(v)) erreur(msgMontant()); else if (montantValide(v)) erreur(''); });
  }
  const pas = (d) => { if (!qte) return; qte.value = String(borne((+qte.value || 1) + d, 1, o.quantiteMax)); qte.dispatchEvent(new Event('input', { bubbles: true })); };
  const moins = root.querySelector('[data-ccq-moins]'), plus = root.querySelector('[data-ccq-plus]');
  if (moins) ecouter(moins, 'click', () => pas(-1));
  if (plus) ecouter(plus, 'click', () => pas(1));

  // ---------- Inclinaison et reflet sous la souris ----------
  let scelle = false, occupe = false;
  if (s.souris && scene) {
    const rx = gsap.quickTo(plateau, 'rotationX', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(plateau, 'rotationY', { duration: .8, ease: 'power3' });
    ecouter(scene, 'pointermove', (e) => {
      if (calme() || occupe || scelle) return;
      const r = paquet.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ry(borne(x - .5, -.8, .8) * 16); rx(borne(.5 - y, -.8, .8) * 12);
      carte.style.setProperty('--mx', (borne(x, 0, 1) * 100).toFixed(1) + '%'); carte.style.setProperty('--my', (borne(y, 0, 1) * 100).toFixed(1) + '%');
    });
    ecouter(scene, 'pointerleave', () => { if (!occupe && !scelle) { rx(0); ry(0); } });
  }

  // ---------- Apparition : le filet de la carte se trace ----------
  if (!calme()) {
    carte.style.setProperty('--ccq-trace', '1');
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      gsap.fromTo(carte, { '--ccq-trace': 1 }, { '--ccq-trace': 0, duration: 1.6, ease: 'power2.inOut' });
      gsap.from(carte.querySelectorAll('.ccq__monogramme, .ccq__logo, .ccq__noms, .ccq__montant, .ccq__dedicace'), { opacity: 0, y: 8, duration: .7, ease: 'power2.out', stagger: .08, delay: .3, clearProps: 'opacity,transform' });
    }, { threshold: .35 });
    io.observe(carte); nettoyages.push(() => io.disconnect());
  }

  // ---------- Amener la scène à l'écran (téléphone : le bouton est sous la carte) ----------
  async function amener() {
    const r = scene.getBoundingClientRect();
    const haut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
    if (r.top >= haut - 4 && r.bottom <= innerHeight + 4) return;
    const y = Math.max(0, scrollY + r.top - haut - Math.max(12, (innerHeight - haut - r.height) / 2));
    if (s.lenis) s.lenis.scrollTo(y, { immediate: calme() }); else scrollTo({ top: y, behavior: calme() ? 'auto' : 'smooth' });
    if (!calme()) await new Promise((ok) => setTimeout(ok, 650));
  }

  // ---------- Sceller : la carte glisse dans l'enveloppe, le rabat se ferme, le cachet tombe ----------
  let tl = null;
  function sceller(v) {
    tl?.kill(); tCompte?.progress(1);
    nom.textContent = v.pour ? remplir(T.pour, v) : '';
    const H = paquet.offsetHeight, E = dos.offsetHeight;
    const yFin = E * .43 - H * .45; // le bas de la carte au fond de la poche
    tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => { occupe = false; } });
    tl.set(boiteRabat, { zIndex: 1 }).set(rabat, { rotationX: OUVERT, transformPerspective: 1100 })
      .set(cachet, { opacity: 0, scale: 1.9, rotation: -26 }).set(nom, { clipPath: 'inset(-20% 100% -20% 0)' })
      .to(plateau, { rotationX: 0, rotationY: 0, rotation: 0, y: 0, duration: .45 }, 0)
      .to(paquet, { y: -H * .16, scale: .95, duration: .55, ease: 'power2.out' }, 0)
      .fromTo(env, { y: E * .55 }, { y: 0, duration: .75, ease: 'power3.out' }, .12)
      .fromTo(env, { opacity: 0 }, { opacity: 1, duration: .3, ease: 'none' }, .12)
      .to(paquet, { y: yFin, scale: .9, duration: .8, ease: 'power2.in' }, .78)
      .to(env, { y: 5, duration: .1, ease: 'power1.out', yoyo: true, repeat: 1 }, 1.56)
      .to(rabat, { rotationX: 0, duration: .8 }, 1.72)
      .set(boiteRabat, { zIndex: 4 }, 2.04)
      .to(cachet, { opacity: 1, scale: 1, rotation: -8, duration: .5, ease: 'back.out(2.4)' }, 2.6)
      .to(env, { y: 3, duration: .07, yoyo: true, repeat: 1 }, 2.74)
      .to(nom, { clipPath: 'inset(-20% 0% -20% 0)', duration: .95, ease: 'power1.inOut' }, 2.95)
      .to(plateau, { rotation: -2.2, y: -4, duration: .9, ease: 'power2.out' }, 3.05);
    if (calme()) tl.progress(1);
    return tl;
  }
  function ouvrir() {
    if (!scelle) return;
    scelle = false; root.classList.remove('est-scelle');
    const avaitFocus = document.activeElement === el.reprendre;
    if (el.reprendre) el.reprendre.hidden = true;
    if (el.offrir) { el.offrir.hidden = false; if (avaitFocus) el.offrir.focus({ preventScroll: true }); }
    if (el.statut) { el.statut.hidden = true; el.statut.textContent = ''; }
    tl?.kill();
    const H = paquet.offsetHeight, E = dos.offsetHeight;
    tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => { occupe = false; } });
    tl.to(plateau, { rotation: 0, y: 0, duration: .45 }, 0)
      .to([cachet, nom], { opacity: 0, duration: .25 }, 0)
      .to(rabat, { rotationX: OUVERT, duration: .65 }, .15).set(boiteRabat, { zIndex: 1 }, .42)
      .to(paquet, { y: -H * .16, scale: .95, duration: .55, ease: 'power2.out' }, .62)
      .to(env, { y: E * .55, opacity: 0, duration: .55, ease: 'power2.in' }, .95)
      .to(paquet, { y: 0, scale: 1, duration: .6 }, 1.0)
      .set(nom, { opacity: 1 });
    if (calme()) tl.progress(1);
  }

  ecouter(form, 'submit', async (e) => {
    e.preventDefault();
    if (occupe) return;
    if (scelle) return;
    const v = maj();
    if (!montantValide(v)) { erreur(msgMontant()); (v.libre ? libre : form.querySelector('[name="montant"]'))?.focus(); return; }
    erreur('');
    occupe = true; el.offrir?.setAttribute('aria-busy', 'true');
    const detail = { montant: v.montant, quantite: v.quantite, total: v.total, pour: v.pour, de: v.de, mot: v.mot };
    root.dispatchEvent(new CustomEvent('ccq:valide', { detail, bubbles: true }));
    if (typeof o.envoyer === 'function') {
      if (el.statut) { el.statut.hidden = false; el.statut.textContent = T.preparation; }
      let ok = false; try { ok = (await o.envoyer(detail)) !== false; } catch { ok = false; }
      if (!ok) { occupe = false; el.offrir?.removeAttribute('aria-busy'); if (el.statut) el.statut.textContent = T.echec; return; }
    }
    await amener();
    scelle = true; root.classList.add('est-scelle');
    el.offrir?.removeAttribute('aria-busy');
    const quoi = remplir(v.quantite > 1 ? T.plusieurs : T.uneCarte, { n: v.quantite, montant: prix(v.montant) });
    const message = remplir(T.statut, { quoi, pourQui: v.pour ? remplir(T.pourQui, v) : '', total: prix(v.total), simule: typeof o.envoyer === 'function' ? '' : T.simule }).trim();
    sceller(v);
    // Le message arrive quand le cachet est posé (tout de suite en mode calme).
    const dire = () => {
      if (!scelle) return;
      if (el.statut) { el.statut.hidden = false; el.statut.textContent = message; }
      // « Offrir » laisse la place à « Composer une autre carte », qui reçoit le focus s'il était sur le bouton d'envoi.
      if (el.reprendre) { const f = document.activeElement === el.offrir; el.reprendre.hidden = false; if (el.offrir) el.offrir.hidden = true; if (f) el.reprendre.focus({ preventScroll: true }); }
    };
    if (calme()) dire(); else tl.call(dire, null, 3.1);
  });
  if (el.reprendre) ecouter(el.reprendre, 'click', () => { ouvrir(); (form.querySelector('[name="montant"]:checked') || form.querySelector('input'))?.focus({ preventScroll: true }); });

  maj();
  return {
    /** Valeurs actuelles du formulaire. */
    lire,
    /** Ferme l'enveloppe comme à la validation (sans contrôle ni envoi). */
    sceller: () => { const v = maj(); scelle = true; root.classList.add('est-scelle'); return sceller(v); },
    /** Rouvre l'enveloppe et rend la carte au formulaire. */
    ouvrir,
    detruire() {
      tl?.kill(); tCompte?.kill(); clearTimeout(tAnnonce); nettoyages.forEach((f) => f());
      [...env, pile].forEach((n) => n.remove()); gsap.set([plateau, paquet, carte], { clearProps: 'all' });
      root.classList.remove('est-actif', 'est-scelle');
    },
  };
}
