import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	Sequence,
	continueRender,
	delayRender,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
} from "remotion";

// Umar storyboard build — the approved 12-panel sheet, 90 seconds.
// Every panel: Ken Burns camera that never rests (3 shots per panel, hard
// jump cuts, zoom direction alternates), phrase-by-phrase captions synced
// to the narration, varied entrance transitions each with its own SFX.
// Narration: 12 TTS lines (vg_id_m41), uniformly sped 1.10x so the full
// script fits 90 s; panel boundaries follow the measured line timings.
// Adab: Umar is shown only from behind in every panel (verified).

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const TOTAL_FRAMES = 2700; // exactly 90.000 s
const ENDCARD_FROM = 2625;
const ENDCARD_FRAMES = 75;
const REFBOX_FROM = 662;

const fontHandle = delayRender("Loading Poppins fonts (umar)");
Promise.all(
	[600, 700, 800].map(async (weight) => {
		const face = new FontFace(
			"Poppins",
			`url(${staticFile(`fonts/Poppins-${weight}.woff2`)})`,
			{ weight: String(weight) }
		);
		await face.load();
		document.fonts.add(face);
	})
)
	.then(() => continueRender(fontHandle))
	.catch((err) => {
		console.warn("Poppins failed to load, using fallback font:", err);
		continueRender(fontHandle);
	});

const FONT = "Poppins, sans-serif";
const YELLOW = "#FFD23F";
const OUTLINE =
	"3px 3px 0 #1a1a1a, -2px -2px 0 #1a1a1a, 2px -2px 0 #1a1a1a, -2px 2px 0 #1a1a1a, 0 8px 24px rgba(0,0,0,0.45)";

const PANELS = [
	{ id: "p1", from: 0, frames: 228, img: "umar-storyboard/panel1.jpg" },
	{ id: "p2", from: 228, frames: 202, img: "umar-storyboard/panel2.jpg" },
	{ id: "p3", from: 430, frames: 232, img: "umar-storyboard/panel3.jpg" },
	{ id: "p4", from: 662, frames: 209, img: "umar-storyboard/panel4.jpg" },
	{ id: "p5", from: 871, frames: 231, img: "umar-storyboard/panel5.jpg" },
	{ id: "p6", from: 1102, frames: 247, img: "umar-storyboard/panel6.jpg" },
	{ id: "p7", from: 1349, frames: 231, img: "umar-storyboard/panel7.jpg" },
	{ id: "p8", from: 1580, frames: 224, img: "umar-storyboard/panel8.jpg" },
	{ id: "p9", from: 1804, frames: 202, img: "umar-storyboard/panel9.jpg" },
	{ id: "p10", from: 2006, frames: 224, img: "umar-storyboard/panel10.jpg" },
	{ id: "p11", from: 2230, frames: 216, img: "umar-storyboard/panel11.jpg" },
	{ id: "p12", from: 2446, frames: 254, img: "umar-storyboard/panel12.jpg" },
];

const NARRATION = [
	{ from: 15, frames: 218, file: "audio/umar/line1.mp3" },
	{ from: 243, frames: 191, file: "audio/umar/line2.mp3" },
	{ from: 445, frames: 221, file: "audio/umar/line3.mp3" },
	{ from: 677, frames: 199, file: "audio/umar/line4.mp3" },
	{ from: 886, frames: 221, file: "audio/umar/line5.mp3" },
	{ from: 1117, frames: 236, file: "audio/umar/line6.mp3" },
	{ from: 1364, frames: 221, file: "audio/umar/line7.mp3" },
	{ from: 1595, frames: 214, file: "audio/umar/line8.mp3" },
	{ from: 1819, frames: 191, file: "audio/umar/line9.mp3" },
	{ from: 2021, frames: 214, file: "audio/umar/line10.mp3" },
	{ from: 2245, frames: 206, file: "audio/umar/line11.mp3" },
	{ from: 2461, frames: 214, file: "audio/umar/line12.mp3" },
];

