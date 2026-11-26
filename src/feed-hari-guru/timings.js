// Motion flyer Hari Guru Nasional 2026 — Feed @aksaracademy
// BRIEF FINAL: 1080x1080, 30 fps, 15 detik = 450 frame.
// Urutan: 0-2s zoom foto, 2-5s headline, 5-8s tema, 8-12s tanggal+logo,
// 12-15s hold + aksen kuning bergerak.
// Motion system: LottieFiles (Corporate base + Energetic hook, stagger
// total <500ms, 3 layers primary/secondary/ambient, 1/3 rule) +
// Emil Kowalski (ease-out cubic-bezier(0.23,1,0.32,1), never scale(0),
// entrance from scale 0.95 + opacity 0, transform/opacity only).
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 450; // 15 detik
