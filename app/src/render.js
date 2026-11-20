// Vice Cover Studio - the cover renderer.
// One proportional layout serves the editor preview and every export size. The art is a
// three-panel triptych: the photo is cropped differently in each panel, graded, then the
// poster is finished with a vignette and a light film grain. All lettering is drawn with
// fonts already on the machine; no font file, logo or official artwork is loaded.

export const FORMATS = {
  square: {
    id: 'square',
    label: 'Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    file: 'vice-cover-square.png',
  },
  portrait: {
    id: 'portrait',
    label: 'Portrait',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    file: 'vice-cover-portrait.png',
  },
  wide: {
    id: 'wide',
    label: 'Wide',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    file: 'vice-cover-wide.png',
  },
};

export const FORMAT_ORDER = ['square', 'portrait', 'wide'];

export const GRADES = {
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(135deg, #ffc46b, #ff3d8d)',
    filter: 'saturate(1.2) contrast(1.06) brightness(1.02)',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    swatch: 'linear-gradient(135deg, #ff3d9a, #36e0ff)',
    filter: 'saturate(1.26) contrast(1.08) brightness(1.0)',
  },
  dusk: {
    id: 'dusk',
    label: 'Dusk',
    swatch: 'linear-gradient(135deg, #1f7886, #f0a35e)',
    filter: 'saturate(1.08) contrast(1.07) brightness(0.95)',
  },
};

export const GRADE_ORDER = ['sunset', 'neon', 'dusk'];

export const PANEL_LABELS = ['LEFT', 'CENTRE', 'RIGHT'];

export const CREAM = '#f4e7d2';
const INK = '#0a0611';
const PINK = '#ff3d8d';
const TITLE_STACK = 'Impact, Haettenschweiler, "Arial Narrow", "Liberation Sans Narrow", "DejaVu Sans", sans-serif';
const UI_STACK = '"Helvetica Neue", "Segoe UI", Roboto, Arial, "Liberation Sans", sans-serif';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The whole poster geometry, derived from the pixel size alone. */
function layoutFor(W, H) {
  const ratio = W / H;
  const wide = ratio > 1.25;
  const portrait = ratio < 0.9;
  const marginX = W * (wide ? 0.042 : 0.05);
  const gutter = W * (wide ? 0.0115 : 0.014);
  const panelW = (W - marginX * 2 - gutter * 2) / 3;
  const top = H * (wide ? 0.045 : portrait ? 0.035 : 0.04);
  const sideTop = H * (portrait ? 0.1 : wide ? 0.045 : 0.04);
  const bottom = H * (wide ? 0.615 : portrait ? 0.745 : 0.69);

  const panels = [];
  for (let index = 0; index < 3; index += 1) {
    const y = portrait && index !== 1 ? sideTop : top;
    panels.push({
      x: marginX + index * (panelW + gutter),
      y,
      w: panelW,
      h: bottom - y,
    });
  }

  const studioSize = clamp(W * 0.0138, 12, 28);
  const kickerSize = clamp(W * 0.021, 17, 42);
  const studioBaseline = H * 0.977;
  const titleBaseline = studioBaseline - studioSize * 1.7;

  return {
    W,
    H,
    mode: wide ? 'wide' : portrait ? 'portrait' : 'square',
    marginX,
    gutter,
    border: clamp(W * 0.0055, 3.5, 14),
    panels,
    bandTop: bottom,
    title: {
      baseline: titleBaseline,
      maxWidth: W - marginX * 1.2,
      maxSize: W * 0.44,
    },
    kicker: { size: kickerSize, baseline: bottom + H * 0.048 },
    studio: { size: studioSize, baseline: studioBaseline },
  };
}

