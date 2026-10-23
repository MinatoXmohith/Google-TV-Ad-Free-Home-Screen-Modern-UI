# Vox-style collage video: how I debloated my Google TV

About 72 seconds at 1920×1080 and 24 fps, animated on 12s (stop-motion feel). It uses paper cut-outs,
tape, halftone, marker draw-ons and rubber stamps, all made from the real screenshots of this TV.

## Files

| Path | What it is |
|---|---|
| `TV debloat - Vox collage.aep` | After Effects project: one comp per scene (`scenes/s01`–`s10`) and `MAIN - TV debloat (Vox collage)` |
| `render/vox_tv_debloat.mp4` | The rendered video, with voiceover, sound effects and music mixed in |
| `TV debloat - Vox collage (Reel).aep`, `render/vox_tv_debloat_reel.mp4`, `premiere_sequence_reel.xml` | The Instagram Reel cut: 1080×1920, every scene re-laid out vertically, content kept inside Instagram's safe area (y 260–1480) |
| `premiere_sequence.xml` | Premiere Pro sequence: the video on V1, voiceover on A1, sound effects on A2–A3, music on A4 |
| `assets/` | Every visual element as a transparent PNG |
| `vo/` | Scratch voiceover, one file per scene (macOS voice "Aman"). Replace these with your own voice |
| `sfx/`, `music/` | Sound effects and a lo-fi music bed, synthesized here, so they're free to use |
| `scripts/` | The generators: `make_assets.py`, `make_audio.py`, `build_project.py` (writes `build_vox.jsx`), `narration.txt` |

## The story

| Scene | Narration | On screen |
|---|---|---|
| s01 | "My TV showed me an ad, before I could even open Netflix." | The stock home, marker circle on "Sponsored", SPONSORED. stamp |
| s02 | "So I took it back…" | Ransom-note title, TV icon, NO ROOT stamp |
| s03 | Step one: developer mode | Settings → About → Build, ×1…×7 counter, USB debugging ON |
| s04 | Step two: ADB over Wi-Fi | Laptop ↔ TV dashed line, IP:port, "Allow USB debugging?" dialog with OK circled |
| s05 | Step three: backup | Folder icon, backup folder name, BACKED UP stamp |
| s06 | Step four: switch off the junk | The 11 packages struck through one by one, DISABLED, NOT DELETED stamp |
| s07 | Step five: new home screen | The Figma frames, then v1 → v2 → v3 → final |
| s08 | Step six: liquid glass | Final home, control panel, greeting circled, avatar with an arrow |
| s09 | Step seven: faster and reversible | 0.5× sticker, `restore.sh` card, REVERSIBLE stamp |
| s10 | "No ads. No root. Just my TV." | Before/after, NO ADS NO ROOT JUST MY TV, mkdziner logo, GitHub URL |

## Finishing in Premiere Pro

1. **File → Import** → `premiere_sequence.xml`. It opens as the sequence "TV debloat - Vox collage".
2. The video track uses `render/vox_tv_debloat.mp4` without its audio. The voiceover, effects and music sit on their own tracks, so you can re-balance them or swap them out.
3. **Your own voice:** record each line from `scripts/narration.txt`, and replace the clips on A1 (or keep the file names `vo/s01.wav`… and relink).
4. To change the animation, use **File → Adobe Dynamic Link → Import After Effects Composition** and pick the MAIN comp, then edit it in After Effects.

## Changing things

- **Reel layout:** edit `scripts/reel_layout.py`, then run `python build_project.py reel` and `scripts/build_vox_reel.jsx` in After Effects.
- **Timing or layout:** edit the storyboard in `scripts/build_project.py`, run it, then in After Effects use **File → Scripts → Run Script File… → `scripts/build_vox.jsx`**. It builds a fresh project.
- **New voiceover lengths:** replace `vo/*.wav` and run `build_project.py` again. Scene lengths follow the voiceover.
- **Images:** edit `scripts/make_assets.py` and run it. The screenshots come from `../docs/screenshots/original/`.
