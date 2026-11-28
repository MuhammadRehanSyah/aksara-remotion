// MalinKundang — 120 detik, 12 shot (2880 frame @ 24 fps, 1080x1920).
// Legenda Malin Kundang: anak durhaka dikutuk ibunya jadi batu di pantai Air Manis.
// Layout dunia: laut z < -10, pantai z -10..4, desa/gubuk z 4..10, kamera mostly z>4 menghadap -z (laut).
// Batas shot = TABEL AKTUAL audio (words.json, ucapan berakhir 101,49 dtk).
// Event visual ikut kata narasi (jam master): "Petir" 81,83 dtk = frame 1964.
export const FPS = 24;
export const TOTAL = 2880;
export type V3 = [number, number, number];
export type Expr = "neutral" | "worried" | "smile" | "surprised" | "sad" | "angry";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- layout dunia ----------------
export const HUT_POS: V3 = [-3.5, 0, 6]; // gubuk Ibu (pintu menghadap pantai/-z)
export const HUT2_POS: V3 = [4.5, 0, 7]; // gubuk tetangga
export const STONE_POS: V3 = [0.8, 0, -1.2]; // batu berlutut — PERSIS di titik Malin berlutut membatu (kontinuitas S11->S12)
export const NET_POS: V3 = [-1.3, 0, 4.0]; // jala yang dijahit Ibu (v2: digeser 1 m ke selatan, menjauhi dinding gubuk — Ibu bisa berdiri di sampingnya tanpa tertutup sudut gubuk)
export const SHIP_SMALL_HOME: V3 = [-4, 0, -16]; // kapal layar kecil (berangkat)
export const SHIP_BIG_HOME: V3 = [0, 0, -18]; // kapal dagang besar (kembali)
export const BEACH_CALL: V3 = [0, 0, -1]; // titik Ibu memanggil di pantai

// ---------------- posisi tokoh ----------------
// Malin muda: S1 membelakangi kamera menatap batu; S2-S3 di samping Ibu; berjalan ke laut saat N3 (f 557-621)
export const MALIN_MUDA_HOME: V3 = [0.6, 0, 3.5];
export const malinMudaPos = (f: number): V3 => {
  if (f < 192) return [0.0, 0, 0.8]; // S1: di depan batu, membelakangi kamera
  if (f < 557) return MALIN_MUDA_HOME;
  const u = smooth((f - 557) / 64);
  return [0.6 - 1.6 * u, 0, 3.5 - 9.5 * u];
};
export const malinMudaWalking = (f: number) => f >= 557 && f < 621;
export const malinMudaPhase = (f: number) => (f - 557) / 12;
// Malin muda: S1 membelakangi kamera menatap batu; S2-S3 menghadap Ibu (-1,25 rad — profil
// kuat, bukan 90° penuh: kepala kotak pada 90° murni menyembunyikan wajah total);
// saat D1 (f385-456) menoleh setengah ke kamera (-0,75 rad, three-quarter ~37°);
// berjalan ke laut membelakangi kamera.
export const malinMudaRotY = (f: number) => {
  if (f < 192 || f >= 557) return Math.PI;
  const base = -1.25;
  if (f < 373) return base;
  if (f < 397) return yawEase(f, 373, 397, base, -0.75);
  if (f < 456) return -0.75;
  if (f < 480) return yawEase(f, 456, 480, -0.75, base);
  return base;
};

// ---------------- arah hadap (yaw, rotasi Y) — v2: bervariasi, natural seperti film ----------------
// Konvensi: yaw 0 = menghadap +z (ke arah kamera bila kamera di +z), PI = membelakangi kamera,
// +PI/2 = menghadap +x, -PI/2 = menghadap -x. Tokoh kotak 3D: putar badan (bukan kartu),
// jadi yang berjalan menjauh menunjukkan punggung (ATURAN MOONWALK terpenuhi).
// Pembicara menoleh SETENGAH ke kamera (three-quarter, ~0,5 rad) HANYA saat dialognya,
// lalu kembali menghadap lawan bicara — lip-sync tetap terbaca tanpa semua menghadap depan.
export const yawEase = (f: number, f0: number, f1: number, from: number, to: number) =>
  from + (to - from) * smooth((f - f0) / (f1 - f0));

