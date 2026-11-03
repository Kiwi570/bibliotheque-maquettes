// Mur de portraits : des dizaines à des centaines de vignettes en grille dense, qui s'allument par vagues au défilement,
// grossissent en loupe sous le pointeur (nom affiché), se filtrent par groupe ou par recherche (Flip), et ouvrent
// une fiche dans un <dialog> natif (précédent, suivant, Échap). Vignettes générées en CSS (initiales, silhouette, dégradé)
// tant qu'aucune photo n'est fournie ; les photos ne reçoivent leur src qu'à l'approche de l'écran (jamais dans le LCP).
import { pret } from '../../socle/socle.js';

/**
 * Données : options.portraits, sinon le JSON de <script type="application/json" data-portraits> placé dans root.
 * Un portrait : { nom, role?, groupe?, texte?, initiales?, vignette?, image?, position? }
 *   vignette : petite photo de la grille (3:4, ~320 px) ; image : grande photo de la fiche (3:4, ~1000 px) ;
 *   position : object-position des photos ('50% 30%').
 * @param {HTMLElement} root  section.mdp (contient .mdp__grille, et facultativement .mdp__outils)
 * @param {object} [options]
 * @param {object[]} [options.portraits]               liste des portraits
 * @param {string[]} [options.groupes]                 ordre des boutons de groupe (par défaut : ordre d'apparition)
 * @param {string}   [options.tous='Tous']             libellé du bouton sans filtre
 * @param {[string,string]} [options.mots=['portrait','portraits']]  singulier et pluriel du compteur
 * @param {number}   [options.loupe=1.6]               agrandissement maximal sous le pointeur (souris), 0 pour couper
 * @param {number}   [options.rayon=2.4]               portée de la loupe, en largeurs de vignette
 * @param {number}   [options.cascade=22]              décalage en ms entre deux vignettes qui apparaissent ensemble
 * @param {number}   [options.duree=.5]                durée du Flip au filtrage, en s
 * @param {object}   [options.textes]                  { fermer, precedent, suivant }
 */
