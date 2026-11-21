# Vice Cover Studio

[![make.fun bounty badge](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun rank badge](https://make.fun/badge/gta6-cover-art-01/SC0d3r/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun reward badge](https://make.fun/badge/gta6-cover-art-01/SC0d3r/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn photos and a caption into a printed GTA-style key-art package: a hero mosaic of seven slanted panels, a sunset sky behind the gutters, a huge title across the seams, a script subtitle, cast chips, a star review strip, a tagline ribbon, a seal, a billing block and a barcode, exported as a PNG you can post.

## The cover package

Every export is composed as one designed sheet, not a photo with a caption underneath.

- **Hero mosaic.** Wide uses seven slanted quads: a dominant 38 percent hero, a split left column, and two narrow right columns split into four panels. Square uses six panels, portrait uses eight. Each panel leans 0.03 of its height, keeps a 14 px gutter and a 16 px outer frame, and shows a different sample photo where possible.
- **Sunset backdrop.** A plum to coral vertical sky, a striped sun disc, two palm silhouettes, an edge vignette, and a dark scrim under the hero's lower half. The gutters reveal the sky between panels.
- **Title lockup.** Anton uppercase in warm cream, a dark keyline, a six pixel magenta offset shadow and a 1.5 degree tilt. It crosses the hero's lower half and both side columns, never sits in a band below the art.
- **Script, ribbon and chips.** A Mr Dafoe sentence case subtitle under the title, a short cream tagline ribbon with pointed ends, and three black Bebas cast chips at the bottom left of safe panels.
- **Review strip and seal.** Five gold stars with a short italic quote and source at the lower left, plus a two ring starburst seal at the upper right.
- **Billing and barcode.** Three Bebas billing lines bottom left, a compact barcode bottom right and one tiny centred release line. There is no full width footer band.
- **Grade and print finish.** A whole-poster sunset or neon pass after the panels, then warm highlights, magenta shadows, a fine halftone and light grain.

Everything is drawn in code with the four bundled OFL fonts (Anton, Bebas Neue, Mr Dafoe and Archivo Black) and canvas shapes. The font files and their attribution live in `app/fonts/`, and the licence note is `app/fonts/FONT-LICENSES.md`. No logo, no official artwork, no copied game font and no external image assets are used.

All six sample photos in `app/samples/` were made for make.fun with an image model and are free to use inside this entry. The samples are resized and graded at draw time only; nothing is uploaded or fetched from a remote host.

## What it does

- **Any photo.** Upload or drag and drop a photo anywhere on the stage. Apply it to one panel or all panels.
- **Per-panel control.** Select any panel on the preview or with the numbered panel row, then set zoom (1.0 to 2.2), horizontal and vertical crop. The selected panel gets a light cream ring; its siblings dim by 15 percent; four haloed dots appear only while hovering or focusing. Drag a panel to reframe it.
- **Different photos per panel.** The default wide ticket runs cast-man, cast-driver, boulevard, cast-woman, pier, cast-blonde and a repeat. The sample buttons, `?photo=` and the `cast=` shot parameter all feed the same mosaic.
- **Three grades.** Sunset, Neon and Dusk, applied consistently to every panel. Every default and screenshot uses a sunset or neon direction.
- **FINISH toggle.** One switch in the rail shows or hides the cast chips, review strip, seal, ribbon, billing block and barcode, leaving the art and title lockup in place.
- **Fast export.** One PNG at the current size. `Ctrl/Cmd + E` exports the current size. "Surprise me" shuffles the grade, title and panel framing. Filenames include the title, format and exact pixels, for example `neon-tide-wide-1920x1080.png`.
- **Private and offline.** No network requests, no CDN, no analytics, no remote fonts. Photos never leave the device.

## Export sizes

| Format | Pixels | Example file |
| --- | --- | --- |
| Square 1:1 | 1080 x 1080 | `last-light-square-1080x1080.png` |
| Portrait 4:5 | 1080 x 1350 | `golden-exit-portrait-1080x1350.png` |
| Wide 16:9 | 1920 x 1080 | `neon-tide-wide-1920x1080.png` |

The canvas renders at the native size and is scaled with CSS in the editor, so the preview and the export are the same composition.

## Run it

```sh
node serve.ts
```

Open <http://localhost:8080>. There is no build step and nothing to install.

To reproduce the grader output locally:

```sh
rm -rf out && mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That writes `out/app/`, `out/screenshots/` and `out/dossier.json`.

## Privacy

Photos are decoded in the browser, drawn onto a local canvas and exported with `canvas.toBlob`. The app makes no fetch, XHR, WebSocket, font or image request after its own static files load. Nothing you add to a cover is uploaded anywhere.
