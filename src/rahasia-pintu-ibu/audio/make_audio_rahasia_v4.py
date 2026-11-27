"""Audio "RahasiaPintuIbu" 90 dtk (misteri hangat) — VO + musik minor + SFX sintetis.
- VO: voice-48k.wav (TTS vg_id_m28, speed 110, take 1 + kalimat "Lupakan apa yang
  kamu lihat malam ini, Nak." disambung dari take terpisah — kata "Nak" di TTS
  selalu hilang di semua take penuh; "Nak" di sini dipotong dari "Naka" agar
  bunyi /k/ terdengar; terverifikasi transkripsi balik), mulai t=2.0 dtk.
- Musik: drone rendah A minor + melodi music-box lirih; adegan E menghangat
  (pad emas) lalu pagi cerah (pad F/C mayor).
- SFX: hujan (A-B), denting jam (A, 23.58), pintu berderit (B2, C, E2),
  bisikan = angin/desir SAJA (tanpa suara mirip manusia), detak jantung ~55 bpm
  (B2 & C), langkah kaki, PRANG vas pecah (34.1 dtk = visual pecah f1023, akhir B3) — v4: dipindah dari 41.0 dtk agar jatuh bersama kata "PRANG!" di narasi (34,10 dtk mix), dulu tertinggal ~7 dtk,
  kilau emas (E1), jangkrik (A), burung pagi (E2). Tanpa audio dari internet.
- Mix: master -15 LUFS, true peak <= -1 dBTP; musik -10 LU di bawah VO saat
  bicara (duck -3 dB); puncak SFX -6 dB di bawah puncak VO. 90.000 dtk, 48 kHz stereo.
Output (v4): public/rahasia-pintu-ibu/audio/mix-v4.wav + stem_voice_v4/music_v4/sfx_v4.wav + cues-v4.md
(diambil dari make_audio_rahasia.py; HANYA posisi SFX PRANG yang dipindah 41.0 -> 34.1 dtk, lainnya identik)
di src/rahasia-pintu-ibu/audio/.
"""
import json
import os
import subprocess
import sys
import time

import numpy as np
from scipy import signal as sig

sys.path.insert(0, "/home/hatch/workspace/custom-skills/cartoon_3d_short/templates/audio")
import dsp
from dsp import (SR, ns, tt, dbg, rng, place, st, integrated, true_peak, momentary,
                 read_wav, write_wav, hp, lp, fades, make_ir, convolve_st, phase,
                 smooth_noise, curve, widen, pan)
import sfx_gen as SG
import instruments as IN

BASE = "/home/hatch/workspace/remotion/src/rahasia-pintu-ibu"
VOICE_PATH = os.path.join(BASE, "voice", "voice-48k.wav")
WORDS_PATH = os.path.join(BASE, "voice", "words.json")
OUT_DIR = "/home/hatch/workspace/remotion/public/rahasia-pintu-ibu/audio"
STEM_DIR = os.path.join(BASE, "audio")
DUR = 90.0
N = ns(DUR)
VOICE_T0 = 2.0
TARGET_LUFS = -15.0
DUCK_DB = -3.0
MUSIC_REL = -10.0
SFX_PEAK_REL = -6.0

# adegan: A malam hujan, B pagi lalu bisikan, C vas pecah, D ruang kenangan, E cermin emas + pagi
SCENES = [("A malam hujan", 0.0, 18.0), ("B pagi/bisikan", 18.0, 36.0), ("C vas pecah", 36.0, 54.0),
          ("D ruang kenangan", 54.0, 72.0), ("E cermin emas", 72.0, 90.0)]

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(STEM_DIR, exist_ok=True)


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


# ================================================================ helpers
def heartbeat(r, bpm=55.0):
    """satu detak jantung lub-dub: thump sinus rendah 58 Hz + dub lebih pelan."""
    d = 0.55
    t = tt(d)
    lub = np.exp(-t / 0.09) * np.sin(phase(58 * (1 + 0.35 * np.exp(-t / 0.02))))
    dub = np.exp(-np.maximum(t - 0.18, 0) / 0.08) * np.sin(phase(50 * (1 + 0.3 * np.exp(-np.maximum(t - 0.18, 0) / 0.02))))
    dub = np.where(t >= 0.18, dub, 0.0) * 0.6
    return fades(lub + dub, 0.002, 0.05)


