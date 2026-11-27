// Cek lokal KacaurusTrial: still per shot (4 frame acuan), skala 0.5.
// Output: out/kacaurus-trial-check/frame-<n>.png
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const frames = (process.env.FRAMES || '60,200,380,600').split(',').map(Number);
const scale = Number.parseFloat(process.env.SCALE || '0.5');
const outDir = resolve('out/kacaurus-trial-check');
mkdirSync(outDir, { recursive: true });

console.log('[kacaurus-check] Bundling...');
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: 'KacaurusTrial' });
console.log(`[kacaurus-check] KacaurusTrial: ${composition.durationInFrames} frame @ ${composition.fps} fps`);

for (const frame of frames) {
	const out = join(outDir, `frame-${frame}.png`);
	const t0 = Date.now();
	try {
		await renderStill({ composition, serveUrl, frame, output: out, scale, overwrite: true, logLevel: 'error' });
		console.log(`[kacaurus-check] frame ${frame}: OK ${((Date.now() - t0) / 1000).toFixed(1)} dtk -> ${out}`);
	} catch (e) {
		console.log(`[kacaurus-check] frame ${frame}: GAGAL: ${e.message}`);
	}
}
console.log('[kacaurus-check] SELESAI');
