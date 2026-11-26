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

// Storyboard build — the approved 6-panel sheet, built exactly to the plan
// written under each panel:
// P1 0-5s: slow push-in, phrase-by-phrase text.
// P2 5-9s: zoom in, then hard cut. Label: NABI SULAIMAN.
// P3 9-13s: slide + whoosh entrance. Typed ref box QS AN-NAML: 18-19.
// P4 13-17s: speech bubble + zoom punch (the ant's shout).
// P5 17-23s: iris + sparkle entrance. Label: NABI SULAIMAN.
// P6 23-30s: zoom-through + thump entrance, end card + lesson.
// Camera never rests: zoom direction alternates panel to panel, and P5
// (the longest panel) cuts mid-panel to a new framing at its third phrase.
// Same narration, SFX and end card as the earlier Sulaiman versions.

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const TOTAL_FRAMES = 900; // exactly 30.000 s
const ENDCARD_FROM = 830;
const ENDCARD_FRAMES = 70;
const REFBOX_FROM = 270;

const fontHandle = delayRender("Loading Poppins fonts (storyboard)");
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
	{ id: "p1", from: 0, frames: 150, img: "sulaiman-storyboard/panel1.jpg" },
	{ id: "p2", from: 150, frames: 120, img: "sulaiman-storyboard/panel2.jpg" },
	{ id: "p3", from: 270, frames: 120, img: "sulaiman-storyboard/panel3.jpg" },
	{ id: "p4", from: 390, frames: 120, img: "sulaiman-storyboard/panel4.jpg" },
	{ id: "p5", from: 510, frames: 180, img: "sulaiman-storyboard/panel5.jpg" },
	{ id: "p6", from: 690, frames: 210, img: "sulaiman-storyboard/panel6.jpg" },
];

// Narration: the same 4 lines at the same global positions as before.
const NARRATION = [
	{ from: 15, frames: 229, file: "audio/sulaiman/line1.mp3" },
	{ from: 265, frames: 224, file: "audio/sulaiman/line2.mp3" },
	{ from: 505, frames: 159, file: "audio/sulaiman/line3.mp3" },
	{ from: 700, frames: 166, file: "audio/sulaiman/line4.mp3" },
];

// Phrase captions, in LOCAL panel frames.
const PHRASES = [
	[
		{ words: [{ w: "NABI" }, { w: "SULAIMAN", hi: true }, { w: "BERJALAN" }], at: 15, dur: 70 },
		{ words: [{ w: "BERSAMA" }, { w: "PASUKANNYA", hi: true }, { w: "YANG" }, { w: "BESAR" }], at: 88, dur: 60 },
	],
	[
		{ words: [{ w: "MANUSIA," }, { w: "JIN,", hi: true }, { w: "DAN" }, { w: "BURUNG" }], at: 13, dur: 75 },
	],
	[
		{ words: [{ w: "SAMPAI" }, { w: "DI" }, { w: "LEMBAH" }, { w: "SEMUT" }], at: 2, dur: 58 },
		{ words: [{ w: "SEEKOR" }, { w: "SEMUT" }, { w: "BERTERIAK:" }], at: 60, dur: 55 },
	],
	[], // P4: the shout lives in the speech bubble, not in a caption.
	[
		{ words: [{ w: "NABI" }, { w: "SULAIMAN" }, { w: "MENDENGARNYA", hi: true }], at: 2, dur: 55 },
		{ words: [{ w: "DAN" }, { w: "TERSENYUM" }], at: 60, dur: 45 },
		{ words: [{ w: "MEMAHAMI" }, { w: "BAHASA", hi: true }, { w: "HEWAN", hi: true }], at: 108, dur: 55 },
	],
	[
		{ words: [{ w: "IA" }, { w: "PUN" }, { w: "BERDOA" }], at: 10, dur: 45 },
		{ words: [{ w: "BERSYUKUR" }, { w: "ATAS" }, { w: "NIKMAT", hi: true }, { w: "ALLAH", hi: true }], at: 58, dur: 55 },
	],
];

