# CLAUDE.md – Regeln für dieses Repo

Projekt: Mehrsprachige Story-Seite „Wege nach Frankfurt“ (Eritrea, Thailand, Laos).
Live: https://intelligentresponder-max.github.io/wege-nach-frankfurt/ (GitHub Pages, Unterordner!)
Betreuer: André, arbeitet in Termux auf Android. Antworten kurz, ohne Fachjargon.

## Technik
- Statisches HTML5, mehrseitig, kein Build-Schritt, kein Framework.
- Kein Tailwind-CDN (siehe FEHLER-LOG „Entscheidungen“): eigenes CSS in `assets/css/`.
- Keine Inline-Styles, kein Lorem Ipsum, keine Platzhaltertexte.
- Schriften nur lokal: `assets/fonts/fonts.css`. Nie von Google laden.
- Pfade relativ. Root-Seiten: `assets/...`; Unterordner (`geschichten/`, `laender/`): `../assets/...`.
  Pfade in CSS gelten relativ zur CSS-Datei.
- `lang` setzen: de, ti, th, lo (bn nur falls nötig). Fremdsprachige Blöcke: `class="wf-l" lang="ti"`.
- Klassenpräfix pro Seitentyp: `wf-` Basis (Header/Footer/Layout), `st-` Startseite, `ls-` Geschichten-Übersicht,
  `sg-` Story-Seite, `ld-` Länderseiten, `mm-` Mitmachen, `rt-` Rechtstexte. Keine Klasse ohne Präfix.
- Ersetzungen per Skript nur mit genauen Treffern (Präfix-Bug, siehe FEHLER-LOG).

## Datenschutz (verbindlich)
1. Schriftliche, widerrufbare Einwilligung pro Person vor Veröffentlichung.
2. Eritrea: Anonymität anbieten (Vorname/Pseudonym, kein Gesicht, veränderte Stimme, keine Ortsnamen von Angehörigen).
3. Keine Angaben zu Aufenthaltsstatus oder Asylverfahren.
4. Keine Klarnamen, Fotos oder Einwilligungen im Repo (öffentlich).
5. YouTube nur als Klick-Einbettung (youtube-nocookie.com), vorher Hinweistext, vor dem Klick kein Fremdserver-Aufruf.
6. Kein Analytics ohne Rücksprache.
7. Impressum/Datenschutz nur als Entwurf, deutlich als „offen“ markiert.

## Inhalte
- Inhalte kommen von André. Keine erfundenen Geschichten oder Personen. Fehlt etwas: melden, nicht füllen.
- Übersetzungen (ti/th/lo) erst veröffentlichen, wenn ein Muttersprachler sie geprüft hat.
- Hilfe-Hinweise nur mit öffentlichen Anlaufstellen.

## Arbeitsweise
- Nach jedem Arbeitspaket committen und deployen.
- Jeder behobene Fehler kommt in `FEHLER-LOG.md` (Datum, Was, Ursache, Behebung, Lernpunkt).
- Neue Alternativen vorher auf Nutzen und Sicherheit prüfen, unter „Entscheidungen“ notieren.
- Jede Seite mit Thai/Lao/Tigrinya visuell prüfen (Tofu-Kästchen). Mobile Breite 360 px.
- Overlays hell genug, Kontrast am Handy prüfen.
