// Constellation : un réseau de points reliés dessiné en canvas 2D. Les nœuds principaux sont de vrais boutons ou liens
// (couche HTML au-dessus du canvas) décrits dans le HTML : data-id, data-x / data-y (en % de la scène), data-liens
// (identifiants reliés), data-centre. Des points secondaires, générés autour d'eux, se rassemblent à l'apparition,
// respirent doucement et s'écartent du pointeur. En dessous de `largeurListe`, la même liste HTML s'affiche en colonne,
// reliée par un fil vertical. Pause hors écran (socle.boucle), DPR plafonné, image fixe en mode calme.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.cst
 * @param {object} [options]
 * @param {number} [options.points=110]          points secondaires sur ordinateur
 * @param {number} [options.pointsTelephone=36]  points secondaires en mode liste (téléphone)
 * @param {number} [options.largeurListe=700]    largeur de la section sous laquelle on passe en liste
 * @param {number} [options.duree=2400]          durée de la formation, en ms
 * @param {number} [options.distance=95]         distance max des liens entre points secondaires, en px
 * @param {number} [options.rayonPointeur=140]   rayon d'influence du pointeur, en px (0 pour couper)
 * @param {number} [options.respiration=5]       amplitude de la respiration, en px
 * @param {number} [options.dprMax=2]            plafond de densité de pixels du canvas
 * @param {number} [options.graine=7]            graine du tirage des points (disposition stable d'un chargement à l'autre)
 */
