// Titre cousu : chaque ligne d'un grand titre se brode de gauche à droite (point satin, point de croix ou fil simple
// qui recouvre le texte), un point avant en tirets se coud dessous, et une aiguille passe devant en piquant.
// Tout le décor est en pseudo-éléments : le texte de la ligne reste seul dans son élément (aucun enfant décoratif qui
// agrandirait sa boîte de texte et ferait échouer un contrôle de chevauchement).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  titre (h1, h2) contenant des .tcu__ligne ; data-point="satin|croix|fil" sur root (satin par défaut)
 * @param {object} [options]
 * @param {number} [options.duree=1.25]     durée de la couture d'une ligne (s)
 * @param {number} [options.decalage=.55]   écart entre deux lignes (s)
 * @param {string} [options.declencher='visible']  'visible' (à l'entrée dans l'écran) ou 'manuel' (appeler jouer(), par exemple dans une intro)
 */
export async function init(root, options = {}) {
  const o = { duree: 1.25, decalage: .55, declencher: 'visible', ...options };
  const lignes = [...root.querySelectorAll('.tcu__ligne')];
  lignes.forEach(l => { if (!l.dataset.texte) l.dataset.texte = l.textContent.replace(/\s+/g, ' ').trim(); });
  const s = await pret(['gsap']);
  if (s.calme) { root.classList.add('est-cousu'); return { jouer() {}, detruire() {} }; }
  const { gsap } = s;
  root.classList.add('est-actif');
  gsap.set(lignes, { '--c': '0%', '--aig': 0 });
  let joue = false, io = null, tl = null;
  function jouer() {
    if (joue) return tl;
    joue = true; io?.disconnect();
    tl = gsap.timeline({ onComplete: () => root.classList.add('est-cousu') })
      .to(lignes, { '--c': '100%', duration: o.duree, stagger: o.decalage, ease: 'power1.inOut' }, 0)
      .to(lignes, { '--aig': 1, duration: .15, stagger: o.decalage }, 0)
      .fromTo(lignes, { '--saut': '0px' }, { '--saut': '-9px', duration: .08, repeat: Math.round(o.duree / .16) * 2 - 1, yoyo: true, ease: 'sine.inOut', stagger: o.decalage }, 0)
      .to(lignes, { '--aig': 0, duration: .25, stagger: o.decalage }, o.duree - .05);
    return tl;
  }
  if (o.declencher === 'visible') {
    io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) jouer(); }, { threshold: .4 });
    io.observe(root);
  }
  return { jouer, detruire() { io?.disconnect(); tl?.kill(); gsap.set(lignes, { clearProps: '--c,--aig,--saut' }); root.classList.remove('est-actif'); } };
}
