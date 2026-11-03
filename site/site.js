// Bibliothèque des maquettes : lit /index.json et affiche sections (notées 4 et 5) et modules, filtrables.
// Aucun serveur : tout est calculé dans la page. L'état des filtres vit dans l'adresse (partageable).
const $ = s => document.querySelector(s);
const sansAccent = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PAS = 48;
const FACETTES = ['activite', 'concept', 'ambiance', 'role', 'animation', 'interaction', 'module'];
const LIBELLES = { activite: 'Toutes', concept: 'Tous', ambiance: 'Toutes', role: 'Tous', animation: 'Toutes', interaction: 'Toutes', module: 'Tous' };

let donnees = null, vue = 'sections', affiches = PAS;
const form = $('#filtres'), grille = $('#resultats'), compte = $('#compte'), plus = $('#plus'), annonce = $('#annonce');

// ---------- Données ----------
function preparer(ix) {
  const col = (nom, ligne) => Object.fromEntries(ix.colonnes[nom].map((c, i) => [c, ligne[i]]));
  const maquettes = new Map(ix.maquettes.map(l => { const m = col('maquettes', l); return [m.depot, m]; }));
  const sections = ix.sections.map(l => {
    const s = col('sections', l); const [depot, court] = s.id.split('/'); const m = maquettes.get(depot) || {};
    const media = (v, suffixe) => v === 1 ? `/medias/${depot}/${court}-${suffixe}` : v ? (v.startsWith('medias/') ? '/' + v : `/medias/${depot}/${v}`) : '';
    return { type: 'section', id: s.id, depot, titre: s.titre, role: s.role, animations: s.animations, interactions: s.interactions || [], note: s.note,
      modules: s.module ? s.module.split('+') : [], capture: media(s.capture, 'p1440.jpg'), video: media(s.video, 'p720.mp4'),
      activite: m.activite || [], concept: m.concept || [], ambiance: m.ambiance || [], client: m.client || depot,
      enLigne: m.url ? m.url + (s.page ? '/' + s.page : '') : '', chemin: `sections/${s.id}.json` };
  });
  const modules = ix.modules.map(l => {
    const m = col('modules', l);
    return { type: 'module', id: m.nom, titre: m.titre, role: m.role, animations: m.animations, interactions: m.interactions || [], activite: m.convient_a || [],
      ambiance: m.ambiances || [], concept: [], modules: [m.nom], note: 0, dependances: m.dependances || [],
      capture: `/modules/${m.nom}/apercu.jpg`, video: `/modules/${m.nom}/apercu.mp4`, chemin: `modules/${m.nom}/` };
  });
  return { ix, maquettes, sections, modules };
}
const valeurs = (it, f) => f === 'animation' ? it.animations : f === 'interaction' ? it.interactions : f === 'module' ? it.modules : f === 'role' ? [it.role] : it[f] || [];

// ---------- Filtres ----------
function lireEtat() {
  const p = new URLSearchParams(location.search);
  vue = p.get('vue') === 'modules' ? 'modules' : 'sections';
  for (const el of form.elements) if (el.name) el.value = p.get(el.name) || '';
}
function ecrireEtat() {
  const p = new URLSearchParams();
  if (vue === 'modules') p.set('vue', 'modules');
  for (const el of form.elements) if (el.name && el.value && !el.closest('[hidden]') && getComputedStyle(el.closest('.champ')).display !== 'none') p.set(el.name, el.value);
  history.replaceState(null, '', location.pathname + (p.size ? '?' + p : ''));
}
function remplirSelects() {
  const items = vue === 'modules' ? donnees.modules : donnees.sections;
  for (const f of FACETTES) {
    const sel = form.elements[f]; if (!sel) continue;
    const garde = sel.value; const n = new Map();
    for (const it of items) for (const v of new Set(valeurs(it, f))) if (v && v !== 'aucune') n.set(v, (n.get(v) || 0) + 1);
    const opts = [...n].sort((a, b) => a[0].localeCompare(b[0], 'fr'));
    sel.innerHTML = `<option value="">${f === 'module' ? 'Tous' : LIBELLES[f]}</option>` + (f === 'module' ? `<option value="*">Avec un module</option>` : '') +
      opts.map(([v, c]) => `<option value="${v}">${v} (${c})</option>`).join('');
    sel.value = [...sel.options].some(o => o.value === garde) ? garde : '';
  }
}
function filtrer() {
  const items = vue === 'modules' ? donnees.modules : donnees.sections;
  const f = Object.fromEntries([...form.elements].filter(e => e.name).map(e => [e.name, e.value]));
  const mots = sansAccent(f.q || '').split(/\s+/).filter(Boolean);
  return items.filter(it => {
    for (const k of FACETTES) {
      if (!f[k] || (vue === 'modules' && ['concept', 'module'].includes(k))) continue;
      if (k === 'module' && f[k] === '*') { if (!it.modules.length) return false; continue; }
      if (!valeurs(it, k).includes(f[k])) return false;
    }
    if (vue === 'sections' && f.note === '5' && it.note < 5) return false;
    if (mots.length) { const t = sansAccent([it.titre, it.id, it.role, it.client, ...it.animations, ...it.interactions, ...it.modules, ...it.ambiance].join(' ')); if (!mots.every(m => t.includes(m))) return false; }
    return true;
  }).sort((a, b) => b.note - a.note || b.modules.length - a.modules.length || a.titre.localeCompare(b.titre, 'fr'));
}

