// Vice Cover Studio - the cover renderer, build 3.
// One proportional layout serves the editor preview and every export size. The art is a
// three-panel key-art sheet: the photo is cropped differently in each panel, graded with a
// single sunset light, then finished like a printed one-sheet - a two-layer title lockup over
// the panel seams, cast chips, a pull quote, a starburst seal, a cream footer band, a billing
// block, a barcode, halftone and grain. All lettering and shapes are drawn with fonts already
// on the machine; no font file, logo or official artwork is loaded.

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
    filter: 'saturate(1.08) contrast(1.2) brightness(0.88) sepia(0.16)',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    swatch: 'linear-gradient(135deg, #ff3d9a, #36e0ff)',
    filter: 'saturate(1.26) contrast(1.16) brightness(0.93)',
  },
  dusk: {
    id: 'dusk',
    label: 'Dusk',
    swatch: 'linear-gradient(135deg, #1f7886, #f0a35e)',
    filter: 'saturate(1.1) contrast(1.12) brightness(0.94)',
  },
};

export const GRADE_ORDER = ['sunset', 'neon', 'dusk'];

export const PANEL_LABELS = ['LEFT', 'CENTRE', 'RIGHT'];

/** The three roles printed on the cast chips, left to right. */
export const CAST_ROLES = ['THE DRIVER', 'THE FIXER', 'THE LOOKOUT'];

export const CREAM = '#f4e7d2';
const CREAM_HI = '#fff8ea';
const INK = '#090510';
const PINK = '#ff3d8d';
const MAGENTA = '#bf115c';
const GOLD = '#e9c179';
const TITLE_STACK = '"Liberation Sans Narrow", "Nimbus Sans Narrow", "DejaVu Sans Condensed", Impact, Haettenschweiler, "Arial Narrow", sans-serif';
const UI_STACK = '"Helvetica Neue", "Segoe UI", Roboto, Arial, "Liberation Sans", sans-serif';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The whole poster geometry, derived from the pixel size alone. */
function layoutFor(W, H) {
  const ratio = W / H;
  const wide = ratio > 1.25;
  const portrait = ratio < 0.9;
  const mode = wide ? 'wide' : portrait ? 'portrait' : 'square';

  const marginX = W * (wide ? 0.034 : 0.036);
  const gutter = W * (wide ? 0.012 : 0.013);
  const panelTop = H * (wide ? 0.032 : portrait ? 0.031 : 0.028);
  const panelBottom = H * (wide ? 0.585 : portrait ? 0.63 : 0.593);
  const sideBottom = H * (portrait ? 0.578 : panelBottom / H);

  let panels;
  if (portrait) {
    const centreW = W * 0.42;
    const sideW = (W - marginX * 2 - gutter * 2 - centreW) / 2;
    panels = [
      { x: marginX, y: panelTop, w: sideW, h: sideBottom - panelTop },
      { x: marginX + sideW + gutter, y: panelTop, w: centreW, h: panelBottom - panelTop },
      { x: marginX + sideW + gutter + centreW + gutter, y: panelTop, w: sideW, h: sideBottom - panelTop },
    ];
  } else {
    const panelW = (W - marginX * 2 - gutter * 2) / 3;
    panels = [0, 1, 2].map((index) => ({
      x: marginX + index * (panelW + gutter),
      y: panelTop,
      w: panelW,
      h: panelBottom - panelTop,
    }));
  }

  const panelH = panels[1].h;
  const titleBaseline = panelBottom + H * (wide ? 0.048 : portrait ? -0.03 : -0.028);
  const titleZoneTop = panelBottom - panelH * (portrait ? 0.34 : 0.3);
  const kickerBaseline = panelBottom + H * (wide ? 0.098 : portrait ? 0.03 : 0.022);

  const footerTop = H * (wide ? 0.765 : portrait ? 0.76 : 0.735);
  const footerH = H * (wide ? 0.06 : portrait ? 0.054 : 0.059);

  const barcodeW = W * (wide ? 0.088 : 0.088);
  const barcodeH = H * (wide ? 0.055 : portrait ? 0.05 : 0.055);

  return {
    W,
    H,
    mode,
    marginX,
    gutter,
    border: clamp(W * 0.0045, 3, 9),
    panels,
    panelBottom,
    title: {
      baseline: titleBaseline,
      zoneTop: titleZoneTop,
      maxWidth: W - marginX * 2 - W * 0.024,
      maxSize: H * (wide ? 0.27 : portrait ? 0.2 : 0.245),
    },
    kicker: {
      baseline: kickerBaseline,
      size: clamp(W * 0.0145, 12, 26),
    },
    quote: {
      baseline: panelBottom + H * (wide ? 0.152 : portrait ? 0.075 : 0.066),
      size: clamp(W * 0.0105, 10, 17),
    },
    seal: {
      x: W - marginX - W * 0.031 - 8,
      y: panelTop + W * 0.031 + 10,
      r: W * 0.031,
    },
    footer: { x: 0, y: footerTop, w: W, h: footerH },
    billing: {
      y: footerTop + footerH + H * (wide ? 0.022 : 0.021),
      gap: H * (wide ? 0.021 : 0.02),
      size: clamp(W * 0.0082, 8, 14),
    },
    barcode: {
      x: W - marginX - barcodeW,
      y: footerTop + footerH + H * (wide ? 0.014 : 0.017),
      w: barcodeW,
      h: barcodeH,
    },
    studio: {
      size: clamp(W * 0.0085, 8, 14),
      baseline: H * 0.968,
    },
  };
}

