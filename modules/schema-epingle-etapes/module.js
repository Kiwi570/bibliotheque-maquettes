// Schéma épinglé en étapes : un schéma de principe reste à l'écran pendant que trois à six étapes défilent ;
// chaque étape allume une partie du schéma (calque, flèche, zone, étiquette) et règle une jauge facultative.
// Liaison par data-* : sur une partie, data-see-partie="2 3" (allumée aux étapes 2 et 3) ou data-see-des="3"
// (calque qui apparaît à l'étape 3 et reste) ; sur une étape, data-see-jauge="0–100" et data-see-valeur="texte lu".
// Ordinateur : scène épinglée, étapes empilées, puces de navigation. Téléphone ou petite hauteur : schéma compact
// collé sous l'en-tête (« compact ») ou schéma répété dans chaque étape (« repete »).
// Mode calme et sans JavaScript : liste complète, schéma entièrement allumé, rien ne bouge.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.see
 * @param {object} [options]
 * @param {number} [options.largeurMin=900]   largeur à partir de laquelle la scène s'épingle
 * @param {number} [options.hauteurMin=500]   hauteur d'écran en dessous de laquelle elle ne s'épingle pas
 * @param {number} [options.pas=70]           défilement par étape pendant l'épinglage, en % de la hauteur d'écran
 * @param {'compact'|'repete'} [options.telephone='compact']  présentation hors épinglage
 * @param {string} [options.lecture='55%']    ligne de lecture hors épinglage : une étape s'active en la traversant
 */
