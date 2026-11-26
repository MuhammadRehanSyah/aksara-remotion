// IbuMisterius world: desa malam + hutan + interior rumah tua + bukit fajar.
// Satu scene three.js; update(id, f, camera, scene) mem-pose semuanya (fungsi murni dari id + f).
// Memakai primitif build.ts (Batch/boxGeo/quad/house/prop/kitClone) + tekstur paint.ts,
// seperti template trial3d-part2 — tanpa jembatan/sungai.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, boxGeo, V, lam, house, prop, kitClone, Kit } from "./build";
import { ctex, grassHD, cobbleHD, stoneHD, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage, flicker } from "./cast";
import {
  FPS, D0, SHOTS, IBU_A, RAKA_B, IBU_B, IBU_C, CHAIRS, FOREST_TREES, HILL, IBU_E, RAKA_E,
  camAt, dawnU, V3, smooth,
} from "./story";

const KENNEY = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", "tree-high-round", "tree",
  "plant_bushLarge", "plant_bushDetailed", "plant_bush", "hedge", "lantern", "stall-red", "windmill", "grass", "grass_large"];
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

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#0d1830", 10, 110);
  private moonDisc: THREE.Sprite; private moonHalo: THREE.Sprite;
  private lanternLight: THREE.PointLight; private candleLight: THREE.PointLight; private faceLight: THREE.PointLight;
  private lanternMesh: THREE.Object3D | null = null;
  private swayTrees: THREE.Object3D[] = [];
  private clouds: THREE.Mesh[] = [];
  private flames: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

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
    // point light lentera (mengikuti Ibu/Raka) + lilin interior + cahaya wajah close-up
    this.lanternLight = new THREE.PointLight("#ffb45e", 24, 18, 1.8);
    this.candleLight = new THREE.PointLight("#ff9a3e", 9, 9, 1.8);
    this.faceLight = new THREE.PointLight("#ff9a3e", 4, 4, 1.8);
    R.add(this.lanternLight, this.candleLight, this.faceLight);
    // awan malam
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudHD(i % 4, LOOK.night.cloud), color: new THREE.Color(0.55, 0.6, 0.8), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 130 + (i % 4) * 36, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- tanah + jalan desa ----
    const b = new Batch();
    const grassM = lam("grassHD", () => ({ map: grassHD() }));
    const cobbleM = lam("cobbleHD", () => ({ map: cobbleHD() }));
    const wallM = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#5a5468", "#524c60", "#615a70", "#4a4458"], "#3a3444") }));
    const woodM = lam("wood", () => ({ color: "#5a3d28" }));
    const darkWoodM = lam("darkWood", () => ({ color: "#3a2a1c" }));
    b.add(quadUp(-400, 400, -400, 400, 100, 100), grassM);
    b.add(quadUp(-2.2, 2.2, -70, 24, 1, 20, 0.02), cobbleM); // jalan desa -> hutan
    // ---- desa malam: rumah-rumah di kiri-kanan jalan ----
    const houses: [number, number, number, number, number, number, number][] = [
      [-9, 14, 0, 8, 8, 7, 0], [9.5, 10, Math.PI, 7, 8, 8.4, 1], [-10, 2, 0, 9, 8, 9.8, 2],
      [10, -2, Math.PI, 8, 8, 7, 3], [-9, -12, 0, 7, 8, 8.4, 4], [9.5, -16, Math.PI, 9, 8, 7, 5],
      [-16, 22, Math.PI / 2, 8, 8, 7, 6], [16, 24, -Math.PI / 2, 8, 8, 9.8, 7],
    ];
    for (const [x, z, yaw, w, d, h, si] of houses) house(b, x, z, yaw, w, d, h, si);
    // jendela menyala (bidang hangat, akan berpendar lewat bloom)
    const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.0, 0.4) });
    const winGlow = (x: number, y: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), winM);
      m.position.set(x, y, z); m.rotation.y = ry; m.layers.set(NOINK); R.add(m);
    };
    winGlow(-9, 1.6, 18.05, 0); winGlow(9.5, 1.6, 14.05, Math.PI); winGlow(-10, 1.6, 6.05, 0);
    winGlow(10, 2.6, 2.05, Math.PI); winGlow(-9, 1.6, -7.95, 0);
    // lentera jalan desa (statis) + warung
    for (const z of [12, 0, -10]) for (const x of [-3.4, 3.4]) prop(b, kit, "lantern", x, D0, z, 2.8);
    prop(b, kit, "stall-red", -6.5, D0, 6, 3.2, 0.4);
    prop(b, kit, "windmill", 26, D0, -6, 14, -0.5);
    // ---- hutan: pohon statis rapat di luar jalan ----
    const trees = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", "tree-high-round", "tree"];
    let ti = 0;
    for (let z = -22; z >= -68; z -= 7) {
      for (const x of [-8 - (ti % 3), 8 + (ti % 2)]) prop(b, kit, trees[ti % trees.length], x, D0, z + (ti % 4), 8 + (ti % 4), ti);
      ti++;
    }
    for (let i = 0; i < 40; i++) {
      const side = i % 2 ? 1 : -1, x = side * (12 + (i * 37 % 18)), z = -22 - (i * 53 % 48);
      prop(b, kit, trees[(i + 2) % trees.length], x, D0, z, 9 + (i % 5), i * 1.3);
    }
    for (let i = 0; i < 12; i++) prop(b, kit, i % 2 ? "plant_bushLarge" : "plant_bush", (i % 2 ? 1 : -1) * (5 + (i * 13 % 6)), D0, -24 - i * 3.5, 1.2);
    // ---- bukit fajar: gundukan besar + rumah tua di atasnya (eksterior) ----
    const hillM = lam("hillNight", () => ({ map: grassHD(), color: "#5a7a55" }));
    const hill = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    b.add(hill, hillM, new THREE.Matrix4().compose(V(0, -4.5, -115), new THREE.Quaternion(), V(55, 10, 38)));
    b.add(hill, hillM, new THREE.Matrix4().compose(V(-90, -3, -80), new THREE.Quaternion(), V(60, 7, 50)));
    b.add(hill, hillM, new THREE.Matrix4().compose(V(90, -3, -90), new THREE.Quaternion(), V(65, 7.5, 50)));
    // ---- interior rumah tua (ruang 10 x 3.2 x 8 di x 55..65, z -84..-76) ----
    const roomFloor = lam("roomFloor", () => ({ map: cobbleHD() }));
    b.add(quadUp(55, 65, -84, -76, 3, 2, 0.03), roomFloor);
    const wall = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), 2), wallM);
    wall(55, 65, 0, 3.2, -84, -83.6); // dinding belakang (foto di sini)
    wall(55, 55.4, 0, 3.2, -84, -76); // kiri
    wall(64.6, 65, 0, 3.2, -84, -76); // kanan
    wall(55, 57.5, 0, 3.2, -76, -75.6); wall(62.5, 65, 0, 3.2, -76, -75.6); // depan (pintu di tengah)
    b.add(boxGeo(V(55, 3.2, -84), V(65, 3.35, -76), 2, true), wallM); // langit-langit (bottom=true agar terlihat dari dalam)
    // kursi-kursi kosong menghadap pintu (+z)
    for (const [cx, , cz] of CHAIRS) {
      b.add(boxGeo(V(cx - 0.28, 0.45, cz - 0.25), V(cx + 0.28, 0.5, cz + 0.25), 1), darkWoodM);
      b.add(boxGeo(V(cx - 0.28, 0.5, cz - 0.28), V(cx + 0.28, 1.35, cz - 0.18), 1), darkWoodM);
      for (const [lx, lz] of [[-0.24, -0.2], [0.24, -0.2], [-0.24, 0.2], [0.24, 0.2]] as const)
        b.add(boxGeo(V(cx + lx - 0.03, 0, cz + lz - 0.03), V(cx + lx + 0.03, 0.45, cz + lz + 0.03), 1), darkWoodM);
    }
    // meja kecil + lilin di depan kursi
    b.add(boxGeo(V(59.2, 0.78, -81.2), V(60.8, 0.86, -80.4), 1), woodM);
    for (const [lx, lz] of [[59.4, -81.0], [60.6, -81.0], [59.4, -80.6], [60.6, -80.6]] as const)
      b.add(boxGeo(V(lx - 0.05, 0, lz - 0.05), V(lx + 0.05, 0.78, lz + 0.05), 1), darkWoodM);
    b.build(R);
    // rumah tua eksterior di puncak bukit (jauh, siluet fajar) + rumah desa di lereng bukit (terlihat di gambar lebar E)
    const b2 = new Batch();
    house(b2, -22, -84, Math.PI, 8, 8, 7, 0, 0);
    house(b2, 26, -100, Math.PI, 7, 8, 8.4, 1, 3.4);
    house(b2, -24, -96, Math.PI, 8, 8, 7, 3, 3.0);
    b2.build(R);
    // jendela menyala rumah lereng (menghadap kamera E = -z)
    winGlow(-22, 1.6, -88.05, Math.PI); winGlow(26, 5.0, -104.05, Math.PI); winGlow(-24, 4.6, -100.05, Math.PI);
    // lilin: badan + api (mesh dasar oranye, skala berdenyut per frame)
    const candleM = new THREE.MeshLambertMaterial({ color: "#f2ead8" });
    const flameM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 2.0, 0.6) });
    for (const [cx, cz] of [[59.4, -80.8], [60.6, -80.8], [60, -80.8]] as const) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.28, 8), candleM);
      c.position.set(cx, 1.0, cz); R.add(c);
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 8), flameM);
      fl.position.set(cx, 1.2, cz); fl.layers.set(NOINK); this.flames.push(fl); R.add(fl);
    }
    // foto tua Ibu di dinding belakang interior
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4),
      new THREE.MeshBasicMaterial({ map: ibuPhotoTexture(), toneMapped: false }));
    photo.position.set(60, 1.9, -83.55); photo.layers.set(NOINK); R.add(photo);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.06), new THREE.MeshLambertMaterial({ color: "#6b4a2f" }));
    frame.position.set(60, 1.9, -83.6); R.add(frame);
    // pohon bergoyang di hutan (kitClone, diputar per frame)
    for (const ft of FOREST_TREES) {
      const o = kitClone(kit, ft.kind, ft.h);
      if (!o) continue;
      o.position.set(ft.p[0], ft.p[1], ft.p[2]);
      this.swayTrees.push(o); R.add(o);
    }
    // lentera bergerak mengikuti Ibu (kitClone, kecil seukuran lentera tangan)
    this.lanternMesh = kitClone(kit, "lantern", 0.45);
    if (this.lanternMesh) R.add(this.lanternMesh);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], tau = s.tau(t), du = dawnU(f);
    // ---- kamera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- cahaya: lerp malam -> fajar selama adegan E ----
    const N = LIGHTS.night, D = LIGHTS.dawn;
    const L: LightPreset = {
      ...N,
      lit: lerp3(N.lit, D.lit, du) as [number, number, number],
      shade: lerp3(N.shade, D.shade, du) as [number, number, number],
      lift: lerp3(N.lift, D.lift, du) as [number, number, number],
      charTint: lerp3(N.charTint, D.charTint, du) as [number, number, number],
      sideTint: lerp3(N.sideTint, D.sideTint, du) as [number, number, number],
      sunI: N.sunI + (D.sunI - N.sunI) * du, hemiI: N.hemiI + (D.hemiI - N.hemiI) * du,
      fogNear: N.fogNear + (D.fogNear - N.fogNear) * du, fogFar: N.fogFar + (D.fogFar - N.fogFar) * du,
      az: N.az + (D.az - N.az) * du, el: N.el + (D.el - N.el) * du,
    };
    const K = du < 0.5 ? LOOK.night : LOOK.dawn;
    // arah bulan/matahari relatif kamera (az dari depan kamera, el elevasi)
    const fw = new THREE.Vector3().subVectors(focus, cam.position).normalize();
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const rt = new THREE.Vector3().crossVectors(fw, V(0, 1, 0)).normalize();
    const sunDir = fw.clone().multiplyScalar(Math.cos(az) * Math.cos(el))
      .addScaledVector(rt, Math.sin(az) * Math.cos(el)).add(V(0, Math.sin(el), 0)).normalize();
    this.hemi.color.set(lerpHex("#2a3d66", "#e8c4a8", du));
    this.hemi.groundColor.set(lerpHex("#1c2438", "#7a6a58", du));
    this.hemi.intensity = L.hemiI;
    this.sun.color.set(lerpHex("#b9ccff", "#ffc98f", du));
    this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 60);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = -0.00025; this.sun.shadow.normalBias = 0.015 * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(...lerp3(LOOK.night.bounce, LOOK.dawn.bounce, du));
    TONE.uSat.value = LOOK.night.sat + (LOOK.dawn.sat - LOOK.night.sat) * du;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- langit + kabut (lerp malam -> fajar) ----
    const su = this.skyMat.uniforms;
    const skyC = LOOK.night.sky.c.map((col, i) => lerpHex(col, LOOK.dawn.sky.c[i], du));
    skyC.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(lerpHex("#0d1830", "#e8a878", du), this.fog.color);
    this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    // bulan di malam hari, matahari fajar di timur
    const discPos = du < 0.5
      ? cam.position.clone().addScaledVector(sunDir, 900)
      : cam.position.clone().add(new THREE.Vector3(500, 180, -700));
    this.moonDisc.position.copy(discPos);
    this.moonDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(du < 0.5 ? 1.7 : 2.6)));
    (this.moonDisc.material as THREE.SpriteMaterial).color.set(du < 0.5 ? new THREE.Color(2.2, 2.4, 3.0) : new THREE.Color(4.0, 2.6, 1.4));
    this.moonHalo.position.copy(discPos);
    this.moonHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(20)));
    (this.moonHalo.material as THREE.SpriteMaterial).color.set(du < 0.5 ? new THREE.Color(0.7, 0.8, 1.0) : new THREE.Color(1.2, 0.7, 0.4));
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (mat.color as THREE.Color).setRGB(0.55 + 0.5 * du, 0.6 + 0.25 * du, 0.8 - 0.1 * du);
      mat.opacity = 1 - du * 0.4;
    }
    // ---- pohon bergoyang pelan (hutan) ----
    this.swayTrees.forEach((o, i) => { o.rotation.z = 0.02 * Math.sin(t * 0.9 + i * 1.7); o.rotation.x = 0.012 * Math.sin(t * 0.7 + i); });
    // ---- lentera bergerak + point lights ----
    const fl = flicker(t);
    let lanternPos: V3 | null = null, lanternVisible = false;
    if (id === 1) { const p = IBU_A(tau); lanternPos = [p[0] + 0.42, p[1] + 0.7, p[2] - 0.15]; lanternVisible = true; }
    else if (id === 2) { const p = IBU_B(tau); lanternPos = [p[0] + 0.42, p[1] + 0.7, p[2] - 0.15]; lanternVisible = true; }
    else if (id === 5) { const p = RAKA_E; lanternPos = [p[0] + 0.45, p[1] + 0.7, p[2] + 0.3]; lanternVisible = true; }
    if (this.lanternMesh) {
      this.lanternMesh.visible = lanternVisible;
      if (lanternPos) this.lanternMesh.position.set(lanternPos[0], lanternPos[1] - 0.15, lanternPos[2]);
    }
    this.lanternLight.visible = lanternVisible;
    if (lanternPos) { this.lanternLight.position.set(...lanternPos); this.lanternLight.intensity = 24 * fl; }
    // lilin interior (adegan C/D): cahaya hangat berdenyut + api berdenyut
    const candleOn = id === 3 || id === 4;
    this.candleLight.visible = candleOn;
    if (candleOn) {
      this.candleLight.position.set(60, 1.3, -80.8);
      this.candleLight.intensity = 9 * (1 + 0.25 * Math.sin(t * 9.3) + 0.12 * Math.sin(t * 17.1));
    }
    for (const flame of this.flames) flame.scale.setScalar(candleOn ? 1 + 0.18 * Math.sin(t * 11 + flame.position.x * 7) : 0.001);
    // cahaya wajah close-up (adegan D): hangat berdenyut seperti api lilin
    this.faceLight.visible = id === 4;
    if (id === 4) {
      this.faceLight.position.set(IBU_C[0] + 0.6, 1.55, IBU_C[2] + 0.9);
      this.faceLight.intensity = 4 * (1 + 0.3 * Math.sin(t * 5.2) + 0.15 * Math.sin(t * 11.7));
    }
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
      // fade Ibu di akhir adegan E (opacity -> 0)
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

