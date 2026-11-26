import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT, fadeUp, pop } from "./ui";
import { TOTAL_FRAMES } from "./timings";

// BRIEF FINAL — Feed Hari Guru Nasional 2026, Motion Flyer
// 1080x1080, 30fps, 15 detik (450 frame).
// Urutan animasi: 0-2s foto slow zoom, 2-5s "Selamat Hari Guru Nasional",
// 5-8s "Guru Hebat, Indonesia Kuat", 8-12s "25 November 2026" + logo,
// 12-15s hold + aksen kuning bergerak.
// Motion: LottieFiles (stagger <500ms, 3 layer) + Emil (ease-out, no scale(0)).

// Poppins bundled locally (public/fonts/) — Google Fonts fetch stalls in VM.
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

export const FeedHariGuru = () => {
	const frame = useCurrentFrame();
	const progress = frame / TOTAL_FRAMES;

	// 0-2s+: foto slow zoom halus, 1.00 -> 1.08 sepanjang 15 detik.
	const zoom = interpolate(frame, [0, TOTAL_FRAMES], [1, 1.08], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Scrim hijau tua dari bawah, fade in 0-1s.
	const scrimOpacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// 2-5s: headline. 5-8s: tema. 8-12s: tanggal + logo + ucapan.
	const line1 = fadeUp(frame, 60);
	const line2 = fadeUp(frame, 74);
	const theme = fadeUp(frame, 150);
	const date = fadeUp(frame, 240);
	const body = fadeUp(frame, 270);
	const foot = fadeUp(frame, 360);

	// Garis kuning tumbuh 2-5s bersama headline (scaleX, bukan width).
	const ruleScale = interpolate(frame, [70, 82], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// 8-12s: logo muncul halus, pop dari 0.95, tidak pernah scale(0).
	const logoScale = pop(frame, 240);
	const logoFade = fadeUp(frame, 240, 12);

	// 12-15s hold: aksen kuning bergerak — dot emas meluncur di atas bar bawah.
	const dotX = interpolate(frame, [360, 450], [54, 1026], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const dotOpacity = interpolate(frame, [360, 375, 435, 450], [0, 1, 1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark, overflow: "hidden" }}>
			{/* Foto real — Pengganti A, guru SD, terverifikasi */}
			<Img
				src={staticFile("hari-guru-photo.jpg")}
				style={{
					width: 1080,
					height: 1080,
					objectFit: "cover",
					objectPosition: "42% 50%",
					transform: `scale(${zoom})`,
				}}
			/>
			{/* Gradient hijau tua #0A3B2E dari bawah untuk ruang teks */}
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 560,
					background: "linear-gradient(to top, rgba(10,59,46,0.96) 0%, rgba(10,59,46,0.72) 55%, rgba(10,59,46,0) 100%)",
					opacity: scrimOpacity,
				}}
			/>
			{/* Logo — file asli, warna asli, kecil, tanpa kotak putih */}
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

			{/* Teks — persis sesuai brief final */}
			<div style={{ position: "absolute", left: 54, top: 580, width: 972 }}>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: 1, color: COLORS.yellow, opacity: date.opacity, transform: `translateY(${date.translateY}px)` }}>
					25 NOVEMBER 2026
				</div>
				<div
					style={{
						width: 80,
						height: 6,
						backgroundColor: COLORS.yellow,
						marginTop: 18,
						transform: `scaleX(${ruleScale})`,
						transformOrigin: "left center",
					}}
				/>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.1, color: COLORS.white, marginTop: 16, opacity: line1.opacity, transform: `translateY(${line1.translateY}px)` }}>
					Selamat Hari
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.1, color: COLORS.yellow, opacity: line2.opacity, transform: `translateY(${line2.translateY}px)` }}>
					Guru Nasional
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: COLORS.white, marginTop: 18, opacity: theme.opacity, transform: `translateY(${theme.translateY}px)` }}>
					Guru Hebat, Indonesia Kuat
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 32, color: COLORS.light, marginTop: 12, opacity: body.opacity, transform: `translateY(${body.translateY}px)` }}>
					Terima kasih, Guru, untuk sabar, ilmu, dan doamu.
				</div>
			</div>

			<div style={{ position: "absolute", left: 54, bottom: 36, fontFamily: FONT, fontWeight: 700, fontSize: 22, color: COLORS.yellow, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
				@aksaracademy&nbsp;&nbsp;•&nbsp;&nbsp;aksaraacademy.biz.id
			</div>

			{/* Aksen kuning bergerak: progress bar + dot emas di fase hold */}
			<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, backgroundColor: "rgba(255,255,255,0.18)" }}>
				<div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: COLORS.yellow }} />
			</div>
			<div
				style={{
					position: "absolute",
					left: dotX,
					bottom: 22,
					width: 18,
					height: 18,
					borderRadius: "50%",
					backgroundColor: COLORS.yellow,
					opacity: dotOpacity,
				}}
			/>
		</AbsoluteFill>
	);
};
