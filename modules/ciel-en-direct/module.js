// Ciel en direct : un ciel (et une mer) dont les couleurs, la lumière, le soleil, la lune et les étoiles suivent
// l'heure réelle du lieu (fuseau Intl en option), ou une heure choisie au curseur. Dégradé CSS (variables) + canvas 2D
// (étoiles, soleil, lune avec sa phase, reflets sur la mer). Le texte posé dessus bascule clair/sombre et reçoit un
// voile dont l'opacité est calculée pour garder un contraste AA (4,5:1) contre la couleur la plus défavorable du ciel.
// Mode calme et « réduire les animations » : image fixe redessinée seulement quand l'heure change.
import { pret } from '../../socle/socle.js';

const RAD = Math.PI / 180;
// Altitude du soleil (°) → haut du ciel, lueur d'horizon, mer proche de l'horizon, mer au premier plan, soleil.
// Couleurs « physiques » neutres (aucune identité) ; remplaçables par l'option palette.
const PALETTE = [
  [-18, '#070a14', '#161d36', '#0b1224', '#04070f', '#a9b6cc'],
  [-10, '#0d1531', '#2f3768', '#111b35', '#060b18', '#d8826c'],
  [-4, '#1b2549', '#9c5a6c', '#1d2848', '#0a1021', '#f29c7a'],
  [0, '#2b406f', '#e18b60', '#263d64', '#0d1a31', '#ffbb8c'],
  [6, '#3b6094', '#efba8c', '#2d5179', '#102441', '#ffdcb2'],
  [15, '#4b81b7', '#cfe2ec', '#346b96', '#133450', '#fff3df'],
  [45, '#3f79b1', '#dcebf3', '#306994', '#123350', '#ffffff'],
];
const LUNE = [0.93, 0.94, 0.9];
const LIBELLES = { aube: 'Aube', jour: 'Jour', crepuscule: 'Crépuscule', nuit: 'Nuit' };

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const mix = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const rgb = c => `rgb(${c.map(v => Math.round(v * 255)).join(' ')})`;
const hhmm = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const lireHeure = s => { const r = /^(\d{1,2})[:h](\d{2})$/.exec(String(s || '').trim()); return r && +r[1] < 24 && +r[2] < 60 ? +r[1] * 60 + +r[2] : null; };

