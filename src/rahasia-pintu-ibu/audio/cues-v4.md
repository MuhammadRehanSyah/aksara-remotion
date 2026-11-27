# RahasiaPintuIbu — cue sheet audio (90 dtk, misteri hangat)

Semua suara orisinal: TTS vg_id_m28 (speed 110) untuk narasi; musik & SFX disintesis numpy/scipy (`make_audio_rahasia.py`, pola `cartoon_3d_short/templates/audio`). Tanpa audio dari internet, tanpa suara mirip manusia yang disintesis.

## File
| file | isi |
|---|---|
| `public/rahasia-pintu-ibu/audio/mix-v4.wav` | mix final v4, 48 kHz, stereo, 16-bit, 4.320.000 sampel = 90,000 dtk |
| `src/rahasia-pintu-ibu/audio/stem_voice_v4.wav` | VO saja, pada gain mix (pra-limiter), float32 |
| `src/rahasia-pintu-ibu/audio/stem_music_v4.wav` | musik saja, pada gain mix (pra-limiter), float32 |
| `src/rahasia-pintu-ibu/audio/stem_sfx_v4.wav` | SFX saja, pada gain mix (pra-limiter), float32 |
| `src/rahasia-pintu-ibu/voice/voice-m28-s110.wav` | TTS mentah take 1 (header ID3 37 byte di depan RIFF — lihat catatan) |
| `src/rahasia-pintu-ibu/voice/voice-48k.wav` | VO 48 kHz mono yang dipakai di mix (dengan sambungan kalimat 'Nak') |
| `src/rahasia-pintu-ibu/voice/words.json` | timing kata (faster-whisper tiny, 138 kata, dari VO hasil sambung) |

## Master loudness
- Integrated **-15.0 LUFS**, true peak **-1.68 dBTP**, max momentary -9.1 LUFS, master gain +8.69 dB, max gain reduction limiter 5.70 dB
- Stem (pada gain mix): voice -13.0 LUFS, music -21.5 LUFS, sfx -28.7 LUFS
- Voice referensi: puncak -4.9 dBFS, [2-64 dtk] -21.7 LUFS; musik ducked target -31.7 LUFS (duck -3.0 dB saat bicara, dari words.json); puncak SFX -6.0 dB di bawah puncak VO.

ffmpeg ebur128 cross-check:
```
Summary:

  Integrated loudness:
    I:         -15.0 LUFS
    Threshold: -25.1 LUFS

  Loudness range:
    LRA:         5.6 LU
    Threshold: -35.0 LUFS
    LRA low:   -18.6 LUFS
    LRA high:  -13.0 LUFS

  True peak:
    Peak:       -1.7 dBFS
[out#0/null @ 0x5d5448ae9440] video:0KiB audio:16875KiB subtitle:0KiB other streams:0KiB global headers:0KiB muxing overhead: unknown
size=N/A time=00:01:30.00 bitrate=N/A speed= 223x elapsed=0:00:00.40
```

## Per adegan (LUFS terintegrasi per stem, pada gain mix)

| adegan | waktu | voice | musik | sfx |
|---|---|---|---|---|
| A malam hujan | 0-18 dtk | -13.1 | -23.3 | -26.1 |
| B pagi/bisikan | 18-36 dtk | -13.1 | -22.5 | -27.9 |
| C vas pecah | 36-54 dtk | -12.8 | -21.9 | -31.7 |
| D ruang kenangan | 54-72 dtk | -13.4 | -24.5 | -32.7 |
| E cermin emas | 72-90 dtk | - | -18.1 | -28.1 |

## Musik
Drone rendah A minor (A1 55 Hz + E2 + A2 + E3 + A3, napas pelan ±15% @ 0,07 Hz, low-pass 420 Hz, hall RT60 2,0 dtk) + melodi music-box lirih 24 nada (A 5 nada, B 6, C 6, D 3, E 6). Adegan E menghangat: pad Am add9 (72-81 dtk) lalu pad F mayor (80,5-90 dtk) + melodi naik; hujan mereda, burung pagi masuk di E2.

## SFX (semua sintetis)

