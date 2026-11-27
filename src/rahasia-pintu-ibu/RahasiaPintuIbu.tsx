// RahasiaPintuIbu — 90 detik, 5 adegan (2700 frame @ 30 fps, 1080x1920).
// Adaptasi komik "Rahasia di Balik Pintu Ibu" — interior rumah kayu tua + cermin beriak.
//
// RANTAI POST MANUAL (pelajaran Trial3D): composer mentah `postprocessing` dibuat di useMemo
// dan digerakkan dari useFrame prioritas 1. JANGAN pakai wrapper React <EffectComposer>:
// di Remotion (frameloop="never") frame dirender sebelum state composer sampai ke useFrame
// dan hasilnya frame HITAM. Rantai: RenderPass -> InkPass -> LensBlur pre+main (cInf=0,
// DOF MATI) -> Bloom (threshold 0.8, intensitas 0.7 agar cermin emas berpendar)
// -> ToneMapping + Grade (malam -> siang di B1/D, malam -> fajar di E2).
import React, { useEffect, useMemo, useState } from "react";
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
import { World, loadKit } from "./world";
import { SHOTS, dawnU, dayU } from "./story";
import { Kit } from "./build";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_DAY2 } from "./grade";

export const RAHASIA_PINTU_IBU_FRAMES = 2700;

const makeBloom = () => {
	const b = new BloomEffect({
		blendFunction: BlendFunction.ADD,
		intensity: 0.7,
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

const Inner: React.FC<{ kit: Kit }> = ({ kit }) => {
	const f = useCurrentFrame();
	const { camera, scene, gl } = useThree();
	const world = useMemo(() => new World(kit), [kit]);
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
			sizeRef.height = sizeVec.height;
			sizeRef.pixelRatio = pixelRatio;
		}
		chain.render(delta);
	}, 1);
	const cam = camera as THREE.PerspectiveCamera;
	const shotId = (SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1]).id;
	target.copy(world.update(shotId, f, cam, scene));
	noInkFallback(world.root);
	cam.getWorldDirection(fwd);
	fpt.copy(target);
	fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
	fx.lens.cInf = 0; // DOF mati — semua tajam
	// grade: malam -> siang (B1 pagi + D ruang kenangan), malam -> fajar (E2 pagi)
	const dy = dayU(f);
	if (dy > 0) fx.grade.set(GRADES.night, GRADE_DAY2, dy);
	else fx.grade.set(GRADES.night, GRADES.dawn, dawnU(f));
	fx.grade.amount = 1;
	return <primitive object={world.root} dispose={null} />;
};

const useKit = () => {
	const [kit, setKit] = useState<Kit | null>(null);
	const [handle] = useState(() => delayRender("rahasia-pintu-ibu kit"));
	useEffect(() => {
		loadKit().then((k) => {
			setKit(k);
			continueRender(handle);
		});
	}, [handle]);
	return kit;
};

export const RahasiaPintuIbu: React.FC = () => {
	const kit = useKit();
	if (!kit) return null;
	return (
		<AbsoluteFill style={{ background: "#060a18" }}>
			<ThreeCanvas
				width={1080}
				height={1920}
				shadows
				gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
				camera={{ fov: 40, near: 0.2, far: 1500 }}
			>
				<Inner kit={kit} />
			</ThreeCanvas>
			{/* Audio campuran 90 dtk (VO + musik + SFX), public/rahasia-pintu-ibu/audio/mix.wav. */}
			<Audio src={staticFile("rahasia-pintu-ibu/audio/mix.wav")} />
		</AbsoluteFill>
	);
};
