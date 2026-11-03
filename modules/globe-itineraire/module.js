// Globe d'itinéraire : un globe en canvas 2D (projection orthographique, terres en points) qui tourne en suivant
// une suite d'étapes lat/lon. Au défilement, la ligne se trace sur la sphère d'étape en étape, un repère avance,
// les étapes déjà atteintes s'allument et leur texte défile à côté du globe collant.
// Ordinateur : globe collant à côté des étapes. Tablette en portrait : bandeau collant en haut, étapes dessous.
// Téléphone et écrans bas : globe dans le flux, piloté par les boutons d'étape (aucun épinglage).
// Mode calme : tracé complet, toutes les étapes allumées, vue d'ensemble immobile ; les boutons recentrent sans animation.
import { pret } from '../../socle/socle.js';
import { PAS, RANGEES } from './terres.js';

/**
 * @param {HTMLElement} root  section.gi
 * @param {object} [options]
 * @param {number} [options.lecture=.55]     ligne de lecture (fraction de la hauteur visible sous le globe) où une étape commence
 * @param {number} [options.douceur=6]       vitesse de rattrapage du globe (plus grand = plus vif)
 * @param {number} [options.inclinaison=.7]  part de la latitude du repère suivie par la caméra (0 = globe toujours droit)
 * @param {number} [options.grille=30]       pas des méridiens et parallèles en degrés (0 = sans grille)
 * @param {boolean} [options.numeros=true]   numéros des étapes dessinés à côté des points
 */