function drawBackdrop(ctx, W, H) {
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#170c24');
  base.addColorStop(0.52, '#0d0715');
  base.addColorStop(1, '#07040b');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const plum = ctx.createRadialGradient(W * 0.12, H * 0.04, 0, W * 0.12, H * 0.04, Math.max(W, H) * 0.6);
  plum.addColorStop(0, 'rgba(89, 27, 101, 0.42)');
  plum.addColorStop(0.55, 'rgba(58, 18, 72, 0.16)');
  plum.addColorStop(1, 'rgba(58, 18, 72, 0)');
  ctx.fillStyle = plum;
  ctx.fillRect(0, 0, W, H);

  const teal = ctx.createRadialGradient(W * 0.94, H * 0.12, 0, W * 0.94, H * 0.12, Math.max(W, H) * 0.45);
  teal.addColorStop(0, 'rgba(18, 94, 101, 0.2)');
  teal.addColorStop(1, 'rgba(18, 94, 101, 0)');
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, W, H);

  const rose = ctx.createRadialGradient(W * 0.52, H * 0.9, 0, W * 0.52, H * 0.9, W * 0.48);
  rose.addColorStop(0, 'rgba(112, 24, 66, 0.2)');
  rose.addColorStop(1, 'rgba(112, 24, 66, 0)');
  ctx.fillStyle = rose;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawPanelFrame(ctx, rect, W) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.58)';
  ctx.shadowBlur = W * 0.013;
  ctx.shadowOffsetY = W * 0.0045;
  ctx.fillStyle = CREAM;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();

  const edge = Math.max(1, W * 0.0012);
  ctx.strokeStyle = 'rgba(7, 3, 11, 0.92)';
  ctx.lineWidth = edge;
  ctx.strokeRect(rect.x + edge / 2, rect.y + edge / 2, rect.w - edge, rect.h - edge);
}

function paintPhoto(ctx, image, inner, panel) {
  if (!image) {
    const fallback = ctx.createLinearGradient(inner.x, inner.y, inner.x, inner.y + inner.h);
    fallback.addColorStop(0, '#6d3552');
    fallback.addColorStop(0.52, '#c06b58');
    fallback.addColorStop(0.7, '#22394a');
    fallback.addColorStop(1, '#0d1119');
    ctx.fillStyle = fallback;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    return;
  }

  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) {
    const fallback = ctx.createLinearGradient(inner.x, inner.y, inner.x, inner.y + inner.h);
    fallback.addColorStop(0, '#6d3552');
    fallback.addColorStop(0.52, '#c06b58');
    fallback.addColorStop(0.7, '#22394a');
    fallback.addColorStop(1, '#0d1119');
    ctx.fillStyle = fallback;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    return;
  }

  const zoom = clamp(Number(panel.zoom) || 1, 1, 2.2);
  const scale = Math.max(inner.w / iw, inner.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  let dx = inner.x + inner.w / 2 - clamp(panel.x ?? 0.5, 0, 1) * dw;
  let dy = inner.y + inner.h / 2 - clamp(panel.y ?? 0.5, 0, 1) * dh;
  dx = dw <= inner.w ? inner.x + (inner.w - dw) / 2 : clamp(dx, inner.x + inner.w - dw, inner.x);
  dy = dh <= inner.h ? inner.y + (inner.h - dh) / 2 : clamp(dy, inner.y + inner.h - dh, inner.y);

  ctx.drawImage(image, dx, dy, dw, dh);
}

