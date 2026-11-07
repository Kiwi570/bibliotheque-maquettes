// Accords mets et vins : on touche un plat de la carte, le verre se vide, change de forme si la boisson le demande
// (ballon, tulipe, flûte, coupe, pinte, gobelet) puis se remplit par le fond de la couleur conseillée (vin, bière, cocktail, thé),
// avec houle, bulles ou mousse ; la fiche donne le nom, la région et le mot du sommelier. Contenu dans un JSON (data-source),
// sinon lu dans la liste de la page. Tiré de artic-maquette/projets-distribotion-produits (verre qui se remplit par le fond,
// bulles qui montent dans le liquide) et chateau-haut-piquat-maquette/oenotourisme-ecrivins (couleur du vin et texte qui la décrit).
// Clavier : boutons radio (flèches). Lecteurs d'écran : la fiche est annoncée. Mode calme : verre plein, fiche changée d'un coup.
// Sans JavaScript : la liste montre chaque accord.
import { pret } from '../../socle/socle.js';

const NS = 'http://www.w3.org/2000/svg';
/* Verres : la coupe en quatre courbes (bord gauche → ventre → fond → ventre → bord droit, moitié droite en miroir), toujours
   la même suite de commandes pour que GSAP passe d'un verre à l'autre ; vide et plein : niveaux du liquide ; yb/ys : jambe ; fw : pied. */
const VERRES = {
  ballon: { g: [[50, 34], [46, 58], [42, 80], [44, 104], [46, 146], [72, 172], [100, 172]], vide: 172, plein: 106, yb: 171, ys: 270, fw: 44, b: 'M61 50 C55 78 55 118 68 146' },
  tulipe: { g: [[68, 30], [58, 58], [50, 88], [53, 114], [56, 142], [76, 160], [100, 160]], vide: 160, plein: 98, yb: 159, ys: 270, fw: 40, b: 'M70 46 C62 76 60 114 72 140' },
  flute: { g: [[82, 20], [79, 50], [76, 82], [78, 110], [80, 150], [90, 178], [100, 178]], vide: 178, plein: 44, yb: 177, ys: 270, fw: 36, b: 'M87 34 C84 70 84 118 90 150' },
  coupe: { g: [[34, 74], [36, 94], [42, 108], [52, 118], [64, 130], [80, 136], [100, 136]], vide: 136, plein: 84, yb: 135, ys: 270, fw: 42, b: 'M46 84 C52 102 62 114 76 121' },
  pinte: { g: [[58, 30], [62, 120], [66, 200], [68, 262], [69, 279], [80, 282], [100, 282]], vide: 282, plein: 60, yb: 282, ys: 282, fw: 0, b: 'M70 46 C72 120 74 200 76 252' },
  gobelet: { g: [[62, 110], [64, 170], [67, 220], [69, 262], [70, 279], [82, 282], [100, 282]], vide: 282, plein: 134, yb: 282, ys: 282, fw: 0, b: 'M73 124 C74 170 75 212 77 252' },
};
const TYPES = {
  'vin-rouge': { nom: 'Vin rouge', verre: 'ballon', couleur: '#6c1527' },
  'vin-blanc': { nom: 'Vin blanc', verre: 'tulipe', couleur: '#e2c25c' },
  rose: { nom: 'Vin rosé', verre: 'tulipe', couleur: '#f0a093' },
  petillant: { nom: 'Bulles', verre: 'flute', couleur: '#efdb93', bulles: true },
  biere: { nom: 'Bière', verre: 'pinte', couleur: '#c27222', bulles: true, mousse: true },
  cocktail: { nom: 'Cocktail', verre: 'coupe', couleur: '#e8846f' },
  the: { nom: 'Thé', verre: 'gobelet', couleur: '#a8622a' },
  'sans-alcool': { nom: 'Sans alcool', verre: 'gobelet', couleur: '#e09a3c', bulles: true },
};
const TEXTES = { avec: 'Avec · {plat}', signature: 'Le mot du sommelier', groupe: 'Choisir un plat pour voir son accord' };
const typo = (t) => String(t || '').trim().replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
const remplir = (t, v) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));

