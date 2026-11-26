import { interpolate, spring, useCurrentFrame } from "remotion";
import { FPS } from "./timings";

export const COLORS = {
	dark: "#0A3B2E",
	darker: "#06231B",
	green: "#17A673",
	greenDeep: "#0E6B4A",
	light: "#EAF6EF",
	yellow: "#FFD23F",
	yellowDeep: "#F5B800",
	white: "#FFFFFF",
	ink: "#10231C",
	muted: "#9DC3B4",
	rowAlt: "#F2F7F4",
	grid: "#D8E6DD",
};

export const FONT = "Poppins, sans-serif";

export const pop = (frame, delay = 0) =>
	spring({ frame: frame - delay, fps: FPS, config: { damping: 13, stiffness: 160 } });

export const fadeUp = (frame, delay = 0, distance = 36) => {
	const p = interpolate(frame - delay, [0, 18], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return { opacity: p, translateY: (1 - p) * distance };
};

export const StepBadge = ({ label, delay = 0 }) => {
	const frame = useCurrentFrame();
	const s = pop(frame, delay);
	const { opacity } = fadeUp(frame, delay);
	return (
		<div
			style={{
				display: "inline-block",
				backgroundColor: COLORS.yellow,
				color: COLORS.ink,
				fontFamily: FONT,
				fontWeight: 800,
				fontSize: 40,
				letterSpacing: 3,
				padding: "18px 34px",
				borderRadius: 999,
				transform: `scale(${s})`,
				opacity,
			}}
		>
			{label}
		</div>
	);
};

export const CheckBullet = ({ text, delay = 0, dark = false, fontSize = 44 }) => {
	const frame = useCurrentFrame();
	const { opacity, translateY } = fadeUp(frame, delay);
	const s = pop(frame, delay + 8);
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 24,
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			<div
				style={{
					width: 64,
					height: 64,
					borderRadius: "50%",
					backgroundColor: COLORS.green,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transform: `scale(${s})`,
					flexShrink: 0,
				}}
			>
				<div style={{ color: COLORS.white, fontSize: 40, fontWeight: 800, fontFamily: FONT }}>✓</div>
			</div>
			<div
				style={{
					fontFamily: FONT,
					fontWeight: 600,
					fontSize,
					lineHeight: 1.25,
					color: dark ? COLORS.ink : COLORS.white,
				}}
			>
				{text}
			</div>
		</div>
	);
};

// Spreadsheet mockup. highlightCols: {colIndex: fromFrame}; popCells: {"row,col": fromFrame}
export const SheetTable = ({
	headers,
	rows,
	colFlex,
	frame,
	appearFrom = 0,
	stagger = 7,
	highlightCols = {},
	popCells = {},
	width = 880,
	fontSize = 38,
}) => {
	const cell = (flex, extra = {}) => ({
		flex,
		padding: "22px 20px",
		fontFamily: FONT,
		fontSize,
		...extra,
	});
	return (
		<div
			style={{
				width,
				backgroundColor: COLORS.white,
				borderRadius: 28,
				overflow: "hidden",
				boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
			}}
		>
			<div style={{ display: "flex", backgroundColor: COLORS.greenDeep }}>
				{headers.map((h, i) => {
					const hl = highlightCols[i] !== undefined && frame >= highlightCols[i];
					return (
						<div
							key={i}
							style={cell(colFlex[i], {
								fontWeight: 800,
								color: hl ? COLORS.ink : COLORS.white,
								backgroundColor: hl ? COLORS.yellow : "transparent",
							})}
						>
							{h}
						</div>
					);
				})}
			</div>
			{rows.map((row, r) => {
				const { opacity, translateY } = fadeUp(frame, appearFrom + r * stagger, 20);
				return (
					<div
						key={r}
						style={{
							display: "flex",
							backgroundColor: r % 2 === 1 ? COLORS.rowAlt : COLORS.white,
							borderTop: `2px solid ${COLORS.grid}`,
							opacity,
							transform: `translateY(${translateY}px)`,
						}}
					>
						{row.map((val, c) => {
							const hl = highlightCols[c] !== undefined && frame >= highlightCols[c];
							const popFrom = popCells[`${r},${c}`];
							const shown = popFrom === undefined || frame >= popFrom;
							const s = popFrom === undefined ? 1 : pop(frame, popFrom);
							return (
								<div
									key={c}
									style={cell(colFlex[c], {
										fontWeight: c === 0 ? 700 : 500,
										color: hl ? COLORS.ink : COLORS.ink,
										backgroundColor: hl ? "#FFF3BF" : "transparent",
										borderRight: c < row.length - 1 ? `2px solid ${COLORS.grid}` : undefined,
									})}
								>
									<span
										style={{
											display: "inline-block",
											opacity: shown ? 1 : 0,
											transform: `scale(${s})`,
										}}
									>
										{val}
									</span>
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};
