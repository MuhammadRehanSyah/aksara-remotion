// Scene timing derived from measured narration audio (30 fps).
// Each scene = ceil(audioSeconds * 30) + 9 frames tail (0.3s breathing room).
// Audio: public/audio/reels006/sceneN.mp3, normalized to ~-15.2 LUFS.
// Measured durations (ffprobe, after loudnorm):
//   scene1 8.390s, scene2 8.745s, scene3 13.007s, scene4 7.230s, scene5 8.526s
// Narration verified by faster-whisper tiny transcription (lang=id, p=1.00).
export const FPS = 30;

export const SCENES = [
	{ id: 1, audio: "audio/reels006/scene1.mp3", seconds: 8.390 },
	{ id: 2, audio: "audio/reels006/scene2.mp3", seconds: 8.745 },
	{ id: 3, audio: "audio/reels006/scene3.mp3", seconds: 13.007 },
	{ id: 4, audio: "audio/reels006/scene4.mp3", seconds: 7.230 },
	{ id: 5, audio: "audio/reels006/scene5.mp3", seconds: 8.526 },
];

const TAIL = 9;
let offset = 0;
for (const s of SCENES) {
	s.frames = Math.ceil(s.seconds * FPS) + TAIL;
	s.from = offset;
	offset += s.frames;
}

export const TOTAL_FRAMES = offset; // 1424 frames = 47.47s
export const WIDTH = 1080;
export const HEIGHT = 1920;