| # | waktu | cue | keterangan |
|---|---|---|---|
| 1 | 0.00 dtk | hujan (bed) | rintik di jendela, adegan A 0-18 terkuat, mereda sampai 36 |
| 2 | 0.00 dtk | angin (bed) | berdesir sepanjang 90 dtk; terkuat di B2 27-36 (bisikan), mereda di E |
| 3 | 0.00 dtk | jangkrik (bed) | malam hujan, adegan A 0-18 dtk, fade-out di 17-18 |
| 4 | 10.50 dtk | denting jam | detik jam dinding, hitungan 1/3 (23.58) |
| 5 | 11.50 dtk | denting jam | detik jam dinding, hitungan 2/3 (23.58) |
| 6 | 12.50 dtk | denting jam | detik jam dinding, hitungan 3/3 (23.58) |
| 7 | 20.50 dtk | langkah kaki | Ibu berjalan pagi, adegan B1 |
| 8 | 22.00 dtk | langkah kaki | Ibu berjalan pagi, adegan B1 |
| 9 | 23.50 dtk | langkah kaki | Ibu berjalan pagi, adegan B1 |
| 10 | 25.00 dtk | langkah kaki | Ibu berjalan pagi, adegan B1 |
| 11 | 27.30 dtk | pintu berderit | pintu terlarang terbuka, adegan B2 |
| 12 | 28.50 dtk | detak jantung | ~55 bpm, adegan B2 28-35 dtk (lub-dub) |
| 13 | 34.10 dtk | PRANG vas pecah | vas keramik jatuh + pecah, visual f1023, akhir adegan B3 |
| 14 | 38.50 dtk | langkah kaki | Raka mendekati meja vas, adegan C1 |
| 15 | 39.50 dtk | langkah kaki | Raka mendekati meja vas, adegan C1 |
| 16 | 40.00 dtk | detak jantung | ~55 bpm, adegan C 40-47 dtk (lub-dub) |
| 17 | 40.30 dtk | langkah kaki | Raka mendekati meja vas, adegan C1 |
| 18 | 42.30 dtk | pintu ditutup | debuk pintu terlarang ditutup rapat, adegan C |
| 19 | 56.50 dtk | langkah kaki | Raka masuk ruang kenangan, adegan D |
| 20 | 57.50 dtk | kilik kunci | kunci kuningan di dekat pot melati, adegan D |
| 21 | 58.00 dtk | langkah kaki | Raka masuk ruang kenangan, adegan D |
| 22 | 59.50 dtk | langkah kaki | Raka masuk ruang kenangan, adegan D |
| 23 | 72.50 dtk | kilau emas | arpeggio glockenspiel saat cermin terbuka, adegan E1 |
| 24 | 81.50 dtk | pintu berderit | pintu depan terbuka pagi, adegan E2 |
| 25 | 82.00 dtk | burung pagi | kicau pagi, adegan E2 82-90 dtk |
| 26 | 83.00 dtk | langkah kaki | Ibu + Raka berjalan ke pintu pagi, adegan E2 |
| 27 | 84.50 dtk | langkah kaki | Ibu + Raka berjalan ke pintu pagi, adegan E2 |
| 28 | 86.00 dtk | langkah kaki | Ibu + Raka berjalan ke pintu pagi, adegan E2 |
| 29 | 87.50 dtk | langkah kaki | Ibu + Raka berjalan ke pintu pagi, adegan E2 |

## Catatan
- Kata "Nak" HILANG di TTS vg_id_m28 di semua take penuh (take 1 + take 2) dan di kalimat terpisah ("Nak.", "Nak!", "Nakk.", "nak.", "Nak, Ibu mohon." — semuanya terdengar "na"); analisis gelombang membuktikan tidak ada burst /k/ sama sekali setelah "na". Perbaikan: kata "Nak" dipotong dari TTS "Naka." (0,10-0,395 dtk, fade-out 12 ms) — /k/ antar-vokal terucap jelas — lalu disambung ke kalimat terpisah "Lupakan apa yang kamu lihat malam ini, Nak." dan kalimat itu disambung ke VO utama (35,12-37,44 dtk VO). Transkripsi balik VO hasil sambung: "nak?" terdengar jelas. Prosodi kalimat sambungan sedikit berbeda (take terpisah), ekor VO bergeser -0,03 dtk.
- VO total 61,93 dtk (mulai t=2, berakhir 63,93 dtk); adegan D akhir (64-72) dan E (72-90) musik + SFX saja — musik membawa penutup, seperti pola IbuMisterius.
- v4 (27 Nov 2026): SFX PRANG dipindah dari 41,0 dtk ke 34,1 dtk agar jatuh bersama kata "PRANG!" di narasi (34,10 dtk mix) dan visual pecah f1023; sebelumnya dipasang mengikuti visual lama f1230 = 41,0 dtk sehingga tertinggal ~7 dtk dari kata narasi (cacat yang dilaporkan Bos 27 Nov). Semua cue lain TIDAK berubah posisi.
- Bisikan Ibu TIDAK dibuat sebagai suara sintetis (pelajaran Part 2): diwakili angin berdesir yang menguat di B2 (27-36 dtk) + drone yang naik.
