import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timings";
import { COLORS, FONT, StepBadge, CheckBullet, fadeUp, pop } from "./ui";

// ---------------------------------------------------------------------------
// Motion system for Reels #006 (from brand.md / MOTION.md + motion skills)
// - LottieFiles: Corporate base (200-400ms, ease-out, 0-3% overshoot);
//   Energetic hook + CTA (100-250ms, ease-out-expo, 15-30% overshoot).
//   Three layers per scene (primary / secondary / ambient), stagger total
//   <500ms, visual change at least every ~3s.
// - Emil Kowalski: key press = scale 0.97 over 100-160ms; never scale(0).
// - Demo is TWO steps (Evaluator requirement): (a) type "Andi" -> Ctrl+E ->
//   first names fill; (b) type "Pratama" -> Ctrl+E again -> last names fill.
// - Real photo: refs/pengganti-a-guru-sd.jpg (verified real photo of an
//   Indonesian elementary-school teacher in class). SAME photo as Feed Hari
//   Guru + Reels #005 — so the crop/zoom is DELIBERATELY different:
//   #005 used full-frame cover, zoom IN 1 -> 1.06, objectPosition center.
//   Here scene 1: TIGHT crop on the teacher (objectPosition "32% 28%"),
//   zoom OUT 1.38 -> 1.16. Scene 5: crop on the STUDENTS side
//   (objectPosition "82% 55%"), zoom IN 1.0 -> 1.12. Different framing,
//   opposite zoom direction, different caption bars.
// ---------------------------------------------------------------------------

const FULL = ["Andi Pratama", "Budi Santoso", "Citra Lestari"];
const FIRST = ["Andi", "Budi", "Citra"];
const LAST = ["Pratama", "Santoso", "Lestari"];

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

// 3D keyboard key (pattern from Reels #004). pressAt = frame the key is
// pressed (Emil: scale 0.97, 100-160ms ≈ 3-5 frames at 30fps). Shadow
// (secondary layer) shrinks while pressed. Never scales from 0.
const KeyCap = ({ label, frame, appearAt = 0, pressAt = null, fontSize = 52, padding = "26px 36px", dark = true }) => {
	const appear = pop(frame, appearAt);
	const pressAmt =
		pressAt === null
			? 0
			: interpolate(frame, [pressAt - 2, pressAt, pressAt + 4, pressAt + 9], [0, 1, 1, 0], {
					extrapolateLeft: "clamp",
					extrapolateRight: "clamp",
			  });
	const scale = appear * (1 - 0.03 * pressAmt);
	const borderBottom = Math.round(12 - 8 * pressAmt);
	return (
		<div
			style={{
				backgroundColor: dark ? COLORS.ink : COLORS.white,
				borderRadius: 20,
				padding,
				borderBottom: `${borderBottom}px solid ${dark ? "rgba(0,0,0,0.45)" : COLORS.grid}`,
				transform: `scale(${scale})`,
				boxShadow: dark ? "0 14px 30px rgba(0,0,0,0.30)" : "0 14px 30px rgba(10,59,46,0.22)",
			}}
		>
			<div style={{ fontFamily: FONT, fontWeight: 800, fontSize, color: dark ? COLORS.white : COLORS.ink, lineHeight: 1 }}>
				{label}
			</div>
		</div>
	);
};

