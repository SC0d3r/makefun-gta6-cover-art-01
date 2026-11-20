// Vice Cover Studio - original cover art, drawn by code.
// Palms, the low beachfront skyline and the deterministic film grain. None of this is an
// image file: every mark is a path or a pixel generated here, seeded so two renders match.

/** Small deterministic PRNG (mulberry32) so grain and window lights never flicker. */
export function seeded(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

function tangent(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const x = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const y = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

/**
 * Draws one frond as a tapered spine with a comb of leaflets, the way a palm reads as a
 * silhouette. Coordinates are in the palm's local unit space (height 1, y up is negative).
 */
function frond(ctx, crown, degrees, length, droop, rnd) {
  const a = (degrees * Math.PI) / 180;
  const dir = { x: Math.cos(a), y: Math.sin(a) };
  const tip = {
    x: crown.x + dir.x * length,
    y: crown.y + dir.y * length + droop,
  };
  const c1 = {
    x: crown.x + dir.x * length * 0.38 - dir.y * length * 0.04,
    y: crown.y + dir.y * length * 0.38 + dir.x * length * 0.04 - length * 0.05,
  };
  const c2 = {
    x: crown.x + dir.x * length * 0.78,
    y: crown.y + dir.y * length * 0.78 + droop * 0.35,
  };
  const steps = 16;
  const spine = [];
  for (let i = 0; i <= steps; i += 1) spine.push(bez(crown, c1, c2, tip, i / steps));

  // Tapered spine.
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const p = spine[i];
    const d = tangent(crown, c1, c2, tip, t);
    const w = 0.018 * (1 - t) + 0.003 + 0.006 * Math.sin(t * Math.PI);
    left.push({ x: p.x - d.y * w, y: p.y + d.x * w });
    right.push({ x: p.x + d.y * w, y: p.y - d.x * w });
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i <= steps; i += 1) ctx.lineTo(left[i].x, left[i].y);
  for (let i = steps; i >= 0; i -= 1) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fill();

  // Leaflets, alternating a little in length so the edge is ragged.
  for (let i = 1; i < steps - 1; i += 1) {
    const t = i / steps;
    const p = spine[i];
    const d = tangent(crown, c1, c2, tip, t);
    const n = { x: -d.y, y: d.x };
    const bell = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.06)), 0.7);
    const leaf = length * 0.15 * bell * (0.82 + rnd() * 0.36);
    const reach = leaf * 0.42;
    for (const side of [-1, 1]) {
      const tipX = p.x + n.x * leaf * side + d.x * reach;
      const tipY = p.y + n.y * leaf * side + d.y * reach;
      const base = leaf * 0.2;
      ctx.beginPath();
      ctx.moveTo(p.x + d.x * base, p.y + d.y * base);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(p.x - d.x * base, p.y - d.y * base);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * A palm in local units: base at (0, 0), crown at (lean, -1). Each palm gets eight fronds
 * and a slight curve in the trunk, so a pair never looks like a stamp repeated.
 */
function palm(ctx, x, baseY, height, lean, color, seed) {
  const rnd = seeded(seed);
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(height, height);
  ctx.fillStyle = color;

  const p0 = { x: 0, y: 0.03 };
  const p1 = { x: lean * 0.06 + 0.025, y: -0.42 };
  const p2 = { x: lean * 0.74, y: -0.74 };
  const p3 = { x: lean, y: -1.02 };
  const steps = 18;
  const left = [];
  const right = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const p = bez(p0, p1, p2, p3, t);
    const d = tangent(p0, p1, p2, p3, t);
    const w = 0.011 + 0.043 * (1 - t) + 0.026 * Math.exp(-t * 10);
    left.push({ x: p.x - d.y * w, y: p.y + d.x * w });
    right.push({ x: p.x + d.y * w, y: p.y - d.x * w });
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i <= steps; i += 1) ctx.lineTo(left[i].x, left[i].y);
  for (let i = steps; i >= 0; i -= 1) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fill();

  const crown = { x: p3.x, y: p3.y };
  const angles = [-166, -134, -102, -71, -40, -13, 13, 193];
  for (const deg of angles) {
    const len = 0.36 + rnd() * 0.17;
    const droop = (deg > 0 && deg < 90) || deg > 180 ? 0.06 + rnd() * 0.05 : 0.02 + rnd() * 0.04;
    frond(ctx, crown, deg, len, droop, rnd);
  }

  // A small cluster of coconuts under the crown.
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(crown.x + (rnd() - 0.5) * 0.05, crown.y + 0.035 + rnd() * 0.025, 0.021, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Palm groups per panel: two in the centre, one at the outer edge of each side panel.
 * `index` is the panel number, left to right.
 */
export function drawPalms(ctx, w, h, index, ink) {
  if (index === 0) {
    palm(ctx, w * 0.74, h * 1.03, h * 0.315, -0.2, ink, 0x31a1);
  } else if (index === 2) {
    palm(ctx, w * 0.26, h * 1.03, h * 0.325, 0.22, ink, 0x7c31);
  } else {
    palm(ctx, w * 0.17, h * 1.045, h * 0.335, 0.2, ink, 0x11b7);
    palm(ctx, w * 0.4, h * 1.055, h * 0.415, -0.14, ink, 0x5e11);
  }
}

/**
 * Low beachfront skyline with lit windows and a thin road line, in the centre panel only.
 * Kept to the right half so the palms and the subject keep their air.
 */
export function drawSkyline(ctx, w, h) {
  const rnd = seeded(0x2c0de);
  const baseY = h * 0.958;
  let x = w * 0.5;
  for (let i = 0; i < 7; i += 1) {
    const bw = w * (0.045 + rnd() * 0.035);
    const bh = h * (0.035 + rnd() * 0.075);
    ctx.fillStyle = 'rgba(12,5,19,0.9)';
    ctx.fillRect(x, baseY - bh, bw, bh + 2);
    const cols = Math.max(1, Math.floor(bw / (w * 0.017)));
    const rows = Math.max(1, Math.floor(bh / (h * 0.022)));
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        if (rnd() < 0.52) continue;
        const warm = rnd() > 0.25;
        ctx.fillStyle = warm ? 'rgba(255,194,116,0.85)' : 'rgba(255,96,168,0.8)';
        const ww = Math.max(1, w * 0.0045);
        const wh = Math.max(1, h * 0.0065);
        ctx.fillRect(
          x + w * 0.008 + c * (bw / cols),
          baseY - bh + h * 0.01 + r * (bh / rows),
          ww,
          wh,
        );
      }
    }
    x += bw + w * 0.011;
    if (x > w * 0.94) break;
  }

  // The road, a single quiet horizontal line with two lamps.
  ctx.strokeStyle = 'rgba(246,236,216,0.24)';
  ctx.lineWidth = Math.max(1, h * 0.0018);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.972);
  ctx.lineTo(w, h * 0.972);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,196,120,0.9)';
  for (const px of [0.2, 0.6, 0.86]) {
    ctx.beginPath();
    ctx.arc(w * px, h * 0.972, Math.max(1.2, h * 0.0028), 0, Math.PI * 2);
    ctx.fill();
  }
}

