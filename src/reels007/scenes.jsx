import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timings";
import { COLORS, FONT, CheckBullet, fadeUp, pop } from "./ui";

// ---------------------------------------------------------------------------
// Motion system for Reels #007 (from brand.md / MOTION.md + motion skills)
// - LottieFiles: Corporate base (200-400ms, ease-out, 0-3% overshoot);
//   Energetic hook + CTA (100-250ms, ease-out-expo, 15-30% overshoot).
//   Three layers per scene (primary / secondary / ambient), stagger total
//   <500ms, visual change at least every ~3s.
// - Emil Kowalski: key press = scale 0.97 over 100-160ms; never scale(0).
// - REAL PHOTO (aturan Bos 25 Nov, diverifikasi Evaluator):
//   maganghub-batch3a-kickoff.jpg (690x388) — foto kick-off Batch 3A
//   (17 Nov 2026), BUKAN foto acara 3B. Dipakai sebagai ilustrasi program
//   saja: JANGAN beri label apa pun yang menyiratkan itu foto acara 3B.
//   Caption bar: "Program Pemagangan Nasional — foto real" + chip kredit
//   "Foto: Antara" saja. RESOLUSI RENDAH: JANGAN full-bleed — foto tampil
//   dalam kartu 880px dengan bingkai, supaya kelembutannya tidak kelihatan.
//   Foto tampil adegan 1, frame 90-320 (230 frame = 7.67s, >= 2-3 detik).
//   (v1: foto memudar di frame 260 — 2,5 detik terakhir adegan 1 kosong di
//   tengah. v2: foto dipertahankan sampai frame 320, memudar di akhir adegan.)
// - Tanggal: cek eligibilitas 23 Nov-1 Des, TAPI lowongan baru tayang dan
//   baru bisa dilamar 27 Nov-1 Des — keduanya dipisahkan di adegan 3, dan
//   nuansanya ditegaskan lagi di baris bawah adegan 3.
// - v3 (standar HIGH QUALITY Bos 25 Nov 13.35 WIB): adegan 2/3/4 diperkaya —
//   semua kartu/stop masuk CEPAT (stagger total <=30 frame), layout tersebar
//   memenuhi layar (space-evenly), gelembung ambient bergerak pelan, ikon
//   centang + dot aktif + tombol DAFTAR berdenyut, garis timeline terisi
//   progresif. Narasi, teks, fakta, foto, durasi TIDAK berubah.
// ---------------------------------------------------------------------------

// Ambient drifting blob (HIGH QUALITY v3): soft colored circle that drifts
// slowly, so no scene ever sits on a flat empty background.
const Blob = ({ frame, top, left, size, color, phase = 0, amp = 28 }) => {
	const dx = amp * Math.sin(frame / 60 + phase);
	const dy = amp * 0.6 * Math.cos(frame / 75 + phase * 1.3);
	return (
		<div
			style={{
				position: "absolute",
				top,
				left,
				width: size,
				height: size,
				borderRadius: "50%",
				backgroundColor: color,
				opacity: 0.12,
				transform: `translate(${dx}px, ${dy}px)`,
			}}
		/>
	);
};

