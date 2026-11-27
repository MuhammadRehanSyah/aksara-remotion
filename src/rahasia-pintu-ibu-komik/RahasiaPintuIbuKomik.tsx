// RahasiaPintuIbuKomik — motion comic 90 detik (2700 frame @ 30 fps, 1080x1920).
// Adaptasi komik "Rahasia di Balik Pintu Ibu" memakai WAJAH ASLI komiknya (bukan
// karakter kartun 3D): 10 gambar halaman manga (896x1200) digerakkan dengan
// Ken Burns pelan (zoom/pan) + crossfade antar shot. BUKAN cutout — tokoh tidak
// dipotong dari latar (tepi akan kasar), gambar dibiarkan utuh.
// Audio: mix.wav yang SAMA dengan video 3D RahasiaPintuIbu (narasi m28 + musik
// + SFX, -15,02 LUFS) — dipakai ulang, tidak direkam ulang.
// Gambar 3:4 di frame 9:16 -> skala "cover" (1.6x) + pan; close-up diperbesar
// dari sumber 896 px sehingga lebih lembut — itu wajar, jangan diklaim tajam.
import React from "react";
import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
} from "remotion";

const W = 1080;
const H = 1920;
const SRC_W = 896;
const SRC_H = 1200;
// Cover: skala terbesar dari (W/SRC_W, H/SRC_H) agar gambar menutupi frame.
const COVER = Math.max(W / SRC_W, H / SRC_H); // 1.6

type Key = { fx: number; fy: number; s: number }; // titik sumber (px) di tengah layar + zoom tambahan
type Shot = {
	img: string;
	start: number;
	len: number;
	from: Key;
	to: Key;
};

// Koordinat dalam piksel sumber (896x1200). Wajah/detail utama per halaman:
// p1 Ibu+lentera ~(600,430), Raka kiri; p2 Ibu ~(625,370), kunci ~(565,700),
// jam 23.58 ~(320,300); p3 kamboja ~(755,1100); p4 pintu terlarang ~(560,500);
// p5 vas ~(380,700), cermin beriak ~(770,560); p6 Ibu berkaca-kaca ~(595,400),
// vas pecah ~(650,900); p7 foto+kunci ~(500,860), melati ~(110,1000);
// p8 potret Ayah ~(400,330), surat+jam pasir ~(800,750); p9 tangan berjabat
// ~(420,750), Ibu menangis ~(580,450); p10 Ayah ~(585,480), tangan melambai.
const SHOTS: Shot[] = [
	// A (0-18 dtk): malam, hujan, 23.58, kunci tua
	{ img: "halaman-000.jpg", start: 0, len: 180, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 560, fy: 500, s: 1.15 } },
	{ img: "halaman-001.jpg", start: 168, len: 180, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 560, fy: 520, s: 1.15 } },
	{ img: "halaman-001.jpg", start: 336, len: 204, from: { fx: 590, fy: 560, s: 1.7 }, to: { fx: 590, fy: 500, s: 2.05 } },
	// B (18-36 dtk): pagi (tanah merah + kamboja) -> malam mengintip -> cermin
	{ img: "halaman-002.jpg", start: 528, len: 180, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 600, fy: 800, s: 1.25 } },
	{ img: "halaman-003.jpg", start: 696, len: 192, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 520, fy: 560, s: 1.2 } },
	{ img: "halaman-004.jpg", start: 876, len: 204, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 650, fy: 580, s: 1.25 } },
	// C (36-54 dtk): vas jatuh (PRANG di 41,0 dtk = frame 1230) -> Ibu berkaca-kaca
	{ img: "halaman-004.jpg", start: 1068, len: 180, from: { fx: 380, fy: 700, s: 1.8 }, to: { fx: 390, fy: 690, s: 2.1 } },
	{ img: "halaman-005.jpg", start: 1236, len: 192, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 540, fy: 520, s: 1.2 } },
	{ img: "halaman-005.jpg", start: 1416, len: 204, from: { fx: 595, fy: 440, s: 1.9 }, to: { fx: 595, fy: 400, s: 2.15 } },
	// D (54-72 dtk): kunci + foto keluarga -> ruang kenangan
	{ img: "halaman-006.jpg", start: 1608, len: 180, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 450, fy: 750, s: 1.2 } },
	{ img: "halaman-006.jpg", start: 1776, len: 192, from: { fx: 500, fy: 880, s: 1.85 }, to: { fx: 500, fy: 840, s: 2.05 } },
	{ img: "halaman-007.jpg", start: 1956, len: 204, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 500, fy: 550, s: 1.2 } },
	// E (72-90 dtk): perpisahan -> cermin emas, Ayah melambai
	{ img: "halaman-008.jpg", start: 2148, len: 180, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 500, fy: 580, s: 1.2 } },
	{ img: "halaman-009.jpg", start: 2316, len: 192, from: { fx: 448, fy: 600, s: 1.0 }, to: { fx: 580, fy: 500, s: 1.25 } },
	{ img: "halaman-009.jpg", start: 2496, len: 204, from: { fx: 570, fy: 480, s: 1.8 }, to: { fx: 575, fy: 450, s: 2.1 } },
];

const FADE = 12; // frame crossfade antar shot

const easeInOut = (t: number) =>
	t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
	const frame = useCurrentFrame();
	const { start, len } = shot;
	const end = start + len;
	const raw = (frame - start) / Math.max(1, len - 1);
	const p = easeInOut(Math.min(1, Math.max(0, raw)));
	const fx = interpolate(p, [0, 1], [shot.from.fx, shot.to.fx]);
	const fy = interpolate(p, [0, 1], [shot.from.fy, shot.to.fy]);
	const s = interpolate(p, [0, 1], [shot.from.s, shot.to.s]);
	const scale = COVER * s;
	const fadeIn = interpolate(frame, [start, start + FADE], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const fadeOut = interpolate(frame, [end - FADE, end], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const opacity = Math.min(fadeIn, fadeOut);
	if (opacity <= 0) return null;
	return (
		<AbsoluteFill style={{ opacity, overflow: "hidden", backgroundColor: "#0a0a12" }}>
			<Img
				src={staticFile(`rahasia-pintu-ibu-komik/${shot.img}`)}
				style={{
					position: "absolute",
					width: SRC_W * scale,
					height: SRC_H * scale,
					left: W / 2 - fx * scale,
					top: H / 2 - fy * scale,
				}}
			/>
		</AbsoluteFill>
	);
};

export const RahasiaPintuIbuKomik: React.FC = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "#0a0a12" }}>
			{SHOTS.map((shot, i) => (
				<ShotView key={`${shot.img}-${shot.start}-${i}`} shot={shot} />
			))}
			<Audio src={staticFile("rahasia-pintu-ibu/audio/mix.wav")} />
		</AbsoluteFill>
	);
};
