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
import {
	ENDCARD_FRAMES,
	ENDCARD_FROM,
	FPS,
	HEIGHT,
	REFBOX_FROM,
	SCENES,
	TOTAL_FRAMES,
	WIDTH,
} from "./timings";

// v4 — "nothing ever still": every phrase change (~2.5s) is also a SHOT CUT —
// a hard jump to a new camera setup with alternating zoom in / zoom out — so
// the picture changes at least every 3 seconds, synced to the text. The three
// scene boundaries each use a DIFFERENT transition with its own SFX:
// slide + whoosh, iris + sparkle, zoom-through + thump. A riser builds into
// the end card. v2/v3 overlays, phrases, bubble and labels are kept.

// Local Poppins files (public/fonts/) — Google Fonts fetch stalls in this VM,
// so the fonts are bundled locally and loaded via FontFace before rendering.
const fontHandle = delayRender("Loading Poppins fonts (sulaiman)");
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

// Phrase captions, in LOCAL scene frames.
const PHRASES = [
	[
		{ words: [{ w: "NABI" }, { w: "SULAIMAN", hi: true }, { w: "BERJALAN" }], at: 15, dur: 70 },
		{ words: [{ w: "BERSAMA" }, { w: "PASUKANNYA", hi: true }, { w: "YANG" }, { w: "BESAR" }], at: 88, dur: 72 },
		{ words: [{ w: "MANUSIA," }, { w: "JIN,", hi: true }, { w: "DAN" }, { w: "BURUNG" }], at: 163, dur: 75 },
	],
	[
		{ words: [{ w: "SAMPAI" }, { w: "DI" }, { w: "LEMBAH" }, { w: "SEMUT" }], at: 10, dur: 60 },
		{ words: [{ w: "SEEKOR" }, { w: "SEMUT" }, { w: "BERTERIAK:" }], at: 73, dur: 55 },
	],
	[
		{ words: [{ w: "NABI" }, { w: "SULAIMAN" }, { w: "MENDENGARNYA", hi: true }], at: 10, dur: 55 },
		{ words: [{ w: "DAN" }, { w: "TERSENYUM" }], at: 68, dur: 45 },
		{ words: [{ w: "MEMAHAMI" }, { w: "BAHASA", hi: true }, { w: "HEWAN", hi: true }], at: 116, dur: 55 },
	],
	[
		{ words: [{ w: "IA" }, { w: "PUN" }, { w: "BERDOA" }], at: 10, dur: 45 },
		{ words: [{ w: "BERSYUKUR" }, { w: "ATAS" }, { w: "NIKMAT", hi: true }, { w: "ALLAH", hi: true }], at: 58, dur: 55 },
	],
];

// Camera SHOTS, in LOCAL scene frames, aligned to the phrase changes. Each
// shot is one continuous move; the cut between shots is a hard jump, and the
// zoom direction alternates (out, in, out...) so every cut reads clearly.
const SHOTS = [
	[
		{ at: 0, dur: 88, from: { s: 1.16, x: -10, y: 8 }, to: { s: 1.07, x: 8, y: -6 } },
		{ at: 88, dur: 75, from: { s: 1.07, x: 10, y: -6 }, to: { s: 1.17, x: -18, y: 12 } },
		{ at: 163, dur: 104, from: { s: 1.17, x: -18, y: 12 }, to: { s: 1.08, x: 12, y: -10 } },
	],
	[
		{ at: 0, dur: 73, from: { s: 1.06, x: 0, y: 0 }, to: { s: 1.15, x: -22, y: -8 } },
		{ at: 73, dur: 57, from: { s: 1.15, x: -22, y: -8 }, to: { s: 1.07, x: 6, y: 6 } },
		{ at: 130, dur: 122, from: { s: 1.07, x: 6, y: 6 }, to: { s: 1.18, x: -10, y: -4 } },
	],
	[
		{ at: 0, dur: 68, from: { s: 1.14, x: 8, y: -8 }, to: { s: 1.06, x: -10, y: 8 } },
		{ at: 68, dur: 48, from: { s: 1.06, x: -10, y: 8 }, to: { s: 1.15, x: 16, y: -10 } },
		{ at: 116, dur: 91, from: { s: 1.15, x: 16, y: -10 }, to: { s: 1.07, x: -8, y: 6 } },
	],
	[
		{ at: 0, dur: 58, from: { s: 1.07, x: 0, y: 0 }, to: { s: 1.16, x: -14, y: 10 } },
		{ at: 58, dur: 152, from: { s: 1.16, x: -14, y: 10 }, to: { s: 1.08, x: 10, y: -8 } },
	],
];

