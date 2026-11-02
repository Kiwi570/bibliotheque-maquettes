// Rail de sections : une règle graduée fixée sur le bord, dont l'aiguille suit la progression de la page.
// Chaque section [data-rail="Nom"] y a un repère cliquable ; le nom de la section en cours s'affiche sur l'aiguille.
// Sur téléphone, la règle devient une barre horizontale en bas de l'écran (comptée dans --barres-h).
import { pret } from '../../socle/socle.js';

/**
 * @param {HTMLElement} root  nav.rds (vide : le module construit la règle)
 * @param {object} [options]
 * @param {number[]} [options.echelle=[0,100]]  valeurs affichées en haut et en bas de la règle
 * @param {number} [options.pas=5]              écart entre deux graduations, dans l'unité de l'échelle
 * @param {number} [options.majeur=20]          une graduation sur « majeur » porte son nombre
 * @param {(v:number)=>string} [options.format] mise en forme des nombres
 * @param {string} [options.selecteur='[data-rail]']  sections repérées
 * @param {number} [options.largeurTelephone=700]
 */
export async function init(root, options = {}) {
  const o = { echelle: [0, 100], pas: 5, majeur: 20, format: v => String(Math.round(v)), selecteur: '[data-rail]', largeurTelephone: 700, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const sections = [...document.querySelectorAll(o.selecteur)];
  if (!sections.length) return { detruire() {} };

  // Construction (une seule fois, contenu remplacé si init est rappelé).
  const [a, b] = o.echelle; const n = Math.round((b - a) / o.pas);
  let h = '<div class="rds__regle" aria-hidden="true">';
  for (let i = 0; i <= n; i++) {
    const v = a + i * o.pas, p = (i / n * 100).toFixed(2), maj = Math.abs((v - a) % o.majeur) < 1e-6 || i === n;
    h += `<span class="rds__trait${maj ? ' rds__trait--majeur' : ''}" style="--p:${p}%"></span>`;
    if (maj) h += `<span class="rds__nombre" style="--p:${p}%">${o.format(v)}</span>`;
  }
  h += '</div><ol class="rds__reperes"></ol><div class="rds__aiguille" aria-hidden="true"></div><span class="rds__etiquette" aria-live="polite"><span></span></span>';
  root.innerHTML = h;
  root.setAttribute('data-barre', '');
  const liste = root.querySelector('.rds__reperes');
  const aiguille = root.querySelector('.rds__aiguille');
  // L'animation porte sur le texte intérieur : la position de l'étiquette reste au CSS (transform lié à --progression).
  const etiquette = root.querySelector('.rds__etiquette > span');
  const reperes = sections.map((sec, i) => {
    const li = document.createElement('li');
    const bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'rds__repere';
    bt.innerHTML = `<span class="socle-sr">${sec.dataset.rail || 'Section ' + (i + 1)}</span>`;
    bt.addEventListener('click', () => aller(sec));
    li.appendChild(bt); liste.appendChild(li);
    return bt;
  });
  document.documentElement.classList.add('rds-actif');

  function aller(sec) {
    const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
    const y = hauts[sections.indexOf(sec)] - eh;
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
    sec.setAttribute('tabindex', '-1'); sec.focus({ preventScroll: true });
  }

  // Mesures au refresh uniquement (jamais pendant le défilement).
  let hauts = [], max = 1, courant = -1, telephone = false;
  const mesurer = () => {
    hauts = sections.map(sec => { const boite = sec.parentElement?.classList.contains('pin-spacer') ? sec.parentElement : sec; return boite.getBoundingClientRect().top + scrollY; });
    max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    telephone = innerWidth < o.largeurTelephone;
    reperes.forEach((bt, i) => bt.parentElement.style.setProperty('--p', Math.min(100, hauts[i] / max * 100).toFixed(2) + '%'));
  };
  const choisir = i => {
    if (i === courant) return;
    const premier = courant === -1; courant = i;
    etiquette.textContent = sections[i].dataset.rail || '';
    reperes.forEach((bt, k) => bt.toggleAttribute('aria-current', k === i));
    if (!premier && !s.calme) gsap.fromTo(etiquette, { opacity: 0, x: telephone ? 0 : 10, y: telephone ? 6 : 0 }, { opacity: 1, x: 0, y: 0, duration: .45, ease: 'expo.out', overwrite: true });
  };
  mesurer();
  const st = ScrollTrigger.create({
    start: 0, end: 'max', onRefresh: mesurer,
    onUpdate: self => {
      const p = self.progress;
      root.style.setProperty('--progression', p.toFixed(4));
      const sonde = scrollY + innerHeight * .5;
      let i = 0; for (let k = 0; k < hauts.length; k++) if (hauts[k] <= sonde) i = k;
      choisir(i);
    },
  });
  root.style.setProperty('--progression', '0');
  choisir(0);
  s.rafraichir();
  return { detruire() { st.kill(); root.innerHTML = ''; document.documentElement.classList.remove('rds-actif'); } };
}
