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
    note: 'Midday on the fishing pier',
  },
};

export const SAMPLE_ORDER = ['boulevard', 'pier'];

// Three deliberate framings, not three copies: an establishing shot, a tight portrait
// and a foreground detail. Values are the image point held under the panel centre.
export const CROP_RECIPES = {
  boulevard: [
    { zoom: 1.0, x: 0.22, y: 0.12 },
    { zoom: 1.55, x: 0.53, y: 0.36 },
    { zoom: 1.85, x: 0.13, y: 0.8 },
  ],
  pier: [
    { zoom: 1.0, x: 0.18, y: 0.3 },
    { zoom: 1.7, x: 0.46, y: 0.36 },
    { zoom: 1.95, x: 0.88, y: 0.68 },
  ],
};

// A neutral but still distinct recipe for a photo the studio has never seen.
export const UPLOAD_RECIPE = [
  { zoom: 1.04, x: 0.32, y: 0.24 },
  { zoom: 1.4, x: 0.5, y: 0.4 },
  { zoom: 1.7, x: 0.68, y: 0.72 },
];

export const CAPTION_TITLE_MAX = 24;
export const CAPTION_KICKER_MAX = 36;

export const LOOKS = [
  { title: 'VICE CITY', kicker: 'A VICE BEACH STORY', grade: 'sunset' },
  { title: 'OCEAN DRIVE', kicker: 'NO RULES JUST SUNSET', grade: 'dusk' },
  { title: 'NEON HEIST', kicker: 'THE CITY NEVER SLEEPS', grade: 'neon' },
  { title: 'SUNSET RUN', kicker: 'LIVE FAST DIE PINK', grade: 'sunset' },
  { title: 'LAST LIGHT', kicker: 'SUNBURN AND FAST CARS', grade: 'dusk' },
  { title: 'GOLD COAST', kicker: 'TROUBLE IN PARADISE', grade: 'sunset' },
  { title: 'PALM FEVER', kicker: 'A VICE BEACH STORY', grade: 'neon' },
  { title: 'NIGHT SHIFT', kicker: 'MIAMI AFTER MIDNIGHT', grade: 'neon' },
];

// Named looks used by the editor's presets and by deterministic screenshot recipes.
export const PRESETS = {
  hero: {
    format: 'wide',
    photo: 'boulevard',
    grade: 'sunset',
    title: 'VICE CITY',
    kicker: 'A VICE BEACH STORY',
  },
  pier: {
    format: 'square',
    photo: 'pier',
    grade: 'neon',
    title: 'THE CATCH',
    kicker: 'A VICE BEACH STORY',
  },
  portrait: {
    format: 'portrait',
    photo: 'boulevard',
    grade: 'dusk',
    title: 'OCEAN DRIVE',
    kicker: 'NO RULES JUST SUNSET',
  },
};

export function recipeFor(photoId) {
  return CROP_RECIPES[photoId] || UPLOAD_RECIPE;
}