export async function init(root, options = {}) {
  const textes = { fermer: 'Fermer la fiche', precedent: 'Précédent', suivant: 'Suivant', ...(options.textes || {}) };
  const o = { tous: 'Tous', mots: ['portrait', 'portraits'], loupe: 1.6, rayon: 2.4, cascade: 22, duree: .5, ...options, textes };
  const s = await pret(['flip']);
  const { gsap, Flip } = s;
  const grille = root.querySelector('.mdp__grille');
  if (!grille) return { detruire() {} };
  let donnees = o.portraits;
  if (!donnees) { try { donnees = JSON.parse(root.querySelector('script[data-portraits]')?.textContent || '[]'); } catch { donnees = []; } }
  const calme = s.calme;
  const anime = !calme;
  const sansAccent = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const hache = t => { let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const initiales = p => p.initiales || p.nom.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(m => m[0]).join('').toUpperCase();
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };

  // ---------- Vignettes ----------
  // Visuel généré : teinte (mélange accent/secondaire), profondeur, forme ; le tout en variables, couleurs dans module.css.
  const visuel = (p, classe) => {
    const h = hache(p.nom);
    const v = document.createElement('span');
    v.className = 'mdp__visuel ' + classe;
    v.setAttribute('aria-hidden', 'true');
    v.dataset.forme = String(h % 4);
    v.style.setProperty('--a', String(h % 101));
    v.style.setProperty('--l', String(38 + (h >> 8) % 46));
    const i = document.createElement('span'); i.className = 'mdp__init'; i.textContent = initiales(p);
    v.appendChild(i);
    return v;
  };
  const photo = (url, p, classe, eager) => {
    const im = document.createElement('img');
    im.className = classe; im.alt = ''; im.decoding = 'async'; im.width = 300; im.height = 400;
    if (!eager) { im.loading = 'lazy'; im.setAttribute('fetchpriority', 'low'); im.dataset.src = url; } else im.src = url;
    if (p.position) im.style.objectPosition = p.position;
    im.addEventListener('error', () => im.remove(), { once: true });
    return im;
  };

  const frag = document.createDocumentFragment();
  const cases = donnees.map((p, i) => {
    const li = document.createElement('li');
    li.className = 'mdp__case';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mdp__carte'; b.tabIndex = i === 0 ? 0 : -1;
    b.setAttribute('aria-label', [p.nom, p.role].filter(Boolean).join(', '));
    b.dataset.index = String(i);
    const corps = document.createElement('span'); corps.className = 'mdp__corps';
    const vis = visuel(p, '');
    if (p.vignette || p.image) vis.appendChild(photo(p.vignette || p.image, p, 'mdp__photo'));
    const nom = document.createElement('span'); nom.className = 'mdp__nom'; nom.setAttribute('aria-hidden', 'true'); nom.textContent = p.nom;
    corps.append(vis, nom); b.appendChild(corps); li.appendChild(b); frag.appendChild(li);
    return { p, li, b, vis, cle: sansAccent([p.nom, p.role, p.groupe, p.texte].join(' ')) };
  });
  grille.textContent = '';
  grille.appendChild(frag);
  if (anime) root.classList.add('mdp--anime');

  // Apparition par vagues : chaque lot qui entre dans l'écran s'allume en cascade.
  const ioVu = new IntersectionObserver(entrees => {
    let k = 0;
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.style.setProperty('--d', String(Math.min(700, k++ * o.cascade)));
      e.target.classList.add('est-vu'); ioVu.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -30px 0px' });
  if (anime) for (const c of cases) ioVu.observe(c.b);
  // Photos : src posée à l'approche seulement.
  const ioPhoto = new IntersectionObserver(entrees => {
    for (const e of entrees) if (e.isIntersecting) { const im = e.target.querySelector('img[data-src]'); if (im) { im.src = im.dataset.src; delete im.dataset.src; } ioPhoto.unobserve(e.target); }
  }, { rootMargin: '600px 0px' });
  for (const c of cases) if (c.p.vignette || c.p.image) ioPhoto.observe(c.b);

  // ---------- Filtres et recherche ----------
  const outils = root.querySelector('.mdp__outils');
  const champ = root.querySelector('.mdp__recherche input');
  const zoneFiltres = root.querySelector('.mdp__filtres');
  const compte = root.querySelector('[data-compte]');
  const vide = root.querySelector('.mdp__vide');
  const groupes = o.groupes || [...new Set(donnees.map(p => p.groupe).filter(Boolean))];
  const etat = { groupe: '', texte: '' };
  if (zoneFiltres && groupes.length > 1) {
    for (const g of ['', ...groupes]) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mdp__filtre'; b.dataset.groupe = g; b.textContent = g || o.tous;
      b.setAttribute('aria-pressed', String(g === ''));
      zoneFiltres.appendChild(b);
    }
  }
  let visibles = cases.slice();
  let flip = null;
  const ecrireCompte = n => { if (compte) compte.textContent = `${n} ${n > 1 ? o.mots[1] : o.mots[0]}`; };
  function appliquer() {
    const mots = sansAccent(etat.texte).split(/\s+/).filter(Boolean);
    const ok = c => (!etat.groupe || c.p.groupe === etat.groupe) && mots.every(m => c.cle.includes(m));
    const avant = anime ? Flip.getState(cases.filter(c => !c.li.hidden).map(c => c.li)) : null;
    flip?.progress(1); flip?.kill(); flip = null;
    visibles = [];
    for (const c of cases) { const v = ok(c); c.li.hidden = !v; if (v) visibles.push(c); }
    if (vide) vide.hidden = visibles.length > 0;
    ecrireCompte(visibles.length);
    for (const b of zoneFiltres?.querySelectorAll('.mdp__filtre') || []) b.setAttribute('aria-pressed', String(b.dataset.groupe === etat.groupe));
    // Le parcours au clavier reste sur une vignette visible.
    if (!visibles.some(c => c.b.tabIndex === 0)) { for (const c of cases) c.b.tabIndex = -1; if (visibles[0]) visibles[0].b.tabIndex = 0; }
    // Si le haut du mur est passé, on y remonte pour montrer le résultat.
    const haut = grille.getBoundingClientRect().top;
    const limite = (outils?.getBoundingClientRect().bottom || 0) + 8;
    if (haut < limite - 4) scrollBy({ top: haut - limite, behavior: anime ? 'smooth' : 'auto' });
    if (avant) {
      flip = Flip.from(avant, {
        duration: o.duree, ease: 'power2.inOut', absolute: false, nested: false, prune: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: o.duree, clearProps: 'opacity,transform' }),
        onComplete: mesurer,
      });
    } else mesurer();
  }
  let minuteur = 0;
  if (champ) ecoute(champ, 'input', () => { clearTimeout(minuteur); minuteur = setTimeout(() => { etat.texte = champ.value; appliquer(); }, 160); });
  if (champ) ecoute(champ.form || champ, 'submit', e => e.preventDefault());
  if (zoneFiltres) ecoute(zoneFiltres, 'click', e => { const b = e.target.closest('.mdp__filtre'); if (!b) return; etat.groupe = b.dataset.groupe; appliquer(); });
  if (vide) ecoute(vide, 'click', e => { if (!e.target.closest('[data-tout]')) return; etat.groupe = ''; etat.texte = ''; if (champ) champ.value = ''; appliquer(); });
  ecrireCompte(cases.length);

  // ---------- Loupe sous le pointeur (souris seulement, pas en mode calme) ----------
  let positions = [];
  let actifs = new Set();
  function mesurer() {
    const lg = grille.clientWidth;
    positions = visibles.map(c => ({ c, x: c.li.offsetLeft + c.li.offsetWidth / 2, y: c.li.offsetTop + c.li.offsetHeight / 2, w: c.li.offsetWidth }));
    for (const q of positions) q.c.li.dataset.bord = q.x < q.w * 1.2 ? 'g' : q.x > lg - q.w * 1.2 ? 'd' : '';
  }
  const ro = new ResizeObserver(() => mesurer());
  ro.observe(grille);
  const loupe = o.loupe > 1 && anime && s.souris;
  let attente = 0, px = 0, py = 0;
  const relacher = () => { for (const c of actifs) { c.vis.style.removeProperty('--k'); c.li.style.removeProperty('z-index'); } actifs = new Set(); };
  const grossir = () => {
    attente = 0;
    const w = positions[0]?.w || 80; const R = w * o.rayon; const neufs = new Set();
    for (const q of positions) {
      const dx = q.x - px, dy = q.y - py; if (Math.abs(dx) > R || Math.abs(dy) > R) continue;
      const d = Math.hypot(dx, dy); if (d >= R) continue;
      const k = 1 + (o.loupe - 1) * (1 - d / R) ** 2;
      q.c.vis.style.setProperty('--k', k.toFixed(3)); q.c.li.style.zIndex = String(Math.round(k * 10));
      neufs.add(q.c);
    }
    for (const c of actifs) if (!neufs.has(c)) { c.vis.style.removeProperty('--k'); c.li.style.removeProperty('z-index'); }
    actifs = neufs;
  };
  if (loupe) {
    root.classList.add('mdp--loupe');
    ecoute(grille, 'pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = grille.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top;
      if (!attente) attente = requestAnimationFrame(grossir);
    });
    ecoute(grille, 'pointerleave', () => { cancelAnimationFrame(attente); attente = 0; relacher(); });
  }

  // ---------- Clavier : un seul arrêt de tabulation, flèches pour parcourir ----------
  const colonnes = () => getComputedStyle(grille).gridTemplateColumns.split(' ').length || 1;
  ecoute(grille, 'keydown', e => {
    const b = e.target.closest('.mdp__carte'); if (!b) return;
    const i = visibles.findIndex(c => c.b === b); if (i < 0) return;
    const n = colonnes();
    const pas = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: n, ArrowUp: -n, Home: -i, End: visibles.length - 1 - i }[e.key];
    if (pas === undefined) return;
    const j = Math.max(0, Math.min(visibles.length - 1, i + pas));
    e.preventDefault();
    b.tabIndex = -1; visibles[j].b.tabIndex = 0; visibles[j].b.focus();
  });

  // ---------- Fiche (dialog natif) ----------
  const uid = 'mdp-' + Math.random().toString(36).slice(2, 7);
  const dlg = document.createElement('dialog');
  dlg.className = 'mdp__fiche';
  dlg.setAttribute('aria-labelledby', uid + '-nom');
  dlg.innerHTML = `<div class="mdp__fiche-cadre">
    <div class="mdp__fiche-image" data-image></div>
    <div class="mdp__fiche-texte">
      <p class="socle-surtitre" data-groupe></p>
      <h3 class="mdp__fiche-nom" id="${uid}-nom"></h3>
      <p class="mdp__fiche-role" data-role></p>
      <p class="mdp__fiche-desc" data-texte></p>
      <div class="mdp__fiche-nav">
        <button type="button" class="mdp__fiche-bouton" data-prec></button>
        <p class="mdp__fiche-pos" data-pos aria-live="polite"></p>
        <button type="button" class="mdp__fiche-bouton" data-suiv></button>
      </div>
    </div>
    <form method="dialog" class="mdp__fiche-fermer"><button type="submit" aria-label=""><span aria-hidden="true">×</span></button></form>
  </div>`;
  dlg.querySelector('[data-prec]').textContent = o.textes.precedent;
  dlg.querySelector('[data-suiv]').textContent = o.textes.suivant;
  dlg.querySelector('.mdp__fiche-fermer button').setAttribute('aria-label', o.textes.fermer);
  root.appendChild(dlg);
  let courant = -1;
  function montrer(j) {
    if (!visibles.length) return;
    courant = (j + visibles.length) % visibles.length;
    const { p } = visibles[courant];
    const zone = dlg.querySelector('[data-image]');
    zone.textContent = '';
    const v = visuel(p, 'mdp__visuel--grand');
    if (p.image || p.vignette) v.appendChild(photo(p.image || p.vignette, p, 'mdp__fiche-photo', true));
    zone.appendChild(v);
    const remplir = (sel, t) => { const el = dlg.querySelector(sel); el.textContent = t || ''; el.hidden = !t; };
    remplir('[data-groupe]', p.groupe); remplir('[data-role]', p.role); remplir('[data-texte]', p.texte);
    dlg.querySelector('.mdp__fiche-nom').textContent = p.nom;
    dlg.querySelector('[data-pos]').textContent = `${courant + 1} / ${visibles.length}`;
    const seul = visibles.length < 2;
    dlg.querySelector('[data-prec]').hidden = seul; dlg.querySelector('[data-suiv]').hidden = seul;
  }
  ecoute(grille, 'click', e => {
    const b = e.target.closest('.mdp__carte'); if (!b) return;
    const j = visibles.findIndex(c => c.b === b); if (j < 0) return;
    for (const c of cases) c.b.tabIndex = -1; b.tabIndex = 0;
    relacher(); montrer(j); dlg.showModal();
  });
  ecoute(dlg, 'click', e => {
    if (e.target === dlg) dlg.close(); // clic sur le fond
    else if (e.target.closest('[data-prec]')) montrer(courant - 1);
    else if (e.target.closest('[data-suiv]')) montrer(courant + 1);
  });
  ecoute(dlg, 'keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); montrer(courant - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); montrer(courant + 1); }
  });
  ecoute(dlg, 'close', () => {
    // Retour sur la vignette de la dernière fiche vue.
    const c = visibles[courant]; if (!c) return;
    for (const x of cases) x.b.tabIndex = -1; c.b.tabIndex = 0; c.b.focus({ preventScroll: false });
  });

  mesurer();
  s.rafraichir();
  return {
    detruire() {
      clearTimeout(minuteur); cancelAnimationFrame(attente); flip?.kill();
      ioVu.disconnect(); ioPhoto.disconnect(); ro.disconnect();
      nettoyer.forEach(f => f());
      if (dlg.open) dlg.close(); dlg.remove();
      zoneFiltres?.querySelectorAll('.mdp__filtre').forEach(b => b.remove());
      root.classList.remove('mdp--anime', 'mdp--loupe');
      grille.textContent = '';
    },
  };
}
