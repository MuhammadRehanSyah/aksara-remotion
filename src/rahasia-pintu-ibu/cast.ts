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
  FPS, D0, SHOTS, V3, IBU_A, RAKA_A, IBU_B1, RAKA_B1, IBU_B2, RAKA_B2, VASE_TABLE, RAKA_C1, IBU_C1,
  IBU_C2, JASMINE_POT, KEY_SPOT, RAKA_D1, RAKA_D2, IBU_D2, IBU_E1, RAKA_E1, IBU_E2, RAKA_E2,
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
const glowFx = (out: Stage, x: number, y: number, z: number, t: number, size: number, tag: string) => {
  const fl = flicker(t), s = size * fl;
  out.fx.push({ key: `glow|${tag}|${q(fl, 20)}`, cw: 256, ch: 256, draw: (p) => fxGlow(p), x, y, z, w: s, h: s, soft: true });
};

// ---------------- staging per adegan ----------------
export const stage = (id: number, t: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const tau = SHOTS[id - 1].tau(t);
  if (id === 1) {
    // A: malam hujan — Ibu di pintu Raka membawa kunci tua; Raka di sampingnya.
    // Hujan di jendela kiri (kartu hujan beranimasi 6 fps) + kunci di tangan Ibu.
    const [ix, iy, iz] = IBU_A;
    out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
      { mode: "stand", expr: "stern", blink: 0 }, {}));
    blob(out, ix, iy, iz, 1, 0.9);
    const [rx, ry, rz] = RAKA_A;
    out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
      { mode: "stand", expr: "nervous", blink: 0 }, {}, 0.72));
    blob(out, rx, ry, rz, 0.72);
    // kunci tua di tangan Ibu (kanan bawah, dekat pintu) + kilau redup
    out.fx.push({ key: "key|old", cw: 200, ch: 120, draw: (p) => fxKey(p, false),
      x: ix + 0.42, y: iy + 0.95, z: iz + 0.25, w: 0.34, h: 0.2 });
    glowFx(out, ix + 0.42, iy + 0.95, iz + 0.3, t, 0.9, "keyA");
    // hujan di jendela (dinding kiri x=55.4): kartu di depan kaca, redraw 6x/dtk
    const rs = Math.floor(t * 6);
    out.fx.push({ key: `rain|${rs % 4}`, cw: 256, ch: 256, draw: (p) => fxRain(p, rs),
      x: 57.25, y: 1.9, z: -76.0, w: 1.5, h: 1.4, soft: true });
  } else if (id === 2) {
    if (f < 810) {
      // B1 pagi: Ibu berjalan pelan; tanah merah di ujung batik + kamboja di lantai.
      const [ix, iy, iz] = IBU_B1(tau);
      const view = viewOf(cam, ix, iz, 1, 0);
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, view,
        { mode: "stand", expr: "neutral", blink: 0 },
        { mode: "march", phase: (t * 0.9) % 1, expr: "neutral", stride: 0.7 }));
      blob(out, ix, iy, iz, 1, 0.9);
      // tanah merah menempel di ujung batik (di lantai, tepat di belakang langkah Ibu)
      out.fx.push({ key: "soil|batik", cw: 200, ch: 120, draw: (p) => fxSoil(p),
        x: ix + 0.4, y: iy + 0.045, z: iz - 0.6, w: 0.8, h: 0.48, flat: true, rot: 0.4 });
      // sehelai bunga kamboja di lantai, di jalur langkah Ibu
      out.fx.push({ key: "petal|kamboja", cw: 160, ch: 160, draw: (p) => fxPetal(p),
        x: ix + 0.7, y: iy + 0.045, z: iz - 0.3, w: 0.45, h: 0.45, flat: true, rot: 0.7 });
    } else {
      // B2 malam: Ibu membelakangi kamera di ambang pintu terlarang, menghadap cermin
      // yang permukaannya beriak; Raka mengintip dari sisi ruangan.
      const [ix, iy, iz] = IBU_B2;
      const view = viewOf(cam, ix, iz, 0, -1);
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, view,
        { mode: "stand", expr: "neutral", blink: 0 }, { mode: "stand", expr: "neutral" }));
      blob(out, ix, iy, iz, 1, 0.9);
      glowFx(out, MIRROR[0], 1.9, MIRROR[2] + 0.3, t, 1.6, "mirrorB");
      const [rx, ry, rz] = RAKA_B2;
      const rview = viewOf(cam, rx, rz, 0, -1);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, rview,
        { mode: "stand", expr: "nervous", blink: 0 },
        { mode: "stand", expr: "nervous" }, 0.72));
      blob(out, rx, ry, rz, 0.72);
    }
  } else if (id === 3) {
    if (f < 1350) {
      // C1: Raka berjalan mendekati meja vas; Ibu menoleh kaget saat vas mulai jatuh.
      const [rx, ry, rz] = RAKA_C1(tau);
      const view = viewOf(cam, rx, rz, 0, 1);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, view,
        { mode: "stand", expr: "nervous", blink: 0 },
        { mode: "march", phase: (t * 1.4) % 1, expr: "nervous", stride: 0.8 }, 0.72));
      blob(out, rx, ry, rz, 0.72);
    } else {
      // C2: close-up Ibu — mata berkaca-kaca, tangan gemetar (posisi bergetar halus).
      const [ix, iy, iz] = IBU_C2;
      const jx = 0.015 * Math.sin(t * 13.1), jz = 0.01 * Math.sin(t * 17.3 + 1.2);
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix + jx, iy, iz + jz, { side: false, mirror: false },
        { mode: "stand", expr: "pained", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      // kilau air mata di bawah mata Ibu (kartu kecil menghadap kamera)
      out.fx.push({ key: "tear|ibu", cw: 200, ch: 120, draw: (p) => fxTear(p),
        x: ix, y: iy + 1.44, z: iz + 0.42, w: 0.3, h: 0.18, soft: true });
    }
  } else if (id === 4) {
    if (f < 1890) {
      // D1: sore — Raka di pintu ruang kenangan; kunci kuningan di dekat pot melati.
      const [rx, ry, rz] = RAKA_D1;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "relief", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
      out.fx.push({ key: "key|brass", cw: 200, ch: 120, draw: (p) => fxKey(p, true),
        x: KEY_SPOT[0], y: KEY_SPOT[1] + 0.045, z: KEY_SPOT[2], w: 0.55, h: 0.33, flat: true, rot: 0.5 });
    } else {
      // D2: Raka + Ibu di depan dinding sketsa Ayah; Ibu tersenyum lega.
      const [rx, ry, rz] = RAKA_D2;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "smile", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
      const [ix, iy, iz] = IBU_D2;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "smile_closed", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
    }
  } else {
    if (f < 2430) {
      // E1 tengah malam: cermin terbuka — Ayah bercahaya melambai di dalam cermin.
      const wave = 0.5 + 0.5 * Math.sin(t * 2.2);
      out.fx.push({ key: `ayah|${q(wave, 8)}`, cw: 300, ch: 500, draw: (p) => ayahFigure(p, wave),
        x: MIRROR[0], y: 1.15, z: MIRROR[2] + 0.7, w: 1.5, h: 2.5, soft: false });
      glowFx(out, MIRROR[0], 1.9, MIRROR[2] + 0.4, t, 3.0, "mirrorGold");
      glowFx(out, MIRROR[0], 1.9, MIRROR[2] + 0.4, t, 1.6, "mirrorGold2");
      const [ix, iy, iz] = IBU_E1;
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "smile_closed", blink: 0 }, {}));
      blob(out, ix, iy, iz, 1, 0.9);
      const [rx, ry, rz] = RAKA_E1;
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
        { mode: "stand", expr: "smile", blink: 0 }, {}, 0.72));
      blob(out, rx, ry, rz, 0.72);
    } else {
      // E2 pagi: pintu terbuka, matahari memenuhi lorong; Ibu + Raka berjalan ke pintu.
      const [ix, iy, iz] = IBU_E2(tau);
      const iview = viewOf(cam, ix, iz, 0, -1);
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, iview,
        { mode: "stand", expr: "smile_closed", blink: 0 },
        { mode: "march", phase: (t * 1.1) % 1, expr: "smile_closed", stride: 0.7 }));
      blob(out, ix, iy, iz, 1, 0.9);
      const [rx, ry, rz] = RAKA_E2(tau);
      const rview = viewOf(cam, rx, rz, 0, -1);
      out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, rview,
        { mode: "stand", expr: "smile", blink: 0 },
        { mode: "march", phase: (t * 1.1) % 1, expr: "smile", stride: 0.7 }, 0.72));
      blob(out, rx, ry, rz, 0.72);
      glowFx(out, 60, 1.7, -76.8, t, 2.0, "sunDoor");
    }
  }
  return out;
};
export { FPS };
