// Scene timing derived from measured narration audio (30 fps).
// Each scene = ceil(audioSeconds * 30) + 9 frames tail (0.3s breathing room).
// Audio: public/audio/reels003/sceneN.mp3, normalized to ~-15.2 LUFS.
export const FPS = 30;

export const SCENES = [
	{ id: 1, audio: "audio/reels003/scene1.mp3", seconds: 5.055238 },
	{ id: 2, audio: "audio/reels003/scene2.mp3", seconds: 8.897438 },
	{ id: 3, audio: "audio/reels003/scene3.mp3", seconds: 8.491542 },
	{ id: 4, audio: "audio/reels003/scene4.mp3", seconds: 7.881088 },
	{ id: 5, audio: "audio/reels003/scene5.mp3", seconds: 11.862245 },
	{ id: 6, audio: "audio/reels003/scene6.mp3", seconds: 14.089252 },
];

const TAIL = 9;
let offset = 0;
for (const s of SCENES) {
	s.frames = Math.ceil(s.seconds * FPS) + TAIL;
	s.from = offset;
	offset += s.frames;
}

export const TOTAL_FRAMES = offset; // 1744 frames = 58.13s
export const WIDTH = 1080;
export const HEIGHT = 1920;