// Ibu: S2 menjahit menghadap jala (0,93 rad — profil ke kamera, tangan di atas jala);
// S3 menghadap Malin (1,25 rad), menoleh setengah ke kamera saat D2 (f466-547);
// S4 melambai mengikuti kapal (membelakangi kamera); S5-S6 menunggu menghadap laut/kapal
// (membelakangi kamera); S7 berlari ke kapal lalu berbalik memanggil (three-quarter 0,5 rad);
// S8 menghadap pasangan (1,5 rad, profil); S9 kutukan three-quarter (0,6 rad);
// S10 membelakangi kamera menatap Malin/bad ai.
export const ibuRotY = (f: number) => {
  if (f < 408) return Math.PI / 2; // S2: menghadap timur ke arah jala (profil ke kamera)
  if (f < 557) { // S3 pamit: menghadap Malin, menoleh saat D2
    const base = 1.25;
    if (f < 454) return base;
    if (f < 478) return yawEase(f, 454, 478, base, 0.75);
    if (f < 547) return 0.75;
    if (f < 557) return yawEase(f, 547, 557, 0.75, base);
    return base;
  }
  if (f < 816) return -2.84 + 0.29 * smooth((f - 557) / 259); // S4: melambai mengikuti kapal
  if (f < 1296) return Math.PI; // S5-S6: menunggu menghadap laut (membelakangi kamera)
  if (f < 1330) return -2.23; // S7: berlari ke arah kapal (membelakangi kamera)
  if (f < 1352) return yawEase(f, 1330, 1352, -2.23, 0.5); // berbalik memanggil
  if (f < 1416) return 0.5; // S7 akhir: memanggil, three-quarter ke kamera
  if (f < 1680) return 1.5; // S8: menghadap pasangan (profil ke kamera)
  if (f < 1932) return 0.6; // S9: kutukan, three-quarter (tidak frontal penuh)
  return 2.85; // S10: membelakangi kamera menatap Malin/bad ai
};

// Malin dewasa: S5 menghitung emas menghadap peti (1,29 rad, three-quarter, kepala menunduk);
// S6 di kapal menghadap desa (+z); S8 menghadap Istri (-1,25 rad), menoleh saat D8 (f1540-1610);
// S9 menghadap Ibu (hampir frontal tapi menatap Ibu di foreground); S10 membelakangi kamera
// menghadap badai, menoleh saat memohon D10 (f2043-2116); S11 membatu menghadap laut.
export const malinDewasaRotY = (f: number) => {
  if (f < 1048) return 1.29; // S5: menghadap peti emas
  if (f < 1416) return 0; // S6: di kapal menghadap desa
  if (f < 1680) { // S8 penolakan: menghadap Istri, menoleh saat D8
    const base = -1.25;
    if (f < 1528) return base;
    if (f < 1552) return yawEase(f, 1528, 1552, base, -0.75);
    if (f < 1610) return -0.75;
    if (f < 1634) return yawEase(f, 1610, 1634, -0.75, base);
    return base;
  }
  if (f < 1932) return -0.29; // S9: menghadap Ibu (foreground)
  if (f < 2043) return Math.PI; // S10: berdiri menghadap badai (membelakangi kamera)
  if (f < 2075) return yawEase(f, 2043, 2075, Math.PI, 0.4); // berlutut + berbalik memohon
  if (f < 2116) return 0.4; // D10: memohon, three-quarter ke kamera
  if (f < 2160) return yawEase(f, 2116, 2160, 0.4, Math.PI); // kembali menghadap laut
  return Math.PI; // S10 akhir + S11: membatu menghadap laut
};

// Istri: S6 di kapal menghadap desa (+z); S8 menghadap Malin (1,25 rad), menoleh saat D7 (f1428-1530);
// S9 menghadap Ibu; S10 menghadap Malin (profil ke kamera).
export const istriRotY = (f: number) => {
  if (f < 1416) return 0; // S6: di kapal menghadap desa
  if (f < 1680) { // S8: menghadap Malin, menoleh saat D7
    const base = 1.25;
    if (f < 1440) return yawEase(f, 1416, 1440, base, 0.75);
    if (f < 1530) return 0.75;
    if (f < 1554) return yawEase(f, 1530, 1554, 0.75, base);
    return base;
  }
  if (f < 1932) return 0.24; // S9: menghadap Ibu (foreground)
  return 1.71; // S10: menghadap Malin (profil ke kamera)
};

