"""Audio Trial3D Part 2 (20 detik): VO + musik mars + SFX sorak warga, mix per standar bagian 1.
- VO: voice-part2.wav (TTS vg_id_m28, tempo 110, 24 kHz mono, 11,78 dtk) -> resample 48 kHz, mulai t=4,0 dtk
  (intro musik 4 dtk, lalu narasi; ekor musik+sorak 4,2 dtk setelah VO selesai).
- Musik: 10 bar mars Bb mayor 120 bpm dari template music.py (bar 1-8 + ulang bar 1-2),
  render 20 dtk mengikuti music.render() (normalisasi per-track + reverb ringan).
- SFX: column_stomp tiap 0,5 dtk selama baris (0,5-11,5 dtk); water_bed sungai;
  sorak warga = SINTESIS (bukan rekaman asli): babble (gumaman kerumunan) + hurrah berlapis
  (8-16 suara 'hurrah/hooray/hey' sekaligus, nada acak) + applause di akhir + flag_flutter
  saat bendera naik (16-20 dtk).
- Mix (standar bagian 1): VO referensi tidak diubah; musik -10 LU di bawah VO saat bicara,
  duck -3 dB saat VO; SFX puncaknya -6 dB di bawah puncak VO. Master -15 LUFS, true peak <= -1 dBTP.
- Output: mix.wav (16-bit, 48 kHz, stereo, 20,000 dtk) + stems.
"""
import argparse
import os
import sys

import numpy as np
from scipy import signal as sig

sys.path.insert(0, "/home/hatch/workspace/custom-skills/cartoon_3d_short/templates/audio")
import dsp
from dsp import (SR, ns, dbg, rng, place, st, pan, integrated, true_peak,
                 read_wav, write_wav, hp, fades, make_ir, convolve_st)
import music as M
import sfx_gen as SG

BASE = "/home/hatch/workspace/remotion/src/trial3d-part2"
VOICE_PATH = os.path.join(BASE, "voice", "voice-part2.wav")
OUT_DIR = "/home/hatch/workspace/remotion/public/trial3d-part2/audio"
STEM_DIR = os.path.join(BASE, "audio")
DUR = 20.0
N20 = ns(DUR)
VOICE_T0 = 4.0

ap = argparse.ArgumentParser()
ap.add_argument("--music-rel", type=float, default=-10.0)
ap.add_argument("--duck-db", type=float, default=-3.0)
ap.add_argument("--sfx-peak-rel", type=float, default=-6.0)
args = ap.parse_args()


def render20(b, ref=-20.0):
    """music.render() tapi hanya 20 dtk pertama."""
    hall = make_ir(1.5, 7, pre=0.018, hf=1.4)
    yard = make_ir(0.9, 8, pre=0.008, hf=1.8, early=[(0.11, 0.5, -0.4), (0.19, 0.35, 0.5)])
    dry = np.zeros((2, N20))
    wet_hall = np.zeros((2, N20))
    wet_yard = np.zeros((2, N20))
    levels = {}
    for k, x in b.tr.items():
        x = x[:, :N20]
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


