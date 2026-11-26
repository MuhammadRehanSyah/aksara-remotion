// IbuMisterius — 90 detik, 5 adegan x 18 detik (2700 frame @ 30 fps, 1080x1920).
// Potongan keras antar adegan; kamera selalu bergerak (push-in terus-menerus).
export const FPS = 30;
export const TOTAL = 2700;
export const D0 = 0; // tanah datar y = 0
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- posisi cerita (meter, y = 0 tanah) ----------------
export const IBU_A = (tau: number): V3 => [0, 0.15, 16 - 1.5 * tau]; // A: melayang 0,15 m, meluncur ke -z
export const RAKA_B = (tau: number): V3 => [0.6, 0, -24 - 1.1 * tau];
export const IBU_B = (tau: number): V3 => [0.6, 0.15, RAKA_B(tau)[2] - 11];
export const ROOM: V3 = [60, 0, -80]; // interior rumah tua (ruang tamu)
export const IBU_C: V3 = [59.6, 0, -79.8]; // Ibu di depan kursi-kursi, menghadap -z (ke kamera)
export const IBU_D: V3 = [59.6, 0, -79.8];
export const HILL: V3 = [0, 5.5, -115]; // puncak bukit fajar
export const IBU_E: V3 = [1.2, 5.5, -113.5];
export const RAKA_E: V3 = [1.8, 5.35, -111.5];
// kursi-kursi kosong di interior (semicircle menghadap +z, ke arah Ibu/kamera masuk)
export const CHAIRS: V3[] = [
  [58.0, 0, -82.5], [59.3, 0, -83.4], [60.7, 0, -83.4], [62.0, 0, -82.5],
];
// wajah pucat di antara pohon (hutan B): posisi + tinggi mata
export const PALE_FACES: { p: V3; s: number }[] = [
  { p: [-4.2, 2.6, -32], s: 1.0 }, { p: [4.6, 2.2, -38], s: 0.9 },
  { p: [-5.0, 3.0, -44], s: 1.1 }, { p: [4.2, 2.8, -50], s: 1.0 },
  { p: [-3.6, 2.4, -54], s: 0.85 },
];
// pohon hutan (posisi, tinggi) — dipakai world.ts untuk pohon bergoyang (kitClone)
export const FOREST_TREES: { p: V3; h: number; kind: string }[] = [
  { p: [-4.5, 0, -28], h: 9, kind: "tree_oak" }, { p: [5, 0, -30], h: 8, kind: "tree_default" },
  { p: [-6, 0, -36], h: 10, kind: "tree_detailed" }, { p: [5.5, 0, -40], h: 9, kind: "tree_fat" },
  { p: [-5, 0, -46], h: 8, kind: "tree_cone" }, { p: [6, 0, -48], h: 10, kind: "tree_oak" },
  { p: [-6.5, 0, -54], h: 9, kind: "tree-high-round" }, { p: [5, 0, -56], h: 8, kind: "tree_default" },
  { p: [-4, 0, -60], h: 9, kind: "tree_detailed" }, { p: [6.5, 0, -62], h: 10, kind: "tree_fat" },
];

// ---------------- shots ----------------
export type Light = "night" | "dawn";
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 540, light: "night", tau: (t) => t },          // A desa malam
  { id: 2, a: 540, b: 1080, light: "night", tau: (t) => t - 18 },  // B hutan
  { id: 3, a: 1080, b: 1620, light: "night", tau: (t) => t - 36 }, // C rumah tua interior
  { id: 4, a: 1620, b: 2160, light: "night", tau: (t) => t - 54 }, // D close-up Ibu
  { id: 5, a: 2160, b: 2700, light: "dawn", tau: (t) => t - 72 },  // E fajar
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** 0 = malam penuh .. 1 = fajar penuh (lerp selama adegan E) */
export const dawnU = (f: number) => smooth((f - 2160) / 540);
/** Ibu memudar di akhir E: opacity 1 -> 0 selama f 2340-2520 (terlihat di kamera lebar E1 dan dua-shot E2) */
export const ibuFade = (f: number) => (f < 2340 ? 1 : 1 - smooth((f - 2340) / 180));

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
const T = (f: number) => f / FPS;
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

// A: mengikuti Ibu dari belakang-samping, meluncur mendekat (kamera dekat sumbu jalan agar subjek di tengah frame vertikal)
const A1 = (f: number) => { const z = IBU_A(T(f))[2]; return dolly([2.0, 2.4, z + 8], [0, 1.5, z - 1], pushK(f, 0, 0.0012), { fov: 42 }); };
const A2 = (f: number) => { const z = IBU_A(T(f))[2]; return dolly([1.6, 2.0, z + 6], [0, 1.5, z - 1], pushK(f, 270, 0.0018), { fov: 40, roll: -0.02 }); };
// B: dari belakang Raka, mendekat; lalu geser ke samping melihat wajah-wajah pucat
const B1 = (f: number) => { const z = RAKA_B(T(f) - 18)[2]; return dolly([1.2, 2.0, z + 6.5], [0.6, 1.3, z - 5], pushK(f, 540, 0.0012), { fov: 42 }); };
const B2 = (f: number) => { const z = RAKA_B(T(f) - 18)[2]; return dolly([-0.6, 2.0, z + 5], [0.6, 1.2, z - 6], pushK(f, 810, 0.0018), { fov: 40, roll: 0.03 }); };
// C: interior — dilihat dari luar lewat pintu (dinding depan membingkai), Ibu di tengah menyalakan lilin,
// kursi-kursi + bayangan di belakang meja, foto di dinding belakang
const C1 = (f: number) => dolly([60, 2.2, -70.5], [60, 1.0, -83], pushK(f, 1080, 0.0012), { fov: 50 });
const C2 = (f: number) => dolly([60, 2.0, -72.8], [60, 1.0, -83], pushK(f, 1350, 0.002), { fov: 46, roll: -0.02 });
// D: close-up wajah Ibu, push-in pelan
const D1 = (f: number) => dolly([60.8, 1.65, -76.9], [59.6, 1.5, -79.8], pushK(f, 1620, 0.0012), { fov: 36 });
const D2 = (f: number) => dolly([60.4, 1.62, -77.5], [59.6, 1.52, -79.8], pushK(f, 1890, 0.0018), { fov: 34, roll: 0.015 });
// E: dari balik bukit melihat ke desa — bukit + Ibu/Raka di depan, desa berlampu di belakang; lalu mendekat ke Raka
const E1 = (f: number) => dolly([12, 13, -132], [-4, 6.5, -102], pushK(f, 2160, 0.001), { fov: 44 });
const E2 = (f: number) => dolly([7, 8, -124], [0.9, 5.4, -112.7], pushK(f, 2430, 0.0015), { fov: 44 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: A1 }, { f: 270, dur: 90, s: A2 }],
  2: [{ f: 540, s: B1 }, { f: 810, dur: 90, s: B2 }],
  3: [{ f: 1080, s: C1 }, { f: 1350, dur: 90, s: C2 }],
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