// Penduduk (S6): membelakangi kamera menghadap kapal; saat D5 (f1169-1221) keduanya
// saling menghadap (1,25 rad — profil kuat, wajah masih terbaca three-quarter, bukan 90° penuh).
export const pendudukRotY = (i: number, f: number) => {
  const base = Math.PI;
  const to = i === 0 ? 1.25 : -1.25;
  if (f < 1157) return base;
  if (f < 1181) return yawEase(f, 1157, 1181, base, to);
  if (f < 1221) return to;
  if (f < 1245) return yawEase(f, 1221, 1245, to, base);
  return base;
};
// Ibu: di gubuk (S2), di samping Malin saat pamit (S3), di pantai melambai (S4), berlari ke pantai (S7 awal), berdiri memanggil (S7 akhir), kutukan (S9)
export const IBU_HUT: V3 = [-2.1, 0, 4.0]; // di depan gubuk, di BARAT meja jala — menghadap timur (profil ke kamera), tangan sampai di atas jala
export const ibuPos = (f: number): V3 => {
  if (f < 408) return IBU_HUT;
  if (f < 557) return [-0.7, 0, 3.6]; // pamit: di samping Malin muda (two-shot)
  if (f < 816) return [0.5, 0, -1.5]; // pantai, melambai ke kapal
  if (f < 1296) return [0.3, 0, -1.2]; // menunggu di pantai (tengah, di depan kapal)
  if (f < 1330) { // v2: berlari ke arah kapal (membelakangi kamera), bukan ke arah kamera
    const u = smooth((f - 1296) / 34);
    return [0.3 - 1.8 * u, 0, -1.2 - 1.4 * u];
  }
  if (f < 1416) return [-1.5, 0, -2.6]; // berhenti, berbalik memanggil (akhir S7)
  if (f < 1680) return [-1.0, 0, -0.3]; // S8 penolakan: di samping Malin, tidak menghalangi kamera
  return [0, 0, 1.5]; // kutukan (S9) + badai (S10)
};
export const ibuRunning = (f: number) => f >= 1296 && f < 1330;
export const ibuRunPhase = (f: number) => (f - 1296) / 9;
export const ibuWaving = (f: number) => f >= 557 && f < 816;
// Nahkoda: di kapal kecil (S4)
export const nahkodaPos = (): V3 => [-4, 1.6, -16];
// Malin dewasa: di dek kapal besar (S5-S6), lalu di pantai saat penolakan (S8), berlutut (S10)
export const malinDewasaPos = (f: number): V3 => {
  // Dek kapal besar. S5 (f<1048): x=-0,5 — 0,5 m di kiri tiang, tiang tak menembus kepala
  // saat close-up hitung emas. S6-S7: x=-0,1 (posisi v1) supaya ia terlihat di samping
  // Istri — lompatan 0,4 m tersembunyi oleh cut S5→S6 (kamera berganti total).
  if (f < 1416) return [f < 1048 ? -0.5 : -0.1, 1.6, -18];
  return [0.8, 0, -1.2]; // pantai (penolakan, kutukan, badai, berlutut membatu)
};
// Istri: di dek kapal (S6), di pantai saat penolakan (S8)
export const istriPos = (f: number): V3 => {
  if (f < 1416) return [-0.7, 1.6, -18];
  return [-0.6, 0, -1.0];
};
// Penduduk (2 orang): di pantai menyambut (S6)
export const PENDUDUK_POS: V3[] = [[-1.2, 0, 1.5], [1.2, 0, 1.5]];
// Kapal kecil berlayar menjauh (S4): dari (-4,-16) ke (-16,-26), lalu hilang
export const shipSmallPos = (f: number): V3 => {
  if (f < 557) return SHIP_SMALL_HOME;
  const u = smooth((f - 557) / 192);
  return [-4 - 12 * u, 0, -16 - 10 * u];
};
export const shipSmallSail = (f: number) => f >= 557 && f < 816;
// Kapal besar mendekat (S6): dari (0,-28) ke (0,-12), tiba f1200
export const shipBigPos = (f: number): V3 => {
  if (f < 1048) return [0, 0, -28];
  if (f < 1200) {
    const u = smooth((f - 1048) / 152);
    return [0, 0, -28 + 16 * u];
  }
  return [0, 0, -12];
};
// Kapal besar oleng di badai (S10): miring mengikuti ombak
export const shipBigRoll = (f: number) =>
  f >= 1932 && f < 2273 ? 0.14 * Math.sin((f / FPS) * 2.2) : 0;
