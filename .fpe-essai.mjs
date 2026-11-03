import { chromium } from 'playwright';
import { RACINE, servir } from './outils/commun.mjs';
const OUT = process.argv[2];
const srv = await servir(RACINE);
const nav = await chromium.launch();
const log = [];
for (const [w, h, nom, mob] of [[1440, 900, 'bureau', 0], [390, 844, 'tel', 1], [820, 1180, 'tablette', 1]]) {
  const pg = await nav.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: 1 });
  pg.on('console', m => m.type() === 'error' && log.push(nom + ' console: ' + m.text()));
  pg.on('pageerror', e => log.push(nom + ' pageerror: ' + e.message));
  await pg.goto(srv.url + '/modules/formulaire-par-etapes/index.html'); await pg.waitForTimeout(800);
  await pg.locator('.fpe__carton').scrollIntoViewIfNeeded(); await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/${nom}-1.png` });
  await pg.click('[data-suivant]'); await pg.waitForTimeout(300);
  log.push(nom + ' focus après erreur : ' + await pg.evaluate(() => document.activeElement.name + ' / ' + document.activeElement.getAttribute('aria-describedby') + ' / ' + document.querySelector('.fpe__erreur:not([hidden])')?.textContent));
  await pg.screenshot({ path: `${OUT}/${nom}-1err.png` });
  await pg.keyboard.press('ArrowDown'); // sélectionne une carte au clavier
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
  log.push(nom + ' étape : ' + await pg.evaluate(() => document.querySelector('.fpe__etat').textContent + ' / focus ' + document.activeElement.className));
  await pg.click('[data-suivant]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/${nom}-2err.png` });
  await pg.click('.fpe__puce >> nth=0'); await pg.fill('#fpe-message', 'Bonjour, voici une demande de test.'); 
  await pg.click('[data-suivant]'); await pg.waitForTimeout(700);
  await pg.fill('#fpe-prenom', 'Camille'); await pg.fill('#fpe-nom', 'Martin'); await pg.fill('#fpe-email', 'pas-un-mail');
  await pg.click('[data-suivant]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: `${OUT}/${nom}-3err.png` });
  await pg.fill('#fpe-email', 'camille@exemple.fr'); await pg.click('.fpe__case');
  await pg.click('[data-suivant]'); await pg.waitForTimeout(700);
  await pg.screenshot({ path: `${OUT}/${nom}-4.png` });
  await pg.click('[data-aller="1"]'); await pg.waitForTimeout(600);
  log.push(nom + ' bouton suivant après modifier : ' + await pg.locator('[data-suivant]').textContent());
  await pg.click('[data-suivant]'); await pg.waitForTimeout(600);
  log.push(nom + ' retour recap : ' + await pg.evaluate(() => document.querySelector('.fpe__etat').textContent));
  await pg.click('[type=submit]'); await pg.waitForTimeout(1200);
  await pg.screenshot({ path: `${OUT}/${nom}-5.png` });
  log.push(nom + ' fin : ' + await pg.evaluate(() => document.activeElement.textContent + ' | ' + document.querySelector('[data-mailto]').href.slice(0, 90) + ' | journal ' + document.querySelector('[data-journal]').textContent.slice(0, 120).replace(/\n/g, ' ')));
  await pg.close();
}
// Sans JavaScript
const ctx = await nav.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const p2 = await ctx.newPage(); await p2.goto(srv.url + '/modules/formulaire-par-etapes/index.html');
await p2.locator('.fpe__carton').scrollIntoViewIfNeeded(); await p2.screenshot({ path: `${OUT}/sansjs.png`, fullPage: true });
await nav.close(); await srv.fermer();
console.log(log.join('\n'));
