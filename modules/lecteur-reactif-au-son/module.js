// Lecteur réactif au son : liste d'extraits, lecture/pause, précédent/suivant, position et temps, avec des commandes natives
// (boutons, curseur range). Le visuel (halo, braises, onde en arc, barres) suit la musique en direct via Web Audio (AnalyserNode :
// basses, médiums, volume). Aucun son au chargement : l'AudioContext n'est créé qu'au premier clic de lecture.
// Sans Web Audio (ou si l'analyse reste muette, fichier d'une autre origine), le visuel suit une animation douce ;
// en mode calme ou « réduire les animations », il est dessiné une fois et reste figé.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.lrs
 * @param {object} [options]
 * @param {string[]} [options.visuel=['halo','braises','onde','barres']]  couches visuelles actives
 * @param {number} [options.braises=120]          braises au maximum (ordinateur)
 * @param {number} [options.braisesTelephone=60]  braises au maximum sous 700 px
 * @param {number} [options.sensibilite=1]        multiplie la réaction au son (0,5 à 2)
 * @param {boolean} [options.enchainer=false]     passer à l'extrait suivant à la fin
 * @param {number} [options.fft=512]              taille de l'analyse (puissance de 2)
 */
export async function init(root, options = {}) {
  const o = { visuel: ['halo', 'braises', 'onde', 'barres'], braises: 120, braisesTelephone: 60, sensibilite: 1, enchainer: false, fft: 512, ...options };
  const s = await pret([]);
  const $ = sel => root.querySelector(sel);
  const pistes = [...root.querySelectorAll('.lrs__piste')];
  const audio = $('.lrs__audio') || root.appendChild(Object.assign(document.createElement('audio'), { preload: 'none', className: 'lrs__audio' }));
  audio.preload = 'none';
  const bLecture = $('[data-lrs="lecture"]'), bPrec = $('[data-lrs="precedente"]'), bSuiv = $('[data-lrs="suivante"]');
  const position = $('[data-lrs="position"]'), temps = $('[data-lrs="temps"]'), titre = $('[data-lrs="titre"]'), etat = $('[data-lrs="etat"]');
  const barres = [...root.querySelectorAll('.lrs__barres i')];
  const scene = $('.lrs__scene'), canvas = $('.lrs__canvas');
  const couches = new Set(o.visuel);
  const nomDe = li => li.querySelector('.lrs__titre')?.textContent.trim() || 'Extrait';
  const mmss = v => { v = Math.max(0, Math.floor(v || 0)); return Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0'); };
  const ecouteurs = [];
  const ecoute = (cible, type, fn, opt) => { cible.addEventListener(type, fn, opt); ecouteurs.push(() => cible.removeEventListener(type, fn, opt)); };

  // ---------- Lecteur ----------
  let courant = -1;
  const enLecture = () => !audio.paused && !audio.ended;
  function jouer(i) {
    if (i < 0 || i >= pistes.length) return;
    if (i === courant) { if (enLecture()) audio.pause(); else lancer(); return; }
    courant = i;
    audio.src = new URL(pistes[i].dataset.src, document.baseURI).href;
    audio.load();
    lancer();
  }
  function lancer() {
    graphe();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    audio.play().catch(err => { if (err.name !== 'AbortError') annoncer('Lecture impossible.'); ui(); });
  }
  const annoncer = txt => { if (etat) etat.textContent = txt; };
  function ui() {
    const joue = enLecture();
    pistes.forEach((li, k) => {
      const on = k === courant && joue;
      li.classList.toggle('est-en-lecture', on);
      li.classList.toggle('est-courante', k === courant);
      const b = li.querySelector('.lrs__jouer');
      b?.setAttribute('aria-pressed', String(on));
      b?.setAttribute('aria-label', (on ? 'Mettre en pause ' : 'Écouter ') + nomDe(li));
    });
    if (bLecture) { bLecture.classList.toggle('est-en-lecture', joue); bLecture.setAttribute('aria-label', joue ? 'Pause' : 'Lecture'); }
    if (titre) titre.textContent = courant >= 0 ? nomDe(pistes[courant]) : 'Aucun extrait';
    if (position) position.disabled = courant < 0;
    root.classList.toggle('est-en-lecture', joue);
  }
  function progression() {
    const d = audio.duration, t = audio.currentTime;
    const p = d && isFinite(d) ? t / d : 0;
    if (courant >= 0) {
      pistes[courant].querySelector('.lrs__fil i')?.style.setProperty('--p', p.toFixed(4));
      if (d && isFinite(d)) { const du = pistes[courant].querySelector('.lrs__duree'); if (du) du.textContent = mmss(d); }
    }
    if (temps) temps.textContent = mmss(t) + ' / ' + mmss(isFinite(d) ? d : 0);
    if (position && !position.matches(':active')) { position.value = String((p * 100).toFixed(1)); position.setAttribute('aria-valuetext', mmss(t) + ' sur ' + mmss(isFinite(d) ? d : 0)); }
  }
  pistes.forEach((li, k) => { const b = li.querySelector('.lrs__jouer'); if (b) ecoute(b, 'click', () => jouer(k)); });
  if (bLecture) ecoute(bLecture, 'click', () => jouer(courant < 0 ? 0 : courant));
  if (bPrec) ecoute(bPrec, 'click', () => { if (courant > 0 && audio.currentTime > 2) { audio.currentTime = 0; return; } jouer(courant <= 0 ? pistes.length - 1 : courant - 1); });
  if (bSuiv) ecoute(bSuiv, 'click', () => jouer((courant + 1) % pistes.length));
  if (position) ecoute(position, 'input', () => { const d = audio.duration; if (d && isFinite(d)) audio.currentTime = (+position.value / 100) * d; progression(); });
  ecoute(audio, 'play', () => { ui(); annoncer('Lecture : ' + nomDe(pistes[courant])); });
  ecoute(audio, 'pause', () => { ui(); if (!audio.ended) annoncer('Pause'); });
  ecoute(audio, 'ended', () => { ui(); progression(); if (o.enchainer && courant < pistes.length - 1) jouer(courant + 1); else annoncer('Extrait terminé'); });
  ecoute(audio, 'timeupdate', progression);
  ecoute(audio, 'loadedmetadata', progression);
  ecoute(audio, 'error', () => { if (audio.getAttribute('src')) { annoncer('Extrait indisponible.'); ui(); } });
  ui(); progression();

  // ---------- Web Audio (créé au premier clic, jamais avant) ----------
  let ctx = null, an = null, freq = null, onde = null, muet = 0;
  function graphe() {
    if (ctx || graphe.echec) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { graphe.echec = true; return; }
    try {
      ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      an = ctx.createAnalyser(); an.fftSize = o.fft; an.smoothingTimeConstant = .78; an.minDecibels = -85; an.maxDecibels = -12;
      src.connect(an); an.connect(ctx.destination);
      freq = new Uint8Array(an.frequencyBinCount); onde = new Uint8Array(an.fftSize);
    } catch { graphe.echec = true; try { ctx?.close(); } catch {} ctx = null; an = null; }
  }

  // Niveaux : réels si l'analyse répond, sinon animation douce (plus vive pendant la lecture).
  const N_ARC = 48;
  const spectre = new Float32Array(N_ARC);
  let basse = 0, medium = 0, volume = 0, energie = .15, moyBasse = -1, etaitReel = false;
  function niveaux(t) {
    const joue = enLecture();
    let reel = false;
    if (an && joue) {
      an.getByteFrequencyData(freq);
      let somme = 0; for (let k = 0; k < freq.length; k++) somme += freq[k];
      muet = somme === 0 ? muet + 1 : 0;
      if (muet && muet < 40) return; // tampon pas encore rempli : on garde l'état
      if (!muet) {
        reel = true;
        const bin = ctx.sampleRate / o.fft; // Hz par case
        const kB = Math.max(2, Math.round(250 / bin)), kM = Math.max(kB + 2, Math.round(3000 / bin));
        let b = 0, m = 0; for (let k = 1; k <= kB; k++) b += freq[k]; for (let k = kB + 1; k <= kM; k++) m += freq[k];
        basse = b / (kB * 255); medium = m / ((kM - kB) * 255);
        an.getByteTimeDomainData(onde);
        let q = 0; for (let k = 0; k < onde.length; k++) { const v = (onde[k] - 128) / 128; q += v * v; }
        volume = Math.min(1, Math.sqrt(q / onde.length) * 3.2);
        // Arc symétrique : basses au sommet, aigus sur les bords.
        const mi = (N_ARC - 1) / 2;
        for (let i = 0; i < N_ARC; i++) spectre[i] += (freq[1 + Math.round(Math.abs(i - mi) / mi * (kM - 1))] / 255 - spectre[i]) * .5;
      }
    }
    if (!reel) {
      const a = joue ? .5 : .16, ts = t / 1000;
      basse = a * (.55 + .45 * Math.sin(ts * (joue ? 3.1 : 1.1)) ** 2);
      medium = a * (.5 + .3 * Math.sin(ts * 1.7 + 1));
      volume = a * (.7 + .3 * Math.sin(ts * .9));
      for (let i = 0; i < N_ARC; i++) spectre[i] += ((a * .9) * (.45 + .35 * Math.sin(i * .42 + ts * 1.6) + .2 * Math.sin(i * 1.3 - ts * 2.3)) - spectre[i]) * .08;
    }
    // Pulsation : basse au-dessus de sa moyenne glissante. Montée rapide, retombée lente : jamais de clignotement.
    if (reel !== etaitReel) { moyBasse = -1; etaitReel = reel; }
    if (moyBasse < 0) moyBasse = basse;
    moyBasse = moyBasse * .97 + basse * .03;
    const pulse = Math.min(1, Math.max(0, basse - moyBasse) / Math.max(moyBasse, .12));
    const cible = Math.min(1, (.08 + volume * .55 + pulse * .6 + medium * .15) * o.sensibilite);
    energie += (cible - energie) * (cible > energie ? .2 : .045);
  }

  // ---------- Dessin ----------
  const c2d = canvas?.getContext('2d');
  const sonde = document.createElement('span'); sonde.hidden = true; root.appendChild(sonde);
  const couleur = v => { sonde.style.color = `var(${v})`; return getComputedStyle(sonde).color; };
  let accent = '', secondaire = '', texte = '';
  const lireCouleurs = () => { accent = couleur('--couleur-accent'); secondaire = couleur('--couleur-secondaire'); texte = couleur('--couleur-texte'); };
  lireCouleurs();
  let W = 1, H = 1, dpr = 1;
  const max = () => (s.telephone ? o.braisesTelephone : o.braises);
  const braises = [];
  const nouvelle = (y) => ({ x: W * (.5 + (Math.random() - .5) * .34), y: y ?? H * (.8 + Math.random() * .06), vx: (Math.random() - .5) * .3, vie: 0, duree: 2.2 + Math.random() * 2.6, taille: .8 + Math.random() ** 2 * 2.6, graine: Math.random() * 100 });
  function dessiner(t, dt) {
    if (!c2d) return;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    c2d.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * .62, R = Math.min(W, H);
    if (couches.has('onde')) {
      c2d.lineCap = 'round'; c2d.strokeStyle = accent; c2d.lineWidth = Math.max(1.2, R / 320);
      c2d.shadowColor = accent; c2d.shadowBlur = 8;
      const r0 = R * .27;
      c2d.globalAlpha = .4 + energie * .45;
      c2d.beginPath();
      for (let i = 0; i < N_ARC; i++) {
        const a = Math.PI * (1.06 + (i / (N_ARC - 1)) * .88), v = spectre[i];
        const r1 = r0 + R * (.012 + v * .17);
        c2d.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c2d.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      }
      c2d.stroke(); c2d.shadowBlur = 0;
    }
    if (couches.has('braises')) {
      const ds = dt / 1000;
      const voulu = Math.round(max() * (.25 + energie * .75));
      if (braises.length < voulu && Math.random() < .5 + energie) braises.push(nouvelle());
      c2d.globalCompositeOperation = 'lighter';
      for (let k = braises.length - 1; k >= 0; k--) {
        const b = braises[k];
        b.vie += ds / b.duree;
        if (b.vie >= 1) { if (braises.length > voulu) braises.splice(k, 1); else braises[k] = nouvelle(); continue; }
        const vitesse = R * (.05 + energie * .13);
        b.y -= vitesse * ds * (1 + b.taille * .15);
        b.x += (b.vx + Math.sin(t / 900 + b.graine) * .35) * R * .02 * ds * 4;
        const fondu = Math.min(1, b.vie * 12) * (1 - b.vie);
        const taille = b.taille * (1 + energie * .5) * (R / 700 + .5);
        c2d.globalAlpha = fondu * (.16 + energie * .22);
        c2d.fillStyle = b.vie < .4 ? accent : secondaire;
        c2d.beginPath(); c2d.arc(b.x, b.y, taille * 2.2, 0, Math.PI * 2); c2d.fill();
        c2d.globalAlpha = fondu * (.7 + energie * .3); c2d.fillStyle = b.vie < .25 ? texte : accent;
        c2d.beginPath(); c2d.arc(b.x, b.y, taille * .75, 0, Math.PI * 2); c2d.fill();
      }
      c2d.globalCompositeOperation = 'source-over';
    }
    c2d.globalAlpha = 1;
  }
  function appliquer() {
    if (couches.has('halo')) { root.style.setProperty('--niveau', energie.toFixed(3)); root.style.setProperty('--basse', Math.min(1, basse * 1.2).toFixed(3)); }
    if (couches.has('barres')) barres.forEach((b, i) => { const v = i < 2 ? basse : i < 4 ? medium : volume; const f = enLecture() ? v : .1; b.style.transform = `scaleY(${(.12 + Math.min(1, f * (1.4 + i * .15)) * .88).toFixed(3)})`; });
  }
  function figer() {
    // État figé : spectre en cloche, braises posées à différentes hauteurs, halo moyen (CSS).
    energie = .45;
    for (let i = 0; i < N_ARC; i++) spectre[i] = .18 + .32 * Math.sin(Math.PI * i / (N_ARC - 1)) * (.7 + .3 * Math.sin(i * 1.7));
    braises.length = 0;
    for (let k = 0; k < Math.round(max() * .5); k++) { const b = nouvelle(); b.vie = Math.random() * .85; b.y = H * (.82 - b.vie * .7); braises.push(b); }
    dessiner(0, 0);
  }
  function dimensionner() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2); W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    braises.length = 0;
    if (s.calme) figer();
  }
  const ro = new ResizeObserver(dimensionner); if (scene) ro.observe(scene);
  dimensionner();

  let anim = null;
  if (s.calme) figer();
  else if (scene) anim = s.boucle(scene, (t, dt) => { niveaux(t); appliquer(); dessiner(t, dt); if (enLecture()) progression(); });

  return {
    detruire() {
      anim?.arreter(); ro.disconnect(); ecouteurs.forEach(f => f()); audio.pause(); sonde.remove();
      try { ctx?.close(); } catch {}
      root.style.removeProperty('--niveau'); root.style.removeProperty('--basse'); barres.forEach(b => b.style.removeProperty('transform'));
    },
  };
}
