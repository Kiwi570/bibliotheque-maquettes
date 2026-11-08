// Avant / après : deux photos du même lieu, comparées de deux façons au choix.
// « réglet » : une poignée graduée qu'on glisse ; le vrai curseur (input range) reste l'élément accessible,
//              la séparation suit sa valeur (flèches, Début, Fin), « Avant x %, après y % » lu par les lecteurs d'écran.
// « vitre »  : la photo avant est peinte derrière une vitre embuée (canvas) ; on l'essuie au doigt ou à la souris pour
//              découvrir l'après ; « Tout voir » remplace le geste au clavier ; au-delà d'un seuil, la vitre se dégage seule.
// Plusieurs paires (chantiers) : onglets accessibles, une légende par paire. Au doigt, le défilement vertical reste libre.
// Mode calme : réglet posé au milieu, sans buée ni balayage. Sans JavaScript : les deux photos côte à côte, légendées.
import { pret } from '../../socle/socle.js';

const borne = (v, a, b) => Math.min(b, Math.max(a, v));
const doux = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let nAva = 0;

/** Petite animation sans dépendance : fn(valeur) de a à b ; renvoie { arreter }. */
function tween(a, b, duree, fn, fin) {
  let id = 0; const t0 = performance.now();
  const pas = t => { const k = Math.min(1, (t - t0) / duree); fn(a + (b - a) * doux(k)); if (k < 1) id = requestAnimationFrame(pas); else fin?.(); };
  id = requestAnimationFrame(pas);
  return { arreter() { cancelAnimationFrame(id); } };
}

/**
 * <section class="ava" data-module="avant-apres" data-mode="reglet|vitre" data-onglets>
 *   <div class="ava__onglets" data-ava-onglets></div>              (place réservée des onglets, s'il y a plusieurs paires)
 *   <div class="ava__paires">
 *     <figure class="ava__paire" data-titre="Salle d'eau" [data-mode="vitre"]>
 *       <div class="ava__cadre">
 *         <div class="ava__vue ava__vue--avant"><img … alt="Avant : …"><span class="ava__etiquette">Avant</span></div>
 *         <div class="ava__vue ava__vue--apres"><img … alt="Après : …"><span class="ava__etiquette">Après</span></div>
 *       </div>
 *       <figcaption class="ava__legende">…</figcaption>
 *     </figure> …
 * @param {HTMLElement} root
 * @param {object} [options]
 * @param {'reglet'|'vitre'} [options.mode]  par défaut data-mode de la section (une paire peut avoir le sien), sinon « reglet »
 * @param {number} [options.depart=50]       position du réglet au repos (%)
 * @param {boolean} [options.balayage=true]  à l'entrée dans l'écran, la séparation glisse d'elle-même jusqu'au départ
 * @param {number} [options.pinceau=.08]     rayon du chiffon, en fraction de la largeur de la photo
 * @param {boolean} [options.survol=true]    à la souris, la vitre s'essuie au simple passage (sinon bouton enfoncé)
 * @param {number} [options.seuil=.62]       part essuyée à partir de laquelle la vitre se dégage seule (0 : jamais)
 * @param {number} [options.buee=1]          épaisseur de la buée (0,5 légère à 1,5 épaisse)
 * @param {string} [options.voile]           couleur de la buée (rgba), par défaut un blanc bleuté
 */
