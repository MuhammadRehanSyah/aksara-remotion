// Soft Skill — 30 detik vertikal dari 3 klip Flow (10 detik @ 24fps).
// Total 696 frame @ 24fps = 29.0 detik (3x10 detik dikurangi 2x crossfade 0.5 detik).
export const FPS = 24;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 696; // 29.0s

// Scenes overlap by 12 frames (0.5s crossfade) at each boundary.
export const SCENES = [
	{ id: "s1", clip: "softskill/clip1.mp4", from: 0, frames: 240, zoom: [1.04, 1.1] },
	{ id: "s2", clip: "softskill/clip2.mp4", from: 228, frames: 240, zoom: [1.09, 1.03] },
	{ id: "s3", clip: "softskill/clip3.mp4", from: 456, frames: 240, zoom: [1.03, 1.09] },
];

// Narasi terukur setelah trim + loudnorm -15.2 LUFS (suara vg_id_m41).
// line1 10.002s (240f) dari frame 6, line2 6.297s (151f) dari frame 252,
// line3 9.740s (234f, speed 110) dari frame 444 — berakhir frame 678.
export const NARRATION = [
	{ file: "audio/softskill/line1.mp3", from: 6, frames: 240 },
	{ file: "audio/softskill/line2.mp3", from: 252, frames: 151 },
	{ file: "audio/softskill/line3.mp3", from: 444, frames: 234 },
];

// Teks layar per adegan, dalam frame lokal adegan. hi = kata kunci kuning.
export const PHRASES = [
	[
		{ words: [{ w: "DITERIMA" }, { w: "KERJA", hi: true }], at: 6, dur: 56 },
		{ words: [{ w: "BERTAHAN," }, { w: "NAIK", hi: true }, { w: "JABATAN" }], at: 64, dur: 60 },
		{ words: [{ w: "1." }, { w: "KOMUNIKASI", hi: true }], at: 126, dur: 56 },
		{ words: [{ w: "IDE" }, { w: "JELAS", hi: true }], at: 184, dur: 50 },
	],
	[
		{ words: [{ w: "DIPERCAYA", hi: true }], at: 24, dur: 46 },
		{ words: [{ w: "DIANDALKAN", hi: true }], at: 72, dur: 46 },
		{ words: [{ w: "ENAK" }, { w: "DIAJAK" }, { w: "KERJA", hi: true }], at: 120, dur: 58 },
	],
	[
		{ words: [{ w: "MANAJEMEN" }, { w: "WAKTU", hi: true }], at: -12, dur: 58 },
		{ words: [{ w: "TEPAT" }, { w: "WAKTU", hi: true }], at: 48, dur: 52 },
		{ words: [{ w: "DIPEGANG" }, { w: "JANJINYA", hi: true }], at: 102, dur: 52 },
		{ words: [{ w: "SOFT" }, { w: "SKILL" }, { w: "MEMBEDAKANMU", hi: true }], at: 156, dur: 36 },
	],
];

export const LABELS = ["1 • KOMUNIKASI", "2 • KERJA SAMA TIM", "3 • MANAJEMEN WAKTU"];
export const LABEL_AT = [10, 10, 10];

export const ENDCARD_FROM = 648;
export const ENDCARD_FRAMES = TOTAL_FRAMES - ENDCARD_FROM; // 48 frame

export const TRANSITION_SFX = [
	{ at: 228, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 456, file: "audio/sulaiman/sparkle.mp3", vol: 0.5, dur: 14 },
];

// Pop SFX di setiap pergantian frasa (frame global).
export const PHRASE_POPS = [6, 64, 126, 184, 252, 300, 348, 444, 504, 558, 612];
