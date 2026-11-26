// Timing for Drama Siang Bolong (30 fps, 1920x1080, 900 frames = 30s).
// Dialogue audio durations measured after trim + loudnorm to -15.2 LUFS.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 900;

// Each line: speaker, audio file, start frame, duration in seconds (measured).
export const LINES = [
	{ id: 1, speaker: "BIMA", color: "#2E7D5B", audio: "audio/drama/line1-bima.mp3", start: 15, seconds: 3.0, text: "Sabar ya Meng, tanggal tua nih, kita makan tahu dulu.", side: "left", top: 180 },
	{ id: 2, speaker: "MENG", color: "#E8832A", audio: "audio/drama/line2-meng.mp3", start: 135, seconds: 3.845, text: "Tahu? Kamu mau merusak reputasiku sebagai penguasa gang ini?!", side: "right", top: 64 },
	{ id: 3, speaker: "MENG", color: "#E8832A", audio: "audio/drama/line3-meng.mp3", start: 315, seconds: 4.322, text: "Kalau nggak ada ikan kembung, minimal tukar tambah sama cicak karet ini deh.", side: "right", top: 64 },
	{ id: 4, speaker: "BIMA", color: "#2E7D5B", audio: "audio/drama/line4-bima.mp3", start: 465, seconds: 4.006, text: "Meng, tukang warung mana yang terima cicak karet buat ditukar ikan?!", side: "left", top: 64 },
	{ id: 5, speaker: "BIMA", color: "#2E7D5B", audio: "audio/drama/line5-bima.mp3", start: 615, seconds: 3.256, text: "Bercanda, ini jatah raja sudah kubelikan dari kemarin.", side: "right", top: 64 },
	{ id: 6, speaker: "MENG", color: "#E8832A", audio: "audio/drama/line6-meng.mp3", start: 735, seconds: 3.513, text: "Nah gitu dong, kamu memang pelayan terbaikku, Bim!", side: "left", top: 64 },
];

for (const line of LINES) {
	line.frames = Math.ceil(line.seconds * FPS);
	line.end = line.start + line.frames;
}

export const SCENES = [
	{ id: 1, from: 0, frames: 300, img: "drama/scene1.png" },
	{ id: 2, from: 300, frames: 300, img: "drama/scene2.png" },
	{ id: 3, from: 600, frames: 300, img: "drama/scene3.png" },
];

// End card: iris-out starts at frame 840 (second 28), per storyboard.
export const ENDCARD_FROM = 840;
export const ENDCARD_FRAMES = TOTAL_FRAMES - ENDCARD_FROM;
