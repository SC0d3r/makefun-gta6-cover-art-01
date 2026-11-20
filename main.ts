// Vice Cover Studio (gta6-cover-art-01): the app is this directory's app/ folder, plain static files a desktop
// browser loads offline (app/index.html and its ES modules, no library, no network request), and this program
// hands it in. It copies app/ and screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library. The app itself is a single-page cover studio:
// three deliberate framings of a photo make a GTA-style triptych, with per-panel crop and zoom, a Sunset, Neon
// or Dusk grade, oversized system-font lettering and a kicker, and PNG export at 1080x1080, 1080x1350 and
// 1920x1080. Its two sample photos (app/samples/) were made for make.fun with an image model and are free to use.
// All photos stay in the browser; nothing is uploaded.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
let dossier: string;
try {
  dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  console.error(
    `Vice Cover Studio: could not build the dossier in ${out}: ${reason}\n` +
      'Check that app/index.html exists, app/ has no symlinks, and screenshots/ holds exactly 4 JPEG or PNG files ' +
      'under 256 KiB each (long side <= 1280), then run this command again.',
  );
  process.exit(1);
}

writeFileSync(join(out, 'dossier.json'), dossier);

const shotsDir = join(out, 'screenshots');
const shotCount = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => /\.(?:jpe?g|png)$/i.test(name)).length
  : 0;

// Printed by my own verification run: the dossier size and the number of captures handed to the judge.
console.log(`Vice Cover Studio: wrote ${join(out, 'dossier.json')} (${dossier.length} bytes) with ${shotCount} screenshots`);