// Camera shots, in LOCAL panel frames. One continuous move per shot; the
// cut between shots is a hard jump, zoom direction alternates.
const SHOTS = [
	[{ at: 0, dur: 150, from: { s: 1.03, x: 0, y: 6 }, to: { s: 1.1, x: -10, y: -6 } }],
	[{ at: 0, dur: 120, from: { s: 1.02, x: 10, y: -4 }, to: { s: 1.09, x: -8, y: 6 } }],
	[{ at: 0, dur: 120, from: { s: 1.09, x: -10, y: 6 }, to: { s: 1.02, x: 8, y: -6 } }],
	[{ at: 0, dur: 120, from: { s: 1.02, x: 0, y: 0 }, to: { s: 1.08, x: -12, y: -4 } }],
	[
		{ at: 0, dur: 108, from: { s: 1.08, x: 8, y: -6 }, to: { s: 1.02, x: -8, y: 6 } },
		{ at: 108, dur: 72, from: { s: 1.02, x: -8, y: 6 }, to: { s: 1.1, x: 10, y: -8 } },
	],
	[{ at: 0, dur: 210, from: { s: 1.03, x: 0, y: 0 }, to: { s: 1.1, x: -10, y: 8 } }],
];

const PHRASE_POPS = [15, 88, 163, 272, 330, 512, 570, 618, 700, 748];

const TRANSITION_SFX = [
	{ at: 262, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 502, file: "audio/sulaiman/sparkle.mp3", vol: 0.5, dur: 14 },
	{ at: 682, file: "audio/sulaiman/thump.mp3", vol: 0.6, dur: 11 },
	{ at: 812, file: "audio/sulaiman/riser.mp3", vol: 0.45, dur: 15 },
];

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
		return <Label text="NABI SULAIMAN" at={13} style={{ top: 64, left: 56 }} />;
	}
	if (index === 4) {
		return <Label text="NABI SULAIMAN" at={10} style={{ top: 64, right: 56 }} />;
	}
	return null;
};

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

// Entrance transitions per the approved sheet:
// P1: fade in. P2: hard cut. P3: slide from the right. P4: hard cut.
// P5: iris circle opening. P6: zoom in from 1.3x (zoom-through).
const Panel = ({ panel, index }) => {
	const frame = useCurrentFrame();
	let opacity = 1;
	let transform = "";
	let clipPath;
	if (index === 0) {
		opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
	} else if (index === 2) {
		opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
		const sx = interpolate(frame, [0, 14], [WIDTH, 0], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		transform = `translateX(${sx}px)`;
	} else if (index === 4) {
		opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
		const r = interpolate(frame, [0, 12], [0, 75], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		clipPath = `circle(${r}% at 50% 50%)`;
	} else if (index === 5) {
		opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
		const zs = interpolate(frame, [0, 14], [1.3, 1], {
			extrapolateRight: "clamp",
			easing: Easing.out(Easing.cubic),
		});
		transform = `scale(${zs})`;
	}
	return (
		<AbsoluteFill style={{ opacity, transform, clipPath }}>
			<PanelImage img={panel.img} index={index} punchAt={index === 3 ? 30 : null} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"linear-gradient(to top, rgba(10,6,2,0.42) 0%, rgba(10,6,2,0) 34%)",
				}}
			/>
			<PanelLabels index={index} />
			{index === 3 && <SpeechBubble at={30} dur={80} />}
			<PhraseText phrases={PHRASES[index]} fadeOutAt={index === 5 ? 125 : null} />
		</AbsoluteFill>
	);
};

export const SulaimanStoryboard = () => {
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

export const STORYBOARD_FPS = FPS;
export const STORYBOARD_WIDTH = WIDTH;
export const STORYBOARD_HEIGHT = HEIGHT;
export const STORYBOARD_FRAMES = TOTAL_FRAMES;
