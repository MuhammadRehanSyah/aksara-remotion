import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timings";
import { COLORS, FONT, CheckBullet, StepBadge, fadeUp, pop } from "./ui";

// Word document mockup: white page with a title row and body lines.
const DocPage = ({ children, frame, appearFrom = 0, width = 880 }) => {
	const { opacity, translateY } = fadeUp(frame, appearFrom, 24);
	return (
		<div
			style={{
				width,
				backgroundColor: COLORS.white,
				borderRadius: 28,
				padding: "40px 44px",
				boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			{children}
		</div>
	);
};

const TocRow = ({ label, page, frame, appearFrom = 0, pageColor, jitter = 0 }) => {
	const { opacity, translateY } = fadeUp(frame, appearFrom, 16);
	const shake = jitter ? Math.sin(frame / 2.2) * jitter : 0;
	return (
		<div
			style={{
				display: "flex",
				alignItems: "baseline",
				fontFamily: FONT,
				fontSize: 40,
				color: COLORS.ink,
				opacity,
				transform: `translateY(${translateY}px) translateX(${shake}px)`,
			}}
		>
			<span style={{ fontWeight: 600 }}>{label}</span>
			<span style={{ flex: 1, borderBottom: "3px dotted #9DB8AB", margin: "0 12px", transform: "translateY(-8px)" }} />
			<span style={{ fontWeight: 800, color: pageColor || COLORS.ink }}>{page}</span>
		</div>
	);
};

export const Scene1 = () => {
	const frame = useCurrentFrame();
	const l1 = fadeUp(frame, 0);
	const l2 = fadeUp(frame, 14);
	const l3 = fadeUp(frame, 28);
	const sub = fadeUp(frame, 44);
	// A new page is inserted around frame 70; page numbers scramble after that.
	const scrambled = frame >= 72;
	const jitter = scrambled ? 3 : 0;
	const badge = pop(frame, 112);
	const pulse = 1 + 0.03 * Math.sin((frame - 120) / 6);
	const insert = fadeUp(frame, 66, 20);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels003/scene1.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COLORS.white, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					MASIH KETIK
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COLORS.white, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					DAFTAR ISI
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COLORS.yellow, opacity: l3.opacity, transform: `translateY(${l3.translateY}px)` }}>
					MANUAL?
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: COLORS.muted, marginTop: 28, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Nambah halaman, nomornya berantakan lagi...
				</div>
			</div>
			<div style={{ position: "absolute", top: 660, left: 100, width: 880 }}>
				<DocPage frame={frame} appearFrom={52}>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.ink, marginBottom: 26 }}>
						DAFTAR ISI
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
						<TocRow label="BAB I Pendahuluan" page="1" frame={frame} appearFrom={60} />
						<TocRow label="BAB II Pembahasan" page={scrambled ? "7?" : "5"} frame={frame} appearFrom={70} pageColor={scrambled ? "#C0392B" : undefined} jitter={jitter} />
						<TocRow label="BAB III Penutup" page={scrambled ? "3?" : "9"} frame={frame} appearFrom={80} pageColor={scrambled ? "#C0392B" : undefined} jitter={jitter} />
					</div>
				</DocPage>
				<div
					style={{
						marginTop: 30,
						backgroundColor: COLORS.yellow,
						borderRadius: 16,
						padding: "18px 28px",
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 38,
						color: COLORS.ink,
						textAlign: "center",
						opacity: insert.opacity,
						transform: `translateY(${insert.translateY}px)`,
					}}
				>
					+ 1 HALAMAN BARU DISISIPKAN
				</div>
			</div>
			<div style={{ position: "absolute", top: 1370, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
				<div style={{ backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "26px 44px", borderRadius: 999, transform: `scale(${badge * pulse})`, boxShadow: "0 18px 44px rgba(0,0,0,0.35)" }}>
					ADA CARA OTOMATIS!
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene2 = () => {
	const frame = useCurrentFrame();
	const label = fadeUp(frame, 0);
	const card = pop(frame, 8);
	const line1 = "DAFTAR ISI";
	const line2 = "OTOMATIS";
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels003/scene2.mp3")} />
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px 100px" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, letterSpacing: 6, color: COLORS.greenDeep, opacity: label.opacity, transform: `translateY(${label.translateY}px)` }}>
					KENALIN:
				</div>
				<div style={{ marginTop: 36, backgroundColor: COLORS.dark, borderRadius: 36, padding: "56px 40px", transform: `scale(${card})`, boxShadow: "0 24px 60px rgba(10,59,46,0.30)" }}>
					<div style={{ display: "flex", justifyContent: "center" }}>
						{line1.split("").map((ch, i) => {
							const s = pop(frame, 18 + i * 4);
							return (
								<span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 100, color: ch === " " ? COLORS.white : COLORS.white, transform: `scale(${s})`, lineHeight: 1, whiteSpace: "pre" }}>
									{ch}
								</span>
							);
						})}
					</div>
					<div style={{ display: "flex", justifyContent: "center" }}>
						{line2.split("").map((ch, i) => {
							const s = pop(frame, 62 + i * 4);
							return (
								<span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 100, color: COLORS.yellow, transform: `scale(${s})`, lineHeight: 1.05 }}>
									{ch}
								</span>
							);
						})}
					</div>
				</div>
				<div style={{ marginTop: 84, display: "flex", flexDirection: "column", gap: 44 }}>
					<CheckBullet text="Kamu atur judulnya sekali" delay={120} dark fontSize={46} />
					<CheckBullet text="Word yang menyusunnya" delay={160} dark fontSize={46} />
					<CheckBullet text="Nomor halaman ikut berubah sendiri" delay={200} dark fontSize={46} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene3 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	// Heading 1 transform: highlight sweep, then bigger + bolder + green.
	const h1On = frame >= 96;
	const h1Scale = interpolate(frame, [96, 118], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const h1Bg = h1On ? COLORS.yellow : "transparent";
	const h2On = frame >= 168;
	const h2Scale = interpolate(frame, [168, 188], [1, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const h2Bg = h2On ? "#FFF3BF" : "transparent";
	const caption = fadeUp(frame, 208);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels003/scene3.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="LANGKAH 1" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: COLORS.white, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Tandai judul babmu
				</div>
				<div style={{ marginTop: 52, display: "flex", justifyContent: "center" }}>
					<div style={{ width: 880, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
						<div style={{ display: "flex", backgroundColor: "#EAF6EF", borderBottom: `2px solid ${COLORS.grid}`, padding: "18px 28px", gap: 18, alignItems: "center" }}>
							<span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: COLORS.greenDeep, borderBottom: `4px solid ${COLORS.yellow}`, paddingBottom: 4 }}>Beranda</span>
							<span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: "#6B7F74" }}>Referensi</span>
							<span style={{ marginLeft: "auto", fontFamily: FONT, fontWeight: 700, fontSize: 32, color: COLORS.greenDeep, backgroundColor: COLORS.white, border: `2px solid ${COLORS.green}`, borderRadius: 12, padding: "8px 18px" }}>Gaya</span>
						</div>
						<div style={{ padding: "36px 40px 44px", display: "flex", flexDirection: "column", gap: 28 }}>
							<div
								style={{
									fontFamily: FONT,
									fontWeight: h1On ? 800 : 500,
									fontSize: h1On ? 52 : 46,
									color: h1On ? COLORS.greenDeep : COLORS.ink,
									backgroundColor: h1Bg,
									borderRadius: 12,
									padding: "10px 16px",
									transform: `scale(${h1Scale})`,
									transformOrigin: "left center",
								}}
							>
								BAB I PENDAHULUAN {h1On ? "— Heading 1 ✓" : ""}
							</div>
							<div
								style={{
									fontFamily: FONT,
									fontWeight: h2On ? 800 : 500,
									fontSize: h2On ? 44 : 40,
									color: h2On ? COLORS.greenDeep : COLORS.ink,
									backgroundColor: h2Bg,
									borderRadius: 12,
									padding: "8px 16px",
									transform: `scale(${h2Scale})`,
									transformOrigin: "left center",
								}}
							>
								1.1 Latar Belakang {h2On ? "— Heading 2 ✓" : ""}
							</div>
							<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 38, color: "#6B7F74", padding: "0 16px" }}>
								Isi laporanmu di sini...
							</div>
						</div>
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.yellow, marginTop: 56, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Tab Beranda → Gaya
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene4 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 14);
	// Ribbon: Referensi tab highlighted; Daftar Isi menu opens; Tabel Otomatis clicked.
	const menu = fadeUp(frame, 96, 20);
	const clickFlash = frame >= 150 && frame < 162;
	const clicked = frame >= 150;
	const toc1 = fadeUp(frame, 168, 16);
	const toc2 = fadeUp(frame, 190, 16);
	const toc3 = fadeUp(frame, 212, 16);
	const cursorX = interpolate(frame, [60, 96, 120, 150], [620, 700, 540, 540], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const cursorY = interpolate(frame, [60, 96, 120, 150], [348, 348, 470, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.darker }}>
			<Audio src={staticFile("audio/reels003/scene4.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="LANGKAH 2" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.15, color: COLORS.white, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Buka tab Referensi
				</div>
				<div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
					<div style={{ width: 880, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
						<div style={{ display: "flex", backgroundColor: "#EAF6EF", borderBottom: `2px solid ${COLORS.grid}`, padding: "18px 28px", gap: 18, alignItems: "center" }}>
							<span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: "#6B7F74" }}>Beranda</span>
							<span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: COLORS.greenDeep, borderBottom: `4px solid ${COLORS.yellow}`, paddingBottom: 4 }}>Referensi</span>
							<span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: "#6B7F74" }}>Tinjau</span>
						</div>
						<div style={{ padding: "28px 32px", display: "flex", gap: 20, alignItems: "center" }}>
							<div
								style={{
									fontFamily: FONT,
									fontWeight: 800,
									fontSize: 38,
									color: COLORS.white,
									backgroundColor: clicked ? COLORS.green : COLORS.greenDeep,
									borderRadius: 14,
									padding: "18px 28px",
									boxShadow: clickFlash ? "0 0 0 6px rgba(255,210,63,0.8)" : "none",
								}}
							>
								📑 Daftar Isi
							</div>
							<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: "#6B7F74" }}>← klik di sini</div>
						</div>
						<div
							style={{
								margin: "0 32px 32px",
								backgroundColor: COLORS.light,
								border: `2px solid ${COLORS.grid}`,
								borderRadius: 16,
								padding: "10px 0",
								opacity: menu.opacity,
								transform: `translateY(${menu.translateY}px)`,
							}}
						>
							<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.ink, backgroundColor: clicked ? COLORS.yellow : "transparent", borderRadius: 10, padding: "14px 28px", margin: "0 12px" }}>
								✓ Tabel Otomatis
							</div>
							<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: "#6B7F74", padding: "14px 28px", margin: "0 12px" }}>
								Tabel Manual
							</div>
						</div>
					</div>
				</div>
				<div style={{ marginTop: 44, display: "flex", justifyContent: "center" }}>
					<div style={{ width: 880, backgroundColor: COLORS.white, borderRadius: 28, padding: "32px 40px", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: COLORS.ink, marginBottom: 20 }}>DAFTAR ISI</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
							<div style={{ opacity: toc1.opacity, transform: `translateY(${toc1.translateY}px)` }}>
								<TocRow label="BAB I Pendahuluan" page="1" frame={frame} appearFrom={168} />
							</div>
							<div style={{ opacity: toc2.opacity, transform: `translateY(${toc2.translateY}px)` }}>
								<TocRow label="BAB II Pembahasan" page="5" frame={frame} appearFrom={190} />
							</div>
							<div style={{ opacity: toc3.opacity, transform: `translateY(${toc3.translateY}px)` }}>
								<TocRow label="BAB III Penutup" page="9" frame={frame} appearFrom={212} />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div style={{ position: "absolute", left: cursorX, top: cursorY, fontSize: 56, color: COLORS.yellow, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>➤</div>
		</AbsoluteFill>
	);
};

