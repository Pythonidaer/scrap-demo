import type { CSSProperties } from 'react';
import type { ImageObject } from '../types/scrapbook';

/** Wrapper inside object bounds — editor, PNG/PDF capture, and HTML export must match */
export function imageObjectBoxStyle(): CSSProperties {
  return {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
  };
}

/** img rules — same everywhere to avoid skew between editor and export */
export function imageObjectImgStyle(o: ImageObject): CSSProperties {
  const flip = o.flipHorizontal ? 'scaleX(-1) ' : '';
  return {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    transform: `${flip}scale(${o.cropZoom})`,
    transformOrigin: 'center center',
  };
}

export function imageObjectInnerHtmlEscaped(srcEscaped: string, o: ImageObject): string {
  const flip = o.flipHorizontal ? 'scaleX(-1) ' : '';
  const tf = `${flip}scale(${o.cropZoom})`;
  return `<div class="img-wrap" style="width:100%;height:100%;overflow:hidden;box-sizing:border-box"><img src="${srcEscaped}" alt="" style="width:100%;height:100%;object-fit:contain;object-position:center;display:block;transform:${tf};transform-origin:center center"/></div>`;
}
