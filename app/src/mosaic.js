// Vice Cover Studio - hero-mosaic geometry.
// Every mode is a set of slanted quads built from fractional cells. The top edge of a
// panel leans right by lean * H / 2 and its bottom edge leans left by the same amount.
// This module owns the frame, the gutters, the cover-fit maths and the crop recipe that
// places a face or a no-face detail inside each panel role.

import { SAMPLES } from './samples.js';

export const LEAN = 0.03;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Cells are written in fractions of the usable frame. `l/r/t/b` mark an internal seam, so
// half a gutter is taken from that side. `role` picks the crop recipe.
const CELLS = {
  wide: [
    { x0: 0.42, x1: 0.8, y0: 0.055, y1: 0.885, l: 1, r: 1, role: 'hero' },
    { x0: 0, x1: 0.42, y0: 0.055, y1: 0.47, r: 1, b: 1, role: 'face' },
    { x0: 0, x1: 0.42, y0: 0.47, y1: 0.885, r: 1, t: 1, role: 'detail' },
    { x0: 0.8, x1: 0.9, y0: 0.055, y1: 0.47, l: 1, r: 1, b: 1, role: 'detail' },
    { x0: 0.8, x1: 0.9, y0: 0.47, y1: 0.885, l: 1, r: 1, t: 1, role: 'detail' },
    { x0: 0.9, x1: 1, y0: 0.055, y1: 0.47, l: 1, b: 1, role: 'face' },
    { x0: 0.9, x1: 1, y0: 0.47, y1: 0.885, l: 1, t: 1, role: 'detail' },
  ],
  square: [
    { x0: 0, x1: 0.52, y0: 0.06, y1: 0.6, r: 1, role: 'hero' },
    { x0: 0.52, x1: 1, y0: 0.06, y1: 0.222, l: 1, b: 1, role: 'detail' },
    { x0: 0.52, x1: 1, y0: 0.222, y1: 0.6, l: 1, t: 1, role: 'detail' },
    { x0: 0, x1: 1 / 3, y0: 0.66, y1: 0.94, r: 1, role: 'face' },
    { x0: 1 / 3, x1: 2 / 3, y0: 0.66, y1: 0.94, l: 1, r: 1, role: 'face' },
    { x0: 2 / 3, x1: 1, y0: 0.66, y1: 0.94, l: 1, role: 'face' },
  ],
  portrait: [
    { x0: 0, x1: 0.55, y0: 0.05, y1: 0.5, r: 1, role: 'hero' },
    { x0: 0.55, x1: 1, y0: 0.05, y1: 0.275, l: 1, b: 1, role: 'face' },
    { x0: 0.55, x1: 1, y0: 0.275, y1: 0.5, l: 1, t: 1, role: 'detail' },
    { x0: 0, x1: 1 / 3, y0: 0.55, y1: 0.71, r: 1, role: 'detail' },
    { x0: 1 / 3, x1: 2 / 3, y0: 0.55, y1: 0.71, l: 1, r: 1, role: 'detail' },
    { x0: 2 / 3, x1: 1, y0: 0.55, y1: 0.71, l: 1, role: 'detail' },
    { x0: 0, x1: 0.5, y0: 0.76, y1: 0.95, r: 1, role: 'face' },
    { x0: 0.5, x1: 1, y0: 0.76, y1: 0.95, l: 1, role: 'face' },
  ],
};

export function modeFor(formatId) {
  if (formatId === 'square') return 'square';
  if (formatId === 'portrait') return 'portrait';
  return 'wide';
}

export function panelCountFor(mode) {
  return (CELLS[mode] || CELLS.wide).length;
}

