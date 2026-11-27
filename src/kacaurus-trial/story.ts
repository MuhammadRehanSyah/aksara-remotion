// KacaurusTrial — 30 detik, 4 shot (720 frame @ 24 fps, 1080x1920).
// Warung kopi malam, 2 tokoh kotak-kotak ORIGINAL (Bapak "Pak Darno" + Anak "Dimas").
// Cerita: Bapak menghitung uang hari itu ("cuma laku tiga gelas..."), Anak datang
// membawakan kopi ("besok pasti lebih ramai"), Bapak tersenyum ("yang penting kita tetap buka").
// Ruangan: interior warung x -3..3, z -3..3, tinggi 3.2; kamera di sisi depan (z > 3, tanpa dinding depan).
// Dialog (TTS, narasi mulai t=2 dtk — waktu video): L1 f120 (5,0 dtk), L2 f288 (12,0 dtk), L3 f504 (21,0 dtk).
export const FPS = 24;
export const TOTAL = 720;
export const D0 = 0;
export type V3 = [number, number, number];
export type Expr = "neutral" | "worried" | "smile" | "surprised";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- layout ruangan ----------------
export const COUNTER: V3 = [0, 0, -1.2]; // meja konter (atas y=0.95)
export const BAPAK_POS: V3 = [0, 0, -1.9]; // Bapak di belakang konter, menghadap kamera (+z)
export const ANAK_START: V3 = [2.4, 0, -0.4]; // Anak masuk dari kanan ruangan
export const ANAK_END: V3 = [0.62, 0, -0.9]; // Anak berhenti di samping konter (dekat Bapak)
export const LAMP_POS: V3 = [0, 2.5, -0.6]; // lampu gantung hangat
export const CUP_POS: V3 = [-0.3, 0.99, -1.2]; // gelas kopi Bapak di konter (beruap)
export const CUP2_POS: V3 = [0.5, 0.99, -1.2]; // gelas yang dibawa Anak, diletakkan di konter
export const MONEY_POS: V3 = [-0.15, 0.99, -1.42]; // tumpukan uang kertas

// ---------------- animasi tokoh ----------------
// Bapak menghitung koin (shot B): 3 koin muncul bertahap saat ia mengetuk
export const coinVisible = (i: number, f: number) => f >= [150, 190, 230][i];
// lengan kanan Bapak: mengetuk ke bawah di tiap koin (f 150/190/230), sisanya santai
export const bapakCountArm = (f: number): number => {
  if (f < 132 || f > 276) return -0.12;
  let dip = 0;
  for (const t of [150, 190, 230]) {
    const d = (f - t) / 12;
    if (d >= 0 && d < 1) dip = Math.max(dip, Math.sin(d * Math.PI));
  }
  return -0.35 - 0.35 * dip; // sudut putar lengan (rad, negatif = ke depan/bawah)
};
// Anak berjalan masuk (shot C): f 288..360 dari kanan ke samping konter
export const ANAK_POS = (f: number): V3 => {
  const u = smooth((f - 288) / 72);
  return [2.4 - 1.78 * u, 0, -0.4 - 0.5 * u];
};
export const anakWalking = (f: number) => f >= 288 && f < 360;
export const anakWalkPhase = (f: number) => (f - 288) / 12; // 2 langkah/detik
// Anak meletakkan gelas (f 360..400): lengan kanan turun; lalu mengangkat tangan kiri memberi isyarat (f 400..440)
export const anakPutCup = (f: number) => smooth((f - 360) / 40);
export const anakGesture = (f: number) => (f >= 400 && f <= 460 ? Math.sin(((f - 400) / 60) * Math.PI) : 0);
// Bapak mengangguk (shot D): f 516..564, dua anggukan pelan
export const bapakNod = (f: number) => (f >= 516 && f <= 564 ? Math.sin(((f - 516) / 24) * Math.PI) * 0.13 : 0);
// Bapak tersenyum mulai f 468 (setelah punchline Anak), Anak selalu ceria
export const bapakExpr = (f: number): Expr => (f < 120 ? "neutral" : f < 468 ? "worried" : "smile");
export const anakExpr = (): Expr => "smile";
// lampu gantung bergoyang pelan sepanjang video
export const lampSway = (f: number) => 0.03 * Math.sin((f / FPS) * 0.8);

// ---------------- shot ----------------
export type ShotDef = { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 120 }, // A: wide warung malam
  { id: 2, a: 120, b: 288 }, // B: close-up Bapak menghitung koin
  { id: 3, a: 288, b: 504 }, // C: two-shot, Anak masuk membawa kopi
  { id: 4, a: 504, b: 720 }, // D: close-up Bapak tersenyum + mengangguk
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

// ---------------- teks layar gaya Kacaurus (putih tebal, garis hitam, bawah) ----------------
export const CAPTIONS: { a: number; b: number; text: string }[] = [
  { a: 12, b: 108, text: "WARUNG KOPI PAK DARNO" },
  { a: 132, b: 276, text: "HARI INI CUMA LAKU TIGA GELAS..." },
  { a: 300, b: 396, text: "BESOK PASTI LEBIH RAMAI, PAK!" },
  { a: 396, b: 492, text: "KOPI BAPAK PALING ENAK DI SINI!" },
  { a: 516, b: 696, text: "YANG PENTING KITA TETAP BUKA." },
];

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

// A: wide — seluruh warung, Bapak di belakang konter, lampu gantung, rak toples
const A = (f: number) => dolly([0, 1.75, 4.6], [0, 1.25, -1.2], pushK(f, 0, 0.0016), { fov: 54 });
// B: close-up Bapak — kepala + bahu + koin di konter (kamera agak tinggi agar koin utuh di atas teks)
const B = (f: number) => dolly([0.15, 1.7, 0.9], [0, 1.52, -1.9], pushK(f, 120, 0.0022), { fov: 42 });
// C: two-shot — Bapak kiri, Anak masuk dari kanan membawa kopi (kamera mundur + lebar agar keduanya masuk frame; posisi kamera digeser kiri supaya kepala Anak tidak menutupi wajah Bapak)
const C = (f: number) => dolly([0.8, 1.8, 3.8], [0.1, 1.2, -1.3], pushK(f, 288, 0.0012), { fov: 56 });
// D: close-up penutup — Bapak tersenyum + mengangguk, Anak di tepi kanan (kamera mundur + lebar agar kepala Anak utuh)
const D = (f: number) => dolly([-0.3, 1.85, 2.2], [0.35, 1.45, -1.9], pushK(f, 504, 0.0018), { fov: 52 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: A }],
  2: [{ f: 120, cut: true, s: B }],
  3: [{ f: 288, cut: true, s: C }],
  4: [{ f: 504, cut: true, s: D }],
};
export const camAt = (id: number, f: number): Cam => run(CAMS[id], f);
export const focusAt = (id: number, f: number): V3 => camAt(id, f).look;
