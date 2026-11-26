#!/usr/bin/env python3
"""Trim silence + two-pass loudnorm to -15.2 LUFS for Reels #007 narration.
Reads raw/*.mp3, writes normalized scene*.mp3 next to raw/ (same pattern as
scripts/normalize_audio.py for Reels #002, scoped to reels007 only)."""
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = Path.home() / "workspace" / "remotion" / "public" / "audio" / "reels007"
RAW = BASE / "raw"
TARGET_I, TARGET_TP, TARGET_LRA = -15.2, -1.5, 11.0
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAILED:", " ".join(cmd), file=sys.stderr)
        print(r.stderr[-2000:], file=sys.stderr)
        raise SystemExit(1)
    return r


def measure(path):
    r = run(["ffmpeg", "-hide_banner", "-i", str(path), "-af",
             f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
             "-f", "null", "-"])
    m = re.findall(r"\{[^}]*\}", r.stderr)
    return json.loads(m[-1])


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)])
    return float(r.stdout.strip())


def main():
    for raw in sorted(RAW.glob("scene*.mp3")):
        src = BASE / raw.name
        r = run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af",
                 f"{TRIM},loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
                 "-f", "null", "-"])
        m = re.findall(r"\{[^}]*\}", r.stderr)
        meas = json.loads(m[-1])
        filt = (f"{TRIM},loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}"
                f":measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
                f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}"
                f":offset={meas['target_offset']}:linear=true")
        run(["ffmpeg", "-hide_banner", "-y", "-i", str(raw), "-af", filt,
             "-ar", "44100", "-b:a", "192k", str(src)])
        out_meas = measure(src)
        print(f"{src.name}: dur={duration(src):.3f}s "
              f"in_I={meas['input_i']} -> out_I={out_meas['input_i']} "
              f"out_TP={out_meas['input_tp']} out_LRA={out_meas['input_lra']}")


if __name__ == "__main__":
    main()