export async function init(root, options = {}) {
  const o = { largeurMin: 900, hauteurMin: 500, pas: 70, telephone: 'compact', lecture: '55%', ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const etapes = [...root.querySelectorAll('.see__etape')];
  const schema = root.querySelector('.see__schema');
  const scene = root.querySelector('.see__scene');
  const n = etapes.length;
  if (!n || !schema || !scene) return { detruire() {} };

  // Valeur finale de la jauge (état calme et sans JavaScript) : celle de la dernière étape qui en donne une.
  const derniere = [...etapes].reverse().find(e => e.dataset.seeJauge != null);
  if (derniere) poserJauge(schema, derniere);
  if (s.calme) return { detruire() {} };

  const titre = e => e.querySelector('h3')?.textContent.trim() || '';
  root.classList.add('see--vivant');

  // Puces : une par étape, 44 px, lues « Étape n : titre ».
  const texte = root.querySelector('.see__texte');
  const puces = document.createElement('div'); puces.className = 'see__puces';
  const boutons = etapes.map((e, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'see__puce';
    b.innerHTML = `<span aria-hidden="true"></span><span class="socle-sr">Étape ${i + 1} : ${titre(e)}</span>`;
    b.addEventListener('click', () => aller(i));
    puces.appendChild(b); return b;
  });
  texte.appendChild(puces);
  const annonce = document.createElement('p'); annonce.className = 'socle-sr'; annonce.setAttribute('aria-live', 'polite');
  root.appendChild(annonce);

  let courante = -1, aller = () => {};
  function activer(i, force = false) {
    if (i === courante && !force) return;
    const avant = courante; courante = i;
    etapes.forEach((e, k) => e.classList.toggle('est-active', k === i));
    boutons.forEach((b, k) => { b.classList.toggle('est-vue', k <= i); k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
    allumer(schema, i);
    const e = etapes[i];
    annonce.textContent = `Étape ${i + 1} sur ${n} : ${titre(e)}${e.dataset.seeValeur ? ', ' + e.dataset.seeValeur : ''}`;
    const val = schema.querySelector('[data-see-valeur]');
    if (val && avant !== -1 && e.dataset.seeValeur) gsap.fromTo(val, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out', overwrite: true });
  }

  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    root.classList.add('see--pile');
    activer(0, true);
    const st = ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * n * o.pas / 100), pin: scene, invalidateOnRefresh: true,
      onUpdate: self => activer(Math.min(n - 1, Math.floor(self.progress * n * .999))),
      onToggle: self => root.classList.toggle('est-epingle', self.isActive),
    });
    aller = i => defiler(st.start + (st.end - st.start) * (i + .5) / n);
    return () => { st.kill(); root.classList.remove('see--pile', 'est-epingle'); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const repete = o.telephone === 'repete';
    const copies = [];
    if (repete) {
      // Une copie figée du schéma en tête de chaque étape (décorative : le texte de l'étape dit la même chose).
      etapes.forEach((e, i) => {
        const c = schema.cloneNode(true);
        c.classList.add('see__schema--copie'); c.removeAttribute('data-tient'); c.setAttribute('aria-hidden', 'true');
        c.querySelector('figcaption')?.remove();
        allumer(c, i); e.prepend(c); copies.push(c);
      });
    }
    root.classList.add(repete ? 'see--repete' : 'see--compact');
    activer(0, true);
    // Étape active : la dernière dont le haut a passé la ligne de lecture (positions mesurées au refresh, pas pendant le défilement).
    let hauts = [];
    const suivre = self => {
      const y = self.scroll() + innerHeight * (parseFloat(o.lecture) / 100);
      let i = 0; while (i < n - 1 && hauts[i + 1] <= y) i++;
      activer(i);
    };
    const sts = [ScrollTrigger.create({
      trigger: root.querySelector('.see__etapes'), start: 'top bottom', end: 'bottom top',
      onRefresh: self => { hauts = etapes.map(e => e.getBoundingClientRect().top + scrollY); suivre(self); }, onUpdate: suivre,
    })];
    if (!repete) {
      // Le schéma colle sous l'en-tête pendant la lecture des étapes : est-epingle signale qu'il doit tenir dans l'écran.
      const eh = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
      const liste = root.querySelector('.see__etapes'), grille = root.querySelector('.see__grille');
      const ecart = () => parseFloat(getComputedStyle(grille).rowGap) || 0;
      sts.push(ScrollTrigger.create({
        trigger: liste, start: () => `top ${eh() + schema.offsetHeight + ecart() - 4}`,
        endTrigger: grille, end: () => `bottom ${eh() + schema.offsetHeight + 4}`, invalidateOnRefresh: true,
        onToggle: self => root.classList.toggle('est-epingle', self.isActive),
      }));
    }
    aller = i => { const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0; defiler(etapes[i].getBoundingClientRect().top + scrollY - eh - 16); };
    return () => {
      sts.forEach(t => t.kill()); copies.forEach(c => c.remove());
      root.classList.remove('see--repete', 'see--compact', 'est-epingle');
    };
  });

  // L'animation des flux ne tourne que lorsque la section est à l'écran (créé après l'épinglage, qui allonge la section).
  const vue = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', toggleClass: 'see--visible' });

  function defiler(y) { if (s.lenis) s.lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' }); }
  function allumer(fig, i) {
    const k = i + 1;
    for (const p of fig.querySelectorAll('[data-see-partie], [data-see-des]')) {
      const liste = (p.dataset.seePartie || '').split(/[\s,]+/).filter(Boolean).map(Number);
      const des = p.dataset.seeDes ? +p.dataset.seeDes : Infinity;
      p.classList.toggle('est-allume', liste.includes(k) || k >= des);
    }
    poserJauge(fig, etapes[i]);
  }

  s.rafraichir();
  return {
    detruire() {
      mm.revert(); vue.kill(); puces.remove(); annonce.remove();
      root.classList.remove('see--vivant', 'see--visible');
      for (const p of schema.querySelectorAll('.est-allume')) p.classList.remove('est-allume');
      if (derniere) poserJauge(schema, derniere);
    },
  };
}

// Jauge : niveau de 0 à 1 lu dans data-see-jauge (0–100), valeur affichée lue dans data-see-valeur.
function poserJauge(fig, etape) {
  if (!fig.querySelector('.see__jauge') || etape.dataset.seeJauge == null) return;
  fig.style.setProperty('--see-niv', String(Math.max(0, Math.min(1, +etape.dataset.seeJauge / 100))));
  const val = fig.querySelector('[data-see-valeur]');
  if (val && etape.dataset.seeValeur) val.textContent = etape.dataset.seeValeur;
}
