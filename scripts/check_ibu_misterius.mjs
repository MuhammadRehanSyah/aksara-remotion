// Cek lokal IbuMisterius: 5 still (tengah tiap adegan), skala 0.5.
// Output: out/ibu-check/frame-<n>.png
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const frames = [270, 810, 1350, 1890, 2250, 2430];
const scale = Number.parseFloat(process.env.SCALE || '0.5');
const outDir = resolve('out/ibu-check');
mkdirSync(outDir, { recursive: true });

console.log('[ibu-check] Bundling...');
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: 'IbuMisterius' });
console.log(`[ibu-check] IbuMisterius: ${composition.durationInFrames} frame @ ${composition.fps} fps`);

for (const frame of frames) {
	const out = join(outDir, `frame-${frame}.png`);
	const t0 = Date.now();
	try {
		await renderStill({
			composition,
			serveUrl,
			frame,
			output: out,
			scale,
			overwrite: true,
			logLevel: 'error',
		});
		console.log(`[ibu-check] frame ${frame}: OK ${((Date.now() - t0) / 1000).toFixed(1)} dtk -> ${out}`);
	} catch (e) {
		console.log(`[ibu-check] frame ${frame}: GAGAL: ${e.message}`);
	}
}
console.log('[ibu-check] SELESAI');
