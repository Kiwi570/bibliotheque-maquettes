// Écran de chargement : à l'arrivée, un calque fixé joue une courte mise en scène liée au métier (un compteur qui
// défile d'une valeur à une autre avec son unité, une onde qui s'amplifie ou des cristaux qui poussent en canvas 2D),
// puis s'ouvre sur le héros, déjà rendu dessous. Une fois par session, jamais en mode calme ni sous « réduire les
// animations », bouton « Passer » et touche Échap, durée totale bornée. Canvas 2D seul : pret([]) ne charge rien.
import { pret } from '../../socle/socle.js';

function lire(cle) { try { return sessionStorage.getItem(cle) === '1'; } catch { return false; } }
function noter(cle) { try { sessionStorage.setItem(cle, '1'); } catch {} }
const borne = (v, a, b) => Math.min(b, Math.max(a, v));
const enDouceur = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const enSortant = t => 1 - Math.pow(1 - t, 3);
const enEntrant = t => t * t * t;
const decimales = v => { const s = String(v); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };

// Hasard à graine (mulberry32) : le même motif à chaque visite pour une même graine.
function hasard(n) {
  let a = (n >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function formateur(o) {
  if (typeof o.format === 'function') return o.format;
  const dec = typeof o.format === 'number' ? o.format : Math.max(decimales(o.de), decimales(o.a));
  const nf = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec, signDisplay: o.signe ? 'exceptZero' : 'auto' });
  return v => nf.format(Math.abs(v) < Math.pow(10, -dec) / 2 ? 0 : v).replace(/-/g, '−');
}

// Couleur d'une variable CSS résolue en rgb() (le canvas ne lit ni var() ni color-mix()).
function couleur(root, expr) {
  const t = document.createElement('i');
  t.style.cssText = 'position:absolute;width:0;height:0;color:' + expr;
  root.appendChild(t);
  const c = getComputedStyle(t).color; t.remove();
  return c;
}

// Cristaux : dendrites partant des bords (d'après nelis-maquette/gel), chaque segment daté pour pousser au fil de la progression.
function cristaux(w, h, r, tel) {
  const segs = [], L = Math.min(w, h), pas = L * .025;
  const n = tel ? 12 : 22, prof = tel ? 3 : 4;
  function branche(x, y, a, len, p, alpha, t0) {
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    const t1 = t0 + len / L;
    const k = Math.max(1, Math.ceil(len / pas)); // un long trait pousse par petits morceaux
    for (let i = 0; i < k; i++) segs.push([x + (x2 - x) * i / k, y + (y2 - y) * i / k, x + (x2 - x) * (i + 1) / k, y + (y2 - y) * (i + 1) / k, Math.max(.5, p * .5), alpha, t0 + (t1 - t0) * (i + 1) / k]);
    if (p <= 0) return;
    const nb = 2 + (r() * 3 | 0);
    for (let i = 1; i <= nb; i++) {
      const t = i / (nb + 1), cote = i % 2 ? 1 : -1;
      branche(x + (x2 - x) * t, y + (y2 - y) * t, a + cote * (Math.PI / 3) * (.85 + r() * .3), len * (.28 + r() * .18) * (1 - t * .5), p - 1, alpha * .78, t0 + (t1 - t0) * t);
    }
    branche(x2, y2, a + (r() - .5) * .35, len * .55, p - 1, alpha * .86, t1);
  }
  for (let i = 0; i < n; i++) {
    const e = i % 4; let x, y, a;
    if (e === 0) { x = r() * w; y = 0; a = Math.PI / 2; }
    else if (e === 1) { x = w; y = r() * h; a = Math.PI; }
    else if (e === 2) { x = r() * w; y = h; a = -Math.PI / 2; }
    else { x = 0; y = r() * h; a = 0; }
    branche(x, y, a + (r() - .5) * 1.1, L * (.16 + r() * .16), prof, .7, r() * .25);
  }
  const fin = Math.max(...segs.map(s => s[6]));
  for (const s of segs) s[6] /= fin;
  segs.sort((a, b) => a[6] - b[6]);
  const points = Array.from({ length: tel ? 40 : 80 }, () => [r() * w, r() * h, (r() * 1.6 + .4), r() * .8, r()]);
  return { segs, points };
}

