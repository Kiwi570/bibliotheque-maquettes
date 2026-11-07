// Horaires : calculs et rendus sans DOM (servent au navigateur comme à generer-horaires.mjs).
// Tout se compte à l'heure du lieu (fuseau IANA du JSON, heure d'été comprise), jamais à celle du visiteur.
// Créneaux « HH:MM-HH:MM » ; une fin plus tôt que le début passe minuit (« 19:00-01:00 »).
// Ordre de priorité pour un jour : fermeture ou horaires exceptionnels > jour férié > semaine type.

export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const ORDRE = [1, 2, 3, 4, 5, 6, 0];
const echap = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const maj = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** 750 → « 12 h 30 », 1140 → « 19 h », 1470 → « 0 h 30 » (espaces insécables). */
export function heure(min) { const m = ((Math.round(min) % 1440) + 1440) % 1440, h = Math.floor(m / 60), r = m % 60; return `${h} h${r ? ' ' + String(r).padStart(2, '0') : ''}`; }
const plage = (c) => `${heure(c[0])} – ${heure(c[1])}`;

/** « 19:00-01:00 » → [1140, 1500] (minutes depuis minuit ; au-delà de 1440 : le lendemain). */
export function creneau(t) {
  const m = /^\s*(\d{1,2})[:h](\d{2})?\s*[-–]\s*(\d{1,2})[:h](\d{2})?\s*$/.exec(String(t)); if (!m) return null;
  const d = +m[1] * 60 + +(m[2] || 0); let f = +m[3] * 60 + +(m[4] || 0); if (f <= d) f += 1440; return [d, f];
}
const lire = (liste) => (Array.isArray(liste) ? liste : []).map((c) => (Array.isArray(c) ? creneau(c.join('-')) : creneau(c))).filter(Boolean)
  .sort((a, b) => a[0] - b[0]).reduce((acc, c) => { const p = acc[acc.length - 1]; if (p && c[0] <= p[1]) p[1] = Math.max(p[1], c[1]); else acc.push([...c]); return acc; }, []);

/** Dates « AAAA-MM-JJ » : arithmétique en UTC, indépendante du fuseau du visiteur. */
export function ajouter(iso, n) { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10); }
export const jourDe = (iso) => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j)).getUTCDay(); };
const dateLongue = (iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => { const [a, m, j] = iso.split('-').map(Number); return new Intl.DateTimeFormat('fr-FR', { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, j))); };

/** Heure du lieu : { iso, min, fuseau } pour l'instant donné (Date). */
export function maintenant(fuseau = 'Europe/Paris', instant = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(instant).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute, fuseau };
}

/** Lit le JSON : adresses complétées (fuseau, fériés, créneaux lus). */
export function preparer(d) {
  const fuseau = d.fuseau || 'Europe/Paris';
  const feries = Array.isArray(d.feries) ? d.feries : [];
  const adresses = (d.adresses || []).map((a, i) => ({
    ...a, id: a.id || 'adresse-' + (i + 1), fuseau: a.fuseau || fuseau,
    libelle_heure: a.libelle_heure || d.libelle_heure || 'Heure de ' + (a.fuseau || fuseau).split('/').pop().replace(/_/g, ' '),
    semaine: Object.fromEntries(JOURS.map((j) => [j, lire(a.semaine?.[j])])),
    exceptions: (a.exceptions || []).map((e) => ({ du: e.du || e.date, au: e.au || e.date, creneaux: lire(e.creneaux), motif: e.motif || '' })).filter((e) => e.du),
    feries: Array.isArray(a.feries) ? a.feries : feries,
    regle_feries: a.regle_feries ?? d.regle_feries ?? 'ferme',
  }));
  return { ...d, fuseau, adresses, seuil: d.seuil_ferme_bientot ?? 30 };
}

