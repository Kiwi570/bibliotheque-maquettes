// Carte à calques : une carte SVG dont le visiteur allume ou éteint les calques (zones de couverture,
// secteurs, points de rendez-vous) depuis une légende interactive, qui sert aussi de liste texte des zones.
// À l'apparition, le trait de côte se dessine puis chaque calque allumé se révèle (contours tracés, points qui surgissent).
// Choisir une zone dans la liste la fait ressortir sur la carte (et rallume son calque s'il était éteint).
// Mode calme : carte complète d'emblée, pas d'ondes, calques allumés ou éteints sans animation.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.cac
 * @param {object} [options]
 * @param {string}  [options.debut='top 72%']  déclenchement de l'entrée (ScrollTrigger, sur la carte)
 * @param {number}  [options.duree=1.2]        durée du tracé d'un contour, en secondes
 * @param {number}  [options.decalage=.14]     décalage entre deux zones d'un même calque, en secondes
 * @param {boolean} [options.ondes=true]       ondes en boucle autour des formes marquées [data-ondes]
 */
export async function init(root, options = {}) {
  const o = { debut: 'top 72%', duree: 1.2, decalage: .14, ondes: true, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const svg = root.querySelector('.cac__svg');
  const plan = root.querySelector('.cac__plan');
  if (!svg || !plan) return { detruire() {} };
  const NS = 'http://www.w3.org/2000/svg';
  const vb = svg.viewBox.baseVal;
  const annonce = root.querySelector('[data-cac-annonce]');
  const nettoyages = [];
  const ecouter = (el, ev, fn) => { el.addEventListener(ev, fn); nettoyages.push(() => el.removeEventListener(ev, fn)); };

  // ---------- Calques, zones, boutons ----------
  const calques = new Map();
  for (const g of svg.querySelectorAll('[data-calque]')) {
    calques.set(g.dataset.calque, {
      id: g.dataset.calque, groupe: g, allume: true,
      formes: [...g.querySelectorAll('[data-zone]')],
      bouton: root.querySelector(`[data-cac-calque="${g.dataset.calque}"]`),
      bloc: root.querySelector(`.cac__groupe[data-calque="${g.dataset.calque}"]`),
    });
  }
  const zones = new Map();
  for (const c of calques.values()) {
    if (c.bouton) c.allume = c.bouton.getAttribute('aria-pressed') !== 'false';
    const n = c.bouton?.querySelector('[data-cac-compte]'); if (n) n.textContent = c.formes.length;
    for (const f of c.formes) zones.set(f.dataset.zone, { id: f.dataset.zone, calque: c, forme: f, bouton: root.querySelector(`[data-cac-zone="${f.dataset.zone}"]`), etiquette: null });
  }

  // Étiquettes HTML en % du plan : centre de la forme (ou data-x / data-y en unités du viewBox), à droite ou à gauche des points.
  const couche = document.createElement('div'); couche.className = 'cac__etiquettes'; couche.setAttribute('aria-hidden', 'true');
  for (const z of zones.values()) {
    const f = z.forme; const b = f.getBBox();
    const x = f.dataset.x ? +f.dataset.x : b.x + b.width / 2, y = f.dataset.y ? +f.dataset.y : b.y + b.height / 2;
    const e = document.createElement('span');
    e.className = 'cac__etiquette' + (f.classList.contains('cac__point') ? ' cac__etiquette--' + (f.dataset.cote || 'droite') : '');
    e.dataset.teinte = z.calque.groupe.dataset.teinte || '';
    e.style.setProperty('--x', ((x - vb.x) / vb.width * 100).toFixed(2) + '%');
    e.style.setProperty('--y', ((y - vb.y) / vb.height * 100).toFixed(2) + '%');
    e.textContent = f.dataset.nom || z.bouton?.querySelector('.cac__nom')?.textContent.trim() || z.id;
    couche.appendChild(e); z.etiquette = e;
  }
  svg.after(couche);

  // Ondes : trois cercles qui partent du centre des formes [data-ondes] (retirées en mode calme).
  const ondes = [];
  if (o.ondes && !s.calme) for (const f of svg.querySelectorAll('[data-ondes]')) {
    const cx = f.getAttribute('cx'), cy = f.getAttribute('cy'), r = f.getAttribute('r'); if (!r) continue;
    for (let i = 0; i < 3; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('class', 'cac__onde'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r); c.style.setProperty('--i', i); f.before(c); ondes.push(c); }
  }
  const io = new IntersectionObserver(([e]) => plan.classList.toggle('cac--visible', e.isIntersecting));
  io.observe(plan);

  // ---------- Animations ----------
  const traits = [...svg.querySelectorAll('.cac__fond .cac__trait')];
  const contours = c => c.formes.filter(f => !f.classList.contains('cac__point'));
  const points = c => c.formes.filter(f => f.classList.contains('cac__point'));
  for (const el of [...traits, ...[...calques.values()].flatMap(contours)]) el.setAttribute('pathLength', '1');

  function entree(c) {
    const tl = gsap.timeline();
    const cs = contours(c), ps = points(c);
    tl.set(c.groupe, { autoAlpha: 1 });
    if (cs.length) tl.fromTo(cs, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 }, { strokeDashoffset: 0, duration: o.duree, ease: 'power2.inOut', stagger: o.decalage }, 0)
      .to(cs, { fillOpacity: 1, duration: .8, ease: 'power1.out', stagger: o.decalage }, o.duree * .55);
    if (ps.length) tl.fromTo(ps, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .6, ease: 'back.out(2.4)', stagger: o.decalage }, 0);
    tl.call(() => { for (const f of c.formes) zoneDe(f).etiquette.classList.toggle('est-cache', !c.allume); }, null, Math.min(.5, o.duree * .5));
    return tl;
  }
  const zoneDe = f => zones.get(f.dataset.zone);

  let revele = s.calme, tlEntree = null;
  for (const c of calques.values()) {
    const etiquettes = c.formes.map(f => zoneDe(f).etiquette);
    if (!c.allume) { gsap.set(c.groupe, { autoAlpha: 0 }); etiquettes.forEach(e => e.classList.add('est-cache')); }
    c.bloc?.classList.toggle('est-eteint', !c.allume);
  }
  let declencheur = null;
  if (!s.calme) {
    gsap.set(traits, { strokeDasharray: 1, strokeDashoffset: 1 });
    for (const c of calques.values()) if (c.allume) { gsap.set(c.groupe, { autoAlpha: 0 }); c.formes.forEach(f => zoneDe(f).etiquette.classList.add('est-cache')); }
    tlEntree = gsap.timeline({ paused: true, onComplete: () => { revele = true; } });
    tlEntree.to(traits, { strokeDashoffset: 0, duration: o.duree * 1.6, ease: 'power2.inOut', stagger: .2 }, 0);
    let t = o.duree * .6;
    for (const c of calques.values()) if (c.allume) { tlEntree.add(entree(c), t); t += o.duree * .5; }
    declencheur = ScrollTrigger.create({ trigger: plan, start: o.debut, once: true, onEnter: () => tlEntree.play() });
  }
  // Une interaction avant la fin de l'entrée la termine d'un coup.
  const finirEntree = () => { if (revele) return; revele = true; declencheur?.kill(); tlEntree?.progress(1).kill(); };

  // ---------- États ----------
  let vise = null;
  function allumer(c, etat) {
    finirEntree();
    if (c.allume === etat) return;
    c.allume = etat;
    c.bouton?.setAttribute('aria-pressed', String(etat));
    c.bloc?.classList.toggle('est-eteint', !etat);
    if (!etat && vise && zones.get(vise).calque === c) viser(null, false);
    gsap.killTweensOf([c.groupe, ...c.formes]);
    if (etat) {
      if (s.calme) { gsap.set(c.groupe, { autoAlpha: 1 }); c.formes.forEach(f => zoneDe(f).etiquette.classList.remove('est-cache')); }
      else entree(c);
    } else {
      c.formes.forEach(f => zoneDe(f).etiquette.classList.add('est-cache'));
      if (s.calme) gsap.set(c.groupe, { autoAlpha: 0 });
      else gsap.to(c.groupe, { autoAlpha: 0, duration: .35, ease: 'power1.out' });
    }
  }
  function viser(id, dire = true) {
    finirEntree();
    vise = id && id !== vise ? id : null;
    for (const z of zones.values()) {
      const on = z.id === vise;
      z.bouton?.setAttribute('aria-pressed', String(on));
      z.forme.classList.toggle('est-vise', on);
      z.etiquette.classList.toggle('est-vise', on);
    }
    plan.classList.toggle('cac--vise', !!vise);
    if (vise) {
      const z = zones.get(vise);
      if (!z.calque.allume) allumer(z.calque, true);
      if (dire) annoncer(`${z.etiquette.textContent} : mis en évidence sur la carte.`);
    }
  }
  const annoncer = t => { if (annonce) annonce.textContent = t; };

  for (const c of calques.values()) if (c.bouton) ecouter(c.bouton, 'click', () => {
    allumer(c, !c.allume);
    const nom = c.bouton.querySelector('b')?.textContent.trim() || c.id;
    annoncer(`${nom} : ${c.allume ? 'affichés' : 'masqués'} sur la carte.`);
  });
  for (const z of zones.values()) if (z.bouton) ecouter(z.bouton, 'click', () => viser(z.id));
  ecouter(root, 'keydown', e => { if (e.key === 'Escape' && vise) viser(null); });

  s.rafraichir();
  return {
    detruire() {
      nettoyages.forEach(f => f()); io.disconnect(); declencheur?.kill(); tlEntree?.kill();
      gsap.killTweensOf([...traits, ...[...calques.values()].flatMap(c => [c.groupe, ...c.formes])]);
      gsap.set([...traits, ...[...calques.values()].flatMap(c => [c.groupe, ...c.formes])], { clearProps: 'all' });
      ondes.forEach(c => c.remove()); couche.remove(); plan.classList.remove('cac--vise', 'cac--visible');
    },
  };
}
