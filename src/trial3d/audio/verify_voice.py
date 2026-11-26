"""Transkripsi balik voice.wav Trial3D (verifikasi kata + word timings).
Pola terbukti: ekstrak WAV 16 kHz mono via ffmpeg, beri array NumPy float32
ke model.transcribe() (jangan decoding file langsung — PyAV venv ini rusak).
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

VOICE = "/home/hatch/workspace/remotion/src/trial3d/voice/voice.wav"
OUT = "/home/hatch/workspace/remotion/src/trial3d/voice/words.json"

# 16 kHz mono float32 via ffmpeg (stdout pipe)
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", VOICE, "-ac", "1", "-ar", "16000",
     "-f", "f32le", "-"],
    capture_output=True, check=True,
).stdout
audio = np.frombuffer(raw, dtype=np.float32)
print(f"audio: {len(audio)} samples = {len(audio) / 16000:.2f} dtk", flush=True)

model = WhisperModel("tiny", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    audio, language="id", word_timestamps=True, beam_size=5,
)
print(f"bahasa terdeteksi: {info.language} (prob {info.language_probability:.2f})")

words = []
full = []
for seg in segments:
    full.append(seg.text.strip())
    for w in seg.words:
        words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    print(f"[{seg.start:.2f}-{seg.end:.2f}] {seg.text.strip()}")

print("\nTEKS LENGKAP:", " ".join(full))
print(f"jumlah kata: {len(words)}")
with open(OUT, "w") as f:
    json.dump({"text": " ".join(full), "words": words}, f, indent=1, ensure_ascii=False)
print("words.json tersimpan:", OUT)
