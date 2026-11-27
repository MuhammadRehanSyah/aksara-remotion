// RahasiaPintuIbu cast: karakter sebagai kartu 2D bergaris tinta (template IbuMisterius).
// Ibu (berkerudung) + Raka (anak) dipakai ulang; Ayah BARU sebagai sosok bercahaya
// di dalam cermin (tanpa wajah detail — hanya senyum tipis, tangan melambai).
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, IBU, RAKA, ayahFigure, fxGlow, fxBlob, fxContact, fxShadow,
  fxRain, fxKey, fxPetal, fxSoil, fxTear,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import {
  FPS, D0, SHOTS, V3, IBU_A1, RAKA_A1, IBU_A2, RAKA_A2, TEA_TABLE, IBU_B1, RAKA_B1,
  RAKA_B2, IBU_B3, RAKA_B3, RAKA_C1, IBU_C1, IBU_C2, RAKA_C2, IBU_C3,
  RAKA_D1, RAKA_D2, IBU_E1, RAKA_E1, IBU_E2, RAKA_E2,
  MIRROR, VASE_TIP_F, VASE_BREAK_F,
  smooth, clamp01,
} from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool (sama seperti template) ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes (sama seperti template) ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216;
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    } else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; roll?: number; size?: [number, number, number]; fade?: number;
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };
export type Stage = { places: Place[]; fx: FxPlace[] };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));
const tmp = new THREE.Vector3();

const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

type Who = { i: number; o: Outfit; okey: string };
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1, fade?: number): Place => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, seed = 3;
  const f2: FrontOpts = { ...fo, seed }, s2: SideOpts = { ...so, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, fade,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** bayangan kontak tanah */
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const cc = "#3a3a55";
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y: y + 0.022, z, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot: 0 });
};

/** denyut cahaya: 1 + 0.25 sin cepat + 0.12 sin lambat (untuk ukuran glow + key redraw) */
export const flicker = (t: number) => 1 + 0.22 * Math.sin(t * 13.7) + 0.12 * Math.sin(t * 29.3 + 1.7);
const glowFx = (out: Stage, x: number, y: number, z: number, t: number, size: number, tag: string, col?: string) => {
  const fl = flicker(t), s = size * fl;
  out.fx.push({ key: `glow|${tag}|${q(fl, 20)}`, cw: 256, ch: 256, draw: (p) => fxGlow(p, col), x, y, z, w: s, h: s, soft: true });
};

