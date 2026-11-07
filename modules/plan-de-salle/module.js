// Plan de salle : la salle vue de dessus en SVG, posée sur un plan qui s'incline en 3D quand elle arrive à l'écran.
// Les tables (et leurs chaises, selon le nombre de places) sont dessinées d'après la liste de la page ; on choisit une table
// sur le plan ou dans la liste, un repère se dresse au-dessus, et « Réserver cette table » ouvre la réservation avec
// ?table=…&couverts=… Zones à filtrer, tables prises grisées, tables trop petites pour le nombre de couverts estompées.
// Créé à part (inspirations : jardins-hacienda-maquette/terrasse-piscine-visite-360, module carte-a-calques).
// Clavier, lecteur d'écran, téléphone : la liste (boutons de 44 px et plus). Sans JavaScript : la liste de liens.
// Mode calme : plan déjà incliné, choix sans mouvement.
import { pret } from '../../socle/socle.js';

const NS = 'http://www.w3.org/2000/svg';
const TEXTES = {
  toutes: 'Toute la salle', invite: 'Choisissez une table libre sur le plan ou dans la liste.',
  choix: '{nom} · {zone} · {places} places', detail: '{note}Pour {couverts} couvert{s}.',
  prise: 'Prise ce soir', petite: 'Trop petite pour {couverts}', plusPetite: 'La table {nom} n’a que {places} places : choisissez-en une autre.',
  repere: '{places} places · {zone}',
};
const remplir = (t, v) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const borne = (v, a, b) => Math.min(b, Math.max(a, v));

/** Chaises autour d'une table : { x, y, a } (centre et angle, en unités du plan, repère de la table). */
function chaises(t) {
  const n = t.places, e = 7, ch = 15, out = [];
  if (t.forme === 'ronde') {
    const R = t.l / 2 + e + ch / 2;
    for (let i = 0; i < n; i++) { const a = -90 + (i * 360) / n; out.push({ x: Math.cos((a * Math.PI) / 180) * R, y: Math.sin((a * Math.PI) / 180) * R, a: a + 90 }); }
    return out;
  }
  const w = t.l, h = t.h || t.l, haut = -h / 2 - e - ch / 2, bas = h / 2 + e + ch / 2;
  if (t.forme === 'carree' && n <= 4) {
    const pos = [{ x: 0, y: haut, a: 0 }, { x: 0, y: bas, a: 180 }, { x: -w / 2 - e - ch / 2, y: 0, a: -90 }, { x: w / 2 + e + ch / 2, y: 0, a: 90 }];
    return n <= 2 ? pos.slice(0, n) : pos.slice(0, n);
  }
  const bouts = n >= 6 ? 2 : 0, dessus = Math.ceil((n - bouts) / 2), dessous = n - bouts - dessus;
  for (let k = 0; k < dessus; k++) out.push({ x: -w / 2 + (w * (k + .5)) / dessus, y: haut, a: 0 });
  for (let k = 0; k < dessous; k++) out.push({ x: -w / 2 + (w * (k + .5)) / dessous, y: bas, a: 180 });
  if (bouts) out.push({ x: -w / 2 - e - ch / 2, y: 0, a: -90 }, { x: w / 2 + e + ch / 2, y: 0, a: 90 });
  return out;
}

/**
 * Chaque table est un li.pds__item de la liste : data-table (numéro ou identifiant, envoyé à la réservation), data-zone,
 * data-places, data-forme (ronde, carree, longue), data-x et data-y (centre, en unités du viewBox), data-l (diamètre ou largeur),
 * data-h (profondeur d'une table longue), data-r (rotation en degrés), data-prise (déjà réservée), data-espace (installation envoyée
 * à la réservation : sinon terrasse pour la zone « terrasse », salle pour les autres).
 * @param {HTMLElement} root  section[data-module="plan-de-salle"] contenant .pds__sol > svg et .pds__liste
 * @param {object} [options]
 * @param {string}  [options.reservation]   adresse de la réservation (sinon data-reservation de la section)
 * @param {object}  [options.parametres={table:'table',couverts:'couverts',espace:'espace'}] noms des paramètres envoyés (null : pas envoyé)
 * @param {number}  [options.couverts=2]    couverts au départ (sinon ?couverts= de l'adresse de la page, ou le champ)
 * @param {number}  [options.couvertsMax=12]
 * @param {string[]} [options.prises]       tables déjà prises (s'ajoutent aux data-prise)
 * @param {boolean} [options.lireAdresse=true] reprendre ?table= et ?couverts= de l'adresse de la page
 * @param {object}  [options.textes]        textes à remplacer (voir TEXTES)
 */
