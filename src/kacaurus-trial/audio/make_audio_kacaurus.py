"""Audio KacaurusTrial 30 detik: VO 3 baris + musik waltz hangat + SFX koin, lalu mix.
Pola gain-staging mengikuti ~/workspace/remotion/src/trial3d/audio/make_audio.py:
- VO = referensi, tidak diubah; musik -10 LU relatif terhadap VO saat bicara,
  duck -3 dB saat VO; SFX puncak -6 dB di bawah puncak VO.
- Master -16 LUFS, true peak <= -1 dBTP, limiter look-ahead.
- Musik LEMBUT (bukan mars): waltz pelan 90 bpm, C mayor hangat — pad + petik
  (pluck) + musicbox, tanpa snare/tuba mars.
- VO: L1 t=5.0, L2 t=12.0, L3 t=21.0 (file TTS 24 kHz mono -> 48 kHz).
- SFX: 3 clink koin pelan di 5.8 / 6.4 / 7.1 dtk (sfx_gen.clink).
- Output: mix.wav (16-bit, 48 kHz, stereo, 30.000 dtk) + stems.
"""
import os
import sys

import numpy as np
from scipy import signal as sig

sys.path.insert(0, "/home/hatch/workspace/custom-skills/cartoon_3d_short/templates/audio")
import dsp
from dsp import (SR, ns, dbg, rng, place, st, integrated, true_peak, read_wav,
                 write_wav, hp, fades, make_ir, convolve_st)
import music as M
import sfx_gen as SG
import instruments as I

BASE = "/home/hatch/workspace/remotion/src/kacaurus-trial"
VO_DIR = os.path.join(BASE, "audio", "vo")
OUT_DIR = "/home/hatch/workspace/remotion/public/kacaurus-trial/audio"
STEM_DIR = os.path.join(BASE, "audio")
DUR = 30.0
N30 = ns(DUR)
VO_T0 = {"l1_bapak.wav": 5.0, "l2_anak.wav": 12.0, "l3_bapak.wav": 21.0}
MUSIC_REL = -10.0   # LU relatif terhadap VO saat bicara
DUCK_DB = -3.0
SFX_PEAK_REL = -6.0
MASTER_LUFS = -16.0


def trim_silence(x, thr_db=-45.0):
    """Potong sunyi awal/akhir; kembalikan (clip, lead_s)."""
    thr = dbg(thr_db)
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x, 0.0
    a, b = idx[0], idx[-1] + 1
    return x[a:b], a / 24000.0


