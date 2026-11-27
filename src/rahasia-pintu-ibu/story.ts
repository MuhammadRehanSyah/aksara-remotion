// RahasiaPintuIbu — 90 detik, 5 adegan x 18 detik (2700 frame @ 30 fps, 1080x1920).
// Adaptasi ringkas komik 10 lembar "Rahasia di Balik Pintu Ibu" (disetujui Bos).
// Satu rumah kayu tua: ruang utama (x 55..65, z -84..-76) + ceruk cermin terlarang
// di balik dinding belakang (z -88..-84) + ruang kenangan siang hari (x -65..-55).
// Potongan keras antar adegan; kamera selalu bergerak (push-in terus-menerus).
export const FPS = 30;
export const TOTAL = 2700;
export const D0 = 0; // lantai y = 0
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- posisi cerita (meter, y = 0 lantai) ----------------
// Ruang utama (rumah kayu tua): pintu Raka di dinding depan (gap x 59..61, z=-76),
// cermin pusaka di ceruk belakang (z=-87.6), jendela hujan di dinding kiri (x=55.4).
export const ROOM: V3 = [60, 0, -80];
export const MIRROR: V3 = [60, 0, -87.6]; // posisi cermin besar di ceruk terlarang
export const IBU_A: V3 = [60, 0, -77.4]; // A: Ibu di pintu Raka, membawa kunci tua
export const RAKA_A: V3 = [60.55, 0, -78.3]; // A: Raka di samping Ibu, dekat pintu
// B1 pagi: Ibu berjalan di ruang utama (x 58.2 -> 61.4), Raka memperhatikan
export const IBU_B1 = (tau: number): V3 => [58.2 + 0.36 * tau, 0, -79.8];
export const RAKA_B1: V3 = [62.3, 0, -81.5];
// B2 malam: Ibu membelakangi kamera di ambang pintu terlarang, menghadap cermin
export const IBU_B2: V3 = [60, 0, -84.6];
export const RAKA_B2: V3 = [59.55, 0, -82.7]; // Raka mengintip dari balik Ibu, dekat ambang pintu
// C1: meja vas di dekat pintu terlarang; Raka berjalan mendekat lalu menyenggol vas
export const VASE_TABLE: V3 = [58.0, 0, -78.0];
export const RAKA_C1 = (tau: number): V3 => { const u = Math.min(tau, 4); return [59.6 - 0.25 * u, 0, -80.6 + 0.85 * u]; }; // tiba di SISI DEPAN meja vas pada tau~4
export const IBU_C1: V3 = [62.2, 0, -80.0];
// C2: close-up Ibu — mata berkaca-kaca, tangan gemetar (jitter di cast.ts)
export const IBU_C2: V3 = [60, 0, -79.8];
// D: ruang kenangan siang hari (x -65..-55): pot melati + kunci di dekat pintu,
// surat di lantai, jam pasir di meja, sketsa Ayah di dinding belakang
export const MEM_ROOM: V3 = [-60, 0, -80];
export const JASMINE_POT: V3 = [-59.5, 0, -77.4];
export const KEY_SPOT: V3 = [-59.3, 0, -77.0]; // kunci kuningan tertinggal di lantai
export const RAKA_D1: V3 = [-60, 0, -77.6];
export const RAKA_D2: V3 = [-60.0, 0, -81.6]; // di depan dinding sketsa, di samping Ibu
export const IBU_D2: V3 = [-59.2, 0, -81.8];
// E1 tengah malam: Ibu + Raka di depan cermin yang terbuka (cahaya emas)
export const IBU_E1: V3 = [59.4, 0, -83.0];
export const RAKA_E1: V3 = [60.6, 0, -83.0];
// E2 pagi: Ibu + Raka berjalan ke pintu yang terbuka, matahari memenuhi lorong
export const IBU_E2 = (tau: number): V3 => [59.4, 0, -80.5 + 0.28 * tau];
export const RAKA_E2 = (tau: number): V3 => [60.6, 0, -80.5 + 0.28 * tau];

// vas jatuh di C1: mulai miring f 1240, jatuh f 1240-1270, pecah (serpihan muncul) f >= 1270
export const VASE_TIP_F = 1200;
export const VASE_BREAK_F = 1230;
// cermin terbuka (emas): f 2160-2430 (E1); beriak samar di B2 (f 810-1080) dan C (f 1080-1620)
export const mirrorOpen = (f: number) => (f >= 2160 && f < 2430 ? smooth((f - 2160) / 90) : 0);
export const mirrorRipple = (f: number) => (f >= 810 && f < 1620 ? 0.6 : f >= 2160 && f < 2430 ? 1 : 0);

