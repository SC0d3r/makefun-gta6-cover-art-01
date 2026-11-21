// Vice Cover Studio - poster lettering and furniture.
// The backdrop, sunset disc, palms, vignette, grade, title, script, ribbon, chips,
// review strip, seal, billing block, barcode and release line all live here. The
// renderer only decides what to draw and in which order.

import { quadPath } from './mosaic.js';

const CREAM = '#f6e7cf';
const INK = '#0b0512';
const GOLD = '#e9c179';
const MAGENTA = '#ff2f8e';

export const CAST_ROLES = ['THE DRIVER', 'THE FIXER', 'THE LOOKOUT', 'THE RUNNER', 'THE INSIDER'];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

function setFont(ctx, size, family, weight = 400, tracking = 0) {
  ctx.font = `${weight} ${size}px ${family}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
}

// ---------------------------------------------------------------- backdrop

function drawPalm(ctx, x, baseY, size, flip) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.fillStyle = '#2a0b28';
  ctx.strokeStyle = '#2a0b28';
  ctx.globalAlpha = 0.92;

  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.quadraticCurveTo(size * 0.05, -size * 0.38, -size * 0.02, -size * 0.76);
  ctx.lineTo(size * 0.028, -size * 0.76);
  ctx.quadraticCurveTo(size * 0.11, -size * 0.36, size * 0.035, 0);
  ctx.closePath();
  ctx.fill();

  const topX = size * 0.004;
  const topY = -size * 0.78;
  for (let i = 0; i < 7; i += 1) {
    const angle = -2.55 + i * 0.44;
    const length = size * (0.29 + (i % 3) * 0.035);
    const endX = topX + Math.cos(angle) * length;
    const endY = topY + Math.sin(angle) * length * 0.62;
    const controlX = topX + Math.cos(angle) * length * 0.52;
    const controlY = topY + Math.sin(angle) * length * 0.15;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.lineWidth = Math.max(2, size * 0.012);
    ctx.stroke();
    for (let leaf = 1; leaf <= 4; leaf += 1) {
      const t = leaf / 5;
      const px = topX + (controlX - topX) * t * 2 * (1 - t) + (endX - topX) * t * t;
      const py = topY + (controlY - topY) * t * 2 * (1 - t) + (endY - topY) * t * t;
      const side = leaf % 2 === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(angle + side * 0.9) * length * 0.18, py + Math.sin(angle + side * 0.9) * length * 0.18);
      ctx.lineWidth = Math.max(1, size * 0.007);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawBackdrop(ctx, layout) {
  const { W, H } = layout;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1b0b2e');
  sky.addColorStop(0.55, '#7a1f4d');
  sky.addColorStop(0.74, '#ff6b3d');
  sky.addColorStop(1, '#2a0b28');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const cx = W * 0.5;
  const cy = H * 0.7;
  const r = W * 0.1;

  const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2.6);
  glow.addColorStop(0, 'rgba(255, 182, 96, 0.34)');
  glow.addColorStop(0.55, 'rgba(255, 107, 61, 0.12)');
  glow.addColorStop(1, 'rgba(255, 107, 61, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const disc = ctx.createRadialGradient(cx, cy - r * 0.3, 0, cx, cy, r);
  disc.addColorStop(0, '#fff1c4');
  disc.addColorStop(0.55, '#ffc46b');
  disc.addColorStop(1, '#ff7a3f');
  ctx.fillStyle = disc;
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = 'rgba(86, 18, 66, 0.78)';
  for (let i = 0; i < 5; i += 1) {
    const y = cy - r * 0.42 + i * r * 0.27;
    ctx.fillRect(cx - r, y, r * 2, r * (0.035 + i * 0.012));
  }
  ctx.restore();

  drawPalm(ctx, W * 0.085, H * 1.015, H * 0.62, false);
  drawPalm(ctx, W * 0.94, H * 1.02, H * 0.56, true);

  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.48, Math.min(W, H) * 0.28, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.62);
  vignette.addColorStop(0, 'rgba(4, 2, 10, 0)');
  vignette.addColorStop(0.68, 'rgba(4, 2, 10, 0.1)');
  vignette.addColorStop(1, 'rgba(4, 2, 10, 0.56)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- grade

let toneCanvas = null;

function tonePass(ctx, W, H, contrast, saturation) {
  if (!toneCanvas) toneCanvas = document.createElement('canvas');
  if (toneCanvas.width !== W || toneCanvas.height !== H) {
    toneCanvas.width = W;
    toneCanvas.height = H;
  }
  const tone = toneCanvas.getContext('2d');
  tone.setTransform(1, 0, 0, 1, 0, 0);
  tone.clearRect(0, 0, W, H);
  tone.filter = `contrast(${contrast}) saturate(${saturation})`;
  tone.drawImage(ctx.canvas, 0, 0);
  tone.filter = 'none';
  ctx.save();
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(toneCanvas, 0, 0);
  ctx.restore();
}

export function drawGrade(ctx, layout, gradeId) {
  const { W, H } = layout;
  ctx.save();
  if (gradeId === 'neon') {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.35;
    const neon = ctx.createLinearGradient(0, 0, 0, H);
    neon.addColorStop(0, '#ff2f8e');
    neon.addColorStop(1, '#00d4ff');
    ctx.fillStyle = neon;
    ctx.fillRect(0, 0, W, H);
    tonePass(ctx, W, H, 1.1, 1.12);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.22;
    const cool = ctx.createLinearGradient(0, H * 0.45, 0, H);
    cool.addColorStop(0, 'rgba(10, 14, 54, 0)');
    cool.addColorStop(1, 'rgba(6, 10, 38, 0.9)');
    ctx.fillStyle = cool;
    ctx.fillRect(0, 0, W, H);
  } else if (gradeId === 'dusk') {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.4;
    const dusk = ctx.createLinearGradient(0, 0, 0, H);
    dusk.addColorStop(0, '#ffc46b');
    dusk.addColorStop(1, '#1d5b6b');
    ctx.fillStyle = dusk;
    ctx.fillRect(0, 0, W, H);
    tonePass(ctx, W, H, 1.08, 1.06);
  } else {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.55;
    const sunset = ctx.createLinearGradient(0, 0, 0, H);
    sunset.addColorStop(0, '#ff7a2f');
    sunset.addColorStop(1, '#2b0b3a');
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    tonePass(ctx, W, H, 1.12, 1.08);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.16;
    const warm = ctx.createRadialGradient(W * 0.5, H * 0.22, 0, W * 0.5, H * 0.22, W * 0.62);
    warm.addColorStop(0, '#ffbd72');
    warm.addColorStop(0.6, '#ff7a2f');
    warm.addColorStop(1, 'rgba(255, 122, 47, 0)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.18;
    const magenta = ctx.createLinearGradient(0, H * 0.5, 0, H);
    magenta.addColorStop(0, 'rgba(255, 47, 142, 0)');
    magenta.addColorStop(1, 'rgba(86, 12, 72, 0.9)');
    ctx.fillStyle = magenta;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

export function drawHeroScrim(ctx, layout) {
  const { H } = layout;
  ctx.save();
  quadPath(ctx, layout.hero);
  ctx.clip();
  const scrim = ctx.createLinearGradient(0, H * 0.52, 0, H * 0.86);
  scrim.addColorStop(0, 'rgba(8, 3, 16, 0)');
  scrim.addColorStop(1, 'rgba(8, 3, 16, 0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.5, layout.W, H * 0.38);
  ctx.restore();
}

// ---------------------------------------------------------------- print finish

let grainTile = null;
let halftoneTile = null;

function makeGrain() {
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(160, 160);
  const random = seeded(0x51c0ffee);
  for (let i = 0; i < data.data.length; i += 4) {
    const value = 110 + Math.floor(random() * 74);
    data.data[i] = value;
    data.data[i + 1] = value;
    data.data[i + 2] = value;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  return tile;
}

function makeHalftone() {
  const tile = document.createElement('canvas');
  tile.width = 7;
  tile.height = 7;
  const tctx = tile.getContext('2d');
  tctx.fillStyle = 'rgba(255, 250, 240, 0.6)';
  tctx.beginPath();
  tctx.arc(3.5, 3.5, 0.9, 0, Math.PI * 2);
  tctx.fill();
  return tile;
}

export function drawFinish(ctx, layout) {
  const { W, H } = layout;
  if (!halftoneTile) halftoneTile = makeHalftone();
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(halftoneTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  if (!grainTile) grainTile = makeGrain();
  ctx.save();
  ctx.globalAlpha = 0.026;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------------------------------------------------------------- title and script

function titleLines(title) {
  return String(title || '')
    .toUpperCase()
    .split('|')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function setTitleFont(ctx, size) {
  setFont(ctx, size, '"Anton", Impact, "Arial Narrow", sans-serif', 400, -size * 0.012);
}

function fitTitle(ctx, lines, layout) {
  if (!lines.length) return 0;
  setTitleFont(ctx, 100);
  const widest = Math.max(...lines.map((line) => ctx.measureText(line).width)) || 1;
  const widthFit = (100 * layout.title.maxWidth) / widest;
  const capRatio = (ctx.measureText('H').actualBoundingBoxAscent || 72) / 100;
  const gapRatio = 0.82;
  const available = layout.title.baseline - layout.title.zoneTop;
  const heightFit = available / (capRatio + gapRatio * (lines.length - 1));
  return Math.max(16, Math.min(widthFit, heightFit, layout.title.maxSize));
}

export function drawTitle(ctx, state, layout) {
  const lines = titleLines(state.title);
  if (!lines.length) return;
  const size = fitTitle(ctx, lines, layout);
  const gap = size * 0.82;
  const outline = layout.W >= 1400 ? 9 : 8;
  const offset = Math.max(4, Math.min(7, layout.W * 0.0032));

  ctx.save();
  ctx.translate(layout.title.cx, layout.title.baseline);
  ctx.rotate((-1.5 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  setTitleFont(ctx, size);

  const drawLines = (mode, dx, dy) => {
    for (let i = 0; i < lines.length; i += 1) {
      const y = -(lines.length - 1 - i) * gap + dy;
      if (mode === 'stroke') ctx.strokeText(lines[i], dx, y);
      else ctx.fillText(lines[i], dx, y);
    }
  };

  ctx.fillStyle = MAGENTA;
  drawLines('fill', offset, offset);

  ctx.strokeStyle = 'rgba(9, 4, 14, 0.96)';
  ctx.lineWidth = outline * 2;
  drawLines('stroke', 0, 0);

  ctx.fillStyle = CREAM;
  drawLines('fill', 0, 0);
  ctx.restore();
}

function firstClause(kicker) {
  const raw = String(kicker || '').split(/[.!?]/)[0].trim();
  if (!raw) return 'One last summer';
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function drawScript(ctx, state, layout) {
  const text = firstClause(state.kicker);
  const size = layout.script.size;
  ctx.save();
  ctx.translate(layout.W / 2, layout.script.baseline);
  ctx.rotate((-5 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, size, '"Mr Dafoe", cursive', 400, 0);
  ctx.fillStyle = 'rgba(9, 4, 14, 0.5)';
  ctx.fillText(text, size * 0.035, size * 0.04);
  ctx.fillStyle = '#ffd9a8';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- furniture

export function drawRibbon(ctx, state, layout) {
  const { y, h, maxWidth } = layout.ribbon;
  const text = String(state.kicker || 'ONE BEACH. ONE NIGHT.').toUpperCase().trim();
  if (!text) return;
  let size = h * 0.66;
  setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.12);
  let textW = ctx.measureText(text).width;
  const room = maxWidth - h * 2.6;
  if (textW > room) {
    size *= room / textW;
    setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.12);
    textW = ctx.measureText(text).width;
  }
  const barW = Math.min(maxWidth, textW + h * 2.4);
  const x = layout.W / 2 - barW / 2;
  const tip = h * 0.62;

  ctx.save();
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + barW, y - h / 2);
  ctx.lineTo(x + barW + tip, y);
  ctx.lineTo(x + barW, y + h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x - tip, y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(12, 5, 18, 0.32)';
  ctx.lineWidth = Math.max(1, h * 0.045);
  ctx.stroke();

  ctx.fillStyle = '#1a0714';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.12);
  ctx.fillText(text, layout.W / 2, y + size * 0.04);
  ctx.restore();
}

export function drawChips(ctx, state, layout) {
  const roles = CAST_ROLES;
  layout.chips.forEach((chip, index) => {
    const label = roles[index % roles.length];
    const maxW = Math.min(chip.w, layout.W * 0.1);
    let size = chip.h * 0.62;
    setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.14);
    let textW = ctx.measureText(label).width;
    const room = maxW - chip.h * 0.7;
    if (textW > room) {
      size *= room / textW;
      setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.14);
      textW = ctx.measureText(label).width;
    }
    const w = Math.min(maxW, textW + chip.h * 0.7);

    ctx.save();
    ctx.translate(chip.x + w / 2, chip.y);
    ctx.rotate((-2 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(7, 4, 12, 0.93)';
    ctx.fillRect(-w / 2, -chip.h / 2, w, chip.h);
    ctx.strokeStyle = 'rgba(246, 231, 207, 0.82)';
    ctx.lineWidth = Math.max(1, chip.h * 0.035);
    ctx.strokeRect(-w / 2, -chip.h / 2, w, chip.h);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.14);
    ctx.fillText(label, 0, size * 0.05);
    ctx.restore();
  });
}

function starPath(ctx, cx, cy, outer, inner, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const radius = i % 2 === 0 ? outer : inner;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawReview(ctx, layout) {
  const size = Math.max(8, layout.H * 0.0115);
  const starR = Math.max(5, layout.H * 0.0088);
  const x = layout.review.x;
  const y = layout.review.y;

  ctx.save();
  ctx.fillStyle = GOLD;
  for (let i = 0; i < 5; i += 1) {
    starPath(ctx, x + i * starR * 2.35, y, starR, starR * 0.44);
    ctx.fill();
  }

  const textX = x + starR * 12.4;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `italic 600 ${size}px Georgia, "Times New Roman", serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(246, 231, 207, 0.9)';
  const quote = '\u201cThe coast\u2019s last great night\u201d';
  ctx.fillText(quote, textX, y);
  const quoteW = ctx.measureText(quote).width;

  setFont(ctx, Math.max(7, size * 0.94), '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.12);
  ctx.fillStyle = 'rgba(233, 193, 121, 0.95)';
  ctx.fillText('THE VICE HERALD', textX + quoteW + size * 1.3, y + size * 0.08);
  ctx.restore();
}

function ringText(ctx, text, radius, size, color) {
  const chars = [...text];
  const step = (Math.PI * 2) / chars.length;
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, 0);
  for (let i = 0; i < chars.length; i += 1) {
    const angle = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -radius);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

export function drawSeal(ctx, layout) {
  const { x, y, r } = layout.seal;
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  for (let i = 0; i < 48; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 24;
    const radius = i % 2 === 0 ? r : r * 0.83;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(9, 5, 16, 0.5)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.045);
  ctx.strokeStyle = GOLD;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.022);
  ctx.strokeStyle = 'rgba(233, 193, 121, 0.78)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.47, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.018);
  ctx.strokeStyle = 'rgba(246, 231, 207, 0.6)';
  ctx.stroke();

  ringText(ctx, '\u2022 VICE COVER STUDIO \u2022 LIMITED EDITION \u2022', r * 0.885, r * 0.135, GOLD);
  ringText(ctx, '\u2022 ONE SUMMER ONLY \u2022 NO EXIT \u2022', r * 0.62, r * 0.115, CREAM);

  ctx.fillStyle = GOLD;
  starPath(ctx, 0, -r * 0.06, r * 0.13, r * 0.055);
  ctx.fill();
  ctx.fillStyle = 'rgba(246, 231, 207, 0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, r * 0.16, '"Archivo Black", "Arial Narrow", sans-serif', 400, 0);
  ctx.fillText('VCS', 0, r * 0.2);
  ctx.restore();
}

