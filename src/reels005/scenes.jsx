import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timings";
import { COLORS, FONT, StepBadge, fadeUp, pop } from "./ui";

// ---------------------------------------------------------------------------
// Motion system for Reels #005 (from brand.md / MOTION.md + motion skills)
// - LottieFiles: Corporate base (200-400ms, ease-out, 0-3% overshoot);
//   Energetic hook + CTA (100-250ms, ease-out-expo, 15-30% overshoot).
//   Three layers per scene (primary / secondary / ambient), stagger total
//   <500ms, visual change at least every ~3s.
// - Emil Kowalski: never scale(0) — pop() springs from ~0.95; press
//   feedback scale 0.97 over 100-160ms.
// - Formula reveal: characters appear progressively (same pattern as the
//   formula typing in Reels #002/#003) — concrete formulas only, never
//   a vague "=IF(...)".
// - Scene 4 (Daftar Isi Otomatis) is DELIBERATELY different from Reels
//   #003: #003 used a dark background, the Referensi ribbon tab, a
//   "Daftar Isi" dropdown menu, a cursor arrow, and BAB I/II/III rows.
//   Here: light-green background, a "MODUL AJAR" document card with a
//   yellow side tab, Bab 1 / Bab 2 / Bab 3 (new) / Lampiran rows, no
//   ribbon, no cursor, no menu — page numbers shift when a chapter is
//   added.
// - Real photo: refs/pengganti-a-guru-sd.jpg — verified a REAL photo of
//   an Indonesian elementary-school teacher in class (students raising
//   hands, flag, green walls). The other candidate
//   (media-generation-hari-guru-real-photo-*.webp) looks AI-generated
//   (cinematic portrait + dark gradient fade) and was NOT used.
//   Photo appears in Scene 1, frames ~100-182 (82 frames = 2.7s),
//   slow Ken Burns zoom, right after the hook lines.
// ---------------------------------------------------------------------------

const FORMULA_IF = '=IF(B2>=85;"A";"B")';
const FORMULA_VLOOKUP = "=VLOOKUP(A2;TabelNilai;2;FALSE)";

// Reveal `text` character by character between startFrame and endFrame.
const TypeReveal = ({ text, frame, startFrame, endFrame, style }) => {
	const n = Math.floor(
		interpolate(frame, [startFrame, endFrame], [0, text.length], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		})
	);
	const shown = text.slice(0, n);
	const caret = frame >= startFrame && frame < endFrame;
	return (
		<span style={style}>
			{shown}
			{caret ? <span style={{ color: COLORS.yellow }}>|</span> : ""}
		</span>
	);
};

