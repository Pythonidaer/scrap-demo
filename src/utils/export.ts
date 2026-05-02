import html2canvas from 'html2canvas';
import type { ImageObject, ScrapObject, TextObject } from '../types/scrapbook';
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  TEXT_LINE_HEIGHT,
  TEXT_OBJECT_PADDING,
} from '../constants';
import { imageObjectInnerHtmlEscaped } from './imageObjectRender';

/**
 * Rasterize the page at native layout size, then letterbox onto a fixed 816×1056 canvas
 * with uniform scale (never non-uniform stretch, which skews images).
 */
export async function rasterizePageElement(pageEl: HTMLElement): Promise<HTMLCanvasElement> {
  const raw = await html2canvas(pageEl, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (_doc, cloned) => {
      const node = cloned as HTMLElement;
      node.style.boxShadow = 'none';
      node.style.margin = '0';
      node.style.outline = 'none';
    },
  });

  const targetW = PAGE_WIDTH;
  const targetH = PAGE_HEIGHT;
  const u = Math.min(targetW / raw.width, targetH / raw.height);
  const dw = Math.round(raw.width * u);
  const dh = Math.round(raw.height * u);
  const ox = Math.round((targetW - dw) / 2);
  const oy = Math.round((targetH - dh) / 2);

  const out = document.createElement('canvas');
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext('2d');
  if (!ctx) return raw;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(raw, ox, oy, dw, dh);
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape double quotes for use inside a double-quoted HTML attribute */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function textBlockStyle(o: TextObject): string {
  const deco = o.underline ? 'underline' : 'none';
  const weight = o.bold ? '700' : '400';
  const style = o.italic ? 'italic' : 'normal';
  return [
    'position:absolute',
    'inset:0',
    'margin:0',
    `padding:${TEXT_OBJECT_PADDING}`,
    'box-sizing:border-box',
    `font-family:${o.fontFamily}`,
    `font-size:${o.fontSize}px`,
    `font-weight:${weight}`,
    `font-style:${style}`,
    `text-decoration:${deco}`,
    `color:${o.color}`,
    `line-height:${TEXT_LINE_HEIGHT}`,
    'white-space:pre-wrap',
    'word-break:break-word',
  ].join(';');
}

function objectWrapperStyle(o: ScrapObject): string {
  return [
    'position:absolute',
    `left:${o.x}px`,
    `top:${o.y}px`,
    `width:${o.width}px`,
    `height:${o.height}px`,
    `transform:rotate(${o.rotation}deg)`,
    `transform-origin:0 0`,
    `z-index:${o.zIndex}`,
    'box-sizing:border-box',
  ].join(';');
}

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Comic+Neue:wght@400;700&family=Dancing+Script:wght@600&family=Inter:wght@400;600;700&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap';

/** Light forest green surround (reference used blue-gray) */
export const HTML_EXPORT_CHROME_BG = '#c7d6cd';

export function buildStandaloneHtml(objects: ScrapObject[]): string {
  const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);
  const parts = sorted.map((o) => {
    const wrap = objectWrapperStyle(o);
    if (o.type === 'text') {
      const t = o as TextObject;
      const inner = escapeHtml(t.text).replace(/\n/g, '<br/>');
      const tStyle = escapeAttr(textBlockStyle(t));
      return `<div class="el" style="${escapeAttr(wrap)}"><div class="t" style="${tStyle}">${inner}</div></div>`;
    }
    const i = o as ImageObject;
    const src = escapeHtml(i.originalSrc ?? i.src);
    return `<div class="el" style="${escapeAttr(wrap)}">${imageObjectInnerHtmlEscaped(src, i)}</div>`;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Scrap Demo Export</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${GOOGLE_FONTS_HREF}" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: ${HTML_EXPORT_CHROME_BG};
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 24px;
  }
  .page {
    position: relative;
    width: ${PAGE_WIDTH}px;
    height: ${PAGE_HEIGHT}px;
    background: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,.35);
  }
</style>
</head>
<body>
  <div class="page">
    ${parts.join('\n    ')}
  </div>
</body>
</html>`;
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPngFromCanvas(canvas: HTMLCanvasElement, filename: string) {
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('PNG export failed'));
          return;
        }
        downloadBlob(filename, b);
        resolve();
      },
      'image/png',
      1,
    );
  });
}

export async function downloadPdfFromCanvas(canvas: HTMLCanvasElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_WIDTH, PAGE_HEIGHT] });
  pdf.addImage(imgData, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  pdf.save(filename);
}
