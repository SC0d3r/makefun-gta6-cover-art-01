// Vice Cover Studio - sample photos, crop recipes and curated caption pairs.
// Everything here is data: the renderer never depends on a particular photo, so an
// uploaded image uses the same three-part framing recipe as the samples.

export const SAMPLES = {
  boulevard: {
    id: 'boulevard',
    label: 'Boulevard',
    src: 'samples/boulevard.jpg',
    note: 'Golden hour on the boulevard',
  },
  pier: {
    id: 'pier',
    label: 'Pier',
    src: 'samples/pier.jpg',
    note: 'Last light on the fishing pier',
  },
};

export const SAMPLE_ORDER = ['boulevard', 'pier'];

// Three deliberate beats, never one pose re-cropped: a wide establishing frame, a tight
// centre portrait and a lower detail that keeps the whole hand or prop in context.
// Values are the image point held under the panel centre.
export const CROP_RECIPES = {
  boulevard: [
    { zoom: 1.0, x: 0.18, y: 0.26 },
    { zoom: 1.5, x: 0.56, y: 0.25 },
    { zoom: 1.18, x: 0.24, y: 0.72 },
  ],
  pier: [
    { zoom: 1.0, x: 0.1, y: 0.42 },
    { zoom: 1.65, x: 0.47, y: 0.25 },
    { zoom: 1.2, x: 0.78, y: 0.62 },
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
  { title: 'GOLDEN EXIT', kicker: 'THE COAST\u2019S LAST GREAT NIGHT', grade: 'neon' },
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
    photo: 'boulevard',
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
