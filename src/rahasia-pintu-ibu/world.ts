// RahasiaPintuIbu world: interior rumah kayu tua + ceruk cermin + ruang kenangan.
// Satu scene three.js; update(id, f, camera, scene) mem-pose semuanya (fungsi murni dari id + f).
// Memakai primitif build.ts (Batch/boxGeo/quad/prop/kitClone) + tekstur paint.ts,
// pola yang sama dengan IbuMisterius — tanpa desa/hutan/bukit.
// Cermin pusaka: ShaderMaterial beriak seperti air (cincin + shimmer bergerak),
// biru-perak saat tertutup, emas saat terbuka (E1).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, boxGeo, V, lam, prop, kitClone, Kit } from "./build";
import { ctex, planksHD, stoneHD, cloudHD, grassHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage, flicker } from "./cast";
import {
  FPS, D0, SHOTS, camAt, dayU, dawnU, mirrorOpen, mirrorRipple, VASE_TIP_F, VASE_BREAK_F,
  VASE_TABLE, JASMINE_POT, KEY_SPOT, MIRROR, V3, smooth,
} from "./story";

const KENNEY = ["plant_bushLarge", "plant_bushDetailed", "plant_bush", "lantern", "grass", "grass_large"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

const discTex = () => ctex("moonDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("moonHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});
function quadUp(x0: number, x1: number, z0: number, z1: number, u: number, v: number, dy = 0) {
  const y = D0 + dy, g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}
const lerp3 = (a: number[], b: number[], u: number) => a.map((v, i) => v + (b[i] - v) * u);
const lerpHex = (a: string, b: string, u: number) => {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  return "#" + [ca.r + (cb.r - ca.r) * u, ca.g + (cb.g - ca.g) * u, ca.b + (cb.b - ca.b) * u]
    .map((v) => Math.round(255 * Math.max(0, Math.min(1, v))).toString(16).padStart(2, "0")).join("");
};

