import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT, fadeUp, pop } from "./ui";
import { TOTAL_FRAMES } from "./timings";

// Feed 26 Nov 2026 — Puncak Bulan Guru Nasional. CAROUSEL slide 1 (revisi
// gaya referensi IG 25 Nov 12.56 WIB: hook relatable "Pernah gak sih...").
// 1080x1080, 30fps, 15 detik (450 frame). Urutan animasi sama seperti
// brief final Hari Guru: 0-2s zoom, 2-5s headline, 5-8s sub, 8-12s
// tanggal + logo + isi, 12-15s hold + aksen kuning bergerak.
// Foto real Pexels 5212342 (Max Fischer), belum dipakai di carousel 25 Nov.

const fontHandle = delayRender("Loading Poppins fonts (26nov)");
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

const POINTS = [
	"Apa yang guru ajarkan, yang masih kita pakai sampai hari ini.",
];

export const FeedPuncakBulanGuru = () => {
	const frame = useCurrentFrame();
	const progress = frame / TOTAL_FRAMES;
	const zoom = interpolate(frame, [0, TOTAL_FRAMES], [1, 1.08], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const scrimOpacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const line1 = fadeUp(frame, 60);
	const line2 = fadeUp(frame, 74);
	const sub = fadeUp(frame, 150);
	const date = fadeUp(frame, 240);
	const body = fadeUp(frame, 270);
	const closing = fadeUp(frame, 300);
	const foot = fadeUp(frame, 360);
	const ruleScale = interpolate(frame, [70, 82], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const logoScale = pop(frame, 240);
	const logoFade = fadeUp(frame, 240, 12);
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
			<Img
				src={staticFile("puncak-bulan-guru-photo.jpg")}
				style={{ width: 1080, height: 1080, objectFit: "cover", objectPosition: "50% 45%", transform: `scale(${zoom})` }}
			/>
			<div
				style={{
					position: "absolute", left: 0, right: 0, bottom: 0, height: 620,
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

			<div style={{ position: "absolute", left: 54, top: 500, width: 972 }}>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 25, letterSpacing: 1, color: COLORS.yellow, opacity: date.opacity, transform: `translateY(${date.translateY}px)` }}>
					PUNCAK BULAN GURU NASIONAL&nbsp;&nbsp;•&nbsp;&nbsp;26 NOVEMBER 2026
				</div>
				<div style={{ width: 80, height: 6, backgroundColor: COLORS.yellow, marginTop: 14, transform: `scaleX(${ruleScale})`, transformOrigin: "left center" }} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: COLORS.white, marginTop: 12, opacity: line1.opacity, transform: `translateY(${line1.translateY}px)` }}>
					Pernah gak sih,
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: COLORS.yellow, opacity: line2.opacity, transform: `translateY(${line2.translateY}px)` }}>
					kangen masa sekolah?
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 28, lineHeight: 1.35, color: COLORS.light, marginTop: 10, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Sehari setelah Hari Guru, coba ingat lagi...
				</div>
				<div style={{ marginTop: 8, opacity: body.opacity, transform: `translateY(${body.translateY}px)` }}>
					{POINTS.map((t) => (
						<div key={t} style={{ fontFamily: FONT, fontWeight: 400, fontSize: 28, lineHeight: 1.35, color: COLORS.light }}>
							{t}
						</div>
					))}
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: COLORS.yellow, marginTop: 10, opacity: closing.opacity, transform: `translateY(${closing.translateY}px)` }}>
					Geser untuk mengingat lagi →
				</div>
			</div>

			<div style={{ position: "absolute", left: 54, bottom: 36, fontFamily: FONT, fontWeight: 700, fontSize: 22, color: COLORS.yellow, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
				@aksaracademy&nbsp;&nbsp;•&nbsp;&nbsp;aksaraacademy.biz.id
			</div>
			<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, backgroundColor: "rgba(255,255,255,0.18)" }}>
				<div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: COLORS.yellow }} />
			</div>
			<div
				style={{
					position: "absolute", left: dotX, bottom: 22, width: 18, height: 18,
					borderRadius: "50%", backgroundColor: COLORS.yellow, opacity: dotOpacity,
				}}
			/>
		</AbsoluteFill>
	);
};
