// Téléphone épinglé : la section s'épingle, un téléphone reste au centre ou sur un côté pendant que les étapes défilent ;
// son écran change à chaque étape (glissement ou fondu) et rejoue de petites actions (texte tapé, case cochée, notification).
// Sans JavaScript, en mode calme, sur téléphone et en tablette portrait : chaque étape garde son propre écran, dans le flux.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.tep
 * @param {object} [options]
 * @param {'droite'|'gauche'|'centre'} [options.cote]  place du téléphone épinglé (défaut : data-cote, sinon 'droite')
 * @param {'glissement'|'fondu'} [options.transition='glissement']  passage d'un écran au suivant
 * @param {number} [options.parEtape=.8]      longueur de défilement par étape, en hauteurs d'écran
 * @param {number|boolean} [options.lissage=.6]  valeur scrub de ScrollTrigger
 * @param {number} [options.largeurMin=900]   largeur à partir de laquelle la section s'épingle
 * @param {number} [options.hauteurMin=500]   hauteur à partir de laquelle la section s'épingle
 */
export async function init(root, options = {}) {
  const o = { cote: root.dataset.cote || 'droite', transition: 'glissement', parEtape: .8, lissage: .6, largeurMin: 900, hauteurMin: 500, ...options };
  root.dataset.cote = o.cote;
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const cadre = root.querySelector('.tep__cadre');
  const etapes = [...root.querySelectorAll('.tep__etape')];
  const vues = etapes.map(e => e.querySelector('.tep__vue'));
  const n = etapes.length;
  if (!n || vues.some(v => !v)) return { detruire() {} };

  // Numéros d'étape transformés en boutons (44 px) : « Aller à l'étape n : titre ».
  const boutons = etapes.map((e, i) => {
    const num = e.querySelector('.tep__n');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tep__aller';
    const titre = e.querySelector('.tep__t')?.textContent.trim() || '';
    b.setAttribute('aria-label', `Aller à l'étape ${i + 1}${titre ? ' : ' + titre : ''}`);
    num.replaceWith(b); b.appendChild(num);
    b.addEventListener('click', () => aller(i));
    return b;
  });
  const textes = [...root.querySelectorAll('[data-tep-tape]')].map(el => ({ el, texte: el.textContent }));
  const remettreTextes = () => textes.forEach(t => { t.el.textContent = t.texte; });
  let st = null, mm = null;
  const eh = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;

  function activer(i) {
    etapes.forEach((e, k) => e.classList.toggle('est-active', k === i));
    boutons.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
  }
  function aller(i) {
    const y = st ? st.start + (st.end - st.start) * Math.min(1, (i + .7) / n) : etapes[i].getBoundingClientRect().top + scrollY - eh() - 16;
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
    if (st) activer(i);
  }

  // Petites actions d'un écran, sur une durée de 1 : texte tapé, éléments qui apparaissent, case cochée, jauge, choix.
  function sequence(vue) {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    let t = 0;
    for (const el of vue.querySelectorAll('[data-tep-pop="notif"]')) { tl.fromTo(el, { yPercent: -160, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .3, ease: 'back.out(1.6)' }, t); t += .2; }
    for (const el of vue.querySelectorAll('[data-tep-tape]')) {
      const texte = el.textContent, c = { n: 0 };
      el.textContent = '';
      tl.fromTo(c, { n: 0 }, { n: texte.length, duration: .45, ease: 'none', onUpdate: () => { el.textContent = texte.slice(0, Math.round(c.n)); } }, t); t += .5;
    }
    const pops = [...vue.querySelectorAll('[data-tep-pop=""], [data-tep-pop="coche"]')];
    pops.forEach((el, k) => {
      const coche = el.dataset.tepPop === 'coche';
      tl.fromTo(el, coche ? { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' } : { y: 14, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: .22, ease: coche ? 'back.out(3)' : 'power2.out' }, t + k * .1);
    });
    t += pops.length ? pops.length * .1 + .1 : 0;
    for (const el of vue.querySelectorAll('[data-tep-jauge]')) { tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: .3 }, Math.max(0, t - .3)); }
    for (const el of vue.querySelectorAll('[data-tep-choisi]')) { tl.fromTo(el, { '--tep-choix': 0 }, { '--tep-choix': 1, duration: .2 }, t); t += .2; }
    for (const el of vue.querySelectorAll('[data-tep-pop="appui"]')) { tl.to(el, { scale: .94, duration: .08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t); t += .16; }
    tl.to({}, { duration: Math.max(.001, 1 - t) });
    return tl;
  }

  if (s.calme) { activer(-1); return { detruire: nettoyer }; }

  mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`, () => {
    // Un seul téléphone : les écrans des étapes y sont déplacés le temps de l'épinglage.
    const tel = document.createElement('div'); tel.className = 'tep__telephone'; tel.dataset.tient = 'téléphone'; tel.setAttribute('aria-hidden', 'true');
    tel.innerHTML = '<div class="tep__appareil"><div class="tep__ecran"></div></div>';
    const ecran = tel.querySelector('.tep__ecran');
    const origines = vues.map(v => v.parentElement);
    vues.forEach(v => ecran.appendChild(v));
    cadre.appendChild(tel);
    root.classList.add('tep--epinglee');

    const glisse = o.transition !== 'fondu';
    gsap.set(vues.slice(1), glisse ? { xPercent: 100 } : { autoAlpha: 0, scale: .96 });
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    vues.forEach((v, i) => {
      tl.add(sequence(v).duration(.6), i === 0 ? .04 : i + .16);
      if (i < n - 1) {
        if (glisse) tl.to(v, { xPercent: -100, duration: .3 }, i + .85).to(vues[i + 1], { xPercent: 0, duration: .3 }, i + .85);
        else tl.to(v, { autoAlpha: 0, scale: 1.03, duration: .3 }, i + .85).fromTo(vues[i + 1], { autoAlpha: 0, scale: .96 }, { autoAlpha: 1, scale: 1, duration: .3 }, i + .85);
      }
    });
    tl.to({}, { duration: .001 }, n);
    activer(0);
    st = ScrollTrigger.create({
      trigger: root, start: () => `top ${eh()}`, end: () => '+=' + Math.round(innerHeight * o.parEtape * n), pin: true, scrub: o.lissage, animation: tl, invalidateOnRefresh: true,
      onToggle: self => root.classList.toggle('est-epingle', self.isActive),
      onUpdate: self => activer(Math.min(n - 1, Math.floor(self.progress * n))),
    });
    return () => {
      st = null;
      vues.forEach((v, i) => origines[i].appendChild(v));
      tel.remove(); remettreTextes();
      root.classList.remove('tep--epinglee', 'est-epingle');
      activer(-1);
    };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    // Dans le flux : chaque écran rejoue ses actions une fois, quand il entre dans l'écran.
    activer(-1);
    const sts = vues.map(v => { const seq = sequence(v).pause(0); return ScrollTrigger.create({ trigger: v.closest('.tep__mini') || v, start: 'top 80%', once: true, onEnter: () => seq.play() }); });
    return () => { sts.forEach(t => t.kill()); remettreTextes(); };
  });
  s.rafraichir();
  return { detruire: nettoyer };

  function nettoyer() {
    mm?.revert();
    boutons.forEach(b => { const num = b.firstElementChild; b.replaceWith(num); });
    remettreTextes(); activer(-1);
  }
}
