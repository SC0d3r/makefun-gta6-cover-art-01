// Vice Cover Studio - editor state, controls, uploads and PNG export.
// Everything runs in this page: photos are decoded into memory, drawn to canvas and
// downloaded from a blob URL. There is no network call after the static files load.
import { FORMATS, FORMAT_ORDER, PHOTO_DEFAULTS, STYLES, STYLE_ORDER, drawCover, renderToCanvas } from './cover.js';
import { runShot } from './shots.js';

const SAMPLE_PATHS = {
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
};

const SAMPLE_LABELS = { boulevard: 'Boulevard', pier: 'Pier' };

// Starting crops for a user's own photo, before they touch the sliders.
const UPLOAD_DEFAULTS = [
  { zoom: 1.15, x: 0.35, y: 0.5 },
  { zoom: 1.0, x: 0.5, y: 0.5 },
  { zoom: 1.15, x: 0.65, y: 0.5 },
];

const PRESETS = {
  hero: { format: 'wide', photo: 'boulevard', title: 'VICE CITY', kicker: 'A VICE BEACH STORY', style: 'sunset' },
  pier: { format: 'square', photo: 'pier', title: 'THE CATCH', kicker: 'A VICE BEACH STORY', style: 'neon' },
  portrait: { format: 'portrait', photo: 'boulevard', title: 'OCEAN DRIVE', kicker: 'NO RULES JUST SUNSET', style: 'dusk' },
};

const SURPRISE_TITLES = ['VICE CITY', 'OCEAN DRIVE', 'NEON HEIST', 'SUNSET RUN', 'PALM FEVER', 'GOLD COAST', 'LAST LIGHT', 'BEACH MONEY'];
const SURPRISE_KICKERS = ['A VICE BEACH STORY', 'NO RULES JUST SUNSET', 'LIVE FAST DIE PINK', 'THE CITY NEVER SLEEPS', 'SUNBURN AND FAST CARS'];

const photos = {};
const panels = [0, 1, 2].map((index) => ({ photo: 'boulevard', ...PHOTO_DEFAULTS.boulevard[index] }));

const state = {
  format: 'wide',
  style: 'sunset',
  title: 'VICE CITY',
  kicker: 'A VICE BEACH STORY',
  selected: 1,
  panels,
  photos,
};

const canvas = document.getElementById('cover');
const stage = document.getElementById('stage');
const frame = document.getElementById('frame');
let lastLayout = null;
let frameRequest = 0;
let uploadCount = 0;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function defaultFor(photoKey, index) {
  return PHOTO_DEFAULTS[photoKey] ? PHOTO_DEFAULTS[photoKey][index] : UPLOAD_DEFAULTS[index];
}

function setStatus(message) {
  const strip = document.getElementById('status');
  const card = document.getElementById('export-status');
  if (strip) strip.textContent = message;
  if (card) card.textContent = message;
}

function drawNow() {
  const inCoverShot = document.body.classList.contains('shot-cover');
  lastLayout = drawCover(canvas, state, {
    selectedPanel: inCoverShot ? undefined : state.selected,
  });
  syncFormatLabels();
}

function requestDraw() {
  if (frameRequest) return;
  frameRequest = requestAnimationFrame(() => {
    frameRequest = 0;
    drawNow();
  });
}

function syncFormatLabels() {
  const fmt = FORMATS[state.format];
  const pixels = `${fmt.width} x ${fmt.height}`;
  const stripFormat = document.getElementById('strip-format');
  const stripPixels = document.getElementById('strip-pixels');
  const exportSize = document.getElementById('export-size');
  const exportDims = document.getElementById('export-dims');
  if (stripFormat) stripFormat.textContent = `${fmt.label} ${fmt.ratio}`;
  if (stripPixels) stripPixels.textContent = `${pixels} px`;
  if (exportSize) exportSize.textContent = pixels;
  if (exportDims) exportDims.textContent = pixels;
}

