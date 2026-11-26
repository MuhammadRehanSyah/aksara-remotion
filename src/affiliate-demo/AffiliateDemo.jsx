import {
	AbsoluteFill,
	OffthreadVideo,
	Sequence,
	continueRender,
	delayRender,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { CHUNKS, WORDS } from "./captions";

export const FPS = 24; // matches the Flow source clip (24 fps) to avoid resampling judder
export const WIDTH = 1280;
export const HEIGHT = 720;
export const DURATION = 240; // 10 seconds

const FONT = "Poppins, sans-serif";
const YELLOW = "#FFD23F";
const GREEN_DARK = "#0A3B2E";
const GREEN = "#17A673";
const INK = "#10231C";

// Local Poppins files (public/fonts/) — same pattern as Reels002.
const fontHandle = delayRender("Loading Poppins fonts");
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

const Captions = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;
	const chunk = CHUNKS.find((c) => t >= c.from && t < c.to);
	if (!chunk) return null;
	const local = frame - Math.round(chunk.from * fps);
	const scale = spring({ frame: local, fps, config: { damping: 14, stiffness: 180 } });
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 64,
				display: "flex",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					display: "flex",
					gap: 14,
					backgroundColor: "rgba(0,0,0,0.55)",
					padding: "16px 32px",
					borderRadius: 999,
					transform: `scale(${scale})`,
				}}
			>
				{chunk.words.map((wi) => {
					const w = WORDS[wi];
					const active = t >= w.start && t < w.end;
					return (
						<span
							key={wi}
							style={{
								fontFamily: FONT,
								fontWeight: 700,
								fontSize: 44,
								lineHeight: 1.2,
								color: active ? YELLOW : "#FFFFFF",
								display: "inline-block",
								transform: active ? "scale(1.12)" : "scale(1)",
								transition: "none",
							}}
						>
							{w.text}
						</span>
					);
				})}
			</div>
		</div>
	);
};

const ProductCard = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const s = spring({ frame, fps, config: { damping: 13, stiffness: 160 } });
	const opacity = interpolate(frame, [0, 12], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return (
		<div
			style={{
				position: "absolute",
				top: 40,
				left: 40,
				backgroundColor: "#FFFFFF",
				borderRadius: 24,
				padding: "20px 26px",
				boxShadow: "0 18px 50px rgba(0,0,0,0.30)",
				transform: `scale(${s})`,
				opacity,
				width: 360,
			}}
		>
			<div
				style={{
					display: "inline-block",
					backgroundColor: YELLOW,
					color: INK,
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 20,
					letterSpacing: 2,
					padding: "6px 14px",
					borderRadius: 999,
				}}
			>
				PRODUK
			</div>
			<div
				style={{
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 34,
					color: INK,
					marginTop: 12,
					lineHeight: 1.15,
				}}
			>
				Serum Wajah
			</div>
			<div
				style={{
					fontFamily: FONT,
					fontWeight: 500,
					fontSize: 22,
					color: "#4A5A52",
					marginTop: 6,
				}}
			>
				Ringan • Cepat menyerap
			</div>
			<div
				style={{
					display: "inline-block",
					backgroundColor: GREEN,
					color: "#FFFFFF",
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 22,
					padding: "10px 20px",
					borderRadius: 999,
					marginTop: 16,
				}}
			>
				Link di bio 🛒
			</div>
		</div>
	);
};

const CtaBanner = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const p = interpolate(frame, [0, 14], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 56,
				display: "flex",
				justifyContent: "center",
				opacity: p,
				transform: `translateY(${(1 - p) * 40}px)`,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 24,
					backgroundColor: GREEN_DARK,
					padding: "20px 30px",
					borderRadius: 999,
					boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
				}}
			>
				<span
					style={{
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 34,
						color: "#FFFFFF",
					}}
				>
					Hasilnya kelihatan dalam seminggu ✨
				</span>
				<span
					style={{
						backgroundColor: YELLOW,
						color: INK,
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 26,
						padding: "12px 24px",
						borderRadius: 999,
						whiteSpace: "nowrap",
					}}
				>
					Cek link di bio
				</span>
			</div>
		</div>
	);
};

export const AffiliateDemo = () => {
	const frame = useCurrentFrame();
	const progress = Math.min(1, frame / DURATION);
	return (
		<AbsoluteFill style={{ backgroundColor: "#000000" }}>
			<OffthreadVideo
				src={staticFile("video/flow-serum.mp4")}
				style={{ width: "100%", height: "100%", objectFit: "cover" }}
			/>
			<Captions />
			<Sequence from={48} durationInFrames={DURATION - 48}>
				<ProductCard />
			</Sequence>
			<Sequence from={190} durationInFrames={DURATION - 190}>
				<CtaBanner />
			</Sequence>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 8,
					backgroundColor: "rgba(255,255,255,0.25)",
				}}
			>
				<div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: YELLOW }} />
			</div>
		</AbsoluteFill>
	);
};