def render30(b, ref=-20.0):
    """music.render() tapi hanya 30 dtk pertama."""
    hall = make_ir(1.5, 7, pre=0.018, hf=1.4)
    dry = np.zeros((2, N30))
    wet_hall = np.zeros((2, N30))
    levels = {}
    for k, x in b.tr.items():
        x = x[:, :N30]
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


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(STEM_DIR, exist_ok=True)

    # ---- 1. Voice: 24 kHz mono -> 48 kHz stereo, ditempatkan di t0 ----
    voice = np.zeros((2, N30))
    spans = []
    for fname, t0 in VO_T0.items():
        x24, sr24 = read_wav(os.path.join(VO_DIR, fname))
        assert sr24 == 24000, sr24
        clip, lead = trim_silence(x24[0])
        v48 = sig.resample_poly(clip, 2, 1)
        place(voice, v48, t0)
        dur = len(v48) / SR
        spans.append((t0, t0 + dur))
        print(f"VO {fname}: file {len(x24[0])/sr24:.2f} dtk, lead sunyi {lead:.2f} dtk, "
              f"ucapan {dur:.2f} dtk, ditempatkan {t0:.1f}-{t0 + dur:.2f} dtk")

    # ---- 2. Musik: waltz pelan 90 bpm, C mayor, 15 bar x 2.0 dtk ----
    # bar: (chord, root_midi, triad_midi) ; beat = 2/3 dtk
    beat = 2.0 / 3.0
    bars = [
        ("C", 48, [60, 64, 67]), ("G", 43, [59, 62, 67]), ("Am", 45, [57, 60, 64]),
        ("Em", 40, [59, 64, 67]), ("F", 41, [57, 60, 65]), ("C", 48, [60, 64, 67]),
        ("F", 41, [57, 60, 65]), ("G", 43, [59, 62, 67]), ("C", 48, [60, 64, 67]),
        ("G", 43, [59, 62, 67]), ("Am", 45, [57, 60, 64]), ("Em", 40, [59, 64, 67]),
        ("F", 41, [57, 60, 65]), ("G", 43, [59, 62, 67]), ("C", 48, [60, 64, 67]),
    ]
    b = M.Band()
    for name, send in [("pad", 0.25), ("pluck", 0.18), ("musicbox", 0.26)]:
        b.track(name, send)
    r = rng(20261127)
    for k, (ch, root, tri) in enumerate(bars):
        tb = k * 2.0
        # pad hangat sepanjang bar
        b.add("pad", I.pad([I.m2f(m) for m in [root] + tri], 2.0, 0.5, r, att=0.5, rel=0.6), tb, 0.0)
        # petik bass di ketuk 1, petik akor lembut di ketuk 2-3
        b.add("pluck", I.pluck(I.m2f(root), 0.7, r, dur=1.0), tb, -0.05)
        for j in (1, 2):
            for m in tri[1:]:
                b.add("pluck", I.pluck(I.m2f(m), 0.32, r, dur=0.5, bright=0.6), tb + j * beat, 0.25)
    # melodi musicbox sederhana, 2 not per bar (nada tengah, lembut)
    mel = [
        (0.0, 1.0, 76), (1.0, 1.0, 79), (2.0, 1.0, 74), (3.0, 1.0, 71),
        (4.0, 1.0, 72), (5.0, 1.0, 76), (6.0, 1.0, 71), (7.0, 1.0, 74),
        (8.0, 1.0, 72), (9.0, 1.0, 69), (10.0, 1.0, 67), (11.0, 1.0, 76),
        (12.0, 1.0, 69), (13.0, 1.0, 72), (14.0, 1.0, 71), (15.0, 1.0, 74),
        (16.0, 1.0, 76), (17.0, 1.0, 79), (18.0, 1.0, 74), (19.0, 1.0, 79),
        (20.0, 1.0, 76), (21.0, 1.0, 72), (22.0, 1.0, 71), (23.0, 1.0, 76),
        (24.0, 1.0, 69), (25.0, 1.0, 72), (26.0, 1.0, 74), (27.0, 1.0, 71),
        (28.0, 1.0, 72), (29.0, 1.0, 76),
    ]
    M.melody(b, "musicbox", mel, 0.55, fn="musicbox", p=0.1)
    music, levels = render30(b)
    music = fades(music, fin=1.0, fout=1.5)
    print("level track musik:", levels)
    print("musik: waltz pelan 90 bpm, C mayor, pad + pluck + musicbox (tanpa mars/snare)")

    # ---- 3. SFX: 3 clink koin pelan saat L1 ("tiga gelas") ----
    sfx = np.zeros((2, N30))
    rr = rng(77)
    for t in (5.8, 6.4, 7.1):
        c = SG.clink(rr, f0=3200.0, dur=0.12)
        place(sfx, st(c), t)
    print("SFX: 3 clink koin di 5.8 / 6.4 / 7.1 dtk")

    # ---- 4. Mix (gain staging berdasarkan loudness) ----
    speech = np.concatenate([voice[:, ns(a):ns(c)] for a, c in spans], axis=1)
    voice_lufs = integrated(speech)
    voice_peak = float(np.max(np.abs(voice)))
    music_speech = np.concatenate([music[:, ns(a):ns(c)] for a, c in spans], axis=1)
    music_raw_lufs = integrated(music_speech)
    g_music_db = (voice_lufs + MUSIC_REL) - music_raw_lufs - DUCK_DB
    sfx_peak = float(np.max(np.abs(sfx)))
    g_sfx = (voice_peak * dbg(SFX_PEAK_REL)) / max(sfx_peak, 1e-9)

    duck = np.ones(N30)
    for a, c in spans:
        ia, ic = ns(a), ns(c)
        duck[ia:ic] = dbg(DUCK_DB)
        e = ns(0.08)
        duck[max(0, ia - e):ia] = np.linspace(1.0, dbg(DUCK_DB), e)[:ia - max(0, ia - e)]
        duck[ic:ic + e] = np.linspace(dbg(DUCK_DB), 1.0, e)[:N30 - ic]
    music_g = music * dbg(g_music_db) * duck[None, :]
    sfx_g = sfx * g_sfx
    print(f"gain staging: voice peak {voice_peak:.3f} ({20 * np.log10(voice_peak):.1f} dBFS), "
          f"voice ucapan {voice_lufs:.1f} LUFS")
    print(f"  musik mentah (saat bicara) {music_raw_lufs:.1f} LUFS -> gain {g_music_db:+.1f} dB "
          f"(target ducked {voice_lufs + MUSIC_REL:.1f} LUFS)")
    print(f"  sfx peak mentah {sfx_peak:.3f} -> gain {20 * np.log10(g_sfx):+.1f} dB "
          f"(target puncak {20 * np.log10(voice_peak * dbg(SFX_PEAK_REL)):.1f} dBFS)")
    mix = voice + music_g + sfx_g

    # master ke -16 LUFS + limiter; iterasi agar limiter tidak menarik
    # integrated ke bawah (pola mix.py skill: ulangi gain sampai konvergen)
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
    print(f"  sfx saja    [5.5-7.5 dtk]: {seg_lufs(sfx_g, 5.5, 7.5):.1f} LUFS")
    print(f"  mix bicara  [5-7 dtk]: {seg_lufs(mix, 5, 7):.1f} LUFS")
    print(f"  mix musik saja [0-5 dtk]: {seg_lufs(mix, 0, 5):.1f} LUFS")
    print(f"  mix ekor    [23-30 dtk]: {seg_lufs(mix, 23, 30):.1f} LUFS")

    write_wav(os.path.join(OUT_DIR, "mix.wav"), mix, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_voice.wav"), voice, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_music.wav"), music_g, bits=16)
    write_wav(os.path.join(STEM_DIR, "stem_sfx.wav"), sfx_g, bits=16)
    print("mix.wav:", os.path.join(OUT_DIR, "mix.wav"))
    print("durasi mix:", mix.shape[1] / SR, "dtk")


if __name__ == "__main__":
    main()