def rain_bed(dur, r, level=1.0):
    """hujan rintik: desis broadband + tetes acak (bukan rekaman)."""
    n = ns(dur)
    base = dsp.colored(n, r, 1.0)
    base = dsp.bp(base, 900, 4200, 1) * 0.5
    patter = np.zeros(n)
    tm = r.uniform(0, 0.05)
    while tm < dur:
        k = ns(tm)
        L = ns(0.03)
        if k + L < n:
            tl = tt(0.03)
            drop = hp(r.standard_normal(L), 2500) * np.exp(-tl / 0.008) * r.uniform(0.2, 0.8)
            patter[k:k + L] += drop
        tm += r.exponential(0.045)
    return (base + patter) * level


def clock_tick(r, high=True):
    """denting jam: klik pendek 2 kHz (tinggi) / 1,4 kHz (rendah), berselang-seling."""
    d = 0.05
    t = tt(d)
    f0 = 2100.0 if high else 1400.0
    return np.exp(-t / 0.008) * np.sin(phase(f0 * np.ones_like(t))) * 0.8


def ceramic_crash(r):
    """PRANG vas keramik: ledakan noise tinggi + pecahan (clink) + debuk rendah."""
    d = 0.9
    n = ns(d)
    t = np.arange(n) / SR
    burst = hp(r.standard_normal(n), 2800) * np.exp(-t / 0.12) * 1.0
    burst += dsp.bp(r.standard_normal(n), 900, 2500, 1) * np.exp(-t / 0.2) * 0.5
    thump = np.exp(-t / 0.09) * np.sin(phase(95 * np.ones(n))) * 0.9
    y = burst + thump
    for i in range(14):
        cl = SG.clink(rng(1000 + i * 37), f0=r.uniform(1800, 5200), dur=0.12)
        k = ns(r.uniform(0.0, 0.28))
        y[k:k + len(cl)] += cl[: n - k] * r.uniform(0.4, 1.0)
    return fades(y, 0.001, 0.35)


def gold_shimmer(r):
    """kilau emas cermin: arpeggio glockenspiel naik, lembut."""
    y = np.zeros(ns(2.6))
    for i, m in enumerate([81, 84, 88, 93]):
        note = IN.glock(IN.m2f(m), vel=0.5, r=rng(500 + i), dur=2.2)
        k = ns(i * 0.35)
        y[k:k + len(note)] += note[: len(y) - k]
    return y


def speech_spans(words, merge=0.3):
    sp = []
    for w in words:
        s, e = float(w["s"]) + VOICE_T0, float(w["e"]) + VOICE_T0
        if sp and s - sp[-1][1] < merge:
            sp[-1][1] = max(sp[-1][1], e)
        else:
            sp.append([s, e])
    return sp


def duck_envelope(spans, depth=DUCK_DB, pre=0.08, post=0.15, att=0.07, rel=0.45):
    ctrl = 1000
    nc = int(DUR * ctrl) + 2
    va = np.zeros(nc)
    for s, e in spans:
        va[max(0, int((s - pre) * ctrl)): int((e + post) * ctrl)] = 1.0
    ka, kr = 1 - np.exp(-1 / (att * ctrl)), 1 - np.exp(-1 / (rel * ctrl))
    env = np.zeros(nc)
    e = 0.0
    for i in range(nc):
        tgt = va[i]
        e += (tgt - e) * (ka if tgt > e else kr)
        env[i] = e
    return np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, depth * env)


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
    return x * gs[None, :], gs


# ================================================================ 1. voice
x48, sr48 = read_wav(VOICE_PATH)
assert sr48 == 48000, sr48
voice = np.zeros((2, N))
place(voice, x48[0], VOICE_T0)
voice_end = VOICE_T0 + x48.shape[1] / SR
log(f"VO: {x48.shape[1] / SR:.2f} dtk, ditempatkan {VOICE_T0:.1f}-{voice_end:.2f} dtk")
words = json.load(open(WORDS_PATH))["words"]
spans = speech_spans(words)
log(f"words.json: {len(words)} kata, {len(spans)} rentang bicara")

