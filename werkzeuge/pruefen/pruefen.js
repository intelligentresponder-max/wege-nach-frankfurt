#!/usr/bin/env node
/* Prüft die Seite vor der Veröffentlichung. Alles lokal, nichts geht ins Netz.
 *  1. Textprüfung: Inline-Styles, Fremd-Dienste, Platzhalter, lang-Attribut
 *  2. Linkprüfung: zeigen alle internen Links und Dateien auf vorhandene Dateien?
 *  3. Browser (Chromium): kein Seitwärts-Scrollen bei 320/360/412 px, axe-core bei 360 px,
 *     keine Anfragen an Fremdserver, keine Fehler, keine 404
 * Aufruf:  node pruefen.js            (Exit-Code 1, wenn etwas durchfällt)
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..', '..');
const PREFIX = '/wege-nach-frankfurt/'; // wie bei GitHub Pages im Unterordner
const BREITEN = [320, 360, 412];
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const fehler = [];
const merk = (s) => { fehler.push(s); console.log('  FEHLER: ' + s); };

function seiten() {
  const out = [];
  (function lauf(d) {
    for (const n of fs.readdirSync(d, { withFileTypes: true })) {
      if (n.name.startsWith('.') || n.name === 'node_modules' || n.name === 'werkzeuge') continue;
      const p = path.join(d, n.name);
      if (n.isDirectory()) lauf(p); else if (n.name.endsWith('.html')) out.push(path.relative(ROOT, p));
    }
  })(ROOT);
  return out.sort();
}

function textpruefung(liste) {
  console.log('1. Textprüfung');
  for (const f of liste) {
    const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/\sstyle\s*=/.test(t) || /<style[\s>]/.test(t)) merk(`${f}: Inline-Style gefunden`);
    if (/tailwind|googleapis|gstatic|cdn\.jsdelivr|unpkg\.com|cdnjs/i.test(t)) merk(`${f}: Fremd-Dienst im Code`);
    if (/lorem ipsum/i.test(t)) merk(`${f}: Platzhaltertext`);
    if (!/<html lang="de"/.test(t)) merk(`${f}: lang="de" fehlt`);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'assets', 'css')).map((x) => 'assets/css/' + x)) {
    const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/googleapis|gstatic|https?:\/\//i.test(t.replace(/\/\*[\s\S]*?\*\//g, ''))) merk(`${f}: Fremd-Adresse im CSS`);
  }
}

function linkpruefung(liste) {
  console.log('2. Linkprüfung');
  for (const f of liste) {
    const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of t.matchAll(/(?:href|src)="([^"#?]+)"/g)) {
      const h = m[1];
      if (/^(https?:|mailto:|tel:)/.test(h)) continue;
      if (!fs.existsSync(path.resolve(ROOT, path.dirname(f), h))) merk(`${f}: Link zeigt ins Leere: ${h}`);
    }
  }
}

function server() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let u = decodeURIComponent(req.url.split('?')[0]);
      if (!u.startsWith(PREFIX)) { res.writeHead(404); return res.end(); }
      let p = path.join(ROOT, u.slice(PREFIX.length));
      if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end('nicht gefunden'); }
      if (fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    }).listen(0, '127.0.0.1', () => ok(s));
  });
}

async function browserpruefung(liste) {
  console.log('3. Browserprüfung');
  let playwright, axeQuelle;
  try { playwright = require('playwright'); } catch (e) { return merk('Playwright fehlt: im Ordner werkzeuge/pruefen "npm install" ausführen'); }
  try { axeQuelle = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { return merk('axe-core fehlt: "npm install" ausführen'); }
  const srv = await server();
  const base = `http://127.0.0.1:${srv.address().port}${PREFIX}`;
  const opt = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
  const b = await playwright.chromium.launch(opt);
  try {
    for (const w of BREITEN) {
      const p = await b.newPage({ viewport: { width: w, height: 800 } });
      const fremd = []; const probleme = [];
      p.on('request', (r) => { if (!r.url().startsWith(base)) fremd.push(r.url()); });
      p.on('pageerror', (e) => probleme.push(e.message));
      p.on('response', (r) => { if (r.status() >= 400) probleme.push(r.status() + ' ' + r.url()); });
      for (const f of liste) {
        await p.goto(base + f.split(path.sep).join('/'));
        await p.evaluate(() => document.fonts.ready);
        if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)) merk(`${f}: Seitwärts-Scrollen bei ${w} px`);
        if (w === 360) {
          await p.evaluate((a) => { (0, eval)(a); }, axeQuelle);
          const r = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
          for (const v of r.violations) merk(`${f}: axe ${v.id} (${v.impact}) an ${v.nodes.length} Stelle(n)`);
        }
      }
      console.log(`  ${w} px: ${liste.length} Seiten, Fremdanfragen: ${fremd.length}, Fehler: ${probleme.length}`);
      fremd.forEach((u) => merk('Fremdanfrage vor Klick: ' + u));
      probleme.forEach((x) => merk('Fehler im Browser: ' + x));
      await p.close();
    }
  } finally { await b.close(); srv.close(); }
}

(async () => {
  const liste = seiten();
  console.log(`${liste.length} Seiten: ${liste.join(', ')}`);
  textpruefung(liste);
  linkpruefung(liste);
  await browserpruefung(liste);
  console.log(fehler.length ? `\nDURCHGEFALLEN: ${fehler.length} Problem(e)` : '\nALLES IN ORDNUNG');
  console.log('Nicht geprüft: Screenreader (TalkBack), Tastatur-Durchgang, Schrift ohne Kästchen (Thai/Lao/Tigrinya), Handy-Test.');
  process.exit(fehler.length ? 1 : 0);
})();
