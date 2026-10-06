# FEHLER-LOG

## Behobene Fehler
Vorlage: Datum – Was passiert – Ursache – Behebung – Lernpunkt.

### Bekannt aus BanglaHilfe (von Anfang an vermieden)
| # | Was passiert | Ursache | Behebung / Regel |
|---|---|---|---|
| 1 | Skript-Ersetzung traf zu viele Stellen | Gemeinsame Präfixe (z. B. `st` ersetzt auch `st-grid`) | Nur exakte, ganze Treffer ersetzen; danach `grep` prüfen |
| 2 | Seiten sahen sich gegenseitig ähnlich / kaputt | Gleiche CSS-Klassen in mehreren Dateien | Klassenpräfix pro Seitentyp (siehe CLAUDE.md) |
| 3 | Text auf Bildern kaum lesbar | Zu dunkle Overlays | Overlay hell halten, Kontrast am Handy prüfen |
| 4 | Schriften/Bilder in CSS nicht gefunden | Pfade waren relativ zur HTML statt zur CSS-Datei | Pfade in CSS relativ zur CSS-Datei |
| 5 | Tofu-Kästchen statt Schrift | Keine Noto-Fonts für nicht-lateinische Schrift | Lokale Noto-Fonts, jede Seite visuell prüfen |

### Neu in diesem Projekt
**2026-10-05 – Seite „Datenschutzerklärung“ lief am Handy über den Rand**
- Was: Beim Test mit 360 px Breite war die Seite breiter als der Bildschirm (Seitwärts-Scrollen).
- Ursache: Die Überschrift war 1,9 rem groß, das lange Wort „Datenschutzerklärung“ passte nicht in die Zeile und wurde nicht umgebrochen.
- Behebung: Überschriften etwas kleiner (1,7 rem) und mit Silbentrennung/Umbruch (`hyphens:auto`, `overflow-wrap`).
- Lernpunkt: Lange deutsche Wörter in Überschriften immer bei 360 px testen. Der automatische Test prüft `scrollWidth > Breite` pro Seite.

**2026-10-05 – AP6: Dead Link auf ueber.html**
- Was: Der Menüpunkt „Über das Projekt“ stand auf allen Seiten, die Datei gab es nicht (404).
- Ursache: Menü wurde in AP1 gebaut, die Seite war in keinem Arbeitspaket eingeplant.
- Behebung: `ueber.html` gebaut, nur mit Aussagen aus dem Projektauftrag (keine erfundenen Angaben).
- Lernpunkt: Nach jedem Paket alle internen Links mit einem Skript prüfen (Datei existiert?).

**AP6-Testprotokoll (2026-10-05, Headless-Chromium, lokal im Unterordner /wege-nach-frankfurt/ serviert)**
- Breiten 320, 360, 412 px: kein Seitwärts-Scrollen auf allen 9 Seiten.
- Keine Anfragen an Fremdserver, keine 404 bei CSS/JS/Schriften, keine JS-Fehler.
- Noto Thai, Lao, Ethiopic (400/700) laden; Tofu-Test auf der Testseite bei ti/th/lo bestanden.
- Keine Inline-Styles, kein Tailwind/Google, kein Platzhaltertext.
- Noch nicht möglich: Test der echten Live-Adresse (Sandbox ohne Zugriff) und echtes Handy. André prüft am Handy.
- Bengali-Schrift ist eingebunden, wird aber nicht geladen (keine bn-Seite).
- `schrifttest.html` und die ZIP-Datei sind entfernt.

**2026-10-05 – Seite nach dem ersten Merge nicht erreichbar (404)**
- Was: Nach Pages-Aktivierung zeigte die Adresse „There isn't a GitHub Pages site here“.
- Ursache: GitHub-Actions-Störung (Runner-Zuteilung verzögert, githubstatus.com, seit 19:11 UTC). Die Pages-Veröffentlichung läuft über Actions. Drei Läufe wurden durch schnell aufeinanderfolgende Merges abgebrochen, der vierte hing 30 Minuten in der Warteschlange und endete mit „failure“. Es wurde nie etwas veröffentlicht. Der Code war nicht schuld.
- Behebung: Nach Ende der Störung neuen Lauf auslösen (Re-run oder neuer Merge auf `main`).
- Lernpunkt: Bei 404 zuerst githubstatus.com und den Actions-Reiter prüfen (Status der Lauf-Einträge). Nicht mehrere PRs kurz hintereinander mergen, solange der Lauf davor nicht grün ist. Die Re-run-Funktion geht für Claude per API nicht (403), das muss André selbst anstoßen.

