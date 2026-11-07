// Réservation de table : date (les sept prochains jours en puces, ou le calendrier), service midi ou soir, créneaux
// d'arrivée (passés et complets grisés), nombre de couverts, salle ou terrasse, demande particulière, coordonnées ;
// récapitulatif tenu à jour à côté, vérification, puis récapitulatif à confirmer (chaque ligne modifiable) et envoi simulé.
// Prérempli depuis l'adresse (?date=…&service=…&heure=…&couverts=…&espace=…, et table=… venu du plan de salle) ; brouillon gardé si l'on recharge la page.
// Tiré de jardins-hacienda-maquette/reserver-formulaire (champs, préremplissage, erreurs à côté du champ, envoi simulé)
// et de pizzalyght-maquette/panier (créneaux calculés à l'heure du lieu avec un délai, état relu, focus rendu après rendu).
// Sans JavaScript : un formulaire ordinaire (calendrier, liste d'heures, nombre). Mode calme : sans transition.
import { pret } from '../../socle/socle.js';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const echap = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const enMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const heure = (m) => { const h = Math.floor(m / 60), r = m % 60; return `${h} h${r ? ' ' + String(r).padStart(2, '0') : ''}`; };
const ajouter = (iso, n) => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10); };
const jourDe = (iso) => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j)).getUTCDay(); };
const dateLongue = (iso, o = { weekday: 'long', day: 'numeric', month: 'long' }) => { const [a, m, j] = iso.split('-').map(Number); return new Intl.DateTimeFormat('fr-FR', { ...o, timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, j))); };
const maj = (t) => t.charAt(0).toUpperCase() + t.slice(1);
function maintenant(fuseau) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute };
}
/** Nombre stable tiré d'un texte (FNV-1a) : complets simulés identiques d'un affichage à l'autre. */
const hache = (t) => { let h = 2166136261; for (const c of t) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) % 100; };

/**
 * @param {HTMLElement} root  section[data-module="reservation-de-table"] : script[data-reservation] (réglages), form[data-resa-form], aside[data-resa-recap]
 * @param {object} [options]
 * @param {object} [options.reglages]  les réglages (sinon le JSON de la page)
 * @param {function} [options.envoyer] async (demande) => { reference } : l'envoi réel (par défaut, simulé)
 * @param {function} [options.complet] (iso, 'HH:MM', couverts) => booléen : disponibilité réelle (par défaut, le JSON et la simulation)
 */