/**
 * @param {HTMLElement} root  div.edc (fixée, premier enfant du body)
 * @param {object} [options]
 * @param {number} [options.de=0]        valeur de départ du compteur
 * @param {number} [options.a=100]       valeur d'arrivée
 * @param {string} [options.unite='%']   unité affichée après la valeur ('' pour aucune)
 * @param {number|Function} [options.format]  nombre de décimales (par défaut celles de `de` et `a`) ou fonction v => texte
 * @param {boolean} [options.signe=false]  affiche « + » devant les valeurs positives (températures)
 * @param {'onde'|'cristaux'|'aucun'} [options.motif='onde']  ce qui accompagne le compteur en canvas 2D
 * @param {number} [options.duree=2.2]   durée totale, sortie comprise (s), bornée entre 1,2 et 4
 * @param {'ouverture'|'haut'|'fondu'} [options.sortie='ouverture']  trou circulaire qui s'ouvre, retrait vers le haut ou fondu
 * @param {string|null} [options.legende=null]  texte au-dessus du compteur (sinon celui du HTML)
 * @param {string|null} [options.fin=null]      texte qui remplace la valeur à l'arrivée (« Prêt », « En ondes »)
 * @param {number} [options.graine=7]    graine du motif cristaux
 * @param {boolean} [options.unique=true]  une fois par session (false : à chaque chargement)
 * @param {string} [options.cle='ecran-de-chargement-vu']  clé sessionStorage (à recopier dans le script du <head>)
 * @param {Function} [options.apres]     appelé quand le héros commence à être découvert (aussi l'évènement 'chargement:fini')
 */
