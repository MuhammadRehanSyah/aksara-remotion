// Cek lokal RahasiaPintuIbu: still per adegan + uji efek cermin beriak, skala 0.5.
// Output: out/rahasia-check/frame-<n>.png
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const frames = (process.env.FRAMES || '270,675,900,1260,1450,1800,2000,2250,2350,2600').split(',').map(Number);
const scale = Number.parseFloat(process.env.SCALE || '0.5');
const outDir = resolve('out/rahasia-check');
mkdirSync(outDir, { recursive: true });

console.log('[rahasia-check] Bundling...');
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: 'RahasiaPintuIbu' });
console.log(`[rahasia-check] RahasiaPintuIbu: ${composition.durationInFrames} frame @ ${composition.fps} fps`);

for (const frame of frames) {
	const out = join(outDir, `frame-${frame}.png`);
	const t0 = Date.now();
	try {
		await renderStill({ composition, serveUrl, frame, output: out, scale, overwrite: true, logLevel: 'error' });
		console.log(`[rahasia-check] frame ${frame}: OK ${((Date.now() - t0) / 1000).toFixed(1)} dtk -> ${out}`);
	} catch (e) {
		console.log(`[rahasia-check] frame ${frame}: GAGAL: ${e.message}`);
	}
}
console.log('[rahasia-check] SELESAI');
