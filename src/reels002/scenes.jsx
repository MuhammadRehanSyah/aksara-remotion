import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "./timings";
import { COLORS, FONT, CheckBullet, SheetTable, StepBadge, fadeUp, pop } from "./ui";

const NAMES = [
	"Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar",
	"Gita", "Hadi", "Indah", "Joko", "Kirana", "Lukman",
];
const ROWS = [
	["Andi", "Jakarta", "Rp 250.000"],
	["Budi", "Bandung", "Rp 180.000"],
	["Citra", "Surabaya", "Rp 320.000"],
	["Dewi", "Medan", "Rp 150.000"],
	["Eko", "Pekanbaru", "Rp 275.000"],
];

export const Scene1 = () => {
	const frame = useCurrentFrame();
	const l1 = fadeUp(frame, 0);
	const l2 = fadeUp(frame, 14);
	const l3 = fadeUp(frame, 52);
	const badge = pop(frame, 120);
	const pulse = 1 + 0.03 * Math.sin((frame - 130) / 6);
	const ROW_H = 78;
	const doubled = [...NAMES, ...NAMES];
	const offset = (frame * 7) % (NAMES.length * ROW_H);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/scene1.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, lineHeight: 1.08, color: COLORS.white, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					CARI NAMA DI
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, lineHeight: 1.08, color: COLORS.yellow, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					RIBUAN BARIS?
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 46, color: COLORS.muted, marginTop: 28, opacity: l3.opacity, transform: `translateY(${l3.translateY}px)` }}>
					Pakai mata, satu per satu...
				</div>
			</div>
			<div style={{ position: "absolute", top: 640, left: 100, width: 880 }}>
				<div style={{ display: "flex", backgroundColor: COLORS.greenDeep, borderRadius: "28px 28px 0 0", overflow: "hidden" }}>
					<div style={{ flex: 1.4, padding: "22px 24px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Nama</div>
					<div style={{ flex: 1, padding: "22px 24px", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: COLORS.white }}>Harga</div>
				</div>
				<div style={{ height: 468, overflow: "hidden", backgroundColor: COLORS.white, borderRadius: "0 0 28px 28px" }}>
					<div style={{ transform: `translateY(${-offset}px)` }}>
						{doubled.map((n, i) => (
							<div key={i} style={{ display: "flex", height: ROW_H, backgroundColor: i % 2 === 1 ? COLORS.rowAlt : COLORS.white, borderTop: `2px solid ${COLORS.grid}`, alignItems: "center" }}>
								<div style={{ flex: 1.4, padding: "0 24px", fontFamily: FONT, fontWeight: 600, fontSize: 38, color: COLORS.ink }}>{n}</div>
								<div style={{ flex: 1, padding: "0 24px", fontFamily: FONT, fontWeight: 500, fontSize: 38, color: COLORS.ink }}>Rp {(120 + ((i * 37) % 220))}.000</div>
							</div>
						))}
					</div>
				</div>
				<div style={{ position: "absolute", left: 0, right: 0, top: 210, height: 78, border: `4px solid ${COLORS.yellow}`, borderRadius: 16, pointerEvents: "none" }} />
			</div>
			<div style={{ position: "absolute", top: 1300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
				<div style={{ backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 48, padding: "26px 44px", borderRadius: 999, transform: `scale(${badge * pulse})`, boxShadow: "0 18px 44px rgba(0,0,0,0.35)" }}>
					ADA CARA 5 DETIK!
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene2 = () => {
	const frame = useCurrentFrame();
	const label = fadeUp(frame, 0);
	const card = pop(frame, 8);
	const word = "XLOOKUP";
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/scene2.mp3")} />
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px 100px" }}>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, letterSpacing: 6, color: COLORS.greenDeep, opacity: label.opacity, transform: `translateY(${label.translateY}px)` }}>
					KENALIN:
				</div>
				<div style={{ marginTop: 36, backgroundColor: COLORS.dark, borderRadius: 36, padding: "56px 40px", display: "flex", justifyContent: "center", transform: `scale(${card})`, boxShadow: "0 24px 60px rgba(10,59,46,0.30)" }}>
					<div style={{ display: "flex" }}>
						{word.split("").map((ch, i) => {
							const s = pop(frame, 18 + i * 4);
							return (
								<span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 128, color: ch === "X" ? COLORS.yellow : COLORS.white, transform: `scale(${s})`, lineHeight: 1 }}>
									{ch}
								</span>
							);
						})}
					</div>
				</div>
				<div style={{ marginTop: 90, display: "flex", flexDirection: "column", gap: 44 }}>
					<CheckBullet text="Satu rumus, Excel yang mencarikan" delay={70} dark fontSize={46} />
					<CheckBullet text="Tanpa scroll, tanpa cari manual" delay={112} dark fontSize={46} />
				</div>
				<div style={{ marginTop: 90, display: "flex", justifyContent: "center", opacity: fadeUp(frame, 160).opacity }}>
					<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.greenDeep, backgroundColor: COLORS.white, border: `3px solid ${COLORS.green}`, padding: "22px 40px", borderRadius: 999 }}>
						=XLOOKUP( nama; kolom; hasil )
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene3 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const sub = fadeUp(frame, 172);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/scene3.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="LANGKAH 1" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.15, color: COLORS.white, marginTop: 40, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Siapkan tabel acuanmu
				</div>
				<div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
					<SheetTable
						headers={["Nama", "Kota", "Harga"]}
						rows={ROWS}
						colFlex={[1.1, 1.2, 1.1]}
						frame={frame}
						appearFrom={44}
						stagger={8}
						highlightCols={{ 0: 132, 2: 168 }}
					/>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: COLORS.yellow, marginTop: 64, textAlign: "center", opacity: sub.opacity, transform: `translateY(${sub.translateY}px)` }}>
					Kolom Nama + kolom Hasil harus rapi
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene4 = () => {
	const frame = useCurrentFrame();
	const FORMULA = '=XLOOKUP("Andi";\nA2:A100; C2:C100)';
	const typedCount = Math.floor(
		interpolate(frame, [20, 330], [0, FORMULA.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
	);
	const typed = FORMULA.slice(0, typedCount);
	const cursorOn = frame % 30 < 16;
	const caption = fadeUp(frame, 342);
	const result = pop(frame, 414);
	const title = fadeUp(frame, 14);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.darker }}>
			<Audio src={staticFile("audio/scene4.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="LANGKAH 2" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: COLORS.white, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Ketik rumusnya:
				</div>
				<div style={{ marginTop: 52, backgroundColor: "#0F2A21", border: `3px solid ${COLORS.green}`, borderRadius: 28, padding: "44px 38px", minHeight: 170 }}>
					<div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, lineHeight: 1.45, color: COLORS.yellow, whiteSpace: "pre-wrap" }}>
						{typed}
						<span style={{ opacity: cursorOn ? 1 : 0 }}>▌</span>
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 38, color: COLORS.muted, marginTop: 34, opacity: caption.opacity, transform: `translateY(${caption.translateY}px)` }}>
					Contoh: XLOOKUP("Andi"; Nama; Harga)
				</div>
				<div style={{ marginTop: 46, display: "flex", justifyContent: "center" }}>
					<SheetTable
						headers={["Nama", "Harga"]}
						rows={ROWS.map(([n, , h]) => [n, h])}
						colFlex={[1.2, 1]}
						frame={frame}
						appearFrom={30}
						stagger={6}
						highlightCols={{ 0: 348, 1: 388 }}
						width={760}
					/>
				</div>
				<div style={{ display: "flex", justifyContent: "center", marginTop: 52 }}>
					<div style={{ backgroundColor: COLORS.green, color: COLORS.white, fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "24px 44px", borderRadius: 999, transform: `scale(${result})`, boxShadow: "0 18px 44px rgba(0,0,0,0.4)" }}>
						Andi → Rp 250.000
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const Scene5 = () => {
	const frame = useCurrentFrame();
	const title = fadeUp(frame, 16);
	const banner = pop(frame, 208);
	const popCells = { "0,1": 70, "1,1": 100, "2,1": 135, "3,1": 170, "4,1": 200 };
	const progress = interpolate(frame, [60, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	const TABLE_TOP = 470;
	const HEADER_H = 88;
	const ROW_H = 86;
	const handleTop = TABLE_TOP + HEADER_H + ROW_H / 2 + progress * 4 * ROW_H - 22;
	const handleOpacity = interpolate(frame, [52, 62, 196, 208], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.light }}>
			<Audio src={staticFile("audio/scene5.mp3")} />
			<div style={{ padding: "150px 90px 0" }}>
				<StepBadge label="LANGKAH 3" delay={0} />
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.15, color: COLORS.ink, marginTop: 38, opacity: title.opacity, transform: `translateY(${title.translateY}px)` }}>
					Enter, lalu seret ke bawah
				</div>
			</div>
			<div style={{ position: "absolute", top: TABLE_TOP, left: 100, width: 880 }}>
				<SheetTable
					headers={["Nama", "Harga"]}
					rows={ROWS.map(([n, , h]) => [n, h])}
					colFlex={[1.2, 1]}
					frame={frame}
					appearFrom={30}
					stagger={6}
					popCells={popCells}
					width={880}
				/>
				<div
					style={{
						position: "absolute",
						left: 880 - 58,
						top: handleTop - TABLE_TOP,
						width: 44,
						height: 44,
						backgroundColor: COLORS.yellow,
						border: `4px solid ${COLORS.ink}`,
						borderRadius: 8,
						opacity: handleOpacity,
					}}
				/>
			</div>
			<div style={{ position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
				<div style={{ backgroundColor: COLORS.green, color: COLORS.white, fontFamily: FONT, fontWeight: 800, fontSize: 48, padding: "26px 44px", borderRadius: 999, transform: `scale(${banner})`, boxShadow: "0 18px 44px rgba(10,59,46,0.30)" }}>
					Semua hasil ikut terisi!
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
	const pulseA = 1 + 0.045 * Math.sin((frame - 80) / 9);
	const pulseB = 1 + 0.045 * Math.sin((frame - 80) / 9 + Math.PI);
	const l1 = fadeUp(frame, 150);
	const l2 = fadeUp(frame, 230);
	const l3 = fadeUp(frame, 300);
	const foot = fadeUp(frame, 362);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			<Audio src={staticFile("audio/scene6.mp3")} />
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 170 }}>
				<div style={{ width: 150, height: 150, borderRadius: "50%", backgroundColor: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})` }}>
					<div style={{ color: COLORS.white, fontSize: 92, fontWeight: 800, fontFamily: FONT }}>✓</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 80, color: COLORS.white, marginTop: 48, opacity: t1.opacity, transform: `translateY(${t1.translateY}px)` }}>
					SELESAI DALAM
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, color: COLORS.yellow, opacity: t2.opacity, transform: `translateY(${t2.translateY}px)` }}>
					5 DETIK!
				</div>
				<div style={{ display: "flex", gap: 36, marginTop: 76 }}>
					<div style={{ backgroundColor: COLORS.white, color: COLORS.greenDeep, fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "30px 44px", borderRadius: 999, transform: `scale(${pop(frame, 70) * pulseA})` }}>
						VLOOKUP
					</div>
					<div style={{ backgroundColor: COLORS.yellow, color: COLORS.ink, fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "30px 44px", borderRadius: 999, transform: `scale(${pop(frame, 86) * pulseB})` }}>
						XLOOKUP
					</div>
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: COLORS.white, marginTop: 84, opacity: l1.opacity, transform: `translateY(${l1.translateY}px)` }}>
					Excel lama? Pakai VLOOKUP
				</div>
				<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: COLORS.yellow, marginTop: 30, textAlign: "center", lineHeight: 1.25, opacity: l2.opacity, transform: `translateY(${l2.translateY}px)` }}>
					Komentar: tim VLOOKUP
					<br />
					atau XLOOKUP?
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 56, opacity: l3.opacity, transform: `translateY(${l3.translateY}px)` }}>
					<div style={{ width: 46, height: 64, backgroundColor: COLORS.yellow, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)" }} />
					<div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: COLORS.white }}>
						Simpan video ini biar tidak lupa
					</div>
				</div>
				<div style={{ marginTop: 88, textAlign: "center", opacity: foot.opacity, transform: `translateY(${foot.translateY}px)` }}>
					<div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: COLORS.green }}>@aksaracademy</div>
					<div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: COLORS.muted, marginTop: 10 }}>
						Ikuti untuk tips Office lainnya
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
