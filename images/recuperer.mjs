// Récupère les images du site actuel d'un client, en version originale, nommées d'après leur contexte.
// node images/recuperer.mjs <url-du-site> [--sortie recu/] [--pages 60] [--client nom] [--largeur-max 2000] [--sans-zip] [--sans-finder]
//
// - Parcourt le site avec Playwright (menu d'abord, puis fiches et galeries ; 60 pages au plus), fait défiler chaque page.
// - Relève img, picture, srcset, fonds CSS, affiches de vidéo, og:image, Wix (data-image-info), et les images chargées par le réseau.
// - Remonte à l'original : Wix (coupé avant /v1/), WordPress (sans -300x200 ni -scaled), Squarespace (sans ?format=),
//   Shopify (sans _1024x), Cloudflare (Hostinger/Zyro et autres : sans /cdn-cgi/image/<options>/), et tout paramètre
//   de taille de l'adresse. Sans cette remontée, on ne recevait que les vignettes, écartées comme trop petites
//   (lydiacourtois : seule la boutique revenait).
// - Écarte icônes, pictogrammes, SVG décoratifs, images de moins de 400 px, images répétées sur presque toutes les pages
//   (sauf le logo), pixels de suivi, drapeaux, avatars et icônes de réseaux sociaux. Garde toutes les variantes du logo,
//   avec un champ marque : principale, sous-marque ou partenaire.
// - Réduit les photos à 2000 px sur leur plus grand côté (--largeur-max, 0 pour garder l'original) : assez pour
//   toutes les tailles du socle, et le zip reste envoyable (agence-ae : zip refusé, « Trop volumineux »).
// - Écrit <sortie>/<nom>.<ext> et <sortie>/recuperation.json, puis le ou les zips de 20 Mo au plus
//   (~/Downloads/<client>-images.zip, ou -1.zip, -2.zip… : voir zipper.mjs), montrés dans le Finder.
// Relançable : les fichiers de la récupération précédente (et eux seuls) sont effacés au départ ; grok/, analyse.json restent.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { args, slug, empreinte, hamming, lireJson, ecrireJson, ko } from './commun.mjs';

const { pos, opts } = args();
if (!pos[0]) { console.error('usage : node images/recuperer.mjs <url-du-site> [--sortie recu/] [--pages 60] [--client nom] [--sans-zip] [--sans-finder]'); process.exit(1); }
const depart = new URL(/^https?:/.test(pos[0]) ? pos[0] : `https://${pos[0]}`);
const SORTIE = path.resolve(opts.sortie || 'recu');
const MAX_PAGES = +opts.pages || 60;
const hote = h => h.replace(/^www\./, '');
const CLIENT = typeof opts.client === 'string' ? opts.client : hote(depart.hostname).split('.')[0];
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const LARGEUR_MIN = 400;
const LARGEUR_MAX = opts['largeur-max'] === undefined ? 2000 : +opts['largeur-max'];

// 1. Repartir de zéro : seulement ce que la récupération précédente a écrit.
fs.mkdirSync(SORTIE, { recursive: true });
const ancien = lireJson(path.join(SORTIE, 'recuperation.json'));
for (const i of ancien?.images || []) fs.rmSync(path.join(SORTIE, i.fichier), { force: true });
fs.rmSync(path.join(SORTIE, 'recuperation.json'), { force: true });