// Malin berlutut + membatu (S10): lutut menekuk saat D10 (f2043), membatu saat N11 (f2125-2249)
export const malinKneel = (f: number) => smooth((f - 2043) / 120); // 0..1 selama 5 dtk
export const malinStone = (f: number) => smooth((f - 2125) / 124); // 0..1, mulai saat N11
// Gelombang laut: fase global (dipakai world.ts untuk ombak + kapal oleng)
export const wavePhase = (f: number) => (f / FPS) * 1.1;

// ---------------- ekspresi per tokoh ----------------
export const ibuExpr = (f: number): Expr =>
  f < 408 ? "neutral" : f < 1296 ? "smile" : f < 1416 ? "surprised" : f < 1680 ? "worried" : "sad";
export const malinMudaExpr = (f: number): Expr => (f < 408 ? "neutral" : f < 557 ? "smile" : "neutral");
export const malinDewasaExpr = (f: number): Expr =>
  f < 1536 ? "smile" : f < 1680 ? "angry" : f < 1932 ? "sad" : f < 2043 ? "surprised" : "sad";
export const istriExpr = (f: number): Expr => (f < 1416 ? "smile" : f < 1680 ? "surprised" : "worried");
export const nahkodaExpr = (): Expr => "smile";
export const pendudukExpr = (): Expr => "smile";

// ---------------- shot ----------------
// Batas = tabel aktual audio (detik x24): N1 2-7,41 | N2 7,81-15,65 | D1 16,05-19 | D2 19,40-22,80
// N3 23,20-25,57 | D3 25,98-27,96 | N4 28,36-33,71 | N5 34,11-39,61 | D4 40,01-43,24
// N6 43,65-48,32 | D5 48,72-50,88 | N7 51,28-54,46 | D6 54,86-59,08 | D7 59,48-63,75
// D8 64,15-67,07 | N8 67,47-69,55 | D9 70,35-76,49 | N9 76,89-80,09 | N10 80,49-84,71 (Petir 81,83)
// D10 85,11-88,15 | N11 88,55-93,72 | N12 94,72-101,49 | outro musik 101,5-120
export type ShotDef = { id: number; a: number; b: number; grade: "day" | "golden" | "storm" | "dawn" };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 192, grade: "day" }, // hook: pantai + batu berlutut + Malin muda membelakangi kamera
  { id: 2, a: 192, b: 408, grade: "day" }, // desa pagi: gubuk + Ibu menjahit jala
  { id: 3, a: 408, b: 557, grade: "day" }, // pamit: Malin muda + Ibu (dialog, hadap kamera)
  { id: 4, a: 557, b: 816, grade: "day" }, // kapal kecil berangkat, Ibu melambai
  { id: 5, a: 816, b: 1048, grade: "golden" }, // kapal dagang: Malin dewasa menghitung emas
  { id: 6, a: 1048, b: 1296, grade: "golden" }, // kapal besar kembali, penduduk berkumpul
  { id: 7, a: 1296, b: 1416, grade: "day" }, // Ibu berlari + memanggil (dialog, hadap kamera)
  { id: 8, a: 1416, b: 1680, grade: "golden" }, // penolakan: Malin dewasa + Istri (dialog, hadap kamera)
  { id: 9, a: 1680, b: 1932, grade: "day" }, // kutukan: close-up Ibu, langit menggelap
  { id: 10, a: 1932, b: 2273, grade: "storm" }, // badai + petir + Malin berlutut membatu
  { id: 11, a: 2273, b: 2640, grade: "storm" }, // batu berlutut (Malin membatu) + narasi penutup
  { id: 12, a: 2640, b: 2880, grade: "dawn" }, // penutup: batu di pantai, fajar
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const gradeAt = (f: number): ShotDef["grade"] => shotAt(f).grade;

// Petir: kilat putih DI kata "Petir" (N10) — words.json: 81,83-82,33 dtk = frame 1964-1976.
export const FLASH_FRAMES = [1964, 1965, 1966, 1967, 1968, 1969];
export const isFlash = (f: number) => FLASH_FRAMES.includes(f);

// ---------------- kamera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