export async function init(root, options = {}) {
  const o = { points: 110, pointsTelephone: 36, largeurListe: 700, duree: 2400, distance: 95, rayonPointeur: 140, respiration: 5, dprMax: 2, graine: 7, ...options };
  const s = await pret([]);
  const scene = root.querySelector('.cst__scene');
  const cv = root.querySelector('.cst__ciel');
  const ctx = cv?.getContext('2d');
  const lis = [...root.querySelectorAll('.cst__noeud')];
  if (!scene || !ctx || !lis.length) return { detruire() {} };
  const calme = s.calme;

  // ---------- Nœuds HTML ----------
  const noeuds = lis.map((li, i) => {
    const el = li.querySelector('.cst__pastille');
    const bulle = li.querySelector('.cst__bulle');
    const x = clamp(parseFloat(li.dataset.x) || 50, 0, 100), y = clamp(parseFloat(li.dataset.y) || 50, 0, 100);
    li.style.setProperty('--x', x); li.style.setProperty('--y', y);
    li.dataset.coteX = x < 30 ? 'gauche' : x > 70 ? 'droite' : 'centre';
    li.dataset.coteY = y > 58 ? 'haut' : 'bas';
    const lien = el?.tagName === 'A';
    li.classList.add(lien ? 'cst__noeud--lien' : 'cst__noeud--bouton');
    if (bulle) {
      bulle.id ||= `cst-${i}-${Math.random().toString(36).slice(2, 7)}`;
      if (lien) el.setAttribute('aria-describedby', bulle.id);
      else { el.setAttribute('aria-expanded', 'false'); el.setAttribute('aria-controls', bulle.id); }
    }
    return { li, el, bulle, lien, id: li.dataset.id || String(i), centre: li.hasAttribute('data-centre'), x: 0, y: 0, apparu: 0 };
  });
  const parId = Object.fromEntries(noeuds.map((n, i) => [n.id, i]));
  const aretes = [];
  noeuds.forEach((n, i) => {
    for (const id of (n.li.dataset.liens || '').split(/\s+/).filter(Boolean)) {
      const j = parId[id];
      if (j !== undefined && j !== i && !aretes.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) aretes.push([i, j]);
    }
  });
  root.classList.add('est-pret');
  if (!calme) root.classList.add('est-anime');

  // ---------- Ouverture des bulles ----------
  let epingle = -1, survol = -1;
  const ouvrir = () => {
    const actif = epingle >= 0 ? epingle : survol;
    noeuds.forEach((n, i) => {
      const ouvert = i === epingle || (i === survol && constellation);
      n.li.classList.toggle('est-ouvert', ouvert || (i === survol && n.lien && constellation));
      n.li.classList.toggle('est-actif', i === actif);
      if (!n.lien && n.bulle) n.el.setAttribute('aria-expanded', String(i === epingle || (constellation && i === survol)));
    });
    demander();
  };
  const ecoutes = [];
  const ecouter = (cible, type, fn, opts) => { cible.addEventListener(type, fn, opts); ecoutes.push(() => cible.removeEventListener(type, fn, opts)); };
  noeuds.forEach((n, i) => {
    if (!n.el) return;
    ecouter(n.el, 'pointerenter', e => { if (e.pointerType === 'mouse') { survol = i; ouvrir(); } });
    ecouter(n.li, 'pointerleave', e => { if (e.pointerType === 'mouse' && survol === i) { survol = -1; ouvrir(); } });
    ecouter(n.el, 'focus', () => { formerTout(); survol = i; ouvrir(); });
    ecouter(n.el, 'blur', () => { if (survol === i) { survol = -1; ouvrir(); } });
    if (!n.lien) ecouter(n.el, 'click', () => { epingle = epingle === i ? -1 : i; if (epingle === -1) survol = -1; ouvrir(); });
  });
  ecouter(document, 'keydown', e => { if (e.key === 'Escape' && (epingle >= 0 || survol >= 0)) { epingle = -1; survol = -1; ouvrir(); } });
  ecouter(document, 'pointerdown', e => { if (epingle >= 0 && constellation && !noeuds[epingle].li.contains(e.target)) { epingle = -1; ouvrir(); } });

  // ---------- Couleurs (lues dans les variables d'identité, converties en rgb) ----------
  let coul = {};
  const lireCouleurs = () => {
    const cs = getComputedStyle(root);
    const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true });
    const rgb = v => { x.clearRect(0, 0, 1, 1); x.fillStyle = '#000'; x.fillStyle = v.trim() || '#fff'; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return `${d[0]},${d[1]},${d[2]}`; };
    coul = { accent: rgb(cs.getPropertyValue('--couleur-accent')), texte: rgb(cs.getPropertyValue('--couleur-texte')), second: rgb(cs.getPropertyValue('--couleur-secondaire')) };
  };
  lireCouleurs();

  // ---------- Points secondaires ----------
  const rand = alea(o.graine);
  const MAX = Math.max(o.points, o.pointsTelephone);
  const pts = Array.from({ length: MAX }, (_, k) => ({
    parent: 0, a: rand() * Math.PI * 2, r: rand(), u: rand(), v: rand(), ph: rand() * Math.PI * 2, vit: .5 + rand(),
    taille: .8 + rand() * 1.6, teinte: rand() < .3, ordre: rand(), x: 0, y: 0, tx: 0, ty: 0, dx: 0, dy: 0, k,
  }));
  let N = 0, W = 0, H = 0, dpr = 1, constellation = false;

  const mesurer = () => {
    constellation = root.clientWidth >= o.largeurListe;
    root.classList.toggle('est-constellation', constellation);
    const r = scene.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(o.dprMax, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    for (const n of noeuds) {
      const p = (n.el?.querySelector('.cst__point') || n.el || n.li).getBoundingClientRect();
      n.x = p.left + p.width / 2 - r.left; n.y = p.top + p.height / 2 - r.top;
    }
    N = constellation ? o.points : o.pointsTelephone;
    const marge = 10;
    for (let k = 0; k < N; k++) {
      const p = pts[k];
      if (constellation) {
        // amas en spirale autour d'un nœud (plus dense autour du centre), quelques points libres dans le ciel
        if (p.u < .2) { p.tx = marge + p.v * (W - 2 * marge); p.ty = marge + p.ordre * (H - 2 * marge); p.parent = -1; }
        else {
          const cIdx = noeuds.findIndex(n => n.centre);
          p.parent = cIdx >= 0 && p.u < .38 ? cIdx : k % noeuds.length;
          const R = Math.min(W, H) * (noeuds[p.parent].centre ? .2 : .13);
          const rr = 34 + Math.sqrt(p.r) * R;
          p.tx = clamp(noeuds[p.parent].x + Math.cos(p.a) * rr * 1.25, marge, W - marge);
          p.ty = clamp(noeuds[p.parent].y + Math.sin(p.a) * rr * .85, marge, H - marge);
        }
      } else {
        // colonne étroite le long du fil, à gauche des textes
        const x0 = noeuds[0].x;
        p.parent = Math.min(noeuds.length - 1, Math.floor(p.ordre * noeuds.length));
        p.tx = clamp(x0 + (p.v - .5) * 34, 3, x0 + 20);
        p.ty = clamp(noeuds[0].y + p.ordre * (noeuds[noeuds.length - 1].y - noeuds[0].y + 30), 4, H - 4);
      }
      if (!p.init) { p.x = W / 2 + (p.u - .5) * W * 1.4; p.y = H / 2 + (p.r - .5) * H * 1.4; p.init = true; }
      if (calme || debut === 2) { p.x = p.tx; p.y = p.ty; }
    }
  };

  // ---------- Formation ----------
  let debut = 0; // 0 : pas encore vue ; nombre : instant de départ ; 2 : terminée d'office
  let forme = calme ? 1 : 0;
  const formerTout = () => { if (forme < 1) { forme = 1; debut = 2; noeuds.forEach(n => n.li.classList.add('est-visible')); for (let k = 0; k < N; k++) { pts[k].x = pts[k].tx; pts[k].y = pts[k].ty; } demander(); } };
  if (calme) noeuds.forEach(n => n.li.classList.add('est-visible'));
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !debut) { debut = performance.now(); io.disconnect(); } }, { threshold: .25 });
  if (!calme) io.observe(scene);

  // ---------- Pointeur ----------
  const ptr = { x: -9999, y: -9999, f: 0, cible: 0 };
  if (!calme && o.rayonPointeur > 0) {
    ecouter(scene, 'pointermove', e => { if (e.pointerType !== 'mouse') return; const r = scene.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.cible = 1; });
    ecouter(scene, 'pointerleave', () => { ptr.cible = 0; });
  }

  // ---------- Dessin ----------
  const rgba = (c, a) => `rgba(${c},${a.toFixed(3)})`;
  function dessiner(t) {
    if (debut && debut !== 2 && forme < 1) {
      forme = Math.min(1, (t - debut) / o.duree);
      noeuds.forEach((n, i) => { if (!n.li.classList.contains('est-visible') && forme > .08 + .5 * i / noeuds.length) n.li.classList.add('est-visible'); });
    }
    const g = 1 - Math.pow(1 - forme, 3);
    const sec = t / 1000;
    ptr.f += (ptr.cible - ptr.f) * .08;
    const amp = calme ? 0 : o.respiration;
    const R = o.rayonPointeur;
    const actif = epingle >= 0 ? epingle : survol;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    // points secondaires : vol vers la cible, respiration, écart au pointeur
    for (let k = 0; k < N; k++) {
      const p = pts[k];
      const arrive = clamp(g * 1.5 - p.ordre * .5, 0, 1);
      let tx = p.tx + Math.sin(sec * .55 * p.vit + p.ph) * amp, ty = p.ty + Math.cos(sec * .45 * p.vit + p.ph * 1.3) * amp;
      if (ptr.f > .01 && R) {
        const dx = tx - ptr.x, dy = ty - ptr.y, d = Math.hypot(dx, dy);
        if (d < R && d > .1) { const f = (1 - d / R) * 26 * ptr.f; tx += dx / d * f; ty += dy / d * f; }
      }
      const k1 = calme ? 1 : .04 + .1 * arrive;
      p.x += (tx - p.x) * k1; p.y += (ty - p.y) * k1;
      p.alpha = calme ? 1 : arrive;
    }

    // liens entre points secondaires proches (au plus 3 par point)
    const D = constellation ? o.distance : o.distance * .55, D2 = D * D;
    ctx.lineWidth = .7;
    for (let i = 0; i < N; i++) {
      const a = pts[i]; if (a.alpha < .05) continue;
      let c = 0;
      for (let j = i + 1; j < N && c < 3; j++) {
        const b = pts[j]; const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > D2) continue;
        c++;
        let al = (1 - Math.sqrt(d2) / D) * .28 * Math.min(a.alpha, b.alpha);
        if (ptr.f > .01) { const dm = Math.hypot((a.x + b.x) / 2 - ptr.x, (a.y + b.y) / 2 - ptr.y); if (dm < R) al += (1 - dm / R) * .35 * ptr.f; }
        ctx.strokeStyle = rgba(coul.texte, al);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // filaments point secondaire → nœud parent
    for (let k = 0; k < N; k++) {
      const p = pts[k]; if (p.parent < 0 || p.alpha < .05) continue;
      const n = noeuds[p.parent]; const d = Math.hypot(n.x - p.x, n.y - p.y);
      const lim = constellation ? 150 : 60; if (d > lim) continue;
      const on = p.parent === actif;
      ctx.strokeStyle = rgba(on ? coul.accent : coul.second, (1 - d / lim) * (on ? .55 : .16) * p.alpha);
      ctx.lineWidth = on ? 1 : .6;
      ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }

    // arêtes entre nœuds principaux : elles poussent depuis leur origine pendant la formation
    const fil = constellation ? aretes : noeuds.slice(1).map((_, i) => [i, i + 1]);
    fil.forEach(([i, j], m) => {
      const a = noeuds[i], b = noeuds[j];
      const prog = clamp(g * 1.8 - .25 - m / Math.max(1, fil.length) * .5, 0, 1); if (prog <= 0) return;
      const on = actif === i || actif === j;
      const respire = calme ? 0 : Math.sin(sec * 1.2 + m) * .05;
      ctx.strokeStyle = rgba(coul.accent, (on ? .85 : .32 + respire));
      ctx.lineWidth = on ? 1.6 : 1;
      const mx = (a.x + b.x) / 2 + (b.y - a.y) * .08, my = (a.y + b.y) / 2 - (b.x - a.x) * .08;
      ctx.beginPath(); ctx.moveTo(a.x, a.y);
      if (prog >= 1) ctx.quadraticCurveTo(mx, my, b.x, b.y);
      else { // demi-courbe tronquée : de Casteljau au paramètre prog
        const q1x = a.x + (mx - a.x) * prog, q1y = a.y + (my - a.y) * prog;
        const q2x = mx + (b.x - mx) * prog, q2y = my + (b.y - my) * prog;
        ctx.quadraticCurveTo(q1x, q1y, q1x + (q2x - q1x) * prog, q1y + (q2y - q1y) * prog);
      }
      ctx.stroke();
    });

    // points secondaires
    for (let k = 0; k < N; k++) {
      const p = pts[k]; if (p.alpha < .02) continue;
      const scint = calme ? .8 : .65 + .35 * Math.sin(sec * 1.7 * p.vit + p.ph);
      ctx.fillStyle = rgba(p.teinte ? coul.accent : coul.texte, p.alpha * scint * .9);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.taille, 0, 6.2832); ctx.fill();
    }

    // halos des nœuds principaux (la pastille HTML se pose dessus)
    noeuds.forEach((n, i) => {
      const al = clamp(g * 2 - i / noeuds.length, 0, 1); if (al <= 0) return;
      const rr = (n.centre ? 46 : 30) * (1 + (calme ? 0 : Math.sin(sec * 1.4 + i) * .08)) * (i === actif ? 1.35 : 1) * (constellation ? 1 : .6);
      const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr);
      gr.addColorStop(0, rgba(coul.accent, .38 * al)); gr.addColorStop(1, rgba(coul.accent, 0));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, 6.2832); ctx.fill();
    });
  }

  // ---------- Boucle : pause hors écran (socle.boucle), image unique en mode calme ----------
  let boucle = null, attente = 0;
  function demander() { if (calme) { cancelAnimationFrame(attente); attente = requestAnimationFrame(() => dessiner(0)); } }
  const ro = new ResizeObserver(() => { mesurer(); if (calme) demander(); });
  ro.observe(scene); ro.observe(root);
  mesurer();
  if (calme) demander();
  else boucle = s.boucle(scene, t => dessiner(t));
  // La position des pastilles dépend des polices : nouvelle mesure quand elles arrivent.
  document.fonts?.ready.then(() => { mesurer(); demander(); });
  ecouter(window, 'resize', () => { lireCouleurs(); });

  return {
    detruire() {
      boucle?.arreter(); io.disconnect(); ro.disconnect(); cancelAnimationFrame(attente);
      ecoutes.forEach(f => f());
      root.classList.remove('est-pret', 'est-anime', 'est-constellation');
      noeuds.forEach(n => { n.li.classList.remove('est-visible', 'est-ouvert', 'est-actif', 'cst__noeud--lien', 'cst__noeud--bouton'); n.el?.removeAttribute('aria-expanded'); });
    },
  };
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function alea(graine) {
  let s = graine >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
