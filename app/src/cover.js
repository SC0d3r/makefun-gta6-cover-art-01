// Vice Cover Studio - the cover renderer.
// The poster is drawn at the format's native pixel size with the 2D canvas API. Every
// coordinate below is a fraction of the canvas width or height, so the same state renders
// at 1080, 1350 or 1920 pixels wide without a single hard-coded pixel layout.
import { drawFinish, drawPalms, drawSkyline } from './art.js';

export const FORMATS = {
  square: { id: 'square', label: 'Square', ratio: '1:1', width: 1080, height: 1080, file: 'vice-cover-1080x1080.png' },
  portrait: { id: 'portrait', label: 'Portrait', ratio: '4:5', width: 1080, height: 1350, file: 'vice-cover-1080x1350.png' },
  wide: { id: 'wide', label: 'Wide', ratio: '16:9', width: 1920, height: 1080, file: 'vice-cover-1920x1080.png' },
};

export const FORMAT_ORDER = ['square', 'portrait', 'wide'];

export const STYLES = {
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(135deg, #ffc46b, #ff2e8b)',
    filter: 'saturate(1.35) contrast(1.12) brightness(1.04)',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    swatch: 'linear-gradient(135deg, #ff2ea0, #2ee6ff)',
    filter: 'saturate(1.55) contrast(1.2) hue-rotate(-10deg)',
  },
  dusk: {
    id: 'dusk',
    label: 'Dusk',
    swatch: 'linear-gradient(135deg, #1d6f7c, #f0a35e)',
    filter: 'saturate(1) contrast(1.1) brightness(0.94)',
  },
};

export const STYLE_ORDER = ['sunset', 'neon', 'dusk'];

// Crop defaults per sample and panel position (left, centre, right). They are the
// starting point only: the panel sliders can move every one of them.
export const PHOTO_DEFAULTS = {
  boulevard: [
    { zoom: 1.3, x: 0.08, y: 0.45 },
    { zoom: 1.05, x: 0.5, y: 0.12 },
    { zoom: 1.35, x: 0.95, y: 0.3 },
  ],
  pier: [
    { zoom: 1.22, x: 0.36, y: 0.48 },
    { zoom: 1.0, x: 0.5, y: 0.5 },
    { zoom: 1.22, x: 0.64, y: 0.44 },
  ],
};

export const PANEL_NAMES = ['Left', 'Center', 'Right'];
export const CREAM = '#f6ecd8';
const TITLE_STACK = '"Arial Black", "Liberation Sans", "DejaVu Sans", sans-serif';
const UI_STACK = 'ui-sans-serif, "Helvetica Neue", Arial, sans-serif';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** The whole poster geometry, derived from the pixel size alone. */
function layoutFor(W, H) {
  const landscape = W / H > 1.15;
  const marginX = W * (landscape ? 0.045 : 0.05);
  const top = H * 0.05;
  const bottom = H * 0.78;
  const gutter = W * 0.013;
  const border = Math.max(4, W * 0.007);
  const usable = W - marginX * 2 - gutter * 2;
  const fractions = [0.27, 0.46, 0.27];
  const panels = [];
  let x = marginX;
  for (const fraction of fractions) {
    const w = usable * fraction;
    panels.push({ x, y: top, w, h: bottom - top });
    x += w + gutter;
  }
  const badgeSize = Math.min(W, H) * 0.088;
  return {
    W,
    H,
    marginX,
    top,
    bottom,
    gutter,
    border,
    panels,
    bandTop: bottom,
    title: { maxOne: H * 0.28, maxTwo: H * 0.158, maxWidth: W * 0.88, baseline: H * 0.942 },
    kicker: { size: Math.max(10, H * 0.0165), baseline: H * 0.982 },
    micro: { size: Math.max(7, H * 0.009), baseline: H * 0.982 },
    badge: { size: badgeSize, x: W - marginX - badgeSize * 0.54, y: top + badgeSize * 0.5 },
  };
}