// --- Scene 1: hook (Energetic) + real photo, tight crop on teacher --------
export const Scene1 = () => {
	const frame = useCurrentFrame();
	const l1 = fadeUp(frame, 0);
	const l2 = fadeUp(frame, 14);
	const sub = fadeUp(frame, 30);
	// Real photo: visible frames 70-150 (80 frames = 2.67s).
	// TIGHT crop on the teacher (objectPosition 32% 28%), zoom OUT
	// 1.38 -> 1.16 — opposite direction from Reels #005 (zoom in).
	const photoIn = fadeUp(frame, 70, 24);
	const photoZoom = 1.38 - 0.22 * interpolate(frame, [70, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const photoOut = frame > 150 ? 1 - interpolate(frame, [150, 164], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
	const photoOpacity = Math.max(0, Math.min(1, photoIn.opacity * photoOut));
	const midLine = fadeUp(frame, 168);
	const badge = pop(frame, 190);
	const pulse = 1 + 0.045 * Math.sin((frame - 200) / 6);
	const keys = pop(frame, 216);
	const foot = fadeUp(frame, 238);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels006/scene1.mp3")} />
			<div style={{ padding: "120px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, lineHeight: 1.08, color: COLORS.white, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					PUNCAK BULAN
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, lineHeight: 1.08, color: COLORS.yellow, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					GURU NASIONAL
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: COLORS.muted, marginTop: 24, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					26 November 2026
				</div>
			</div>
			<div
				style={{
					position: "absolute",
					top: 470,
					left: 100,
					width: 880,
					height: 480,
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
					style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "32% 28%", transform: `scale(${photoZoom})` }}
				/>
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
						fontSize: 36,
						color: COLORS.white,
					}}
				>
					Guru SD di kelas — foto real
				</div>
			</div>
			<div style={{ position: "absolute", top: 990, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.white, opacity: midLine.opacity, transform: `translateY(${midLine.translateY}px)` }}>
				Habis Hari Guru, rekap nilai menumpuk.
			</div>
			<div style={{ position: "absolute", top: 1130, left: 0, right: 0, textAlign: "center", transform: `scale(${badge * pulse})` }}>
				<div style={{ display: "inline-block", backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 40, padding: "20px 36px", borderRadius: 999, boxShadow: "0 18px 44px rgba(0,0,0,0.35)" }}>
					1 SHORTCUT GURU PALING BUTUH
				</div>
			</div>
			<div style={{ position: "absolute", top: 1310, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, transform: `scale(${keys})` }}>
				<KeyCap label="Ctrl" frame={frame} appearAt={216} pressAt={238} fontSize={56} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: COLORS.muted }}>+</div>
				<KeyCap label="E" frame={frame} appearAt={224} pressAt={238} fontSize={56} />
			</div>
			<div style={{ position: "absolute", top: 1500, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.yellow, opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
				Flash Fill — pisah nama murid
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 2: the problem (Corporate, light) -------------------------------
// One "Nama Lengkap" column; rows type in slowly one by one while a
// clock spins — typing one by one takes forever.
export const Scene2 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 14);
	const sub = fadeUp(frame, 38);
	const clockRot = frame * 2.4; // spinning clock hand (ambient layer)
	const caption = fadeUp(frame, 220);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels006/scene2.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 68, lineHeight: 1.12, color: COLORS.ink, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Nama murid masih jadi satu?
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.greenDeep, marginTop: 18, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Mau dipisah depan &amp; belakangnya
				</div>
				<div style={{ marginTop: 56, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(10,59,46,0.22)" }}>
					<div style={{ backgroundColor: COLORS.greenDeep, padding: "22px 28px", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: COLORS.white }}>
						Nama Lengkap
					</div>
					{FULL.map((name, r) => {
						const a = fadeUp(frame, 80 + r * 50, 16);
						const typing = frame >= 80 + r * 50 && frame < 80 + r * 50 + 42;
						const n = typing
							? Math.floor(interpolate(frame, [80 + r * 50, 80 + r * 50 + 42], [0, name.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
							: name.length;
						return (
							<div
								key={name}
								style={{
									display: "flex",
									alignItems: "center",
									backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white,
									borderTop: `2px solid ${COLORS.grid}`,
									padding: "24px 28px",
									opacity: a.opacity,
									transform: `translateY(${a.translateY}px)`,
								}}
							>
								<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.ink }}>
									{name.slice(0, n)}
									{typing ? <span style={{ color: COLORS.green }}>|</span> : ""}
								</div>
							</div>
						);
					})}
				</div>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: 64 }}>
					<div
						style={{
							width: 84,
							height: 84,
							borderRadius: "50%",
							border: `8px solid ${COLORS.greenDeep}`,
							position: "relative",
							transform: `rotate(${clockRot}deg)`,
						}}
					>
						<div style={{ position: "absolute", left: "50%", top: 8, width: 6, height: 26, marginLeft: -3, backgroundColor: COLORS.greenDeep, borderRadius: 3 }} />
					</div>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.ink }}>
						Ketik satu-satu... kelamaan!
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.greenDeep, marginTop: 44, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Andi Pratama, Budi Santoso — satu kolom
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 3: the demo — TWO steps (Corporate, dark) -----------------------
// Step A (frames 60-190): type "Andi" -> press Ctrl+E -> first names fill.
// Step B (frames 220-380): type "Pratama" -> press Ctrl+E again ->
// last names fill. Never a one-step version.
export const Scene3 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 10);
	const sub = fadeUp(frame, 30);
	const firstHl = frame >= 120;
	const lastHl = frame >= 290;
	const cap1 = fadeUp(frame, 150);
	const cap2 = fadeUp(frame, 320);

	const cell = (flex, extra = {}) => ({
		flex,
		padding: "20px 18px",
		fontFamily: FONT,
		fontSize: 36,
		...extra,
	});

	const rowStyle = (r) => ({
		display: "flex",
		backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white,
		borderTop: `2px solid ${COLORS.grid}`,
	});

	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels006/scene3.mp3")} />
			<div style={{ padding: "120px 90px 0" }}>
				<div style={{ display: "flex", alignItems: "center", gap: 28 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
						<KeyCap label="Ctrl" frame={frame} appearAt={96} pressAt={120} fontSize={44} padding="18px 26px" />
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: COLORS.muted }}>+</div>
						<KeyCap label="E" frame={frame} appearAt={104} pressAt={120} fontSize={44} padding="18px 26px" />
					</div>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: COLORS.white, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
						Flash Fill
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.muted, marginTop: 14, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Excel menebak polanya sendiri
				</div>
				<div style={{ marginTop: 40, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
					<div style={{ display: "flex", backgroundColor: COLORS.greenDeep }}>
						<div style={cell(1.35, { fontWeight: 800, color: COLORS.white })}>Nama Lengkap</div>
						<div
							style={cell(1, {
								fontWeight: 800,
								color: firstHl ? COLORS.ink : COLORS.white,
								backgroundColor: firstHl ? COLORS.yellow : "transparent",
							})}
						>
							Nama Depan
						</div>
						<div
							style={cell(1.15, {
								fontWeight: 800,
								color: lastHl ? COLORS.ink : COLORS.white,
								backgroundColor: lastHl ? COLORS.yellow : "transparent",
							})}
						>
							Nama Belakang
						</div>
					</div>
					{FULL.map((full, r) => {
						// Step A: row 0 first name typed 60-90, others pop 150/165.
						// Step B: row 0 last name typed 220-260, others pop 320/335.
						const firstShown = r === 0 ? frame >= 60 : frame >= 150 + (r - 1) * 15;
						const firstPop = r === 0 ? 1 : pop(frame, 150 + (r - 1) * 15);
						const lastShown = r === 0 ? frame >= 220 : frame >= 320 + (r - 1) * 15;
						const lastPop = r === 0 ? 1 : pop(frame, 320 + (r - 1) * 15);
						return (
							<div key={full} style={rowStyle(r)}>
								<div style={cell(1.35, { fontWeight: 700, color: COLORS.ink })}>{full}</div>
								<div
									style={cell(1, {
										fontWeight: 700,
										color: COLORS.ink,
										backgroundColor: firstHl ? "#FFF3BF" : "transparent",
									})}
								>
									<span style={{ display: "inline-block", opacity: firstShown ? 1 : 0, transform: `scale(${firstPop})` }}>
										{r === 0 ? (
											<TypeReveal text="Andi" frame={frame} startFrame={60} endFrame={90} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: COLORS.ink }} />
										) : (
											FIRST[r]
										)}
									</span>
								</div>
								<div
									style={cell(1.15, {
										fontWeight: 700,
										color: COLORS.ink,
										backgroundColor: lastHl ? "#FFF3BF" : "transparent",
									})}
								>
									<span style={{ display: "inline-block", opacity: lastShown ? 1 : 0, transform: `scale(${lastPop})` }}>
										{r === 0 ? (
											<TypeReveal text="Pratama" frame={frame} startFrame={220} endFrame={260} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: COLORS.ink }} />
										) : (
											LAST[r]
										)}
									</span>
								</div>
							</div>
						);
					})}
				</div>
				<div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}>
					<KeyCap label="Ctrl" frame={frame} appearAt={266} pressAt={290} fontSize={44} padding="18px 26px" />
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: COLORS.muted }}>+</div>
					<KeyCap label="E" frame={frame} appearAt={274} pressAt={290} fontSize={44} padding="18px 26px" />
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: COLORS.yellow, alignSelf: "center", marginLeft: 12 }}>
						lagi!
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.white, marginTop: 36, textAlign: "center", lineHeight: 1.35, opacity: cap1.opacity, transform: `translateY(${cap1.translateY}px)` }}>
					Ketik “Andi” → Ctrl+E → nama depan terisi
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.yellow, marginTop: 12, textAlign: "center", lineHeight: 1.35, opacity: cap2.opacity, transform: `translateY(${cap2.translateY}px)` }}>
					Ketik “Pratama” → Ctrl+E → nama belakang terisi
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 4: the result (Corporate, light) --------------------------------
export const Scene4 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 12);
	const sub = fadeUp(frame, 34);
	const hl = frame >= 70;
	const caption = fadeUp(frame, 160);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels006/scene4.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 68, lineHeight: 1.12, color: COLORS.ink, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Nama depan &amp; belakang
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 68, lineHeight: 1.12, color: COLORS.greenDeep, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					terpisah rapi
				</div>
				<div style={{ marginTop: 52, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(10,59,46,0.22)" }}>
					<div style={{ display: "flex", backgroundColor: COLORS.greenDeep }}>
						<div style={{ flex: 1, padding: "22px 28px", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: hl ? COLORS.ink : COLORS.white, backgroundColor: hl ? COLORS.yellow : "transparent" }}>
							Nama Depan
						</div>
						<div style={{ flex: 1, padding: "22px 28px", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: hl ? COLORS.ink : COLORS.white, backgroundColor: hl ? COLORS.yellow : "transparent" }}>
							Nama Belakang
						</div>
					</div>
					{FIRST.map((f, r) => {
						const a = fadeUp(frame, 70 + r * 10, 16);
						const s = pop(frame, 70 + r * 10);
						return (
							<div
								key={f}
								style={{
									display: "flex",
									backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white,
									borderTop: `2px solid ${COLORS.grid}`,
									opacity: a.opacity,
									transform: `translateY(${a.translateY}px)`,
								}}
							>
								<div style={{ flex: 1, padding: "22px 28px", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.ink, backgroundColor: hl ? "#FFF3BF" : "transparent" }}>
									<span style={{ display: "inline-block", transform: `scale(${s})` }}>{f}</span>
								</div>
								<div style={{ flex: 1, padding: "22px 28px", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.ink, backgroundColor: hl ? "#FFF3BF" : "transparent" }}>
									<span style={{ display: "inline-block", transform: `scale(${s})` }}>{LAST[r]}</span>
								</div>
							</div>
						);
					})}
				</div>
				<div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 20 }}>
					<CheckBullet text="Tanpa rumus" delay={120} dark />
					<CheckBullet text="Tanpa ketik satu-satu" delay={140} dark />
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.greenDeep, marginTop: 48, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Rekap nilaimu jadi jauh lebih cepat
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 5: closing CTA (Energetic) + real photo, students crop ----------
export const Scene5 = () => {
	const frame = useCurrentFrame();
	const t1 = fadeUp(frame, 0);
	const t2 = fadeUp(frame, 14);
	// Real photo: visible frames 30-110 (80 frames = 2.67s).
	// TIGHT crop on the STUDENTS side: zoom IN 1.35 -> 1.55 PLUS
	// translateX(-14%) — objectPosition alone cannot shift the crop
	// horizontally here (the image fills the box width at scale 1.0,
	// so there is no horizontal overflow to position), and a centered
	// zoom alone still kept the teacher in the middle. The left shift
	// pushes the teacher mostly out of frame and centres the raised
	// hands + smiling students on the right. Opposite framing from
	// scene 1 (teacher crop, zoom out) and from Reels #005 (full
	// frame, zoom in 1.0-1.06).
	const photoIn = fadeUp(frame, 30, 24);
	const photoZoom = 1.35 + 0.2 * interpolate(frame, [30, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const photoOut = frame > 110 ? 1 - interpolate(frame, [110, 124], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
	const photoOpacity = Math.max(0, Math.min(1, photoIn.opacity * photoOut));
	const pulse = 1 + 0.045 * Math.sin((frame - 150) / 9);
	const l1 = fadeUp(frame, 130);
	const l2 = fadeUp(frame, 150);
	const foot = fadeUp(frame, 180);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels006/scene5.mp3")} />
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 110 }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 78, color: COLORS.white, opacity: t1.opacity, transform: `translateY(${t1.translateY}px)` }}>
					SIMPAN BUAT
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 78, color: COLORS.yellow, opacity: t2.opacity, transform: `translateY(${t2.translateY}px) scale(${pop(frame, 14) * pulse})` }}>
					REKAP NILAIMU!
				</div>
			</div>
			<div
				style={{
					position: "absolute",
					top: 380,
					left: 100,
					width: 880,
					height: 420,
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
					style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "85% 60%", transform: `translateX(-14%) scale(${photoZoom})` }}
				/>
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
						fontSize: 36,
						color: COLORS.white,
					}}
				>
					Murid berani mencoba — foto real
				</div>
			</div>
			<div style={{ position: "absolute", top: 880, left: 100, right: 100, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.white, lineHeight: 1.3, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
				Komentar: shortcut apa yang paling kamu butuh?
			</div>
			<div style={{ position: "absolute", top: 1060, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: COLORS.green, opacity: l2.opacity, transform: `translateY(${l2.translateY}px) scale(${1 + 0.03 * Math.sin((frame - 168) / 9)})` }}>
				@aksaracademy
			</div>
			<div style={{ position: "absolute", top: 1200, left: 0, right: 0, textAlign: "center", opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.yellow }}>Puncak Bulan Guru Nasional</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: COLORS.muted, marginTop: 10 }}>
					Guru Hebat, Indonesia Kuat
				</div>
			</div>
		</AbsoluteFill>
	);
};
