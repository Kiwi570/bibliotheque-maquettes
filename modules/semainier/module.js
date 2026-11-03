// Semainier : grille d'une semaine (jours × moments) dont les cases portent des créneaux colorés par type.
// Des boutons (profils, formules, objectifs) réorganisent la semaine : chaque créneau glisse vers sa nouvelle place (Flip),
// les créneaux retirés s'effacent, le récapitulatif (heures par type) et le journal (aria-live) se mettent à jour.
// Les données sont dans la page : <script type="application/json" data-donnees> (ou options.donnees).
// Vraie <table> (en-têtes de colonnes = jours, en-têtes de lignes = moments) ; sur téléphone, un jour à la fois avec des onglets accessibles.
import { pret } from '../../socle/socle.js';

let compteur = 0;

/**
 * @param {HTMLElement} root  section.smn
 * @param {object} [options]
 * @param {object} [options.donnees]            données (sinon lues dans script[data-donnees]) : { libelle, jours, courts, moments, types, creneaux, formules }
 * @param {string} [options.formule]            id de la formule de départ (première par défaut)
 * @param {number} [options.jour=0]             jour affiché d'abord sur téléphone (0 = premier jour)
 * @param {number} [options.largeurTelephone=700]  en dessous : un jour à la fois avec onglets
 * @param {number} [options.duree=.8]           durée du Flip en s
 * @param {number} [options.decalage=.03]       décalage entre créneaux en s
 * @param {(minutes:number)=>string} [options.format]  mise en forme des durées (« 1 h 30 », « 45 min »)
 * @param {[string,string]} [options.mots=['créneau','créneaux']]  singulier et pluriel
 */