/** tekstur foto tua: sepia + potret Ibu (kerudung gelap, wajah pucat) */
function ibuPhotoTexture() {
  return ctex("ibuPhoto", 256, 320, (g) => {
    g.fillStyle = "#b99a68"; g.fillRect(0, 0, 256, 320);
    g.fillStyle = "#8a6f45"; g.fillRect(0, 0, 256, 40); g.fillRect(0, 280, 256, 40);
    // kerudung
    g.fillStyle = "#2a3358";
    g.beginPath(); g.ellipse(128, 150, 82, 100, 0, 0, Math.PI * 2); g.fill();
    // wajah
    g.fillStyle = "#e8c9a0";
    g.beginPath(); g.ellipse(128, 150, 52, 64, 0, 0, Math.PI * 2); g.fill();
    // mata + mulut
    g.fillStyle = "#241726";
    g.beginPath(); g.ellipse(108, 142, 7, 9, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(148, 142, 7, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(118, 188, 20, 4);
    // bahu / baju
    g.fillStyle = "#2e3a5c";
    g.beginPath(); g.ellipse(128, 320, 110, 70, 0, Math.PI, 0); g.fill();
    // noda usia sepia
    g.fillStyle = "rgba(120,90,40,0.25)";
    g.beginPath(); g.arc(40, 60, 26, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(220, 250, 30, 0, Math.PI * 2); g.fill();
  });
}
