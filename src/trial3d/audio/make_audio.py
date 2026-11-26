"""Audio Trial3D 12 detik: VO + musik mars + SFX, lalu mix per standar skill.
- VO: voice.wav (TTS vg_id_m41, 24 kHz mono) -> resample 48 kHz, mulai t=0.5 dtk.
- Musik: 6 bar mars Bb mayor 120 bpm dari template music.py (theme + oompah + snare),
  render 12 dtk mengikuti music.render() (normalisasi per-track + reverb ringan).
- SFX: column_stomp tiap ketukan 0.5 dtk (intensitas naik seiring kamera mendekat),
  water_bed sungai, chain_groan ringan.
- Mix (standar skill): VO referensi tidak diubah; musik -10 LU relatif
  terhadap VO saat bicara (duck -3 dB saat VO; "+3 dB" di skill = bed
  dinaikkan 3 dB dari standar lama -13); SFX puncaknya -6 dB di bawah
  puncak VO. Master -15 LUFS, true peak <= -1 dBTP.
- Output: mix.wav (16-bit, 48 kHz, stereo, 12.000 dtk) + stems + laporan loudness.
"""
import argparse
import json
import os
import sys

import numpy as np
from scipy import signal as sig

sys.path.insert(0, "/home/hatch/workspace/custom-skills/cartoon_3d_short/templates/audio")
import dsp
from dsp import (SR, ns, dbg, rng, place, st, integrated, true_peak, momentary,
                 read_wav, write_wav, hp, fades, make_ir, convolve_st)
import music as M
import sfx_gen as SG

BASE = "/home/hatch/workspace/remotion/src/trial3d"
VOICE_PATH = os.path.join(BASE, "voice", "voice.wav")
OUT_DIR = "/home/hatch/workspace/remotion/public/trial3d/audio"
STEM_DIR = os.path.join(BASE, "audio")
DUR = 12.0
N12 = ns(DUR)
VOICE_T0 = 0.5

ap = argparse.ArgumentParser()
ap.add_argument("--music-rel", type=float, default=-10.0,
                help="level musik relatif terhadap VO saat bicara, LU (standar proyek: -10)")
ap.add_argument("--duck-db", type=float, default=-3.0, help="duck musik saat VO (standar: -3)")
ap.add_argument("--sfx-peak-rel", type=float, default=-6.0,
                help="puncak SFX relatif terhadap puncak VO, dB (standar: -6)")
args = ap.parse_args()


def render12(b, ref=-20.0):
    """music.render() tapi hanya 12 dtk pertama."""
    hall = make_ir(1.5, 7, pre=0.018, hf=1.4)
    yard = make_ir(0.9, 8, pre=0.008, hf=1.8, early=[(0.11, 0.5, -0.4), (0.19, 0.35, 0.5)])
    dry = np.zeros((2, N12))
    wet_hall = np.zeros((2, N12))
    wet_yard = np.zeros((2, N12))
    levels = {}
    for k, x in b.tr.items():
        x = x[:, :N12]
        if not np.any(x):
            continue
        L = integrated(x)
        g = dbg(ref + M.TARGET.get(k, -6) - L)
        levels[k] = (round(L, 1), round(ref + M.TARGET.get(k, -6), 1))
        x = x * g
        dry += x
        if k == "whistle":
            wet_yard += 0.16 * x
        else:
            wet_hall += b.send[k] * x
    out = dry + 0.7 * convolve_st(wet_hall.mean(0), hall) + 0.8 * convolve_st(wet_yard.mean(0), yard)
    out = hp(out, 30, 2)
    return out, levels


