// Carte d'itinéraire collante : une liste d'étapes à gauche, une carte SVG collante à droite.
// Quand une étape passe au niveau de lecture, le tracé s'allonge jusqu'à son repère, qui s'allume.
// Téléphone : carte dans le flux en haut, et barre « Étape n / total » fixée en bas pendant la lecture (mesurée dans --barres-h).
// Mode calme : tracé complet, tous les repères allumés, aucune animation.
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  section.cic
 * @param {object} [options]
 * @param {string} [options.lecture='62%']   ligne de lecture : une étape devient active quand elle la traverse
 * @param {number} [options.duree=1.2]       durée de l'avancée du tracé, en secondes
 * @param {number} [options.tension=.5]      courbure du tracé (0 = segments droits)
 * @param {number} [options.largeurMin=900]  largeur à partir de laquelle la carte colle à côté des étapes
 */
export async function init(root, options = {}) {
  const o = { lecture: '62%', duree: 1.2, tension: .5, largeurMin: 900, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const etapes = [...root.querySelectorAll('.cic__etape')];
  const plan = root.querySelector('.cic__plan');
  const svg = root.querySelector('.cic__svg');
  const carte = root.querySelector('.cic__carte');
  const corps = root.querySelector('.cic__corps');
  const barre = root.querySelector('.cic__barre');
  if (!etapes.length || !svg) return { detruire() {} };

  // Points des étapes : data-x / data-y en % du plan, convertis dans le repère du viewBox.
  const vb = svg.viewBox.baseVal;
  const pts = etapes.map(e => [vb.x + vb.width * (+e.dataset.x || 0) / 100, vb.y + vb.height * (+e.dataset.y || 0) / 100]);
  const segments = pts.slice(1).map((p, i) => courbe(pts[Math.max(0, i - 1)], pts[i], p, pts[Math.min(pts.length - 1, i + 2)], o.tension));
  const d = `M${f(pts[0][0])} ${f(pts[0][1])}` + segments.join('');
  const NS = 'http://www.w3.org/2000/svg';
  const fantome = document.createElementNS(NS, 'path'); fantome.setAttribute('class', 'cic__fantome'); fantome.setAttribute('d', d);
  const trace = document.createElementNS(NS, 'path'); trace.setAttribute('class', 'cic__trace'); trace.setAttribute('d', d);
  svg.append(fantome, trace);

  // Longueurs cumulées jusqu'à chaque étape (repère du viewBox : ne dépendent pas de la taille affichée).
  let longueurs = [], total = 0;
  const mesurerTrace = () => {
    const tmp = document.createElementNS(NS, 'path'); svg.appendChild(tmp);
    longueurs = [0]; let acc = 0;
    segments.forEach((seg, i) => { tmp.setAttribute('d', `M${f(pts[i][0])} ${f(pts[i][1])}` + seg); acc += tmp.getTotalLength(); longueurs.push(acc); });
    tmp.remove(); total = trace.getTotalLength() || acc;
    trace.style.strokeDasharray = `${total} ${total}`;
  };
  mesurerTrace();

  // Repères cliquables (HTML par-dessus le SVG, pour des cibles de 44 px et le clavier).
  const liste = document.createElement('ol'); liste.className = 'cic__reperes';
  const reperes = etapes.map((e, i) => {
    const li = document.createElement('li');
    li.style.setProperty('--x', (+e.dataset.x || 0) + '%'); li.style.setProperty('--y', (+e.dataset.y || 0) + '%');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cic__repere';
    const titre = e.querySelector('h3')?.textContent.trim() || '';
    b.innerHTML = `<span aria-hidden="true">${i + 1}</span><span class="socle-sr">Aller à l'étape ${i + 1}${titre ? ' : ' + titre : ''}</span>`;
    b.addEventListener('click', () => aller(i));
    li.appendChild(b); liste.appendChild(li); return b;
  });
  svg.after(liste);
  root.querySelectorAll('[data-cic-total]').forEach(n => { n.textContent = etapes.length; });

  const progression = { L: 0 };
  const poser = L => { trace.style.strokeDashoffset = String(Math.max(0, total - L)); };
  let courante = -1;
  function activer(i, immediat = false) {
    if (i === courante) return; courante = i;
    etapes.forEach((e, k) => e.classList.toggle('est-active', k === i));
    reperes.forEach((b, k) => { b.classList.toggle('est-active', k === i); b.classList.toggle('est-vu', k <= i); k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
    root.querySelectorAll('[data-cic-n]').forEach(n => { n.textContent = i + 1; });
    const t = root.querySelector('[data-cic-titre]'); if (t) t.textContent = etapes[i].querySelector('h3')?.textContent.trim() || '';
    if (immediat || s.calme) { gsap.killTweensOf(progression); progression.L = longueurs[i]; poser(progression.L); }
    else gsap.to(progression, { L: longueurs[i], duration: o.duree, ease: 'power2.inOut', overwrite: true, onUpdate: () => poser(progression.L) });
  }
  function aller(i) {
    const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
    const y = etapes[i].getBoundingClientRect().top + scrollY - eh - 16;
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
    activer(i);
  }

  if (s.calme) {
    // État final : tout est tracé et visible, rien ne bouge.
    progression.L = total; poser(total);
    etapes.forEach(e => e.classList.add('est-active'));
    reperes.forEach(b => b.classList.add('est-vu'));
    root.querySelectorAll('[data-cic-n]').forEach(n => { n.textContent = etapes.length; });
    return { detruire() {} };
  }

  root.classList.add('cic--vivant');
  poser(0); activer(0, true);
  const declencheurs = etapes.map((e, i) => ScrollTrigger.create({
    trigger: e, start: `top ${o.lecture}`, end: `bottom ${o.lecture}`,
    onToggle: self => { if (self.isActive) activer(i); },
  }));
  const fin = ScrollTrigger.create({ trigger: etapes.at(-1), start: `bottom ${o.lecture}`, onEnter: () => activer(etapes.length - 1) });

  // Ordinateur : la classe est-epingle signale que la carte colle (pour les tests « tout tient dans l'écran »).
  // Téléphone : la barre compacte s'affiche tant que la liste des étapes occupe l'écran.
  const mm = gsap.matchMedia();
  mm.add(`(min-width: ${o.largeurMin}px)`, () => {
    const marge = () => parseFloat(getComputedStyle(carte).getPropertyValue('--cic-marge')) || 0;
    const eh = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
    const st = ScrollTrigger.create({
      trigger: corps, start: () => `top ${eh() + marge()}`, end: () => `bottom ${eh() + marge() + carte.offsetHeight}`, invalidateOnRefresh: true,
      onToggle: self => root.classList.toggle('est-epingle', self.isActive),
    });
    return () => { st.kill(); root.classList.remove('est-epingle'); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px)`, () => {
    if (!barre) return;
    const montrer = on => { if (barre.hidden === !on) return; barre.hidden = !on; s.mesurer(); };
    const st = ScrollTrigger.create({ trigger: root.querySelector('.cic__etapes'), start: 'top 70%', end: 'bottom 60%', onToggle: self => montrer(self.isActive) });
    return () => { st.kill(); montrer(false); };
  });
  const surRefresh = () => mesurerTrace();
  ScrollTrigger.addEventListener('refreshInit', surRefresh);
  s.rafraichir();
  return {
    detruire() {
      mm.revert(); declencheurs.forEach(t => t.kill()); fin.kill();
      ScrollTrigger.removeEventListener('refreshInit', surRefresh);
      liste.remove(); fantome.remove(); trace.remove(); root.classList.remove('cic--vivant');
    },
  };
}

const f = n => (Math.round(n * 100) / 100).toString();
// Segment de Catmull-Rom (p1 → p2) converti en Bézier cubique.
function courbe(p0, p1, p2, p3, t) {
  const k = t / 3;
  const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
  const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
  return ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
}
