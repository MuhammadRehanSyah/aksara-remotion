import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT, fadeUp, pop } from "./ui";

// Seri final Post 2 & 3 — motion singkat 10 detik (300 frame, 30fps).
// Urutan (skala brief final): 0-1.3s zoom, 1.3-3.3s headline, 3.3-5.3s isi,
// 5.3-8s tanggal+logo+penutup, 8-10s hold + aksen kuning bergerak.
const FPS = 30;
const TOTAL = 300;

const fontHandle = delayRender("Loading Poppins fonts (series10)");
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

const MotionFlyer10 = ({ photo, objectPosition, kicker, line1, line2, points, closing }) => {
	const frame = useCurrentFrame();
	const progress = frame / TOTAL;
	const zoom = interpolate(frame, [0, TOTAL], [1, 1.06], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const scrimOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const kickerA = fadeUp(frame, 160);
	const line1A = fadeUp(frame, 40);
	const line2A = fadeUp(frame, 50);
	const bodyA = fadeUp(frame, 100);
	const closingA = fadeUp(frame, 180);
	const footA = fadeUp(frame, 240);
	const ruleScale = interpolate(frame, [47, 55], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const logoScale = pop(frame, 160);
	const logoFade = fadeUp(frame, 160, 12);

	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark, overflow: "hidden" }}>
			<Img
				src={staticFile(photo)}
				style={{ width: 1080, height: 1080, objectFit: "cover", objectPosition, transform: `scale(${zoom})` }}
			/>
			<div
				style={{
					position: "absolute", left: 0, right: 0, bottom: 0, height: 640,
					background: "linear-gradient(to top, rgba(10,59,46,0.97) 0%, rgba(10,59,46,0.75) 55%, rgba(10,59,46,0) 100%)",
					opacity: scrimOpacity,
				}}
			/>
			<div
				style={{
					position: "absolute", left: 54, top: 48, width: 150, height: 150,
					opacity: logoFade.opacity, transform: `scale(${logoScale}) translateY(${logoFade.translateY}px)`,
				}}
			>
				<Img src={staticFile("logo-pilar-aksara.png")} style={{ width: 150, height: 150 }} />
			</div>

			<div style={{ position: "absolute", left: 54, top: 480, width: 972 }}>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: COLORS.yellow, opacity: kickerA.opacity, transform: `translateY(${kickerA.translateY}px)` }}>
					{kicker}
				</div>
				<div style={{ width: 80, height: 6, backgroundColor: COLORS.yellow, marginTop: 14, transform: `scaleX(${ruleScale})`, transformOrigin: "left center" }} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.1, color: COLORS.white, marginTop: 12, opacity: line1A.opacity, transform: `translateY(${line1A.translateY}px)` }}>
					{line1}
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.1, color: COLORS.yellow, opacity: line2A.opacity, transform: `translateY(${line2A.translateY}px)` }}>
					{line2}
				</div>
				<div style={{ marginTop: 12, opacity: bodyA.opacity, transform: `translateY(${bodyA.translateY}px)` }}>
					{points.map((t) => (
						<div key={t} style={{ fontFamily: FONT, fontWeight: 400, fontSize: 26, lineHeight: 1.4, color: COLORS.light }}>
							{"•  " + t}
						</div>
					))}
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: COLORS.yellow, marginTop: 12, opacity: closingA.opacity, transform: `translateY(${closingA.translateY}px)` }}>
					{closing}
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

export const FeedHariGuru2Short = () => (
	<MotionFlyer10
		photo="hari-guru-photo-2.jpg"
		objectPosition="62% 50%"
		kicker="HARI GURU NASIONAL  •  25 NOVEMBER 2026"
		line1="Guru Hebat"
		line2="Itu..."
		points={[
			"Bukan yang paling pintar, tapi yang membuat muridnya berani mencoba",
			"Sabar mengajar, membimbing, dan mendoakan muridnya",
			"Hadir setiap hari, meski lelah, demi masa depan anak Indonesia",
		]}
		closing="Guru Hebat, Indonesia Kuat"
	/>
);

export const FeedHariGuru3Short = () => (
	<MotionFlyer10
		photo="hari-guru-photo-3.jpg"
		objectPosition="50% 40%"
		kicker="HARI GURU NASIONAL  •  25 NOVEMBER 2026"
		line1="Kenapa Guru Hebat"
		line2="Bikin Indonesia Kuat?"
		points={[
			"Guru membentuk karakter dan ilmu generasi penerus",
			"Dari tangan guru lahir dokter, insinyur, petani, dan pemimpin",
			"Indonesia kuat dimulai dari ruang kelas yang hangat",
		]}
		closing="Terima kasih, Guru."
	/>
);

export const SERIES10_FPS = FPS;
export const SERIES10_FRAMES = TOTAL;
export const SERIES10_WIDTH = 1080;
export const SERIES10_HEIGHT = 1080;
