import sys, subprocess, numpy as np, wave
from faster_whisper import WhisperModel
def wav16k_mono(path):
    tmp = "/tmp/kacaurus_mix16k.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-i",path,"-ar","16000","-ac","1","-sample_fmt","s16",tmp],check=True)
    with wave.open(tmp,"rb") as w:
        raw=w.readframes(w.getnframes())
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768.0
model = WhisperModel("small", device="cpu", compute_type="int8")
audio = wav16k_mono(sys.argv[1])
segs, info = model.transcribe(audio, language="id", beam_size=5, word_timestamps=True)
for s in segs:
    print(f"SEG {s.start:.2f}-{s.end:.2f}: {s.text.strip()}")
    for w in s.words:
        print(f"    {w.start:.2f}-{w.end:.2f}  {w.word}")
