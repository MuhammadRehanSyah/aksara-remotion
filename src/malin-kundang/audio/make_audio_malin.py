"""Audio Malin Kundang 120 detik: VO 22 baris + musik 6 seksi + SFX, lalu mix.
Pola gain-staging mengikuti make_audio_kacaurus.py:
- VO = referensi, tidak diubah; musik -10 LU relatif terhadap VO saat bicara,
  duck -3 dB saat VO; SFX puncak -6 dB di bawah puncak VO.
- Master -16 LUFS, true peak <= -1 dBTP, limiter look-ahead.
- Musik sintesis numpy (pad/pluck/musicbox/brass/timpani/snare), tanpa rekaman.
- SFX: ombak+angin sepanjang video, langkah kaki, koin emas (D4),
  PETIR tepat di kata "Petir" (words.json: 81.83 dtk), tangis Ibu pelan (D9),
  ombak besar menghantam kapal (N10).
- VO: 22 baris, N1 mulai t=2.0, jeda 0.4 antar baris, 0.8 sebelum D9,
  1.0 sebelum N12 (lihat timeline.json).
- Output: mix.wav (16-bit, 48 kHz, stereo, 120.000 dtk) + stems.
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal as sig

sys.path.insert(0, "/home/hatch/workspace/custom-skills/cartoon_3d_short/templates/audio")
import dsp
from dsp import (SR, ns, dbg, rng, place, st, integrated, true_peak,
                 hp, lp, bp, colored, fades, make_ir, convolve_st)
import music as M
import sfx_gen as SG
import instruments as I

BASE = "/home/hatch/workspace/remotion/src/malin-kundang"
VO_DIR = os.path.join(BASE, "audio", "vo")
OUT_DIR = "/home/hatch/workspace/remotion/public/malin-kundang/audio"
STEM_DIR = os.path.join(BASE, "audio")
DUR = 120.0
N120 = ns(DUR)
MUSIC_REL = -10.0
DUCK_DB = -3.0
SFX_PEAK_REL = -6.0
MASTER_LUFS = -16.0

PETIR_T = 81.83  # kata "Petir" (N10) dari words.json


def load_trim(path):
    w = wave.open(path)
    n = w.getnframes()
    x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768.0
    return x


def render120(b, ref=-20.0):
    """music.render() tapi 120 dtk."""
    hall = make_ir(1.5, 7, pre=0.018, hf=1.4)
    dry = np.zeros((2, N120))
    wet_hall = np.zeros((2, N120))
    levels = {}
    for k, x in b.tr.items():
        if x.shape[1] < N120:
            x = np.pad(x, ((0, 0), (0, N120 - x.shape[1])))
        else:
            x = x[:, :N120]
        if not np.any(x):
            continue
        L = integrated(x)
        g = dbg(ref + M.TARGET.get(k, -6) - L)
        levels[k] = (round(L, 1), round(ref + M.TARGET.get(k, -6), 1))
        x = x * g
        dry += x
        wet_hall += b.send[k] * x
    out = dry + 0.7 * convolve_st(wet_hall.mean(0), hall)
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


def thunder(r, dur=3.5):
    """Petir: retak tajam + guruh rendah meluruh."""
    n = ns(dur)
    t = np.arange(n) / SR
    nz = r.standard_normal(n)
    crack = bp(nz, 900, 7000, 1) * np.exp(-t / 0.03) * 2.2
    rum = lp(colored(n, r, 1.6), 130, 2) * np.exp(-t / 0.9) * 1.6
    deep = lp(colored(n, r, 2.2), 60, 2) * np.exp(-t / 1.8) * 1.2
    y = crack + rum + deep
    return fades(y, 0.002, 0.8)


def sob(r, dur=0.9, f0=290.0):
    """Isak tangis pelan: dua denyut vokal 'uh' jatuh."""
    n = ns(dur)
    t = np.arange(n) / SR
    f0a = f0 * (1 - 0.25 * t / dur) * np.ones(n)
    env = (np.exp(-((t - 0.18) / 0.09) ** 2) + 0.8 * np.exp(-((t - 0.55) / 0.10) ** 2))
    env *= np.clip(1 - t / dur, 0, 1)
    forms = np.tile(np.array([750.0, 1150.0, 2500.0, 3400.0]), (n, 1))
    y = SG.vox(f0a, forms, env * 0.22, r, breath=0.25, jitter=0.02)
    return y


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(STEM_DIR, exist_ok=True)
    timeline = json.load(open(os.path.join(VO_DIR, "timeline.json")))

    # ---- 1. Voice: 24 kHz mono trim -> 48 kHz stereo, ditempatkan ----
    voice = np.zeros((2, N120))
    spans = []
    for row in timeline:
        clip = load_trim(os.path.join(VO_DIR, row["id"] + "_trim.wav"))
        v48 = sig.resample_poly(clip, 2, 1)
        place(voice, v48, row["start"])
        spans.append((row["start"], row["end"]))
        print(f"VO {row['id']}: {row['dur']:.2f} dtk, {row['start']:.2f}-{row['end']:.2f}")

    # ---- 2. Musik: 6 seksi ----
    b = M.Band()
    for name, send in [("pad", 0.25), ("pluck", 0.18), ("musicbox", 0.26),
                       ("fife", 0.20), ("brass", 0.20), ("timpani", 0.15),
                       ("snare", 0.12), ("glock", 0.22), ("vibes", 0.20)]:
        b.track(name, send)
    r = rng(20261128)
    F = I.m2f

    def chord_bar(t0, bar_dur, root, tri, vel_pad=0.5, vel_pluck=0.7):
        b.add("pad", I.pad([F(m) for m in [root] + tri], bar_dur, vel_pad, r, att=0.5, rel=0.6), t0, 0.0)
        b.add("pluck", I.pluck(F(root), vel_pluck, r, dur=1.0), t0, -0.05)

    # S1 0-24: lembut mayor pelan, C mayor, bar 2.0 dtk
    s1 = [("C", 48, [60, 64, 67]), ("G", 43, [59, 62, 67]), ("Am", 45, [57, 60, 64]),
          ("Em", 40, [59, 64, 67]), ("F", 41, [57, 60, 65]), ("C", 48, [60, 64, 67]),
          ("F", 41, [57, 60, 65]), ("G", 43, [59, 62, 67]), ("C", 48, [60, 64, 67]),
          ("G", 43, [59, 62, 67]), ("Am", 45, [57, 60, 64]), ("F", 41, [57, 60, 65])]
    for k, (ch, root, tri) in enumerate(s1):
        tb = k * 2.0
        chord_bar(tb, 2.0, root, tri)
        for j in (1, 2):
            for m in tri[1:]:
                b.add("pluck", I.pluck(F(m), 0.32, r, dur=0.5, bright=0.6), tb + j * (2.0 / 3), 0.25)
    mel1 = [(0.0, 1.0, 76), (2.0, 1.0, 79), (4.0, 1.0, 74), (6.0, 1.0, 71),
            (8.0, 1.0, 72), (10.0, 1.0, 76), (12.0, 1.0, 71), (14.0, 1.0, 74),
            (16.0, 1.0, 72), (18.0, 1.0, 69), (20.0, 1.0, 67), (22.0, 1.0, 76)]
    M.melody(b, "musicbox", mel1, 0.5, fn="musicbox", p=0.1)

    # S2 24-44: petualangan, tempo naik, bar 1.6 dtk, G mayor nuansa
    s2 = [("G", 43, [59, 62, 67]), ("C", 48, [60, 64, 67]), ("D", 50, [62, 66, 69]),
          ("G", 43, [59, 62, 67]), ("Em", 40, [59, 64, 67]), ("C", 48, [60, 64, 67]),
          ("D", 50, [62, 66, 69]), ("G", 43, [59, 62, 67]), ("C", 48, [60, 64, 67]),
          ("G", 43, [59, 62, 67]), ("D", 50, [62, 66, 69]), ("G", 43, [59, 62, 67]),
          ("C", 48, [60, 64, 67])]
    for k, (ch, root, tri) in enumerate(s2):
        tb = 24.0 + k * 1.6
        if tb >= 44.0:
            break
        chord_bar(tb, 1.6, root, tri, vel_pad=0.45, vel_pluck=0.8)
        for j in (1, 2, 3):
            b.add("pluck", I.pluck(F(tri[j % 3]), 0.35, r, dur=0.4, bright=0.7), tb + j * 0.4, 0.2)
    mel2 = [(24.0, 0.8, 74), (25.6, 0.8, 79), (27.2, 0.8, 83), (28.8, 0.8, 79),
            (30.4, 0.8, 76), (32.0, 0.8, 74), (33.6, 0.8, 79), (35.2, 0.8, 81),
            (36.8, 0.8, 79), (38.4, 0.8, 76), (40.0, 0.8, 74), (41.6, 0.8, 71)]
    M.melody(b, "fife", mel2, 0.5, fn="fife", p=0.0)

    # S3 44-64: megah, bar 2.0 dtk, C mayor + brass + timpani
    s3 = [("C", 48, [60, 64, 67]), ("F", 41, [57, 60, 65]), ("G", 43, [59, 62, 67]),
          ("C", 48, [60, 64, 67]), ("Am", 45, [57, 60, 64]), ("F", 41, [57, 60, 65]),
          ("G", 43, [59, 62, 67]), ("C", 48, [60, 64, 67]), ("F", 41, [57, 60, 65]),
          ("G", 43, [59, 62, 67])]
    for k, (ch, root, tri) in enumerate(s3):
        tb = 44.0 + k * 2.0
        chord_bar(tb, 2.0, root, tri, vel_pad=0.55, vel_pluck=0.6)
        b.add("brass", I.brass(F(root + 12), 1.6, 0.55, r, kind="tuba"), tb + 0.05, -0.1)
        b.add("timpani", I.timpani(F(root), 0.7, r, dur=1.8), tb, 0.0)
        b.add("glock", I.glock(F(tri[2] + 12), 0.5, r, dur=1.2), tb + 1.0, 0.15)
    mel3 = [(44.0, 1.0, 72), (46.0, 1.0, 76), (48.0, 1.0, 79), (50.0, 1.0, 84),
            (52.0, 1.0, 79), (54.0, 1.0, 76), (56.0, 1.0, 79), (58.0, 1.0, 81),
            (60.0, 1.0, 79), (62.0, 1.0, 76)]
    M.melody(b, "glock", mel3, 0.45, fn="glock", p=0.0)

    # S4 64-88: minor tegang pelan, A minor, bar 2.0 dtk
    s4 = [("Am", 45, [57, 60, 64]), ("Dm", 38, [57, 62, 65]), ("Am", 45, [57, 60, 64]),
          ("E", 40, [59, 64, 68]), ("Am", 45, [57, 60, 64]), ("Dm", 38, [57, 62, 65]),
          ("E", 40, [59, 64, 68]), ("Am", 45, [57, 60, 64]), ("Dm", 38, [57, 62, 65]),
          ("E", 40, [59, 64, 68]), ("Am", 45, [57, 60, 64]), ("E", 40, [59, 64, 68])]
    for k, (ch, root, tri) in enumerate(s4):
        tb = 64.0 + k * 2.0
        chord_bar(tb, 2.0, root, tri, vel_pad=0.5, vel_pluck=0.5)
        b.add("pluck", I.pluck(F(root - 12), 0.6, r, dur=1.4), tb, -0.1)
    mel4 = [(64.0, 1.2, 69), (68.0, 1.2, 72), (72.0, 1.2, 69), (76.0, 1.2, 67),
            (80.0, 1.2, 64), (84.0, 1.2, 67)]
    M.melody(b, "musicbox", mel4, 0.4, fn="musicbox", p=-0.1)

    # S5 88-110: badai, A minor, bar 1.0 dtk, drum + timpani
    for k in range(22):
        tb = 88.0 + k * 1.0
        root = 45 if k % 4 != 3 else 40
        tri = [57, 60, 64] if k % 4 != 3 else [59, 64, 68]
        b.add("pad", I.pad([F(m) for m in [root] + tri], 1.0, 0.55, r, att=0.1, rel=0.3), tb, 0.0)
        b.add("timpani", I.timpani(F(root), 0.85, r, dur=1.0), tb, 0.0)
        b.add("snare", I.snare(0.6, r, dur=0.3), tb + 0.5, 0.0)
        b.add("pluck", I.pluck(F(root), 0.8, r, dur=0.5), tb, -0.05)
        b.add("pluck", I.pluck(F(tri[1]), 0.5, r, dur=0.4, bright=0.8), tb + 0.5, 0.1)
    for (t0, t1, v0, v1) in [(88.0, 92.0, 0.3, 0.8), (104.0, 108.0, 0.4, 0.9)]:
        for (tt, vv) in I.snare_roll(t0, t1, v0, v1, r, rate=26.0):
            b.add("snare", I.snare(vv, r, dur=0.12), tt, 0.0)

    # S6 110-120: sunyi sedih, musicbox jarang, A minor
    b.add("pad", I.pad([F(m) for m in [45, 57, 60, 64]], 10.0, 0.35, r, att=1.0, rel=2.0), 110.0, 0.0)
    mel6 = [(110.0, 1.5, 69), (113.0, 1.5, 72), (116.0, 1.5, 69), (118.0, 2.0, 64)]
    M.melody(b, "musicbox", mel6, 0.45, fn="musicbox", p=0.0)

    music, levels = render120(b)
    print("level track musik:", levels)
    # keseimbangan antar seksi (relatif): badai paling keras, penutup paling sunyi
    sec_gain = np.ones(N120)
    secs = [(0, 24, 0.85), (24, 44, 1.0), (44, 64, 1.12), (64, 88, 0.85),
            (88, 110, 1.35), (110, 120, 0.5)]
    for t0, t1, g in secs:
        sec_gain[ns(t0):ns(t1)] = g
    # crossfade 0.5 dtk di batas seksi
    e = ns(0.5)
    for t0, t1, g in secs[1:]:
        i0 = ns(t0)
        sec_gain[i0 - e:i0] = np.linspace(sec_gain[i0 - e], g, e)
    music = music * sec_gain[None, :]
    music = fades(music, fin=1.0, fout=3.0)
    print("musik: 6 seksi (lembut/petualangan/megah/minor/badai/sunyi)")

    # ---- 3. SFX ----
    sfx = np.zeros((2, N120))
    rr = rng(77)
    # ombak + angin laut sepanjang video
    place(sfx, SG.water_bed(DUR, rr, close=0.8, slosh_rate=0.8), 0.0)
    place(sfx, SG.breeze(DUR, rr, level=0.8, gust=0.18, bright=900), 0.0)
    # langkah kaki: Malin pamit (16.3), Ibu berlari ke pantai (51.6/52.5/53.4)
    for t in (16.3, 51.6, 52.5, 53.4):
        place(sfx, st(SG.stroll_step(rr, scuff=0.5)), t)
    # lutut menghantam pasir saat D10 berlutut
    place(sfx, st(SG.push_thump(rr)), 88.7)
    # koin/emas saat D4 (40.01-43.24)
    for t in (40.3, 40.9, 41.6, 42.3):
        place(sfx, st(SG.clink(rr, f0=3200.0, dur=0.12)), t)
    # PETIR tepat di kata "Petir" (81.83)
    place(sfx, st(thunder(rr, dur=3.5)), PETIR_T)
    # petir jauh kedua saat badai memuncak
    place(sfx, st(thunder(rr, dur=3.0)), 95.0)
    # ombak besar menghantam kapal (N10) + gelombang badai
    place(sfx, st(SG.splash_big(rr)), 83.4)
    place(sfx, st(SG.splash_big(rr)), 91.0)
    place(sfx, st(SG.splash_big(rr)), 101.0)
    # tangis Ibu pelan saat D9 (70.35-76.49), jangan berlebihan
    place(sfx, st(sob(rr, dur=0.9, f0=290.0)), 71.2)
    place(sfx, st(sob(rr, dur=0.9, f0=270.0)), 73.4)
    place(sfx, st(sob(rr, dur=0.8, f0=260.0)), 75.2)
    print(f"SFX: ombak+angin 0-120, langkah 16.3/51.6/52.5/53.4, koin D4, "
          f"PETIR {PETIR_T}, splash 83.4/91/101, tangis D9 71.2/73.4/75.2")

    # ---- 4. Mix (gain staging berdasarkan loudness) ----
    speech = np.concatenate([voice[:, ns(a):ns(c)] for a, c in spans], axis=1)
    voice_lufs = integrated(speech)
    voice_peak = float(np.max(np.abs(voice)))
    music_speech = np.concatenate([music[:, ns(a):ns(c)] for a, c in spans], axis=1)
    music_raw_lufs = integrated(music_speech)
    g_music_db = (voice_lufs + MUSIC_REL) - music_raw_lufs - DUCK_DB
    sfx_peak = float(np.max(np.abs(sfx)))
    g_sfx = (voice_peak * dbg(SFX_PEAK_REL)) / max(sfx_peak, 1e-9)

    duck = np.ones(N120)
    for a, c in spans:
        ia, ic = ns(a), ns(c)
        duck[ia:ic] = dbg(DUCK_DB)
        e = ns(0.08)
        duck[max(0, ia - e):ia] = np.linspace(1.0, dbg(DUCK_DB), e)[:ia - max(0, ia - e)]
        duck[ic:ic + e] = np.linspace(dbg(DUCK_DB), 1.0, e)[:N120 - ic]
    music_g = music * dbg(g_music_db) * duck[None, :]
    sfx_g = sfx * g_sfx
    print(f"gain staging: voice peak {voice_peak:.3f} ({20 * np.log10(voice_peak):.1f} dBFS), "
          f"voice ucapan {voice_lufs:.1f} LUFS")
    print(f"  musik mentah (saat bicara) {music_raw_lufs:.1f} LUFS -> gain {g_music_db:+.1f} dB "
          f"(target ducked {voice_lufs + MUSIC_REL:.1f} LUFS)")
    print(f"  sfx peak mentah {sfx_peak:.3f} -> gain {20 * np.log10(g_sfx):+.1f} dB "
          f"(target puncak {20 * np.log10(voice_peak * dbg(SFX_PEAK_REL)):.1f} dBFS)")
    mix = voice + music_g + sfx_g

    for _ in range(12):
        L = integrated(mix)
        mix = mix * dbg(MASTER_LUFS - L)
        mix = limiter(mix, thr_db=-2.5)
        if abs(integrated(mix) - MASTER_LUFS) < 0.1:
            break
    tp = true_peak(mix)
    if tp > -1.0:
        mix = mix * dbg(-1.0 - tp)
        tp = true_peak(mix)
    mix = fades(mix, fin=0.005, fout=0.15)
    print(f"mix: integrated {integrated(mix):.1f} LUFS, true peak {tp:.2f} dBTP, "
          f"peak {20 * np.log10(np.max(np.abs(mix))):.1f} dBFS")

    def seg_lufs(x, t0, t1):
        return integrated(x[:, ns(t0):ns(t1)])

    print(f"  voice saja  (ucapan): {voice_lufs:.1f} LUFS")
    print(f"  musik saja  (saat bicara, ducked): {integrated(np.concatenate([music_g[:, ns(a):ns(c)] for a, c in spans], axis=1)):.1f} LUFS")
    print(f"  mix bicara  [2-7 dtk]: {seg_lufs(mix, 2, 7):.1f} LUFS")
    print(f"  mix musik saja [0-2 dtk]: {seg_lufs(mix, 0, 2):.1f} LUFS")
    print(f"  mix badai   [88-110 dtk]: {seg_lufs(mix, 88, 110):.1f} LUFS")
    print(f"  mix ekor    [110-120 dtk]: {seg_lufs(mix, 110, 120):.1f} LUFS")

    from dsp import write_wav
    write_wav(os.path.join(OUT_DIR, "mix.wav"), mix, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_voice.wav"), voice, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_music.wav"), music_g, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_sfx.wav"), sfx_g, bits=16)
    print("mix.wav:", os.path.join(OUT_DIR, "mix.wav"))
    print("durasi mix:", mix.shape[1] / SR, "dtk")


if __name__ == "__main__":
    main()
