// KacaurusTrial — 30 detik, 4 shot (720 frame @ 24 fps, 1080x1920).
// Trial gaya Kacaurus: warung kopi malam, 2 tokoh kotak-kotak 3D original (Pak Darno + Dimas).
//
// RANTAI POST MANUAL (pelajaran Trial3D): composer mentah `postprocessing` dibuat di useMemo
// dan digerakkan dari useFrame prioritas 1. JANGAN pakai wrapper React <EffectComposer>:
// di Remotion (frameloop="never") frame dirender sebelum state composer sampai ke useFrame
// dan hasilnya frame HITAM. Rantai: RenderPass -> InkPass -> LensBlur pre+main (cInf=0,
// DOF MATI) -> Bloom (threshold 0.8, intensitas 0.5 agar lampu hangat berpendar)
// -> ToneMapping + Grade (malam hangat).
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
import { CAPTIONS, TOTAL, shotAt } from "./story";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES } from "./grade";

export const KACAUSTRRIAL_FRAMES = TOTAL;

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
			grade: new GradeEffect(GRADES.night, 1),
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
	fx.grade.set(GRADES.night, GRADES.night, 0);
	fx.grade.amount = 1;
	return <primitive object={world.root} dispose={null} />;
};

/** Teks layar gaya Kacaurus: putih tebal, garis hitam, di bawah, fade masuk/keluar 6 frame. */
const Caption: React.FC = () => {
	const f = useCurrentFrame();
	const cap = CAPTIONS.find((c) => f >= c.a && f < c.b);
	if (!cap) return null;
	const fadeIn = Math.min(1, (f - cap.a) / 6);
	const fadeOut = Math.min(1, (cap.b - f) / 6);
	const opacity = Math.min(fadeIn, fadeOut);
	return (
		<div
			style={{
				position: "absolute",
				left: 60,
				right: 60,
				bottom: 150,
				textAlign: "center",
				fontFamily: "Poppins, sans-serif",
				fontWeight: 800,
				fontSize: 56,
				lineHeight: 1.2,
				letterSpacing: 1,
				color: "#ffffff",
				textShadow:
					"3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 0 4px #000, 0 8px 16px rgba(0,0,0,0.6)",
				opacity,
			}}
		>
			{cap.text}
		</div>
	);
};

export const KacaurusTrial: React.FC = () => {
	return (
		<AbsoluteFill style={{ background: "#060a18" }}>
			<ThreeCanvas
				width={1080}
				height={1920}
				shadows
				gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
				camera={{ fov: 40, near: 0.2, far: 1500 }}
			>
				<Inner />
			</ThreeCanvas>
			<Caption />
			{/* Audio campuran 30 dtk (VO + musik hangat + SFX koin). */}
			<Audio src={staticFile("kacaurus-trial/audio/mix.wav")} />
		</AbsoluteFill>
	);
};
