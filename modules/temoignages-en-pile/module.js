// Témoignages en pile : de vrais avis, écrits dans la page (lisibles sans JavaScript), empilés comme des fiches.
// On attrape la fiche du dessus et on la lance (souris ou doigt, avec son élan) : elle part puis se glisse sous la pile ;
// relâchée trop tôt, elle revient. Flèches, touches gauche et droite, compteur « 2 / 6 ». Les fiches cachées sont inertes.
// Grille wouahou, point 1 : l'effet se manipule. En mode calme : les flèches seulement, sans vol ni inclinaison.
import { pret } from '../../socle/socle.js';

/**
 * Une fiche : <li class="tep__carte"><blockquote class="tep__citation"><p>…</p></blockquote>
 *   <p class="tep__auteur"><span class="tep__nom">Claire M.</span> <span class="tep__contexte">Stage, mars 2026</span></p>
 *   <p class="tep__note" data-note="5">5 sur 5</p>   (facultatif : étoiles dessinées par le module)
 *   <p class="tep__source">Avis Google</p></li>       (facultatif)
 * Commandes (facultatives, créées si absentes) : .tep__commandes > button.tep__prec, p.tep__compte, button.tep__suiv
 * @param {HTMLElement} root  section.tep (contient ol.tep__pile)
 * @param {object} [options]
 * @param {number} [options.visibles=3]   fiches visibles dans l'épaisseur de la pile
 * @param {number} [options.seuil=.28]    part de la largeur à dépasser pour lancer la fiche (ou une vitesse de 0,5 px/ms)
 * @param {object} [options.textes]       { precedent, suivant, compte(i, n) }
 */
