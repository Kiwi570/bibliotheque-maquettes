// Tableau des départs : un tableau d'affichage à palettes (gare, aéroport). Chaque texte marqué data-cases est découpé en
// palettes à l'initialisation ; à la première apparition, chaque palette tourne sur des signes au hasard puis se pose sur
// sa lettre, en cascade ; au survol d'une ligne (souris), ses palettes tournent de nouveau. Le texte reste écrit dans la
// page : sans JavaScript, le tableau est un tableau simple et lisible ; avec, le lecteur d'écran lit toujours le texte.
import { pret } from '../../socle/socle.js';

/**
 * Une ligne : <div class="tdd__ligne" role="row">
 *   <span class="tdd__cellule tdd__cellule--principale" role="cell"><span class="tdd__texte" data-cases="10">Gare centrale</span></span>
 *   <span class="tdd__cellule" role="cell"><span class="tdd__texte tdd__texte--petit" data-cases="5">20-30</span><span class="tdd__unite">min</span></span>
 *   <span class="tdd__cellule tdd__cellule--prix" role="cell"><span class="tdd__texte tdd__texte--accent" data-cases="4" data-aligne="droite">45€</span></span>
 *   <span class="tdd__cellule tdd__cellule--action" role="cell"><a class="socle-bouton" href="…">Réserver</a></span></div>
 * data-cases : nombre de palettes (le texte est coupé ou complété d'espaces) ; data-aligne="droite" complète à gauche.
 * @param {HTMLElement} root  section.tdd
 * @param {object} [options]
 * @param {string}  [options.signes]       signes tirés au hasard pendant que les palettes tournent
 * @param {number}  [options.tours=4]      tours minimum d'une palette (jusqu'à tours + 8 selon sa place)
 * @param {number}  [options.pas=55]       durée d'un tour en ms
 * @param {boolean} [options.survol=true]  les palettes d'une ligne tournent de nouveau au survol (souris)
 * @param {boolean} [options.jouer=true]   jouer à la première apparition (false : appeler jouer() soi-même)
 * @param {number}  [options.seuil=.35]    part du tableau visible pour lancer
 */
export async function init(root, options = {}) {
  const o = { signes: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-', tours: 4, pas: 55, survol: true, jouer: true, seuil: 0.35, ...options };
  const s = await pret([]);
  const nettoyer = [];
  const minuteurs = new Set();
  const plus_tard = (fn, ms) => { const id = setTimeout(() => { minuteurs.delete(id); fn(); }, ms); minuteurs.add(id); };
  const textes = [...root.querySelectorAll('.tdd__texte[data-cases]')];
  if (!textes.length) return { jouer() {}, detruire() {} };

  /* Découpe : le texte d'origine passe dans un span lu par le lecteur d'écran, les palettes sont masquées pour lui. */
  const palettes = [];
  for (const t of textes) {
    if (t.querySelector('.tdd__cases')) continue;
    const n = Math.max(1, parseInt(t.dataset.cases, 10) || t.textContent.trim().length);
    const brut = t.textContent.trim();
    const haut = brut.toLocaleUpperCase('fr-FR').replace(/–|—/g, '-');
    const cible = (t.dataset.aligne === 'droite' ? haut.padStart(n, ' ') : haut.padEnd(n, ' ')).slice(0, n);
    t.textContent = '';
    const lu = document.createElement('span'); lu.className = 'socle-sr'; lu.textContent = brut;
    const rang = document.createElement('span'); rang.className = 'tdd__cases'; rang.setAttribute('aria-hidden', 'true');
    for (const ch of cible) {
      const c = document.createElement('span'); c.className = 'tdd__case';
      c.textContent = ch === ' ' ? ' ' : ch;
      c.dataset.cible = c.textContent;
      rang.appendChild(c); palettes.push(c);
    }
    t.append(rang, lu);
  }
  root.classList.add('tdd--pret');

  const hasard = () => o.signes[(Math.random() * o.signes.length) | 0];
  function tourner(c, tours, depart, pas) {
    const cible = c.dataset.cible;
    if (cible === ' ') return;
    let k = 0;
    const tic = () => {
      k++;
      c.classList.remove('tdd__case--tourne'); void c.offsetWidth; c.classList.add('tdd__case--tourne');
      c.textContent = k >= tours ? cible : hasard();
      if (k < tours) plus_tard(tic, pas);
    };
    plus_tard(tic, depart);
  }

  /* Première apparition : cascade par colonne puis par ligne, chaque palette un nombre de tours différent. */
  let joue = false;
  function jouer() {
    if (joue) return; joue = true;
    palettes.forEach((c, i) => tourner(c, o.tours + ((i * 7) % 9), (i % 10) * 30 + Math.floor(i / 10) * 60, o.pas + (i % 5) * 9));
  }
  if (o.jouer) {
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { jouer(); io.disconnect(); } }, { threshold: o.seuil });
    io.observe(root.querySelector('.tdd__tableau') || root);
    nettoyer.push(() => io.disconnect());
  }

  /* Survol d'une ligne : ses palettes tournent de nouveau, une fois le tableau posé. */
  if (o.survol && s.souris) for (const ligne of root.querySelectorAll('.tdd__ligne')) {
    let occupe = false;
    const survol = () => {
      if (occupe || !joue) return; occupe = true;
      [...ligne.querySelectorAll('.tdd__case')].forEach((c, i) => tourner(c, 3 + (i % 4), i * 18, 50));
      plus_tard(() => { occupe = false; }, 700);
    };
    ligne.addEventListener('mouseenter', survol);
    nettoyer.push(() => ligne.removeEventListener('mouseenter', survol));
  }

  return {
    jouer,
    detruire() {
      nettoyer.forEach((f) => f()); minuteurs.forEach(clearTimeout); minuteurs.clear();
      for (const c of palettes) c.textContent = c.dataset.cible;
    },
  };
}
