// MalinKundang world: pantai Air Manis + laut berombak + desa nelayan + 2 kapal + batu berlutut.
// 7 tokoh kotak-kotak 3D (blocky.ts): Malin muda, Malin dewasa, Ibu, Istri, Nahkoda, 2 penduduk.
// Satu scene three.js; update(id, f, camera, scene) mem-pose semuanya (fungsi murni dari id + f).
// Tokoh kotak adalah mesh 3D asli (bukan billboard): berjalan menjauhi kamera = rotasi root PI,
// jadi ATURAN MOONWALK terpenuhi dengan memutar badan, bukan kartu punggung.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "./build";
import { ctex } from "./paint";
import { NOINK } from "./ink";
import { BlockyChar } from "./blocky";
import { mouthAt } from "./lipsync";
import {
  FPS, camAt, gradeAt, isFlash,
  HUT_POS, HUT2_POS, STONE_POS, NET_POS, SHIP_SMALL_HOME, SHIP_BIG_HOME,
  malinMudaPos, malinMudaWalking, malinMudaPhase, malinMudaRotY,
  ibuPos, ibuRunning, ibuRunPhase, ibuWaving,
  malinDewasaPos, istriPos, PENDUDUK_POS,
  shipSmallPos, shipBigPos, shipBigRoll,
  malinKneel, malinStone, wavePhase,
  ibuExpr, malinMudaExpr, malinDewasaExpr, istriExpr, nahkodaExpr, pendudukExpr,
  V3, smooth,
} from "./story";

// Cue lip-sync per baris dialog — DIISI dari Rhubarb setelah audio selesai.
// Sementara kosong (mulut "X") supaya kode bisa di-typecheck + still lokal.
import {
  D1_CUES, D2_CUES, D3_CUES, D4_CUES, D5_CUES, D6_CUES, D7_CUES, D8_CUES, D9_CUES, D10_CUES,
} from "./lipsync";

const sandTex = () =>
  ctex("sandBeach", 256, 256, (g) => {
    g.fillStyle = "#d8c49a";
    g.fillRect(0, 0, 256, 256);
    // bintik pasir
    for (let i = 0; i < 900; i++) {
      const x = (i * 37) % 256, y = (i * 91) % 256;
      g.fillStyle = i % 3 === 0 ? "rgba(120,90,50,0.25)" : "rgba(255,240,200,0.3)";
      g.fillRect(x, y, 2, 2);
    }
    // garis ombak di tepi (akan diposisikan di garis pantai oleh mesh terpisah)
  });

