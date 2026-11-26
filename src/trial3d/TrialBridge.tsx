// Trial3D — uji coba kartun 3D pertama (12 detik, satu adegan).
// Memakai template bridge (world.ts + story.ts + cast.ts + toon.ts + paint.ts + build.ts):
// kota 3D + jembatan rantai + sungai, karakter bean-head 2D (kolom berbaris + townsfolk).
//
// CATATAN 26 Nov 2026: rantai post EffectComposer dari template (InkPass + LensBlur +
// Bloom + Grade, @react-three/postprocessing) TIDAK menghasilkan gambar di lingkungan
// ini — frame keluar kosong (biru polos) bahkan dengan composer kosong tanpa efek.
// Dunia tanpa composer tampil penuh dan benar, jadi trial ini render TANPA post chain.
// Post chain perlu diselidiki terpisah sebelum dipakai di video sungguhan.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { World, loadKit } from "./world";
import { Kit } from "./build";

export const TRIAL3D_FRAMES = 360;

const Inner: React.FC<{ kit: Kit }> = ({ kit }) => {
	const f = useCurrentFrame();
	const { camera, scene } = useThree();
	const world = useMemo(() => new World(kit), [kit]);
	const target = useMemo(() => new THREE.Vector3(), []);
	target.copy(world.update(1, f, camera as THREE.PerspectiveCamera, scene));
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
