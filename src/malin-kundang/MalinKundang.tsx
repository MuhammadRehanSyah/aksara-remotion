// MalinKundang — 120 detik, 12 shot (2880 frame @ 24 fps, 1080x1920).
// Legenda Malin Kundang: anak durhaka dikutuk ibunya jadi batu di pantai Air Manis.
// Tokoh kotak-kotak 3D (blocky.ts) + lip-sync Rhubarb (lipsync.ts) + dunia pantai/desa/kapal (world.ts).
//
// RANTAI POST MANUAL (pelajaran Trial3D): composer mentah `postprocessing` dibuat di useMemo
// dan digerakkan dari useFrame prioritas 1. JANGAN pakai wrapper React <EffectComposer>:
// di Remotion (frameloop="never") frame dirender sebelum state composer sampai ke useFrame
// dan hasilnya frame HITAM. Rantai: RenderPass -> InkPass -> LensBlur pre+main (cInf=0,
// DOF MATI) -> Bloom (threshold 0.8, intensitas 0.5) -> ToneMapping + Grade (per shot:
// day/golden/storm/dawn).
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import {
	BlendFunction,
	BloomEffect,
	EffectComposer as EffectComposerImpl,
	EffectPass,
	RenderPass,
	ToneMappingEffect,
	ToneMappingMode,
} from "postprocessing";
import { World } from "./world";
import { TOTAL, shotAt, gradeAt, isFlash } from "./story";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADE_DAY2, GRADE_GOLDEN2, GRADE_NIGHT2, GRADE_DAWN2 } from "./grade";

export const MALINKUNDANG_FRAMES = TOTAL;

const GRADE_MAP = { day: GRADE_DAY2, golden: GRADE_GOLDEN2, storm: GRADE_NIGHT2, dawn: GRADE_DAWN2 } as const;

// Poppins lokal (public/fonts/) — Google Fonts fetch stalls di VM ini.
const fontHandle = delayRender("Loading Poppins fonts");
Promise.all(
	[700, 800].map(async (weight) => {
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

const makeBloom = () => {
	const b = new BloomEffect({
		blendFunction: BlendFunction.ADD,
		intensity: 0.5,
		luminanceThreshold: 0.8,
		luminanceSmoothing: 0.2,
		mipmapBlur: true,
		levels: 6,
		radius: 0.6,
	});
	const mip = b.mipmapBlurPass;
	const setSize = mip.setSize.bind(mip);
	mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
	return b;
};

const fwd = new THREE.Vector3();
const fpt = new THREE.Vector3();

const Inner: React.FC = () => {
	const f = useCurrentFrame();
	const { camera, scene, gl } = useThree();
	const world = useMemo(() => new World(), []);
	const target = useMemo(() => new THREE.Vector3(), []);
	const fx = useMemo(
		() => ({
			ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
			lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
			bloom: makeBloom(),
			tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
			grade: new GradeEffect(GRADE_DAY2, 1),
		}),
		[camera, scene],
	);
	useEffect(() => () => fx.ink.dispose(), [fx]);
	const chain = useMemo(() => {
		const composer = new EffectComposerImpl(gl, { multisampling: 0, frameBufferType: THREE.UnsignedByteType });
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(fx.ink);
		composer.addPass(new EffectPass(camera, fx.lens.pre));
		composer.addPass(new EffectPass(camera, fx.lens.main));
		composer.addPass(new EffectPass(camera, fx.bloom));
		composer.addPass(new EffectPass(camera, fx.tone, fx.grade));
		return composer;
	}, [fx, gl, scene, camera]);
	useEffect(() => () => chain.dispose(), [chain]);
	const sizeRef = useMemo(() => ({ width: -1, height: -1, pixelRatio: -1 }), []);
	const sizeVec = useMemo(() => new THREE.Vector2(), []);
	useFrame((_, delta) => {
		gl.toneMapping = THREE.NoToneMapping;
		gl.getSize(sizeVec);
		const pixelRatio = gl.getPixelRatio();
		if (sizeVec.width !== sizeRef.width || sizeVec.height !== sizeRef.height || pixelRatio !== sizeRef.pixelRatio) {
			chain.setSize(sizeVec.width, sizeVec.height);
			sizeRef.width = sizeVec.width;
			sizeRef.height = sizeRef.height;
			sizeRef.pixelRatio = pixelRatio;
		}
		chain.render(delta);
	}, 1);
	const cam = camera as THREE.PerspectiveCamera;
	const shotId = shotAt(f).id;
	target.copy(world.update(shotId, f, cam, scene));
	noInkFallback(world.root);
	cam.getWorldDirection(fwd);
	fpt.copy(target);
	fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
	fx.lens.cInf = 0; // DOF mati — semua tajam
	fx.grade.set(GRADE_MAP[gradeAt(f)], GRADE_MAP[gradeAt(f)], 0);
	fx.grade.amount = 1;
	return <primitive object={world.root} dispose={null} />;
};

/** Kilat petir: layar putih singkat tepat di kata "Petir" (frame dari story.ts isFlash). */
const Flash: React.FC = () => {
	const f = useCurrentFrame();
	if (!isFlash(f)) return null;
	return <div style={{ position: "absolute", inset: 0, background: "#ffffff", opacity: 0.85 }} />;
};

export const MalinKundang: React.FC = () => {
	return (
		<AbsoluteFill style={{ background: "#6fb1e8" }}>
			<ThreeCanvas
				width={1080}
				height={1920}
				shadows
				gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
				camera={{ fov: 40, near: 0.2, far: 1500 }}
			>
				<Inner />
			</ThreeCanvas>
			<Flash />
			{/* Audio campuran 120 dtk (VO + musik per adegan + SFX). */}
			<Audio src={staticFile("malin-kundang/audio/mix.wav")} />
		</AbsoluteFill>
	);
};