export const Scene5 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	// A new page is inserted ~frame 110; page numbers count up after that.
	const inserted = frame >= 110;
	const p2 = inserted ? Math.round(interpolate(frame, [110, 190], [5, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 5;
	const p3 = inserted ? Math.round(interpolate(frame, [110, 190], [9, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 9;
	const insertBanner = fadeUp(frame, 104, 20);
	const menu = fadeUp(frame, 250, 20);
	const menuClicked = frame >= 300;
	const done = pop(frame, 316);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels003/scene5.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="LANGKAH 3" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.15, color: COLORS.ink, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Daftar isi langsung jadi!
				</div>
				<div style={{ marginTop: 44, display: "flex", justifyContent: "center" }}>
					<DocPage frame={frame} appearFrom={40}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.ink, marginBottom: 26 }}>
							DAFTAR ISI
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
							<TocRow label="BAB I Pendahuluan" page="1" frame={frame} appearFrom={56} />
							<TocRow label="BAB II Pembahasan" page={String(p2)} frame={frame} appearFrom={72} pageColor={inserted ? COLORS.greenDeep : undefined} />
							<TocRow label="BAB III Penutup" page={String(p3)} frame={frame} appearFrom={88} pageColor={inserted ? COLORS.greenDeep : undefined} />
						</div>
					</DocPage>
				</div>
				<div
					style={{
						margin: "30px 90px 0",
						backgroundColor: COLORS.dark,
						borderRadius: 16,
						padding: "18px 28px",
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 38,
						color: COLORS.yellow,
						textAlign: "center",
						opacity: insertBanner.opacity,
						transform: `translateY(${insertBanner.translateY}px)`,
					}}
				>
					+ 1 halaman baru disisipkan → nomor ikut berubah!
				</div>
				<div
					style={{
						margin: "28px 90px 0",
						backgroundColor: COLORS.white,
						border: `3px solid ${COLORS.green}`,
						borderRadius: 16,
						padding: "20px 28px",
						opacity: menu.opacity,
						transform: `translateY(${menu.translateY}px)`,
						boxShadow: "0 18px 44px rgba(10,59,46,0.20)",
					}}
				>
					<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: "#6B7F74" }}>Klik kanan daftar isi →</div>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: menuClicked ? COLORS.white : COLORS.ink, backgroundColor: menuClicked ? COLORS.green : COLORS.yellow, borderRadius: 12, padding: "14px 20px", marginTop: 12, textAlign: "center" }}>
						Perbarui Daftar Isi {menuClicked ? "✓" : ""}
					</div>
				</div>
				<div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
					<div style={{ backgroundColor: COLORS.green, color: COLORS.white, fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: "24px 44px", borderRadius: 999, transform: `scale(${done})`, boxShadow: "0 18px 44px rgba(10,59,46,0.30)" }}>
						Rapi lagi, otomatis!
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene6 = () => {
	const frame = useCurrentFrame();
	const check = pop(frame, 0);
	const t1 = fadeUp(frame, 26);
	const t2 = fadeUp(frame, 42);
	const mini = fadeUp(frame, 110, 24);
	const pulseA = 1 + 0.045 * Math.sin((frame - 200) / 9);
	const pulseB = 1 + 0.045 * Math.sin((frame - 200) / 9 + Math.PI);
	const l1 = fadeUp(frame, 190);
	const l2 = fadeUp(frame, 260);
	const l3 = fadeUp(frame, 320);
	const foot = fadeUp(frame, 372);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels003/scene6.mp3")} />
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150 }}>
				<div style={{ width: 150, height: 150, borderRadius: "50%", backgroundColor: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})` }}>
					<div style={{ color: COLORS.white, fontSize: 92, fontWeight: 800, fontFamily: FONT }}>✓</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: COLORS.white, marginTop: 44, opacity: t1.opacity, transform: `translateY(${t1.translateY}px)` }}>
					SELESAI,
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, color: COLORS.yellow, opacity: t2.opacity, transform: `translateY(${t2.translateY}px)` }}>
					RAPI OTOMATIS!
				</div>
				<div style={{ marginTop: 52, width: 760, opacity: mini.opacity, transform: `translateY(${mini.translateY}px)` }}>
					<div style={{ backgroundColor: COLORS.white, borderRadius: 24, padding: "30px 36px", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.ink, marginBottom: 16 }}>DAFTAR ISI</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<TocRow label="BAB I Pendahuluan" page="1" frame={frame} appearFrom={120} />
							<TocRow label="BAB II Pembahasan" page="6" frame={frame} appearFrom={134} />
							<TocRow label="BAB III Penutup" page="10" frame={frame} appearFrom={148} />
						</div>
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: COLORS.yellow, marginTop: 60, textAlign: "center", lineHeight: 1.25, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					Komentar: tugasmu masih manual?
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 44, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					<div style={{ width: 46, height: 64, backgroundColor: COLORS.yellow, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)", transform: `scale(${pop(frame, 260) * pulseA})` }} />
					<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.white }}>
						Simpan video ini biar tidak lupa
					</div>
				</div>
				<div style={{ marginTop: 60, textAlign: "center", opacity: l3.opacity, transform: `translateY(${l3.translateY}px)` }}>
					<div style={{ display: "inline-block", backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: "20px 40px", borderRadius: 999, transform: `scale(${pop(frame, 320) * pulseB})` }}>
						@aksaracademy
					</div>
				</div>
				<div style={{ marginTop: 36, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
					<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: COLORS.muted, textAlign: "center" }}>
						Ikuti untuk tips Office lainnya
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
