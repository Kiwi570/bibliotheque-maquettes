// Bac à feuilleter (« crate digging ») : une pile de pochettes dans une caisse, épinglée ; à chaque cran de défilement,
// la pochette de devant bascule vers soi et révèle la suivante, son disque sort à moitié, le fond prend la teinte de la pièce,
// un compteur avance. Par crans : la pochette reste droite sur la plus grande partie du défilement, puis bascule d'un coup.
// Repli (mode calme, sans JavaScript) : rangée qu'on fait défiler à l'horizontale, contenu complet.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.baf[data-epingle] (div.baf__tete … [data-baf-num], .baf__progres > span ;
 *                            div.baf__caisse > div.baf__pile > article.baf__pochette[data-teinte] × n, div.baf__bois)
 * @param {object} [options]
 * @param {number} [options.longueur=.45]  hauteur d'écran défilée par pochette
 * @param {number} [options.lissage=9]     suivi du défilement (plus grand : plus nerveux)
 * @param {number} [options.bascule=64]    angle de bascule vers soi (deg)
 * @param {number} [options.profondeur=4]  nombre de pochettes visibles derrière celle de devant
 * @param {boolean} [options.crans=true]   bascules par crans (false : suit le défilement en continu)
 */
export async function init(root, options = {}) {
  const o = { longueur: .45, lissage: 9, bascule: 64, profondeur: 4, crans: true, ...options };
  const pile = root.querySelector('.baf__pile');
  const cartes = [...root.querySelectorAll('.baf__pochette')];
  const n = cartes.length, num = root.querySelector('[data-baf-num]'), barre = root.querySelector('.baf__progres span'), bois = root.querySelector('.baf__bois');
  const s = await pret(['gsap', 'scrolltrigger']);
  if (n < 2 || s.calme) return { detruire() {} };
  const { gsap, ScrollTrigger } = s;
  /* La pile n'est plus une rangée à faire défiler : elle sort de la tabulation (chaque pochette garde son lien). */
  const garde = ['tabindex', 'role', 'aria-label'].map(a => [a, pile.getAttribute(a)]);
  garde.forEach(([a]) => pile.removeAttribute(a));
  root.classList.add('est-actif');
  const disques = cartes.map(c => c.querySelector('.baf__disque'));
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cran = x => { if (!o.crans) return x; const b = Math.floor(x); return Math.min(n - 1, b + lisse(.3, .7, x - b)); };
  let p = 0, cible = 0, devant = -1, actif = false;
  const rendre = () => {
    cartes.forEach((c, i) => {
      const k = i - p;
      let tr, op = 1, ombre = 0;
      if (k >= 0) {
        tr = `translate3d(0, ${(-k * 5.5).toFixed(2)}%, ${(-k * 70).toFixed(1)}px) rotateX(${Math.min(k, o.profondeur) * 3}deg)`;
        op = 1 - lisse(o.profondeur - .4, o.profondeur + .6, k);
        ombre = Math.min(.62, k * .2);
      } else {
        const t = Math.min(1, -k);
        tr = `translate3d(0, ${(t * 6).toFixed(2)}%, ${(t * 90).toFixed(1)}px) rotateX(${(-t * o.bascule).toFixed(2)}deg)`;
        op = 1 - lisse(.4, .88, t);
      }
      c.style.transform = tr;
      c.style.opacity = op.toFixed(3);
      c.style.zIndex = String(k < -.12 ? 60 + i : n - i); /* celle qui bascule passe devant le bois */
      c.style.setProperty('--baf-ombre', ombre.toFixed(3));
      const d = disques[i];
      if (d) { const f = 1 - Math.min(1, Math.abs(k) * 1.6); d.style.transform = `translateX(${(f * 44).toFixed(1)}%) rotate(${(f * 140 + p * 30).toFixed(1)}deg)`; }
    });
    const i = Math.min(n - 1, Math.max(0, Math.round(p)));
    if (i !== devant) {
      devant = i;
      cartes.forEach((c, j) => c.classList.toggle('est-devant', j === i));
      if (cartes[i].dataset.teinte) root.style.setProperty('--baf-teinte', cartes[i].dataset.teinte);
      if (num) num.textContent = String(i + 1).padStart(2, '0');
    }
    if (barre) barre.style.transform = `scaleX(${(p / (n - 1)).toFixed(4)})`;
    if (bois) bois.style.transform = `translate(-50%, ${(Math.sin((p % 1) * Math.PI) * 4).toFixed(2)}px) rotate(${(Math.sin((p % 1) * Math.PI * 2) * .6).toFixed(2)}deg)`;
  };
  /* Suivi lissé : la boucle ne tourne que pendant le mouvement, puis s'arrête. */
  const pas = (t, dms) => {
    const dt = Math.min(.05, (dms || 16) / 1000);
    if (Math.abs(cible - p) < .0005) { p = cible; rendre(); gsap.ticker.remove(pas); actif = false; return; }
    p += (cible - p) * (1 - Math.exp(-dt * o.lissage));
    rendre();
  };
  const relancer = () => { if (!actif) { actif = true; gsap.ticker.add(pas); } };
  const st = ScrollTrigger.create({
    trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur * (n - 1)),
    pin: true, invalidateOnRefresh: true,
    onUpdate: x => { cible = cran(x.progress * (n - 1)); relancer(); },
  });
  cible = p = cran(st.progress * (n - 1));
  rendre();
  /* Au clavier : la pochette qui reçoit le focus passe devant. */
  const auFocus = e => {
    const i = cartes.findIndex(c => c.contains(e.target));
    if (i < 0) return;
    scrollTo({ top: Math.round(st.start + (i / (n - 1)) * (st.end - st.start)) + 1, behavior: 'instant' });
    cible = p = i; rendre();
  };
  pile.addEventListener('focusin', auFocus);
  return {
    aller(i) { scrollTo({ top: Math.round(st.start + (i / (n - 1)) * (st.end - st.start)) + 1, behavior: s.calme ? 'auto' : 'smooth' }); },
    detruire() {
      st.kill(); gsap.ticker.remove(pas); pile.removeEventListener('focusin', auFocus);
      garde.forEach(([a, v]) => v !== null && pile.setAttribute(a, v));
      root.classList.remove('est-actif');
      cartes.forEach(c => { c.style.cssText = ''; c.classList.remove('est-devant'); });
    },
  };
}