// S1 hook: Malin muda membelakangi kamera menatap batu berlutut, laut di belakang
// (kamera dari kanan supaya Malin tidak menutupi batu)
const S1 = (f: number) => dolly([3.0, 2.0, 6.5], [0.5, 0.8, -1.2], pushK(f, 0, 0.0012), { fov: 54 });
// S2 desa: Ibu menjahit jala di depan gubuk (v2: Ibu menghadap jala — profil ke kamera;
// kamera digeser sedikit supaya jala ikut masuk frame, bukan terpotong di tepi)
const S2 = (f: number) => dolly([0.8, 1.8, 0.2], [-1.7, 1.0, 4.0], pushK(f, 192, 0.0014), { fov: 50 });
// S3 pamit: two-shot Ibu + Malin muda SALING MENGHADAP (profil); yang bicara menoleh setengah ke kamera
const S3 = (f: number) => dolly([0, 1.7, 9.0], [-0.1, 1.2, 3.5], pushK(f, 408, 0.0018), { fov: 46 });
// S4 berangkat: kapal kecil di laut + Ibu melambai di pantai (wide)
const S4 = (f: number) => dolly([3, 2.6, 6], [-2, 1.2, -14], pushK(f, 557, 0.0012), { fov: 56 });
// S5 kapal dagang: Malin dewasa di dek menghitung emas (kamera dari sisi kapal, layar tidak menghalangi)
const S5 = (f: number) => dolly([5.0, 3.4, -21.0], [-0.2, 2.0, -28], pushK(f, 816, 0.0012), { fov: 44 });
// S6 kembali: kapal besar mendekat + penduduk di pantai (wide)
const S6 = (f: number) => dolly([0, 2.8, 10.5], [0, 1.4, -12], pushK(f, 1048, 0.0008), { fov: 58 });
// S7 Ibu memanggil: v2 — Ibu berlari ke arah kapal (membelakangi kamera), berhenti,
// berbalik three-quarter ke kamera saat memanggil (D6); kamera mundur sedikit supaya
// awal lari tidak terpotong tepi frame
const S7 = (f: number) => dolly([-0.5, 1.7, 5.0], [-0.7, 1.3, -2.0], pushK(f, 1296, 0.002), { fov: 44 });
// S8 penolakan: three-shot — Istri + Malin SALING MENGHADAP (profil), Ibu menghadap mereka (profil);
// yang bicara menoleh setengah ke kamera
const S8 = (f: number) => dolly([0.2, 1.8, 7.2], [-0.1, 1.3, -1.0], pushK(f, 1416, 0.0018), { fov: 46 });
// S9 kutukan: close-up Ibu, langit menggelap (v2: kamera digeser +x 0,9 m — tiang kapal
// tak lagi sejajar di belakang kepala Ibu; fov 50 supaya Malin + Istri tetap masuk frame)
const S9 = (f: number) => dolly([0.9, 1.7, 5.0], [0, 1.2, 1.2], pushK(f, 1680, 0.0016), { fov: 50 });
// S10 badai: wide laut gelap + kapal oleng + Malin berlutut di pantai
const S10 = (f: number) => dolly([0, 3.2, 10], [0, 1.6, -18], pushK(f, 1932, 0.001), { fov: 58 });
// S11 berlutut: medium Malin berlutut membatu di pantai (kamera rendah, sejajar wajah menunduk)
const S11 = (f: number) => dolly([1.2, 1.1, 4], [0.8, 0.7, -1.2], pushK(f, 2273, 0.0018), { fov: 46 });
// S12 penutup: wide pantai fajar + batu berlutut (crane naik pelan)
const S12 = (f: number) => {
  const u = smooth((f - 2640) / 240);
  return dolly([0.5, 2.4 + 1.2 * u, 9], [0.8, 0.9, -1.2], pushK(f, 2640, 0.0008), { fov: 54 });
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1 }],
  2: [{ f: 192, cut: true, s: S2 }],
  3: [{ f: 408, cut: true, s: S3 }],
  4: [{ f: 557, cut: true, s: S4 }],
  5: [{ f: 816, cut: true, s: S5 }],
  6: [{ f: 1048, cut: true, s: S6 }],
  7: [{ f: 1296, cut: true, s: S7 }],
  8: [{ f: 1416, cut: true, s: S8 }],
  9: [{ f: 1680, cut: true, s: S9 }],
  10: [{ f: 1932, cut: true, s: S10 }],
  11: [{ f: 2273, cut: true, s: S11 }],
  12: [{ f: 2640, cut: true, s: S12 }],
};
export const camAt = (id: number, f: number): Cam => run(CAMS[id], f);
export const focusAt = (id: number, f: number): V3 => camAt(id, f).look;