// 2. Adresses : normalisation des pages, et remontée vers l'original des images.
const PAS_UNE_PAGE = /\.(pdf|jpe?g|png|webp|gif|svg|zip|docx?|xlsx?|pptx?|mp4|mp3|mov|ics|xml|txt)$/i;
function normPage(u) {
  try {
    const x = new URL(u, depart);
    if (!/^https?:$/.test(x.protocol) || hote(x.hostname) !== hote(depart.hostname) || PAS_UNE_PAGE.test(x.pathname)) return null;
    if (/\/(wp-admin|wp-login|wp-json|feed|cart|panier|checkout|account|compte|login|connexion|search|recherche)(\/|$)/i.test(x.pathname)) return null;
    const garde = new URLSearchParams();
    for (const k of ['page_id', 'p', 'lang']) if (x.searchParams.has(k)) garde.set(k, x.searchParams.get(k));
    x.search = garde.toString() ? `?${garde}` : '';
    x.hash = '';
    x.hostname = depart.hostname;
    x.pathname = x.pathname.replace(/\/+$/, '') || '/';
    return x.href;
  } catch { return null; }
}
const PAS_IMAGE = u => { try { const x = new URL(u); return x.pathname.endsWith('/') || (!/\.\w{2,5}$/.test(x.pathname) && !/wixstatic|squarespace|shopify|cloudinary|imgix|googleusercontent/.test(x.hostname)); } catch { return true; } };
const PARAMS_TAILLE = /^(w|h|width|height|size|resize|fit|crop|q|quality|dpr|format|fm|auto|scale|zoom|maxwidth|maxheight|mw|mh|ssl|strip|v)$/i;
function originaux(u) {
  const c = [];
  let x;
  try { x = new URL(u); } catch { return [u]; }
  if (/wixstatic\.com$/.test(x.hostname)) {
    const i = x.pathname.indexOf('/v1/');
    if (i > 0) c.push(`${x.origin}${x.pathname.slice(0, i)}`);
  }
  if (/\.(jpe?g|png)\.webp$/i.test(x.pathname)) { x = new URL(u.replace(/\.webp(?=$|\?)/i, '')); c.push(x.href); }   // WebP Express et semblables
  if (/\/wp-content\/uploads\//.test(x.pathname) || /\/uploads\/\d{4}\/\d{2}\//.test(x.pathname)) {
    const p = x.pathname.replace(/-\d{2,5}x\d{2,5}(?=\.\w+$)/, '');
    c.push(`${x.origin}${p.replace(/-scaled(?=\.\w+$)/, '')}`, `${x.origin}${p}`);
  }
  if (/squarespace(-cdn)?\.com$/.test(x.hostname)) c.push(`${x.origin}${x.pathname}`);
  // Cloudflare Images (Hostinger/Zyro et tout site derrière Cloudflare) : /cdn-cgi/image/<options>/<chemin>.
  // L'original est <chemin> ; à défaut, la même image demandée en grand.
  const cf = x.pathname.match(/^\/cdn-cgi\/image\/[^/]+\/(.+)$/);
  if (cf) {
    const reste = cf[1].replace(/^(https?:)\/(?!\/)/, '$1//');
    c.push(/^https?:\/\//.test(reste) ? reste : `${x.origin}/${reste}`);
    if (!/^https?:/.test(reste)) c.push(`${x.origin}/cdn-cgi/image/w=2400/${reste}`);
  }
  if (/googleusercontent\.com$/.test(x.hostname) && /=[\w-]*$/.test(x.pathname)) c.push(`${x.origin}${x.pathname.replace(/=[\w-]*$/, '=s0')}`);   // Google Sites : =s0 donne l'original
  if (/cdn\.shopify\.com$/.test(x.hostname) || /\/cdn\/shop\//.test(x.pathname)) {
    c.push(`${x.origin}${x.pathname.replace(/_(\d+x\d*|\d*x\d+|pico|icon|thumb|small|compact|medium|large|grande|master)(_crop_\w+)?(@\dx)?(?=\.\w+$)/i, '')}`);
  }
  const q = new URLSearchParams(x.search);
  let change = false;
  for (const k of [...q.keys()]) if (PARAMS_TAILLE.test(k)) { q.delete(k); change = true; }
  if (change) c.push(`${x.origin}${x.pathname}${q.toString() ? `?${q}` : ''}`);
  c.push(u);
  return [...new Set(c)];
}
const SUIVI = /(recaptcha|frog\.wix\.com|\/ptrk\/|panorama\?|\/collect\?|facebook\.com\/tr|google-analytics|googletagmanager|doubleclick|bat\.bing|px\.ads|linkedin\.com\/px|hotjar|analytics|pixel\.|\/pixel|ct\.pinterest|matomo|piwik|stats\.wp|gravatar\.com|\/tr\?)/i;
const ICONE = /(icon|picto|sprite|favicon|arrow|fleche|chevron|bullet|puce|emoji|spinner|loader|loading|placeholder|blank|spacer|transparent\.(png|gif)|1x1|social|reseaux|whatsapp|facebook|instagram|linkedin|twitter|youtube|tiktok|pinterest|payment|paiement|visa|mastercard|paypal|stars?[-_.]|etoiles?[-_.]\d|rating)/i;   // « etoile » seul écartait aussi « Ma Bonne Étoile »
const DRAPEAU = /(\/flags?\/|\/drapeaux?\/|flag[-_.]|drapeau|\/lang(ue)?s?\/[a-z]{2}\.(png|svg|gif)|\b(fr|en|de|it|es|nl|gb|us)\.(png|svg|gif)$)/i;
const RESEAUX = /(facebook|instagram|linkedin|twitter|x\.com|youtube|tiktok|pinterest|whatsapp|tripadvisor|google\.com\/maps|g\.page)/i;
const ORIGINE_UTILE = n => n && !/^(img|dsc|dscn|dcim|pxl|photo|image|capture|screenshot|screen shot|untitled|sans titre|file|fichier|picture|pic)[-_ ]?\d*/i.test(n) && !/^[a-f0-9_~-]{12,}/i.test(n) && !/[A-Za-z0-9]{20,}|=[a-z]\d+$/.test(n) && /[a-z]{3}/i.test(n);   // ni hash, ni identifiant Google

// 3. Collecte dans la page (exécutée dans le navigateur).
function collecter() {
  const out = [];
  const titres = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')].filter(h => h.textContent.trim());
  const net = s => (s || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  const titreAvant = el => {
    let t = '';
    for (const h of titres) { if (h === el || h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) t = h; else break; }
    return t ? net(t.textContent) : '';
  };
  const zone = el => el.closest('header, [role="banner"], #SITE_HEADER, #masthead, .site-header') ? 'entete'
    : el.closest('footer, [role="contentinfo"], #SITE_FOOTER, .site-footer') ? 'pied' : el.closest('nav') ? 'nav' : 'contenu';
  const accueil = h => { try { const u = new URL(h, location.href); return u.host === location.host && /^\/?(index\.\w+)?$/.test(u.pathname.replace(/\/$/, '')) ; } catch { return false; } };
  const srcset = s => (s || '').split(/,\s+(?=[^,]*?(?:\s\d+[wx]|$))/).map(p => p.trim().split(/\s+/)[0]).filter(Boolean);
  const abs = u => { try { return new URL(u, location.href).href; } catch { return null; } };
  const infoWix = el => { const n = el.closest('[data-image-info]'); if (!n) return null; try { const d = JSON.parse(n.dataset.imageInfo).imageData; return d && { uri: d.uri, largeur: d.width, hauteur: d.height, nom: d.name, alt: d.alt }; } catch { return null; } };
  const base = (el, type) => {
    const r = el.getBoundingClientRect(), a = el.closest('a');
    const lieur = el.closest('a, [class*="logo" i], [id*="logo" i]');
    const idc = `${el.className?.baseVal ?? el.className ?? ''} ${el.id || ''} ${lieur && /logo/i.test(`${lieur.className?.baseVal ?? lieur.className} ${lieur.id}`) && lieur.contains(el) && lieur.querySelectorAll('img, svg').length <= 2 ? 'logo' : ''}`;
    return { type, zone: zone(el), section: titreAvant(el), lien: a?.href || '', vers_accueil: a ? accueil(a.getAttribute('href')) : false,
      rendu: [Math.round(r.width), Math.round(r.height)], classes: net(idc), legende: net(el.closest('figure')?.querySelector('figcaption')?.textContent) };
  };
  for (const img of document.querySelectorAll('img')) {
    const p = img.closest('picture');
    const urls = [img.currentSrc, img.src, img.dataset.src, img.dataset.lazySrc, img.dataset.original, ...srcset(img.srcset), ...srcset(img.dataset.srcset),
      ...(p ? [...p.querySelectorAll('source')].flatMap(s => srcset(s.srcset || s.dataset.srcset)) : [])].map(abs).filter(u => u && !u.startsWith('data:'));
    if (!urls.length) continue;
    out.push({ ...base(img, 'img'), urls: [...new Set(urls)], alt: net(img.alt), titre: net(img.title), naturel: [img.naturalWidth, img.naturalHeight], wix: infoWix(img) });
  }
  for (const v of document.querySelectorAll('video[poster]')) out.push({ ...base(v, 'affiche'), urls: [abs(v.poster)].filter(Boolean), alt: '', titre: net(v.title) });
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 80) continue;
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none' || !bg.includes('url(')) continue;
    const urls = [...bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => abs(m[1])).filter(u => u && !u.startsWith('data:'));
    if (urls.length) out.push({ ...base(el, 'fond'), urls, alt: net(el.getAttribute('aria-label')), titre: '', wix: infoWix(el) });
  }
  for (const m of document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"], meta[property="og:image:url"]')) {
    const u = abs(m.content); if (u) out.push({ type: 'og', zone: 'meta', section: '', lien: '', vers_accueil: false, rendu: [0, 0], classes: '', legende: '', urls: [u], alt: net(document.querySelector('meta[property="og:image:alt"]')?.content), titre: '' });
  }
  const liens = [...document.querySelectorAll('a[href]')].map(a => ({ href: a.href, menu: !!a.closest('header, nav, [role="navigation"], #SITE_HEADER') }));
  return { images: out, liens, titre: net(document.title), h1: net(document.querySelector('h1')?.textContent) };
}

// 4. Parcours.
async function parcourir() {
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 }, locale: 'fr-FR', deviceScaleFactor: 2 });
  await ctx.route('**/*', r => ['media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
  const vus = new Set(), file = [normPage(depart.href)], pages = [], reseau = new Map();
  vus.add(file[0]);
  async function visiter(url) {
    const page = await ctx.newPage();
    page.on('response', rep => {
      if (rep.request().resourceType() !== 'image' || rep.status() >= 400) return;
      const u = rep.url();
      if (!u.startsWith('data:') && !reseau.has(u)) reseau.set(u, url);
    });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
        .catch(async e => { if (!/NETWORK_CHANGED|ECONNRESET|TIMED_OUT|Timeout/i.test(e.message)) throw e; await new Promise(r => setTimeout(r, 2000)); return page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); });   // une reprise sur coupure réseau
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.evaluate(async () => {
        const pause = ms => new Promise(r => setTimeout(r, ms));
        for (let i = 0; i < 60; i++) {
          const avant = scrollY;
          scrollBy(0, innerHeight * 0.8);
          await pause(220);
          if (scrollY === avant && i > 2) break;
        }
        await pause(600);
      });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      const r = await page.evaluate(collecter);
      const reelle = normPage(page.url()) || url;
      pages.push({ url: reelle, titre: r.titre, h1: r.h1, images: r.images, menu: r.liens.filter(l => l.menu).map(l => normPage(l.href)).filter(Boolean) });
      const menu = r.liens.filter(l => l.menu), autres = r.liens.filter(l => !l.menu);
      for (const l of [...menu, ...autres]) {
        const n = normPage(l.href);
        if (n && !vus.has(n) && vus.size < MAX_PAGES * 3) { vus.add(n); l.menu ? file.splice(Math.min(file.length, pages.length), 0, n) : file.push(n); }
      }
      console.log(`page ${pages.length} ${reelle} : ${r.images.length} images`);
    } catch (e) {
      console.log(`ECHEC page ${url} : ${e.message.split('\n')[0]}`);
    } finally { await page.close(); }
  }
  let i = 0;
  const travailleur = async () => { while (pages.length + 0 < MAX_PAGES && i < file.length) await visiter(file[i++]); };
  await travailleur();                                  // l'accueil d'abord : il remplit la file avec le menu
  await Promise.all([travailleur(), travailleur(), travailleur()]);
  await nav.close();
  return { pages: pages.slice(0, MAX_PAGES), reseau };
}