/** Créneaux d'un jour : { creneaux, motif, sorte : 'exception' | 'ferie' | 'semaine' }. */
export function jour(a, iso) {
  const e = a.exceptions.find((x) => x.du <= iso && iso <= x.au);
  if (e) return { creneaux: e.creneaux, motif: e.motif, sorte: 'exception' };
  const f = a.feries.find((x) => x.date === iso);
  if (f) {
    const r = a.regle_feries;
    if (r === 'ferme') return { creneaux: [], motif: f.nom || 'jour férié', sorte: 'ferie' };
    if (Array.isArray(r)) return { creneaux: lire(r), motif: f.nom || 'jour férié', sorte: 'ferie' };
  }
  return { creneaux: a.semaine[JOURS[jourDe(iso)]], motif: '', sorte: 'semaine' };
}

/** Statut à l'heure du lieu : ouvert, ferme bientôt, fermé ; prochaine ouverture. */
export function statut(a, n, seuil = 30) {
  const veille = jour(a, ajouter(n.iso, -1)), auj = jour(a, n.iso);
  let fin = null;
  for (const c of veille.creneaux) if (c[1] > 1440 && n.min < c[1] - 1440) fin = c[1] - 1440;
  for (const c of auj.creneaux) if (c[0] <= n.min && n.min < c[1]) fin = c[1];
  if (fin !== null) {
    const reste = fin - n.min, bientot = reste <= seuil;
    return { etat: bientot ? 'bientot' : 'ouvert', reste, fin, texte: bientot ? `Ferme bientôt · à ${heure(fin)}` : `Ouvert · jusqu'à ${heure(fin)}`, court: bientot ? 'Ferme bientôt' : 'Ouvert', motif: auj.sorte !== 'semaine' ? auj.motif : '' };
  }
  // Fermé : prochaine ouverture aujourd'hui, puis les jours suivants (60 jours au plus).
  for (let k = 0; k <= 60; k++) {
    const iso = ajouter(n.iso, k), j = k ? jour(a, iso) : auj;
    const c = j.creneaux.find((x) => (k ? true : x[0] > n.min)); if (!c) continue;
    const dans = k ? null : c[0] - n.min;
    const quand = k === 0 ? (dans <= 60 ? `ouvre dans ${dans} min` : `ouvre à ${heure(c[0])}`)
      : k === 1 ? `ouvre demain à ${heure(c[0])}` : k < 7 ? `ouvre ${JOURS[jourDe(iso)]} à ${heure(c[0])}` : `rouvre le ${dateLongue(iso)} à ${heure(c[0])}`;
    return { etat: 'ferme', prochaine: { iso, min: c[0] }, texte: `Fermé · ${quand}`, court: k === 0 && dans <= 60 ? 'Ouvre bientôt' : 'Fermé', motif: auj.sorte !== 'semaine' && !auj.creneaux.length ? auj.motif : '' };
  }
  return { etat: 'ferme', prochaine: null, texte: 'Fermé pour le moment', court: 'Fermé', motif: auj.motif };
}

/** Ce qui change dans les jours qui viennent (exceptions, fériés), pour la liste « À noter ». */
export function aVenir(a, iso, jours = 45) {
  const out = [], vus = new Set();
  for (const e of a.exceptions) {
    if (e.au < iso || e.du > ajouter(iso, jours)) continue;
    const quand = e.du === e.au ? maj(dateLongue(e.du)) : `Du ${dateLongue(e.du, { day: 'numeric', month: 'long' })} au ${dateLongue(e.au, { day: 'numeric', month: 'long' })}`;
    out.push({ du: e.du, texte: `${quand} : ${e.creneaux.length ? e.creneaux.map(plage).join(', ') : 'fermé'}${e.motif ? ` (${e.motif})` : ''}` });
    for (let d = e.du; d <= e.au; d = ajouter(d, 1)) vus.add(d);
  }
  for (const f of a.feries) {
    if (f.date < iso || f.date > ajouter(iso, jours) || vus.has(f.date) || a.regle_feries === 'ouvert') continue;
    const j = jour(a, f.date);
    out.push({ du: f.date, texte: `${maj(dateLongue(f.date))} : ${j.creneaux.length ? j.creneaux.map(plage).join(', ') : 'fermé'} (${f.nom || 'jour férié'})` });
  }
  return out.sort((x, y) => (x.du < y.du ? -1 : 1));
}

