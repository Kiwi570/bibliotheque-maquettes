// Horaires « ouvert maintenant » : cadran 24 h en SVG (minuit en haut, créneaux du jour tracés, aiguille sur l'heure réelle
// du lieu, fuseau donné), statut ouvert / ferme bientôt / fermé avec la prochaine ouverture, semaine type, fermetures
// exceptionnelles et jours fériés « à noter », plusieurs adresses. Tiré de pizzalyght-maquette/cayenne-titre-horaires.
// Tout vient d'un JSON (dans la page, écrit par generer-horaires.mjs, ou data-source). L'heure est relue chaque minute.
// Mode calme, « réduire les animations » : pas de cadran, le statut et les horaires en texte. Sans JavaScript : les horaires.
import { pret } from '../../socle/socle.js';
import { preparer, maintenant, statut, rendreBloc, rendreCadran } from './horaires-calcul.js';

const echap = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * @param {HTMLElement} root  section[data-module="horaires-ouvert-maintenant"] avec script[data-horaires] (JSON), [data-horaires-texte], .horaires__cadran
 * @param {object} [options]
 * @param {string} [options.source]   adresse du JSON (sinon data-source de la section)
 * @param {object} [options.donnees]  le JSON lui-même
 * @param {string} [options.adresse]  identifiant de l'adresse affichée d'abord (sinon ?adresse=, data-adresse, la première)
 * @param {string} [options.heure]    heure d'essai à l'heure du lieu, « 2026-11-07T21:48 » (démonstration, tests)
 */
export async function init(root, options = {}) {
  const s = await pret([]);
  const o = { source: root.dataset.source || null, ...options };
  let brut = o.donnees || null;
  if (!brut && o.source) { try { const r = await fetch(o.source, { cache: 'no-cache' }); if (r.ok) brut = await r.json(); } catch { /* le JSON de la page reste */ } }
  if (!brut) { try { brut = JSON.parse(root.querySelector('script[data-horaires]')?.textContent || 'null'); } catch { brut = null; } }
  const texte = root.querySelector('[data-horaires-texte]');
  if (!brut || !texte) return { detruire() {} };
  const d = preparer(brut);
  if (!d.adresses.length) return { detruire() {} };

  // Heure d'essai : décalage fixe par rapport à l'horloge, qui continue d'avancer.
  let decalage = 0;
  if (o.heure) { const [dt, hm] = o.heure.split('T'); const vrai = maintenant(d.adresses[0].fuseau); const [a, m, j] = dt.split('-').map(Number), [va, vm, vj] = vrai.iso.split('-').map(Number);
    const [h, mi] = (hm || '12:00').split(':').map(Number); decalage = ((Date.UTC(a, m - 1, j) - Date.UTC(va, vm - 1, vj)) / 60000 + h * 60 + mi - vrai.min) * 60000; }
  const instant = () => new Date(Date.now() + decalage);

  const voulu = o.adresse || new URLSearchParams(location.search).get('adresse') || root.dataset.adresse;
  let i = Math.max(0, d.adresses.findIndex((a) => a.id === voulu));
  const calme = s.calme;
  root.classList.add('est-actif');

  // Choix de l'adresse (plus d'une) : boutons avec leur pastille de statut.
  const choix = root.querySelector('[data-horaires-choix]');
  const statutEl = root.querySelector('[data-horaires-statut]');
  const cadran = calme ? null : root.querySelector('.horaires__cadran');
  if (choix && d.adresses.length > 1) {
    choix.innerHTML = d.adresses.map((a, k) => `<button type="button" class="horaires__choix" data-i="${k}" aria-pressed="${k === i}"><span class="horaires__pastille" aria-hidden="true"></span><span>${echap(a.nom || a.id)}</span><span class="horaires__sr" data-court></span></button>`).join('');
    choix.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; i = +b.dataset.i; tout(true); });
  }

  let jourAffiche = '', premier = true, vu = !cadran;
  function tout(change = false) {
    const a = d.adresses[i], n = maintenant(a.fuseau, instant()), st = statut(a, n, d.seuil);
    // Statut et texte de l'adresse.
    statutEl.className = 'horaires__statut est-' + st.etat;
    statutEl.innerHTML = `<span class="horaires__pastille" aria-hidden="true"></span><span>${echap(st.texte)}</span>${st.motif ? `<span class="horaires__motif">Aujourd'hui : ${echap(st.motif)}</span>` : ''}`;
    if (change || n.iso !== jourAffiche) texte.innerHTML = rendreBloc(a, d.adresses.length > 1, n);
    // Pastilles des autres adresses.
    choix?.querySelectorAll('[data-i]').forEach((b) => { const k = +b.dataset.i, sa = statut(d.adresses[k], maintenant(d.adresses[k].fuseau, instant()), d.seuil);
      b.setAttribute('aria-pressed', String(k === i)); b.dataset.etat = sa.etat; b.querySelector('[data-court]').textContent = ' : ' + sa.court.toLowerCase(); });
    if (!cadran) return;
    // Cadran : redessiné quand le jour ou l'adresse change ; l'aiguille tourne d'elle-même.
    if (change || n.iso !== jourAffiche || premier) {
      cadran.innerHTML = rendreCadran(a, n) + `<div class="horaires__centre"><b data-horloge></b><span>${echap(a.libelle_heure)}</span></div>`;
      if (premier || !vu) cadran.querySelector('.horaires__aiguille').style.setProperty('--angle', '0deg');
    }
    const h = Math.floor(n.min / 60), m = n.min % 60;
    cadran.querySelector('[data-horloge]').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (vu) cadran.querySelector('.horaires__aiguille').style.setProperty('--angle', (n.min / 1440 * 360).toFixed(2) + 'deg');
    cadran.dataset.etat = st.etat;
    jourAffiche = n.iso; premier = false;
  }
  tout(true);

  // L'aiguille part de minuit et rejoint l'heure quand le cadran arrive à l'écran.
  let io = null;
  if (cadran) { io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { vu = true; requestAnimationFrame(() => requestAnimationFrame(() => tout())); io.disconnect(); } }, { threshold: 0.35 }); io.observe(cadran); }

  // Chaque minute, à la minute pile ; et au retour sur l'onglet.
  let minuteur = 0;
  const prochaine = () => { clearTimeout(minuteur); minuteur = setTimeout(() => { tout(); prochaine(); }, 60000 - (Date.now() + decalage) % 60000 + 50); };
  prochaine();
  const retour = () => { if (!document.hidden) { tout(); prochaine(); } };
  document.addEventListener('visibilitychange', retour);

  return {
    /** Affiche une autre adresse (identifiant du JSON). */
    adresse(id) { const k = d.adresses.findIndex((a) => a.id === id); if (k >= 0) { i = k; tout(true); } },
    detruire() { clearTimeout(minuteur); io?.disconnect(); document.removeEventListener('visibilitychange', retour); root.classList.remove('est-actif'); },
  };
}