// ---------------- staging per adegan ----------------
export const stage = (id: number, t: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  if (id === 1) {
    if (f < 270) {
      // A1 hal. 1: lorong lebar — Ibu berlentera di tengah, Raka mengintip dari balik tangga kanan.
      const [ix, iy, iz] = IBU_A1;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "stern", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      // lentera di tangan Ibu + cahaya hangatnya
      glowFx(out, ix - 0.42, iy + 1.0, iz + 0.3, t, 1.8, "lanternA1");
      const [rx, ry, rz] = RAKA_A1;
      const rview = viewOf(cam, rx, rz, -1, 0);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, rview,
        { mode: "stand", expr: "nervous", blink: 0 },
        { mode: "stand", expr: "nervous" }, 0.72));
      blob(out, rx, ry, rz, 0.72);
    } else {
      // A2 hal. 2: Ibu di pintu Raka memegang kunci tua BERCAHAYA; Raka berkeringat di samping.
      const [ix, iy, iz] = IBU_A2;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "stern", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      const [rx, ry, rz] = RAKA_A2;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "nervous", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
      // kunci tua bercahaya di tangan Ibu (sisi kiri, ke arah pintu) + kilau kuat
      out.fx.push({ key: "key|old", cw: 200, ch: 120, draw: (p) => fxKey(p, false),
        x: ix - 0.42, y: iy + 0.95, z: iz + 0.25, w: 0.34, h: 0.2 });
      glowFx(out, ix - 0.42, iy + 0.95, iz + 0.3, t, 1.4, "keyA2");
      // hujan di jendela (dinding depan x 56.5..58): kartu di depan kaca, redraw 6x/dtk
      const rs = Math.floor(t * 6);
      out.fx.push({ key: `rain|${rs % 4}`, cw: 256, ch: 256, draw: (p) => fxRain(p, rs),
        x: 57.25, y: 1.9, z: -76.0, w: 1.5, h: 1.4, soft: true });
    }
  } else if (id === 2) {
    if (f < 720) {
      // B1 hal. 3: pagi — Ibu menuang teh di meja, Raka cemas duduk di bangku.
      const [ix, iy, iz] = IBU_B1;
      const view = viewOf(cam, ix, iz, 1, 0);
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, view,
        { mode: "stand", expr: "neutral", blink: 0 },
        { mode: "stand", expr: "neutral" }));
      blob(out, ix, iy, iz, 1, 0.9);
      // tanah merah di ujung batik Ibu + sehelai kamboja di lantai
      out.fx.push({ key: "soil|batik", cw: 200, ch: 120, draw: (p) => fxSoil(p),
        x: ix + 0.2, y: iy + 0.045, z: iz + 0.5, w: 0.8, h: 0.48, flat: true, rot: 0.4 });
      out.fx.push({ key: "petal|kamboja", cw: 160, ch: 160, draw: (p) => fxPetal(p),
        x: ix + 0.7, y: iy + 0.045, z: iz + 0.6, w: 0.45, h: 0.45, flat: true, rot: 0.7 });
      const [rx, ry, rz] = RAKA_B1;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "nervous", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
    } else if (f < 900) {
      // B2 hal. 4: lorong malam — Raka mengendap bertelanjang kaki ke pintu terlarang
      // yang tertutup; cahaya + kilau merembes dari bawah pintu.
      const [rx, ry, rz] = RAKA_B2(f);
      const view = viewOf(cam, rx, rz, 0, -1);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, view,
        { mode: "stand", expr: "nervous", blink: 0 },
        { mode: "march", phase: (t * 0.9) % 1, expr: "nervous", stride: 0.55 }, 0.72));
      blob(out, rx, ry, rz, 0.72);
      // cahaya keemasan merembes dari bawah pintu + kilau debu cahaya
      glowFx(out, 60, 0.25, -83.7, t, 1.0, "doorGlowB2");
      glowFx(out, 60, 0.6, -83.5, t, 0.6, "doorGlowB2b");
    } else {
      // B3 hal. 5: Ibu DARI BELAKANG di depan cermin beriak biru; tangan Raka di vas miring.
      const [ix, iy, iz] = IBU_B3;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: true, mirror: false },
        { mode: "stand", expr: "neutral", blink: 0 }, { mode: "stand", expr: "neutral" }));
      blob(out, ix, iy, iz, 1, 0.9);
      glowFx(out, MIRROR[0], 1.9, MIRROR[2] + 0.3, t, 1.4, "mirrorB", "#9fd4ff");
      const [rx, ry, rz] = RAKA_B3;
      const rview = viewOf(cam, rx, rz, -1, 0);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, rview,
        { mode: "stand", expr: "shock", blink: 0 },
        { mode: "stand", expr: "shock" }, 0.72));
      blob(out, rx, ry, rz, 0.72);
    }
  } else if (id === 3) {
    if (f < 1260) {
      // C1 hal. 5 (lanjutan): vas miring di tangan Raka, mulai jatuh (pecah f 1230).
      const [rx, ry, rz] = RAKA_C1;
      const view = viewOf(cam, rx, rz, -1, 0);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, view,
        { mode: "stand", expr: "shock", blink: 0 },
        { mode: "stand", expr: "shock" }, 0.72));
      blob(out, rx, ry, rz, 0.72);
      // Ibu di ambang pintu di latar — menoleh kaget
      const [ix, iy, iz] = IBU_C1;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: true, mirror: false },
        { mode: "stand", expr: "shock", blink: 0 }, { mode: "stand", expr: "shock" }));
      blob(out, ix, iy, iz, 1, 0.9);
    } else if (f < 1440) {
      // C2 hal. 6: serpihan vas di lantai, Ibu menangis di gagang pintu, Raka lari ketakutan.
      const [ix, iy, iz] = IBU_C2;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "sad", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      out.fx.push({ key: "tear|ibu", cw: 200, ch: 120, draw: (p) => fxTear(p),
        x: ix, y: iy + 1.44, z: iz + 0.42, w: 0.3, h: 0.18, soft: true });
      // kunci di tangan Ibu yang memegang gagang pintu
      out.fx.push({ key: "key|old", cw: 200, ch: 120, draw: (p) => fxKey(p, false),
        x: ix - 0.42, y: iy + 1.1, z: iz + 0.3, w: 0.3, h: 0.18 });
      const [rx, ry, rz] = RAKA_C2(f);
      const rview = viewOf(cam, rx, rz, 1, 0);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, rview,
        { mode: "stand", expr: "shock", blink: 0 },
        { mode: "march", phase: (t * 2.4) % 1, expr: "shock", stride: 1.1 }, 0.72));
      blob(out, rx, ry, rz, 0.72);
    } else {
      // C3 hal. 6 close-up: wajah Ibu berkaca-kaca, tangan gemetar (jitter di posisi).
      const [ix, iy, iz] = IBU_C3;
      const jx = 0.015 * Math.sin(t * 13.1), jz = 0.01 * Math.sin(t * 17.3 + 1.2);
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix + jx, iy, iz + jz, { side: false, mirror: false },
        { mode: "stand", expr: "sad", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      out.fx.push({ key: "tear|ibu", cw: 200, ch: 120, draw: (p) => fxTear(p),
        x: ix, y: iy + 1.44, z: iz + 0.42, w: 0.3, h: 0.18, soft: true });
    }
  } else if (id === 4) {
    if (f < 1890) {
      // D1 hal. 7: beranda sore — Raka duduk di bangku memegang kunci kuningan + foto keluarga.
      const [rx, ry, rz] = RAKA_D1;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "sit", expr: "sad", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
      // kunci kuningan di tangan Raka
      out.fx.push({ key: "key|brass", cw: 200, ch: 120, draw: (p) => fxKey(p, true),
        x: rx - 0.15, y: ry + 0.45, z: rz + 0.35, w: 0.34, h: 0.2 });
    } else {
      // D2 hal. 8: ruang kenangan siang — Raka di pintu terbuka; potret Ayah + surat + jam pasir.
      const [rx, ry, rz] = RAKA_D2;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "neutral", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
    }
  } else {
    if (f < 2430) {
      // E1 hal. 9: malam — Ibu menangis memegang tangan Raka, Raka tersenyum menenangkan.
      // Cermin di belakang mereka polos (tidak beriak, tidak emas).
      const [ix, iy, iz] = IBU_E1;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "sad", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      out.fx.push({ key: "tear|ibu", cw: 200, ch: 120, draw: (p) => fxTear(p),
        x: ix, y: iy + 1.44, z: iz + 0.42, w: 0.3, h: 0.18, soft: true });
      const [rx, ry, rz] = RAKA_E1;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "smile", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);

    } else {
      // E2 hal. 10 (PENUTUP): Ibu + Raka DARI BELAKANG bergandengan tangan menatap
      // Ayah yang tersenyum melambai di cermin EMAS.
      const wave = 0.5 + 0.5 * Math.sin(t * 2.2);
      out.fx.push({ key: `ayah|${q(wave, 8)}`, cw: 300, ch: 500, draw: (p) => ayahFigure(p, wave),
        x: MIRROR[0], y: 1.15, z: MIRROR[2] + 0.7, w: 1.5, h: 2.5, soft: false });
      glowFx(out, MIRROR[0], 1.9, MIRROR[2] + 0.4, t, 3.0, "mirrorGold");
      glowFx(out, MIRROR[0], 1.9, MIRROR[2] + 0.4, t, 1.6, "mirrorGold2");
      const [ix, iy, iz] = IBU_E2;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: true, mirror: false },
        { mode: "stand", expr: "smile_closed", blink: 0 }, { mode: "stand", expr: "smile_closed" }));
      blob(out, ix, iy, iz, 1, 0.9);
      const [rx, ry, rz] = RAKA_E2;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: true, mirror: true },
        { mode: "stand", expr: "smile", blink: 0 },
        { mode: "stand", expr: "smile" }, 0.72));
      blob(out, rx, ry, rz, 0.72);
    }
  }
  return out;
};
export { FPS };