// Pop SFX on every phrase entrance / shot cut (global frames).
const PHRASE_POPS = [15, 88, 163, 265, 328, 385, 505, 563, 611, 700, 748];

// One distinct SFX per scene transition (global frames), plus a riser
// leading into the end card.
const TRANSITION_SFX = [
	{ at: 246, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 486, file: "audio/sulaiman/sparkle.mp3", vol: 0.5, dur: 14 },
	{ at: 681, file: "audio/sulaiman/thump.mp3", vol: 0.6, dur: 11 },
	{ at: 812, file: "audio/sulaiman/riser.mp3", vol: 0.45, dur: 15 },
];

// --- 2D overlay animation elements (kept from v2/v3) -----------------------

const Bird = ({ y, speed, size, offset }) => {
	const frame = useCurrentFrame();
	const x = -140 + ((frame * speed + offset) % (WIDTH + 280));
	const flap = Math.sin(frame * 0.5 + offset) * 8;
	const bobY = Math.sin(frame * 0.07 + offset) * 10;
	return (
		<svg
			style={{ position: "absolute", left: x, top: y + bobY, overflow: "visible", opacity: 0.85 }}
			width={size}
			height={size * 0.4}
			viewBox="0 0 40 16"
		>
			<path
				d={`M2 10 Q10 ${10 - flap} 20 10 Q30 ${10 - flap} 38 10`}
				stroke="#2b1c10"
				strokeWidth={3.4}
				fill="none"
				strokeLinecap="round"
			/>
		</svg>
	);
};

const Birds = ({ items }) => (
	<>
		{items.map((b, i) => (
			<Bird key={i} {...b} />
		))}
	</>
);

const Cloud = ({ y, speed, scale, offset }) => {
	const frame = useCurrentFrame();
	const x = -340 + ((frame * speed + offset) % (WIDTH + 680));
	return (
		<div style={{ position: "absolute", left: x, top: y, opacity: 0.5, transform: `scale(${scale})` }}>
			<div style={{ position: "relative", width: 230, height: 74 }}>
				<div style={{ position: "absolute", left: 0, top: 26, width: 90, height: 48, borderRadius: "50%", backgroundColor: "#fff" }} />
				<div style={{ position: "absolute", left: 58, top: 0, width: 110, height: 62, borderRadius: "50%", backgroundColor: "#fff" }} />
				<div style={{ position: "absolute", left: 140, top: 22, width: 90, height: 52, borderRadius: "50%", backgroundColor: "#fff" }} />
			</div>
		</div>
	);
};

const Dust = ({ count = 14 }) => {
	const frame = useCurrentFrame();
	return (
		<>
			{Array.from({ length: count }).map((_, i) => {
				const x0 = (i * 397.3) % WIDTH;
				const speed = 0.35 + (i % 5) * 0.14;
				const y = HEIGHT + 60 - ((frame * speed + i * 211) % (HEIGHT + 160));
				const x = x0 + Math.sin(frame * 0.02 + i) * 26;
				const size = 4 + (i % 4) * 2;
				return (
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
							opacity: 0.22,
						}}
					/>
				);
			})}
		</>
	);
};

const AntShape = ({ size }) => (
	<svg width={size} height={size * 0.62} viewBox="0 0 60 38">
		<ellipse cx="46" cy="22" rx="13" ry="10" fill="#5a3a22" />
		<ellipse cx="28" cy="20" rx="8" ry="7" fill="#6b4426" />
		<circle cx="14" cy="16" r="8" fill="#6b4426" />
		<path d="M10 10 Q6 2 2 4 M16 8 Q16 0 20 2" stroke="#4a2e18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
		<path
			d="M24 26 L18 36 M30 27 L30 38 M36 26 L42 36 M22 24 L14 32 M34 24 L44 32"
			stroke="#4a2e18"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
	</svg>
);