// Phrase captions, in LOCAL panel frames. Timings measured from the actual
// narration with word-level timestamps, so each phrase appears the moment
// its first word is spoken (v1 used even splits and lagged behind the voice).
const PHRASES = [
	[
		{ words: [{ w: "PADA" }, { w: "SUATU" }, { w: "MALAM", hi: true }, { w: "YANG" }, { w: "DINGIN" }], at: 13, dur: 38 },
		{ words: [{ w: "DI" }, { w: "HARRAH", hi: true }, { w: "WAQIM" }], at: 51, dur: 48 },
		{ words: [{ w: "UMAR" }, { w: "BERPATROLI" }, { w: "BERSAMA" }, { w: "ASLAM" }], at: 99, dur: 131 },
	],
	[
		{ words: [{ w: "TIBA-TIBA," }, { w: "TERDENGAR" }, { w: "TANGISAN", hi: true }], at: 13, dur: 113 },
		{ words: [{ w: "ANAK-ANAK" }, { w: "DARI" }, { w: "SEBUAH" }, { w: "TENDA" }], at: 126, dur: 32 },
		{ words: [{ w: "LANGKAH" }, { w: "UMAR", hi: true }, { w: "TERHENTI" }], at: 158, dur: 45 },
	],
	[
		{ words: [{ w: "DI" }, { w: "DALAM" }, { w: "TENDA" }, { w: "YANG" }, { w: "SEDERHANA" }], at: 13, dur: 63 },
		{ words: [{ w: "SEORANG" }, { w: "IBU", hi: true }, { w: "MEMASAK" }], at: 76, dur: 37 },
		{ words: [{ w: "DI" }, { w: "ATAS" }, { w: "API", hi: true }, { w: "KECIL" }], at: 113, dur: 43 },
		{ words: [{ w: "MENENANGKAN" }, { w: "ANAKNYA" }, { w: "YANG" }, { w: "LAPAR" }], at: 156, dur: 77 },
	],
	[
		{ words: [{ w: "UMAR" }, { w: "MENDEKAT" }, { w: "DAN" }, { w: "BERTANYA" }], at: 13, dur: 111 },
		{ words: [{ w: "PERIUK" }, { w: "ITU" }, { w: "HANYA" }, { w: "BERISI" }, { w: "AIR", hi: true }], at: 124, dur: 44 },
		{ words: [{ w: "UNTUK" }, { w: "MENENANGKAN" }, { w: "ANAK-ANAKNYA" }], at: 168, dur: 43 },
	],
	[
		{ words: [{ w: "DENGAN" }, { w: "SUARA" }, { w: "YANG" }, { w: "BERGETAR" }], at: 13, dur: 80 },
		{ words: [{ w: "ALLAH" }, { w: "AKAN" }, { w: "MENJADI" }, { w: "HAKIM", hi: true }], at: 93, dur: 40 },
		{ words: [{ w: "ANTARA" }, { w: "DIRINYA" }, { w: "DAN" }, { w: "UMAR" }], at: 133, dur: 100 },
	],
	[
		{ words: [{ w: "MENDENGAR" }, { w: "HAL" }, { w: "ITU" }], at: 13, dur: 44 },
		{ words: [{ w: "HATI" }, { w: "UMAR", hi: true }, { w: "TERGERAK" }], at: 57, dur: 101 },
		{ words: [{ w: "IA" }, { w: "BERGEGAS" }, { w: "MENUJU" }, { w: "GUDANG" }], at: 158, dur: 49 },
		{ words: [{ w: "DARUD", hi: true }, { w: "DAQIQ" }, { w: "DI" }, { w: "TENGAH" }, { w: "MALAM" }], at: 207, dur: 41 },
	],
	[
		{ words: [{ w: "DI" }, { w: "DALAM" }, { w: "GUDANG" }, { w: "ITU" }], at: 13, dur: 40 },
		{ words: [{ w: "UMAR" }, { w: "MENGAMBIL" }, { w: "SEKARUNG" }, { w: "GANDUM", hi: true }], at: 53, dur: 42 },
		{ words: [{ w: "DAN" }, { w: "MINYAK", hi: true }, { w: "SAMIN" }], at: 95, dur: 43 },
		{ words: [{ w: "ASLAM" }, { w: "MENAWARKAN" }, { w: "BANTUAN" }], at: 138, dur: 95 },
	],
	[
		{ words: [{ w: "UMAR" }, { w: "MENOLAK" }, { w: "DENGAN", hi: true }, { w: "TEGAS" }], at: 39, dur: 86 },
		{ words: [{ w: "INI" }, { w: "TANGGUNG" }, { w: "JAWABNYA" }, { w: "SENDIRI", hi: true }], at: 125, dur: 101 },
	],
	[
		{ words: [{ w: "SESAMPAINYA" }, { w: "DI" }, { w: "TENDA" }], at: 13, dur: 44 },
		{ words: [{ w: "UMAR" }, { w: "BERLUTUT" }, { w: "DI" }, { w: "DEKAT" }, { w: "API", hi: true }], at: 57, dur: 41 },
		{ words: [{ w: "DAN" }, { w: "MEMASAK", hi: true }, { w: "SENDIRI" }], at: 98, dur: 43 },
		{ words: [{ w: "DIBANTU" }, { w: "SANG" }, { w: "IBU" }], at: 141, dur: 62 },
	],
	[
		{ words: [{ w: "ANAK-ANAK" }, { w: "MAKAN" }, { w: "DENGAN", hi: true }, { w: "LAHAP" }], at: 13, dur: 66 },
		{ words: [{ w: "DAN" }, { w: "TERSENYUM", hi: true }, { w: "BAHAGIA" }], at: 79, dur: 54 },
		{ words: [{ w: "PERUT" }, { w: "LAPAR" }, { w: "KINI" }, { w: "TERISI" }], at: 133, dur: 93 },
	],
	[
		{ words: [{ w: "SETELAH" }, { w: "MAKAN" }, { w: "KENYANG" }], at: 13, dur: 43 },
		{ words: [{ w: "ANAK-ANAK" }, { w: "TERTIDUR", hi: true }, { w: "TENANG" }], at: 56, dur: 69 },
		{ words: [{ w: "SANG" }, { w: "IBU" }, { w: "MENGANGKAT" }, { w: "TANGANNYA" }], at: 125, dur: 66 },
		{ words: [{ w: "BERSYUKUR" }, { w: "KEPADA" }, { w: "ALLAH", hi: true }], at: 191, dur: 27 },
	],
	[
		{ words: [{ w: "DI" }, { w: "PAGI", hi: true }, { w: "YANG" }, { w: "CERAH" }], at: 13, dur: 34 },
		{ words: [{ w: "UMAR" }, { w: "PULANG" }, { w: "DENGAN" }, { w: "TENANG" }], at: 47, dur: 87 },
		{ words: [{ w: "PEMIMPIN", hi: true }, { w: "BERTANGGUNG" }, { w: "JAWAB" }], at: 134, dur: 92 },
	],
];