const seaTex = () =>
  ctex("seaWaves", 256, 256, (g) => {
    g.fillStyle = "#2e6fb0";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(255,255,255,0.18)";
    g.lineWidth = 5;
    for (let r = 0; r < 6; r++) {
      g.beginPath();
      for (let x = 0; x <= 256; x += 16) {
        const y = 20 + r * 42 + 8 * Math.sin((x / 256) * Math.PI * 2 + r);
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
  });

const sailTex = () =>
  ctex("sailCloth", 128, 128, (g) => {
    g.fillStyle = "#f4ead0";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#a83e2e";
    g.fillRect(0, 96, 128, 18); // garis merah di bawah layar
    g.strokeStyle = "rgba(120,90,50,0.35)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, 32); g.lineTo(128, 32);
    g.moveTo(0, 64); g.lineTo(128, 64);
    g.stroke();
  });

const netTex = () =>
  ctex("fishNet", 128, 128, (g) => {
    g.fillStyle = "#8a7a5a";
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = "#3a2a1c";
    g.lineWidth = 2;
    for (let i = 0; i <= 128; i += 16) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke();
    }
  });

const SKY: Record<string, { bg: string; fog: string; sea: string; sun: string; sunI: number; hemiI: number }> = {
  day: { bg: "#6fb1e8", fog: "#b8d0ec", sea: "#2e6fb0", sun: "#fff2cc", sunI: 1.6, hemiI: 0.8 },
  golden: { bg: "#e8a56a", fog: "#f4c98a", sea: "#4a7a9a", sun: "#ffb36b", sunI: 1.5, hemiI: 0.7 },
  storm: { bg: "#232833", fog: "#3a3f4a", sea: "#1e2836", sun: "#8a9ab0", sunI: 0.5, hemiI: 0.45 },
  dawn: { bg: "#f4c98a", fog: "#e8c8a0", sea: "#7a9ab0", sun: "#ffcf9e", sunI: 1.2, hemiI: 0.7 },
};

export class World {
  root = new THREE.Group();
  private malinMuda: BlockyChar;
  private malinDewasa: BlockyChar;
  private ibu: BlockyChar;
  private istri: BlockyChar;
  private nahkoda: BlockyChar;
  private penduduk: BlockyChar[] = [];
  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  private flashLight: THREE.DirectionalLight;
  private sea: THREE.Mesh;
  private seaGeo: THREE.PlaneGeometry;
  private seaBase: Float32Array;
  private seaMat: THREE.MeshLambertMaterial;
  private shipSmall = new THREE.Group();
  private shipBig = new THREE.Group();
  private foams: THREE.Mesh[] = [];
  private rain: THREE.Group;
  private rainDrops: THREE.Mesh[] = [];
  private goldCoins: THREE.Mesh[] = [];
  private chestLid: THREE.Mesh;
  private stone: THREE.Group;
  private fog = new THREE.Fog("#b8d0ec", 18, 70);

  constructor() {
    const R = this.root;
    // ---- cahaya ----
    this.hemi = new THREE.HemisphereLight("#b8d0ec", "#8a7a5a", 0.8);
    this.sun = new THREE.DirectionalLight("#fff2cc", 1.6);
    this.sun.position.set(6, 10, 4);
    this.sun.target.position.set(0, 0, -6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    const sc = this.sun.shadow.camera;
    sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 0.5; sc.far = 40;
    this.sun.shadow.bias = -0.0005;
    R.add(this.hemi, this.sun, this.sun.target);
    // lampu kilat petir (hanya menyala saat flash)
    this.flashLight = new THREE.DirectionalLight("#ffffff", 0);
    this.flashLight.position.set(-4, 12, -8);
    R.add(this.flashLight);

    const b = new Batch();
    const sandM = lam("sand", () => ({ map: sandTex(), color: "#d8c49a" }));
    const woodM = lam("hutWood", () => ({ color: "#6b4a2f" }));
    const darkWoodM = lam("hutDark", () => ({ color: "#3a2a1c" }));
    const roofM = lam("hutRoof", () => ({ color: "#8a5a2e" }));
    const roofM2 = lam("hutRoof2", () => ({ color: "#7a4a26" }));

    // ---- pantai (pasir) + desa (tanah) ----
    b.add(boxGeo(V(-16, -0.06, -10), V(16, 0, 4), 2), sandM);
    b.add(boxGeo(V(-16, -0.05, 4), V(16, 0.02, 12), 2), lam("villageGround", () => ({ color: "#a8906a" })));
    // garis buih di tepi pantai (3 strip putih, digerakkan di update)
    const foamM = lam("foam", () => ({ color: "#f4f8ff" }));
    for (let i = 0; i < 3; i++) {
      const foam = new THREE.Mesh(new THREE.BoxGeometry(30, 0.03, 0.35), foamM);
      foam.position.set(0, 0.02, -9.6 - i * 0.7);
      this.foams.push(foam);
      R.add(foam);
    }
    // ---- gubuk Ibu + gubuk tetangga (dinding + atap miring dua sisi + pintu gelap) ----
    const hut = (p: V3, w: number, d: number, h: number, wallM: THREE.MeshLambertMaterial, rM: THREE.MeshLambertMaterial) => {
      b.add(boxGeo(V(p[0] - w / 2, 0, p[2] - d / 2), V(p[0] + w / 2, h, p[2] + d / 2), 2), wallM);
      const roofL = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.12, d / 2 + 0.5), rM);
      roofL.position.set(p[0] - w / 4, h + 0.45, p[2]);
      roofL.rotation.z = 0.5;
      roofL.castShadow = true;
      R.add(roofL);
      const roofR = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.12, d / 2 + 0.5), rM);
      roofR.position.set(p[0] + w / 4, h + 0.45, p[2]);
      roofR.rotation.z = -0.5;
      roofR.castShadow = true;
      R.add(roofR);
      // pintu gelap menghadap pantai (-z)
      const door = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.3),
        new THREE.MeshBasicMaterial({ color: "#1a1410" }));
      door.position.set(p[0], 0.65, p[2] - d / 2 - 0.01);
      door.rotation.y = Math.PI;
      door.layers.set(NOINK);
      R.add(door);
    };
    hut(HUT_POS, 3.2, 2.6, 2.2, woodM, roofM);
    hut(HUT2_POS, 2.8, 2.4, 2.0, darkWoodM, roofM2);
    // meja rendah + jala di depan gubuk Ibu
    b.add(boxGeo(V(NET_POS[0] - 0.7, 0.4, NET_POS[2] - 0.4), V(NET_POS[0] + 0.7, 0.48, NET_POS[2] + 0.4), 1), darkWoodM);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75),
      new THREE.MeshBasicMaterial({ map: netTex() }));
    net.rotation.x = -Math.PI / 2;
    net.position.set(NET_POS[0], 0.5, NET_POS[2]);
    net.layers.set(NOINK);
    R.add(net);
    // keranjang ikan di samping gubuk
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.4, 10),
      lam("basket", () => ({ color: "#8a6a3a" })));
    basket.position.set(HUT_POS[0] + 1.9, 0.2, HUT_POS[2] - 0.8);
    basket.castShadow = true;
    R.add(basket);
    // 2 pohon kelapa sederhana (batang miring + 5 pelepah kotak)
    const palm = (x: number, z: number, lean: number) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.2, 8),
        lam(`palmTrunk${x}`, () => ({ color: "#6b4a2f" })));
      trunk.position.set(x, 1.6, z);
      trunk.rotation.z = lean;
      trunk.castShadow = true;
      R.add(trunk);
      const topX = x - Math.sin(lean) * 3.2, topZ = z;
      for (let i = 0; i < 5; i++) {
        const frond = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.3),
          lam(`palmLeaf${x}_${i}`, () => ({ color: "#3a7a3a" })));
        frond.position.set(topX, 3.25, topZ);
        frond.rotation.y = (i / 5) * Math.PI * 2;
        frond.rotation.z = 0.5;
        frond.translateX(0.6);
        R.add(frond);
      }
    };
    palm(-6.5, 5.5, 0.12);
    palm(7, 4.5, -0.1);
    b.build(R);

    // ---- laut (bidang berombak, vertex digerakkan di update) ----
    this.seaGeo = new THREE.PlaneGeometry(90, 55, 45, 28);
    this.seaBase = (this.seaGeo.attributes.position.array as Float32Array).slice();
    this.seaMat = new THREE.MeshLambertMaterial({ map: seaTex(), color: "#2e6fb0" });
    this.sea = new THREE.Mesh(this.seaGeo, this.seaMat);
    this.sea.rotation.x = -Math.PI / 2;
    this.sea.position.set(0, -0.05, -37);
    R.add(this.sea);

    // ---- kapal layar kecil (S4) ----
    this.buildShip(this.shipSmall, 2.2, 0.9, false);
    this.shipSmall.position.set(...SHIP_SMALL_HOME);
    R.add(this.shipSmall);
    // ---- kapal dagang besar (S5-S6, S10) ----
    this.buildShip(this.shipBig, 5.2, 1.6, true);
    this.shipBig.position.set(...SHIP_BIG_HOME);
    R.add(this.shipBig);
    // peti emas + koin di dek kapal besar (sisi kamera/+x supaya terlihat saat Malin menghitung)
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.45),
      lam("chestWood", () => ({ color: "#5a3d28" })));
    chest.position.set(0.55, 1.85, 0.3);
    chest.castShadow = true;
    this.shipBig.add(chest);
    this.chestLid = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.45),
      lam("chestGold", () => ({ color: "#d8a83e" })));
    this.chestLid.position.set(0.55, 2.12, 0.3);
    this.chestLid.rotation.z = -0.5;
    this.shipBig.add(this.chestLid);
    const coinM = lam("goldCoin", () => ({ color: "#d8a83e" }));
    for (let i = 0; i < 8; i++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), coinM);
      coin.position.set(0.55 + (i % 4) * 0.18 - 0.27, 2.1, 0.3 + Math.floor(i / 4) * 0.18 - 0.09);
      coin.rotation.y = i;
      this.goldCoins.push(coin);
      this.shipBig.add(coin);
    }

    // ---- batu berlutut (sosok membatu menghadap laut) ----
    const stoneM = lam("stoneGrey", () => ({ color: "#8a8a86" }));
    const stoneM2 = lam("stoneGrey2", () => ({ color: "#7a7a76" }));
    const stone = new THREE.Group();
    // badan membungkuk (kotak miring), kepala tertunduk, kaki terlipat
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.35), stoneM);
    torso.position.set(0, 0.55, 0);
    torso.rotation.x = 0.5;
    torso.castShadow = true;
    stone.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), stoneM2);
    head.position.set(0, 0.95, -0.18);
    head.rotation.x = 0.6;
    head.castShadow = true;
    stone.add(head);
    for (const x of [-0.16, 0.16]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.5), stoneM2);
      leg.position.set(x, 0.1, 0.05);
      leg.castShadow = true;
      stone.add(leg);
    }
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.25, 10), stoneM2);
    base.position.set(0, 0.12, 0);
    stone.add(base);
    stone.position.set(...STONE_POS);
    stone.rotation.y = Math.PI; // menghadap laut (-z)
    stone.scale.setScalar(1.3); // batu harus terbaca jelas di shot hook + penutup
    this.stone = stone;
    R.add(stone);

    // ---- hujan (hanya saat badai) ----
    this.rain = new THREE.Group();
    const rainM = new THREE.MeshBasicMaterial({ color: "#c8d4e8", transparent: true, opacity: 0.45 });
    for (let i = 0; i < 70; i++) {
      const drop = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.55, 0.02), rainM);
      drop.position.set((i * 0.37 % 14) - 7, (i * 0.73 % 8), -14 + (i * 0.53 % 16) - 8);
      drop.rotation.z = 0.15;
      drop.layers.set(NOINK);
      this.rainDrops.push(drop);
      this.rain.add(drop);
    }
    this.rain.visible = false;
    R.add(this.rain);

    // ---- tokoh ----
    this.malinMuda = new BlockyChar({
      name: "malinmuda", scale: 0.92, skin: "#c99067", shirt: "#8a6a48", pants: "#4a4a52",
      hairColor: "#1e1e26", hairStyle: "spiky",
    });
    this.malinDewasa = new BlockyChar({
      name: "malindewasa", scale: 1, skin: "#c99067", shirt: "#a83e2e", pants: "#2a2a3a",
      hairColor: "#d8a83e", hairStyle: "sorban", clothColor: "#d8a83e",
    });
    this.ibu = new BlockyChar({
      name: "ibu", scale: 0.95, skin: "#d8a080", shirt: "#6a5a48", pants: "#4a3a30",
      hairColor: "#3a3a4a", hairStyle: "hijab", clothColor: "#3a4a6a",
    });
    this.istri = new BlockyChar({
      name: "istri", scale: 0.95, skin: "#e8b88a", shirt: "#8a2e5a", pants: "#3a2a3a",
      hairColor: "#1e1e26", hairStyle: "hijab", clothColor: "#c9a03e",
    });
    this.nahkoda = new BlockyChar({
      name: "nahkoda", scale: 1, skin: "#a8764a", shirt: "#2a3a5a", pants: "#3a3a3a",
      hairColor: "#8a8a8a", hairStyle: "flat", mustache: true,
    });
    const p1 = new BlockyChar({
      name: "penduduk1", scale: 0.97, skin: "#c99067", shirt: "#4a7a3a", pants: "#3b5b9a",
      hairColor: "#1e1e26", hairStyle: "flat",
    });
    const p2 = new BlockyChar({
      name: "penduduk2", scale: 0.95, skin: "#d8a080", shirt: "#c98a2e", pants: "#4a4a52",
      hairColor: "#1e1e26", hairStyle: "spiky",
    });
    this.penduduk = [p1, p2];
    for (const c of [this.malinMuda, this.malinDewasa, this.ibu, this.istri, this.nahkoda, p1, p2]) {
      R.add(c.root);
    }
  }

  /** Kapal: lambung + tiang + layar + bendera. length = panjang lambung (m), deckY = tinggi dek. */
  private buildShip(g: THREE.Group, length: number, deckY: number, big: boolean) {
    const hullM = lam(`hull_${length}`, () => ({ color: "#5a3d28" }));
    const hullM2 = lam(`hull2_${length}`, () => ({ color: "#3a2a1c" }));
    // lambung: kotak panjang + haluan meruncing (kotak miring di depan)
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, length), hullM);
    hull.position.y = 0.55;
    hull.castShadow = true;
    g.add(hull);
    const bow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.9), hullM2);
    bow.position.set(0, 0.5, -length / 2 - 0.3);
    bow.rotation.x = 0.5;
    g.add(bow);
    const stern = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.5), hullM2);
    stern.position.set(0, 0.9, length / 2 + 0.1);
    g.add(stern);
    // dek
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, length - 0.4),
      lam(`deck_${length}`, () => ({ color: "#8a6a48" })));
    deck.position.y = deckY;
    g.add(deck);
    // tiang + layar
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8),
      lam(`mast_${length}`, () => ({ color: "#3a2a1c" })));
    mast.position.set(0, deckY + 1.6, 0);
    mast.castShadow = true;
    g.add(mast);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.0),
      new THREE.MeshBasicMaterial({ map: sailTex(), side: THREE.DoubleSide }));
    sail.position.set(0, deckY + 1.7, -0.15);
    sail.layers.set(NOINK);
    g.add(sail);
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 8),
      lam(`boom_${length}`, () => ({ color: "#3a2a1c" })));
    boom.rotation.z = Math.PI / 2;
    boom.position.set(0, deckY + 0.75, -0.15);
    g.add(boom);
    // bendera merah di puncak tiang
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3),
      new THREE.MeshBasicMaterial({ color: "#a83e2e", side: THREE.DoubleSide }));
    flag.position.set(0.28, deckY + 3.1, 0);
    flag.layers.set(NOINK);
    g.add(flag);
    if (big) {
      // tiang kedua (belakang) untuk kapal besar
      const mast2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 8),
        lam(`mast2_${length}`, () => ({ color: "#3a2a1c" })));
      mast2.position.set(0, deckY + 1.2, length / 2 - 0.8);
      g.add(mast2);
      const sail2 = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.4),
        new THREE.MeshBasicMaterial({ map: sailTex(), side: THREE.DoubleSide }));
      sail2.position.set(0, deckY + 1.3, length / 2 - 0.95);
      sail2.layers.set(NOINK);
      g.add(sail2);
    }
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS;
    const grade = gradeAt(f);
    const sky = SKY[grade];
    const storm = grade === "storm";
    const stormAmp = storm ? 2.4 : 1;
    // ---- langit + cahaya per grade (badai menggelap; kilat saat flash) ----
    const flash = isFlash(f);
    scene.background = new THREE.Color(flash ? "#e8ecff" : sky.bg);
    scene.fog = this.fog;
    this.fog.color.set(sky.fog);
    this.fog.near = storm ? 10 : 18;
    this.fog.far = storm ? 45 : 70;
    this.hemi.intensity = sky.hemiI;
    this.sun.intensity = flash ? 3.0 : sky.sunI;
    this.sun.color.set(sky.sun);
    this.flashLight.intensity = flash ? 6 : 0;
    this.seaMat.color.set(sky.sea);
    // ---- kamera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(...c.look);
    cam.rotateZ(c.roll);
    cam.fov = c.fov;
    cam.near = 0.2;
    cam.far = 150;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    // ---- laut berombak (vertex sin, amplitudo naik saat badai) ----
    const pos = this.seaGeo.attributes.position as THREE.BufferAttribute;
    const ph = wavePhase(f);
    for (let i = 0; i < pos.count; i++) {
      const x = this.seaBase[i * 3], y = this.seaBase[i * 3 + 1];
      pos.setZ(i, stormAmp * 0.28 * Math.sin(x * 0.35 + ph * 2.0) * Math.cos(y * 0.3 + ph * 1.4)
        + stormAmp * 0.12 * Math.sin((x + y) * 0.5 + ph * 3.1));
    }
    pos.needsUpdate = true;
    this.seaGeo.computeVertexNormals();
    // buih tepi pantai bergerak maju-mundur
    this.foams.forEach((fm, i) => {
      fm.position.z = -9.6 - i * 0.7 + 0.35 * Math.sin(ph * 1.6 + i * 1.3);
    });
    // ---- hujan (hanya badai) ----
    this.rain.visible = storm;
    if (storm) {
      for (const d of this.rainDrops) {
        d.position.y -= 0.35;
        if (d.position.y < 0) d.position.y = 8;
      }
    }
    // ---- kapal kecil berlayar menjauh + oleng pelan ----
    const sp = shipSmallPos(f);
    this.shipSmall.position.set(sp[0], 0.1 * Math.sin(ph * 1.8), sp[2]);
    this.shipSmall.rotation.z = 0.04 * Math.sin(ph * 1.5);
    this.shipSmall.rotation.x = 0.03 * Math.sin(ph * 1.2);
    // ---- kapal besar mendekat + oleng badai ----
    const bp = shipBigPos(f);
    const bob = 0.12 * Math.sin(ph * 1.6) * (storm ? 2 : 1);
    this.shipBig.position.set(bp[0], bob, bp[2]);
    this.shipBig.rotation.z = shipBigRoll(f);
    this.shipBig.rotation.x = storm ? 0.05 * Math.sin(ph * 1.9) : 0.02 * Math.sin(ph * 1.1);
    // koin emas berkilau (berputar pelan) saat Malin menghitung (S5)
    this.goldCoins.forEach((cn, i) => {
      cn.rotation.y = t * 1.5 + i;
      cn.position.y = 2.1 + 0.02 * Math.sin(t * 3 + i);
    });
    this.chestLid.rotation.z = -0.5; // peti terbuka

    // ---- TOKOH ----
    // Batu prop hanya ada di S1 (hook) dan S12 (penutup) — di tengah cerita batu belum ada;
    // di S11 yang terlihat adalah Malin dewasa yang membatu di titik yang sama.
    this.stone.visible = f < 192 || f >= 2640;
    // Ibu + Istri pergi setelah kutukan (S11-S12 hanya batu + narator).
    this.ibu.root.visible = f < 2273;
    this.istri.root.visible = f < 2273;
    // Malin dewasa yang membatu diganti batu prop di S12 (titik sama, jangan tumpang tindih).
    this.malinDewasa.root.visible = f < 2640;
    // Malin muda: pamit (hadap kamera) lalu berjalan ke laut (membelakangi kamera, rotasi PI)
    // Setelah berlayar (f>=624) dia tidak lagi di pantai — disembunyikan.
    this.malinMuda.root.visible = f < 624;
    const mmP = malinMudaPos(f);
    const mmWalk = malinMudaWalking(f);
    this.malinMuda.root.position.set(mmP[0], mmWalk ? 0.02 * Math.abs(Math.sin(2 * Math.PI * malinMudaPhase(f))) : 0, mmP[2]);
    this.malinMuda.root.rotation.y = malinMudaRotY(f);
    this.malinMuda.setFace(malinMudaExpr(f), mouthAt(D1_CUES, f));
    if (mmWalk) {
      const wph = 2 * Math.PI * malinMudaPhase(f);
      this.malinMuda.legL.rotation.x = 0.45 * Math.sin(wph);
      this.malinMuda.legR.rotation.x = -0.45 * Math.sin(wph);
      this.malinMuda.armL.rotation.x = 0.3 * Math.sin(wph);
      this.malinMuda.armR.rotation.x = -0.3 * Math.sin(wph);
    } else {
      this.malinMuda.legL.rotation.x = 0;
      this.malinMuda.legR.rotation.x = 0;
      this.malinMuda.armL.rotation.x = -0.05;
      this.malinMuda.armR.rotation.x = -0.05;
    }
    // Ibu: di gubuk menjahit (S2), melambai (S4), berlari (S7), memanggil + mengutuk (S7-S9)
    const ibP = ibuPos(f);
    const ibRun = ibuRunning(f);
    this.ibu.root.position.set(ibP[0], ibRun ? 0.03 * Math.abs(Math.sin(2 * Math.PI * ibuRunPhase(f))) : 0, ibP[2]);
    this.ibu.root.rotation.y = f < 408 ? Math.PI : 0; // di gubuk menjahit menghadap kamera (arah pantai); di pantai menghadap kamera
    this.ibu.setFace(ibuExpr(f), mouthAt(f < 600 ? D2_CUES : f < 1500 ? D6_CUES : D9_CUES, f));
    if (ibRun) {
      const rph = 2 * Math.PI * ibuRunPhase(f);
      this.ibu.legL.rotation.x = 0.5 * Math.sin(rph);
      this.ibu.legR.rotation.x = -0.5 * Math.sin(rph);
      this.ibu.armL.rotation.x = 0.4 * Math.sin(rph);
      this.ibu.armR.rotation.x = -0.4 * Math.sin(rph);
    } else if (ibuWaving(f)) {
      // melambai: lengan kanan naik-turun
      this.ibu.armR.rotation.x = -2.4 + 0.35 * Math.sin(t * 6);
      this.ibu.armL.rotation.x = -0.05;
      this.ibu.legL.rotation.x = 0;
      this.ibu.legR.rotation.x = 0;
    } else {
      this.ibu.legL.rotation.x = 0;
      this.ibu.legR.rotation.x = 0;
      // menjahit jala di gubuk: lengan kiri terangkat ke arah jala, kanan bergerak maju-mundur pelan
      if (f < 408) {
        this.ibu.armR.rotation.x = -0.5 + 0.15 * Math.sin(t * 2.5);
        this.ibu.armL.rotation.x = -1.1;
      } else {
        this.ibu.armR.rotation.x = -0.05;
        this.ibu.armL.rotation.x = -0.05;
      }
    }
    // Nahkoda: berdiri di dek kapal kecil (ikut posisi kapal)
    this.nahkoda.root.position.set(sp[0], 0.9 + 0.1 * Math.sin(ph * 1.8), sp[2]);
    this.nahkoda.root.rotation.y = 0;
    this.nahkoda.setFace(nahkodaExpr(), mouthAt(D3_CUES, f));
    this.nahkoda.armR.rotation.x = f >= 624 && f < 700 ? -2.2 : -0.05; // memberi aba-aba angkat layar (D3 624-671)
    // Malin dewasa: dek kapal besar (ikut posisi kapal) / pantai / berlutut membatu
    const mdP = malinDewasaPos(f);
    const onDeck = f < 1416;
    const deckZ = onDeck ? bp[2] : mdP[2];
    const deckY = onDeck ? 1.6 + bob : 0;
    const kneel = malinKneel(f);
    const stoneU = malinStone(f);
    this.malinDewasa.root.position.set(mdP[0], deckY - 0.55 * kneel, deckZ);
    this.malinDewasa.root.rotation.y = onDeck ? 0 : 0;
    this.malinDewasa.setFace(malinDewasaExpr(f), mouthAt(f < 1200 ? D4_CUES : f < 1700 ? D8_CUES : D10_CUES, f));
    if (kneel > 0) {
      // berlutut: kaki terlipat ke belakang, badan menunduk, lalu membatu (abu-abu)
      this.malinDewasa.legL.rotation.x = -1.3 * kneel;
      this.malinDewasa.legR.rotation.x = -1.3 * kneel;
      this.malinDewasa.head.rotation.x = 0.28 * kneel; // menunduk
      this.malinDewasa.armL.rotation.x = -0.2;
      this.malinDewasa.armR.rotation.x = -0.2;
      this.malinDewasa.petrify(stoneU);
    } else if (f < 1048) {
      // menghitung emas: lengan kanan mengetuk ke bawah bertahap (D4 960-1038)
      const dip = f >= 940 && f < 1040 ? Math.sin(((f - 940) / 100) * Math.PI * 3) * 0.3 : 0;
      this.malinDewasa.armR.rotation.x = -0.4 - dip;
      this.malinDewasa.armL.rotation.x = -0.3;
      this.malinDewasa.legL.rotation.x = 0;
      this.malinDewasa.legR.rotation.x = 0;
    } else if (storm && f >= 1932) {
      // terhuyung di badai (sebelum berlutut f2043)
      this.malinDewasa.root.rotation.z = 0.08 * Math.sin(t * 3);
      this.malinDewasa.armL.rotation.x = -1.2;
      this.malinDewasa.armR.rotation.x = -1.2;
    } else {
      this.malinDewasa.legL.rotation.x = 0;
      this.malinDewasa.legR.rotation.x = 0;
      this.malinDewasa.armL.rotation.x = -0.05;
      this.malinDewasa.armR.rotation.x = -0.05;
    }
    // Istri: dek kapal besar (ikut posisi kapal) / pantai
    const isP = istriPos(f);
    const isDeck = f < 1416;
    this.istri.root.position.set(isP[0], isDeck ? 1.6 + bob : 0, isDeck ? bp[2] : isP[2]);
    this.istri.root.rotation.y = 0;
    this.istri.setFace(istriExpr(f), mouthAt(D7_CUES, f));
    this.istri.armL.rotation.x = -0.05;
    this.istri.armR.rotation.x = -0.05;
    // Penduduk: HANYA di pantai menyambut saat kapal kembali (S6, f1048-1296)
    this.penduduk.forEach((p, i) => {
      const pp = PENDUDUK_POS[i];
      p.root.visible = f >= 1048 && f < 1296;
      p.root.position.set(pp[0], 0, pp[2]);
      p.root.rotation.y = 0;
      p.setFace(pendudukExpr(), mouthAt(i === 0 ? D5_CUES : [], f));
      p.armR.rotation.x = f >= 1048 && f < 1296 ? -2.2 + 0.3 * Math.sin(t * 5 + i) : -0.05; // melambai menyambut
      p.armL.rotation.x = -0.05;
    });
    return V(...c.look);
  }
}