const MarchingAnts = ({ y, count = 5, speed = 2.4, size = 56, gap = 96 }) => {
	const frame = useCurrentFrame();
	return (
		<>
			{Array.from({ length: count }).map((_, i) => {
				const x = -140 + ((frame * speed + i * gap) % (WIDTH + 280));
				const bob = Math.sin(frame * 0.5 + i * 1.7) * 2.5;
				return (
					<div key={i} style={{ position: "absolute", left: x, top: y + bob }}>
						<AntShape size={size} />
					</div>
				);
			})}
		</>
	);
};

const SunRays = ({ cx = 540, cy = 820, size = 1600 }) => {
	const frame = useCurrentFrame();
	const rot = frame * 0.03;
	return (
		<div
			style={{
				position: "absolute",
				left: cx - size / 2,
				top: cy - size / 2,
				width: size,
				height: size,
				borderRadius: "50%",
				background:
					"repeating-conic-gradient(from 0deg, rgba(255,233,168,0.13) 0deg 5deg, transparent 5deg 16deg)",
				transform: `rotate(${rot}deg)`,
				WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 68%)",
				maskImage: "radial-gradient(circle, black 0%, transparent 68%)",
			}}
		/>
	);
};

const GlowPulse = ({ cx = 540, cy = 1150 }) => {
	const frame = useCurrentFrame();
	const s = 1 + Math.sin(frame * 0.06) * 0.05;
	const o = 0.2 + Math.sin(frame * 0.06) * 0.06;
	return (
		<div
			style={{
				position: "absolute",
				left: cx - 420,
				top: cy - 420,
				width: 840,
				height: 840,
				borderRadius: "50%",
				background: "radial-gradient(circle, rgba(255,236,180,0.55) 0%, transparent 65%)",
				opacity: o,
				transform: `scale(${s})`,
			}}
		/>
	);
};

const SceneOverlays = ({ index }) => {
	if (index === 0) {
		return (
			<>
				<Cloud y={150} speed={0.55} scale={1.1} offset={80} />
				<Cloud y={330} speed={0.35} scale={0.8} offset={620} />
				<Birds
					items={[
						{ y: 210, speed: 3.2, size: 46, offset: 0 },
						{ y: 280, speed: 2.7, size: 36, offset: 300 },
						{ y: 170, speed: 3.8, size: 30, offset: 700 },
						{ y: 420, speed: 2.4, size: 40, offset: 150 },
					]}
				/>
				<Dust />
			</>
		);
	}
	if (index === 1) {
		return (
			<>
				<MarchingAnts y={1560} count={5} speed={2.6} size={58} gap={100} />
				<MarchingAnts y={1700} count={4} speed={1.9} size={44} gap={130} />
				<Dust count={10} />
			</>
		);
	}
	if (index === 2) {
		return (
			<>
				<MarchingAnts y={1620} count={6} speed={2.2} size={50} gap={88} />
				<Birds
					items={[
						{ y: 190, speed: 3.0, size: 40, offset: 200 },
						{ y: 260, speed: 2.5, size: 32, offset: 600 },
					]}
				/>
				<Dust count={10} />
			</>
		);
	}
	return (
		<>
			<SunRays />
			<GlowPulse />
			<Cloud y={200} speed={0.4} scale={0.9} offset={300} />
			<Birds
				items={[
					{ y: 240, speed: 2.8, size: 38, offset: 100 },
					{ y: 320, speed: 2.3, size: 30, offset: 500 },
					{ y: 180, speed: 3.4, size: 26, offset: 800 },
				]}
			/>
			<Dust count={10} />
		</>
	);
};

// --- v4 scene pieces -------------------------------------------------------

// Shot-cut camera: the active shot is picked by local frame; inside a shot
// the camera moves smoothly, and at every shot boundary the framing jumps
// (hard cut) with a small settle overshoot for energy.
const SceneImage = ({ img, index, punchAt }) => {
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
					transform: `translate(${lerp(shot.from.x, shot.to.x)}px, ${lerp(shot.from.y, shot.to.y)}px) scale(${lerp(shot.from.s, shot.to.s) * settle * (1 + punch)}) rotate(${rot}deg)`,
					transformOrigin: "center center",
				}}
			/>
		</div>
	);
};