function drawBackdrop(ctx, W, H) {
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#1b0d27');
  base.addColorStop(0.52, '#0d0715');
  base.addColorStop(1, '#060309');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const plum = ctx.createRadialGradient(W * 0.12, H * 0.04, 0, W * 0.12, H * 0.04, Math.max(W, H) * 0.6);
  plum.addColorStop(0, 'rgba(103, 30, 116, 0.42)');
  plum.addColorStop(0.55, 'rgba(58, 18, 72, 0.14)');
  plum.addColorStop(1, 'rgba(58, 18, 72, 0)');
  ctx.fillStyle = plum;
  ctx.fillRect(0, 0, W, H);

  const teal = ctx.createRadialGradient(W * 0.94, H * 0.12, 0, W * 0.94, H * 0.12, Math.max(W, H) * 0.45);
  teal.addColorStop(0, 'rgba(18, 102, 108, 0.2)');
  teal.addColorStop(1, 'rgba(18, 94, 101, 0)');
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, W, H);

  const rose = ctx.createRadialGradient(W * 0.52, H * 0.9, 0, W * 0.52, H * 0.9, W * 0.48);
  rose.addColorStop(0, 'rgba(128, 26, 72, 0.22)');
  rose.addColorStop(1, 'rgba(112, 24, 66, 0)');
  ctx.fillStyle = rose;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawPanelFrame(ctx, rect, W) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.62)';
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
  const iw = image ? image.naturalWidth || image.width : 0;
  const ih = image ? image.naturalHeight || image.height : 0;
  if (!iw || !ih) {
    const fallback = ctx.createLinearGradient(inner.x, inner.y, inner.x, inner.y + inner.h);
    fallback.addColorStop(0, '#8c4157');
    fallback.addColorStop(0.45, '#d07a56');
    fallback.addColorStop(0.7, '#24515e');
    fallback.addColorStop(1, '#0b1018');
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

/** Warm amber highlights, teal/violet shadows, one light from the upper left. */
function paintGrade(ctx, inner, grade) {
  const { x, y, w, h } = inner;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (grade === 'neon') {
    const magenta = ctx.createLinearGradient(x, y, x + w, y);
    magenta.addColorStop(0, 'rgba(255, 24, 146, 0.42)');
    magenta.addColorStop(0.52, 'rgba(255, 24, 146, 0.06)');
    magenta.addColorStop(1, 'rgba(255, 24, 146, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = magenta;
    ctx.fillRect(x, y, w, h);

    const cyan = ctx.createLinearGradient(x + w, y, x, y);
    cyan.addColorStop(0, 'rgba(0, 219, 255, 0.36)');
    cyan.addColorStop(0.5, 'rgba(0, 219, 255, 0.05)');
    cyan.addColorStop(1, 'rgba(0, 219, 255, 0)');
    ctx.fillStyle = cyan;
    ctx.fillRect(x, y, w, h);

    const violet = ctx.createLinearGradient(0, y, 0, y + h);
    violet.addColorStop(0, 'rgba(255, 120, 210, 0.1)');
    violet.addColorStop(0.48, 'rgba(62, 29, 108, 0.1)');
    violet.addColorStop(1, 'rgba(24, 12, 62, 0.46)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = violet;
    ctx.fillRect(x, y, w, h);

    const crush = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
    crush.addColorStop(0, 'rgba(4, 2, 10, 0)');
    crush.addColorStop(1, 'rgba(4, 2, 10, 0.34)');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = crush;
    ctx.fillRect(x, y, w, h);
  } else if (grade === 'dusk') {
    const amber = ctx.createLinearGradient(0, y, 0, y + h * 0.62);
    amber.addColorStop(0, 'rgba(255, 178, 99, 0.3)');
    amber.addColorStop(1, 'rgba(255, 178, 99, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = amber;
    ctx.fillRect(x, y, w, h);

    const teal = ctx.createLinearGradient(0, y + h * 0.28, 0, y + h);
    teal.addColorStop(0, 'rgba(8, 87, 101, 0.02)');
    teal.addColorStop(0.62, 'rgba(8, 87, 101, 0.25)');
    teal.addColorStop(1, 'rgba(7, 48, 72, 0.5)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = teal;
    ctx.fillRect(x, y, w, h);

    const lilac = ctx.createRadialGradient(x + w * 0.78, y + h * 0.22, 0, x + w * 0.78, y + h * 0.22, h * 0.7);
    lilac.addColorStop(0, 'rgba(139, 92, 188, 0.24)');
    lilac.addColorStop(1, 'rgba(129, 86, 176, 0)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = lilac;
    ctx.fillRect(x, y, w, h);

    const crush = ctx.createLinearGradient(0, y + h * 0.58, 0, y + h);
    crush.addColorStop(0, 'rgba(4, 2, 10, 0)');
    crush.addColorStop(1, 'rgba(4, 2, 10, 0.3)');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = crush;
    ctx.fillRect(x, y, w, h);
  } else {
    // A duotone pass first: amber highlights over indigo shadows, even on a midday photo.
    const duo = ctx.createLinearGradient(0, y, 0, y + h);
    duo.addColorStop(0, 'rgba(255, 158, 66, 0.52)');
    duo.addColorStop(0.46, 'rgba(255, 76, 120, 0.26)');
    duo.addColorStop(1, 'rgba(34, 26, 116, 0.56)');
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = duo;
    ctx.fillRect(x, y, w, h);

    const warm = ctx.createLinearGradient(0, y, 0, y + h);
    warm.addColorStop(0, 'rgba(255, 184, 106, 0.42)');
    warm.addColorStop(0.48, 'rgba(255, 116, 84, 0.1)');
    warm.addColorStop(1, 'rgba(48, 22, 92, 0.48)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = warm;
    ctx.fillRect(x, y, w, h);

    const flare = ctx.createRadialGradient(x + w * 0.18, y - h * 0.1, 0, x + w * 0.18, y - h * 0.1, h * 1.02);
    flare.addColorStop(0, 'rgba(255, 216, 154, 0.42)');
    flare.addColorStop(0.48, 'rgba(255, 164, 99, 0.12)');
    flare.addColorStop(1, 'rgba(255, 150, 90, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = flare;
    ctx.fillRect(x, y, w, h);

    const teal = ctx.createLinearGradient(0, y + h * 0.38, 0, y + h);
    teal.addColorStop(0, 'rgba(4, 86, 99, 0)');
    teal.addColorStop(0.68, 'rgba(4, 86, 99, 0.24)');
    teal.addColorStop(1, 'rgba(5, 44, 82, 0.46)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = teal;
    ctx.fillRect(x, y, w, h);

    const violet = ctx.createLinearGradient(0, y + h * 0.32, 0, y + h);
    violet.addColorStop(0, 'rgba(70, 30, 120, 0)');
    violet.addColorStop(0.62, 'rgba(60, 22, 100, 0.2)');
    violet.addColorStop(1, 'rgba(36, 10, 70, 0.48)');
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = violet;
    ctx.fillRect(x, y, w, h);

    const glow = ctx.createLinearGradient(0, y, 0, y + h * 0.6);
    glow.addColorStop(0, 'rgba(255, 178, 92, 0.2)');
    glow.addColorStop(1, 'rgba(255, 178, 92, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);

    const crush = ctx.createLinearGradient(0, y + h * 0.52, 0, y + h);
    crush.addColorStop(0, 'rgba(4, 2, 10, 0)');
    crush.addColorStop(1, 'rgba(4, 2, 10, 0.44)');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = crush;
    ctx.fillRect(x, y, w, h);
  }

  const shade = ctx.createLinearGradient(0, y + h * 0.52, 0, y + h);
  shade.addColorStop(0, 'rgba(6, 3, 12, 0)');
  shade.addColorStop(1, 'rgba(6, 3, 12, 0.22)');
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);

  const vignette = ctx.createRadialGradient(x + w / 2, y + h * 0.44, Math.min(w, h) * 0.2, x + w / 2, y + h * 0.5, Math.hypot(w, h) * 0.62);
  vignette.addColorStop(0, 'rgba(5, 2, 10, 0)');
  vignette.addColorStop(0.74, 'rgba(5, 2, 10, 0.06)');
  vignette.addColorStop(1, 'rgba(5, 2, 10, 0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function drawPanel(ctx, panelState, rect, layout, photos, dimmed) {
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
  const grade = GRADES[panelState?.grade] ? panelState.grade : 'sunset';
  ctx.save();
  ctx.filter = (GRADES[grade] || GRADES.sunset).filter;
  paintPhoto(ctx, image, inner, panelState || {});
  ctx.restore();
  paintGrade(ctx, inner, (GRADES[grade] || GRADES.sunset).id);

  if (dimmed) {
    ctx.fillStyle = 'rgba(4, 2, 9, 0.15)';
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  }
  ctx.restore();

  const edge = Math.max(1, layout.W * 0.001);
  ctx.strokeStyle = 'rgba(7, 3, 11, 0.6)';
  ctx.lineWidth = edge;
  ctx.strokeRect(inner.x - edge / 2, inner.y - edge / 2, inner.w + edge, inner.h + edge);
}

function setTitleFont(ctx, size) {
  ctx.font = `900 ${size}px ${TITLE_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${-size * 0.018}px`;
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
  const available = layout.title.baseline - layout.title.zoneTop;
  const heightFit = available / (capRatio + gapRatio * (lines.length - 1));

  return Math.max(8, Math.min(widthFit, heightFit, layout.title.maxSize));
}

function drawTitle(ctx, state, layout) {
  const lines = titleLines(state.title);
  if (!lines.length) return;
  const size = fitTitle(ctx, lines, layout);
  const cx = layout.W / 2;
  const lineGap = size * 0.79;
  const offset = Math.max(2, size * 0.034);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  setTitleFont(ctx, size);

  // Hard offset layer first: a deep magenta block that reads as printed mis-registration.
  ctx.fillStyle = MAGENTA;
  for (let index = 0; index < lines.length; index += 1) {
    const y = layout.title.baseline - (lines.length - 1 - index) * lineGap;
    ctx.fillText(lines[index], cx + offset, y + offset);
  }

  // A dark keyline keeps the cream fill legible over a bright sky.
  ctx.strokeStyle = 'rgba(9, 5, 16, 0.9)';
  ctx.lineWidth = Math.max(1.5, size * 0.011);
  for (let index = 0; index < lines.length; index += 1) {
    const y = layout.title.baseline - (lines.length - 1 - index) * lineGap;
    ctx.strokeText(lines[index], cx, y);
  }

  ctx.fillStyle = CREAM_HI;
  for (let index = 0; index < lines.length; index += 1) {
    const y = layout.title.baseline - (lines.length - 1 - index) * lineGap;
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
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.16}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  let drawn = size;
  const maxWidth = layout.W - layout.marginX * 2 - size * 5;
  let width = ctx.measureText(text).width;
  if (width > maxWidth) {
    drawn = Math.max(10, size * (maxWidth / width));
    ctx.font = `800 ${drawn}px ${UI_STACK}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${drawn * 0.16}px`;
    width = ctx.measureText(text).width;
  }

  const ruleW = drawn * 1.8;
  const gap = drawn * 1.15;
  const ruleH = Math.max(1.5, drawn * 0.06);
  const ruleY = y - drawn * 0.34;
  ctx.fillStyle = 'rgba(233, 193, 121, 0.85)';
  ctx.fillRect(cx - width / 2 - gap - ruleW, ruleY, ruleW, ruleH);
  ctx.fillRect(cx + width / 2 + gap, ruleY, ruleW, ruleH);

  ctx.fillStyle = CREAM;
  ctx.fillText(text, cx, y);
  ctx.restore();
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

function drawQuote(ctx, layout) {
  const size = layout.quote.size;
  const cx = layout.W / 2;
  const y = layout.quote.baseline;
  const star = size * 0.62;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = GOLD;
  for (let i = 0; i < 5; i += 1) {
    starPath(ctx, cx + (i - 2) * star * 2.5, y - size * 1.55, star, star * 0.44, 5);
    ctx.fill();
  }

  ctx.font = `700 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.08}px`;
  ctx.fillStyle = 'rgba(244, 231, 210, 0.9)';
  ctx.fillText('\u201cTHE COAST\u2019S LAST GREAT NIGHT\u201d', cx, y);

  ctx.font = `800 ${Math.max(7, size * 0.78)}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.16}px`;
  ctx.fillStyle = 'rgba(233, 193, 121, 0.92)';
  ctx.fillText('\u2014 THE VICE HERALD', cx, y + size * 1.5);
  ctx.restore();
}

function drawSeal(ctx, layout) {
  const { x, y, r } = layout.seal;
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  for (let i = 0; i < 24; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 12;
    const radius = i % 2 === 0 ? r : r * 0.79;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, r * 0.055);
  ctx.strokeStyle = 'rgba(9, 5, 16, 0.9)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(9, 5, 16, 0.94)';
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.045);
  ctx.strokeStyle = CREAM;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.font = `800 ${r * 0.205}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${r * 0.02}px`;
  ctx.fillText('ORIGINAL', 0, -r * 0.11);
  ctx.fillText('COVER', 0, r * 0.19);

  ctx.fillStyle = GOLD;
  starPath(ctx, 0, -r * 0.4, r * 0.07, r * 0.03, 5);
  ctx.fill();
  ctx.restore();
}

function drawCastTags(ctx, layout) {
  const size = clamp(layout.W * 0.0082, 8, 15);
  for (let index = 0; index < layout.panels.length; index += 1) {
    const rect = layout.panels[index];
    const label = CAST_ROLES[index];
    ctx.save();
    ctx.font = `800 ${size}px ${UI_STACK}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.14}px`;
    const textW = ctx.measureText(label).width;
    const padX = size * 0.95;
    const padY = size * 0.62;
    const w = textW + padX * 2;
    const h = size + padY * 2;
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h - rect.h * 0.33;
    const tilt = (index === 1 ? 2.4 : -3.2) * (Math.PI / 180);

    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(7, 4, 12, 0.93)';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = 'rgba(244, 231, 210, 0.9)';
    ctx.lineWidth = Math.max(1, size * 0.075);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, size * 0.04);
    ctx.restore();
  }
}

function drawFooter(ctx, state, layout) {
  const { y, h, w } = layout.footer;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, y, w, h);

  const rule = Math.max(1, h * 0.035);
  ctx.fillStyle = INK;
  ctx.fillRect(0, y, w, rule);
  ctx.fillRect(0, y + h - rule, w, rule);

  const base = String(state.kicker || '').toUpperCase().trim();
  const text = base.endsWith('NO EXIT.') ? base : `${base}${base ? ' ' : ''}NO EXIT.`;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = h * 0.5;
  ctx.font = `900 ${size}px ${TITLE_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.06}px`;
  const maxWidth = w - layout.marginX * 2;
  const width = ctx.measureText(text).width;
  if (width > maxWidth) {
    size *= maxWidth / width;
    ctx.font = `900 ${size}px ${TITLE_STACK}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.06}px`;
  }
  ctx.fillStyle = INK;
  ctx.fillText(text, w / 2, y + h * 0.54);
  ctx.restore();
}

function drawBilling(ctx, state, layout) {
  const { size } = layout.billing;
  const grade = (GRADES[state.grade] || GRADES.sunset).label.toUpperCase();
  const lines = [
    'VICE COVER STUDIO PRESENTS  \u00b7  STARRING THE DRIVER / THE FIXER / THE LOOKOUT',
    `DIRECTED BY YOU  \u00b7  SHOT ON LOCATION  \u00b7  GRADED IN ${grade}  \u00b7  A VICE HERALD RELEASE`,
  ];
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.09}px`;
  ctx.fillStyle = 'rgba(244, 231, 210, 0.7)';
  for (let index = 0; index < lines.length; index += 1) {
    ctx.fillText(lines[index], layout.W / 2, layout.billing.y + index * layout.billing.gap);
  }
  ctx.restore();
}

function drawBarcode(ctx, layout) {
  const { x, y, w, h } = layout.barcode;
  const pad = Math.max(3, h * 0.09);
  ctx.save();
  ctx.fillStyle = CREAM;
  ctx.fillRect(x - pad, y - pad, w + pad * 2, h + pad * 2.6);

  const random = seeded(0x0ba4c0de);
  let cursor = x;
  while (cursor < x + w - 1.5) {
    const bar = 0.7 + random() * 2.2;
    const gap = 0.7 + random() * 1.7;
    if (random() > 0.28) {
      ctx.fillStyle = INK;
      ctx.fillRect(cursor, y, bar, h * 0.8);
    }
    cursor += bar + gap;
  }
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.max(5, h * 0.13)}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${h * 0.03}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('0 6 1 2 0 2 6', x + w / 2, y + h + pad * 0.9);
  ctx.restore();
}

function drawStudioLine(ctx, layout) {
  const size = layout.studio.size;
  ctx.save();
  ctx.font = `700 ${size}px ${UI_STACK}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.14}px`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(244, 231, 210, 0.66)';
  ctx.fillText('A MAKE.FUN ORIGINAL', layout.marginX, layout.studio.baseline);
  ctx.restore();
}

let grainTile = null;
let halftoneTile = null;

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

function makeHalftone() {
  const tile = document.createElement('canvas');
  tile.width = 7;
  tile.height = 7;
  const tctx = tile.getContext('2d');
  tctx.fillStyle = 'rgba(255, 250, 240, 0.62)';
  tctx.beginPath();
  tctx.arc(3.5, 3.5, 0.95, 0, Math.PI * 2);
  tctx.fill();
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
  vignette.addColorStop(1, 'rgba(4, 2, 8, 0.44)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  if (!halftoneTile) halftoneTile = makeHalftone();
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(halftoneTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  if (!grainTile) grainTile = makeGrain();
  ctx.save();
  ctx.globalAlpha = 0.034;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** A cinematic fade under the lockup so cream type reads over any photo. */
function drawTitleScrim(ctx, layout) {
  const top = layout.title.zoneTop - layout.H * 0.05;
  const bottom = layout.panelBottom + layout.H * 0.045;
  const scrim = ctx.createLinearGradient(0, top, 0, bottom);
  scrim.addColorStop(0, 'rgba(6, 3, 12, 0)');
  scrim.addColorStop(0.55, 'rgba(6, 3, 12, 0.34)');
  scrim.addColorStop(1, 'rgba(6, 3, 12, 0.78)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, top, layout.W, bottom - top);
}

function drawSelection(ctx, rect, W, showHandles) {
  const inset = Math.max(1, W * 0.0012);
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 231, 210, 0.95)';
  ctx.lineWidth = Math.max(1, W * 0.0013);
  ctx.strokeRect(rect.x + inset, rect.y + inset, rect.w - inset * 2, rect.h - inset * 2);

  if (showHandles) {
    const r = Math.max(2.4, W * 0.0032);
    const corners = [
      [rect.x, rect.y],
      [rect.x + rect.w, rect.y],
      [rect.x, rect.y + rect.h],
      [rect.x + rect.w, rect.y + rect.h],
    ];
    for (const [x, y] of corners) {
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
 * Draws the complete poster. `options.selected` adds the editor-only cream selection ring
 * around one panel, `options.showHandles` adds its four hover dots, and `state.extras`
 * toggles the cast tags, quote, seal, footer band and billing block. The exporter never
 * passes a selection.
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

  drawBackdrop(ctx, W, H);
  const grade = GRADES[state.grade] ? state.grade : 'sunset';
  layout.panels.forEach((rect, index) => {
    const panel = state.panels?.[index] || state.panels?.[0] || { zoom: 1, x: 0.5, y: 0.5 };
    drawPanel(
      ctx,
      { ...panel, grade },
      rect,
      layout,
      state.photos || {},
      Number.isInteger(options.selected) && options.selected !== index,
    );
  });

  drawTitleScrim(ctx, layout);
  if (extras) {
    drawCastTags(ctx, layout);
    drawQuote(ctx, layout);
    drawSeal(ctx, layout);
  }
  drawFinish(ctx, W, H);

  drawTitle(ctx, state, layout);
  drawKicker(ctx, state, layout);
  if (extras) {
    drawFooter(ctx, state, layout);
    drawBilling(ctx, state, layout);
    drawBarcode(ctx, layout);
  }
  drawStudioLine(ctx, layout);

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
