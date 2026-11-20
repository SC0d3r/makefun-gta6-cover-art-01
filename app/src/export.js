// Vice Cover Studio - PNG export.
// The exporter draws a fresh native-resolution canvas with the same renderer as the
// preview, turns it into a PNG blob and saves it from the page. Nothing is uploaded.

import { FORMATS, renderExport } from './render.js';

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function exportPng(state, formatId) {
  const format = FORMATS[formatId] || FORMATS.wide;
  const started = performance.now();
  const canvas = renderExport(state, format.id);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The browser could not encode the PNG.');
  const elapsed = Math.max(1, Math.round(performance.now() - started));
  saveBlob(blob, format.file);
  return {
    name: format.file,
    bytes: blob.size,
    ms: elapsed,
    width: format.width,
    height: format.height,
  };
}
