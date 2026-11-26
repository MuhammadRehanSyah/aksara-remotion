import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const TestComp = () => {
	const frame = useCurrentFrame();
	const x = interpolate(frame, [0, 30], [-100, 540]);
	return (
		<AbsoluteFill style={{ backgroundColor: "#0b3d2e", justifyContent: "center", alignItems: "center" }}>
			<div
				style={{
					width: 120,
					height: 120,
					backgroundColor: "#ffd23f",
					borderRadius: 24,
					transform: `translateX(${x - 270}px)`,
				}}
			/>
			<div style={{ color: "#ffffff", fontSize: 48, fontFamily: "sans-serif", marginTop: 40 }}>
				Remotion OK
			</div>
		</AbsoluteFill>
	);
};