// ---------- Rendu ----------
const echap = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function carte(it) {
  const etiquettes = [...it.modules.map(m => `<li class="est-module">${echap(m)}</li>`), ...it.animations.slice(0, 4).map(a => `<li>${echap(a)}</li>`), ...it.interactions.slice(0, 2).map(a => `<li>${echap(a)}</li>`)].join('');
  const media = `<div class="carte__media"${it.video ? ` data-video="${it.video}"` : ''}>${it.capture ? `<img src="${it.capture}" alt="" loading="lazy" decoding="async" width="1440" height="900">` : '<span class="sans">Pas de capture</span>'}
    ${it.type === 'section' ? `<span class="pastille${it.note === 5 ? ' pastille--5' : ''}">${it.note}/5</span>` : ''}${it.video ? '<span class="pastille pastille--video" aria-hidden="true">▶ survol</span>' : ''}</div>`;
  if (it.type === 'section') return `<article class="carte">${media}<div class="carte__corps">
    <h2>${echap(it.titre)}</h2><p class="carte__meta"><b>${echap(it.client)}</b> · ${echap(it.role)}</p><ul class="etiquettes" aria-label="Mécaniques">${etiquettes}</ul>
    <div class="carte__actions">${it.enLigne ? `<a class="bouton bouton--ligne" href="${it.enLigne}" target="_blank" rel="noopener">Voir en ligne<span class="sr"> : ${echap(it.titre)}</span></a>` : ''}
    <button type="button" class="bouton" data-copier="${it.chemin}">Copier le chemin<span class="sr"> de la fiche ${echap(it.titre)}</span></button></div></div></article>`;
  return `<article class="carte">${media}<div class="carte__corps">
    <h2>${echap(it.id)}</h2><p class="carte__meta">${echap(it.titre)}</p><p class="carte__meta"><b>${echap(it.role)}</b> · ${echap(it.dependances.filter(d => d !== 'aucune').join(', ') || 'sans dépendance')}</p>
    <ul class="etiquettes" aria-label="Mécaniques">${it.animations.map(a => `<li>${echap(a)}</li>`).join('')}${it.interactions.map(a => `<li>${echap(a)}</li>`).join('')}</ul>
    <div class="carte__actions"><button type="button" class="bouton" data-demo="${it.id}">Démonstration<span class="sr"> de ${echap(it.id)}</span></button>
    <a class="bouton bouton--ligne" href="https://github.com/Kiwi570/bibliotheque-maquettes/blob/main/modules/${it.id}/NOTES.md" target="_blank" rel="noopener">Notes<span class="sr"> de ${echap(it.id)}</span></a>
    <button type="button" class="bouton bouton--ligne" data-copier="${it.chemin}">Copier le chemin<span class="sr"> de ${echap(it.id)}</span></button></div></div></article>`;
}
function rendre(remettre = true) {
  if (remettre) affiches = PAS;
  const res = filtrer();
  document.documentElement.dataset.vue = vue;
  form.dataset.vue = vue;
  for (const c of form.querySelectorAll('.champ')) c.classList.toggle('est-actif', !!c.querySelector('input, select').value);
  grille.innerHTML = res.length ? res.slice(0, affiches).map(carte).join('') : '<p class="vide">Aucun résultat : retirez un filtre.</p>';
  plus.hidden = res.length <= affiches;
  const nom = vue === 'modules' ? 'module' : 'section';
  compte.textContent = `${res.length} ${nom}${res.length > 1 ? 's' : ''}${vue === 'sections' ? (res.length > 1 ? ' notées' : ' notée') + ' 4 ou 5' : ''}${res.length > affiches ? `, ${affiches} affichées` : ''}`;
  ecrireEtat(); majBascule();
}
function choisirVue(v, focus = false) {
  vue = v;
  for (const b of document.querySelectorAll('[role="tab"]')) { const oui = b.dataset.vue === v; b.setAttribute('aria-selected', String(oui)); b.tabIndex = oui ? 0 : -1; if (oui && focus) b.focus(); }
  $('#panneau').setAttribute('aria-labelledby', 'onglet-' + v);
  remplirSelects(); rendre();
}

