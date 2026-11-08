// Panier en tiroir : un panier latéral, le même sur toutes les pages, gardé dans le navigateur (localStorage dans un
// try/catch : sans stockage, la page marche, le panier dure le temps de la page) et tenu à jour entre onglets.
// Les boutons « Ajouter » se déclarent en HTML (data-panier-ajouter, data-nom, data-prix, data-image, data-options, champs
// [data-panier-option] de la fiche) ; sans JavaScript ce sont des liens vers une page de commande simple.
// Tiroir : dialogue accessible (focus gardé dedans, Échap, focus rendu au bouton), lignes avec vignette, options,
// quantités + et −, retrait annulable, jauge « livraison offerte dès X € », livraison ou retrait, total TTC ;
// puis coordonnées, paiement simulé et confirmation avec une référence. Sur téléphone, il monte du bas, en grand.
// Avec envol-vers-le-panier dans la page ([data-envol-cible]), l'ajout fait partir l'envol.
import { pret } from '../../socle/socle.js';

const ICI = import.meta.url;
let P = null; // promesse du panier de la page : un seul, quel que soit le nombre d'init (tiroir, zones de produits)

/**
 * @param {HTMLElement} root  le bloc [data-module="panier-en-tiroir"] (le tiroir y est construit) ou une zone de produits
 * @param {object} [options]  (sinon le JSON script[data-panier-reglages] du bloc)
 * @param {string} [options.devise='EUR']
 * @param {number} [options.seuil_livraison=45]   livraison offerte dès ce montant TTC (0 : jamais offerte)
 * @param {number} [options.frais_livraison=5.9]
 * @param {number|null} [options.tva=null]        taux affiché « dont TVA » (ex. 5.5), null pour ne rien afficher
 * @param {object|null} [options.retrait]         { adresse, horaires } ; null : pas de retrait
 * @param {boolean} [options.livraison=true]     false : retrait seul (commande à emporter)
 * @param {string} [options.cle='panier-en-tiroir']  clé du stockage (une par site)
 * @param {string} [options.prefixe='CMD']        début de la référence de commande
 * @param {'auto'|function|false} [options.envol='auto']  'auto' : envol-vers-le-panier s'il est dans la page
 * @param {function} [options.commander]          async (commande) => ({ reference }) : l'envoi réel (par défaut, simulé)
 * @returns {Promise<{ajouter, ouvrir, fermer, vider, lignes, detruire}>}
 */
export async function init(root, options = {}) {
  if (!P) {
    /* Le tiroir se construit dans le bloc [data-panier-tiroir] (le root s'il l'est, sinon le premier de la page, sinon un bloc créé). */
    let hote = root.matches('[data-panier-tiroir]') ? root : document.querySelector('[data-panier-tiroir]');
    if (!hote) { hote = document.createElement('div'); hote.setAttribute('data-panier-tiroir', ''); document.body.appendChild(hote); }
    const json = hote.querySelector('script[data-panier-reglages]');
    let lus = {}; try { lus = json ? JSON.parse(json.textContent) : {}; } catch {}
    P = creer(hote, { ...lus, ...options });
  }
  const p = await P; p.ajouterZone(root);
  return p.api;
}
/** Ajoute un produit : { id, nom, prix, image, options, quantite }, source facultative (image ou carte d'où part l'envol). */
export const ajouter = async (produit, source) => (await P)?.api.ajouter(produit, source);
/** Ouvre le tiroir (étape 'panier' par défaut). */
export const ouvrir = async (etape) => (await P)?.api.ouvrir(etape);

