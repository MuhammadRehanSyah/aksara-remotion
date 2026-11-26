// Scene timing derived from measured narration audio (30 fps).
// Each scene = ceil(audioSeconds * 30) + 9 frames tail (0.3s breathing room).
export const FPS = 30;

export const SCENES = [
	{ id: 1, audio: "audio/scene1.mp3", seconds: 7.826553 },
	{ id: 2, audio: "audio/scene2.mp3", seconds: 8.10415 },
	{ id: 3, audio: "audio/scene3.mp3", seconds: 6.835283 },
	{ id: 4, audio: "audio/scene4.mp3", seconds: 15.063379 },
	{ id: 5, audio: "audio/scene5.mp3", seconds: 7.664989 },
	{ id: 6, audio: "audio/scene6.mp3", seconds: 15.556304 },
];

const TAIL = 9;
let offset = 0;
for (const s of SCENES) {
	s.frames = Math.ceil(s.seconds * FPS) + TAIL;
	s.from = offset;
	offset += s.frames;
}

export const TOTAL_FRAMES = offset; // 1888 frames = 62.93s
export const WIDTH = 1080;
export const HEIGHT = 1920;
