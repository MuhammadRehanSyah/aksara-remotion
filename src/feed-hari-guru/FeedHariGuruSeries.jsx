import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT, fadeUp, pop } from "./ui";
import { TOTAL_FRAMES } from "./timings";

// Same Poppins loading as Post 1.
const fontHandle = delayRender("Loading Poppins fonts (series)");
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

// Generic motion flyer — same motion system as Post 1:
// LottieFiles Corporate + Energetic, Emil ease-out, slow zoom, gold rule,
// logo appears smoothly at the end, gold progress bar.
const MotionFlyer = ({ photo, objectPosition, kicker, line1, line2, sub, bodyLines }) => {
	const frame = useCurrentFrame();
	const progress = frame / TOTAL_FRAMES;
	const zoom = interpolate(frame, [0, TOTAL_FRAMES], [1, 1.08], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const scrimOpacity = interpolate(frame, [0, 15], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Urutan brief final 15 detik: 0-2s zoom, 2-5s headline, 5-8s sub,
	// 8-12s tanggal + logo + isi, 12-15s hold.
	const kickerA = fadeUp(frame, 240);
	const line1A = fadeUp(frame, 60);
	const line2A = fadeUp(frame, 74);
	const subA = fadeUp(frame, 150);
	const bodyA = fadeUp(frame, 270);
	const footA = fadeUp(frame, 360);
	const ruleScale = interpolate(frame, [70, 82], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const logoScale = pop(frame, 240);
	const logoFade = fadeUp(frame, 240, 12);

	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark, overflow: "hidden" }}>
			<Img
				src={staticFile(photo)}
				style={{
					width: 1080,
					height: 1080,
					objectFit: "cover",
					objectPosition,
					transform: `scale(${zoom})`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 620,
					background: "linear-gradient(to top, rgba(10,59,46,0.97) 0%, rgba(10,59,46,0.75) 55%, rgba(10,59,46,0) 100%)",
					opacity: scrimOpacity,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 54,
					top: 48,
					width: 150,
					height: 150,
					opacity: logoFade.opacity,
					transform: `scale(${logoScale}) translateY(${logoFade.translateY}px)`,
				}}
			>
				<Img src={staticFile("logo-pilar-aksara.png")} style={{ width: 150, height: 150 }} />
			</div>

			<div style={{ position: "absolute", left: 54, top: 520, width: 972 }}>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: COLORS.yellow, opacity: kickerA.opacity, transform: `translateY(${kickerA.translateY}px)` }}>
					{kicker}
				</div>
				<div
					style={{
						width: 80,
						height: 6,
						backgroundColor: COLORS.yellow,
						marginTop: 16,
						transform: `scaleX(${ruleScale})`,
						transformOrigin: "left center",
					}}
				/>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.1, color: COLORS.white, marginTop: 14, opacity: line1A.opacity, transform: `translateY(${line1A.translateY}px)` }}>
					{line1}
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.1, color: COLORS.yellow, opacity: line2A.opacity, transform: `translateY(${line2A.translateY}px)` }}>
					{line2}
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: COLORS.white, marginTop: 16, opacity: subA.opacity, transform: `translateY(${subA.translateY}px)` }}>
					{sub}
				</div>
				<div style={{ marginTop: 12, opacity: bodyA.opacity, transform: `translateY(${bodyA.translateY}px)` }}>
					{bodyLines.map((t) => (
						<div key={t} style={{ fontFamily: FONT, fontWeight: 400, fontSize: 28, lineHeight: 1.4, color: COLORS.light }}>
							{t}
						</div>
					))}
				</div>
			</div>

			<div style={{ position: "absolute", left: 54, bottom: 36, fontFamily: FONT, fontWeight: 700, fontSize: 22, color: COLORS.yellow, opacity: footA.opacity, transform: `translateY(${footA.translateY}px)` }}>
				@aksaracademy&nbsp;&nbsp;•&nbsp;&nbsp;aksaraacademy.biz.id
			</div>
			<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, backgroundColor: "rgba(255,255,255,0.18)" }}>
				<div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: COLORS.yellow }} />
			</div>
		</AbsoluteFill>
	);
};

// Post 2 — Siapa Guru Hebat Itu? Foto Pexels 35548841.
export const FeedHariGuru2 = () => (
	<MotionFlyer
		photo="hari-guru-photo-2.jpg"
		objectPosition="62% 50%"
		kicker="HARI GURU NASIONAL  •  25 NOVEMBER 2026"
		line1="Siapa Guru"
		line2="Hebat Itu?"
		sub="Bukan yang paling pintar —"
		bodyLines={[
			"• yang bikin murid berani mencoba,",
			"• sabar membimbing dan mendoakan,",
			"• hadir setiap hari demi masa depan anak Indonesia.",
		]}
	/>
);

// Post 3 — Kenapa Guru Hebat Bikin Indonesia Kuat? Foto Pexels Bandung.
export const FeedHariGuru3 = () => (
	<MotionFlyer
		photo="hari-guru-photo-3.jpg"
		objectPosition="50% 40%"
		kicker="HARI GURU NASIONAL  •  25 NOVEMBER 2026"
		line1="Guru Hebat,"
		line2="Indonesia Kuat"
		sub="Kenapa? Karena dari ruang kelas —"
		bodyLines={[
			"• guru membentuk karakter generasi penerus,",
			"• dari tangan guru lahir dokter, insinyur, dan pemimpin,",
			"• Indonesia kuat dimulai dari ruang kelas.",
		]}
	/>
);
