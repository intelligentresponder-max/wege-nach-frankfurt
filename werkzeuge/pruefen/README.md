# pruefen – Prüfwerkzeug vor der Veröffentlichung

Prüft alle Seiten lokal. Es geht nichts ins Netz.

## Einrichten (einmal)
    cd werkzeuge/pruefen
    npm install
    npx playwright install chromium
(Wenn Chromium schon da ist: `PW_CHROMIUM=/pfad/zu/chromium` setzen.)

## Prüfen
    node werkzeuge/pruefen/pruefen.js
Ergebnis: „ALLES IN ORDNUNG" oder eine Liste der Probleme (Exit-Code 1).

## Was geprüft wird
1. Keine Inline-Styles, keine Fremd-Dienste (Tailwind, Google, CDN), kein Platzhaltertext, `lang="de"`.
2. Alle internen Links und Dateien zeigen auf vorhandene Dateien.
3. Im Browser (Chromium) bei 320, 360 und 412 px: kein Seitwärts-Scrollen, keine Anfragen an Fremdserver, keine 404 oder Skriptfehler. Bei 360 px zusätzlich axe-core (Barrierefreiheit).

## Was nicht geprüft wird
Screenreader (TalkBack), Tastatur-Durchgang, Schrift ohne Kästchen (Thai, Lao, Tigrinya) und der Handy-Test. Das bleibt Handarbeit.

## Grenzen
- Läuft nicht in Termux. Gedacht für eine Claude-Sitzung, einen Rechner oder eine CI.
- Die Seite wird unter dem Ordnernamen `/wege-nach-frankfurt/` ausgeliefert, wie bei GitHub Pages.
