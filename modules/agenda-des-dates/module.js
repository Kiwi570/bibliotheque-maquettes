// Agenda des dates : stages, représentations, ateliers, sorties, écrits dans la page (lisibles sans JavaScript).
// Le module les classe selon la date du jour réelle, jamais au moment de la génération : à venir regroupées par mois,
// passées repliées dans « Dates passées » ; statut automatique (aujourd'hui, ce soir, demain, en cours, dernières places,
// complet, date à confirmer), compte à rebours de la prochaine date, filtres par type avec compteur, ajout à l'agenda
// (fichier .ics fabriqué à la volée) et lien de réservation prérempli (sujet et date). L'ajout à l'agenda a son retour
// physique : la pastille de la date se tamponne « Ajouté ».
import { pret } from '../../socle/socle.js';

/**
 * Une date : <li class="agd__date" data-debut="2026-11-20T19:00" data-fin="2026-11-20T21:30" data-type="Stage"
 *              data-lieu="Atelier, Lyon" data-places="3" data-complet data-reserver="contact.html#demande">
 *              <h3 class="agd__titre">…</h3> <time class="agd__quand" datetime="…">…</time> <p class="agd__texte">…</p></li>
 *   data-debut : date seule (« 2026-11-20 », journée entière) ou date et heure locales ; vide = date à confirmer.
 *   .agd__quand vide ou absent : écrit par le module. data-places="0" ou data-complet : complet.
 * @param {HTMLElement} root  section.agd (contient .agd__liste ; facultatifs : .agd__filtres, [data-prochaine], .agd__passees)
 * @param {object} [options]
 * @param {Date|string} [options.maintenant]       date du jour (par défaut : l'heure réelle) ; pour une démonstration figée
 * @param {number}  [options.dureeDefaut=90]       durée en minutes quand data-fin manque (fichier .ics, statut « en cours »)
 * @param {number}  [options.dernieresPlaces=3]    seuil du statut « dernières places »
 * @param {boolean} [options.parMois=true]         regroupe les dates à venir par mois
 * @param {string}  [options.reserver]             adresse de réservation par défaut (sinon data-reserver de chaque date)
 * @param {string}  [options.fuseau]               fuseau du .ics (« Europe/Paris ») ; sans : heure locale flottante
 * @param {string}  [options.langue]               langue des dates (par défaut : lang de la page)
 * @param {object}  [options.textes]               libellés (voir TEXTES)
 */
const TEXTES = {
  tous: 'Toutes', ajouter: 'Ajouter à mon agenda', ajoute: 'Ajouté à mon agenda', reserver: 'Réserver', attente: 'Liste d’attente',
  complet: 'Complet', dernieres: (n) => (n > 1 ? `Plus que ${n} places` : 'Dernière place'), encours: 'En cours', aujourdhui: 'Aujourd’hui',
  cesoir: 'Ce soir', demain: 'Demain', aconfirmer: 'Date à confirmer', passees: (n) => `Dates passées (${n})`,
  compte: (n) => (n > 1 ? `${n} dates à venir` : n === 1 ? '1 date à venir' : 'Aucune date à venir'),
  prochaine: (t, q) => `Prochaine date : ${t}, ${q}`, aucune: 'Aucune date à venir pour le moment.', tampon: 'Ajouté',
  dans: (j, h, m) => (j > 1 ? `dans ${j} jours` : j === 1 ? `dans 1 jour et ${h} h` : h ? `dans ${h} h ${String(m).padStart(2, '0')}` : `dans ${m} min`),
};

