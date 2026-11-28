# NASKAH — Malin Kundang (120 detik, 1080x1920, 24fps, 2880 frame)
# Legenda: anak durhaka dikutuk ibunya menjadi batu di pantai Air Manis.
# Inti legenda TIDAK diubah: nama Malin, pantai Air Manis, kutukan jadi batu.
# Kata "Nak" TIDAK dipakai di mana pun (TTS menghilangkan /k/ akhir) — pakai "anakku".
# Narasi = jam master. Kecepatan kata acuan: ~2,27 kata/dtk pada tempo 110.
# TTS: /opt/hatch/bin/tts speak --text "..." --voice avocado_v2:vg_id_XX --language id --format mp3 --speed N --output file.mp3
# Penempatan: kalimat berurutan mulai t=2.0, jeda 0,4 dtk antar kalimat;
# jeda 0,8 dtk sebelum D9 (kutukan, dramatis); jeda 1,0 dtk sebelum N12 (penutup).
# Total ucapan harus muat sebelum ~116 dtk; sisa sampai 120,000 dtk = ekor musik sunyi.
# UKUR durasi nyata tiap file TTS (trim silence), lalu laporkan tabel aktual
# (start/end tiap baris) — tabel itu yang dipakai story.ts.

| ID  | Tokoh        | Suara            | Tempo | Teks |
|-----|--------------|------------------|-------|------|
| N1  | Narator      | vg_id_m28        | 110   | Di pantai Air Manis, ada batu besar yang berlutut. Katanya, batu itu dulunya manusia. |
| N2  | Narator      | vg_id_m28        | 110   | Dahulu, di desa nelayan itu, hiduplah seorang janda tua bersama anaknya, Malin. Mereka miskin, tapi saling menyayangi. |
| D1  | Malin muda   | vg_id_m22        | 115   | Mak, aku mau merantau. Aku akan pulang membawa kekayaan. |
| D2  | Ibu          | vg_id_f32        | 100   | Pergilah, anakku. Tapi jangan lupakan ibumu ini. |
| N3  | Narator      | vg_id_m28        | 110   | Malin pun berlayar meninggalkan desanya. |
| D3  | Nahkoda      | vg_id_m43        | 100   | Angkat layar! Kita berlayar! |
| N4  | Narator      | vg_id_m28        | 110   | Kapal itu berangkat pagi-pagi. Di pantai, ibunya melambai sampai kapal hilang di cakrawala. |
| N5  | Narator      | vg_id_m28        | 110   | Tahun demi tahun berlalu. Malin menjadi saudagar kaya. Kapalnya besar, emasnya banyak. |
| D4  | Malin dewasa | vg_id_m41        | 105   | Lima peti emas... sepuluh peti... Semua ini milikku! |
| N6  | Narator      | vg_id_m28        | 110   | Suatu hari, kapal besar itu kembali ke desanya. Penduduk berkumpul di pantai. |
| D5  | Penduduk     | vg_id_m31        | 110   | Itu kapal Malin! Malin sudah pulang! |
| N7  | Narator      | vg_id_m28        | 110   | Ibu tua itu berlari ke pantai, memanggil anaknya. |
| D6  | Ibu          | vg_id_f32        | 100   | Malin! Anakku! Ini ibumu! Aku di sini! |
| D7  | Istri        | vg_id_f37        | 110   | Suamiku, siapa perempuan tua itu? Dia memanggil-manggil namamu. |
| D8  | Malin dewasa | vg_id_m41        | 105   | Aku tidak mengenalnya. Ibuku tidak mungkin seburuk itu. |
| N8  | Narator      | vg_id_m28        | 110   | Hati Malin telah buta oleh kekayaan. |
| D9  | Ibu          | vg_id_f32        | 90    | Oh, Tuhan... Kalau dia bukan anakku lagi... biarlah dia menjadi batu! |
| N9  | Narator      | vg_id_m28        | 110   | Dengan hati hancur, sang ibu mengucapkan kutukan itu. |
| N10 | Narator      | vg_id_m28        | 110   | Tiba-tiba langit gelap. Petir menyambar, ombak besar menghantam kapal! |
| D10 | Malin dewasa | vg_id_m41        | 105   | Mak... ampunilah aku... |
| N11 | Narator      | vg_id_m28        | 110   | Malin berlutut memohon ampun. Tapi terlambat. Tubuhnya perlahan mengeras menjadi batu. |
| N12 | Narator      | vg_id_m28        | 110   | Sampai hari ini, batu itu masih berlutut di pantai Air Manis. Ingatlah: sayangilah ibumu, sebelum terlambat. |

## Adegan (12 beat, batas shot AKAN disesuaikan ke tabel aktual audio)
1. 0–8 dtk: HOOK — pantai + batu berlutut (N1)
2. 8–17 dtk: Desa pagi, gubuk, Ibu menjahit jala, Malin muda (N2)
3. 17–26 dtk: Malin pamit (D1, D2) + N3
4. 26–34 dtk: Kapal berangkat, Ibu melambai (D3, N4)
5. 34–44 dtk: Waktu berlalu, Malin dewasa menghitung emas (N5, D4)
6. 44–54 dtk: Kapal besar kembali, penduduk berkumpul (N6, D5)
7. 54–64 dtk: Ibu memanggil (N7, D6)
8. 64–76 dtk: Istri bertanya, Malin menolak (D7, D8, N8)
9. 76–88 dtk: Kutukan (D9, N9)
10. 88–100 dtk: Badai + petir (N10) — PETIR tepat di kata "Petir"
11. 100–110 dtk: Malin berlutut memohon, mengeras jadi batu (D10, N11)
12. 110–120 dtk: PENUTUP — batu di pantai + pesan moral (N12)

## Musik (sintesis numpy, pola make_audio_kacaurus.py; master ~-16 LUFS)
- 0–24 dtk: lembut, pagi desa, mayor pelan
- 24–44 dtk: petualangan berlayar, tempo naik
- 44–64 dtk: megah, kepulangan kaya
- 64–88 dtk: minor, tegang, tempo pelan (penolakan + kutukan)
- 88–110 dtk: badai — drum + petir + ombak, musik paling keras
- 110–120 dtk: sunyi + nada sedih, penutup
## SFX: ombak + angin laut sepanjang pantai, langkah kaki, koin/emas (D4),
## petir TEPAT di kata "Petir" (N10), tangis Ibu pelan (D9, jangan berlebihan).
