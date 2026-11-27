// Cek lokal RahasiaPintuIbuStoryboard: still per shot (12 frame acuan), skala 0.5.
// Output: out/rahasia-storyboard-check/frame-<n>.png
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const frames = (process.env.FRAMES || '90,400,630,810,990,1230,1350,1520,1750,2020,2300,2560').split(',').map(Number);
const scale = Number.parseFloat(process.env.SCALE || '0.5');
const outDir = resolve('out/rahasia-storyboard-check');
mkdirSync(outDir, { recursive: true });

console.log('[rahasia-sb-check] Bundling...');
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: 'RahasiaPintuIbuStoryboard' });
console.log(`[rahasia-sb-check] RahasiaPintuIbuStoryboard: ${composition.durationInFrames} frame @ ${composition.fps} fps`);

for (const frame of frames) {
	const out = join(outDir, `frame-${frame}.png`);
	const t0 = Date.now();
	try {
		await renderStill({ composition, serveUrl, frame, output: out, scale, overwrite: true, logLevel: 'error' });
		console.log(`[rahasia-sb-check] frame ${frame}: OK ${((Date.now() - t0) / 1000).toFixed(1)} dtk -> ${out}`);
	} catch (e) {
		console.log(`[rahasia-sb-check] frame ${frame}: GAGAL: ${e.message}`);
	}
}
console.log('[rahasia-sb-check] SELESAI');
