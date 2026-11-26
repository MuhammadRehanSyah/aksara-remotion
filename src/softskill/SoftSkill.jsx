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
	LABELS,
	NARRATION,
	PHRASES,
	PHRASE_POPS,
	SCENES,
	TOTAL_FRAMES,
	TRANSITION_SFX,
	WIDTH,
} from "./timings";

// Soft Skill — 30 detik vertikal dari 3 klip Flow (720x1280, 24fps).
// Palet Aksara: hijau tua #0A3B2E, hijau #17A673, kuning #FFD23F.
// Klip asli bersuara ambient saja; narasi TTS vg_id_m41 di atasnya.
// Crossfade 0.5 detik (12 frame) di tiap batas adegan, kamera slow zoom
// bergantian arah supaya tidak ada frame yang terasa diam.

const fontHandle = delayRender("Loading Poppins fonts (soft-skill)");
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
const GREEN_DARK = "#0A3B2E";
const OUTLINE =
	"3px 3px 0 #1a1a1a, -2px -2px 0 #1a1a1a, 2px -2px 0 #1a1a1a, -2px 2px 0 #1a1a1a, 0 8px 24px rgba(0,0,0,0.45)";

const SceneClip = ({ clip, zoom, frames }) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, frames], [zoom[0], zoom[1]]);
	return (
		<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
			<Video
				src={staticFile(clip)}
				volume={0.25}
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

const PhraseText = ({ phrases }) => {
	const frame = useCurrentFrame();
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

const Label = ({ text, at, side }) => {
	const frame = useCurrentFrame();
	if (frame < at) {
		return null;
	}
	const pop = spring({ frame: frame - at, fps: FPS, config: { damping: 14, stiffness: 260 } });
	return (
		<div
			style={{
				position: "absolute",
				top: 64,
				...(side === "left" ? { left: 56 } : { right: 56 }),
				backgroundColor: "rgba(6,35,27,0.78)",
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

const Scene = ({ scene, index }) => {
	const frame = useCurrentFrame();
	// Crossfade masuk 12 frame untuk adegan 2 dan 3; adegan 1 fade-in dari hitam.
	const opacity =
		index === 0
			? interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" })
			: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
	return (
		<AbsoluteFill style={{ opacity }}>
			<SceneClip clip={scene.clip} zoom={scene.zoom} frames={scene.frames} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"linear-gradient(to top, rgba(10,59,46,0.42) 0%, rgba(10,59,46,0) 34%)",
				}}
			/>
			<Label text={LABELS[index]} at={10} side={index === 0 ? "left" : "right"} />
			<PhraseText phrases={PHRASES[index]} />
		</AbsoluteFill>
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
				height: 12,
				backgroundColor: "rgba(255,255,255,0.18)",
			}}
		>
			<div style={{ width: w, height: "100%", backgroundColor: YELLOW }} />
		</div>
	);
};

const EndCard = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
	const y = interpolate(frame, [0, 12], [26, 0], { extrapolateRight: "clamp" });
	return (
		<AbsoluteFill
			style={{
				opacity,
				background:
					"linear-gradient(to top, rgba(6,35,27,0.92) 0%, rgba(6,35,27,0.55) 45%, rgba(6,35,27,0) 78%)",
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 190,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textAlign: "center",
					padding: "0 80px",
					transform: `translateY(${y}px)`,
				}}
			>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: "#fff", letterSpacing: 1 }}>
					AKSARA ACADEMY
				</div>
				<div
					style={{
						width: 220,
						height: 8,
						borderRadius: 4,
						backgroundColor: YELLOW,
						marginTop: 22,
					}}
				/>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, lineHeight: 1.35, color: "#fff", marginTop: 24 }}>
					Belajar bareng di Aksara Academy
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const SoftSkill = () => {
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
			<ProgressBar />
			{NARRATION.map((n) => (
				<Sequence key={`nar-${n.file}`} from={n.from} durationInFrames={n.frames + 6}>
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
