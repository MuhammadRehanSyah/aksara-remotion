#!/usr/bin/env python3
"""Apply corrective gain so each scene lands at -15.2 LUFS integrated."""
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = Path.home() / "workspace" / "remotion" / "public" / "audio"
TARGET = -15.2


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAILED:", " ".join(cmd), file=sys.stderr)
        print(r.stderr[-1500:], file=sys.stderr)
        raise SystemExit(1)
    return r


def measure(path):
    r = run(["ffmpeg", "-hide_banner", "-i", str(path), "-af",
             "loudnorm=I=-15.2:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"])
    m = re.findall(r"\{[^}]*\}", r.stderr)
    return json.loads(m[-1])


for src in sorted(BASE.glob("scene*.mp3")):
    cur = measure(src)
    gain = TARGET - float(cur["input_i"])
    tmp = src.with_suffix(".tmp.mp3")
    run(["ffmpeg", "-hide_banner", "-y", "-i", str(src), "-af", f"volume={gain:.2f}dB",
         "-b:a", "192k", str(tmp)])
    new = measure(tmp)
    print(f"{src.name}: {cur['input_i']} + {gain:.2f}dB -> {new['input_i']} LUFS, TP={new['input_tp']}")
    tmp.replace(src)
