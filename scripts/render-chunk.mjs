// Render satu chunk video Remotion (untuk job matrix GitHub Actions).
// Cetak biru resmi: remotion.dev/docs/distributed-rendering
// Aturan penting dari cetak biru:
// - Semua chunk (kecuali terakhir) HARUS sama jumlah frame-nya,
//   kalau tidak audio AAC bisa cacat saat digabung.
// - Codec chunk: h264-ts (BUKAN h264); audio dipisah via separateAudioTo.
// - forSeamlessAacConcatenation: true karena chunk > 4 frame + audio AAC.
// - compositionStart = frame pertama chunk ini.
// Env: COMPOSITION (default Reels004), CHUNK_INDEX (default 0),
//      CHUNK_COUNT (default 10), CHUNKS_DIR (default out/chunks)
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const compositionId = process.env.COMPOSITION || 'Reels004';
const chunkIndex = Number.parseInt(process.env.CHUNK_INDEX ?? '0', 10);
const chunkCount = Number.parseInt(process.env.CHUNK_COUNT ?? '10', 10);
const chunksDir = resolve(process.env.CHUNKS_DIR || 'out/chunks');

if (!Number.isInteger(chunkIndex) || chunkIndex < 0 || chunkIndex >= chunkCount) {
	throw new Error(
		`CHUNK_INDEX tidak valid: ${process.env.CHUNK_INDEX} (harus 0..${chunkCount - 1})`,
	);
}

mkdirSync(chunksDir, { recursive: true });

console.log(`[chunk ${chunkIndex}/${chunkCount}] Bundling ${compositionId}...`);
const serveUrl = await bundle({ entryPoint: 'src/index.js' });
const composition = await selectComposition({ serveUrl, id: compositionId });
const { durationInFrames, fps } = composition;
console.log(
	`[chunk ${chunkIndex}/${chunkCount}] ${compositionId}: ${durationInFrames} frame @ ${fps} fps`,
);

const framesPerChunk = Math.ceil(durationInFrames / chunkCount);
const startFrame = chunkIndex * framesPerChunk;
const endFrame = Math.min(startFrame + framesPerChunk - 1, durationInFrames - 1);
console.log(
	`[chunk ${chunkIndex}/${chunkCount}] Frame ${startFrame}-${endFrame} (${endFrame - startFrame + 1} frame)`,
);

const videoPath = join(chunksDir, `chunk-${chunkIndex}.ts`);
const audioPath = join(chunksDir, `chunk-${chunkIndex}.aac`);

let lastLogged = -25;
await renderMedia({
	codec: 'h264-ts',
	composition,
	serveUrl,
	frameRange: [startFrame, endFrame],
	compositionStart: startFrame,
	outputLocation: videoPath,
	separateAudioTo: audioPath,
	audioCodec: 'aac',
	forSeamlessAacConcatenation: true,
	enforceAudioTrack: true,
	numberOfGifLoops: null,
	crf: 16,
	isProduction: false,
	overwrite: true,
	logLevel: 'info',
	onProgress: ({ progress }) => {
		const pct = Math.floor(progress * 100);
		if (pct >= lastLogged + 25) {
			lastLogged = pct - (pct % 25);
			console.log(`[chunk ${chunkIndex}/${chunkCount}] ${lastLogged}%`);
		}
	},
});

console.log(`[chunk ${chunkIndex}/${chunkCount}] SELESAI: ${videoPath} + ${audioPath}`);