const coupe = (v) => { const m = ([x, y]) => [200 - x, y]; const [p0, c1, c2, p1, c3, c4, p2] = v.g;
  const s = [p0, c1, c2, p1, c3, c4, p2, m(c4), m(c3), m(p1), m(c2), m(c1), m(p0)].map(([x, y]) => `${x} ${y}`);
  return `M${s[0]} C${s[1]} ${s[2]} ${s[3]} C${s[4]} ${s[5]} ${s[6]} C${s[7]} ${s[8]} ${s[9]} C${s[10]} ${s[11]} ${s[12]} Z`; };
const pied = ({ yb, ys, fw }) => `M97.6 ${yb} L97.6 ${ys} L102.4 ${ys} L102.4 ${yb} Z M${100 - fw} 282 C${(100 - fw * .55).toFixed(1)} ${(282 - fw * .24).toFixed(1)} ${(100 + fw * .55).toFixed(1)} ${(282 - fw * .24).toFixed(1)} ${100 + fw} 282 C${(100 + fw * .55).toFixed(1)} 285.5 ${(100 - fw * .55).toFixed(1)} 285.5 ${100 - fw} 282 Z`;
function vague() { let d = 'M-100 0'; for (let x = -100; x < 300; x += 50) d += ` Q${x + 12.5} -3.2 ${x + 25} 0 Q${x + 37.5} 3.2 ${x + 50} 0`; return d + ' V9 H-100 Z'; }
function mousse() { let d = 'M-20 4 V-9'; for (let x = -20; x < 220; x += 12) d += ` q6 -${(5 + (x % 5)).toFixed(0)} 12 0`; return d + ' V4 Z'; }

function svgVerre(uid) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 200 300'); s.setAttribute('class', 'ame__svg'); s.setAttribute('focusable', 'false');
  const bulles = [[86, 1.6, 2.6, -.2], [93, 1.2, 2.1, -1.1], [100, 2.1, 3.1, -.6], [107, 1.4, 2.4, -1.8], [114, 1.8, 2.9, -.9], [90, 1, 1.9, -1.5], [110, 1.3, 2.2, -.3], [97, 1.7, 2.7, -2.2], [103, 1.1, 2, -1.3]]
    .map(([x, r, d, a]) => `<circle cx="${x}" cy="90" r="${r}" style="--d:${d}s;--r:${a}s"/>`).join('');
  s.innerHTML = `<defs><clipPath id="${uid}-coupe"><path class="ame__clip"/></clipPath>
    <linearGradient id="${uid}-vol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="ame__ombre-bord"/><stop offset=".38" class="ame__ombre-centre"/><stop offset=".66" class="ame__ombre-centre"/><stop offset="1" class="ame__ombre-bord"/></linearGradient>
    <linearGradient id="${uid}-fond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ame__clair"/><stop offset=".55" class="ame__clair" style="stop-opacity:0"/><stop offset="1" class="ame__sombre"/></linearGradient></defs>
    <ellipse class="ame__sol" cx="100" cy="286" rx="60" ry="5"/>
    <path class="ame__pied"/><path class="ame__coupe"/>
    <g clip-path="url(#${uid}-coupe)">
      <g class="ame__liquide"><rect class="ame__corps" x="-20" y="4" width="240" height="320"/><g class="ame__houle"><path class="ame__vague" d="${vague()}"/></g>
        <rect x="-20" y="0" width="240" height="300" fill="url(#${uid}-fond)"/><path class="ame__mousse" d="${mousse()}"/><g class="ame__bulles">${bulles}</g></g>
      <rect x="0" y="0" width="200" height="300" fill="url(#${uid}-vol)"/>
    </g>
    <path class="ame__contour"/><path class="ame__brillance"/>`;
  return s;
}

/**
 * Contenu (fichier data-source, ou option contenu) :
 * { "signature": "Le mot du sommelier", "choisi": "id", "plats": [ { "id", "moment", "plat", "detail",
 *   "accord": { "type": "vin-rouge|vin-blanc|rose|petillant|biere|cocktail|the|sans-alcool", "nom", "region", "mot",
 *               "couleur": "#6c1527", "verre": "ballon|tulipe|flute|coupe|pinte|gobelet", "bulles": bool, "mousse": bool } } ] }
 * Sans fichier, les plats sont lus dans la liste (li.ame__plat et ses data-*).
 * @param {HTMLElement} root  section[data-module="accords-mets-et-vins"] contenant .ame__liste et .ame__scene
 * @param {object} [options]
 * @param {string} [options.source]   adresse du JSON (sinon data-source de la section)
 * @param {object} [options.contenu]  contenu déjà chargé (même forme que le JSON)
 * @param {string} [options.choisi]   plat montré d'abord (sinon « choisi » du JSON, data-choisi de la liste, ou le premier)
 * @param {number} [options.duree=1.5] durée du remplissage, en secondes
 * @param {object} [options.textes]   { avec, signature, groupe }
 */
