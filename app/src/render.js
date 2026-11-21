// Vice Cover Studio - the cover renderer, build 4.
// This file is the composition layer: it asks mosaic.js for the slanted panel geometry
// and crop recipes, then calls lettering.js for the sunset backdrop, the whole-poster
// grade, the title, script, ribbon, chips, review strip, seal, billing block, barcode
// and release line. The art is a hero mosaic, not a three-panel triptych.

import { coverFit, layoutFor, modeFor, panelCountFor, quadPath, cropFor, LEAN } from './mosaic.js';
import {
  CAST_ROLES,
  drawBackdrop,
  drawBarcode,
  drawBilling,
  drawChips,
  drawFinish,
  drawGrade,
  drawHeroScrim,
  drawReleaseLine,
  drawReview,
  drawRibbon,
  drawScript,
  drawSeal,
  drawTitle,
} from './lettering.js';

export const FORMATS = {
  square: {
    id: 'square',
    label: 'Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    file: 'cover-square-1080x1080.png',
  },
  portrait: {
    id: 'portrait',
    label: 'Portrait',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    file: 'cover-portrait-1080x1350.png',
  },
  wide: {
    id: 'wide',
    label: 'Wide',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    file: 'cover-wide-1920x1080.png',
  },
};

export const FORMAT_ORDER = ['square', 'portrait', 'wide'];

export const GRADES = {
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(135deg, #ffc46b, #ff3d8d)',
    filter: 'saturate(1.08) contrast(1.12) brightness(0.95)',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    swatch: 'linear-gradient(135deg, #ff3d9a, #36e0ff)',
    filter: 'saturate(1.16) contrast(1.1) brightness(0.94)',
  },
  dusk: {
    id: 'dusk',
    label: 'Dusk',
    swatch: 'linear-gradient(135deg, #1f7886, #f0a35e)',
    filter: 'saturate(1.08) contrast(1.1) brightness(0.94)',
  },
};

export const GRADE_ORDER = ['sunset', 'neon', 'dusk'];

export const PANEL_LABELS = ['HERO', 'FACE', 'DETAIL', 'FACE', 'DETAIL', 'FACE', 'DETAIL', 'FACE'];

export { CAST_ROLES, LEAN, layoutFor, modeFor, panelCountFor, cropFor };

export const CREAM = '#f6e7cf';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function drawPanelArt(ctx, layout, panel, panelState, photos, dimmed) {
  const grade = GRADES[panelState.grade] ? panelState.grade : 'sunset';
  const image = photos ? photos[panelState.photo] : null;

  ctx.save();
  quadPath(ctx, panel);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.68)';
  ctx.shadowBlur = layout.W * 0.018;
  ctx.shadowOffsetY = layout.W * 0.006;
  ctx.fillStyle = '#160812';
  ctx.fill();
  ctx.restore();

  ctx.save();
  quadPath(ctx, panel);
  ctx.clip();

  const fit = coverFit(image, panel, panelState);
  if (fit) {
    ctx.save();
    ctx.filter = GRADES[grade].filter;
    ctx.drawImage(image, fit.dx, fit.dy, fit.dw, fit.dh);
    ctx.restore();
  } else {
    const fallback = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
    fallback.addColorStop(0, '#8c4157');
    fallback.addColorStop(0.45, '#d07a56');
    fallback.addColorStop(0.7, '#5a2140');
    fallback.addColorStop(1, '#120818');
    ctx.fillStyle = fallback;
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);
  }

  // A per-panel light so a midday pier reads as a sunset print, not a cyan postcard.
  ctx.save();
  quadPath(ctx, panel);
  ctx.clip();
  if (grade === 'neon') {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.3;
    const neon = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
    neon.addColorStop(0, '#ff2f8e');
    neon.addColorStop(1, '#00d4ff');
    ctx.fillStyle = neon;
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.22;
    const cool = ctx.createLinearGradient(0, panel.y + panel.h * 0.4, 0, panel.y + panel.h);
    cool.addColorStop(0, 'rgba(8, 16, 56, 0)');
    cool.addColorStop(1, 'rgba(8, 10, 46, 0.85)');
    ctx.fillStyle = cool;
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);
  } else {
    const warm = ctx.createLinearGradient(0, panel.y, 0, panel.y + panel.h);
    warm.addColorStop(0, 'rgba(255, 170, 82, 0.92)');
    warm.addColorStop(0.48, 'rgba(255, 92, 116, 0.72)');
    warm.addColorStop(1, 'rgba(122, 18, 100, 0.86)');
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = warm;
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);

    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.62;
    const light = ctx.createLinearGradient(0, panel.y, 0, panel.y + panel.h);
    light.addColorStop(0, 'rgba(255, 205, 140, 0.7)');
    light.addColorStop(0.5, 'rgba(255, 120, 90, 0.2)');
    light.addColorStop(1, 'rgba(112, 20, 96, 0.85)');
    ctx.fillStyle = light;
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);

    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.26;
    const shadow = ctx.createLinearGradient(0, panel.y + panel.h * 0.35, 0, panel.y + panel.h);
    shadow.addColorStop(0, 'rgba(255, 47, 142, 0)');
    shadow.addColorStop(1, 'rgba(96, 14, 86, 0.95)');
    ctx.fillStyle = shadow;
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);
  }
  ctx.restore();

  if (dimmed) {
    ctx.fillStyle = 'rgba(4, 2, 9, 0.18)';
    ctx.fillRect(panel.x - layout.shift, panel.y, panel.w + layout.shift * 2, panel.h);
  }
  ctx.restore();
}