function drawBackdrop(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#170a22');
  bg.addColorStop(0.55, '#0c0714');
  bg.addColorStop(1, '#08040e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glowA = ctx.createRadialGradient(W * 0.04, H * 0.02, 0, W * 0.04, H * 0.02, Math.max(W, H) * 0.62);
  glowA.addColorStop(0, 'rgba(57,20,78,0.7)');
  glowA.addColorStop(1, 'rgba(57,20,78,0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, W, H);

  const glowB = ctx.createRadialGradient(W * 0.98, H * 0.99, 0, W * 0.98, H * 0.99, Math.max(W, H) * 0.58);
  glowB.addColorStop(0, 'rgba(76,18,38,0.55)');
  glowB.addColorStop(1, 'rgba(76,18,38,0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, W, H);
}

/** Paints the photo into a panel inside its box, honouring zoom and focal point. */
function paintPhoto(ctx, image, w, h, panel) {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) return;
  const zoom = clamp(Number(panel.zoom) || 1, 1, 2.2);
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  let dx = w / 2 - clamp(panel.x ?? 0.5, 0, 1) * dw;
  let dy = h / 2 - clamp(panel.y ?? 0.5, 0, 1) * dh;
  dx = clamp(dx, Math.min(0, w - dw), 0);
  dy = clamp(dy, Math.min(0, h - dh), 0);
  ctx.drawImage(image, dx, dy, dw, dh);
}

/** Divide-tone washes layered over each panel, per grade. */
function paintGrade(ctx, w, h, styleId) {
  if (styleId === 'sunset') {
    ctx.save();
    const warm = ctx.createLinearGradient(0, 0, 0, h);
    warm.addColorStop(0, 'rgba(255,154,74,0.44)');
    warm.addColorStop(0.55, 'rgba(255,96,70,0.16)');
    warm.addColorStop(1, 'rgba(196,17,104,0.34)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);

    const flare = ctx.createRadialGradient(w * 0.28, -h * 0.16, 0, w * 0.28, -h * 0.16, h * 0.98);
    flare.addColorStop(0, 'rgba(255,198,120,0.58)');
    flare.addColorStop(0.45, 'rgba(255,142,72,0.2)');
    flare.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = flare;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (styleId === 'neon') {
    ctx.save();
    const magenta = ctx.createLinearGradient(0, 0, w, 0);
    magenta.addColorStop(0, 'rgba(255,0,140,0.52)');
    magenta.addColorStop(0.55, 'rgba(255,0,140,0.08)');
    magenta.addColorStop(1, 'rgba(255,0,140,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = magenta;
    ctx.fillRect(0, 0, w, h);

    const cyan = ctx.createLinearGradient(w, 0, 0, 0);
    cyan.addColorStop(0, 'rgba(0,214,255,0.46)');
    cyan.addColorStop(0.5, 'rgba(0,214,255,0.1)');
    cyan.addColorStop(1, 'rgba(0,214,255,0)');
    ctx.fillStyle = cyan;
    ctx.fillRect(0, 0, w, h);

    const flare = ctx.createRadialGradient(w * 0.42, -h * 0.1, 0, w * 0.42, -h * 0.1, h * 0.95);
    flare.addColorStop(0, 'rgba(255,92,196,0.62)');
    flare.addColorStop(0.42, 'rgba(255,32,160,0.24)');
    flare.addColorStop(1, 'rgba(120,0,110,0)');
    ctx.fillStyle = flare;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else {
    ctx.save();
    const teal = ctx.createLinearGradient(0, h, 0, 0);
    teal.addColorStop(0, 'rgba(6,78,98,0.56)');
    teal.addColorStop(0.62, 'rgba(6,78,98,0.08)');
    teal.addColorStop(1, 'rgba(6,78,98,0)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = teal;
    ctx.fillRect(0, 0, w, h);

    const amber = ctx.createLinearGradient(0, 0, 0, h);
    amber.addColorStop(0, 'rgba(255,178,94,0.4)');
    amber.addColorStop(0.48, 'rgba(255,150,80,0.08)');
    amber.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = amber;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/** One panel: graded photo, bottom shade, original art, then the cream frame. */
function drawPanel(ctx, panelState, rect, layout, photos) {
  const { W, border } = layout;
  const b = border;
  const iw = Math.max(2, Math.round(rect.w - b * 2));
  const ih = Math.max(2, Math.round(rect.h - b * 2));

  const temp = document.createElement('canvas');
  temp.width = iw;
  temp.height = ih;
  const tctx = temp.getContext('2d');
  const image = photos && panelState && photos[panelState.photo];

  if (image) {
    const style = STYLES[panelState.styleId] || STYLES.sunset;
    tctx.save();
    tctx.filter = style.filter;
    paintPhoto(tctx, image, iw, ih, panelState);
    tctx.restore();
    paintGrade(tctx, iw, ih, style.id);
  } else {
    const fallback = tctx.createLinearGradient(0, 0, 0, ih);
    fallback.addColorStop(0, '#3a1a3c');
    fallback.addColorStop(1, '#160b20');
    tctx.fillStyle = fallback;
    tctx.fillRect(0, 0, iw, ih);
  }

  const shade = tctx.createLinearGradient(0, ih * 0.38, 0, ih);
  shade.addColorStop(0, 'rgba(12,5,20,0)');
  shade.addColorStop(1, 'rgba(12,5,20,0.72)');
  tctx.fillStyle = shade;
  tctx.fillRect(0, 0, iw, ih);

  const ink = 'rgba(15,6,22,0.85)';
  const index = layout.panels.indexOf(rect);
  if (index === 1) drawSkyline(tctx, iw, ih);
  drawPalms(tctx, iw, ih, index, ink);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.58)';
  ctx.shadowBlur = W * 0.016;
  ctx.shadowOffsetY = W * 0.005;
  ctx.fillStyle = CREAM;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();

  ctx.drawImage(temp, rect.x + b, rect.y + b, iw, ih);

  const edge = Math.max(2, W * 0.0011);
  ctx.strokeStyle = 'rgba(8,4,12,0.96)';
  ctx.lineWidth = edge;
  ctx.strokeRect(rect.x + edge / 2, rect.y + edge / 2, rect.w - edge, rect.h - edge);

  ctx.strokeStyle = 'rgba(10,5,16,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x + b - 0.5, rect.y + b - 0.5, iw + 1, ih + 1);
}

function drawBand(ctx, layout) {
  const { W, H, bandTop } = layout;
  const band = ctx.createLinearGradient(0, bandTop, 0, H);
  band.addColorStop(0, '#1b0b29');
  band.addColorStop(0.62, '#0d0617');
  band.addColorStop(1, '#040206');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop, W, H - bandTop);

  // A thin warm hairline separates the panel block from the title band.
  ctx.fillStyle = 'rgba(255,46,139,0.32)';
  ctx.fillRect(layout.marginX, bandTop, W - layout.marginX * 2, Math.max(1, H * 0.0012));
}

function setTitleFont(ctx, size) {
  ctx.font = `900 ${size}px ${TITLE_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.012}px`;
}

function fitTitle(ctx, lines, layout) {
  const maxWidth = layout.title.maxWidth;
  let size = lines.length === 1 ? layout.title.maxOne : layout.title.maxTwo;
  setTitleFont(ctx, size);
  let widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
  if (widest > maxWidth) size *= maxWidth / widest;
  for (let i = 0; i < 10; i += 1) {
    setTitleFont(ctx, size);
    widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest <= maxWidth) break;
    size *= 0.985;
  }
  return size;
}

function drawTitle(ctx, state, layout) {
  const W = layout.W;
  const lines = String(state.title ?? '')
    .toUpperCase()
    .split('|')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (!lines.length) return;

  const size = fitTitle(ctx, lines, layout);
  const lineGap = size * 0.84;
  const offset = size * 0.045;

  ctx.save();
  ctx.translate(W / 2, layout.title.baseline);
  ctx.transform(1, 0, -0.1, 1, 0, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.miterLimit = 2;
  setTitleFont(ctx, size);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const y = -(lines.length - 1 - i) * lineGap;
    ctx.fillStyle = '#ff2e8b';
    ctx.fillText(line, offset, y + offset);
    ctx.strokeStyle = '#0a050c';
    ctx.lineWidth = size * 0.11;
    ctx.strokeText(line, 0, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, 0, y);
  }
  ctx.restore();
}

function drawKicker(ctx, state, layout) {
  const text = String(state.kicker ?? '').toUpperCase().trim();
  if (!text) return;
  const size = layout.kicker.size;
  ctx.save();
  ctx.font = `800 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.22}px`;
  const width = ctx.measureText(text).width;
  const pad = size * 0.75;
  const top = layout.kicker.baseline - size * 1.32;
  const height = size * 1.86;
  const x = layout.marginX;

  ctx.fillStyle = 'rgba(5,2,9,0.92)';
  ctx.fillRect(x - size * 0.3, top, width + pad * 2, height);
  ctx.fillStyle = '#ff2e8b';
  ctx.fillRect(x - size * 0.3, top, Math.max(2, size * 0.17), height);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x + pad * 0.45, layout.kicker.baseline - size * 0.28);
  ctx.restore();
}

function drawMicro(ctx, layout) {
  const size = layout.micro.size;
  ctx.save();
  ctx.font = `700 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.18}px`;
  ctx.fillStyle = 'rgba(246,236,216,0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('A MAKE.FUN ORIGINAL', layout.W - layout.marginX, layout.micro.baseline);
  ctx.restore();
}

function drawBadge(ctx, layout) {
  const s = layout.badge.size;
  ctx.save();
  ctx.translate(layout.badge.x, layout.badge.y);
  ctx.rotate((-4 * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = s * 0.22;
  ctx.shadowOffsetY = s * 0.06;
  ctx.fillStyle = CREAM;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#0a050c';
  ctx.lineWidth = s * 0.085;
  ctx.strokeRect(-s / 2, -s / 2, s, s);
  ctx.fillStyle = '#0a050c';
  ctx.font = `900 ${s * 0.52}px ${TITLE_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VI', 0, s * 0.02);
  ctx.restore();
}

function drawSelection(ctx, rect, W) {
  const growth = W * 0.0035;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,46,139,0.95)';
  ctx.lineWidth = Math.max(2, W * 0.0022);
  ctx.setLineDash([W * 0.009, W * 0.006]);
  ctx.strokeRect(rect.x - growth, rect.y - growth, rect.w + growth * 2, rect.h + growth * 2);
  ctx.restore();
}

/**
 * Draws the complete cover onto `canvas`.
 * state: { format, style, title, kicker, panels: [{ photo, zoom, x, y }], photos: { key: Image } }
 * options: { width, height, selectedPanel } - selectedPanel draws the editor-only dashed
 * outline and is never passed on an export.
 */
export function drawCover(canvas, state, options = {}) {
  const fmt = FORMATS[state.format] || FORMATS.wide;
  const W = Math.round(options.width || fmt.width);
  const H = Math.round(options.height || fmt.height);
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext('2d');
  const layout = layoutFor(W, H);

  drawBackdrop(ctx, W, H);
  const styleId = STYLES[state.style] ? state.style : 'sunset';
  const panels = state.panels || [];
  layout.panels.forEach((rect, index) => {
    const panel = panels[index] || panels[0] || { zoom: 1, x: 0.5, y: 0.5 };
    drawPanel(ctx, { ...panel, styleId }, rect, layout, state.photos);
  });

  drawBand(ctx, layout);
  drawTitle(ctx, state, layout);
  drawKicker(ctx, state, layout);
  drawMicro(ctx, layout);
  drawBadge(ctx, layout);
  drawFinish(ctx, W, H);

  if (Number.isInteger(options.selectedPanel) && layout.panels[options.selectedPanel]) {
    drawSelection(ctx, layout.panels[options.selectedPanel], W);
  }
  return layout;
}

/** A fresh offscreen canvas for an export at exactly width x height. */
export function renderToCanvas(state, width, height) {
  const canvas = document.createElement('canvas');
  drawCover(canvas, state, { width, height });
  return canvas;
}
