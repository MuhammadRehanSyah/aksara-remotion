import {
	AbsoluteFill,
	Audio,
	Img,
	Sequence,
	continueRender,
	delayRender,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
} from "remotion";
import { ENDCARD_FRAMES, ENDCARD_FROM, FPS, LINES, SCENES } from "./timings";

// Local Poppins files (public/fonts/) — Google Fonts fetch stalls in this VM,
// so the fonts are bundled locally and loaded via FontFace before rendering.
const fontHandle = delayRender("Loading Poppins fonts (drama)");
Promise.all(
	[400, 500, 600, 700, 800].map(async (weight) => {
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
const INK = "#1a1a1a";

// Scene 1 and 2 images are 1920x1280 (3:2): slow vertical drift inside the
// 1920x1080 frame reveals the full picture over the scene. Scene 3 is 16:9:
// slow zoom instead.
const SceneImage = ({ img, drift }) => {
	const frame = useCurrentFrame();
	const pop = spring({ frame, fps: FPS, config: { damping: 16, stiffness: 160 } });
	const entryScale = interpolate(pop, [0, 1], [1.05, 1]);
	if (drift === "down") {
		const y = interpolate(frame, [0, 300], [0, -200], { extrapolateRight: "clamp" });
		return (
			<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
				<Img src={staticFile(img)} style={{ width: 1920, height: 1280, transform: `translateY(${y}px) scale(${entryScale})`, transformOrigin: "center center" }} />
			</div>
		);
	}
	if (drift === "up") {
		const y = interpolate(frame, [0, 300], [-200, 0], { extrapolateRight: "clamp" });
		return (
			<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
				<Img src={staticFile(img)} style={{ width: 1920, height: 1280, transform: `translateY(${y}px) scale(${entryScale})`, transformOrigin: "center center" }} />
			</div>
		);
	}
	const zoom = interpolate(frame, [0, 300], [1.0, 1.07], { extrapolateRight: "clamp" });
	return (
		<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
			<Img src={staticFile(img)} style={{ width: 1920, height: 1080, transform: `scale(${zoom * entryScale})`, transformOrigin: "center center" }} />
		</div>
	);
};

const SpeechBubble = ({ line }) => {
	const frame = useCurrentFrame();
	const local = frame - line.start;
	const pop = spring({ frame: local, fps: FPS, config: { damping: 11, stiffness: 220 } });
	const fadeOut = interpolate(frame, [line.end - 8, line.end + 6], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	if (local < 0 || frame > line.end + 6) {
		return null;
	}
	const isLeft = line.side === "left";
	return (
		<div
			style={{
				position: "absolute",
				top: line.top,
				...(isLeft ? { left: 90 } : { right: 90 }),
				maxWidth: 800,
				opacity: fadeOut,
				transform: `scale(${pop})`,
				transformOrigin: isLeft ? "top left" : "top right",
			}}
		>
			<div
				style={{
					display: "inline-block",
					backgroundColor: line.color,
					color: "#fff",
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 30,
					letterSpacing: 3,
					padding: "8px 24px",
					borderRadius: 999,
					border: `4px solid ${INK}`,
					marginBottom: -8,
					marginLeft: 18,
					position: "relative",
					zIndex: 2,
				}}
			>
				{line.speaker}
			</div>
			<div
				style={{
					backgroundColor: "#fff",
					color: INK,
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 44,
					lineHeight: 1.28,
					padding: "26px 34px",
					borderRadius: 36,
					border: `6px solid ${INK}`,
					boxShadow: "0 16px 40px rgba(0,0,0,0.30)",
					position: "relative",
				}}
			>
				{line.text}
				<div
					style={{
						position: "absolute",
						bottom: -20,
						...(isLeft ? { left: 90 } : { right: 90 }),
						width: 34,
						height: 34,
						backgroundColor: "#fff",
						borderRight: `6px solid ${INK}`,
						borderBottom: `6px solid ${INK}`,
						transform: "rotate(45deg)",
					}}
				/>
			</div>
		</div>
	);
};

// Storyboard overlay, scene 1 only: "Tanggal 29 — Dompet Kritis",
// top-left, gone by second 4 (frame 120).
const DateStamp = () => {
	const frame = useCurrentFrame();
	const pop = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 200 } });
	const opacity = interpolate(frame, [104, 120], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	if (frame > 120) {
		return null;
	}
	return (
		<div
			style={{
				position: "absolute",
				top: 52,
				left: 90,
				fontFamily: FONT,
				fontWeight: 800,
				fontSize: 42,
				color: "#FFD23F",
				textShadow: "3px 3px 0 #1a1a1a, -2px -2px 0 #1a1a1a, 2px -2px 0 #1a1a1a, -2px 2px 0 #1a1a1a",
				transform: `rotate(-3deg) scale(${pop})`,
				opacity,
			}}
		>
			Tanggal 29 — Dompet Kritis
		</div>
	);
};

const Scene1 = () => (
	<AbsoluteFill>
		<SceneImage img="drama/scene1.png" drift="down" />
		<DateStamp />
	</AbsoluteFill>
);

const Scene2 = () => (
	<AbsoluteFill>
		<SceneImage img="drama/scene2.png" drift="up" />
	</AbsoluteFill>
);

const Scene3 = () => (
	<AbsoluteFill>
		<SceneImage img="drama/scene3.png" drift="zoom" />
	</AbsoluteFill>
);

// End card (frames 840-900): crossfade to Meng's close-up, iris circle
// closes onto his face, title text on black.
const EndCard = () => {
	const frame = useCurrentFrame();
	const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
	const zoom = interpolate(frame, [0, 60], [1.05, 1.12], { extrapolateRight: "clamp" });
	const radius = interpolate(frame, [4, 34], [1600, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const titleOpacity = interpolate(frame, [26, 42], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const titleY = interpolate(frame, [26, 42], [30, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return (
		<AbsoluteFill style={{ opacity: fadeIn }}>
			<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
				<Img
					src={staticFile("drama/endcard.png")}
					style={{ width: 1920, height: 1280, transform: `translateY(-100px) scale(${zoom})`, transformOrigin: "center center" }}
				/>
			</div>
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: "#000",
					WebkitMaskImage: `radial-gradient(circle ${radius}px at 50% 46%, transparent 0, transparent ${radius}px, black ${radius + 2}px)`,
					maskImage: `radial-gradient(circle ${radius}px at 50% 46%, transparent 0, transparent ${radius}px, black ${radius + 2}px)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					opacity: titleOpacity,
					transform: `translateY(${titleY}px)`,
				}}
			>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 108, color: "#fff", letterSpacing: 1 }}>
					Drama Siang Bolong
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 46, color: "#FFD23F", marginTop: 22 }}>
					Karena Kucing Oranye Selalu Menang.
				</div>
			</div>
		</AbsoluteFill>
	);
};

const SCENE_COMPONENTS = [Scene1, Scene2, Scene3];

export const DramaSiangBolong = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "#000" }}>
			{SCENES.map((s, i) => {
				const Comp = SCENE_COMPONENTS[i];
				return (
					<Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
						<Comp />
					</Sequence>
				);
			})}
			<Sequence from={ENDCARD_FROM} durationInFrames={ENDCARD_FRAMES}>
				<EndCard />
			</Sequence>
			{LINES.map((line) => (
				<Sequence key={line.id} from={line.start} durationInFrames={line.frames + 10}>
					<Audio src={staticFile(line.audio)} />
				</Sequence>
			))}
			{LINES.map((line) => (
				<SpeechBubble key={`bubble-${line.id}`} line={line} />
			))}
		</AbsoluteFill>
	);
};
