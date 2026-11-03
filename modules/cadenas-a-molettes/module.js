// Cadenas à molettes : deux à quatre molettes (tambours en 3D) qu'on tourne au doigt, à la molette de la souris
// ou au clavier (rôle spinbutton) ; quand chaque molette porte une valeur, l'anse se lève et les cartes
// correspondantes apparaissent. Molettes et résultats viennent uniquement des données :
// <script type="application/json" class="cam__donnees"> dans la section, ou options.donnees.
import { pret } from '../../socle/socle.js';

const TEXTES = {
  vide: '—',
  videDit: 'non réglée',
  ouvrir: 'Ouvrir le cadenas',
  raz: 'Tout remettre à zéro',
  ferme: 'Le cadenas est fermé : réglez les molettes pour voir les résultats.',
  manque: 'Encore {n} à régler : {noms}.',
  ouvert: 'Cadenas ouvert : {n} résultat(s).',
  titre: '{n} résultat(s) pour cette combinaison',
  aucun: 'Aucun résultat exact pour cette combinaison.',
  proches: 'À un réglage près',
  pasPareil: 'Sauf : {libelle}',
  voir: 'Voir le détail',
  precedent: '{libelle} : valeur précédente',
  suivant: '{libelle} : valeur suivante',
};
const remplir = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '').replace(/\((s)\)/g, (v.n ?? 2) > 1 ? 's' : '');
const echap = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const rebond = t => { const c = 1.6, d = c + 1; return 1 + d * (t - 1) ** 3 + c * (t - 1) ** 2; }; // back.out

/**
 * @param {HTMLElement} root  section.cam
 * @param {object} [options]
 * @param {object} [options.donnees]       { molettes: [{ id, libelle, valeurs: [{ v, t, dit? }] }], resultats: [{ titre, meta?, texte?, lien?, criteres: { id: [v…] | { min, max } } }] }
 * @param {boolean} [options.auto=true]    le cadenas s'ouvre seul quand toutes les molettes sont réglées
 * @param {number} [options.delai=500]     attente (ms) après le dernier réglage avant l'ouverture automatique
 * @param {boolean} [options.vide=true]    chaque molette commence sur une position vide (« — ») ; false : sur sa première valeur
 * @param {boolean} [options.proches=true] sans résultat exact, montrer ceux qui ne diffèrent que d'un critère
 * @param {boolean} [options.defiler=true] à la première ouverture (souris, doigt), amener les résultats à l'écran
 * @param {number} [options.pas=24]        angle entre deux crans du tambour, en degrés
 * @param {object} [options.textes]        libellés (voir TEXTES)
 */
