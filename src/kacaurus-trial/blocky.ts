// Tokoh kotak-kotak 3D ORIGINAL (gaya Kacaurus: kepala kotak besar, rambut kotak, badan kotak).
// BUKAN kartu datar — tokoh dibangun dari BoxGeometry three.js, wajah digambar di tekstur kanvas
// pada sisi depan kepala (alis + mata + mulut berubah per ekspresi).
import * as THREE from "three";
import { ctex } from "./paint";
import { lam } from "./build";
import type { Expr } from "./story";
import type { Viseme } from "./lipsync";

const INK = "#241726";
const VISEMES: Viseme[] = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];

/** Gambar wajah 256x256 pada kanvas: latar kulit + alis/mata/mulut per ekspresi (+ kumis Bapak).
 * Mulut: "X" = mulut default ekspresi; A–H = bentuk viseme Rhubarb (lip-sync v2). */
const faceTexture = (key: string, expr: Expr, skin: string, mustache: boolean, mouthV: Viseme) =>
  ctex(key, 256, 256, (g) => {
    g.fillStyle = skin;
    g.fillRect(0, 0, 256, 256);
    // bayangan lembut di tepi (kepala terasa bulat sedikit, bukan datar total)
    const gr = g.createRadialGradient(128, 118, 60, 128, 128, 150);
    gr.addColorStop(0, "rgba(0,0,0,0)");
    gr.addColorStop(1, "rgba(0,0,0,0.10)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = INK;
    g.fillStyle = INK;
    g.lineCap = "round";
    const eyeY = 104, exL = 84, exR = 172, eyeR = 13;
    const brow = (x: number, y: number, a0: number, a1: number) => {
      // alis: garis tebal miring dari (x-22,y+a0) ke (x+22,y+a1)
      g.lineWidth = 9;
      g.beginPath();
      g.moveTo(x - 22, y + a0);
      g.lineTo(x + 22, y + a1);
      g.stroke();
    };
    const dotEye = (x: number, y: number) => {
      g.beginPath();
      g.ellipse(x, y, 9, 12, 0, 0, Math.PI * 2);
      g.fill();
    };
    const happyEye = (x: number, y: number) => {
      // mata senyum: busur menghadap ke bawah (seperti huruf U terbalik)
      g.lineWidth = 9;
      g.beginPath();
      g.arc(x, y + 8, 16, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
    };
    const wideEye = (x: number, y: number) => {
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.ellipse(x, y, 16, 18, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.stroke();
      g.fillStyle = INK;
      g.beginPath();
      g.arc(x, y + 2, 7, 0, Math.PI * 2);
      g.fill();
    };
    const mouth = (kind: "frown" | "smile" | "straight" | "open") => {
      g.lineWidth = 9;
      g.strokeStyle = INK;
      g.beginPath();
      if (kind === "frown") g.arc(128, 196, 26, Math.PI * 1.15, Math.PI * 1.85);
      else if (kind === "smile") g.arc(128, 168, 30, Math.PI * 0.15, Math.PI * 0.85);
      else if (kind === "straight") { g.moveTo(106, 184); g.lineTo(150, 184); }
      else if (kind === "open") {
        g.fillStyle = "#5a1e28";
        g.beginPath();
        g.ellipse(128, 188, 16, 20, 0, 0, Math.PI * 2);
        g.fill();
        return;
      }
      g.stroke();
    };
    const mouthViseme = (v: Viseme) => {
      // "X" = mulut default ekspresi (seperti v1); A–H = viseme Rhubarb.
      if (v === "X") {
        if (expr === "worried") mouth("frown");
        else if (expr === "smile") mouth("smile");
        else if (expr === "surprised") mouth("open");
        else mouth("straight");
        return;
      }
      g.strokeStyle = INK;
      const fillDark = () => { g.fillStyle = "#5a1e28"; };
      switch (v) {
        case "A": // tutup (P/B/M): garis lurus
          g.lineWidth = 9;
          g.beginPath(); g.moveTo(106, 184); g.lineTo(150, 184); g.stroke();
          break;
        case "B": // agak terbuka: celah kecil
          fillDark();
          g.beginPath(); g.ellipse(128, 184, 13, 4, 0, 0, Math.PI * 2); g.fill();
          break;
        case "C": // terbuka lebar-senyum (E)
          fillDark();
          g.beginPath(); g.ellipse(128, 184, 23, 11, 0, 0, Math.PI * 2); g.fill();
          break;
        case "D": // terbuka lebar (AA)
          fillDark();
          g.beginPath(); g.ellipse(128, 188, 16, 21, 0, 0, Math.PI * 2); g.fill();
          break;
        case "E": // bulat (O)
          fillDark();
          g.beginPath(); g.arc(128, 186, 13, 0, Math.PI * 2); g.fill();
          break;
        case "F": // bulat kecil (U)
          fillDark();
          g.beginPath(); g.arc(128, 185, 8.5, 0, Math.PI * 2); g.fill();
          break;
        case "G": // gigi + bibir bawah (F/V)
          g.fillStyle = "#f4f1ea";
          g.fillRect(108, 172, 40, 13);
          g.lineWidth = 3;
          g.strokeRect(108, 172, 40, 13);
          g.beginPath(); g.moveTo(128, 172); g.lineTo(128, 185); g.stroke();
          g.lineWidth = 6;
          g.beginPath(); g.moveTo(110, 192); g.lineTo(146, 192); g.stroke();
          break;
        case "H": // lidah naik (L)
          fillDark();
          g.beginPath(); g.ellipse(128, 186, 15, 14, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = "#d98a8a";
          g.beginPath(); g.ellipse(128, 190, 10, 7, 0, 0, Math.PI * 2); g.fill();
          break;
      }
    };
    switch (expr) {
      case "worried":
        // alis miring ke dalam (ujung dalam turun), mata lebar, mulut cemberut kecil
        brow(exL, 74, 6, -6);
        brow(exR, 74, -6, 6);
        wideEye(exL, eyeY);
        wideEye(exR, eyeY);
        mouthViseme(mouthV);
        break;
      case "smile":
        // alis naik, mata senyum (busur), mulut senyum lebar
        brow(exL, 70, -4, -8);
        brow(exR, 70, -8, -4);
        happyEye(exL, eyeY);
        happyEye(exR, eyeY);
        mouthViseme(mouthV);
        break;
      case "surprised":
        brow(exL, 66, -8, -10);
        brow(exR, 66, -10, -8);
        wideEye(exL, eyeY);
        wideEye(exR, eyeY);
        mouthViseme(mouthV);
        break;
      default: // neutral
        brow(exL, 72, 0, -2);
        brow(exR, 72, -2, 0);
        dotEye(exL, eyeY);
        dotEye(exR, eyeY);
        mouthViseme(mouthV);
    }
    if (mustache) {
      // kumis abu-abu: dua sapuan tebal di bawah hidung
      g.strokeStyle = "#8a8a8a";
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(128, 152);
      g.quadraticCurveTo(104, 158, 88, 148);
      g.stroke();
      g.beginPath();
      g.moveTo(128, 152);
      g.quadraticCurveTo(152, 158, 168, 148);
      g.stroke();
    }
  });

export type CharOpts = {
  name: string; // kunci tekstur unik
  scale?: number; // tinggi relatif (1 = Bapak 1,70 m)
  skin: string;
  shirt: string;
  pants: string;
  hairColor: string;
  hairStyle: "peci" | "flat" | "spiky";
  mustache?: boolean;
};

/** Tokoh kotak: kepala + rambut/peci + badan + lengan (pivot bahu) + kaki (pivot pinggul). */
export class BlockyChar {
  root = new THREE.Group();
  head = new THREE.Group(); // pivot di leher (untuk angguk / toleh)
  armL = new THREE.Group();
  armR = new THREE.Group();
  legL = new THREE.Group();
  legR = new THREE.Group();
  private faceMats: Record<Expr, Record<Viseme, THREE.MeshLambertMaterial>>;
  private expr: Expr = "neutral";
  private mouth: Viseme = "X";

  constructor(o: CharOpts) {
    const s = o.scale ?? 1;
    const skinM = lam(`skin_${o.name}`, () => ({ color: o.skin }));
    const shirtM = lam(`shirt_${o.name}`, () => ({ color: o.shirt }));
    const pantsM = lam(`pants_${o.name}`, () => ({ color: o.pants }));
    const hairM = lam(`hair_${o.name}`, () => ({ color: o.hairColor }));
    // tekstur wajah per ekspresi x bentuk mulut (sisi depan kepala).
    // 4 ekspresi x 9 viseme = 36 tekstur 256x256 per tokoh (dibuat sekali di awal).
    const exprs: Expr[] = ["neutral", "worried", "smile", "surprised"];
    this.faceMats = {} as Record<Expr, Record<Viseme, THREE.MeshLambertMaterial>>;
    for (const e of exprs) {
      this.faceMats[e] = {} as Record<Viseme, THREE.MeshLambertMaterial>;
      for (const m of VISEMES) {
        this.faceMats[e][m] = new THREE.MeshLambertMaterial({
          map: faceTexture(`face_${o.name}_${e}_${m}`, e, o.skin, !!o.mustache, m),
        });
      }
    }
    // ---- kaki (pivot di pinggul y=0.72) ----
    const legGeo = new THREE.BoxGeometry(0.15, 0.72, 0.16);
    for (const [grp, x] of [[this.legL, -0.11], [this.legR, 0.11]] as const) {
      grp.position.set(x, 0.72, 0);
      const m = new THREE.Mesh(legGeo, pantsM);
      m.position.y = -0.36;
      m.castShadow = true;
      grp.add(m);
      this.root.add(grp);
    }
    // ---- badan (0.52 x 0.58 x 0.30), pusat y=1.01 ----
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.58, 0.3), shirtM);
    torso.position.y = 1.01;
    torso.castShadow = true;
    this.root.add(torso);
    // kancing baju (2 titik kecil di depan badan)
    const btnM = lam(`btn_${o.name}`, () => ({ color: "#e8e4d8" }));
    for (const y of [1.08, 0.94]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), btnM);
      b.position.set(0, y, 0.16);
      this.root.add(b);
    }
    // ---- lengan (pivot di bahu y=1.26, x=±0.32) ----
    const armGeo = new THREE.BoxGeometry(0.13, 0.55, 0.14);
    for (const [grp, x] of [[this.armL, -0.32], [this.armR, 0.32]] as const) {
      grp.position.set(x, 1.26, 0);
      const m = new THREE.Mesh(armGeo, shirtM);
      m.position.y = -0.26;
      m.castShadow = true;
      grp.add(m);
      // tangan: bola kecil kulit di ujung lengan
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), skinM);
      hand.position.y = -0.55;
      grp.add(hand);
      this.root.add(grp);
    }
    // ---- kepala (pivot di leher y=1.30), kotak 0.44 x 0.40 x 0.40 ----
    this.head.position.y = 1.3;
    const headGeo = new THREE.BoxGeometry(0.44, 0.4, 0.4);
    // urutan material BoxGeometry: +x, -x, +y, -y, +z (depan = wajah), -z
    const head = new THREE.Mesh(headGeo, [skinM, skinM, skinM, skinM, this.faceMats.neutral.X, skinM]);
    head.position.y = 0.2;
    head.castShadow = true;
    this.head.add(head);
    // rambut / peci di atas kepala
    if (o.hairStyle === "peci") {
      // peci hitam: kotak datar di atas kepala + sedikit miring
      const peci = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.42), lam(`peci_${o.name}`, () => ({ color: "#1e1e26" })));
      peci.position.y = 0.43;
      peci.rotation.z = 0.03;
      this.head.add(peci);
      // rambut abu-abu tipis di sisi kepala (di bawah peci)
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.42), hairM);
      side.position.y = 0.36;
      this.head.add(side);
    } else if (o.hairStyle === "flat") {
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.42), hairM);
      hair.position.y = 0.42;
      this.head.add(hair);
      // poni depan
      const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.06), hairM);
      fringe.position.set(0, 0.36, 0.2);
      this.head.add(fringe);
    } else {
      // spiky: tiga balok kecil di atas kepala
      for (const x of [-0.14, 0, 0.14]) {
        const spike = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.12), hairM);
        spike.position.set(x, 0.44, 0);
        spike.rotation.z = x * 0.5;
        this.head.add(spike);
      }
    }
    this.root.add(this.head);
    this.root.scale.setScalar(s);
  }

  /** Ganti wajah: ekspresi (alis/mata) + bentuk mulut viseme (lip-sync). "X" = mulut default ekspresi. */
  setFace(e: Expr, m: Viseme) {
    if (e === this.expr && m === this.mouth) return;
    this.expr = e;
    this.mouth = m;
    const head = this.head.children[0] as THREE.Mesh;
    const mats = head.material as THREE.Material[];
    mats[4] = this.faceMats[e][m];
    head.material = mats;
  }

  setExpr(e: Expr) {
    this.setFace(e, "X");
  }
}