def cheer_burst(r, t0, count, seed):
    """Satu ledakan sorak: `count` suara hurrah/hooray/hey sintetis berlapis,
    waktu + nada + pan acak. BUKAN rekaman sorak asli."""
    rr = rng(seed)
    out = np.zeros((2, ns(2.0)))
    for _ in range(count):
        kid = rr.uniform() < 0.25
        base = rr.uniform(240, 300) if kid else rr.uniform(110, 210)
        y = SG.hurrah(rr, base, 0.9, kid=kid)
        dt = rr.uniform(0, 0.5)
        place(out, pan(y, rr.uniform(-0.8, 0.8)), dt)
    return out


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(STEM_DIR, exist_ok=True)

    # ---- 1. Voice: 24 kHz mono -> 48 kHz stereo, mulai 4,0 dtk ----
    x24, sr24 = read_wav(VOICE_PATH)
    assert sr24 == 24000, sr24
    voice48 = sig.resample_poly(x24[0], 2, 1)
    voice = np.zeros((2, N20))
    place(voice, voice48, VOICE_T0)
    voice_end = VOICE_T0 + len(voice48) / SR
    print(f"VO: {len(voice48) / SR:.2f} dtk, ditempatkan {VOICE_T0:.1f}-{voice_end:.2f} dtk")

    # ---- 2. Musik: 10 bar mars (bar 1-8 + ulang bar 1-2), 120 bpm ----
    b = M.Band()
    for bar in range(1, 11):
        t_bar = (bar - 1) * 2.0
        M.oompah(b, t_bar, M.CHB[bar if bar <= 8 else bar - 8], vel=0.6)
        M.snare_bar(b, t_bar, "march", 0.7)
    notes = M.theme(0.0, bars=range(1, 9)) + M.theme(16.0, bars=range(1, 3))
    M.melody(b, "fife", notes, 0.7, fn="fife")
    M.melody(b, "glock", notes, 0.45, fn="glock")
    music, levels = render20(b)
    music = fades(music, fin=0.05, fout=0.5)
    print("level track musik:", levels)

    # ---- 3. SFX ----
    r = rng(20261126)
    sfx = np.zeros((2, N20))
    beats = [0.5 + k * 0.5 for k in range(24)]  # langkah baris 0,5-11,5 dtk
    for k, t in enumerate(beats):
        inten = 0.7 + 0.55 * (t / 12.0)
        clip, pre = SG.column_stomp(r, intensity=inten, foot=k % 2, boots=30)
        place(sfx, clip, t - pre)
    sfx += st(SG.water_bed(DUR, rng(77), close=0.7)) * 0.5
    # gumaman kerumunan alun-alun 6,5-20 dtk (3 suara dewasa + 1 anak, pan berbeda)
    for j, (base, p) in enumerate([(115, -0.6), (145, 0.5), (185, -0.1), (250, 0.75)]):
        bab = SG.babble(13.5, rng(100 + j), base, 0.45)
        place(sfx, pan(bab, p), 6.5)
    # ledakan sorak sintetis: sambutan (7,2), klimaks narasi (13,8), bendera naik (16,5), penutup (18,6)
    for t0, count, seed in [(7.2, 8, 11), (13.8, 12, 22), (16.5, 14, 33), (18.6, 16, 44)]:
        place(sfx, cheer_burst(r, t0, count, seed), t0)
    # tepuk tangan akhir 16-20 dtk (fade masuk 0,5 dtk)
    app = SG.applause(4.0, rng(55), people=36)
    env = np.clip(np.arange(ns(4.0)) / ns(0.5), 0, 1)
    app = app * env[None, :]
    place(sfx, app, 16.0)
    # kibaran bendera 16-20 dtk
    place(sfx, st(SG.flag_flutter(4.0, rng(66))) * 0.7, 16.0)
    print("SFX: 24 column stomps + water_bed + babble x4 (6,5-20 dtk) + 4 cheer burst sintetis + applause + flag_flutter")

    # ---- 4. Mix (gain staging berdasarkan loudness) ----
    def seg_lufs(x, t0, t1):
        return integrated(x[:, ns(t0):ns(t1)])

    voice_lufs = seg_lufs(voice, 5, 15)
    voice_peak = float(np.max(np.abs(voice)))
    music_raw_lufs = seg_lufs(music, 5, 15)
    g_music_db = (voice_lufs + args.music_rel) - music_raw_lufs - args.duck_db
    sfx_peak = float(np.max(np.abs(sfx)))
    g_sfx = (voice_peak * dbg(args.sfx_peak_rel)) / max(sfx_peak, 1e-9)

    duck = np.ones(N20)
    a, c = ns(VOICE_T0), ns(voice_end)
    duck[a:c] = dbg(args.duck_db)
    e = ns(0.08)
    duck[max(0, a - e):a] = np.linspace(1.0, dbg(args.duck_db), e)[:a - max(0, a - e)]
    duck[c:c + e] = np.linspace(dbg(args.duck_db), 1.0, e)[:N20 - c]
    music_g = music * dbg(g_music_db) * duck[None, :]
    sfx_g = sfx * g_sfx
    print(f"gain staging: voice peak {voice_peak:.3f} ({20 * np.log10(voice_peak):.1f} dBFS), "
          f"voice[5-15] {voice_lufs:.1f} LUFS")
    print(f"  musik mentah[5-15] {music_raw_lufs:.1f} LUFS -> gain {g_music_db:+.1f} dB "
          f"(target ducked {voice_lufs + args.music_rel:.1f} LUFS)")
    print(f"  sfx peak mentah {sfx_peak:.2f} -> gain {20 * np.log10(g_sfx):+.1f} dB "
          f"(target puncak {20 * np.log10(voice_peak * dbg(args.sfx_peak_rel)):.1f} dBFS)")
    mix = voice + music_g + sfx_g

    L = integrated(mix)
    mix = mix * dbg(-15.0 - L)
    mix = limiter(mix, thr_db=-2.0)
    tp = true_peak(mix)
    if tp > -1.0:
        mix = mix * dbg(-1.0 - tp)
        tp = true_peak(mix)
    mix = fades(mix, fin=0.005, fout=0.15)
    print(f"mix: integrated {integrated(mix):.1f} LUFS, true peak {tp:.2f} dBTP")

    print(f"  voice saja  [5-15 dtk]: {seg_lufs(voice, 5, 15):.1f} LUFS")
    print(f"  musik saja  [5-15 dtk]: {seg_lufs(music_g, 5, 15):.1f} LUFS")
    print(f"  sfx saja    [5-15 dtk]: {seg_lufs(sfx_g, 5, 15):.1f} LUFS")
    print(f"  mix bicara  [5-15 dtk]: {seg_lufs(mix, 5, 15):.1f} LUFS")
    print(f"  mix intro   [0-4 dtk]: {seg_lufs(mix, 0, 4):.1f} LUFS")
    print(f"  mix ekor    [16-20 dtk]: {seg_lufs(mix, 16, 20):.1f} LUFS")

    # ---- 5. Tulis file ----
    write_wav(os.path.join(OUT_DIR, "mix.wav"), mix, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_voice.wav"), voice, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_music.wav"), music_g, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_sfx.wav"), sfx_g, bits=16)
    print("mix.wav:", os.path.join(OUT_DIR, "mix.wav"))
    print("durasi mix:", mix.shape[1] / SR, "dtk")


if __name__ == "__main__":
    main()