export async function init(root, options = {}) {
  const o = {
    jour: 0, largeurTelephone: 700, duree: .8, decalage: .03, mots: ['créneau', 'créneaux'],
    format: m => m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''),
    ...options,
  };
  let d = o.donnees;
  if (!d) { try { d = JSON.parse(root.querySelector('script[data-donnees]')?.textContent || 'null'); } catch { d = null; } }
  const feuille = root.querySelector('[data-feuille]');
  if (!d || !feuille || !d.formules?.length) return { detruire() {} };
  const s = await pret(['flip']);
  const { gsap, Flip } = s;
  const uid = 'smn-' + (++compteur);
  const types = Object.fromEntries(d.types.map(t => [t.id, t]));
  const courts = d.courts || d.jours.map(j => j.slice(0, 3));
  const mot = n => n + ' ' + (n > 1 ? o.mots[1] : o.mots[0]);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  root.querySelector('[data-sans-js]')?.remove();

  // ---------- Commandes : boutons de formule, description, journal ----------
  const commandes = root.querySelector('[data-commandes]') || root.insertBefore(el('div', 'smn__commandes'), feuille.closest('.smn__corps') || feuille);
  const groupe = el('div', 'smn__choix');
  groupe.setAttribute('role', 'group');
  const etiquette = el('span', 'smn__etiquette', d.libelle || 'Profil');
  etiquette.id = uid + '-libelle';
  groupe.setAttribute('aria-labelledby', etiquette.id);
  groupe.appendChild(etiquette);
  const boutons = d.formules.map(f => {
    const b = el('button', 'smn__formule', f.nom);
    b.type = 'button'; b.dataset.formule = f.id; b.setAttribute('aria-pressed', 'false');
    groupe.appendChild(b); return b;
  });
  const description = el('p', 'smn__description');
  const journal = el('p', 'smn__journal');
  journal.setAttribute('aria-live', 'polite');
  commandes.append(groupe, description);

  // ---------- Légende ----------
  const marque = t => { const m = el('span', 'smn__marque'); m.dataset.teinte = t.teinte; m.setAttribute('aria-hidden', 'true'); return m; };
  const legende = el('ul', 'smn__legende');
  legende.setAttribute('aria-label', 'Légende');
  for (const t of d.types) { const li = el('li'); li.dataset.teinte = t.teinte; li.append(marque(t), document.createTextNode(t.nom)); legende.appendChild(li); }

  // ---------- Onglets (téléphone) ----------
  const onglets = el('div', 'smn__onglets');
  onglets.setAttribute('role', 'tablist');
  onglets.setAttribute('aria-label', 'Jours de la semaine');
  const panneau = el('div', 'smn__panneau');
  panneau.id = uid + '-panneau';
  const tabs = d.jours.map((j, i) => {
    const b = el('button', 'smn__onglet');
    b.type = 'button'; b.id = `${uid}-onglet-${i}`; b.dataset.j = i;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', panneau.id);
    b.append(el('span', 'smn__onglet-j', courts[i]), el('span', 'smn__onglet-n'));
    onglets.appendChild(b); return b;
  });

  // ---------- Table ----------
  const table = el('table', 'smn__table');
  const caption = el('caption', 'socle-sr', 'Semaine : créneaux par jour et par moment');
  const thead = el('thead'), trh = el('tr');
  const coin = el('td', 'smn__coin');
  trh.appendChild(coin);
  d.jours.forEach((j, i) => {
    const th = el('th'); th.scope = 'col'; th.dataset.j = i;
    const long = el('span', 'smn__j-long', j), court = el('span', 'smn__j-court', courts[i]);
    court.setAttribute('aria-hidden', 'true');
    th.append(long, court); trh.appendChild(th);
  });
  thead.appendChild(trh);
  const tbody = el('tbody');
  const cases = {};
  d.moments.forEach((m, mi) => {
    const tr = el('tr'), th = el('th', null, m); th.scope = 'row'; tr.appendChild(th);
    d.jours.forEach((_, ji) => { const td = el('td'); td.dataset.j = ji; td.dataset.cle = ji + '-' + mi; cases[td.dataset.cle] = td; tr.appendChild(td); });
    tbody.appendChild(tr);
  });
  table.append(caption, thead, tbody);
  panneau.appendChild(table);
  feuille.append(legende, onglets, panneau, journal);

  // ---------- Créneaux (créés une fois, déplacés ensuite) ----------
  const reserve = el('div'); reserve.hidden = true; // créneaux jamais placés
  feuille.appendChild(reserve);
  const noeuds = {};
  for (const c of d.creneaux) {
    const t = types[c.type] || { nom: c.type, teinte: 1 };
    const n = el('div', 'smn__creneau'); n.dataset.id = c.id; n.dataset.teinte = t.teinte;
    const titre = el('span', 'smn__creneau-titre');
    titre.append(marque(t), el('span', 'socle-sr', t.nom + ' : '), document.createTextNode(c.titre));
    n.append(titre, el('span', 'smn__creneau-duree', o.format(c.minutes)));
    n.hidden = true; reserve.appendChild(n); noeuds[c.id] = n;
  }

  // ---------- Récapitulatif ----------
  const recap = root.querySelector('[data-recap]');
  const lignes = {};
  const parType = f => { const h = {}; for (const c of d.creneaux) if (f.places[c.id]) h[c.type] = (h[c.type] || 0) + c.minutes; return h; };
  const plafond = Math.max(1, ...d.formules.flatMap(f => Object.values(parType(f))));
  let total = null;
  if (recap) {
    const ul = el('ul', 'smn__recap-liste');
    for (const t of d.types) {
      const li = el('li', 'smn__recap-ligne'); li.dataset.teinte = t.teinte;
      const v = el('span', 'smn__recap-valeur'), barre = el('span', 'smn__barre'), i = el('i');
      barre.setAttribute('aria-hidden', 'true'); barre.appendChild(i);
      li.append(marque(t), el('span', 'smn__recap-nom', t.nom), v, barre);
      ul.appendChild(li); lignes[t.id] = { v, i };
    }
    const tot = el('p', 'smn__recap-total'); tot.append(el('span', null, 'Total'), (total = el('b')));
    recap.append(ul, tot);
  }

  // ---------- Placement ----------
  let actuelle = null, flip = null, jour = Math.min(Math.max(0, o.jour), d.jours.length - 1), telephone = null;
  const mq = matchMedia(`(max-width: ${o.largeurTelephone - 1}px)`);

  function placer(f, anime) {
    const avant = actuelle;
    const etat = anime && !s.calme ? Flip.getState(Object.values(noeuds)) : null;
    flip?.progress(1); flip?.kill(); flip = null;
    // Cases bloquées
    for (const [cle, td] of Object.entries(cases)) {
      td.querySelector('.smn__bloque')?.remove();
      const b = f.bloques?.[cle];
      td.classList.toggle('est-bloque', !!b);
      if (b) td.prepend(el('span', 'smn__bloque', b));
    }
    let deplaces = 0, retires = 0, ajoutes = 0;
    for (const c of d.creneaux) {
      const n = noeuds[c.id], cle = f.places[c.id], td = cle && cases[cle];
      const avantCle = avant?.places[c.id];
      if (td) { td.appendChild(n); n.hidden = false; if (avant) { if (!avantCle) ajoutes++; else if (avantCle !== cle) deplaces++; } }
      else { n.hidden = true; if (avantCle) retires++; }
    }
    actuelle = f;
    for (const b of boutons) b.setAttribute('aria-pressed', String(b.dataset.formule === f.id));
    description.textContent = f.description || '';
    // Récapitulatif
    const h = parType(f); let somme = 0;
    for (const t of d.types) { const m = h[t.id] || 0; somme += m; const l = lignes[t.id]; if (l) { l.v.textContent = m ? o.format(m) : '—'; l.i.style.setProperty('--part', (m / plafond).toFixed(3)); } }
    if (total) total.textContent = o.format(somme);
    compter();
    if (avant) {
      const morceaux = [mot(deplaces) + (deplaces > 1 ? ' déplacés' : ' déplacé')];
      if (retires) morceaux.push(retires + (retires > 1 ? ' retirés' : ' retiré'));
      if (ajoutes) morceaux.push(ajoutes + (ajoutes > 1 ? ' ajoutés' : ' ajouté'));
      journal.textContent = `${f.nom} : ${morceaux.join(', ')}. Total ${o.format(somme)}.`;
    } else journal.textContent = `${f.nom} : ${mot(Object.keys(f.places).length)}, ${o.format(somme)} au total.`;
    if (etat) {
      flip = Flip.from(etat, {
        duration: o.duree, ease: 'power3.inOut', stagger: o.decalage, absolute: true, scale: false, zIndex: 5,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: o.duree * .7, delay: o.duree * .25 }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: .9, duration: o.duree * .45 }),
        onComplete: () => { flip = null; s.rafraichir(); },
      });
    } else s.rafraichir();
  }

  // Nombre de créneaux par jour (onglets)
  function compter() {
    tabs.forEach((b, i) => {
      const n = actuelle ? Object.values(actuelle.places).filter(c => c.split('-')[0] === String(i)).length : 0;
      b.querySelector('.smn__onglet-n').textContent = n || '—';
      b.setAttribute('aria-label', `${d.jours[i]}, ${n ? mot(n) : 'aucun ' + o.mots[0]}`);
    });
  }

  // ---------- Mode téléphone : un jour à la fois ----------
  function montrerJour(i, focus) {
    jour = i;
    tabs.forEach((b, k) => { const sel = k === i; b.setAttribute('aria-selected', String(sel)); b.tabIndex = sel ? 0 : -1; });
    panneau.setAttribute('aria-labelledby', tabs[i].id);
    for (const c of table.querySelectorAll('[data-j]')) c.hidden = telephone && c.dataset.j !== String(i);
    if (focus) tabs[i].focus();
    if (telephone) { panneau.classList.remove('est-nouveau'); void panneau.offsetWidth; panneau.classList.add('est-nouveau'); }
  }
  function mode() {
    if (telephone === mq.matches) return;
    flip?.progress(1);
    telephone = mq.matches;
    root.classList.toggle('est-telephone', telephone);
    if (telephone) { panneau.setAttribute('role', 'tabpanel'); panneau.tabIndex = 0; }
    else { panneau.removeAttribute('role'); panneau.removeAttribute('tabindex'); panneau.removeAttribute('aria-labelledby'); }
    montrerJour(jour, false);
    if (!telephone) panneau.removeAttribute('aria-labelledby');
  }

  // ---------- Écouteurs ----------
  const surClic = e => {
    const b = e.target.closest('.smn__formule');
    if (b && groupe.contains(b)) { const f = d.formules.find(x => x.id === b.dataset.formule); if (f && f !== actuelle) placer(f, true); return; }
    const t = e.target.closest('.smn__onglet');
    if (t && onglets.contains(t)) montrerJour(+t.dataset.j, false);
  };
  const surTouche = e => {
    const t = e.target.closest('.smn__onglet'); if (!t) return;
    const n = tabs.length, i = +t.dataset.j;
    const cible = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (cible === undefined) return;
    e.preventDefault(); montrerJour(cible, true);
  };
  root.addEventListener('click', surClic);
  onglets.addEventListener('keydown', surTouche);
  mq.addEventListener('change', mode);

  const depart = d.formules.find(f => f.id === o.formule) || d.formules[0];
  mode();
  placer(depart, false);

  return {
    /** placer('id') : applique une formule depuis l'extérieur */
    placer(id) { const f = d.formules.find(x => x.id === id); if (f) placer(f, true); },
    detruire() { root.removeEventListener('click', surClic); onglets.removeEventListener('keydown', surTouche); mq.removeEventListener('change', mode); flip?.kill(); },
  };
}