/** shader cermin beriak: cincin meluas + shimmer + kilau vertikal; emas saat terbuka */
const mirrorVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const mirrorFrag = `
uniform float uTime; uniform float uOpen; uniform float uRipple; varying vec2 vUv;
void main(){
  vec2 c = vUv - vec2(0.5, 0.55);
  float r = length(c * vec2(0.8, 1.25));
  float rings = sin(r * 34.0 - uTime * 2.6) * 0.5 + 0.5;
  float rings2 = sin(r * 18.0 - uTime * 1.4 + 1.7) * 0.5 + 0.5;
  float shim = sin(vUv.x * 42.0 + uTime * 1.9) * sin(vUv.y * 36.0 - uTime * 1.35);
  float streak = pow(max(0.0, sin(vUv.x * 9.0 + uTime * 0.45)), 8.0);
  vec3 deep = vec3(0.10, 0.14, 0.24);
  vec3 silver = vec3(0.55, 0.62, 0.75);
  vec3 gold = vec3(1.0, 0.78, 0.38);
  vec3 goldDeep = vec3(0.45, 0.28, 0.08);
  float band = 0.55 + 0.30 * rings * uRipple + 0.12 * rings2 * uRipple + 0.07 * shim * uRipple;
  vec3 col = mix(deep, silver, band);
  col += streak * 0.25 * (0.4 + 0.6 * uRipple);
  vec3 gcol = mix(goldDeep, gold, band);
  col = mix(col, gcol, uOpen);
  col += uOpen * 0.25 * vec3(1.0, 0.85, 0.5) * (0.5 + 0.5 * sin(uTime * 1.1));
  gl_FragColor = vec4(col, 1.0);
}`;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#0d1830", 10, 110);
  private moonDisc: THREE.Sprite; private moonHalo: THREE.Sprite;
  private warmLight: THREE.PointLight; private mirrorLight: THREE.PointLight; private faceLight: THREE.PointLight; private sunDoorLight: THREE.PointLight;
  private clouds: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private mirrorMat: THREE.ShaderMaterial;
  private windowGlass: THREE.MeshBasicMaterial; private windowGlassMem: THREE.MeshBasicMaterial;
  private frontDoor: THREE.Group; private backDoor: THREE.Group; private memDoor: THREE.Group;
  private vase: THREE.Group; private shards: THREE.Group;

  constructor(kit: Kit) {
    const R = this.root;
    // ---- langit + cahaya ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.moonDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(2.2, 2.4, 3.0), fog: false, depthWrite: false }));
    this.moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(0.7, 0.8, 1.0), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
    this.moonDisc.renderOrder = -0.5; this.moonHalo.renderOrder = 5;
    for (const m of [this.moonDisc, this.moonHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#2a3d66", "#1c2438", 0.85);
    this.sun = new THREE.DirectionalLight("#b9ccff", 1.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    // point lights: hangat ruangan, emas cermin, wajah close-up, matahari di pintu
    this.warmLight = new THREE.PointLight("#ffb45e", 10, 12, 1.8);
    this.mirrorLight = new THREE.PointLight("#ffcf7a", 6, 12, 1.8);
    this.faceLight = new THREE.PointLight("#ff9a3e", 4, 4, 1.8);
    this.sunDoorLight = new THREE.PointLight("#ffd9a0", 0, 14, 1.6);
    R.add(this.warmLight, this.mirrorLight, this.faceLight, this.sunDoorLight);
    // awan malam (terlihat lewat jendela)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudHD(i % 4, LOOK.night.cloud), color: new THREE.Color(0.55, 0.6, 0.8), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 130 + (i % 4) * 36, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- material interior ----
    const b = new Batch();
    const floorM = lam("floorPlanks", () => ({ map: planksHD(), color: "#9a7a52" }));
    const wallM = lam("wallWood", () => ({ map: planksHD(), color: "#7a5c38" }));
    const darkWoodM = lam("darkWood", () => ({ color: "#3a2a1c" }));
    const woodM = lam("wood", () => ({ color: "#5a3d28" }));
    const goldM = lam("goldFrame", () => ({ color: "#8a6a2a" }));
    const paperM = lam("paper", () => ({ color: "#e8dcc0" }));

    // ================= RUANG UTAMA (x 55..65, z -84..-76), tinggi 3.2 =================
    b.add(quadUp(55, 65, -84, -76, 3, 2, 0.03), floorM);
    const wall = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), 2), wallM);
    // dinding belakang (z=-84) dengan gap pintu terlarang x 59..61
    wall(55, 59, 0, 3.2, -84, -83.6); wall(61, 65, 0, 3.2, -84, -83.6); wall(59, 61, 2.6, 3.2, -84, -83.6);
    // dinding kiri (x=55) utuh
    wall(55, 55.4, 0, 3.2, -84, -76);
    // dinding kanan (x=65) utuh
    wall(64.6, 65, 0, 3.2, -84, -76);
    // dinding depan (z=-76): gap pintu Raka x 59..61 + jendela hujan x 56.5..58, y 1.2..2.6
    wall(55, 56.5, 0, 3.2, -76, -75.6); wall(58, 59, 0, 3.2, -76, -75.6);
    wall(61, 65, 0, 3.2, -76, -75.6); wall(59, 61, 2.6, 3.2, -76, -75.6);
    wall(56.5, 58, 0, 1.2, -76, -75.6); wall(56.5, 58, 2.6, 3.2, -76, -75.6);
    b.add(boxGeo(V(55, 3.2, -84), V(65, 3.35, -76), 2, true), wallM); // langit-langit
    // kusen jendela + kaca hujan (dinding depan, menghadap ke dalam ruangan)
    this.windowGlass = new THREE.MeshBasicMaterial({ color: "#16233f", side: THREE.DoubleSide });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.4), this.windowGlass);
    glass.position.set(57.25, 1.9, -75.85); glass.rotation.y = Math.PI; glass.layers.set(NOINK); R.add(glass);
    // bingkai jendela
    b.add(boxGeo(V(56.45, 1.15, -76.1), V(56.6, 2.65, -75.5), 1), darkWoodM);
    b.add(boxGeo(V(57.9, 1.15, -76.1), V(58.05, 2.65, -75.5), 1), darkWoodM);
    b.add(boxGeo(V(56.5, 2.6, -76.1), V(58, 2.7, -75.5), 1), darkWoodM);
    b.add(boxGeo(V(56.5, 1.1, -76.1), V(58, 1.2, -75.5), 1), darkWoodM);
    // halaman rumput di luar pintu depan (agar pintu yang terbuka tidak menghadap langit kosong)
    const yardM = lam("grassYard", () => ({ map: grassHD(), color: "#5a8a48" }));
    b.add(quadUp(54, 66, -76, -68, 3, 2, 0.01), yardM);
    b.add(quadUp(-66, -54, -76, -68, 3, 2, 0.01), yardM);
    prop(b, kit, "plant_bush", 56.5, D0, -70, 1.4);
    prop(b, kit, "plant_bushLarge", 63.5, D0, -71, 1.8);
    prop(b, kit, "plant_bush", -63.5, D0, -70, 1.4);
    prop(b, kit, "plant_bushLarge", -56.5, D0, -71, 1.8);

    // ================= CERUK CERMIN (x 58..62, z -88..-84) =================
    b.add(quadUp(58, 62, -88, -84, 1.2, 1.2, 0.03), floorM);
    wall(58, 58.4, 0, 3.2, -88, -84); wall(61.6, 62, 0, 3.2, -88, -84);
    wall(58, 62, 0, 3.2, -88, -87.6);
    b.add(boxGeo(V(58, 3.2, -88), V(62, 3.35, -84), 2, true), wallM);
    // bingkai cermin besar (2.6 x 3.2) di dinding belakang ceruk
    b.add(boxGeo(V(58.6, 0.3, -87.7), V(61.4, 3.1, -87.55), 1), goldM);
    // permukaan cermin beriak (shader) — di depan bingkai, menghadap +z
    this.mirrorMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpen: { value: 0 }, uRipple: { value: 0 } },
      vertexShader: mirrorVert, fragmentShader: mirrorFrag, fog: false,
    });
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.7), this.mirrorMat);
    mirror.position.set(60, 1.7, -87.52); mirror.layers.set(NOINK); R.add(mirror);

    // ================= RUANG KENANGAN (x -65..-55, z -84..-76), siang hari =================
    b.add(quadUp(-65, -55, -84, -76, 3, 2, 0.03), floorM);
    const mwall = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), 2), wallM);
    mwall(-65, -55, 0, 3.2, -84, -83.6); // belakang (sketsa Ayah di sini)
    mwall(-65, -64.6, 0, 3.2, -84, -76); // kiri
    mwall(-55.4, -55, 0, 3.2, -84, -81); mwall(-55.4, -55, 0, 3.2, -79, -76); // kanan + jendela
    mwall(-55.4, -55, 0, 1.2, -81, -79); mwall(-55.4, -55, 2.6, 3.2, -81, -79);
    mwall(-65, -61, 0, 3.2, -76, -75.6); mwall(-59, -55, 0, 3.2, -76, -75.6); mwall(-61, -59, 2.6, 3.2, -76, -75.6); // depan + gap pintu
    b.add(boxGeo(V(-65, 3.2, -84), V(-55, 3.35, -76), 2, true), wallM);
    this.windowGlassMem = new THREE.MeshBasicMaterial({ color: "#cfe0f2" });
    const glass2 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4), this.windowGlassMem);
    glass2.position.set(-55.42, 1.9, -80); glass2.rotation.y = -Math.PI / 2; glass2.layers.set(NOINK); R.add(glass2);
    // meja surat + surat-surat tak terkirim berserakan
    b.add(boxGeo(V(-61.2, 0.78, -82.8), V(-58.8, 0.86, -82.0), 1), woodM);
    for (const [lx, lz] of [[-61.0, -82.6], [-59.0, -82.6], [-61.0, -82.2], [-59.0, -82.2]] as const)
      b.add(boxGeo(V(lx - 0.05, 0, lz - 0.05), V(lx + 0.05, 0.78, lz + 0.05), 1), darkWoodM);
    for (let i = 0; i < 7; i++) {
      const x = -61.5 + (i % 4) * 0.9, z = -80.5 - Math.floor(i / 4) * 0.9;
      b.add(boxGeo(V(x, 0.045, z), V(x + 0.55, 0.06, z + 0.75), 1), paperM);
    }
    for (let i = 0; i < 3; i++)
      b.add(boxGeo(V(-60.6 + i * 0.1, 0.87 + i * 0.02, -82.6), V(-60.1 + i * 0.1, 0.89 + i * 0.02, -82.1), 1), paperM);
    // jam pasir di atas meja (dua kerucut + penutup kayu)
    const sandM = new THREE.MeshLambertMaterial({ color: "#e8d9a0" });
    const hgTop = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 12), sandM);
    hgTop.position.set(-59.4, 1.06, -82.4); hgTop.rotation.x = Math.PI; R.add(hgTop);
    const hgBot = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 12), sandM);
    hgBot.position.set(-59.4, 0.94, -82.4); R.add(hgBot);
    b.add(boxGeo(V(-59.6, 0.86, -82.6), V(-59.2, 0.9, -82.2), 1), darkWoodM);
    b.add(boxGeo(V(-59.6, 1.16, -82.6), V(-59.2, 1.2, -82.2), 1), darkWoodM);
    // pot melati di dekat pintu ruang kenangan + tanaman
    b.add(boxGeo(V(-59.1, 0, -77.7), V(-58.1, 0.5, -76.7), 1), lam("potClay", () => ({ color: "#a85a3a" })));
    const jasmine = kitClone(kit, "plant_bush", 0.45);
    if (jasmine) { jasmine.position.set(JASMINE_POT[0], 0.4, JASMINE_POT[2]); R.add(jasmine); }
    b.build(R);

    // ---- pintu-pintu kayu (grup berengsel, diputar per frame) ----
    const doorMat = new THREE.MeshLambertMaterial({ color: "#6b4a2f" });
    const doorGeo = new THREE.BoxGeometry(1.95, 2.55, 0.12);
    doorGeo.translate(0.975, 0, 0); // engsel di tepi kiri
    const mkDoor = (x: number, z: number) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(doorGeo, doorMat);
      m.position.y = 1.28; g.add(m);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshLambertMaterial({ color: "#d8a83e" }));
      knob.position.set(1.75, 1.28, 0.1); g.add(knob);
      g.position.set(x, 0, z); R.add(g);
      return g;
    };
    this.frontDoor = mkDoor(59.05, -76);   // pintu Raka
    this.backDoor = mkDoor(59.05, -84);    // pintu terlarang
    this.memDoor = mkDoor(-60.95, -76);    // pintu ruang kenangan

    // ---- meja + vas keramik (ruang utama, dekat pintu terlarang) ----
    const vt = VASE_TABLE;
    const tableM = new THREE.MeshLambertMaterial({ color: "#5a3d28" });
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.6), tableM);
    table.position.set(vt[0], 0.78, vt[2]); R.add(table);
    for (const [lx, lz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]] as const) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.07), tableM);
      leg.position.set(vt[0] + lx, 0.39, vt[2] + lz); R.add(leg);
    }
    this.vase = new THREE.Group();
    const vaseM = new THREE.MeshLambertMaterial({ color: "#dfe8f2" });
    const vaseBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.42, 14), vaseM);
    vaseBody.position.y = 0.21; this.vase.add(vaseBody);
    const vaseNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 14), vaseM);
    vaseNeck.position.y = 0.46; this.vase.add(vaseNeck);
    const vaseRim = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 14), vaseM);
    vaseRim.position.y = 0.52; vaseRim.rotation.x = Math.PI / 2; this.vase.add(vaseRim);
    this.vase.position.set(vt[0], 0.82, vt[2]); R.add(this.vase);
    // serpihan vas (muncul setelah pecah)
    this.shards = new THREE.Group();
    const shardM = new THREE.MeshLambertMaterial({ color: "#dfe8f2" });
    for (let i = 0; i < 9; i++) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.05 + (i % 3) * 0.02, 0.03, 4), shardM);
      s.position.set(vt[0] - 0.3 + (i % 3) * 0.28, 0.03, vt[2] + 0.25 + Math.floor(i / 3) * 0.22);
      s.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      this.shards.add(s);
    }
    this.shards.visible = false; R.add(this.shards);

    // sketsa wajah Ayah di dinding belakang ruang kenangan
    const sketch = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4),
      new THREE.MeshBasicMaterial({ map: ayahSketchTexture(), toneMapped: false }));
    sketch.position.set(-60, 1.9, -83.55); sketch.layers.set(NOINK); R.add(sketch);
    const sframe = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.06), new THREE.MeshLambertMaterial({ color: "#6b4a2f" }));
    sframe.position.set(-60, 1.9, -83.6); R.add(sframe);
    // foto keluarga menguning di atas meja surat
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9),
      new THREE.MeshBasicMaterial({ map: familyPhotoTexture(), toneMapped: false }));
    photo.position.set(-60, 1.05, -82.45); photo.rotation.x = -0.5; photo.layers.set(NOINK); R.add(photo);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], tau = s.tau(t), dy = dayU(f), du = dawnU(f);
    // ---- kamera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- cahaya: malam -> siang (dayU) -> fajar (dawnU) ----
    const N = LIGHTS.night, Y = LIGHTS.day, D = LIGHTS.dawn;
    const mixP = (a: LightPreset, b: LightPreset, u: number): LightPreset => ({
      ...a,
      lit: lerp3(a.lit, b.lit, u) as [number, number, number],
      shade: lerp3(a.shade, b.shade, u) as [number, number, number],
      lift: lerp3(a.lift, b.lift, u) as [number, number, number],
      charTint: lerp3(a.charTint, b.charTint, u) as [number, number, number],
      sideTint: lerp3(a.sideTint, b.sideTint, u) as [number, number, number],
      sunI: a.sunI + (b.sunI - a.sunI) * u, hemiI: a.hemiI + (b.hemiI - a.hemiI) * u,
      fogNear: a.fogNear + (b.fogNear - a.fogNear) * u, fogFar: a.fogFar + (b.fogFar - a.fogFar) * u,
      az: a.az + (b.az - a.az) * u, el: a.el + (b.el - a.el) * u,
    });
    const L = mixP(mixP(N, Y, dy), D, du);
    const K = dy > 0.5 ? LOOK.day : du > 0.5 ? LOOK.dawn : LOOK.night;
    // arah bulan/matahari relatif kamera
    const fw = new THREE.Vector3().subVectors(focus, cam.position).normalize();
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const rt = new THREE.Vector3().crossVectors(fw, V(0, 1, 0)).normalize();
    const sunDir = fw.clone().multiplyScalar(Math.cos(az) * Math.cos(el))
      .addScaledVector(rt, Math.sin(az) * Math.cos(el)).add(V(0, Math.sin(el), 0)).normalize();
    this.hemi.color.set(lerpHex(lerpHex("#2a3d66", "#e8c4a8", dy), "#e8c4a8", du));
    this.hemi.groundColor.set(lerpHex(lerpHex("#1c2438", "#8a7a68", dy), "#7a6a58", du));
    this.hemi.intensity = L.hemiI;
    this.sun.color.set(lerpHex(lerpHex("#b9ccff", "#ffd9a0", dy), "#ffc98f", du));
    this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 60);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = -0.00025; this.sun.shadow.normalBias = 0.015 * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(...lerp3(lerp3(LOOK.night.bounce, LOOK.day.bounce, dy), LOOK.dawn.bounce, du));
    TONE.uSat.value = LOOK.night.sat + (LOOK.day.sat - LOOK.night.sat) * dy + (LOOK.dawn.sat - LOOK.day.sat) * du;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- langit + kabut ----
    const su = this.skyMat.uniforms;
    const skyC = LOOK.night.sky.c.map((col, i) => lerpHex(lerpHex(col, LOOK.day.sky.c[i], dy), LOOK.dawn.sky.c[i], du));
    skyC.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(lerpHex(lerpHex("#0d1830", "#d8b890", dy), "#e8a878", du), this.fog.color);
    this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    // bulan di malam hari, matahari di siang/pagi
    const nightSky = dy < 0.5 && du < 0.5;
    const discPos = nightSky
      ? cam.position.clone().addScaledVector(sunDir, 900)
      : cam.position.clone().add(new THREE.Vector3(500, 180, -700));
    this.moonDisc.position.copy(discPos);
    this.moonDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(nightSky ? 1.7 : 2.6)));
    (this.moonDisc.material as THREE.SpriteMaterial).color.set(nightSky ? new THREE.Color(2.2, 2.4, 3.0) : new THREE.Color(4.0, 2.6, 1.4));
    this.moonHalo.position.copy(discPos);
    this.moonHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(20)));
    (this.moonHalo.material as THREE.SpriteMaterial).color.set(nightSky ? new THREE.Color(0.7, 0.8, 1.0) : new THREE.Color(1.2, 0.7, 0.4));
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (mat.color as THREE.Color).setRGB(0.55 + 0.5 * Math.max(dy, du), 0.6 + 0.25 * Math.max(dy, du), 0.8 - 0.1 * Math.max(dy, du));
      mat.opacity = 1 - Math.max(dy, du) * 0.4;
    }
    // ---- kaca jendela: gelap malam / terang siang ----
    (this.windowGlass.color as THREE.Color).set(lerpHex("#16233f", "#cfe0f2", dy));
    // ---- cermin beriak (shader): waktu + keterbukaan emas + intensitas riak ----
    this.mirrorMat.uniforms.uTime.value = t;
    this.mirrorMat.uniforms.uOpen.value = mirrorOpen(f);
    this.mirrorMat.uniforms.uRipple.value = mirrorRipple(f);
    // ---- cahaya titik ----
    const fl = flicker(t);
    this.warmLight.visible = id !== 4; // ruang kenangan pakai matahari sore
    if (id !== 4) { this.warmLight.position.set(60, 2.2, -80); this.warmLight.intensity = (dy > 0.5 ? 6 : 10) * fl; }
    const mOpen = mirrorOpen(f), mRip = mirrorRipple(f);
    this.mirrorLight.visible = mRip > 0 || mOpen > 0;
    this.mirrorLight.position.set(60, 1.9, -86.2);
    this.mirrorLight.intensity = 3 + 6 * mRip + 42 * mOpen;
    this.faceLight.visible = id === 3 && f >= 1350;
    if (this.faceLight.visible) {
      this.faceLight.position.set(60.6, 1.55, -79.0);
      this.faceLight.intensity = 4 * (1 + 0.3 * Math.sin(t * 5.2) + 0.15 * Math.sin(t * 11.7));
    }
    this.sunDoorLight.visible = du > 0.02;
    if (this.sunDoorLight.visible) { this.sunDoorLight.position.set(60, 2.4, -75.0); this.sunDoorLight.intensity = 40 * du; }
    // ---- pintu: depan (Raka) terbuka lebar di E2; belakang (terlarang) menganga di B2 & E1; kenangan terbuka di D ----
    this.frontDoor.rotation.y = id === 5 && f >= 2430 ? -1.35 * smooth((f - 2430) / 60) : id === 1 ? -0.12 : -0.06;
    this.backDoor.rotation.y = id === 5 && f < 2430 ? 1.45 : id === 2 && f >= 810 ? 1.45 : 0.05; // + = mengayun ke DALAM ceruk (jangan halangi kamera)
    this.memDoor.rotation.y = id === 4 ? -0.7 : -0.06;
    // ---- vas: miring lalu jatuh (C1), serpihan muncul setelah pecah ----
    const tip = id === 3 ? smooth((f - VASE_TIP_F) / 30) : 0;
    this.vase.visible = !(id === 3 && f >= VASE_BREAK_F);
    if (id === 3) {
      this.vase.rotation.z = tip * 1.35;
      this.vase.position.y = 0.82 - tip * 0.3;
      this.vase.position.x = VASE_TABLE[0] - tip * 0.25;
    }
    this.shards.visible = id === 3 && f >= VASE_BREAK_F;
    // ---- cast + efek ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, f, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = false;
      if (p.fade !== undefined && p.fade < 1) { a.mat.transparent = true; a.mat.opacity = Math.max(0, p.fade); }
      else { a.mat.transparent = false; a.mat.opacity = 1; }
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}