export async function init(root, options = {}) {
  const o = { lecture: .55, douceur: 6, inclinaison: .7, grille: 30, numeros: true, ...options };
  const s = await pret([]);
  const etapes = [...root.querySelectorAll('.gi__etape')];
  const scene = root.querySelector('.gi__scene');
  const boite = root.querySelector('.gi__globe');
  const toile = root.querySelector('.gi__toile');
  const nav = root.querySelector('.gi__nav');
  const ctx = toile?.getContext('2d');
  if (etapes.length < 2 || !ctx) { root.classList.add('gi--sans-toile'); return { detruire() {} }; }

  const D = Math.PI / 180;
  const pts = etapes.map(e => [+e.dataset.lat || 0, +e.dataset.lon || 0]);
  const vec = ([la, lo]) => [Math.cos(la * D) * Math.cos(lo * D), Math.cos(la * D) * Math.sin(lo * D), Math.sin(la * D)];
  const ll = v => { const n = Math.hypot(...v) || 1; return [Math.asin(v[2] / n) / D, Math.atan2(v[1], v[0]) / D]; };
  const V = pts.map(vec);
  // Grands cercles entre étapes, échantillonnés tous les ~2°.
  const segs = V.slice(1).map((b, i) => {
    const a = V[i]; const w = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    const k = Math.max(2, Math.ceil(w / D / 2)); const out = [];
    for (let j = 0; j <= k; j++) out.push(ll(slerp(a, b, w, j / k)));
    return { a, b, w, pts: out };
  });
  const surRoute = p => { const i = Math.min(segs.length - 1, Math.floor(p)); const g = segs[i]; return ll(slerp(g.a, g.b, g.w, Math.min(1, p - i))); };
  const ensemble = ll(V.reduce((m, v) => [m[0] + v[0], m[1] + v[1], m[2] + v[2]], [0, 0, 0]));

  // Terres : points précalculés (sin/cos de la latitude, longitude en radians).
  const terres = [];
  RANGEES.split('|').forEach((r, i) => {
    const lat = (-90 + PAS / 2 + i * PAS) * D; const [n, runs] = r.split(':');
    if (!runs) return;
    for (const run of runs.split(';')) { const [d, l] = run.split(',').map(Number); for (let c = d; c < d + l; c++) terres.push(Math.sin(lat), Math.cos(lat), (-180 + (c + .5) * 360 / +n) * D); }
  });

  // Boutons d'étape (44 px), construits ici pour que le HTML reste une simple liste lisible sans script.
  const boutons = etapes.map((e, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'gi__bouton';
    const titre = e.querySelector('h3')?.textContent.trim() || '';
    b.innerHTML = `<span aria-hidden="true">${i + 1}</span><span class="socle-sr">Étape ${i + 1}${titre ? ' : ' + titre : ''}</span>`;
    b.addEventListener('click', () => aller(i));
    nav?.appendChild(b); return b;
  });
  // « Vue d'ensemble » : tout le tracé, globe centré sur le parcours (hors suivi du défilement).
  const tout = document.createElement('button'); tout.type = 'button'; tout.className = 'gi__bouton gi__ensemble'; tout.textContent = "Vue d'ensemble";
  tout.addEventListener('click', () => aller(-1)); nav?.appendChild(tout);
  root.querySelectorAll('[data-gi-total]').forEach(n => { n.textContent = etapes.length; });

  // Teintes lues sur des sondes stylées par module.css (identité par variables, jamais en dur).
  const sondes = document.createElement('span'); sondes.className = 'gi__teintes'; sondes.setAttribute('aria-hidden', 'true');
  sondes.innerHTML = ['ocean', 'terre', 'grille', 'trace', 'halo', 'fond', 'texte'].map(k => `<i class="gi__t-${k}"></i>`).join('');
  boite.appendChild(sondes);
  let T = {};
  const teintes = () => { for (const i of sondes.children) T[i.className.slice(6)] = getComputedStyle(i).color; };
  teintes();

  // ---------- Taille ----------
  let W = 0, H = 0, R = 0, dpr = 1;
  const taille = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = boite.clientWidth; H = boite.clientHeight; R = Math.max(10, Math.min(W, H) / 2 - Math.max(14, Math.min(W, H) * .05));
    toile.width = Math.round(W * dpr); toile.height = Math.round(H * dpr);
    sale = true;
  };
  const ro = new ResizeObserver(() => { taille(); modeSuivi = suivi(); cible = calculer(); });
  ro.observe(boite);

  // ---------- État ----------
  const n = etapes.length;
  let modeSuivi = false;                 // vrai quand le globe colle et suit le défilement
  let choix = -1;                        // étape choisie au bouton (hors suivi) ; -1 = vue d'ensemble
  let p = 0, cam = [0, 0], cible = { p: 0, cam: [0, 0] }, sale = true, active = -2;
  const suivi = () => !s.calme && getComputedStyle(scene).position === 'sticky';
  const ligne = () => {
    const bas = modeSuivi && innerWidth < 900 ? scene.getBoundingClientRect().bottom : 0;
    return bas + (innerHeight - bas) * o.lecture;
  };
  const progression = () => {
    const y = ligne(); const tops = etapes.map(e => e.getBoundingClientRect().top);
    if (y <= tops[0]) return 0;
    for (let i = 0; i < n - 1; i++) if (y < tops[i + 1]) return i + (y - tops[i]) / (tops[i + 1] - tops[i]);
    return n - 1;
  };
  const camPour = (pp, ens) => { const c = ens ? ensemble : surRoute(pp); return [c[0] * (ens ? 1 : o.inclinaison), c[1]]; };
  function calculer() {
    if (modeSuivi) { const pp = progression(); return { p: pp, cam: camPour(pp, false) }; }
    if (choix < 0) return { p: n - 1, cam: camPour(n - 1, true) };
    return { p: choix, cam: camPour(choix, false) };
  }

  function marquer(i) {
    if (i === active) return; active = i;
    etapes.forEach((e, k) => e.classList.toggle('est-active', i < 0 || k === i));
    boutons.forEach((b, k) => { b.classList.toggle('est-active', k === i); b.classList.toggle('est-vu', i < 0 || k <= i); k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
    root.querySelectorAll('[data-gi-n]').forEach(x => { x.textContent = i < 0 ? n : i + 1; });
  }

  function aller(i) {
    if (modeSuivi && i >= 0) {
      const r = etapes[i].getBoundingClientRect(); const y = Math.max(0, scrollY + r.top - ligne() + 2);
      if (s.lenis) s.lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' });
      return;
    }
    choix = i; cible = calculer(); marquer(i);
    tout.setAttribute('aria-pressed', String(i < 0));
    if (s.calme) { p = cible.p; cam = cible.cam.slice(); sale = true; dessiner(); }
  }

  // ---------- Dessin ----------
  function dessiner() {
    sale = false;
    const [la0, lo0] = cam; const s0 = Math.sin(la0 * D), c0 = Math.cos(la0 * D), L0 = lo0 * D;
    const cx = W / 2, cy = H / 2;
    const proj = (la, lo) => {
      const sl = Math.sin(la * D), cl = Math.cos(la * D), dl = lo * D - L0, cd = Math.cos(dl);
      return [cx + R * cl * Math.sin(dl), cy - R * (c0 * sl - s0 * cl * cd), s0 * sl + c0 * cl * cd];
    };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // halo et océan
    const h = ctx.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.12);
    h.addColorStop(0, T.halo); h.addColorStop(1, 'transparent');
    ctx.globalAlpha = .35; ctx.fillStyle = h; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, 7); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = T.ocean; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    // grille
    if (o.grille > 0) {
      ctx.strokeStyle = T.grille; ctx.lineWidth = 1; ctx.beginPath();
      for (let lo = -180; lo < 180; lo += o.grille) polyligne(la => [la, lo], -90, 90);
      for (let la = -90 + o.grille; la < 90; la += o.grille) polyligne(lo => [la, lo], -180, 180);
      ctx.stroke();
    }
    function polyligne(f, a, b) { let haut = false; for (let t = a; t <= b; t += 3) { const [x, y, z] = proj(...f(t)); if (z > 0) { haut ? ctx.lineTo(x, y) : ctx.moveTo(x, y); haut = true; } else haut = false; } }
    // terres : trois paquets selon la profondeur (moins d'appels, relief suggéré vers le bord)
    const taillePt = Math.max(1.2, R * PAS * D * .55);
    ctx.fillStyle = T.terre;
    for (const [mini, alpha] of [[0, .35], [.35, .65], [.7, 1]]) {
      ctx.globalAlpha = alpha; ctx.beginPath();
      for (let k = 0; k < terres.length; k += 3) {
        const sl = terres[k], cl = terres[k + 1], dl = terres[k + 2] - L0, cd = Math.cos(dl);
        const z = s0 * sl + c0 * cl * cd; if (z <= mini || z > mini + .35 && mini < .7) continue;
        ctx.rect(cx + R * cl * Math.sin(dl) - taillePt / 2, cy - R * (c0 * sl - s0 * cl * cd) - taillePt / 2, taillePt, taillePt);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // route : fantôme complet en pointillés, puis la partie parcourue
    const trait = (jusque, style, larg, tirets) => {
      ctx.strokeStyle = style; ctx.lineWidth = larg; ctx.setLineDash(tirets); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      let haut = false;
      const point = (la, lo) => { const [x, y, z] = proj(la, lo); if (z > 0) { haut ? ctx.lineTo(x, y) : ctx.moveTo(x, y); haut = true; } else haut = false; };
      segs.forEach((g, i) => {
        if (i > jusque) return;
        const fin = i < Math.floor(jusque) ? g.pts.length - 1 : (jusque - i) * (g.pts.length - 1);
        for (let j = 0; j <= Math.floor(fin); j++) point(...g.pts[j]);
        if (fin % 1) point(...surRoute(jusque));
      });
      ctx.stroke(); ctx.setLineDash([]);
    };
    ctx.globalAlpha = .4; trait(n - 1, T.texte, 1.2, [2, 5]);
    ctx.globalAlpha = 1;
    trait(p, T.trace, Math.max(2.5, R * .012), []);
    // étapes
    ctx.font = `700 ${Math.max(12, Math.round(R * .045))}px ${getComputedStyle(root).getPropertyValue('--police-mono') || 'monospace'}`;
    ctx.textBaseline = 'middle';
    pts.forEach(([la, lo], i) => {
      const [x, y, z] = proj(la, lo); if (z <= 0) return;
      const vu = i <= p + .001;
      ctx.globalAlpha = Math.min(1, .3 + z);
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 7);
      ctx.fillStyle = vu ? T.trace : T.fond; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = vu ? T.trace : T.texte; ctx.stroke();
      if (o.numeros) { ctx.fillStyle = T.texte; ctx.fillText(String(i + 1), x + 10, y - 9); }
    });
    // repère qui avance
    const [mx, my, mz] = proj(...surRoute(p));
    if (mz > 0) {
      ctx.globalAlpha = .28; ctx.fillStyle = T.trace; ctx.beginPath(); ctx.arc(mx, my, Math.max(11, R * .045), 0, 7); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(mx, my, Math.max(5, R * .02), 0, 7); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = T.fond; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Boucle (s'arrête hors écran et onglet caché) ----------
  let epingle = false;
  const tour = (t, dt) => {
    if (modeSuivi) {
      cible = calculer();
      const sr = scene.getBoundingClientRect(), cr = scene.parentElement.getBoundingClientRect();
      const e = cr.top < sr.top - 1 && cr.bottom > sr.bottom + 1;
      if (e !== epingle) { epingle = e; root.classList.toggle('est-epingle', e); }
    }
    const k = 1 - Math.exp(-dt / 1000 * o.douceur);
    const dp = cible.p - p; let dla = cible.cam[0] - cam[0]; let dlo = ((cible.cam[1] - cam[1] + 540) % 360) - 180;
    if (Math.abs(dp) > .0005 || Math.abs(dla) > .01 || Math.abs(dlo) > .01) {
      p += dp * k; cam[0] += dla * k; cam[1] += dlo * k; sale = true;
    } else if (dp || dla || dlo) { p = cible.p; cam = cible.cam.slice(); sale = true; }
    marquer(modeSuivi ? Math.min(n - 1, Math.floor(p + .02)) : choix);
    tout.setAttribute('aria-pressed', String(!modeSuivi && choix < 0));
    if (sale) dessiner();
  };

  taille(); modeSuivi = suivi(); cible = calculer(); p = cible.p; cam = cible.cam.slice();
  marquer(modeSuivi ? 0 : choix);
  if (modeSuivi) root.classList.add('gi--vivant');
  dessiner();
  root.classList.add('gi--pret');
  if (s.calme) {
    // État final : rien ne bouge ; seuls les boutons recentrent (sans animation).
    const surTaille = () => { teintes(); dessiner(); };
    const ro2 = new ResizeObserver(surTaille); ro2.observe(boite);
    return { detruire() { ro.disconnect(); ro2.disconnect(); boutons.forEach(b => b.remove()); tout.remove(); sondes.remove(); } };
  }
  const b = s.boucle(boite, tour);
  const surMode = () => { const m = suivi(); if (m !== modeSuivi) { modeSuivi = m; root.classList.toggle('gi--vivant', m); if (!m) { root.classList.remove('est-epingle'); epingle = false; } } cible = calculer(); };
  addEventListener('resize', surMode);
  return {
    detruire() {
      b.arreter(); ro.disconnect(); removeEventListener('resize', surMode);
      boutons.forEach(x => x.remove()); tout.remove(); sondes.remove(); root.classList.remove('gi--vivant', 'gi--pret', 'est-epingle');
    },
  };
}

// Interpolation sphérique entre deux vecteurs unitaires séparés de l'angle w.
function slerp(a, b, w, t) {
  if (w < 1e-6) return a;
  const s = Math.sin(w), ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}