export async function init(root, options = {}) {
  const T = { ...TEXTES, ...(options.textes || {}) };
  const o = { dureeDefaut: 90, dernieresPlaces: 3, parMois: true, ...options };
  const s = await pret([]);
  const liste = root.querySelector('.agd__liste');
  if (!liste) return { detruire() {}, actualiser() {} };
  const langue = o.langue || document.documentElement.lang || 'fr-FR';
  const fmt = (opts) => new Intl.DateTimeFormat(langue, opts);
  const fJour = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fHeure = fmt({ hour: '2-digit', minute: '2-digit' });
  const fMois = fmt({ month: 'long', year: 'numeric' });
  const fMoisCourt = fmt({ month: 'short' });
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };

  /* Lecture des dates : une seule fois ; l'ordre et l'emplacement se recalculent à chaque actualisation. */
  const lire = (v) => {
    if (!v) return null;
    const jour = /^\d{4}-\d{2}-\d{2}$/.test(v);
    const d = new Date(jour ? `${v}T00:00` : v); /* sans fuseau : heure locale (une date seule serait lue en UTC) */
    return Number.isNaN(d.getTime()) ? null : { d, jour };
  };
  const dates = [...root.querySelectorAll('.agd__date')].map((el, i) => {
    const deb = lire(el.dataset.debut), fin = lire(el.dataset.fin);
    const finD = fin ? fin.d : deb ? new Date(deb.jour ? deb.d.getTime() + 86400000 - 1 : deb.d.getTime() + o.dureeDefaut * 60000) : null;
    const places = el.dataset.places === undefined || el.dataset.places === '' ? null : Math.max(0, parseInt(el.dataset.places, 10) || 0);
    return { el, i, debut: deb?.d || null, jour: !!deb?.jour, fin: finD, type: el.dataset.type || '', places, complet: el.hasAttribute('data-complet') || places === 0,
      titre: (el.querySelector('.agd__titre')?.textContent || '').trim(), lieu: el.dataset.lieu || '', texte: (el.querySelector('.agd__texte')?.textContent || '').trim() };
  });

  /* Habillage de chaque date : pastille, quand, statut, actions. */
  for (const x of dates) {
    const el = x.el;
    el.classList.add('agd__date--pret');
    const pastille = document.createElement('div');
    pastille.className = 'agd__pastille'; pastille.setAttribute('aria-hidden', 'true');
    pastille.innerHTML = x.debut ? `<span class="agd__num">${x.debut.getDate()}</span><span class="agd__mois">${fMoisCourt.format(x.debut).replace('.', '')}</span>` : '<span class="agd__num">?</span>';
    pastille.insertAdjacentHTML('beforeend', `<span class="agd__tampon">${T.tampon}</span>`);
    el.prepend(pastille);
    const corps = document.createElement('div'); corps.className = 'agd__corps';
    [...el.childNodes].filter((n) => n !== pastille).forEach((n) => corps.appendChild(n));
    el.appendChild(corps);
    let quand = el.querySelector('.agd__quand');
    const titre = corps.querySelector('.agd__titre');
    if (!quand) { quand = document.createElement('time'); quand.className = 'agd__quand'; if (titre) titre.after(quand); else corps.prepend(quand); }
    if (x.debut && !quand.textContent.trim()) {
      quand.dateTime = el.dataset.debut;
      const j = fJour.format(x.debut);
      quand.textContent = x.jour ? j : `${j} · ${fHeure.format(x.debut)}${el.dataset.fin ? ` – ${fHeure.format(x.fin)}` : ''}`;
    } else if (!x.debut && !quand.textContent.trim()) quand.textContent = T.aconfirmer;
    if (x.lieu && !corps.querySelector('.agd__lieu')) quand.after(Object.assign(document.createElement('p'), { className: 'agd__lieu', textContent: x.lieu }));
    const statut = document.createElement('p'); statut.className = 'agd__statut'; statut.hidden = true;
    if (titre) titre.before(statut); else corps.prepend(statut);
    x.statut = statut; x.corps = corps; x.pastille = pastille;
  }

  /* Outils : filtres, compteur, prochaine date, dates passées. */
  const filtres = root.querySelector('.agd__filtres');
  const compte = root.querySelector('[data-compte]');
  const prochaine = root.querySelector('[data-prochaine]');
  let passees = root.querySelector('.agd__passees');
  if (!passees) {
    passees = document.createElement('details'); passees.className = 'agd__passees';
    passees.innerHTML = '<summary class="agd__passees-titre"></summary><ol class="agd__liste agd__liste--passees"></ol>';
    liste.after(passees);
  }
  if (!passees.querySelector('summary')) passees.prepend(Object.assign(document.createElement('summary'), { className: 'agd__passees-titre' }));
  const listePassees = passees.querySelector('ol') || passees.appendChild(document.createElement('ol'));
  listePassees.classList.add('agd__liste', 'agd__liste--passees');
  const vide = root.querySelector('.agd__vide') || Object.assign(document.createElement('p'), { className: 'agd__vide', textContent: T.aucune });
  if (!vide.isConnected) liste.after(vide);
  const types = [...new Set(dates.map((x) => x.type).filter(Boolean))];
  let filtre = '';
  if (filtres && types.length > 1) {
    filtres.innerHTML = '';
    for (const t of ['', ...types]) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'agd__filtre'; b.dataset.type = t; b.textContent = t || T.tous; b.setAttribute('aria-pressed', t === filtre ? 'true' : 'false');
      filtres.appendChild(b);
    }
    ecoute(filtres, 'click', (e) => {
      const b = e.target.closest('.agd__filtre'); if (!b) return;
      filtre = b.dataset.type;
      filtres.querySelectorAll('.agd__filtre').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      appliquer(true);
    });
  } else if (filtres) filtres.hidden = true;

  /* Boutons : agenda (.ics) et réservation. */
  const echap = (t) => String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const plier = (l) => { const out = []; let r = l; while (r.length > 73) { out.push(r.slice(0, 73)); r = ' ' + r.slice(73); } out.push(r); return out.join('\r\n'); };
  const pad = (n) => String(n).padStart(2, '0');
  const local = (d, jour) => (jour ? `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` : `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`);
  const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function ics(x) {
    const prop = (k, d) => (x.jour ? `${k};VALUE=DATE:${local(d, true)}` : o.fuseau ? `${k};TZID=${o.fuseau}:${local(d)}` : `${k}:${local(d)}`);
    const fin = x.jour ? new Date(x.debut.getTime() + 86400000) : x.fin;
    const uid = `${local(x.debut)}-${x.titre.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase().slice(0, 40)}@${location.hostname || 'maquette'}`;
    const lignes = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//maquette//agenda-des-dates//FR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${uid}`, `DTSTAMP:${utc(new Date())}`, prop('DTSTART', x.debut), prop('DTEND', fin), `SUMMARY:${echap(x.titre)}`,
      ...(x.lieu ? [`LOCATION:${echap(x.lieu)}`] : []), ...(x.texte ? [`DESCRIPTION:${echap(x.texte)}`] : []), `URL:${location.href.split('#')[0]}`,
      'END:VEVENT', 'END:VCALENDAR'];
    return lignes.map(plier).join('\r\n') + '\r\n';
  }
  function telecharger(x) {
    const url = URL.createObjectURL(new Blob([ics(x)], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${(x.titre || 'date').normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase().slice(0, 50)}.ics` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function lienReserver(x) {
    const base = x.el.dataset.reserver || o.reserver;
    if (!base) return null;
    const u = new URL(base, location.href);
    if (x.titre) u.searchParams.set('sujet', x.titre);
    if (x.debut) u.searchParams.set('date', x.el.dataset.debut);
    return u.origin === location.origin ? u.pathname + u.search + u.hash : u.href;
  }

  /* Statut et place de chaque date par rapport à maintenant. */
  const maintenant = () => (o.maintenant ? new Date(o.maintenant) : new Date());
  const memeJour = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  function statut(x, n) {
    if (!x.debut) return ['aconfirmer', '']; /* déjà dit par le titre du groupe et la ligne de date */
    if (x.fin < n) return ['passee', ''];
    if (x.debut <= n) return ['encours', T.encours];
    if (x.complet) return ['complet', T.complet];
    if (x.places != null && x.places <= o.dernieresPlaces) return ['dernieres', T.dernieres(x.places)];
    if (memeJour(x.debut, n)) return ['bientot', !x.jour && x.debut.getHours() >= 17 ? T.cesoir : T.aujourdhui];
    const demain = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
    if (memeJour(x.debut, demain)) return ['bientot', T.demain];
    return ['', ''];
  }
  function actions(x, cle) {
    let zone = x.el.querySelector('.agd__actions');
    if (cle === 'passee' || cle === 'aconfirmer') { zone?.remove(); return; }
    if (!zone) {
      zone = document.createElement('p'); zone.className = 'agd__actions'; x.el.appendChild(zone);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'socle-bouton agd__ics'; b.textContent = T.ajouter;
      b.setAttribute('aria-label', `${T.ajouter} : ${x.titre}`);
      zone.appendChild(b);
      const href = lienReserver(x);
      if (href) { const a = document.createElement('a'); a.className = 'socle-bouton socle-bouton--plein agd__reserver'; a.href = href; zone.appendChild(a); }
    }
    const a = zone.querySelector('.agd__reserver');
    if (a) { a.textContent = cle === 'complet' ? T.attente : T.reserver; a.setAttribute('aria-label', `${a.textContent} : ${x.titre}`); }
  }

  let groupes = [];
  function appliquer(filtrage = false) {
    const n = maintenant();
    const avenir = [], passe = [];
    for (const x of dates) {
      const [cle, libelle] = statut(x, n);
      x.cle = cle;
      x.el.dataset.statut = cle || 'avenir';
      x.statut.hidden = !libelle; x.statut.textContent = libelle;
      actions(x, cle);
      (cle === 'passee' ? passe : avenir).push(x);
    }
    avenir.sort((a, b) => (a.debut ? a.debut - b.debut : 1) || (b.debut ? 0 : -1) || a.i - b.i);
    passe.sort((a, b) => b.debut - a.debut);
    const visible = (x) => !filtre || x.type === filtre;
    /* À venir : par mois (un titre de mois devant chaque groupe), dates à confirmer à la fin. */
    groupes.forEach((g) => g.remove()); groupes = [];
    let mois = '', ol = liste;
    liste.replaceChildren();
    for (const x of avenir) {
      const m = x.debut ? fMois.format(x.debut) : T.aconfirmer;
      if (o.parMois && m !== mois) {
        mois = m;
        if (ol !== liste || liste.children.length) {
          const g = document.createElement('div'); g.className = 'agd__groupe';
          g.innerHTML = `<h3 class="agd__groupe-titre">${m.charAt(0).toUpperCase() + m.slice(1)}</h3><ol class="agd__liste"></ol>`;
          (groupes.at(-1) || liste).after(g); groupes.push(g); ol = g.querySelector('ol');
        } else {
          const t = root.querySelector('.agd__mois-premier') || document.createElement('h3');
          t.className = 'agd__groupe-titre agd__mois-premier'; t.textContent = m.charAt(0).toUpperCase() + m.slice(1);
          if (!t.isConnected) liste.before(t);
        }
      }
      ol.appendChild(x.el);
      x.el.hidden = !visible(x);
    }
    if (!avenir.length) root.querySelector('.agd__mois-premier')?.remove();
    for (const g of groupes) g.hidden = ![...g.querySelectorAll('.agd__date')].some((el) => !el.hidden);
    const premier = root.querySelector('.agd__mois-premier');
    if (premier) premier.hidden = ![...liste.children].some((el) => !el.hidden);
    listePassees.replaceChildren(...passe.map((x) => { x.el.hidden = !visible(x); return x.el; }));
    const nPassees = passe.filter(visible).length;
    passees.hidden = !nPassees;
    passees.querySelector('summary').textContent = T.passees(nPassees);
    const visibles = avenir.filter((x) => visible(x) && x.debut);
    vide.hidden = avenir.some(visible);
    if (compte) compte.textContent = T.compte(visibles.length);
    if (prochaine) {
      const p = avenir.find((x) => x.debut && x.cle !== 'complet');
      if (!p) prochaine.textContent = T.aucune;
      else if (p.cle === 'encours') prochaine.textContent = T.prochaine(p.titre, T.encours.toLowerCase());
      else { const ms = p.debut - n, j = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.max(1, Math.round((ms % 3600000) / 60000));
        prochaine.textContent = T.prochaine(p.titre, T.dans(j, h, m)); }
    }
    if (filtrage && !s.calme) for (const x of dates) if (!x.el.hidden) { x.el.classList.remove('agd__date--entre'); void x.el.offsetWidth; x.el.classList.add('agd__date--entre'); }
  }
  appliquer();

  ecoute(root, 'click', (e) => {
    const b = e.target.closest('.agd__ics'); if (!b) return;
    const x = dates.find((d) => d.el.contains(b)); if (!x) return;
    telecharger(x);
    b.textContent = T.ajoute;
    x.el.classList.remove('agd__date--ajoutee'); void x.el.offsetWidth; x.el.classList.add('agd__date--ajoutee');
  });

  /* Apparition au défilement, une seule fois ; jamais en mode calme. */
  let io = null;
  if (!s.calme && 'IntersectionObserver' in window) {
    root.classList.add('agd--anime');
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('est-vu'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    dates.forEach((x) => io.observe(x.el));
  }
  /* Le compte à rebours et les statuts suivent l'heure (toutes les minutes) ; en mode calme, calculés une fois. */
  const minuterie = s.calme ? 0 : setInterval(() => { if (!document.hidden) appliquer(); }, 60000);
  return {
    actualiser: () => appliquer(),
    detruire() { clearInterval(minuterie); io?.disconnect(); nettoyer.forEach((f) => f()); },
  };
}
