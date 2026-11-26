import {
	AbsoluteFill,
	Audio,
	Easing,
	Sequence,
	Video,
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
	TOTAL_FRAMES,
	WIDTH,
} from "../sulaiman/timings";

// v5 — AI-clip version: real character motion comes from the Flow clips
// (720x1280, 24fps, 10s each); Remotion keeps the v4 packaging — phrase
// captions, speech bubble, labels, reference box, the three different
// transitions with their own SFX, TTS narration, and the end card. The
// drawn overlays and shot cuts are dropped: the clips themselves move.
// Clip audio (verified ambient-only, no speech) plays quietly under the
// narration. Clip 3 is the REGENERATED version — the first attempt showed
// the prophet's face in profile and was discarded.

const fontHandle = delayRender("Loading Poppins fonts (sulaiman-flow)");
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

// Same scene boundaries and narration timings as the still-image version;
// each scene uses the first seconds of its 10s clip (clips are longer than
// the scenes, so the Sequence simply cuts them).
const FLOW_SCENES = [
	{ id: "s1", clip: "sulaiman-flow/klip-01.mp4", from: 0, frames: 267, audio: "audio/sulaiman/line1.mp3", audioFrom: 15, audioFrames: 228, zoom: [1.03, 1.1] },
	{ id: "s2", clip: "sulaiman-flow/klip-02.mp4", from: 255, frames: 252, audio: "audio/sulaiman/line2.mp3", audioFrom: 265, audioFrames: 223, zoom: [1.08, 1.02] },
	{ id: "s3", clip: "sulaiman-flow/klip-03.mp4", from: 495, frames: 207, audio: "audio/sulaiman/line3.mp3", audioFrom: 505, audioFrames: 158, zoom: [1.02, 1.09] },
	{ id: "s4", clip: "sulaiman-flow/klip-04.mp4", from: 690, frames: 210, audio: "audio/sulaiman/line4.mp3", audioFrom: 700, audioFrames: 165, zoom: [1.09, 1.03] },
];

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

const PHRASE_POPS = [15, 88, 163, 265, 328, 385, 505, 563, 611, 700, 748];

const TRANSITION_SFX = [
	{ at: 246, file: "audio/sulaiman/whoosh.mp3", vol: 0.5, dur: 18 },
	{ at: 486, file: "audio/sulaiman/sparkle.mp3", vol: 0.5, dur: 14 },
	{ at: 681, file: "audio/sulaiman/thump.mp3", vol: 0.6, dur: 11 },
	{ at: 812, file: "audio/sulaiman/riser.mp3", vol: 0.45, dur: 15 },
];

// Gentle continuous camera over the moving clip: one slow zoom per scene,
// alternating direction. No hard cuts — the clip's own motion carries it.
const SceneClip = ({ clip, zoom, frames }) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, frames], [zoom[0], zoom[1]]);
	return (
		<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
			<Video
				src={staticFile(clip)}
				volume={0.3}
				style={{
					width: WIDTH,
					height: HEIGHT,
					transform: `scale(${scale})`,
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

// Same three entrance transitions as v4: slide, iris, zoom-through.
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
			<SceneClip clip={scene.clip} zoom={scene.zoom} frames={scene.frames} />
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

export const SulaimanFlow = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{FLOW_SCENES.map((s, i) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
					<Scene scene={s} index={i} />
				</Sequence>
			))}
			<Sequence from={ENDCARD_FROM} durationInFrames={ENDCARD_FRAMES}>
				<EndCard />
			</Sequence>
			<RefBox />
			<ProgressBar />
			{FLOW_SCENES.map((s) => (
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