export function drawBilling(ctx, state, layout) {
  const size = layout.billing.size;
  const grade = String(state.grade || 'sunset').toUpperCase();
  const lines = [
    'VICE COVER STUDIO PRESENTS',
    `A ${grade} PICTURE  \u00b7  CAST: THE DRIVER / THE FIXER / THE LOOKOUT / THE RUNNER`,
    'DIRECTED BY YOU  \u00b7  SHOT ON LOCATION  \u00b7  A VICE HERALD RELEASE',
  ];
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, size * 0.09);
  ctx.fillStyle = 'rgba(246, 231, 207, 0.72)';
  lines.forEach((line, index) => {
    ctx.fillText(line, layout.billing.x, layout.billing.baselines[index]);
  });
  ctx.restore();
}

export function drawBarcode(ctx, layout) {
  const { x, y, w, h } = layout.barcode;
  const pad = Math.max(4, h * 0.11);
  ctx.save();
  ctx.fillStyle = CREAM;
  ctx.fillRect(x - pad, y - pad, w + pad * 2, h + pad * 2.5);

  const random = seeded(0x0ba4c0de);
  let cursor = x;
  while (cursor < x + w - 1.5) {
    const bar = 0.8 + random() * 2.1;
    const gap = 0.7 + random() * 1.6;
    if (random() > 0.24) {
      ctx.fillStyle = INK;
      ctx.fillRect(cursor, y, bar, h);
    }
    cursor += bar + gap;
  }
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, Math.max(5, h * 0.16), '"Archivo Black", "Arial Narrow", sans-serif', 400, h * 0.05);
  ctx.fillText('0 6 1 2 0 2 6', x + w / 2, y + h + pad * 1.45);
  ctx.restore();
}

export function drawReleaseLine(ctx, layout) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, layout.release.size, '"Bebas Neue", "Arial Narrow", sans-serif', 400, layout.release.size * 0.2);
  ctx.fillStyle = 'rgba(246, 231, 207, 0.64)';
  ctx.fillText('IN THEATRES EVERYWHERE  \u00b7  SUMMER 2026', layout.W / 2, layout.release.y);
  ctx.restore();
}
