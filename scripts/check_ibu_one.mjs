// Cek satu frame IbuMisterius (diagnostik), skala 0.5. Frame dari env FRAME (default 1350).
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const frame = Number.parseInt(process.env.FRAME || '1350', 10);
const outDir = resolve('out/ibu-check');
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: 'IbuMisterius' });
const out = join(outDir, `frame-${frame}.png`);
await renderStill({ composition, serveUrl, frame, output: out, scale: 0.5, overwrite: true, logLevel: 'error' });
console.log(`[ibu-1f] frame ${frame}: OK -> ${out}`);
