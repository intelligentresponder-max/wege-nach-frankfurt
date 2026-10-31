#!/usr/bin/env bash
# Einmal ausführen: richtet das Tool ein und lädt die Modelle (ca. 4,5 GB, ein paar Minuten).
set -euo pipefail
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg fehlt. Bitte installieren (z. B. apt install ffmpeg)."; exit 1; }
python3 -m venv .venv
.venv/bin/pip -q install -r requirements.txt
.venv/bin/python - <<'PY'
from huggingface_hub import snapshot_download
for repo in ("Systran/faster-whisper-large-v3", "OpenNMT/nllb-200-distilled-1.3B-ct2-int8"):
    print("Lade", repo, "...")
    snapshot_download(repo)
print("Fertig.")
PY
echo "Start: werkzeuge/ja2de/.venv/bin/python werkzeuge/ja2de/ja2de.py DATEI"