// --- Scene 1: hook (Energetic) + real photo --------------------------------
export const Scene1 = () => {
	const frame = useCurrentFrame();
	const l1 = fadeUp(frame, 0);
	const l2 = fadeUp(frame, 14);
	const l3 = fadeUp(frame, 28);
	const sub = fadeUp(frame, 44);
	const badge = pop(frame, 58);
	const pulse = 1 + 0.045 * Math.sin((frame - 70) / 6);
	// Real photo: visible frames 100-182 (82 frames = 2.73s), Ken Burns zoom.
	const photoIn = fadeUp(frame, 100, 24);
	const photoZoom = 1 + 0.06 * interpolate(frame, [100, 182], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const photoOut = frame > 182 ? 1 - interpolate(frame, [182, 196], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
	const photoOpacity = Math.max(0, Math.min(1, photoIn.opacity * photoOut));
	const cards = ["1  Mail Merge", "2  IF + VLOOKUP", "3  Daftar Isi Otomatis"];
	const foot = fadeUp(frame, 232);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels005/scene1.mp3")} />
			<div style={{ padding: "130px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.08, color: COLORS.white, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					SELAMAT
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.08, color: COLORS.white, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					HARI GURU
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.08, color: COLORS.yellow, opacity: l3.opacity, transform: `translateY(${l3.translateY}px)` }}>
					NASIONAL
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: COLORS.muted, marginTop: 26, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					25 November 2026
				</div>
				<div style={{ marginTop: 30, transform: `scale(${badge * pulse})`, transformOrigin: "left center", display: "inline-block" }}>
					<div style={{ backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 40, padding: "20px 36px", borderRadius: 999, boxShadow: "0 18px 44px rgba(0,0,0,0.35)" }}>
						GURU HEBAT, INDONESIA KUAT
					</div>
				</div>
			</div>
			<div
				style={{
					position: "absolute",
					top: 770,
					left: 100,
					width: 880,
					height: 462,
					borderRadius: 28,
					overflow: "hidden",
					opacity: photoOpacity,
					transform: `translateY(${photoIn.translateY}px)`,
					boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
					border: `4px solid ${COLORS.yellow}`,
				}}
			>
				<Img
					src={staticFile("images/guru-sd-real.jpg")}
					style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${photoZoom})` }}
				/>
				<div
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						bottom: 0,
						padding: "18px 28px",
						backgroundColor: "rgba(10,59,46,0.88)",
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 36,
						color: COLORS.white,
					}}
				>
					Guru yang sabar, murid berani mencoba
				</div>
			</div>
			<div style={{ position: "absolute", top: 1150, left: 100, width: 880, display: "flex", flexDirection: "column", gap: 18 }}>
				{cards.map((c, i) => {
					const a = fadeUp(frame, 198 + i * 3, 24);
					return (
						<div
							key={c}
							style={{
								backgroundColor: COLORS.white,
								borderRadius: 20,
								padding: "20px 30px",
								fontFamily: FONT,
								fontWeight: 800,
								fontSize: 40,
								color: COLORS.ink,
								opacity: a.opacity,
								transform: `translateY(${a.translateY}px)`,
								boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
							}}
						>
							{c}
						</div>
					);
				})}
			</div>
			<div style={{ position: "absolute", top: 1560, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.yellow, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
				3 shortcut Office guru hebat
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 2: Mail Merge (Corporate, light) ---------------------------------
const MERGE_NAMES = ["Andi", "Budi", "Citra", "Dewi"];
export const Scene2 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 40);
	// Name cycles every 34 frames from frame 60: Andi -> Budi -> Citra -> Dewi.
	const nameIdx = Math.min(MERGE_NAMES.length - 1, Math.floor(Math.max(0, frame - 60) / 34));
	const name = MERGE_NAMES[nameIdx];
	const namePop = pop(frame, 60 + nameIdx * 34);
	// Copies fan out behind the main letter.
	const copies = [
		{ at: 66, dx: -46, rot: -7, op: 0.55 },
		{ at: 86, dx: 46, rot: 7, op: 0.55 },
		{ at: 106, dx: -92, rot: -12, op: 0.35 },
	];
	const stamp = pop(frame, 190);
	const caption = fadeUp(frame, 210);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels005/scene2.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="1" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.1, color: COLORS.ink, marginTop: 36, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Mail Merge
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.greenDeep, marginTop: 18, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Satu surat, seratus nama
				</div>
				<div style={{ position: "relative", marginTop: 60, display: "flex", justifyContent: "center", height: 560 }}>
					{copies.map((c, i) => {
						const p = interpolate(frame, [c.at, c.at + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
						return (
							<div
								key={i}
								style={{
									position: "absolute",
									top: 20,
									width: 640,
									height: 420,
									backgroundColor: COLORS.white,
									borderRadius: 24,
									border: `2px solid ${COLORS.grid}`,
									opacity: p * c.op,
									transform: `translateX(${c.dx * p}px) rotate(${c.rot * p}deg)`,
								}}
							/>
						);
					})}
					<div style={{ position: "absolute", top: 0, width: 700, backgroundColor: COLORS.white, borderRadius: 28, padding: "40px 44px", boxShadow: "0 24px 60px rgba(10,59,46,0.22)" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: COLORS.ink }}>Surat Pemberitahuan</div>
						<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: "#6B7F74", marginTop: 14, lineHeight: 1.4 }}>
							Kepada Yth. Orang tua/wali murid,
						</div>
						<div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 16 }}>
							<span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: "#6B7F74" }}>Nama:</span>
							<span
								style={{
									fontFamily: FONT,
									fontWeight: 800,
									fontSize: 52,
									color: COLORS.greenDeep,
									backgroundColor: "#FFF3BF",
									borderRadius: 12,
									padding: "6px 20px",
									display: "inline-block",
									transform: `scale(${namePop})`,
								}}
							>
								{name}
							</span>
						</div>
						<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: "#6B7F74", marginTop: 22, lineHeight: 1.4, paddingRight: 230 }}>
							...raport semester ini siap diambil.
						</div>
						<div
							style={{
								position: "absolute",
								right: 36,
								bottom: 28,
								border: `5px solid ${COLORS.green}`,
								color: COLORS.green,
								fontFamily: FONT,
								fontWeight: 800,
								fontSize: 44,
								padding: "10px 26px",
								borderRadius: 14,
								transform: `rotate(-10deg) scale(${stamp})`,
							}}
						>
							SELESAI ✓
						</div>
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.ink, marginTop: 64, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Raport &amp; sertifikat massal
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 3: IF + VLOOKUP (Corporate, dark) --------------------------------
const GRADE_ROWS = [
	["Andi", "92", "A"],
	["Budi", "78", "B"],
	["Citra", "88", "A"],
];
export const Scene3 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 40);
	const caption = fadeUp(frame, 330);
	// Nilai column highlights at frame 140; Predikat chips pop 160/175/190.
	const nilaiHl = frame >= 140;
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels005/scene3.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="2" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.1, color: COLORS.white, marginTop: 36, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					IF + VLOOKUP
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.muted, marginTop: 18, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Di Excel — rekap nilai otomatis
				</div>
				<div style={{ marginTop: 48, backgroundColor: "#06231B", borderRadius: 20, padding: "26px 32px", border: `2px solid ${COLORS.greenDeep}` }}>
					<TypeReveal
						text={FORMULA_IF}
						frame={frame}
						startFrame={56}
						endFrame={120}
						style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: COLORS.yellow }}
					/>
				</div>
				<div style={{ marginTop: 36, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
					<div style={{ display: "flex", backgroundColor: COLORS.greenDeep }}>
						<div style={{ flex: 1.2, padding: "22px 24px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Nama</div>
						<div style={{ flex: 1, padding: "22px 24px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: nilaiHl ? COLORS.ink : COLORS.white, backgroundColor: nilaiHl ? COLORS.yellow : "transparent" }}>Nilai</div>
						<div style={{ flex: 1, padding: "22px 24px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Predikat</div>
					</div>
					{GRADE_ROWS.map(([n, v, g], r) => {
						const rowIn = fadeUp(frame, 120 + r * 8, 16);
						const chip = pop(frame, 160 + r * 15);
						return (
							<div key={n} style={{ display: "flex", backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white, borderTop: `2px solid ${COLORS.grid}`, opacity: rowIn.opacity, transform: `translateY(${rowIn.translateY}px)` }}>
								<div style={{ flex: 1.2, padding: "20px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 38, color: COLORS.ink }}>{n}</div>
								<div style={{ flex: 1, padding: "20px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 38, color: COLORS.ink, backgroundColor: nilaiHl ? "#FFF3BF" : "transparent" }}>{v}</div>
								<div style={{ flex: 1, padding: "14px 24px", display: "flex", alignItems: "center" }}>
									<span
										style={{
											display: "inline-block",
											backgroundColor: g === "A" ? COLORS.green : COLORS.yellow,
											color: g === "A" ? COLORS.white : COLORS.ink,
											fontFamily: FONT,
											fontWeight: 800,
											fontSize: 38,
											borderRadius: 12,
											padding: "8px 26px",
											transform: `scale(${chip})`,
										}}
									>
										{g}
									</span>
								</div>
							</div>
						);
					})}
				</div>
				<div style={{ marginTop: 36, backgroundColor: "#06231B", borderRadius: 20, padding: "26px 32px", border: `2px solid ${COLORS.greenDeep}` }}>
					<TypeReveal
						text={FORMULA_VLOOKUP}
						frame={frame}
						startFrame={216}
						endFrame={306}
						style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.yellow }}
					/>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.yellow, marginTop: 48, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Nilai → predikat otomatis
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 4: Daftar Isi Otomatis — MODUL AJAR (Corporate, light) -----------
// Deliberately NOT Reels #003: no ribbon, no dropdown menu, no cursor,
// no BAB I/II/III. A "MODUL AJAR" card with a yellow side tab; chapters
// Bab 1 / Bab 2 / Lampiran; a new "Bab 3" slides in and the Lampiran page
// number counts up 21 -> 25.
const TocRow = ({ label, page, frame, appearFrom, highlight = false, isNew = false }) => {
	const a = fadeUp(frame, appearFrom, 16);
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				backgroundColor: highlight ? "#FFF3BF" : "transparent",
				borderRadius: 12,
				padding: "14px 16px",
				opacity: a.opacity,
				transform: `translateY(${a.translateY}px)`,
			}}
		>
			<div style={{ fontFamily: FONT, fontWeight: isNew ? 800 : 600, fontSize: 40, color: COLORS.ink, flex: 1 }}>
				{label}
				{isNew ? (
					<span style={{ marginLeft: 16, backgroundColor: COLORS.green, color: COLORS.white, fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: "6px 16px", borderRadius: 999 }}>
						BARU
					</span>
				) : null}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
				<div style={{ width: 200, borderBottom: `3px dotted ${COLORS.grid}` }} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: highlight ? COLORS.greenDeep : COLORS.ink, minWidth: 60, textAlign: "right" }}>
					{page}
				</div>
			</div>
		</div>
	);
};
export const Scene4 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 14);
	const sub = fadeUp(frame, 36);
	// New chapter inserted at frame 110; Lampiran page counts 21 -> 25.
	const inserted = frame >= 110;
	const lampiranPage = inserted
		? String(Math.round(interpolate(frame, [110, 160], [21, 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })))
		: "21";
	const banner = fadeUp(frame, 150, 20);
	const caption = fadeUp(frame, 178);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels005/scene4.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="3" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, lineHeight: 1.12, color: COLORS.ink, marginTop: 36, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Daftar Isi Otomatis
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.greenDeep, marginTop: 16, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Modul ajar rapi sendiri
				</div>
				<div style={{ marginTop: 48, display: "flex", borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(10,59,46,0.22)" }}>
					<div style={{ width: 64, backgroundColor: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color: COLORS.ink, writingMode: "vertical-rl", letterSpacing: 4 }}>
							MODUL AJAR
						</div>
					</div>
					<div style={{ flex: 1, backgroundColor: COLORS.white, padding: "36px 36px 30px" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.greenDeep }}>Matematika — Kelas 5 SD</div>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 42, color: COLORS.ink, marginTop: 22, marginBottom: 14 }}>DAFTAR ISI</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							<TocRow label="Bab 1  Pengenalan" page="4" frame={frame} appearFrom={56} />
							<TocRow label="Bab 2  Materi" page="12" frame={frame} appearFrom={74} />
							{inserted ? <TocRow label="Bab 3  Latihan" page="18" frame={frame} appearFrom={110} highlight isNew /> : null}
							<TocRow label="Lampiran" page={lampiranPage} frame={frame} appearFrom={92} highlight={inserted} />
						</div>
					</div>
				</div>
				<div
					style={{
						marginTop: 44,
						backgroundColor: COLORS.dark,
						borderRadius: 16,
						padding: "22px 28px",
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 38,
						color: COLORS.yellow,
						textAlign: "center",
						opacity: banner.opacity,
						transform: `translateY(${banner.translateY}px)`,
					}}
				>
					+ Bab baru ditambahkan → nomor halaman ikut berubah!
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.ink, marginTop: 44, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Nambah bab, halaman ikut berubah
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 5: closing CTA (Energetic) ---------------------------------------
export const Scene5 = () => {
	const frame = useCurrentFrame();
	const t1 = fadeUp(frame, 0);
	const t2 = fadeUp(frame, 16);
	const pulse = 1 + 0.045 * Math.sin((frame - 60) / 9);
	const cards = [
		["1", "Mail Merge"],
		["2", "IF + VLOOKUP"],
		["3", "Daftar Isi Otomatis"],
	];
	const l1 = fadeUp(frame, 130);
	const l2 = fadeUp(frame, 160);
	const foot = fadeUp(frame, 210);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels005/scene5.mp3")} />
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 150 }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, color: COLORS.white, opacity: t1.opacity, transform: `translateY(${t1.translateY}px)` }}>
					TAG GURU
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, color: COLORS.yellow, opacity: t2.opacity, transform: `translateY(${t2.translateY}px) scale(${pop(frame, 16) * pulse})` }}>
					FAVORITMU!
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 56, width: 880 }}>
					{cards.map(([num, label], i) => {
						const a = fadeUp(frame, 64 + i * 3, 24);
						return (
							<div
								key={num}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 24,
									backgroundColor: COLORS.white,
									borderRadius: 20,
									padding: "20px 28px",
									opacity: a.opacity,
									transform: `translateY(${a.translateY}px)`,
								}}
							>
								<div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: COLORS.green, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 34, flexShrink: 0 }}>
									{num}
								</div>
								<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: COLORS.ink }}>{label}</div>
							</div>
						);
					})}
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.white, marginTop: 56, textAlign: "center", lineHeight: 1.3, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					Belajar bareng di Aksara Academy
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: COLORS.green, marginTop: 28, opacity: l2.opacity, transform: `translateY(${l2.translateY}px) scale(${1 + 0.03 * Math.sin((frame - 160) / 9)})` }}>
					@aksaracademy
				</div>
				<div style={{ marginTop: 56, textAlign: "center", opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: COLORS.yellow }}>Selamat Hari Guru Nasional</div>
					<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: COLORS.muted, marginTop: 10 }}>
						Guru Hebat, Indonesia Kuat
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
