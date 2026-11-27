// KacaurusTrial world: interior warung kopi malam + 2 tokoh kotak-kotak 3D.
// Satu scene three.js; update(id, f, camera, scene) mem-pose semuanya (fungsi murni dari id + f).
// Memakai primitif build.ts (Batch/boxGeo/lam) + tekstur paint.ts — pola yang sama dengan
// RahasiaPintuIbuStoryboard, TAPI tokohnya mesh kotak 3D (blocky.ts), bukan kartu datar.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "./build";
import { ctex, planksHD } from "./paint";
import { NOINK } from "./ink";
import { BlockyChar } from "./blocky";
import {
  FPS, SHOTS, camAt, BAPAK_POS, ANAK_POS, COUNTER, LAMP_POS, CUP_POS, CUP2_POS, MONEY_POS,
  coinVisible, bapakCountArm, anakWalking, anakWalkPhase, anakPutCup, anakGesture,
  bapakNod, bapakExpr, anakExpr, lampSway, V3, smooth,
} from "./story";

const nightWindowTex = () =>
  ctex("warungNight", 256, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#0d1830");
    gr.addColorStop(1, "#1c2a4a");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    // bintang
    g.fillStyle = "#ffffff";
    for (const [x, y, r] of [[30, 40, 2], [90, 24, 1.5], [150, 60, 2], [210, 30, 1.5], [60, 110, 1.5], [180, 120, 2], [230, 90, 1.5]] as const) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    // bulan (lebih kecil, tidak mendominasi frame close-up)
    g.fillStyle = "#f4ead0";
    g.beginPath();
    g.arc(200, 55, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(244,234,208,0.25)";
    g.beginPath();
    g.arc(200, 55, 26, 0, Math.PI * 2);
    g.fill();
    // atap rumah tetangga
    g.fillStyle = "#0a1226";
    g.beginPath();
    g.moveTo(0, 256);
    g.lineTo(0, 210);
    g.lineTo(80, 180);
    g.lineTo(160, 210);
    g.lineTo(256, 190);
    g.lineTo(256, 256);
    g.closePath();
    g.fill();
  });

const chalkMenuTex = () =>
  ctex("chalkMenu", 256, 192, (g) => {
    g.fillStyle = "#20242a";
    g.fillRect(0, 0, 256, 192);
    g.strokeStyle = "#8a7a5a";
    g.lineWidth = 8;
    g.strokeRect(4, 4, 248, 184);
    g.fillStyle = "#f4f1ea";
    g.textAlign = "center";
    g.font = "bold 44px sans-serif";
    g.fillText("KOPI", 128, 66);
    g.font = "bold 34px sans-serif";
    g.fillText("5.000", 128, 112);
    g.font = "28px sans-serif";
    g.fillText("TEH  3.000", 128, 152);
  });