/** Warm highlights, cool shadows: a light touch that keeps skin believable. */
function paintGrade(ctx, inner, grade) {
  const { x, y, w, h } = inner;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (grade === 'neon') {
    const magenta = ctx.createLinearGradient(x, y, x + w, y);
    magenta.addColorStop(0, 'rgba(255, 24, 146, 0.37)');
    magenta.addColorStop(0.55, 'rgba(255, 24, 146, 0.05)');
    magenta.addColorStop(1, 'rgba(255, 24, 146, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = magenta;
    ctx.fillRect(x, y, w, h);

    const cyan = ctx.createLinearGradient(x + w, y, x, y);
    cyan.addColorStop(0, 'rgba(0, 219, 255, 0.33)');
    cyan.addColorStop(0.5, 'rgba(0, 219, 255, 0.04)');
    cyan.addColorStop(1, 'rgba(0, 219, 255, 0)');
    ctx.fillStyle = cyan;
    ctx.fillRect(x, y, w, h);

    const violet = ctx.createLinearGradient(0, y, 0, y + h);
    violet.addColorStop(0, 'rgba(255, 120, 210, 0.08)');
    violet.addColorStop(0.52, 'rgba(62, 29, 108, 0.08)');
    violet.addColorStop(1, 'rgba(31, 17, 74, 0.37)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = violet;
    ctx.fillRect(x, y, w, h);
  } else if (grade === 'dusk') {
    const amber = ctx.createLinearGradient(0, y, 0, y + h * 0.58);
    amber.addColorStop(0, 'rgba(255, 178, 99, 0.27)');
    amber.addColorStop(1, 'rgba(255, 178, 99, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = amber;
    ctx.fillRect(x, y, w, h);

    const teal = ctx.createLinearGradient(0, y + h * 0.3, 0, y + h);
    teal.addColorStop(0, 'rgba(8, 87, 101, 0.02)');
    teal.addColorStop(0.65, 'rgba(8, 87, 101, 0.22)');
    teal.addColorStop(1, 'rgba(9, 61, 84, 0.44)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = teal;
    ctx.fillRect(x, y, w, h);

    const lilac = ctx.createRadialGradient(x + w * 0.78, y + h * 0.24, 0, x + w * 0.78, y + h * 0.24, h * 0.7);
    lilac.addColorStop(0, 'rgba(129, 86, 176, 0.2)');
    lilac.addColorStop(1, 'rgba(129, 86, 176, 0)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = lilac;
    ctx.fillRect(x, y, w, h);
  } else {
    const warm = ctx.createLinearGradient(0, y, 0, y + h);
    warm.addColorStop(0, 'rgba(255, 180, 104, 0.29)');
    warm.addColorStop(0.54, 'rgba(255, 112, 88, 0.05)');
    warm.addColorStop(1, 'rgba(57, 28, 101, 0.35)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = warm;
    ctx.fillRect(x, y, w, h);

    const shadow = ctx.createLinearGradient(0, y + h * 0.48, 0, y + h);
    shadow.addColorStop(0, 'rgba(4, 86, 99, 0)');
    shadow.addColorStop(1, 'rgba(4, 86, 99, 0.23)');
    ctx.fillStyle = shadow;
    ctx.fillRect(x, y, w, h);

    const flare = ctx.createRadialGradient(x + w * 0.2, y - h * 0.12, 0, x + w * 0.2, y - h * 0.12, h * 1.05);
    flare.addColorStop(0, 'rgba(255, 209, 143, 0.34)');
    flare.addColorStop(0.5, 'rgba(255, 164, 99, 0.09)');
    flare.addColorStop(1, 'rgba(255, 150, 90, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = flare;
    ctx.fillRect(x, y, w, h);
  }

  const shade = ctx.createLinearGradient(0, y + h * 0.52, 0, y + h);
  shade.addColorStop(0, 'rgba(6, 3, 12, 0)');
  shade.addColorStop(1, 'rgba(6, 3, 12, 0.34)');
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);

  const vignette = ctx.createRadialGradient(x + w / 2, y + h * 0.44, Math.min(w, h) * 0.2, x + w / 2, y + h * 0.5, Math.hypot(w, h) * 0.62);
  vignette.addColorStop(0, 'rgba(5, 2, 10, 0)');
  vignette.addColorStop(0.74, 'rgba(5, 2, 10, 0.06)');
  vignette.addColorStop(1, 'rgba(5, 2, 10, 0.24)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function drawPanel(ctx, panelState, rect, layout, photos) {
  const b = layout.border;
  const inner = {
    x: rect.x + b,
    y: rect.y + b,
    w: Math.max(2, rect.w - b * 2),
    h: Math.max(2, rect.h - b * 2),
  };

  drawPanelFrame(ctx, rect, layout.W);

  ctx.save();
  ctx.beginPath();
  ctx.rect(inner.x, inner.y, inner.w, inner.h);
  ctx.clip();

  const image = panelState && photos ? photos[panelState.photo] : null;
  const grade = GRADES[panelState?.grade] ? panelState.grade : panelState?.gradeId || 'sunset';
  ctx.save();
  ctx.filter = (GRADES[grade] || GRADES.sunset).filter;
  paintPhoto(ctx, image, inner, panelState || {});
  ctx.restore();
  paintGrade(ctx, inner, (GRADES[grade] || GRADES.sunset).id);
  ctx.restore();

  const edge = Math.max(1, layout.W * 0.001);
  ctx.strokeStyle = 'rgba(7, 3, 11, 0.6)';
  ctx.lineWidth = edge;
  ctx.strokeRect(inner.x - edge / 2, inner.y - edge / 2, inner.w + edge, inner.h + edge);
}

function setTitleFont(ctx, size) {
  ctx.font = `900 ${size}px ${TITLE_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${-size * 0.012}px`;
}

function titleLines(title) {
  return String(title || '')
    .toUpperCase()
    .split('|')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function fitTitle(ctx, lines, layout) {
  if (!lines.length) return 0;
  setTitleFont(ctx, 100);
  const widest = Math.max(...lines.map((line) => ctx.measureText(line).width)) || 1;
  const widthFit = (100 * layout.title.maxWidth) / widest;

  setTitleFont(ctx, 100);
  const capRatio = (ctx.measureText('H').actualBoundingBoxAscent || 72) / 100;
  const gapRatio = 0.79;
  const available = layout.title.baseline - layout.kicker.baseline - layout.H * 0.018;
  const heightFit = available / (capRatio + gapRatio * (lines.length - 1));

  return Math.max(8, Math.min(widthFit, heightFit, layout.title.maxSize));
}

function drawTitle(ctx, state, layout) {
  const lines = titleLines(state.title);
  if (!lines.length) return;
  const size = fitTitle(ctx, lines, layout);
  const cx = layout.W / 2;
  const lineGap = size * 0.79;
  const offset = size * 0.032;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  setTitleFont(ctx, size);
  for (let index = 0; index < lines.length; index += 1) {
    const y = layout.title.baseline - (lines.length - 1 - index) * lineGap;
    ctx.fillStyle = PINK;
    ctx.fillText(lines[index], cx + offset, y + offset);
    ctx.fillStyle = '#fffaf1';
    ctx.fillText(lines[index], cx, y);
  }
  ctx.restore();
}

function drawKicker(ctx, state, layout) {
  const text = String(state.kicker || '').toUpperCase().trim();
  if (!text) return;
  const size = layout.kicker.size;
  const cx = layout.W / 2;
  const y = layout.kicker.baseline;

  ctx.save();
  ctx.font = `800 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.17}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  let drawn = size;
  const maxWidth = layout.W - layout.marginX * 2 - size * 5;
  let width = ctx.measureText(text).width;
  if (width > maxWidth) {
    drawn = Math.max(11, size * (maxWidth / width));
    ctx.font = `800 ${drawn}px ${UI_STACK}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${drawn * 0.17}px`;
    width = ctx.measureText(text).width;
  }

  const ruleW = drawn * 2.1;
  const gap = drawn * 1.05;
  const ruleH = Math.max(1.5, drawn * 0.065);
  const ruleY = y - drawn * 0.34;
  ctx.fillStyle = 'rgba(255, 61, 141, 0.82)';
  ctx.fillRect(cx - width / 2 - gap - ruleW, ruleY, ruleW, ruleH);
  ctx.fillRect(cx + width / 2 + gap, ruleY, ruleW, ruleH);

  ctx.fillStyle = CREAM;
  ctx.fillText(text, cx, y);
  ctx.restore();
}

function drawStudioLine(ctx, layout) {
  const size = layout.studio.size;
  ctx.save();
  ctx.font = `700 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.13}px`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(244, 231, 210, 0.64)';
  ctx.fillText('A MAKE.FUN ORIGINAL', layout.W - layout.marginX, layout.studio.baseline);
  ctx.restore();
}

let grainTile = null;

function seeded(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGrain() {
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(160, 160);
  const random = seeded(0x51c0ffee);
  for (let i = 0; i < data.data.length; i += 4) {
    const value = 112 + Math.floor(random() * 70);
    data.data[i] = value;
    data.data[i + 1] = value;
    data.data[i + 2] = value;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  return tile;
}

function drawFinish(ctx, W, H) {
  const vignette = ctx.createRadialGradient(
    W * 0.5,
    H * 0.45,
    Math.min(W, H) * 0.3,
    W * 0.5,
    H * 0.5,
    Math.hypot(W, H) * 0.62,
  );
  vignette.addColorStop(0, 'rgba(4, 2, 8, 0)');
  vignette.addColorStop(0.7, 'rgba(4, 2, 8, 0.1)');
  vignette.addColorStop(1, 'rgba(4, 2, 8, 0.42)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  if (!grainTile) grainTile = makeGrain();
  ctx.save();
  ctx.globalAlpha = 0.032;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawSelection(ctx, rect, W) {
  const grow = W * 0.006;
  const line = Math.max(2, W * 0.0022);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 61, 141, 0.96)';
  ctx.lineWidth = line;
  ctx.setLineDash([W * 0.009, W * 0.0056]);
  ctx.strokeRect(rect.x - grow, rect.y - grow, rect.w + grow * 2, rect.h + grow * 2);
  ctx.setLineDash([]);

  const handle = Math.max(8, W * 0.0125);
  const half = handle / 2;
  const corners = [
    [rect.x - grow, rect.y - grow],
    [rect.x + rect.w + grow, rect.y - grow],
    [rect.x - grow, rect.y + rect.h + grow],
    [rect.x + rect.w + grow, rect.y + rect.h + grow],
  ];
  for (const [x, y] of corners) {
    ctx.fillStyle = CREAM;
    ctx.fillRect(x - half, y - half, handle, handle);
    ctx.strokeStyle = PINK;
    ctx.lineWidth = Math.max(1.5, W * 0.0018);
    ctx.strokeRect(x - half, y - half, handle, handle);
  }
  ctx.restore();
}

/**
 * Draws the complete poster. `options.selected` adds the editor-only dashed selection
 * around one panel and is never passed by the exporter.
 */
export function renderCover(canvas, state, options = {}) {
  const fallback = FORMATS[state.format] || FORMATS.wide;
  const W = Math.max(2, Math.round(options.width || fallback.width));
  const H = Math.max(2, Math.round(options.height || fallback.height));
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }

  const ctx = canvas.getContext('2d');
  const layout = layoutFor(W, H);

  drawBackdrop(ctx, W, H);
  const grade = GRADES[state.grade] ? state.grade : 'sunset';
  layout.panels.forEach((rect, index) => {
    const panel = state.panels?.[index] || state.panels?.[0] || { zoom: 1, x: 0.5, y: 0.5 };
    drawPanel(ctx, { ...panel, grade }, rect, layout, state.photos || {});
  });

  drawFinish(ctx, W, H);
  drawTitle(ctx, state, layout);
  drawKicker(ctx, state, layout);
  drawStudioLine(ctx, layout);

  if (Number.isInteger(options.selected) && layout.panels[options.selected]) {
    drawSelection(ctx, layout.panels[options.selected], W);
  }
  return layout;
}

/** The preview renders at up to 1200 px on the long side; the composition is identical. */
export function previewSize(formatId, longest = 1200) {
  const format = FORMATS[formatId] || FORMATS.wide;
  const scale = Math.min(1, longest / Math.max(format.width, format.height));
  return {
    width: Math.round(format.width * scale),
    height: Math.round(format.height * scale),
  };
}

/** A native-resolution offscreen canvas for PNG export. */
export function renderExport(state, formatId) {
  const format = FORMATS[formatId] || FORMATS.wide;
  const canvas = document.createElement('canvas');
  renderCover(canvas, { ...state, format: format.id }, { width: format.width, height: format.height });
  return canvas;
}
