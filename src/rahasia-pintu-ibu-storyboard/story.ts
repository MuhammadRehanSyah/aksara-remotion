// RahasiaPintuIbuStoryboard — 90 detik, 5 adegan x 18 detik (2700 frame @ 30 fps, 1080x1920).
// VERSI STORYBOARD: staging mengikuti TEPAT 10 halaman komik "Rahasia di Balik Pintu Ibu"
// (halaman-000.jpg s.d. halaman-009.jpg, diverifikasi langsung 27 Nov 2026).
// Satu rumah kayu tua: ruang utama (x 55..65, z -84..-76) + ceruk cermin terlarang
// di balik dinding belakang (z -88..-84) + ruang kenangan siang hari (x -65..-55)
// + beranda/halaman depan (z -76..-68).
// Potongan keras antar shot; kamera selalu bergerak (push-in / drift / pan pelan).
//
// Pemetaan halaman -> shot:
//   hal. 1 -> A1 (f 0-270)    lorong lebar, Ibu berlentera, Raka mengintip dari tangga
//   hal. 2 -> A2 (f 270-540)  Ibu + kunci bercahaya di pintu Raka, jam 23.55, hujan, Raka berkeringat
//   hal. 3 -> B1 (f 540-720)  pagi, Ibu menuang teh, Raka cemas di bangku, kamboja, tanah merah
//   hal. 4 -> B2 (f 720-900)  lorong malam, Raka mengendap ke pintu terlarang, cahaya bawah pintu
//   hal. 5 -> B3 (f 900-1080) Ibu dari belakang di depan cermin beriak, tangan Raka di vas miring
//   hal. 5 -> C1 (f 1080-1260) vas miring di tangan Raka, JATUH/PECAH di f 1230 (SFX PRANG)
//   hal. 6 -> C2 (f 1260-1440) serpihan vas, Ibu menangis di gagang pintu, Raka lari
//   hal. 6 -> C3 (f 1440-1620) close-up wajah Ibu berkaca-kaca
//   hal. 7 -> D1 (f 1620-1890) beranda sore, Raka di bangku + kunci + foto keluarga, melati
//   hal. 8 -> D2 (f 1890-2160) ruang kenangan siang, Raka di pintu, potret Ayah, surat, jam pasir
//   hal. 9 -> E1 (f 2160-2430) malam, Ibu menangis memegang tangan Raka, Raka tersenyum
//   hal.10 -> E2 (f 2430-2700) Ibu + Raka dari belakang, Ayah melambai di cermin EMAS (penutup)
export const FPS = 30;
export const TOTAL = 2700;
export const D0 = 0; // lantai y = 0
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- posisi cerita (meter, y = 0 lantai) ----------------
// Ruang utama: pintu Raka di dinding depan (gap x 59..61, z=-76),
// cermin pusaka di ceruk belakang (z=-87.6), jendela hujan di dinding depan (x 56.5..58).
export const ROOM: V3 = [60, 0, -80];
export const MIRROR: V3 = [60, 0, -87.6]; // posisi cermin besar di ceruk terlarang
// A1 hal. 1: Ibu berlentera di tengah lorong; Raka mengintip dari balik tangga kanan
export const IBU_A1: V3 = [60, 0, -81.5];
export const RAKA_A1: V3 = [61.1, 0, -80.8];
// A2 hal. 2: Ibu di pintu Raka memegang kunci bercahaya; Raka berkeringat di samping
export const IBU_A2: V3 = [59.7, 0, -77.2];
export const RAKA_A2: V3 = [60.9, 0, -77.6];
// B1 hal. 3: meja teh; Ibu menuang teh di sisi kiri meja, Raka cemas duduk di bangku kanan
export const TEA_TABLE: V3 = [57.6, 0, -80.8];
export const IBU_B1: V3 = [57.5, 0, -80.8];
export const RAKA_B1: V3 = [58.5, 0, -80.3]; // berdiri cemas di depan bangku (pose duduk tak terbaca)
// B2 hal. 4: Raka mengendap dari ujung lorong ke pintu terlarang yang tertutup
export const RAKA_B2 = (f: number): V3 => [60, 0, -78.5 - 0.023 * (f - 720)];
// B3 hal. 5: Ibu dari belakang di ambang pintu terlarang menghadap cermin beriak;
// meja vas di dekat ambang pintu; Raka menyentuh vas yang sudah miring
export const IBU_B3: V3 = [60, 0, -84.6];
export const VASE_TABLE: V3 = [58.7, 0, -83.4];
export const RAKA_B3: V3 = [59.3, 0, -82.6];
// C1 hal. 5 (lanjutan): Raka di meja vas saat vas jatuh
export const RAKA_C1: V3 = [59.3, 0, -82.6];
export const IBU_C1: V3 = [59.8, 0, -83.3]; // di ambang pintu, sisi ruangan (pintu tertutup di C)
// C2 hal. 6: Ibu menangis di gagang pintu terlarang; Raka lari ketakutan ke kanan
export const IBU_C2: V3 = [59.5, 0, -83.6];
export const RAKA_C2 = (f: number): V3 => [60.3 + 0.0133 * (f - 1260), 0, -81.5 + 0.002 * (f - 1260)];
// C3 hal. 6 close-up: wajah Ibu berkaca-kaca
export const IBU_C3: V3 = [60, 0, -79.8];
// D1 hal. 7: beranda sore — bangku di dinding depan, pot melati di kiri bangku
export const BENCH_D1: V3 = [61.2, 0, -74.6];
export const RAKA_D1: V3 = [61.2, 0, -74.3];
export const JASMINE_POT_D1: V3 = [59.6, 0, -74.2];
// D2 hal. 8: ruang kenangan siang hari (x -65..-55)
export const MEM_ROOM: V3 = [-60, 0, -80];
export const JASMINE_POT: V3 = [-59.5, 0, -77.4];
export const KEY_SPOT: V3 = [-59.3, 0, -77.0];
export const RAKA_D2: V3 = [-60, 0, -77.6];
// E1 hal. 9: Ibu + Raka di depan cermin (polos), tangan bergandengan
export const IBU_E1: V3 = [59.55, 0, -82.2];
export const RAKA_E1: V3 = [60.45, 0, -82.2];
// E2 hal. 10: Ibu + Raka dari belakang menghadap cermin emas
export const IBU_E2: V3 = [59.7, 0, -83.0];
export const RAKA_E2: V3 = [60.5, 0, -82.8];