export async function init(root, options = {}) {
  let o = { de: 0, a: 100, unite: '%', format: null, signe: false, motif: 'onde', duree: 2.2, sortie: 'ouverture', legende: null, fin: null, graine: 7, unique: true, cle: 'ecran-de-chargement-vu', apres: null, ...options };
  const html = document.documentElement;
  const vide = { rejouer() {}, passer() {}, detruire() {} };
  if (!root) return vide;
  const deja = lire(o.cle);
  const s = await pret([]);
  const canvas = root.querySelector('.edc__motif');
  const ctx = canvas?.getContext('2d') || null;
  const coeur = root.querySelector('.edc__coeur');
  const valeur = root.querySelector('.edc__valeur');
  const unite = root.querySelector('.edc__unite');
  const legende = root.querySelector('.edc__legende');
  const jauge = root.querySelector('.edc__jauge');
  const bornes = root.querySelectorAll('.edc__borne');
  const bouton = root.querySelector('.edc__passer');
  let id = 0, secours = 0, t0 = 0, sortieDuree = .6, annonce = false, enCours = false, dernier = -1;
  let fmt, w = 0, h = 0, dpr = 1, motif = null, dessine = 0, couleurs = null, ondeY = 0;
  const legendeHtml = legende?.textContent || '';

  function phases() {
    const total = borne(+o.duree || 2.2, 1.2, 4);
    const sortie = Math.min(.7, total * .3), tenue = Math.min(.25, total * .1), delai = .1;
    return { delai, compte: total - sortie - tenue - delai, tenue, sortie };
  }

  function preparer() {
    fmt = formateur(o);
    root.dataset.motif = o.motif; root.dataset.sortie = o.sortie;
    if (legende) legende.textContent = o.legende ?? legendeHtml;
    if (unite) { unite.textContent = o.unite || ''; unite.hidden = !o.unite; }
    if (bornes[0]) bornes[0].textContent = fmt(o.de);
    if (bornes[1]) bornes[1].textContent = fmt(o.a);
    // Largeur réservée à la valeur (en ch, chiffres tabulaires) : le texte change sans déplacer le reste.
    const essais = [o.de, o.a, (o.de + o.a) / 2, o.de + (o.a - o.de) * .1].map(v => fmt(v));
    if (o.fin) essais.push(String(o.fin));
    root.style.setProperty('--edc-car', Math.max(...essais.map(t => t.length)));
    dernier = -1;
    mesurer();
  }

  function mesurer() {
    if (!ctx) return;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    couleurs = { accent: couleur(root, 'var(--couleur-accent)'), texte: couleur(root, 'var(--couleur-texte)'), secondaire: couleur(root, 'var(--couleur-secondaire)') };
    // L'onde passe au-dessus de la légende, sans jamais la toucher (amplitude maximale ≈ 1,16 × haut).
    const r = (legende || valeur)?.getBoundingClientRect();
    ondeY = r && r.height ? Math.max(Math.min(56, h * .07) * 1.2 + 8, r.top - Math.min(56, h * .07) * 1.2 - 22) : h * .35;
    motif = o.motif === 'cristaux' ? cristaux(w, h, hasard(o.graine), s.telephone) : null;
    dessine = 0;
  }

  function dessinerOnde(p, t) {
    ctx.clearRect(0, 0, w, h);
    const amp = enSortant(p), haut = Math.min(56, h * .07);
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const q = x / w, env = Math.sin(q * Math.PI);
        const y = ondeY + Math.sin(q * 14 - t * 5 + k) * amp * env * (1 - k * .3) * haut + Math.sin(q * 37 + t * 3) * amp * env * haut * .16;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.globalAlpha = k ? .5 - k * .15 : 1;
      ctx.strokeStyle = k ? couleurs.texte : couleurs.accent;
      ctx.lineWidth = k ? 1 : 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function dessinerCristaux(p) {
    // Dessin incrémental : seuls les segments nés depuis l'image précédente sont tracés.
    const { segs, points } = motif;
    ctx.lineCap = 'round'; ctx.strokeStyle = couleurs.texte;
    while (dessine < segs.length && segs[dessine][6] <= p) {
      const [x1, y1, x2, y2, lw, al] = segs[dessine++];
      ctx.globalAlpha = al; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.fillStyle = couleurs.accent;
    for (const pt of points) if (pt[4] <= p && pt[4] > p - .05) { ctx.globalAlpha = pt[3]; ctx.fillRect(pt[0], pt[1], pt[2], pt[2]); }
    ctx.globalAlpha = 1;
  }

  function afficher(p) {
    const v = o.de + (o.a - o.de) * p;
    const texte = p >= 1 && o.fin ? String(o.fin) : fmt(v);
    if (texte !== dernier && valeur) { valeur.textContent = texte; dernier = texte; if (unite && o.unite) unite.hidden = p >= 1 && !!o.fin; }
    jauge?.style.setProperty('--edc-p', p.toFixed(4));
  }

  function appliquerSortie(k) {
    if (coeur) coeur.style.opacity = String(1 - borne(k * 2.5, 0, 1));
    const e = enEntrant(k);
    if (o.sortie === 'haut') root.style.clipPath = `inset(0 0 ${(e * 100).toFixed(2)}% 0)`;
    else if (o.sortie === 'fondu') root.style.opacity = String(1 - k);
    else root.style.setProperty('--edc-trou', (-14 + enSortant(k) * 130).toFixed(2) + '%');
  }

  function signaler() {
    if (annonce) return; annonce = true;
    o.apres?.();
    root.dispatchEvent(new CustomEvent('chargement:fini', { bubbles: true }));
  }

  function finir() {
    cancelAnimationFrame(id); clearTimeout(secours); id = 0; enCours = false;
    root.classList.add('est-fini'); root.classList.remove('est-pilote');
    html.classList.remove('edc-joue');
    root.style.removeProperty('clip-path'); root.style.removeProperty('opacity'); root.style.removeProperty('--edc-trou');
    if (coeur) coeur.style.removeProperty('opacity');
    if (document.activeElement === bouton) bouton.blur();
    removeEventListener('keydown', clavier);
    removeEventListener('resize', mesurer);
    signaler();
  }

  function tour(maintenant) {
    const ph = phases();
    const t = (maintenant - t0) / 1000;
    const pc = borne((t - ph.delai) / ph.compte, 0, 1);
    const p = enDouceur(pc);
    afficher(p);
    if (ctx && o.motif === 'onde') dessinerOnde(p, t);
    else if (ctx && motif) dessinerCristaux(p);
    const k = (t - ph.delai - ph.compte - ph.tenue) / sortieDuree;
    if (k >= 0) { signaler(); appliquerSortie(borne(k, 0, 1)); }
    if (k >= 1) { finir(); return; }
    id = requestAnimationFrame(tour);
  }

  function jouer() {
    cancelAnimationFrame(id); clearTimeout(secours);
    annonce = false; enCours = true;
    html.classList.add('edc-joue');
    root.classList.remove('est-fini'); root.classList.add('est-pilote');
    root.style.removeProperty('clip-path'); root.style.removeProperty('opacity'); root.style.removeProperty('--edc-trou');
    if (coeur) coeur.style.removeProperty('opacity');
    preparer();
    ctx?.clearRect(0, 0, w, h);
    const ph = phases(); sortieDuree = ph.sortie;
    addEventListener('keydown', clavier);
    addEventListener('resize', mesurer);
    t0 = performance.now();
    id = requestAnimationFrame(tour);
    // Filet : onglet caché (rAF suspendu) ou script ralenti, l'écran ne reste jamais plus d'une seconde de trop.
    secours = setTimeout(finir, (ph.delai + ph.compte + ph.tenue + ph.sortie + 1) * 1000);
  }

  /** Va directement à la fin : le compteur atteint sa valeur et l'écran se retire en accéléré. */
  function passer() {
    if (!enCours) return;
    const ph = phases();
    const t = (performance.now() - t0) / 1000, debutSortie = ph.delai + ph.compte + ph.tenue;
    if (t >= debutSortie) return;
    sortieDuree = Math.min(.35, ph.sortie);
    t0 = performance.now() - debutSortie * 1000;
  }
  function clavier(e) { if (e.key === 'Escape') passer(); }
  function retour(e) { if (e.persisted && enCours) finir(); }

  bouton?.addEventListener('click', passer);
  addEventListener('pageshow', retour);

  const sauter = s.calme || (deja && o.unique !== false);
  noter(o.cle);
  if (sauter) finir(); else jouer();

  return {
    /** Rejoue l'écran (démonstration), avec d'éventuelles nouvelles options. */
    rejouer(nouvelles = {}) { o = { ...o, ...nouvelles }; if (!s.calme) jouer(); },
    passer,
    detruire() {
      cancelAnimationFrame(id); clearTimeout(secours); enCours = false;
      bouton?.removeEventListener('click', passer);
      removeEventListener('keydown', clavier); removeEventListener('resize', mesurer); removeEventListener('pageshow', retour);
      root.classList.add('est-fini'); html.classList.remove('edc-joue');
    },
  };
}
