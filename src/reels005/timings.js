// Scene timing derived from measured narration audio (30 fps).
// Each scene = ceil(audioSeconds * 30) + 9 frames tail (0.3s breathing room).
// Audio: public/audio/reels005/sceneN.mp3, normalized to ~-15.2 LUFS.
// Measured durations (ffprobe, after loudnorm):
//   scene1 9.109s, scene2 7.826s, scene3 12.117s, scene4 6.753s, scene5 9.424s
// Narration verified by faster-whisper tiny transcription (lang=id, p=1.00).
export const FPS = 30;

export const SCENES = [
	{ id: 1, audio: "audio/reels005/scene1.mp3", seconds: 9.109 },
	{ id: 2, audio: "audio/reels005/scene2.mp3", seconds: 7.826 },
	{ id: 3, audio: "audio/reels005/scene3.mp3", seconds: 12.117 },
	{ id: 4, audio: "audio/reels005/scene4.mp3", seconds: 6.753 },
	{ id: 5, audio: "audio/reels005/scene5.mp3", seconds: 9.424 },
];

const TAIL = 9;
let offset = 0;
for (const s of SCENES) {
	s.frames = Math.ceil(s.seconds * FPS) + TAIL;
	s.from = offset;
	offset += s.frames;
}

export const TOTAL_FRAMES = offset; // 1404 frames = 46.8s
export const WIDTH = 1080;
export const HEIGHT = 1920;
