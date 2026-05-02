export type CanvasObject = {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export type TextObject = CanvasObject & {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
};

export type ImageObject = CanvasObject & {
  type: 'image';
  /** Legacy / duplicate of originalSrc; always mirror originalSrc for new objects */
  src: string;
  /** Original image data URL (never overwritten) */
  originalSrc: string;
  flipHorizontal: boolean;
  cropZoom: number;
};

export type ScrapObject = TextObject | ImageObject;