# ================================================================ 2. musik (A minor, lirih)
r = rng(20261127)
t = np.arange(N) / SR
# --- drone rendah: A1/A2 + E2/E3, napas pelan, level per adegan
drone = np.zeros(N)
for f, a in [(55.0, 0.50), (82.41, 0.22), (110.0, 0.34), (164.81, 0.16), (220.0, 0.07)]:
    drift = 1 + 0.0015 * np.sin(2 * np.pi * 0.05 * t + f)
    drone += a * np.sin(phase(f * drift))
breath = 0.85 + 0.15 * smooth_noise(N, r, 0.07)
drone *= breath
scene_gain = curve(N, [(0, 0.80), (18, 0.80), (20, 0.90), (36, 0.90), (38, 1.00),
                       (54, 1.00), (56, 0.60), (70, 0.60), (72, 0.85), (82, 0.85), (90, 0.70)])
drone *= scene_gain
drone = lp(drone, 420, 2)
music = st(drone)

# --- melodi music-box lirih (A minor), satu nada tiap ~3 dtk
MELODY = [  # (t, midi, vel) — A hujan, B pagi/bisik, C vas, D kenangan, E emas/pagi
    (3.5, 76, 0.50), (6.5, 72, 0.45), (9.5, 74, 0.50), (12.5, 69, 0.45), (15.5, 76, 0.40),
    (19.5, 69, 0.50), (22.5, 72, 0.50), (25.5, 76, 0.50), (28.5, 74, 0.45), (31.5, 72, 0.50), (34.5, 69, 0.45),
    (38.0, 64, 0.50), (41.8, 67, 0.50), (44.0, 69, 0.50), (47.0, 72, 0.45), (50.0, 71, 0.45), (53.0, 69, 0.40),
    (56.5, 81, 0.40), (62.5, 76, 0.40), (68.5, 72, 0.40),
    (73.0, 69, 0.50), (76.0, 72, 0.50), (79.0, 76, 0.50), (82.0, 77, 0.50), (85.0, 76, 0.45), (88.0, 69, 0.45),
]
mel = np.zeros(N)
for mt, m, v in MELODY:
    note = IN.musicbox(IN.m2f(m), vel=v, r=rng(int(mt * 100 + m)), dur=2.4)
    k = ns(mt)
    mel[k:k + len(note)] += note[: N - k]
# --- pad emas adegan E: Am add9 (72-81) lalu F mayor + C mayor pagi (81-90)
pad_e = IN.pad([110.0, 130.81, 164.81, 220.0], dur=9.0, vel=0.5, r=rng(5), att=3.0, rel=2.0)
place(music, pad_e, 72.0)
pad_f = IN.pad([87.31, 110.0, 130.81, 174.61], dur=9.0, vel=0.5, r=rng(6), att=3.0, rel=2.5)
place(music, pad_f, 80.5)
# --- reverb hall ringan untuk melodi + drone
hall = make_ir(2.0, 11, pre=0.015, hf=1.2)
wet = convolve_st(mel, hall) * 0.35 + convolve_st(drone * 0.4, hall) * 0.12
music += st(mel) + wet
music = fades(music, fin=0.05, fout=1.5)
log("musik: drone A minor + 24 nada music-box + pad emas E + pad pagi")

# ================================================================ 3. SFX
sfx = np.zeros((2, N))
cues = []  # (t, nama, deskripsi)
# --- hujan rintik: bed 0-36 dtk, terkuat di A, mereda di B
rain = rain_bed(36.0, rng(21), level=1.0)
rain_env = curve(ns(36.0), [(0, 1.0), (18, 1.0), (27, 0.7), (36, 0.4)])
rain = rain * rain_env
sfx[:, :ns(36.0)] += st(rain) * 0.55
cues.append((0.0, "hujan (bed)", "rintik di jendela, adegan A 0-18 terkuat, mereda sampai 36"))
# --- angin berdesir: semua adegan, terkuat di B2 (bisikan), mereda di E2
wind = SG.breeze(DUR, rng(31), level=1.0, gust=0.18, bright=900)
wind_env = curve(N, [(0, 0.60), (18, 0.60), (27, 1.00), (36, 1.00), (38, 0.75),
                     (54, 0.75), (56, 0.60), (72, 0.60), (74, 0.35), (90, 0.30)])