async function creer(root, reglages) {
  const s = await pret([]);
  const o = { devise: 'EUR', seuil_livraison: 45, frais_livraison: 5.9, tva: null, retrait: null, livraison: true, cle: 'panier-en-tiroir', prefixe: 'CMD', envol: 'auto', commander: null, ...reglages };
  const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: o.devise });
  const prix = c => euros.format(c / 100);
  const cents = v => Math.round(parseFloat(String(v).replace(',', '.')) * 100) || 0;
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nettoyer = [];
  const ecoute = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); nettoyer.push(() => el.removeEventListener(ev, fn, opt)); };
  const html = document.documentElement;

  /* ---------- État, gardé entre les pages ---------- */
  let memoire = { lignes: [], mode: 'livraison' };
  const lire = () => { try { const v = JSON.parse(localStorage.getItem(o.cle) || 'null'); if (v && Array.isArray(v.lignes)) memoire = v; } catch {} return memoire; };
  const ecrire = () => { try { localStorage.setItem(o.cle, JSON.stringify(memoire)); } catch {} };
  lire();
  if (!o.livraison && o.retrait) memoire.mode = 'retrait'; // retrait seul
  const nombre = () => memoire.lignes.reduce((n, l) => n + l.qte, 0);
  const sousTotal = () => memoire.lignes.reduce((t, l) => t + l.prix * l.qte, 0);
  const seuil = cents(o.seuil_livraison), frais = cents(o.frais_livraison);
  const livraison = () => memoire.mode === 'retrait' || !memoire.lignes.length ? 0 : (seuil && sousTotal() >= seuil ? 0 : frais);
  const total = () => sousTotal() + livraison();
  const cleLigne = (id, opts) => id + '|' + Object.keys(opts).sort().map(k => `${k}=${opts[k]}`).join('|');

  /* ---------- Construction du tiroir ---------- */
  const k = Math.random().toString(36).slice(2, 7);
  root.classList.add('pet');
  root.insertAdjacentHTML('beforeend', `
    <div class="pet__voile" data-panier-fermer></div>
    <section class="pet__tiroir" role="dialog" aria-modal="true" aria-labelledby="pet-${k}-titre" inert>
      <div class="pet__poignee" aria-hidden="true"><span></span></div>
      <header class="pet__tete">
        <h2 class="pet__titre" id="pet-${k}-titre" tabindex="-1">Votre panier</h2>
        <button type="button" class="pet__fermer" data-panier-fermer aria-label="Fermer le panier"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </header>
      <ol class="pet__etapes" aria-label="Étapes de la commande"><li data-e="panier">Panier</li><li data-e="coordonnees">Coordonnées</li><li data-e="paiement">Paiement</li></ol>
      <div class="pet__corps" data-lenis-prevent></div>
      <div class="pet__pied"></div>
    </section>
    <div class="pet__annonce" aria-hidden="true"><img alt="" width="44" height="44"><p></p><button type="button" class="pet__voir" data-panier-ouvrir tabindex="-1">Voir le panier</button></div>
    <p class="socle-sr" aria-live="polite" data-panier-dire></p>`);
  const tiroir = root.querySelector('.pet__tiroir'), corps = root.querySelector('.pet__corps'), pied = root.querySelector('.pet__pied');
  const titre = root.querySelector('.pet__titre'), etapes = root.querySelector('.pet__etapes');
  const toast = root.querySelector('.pet__annonce'), voix = root.querySelector('[data-panier-dire]');
  const dire = t => { voix.textContent = ''; setTimeout(() => { voix.textContent = t; }, 60); };

  let etape = 'panier', ouvert = false, opener = null, retire = null, retireMinuteur = 0, commande = null, erreurs = {};
  let coord = {}; try { coord = JSON.parse(localStorage.getItem(o.cle + '-coordonnees') || '{}'); } catch {}

  /* ---------- Compteurs sur les boutons du panier (toutes les pages) ---------- */
  function compteurs() {
    const n = nombre();
    for (const b of document.querySelectorAll('[data-panier-ouvrir]')) {
      if (b.closest('.pet__annonce')) continue;
      b.setAttribute('aria-label', n ? `Panier, ${n} article${n > 1 ? 's' : ''}` : 'Panier, vide');
      b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', String(ouvert));
    }
    for (const c of document.querySelectorAll('[data-panier-compte]')) { c.textContent = String(n); c.classList.toggle('est-vide', !n); }
  }

  /* ---------- Rendu des étapes ---------- */
  const champ = (nom, libelle, type = 'text', auto = '', requis = true, extra = '') => `
    <p class="pet__champ${erreurs[nom] ? ' est-invalide' : ''}"><label for="pet-${k}-${nom}">${libelle}${requis ? '' : ' <span>(facultatif)</span>'}</label>
    <input id="pet-${k}-${nom}" name="${nom}" type="${type}" autocomplete="${auto}" ${requis ? 'required' : ''} value="${esc(coord[nom] || '')}" data-f="champ-${nom}" ${extra}
      ${erreurs[nom] ? `aria-invalid="true" aria-describedby="pet-${k}-${nom}-err"` : ''}>
    ${erreurs[nom] ? `<span class="pet__erreur" id="pet-${k}-${nom}-err">${erreurs[nom]}</span>` : ''}</p>`;
  const resume = () => `<ul class="pet__resume">${memoire.lignes.map(l => `<li><span>${l.qte} × ${esc(l.nom)}${Object.keys(l.options).length ? ` <small>${esc(Object.values(l.options).join(', '))}</small>` : ''}</span><b>${prix(l.prix * l.qte)}</b></li>`).join('')}</ul>`;
  const totaux = () => {
    const liv = livraison(); const ttc = total();
    return `<dl class="pet__totaux"><div><dt>Sous-total</dt><dd>${prix(sousTotal())}</dd></div>
      <div><dt>${memoire.mode === 'retrait' ? 'Retrait' : 'Livraison'}</dt><dd>${memoire.mode === 'retrait' ? 'Gratuit' : liv ? prix(liv) : 'Offerte'}</dd></div>
      <div class="pet__total"><dt>Total TTC</dt><dd>${prix(ttc)}</dd></div>
      ${o.tva ? `<div class="pet__tva"><dt>dont TVA ${String(o.tva).replace('.', ',')} %</dt><dd>${prix(Math.round(ttc - ttc / (1 + o.tva / 100)))}</dd></div>` : ''}</dl>`;
  };
  function vuePanier() {
    titre.textContent = 'Votre panier';
    const annule = retire ? `<p class="pet__retire" role="status">${esc(retire.ligne.nom)} retiré du panier. <button type="button" class="pet__lien" data-panier-annuler data-f="annuler">Annuler</button></p>` : '';
    if (!memoire.lignes.length) {
      corps.innerHTML = `${annule}<div class="pet__vide"><p>Votre panier est vide.</p><button type="button" class="pet__bouton pet__bouton--clair" data-panier-fermer data-f="continuer">Continuer mes achats</button></div>`;
      pied.innerHTML = ''; return;
    }
    const st = sousTotal(), manque = Math.max(0, seuil - st), part = seuil ? Math.min(1, st / seuil) : 1;
    const jauge = memoire.mode === 'retrait'
      ? `<p class="pet__jauge-texte">Retrait gratuit${o.retrait?.adresse ? ` : ${esc(o.retrait.adresse)}` : ''}</p>`
      : seuil ? `<p class="pet__jauge-texte">${manque ? `Plus que <b>${prix(manque)}</b> pour la livraison offerte` : '<b>Livraison offerte</b>'}</p>
        <div class="pet__jauge${manque ? '' : ' est-pleine'}" role="progressbar" aria-label="Vers la livraison offerte" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(part * 100)}"><span style="--part:${part.toFixed(3)}"></span></div>` : '';
    corps.innerHTML = `${annule}
      <div class="pet__livraison">${jauge}</div>
      <ul class="pet__lignes">${memoire.lignes.map((l, i) => `
        <li class="pet__ligne" data-cle="${esc(l.cle)}">
          ${l.image ? `<img class="pet__vignette" src="${esc(l.image)}" alt="" width="72" height="72" loading="lazy">` : '<span class="pet__vignette" aria-hidden="true"></span>'}
          <div class="pet__ligne-texte"><p class="pet__nom">${esc(l.nom)}</p>
            ${Object.keys(l.options).length ? `<p class="pet__options">${Object.entries(l.options).map(([a, b]) => `${esc(a)} : ${esc(b)}`).join(' · ')}</p>` : ''}
            <p class="pet__unitaire">${prix(l.prix)} l'unité</p></div>
          <div class="pet__quantite" role="group" aria-label="Quantité de ${esc(l.nom)}">
            <button type="button" data-panier-moins="${i}" data-f="moins-${esc(l.cle)}" aria-label="${l.qte > 1 ? `Diminuer la quantité de ${esc(l.nom)}` : `Retirer ${esc(l.nom)}`}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>
            <output aria-live="off">${l.qte}</output>
            <button type="button" data-panier-plus="${i}" data-f="plus-${esc(l.cle)}" aria-label="Augmenter la quantité de ${esc(l.nom)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg></button>
          </div>
          <p class="pet__montant">${prix(l.prix * l.qte)}</p>
          <button type="button" class="pet__lien pet__supprimer" data-panier-supprimer="${i}" data-f="suppr-${esc(l.cle)}">Supprimer<span class="socle-sr"> ${esc(l.nom)}</span></button>
        </li>`).join('')}</ul>
      ${o.retrait && o.livraison ? `<fieldset class="pet__mode"><legend>Réception</legend>
        <label class="pet__choix" data-mode-choix="livraison"><input type="radio" name="pet-${k}-mode" value="livraison" ${memoire.mode !== 'retrait' ? 'checked' : ''} data-f="mode-livraison"><span><b>Livraison</b> ${frais ? `${prix(frais)}${seuil ? `, offerte dès ${prix(seuil)}` : ''}` : 'offerte'}</span></label>
        <label class="pet__choix" data-mode-choix="retrait"><input type="radio" name="pet-${k}-mode" value="retrait" ${memoire.mode === 'retrait' ? 'checked' : ''} data-f="mode-retrait"><span><b>Retrait</b> gratuit${o.retrait.horaires ? `, ${esc(o.retrait.horaires)}` : ''}</span></label></fieldset>` : ''}`;
    pied.innerHTML = `${totaux()}<button type="button" class="pet__bouton" data-panier-commander data-f="commander">Commander · ${prix(total())}</button>`;
  }
  function vueCoordonnees() {
    titre.textContent = 'Vos coordonnées';
    const retrait = memoire.mode === 'retrait';
    corps.innerHTML = `<form class="pet__form" data-panier-form novalidate>
      <div class="pet__duo">${champ('prenom', 'Prénom', 'text', 'given-name')}${champ('nom', 'Nom', 'text', 'family-name')}</div>
      ${champ('email', 'E-mail', 'email', 'email')}
      ${champ('telephone', 'Téléphone', 'tel', 'tel', false)}
      ${retrait ? `<p class="pet__info"><b>Retrait</b> ${esc(o.retrait?.adresse || '')}${o.retrait?.horaires ? `<br>${esc(o.retrait.horaires)}` : ''}</p>`
        : `${champ('adresse', 'Adresse', 'text', 'street-address')}<div class="pet__duo pet__duo--cp">${champ('cp', 'Code postal', 'text', 'postal-code', true, 'inputmode="numeric"')}${champ('ville', 'Ville', 'text', 'address-level2')}</div>`}
      <button type="submit" hidden></button></form>`;
    pied.innerHTML = `${totaux()}<div class="pet__actions"><button type="button" class="pet__bouton pet__bouton--clair" data-panier-etape="panier" data-f="retour-panier">Retour</button>
      <button type="button" class="pet__bouton" data-panier-suite data-f="suite">Continuer vers le paiement</button></div>`;
  }
  function vuePaiement() {
    titre.textContent = 'Paiement';
    corps.innerHTML = `<fieldset class="pet__mode"><legend>Moyen de paiement</legend>
        <label class="pet__choix"><input type="radio" name="pet-${k}-paiement" value="carte" checked data-f="pay-carte"><span><b>Carte bancaire</b> en ligne</span></label>
        <label class="pet__choix"><input type="radio" name="pet-${k}-paiement" value="sur-place" data-f="pay-place"><span><b>${memoire.mode === 'retrait' ? 'Au retrait' : 'À la livraison'}</b> par carte ou espèces</span></label></fieldset>
      <p class="pet__note">Paiement simulé : aucune donnée bancaire n'est demandée et rien n'est débité.</p>
      <h3 class="pet__sous-titre">Récapitulatif</h3>${resume()}
      <p class="pet__info"><b>${memoire.mode === 'retrait' ? 'Retrait' : 'Livraison'}</b> ${esc(coord.prenom || '')} ${esc(coord.nom || '')}${memoire.mode === 'retrait' ? `, ${esc(o.retrait?.adresse || '')}` : `, ${esc(coord.adresse || '')} ${esc(coord.cp || '')} ${esc(coord.ville || '')}`}</p>`;
    pied.innerHTML = `${totaux()}<div class="pet__actions"><button type="button" class="pet__bouton pet__bouton--clair" data-panier-etape="coordonnees" data-f="retour-coord">Retour</button>
      <button type="button" class="pet__bouton" data-panier-payer data-f="payer">Payer ${prix(total())}</button></div>`;
  }
  function vueConfirmation() {
    titre.textContent = 'Commande confirmée';
    const c = commande;
    corps.innerHTML = `<div class="pet__confirmation">
      <svg class="pet__coche" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>
      <p class="pet__merci">Merci${c.prenom ? ` ${esc(c.prenom)}` : ''} !</p>
      <p>Votre commande <b class="pet__reference">${esc(c.reference)}</b> est enregistrée.</p>
      <p class="pet__note">Démonstration : commande simulée, rien n'a été payé ni envoyé.${c.email ? ` Un récapitulatif partirait à ${esc(c.email)}.` : ''}</p>
      ${c.resume}<p class="pet__info"><b>${c.mode === 'retrait' ? 'Retrait' : 'Livraison'}</b> ${esc(c.lieu)}</p><p class="pet__total-final">Total payé <b>${prix(c.total)}</b></p></div>`;
    pied.innerHTML = `<button type="button" class="pet__bouton" data-panier-fermer data-f="fin">Continuer mes achats</button>`;
  }
  function rendre(focus) {
    const avant = focus === undefined ? document.activeElement?.closest?.('.pet__tiroir [data-f]')?.dataset.f : focus;
    etapes.hidden = etape === 'confirmation' || (etape === 'panier' && !memoire.lignes.length);
    for (const li of etapes.children) { const e = li.dataset.e; if (e === etape) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); li.classList.toggle('est-faite', ['panier', 'coordonnees', 'paiement'].indexOf(e) < ['panier', 'coordonnees', 'paiement'].indexOf(etape)); }
    ({ panier: vuePanier, coordonnees: vueCoordonnees, paiement: vuePaiement, confirmation: vueConfirmation })[etape]();
    tiroir.dataset.etape = etape;
    compteurs();
    /* Le focus revient sur le même contrôle après chaque rendu (ou sur le titre s'il a disparu). */
    if (ouvert && avant) (tiroir.querySelector(`[data-f="${CSS.escape(avant)}"]`) || titre).focus({ preventScroll: true });
  }
  const aller = (e) => { etape = e; erreurs = {}; rendre(null); corps.scrollTop = 0; if (ouvert) titre.focus({ preventScroll: true }); };

  /* ---------- Ajouter ---------- */
  function produitDepuis(b) {
    const carte = b.closest('[data-panier-produit]') || b.parentElement;
    let opts = {}; try { opts = JSON.parse(b.dataset.options || '{}'); } catch {}
    let p = b.dataset.prix;
    for (const f of carte?.querySelectorAll('[data-panier-option]') || []) {
      if (f.type === 'radio' && !f.checked) continue;
      const nom = f.dataset.panierOption || f.name; const val = f.value; if (!nom || !val) continue;
      opts[nom] = val;
      const choisi = f.tagName === 'SELECT' ? f.selectedOptions[0] : f;
      if (choisi?.dataset.prix) p = choisi.dataset.prix;
    }
    const img = b.dataset.image || carte?.querySelector('img')?.currentSrc || carte?.querySelector('img')?.src || '';
    return { produit: { id: b.dataset.panierAjouter || b.dataset.nom, nom: b.dataset.nom || carte?.querySelector('h2, h3')?.textContent.trim() || 'Article', prix: p, image: img, options: opts, quantite: +(b.dataset.quantite || 1) }, source: carte?.querySelector('img') || b };
  }
  function ajouterProduit(pr, source) {
    lire();
    const opts = pr.options || {}; const cle = cleLigne(pr.id, opts);
    const l = memoire.lignes.find(x => x.cle === cle);
    const q = Math.max(1, pr.quantite || 1);
    if (l) l.qte = Math.min(99, l.qte + q);
    else memoire.lignes.push({ cle, id: pr.id, nom: pr.nom, prix: cents(pr.prix), image: pr.image ? new URL(pr.image, location.href).href : '', options: opts, qte: q });
    if (etape === 'confirmation') etape = 'panier';
    retire = null; ecrire(); rendre(null);
    const n = nombre();
    dire(`${pr.nom}${Object.keys(opts).length ? ` (${Object.values(opts).join(', ')})` : ''} ajouté au panier. ${n} article${n > 1 ? 's' : ''}.`);
    envoler(source);
    if (!ouvert) montrerToast(pr);
  }
  let envolMod = null;
  async function envoler(source) {
    const boutons = [...document.querySelectorAll('[data-panier-ouvrir]')].filter(b => !b.closest('.pet__annonce'));
    const rebond = () => { for (const b of boutons) { b.classList.remove('pet-rebond'); void b.offsetWidth; b.classList.add('pet-rebond'); } };
    if (!source || o.envol === false) return rebond();
    if (typeof o.envol === 'function') return o.envol({ depuis: source, vers: boutons });
    if (o.envol === 'auto' && document.querySelector('[data-envol-cible]')) {
      try { envolMod ??= await import(new URL('../envol-vers-le-panier/module.js', ICI).href); return envolMod.envol({ depuis: source, vers: '[data-envol-cible]' }); } catch { envolMod = null; }
    }
    rebond();
  }
  let toastMinuteur = 0;
  function montrerToast(pr) {
    const img = toast.querySelector('img');
    if (pr.image) { img.src = pr.image; img.hidden = false; } else img.hidden = true;
    toast.querySelector('p').textContent = `${pr.nom} ajouté`;
    toast.removeAttribute('aria-hidden'); toast.querySelector('button').tabIndex = 0; toast.classList.add('est-visible');
    clearTimeout(toastMinuteur); toastMinuteur = setTimeout(cacherToast, 4500);
  }
  function cacherToast() { toast.classList.remove('est-visible'); toast.setAttribute('aria-hidden', 'true'); toast.querySelector('button').tabIndex = -1; }

  /* ---------- Ouvrir, fermer ---------- */
  const inertes = [];
  function ouvrirTiroir(e = 'panier', declencheur) {
    if (!ouvert) {
      opener = declencheur || (document.activeElement !== document.body ? document.activeElement : null);
      ouvert = true; cacherToast(); lire();
      etape = e;
      for (const el of document.body.children) if (!el.contains(root) && !el.inert && el.tagName !== 'SCRIPT') { el.inert = true; inertes.push(el); }
      tiroir.inert = false; root.classList.add('est-ouvert'); html.classList.add('pet-verrou'); s.lenis?.stop();
      rendre(null);
      requestAnimationFrame(() => titre.focus({ preventScroll: true }));
    } else aller(e);
  }
  function fermerTiroir() {
    if (!ouvert) return;
    ouvert = false; root.classList.remove('est-ouvert'); html.classList.remove('pet-verrou'); s.lenis?.start();
    tiroir.inert = true; inertes.splice(0).forEach(el => { el.inert = false; });
    if (etape === 'confirmation') { etape = 'panier'; commande = null; }
    retire = null; tiroir.style.removeProperty('--tirage');
    compteurs();
    const cible = opener?.isConnected && opener.offsetParent !== null ? opener : [...document.querySelectorAll('[data-panier-ouvrir]')].find(b => b.offsetParent !== null && !b.closest('.pet__annonce'));
    cible?.focus({ preventScroll: true });
  }

  /* ---------- Actions ---------- */
  function supprimer(i) {
    lire(); const ligne = memoire.lignes[i]; if (!ligne) return;
    memoire.lignes.splice(i, 1); retire = { ligne, i }; ecrire();
    rendre('annuler'); dire(`${ligne.nom} retiré du panier.`);
    clearTimeout(retireMinuteur); retireMinuteur = setTimeout(() => { if (retire?.ligne === ligne) { retire = null; if (ouvert && etape === 'panier') rendre(); } }, 9000);
  }
  function annuler() {
    if (!retire) return; lire();
    memoire.lignes.splice(Math.min(retire.i, memoire.lignes.length), 0, retire.ligne);
    const nom = retire.ligne.nom, cle = retire.ligne.cle; retire = null; ecrire();
    rendre(`suppr-${cle}`); dire(`${nom} remis dans le panier.`);
  }
  function verifier() {
    const f = corps.querySelector('[data-panier-form]'); if (!f) return false;
    for (const el of f.elements) if (el.name) coord[el.name] = el.value.trim();
    erreurs = {};
    const req = ['prenom', 'nom', 'email', ...(memoire.mode === 'retrait' ? [] : ['adresse', 'cp', 'ville'])];
    for (const n of req) if (!coord[n]) erreurs[n] = 'À remplir.';
    if (coord.email && !/^\S+@\S+\.\S{2,}$/.test(coord.email)) erreurs.email = 'Adresse e-mail incomplète (exemple : nom@domaine.fr).';
    if (memoire.mode !== 'retrait' && coord.cp && !/^\d{4,5}$/.test(coord.cp)) erreurs.cp = 'Code postal : 4 ou 5 chiffres.';
    if (coord.telephone && !/^[\d\s+().-]{6,}$/.test(coord.telephone)) erreurs.telephone = 'Numéro de téléphone incomplet.';
    const premiere = Object.keys(erreurs)[0];
    if (premiere) { rendre(`champ-${premiere}`); dire(`${Object.keys(erreurs).length} champ${Object.keys(erreurs).length > 1 ? 's' : ''} à corriger.`); return false; }
    try { localStorage.setItem(o.cle + '-coordonnees', JSON.stringify({ ...coord })); } catch {}
    return true;
  }
  function reference() {
    const d = new Date(), L = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let r = '';
    const a = crypto.getRandomValues?.(new Uint8Array(4)) || [0, 0, 0, 0].map(() => Math.random() * 255);
    for (const x of a) r += L[x % L.length];
    return `${o.prefixe}-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${r}`;
  }
  async function payer(b) {
    lire(); if (!memoire.lignes.length) return aller('panier');
    b.disabled = true; b.setAttribute('aria-busy', 'true'); b.textContent = 'Paiement en cours…'; dire('Paiement en cours.');
    const demande = { lignes: memoire.lignes.map(({ id, nom, prix: p, options, qte }) => ({ id, nom, prix: p / 100, options, qte })), mode: memoire.mode, coordonnees: { ...coord }, total: total() / 100,
      paiement: corps.querySelector(`input[name="pet-${k}-paiement"]:checked`)?.value };
    let ref;
    try { ref = o.commander ? (await o.commander(demande))?.reference : (await new Promise(r => setTimeout(r, s.calme ? 300 : 1100)), reference()); }
    catch { b.disabled = false; b.removeAttribute('aria-busy'); b.textContent = `Payer ${prix(total())}`; dire('Le paiement n\'a pas abouti. Réessayez.'); return; }
    commande = { reference: ref || reference(), prenom: coord.prenom, email: coord.email, mode: memoire.mode, total: total(), resume: resume(),
      lieu: memoire.mode === 'retrait' ? (o.retrait?.adresse || '') : `${coord.adresse || ''}, ${coord.cp || ''} ${coord.ville || ''}` };
    memoire.lignes = []; ecrire();
    aller('confirmation'); dire(`Commande ${commande.reference} confirmée.`);
  }

  const zones = new Set();
  function ajouterZone(z) {
    zones.add(z);
    /* Sans JavaScript, « Ajouter » est un lien vers la page de commande : avec lui, c'est un bouton. */
    for (const a of z.querySelectorAll('a[data-panier-ajouter]')) a.setAttribute('role', 'button');
  }
  ajouterZone(document);

  ecoute(document, 'click', e => {
    const aj = e.target.closest('[data-panier-ajouter]');
    if (aj) { e.preventDefault(); const { produit, source } = produitDepuis(aj); ajouterProduit(produit, source); return; }
    const ov = e.target.closest('[data-panier-ouvrir]');
    if (ov) { e.preventDefault(); ouvrirTiroir('panier', ov.closest('.pet__annonce') ? null : ov); return; }
    if (!root.contains(e.target)) return;
    const t = e.target;
    if (t.closest('[data-panier-fermer]')) return fermerTiroir();
    let b;
    if ((b = t.closest('[data-panier-plus]'))) { lire(); const l = memoire.lignes[+b.dataset.panierPlus]; if (l) { l.qte = Math.min(99, l.qte + 1); retire = null; ecrire(); rendre(); dire(`${l.nom} : ${l.qte}.`); } }
    else if ((b = t.closest('[data-panier-moins]'))) { lire(); const i = +b.dataset.panierMoins, l = memoire.lignes[i]; if (l) { if (l.qte > 1) { l.qte--; retire = null; ecrire(); rendre(); dire(`${l.nom} : ${l.qte}.`); } else supprimer(i); } }
    else if ((b = t.closest('[data-panier-supprimer]'))) supprimer(+b.dataset.panierSupprimer);
    else if (t.closest('[data-panier-annuler]')) annuler();
    else if (t.closest('[data-panier-commander]')) { lire(); if (memoire.lignes.length) aller('coordonnees'); }
    else if ((b = t.closest('[data-panier-etape]'))) { if (etape === 'coordonnees') { const f = corps.querySelector('[data-panier-form]'); if (f) for (const el of f.elements) if (el.name) coord[el.name] = el.value.trim(); } aller(b.dataset.panierEtape); }
    else if (t.closest('[data-panier-suite]')) { if (verifier()) aller('paiement'); }
    else if ((b = t.closest('[data-panier-payer]'))) payer(b);
  });
  ecoute(root, 'change', e => {
    const r = e.target.closest(`input[name="pet-${k}-mode"]`);
    if (r) { lire(); memoire.mode = r.value; ecrire(); rendre(`mode-${r.value}`); dire(r.value === 'retrait' ? 'Retrait choisi : gratuit.' : `Livraison choisie : ${livraison() ? prix(livraison()) : 'offerte'}.`); }
  });
  ecoute(root, 'submit', e => { e.preventDefault(); if (verifier()) aller('paiement'); });
  ecoute(document, 'keydown', e => {
    /* Espace sur un lien « Ajouter » devenu bouton. */
    if (e.key === ' ' && e.target.matches?.('a[data-panier-ajouter], a[data-panier-ouvrir]')) { e.preventDefault(); e.target.click(); return; }
    if (!ouvert) return;
    if (e.key === 'Escape') { e.preventDefault(); fermerTiroir(); return; }
    if (e.key !== 'Tab') return;
    const f = [...tiroir.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null && !x.hidden);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1];
    if (!tiroir.contains(document.activeElement)) { e.preventDefault(); a.focus(); }
    else if (e.shiftKey && (document.activeElement === a || document.activeElement === titre)) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  /* Un autre onglet a changé le panier : on relit. */
  ecoute(window, 'storage', e => { if (e.key === o.cle) { lire(); if (etape !== 'confirmation') rendre(); } });
  /* Téléphone : on tire la poignée (ou l'en-tête) vers le bas pour fermer. */
  {
    const zone = root.querySelector('.pet__poignee'), tete = root.querySelector('.pet__tete');
    let tir = null;
    const debut = e => { if (!matchMedia('(max-width: 700px)').matches || e.target.closest('button')) return; tir = { id: e.pointerId, y: e.clientY, t: performance.now() }; e.currentTarget.setPointerCapture(e.pointerId); tiroir.classList.add('est-tire'); };
    const bouge = e => { if (!tir || e.pointerId !== tir.id) return; tiroir.style.setProperty('--tirage', Math.max(0, e.clientY - tir.y) + 'px'); };
    const fin = e => { if (!tir || e.pointerId !== tir.id) return; const d = e.clientY - tir.y, v = d / Math.max(1, performance.now() - tir.t); tir = null; tiroir.classList.remove('est-tire'); tiroir.style.removeProperty('--tirage'); if (d > 110 || v > .6) fermerTiroir(); };
    for (const z of [zone, tete]) { ecoute(z, 'pointerdown', debut); ecoute(z, 'pointermove', bouge); ecoute(z, 'pointerup', fin); ecoute(z, 'pointercancel', fin); }
  }

  rendre(null); compteurs();
  root.classList.add('pet--pret');
  const api = {
    ajouter(produit, source) { ajouterProduit({ quantite: 1, options: {}, ...produit, id: produit.id || produit.nom }, source); },
    ouvrir(e) { ouvrirTiroir(e || 'panier'); },
    fermer: fermerTiroir,
    vider() { lire(); memoire.lignes = []; ecrire(); rendre(); },
    lignes() { lire(); return memoire.lignes.map(l => ({ ...l, prix: l.prix / 100 })); },
    detruire() { fermerTiroir(); nettoyer.forEach(f => f()); root.querySelectorAll(':scope > :not(script)').forEach(el => el.remove()); root.classList.remove('pet', 'pet--pret'); P = null; },
  };
  return { api, ajouterZone };
}
