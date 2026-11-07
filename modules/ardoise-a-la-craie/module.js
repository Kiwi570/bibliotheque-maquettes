// Ardoise à la craie : les suggestions du jour s'écrivent à la craie quand l'ardoise arrive à l'écran. Le chiffon passe
// d'abord (on efface l'ardoise d'hier), puis la date, le titre souligné et chaque ligne s'écrivent de gauche à droite,
// un bâton de craie au bout du trait. Tiré de jardins-hacienda-maquette/la-carte-ardoise, rendu générique :
// ardoise dessinée en CSS (photo facultative), grain de craie par un filtre SVG, texte du jour modifiable sans toucher la page
// (data-source : un petit fichier JSON), date du jour automatique, et ecrire(contenu) pour effacer et réécrire.
// Mode calme, « réduire les animations », sans JavaScript : tout est écrit, rien ne bouge.
import { pret } from '../../socle/socle.js';

const LIGNES = '.ardoise__date > span, .ardoise__titre > span, .ardoise__liste > li, .ardoise__mot > span';

/** Filtre de craie (grain qui ronge les lettres, bord un peu tremblé), ajouté une fois à la page. */
function filtre() {
  if (document.getElementById('ardoise-craie')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = '<filter id="ardoise-craie" x="-4%" y="-12%" width="108%" height="124%" color-interpolation-filters="sRGB">'
    + '<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="b"/>'
    + '<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 1.95" result="t"/>'
    + '<feComposite in="SourceGraphic" in2="t" operator="in" result="g"/>'
    + '<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="9" result="o"/>'
    + '<feDisplacementMap in="g" in2="o" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(svg);
}

/** Grain de l'ardoise : un carré de bruit dessiné une fois, posé en fond (--ardoise-grain). */
function grain() {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const x = c.getContext('2d'); if (!x) return 'none';
  const img = x.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random(); img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = v > 0.985 ? 34 : v * 9; }
  x.putImageData(img, 0, 0);
  return `url(${c.toDataURL()})`;
}

const dateDuJour = () => { const t = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); return t.charAt(0).toUpperCase() + t.slice(1); };

/**
 * Contenu d'une ardoise (fichier data-source ou ecrire()) :
 * { "date": "auto" | "texte" | null, "titre": "Suggestions du jour", "lignes": [ "texte" | { "plat": "…", "prix": "9 €" } ], "mot": "texte" | null }
 * Un champ absent garde ce qui est écrit ; null l'efface.
 * @param {HTMLElement} root  section[data-module="ardoise-a-la-craie"] contenant .ardoise
 * @param {object} [options]
 * @param {string} [options.source]       adresse d'un JSON du jour (sinon data-source de .ardoise)
 * @param {number} [options.vitesse=1]    vitesse d'écriture (2 : deux fois plus vite)
 * @param {string} [options.debut='top 78%'] moment où l'ardoise s'écrit (ScrollTrigger)
 * @param {boolean} [options.chiffon=true] le chiffon passe avant d'écrire
 */
