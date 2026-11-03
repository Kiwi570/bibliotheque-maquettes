// Objet à l'échelle : un objet (œuvre, meuble, luminaire, pièce) posé à sa vraie taille relative dans un décor,
// à côté d'une silhouette humaine de référence, avec une règle graduée et des cotes. Le visiteur choisit l'objet,
// sa taille (variantes ou largeur libre), sa pose (mur, sol, console) et le décor ; tout se redimensionne
// avec un seul facteur centimètres → pixels, recalculé à chaque changement de taille de la scène.
import { pret } from '../../socle/socle.js';

const NS = 'http://www.w3.org/2000/svg';
const SILHOUETTE = '<svg viewBox="0 0 60 170" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M30 2c6 0 10 5 10 11s-4 12-10 12-10-6-10-12S24 2 30 2zm-12 27h24c7 0 11 5 12 12l4 40c.4 4-2 6-5 6s-5-2-5.5-5L44 50l-1 38 3 78c0 2.5-2 4-4.5 4s-4.5-1.5-5-4L32 100h-4l-4.5 66c-.5 2.5-2.5 4-5 4S14 168.5 14 166l3-78-1-38-3.5 32c-.5 3-2.5 5-5.5 5s-5.4-2-5-6l4-40c1-7 5-12 12-12z"/></svg>';
// Meubles de référence dessinés en centimètres (le viewBox est la taille réelle : jamais déformés).
const MEUBLES = {
  canape: { l: 200, h: 85, nom: 'canapé de 200 cm', svg: '<rect x="6" y="40" width="188" height="35" rx="5"/><rect x="12" y="8" width="176" height="40" rx="8" class="oae-clair"/><rect x="0" y="30" width="18" height="45" rx="6"/><rect x="182" y="30" width="18" height="45" rx="6"/><rect x="20" y="38" width="78" height="9" rx="4" class="oae-clair"/><rect x="102" y="38" width="78" height="9" rx="4" class="oae-clair"/><rect x="14" y="75" width="4" height="10"/><rect x="182" y="75" width="4" height="10"/>' },
  bureau: { l: 120, h: 75, nom: 'bureau de 120 cm', svg: '<rect x="0" y="0" width="120" height="4"/><rect x="5" y="4" width="3" height="71"/><rect x="112" y="4" width="3" height="71"/><rect x="70" y="4" width="42" height="22" class="oae-clair"/><rect x="8" y="10" width="62" height="1.5"/>' },
};
const DECORS = [
  { id: 'mur', nom: 'Mur nu' },
  { id: 'salon', nom: 'Salon', meuble: 'canape' },
  { id: 'bureau', nom: 'Bureau', meuble: 'bureau' },
];
const POSES = { mur: 'Au mur', sol: 'Au sol', console: 'Sur une console' };

const nb = n => String(Math.round(n * 10) / 10).replace('.', ',');
const metres = cm => (cm / 100).toFixed(2).replace('.', ',') + ' m';
const echapper = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Lit les objets décrits dans le HTML : <template data-objet data-nom data-pose data-variantes data-libre>visuel</template> */
function lireObjets(root) {
  return [...root.querySelectorAll('template[data-objet]')].map((t, i) => {
    const d = t.dataset;
    const variantes = (d.variantes || '').split('|').map(v => v.trim()).filter(Boolean).map(v => {
      const [nom, dims] = v.includes(':') ? v.split(':') : ['', v];
      const [l, h, p] = dims.split(/[x×]/).map(Number);
      return { nom: nom.trim(), l, h, p: p || null };
    });
    if (!variantes.length && d.l && d.h) variantes.push({ nom: '', l: +d.l, h: +d.h, p: d.p ? +d.p : null });
    return {
      id: d.objet || 'objet-' + i, nom: d.nom || 'Objet', note: d.note || '',
      poses: (d.pose || 'mur').split(/\s+/).filter(p => POSES[p]),
      variantes, choisie: +(d.choisie || 0),
      libre: d.libre ? d.libre.split('-').map(Number) : null, pas: +(d.pas || 5),
      visuel: t.innerHTML,
    };
  });
}

