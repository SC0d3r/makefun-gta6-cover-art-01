// Vice Cover Studio - editor state, controls, uploads, drag-to-crop and the live preview.
// Photos are decoded into memory and drawn locally; the only network requests in the app are
// its own static files and the two bundled samples.

import {
  FORMATS,
  GRADE_ORDER,
  GRADES,
  PANEL_LABELS,
  previewSize,
  renderCover,
} from './render.js';
import {
  CAPTION_KICKER_MAX,
  CAPTION_TITLE_MAX,
  LOOKS,
  PRESETS,
  SAMPLES,
  SAMPLE_ORDER,
  recipeFor,
} from './samples.js';
import { exportPng, formatBytes } from './export.js';

window.__shotReady = false;

const $ = (id) => document.getElementById(id);

const canvas = $('cover');
const stage = $('stage');
const canvasShell = $('canvas-shell');
const fileInput = $('file-input');
const exportButton = $('export-top');
const exportStatus = $('export-status');
const stageStatus = $('stage-status');

const photos = {};
let uploadSerial = 0;
let layout = null;
let frameRequest = 0;
let drag = null;
let exporting = false;

const state = {
  format: 'wide',
  grade: 'sunset',
  title: 'VICE CITY',
  kicker: 'A VICE BEACH STORY',
  selected: 1,
  panels: panelsFor('boulevard'),
  photos,
};