function syncFormatButtons() {
  document.querySelectorAll('[data-format]').forEach((button) => {
    const active = button.dataset.format === state.format;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function syncStyleButtons() {
  document.querySelectorAll('[data-style]').forEach((button) => {
    const active = button.dataset.style === state.style;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function syncPanelButtons() {
  document.querySelectorAll('[data-panel]').forEach((button) => {
    const active = Number(button.dataset.panel) === state.selected;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const panel = state.panels[state.selected];
  const meta = document.getElementById('panel-photo');
  if (meta) {
    const label = SAMPLE_LABELS[panel.photo] || 'Your photo';
    meta.textContent = `${label} - ${['left', 'centre', 'right'][state.selected]} panel`;
  }
  const zoom = document.getElementById('zoom');
  const hx = document.getElementById('hx');
  const vy = document.getElementById('vy');
  const zoomValue = document.getElementById('zoom-value');
  const hxValue = document.getElementById('hx-value');
  const vyValue = document.getElementById('vy-value');
  if (zoom) zoom.value = String(panel.zoom);
  if (hx) hx.value = String(panel.x);
  if (vy) vy.value = String(panel.y);
  if (zoomValue) zoomValue.textContent = Number(panel.zoom).toFixed(2);
  if (hxValue) hxValue.textContent = Number(panel.x).toFixed(2);
  if (vyValue) vyValue.textContent = Number(panel.y).toFixed(2);
  for (const [input, value] of [[zoom, panel.zoom], [hx, panel.x], [vy, panel.y]]) {
    if (input) input.style.setProperty('--v', `${((Number(value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100}%`);
  }
}

function syncSampleButtons() {
  const activeKey = state.panels[state.selected] ? state.panels[state.selected].photo : null;
  document.querySelectorAll('[data-sample]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.sample === activeKey);
  });
}

function syncControls() {
  const title = document.getElementById('title');
  const kicker = document.getElementById('kicker');
  if (title) title.value = state.title;
  if (kicker) kicker.value = state.kicker;
  syncFormatButtons();
  syncFormatLabels();
  syncStyleButtons();
  syncPanelButtons();
  syncSampleButtons();
}

function selectPanel(index) {
  state.selected = Math.max(0, Math.min(2, index));
  syncPanelButtons();
  syncSampleButtons();
  requestDraw();
}

function setFormat(id) {
  if (!FORMATS[id]) return;
  state.format = id;
  syncFormatButtons();
  syncFormatLabels();
  requestDraw();
}

function setStyle(id) {
  if (!STYLES[id]) return;
  state.style = id;
  syncStyleButtons();
  requestDraw();
}

/** Applies a photo to the selected panel, or to all three when the box is ticked. */
function applyPhoto(key) {
  const all = document.getElementById('use-all');
  const targets = all && all.checked ? [0, 1, 2] : [state.selected];
  for (const index of targets) {
    state.panels[index] = { photo: key, ...defaultFor(key, index) };
  }
  syncPanelButtons();
  syncSampleButtons();
  requestDraw();
}

async function setPhotoEverywhere(key) {
  if (!photos[key] && SAMPLE_PATHS[key]) photos[key] = await loadImage(SAMPLE_PATHS[key]);
  if (!photos[key]) return;
  state.panels = [0, 1, 2].map((index) => ({ photo: key, ...defaultFor(key, index) }));
  syncPanelButtons();
  syncSampleButtons();
}

function applyPreset(id) {
  const preset = PRESETS[id];
  if (!preset) return false;
  state.format = preset.format;
  state.style = preset.style;
  state.title = preset.title;
  state.kicker = preset.kicker;
  state.panels = [0, 1, 2].map((index) => ({ photo: preset.photo, ...defaultFor(preset.photo, index) }));
  syncControls();
  return true;
}

async function addFile(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    setStatus('That file is not an image. Try a JPEG, PNG or WebP.');
    return;
  }
  try {
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);
    uploadCount += 1;
    const key = `upload-${uploadCount}`;
    photos[key] = image;
    applyPhoto(key);
    setStatus('Photo added. It never left this device.');
  } catch {
    setStatus('That photo could not be read. Try another file.');
  }
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function exportFormat(id) {
  const fmt = FORMATS[id];
  const offscreen = renderToCanvas({ ...state, format: id }, fmt.width, fmt.height);
  const blob = await new Promise((resolve) => offscreen.toBlob(resolve, 'image/png'));
  if (!blob) {
    setStatus('The browser could not save that PNG. Try again.');
    return;
  }
  downloadBlob(blob, fmt.file);
  setStatus(`Saved ${fmt.file}`);
}

async function exportCurrent() {
  await exportFormat(state.format);
}

async function exportAll() {
  for (const id of FORMAT_ORDER) {
    await exportFormat(id);
    await sleep(250);
  }
  setStatus('Saved vice-cover-1920x1080.png (all three sizes)');
}

function surprise() {
  const otherStyles = STYLE_ORDER.filter((id) => id !== state.style);
  state.style = otherStyles[Math.floor(Math.random() * otherStyles.length)];
  state.title = SURPRISE_TITLES[Math.floor(Math.random() * SURPRISE_TITLES.length)];
  state.kicker = SURPRISE_KICKERS[Math.floor(Math.random() * SURPRISE_KICKERS.length)];
  state.panels = state.panels.map((panel, index) => ({
    ...panel,
    zoom: Number((1.05 + Math.random() * 0.7).toFixed(2)),
    x: index === 1 ? 0.5 : Number((0.18 + Math.random() * 0.64).toFixed(2)),
    y: Number((0.18 + Math.random() * 0.64).toFixed(2)),
  }));
  const title = document.getElementById('title');
  const kicker = document.getElementById('kicker');
  if (title) title.value = state.title;
  if (kicker) kicker.value = state.kicker;
  syncStyleButtons();
  syncPanelButtons();
  frame.classList.remove('is-flash');
  void frame.offsetWidth;
  frame.classList.add('is-flash');
  requestDraw();
  setStatus('New look. Tune any panel to make it yours.');
}

function bindControls() {
  document.getElementById('title').addEventListener('input', (event) => {
    state.title = event.target.value.toUpperCase().slice(0, 22);
    event.target.value = state.title;
    requestDraw();
  });
  document.getElementById('kicker').addEventListener('input', (event) => {
    state.kicker = event.target.value.toUpperCase().slice(0, 30);
    event.target.value = state.kicker;
    requestDraw();
  });

  document.querySelectorAll('[data-sample]').forEach((button) => {
    button.addEventListener('click', () => {
      applyPhoto(button.dataset.sample);
      setStatus(`${SAMPLE_LABELS[button.dataset.sample]} in place. Drag a panel slider to reframe.`);
    });
  });

  document.getElementById('upload').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) addFile(file);
    event.target.value = '';
  });

  document.querySelectorAll('[data-style]').forEach((button) => {
    button.addEventListener('click', () => setStyle(button.dataset.style));
  });
  document.querySelectorAll('[data-panel]').forEach((button) => {
    button.addEventListener('click', () => selectPanel(Number(button.dataset.panel)));
  });
  document.querySelectorAll('[data-format]').forEach((button) => {
    button.addEventListener('click', () => {
      setFormat(button.dataset.format);
      setStatus(`${FORMATS[button.dataset.format].label} selected.`);
    });
  });

  for (const [id, field] of [['zoom', 'zoom'], ['hx', 'x'], ['vy', 'y']]) {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      const value = Number(input.value);
      state.panels[state.selected][field] = value;
      const output = document.getElementById(`${id}-value`);
      if (output) output.textContent = value.toFixed(2);
      input.style.setProperty('--v', `${((value - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100}%`);
      requestDraw();
    });
  }

  document.getElementById('reset-panel').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    state.panels[state.selected] = { photo: panel.photo, ...defaultFor(panel.photo, state.selected) };
    syncPanelButtons();
    requestDraw();
    setStatus('Panel reset.');
  });

  document.getElementById('export').addEventListener('click', exportCurrent);
  document.getElementById('export-top').addEventListener('click', exportCurrent);
  document.getElementById('export-all').addEventListener('click', exportAll);
  document.getElementById('surprise').addEventListener('click', surprise);

  canvas.addEventListener('click', (event) => {
    if (!lastLayout) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const index = lastLayout.panels.findIndex((panel) => x >= panel.x && x <= panel.x + panel.w && y >= panel.y && y <= panel.y + panel.h);
    if (index >= 0) selectPanel(index);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!lastLayout) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const inside = lastLayout.panels.some((panel) => x >= panel.x && x <= panel.x + panel.w && y >= panel.y && y <= panel.y + panel.h);
    canvas.style.cursor = inside ? 'pointer' : 'default';
  });

  for (const type of ['dragenter', 'dragover']) {
    stage.addEventListener(type, (event) => {
      event.preventDefault();
      stage.classList.add('is-drop');
    });
  }
  for (const type of ['dragleave', 'dragend']) {
    stage.addEventListener(type, () => stage.classList.remove('is-drop'));
  }
  stage.addEventListener('drop', (event) => {
    event.preventDefault();
    stage.classList.remove('is-drop');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) addFile(file);
  });
  window.addEventListener('dragover', (event) => event.preventDefault());
  window.addEventListener('drop', (event) => event.preventDefault());

  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      exportCurrent();
    }
  });
}

async function init() {
  bindControls();
  syncControls();

  const shot = new URLSearchParams(location.search).get('shot');
  try {
    const [boulevard, pier] = await Promise.all([loadImage(SAMPLE_PATHS.boulevard), loadImage(SAMPLE_PATHS.pier)]);
    photos.boulevard = boulevard;
    photos.pier = pier;
  } catch {
    setStatus('Sample photos did not load. Upload your own to begin.');
  }

  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), {
      state,
      draw: drawNow,
      sync: syncControls,
      applyPreset,
      setPhotoEverywhere,
    });
    return;
  }

  drawNow();
  setStatus('Ready - everything stays on this device.');
}

init();
