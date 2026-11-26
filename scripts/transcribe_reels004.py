#!/usr/bin/env python3
"""Transcribe normalized Reels #003 narration with faster-whisper tiny (CPU).
Extracts 16 kHz mono WAV with ffmpeg first (PyAV decode is incompatible),
then decodes via the wave module into a float32 numpy array."""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

BASE = Path.home() / "workspace" / "remotion" / "public" / "audio" / "reels004"
WORK = Path.home() / "workspace" / ".tmp-whisper"


def transcribe(mp3_path):
    wav = WORK / f"reels004_{mp3_path.stem}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3_path),
                    "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", str(wav)],
                   check=True)
    with wave.open(str(wav), "rb") as w:
        raw = w.readframes(w.getnframes())
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    from faster_whisper import WhisperModel
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, language="id", beam_size=5)
    texts = [s.text.strip() for s in segments]
    print(f"== {mp3_path.name} (lang={info.language} p={info.language_probability:.2f})")
    print(" ".join(texts))
    print()


def main():
    files = sys.argv[1:] or sorted(str(p) for p in BASE.glob("scene*.mp3"))
    for f in files:
        transcribe(Path(f))


if __name__ == "__main__":
    main()
