// Light presets IbuMisterius: malam biru gelap + fajar jingga pucat.
// Struktur sama dengan template trial3d-part2 (LIGHTS / LOOK), preset "night" dan "dawn".
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3;
  blob: C3; actorShadow: boolean;
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string;
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;
  bias: number; normalBias: number;
};
export const LIGHTS: Record<"night" | "dawn", LightPreset> = {
  night: {
    // bulan dingin sebagai key: az 40 (kanan depan), el 55 — wajah tetap terbaca, tidak remuk
    az: 40, el: 55,
    lit: [0.42, 0.48, 0.68], shade: [0.10, 0.12, 0.22], lift: [0.05, 0.06, 0.10], lambert: 0.35, sideK: 0.85, term: 0.2,
    charTint: [0.92, 0.96, 1.08], charShade: 0.82, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.85, 0.88, 1.05],
    blob: [0.5, 0.52, 0.66], actorShadow: false,
    top: "#060d24", hor: "#1a2c52", skyCurve: [0.0, 0.5, 0.6], fog: "#0d1830", fogNear: 10, fogFar: 110, sunDisc: "#dfe8ff",
    sunCol: "#b9ccff", sunI: 0.9, sky: "#2a3d66", ground: "#1c2438", hemiI: 0.6,
    bias: -0.00025, normalBias: 0.015,
  },
  dawn: {
    // fajar: matahari rendah dari timur (az -60), hangat pucat
    az: -60, el: 12,
    lit: [1.6, 1.05, 0.62], shade: [0.28, 0.26, 0.38], lift: [0.08, 0.08, 0.14], lambert: 0.35, sideK: 0.84, term: 0.15,
    charTint: [1.0, 0.9, 0.76], charShade: 0.86, charGrad: 0.08, bodyGrad: 0.22, sideTint: [0.9, 0.85, 0.95],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#7d8fc9", hor: "#f2b98a", skyCurve: [0.05, 0.6, 1.0], fog: "#e8a878", fogNear: 30, fogFar: 260, sunDisc: "#ffd9a8",
    sunCol: "#ffc98f", sunI: 3.2, sky: "#e8c4a8", ground: "#7a6a58", hemiI: 0.7,
    bias: -0.0004, normalBias: 0.02,
  },
};

export type WorldLook = {
  sky: { c: string[]; e: number[] };
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;
  sat: number;
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<"night" | "dawn", WorldLook> = {
  night: {
    sky: { c: ["#101d3d", "#0c1730", "#081226", "#050b1c", "#03060f"], e: [0, 3, 8, 16, 40] },
    water: { near: "#0e2038", mid: "#0a182c", far: "#0d1f3a", crest: "#2a4a72", trough: "#060d1c", glint: "#b9ccff", shade: [0.4, 0.46, 0.62] },
    cloud: { lit: "#3a4a72", mid: "#2a3a5e", shade: "#1a2440" },
    bounce: [0.02, 0.02, 0.05],
    sat: 1.0,
  },
  dawn: {
    sky: { c: ["#f2b98a", "#e8a878", "#d99a8c", "#a87a9e", "#6a6a9e"], e: [0, 4, 10, 20, 40] },
    water: { near: "#3a4a6e", mid: "#4a5a80", far: "#d4a48e", crest: "#e8b890", trough: "#2a3648", glint: "#ffe2b0", shade: [0.45, 0.48, 0.66] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.05, 0.03, 0.01],
    sat: 1.08,
  },
};
