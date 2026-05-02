import type { CSSProperties } from 'react';
import type { ImageObject } from '../types/scrapbook';

/** Escape for use inside double-quoted HTML attribute values */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/** Safe single-quoted URL fragment for CSS url('…') */
function cssUrlSingleQuoted(src: string): string {
  return `url('${src.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')`;
}

/** Wrapper inside object bounds — editor, PNG/PDF capture, and HTML export must match */
export function imageObjectBoxStyle(): CSSProperties {
  return {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
  };
}

/**
 * Inner paint — background-size:contain matches former img+object-fit behavior.
 * html2canvas often stretches &lt;img object-fit:contain&gt;; backgrounds export correctly.
 */
export function imageObjectPaintStyle(o: ImageObject, src: string): CSSProperties {
  const flip = o.flipHorizontal ? 'scaleX(-1) ' : '';
  return {
    width: '100%',
    height: '100%',
    backgroundImage: cssUrlSingleQuoted(src),
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transform: `${flip}scale(${o.cropZoom})`,
    transformOrigin: 'center center',
  };
}

export function imageObjectInnerHtmlEscaped(src: string, o: ImageObject): string {
  const flip = o.flipHorizontal ? 'scaleX(-1) ' : '';
  const tf = `${flip}scale(${o.cropZoom})`;
  const safe = src.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const paintStyle = [
    'width:100%',
    'height:100%',
    `background-image:url('${safe}')`,
    'background-size:contain',
    'background-position:center',
    'background-repeat:no-repeat',
    `transform:${tf}`,
    'transform-origin:center center',
  ].join(';');
  const wrapStyle = 'width:100%;height:100%;overflow:hidden;box-sizing:border-box';
  return `<div class="img-wrap" style="${escapeAttr(wrapStyle)}"><div style="${escapeAttr(paintStyle)}"></div></div>`;
}
