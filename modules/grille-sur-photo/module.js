// Grille sur photo : une grille de cases cliquables posée sur une photo (plan, pièce, terrain, produit, carte, corps…).
// Les traits de la grille se dessinent à l'arrivée, puis les cases s'allument une à une dans un ordre choisi
// (spirale depuis la porte pour un bagua, ordre de visite, de montage…), au fil du défilement. Chaque case allumée
// affiche son nom et son texte dans un cartouche de taille fixe (aucun saut de mise en page quand le texte change).
// Dès que le visiteur touche, survole ou atteint une case au clavier, l'allumage automatique s'arrête : c'est lui qui choisit.
// Ordinateur (900 × 640 et plus) : la section s'épingle le temps de l'allumage. Téléphone : l'allumage suit le passage de la photo.
// Mode calme, « réduire les animations » : traits posés, case de départ allumée, aucun allumage automatique ; les cases restent cliquables.
// Sans JavaScript : cases cernées d'un trait fin, cartouche avec le texte de départ écrit dans la page.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.gsp (.gsp__grille[style="--gsp-col:3;--gsp-lig:3"] > button.gsp__case[data-nom][data-texte] ; .gsp__cartouche > .gsp__coin-lu, .gsp__nom, .gsp__texte)
 * @param {object} [options]
 * @param {number[]} [options.ordre]       ordre d'allumage (indices des cases) ; sinon data-ordre="7,6,3,…" ; sinon spirale depuis le bas pour 3 × 3, ordre de lecture ailleurs
 * @param {number}   [options.depart]      case allumée au départ et en mode calme ; sinon data-depart ; sinon la case du centre
 * @param {number}   [options.longueur=1.6] durée de l'épinglage, en hauteurs d'écran
 * @param {number}   [options.largeurMin=900] largeur à partir de laquelle la section s'épingle
 * @param {number}   [options.hauteurMin=640] hauteur à partir de laquelle la section s'épingle
 */
export async function init(root, options = {}) {
  const s = await pret(['scrolltrigger']);
  const grille = root.querySelector('.gsp__grille');
  const cases = [...root.querySelectorAll('.gsp__case')];
  const cart = root.querySelector('.gsp__cartouche');
  if (!grille || cases.length < 2) return { detruire() {} };
  const st = getComputedStyle(grille);
  const C = Math.max(1, parseInt(st.getPropertyValue('--gsp-col')) || 3), L = Math.max(1, parseInt(st.getPropertyValue('--gsp-lig')) || Math.ceil(cases.length / C));
  const liste = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => parseInt(x, 10)).filter((x) => x >= 0 && x < cases.length);
  let ordre = liste(options.ordre || root.dataset.ordre);
  if (!ordre.length) ordre = C === 3 && L === 3 && cases.length === 9 ? [7, 6, 3, 0, 1, 2, 5, 8, 4] : cases.map((_, i) => i);
  const depart = liste([options.depart ?? root.dataset.depart ?? Math.floor(L / 2) * C + Math.floor(C / 2)])[0] ?? 0;
  const o = { longueur: 1.6, largeurMin: 900, hauteurMin: 640, ...options };
  const nom = cart && cart.querySelector('.gsp__nom'), texte = cart && cart.querySelector('.gsp__texte'), coin = cart && cart.querySelector('.gsp__coin-lu');

  /* Traits de la grille : des filets qui se dessinent (posés tout de suite en mode calme). */
  const traits = document.createElement('div');
  traits.className = 'gsp__traits'; traits.setAttribute('aria-hidden', 'true');
  let k = 0;
  for (let c = 1; c < C; c++) { const t = document.createElement('i'); t.className = 'gsp__trait gsp__trait--v'; t.style.cssText = `left:${(c / C) * 100}%;--i:${k++}`; traits.append(t); }
  for (let l = 1; l < L; l++) { const t = document.createElement('i'); t.className = 'gsp__trait gsp__trait--h'; t.style.cssText = `top:${(l / L) * 100}%;--i:${k++}`; traits.append(t); }
  grille.prepend(traits);
  root.classList.add('est-pret');

  /* Cartouche : sa hauteur est celle du plus long texte, mesurée (jamais devinée), pour que rien ne saute. */
  const remplir = (el) => { if (!cart || !el) return; if (nom) nom.textContent = el.dataset.nom || ''; if (texte) texte.textContent = el.dataset.texte || ''; if (coin) coin.textContent = el.dataset.coin || ''; };
  let largeurMesuree = 0;
  const mesurer = () => {
    if (!cart) return; const w = cart.clientWidth; if (!w || w === largeurMesuree) return; largeurMesuree = w;
    cart.style.minHeight = ''; let max = 0;
    for (const el of cases) { remplir(el); max = Math.max(max, cart.offsetHeight); }
    remplir(actuelle || cases[depart]); cart.style.minHeight = max + 'px';
  };
  let actuelle = null, manuel = false;
  const allumer = (el, vues = []) => {
    actuelle = el;
    cases.forEach((c) => { const on = c === el; c.classList.toggle('est-allumee', on); c.classList.toggle('est-vue', !on && vues.includes(c)); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    remplir(el);
  };
  const choisir = (el) => { if (!manuel) { manuel = true; root.classList.add('est-choisie'); cart && cart.setAttribute('aria-live', 'polite'); } if (el !== actuelle) allumer(el); };
  cases.forEach((c, i) => {
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', () => choisir(c));
    c.addEventListener('focus', () => { if (c.matches(':focus-visible')) choisir(c); });
    c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) choisir(c); });
    c.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: C, ArrowUp: -C }[e.key];
      if (d == null) return; const j = i + d; if (j < 0 || j >= cases.length || (Math.abs(d) === 1 && Math.floor(j / C) !== Math.floor(i / C))) return;
      e.preventDefault(); cases[j].focus();
    });
  });
  allumer(cases[depart]);
  mesurer();
  const ro = new ResizeObserver(mesurer); cart && ro.observe(cart);

  if (s.calme) { root.classList.add('est-trace'); return { detruire() { ro.disconnect(); traits.remove(); } }; }
  root.classList.add('est-actif');
  const { gsap, ScrollTrigger } = s;
  let dernier = -1;
  const suivre = (p) => {
    if (manuel) return;
    const n = Math.min(ordre.length - 1, Math.floor(p * ordre.length * 0.999));
    if (n === dernier) return; dernier = n;
    allumer(cases[ordre[n]], ordre.slice(0, n).map((x) => cases[x]));
  };
  const trace = ScrollTrigger.create({ trigger: grille, start: 'top 88%', once: true, onEnter: () => root.classList.add('est-trace') });
  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('gsp--epingle'); largeurMesuree = 0; mesurer();
    const x = ScrollTrigger.create({ trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true,
      onUpdate: (t) => suivre(t.progress), onToggle: (t) => root.classList.toggle('est-epingle', t.isActive) });
    return () => { x.kill(); root.classList.remove('gsp--epingle', 'est-epingle'); largeurMesuree = 0; mesurer(); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const x = ScrollTrigger.create({ trigger: grille, start: 'top 75%', end: 'bottom 35%', onUpdate: (t) => suivre(t.progress) });
    return () => x.kill();
  });
  return { allumer: (i) => choisir(cases[i]), detruire() { mm.revert(); trace.kill(); ro.disconnect(); traits.remove(); root.classList.remove('est-actif', 'est-pret', 'est-trace'); } };
}