const steamTex = () =>
  ctex("steamSoft", 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgba(255,255,255,0.85)");
    gr.addColorStop(0.6, "rgba(255,255,255,0.25)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });

export class World {
  root = new THREE.Group();
  private bapak: BlockyChar;
  private anak: BlockyChar;
  private lamp = new THREE.Group();
  private lampLight: THREE.PointLight;
  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  private coins: THREE.Mesh[] = [];
  private handCup: THREE.Mesh;
  private cup2: THREE.Mesh;
  private steams: THREE.Sprite[] = [];
  private fog = new THREE.Fog("#0d1830", 10, 40);

  constructor() {
    const R = this.root;
    // ---- cahaya ----
    this.hemi = new THREE.HemisphereLight("#2a3d66", "#1c2438", 0.7);
    this.sun = new THREE.DirectionalLight("#b9ccff", 1.1); // cahaya bulan lewat jendela
    this.sun.position.set(-0.5, 3.2, -6);
    this.sun.target.position.set(0, 1, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    const sc = this.sun.shadow.camera;
    sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 0.5; sc.far = 20;
    this.sun.shadow.bias = -0.0005;
    R.add(this.hemi, this.sun, this.sun.target);
    this.lampLight = new THREE.PointLight("#ffb45e", 12, 10, 1.8);
    this.lampLight.position.set(LAMP_POS[0], LAMP_POS[1] - 0.3, LAMP_POS[2]);
    R.add(this.lampLight);
    const fillLight = new THREE.PointLight("#ff9a3e", 2.5, 5, 1.8);
    fillLight.position.set(0, 1.7, 0.4);
    R.add(fillLight);

    // ---- material ----
    const b = new Batch();
    const floorM = lam("floorPlanks", () => ({ map: planksHD(), color: "#9a7a52" }));
    const wallM = lam("wallWood", () => ({ map: planksHD(), color: "#8a6a48" }));
    const darkWoodM = lam("darkWood", () => ({ color: "#3a2a1c" }));
    const woodM = lam("wood", () => ({ color: "#5a3d28" }));
    const counterM = lam("counterWood", () => ({ color: "#6b4a2f" }));
    const porchM = lam("porchDark", () => ({ color: "#1a1410" }));

    // lantai ruangan + teras depan (agar kamera di luar ruangan tidak menghadap kehampaan)
    b.add(boxGeo(V(-3, -0.05, -3), V(3, 0, 3), 2), floorM);
    b.add(boxGeo(V(-4, -0.06, 3), V(4, -0.01, 7), 2), porchM);
    // dinding: belakang (z=-3, gap jendela x -1.8..-0.2, y 1.3..2.5), kiri (x=-3), kanan (x=3)
    const wall = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), 2), wallM);
    wall(-3, -1.8, 0, 3.2, -3, -2.85);
    wall(-0.2, 3, 0, 3.2, -3, -2.85);
    wall(-1.8, -0.2, 0, 1.3, -3, -2.85);
    wall(-1.8, -0.2, 2.5, 3.2, -3, -2.85);
    wall(-3, -2.85, 0, 3.2, -3, 3); // kiri
    wall(2.85, 3, 0, 3.2, -3, 3); // kanan
    b.add(boxGeo(V(-3, 3.2, -3), V(3, 3.35, 3), 2, true), wallM); // langit-langit
    // kusen jendela
    b.add(boxGeo(V(-1.85, 1.25, -3.05), V(-1.7, 2.55, -2.8), 1), darkWoodM);
    b.add(boxGeo(V(-0.3, 1.25, -3.05), V(-0.15, 2.55, -2.8), 1), darkWoodM);
    b.add(boxGeo(V(-1.8, 2.5, -3.05), V(-0.2, 2.6, -2.8), 1), darkWoodM);
    b.add(boxGeo(V(-1.8, 1.2, -3.05), V(-0.2, 1.3, -2.8), 1), darkWoodM);
    // kaca jendela: langit malam + bulan (tekstur kanvas)
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.2),
      new THREE.MeshBasicMaterial({ map: nightWindowTex(), toneMapped: false })
    );
    glass.position.set(-1, 1.9, -2.92);
    glass.layers.set(NOINK);
    R.add(glass);
    // papan menu kapur di dinding belakang kanan
    const menu = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.64),
      new THREE.MeshBasicMaterial({ map: chalkMenuTex(), toneMapped: false })
    );
    menu.position.set(1.5, 1.9, -2.82);
    menu.layers.set(NOINK);
    R.add(menu);
    const menuFrame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.74, 0.04), darkWoodM);
    menuFrame.position.set(1.5, 1.9, -2.86);
    R.add(menuFrame);

    // ---- konter (meja Bapak): panel + papan atas menjorok ----
    b.add(boxGeo(V(-1.2, 0, -1.45), V(1.2, 0.95, -0.95), 1), counterM);
    b.add(boxGeo(V(-1.3, 0.95, -1.5), V(1.3, 1.0, -0.9), 1), woodM);
    // rak dinding kanan (2 papan) + 3 toples
    b.add(boxGeo(V(1.6, 1.5, -2.9), V(2.8, 1.56, -2.7), 1), woodM);
    b.add(boxGeo(V(1.6, 1.9, -2.9), V(2.8, 1.96, -2.7), 1), woodM);
    const jarCols = ["#c98a2e", "#5a8a48", "#a83e2e"];
    jarCols.forEach((c, i) => {
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.28, 12),
        lam(`jar${i}`, () => ({ color: c }))
      );
      jar.position.set(1.85 + i * 0.45, 1.7, -2.8);
      jar.castShadow = true;
      R.add(jar);
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12),
        lam(`jarLid${i}`, () => ({ color: "#3a2a1c" }))
      );
      lid.position.set(1.85 + i * 0.45, 1.86, -2.8);
      R.add(lid);
    });
    // kompor kecil + panci di kiri belakang
    b.add(boxGeo(V(-2.6, 0, -2.6), V(-1.9, 0.45, -1.9), 1), darkWoodM);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.22, 0.3, 14),
      lam("potMetal", () => ({ color: "#8d949c" }))
    );
    pot.position.set(-2.25, 0.6, -2.25);
    pot.castShadow = true;
    R.add(pot);
    const potLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.04, 14),
      lam("potLid", () => ({ color: "#6a7078" }))
    );
    potLid.position.set(-2.25, 0.77, -2.25);
    R.add(potLid);
    // bangku kayu di kiri depan (hiasan set)
    b.add(boxGeo(V(-2.5, 0.45, -0.7), V(-1.9, 0.52, -0.1), 1), darkWoodM);
    for (const [lx, lz] of [[-2.45, -0.65], [-1.95, -0.65], [-2.45, -0.15], [-1.95, -0.15]] as const)
      b.add(boxGeo(V(lx, 0, lz), V(lx + 0.06, 0.45, lz + 0.06), 1), darkWoodM);
    b.build(R);

    // ---- lampu gantung (grup berayun dari langit-langit) ----
    this.lamp.position.set(0, 3.2, LAMP_POS[2]);
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.55, 8),
      new THREE.MeshLambertMaterial({ color: "#1e1e26" })
    );
    cord.position.y = -0.27;
    this.lamp.add(cord);
    const shadeM = lam("lampShade", () => ({ color: "#2e5a3a" }));
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 16, 1, true), shadeM);
    shade.position.y = -0.62;
    this.lamp.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 10),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.4, 1.2), toneMapped: false })
    );
    bulb.position.y = -0.72;
    bulb.layers.set(NOINK);
    this.lamp.add(bulb);
    R.add(this.lamp);

    // ---- gelas kopi di konter (Bapak) + piring kecil ----
    const cupM = lam("cupWhite", () => ({ color: "#e8e4d8" }));
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.1, 12), cupM);
    cup.position.set(CUP_POS[0], CUP_POS[1] + 0.05, CUP_POS[2]);
    R.add(cup);
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.015, 12), cupM);
    saucer.position.set(CUP_POS[0], CUP_POS[1], CUP_POS[2]);
    R.add(saucer);
    // gelas kedua (milik Anak, diletakkan di konter setelah f380)
    this.cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.1, 12), cupM);
    this.cup2.position.set(CUP2_POS[0], CUP2_POS[1] + 0.05, CUP2_POS[2]);
    this.cup2.visible = false;
    R.add(this.cup2);
    const saucer2 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.015, 12), cupM);
    saucer2.position.set(CUP2_POS[0], CUP2_POS[1], CUP2_POS[2]);
    saucer2.visible = false;
    this.cup2.userData.saucer = saucer2;
    R.add(saucer2);
    // tumpukan uang kertas di konter
    const money = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.04, 0.16),
      lam("moneyGreen", () => ({ color: "#4a7a3a" }))
    );
    money.position.set(MONEY_POS[0], MONEY_POS[1] + 0.02, MONEY_POS[2]);
    money.rotation.y = 0.2;
    R.add(money);
    // 3 koin emas (muncul bertahap saat Bapak menghitung)
    const coinM = lam("coinGold", () => ({ color: "#d8a83e" }));
    for (let i = 0; i < 3; i++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 12), coinM);
      coin.position.set(0.15 + i * 0.2, 1.01, -1.42);
      coin.visible = false;
      this.coins.push(coin);
      R.add(coin);
    }
    // ---- uap kopi (3 sprite naik bergiliran di atas gelas Bapak) ----
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: steamTex(), transparent: true, opacity: 0, depthWrite: false })
      );
      sp.layers.set(NOINK);
      sp.position.set(CUP_POS[0], 1.15, CUP_POS[2]);
      this.steams.push(sp);
      R.add(sp);
    }

    // ---- tokoh ----
    this.bapak = new BlockyChar({
      name: "bapak", scale: 1, skin: "#c99067", shirt: "#e8dcc0", pants: "#3b3f52",
      hairColor: "#8a8a8a", hairStyle: "peci", mustache: true,
    });
    this.bapak.root.position.set(...BAPAK_POS);
    R.add(this.bapak.root);
    this.anak = new BlockyChar({
      name: "anak", scale: 0.91, skin: "#f2c9a0", shirt: "#4a7a3a", pants: "#3b5b9a",
      hairColor: "#1e1e26", hairStyle: "flat",
    });
    this.anak.root.position.set(...ANAK_POS(288));
    R.add(this.anak.root);
    // gelas di tangan kanan Anak (terlihat sampai ia meletakkannya, f<380)
    this.handCup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.1, 12), cupM);
    this.handCup.position.set(0, -0.58, 0.06);
    this.anak.armR.add(this.handCup);
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS;
    // ---- kamera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(...c.look);
    cam.rotateZ(c.roll);
    cam.fov = c.fov;
    cam.near = 0.2;
    cam.far = 100;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    scene.fog = this.fog;
    scene.background = new THREE.Color("#0d1830");
    // ---- lampu: goyang pelan + pijar berdenyut halus ----
    this.lamp.rotation.z = lampSway(f);
    this.lampLight.intensity = 12 * (1 + 0.03 * Math.sin(t * 7.3) + 0.02 * Math.sin(t * 13.1));
    // ---- Bapak: di belakang konter, menghitung koin (shot B), menoleh ke Anak (shot C), angguk + senyum (shot D) ----
    this.bapak.setExpr(bapakExpr(f));
    this.bapak.armR.rotation.x = bapakCountArm(f);
    this.bapak.armL.rotation.x = -0.05 + 0.02 * Math.sin(t * 1.5);
    this.bapak.head.rotation.x = bapakNod(f);
    this.bapak.head.rotation.y = id === 3 ? 0.35 : 0;
    for (let i = 0; i < 3; i++) this.coins[i].visible = coinVisible(i, f);
    // ---- Anak: masuk dari kanan (f 288..360), letakkan gelas (f 360..400), isyarat (f 400..460) ----
    const ap = ANAK_POS(f);
    const walking = anakWalking(f);
    this.anak.root.position.set(
      ap[0],
      walking ? 0.02 * Math.abs(Math.sin(2 * Math.PI * anakWalkPhase(f))) : 0,
      ap[2]
    );
    this.anak.setExpr(anakExpr());
    // menghadap: saat jalan menghadap -x, setelah berhenti berputar 3/4 ke arah Bapak/kamera
    const turnU = smooth((f - 360) / 24);
    this.anak.root.rotation.y = -Math.PI / 2 + (-0.45 + Math.PI / 2) * turnU;
    if (walking) {
      const ph = 2 * Math.PI * anakWalkPhase(f);
      this.anak.legL.rotation.x = 0.45 * Math.sin(ph);
      this.anak.legR.rotation.x = -0.45 * Math.sin(ph);
      this.anak.armR.rotation.x = -0.9; // membawa gelas ke depan
      this.anak.armL.rotation.x = 0.15 * Math.sin(ph);
    } else {
      this.anak.legL.rotation.x = 0;
      this.anak.legR.rotation.x = 0;
      const put = anakPutCup(f);
      this.anak.armR.rotation.x = -0.9 + 0.8 * put; // turun meletakkan gelas
      this.handCup.visible = f < 380;
      this.cup2.visible = f >= 380;
      (this.cup2.userData.saucer as THREE.Mesh).visible = f >= 380;
    }
    this.anak.armL.rotation.x = -0.5 * anakGesture(f);
    // ---- uap kopi: 3 sprite naik bergiliran ----
    for (let i = 0; i < 3; i++) {
      const u = ((t * 0.35 + i / 3) % 1);
      const sp = this.steams[i];
      sp.position.set(
        CUP_POS[0] + 0.03 * Math.sin(t * 2 + i * 2),
        1.12 + u * 0.45,
        CUP_POS[2]
      );
      const sc = 0.12 + u * 0.28;
      sp.scale.set(sc, sc, 1);
      (sp.material as THREE.SpriteMaterial).opacity = 0.32 * (1 - u) * smooth(u / 0.12);
    }
    return V(...c.look);
  }
}
