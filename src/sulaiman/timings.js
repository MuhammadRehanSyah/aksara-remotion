export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 900; // exactly 30.000 s

// Scenes overlap by 12 frames; the incoming scene fades in over the outgoing
// one (crossfade) with a whoosh SFX on each boundary.
export const SCENES = [
	{
		id: "s1",
		from: 0,
		frames: 267,
		img: "sulaiman/scene1.png",
		audio: "audio/sulaiman/line1.mp3",
		audioFrom: 15,
		audioFrames: 229, // 7.613 s trimmed
		drift: 1,
	},
	{
		id: "s2",
		from: 255,
		frames: 252,
		img: "sulaiman/scene2.png",
		audio: "audio/sulaiman/line2.mp3",
		audioFrom: 265,
		audioFrames: 224, // 7.446 s trimmed
		drift: -1,
	},
	{
		id: "s3",
		from: 495,
		frames: 207,
		img: "sulaiman/scene3.png",
		audio: "audio/sulaiman/line3.mp3",
		audioFrom: 505,
		audioFrames: 159, // 5.283 s trimmed
		drift: 1,
	},
	{
		id: "s4",
		from: 690,
		frames: 210,
		img: "sulaiman/scene4.png",
		audio: "audio/sulaiman/line4.mp3",
		audioFrom: 700,
		audioFrames: 166, // 5.503 s trimmed
		drift: -1,
	},
];

// On-screen text, revealed word by word. `start`/`interval` are in local
// scene frames. hi = highlighted keyword (yellow).
export const TEXTS = [
	{
		lines: [
			[{ w: "NABI" }, { w: "SULAIMAN", hi: true }],
			[{ w: "DAN" }, { w: "PASUKANNYA" }, { w: "YANG" }, { w: "BESAR" }],
		],
		start: 20,
		interval: 26,
	},
	{
		lines: [
			[{ w: "MASUKLAH" }, { w: "KE" }, { w: "SARANG", hi: true }, { w: "KALIAN," }],
			[{ w: "AGAR" }, { w: "TIDAK" }, { w: "TERINJAK!", hi: true }],
		],
		start: 15,
		interval: 24,
	},
	{
		lines: [
			[{ w: "BELIAU" }, { w: "MEMAHAMI" }],
			[{ w: "BAHASA", hi: true }, { w: "HEWAN", hi: true }],
		],
		start: 15,
		interval: 30,
	},
	{
		lines: [
			[{ w: "BERSYUKUR" }, { w: "ATAS" }],
			[{ w: "NIKMAT", hi: true }, { w: "ALLAH", hi: true }],
		],
		start: 15,
		interval: 30,
	},
];

export const WHOOSH_FRAMES = [246, 486, 681];
export const POP_FRAMES = [20, 270, 510, 705];
export const ENDCARD_FROM = 830;
export const ENDCARD_FRAMES = 70;
export const REFBOX_FROM = 270;