let grainTile = null;

/** A repeatable 2px grain tile, generated once and reused by every render. */
function makeGrain() {
  const tile = document.createElement('canvas');
  tile.width = 256;
  tile.height = 256;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(256, 256);
  const rnd = seeded(0x5eed);
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      const v = 118 + Math.floor(rnd() * 74);
      for (let dy = 0; dy < 2; dy += 1) {
        for (let dx = 0; dx < 2; dx += 1) {
          const i = ((y + dy) * 256 + (x + dx)) * 4;
          data.data[i] = v;
          data.data[i + 1] = v;
          data.data[i + 2] = v;
          data.data[i + 3] = 255;
        }
      }
    }
  }
  tctx.putImageData(data, 0, 0);
  return tile;
}

/** Soft 3.8 percent grain over the whole poster, plus a gentle vignette at the edges. */
export function drawFinish(ctx, w, h) {
  if (!grainTile) grainTile = makeGrain();
  ctx.save();
  ctx.globalAlpha = 0.038;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  ctx.save();
  const g = ctx.createRadialGradient(w * 0.5, h * 0.46, Math.min(w, h) * 0.32, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.62);
  g.addColorStop(0, 'rgba(4,2,8,0)');
  g.addColorStop(0.72, 'rgba(4,2,8,0.12)');
  g.addColorStop(1, 'rgba(4,2,8,0.52)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