// Camera: 3 Ken Burns shots per panel, cuts at 1/3 and 2/3. Zoom direction
// alternates shot to shot; pan direction varies per panel.
const SHOT_PATTERNS = [
	[
		{ s0: 1.03, s1: 1.1, x0: 0, x1: -12, y0: 6, y1: -6 },
		{ s0: 1.09, s1: 1.02, x0: -10, x1: 10, y0: -6, y1: 6 },
		{ s0: 1.02, s1: 1.11, x0: 8, x1: -8, y0: 0, y1: -8 },
	],
	[
		{ s0: 1.1, s1: 1.03, x0: 10, x1: -8, y0: -8, y1: 4 },
		{ s0: 1.02, s1: 1.09, x0: -8, x1: 10, y0: 6, y1: -4 },
		{ s0: 1.08, s1: 1.02, x0: 0, x1: -10, y0: -4, y1: 8 },
	],
];

const SHOTS = PANELS.map((p, i) => {
	const pat = SHOT_PATTERNS[i % 2];
	const third = Math.floor(p.frames / 3);
	return pat.map((s, k) => ({
		at: k * third,
		dur: k === 2 ? p.frames - 2 * third : third,
		from: { s: s.s0, x: s.x0, y: s.y0 },
		to: { s: s.s1, x: s.x1, y: s.y1 },
	}));
});

const PHRASE_POPS = [];
PANELS.forEach((p, i) => {
	PHRASES[i].forEach((ph) => PHRASE_POPS.push(p.from + ph.at));
});

