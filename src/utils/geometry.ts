const D2R = Math.PI / 180;

export function rotRad(deg: number): number {
  return deg * D2R;
}

/** Unrotated local X axis (unit) in page space */
export function ux(deg: number): { x: number; y: number } {
  const r = rotRad(deg);
  return { x: Math.cos(r), y: Math.sin(r) };
}

/** Unrotated local Y axis (unit, downward) in page space */
export function uy(deg: number): { x: number; y: number } {
  const r = rotRad(deg);
  return { x: -Math.sin(r), y: Math.cos(r) };
}

export function dot(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return a.x * b.x + a.y * b.y;
}

export function boxCenter(o: { x: number; y: number; width: number; height: number; rotation: number }): {
  x: number;
  y: number;
} {
  const { x, y, width: w, height: h, rotation: deg } = o;
  const u = ux(deg);
  const v = uy(deg);
  const hw = w / 2;
  const hh = h / 2;
  return {
    x: x + hw * u.x + hh * v.x,
    y: y + hw * u.y + hh * v.y,
  };
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function applyResize(
  o: { x: number; y: number; width: number; height: number; rotation: number },
  handle: ResizeHandle,
  dx: number,
  dy: number,
  min = 20,
): { x: number; y: number; width: number; height: number } {
  const u = ux(o.rotation);
  const v = uy(o.rotation);
  const du = dot({ x: dx, y: dy }, u);
  const dv = dot({ x: dx, y: dy }, v);

  let { x, y, width: w, height: h } = o;

  switch (handle) {
    case 'e':
      w = Math.max(min, w + du);
      break;
    case 'w':
      x += du;
      w = Math.max(min, w - du);
      break;
    case 's':
      h = Math.max(min, h + dv);
      break;
    case 'n':
      y += dv;
      h = Math.max(min, h - dv);
      break;
    case 'se':
      w = Math.max(min, w + du);
      h = Math.max(min, h + dv);
      break;
    case 'sw':
      x += du;
      w = Math.max(min, w - du);
      h = Math.max(min, h + dv);
      break;
    case 'ne':
      y += dv;
      h = Math.max(min, h - dv);
      w = Math.max(min, w + du);
      break;
    case 'nw':
      x += du;
      w = Math.max(min, w - du);
      y += dv;
      h = Math.max(min, h - dv);
      break;
    default:
      break;
  }

  return { x, y, width: w, height: h };
}
