// Composeur de formule : une base (radio), des quantités (champ nombre avec boutons ±), des options (cases à cocher) ;
// le détail du calcul se réécrit ligne par ligne et le total compte jusqu'à sa nouvelle valeur.
// Les tarifs viennent uniquement des données : <script type="application/json" class="cdf__donnees"> dans la section,
// ou options.donnees. Les clés sont les value des champs ; libellés et bornes restent dans le HTML.
import { pret } from '../../socle/socle.js';

const TEXTES = {
  total: 'Total estimé',
  surDevis: 'Sur devis',
  surDemande: 'sur demande',
  indisponible: 'Indisponible avec cette base',
  parUnite: 'soit {prix} par {unite}',
  astuce: '{libelle} : −{pourcent} %',
  astuceAtteinte: '{libelle} appliquée',
  base: 'base',
};

/**
 * @param {HTMLElement} root  section.cdf
 * @param {object} [options]
 * @param {object} [options.donnees]            tarifs (sinon lus dans .cdf__donnees) : { devise, bases, options, remises }
 * @param {string} [options.devise]             code ISO 4217, prioritaire sur donnees.devise ; 'EUR' par défaut
 * @param {string} [options.locale='fr-FR']     mise en forme Intl.NumberFormat
 * @param {number|null} [options.decimales=null] null : 0 si tous les prix sont entiers, sinon 2
 * @param {number} [options.duree=.8]           durée du compteur en secondes
 * @param {string|null} [options.parUnite='personnes'] quantité utilisée pour « soit X par personne », null pour masquer
 * @param {string|null} [options.champResume=null] sélecteur d'un champ (input caché, textarea) qui reçoit le résumé texte
 * @param {object} [options.textes]             libellés (voir TEXTES)
 */