// vas jatuh di C1: mulai miring f 1200, jatuh f 1200-1230, pecah (serpihan muncul) f >= 1230
export const VASE_TIP_F = 1200;
export const VASE_BREAK_F = 1230;
// cermin terbuka (emas): f 2430-2700 (E2, hal. 10); beriak biru di B3/C (f 900-1620)
export const mirrorOpen = (f: number) => (f >= 2430 ? smooth((f - 2430) / 90) : 0);
export const mirrorRipple = (f: number) => (f >= 900 && f < 1620 ? 0.6 : f >= 2430 ? 1 : 0);

export type Light = "night" | "day" | "dawn";
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 540, light: "night", tau: (t) => t },          // A hal. 1-2
  { id: 2, a: 540, b: 1080, light: "night", tau: (t) => t - 18 },  // B hal. 3-5
  { id: 3, a: 1080, b: 1620, light: "night", tau: (t) => t - 36 }, // C hal. 5-6
  { id: 4, a: 1620, b: 2160, light: "day", tau: (t) => t - 54 },   // D hal. 7-8
  { id: 5, a: 2160, b: 2700, light: "night", tau: (t) => t - 72 }, // E hal. 9-10
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** 0 = malam .. 1 = siang penuh (B1 pagi f 540-720 dan D2 ruang kenangan f 1890-2160) */
export const dayU = (f: number) => {
  if (f >= 540 && f < 720) return smooth((f - 540) / 45) * (1 - smooth((f - 675) / 45));
  if (f >= 1890 && f < 2160) return smooth((f - 1890) / 45) * (1 - smooth((f - 2115) / 45));
  return 0;
};
/** 0 = malam .. 1 = senja hangat penuh (D1 beranda sore f 1620-1890, puncak 0.6).
 *  Dipakai sebagai grade "dawn" (hangat) di tsx dan cahaya senja di world.
 *  TIDAK ada lagi adegan pagi bermatahari setelah E2 — storyboard berakhir di hal. 10. */