export async function init(root, options = {}) {
  const s = await pret([]);
  const o = { mode: root.dataset.mode || 'reglet', depart: 50, balayage: true, pinceau: .08, survol: true, seuil: .62, buee: 1, voile: 'rgba(236, 242, 245, .34)', ...options };
  const k = ++nAva;
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };
  const paires = [...root.querySelectorAll('.ava__paire')];
  const annonce = document.createElement('p'); annonce.className = 'socle-sr'; annonce.setAttribute('aria-live', 'polite'); root.appendChild(annonce);
  const dire = t => { annonce.textContent = ''; requestAnimationFrame(() => { annonce.textContent = t; }); };
  root.classList.add('ava--pret');

  const controles = paires.map((p, i) => {
    if (!p.id) p.id = `ava${k}-paire-${i + 1}`;
    const cadre = p.querySelector('.ava__cadre');
    const imgs = [p.querySelector('.ava__vue--avant img'), p.querySelector('.ava__vue--apres img')];
    const w = +imgs[1]?.getAttribute('width'), h = +imgs[1]?.getAttribute('height');
    if (w && h && !cadre.style.getPropertyValue('--ratio')) cadre.style.setProperty('--ratio', `${w} / ${h}`);
    const titre = p.dataset.titre || p.querySelector('.ava__legende b, .ava__legende strong')?.textContent.trim() || `Chantier ${i + 1}`;
    const mode = s.calme ? 'reglet' : (p.dataset.mode || o.mode);
    p.dataset.modeActif = mode;
    return mode === 'vitre' ? vitre(p, cadre, imgs, titre) : reglet(p, cadre, titre);
  });

  /* ---------- Réglet ---------- */
  function reglet(p, cadre, titre) {
    const curseur = document.createElement('input');
    Object.assign(curseur, { type: 'range', min: 0, max: 100, step: 1, className: 'ava__curseur' });
    curseur.setAttribute('aria-label', `Comparer avant et après : ${titre}`);
    const regle = document.createElement('div'); regle.className = 'ava__regle'; regle.setAttribute('aria-hidden', 'true');
    regle.innerHTML = '<span class="ava__graduations"></span><span class="ava__poignee"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 3 12l6 6M15 6l6 6-6 6"/></svg></span>';
    cadre.append(curseur, regle);
    let anim = null, saisie = null, touche = false;
    const poser = (v, depuisCurseur) => {
      v = borne(v, 0, 100);
      cadre.style.setProperty('--pos', v.toFixed(2) + '%');
      if (!depuisCurseur) curseur.value = String(Math.round(v));
      curseur.setAttribute('aria-valuetext', `Avant ${Math.round(v)} %, après ${100 - Math.round(v)} %`);
    };
    const vers = (v, duree = 500) => { anim?.arreter(); const a = parseFloat(cadre.style.getPropertyValue('--pos')) || o.depart; if (s.calme) return poser(v); anim = tween(a, v, duree, poser); };
    poser(o.depart);
    ecoute(curseur, 'input', () => { touche = true; anim?.arreter(); poser(+curseur.value, true); });
    ecoute(curseur, 'keydown', e => {
      const pas = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
      if (pas === undefined) return;
      e.preventDefault(); touche = true; anim?.arreter(); poser(+curseur.value + (e.shiftKey ? pas / 5 : pas));
    });
    const xVers = x => { const r = cadre.getBoundingClientRect(); return (x - r.left) / r.width * 100; };
    ecoute(cadre, 'pointerdown', e => {
      if (e.button > 0 || e.target.closest('button, a')) return;
      saisie = { id: e.pointerId, x: e.clientX, y: e.clientY, actif: e.pointerType === 'mouse' };
      if (saisie.actif) { touche = true; anim?.arreter(); e.preventDefault(); cadre.setPointerCapture(e.pointerId); cadre.classList.add('est-saisi'); poser(xVers(e.clientX)); curseur.focus({ preventScroll: true }); }
    });
    ecoute(cadre, 'pointermove', e => {
      if (!saisie || e.pointerId !== saisie.id) return;
      if (!saisie.actif) {
        const dx = e.clientX - saisie.x, dy = e.clientY - saisie.y;
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { saisie = null; return; } // on défile : on laisse faire
        if (Math.abs(dx) < 6) return;
        saisie.actif = true; touche = true; anim?.arreter(); cadre.setPointerCapture(e.pointerId); cadre.classList.add('est-saisi');
      }
      poser(xVers(e.clientX));
    });
    const lacher = e => {
      if (!saisie || e.pointerId !== saisie.id) return;
      /* Toucher bref sans glisser : la séparation vient au doigt. */
      if (!saisie.actif && e.type === 'pointerup' && Math.hypot(e.clientX - saisie.x, e.clientY - saisie.y) < 8) { touche = true; vers(xVers(e.clientX), 380); }
      saisie = null; cadre.classList.remove('est-saisi');
    };
    ecoute(cadre, 'pointerup', lacher); ecoute(cadre, 'pointercancel', lacher);
    /* Entrée dans l'écran : la séparation part de la droite et glisse jusqu'au départ (une fois). */
    if (o.balayage && !s.calme && 'IntersectionObserver' in window) {
      poser(88);
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; // une paire cachée par les onglets ne croise l'écran qu'une fois choisie
        io.disconnect(); if (!touche) { cadre.classList.add('est-balaye'); anim = tween(88, o.depart, 1500, poser, () => cadre.classList.remove('est-balaye')); }
      }, { threshold: .45 });
      io.observe(cadre); nettoyer.push(() => io.disconnect());
    }
    return { curseur, montrer() {}, arreter() { anim?.arreter(); } };
  }

  /* ---------- Vitre embuée ---------- */
  function vitre(p, cadre, [imgAvant], titre) {
    cadre.style.setProperty('--pos', '100%');
    const cv = document.createElement('canvas'); cv.className = 'ava__vitre'; cv.setAttribute('aria-hidden', 'true');
    const indice = document.createElement('div'); indice.className = 'ava__indice'; indice.setAttribute('aria-hidden', 'true');
    indice.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c3-1 5-6 8-6s3 4 6 3"/><path d="M3 18c4-1 6-4 9-4s4 3 8 2"/></svg><span class="ava__souris">Essuyez la vitre</span><span class="ava__doigt">Frottez la vitre du doigt</span>';
    const bouton = document.createElement('button'); bouton.type = 'button'; bouton.className = 'ava__tout';
    bouton.setAttribute('aria-pressed', 'false'); bouton.textContent = 'Tout voir';
    bouton.setAttribute('aria-label', `Tout voir : la photo après, ${titre}`);
    imgAvant.after(cv); cadre.append(indice, bouton);
    const ctx = cv.getContext('2d');
    const M = 480; const masque = document.createElement('canvas'); const mctx = masque.getContext('2d', { willReadFrequently: true });
    let couche = document.createElement('canvas'), dernier = null, image = 0, ouvert = false, essuye = false, anim = null, mesure = 0;
    const ratio = () => { const r = cadre.getBoundingClientRect(); return r.width / Math.max(1, r.height); };
    const prete = (imgAvant.decode ? imgAvant.decode() : Promise.resolve()).catch(() => {});

    /* Gouttes et coulures : déterministes, pour que la vitre soit la même à chaque visite. */
    let graine = 7; const alea = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
    function couleesInitiales() {
      mctx.globalCompositeOperation = 'source-over'; mctx.clearRect(0, 0, masque.width, masque.height);
      graine = 7; mctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        let x = (.08 + alea() * .84) * masque.width, y = alea() * masque.height * .5; const fin = y + (.2 + alea() * .45) * masque.height;
        mctx.strokeStyle = 'rgba(0,0,0,.42)'; mctx.lineWidth = 1.2 + alea() * 1.4; mctx.beginPath(); mctx.moveTo(x, y);
        while (y < fin) { y += 6 + alea() * 10; x += (alea() - .5) * 3; mctx.lineTo(x, y); }
        mctx.stroke(); mctx.fillStyle = 'rgba(0,0,0,.5)'; mctx.beginPath(); mctx.arc(x, y, mctx.lineWidth * 1.1, 0, 7); mctx.fill();
      }
    }
    function peindreCouche() {
      const w = cv.width, h = cv.height; couche.width = w; couche.height = h;
      const c = couche.getContext('2d'); const img = imgAvant;
      const ir = img.naturalWidth / img.naturalHeight, cr = w / h; let sw, sh, sx, sy;
      if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; } else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) / 2; }
      const d = Math.min(2, devicePixelRatio || 1);
      c.filter = `blur(${(1.6 * o.buee * d).toFixed(1)}px) saturate(.82) brightness(1.04)`;
      c.drawImage(img, sx, sy, sw, sh, -4, -4, w + 8, h + 8);
      c.filter = 'none';
      c.fillStyle = o.voile; c.globalAlpha = Math.min(1, .9 * o.buee); c.fillRect(0, 0, w, h); c.globalAlpha = 1;
      /* Reflet en biais et brume plus épaisse en bas, comme une vitre de salle de bains. */
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(.25, 'rgba(255,255,255,0)'); g.addColorStop(.42, 'rgba(255,255,255,.16)'); g.addColorStop(.5, 'rgba(255,255,255,.05)'); g.addColorStop(.6, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      const b = c.createLinearGradient(0, h * .55, 0, h); b.addColorStop(0, 'rgba(240,245,247,0)'); b.addColorStop(1, `rgba(240,245,247,${(.22 * o.buee).toFixed(2)})`);
      c.fillStyle = b; c.fillRect(0, 0, w, h);
      /* Gouttelettes : un point sombre et un éclat clair. */
      graine = 3; const n = Math.round(w * h / (900 * d * d));
      for (let i = 0; i < n; i++) {
        const x = alea() * w, y = alea() * h, r = (.5 + alea() * alea() * 2.6) * d;
        c.fillStyle = 'rgba(70,80,86,.18)'; c.beginPath(); c.arc(x + r * .3, y + r * .35, r, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x - r * .25, y - r * .3, r * .45, 0, 7); c.fill();
      }
    }
    function rendre() {
      image = 0; const w = cv.width, h = cv.height;
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, w, h); ctx.drawImage(couche, 0, 0);
      ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(masque, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    const demander = () => { if (!image) image = requestAnimationFrame(rendre); };
    function taille() {
      const r = cadre.getBoundingClientRect(); if (!r.width) return;
      const d = Math.min(2, devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      if (masque.width !== M) { masque.width = M; masque.height = Math.round(M / ratio()); couleesInitiales(); if (ouvert) remplir(1); }
      if (cv.width === w && cv.height === h && couche.width === w) return;
      cv.width = w; cv.height = h; peindreCouche(); rendre();
    }
    const remplir = f => { mctx.globalCompositeOperation = 'source-over'; mctx.fillStyle = '#000'; mctx.fillRect(0, 0, masque.width * f, masque.height); };
    /* Le chiffon : disques dégradés le long du geste, dans le masque (coordonnées normalisées). */
    function brosse(x, y) {
      const R = o.pinceau * masque.width; mctx.globalCompositeOperation = 'source-over';
      const a = dernier || { x, y }; const n = Math.max(1, Math.ceil(Math.hypot(x - a.x, y - a.y) * masque.width / (R * .25)));
      for (let i = 1; i <= n; i++) {
        const px = (a.x + (x - a.x) * i / n) * masque.width, py = (a.y + (y - a.y) * i / n) * masque.height;
        const g = mctx.createRadialGradient(px, py, 0, px, py, R);
        g.addColorStop(0, 'rgba(0,0,0,.9)'); g.addColorStop(.55, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g; mctx.beginPath(); mctx.arc(px, py, R, 0, 7); mctx.fill();
      }
      dernier = { x, y }; demander();
      if (!essuye) { essuye = true; cadre.classList.add('est-essuye'); }
      if (o.seuil && !ouvert && performance.now() - mesure > 300) { mesure = performance.now(); if (part() > o.seuil) toutVoir(true); }
    }
    function part() {
      const d = mctx.getImageData(0, 0, masque.width, masque.height).data; let n = 0, t = 0;
      for (let i = 3; i < d.length; i += 64) { t++; if (d[i] > 150) n++; }
      return n / t;
    }
    function toutVoir(voir) {
      anim?.arreter(); ouvert = voir;
      bouton.setAttribute('aria-pressed', String(voir)); bouton.textContent = voir ? 'Remettre la buée' : 'Tout voir';
      bouton.setAttribute('aria-label', voir ? `Remettre la buée sur la photo, ${titre}` : `Tout voir : la photo après, ${titre}`);
      cadre.classList.toggle('est-ouvert', voir);
      if (voir) {
        cadre.classList.add('est-essuye'); essuye = true;
        /* Un coup de raclette de gauche à droite. */
        anim = tween(0, 1, 900, f => { remplir(f); demander(); });
        dire(`Vitre essuyée : ${imgAvant.closest('.ava__paire').querySelector('.ava__vue--apres img')?.alt || 'photo après'}`);
      } else {
        couleesInitiales(); dernier = null; demander(); dire('La buée est revenue : photo avant.');
      }
    }
    ecoute(bouton, 'click', () => toutVoir(!ouvert));
    const point = e => { const r = cadre.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
    ecoute(cadre, 'pointermove', e => {
      if (ouvert || e.target === bouton) return;
      if (e.pointerType === 'mouse' && !o.survol && !e.buttons) { dernier = null; return; }
      const q = point(e); brosse(q.x, q.y);
    });
    ecoute(cadre, 'pointerdown', e => { if (ouvert || e.target === bouton) return; dernier = null; const q = point(e); brosse(q.x, q.y); });
    for (const ev of ['pointerleave', 'pointerup', 'pointercancel']) ecoute(cadre, ev, () => { dernier = null; });
    prete.then(() => {
      if (!imgAvant.naturalWidth) return;
      taille(); cadre.classList.add('est-embue');
      const ro = new ResizeObserver(() => taille()); ro.observe(cadre); nettoyer.push(() => ro.disconnect());
    });
    return { montrer() { taille(); }, arreter() { anim?.arreter(); }, toutVoir };
  }

  /* ---------- Onglets (plusieurs chantiers) ---------- */
  let active = 0;
  const avecOnglets = paires.length > 1 && root.dataset.onglets !== undefined;
  if (avecOnglets) {
    let liste = root.querySelector('[data-ava-onglets]');
    if (!liste) { liste = document.createElement('div'); liste.className = 'ava__onglets'; root.querySelector('.ava__paires')?.before(liste); }
    liste.setAttribute('role', 'tablist'); liste.setAttribute('aria-label', root.dataset.ongletsLibelle || 'Chantiers');
    const onglets = paires.map((p, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ava__onglet'; b.id = `${p.id}-onglet`;
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', p.id);
      const vignette = p.querySelector('.ava__vue--apres img');
      b.innerHTML = `${vignette ? `<img src="${vignette.currentSrc || vignette.src}" alt="" width="56" height="38" loading="lazy" decoding="async">` : ''}<span></span>`;
      b.querySelector('span').textContent = p.dataset.titre || `Chantier ${i + 1}`;
      p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id);
      liste.appendChild(b); return b;
    });
    const choisir = (i, focus) => {
      active = (i + paires.length) % paires.length;
      paires.forEach((p, j) => { p.classList.toggle('est-active', j === active); });
      onglets.forEach((b, j) => { b.setAttribute('aria-selected', String(j === active)); b.tabIndex = j === active ? 0 : -1; });
      if (focus) onglets[active].focus();
      requestAnimationFrame(() => controles[active].montrer());
    };
    onglets.forEach((b, i) => ecoute(b, 'click', () => choisir(i)));
    ecoute(liste, 'keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); choisir(active + d, true); }
      else if (e.key === 'Home') { e.preventDefault(); choisir(0, true); }
      else if (e.key === 'End') { e.preventDefault(); choisir(paires.length - 1, true); }
    });
    choisir(0);
  } else paires.forEach(p => p.classList.add('est-active'));

  return {
    /** Montre la paire i (onglets). */
    aller(i) { root.querySelectorAll('.ava__onglet')[i]?.click(); },
    /** Mode vitre : dévoile (true) ou remet la buée (false) sur la paire active. */
    toutVoir(v = true) { controles[active].toutVoir?.(v); },
    detruire() { nettoyer.forEach(f => f()); controles.forEach(c => c.arreter()); annonce.remove(); root.classList.remove('ava--pret'); },
  };
}