def limiter(x, thr_db=-2.0, lookahead_ms=5.0, release_ms=120.0):
    """Limiter sederhana ala mix.py skill: look-ahead + release, agar true
    peak <= -1 dBTP tanpa menarik turun seluruh level (skala global)."""
    thr = dbg(thr_db)
    env = np.max(np.abs(x), axis=0)
    la = ns(lookahead_ms / 1000)
    env_shift = np.concatenate([env[la:], np.full(la, env[-1])]) if la > 0 else env
    g = np.minimum(1.0, thr / np.maximum(env_shift, 1e-9))
    alpha = 1 - np.exp(-1.0 / max(int(release_ms / 1000 * SR), 1))
    gs = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else cur + alpha * (g[i] - cur)
        gs[i] = cur
    return x * gs[None, :]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(STEM_DIR, exist_ok=True)

    # ---- 1. Voice: 24 kHz mono -> 48 kHz stereo, mulai 0.5 dtk ----
    x24, sr24 = read_wav(VOICE_PATH)
    assert sr24 == 24000, sr24
    voice48 = sig.resample_poly(x24[0], 2, 1)
    voice = np.zeros((2, N12))
    place(voice, voice48, VOICE_T0)
    voice_end = VOICE_T0 + len(voice48) / SR
    print(f"VO: {len(voice48) / SR:.2f} dtk, ditempatkan {VOICE_T0:.1f}-{voice_end:.2f} dtk")

    # ---- 2. Musik: 6 bar mars (Bb, F, Cm, F7, Bb, Eb), 120 bpm ----
    b = M.Band()
    for bar in range(1, 7):
        t_bar = (bar - 1) * 2.0
        M.oompah(b, t_bar, M.CHB[bar], vel=0.6)
        M.snare_bar(b, t_bar, "march", 0.7)
    notes = M.theme(0.0, bars=range(1, 7))
    M.melody(b, "fife", notes, 0.7, fn="fife")
    M.melody(b, "glock", notes, 0.45, fn="glock")
    music, levels = render12(b)
    # fade masuk 0.05 dtk + fade keluar 0.5 dtk
    music = fades(music, fin=0.05, fout=0.5)
    print("level track musik:", levels)

    # ---- 3. SFX ----
    r = rng(20261126)
    sfx = np.zeros((2, N12))
    beats = [0.5 + k * 0.5 for k in range(24)]
    for k, t in enumerate(beats):
        inten = 0.7 + 0.55 * (t / DUR)
        clip, pre = SG.column_stomp(r, intensity=inten, foot=k % 2, boots=30)
        place(sfx, clip, t - pre)
    sfx += st(SG.water_bed(DUR, rng(77), close=0.7)) * 0.5
    sfx += st(SG.chain_groan(DUR, rng(99), i0=0.15, i1=0.5, beats=beats)) * 0.5
    print("SFX: 24 column stomps + water_bed + chain_groan")

    # ---- 4. Mix (gain staging berdasarkan loudness, bukan gain mentah) ----
    # VO = referensi, tidak diubah. Musik: -10 LU relatif terhadap VO saat
    # bicara (standar proyek: bed -10; "+3 dB" di skill = bed dinaikkan 3 dB
    # dari standar lama -13). SFX: puncaknya -6 dB di bawah puncak VO.
    def seg_lufs(x, t0, t1):
        return integrated(x[:, ns(t0):ns(t1)])

    voice_lufs = seg_lufs(voice, 1, 9)
    voice_peak = float(np.max(np.abs(voice)))
    music_raw_lufs = seg_lufs(music, 1, 9)
    # duck -3 dB aktif penuh di daerah [1-9], jadi gain pre-duck dikompensasi +3
    g_music_db = (voice_lufs + args.music_rel) - music_raw_lufs - args.duck_db
    sfx_peak = float(np.max(np.abs(sfx)))
    g_sfx = (voice_peak * dbg(args.sfx_peak_rel)) / max(sfx_peak, 1e-9)

    # duck musik -3 dB selama VO berbicara (0.5-10.18), tepi dihaluskan 0.08 dtk
    duck = np.ones(N12)
    a, c = ns(VOICE_T0), ns(voice_end)
    duck[a:c] = dbg(args.duck_db)
    e = ns(0.08)
    duck[max(0, a - e):a] = np.linspace(1.0, dbg(args.duck_db), e)[:a - max(0, a - e)]
    duck[c:c + e] = np.linspace(dbg(args.duck_db), 1.0, e)[:N12 - c]
    music_g = music * dbg(g_music_db) * duck[None, :]
    sfx_g = sfx * g_sfx
    print(f"gain staging: voice peak {voice_peak:.3f} ({20 * np.log10(voice_peak):.1f} dBFS), "
          f"voice[1-9] {voice_lufs:.1f} LUFS")
    print(f"  musik mentah[1-9] {music_raw_lufs:.1f} LUFS -> gain {g_music_db:+.1f} dB "
          f"(target ducked {voice_lufs + args.music_rel:.1f} LUFS)")
    print(f"  sfx peak mentah {sfx_peak:.2f} -> gain {20 * np.log10(g_sfx):+.1f} dB "
          f"(target puncak {20 * np.log10(voice_peak * dbg(args.sfx_peak_rel)):.1f} dBFS)")
    mix = voice + music_g + sfx_g

    # master ke -15 LUFS + limiter (bukan skala global, agar level tidak jatuh)
    L = integrated(mix)
    mix = mix * dbg(-15.0 - L)
    mix = limiter(mix, thr_db=-2.0)
    tp = true_peak(mix)
    if tp > -1.0:  # pengaman terakhir, seharusnya tidak terjadi
        mix = mix * dbg(-1.0 - tp)
        tp = true_peak(mix)
    mix = fades(mix, fin=0.005, fout=0.15)
    print(f"mix: integrated {integrated(mix):.1f} LUFS, true peak {tp:.2f} dBTP")

    # ---- 5. Laporan keterdengaran: bandingkan daerah bicara vs ekor musik saja ----
    print(f"  voice saja  [1-9 dtk]: {seg_lufs(voice, 1, 9):.1f} LUFS")
    print(f"  musik saja  [1-9 dtk]: {seg_lufs(music_g, 1, 9):.1f} LUFS")
    print(f"  sfx saja    [1-9 dtk]: {seg_lufs(sfx_g, 1, 9):.1f} LUFS")
    print(f"  mix bicara  [1-9 dtk]: {seg_lufs(mix, 1, 9):.1f} LUFS")
    print(f"  mix ekor    [10.5-12 dtk]: {seg_lufs(mix, 10.5, 12):.1f} LUFS")
    print(f"  mix musik-tanpa-VO [0-0.5 dtk]: {seg_lufs(mix, 0, 0.5):.1f} LUFS")

    # ---- 6. Tulis file ----
    write_wav(os.path.join(OUT_DIR, "mix.wav"), mix, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_voice.wav"), voice, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_music.wav"), music_g, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_sfx.wav"), sfx_g, bits=16)
    print("mix.wav:", os.path.join(OUT_DIR, "mix.wav"))
    print("durasi mix:", mix.shape[1] / SR, "dtk")


if __name__ == "__main__":
    main()
