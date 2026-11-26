// IbuMisterius cast: karakter sebagai kartu 2D bergaris tinta (template trial3d-part2).
// Ibu (berkerudung, baju panjang) melayang tanpa bayangan kontak; Raka (anak) mengikuti;
// wajah pucat di pohon + bayangan bermata gelap di kursi sebagai kartu efek tak berpendar.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, IBU, RAKA, paleFace, shadowFigure, fxGlow, fxBlob, fxContact, fxShadow,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import {
  FPS, D0, SHOTS, V3, IBU_A, RAKA_B, IBU_B, IBU_C, IBU_D, CHAIRS, PALE_FACES, IBU_E, RAKA_E,
  smooth, clamp01, ibuFade,
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

/** bayangan kontak tanah (dipakai Raka + Ibu saat berdiri di tanah; TIDAK dipakai saat Ibu melayang) */
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const cc = "#3a3a55";
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y: y + 0.022, z, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot: 0 });
};

/** denyut lentera/lilin: 1 + 0.25 sin cepat + 0.12 sin lambat (untuk ukuran glow + key redraw) */
export const flicker = (t: number) => 1 + 0.22 * Math.sin(t * 13.7) + 0.12 * Math.sin(t * 29.3 + 1.7);
const glowFx = (out: Stage, x: number, y: number, z: number, t: number, size: number, tag: string) => {
  const fl = flicker(t), s = size * fl;
  out.fx.push({ key: `glow|${tag}|${q(fl, 20)}`, cw: 256, ch: 256, draw: (p) => fxGlow(p), x, y, z, w: s, h: s, soft: true });
};
const mistFx = (out: Stage, x: number, y: number, z: number, w: number, h: number, t: number, seed: number) => {
  const drift = Math.sin(t * 0.11 + seed) * 1.2;
  out.fx.push({
    key: `mist|${seed}`, cw: 256, ch: 128,
    draw: (p) => {
      const g = p.g, gr = g.createRadialGradient(128, 64, 4, 128, 64, 128);
      gr.addColorStop(0, "rgba(175,195,230,0.20)"); gr.addColorStop(1, "rgba(175,195,230,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    },
    x: x + drift, y, z, w, h, soft: true,
  });
};

// ---------------- staging per adegan ----------------
export const stage = (id: number, t: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const tau = SHOTS[id - 1].tau(t);
  if (id === 1) {
    // A: Ibu melayang meluncur membawa lentera; kabut tebal di desa
    const [ix, iy, iz] = IBU_A(tau);
    const view = viewOf(cam, ix, iz, 0, -1);
    out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, view,
      { mode: "stand", expr: "neutral", blink: 0 }, { mode: "stand", expr: "neutral" }));
    // TANPA blob: kakinya tidak menyentuh tanah
    glowFx(out, ix + 0.55, iy + 0.95, iz - 0.3, t, 2.6, "lanternA");
    mistFx(out, -3, 0.8, iz - 4, 9, 2.2, t, 1);
    mistFx(out, 4, 1.0, iz + 3, 10, 2.4, t, 2);
    mistFx(out, 0, 0.6, iz - 10, 12, 2.6, t, 3);
  } else if (id === 2) {
    // B: Raka mengikuti; Ibu jauh di depan dengan lentera berkelip; wajah pucat di pohon
    const [rx, ry, rz] = RAKA_B(tau);
    const view = viewOf(cam, rx, rz, 0, -1);
    out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, view,
      { mode: "march", phase: (t * 2) % 1, expr: "nervous", blink: 0 },
      { mode: "march", phase: (t * 2) % 1, expr: "nervous", stomp: 0.8, stride: view.fs }, 0.72));
    blob(out, rx, ry, rz, 0.72);
    const [ix, iy, iz] = IBU_B(tau);
    const iview = viewOf(cam, ix, iz, 0, -1);
    out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, iview,
      { mode: "stand", expr: "neutral", blink: 0 }, { mode: "stand", expr: "neutral" }));
    glowFx(out, ix + 0.55, iy + 0.95, iz - 0.3, t, 2.2, "lanternB");
    for (let i = 0; i < PALE_FACES.length; i++) {
      const pf = PALE_FACES[i];
      // wajah muncul samar lalu menatap: skala denyut pelan
      const pulse = 1 + 0.03 * Math.sin(t * 1.4 + i * 2.1);
      out.fx.push({ key: `pale|${i}`, cw: 300, ch: 360, draw: (p) => paleFace(p, i + 1),
        x: pf.p[0], y: pf.p[1], z: pf.p[2], w: 0.85 * pf.s * pulse, h: 1.02 * pf.s * pulse, soft: true });
    }
    mistFx(out, -2, 1.0, rz - 8, 10, 2.4, t, 4);
    mistFx(out, 3, 0.8, rz - 16, 11, 2.6, t, 5);
  } else if (id === 3) {
    // C: Ibu menyalakan lilin untuk kursi-kursi; bayangan duduk & menoleh ke kamera
    const [ix, iy, iz] = IBU_C;
    out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
      { mode: "stand", expr: "neutral", blink: 0 }, {}));
    blob(out, ix, iy, iz, 1, 0.9);
    glowFx(out, ix + 0.55, iy + 0.95, iz + 0.6, t, 1.8, "candleC");
    for (let i = 0; i < CHAIRS.length; i++) {
      const [cx, cy, cz] = CHAIRS[i];
      // bayangan menoleh mengikuti kamera: turn dari posisi kamera relatif ke kursi
      const turn = clamp01((cam.pos.x - cx) / 2.5 + 0.5) * 2 - 1;
      out.fx.push({ key: `shadow|${i}|${q(turn, 10)}`, cw: 300, ch: 500, draw: (p) => shadowFigure(p, turn),
        x: cx, y: cy + 1.05, z: cz + 0.15, w: 0.9, h: 1.6 });
    }
    // lilin-lilin di atas meja kecil di depan kursi
    glowFx(out, 59.2, 0.95, -80.8, t, 1.4, "candleC2");
    glowFx(out, 60.8, 0.95, -80.8, t, 1.4, "candleC3");
  } else if (id === 4) {
    // D: close-up Ibu menoleh; ia berbicara (narasi di sini)
    const [ix, iy, iz] = IBU_D;
    const expr: Expr = tau > 12 ? "smile_closed" : "smile";
    out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
      { mode: "stand", expr, blink: 0 }, {}));
    // cahaya lilin berdenyut di wajahnya berasal dari point light di world.ts (tanpa kartu glow di depan wajah)
  } else {
    // E: fajar — Ibu tersenyum lalu memudar bersama kabut; Raka sendiri menyalakan lentera
    const [ix, iy, iz] = IBU_E;
    const fade = ibuFade(f);
    if (fade > 0.02) {
      out.places.push(person(cam, { i: 1, o: IBU, okey: "ibu" }, ix, iy, iz, { side: false, mirror: false },
        { mode: "stand", expr: "smile_closed", blink: 0 }, {}, 1, fade));
    }
    const [rx, ry, rz] = RAKA_E;
    out.places.push(person(cam, { i: 2, o: RAKA, okey: "raka" }, rx, ry, rz, { side: false, mirror: false },
      { mode: "stand", expr: "smile", blink: 0 }, {}, 0.72));
    blob(out, rx, ry, rz, 0.72);
    glowFx(out, rx + 1.1, ry + 0.9, rz + 0.5, t, 1.4, "lanternE");
    mistFx(out, -4, 6.2, -110, 14, 3, t, 6);
    mistFx(out, 5, 6.0, -118, 12, 3, t, 7);
  }
  return out;
};
export { FPS };
