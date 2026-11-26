// Word timings from local transcription (faster-whisper tiny, Indonesian)
// of flow-uji-coba-001-serum-14-nov-2026.mp4, 14 Nov 2026.
// Dialog: "Serum ini ringan banget, cepat menyerap, dan hasilnya
// kelihatan dalam seminggu." (0.00-7.08s; speech ends before the 10s clip ends)
// Note: ASR heard "menyerab"; corrected to "menyerap" to match the known
// prompt theme ("ringan dan cepat menyerap").

export const WORDS = [
	{ text: "Serum", start: 0.0, end: 1.0 },
	{ text: "ini", start: 1.0, end: 1.48 },
	{ text: "ringan", start: 1.48, end: 1.92 },
	{ text: "banget,", start: 1.92, end: 2.58 },
	{ text: "cepat", start: 3.08, end: 3.3 },
	{ text: "menyerap,", start: 3.3, end: 3.96 },
	{ text: "dan", start: 4.6, end: 4.76 },
	{ text: "hasilnya", start: 4.76, end: 5.42 },
	{ text: "kelihatan", start: 5.42, end: 5.94 },
	{ text: "dalam", start: 5.94, end: 6.18 },
	{ text: "seminggu.", start: 6.18, end: 7.08 },
];

// Display windows (seconds) per caption chunk, with small padding so the
// text never pops in/out mid-word.
export const CHUNKS = [
	{ words: [0, 1, 2, 3], from: 0, to: 2.92 },
	{ words: [4, 5], from: 2.92, to: 4.33 },
	{ words: [6, 7, 8], from: 4.33, to: 6.04 },
	{ words: [9, 10], from: 6.04, to: 7.5 },
];
