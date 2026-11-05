// Tarifs à rouleaux : formules côte à côte écrites dans la page (lisibles sans JavaScript), une formule conseillée,
// un interrupteur de mode (à la séance, carte, abonnement ; mensuel, annuel…) qui fait rouler les chiffres des prix
// comme un compteur mécanique, puis les rend en texte simple. « Choisir » envoie la formule et le mode dans l'adresse
// du formulaire (préremplissage) et tamponne la carte choisie (retour physique, grille wouahou point 7).
import { pret } from '../../socle/socle.js';

/**
 * Une formule : <li class="trf__formule" data-formule="Découverte" data-conseillee>
 *   <h3 class="trf__nom">…</h3>
 *   <p class="trf__prix"><span class="trf__montant" data-prix='{"seance":"25","carte":"220"}'>25</span>
 *     <span class="trf__unite" data-unite='{"seance":"€ la séance","carte":"€ les 10 séances"}'>€ la séance</span></p>
 *   <p class="trf__economie" data-economie='{"carte":"12 % d’économie"}'></p>   (facultatif)
 *   <a class="socle-bouton trf__choisir" href="/contact#demande">Choisir</a></li>
 * Modes (facultatifs) : <div class="trf__modes" role="radiogroup"><button type="button" role="radio" data-mode="seance">…</button>…</div>
 * Un prix sans data-prix ne change pas de mode ; une valeur « sur devis » (sans chiffre) s'affiche telle quelle.
 * @param {HTMLElement} root  section.trf
 * @param {object} [options]
 * @param {string}  [options.mode]               mode affiché au départ (par défaut : celui marqué aria-checked, sinon le premier)
 * @param {boolean} [options.rouler=true]        les chiffres roulent depuis 0 à la première apparition
 * @param {number}  [options.duree=.9]           durée d'un roulement (s) ; chaque chiffre part un peu après le précédent
 * @param {string}  [options.conseillee='Conseillée']  libellé de la pastille de la formule conseillée
 * @param {string}  [options.choisie='Choisie']  texte du tampon après « Choisir »
 */
