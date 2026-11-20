# Vice Cover Studio

[![make.fun bounty badge](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun rank badge](https://make.fun/badge/gta6-cover-art-01/SC0d3r/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun reward badge](https://make.fun/badge/gta6-cover-art-01/SC0d3r/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo into a printed GTA-style key-art one-sheet: a three-panel triptych, a huge title lockup over the panel seams, cast chips, a pull quote, a starburst seal, a cream footer band and a billing block, exported as a PNG you can post.

## The cover package

Every export is composed as one designed sheet, not a photo with a caption underneath.

- **Title lockup.** A cream condensed grotesque fill with a tight deep-magenta offset and a dark keyline, uppercase, at most two lines. It overlaps the lower third of the panels, spans the seams, and keeps a clear margin from every canvas edge. The editable kicker sits underneath it.
- **Cast chips.** One slanted black chip with a thin cream border per panel: THE DRIVER, THE FIXER, THE LOOKOUT.
- **Pull quote and seal.** A five-star strip with a fictional pull quote from THE VICE HERALD, plus a small 12-point gold starburst seal reading ORIGINAL / COVER in the top corner.
- **Footer band and billing block.** An edge-to-edge cream band with the tagline in dark condensed caps, a compact centred billing block, a simple barcode bottom-right and one A MAKE.FUN ORIGINAL line.
- **Print finish.** A fine halftone dot pattern plus film grain over the whole sheet, with a single crushed-black sunset grade: amber highlights, teal/violet shadows and one light direction.

Everything is drawn in code with system fonts and canvas shapes. No logo, no official artwork, no copied game font and no external image assets are used.

## What it does

- **Any photo.** Upload or drag and drop a photo anywhere on the stage. Apply it to one panel or all three.
- **Per-panel control.** Select a panel on the preview or with the LEFT / CENTRE / RIGHT control, then set zoom (1.0 to 2.2), horizontal and vertical crop. The selected panel gets a light cream ring; the two siblings dim by 15 percent; four haloed dots appear only while hovering or focusing. Drag a panel to reframe it.
- **Three deliberate beats.** The default framing is not one pose re-cropped: the left panel is a wide establishing shot, the centre is the character portrait, and the right is a lower detail that keeps the whole hand or prop in context. Each format uses the same three-beat recipe.
- **Three grades.** Sunset, Neon and Dusk, applied consistently to every panel. Every default and screenshot uses a sunset or neon direction.
- **FINISH toggle.** One switch in the rail shows or hides the cast chips, pull quote, seal, footer band and billing block, leaving the art and title lockup in place.
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