const TRANSITION_SFX = [
	{ at: 422, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 863, file: "audio/sulaiman/sparkle.mp3", vol: 0.5, dur: 14 },
	{ at: 1094, file: "audio/sulaiman/thump.mp3", vol: 0.6, dur: 11 },
	{ at: 1572, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 1796, file: "audio/sulaiman/sparkle.mp3", vol: 0.5, dur: 14 },
	{ at: 2222, file: "audio/sulaiman/thump.mp3", vol: 0.6, dur: 11 },
	{ at: 2438, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 2607, file: "audio/sulaiman/riser.mp3", vol: 0.45, dur: 15 },
];

// Deterministic pseudo-random for overlay placement.
const rand = (seed) => {
	let t = seed + 0x6d2b79f5;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const Stars = ({ seed }) => {
	const frame = useCurrentFrame();
	const stars = [];
	for (let i = 0; i < 42; i++) {
		const x = rand(seed * 100 + i) * WIDTH;
		const y = rand(seed * 100 + i + 500) * 950;
		const size = 2 + rand(seed * 100 + i + 900) * 4;
		const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.02 + i * 1.7));
		stars.push(
			<div
				key={i}
				style={{
					position: "absolute",
					left: x,
					top: y,
					width: size,
					height: size,
					borderRadius: "50%",
					backgroundColor: "#fff",
					opacity: tw,
				}}
			/>
		);
	}
	return <div style={{ position: "absolute", inset: 0 }}>{stars}</div>;
};

const Embers = ({ seed }) => {
	const frame = useCurrentFrame();
	const dots = [];
	for (let i = 0; i < 14; i++) {
		const x0 = 380 + rand(seed * 77 + i) * 320;
		const speed = 1.1 + rand(seed * 77 + i + 300) * 1.4;
		const cycle = 150;
		const t = (frame * speed + i * 37) % cycle;
		const y = 1420 - t * 4.2;
		const drift = Math.sin((frame + i * 20) * 0.05) * 22;
		const opacity = interpolate(t, [0, 20, cycle - 20, cycle], [0, 0.9, 0.9, 0], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		});
		dots.push(
			<div
				key={i}
				style={{
					position: "absolute",
					left: x0 + drift,
					top: y,
					width: 5 + rand(seed * 77 + i + 600) * 5,
					height: 5 + rand(seed * 77 + i + 600) * 5,
					borderRadius: "50%",
					backgroundColor: "#FFB347",
					opacity,
					boxShadow: "0 0 12px 4px rgba(255,150,50,0.5)",
				}}
			/>
		);
	}
	return <div style={{ position: "absolute", inset: 0 }}>{dots}</div>;
};

const Bird = ({ x, y, delay, scale }) => {
	const frame = useCurrentFrame();
	const flap = Math.sin((frame + delay) * 0.35) * 0.7;
	const bob = Math.sin((frame + delay) * 0.05) * 8;
	const move = ((frame * 1.4 + delay * 9) % 1300) - 120;
	return (
		<svg
			width={64 * scale}
			height={28 * scale}
			viewBox="0 0 64 28"
			style={{ position: "absolute", left: x + move, top: y + bob, opacity: 0.85 }}
		>
			<path
				d={`M4 20 Q18 ${10 - flap * 10} 32 18 Q46 ${10 - flap * 10} 60 20`}
				fill="none"
				stroke="#4a3826"
				strokeWidth={4}
				strokeLinecap="round"
			/>
		</svg>
	);
};

const Birds = () => (
	<div style={{ position: "absolute", inset: 0 }}>
		<Bird x={60} y={300} delay={0} scale={1} />
		<Bird x={260} y={240} delay={40} scale={0.8} />
		<Bird x={470} y={330} delay={80} scale={1.1} />
		<Bird x={680} y={260} delay={120} scale={0.75} />
		<Bird x={830} y={360} delay={160} scale={0.9} />
	</div>
);

const Overlays = ({ index }) => {
	const frame = useCurrentFrame();
	if (index === 11) {
		return <Birds />;
	}
	const firePanels = [2, 3, 4, 8, 9];
	return (
		<>
			<Stars seed={index + 1} />
			{firePanels.includes(index) && <Embers seed={index + 1} />}
		</>
	);
};

