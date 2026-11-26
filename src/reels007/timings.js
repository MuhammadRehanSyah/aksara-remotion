// Scene timing derived from measured narration audio (30 fps).
// Each scene = ceil(audioSeconds * 30) + 9 frames tail (0.3s breathing room).
// Audio: public/audio/reels007/sceneN.mp3, normalized to ~-15.2 LUFS.
// Measured durations (ffprobe, after loudnorm):
//   scene1 10.964s, scene2 14.392s, scene3 13.219s, scene4 12.714s, scene5 5.193s
// Narration verified by faster-whisper tiny transcription (lang=id, p=1.00).
export const FPS = 30;

export const SCENES = [
	{ id: 1, audio: "audio/reels007/scene1.mp3", seconds: 10.964 },
	{ id: 2, audio: "audio/reels007/scene2.mp3", seconds: 14.392 },
	{ id: 3, audio: "audio/reels007/scene3.mp3", seconds: 13.219 },
	{ id: 4, audio: "audio/reels007/scene4.mp3", seconds: 12.714 },
	{ id: 5, audio: "audio/reels007/scene5.mp3", seconds: 5.193 },
];

const TAIL = 9;
let offset = 0;
for (const s of SCENES) {
	s.frames = Math.ceil(s.seconds * FPS) + TAIL;
	s.from = offset;
	offset += s.frames;
}

export const TOTAL_FRAMES = offset; // 1741 frames = 58.03s
export const WIDTH = 1080;
export const HEIGHT = 1920;
