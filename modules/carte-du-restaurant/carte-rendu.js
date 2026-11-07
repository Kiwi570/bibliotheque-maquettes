// Carte du restaurant : rendu HTML de la carte depuis son JSON, sans DOM (sert au navigateur comme à generer-carte.mjs).
// Un seul fichier de contenu (le JSON), une seule façon de l'écrire en HTML : la page publiée contient déjà la carte
// (lisible sans JavaScript, indexée), et module.js peut la réécrire depuis le même JSON (data-source).

/** Les 14 allergènes à déclarer (règlement UE 1169/2011), pictogrammes 24 × 24 au trait. */
export const ALLERGENES = {
  gluten: { libelle: 'Gluten', svg: '<path d="M12 22V5"/><path d="M12 9c-3-.6-4.2-2.6-4.2-4.8 2.2 0 4.2 1.4 4.2 4.8Zm0 0c3-.6 4.2-2.6 4.2-4.8-2.2 0-4.2 1.4-4.2 4.8Zm0 5c-3-.6-4.2-2.6-4.2-4.8 2.2 0 4.2 1.4 4.2 4.8Zm0 0c3-.6 4.2-2.6 4.2-4.8-2.2 0-4.2 1.4-4.2 4.8Zm0 5c-3-.6-4.2-2.6-4.2-4.8 2.2 0 4.2 1.4 4.2 4.8Zm0 0c3-.6 4.2-2.6 4.2-4.8-2.2 0-4.2 1.4-4.2 4.8Z"/>' },
  crustaces: { libelle: 'Crustacés', svg: '<path d="M6 13.5C6 8.5 9.5 5 14 5c3.2 0 5.5 2 5.5 4.3 0 2-1.6 3.2-3.5 3.2H10"/><path d="M10 12.5c-1 3.4.4 6.3 3.4 7.2M10 12.5 6.6 17l3.6.9"/><path d="M14 5c.6-1.8 2.4-3 4.6-3M16 5.3c1.8-.9 3.6-.6 5 .7"/>' },
  oeufs: { libelle: 'Œufs', svg: '<path d="M12 3C8.4 3 6 8 6 12.4a6 6 0 0 0 12 0C18 8 15.6 3 12 3Z"/>' },
  poissons: { libelle: 'Poissons', svg: '<path d="M2.5 7.5 6 12l-3.5 4.5"/><path d="M6 12c2.8-3.6 5.8-5 8.8-5 3.2 0 5.4 2 6.7 5-1.3 3-3.5 5-6.7 5-3 0-6-1.4-8.8-5Z"/><circle cx="17" cy="11" r=".9" fill="currentColor" stroke="none"/>' },
  arachides: { libelle: 'Arachides', svg: '<path d="M9.3 3.2a4.2 4.2 0 0 0-2.4 7.6c.6.5.7 1.3.3 2a4.3 4.3 0 1 0 7.4 3.9c.3-.7 1-1.1 1.8-1a4.2 4.2 0 1 0-4.4-6.6c-.5.6-1.3.8-2 .4A4.2 4.2 0 0 0 9.3 3.2Z"/><path d="M9 7.5h.01M12.5 13h.01M15.8 9.6h.01M10.6 17.6h.01"/>' },
  soja: { libelle: 'Soja', svg: '<path d="M4 19.5C10 19.5 18 13.6 20 4.5 14 4.5 6 10.4 4 19.5Z"/><circle cx="9" cy="15" r="1.6"/><circle cx="12.4" cy="11.4" r="1.6"/><circle cx="15.8" cy="7.8" r="1.6"/>' },
  lait: { libelle: 'Lait', svg: '<path d="M9 2.5h6V5l2 3.2V21H7V8.2L9 5Z"/><path d="M7 12.5c2-1 3.5 1 5 0s3-1 5 0"/>' },
  'fruits-a-coque': { libelle: 'Fruits à coque', svg: '<path d="M5 9.5C5 6.3 8.1 4 12 4s7 2.3 7 5.5Z"/><path d="M6.2 9.5c.3 6 3 11 5.8 11s5.5-5 5.8-11"/><path d="M12 4V2"/><path d="M8.5 6.7h.01M12 6.2h.01M15.5 6.7h.01"/>' },
  celeri: { libelle: 'Céleri', svg: '<path d="M8.5 22C7.4 16 7.6 10 9.3 4.5M12 22V4.5M15.5 22c1.1-6 .9-12-.8-17.5"/><path d="M9.3 4.5C7.6 3.3 6 3.8 5.6 5.5M12 4.5c.3-1.7 1.8-2.4 3.2-1.6M14.7 4.5c1.5-1.4 3.4-1.1 3.9.6"/>' },
  moutarde: { libelle: 'Moutarde', svg: '<path d="M8.5 3h7v3h-7Z"/><path d="M7.5 6h9l1.2 3.2V20a1 1 0 0 1-1 1H7.3a1 1 0 0 1-1-1V9.2Z"/><circle cx="10" cy="14" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="12" cy="17" r="1"/>' },
  sesame: { libelle: 'Sésame', svg: '<path d="M7.6 4.5c1.9.9 2.7 3 2 5.6-1.9-.9-2.7-3-2-5.6ZM15.8 6c.5 2.1-.4 4.1-2.4 5.1-.5-2.1.4-4.1 2.4-5.1ZM10.5 13c1.6 1.4 1.9 3.6.7 5.9-1.6-1.4-1.9-3.6-.7-5.9ZM17.5 13.5c-.2 2.2-1.8 3.7-4 4-.1-2.2 1.6-3.8 4-4Z"/>' },
  sulfites: { libelle: 'Sulfites', svg: '<path d="M7.5 3h9l-.6 5.6a3.9 3.9 0 0 1-7.8 0Z"/><path d="M12 12.4V20M8.5 21h7"/><path d="M8.2 6.5h7.6"/>' },
  lupin: { libelle: 'Lupin', svg: '<path d="M12 22V10"/><path d="M12 3.5c-1.6 0-1.6 3 0 3s1.6-3 0-3ZM12 7c-2.6 0-2.6 3.2 0 3.2s2.6-3.2 0-3.2ZM9.8 10.6c-1.8.4-1.4 3 .5 2.8M14.2 10.6c1.8.4 1.4 3-.5 2.8"/><path d="M12 17c-2-.3-3.5-1.4-4-3M12 18.5c2-.3 3.5-1.4 4-3"/>' },
  mollusques: { libelle: 'Mollusques', svg: '<path d="M4 15.5C4 9.5 7.6 5 12 5s8 4.5 8 10.5Z"/><path d="M12 5v10.5M8.3 6.4 9.6 15.5M15.7 6.4l-1.3 9.1M5.4 9.8 7 15.5M18.6 9.8 17 15.5"/><path d="M9.5 15.5v2.8h5v-2.8"/>' },
};