export const dawnU = (f: number) => {
  if (f >= 1620 && f < 1890) return 0.8 * smooth((f - 1620) / 45) * (1 - smooth((f - 1845) / 45));
  return 0;
};

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

// A1 hal. 1: dari ujung lorong menyusuri ke arah Ibu berlentera; tangga + Raka kanan bawah
const A1 = (f: number) => dolly([60, 2.0, -76.6], [60.4, 1.3, -81.5], pushK(f, 0, 0.001), { fov: 50 });
// A2 hal. 2: dari dalam ruangan ke arah pintu Raka — Ibu + kunci, jam 23.55 + jendela hujan di belakang
const A2 = (f: number) => dolly([60, 1.9, -83.6], [60, 1.35, -77.2], pushK(f, 270, 0.0009), { fov: 48 });
// B1 hal. 3: dari depan meja teh — Ibu menuang teh (kiri), Raka cemas di bangku (kanan)
const B1 = (f: number) => dolly([58.0, 2.1, -76.9], [58.0, 1.15, -80.8], pushK(f, 540, 0.0004), { fov: 58 });
// B2 hal. 4: dari belakang Raka menyusuri lorong ke pintu terlarang yang tertutup
const B2 = (f: number) => dolly([60, 1.7, -76.9], [60, 1.15, -82.2], pushK(f, 720, 0.0008), { fov: 48 });
// B3 hal. 5: ke arah cermin beriak — Ibu dari belakang di ambang pintu, Raka + vas miring di kiri
const B3 = (f: number) => dolly([60.5, 2.0, -79.0], [59.4, 1.25, -84.5], pushK(f, 900, 0.0008), { fov: 50 });
// C1 hal. 5: mendekat ke meja vas — tangan Raka di vas yang mulai jatuh
const C1 = (f: number) => dolly([61.0, 2.2, -78.2], [59.7, 1.0, -83.6], pushK(f, 1080, 0.0008), { fov: 50 });
// C2 hal. 6: lebar — Ibu menangis di gagang pintu, serpihan vas di lantai, Raka lari ke kanan
const C2 = (f: number) => dolly([62.8, 2.2, -77.6], [59.8, 1.05, -83.2], pushK(f, 1260, 0.0008), { fov: 50 });
// C3 hal. 6 close-up: wajah Ibu berkaca-kaca
const C3 = (f: number) => dolly([60.6, 1.62, -77.4], [60, 1.5, -79.8], pushK(f, 1440, 0.0018), { fov: 34, roll: 0.015 });
// D1 hal. 7: dari halaman ke bangku beranda — Raka + kunci + foto, melati kiri, senja kanan
const D1 = (f: number) => dolly([60.6, 1.9, -69.6], [60.6, 1.05, -74.6], pushK(f, 1620, 0.0008), { fov: 54 });
// D2 hal. 8: pan menyapu ruang kenangan — dari pintu ke potret Ayah + meja surat + jam pasir
const D2 = (f: number) => dolly([-60, 2.0, -71.8], [-60, 1.2, -81.5], pushK(f, 1890, 0.0008), { fov: 50, roll: -0.02 });
// E1 hal. 9: ke tangan Ibu + Raka yang bergandengan
const E1 = (f: number) => dolly([60, 1.9, -77.8], [60, 1.1, -82.2], pushK(f, 2160, 0.0008), { fov: 50 });
// E2 hal. 10: dari belakang Ibu + Raka ke cermin emas; TAHAN sebagai frame penutup
const E2 = (f: number) => dolly([60.6, 2.1, -78.0], [59.7, 1.4, -86.0], pushK(f, 2430, 0.0007), { fov: 52 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: A1 }, { f: 270, cut: true, s: A2 }],
  2: [{ f: 540, s: B1 }, { f: 720, cut: true, s: B2 }, { f: 900, cut: true, s: B3 }],
  3: [{ f: 1080, s: C1 }, { f: 1260, cut: true, s: C2 }, { f: 1440, cut: true, s: C3 }],
  4: [{ f: 1620, s: D1 }, { f: 1890, cut: true, s: D2 }],
  5: [{ f: 2160, s: E1 }, { f: 2430, cut: true, s: E2 }],
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
