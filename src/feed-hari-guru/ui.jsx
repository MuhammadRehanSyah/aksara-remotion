import { interpolate, spring } from "remotion";
import { FPS } from "./timings";

export const COLORS = {
	dark: "#0A3B2E",
	green: "#17A673",
	greenDeep: "#0E6B4A",
	light: "#EAF6EF",
	yellow: "#FFD23F",
	white: "#FFFFFF",
	ink: "#10231C",
};

export const FONT = "Poppins, sans-serif";

// Emil: never scale(0) — spring from ~0.95.
export const pop = (frame, delay = 0) =>
	spring({ frame: frame - delay, fps: FPS, config: { damping: 13, stiffness: 160 } });

// LottieFiles Corporate entrance: ease-out, 18 frame (600ms dramatic reveal),
// translateY + opacity together (never opacity-only).
export const fadeUp = (frame, delay = 0, distance = 36) => {
	const p = interpolate(frame - delay, [0, 18], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	return { opacity: p, translateY: (1 - p) * distance };
};
