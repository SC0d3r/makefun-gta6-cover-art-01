// Deterministic scenes for the screenshot tool.
// ?shot=cover shows the finished poster alone at the viewport size. ?shot=editor shows the
// studio with a preset state. Query keys: format, photo, title, kicker, style, preset.
// window.__shotReady flips only after the images, the fonts and two painted frames are done.
import { FORMATS, STYLES } from './cover.js';

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export async function runShot(shot, query, studio) {
  const { state, draw, sync, applyPreset, setPhotoEverywhere } = studio;

  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');

  const preset = query.get('preset');
  if (preset) applyPreset(preset);

  const format = query.get('format');
  if (format && FORMATS[format]) state.format = format;

  const photo = query.get('photo');
  if (photo) await setPhotoEverywhere(photo);

  const style = query.get('style');
  if (style && STYLES[style]) state.style = style;

  const title = query.get('title');
  if (title !== null) state.title = title.toUpperCase().slice(0, 22);
  const kicker = query.get('kicker');
  if (kicker !== null) state.kicker = kicker.toUpperCase().slice(0, 30);

  state.selected = Number(query.get('panel') ?? 1);
  sync();

  await document.fonts.ready;
  draw();
  await nextFrame();
  window.__shotReady = true;
}
