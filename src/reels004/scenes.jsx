import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timings";
import { COLORS, FONT, CheckBullet, StepBadge, SheetTable, fadeUp, pop } from "./ui";

// ---------------------------------------------------------------------------
// Motion system for Reels #004 (from brand.md / MOTION.md + new motion skills)
// - LottieFiles: Corporate base (200-400ms, cubic-bezier(0.2,0,0,1), 0-3%
//   overshoot); Energetic hook + CTA (100-250ms, ease-out-expo, 15-30%
//   overshoot). Three layers per scene (primary / secondary / ambient),
//   1/3 rule, stagger total <500ms.
// - Emil Kowalski: key press = scale 0.97 over 100-160ms with ease-out
//   cubic-bezier(0.23,1,0.32,1); never scale(0); shadow shrinks on press
//   (secondary layer); transitions, not keyframes, for fast re-triggering.
// - charlie947 pack: facts first (all shortcuts verified), first 3 seconds
//   carry the hook, mid-shot frame check before export.
// ---------------------------------------------------------------------------

const ROWS = [
	["Andi", "Jakarta", "Rp 250.000"],
	["Budi", "Bandung", "Rp 180.000"],
	["Citra", "Surabaya", "Rp 320.000"],
	["Dewi", "Medan", "Rp 150.000"],
	["Eko", "Pekanbaru", "Rp 275.000"],
];

const NAMES12 = [
	"Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar",
	"Gita", "Hadi", "Indah", "Joko", "Kirana", "Lukman",
];

// 3D keyboard key. pressAt = frame the key is pressed (Emil: scale 0.97,
// 100-160ms ≈ 3-5 frames at 30fps). Shadow (secondary layer) shrinks
// while pressed. Never scales from 0 — appearance uses pop() (spring from
// ~0.95 via the shared pop helper, matching reels002/003).
const KeyCap = ({ label, frame, appearAt = 0, pressAt = null, fontSize = 52, padding = "26px 36px" }) => {
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
				backgroundColor: COLORS.ink,
				borderRadius: 20,
				padding,
				borderBottom: `${borderBottom}px solid rgba(0,0,0,0.45)`,
				transform: `scale(${scale})`,
				boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
			}}
		>
			<div style={{ fontFamily: FONT, fontWeight: 800, fontSize, color: COLORS.white, lineHeight: 1 }}>
				{label}
			</div>
		</div>
	);
};

const KeyCapLight = ({ label, frame, appearAt = 0, pressAt = null, fontSize = 52, padding = "26px 36px" }) => {
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
				backgroundColor: COLORS.white,
				borderRadius: 20,
				padding,
				borderBottom: `${borderBottom}px solid ${COLORS.grid}`,
				transform: `scale(${scale})`,
				boxShadow: "0 14px 30px rgba(10,59,46,0.22)",
			}}
		>
			<div style={{ fontFamily: FONT, fontWeight: 800, fontSize, color: COLORS.ink, lineHeight: 1 }}>
				{label}
			</div>
		</div>
	);
};

const Plus = ({ frame, appearAt }) => (
	<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: COLORS.muted, transform: `scale(${pop(frame, appearAt)})` }}>
		+
	</div>
);