/** Filtres de la barre : régimes et usages. Chaque plat les porte dans « regimes » (ou « partager »). */
export const FILTRES = {
  vegetarien: { libelle: 'Végétarien', svg: '<path d="M5 19.5C5 11.4 10 6 19.5 4.5 18.6 13.6 13.4 19 5 19.5Z"/><path d="M5 19.5 13 11.5"/>' },
  vegan: { libelle: 'Végétalien', svg: '<path d="M5 19.5C5 11.4 10 6 19.5 4.5 18.6 13.6 13.4 19 5 19.5Z"/><path d="M5 19.5 13 11.5M9.5 9.5h4v4"/>' },
  'sans-gluten': { libelle: 'Sans gluten', svg: '<path d="M12 21V8"/><path d="M12 11c-2.6-.5-3.6-2.2-3.6-4.2 1.9 0 3.6 1.2 3.6 4.2Zm0 0c2.6-.5 3.6-2.2 3.6-4.2-1.9 0-3.6 1.2-3.6 4.2Zm0 5c-2.6-.5-3.6-2.2-3.6-4.2 1.9 0 3.6 1.2 3.6 4.2Zm0 0c2.6-.5 3.6-2.2 3.6-4.2-1.9 0-3.6 1.2-3.6 4.2Z"/><path d="M4 20 20 4"/>' },
  'a-partager': { libelle: 'À partager', svg: '<circle cx="12" cy="13" r="7.5"/><circle cx="12" cy="13" r="4"/><path d="M5 3.5v4M3.5 3.5v3a1.5 1.5 0 0 0 3 0v-3M19.5 3.5c-1.6 1-2 2.6-2 4.5h2v1.5"/>' },
};