/** The whole poster layout, including furniture anchors, from pixel size alone. */
export function layoutFor(W, H) {
  const ratio = W / H;
  const mode = ratio > 1.25 ? 'wide' : ratio < 0.9 ? 'portrait' : 'square';
  const margin = Math.max(10, (W * 16) / 1920);
  const gutter = Math.max(9, (W * 14) / 1920);
  const shift = (LEAN * H) / 2;
  const left = margin + shift;
  const usableW = W - (margin + shift) * 2;
  const usableH = H - margin * 2;
  const px = (f) => left + f * usableW;
  const py = (f) => margin + f * usableH;

  const panels = CELLS[mode].map((cell, index) => {
    const x0 = px(cell.x0) + (cell.l ? gutter / 2 : 0);
    const x1 = px(cell.x1) - (cell.r ? gutter / 2 : 0);
    const y0 = py(cell.y0) + (cell.t ? gutter / 2 : 0);
    const y1 = py(cell.y1) - (cell.b ? gutter / 2 : 0);
    const x = x0;
    const y = y0;
    const w = Math.max(2, x1 - x0);
    const h = Math.max(2, y1 - y0);
    return {
      index,
      role: cell.role,
      x,
      y,
      w,
      h,
      // Bounding box of the sheared quad, used by the cover-fit maths.
      bx: x - shift,
      bw: w + shift * 2,
      quad: [
        [x + shift, y],
        [x + w + shift, y],
        [x + w - shift, y + h],
        [x - shift, y + h],
      ],
    };
  });

  const baseline = H * (mode === 'wide' ? 0.7 : mode === 'square' ? 0.66 : 0.6);
  const chipH = H * 0.024;
  let chips;
  if (mode === 'portrait') {
    const left = panels[6];
    const right = panels[7];
    chips = [
      { x: left.x + W * 0.012, y: left.y + left.h - H * 0.042, w: Math.min(W * 0.1, left.w * 0.28), h: chipH, index: 6 },
      { x: left.x + W * 0.126, y: left.y + left.h - H * 0.042, w: Math.min(W * 0.1, left.w * 0.28), h: chipH, index: 6 },
      { x: right.x + W * 0.012, y: right.y + right.h - H * 0.042, w: Math.min(W * 0.1, right.w * 0.3), h: chipH, index: 7 },
    ];
  } else {
    const chipIndex = mode === 'wide' ? [2, 4, 6] : [3, 4, 5];
    const chipDrop = mode === 'wide' ? 0.05 : 0.035;
    chips = chipIndex.map((index) => {
      const panel = panels[index];
      return {
        x: panel.x + W * 0.012,
        y: panel.y + panel.h - H * chipDrop,
        w: Math.min(W * 0.1, panel.w - W * 0.02),
        h: chipH,
        index,
      };
    });
  }

  const barcodeW = W * 0.1;
  const barcodeH = H * 0.055;
  return {
    W,
    H,
    mode,
    margin,
    gutter,
    shift,
    lean: LEAN,
    panels,
    hero: panels[0],
    title: {
      cx: W / 2,
      baseline,
      zoneTop: baseline - H * (mode === 'wide' ? 0.29 : 0.26),
      maxWidth: W * 0.86,
      maxSize: H * (mode === 'wide' ? 0.34 : mode === 'square' ? 0.29 : 0.25),
    },
    script: {
      baseline: baseline + H * (mode === 'wide' ? 0.09 : mode === 'square' ? 0.085 : 0.075),
      size: H * 0.055,
    },
    ribbon: { y: H * 0.87, h: H * 0.022, maxWidth: W * 0.55 },
    seal: { x: W * 0.86, y: H * 0.17, r: W * 0.075 },
    review: { x: W * 0.055, y: H * 0.925 },
    chips,
    billing: {
      x: W * 0.055,
      baselines: [H * 0.952, H * 0.963, H * 0.974],
      size: Math.max(7, H * 0.0105),
    },
    barcode: { x: W - W * 0.055 - barcodeW, y: H * 0.955 - barcodeH, w: barcodeW, h: barcodeH },
    release: { y: H * 0.99, size: Math.max(6, H * 0.0085) },
    studio: { x: W * 0.055, y: H * 0.968, size: Math.max(7, H * 0.009) },
  };
}

/** A panel's centre crop for its role: face, hero or no-face detail. */
export function cropFor(panel, photoId) {
  const sample = SAMPLES[photoId] || {};
  const focus = sample.focus || { x: 0.5, y: 0.4 };
  if (panel.role === 'hero') {
    return { zoom: 1.02, x: focus.x, y: clamp(focus.y + 0.3, 0, 1) };
  }
  if (panel.role === 'detail') {
    const aspect = panel.w / panel.h;
    if (aspect < 0.7) {
      // Tall strip: pan sideways into empty background so no face is cut by an edge.
      const x = sample.shape === 'portrait' ? 0.04 : 0.96;
      return { zoom: 2.2, x, y: 0.72 };
    }
    return { zoom: 2.05, x: focus.x, y: 0.97 };
  }
  return { zoom: 1, x: focus.x, y: focus.y };
}

/** Cover fit inside the sheared panel's bounding box, clamped so no blank edge shows. */
export function coverFit(image, panel, crop) {
  const iw = image ? image.naturalWidth || image.width : 0;
  const ih = image ? image.naturalHeight || image.height : 0;
  if (!iw || !ih) return null;
  const zoom = clamp(Number(crop.zoom) || 1, 1, 2.4);
  const scale = Math.max(panel.bw / iw, panel.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = panel.bx + panel.bw / 2;
  const cy = panel.y + panel.h / 2;
  let dx = cx - clamp(crop.x ?? 0.5, 0, 1) * dw;
  let dy = cy - clamp(crop.y ?? 0.5, 0, 1) * dh;
  dx = dw <= panel.bw ? panel.bx + (panel.bw - dw) / 2 : clamp(dx, panel.bx + panel.bw - dw, panel.bx);
  dy = dh <= panel.h ? panel.y + (panel.h - dh) / 2 : clamp(dy, panel.y + panel.h - dh, panel.y);
  return { dx, dy, dw, dh };
}

export function quadPath(ctx, panel) {
  ctx.beginPath();
  panel.quad.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}