export async function init(root, options = {}) {
  const liste = root.querySelector('.ame__liste');
  const verre = root.querySelector('.ame__verre');
  const fiche = root.querySelector('.ame__fiche');
  if (!liste || !verre || !fiche) return { choisir() {}, detruire() {} };
  const T = { ...TEXTES, ...(options.textes || {}) };
  const o = { source: root.dataset.source || null, contenu: null, choisi: null, duree: 1.5, ...options };
  const s = await pret(['gsap']);
  const { gsap } = s;
  const calme = () => s.calme;
  const uid = 'ame-' + Math.random().toString(36).slice(2, 8);
  const nettoyages = [];

  // ---------- Contenu : JSON ou liste de la page ----------
  const txt = (li, sel) => (li.querySelector(sel)?.textContent || '').trim();
  const lireListe = () => [...liste.querySelectorAll('.ame__plat')].map((li, i) => ({
    id: li.dataset.plat || 'plat-' + (i + 1), moment: txt(li, '.ame__moment'), plat: txt(li, '.ame__nom'), detail: txt(li, '.ame__detail'),
    accord: { type: li.dataset.type, nom: txt(li, '.ame__boisson'), region: txt(li, '.ame__region'), mot: txt(li, '.ame__mot').replace(/^«\s*|\s*»$/g, ''),
      couleur: li.dataset.couleur, verre: li.dataset.verre, bulles: 'bulles' in li.dataset ? true : undefined, mousse: 'mousse' in li.dataset ? true : undefined },
  }));
  const normaliser = (p) => {
    const a = p.accord || {}; const t = TYPES[a.type] || { nom: a.type || '', verre: 'gobelet', couleur: null };
    return { ...p, id: String(p.id), accord: { ...a, typeNom: a.typeNom || t.nom, couleur: a.couleur || t.couleur || getComputedStyle(root).getPropertyValue('--couleur-accent').trim(),
      verre: VERRES[a.verre] ? a.verre : t.verre, bulles: a.bulles ?? !!t.bulles, mousse: a.mousse ?? !!t.mousse } };
  };
  let plats = lireListe().map(normaliser);
  let signature = T.signature;

  // La liste de la page (re)construite depuis le contenu : textContent seulement, jamais d'HTML venu du fichier.
  function construire(ps) {
    liste.replaceChildren(...ps.map((p) => {
      const li = document.createElement('li'); li.className = 'ame__plat'; li.dataset.plat = p.id; li.style.setProperty('--c', p.accord.couleur);
      const el = (tag, cls, t) => { const e = document.createElement(tag); e.className = cls; if (t != null) e.textContent = typo(t); li.append(e); return e; };
      el('span', 'ame__pastille').setAttribute('aria-hidden', 'true');
      el('p', 'ame__moment', p.moment); el('h3', 'ame__nom', p.plat); if (p.detail) el('p', 'ame__detail', p.detail);
      const acc = el('p', 'ame__accord'); acc.textContent = typo([p.accord.typeNom, p.accord.nom, p.accord.region].filter(Boolean).join(' · '));
      if (p.accord.mot) el('p', 'ame__mot', p.accord.mot);
      return li;
    }));
  }
  // Chaque plat devient un bouton radio couvrant sa ligne : flèches au clavier, choix annoncé.
  let radios = [];
  function equiper() {
    liste.setAttribute('role', 'radiogroup'); liste.setAttribute('aria-label', T.groupe);
    radios = [...liste.querySelectorAll('.ame__plat')].map((li, i) => {
      const id = li.dataset.plat || plats[i]?.id; const r = document.createElement('input');
      r.type = 'radio'; r.name = uid; r.value = id; r.className = 'ame__radio';
      const nom = li.querySelector('.ame__nom'), det = li.querySelector('.ame__detail');
      if (nom) { nom.id = nom.id || `${uid}-${id}-nom`; r.setAttribute('aria-labelledby', nom.id); }
      if (det) { det.id = det.id || `${uid}-${id}-detail`; r.setAttribute('aria-describedby', det.id); }
      li.prepend(r); return r;
    });
  }

  // ---------- Verre ----------
  const svg = svgVerre(uid); verre.replaceChildren(svg);
  const $ = (sel) => svg.querySelector(sel);
  const clip = $('.ame__clip'), contour = $('.ame__contour'), coupeVerre = $('.ame__coupe'), piedVerre = $('.ame__pied'), brillance = $('.ame__brillance');
  const liquide = $('.ame__liquide'), houle = $('.ame__houle'), bulles = $('.ame__bulles');
  let forme = null, courant = null, tl = null, rempli = false;
  function poserForme(nom, anime) {
    const v = VERRES[nom]; const d = coupe(v), p = pied(v);
    if (anime && forme && forme !== nom) {
      tl.to([clip, contour, coupeVerre], { attr: { d }, duration: .62, ease: 'power2.inOut' }, .32)
        .to(piedVerre, { attr: { d: p }, duration: .62, ease: 'power2.inOut' }, .32)
        .to(brillance, { attr: { d: v.b }, duration: .62, ease: 'power2.inOut' }, .32)
        .to(piedVerre, { opacity: v.fw ? 1 : 0, duration: .3 }, v.fw ? .5 : .32);
    } else { [clip, contour, coupeVerre].forEach((e) => e.setAttribute('d', d)); piedVerre.setAttribute('d', p); piedVerre.style.opacity = v.fw ? '' : '0'; brillance.setAttribute('d', v.b); }
    forme = nom;
    // Bulles : posées au fond du liquide (le groupe suit la surface), elles montent sur toute la hauteur.
    const prof = v.vide - v.plein; bulles.style.setProperty('--prof', String(Math.max(20, prof - 8)));
    for (const c of bulles.children) c.setAttribute('cy', String(prof - 3));
  }
  function teinter(p) {
    svg.classList.toggle('est-bulles', !!p.accord.bulles); svg.classList.toggle('est-mousse', !!p.accord.mousse);
    verre.style.setProperty('--ame-vin', p.accord.couleur); verre.style.setProperty('--ame-halo', p.accord.couleur);
    fiche.style.setProperty('--ame-vin', p.accord.couleur);
  }

  // ---------- Fiche ----------
  function ecrireFiche(p) {
    const a = p.accord; const el = (tag, cls, t) => { const e = document.createElement(tag); e.className = cls; if (t != null) e.textContent = typo(t); return e; };
    const type = el('p', 'ame__fiche-type'); const g = el('span', 'ame__goutte'); g.setAttribute('aria-hidden', 'true'); type.append(g, document.createTextNode(a.typeNom));
    const lignes = [el('p', 'ame__fiche-plat', remplir(T.avec, { plat: p.plat })), type, el('h3', 'ame__fiche-nom', a.nom)];
    if (a.region) lignes.push(el('p', 'ame__fiche-region', a.region));
    if (a.mot) { lignes.push(el('p', 'ame__fiche-signature', signature)); const b = el('blockquote', 'ame__fiche-mot'); b.append(el('p', '', `« ${typo(a.mot)} »`)); lignes.push(b); }
    fiche.replaceChildren(...lignes);
    return lignes;
  }

  // ---------- Choisir un plat : vider, changer de verre, remplir par le fond ----------
  function choisir(id, { anime = true } = {}) {
    const p = plats.find((x) => x.id === String(id)); if (!p) return;
    if (p.id === courant && rempli) return;
    const avant = forme ? VERRES[forme] : null; courant = p.id;
    radios.forEach((r) => { r.checked = r.value === p.id; r.closest('.ame__plat')?.classList.toggle('est-choisi', r.checked); });
    root.dispatchEvent(new CustomEvent('ame:choix', { detail: { plat: p }, bubbles: true }));
    const v = VERRES[p.accord.verre];
    tl?.kill();
    if (calme() || !anime) {
      poserForme(p.accord.verre, false); teinter(p); ecrireFiche(p);
      gsap.set(liquide, { y: anime || calme() ? v.plein : v.vide + 14 }); gsap.set(houle, { scaleY: 1 });
      rempli = anime || calme(); return;
    }
    tl = gsap.timeline();
    const sortants = [...fiche.children];
    if (avant && rempli) tl.to(liquide, { y: avant.vide + 14, duration: .42, ease: 'power2.in' }, 0);
    if (sortants.length) tl.to(sortants, { opacity: 0, y: -6, duration: .22, stagger: .03, ease: 'power1.in' }, 0);
    poserForme(p.accord.verre, true);
    tl.call(() => {
      teinter(p); svg.classList.add('est-remplit');
      gsap.fromTo(ecrireFiche(p), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .07, ease: 'power2.out', clearProps: 'opacity,transform' });
    }, null, .44);
    tl.fromTo(liquide, { y: v.vide + 14 }, { y: v.plein, duration: o.duree, ease: 'power2.out' }, .78)
      .fromTo(houle, { scaleY: 2.8 }, { scaleY: 1, duration: o.duree + .4, ease: 'power2.out', transformOrigin: '50% 50%' }, .78)
      .call(() => svg.classList.remove('est-remplit'), null, .78 + o.duree);
    rempli = true;
  }

  // ---------- Mise en place ----------
  function monter(ps, voulu) {
    plats = ps.map(normaliser);
    construire(plats); equiper();
    const depart = plats.find((x) => x.id === String(voulu))?.id || plats[0]?.id;
    return depart;
  }
  let depart = (() => { equiper(); const v = o.choisi || liste.dataset.choisi; return plats.find((x) => x.id === String(v))?.id || plats[0]?.id; })();
  const surChange = (e) => { if (e.target.classList?.contains('ame__radio')) choisir(e.target.value); };
  liste.addEventListener('change', surChange); nettoyages.push(() => liste.removeEventListener('change', surChange));

  const charger = async () => {
    if (o.contenu) return o.contenu; if (!o.source) return null;
    try { const r = await fetch(o.source, { cache: 'no-store' }); return r.ok ? await r.json() : null; } catch { return null; }
  };
  const c = await charger();
  if (c && Array.isArray(c.plats) && c.plats.length) {
    if (c.signature) signature = c.signature;
    radios.forEach((r) => r.remove());
    depart = monter(c.plats, o.choisi || c.choisi || liste.dataset.choisi);
  }

  // Le verre attend vide (choix déjà fait, fiche en retrait), et se remplit quand il arrive à l'écran ; plein d'emblée en mode calme.
  if (calme()) choisir(depart, { anime: true });
  else {
    choisir(depart, { anime: false });
    gsap.set(fiche.children, { opacity: 0, y: 10 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      if (rempli) return; // un plat a déjà été choisi entre-temps
      const v = VERRES[forme]; rempli = true; svg.classList.add('est-remplit');
      tl = gsap.timeline()
        .fromTo(liquide, { y: v.vide + 14 }, { y: v.plein, duration: o.duree * 1.2, ease: 'power2.out' }, .1)
        .fromTo(houle, { scaleY: 2.8 }, { scaleY: 1, duration: o.duree * 1.2 + .4, ease: 'power2.out', transformOrigin: '50% 50%' }, .1)
        .to(fiche.children, { opacity: 1, y: 0, duration: .55, stagger: .08, ease: 'power2.out', clearProps: 'opacity,transform' }, .35)
        .call(() => svg.classList.remove('est-remplit'), null, .1 + o.duree * 1.2);
    }, { threshold: .45 });
    io.observe(verre); nettoyages.push(() => io.disconnect());
  }

  return {
    choisir,
    get plats() { return plats; },
    /** Remplace le contenu (même forme que le JSON) et montre le plat voulu. */
    charger(contenu, voulu) { if (!contenu?.plats?.length) return; if (contenu.signature) signature = contenu.signature; courant = null; rempli = false; choisir(monter(contenu.plats, voulu || contenu.choisi), { anime: !calme() }); },
    detruire() { tl?.kill(); nettoyages.forEach((f) => f()); verre.replaceChildren(); fiche.replaceChildren(); },
  };
}