export async function init(root, options = {}) {
  const svg = root.querySelector('.pds__svg');
  const sol = root.querySelector('.pds__sol');
  const liste = root.querySelector('.pds__liste');
  if (!svg || !sol || !liste) return { choisir() {}, detruire() {} };
  const T = { ...TEXTES, ...(options.textes || {}) };
  const o = { reservation: root.dataset.reservation || root.querySelector('[data-pds-reserver]')?.getAttribute('href') || '', parametres: { table: 'table', couverts: 'couverts', espace: 'espace' },
    couverts: null, couvertsMax: 12, prises: [], lireAdresse: true, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap } = s;
  const calme = () => s.calme;
  const uid = 'pds-' + Math.random().toString(36).slice(2, 7);
  const nettoyages = [];
  const ecouter = (cible, ev, fn, opt) => { cible.addEventListener(ev, fn, opt); nettoyages.push(() => cible.removeEventListener(ev, fn, opt)); };
  root.classList.add('est-actif');

  // ---------- Tables lues dans la liste ----------
  const txt = (li, sel) => (li.querySelector(sel)?.textContent || '').trim();
  const tables = [...liste.querySelectorAll('.pds__item')].map((li, i) => ({
    id: li.dataset.table || String(i + 1), zone: li.dataset.zone || 'salle', zoneNom: txt(li, '.pds__zone-nom') || li.dataset.zone || '',
    places: +li.dataset.places || 2, forme: ['ronde', 'carree', 'longue'].includes(li.dataset.forme) ? li.dataset.forme : 'ronde',
    x: +li.dataset.x || 0, y: +li.dataset.y || 0, l: +li.dataset.l || 60, h: +li.dataset.h || 0, r: +li.dataset.r || 0,
    espace: li.dataset.espace || (li.dataset.zone === 'terrasse' ? 'terrasse' : 'salle'),
    prise: 'prise' in li.dataset || o.prises.map(String).includes(li.dataset.table), nom: txt(li, '.pds__nom') || 'Table ' + (li.dataset.table || i + 1), note: txt(li, '.pds__note'), li,
  }));
  const parId = new Map(tables.map((t) => [t.id, t]));
  const zones = [...new Map(tables.map((t) => [t.zone, t.zoneNom])).entries()];

  // ---------- La liste devient une liste de boutons (les liens restent pour qui n'a pas JavaScript) ----------
  for (const t of tables) {
    const ancien = t.li.querySelector('.pds__lien'); const b = document.createElement('button');
    b.type = 'button'; b.className = 'pds__lien'; b.dataset.pdsTable = t.id;
    if (ancien) { b.append(...ancien.childNodes); ancien.replaceWith(b); } else t.li.append(b);
    if (!b.querySelector('.pds__etat')) { const e = document.createElement('span'); e.className = 'pds__etat'; e.hidden = true; (b.querySelector('.pds__texte') || b).append(e); }
    t.bouton = b; t.etat = b.querySelector('.pds__etat');
  }

  // ---------- Tables dessinées dans le plan ----------
  const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
  const motif = document.createElementNS(NS, 'pattern');
  motif.setAttribute('id', uid + '-hachures'); motif.setAttribute('width', '9'); motif.setAttribute('height', '9'); motif.setAttribute('patternUnits', 'userSpaceOnUse'); motif.setAttribute('patternTransform', 'rotate(45)');
  motif.innerHTML = '<rect class="pds__hachures-fond" width="9" height="9"/><path class="pds__hachures-trait" d="M0 0V9"/>';
  defs.append(motif); root.style.setProperty('--pds-hachures', `url(#${uid}-hachures)`);
  const calque = document.createElementNS(NS, 'g'); calque.setAttribute('class', 'pds__tables'); svg.append(calque);
  const forme = (t, cls, marge = 0, dx = 0, dy = 0) => {
    if (t.forme === 'ronde') { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', dx); c.setAttribute('cy', dy); c.setAttribute('r', t.l / 2 + marge); c.setAttribute('class', cls); return c; }
    const w = t.l + marge * 2, h = (t.h || t.l) + marge * 2, r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', -w / 2 + dx); r.setAttribute('y', -h / 2 + dy); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('rx', Math.min(10, 6 + marge)); r.setAttribute('class', cls); return r;
  };
  for (const t of tables) {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pds__t'); g.dataset.table = t.id;
    g.setAttribute('transform', `translate(${t.x} ${t.y})${t.r ? ` rotate(${t.r})` : ''}`);
    g.append(forme(t, 'pds__clic', 26));
    const ombre = forme(t, 'pds__ombre', 0, 4, 6); g.append(ombre);
    for (const c of chaises(t)) {
      const r = document.createElementNS(NS, 'rect'); r.setAttribute('class', 'pds__chaise');
      r.setAttribute('x', -12); r.setAttribute('y', -7.5); r.setAttribute('width', 24); r.setAttribute('height', 15); r.setAttribute('rx', 5);
      r.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.a.toFixed(1)})`); g.append(r);
    }
    g.append(forme(t, 'pds__anneau', 14), forme(t, 'pds__plateau'));
    const n = document.createElementNS(NS, 'text'); n.setAttribute('class', 'pds__num'); n.setAttribute('font-size', String(Math.round(Math.min(24, (t.forme === 'ronde' ? t.l : Math.min(t.l, t.h || t.l)) * .42))));
    if (t.r) n.setAttribute('transform', `rotate(${-t.r})`); n.textContent = t.id; g.append(n);
    calque.append(g); t.g = g;
  }

  // ---------- Repère debout au-dessus de la table choisie ----------
  const repere = document.createElement('div'); repere.className = 'pds__repere'; repere.setAttribute('aria-hidden', 'true'); repere.hidden = true;
  repere.innerHTML = '<div class="pds__repere-corps"><span class="pds__repere-etiquette"><b></b><span></span></span><span class="pds__repere-tige"></span><span class="pds__repere-pied"></span></div>';
  sol.append(repere);
  const corps = repere.firstElementChild;

  // ---------- Outils : zones, couverts ----------
  const boiteFiltres = root.querySelector('[data-pds-filtres]');
  const filtres = [];
  if (boiteFiltres) {
    const ajouter = (zone, nom) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pds__filtre'; b.dataset.zone = zone; b.setAttribute('aria-pressed', String(zone === ''));
      const libres = tables.filter((t) => (!zone || t.zone === zone) && !t.prise).length;
      b.innerHTML = '<span></span><span class="pds__filtre-nb"></span>'; b.firstChild.textContent = nom; b.lastChild.textContent = String(libres);
      b.setAttribute('aria-label', `${nom}, ${libres} table${libres > 1 ? 's' : ''} libre${libres > 1 ? 's' : ''}`);
      boiteFiltres.append(b); filtres.push(b);
    };
    ajouter('', T.toutes); zones.forEach(([z, nom]) => ajouter(z, nom));
  }
  const champ = root.querySelector('.pds__qte input');
  const adresse = new URLSearchParams(location.search);
  let couverts = borne(Math.round(+(o.couverts ?? (o.lireAdresse && o.parametres.couverts ? adresse.get(o.parametres.couverts) : null) ?? champ?.value ?? 2) || 2), 1, o.couvertsMax);
  if (champ) { champ.value = String(couverts); champ.max = String(o.couvertsMax); }
  const choixEl = root.querySelector('[data-pds-choix]'), cta = root.querySelector('[data-pds-reserver]');

  // ---------- États ----------
  let filtre = '', choisie = null;
  // Paramètres lus par le module reservation-de-table : couverts et espace (salle, terrasse) le préremplissent, table est gardée et envoyée.
  const lien = (t) => { const u = new URL(o.reservation || location.href, location.href); const P = { table: 'table', couverts: 'couverts', espace: 'espace', ...o.parametres };
    if (P.table) u.searchParams.set(P.table, t.id); if (P.couverts) u.searchParams.set(P.couverts, String(couverts)); if (P.espace && t.espace) u.searchParams.set(P.espace, t.espace); return u.href; };
  function etats() {
    for (const t of tables) {
      const petite = !t.prise && t.places < couverts, hors = !!filtre && t.zone !== filtre;
      t.g.classList.toggle('est-prise', t.prise); t.g.classList.toggle('est-petite', petite); t.g.classList.toggle('est-terne', hors);
      t.li.hidden = hors; t.li.classList.toggle('est-petite', petite); t.li.toggleAttribute('data-prise', t.prise);
      const bloque = t.prise || petite;
      t.bouton.setAttribute('aria-disabled', String(bloque)); t.bouton.setAttribute('aria-pressed', String(choisie === t));
      if (t.etat) { t.etat.hidden = !bloque; t.etat.textContent = t.prise ? T.prise : petite ? remplir(T.petite, { couverts }) : ''; }
    }
    svg.querySelectorAll('.pds__zone').forEach((z) => z.classList.toggle('est-active', !!filtre && z.dataset.zone === filtre));
    filtres.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zone === filtre)));
  }
  const action = root.querySelector('.pds__action');
  function dire() {
    action?.classList.toggle('est-pret', !!choisie);
    if (cta) {
      if (choisie) { cta.href = lien(choisie); cta.removeAttribute('aria-disabled'); }
      else { cta.removeAttribute('href'); cta.setAttribute('aria-disabled', 'true'); }
    }
    if (!choixEl) return;
    if (!choisie) { choixEl.textContent = T.invite; return; }
    const v = { nom: choisie.nom, zone: choisie.zoneNom, places: choisie.places, couverts, s: couverts > 1 ? 's' : '', note: choisie.note ? choisie.note + '. ' : '' };
    choixEl.textContent = remplir(T.choix, v);
    const d = document.createElement('span'); d.textContent = remplir(T.detail, v); choixEl.append(d);
  }
  function poserRepere(t, anime) {
    if (!t) { if (anime && !repere.hidden) gsap.to(corps, { scaleY: 0, opacity: 0, duration: .25, ease: 'power2.in', onComplete: () => { repere.hidden = true; } }); else repere.hidden = true; return; }
    // Le repère se dresse au bord arrière de la table : sa tige ne cache pas le numéro.
    const dos = t.forme === 'ronde' ? t.l / 2 : (t.r % 180 ? t.l : (t.h || t.l)) / 2;
    repere.style.left = (t.x / 10).toFixed(2) + '%'; repere.style.top = ((t.y - dos) / 6.4).toFixed(2) + '%';
    corps.querySelector('b').textContent = t.nom; corps.querySelector('span span').textContent = remplir(T.repere, { places: t.places, zone: t.zoneNom });
    repere.hidden = false;
    // L'étiquette reste dans le plan (table au bord, téléphone) : décalée sur le côté, la tige reste sur la table.
    const etiquette = corps.firstElementChild; etiquette.style.translate = '';
    const re = etiquette.getBoundingClientRect(), rp = (root.querySelector('.pds__plan') || sol).getBoundingClientRect();
    const dx = re.left < rp.left + 4 ? rp.left + 4 - re.left : re.right > rp.right - 4 ? rp.right - 4 - re.right : 0;
    if (dx) etiquette.style.translate = `${dx.toFixed(1)}px 0`;
    if (anime) gsap.fromTo(corps, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: .55, ease: 'back.out(1.8)', overwrite: true });
    else gsap.set(corps, { scaleY: 1, opacity: 1 });
  }

  /** Choisit une table (son identifiant) ; null pour aucune. Une table prise ou trop petite n'est pas choisie. */
  function choisir(id, { annoncer = true } = {}) {
    const t = id == null ? null : parId.get(String(id));
    if (t && (t.prise || t.places < couverts)) {
      if (choixEl && annoncer) choixEl.textContent = t.prise ? `${t.nom} · ${T.prise}.` : remplir(T.plusPetite, { nom: t.id, places: t.places });
      return false;
    }
    if (choisie) { choisie.g.classList.remove('est-choisie'); choisie.li.classList.remove('est-choisie'); }
    choisie = t;
    if (t) { t.g.classList.add('est-choisie'); t.li.classList.add('est-choisie'); calque.append(t.g); }
    etats(); dire(); poserRepere(t, !calme());
    root.dispatchEvent(new CustomEvent('pds:choix', { detail: { table: t ? t.id : null, couverts, url: t ? lien(t) : null }, bubbles: true }));
    return true;
  }
  function filtrer(zone) { filtre = zone || ''; etats(); }
  function regler(n) {
    couverts = borne(Math.round(+n || 1), 1, o.couvertsMax); if (champ && champ.value !== String(couverts)) champ.value = String(couverts);
    if (choisie && choisie.places < couverts) { const t = choisie; choisir(null, { annoncer: false }); if (choixEl) choixEl.textContent = remplir(T.plusPetite, { nom: t.id, places: t.places }); }
    else { etats(); dire(); }
  }

  // ---------- Écoutes ----------
  ecouter(liste, 'click', (e) => { const b = e.target.closest('[data-pds-table]'); if (b) choisir(b.dataset.pdsTable); });
  ecouter(calque, 'click', (e) => { const g = e.target.closest('.pds__t'); if (!g) return; const t = parId.get(g.dataset.table); if (filtre && t.zone !== filtre) filtrer(''); choisir(t.id); });
  const survol = (id, oui) => { const t = parId.get(id); if (!t) return; t.g.classList.toggle('est-survol', oui); t.li.classList.toggle('est-survol', oui); };
  ecouter(calque, 'pointerover', (e) => { const g = e.target.closest('.pds__t'); if (g) survol(g.dataset.table, true); });
  ecouter(calque, 'pointerout', (e) => { const g = e.target.closest('.pds__t'); if (g && !g.contains(e.relatedTarget)) survol(g.dataset.table, false); });
  ecouter(liste, 'pointerover', (e) => { const b = e.target.closest('[data-pds-table]'); if (b) survol(b.dataset.pdsTable, true); });
  ecouter(liste, 'pointerout', (e) => { const b = e.target.closest('[data-pds-table]'); if (b && !b.contains(e.relatedTarget)) survol(b.dataset.pdsTable, false); });
  if (boiteFiltres) ecouter(boiteFiltres, 'click', (e) => { const b = e.target.closest('.pds__filtre'); if (b) filtrer(b.dataset.zone); });
  if (champ) {
    ecouter(champ, 'change', () => regler(champ.value));
    ecouter(champ, 'input', () => { if (champ.value !== '') regler(champ.value); });
  }
  const moins = root.querySelector('[data-pds-moins]'), plus = root.querySelector('[data-pds-plus]');
  if (moins) ecouter(moins, 'click', () => regler(couverts - 1));
  if (plus) ecouter(plus, 'click', () => regler(couverts + 1));
  if (cta) ecouter(cta, 'click', (e) => { if (!choisie) { e.preventDefault(); (tables.find((t) => !t.li.hidden && !t.prise && t.places >= couverts) || tables[0])?.bouton.focus(); } });

  // ---------- Le plan s'incline à l'arrivée (à chaque arrivée : remonter au-dessus le remet à plat) ; léger jeu sous la souris ----------
  if (!calme()) {
    const VARS = ['--pds-incl', '--pds-tour', '--pds-ech'];
    // Valeurs finales lues dans le CSS (elles changent avec la largeur de l'écran) : on retire un instant les valeurs en ligne.
    const cible = () => { const avant = VARS.map((k) => sol.style.getPropertyValue(k)); VARS.forEach((k) => sol.style.removeProperty(k));
      const cs = getComputedStyle(sol); const v = { '--pds-incl': cs.getPropertyValue('--pds-incl').trim() || '32deg', '--pds-tour': cs.getPropertyValue('--pds-tour').trim() || '0deg', '--pds-ech': cs.getPropertyValue('--pds-ech').trim() || '.9' };
      VARS.forEach((k, i) => { if (avant[i]) sol.style.setProperty(k, avant[i]); }); return v; };
    let tlPlan = null, penche = false;
    // À plat : d'un coup au départ, en un instant quand on remonte au-dessus (le plan se replie en sortant par le bas).
    const aplatir = (anime) => { tlPlan?.kill(); penche = false; const c = cible();
      const plat = { '--pds-incl': '0deg', '--pds-tour': '0deg', '--pds-ech': String(Math.min(.9, parseFloat(c['--pds-ech']) || .9)) };
      if (!anime) { gsap.set(sol, plat); gsap.set(calque.children, { opacity: 0 }); return; }
      if (!sol.style.getPropertyValue('--pds-incl')) gsap.set(sol, c);
      tlPlan = gsap.timeline().to(sol, { ...plat, duration: .55, ease: 'power2.in' }, 0).to(calque.children, { opacity: 0, duration: .3, ease: 'power1.in' }, 0); };
    const incliner = () => { if (penche) return; penche = true; tlPlan?.kill(); const c = cible();
      // Fin : on rend la main au CSS.
      tlPlan = gsap.timeline({ onComplete: () => VARS.forEach((k) => sol.style.removeProperty(k)) })
        .to(sol, { ...c, duration: 1.7, ease: 'power3.inOut' }, .05)
        .to(calque.children, { opacity: 1, duration: .5, stagger: { each: .06, from: 'random' }, ease: 'power1.out', clearProps: 'opacity' }, .45); };
    gsap.set(sol, { '--pds-jx': '0deg', '--pds-jz': '0deg' }); aplatir();
    const st = s.ScrollTrigger.create({ trigger: root.querySelector('.pds__tete') || root, start: 'bottom 72%', end: 'max',
      onToggle: (self) => { if (self.isActive) incliner(); else if (self.direction < 0) aplatir(true); } });
    if (st.isActive) incliner();
    nettoyages.push(() => { st.kill(); tlPlan?.kill(); });
    if (s.souris) {
      const scene = root.querySelector('.pds__scene') || sol;
      ecouter(scene, 'pointermove', (e) => { const r = scene.getBoundingClientRect(); gsap.to(sol, { '--pds-jz': ((e.clientX - r.left) / r.width - .5) * 5 + 'deg', '--pds-jx': ((e.clientY - r.top) / r.height - .5) * -4 + 'deg', duration: .9, ease: 'power3', overwrite: 'auto' }); });
      ecouter(scene, 'pointerleave', () => gsap.to(sol, { '--pds-jz': '0deg', '--pds-jx': '0deg', duration: 1, ease: 'power3', overwrite: 'auto' }));
    }
  }

  // ---------- Départ : couverts et table repris de l'adresse (retour depuis la réservation) ----------
  etats(); dire();
  const voulue = o.lireAdresse && o.parametres.table ? adresse.get(o.parametres.table) : null;
  if (voulue && parId.has(voulue)) choisir(voulue, { annoncer: false });

  return {
    choisir, filtrer, couverts: regler,
    /** Met à jour les tables prises (identifiants), par exemple depuis l'outil de réservation. */
    prises(ids = []) { const p = new Set(ids.map(String)); tables.forEach((t) => { t.prise = p.has(t.id); }); if (choisie?.prise) choisir(null, { annoncer: false }); etats(); dire(); },
    get choisie() { return choisie ? choisie.id : null; },
    detruire() { nettoyages.forEach((f) => f()); calque.remove(); motif.remove(); repere.remove(); filtres.forEach((b) => b.remove()); root.classList.remove('est-actif'); },
  };
}
