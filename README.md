# Vice Cover Studio

[![make.fun bounty badge](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun rank badge](https://make.fun/badge/gta6-cover-art-01/SC0d3r/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun reward badge](https://make.fun/badge/gta6-cover-art-01/SC0d3r/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo into a GTA 6-style cover: the three-panel poster, big lettered title and a Vice City sunset grade, exported as a PNG you can post.

## What it does

- **A real poster composition.** Three cream-framed panels, a dark aubergine title band, the VI badge, and original palm, skyline and grain art drawn by the canvas renderer. No cover image assets are used.
- **Any photo.** Upload or drag and drop a photo anywhere on the stage. Apply it to one panel or all three.
- **Per-panel control.** Select a panel on the preview or with the LEFT / CENTER / RIGHT control, then set zoom (1.0 to 2.2), horizontal and vertical crop. The selected panel gets a dashed pink outline in the editor only.
- **Three grades.** Sunset, Neon and Dusk, applied consistently to every panel with a soft top flare and a bottom shade.
- **Genre lettering.** A huge condensed uppercase title, split onto two lines with `|`, with a black stroke and a hard magenta offset shadow. Plus a kicker strip, badge and micro line.
- **Fast export.** One PNG, or all three sizes in one click. `Ctrl/Cmd + E` exports the current size. "Surprise me" shuffles the grade, title and panel zooms.
- **Private and offline.** No network requests, no CDN, no analytics, no remote fonts. Photos never leave the device.

## Export sizes

| Format | Pixels | File |
| --- | --- | --- |
| Square 1:1 | 1080 x 1080 | `vice-cover-1080x1080.png` |
| Portrait 4:5 | 1080 x 1350 | `vice-cover-1080x1350.png` |
| Wide 16:9 | 1920 x 1080 | `vice-cover-1920x1080.png` |

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
