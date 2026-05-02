import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { ImageObject, ScrapObject, TextObject } from '../types/scrapbook';
import { normalizeRotation, theme, TEXT_LINE_HEIGHT, TEXT_OBJECT_PADDING } from '../constants';
import { applyResize, boxCenter, type ResizeHandle } from '../utils/geometry';
import { imageObjectBoxStyle, imageObjectImgStyle } from '../utils/imageObjectRender';

const HANDLE = 8;
const CONNECTOR_HEIGHT = 28;
/** Y offset (px above box) where dotted connector starts (bottom of rotate handle) */
const CONNECTOR_TOP = CONNECTOR_HEIGHT + HANDLE;
/** Y offset where rotation handle square starts */
const ROTATE_TOP = CONNECTOR_TOP + HANDLE;

type Props = {
  object: ScrapObject;
  selected: boolean;
  toPage: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect: (id: string) => void;
  onGestureStart: () => ScrapObject[];
  onGestureEnd: (before: ScrapObject[]) => void;
  patchSilent: (id: string, patch: Partial<ScrapObject>) => void;
};

function deg(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function ScrapObject({
  object: o,
  selected,
  toPage,
  onSelect,
  onGestureStart,
  onGestureEnd,
  patchSilent: patch,
}: Props) {
  const snapshot = useRef<ScrapObject[] | null>(null);
  const [editing, setEditing] = useState(false);

  const clearInteraction = useCallback(() => {
    if (snapshot.current) {
      onGestureEnd(snapshot.current);
      snapshot.current = null;
    }
  }, [onGestureEnd]);

  useEffect(() => {
    const onWin = (e: PointerEvent) => {
      if (e.type === 'pointercancel') clearInteraction();
    };
    window.addEventListener('pointercancel', onWin);
    return () => window.removeEventListener('pointercancel', onWin);
  }, [clearInteraction]);

  const bindMove = (e: ReactPointerEvent) => {
    if (editing) return;
    e.stopPropagation();
    e.preventDefault();
    snapshot.current = onGestureStart();
    onSelect(o.id);
    const sp = toPage(e.clientX, e.clientY);
    const ox = o.x;
    const oy = o.y;

    const move = (ev: PointerEvent) => {
      const cp = toPage(ev.clientX, ev.clientY);
      patch(o.id, { x: ox + (cp.x - sp.x), y: oy + (cp.y - sp.y) });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      clearInteraction();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const bindRotate = (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    snapshot.current = onGestureStart();
    onSelect(o.id);
    const c = boxCenter(o);
    const m0 = toPage(e.clientX, e.clientY);
    const start = deg(c, m0);
    const base = o.rotation;

    const move = (ev: PointerEvent) => {
      const m1 = toPage(ev.clientX, ev.clientY);
      const cur = deg(c, m1);
      patch(o.id, { rotation: normalizeRotation(base + (cur - start)) });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      clearInteraction();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const bindResize = (handle: ResizeHandle) => (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    snapshot.current = onGestureStart();
    onSelect(o.id);
    const state = { x: o.x, y: o.y, w: o.width, h: o.height };
    const meta = { handle, rotation: o.rotation };
    let last = toPage(e.clientX, e.clientY);

    const move = (ev: PointerEvent) => {
      const p = toPage(ev.clientX, ev.clientY);
      const rdx = p.x - last.x;
      const rdy = p.y - last.y;
      last = p;
      const next = applyResize(
        { x: state.x, y: state.y, width: state.w, height: state.h, rotation: meta.rotation },
        meta.handle,
        rdx,
        rdy,
      );
      state.x = next.x;
      state.y = next.y;
      state.w = next.width;
      state.h = next.height;
      patch(o.id, { x: next.x, y: next.y, width: next.width, height: next.height });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      clearInteraction();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const showChrome = selected;

  const ariaLabel =
    o.type === 'text'
      ? (() => {
          const t = (o as TextObject).text.replace(/\s+/g, ' ').trim();
          const head = t.length > 0 ? t.slice(0, 120) : 'Empty text';
          return `Text object: ${head}. Press Enter or Space to edit.`;
        })()
      : 'Image object';

  const squareHandle = (cursor: string): CSSProperties => ({
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    boxSizing: 'border-box',
    background: '#ffffff',
    border: `1px solid ${theme.primary}`,
    cursor,
    zIndex: 2,
  });

  const w = o.width;
  const h = o.height;

  const content =
    o.type === 'text' ? (
      <TextContent
        o={o}
        editing={editing}
        setEditing={setEditing}
        patchSilent={patch}
        gestureBegin={onGestureStart}
        gestureEnd={onGestureEnd}
      />
    ) : (
      <ImageContent o={o} />
    );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: w,
        height: h,
        transform: `translate(${o.x}px, ${o.y}px) rotate(${o.rotation}deg)`,
        transformOrigin: '0 0',
        zIndex: o.zIndex,
        outline: showChrome ? `1px dashed ${theme.accent}` : 'none',
        outlineOffset: 0,
        boxSizing: 'border-box',
      }}
      onPointerDown={(e) => {
        if (editing) return;
        if ((e.target as HTMLElement).dataset.handle) return;
        bindMove(e);
      }}
      tabIndex={selected ? 0 : -1}
      onKeyDown={(e) => {
        if (!selected || editing || o.type !== 'text') return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditing(true);
        }
      }}
    >
      {content}
      {showChrome && (
        <>
          <div
            data-scrap-chrome="1"
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: -CONNECTOR_TOP,
              width: 0,
              height: CONNECTOR_HEIGHT,
              transform: 'translateX(-50%)',
              borderLeft: `2px dotted ${theme.accent}`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            data-handle="1"
            style={{
              ...squareHandle('nw-resize'),
              left: -HANDLE / 2,
              top: -HANDLE / 2,
            }}
            onPointerDown={bindResize('nw')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('n-resize'), left: w / 2 - HANDLE / 2, top: -HANDLE / 2 }}
            onPointerDown={bindResize('n')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('ne-resize'), left: w - HANDLE / 2, top: -HANDLE / 2 }}
            onPointerDown={bindResize('ne')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('e-resize'), left: w - HANDLE / 2, top: h / 2 - HANDLE / 2 }}
            onPointerDown={bindResize('e')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('se-resize'), left: w - HANDLE / 2, top: h - HANDLE / 2 }}
            onPointerDown={bindResize('se')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('s-resize'), left: w / 2 - HANDLE / 2, top: h - HANDLE / 2 }}
            onPointerDown={bindResize('s')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('sw-resize'), left: -HANDLE / 2, top: h - HANDLE / 2 }}
            onPointerDown={bindResize('sw')}
          />
          <div
            data-handle="1"
            style={{ ...squareHandle('w-resize'), left: -HANDLE / 2, top: h / 2 - HANDLE / 2 }}
            onPointerDown={bindResize('w')}
          />
          <div
            data-handle="1"
            style={{
              ...squareHandle('grab'),
              left: w / 2 - HANDLE / 2,
              top: -ROTATE_TOP,
            }}
            onPointerDown={bindRotate}
          />
        </>
      )}
    </div>
  );
}

