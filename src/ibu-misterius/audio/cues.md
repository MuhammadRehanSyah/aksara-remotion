# IbuMisterius — cue sheet audio (90 dtk, horor misterius)

Semua suara orisinal: TTS vg_id_m28 (speed 110) untuk narasi; musik & SFX disintesis numpy/scipy (`make_audio_ibu.py`, pola `cartoon_3d_short/templates/audio`). Tanpa audio dari internet, tanpa suara mirip manusia yang disintesis.

## File
| file | isi |
|---|---|
| `public/ibu-misterius/audio/mix.wav` | mix final, 48 kHz, stereo, 16-bit, 4.320.000 sampel = 90,000 dtk |
| `src/ibu-misterius/audio/stem_voice.wav` | VO saja, pada gain mix (pra-limiter), float32 |
| `src/ibu-misterius/audio/stem_music.wav` | musik saja, pada gain mix (pra-limiter), float32 |
| `src/ibu-misterius/audio/stem_sfx.wav` | SFX saja, pada gain mix (pra-limiter), float32 |
| `src/ibu-misterius/voice/voice-m28-s110.wav` | TTS mentah (header ID3 37 byte di depan RIFF — lihat catatan) |
| `src/ibu-misterius/voice/voice-48k.wav` | VO 48 kHz mono yang dipakai di mix |
| `src/ibu-misterius/voice/words.json` | timing kata (faster-whisper tiny, 108 kata) |

## Master loudness
- Integrated **-15.0 LUFS**, true peak **-1.66 dBTP**, max momentary -8.7 LUFS, master gain +8.79 dB, max gain reduction limiter 6.26 dB
- Stem (pada gain mix): voice -11.7 LUFS, music -20.6 LUFS, sfx -25.9 LUFS
- Voice referensi: puncak -4.8 dBFS, [2-53 dtk] -20.5 LUFS; musik ducked target -30.5 LUFS (duck -3.0 dB saat bicara, dari words.json); puncak SFX -6.0 dB di bawah puncak VO.

ffmpeg ebur128 cross-check:
```
Summary:

  Integrated loudness:
    I:         -15.0 LUFS
    Threshold: -25.1 LUFS

  Loudness range:
    LRA:         8.1 LU
    Threshold: -35.0 LUFS
    LRA low:   -20.7 LUFS
    LRA high:  -12.6 LUFS

  True peak:
    Peak:       -1.7 dBFS
[out#0/null @ 0x5829eb4ca480] video:0KiB audio:16875KiB subtitle:0KiB other streams:0KiB global headers:0KiB muxing overhead: unknown
size=N/A time=00:01:30.00 bitrate=N/A speed= 207x elapsed=0:00:00.43
```

## Per adegan (LUFS terintegrasi per stem, pada gain mix)

| adegan | waktu | voice | musik | sfx |
|---|---|---|---|---|
| A desa malam | 0-18 dtk | -12.3 | -22.4 | -25.2 |
| B hutan | 18-36 dtk | -11.2 | -21.2 | -26.1 |
| C rumah tua | 36-54 dtk | -11.9 | -20.8 | -28.1 |
| D Ibu menoleh | 54-72 dtk | - | -22.7 | -24.6 |
| E fajar | 72-90 dtk | - | -17.8 | -26.8 |

## Musik
Drone rendah A minor (A1 55 Hz + E2 + A2 + E3 + A3, napas pelan ±15% @ 0,07 Hz, low-pass 420 Hz, hall RT60 2,0 dtk) + melodi music-box lirih 24 nada (A 5 nada, B 6, C 6, D 3, E 6). Adegan E menghangat: pad Am add9 (72-81 dtk) lalu pad F mayor (80,5-90 dtk), tetap minor, lebih terang; angin mereda, burung fajar masuk.

## SFX (semua sintetis)

| # | waktu | cue | keterangan |
|---|---|---|---|
| 1 | 0.00 dtk | angin (bed) | berdesir sepanjang 90 dtk; terkuat di B (18-36), mereda di E |
| 2 | 0.00 dtk | jangkrik (bed) | malam desa, adegan A 0-18 dtk, fade-out di 17-18 |
| 3 | 3.50 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 4 | 5.30 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 5 | 7.10 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 6 | 8.90 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 7 | 10.70 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 8 | 12.50 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 9 | 14.30 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 10 | 16.10 dtk | langkah kaki | Raka berjalan pelan, adegan A |
| 11 | 19.50 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 12 | 20.55 dtk | detak jantung | ~55 bpm, adegan B 21-34 dtk (lub-dub) |
| 13 | 21.00 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 14 | 22.50 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 15 | 24.00 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 16 | 25.50 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 17 | 27.00 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 18 | 28.50 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 19 | 30.00 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 20 | 31.50 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 21 | 33.00 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 22 | 34.50 dtk | langkah kaki | Raka masuk hutan, adegan B (daun kering) |
| 23 | 36.00 dtk | pintu berderit | pintu rumah tua dibuka, awal adegan C |
| 24 | 38.00 dtk | api lilin | retak halus + desis berdenyut, adegan C 38-54 dtk |
| 25 | 54.00 dtk | api lilin | retak halus + desis berdenyut, adegan D 54-70 dtk |
| 26 | 56.00 dtk | detak jantung | ~55 bpm, adegan D 56-70 dtk (lub-dub) |
| 27 | 72.00 dtk | burung fajar | kicau pagi, adegan E 72-90 dtk |

## Catatan
- VO TTS kedua (51,02 dtk) lebih panjang dari VO pertama yang sempat dibuat (49,85 dtk) — TTS tidak deterministik; timing kata di words.json mengikuti VO yang dipakai di mix ini.
- Dialog "Aku sudah lama pergi, Nak" jatuh di VO-relatif 41,56-45,88 dtk = mix 43,56-47,88 dtk (adegan C, bukan D seperti pembagian awal) karena VO total hanya ~51 dtk; detak jantung tetap di B & D sesuai tugas, jadi tidak menabrak dialog itu.
- VO berakhir 53,02 dtk; adegan D (54-72) dan E (72-90) musik + SFX saja — musik membawa penutup.
- Bisikan hutan TIDAK dibuat sebagai suara sintetis (pelajaran Part 2): diwakili angin berdesir + drone yang naik-turun.