export type Light = "night" | "day" | "dawn";
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 540, light: "night", tau: (t) => t },          // A malam hujan, Ibu + kunci tua
  { id: 2, a: 540, b: 1080, light: "night", tau: (t) => t - 18 },  // B pagi (batik/kamboja) lalu bisikan malam
  { id: 3, a: 1080, b: 1620, light: "night", tau: (t) => t - 36 }, // C vas pecah + mata Ibu berkaca-kaca
  { id: 4, a: 1620, b: 2160, light: "day", tau: (t) => t - 54 },   // D ruang kenangan siang hari
  { id: 5, a: 2160, b: 2700, light: "night", tau: (t) => t - 72 }, // E cermin emas lalu pagi bermatahari
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** 0 = malam .. 1 = siang penuh (B1 f 540-810 dan D f 1620-2160) */
export const dayU = (f: number) => {
  if (f >= 540 && f < 810) return smooth((f - 540) / 45) * (1 - smooth((f - 765) / 45));
  if (f >= 1620 && f < 2160) return smooth((f - 1620) / 45) * (1 - smooth((f - 2115) / 45));
  return 0;
};
/** 0 = malam .. 1 = pagi bermatahari penuh (E2 f 2430-2700) */
export const dawnU = (f: number) => smooth((f - 2430) / 200);

// ---------------- camera ----------------
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

// A: dari dalam kamar melihat Ibu di pintu (jendela hujan di kiri frame), lalu mendekat
const A1 = (f: number) => dolly([62.8, 1.9, -80.5], [60.0, 1.4, -77.8], pushK(f, 0, 0.0012), { fov: 46 });
const A2 = (f: number) => dolly([60.2, 1.9, -81.6], [60.0, 1.35, -77.4], pushK(f, 270, 0.0018), { fov: 42, roll: -0.02 });
// B1 pagi: mengikuti Ibu berjalan dari samping; B2 malam: dari belakang Ibu ke arah cermin
const B1 = (f: number) => { const p = IBU_B1((f / FPS) - 18); return dolly([p[0], 1.9, -76.6], [p[0], 0.95, -79.8], pushK(f, 540, 0.0012), { fov: 46 }); };
const B2 = (f: number) => dolly([60, 2.0, -79.2], [60, 1.4, -86.8], pushK(f, 810, 0.0015), { fov: 44, roll: 0.02 });
// C1: Raka mendekati meja vas; C2: close-up wajah Ibu
const C1 = (f: number) => dolly([61.0, 2.1, -82.0], [58.6, 1.0, -78.0], pushK(f, 1080, 0.0012), { fov: 46 });
const C2 = (f: number) => dolly([60.6, 1.62, -77.4], [60, 1.5, -79.8], pushK(f, 1350, 0.0018), { fov: 34, roll: 0.015 });
// D1: ruang kenangan — Raka di pintu melihat surat-surat; D2: mendekat ke sketsa Ayah
const D1 = (f: number) => dolly([-60, 1.9, -81.2], [-59.7, 1.3, -77.8], pushK(f, 1620, 0.0012), { fov: 46 });
const D2 = (f: number) => dolly([-57.6, 2.2, -77.6], [-59.6, 1.3, -82.8], pushK(f, 1890, 0.0018), { fov: 50, roll: -0.02 });
// E1: cermin emas — Ibu + Raka di depan cermin; E2: pagi — lorong bermatahari, pintu terbuka
const E1 = (f: number) => dolly([60, 2.2, -77.6], [60, 1.4, -85.5], pushK(f, 2160, 0.0012), { fov: 48 });
const E2 = (f: number) => dolly([60, 2.2, -82.2], [60, 1.2, -76.6], pushK(f, 2430, 0.0012), { fov: 46 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: A1 }, { f: 270, dur: 90, s: A2 }],
  2: [{ f: 540, s: B1 }, { f: 810, dur: 60, cut: true, s: B2 }],
  3: [{ f: 1080, s: C1 }, { f: 1350, dur: 60, cut: true, s: C2 }],
  4: [{ f: 1620, s: D1 }, { f: 1890, dur: 90, s: D2 }],
  5: [{ f: 2160, s: E1 }, { f: 2430, dur: 90, s: E2 }],
};
export const camAt = (id: number, f: number): Cam => run(CAMS[id], f);
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [{ f: 0, cInf: 0 }]; // semua tajam
export const dofAt = (f: number) => ({ cInf: 0, focus: undefined as ((f: number) => V3) | undefined });
export const focusAt = (id: number, f: number): V3 => camAt(id, f).look;
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