export async function init(root, options = {}) {
  const o = { auto: true, delai: 500, vide: true, proches: true, defiler: true, pas: 24, ...options };
  const T = { ...TEXTES, ...(options.textes || {}) };
  const s = await pret([]);
  let d = o.donnees;
  if (!d) try { d = JSON.parse(root.querySelector('.cam__donnees')?.textContent || 'null'); } catch { d = null; }
  if (!d?.molettes?.length) return { detruire() {} };

  const ac = new AbortController(); const sig = { signal: ac.signal };
  const zone = root.querySelector('.cam__molettes');
  const btn = root.querySelector('.cam__ouvrir');
  const etat = root.querySelector('.cam__etat');
  const sortie = root.querySelector('.cam__resultats');
  const H = 44, A = o.pas, R = H / (2 * Math.tan((A / 2) * Math.PI / 180));
  let ouvert = false, dejaOuvert = false, minuterie = 0, parPointeur = false;

  zone.dataset.n = String(d.molettes.length);
  const molettes = d.molettes.map((m, k) => creer(m, k));

  // ---------- Une molette ----------
  function creer(m, k) {
    const items = (o.vide ? [{ v: null, t: T.vide, dit: T.videDit }] : []).concat(m.valeurs);
    const id = `cam-${m.id}-${Math.random().toString(36).slice(2, 7)}`;
    const el = document.createElement('div');
    el.className = 'cam__molette';
    el.innerHTML = `<span class="cam__libelle" id="${id}">${echap(m.libelle)}</span>
      <button type="button" class="cam__fleche" data-dir="-1" aria-label="${echap(remplir(T.precedent, { libelle: m.libelle }))}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5"/></svg></button>
      <div class="cam__fenetre" role="spinbutton" tabindex="0" aria-labelledby="${id}" aria-valuemin="0" aria-valuemax="${items.length - 1}" data-lenis-prevent>
        <div class="cam__tambour" aria-hidden="true">${items.map((it, i) => `<span class="cam__cran${it.v === null ? ' cam__cran--vide' : ''}" style="transform: rotateX(${-i * A}deg) translateZ(${R.toFixed(1)}px)">${echap(it.t)}</span>`).join('')}</div>
      </div>
      <button type="button" class="cam__fleche" data-dir="1" aria-label="${echap(remplir(T.suivant, { libelle: m.libelle }))}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg></button>`;
    zone.appendChild(el);
    const fen = el.querySelector('.cam__fenetre'), tambour = el.querySelector('.cam__tambour'), crans = [...tambour.children];
    const st = { rot: 0, index: 0, anim: 0 };
    const peindre = () => {
      tambour.style.transform = `translateZ(${-R.toFixed(1)}px) rotateX(${st.rot}deg)`;
      const f = st.rot / A;
      crans.forEach((c, i) => { const e = Math.abs(i - f); c.style.opacity = e > 2.6 ? '0' : String(1 - e * .32); c.classList.toggle('est-actif', e < .5); });
    };
    const tourner = cible => {
      cancelAnimationFrame(st.anim);
      if (s.calme) { st.rot = cible; peindre(); return; }
      const de = st.rot, t0 = performance.now(), duree = 550;
      const pas = t => { const p = Math.min(1, (t - t0) / duree); st.rot = de + (cible - de) * rebond(p); peindre(); if (p < 1) st.anim = requestAnimationFrame(pas); };
      st.anim = requestAnimationFrame(pas);
    };
    const regler = (i, anime = true, signaler = true) => {
      const idx = Math.max(0, Math.min(items.length - 1, i));
      const change = idx !== st.index;
      st.index = idx;
      fen.setAttribute('aria-valuenow', String(idx));
      fen.setAttribute('aria-valuetext', items[idx].dit || items[idx].t);
      if (anime) tourner(idx * A); else { st.rot = idx * A; peindre(); }
      if (change && signaler) changer();
    };
    for (const b of el.querySelectorAll('[data-dir]')) b.addEventListener('click', () => { parPointeur = true; regler(st.index + Number(b.dataset.dir)); }, sig);
    fen.addEventListener('keydown', e => {
      const sauts = { ArrowUp: -1, ArrowDown: 1, PageUp: -3, PageDown: 3 };
      let i = null;
      if (e.key in sauts) i = st.index + sauts[e.key];
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = items.length - 1;
      if (i === null) return;
      e.preventDefault(); parPointeur = false; regler(i);
    }, sig);
    let cumul = 0;
    fen.addEventListener('wheel', e => {
      const sens = Math.sign(e.deltaY);
      if (!sens || (sens < 0 && st.index === 0) || (sens > 0 && st.index === items.length - 1)) return; // en butée : la page défile
      e.preventDefault();
      cumul += e.deltaY;
      if (Math.abs(cumul) > 40) { parPointeur = true; regler(st.index + Math.sign(cumul)); cumul = 0; }
    }, { passive: false, signal: ac.signal });
    let glisse = null;
    fen.addEventListener('pointerdown', e => { if (e.button) return; glisse = { y: e.clientY, rot: st.rot, bouge: false }; fen.setPointerCapture(e.pointerId); cancelAnimationFrame(st.anim); }, sig);
    fen.addEventListener('pointermove', e => {
      if (!glisse) return;
      if (Math.abs(glisse.y - e.clientY) > 3) glisse.bouge = true;
      st.rot = Math.max(-A * .4, Math.min((items.length - 1 + .4) * A, glisse.rot + (glisse.y - e.clientY) * .55));
      peindre();
    }, sig);
    const fin = () => {
      if (!glisse) return;
      const bouge = glisse.bouge; glisse = null; parPointeur = true;
      regler(bouge ? Math.round(st.rot / A) : st.index);
    };
    fen.addEventListener('pointerup', fin, sig);
    fen.addEventListener('pointercancel', fin, sig);
    regler(0, false, false);
    return { m, items, regler, get valeur() { return items[st.index].v; }, indexDe: v => items.findIndex(it => it.v === v), arreter() { cancelAnimationFrame(st.anim); } };
  }

  // ---------- Correspondance ----------
  const accepte = (c, v) => c == null || (Array.isArray(c) ? c.includes(v) : (c.min == null || v >= c.min) && (c.max == null || v <= c.max));
  const ecarts = r => molettes.filter(w => !accepte(r.criteres?.[w.m.id], w.valeur));
  const manquantes = () => molettes.filter(w => w.valeur === null);

  function carte(r, i, proche) {
    const sauf = proche ? `<p class="cam__sauf">${echap(remplir(T.pasPareil, { libelle: proche.m.libelle }))}</p>` : '';
    return `<article class="cam__carte${proche ? ' est-proche' : ''}" style="--i: ${i}">
      <div class="cam__visuel socle-visuel${['', ' socle-visuel--2', ' socle-visuel--3'][i % 3]}" aria-hidden="true"></div>
      <div class="cam__carte-texte">
        ${r.meta ? `<p class="cam__meta">${echap(r.meta)}</p>` : ''}
        <h4 class="cam__carte-titre">${echap(r.titre)}</h4>
        ${r.texte ? `<p>${echap(r.texte)}</p>` : ''}${sauf}
        ${r.lien ? `<a class="cam__lien socle-bouton" href="${echap(r.lien)}">${echap(T.voir)}<span class="socle-sr"> : ${echap(r.titre)}</span></a>` : ''}
      </div>
    </article>`;
  }

  function afficher() {
    const exacts = d.resultats.filter(r => !ecarts(r).length);
    let html, n = exacts.length;
    if (n) html = `<h3 class="cam__resultats-titre">${echap(remplir(T.titre, { n }))}</h3><div class="cam__liste">${exacts.map((r, i) => carte(r, i)).join('')}</div>`;
    else {
      const pres = o.proches ? d.resultats.map(r => [r, ecarts(r)]).filter(([, e]) => e.length === 1) : [];
      html = `<h3 class="cam__resultats-titre">${echap(T.aucun)}</h3>` + (pres.length ? `<p class="cam__proches">${echap(T.proches)}</p><div class="cam__liste">${pres.map(([r, e], i) => carte(r, i, e[0])).join('')}</div>` : '');
    }
    sortie.innerHTML = html;
    return n;
  }

  function fermer() {
    ouvert = false;
    root.classList.remove('est-ouvert');
    sortie.innerHTML = `<p class="cam__ferme">${echap(T.ferme)}</p>`;
    btn.textContent = T.ouvrir;
  }

  function ouvrir(depuisBouton = false) {
    const reste = manquantes();
    if (reste.length) {
      etat.textContent = remplir(T.manque, { n: reste.length, noms: reste.map(w => w.m.libelle).join(', ') });
      if (depuisBouton) { root.classList.remove('est-refuse'); void root.offsetWidth; root.classList.add('est-refuse'); }
      return;
    }
    const premier = !ouvert;
    ouvert = true;
    root.classList.add('est-ouvert');
    const n = afficher();
    btn.textContent = T.raz;
    if (premier) etat.textContent = remplir(T.ouvert, { n });
    if (premier && !dejaOuvert && o.defiler && (parPointeur || depuisBouton)) {
      const haut = sortie.getBoundingClientRect().top;
      if (haut > innerHeight * .75) {
        // Les résultats montent vers le milieu de l'écran, sans jamais faire passer les molettes sous l'en-tête.
        const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
        const y = scrollY + Math.min(haut - innerHeight * .42, zone.getBoundingClientRect().top - eh - 16);
        setTimeout(() => { if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' }); }, s.calme ? 0 : 450);
      }
    }
    dejaOuvert = true;
  }

  function changer() {
    clearTimeout(minuterie);
    for (const x of root.querySelectorAll('[data-reglage]')) x.setAttribute('aria-pressed', 'false');
    if (ouvert) { if (manquantes().length) { fermer(); etat.textContent = T.ferme; } else afficher(); return; }
    if (!o.auto) return;
    etat.textContent = '';
    if (!manquantes().length) minuterie = setTimeout(() => ouvrir(), o.delai);
  }

  btn.textContent = T.ouvrir;
  btn.addEventListener('click', () => {
    clearTimeout(minuterie);
    if (ouvert) { for (const w of molettes) w.regler(0, true, false); fermer(); etat.textContent = T.ferme; return; }
    parPointeur = true; ouvrir(true);
  }, sig);
  root.addEventListener('animationend', e => { if (e.animationName === 'cam-refus') root.classList.remove('est-refuse'); }, sig);
  for (const b of root.querySelectorAll('[data-reglage]')) b.addEventListener('click', () => {
    let r; try { r = JSON.parse(b.dataset.reglage); } catch { return; }
    clearTimeout(minuterie);
    for (const w of molettes) if (w.m.id in r) w.regler(w.indexDe(r[w.m.id]), true, false);
    for (const x of root.querySelectorAll('[data-reglage]')) x.setAttribute('aria-pressed', String(x === b));
    parPointeur = true;
    if (ouvert) afficher(); else ouvrir(true);
  }, sig);
  for (const x of root.querySelectorAll('[data-reglage]')) x.setAttribute('aria-pressed', 'false');
  root.classList.add('est-pret');

  return { ouvrir: () => ouvrir(true), fermer, detruire() { ac.abort(); clearTimeout(minuterie); molettes.forEach(w => w.arreter()); } };
}
