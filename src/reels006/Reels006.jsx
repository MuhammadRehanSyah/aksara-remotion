import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Scene1, Scene2, Scene3, Scene4, Scene5 } from "./scenes";
import { COLORS } from "./ui";
import { SCENES, TOTAL_FRAMES } from "./timings";

// Local Poppins files (public/fonts/) — Google Fonts fetch stalls in this VM,
// so the fonts are bundled locally and loaded via FontFace before rendering.
const fontHandle = delayRender("Loading Poppins fonts");
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

const COMPONENTS = [Scene1, Scene2, Scene3, Scene4, Scene5];

export const Reels006 = () => {
	const frame = useCurrentFrame();
	const progress = Math.min(1, frame / TOTAL_FRAMES);
	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
			{SCENES.map((s, i) => {
				const Comp = COMPONENTS[i];
				return (
					<Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
						<Comp />
					</Sequence>
				);
			})}
			<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, backgroundColor: "rgba(255,255,255,0.18)" }}>
				<div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: COLORS.yellow }} />
			</div>
		</AbsoluteFill>
	);
};
