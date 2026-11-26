// Trial3D — uji coba kartun 3D pertama (12 detik, satu adegan).
// Memakai template bridge (world.ts + story.ts + cast.ts + toon.ts + paint.ts + build.ts):
// kota 3D + jembatan rantai + sungai, karakter bean-head 2D (kolom berbaris + townsfolk).
//
// RANTAI POST (perbaikan 26 Nov 2026): rantai MANUAL — composer mentah `postprocessing`
// dibuat di useMemo dan digerakkan langsung dari useFrame prioritas 1. JANGAN pakai
// wrapper React <EffectComposer> (@react-three/postprocessing): wrapper itu membuat
// composer di useEffect + useState, sehingga di bawah Remotion (frame dimajukan manual,
// frameloop="never") frame dirender/ditangkap SEBELUM state composer sampai ke callback
// useFrame — log membuktikan "composerState MASIH NULL saat frame dirender" — dan tidak
// ada yang menggambar sama sekali (frame kosong). Rantai manual ini terverifikasi di
// PostTest mode manual-chain: garis tinta jelas (piksel hitam 5,56% vs 0,33% baseline),
// ink + bloom + grade masing-masing teruji dan berfungsi.
// DOF (LensBlur) dibiarkan cInf=0 = mati — video trial dirancang semua tajam; blur aktif
// (cInf=8) sangat lambat di render lokal (6+ menit/frame) dan belum teruji visual.
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
import { Kit } from "./build";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH } from "./grade";

export const TRIAL3D_FRAMES = 360;

const makeBloom = () => {
	const b = new BloomEffect({
		blendFunction: BlendFunction.ADD,
		intensity: 0.5,
		luminanceThreshold: 1.0,
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
			grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
		}),
		[camera, scene],
	);
	useEffect(() => () => fx.ink.dispose(), [fx]);
	/** Rantai post manual (lihat catatan di atas): RenderPass -> InkPass -> LensBlur
	 *  (pre + main, cInf=0 = DOF mati) -> Bloom -> ToneMapping + Grade. */
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
		gl.toneMapping = THREE.NoToneMapping; // grade bersifat display-referred; tone mapping hanya dari ToneMappingEffect
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
	target.copy(world.update(1, f, cam, scene));
	noInkFallback(world.root);
	cam.getWorldDirection(fwd);
	fpt.copy(target);
	fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
	fx.lens.cInf = 0; // DOF mati — semua tajam, sesuai tabel DOF trial
	return <primitive object={world.root} dispose={null} />;
};

const useKit = () => {
	const [kit, setKit] = useState<Kit | null>(null);
	const [handle] = useState(() => delayRender("trial3d kit"));
	useEffect(() => {
		loadKit().then((k) => {
			setKit(k);
			continueRender(handle);
		});
	}, [handle]);
	return kit;
};

export const Trial3D: React.FC = () => {
	const kit = useKit();
	if (!kit) return null;
	return (
		<AbsoluteFill style={{ background: "#cfe3f2" }}>
			<ThreeCanvas
				width={1080}
				height={1920}
				shadows
				gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
				camera={{ fov: 40, near: 0.2, far: 1500 }}
			>
				<Inner kit={kit} />
			</ThreeCanvas>
			{/* Audio campuran 12 dtk (VO + musik mars + SFX), public/trial3d/audio/mix.wav */}
			<Audio src={staticFile("trial3d/audio/mix.wav")} />
		</AbsoluteFill>
	);
};