function TextContent({
  o,
  editing,
  setEditing,
  patchSilent,
  gestureBegin,
  gestureEnd,
}: {
  o: TextObject;
  editing: boolean;
  setEditing: (v: boolean) => void;
  patchSilent: (id: string, patch: Partial<ScrapObject>) => void;
  gestureBegin: () => ScrapObject[];
  gestureEnd: (before: ScrapObject[]) => void;
}) {
  const ta = useRef<HTMLTextAreaElement | null>(null);
  const editSnap = useRef<ScrapObject[] | null>(null);
  useEffect(() => {
    if (editing && ta.current) {
      ta.current.focus();
      ta.current.select();
    }
  }, [editing]);

  const finishEdit = () => {
    if (editSnap.current) {
      gestureEnd(editSnap.current);
      editSnap.current = null;
    }
    setEditing(false);
  };

  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: TEXT_OBJECT_PADDING,
    boxSizing: 'border-box',
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    fontFamily: o.fontFamily,
    fontSize: o.fontSize,
    fontWeight: o.bold ? 700 : 400,
    fontStyle: o.italic ? 'italic' : 'normal',
    textDecoration: o.underline ? 'underline' : 'none',
    color: o.color,
    lineHeight: TEXT_LINE_HEIGHT,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflow: 'hidden',
  };

  if (editing) {
    return (
      <textarea
        ref={ta}
        data-no-drag="1"
        style={style}
        value={o.text}
        aria-label="Edit text"
        onChange={(e) => patchSilent(o.id, { text: e.target.value })}
        onFocus={() => {
          editSnap.current = gestureBegin();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onBlur={finishEdit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') finishEdit();
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        cursor: 'default',
        pointerEvents: 'auto',
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {o.text || '\u00a0'}
    </div>
  );
}

function ImageContent({ o }: { o: ImageObject }) {
  const src = o.originalSrc ?? o.src;
  return (
    <div style={imageObjectBoxStyle()}>
      <img src={src} alt="" draggable={false} style={imageObjectImgStyle(o)} />
    </div>
  );
}