## Entscheidungen
### 2026-10-05 – Kein Tailwind per CDN
- Auftrag sah Tailwind-CDN vor.
- Prüfung: Das CDN lädt bei jedem Seitenaufruf von einem Fremdserver (IP-Weitergabe, DSGVO-Risiko). Das widerspricht „kein Fremdserver-Aufruf“. Außerdem ist das CDN-Skript laut Tailwind nicht für den Produktivbetrieb gedacht (läuft im Browser, langsam auf dem Handy).
- Alternative: Tailwind-CLI lokal bauen – braucht Node/Build, in Termux unnötig fragil.
- Entscheidung: Eigenes kleines CSS (`assets/css/site.css`), kein Build, kein Fremdserver.
- Wenn André doch Tailwind will: Vorher mit ihm klären.

### 2026-10-05 – Sprachumschalter ohne ungeprüfte Übersetzungen
- Umschalter ist fertig (Deutsch + Tigrinya/Thai/Lao). Ein Knopf ist nur aktiv, wenn die Seite einen Block in dieser Sprache hat.
- Es gibt noch keine Übersetzungen der Webseiten-Texte, daher sind die Knöpfe auf den echten Seiten ausgegraut, bis ein Muttersprachler geprüft hat.
- Gespeichert wird die Wahl nur im Browser (localStorage), nichts geht an einen Server.

### 2026-10-05 – Wiederholter Header/Footer statt Nachladen
- Kein JS-Include (Fremdlade-/Ausfallrisiko, Seite leer ohne JS). Header/Footer stehen in jeder Datei. Bei Änderungen alle Dateien mit demselben Muster prüfen (`grep -L`).

### 2026-10-05 – GitHub Pages
- Pages braucht Einstellung in GitHub (Settings → Pages → Branch `main`, Ordner `/ (root)`). `.nojekyll` liegt im Repo.

### 2026-10-05 – Leere Listen statt Beispiel-Geschichten (AP2)
- Übersicht und Länderseiten zeigen ehrlich „noch keine Geschichte“. Keine Beispielpersonen. Der Filter (`assets/js/filter.js`) arbeitet mit `li.ls-item[data-land]`; sobald die erste Geschichte da ist, kommt sie dort hinein.
- Länderseiten haben noch keine Hilfe-Anlaufstellen: Nur öffentliche, geprüfte Stellen, Liste kommt von André.
- Eigene CSS-Dateien pro Seitentyp (`start.css`, `liste.css`, `land.css`) wegen Klassenkollisionen.

### 2026-10-05 – WhatsApp-Nummer öffentlich
- Die Nummer steht im Link auf `mitmachen.html` und `impressum.html` (öffentliches Repo, nicht mehr löschbar aus der Git-Historie).
- Risiko: Spam und Anrufe. Alternative wäre eine Zweitnummer gewesen.
- Entscheidung: André hat bestätigt, dass es seine Projekt-Nummer ist und öffentlich sein darf.

### 2026-10-05 – Klick-Einbettung ohne Vorschaubild (AP3 vorab)
- Alternativen geprüft: (a) Direkt-iframe: lädt sofort bei Seitenaufruf, verletzt Regel 5. (b) YouTube-Vorschaubild (i.ytimg.com): Fremdaufruf vor dem Klick, verboten. (c) Fertige Bibliothek (lite-youtube-embed): zusätzliche Fremdcode-Abhängigkeit und lädt Vorschaubild. 
- Entscheidung: Eigener kleiner Code (~25 Zeilen), Hinweiskarte, iframe erst nach Klick, `youtube-nocookie.com`, ID wird geprüft (nur 11 Zeichen A-Z a-z 0-9 _ -), `referrerpolicy` gesetzt (YouTube verlangt für Einbettungen einen Referrer).
- Test (Headless-Chromium, 360 px): vor dem Klick 0 Fremdanfragen; nach dem Klick genau ein Aufruf an youtube-nocookie.com; ohne JavaScript erscheint der Hinweis statt Knopf, kein Fremdaufruf.
- Nicht getestet: Abspielen selbst (Sandbox ohne Internet) und iPhone/Safari. Mit dem ersten echten Video am Handy prüfen.

## Offene Punkte
- Pages in GitHub aktivieren (André, Handy-Browser).
- YouTube-Kanal + Link, erste Geschichte mit Einwilligung, WhatsApp-Nummer, Muttersprachler-Prüfung.
- Impressum und Datenschutz sind Entwurf (AP5): Name, Anschrift, Speicherdauer, USA-Übermittlung, Einwilligungsformular offen; rechtlich prüfen lassen.

- Hilfe-Anlaufstellen für die Länderseiten (öffentliche Stellen, von André).