// ---------- Interactions ----------
document.querySelector('[role="tablist"]').addEventListener('click', e => { const b = e.target.closest('[role="tab"]'); if (b) choisirVue(b.dataset.vue); });
document.querySelector('[role="tablist"]').addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault();
  choisirVue(vue === 'sections' ? 'modules' : 'sections', true);
});
let attente = 0;
form.addEventListener('input', e => { clearTimeout(attente); attente = setTimeout(() => rendre(), e.target.type === 'search' ? 180 : 0); });
form.addEventListener('submit', e => e.preventDefault());
form.addEventListener('reset', () => setTimeout(() => rendre()));
const bascule = form.querySelector('.bascule-filtres');
bascule.addEventListener('click', () => { const o = form.classList.toggle('est-ouvert'); bascule.setAttribute('aria-expanded', String(o)); });
const majBascule = () => { const n = [...form.querySelectorAll('select')].filter(x => x.value && !(vue === 'modules' && x.closest('[data-pour]'))).length; bascule.textContent = n ? `Filtres (${n})` : 'Filtres'; };
plus.addEventListener('click', () => { const avant = affiches; affiches += PAS; rendre(false); grille.children[avant]?.querySelector('a, button')?.focus(); });

// Vidéo au survol (souris) ou au focus clavier : chargée seulement à ce moment.
const lire = (m, oui) => {
  if (!m?.dataset.video || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let v = m.querySelector('video');
  if (oui) { if (!v) { v = Object.assign(document.createElement('video'), { muted: true, loop: true, playsInline: true, preload: 'none', src: m.dataset.video }); v.setAttribute('aria-hidden', 'true'); v.addEventListener('error', () => v.remove()); m.append(v); }
    v.play().then(() => m.classList.add('est-lu')).catch(() => {}); }
  else if (v) { v.pause(); m.classList.remove('est-lu'); }
};
const souris = matchMedia('(hover: hover) and (pointer: fine)');
grille.addEventListener('pointerover', e => { if (souris.matches && e.pointerType === 'mouse') lire(e.target.closest('.carte')?.querySelector('.carte__media'), true); });
grille.addEventListener('pointerout', e => { const c = e.target.closest('.carte'); if (c && !c.contains(e.relatedTarget)) lire(c.querySelector('.carte__media'), false); });
grille.addEventListener('focusin', e => lire(e.target.closest('.carte')?.querySelector('.carte__media'), true));
grille.addEventListener('focusout', e => { const c = e.target.closest('.carte'); if (c && !c.contains(e.relatedTarget)) lire(c.querySelector('.carte__media'), false); });

// Copier le chemin de la fiche.
grille.addEventListener('click', async e => {
  const b = e.target.closest('[data-copier]');
  if (b) {
    const t = b.dataset.copier; let ok = false;
    try { await navigator.clipboard.writeText(t); ok = true; } catch { const z = Object.assign(document.createElement('textarea'), { value: t }); document.body.append(z); z.select(); try { ok = document.execCommand('copy'); } catch {} z.remove(); }
    const avant = b.firstChild.textContent; b.firstChild.textContent = ok ? 'Copié' : 'Copie impossible';
    annonce.textContent = ok ? `Chemin copié : ${t}` : `Copie impossible. Chemin : ${t}`;
    setTimeout(() => { b.firstChild.textContent = avant; }, 1600);
    return;
  }
  const d = e.target.closest('[data-demo]');
  if (d) ouvrirDemo(d.dataset.demo, d);
});

// Démonstration d'un module dans un cadre (dialog natif).
const cadre = $('#cadre'); let retour = null;
function ouvrirDemo(nom, depuis) {
  retour = depuis; const url = `/modules/${nom}/index.html`;
  $('#cadre-titre').textContent = `Démonstration : ${nom}`; $('#cadre-ouvrir').href = url; $('#cadre-page').title = `Démonstration du module ${nom}`;
  $('#cadre-page').src = url; cadre.showModal(); $('#cadre-fermer').focus();
}
$('#cadre-fermer').addEventListener('click', () => cadre.close());
cadre.addEventListener('click', e => { if (e.target === cadre) cadre.close(); });
cadre.addEventListener('close', () => { $('#cadre-page').src = 'about:blank'; retour?.focus(); });

// Hauteur de l'en-tête pour le défilement vers une ancre.
const mesurer = () => document.documentElement.style.setProperty('--entete-h', $('.tete').offsetHeight + 'px');
new ResizeObserver(mesurer).observe($('.tete'));

// ---------- Démarrage ----------
try {
  const r = await fetch('/index.json', { cache: 'no-cache' });
  donnees = preparer(await r.json());
  const t = donnees.ix.totaux;
  $('#totaux').textContent = `${t.maquettes} maquettes, ${t.sections_indexees} sections notées 4 ou 5 (sur ${t.sections_indexees + t.sections_notees_3_ou_moins}), ${t.modules} modules testés. Index du ${new Date(donnees.ix.version).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
  lireEtat(); choisirVue(vue);
} catch (err) {
  $('#totaux').textContent = 'Impossible de lire index.json.'; console.warn(err);
}
