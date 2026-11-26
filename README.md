# Aksara Remotion

Proyek video Remotion Aksara Academy — motion graphics untuk Reels, feed, dan video cerita (termasuk template 3D `cartoon_3d_short`).

## Render lokal

```bash
npm install
npx remotion render src/index.js Reels004 out/video.mp4 --codec h264 --crf 16
```

## Render di GitHub Actions

Tab **Actions** → workflow **Render video** → **Run workflow** → isi Composition ID (mis. `Reels004`) → hasil video di **Artifacts**.

Repo ini publik, jadi menit GitHub Actions-nya gratis. Rencana berikut: matrix 10 job paralel (tiap job render sebagian frame, lalu digabung).