export async function init(root, options = {}) {
  const T = { precedent: 'Témoignage précédent', suivant: 'Témoignage suivant', compte: (i, n) => `${i} / ${n}`, ...(options.textes || {}) };
  const o = { visibles: 3, seuil: 0.28, ...options };
  const s = await pret([]);
  const pile = root.querySelector('.tep__pile');
  const cartes = pile ? [...pile.querySelectorAll('.tep__carte')] : [];
  if (cartes.length < 2) return { suivant() {}, precedent() {}, detruire() {} };
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };
  const n = cartes.length;

  /* Étoiles (facultatives) : dessinées, la note reste lue en texte. */
  for (const el of root.querySelectorAll('.tep__note[data-note]')) {
    const v = Math.max(0, Math.min(5, parseFloat(el.dataset.note) || 0));
    el.innerHTML = `<span class="tep__etoiles" aria-hidden="true" style="--note:${v}">★★★★★</span><span class="socle-sr">${el.textContent.trim() || `${v} sur 5`}</span>`;
  }

  /* Commandes */
  let cmd = root.querySelector('.tep__commandes');
  if (!cmd) {
    cmd = document.createElement('div'); cmd.className = 'tep__commandes';
    cmd.innerHTML = '<button type="button" class="tep__prec"></button><p class="tep__compte" aria-live="polite"></p><button type="button" class="tep__suiv"></button>';
    pile.after(cmd);
  }
  const bPrec = cmd.querySelector('.tep__prec'), bSuiv = cmd.querySelector('.tep__suiv'), compte = cmd.querySelector('.tep__compte');
  bPrec?.setAttribute('aria-label', T.precedent); bSuiv?.setAttribute('aria-label', T.suivant);
  if (bPrec && !bPrec.innerHTML.trim()) bPrec.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (bSuiv && !bSuiv.innerHTML.trim()) bSuiv.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  root.classList.add('tep--pret');
  if (!s.calme) root.classList.add('tep--anime');

  /* Ordre de la pile : ordre[0] est la fiche du dessus. Chaque fiche reçoit sa profondeur --k et son inclinaison --r. */
  let ordre = cartes.map((_, i) => i);
  let haut = 0; /* numéro (1 à n) de la fiche du dessus, pour le compteur */
  const inclinaison = cartes.map((_, i) => [0, 2.4, -2, 1.4, -1.2][i % 5]);
  function poser() {
    ordre.forEach((idx, k) => {
      const c = cartes[idx];
      c.style.setProperty('--k', String(Math.min(k, o.visibles - 1)));
      c.style.setProperty('--r', String(k === 0 ? 0 : inclinaison[idx]));
      c.style.zIndex = String(n - k);
      c.classList.toggle('tep__carte--dessus', k === 0);
      c.classList.toggle('tep__carte--loin', k >= o.visibles);
      c.inert = k !== 0;
      c.setAttribute('aria-hidden', k === 0 ? 'false' : 'true');
    });
    haut = ordre[0] + 1;
    if (compte) compte.textContent = T.compte(haut, n);
  }
  poser();

  /* Vol d'une fiche : elle part dans la direction donnée, puis se glisse sous la pile. */
  let enVol = false;
  function suivant(direction = -1, depuis = null) {
    if (enVol) return;
    const idx = ordre[0], c = cartes[idx];
    if (s.calme) { ordre = [...ordre.slice(1), idx]; poser(); return; }
    enVol = true;
    const l = pile.getBoundingClientRect().width;
    const dx = direction * (l * 0.9 + 120), dy = depuis ? depuis.dy * 1.5 : 30;
    c.classList.add('tep__carte--vol');
    c.style.transition = 'transform .42s cubic-bezier(.3, .7, .3, 1)';
    c.style.transform = `translate(${dx}px, ${dy}px) rotate(${direction * 16}deg)`;
    const finVol = () => {
      ordre = [...ordre.slice(1), idx];
      poser();
      /* Retour sous la pile : de l'endroit où elle a volé à sa place au fond. La fiche suivante est déjà dessus :
         la pile accepte tout de suite l'action suivante. */
      enVol = false;
      c.style.transition = 'transform .5s cubic-bezier(.2, .7, .2, 1)';
      c.style.transform = '';
      setTimeout(() => { if (!c.classList.contains('tep__carte--tenue')) { c.classList.remove('tep__carte--vol'); c.style.transition = ''; } }, 520);
    };
    setTimeout(finVol, 430);
  }
  function precedent() {
    if (enVol) return;
    const idx = ordre[n - 1], c = cartes[idx];
    ordre = [idx, ...ordre.slice(0, n - 1)];
    if (s.calme) { poser(); return; }
    enVol = true;
    /* La fiche du fond ressort par la droite et vient se poser sur la pile. */
    c.style.transition = 'none';
    c.style.transform = `translate(${pile.getBoundingClientRect().width * 0.9 + 120}px, -20px) rotate(14deg)`;
    c.classList.add('tep__carte--vol');
    poser();
    void c.offsetWidth;
    c.style.transition = 'transform .48s cubic-bezier(.2, .7, .2, 1)';
    c.style.transform = '';
    setTimeout(() => { c.classList.remove('tep__carte--vol'); c.style.transition = ''; enVol = false; }, 500);
  }
  ecoute(bSuiv, 'click', () => suivant(-1));
  ecoute(bPrec, 'click', () => precedent());
  ecoute(root, 'keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); suivant(-1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); precedent(); }
  });

  /* Glisser la fiche du dessus : elle suit le pointeur et s'incline ; lâchée loin ou vite, elle s'envole. */
  if (!s.calme) {
    let prise = null;
    ecoute(pile, 'pointerdown', (e) => {
      const c = e.target.closest('.tep__carte--dessus');
      if (!c || enVol || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.target.closest('a, button')) return;
      prise = { c, x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, dx: 0, dy: 0, id: e.pointerId, bouge: false };
      c.setPointerCapture(e.pointerId);
      c.style.transition = 'none';
    });
    ecoute(pile, 'pointermove', (e) => {
      if (!prise || e.pointerId !== prise.id) return;
      const dx = e.clientX - prise.x, dy = e.clientY - prise.y, t = performance.now();
      if (!prise.bouge && Math.abs(dx) < 6) return;
      prise.bouge = true;
      prise.vx = (dx - prise.dx) / Math.max(1, t - prise.t);
      prise.dx = dx; prise.dy = dy * 0.25; prise.t = t;
      prise.c.style.transform = `translate(${dx}px, ${prise.dy}px) rotate(${dx * 0.045}deg)`;
      prise.c.classList.add('tep__carte--tenue');
    });
    const lacher = (e) => {
      if (!prise || (e && e.pointerId !== prise.id)) return;
      const { c, dx, bouge, t } = prise;
      /* Pointeur arrêté avant de lâcher : plus d'élan. */
      const vx = performance.now() - t > 90 ? 0 : prise.vx;
      prise = null;
      c.classList.remove('tep__carte--tenue');
      const l = pile.getBoundingClientRect().width;
      if (bouge && (Math.abs(dx) > l * o.seuil || Math.abs(vx) > 0.5)) suivant(Math.sign(dx || vx) || -1, { dy: 0 });
      else { c.style.transition = 'transform .35s cubic-bezier(.2, .7, .2, 1)'; c.style.transform = ''; setTimeout(() => { c.style.transition = ''; }, 360); }
    };
    ecoute(pile, 'pointerup', lacher);
    ecoute(pile, 'pointercancel', lacher);
  }

  return {
    suivant: () => suivant(-1),
    precedent,
    detruire() { nettoyer.forEach((f) => f()); },
  };
}