const echap = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ident = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Prix : nombre (21, 9.5), texte déjà écrit (« selon arrivage ») ou liste de formats [{ libelle: "12 cl", prix: 6 }]. */
export function prix(v, devise = 'EUR') {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'string') return v;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise, minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(v);
}

/** Texte de recherche d'un plat : minuscules, sans accents ni apostrophes, pluriels réduits (fromages → fromage). */
export function normer(t) {
  return String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'`´-]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\b(\w{3,}?)(s|x)\b/g, '$1').replace(/\s+/g, ' ').trim();
}

/** Lit et complète le JSON : identifiants de rubriques, filtres retenus, régimes de chaque plat. */
export function preparer(d) {
  const filtres = (Array.isArray(d.filtres) ? d.filtres : ['vegetarien', 'sans-gluten', 'a-partager']).filter((f) => FILTRES[f]);
  const vus = new Set();
  const rubriques = (d.rubriques || []).map((r, i) => {
    let id = ident(r.id || r.titre) || 'rubrique-' + (i + 1); while (vus.has(id)) id += '-' + (i + 1); vus.add(id);
    const plats = (r.plats || []).map((p) => {
      const regimes = new Set(Array.isArray(p.regimes) ? p.regimes : []);
      if (p.vegetarien) regimes.add('vegetarien');
      if (p.partager || r.partager) regimes.add('a-partager');
      if (regimes.has('vegan')) regimes.add('vegetarien');
      const allergenes = (Array.isArray(p.allergenes) ? p.allergenes : []).filter((a) => ALLERGENES[a]);
      // « Sans gluten » se déclare (p.sans_gluten ou regimes), il ne se déduit jamais d'une liste d'allergènes ; incohérent avec « gluten », il tombe.
      if (p.sans_gluten) regimes.add('sans-gluten');
      if (allergenes.includes('gluten')) regimes.delete('sans-gluten');
      return { ...p, regimes: [...regimes], allergenes };
    });
    return { ...r, id, plats };
  });
  return { ...d, devise: d.devise || 'EUR', filtres, rubriques, prefixe: d.prefixe || 'carte' };
}

function pictos(cles, table, cls) {
  return cles.map((k) => `<li class="${cls}" title="${echap(table[k].libelle)}"><svg class="carte-resto__picto" aria-hidden="true" focusable="false"><use href="#carte-${k}"></use></svg><span class="carte-resto__sr">${echap(table[k].libelle)}</span></li>`).join('');
}

/** Planche des pictogrammes (une fois par page) : <symbol> réutilisés par <use>, sans JavaScript. */
export function planche() {
  const s = (k, v) => `<symbol id="carte-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${v.svg}</symbol>`;
  return `<svg class="carte-resto__planche" width="0" height="0" aria-hidden="true" focusable="false">${Object.entries(ALLERGENES).map(([k, v]) => s(k, v)).join('')}${Object.entries(FILTRES).map(([k, v]) => s(k, v)).join('')}</svg>`;
}

function plat(p, devise) {
  const prixHtml = Array.isArray(p.prix)
    ? `<span class="carte-resto__prix carte-resto__prix--formats">${p.prix.map((f) => `<span><small>${echap(f.libelle)}</small> ${echap(prix(f.prix, devise))}</span>`).join('')}</span>`
    : `<span class="carte-resto__prix">${echap(prix(p.prix, devise))}</span>`;
  const regimes = p.regimes.filter((r) => FILTRES[r]);
  const texte = normer([p.nom, p.description, ...regimes.map((r) => FILTRES[r].libelle)].join(' '));
  return `<li class="carte-resto__plat" data-filtres="${echap(regimes.join(' '))}" data-texte="${echap(texte)}">`
    + `<div class="carte-resto__plat-ligne"><span class="carte-resto__plat-nom">${echap(p.nom)}</span>${p.mention ? `<span class="carte-resto__mention">${echap(p.mention)}</span>` : ''}<span class="carte-resto__points" aria-hidden="true"></span>${prixHtml}</div>`
    + (p.description ? `<p class="carte-resto__desc">${echap(p.description)}</p>` : '')
    + (regimes.length || p.allergenes.length ? `<ul class="carte-resto__etiquettes" aria-label="Régime et allergènes">${pictos(regimes, FILTRES, 'carte-resto__regime')}${p.allergenes.length ? pictos(p.allergenes, ALLERGENES, 'carte-resto__allergene') : ''}</ul>` : '')
    + '</li>';
}