export async function init(root, options = {}) {
  const ardoise = root.querySelector('.ardoise') || root;
  const surface = ardoise.querySelector('.ardoise__surface');
  const o = { vitesse: 1, debut: 'top 78%', chiffon: true, source: ardoise.dataset.source || null, ...options };
  if (!surface) return { ecrire() {}, detruire() {} };

  // Date du jour : [data-ardoise-date] (vide ou "auto") reçoit la date en français ; sinon son texte reste.
  const date = ardoise.querySelector('[data-ardoise-date]');
  const poserDate = (v) => { if (!date) return; const s = date.querySelector('span') || date; if (v === null) { date.hidden = true; return; } date.hidden = false; s.textContent = !v || v === 'auto' ? dateDuJour() : v; };
  if (date && (date.dataset.ardoiseDate === '' || date.dataset.ardoiseDate === 'auto')) poserDate('auto');

  // Contenu d'un JSON : construit avec textContent (jamais d'HTML venu du fichier).
  function remplir(c) {
    if (!c || typeof c !== 'object') return;
    if ('date' in c) poserDate(c.date);
    const titre = ardoise.querySelector('.ardoise__titre > span'); if (titre && typeof c.titre === 'string') titre.textContent = c.titre;
    const liste = ardoise.querySelector('.ardoise__liste');
    if (liste && Array.isArray(c.lignes)) liste.replaceChildren(...c.lignes.map((l) => {
      const li = document.createElement('li'); const p = document.createElement('span'); p.className = 'ardoise__plat';
      p.textContent = typeof l === 'string' ? l : l.plat || ''; li.append(p);
      if (l && l.prix) { const q = document.createElement('span'); q.className = 'ardoise__prix'; q.textContent = l.prix; li.append(q); }
      return li;
    }));
    const mot = ardoise.querySelector('.ardoise__mot'); if (mot && 'mot' in c) { mot.hidden = !c.mot; (mot.querySelector('span') || mot).textContent = c.mot || ''; }
  }
  const charger = async () => { if (!o.source) return null; try { const r = await fetch(o.source, { cache: 'no-store' }); return r.ok ? await r.json() : null; } catch { return null; } };

  const s0 = await pret([]);
  if (s0.calme) { remplir(await charger()); return { ecrire: remplir, detruire() {} }; }
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  filtre(); ardoise.classList.add('est-craie');
  ardoise.style.setProperty('--ardoise-grain', grain());

  const ajouter = (cls) => { let e = ardoise.querySelector('.' + cls); if (!e) { e = document.createElement('span'); e.className = cls; e.setAttribute('aria-hidden', 'true'); surface.appendChild(e); } return e; };
  const chiffon = ajouter('ardoise__chiffon'), baton = ajouter('ardoise__baton');
  const trait = ardoise.querySelector('.ardoise__trait path');
  if (trait && !trait.getAttribute('pathLength')) trait.setAttribute('pathLength', '1');
  const lignes = () => [...ardoise.querySelectorAll(LIGNES)].filter((l) => !l.closest('[hidden]'));
  const cacher = () => { lignes().forEach((l) => l.style.setProperty('--m', '-10%')); if (trait) ardoise.style.setProperty('--trait', '1.1'); };
  ardoise.classList.add('est-actif'); cacher();

  // Le bâton suit le bout du trait de la ligne en cours.
  const suivre = (l, m) => {
    const r = l.getBoundingClientRect(), sr = surface.getBoundingClientRect();
    const x = r.left - sr.left + r.width * Math.min(1, Math.max(0, (m - 4) / 100)), y = r.top - sr.top + r.height * 0.62;
    baton.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${-32 + Math.sin(m * 0.35) * 6}deg)`;
  };
  const passerChiffon = (tl, debut, duree) => {
    const p = { k: 0 };
    tl.set(chiffon, { opacity: 0 }, debut).to(chiffon, { opacity: 1, duration: 0.15 }, debut)
      .to(p, { k: 1, duration: duree, ease: 'power1.inOut', onUpdate() {
        const W = surface.clientWidth, H = surface.clientHeight, k = p.k;
        chiffon.style.transform = `translate(${(-0.25 + k * 1.15) * W}px, ${(0.12 + Math.sin(k * Math.PI * 2.2) * 0.12 + k * 0.42) * H}px) rotate(${-14 + k * 22}deg)`;
      } }, debut)
      .to(chiffon, { opacity: 0, duration: 0.3 }, debut + duree - 0.25);
  };
  function ecritureDe(tl, depart) {
    let t = depart;
    for (const l of lignes()) {
      const n = Math.max(6, (l.textContent || '').trim().length);
      const d = Math.min(1, 0.2 + n * 0.016) / o.vitesse;
      tl.fromTo(l, { '--m': '-10%' }, { '--m': '112%', duration: d, ease: 'none', onStart: () => ardoise.classList.add('est-ecrit'),
        onUpdate() { suivre(l, parseFloat(getComputedStyle(l).getPropertyValue('--m')) || 0); } }, t);
      t += d * 0.86;
      if (trait && l.parentElement.classList.contains('ardoise__titre')) { tl.fromTo(ardoise, { '--trait': 1.1 }, { '--trait': 0, duration: 0.55 / o.vitesse, ease: 'power2.inOut' }, t - 0.05); t += 0.5 / o.vitesse; }
    }
    tl.call(() => ardoise.classList.remove('est-ecrit'), null, t + 0.1);
    return t;
  }

  let tl = null, ecrite = false;
  function jouer() {
    tl?.kill(); cacher();
    tl = gsap.timeline();
    let t = 0;
    if (o.chiffon) { passerChiffon(tl, 0, 0.9 / o.vitesse); t = 0.55 / o.vitesse; }
    ecritureDe(tl, t);
    tl.call(() => { ecrite = true; });
  }
  /** Efface l'ardoise (le chiffon passe, les lignes pâlissent à son passage) puis écrit le nouveau contenu. */
  function ecrire(contenu) {
    tl?.kill(); ardoise.classList.remove('est-ecrit');
    const avant = lignes(); tl = gsap.timeline();
    passerChiffon(tl, 0, 1 / o.vitesse);
    if (trait) tl.to(ardoise, { '--trait': 1.1, duration: 0.3, ease: 'power1.in' }, 0.3 / o.vitesse);
    avant.forEach((l) => { const r = l.getBoundingClientRect(), sr = surface.getBoundingClientRect(); tl.to(l, { opacity: 0, duration: 0.25 }, Math.max(0, (r.left - sr.left) / sr.width) * 0.6 / o.vitesse + 0.2); });
    // Les nouvelles lignes n'existent qu'après remplir() : leur écriture se construit à ce moment-là.
    tl.call(() => {
      remplir(contenu); avant.forEach((l) => { l.style.opacity = ''; }); cacher(); ScrollTrigger.refresh();
      tl = gsap.timeline(); ecritureDe(tl, 0.05); tl.call(() => { ecrite = true; });
    }, null, 1 / o.vitesse);
  }

  const st = ScrollTrigger.create({ trigger: ardoise, start: o.debut, once: true, onEnter: () => jouer() });
  // Le JSON du jour : avant l'écriture, il la remplace en silence ; après, l'ardoise s'efface et se réécrit.
  charger().then((c) => { if (!c) return; if (ecrite || tl?.isActive()) ecrire(c); else { remplir(c); cacher(); } });

  return { ecrire, detruire() { st.kill(); tl?.kill(); ardoise.classList.remove('est-actif', 'est-ecrit', 'est-craie'); lignes().forEach((l) => l.style.removeProperty('--m')); ardoise.style.removeProperty('--trait'); chiffon.remove(); baton.remove(); } };
}
