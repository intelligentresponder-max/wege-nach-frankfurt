---
name: ja2de
description: Japanische (oder Thai/Lao) Audio- und Videodateien lokal in Text und deutsche Untertitel umwandeln. Verwenden, wenn der Nutzer eine Aufnahme transkribieren oder ins Deutsche übersetzen lassen will.
---

# ja2de

Tool im Repo: `werkzeuge/ja2de/`. Lies zuerst `werkzeuge/ja2de/README.md`.

1. Einrichten, falls `werkzeuge/ja2de/.venv` fehlt: `bash werkzeuge/ja2de/setup.sh` (ca. 4,5 GB, einige Minuten).
2. Ausführen: `werkzeuge/ja2de/.venv/bin/python werkzeuge/ja2de/ja2de.py <datei> --ausgabe <ordner außerhalb des Repos>`.
   Dauer bei 1 Minute Ton: large-v3 ca. 80 Sekunden, Übersetzung ca. 10 Sekunden, ohne parallele Läufe. Lange Läufe im Hintergrund starten.
3. Ergebnis ist ein Rohentwurf. Die Übersetzung verbessern, Unsicheres kennzeichnen, Muttersprachler-Prüfung empfehlen.
4. Medien und Ergebnisse mit Personen nie ins Repo committen. Einwilligung erfragen.
5. Tigrinya wird nicht unterstützt (kein Whisper-Modell, kein automatischer YouTube-Untertitel).
6. Übersetzungsmodell NLLB ist nur für nicht-kommerzielle Nutzung lizenziert (CC-BY-NC 4.0). Bei Einnahmen-Projekten darauf hinweisen und `--nur-text` anbieten.