// ---------- Contraste (WCAG) ----------
const lin = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// ---------- Soleil (méthode SunCalc / NOAA, suffisante pour un décor) ----------
function jours(date) { return date.valueOf() / 864e5 - 0.5 + 2440588 - 2451545; }
function hauteurSoleil(date, lat, lon) {
  const d = jours(date);
  const M = RAD * (357.5291 + 0.98560028 * d);
  const L = M + RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + RAD * 102.9372 + Math.PI;
  const e = RAD * 23.4397;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));
  const H = RAD * (280.16 + 360.9856235 * d) + lon * RAD - ra, phi = lat * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / RAD;
}
function leverCoucher(date, lat, lon) {
  const lw = -lon * RAD, phi = lat * RAD, J0 = 0.0009;
  const n = Math.round(jours(date) - J0 - lw / (2 * Math.PI));
  const ds = J0 + lw / (2 * Math.PI) + n;
  const M = RAD * (357.5291 + 0.98560028 * ds);
  const L = M + RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + RAD * 102.9372 + Math.PI;
  const dec = Math.asin(Math.sin(RAD * 23.4397) * Math.sin(L));
  const midi = 2451545 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const w = Math.acos((Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
  if (isNaN(w)) return null; // jour ou nuit polaire
  const coucher = 2451545 + (J0 + (w + lw) / (2 * Math.PI) + n) + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const enDate = j => new Date((j + 0.5 - 2440588) * 864e5);
  return { lever: enDate(midi - (coucher - midi)), coucher: enDate(coucher) };
}
// Phase de la lune : 0 nouvelle, 0,5 pleine (la même partout sur Terre).
const phaseLune = date => ((((date - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588) + 29.530588) % 29.530588 / 29.530588;

/**
 * @param {HTMLElement} root  section.ced
 * @param {object} [options]
 * @param {string|null} [options.timeZone=null]  fuseau IANA du lieu ('Europe/Paris') ; null = fuseau du visiteur
 * @param {number|null} [options.lat=null]       latitude du lieu ; avec lon, soleil calculé (lever, coucher, hauteur réels)
 * @param {number|null} [options.lon=null]       longitude du lieu
 * @param {string} [options.lever='07:00']       lever du soleil sans coordonnées (journée type)
 * @param {string} [options.coucher='19:30']     coucher du soleil sans coordonnées
 * @param {string|null} [options.heure=null]     heure forcée 'HH:MM' (démonstration, capture) ; null = heure réelle
 * @param {string|null} [options.parametre='heure'] paramètre d'adresse qui force l'heure (?heure=21:30) ; null pour ignorer
 * @param {boolean} [options.mer=true]           mer sous l'horizon (reflets du soleil et de la lune) ; false = ciel seul
 * @param {number|string} [options.horizon='auto'] hauteur de l'horizon : 'auto' = juste au-dessus du bloc de texte (le soleil
 *                                               levant ou couchant reste visible), ou fraction fixe du haut de la section (.62)
 * @param {number} [options.etoiles=1]           densité d'étoiles (0 pour couper)
 * @param {number} [options.intervalle=30000]    rafraîchissement de l'heure réelle (ms)
 * @param {number} [options.contraste=4.6]       contraste visé pour le texte (≥ 4,5 pour AA)
 * @param {string|null} [options.clair=null]     couleur claire du texte ; défaut : la plus claire de --couleur-texte / --couleur-fond
 * @param {string|null} [options.sombre=null]    couleur sombre du texte ; défaut : la plus sombre des deux
 * @param {Array|null} [options.palette=null]    lignes [altitude, haut, horizon, mer, mer profonde, soleil] (#rrggbb)
 * @param {object} [options.libelles]            noms des moments { aube, jour, crepuscule, nuit }
 * @returns {Promise<{detruire: Function, regler: Function, etat: Function}>}
 */
export async function init(root, options = {}) {
  const o = { timeZone: null, lat: null, lon: null, lever: '07:00', coucher: '19:30', heure: null, parametre: 'heure', mer: true, horizon: 'auto',
    etoiles: 1, intervalle: 30000, contraste: 4.6, clair: null, sombre: null, palette: null, ...options };
  o.libelles = { ...LIBELLES, ...(options.libelles || {}) };
  const s = await pret([]);
  const pal = (o.palette || PALETTE).map(l => [l[0], ...l.slice(1).map(hex)]);
  const astro = Number.isFinite(o.lat) && Number.isFinite(o.lon);
  let tz = o.timeZone || undefined;
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); } catch { console.warn('ciel-en-direct : fuseau inconnu', tz); tz = undefined; }
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const minutesDe = d => { const [h, m] = fmt.format(d).split(':').map(Number); return (h % 24) * 60 + m; };
  // Date réelle correspondant à « aujourd'hui, à m minutes » dans le fuseau du lieu.
  const dateA = m => { const n = new Date(); return new Date(n - n.getSeconds() * 1000 - n.getMilliseconds() + (m - minutesDe(n)) * 60000); };

  const $ = sel => root.querySelector(sel);
  const ui = { heure: $('[data-ced-heure]'), phase: $('[data-ced-phase]'), lever: $('[data-ced-lever]'), coucher: $('[data-ced-coucher]'),
    drapeau: $('[data-ced-drapeau]'), curseur: $('[data-ced-curseur]'), maintenant: $('[data-ced-maintenant]'), moments: [...root.querySelectorAll('[data-ced-moment]')] };
  const toile = $('.ced__toile'); const ctx = toile?.getContext('2d');
  let horizon = 1;
  const caler = () => {
    if (!o.mer) horizon = 1;
    else if (typeof o.horizon === 'number') horizon = borne(o.horizon, 0.2, 0.9);
    else { const t = $('.ced__texte'), r = root.getBoundingClientRect(); horizon = t && r.height ? borne((t.getBoundingClientRect().top - r.top - 36) / r.height, 0.2, 0.75) : 0.62; }
    root.style.setProperty('--ced-horizon', (horizon * 100).toFixed(1) + '%');
  };
  root.dataset.mer = o.mer ? 'oui' : 'non';

  // Couleurs du texte : la paire claire/sombre de la page, ou celle des options.
  const sonde = document.createElement('span'); root.appendChild(sonde);
  const resoudre = c => { sonde.style.color = ''; sonde.style.color = c; const v = getComputedStyle(sonde).color.match(/[\d.]+/g)?.map(Number) || [0, 0, 0]; return /^color\(/.test(getComputedStyle(sonde).color) ? v.slice(0, 3) : v.slice(0, 3).map(x => x / 255); };
  const a = resoudre(o.clair || 'var(--couleur-texte)'), b = resoudre(o.sombre || 'var(--couleur-fond)');
  sonde.remove();
  const [CLAIR, SOMBRE] = o.clair || o.sombre ? [a, b] : lum(a) >= lum(b) ? [a, b] : [b, a];

  // ---------- Modèle : minutes → état du ciel ----------
  let force = lireHeure(o.heure);
  if (force === null && o.parametre) force = lireHeure(new URLSearchParams(location.search).get(o.parametre));
  let jour = null; // { lever, coucher, midi } en minutes, recalculé à chaque tic
  function calerJour() {
    let lev = lireHeure(o.lever) ?? 420, cou = lireHeure(o.coucher) ?? 1170;
    if (astro) { const t = leverCoucher(dateA(720), o.lat, o.lon); if (t) { lev = minutesDe(t.lever); cou = minutesDe(t.coucher); } }
    if (cou <= lev) cou = lev + 1;
    jour = { lever: lev, coucher: cou, midi: (lev + cou) / 2 };
  }
  function hauteur(m) {
    if (astro) return hauteurSoleil(dateA(m), o.lat, o.lon);
    const { lever: l, coucher: c } = jour;
    if (m >= l && m <= c) return 52 * Math.sin(Math.PI * (m - l) / (c - l));
    return -42 * Math.sin(Math.PI * (((m - c + 1440) % 1440) / (1440 - (c - l))));
  }
  function cible(m) {
    const alt = hauteur(m);
    const h = borne(alt, pal[0][0], pal[pal.length - 1][0]);
    let i = 0; while (i < pal.length - 2 && h > pal[i + 1][0]) i++;
    const k = borne((h - pal[i][0]) / (pal[i + 1][0] - pal[i][0]), 0, 1);
    const c = j => mix(pal[i][j], pal[i + 1][j], k);
    const { lever: l, coucher: co, midi } = jour;
    const nuitLong = 1440 - (co - l), kn = ((m - co + 1440) % 1440) / nuitLong;
    const nuit = borne((-alt - 4) / 8, 0, 1);
    const phase = alt < -6 ? 'nuit' : alt < 6 ? (m < midi ? 'aube' : 'crepuscule') : 'jour';
    return { m, alt, phase, haut: c(1), lueur: c(2), mer1: c(3), mer2: c(4), soleil: c(5),
      sx: borne(0.1 + 0.8 * (m - l) / (co - l), -0.15, 1.15), sy: borne(alt / 55, -0.3, 0.9), sv: borne((alt + 2) / 4, 0, 1),
      lx: 0.12 + 0.76 * borne(kn, 0, 1), ly: 0.25 + 0.4 * Math.sin(Math.PI * borne(kn, 0, 1)), lv: kn <= 1 ? nuit : 0,
      nuit, lune: phaseLune(dateA(m)) };
  }

  // ---------- Contraste : choix du texte et du voile ----------
  function lisibilite(c) {
    const ech = [c.haut, c.lueur, mix(c.haut, c.lueur, 0.5), c.mer1, c.mer2];
    if (c.sv > 0) ech.push(mix(c.lueur, c.soleil, c.sv), mix(c.haut, c.soleil, 0.35 * c.sv));
    if (c.lv > 0) ech.push(mix(c.haut, LUNE, 0.25 * c.lv));
    const pire = t => Math.min(...ech.map(e => contraste(t, e)));
    const texte = pire(CLAIR) >= pire(SOMBRE) ? CLAIR : SOMBRE, voile = texte === CLAIR ? SOMBRE : CLAIR;
    let al = 0.1;
    while (al < 0.95 && Math.min(...ech.map(e => contraste(texte, mix(e, voile, al)))) < o.contraste) al += 0.02;
    return { texte, voile, al: Math.min(al, 0.95), sombre: texte === SOMBRE };
  }

  // ---------- Rendu ----------
  let etat = null, but = null, vars = '', dpr = 1, W = 0, H = 0, etoiles = [];
  const calme = () => s.calme;
  function poserVars(c) {
    const v = [rgb(c.haut), rgb(c.lueur), rgb(c.mer1), rgb(c.mer2)].join();
    if (v === vars) return; vars = v;
    const st = root.style;
    st.setProperty('--ced-haut', rgb(c.haut)); st.setProperty('--ced-lueur', rgb(c.lueur));
    st.setProperty('--ced-mer1', rgb(c.mer1)); st.setProperty('--ced-mer2', rgb(c.mer2));
  }
  function dimensionner() {
    if (!toile) return;
    caler();
    const r = root.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, s.telephone ? 1 : qualite);
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    toile.width = W; toile.height = H;
    // Étoiles : semées une fois (graine fixe), plafonnées sur téléphone.
    let graine = 11; const rnd = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
    const n = Math.round(Math.min(s.telephone ? 120 : 280, (r.width * r.height * horizon) / 4200) * o.etoiles);
    etoiles = Array.from({ length: n }, () => ({ x: rnd(), y: Math.pow(rnd(), 1.3) * 0.96, r: rnd() < 0.1 ? 1.5 : 0.8, a: 0.35 + rnd() * 0.65, p: rnd() * 6.28, v: 0.6 + rnd() * 1.4 }));
    dessiner(performance.now());
  }
  function disque(x, y, r, couleur, alpha) { ctx.globalAlpha = alpha; ctx.fillStyle = couleur; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function halo(x, y, r, c, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgb(${c.map(v => Math.round(v * 255)).join(' ')} / ${alpha})`); g.addColorStop(1, `rgb(${c.map(v => Math.round(v * 255)).join(' ')} / 0)`);
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function lune(x, y, r, p, alpha) {
    disque(x, y, r, rgb(mix(etat.haut, LUNE, 0.18)), alpha * 0.85);
    const c = Math.cos(2 * Math.PI * p), croissante = p < 0.5;
    ctx.globalAlpha = alpha; ctx.fillStyle = rgb(LUNE); ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !croissante);
    // Terminateur : demi-ellipse du bas vers le haut, bombée du côté éclairé (croissant) ou de l'autre (gibbeuse).
    ctx.ellipse(x, y, Math.abs(c) * r, r, 0, Math.PI / 2, -Math.PI / 2, croissante ? c > 0 : c <= 0);
    ctx.fill();
  }
  // Reflets : traits courts qui scintillent dans une colonne qui s'élargit vers le premier plan.
  function reflets(x, couleur, force, t, large) {
    const hz = H * horizon, n = s.telephone ? 40 : 64;
    ctx.fillStyle = rgb(couleur);
    for (let i = 0; i < n; i++) {
      const k = i / n, y = hz + Math.pow(k, 1.7) * (H - hz) + 2 * dpr;
      const ec = (0.012 + k * 0.13) * W * large;
      for (let d = 0; d < 2; d++) {
        const g = i * 2 + d;
        const j = Math.sin(t * 0.0009 + g * 2.17) * ec + Math.sin(t * 0.0021 + g * 5.3) * ec * 0.4;
        const l = ec * (0.2 + 0.5 * Math.abs(Math.sin(g * 7.7 + t * 0.0013)));
        ctx.globalAlpha = force * (0.8 - k * 0.5) * Math.pow(Math.abs(Math.sin(g * 3.1 + t * 0.0018)), 2) * (d ? 0.6 : 1);
        ctx.fillRect(x * W + j - l / 2, y, l, Math.max(1, (0.8 + k * 2) * dpr));
      }
    }
  }
  // Rides : lignes très pâles de la couleur de l'horizon, qui glissent lentement.
  function rides(t) {
    const hz = H * horizon, n = s.telephone ? 14 : 22;
    ctx.fillStyle = rgb(etat.lueur);
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n, y = hz + Math.pow(k, 1.8) * (H - hz);
      const l = W * (0.08 + 0.25 * k), x = ((Math.sin(i * 12.9) * 0.5 + 0.5) * W * 1.3 + t * 0.006 * (1 + k)) % (W * 1.3) - l * 0.3;
      ctx.globalAlpha = 0.07 * (1 - k * 0.6);
      ctx.fillRect(x, y, l, Math.max(1, (0.6 + k * 1.6) * dpr));
    }
  }
  function dessiner(t) {
    if (!ctx || !etat) return;
    const fige = calme(); if (fige) t = 4000;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
    const hz = H * horizon, m = Math.min(W, H);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hz); ctx.clip();
    if (etat.nuit > 0.01) for (const e of etoiles) {
      const sc = fige ? 0.85 : 0.6 + 0.4 * Math.sin(t * 0.001 * e.v + e.p);
      ctx.globalAlpha = etat.nuit * e.a * sc * borne((1 - e.y) * 3, 0, 1); ctx.fillStyle = '#fff';
      ctx.fillRect(e.x * W, e.y * hz, e.r * dpr, e.r * dpr);
    }
    if (etat.sv > 0.01) {
      const x = etat.sx * W, y = hz - etat.sy * hz;
      halo(x, y, m * 0.55, etat.soleil, 0.32 * etat.sv); halo(x, y, m * 0.16, etat.soleil, 0.55 * etat.sv);
      disque(x, y, m * 0.034, rgb(etat.soleil), etat.sv);
    }
    if (etat.lv > 0.01) {
      const x = etat.lx * W, y = hz - etat.ly * hz;
      halo(x, y, m * 0.12, LUNE, 0.14 * etat.lv); lune(x, y, m * 0.024, etat.lune, etat.lv);
    }
    ctx.restore();
    if (o.mer) {
      ctx.globalAlpha = 0.5; ctx.fillStyle = rgb(etat.lueur); ctx.fillRect(0, hz - dpr, W, Math.max(1, dpr)); // ligne d'horizon
      rides(t);
      if (etat.sv > 0.01) reflets(etat.sx, etat.soleil, etat.sv * 0.8, t, 1);
      if (etat.lv > 0.01) reflets(etat.lx, LUNE, etat.lv * 0.45 * (1 - Math.abs(etat.lune - 0.5) * 1.4), t, 0.6);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Textes, contraste, commandes ----------
  let dernierePhase = '', derniereLis = '';
  function poserLisibilite(c) {
    const l = lisibilite(c), cle = rgb(l.texte) + l.al.toFixed(2);
    if (cle === derniereLis) return; derniereLis = cle;
    root.style.setProperty('--ced-texte', rgb(l.texte)); root.style.setProperty('--ced-voile', rgb(l.voile));
    root.style.setProperty('--ced-voile-p', Math.round(l.al * 100) + '%'); root.style.setProperty('--ced-carte-p', Math.round(Math.max(l.al, 0.8) * 100) + '%');
    root.dataset.texte = l.sombre ? 'sombre' : 'clair';
  }
  const texte = (el, v) => { if (el && el.textContent !== v) el.textContent = v; };
  function poserTextes(c) {
    root.dataset.phase = c.phase;
    texte(ui.heure, hhmm(c.m)); texte(ui.phase, o.libelles[c.phase]);
    texte(ui.lever, hhmm(jour.lever)); texte(ui.coucher, hhmm(jour.coucher));
    if (ui.drapeau) ui.drapeau.hidden = force === null;
    ui.maintenant?.setAttribute('aria-pressed', String(force === null));
    const pm = force === null ? null : momentDe(force);
    for (const b of ui.moments) b.setAttribute('aria-pressed', String(b.dataset.cedMoment === pm));
    if (ui.curseur) {
      if (document.activeElement !== ui.curseur || force === null) ui.curseur.value = String(Math.round(c.m / 5) * 5 % 1440);
      ui.curseur.setAttribute('aria-valuetext', hhmm(c.m).replace(':', ' h ') + ', ' + o.libelles[c.phase].toLowerCase());
    }
    dernierePhase = c.phase;
  }
  const moments = () => ({ aube: jour.lever, midi: Math.round(jour.midi), crepuscule: jour.coucher + 10, nuit: Math.round((jour.coucher + 1440 + jour.lever) / 2) % 1440 });
  const arrondi = m => ((Math.round(m / 5) * 5) % 1440 + 1440) % 1440;
  function momentDe(m) { for (const [k, v] of Object.entries(moments())) if (arrondi(v) === m) return k; return null; }

  let tAvant = 0;
  function tic() {
    calerJour();
    const m = force ?? minutesDe(new Date());
    but = cible(m);
    if (!etat || calme()) etat = { ...but };
    poserLisibilite(but); poserTextes(but);
    if (calme() || !boucleActive) { etat = { ...but }; poserVars(etat); dessiner(performance.now()); }
  }
  function regler(h) {
    force = h === null || h === undefined ? null : typeof h === 'number' ? arrondi(h) : lireHeure(h);
    tic();
  }

  // Boucle : l'état glisse vers la cible (transition douce quand l'heure change), étoiles et reflets vivent.
  let qualite = 1.5, dtMoy = 16, images = 0, boucleActive = false, anim = null;
  const CLES_C = ['haut', 'lueur', 'mer1', 'mer2', 'soleil'], CLES_N = ['sx', 'sy', 'sv', 'lx', 'ly', 'lv', 'nuit'];
  function image(t, dt) {
    const k = 1 - Math.exp(-dt / 180);
    for (const c of CLES_C) etat[c] = mix(etat[c], but[c], k);
    for (const c of CLES_N) etat[c] += (but[c] - etat[c]) * k;
    etat.lune = but.lune;
    poserVars(etat); dessiner(t);
    // Garde-fou : trop lent → densité 1, puis image fixe.
    dtMoy += (dt - dtMoy) * 0.05;
    if (++images % 90 === 0 && dtMoy > 28) { if (qualite > 1) { qualite = 1; dimensionner(); } else { anim?.arreter(); boucleActive = false; etat = { ...but }; poserVars(etat); dessiner(0); } }
  }

  const ecouteurs = [];
  const ecouter = (el, ev, fn) => { if (!el) return; el.addEventListener(ev, fn); ecouteurs.push(() => el.removeEventListener(ev, fn)); };
  ecouter(ui.curseur, 'input', () => regler(+ui.curseur.value));
  ecouter(ui.maintenant, 'click', () => regler(null));
  for (const b of ui.moments) ecouter(b, 'click', () => regler(arrondi(moments()[b.dataset.cedMoment])));

  calerJour(); tic();
  const ro = new ResizeObserver(() => dimensionner()); ro.observe(root);
  dimensionner();
  if (!calme() && toile) { boucleActive = true; anim = s.boucle(root, image); }
  const minuterie = setInterval(() => { if (force === null) tic(); }, Math.max(5000, o.intervalle));
  root.classList.add('est-pret');

  return {
    /** regler('21:30') force une heure, regler(null) revient à l'heure réelle */
    regler,
    /** état courant : minutes, moment, hauteur du soleil, couleur du texte, opacité du voile */
    etat: () => ({ minutes: but.m, heure: hhmm(but.m), phase: but.phase, hauteur: +but.alt.toFixed(2), texte: root.dataset.texte, voile: root.style.getPropertyValue('--ced-voile-p'), images }),
    detruire() { clearInterval(minuterie); anim?.arreter(); ro.disconnect(); ecouteurs.forEach(f => f()); root.classList.remove('est-pret'); },
  };
}