// Phrase captions: each phrase pops in with a slight word stagger, holds,
// then fades out right before the next phrase arrives.
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

// Speech bubble for the ant's shout (scene 2): white bubble with a tail
// pointing down-left toward the warning ant, popping in with a wiggle.
const SpeechBubble = ({ at, dur }) => {
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
				left: 70,
				top: 880,
				width: 720,
				opacity,
				transform: `scale(${Math.max(pop, 0.01)}) rotate(${wiggle}deg)`,
				transformOrigin: "20% 100%",
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
				Wahai semut-semut, masuklah ke sarang kalian, agar tidak terinjak!
			</div>
			<div
				style={{
					position: "absolute",
					left: 64,
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

// Small character label pill, popping in and staying for the scene.
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

const SceneLabels = ({ index }) => {
	if (index === 0) {
		return <Label text="NABI SULAIMAN" at={15} style={{ top: 64, left: 56 }} />;
	}
	if (index === 1) {
		return <Label text="SEMUT" at={10} style={{ top: 64, right: 56 }} />;
	}
	if (index === 2) {
		return <Label text="NABI SULAIMAN" at={10} style={{ top: 64, right: 56 }} />;
	}
	return null;
};

// Typed reference box, top-left, from scene 2 until the end.
const RefBox = () => {
	const frame = useCurrentFrame();
	if (frame < REFBOX_FROM) {
		return null;
	}
	const text = "QS AN-NAML: 18-19";
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

// End card overlay (frames 830-900): dark gradient rises over the last
// scene, title + reference + lesson fade and rise in.
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
					Kisah Nabi Sulaiman
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: YELLOW, marginTop: 18 }}>
					QS An-Naml: 18–19
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
					Sekecil apa pun makhluk, Allah mendengar suaranya.
				</div>
			</div>
		</AbsoluteFill>
	);
};

// One DIFFERENT entrance transition per scene boundary:
// 1: slide from the right, 2: iris circle opening, 3: zoom in from 1.3x.
// Scene 2 also zooms out + dims in its last frames (zoom-through with 3).
const Scene = ({ scene, index }) => {
	const frame = useCurrentFrame();
	let opacity = 1;
	let transform = "";
	let clipPath;
	if (index === 1) {
		opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
		const sx = interpolate(frame, [0, 14], [WIDTH, 0], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		transform = `translateX(${sx}px)`;
	} else if (index === 2) {
		opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
		const r = interpolate(frame, [0, 12], [0, 75], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		clipPath = `circle(${r}% at 50% 50%)`;
		const outro = interpolate(frame, [scene.frames - 14, scene.frames], [0, 1], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		});
		opacity *= 1 - 0.5 * outro;
		transform = `scale(${1 - 0.06 * outro})`;
	} else if (index === 3) {
		opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
		const zs = interpolate(frame, [0, 14], [1.3, 1], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		transform = `scale(${zs})`;
	}
	return (
		<AbsoluteFill style={{ opacity, transform, clipPath }}>
			<SceneImage img={scene.img} index={index} punchAt={index === 1 ? 135 : null} />
			<SceneOverlays index={index} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"linear-gradient(to top, rgba(10,6,2,0.42) 0%, rgba(10,6,2,0) 34%)",
				}}
			/>
			<SceneLabels index={index} />
			{index === 1 && <SpeechBubble at={130} dur={100} />}
			<PhraseText phrases={PHRASES[index]} fadeOutAt={index === 3 ? 125 : null} />
		</AbsoluteFill>
	);
};

export const SulaimanSemut = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{SCENES.map((s, i) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
					<Scene scene={s} index={i} />
				</Sequence>
			))}
			<Sequence from={ENDCARD_FROM} durationInFrames={ENDCARD_FRAMES}>
				<EndCard />
			</Sequence>
			<RefBox />
			<ProgressBar />
			{SCENES.map((s) => (
				<Sequence key={`audio-${s.id}`} from={s.audioFrom} durationInFrames={s.audioFrames + 6}>
					<Audio src={staticFile(s.audio)} />
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