sfx += wind * wind_env[None, :] * 0.5
cues.append((0.0, "angin (bed)", "berdesir sepanjang 90 dtk; terkuat di B2 27-36 (bisikan), mereda di E"))
# --- jangkrik malam, adegan A
crick = SG.crickets(18.0, rng(41), voices=3)
crick_env = np.ones(ns(18.0))
crick_env[-ns(1.0):] *= np.linspace(1, 0, ns(1.0))
sfx[:, :ns(18.0)] += st(crick * crick_env) * 0.3
cues.append((0.0, "jangkrik (bed)", "malam hujan, adegan A 0-18 dtk, fade-out di 17-18"))
# --- denting jam: "Pukul 23.58" (VO 10.7-12.7 dtk mix)
for i, tk in enumerate([10.5, 11.5, 12.5]):
    place(sfx, pan(clock_tick(rng(60 + i), high=(i % 2 == 0)), 0.0) * 0.7, tk)
    cues.append((tk, "denting jam", f"detik jam dinding, hitungan {i + 1}/3 (23.58)"))
# --- langkah kaki: B1 pagi (Ibu berjalan), C1 (Raka mendekati vas), D (masuk ruang kenangan), E2 (ke pintu)
for i, ft in enumerate([20.5, 22.0, 23.5, 25.0]):
    step = SG.stroll_step(rng(100 + i), scuff=0.6)
    place(sfx, pan(step, -0.2 if i % 2 == 0 else 0.2) * 0.8, ft)
    cues.append((ft, "langkah kaki", "Ibu berjalan pagi, adegan B1"))
for i, ft in enumerate([38.5, 39.5, 40.3]):
    step = SG.stroll_step(rng(200 + i), scuff=0.8)
    place(sfx, pan(step, 0.25 if i % 2 == 0 else -0.25) * 0.9, ft)
    cues.append((ft, "langkah kaki", "Raka mendekati meja vas, adegan C1"))
for i, ft in enumerate([56.5, 58.0, 59.5]):
    step = SG.stroll_step(rng(300 + i), scuff=0.5)
    place(sfx, pan(step, -0.15 if i % 2 == 0 else 0.15) * 0.8, ft)
    cues.append((ft, "langkah kaki", "Raka masuk ruang kenangan, adegan D"))
for i, ft in enumerate([83.0, 84.5, 86.0, 87.5]):
    step = SG.stroll_step(rng(400 + i), scuff=0.5)
    place(sfx, pan(step, 0.2 if i % 2 == 0 else -0.2) * 0.8, ft)
    cues.append((ft, "langkah kaki", "Ibu + Raka berjalan ke pintu pagi, adegan E2"))
# --- pintu terlarang berderit, B2 (pintu terbuka f810 = 27.0 dtk)
creak = SG.creak(1.4, rng(55), rate0=55, rate1=130, modes=SG.TIMBER, rough=0.15, noise=0.06)
place(sfx, widen(creak, rng(56), 9, 0.6) * 0.9, 27.3)
cues.append((27.3, "pintu berderit", "pintu terlarang terbuka, adegan B2"))
# --- detak jantung ~55 bpm: B2 (28.5-35) & C (40-47)
for t0, t1, tag in [(28.5, 35.0, "B2"), (40.0, 47.0, "C")]:
    bt = t0
    while bt < t1:
        place(sfx, st(heartbeat(rng(int(bt * 10)))) * 0.9, bt)
        bt += 60.0 / 55.0
    cues.append((t0, "detak jantung", f"~55 bpm, adegan {tag} {t0:.0f}-{t1:.0f} dtk (lub-dub)"))
