// Scene timing derived from measured narration audio (30 fps).
// Each scene = ceil(audioSeconds * 30) + 9 frames tail (0.3s breathing room).
// Audio: public/audio/reels004/sceneN.mp3, normalized to ~-15.2 LUFS.
// Motion skills applied: LottieFiles (Corporate base, Energetic hook/CTA,
// three motion layers, stagger total <500ms), charlie947 motion-graphics-pack
// (brand.md + MOTION.md read first, facts first, mid-shot frame check),
// Emil Kowalski (key press scale 0.97, 100-160ms, ease-out, never scale(0)).
export const FPS = 30;

export const SCENES = [
	{ id: 1, audio: "audio/reels004/scene1.mp3", seconds: 7.871 },
	{ id: 2, audio: "audio/reels004/scene2.mp3", seconds: 11.283 },
	{ id: 3, audio: "audio/reels004/scene3.mp3", seconds: 9.9 },
	{ id: 4, audio: "audio/reels004/scene4.mp3", seconds: 8.683 },
	{ id: 5, audio: "audio/reels004/scene5.mp3", seconds: 8.732 },
	{ id: 6, audio: "audio/reels004/scene6.mp3", seconds: 9.727 },
	{ id: 7, audio: "audio/reels004/scene7.mp3", seconds: 12.15 },
];

const TAIL = 9;
let offset = 0;
for (const s of SCENES) {
	s.frames = Math.ceil(s.seconds * FPS) + TAIL;
	s.from = offset;
	offset += s.frames;
}

export const TOTAL_FRAMES = offset; // 2116 frames = 70.53s
export const WIDTH = 1080;
export const HEIGHT = 1920;