/** HTML complet de la carte (entre les marqueurs carte:debut et carte:fin de la page). */
export function rendreCarte(donnees) {
  const d = preparer(donnees);
  const P = d.prefixe;
  const presents = new Set(d.rubriques.flatMap((r) => r.plats.flatMap((p) => p.allergenes)));
  const liens = d.rubriques.map((r) => `<a class="carte-resto__lien" href="#${P}-${r.id}" data-rubrique-lien="${r.id}">${echap(r.titre)} <small>${r.plats.length}</small></a>`).join('');
  const filtres = d.filtres.map((f) => `<button type="button" class="carte-resto__filtre" aria-pressed="false" data-filtre="${f}"><svg class="carte-resto__picto" aria-hidden="true" focusable="false"><use href="#carte-${f}"></use></svg>${echap(FILTRES[f].libelle)}</button>`).join('');
  const rubriques = d.rubriques.map((r) => `<section class="carte-resto__rubrique" id="${P}-${r.id}" data-rubrique="${r.id}" aria-labelledby="${P}-${r.id}-titre">`
    + `<div class="carte-resto__rubrique-tete"><h3 class="carte-resto__rubrique-titre" id="${P}-${r.id}-titre">${echap(r.titre)}</h3>${r.note ? `<p class="carte-resto__rubrique-note">${echap(r.note)}</p>` : ''}`
    + (r.photo && r.photo.src ? `<figure class="carte-resto__photo"><img src="${echap(r.photo.src)}" alt="${echap(r.photo.alt || '')}" width="${+r.photo.largeur || 1200}" height="${+r.photo.hauteur || 1500}" loading="lazy" decoding="async"></figure>` : '')
    + `</div>`
    + `<ul class="carte-resto__plats">${r.plats.map((p) => plat(p, d.devise)).join('')}</ul></section>`).join('');
  const legende = [...Object.keys(ALLERGENES)].filter((k) => presents.has(k) || d.legende_complete !== false);
  return planche()
    + `<div class="carte-resto__barre"><nav class="carte-resto__rubriques" aria-label="Rubriques de la carte">${liens}</nav>`
    + `<div class="carte-resto__outils" data-outils hidden><div class="carte-resto__filtres" role="group" aria-label="Filtrer la carte">${filtres}</div>`
    + (d.recherche === false ? '' : `<label class="carte-resto__recherche"><span class="carte-resto__sr">Rechercher un plat ou un ingrédient</span><svg class="carte-resto__picto" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg><input type="search" data-recherche placeholder="${echap(d.recherche_exemple || 'Chercher un plat, un ingrédient…')}" autocomplete="off"></label>`)
    + `</div></div>`
    + `<div class="carte-resto__corps">${rubriques}<p class="carte-resto__aucun" data-aucun role="status" hidden></p></div>`
    + `<aside class="carte-resto__legende" aria-labelledby="${P}-legende-titre"><h3 class="carte-resto__legende-titre" id="${P}-legende-titre">Allergènes et régimes</h3>`
    + `<ul class="carte-resto__legende-liste">${d.filtres.filter((f) => f !== 'a-partager').map((f) => `<li><svg class="carte-resto__picto" aria-hidden="true" focusable="false"><use href="#carte-${f}"></use></svg>${echap(FILTRES[f].libelle)}</li>`).join('')}${legende.map((k) => `<li${presents.has(k) ? '' : ' class="est-absent"'}><svg class="carte-resto__picto" aria-hidden="true" focusable="false"><use href="#carte-${k}"></use></svg>${echap(ALLERGENES[k].libelle)}</li>`).join('')}</ul>`
    + (d.mention_allergenes ? `<p class="carte-resto__legende-note">${echap(d.mention_allergenes)}</p>` : '')
    + (d.mentions ? `<p class="carte-resto__legende-note">${echap(d.mentions)}</p>` : '')
    + `</aside>`;
}
