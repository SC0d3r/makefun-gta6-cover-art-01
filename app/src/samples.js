// Vice Cover Studio - sample photos, crop recipes and curated caption pairs.
// Everything here is data: the renderer never depends on a particular photo, so an
// uploaded image uses the same per-panel framing recipe as the samples.
//
// Each sample also carries two hints used by the mosaic layouts in mosaic.js:
// `focus` is the image point held under a face panel's centre, and `detail` is a
// no-face crop used where the title, a chip or the seal crosses the art.

export const SAMPLES = {
  'cast-man': {
    id: 'cast-man',
    shape: 'portrait',
    label: 'Cast man',
    src: 'samples/cast-man.webp',
    note: 'Red bomber jacket, overcast city doorway',
    focus: { x: 0.5, y: 0.31 },
    detail: { x: 0.52, y: 0.9, zoom: 1.95 },
  },
  'cast-driver': {
    id: 'cast-driver',
    shape: 'portrait',
    label: 'Cast driver',
    src: 'samples/cast-driver.webp',
    note: 'Neon marquee at night, black leather',
    focus: { x: 0.48, y: 0.37 },
    detail: { x: 0.52, y: 0.9, zoom: 1.95 },
  },
  boulevard: {
    id: 'boulevard',
    shape: 'portrait',
    label: 'Boulevard',
    src: 'samples/boulevard.jpg',
    note: 'Golden hour on the boulevard',
    focus: { x: 0.55, y: 0.235 },
    detail: { x: 0.3, y: 0.94, zoom: 1.95 },
  },
  'cast-woman': {
    id: 'cast-woman',
    shape: 'landscape',
    label: 'Cast woman',
    src: 'samples/cast-woman.webp',
    note: 'Warm portrait against soft garden light',
    focus: { x: 0.47, y: 0.42 },
    detail: { x: 0.88, y: 0.86, zoom: 2.1 },
  },
  pier: {
    id: 'pier',
    shape: 'square',
    label: 'Pier',
    src: 'samples/pier.jpg',
    note: 'Last light on the fishing pier',
    focus: { x: 0.43, y: 0.26 },
    detail: { x: 0.78, y: 0.88, zoom: 2.05 },
  },
  'cast-blonde': {
    id: 'cast-blonde',
    shape: 'landscape',
    label: 'Cast blonde',
    src: 'samples/cast-blonde.webp',
    note: 'City street, open sky and traffic',
    focus: { x: 0.45, y: 0.47 },
    detail: { x: 0.9, y: 0.88, zoom: 2.1 },
  },
};

export const SAMPLE_ORDER = ['cast-man', 'cast-driver', 'boulevard', 'cast-woman', 'pier', 'cast-blonde'];

// The default seven-panel wide ticket: a lead portrait, two support faces and four
// atmosphere frames. The last entry repeats when a layout needs an eighth panel.
export const DEFAULT_CAST = [
  'cast-man',
  'cast-driver',
  'boulevard',
  'cast-woman',
  'pier',
  'cast-blonde',
  'cast-driver',
];

// Three deliberate beats for the editor's per-photo button: a wide establishing frame,
// a tight centre portrait and a lower detail that keeps the whole hand or prop in context.
// Values are the image point held under the panel centre.
export const CROP_RECIPES = {
  'cast-man': [
    { zoom: 1.02, x: 0.5, y: 0.28 },
    { zoom: 1.0, x: 0.5, y: 0.31 },
    { zoom: 1.16, x: 0.52, y: 0.84 },
  ],
  'cast-driver': [
    { zoom: 1.02, x: 0.48, y: 0.33 },
    { zoom: 1.0, x: 0.48, y: 0.37 },
    { zoom: 1.18, x: 0.52, y: 0.84 },
  ],
  boulevard: [
    { zoom: 1.0, x: 0.2, y: 0.28 },
    { zoom: 1.12, x: 0.55, y: 0.235 },
    { zoom: 1.14, x: 0.3, y: 0.82 },
  ],
  'cast-woman': [
    { zoom: 1.0, x: 0.12, y: 0.44 },
    { zoom: 1.18, x: 0.47, y: 0.42 },
    { zoom: 2.05, x: 0.88, y: 0.62 },
  ],
  pier: [
    { zoom: 1.0, x: 0.14, y: 0.34 },
    { zoom: 1.22, x: 0.43, y: 0.26 },
    { zoom: 2.0, x: 0.78, y: 0.58 },
  ],
  'cast-blonde': [
    { zoom: 1.0, x: 0.08, y: 0.46 },
    { zoom: 1.2, x: 0.45, y: 0.47 },
    { zoom: 2.05, x: 0.9, y: 0.6 },
  ],
};

// A neutral but still distinct recipe for a photo the studio has never seen.
export const UPLOAD_RECIPE = [
  { zoom: 1.02, x: 0.3, y: 0.22 },
  { zoom: 1.42, x: 0.52, y: 0.3 },
  { zoom: 1.22, x: 0.7, y: 0.7 },
];

export const CAPTION_TITLE_MAX = 24;
export const CAPTION_KICKER_MAX = 36;

// Original phrases only: no real game title and no "PALM FEVER", which another studio owns.
export const LOOKS = [
  { title: 'NEON TIDE', kicker: 'ONE BEACH. ONE NIGHT.', grade: 'sunset' },
  { title: 'LAST LIGHT', kicker: 'NO RULES. JUST SUNSET.', grade: 'sunset' },
  { title: 'GOLDEN EXIT', kicker: 'NO RULES. JUST NEON.', grade: 'neon' },
  { title: 'AFTERGLOW', kicker: 'EVERY EXIT LEADS TO THE SEA', grade: 'sunset' },
  { title: 'SALT & CHROME', kicker: 'FAST CARS. SLOW SUNSETS.', grade: 'dusk' },
  { title: 'NIGHT CURRENT', kicker: 'THE CITY NEVER COOLS DOWN', grade: 'neon' },
  { title: 'LOW TIDE', kicker: 'NOTHING STAYS BURIED', grade: 'sunset' },
  { title: 'HEATWAVE', kicker: 'ONE NIGHT. NO WITNESSES.', grade: 'sunset' },
];

// Named looks used by the editor's presets and by deterministic screenshot recipes.
export const PRESETS = {
  hero: {
    format: 'wide',
    photo: 'cast-man',
    grade: 'sunset',
    title: 'NEON TIDE',
    kicker: 'ONE BEACH. ONE NIGHT.',
  },
  square: {
    format: 'square',
    photo: 'pier',
    grade: 'sunset',
    title: 'LAST LIGHT',
    kicker: 'NO RULES. JUST SUNSET.',
  },
  portrait: {
    format: 'portrait',
    photo: 'boulevard',
    grade: 'neon',
    title: 'GOLDEN EXIT',
    kicker: 'NO RULES. JUST NEON.',
  },
};

export function recipeFor(photoId) {
  return CROP_RECIPES[photoId] || UPLOAD_RECIPE;
}