export async function init(root, options = {}) {
  const s = await pret([]);
  const form = root.querySelector('[data-resa-form]'), recap = root.querySelector('[data-resa-recap]');
  let R = options.reglages;
  if (!R) { try { R = JSON.parse(root.querySelector('script[data-reservation]')?.textContent || 'null'); } catch { R = null; } }
  if (!form || !recap || !R) return { detruire() {} };
  const o = { ...options };
  const fuseau = R.fuseau || 'Europe/Paris', delai = R.delai_minutes ?? 60, horizon = R.jours_a_l_avance ?? 60, maxi = R.couverts_max ?? 10;
  const services = Object.entries(R.services || {}).map(([id, v]) => ({ id, libelle: v.libelle || maj(id), d: enMin(v.debut), f: enMin(v.fin), pas: v.pas || 15 }));
  const F = R.fermetures || {};
  const $ = (sel) => form.querySelector(sel);
  const champ = (n) => form.elements.namedItem(n);
  root.classList.add('est-actif');
  if (s.calme) root.classList.add('est-calme');

  // ---------- Disponibilités ----------
  const ouvert = (iso, sid) => !(F.jours || []).includes(JOURS[jourDe(iso)]) && !(F.dates || []).includes(iso) && !((F.services || {})[JOURS[jourDe(iso)]] || []).includes(sid);
  function estComplet(iso, t, couverts) {
    if (o.complet) return !!o.complet(iso, t, couverts);
    if ((R.complets?.[iso] || []).includes(t)) return true;
    if (!R.complets_simules) return false;
    const m = enMin(t), pointe = (m >= 1200 && m <= 1245) || (m >= 750 && m <= 795), weekend = [5, 6].includes(jourDe(iso));
    return hache(iso + t) < (pointe ? 48 : 14) + (weekend ? 14 : 0) + Math.max(0, couverts - 4) * 6 - (ajouter(maintenant(fuseau).iso, 7) < iso ? 20 : 0);
  }
  /** Créneaux d'un service ce jour-là : { t, libelle, etat : 'libre' | 'complet' } ; les heures déjà passées (avec le délai) sont retirées. */
  function creneaux(iso, sid, couverts) {
    const sv = services.find((x) => x.id === sid); if (!sv || !ouvert(iso, sid)) return [];
    const n = maintenant(fuseau), out = [];
    for (let m = sv.d; m <= sv.f; m += sv.pas) {
      if (iso === n.iso && m < n.min + delai) continue;
      const t = hhmm(m); out.push({ t, libelle: heure(m), etat: estComplet(iso, t, couverts) ? 'complet' : 'libre' });
    }
    return out;
  }
  const libres = (iso, sid, c) => creneaux(iso, sid, c).filter((x) => x.etat === 'libre').length;
  const reservable = (iso, c = 2) => services.some((sv) => libres(iso, sv.id, c) > 0);
  const espaceOk = (e, iso) => !e.mois || !iso || e.mois.includes(+iso.slice(5, 7));

  // ---------- Champs ----------
  const dateEl = champ('date'), couvEl = champ('couverts');
  const auj = maintenant(fuseau).iso, fin = ajouter(auj, horizon);
  dateEl.min = auj; dateEl.max = fin;
  couvEl.max = maxi;
  const val = () => {
    const fd = new FormData(form);
    return { date: fd.get('date') || '', service: fd.get('service') || '', heure: fd.get('heure') || '', couverts: Math.max(1, Math.min(maxi, parseInt(fd.get('couverts'), 10) || 2)),
      espace: fd.get('espace') || '', table: (fd.get('table') || '').trim(), demandes: fd.getAll('demande'), message: (fd.get('message') || '').trim(),
      prenom: (fd.get('prenom') || '').trim(), nom: (fd.get('nom') || '').trim(), telephone: (fd.get('telephone') || '').trim(), email: (fd.get('email') || '').trim() };
  };

  // Puces des sept prochains jours (le calendrier reste pour les autres dates).
  const jours = root.querySelector('[data-resa-jours]');
  function rendreJours() {
    if (!jours) return;
    const v = dateEl.value;
    jours.innerHTML = Array.from({ length: 7 }, (_, k) => {
      const iso = ajouter(auj, k), ok = reservable(iso, val().couverts), ferme = !services.some((sv) => ouvert(iso, sv.id));
      const nom = k === 0 ? "Aujourd'hui" : k === 1 ? 'Demain' : maj(dateLongue(iso, { weekday: 'short' }).replace('.', ''));
      return `<button type="button" class="resa__jour" data-jour="${iso}" aria-pressed="${iso === v}" ${ok ? '' : 'disabled'}><span>${nom}</span><b>${dateLongue(iso, { day: 'numeric', month: 'short' })}</b>${ok ? '' : `<small>${ferme ? 'fermé' : 'complet'}</small>`}</button>`;
    }).join('');
    jours.hidden = false;
  }

  // Services du jour : fermés ou sans créneau libre, désactivés ; on garde le choix s'il reste possible.
  function majServices() {
    const v = val();
    for (const r of form.querySelectorAll('input[name="service"]')) {
      const ok = !!v.date && libres(v.date, r.value, v.couverts) > 0; r.disabled = !ok;
      const note = r.closest('label')?.querySelector('[data-note]'); if (note) note.textContent = !v.date ? '' : ouvert(v.date, r.value) ? (ok ? '' : 'complet') : 'fermé';
    }
    const coche = form.querySelector('input[name="service"]:checked');
    if (v.date && (!coche || coche.disabled)) { const premier = form.querySelector('input[name="service"]:not(:disabled)'); if (premier) premier.checked = true; else if (coche) coche.checked = false; }
  }

  // Créneaux : puces radio, complets grisés et annoncés ; le focus revient au même créneau après chaque rendu.
  const zone = root.querySelector('[data-resa-creneaux]'), aideCr = root.querySelector('[data-resa-creneaux-aide]');
  function rendreCreneaux() {
    const v = val(), focus = document.activeElement?.name === 'heure' ? document.activeElement.value : null;
    const liste = v.date && v.service ? creneaux(v.date, v.service, v.couverts) : [];
    const garde = liste.find((x) => x.t === v.heure && x.etat === 'libre') ? v.heure : '';
    zone.innerHTML = liste.length ? `<div class="resa__creneaux-liste">${liste.map((x) => `<label class="resa__creneau${x.etat === 'complet' ? ' est-complet' : ''}"><input type="radio" name="heure" value="${x.t}" ${x.t === garde ? 'checked' : ''} ${x.etat === 'complet' ? 'disabled' : ''} required><span>${x.libelle}</span>${x.etat === 'complet' ? '<small>complet</small>' : ''}</label>`).join('')}</div>` : '';
    const nLibres = liste.filter((x) => x.etat === 'libre').length;
    aideCr.textContent = !v.date ? 'Choisissez d\'abord une date.' : !v.service ? 'Ce jour-là, le restaurant est fermé ou complet : choisissez une autre date.' : !liste.length ? 'Plus de créneau pour ce service.' : !nLibres ? 'Ce service est complet : essayez l\'autre service ou un autre jour.' : `${nLibres} créneau${nLibres > 1 ? 'x' : ''} disponible${nLibres > 1 ? 's' : ''}${v.couverts >= 6 ? ` pour ${v.couverts} personnes` : ''}.`;
    if (focus) (zone.querySelector(`input[value="${focus}"]:not(:disabled)`) || zone.querySelector('input:not(:disabled)'))?.focus();
  }

  // Espaces : la terrasse hors saison est désactivée, avec sa raison.
  function majEspaces() {
    const v = val();
    for (const r of form.querySelectorAll('input[name="espace"]')) {
      const e = (R.espaces || []).find((x) => x.id === r.value) || {}, ok = espaceOk(e, v.date); r.disabled = !ok;
      const note = r.closest('label')?.querySelector('[data-note]'); if (note) note.textContent = ok ? (e.note || '') : (e.hors_saison || 'pas à cette date');
    }
    const coche = form.querySelector('input[name="espace"]:checked');
    if (!coche || coche.disabled) { const premier = form.querySelector('input[name="espace"]:not(:disabled)'); if (premier) premier.checked = true; }
  }

  // Couverts : − et +, de 1 au maximum ; au maximum, le lien pour appeler (groupes).
  const groupe = root.querySelector('[data-resa-groupe]');
  function majCouverts(n) {
    const c = Math.max(1, Math.min(maxi, n)); couvEl.value = c;
    form.querySelector('[data-moins]').disabled = c <= 1; form.querySelector('[data-plus]').disabled = c >= maxi;
    if (groupe) groupe.hidden = c < maxi;
  }

  // ---------- Récapitulatif ----------
  const LIGNES = [['date', 'Date'], ['service', 'Service'], ['heure', 'Heure'], ['couverts', 'Couverts'], ['espace', 'Installation'], ['demande', 'Demande'], ['contact', 'Au nom de']];
  let etape = 'saisie', reference = '', envoi = null;
  function texteDe(v) {
    const sv = services.find((x) => x.id === v.service), es = (R.espaces || []).find((x) => x.id === v.espace);
    return { date: v.date ? maj(dateLongue(v.date)) : '', service: sv ? sv.libelle : '', heure: v.heure ? heure(enMin(v.heure)) : '', couverts: `${v.couverts} couvert${v.couverts > 1 ? 's' : ''}`,
      espace: es ? es.libelle + (v.table ? ` · table ${v.table}` : '') : (v.table ? `Table ${v.table}` : ''), demande: [...v.demandes, v.message].filter(Boolean).join(' · '), contact: [[v.prenom, v.nom].filter(Boolean).join(' '), v.telephone].filter(Boolean).join(' · ') };
  }
  function rendreRecap() {
    const v = etape === 'envoye' && envoi ? envoi : val(), t = texteDe(v);
    if (etape === 'envoye') {
      recap.innerHTML = `<div class="resa__recap-corps est-envoye" tabindex="-1" data-resa-focus><p class="resa__recap-sur">Demande enregistrée</p><h3 class="resa__recap-titre">À ${echap(t.date.toLowerCase())}, ${echap(t.heure)}</h3>`
        + `<p>${echap(t.couverts)}${t.espace ? ' · ' + echap(t.espace.toLowerCase()) : ''}. Référence <b>${reference}</b>.</p>`
        + `<p class="resa__simule">${echap(R.message_simule || 'Réservation simulée : rien n\'a été envoyé. Sur le site final, la demande part vers le restaurant, qui la confirme par message.')}</p>`
        + `<button type="button" class="resa__bouton resa__bouton--ligne" data-resa-nouvelle>Faire une autre réservation</button></div>`;
      return;
    }
    const verif = etape === 'verification';
    recap.innerHTML = `<div class="resa__recap-corps${verif ? ' est-verif' : ''}" tabindex="-1" data-resa-focus><p class="resa__recap-sur">${verif ? 'Tout est juste ?' : 'Votre réservation'}</p><h3 class="resa__recap-titre">${t.date && t.heure ? `${echap(t.date)}, ${echap(t.heure)}` : 'À compléter'}</h3>`
      + `<dl class="resa__lignes">${LIGNES.filter(([k]) => k !== 'demande' || t.demande).map(([k, lib]) => `<div class="resa__ligne${t[k] ? '' : ' est-vide'}"><dt>${lib}</dt><dd>${t[k] ? echap(t[k]) : '—'}</dd>`
        + `<dd class="resa__modifier"><button type="button" class="resa__lien" data-resa-modifier="${k}">Modifier<span class="resa__sr"> : ${lib.toLowerCase()}</span></button></dd></div>`).join('')}</dl>`
      + (verif ? `<button type="button" class="resa__bouton" data-resa-confirmer>Confirmer la réservation</button><p class="resa__simule">Envoi simulé : rien ne part vers le restaurant dans cette démonstration.</p>` : '')
      + '</div>';
  }
  // Ce que « Modifier » rejoint, dans l'ordre de préférence (le choix fait, sinon le premier possible).
  const CIBLES = { date: ['[data-jour][aria-pressed="true"]', 'input[name="date"]'], service: ['input[name="service"]:checked', 'input[name="service"]:not(:disabled)'],
    heure: ['input[name="heure"]:checked', 'input[name="heure"]:not(:disabled)', '[data-resa-creneaux-aide]'], couverts: ['input[name="couverts"]'], espace: ['input[name="espace"]:checked'],
    demande: ['textarea[name="message"]'], contact: ['input[name="prenom"]'] };
  function modifier(k) {
    etape = 'saisie'; root.classList.remove('est-verification'); rendreRecap();
    const el = (CIBLES[k] || ['input']).map((c) => root.querySelector(c)).find(Boolean);
    el?.closest('fieldset, .resa__champ')?.scrollIntoView({ behavior: s.calme ? 'auto' : 'smooth', block: 'center' });
    if (el) { if (el.matches('[data-resa-creneaux-aide]')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  }

  // Montre le récapitulatif en entier sous l'en-tête (collé, il peut être repoussé sous l'en-tête en bas du formulaire).
  function montrer() {
    const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0, r = recap.getBoundingClientRect(), marge = 16;
    const dy = r.top < eh + marge ? r.top - eh - marge : r.bottom > innerHeight - marge ? Math.min(r.bottom - innerHeight + marge, r.top - eh - marge) : 0;
    if (dy) { if (s.lenis) s.lenis.scrollTo(scrollY + dy, { immediate: s.calme }); else scrollBy({ top: dy, behavior: s.calme ? 'auto' : 'smooth' }); }
  }

  // ---------- Vérification ----------
  function erreur(el, msg) {
    if (!el) return;
    const bloc = el.closest('fieldset, .resa__champ'), id = 'erreur-' + (el.name || el.id);
    let p = root.querySelector('#' + CSS.escape(id));
    if (!msg) { p?.remove(); el.removeAttribute('aria-invalid'); bloc?.classList.remove('est-erreur'); return; }
    if (!p) { p = document.createElement('p'); p.id = id; p.className = 'resa__erreur'; (bloc || el.parentElement).appendChild(p); }
    p.textContent = msg; el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', [...new Set([...(el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean), id])].join(' ')); bloc?.classList.add('est-erreur');
  }
  function verifier() {
    const v = val(); const pbs = [];
    const date = !v.date ? 'Choisissez une date.' : v.date < auj || v.date > fin ? `Choisissez une date entre aujourd'hui et le ${dateLongue(fin, { day: 'numeric', month: 'long' })}.` : !reservable(v.date, v.couverts) ? 'Ce jour-là, le restaurant est fermé ou complet.' : '';
    pbs.push([dateEl, date]);
    const hEl = form.querySelector('input[name="heure"]:not(:disabled)') || form.querySelector('input[name="heure"]') || (aideCr.setAttribute('tabindex', '-1'), aideCr);
    const h = date ? '' : !v.heure ? 'Choisissez une heure d\'arrivée.' : estComplet(v.date, v.heure, v.couverts) ? 'Ce créneau vient d\'être pris : choisissez-en un autre.' : '';
    pbs.push([hEl, h]);
    pbs.push([champ('prenom'), v.prenom ? '' : 'Indiquez votre prénom.']);
    pbs.push([champ('nom'), v.nom ? '' : 'Indiquez votre nom.']);
    pbs.push([champ('telephone'), !v.telephone ? 'Indiquez un téléphone pour vous joindre le jour même.' : v.telephone.replace(/[^\d]/g, '').length < 9 ? 'Numéro à vérifier (10 chiffres).' : '']);
    pbs.push([champ('email'), v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) ? 'Adresse e-mail à vérifier (exemple : nom@domaine.fr).' : '']);
    let premier = null;
    for (const [el, m] of pbs) { erreur(el, m); if (m && !premier) premier = el; }
    if (premier) { premier.closest('fieldset, .resa__champ')?.scrollIntoView({ behavior: s.calme ? 'auto' : 'smooth', block: 'center' }); premier.focus({ preventScroll: true }); }
    return !premier;
  }

  // ---------- Brouillon et adresse ----------
  const CLE = 'resa-brouillon:' + location.pathname;
  const GARDES = ['date', 'service', 'heure', 'couverts', 'espace', 'table', 'message', 'prenom', 'nom', 'telephone', 'email'];
  function poser(n, v) {
    const els = form.querySelectorAll(`[name="${n}"]`);
    if (!els.length) return;
    if (els[0].type === 'radio' || els[0].type === 'checkbox') els.forEach((e) => { e.checked = Array.isArray(v) ? v.includes(e.value) : e.value === v; });
    else els[0].value = v;
  }
  function sauver() { try { const v = val(); sessionStorage.setItem(CLE, JSON.stringify({ ...Object.fromEntries(GARDES.map((k) => [k, v[k]])), demandes: v.demandes })); } catch { /* stockage indisponible : on garde en mémoire */ } }
  const params = new URLSearchParams(location.search);
  const depuisAdresse = ['date', 'service', 'heure', 'couverts', 'espace', 'demande', 'table'].some((k) => params.has(k));
  let brouillon = null; try { brouillon = depuisAdresse ? null : JSON.parse(sessionStorage.getItem(CLE) || 'null'); } catch { brouillon = null; }
  const depart = brouillon || {};
  if (depuisAdresse) { for (const k of ['date', 'service', 'heure', 'couverts', 'espace', 'table']) if (params.has(k)) depart[k] = params.get(k); if (params.has('demande')) depart.demandes = params.get('demande').split(','); }
  // Table choisie sur un plan de salle (module plan-de-salle, ?table=…) : champ caché, montrée avec l'installation, envoyée avec la demande.
  if (depart.table) { depart.table = String(depart.table).slice(0, 24); if (!form.querySelector('[name="table"]')) { const h = document.createElement('input'); h.type = 'hidden'; h.name = 'table'; form.append(h); } }
  // Le brouillon ou l'adresse peut être ancien : on le revalide (date passée, heure plus possible).
  if (depart.date && (depart.date < auj || depart.date > fin)) delete depart.date;
  for (const k of GARDES) if (depart[k] !== undefined && k !== 'heure') poser(k, String(depart[k]));
  if (depart.demandes) poser('demande', depart.demandes);
  if (!dateEl.value) dateEl.value = Array.from({ length: horizon }, (_, k) => ajouter(auj, k)).find((iso) => reservable(iso)) || auj;

  // ---------- Câblage ----------
  function tout(depuis) {
    if (depuis !== 'heure') { majServices(); majEspaces(); rendreCreneaux(); }
    if (depuis === 'date' || depuis === 'couverts' || depuis === 'debut') rendreJours();
    if (etape !== 'saisie') { etape = 'saisie'; root.classList.remove('est-verification'); }
    rendreRecap(); sauver();
  }
  majCouverts(+couvEl.value || 2); tout('debut');
  if (depart.heure) { poser('heure', depart.heure); rendreRecap(); }

  form.addEventListener('change', (e) => {
    const n = e.target.name;
    if (n === 'couverts') majCouverts(parseInt(couvEl.value, 10) || 1);
    if (e.target.getAttribute('aria-invalid')) erreur(e.target, '');
    if (n === 'heure') { const h = form.querySelector('input[name="heure"]'); if (h) erreur(h, ''); }
    tout(n === 'date' || n === 'couverts' ? n : n === 'heure' ? 'heure' : n === 'service' ? 'service' : 'autre');
  });
  form.addEventListener('input', (e) => { if (e.target.matches('textarea, input[type="text"], input[type="tel"], input[type="email"]')) { if (e.target.getAttribute('aria-invalid')) erreur(e.target, ''); rendreRecap(); sauver(); } });
  form.addEventListener('click', (e) => {
    const j = e.target.closest('[data-jour]');
    if (j && !j.disabled) { dateEl.value = j.dataset.jour; erreur(dateEl, ''); tout('date'); form.querySelector(`[data-jour="${j.dataset.jour}"]`)?.focus(); return; }
    if (e.target.closest('[data-moins]')) { majCouverts((+couvEl.value || 1) - 1); tout('couverts'); }
    if (e.target.closest('[data-plus]')) { majCouverts((+couvEl.value || 1) + 1); tout('couverts'); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!verifier()) return;
    etape = 'verification'; root.classList.add('est-verification'); rendreRecap();
    recap.querySelector('[data-resa-focus]')?.focus({ preventScroll: true }); montrer();
  });
  recap.addEventListener('click', async (e) => {
    const m = e.target.closest('[data-resa-modifier]'); if (m) { modifier(m.dataset.resaModifier); return; }
    if (e.target.closest('[data-resa-confirmer]')) {
      if (!verifier()) { etape = 'saisie'; root.classList.remove('est-verification'); rendreRecap(); return; }
      const b = e.target.closest('[data-resa-confirmer]'); b.disabled = true; b.textContent = 'Envoi…';
      const v = val();
      try { reference = (o.envoyer ? (await o.envoyer(v))?.reference : null) || `R-${v.date.slice(5).replace('-', '')}-${String(1000 + Math.floor(Math.random() * 9000))}`; }
      catch { b.disabled = false; b.textContent = 'Confirmer la réservation'; erreur(b, 'L\'envoi n\'a pas abouti : réessayez, ou appelez-nous.'); return; }
      envoi = v; etape = 'envoye'; root.classList.remove('est-verification'); root.classList.add('est-envoye');
      for (const el of form.elements) el.disabled = true;
      try { sessionStorage.removeItem(CLE); } catch { /* rien */ }
      rendreRecap(); recap.querySelector('[data-resa-focus]')?.focus({ preventScroll: true }); montrer();
      root.dispatchEvent(new CustomEvent('reservation:envoyee', { detail: { ...v, reference }, bubbles: true }));
      return;
    }
    if (e.target.closest('[data-resa-nouvelle]')) {
      etape = 'saisie'; root.classList.remove('est-envoye'); for (const el of form.elements) el.disabled = false;
      for (const n of ['heure', 'message', 'demande', 'table']) form.querySelectorAll(`[name="${n}"]`).forEach((x) => { if (x.type === 'checkbox' || x.type === 'radio') x.checked = false; else x.value = ''; });
      majCouverts(+couvEl.value || 2); tout('date'); form.querySelector('[data-jour], input[name="date"]')?.focus();
    }
  });

  // Une autre fenêtre a pu changer le brouillon : on le relit au retour sur l'onglet (sans écraser une saisie en cours).
  const retour = () => { if (!document.hidden && etape === 'saisie') { rendreJours(); majServices(); rendreCreneaux(); rendreRecap(); } };
  document.addEventListener('visibilitychange', retour);
  return { etat: () => ({ etape, ...val() }), detruire() { document.removeEventListener('visibilitychange', retour); root.classList.remove('est-actif', 'est-calme', 'est-verification', 'est-envoye'); } };
}