export async function init(root, options = {}) {
  const o = { devise: null, locale: 'fr-FR', decimales: null, duree: .8, parUnite: 'personnes', champResume: null, ...options };
  const t = { ...TEXTES, ...(options.textes || {}) };
  const form = root.querySelector('.cdf__form');
  if (!form) return { detruire() {} };

  let d = o.donnees;
  if (!d) { try { d = JSON.parse(root.querySelector('.cdf__donnees')?.textContent || '{}'); } catch { d = {}; } }
  const bases = d.bases || {}, opts = d.options || {}, remises = d.remises || [];
  const tousPrix = [...Object.values(bases), ...Object.values(opts)].map(x => x.prix).filter(p => typeof p === 'number');
  const dec = o.decimales ?? (tousPrix.every(Number.isInteger) ? 0 : 2);
  const devise = o.devise || d.devise || 'EUR';
  const nf = new Intl.NumberFormat(o.locale, { style: 'currency', currency: devise, minimumFractionDigits: dec, maximumFractionDigits: dec });
  const fmt = n => nf.format(n);
  const arrondir = n => Math.round(n * 10 ** dec) / 10 ** dec;
  const remplir = (modele, v) => modele.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

  const radios = [...form.querySelectorAll('input[type="radio"][name="base"]')];
  const cases = [...form.querySelectorAll('input[type="checkbox"]')];
  const qtes = [...form.querySelectorAll('input[type="number"]')];
  const elTotal = root.querySelector('[data-total]');
  const elMini = root.querySelector('[data-total-mini]');
  const elPar = root.querySelector('[data-par-unite]');
  const elLignes = root.querySelector('[data-lignes]');
  const elAnnonce = root.querySelector('[data-annonce]');
  const elAstuce = root.querySelector('[data-astuce]');
  const recap = root.querySelector('.cdf__recap');
  const nomDe = input => input.closest('label')?.querySelector('.cdf__nom')?.textContent.trim() || input.value;
  const unites = input => (input.dataset.unites || input.name + '|' + input.name).split('|');
  const unite = (input, n) => unites(input)[n > 1 ? 1 : 0]; // n = 1 : singulier
  const parQte = Object.fromEntries(qtes.map(q => [q.name, q]));

  // Prix affiché dans chaque carte (rempli une fois, place réservée en CSS : aucun décalage).
  const prixCarte = (item, estBase) => {
    if (!item) return '';
    if (item.prix === null || item.prix === undefined) return estBase ? t.surDevis : t.surDemande;
    const par = (item.par || []).filter(k => parQte[k]).map(k => 'par ' + unite(parQte[k], 1));
    return fmt(item.prix) + (par.length ? ' ' + par.join(' et ') : '');
  };
  for (const r of radios) { const el = r.closest('label')?.querySelector('[data-prix]'); if (el) el.textContent = prixCarte(bases[r.value], true); }
  for (const c of cases) {
    const lab = c.closest('label'); const el = lab?.querySelector('[data-prix]');
    if (el) el.textContent = prixCarte(opts[c.value]);
    if (opts[c.value]?.avec && lab && !lab.querySelector('.cdf__indispo')) {
      const s = document.createElement('small'); s.className = 'cdf__indispo'; s.textContent = t.indisponible;
      lab.querySelector('.cdf__carte')?.appendChild(s);
    }
  }

  const borne = (q, vide = true) => {
    const mn = +q.min || 0, mx = q.max === '' ? Infinity : +q.max;
    let v = parseInt(q.value, 10);
    if (isNaN(v)) { if (!vide) return mn; v = mn; }
    v = Math.max(mn, Math.min(mx, v));
    if (vide) q.value = v;
    return v;
  };
  const majPas = () => {
    for (const q of qtes) {
      const v = borne(q, false);
      for (const b of q.parentElement.querySelectorAll('[data-pas]')) {
        const off = +b.dataset.pas < 0 ? v <= (+q.min || 0) : v >= (q.max === '' ? Infinity : +q.max);
        b.setAttribute('aria-disabled', String(off));
      }
    }
  };

  // ---------- Calcul ----------
  function calculer() {
    const radio = radios.find(r => r.checked) || radios[0];
    const baseId = radio?.value;
    const n = Object.fromEntries(qtes.map(q => [q.name, borne(q, false)]));
    const facteur = item => (item.par || []).reduce((p, k) => p * (n[k] ?? 1), 1);
    const detail = item => (item.par || []).filter(k => parQte[k]).map(k => `${n[k]} ${unite(parQte[k], n[k])}`);
    const lignes = []; let total = 0, devis = false, demande = false;

    // Disponibilité des options selon la base.
    for (const c of cases) {
      const item = opts[c.value]; const off = !!(item?.avec && !item.avec.includes(baseId));
      if (off && c.checked) c.checked = false;
      c.disabled = off; c.closest('label')?.classList.toggle('est-indispo', off);
    }
    const ajouter = (id, nom, item) => {
      if (!item) return;
      if (item.prix === null || item.prix === undefined) { lignes.push({ id, nom, detail: '', montant: null }); return true; }
      const m = item.prix * facteur(item); total += m;
      const det = detail(item);
      lignes.push({ id, nom, detail: det.length ? `${fmt(item.prix)} × ${det.join(' × ')}` : '', montant: m });
    };
    if (radio && ajouter('base', nomDe(radio), bases[baseId])) devis = true;
    for (const c of cases) if (c.checked && ajouter('opt-' + c.value, nomDe(c), opts[c.value])) demande = true;
    // Remises : pourcentage du sous-total, dès qu'une quantité atteint un seuil.
    let astuce = '';
    for (const r of remises) {
      const v = n[r.quantite] ?? 0;
      if (v >= r.des && !devis) { const m = -arrondir(total * r.pourcent / 100); lignes.push({ id: 'remise-' + r.quantite + r.des, nom: r.libelle, detail: `−${r.pourcent} %`, montant: m, remise: true }); total += m; astuce ||= remplir(t.astuceAtteinte, r); }
      else if (!astuce) astuce = remplir(t.astuce, r);
    }
    return { baseId, n, lignes, total: devis ? null : total, demande, astuce };
  }

  // ---------- Rendu ----------
  let s = null; // socle, chargé après le premier rendu (les lignes et le total sont posés sans attendre GSAP)
  const compteur = { v: 0 }; let tween = null, premier = true, minuterie = 0;
  const ecrireTotal = v => { const txt = fmt(v); elTotal.textContent = txt; if (elMini) elMini.textContent = txt; };
  const lignesVues = new Map();

  function rendre() {
    majPas();
    const r = calculer();
    // Détail : les lignes existantes sont mises à jour, seules les nouvelles se dévoilent.
    const gardees = new Set();
    let prec = null;
    for (const l of r.lignes) {
      let li = lignesVues.get(l.id);
      if (!li) {
        li = document.createElement('li'); li.className = 'cdf__ligne' + (premier ? '' : ' est-neuve');
        li.innerHTML = '<span class="cdf__ligne-nom"><b></b><small></small></span><span class="cdf__ligne-montant"></span>';
        lignesVues.set(l.id, li);
      }
      li.classList.toggle('est-remise', !!l.remise);
      li.querySelector('b').textContent = l.nom;
      li.querySelector('small').textContent = l.detail;
      li.querySelector('.cdf__ligne-montant').textContent = l.montant === null ? (l.id === 'base' ? t.surDevis : t.surDemande) : (l.montant < 0 ? '− ' + fmt(-l.montant) : fmt(l.montant));
      const attendu = prec ? prec.nextSibling : elLignes.firstChild;
      if (attendu !== li) elLignes.insertBefore(li, attendu);
      prec = li; gardees.add(l.id);
    }
    for (const [id, li] of lignesVues) if (!gardees.has(id)) { li.remove(); lignesVues.delete(id); }

    // Total : compteur animé, ou texte « Sur devis ».
    tween?.kill(); tween = null;
    root.classList.toggle('est-devis', r.total === null);
    if (r.total === null) { elTotal.textContent = t.surDevis; if (elMini) elMini.textContent = t.surDevis; }
    else if (premier || !s?.gsap || s.calme) { compteur.v = r.total; ecrireTotal(r.total); }
    else {
      tween = s.gsap.to(compteur, { v: r.total, duration: o.duree, ease: 'power3.out', onUpdate: () => ecrireTotal(arrondir(compteur.v)) });
    }
    const qu = o.parUnite && parQte[o.parUnite];
    const nbu = qu ? r.n[o.parUnite] : 0;
    if (elPar) elPar.textContent = r.total !== null && nbu > 1 ? remplir(t.parUnite, { prix: fmt(arrondir(r.total / nbu)), unite: unite(qu, 1) }) : '';
    if (elAstuce) elAstuce.textContent = r.astuce;

    // Résumé texte : annonce (une fois les saisies posées), champ de formulaire éventuel, évènement.
    const totalTxt = r.total === null ? t.surDevis : fmt(r.total);
    const resume = `${r.lignes.map(l => l.nom + (l.detail ? ' (' + l.detail + ')' : '')).join(', ')}. ${t.total} : ${totalTxt}${r.demande ? ' (+ options ' + t.surDemande + ')' : ''}`;
    clearTimeout(minuterie);
    if (!premier && elAnnonce) minuterie = setTimeout(() => { elAnnonce.textContent = `${t.total} : ${totalTxt}`; }, 450);
    if (o.champResume) for (const ch of document.querySelectorAll(o.champResume)) ch.value = resume;
    root.dispatchEvent(new CustomEvent('composeur:change', { bubbles: true, detail: { total: r.total, lignes: r.lignes, quantites: r.n, base: r.baseId, resume } }));
    premier = false;
  }

  // ---------- Écouteurs (tous sur le formulaire, sauf le défilement pour l'état collé) ----------
  const surClic = e => {
    const b = e.target.closest('[data-pas]'); if (!b || !form.contains(b)) return;
    const q = b.parentElement.querySelector('input[type="number"]'); if (!q) return;
    if (b.getAttribute('aria-disabled') === 'true') return;
    q.value = borne(q, false) + (+b.dataset.pas || 0) * (+q.step || 1);
    borne(q); rendre();
  };
  const surChange = e => { if (e.target.type === 'number') borne(e.target); rendre(); };
  const surSaisie = e => { if (e.target.type === 'number' && e.target.value === '') return; rendre(); };
  const surEnvoi = e => e.preventDefault();
  form.addEventListener('click', surClic);
  form.addEventListener('change', surChange);
  form.addEventListener('input', surSaisie);
  form.addEventListener('submit', surEnvoi);

  // Récapitulatif collant (CSS, ordinateur) : classe est-epingle pendant qu'il colle, pour le testeur et les styles.
  let rafColle = 0;
  const colle = () => {
    rafColle = 0; if (!recap) return;
    const cs = getComputedStyle(recap);
    const ok = cs.position === 'sticky' && Math.abs(recap.getBoundingClientRect().top - parseFloat(cs.top)) < 1.5 && root.getBoundingClientRect().top < parseFloat(cs.top);
    root.classList.toggle('est-epingle', ok);
  };
  const surDefil = () => { if (!rafColle) rafColle = requestAnimationFrame(colle); };
  addEventListener('scroll', surDefil, { passive: true });
  addEventListener('resize', surDefil);

  root.classList.add('cdf--vivant');
  rendre();
  colle();
  s = await pret(['gsap']);

  return {
    rendre,
    detruire() {
      tween?.kill(); clearTimeout(minuterie); cancelAnimationFrame(rafColle);
      form.removeEventListener('click', surClic); form.removeEventListener('change', surChange);
      form.removeEventListener('input', surSaisie); form.removeEventListener('submit', surEnvoi);
      removeEventListener('scroll', surDefil); removeEventListener('resize', surDefil);
      root.classList.remove('cdf--vivant', 'est-epingle', 'est-devis');
    },
  };
}