/** sketsa pensil wajah Ayah: kertas sepia + garis kepala + senyum tipis (tanpa detail) */
function ayahSketchTexture() {
  return ctex("ayahSketch", 256, 320, (g) => {
    g.fillStyle = "#e8dcc0"; g.fillRect(0, 0, 256, 320);
    g.strokeStyle = "#5a4a34"; g.lineWidth = 3; g.lineCap = "round";
    // kepala oval + leher + bahu (garis sketsa)
    g.beginPath(); g.ellipse(128, 140, 58, 72, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(108, 205); g.lineTo(104, 250); g.moveTo(148, 205); g.lineTo(152, 250); g.stroke();
    g.beginPath(); g.moveTo(60, 300); g.quadraticCurveTo(128, 245, 196, 300); g.stroke();
    // rambut: garis-garis pendek
    for (let i = 0; i < 9; i++) {
      const x = 84 + i * 11;
      g.beginPath(); g.moveTo(x, 92 - (i % 3) * 4); g.lineTo(x + 4, 76); g.stroke();
    }
    // senyum tipis
    g.lineWidth = 4;
    g.beginPath(); g.arc(128, 168, 22, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
    // arsir ringan di pipi
    g.strokeStyle = "rgba(90,74,52,0.5)"; g.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(88, 150 + i * 6); g.lineTo(104, 154 + i * 6); g.stroke(); }
    // noda usia
    g.fillStyle = "rgba(120,90,40,0.2)";
    g.beginPath(); g.arc(40, 60, 24, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(220, 260, 28, 0, Math.PI * 2); g.fill();
  });
}

/** foto keluarga menguning: Ibu + Ayah + Raka kecil (siluet sederhana, sepia) */
function familyPhotoTexture() {
  return ctex("familyPhoto", 200, 256, (g) => {
    g.fillStyle = "#c9a86a"; g.fillRect(0, 0, 200, 256);
    g.fillStyle = "#8a6f45"; g.fillRect(0, 0, 200, 24); g.fillRect(0, 232, 200, 24);
    // Ayah (kiri, tinggi), Ibu (tengah, kerudung), Raka kecil (kanan)
    g.fillStyle = "#4a3a28";
    g.beginPath(); g.ellipse(58, 100, 26, 32, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(36, 128, 44, 90);
    g.fillStyle = "#2a3358";
    g.beginPath(); g.ellipse(105, 100, 26, 32, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(83, 128, 44, 90);
    g.fillStyle = "#4a7a3a";
    g.beginPath(); g.ellipse(152, 130, 18, 22, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(136, 150, 32, 68);
    // senyum tipis ketiganya
    g.strokeStyle = "#2a2118"; g.lineWidth = 2;
    for (const x of [58, 105, 152]) { g.beginPath(); g.arc(x, 108 + (x === 152 ? 24 : 0), 8, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); }
  });
}
