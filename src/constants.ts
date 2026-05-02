import type { ScrapObject, TextObject, ImageObject } from './types/scrapbook';

export const PAGE_WIDTH = 816;
export const PAGE_HEIGHT = 1056;

/** Text box inner padding (editor + HTML export) */
export const TEXT_OBJECT_PADDING = '8px 10px';

/** Line height for text objects (editor + HTML export), unitless factor of font-size */
export const TEXT_LINE_HEIGHT = 1.35;

export const theme = {
  primary: '#1f4d3a',
  accent: '#2e7d5b',
  hover: '#3f9d73',
  bg: '#0f2a20',
  text: '#e8f0ec',
  muted: '#9db5aa',
} as const;

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Editorial (serif)', value: '"Playfair Display", Georgia, serif' },
  { label: 'Hand script', value: '"Caveat", "Segoe Script", cursive' },
  { label: 'Marker', value: '"Permanent Marker", "Comic Sans MS", cursive' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: '"Times New Roman", Times, serif' },
  { label: 'Palatino', value: 'Palatino, "Palatino Linotype", serif' },
  { label: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Courier', value: '"Courier New", monospace' },
  { label: 'Comic Sans', value: '"Comic Neue", "Comic Sans MS", cursive' },
];

function uid(): string {
  return crypto.randomUUID();
}

export const DEFAULT_TEXT_OBJECT_ID = 'default-text';

export function createDefaultText(): TextObject {
  return {
    id: DEFAULT_TEXT_OBJECT_ID,
    type: 'text',
    x: 80,
    y: 80,
    width: 640,
    height: 104,
    rotation: 0,
    zIndex: 1,
    text: 'This is a scrap demo for photos, type, and more. Double-click to edit.',
    fontFamily: FONT_OPTIONS[0].value,
    fontSize: 24,
    bold: false,
    italic: false,
    underline: false,
    color: '#0a0a0a',
  };
}

export function createNewText(): TextObject {
  return {
    id: uid(),
    type: 'text',
    x: 120,
    y: 180,
    width: 500,
    height: 100,
    rotation: 0,
    zIndex: Date.now(),
    text: 'New text',
    fontFamily: FONT_OPTIONS[0].value,
    fontSize: 32,
    bold: false,
    italic: false,
    underline: false,
    color: '#0a0a0a',
  };
}

export const IMAGE_UPLOAD_MAX_W = 420;
export const IMAGE_UPLOAD_MAX_H = 520;

export function createImageObjectFromDataUrl(
  dataUrl: string,
  naturalW: number,
  naturalH: number,
): ImageObject {
  const scale = Math.min(IMAGE_UPLOAD_MAX_W / naturalW, IMAGE_UPLOAD_MAX_H / naturalH, 1);
  const width = Math.round(naturalW * scale);
  const height = Math.round(naturalH * scale);
  return {
    id: uid(),
    type: 'image',
    x: 100,
    y: 100,
    width,
    height,
    rotation: 0,
    zIndex: Date.now(),
    src: dataUrl,
    originalSrc: dataUrl,
    flipHorizontal: false,
    cropZoom: 1,
  };
}

export function initialObjects(): ScrapObject[] {
  return [createDefaultText()];
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function normalizeRotation(deg: number): number {
  return clamp(deg, -180, 180);
}