// --- Scene 1: hook (Energetic) --------------------------------------------
export const Scene1 = () => {
	const frame = useCurrentFrame();
	const l1 = fadeUp(frame, 0);
	const l2 = fadeUp(frame, 14);
	const l3 = fadeUp(frame, 28);
	const sub = fadeUp(frame, 44);
	// Panicked cursor: jumps left/right across the table (primary layer).
	// Kept over the Nama/Kota columns and inside the table body rows so it
	// never covers the Harga header or the price values (same class of defect
	// as the Reels #003 cursor fix).
	const cursorX = 130 + 360 * (0.5 + 0.5 * Math.sin(frame / 9));
	const cursorY = 850 + 110 * Math.sin(frame / 7);
	const ring = 1 + 0.5 * ((frame % 30) / 30);
	const ringOpacity = 1 - (frame % 30) / 30;
	const badge = pop(frame, 128);
	const pulse = 1 + 0.045 * Math.sin((frame - 140) / 6);
	const keys = ["Ctrl+C", "Ctrl+Z", "Ctrl+→", "Ctrl+Shift+L", "F4"];
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels004/scene1.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COLORS.white, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					KERJA DI EXCEL
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COLORS.white, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					MASIH KLIK
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: COLORS.yellow, opacity: l3.opacity, transform: `translateY(${l3.translateY}px)` }}>
					SANA-SINI?
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 44, color: COLORS.muted, marginTop: 28, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					5 shortcut orang kantor
				</div>
			</div>
			<div style={{ position: "absolute", top: 640, left: 100, width: 880 }}>
				<SheetTable
					headers={["Nama", "Kota", "Harga"]}
					rows={ROWS.slice(0, 3)}
					colFlex={[1.1, 1.2, 1.1]}
					frame={frame}
					appearFrom={52}
					stagger={8}
					width={880}
				/>
				<div
					style={{
						position: "absolute",
						left: cursorX - 100,
						top: cursorY - 640,
						width: 0,
						height: 0,
						borderLeft: "18px solid transparent",
						borderRight: "18px solid transparent",
						borderTop: `34px solid ${COLORS.yellow}`,
						transform: "rotate(135deg)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: cursorX - 100,
						top: cursorY - 640,
						width: 56 * ring,
						height: 56 * ring,
						border: `4px solid ${COLORS.yellow}`,
						borderRadius: "50%",
						marginLeft: -28 * ring + 18,
						marginTop: -28 * ring + 18,
						opacity: ringOpacity,
					}}
				/>
			</div>
			<div style={{ position: "absolute", top: 1150, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
				{keys.map((k, i) => {
					// "Ctrl+Shift+L" is much longer than the other labels — shrink
					// its font/padding so the row still fits 1080px without overflow.
					const long = k === "Ctrl+Shift+L";
					return (
						<div key={k} style={{ transform: `scale(${pop(frame, 96 + i * 3)})` }}>
							<div style={{ backgroundColor: COLORS.white, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: long ? 30 : 34, padding: long ? "18px 16px" : "18px 22px", borderRadius: 16, borderBottom: "8px solid rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
								{k}
							</div>
						</div>
					);
				})}
			</div>
			<div style={{ position: "absolute", top: 1370, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
				<div style={{ backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "26px 44px", borderRadius: 999, transform: `scale(${badge * pulse})`, boxShadow: "0 18px 44px rgba(0,0,0,0.35)" }}>
					KERJA 2X LEBIH CEPAT!
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 2: Ctrl+C / Ctrl+V (Corporate) ----------------------------------
export const Scene2 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 150);
	const caption = fadeUp(frame, 210);
	const copied = frame >= 78;
	const pasted = frame >= 150;
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels004/scene2.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="1" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: COLORS.ink, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Salin, tempel — tanpa klik kanan
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 56 }}>
					<KeyCapLight label="Ctrl" frame={frame} appearAt={20} pressAt={52} />
					<Plus frame={frame} appearAt={26} />
					<KeyCapLight label="C" frame={frame} appearAt={30} pressAt={52} />
					<div style={{ width: 28 }} />
					<KeyCapLight label="Ctrl" frame={frame} appearAt={96} pressAt={128} />
					<Plus frame={frame} appearAt={102} />
					<KeyCapLight label="V" frame={frame} appearAt={106} pressAt={128} />
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: COLORS.greenDeep, marginTop: 48, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Ctrl + C → Salin &nbsp;&nbsp; Ctrl + V → Tempel
				</div>
				<div style={{ marginTop: 52, display: "flex", justifyContent: "center" }}>
					<SheetTable
						headers={["Nama", "Harga"]}
						rows={ROWS.map(([n, , h]) => [n, h]).concat([["Andi (salinan)", "Rp 250.000"]])}
						colFlex={[1.4, 1]}
						frame={frame}
						appearFrom={40}
						stagger={7}
						highlightCols={{ 0: 78 }}
						popCells={{ "5,0": 150, "5,1": 158 }}
						width={880}
					/>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: copied ? COLORS.greenDeep : COLORS.muted, marginTop: 44, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					{copied ? (pasted ? "Tersalin, tertempel — selesai!" : "Disalin...") : "Pilih selnya, tekan Ctrl + C"}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 3: Ctrl+Z (Corporate) -------------------------------------------
export const Scene3 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	// UNDO appears with the Ctrl+Z key press (frame 60), not at frame 150 —
	// previously it only finished fading in near the end of the scene and was
	// unreadable mid-scene. Color stays COLORS.yellow (#FFD23F) on dark green.
	const sub = fadeUp(frame, 60);
	const caption = fadeUp(frame, 200);
	const wrong = frame < 96;
	const shake = wrong && frame >= 40 && frame < 70 ? Math.sin(frame / 2) * 10 : 0;
	const fixed = pop(frame, 96);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels004/scene3.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="2" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: COLORS.white, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Salah? Balik lagi!
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 56 }}>
					<KeyCap label="Ctrl" frame={frame} appearAt={20} pressAt={60} />
					<Plus frame={frame} appearAt={26} />
					<KeyCap label="Z" frame={frame} appearAt={30} pressAt={60} />
					<div style={{ marginLeft: 30, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: COLORS.yellow, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
						UNDO
					</div>
				</div>
				<div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
					<div style={{ width: 880, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
						<div style={{ display: "flex", backgroundColor: COLORS.greenDeep }}>
							<div style={{ flex: 1.4, padding: "22px 20px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Nama</div>
							<div style={{ flex: 1, padding: "22px 20px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Harga</div>
						</div>
						{[
							["Andi", "Rp 250.000", false],
							["Budi", "Rp 999.000", true],
							["Citra", "Rp 320.000", false],
						].map(([n, h, isWrong], r) => (
							<div key={r} style={{ display: "flex", backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white, borderTop: `2px solid ${COLORS.grid}` }}>
								<div style={{ flex: 1.4, padding: "22px 20px", fontFamily: FONT, fontWeight: 700, fontSize: 38, color: COLORS.ink }}>{n}</div>
								<div
									style={{
										flex: 1,
										padding: "22px 20px",
										fontFamily: FONT,
										fontWeight: 700,
										fontSize: 38,
										color: isWrong ? (wrong ? "#C0392B" : COLORS.green) : COLORS.ink,
										textDecoration: isWrong && wrong ? "line-through" : "none",
										transform: isWrong ? `translateX(${shake}px) scale(${wrong ? 1 : fixed})` : "none",
									}}
								>
									{isWrong && !wrong ? "Rp 180.000" : h}
								</div>
							</div>
						))}
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.yellow, marginTop: 56, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					{wrong ? "Aduh, salah hapus..." : "Ctrl + Z — balik seperti semula!"}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 4: Ctrl+Panah (Corporate) ---------------------------------------
export const Scene4 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 150);
	const caption = fadeUp(frame, 210);
	// Selection box jumps from row 0 to row 11 (frames 70-95, fast ease-out).
	const jump = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const eased = 1 - Math.pow(1 - jump, 3);
	const ROW_H = 62;
	const HEADER_H = 76;
	const TABLE_TOP = 620;
	const selTop = TABLE_TOP + HEADER_H + eased * 11 * ROW_H;
	const ghostOpacity = jump > 0 && jump < 1 ? 0.35 : 0;
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels004/scene4.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="3" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: COLORS.ink, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Loncat ke ujung data
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 52 }}>
					<KeyCapLight label="Ctrl" frame={frame} appearAt={20} pressAt={55} />
					<Plus frame={frame} appearAt={26} />
					<KeyCapLight label="↓" frame={frame} appearAt={30} pressAt={55} />
					<div style={{ marginLeft: 30, fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.greenDeep, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
						Baris 1 → Baris 1000
					</div>
				</div>
			</div>
			<div style={{ position: "absolute", top: TABLE_TOP, left: 100, width: 880 }}>
				<div style={{ backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(10,59,46,0.22)" }}>
					<div style={{ display: "flex", backgroundColor: COLORS.greenDeep, height: HEADER_H, alignItems: "center" }}>
						<div style={{ flex: 1.4, padding: "0 20px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Nama</div>
						<div style={{ flex: 1, padding: "0 20px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Harga</div>
					</div>
					{NAMES12.map((n, r) => (
						<div key={r} style={{ display: "flex", height: ROW_H, backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white, borderTop: `2px solid ${COLORS.grid}`, alignItems: "center" }}>
							<div style={{ flex: 1.4, padding: "0 20px", fontFamily: FONT, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>{n}</div>
							<div style={{ flex: 1, padding: "0 20px", fontFamily: FONT, fontWeight: 500, fontSize: 34, color: COLORS.ink }}>Rp {(120 + ((r * 37) % 220))}.000</div>
						</div>
					))}
				</div>
				<div style={{ position: "absolute", left: 0, right: 0, top: TABLE_TOP + HEADER_H + eased * 5.5 * ROW_H - TABLE_TOP, height: ROW_H, border: `4px solid ${COLORS.yellow}`, borderRadius: 12, opacity: ghostOpacity, pointerEvents: "none" }} />
				<div style={{ position: "absolute", left: 0, right: 0, top: selTop - TABLE_TOP, height: ROW_H, border: `5px solid ${COLORS.green}`, borderRadius: 12, pointerEvents: "none", boxShadow: "0 0 0 4px rgba(23,166,115,0.25)" }} />
			</div>
			<div style={{ position: "absolute", top: 1500, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COLORS.greenDeep, opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Tanpa scroll — sekejap sampai!
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 5: Ctrl+Shift+L (Corporate) -------------------------------------
export const Scene5 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 150);
	const caption = fadeUp(frame, 200);
	const menu = pop(frame, 130);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels004/scene5.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="4" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: COLORS.white, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Filter langsung muncul
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 52 }}>
					<KeyCap label="Ctrl" frame={frame} appearAt={20} pressAt={55} fontSize={44} padding="24px 28px" />
					<Plus frame={frame} appearAt={26} />
					<KeyCap label="Shift" frame={frame} appearAt={30} pressAt={55} fontSize={44} padding="24px 28px" />
					<Plus frame={frame} appearAt={34} />
					<KeyCap label="L" frame={frame} appearAt={38} pressAt={55} fontSize={44} padding="24px 28px" />
					<div style={{ marginLeft: 20, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.yellow, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
						AutoFilter
					</div>
				</div>
				<div style={{ marginTop: 64, display: "flex", justifyContent: "center", position: "relative" }}>
					<div style={{ width: 880, backgroundColor: COLORS.white, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
						<div style={{ display: "flex", backgroundColor: COLORS.greenDeep }}>
							{["Nama", "Kota", "Harga"].map((h, i) => (
								<div key={h} style={{ flex: [1.1, 1.2, 1.1][i], padding: "22px 20px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white, display: "flex", alignItems: "center", gap: 12 }}>
									{h}
									<span style={{ display: "inline-block", fontSize: 26, color: COLORS.yellow, transform: `scale(${pop(frame, 82 + i * 4)})` }}>▼</span>
								</div>
							))}
						</div>
						{ROWS.slice(0, 3).map((row, r) => (
							<div key={r} style={{ display: "flex", backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white, borderTop: `2px solid ${COLORS.grid}` }}>
								{row.map((val, c) => (
									<div key={c} style={{ flex: [1.1, 1.2, 1.1][c], padding: "22px 20px", fontFamily: FONT, fontWeight: c === 0 ? 700 : 500, fontSize: 38, color: COLORS.ink, borderRight: c < 2 ? `2px solid ${COLORS.grid}` : undefined }}>
										{val}
									</div>
								))}
							</div>
						))}
					</div>
					<div
						style={{
							position: "absolute",
							top: 96,
							left: 330,
							width: 320,
							backgroundColor: COLORS.white,
							borderRadius: 20,
							padding: "20px 24px",
							boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
							transform: `scale(${menu})`,
						}}
					>
						{["✓ Jakarta", "Bandung", "Surabaya"].map((c, i) => (
							<div key={c} style={{ fontFamily: FONT, fontWeight: i === 0 ? 800 : 500, fontSize: 36, color: i === 0 ? COLORS.greenDeep : COLORS.ink, padding: "8px 0" }}>
								{c}
							</div>
						))}
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.yellow, marginTop: 56, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Cari data tinggal klik panah kecilnya
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 6: F4 (Corporate) ------------------------------------------------
export const Scene6 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 150);
	const caption = fadeUp(frame, 200);
	const first = pop(frame, 44);
	const second = pop(frame, 104);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/reels004/scene6.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="5" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: COLORS.ink, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Ulangi perintah terakhir
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 52 }}>
					<KeyCapLight label="F4" frame={frame} appearAt={20} pressAt={90} fontSize={60} padding="28px 44px" />
					<div style={{ marginLeft: 24, fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.greenDeep, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
						Sekali tekan, ikut semua
					</div>
				</div>
				<div style={{ marginTop: 80, display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
					<div style={{ width: 340, backgroundColor: COLORS.yellow, borderRadius: 28, padding: "44px 30px", textAlign: "center", transform: `scale(${first})`, boxShadow: "0 24px 60px rgba(10,59,46,0.25)" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.ink }}>Andi</div>
						<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 10 }}>Rp 250.000</div>
						<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32, color: COLORS.greenDeep, marginTop: 16 }}>✓ diwarnai</div>
					</div>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, color: COLORS.green, transform: `scale(${pop(frame, 96)})` }}>→</div>
					<div style={{ width: 340, backgroundColor: COLORS.yellow, borderRadius: 28, padding: "44px 30px", textAlign: "center", transform: `scale(${second})`, boxShadow: "0 24px 60px rgba(10,59,46,0.25)" }}>
						<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.ink }}>Budi</div>
						<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 10 }}>Rp 180.000</div>
						<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32, color: COLORS.greenDeep, marginTop: 16 }}>✓ ikut terwarnai</div>
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.ink, marginTop: 64, textAlign: "center", opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Tanpa mengulang dari awal
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Scene 7: closing CTA (Energetic) ---------------------------------------
export const Scene7 = () => {
	const frame = useCurrentFrame();
	const check = pop(frame, 0);
	const t1 = fadeUp(frame, 26);
	const t2 = fadeUp(frame, 42);
	const pulse = 1 + 0.045 * Math.sin((frame - 80) / 9);
	const l1 = fadeUp(frame, 220);
	const l2 = fadeUp(frame, 250);
	const l3 = fadeUp(frame, 290);
	const foot = fadeUp(frame, 320);
	const cards = [
		["1", "Ctrl + C / V"],
		["2", "Ctrl + Z"],
		["3", "Ctrl + Panah"],
		["4", "Ctrl + Shift + L"],
		["5", "F4"],
	];
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/reels004/scene7.mp3")} />
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 140 }}>
				<div style={{ width: 150, height: 150, borderRadius: "50%", backgroundColor: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})` }}>
					<div style={{ color: COLORS.white, fontSize: 92, fontWeight: 800, fontFamily: FONT }}>✓</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 80, color: COLORS.white, marginTop: 40, opacity: t1.opacity, transform: `translateY(${t1.translateY}px)` }}>
					SELESAI,
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, color: COLORS.yellow, opacity: t2.opacity, transform: `translateY(${t2.translateY}px) scale(${pop(frame, 42) * pulse})` }}>
					2X LEBIH CEPAT!
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 56, width: 880 }}>
					{cards.map(([num, label], i) => {
						const { opacity, translateY } = fadeUp(frame, 150 + i * 3, 24);
						return (
							<div
								key={num}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 24,
									backgroundColor: COLORS.white,
									borderRadius: 20,
									padding: "18px 28px",
									opacity,
									transform: `translateY(${translateY}px)`,
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
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: COLORS.yellow, marginTop: 60, textAlign: "center", lineHeight: 1.25, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					Komentar: nomor berapa
					<br />
					yang baru kamu tahu?
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 44, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					<div style={{ width: 46, height: 64, backgroundColor: COLORS.yellow, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)" }} />
					<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.white }}>
						Simpan video ini biar tidak lupa
					</div>
				</div>
				<div style={{ marginTop: 64, textAlign: "center", opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: COLORS.green }}>@aksaracademy</div>
					<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: COLORS.muted, marginTop: 10 }}>
						Ikuti untuk tips Office lainnya
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