/**
 * @param {HTMLElement} root  section.oae (contient .oae__scene [data-scene], .oae__commandes [data-commandes] et les <template data-objet>)
 * @param {object} [options]
 * @param {Array}  [options.objets]          objets { nom, poses:['mur'], variantes:[{nom,l,h,p}], choisie, libre:[min,max], pas, visuel, note } ; sinon lus dans les <template data-objet>
 * @param {Array}  [options.decors]          décors proposés, défaut [{id:'mur',nom:'Mur nu'},{id:'salon',nom:'Salon',meuble:'canape'},{id:'bureau',nom:'Bureau',meuble:'bureau'}]
 * @param {number} [options.reference=170]   hauteur de la silhouette en cm
 * @param {number} [options.centreMur=150]   hauteur du centre d'un objet mural, en cm depuis le sol
 * @param {number} [options.hauteurConsole=80] hauteur de la console, en cm
 * @param {boolean}[options.regle=true]      règle graduée au sol
 * @param {number} [options.duree=.6]        durée des redimensionnements en s (0 pour couper)
 */
export async function init(root, options = {}) {
  const o = { decors: DECORS, reference: 170, centreMur: 150, hauteurConsole: 80, regle: true, duree: .6, ...options };
  const objets = (o.objets || lireObjets(root)).filter(x => x.variantes?.length).map(x => ({ poses: ['mur'], choisie: 0, pas: 5, note: '', ...x }));
  const scene = root.querySelector('[data-scene]');
  const commandes = root.querySelector('[data-commandes]');
  if (!scene || !commandes || !objets.length) return { detruire() {} };
  const s = await pret([]);
  const { gsap } = s;
  const uid = 'oae-' + Math.random().toString(36).slice(2, 7);

  // ---------- Scène ----------
  scene.querySelector('.oae__repli')?.remove();
  scene.insertAdjacentHTML('beforeend',
    '<div class="oae__mur" aria-hidden="true"></div><div class="oae__sol" aria-hidden="true"></div>' +
    (o.regle ? '<svg class="oae__regle" aria-hidden="true" focusable="false"></svg>' : '') +
    '<div class="oae__el oae__silhouette" aria-hidden="true">' + SILHOUETTE + '</div>' +
    '<div class="oae__el oae__meuble" aria-hidden="true"></div>' +
    '<div class="oae__el oae__console" aria-hidden="true"></div>' +
    '<div class="oae__el oae__objet" aria-hidden="true"></div>' +
    '<div class="oae__el oae__cote oae__cote--h" aria-hidden="true"><i></i><span></span></div>' +
    '<div class="oae__el oae__cote oae__cote--l" aria-hidden="true"><i></i><span></span></div>' +
    '<div class="oae__el oae__cote oae__cote--ref" aria-hidden="true"><span></span></div>');
  scene.setAttribute('role', 'img');
  const $ = sel => scene.querySelector(sel);
  const el = { sil: $('.oae__silhouette'), meuble: $('.oae__meuble'), cons: $('.oae__console'), objet: $('.oae__objet'), coteH: $('.oae__cote--h'), coteL: $('.oae__cote--l'), coteR: $('.oae__cote--ref'), regle: $('.oae__regle') };
  el.coteR.querySelector('span').textContent = metres(o.reference);

  // ---------- Commandes ----------
  const groupe = (cle, legende) => '<fieldset class="oae__groupe" data-groupe="' + cle + '"><legend>' + legende + '</legend><div class="oae__puces"></div></fieldset>';
  commandes.innerHTML =
    (objets.length > 1 ? groupe('objet', 'Objet') : '') + groupe('taille', 'Taille') +
    '<div class="oae__libre" hidden><label for="' + uid + '-l">Largeur <output for="' + uid + '-l"></output></label><input type="range" id="' + uid + '-l"></div>' +
    groupe('pose', 'Pose') + (o.decors.length > 1 ? groupe('decor', 'Décor') : '') +
    '<p class="oae__cartel" aria-live="polite"></p>' +
    '<p class="oae__mention">Échelle indicative, à côté d\'une silhouette de ' + metres(o.reference) + '.</p>';
  const puces = cle => commandes.querySelector('[data-groupe="' + cle + '"] .oae__puces');
  const remplir = (cle, items) => { const p = puces(cle); if (p) p.innerHTML = items.map(([v, t]) => '<button type="button" data-v="' + echapper(v) + '" aria-pressed="false">' + t + '</button>').join(''); };
  const libre = commandes.querySelector('.oae__libre'), curseur = libre.querySelector('input'), sortie = libre.querySelector('output');
  const cartel = commandes.querySelector('.oae__cartel');

  const etat = { objet: null, v: 0, l: 0, h: 0, pose: 'mur', decor: o.decors[0] };
  const dimsTexte = (l, h, p) => nb(l) + ' × ' + nb(h) + (p ? ' × ' + nb(p) : '') + ' cm';

  function choisirObjet(x) {
    etat.objet = x; etat.v = Math.min(x.choisie, x.variantes.length - 1);
    if (!x.poses.includes(etat.pose)) etat.pose = x.poses[0];
    remplir('taille', x.variantes.map((v, i) => [i, (v.nom ? v.nom + ' · ' : '') + dimsTexte(v.l, v.h)]));
    puces('taille').closest('fieldset').hidden = x.variantes.length < 2;
    remplir('pose', x.poses.map(p => [p, POSES[p]]));
    puces('pose').closest('fieldset').hidden = x.poses.length < 2;
    libre.hidden = !x.libre;
    if (x.libre) Object.assign(curseur, { min: x.libre[0], max: x.libre[1], step: x.pas });
    choisirVariante(etat.v);
    el.objet.innerHTML = x.visuel;
  }
  function choisirVariante(i) {
    const v = etat.objet.variantes[i]; etat.v = i; etat.l = v.l; etat.h = v.h;
    if (etat.objet.libre) curseur.value = v.l;
  }

  // ---------- Placement ----------
  const fixer = (cible, props, anime) => { if (anime && o.duree && !s.calme) gsap.to(cible, { ...props, duration: o.duree, ease: 'power3.out', overwrite: 'auto' }); else gsap.set(cible, props); };

  function placer(anime) {
    const W = scene.clientWidth, H = scene.clientHeight;
    if (!W || !H) return;
    const { l, h, pose } = etat, x = etat.objet;
    const m = etat.decor.meuble ? MEUBLES[etat.decor.meuble] : null;
    const consL = Math.max(100, l + 30);
    let bas = 0;
    if (pose === 'console') bas = o.hauteurConsole;
    if (pose === 'mur') bas = Math.max(o.centreMur - h / 2, m ? m.h + 20 : 30);
    const sommet = bas + h;
    let solPx = Math.round(Math.max(30, H * .1));
    const hautPx = 34, droitePx = 76, gauchePx = 10;
    const spanH = Math.max(o.reference + 12, sommet + 8);
    const zoneObj = pose === 'console' ? consL : l;
    // Deux passes : l'écart entre l'objet et un meuble posé à sa droite doit laisser la place de la cote.
    let k = 1, zone = 0, xObj = 0, xCons = 0, xMeuble = 0;
    for (let passe = 0; passe < 2; passe++) {
      if (m && pose === 'mur') { zone = Math.max(l, m.l); xObj = (zone - l) / 2; xMeuble = (zone - m.l) / 2; }
      else if (m) { const ecart = Math.max(40, (droitePx + 6) / k); zone = zoneObj + ecart + m.l; xCons = 0; xObj = pose === 'console' ? (consL - l) / 2 : 0; xMeuble = zoneObj + ecart; }
      else { zone = zoneObj; xCons = 0; xObj = (zone - l) / 2; }
      const largeur = 60 + 45 + zone;
      k = Math.min((H - solPx - hautPx) / spanH, (W - gauchePx - droitePx) / largeur);
    }
    // Scène plus haute que nécessaire (téléphone, meuble large) : le sol monte, le vide ne reste pas au-dessus.
    const vide = H - solPx - hautPx - spanH * k;
    if (vide > 0) solPx += Math.round(Math.min(vide * .6, Math.max(0, H * .3 - solPx)));
    const largeurPx = (60 + 45 + zone) * k + (m && pose !== 'mur' ? 0 : droitePx);
    const x0 = Math.max(gauchePx, (W - largeurPx) / 2);
    const X = cm => x0 + cm * k, B = cm => solPx + cm * k;
    const zx = 60 + 45;
    scene.style.setProperty('--oae-k', k.toFixed(3));
    scene.style.setProperty('--oae-sol', solPx + 'px');
    scene.dataset.decor = etat.decor.id;

    fixer(el.sil, { left: X(0), bottom: B(0), width: 60 * k, height: o.reference * k }, anime);
    fixer(el.coteR, { left: X(30) - 40, bottom: B(o.reference) + 4, width: 80 }, anime);
    if (m) {
      if (el.meuble.dataset.m !== etat.decor.meuble) { el.meuble.innerHTML = '<svg viewBox="0 0 ' + m.l + ' ' + m.h + '" preserveAspectRatio="none" focusable="false">' + m.svg + '</svg>'; el.meuble.dataset.m = etat.decor.meuble; }
      fixer(el.meuble, { left: X(zx + xMeuble), bottom: B(0), width: m.l * k, height: m.h * k, autoAlpha: 1 }, anime);
    } else fixer(el.meuble, { autoAlpha: 0 }, anime);
    if (pose === 'console') {
      const hc = o.hauteurConsole;
      el.cons.innerHTML = '<svg viewBox="0 0 ' + consL + ' ' + hc + '" preserveAspectRatio="none" focusable="false"><rect x="0" y="0" width="' + consL + '" height="4"/><rect x="4" y="4" width="3" height="' + (hc - 4) + '"/><rect x="' + (consL - 7) + '" y="4" width="3" height="' + (hc - 4) + '"/><rect x="4" y="14" width="' + (consL - 8) + '" height="1.5"/></svg>';
      fixer(el.cons, { left: X(zx + xCons), bottom: B(0), width: consL * k, height: hc * k, autoAlpha: 1 }, anime);
    } else fixer(el.cons, { autoAlpha: 0 }, anime);
    const ox = X(zx + xObj), ob = B(bas), ow = l * k, oh = h * k;
    fixer(el.objet, { left: ox, bottom: ob, width: ow, height: oh }, anime);
    fixer(el.coteH, { left: ox + ow + 10, bottom: ob, height: oh }, anime);
    fixer(el.coteL, { left: ox, bottom: ob + oh + 6, width: ow }, anime);
    el.coteH.querySelector('span').textContent = 'H ' + nb(h) + ' cm';
    el.coteL.querySelector('span').textContent = nb(l) + ' cm';
    if (el.regle) regle(W, solPx, x0, k);

    // Textes : le cartel annonce les dimensions, la scène porte une description complète.
    const v = x.variantes[etat.v];
    const p = !x.libre || +curseur.value === v.l ? v.p : null;
    const ou = pose === 'mur' ? 'au mur, centré à ' + nb(bas + h / 2) + ' cm du sol' : pose === 'console' ? 'sur une console de ' + o.hauteurConsole + ' cm' : 'au sol';
    const decorTexte = m ? ', près d\'un ' + m.nom : '';
    cartel.innerHTML = '<strong>' + echapper(x.nom) + '</strong><span>' + (v.nom && (!x.libre || +curseur.value === v.l) ? echapper(v.nom) + ' · ' : '') + dimsTexte(l, h, p) + '</span>' + (x.note ? '<span>' + echapper(x.note) + '</span>' : '');
    scene.setAttribute('aria-label', x.nom + ', ' + dimsTexte(l, h, p) + ', ' + ou + decorTexte + ', à côté d\'une silhouette de ' + metres(o.reference) + ' (échelle indicative).');
    if (x.libre) sortie.textContent = nb(l) + ' cm';
    for (const [cle, val] of [['objet', x.id], ['taille', String(etat.v)], ['pose', pose], ['decor', etat.decor.id]]) {
      const pc = puces(cle); if (!pc) continue;
      for (const b of pc.children) b.setAttribute('aria-pressed', String(b.dataset.v === val && !(cle === 'taille' && x.libre && +curseur.value !== x.variantes[etat.v].l)));
    }
  }

  function regle(W, solPx, x0, k) {
    const svg = el.regle; const hR = Math.min(solPx - 4, 26);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + hR);
    svg.style.height = hR + 'px';
    const pas = 50 * k >= 18 ? 50 : 100, label = 100 * k >= 34 ? 100 : 200;
    let h = '<line x1="0" y1="1" x2="' + W + '" y2="1" class="oae-trait-doux"/>';
    for (let c = 0; x0 + c * k <= W; c += pas) {
      const x = (x0 + c * k).toFixed(1), fort = c % 100 === 0;
      h += '<line x1="' + x + '" y1="1" x2="' + x + '" y2="' + (fort ? 8 : 5) + '"/>';
      if (c % label === 0 && hR >= 22) h += '<text x="' + (+x + 3) + '" y="' + (hR - 3) + '">' + (c ? nb(c / 100) + ' m' : '0') + '</text>';
    }
    svg.innerHTML = h;
  }

  // ---------- Écouteurs ----------
  const reveler = () => { if (!s.calme && o.duree) gsap.fromTo(el.objet, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: o.duree, ease: 'power3.out' }); };
  commandes.addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    const cle = b.closest('[data-groupe]').dataset.groupe, v = b.dataset.v;
    if (cle === 'objet') { const x = objets.find(y => y.id === v); if (!x || x === etat.objet) return; choisirObjet(x); placer(false); reveler(); return; }
    if (cle === 'taille') choisirVariante(+v);
    if (cle === 'pose') etat.pose = v;
    if (cle === 'decor') etat.decor = o.decors.find(d => d.id === v) || etat.decor;
    placer(true);
  });
  curseur.addEventListener('input', () => {
    const v = etat.objet.variantes[etat.v];
    etat.l = +curseur.value; etat.h = Math.round(etat.l * v.h / v.l * 10) / 10;
    placer(false);
  });

  if (objets.length > 1) remplir('objet', objets.map(x => [x.id, echapper(x.nom)]));
  if (o.decors.length > 1) remplir('decor', o.decors.map(d => [d.id, echapper(d.nom)]));
  choisirObjet(objets[0]);
  placer(false);

  let attente = 0;
  const ro = new ResizeObserver(() => { cancelAnimationFrame(attente); attente = requestAnimationFrame(() => placer(false)); });
  ro.observe(scene);
  // Arrivée : l'objet se pose une fois, quand la scène entre dans l'écran.
  let io = null;
  if (!s.calme && o.duree) {
    gsap.set(el.objet, { autoAlpha: 0, y: -40 });
    io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); gsap.to(el.objet, { autoAlpha: 1, y: 0, duration: o.duree * 1.6, ease: 'power3.out', delay: .15 }); }, { threshold: .35 });
    io.observe(scene);
  }
  return { detruire() { ro.disconnect(); io?.disconnect(); cancelAnimationFrame(attente); gsap.killTweensOf(Object.values(el)); } };
}
