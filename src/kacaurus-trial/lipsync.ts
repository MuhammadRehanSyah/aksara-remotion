// Lip-sync Rhubarb (skill rhubarb_lipsync) untuk KacaurusTrial v2.
// Dibuat dari VO asli (l1/l2/l3) via: rhubarb -f json + rhubarb_to_cues.py
// (--start 5.0/12.0/21.0, --fps 24). Run bentuk 1 frame sudah digabung ke
// run sebelumnya (min-hold 2 frame) supaya mulut tidak berkedip.
// L1 Bapak f120-167, L2 Anak f288-383, L3 Bapak f504-552. Di luar itu mulut "X".
export type Viseme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";
export type Cue = { frame: number; mouth: Viseme };

export const BAPAK_CUES: Cue[] = [
  { frame: 120, mouth: "X" },
  { frame: 124, mouth: "C" },
  { frame: 126, mouth: "F" },
  { frame: 132, mouth: "B" },
  { frame: 134, mouth: "F" },
  { frame: 137, mouth: "A" },
  { frame: 140, mouth: "H" },
  { frame: 143, mouth: "B" },
  { frame: 150, mouth: "C" },
  { frame: 152, mouth: "B" },
  { frame: 155, mouth: "H" },
  { frame: 158, mouth: "B" },
  { frame: 163, mouth: "X" },
  { frame: 504, mouth: "X" },
  { frame: 512, mouth: "A" },
  { frame: 514, mouth: "C" },
  { frame: 517, mouth: "B" },
  { frame: 530, mouth: "A" },
  { frame: 533, mouth: "A" },
  { frame: 535, mouth: "B" },
  { frame: 539, mouth: "C" },
  { frame: 544, mouth: "B" },
  { frame: 546, mouth: "X" },
];

export const ANAK_CUES: Cue[] = [
  { frame: 288, mouth: "X" },
  { frame: 293, mouth: "B" },
  { frame: 298, mouth: "A" },
  { frame: 301, mouth: "C" },
  { frame: 303, mouth: "B" },
  { frame: 308, mouth: "A" },
  { frame: 310, mouth: "B" },
  { frame: 314, mouth: "B" },
  { frame: 316, mouth: "A" },
  { frame: 320, mouth: "A" },
  { frame: 322, mouth: "C" },
  { frame: 324, mouth: "X" },
  { frame: 336, mouth: "B" },
  { frame: 340, mouth: "B" },
  { frame: 342, mouth: "A" },
  { frame: 346, mouth: "A" },
  { frame: 349, mouth: "B" },
  { frame: 353, mouth: "C" },
  { frame: 356, mouth: "B" },
  { frame: 359, mouth: "C" },
  { frame: 364, mouth: "A" },
  { frame: 366, mouth: "B" },
  { frame: 379, mouth: "X" },
];

/** Bentuk mulut di frame f: cue terakhir yang <= f, atau "X" bila belum mulai. */
export const mouthAt = (cues: Cue[], f: number): Viseme => {
  let m: Viseme = "X";
  for (const c of cues) {
    if (c.frame <= f) m = c.mouth;
    else break;
  }
  return m;
};
