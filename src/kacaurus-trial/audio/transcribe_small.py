import sys, subprocess, numpy as np, wave, os
from faster_whisper import WhisperModel

def wav16k_mono(path):
    tmp = "/tmp/kacaurus_tr16k.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-i",path,"-ar","16000","-ac","1","-sample_fmt","s16",tmp],check=True)
    with wave.open(tmp,"rb") as w:
        n=w.getnframes()
        raw=w.readframes(n)
    x=np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768.0
    return x

model = WhisperModel("small", device="cpu", compute_type="int8")
for path in sys.argv[1:]:
    audio = wav16k_mono(path)
    segs, info = model.transcribe(audio, language="id", beam_size=5)
    words=[]
    for s in segs:
        words.append((round(s.start,2), round(s.end,2), s.text.strip()))
    print(path, "lang=", info.language, "prob=%.2f"%info.language_probability)
    for w in words: print("   ", w)