export async function init(root, options = {}) {
  const o = { rouler: true, duree: 0.9, conseillee: 'Conseillée', choisie: 'Choisie', ...options };
  const s = await pret([]);
  const formules = [...root.querySelectorAll('.trf__formule')];
  if (!formules.length) return { detruire() {}, mode() {} };
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };
  const json = (el, attr) => { try { return JSON.parse(el?.getAttribute(attr) || 'null'); } catch { return null; } };
  root.classList.add('trf--pret');

  /* Pastille de la formule conseillée, tampon de choix. */
  for (const f of formules) {
    if (f.hasAttribute('data-conseillee') && !f.querySelector('.trf__pastille')) f.insertAdjacentHTML('afterbegin', `<p class="trf__pastille">${o.conseillee}</p>`);
    f.insertAdjacentHTML('beforeend', `<span class="trf__tampon" aria-hidden="true">${o.choisie}</span>`);
  }

  /* Modes */
  const modes = [...root.querySelectorAll('.trf__modes [data-mode]')];
  let mode = o.mode || modes.find((b) => b.getAttribute('aria-checked') === 'true')?.dataset.mode || modes[0]?.dataset.mode || null;
  const libelleMode = () => modes.find((b) => b.dataset.mode === mode)?.textContent.trim() || '';

  /* Roulement : une colonne 0-9 par chiffre, qui glisse de l'ancien au nouveau chiffre ; puis du texte simple
     (le crénage et la sélection redeviennent normaux). Le lecteur d'écran lit la valeur finale, les colonnes sont masquées. */
  const CHIFFRES = [...'0123456789'].map((d) => `<span>${d}</span>`).join('');
  const minuteurs = new WeakMap();
  function ecrire(el, valeur, depuis) {
    clearTimeout(minuteurs.get(el));
    if (s.calme || !/\d/.test(valeur)) { el.textContent = valeur; return; }
    const chars = [...valeur], avant = [...(depuis ?? '')].filter((c) => /\d/.test(c));
    const nDigits = chars.filter((c) => /\d/.test(c)).length;
    let k = 0;
    const html = chars.map((c) => {
      if (!/\d/.test(c)) return `<span class="trf__fixe">${c === ' ' ? '&nbsp;' : c}</span>`;
      const de = avant.length ? Number(avant[avant.length - nDigits + k] ?? 0) : 0;
      const pos = k++;
      return `<span class="trf__col" style="--de:${Number.isNaN(de) ? 0 : de};--vers:${c};--i:${pos}"><span class="trf__chiffres">${CHIFFRES}</span></span>`;
    }).join('');
    el.innerHTML = `<span class="socle-sr">${valeur}</span><span class="trf__rouleaux" aria-hidden="true">${html}</span>`;
    el.style.setProperty('--trf-duree', `${o.duree}s`);
    void el.offsetWidth;
    el.classList.add('trf__montant--roule');
    const fin = (o.duree + nDigits * 0.08) * 1000 + 120;
    minuteurs.set(el, setTimeout(() => { el.classList.remove('trf__montant--roule'); el.textContent = valeur; }, fin));
  }

  function appliquer(nouveau, { roule = true } = {}) {
    const ancien = mode; mode = nouveau;
    modes.forEach((b) => { const on = b.dataset.mode === mode; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    root.dataset.mode = mode || '';
    for (const f of formules) {
      const m = f.querySelector('.trf__montant'), u = f.querySelector('.trf__unite'), e = f.querySelector('.trf__economie');
      const prix = json(m, 'data-prix'), unite = json(u, 'data-unite'), eco = json(e, 'data-economie');
      if (m && prix && mode in prix) { const v = String(prix[mode]); if (m.textContent.trim() !== v || !roule) roule ? ecrire(m, v, prix[ancien] ?? m.textContent) : (m.textContent = v); }
      if (u && unite && mode in unite) u.textContent = unite[mode];
      /* Ligne d'économie réservée (même vide) : les cartes ne sautent pas quand on change de mode. */
      if (e) { const t = eco && mode in eco ? eco[mode] : ''; e.textContent = t || '\u00a0'; e.hidden = false; e.classList.toggle('trf__economie--vide', !t); e.toggleAttribute('aria-hidden', !t); }
      const absent = prix && !(mode in prix);
      f.classList.toggle('trf__formule--absente', !!absent);
    }
  }
  if (modes.length) {
    appliquer(mode, { roule: false });
    const groupe = root.querySelector('.trf__modes');
    ecoute(groupe, 'click', (ev) => { const b = ev.target.closest('[data-mode]'); if (b && b.dataset.mode !== mode) appliquer(b.dataset.mode); });
    ecoute(groupe, 'keydown', (ev) => {
      const i = modes.findIndex((b) => b.dataset.mode === mode);
      const pas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
      if (pas === undefined && !['Home', 'End'].includes(ev.key)) return;
      ev.preventDefault();
      const j = ev.key === 'Home' ? 0 : ev.key === 'End' ? modes.length - 1 : (i + pas + modes.length) % modes.length;
      appliquer(modes[j].dataset.mode); modes[j].focus();
    });
  }

  /* Première apparition : les prix roulent depuis 0, une fois (jamais en mode calme). */
  let io = null;
  if (o.rouler && !s.calme && 'IntersectionObserver' in window) {
    root.classList.add('trf--anime');
    io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.classList.add('est-vu');
      const m = e.target.querySelector('.trf__montant');
      if (m) ecrire(m, m.textContent.trim(), '');
    }), { rootMargin: '0px 0px -12% 0px' });
    formules.forEach((f) => io.observe(f));
  }

  /* Choisir : formule et mode dans l'adresse (préremplissage du formulaire), tampon sur la carte. */
  for (const f of formules) {
    const a = f.querySelector('.trf__choisir');
    if (!a) continue;
    const nom = f.dataset.formule || f.querySelector('.trf__nom')?.textContent.trim() || '';
    a.setAttribute('aria-label', `${a.textContent.trim()} : ${nom}`);
    const base = a.getAttribute('href') || '#';
    ecoute(a, 'click', (ev) => {
      const u = new URL(base, location.href);
      u.searchParams.set('formule', nom);
      if (mode) u.searchParams.set('mode', libelleMode());
      formules.forEach((x) => x.classList.toggle('trf__formule--choisie', x === f));
      root.dispatchEvent(new CustomEvent('trf:choix', { bubbles: true, detail: { formule: nom, mode, libelle: libelleMode(), url: u.href } }));
      if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) { a.href = u.href; return; }
      if (u.origin === location.origin && u.pathname === location.pathname) {
        /* Même page (formulaire plus bas) : l'adresse prend formule et mode sans recharger, puis la page descend. */
        ev.preventDefault();
        history.replaceState(history.state, '', u.search + u.hash);
        const cible = u.hash.length > 1 ? document.getElementById(decodeURIComponent(u.hash.slice(1))) : null;
        setTimeout(() => cible?.scrollIntoView({ behavior: s.calme ? 'auto' : 'smooth', block: 'start' }), s.calme ? 0 : 380);
      } else a.href = u.origin === location.origin ? u.pathname + u.search + u.hash : u.href; /* autre page : navigation normale (voile du socle de la skill) */
    });
  }

  return {
    mode: (m) => (m === undefined ? mode : appliquer(m)),
    detruire() { io?.disconnect(); nettoyer.forEach((fn) => fn()); },
  };
}