# --- PRANG vas pecah: visual pecah f1023 = 34.1 dtk (v4; kata "PRANG!" narasi di 34,10 dtk mix)
crash = ceramic_crash(rng(77))
place(sfx, st(crash) * 1.0, 34.1)
cues.append((34.1, "PRANG vas pecah", "vas keramik jatuh + pecah, visual f1023, akhir adegan B3"))
# --- pintu ditutup rapat setelah pecah (debuk + derit pendek), 42.3 dtk
thud = np.exp(-tt(0.25) / 0.06) * np.sin(phase(70 * np.ones(ns(0.25)))) * 0.9
place(sfx, pan(thud, 0.0) * 0.9, 42.3)
cues.append((42.3, "pintu ditutup", "debuk pintu terlarang ditutup rapat, adegan C"))
# --- kunci kuningan: kilik kecil saat Raka melihat kunci di dekat pot melati (57.5 dtk)
place(sfx, pan(SG.clink(rng(88), f0=3200, dur=0.12), 0.2) * 0.6, 57.5)
cues.append((57.5, "kilik kunci", "kunci kuningan di dekat pot melati, adegan D"))
# --- kilau emas cermin terbuka (E1, 72.5 dtk) + pad sudah di musik
shim = gold_shimmer(rng(99))
place(sfx, st(shim) * 0.8, 72.5)
cues.append((72.5, "kilau emas", "arpeggio glockenspiel saat cermin terbuka, adegan E1"))
# --- pintu depan berderit pelan saat terbuka pagi (E2, 81.5 dtk)
creak2 = SG.creak(1.2, rng(155), rate0=70, rate1=140, modes=SG.TIMBER, rough=0.12, noise=0.05)
place(sfx, widen(creak2, rng(156), 9, 0.6) * 0.7, 81.5)
cues.append((81.5, "pintu berderit", "pintu depan terbuka pagi, adegan E2"))
# --- burung pagi, adegan E2
birds = SG.bird_chirps(8.0, rng(81), density=0.7, kind="sparrow")
birds_env = np.ones(ns(8.0))
birds_env[:ns(2.0)] *= np.linspace(0, 1, ns(2.0))
place(sfx, widen(birds * birds_env, rng(82), 8, 0.8) * 0.7, 82.0)
cues.append((82.0, "burung pagi", "kicau pagi, adegan E2 82-90 dtk"))
log(f"SFX: {len(cues)} cue")

# ================================================================ 4. mix
def seg_lufs(x, t0, t1):
    return integrated(x[:, ns(t0):ns(t1)])

voice_lufs = seg_lufs(voice, 2.0, 64.0)
voice_peak = float(np.max(np.abs(voice)))
music_raw_lufs = seg_lufs(music, 2.0, 64.0)
g_music_db = (voice_lufs + MUSIC_REL) - music_raw_lufs - DUCK_DB
dk = duck_envelope(spans)
music_g = music * dbg(g_music_db) * dbg(dk)[None, :]
sfx_peak = float(np.max(np.abs(sfx)))
g_sfx = (voice_peak * dbg(SFX_PEAK_REL)) / max(sfx_peak, 1e-9)
sdk = duck_envelope(spans, depth=-4.0, pre=0.05, post=0.10, att=0.05, rel=0.30)
sfx_g = sfx * g_sfx * dbg(sdk)[None, :]
log(f"gain staging: voice peak {voice_peak:.3f} ({20 * np.log10(voice_peak):.1f} dBFS), "
    f"voice[2-64] {voice_lufs:.1f} LUFS")
log(f"  musik mentah[2-64] {music_raw_lufs:.1f} LUFS -> gain {g_music_db:+.1f} dB "
    f"(target ducked {voice_lufs + MUSIC_REL:.1f} LUFS)")
log(f"  sfx peak mentah {sfx_peak:.3f} -> gain {20 * np.log10(g_sfx):+.1f} dB "
    f"(target puncak {20 * np.log10(voice_peak * dbg(SFX_PEAK_REL)):.1f} dBFS)")

mix0 = voice + music_g + sfx_g
G = TARGET_LUFS - integrated(mix0)
for it in range(4):  # iterasi: limiter menarik level, kejar -15 LUFS
    y, gr = limiter(mix0 * dbg(G), thr_db=-2.0)
    L = integrated(y)
    log(f"master iter {it}: gain {G:+.2f} dB -> {L:.2f} LUFS, TP {true_peak(y):.2f} dBTP, "
        f"max GR {-20 * np.log10(gr.min()):.2f} dB")
    if abs(L - TARGET_LUFS) < 0.03:
        break
    G += TARGET_LUFS - L
tp = true_peak(y)
if tp > -1.0:
    y = y * dbg(-1.0 - tp)
    tp = true_peak(y)
