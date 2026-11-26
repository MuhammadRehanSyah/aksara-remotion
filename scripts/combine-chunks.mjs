// Gabung chunk-chunk video (h264-ts + audio AAC terpisah) jadi satu video final.
// Cetak biru resmi: remotion.dev/docs/distributed-rendering (combineChunks)
// Env: COMPOSITION (default Reels004), CHUNK_COUNT (default 10),
//      CHUNKS_DIR (default out/chunks), OUTPUT (default out/video.mp4)
import { bundle } from '@remotion/bundler';
import { combineChunks, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const compositionId = process.env.COMPOSITION || 'Reels004';
const chunkCount = Number.parseInt(process.env.CHUNK_COUNT ?? '10', 10);
const chunksDir = resolve(process.env.CHUNKS_DIR || 'out/chunks');
const output = resolve(process.env.OUTPUT || 'out/video.mp4');

const videoFiles = [];
const audioFiles = [];
for (let i = 0; i < chunkCount; i++) {
	const v = join(chunksDir, `chunk-${i}.ts`);
	const a = join(chunksDir, `chunk-${i}.aac`);
	if (!existsSync(v)) {
		throw new Error(
			`Chunk video hilang: ${v} (ditemukan ${videoFiles.length} dari ${chunkCount})`,
		);
	}
	if (!existsSync(a)) {
		throw new Error(`Chunk audio hilang: ${a}`);
	}
	videoFiles.push(v);
	audioFiles.push(a);
}
// Tolak file chunk ekstra yang tak terduga (tanda CHUNK_COUNT salah).
const chunkFiles = readdirSync(chunksDir).filter((f) => /^chunk-\d+\.(ts|aac)$/.test(f));
if (chunkFiles.length !== chunkCount * 2) {
	throw new Error(
		`Ditemukan ${chunkFiles.length} file chunk di ${chunksDir}, diharapkan ${chunkCount * 2} (CHUNK_COUNT=${chunkCount})`,
	);
}

console.log(`Menggabungkan ${chunkCount} chunk ${compositionId}...`);
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: compositionId });
const { durationInFrames, fps } = composition;
const framesPerChunk = Math.ceil(durationInFrames / chunkCount);
console.log(
	`${compositionId}: ${durationInFrames} frame @ ${fps} fps, ${framesPerChunk} frame/chunk`,
);

mkdirSync(dirname(output), { recursive: true });

let lastLogged = -25;
await combineChunks({
	outputLocation: output,
	videoFiles,
	audioFiles,
	codec: 'h264',
	audioCodec: 'aac',
	fps,
	framesPerChunk,
	preferLossless: false,
	compositionDurationInFrames: durationInFrames,
	numberOfGifLoops: null,
	logLevel: 'info',
	onProgress: ({ totalProgress }) => {
		const pct = Math.floor(totalProgress * 100);
		if (pct >= lastLogged + 25) {
			lastLogged = pct - (pct % 25);
			console.log(`Menggabungkan: ${lastLogged}%`);
		}
	},
});

console.log(`SELESAI: ${output}`);
