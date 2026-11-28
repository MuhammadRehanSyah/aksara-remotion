#!/usr/bin/env python3
"""Generate src/malin-kundang/lipsync.ts from the 10 Rhubarb cue JSONs
(src/malin-kundang/audio/vo/<id>-cues.json, produced by the audio agent).

Cue JSON format: {"fps": 24, "start": <sec>, "cues": [{"frame": int, "mouth": "A".."H"|"X", "label": str}]}
Output: TS arrays D1_CUES..D10_CUES (24fps timeline) + mouthAt() tail guard.
Validates: mouth letters, ascending frames, min-hold 2 frames (warns, does not fix).
"""
import json, sys
from pathlib import Path

BASE = Path.home() / "workspace/remotion/src/malin-kundang"
VO = BASE / "audio/vo"
OUT = BASE / "lipsync.ts"

MAP = [
    ("D1", "d1_malinmuda-cues.json"),
    ("D2", "d2_ibu-cues.json"),
    ("D3", "d3_nahkoda-cues.json"),
    ("D4", "d4_malindewasa-cues.json"),
    ("D5", "d5_penduduk-cues.json"),
    ("D6", "d6_ibu-cues.json"),
    ("D7", "d7_istri-cues.json"),
    ("D8", "d8_malindewasa-cues.json"),
    ("D9", "d9_ibu-cues.json"),
    ("D10", "d10_malindewasa-cues.json"),
]
VALID = set("ABCDEFGHX")

arrays = {}
for name, fname in MAP:
    p = VO / fname
    if not p.exists():
        sys.exit(f"MISSING: {p}")
    data = json.loads(p.read_text())
    cues = [(c["frame"], c["mouth"]) for c in data["cues"]]
    assert data.get("fps", 24) == 24, f"{fname}: fps != 24"
    for i, (fr, m) in enumerate(cues):
        assert m in VALID, f"{fname} frame {fr}: mouth {m!r} invalid"
        if i and fr <= cues[i - 1][0]:
            sys.exit(f"{fname}: frames not ascending at {fr}")
    # min-hold check (warn only)
    for i in range(len(cues) - 1):
        hold = cues[i + 1][0] - cues[i][0]
        if hold < 2:
            print(f"WARN {name}: 1-frame hold at frame {cues[i][0]} ({cues[i][1]})")
    arrays[name] = cues
    print(f"{name}: {len(cues)} cues, frames {cues[0][0]}..{cues[-1][0]}")

lines = []
lines.append("// MalinKundang lip-sync — cue per frame (24fps) dari Rhubarb, digenerate oleh gen_lipsync.py")
lines.append("// dari src/malin-kundang/audio/vo/<id>-cues.json. JANGAN edit manual — jalankan ulang skripnya.")
lines.append("// Bentuk mulut: A tutup (P/B/M) | B agak terbuka | C terbuka lebar-senyum (E) | D gigi rapat (F/V)")
lines.append("// E bulat (O) | F lebar-sedikit (L) | G gigi (S/Z) | H terbuka lebar (A) | X diam/netral.")
lines.append("// Mulut hanya bergerak saat tokoh itu bicara; di luar dialog = X.")
lines.append('export type Viseme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";')
lines.append("export type Cue = { f: number; v: Viseme };")
lines.append("")
for name, _ in MAP:
    cues = arrays[name]
    body = ", ".join(f'{{ f: {fr}, v: "{m}" }}' for fr, m in cues)
    lines.append(f"export const {name}_CUES: Cue[] = [{body}];")
lines.append("")
lines.append("""/** Bentuk mulut tokoh pada frame f. Di luar jendela dialog -> "X" (mulut diam).
 * 12 frame setelah cue terakhir -> "X" (jaga ekor: mulut tidak nyangkut terbuka). */
export const mouthAt = (cues: Cue[], f: number): Viseme => {
  if (!cues.length) return "X";
  let cur: Viseme = "X";
  for (const c of cues) {
    if (f < c.f) break;
    cur = c.v;
  }
  if (f > cues[cues.length - 1].f + 12) return "X";
  return cur;
};""")
OUT.write_text("\n".join(lines) + "\n")
print(f"WROTE {OUT} ({OUT.stat().st_size} bytes)")