y = fades(y, fin=0.01, fout=1.5)
assert y.shape == (2, N)
gv, gm, gs = voice * dbg(G), music_g * dbg(G), sfx_g * dbg(G)
write_wav(os.path.join(OUT_DIR, "mix-v4.wav"), y, bits=16)
from scipy.io import wavfile as _wvf
for _name, _x in (("stem_voice_v4.wav", gv), ("stem_music_v4.wav", gm), ("stem_sfx_v4.wav", gs)):
    _wvf.write(os.path.join(STEM_DIR, _name), SR, _x.T.astype(np.float32))
log("wrote mix + stems")

# ================================================================ 5. laporan
I, TP = integrated(y), true_peak(y)
Mmax = float(np.max(momentary(y)))
grdb = -20 * np.log10(gr)
log(f"mix: {I:.2f} LUFS integrated, true peak {TP:.2f} dBTP, max momentary {Mmax:.1f} LUFS, "
    f"master gain {G:+.2f} dB, max GR {grdb.max():.2f} dB, "
    f"GR>0.5 dB pada {float((grdb > 0.5).mean()) * 100:.2f} % sampel")
for name, a, b in SCENES:
    Lv, Lm, Ls = seg_lufs(gv, a, b), seg_lufs(gm, a, b), seg_lufs(gs, a, b)
    log(f"  {name:<16} {a:>4.0f}-{b:>4.0f} dtk  voice {Lv:6.1f}  music {Lm:6.1f}  sfx {Ls:6.1f} LUFS")
log(f"  hujan A [0-18]: sfx {seg_lufs(gs, 0, 18):.1f} LUFS vs voice {seg_lufs(gv, 0, 18):.1f} LUFS")
log(f"  PRANG [34.1]: sfx {seg_lufs(gs, 33.6, 35.1):.1f} LUFS vs voice {seg_lufs(gv, 33.6, 35.1):.1f} LUFS")
log(f"  ekor tanpa VO [64-90]: mix {seg_lufs(y, 64, 90):.1f} LUFS")

# ebur128 cross-check
r_ = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", os.path.join(OUT_DIR, "mix-v4.wav"),
                     "-af", "ebur128=peak=true", "-f", "null", "-"],
                    capture_output=True, text=True, timeout=300)
eb = r_.stderr
i = eb.rfind("Summary:")
eb_sum = eb[i:] if i >= 0 else eb[-1200:]
print(eb_sum)

# ================================================================ 6. cues.md
L = []
w = L.append
w("# RahasiaPintuIbu — cue sheet audio (90 dtk, misteri hangat)")
w("")
w("Semua suara orisinal: TTS vg_id_m28 (speed 110) untuk narasi; musik & SFX disintesis "
  "numpy/scipy (`make_audio_rahasia.py`, pola `cartoon_3d_short/templates/audio`). "
  "Tanpa audio dari internet, tanpa suara mirip manusia yang disintesis.")
w("")
w("## File")
w("| file | isi |")
w("|---|---|")
w("| `public/rahasia-pintu-ibu/audio/mix-v4.wav` | mix final v4, 48 kHz, stereo, 16-bit, 4.320.000 sampel = 90,000 dtk |")
w("| `src/rahasia-pintu-ibu/audio/stem_voice_v4.wav` | VO saja, pada gain mix (pra-limiter), float32 |")
w("| `src/rahasia-pintu-ibu/audio/stem_music_v4.wav` | musik saja, pada gain mix (pra-limiter), float32 |")
w("| `src/rahasia-pintu-ibu/audio/stem_sfx_v4.wav` | SFX saja, pada gain mix (pra-limiter), float32 |")
w("| `src/rahasia-pintu-ibu/voice/voice-m28-s110.wav` | TTS mentah take 1 (header ID3 37 byte di depan RIFF — lihat catatan) |")
w("| `src/rahasia-pintu-ibu/voice/voice-48k.wav` | VO 48 kHz mono yang dipakai di mix (dengan sambungan kalimat 'Nak') |")
w("| `src/rahasia-pintu-ibu/voice/words.json` | timing kata (faster-whisper tiny, 138 kata, dari VO hasil sambung) |")
w("")
w("## Master loudness")
w(f"- Integrated **{I:.1f} LUFS**, true peak **{TP:.2f} dBTP**, max momentary {Mmax:.1f} LUFS, "
  f"master gain {G:+.2f} dB, max gain reduction limiter {-20 * np.log10(gr.min()):.2f} dB")
