#!/usr/bin/env python3
"""Japanisch -> Deutsch: Audio oder Video in Text und Untertitel umwandeln.

Alles läuft lokal. Es wird nichts an einen Online-Dienst geschickt.
Schritt 1: Spracherkennung (faster-whisper, Modell large-v3)
Schritt 2: Übersetzung ins Deutsche (NLLB-200 1.3B, CTranslate2)
Ergebnis: <name>.ja.srt, <name>.de.srt, <name>.txt, <name>.json
Das Ergebnis ist ein Rohentwurf und muss von einem Muttersprachler geprüft werden.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

WHISPER_STANDARD = "large-v3"
UEBERSETZER_STANDARD = "OpenNMT/nllb-200-distilled-1.3B-ct2-int8"
NLLB_QUELLE = {"ja": "jpn_Jpan", "th": "tha_Thai", "lo": "lao_Laoo", "en": "eng_Latn"}


def zeit_srt(sek):
    ms = int(round(sek * 1000))
    h, rest = divmod(ms, 3600000)
    m, rest = divmod(rest, 60000)
    s, ms = divmod(rest, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def zeit_kurz(sek):
    m, s = divmod(int(sek), 60)
    return f"{m}:{s:02d}"


def audio_vorbereiten(datei, ordner):
    if not shutil.which("ffmpeg"):
        sys.exit("Fehler: ffmpeg fehlt. Installieren (z. B. apt install ffmpeg).")
    wav = os.path.join(ordner, "audio.wav")
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", datei, "-vn", "-ac", "1", "-ar", "16000", wav],
                       capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(wav):
        sys.exit("Fehler: Die Datei hat keine lesbare Tonspur.\n" + r.stderr[-400:])
    return wav


def erkennen(wav, modell, sprache, modelle):
    from faster_whisper import WhisperModel
    m = WhisperModel(modell, device="cpu", compute_type="int8", download_root=modelle)
    segs, info = m.transcribe(wav, language=sprache, beam_size=5, vad_filter=True,
                              condition_on_previous_text=False)
    out = [{"start": s.start, "ende": s.end, "text": s.text.strip()} for s in segs if s.text.strip()]
    return out, info


def uebersetzer_laden(repo, modelle):
    import ctranslate2
    from huggingface_hub import snapshot_download
    from tokenizers import Tokenizer
    pfad = snapshot_download(repo, cache_dir=modelle)
    tok = Tokenizer.from_file(os.path.join(pfad, "tokenizer.json"))
    tr = ctranslate2.Translator(pfad, device="cpu", compute_type="int8")
    return tr, tok


def uebersetzen(segmente, tr, tok, quelle):
    src = NLLB_QUELLE[quelle]
    batch = [[src] + tok.encode(s["text"], add_special_tokens=False).tokens + ["</s>"] for s in segmente]
    res = tr.translate_batch(batch, target_prefix=[["deu_Latn"]] * len(batch), beam_size=4,
                             max_decoding_length=256, repetition_penalty=1.1)
    for s, r in zip(segmente, res):
        toks = r.hypotheses[0][1:]  # Sprachkürzel am Anfang weglassen
        s["de"] = tok.decode(tok.convert_tokens_to_ids(toks) if hasattr(tok, "convert_tokens_to_ids")
                             else [tok.token_to_id(t) for t in toks]).strip()
    return segmente


def srt_schreiben(pfad, segmente, feld):
    with open(pfad, "w", encoding="utf-8") as f:
        for i, s in enumerate(segmente, 1):
            f.write(f"{i}\n{zeit_srt(s['start'])} --> {zeit_srt(s['ende'])}\n{s[feld]}\n\n")


def main():
    p = argparse.ArgumentParser(description="Japanisch (oder Thai/Lao) in Text und deutsche Untertitel umwandeln.")
    p.add_argument("datei", help="Audio- oder Videodatei")
    p.add_argument("--ausgabe", default=None, help="Ordner für die Ergebnisse (Standard: neben der Datei)")
    p.add_argument("--sprache", default="ja", choices=sorted(NLLB_QUELLE), help="gesprochene Sprache (Standard: ja)")
    p.add_argument("--nur-text", action="store_true", help="nur erkennen, nicht ins Deutsche übersetzen")
    p.add_argument("--whisper", default=WHISPER_STANDARD, help="Whisper-Modell (Standard: large-v3, schnell: small)")
    p.add_argument("--uebersetzer", default=UEBERSETZER_STANDARD, help="Übersetzungsmodell auf Hugging Face")
    p.add_argument("--modelle", default=os.environ.get("JA2DE_MODELLE"), help="Ordner für Modelle (Standard: Hugging-Face-Cache)")
    a = p.parse_args()

    if not os.path.isfile(a.datei):
        sys.exit(f"Fehler: Datei nicht gefunden: {a.datei}")
    ordner = a.ausgabe or os.path.dirname(os.path.abspath(a.datei))
    os.makedirs(ordner, exist_ok=True)
    name = os.path.join(ordner, os.path.splitext(os.path.basename(a.datei))[0])
    t0 = time.time()

    with tempfile.TemporaryDirectory() as tmp:
        wav = audio_vorbereiten(a.datei, tmp)
        print("1/2 Sprache erkennen ...", file=sys.stderr)
        segmente, info = erkennen(wav, a.whisper, a.sprache, a.modelle)
    t1 = time.time()
    if not segmente:
        sys.exit("Keine Sprache gefunden. Ton zu leise oder keine Sprache?")

    if not a.nur_text:
        print("2/2 Ins Deutsche übersetzen ...", file=sys.stderr)
        tr, tok = uebersetzer_laden(a.uebersetzer, a.modelle)
        segmente = uebersetzen(segmente, tr, tok, a.sprache)
    t2 = time.time()

    srt_schreiben(f"{name}.{a.sprache}.srt", segmente, "text")
    if not a.nur_text:
        srt_schreiben(f"{name}.de.srt", segmente, "de")
    with open(f"{name}.txt", "w", encoding="utf-8") as f:
        for s in segmente:
            f.write(f"[{zeit_kurz(s['start'])}] {s['text']}\n")
            if "de" in s:
                f.write(f"        {s['de']}\n")
    with open(f"{name}.json", "w", encoding="utf-8") as f:
        json.dump({"datei": os.path.basename(a.datei), "sprache": a.sprache, "whisper": a.whisper,
                   "uebersetzer": None if a.nur_text else a.uebersetzer, "segmente": segmente},
                  f, ensure_ascii=False, indent=1)

    for s in segmente:
        print(f"[{zeit_kurz(s['start']):>5}] {s['text']}")
        if "de" in s:
            print(f"        -> {s['de']}")
    print(f"\nFertig. Erkennen {t1 - t0:.0f} s, Übersetzen {t2 - t1:.0f} s. Dateien: {name}.*", file=sys.stderr)
    print("Hinweis: Rohentwurf. Muttersprachler prüfen lassen.", file=sys.stderr)


if __name__ == "__main__":
    main()