function panelsFor(photoId) {
  return recipeFor(photoId).map((crop) => ({ photo: photoId, ...crop }));
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function currentFormat() {
  return FORMATS[state.format] || FORMATS.wide;
}

function formatDims() {
  const format = currentFormat();
  return `${format.width} \u00d7 ${format.height}`;
}

function setStatus(message, options = {}) {
  exportStatus.textContent = message;
  exportStatus.classList.toggle('is-error', Boolean(options.error));
  if (options.stage) stageStatus.textContent = options.stage;
}

function setBusy(isBusy) {
  exporting = isBusy;
  exportButton.disabled = isBusy;
  exportButton.firstElementChild.textContent = isBusy ? 'Rendering\u2026' : 'Export PNG';
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

// ---------------------------------------------------------------- rendering

function renderNow() {
  const coverOnly = document.body.classList.contains('shot-cover');
  const format = currentFormat();
  const dims = coverOnly
    ? { width: format.width, height: format.height }
    : previewSize(state.format);

  const started = performance.now();
  layout = renderCover(canvas, state, {
    width: dims.width,
    height: dims.height,
    selected: coverOnly ? undefined : state.selected,
  });
  const elapsed = performance.now() - started;
  $('render-ms').textContent = `${Math.round(elapsed)} ms`;
}

function scheduleRender() {
  if (frameRequest) return;
  frameRequest = requestAnimationFrame(() => {
    frameRequest = 0;
    renderNow();
  });
}

// ---------------------------------------------------------------- control sync

function syncRange(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty('--fill', `${percent}%`);
}

function syncSliders() {
  const panel = state.panels[state.selected];
  const zoom = $('zoom');
  const hx = $('hx');
  const vy = $('vy');
  zoom.value = String(panel.zoom);
  hx.value = String(panel.x);
  vy.value = String(panel.y);
  $('zoom-value').textContent = Number(panel.zoom).toFixed(2);
  $('hx-value').textContent = Number(panel.x).toFixed(2);
  $('vy-value').textContent = Number(panel.y).toFixed(2);
  for (const input of [zoom, hx, vy]) syncRange(input);
}

function syncPanelMeta() {
  const panel = state.panels[state.selected];
  const label = SAMPLES[panel.photo]?.label || 'Your photo';
  $('panel-meta').textContent = `${label} \u00b7 ${['left', 'centre', 'right'][state.selected]}`;
}

function sync() {
  const title = $('title');
  const kicker = $('kicker');
  if (document.activeElement !== title) title.value = state.title;
  if (document.activeElement !== kicker) kicker.value = state.kicker;

  document.querySelectorAll('[data-sample]').forEach((button) => {
    const active = state.panels[state.selected].photo === button.dataset.sample;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.querySelectorAll('[data-grade]').forEach((button) => {
    const active = button.dataset.grade === state.grade;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.querySelectorAll('[data-panel]').forEach((button) => {
    const active = Number(button.dataset.panel) === state.selected;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.querySelectorAll('[data-format]').forEach((button) => {
    const active = button.dataset.format === state.format;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const format = currentFormat();
  $('export-dims').textContent = formatDims();
  $('stage-format').textContent = `${format.label} ${format.ratio}`;
  $('stage-pixels').textContent = formatDims();
  syncPanelMeta();
  syncSliders();
}

// ---------------------------------------------------------------- actions

function setPanel(index) {
  state.selected = clamp(Number(index) || 0, 0, 2);
  sync();
  scheduleRender();
  stageStatus.textContent = `${PANEL_LABELS[state.selected].toLowerCase()} panel \u00b7 drag to reframe`;
}

function setGrade(grade) {
  if (!GRADES[grade]) return;
  state.grade = grade;
  sync();
  scheduleRender();
  setStatus(`${GRADES[grade].label} grade applied`, { stage: 'Grade updated' });
}

function setFormat(formatId) {
  if (!FORMATS[formatId]) return;
  state.format = formatId;
  sync();
  scheduleRender();
  setStatus(`${currentFormat().label} selected \u00b7 ${formatDims()} PNG`, {
    stage: `${currentFormat().label} \u00b7 ${formatDims()}`,
  });
}

function applyPhoto(photoId) {
  const all = $('use-all').checked;
  const targets = all ? [0, 1, 2] : [state.selected];
  const recipe = recipeFor(photoId);
  for (const index of targets) {
    state.panels[index] = { photo: photoId, ...recipe[index] };
  }
  sync();
  scheduleRender();
  const label = SAMPLES[photoId]?.label || 'Your photo';
  setStatus(`${label} placed \u00b7 ${all ? 'all panels' : 'selected panel'}`, {
    stage: `${label} \u00b7 drag to reframe`,
  });
}

function resetPanel() {
  const panel = state.panels[state.selected];
  const recipe = recipeFor(panel.photo)[state.selected];
  state.panels[state.selected] = { photo: panel.photo, ...recipe };
  sync();
  scheduleRender();
  setStatus('Panel framing reset', { stage: 'Panel reset' });
}

async function addFile(file) {
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) {
    setStatus('That file is not an image. Try JPEG, PNG or WebP.', { error: true });
    return;
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    uploadSerial += 1;
    const key = `upload-${uploadSerial}`;
    photos[key] = image;
    applyPhoto(key);
    setStatus(`Photo added \u00b7 ${formatBytes(file.size)} \u00b7 stays local`, {
      stage: 'Your photo \u00b7 drag to reframe',
    });
  } catch {
    setStatus('That photo could not be read. Try another file.', { error: true });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function surprise() {
  const roll = Math.floor(Math.random() * 100);
  const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
  const grades = GRADE_ORDER.filter((grade) => grade !== state.grade);
  state.grade = grades[Math.floor(Math.random() * grades.length)] || look.grade;
  state.title = look.title;
  state.kicker = look.kicker;

  const jitter = (index) => {
    const pick = (min, max) => Number((min + Math.random() * (max - min)).toFixed(2));
    if (index === 0) return { zoom: pick(1.0, 1.12), x: pick(0.16, 0.34), y: pick(0.08, 0.24) };
    if (index === 1) return { zoom: pick(1.38, 1.62), x: pick(0.46, 0.56), y: pick(0.32, 0.44) };
    return { zoom: pick(1.66, 1.94), x: pick(0.08, 0.24), y: pick(0.68, 0.88) };
  };

  state.panels = state.panels.map((panel, index) => ({ ...panel, ...jitter(index) }));
  sync();
  scheduleRender();

  canvasShell.classList.remove('is-flash');
  void canvasShell.offsetWidth;
  canvasShell.classList.add('is-flash');

  const note = roll % 3 === 0 ? 'New look \u00b7 tune any panel to make it yours' : 'New look \u00b7 grade, title and framing shuffled';
  setStatus(note, { stage: 'Surprise applied' });
}

async function runExport() {
  if (exporting) return;
  setBusy(true);
  const format = currentFormat();
  setStatus(`Rendering ${format.width} \u00d7 ${format.height} PNG\u2026`, { stage: 'Rendering PNG' });
  try {
    const result = await exportPng(state, state.format);
    setStatus(`Saved ${result.name} \u00b7 ${formatBytes(result.bytes)} \u00b7 ${result.ms} ms`, {
      stage: `${format.label} PNG \u00b7 ${formatBytes(result.bytes)}`,
    });
  } catch (error) {
    setStatus(`Export failed: ${error.message}`, { error: true, stage: 'Export failed' });
  } finally {
    setBusy(false);
  }
}

// ---------------------------------------------------------------- pointer and drop

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function panelAt(point) {
  if (!layout) return -1;
  return layout.panels.findIndex(
    (panel) => point.x >= panel.x && point.x <= panel.x + panel.w && point.y >= panel.y && point.y <= panel.y + panel.h,
  );
}

function bindCanvas() {
  canvas.addEventListener('pointerdown', (event) => {
    const point = canvasPoint(event);
    const index = panelAt(point);
    if (index < 0) return;
    setPanel(index);
    const rect = layout.panels[index];
    drag = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      crop: { x: state.panels[index].x, y: state.panels[index].y },
      rectW: rect.w,
      rectH: rect.h,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    event.preventDefault();
  });

  canvas.addEventListener('pointermove', (event) => {
    const point = canvasPoint(event);
    if (!drag) {
      canvas.style.cursor = panelAt(point) >= 0 ? 'grab' : 'default';
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dx = (event.clientX - drag.startX) * (canvas.width / rect.width);
    const dy = (event.clientY - drag.startY) * (canvas.height / rect.height);
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;

    const panel = state.panels[drag.index];
    const zoom = Math.max(1, Number(panel.zoom) || 1);
    panel.x = clamp(drag.crop.x - (dx / drag.rectW) * (0.95 / zoom), 0, 1);
    panel.y = clamp(drag.crop.y - (dy / drag.rectH) * (0.95 / zoom), 0, 1);
    syncSliders();
    scheduleRender();
  });

  const endDrag = (event) => {
    if (!drag) return;
    if (event && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    drag = null;
    canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => {
    if (!drag) canvas.style.cursor = 'default';
  });

  for (const type of ['dragenter', 'dragover']) {
    stage.addEventListener(type, (event) => {
      event.preventDefault();
      stage.classList.add('is-drop');
    });
  }
  stage.addEventListener('dragleave', (event) => {
    if (event.relatedTarget && stage.contains(event.relatedTarget)) return;
    stage.classList.remove('is-drop');
  });
  stage.addEventListener('drop', (event) => {
    event.preventDefault();
    stage.classList.remove('is-drop');
    const file = event.dataTransfer?.files?.[0];
    if (file) addFile(file);
  });

  $('upload-btn').addEventListener('dragover', (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('is-over');
  });
  $('upload-btn').addEventListener('dragleave', (event) => event.currentTarget.classList.remove('is-over'));
  $('upload-btn').addEventListener('drop', (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('is-over');
    const file = event.dataTransfer?.files?.[0];
    if (file) addFile(file);
  });

  window.addEventListener('dragover', (event) => event.preventDefault());
  window.addEventListener('drop', (event) => event.preventDefault());
}

// ---------------------------------------------------------------- wiring

function bindControls() {
  $('title').addEventListener('input', (event) => {
    const input = event.target;
    const upper = input.value.toUpperCase();
    const caret = Math.min(input.selectionStart ?? upper.length, upper.length);
    if (input.value !== upper) {
      input.value = upper;
      input.setSelectionRange(caret, caret);
    }
    state.title = upper.slice(0, CAPTION_TITLE_MAX);
    scheduleRender();
  });

  $('kicker').addEventListener('input', (event) => {
    const input = event.target;
    const upper = input.value.toUpperCase();
    const caret = Math.min(input.selectionStart ?? upper.length, upper.length);
    if (input.value !== upper) {
      input.value = upper;
      input.setSelectionRange(caret, caret);
    }
    state.kicker = upper.slice(0, CAPTION_KICKER_MAX);
    scheduleRender();
  });

  document.querySelectorAll('[data-sample]').forEach((button) => {
    button.addEventListener('click', () => applyPhoto(button.dataset.sample));
  });

  document.querySelectorAll('[data-grade]').forEach((button) => {
    button.addEventListener('click', () => setGrade(button.dataset.grade));
  });

  document.querySelectorAll('[data-panel]').forEach((button) => {
    button.addEventListener('click', () => setPanel(Number(button.dataset.panel)));
  });

  document.querySelectorAll('[data-format]').forEach((button) => {
    button.addEventListener('click', () => setFormat(button.dataset.format));
  });

  for (const [id, field] of [['zoom', 'zoom'], ['hx', 'x'], ['vy', 'y']]) {
    const input = $(id);
    input.addEventListener('input', () => {
      const value = Number(input.value);
      state.panels[state.selected][field] = value;
      $(`${id}-value`).textContent = value.toFixed(2);
      syncRange(input);
      scheduleRender();
    });
  }

  $('reset-panel').addEventListener('click', resetPanel);
  $('surprise').addEventListener('click', surprise);
  exportButton.addEventListener('click', runExport);

  $('upload-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) addFile(file);
    event.target.value = '';
  });

  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      runExport();
    }
  });

  bindCanvas();
}

// ---------------------------------------------------------------- boot and shots

async function loadSamples() {
  const loaded = await Promise.allSettled(
    SAMPLE_ORDER.map(async (id) => {
      const image = await loadImage(SAMPLES[id].src);
      photos[id] = image;
      return id;
    }),
  );
  return loaded.filter((entry) => entry.status === 'fulfilled').length;
}

function applyPreset(id) {
  const preset = PRESETS[id];
  if (!preset) return false;
  state.format = preset.format;
  state.grade = preset.grade;
  state.title = preset.title;
  state.kicker = preset.kicker;
  state.panels = panelsFor(preset.photo);
  return true;
}

function setPhotoEverywhere(photoId) {
  if (!photos[photoId]) return;
  state.panels = panelsFor(photoId);
}

async function runShot(params) {
  const shot = params.get('shot');
  document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-editor');

  const preset = params.get('preset');
  if (preset) applyPreset(preset);

  const format = params.get('format');
  if (format && FORMATS[format]) state.format = format;

  const photo = params.get('photo');
  if (photo && photos[photo]) setPhotoEverywhere(photo);

  const style = params.get('style');
  if (style && GRADES[style]) state.grade = style;

  const title = params.get('title');
  if (title !== null) state.title = title.toUpperCase().slice(0, CAPTION_TITLE_MAX);
  const kicker = params.get('kicker');
  if (kicker !== null) state.kicker = kicker.toUpperCase().slice(0, CAPTION_KICKER_MAX);

  const panel = params.get('panel');
  if (panel !== null) state.selected = clamp(Number(panel) || 0, 0, 2);

  sync();
  await document.fonts.ready;
  renderNow();
  await nextFrame();
  renderNow();
  await nextFrame();
  window.__shotReady = true;
}

async function init() {
  bindControls();
  sync();
  renderNow(); // An immediate painted cover, even before the samples decode.

  const loaded = await loadSamples();
  if (!loaded) {
    setStatus('Sample photos did not load. Upload your own to begin.', { error: true });
  } else {
    setStatus('Ready \u00b7 photos stay on this device', { stage: 'Drag a panel to reframe' });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('shot')) {
    await runShot(params);
    return;
  }

  renderNow();
}

init();