w(f"- Stem (pada gain mix): voice {integrated(gv):.1f} LUFS, music {integrated(gm):.1f} LUFS, "
  f"sfx {integrated(gs):.1f} LUFS")
w(f"- Voice referensi: puncak {20 * np.log10(voice_peak):.1f} dBFS, [2-64 dtk] {voice_lufs:.1f} LUFS; "
  f"musik ducked target {voice_lufs + MUSIC_REL:.1f} LUFS (duck {DUCK_DB} dB saat bicara, dari words.json); "
  f"puncak SFX {SFX_PEAK_REL} dB di bawah puncak VO.")
w("")
w("ffmpeg ebur128 cross-check:")
w("```")
w(eb_sum.strip())
w("```")
w("")
w("## Per adegan (LUFS terintegrasi per stem, pada gain mix)")
w("")
w("| adegan | waktu | voice | musik | sfx |")
w("|---|---|---|---|---|")
for name, a, b in SCENES:
    f = lambda x: "-" if x <= -98 else f"{x:.1f}"
    w(f"| {name} | {a:.0f}-{b:.0f} dtk | {f(seg_lufs(gv, a, b))} | {f(seg_lufs(gm, a, b))} | {f(seg_lufs(gs, a, b))} |")
w("")
w("## Musik")
w("Drone rendah A minor (A1 55 Hz + E2 + A2 + E3 + A3, napas pelan ±15% @ 0,07 Hz, low-pass 420 Hz, "
  "hall RT60 2,0 dtk) + melodi music-box lirih 24 nada (A 5 nada, B 6, C 6, D 3, E 6). "
  "Adegan E menghangat: pad Am add9 (72-81 dtk) lalu pad F mayor (80,5-90 dtk) + melodi naik; "
  "hujan mereda, burung pagi masuk di E2.")
w("")
w("## SFX (semua sintetis)")
w("")
w("| # | waktu | cue | keterangan |")
w("|---|---|---|---|")
for i, (t_, name, desc) in enumerate(sorted(cues, key=lambda c: c[0])):
    w(f"| {i + 1} | {t_:.2f} dtk | {name} | {desc} |")
w("")
w("## Catatan")
w("- Kata \"Nak\" HILANG di TTS vg_id_m28 di semua take penuh (take 1 + take 2) dan di kalimat "
  "terpisah (\"Nak.\", \"Nak!\", \"Nakk.\", \"nak.\", \"Nak, Ibu mohon.\" — semuanya terdengar \"na\"); "
  "analisis gelombang membuktikan tidak ada burst /k/ sama sekali setelah \"na\". "
  "Perbaikan: kata \"Nak\" dipotong dari TTS \"Naka.\" (0,10-0,395 dtk, fade-out 12 ms) — /k/ antar-vokal "
  "terucap jelas — lalu disambung ke kalimat terpisah \"Lupakan apa yang kamu lihat malam ini, Nak.\" "
  "dan kalimat itu disambung ke VO utama (35,12-37,44 dtk VO). Transkripsi balik VO hasil sambung: "
  "\"nak?\" terdengar jelas. Prosodi kalimat sambungan sedikit berbeda (take terpisah), ekor VO bergeser -0,03 dtk.")
w("- VO total 61,93 dtk (mulai t=2, berakhir 63,93 dtk); adegan D akhir (64-72) dan E (72-90) "
  "musik + SFX saja — musik membawa penutup, seperti pola IbuMisterius.")
w("- v4 (27 Nov 2026): SFX PRANG dipindah dari 41,0 dtk ke 34,1 dtk agar jatuh bersama kata \"PRANG!\" di narasi "
  "(34,10 dtk mix) dan visual pecah f1023; sebelumnya dipasang mengikuti visual lama f1230 = 41,0 dtk sehingga "
  "tertinggal ~7 dtk dari kata narasi (cacat yang dilaporkan Bos 27 Nov). Semua cue lain TIDAK berubah posisi.")
w("- Bisikan Ibu TIDAK dibuat sebagai suara sintetis (pelajaran Part 2): diwakili angin berdesir yang "
  "menguat di B2 (27-36 dtk) + drone yang naik.")
open(os.path.join(STEM_DIR, "cues-v4.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
log("wrote cues.md")