/** Texte d'une adresse : semaine type (jour en cours marqué si n est donné), à noter, coordonnées. */
export function rendreTexte(a, n = null) {
  const auj = n ? JOURS[jourDe(n.iso)] : null;
  const lignes = ORDRE.map((k) => { const j = JOURS[k], c = a.semaine[j];
    return `<div class="horaires__jour${j === auj ? ' est-aujourdhui' : ''}"><dt>${maj(j)}${j === auj ? '<span class="horaires__auj"> · aujourd\'hui</span>' : ''}</dt><dd>${c.length ? c.map(plage).join('<span aria-hidden="true"> · </span><span class="horaires__sr">, puis </span>') : '<span class="horaires__ferme">Fermé</span>'}</dd></div>`; }).join('');
  const notes = aVenir(a, n ? n.iso : new Date().toISOString().slice(0, 10));
  return `<dl class="horaires__semaine" aria-label="Horaires de la semaine${a.nom ? ' : ' + echap(a.nom) : ''}">${lignes}</dl>`
    + (notes.length ? `<div class="horaires__noter"><p class="horaires__noter-titre">À noter</p><ul>${notes.map((x) => `<li>${echap(x.texte)}</li>`).join('')}</ul></div>` : '')
    + `<address class="horaires__adresse">${a.adresse ? `<span>${echap(a.adresse)}</span>` : ''}${a.telephone ? `<a class="horaires__tel" href="tel:${echap(String(a.telephone).replace(/[^\d+]/g, ''))}">${echap(a.telephone)}</a>` : ''}</address>`;
}

/** Cadran 24 h : minuit en haut, créneaux du jour tracés (et la fin d'une nuit commencée la veille), aiguille à 0°. */
export function rendreCadran(a, n) {
  const C = 200, R = 158, pt = (m, r) => { const t = (m / 1440) * Math.PI * 2 - Math.PI / 2; return [(C + Math.cos(t) * r).toFixed(1), (C + Math.sin(t) * r).toFixed(1)]; };
  const arc = (d, f) => { f = Math.min(f, d + 1439.9); const p0 = pt(d, R), p1 = pt(f, R); return `M${p0[0]} ${p0[1]}A${R} ${R} 0 ${f - d > 720 ? 1 : 0} 1 ${p1[0]} ${p1[1]}`; };
  const veille = jour(a, ajouter(n.iso, -1)).creneaux.filter((c) => c[1] > 1440).map((c) => [0, c[1] - 1440]);
  const auj = jour(a, n.iso).creneaux;
  let s = `<svg class="horaires__svg" viewBox="-36 -36 472 472" aria-hidden="true" focusable="false"><circle class="horaires__piste" cx="200" cy="200" r="${R}"/>`;
  for (let h = 0; h < 24; h++) { const fort = h % 6 === 0, p0 = pt(h * 60, 176), p1 = pt(h * 60, fort ? 190 : 184); s += `<line class="horaires__graduation${fort ? ' est-forte' : ''}" x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}"/>`; }
  for (const [m, t] of [[0, '0 h'], [360, '6 h'], [720, '12 h'], [1080, '18 h']]) { const p = pt(m, 212); s += `<text class="horaires__repere" x="${p[0]}" y="${p[1]}">${t}</text>`; }
  for (const c of [...veille, ...auj]) {
    s += `<path class="horaires__arc" d="${arc(c[0], Math.min(c[1], 1440))}"/>`;
    if (c[0] > 0 || c[1] - c[0] > 120) { const mil = (c[0] + Math.min(c[1], 1440)) / 2, p = pt(mil, R - 34); s += `<text class="horaires__plage" x="${p[0]}" y="${p[1]}">${plage(c).replace(/ /g, ' ')}</text>`; }
  }
  return s + `<g class="horaires__aiguille"><line x1="200" y1="112" x2="200" y2="52"/><circle class="horaires__pointe" cx="200" cy="42" r="9"/></g></svg>`;
}

/** Bloc d'une adresse (nom si plusieurs adresses, puis le texte) : même rendu dans la page et dans le navigateur. */
export function rendreBloc(a, plusieurs, n = null) {
  return `<div class="horaires__bloc" id="horaires-${echap(a.id)}">${plusieurs ? `<h3 class="horaires__nom">${echap(a.nom || a.id)}</h3>` : ''}${rendreTexte(a, n)}</div>`;
}
