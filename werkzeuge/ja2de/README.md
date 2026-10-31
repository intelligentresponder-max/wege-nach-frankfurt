# ja2de – Japanisch zu Deutsch (Audio/Video zu Text und Untertitel)

Alles läuft lokal. Es gehen keine Daten an einen Online-Dienst.

## Einrichten (einmal)
    bash werkzeuge/ja2de/setup.sh
Lädt ca. 4,5 GB Modelle von Hugging Face (Whisper large-v3 und NLLB 1.3B) und legt `.venv` an.

## Benutzen
    werkzeuge/ja2de/.venv/bin/python werkzeuge/ja2de/ja2de.py datei.mp4
Ergebnis neben der Datei (oder mit `--ausgabe ORDNER`):
`name.ja.srt`, `name.de.srt`, `name.txt` (zweisprachig), `name.json`.

| Option | Wirkung |
| --- | --- |
| `--nur-text` | nur erkennen, nicht übersetzen |
| `--whisper small` | viel schneller, aber deutlich ungenauer |
| `--sprache th` oder `lo` | Thai oder Lao statt Japanisch (Tigrinya geht nicht) |
| `--modelle ORDNER` | eigener Ordner für die Modelle |

## Wie schnell (Test: 57 s Ton, 4 CPU-Kerne ohne Grafikkarte)
- Erkennen mit large-v3: ca. 80 Sekunden (gut das 1,4-Fache der Dauer, wenn das Modell schon geladen ist). Mit small: ca. 30 bis 45 Sekunden.
- Übersetzen: ca. 10 Sekunden. Beim ersten Mal kommt der Download der Modelle dazu.
- Zwei Läufe gleichzeitig machen alles deutlich langsamer (im Test das Dreifache).

## Wie gut
- Erkennung mit large-v3 ist gut. Die kleine Fassung macht viele Fehler.
- Die Übersetzung arbeitet Satz für Satz ohne Zusammenhang. Alltagswörter und Slang gehen oft schief (Test: „Unterhose" wurde zu „Hosen", „Reißverschluss" zu „Scheck").
- Immer als Rohentwurf behandeln und von einer Muttersprachlerin oder einem Muttersprachler prüfen lassen.
- Wichtige Texte: Erkennung nutzen, die Übersetzung in einer Claude-Sitzung nachbessern lassen.

## Lizenzen
- Whisper large-v3 (Fassung von Systran): MIT (laut Hugging Face, am 31.10.2026 geprüft).
- NLLB-200 (Meta, hier die CTranslate2-Fassung von OpenNMT): **CC-BY-NC 4.0, also nur nicht-kommerzielle Nutzung** (laut Hugging Face, am 31.10.2026 geprüft). Ob ein Verein mit Einnahmen darunter fällt, muss er selbst klären. Wer das Risiko meiden will, nutzt `--nur-text` und lässt die Übersetzung von Menschen oder in einer Claude-Sitzung machen.

## Datenschutz
- Audio und Videos von Personen nie ins Repo legen (`.gitignore` blockiert gängige Formate).
- Vor dem Übersetzen von Interviews: schriftliche Einwilligung der Person.

## Grenzen
- Läuft nicht in Termux (Android). Gedacht für eine Claude-Sitzung oder einen Rechner mit Linux.
- Nur gesprochene Sprache. Text im Bild erkennt das Tool nicht.
- Keine Sprechertrennung.