// --- Scene 1: hook (Energetic) + real photo in a framed card --------------
export const Scene1 = () => {
	const frame = useCurrentFrame();
	const l1 = fadeUp(frame, 0);
	const l2 = fadeUp(frame, 14);
	const num = pop(frame, 40);
	const pulse = 1 + 0.05 * Math.sin((frame - 40) / 7);
	const sub = fadeUp(frame, 62);
	// Real photo: visible frames 90-320 (230 frames = 7.67s).
	// Framed card 880x500 (NOT full-bleed — photo is only 690x388),
	// gentle Ken Burns zoom 1.0 -> 1.08.
	const photoIn = fadeUp(frame, 90, 24);
	const photoZoom = 1.0 + 0.08 * interpolate(frame, [90, 320], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const photoOut = frame > 320 ? 1 - interpolate(frame, [320, 334], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
	const photoOpacity = Math.max(0, Math.min(1, photoIn.opacity * photoOut));
	const mid = fadeUp(frame, 80);
	const foot = fadeUp(frame, 190);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels007/scene1.mp3")} />
			<div style={{ padding: "130px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.08, color: COLORS.white, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					MAGANGHUB BATCH 3B
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.08, color: COLORS.yellow, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					DIBUKA LAGI!
				</div>
				<div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 36 }}>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 168, lineHeight: 1, color: COLORS.yellow, transform: `scale(${num * pulse})` }}>
						14.000
					</div>
					<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 64, color: COLORS.white }}>kuota</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 46, color: COLORS.muted, marginTop: 18, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Daftar sebelum <span style={{ color: COLORS.yellow, fontWeight: 800 }}>1 DESEMBER</span>
				</div>
			</div>
			<div style={{ position: "absolute", top: 690, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 42, color: COLORS.white, opacity: mid.opacity, transform: `translateY(${mid.translateY}px)` }}>
				Buat lulusan baru yang belum lolos!
			</div>
			<div
				style={{
					position: "absolute",
					top: 790,
					left: 100,
					width: 880,
					height: 500,
					borderRadius: 28,
					overflow: "hidden",
					opacity: photoOpacity,
					transform: `translateY(${photoIn.translateY}px)`,
					boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
					border: `4px solid ${COLORS.yellow}`,
				}}
			>
				<Img
					src={staticFile("images/maganghub-batch3a-kickoff.jpg")}
					style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${photoZoom})` }}
				/>
				<div
					style={{
						position: "absolute",
						top: 16,
						right: 16,
						padding: "10px 20px",
						backgroundColor: "rgba(10,59,46,0.88)",
						borderRadius: 999,
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 26,
						color: COLORS.white,
					}}
				>
					Foto: Antara
				</div>
				<div
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						bottom: 0,
						padding: "16px 28px",
						backgroundColor: "rgba(10,59,46,0.88)",
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 32,
						color: COLORS.white,
					}}
				>
					Program Pemagangan Nasional — foto real
				</div>
			</div>
			<div style={{ position: "absolute", top: 1380, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 48, color: COLORS.yellow, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
				Kesempatan terakhir tahun ini!
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 2: syarat (Corporate, light) ------------------------------------
// v3 (standar HIGH QUALITY Bos 25 Nov): ketiga kartu masuk CEPAT (stagger
// total 30 frame = 0,5 dtk, bukan 90 frame berjeda), kelompok konten tersebar
// memenuhi layar (space-evenly), ikon centang berdenyut, caption "Lanjut!"
// jadi pil kuning yang muncul lebih awal, plus gelembung ambient yang
// bergerak pelan — tidak ada lagi band kosong >30% layar di tengah adegan.
const REQUIREMENTS = [
	{ big: "WNI", title: "Warga Negara Indonesia", sub: "(punya NIK)" },
	{ big: "D3 / S1 / Profesi", title: "Diploma, Sarjana, atau", sub: "Pendidikan Profesi" },
	{ big: "Lulus max 1 tahun", title: "sebelum pendaftaran", sub: "" },
];

export const Scene2 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 10);
	const cap = fadeUp(frame, 100);
	const cap2 = fadeUp(frame, 160);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels007/scene2.mp3")} />
			<Blob frame={frame} top={-80} left={760} size={360} color={COLORS.green} phase={0} />
			<Blob frame={frame} top={700} left={-140} size={420} color={COLORS.yellowDeep} phase={2} />
			<Blob frame={frame} top={1500} left={700} size={380} color={COLORS.green} phase={4} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-evenly",
					padding: "100px 90px",
				}}
			>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, lineHeight: 1.1, color: COLORS.ink, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					SYARATNYA 3:
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
					{REQUIREMENTS.map((r, i) => {
						const appearAt = 40 + i * 15;
						const a = fadeUp(frame, appearAt, 20);
						const check = pop(frame, appearAt + 8);
						const pulse = 1 + 0.05 * Math.sin((frame - appearAt) / 9);
						return (
							<div
								key={r.big}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 28,
									backgroundColor: COLORS.white,
									borderRadius: 28,
									padding: "48px 40px",
									boxShadow: "0 24px 60px rgba(10,59,46,0.18)",
									opacity: a.opacity,
									transform: `translateY(${a.translateY}px)`,
								}}
							>
								<div
									style={{
										width: 84,
										height: 84,
										borderRadius: "50%",
										backgroundColor: COLORS.green,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										transform: `scale(${check * pulse})`,
										flexShrink: 0,
									}}
								>
									<div style={{ color: COLORS.white, fontSize: 48, fontWeight: 800, fontFamily: FONT }}>✓</div>
								</div>
								<div>
									<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, color: COLORS.ink, lineHeight: 1.1 }}>
										{r.big}
									</div>
									<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 42, color: COLORS.greenDeep, lineHeight: 1.25, marginTop: 6 }}>
										{r.title}
										{r.sub ? <span> {r.sub}</span> : ""}
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<div
					style={{
						alignSelf: "center",
						backgroundColor: COLORS.yellow,
						color: COLORS.ink,
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 46,
						padding: "22px 44px",
						borderRadius: 999,
						boxShadow: "0 18px 44px rgba(10,59,46,0.22)",
						opacity: cap.opacity,
						transform: `translateY(${cap.translateY}px)`,
					}}
				>
					Memenuhi ketiganya? Lanjut!
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.ink, textAlign: "center", opacity: cap2.opacity, transform: `translateY(${cap2.translateY}px)` }}>
					Cek dulu — kalau lolos ketiganya, lanjut daftar!
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 3: jadwal (Corporate, dark) — timeline, 4 stops -----------------
// v3 (standar HIGH QUALITY Bos 25 Nov): keempat stop masuk CEPAT (stagger
// 15 frame), tersebar memenuhi tinggi layar (space-evenly), garis penghubung
// terisi kuning secara progresif, dot item aktif berdenyut, kotak penegas +
// sumber tampil lebih awal, plus gelembung ambient. Baris Sumber dibuat
// seterang teks lain (catatan Evaluator — dulu warnanya agak redup).
const STOPS = [
	{ date: "23 Nov – 1 Des", label: "Cek eligibilitas", at: 30 },
	{ date: "27 Nov", label: "Lowongan tayang", at: 45, hot: true },
	{ date: "27 Nov – 1 Des", label: "Lamar lowongan", at: 60 },
	{ date: "14 Des", label: "Mulai magang • 6 bulan", at: 75 },
];

export const Scene3 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 8);
	const note = fadeUp(frame, 110);
	const src = fadeUp(frame, 150);
	const fill = interpolate(frame, [30, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const lastActive = STOPS.reduce((acc, s, i) => (frame >= s.at ? i : acc), -1);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels007/scene3.mp3")} />
			<Blob frame={frame} top={-100} left={-120} size={380} color={COLORS.yellow} phase={1} />
			<Blob frame={frame} top={900} left={780} size={420} color={COLORS.green} phase={3} />
			<Blob frame={frame} top={1600} left={-100} size={340} color={COLORS.yellow} phase={5} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-evenly",
					padding: "100px 90px",
				}}
			>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 68, lineHeight: 1.1, color: COLORS.white, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					CATAT TANGGALNYA:
				</div>
				<div style={{ position: "relative" }}>
					<div style={{ position: "absolute", left: 26, top: 20, bottom: 20, width: 6, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 3 }} />
					<div
						style={{
							position: "absolute",
							left: 26,
							top: 20,
							bottom: 20,
							width: 6,
							backgroundColor: COLORS.yellow,
							borderRadius: 3,
							transform: `scaleY(${fill})`,
							transformOrigin: "top",
						}}
					/>
					{STOPS.map((s, i) => {
						const active = frame >= s.at;
						const a = fadeUp(frame, s.at, 20);
						const dot = pop(frame, s.at);
						const isLatest = i === lastActive;
						const pulse = isLatest ? 1 + 0.07 * Math.sin((frame - s.at) / 7) : 1;
						return (
							<div
								key={s.date + s.label}
								style={{
									display: "flex",
									alignItems: "flex-start",
									gap: 36,
									padding: "36px 0",
									opacity: a.opacity,
									transform: `translateY(${a.translateY}px)`,
								}}
							>
								<div
									style={{
										width: 58,
										height: 58,
										borderRadius: "50%",
										backgroundColor: active ? COLORS.yellow : "rgba(255,255,255,0.18)",
										border: `4px solid ${active ? COLORS.yellow : COLORS.muted}`,
										transform: `scale(${dot * pulse})`,
										flexShrink: 0,
										marginTop: 8,
									}}
								/>
								<div>
									<div
										style={{
											fontFamily: FONT,
											fontWeight: 800,
											fontSize: 60,
											lineHeight: 1.1,
											color: active ? COLORS.yellow : COLORS.muted,
										}}
									>
										{s.date}
									</div>
									<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.white, marginTop: 8 }}>
										{s.label}
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<div
					style={{
						backgroundColor: "rgba(255,210,63,0.14)",
						border: `3px solid ${COLORS.yellow}`,
						borderRadius: 24,
						padding: "28px 30px",
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 40,
						lineHeight: 1.35,
						color: COLORS.white,
						opacity: note.opacity,
						transform: `translateY(${note.translateY}px)`,
					}}
				>
					Cek eligibilitas ≠ lamar — lowongan baru buka 27 Nov!
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: COLORS.white, textAlign: "center", opacity: src.opacity, transform: `translateY(${src.translateY}px)` }}>
					Sumber: maganghub.kemnaker.go.id
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 4: benefit + cara daftar (Corporate, light) ----------------------
// v3 (standar HIGH QUALITY Bos 25 Nov): bullet + kartu portal + tombol DAFTAR
// masuk CEPAT (semua sudah tampil di frame 200, bukan 320) dan tersebar
// memenuhi layar (space-evenly), tombol DAFTAR berdenyut, kartu portal
// berbingkai kuning, plus gelembung ambient — tidak ada lagi band kosong
// di bawah.
export const Scene4 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 10);
	const portal = fadeUp(frame, 110);
	const free = fadeUp(frame, 160);
	const rush = fadeUp(frame, 200);
	const daftarPulse = 1 + 0.04 * Math.sin((frame - 110) / 8);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels007/scene4.mp3")} />
			<Blob frame={frame} top={-90} left={700} size={360} color={COLORS.green} phase={2} />
			<Blob frame={frame} top={800} left={-150} size={400} color={COLORS.yellowDeep} phase={0} />
			<Blob frame={frame} top={1550} left={750} size={360} color={COLORS.green} phase={4} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-evenly",
					padding: "100px 90px",
				}}
			>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.1, color: COLORS.ink, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					YANG KAMU DAPAT:
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
					<CheckBullet text="Uang saku setara UMK" delay={40} dark fontSize={48} />
					<CheckBullet text="BPJS" delay={55} dark fontSize={48} />
					<CheckBullet text="Sertifikat resmi + BNSP gratis" delay={70} dark fontSize={48} />
				</div>
				<div
					style={{
						backgroundColor: COLORS.dark,
						border: `4px solid ${COLORS.yellow}`,
						borderRadius: 28,
						padding: "60px 40px",
						textAlign: "center",
						boxShadow: "0 24px 60px rgba(10,59,46,0.28)",
						opacity: portal.opacity,
						transform: `translateY(${portal.translateY}px)`,
					}}
				>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: COLORS.yellow, lineHeight: 1.2 }}>
						maganghub.kemnaker.go.id
					</div>
					<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.muted, marginTop: 14 }}>
						lewat akun SIAPkerja
					</div>
					<div
						style={{
							display: "inline-block",
							marginTop: 32,
							backgroundColor: COLORS.yellow,
							color: COLORS.ink,
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 48,
							padding: "22px 60px",
							borderRadius: 999,
							transform: `scale(${daftarPulse})`,
						}}
					>
						DAFTAR
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.greenDeep, textAlign: "center", opacity: free.opacity, transform: `translateY(${free.translateY}px)` }}>
					Gratis — jangan bayar ke siapa pun!
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.ink, textAlign: "center", opacity: rush.opacity, transform: `translateY(${rush.translateY}px)` }}>
					Kuota 14.000 — siapa cepat, dia dapat
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 5: CTA (Energetic) ----------------------------------------------
export const Scene5 = () => {
	const frame = useCurrentFrame();
	const t1 = fadeUp(frame, 0);
	const magang = pop(frame, 20);
	const pulse = 1 + 0.05 * Math.sin((frame - 20) / 6);
	const t2 = fadeUp(frame, 50);
	const save = fadeUp(frame, 90);
	const handle = fadeUp(frame, 120);
	const foot = fadeUp(frame, 135);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels007/scene5.mp3")} />
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 200 }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: COLORS.white, opacity: t1.opacity, transform: `translateY(${t1.translateY}px)` }}>
					KOMEN
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: COLORS.yellow, transform: `scale(${magang * pulse})` }}>
					“MAGANG”
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: COLORS.white, marginTop: 12, opacity: t2.opacity, transform: `translateY(${t2.translateY}px)` }}>
					KALAU MAU DAFTAR!
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 42, color: COLORS.muted, marginTop: 44, opacity: save.opacity, transform: `translateY(${save.translateY}px)` }}>
					Simpan biar nggak kelewat tanggalnya
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: COLORS.green, marginTop: 56, opacity: handle.opacity, transform: `translateY(${handle.translateY}px)` }}>
					@aksaracademy
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: COLORS.muted, marginTop: 28, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
					MagangHub Batch 3B • Kemnaker
				</div>
			</div>
		</AbsoluteFill>
	);
};
