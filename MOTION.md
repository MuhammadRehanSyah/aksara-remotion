# MOTION.md — Aksara Academy

Any AI must read this file in full before designing, generating, or animating anything for Aksara. Every colour, font, timing, and motion value comes from this file. The file sets the look, not the ambition. When Muhammad says go all out, go all out. If something asked for is not covered here, ask rather than choosing for yourself. When finished, check your own frames against MOTION.md, fix what fails, and only then show Muhammad.

## 1. Colours (hex, and what each is for)
- #0A3B2E dark green — main background, titles on light
- #06231B darker green — alternate dark background
- #17A673 green — primary action, check circles, highlights
- #0E6B4A deep green — table headers, dark cards
- #FFD23F yellow — accent, CTA buttons, progress bar, key words
- #EAF6EF light green — light background
- #FFFFFF white — text on dark, card backgrounds
- #10231C ink — text on light
- #9DC3B4 muted green — secondary text on dark

## 2. Fonts and type sizes
- Poppins, bundled locally (never fetch Google Fonts at render time).
- Headlines 80–96px bold (800), section titles 60–66px bold, body 38–46px, captions 36–42px. Vertical video 1080x1920, 30 fps.

## 3. Timing: how things come in, how long they hold, and how they leave
- UI feedback: button press 100–160ms, tooltips 125–200ms, modals 200–500ms (Emil rules).
- Video scenes: a visual change at least every ~3 seconds; no frame feels static. Scene lengths follow the narration audio + 0.3s tail per scene.
- Entrances 30–50% longer than exits. Stagger 30–80ms for UI, 50–100ms per card in video, total stagger under 500ms.
- LottieFiles personality for Aksara: Corporate base (200–400ms, cubic-bezier(0.2,0,0,1), 0–3% overshoot) with Energetic moments for hooks and CTAs (100–250ms, ease-out-expo, 15–30% overshoot). Default Corporate for UI, Energetic for the hook and closing CTA.

## 4. How things move: frame rate, easing, and anything handmade
- 30 fps, 1080x1920 vertical for Reels. Match composition fps to source clip fps to avoid resampling judder.
- Easing: entering/exiting = ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; moving/morphing = ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)`; hover/colour = ease; constant motion = linear. Never ease-in for UI entrances.
- Alternate zoom in and zoom out between scenes; vary pan direction per scene. Give each different transition its own distinct sound effect.
- Three motion layers in every scene: primary (the action the viewer follows), secondary (shadows, icons shifting, highlights), ambient (progress bar, subtle pulses). Flat animation is a failure.
- Motion on twos for anything handmade in feel (hold each pose for 2 frames at 24fps equivalent).
- First 3 seconds carry the hook. If the first frame is empty, cut it.

## 5. Texture and finish
- Clean flat motion graphics, rounded cards (28–36px radius), soft shadows, yellow progress bar at the bottom. No glow, no gradients on text, no bounce as a default.
- Voice-over: Indonesian male (vg_id_m41), normalised to -15.2 LUFS. Narration verified by transcription before assembly.

## 6. Five things motion must never do
1. Never a still-image slideshow as a video — every scene must visibly move.
2. Never typewriter text, glow, bounce, or gradients on text.
3. Never purple-to-blue backgrounds.
4. Never scale(0) entrances — start from scale(0.95) + opacity 0.
5. Never animate width/height/margin/padding/top/left — use transform/opacity only.
6. Never invent a fact, price, date, or number on screen — every on-screen value comes from a list Muhammad approved.

## 7. One example, described shot by shot, of it done right
Reels #002 (XLOOKUP, 62.9s): Scene 1, a long Excel table scrolls fast while the hook text pops in line by line, then a yellow "ADA CARA 5 DETIK!" pill pulses. Scene 4, the formula types itself letter by letter, the Nama and Harga columns light up yellow as named, and "Andi → Rp 250.000" pops with a spring. Scene 5, the fill handle drags down and result cells pop in one by one. Scene 6, a green check springs in, "SELESAI DALAM 5 DETIK!" lands, and VLOOKUP vs XLOOKUP pills pulse alternately as the comment CTA. Every scene changes visually every ~3 seconds; the yellow progress bar runs along the bottom throughout.