function drawKeylines(ctx, layout) {
  const width = Math.max(1.5, layout.W * 0.00104);
  for (const panel of layout.panels) {
    ctx.save();
    ctx.shadowColor = 'rgba(7, 3, 11, 0.5)';
    ctx.shadowBlur = layout.W * 0.004;
    quadPath(ctx, panel);
    ctx.strokeStyle = 'rgba(246, 231, 207, 0.92)';
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }
}

function drawSelection(ctx, panel, W, showHandles) {
  ctx.save();
  quadPath(ctx, panel);
  ctx.strokeStyle = 'rgba(255, 246, 226, 0.98)';
  ctx.lineWidth = Math.max(1, W * 0.0016);
  ctx.stroke();

  if (showHandles) {
    const r = Math.max(2.6, W * 0.0034);
    for (const [x, y] of panel.quad) {
      ctx.beginPath();
      ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 3, 12, 0.55)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = CREAM;
      ctx.fill();
      ctx.lineWidth = Math.max(1, W * 0.001);
      ctx.strokeStyle = 'rgba(6, 3, 12, 0.8)';
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Draws the complete poster. `options.selected` adds the editor cream selection ring,
 * `options.showHandles` adds its four dots, and `state.extras` toggles the chips,
 * review strip, seal, billing block, barcode and release line.
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
  const extras = state.extras !== false;
  const grade = GRADES[state.grade] ? state.grade : 'sunset';
  const sourcePanels = state.panels || [];
  const first = sourcePanels[0] || { photo: 'cast-man', zoom: 1, x: 0.5, y: 0.4 };

  drawBackdrop(ctx, layout);

  layout.panels.forEach((panel, index) => {
    const base = sourcePanels[index] || first;
    const panelState = {
      ...base,
      grade,
      ...cropFor(panel, base.photo),
      // Keep the user's framing once a panel has been touched.
      ...(base.zoom != null ? { zoom: base.zoom } : {}),
      ...(base.x != null ? { x: base.x } : {}),
      ...(base.y != null ? { y: base.y } : {}),
    };
    drawPanelArt(
      ctx,
      layout,
      panel,
      panelState,
      state.photos || {},
      Number.isInteger(options.selected) && options.selected !== index,
    );
  });

  drawGrade(ctx, layout, grade);
  drawHeroScrim(ctx, layout);
  drawFinish(ctx, layout);
  drawKeylines(ctx, layout);

  drawTitle(ctx, state, layout);
  drawScript(ctx, state, layout);

  if (extras) {
    drawRibbon(ctx, state, layout);
    drawChips(ctx, state, layout);
    drawReview(ctx, layout);
    drawSeal(ctx, layout);
    drawBilling(ctx, state, layout);
    drawBarcode(ctx, layout);
    drawReleaseLine(ctx, layout);
  }

  if (Number.isInteger(options.selected) && layout.panels[options.selected]) {
    drawSelection(ctx, layout.panels[options.selected], W, Boolean(options.showHandles));
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