// 5. Regroupement par original, filtres, nom et drapeau.
const DRAPEAUX = [
  ['portrait', /(portrait|equipe|team|fondat|gerant|dirigeant|praticien|therapeute|coach|qui suis|a propos|about|moi\b|mon parcours|biograph|madame|monsieur|docteur|dr\b|chef\b|associe|collaborat|staff)/],
  ['plat', /(plat|menu|carte|cuisine|recette|dessert|entree|gateau|patisserie|pain|viande|poisson|salade|burger|pizza|vin\b|cocktail|brunch|dejeuner|diner|degustation|food|dish)/],
  ['produit', /(produit|boutique|shop|store|article|achat|acheter|prix|tarif|collection|modele|reference|catalogue|panier|product|coffret|flacon|bijou)/],
  ['oeuvre', /(oeuvre|tableau|peinture|sculpture|dessin|toile|exposition|expo|artiste|illustration|gravure|ceramique|aquarelle|artwork|painting)/],
  ['lieu', /(salle|cabinet|atelier|local|lieu|boutique physique|magasin|terrasse|jardin|maison|chambre|gite|exterieur|interieur|vue|facade|batiment|bureau|espace|studio|piscine|plage|village|ville|paysage|montagne|lac|mer|foret|chantier|realisation|renovation)/],
];
const CHEMINS = [['produit', /\/(product-page|products?|produits?|shop|boutique|store|article)\//i], ['plat', /\/(menu|carte|nos-plats|recettes?)(\/|$)/i], ['oeuvre', /\/(oeuvres?|galerie|expositions?|portfolio)(\/|$)/i]];
let NOM_SITE = new Set();
function deviner(ctx, chemin) {
  for (const [d, re] of CHEMINS) if (re.test(`${chemin} `)) return d;
  const t = slug(ctx, 99, 9999).split('-').filter(m => !NOM_SITE.has(m)).join(' ');
  for (const [d, re] of DRAPEAUX) if (re.test(t)) return d;
  return 'autre';
}
const inutile = s => !s || s.length < 3 || /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(s) || !ORIGINE_UTILE(s.replace(/\.\w+$/, '')) || /^(image|photo|img|logo|picture|sans titre|untitled|default|placeholder)$/i.test(s);

async function telecharger(u) {
  const rep = await fetch(u, { headers: { 'user-agent': UA, referer: depart.origin + '/', accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
  if (!rep.ok) throw new Error(`HTTP ${rep.status}`);
  const type = rep.headers.get('content-type') || '';
  const buf = Buffer.from(await rep.arrayBuffer());
  if (!buf.length) throw new Error('vide');
  if (/text\/html/.test(type)) throw new Error('pas une image');
  return { buf, type };
}
async function decrire(buf, type, u) {
  const svg = /svg/.test(type) || /^\s*(<\?xml[^>]*>\s*)?<svg/i.test(buf.toString('utf8', 0, 300));
  const m = await sharp(buf, { failOn: 'none', animated: false }).metadata();
  const ext = svg ? 'svg' : { jpeg: 'jpg', png: 'png', webp: 'webp', gif: 'gif', avif: 'jpg', heif: 'jpg', tiff: 'jpg' }[m.format] || 'jpg';
  const conv = !svg && ['avif', 'heif', 'tiff'].includes(m.format);   // formats que le reste de la chaîne lit mal : convertis en JPG
  const data = conv ? await sharp(buf).rotate().jpeg({ quality: 92 }).toBuffer() : buf;
  return { data, ext, svg, largeur: m.autoOrient?.width ?? m.width, hauteur: m.autoOrient?.height ?? m.height, alpha: !!m.hasAlpha, format: svg ? 'svg' : m.format };
}
async function luminance(buf) {
  const { data, info } = await sharp(buf, { failOn: 'none' }).resize(96, 96, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let s = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) if (data[i + 3] > 128) { s += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; n++; }
  return n ? s / n / 255 : 0.5;
}

async function main() {
  console.log(`Parcours de ${depart.href} (${MAX_PAGES} pages au plus)`);
  // --cache <fichier> : réutilise un parcours déjà fait (mise au point du script).
  let pages, reseau;
  const cache = typeof opts.cache === 'string' && lireJson(opts.cache);
  if (cache) { pages = cache.pages; reseau = new Map(cache.reseau); console.log(`parcours repris de ${opts.cache}`); }
  else {
    ({ pages, reseau } = await parcourir());
    if (typeof opts.cache === 'string') ecrireJson(opts.cache, { pages, reseau: [...reseau] });
  }
  if (!pages.length) { console.error('ECHEC : aucune page lue'); process.exit(1); }

  // Regrouper les relevés par adresse d'origine présumée.
  const groupes = new Map(), ecartees = [];
  const ajouter = (rel, page) => {
    const urls = rel.wix?.uri ? [`https://static.wixstatic.com/media/${rel.wix.uri}`, ...rel.urls] : rel.urls;
    const cands = [...new Set(urls.flatMap(originaux))];
    const cle = cands[0];
    if (SUIVI.test(cle)) { ecartees.push({ url: cle, raison: 'suivi' }); return; }
    if (cands.every(PAS_IMAGE) && rel.type !== 'reseau') { ecartees.push({ url: cle, raison: 'pas une image' }); return; }
    let g = groupes.get(cle);
    if (!g) groupes.set(cle, g = { cle, cands: [], releves: [], pages: new Set() });
    g.cands.push(...cands.filter(c => !g.cands.includes(c)));
    for (const u of rel.urls) if (!g.cands.includes(u)) g.cands.push(u);
    g.releves.push({ ...rel, page: page.url, titrePage: page.titre, h1: page.h1 });
    g.pages.add(page.url);
  };
  for (const p of pages) { const premier = p.images.find(y => y.zone === 'entete' && y.type === 'img'); for (const r of p.images) ajouter({ ...r, premier: r === premier }, p); }
  const dejaVues = new Set([...groupes.values()].flatMap(g => g.cands));
  for (const [u, page] of reseau) {
    if (dejaVues.has(u) || SUIVI.test(u)) continue;
    const p = pages.find(x => x.url === normPage(page)) || pages[0];
    ajouter({ type: 'reseau', zone: 'contenu', section: '', lien: '', vers_accueil: false, rendu: [0, 0], classes: '', legende: '', urls: [u], alt: '', titre: '' }, p);
  }

  const nbPages = pages.length;
  // Premier visuel de l'en-tête de l'accueil : le logo dans la plupart des sites.
  const premiersEntete = new Set();
  for (const g of groupes.values()) if (g.releves.some(x => x.premier && x.page === pages[0].url)) premiersEntete.add(g.cle);
  // Mots du nom du site (adresse et fin commune des titres) : ils ne disent rien du sujet d'une image.
  const fins = pages.map(p => p.titre.split(/\s[|–—-]\s/).pop());
  const finCommune = fins.filter(f => f === fins[0]).length > nbPages / 2 ? fins[0] : '';
  NOM_SITE = new Set(slug(`${hote(depart.hostname).split('.')[0]} ${finCommune}`, 99, 9999).split('-'));
  if (process.env.DEBUG) console.log('nom du site :', [...NOM_SITE].join(' '));
  const candidats = [];
  for (const g of groupes.values()) {
    const r = g.releves;
    const indices = `${g.cle} ${r.map(x => `${x.alt} ${x.classes} ${x.titre}`).join(' ')}`;
    const pasLogo = r.every(x => /(payment|paiement|paypal|visa|mastercard|carte bancaire|partenaire|partner|label|certifi)/i.test(`${x.alt} ${x.classes}`));
    // Logo du client : mot logo dans l'en-tête ou le pied, ou avec le nom du site ; premier visuel de l'en-tête ; lien vers l'accueil.
    const duSite = x => [...NOM_SITE].some(m => m.length > 3 && slug(`${x.urls.map(u => path.basename(new URL(u).pathname)).join(' ')} ${x.wix?.nom || ''}`, 99, 9999).split('-').includes(m));
    const base = x => `${x.urls.map(u => path.basename(new URL(u).pathname)).join(' ')} ${x.wix?.nom || ''}`;
    const social = x => x.lien && RESEAUX.test(x.lien);
    // Logo du client (principal) : en-tête, lien vers l'accueil, ou mot logo avec le nom du site.
    let principal = !pasLogo && (r.some(x => !social(x) && (
      (x.zone === 'entete' && (/logo/i.test(`${base(x)} ${x.classes}`) || (x.vers_accueil && x.type === 'img')))
      || (/logo/i.test(base(x)) && duSite(x))))
      || (premiersEntete.has(g.cle) && !r.some(social)));
    // Autres logos (sous-marques, partenaires, labels) : mot logo dans le fichier ou sur un petit conteneur dédié.
    const autreLogo = !principal && r.some(x => !social(x) && (/logo/i.test(base(x)) || /\blogo\b/i.test(x.classes)));
    if (autreLogo && r.some(duSite)) principal = true;      // variante du logo du client (blanche, réduite…)
    const logo = principal || autreLogo;
    if (!logo) {
      if (DRAPEAU.test(g.cle)) { ecartees.push({ url: g.cle, raison: 'drapeau' }); continue; }
      if (ICONE.test(g.cle) || r.every(x => ICONE.test(`${x.alt} ${x.classes}`))) { ecartees.push({ url: g.cle, raison: 'icone' }); continue; }
      if (r.some(x => x.lien && RESEAUX.test(x.lien)) && r.every(x => x.rendu[0] && x.rendu[0] < 160)) { ecartees.push({ url: g.cle, raison: 'reseau social' }); continue; }
      if (nbPages >= 4 && g.pages.size >= Math.max(3, Math.ceil(nbPages * 0.8))) { ecartees.push({ url: g.cle, raison: `repetee sur ${g.pages.size}/${nbPages} pages` }); continue; }
      if (r.every(x => x.rendu[0] && x.rendu[0] < 48 && x.rendu[1] < 48)) { ecartees.push({ url: g.cle, raison: 'icone' }); continue; }
    }
    candidats.push({ ...g, logo, principal, indices });
  }

  // Télécharger (6 à la fois), en essayant l'original d'abord.
  const telecharges = [];
  let k = 0;
  const ouvrier = async () => {
    while (k < candidats.length) {
      const c = candidats[k++];
      let ok = null, erreur = '';
      for (const u of c.cands) {
        try { const t = await telecharger(u); ok = { ...(await decrire(t.buf, t.type, u)), url: u }; break; } catch (e) { erreur = e.message; }
      }
      if (!ok) { console.log(`ECHEC ${c.cle} : ${erreur}`); ecartees.push({ url: c.cle, raison: `echec : ${erreur}` }); continue; }
      if (c.logo && !ok.svg && Math.max(ok.largeur, ok.hauteur) < 64) { ecartees.push({ url: ok.url, raison: 'icone' }); continue; }
      // Une grande photo sans transparence n'est pas un logo, même rangée dans un conteneur « logo ».
      if (c.logo && !ok.svg && !ok.alpha && ok.largeur >= 1000 && !c.releves.some(x => x.zone === 'entete')) c.logo = c.principal = false;
      if (!c.logo && ok.svg) { ecartees.push({ url: ok.url, raison: 'svg decoratif' }); continue; }
      if (!c.logo && ok.largeur < LARGEUR_MIN) { ecartees.push({ url: ok.url, raison: `${ok.largeur} px de large` }); continue; }
      if (!c.logo && ok.largeur * ok.hauteur < 400 * 250) { ecartees.push({ url: ok.url, raison: `${ok.largeur}x${ok.hauteur}` }); continue; }
      const sha = crypto.createHash('sha1').update(ok.data).digest('hex');
      const dhash = ok.svg ? null : await empreinte(ok.data).catch(() => null);
      telecharges.push({ ...c, ...ok, sha, dhash });
    }
  };
  await Promise.all(Array.from({ length: 6 }, ouvrier));

  // Même image en plusieurs tailles (ou copie exacte) : garder la plus grande.
  telecharges.sort((a, b) => b.largeur * b.hauteur - a.largeur * a.hauteur || (a.logo ? -1 : 1));
  const garde = [];
  for (const t of telecharges) {
    const ratio = t.largeur / t.hauteur;
    const meme = garde.find(g => g.sha === t.sha || (t.dhash && g.dhash && hamming(g.dhash, t.dhash) <= 3 && Math.abs(g.largeur / g.hauteur - ratio) / ratio < 0.02 && g.alpha === t.alpha));
    if (meme) { meme.releves.push(...t.releves); for (const p of t.pages) meme.pages.add(p); meme.logo ||= t.logo; ecartees.push({ url: t.url, raison: `meme image que ${meme.url} en ${t.largeur}x${t.hauteur}` }); continue; }
    garde.push(t);
  }

  // Logos : marque principale, sous-marque (dans l'en-tête, le pied, ou même nom qu'une sous-marque) ou partenaire.
  const GENERIQUES = new Set('logo blanc noir white black couleur color png svg jpg webp services service paysage groupe footer header small petit grand'.split(' '));
  const motsMarque = t => new Set(slug(`${path.basename(new URL(t.url).pathname)} ${t.releves.map(x => x.alt).join(' ')}`, 99, 9999).split('-').filter(m => m.length > 3 && !GENERIQUES.has(m) && !/^\d+/.test(m) && !NOM_SITE.has(m)));
  const logos = garde.filter(t => t.logo);
  for (const t of logos) t.marque = t.principal ? 'principale' : t.releves.some(x => x.zone !== 'contenu') ? 'sous-marque' : null;
  const motsSous = new Set(logos.filter(t => t.marque === 'sous-marque').flatMap(t => [...motsMarque(t)]));
  for (const t of logos) if (!t.marque) t.marque = [...motsMarque(t)].some(m => motsSous.has(m)) ? 'sous-marque' : 'partenaire';
  const ordreMarque = { principale: 0, 'sous-marque': 1, partenaire: 2 };

  // Noms et drapeaux.
  const pris = new Set();
  const unique = n => { let x = n || 'image', i = 2; while (pris.has(x)) x = `${n}-${i++}`; pris.add(x); return x; };
  const resultat = [];
  const premiere = t => pages.findIndex(p => t.pages.has(p.url));
  for (const t of garde.sort((a, b) => (b.logo - a.logo) || (ordreMarque[a.marque] ?? 9) - (ordreMarque[b.marque] ?? 9) || premiere(a) - premiere(b))) {
    const r = t.releves.find(x => x.type === 'img' && x.zone === 'contenu') || t.releves.find(x => x.type !== 'og') || t.releves[0];
    const alt = t.releves.map(x => x.alt || x.wix?.alt).find(a => a && !inutile(a)) || '';
    const legende = t.releves.map(x => x.legende).find(Boolean) || '';
    const titre = t.releves.map(x => x.titre).find(a => a && !inutile(a)) || '';
    const brut = decodeURIComponent(path.basename(new URL(t.url).pathname)).replace(/~mv2/, '').replace(/\.\w+$/, '');
    const fichierOrigine = [t.releves.map(x => x.wix?.nom).find(Boolean)?.replace(/\.\w+$/, ''), brut].find(n => n && ORIGINE_UTILE(n)) || '';
    const section = r.section, page = r.h1 || r.titrePage;
    let nom, drapeau;
    if (t.logo) {
      const l = t.svg ? null : await luminance(t.data);
      const variante = slug(brut.replace(/\.(png|jpe?g|svg)$/i, ''), 3).split('-').filter(m => !/^(logo|png|svg|jpg|\d+px)$/.test(m)).join('-');
      const ton = t.svg ? '' : l > 0.62 && t.alpha ? 'clair' : l < 0.4 ? 'sombre' : '';
      const seul = t.marque === 'principale' && !pris.has('logo') && !pris.has(['logo', ton].filter(Boolean).join('-'));
      nom = unique(['logo', !seul && ORIGINE_UTILE(brut) ? variante : '', ton].filter(Boolean).join('-'));
      drapeau = 'logo';
    } else {
      nom = unique(slug(alt) || slug(legende) || slug(titre) || slug(fichierOrigine) || slug(section) || slug(page) || 'image');
      const chemins = [r.page, ...t.releves.map(x => x.lien)].filter(Boolean).map(u => { try { return new URL(u).pathname; } catch { return ''; } }).join(' ');
      drapeau = deviner(`${alt} ${legende} ${titre} ${fichierOrigine} ${section} ${page}`, chemins);
    }
    const fichier = `${nom}.${t.ext}`;
    // Photo réduite à LARGEUR_MAX sur son plus grand côté (sips -Z), sans changer de format ; les dimensions
    // d'origine restent dans recuperation.json (largeur_origine, hauteur_origine).
    let origine = null;
    if (LARGEUR_MAX && !t.svg && t.format !== 'gif' && Math.max(t.largeur, t.hauteur) > LARGEUR_MAX) {
      try {
        const img = sharp(t.data, { failOn: 'none' }).rotate().resize(LARGEUR_MAX, LARGEUR_MAX, { fit: 'inside', withoutEnlargement: true });
        const data = await (t.ext === 'png' ? img.png({ compressionLevel: 9, palette: false }) : t.ext === 'webp' ? img.webp({ quality: 90 }) : img.jpeg({ quality: 90, mozjpeg: true })).toBuffer();
        const m = await sharp(data).metadata();
        origine = { largeur: t.largeur, hauteur: t.hauteur };
        t.data = data; t.largeur = m.width; t.hauteur = m.height;
      } catch (e) { console.log(`(réduction impossible pour ${fichier} : ${e.message})`); }
    }
    fs.writeFileSync(path.join(SORTIE, fichier), t.data);
    const e = { fichier, nom, origine: t.url, page: r.page, pages: t.pages.size, emplacement: `${r.type}${r.zone !== 'contenu' ? ` (${r.zone})` : ''}`,
      contexte: { alt, legende, titre, section, page, fichier_origine: fichierOrigine }, largeur: t.largeur, hauteur: t.hauteur,
      ...(origine ? { largeur_origine: origine.largeur, hauteur_origine: origine.hauteur } : {}), poids: t.data.length, format: t.format, transparence: t.alpha, drapeau,
      ...(t.logo ? { marque: t.marque } : {}) };
    resultat.push(e);
    console.log(`OK ${fichier} ${t.largeur}x${t.hauteur} ${ko(t.data.length)} ${drapeau}${t.logo ? ` (${t.marque})` : ''}`);
  }

  const resume = ecartees.reduce((o, e) => { const k = e.raison.replace(/ .*/, '').replace(/^\d+$/, 'petite'); o[k] = (o[k] || 0) + 1; return o; }, {});
  ecrireJson(path.join(SORTIE, 'recuperation.json'), { site: depart.href, date: new Date().toISOString(), pages: pages.map(p => p.url), images: resultat, ecartees });
  console.log(`\n${resultat.length} images gardées sur ${pages.length} pages ; écartées : ${Object.entries(resume).map(([k, v]) => `${v} ${k}`).join(', ') || 'aucune'}`);
  // Pages du menu jamais lues (site qui charge ses pages en JavaScript, lien sans adresse) : signalées, pour
  // ne pas croire le site entier récupéré.
  const lues = new Set(pages.map(p => p.url));
  const menuNonLu = [...new Set(pages[0]?.menu || [])].filter(u => !lues.has(u));
  if (menuNonLu.length) console.log(`A REGARDER : ${menuNonLu.length} page(s) du menu non lue(s) : ${menuNonLu.join(', ')}`);
  const parPage = pages.map(p => [p.url, resultat.filter(e => e.page === p.url).length]);
  const vides = parPage.filter(([, n]) => !n).length;
  if (pages.length >= 3 && vides >= pages.length - 1) console.log(`A REGARDER : images trouvées sur une seule page sur ${pages.length} ; vérifier sur le site que les autres pages n'ont vraiment pas de photo.`);
  if (!opts['sans-zip']) {
    const { zipper } = await import('./zipper.mjs');
    const zips = zipper(SORTIE, { client: CLIENT, sortie: path.join(os.homedir(), 'Downloads'), fichiers: ['recuperation.json', ...resultat.map(e => e.fichier)] });
    if (!opts['sans-finder'] && process.platform === 'darwin') execFileSync('open', ['-R', zips[0]]);
  }
}
main().catch(e => { console.error(`ECHEC : ${e.stack || e.message}`); process.exit(1); });