const PanelImage = ({ img, index, punchAt }) => {
	const frame = useCurrentFrame();
	const shots = SHOTS[index];
	let shot = shots[0];
	for (const s of shots) {
		if (frame >= s.at) {
			shot = s;
		}
	}
	const p = Math.min(Math.max((frame - shot.at) / shot.dur, 0), 1);
	const lerp = (a, b) => a + (b - a) * p;
	const settle = 1 + 0.03 * Math.exp(-(frame - shot.at) / 4);
	const punch =
		punchAt == null ? 0 : 0.05 * Math.exp(-((frame - punchAt) ** 2) / (2 * 7 * 7));
	const rot = Math.sin(frame * 0.01) * 0.4;
	return (
		<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
			<Img
				src={staticFile(img)}
				style={{
					width: WIDTH,
					height: HEIGHT,
					objectFit: "cover",
					transform: `translate(${lerp(shot.from.x, shot.to.x)}px, ${lerp(shot.from.y, shot.to.y)}px) scale(${lerp(shot.from.s, shot.to.s) * settle * (1 + punch)}) rotate(${rot}deg)`,
					transformOrigin: "center center",
				}}
			/>
		</div>
	);
};

const PhraseText = ({ phrases, fadeOutAt }) => {
	const frame = useCurrentFrame();
	const blockOpacity =
		fadeOutAt == null
			? 1
			: interpolate(frame, [fadeOutAt, fadeOutAt + 15], [1, 0], {
					extrapolateLeft: "clamp",
					extrapolateRight: "clamp",
			  });
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 300,
				display: "flex",
				justifyContent: "center",
				padding: "0 60px",
				opacity: blockOpacity,
			}}
		>
			{phrases.map((phrase, pi) => {
				const opacity = interpolate(
					frame,
					[phrase.at, phrase.at + 8, phrase.at + phrase.dur - 8, phrase.at + phrase.dur],
					[0, 1, 1, 0],
					{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
				);
				if (opacity <= 0) {
					return null;
				}
				return (
					<div
						key={pi}
						style={{
							position: "absolute",
							bottom: 0,
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "center",
							gap: "0 18px",
							maxWidth: 920,
							opacity,
						}}
					>
						{phrase.words.map((word, wi) => {
							const revealAt = phrase.at + wi * 3;
							const pop =
								frame >= revealAt
									? spring({ frame: frame - revealAt, fps: FPS, config: { damping: 13, stiffness: 260 } })
									: 0;
							const sweep =
								frame >= revealAt
									? spring({ frame: frame - revealAt - 6, fps: FPS, config: { damping: 20, stiffness: 180 } })
									: 0;
							return (
								<span
									key={wi}
									style={{
										position: "relative",
										fontFamily: FONT,
										fontWeight: 800,
										fontSize: 58,
										lineHeight: 1.18,
										letterSpacing: 1,
										color: word.hi ? YELLOW : "#fff",
										textShadow: OUTLINE,
										transform: `scale(${Math.max(pop, 0.01)})`,
										display: "inline-block",
									}}
								>
									{word.w}
									{word.hi && (
										<div
											style={{
												position: "absolute",
												left: -4,
												right: -4,
												bottom: -8,
												height: 8,
												borderRadius: 4,
												backgroundColor: YELLOW,
												transform: `scaleX(${Math.max(sweep, 0)})`,
												transformOrigin: "left center",
											}}
										/>
									)}
								</span>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};

const SpeechBubble = ({ at, dur, text, style, tailLeft }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[at, at + 8, at + dur - 8, at + dur],
		[0, 1, 1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);
	if (opacity <= 0) {
		return null;
	}
	const pop = spring({ frame: frame - at, fps: FPS, config: { damping: 11, stiffness: 240 } });
	const wiggle = Math.sin((frame - at) * 0.15) * 1.2;
	return (
		<div
			style={{
				position: "absolute",
				width: 720,
				opacity,
				transform: `scale(${Math.max(pop, 0.01)}) rotate(${wiggle}deg)`,
				transformOrigin: "20% 100%",
				...style,
			}}
		>
			<div
				style={{
					position: "relative",
					zIndex: 1,
					backgroundColor: "#FFFDF5",
					border: "4px solid #1a1a1a",
					borderRadius: 36,
					padding: "28px 34px",
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 40,
					lineHeight: 1.3,
					color: "#3a2a1a",
				}}
			>
				{text}
			</div>
			<div
				style={{
					position: "absolute",
					left: tailLeft,
					bottom: -14,
					width: 36,
					height: 36,
					backgroundColor: "#FFFDF5",
					borderRight: "4px solid #1a1a1a",
					borderBottom: "4px solid #1a1a1a",
					transform: "rotate(45deg)",
					zIndex: 0,
				}}
			/>
		</div>
	);
};

const Label = ({ text, at, style }) => {
	const frame = useCurrentFrame();
	if (frame < at) {
		return null;
	}
	const pop = spring({ frame: frame - at, fps: FPS, config: { damping: 14, stiffness: 260 } });
	return (
		<div
			style={{
				position: "absolute",
				...style,
				backgroundColor: "rgba(20,14,8,0.78)",
				border: `3px solid ${YELLOW}`,
				borderRadius: 999,
				padding: "10px 24px",
				fontFamily: FONT,
				fontWeight: 700,
				fontSize: 28,
				letterSpacing: 2,
				color: YELLOW,
				transform: `scale(${Math.max(pop, 0.01)})`,
			}}
		>
			{text}
		</div>
	);
};

const PanelLabels = ({ index }) => {
	if (index === 1) {
		return <Label text="UMAR BIN KHATTAB" at={13} style={{ top: 64, left: 56 }} />;
	}
	if (index === 2) {
		return <Label text="SANG IBU" at={10} style={{ top: 64, right: 56 }} />;
	}
	if (index === 6) {
		return <Label text="ASLAM" at={10} style={{ top: 64, right: 56 }} />;
	}
	return null;
};

const RefBox = () => {
	const frame = useCurrentFrame();
	if (frame < REFBOX_FROM) {
		return null;
	}
	const text = "RIWAYAT: ZAID BIN ASLAM";
	const n = Math.min(text.length, Math.floor((frame - REFBOX_FROM) / 2));
	const opacity = interpolate(frame, [REFBOX_FROM, REFBOX_FROM + 12], [0, 1], {
		extrapolateRight: "clamp",
	});
	return (
		<div
			style={{
				position: "absolute",
				top: 64,
				left: 56,
				opacity,
				backgroundColor: "rgba(20,14,8,0.72)",
				border: `3px solid ${YELLOW}`,
				borderRadius: 16,
				padding: "14px 26px",
				fontFamily: FONT,
				fontWeight: 700,
				fontSize: 34,
				letterSpacing: 2,
				color: YELLOW,
			}}
		>
			{text.slice(0, n)}
			{n < text.length ? "▌" : ""}
		</div>
	);
};

const ProgressBar = () => {
	const frame = useCurrentFrame();
	const w = interpolate(frame, [0, TOTAL_FRAMES], [0, WIDTH]);
	return (
		<div
			style={{
				position: "absolute",
				bottom: 0,
				left: 0,
				right: 0,
				height: 10,
				backgroundColor: "rgba(0,0,0,0.35)",
			}}
		>
			<div style={{ width: w, height: "100%", backgroundColor: YELLOW }} />
		</div>
	);
};

const EndCard = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
	const y = interpolate(frame, [0, 18], [26, 0], { extrapolateRight: "clamp" });
	return (
		<AbsoluteFill
			style={{
				opacity,
				background:
					"linear-gradient(to top, rgba(10,6,2,0.88) 0%, rgba(10,6,2,0.55) 45%, rgba(10,6,2,0) 78%)",
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 210,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textAlign: "center",
					padding: "0 80px",
					transform: `translateY(${y}px)`,
				}}
			>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 82, color: "#fff", letterSpacing: 1 }}>
					Kisah Umar bin Khattab
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: YELLOW, marginTop: 18 }}>
					Riwayat Zaid bin Aslam
				</div>
				<div
					style={{
						fontFamily: FONT,
						fontWeight: 600,
						fontSize: 34,
						lineHeight: 1.35,
						color: "#fff",
						marginTop: 26,
						maxWidth: 860,
					}}
				>
					Seorang pemimpin sejati memikul sendiri beban rakyatnya.
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Entrance transitions per the approved sheet, rotating so no two adjacent
// panel changes feel the same:
// P1 fade in, P2 hard cut, P3 slide, P4 hard cut + zoom punch,
// P5 iris, P6 zoom-through, P7 hard cut, P8 slide, P9 iris,
// P10 hard cut, P11 zoom-through, P12 slide.
const TRANSITION_KIND = [
	"fade", "cut", "slide", "cut", "iris", "zoom",
	"cut", "slide", "iris", "cut", "zoom", "slide",
];

const Panel = ({ panel, index }) => {
	const frame = useCurrentFrame();
	const kind = TRANSITION_KIND[index];
	let opacity = 1;
	let transform = "";
	let clipPath;
	if (kind === "fade") {
		opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
	} else if (kind === "slide") {
		opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
		const sx = interpolate(frame, [0, 14], [WIDTH, 0], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		transform = `translateX(${sx}px)`;
	} else if (kind === "iris") {
		opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
		const r = interpolate(frame, [0, 12], [0, 75], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		clipPath = `circle(${r}% at 50% 50%)`;
	} else if (kind === "zoom") {
		opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
		const zs = interpolate(frame, [0, 14], [1.3, 1], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		transform = `scale(${zs})`;
	}
	return (
		<AbsoluteFill style={{ opacity, transform, clipPath }}>
			<PanelImage img={panel.img} index={index} punchAt={index === 3 ? 85 : null} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"linear-gradient(to top, rgba(10,6,2,0.42) 0%, rgba(10,6,2,0) 34%)",
				}}
			/>
			<Overlays index={index} />
			<PanelLabels index={index} />
			{index === 4 && (
				<SpeechBubble
					at={93}
					dur={60}
					text="Allah akan menjadi hakim antara aku dan Umar!"
					style={{ left: 70, top: 700 }}
					tailLeft={560}
				/>
			)}
			{index === 7 && (
				<SpeechBubble
					at={87}
					dur={58}
					text="Apakah engkau akan memikul bebanku di hari kiamat?"
					style={{ left: 70, top: 700 }}
					tailLeft={560}
				/>
			)}
			<PhraseText phrases={PHRASES[index]} fadeOutAt={index === 11 ? 165 : null} />
		</AbsoluteFill>
	);
};

export const UmarStoryboard = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{PANELS.map((p, i) => (
				<Sequence key={p.id} from={p.from} durationInFrames={p.frames}>
					<Panel panel={p} index={i} />
				</Sequence>
			))}
			<Sequence from={ENDCARD_FROM} durationInFrames={ENDCARD_FRAMES}>
				<EndCard />
			</Sequence>
			<RefBox />
			<ProgressBar />
			{NARRATION.map((n) => (
				<Sequence key={`audio-${n.from}`} from={n.from} durationInFrames={n.frames + 6}>
					<Audio src={staticFile(n.file)} />
				</Sequence>
			))}
			{TRANSITION_SFX.map((sfx) => (
				<Sequence key={`sfx-${sfx.at}`} from={sfx.at} durationInFrames={sfx.dur}>
					<Audio src={staticFile(sfx.file)} volume={sfx.vol} />
				</Sequence>
			))}
			{PHRASE_POPS.map((f) => (
				<Sequence key={`pop-${f}`} from={f} durationInFrames={5}>
					<Audio src={staticFile("audio/sulaiman/pop.mp3")} volume={0.35} />
				</Sequence>
			))}
			<Sequence from={ENDCARD_FROM} durationInFrames={36}>
				<Audio src={staticFile("audio/sulaiman/chime.mp3")} volume={0.5} />
			</Sequence>
		</AbsoluteFill>
	);
};

export const UMAR_FPS = FPS;
export const UMAR_WIDTH = WIDTH;
export const UMAR_HEIGHT = HEIGHT;
export const UMAR_FRAMES = TOTAL_FRAMES;
